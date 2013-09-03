(function(angular) {
	'use strict';

	angular.module('chartsControllers', []);

})(angular);
;(function(angular) {
	'use strict';

	function NgModelOnBlurDirective() {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attr, ngModelCtrl) {
				if ((attr.type === 'radio') || (attr.type === 'checkbox')) { return; }
				element.off('input').off('keydown').off('change');
				element.on('blur', function() {
					scope.$apply(function() { ngModelCtrl.$setViewValue(element.val()); });
				});
			}
		};
	}

	angular.module('chartsDirectives', [])
		.directive('ngModelOnblur', NgModelOnBlurDirective);

})(angular);
;(function(angular) {
	'use strict';

	angular.module('chartsFilters', []);

})(angular);
;(function(angular) {
	'use strict';

	angular.module('charts',
		[
			'chartsFilters',
			'chartsDirectives',
			'chartsControllers',
			'chartsServices',

			'chart',
			'barchart'
		]
	);

})(angular);
;(function(angular) {
	'use strict';

	function ChartDataService() {
		return {
			parse: function(tableElement) {
				if (!(tableElement instanceof angular.element)) { tableElement = angular.element(tableElement); }
				var tableDomElement = Array.prototype.filter.call(tableElement, function(element) {
					return element && (element.nodeType === 1) && (element.tagName === 'TABLE');
				})[0];
				if (!tableDomElement) { return null; }
				tableElement = angular.element(tableDomElement);

				var tableData = {};

				var headerElement = tableElement.find('thead').eq(0);
				if (headerElement) {
					var headerRowElement = headerElement.find('tr').eq(0);
					var columnNameElements = headerRowElement.find('th');
					var columnNames = Array.prototype.map.call(columnNameElements, function(columnNameElement) {
						return angular.element(columnNameElement).text();
					});
					tableData.primaryColumnName = columnNames[0];
					tableData.columnNames = columnNames.slice(1);
				}

				var bodyElement = tableElement.find('tbody').eq(0);
				if (bodyElement) {
					var rowElements = bodyElement.find('tr');
					var rowData = Array.prototype.map.call(rowElements, function(rowDomElement) {
						var rowElement = angular.element(rowDomElement);
						var rowHeaderElement = rowElement.find('th').eq(0);
						var rowCellElements = rowElement.find('td');
						var rowHeader = rowHeaderElement.text() || null;
						var rowData = Array.prototype.map.call(rowCellElements, function(rowCellDomElement) {
							var rowCellElement = angular.element(rowCellDomElement);
							return { number: Number(rowCellElement.text()) };
						});
						return {
							name: rowHeader,
							values: rowData
						};
					});
					tableData.data = rowData;
				}

				return tableData;
			}
		};
	}

	angular.module('chartsServices', [])
		.factory('ChartDataService', ChartDataService);

})(angular);
;(function(angular) {
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
;(function(angular) {
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
;angular.module("charts").run(["$templateCache", function($templateCache) {

  $templateCache.put("components/bar-chart/bar-chart.html",
    "<div class=\"bar-chart\">\n" +
    "\t<div class=\"bar-chart--chart\" style=\"padding-top: 50%;\">\n" +
    "\t\t<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"none\" viewBox=\"0 0 1 1\">\n" +
    "\t\t\t<style>\n" +
    "\t\t\t\t.bar:hover {\n" +
    "\t\t\t\t\topacity: 0.8;\n" +
    "\t\t\t\t\tcursor: pointer;\n" +
    "\t\t\t\t}\n" +
    "\t\t\t</style>\n" +
    "\t\t\t<g transform=\"scale(1, -1) translate(0, -1)\">\n" +
    "\t\t\t\t<g ng-repeat=\"series in data\" class=\"bar\">\n" +
    "\t\t\t\t\t<title>{{ series.name }}: {{ sum(series.values) }}</title>\n" +
    "\t\t\t\t\t<rect ng-repeat=\"value in series.values\" ng-attr-x=\"{{ ($parent.$index + 0.125) / data.length }}\" ng-attr-y=\"{{ sum(series.values, $index) / getMaxValue() }}\" ng-attr-width=\"{{ 0.75 / data.length }}\" ng-attr-height=\"{{ value.number / getMaxValue() }}\" fill=\"{{ colors[$index] }}\">\n" +
    "\t\t\t\t\t\t<animateTransform attributeName=\"transform\" attributeType=\"XML\" type=\"scale\" from=\"0\" to=\"0\" dur=\"{{ $parent.$index * 100 }}ms\" fill=\"freeze\"/>\n" +
    "\t\t\t\t\t\t<animateTransform attributeName=\"transform\" attributeType=\"XML\" type=\"scale\" from=\"1,0\" to=\"1,1\" begin=\"{{ $parent.$index * 100 }}ms\" dur=\"300ms\" fill=\"freeze\"/>\n" +
    "\t\t\t\t\t</rect>\n" +
    "\t\t\t\t</g>\n" +
    "\t\t\t</g>\n" +
    "\t\t</svg>\n" +
    "\t</div>\n" +
    "\t<h3 class=\"bar-chart--title\">{{ title }}</h3>\n" +
    "\t<div class=\"bar-chart--data\" ng-show=\"hasData\">\n" +
    "\t\t<chart/>\n" +
    "\t</div>\n" +
    "</div>\n"
  );

  $templateCache.put("components/chart/chart.html",
    "<div class=\"chart\">\n" +
    "\t<h3 class=\"chart--title\">{{ title }}</h3>\n" +
    "\t<h6 ng-show=\"{{ isEditable }}\" class=\"chart--instructions\">Double-click table cells to edit values</h6>\n" +
    "\t<table class=\"chart--table table table-bordered table-striped table-hover\">\n" +
    "\t\t<thead>\n" +
    "\t\t\t<tr>\n" +
    "\t\t\t\t<th>{{ primaryColumnName }}</th>\n" +
    "\t\t\t\t<th ng-repeat=\"columnName in columnNames\">{{ columnName }}</th>\n" +
    "\t\t\t</tr>\n" +
    "\t\t</thead>\n" +
    "\t\t<tbody>\n" +
    "\t\t\t<tr ng-repeat=\"series in data | filter:filter\">\n" +
    "\t\t\t\t<th>{{ series.name }}</th>\n" +
    "\t\t\t\t<td ng-repeat=\"value in series.values\" class=\"chart--table--cell\" ng-dblclick=\"_handleCellDblClicked($event)\"><div class=\"chart--table--cell--value\">{{ value.number }}</div><input type=\"number\" ng-model=\"value.number\" ng-model-onblur class=\"chart--table--cell--input\"/></td>\n" +
    "\t\t\t</tr>\n" +
    "\t\t</tbody>\n" +
    "\t</table>\n" +
    "</div>\n"
  );

}]);
