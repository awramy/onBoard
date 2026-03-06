import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const js = await prisma.technology.upsert({
    where: { name: 'JavaScript' },
    update: {},
    create: {
      name: 'JavaScript',
      description: 'Core web programming language for frontend and backend development',
    },
  });

  const ts = await prisma.technology.upsert({
    where: { name: 'TypeScript' },
    update: {},
    create: {
      name: 'TypeScript',
      description: 'Typed superset of JavaScript for building large-scale applications',
    },
  });

  const jsJunior = await prisma.technologyLevel.upsert({
    where: { technologyId_difficulty: { technologyId: js.id, difficulty: 'junior' } },
    update: {},
    create: { technologyId: js.id, difficulty: 'junior' },
  });

  const jsMiddle = await prisma.technologyLevel.upsert({
    where: { technologyId_difficulty: { technologyId: js.id, difficulty: 'middle' } },
    update: {},
    create: { technologyId: js.id, difficulty: 'middle' },
  });

  const tsJunior = await prisma.technologyLevel.upsert({
    where: { technologyId_difficulty: { technologyId: ts.id, difficulty: 'junior' } },
    update: {},
    create: { technologyId: ts.id, difficulty: 'junior' },
  });

  const closures = await prisma.topic.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Closures',
      description: 'Understanding closures and lexical scoping',
    },
  });

  const promises = await prisma.topic.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Promises & Async/Await',
      description: 'Asynchronous programming patterns in JavaScript',
    },
  });

  const types = await prisma.topic.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'TypeScript Types',
      description: 'Basic and advanced type system features',
    },
  });

  await prisma.technologyLevelTopic.upsert({
    where: { technologyLevelId_topicId: { technologyLevelId: jsJunior.id, topicId: closures.id } },
    update: {},
    create: { technologyLevelId: jsJunior.id, topicId: closures.id },
  });

  await prisma.technologyLevelTopic.upsert({
    where: { technologyLevelId_topicId: { technologyLevelId: jsMiddle.id, topicId: promises.id } },
    update: {},
    create: { technologyLevelId: jsMiddle.id, topicId: promises.id },
  });

  await prisma.technologyLevelTopic.upsert({
    where: { technologyLevelId_topicId: { technologyLevelId: tsJunior.id, topicId: types.id } },
    update: {},
    create: { technologyLevelId: tsJunior.id, topicId: types.id },
  });

  await prisma.question.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      topicId: closures.id,
      text: 'What is a closure in JavaScript? Explain with an example.',
      type: 'theory',
      difficulty: 5,
      explanation: 'A closure is a function that retains access to its parent scope variables even after the parent has returned.',
    },
  });

  await prisma.question.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      topicId: promises.id,
      text: 'What is the difference between Promise.all() and Promise.allSettled()?',
      type: 'theory',
      difficulty: 15,
      explanation: 'Promise.all rejects if any promise rejects, while Promise.allSettled waits for all promises to complete.',
    },
  });

  await prisma.question.upsert({
    where: { id: '00000000-0000-0000-0000-000000000012' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000012',
      topicId: types.id,
      text: 'What is the difference between type and interface in TypeScript?',
      type: 'theory',
      difficulty: 8,
      explanation: 'Both define object shapes, but interfaces are extendable and type aliases support union types.',
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Technologies: ${js.name}, ${ts.name}`);
  console.log(`Levels: JS Junior, JS Middle, TS Junior`);
  console.log(`Topics: ${closures.name}, ${promises.name}, ${types.name}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
