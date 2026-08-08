import "./loadEnv.js";
import { prisma } from "./db/client.js";
import { hashPassword } from "./lib/hashPassword.js";

/**
 * Bootstraps the very first Owner account, plus a restaurant they own, so
 * someone can log in straight into a working dashboard and create everyone
 * else via POST /users. Safe to re-run — each step is a no-op if it already
 * exists.
 */
async function main() {
  const email = "owner@restaurant.test";
  let owner = await prisma.user.findUnique({ where: { email } });

  if (!owner) {
    const passwordHash = await hashPassword("Owner123!");
    owner = await prisma.user.create({
      data: {
        name: "Restaurant Owner",
        email,
        passwordHash,
        roles: { create: [{ role: "OWNER" }] },
        locations: { create: [] },
      },
    });
    console.log(`Seeded owner account: ${email} / Owner123!`);
  } else {
    console.log(`Seed skipped — ${email} already exists.`);
  }

  let restaurant = await prisma.restaurant.findFirst({ where: { ownerUserId: owner.id } });
  if (!restaurant) {
    restaurant = await prisma.restaurant.create({ data: { name: "Main Restaurant", ownerUserId: owner.id } });
    console.log(`Seeded restaurant: ${restaurant.name} (${restaurant.id})`);
  } else {
    console.log(`Seed skipped — ${owner.email} already owns a restaurant (${restaurant.id}).`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
