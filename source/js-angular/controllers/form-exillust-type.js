app.factory('dbExillustTypesUpdate', () => {
    return {
        update: function () {
            this.timestamp = (new Date()).valueOf()
        },
        timestamp: (new Date()).valueOf()
    }
})

app.controller('form-exillust-type', ($scope, dbExillustTypesUpdate) => {
    // const path = node.path
    // const db = new node.nedb({ filename: path.join(_g.path.db, 'exillust_types.nedb'), autoload: true });
    const onSubmit = () => {
        dbExillustTypesUpdate.update()
        $scope.$apply()
    }

    $scope.data = {}
    $scope.ready = false

    $scope.init = data => {
        if (data && data._id && !data.id) {
            _db.exillust_types.find({ _id: data._id }, (err, docs) => {
                Object.assign($scope.data, docs[0])
                console.log($scope.data)
                $scope.ready = true
                $scope.$apply()
            })
        } else if (data && data._id && data.id) {
            Object.assign($scope.data, data)
            console.log($scope.data)
            $scope.ready = true
            $scope.$apply()
        } else {
            $scope.ready = true
            $scope.$apply()
        }
    }

    $scope.actions = {
        submit: ($event) => {
            let newData = Object.assign({}, $scope.data)
            console.log('form-exillust-type submitting', $scope._id, newData, $event)
            if ($scope.data._id) {
                // 存在 _id，为更新操作
                _db.exillust_types.update(
                    {
                        '_id': $scope.data._id
                    },
                    {
                        $set: newData
                    },
                    {},
                    function (/*err, numReplaced*/) {
                        onSubmit()
                        _frame.modal.hide()
                    }
                );
            } else {
                // 否则为新建操作
                // 获取当前总数，决定 id
                _db.exillust_types.count({}, function (err, count) {
                    newData.id = count + 1
                    newData.sort = newData.id
                    _db.exillust_types.insert(newData, (/*err, newDoc*/) => {
                        onSubmit()
                        _frame.modal.hide()
                    });
                });
            }
        }
    }
})