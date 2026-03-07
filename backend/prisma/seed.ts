import 'dotenv/config';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedTechnologies } from './seed/technologies';
import { seedTopics } from './seed/topics';
import { seedJsQuestions } from './seed/questions-js';
import { seedTsQuestions } from './seed/questions-ts';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const techs = await seedTechnologies(prisma);
  const topics = await seedTopics(prisma, techs);
  await seedJsQuestions(prisma, topics);
  await seedTsQuestions(prisma, topics);
  console.log('\nSeed completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
