(function(angular) {
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
