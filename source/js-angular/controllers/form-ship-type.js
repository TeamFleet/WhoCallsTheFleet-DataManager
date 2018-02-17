app.controller('form-ship-type', function ($scope) {
    $scope.data = {}
    $scope.ready = true

    $scope.items = []
    // $scope.newExtraSlotExtra

    $scope.init = function (data) {
        Object.assign($scope, data)
        if (!$scope._id && $scope.data._id) {
            $scope._id = $scope.data._id
        } else {
            $scope.ready = false
            new Promise((resolve, reject) => {
                _db.ship_types.find({
                    '_id': $scope._id
                }, function (err, docs) {
                    if (err) return reject(err)
                    $scope.data = docs[0]
                    resolve()
                })
            }).then(() => new Promise((resolve, reject) => {
                _db.items
                    .find({})
                    .sort({ 'type': 1, 'rarity': 1, 'id': 1 })
                    .exec((err, docs) => {
                        if (err) return reject(err)
                        docs.forEach((doc) => {
                            const equipment = new Equipment(doc)
                            const typeId = equipment.type
                            const type = _g.data.item_types[typeId].name.zh_cn

                            if (!this.items[typeId]) this.items[typeId] = [type, []]

                            this.items[typeId][1].push(equipment)
                        })
                        resolve()
                    })
            })).then(() => {
                console.log($scope.data)
                $scope.ready = true
                $scope.$apply()
            })
        }
    }

    $scope.actions = {
        submit: function ($event) {
            let newData = Object.assign({}, $scope.data)
            const unset = {}

            { // 能力
                let count = 0
                for (const key in newData.capabilities) {
                    const value = newData.capabilities[key]
                    if (value === 'on' || value === 'true')
                        newData.capabilities[key] = true
                    if (value !== undefined && value !== null && value !== '') {
                        count++
                    } else {
                        delete newData.capabilities[key]
                        unset[`capabilities.${key}`] = true
                    }
                    if (value === false)
                        delete newData.capabilities[key]
                    else
                        count++
                }
                if (!count) {
                    delete newData.capabilities
                    unset.capabilities = true
                }
            }

            console.log('form-ship-type submitting', $scope._id, newData, $event)
            // return;
            _db.ship_types.update(
                {
                    '_id': $scope._id
                },
                {
                    $set: newData,
                    $unset: unset,
                }, {}, function (/*err, numReplaced*/) {
                    // btn.html(self.content_ship_type(newdata))
                    _frame.modal.hide()
                }
            );
        }
    }
})
