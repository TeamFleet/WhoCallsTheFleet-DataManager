_comp.selector_ship = function (name, id, default_item) {
    var dom = _frame.app_main.page['ships'].gen_input(
        'select',
        name || null,
        id || null,
        []
    )
        , ships = []

    _db.ships.find({}).sort({ 'type': 1, 'class': 1, 'class_no': 1, 'time_created': 1, 'name.suffix': 1 }).exec(function (err, docs) {
        if (!err && !_g.data.ship_id_by_type.length) {
            for (var i in docs) {
                _g.data.ships[docs[i]['id']] = docs[i]

                if (typeof _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]] == 'undefined')
                    _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]] = []
                _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]].push(docs[i]['id'])
            }
        }

        for (var i in _g.data.ship_id_by_type) {
            if (typeof _g.ship_type_order[i] == 'object') {
                var data_shiptype = _g.data.ship_types[_g.ship_type_order[i][0]]
            } else {
                var data_shiptype = _g.data.ship_types[_g.ship_type_order[i]]
            }

            ships[i] = [
                _g.ship_type_order_name[i]['zh_cn'] + ' [' + data_shiptype['code'] + ']',
                []
            ]

            for (var j in _g.data.ship_id_by_type[i]) {
                var d = _g.data.ships[_g.data.ship_id_by_type[i][j]]
                ships[i][1].push({
                    'name': (d['name']['zh_cn'] || d['name']['ja_jp'])
                        + (d['name']['suffix']
                            ? '・' + _g.data.ship_namesuffix[d['name']['suffix']]['zh_cn']
                            : ''),
                    'value': _g.data.ship_id_by_type[i][j]
                })
            }
        }

        _frame.app_main.page['ships'].gen_input(
            'select_group',
            dom.attr('name') || null,
            dom.attr('id') || null,
            ships,
            {
                'default': default_item || null
            }).insertBefore(dom)
        dom.remove()
    })

    return dom
}

_comp.selector_ship_class = (selectName, selectId, defaultClassId) => {
    const elTemp = _frame.app_main.page['ships'].gen_input(
        'select',
        selectName || null,
        selectId || null,
        []
    )
    const shipTypes = {}
    const optGroups = []

    new Promise((resolve, reject) => {
        // 读取/缓存**舰种**数据
        _db.ship_types
            .find({})
            .exec((err, docs) => {
                if (err) return reject(err)
                if (!Array.isArray(docs)) return reject(docs)
                docs.forEach(doc => {
                    shipTypes[doc.id] = doc
                })
                resolve()
            })
    }).then(() => new Promise((resolve, reject) => {
        // 确定舰种的顺序
        const parseTypes = (types, arr) => {
            if (!Array.isArray(types)) return
            if (!Array.isArray(arr)) return
            types.forEach(type => {
                if (Array.isArray(type))
                    return parseTypes(type, arr)
                arr.push(type)
            })
        }
        _db.ship_type_collections
            .find({})
            .sort({
                id: 1
            })
            .exec((err, docs) => {
                if (err) return reject(err)
                if (!Array.isArray(docs)) return reject(docs)
                docs.forEach(doc => {
                    const types = []
                    parseTypes(doc.types, types)
                    // console.log(doc)
                    // console.log(types)
                    types.forEach(typeId => {
                        const index = optGroups.length
                        shipTypes[typeId].index = index
                        // optGroups.push({
                        //     type: typeId,
                        //     classes: []
                        // })
                        optGroups.push([
                            shipTypes[typeId].name.zh_cn,
                            []
                        ])
                    })
                    resolve()
                })
            })
    })).then(() => new Promise((resolve, reject) => {
        _db.ship_classes
            .find({})
            .sort({
                // ship_type_id: 1,
                id: 1
            })
            .exec((err, docs) => {
                if (err) return reject(err)
                if (!Array.isArray(docs)) return reject(docs)
                docs.forEach(doc => {
                    // console.log(doc)
                    const typeId = doc.ship_type_id
                    const typeIndex = shipTypes[typeId].index
                    // console.log(
                    //     typeId,
                    //     shipTypes[typeId].name.zh_cn,
                    //     typeIndex,
                    //     optGroups[typeIndex]
                    // )
                    if (typeof typeIndex === 'undefined')
                        return
                    optGroups[typeIndex][1].push({
                        'name': `[${doc.id}] ${doc.name.zh_cn}`,
                        'value': doc.id
                    })
                })
                resolve()
            })
    })).then(() => {
        console.log(optGroups)
        _frame.app_main.page['ships'].gen_input(
            'select_group',
            elTemp.attr('name') || null,
            elTemp.attr('id') || null,
            optGroups,
            {
                'default': defaultClassId || null
            }).insertBefore(elTemp)
        elTemp.remove()
    })

    return elTemp
}