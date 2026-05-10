# 🔥 Настройка Firebase Storage для загрузки файлов

## Почему нужно включить Firebase Storage?

Ты создал **Realtime Database** - это отлично для хранения новостей и материалов!

Но для **загрузки PDF файлов** нужен **Firebase Storage** (бесплатно до 5 ГБ).

## 📋 Пошаговая инструкция

### Шаг 1: Включи Firebase Storage

1. Открой [Firebase Console](https://console.firebase.google.com/)
2. Выбери свой проект (например, `7n-class`)
3. В меню слева нажми **"Storage"**
4. Нажми **"Get started"**
5. Выбери **"Start in test mode"**
6. Нажми **"Next"**
7. Выбери ту же локацию, что и для Realtime Database
8. Нажми **"Done"**

**Готово!** Firebase Storage создан.

### Шаг 2: Настрой правила Storage

1. В разделе **Storage** нажми вкладку **"Rules"**
2. Замени код на этот:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /materials/{allPaths=**} {
      allow read: if true;          // Все могут скачивать
      allow write: if request.auth != null;  // Только админы могут загружать
    }
  }
}
```

3. Нажми **"Publish"**

### Шаг 3: Проверь конфигурацию

Убедись, что в файле `app.js` Firebase конфигурация правильная (строки 13-20):

```javascript
const firebaseConfig = {
    apiKey: "ТВОЙ_API_KEY",
    authDomain: "ТВОЙ_PROJECT_ID.firebaseapp.com",
    projectId: "ТВОЙ_PROJECT_ID",
    storageBucket: "ТВОЙ_PROJECT_ID.appspot.com",  // ← Это важно!
    messagingSenderId: "ТВОЙ_SENDER_ID",
    appId: "ТВОЙ_APP_ID"
};
```

### Шаг 4: Протестируй загрузку

1. Открой сайт
2. Зайди в админ-панель (пароль: `065860`)
3. Перейди на вкладку "Добавить материал"
4. Загрузи любой PDF файл
5. Подожди 10-30 секунд

**Если файл загрузился** - всё работает! ✅

## 💰 Сколько это стоит?

**БЕСПЛАТНО до:**
- 5 ГБ хранилища
- 1 ГБ скачиваний в день
- 20 000 загрузок в день

Для школьного класса этого более чем достаточно!

## 📊 Где смотреть файлы?

В Firebase Console → Storage → Browser → папка `materials`

Там будут все загруженные PDF файлы.

## ❓ Что если не работает?

### Ошибка "Permission denied"

**Решение:** Проверь правила Storage Rules (Шаг 2)

### Ошибка "No Firebase App '[DEFAULT]' has been created"

**Решение:** Проверь Firebase конфигурацию в `app.js`

### Файл не загружается

**Решение:**
1. Открой консоль браузера (F12)
2. Посмотри ошибки
3. Убедись, что Firebase Storage включён

## 🎯 Готово!

Теперь ты можешь:
- ✅ Загружать PDF файлы через админ-панель
- ✅ Все ученики могут скачивать материалы
- ✅ Файлы хранятся безопасно в Firebase

**Пароль администратора: `065860`**
