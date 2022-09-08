const fs = require("fs");
const bcryptJs = require("bcryptjs");
const moment = require("moment");

/**
 * Object item getter handler func
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
const objGetter = (object, keys) => {
	return keys.reduce((obj, key) => {
		if (object && Object.prototype.hasOwnProperty.call(object, key)) {
			obj[key] = object[key];
		}
		return obj;
	}, {});
};

/**
 * unwanted obj item remover handler func
 * @param {Object} object
 * @param {String[]} keys
 * @returns {Object}
 */
const objSelective = (object, keys) => {
	return keys.reduce((obj, key) => {
		if (Object.prototype.hasOwnProperty.call(object, key)) delete obj[key];
		return obj;
	}, object);
};

/**
 * string match against hash handler func
 * @param {String} string
 * @param {String} hash
 * @returns {bool}
 */
const stringHashMatch = async (string, hash) => {
	return bcryptJs.compareSync(string, hash);
};

/**
 * set ip to locals handler func
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const setCustomProps = (req, res, next) => {
	// define custom instance
	req.custom = {};
	// pass req ip prop
	req.custom.reqIp =
		req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
	next();
};

// data to exempt from displaying to client side
const dataValuesToExempt = ["password", "black_listed", "role"];

/**
 * function to write file to storage
 * @param {String} file
 * @param {String|Buffer} data
 * @returns {Promise}
 */
fs.saveFileAsync = (file, data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, (err) => {
			if (err) return reject(err);
			resolve();
		});
	});
};

const parseBool = (value) => {
	try {
		switch (value.toString().toLowerCase()) {
			case "false":
				value = false;
				break;
			case "true":
				value = true;
				break;
			case "null":
				value = null;
				break;
			default:
				break;
		}
		return value;
	} catch (error) {
		throw error;
	}
};

const formatDate = (date) => {
	return moment(date).format("YYYY-MM-DD h:mm:ss a");
};

const formatFilter = (str, format = null) => {
	if ("string" !== typeof str) {
		return null;
	}
	return str
		.split(",")
		.map((e) => e.split("=")[0].toLowerCase() + "=" + e.split("=")[1])
		.map((e) =>
			/\-/.test(e)
				? e
						.split("-")
						.map((e, i) =>
							i > 0 ? e.slice(0, 1).toUpperCase() + e.slice(1) : e
						)
						.join("")
				: e
		)
		.reduce((obj, item) => {
			const [key, value] = item.split("=").map((e) => e.toString().trim());
			if (format && Object.keys(format).filter((e) => e === key)[0]) {
				const fKey = format[key].k;
				const fFunc = format[key].f || ((arg) => arg);
				obj[key] = {};
				obj[key][fKey] = parseBool(fFunc(value));
			} else {
				obj[key] = parseBool(value);
			}
			return obj;
		}, {});
};

const formatNumber = (number, currency = "₦") => {
	number = parseInt(number);
	var p = number.toFixed(2).split(".");
	p = p[0]
		.split("")
		.reverse()
		.reduce((acc, num, i, orig) => {
			return num === "_" ? acc : num + (i && !(i % 3) ? "," : "") + acc;
		}, ""); //+ "." + p[1]
	return currency ? currency + " " + p : p;
};

module.exports = {
	objGetter,
	objSelective,
	stringHashMatch,
	setCustomProps,
	dataValuesToExempt,
	fs,
	parseBool,
	formatDate,
	formatFilter,
	formatNumber,
};
