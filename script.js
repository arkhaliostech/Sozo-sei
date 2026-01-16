console.log('Hello');

let timerInterval;
let isRunning = false;
let timeLeft = 0;
let timerMode = 'focus';
let currentSession = 1;
let totalSessions = 4;
let completedTasks = [];
let currentPriority = 'medium';
let currentTask = null;
let isExpanded = false;

function toggleTheme() {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
    const circle = document.querySelector('.theme-toggle-circle');
    if (document.body.classList.contains('dark')) {
        circle.textContent = '🌙';
    } else {
        circle.textContent = '☀';
    }
}

function toggleExpand() {
    const container = document.getElementById('mainContainer');
    const avatar = document.getElementById('avatar');
    const themeToggle = document.getElementById('themeToggle');
    const controls = document.getElementById('controls');
    
    isExpanded = !isExpanded;
    container.classList.toggle('expanded');
    
    // Hide/show avatar and theme toggle
    if (isExpanded) {
        avatar.style.opacity = '0';
        avatar.style.visibility = 'hidden';
        themeToggle.style.opacity = '0';
        themeToggle.style.visibility = 'hidden';
        
        // Setup mouse move listener for bottom hover
        document.addEventListener('mousemove', handleMouseMove);
    } else {
        avatar.style.opacity = '1';
        avatar.style.visibility = 'visible';
        themeToggle.style.opacity = '1';
        themeToggle.style.visibility = 'visible';
        
        // Remove mouse move listener
        document.removeEventListener('mousemove', handleMouseMove);
        controls.classList.remove('show');
    }
}

function handleMouseMove(e) {
    const controls = document.getElementById('controls');
    const windowHeight = window.innerHeight;
    const mouseY = e.clientY;
    
    // Show controls when mouse is in bottom 150px of screen
    if (mouseY > windowHeight - 150) {
        controls.classList.add('show');
    } else {
        controls.classList.remove('show');
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimer() {
    document.getElementById('timer').textContent = formatTime(timeLeft);
}

function toggleTimer() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (!isRunning) {
        if (timeLeft === 0) {
            const mins = parseInt(document.getElementById('durationMin').value) || 25;
            const secs = parseInt(document.getElementById('durationSec').value) || 0;
            timeLeft = mins * 60 + secs;
        }
        
        isRunning = true;
        startBtn.innerHTML = '⏸ PAUSE';
        stopBtn.classList.add('active');
        resetBtn.classList.add('active');
        
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimer();
            } else {
                stopTimer();
                alert('Session complete!');
                nextSession();
            }
        }, 1000);
    } else {
        isRunning = false;
        startBtn.innerHTML = '▶ START';
        clearInterval(timerInterval);
    }
}

function stopTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('startBtn').innerHTML = '▶ START';
    document.getElementById('stopBtn').classList.remove('active');
}

function resetTimer() {
    stopTimer();
    const mins = parseInt(document.getElementById('durationMin').value) || 25;
    const secs = parseInt(document.getElementById('durationSec').value) || 0;
    timeLeft = mins * 60 + secs;
    updateTimer();
    document.getElementById('resetBtn').classList.remove('active');
}

function nextSession() {
    currentSession++;
    if (currentSession > totalSessions) {
        currentSession = 1;
    }
    updateSessionTitle();
    resetTimer();
}

function updateSessionTitle() {
    const title = currentTask ? currentTask.title : `Session ${currentSession}`;
    document.getElementById('sessionTitle').textContent = title;
}

function openTaskPopup() {
    document.getElementById('taskPopup').classList.add('active');
    renderTasks();
}

function openMusicPopup() {
    document.getElementById('musicPopup').classList.add('active');
}

function openSettingsPopup() {
    document.getElementById('settingsPopup').classList.add('active');
}

function closePopup(popupId) {
    document.getElementById(popupId).classList.remove('active');
}

function switchTaskTab(tab) {
    document.querySelectorAll('.task-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.task-section').forEach(s => s.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Section').classList.add('active');
}

function selectPriority(priority) {
    currentPriority = priority;
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) {
        alert('Please enter a task title');
        return;
    }

    const task = {
        id: Date.now(),
        title: title,
        note: document.getElementById('taskNote').value,
        date: document.getElementById('taskDate').value,
        priority: currentPriority,
        completed: true
    };

    completedTasks.push(task);
    
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskNote').value = '';
    document.getElementById('taskDate').value = '';
    
    currentTask = task;
    updateSessionTitle();
    
    switchTaskTab('done');
    renderTasks();
}

function renderTasks() {
    const doneList = document.getElementById('doneList');
    const doneEmpty = document.getElementById('doneEmpty');

    doneList.innerHTML = '';

    if (completedTasks.length === 0) {
        doneEmpty.style.display = 'block';
    } else {
        doneEmpty.style.display = 'none';
        completedTasks.forEach(task => {
            const taskEl = createTaskElement(task);
            doneList.appendChild(taskEl);
        });
    }
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.dataset.id = task.id;
    
    div.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
            Priority: ${task.priority.toUpperCase()} | Date: ${task.date || 'No date'}
        </div>
        ${task.note ? `<div style="margin-top: 8px; font-size: 13px;">${task.note}</div>` : ''}
    `;

    div.addEventListener('click', () => selectTaskForSession(task));

    return div;
}

function selectTaskForSession(task) {
    currentTask = task;
    updateSessionTitle();
    closePopup('taskPopup');
}

function openSpotify(playlist) {
    const playlists = {
        'lofi': 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
        'focus': 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
        'study': 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
        'ambient': 'https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp',
        'piano': 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO'
    };
    window.open(playlists[playlist], '_blank');
}

function setTimerMode(mode) {
    timerMode = mode;
    const focusBtn = document.getElementById('focusModeBtn');
    const pomodoroBtn = document.getElementById('pomodoroModeBtn');
    
    if (mode === 'focus') {
        focusBtn.classList.add('active');
        pomodoroBtn.classList.remove('active');
        document.getElementById('durationMin').value = '50';
        document.getElementById('durationSec').value = '0';
    } else {
        focusBtn.classList.remove('active');
        pomodoroBtn.classList.add('active');
        document.getElementById('durationMin').value = '25';
        document.getElementById('durationSec').value = '0';
    }
}

function saveSettings() {
    totalSessions = parseInt(document.getElementById('sessionCount').value);
    const mins = parseInt(document.getElementById('durationMin').value) || 25;
    const secs = parseInt(document.getElementById('durationSec').value) || 0;
    timeLeft = mins * 60 + secs;
    updateTimer();
    closePopup('settingsPopup');
    alert('Settings saved!');
}

window.onload = function() {
    const mins = parseInt(document.getElementById('durationMin').value) || 25;
    const secs = parseInt(document.getElementById('durationSec').value) || 0;
    timeLeft = mins * 60 + secs;
    updateTimer();
    updateSessionTitle();
};