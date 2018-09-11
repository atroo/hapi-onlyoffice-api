// Load modules

var Boom = require('boom');
var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var nock = require("nock");


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

var apiOptions = {
	protocol: "https",
	host: "onlyoiffceinstallation.tld",
	port: 443,
	userName: "user",
	password: "password"
};

var nockUrl = apiOptions.protocol + "://" + apiOptions.host;
nock.enableNetConnect();

it('should return an array of projects', function (done) {

    var server = new Hapi.Server();
    server.connection();

    server.register({
        register: require('../'),
        options: apiOptions
    }, {
        routes: {
            prefix: "/onlyoffice"
        }
    }, function (err) {

        expect(err).to.not.exist();
        server.start(function () {

            server.inject({
                method: 'GET',
                url: '/onlyoffice/project'
            }, function (res) {
                expect(res.result).to.be.an.array();

                done();
            });
        });
    });
});

it('should return an array of invoices', function (done) {

    var server = new Hapi.Server();
    server.connection();

    server.register({
        register: require('../'),
        options: apiOptions
    }, {
        routes: {
            prefix: "/onlyoffice"
        }
    }, function (err) {

        expect(err).to.not.exist();
        server.start(function () {

            server.inject({
                method: 'GET',
                url: '/onlyoffice/invoice'
            }, function (res) {
                expect(res.result).to.be.an.array();

                done();
            });
        });
    });
});

it('should return an array of jsondata of invoices', function (done) {


    var server = new Hapi.Server();
    server.connection();

    server.register({
        register: require('../'),
        options: apiOptions
    }, {
        routes: {
            prefix: "/onlyoffice"
        }
    }, function (err) {

        expect(err).to.not.exist();
        server.start(function () {

            server.inject({
                method: 'GET',
                url: '/onlyoffice/invoice/jsondata/2059'
            }, function (res) {
                expect(res.result).to.be.an.object();
                done();
            });
        });
    });
});

it('should return an array of tasks for a project', function (done) {

    var server = new Hapi.Server();
    server.connection();

    server.register({
        register: require('../'),
        options: apiOptions
    }, {
        routes: {
            prefix: "/onlyoffice"
        }
    }, function (err) {

        expect(err).to.not.exist();
        server.start(function () {

            server.inject({
                method: 'GET',
                url: '/onlyoffice/project/94209/task'
            }, function (res) {
                expect(res.result).to.be.an.array();

                done();
            });
        });
    });
});

 it('should return an array of times for a project', function (done) {

    var server = new Hapi.Server();
    server.connection();

    server.register({
        register: require('../'),
        options: apiOptions
    }, {
        routes: {
            prefix: "/onlyoffice"
        }
    }, function (err) {

        expect(err).to.not.exist();
        server.start(function () {

            server.inject({
                method: 'GET',
                url: '/onlyoffice/project/time/filter?projectid=94209'
            }, function (res) {

                expect(res.result).to.be.an.array();

                done();
            });
        });
    });
});

it('should return an array of aggregated time data for a project', function(done) {
	var nockOptions = {
		allowUnmocked: true
	};
	nock(nockUrl, nockOptions)
		.get("/api/2.0/project/time/filter.json?projectid=94603&status=2&createdStart=2017-04-01T00:00:00.0000000-00:00&createdStop=2017-04-30T23:59:59.0000000-00:00")

	var server = new Hapi.Server();
	server.connection();

	server.register({
		register: require('../'),
		options: apiOptions
	}, {
		routes: {
			prefix: "/onlyoffice"
		}
	}, function(err) {
		expect(err).to.not.exist();
		server.start(function() {
			var projects = {
				projects: [585357],
				createdStart: "2017-04-01T00:00:00.0000000-00:00",
				createdStop: "2017-04-30T23:59:59.0000000-00:00"
			};

			server.inject({
				method: 'POST',
				url: '/onlyoffice/aggregation/timeByProjectUser',
				payload: JSON.stringify(projects)
			}, function(res) {
				expect(res.result.length).to.equal(2);

				expect(res.result[0].user.id).to.equal("44851dd7-e32f-4d6d-99fc-621469fa1ddd");
				expect(res.result[0].projects[0].tasks.length).to.equal(28);

				var totalTime = 0;
				res.result[0].projects[0].tasks.forEach(function(task) {
					totalTime += task.timeSpent;
				});

				var minutes = totalTime * 60;
				var realTimeMinutes = Math.round(minutes % 60);
				var realTimeHours = Math.floor(minutes / 60);

				expect(realTimeMinutes).to.equal(26);
				expect(realTimeHours).to.equal(60);

				expect(res.result[1].projects[0].tasks.length).to.equal(1);

				expect(res.result).to.be.an.array();
				expect(res.result[0].projects).to.be.an.array();

				done();
			});
		});
	});
});

it('should return an invoice comprising of the invoice, the jsondata and the company information and address', function (done) {
    nock.enableNetConnect();
    
    var server = new Hapi.Server();
    server.connection();

    server.register({
        register: require('../'),
        options: apiOptions
    }, {
        routes: {
            prefix: "/onlyoffice"
        }
    }, function (err) {
        expect(err).to.not.exist();
        server.start(function () {
            server.inject({
                method: 'GET',
                url: '/onlyoffice/aggregation/allInvoiceData?invoiceId=2059'
            }, function (res) {
                expect(res.result).to.be.an.object();
                
                expect(res.result.billingAddress).to.be.an.object();
                expect(res.result.templateInfo).to.be.an.object();

                done();
            });
        });
    });
});

it('should return grouped userdata', function (done) {
	var server = new Hapi.Server();
	server.connection();

	server.register({
		register: require('../'),
		options: apiOptions
	}, {
		routes: {
			prefix: "/onlyoffice"
		}
	}, function (err) {
		expect(err).to.not.exist();
		server.start(function () {
			server.inject({
				method: 'GET',
				url: '/onlyoffice/time/getDayload?startDate=2015-01-15T00-00-00.000%2B01:00&endDate=2015-01-15T23-59-59.999%2B01:00'
			}, function (res) {
				done();
			}, function (e) {
				console.error( e);
			});
		});
	});
});