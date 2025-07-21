// chrome-extension/background.ts

import { MessageType, BaseMessage } from './shared/types';

console.log('Background script geladen.');

/**
 * Listener für einmalige Nachrichten (chrome.runtime.sendMessage).
 * Stellt sicher, dass immer eine Antwort gesendet wird, auch bei Fehlern oder unbekannten Nachrichten.
 */
chrome.runtime.onMessage.addListener(
    (message: BaseMessage, _sender, sendResponse) => {
        console.log('Background: Nachricht empfangen:', message.type, message.payload);

        // Flag, das anzeigt, ob sendResponse asynchron aufgerufen wird.
        // Muss auf true gesetzt werden, wenn sendResponse nicht sofort aufgerufen wird.
        let isAsyncResponse = false;

        try {
            switch (message.type) {
                case MessageType.PING:
                    // Synchrone Antwort
                    sendResponse({ success: true, data: 'Pong vom Hintergrund-Skript!' });
                    break;

                case MessageType.GET_DATA:
                    // Asynchrone Operation: Daten von einer API abrufen oder komplexe Berechnung.
                    isAsyncResponse = true;
                    setTimeout(() => {
                        const data = { users: ['Alice', 'Bob', 'Charlie'], count: 3 };
                        sendResponse({ success: true, data: data });
                        console.log('Background: Asynchrone Antwort für GET_DATA gesendet.');
                    }, 100); // Simulierte Verzögerung
                    break;

                case MessageType.PROCESS_TEXT: {
                    // Asynchrone Operation mit Payload-Validierung.
                    isAsyncResponse = true;
                    const textToProcess = message.payload?.text;
                    if (typeof textToProcess !== 'string') {
                        sendResponse({ success: false, error: 'Ungültige Text-Payload.' });
                        console.log(
                            'Background: Fehlerantwort für PROCESS_TEXT (ungültige Payload) gesendet.'
                        );
                    } else {
                        setTimeout(() => {
                            const processedText = textToProcess.toUpperCase();
                            sendResponse({ success: true, data: processedText });
                            console.log('Background: Asynchrone Antwort für PROCESS_TEXT gesendet.');
                        }, 50); // Simulierte Verzögerung
                    }
                    break;
                }

                default:
                    // WICHTIG: Behandelt unbekannte Nachrichtentypen, um runtime.lastError zu vermeiden.
                    sendResponse({ success: false, error: `Unbekannter Nachrichtentyp: ${message.type}` });
                    console.log('Background: Fehlerantwort für unbekannten Nachrichtentyp gesendet.');
                    break;
            }
        } catch (error: unknown) {
            // WICHTIG: Fängt synchrone Fehler während der Nachrichtenverarbeitung ab
            // und sendet eine Fehlerantwort.
            const message = error instanceof Error ? error.message : String(error);
            sendResponse({ success: false, error: `Fehler im Hintergrund-Skript: ${message}` });
            console.error('Background: Synchroner Fehler abgefangen:', error);
        }

        // Wenn eine asynchrone Antwort erwartet wird, muss true zurückgegeben werden.
        // Andernfalls wird der Nachrichtenkanal sofort geschlossen und der Sender erhält runtime.lastError.
        return isAsyncResponse;
    }
);

/**
 * Optional: Listener für langlebige Verbindungen (Ports).
 * Nützlich für häufige Kommunikation oder Streamen von Daten.
 */
chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
    console.log('Background: Port verbunden:', port.name);

    // Listener für Nachrichten, die über diesen Port gesendet werden.
    port.onMessage.addListener((message: BaseMessage) => {
        console.log('Background: Port-Nachricht empfangen:', port.name, message.type);
        try {
            switch (message.type) {
                case MessageType.PING:
                    port.postMessage({ success: true, data: 'Pong vom Hintergrund-Skript (Port)!' });
                    break;
                // Fügen Sie hier weitere Nachrichtentypen für die Port-Kommunikation hinzu
                default:
                    port.postMessage({ success: false, error: `Unbekannter Port-Nachrichtentyp: ${message.type}` });
                    break;
            }
        } catch (error: unknown) {
            // Fehlerbehandlung für Port-Nachrichten
            const message = error instanceof Error ? error.message : String(error);
            port.postMessage({ success: false, error: `Fehler im Hintergrund-Port: ${message}` });
            console.error('Background: Fehler bei Port-Nachricht abgefangen:', error);
        }
    });

    // WICHTIG: Behandelt die Trennung des Ports.
    // chrome.runtime.lastError wird gesetzt, wenn die Trennung fehlerhaft war.
    port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
            console.error('Background: Port getrennt mit Fehler:', chrome.runtime.lastError.message);
        } else {
            console.log('Background: Port normal getrennt.');
        }
    });
});