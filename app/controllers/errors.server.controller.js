'use strict';

var winston = require('winston');

/**
 * Instantiate winston for logging, catch uncaught exceptions
 */
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      filename: 'error.log',
      level: 'error'
    }),
    new (winston.transports.File)({
      filename: 'info.log',
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'exceptions-log',
      filename: 'exceptions.log',
      handleExceptions: true
    })
  ],
  exitOnError: false
});

/* Write log with timestamp */
function _log(err, type) {
  switch (type) {
    case 'error':
      logger.error(err, {timestamp: new Date()});
      break;
    case 'info':
    default:
      logger.info(err, {timestamp: new Date()});
      break;
  }
}

/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function(err) {
	var output;

	try {
		var fieldName = err.err.substring(err.err.lastIndexOf('.$') + 2, err.err.lastIndexOf('_1'));
		output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

	} catch (ex) {
		output = 'Unique field already exists';
	}

	return output;
};

/**
 * Get the error message from error object
 */
exports.getErrorMessage = function(err) {
	var message = '';

  /* Log error */
  _log(err, 'error');

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = getUniqueErrorMessage(err);
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

exports.log = function(err, type) {
  type = typeof type !== 'undefined' ? a : 'error';

  _log(err, type);
};