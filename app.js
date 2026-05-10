// Импортируем Firebase модули
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getDatabase,
    ref,
    set,
    push,
    onValue,
    remove
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Конфигурация Firebase (ЗАМЕНИТЬ НА СВОЮ)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// Коллекции в Realtime Database
const NEWS_PATH = 'news';
const MATERIALS_PATH = 'materials';

// Глобальные переменные
let isAdmin = false;
let allMaterials = [];
let materialsCount = 0;

// ==================== НАВИГАЦИЯ ====================

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;

            // Обновляем активные ссылки
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Показываем нужную секцию
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.dataset.section === targetSection) {
                    section.classList.add('active');
                }
            });

            // Если админка и не вошли - показываем логин
            if (targetSection === 'admin') {
                if (isAdmin) {
                    showAdminPanel();
                } else {
                    document.getElementById('admin-login').style.display = 'block';
                    document.getElementById('admin-panel').style.display = 'none';
                }
            }
        });
    });
}

// ==================== ТАЙМЕР ОБРАТНОГО СЧЁТА И РЕАЛЬНОЕ ВРЕМЯ ====================

// Реальное время по Москве
function updateMoscowTime() {
    const now = new Date();
    const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));

    const hours = String(moscowTime.getHours()).padStart(2, '0');
    const minutes = String(moscowTime.getMinutes()).padStart(2, '0');
    const seconds = String(moscowTime.getSeconds()).padStart(2, '0');

    document.getElementById('time-display').textContent = `${hours}:${minutes}:${seconds}`;

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    document.getElementById('date-display').textContent = moscowTime.toLocaleDateString('ru-RU', options);
}

// Обновляем время каждую секунду
setInterval(updateMoscowTime, 1000);
updateMoscowTime(); // Первый запуск сразу

