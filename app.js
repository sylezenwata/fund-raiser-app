/**
 * App instance file
 */

const express = require("express");
const cors = require("cors");
const httpStatus = require("http-status");
const cookieParser = require("cookie-parser");
const path = require("path");

const routes = require("./routes");
const ApiError = require("./utils/ApiError");
const { errorConverter, errorHandler } = require("./middlewares/error");
const { setCustomProps } = require("./utils/helpers");

// run express
const app = express();

// view engine
app.set("view engine", "ejs");

// cookie use
app.use(cookieParser());

// parse json request body
app.use(express.json());

// cors
app.use(cors());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// static files
app.use(
	"/node_modules",
	express.static(path.join(__dirname, "node_modules"), {
		maxAge: "31536000",
		etag: false,
	})
);
app.use(
	express.static(path.join(__dirname, "public"), {
		maxAge: "31536000",
		etag: false,
	})
);

// set ip
app.use(setCustomProps);

// v1 api routes
app.use(routes);

// send back a 404 error for any unknown api request
app.use((req, res) => {
	res.status(httpStatus.NOT_FOUND).send(`<div style="text-align: center;">Link not found</div>`);
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// export app
module.exports = app;
