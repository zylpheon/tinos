let windows = [];
let activeWindow = null;
let draggedWindow = null;
let dragOffset = { x: 0, y: 0 };
let windowCounter = 0;
let draggedTaskbarApp = null;
let taskbarDragStartX = 0;
const apps = {};
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
    if (app.windowClass) {
        windowElement.classList.add(app.windowClass);
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
    if (app.contentClass) {
        content.classList.add(app.contentClass);
    }
    if (app.getContent) {
        content.innerHTML = app.getContent();
    } else {
        content.innerHTML = app.content || '';
    }
    windowElement.appendChild(titlebar);
    windowElement.appendChild(content);
    const offset = windows.length * 30;
    const maxWidth = window.innerWidth - 50;
    const maxHeight = window.innerHeight - 80;
    let leftPos = 100 + offset;
    let topPos = 100 + offset;
    if (leftPos > maxWidth - 400) leftPos = 50;
    if (topPos > maxHeight - 300) topPos = 50;
    windowElement.style.left = `${leftPos}px`;
    windowElement.style.top = `${topPos}px`;
    document.getElementById('windows-container').appendChild(windowElement);
    windows.push({
        id: windowId,
        appName: appName,
        element: windowElement
    });
    addTaskbarButton(windowId, app.title, app.icon);
    initWindowControls(windowElement);
    if (app.init) {
        app.init(windowElement);
    }
    focusWindow(windowElement);
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
    titlebar.addEventListener('touchstart', function (e) {
        if (e.target.closest('.window-button')) return;
        draggedWindow = windowElement;
        focusWindow(windowElement);
        const rect = windowElement.getBoundingClientRect();
        const touch = e.touches[0];
        dragOffset.x = touch.clientX - rect.left;
        dragOffset.y = touch.clientY - rect.top;
        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);
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
function onTouchMove(e) {
    if (!draggedWindow) return;
    const touch = e.touches[0];
    let newX = touch.clientX - dragOffset.x;
    let newY = touch.clientY - dragOffset.y;
    const maxX = window.innerWidth - draggedWindow.offsetWidth;
    const maxY = window.innerHeight - 40 - draggedWindow.offsetHeight;
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    draggedWindow.style.left = `${newX}px`;
    draggedWindow.style.top = `${newY}px`;
}
function onTouchEnd() {
    draggedWindow = null;
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
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
    button.setAttribute('draggable', 'true');
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
    button.addEventListener('dragstart', function (e) {
        draggedTaskbarApp = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });
    button.addEventListener('dragend', function () {
        this.classList.remove('dragging');
        draggedTaskbarApp = null;
    });
    button.addEventListener('dragover', function (e) {
        e.preventDefault();
        if (draggedTaskbarApp && draggedTaskbarApp !== this) {
            const rect = this.getBoundingClientRect();
            const midpoint = rect.left + rect.width / 2;
            if (e.clientX < midpoint) {
                taskbarApps.insertBefore(draggedTaskbarApp, this);
            } else {
                taskbarApps.insertBefore(draggedTaskbarApp, this.nextSibling);
            }
        }
    });
    taskbarApps.appendChild(button);
}