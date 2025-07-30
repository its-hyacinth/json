FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip git curl supervisor \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory to root
WORKDIR /

# Copy PHP configuration
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# Create persistent storage structure
RUN mkdir -p /var/data/storage \
    && mkdir -p /var/data/storage/app/public \
    && mkdir -p /var/data/storage/framework/{cache,sessions,views} \
    && mkdir -p /var/data/storage/logs \
    && chown -R www-data:www-data /var/data/storage \
    && chmod -R 775 /var/data/storage

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Create supervisor config directory
RUN mkdir -p /etc/supervisor/conf.d

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose Laravel default port
EXPOSE 8000

# Use entrypoint to handle pre-start commands
ENTRYPOINT ["/entrypoint.sh"]