const noiseLevels = [
  37, 52, 68, 73, 81, 62, 44, 87, 55, 64, 70, -3,
  59, 66, 67, 136, 49, 88, 72, 61, 84, 93, 46, 58
];

const warningLevel = 68;
const criticalLevel = 84;
const minValidLevel = 30;
const maxValidLevel = 130;

const formatLevel = level => `${level} dB`;
const isAbove = (level, threshold) => level > threshold;

function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}

function calculateAverage(data, min, max) {
  let sum = 0;
  let validCount = 0;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }

    sum += level;
    validCount += 1;
  }

  return validCount === 0 ? null : sum / validCount;
}

function findMinimum(data, min, max) {
  let minimum = null;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }

    if (minimum === null || level < minimum) {
      minimum = level;
    }
  }

  return minimum;
}

function findMaximum(data, min, max) {
  let maximum = null;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }

    if (maximum === null || level > maximum) {
      maximum = level;
    }
  }

  return maximum;
}

function analyzeCategories(data, categoryAnalyzer, warning, critical, min, max) {
  return categoryAnalyzer(
    data,
    warning,
    critical,
    min,
    max
  );
}

const categoryCounter = function (data, warning, critical, min, max) {
  const counts = {
    valid: 0,
    invalid: 0,
    safe: 0,
    warning: 0,
    critical: 0
  };

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      counts.invalid += 1;
      continue;
    }

    counts.valid += 1;

    if (isAbove(level, critical)) {
      counts.critical += 1;
    } else if (isAbove(level, warning)) {
      counts.warning += 1;
    } else {
      counts.safe += 1;
    }
  }

  return counts;
};

const hoistingCheck = findFirstCritical(
  noiseLevels,
  criticalLevel,
  minValidLevel,
  maxValidLevel
);

function findFirstCritical(data, critical, min, max) {
  let result = null;

  for (let index = 0; index < data.length; index += 1) {
    const level = data[index];

    if (isValidLevel(level, min, max) && isAbove(level, critical)) {
      result = { level, position: index + 1 };
      break;
    }
  }

  return result;
}

function findRecovery(data, firstCritical, warning, min, max) {
  if (firstCritical === null) {
    return null;
  }

  let index = firstCritical.position;
  let consecutiveSafeCount = 0;
  let recoveryPosition = null;

  while (index < data.length && consecutiveSafeCount < 3) {
    const level = data[index];

    if (!isValidLevel(level, min, max) || isAbove(level, warning)) {
      consecutiveSafeCount = 0;
    } else {
      consecutiveSafeCount += 1;

      if (consecutiveSafeCount === 3) {
        recoveryPosition = index + 1;
      }
    }

    index += 1;
  }

  return recoveryPosition;
}

function findFirstValid(data, min, max) {
  if (data.length === 0) {
    return null;
  }

  let index = 0;
  let firstValid = null;

  do {
    if (isValidLevel(data[index], min, max)) {
      firstValid = { level: data[index], position: index + 1 };
      break;
    }

    index += 1;
  } while (index < data.length);

  return firstValid;
}

function collectInvalidMeasurements(data, min, max) {
  const invalidMeasurements = [];

  for (let index = 0; index < data.length; index += 1) {
    if (!isValidLevel(data[index], min, max)) {
      invalidMeasurements.push({
        position: index + 1,
        level: data[index]
      });
    }
  }

  return invalidMeasurements;
}

function testAlgorithms() {
  const emptyData = [];
  const invalidData = [-1, 141];
  const boundaries = [warningLevel, criticalLevel, criticalLevel + 1];
  const interruptedRecovery = [criticalLevel + 1, 40, 50, -1, 60, warningLevel];

  const emptyCounts = analyzeCategories(
    emptyData,
    categoryCounter,
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel
  );
  const invalidCounts = analyzeCategories(
    invalidData,
    categoryCounter,
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel
  );
  const boundaryCounts = analyzeCategories(
    boundaries,
    categoryCounter,
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel
  );
  const interruptedFirstCritical = findFirstCritical(
    interruptedRecovery,
    criticalLevel,
    minValidLevel,
    maxValidLevel
  );

  return [
    {
      перевірка: "Порожній набір повертає null для статистики та пошуку",
      успішно:
        calculateAverage(emptyData, minValidLevel, maxValidLevel) === null &&
        findMinimum(emptyData, minValidLevel, maxValidLevel) === null &&
        findMaximum(emptyData, minValidLevel, maxValidLevel) === null &&
        findFirstValid(emptyData, minValidLevel, maxValidLevel) === null &&
        findFirstCritical(emptyData, criticalLevel, minValidLevel, maxValidLevel) === null &&
        findRecovery(emptyData, null, warningLevel, minValidLevel, maxValidLevel) === null
    },
    {
      перевірка: "Набір лише з некоректних значень не входить у статистику",
      успішно:
        invalidCounts.valid === 0 &&
        invalidCounts.invalid === 2 &&
        calculateAverage(invalidData, minValidLevel, maxValidLevel) === null &&
        findMinimum(invalidData, minValidLevel, maxValidLevel) === null &&
        findMaximum(invalidData, minValidLevel, maxValidLevel) === null &&
        findFirstValid(invalidData, minValidLevel, maxValidLevel) === null
    },
    {
      перевірка: "Межі категорій включні відповідно до правил",
      успішно:
        boundaryCounts.safe === 1 &&
        boundaryCounts.warning === 1 &&
        boundaryCounts.critical === 1
    },
    {
      перевірка: "Некоректне значення перериває серію відновлення",
      успішно:
        interruptedFirstCritical !== null &&
        findRecovery(
          interruptedRecovery,
          interruptedFirstCritical,
          warningLevel,
          minValidLevel,
          maxValidLevel
        ) === null
    }
  ];
}

