#!/bin/sh
set -e

# 1. Ensure .env exists
if [ ! -f .env ]; then
    echo ">> [Docker Setup] Copying .env.example to .env..."
    cp .env.example .env
fi

# 2. Install Composer dependencies if vendor is missing
if [ ! -f vendor/autoload.php ]; then
    echo ">> [Docker Setup] Installing composer dependencies (fresh clone detected)..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# 3. Ensure permissions for storage and cache
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 777 storage bootstrap/cache 2>/dev/null || true

# 4. Wait for MySQL container to become ready
echo ">> [Docker Setup] Waiting for MySQL connection..."
until php -r '
    $h = getenv("DB_HOST") ?: "laravel-db";
    $u = getenv("DB_USERNAME") ?: "root";
    $p = getenv("DB_PASSWORD") ?: "secret";
    $d = getenv("DB_DATABASE") ?: "laravel";
    try {
        new PDO("mysql:host=$h;dbname=$d", $u, $p);
        exit(0);
    } catch (Exception $e) {
        exit(1);
    }
' 2>/dev/null; do
    sleep 2
done

echo ">> [Docker Setup] Database ready! Running migrations..."
php artisan migrate --force

echo ">> [Docker Setup] Starting PHP-FPM..."
exec /usr/sbin/php-fpm8.3 -F
