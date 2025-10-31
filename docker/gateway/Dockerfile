# Dockerfile for the gateway service: minimal Alpine-based image with SSH enabled
FROM nginx:1.26-alpine

ARG SSH_USER=root
ENV DEBIAN_FRONTEND=noninteractive

# Install openssh-server and bash (alpine uses apk)
RUN apk add --no-cache openssh-server bash curl gettext

# Create SSH user and .ssh dir only when a non-root SSH user is requested.
# If SSH_USER is left as "root" we keep the existing root account and home (/root).
RUN if [ "$SSH_USER" != "root" ]; then \
      adduser -D -s /bin/bash "$SSH_USER" && \
      mkdir -p /home/"$SSH_USER"/.ssh && \
      chown -R "$SSH_USER":"$SSH_USER" /home/"$SSH_USER"/.ssh ; \
    fi

# Remove default nginx conf and copy ours
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/gateway/nginx.conf /etc/nginx/nginx.conf

# Copy our sshd_config to ensure port forwarding is allowed
COPY docker/gateway/sshd_config /etc/ssh/sshd_config

# Copy entrypoint and make executable
COPY docker/gateway/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 22 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
