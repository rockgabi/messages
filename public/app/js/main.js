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
                controller: 'MessageController'
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

/**
 * Controller for the message functionality in the wall of the app
 *
 */
app.controller('MessageController', ['$scope', '$http', function($scope, $http){
    $scope.messages = [];
    $scope.recommended = [];
    $scope.invitations = [];

    $http({ method: 'GET', url: '/messages' })  // Hits the messages services from the backend.
        .success(function(messagesResp){
            if (messagesResp.meta.success)
                $scope.messages = messagesResp.data.messages;   // Fill with the messages
            else
                $scope.messages = [];
        })
        .error(function(){
            $scope.messages = [];
        });

    $http({ method: 'GET', url: '/friends/recommended' })    // Fetch the recommended users
        .success(function(recommendedResp){
            if (recommendedResp.meta.success)
                $scope.recommended = recommendedResp.data.users;    // Fill with the recommended users
            else
                $scope.recommended = [];
        })
        .error(function(){
            $scope.recommended = [];
        });

    $http({ method: 'GET', url: '/friends/invitations' })
        .success(function(invitationsResp){
            if (invitationsResp.meta.success)
                $scope.invitations = invitationsResp.data.users;    // Fill with the recommended users
            else
                $scope.invitations = [];
        })
        .error(function(){
            $scope.invitations = [];
        });

    $scope.sendMessage = function() {   // Method for sending a message to the server
        if ($scope.typedMessage !== "" ) {    // Perform only when a messages has been typed
            $scope.loading = true;      // State loading
            $http.post('/messages', { message: $scope.typedMessage }, {})   // Hits the message service in the Backend
                .success(function(sendResponse){
                    $scope.messages.push(sendResponse.data);    // Add to the messages array
                    $scope.loading = false;
                })
                .error(function(sendResponse){
                    console.log('Error', sendResponse);
                    $scope.loading = false;
                });
        }
    };

    $scope.removeMessage = function(messageId) {    // Method for removing a message
        for (var i=0; i<$scope.messages.length; i++) {  // Iterate over messages
            if ($scope.messages[i].id === messageId) {  // Message to remove found
                $scope.messages.splice(i, 1);   // Remove the message
                break;
            }
        }
        $http.delete('/messages/action/' + messageId, { })    // Perform a delete HTTP request for messages providing the id
            .success(function(removeResponse){
                console.log('Success', removeResponse);
            })
            .error(function(removeResponse){
                console.log('Error', removeResponse);
            });
    };

    $scope.sendInvitation = function(id) {
        $http.post('/friends', { id: id }, {})      // By hitting this rest url we send an invitation to the id provided
            .success(function(addFriendResponse){
                console.log('Success', addFriendResponse);
                for (var i=0; i<$scope.recommended.length; i++) {
                    if ($scope.recommended[i].id === id) {
                        $scope.recommended.splice(i, 1);
                        break;
                    }
                }
            })
            .error(function(addFriendResponse){
                console.log('Error', addFriendResponse);
            });
    };

    $scope.acceptInvitation = function(id) {
        $http.post('/friends/accept', { id: id }, {})
            .success(function(acceptFriendResp){
                console.log('Success', acceptFriendResp);
                for (var i=0; i<$scope.invitations.length; i++) {
                    if ($scope.invitations[i].id === id) {
                        $scope.invitations.splice(i, 1);
                        break;
                    }
                }
            })
            .error(function(acceptFriendResp){
                console.log('Error', acceptFriendResp);
            })
    }

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

/**
 * Service in charge of storing the current user in session
 *
 */
login.service('SessionService', [function(){
    this.username = null;
    this.role = null;
    this.user_id = null;
    var create = function(uname, r, uid) {  // Creates the current user in this session
        this.username = uname;
        this.role = r;
        this.user_id = uid;
    };
    var destroy = function() {  // Removes the current user from the Session
        this.username = null;
        this.role = null;
        this.user_id = null;
    };

    return { create: create, destroy: destroy, username: this.username, role: this.role, user_id: this.user_id };
}]);

/**
 * Service in charge of any authentication operation, wires with the Backend Auth services
 *
 */
login.service('AuthService', ['$q', '$timeout', '$http', '$rootScope', 'SessionService', function($q, $timeout, $http, $rootScope, SessionService){

    var login = function(credentials) { // Log in method, returns a promise since it is async
        if (typeof credentials !== 'object') throw new Error('Credentials argument not valid, needs to be an object');  // Credential should be object
        if (!credentials.username || !credentials.password) throw new Error('Credentials argument incomplete, username or password field missing');

        var deferred = $q.defer();
        $http.post('/auth', credentials, {})// Hits the auth service, uses POST since should be secure
            .success(function(loginResp){
                if (loginResp.meta.success) {   // Successful logged in user
                    SessionService.create(loginResp.data.username, loginResp.data.role, loginResp.data.id);
                    $rootScope.$broadcast('UserAuthenticated', { username: SessionService.username, role: SessionService.role });   // Broadcast a message in the Rootscope notifying
                    deferred.resolve({  // Cache the credentials in the Session
                        username: SessionService.username,
                        role: SessionService.role
                    });
                } else {    // Even the HTTP request has been successful, the Auth service from the backend caught an error
                    deferred.reject(loginResp.meta);
                }
            })
            .error(function(loginResp){ // Error in the login service
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