import { Container, Containers } from "./interfaces";
import { NPM_NETWORK } from "./index";
import Dockerode from "dockerode";
import { containsWordinArray } from "./helpers";

export async function getContainers(socket: Dockerode): Promise<Containers> {
    const Containers: Containers = [];

    let Network: string;
    if (typeof NPM_NETWORK !== "string" || NPM_NETWORK === "") {
        throw new Error("NPM_NETWORK is undefined");
    }
    else{
        Network = NPM_NETWORK;
    }
    const containerInfos = (await socket.listContainers()).filter(obj => obj.NetworkSettings.Networks.hasOwnProperty(Network));

    for (const containerInfo of containerInfos) {
        const ContainerInspectInfo = await socket.getContainer(containerInfo.Id).inspect();
        const ContainerENV = ContainerInspectInfo.Config.Env;
        const ENV_VIRTUAL_HOST = containsWordinArray(ContainerENV, "VIRTUAL_HOST");

        if (ENV_VIRTUAL_HOST) {
            let container: Container = {
                NPMID: null,
                VHOST: '',
                IP: '',
                PORT: '',
                NAME: '',
                LETSENCRYPT_EMAIL: null,
                LETSENCRYPT_HOST: null
            };
            container.VHOST = ENV_VIRTUAL_HOST;

            const IP = ContainerInspectInfo.NetworkSettings.Networks[Network].IPAddress;

            if (!IP) {
                break;
            }

            container.IP = IP;

            const ENV_VIRTUAL_PORT = containsWordinArray(ContainerENV, "VIRTUAL_PORT");

            if (ENV_VIRTUAL_PORT != null) {
                container.PORT = ENV_VIRTUAL_PORT;
            } else {
                container.PORT = Object.keys(ContainerInspectInfo.Config.ExposedPorts)[0];
            }

            const ENV_LETSENCRYPT_HOST = containsWordinArray(ContainerENV, "LETSENCRYPT_HOST");

            const ENV_LETSENCRYPT_EMAIL = containsWordinArray(ContainerENV, "LETSENCRYPT_EMAIL");

            if (ENV_LETSENCRYPT_EMAIL) {
                container.LETSENCRYPT_EMAIL = ENV_LETSENCRYPT_EMAIL;
            }

            if (ENV_LETSENCRYPT_HOST) {
                container.LETSENCRYPT_HOST = ENV_LETSENCRYPT_HOST;
            } else if (ENV_LETSENCRYPT_EMAIL) {
                container.LETSENCRYPT_HOST = ENV_VIRTUAL_HOST;
            }

            container.NAME = ContainerInspectInfo.Name.replace("/", "");
            Containers.push(container);
        }
    }
    return Containers;
}