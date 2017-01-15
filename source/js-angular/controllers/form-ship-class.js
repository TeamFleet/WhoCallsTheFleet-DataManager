if (!_g) var _g = window._g
if (!_p) var _p = window._p
if (!_db) var _db = window._db
if (!_frame) var _frame = window._frame
if (!app) var app = window.app
if (!angular) var angular = window.angular




app.controller('form-ship-class', function ($scope) {
    $scope.data = {}
    $scope.ready = true

    $scope.init = function (data) {
        Object.assign($scope, data)
        if (!$scope._id && $scope.data._id) {
            $scope._id = $scope.data._id
        } else {
            $scope.ready = false
            _db.ship_classes.find({
                '_id': $scope._id
            }, function (err, docs) {
                $scope.ready = true
                $scope.data = docs[0]
                $scope.$apply()
            })
        }
    }

    $scope.actions = {
        submit: function ($event) {
            console.log('form-ship-class submitting', $scope._id, $scope.data, $event)
            _db.ship_classes.update(
                {
                    '_id': $scope._id
                },
                {
                    $set: $scope.data
                }, {}, function (err, numReplaced) {
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