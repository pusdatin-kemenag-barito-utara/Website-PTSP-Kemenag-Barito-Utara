import prisma from "./lib/prisma";

async function main() {
  console.log("Models in prisma:", Object.keys(prisma).filter(k => !k.startsWith("$") && !k.startsWith("_")));
}

main();
