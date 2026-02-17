import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  const locations = [
    { id: 1, name: 'Stari grad' },
    { id: 2, name: 'Savski venac' },
    { id: 3, name: 'Vračar' },
    { id: 4, name: 'Zvezdara' },
    { id: 5, name: 'Novi Beograd' },
    { id: 6, name: 'Palilula' },
    { id: 7, name: 'Čukarica' },
    { id: 8, name: 'Rakovica' },
    { id: 9, name: 'Voždovac' },
    { id: 10, name: 'Zemun' },
    { id: 11, name: 'Barajevo' },
    { id: 12, name: 'Grocka' },
    { id: 13, name: 'Lazarevac' },
    { id: 14, name: 'Mladenovac' },
    { id: 15, name: 'Obrenovac' },
    { id: 16, name: 'Sopot' },
    { id: 17, name: 'Surčin' },
  ];

  for (const location of locations) {
    await prisma.location.create({ data: location });
  }

  const count = await prisma.location.count();
  console.log("Ukupno lokacija:", count);
}

main()
  .catch((e) => {
    console.error("Greška:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
