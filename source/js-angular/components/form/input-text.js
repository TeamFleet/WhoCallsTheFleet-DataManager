if (!_g) var _g = window._g
if (!_p) var _p = window._p
if (!_db) var _db = window._db
if (!_frame) var _frame = window._frame
if (!app) var app = window.app
if (!angular) var angular = window.angular




app.component('inputText', {
    template: `<p>
    <label>
        <span>{{ $ctrl.title }}</span>
        <input type="text" required="{{ $ctrl.required }}" name="{{ $ctrl.name }}" ng-model="$ctrl.model" ng-disabled="{{ $ctrl.disabled }}" />
        <span ng-if="$ctrl.suffix">{{ $ctrl.suffix }}</span>
    </label>
</p>`,
    bindings: {
        'model': '=',
        'title': '<',
        'required': '<',
        'name': '<',
        'suffix': '<',
        'disabled': '<'
    },
    controller: function () {
    }
})
