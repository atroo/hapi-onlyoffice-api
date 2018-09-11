module.exports = function (server, options) {

    var url = options.protocol + "://" + options.host + "/api/2.0/";

    var Control = function () {};

    var public = Control.prototype;

    public.get = function (req, reply) {
        server.methods.onlyoffice.get("project.json").then(function (response) {
            reply(response.response);
        }).catch(function (err) {
            reply(err);
        });
    };

    return new Control();
};