app.component('formElementCapabilities', {
    template: `<div class="form-element-capabilities">
    {{ $ctrl.data }}
    {{ $ctrl.test }}
</div>`,
    bindings: {
        'data': '=',
    },
    controller: function () {
        const capabilities = [
            {
                key: 'count_as_landing_craft',
                name: '算作：登陆艇',
            },
            {
                key: 'count_as_night_operation_aviation_personnel',
                name: '算作：夜间航空要员',
            },
            {
                key: 'participate_night_battle_when_equip_swordfish',
                name: '当装备剑鱼时可参与夜战',
            },
        ]
        console.log(this)
        // this.test = 'test'
    }
})
