const express = require("express");
const { valSession } = require("../middlewares/auth");
const config = require("../config/env");
const { getFundings } = require("../services/fundings");
const authController = require("../controller/auth");
const fundingsController = require("../controller/fundings");
const { _PrismaClient } = require("../db");
const multer = require("multer");
const { formatNumber } = require("../utils/helpers");

const router = express.Router();
const multerUpload = multer();

// home
router.get("/", valSession(false), async (req, res, next) => {
	try {
		const { filter = null } = req.query;
		const newfilter = (filter ? `title=${filter},` : "") + "closed=false";
		const fundings = await getFundings(newfilter);
		const data = {
			appName: config.appName,
			appShortName: config.appShortName,
			head: {
				title: `${config.appName}`,
			},
			user: res.locals.session?.owner || null,
			filter,
			fundings,
		};
		res.render("index.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});

// <== Auth ==>
// login page
router.get("/login", valSession(false), async (req, res, next) => {
	try {
		const { returnUrl = null } = req.query;
		if (res.locals.session) {
			res.redirect(returnUrl || "/");
			return;
		}
		const data = {
			appName: config.appName,
			appShortName: config.appShortName,
			head: {
				title: `Login | ${config.appName}`,
			},
			returnUrl,
		};
		res.render("login.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});

// login
router.post("/login", authController.login);

// sign up page
router.get("/signUp", valSession(false), async (req, res, next) => {
	try {
		const { returnUrl = null } = req.query;
		if (res.locals.session) {
			res.redirect(returnUrl || "/");
			return;
		}
		const data = {
			appName: config.appName,
			appShortName: config.appShortName,
			head: {
				title: `Sign up | ${config.appName}`,
			},
			returnUrl,
		};
		res.render("signup.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});

// sign up
router.post("/signUp", authController.signUp);

// user dashboard
// router.get("/dashboard", valSession(true), async (req, res, next) => {
// 	try {
// 		const user = await _PrismaClient.users.findUnique({
// 			where: {
// 				id: res.locals.session.owner.id,
// 			},
// 			include: {
// 				fundings: {
// 					where: {
// 						blacklisted: false,
// 					},
// 				},
// 				donations: {
// 					where: {
// 						blacklisted: false,
// 					},
// 				},
// 			},
// 		});
// 		const data = {
// 			appName: config.appName,
// 			appShortName: config.appShortName,
// 			head: {
// 				title: `Dashboard | ${config.appName}`,
// 			},
// 			user,
// 		};
// 		res.render("dashboard.ejs", { data });
// 	} catch (error) {
// 		console.log(error);
// 		res.redirect("/error");
// 	}
// });

// verify id
router.post("/verify", valSession(true), authController.verify);

// logout
router.get("/logout", valSession(true), authController.logout);

// <== funding ==>
// create funding page
router.get("/create", valSession(true), async (req, res, next) => {
	try {
		const data = {
			appName: config.appName,
			appShortName: config.appShortName,
			head: {
				title: `Create funding | ${config.appName}`,
			},
			user: res.locals.session.owner,
		};
		if (res.locals.session.owner.verificationIdValid !== true) {
			data.head.title = `Verify account | ${config.appName}`;
			res.render("verify.ejs", { data });
			return;
		}
		res.render("create.ejs", { data });
	} catch (error) {
		console.log(error);
		res.redirect("/error");
	}
});

// create funding
router.post(
	"/create",
	valSession(true),
	multerUpload.any(),
	fundingsController.create
);

// close funding
router.patch("/:fundingId/close", valSession(true), fundingsController.close);

// view a funding
router.get(
	"/fundings/:fundingId",
	valSession(false),
	async (req, res, next) => {
		try {
			const { fundingId } = req.params;
			let filter = `closed=false,id=${fundingId}`;
			const funding = await getFundings(filter);
			if (!funding || funding?.length <= 0) {
				const errorData = {
					head: {
						title: `Not found | ${config.appName}`,
					},
					body: {
						message: "This Funding is no longer available",
					},
				};
				res.render("error.ejs", { data: errorData });
				return;
			}
			const data = {
				appName: config.appName,
				appShortName: config.appShortName,
				head: {
					title: `${funding[0].title} | ${config.appName}`,
				},
				user: res.locals.session?.owner || null,
				funding: funding[0],
				formatCurrency: formatNumber,
			};
			res.render("funding.ejs", { data });
		} catch (error) {
			console.log(error);
			res.redirect("/error");
		}
	}
);

// donate
router.post("/:fundingId/donate", valSession(false), fundingsController.donate);

// <== error ==>
// error
router.get("/error", async (req, res) => {
	const data = {
		head: {
			title: `Error | ${config.appName}`,
		},
		body: {
			message: "Internal server error",
		},
	};
	res.render("error.ejs", { data });
});

module.exports = router;
