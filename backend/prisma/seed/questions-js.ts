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

export async function seedJsQuestions(
  prisma: PrismaClient,
  topics: {
    jsVariablesAndTypes: { id: string };
    jsFunctions: { id: string };
    jsAsync: { id: string };
    jsPrototypes: { id: string };
  },
) {
  const { jsVariablesAndTypes, jsFunctions, jsAsync, jsPrototypes } = topics;

  // ════════════════════════════════════════
  // JS Junior — Variables & Data Types
  // ════════════════════════════════════════
  const varQuestions: Q[] = [
    {
      id: '20000000-0000-0000-0001-000000000001',
      topicId: jsVariablesAndTypes.id,
      text: {
        en: 'What is the difference between let, const, and var?',
        ru: 'В чём разница между let, const и var?',
      },
      difficulty: 3,
      explanation: {
        en: 'var is function-scoped and hoisted; let and const are block-scoped. const cannot be reassigned after declaration.',
        ru: 'var имеет функциональную область видимости и всплытие; let и const — блочную. const нельзя переназначить после объявления.',
      },
    },
    {
      id: '20000000-0000-0000-0001-000000000002',
      topicId: jsVariablesAndTypes.id,
      text: {
        en: 'Is typeof null === "object" in JavaScript?',
        ru: 'Верно ли, что typeof null === "object" в JavaScript?',
      },
      difficulty: 4,
      explanation: {
        en: 'Yes. This is a well-known bug in JavaScript since the first version. typeof null returns "object" even though null is not an object.',
        ru: 'Да. Это известная ошибка в JavaScript с первой версии. typeof null возвращает "object", хотя null не является объектом.',
      },
      isDivide: true,
    },
    {
      id: '20000000-0000-0000-0001-000000000003',
      topicId: jsVariablesAndTypes.id,
      text: {
        en: 'What are the primitive data types in JavaScript?',
        ru: 'Какие примитивные типы данных есть в JavaScript?',
      },
      difficulty: 2,
      explanation: {
        en: 'string, number, bigint, boolean, undefined, symbol, and null.',
        ru: 'string, number, bigint, boolean, undefined, symbol и null.',
      },
    },
    {
      id: '20000000-0000-0000-0001-000000000004',
      topicId: jsVariablesAndTypes.id,
      text: {
        en: 'What does the "===" operator do differently from "=="?',
        ru: 'Чем оператор "===" отличается от "=="?',
      },
      difficulty: 3,
      explanation: {
        en: '"===" checks both value and type without coercion, while "==" performs type coercion before comparison.',
        ru: '"===" проверяет и значение, и тип без приведения, а "==" выполняет приведение типов перед сравнением.',
      },
    },
    {
      id: '20000000-0000-0000-0001-000000000005',
      topicId: jsVariablesAndTypes.id,
      text: {
        en: 'Does "0 == false" evaluate to true?',
        ru: 'Верно ли, что "0 == false" вернёт true?',
      },
      difficulty: 4,
      explanation: {
        en: 'Yes. The == operator coerces false to 0, so 0 == 0 is true.',
        ru: 'Да. Оператор == приводит false к 0, поэтому 0 == 0 — true.',
      },
      isDivide: true,
    },
    {
      id: '20000000-0000-0000-0001-000000000006',
      topicId: jsVariablesAndTypes.id,
      text: {
        en: 'What is NaN and how do you check for it?',
        ru: 'Что такое NaN и как его проверить?',
      },
      difficulty: 5,
      explanation: {
        en: 'NaN means "Not a Number". Use Number.isNaN() to check; the global isNaN() coerces its argument first, which can give unexpected results.',
        ru: 'NaN означает «не число». Используйте Number.isNaN(); глобальная isNaN() сначала приводит аргумент, что может дать неожиданные результаты.',
      },
    },
  ];

  // ════════════════════════════════════════
  // JS Junior — Functions & Scope
  // ════════════════════════════════════════
  const funcQuestions: Q[] = [
    {
      id: '20000000-0000-0000-0002-000000000001',
      topicId: jsFunctions.id,
      text: {
        en: 'What is a closure? Explain with an example.',
        ru: 'Что такое замыкание? Объясните на примере.',
      },
      difficulty: 5,
      explanation: {
        en: 'A closure is a function that retains access to variables from its outer (enclosing) scope even after that scope has finished executing.',
        ru: 'Замыкание — это функция, которая сохраняет доступ к переменным из внешней области видимости даже после её завершения.',
      },
    },
    {
      id: '20000000-0000-0000-0002-000000000002',
      topicId: jsFunctions.id,
      text: {
        en: 'Do arrow functions have their own "this" context?',
        ru: 'Имеют ли стрелочные функции собственный контекст "this"?',
      },
      difficulty: 4,
      explanation: {
        en: 'No. Arrow functions lexically bind "this" from the enclosing scope; they do not have their own "this".',
        ru: 'Нет. Стрелочные функции лексически привязывают "this" из окружающей области видимости; у них нет собственного "this".',
      },
      isDivide: true,
    },
    {
      id: '20000000-0000-0000-0002-000000000003',
      topicId: jsFunctions.id,
      text: {
        en: 'What is the difference between function declaration and function expression?',
        ru: 'В чём разница между объявлением функции и функциональным выражением?',
      },
      difficulty: 3,
      explanation: {
        en: 'Function declarations are hoisted (available before the line they are defined), while function expressions are not hoisted.',
        ru: 'Объявления функций всплывают (доступны до строки объявления), а функциональные выражения — нет.',
      },
    },
    {
      id: '20000000-0000-0000-0002-000000000004',
      topicId: jsFunctions.id,
      text: {
        en: 'What is hoisting in JavaScript?',
        ru: 'Что такое hoisting (всплытие) в JavaScript?',
      },
      difficulty: 4,
      explanation: {
        en: 'Hoisting is the behavior where variable and function declarations are moved to the top of their scope during the compilation phase. var declarations are hoisted and initialized to undefined; let/const are hoisted but not initialized (TDZ).',
        ru: 'Hoisting — поведение, при котором объявления переменных и функций поднимаются в начало области видимости на этапе компиляции. var всплывает и инициализируется undefined; let/const всплывают, но не инициализируются (TDZ).',
      },
    },
    {
      id: '20000000-0000-0000-0002-000000000005',
      topicId: jsFunctions.id,
      text: {
        en: 'What are IIFE (Immediately Invoked Function Expressions) and why are they used?',
        ru: 'Что такое IIFE (немедленно вызываемые функциональные выражения) и зачем они используются?',
      },
      difficulty: 5,
      explanation: {
        en: 'IIFE is a function that runs immediately after definition. It creates a private scope, avoiding pollution of the global namespace. Common pattern: (function() { ... })().',
        ru: 'IIFE — функция, которая выполняется сразу после определения. Создаёт приватную область видимости, избегая загрязнения глобального пространства имён. Паттерн: (function() { ... })().',
      },
    },
  ];

  // ════════════════════════════════════════
  // JS Middle — Asynchronous JavaScript
  // ════════════════════════════════════════
  const asyncQuestions: Q[] = [
    {
      id: '20000000-0000-0000-0003-000000000001',
      topicId: jsAsync.id,
      text: {
        en: 'Explain the event loop in JavaScript.',
        ru: 'Объясните event loop в JavaScript.',
      },
      difficulty: 12,
      explanation: {
        en: 'The event loop continuously checks the call stack and task queues. When the stack is empty, it picks the next task from the microtask queue (Promises), then from the macrotask queue (setTimeout, I/O).',
        ru: 'Event loop постоянно проверяет стек вызовов и очереди задач. Когда стек пуст, он берёт следующую задачу из очереди микрозадач (промисы), затем из очереди макрозадач (setTimeout, I/O).',
      },
    },
    {
      id: '20000000-0000-0000-0003-000000000002',
      topicId: jsAsync.id,
      text: {
        en: 'What is the difference between Promise.all() and Promise.allSettled()?',
        ru: 'В чём разница между Promise.all() и Promise.allSettled()?',
      },
      difficulty: 10,
      explanation: {
        en: 'Promise.all rejects immediately if any promise rejects. Promise.allSettled waits for all promises to settle (resolve or reject) and returns their statuses.',
        ru: 'Promise.all отклоняется, если хотя бы один промис отклонён. Promise.allSettled ждёт завершения всех промисов и возвращает их статусы.',
      },
    },
    {
      id: '20000000-0000-0000-0003-000000000003',
      topicId: jsAsync.id,
      text: {
        en: 'Are microtasks processed before macrotasks?',
        ru: 'Обрабатываются ли микрозадачи раньше макрозадач?',
      },
      difficulty: 10,
      explanation: {
        en: 'Yes. After each macrotask, the engine drains the entire microtask queue before picking the next macrotask.',
        ru: 'Да. После каждой макрозадачи движок полностью опустошает очередь микрозадач перед выбором следующей макрозадачи.',
      },
      isDivide: true,
    },
    {
      id: '20000000-0000-0000-0003-000000000004',
      topicId: jsAsync.id,
      text: {
        en: 'What happens if you forget to handle a rejected Promise?',
        ru: 'Что произойдёт, если не обработать отклонённый промис?',
      },
      difficulty: 8,
      explanation: {
        en: 'An unhandled promise rejection event is emitted. In Node.js, since v15 this causes the process to crash by default. In browsers, it logs a warning to the console.',
        ru: 'Генерируется событие unhandled promise rejection. В Node.js (с v15) это по умолчанию завершает процесс. В браузерах — выводит предупреждение в консоль.',
      },
    },
    {
      id: '20000000-0000-0000-0003-000000000005',
      topicId: jsAsync.id,
      text: {
        en: 'What is the difference between async/await and .then() chains?',
        ru: 'В чём разница между async/await и цепочками .then()?',
      },
      difficulty: 8,
      explanation: {
        en: 'Both handle Promises, but async/await provides a synchronous-looking syntax that is easier to read and debug. Under the hood, async/await is syntactic sugar over .then().',
        ru: 'Оба работают с промисами, но async/await предоставляет синхронно-подобный синтаксис, который легче читать и отлаживать. Под капотом async/await — синтаксический сахар над .then().',
      },
    },
    {
      id: '20000000-0000-0000-0003-000000000006',
      topicId: jsAsync.id,
      text: {
        en: 'Does setTimeout with 0ms delay execute immediately?',
        ru: 'Выполнится ли setTimeout с задержкой 0мс немедленно?',
      },
      difficulty: 9,
      explanation: {
        en: 'No. setTimeout(fn, 0) schedules the callback as a macrotask. It will execute only after the current synchronous code and all microtasks have completed.',
        ru: 'Нет. setTimeout(fn, 0) планирует колбэк как макрозадачу. Он выполнится только после текущего синхронного кода и всех микрозадач.',
      },
      isDivide: true,
    },
  ];

  // ════════════════════════════════════════
  // JS Middle — Prototypes & OOP
  // ════════════════════════════════════════
  const protoQuestions: Q[] = [
    {
      id: '20000000-0000-0000-0004-000000000001',
      topicId: jsPrototypes.id,
      text: {
        en: 'What is the prototype chain in JavaScript?',
        ru: 'Что такое цепочка прототипов в JavaScript?',
      },
      difficulty: 10,
      explanation: {
        en: 'Every object has a hidden [[Prototype]] link. When a property is accessed, JS walks up the chain until it finds the property or reaches null.',
        ru: 'Каждый объект имеет скрытую ссылку [[Prototype]]. При обращении к свойству JS поднимается по цепочке, пока не найдёт свойство или не дойдёт до null.',
      },
    },
    {
      id: '20000000-0000-0000-0004-000000000002',
      topicId: jsPrototypes.id,
      text: {
        en: 'What does the "new" keyword do step by step?',
        ru: 'Что делает ключевое слово "new" пошагово?',
      },
      difficulty: 12,
      explanation: {
        en: '1) Creates a new empty object. 2) Sets its [[Prototype]] to the constructor\'s prototype. 3) Calls the constructor with "this" bound to the new object. 4) Returns the object (unless the constructor returns a different object).',
        ru: '1) Создаёт новый пустой объект. 2) Устанавливает его [[Prototype]] на prototype конструктора. 3) Вызывает конструктор с "this", привязанным к новому объекту. 4) Возвращает объект (если конструктор не вернул другой объект).',
      },
    },
    {
      id: '20000000-0000-0000-0004-000000000003',
      topicId: jsPrototypes.id,
      text: {
        en: 'Are ES6 classes syntactic sugar over prototypes?',
        ru: 'Являются ли ES6-классы синтаксическим сахаром над прототипами?',
      },
      difficulty: 8,
      explanation: {
        en: 'Yes. ES6 classes provide cleaner syntax but still use prototypal inheritance under the hood.',
        ru: 'Да. ES6-классы предоставляют более чистый синтаксис, но под капотом по-прежнему используют прототипное наследование.',
      },
      isDivide: true,
    },
    {
      id: '20000000-0000-0000-0004-000000000004',
      topicId: jsPrototypes.id,
      text: {
        en: 'Explain the difference between call(), apply(), and bind().',
        ru: 'Объясните разницу между call(), apply() и bind().',
      },
      difficulty: 10,
      explanation: {
        en: 'call() invokes the function with a given "this" and arguments listed individually. apply() is similar but takes arguments as an array. bind() returns a new function with "this" permanently bound.',
        ru: 'call() вызывает функцию с заданным "this" и аргументами по одному. apply() аналогичен, но принимает аргументы массивом. bind() возвращает новую функцию с навсегда привязанным "this".',
      },
    },
    {
      id: '20000000-0000-0000-0004-000000000005',
      topicId: jsPrototypes.id,
      text: {
        en: 'What is the value of "this" in a method defined with arrow function syntax inside a class?',
        ru: 'Какое значение "this" в методе, определённом стрелочной функцией внутри класса?',
      },
      difficulty: 11,
      explanation: {
        en: 'Arrow functions in class fields capture "this" from the enclosing scope (the constructor), so "this" always refers to the instance, regardless of how the method is called.',
        ru: 'Стрелочные функции в полях класса захватывают "this" из окружающей области (конструктор), поэтому "this" всегда ссылается на экземпляр, независимо от способа вызова метода.',
      },
    },
  ];

  const allQuestions = [...varQuestions, ...funcQuestions, ...asyncQuestions, ...protoQuestions];
  for (const q of allQuestions) {
    await upsertQuestion(prisma, q);
  }

  console.log(`JS questions: ${allQuestions.length}`);
}
