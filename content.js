chrome.storage.local.get(["blockedSites"], (data) => {
  const blockedSites = data.blockedSites || [];
  const currentURL = window.location.hostname;

  if (blockedSites.some(site => currentURL.includes(site))) {
    document.body.innerHTML = `
      <div style="text-align:center;margin-top:20%;">
        <h1>Blocked by FocusGuard</h1>
        <p>This site is restricted for your productivity.</p>
      </div>
    `;
    chrome.storage.local.get(["summary"], (data) => {
      const summary = data.summary || { blockedCount: 0, tasksCompleted: 0 };
      summary.blockedCount += 1;
      chrome.storage.local.set({ summary });
    });
  }
});
