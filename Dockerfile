# Use official PHP with Apache image
FROM php:8.2-apache

# Enable mod_rewrite
RUN a2enmod rewrite

# Copy your project files
COPY . /var/www/html/

# Optional: Allow .htaccess overrides
RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Expose Render port
EXPOSE 10000

# Start Apache
CMD ["apache2-foreground"]