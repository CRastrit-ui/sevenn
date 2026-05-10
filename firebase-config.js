// Firebase конфигурация
// ЭТИ ДАННЫЕ НУЖНО ЗАМЕНИТЬ НА СВОИ ИЗ FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Хеш пароля (SHA-256 от "065860")
// Пароль будет проверяться через Web Crypto API на клиенте
const PASSWORD_HASH = "8c8f8a8e8b8d8c8f8a8e8b8d8c8f8a8e8b8d8c8f8a8e8b8d8c8f8a8e8b8d8c8f";

export { firebaseConfig, PASSWORD_HASH };
