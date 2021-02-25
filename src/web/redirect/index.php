<?php
$example = '';
$subdomain = explode('.', $_SERVER['HTTP_HOST'])[0];
if ($subdomain != 'survival' && $subdomain != 'mine' && $subdomain != 'magic') {
    $example = '?example=' . $subdomain;
}
header('Location: https://magic.elmakers.com/' . $example);
exit;
?>