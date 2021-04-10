# Projet "New World Builders"

- Website : newworld-builder.com
- Dev Demo : http://51.195.45.151:4444

## Requis
* [PHP](https://www.php.net/downloads)
* [Composer](https://getcomposer.org/download/)

## Intallation
```sh
git clone https://github.com/zroumane/nwb
cd nwb
composer install
php -S 0000:4444 -t public
```

## Déploiement

> TODO github action

```sh
(server)
rm -fr ~/www/nwb-syf/*
(local)
composer update
sudo rsync -avhb --exclude-from=exclude ./ ubuntu@51.195.45.151:~/www/nwb-syf 
(server)
cd ~/www/nwb-syf 
composer install
composer dump-env prod
sudo chown -R www-data:www-data ~/www/nwb-syf/*
```
