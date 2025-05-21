chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "playSound") {
    const audio = new Audio(chrome.runtime.getURL("notification.mp3"));
    audio.play();
    sendResponse({ played: true });
  }
});