var Cognito = require("nativescript-cognito").Cognito;
var cognito = new Cognito();

describe("greet function", function() {
    it("exists", function() {
        expect(cognito.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(cognito.greet()).toEqual("Hello, NS");
    });
});