const dotenv = require("dotenv");
const path = require("path");

// load .env
dotenv.config({ path: path.join(__dirname, "../.env") });

// env vars
const envVars = process.env;

// export env vars
module.exports = {
	env: "development",
	port: envVars.PORT,
	token: {
		sessionExpiryHours: envVars.SESSION_EXPIRY_HOURS,
		resetPasswordExpiryMinutes: envVars.RESET_PASSWORD_EXPIRY_MINUTES,
		verifyEmailExpiryMinutes: envVars.VERIFY_EMAIL_EXPIRY_MINUTES,
	},
	email: {
		smtp: {
			host: envVars.SMTP_HOST,
			port: envVars.SMTP_PORT,
			auth: {
				user: envVars.SMTP_USERNAME,
				pass: envVars.SMTP_PASSWORD,
			},
		},
		info: envVars.INFO_EMAIL,
		support: envVars.SUPPORT_EMAIL,
	},
	appName: envVars.APP_NAME,
	appShortName: envVars.APP_SHORT_NAME,
	orgAddress: envVars.ORG_ADDRESS,
	appVersion: envVars.APP_VERSION,
};
