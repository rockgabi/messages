'use strict';

var app = angular.module('app', ['ui.router', 'm-login']);

app.config(['$interpolateProvider', '$urlRouterProvider', '$stateProvider',
    function($interpolateProvider, $urlRouterProvider, $stateProvider) {
        // Interpolate so we don't crash with blade templates
        $interpolateProvider.startSymbol('<%');
        $interpolateProvider.endSymbol('%>');
        // State-based Routing
        $urlRouterProvider.otherwise('/login');
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: '/templates/login.html',
                controller: 'LoginController'
            })
            .state('wall', {
                url: '/wall',
                templateUrl: '/templates/wall.html',
                controller: 'WallController'
            })
}]);

app.controller('AppController', ['$scope', function($scope){

}]);

app.controller('WallController', ['$scope', function($scope){

}]);

var login = angular.module('m-login', []);

login.service('SessionService', [function(){
    this.username = null;
    this.role = null;
    var create = function(username, role) {
        this.username = username;
        this.role = role;
    };
    var destroy = function() {
        this.username = null;
        this.role = null;
    };

    return { create: create, destroy: destroy };
}]);

login.service('AuthService', ['$q', 'SessionService', function($q, SessionService){

    var login = function(credentials) { // Performs the login of a user
        var deferred = $q.defer();
        // Perform server login ...
        SessionService.create(credentials.username, 'user');
        deferred.resolve({
            username: SessionService.username,
            role: SessionService.role
        });

        return deferred.promise;
    };

    var credentials = function() {  // Get the current credentials
        if (username) return { username: username, role: role };
        return false;
    };

    var logOut = function() {   // Logs out a user
        username = null;
        role = null;
    };

    var isAuthorized = function(authorizedRoles) {  // Check against an authorized array of roles if the current user has Authorization
        authorizedRoles = (authorizedRoles.isArray()) ? authorizedRoles : [authorizedRoles];
        return (authorizedRoles.indexOf(role) !== -1);  // Role is in the authorized array
    };

    return {
        login: login,
        credentials: credentials,
        logOut: logOut,
        isAuthorized: isAuthorized
    }
}]);

login.controller('LoginController', ['$scope', '$state', 'Authentication', function($scope, $state, AuthService){
    $scope.login = function(credentials) {
        AuthService.login(credentials).then(function(userCredentials){
            if (userCredentials) {
                $scope.credentials = { username: userCredentials.username, role: userCredentials.role };
                $state.to('wall');
            }
        });
    }
}]);