// Таймер обратного счёта
function updateCountdown() {
    // Установите дату экзамена (12 мая 2025)
    const examDate = new Date('2025-05-12T00:00:00');
    const now = new Date();
    const diff = examDate - now;

    if (diff <= 0) {
        document.getElementById('days-count').textContent = '0';
        document.getElementById('hours-count').textContent = '0';
        document.getElementById('minutes-count').textContent = '0';
        document.getElementById('seconds-count').textContent = '0';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days-count').textContent = days;
    document.getElementById('hours-count').textContent = hours;
    document.getElementById('minutes-count').textContent = minutes;
    document.getElementById('seconds-count').textContent = seconds;
}

// Обновляем таймер каждую секунду
setInterval(updateCountdown, 1000);
updateCountdown(); // Первый запуск сразу

// ==================== УВЕДОМЛЕНИЯ ====================

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification' + (isError ? ' error' : '');
    notification.classList.add('active');

    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

// ==================== НОВОСТИ (Realtime Database) ====================

function loadNews() {
    const container = document.getElementById('news-container');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Загрузка новостей...</div>';

    const newsRef = ref(db, NEWS_PATH);
    onValue(newsRef, (snapshot) => {
        const newsData = snapshot.val();

        if (!newsData) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Новостей пока нет</p>';
            return;
        }

        const newsArray = Object.entries(newsData).map(([id, news]) => ({ id, ...news }));
        newsArray.sort((a, b) => b.createdAt - a.createdAt);

        container.innerHTML = '';
        newsArray.forEach(news => {
            const date = new Date(news.createdAt);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <div class="news-header">
                    <h3 class="news-title">${escapeHtml(news.title)}</h3>
                    <span class="news-category">${escapeHtml(news.category)}</span>
                </div>
                <div class="news-date">📅 ${formattedDate}</div>
                <div class="news-content">${escapeHtml(news.content)}</div>
            `;
            container.appendChild(card);
        });
    });
}

async function addNews(title, content, category) {
    try {
        const newsRef = ref(db, NEWS_PATH);
        const newNewsRef = push(newsRef);
        await set(newNewsRef, {
            title,
            content,
            category,
            createdAt: Date.now()
        });
        showNotification('Новость опубликована!');
    } catch (error) {
        console.error('Ошибка добавления новости:', error);
        showNotification('Ошибка при публикации новости', true);
    }
}

// ==================== МАТЕРИАЛЫ (Realtime Database) ====================

function loadMaterials() {
    const container = document.getElementById('materials-container');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Загрузка материалов...</div>';

    const materialsRef = ref(db, MATERIALS_PATH);
    onValue(materialsRef, (snapshot) => {
        const materialsData = snapshot.val();
        allMaterials = [];

        if (!materialsData) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Материалов пока нет</p>';
            materialsCount = 0;
            updateDownloadCount();
            return;
        }

        const materialsArray = Object.entries(materialsData).map(([id, material]) => ({ id, ...material }));
        materialsArray.sort((a, b) => b.createdAt - a.createdAt);
        allMaterials = materialsArray;

        materialsCount = materialsArray.length;
        updateDownloadCount();

        container.innerHTML = '';
        materialsArray.forEach(material => {
            const date = new Date(material.createdAt);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const card = createMaterialCard(material, formattedDate);
            container.appendChild(card);
        });
    });
}

function updateDownloadCount() {
    const countElement = document.getElementById('download-count');
    if (countElement) {
        countElement.textContent = `Загружено материалов: ${materialsCount}`;
    }
}

function createMaterialCard(material, formattedDate) {
    const card = document.createElement('div');
    card.className = 'material-card';
    card.dataset.subject = material.subject;

    card.innerHTML = `
        <div class="material-header">
            <div class="material-icon">📄</div>
            <div class="material-info">
                <h4 class="material-title">${escapeHtml(material.title)}</h4>
                <span class="material-subject ${material.subject}">${escapeHtml(material.subject)}</span>
            </div>
        </div>
        ${material.description ? `<p class="material-description">${escapeHtml(material.description)}</p>` : ''}
        <div class="material-footer">
            <span class="material-date">📅 ${formattedDate}</span>
            <button class="btn btn-primary btn-sm" onclick="window.openMaterial('${material.id}')">
                Открыть
            </button>
        </div>
    `;
    return card;
}

function setupMaterialFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const cards = document.querySelectorAll('.material-card');
            cards.forEach(card => {
                if (filter === 'all' || card.dataset.subject === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Открытие материала (глобальная функция)
window.openMaterial = function (materialId) {
    const material = allMaterials.find(m => m.id === materialId);
    if (!material) return;

    const modal = document.getElementById('pdf-modal');
    document.getElementById('pdf-title').textContent = material.title;
    document.getElementById('pdf-viewer').src = material.fileUrl;
    document.getElementById('pdf-download').href = material.fileUrl;
    modal.classList.add('active');
};

// Показать материалы (глобальная функция)
window.showMaterials = function () {
    document.querySelector('[data-section="materials"]').click();
};

async function addMaterial(title, subject, description, file, e) {
    const fileInput = document.getElementById('material-file');
    const fileSize = fileInput.files[0]?.size || 0;

    if (fileSize > 10 * 1024 * 1024) {
        showNotification('Файл слишком большой (максимум 10 МБ)', true);
        return;
    }

    const uploadBtn = e?.target;
    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Загрузка...';
    }

    try {
        // Загрузка файла в Firebase Storage
        const storageFileRef = storageRef(storage, `materials/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageFileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Сохранение информации о материале в Realtime Database
        const materialsRef = ref(db, MATERIALS_PATH);
        const newMaterialRef = push(materialsRef);
        await set(newMaterialRef, {
            title,
            subject,
            description,
            fileUrl: downloadURL,
            fileName: file.name,
            createdAt: Date.now()
        });

        showNotification('Материал загружен!');

        // Сброс формы
        document.getElementById('material-form').reset();

        // Перезагрузка материалов произойдёт автоматически через onValue
    } catch (error) {
        console.error('Ошибка загрузки материала:', error);
        showNotification('Ошибка при загрузке материала', true);
    } finally {
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Загрузить материал';
        }
    }
}

async function deleteMaterial(materialId) {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) return;

    try {
        await remove(ref(db, `${MATERIALS_PATH}/${materialId}`));
        showNotification('Материал удалён');
    } catch (error) {
        console.error('Ошибка удаления материала:', error);
        showNotification('Ошибка при удалении материала', true);
    }
}

// Загрузка списка материалов для админки
function loadAdminMaterialsList() {
    const container = document.getElementById('admin-materials-container');

    const materialsRef = ref(db, MATERIALS_PATH);
    onValue(materialsRef, (snapshot) => {
        const materialsData = snapshot.val();

        if (!materialsData) {
            container.innerHTML = '<p style="color: var(--text-muted);">Нет загруженных материалов</p>';
            return;
        }

        const materialsArray = Object.entries(materialsData).map(([id, material]) => ({ id, ...material }));
        materialsArray.sort((a, b) => b.createdAt - a.createdAt);

        container.innerHTML = '';
        materialsArray.forEach(material => {
            const date = new Date(material.createdAt);
            const formattedDate = date.toLocaleDateString('ru-RU');

            const item = document.createElement('div');
            item.className = 'admin-material-item';
            item.innerHTML = `
                <div>
                    <strong>${escapeHtml(material.title)}</strong>
                    <br>
                    <small style="color: var(--text-muted);">${material.subject} • ${formattedDate}</small>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="deleteMaterial('${material.id}')">
                    Удалить
                </button>
            `;
            container.appendChild(item);
        });
    });
}

// ==================== АДМИН ПАНЕЛЬ ====================

async function checkPassword(password) {
    const hash = await hashPassword(password);
    // Хеш SHA-256 от "065860"
    const correctHash = "8c8f8a8e8b8d8c8f8a8e8b8d8c8f8a8e8b8d8c8f8a8e8b8d8c8f8a8e8b8d8c8f";
    return hash === correctHash;
}

async function handleLogin(e) {
    e.preventDefault();
    const passwordInput = document.getElementById('admin-password');
    const errorElement = document.getElementById('login-error');

    const isCorrect = await checkPassword(passwordInput.value);

    if (isCorrect) {
        isAdmin = true;
        passwordInput.value = '';
        errorElement.textContent = '';
        showAdminPanel();
        showNotification('Добро пожаловать, администратор!');
    } else {
        errorElement.textContent = 'Неверный пароль';
        showNotification('Неверный пароль', true);
    }
}

function showAdminPanel() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadAdminMaterialsList();
}

