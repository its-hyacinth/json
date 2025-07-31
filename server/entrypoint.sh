#!/bin/sh

# Set up storage symlinks if they don't exist
if [ ! -L "/storage" ]; then
    ln -s /var/data/storage /storage
fi

# Ensure Laravel can write to storage
chown -R www-data:www-data /var/data/storage
chmod -R 775 /var/data/storage

# Link Laravel's default storage path to our persistent storage
if [ ! -d "/app/storage" ]; then
    ln -s /storage /app/storage
fi

echo "Waiting for DB to be ready..."
until php artisan migrate:fresh --seed --force; do
  echo "Retrying database..."
  sleep 5
done

php artisan storage:link

# Start supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
