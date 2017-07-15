if (!app) var app = window.app
if (!angular) var angular = window.angular





window.app = angular.module('admin', [])




app.addTemplateDefaults = {
    templateURL: null
}
app.addTemplate = (options, initData) => {
    if (typeof options === 'string')
        return app.addTemplate({ templateUrl: options }, initData)

    const settings = Object.assign({}, app.addTemplateDefaults, options)

    let container = $('<div/>')

    if (settings.templateUrl) {
        $.ajax({
            url: settings.templateUrl,
            method: 'GET',
            success: function (data) {
                // container = container.replaceWith($(data))
                let _container = container
                container = $(data)
                _container.replaceWith(container)
                container.attr('ng-init', `init(${JSON.stringify(initData || {})})`)
                setTimeout(() => {
                    angular.element(container).injector().invoke(
                        [
                            "$compile", function ($compile) {
                                var $scope = angular.element(container).scope();
                                $compile(container)($scope);
                                $scope.$apply();
                            }
                        ]
                    )
                })
            }
        })
    }

    return container
}