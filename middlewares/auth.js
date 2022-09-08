const httpStatus = require("http-status");
const { _PrismaClient } = require("../db");
const ApiError = require("../utils/ApiError");
const moment = require("moment");
const _ = require("lodash");

const _logout = (res) => {
	try {
		res.cookie("sessionAuth", null, {
			maxAge: new Date(0),
			httpOnly: true,
		});
	} catch (error) {
		throw error;
	}
};

const _redirect = (req, res, url = null) => {
	try {
		if (req.headers["x-requested-with"]?.toLowerCase() === "xmlhttpRequest") {
			throw new ApiError(httpStatus.FORBIDDEN, "Session expired");
		}
		res.redirect(url || "/login?returnUrl=" + req.originalUrl);
	} catch (error) {
		throw error;
	}
};

const valSession = (persist) => async (req, res, next) => {
	try {
		const { sessionAuth = null } = req.cookies;
		if (!sessionAuth && !persist) {
			next();
			return;
		}
		if (!sessionAuth && persist) {
			_redirect(req, res);
			return;
		}
		const validToken = await _PrismaClient.tokens.findFirst({
			where: {
				token: sessionAuth,
				blacklisted: false,
			},
			include: {
				owner: true,
			},
		});
		if (!validToken || (validToken?.owner.blacklisted !== false && persist)) {
			_logout(res);
			_redirect(req, res);
			return;
		}
		if (moment().isAfter(validToken.expiresAt, "hours") && persist) {
			await _PrismaClient.tokens.delete({
				where: {
					id: validToken.id,
				},
			});
			_logout(res);
			_redirect(req, res);
			return;
		}
		// _.unset(validToken, "owner.password");
		res.locals.session = validToken;
		next();
	} catch (error) {
		next(error);
	}
};

module.exports = {
	_logout,
	_redirect,
	valSession,
};
