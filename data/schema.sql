DROP TABLE IF EXISTS country_tb;
CREATE TABLE country_tb(
id SERIAL PRIMARY KEY,
name VARCHAR(255),
capital VARCHAR(255),
region VARCHAR(255),
subregion VARCHAR(255),
population VARCHAR(255),
borders text,
nativename TEXT,
numericCode VARCHAR(255),
currencies VARCHAR(255),
flag VARCHAR(255),
latlng text);