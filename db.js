const { PrismaClient, Prisma: _Prisma } = require("@prisma/client");
const _PrismaClient = new PrismaClient();

module.exports = {
	_PrismaClient,
	_Prisma,
};
