(function() {

    var app = angular.module('app', []);

    app.controller('MainController', MainController);

    MainController.$inject = ['$scope', '$http'];

    function MainController($scope, $http) {
        var main = this;

        $scope.doSort = function(colname) {
            $scope.sortBy = colname;
            $scope.reverse = !$scope.reverse;
        };

        main.init = function() {

            var url = '/api/items';

            $http({
                method: 'GET',
                url: url
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                var data = response.data;
                $scope.items = data;
            }, function errorCallback(response) {
                console.log('error response: ', response);
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        };

        main.init();



    }

})();