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
    chrome.storage.local.set({ tasks });
  });

  const delayInMinutes = (taskTime - now) / (1000 * 60);
  chrome.alarms.create(`task:${title}`, { delayInMinutes });
}


