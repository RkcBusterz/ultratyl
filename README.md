# Ultratyl
## Authors

- [@RkcBusterz](https://github.com/RkcBusterz) - Current Dashboard Maintainer and founder.

## Description

> Ultratyl is on development phase, its a pterodactyl dashboard which runs with Express JS.
>
> **Key features**
> - It has discord Authorization feature
> - Fast and secured API handling
> - Sql injection proof
> - Coins management feature
> - Auto renewal feature

## Installation Guide

> ⚠️ **Warning** The dashboard is made on Node 21+, So theres no guarantee that it will work on legacy versions of Node JS, recommended to use Node 21+.

**If you dont have node js and npm run this command**

```
sudo apt install -y nodejs npm
```

**First go do /var/www/ where basically websites are saved.**

```
cd /var/www/
```

**Then clone the git repo by the following command**

```
git clone https://github.com/RkcBusterz/ultratyl ultratyl
```

**Use sftp client or nano and edit the settings.json**

#### Use this command if you are want to use nano.
```
sudo nano /var/www/ultratyl/settings.json
```

- Add the pterodactyl API key and discord client secret.
- Dont add ( / ) at the end urls for example panel.mysite.com **Dont add slash after com**.
- For nginx the port of the dashboard is 3000.

### Install pm2 to run the app 24*7

```
sudo npm install -g pm2
```

**Then run the app**

```
cd /var/www/ultratyl
```

```
pm2 start index.js
```

**Check any error message with this command**

```
pm2 logs
```
