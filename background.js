let currentRuleId = 1000;

function addBlockedSiteRule(domain) {
  const rule = {
    id: currentRuleId++,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: domain,
      resourceTypes: ["main_frame"]
    }
  };

  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [rule],
    removeRuleIds: []
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Failed to add rule:", chrome.runtime.lastError.message);
    } else {
      console.log(`Blocked site: ${domain}`);
    }
  });
}

function removeBlockedSiteRule(ruleId) {
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [],
    removeRuleIds: [ruleId]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Failed to remove rule:", chrome.runtime.lastError.message);
    } else {
      console.log(`Removed rule ID: ${ruleId}`);
    }
  });
}

async function ensureOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play notification sounds',
  });
}
chrome.alarms.onAlarm.addListener(async (alarm) => {
  let taskId = null;
  let isEarly = false;

  if (alarm.name.startsWith("task:early:")) {
    taskId = alarm.name.split("task:early:")[1];
    isEarly = true;
  } else if (alarm.name.startsWith("task:")) {
    taskId = alarm.name.split("task:")[1];
  }

  if (!taskId) return;

  const data = await chrome.storage.local.get(`taskTitle-${taskId}`);
  const title = data[`taskTitle-${taskId}`] || "Scheduled Task";

  // Send message to all tabs to show alert
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {
        action: "showTaskAlert",
        title,
        isEarly,
      });
    });
  });
});



/*chrome.runtime.onInstalled.addListener(() => {
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

*/
