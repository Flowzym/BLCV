import React, { useState } from "react";

const Popup = () => {
  const [response, setResponse] = useState("");

  const handlePing = () => {
    chrome.runtime.sendMessage({ type: "ping" }, (reply) => {
      if (chrome.runtime.lastError) {
        setResponse(`Fehler: ${chrome.runtime.lastError.message}`);
        return;
      }
      setResponse(JSON.stringify(reply));
    });
  };

  return (
    <div style={{ minWidth: 200, minHeight: 80, padding: 12 }}>
      <button onClick={handlePing}>Ping Background</button>
      <div style={{ marginTop: 12 }}>
        {response && <>Antwort: {response}</>}
      </div>
    </div>
  );
};

export default Popup;