const categoryCounts = analyzeCategories(
  noiseLevels,
  categoryCounter,
  warningLevel,
  criticalLevel,
  minValidLevel,
  maxValidLevel
);
const average = calculateAverage(noiseLevels, minValidLevel, maxValidLevel);
const minimum = findMinimum(noiseLevels, minValidLevel, maxValidLevel);
const maximum = findMaximum(noiseLevels, minValidLevel, maxValidLevel);
const firstCritical = findFirstCritical(
  noiseLevels,
  criticalLevel,
  minValidLevel,
  maxValidLevel
);
const recoveryPosition = findRecovery(
  noiseLevels,
  firstCritical,
  warningLevel,
  minValidLevel,
  maxValidLevel
);
const firstValid = findFirstValid(noiseLevels, minValidLevel, maxValidLevel);
const invalidMeasurements = collectInvalidMeasurements(
  noiseLevels,
  minValidLevel,
  maxValidLevel
);
const testResults = testAlgorithms();
let passedTestCount = 0;

for (const testResult of testResults) {
  if (testResult.успішно) {
    passedTestCount += 1;
  }
}

console.group("Акустична варта — звіт моніторингу");
console.log(`Пороги: попередження > ${warningLevel} dB; критичний рівень > ${criticalLevel} dB`);
console.log(`Допустимий діапазон: ${minValidLevel}–${maxValidLevel} dB`);
console.log(`Усього вимірювань: ${noiseLevels.length}`);
console.log(`Коректних: ${categoryCounts.valid}`);
console.log(`Некоректних: ${categoryCounts.invalid}`);
console.table([
  { Категорія: "Без перевищення", Кількість: categoryCounts.safe },
  { Категорія: "Попередження", Кількість: categoryCounts.warning },
  { Категорія: "Критичні", Кількість: categoryCounts.critical }
]);
console.log(
  `Середній рівень: ${
    average === null ? "немає даних" : `${average.toFixed(2).replace(".", ",")} dB`
  }`
);
console.log(`Мінімальний рівень: ${minimum === null ? "немає даних" : formatLevel(minimum)}`);
console.log(`Максимальний рівень: ${maximum === null ? "немає даних" : formatLevel(maximum)}`);
console.log(
  `Перше коректне вимірювання: ${
    firstValid === null
      ? "не знайдено"
      : `${formatLevel(firstValid.level)}, позиція ${firstValid.position}`
  }`
);
console.log(
  `Перше критичне вимірювання: ${
    firstCritical === null
      ? "не знайдено"
      : `${formatLevel(firstCritical.level)}, позиція ${firstCritical.position}`
  }`
);
console.log(
  `Відновлення — три безпечні вимірювання поспіль: ${
    recoveryPosition === null ? "не знайдено" : `позиція ${recoveryPosition}`
  }`
);

const exceededWarningCount = categoryCounts.warning + categoryCounts.critical;
if (exceededWarningCount > 0) {
  console.warn(
    `Поріг ${warningLevel} dB перевищено у ${exceededWarningCount} вимірюваннях.`
  );
}

if (invalidMeasurements.length > 0) {
  console.error("Некоректні вимірювання (діагностика вхідних даних):", invalidMeasurements);
}

if (categoryCounts.critical > 0) {
  console.log(
    `Висновок: зафіксовано ${categoryCounts.critical} критичні вимірювання; ${
      recoveryPosition === null
        ? "після першого з них стійкого відновлення не виявлено."
        : `відновлення зафіксовано на позиції ${recoveryPosition}.`
    }`
  );
} else {
  console.log("Висновок: критичних вимірювань не зафіксовано.");
}

console.log(
  `Перевірка hoisting: Function Declaration викликана до оголошення — ${
    hoistingCheck === null ? "критичних значень немає" : "результат доступний"
  }.`
);
console.log(
  "Function Expression у const доступна лише після ініціалізації; ранній виклик спричинив би ReferenceError."
);
console.log("let і const мають блочну область видимості.");
console.log(`Перевірки алгоритмів: ${passedTestCount}/${testResults.length} успішно.`);
console.table(testResults);
console.groupEnd();
