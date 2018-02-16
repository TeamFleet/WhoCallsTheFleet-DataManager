app.component('formElementCapabilities', {
    template: `<div class="form-element-capabilities">
    {{ $ctrl.data }}
    {{ $ctrl.test }}
</div>`,
    bindings: {
        'data': '=',
    },
    controller: function () {
        console.log(this)
        // this.test = 'test'
        _g.shipCapabilities.forEach(obj => {
            let value = undefined
            switch (obj.type) {
                case 'select': {
                    value = obj.values || []
                    break
                }
            }
            _frame.app_main.page['ships'].gen_form_line(
                obj.type || 'checkbox',
                `capabilities.${obj.key}`,
                obj.name,
                value
            ).appendTo($('<p/>'))
        })
    }
})
