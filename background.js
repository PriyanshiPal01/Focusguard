chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    blockedSites: [],
    tasks: [],
    summary: { blockedCount: 0, tasksCompleted: 0 }
  });
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const hostname = url.hostname.replace(/^www\./, '');

    return new Promise((resolve) => {
      chrome.storage.local.get(["blockedSites", "summary"], (data) => {
        const blocked = data.blockedSites || [];
        if (blocked.includes(hostname)) {
          const summary = data.summary || { blockedCount: 0, tasksCompleted: 0 };
          summary.blockedCount += 1;
          chrome.storage.local.set({ summary });
          resolve({ cancel: true });
        } else {
          resolve({ cancel: false });
        }
      });
    });
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("task:")) {
    const taskTitle = alarm.name.split("task:")[1];

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon.png",
      title: "Task Reminder",
      message: `It's time for: ${taskTitle}`,
      priority: 2
    });

    chrome.storage.local.get(["tasks", "summary"], (data) => {
      let tasks = data.tasks || [];
      tasks = tasks.filter(task => task.title !== taskTitle);
      chrome.storage.local.set({ tasks });

      const summary = data.summary || { blockedCount: 0, tasksCompleted: 0 };
      summary.tasksCompleted += 1;
      chrome.storage.local.set({ summary });
    });
  }
});


