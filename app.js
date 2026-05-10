// Глобальные переменные
let isAdmin = false;
const EXAM_LINKS_KEY = 'examLinks';

// ==================== НАВИГАЦИЯ ====================

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.dataset.section === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

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

// ==================== ТАЙМЕР И ВРЕМЯ ====================

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

setInterval(updateMoscowTime, 1000);
updateMoscowTime();

// ==================== ВХОД В АДМИНКУ ====================

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkPassword(password) {
    const hash = await hashPassword(password);
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
    loadCurrentLinks();
}

function handleLogout() {
    isAdmin = false;
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    showNotification('Вы вышли из системы');
}

// ==================== УПРАВЛЕНИЕ ССЫЛКАМИ ====================

function saveExamLink(examType, link) {
    const links = getExamLinks();
    links[examType] = link;
    localStorage.setItem(EXAM_LINKS_KEY, JSON.stringify(links));
    loadCurrentLinks();
    updateExamLinksOnPage();
}

function getExamLinks() {
    const stored = localStorage.getItem(EXAM_LINKS_KEY);
    return stored ? JSON.parse(stored) : {};
}

window.openExamMaterial = function(examType) {
    const links = getExamLinks();
    const link = links[examType];
    
    if (!link) {
        showNotification('Материалы для этого экзамена ещё не добавлены', true);
        return;
    }
    
    const directLink = convertGoogleDriveLink(link);
    window.open(directLink, '_blank');
};

function convertGoogleDriveLink(url) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
        const fileId = match[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
}

function loadCurrentLinks() {
    const container = document.getElementById('links-container');
    const links = getExamLinks();
    
    const examNames = {
        'history': 'История (12 мая)',
        'physics': 'Физика (14 мая)',
        'biology': 'Биология (20 мая)'
    };
    
    if (Object.keys(links).length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">Ссылки ещё не добавлены</p>';
        return;
    }
    
    container.innerHTML = '';
    Object.entries(links).forEach(([examType, link]) => {
        const item = document.createElement('div');
        item.className = 'admin-material-item';
        item.innerHTML = `
            <div>
                <strong>${examNames[examType] || examType}</strong>
                <br>
                <small style="color: var(--text-muted);">${link.substring(0, 50)}...</small>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="removeExamLink('${examType}')">
                Удалить
            </button>
        `;
        container.appendChild(item);
    });
}

window.removeExamLink = function(examType) {
    if (!confirm('Удалить ссылку для этого экзамена?')) return;
    
    const links = getExamLinks();
    delete links[examType];
    localStorage.setItem(EXAM_LINKS_KEY, JSON.stringify(links));
    loadCurrentLinks();
    updateExamLinksOnPage();
    showNotification('Ссылка удалена');
};

function updateExamLinksOnPage() {
    const links = getExamLinks();
    
    Object.entries(links).forEach(([examType, link]) => {
        const linkElement = document.getElementById(`link-${examType}`);
        if (linkElement) {
            const directLink = convertGoogleDriveLink(link);
            linkElement.href = directLink;
            linkElement.style.display = 'inline-block';
            linkElement.textContent = '📄 Открыть PDF';
        }
    });
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    updateExamLinksOnPage();

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    document.getElementById('exam-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const examType = document.getElementById('exam-select').value;
        const link = document.getElementById('google-drive-link').value;
        
        if (!examType || !link) {
            showNotification('Заполните все поля', true);
            return;
        }
        
        saveExamLink(examType, link);
        document.getElementById('exam-form').reset();
        showNotification('Ссылка добавлена!');
    });

    console.log('📚 7Н Класс - Сервис готов!');
    console.log('🟢 Зелёная тема активна');
    console.log('📍 Время по Москве');
});
