# MagicMeta
A utility for generating metadata describing Magic's config options

## Usage

java -jar MagicMeta.jar output.json

## Website Installations

Create a file called `config.overrides.inc.php` and put it in your web root.

This file will look something like:
```
<?php
$magicRootFolder = '/home/minecraft/configs/Magic/';
$sandboxServerURL = 'sandbox.elmakers.com';
$resourcePackFolder = '/home/minecraft/packs/Magic/';
```

Containing anything you want to customize from the default `config.inc.php`

Copy the everything in the `web/`` folder to that same web root location.

## YAML

The website requires PHP Yaml support. If you are running on Ununtu, this can be installed with the following
commands:

```
sudo apt-get install libyaml-dev
sudo pecl install yaml
````

And then, as instructed, add the following line to your php.ini file:

`extension=yaml.so`

Restart Apache and the website should work!  .. Mostly

## Configurations

The website works by parsing your configurations. Copy the defaults files from your server,
and the example configurations and resource pack files from this repository to your server, in the folders specified
in the variables you set above.


```
scp -r ~/Server/plugins/Magic/defaults/* minecraft@server:configs/Magic/defaults/.
scp -r ~/Magic/src/examples/* minecraft@server:configs/Magic/examples/.
scp -r ~/Magic/src/resource-pack/* minecraft@server:packs/Magic/.
scp -r ~/Magic/src/main/resources/* minecraft@server:configs/Magic/.
scp -r ~/Magic/target/classes/examples/* minecraft@server:configs/Magic/examples/.
```

## Linking to Resource Pack Files

To be able to serve up images from the RP, you need to link it in your webroot, such as

```
ln -s /home/minecraft/packs/Magic/ /var/www/html/pack
```

There are also some symlinks in the repository in common/image, make sure they got deployed correctly.

## Editor Setup

The editor requires .htaccess file support on your server to process session URLs.

You can enable this in Apache with a config like this:

```
<Directory /var/www/html/editor/>
   AllowOverride all
</Directory>
```
