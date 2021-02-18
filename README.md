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
 - Dupliquer le dossier
 - Supprimer vendor et var  
 - Passer `APP_ENV` en `prod` dans le fichier `.env` (`composer dump-env prod`) puis :
```bash
sudo rsync -avhb --exclude-from=exclude ./ ubuntu@51.195.45.151:~/www/nwb-syf
composer install
```
