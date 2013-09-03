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
			'barchart',
			'linechart',
			'piechart'
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
		if (!('width' in $scope)) { $scope.width = 100; }
		if (!('height' in $scope)) { $scope.height = 100; }
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
			scope: true,
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
;(function(angular) {
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
;(function(angular) {
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
;angular.module("charts").run(["$templateCache", function($templateCache) {

  $templateCache.put("components/bar-chart/bar-chart.html",
    "<div class=\"bar-chart\">\n" +
    "\t<div class=\"bar-chart--chart\">\n" +
    "\t\t<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" ng-attr-width=\"{{ width }}\" ng-attr-height=\"{{ height }}\">\n" +
    "\t\t\t<style>\n" +
    "\t\t\t\t.bar rect:hover {\n" +
    "\t\t\t\t\topacity: 0.8;\n" +
    "\t\t\t\t\tcursor: pointer;\n" +
    "\t\t\t\t}\n" +
    "\t\t\t</style>\n" +
    "\t\t\t<g class=\"data\" transform=\"scale(1, -1) translate(0, -{{ height }})\">\n" +
    "\t\t\t\t<g ng-repeat=\"series in data\" class=\"bar\">\n" +
    "\t\t\t\t\t<rect ng-repeat=\"value in series.values\" ng-attr-x=\"{{ width * ($parent.$index + 0.125) / data.length }}\" ng-attr-y=\"{{ (height - 10) * sum(series.values, $index) / getMaxValue() }}\" ng-attr-width=\"{{ width * 0.75 / data.length }}\" ng-attr-height=\"{{ (height - 10) * value.number / getMaxValue() }}\" fill=\"{{ colors[$index] }}\">\n" +
    "\t\t\t\t\t\t<animateTransform attributeName=\"transform\" attributeType=\"XML\" type=\"scale\" from=\"0\" to=\"0\" dur=\"{{ $parent.$index * 100 }}ms\" fill=\"freeze\"/>\n" +
    "\t\t\t\t\t\t<animateTransform attributeName=\"transform\" attributeType=\"XML\" type=\"scale\" from=\"1,0\" to=\"1,1\" begin=\"{{ $parent.$index * 100 }}ms\" dur=\"300ms\" fill=\"freeze\"/>\n" +
    "\t\t\t\t\t\t<title>{{ series.name }} - {{ columnNames[$index] }}: {{ value.number }}</title>\n" +
    "\t\t\t\t\t</rect>\n" +
    "\t\t\t\t</g>\n" +
    "\t\t\t</g>\n" +
    "\t\t\t<g class=\"axes\">\n" +
    "\t\t\t\t<line class=\"x-axis\" x1=\"0\" y1=\"0\" x2=\"0\" ng-attr-y2=\"{{ height }}\" stroke=\"#666666\" stroke-width=\"1\" shape-rendering=\"crispEdges\"/>\n" +
    "\t\t\t\t<line class=\"y-axis\" x1=\"0\" ng-attr-y1=\"{{ height - 1 }}\" ng-attr-x2=\"{{ width }}\" ng-attr-y2=\"{{ height - 1 }}\" stroke=\"#666666\" stroke-width=\"1\" shape-rendering=\"crispEdges\"/>\n" +
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

  $templateCache.put("components/line-chart/line-chart.html",
    "<div class=\"line-chart\">\n" +
    "\t<div class=\"line-chart--chart\">\n" +
    "\t\t<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" ng-attr-width=\"{{ width }}\" ng-attr-height=\"{{ height }}\">\n" +
    "\t\t\t<style>\n" +
    "\t\t\t\t.line:hover {\n" +
    "\t\t\t\t\topacity: 0.8;\n" +
    "\t\t\t\t\tcursor: pointer;\n" +
    "\t\t\t\t}\n" +
    "\t\t\t\t.point:hover {\n" +
    "\t\t\t\t\topacity: 0.8;\n" +
    "\t\t\t\t\tcursor: pointer;\n" +
    "\t\t\t\t}\n" +
    "\t\t\t</style>\n" +
    "\t\t\t<g class=\"data\" transform=\"scale(1, -1) translate(0, -{{ height }})\">\n" +
    "\t\t\t\t<mask id=\"mask\">\n" +
    "\t\t\t\t\t<rect ng-attr-width=\"{{ width }}\" ng-attr-height=\"{{ height }}\" fill=\"white\">\n" +
    "\t\t\t\t\t\t<animate attributeName=\"width\" from=\"0\" to=\"{{ width }}\" dur=\"1s\"/>\n" +
    "\t\t\t\t\t</rect>\n" +
    "\t\t\t\t</mask>\n" +
    "\t\t\t\t<g ng-repeat=\"series in data\" class=\"series\">\n" +
    "\t\t\t\t\t<g class=\"line\" mask=\"url(#mask)\">\n" +
    "\t\t\t\t\t\t<line ng-repeat=\"value in series.values | limitTo:series.values.length - 1\" ng-attr-x1=\"{{ width * ($index + 0.5) / series.values.length }}\" ng-attr-y1=\"{{ (height - 10) * value.number / getMaxValue() }}\" ng-attr-x2=\"{{ width * ($index + 1.5) / series.values.length }}\" ng-attr-y2=\"{{ (height - 10) * series.values[$index + 1].number / getMaxValue() }}\" stroke=\"{{ colors[$parent.$index] }}\" stroke-width=\"4\"/>\n" +
    "\t\t\t\t\t\t<title>{{ series.name }}</title>\n" +
    "\t\t\t\t\t</g>\n" +
    "\t\t\t\t\t<circle ng-repeat=\"value in series.values\" class=\"point\" ng-attr-cx=\"{{ width * ($index + 0.5) / series.values.length }}\" ng-attr-cy=\"{{ (height - 10) * value.number / getMaxValue() }}\" r=\"4\" fill=\"white\" stroke=\"{{ colors[$parent.$index] }}\" stroke-width=\"3\">\n" +
    "\t\t\t\t\t\t<animate attributeName=\"r\" from=\"0\" to=\"4\" dur=\"{{ ($index + 1) / series.values.length * 1000 }}ms\"/>\n" +
    "\t\t\t\t\t\t<title>{{ series.name }} - {{ columnNames[$index] }}: {{ value.number }}</title>\n" +
    "\t\t\t\t\t</circle>\n" +
    "\t\t\t\t</g>\n" +
    "\t\t\t</g>\n" +
    "\t\t\t<g class=\"axes\">\n" +
    "\t\t\t\t<line class=\"x-axis\" x1=\"0\" y1=\"0\" x2=\"0\" ng-attr-y2=\"{{ height }}\" stroke=\"#666666\" stroke-width=\"1\" shape-rendering=\"crispEdges\"/>\n" +
    "\t\t\t\t<line class=\"y-axis\" x1=\"0\" ng-attr-y1=\"{{ height - 1 }}\" ng-attr-x2=\"{{ width }}\" ng-attr-y2=\"{{ height - 1 }}\" stroke=\"#666666\" stroke-width=\"1\" shape-rendering=\"crispEdges\"/>\n" +
    "\t\t\t</g>\n" +
    "\t\t</svg>\n" +
    "\t</div>\n" +
    "\t<h3 class=\"line-chart--title\">{{ title }}</h3>\n" +
    "\t<div class=\"line-chart--data\" ng-show=\"hasData\">\n" +
    "\t\t<chart/>\n" +
    "\t</div>\n" +
    "</div>\n"
  );

  $templateCache.put("components/pie-chart/pie-chart.html",
    "<div class=\"pie-chart\">\n" +
    "\t<div class=\"pie-chart--chart\">\n" +
    "\t\t<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" ng-attr-width=\"{{ width }}\" ng-attr-height=\"{{ height }}\">\n" +
    "\t\t\t<style>\n" +
    "\t\t\t\t.segment:hover {\n" +
    "\t\t\t\t\topacity: 0.8;\n" +
    "\t\t\t\t\tcursor: pointer;\n" +
    "\t\t\t\t}\n" +
    "\t\t\t</style>\n" +
    "\t\t\t<g class=\"data\" transform=\"translate({{ width / 2 }}, {{ height / 2 }})\">\n" +
    "\t\t\t\t<g ng-repeat=\"series in data\" class=\"segment\">\n" +
    "\t\t\t\t\t<path ng-repeat=\"value in series.values\" ng-attr-d=\"{{ getSegmentPath($parent.$index, $index) }}\" fill=\"{{ colors[$parent.$index] }}\">\n" +
    "\t\t\t\t\t\t<title>{{ series.name }} - {{ columnNames[$index] }}: {{ value.number }}</title>\n" +
    "\t\t\t\t\t</path>\n" +
    "\t\t\t\t\t<animateTransform attributeType=\"XML\" attributeName=\"transform\" type=\"scale\" from=\"0\" to=\"0\" dur=\"{{ ($index + 1) / data.length * 350 }}ms\"/>\n" +
    "\t\t\t\t\t<animateTransform attributeType=\"XML\" attributeName=\"transform\" type=\"scale\" from=\"0\" to=\"1\" begin=\"{{ ($index + 1) / data.length * 350 }}ms\" dur=\"400ms\" fill=\"freeze\"/>\n" +
    "\t\t\t\t</g>\n" +
    "\t\t\t</g>\n" +
    "\t\t</svg>\n" +
    "\t</div>\n" +
    "\t<h3 class=\"pie-chart--title\">{{ title }}</h3>\n" +
    "\t<div class=\"pie-chart--data\" ng-show=\"hasData\">\n" +
    "\t\t<chart/>\n" +
    "\t</div>\n" +
    "</div>\n"
  );

}]);
