const ejs = require("ejs");
const nodeMailer = require("nodemailer");
const path = require("path");
const {
	email: { smtp },
} = require("../config/config");

const tempPath = path.join(__dirname, "..", `/templates`);

const mailer = async (message) => {
	const transporter = nodeMailer.createTransport({
		pool: true,
		host: smtp.host,
		port: smtp.port,
		secure: false,
		auth: {
			user: smtp.auth.user,
			pass: smtp.auth.pass,
		},
		tls: {
			rejectUnauthorized: false,
		},
	});
	return await transporter.sendMail(message);
};

const mailSender = async (config, data, tempFile) => {
	try {
		const { to, from, subject, replyTo = null } = config;
		let temp = await ejs.renderFile(`${tempPath}/${tempFile}`, data, {
			async: true,
		});
		const message = {
			to,
			from,
			subject,
			replyTo,
			html: temp,
		};
		return await mailer(message);
	} catch (error) {
		// TODO: Change response error
		throw error;
	}
};

module.exports = {
	mailSender,
};
