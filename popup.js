// ---------- BLOCKED SITES ----------
document.getElementById("addSiteBtn").addEventListener("click", () => {
  const site = document.getElementById("blockSiteInput").value.trim();
  if (site) {
    chrome.storage.local.get(["blockedSites"], (data) => {
      const sites = data.blockedSites || [];
      sites.push(site);
      chrome.storage.local.set({ blockedSites: sites }, displaySites);
    });
  }
});

function displaySites() {
  chrome.storage.local.get("blockedSites", (data) => {
    const list = document.getElementById("siteList");
    list.innerHTML = "";
    (data.blockedSites || []).forEach((site, index) => {
      const li = document.createElement("li");
      li.textContent = site;

      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.addEventListener("click", () => {
        const updatedSites = data.blockedSites.filter((_, i) => i !== index);
        chrome.storage.local.set({ blockedSites: updatedSites }, displaySites);
      });

      li.appendChild(delBtn);
      list.appendChild(li);
    });
  });
}

// ---------- TASKS ----------
document.getElementById("addTaskBtn").addEventListener("click", () => {
  const title = document.getElementById("taskTitle").value.trim();
  const time = document.getElementById("taskTime").value;
  if (title && time) {
    addTask(title, time);
    displayTasks();
  }
});

function addTask(title, timeString) {
  const taskTime = new Date(timeString).getTime();
  const now = Date.now();

  if (taskTime <= now) {
    alert("Please select a future time.");
    return;
  }

  const task = {
    title,
    time: timeString,
    id: Date.now()
  };

  chrome.storage.local.get(["tasks"], (data) => {
    const tasks = data.tasks || [];
    tasks.push(task);
    chrome.storage.local.set({ tasks }, () => {
      chrome.storage.local.set({ [`taskTitle-${task.id}`]: title });
    });
  });

  const delayInMinutes = (taskTime - now) / (1000 * 60);
  const earlyReminderMinutes = delayInMinutes - 10;

  chrome.alarms.create(`task:${task.id}`, { delayInMinutes });
  if (earlyReminderMinutes > 0) {
    chrome.alarms.create(`task:early:${task.id}`, { delayInMinutes: earlyReminderMinutes });
  }
}

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

        chrome.alarms.clear(`task:${task.id}`);
        chrome.alarms.clear(`task:early:${task.id}`);
        chrome.storage.local.remove(`taskTitle-${task.id}`);
      });

      li.appendChild(delBtn);
      list.appendChild(li);
    });
  });
}

// ---------- DAILY SUMMARY ----------
document.getElementById("showSummaryBtn").addEventListener("click", () => {
  chrome.storage.local.get(["summary"], (data) => {
    const summary = data.summary || { blockedCount: 0, tasksCompleted: 0 };
    document.getElementById("summaryDisplay").innerText =
      `Sites Blocked: ${summary.blockedCount}\nTasks Completed: ${summary.tasksCompleted}`;
  });
});

// ---------- ALERT HANDLER (for task reminders) ----------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showAlert") {
    const message = request.isEarly 
      ? `Reminder: ${request.title} is coming up in 10 minutes!`
      : `It's time for: ${request.title}`;

    alert(message);

    const audio = new Audio(chrome.runtime.getURL("notification.mp3"));
    audio.play();

    sendResponse({ received: true });
  }

  if (request.action === "playSound") {
    const audio = new Audio(chrome.runtime.getURL("notification.mp3"));
    audio.play();
  }
});

// ---------- INITIALIZE ----------
window.onload = () => {
  displaySites();
  displayTasks();
};
