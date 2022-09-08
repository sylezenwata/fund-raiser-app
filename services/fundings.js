const { _PrismaClient } = require("../db");
const { formatFilter } = require("../utils/helpers");

const getFundings = async (filter) => {
	try {
		filter = formatFilter(filter, {
			id: {
				k: "equals",
				f: parseInt,
			},
			title: {
				k: "contains",
			},
		});
		const options = {
			orderBy: {
				id: "asc",
			},
			include: {
				creator: true,
				donations: {
					where: {
						blacklisted: false,
					},
				},
			},
			where: {
				blacklisted: false,
				...(filter && { ...filter }),
			},
		};
		const fundings = await _PrismaClient.fundings.findMany(options);
		return fundings;
	} catch (error) {
		throw error;
	}
};

module.exports = {
	getFundings,
};
