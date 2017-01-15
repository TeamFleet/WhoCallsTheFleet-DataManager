if (!_g) var _g = window._g
if (!_p) var _p = window._p
if (!_db) var _db = window._db
if (!_frame) var _frame = window._frame
if (!app) var app = window.app
if (!angular) var angular = window.angular




app.component('formLine', {
    template: `<p class="form-line">
    <label>
        <span class="line-title">{{ $ctrl.title }}</span>
        <span class="line-element" ng-transclude></span>
        <span class="line-title-suffix" ng-if="$ctrl.suffix">{{ $ctrl.suffix }}</span>
    </label>
</p>`,
    transclude: true,
    bindings: {
        'title': '<',
        'suffix': '<',
        'elememt': '='
    },
    controller: function () {
    }
})
