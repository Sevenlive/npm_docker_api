# TypeScript Tool for Generating API Requests to NGINX Proxy Manager API

This TypeScript tool is designed to generate API requests to the NGINX Proxy Manager API based on environment variables within a Docker container. It simplifies the process of interacting with the NGINX Proxy Manager API and automates the configuration of NGINX proxy settings.

## Prerequisites

Before using this tool, ensure that you have the following prerequisites installed:

- Nginx Proxy Manager
- Docker


## Installation

To install and set up the tool, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory.
2. Update the variables either in the docker-compose.full.yml or docker-compose.standalone.yml
3. Run either the docker-compose.full.yml or docker-compose.standalone.yml

This Tool generates API-Request to the npm_docker_api for every Container with these Enviroment Variables:

      - VIRTUAL_HOST=hostname
      - LETSENCRYPT_EMAIL=email@example.com
      - LETSENCRYPT_HOST=hostname

Also make sure, that the container and the nginx-proxy can reach each other.

This Tool is hugely influenced by https://github.com/nginx-proxy/nginx-proxy


## Contribution
Contributions to this TypeScript tool are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the project's GitHub repository.

## License
This TypeScript tool is licensed under the MIT License. Feel free to modify and distribute it according to your needs.