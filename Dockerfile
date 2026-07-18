FROM nginx:1.27-alpine

# Config nginx custom (gzip, cache, etc.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fichiers du site
COPY public/ /usr/share/nginx/html

EXPOSE 80