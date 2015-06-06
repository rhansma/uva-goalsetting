'use strict';

/* Always load the cronjob controller, else cronjobs are not loaded */
require('./cronjob.server.controller.js');

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		request: req
	});
};