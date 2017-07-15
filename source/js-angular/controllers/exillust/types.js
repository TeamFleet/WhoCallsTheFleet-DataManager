app.controller('page-exillust-types', ($scope, dbExillustTypesUpdate) => {
    // const path = node.path
    // const db = new node.nedb({ filename: path.join(_g.path.db, 'exillust_types.nedb'), autoload: true })

    $scope.list = []
    $scope.ready = false
    $scope.updating = false

    $scope.init = (/*data*/) => {
        $scope.updating = true
        new Promise((resolve, reject) => {
            _db.exillust_types.find({}).sort({ sort: 1, id: 1 }).exec((err, docs) => {
                if (err) reject(new Error(err))
                else {
                    $scope.list = docs
                    resolve()
                }
            });
        }).then(() => new Promise((resolve, reject) => {
            resolve()
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
            $scope.init()
        }
    )

    $scope.actions = {
        new: () => {
            _frame.modal.show(
                app.addTemplate('./templates/form-exillust-type.html'),
                '新建图鉴类型'
            )
        },
        edit: item => {
            _frame.modal.show(
                app.addTemplate('./templates/form-exillust-type.html', {
                    _id: item._id
                }),
                '编辑图鉴类型'
            )
        },
        move: (index, direction) => {
            let count = $scope.list.length
            const data = $scope.list[index]
            $scope.updating = true
            $scope.list.splice(index, 1)
            $scope.list.splice(index + direction, 0, data)
            let chainUpdating = new Promise(resolve => resolve())
            $scope.list.forEach((item, index) => {
                chainUpdating = chainUpdating.then(() => new Promise((resolve, reject) => {
                    _db.exillust_types.update(
                        {
                            '_id': item._id
                        },
                        {
                            $set: {
                                sort: index + 1
                            }
                        },
                        {},
                        (err/*, numReplaced*/) => {
                            if (err) reject(new Error(err))
                            else resolve()
                        }
                    )
                }))
            })
            chainUpdating = chainUpdating.then(() => {
                dbExillustTypesUpdate.update()
                $scope.$apply()
            })
        },
        moveup: index => $scope.actions.move(index, -1),
        movedown: index => $scope.actions.move(index, 1)
    }
})