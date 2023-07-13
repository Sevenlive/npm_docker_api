export interface Container {
    NPMID: number | null;
    VHOST: string;
    IP: string;
    PORT: string;
    LETSENCRYPT_EMAIL: string | null;
    LETSENCRYPT_HOST: string | null;
    NAME: string;
}

export interface Containers extends Array<Container> { }

export interface NpmUser {
    token: string;
    expires: string;
  }

export interface NPMVHostConfig {
    domain_names: (string | null)[];
    forward_scheme: string;
    forward_host: string | null;
    forward_port: string | null;
    block_exploits: boolean;
    access_list_id: string;
    certificate_id: number;
    meta: {
      letsencrypt_agree: boolean;
      dns_challenge: boolean;
    };
    advanced_config: string;
    locations: any[];
    caching_enabled: boolean;
    allow_websocket_upgrade: boolean;
    http2_support: boolean;
    hsts_enabled: boolean;
    hsts_subdomains: boolean;
    ssl_forced: boolean;
  }

  export interface NPMVHostConfigs extends Array<NPMVHostConfig> { }
