angular.module('app', ['ngRoute']).config(function($routeProvider, $locationProvider){
    $routeProvider
        .when('/', {
            templateUrl: './partials/dashboard',
            controller: 'DashboardCtrl'
        })
        .when('/users', {
            templateUrl: './partials/users',
            controller: 'UserCtrl'
        })
        .when('/user/create', {
            templateUrl: './partials/addUser',
            controller: 'UserCtrl'
        })
        .when('/login', {
            templateUrl: './public/login'
        })
        .otherwise({
            templateUrl: './partials/404'
        });

    $locationProvider.html5Mode(true);
});
angular.module('app').controller('DashboardCtrl', function($scope){
    $scope.message = 'Working!!!';
});
angular.module('app').controller('UserCtrl', function($scope, $location, UserService, Reporter){
    $scope.users = null;
    $scope.user = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 0
    };
    // Pagination
    $scope.page = 1;
    // TODO: dynamically load this
    $scope.lastPage = 2;

    $scope.rowDisplayRules = function(role){
        var classes = ['clickable', 'blue-background', 'red-background'];
        return classes[role];
    };

    $scope.getUsers = function(){
        UserService.getUsers($scope.page, function(response){
            if(response){
                $scope.users = response;
            } else {
                Reporter.error.server();
            }
        });
    };

    // DELETE
    $scope.deleteUser = function(index){
        UserService.deleteUser($scope.users[index]._id, function(){
            $scope.users.splice(index, 1);
        });
    };
    $scope.promptUserDelete = function(index){
        Reporter.prompt.choice({
            title: 'Are you sure?',
            text: 'Are you sure you want to delete user "'+$scope.users[index].email+'"?'
        }, function(){
            $scope.deleteUser(index);
        });
    };

    $scope.addUser = function(){
        UserService.addUser($scope.user, function(User){
            if(User){
                $scope.user = null;
                $location.path('/users');
            }
        });
    };
    $scope.search = function(input){
        if(input && input.length > 0){
            UserService.search(input, function(userData){
                $scope.users = userData;
            });
        } else {
            $scope.getUsers();
        }
    };
    $scope.toggleRole = function(){
        if($scope.user.role && $scope.user.role === 1){
            $scope.user.role = 0;
        } else {
            $scope.user.role = 1;
        }
    };

    // Pagination
    $scope.goToPage = function(page){
        $scope.page = page;
        $scope.getUsers();
    };
    $scope.previousPage = function(){
        if($scope.page > 1){
            $scope.page--;
            $scope.getUsers();
        }
    };
    $scope.nextPage = function(){
        if($scope.page < $scope.lastPage){
            $scope.page++;
            $scope.getUsers();
        }
    };
});
angular.module('app').filter('MomentParse', function(){
    return function(date){
        if(date && moment(date, 'X').isValid()){
            return moment(date, 'X').format('Do MMMM YYYY');
        } else if(!date) {
            return 'Not available';
        } else {
            return date;
        }
    };
});
angular.module('app').filter('RoleFilter', function(){
    return function(role){
        var roleNames = {
            0: 'user',
            1: 'admin',
            2: 'master'
        };

        return roleNames[role] ? roleNames[role] : 'none';
    };
});
angular.module('app').factory('Reporter', function(){
    return {
        error: {
            server: function(){
                swal({
                    title: 'Server error!',
                    text: 'Unfortunately your request could not be processed by our server. Please try again.',
                    type: 'error',
                    animation: 'slide-from-top',
                    confirmButtonText: 'Damn!'
                });
            },
            authorization: function(){
                swal({
                    title: 'Not Authorized!',
                    text: 'Unfortunately you are not authorized to so this.',
                    type: 'error',
                    animation: 'slide-from-top',
                    confirmButtonText: 'You are right :('
                });
            }
        },
        prompt: {
            choice: function(message, callback){
                swal({
                    title: message.title,
                    text: message.text,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#D9534F",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false
                }, callback);
            }
        },
        notification: {
            success: function(message){
                swal({
                    title: "Good job!",
                    text: message,
                    type: "success"
                });
            }
        }
    };
});
angular.module('app').factory('UserService', function($http, Reporter){
    return {
        getUsers: function(page, callback){
            $http.get('/api/users/'+page)
                .success(function(users){
                    callback(users);
                })
                .error(function(){
                    callback(null);
                });
        },
        deleteUser: function(userId, callback){
            $http.delete('/api/user/' + userId)
                .success(function(){
                    Reporter.notification.success('The user has been successfully deleted');
                    callback();
                })
                .error(function(data, responseCode){
                    if(responseCode === 401){
                        Reporter.error.authorization();
                    } else {
                        Reporter.error.server();
                    }
                });
        },
        addUser: function(User, callback){
            $http.post('/api/user', User)
                .success(function(User){
                    callback(User);
                    Reporter.notification.success('The user has been successfully added');
                })
                .error(function(data, responseCode){
                    callback();
                    if(responseCode === 401){
                        Reporter.error.authorization();
                    } else {
                        Reporter.error.server();
                    }
                });
        },
        search: function(data, callback){
            $http.get('/api/user/search/'+data)
                .success(function(user){
                    callback(user);
                })
                .error(function(){
                    Reporter.error.server();
                });
        }
    };
});