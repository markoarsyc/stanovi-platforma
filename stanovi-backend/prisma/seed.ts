import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function seedLocations() {
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
    await prisma.location.upsert({
      where: { id: location.id },
      update: {
        name: location.name,
      },
      create: {
        id: location.id,
        name: location.name,
      },
    });
  }

  const count = await prisma.location.count();

  console.log(`Uspešno seedovane lokacije. Ukupno lokacija: ${count}`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email && !password) {
    console.warn(
      'ADMIN_EMAIL i ADMIN_PASSWORD nisu postavljeni. Administrator nije kreiran.',
    );
    return;
  }

  if (!email || !password) {
    throw new Error(
      'Moraju biti postavljene obe promenljive: ADMIN_EMAIL i ADMIN_PASSWORD.',
    );
  }

  if (password.length < 12) {
    throw new Error(
      'ADMIN_PASSWORD mora sadržati najmanje 12 karaktera.',
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    if (existingUser.role !== Role.ADMIN) {
      throw new Error(
        `Korisnik sa email adresom ${email} već postoji, ali nema ADMIN ulogu.`,
      );
    }

    console.log(`Administrator ${email} već postoji.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`Administrator ${email} je uspešno kreiran.`);
}

async function main() {
  console.log('Pokretanje seedovanja baze...');

  await seedLocations();
  await seedAdmin();

  console.log('Seedovanje baze je uspešno završeno.');
}

main()
  .catch((error: unknown) => {
    console.error('Greška prilikom seedovanja baze:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });