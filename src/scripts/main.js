(function(window) {
	'use strict';

	BarChartCtrl.$inject = [
		'$scope',
		'$http'
	];
	function BarChartCtrl(
		$scope,
		$http
	) {
		$scope.sort = '';
		$http.get('json/browsers.json').success(function(data) {
			$scope.values = data;
		});
	}

	window.BarChartCtrl = BarChartCtrl;

})(window);
