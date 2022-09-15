const httpStatus = require("http-status");
const { _PrismaClient } = require("../db");
const ApiError = require("../utils/ApiError");
const path = require("path");
const { fs } = require("../utils/helpers");

const userUploadPath = path.join(__dirname, "..", `/public/images/uploads`);

const donate = async (req, res, next) => {
	try {
		const { fundingId } = req.params;
		// note: this is a simulation, so we won't be making use of the card details
		const {
			amount,
			remark = null,
			donor = null,
			cardNumber,
			cardExpiry,
			cardCVV,
		} = req.body;
		const getFunding = await _PrismaClient.fundings.findFirst({
			where: {
				id: parseInt(fundingId),
				closed: false,
				blacklisted: false,
			},
		});
		if (!getFunding) {
			throw new ApiError(
				httpStatus.UNAUTHORIZED,
				"This funding is no longer available"
			);
		}
		let optionalData = null;
		if (donor) {
			const getDonor = await _PrismaClient.users.findUnique({
				where: {
					email: donor,
				},
			});
			if (!getDonor || getDonor?.blacklisted === true) {
				throw new ApiError(
					httpStatus.UNAUTHORIZED,
					"Donor does not exist or has been banned"
				);
			}
			optionalData = {
				donorEmail: getDonor.email,
			};
		}
		if (
			!(await _PrismaClient.donations.create({
				data: {
					remark,
					fundingId: getFunding.id,
					amount,
					...(optionalData && optionalData),
				},
			}))
		) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred processing donation"
			);
		}
		res
			.status(httpStatus.CREATED)
			.send(`Your donation of ${amount} was successful`);
	} catch (error) {
		next(error);
	}
};

const create = async (req, res, next) => {
	try {
		const creatorId = res.locals.session.owner.id;
		const { title, description, accountNumber, bankName } = req.body;
		// process image
		const image = req.files[0];
		const fileName = `${Date.now()}.${image.mimetype.split("/")[1]}`;
		const fileLocation = `${userUploadPath}/${fileName}`;
		await fs.saveFileAsync(fileLocation, image.buffer);
		if (
			!(await _PrismaClient.fundings.create({
				data: {
					title,
					description,
					image: fileName,
					accountNumber,
					bankName,
					creatorId,
				},
			}))
		) {
			fs.unlink(fileLocation, () => {});
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred creating funding"
			);
		}
		res.send("Funding was successfully created");
	} catch (error) {
		next(error);
	}
};

const close = async (req, res, next) => {
	try {
		const { fundingId } = req.params;
		// bank transaction will be simulated
		const getFunding = await _PrismaClient.fundings.findFirst({
			where: {
				id: parseInt(fundingId),
				creatorId: res.locals.session.owner.id,
				closed: false,
				moneySent: false,
				blacklisted: false,
			},
			include: {
				donations: {
					where: {
						blacklisted: false,
					},
				},
			},
		});
		if (!getFunding) {
			throw new ApiError(
				httpStatus.UNAUTHORIZED,
				"This funding is no longer available"
			);
		}
		const donations = getFunding.donations;
		if (
			!(await _PrismaClient.fundings.update({
				where: {
					id: parseInt(fundingId),
				},
				data: {
					closed: true,
					moneySent: true,
				},
			}))
		) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"An error occurred processing funding closure"
			);
		}
		let amount = 0;
		if (donations?.length > 0) {
			amount = donations.reduce((init, item) => {
				init += parseInt(item.amount);
				return init;
			}, 0);
		}
		res.send(
			amount > 0
				? `We have transferred a total amount of NGN ${amount} to the bank account associated with this campaign. Thanks`
				: `There was no donation`
		);
	} catch (error) {
		next(error);
	}
};

module.exports = {
	donate,
	create,
	close,
};
