if (!_g) var _g = window._g
if (!_p) var _p = window._p
if (!_db) var _db = window._db
if (!app) var app = window.app
if (!angular) var angular = window.angular




app.component('selectEquipments', {
    template: `<span>
    <label>
        <span class="line-title">{{ $ctrl.title }}</span>
        <span class="line-element" ng-transclude></span>
        <span class="line-title-suffix" ng-if="$ctrl.suffix">{{ $ctrl.suffix }}</span>
    </label>
    <span class="line-element" ng-transclude></span>
</span>`,
    transclude: true,
    bindings: {
        'title': '<',
        'suffix': '<',
        'elememt': '='
    },
    controller: function () {
        // new Promise((resolve, reject) => {
        //     if (this.data) resolve()
        //     else{
        //         this.data = []
        //         _db.items.find({}).sort({ 'type': 1, 'rarity': 1, 'id': 1 }).exec((err, docs) => {
        //             docs.forEach((doc) => {
        //                 const equipment = new Equipment(doc)
        //                 const typeId = equipment.type
        //                 const type = _g.data.item_types[typeId].name.zh_cn

        //                 if(!this.data[typeId]) this.data[typeId] = [type, []]

        //                 this.data[typeId][1].push(equipment)
        //             })
        //             resolve()
        //         })
        //     }
        // }).then(() => {

        // })
    }
})
