import { PrismaClient } from '.prisma/client';
import { L } from './helpers';

interface Levels {
  jsJunior: { id: string };
  jsMiddle: { id: string };
  tsJunior: { id: string };
  tsMiddle: { id: string };
}

async function upsertTopic(
  prisma: PrismaClient,
  id: string,
  name: { en: string; ru: string },
  description: { en: string; ru: string },
) {
  return prisma.topic.upsert({
    where: { id },
    update: {},
    create: { id, name: L(name), description: L(description) },
  });
}

async function linkTopicToLevel(
  prisma: PrismaClient,
  technologyLevelId: string,
  topicId: string,
) {
  await prisma.technologyLevelTopic.upsert({
    where: { technologyLevelId_topicId: { technologyLevelId, topicId } },
    update: {},
    create: { technologyLevelId, topicId },
  });
}

export async function seedTopics(prisma: PrismaClient, levels: Levels) {
  // ── JS Junior ──
  const jsVariablesAndTypes = await upsertTopic(prisma,
    '10000000-0000-0000-0000-000000000001',
    { en: 'Variables & Data Types', ru: 'Переменные и типы данных' },
    { en: 'var/let/const, primitive types, type coercion', ru: 'var/let/const, примитивные типы, приведение типов' },
  );

  const jsFunctions = await upsertTopic(prisma,
    '10000000-0000-0000-0000-000000000002',
    { en: 'Functions & Scope', ru: 'Функции и область видимости' },
    { en: 'Function declarations, expressions, arrow functions, closures, scope chain', ru: 'Объявления функций, выражения, стрелочные функции, замыкания, цепочка областей видимости' },
  );

  // ── JS Middle ──
  const jsAsync = await upsertTopic(prisma,
    '10000000-0000-0000-0000-000000000003',
    { en: 'Asynchronous JavaScript', ru: 'Асинхронный JavaScript' },
    { en: 'Event loop, Promises, async/await, microtasks vs macrotasks', ru: 'Event loop, промисы, async/await, микрозадачи vs макрозадачи' },
  );

  const jsPrototypes = await upsertTopic(prisma,
    '10000000-0000-0000-0000-000000000004',
    { en: 'Prototypes & OOP', ru: 'Прототипы и ООП' },
    { en: 'Prototype chain, classes, inheritance, this binding', ru: 'Цепочка прототипов, классы, наследование, привязка this' },
  );

  // ── TS Junior ──
  const tsBasicTypes = await upsertTopic(prisma,
    '10000000-0000-0000-0000-000000000005',
    { en: 'Basic Types & Annotations', ru: 'Базовые типы и аннотации' },
    { en: 'Primitive types, arrays, tuples, enums, type annotations', ru: 'Примитивные типы, массивы, кортежи, перечисления, аннотации типов' },
  );

  const tsInterfaces = await upsertTopic(prisma,
    '10000000-0000-0000-0000-000000000006',
    { en: 'Interfaces & Type Aliases', ru: 'Интерфейсы и псевдонимы типов' },
    { en: 'Interface declarations, extending, type aliases, union and intersection types', ru: 'Объявление интерфейсов, расширение, type alias, объединение и пересечение типов' },
  );

  // ── TS Middle ──
  const tsGenerics = await upsertTopic(prisma,
    '10000000-0000-0000-0000-000000000007',
    { en: 'Generics', ru: 'Дженерики' },
    { en: 'Generic functions, classes, constraints, conditional types', ru: 'Обобщённые функции, классы, ограничения, условные типы' },
  );

  const tsAdvancedTypes = await upsertTopic(prisma,
    '10000000-0000-0000-0000-000000000008',
    { en: 'Advanced Type System', ru: 'Продвинутая система типов' },
    { en: 'Mapped types, template literal types, utility types, type guards', ru: 'Mapped types, шаблонные литеральные типы, утилитарные типы, type guards' },
  );

  // ── Link topics to levels ──
  await linkTopicToLevel(prisma, levels.jsJunior.id, jsVariablesAndTypes.id);
  await linkTopicToLevel(prisma, levels.jsJunior.id, jsFunctions.id);
  await linkTopicToLevel(prisma, levels.jsMiddle.id, jsAsync.id);
  await linkTopicToLevel(prisma, levels.jsMiddle.id, jsPrototypes.id);
  await linkTopicToLevel(prisma, levels.tsJunior.id, tsBasicTypes.id);
  await linkTopicToLevel(prisma, levels.tsJunior.id, tsInterfaces.id);
  await linkTopicToLevel(prisma, levels.tsMiddle.id, tsGenerics.id);
  await linkTopicToLevel(prisma, levels.tsMiddle.id, tsAdvancedTypes.id);

  console.log('Topics: 8 topics linked to 4 levels');

  return {
    jsVariablesAndTypes, jsFunctions, jsAsync, jsPrototypes,
    tsBasicTypes, tsInterfaces, tsGenerics, tsAdvancedTypes,
  };
}
