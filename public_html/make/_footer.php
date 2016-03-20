<footer>
	&copy; <?= date('Y') ?>
</footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/js/bootstrap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.0-rc.2/angular.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-utils/0.1.1/angular-ui-utils.min.js"></script>
<?
$path_root = preg_replace('/(^.+?)\/public_html\/.*/i', '$1', __FILE__);
$path = $path_root . '/manifest/js.json';
if (file_exists($path)) {
	$arJs = json_decode(file_get_contents($path), true);
	foreach ($arJs as $js) {
		echo '<script src="/js/' . $js . '"></script>';
	}
}
?>
</body>
</html>