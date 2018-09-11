module.exports = function (server, options) {

    var Control = function () {};

    var public = Control.prototype;

    public.getInvoices = function (req, reply) {
        server.methods.onlyoffice.get("crm/invoice/filter.json").then(function(response) {
            reply(response.response);
        }).catch(function(err) {
            reply(err);
        });

    };
    
    public.getInvoiceById = function (req, reply) {
        server.methods.onlyoffice.get("crm/invoice/filter.json").then(function(response) {
            reply(response.response);
        }).catch(function(err) {
            reply(err);
        });

    };
    
    public.getInvoiceJsondataById = function (req, reply) {
        server.methods.onlyoffice.get("crm/invoice/jsondata/"+req.params.invoiceId+".json").then(function(response) {
            reply(JSON.parse(response.response));
        }).catch(function(err) {
            reply(err);
        });

    };

    return new Control();
};