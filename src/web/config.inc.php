<?php 

// Magic configuration file path
// You can set up a symlink for this, or handle it however you like
$magicRootFolder = dirname(__FILE__) . '/../main/resources';

// This is for the live editor, if you have a sandbox server set up the file path here.
// The webserver will need write access to $sandboxServer/plugins/Magic/data/updated.yml
// and read access to $sandboxServer/plugins/Magic/data/registered.yml
$sandboxServer = '/home/minecraft/servers/sandbox';

// And set the URL to your sandbox server here to direct players to log in
$sandboxServerURL = '';

// This is where the web editor keeps session files
// This folder must exist and be writeable by the web user
$sessionFolder = '/home/minecraft/sessions';

// Use your own reference URL here if you want
$referenceURL = 'reference.elmakers.com';

// Set this if you want logins to work across multiple subdomains
$primaryDomain = '';

// This is mainly used in testing, normally doesn't need to be changed
$magicDefaultsFolder = $magicRootFolder . '/defaults';

// Resource Pack folder
$resourcePackFolder = $magicRootFolder . '/../resource-pack';

// Configure InfoBook integration (external plugin)
$infoBookRootConfig = dirname(__FILE__) . '/../main/resources/examples/InfoBook/config.yml';

// Page title
$title = "Magic";

// Instructional YouTube video id
$youTubeVideo = '2k3Zy9TFUKw';

// How players get wands, other than view the configured ways in magic.yml (crafting, random chests)
$howToGetWands = array('You can purchase wands in a shop, if your server has shops set up');

// Page overview - this will get put in a Header at the top of the page.
$pageOverview = <<<EOT
	<div style="margin-left: 128px;">
		Welcome to the development server for the Magic plugin by elMakers!<br/><br/>
		This is a plugin for <a href="http://www.spigotmc.org" target="_new">Spigot</a> and <a href="http://www.papermc.io" target="_new">Paper</a> minecraft servers.
		For more information, <a href="https://github.com/elBukkit/MagicPlugin/wiki" target="_new">click here.</a>
		<br/><br/>
		While this is just a development server, you are free to log in and play at
		<span class="minecraftServer">demo.elmakers.com</span>. You may also view our <a href="http://map.elmakers.com"/>dynmap here</a>.
		<br/><br/>
		Thanks for looking!
	</div>
EOT;

$analytics = <<<EOT
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-17131761-5"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-17131761-5');
</script>
EOT;

// Add overrides file
include( dirname(__FILE__) . '/config.overrides.inc.php');

?>