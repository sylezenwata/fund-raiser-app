/**
 * Server entry file
 */

// modules
const app = require("./app");
const config = require("./config/env");

// exit handler func
function exitHandler() {
	if (server) {
		server.close(() => {
			console.info("Server closed");
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
}

// unexpected handler func
function unexpectedErrorHandler(error) {
	console.error(error);
	exitHandler();
}

// node process runtime errors
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
process.on("SIGTERM", () => {
	console.info("SIGTERM received");
	if (server) {
		server.close();
	}
});

// verify db connection and start server
const server = app.listen(config.port, () => {
	console.info(`Listening to port ${config.port}`);
});
