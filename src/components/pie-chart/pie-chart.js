(function(angular) {
	'use strict';

	PieChartCtrl.$inject = [
		'$scope'
	];
	function PieChartCtrl(
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

		$scope.getSegmentPath = function(columnIndex, cellIndex) {
			var series = $scope.data[columnIndex];
			var value = series.values[cellIndex];
			var totalValue = $scope.getTotalValue();
			var startRatio = $scope.sum(series.values, cellIndex) / totalValue;
			for (var i = 0, l = columnIndex; i < l; i++) { startRatio += ($scope.sum($scope.data[i].values) / totalValue); }
			var sizeRatio = value.number / $scope.getTotalValue();
			var radius = Math.min($scope.width, $scope.height) / 2;
			var path = $scope.getArcPath(startRatio, sizeRatio, radius);

			return path;
		};

		$scope.getArcPath = function(startRatio, sizeRatio, radius) {
			startRatio = Number(startRatio);
			sizeRatio = Number(sizeRatio);
			radius = Number(radius);
			var startCoordinates = $scope.polarToCartesian(startRatio * (2 * Math.PI), radius);
			var endCoordinates = $scope.polarToCartesian((startRatio + sizeRatio) * (2 * Math.PI), radius);
			return 'M 0 0 L ' + startCoordinates[0] + ' ' + startCoordinates[1] + ' A ' + radius + ' ' + radius + ' 0 ' + (sizeRatio > 0.5 ? '1' : '0') + ' 1 ' + endCoordinates[0] + ' ' + endCoordinates[1] + ' z';
		};

		$scope.polarToCartesian = function(angle, radius) {
			var x = radius * Math.sin(angle);
			var y = -radius * Math.cos(angle);
			return [x, y];
		};

		$scope.getTotalValue = function() {
			return $scope.data.reduce(function(sum, series) {
				return sum + series.values.reduce(function(sum, value) { return sum + value.number; }, 0);
			}, 0);
		};

		$scope.sum = function(array, limit) {
			if (!limit && (limit !== 0)) { limit = array.length; }
			limit = Math.max(0, Math.min(array.length, limit));
			var sum = 0;
			for (var i = 0; i < limit; i++) { sum += array[i].number; }
			return sum;
		};
	}

	PieChartDirective.$inject = [
		'ChartDataService'
	];
	function PieChartDirective(
		ChartDataService
	) {
		return {
			restrict: 'E',
			templateUrl: 'components/pie-chart/pie-chart.html',
			replace: true,
			transclude: true,
			scope: true,
			controller: PieChartCtrl,
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

	angular.module('piechart', ['chart'])
		.controller('PieChartCtrl', PieChartCtrl)
		.directive('piechart', PieChartDirective);

})(angular);
