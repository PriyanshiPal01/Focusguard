function addTask(title, timeString) {
  const taskTime = new Date(timeString).getTime();
  const now = Date.now();

  if (taskTime <= now) {
    alert("Please select a future time.");
    return;
  }

  const id = Date.now(); // unique task ID
  const task = {
    id,
    title,
    time: timeString
  };

  chrome.storage.local.get(["tasks"], (data) => {
    const tasks = data.tasks || [];
    tasks.push(task);
    chrome.storage.local.set({ 
      tasks,
      [`taskTitle-${id}`]: title  // store title separately for alarms
    });
  });

  const delayInMinutes = (taskTime - now) / (1000 * 60);
  const reminderDelay = delayInMinutes - 10;

  // Schedule alarm at task time
  chrome.alarms.create(`task:${id}`, { delayInMinutes });
  
  // Schedule 10 minutes before
  if (reminderDelay > 0) {
    chrome.alarms.create(`task:early:${id}`, { delayInMinutes: reminderDelay });
  }
}

function removeTask(taskId) {
  chrome.storage.local.get(["tasks"], (data) => {
    const tasks = (data.tasks || []).filter(task => task.id !== taskId);
    
    chrome.storage.local.set({ tasks }, () => {
      // Remove the alarms
      chrome.alarms.clear(`task:${taskId}`);
      chrome.alarms.clear(`task:early:${taskId}`);

      // Remove stored title
      chrome.storage.local.remove(`taskTitle-${taskId}`);
    });
  });
}


