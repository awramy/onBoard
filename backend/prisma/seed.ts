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
      description: { en: 'Core web programming language', ru: 'Основной язык веб-разработки' },
    },
  });

  const ts = await prisma.technology.upsert({
    where: { name: 'TypeScript' },
    update: {},
    create: {
      name: 'TypeScript',
      description: { en: 'Typed superset of JavaScript', ru: 'Типизированное надмножество JavaScript' },
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
      name: { en: 'Closures', ru: 'Замыкания' },
      description: { en: 'Understanding closures and lexical scoping', ru: 'Понимание замыканий и лексической области видимости' },
    },
  });

  const promises = await prisma.topic.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: { en: 'Promises & Async/Await', ru: 'Промисы и Async/Await' },
      description: { en: 'Asynchronous programming patterns', ru: 'Паттерны асинхронного программирования' },
    },
  });

  const types = await prisma.topic.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: { en: 'TypeScript Types', ru: 'Типы TypeScript' },
      description: { en: 'Basic and advanced type system features', ru: 'Базовые и продвинутые возможности системы типов' },
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
      text: { en: 'What is a closure in JavaScript? Explain with an example.', ru: 'Что такое замыкание в JavaScript? Объясните на примере.' },
      type: 'theory',
      difficulty: 5,
      explanation: { en: 'A closure is a function that retains access to its parent scope variables even after the parent has returned.', ru: 'Замыкание — это функция, сохраняющая доступ к переменным родительской области видимости после завершения работы родителя.' },
    },
  });

  await prisma.question.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      topicId: closures.id,
      text: { en: 'How do closures relate to the event loop?', ru: 'Как замыкания связаны с Event Loop?' },
      type: 'theory',
      difficulty: 15,
      explanation: { en: 'Closures capture variables at the time of creation, maintaining references through async callbacks in the event loop.', ru: 'Замыкания захватывают переменные в момент создания, сохраняя ссылки через асинхронные колбеки в event loop.' },
    },
  });

  await prisma.question.upsert({
    where: { id: '00000000-0000-0000-0000-000000000012' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000012',
      topicId: promises.id,
      text: { en: 'What is the difference between Promise.all() and Promise.allSettled()?', ru: 'В чём разница между Promise.all() и Promise.allSettled()?' },
      type: 'theory',
      difficulty: 15,
      explanation: { en: 'Promise.all rejects if any promise rejects, while Promise.allSettled waits for all promises to settle.', ru: 'Promise.all отклоняется при отклонении любого промиса, а Promise.allSettled ждёт завершения всех промисов.' },
    },
  });

  await prisma.question.upsert({
    where: { id: '00000000-0000-0000-0000-000000000013' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000013',
      topicId: types.id,
      text: { en: 'What is the difference between type and interface in TypeScript?', ru: 'В чём разница между type и interface в TypeScript?' },
      type: 'theory',
      difficulty: 8,
      explanation: { en: 'Both define object shapes, but interfaces are extendable and type aliases support union types.', ru: 'Оба описывают формы объектов, но интерфейсы расширяемы, а type alias поддерживают union-типы.' },
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Technologies: ${js.name}, ${ts.name}`);
  console.log(`Levels: JS Junior, JS Middle, TS Junior`);
  console.log(`Topics: Closures, Promises, Types`);
  console.log(`Questions: 4 total`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
