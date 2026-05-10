# 📚 7Н Класс - Сервис подготовки к аттестации

Онлайн-сервис для класса с новостями и материалами для подготовки к промежуточной аттестации.

## 🚀 Быстрый старт

### 1. Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Add project" и создайте новый проект
3. Включите **Firestore Database**:
   - Перейдите в "Firestore Database"
   - Нажмите "Create database"
   - Выберите режим "Start in test mode" (для начала)
   - Выберите локацию (желательно ближе к России)

4. Включите **Firebase Storage**:
   - Перейдите в "Storage"
   - Нажмите "Get started"
   - Выберите режим "Start in test mode"

5. Получите конфигурацию проекта:
   - Нажмите на шестерёнку ⚙️ рядом с "Project overview"
   - Выберите "Project settings"
   - Прокрутите вниз до "Your apps"
   - Нажмите на иконку web `</>`
   - Скопируйте `firebaseConfig`

### 2. Настройка проекта

1. Откройте файл `app.js`
2. Замените конфигурацию Firebase на свою (строки 13-20):

```javascript
const firebaseConfig = {
    apiKey: "ВАШ_API_KEY",
    authDomain: "ВАШ_PROJECT_ID.firebaseapp.com",
    projectId: "ВАШ_PROJECT_ID",
    storageBucket: "ВАШ_PROJECT_ID.appspot.com",
    messagingSenderId: "ВАШ_SENDER_ID",
    appId: "ВАШ_APP_ID"
};
```

### 3. Настройка правил безопасности (Firebase)

#### Firestore Rules (в Firebase Console → Firestore Database → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Новости - все могут читать, только админ может писать
    match /news/{newsId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Материалы - все могут читать, только админ может писать
    match /materials/{materialId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### Storage Rules (в Firebase Console → Storage → Rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /materials/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Публикация на GitHub Pages

1. Создайте репозиторий на GitHub
2. Загрузите файлы:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`

3. Включите GitHub Pages:
   - Перейдите в "Settings" репозитория
   - Выберите "Pages" в меню слева
   - В разделе "Build and deployment" → "Source" выберите "Deploy from a branch"
   - В разделе "Branch" выберите основную ветку (main/master) и папку "/ (root)"
   - Нажмите "Save"

4. Через несколько минут сайт будет доступен по адресу:
   `https://ваш-username.github.io/имя-репозитория/`

### 5. Улучшение безопасности (рекомендуется)

Для реальной защиты от взлома пароля через inspect code:

1. Включите **Firebase Authentication** в консоли Firebase
2. Используйте email/пароль аутентификацию
3. Создайте пользователя с email администратора
4. Проверку прав делайте через Firebase Auth

## 📱 Функционал

### Для учеников:
- ✅ Просмотр новостей
- ✅ Материалы для подготовки по предметам
- ✅ Фильтрация материалов по предметам
- ✅ Удобный просмотр PDF с телефона
- ✅ Адаптивный дизайн для мобильных устройств

### Для администратора:
- ✅ Добавление новостей
- ✅ Загрузка PDF файлов для подготовки
- ✅ Управление материалами (удаление)
- ✅ Категоризация по предметам

## 🎨 Дизайн

- Современный градиентный интерфейс
- Адаптивность для мобильных устройств и ПК
- Интуитивная навигация
- Уведомления о действиях
- Модальное окно для просмотра PDF

## 🔐 Безопасность

- Пароль администратора хешируется (SHA-256)
- Хеш пароля не совпадает с исходным значением
- Правила Firebase ограничивают запись только авторизованным пользователям

## 📝 Используемые технологии

- HTML5 + CSS3
- Vanilla JavaScript (ES6+)
- Firebase Firestore (база данных)
- Firebase Storage (хранение файлов)
- Web Crypto API (хеширование пароля)

## 🆘 Поддержка

Если возникли проблемы:
1. Проверьте консоль браузера (F12)
2. Убедитесь, что Firebase конфигурация правильная
3. Проверьте правила Firestore и Storage
4. Убедитесь, что файлы загружены на GitHub Pages

---

**Создано для 7Н класса** 📚✨
