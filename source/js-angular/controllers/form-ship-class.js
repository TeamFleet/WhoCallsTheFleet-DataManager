app.controller('form-ship-class', function ($scope) {
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
                    if (err) return reject(err)
                    $scope.data = docs[0]
                    if (!$scope.data.extraSlotExtra) $scope.data.extraSlotExtra = []
                    else $scope.data.extraSlotExtra = $scope.data.extraSlotExtra.map(item => '' + item)
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
        addExtraSlotExtra: () => {
            $scope.data.extraSlotExtra.push(null)
        },
        removeExtraSlotExtra: (index) => {
            $scope.data.extraSlotExtra.splice(index, 1)
        },
        submit: function ($event) {
            let newData = Object.assign({}, $scope.data)
            const unset = {}

            if (newData.extraSlotExtra && newData.extraSlotExtra.length)
                newData.extraSlotExtra = newData.extraSlotExtra.filter(item => item ? true : false).map(item => parseInt(item))
            if (newData.extraSlotExtra && !newData.extraSlotExtra.length)
                delete newData.extraSlotExtra

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

            console.log('form-ship-class submitting', $scope._id, newData, $event)
            // return;
            _db.ship_classes.update(
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
            // var _dom = $('<form class="ship_type loading"/>').on('submit', function (e) {
            //     e.preventDefault()
            //     if (!$(this).hasClass('submitting') && !$(this).hasClass('loading')) {
            //         $(this).addClass('submitting')
            //         var newdata = $(this).serializeObject()
            //         _db.ship_types.update({
            //             '_id': d['_id']
            //         }, {
            //                 $set: newdata
            //             }, {}, function (err, numReplaced) {
            //                 btn.html(self.content_ship_type(newdata))
            //                 _frame.modal.hide()
            //             });
            //     }
            // })
            // _db.ship_types.find({
            //     '_id': d['_id']
            // }, function (err, docs) {
            //     if (!err) {
            //         var _data = docs[0]
            //         var id = self.field_input_text('id', 'ID', _data['id']).appendTo(_dom)
            //         id.find('input').prop('readonly', true)
            //         self.field_input_text('code', '舰种简称', _data['code']).appendTo(_dom)
            //         self.field_input_text('code_game', '舰种简称 (游戏中)', _data['code_game']).appendTo(_dom)
            //         self.field_input_text('full', '舰种全称', _data['full']).appendTo(_dom)
            //         self.field_input_text('full_game', '舰种全称 (游戏中)', _data['full_game']).appendTo(_dom)
            //         self.field_input_text('full_zh', '舰种全称 (中文)', _data['full_zh']).appendTo(_dom)
            //         var input_id = '_input_g' + _g.inputIndex
            //         _g.inputIndex++
            //         $('<input type="checkbox" name="donotcompare" id="' + input_id + '">')
            //             .prop('checked', _data['donotcompare'])
            //             .appendTo(_dom)
            //         $('<label for="' + input_id + '"/>').html('不参与属性表对比').appendTo(_dom)
            //         self.field_actions('更新', function () {
            //             // 删除操作
            //             _db.ship_types.remove({ _id: d['_id'] }, {}, function (err, numRemoved) {
            //                 btn.remove()
            //                 if (self.dom.ship_class[d._id])
            //                     self.dom.ship_class[d._id].remove()
            //                 _frame.modal.hide()
            //             });
            //         }).appendTo(_dom)
            //         _dom.removeClass('loading')
            //     }
            // })
        }
    }
})
