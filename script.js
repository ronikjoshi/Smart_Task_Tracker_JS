// 1. Select key elements
const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskCategory = document.querySelector("#task-category");
const taskList = document.querySelector("#task-list");
const message = document.querySelector("#message");
const filterCategory = document.querySelector("#filter-category");

// CORE DATA STATE
let tasks = [];
const STORAGE_KEY = "smart_tasks";

// LOAD AND INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});

// FORM SUBMISSION
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();
  const category = taskCategory.value; // already lowercase

  if (text === "") {
    showMessage("Please enter a task!");
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text,
    category: category, // store lowercase
    done: false,
    time: new Date().toLocaleTimeString()
  };

  tasks.push(newTask);
  saveTasksToStorage();
  addTaskToDOM(newTask);

  taskInput.value = "";
  showMessage("Task added successfully!");
});

// ADD TASK TO DOM
function addTaskToDOM(task) {
  const li = document.createElement("li");
  li.className = "task";
  li.dataset.id = task.id;

  li.innerHTML = `
    <span>
      <strong>[${task.category}]</strong>
      ${task.text}
      <small style="color:#777;">(${task.time})</small>
    </span>
    <div>
      <button data-action="done">✅</button>
      <button data-action="delete">❌</button>
    </div>
  `;

  if (task.done) li.classList.add("done");

  taskList.appendChild(li);
}

// EVENT DELEGATION FOR DONE / DELETE
taskList.addEventListener("click", function (event) {
  const target = event.target;
  const parent = target.closest(".task");

  if (!parent || !target.dataset.action) return;

  const taskId = parseInt(parent.dataset.id);

  if (target.dataset.action === "delete") {
    parent.remove();
    removeTask(taskId);
    showMessage("Task deleted.");
  }

  if (target.dataset.action === "done") {
    parent.classList.toggle("done");
    toggleTaskDone(taskId);
  }
});

// REMOVE TASK
function removeTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasksToStorage();
}

// TOGGLE DONE
function toggleTaskDone(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks[index].done = !tasks[index].done;
  }
  saveTasksToStorage();
}

// STORAGE FUNCTIONS
function getTasksFromStorage() {
  const tasksString = localStorage.getItem(STORAGE_KEY);
  return tasksString ? JSON.parse(tasksString) : [];
}

function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// LOAD TASKS + FIX OLD CATEGORY VALUES
function loadTasks() {
  const loadedTasks = getTasksFromStorage();

  // Normalize old saved tasks (Work → work, Personal → personal)
  tasks = loadedTasks.map((t) => ({
    ...t,
    category: t.category.toLowerCase()
  }));

  saveTasksToStorage(); // rewrite cleaned data

  // Render tasks
  taskList.innerHTML = "";
  tasks.forEach((task) => addTaskToDOM(task));
}

// FILTER TASKS BY CATEGORY
filterCategory.addEventListener("change", function () {
  const selected = filterCategory.value; // "all", "work", "personal", "study"

  taskList.innerHTML = ""; // Clear list

  const filtered =
    selected === "all"
      ? tasks
      : tasks.filter((task) => task.category === selected);

  filtered.forEach((task) => addTaskToDOM(task));
});

// MESSAGE HELPER
function showMessage(text) {
  message.textContent = text;
  setTimeout(() => (message.textContent = ""), 2000);
}
