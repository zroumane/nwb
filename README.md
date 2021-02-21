## Projet "New World Builders"

Repo du site : newworld-builder.com
Dev Demo : http://51.195.45.151:4444

### Requis
[PHP](https://www.php.net/downloads)
[Composer](https://getcomposer.org/download/)

### Intallation
```bash
git clone https://github.com/zroumane/nwb
cd nwb
composer install
```

### Lancer
Executer `start.bat` ou :
```bash
php -S localhost:4444 -t public
```

### Déploiement
```bash
(server)
rm -fr ~/www/nwb-syf/*
(local)
sudo rsync -avhb --exclude-from=exclude ./ ubuntu@51.195.45.151:~/www/nwb-syf 
(server)
cd ~/www/nwb-syf (server)
vi .env (server, passer APP_ENV en prod)
composer update (server)
sudo chown -R www-data:www-data ~/www/nwb-syf 
```
