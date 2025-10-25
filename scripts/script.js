let windows = [];
let activeWindow = null;
let draggedWindow = null;
let dragOffset = { x: 0, y: 0 };
let windowCounter = 0;
const apps = {
    aboutme: {
        title: 'About Me',
        icon: './images/aboutme.ico',
        content: `
            <h2>About Me</h2>
            <p>Halo! Selamat datang di portfolio retro saya.</p>
            <p>Saya adalah seorang [profesi Anda] yang passionate dalam [bidang Anda].</p>
            <h3>Skills</h3>
            <ul>
                <li>HTML5, CSS3, JavaScript</li>
                <li>React, Vue, atau framework lainnya</li>
                <li>Backend Development</li>
                <li>Database Management</li>
            </ul>
            <h3>Experience</h3>
            <p>Pengalaman kerja dan pendidikan Anda bisa ditambahkan di sini.</p>
        `
    },
    projects: {
        title: 'Projects',
        icon: './images/projects.ico',
        content: `
            <h2>My Projects</h2>
            <h3>Project 1 - [Nama Project]</h3>
            <p>Deskripsi singkat tentang project pertama Anda.</p>
            <p><a href="#" target="_blank">View Project →</a></p>
            
            <h3>Project 2 - [Nama Project]</h3>
            <p>Deskripsi singkat tentang project kedua Anda.</p>
            <p><a href="#" target="_blank">View Project →</a></p>
            
            <h3>Project 3 - [Nama Project]</h3>
            <p>Deskripsi singkat tentang project ketiga Anda.</p>
            <p><a href="#" target="_blank">View Project →</a></p>
        `
    },
    certificates: {
        title: 'Certificates',
        icon: './images/certificates.ico',
        content: `
            <h2>My Certificates</h2>
            <h3>Certificate 1</h3>
            <p>Nama sertifikat dan institusi pemberi.</p>
            <p>Tahun: 2024</p>
            
            <h3>Certificate 2</h3>
            <p>Nama sertifikat dan institusi pemberi.</p>
            <p>Tahun: 2023</p>
            
            <h3>Certificate 3</h3>
            <p>Nama sertifikat dan institusi pemberi.</p>
            <p>Tahun: 2023</p>
        `
    },
    contacts: {
        title: 'Contacts',
        icon: './images/contacts.ico',
        content: `
            <h2>Contact Me</h2>
            <h3>Email</h3>
            <p><a href="mailto:your.email@example.com">your.email@example.com</a></p>
            
            <h3>LinkedIn</h3>
            <p><a href="https://linkedin.com/in/yourprofile" target="_blank">linkedin.com/in/yourprofile</a></p>
            
            <h3>GitHub</h3>
            <p><a href="https://github.com/yourusername" target="_blank">github.com/yourusername</a></p>
            
            <h3>Social Media</h3>
            <p>Twitter: <a href="https://twitter.com/yourhandle" target="_blank">@yourhandle</a></p>
            <p>Instagram: <a href="https://instagram.com/yourhandle" target="_blank">@yourhandle</a></p>
        `
    },
    calculator: {
        title: 'Calculator',
        icon: './images/calculator.ico',
        isCalculator: true
    }
};
document.addEventListener('DOMContentLoaded', function () {
    initClock();
    initStartMenu();
    initDesktopIcons();
    initClickOutside();
});
function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}
function updateClock() {
    const now = new Date();
    const utc7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const hours = String(utc7.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7.getUTCSeconds()).padStart(2, '0');
    const day = String(utc7.getUTCDate()).padStart(2, '0');
    const month = String(utc7.getUTCMonth() + 1).padStart(2, '0');
    const year = utc7.getUTCFullYear();
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
    document.getElementById('date').textContent = `${day}/${month}/${year}`;
}
function initStartMenu() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');

    startButton.addEventListener('click', function (e) {
        e.stopPropagation();
        startMenu.classList.toggle('hidden');
    });
    const menuItems = document.querySelectorAll('.start-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const appName = this.getAttribute('data-app');
            openApplication(appName);
            startMenu.classList.add('hidden');
        });
    });
}
function initDesktopIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        let clickCount = 0;
        let clickTimer = null;
        icon.addEventListener('click', function (e) {
            e.stopPropagation();
            clickCount++;
            if (clickCount === 1) {
                document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');

                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickCount = 0;
                const appName = this.getAttribute('data-app');
                openApplication(appName);
            }
        });
    });
}
function initClickOutside() {
    document.addEventListener('click', function (e) {
        const startMenu = document.getElementById('start-menu');
        const startButton = document.getElementById('start-button');
        if (!startMenu.contains(e.target) && e.target !== startButton) {
            startMenu.classList.add('hidden');
        }
        if (!e.target.closest('.desktop-icon')) {
            document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        }
    });
}
function openApplication(appName) {
    const app = apps[appName];
    if (!app) return;
    const existingWindow = windows.find(w => w.appName === appName);
    if (existingWindow) {
        focusWindow(existingWindow.element);
        if (existingWindow.element.classList.contains('minimized')) {
            restoreWindow(existingWindow.element);
        }
        return;
    }
    const windowId = `window-${windowCounter++}`;
    const windowElement = document.createElement('div');
    windowElement.className = 'window active';
    windowElement.id = windowId;
    windowElement.setAttribute('data-app', appName);
    if (app.isCalculator) {
        windowElement.classList.add('calculator-window');
    }
    const titlebar = document.createElement('div');
    titlebar.className = 'window-titlebar';
    titlebar.innerHTML = `
        <div class="window-title">
            <img src="${app.icon}" alt="${app.title}">
            <span>${app.title}</span>
        </div>
        <div class="window-controls">
            <div class="window-button minimize-btn">_</div>
            <div class="window-button close-btn">×</div>
        </div>
    `;
    const content = document.createElement('div');
    content.className = 'window-content';
    if (app.isCalculator) {
        content.classList.add('calculator-content');
        content.innerHTML = createCalculatorHTML();
    } else {
        content.innerHTML = app.content;
    }
    windowElement.appendChild(titlebar);
    windowElement.appendChild(content);
    const offset = windows.length * 30;
    windowElement.style.left = `${100 + offset}px`;
    windowElement.style.top = `${100 + offset}px`;
    document.getElementById('windows-container').appendChild(windowElement);
    windows.push({
        id: windowId,
        appName: appName,
        element: windowElement
    });
    addTaskbarButton(windowId, app.title, app.icon);
    initWindowControls(windowElement);
    if (app.isCalculator) {
        initCalculator(windowElement);
    }
    focusWindow(windowElement);
}
function createCalculatorHTML() {
    return `
        <div class="calculator-display">0</div>
        <div class="calculator-buttons">
            <button class="calculator-button" data-value="7">7</button>
            <button class="calculator-button" data-value="8">8</button>
            <button class="calculator-button" data-value="9">9</button>
            <button class="calculator-button" data-value="/">÷</button>
            <button class="calculator-button" data-value="4">4</button>
            <button class="calculator-button" data-value="5">5</button>
            <button class="calculator-button" data-value="6">6</button>
            <button class="calculator-button" data-value="*">×</button>
            <button class="calculator-button" data-value="1">1</button>
            <button class="calculator-button" data-value="2">2</button>
            <button class="calculator-button" data-value="3">3</button>
            <button class="calculator-button" data-value="-">−</button>
            <button class="calculator-button" data-value="0">0</button>
            <button class="calculator-button" data-value=".">.</button>
            <button class="calculator-button" data-value="=">=</button>
            <button class="calculator-button" data-value="+">+</button>
            <button class="calculator-button span-2" data-value="C">C</button>
            <button class="calculator-button span-2" data-value="CE">CE</button>
        </div>
    `;
}
function initCalculator(windowElement) {
    const display = windowElement.querySelector('.calculator-display');
    const buttons = windowElement.querySelectorAll('.calculator-button');
    let currentValue = '0';
    let previousValue = null;
    let operation = null;
    let shouldResetDisplay = false;
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const value = this.getAttribute('data-value');
            if (value === 'C' || value === 'CE') {
                currentValue = '0';
                previousValue = null;
                operation = null;
                shouldResetDisplay = false;
                display.textContent = currentValue;
            } else if (value === '=') {
                if (operation && previousValue !== null) {
                    currentValue = calculate(previousValue, currentValue, operation);
                    display.textContent = currentValue;
                    previousValue = null;
                    operation = null;
                    shouldResetDisplay = true;
                }
            } else if (['+', '-', '*', '/'].includes(value)) {
                if (operation && previousValue !== null && !shouldResetDisplay) {
                    currentValue = calculate(previousValue, currentValue, operation);
                    display.textContent = currentValue;
                }
                previousValue = currentValue;
                operation = value;
                shouldResetDisplay = true;
            } else {
                if (shouldResetDisplay || currentValue === '0') {
                    currentValue = value;
                    shouldResetDisplay = false;
                } else {
                    currentValue += value;
                }
                display.textContent = currentValue;
            }
        });
    });
}
function calculate(a, b, op) {
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);
    switch (op) {
        case '+': return String(num1 + num2);
        case '-': return String(num1 - num2);
        case '*': return String(num1 * num2);
        case '/': return num2 !== 0 ? String(num1 / num2) : 'Error';
        default: return b;
    }
}
function initWindowControls(windowElement) {
    const titlebar = windowElement.querySelector('.window-titlebar');
    const minimizeBtn = windowElement.querySelector('.minimize-btn');
    const closeBtn = windowElement.querySelector('.close-btn');
    titlebar.addEventListener('mousedown', function (e) {
        if (e.target.closest('.window-button')) return;
        draggedWindow = windowElement;
        focusWindow(windowElement);
        const rect = windowElement.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    minimizeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        minimizeWindow(windowElement);
    });
    closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeWindow(windowElement);
    });
    windowElement.addEventListener('mousedown', function () {
        focusWindow(windowElement);
    });
}
function onMouseMove(e) {
    if (!draggedWindow) return;
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
    const maxX = window.innerWidth - draggedWindow.offsetWidth;
    const maxY = window.innerHeight - 40 - draggedWindow.offsetHeight;
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    draggedWindow.style.left = `${newX}px`;
    draggedWindow.style.top = `${newY}px`;
}
function onMouseUp() {
    draggedWindow = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
function focusWindow(windowElement) {
    document.querySelectorAll('.window').forEach(w => {
        w.classList.remove('active');
        w.classList.add('inactive');
    });
    windowElement.classList.remove('inactive');
    windowElement.classList.add('active');
    document.querySelectorAll('.taskbar-app').forEach(btn => {
        btn.classList.remove('active');
    });
    const taskbarBtn = document.querySelector(`.taskbar-app[data-window="${windowElement.id}"]`);
    if (taskbarBtn) {
        taskbarBtn.classList.add('active');
    }
    activeWindow = windowElement;
}
function minimizeWindow(windowElement) {
    windowElement.classList.add('minimized');
    const taskbarBtn = document.querySelector(`.taskbar-app[data-window="${windowElement.id}"]`);
    if (taskbarBtn) {
        taskbarBtn.classList.remove('active');
    }
}
function restoreWindow(windowElement) {
    windowElement.classList.remove('minimized');
    focusWindow(windowElement);
}
function closeWindow(windowElement) {
    const windowId = windowElement.id;
    windows = windows.filter(w => w.id !== windowId);
    const taskbarBtn = document.querySelector(`.taskbar-app[data-window="${windowId}"]`);
    if (taskbarBtn) {
        taskbarBtn.remove();
    }
    windowElement.remove();
}
function addTaskbarButton(windowId, title, icon) {
    const taskbarApps = document.getElementById('taskbar-apps');
    const button = document.createElement('div');
    button.className = 'taskbar-app active';
    button.setAttribute('data-window', windowId);
    button.innerHTML = `
        <img src="${icon}" alt="${title}">
        <span>${title}</span>
    `;
    button.addEventListener('click', function () {
        const windowElement = document.getElementById(windowId);
        if (windowElement.classList.contains('minimized')) {
            restoreWindow(windowElement);
        } else if (windowElement.classList.contains('active')) {
            minimizeWindow(windowElement);
        } else {
            focusWindow(windowElement);
        }
    });
    taskbarApps.appendChild(button);
}