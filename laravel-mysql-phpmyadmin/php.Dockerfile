FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractivee

RUN apt-get update && apt-get install -y \
php-fpm php-cli php-mysql php-xml php-curl php-mbstring zip unzip curl

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN sed -i 's|listen = /run/php/php8.3-fpm.sock|listen = 0.0.0.0:9000|' /etc/php/8.3/fpm/pool.d/www.conf

WORKDIR /var/www/html

EXPOSE 9000

CMD ["/usr/sbin/php-fpm8.3", "-F"]
