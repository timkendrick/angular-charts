(function(angular) {
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
