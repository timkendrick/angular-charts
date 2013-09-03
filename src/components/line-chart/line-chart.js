(function(angular) {
	'use strict';

	LineChartCtrl.$inject = [
		'$scope'
	];
	function LineChartCtrl(
		$scope
	) {
		if (!('title' in $scope)) { $scope.title = ''; }
		if (!('isEditable' in $scope)) { $scope.isEditable = false; }
		if (!('primaryColumnName' in $scope)) { $scope.primaryColumnName = ''; }
		if (!('columnNames' in $scope)) { $scope.columnNames = []; }
		if (!('data' in $scope)) { $scope.data = []; }

		if (!('hasData' in $scope)) { $scope.hasData = false; }
		if (!('width' in $scope)) { $scope.width = 100; }
		if (!('height' in $scope)) { $scope.height = 100; }
		if (!('colors' in $scope)) { $scope.colors = []; }


		$scope.getMaxValue = function() {
			var values = $scope.data.reduce(function(values, series) {
				return values.concat(series.values.map(function(value) { return value.number; }));
			}, []);
			return Math.max.apply(Math, values);
		};

		$scope.sum = function(array, limit) {
			if (!limit && (limit !== 0)) { limit = array.length; }
			limit = Math.max(0, Math.min(array.length, limit));
			var sum = 0;
			for (var i = 0; i < limit; i++) { sum += array[i].number; }
			return sum;
		};
	}

	LineChartDirective.$inject = [
		'ChartDataService'
	];
	function LineChartDirective(
		ChartDataService
	) {
		return {
			restrict: 'E',
			templateUrl: 'components/line-chart/line-chart.html',
			replace: true,
			transclude: true,
			scope: true,
			controller: LineChartCtrl,
			compile: function(element, attributes, transclude) {
				return function(scope) {
					transclude(scope, function(clone) {
						if ('title' in attributes) { scope.title = attributes.title; }
						if ('editable' in attributes) { scope.isEditable = (attributes.editable === 'true'); }
						if ('data' in attributes) { scope.hasData = (attributes.data === 'true'); }
						if ('width' in attributes) { scope.width = attributes.width; }
						if ('height' in attributes) { scope.height = attributes.height; }
						if ('colors' in attributes) { scope.colors = attributes.colors.split(','); }

						var chartData = ChartDataService.parse(clone);
						for (var property in chartData) { scope[property] = chartData[property]; }
					});
				};
			}
		};
	}

	angular.module('linechart', ['chart'])
		.controller('LineChartCtrl', LineChartCtrl)
		.directive('linechart', LineChartDirective);

})(angular);
