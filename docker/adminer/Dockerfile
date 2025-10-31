# Dockerfile to add PostgreSQL PHP extension to Adminer
FROM adminer:latest

# Install build tools and libpq dev, then enable pdo_pgsql
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     libpq-dev gcc g++ make autoconf pkg-config \
  && docker-php-ext-install pdo_pgsql \
  && apt-get remove -y gcc g++ make autoconf pkg-config \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

# Drop back to the default user (if image defines one)
USER www-data

