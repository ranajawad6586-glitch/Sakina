# Sakīna — bake-the-static-files Dockerfile.
#
# The primary deploy path uses docker-compose.yml with mounted volumes
# (out/ rsync'd onto the VPS), so this Dockerfile is optional. Keep it
# for environments that can't bind-mount and want a self-contained
# image instead. Build with:  docker build -t sakina .
FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY out /usr/share/nginx/html

EXPOSE 80
