var request = require("request");
var Promise = require("promise");

module.exports = function (server, options) {

    var url = options.protocol + "://" + options.host + "/api/2.0/";
    
    var Control = function () {};

    var sessionToken;
    var authenticate = function() {
        return new Promise(function(onResolve, onReject) {
            request({
                uri: url+ "authentication",
                method: "post",
                body: {
                    userName: options.userName,
                    password: options.password
                },
                json: true
            }, function(error, response, body) {
                if(error) {
                    return onReject(error);
                }
                
                
                if(response.statusCode == 500) {
                    return onReject(new Error("Invalid credentials"));
                }
                
                sessionToken = body.response.token;
                onResolve();
            }); 
        })
    };
    
    var public = Control.prototype;

    public.get = function (what) {
        var doIt = function(onResolve, onReject) {
            request({
                headers: {
                    "Authorization": sessionToken
                },
                uri: url+ what,
                method: "get",
                json: true
            }, function(error, response, body) {
                if(error) {
                    onReject(error);
                }
                
                if(response.statusCode == 401) {
                    authenticate();
                }
                onResolve(body);
            });
            
        };
        
        if(!sessionToken) {
            return authenticate().then(function() {
                return new Promise(doIt);
            });
        }
        else {
            return new Promise(doIt);
        }
    };

    return new Control();
};