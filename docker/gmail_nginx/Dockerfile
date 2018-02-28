#FROM nginx:1.10-alpine
FROM jboesl/docker-nginx-headers-more:latest

COPY ssl.conf /etc/nginx/conf.d/ssl.conf
COPY ssl/* /etc/nginx/ssl/

RUN mkdir -p /fs

EXPOSE 80 443
