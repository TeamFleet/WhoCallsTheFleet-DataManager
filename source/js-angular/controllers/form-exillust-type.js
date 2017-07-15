if (!_g) var _g = window._g
if (!_p) var _p = window._p
if (!_db) var _db = window._db
if (!_frame) var _frame = window._frame
if (!app) var app = window.app
if (!angular) var angular = window.angular




app.controller('form-exillust-type', function ($scope) {
    $scope.data = {}
    $scope.ready = true

    $scope.init = function (data) {
        Object.assign($scope, data)
        if (!$scope._id && $scope.data._id) {
            $scope._id = $scope.data._id
        } else {
            $scope.ready = false
            new Promise((resolve, reject) => {
                resolve()
            }).then(() => {
                console.log($scope.data)
                $scope.ready = true
                $scope.$apply()
            })
        }
    }

    $scope.actions = {
        submit: function ($event) {
            let newData = Object.assign({}, $scope.data)

            console.log('form-exillust-type submitting', $scope._id, newData, $event)
            // return;
            _db.ship_exillust_types.update(
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
})