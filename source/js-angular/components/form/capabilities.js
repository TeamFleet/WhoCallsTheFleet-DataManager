app.component('formElementCapabilities', {
    template: `<div class="form-element-capabilities">
    <fieldset class="set" ng-switch="set.type" ng-repeat="set in $ctrl.capabilities track by $index">
        <legend>{{ set.name }}</legend>
        <label ng-switch-when="checkbox">
            <input type="checkbox" ng-model="$ctrl.data[set.key]" />
        </label>
        <label ng-switch-when="select">
            <select ng-model="$ctrl.data[set.key]">
                <option ng-repeat="value in set.values" value="{{ value.value }}">{{value.name}}</option>
            </select>
        </label>
        <label ng-switch-default>
            <input type="{{ set.type }}" ng-model="$ctrl.data[set.key]" />
        </label>
    </fieldset>
</div>`,
    bindings: {
        'data': '=',
    },
    controller: function () {
        if (typeof this.data !== 'object')
            this.data = {}
        // this.test = 'test'
        this.capabilities = _g.shipCapabilities
        // setTimeout(() => {
        //     _g.shipCapabilities.forEach(obj => {
        //         let value = undefined
        //         switch (obj.type) {
        //             case 'select': {
        //                 value = obj.values || []
        //                 break
        //             }
        //         }
        //         _frame.app_main.page['ships'].gen_form_line(
        //             obj.type || 'checkbox',
        //             `capabilities.${obj.key}`,
        //             obj.name,
        //             value
        //         ).appendTo($('<p/>'))
        //     })
        // })
        // console.log(this)
    }
})
