# Сравнение алгоритмов Simple и Pro

## Реализованные функции

✅ **Simple Algorithm** (`lib/wizard-scoring-simple.ts`)
- Линейная система подсчета баллов
- Budget: +15 (подходит) / -15 (не подходит)
- Все бонусы суммируются напрямую
- Поддержка nullable minGPA
- Поддержка одновременных требований GRE и GMAT

✅ **Pro Algorithm** (`lib/wizard-scoring-pro.ts`)
- Diminishing returns для высоких баллов
- Budget: +5 (подходит) / -20 (не подходит)
- Более реалистичные проценты
- Применяет soft cap к положительным бонусам

---

## Примеры расчетов

### Пример 1: Сильный студент

**Профиль:**
- GPA: 3.8 (минимум 3.3) → разница +0.5 → **+20**
- IELTS: 7.5 (минимум 6.5) → выше → **+20**
- GRE: есть и соответствует → **+15**
- Budget: $8,000 (лимит $10,000) → подходит
- Discipline: совпадает → **+10**
- Scholarship: доступна и ищет → **+5**

#### Simple:
```
Base: 50
Positive: +20 +20 +15 +15 +10 +5 = +85
Negative: 0
Final: 50 + 85 = 135 → 95% (clamp)
```

#### Pro:
```
Base: 50
Positive sum: +20 +20 +15 +5 +10 +5 = +75
Negative sum: 0

scoreBeforeClamp = 50 + 75 + 0 = 125

125 >= 90 → apply 0.25 multiplier
Adjusted positive = 75 * 0.25 = 18.75

Final: 50 + 18.75 + 0 = 68.75 → 69%
```

**Результат:** Simple дает 95%, Pro дает 69% (более реалистично)

---

### Пример 2: Средний студент

**Профиль:**
- GPA: 3.4 (минимум 3.3) → разница +0.1 → **+10**
- IELTS: 6.5 (минимум 6.5) → равно → **+10**
- GRE: не требуется → **0**
- Budget: $25,000 (лимит $20,000) → не подходит
- Discipline: совпадает → **+10**
- Scholarship: не доступна → **0**

#### Simple:
```
Base: 50
Positive: +10 +10 +10 = +30
Negative: -15
Final: 50 + 30 - 15 = 65%
```

#### Pro:
```
Base: 50
Positive sum: +10 +10 +10 = +30
Negative sum: -20 (budget penalty)

scoreBeforeClamp = 50 + 30 - 20 = 60

60 < 80 → no diminishing
Adjusted positive = 30

Final: 50 + 30 - 20 = 60%
```

**Результат:** Simple дает 65%, Pro дает 60% (бюджет важнее)

---

### Пример 3: Слабый студент

**Профиль:**
- GPA: 2.8 (минимум 3.3) → разница -0.5 → **-20**
- IELTS: 5.5 (минимум 6.5) → ниже → **-15**
- GMAT: требуется, но нет → **-15**
- Budget: $30,000 (лимит $20,000) → не подходит
- Discipline: совпадает → **+10**

#### Simple:
```
Base: 50
Positive: +10
Negative: -20 -15 -15 -15 = -65
Final: 50 + 10 - 65 = -5 → 5% (clamp)
```

#### Pro:
```
Base: 50
Positive sum: +10
Negative sum: -20 -15 -15 -20 = -70

scoreBeforeClamp = 50 + 10 - 70 = -10

-10 < 80 → no diminishing
Adjusted positive = 10

Final: 50 + 10 - 70 = -10 → 5% (clamp)
```

**Результат:** Оба дают 5% (минимум)

---

## Ключевые отличия

| Критерий | Simple | Pro |
|----------|--------|-----|
| Budget (подходит) | +15 | +5 |
| Budget (не подходит) | -15 | -20 |
| Diminishing returns | Нет | Да (при score ≥80) |
| Реалистичность | Оптимистично | Консервативно |
| Для кого | Общая оценка | После регистрации |

---

## Как переключить алгоритм

В `app/wizard-results/page.tsx` строка 89:

```typescript
// Simple (по умолчанию)
const scoredResults = scoreAllUniversities(parsedData, universities, "simple");

// Pro
const scoredResults = scoreAllUniversities(parsedData, universities, "pro");
```

После того как пользователь объяснит логику выбора (auth/localStorage/toggle), нужно будет добавить условие для определения алгоритма.
