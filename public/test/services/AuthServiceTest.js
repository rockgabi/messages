describe('AuthService Test', function() {
    beforeEach(module('m-login'));

    it('should contain AuthService', function(){
        inject(function(AuthService){
            expect(AuthService).toBeDefined();
            expect(AuthService).not.toEqual(null);
        });
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