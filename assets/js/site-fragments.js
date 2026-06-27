(function () {
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

	document.addEventListener('DOMContentLoaded', function () {
		var header = document.querySelector('[data-site-header]');
		var footer = document.querySelector('[data-site-footer]');
		var tasks = [];

		if (header) {
			var variant = header.getAttribute('data-variant') === 'alt' ? 'alt' : 'default';
			tasks.push(swapFragment('[data-site-header]', '/assets/fragments/header-' + variant + '.html'));
		}

		if (footer) {
			tasks.push(swapFragment('[data-site-footer]', '/assets/fragments/footer.html'));
		}

		return Promise.all(tasks);
	});
})();
