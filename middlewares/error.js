const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const config = require('../config/env');

// function to convert error
const errorConverter = (error, req, res, next) => {
	// let error = err;
	if (error.errors) {
		let _err = error.errors[0];
		error.message = _err.message;
		if (_err.type === "unique violation") {
			error.message = `${_err.path} "${_err.value}" already exists`;
		}
	}
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, error.stack);
  }
	next(error);
};

// function to handle error
const errorHandler = (err, req, res, next) => {
	let { statusCode, message } = err;
  // if (config.env === 'production' && !err.isOperational) {
  //   statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  //   message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  // }
  res.locals.errorMessage = err.message;
  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };
  if (config.env === 'development') {
    console.error(err);
  }
  // send response
  res.status(statusCode).send(response);
};

module.exports = {
	errorConverter,
	errorHandler,
};