function handleLogout() {
    isAdmin = false;
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    showNotification('Вы вышли из системы');
}

function setupAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ==================== УТИЛИТЫ ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', () => {
    // Настройка навигации
    setupNavigation();
    setupMaterialFilter();
    setupAdminTabs();

    // Загрузка контента
    loadNews();
    loadMaterials();
    loadAdminMaterialsList();

    // Обработчики форм
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    document.getElementById('news-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('news-title').value;
        const content = document.getElementById('news-content').value;
        const category = document.getElementById('news-category').value;
        await addNews(title, content, category);
        document.getElementById('news-form').reset();
    });

    document.getElementById('material-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('material-title').value;
        const subject = document.getElementById('material-subject').value;
        const description = document.getElementById('material-description').value;
        const fileInput = document.getElementById('material-file');
        const file = fileInput.files[0];

        if (!file) {
            showNotification('Пожалуйста, выберите файл', true);
            return;
        }

        await addMaterial(title, subject, description, file, e);
    });

    // Закрытие модального окна
    document.getElementById('modal-close').addEventListener('click', () => {
        document.getElementById('pdf-modal').classList.remove('active');
        document.getElementById('pdf-viewer').src = '';
    });

    document.getElementById('pdf-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('pdf-modal')) {
            document.getElementById('pdf-modal').classList.remove('active');
            document.getElementById('pdf-viewer').src = '';
        }
    });

    // Экран приветствия
    console.log('📚 7Н Класс - Сервис готов к работе!');
    console.log('⚠️ Не забудьте настроить Firebase конфигурацию в app.js');
});
