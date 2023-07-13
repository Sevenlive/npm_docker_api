import { Container, NPMVHostConfig, NPMVHostConfigs, NpmUser } from "./interfaces";
import dayjs from "dayjs";
import { axiosGET, axiosPOST } from "./helpers";
import { FORCE_SSL, NPM_HOST, user } from ".";

export async function checkCredentials(user: NpmUser, username: string, password: string) {
    if (!user || shouldRefreshToken(user)) {
        user = await refreshUserToken(username, password);
    }
    return user;
}

function shouldRefreshToken(user: NpmUser) {
    const expireTime = dayjs(user.expires);
    const now = dayjs();
    return expireTime.diff(now, 'hour') < 1;
}

async function refreshUserToken(username: string, password: string) {
    return axiosPOST(NPM_HOST + "/api/tokens", { identity: username, secret: password });
}

export async function assignNPMIDToContainers(containers: Container[], user : NpmUser ): Promise<Container[]> {

    const NPMProxyConfig = await axiosGET(NPM_HOST + "/api/nginx/proxy-hosts", {
        Accept: "application/json",
        Authorization: "Bearer " + user.token,
    });
    return containers.map((container) => {
        const matchingProxy = NPMProxyConfig.find((proxy: NPMVHostConfig) => proxy.domain_names.includes(container.VHOST));
        if (matchingProxy) {
            container.NPMID = matchingProxy.id;
        }
        return container;
    });
}


export async function handleCertificate(container: Container, VHost: any): Promise<any> {
    if (container.LETSENCRYPT_HOST) {
      const certificate = await getCertificate(container.LETSENCRYPT_HOST);
  
      if (certificate) {
        VHost.certificate_id = certificate.id;
        console.log(`Found certificate for ${container.LETSENCRYPT_HOST}`);
      } else if (container.LETSENCRYPT_EMAIL) {
        VHost.meta.letsencrypt_email = container.LETSENCRYPT_EMAIL;
        VHost.meta.letsencrypt_agree = true;
        VHost.certificate_id = "new";
        console.log(`No certificate found for ${container.LETSENCRYPT_HOST} - creating new certificate`);
      } else {
        console.log(`No certificate found for ${container.LETSENCRYPT_HOST}`);
        console.log(`No email found for ${container.VHOST}`);
        console.log(`Skipping ${container.VHOST}`);
        return;
      }
  
      VHost.ssl_forced = FORCE_SSL;
    }
    return VHost;
  }

  
async function getCertificate(certificate_name: string) {
    var certificates = await axiosGET(NPM_HOST + "/api/nginx/certificates", { Accept: "application/json", Authorization: "Bearer " + user.token });
    return certificates.filter((element: { nice_name: string; }) => element.nice_name === certificate_name)[0];
}