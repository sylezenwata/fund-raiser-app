const { _PrismaClient } = require("../db");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { stringHashMatch } = require("../utils/helpers");
const uuid4 = require("uuid4");
const moment = require("moment");
const config = require("../config/env");
const { _logout, _redirect } = require("../middlewares/auth");
const bcryptJs = require("bcryptjs");

const createSession = async (userId, reqIp) => {
	const token = uuid4();
	const expires = new Date(
		moment().add(config.token.sessionExpiryHours, "hours")
	);
	if (
		!(await _PrismaClient.tokens.create({
			data: {
				token,
				type: "login_session",
				ownerId: userId,
				reqIp,
				expiresAt: expires,
			},
		}))
	) {
		throw new Error("Internal server error");
	}
	return { token, expires };
};

const login = async (req, res, next) => {
	try {
		const { reqIp } = req.custom;
		const { email, password, returnUrl = null } = req.body;
		const validUser = await _PrismaClient.users.findUnique({
			where: {
				email,
			},
		});
		if (!validUser || !(await stringHashMatch(password, validUser.password))) {
			throw new ApiError(
				httpStatus.UNAUTHORIZED,
				"Incorrect login credentials"
			);
		}
		if (validUser.blacklisted !== false) {
			throw new ApiError(
				httpStatus.FORBIDDEN,
				"Your account has been suspended"
			);
		}
		// set session token
		const { token, expires } = await createSession(validUser.id, reqIp);
		res.cookie("sessionAuth", `${token}`, {
			expires,
			httpOnly: true,
		});
		res.send({ message: "Login was successful...", returnUrl: returnUrl });
	} catch (error) {
		next(error);
	}
};

const signUp = async (req, res, next) => {
	try {
		const { reqIp } = req.custom;
		const {
			firstName,
			lastName,
			email,
			password,
			phone = null,
			gender,
			returnUrl = null,
		} = req.body;
		const salt = await bcryptJs.genSalt(12);
		const hashedPassword = await bcryptJs.hash(password, salt);
		const newUser = await _PrismaClient.users.create({
			data: {
				firstName,
				lastName,
				email,
				phone,
				gender,
				password: hashedPassword,
			},
		});
		if (!newUser) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred processing sign up"
			);
		}
		// set session token
		const { token, expires } = await createSession(newUser.id, reqIp);
		res.cookie("sessionAuth", `${token}`, {
			expires,
			httpOnly: true,
		});
		res
			.status(httpStatus.CREATED)
			.send({ message: "Sign up was successful...", returnUrl });
	} catch (error) {
		next(error);
	}
};

const verify = async (req, res, next) => {
	try {
		const { verificationIdType, verificationIdNumber } = req.body;
		if (
			!(await _PrismaClient.users.update({
				data: {
					verificationIdType,
					verificationIdNumber,
					verificationIdValid: true,
				},
				where: {
					id: res.locals.session.owner.id,
				},
			}))
		) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred processing verification"
			);
		}
		res.send("Your credentials have been verified");
	} catch (error) {
		next(error);
	}
};

const logout = async (req, res, next) => {
	try {
		await _PrismaClient.tokens.delete({
			where: {
				id: res.locals.session.id,
			},
		});
		_logout(res);
		_redirect(req, res, "/");
	} catch (error) {
		res.redirect("/error");
	}
};

module.exports = {
	login,
	signUp,
	verify,
	logout,
};
