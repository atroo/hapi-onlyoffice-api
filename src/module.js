var Promise = require("promise");
var joi = require("joi");

var project = require("./control/project");
var invoice = require("./control/invoice");
var task = require("./control/task");
var time = require("./control/time");
var aggregation = require("./control/aggregation");

var reqService = require("./service/requestService");

exports.register = function (server, options, next) {

    var initErr;

    var spec = joi.object().keys({
        protocol: joi.string().required(),
        host: joi.string().required(),
        port: joi.number().integer().min(1).max(70000),
        userName: joi.string().required().description("the username required to access the api"),
        password: joi.string().required().description("the password required to access the api")
    });

    spec.validate(options, function (err, value) {
        if (err) {
            initErr = err;
        }
    });

    var RequestService = new reqService(server, options);
    
    var Project = new project(server, options);
    var Invoice = new invoice(server, options);
    var Task = new task(server, options);
    var Time = new time(server, options);
    var Aggregation = new aggregation(server, options);

    server.method("onlyoffice.get", RequestService.get);
    
    
    server.route([{
        method: "GET",
        path: "/project",
        handler: Project.get,
        config: {}
    }, {
        method: "GET",
        path: "/invoice",
        handler: Invoice.getInvoices,
        config: {}
    }, {
        method: "GET",
        path: "/invoice/{invoiceId}",
        handler: Invoice.getInvoiceById,
        config: {}
    }, {
        method: "GET",
        path: "/invoice/jsondata/{invoiceId}",
        handler: Invoice.getInvoiceJsondataById,
        config: {}
    }, {
        method: "GET",
        path: "/project/{projectId}/task",
        handler: Task.getTasks,
        config: {}
    }, {
        method: "GET",
        path: "/project/time/filter",
        handler: Time.getTime,
        config: {}
    },{
        method: "GET",
        path: "/time/getDayload",
        handler: Time.getDayloadForSpan,
        config: {}
    }, {
        method: "POST",
        path: "/aggregation/timeByProjectUser",
        handler: Aggregation.getTimeByProjectUser,
        config: {
            payload: {
                parse: true,
                output: 'data'
            },
            validate: {
                payload: joi.object().keys({
                    projects: joi.array().required(),
                    createdStart: joi.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).required().description("start date constraint in format 2008-04-10T06:30:00"),
                    createdStop: joi.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).required().description("stop date constraint in format 2008-04-10T06:30:00.0000000-07:00")
                })
            }
        }
    }, {
        method: "GET",
        path: "/aggregation/allInvoiceData",
        handler: Aggregation.getAllInvoiceData,
        config: {
            validate: {
                query: joi.object().keys({
                    invoiceId: joi.number().integer().required()          
                })
            }
        }
    }]);

    next(initErr);
};

exports.register.attributes = {
    pkg: require('../package.json')
};