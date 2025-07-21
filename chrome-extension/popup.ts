// chrome-extension/popup.ts

import { MessageType, BaseMessage, ResponseMessage } from './shared/types';

console.log('Popup script geladen.');

/**
 * Hilfsfunktion zum Senden einer Nachricht an das Hintergrund-Skript.
 * Kapselt die Fehlerbehandlung für chrome.runtime.lastError.
 * Gibt eine Promise zurück, die mit der Antwort aufgelöst oder mit einem Fehler abgelehnt wird.
 * (Wiederverwendet aus dem Content-Skript, da die Logik identisch ist)
 */
async function sendMessageToBackground(message: BaseMessage): Promise<ResponseMessage> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response: ResponseMessage) => {
            if (chrome.runtime.lastError) {
                console.error('Popup: runtime.lastError beim Senden der Nachricht:', chrome.runtime.lastError.message);
                return reject(new Error(chrome.runtime.lastError.message));
            }
            resolve(response);
        });
    });
}

/**
 * Fügt Event-Listener zu den Buttons im Popup hinzu, um Nachrichten zu senden.
 */
document.addEventListener('DOMContentLoaded', () => {
    const pingButton = document.getElementById('pingButton') as HTMLButtonElement | null;
    const getDataButton = document.getElementById('getDataButton') as HTMLButtonElement | null;
    const processTextButton = document.getElementById('processTextButton') as HTMLButtonElement | null;
    const resultDiv = document.getElementById('result');

    if (pingButton) {
        pingButton.addEventListener('click', async () => {
            if (resultDiv) resultDiv.textContent = 'Pinging...';
            try {
                const response = await sendMessageToBackground({ type: MessageType.PING });
                if (response.success) {
                    if (resultDiv) resultDiv.textContent = `Ping-Ergebnis: ${response.data}`;
                } else {
                    if (resultDiv) resultDiv.textContent = `Ping-Fehler: ${response.error}`;
                }
            } catch (error: unknown) {
                // Narrow unknown error type to extract message if possible
                const message = error instanceof Error ? error.message : String(error);
                if (resultDiv) resultDiv.textContent = `Ping-Ausnahme: ${message}`;
            }
        });
    }

    if (getDataButton) {
        getDataButton.addEventListener('click', async () => {
            if (resultDiv) resultDiv.textContent = 'Daten werden abgerufen...';
            try {
                const response = await sendMessageToBackground({ type: MessageType.GET_DATA });
                if (response.success) {
                    if (resultDiv) resultDiv.textContent = `Daten-Ergebnis: ${JSON.stringify(response.data)}`;
                } else {
                    if (resultDiv) resultDiv.textContent = `Daten-Fehler: ${response.error}`;
                }
            } catch (error: unknown) {
                // Narrow unknown error type to extract message if possible
                const message = error instanceof Error ? error.message : String(error);
                if (resultDiv) resultDiv.textContent = `Daten-Ausnahme: ${message}`;
            }
        });
    }

    if (processTextButton) {
        processTextButton.addEventListener('click', async () => {
            const textInput = prompt('Geben Sie Text zur Verarbeitung ein:');
            if (!textInput) {
                if (resultDiv) resultDiv.textContent = 'Kein Text eingegeben.';
                return;
            }
            if (resultDiv) resultDiv.textContent = 'Text wird verarbeitet...';
            try {
                const response = await sendMessageToBackground({ type: MessageType.PROCESS_TEXT, payload: { text: textInput } });
                if (response.success) {
                    if (resultDiv) resultDiv.textContent = `Verarbeiteter Text: ${response.data}`;
                } else {
                    if (resultDiv) resultDiv.textContent = `Verarbeitungsfehler: ${response.error}`;
                }
            } catch (error: unknown) {
                // Narrow unknown error type to extract message if possible
                const message = error instanceof Error ? error.message : String(error);
                if (resultDiv) resultDiv.textContent = `Verarbeitungs-Ausnahme: ${message}`;
            }
        });
    }
});