'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          28-5-2015
 */

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transport = nodemailer.createTransport(smtpTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
}));

/*transport.sendMail({
  from: 'uva@ihatestatistics.com',
  to: 'robin@ihatestatistics.com',
  subject: 'hello world!',
  html: '<html><body><h1>Test</h1></body></html>'
});*/

exports.transport; // jshint ignore:line