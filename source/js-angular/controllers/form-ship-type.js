if (!_g) var _g = window._g
if (!_p) var _p = window._p
if (!_db) var _db = window._db
if (!_frame) var _frame = window._frame
if (!app) var app = window.app
if (!angular) var angular = window.angular




app.controller('form-ship-type', function ($scope) {
    /*
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
                _db.ship_classes.find({
                    '_id': $scope._id
                }, function (err, docs) {
                    $scope.data = docs[0]
                    if (!$scope.data.extraSlotExtra) $scope.data.extraSlotExtra = []
                    else $scope.data.extraSlotExtra = $scope.data.extraSlotExtra.map(item => ''+item)
                    resolve()
                })
            }).then(() => new Promise((resolve, reject) => {
                _db.items.find({}).sort({ 'type': 1, 'rarity': 1, 'id': 1 }).exec((err, docs) => {
                    docs.forEach((doc) => {
                        const equipment = new Equipment(doc)
                        const typeId = equipment.type
                        const type = _g.data.item_types[typeId].name.zh_cn

                        if(!this.items[typeId]) this.items[typeId] = [type, []]

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
        addExtraSlotExtra: () => {
            $scope.data.extraSlotExtra.push(null)
        },
        removeExtraSlotExtra: (index) => {
            $scope.data.extraSlotExtra.splice( index, 1 )
        },
        submit: function ($event) {
            let newData = Object.assign({}, $scope.data)

            if (newData.extraSlotExtra && newData.extraSlotExtra.length)
                newData.extraSlotExtra = newData.extraSlotExtra.filter(item => item ? true : false).map(item => parseInt(item))
            if (newData.extraSlotExtra && !newData.extraSlotExtra.length)
                delete newData.extraSlotExtra

            console.log('form-ship-class submitting', $scope._id, newData, $event)
            // return;
            _db.ship_classes.update(
                {
                    '_id': $scope._id
                },
                {
                    $set: newData
                }, {}, function (err, numReplaced) {
                    // btn.html(self.content_ship_type(newdata))
                    _frame.modal.hide()
                }
            );
        }
    }
    */
})