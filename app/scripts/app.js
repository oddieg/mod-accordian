'use strict';

var app = angular.module('modAccordianApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({
		redirectTo: '/'
	});
}]);

app.filter('sanitize', ['$sce', function($sce) {
	return function(htmlCode) {
		return $sce.trustAsHtml(htmlCode);
	};
}]);
