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

app.controller('AppController', ['$scope', 'AuthService', 'USER_ROLES', function($scope, AuthService, USER_ROLES){
    $scope.currentUser = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = AuthService.isAuthorized;
}]);

app.controller('WallController', ['$scope', function($scope){

}]);

var login = angular.module('m-login', []);

login.service('SessionService', [function(){
    var username = null,
        role = null;
    var create = function(uname, r) {
        username = uname;
        role = r;
    };
    var destroy = function() {
        username = null;
        role = null;
    };

    return { create: create, destroy: destroy, username: username, role: role };
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
        if (SessionService.username) return { username: SessionService.username, role: SessionService.role };
        return false;
    };

    var logOut = function() {   // Logs out a user
        SessionService.destroy();
    };

    var isAuthorized = function(authorizedRoles) {  // Check against an authorized array of roles if the current user has Authorization
        authorizedRoles = (authorizedRoles.isArray()) ? authorizedRoles : [authorizedRoles];
        return (authorizedRoles.indexOf(role) !== -1);  // Role is in the authorized array
    };

    var isLoggedIn = function() {
        return (typeof SessionService.username === 'String');
    }

    return {
        login: login,
        credentials: credentials,
        logOut: logOut,
        isAuthorized: isAuthorized,
        isLoggedIn: isLoggedIn
    }
}]);

login.constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
});

login.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})

login.controller('LoginController', ['$scope', '$state', 'AuthService', function($scope, $state, AuthService){
    $scope.login = function(credentials) {
        AuthService.login(credentials).then(function(userCredentials){
            if (userCredentials) {
                $scope.credentials = { username: userCredentials.username, role: userCredentials.role };
                $state.to('wall');
            }
        });
    }
}]);