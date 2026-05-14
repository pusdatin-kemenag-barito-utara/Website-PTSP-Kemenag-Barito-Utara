const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
BigInt.prototype.toJSON = function() { return this.toString() };

async function main() {
  const req = await prisma.service_requests.findFirst({
    where: { request_number: 'PTSP-2026-000001' },
    include: { generated_documents: true }
  });
  console.log(JSON.stringify(req.generated_documents, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
