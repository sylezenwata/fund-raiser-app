const { PrismaClient } = require("@prisma/client");
const bcryptJs = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
	const users = await prisma.users.findMany();
	console.log(users);
}

main()
	.catch((e) => console.log(e))
	.finally(async () => await prisma.$disconnect());
