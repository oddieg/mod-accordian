'use strict';

/**
 * Custom Form Validation
 */
app.factory('animations', [
	'$interval',
	'$rootScope',
	'$timeout',

	function($interval, $rootScope, $timeout) {

		return {

			/**
			 * AppEngine allows us to request specific sized images
			 */
			optimizedImagePath: function(origionalPath, mobileWidth, desktopWidth, tabletWidth) {
				var optimizedPath = origionalPath;

				// Check the path has this var
				if (origionalPath.indexOf('s1600' !== -1)) {

					// Now replace it with the desired size
					if ($rootScope.browsers.mobile) {
						optimizedPath = origionalPath.replace('s1600', mobileWidth);
					} else {
						if (tabletWidth && $rootScope.browsers.tablet) {
							optimizedPath = origionalPath.replace('s1600', tabletWidth);
						} else {
							optimizedPath = origionalPath.replace('s1600', desktopWidth);
						}
					}
				}

				return optimizedPath;
			},

			/**
			 * Wait for the dom to be rendered an calculate the scrollable region
			 */
			setScrollableRegion: function() {
				$timeout(function() {
					$interval(function() {
						var currentSlide = $('.slide:visible'), // Get the slide that is showing
							container = currentSlide.find('.slide-content'),
							availHeight = container.height(),
							staticContainer = currentSlide.find('.static-content'),
							staticHeight = staticContainer.height(),
							scrollAreas = container.find('.scroll'),
							newHeight = availHeight - staticHeight;

						scrollAreas.outerHeight(newHeight);
					}, 50, 10);
				});
			},

			/**
			 * Loop through 'containers' and its 'children' to apply consistent heights, this has to run 10x over 1 second to ensure correct rendering.
			 */
			normalizeHeight: function(parent, skip) {
				$interval(function() {
					var containers = $(parent);

					// Loop through each container
					containers.each(function() {
						var childNodes = $(this.children),
							count = 0,
							height = 0; // Reset the height between each container

						// Figure out the tallest
						childNodes.each(function() {
							if (!$(this).hasClass(skip)) {
								count++;
							}
						});
						if (count > 1) {
							// Figure out the tallest
							childNodes.each(function() {
								// Reset any heights we already have
								$(this).height('inherit');

								var thisH = $(this).outerHeight();
								height = (thisH >= height) ? thisH : height;
								height = Math.floor(height);
							});

							// Now loop through all instances and set the height per the min
							childNodes.each(function() {
								var ignore = (skip) ? $(this).hasClass(skip) : false;

								// Make sure we don't want to ignore this particular element
								if (!ignore && height !== 0) {
									$(this).height(height);
								}
							});
						}
					});
				}, 100, 1);
			},

			/**
			 * Used to scale progress bars
			 */
			percentage: function(element, style, value, index) {
				index = index || 0;

				var delay = (200 * index);

				// Delay the progress bar sequentially
				$timeout(function() {
					element.css(style, value + '%');
				}, delay);
			},

			/**
			 * Increment a number value
			 */
			integer: function(scope, key, end, index) {
				var temp = Number(end) || 0, // Our end result
					rate = ($rootScope.browsers.desktop) ? 60 : 30, // framerate
					inc = end / rate, // How much will we increase each time
					delay = ($rootScope.browsers.desktop) ? 10 : 30, // milliseconds delay until next increment+
					instance = Number(index) || 1; // further delay

				// Set it to 0 to begin animating up
				scope[key] = 0;

				// Sequence them based on the index
				if (temp === 0) {
					return;
				}

				// Sequence them based on the index
				$timeout(function() {

					// Animation timer.
					$interval(function() {
						temp = (Number(scope[key]) + Number(inc));
						scope[key] = temp;
					}, delay, rate);

				}, (200 * instance));
			}
		};
	}
]);
