(function(angular) {
	'use strict';

	BarChartCtrl.$inject = [
		'$scope'
	];
	function BarChartCtrl(
		$scope
	) {
		if (!('title' in $scope)) { $scope.title = ''; }
		if (!('isEditable' in $scope)) { $scope.isEditable = false; }
		if (!('primaryColumnName' in $scope)) { $scope.primaryColumnName = ''; }
		if (!('columnNames' in $scope)) { $scope.columnNames = []; }
		if (!('data' in $scope)) { $scope.data = []; }

		if (!('hasData' in $scope)) { $scope.hasData = false; }
		if (!('colors' in $scope)) { $scope.colors = []; }


		$scope.getMaxValue = function() {
			var values = $scope.data.map(function(series) {
				return series.values.reduce(function(sum, value) { sum += value.number; return sum; }, 0);
			}, []);
			return Math.max.apply(Math, values) || 1;
		};

		$scope.sum = function(array, limit) {
			if (!limit && (limit !== 0)) { limit = array.length; }
			limit = Math.max(0, Math.min(array.length, limit));
			var sum = 0;
			for (var i = 0; i < limit; i++) { sum += array[i].number; }
			return sum;
		};
	}

	BarChartDirective.$inject = [
		'ChartDataService'
	];
	function BarChartDirective(
		ChartDataService
	) {
		return {
			restrict: 'E',
			templateUrl: 'components/bar-chart/bar-chart.html',
			replace: true,
			transclude: true,
			scope: true,
			controller: BarChartCtrl,
			compile: function(element, attributes, transclude) {
				return function(scope) {
					transclude(scope, function(clone) {
						if ('title' in attributes) { scope.title = attributes.title; }
						if ('editable' in attributes) { scope.isEditable = (attributes.editable === 'true'); }
						if ('data' in attributes) { scope.hasData = (attributes.data === 'true'); }
						if ('colors' in attributes) { scope.colors = attributes.colors.split(','); }

						var chartData = ChartDataService.parse(clone);
						for (var property in chartData) { scope[property] = chartData[property]; }
					});
				};
			}
		};
	}

	angular.module('barchart', ['chart'])
		.controller('BarChartCtrl', BarChartCtrl)
		.directive('barchart', BarChartDirective);

})(angular);
