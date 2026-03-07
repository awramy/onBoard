import { PrismaClient } from '.prisma/client';
import { L } from './helpers';

interface Q {
  id: string;
  topicId: string;
  text: { en: string; ru: string };
  difficulty: number;
  explanation: { en: string; ru: string };
  isDivide?: boolean;
}

async function upsertQuestion(prisma: PrismaClient, q: Q) {
  await prisma.question.upsert({
    where: { id: q.id },
    update: {},
    create: {
      id: q.id,
      topicId: q.topicId,
      text: L(q.text),
      type: q.isDivide ? 'choice' : 'theory',
      difficulty: q.difficulty,
      explanation: L(q.explanation),
      isDivide: q.isDivide ?? false,
    },
  });
}

export async function seedTsQuestions(
  prisma: PrismaClient,
  topics: {
    tsBasicTypes: { id: string };
    tsInterfaces: { id: string };
    tsGenerics: { id: string };
    tsAdvancedTypes: { id: string };
  },
) {
  const { tsBasicTypes, tsInterfaces, tsGenerics, tsAdvancedTypes } = topics;

  // ════════════════════════════════════════
  // TS Junior — Basic Types & Annotations
  // ════════════════════════════════════════
  const basicQuestions: Q[] = [
    {
      id: '30000000-0000-0000-0001-000000000001',
      topicId: tsBasicTypes.id,
      text: {
        en: 'What is the difference between "any" and "unknown" in TypeScript?',
        ru: 'В чём разница между "any" и "unknown" в TypeScript?',
      },
      difficulty: 5,
      explanation: {
        en: '"any" disables type checking entirely. "unknown" is type-safe — you must narrow the type before using the value.',
        ru: '"any" полностью отключает проверку типов. "unknown" типобезопасен — нужно сузить тип перед использованием значения.',
      },
    },
    {
      id: '30000000-0000-0000-0001-000000000002',
      topicId: tsBasicTypes.id,
      text: {
        en: 'Is "void" the same as "undefined" in TypeScript?',
        ru: 'Эквивалентны ли "void" и "undefined" в TypeScript?',
      },
      difficulty: 4,
      explanation: {
        en: 'No. "void" represents the absence of a return value (used for functions). "undefined" is a specific value that a variable can hold.',
        ru: 'Нет. "void" означает отсутствие возвращаемого значения (для функций). "undefined" — конкретное значение, которое может содержать переменная.',
      },
      isDivide: true,
    },
    {
      id: '30000000-0000-0000-0001-000000000003',
      topicId: tsBasicTypes.id,
      text: {
        en: 'What is a tuple type in TypeScript?',
        ru: 'Что такое тип кортежа (tuple) в TypeScript?',
      },
      difficulty: 4,
      explanation: {
        en: 'A tuple is a fixed-length array where each element has a specific type. Example: [string, number] means the first element is string, the second is number.',
        ru: 'Кортеж — массив фиксированной длины, где каждый элемент имеет определённый тип. Пример: [string, number] — первый элемент string, второй number.',
      },
    },
    {
      id: '30000000-0000-0000-0001-000000000004',
      topicId: tsBasicTypes.id,
      text: {
        en: 'What are enums in TypeScript and when should you use them?',
        ru: 'Что такое перечисления (enum) в TypeScript и когда их использовать?',
      },
      difficulty: 5,
      explanation: {
        en: 'Enums define a set of named constants. Use them for fixed sets of related values (status codes, directions). Prefer const enums or union types for simple cases to reduce bundle size.',
        ru: 'Enum определяет набор именованных констант. Используйте для фиксированных наборов связанных значений (статус-коды, направления). Для простых случаев предпочтительны const enum или union-типы для уменьшения размера бандла.',
      },
    },
    {
      id: '30000000-0000-0000-0001-000000000005',
      topicId: tsBasicTypes.id,
      text: {
        en: 'Does TypeScript perform type checking at runtime?',
        ru: 'Выполняет ли TypeScript проверку типов в рантайме?',
      },
      difficulty: 3,
      explanation: {
        en: 'No. TypeScript types are erased at compile time. All type checking happens during compilation only.',
        ru: 'Нет. Типы TypeScript стираются при компиляции. Вся проверка типов происходит только на этапе компиляции.',
      },
      isDivide: true,
    },
    {
      id: '30000000-0000-0000-0001-000000000006',
      topicId: tsBasicTypes.id,
      text: {
        en: 'What is the "never" type used for?',
        ru: 'Для чего используется тип "never"?',
      },
      difficulty: 6,
      explanation: {
        en: '"never" represents values that never occur: functions that always throw, infinite loops, or exhaustive type checks in switch statements.',
        ru: '"never" представляет значения, которые никогда не возникают: функции, всегда бросающие исключения, бесконечные циклы или исчерпывающие проверки типов в switch.',
      },
    },
  ];

  // ════════════════════════════════════════
  // TS Junior — Interfaces & Type Aliases
  // ════════════════════════════════════════
  const ifaceQuestions: Q[] = [
    {
      id: '30000000-0000-0000-0002-000000000001',
      topicId: tsInterfaces.id,
      text: {
        en: 'What is the difference between "type" and "interface" in TypeScript?',
        ru: 'В чём разница между "type" и "interface" в TypeScript?',
      },
      difficulty: 5,
      explanation: {
        en: 'Interfaces support declaration merging and extends. Type aliases support unions, intersections, mapped types, and conditional types. For object shapes, both work; interfaces are preferred by convention for public APIs.',
        ru: 'Интерфейсы поддерживают объединение объявлений и extends. Type alias поддерживают объединения, пересечения, mapped types и условные типы. Для объектных форм подходят оба; интерфейсы предпочтительны по соглашению для публичных API.',
      },
    },
    {
      id: '30000000-0000-0000-0002-000000000002',
      topicId: tsInterfaces.id,
      text: {
        en: 'Can an interface extend multiple interfaces?',
        ru: 'Может ли интерфейс расширять несколько интерфейсов?',
      },
      difficulty: 3,
      explanation: {
        en: 'Yes. interface A extends B, C { } — TypeScript supports multiple interface inheritance.',
        ru: 'Да. interface A extends B, C { } — TypeScript поддерживает множественное наследование интерфейсов.',
      },
      isDivide: true,
    },
    {
      id: '30000000-0000-0000-0002-000000000003',
      topicId: tsInterfaces.id,
      text: {
        en: 'What is a union type and how do you narrow it?',
        ru: 'Что такое union-тип и как его сузить?',
      },
      difficulty: 5,
      explanation: {
        en: 'A union type (A | B) allows a value to be one of several types. Narrow with typeof, instanceof, discriminated unions (literal field), or custom type guards.',
        ru: 'Union-тип (A | B) позволяет значению быть одним из нескольких типов. Сужение через typeof, instanceof, дискриминированные объединения (литеральное поле) или пользовательские type guard.',
      },
    },
    {
      id: '30000000-0000-0000-0002-000000000004',
      topicId: tsInterfaces.id,
      text: {
        en: 'What is an intersection type?',
        ru: 'Что такое тип пересечения (intersection)?',
      },
      difficulty: 5,
      explanation: {
        en: 'An intersection type (A & B) combines multiple types into one. The resulting type has all properties of every constituent type.',
        ru: 'Тип пересечения (A & B) объединяет несколько типов в один. Результирующий тип имеет все свойства каждого составного типа.',
      },
    },
    {
      id: '30000000-0000-0000-0002-000000000005',
      topicId: tsInterfaces.id,
      text: {
        en: 'What is declaration merging for interfaces?',
        ru: 'Что такое объединение объявлений (declaration merging) для интерфейсов?',
      },
      difficulty: 6,
      explanation: {
        en: 'If you declare the same interface name multiple times, TypeScript merges them into a single definition. This is useful for extending third-party type definitions.',
        ru: 'Если объявить интерфейс с одним именем несколько раз, TypeScript объединит их в одно определение. Полезно для расширения сторонних типов.',
      },
    },
  ];

  // ════════════════════════════════════════
  // TS Middle — Generics
  // ════════════════════════════════════════
  const genQuestions: Q[] = [
    {
      id: '30000000-0000-0000-0003-000000000001',
      topicId: tsGenerics.id,
      text: {
        en: 'What are generics in TypeScript and why are they useful?',
        ru: 'Что такое дженерики в TypeScript и зачем они нужны?',
      },
      difficulty: 8,
      explanation: {
        en: 'Generics allow creating reusable components that work with multiple types while preserving type safety. Instead of using "any", you parameterize the type.',
        ru: 'Дженерики позволяют создавать переиспользуемые компоненты, работающие с разными типами, сохраняя типобезопасность. Вместо "any" вы параметризуете тип.',
      },
    },
    {
      id: '30000000-0000-0000-0003-000000000002',
      topicId: tsGenerics.id,
      text: {
        en: 'What is a generic constraint (extends keyword in generics)?',
        ru: 'Что такое ограничение дженерика (extends в дженериках)?',
      },
      difficulty: 10,
      explanation: {
        en: 'Generic constraints limit what types can be passed as a type parameter. Example: <T extends { id: string }> means T must have at least an "id" property of type string.',
        ru: 'Ограничения дженериков ограничивают типы, которые можно передать как параметр типа. Пример: <T extends { id: string }> означает, что T должен иметь хотя бы свойство "id" типа string.',
      },
    },
    {
      id: '30000000-0000-0000-0003-000000000003',
      topicId: tsGenerics.id,
      text: {
        en: 'Can you have default type parameters in generics?',
        ru: 'Можно ли задавать значения по умолчанию для параметров типа в дженериках?',
      },
      difficulty: 8,
      explanation: {
        en: 'Yes. Example: function createArray<T = string>(length: number): T[]. If no type argument is provided, T defaults to string.',
        ru: 'Да. Пример: function createArray<T = string>(length: number): T[]. Если аргумент типа не указан, T по умолчанию будет string.',
      },
      isDivide: true,
    },
    {
      id: '30000000-0000-0000-0003-000000000004',
      topicId: tsGenerics.id,
      text: {
        en: 'Explain the "infer" keyword in conditional types.',
        ru: 'Объясните ключевое слово "infer" в условных типах.',
      },
      difficulty: 14,
      explanation: {
        en: '"infer" allows extracting a type within a conditional type. Example: type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never — it infers the return type R.',
        ru: '"infer" позволяет извлекать тип внутри условного типа. Пример: type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never — извлекает тип возвращаемого значения R.',
      },
    },
    {
      id: '30000000-0000-0000-0003-000000000005',
      topicId: tsGenerics.id,
      text: {
        en: 'What is the difference between <T extends U> and <T = U>?',
        ru: 'В чём разница между <T extends U> и <T = U>?',
      },
      difficulty: 9,
      explanation: {
        en: '"extends U" is a constraint — T must be assignable to U. "= U" is a default — T is U if not explicitly provided, but can be any type.',
        ru: '"extends U" — ограничение: T должен быть совместим с U. "= U" — значение по умолчанию: T будет U, если не указан явно, но может быть любым типом.',
      },
    },
    {
      id: '30000000-0000-0000-0003-000000000006',
      topicId: tsGenerics.id,
      text: {
        en: 'How do you create a generic class in TypeScript?',
        ru: 'Как создать обобщённый (generic) класс в TypeScript?',
      },
      difficulty: 8,
      explanation: {
        en: 'class Container<T> { value: T; constructor(val: T) { this.value = val; } } — the type parameter T is available throughout the class body.',
        ru: 'class Container<T> { value: T; constructor(val: T) { this.value = val; } } — параметр типа T доступен во всём теле класса.',
      },
    },
  ];

  // ════════════════════════════════════════
  // TS Middle — Advanced Type System
  // ════════════════════════════════════════
  const advQuestions: Q[] = [
    {
      id: '30000000-0000-0000-0004-000000000001',
      topicId: tsAdvancedTypes.id,
      text: {
        en: 'What are mapped types in TypeScript?',
        ru: 'Что такое mapped types в TypeScript?',
      },
      difficulty: 12,
      explanation: {
        en: 'Mapped types create new types by transforming properties of an existing type. Example: type Readonly<T> = { readonly [P in keyof T]: T[P] }.',
        ru: 'Mapped types создают новые типы, преобразуя свойства существующего типа. Пример: type Readonly<T> = { readonly [P in keyof T]: T[P] }.',
      },
    },
    {
      id: '30000000-0000-0000-0004-000000000002',
      topicId: tsAdvancedTypes.id,
      text: {
        en: 'What is a type guard and how do you create a custom one?',
        ru: 'Что такое type guard и как создать пользовательский?',
      },
      difficulty: 10,
      explanation: {
        en: 'A type guard narrows a type within a conditional block. Custom type guard: function isString(x: unknown): x is string { return typeof x === "string"; }.',
        ru: 'Type guard сужает тип внутри условного блока. Пользовательский: function isString(x: unknown): x is string { return typeof x === "string"; }.',
      },
    },
    {
      id: '30000000-0000-0000-0004-000000000003',
      topicId: tsAdvancedTypes.id,
      text: {
        en: 'Does Partial<T> make all properties optional?',
        ru: 'Делает ли Partial<T> все свойства опциональными?',
      },
      difficulty: 8,
      explanation: {
        en: 'Yes. Partial<T> constructs a type with all properties of T set to optional. It is implemented as { [P in keyof T]?: T[P] }.',
        ru: 'Да. Partial<T> создаёт тип со всеми свойствами T, установленными как опциональные. Реализация: { [P in keyof T]?: T[P] }.',
      },
      isDivide: true,
    },
    {
      id: '30000000-0000-0000-0004-000000000004',
      topicId: tsAdvancedTypes.id,
      text: {
        en: 'What are template literal types in TypeScript?',
        ru: 'Что такое шаблонные литеральные типы (template literal types) в TypeScript?',
      },
      difficulty: 12,
      explanation: {
        en: 'Template literal types use template string syntax to create string literal types. Example: type EventName = `on${Capitalize<string>}` creates types like "onClick", "onHover", etc.',
        ru: 'Шаблонные литеральные типы используют синтаксис шаблонных строк для создания строковых литеральных типов. Пример: type EventName = `on${Capitalize<string>}` создаёт типы вроде "onClick", "onHover" и т.д.',
      },
    },
    {
      id: '30000000-0000-0000-0004-000000000005',
      topicId: tsAdvancedTypes.id,
      text: {
        en: 'What is the difference between Record<K, V> and a regular index signature?',
        ru: 'В чём разница между Record<K, V> и обычной индексной сигнатурой?',
      },
      difficulty: 9,
      explanation: {
        en: 'Record<K, V> restricts keys to type K (often a union of strings), while an index signature [key: string]: V allows any string key. Record is more precise.',
        ru: 'Record<K, V> ограничивает ключи типом K (часто union строк), тогда как индексная сигнатура [key: string]: V допускает любой строковый ключ. Record точнее.',
      },
    },
    {
      id: '30000000-0000-0000-0004-000000000006',
      topicId: tsAdvancedTypes.id,
      text: {
        en: 'Name 5 built-in utility types in TypeScript.',
        ru: 'Назовите 5 встроенных утилитарных типов в TypeScript.',
      },
      difficulty: 7,
      explanation: {
        en: 'Partial<T>, Required<T>, Readonly<T>, Pick<T, K>, Omit<T, K>. Others include Record, Exclude, Extract, NonNullable, ReturnType, Parameters.',
        ru: 'Partial<T>, Required<T>, Readonly<T>, Pick<T, K>, Omit<T, K>. Также: Record, Exclude, Extract, NonNullable, ReturnType, Parameters.',
      },
    },
  ];

  const allQuestions = [...basicQuestions, ...ifaceQuestions, ...genQuestions, ...advQuestions];
  for (const q of allQuestions) {
    await upsertQuestion(prisma, q);
  }

  console.log(`TS questions: ${allQuestions.length}`);
}
