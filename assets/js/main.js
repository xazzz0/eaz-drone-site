/*
	Spectral by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

	(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#page-wrapper');
	var headerDensityObserver = null;

	function headerHasWrappedRows(element) {
		var children;

		if (!element || !element.children || element.children.length < 2) {
			return false;
		}

		children = element.children;

		for (var index = 1; index < children.length; index++) {
			if (children[index].offsetTop > children[0].offsetTop + 1) {
				return true;
			}
		}

		return false;
	}

	function updateHeaderDensity() {
		var header = document.getElementById('header');
		var scale = window.matchMedia('(max-width: 1080px)').matches ? 0.9 : 1;
		var compactScale = window.matchMedia('(max-width: 720px)').matches ? 0.8 : 0.82;
		var nav;
		var actions;

		if (!header) {
			return;
		}

		nav = header.querySelector('.site-nav');
		actions = header.querySelector('.site-header__actions');

		if (headerHasWrappedRows(nav) || headerHasWrappedRows(actions)) {
			scale = Math.min(scale, compactScale);
		}

		header.style.setProperty('--header-scale', scale.toFixed(2));
		header.classList.toggle('site-header--compact', scale < 0.9);
	}

	function watchHeaderDensity() {
		var header = document.getElementById('header');

		updateHeaderDensity();

		$window.off('resize.header-density orientationchange.header-density');
		$window.on('resize.header-density orientationchange.header-density', updateHeaderDensity);

		if (!header || !window.ResizeObserver) {
			return;
		}

		if (headerDensityObserver) {
			headerDensityObserver.disconnect();
		}

		headerDensityObserver = new ResizeObserver(updateHeaderDensity);
		headerDensityObserver.observe(header);
	}

	function initializeSiteChrome() {
		var $banner = $('#banner');
		var $header = $('#header');

		if (!$header.length) {
			return false;
		}

		// Scrolly.
		$('.scrolly')
			.scrolly({
				speed: 600,
				offset: $header.outerHeight()
			});

		// Menu.
		if (!$('#menu').hasClass('panel')) {
			$('#menu')
				.append('<a href="#menu" class="close"></a>')
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'right',
					target: $body,
					visibleClass: 'is-menu-visible'
				});
		}

		// Header.
		if ($banner.length > 0
		&&	$header.hasClass('alt')) {

			$window.on('resize', function() { $window.trigger('scroll'); });

			$banner.scrollex({
				bottom:		$header.outerHeight() + 1,
				terminate:	function() { $header.removeClass('alt'); },
				enter:		function() { $header.addClass('alt'); },
				leave:		function() { $header.removeClass('alt'); }
			});

		}

		watchHeaderDensity();

		return true;
	}

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ null,      '480px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 20);
		});

	// Mobile?
		if (browser.mobile)
			$body.addClass('is-mobile');
		else {

			breakpoints.on('>medium', function() {
				$body.removeClass('is-mobile');
			});

			breakpoints.on('<=medium', function() {
				$body.addClass('is-mobile');
			});

		}

		if (!initializeSiteChrome()) {
			document.addEventListener('site-fragments:ready', initializeSiteChrome, { once: true });
		}

})(jQuery);