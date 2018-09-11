module.exports = function (server, options) {

	var Control = function () {};

	var public = Control.prototype;

	public.getTime = function (req, reply) {

		var id = req.query.projectid;

		server.methods.onlyoffice.get("project/time/filter.json?projectid=" + id).then(function (response) {

			reply(response.response);
		}).catch(function (err) {
			reply(err);
		});
	};

	public.getDayloadForSpan = function (req, reply) {
		var start = req.query.startDate.replace('+', '%2B');
		var end = req.query.endDate.replace('+', '%2B');
		var idToNameMap = {};
		//first get all the projects to have a mapping afterwards
		//atm the gap is always daywise, so lets get everythin inbetween the time intervall
		server.methods.onlyoffice.get("project.json").then(function (response) {
				var allProjects = response.response;
				var project;
				for (var i = 0, len = allProjects.length; i < len; i++) {
					project = allProjects[i];
					idToNameMap[project.id] = project.title;
				}
				return server.methods.onlyoffice.get("project/time/filter.json?createdStart=" + start + "&createdStop=" + end).then(function (response) {
					var userToDayBuckets = {};
					var allTimeBookings = response.response;
					var time;
					for (var i = 0, len = allTimeBookings.length; i < len; i++) {
						time = allTimeBookings[i];
						var groupName = time.person ? time.person.displayName : time.createdBy.displayName;
						userToDayBuckets[groupName] = userToDayBuckets[groupName] || {};
						if (!userToDayBuckets[groupName][time.date]) {
							userToDayBuckets[groupName][time.date] = {};
						}
						var prName = idToNameMap[time.relatedProject];
						if (!userToDayBuckets[groupName][time.date][prName]) {
							userToDayBuckets[groupName][time.date][prName] = 0;
						}
						userToDayBuckets[groupName][time.date][prName] += time.hours;
					}
					return reply(userToDayBuckets);
				});
			})
			.catch(function (err) {
				reply(err);
			});
	};

	return new Control();
};