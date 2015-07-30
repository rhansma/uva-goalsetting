'use strict';

module.exports = {
  port: 3001,
  db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/goalsetting',
  assets: {
    lib: {
      css: [
        'public/lib/font-awesome/css/font-awesome.min.css',
        'public/lib/angular-notify/dist/angular-notify.css',
        'public/lib/ng-tags-input/ng-tags-input.css',
        'public/lib/jquery-ui/themes/base/jquery-ui.css',
        'public/lib/angucomplete/angucomplete.css',
        'public/lib/ngDialog/css/ngDialog.css'
      ],
      js: [
        'public/lib/underscore/underscore.js',
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
        'public/lib/angular-socket-io/socket.js',
        'public/lib/angucomplete/angucomplete.js',
        'public/lib/angular-filter/dist/angular-filter.js',
        'public/lib/ngDialog/js/ngDialog.js',
        'public/lib/ngInfiniteScroll/build/ng-infinite-scroll.js'
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: 'https://localhost:443/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
    callbackURL: 'https://localhost:443/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: 'https://localhost:443/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: 'https://localhost:443/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: 'https://localhost:443/auth/github/callback'
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  }
};