describe('AuthService Test', function() {
    beforeEach(module('m-login'));
    var authService = null;

    it('should contain AuthService', function(){
        inject(function(AuthService){
            expect(AuthService).toBeDefined();
            expect(AuthService).not.toEqual(null);
            authService = AuthService;
        });
    });

    it('should expose a login deferred method', function(){
        expect(typeof authService.login).toEqual('function');
        expect(typeof authService.login({ username: 'user1', password: '123'}).then).toEqual('function');
    });

    it('should expose a signUp deferred method', function(){
        expect(typeof authService.signUp).toEqual('function');
        expect(typeof authService.signUp({ username: 'user1', password: '123', email: 'email@gmail.com'}).then).toEqual('function');
    });

});

describe('SessionService Test', function(){
    beforeEach(module('m-login'));
    var sessionService = null;

    it('should contain SessionService', function(){
        inject(function(SessionService){
            expect(SessionService).toBeDefined();
            expect(SessionService).not.toEqual(null);
            sessionService = SessionService;
        });
    });

    it('should expose the username property', function(){
        expect(sessionService.username).toBeDefined();
    });

    it('should expose the role property', function(){
        expect(sessionService.role).toBeDefined();
    });
});