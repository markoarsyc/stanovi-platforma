import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  const locations = [
    { id: 1, name: 'Barajevo' },
    { id: 2, name: 'Čukarica' },
    { id: 3, name: 'Grocka' },
    { id: 4, name: 'Lazarevac' },
    { id: 5, name: 'Mladenovac' },
    { id: 6, name: 'Novi Beograd' },
    { id: 7, name: 'Obrenovac' },
    { id: 8, name: 'Palilula' },
    { id: 9, name: 'Rakovica' },
    { id: 10, name: 'Savski venac' },
    { id: 11, name: 'Sopot' },
    { id: 12, name: 'Stari grad' },
    { id: 13, name: 'Surčin' },
    { id: 14, name: 'Voždovac' },
    { id: 15, name: 'Vračar' },
    { id: 16, name: 'Zemun' },
    { id: 17, name: 'Zvezdara' },
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
