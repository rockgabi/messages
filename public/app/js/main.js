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
            .state('signup', {
                url: '/signup',
                templateUrl: '/templates/signup.html',
                controller: 'SignUpController'
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

login.service('AuthService', ['$q', '$timeout', 'SessionService', function($q, $timeout, SessionService){

    var login = function(credentials) { // Performs the login of a user
        if (typeof credentials !== 'object') throw new Error('Credentials argument not valid, needs to be an object');
        if (!credentials.username || !credentials.password) throw new Error('Credentials argument incomplete, username or password field missing');
        var deferred = $q.defer();
        // Perform server login ...
        $timeout(function(){
            var successLoginResp = {
                    meta: {
                        success: true,
                        code: 700,      // 700 Identity authenticated in the server
                        message: 'Identity successfully authenticated'
                    },
                    data: {
                        username: credentials.username,
                        role: 'user'
                    }
                },
                errorLoginResp = {
                    meta: {
                        success: false,     // A descriptive label for the operation result
                        code: 600,      // 600: User does not exists
                        message: 'The user does not exists'     // A message that came from the server
                    },
                    data: {
                        username: credentials.username
                    }
                },
                loginResp = errorLoginResp; // Select which dummy response Ill use right now
            if (loginResp.meta.success) {   // Successful logged in user
                SessionService.create(loginResp.data.username, loginResp.data.role);
                deferred.resolve({
                    username: SessionService.username,
                    role: SessionService.role
                });
            } else {
                deferred.reject(loginResp.meta);
            }
        }, 1000);

        return deferred.promise;
    };

    var signUp = function(signUpInfo) {
        if (typeof signUpInfo !== 'object') throw new Error('The argument for signing up a user is not an object');
        if (typeof signUpInfo.username !== 'string' || typeof signUpInfo.password !== 'string') { throw new Error('username or password fields are missing from the signup argument ')};
        var deferred = $q.defer();

        $timeout(function(){
            var successSignUpResp = {
                    meta: {
                        success: true,
                        code: 710,      // 710 User registered correctly
                        message: 'The user has been successfully registered'
                    },
                    data: {
                        username: credentials.username
                    }
                },
                errorSignUpResp = {
                    meta: {
                        success: false,     // A descriptive label for the operation result
                        code: 610,      // 600: Username already exists
                        message: 'The username already exists'     // A message that came from the server
                    },
                    data: {
                        username: credentials.username
                    }
                },
                signUpResp = successSignUpResp; // Select which dummy response Ill use right now
            if (signUpResp.meta.success) {
                deferred.resolve();
            } else {
                deferred.reject(signUpResp.meta);
            }
        }, 1000);

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
    };

    return {
        login: login,
        signUp: signUp,
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
});

login.controller('LoginController', ['$scope', '$state', 'AuthService', function($scope, $state, AuthService){
    $scope.loginMessages = [];
    $scope.loginStateClass = 'pristine';
    $scope.loading = false;
    $scope.login = function(credentials) {
        $scope.loading = true;
        AuthService.login(credentials).then(function(userCredentials){
            $scope.loading = false;
            if (userCredentials) {
                $scope.credentials = { username: userCredentials.username, role: userCredentials.role };
                $state.to('wall');
            }
        }, function(errorInfo){
            $scope.loading = false;
            $scope.loginStateClass = 'alert alert-danger';
            $scope.loginMessages = [errorInfo.message];
        });
    }
}]);

login.controller('SignUpController', ['$scope', '$state', 'AuthService', function($scope, $state, AuthService){
    $scope.signUpMessages = [];
    $scope.signUpStateClass = 'pristine';
    $scope.loading = false;
    $scope.signUp = function(credentials) {
        if (credentials.password !== credentials.passwordRep ) {
            $scope.signUpStateClass = 'alert alert-danger';
            $scope.signUpMessages = ['Password fields don\'t match'];
        } else {
            $scope.loading = true;
            AuthService.signUp(credentials).then(function(){
                $scope.loading = false;
                $scope.signUpStateClass = 'alert alert-success';
                $scope.signUpMessages = ['Your account has been registered'];
            }, function(errorInfo){
                $scope.loading = false;
                $scope.signUpStateClass = 'alert alert-danger';
                $scope.signUpMessages = [errorInfo.message];
            });
        }

    }
}]);