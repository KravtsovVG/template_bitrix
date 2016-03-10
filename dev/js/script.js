'use strict';

var nua = navigator.userAgent;
if (nua.match(/IEMobile\/10\.0/)) {
	let msViewportStyle = document.createElement('style');
	msViewportStyle.appendChild(
			document.createTextNode(
					'@-ms-viewport{width:auto!important}'
			)
	);
	document.querySelector('head').appendChild(msViewportStyle)
}

$(function () {
	let isAndroid = (
			nua.indexOf('Mozilla/5.0') > -1
			&& nua.indexOf('Android ') > -1
			&& nua.indexOf('AppleWebKit') > -1
			&& nua.indexOf('Chrome') === -1
	);
	if (isAndroid) {
		$('select.form-control').removeClass('form-control').css('width', '100%');
	}
});