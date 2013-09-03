(function(angular) {
	'use strict';

	ChartCtrl.$inject = [
		'$scope'
	];
	function ChartCtrl(
		$scope
	) {
		if (!('title' in $scope)) { $scope.title = ''; }
		if (!('isEditable' in $scope)) { $scope.isEditable = false; }
		if (!('primaryColumnName' in $scope)) { $scope.primaryColumnName = ''; }
		if (!('columnNames' in $scope)) { $scope.columnNames = []; }
		if (!('data' in $scope)) { $scope.data = []; }


		$scope._handleCellDblClicked = function($event) {
			if (!$scope.isEditable) { return; }
			$event.preventDefault();
			$event.stopImmediatePropagation();
			var cellElement = angular.element(event.srcElement.tagName === 'TD' ? event.srcElement : event.srcElement.parentNode);
			var inputElement = cellElement.find('input');
			var documentElement = angular.element(document);

			inputElement.off('input').off('keydown');
			cellElement.attr('data-editable', 'data-editable');
			inputElement[0].select();

			inputElement.on('mousedown', _handleInputElementPressed);
			documentElement.on('mousedown', _handleDocumentElementPressed);


			function _handleInputElementPressed(event) {
				console.log('preventing');
				event.stopImmediatePropagation();
			}

			function _handleDocumentElementPressed(event) {
				event.preventDefault();
				inputElement.off('mousedown', _handleInputElementPressed);
				documentElement.off('mousedown', _handleDocumentElementPressed);
				cellElement.removeAttr('data-editable');
			}
		};
	}

	ChartDirective.$inject = [
		'ChartDataService'
	];
	function ChartDirective(
		ChartDataService
	) {
		return {
			restrict: 'E',
			templateUrl: 'components/chart/chart.html',
			replace: true,
			transclude: true,
			controller: ChartCtrl,
			compile: function(element, attributes, transclude) {
				return function(scope) {
					transclude(scope, function(clone) {
						if ('title' in attributes) { scope.title = attributes.title; }
						if ('editable' in attributes) { scope.isEditable = (attributes.editable === 'true'); }

						var chartData = ChartDataService.parse(clone);
						for (var property in chartData) { scope[property] = chartData[property]; }
					});
				};
			}
		};
	}

	angular.module('chart', [])
		.controller('ChartCtrl', ChartCtrl)
		.directive('chart', ChartDirective);
})(angular);
