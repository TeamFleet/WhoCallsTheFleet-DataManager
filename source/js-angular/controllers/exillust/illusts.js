if (!_g) var _g = window._g
if (!_p) var _p = window._p
if (!_db) var _db = window._db
if (!_frame) var _frame = window._frame
if (!app) var app = window.app
if (!angular) var angular = window.angular




app.controller('page-exillust-illusts', ($scope) => {
    const fs = node.fs
    const path = node.path
    const db = {
        exillusts: new node.nedb({ filename: path.join(_g.path.db, 'exillusts.nedb'), autoload: true }),
        exillust_types: new node.nedb({ filename: path.join(_g.path.db, 'exillust_types.nedb'), autoload: true })
    }
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

    $scope.init = data => {
        new Promise((resolve, reject) => {
            // 获得文件夹列表
            fs.readdir(_g.path.pics.ships, (err, files) => {
                if (err) {
                    reject(new Error(err))
                } else {
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
            db.exillusts.find({}, (err, docs) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(docs.map(doc => 'extra_' + doc.id))
                }
            });
        })).then(items => new Promise((resolve, reject) => {
            // 比对DB数据和文件夹列表，将DB中缺失的数据写入
            const itemsToInsert = folders.filter(folder => !items.includes(folder))
            console.log(items, itemsToInsert)
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
                    db.exillusts.insert(doc, (err, newDoc) => {
                        // newDoc is the newly inserted document, including its _id
                        // newDoc has no key called notToBeSaved since its value was undefined
                        if (err) {
                            reject(new Error(err))
                        } else {
                            resolve()
                        }
                    });
                }))
            })
            chainInserting = chainInserting.then(() => {
                resolve()
            })
        })).then(() => new Promise((resolve, reject) => {
            // 初始化list
            resolve()
        })).then(() => {
            console.log('ready', $scope.list)
            $scope.ready = true
            $scope.$apply()
        })
    }

    $scope.actions = {
        set: id => {

        }
    }
})