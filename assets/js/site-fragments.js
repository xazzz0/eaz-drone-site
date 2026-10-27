(function () {
	function getAssetPrefix() {
		var pathname = window.location.pathname || '';
		if (pathname.indexOf('/pages/') !== -1 || pathname.indexOf('/cities/') !== -1 || pathname.indexOf('/templates/') !== -1) {
			return '../';
		}

		return '';
	}

	function swapFragment(selector, url) {
		var target = document.querySelector(selector);
		if (!target) return Promise.resolve();

		return fetch(url)
			.then(function (response) {
				if (!response.ok) {
					throw new Error('Failed to load ' + url + ': ' + response.status);
				}

				return response.text();
			})
			.then(function (html) {
				target.outerHTML = html;
			});
	}

	function emitReady() {
		document.dispatchEvent(new CustomEvent('site-fragments:ready'));
	}

	document.addEventListener('DOMContentLoaded', function () {
		var header = document.querySelector('[data-site-header]');
		var footer = document.querySelector('[data-site-footer]');
		var tasks = [];
		var assetPrefix = getAssetPrefix();

		if (header) {
			var variant = header.getAttribute('data-variant') === 'alt' ? 'alt' : 'default';
			var headerUrl = variant === 'alt' ? assetPrefix + 'assets/fragments/header-alt.html' : assetPrefix + 'assets/fragments/header.html';
			tasks.push(swapFragment('[data-site-header]', headerUrl));
		}

		if (footer) {
			tasks.push(swapFragment('[data-site-footer]', assetPrefix + 'assets/fragments/footer.html'));
		}

		Promise.all(tasks).then(emitReady);
	});
})();
