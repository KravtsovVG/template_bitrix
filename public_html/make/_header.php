<!doctype html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<title>Title</title>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<meta name="description" content="">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap.min.css">
	<?
	$path_root = preg_replace('/(^.+?)\/public_html\/.*/i', '$1', __FILE__);
	$path = $path_root . '/manifest/css.json';
	if (file_exists($path)) {
		$arCss = json_decode(file_get_contents($path), true);
		foreach ($arCss as $css) {
			echo '<link rel="stylesheet" href="/css/' . $css . '">';
		}
	}
	?>
</head>
<body>
