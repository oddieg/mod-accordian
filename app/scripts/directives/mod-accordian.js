'use strict';


/**
 * Directive: Collapse ~ Close the pane
 */
app.directive('collapse', [
	'$interval',
	'$transition',

	function($interval, $transition) {

		return {
			replace: false,
			restrict: 'A',

			link: function(scope, el, attrs) {
				var initialAnimSkip = true,
					currentTransition,
					isScrolling = false,
					intervalCheck;

				// listen for scrolling and set flag
				$(window).on('scroll', function() {
					isScrolling = true;
				});

				// When we leave remove our timer / interval
				scope.$on('$destroy', function() {
					$interval.cancel(intervalCheck);
				});

				intervalCheck = $interval(function() {
					if (isScrolling) {
						isScrolling = false;
					}
				}, 100);

				// Start the transition
				function doTransition(change) {
					var newTransition = $transition(el, change);

					function newTransitionDone() {
						// Make sure it's this transition, otherwise, leave it alone.
						if (currentTransition === newTransition) {
							currentTransition = undefined;
						}
					}

					if (currentTransition) {
						currentTransition.cancel();
					}

					currentTransition = newTransition;
					newTransition.then(newTransitionDone, newTransitionDone);
					return newTransition;
				}

				// Open this accordion
				function expand() {
					if (initialAnimSkip || isScrolling) {
						initialAnimSkip = false;
						expandDone();
					} else {
						el.removeClass('collapse').addClass('collapsing');
						doTransition({
							height: el[0].scrollHeight + 'px'
						}).then(expandDone);
					}
				}

				// Transition has finished
				function expandDone() {
					el.removeClass('collapsing');
					el.addClass('collapse in');

					el.css({
						height: 'auto'
					});
				}

				// Close the current accordion
				function collapse() {
					if (initialAnimSkip) {
						initialAnimSkip = false;
						collapseDone();
						el.css({
							height: 0
						});
					} else {
						// CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
						el.css({
							height: el[0].scrollHeight + 'px'
						});

						el.removeClass('collapse in').addClass('collapsing');
						doTransition({
							height: 0
						}).then(collapseDone);
					}
				}

				// Close has completed
				function collapseDone() {
					el.removeClass('collapsing');
					el.addClass('collapse');
				}

				// Watch for collapse change
				scope.$watch(attrs.collapse, function(shouldCollapse) {
					if (shouldCollapse) {
						collapse();
					} else {
						expand();
					}
				});
			}
		};
	}
]);

/**
 * Controller: Accordion
 */
app.controller('ModAccordionCtrl', [
	'$scope',
	'$attrs',

	function($scope, $attrs) {

		// This array keeps track of the accordion panes
		this.panes = [];

		// Ensure that all the panes in this accordion are closed, unless close-others explicitly says not to
		this.closeOthers = function(openPane) {
			var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : true;
			if (closeOthers) {
				angular.forEach(this.panes, function(pane) {
					if (pane !== openPane) {
						pane.isOpen = false;
					}
				});
			}
		};

		// This is called from the accordion-pane directive to add itself to the accordion
		this.addPane = function(paneScope) {
			var me = this;
			me.panes.push(paneScope);

			paneScope.$on('$destroy', function() {
				me.removePane(paneScope);
			});
		};

		// This is called from the accordion-pane directive when to remove itself
		this.removePane = function(pane) {
			var index = this.panes.indexOf(pane);
			if (index !== -1) {
				this.panes.splice(this.panes.indexOf(pane), 1);
			}
		};

	}
]);

/**
 * Directive: Accordion Module
 */
app.directive('modAccordion', function() {
	return {
		restrict: 'EA',
		controller: 'ModAccordionCtrl',
		transclude: true,
		templateUrl: '../views/modules/mod-accordion.html',
	};
});

/**
 * Directive: Accordion Pane ~ the content
 */
app.directive('accordionPane', [
	'$parse',
	'$rootScope',
	'$document',
	'$timeout',
	'$routeParams',
	'$location',
	'animations',

	function($parse, $rootScope, $document, $timeout, $routeParams, $location, animations) {
		return {
			restrict: 'EA',
			require: '^modAccordion',
			transclude: true,
			templateUrl: '../views/modules/mod-accordion-pane.html',
			scope: {
				onOpen: '&', // can't be a string
				onOpenTarget: '@', // What to target
				onOpenIgnore: '@', // What to ignore
				locked: '@',
				modTitle: '@',
				index: '@',
				slug: '@',
				section: '@',
				iconColor: '@'
			},

			compile: function() {

				return function($scope, el, attrs, Ctrl) {
					var getIsOpen,
						setIsOpen;


					// A callback to get sizes equal
					animations.normalizeHeight($scope.onOpenTarget, $scope.onOpenIgnore);




					// watch isOpen to open/close pane
					$scope.$watch('isOpen', function(val) {



						if (val) {
							$scope.$emit('accordionSelectPane', $scope, el, attrs);
							$rootScope.$broadcast('accordion-changed', $scope.slug);

							Ctrl.closeOthers($scope);
						}

						if (setIsOpen) {
							setIsOpen($scope.$parent, val);
						}

						// Needed in case the content is too long...
						animations.normalizeHeight($scope.onOpenTarget, $scope.onOpenIgnore);
					});

					// add pane to parent accordion directive
					Ctrl.addPane($scope);

					// to set pane as open by default, provide "open" attribute on <accordion-pane open />
					$scope.isOpen = (typeof attrs.open !== 'undefined' && attrs.open !== 'false');

					if (attrs.isOpen) {
						getIsOpen = $parse(attrs.isOpen);
						setIsOpen = getIsOpen.assign;

						$scope.$parent.$watch(getIsOpen, function(val) {
							$scope.isOpen = !!val;
						});
					}
				};
			}
		};
	}
]);
