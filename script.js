const API_URL = 'http://localhost:3000/tasks';
let tasks = [];
let currentFilter = 'all';

// DOM Elements
const taskTitle = document.getElementById('taskTitle');
const taskPriority = document.getElementById('taskPriority');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// Load Tasks on Startup
async function fetchTasks() {
    const res = await fetch(API_URL);
    tasks = await res.json();
    renderTasks();
}

// Add Task
addTaskBtn.addEventListener('click', async () => {
    const title = taskTitle.value.trim();
    if (!title) return alert("Task title cannot be empty!");
    if (title.length > 50) return alert("Task title must be under 50 characters!");

    const priority = taskPriority.value;
    
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority })
    });
    
    if (res.ok) {
        taskTitle.value = '';
        fetchTasks();
    }
});

// Delete Task
async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
}

// Toggle Status
async function toggleStatus(id, currentStatus) {
    const isDone = currentStatus === 1 ? 0 : 1;
    await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone })
    });
    fetchTasks();
}

// Edit Task
async function editTask(id, oldTitle, oldPriority) {
    const newTitle = prompt("Edit Task Title:", oldTitle);
    if (newTitle === null || newTitle.trim() === "") return;
    if (newTitle.length > 50) return alert("Title too long!");
    
    const newPriority = prompt("Edit Priority (Low/Medium/High):", oldPriority);
    
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), priority: newPriority })
    });
    fetchTasks();
}

// Render UI
function renderTasks() {
    taskList.innerHTML = '';
    
    // Apply Bonus: Search and Sort
    let filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchInput.value.toLowerCase()));
    
    if (sortSelect.value === 'dateAsc') {
        filteredTasks.reverse(); // Simplified sort assuming original is DESC
    }

    // Apply Filters (All/Active/Completed)
    if (currentFilter === 'active') filteredTasks = filteredTasks.filter(t => t.isDone === 0);
    if (currentFilter === 'completed') filteredTasks = filteredTasks.filter(t => t.isDone === 1);

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        if (task.isDone) li.classList.add('completed');
        
        li.innerHTML = `
            <div class="task-info">
                <input type="checkbox" ${task.isDone ? 'checked' : ''} onchange="toggleStatus(${task.id}, ${task.isDone})">
                <span class="task-text">${task.title}</span>
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
            </div>
            <div class="actions">
                <button class="btn-edit" onclick="editTask(${task.id}, '${task.title}', '${task.priority}')">Edit</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">X</button>
            </div>
        `;
        taskList.appendChild(li);
    });

    // Update Counters
    totalCount.textContent = tasks.length;
    completedCount.textContent = tasks.filter(t => t.isDone === 1).length;
}

// Filter Event Listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});

searchInput.addEventListener('input', renderTasks);
sortSelect.addEventListener('change', renderTasks);

// Initial Load
fetchTasks();