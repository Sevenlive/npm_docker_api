import Docker from 'dockerode';
var socket = new Docker({ socketPath: '/var/run/docker.sock' });
import { sleep, axiosPOST, axiosGET, axiosPUT, convertMsToSeconds, containsWordinArray } from './helpers';
import { checkCredentials, assignNPMIDToContainers, handleCertificate } from './npm';
//import { getContainers } from './docker';
import { Container, Containers, NPMVHostConfig, NpmUser } from './interfaces';
import { getContainers } from './docker';
import consoleStamp from 'console-stamp';
consoleStamp(console, {
    format: ':date(yyyy/mm/dd HH:MM:ss.l)',
  });

export let user: NpmUser;

export const FORCE_SSL = process.env.FORCE_SSL || true;
const NPM_USER = process.env.NPM_USER;
const NPM_PASSWORD = process.env.NPM_PASSWORD;
export const NPM_HOST = process.env.NPM_HOST;
export const NPM_NETWORK = process.env.NPM_NETWORK || null;
const TIMEOUT = process.env.TIMEOUT || "60000";
const NPM_VHOST_CONFIG = { "domain_names": [null], "forward_scheme": "http", "forward_host": null, "forward_port": null, "block_exploits": true, "access_list_id": "0", "certificate_id": 0, "meta": { "letsencrypt_agree": false, "dns_challenge": false }, "advanced_config": "", "locations": [], "caching_enabled": false, "allow_websocket_upgrade": true, "http2_support": true, "hsts_enabled": true, "hsts_subdomains": false, "ssl_forced": true };


async function main(): Promise<void> {
    const timeout = Number(TIMEOUT);
    if(NPM_HOST === undefined) {
        throw new Error("NPM_HOST is undefined");
    }    
    if(NPM_USER === undefined || NPM_PASSWORD === undefined) {
        throw new Error("NPM_USER or NPM_PASSWORD is undefined");
    }
    while (true) {   
        user = await checkCredentials(user, NPM_USER, NPM_PASSWORD);
        let containers = await getContainers(socket);
        containers = await assignNPMIDToContainers(containers, user);
        for (const container of containers) {
            if (container.NPMID) {
                console.log(`Updating NPM VHOST for ${container.VHOST}`);
                await updateNPMVHOST(container);
            } else {
                console.log(`Creating NPM VHOST for ${container.VHOST}`);
                await createNPMVHOST(container);
            }
        }
        console.log(`Sleep for ${convertMsToSeconds(timeout).toString()} Seconds...`);
        await sleep(timeout);
    }
}
main().catch(console.error);



async function updateNPMVHOST(container: Container): Promise<void> {
    const NPMID = container.NPMID;
    let NPMVHOST = await axiosGET(NPM_HOST + "/api/nginx/proxy-hosts/" + NPMID, {
      Accept: "application/json",
      Authorization: "Bearer " + user.token,
    });
    if(NPMVHOST.forward_host == container.IP && NPMVHOST.forward_port == container.PORT) {
        console.log(`Container: ${container.NAME} | Host: ${container.VHOST} - already up to date`);
        return;
    }
    NPMVHOST.forward_host = container.IP;
    NPMVHOST.forward_port = container.PORT;
    delete NPMVHOST.id;
    delete NPMVHOST.created_on;
    delete NPMVHOST.modified_on;
    delete NPMVHOST.owner_user_id;
    delete NPMVHOST.meta.nginx_online;
    delete NPMVHOST.meta.nginx_err;
  
    NPMVHOST = await handleCertificate(container, NPMVHOST);
  
    const res = await axiosPUT(
      NPM_HOST + "/api/nginx/proxy-hosts/" + NPMID,
      NPMVHOST,
      {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
      }
    );
  
    console.log(`Container: ${container.NAME} | Host: ${container.VHOST} - updated`);
    await sleep(2000);
  }


async function createNPMVHOST(container: Container): Promise<void> {
    let VHost: NPMVHostConfig = NPM_VHOST_CONFIG;
    VHost.domain_names = [container.VHOST];
    VHost.forward_host = container.IP;
    VHost.forward_port = container.PORT;
    VHost = await handleCertificate(container, VHost);

    const res = await axiosPOST(NPM_HOST + "/api/nginx/proxy-hosts/", VHost, {
        Accept: "application/json",
        Authorization: `Bearer ${user.token}`,
    });

    await sleep(2000);
    console.log(`Host: ${container.VHOST} - created`);
}

