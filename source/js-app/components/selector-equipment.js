_comp.selector_equipment = function (name, id, default_item) {
    var dom = _frame.app_main.page['ships'].gen_input(
        'select',
        name || null,
        id || null,
        []
    )
        , equipments = []
        , options = []

    let promise = Q.fcall(() => {
        let deferred = Q.defer()
        _db.item_types.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                for (var i in docs) {
                    equipments[docs[i]['id']] = [
                        docs[i]['name']['zh_cn'],
                        []
                    ]
                }
                _db.items.find({}).sort({ 'type': 1, 'rarity': 1, 'id': 1 }).exec(function (err, docs) {
                    for (let i in docs) {
                        //equipments[docs[i]['type']][1].push(docs[i])
                        equipments[docs[i]['type']][1].push({
                            'name': docs[i]['name']['zh_cn'],
                            'value': docs[i]['id']
                        })
                    }

                    for (let i in equipments) {
                        options.push({
                            'name': '=====' + equipments[i][0] + '=====',
                            'value': ''
                        })
                        for (let j in equipments[i][1]) {
                            options.push({
                                'name': equipments[i][1][j]['name']['zh_cn'],
                                'value': equipments[i][1][j]['id']
                            })
                        }
                    }
                    //console.log( equipments )
                    //console.log( options )

                    let domNew = _frame.app_main.page['ships'].gen_input(
                        'select_group',
                        dom.attr('name'),
                        dom.attr('id'),
                        equipments,
                        {
                            'default': default_item
                        }).insertBefore(dom)
                    dom.remove()

                    dom = domNew

                    deferred.resolve()
                })
            }
        })
        return deferred.promise
    })

        .then(() => {
            let deferred = Q.defer()
            _db.consumables.find({
                name: {
                    $exists: true
                }
            }).sort({ 'id': 1 }).exec((err, docs) => {
                let group = $(`<optgroup label="道具 / 消耗品">`).appendTo(dom)
                for (let i in docs) {
                    if (!docs[i].name.ja_jp)
                        continue;
                    let item = new ItemBase(docs[i]);
                    let value = `consumable_${item.id}`;
                    $(`<option/>`,{
                        value: value,
                        html: `[${item.id}] ${item._name}`
                    }).prop('selected', value == default_item).appendTo(group)
                }
                deferred.resolve()
            })
            return deferred.promise
        })

        .catch((err) => {
            console.log(err)
        })

    return dom
}
