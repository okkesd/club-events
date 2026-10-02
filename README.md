## ClubEvents – Frontend

This repository contains the frontend of **ClubEvents**, a web platform for managing university club events.

- Live Deployment: https://evenements.com.tr/

The frontend provides:

- User authentication (login/register)
- Club listing and details
- Event creation and management

It communicates with the backend through REST APIs


## Domain migration to evenements.com.tr

The existing hostname in the deployed config is `evoracle.duckdns.org`.
`nginx.conf` serves the new domain and redirects the old domain over HTTP and
HTTPS. Keep the old certificate valid while retaining this redirect.
`nginx.bootstrap.conf` keeps the old HTTPS site online while enabling HTTP
certificate validation for the new domain.

### One-time server setup (before pushing/deploying this change)

1. Point the `evenements.com.tr` A record to the server's public IPv4 address.
   Any AAAA record must reach the same deployment over IPv6. Allow inbound
   ports 80 and 443. This config does not enable `www.evenements.com.tr`.
2. In the server's existing `/home/<SSH_USER>/docker-app` Compose file, retain
   the current Nginx config mount and add these mounts to the `nginx` service:

   ```yaml
   volumes:
     # Keep the existing nginx.conf mount as well.
     - /var/www/certbot:/var/www/certbot:ro
     - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

   Mount the entire certificate directory because `live/` contains symlinks
   into `archive/`. Replace an existing certificate mount rather than adding
   a duplicate. The server's Compose file is not maintained in this repo.
3. Copy this repo's `nginx.bootstrap.conf` to the server as
   `/home/<SSH_USER>/docker-app/nginx/nginx.conf`, then run from `docker-app`:

   ```bash
   sudo mkdir -p /var/www/certbot/.well-known/acme-challenge
   docker compose up -d --force-recreate nginx
   docker compose exec -T nginx nginx -t
   ```

4. Verify that the challenge directory is publicly reachable:

   ```bash
   echo ready | sudo tee /var/www/certbot/.well-known/acme-challenge/check
   curl --fail http://evenements.com.tr/.well-known/acme-challenge/check
   sudo rm /var/www/certbot/.well-known/acme-challenge/check
   ```

   The response must contain `ready`, without redirecting to the old site.
5. Issue the certificate on the server:

   ```bash
   sudo certbot certonly \
     --webroot -w /var/www/certbot \
     --cert-name evenements.com.tr \
     -d evenements.com.tr
   ```

6. Deploy the repo's final `nginx.conf` using the existing GitHub Actions
   workflow, or copy it to the same server config path and run:

   ```bash
   docker compose up -d --force-recreate nginx
   docker compose exec -T nginx nginx -t
   curl -I https://evenements.com.tr
   curl -I https://evoracle.duckdns.org
   ```

   The old URL should redirect to `https://evenements.com.tr` with the path
   preserved. The workflow checks that the new certificate and challenge
   directory are accessible before copying the final config, then recreates
   Nginx so it picks up the new bind-mounted config.

### Renewal and application settings

Enable your Certbot installation's automatic renewal timer. Create an executable
root-owned deploy hook at `/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh`
with the following contents, replacing `<SSH_USER>` with the server user:

```sh
#!/bin/sh
set -eu
cd /home/<SSH_USER>/docker-app
docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload
```

```bash
sudo chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
sudo certbot renew --dry-run
sudo /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

The dry run checks validation; the last command checks the reload hook separately.
Keep the HTTP challenge route and shared directory for future renewals, including
renewal of the old domain's certificate.

The app already defaults `NEXT_PUBLIC_SITE_URL` to `https://evenements.com.tr`.
Update any explicit override before building. Update any external authentication
callback URLs or backend origin settings that still reference the old domain.
Browser-facing API/image URLs must use HTTPS; retain internal Docker service URLs
for server-to-server requests.
