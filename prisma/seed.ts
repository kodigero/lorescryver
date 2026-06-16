import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = 'sha256';

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto
    .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString('base64url');
  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

async function main() {
  console.log('Cleaning up database...');
  await prisma.user.deleteMany({});

  console.log('Seeding user...');
  const passwordHash = hashPassword('password123');
  const user = await prisma.user.create({
    data: {
      email: 'test@lorescryver.com',
      name: 'Test Author',
      passwordHash,
      plan: 'FREE',
    },
  });

  console.log('Seeding Story Foundation project...');
  const foundation = await prisma.project.create({
    data: {
      title: 'My Story Foundation',
      type: 'FOUNDATION',
      status: 'IDEATION',
      wordCountGoal: null,
      userId: user.id,
    },
  });

  console.log('Seeding project sections...');
  await prisma.projectSection.createMany({
    data: [
      {
        projectId: foundation.id,
        key: 'summary.main_characters',
        content: 'Protagonist: Kaizer de Luna, a rogue scryver. Antagonist: Emperor Valerius.',
      },
      {
        projectId: foundation.id,
        key: 'summary.scope',
        content: 'The floating cities of Aethelgard. High fantasy magicpunk era.',
      },
    ],
  });

  console.log('Seeding Delivery project...');
  await prisma.project.create({
    data: {
      title: 'My Novel Adaptation',
      type: 'DELIVERY',
      deliveryFormat: 'NOVEL',
      status: 'IDEATION',
      wordCountGoal: 80000,
      userId: user.id,
      parentId: foundation.id,
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
