import { PrismaClient } from '.prisma/client';
import { L } from './helpers';

export async function seedTechnologies(prisma: PrismaClient) {
  const js = await prisma.technology.upsert({
    where: { name: 'JavaScript' },
    update: {},
    create: {
      name: 'JavaScript',
      description: L({
        en: 'Core web programming language for frontend and backend development',
        ru: 'Основной язык веб-разработки для фронтенда и бэкенда',
      }),
    },
  });

  const ts = await prisma.technology.upsert({
    where: { name: 'TypeScript' },
    update: {},
    create: {
      name: 'TypeScript',
      description: L({
        en: 'Typed superset of JavaScript for building large-scale applications',
        ru: 'Типизированное надмножество JavaScript для создания масштабных приложений',
      }),
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

  const tsMiddle = await prisma.technologyLevel.upsert({
    where: { technologyId_difficulty: { technologyId: ts.id, difficulty: 'middle' } },
    update: {},
    create: { technologyId: ts.id, difficulty: 'middle' },
  });

  console.log(`Technologies: ${js.name}, ${ts.name}`);
  console.log(`Levels: JS(junior, middle), TS(junior, middle)`);

  return { js, ts, jsJunior, jsMiddle, tsJunior, tsMiddle };
}
