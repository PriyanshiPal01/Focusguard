// Add blocked site
document.getElementById("addSiteBtn").addEventListener("click", () => {
  const site = document.getElementById("blockSiteInput").value.trim();
  if (site) {
    chrome.storage.local.get(["blockedSites"], (data) => {
      const sites = data.blockedSites || [];
      sites.push(site);
      chrome.storage.local.set({ blockedSites: sites });
      displaySites();
    });
  }
});

// Display blocked sites
function displaySites() {
  chrome.storage.local.get(["blockedSites"], (data) => {
    const list = document.getElementById("siteList");
    list.innerHTML = "";
    (data.blockedSites || []).forEach(site => {
      const li = document.createElement("li");
      li.textContent = site;
      list.appendChild(li);
    });
  });
}

// Add task
document.getElementById("addTaskBtn").addEventListener("click", () => {
  const title = document.getElementById("taskTitle").value;
  const time = document.getElementById("taskTime").value;
  if (title && time) {
    addTask(title, time);
    displayTasks();
  }
});

// Add task logic + alarm
function addTask(title, timeString) {
  const task = {
    title,
    time: timeString,
    id: Date.now()
  };

  chrome.storage.local.get(["tasks"], (data) => {
    const tasks = data.tasks || [];
    tasks.push(task);
    chrome.storage.local.set({ tasks });
  });

  const reminderTime = new Date(timeString).getTime();
  const delayInMinutes = (reminderTime - Date.now()) / (1000 * 60);
  if (delayInMinutes > 0) {
    chrome.alarms.create(`task:${title}`, { delayInMinutes });
  }
}

// Display tasks with delete button
function displayTasks() {
  chrome.storage.local.get(["tasks"], (data) => {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    (data.tasks || []).forEach(task => {
      const li = document.createElement("li");
      li.textContent = `${task.title} @ ${task.time}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.style.marginLeft = "10px";
      delBtn.style.background = "#e74c3c";
      delBtn.style.color = "white";
      delBtn.style.border = "none";
      delBtn.style.borderRadius = "3px";
      delBtn.style.cursor = "pointer";

      delBtn.addEventListener("click", () => {
        chrome.storage.local.get(["tasks"], (data) => {
          const updated = data.tasks.filter(t => t.id !== task.id);
          chrome.storage.local.set({ tasks: updated }, displayTasks);
        });

        chrome.alarms.clear(`task:${task.title}`);
      });

      li.appendChild(delBtn);
      list.appendChild(li);
    });
  });
}

// Show daily summary
document.getElementById("showSummaryBtn").addEventListener("click", () => {
  chrome.storage.local.get(["summary"], (data) => {
    const summary = data.summary || { blockedCount: 0, tasksCompleted: 0 };
    document.getElementById("summaryDisplay").innerText =
      `Sites Blocked: ${summary.blockedCount}\nTasks Completed: ${summary.tasksCompleted}`;
  });
});

// On load
window.onload = () => {
  displaySites();
  displayTasks();
};


