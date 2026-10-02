// http://localhost:3000/tasks

let newTask = [];
let count = 0;
const taskList = document.querySelector(".task-list");
const inputField = document.querySelector(".task-creator__input");
const errorMessage = document.querySelector(".todo-list__error-message");
const addBtn = document.querySelector("#addTaskBtn");
const deleteAllBtn = document.querySelector("#deleteAllBtn");
const filterBtn = document.querySelector("#filterBtn");
const filterCreator = document.querySelector(".filter-creator__input");
const counterCount = document.querySelector(".counter__count");

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
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id;

    const wrapper = document.createElement("div");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-item__checkbox";
    checkbox.id = `tasks-${task.id}`;
    checkbox.checked = task.completed;

    const label = document.createElement("label");
    label.htmlFor = `tasks-${task.id}`;
    label.className = `task-item__title ${task.completed ? "completed" : ""}`;
    label.textContent = task.title;

    const statusDiv = document.createElement("div");
    statusDiv.className = "task-item__completed";
    statusDiv.textContent = task.completed ? "Выполнена" : "Активна";

    const btnWrapper = document.createElement("div");
    btnWrapper.className = "task-btn";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "task-btns__delete";

    const icon = document.createElement("span");
    icon.className = "material-icons";
    icon.textContent = "clear";

    deleteBtn.appendChild(icon);
    btnWrapper.appendChild(deleteBtn);

    wrapper.append(checkbox, label, statusDiv);
    li.append(wrapper, btnWrapper);
    taskList.appendChild(li);
  });

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

      return;
    }
  }
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    const transformation = await response.json();
    newTask = transformation;
    renderTask(newTask);
    counterTasks();
    saveTasks(newTask);
  } catch (error) {
    console.error(error);
    showError("Не удалось загрузить задачи");
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

    if (!response.ok) {
      throw new Error(`Ошибка добавления: ${response.status}`);
    }

    const savedTask = await response.json();
    newTask.push(savedTask);
    saveTasks(newTask);
    filterTask();
    inputField.value = "";
  } catch (error) {
    console.error("Ошибка добавления:", error);
    showError("Не удалось добавить задачу");
  }
}

async function deleteTask(id) {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Ошибка удаления: ${response.status}`);
    }

    newTask = newTask.filter((task) => task.id !== id);
    saveTasks(newTask);
    filterTask();
  } catch (error) {
    console.error(error);
    showError("Не удалось удалить задачу");
  }
}

async function deleteAllTask() {
  if (newTask.length === 0) {
    showError("Задач для удаления нет!");
    return;
  }

  const isConfirmed = confirm(`Вы уверены, что хотите удалить все задачи?`);

  if (!isConfirmed) return;

  try {
    for (const task of newTask) {
      const response = await fetch(`${apiUrl}/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Ошибка удаления: ${response.status}`);
      }
    }
    newTask = [];
    saveTasks(newTask);
    filterTask();
  } catch (error) {
    console.log("Ошибка удаления:", error);
    showError("Не удалось удалить все задачи");
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
    showError("Ошибка при фильтрации");
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

    const response = await fetch(`${apiUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: updatedTask.completed }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка обновления: ${response.status}`);
    }

    newTask = newTask.map((t) => (t.id === id ? updatedTask : t));
    saveTasks(newTask);
    filterTask();
  } catch {
    console.log("Ошибка обновления");
    showError("Не удалось изменить статус");
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
