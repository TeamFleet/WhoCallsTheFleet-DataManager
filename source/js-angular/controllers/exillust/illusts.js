app.controller('page-exillust-illusts', ($scope) => {
    const fs = node.fs
    const path = node.path
    // const db = {
    //     exillusts: new node.nedb({ filename: path.join(_g.path.db, 'exillusts.nedb'), autoload: true }),
    //     exillust_types: new node.nedb({ filename: path.join(_g.path.db, 'exillust_types.nedb'), autoload: true })
    // }
    const dbItemDefaults = {
        // id: /extra_/(.+),
        // exclude: [8, 9]
        // type: NUMBER id in exillust_types
    }
    const filesToCheck = [
        '8.png',
        '9.png'
    ]

    $scope.list = []
    $scope.current = undefined
    $scope.ready = false

    let folders = []

    $scope.init = (/*data*/) => {
        new Promise((resolve, reject) => {
            // 获得文件夹列表
            fs.readdir(_g.path.pics.ships, (err, files) => {
                if (err) reject(new Error(err))
                else {
                    folders = files
                        .filter(file => /^extra_/.test(file))
                        .sort((a, b) =>
                            parseInt(a.substr('extra_'.length)) - parseInt(b.substr('extra_'.length))
                        )
                    resolve()
                }
            })
        }).then(() => new Promise((resolve, reject) => {
            // 读取DB
            _db.exillusts.find({}, (err, docs) => {
                if (err) reject(new Error(err))
                else resolve(docs.map(doc => 'extra_' + doc.id))
            });
        })).then(items => new Promise((resolve/*, reject*/) => {
            // 比对DB数据和文件夹列表，将DB中缺失的数据写入
            const itemsToInsert = folders.filter(folder => !items.includes(folder))
            // console.log(items, itemsToInsert)
            let chainInserting = new Promise(resolve => resolve())
            itemsToInsert.forEach(item => {
                chainInserting = chainInserting.then(() => new Promise((resolve, reject) => {
                    let doc = Object.assign({}, dbItemDefaults, {
                        id: parseInt(item.substr('extra_'.length))
                    })
                    const files = fs.readdirSync(path.join(_g.path.pics.ships, item))
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
                    $scope.list = docs.sort((a, b) => a.id - b.id)
                    resolve()
                }
            });
        })).then(() => {
            console.log('ready', $scope.list)
            $scope.ready = true
            $scope.$apply()
        })
    }

    $scope.getPic = (item, picId) => {
        if (Array.isArray(item.exclude) && item.exclude.includes(picId))
            return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        return path.join(_g.path.pics.ships, `extra_${item.id}`, `${picId}.png`)
    }

    $scope.actions = {
        set: id => {
            console.log(id)
        }
    }
})