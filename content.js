// Block listed sites and show blocking message
chrome.storage.local.get(["blockedSites"], (data) => {
  const blockedSites = data.blockedSites || [];
  const currentURL = window.location.hostname;

  if (blockedSites.some(site => currentURL.includes(site))) {
    document.body.innerHTML = `
      <div style="text-align:center;margin-top:20%;font-family:sans-serif;">
        <h1 style="font-size:2rem;color:#d32f2f;">⛔ Blocked by FocusGuard</h1>
        <p style="font-size:1.2rem;">This site is restricted for your productivity.</p>
      </div>
    `;

    // Update blocked site count in summary
    chrome.storage.local.get(["summary"], (data) => {
      const summary = data.summary || { blockedCount: 0, tasksCompleted: 0 };
      summary.blockedCount += 1;
      chrome.storage.local.set({ summary });
    });
  }
});

// Listen for task reminder alerts and show alert message instead of notifications
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showTaskAlert") {
    const msg = request.isEarly
      ? `🔔 Reminder: "${request.title}" is coming up in 10 minutes!`
      : `⏰ It's time for: "${request.title}"`;
    alert(msg);
    sendResponse({ received: true }); // optional, to confirm message handled
  }
});
