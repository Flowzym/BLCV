chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Background: Nachricht empfangen:', msg);
  
  try {
    if (msg.type === "ping") {
      sendResponse({ pong: true, time: new Date().toISOString() });
    } else {
      sendResponse({ error: "Unbekannter Nachrichtentyp" });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
  
  return true; // wichtig für asynchrone Antworten
});