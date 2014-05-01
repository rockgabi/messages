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

app.controller('AppController', ['$scope', '$rootScope', '$state', 'AuthService', 'USER_ROLES', function($scope, $rootScope, $state, AuthService, USER_ROLES){
    $scope.currentUser = null;
    $scope.authenticated = false;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = AuthService.isAuthorized;

    $rootScope.$on('UserAuthenticated', function(credentials){
        $scope.currentUser = credentials;
        $scope.authenticated = true;
    });

    $rootScope.$on('UserLoggedOut', function(){
        $scope.currentUser = null;
        $scope.authenticated = false;
        $state.go('login');
    });

    $scope.logOut = function() {
        AuthService.logOut();
    }
}]);

app.controller('WallController', ['$scope', '$state', 'AuthService', function($scope, $state, AuthService){
    // if (!AuthService.isLoggedIn()) $state.go('login');   // This is a cross-cutting concern
    $scope.messages = [
        {
            username: 'Gabriel Medina',
            avatar: 'http://debates.coches.net/image.php?u=20837&dateline=1189414879',
            mail: 'a@a.com',
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tincidunt arcu ac mi faucibus porttitor. Curabitur quis libero ullamcorper metus tincidunt laoreet sed in lorem. Sed gravida arcu sed pharetra sollicitudin. Nulla facilisi. Duis risus dui, aliquam vel blandit eget',
            date: new Date()
        },
        {
            username: 'Gabriel Medina',
            avatar: 'http://debates.coches.net/image.php?u=20837&dateline=1189414879',
            mail: 'a@a.com',
            body: 'In pulvinar non odio eget tincidunt. Suspendisse vulputate mauris vitae ante vehicula, lacinia rhoncus sem varius',
            date: new Date()
        },
        {
            username: 'Gabriel Medina',
            avatar: 'http://debates.coches.net/image.php?u=20837&dateline=1189414879',
            mail: 'a@a.com',
            body: 'Donec mauris ligula, congue a egestas quis, volutpat et nulla. In ut lacinia quam. Mauris ultricies arcu non pellentesque imperdiet.',
            date: new Date()
        },
        {
            username: 'Gabriel Medina',
            avatar: 'http://debates.coches.net/image.php?u=20837&dateline=1189414879',
            mail: 'a@a.com',
            body: 'Suspendisse sit amet lorem id sapien sollicitudin placerat. Praesent sagittis quam sed dui cursus porttitor. Mauris accumsan massa a sapien ultrices blandit. Aliquam at lorem nec nibh interdum scelerisque. Aenean adipiscing magna at semper aliquam',
            date: new Date()
        }
    ];
}]);

app.controller('MessageController', ['$scope', function($scope){

}]);

// Set the active nav item in terms of the current $location url. It uses href attribute of the nav items to select the current one
app.directive('navLinks', ['$rootScope', '$location', function($rootScope, $location){
    var directiveDef = {
        restrict: 'A',
        link: function(scope, element, attr) {
            var navLinks = $('li', element),
                currentLink = null;
            setCurrentLink();
            $rootScope.$on('$locationChangeSuccess', function(){    // Listen every location url change, should find the new active to apply class
                setCurrentLink();
            });

            function setCurrentLink() {
                if (currentLink) { currentLink.removeClass('active'); }     // Remove the active class from the previous nav link item
                navLinks.each(function(){     // Iterate over the navLinks to find the next active
                    var $this = $(this);
                    if ($('a', $this).attr('href') === '#' + $location.url()) { // If match with the current location url
                        $this.addClass('active');
                        currentLink = $this;
                        return;     // Can break the loop and return
                    }
                });
            }
        }
    };
    return directiveDef;
}]);

var login = angular.module('m-login', []);

login.service('SessionService', [function(){
    this.username = null;
    this.role = null;
    var create = function(uname, r) {
        this.username = uname;
        this.role = r;
    };
    var destroy = function() {
        this.username = null;
        this.role = null;
    };

    return { create: create, destroy: destroy, username: this.username, role: this.role };
}]);

login.service('AuthService', ['$q', '$timeout', '$http', '$rootScope', 'SessionService', function($q, $timeout, $http, $rootScope, SessionService){

    var login = function(credentials) {
        if (typeof credentials !== 'object') throw new Error('Credentials argument not valid, needs to be an object');
        if (!credentials.username || !credentials.password) throw new Error('Credentials argument incomplete, username or password field missing');

        var deferred = $q.defer();
        $http.post('/auth', credentials, {})
            .success(function(loginResp){
                if (loginResp.meta.success) {   // Successful logged in user
                    SessionService.create(loginResp.data.username, loginResp.data.role);
                    $rootScope.$broadcast('UserAuthenticated', { username: SessionService.username, role: SessionService.role });
                    deferred.resolve({
                        username: SessionService.username,
                        role: SessionService.role
                    });
                } else {
                    deferred.reject(loginResp.meta);
                }
            })
            .error(function(loginResp){
                deferred.reject({ message: 'An error occurred' });
            });

        return deferred.promise;
    };

    var signUp = function(signUpInfo) {
        if (typeof signUpInfo !== 'object') throw new Error('The argument for signing up a user is not an object');
        if (typeof signUpInfo.username !== 'string' || typeof signUpInfo.password !== 'string') { throw new Error('username or password fields are missing from the signup argument ')};
        var deferred = $q.defer();

        $http.post('/register', signUpInfo, {})
            .success(function(registerResp){
                if (registerResp.meta.success) {
                    deferred.resolve({
                        username: registerResp.data.username
                    });
                } else {
                    deferred.reject(registerResp.meta);
                }
            })
            .error(function(registerResp){
                deferred.reject({ message: 'An error occurred' });
            });

        return deferred.promise;
    };

    var credentials = function() {  // Get the current credentials
        if (SessionService.username) return { username: SessionService.username, role: SessionService.role };
        return false;
    };

    var logOut = function() {   // Logs out a user
        SessionService.destroy();
        $rootScope.$broadcast('UserLoggedOut');
    };

    var isAuthorized = function(authorizedRoles) {  // Check against an authorized array of roles if the current user has Authorization
        authorizedRoles = (authorizedRoles.isArray()) ? authorizedRoles : [authorizedRoles];
        return (authorizedRoles.indexOf(role) !== -1);  // Role is in the authorized array
    };

    var isLoggedIn = function() {
        return (typeof SessionService.username === 'string');
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
                //$scope.$emit('UserAuthenticated', $scope.credentials);  // Inform the authentication
                $state.go('wall');
            }
        }, function(errorInfo){
            $scope.loading = false;
            $scope.loginStateClass = 'alert alert-danger';
            $scope.loginMessages = errorInfo.messages;
        });
    };

    $scope.logOut = function() {
        $scope.loading = true;
        AuthService.logOut().then(function(){
            $scope.loading = false;
        }, function(){ $scope.loading = false; });
    };

    if (AuthService.isLoggedIn()) { $state.go('wall'); }
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
                $scope.credentials = {};
            }, function(errorInfo){
                $scope.loading = false;
                $scope.signUpStateClass = 'alert alert-danger';
                $scope.signUpMessages = [errorInfo.message];
            });
        }

    }
}]);