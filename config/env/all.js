'use strict';

module.exports = {
	app: {
		title: 'GoalSetting',
		description: 'yes',
		keywords: 'MongoDB, Express, AngularJS, Node.js'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
        'public/lib/font-awesome/css/font-awesome.min.css',
        'public/lib/angular-notify/dist/angular-notify.css',
        'public/lib/ng-tags-input/ng-tags-input.css',
        'public/lib/jquery-ui/themes/base/jquery-ui.css'
			],
			js: [
        'public/lib/jquery/dist/jquery.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/moment/moment.js',
        'public/lib/angular-moment/angular-moment.js',
        'public/lib/moment-timezone/build/moment-timezone-with-data.js',
        'public/lib/modernizr/modernizr.js',
        'public/lib/foundation/js/foundation.js',
        'public/lib/foundation/js/foundation/foundation.topbar.js',
        'public/lib/ngDraggable/ngDraggable.js',
        'public/lib/angular-notify/dist/angular-notify.js',
        'public/lib/ng-tags-input/ng-tags-input.js',
        'public/lib/Chart.js/Chart.js',
        'public/lib/angular-chart.js/dist/angular-chart.js',
        'public/lib/jquery-ui/jquery-ui.js',
        'public/lib/angular-socket-io/socket.js'
			]
		},
		css: [
			'public/modules/**/css/*.css',
      'public/css/foundation.css',
      'public/lib/angular-ui-select/dist/select.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};