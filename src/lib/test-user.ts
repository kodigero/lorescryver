import { prisma } from './prisma';

/**
 * Returns the test user, creating one if it doesn't exist.
 * This is a temporary helper until real auth is wired up.
 */
export async function getTestUser() {
  const email = 'test@lorescryver.com';

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Test User',
      },
    });
  }

  return user;
}
