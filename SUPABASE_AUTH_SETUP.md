# Настройка Supabase Authentication

## Шаги для активации authentication в Supabase Dashboard

### 1. Включить Email/Password Authentication

1. Перейдите в **Supabase Dashboard** → ваш проект
2. Выберите **Authentication** в боковом меню
3. Перейдите на вкладку **Providers**
4. Найдите **Email** и убедитесь что он **Enabled**
5. Настройте:
   - **Confirm email**: включите для верификации email
   - **Secure email change**: рекомендуется включить

### 2. Настроить Email Templates (опционально)

1. В **Authentication** → **Email Templates**
2. Настройте шаблоны:
   - **Confirm signup**: приветственное письмо с подтверждением
   - **Magic Link**: для входа без пароля (опционально)
   - **Change Email Address**: подтверждение смены email
   - **Reset Password**: восстановление пароля

Замените дефолтные тексты на русские, например:

**Confirm signup:**
```
Subject: Подтвердите email для Study Abroad UZ

Здравствуйте!

Подтвердите ваш email для получения доступа к экспертному анализу шансов поступления.

Нажмите на ссылку: {{ .ConfirmationURL }}

С уважением,
Команда Study Abroad UZ
```

### 3. Настроить Google OAuth (рекомендуется)

1. В **Authentication** → **Providers** найдите **Google**
2. Нажмите **Enable**
3. Вам потребуется:
   - **Client ID** из Google Cloud Console
   - **Client Secret** из Google Cloud Console

#### Как получить Google OAuth credentials:

1. Перейдите на https://console.cloud.google.com
2. Создайте новый проект или выберите существующий
3. Перейдите в **APIs & Services** → **Credentials**
4. Нажмите **Create Credentials** → **OAuth 2.0 Client ID**
5. Выберите **Web application**
6. Добавьте **Authorized redirect URIs**:
   ```
   https://wmmpkwldxfvoinkstooo.supabase.co/auth/v1/callback
   ```
7. Скопируйте **Client ID** и **Client Secret**
8. Вставьте их в Supabase Dashboard в настройках Google provider

### 4. Настроить Site URL и Redirect URLs

1. В **Authentication** → **URL Configuration**
2. Установите:
   - **Site URL**: `http://localhost:3001` (для разработки)
   - **Redirect URLs**: добавьте:
     - `http://localhost:3001/wizard-results`
     - `http://localhost:3001` (fallback)

**Для production:** замените на ваш реальный домен

### 5. Проверить настройки безопасности

1. В **Authentication** → **Policies** (RLS)
2. Убедитесь что таблица `universities` доступна для чтения всем:
   ```sql
   -- Уже создано в миграции
   CREATE POLICY "Allow public read access" ON public.universities
     FOR SELECT USING (true);
   ```

### 6. Тестирование

После настройки:

1. Перезапустите dev server: `npm run dev`
2. Откройте `http://localhost:3001`
3. Заполните wizard форму
4. На странице результатов нажмите "Узнать реальные шансы"
5. Протестируйте регистрацию через email
6. Протестируйте вход через Google (если настроили)

---

## Текущее состояние

✅ Код готов
✅ `.env.local` содержит credentials
⚠️ Требуется настройка в Supabase Dashboard (шаги выше)

---

## Структура воронки

**Для гостей (неавторизованные):**
- Видят Simple результаты (оптимистичные)
- Видят CTA "Узнать реальные шансы"
- По клику → модальное окно регистрации

**Для авторизованных:**
- Автоматически видят Pro результаты (реалистичные)
- Видят блок "Почему шанс ниже"
- Видят блок "Что можно улучшить"
- Видят CTA на консультацию

---

## Примеры разницы Simple vs Pro

**Сильный профиль:**
- Simple: 95%
- Pro: 69% (применен soft-cap)
- Разница: 26%

**Средний профиль:**
- Simple: 65%
- Pro: 60% (бюджет важнее)
- Разница: 5%

**Слабый профиль:**
- Simple: 5%
- Pro: 5% (оба на минимуме)
- Разница: 0%
