(() => {
  "use strict";

  const GOALS_KEY = "valentinStudyGoals_v1";
  const THEME_KEY = "valentinTheme_v1";

  const initialGoals = [
    { id: "goal-js", text: "Да науча основите на JavaScript и да създавам интерактивни уебсайтове.", completed: false },
    { id: "goal-web", text: "Да подобря уменията си по HTML и CSS и да създавам адаптивни страници.", completed: false },
    { id: "goal-git", text: "Да науча Git и GitHub за съхраняване и управление на програмни проекти.", completed: false }
  ];

  const form = document.getElementById("goalForm");
  const input = document.getElementById("goalInput");
  const message = document.getElementById("formMessage");
  const list = document.getElementById("goalList");
  const filterButtons = document.querySelectorAll(".filter-button");
  const themeToggle = document.getElementById("themeToggle");

  let goals = loadGoals();
  let currentFilter = "all";

  function loadGoals() {
    try {
      const saved = localStorage.getItem(GOALS_KEY);
      if (saved === null) return [...initialGoals];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [...initialGoals];
      return parsed.filter(goal =>
        goal && typeof goal.id === "string" &&
        typeof goal.text === "string" &&
        typeof goal.completed === "boolean"
      );
    } catch {
      return [...initialGoals];
    }
  }

  function saveGoals() {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch {
    showMessage("Данните не могат да бъдат запазени.", false);
  }
}

  function normalize(text) {
    return text.trim().replace(/\s+/g, " ").toLocaleLowerCase("bg");
  }

  function showMessage(text, success) {
    message.textContent = text;
    message.classList.toggle("success", Boolean(success));
  }

  function updateProgress() {
    const total = goals.length;
    const completed = goals.filter(goal => goal.completed).length;
    const active = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("totalCount").textContent = total;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("activeCount").textContent = active;
    document.getElementById("progressPercent").textContent = percent + "%";
    document.getElementById("progressFill").style.width = percent + "%";
  }

  function renderGoals() {
    list.replaceChildren();
    const filtered = goals.filter(goal => {
      if (currentFilter === "active") return !goal.completed;
      if (currentFilter === "completed") return goal.completed;
      return true;
    });

    if (goals.length === 0) {
      list.append(createEmptyState("Все още нямаш цели.", "Добави първата си учебна цел от панела вляво."));
    } else if (filtered.length === 0) {
      const text = currentFilter === "active"
        ? "Нямаш активни цели."
        : "Все още нямаш завършени цели.";
      list.append(createEmptyState(text, "Избери друг филтър или добави нова цел."));
    } else {
      filtered.forEach(goal => list.append(createGoalElement(goal)));
    }

    document.getElementById("visibleCount").textContent =
      filtered.length + (filtered.length === 1 ? " цел" : " цели");
    updateProgress();
  }

  function createEmptyState(title, description) {
    const container = document.createElement("div");
    container.className = "empty-state";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const paragraph = document.createElement("span");
    paragraph.textContent = description;
    container.append(heading, paragraph);
    return container;
  }

  function createGoalElement(goal) {
    const item = document.createElement("div");
    item.className = "goal-item" + (goal.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "goal-check";
    checkbox.checked = goal.completed;
    checkbox.setAttribute("aria-label", "Промени състоянието на целта");
    checkbox.addEventListener("change", () => {
      goal.completed = checkbox.checked;
      saveGoals();
      renderGoals();
    });

    const text = document.createElement("span");
    text.className = "goal-text";
    text.textContent = goal.text;

    const status = document.createElement("span");
    status.className = "goal-status";
    status.textContent = goal.completed ? "ГОТОВО" : "В ПРОЦЕС";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Изтрий целта");
    deleteButton.title = "Изтрий целта";
    deleteButton.addEventListener("click", () => {
      if (window.confirm("Сигурен ли си, че искаш да изтриеш тази цел?")) {
        goals = goals.filter(item => item.id !== goal.id);
        saveGoals();
        renderGoals();
      }
    });

    item.append(checkbox, text, status, deleteButton);
    return item;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const text = input.value.trim();

    if (!text) {
      showMessage("Моля, въведи учебна цел.", false);
      input.focus();
      return;
    }

    if (goals.some(goal => normalize(goal.text) === normalize(text))) {
      showMessage("Тази цел вече съществува в списъка.", false);
      input.focus();
      return;
    }

    goals.push({
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random(),
      text: text.replace(/\s+/g, " "),
      completed: false
    });
    saveGoals();
    input.value = "";
    showMessage("Целта е добавена успешно!", true);
    currentFilter = "all";
    updateFilterButtons();
    renderGoals();
    input.focus();
  });

  function updateFilterButtons() {
    filterButtons.forEach(button => {
      const selected = button.dataset.filter === currentFilter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      updateFilterButtons();
      renderGoals();
    });
  });

  function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    document.getElementById("themeIcon").textContent = theme === "light" ? "☾" : "☼";
    themeToggle.setAttribute("aria-label", theme === "light" ? "Включи тъмна тема" : "Включи светла тема");
  }

  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  } catch {
    savedTheme = "dark";
  }
  applyTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light") ? "dark" : "light";
    applyTheme(nextTheme);
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // Темата ще работи до презареждане, дори ако браузърът блокира localStorage.
    }
  });

  updateFilterButtons();
  renderGoals();
})();
