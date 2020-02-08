app.controller('page-exillust-illusts', ($scope, dbExillustTypesUpdate) => {
    const fs = node.fs
    const path = node.path
    const dbItemDefaults = {
        // id: /extra_/(.+),
        // exclude: [8, 9]
        // type: NUMBER id in exillust_types
    }
    const filesToCheck = [
        '8.png',
        '9.png'
    ]

    $scope.list = {
        unassigned: []
    }
    $scope.type = {
        current: 'unassigned',
        list: []
    }
    $scope.types = {}
    $scope.current = undefined
    $scope.ready = false
    $scope.updating = false

    let folders = []

    const reset = () => {
        $scope.list = {
            unassigned: []
        }
        $scope.type = {
            current: 'unassigned',
            list: []
        }
        $scope.types = {}
        $scope.current = undefined

        folders = []
    }

    $scope.init = (/*data*/) => {
        $scope.updating = true
        new Promise((resolve, reject) => {
            // 获得类型
            _db.exillust_types.find({}).sort({ sort: 1, id: 1 }).exec((err, docs) => {
                if (err) reject(new Error(err))
                else {
                    docs.forEach(doc => {
                        $scope.types[doc.id] = doc
                        $scope.type.list.push(doc.id)
                    })
                    resolve()
                }
            });
        }).then(() => new Promise((resolve, reject) => {
            // 获得文件夹列表
            fs.readdir(_g.path.pics.shipsExtra, (err, files) => {
                if (err) reject(new Error(err))
                else {
                    folders = files
                        // .filter(file => /^extra_/.test(file))
                        // .sort((a, b) =>
                        //     parseInt(a.substr('extra_'.length)) - parseInt(b.substr('extra_'.length))
                        // )
                        .sort((a, b) =>
                            parseInt(a) - parseInt(b)
                        )
                    resolve()
                }
            })
        })).then(() => new Promise((resolve, reject) => {
            // 读取DB
            _db.exillusts.find({}, (err, docs) => {
                if (err) reject(new Error(err))
                // else resolve(docs.map(doc => 'extra_' + doc.id))
                else resolve(docs.map(doc => '' + doc.id))
            });
        })).then(items => new Promise((resolve/*, reject*/) => {
            // 比对DB数据和文件夹列表，将DB中缺失的数据写入
            const itemsToInsert = folders.filter(folder => !items.includes(folder))
            // console.log(items, itemsToInsert)
            let chainInserting = new Promise(resolve => resolve())
            itemsToInsert.forEach(item => {
                chainInserting = chainInserting.then(() => new Promise((resolve, reject) => {
                    let doc = Object.assign({}, dbItemDefaults, {
                        // id: parseInt(item.substr('extra_'.length))
                        id: parseInt(item)
                    })
                    const files = fs.readdirSync(path.join(_g.path.pics.shipsExtra, item))
                    const exclude = filesToCheck
                        .filter(file => !files.includes(file))
                        .map(file => parseInt(file.replace(/\.png$/, '')))
                    if (Array.isArray(exclude) && exclude.length) doc.exclude = exclude
                    _db.exillusts.insert(doc, (err/*, newDoc*/) => {
                        if (err) reject(new Error(err))
                        else resolve()
                    });
                }))
            })
            chainInserting = chainInserting.then(() => resolve())
        })).then(() => new Promise((resolve, reject) => {
            // 初始化list
            _db.exillusts.find({}, (err, docs) => {
                if (err) reject(new Error(err))
                else {
                    docs.sort((a, b) => a.id - b.id)
                        .forEach(doc => {
                            if (doc.type) {
                                if (typeof $scope.list[doc.type] === 'undefined')
                                    $scope.list[doc.type] = []
                                $scope.list[doc.type].push(doc)
                            } else {
                                $scope.list.unassigned.push(doc)
                            }
                        })
                    resolve()
                }
            });
        })).then(() => {
            console.log('ready', $scope.list)
            $scope.ready = true
            $scope.updating = false
            $scope.$apply()
        })
    }

    $scope.$watch(
        () => dbExillustTypesUpdate.timestamp,
        (newValue, oldValue) => {
            if (newValue === oldValue) return
            // console.log(newValue + ' ' + oldValue);
            // console.log(dbExillustTypesUpdate.timestamp);
            reset()
            $scope.init()
        }
    )

    $scope.getPic = (item, picId) => {
        if (Array.isArray(item.exclude) && item.exclude.includes(picId))
            return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        return path.join(_g.path.pics.shipsExtra, `${item.id}`, `${picId}.png`)
    }

    $scope.actions = {
        setCurrent: item => {
            $scope.current = item
        },
        updateItemType: () => {
            console.log($scope.current)
            console.log(typeof $scope.current.type)
            let update = {}
            if (typeof $scope.current.type === 'number') {
                update = {
                    $set: {
                        type: $scope.current.type
                    }
                }
            } else {
                update = {
                    $unset: {
                        type: true
                    }
                }
            }
            _db.exillusts.update(
                {
                    '_id': $scope.current._id
                },
                update,
                {},
                (err/*, numReplaced*/) => {
                    if (err) throw (new Error(err))
                    else {
                        dbExillustTypesUpdate.update()
                        $scope.$apply()
                    }
                }
            )
        }
    }
})
