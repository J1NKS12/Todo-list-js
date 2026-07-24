// http://localhost:3000/tasks

let newTask = [];
let count = 0;
const taskList = document.querySelector(".task-list");
const inputField = document.querySelector(".task-creator__input");
const errorMessage = document.querySelector(".todo-list__error-message");
const addBtn = document.querySelector("#addTaskBtn");
const deleteAllBtn = document.querySelector("#deleteAllBtn");
const listDelete = document.querySelector(".task-list__delete");
const filterBtn = document.querySelector("#filterBtn");
const filterCreator = document.querySelector(".filter-creator__input");
const counterCount = document.querySelector(".counter__count");
const taskTitle = document.querySelector(".task-item__title");

const apiUrl = "http://localhost:3000/tasks";

inputField.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addTask();
  }
});

filterCreator.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    filterTask();
  }
});

function hideError() {
  errorMessage.classList.remove("show");
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");

  setTimeout(() => {
    hideError();
  }, 3000);
}

function renderTask(tasks) {
  const html = tasks
    .map((task) => {
      const status = task.completed ? "Выполнена" : "Активна";
      return `
                    <li class="task-item" data-id="${task.id}">
                <div>
                    <input type="checkbox" class="task-item__checkbox" id="tasks-${task.id}">
                    <label for="tasks-${task.id}" class="task-item__title ${task.completed ? "completed" : ""}">${task.title}</label>
                    <div class="task-item__completed">${status}</div>
                </div>
                
                <div class="task-btn">
                    <button type='button' class="task-btns__delete"><span class="material-icons">clear</span></button>
                </div>
            </li>
    `;
    })
    .join("");
  taskList.innerHTML = html;
  counterTasks();
}
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

async function loadTask() {
  const localData = localStorage.getItem("tasks");
  if (localData) {
    const parsed = JSON.parse(localData);
    if (parsed.length > 0) {
      newTask = parsed;
      renderTask(newTask);
      counterTasks();
      return;
    }
  }
  try {
    const response = await fetch(apiUrl);
    const transformation = await response.json();
    newTask = transformation;
    renderTask(newTask);
    counterTasks();
    saveTasks(newTask);
  } catch (error) {
    console.error(error);
  }
}

async function addTask() {
  try {
    let title = inputField.value.trim();
    if (title === "") {
      inputField.style.borderColor = "red";
      setTimeout(() => {
        inputField.style.borderColor = "black";
      }, 3000);
      showError("Введите задачу!");
      return;
    }

    const newAddTask = {
      title: title,
      completed: false,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddTask),
    });
    const savedTask = await response.json();
    newTask.push(savedTask);
    saveTasks(newTask);
    filterTask();
    inputField.value = "";
  } catch (error) {
    console.error("Ошибка добавления:", error);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${apiUrl}/${id}`, {
      method: "DELETE",
    });

    newTask = newTask.filter((task) => task.id !== id);
    saveTasks(newTask);
    filterTask();
  } catch (error) {
    console.error(error);
  }
}

async function deleteAllTask() {
  if (newTask.length === 0) {
    showError("Задач для удаления нет!");
    return;
  }
  try {
    for (const task of newTask) {
      await fetch(`${apiUrl}/${task.id}`, {
        method: "DELETE",
      });
    }
    newTask = [];
    saveTasks(newTask);
    filterTask();
  } catch (error) {
    console.log("Ошибка удаления:", error);
  }
}

async function filterTask() {
  try {
    let filterText = filterCreator.value.trim().toLowerCase();
    if (filterText === "") {
      renderTask(newTask);
    } else {
      const filteredTasks = newTask.filter((text) => {
        return text.title.toLowerCase().includes(filterText.toLowerCase());
      });
      renderTask(filteredTasks);
    }
  } catch {
    console.log("Ошибка Ввода");
  }
}

function counterTasks() {
  const activeTasks = newTask.filter((task) => !task.completed).length;
  counterCount.textContent = activeTasks;
}

async function toggleTask(id) {
  try {
    const task = newTask.find((t) => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    await fetch(`${apiUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: updatedTask.completed }),
    });

    newTask = newTask.map((t) => (t.id === id ? updatedTask : t));
    saveTasks(newTask);
    filterTask();
  } catch {
    console.log("Ошибка обновления");
  }
}

addBtn.addEventListener("click", function (e) {
  e.preventDefault();
  addTask();
});

taskList.addEventListener("click", function (e) {
  const deleteBtn = e.target.closest(".task-btns__delete");
  if (deleteBtn) {
    const taskItem = deleteBtn.closest(".task-item");
    const taskId = taskItem.dataset.id;
    deleteTask(taskId);
    return;
  }

  const checkbox = e.target.closest(".task-item__checkbox");
  if (checkbox) {
    const taskItem = checkbox.closest(".task-item");
    const taskId = taskItem.dataset.id;
    toggleTask(taskId);
  }
});

filterCreator.addEventListener("input", function (e) {
  const value = filterCreator.value.trim();

  if (value === "") {
    renderTask(newTask);
    counterTasks();
  }
});

filterBtn.addEventListener("click", function (e) {
  filterTask();
  e.preventDefault();
});

deleteAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  deleteAllTask();
});

loadTask();
