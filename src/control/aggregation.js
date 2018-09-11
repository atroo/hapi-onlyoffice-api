var Promise = require("promise");
var _ = require("lodash");
var Boom = require("boom");

module.exports = function (server, options) {

    var Control = function () {};

    var public = Control.prototype;

    public.getTimeByProjectUser = function (req, reply) {

        var projects = req.payload.projects;
        var createdStart = req.payload.createdStart;
        var createdStop = req.payload.createdStop;
        var allProjects;

        var result = [];
        var userMap = {};
        var taskMap = {};

        var findProject = function (projectId) {
            var result = null;
            allProjects.forEach(function (project) {
                if (project.id == projectId) {
                    result = _.cloneDeep(project);
                }
            });

            return result;
        };

        server.methods.onlyoffice.get("project.json").then(function (response) {
            allProjects = response.response;
        }).then(function () {
            var reqs = []
            projects.forEach(function (id) {
                reqs.push(server.methods.onlyoffice.get("project/time/filter.json?projectid=" + id + "&status=2&createdStart=" + createdStart + "&createdStop=" + createdStop));
            });


            return Promise.all(reqs).then(function (responses) {
                responses.forEach(function (response) {
                    response.response.forEach(function (time) {
                        
                        var userToUse = time.person || time.createdBy;
                        
                        if (!userMap[userToUse.id]) {
                            userMap[userToUse.id] = {
                                user: userToUse,
                                projects: {}
                            };
                        }

                        if (!userMap[userToUse.id].projects[time.relatedProject]) {
                            userMap[userToUse.id].projects[time.relatedProject] = {
                                tasks: {}
                            };
                        }

                        if (!userMap[userToUse.id].projects[time.relatedProject].tasks[time.relatedTask]) {
                            userMap[userToUse.id].projects[time.relatedProject].tasks[time.relatedTask] = {
                                timeSpent: time.hours,
                                id: time.relatedTask,
                                title: time.relatedTaskTitle
                            };
                        } else {
                            userMap[userToUse.id].projects[time.relatedProject].tasks[time.relatedTask].timeSpent += time.hours;
                        }
                    });

                });
                var userData = {},
                    userProject;
                for (var key in userMap) {
                    userData = {
                        user: userMap[key].user,
                        projects: []
                    };
                    for (var projectKey in userMap[key].projects) {
                        userProject = findProject(projectKey);
                        userProject.tasks = [];
                        for (var taskKey in userMap[key].projects[projectKey].tasks) {
                            userProject.tasks.push(userMap[key].projects[projectKey].tasks[taskKey]);
                        }
                        userData.projects.push(userProject);
                    }
                    result.push(userData);
                }

                reply(result);
            });
        }).catch(function (err) {
            req.log(err);
            reply(err);
        });
    };

    public.getAllInvoiceData = function (req, reply) {
        var invoiceId = req.query.invoiceId;

        var reqs = [];
        reqs.push(server.methods.onlyoffice.get("crm/invoice/" + invoiceId + ".json"));
        reqs.push(server.methods.onlyoffice.get("crm/invoice/jsondata/" + invoiceId + ".json"));

        Promise.all(reqs).then(function (response) {
            var data = response[0].response;
            var jsondata = response[1].response;


            var companyId = data.contact.id;
            server.methods.onlyoffice.get("crm/contact/" + companyId + ".json").then(function (response) {
                var billingAddress;
                response.response.addresses.forEach(function (address) {
                    //3 steht für category rechnung
                    if (address.category === 3) {
                        billingAddress = address;
                    }
                });

                data.billingAddress = billingAddress;
                data.templateInfo = JSON.parse(jsondata);

                reply(data);
            });
        }).catch(function (err) {
            req.log(err);
            reply(Boom.wrap(err));

        });

    };

    return new Control();
};