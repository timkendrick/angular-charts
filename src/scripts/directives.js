(function(angular) {
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
