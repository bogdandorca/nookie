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