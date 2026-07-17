CREATE DATABASE IF NOT EXISTS together_buying CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'together'@'localhost' IDENTIFIED BY 'togetherpass';
CREATE USER IF NOT EXISTS 'together'@'127.0.0.1' IDENTIFIED BY 'togetherpass';

GRANT ALL PRIVILEGES ON together_buying.* TO 'together'@'localhost';
GRANT ALL PRIVILEGES ON together_buying.* TO 'together'@'127.0.0.1';

FLUSH PRIVILEGES;
