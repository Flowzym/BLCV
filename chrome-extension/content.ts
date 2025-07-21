// chrome-extension/content.ts

import { MessageType, BaseMessage, ResponseMessage } from './shared/types';

console.log('Content script geladen.');

/**
 * Hilfsfunktion zum Senden einer Nachricht an das Hintergrund-Skript.
 * Kapselt die Fehlerbehandlung für chrome.runtime.lastError.
 * Gibt eine Promise zurück, die mit der Antwort aufgelöst oder mit einem Fehler abgelehnt wird.
 */
async function sendMessageToBackground(message: BaseMessage): Promise<ResponseMessage> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response: ResponseMessage) => {
            // WICHTIG: Überprüfen Sie chrome.runtime.lastError ZUERST.
            // Dies fängt Fälle ab, in denen der Nachrichtenkanal geschlossen wurde,
            // bevor eine Antwort empfangen werden konnte (z.B. Hintergrund-Skript entladen).
            if (chrome.runtime.lastError) {
                console.error('Content: runtime.lastError beim Senden der Nachricht:', chrome.runtime.lastError.message);
                // Lehnt die Promise mit dem Fehler von runtime.lastError ab.
                return reject(new Error(chrome.runtime.lastError.message));
            }
            // Wenn kein runtime.lastError vorliegt, wird die tatsächliche Antwort aufgelöst.
            resolve(response);
        });
    });
}

/**
 * Beispielnutzung der Nachrichtenübermittlung.
 * Führt verschiedene Nachrichtenanfragen aus und protokolliert die Ergebnisse.
 */
async function demonstrateMessaging() {
    try {
        console.log('Content: Sende PING-Nachricht...');
        const pingResponse = await sendMessageToBackground({ type: MessageType.PING });
        if (pingResponse.success) {
            console.log('Content: PING-Antwort:', pingResponse.data);
        } else {
            console.error('Content: PING fehlgeschlagen:', pingResponse.error);
        }

        console.log('Content: Sende GET_DATA-Nachricht...');
        const dataResponse = await sendMessageToBackground({ type: MessageType.GET_DATA });
        if (dataResponse.success) {
            console.log('Content: Empfangene Daten:', dataResponse.data);
        } else {
            console.error('Content: Datenabruf fehlgeschlagen:', dataResponse.error);
        }

        console.log('Content: Sende PROCESS_TEXT-Nachricht...');
        const textResponse = await sendMessageToBackground({ type: MessageType.PROCESS_TEXT, payload: { text: 'hallo welt von der webseite' } });
        if (textResponse.success) {
            console.log('Content: Verarbeiteter Text:', textResponse.data);
        } else {
            console.error('Content: Textverarbeitung fehlgeschlagen:', textResponse.error);
        }

        // Beispiel für einen unbekannten Nachrichtentyp (wird vom Hintergrund-Skript behandelt)
        console.log('Content: Sende UNKNOWN_MESSAGE-Nachricht...');
        const unknownResponse = await sendMessageToBackground({ type: 'UNKNOWN_MESSAGE' as MessageType });
        if (unknownResponse.success) {
            console.log('Content: Antwort auf unbekannte Nachricht:', unknownResponse.data);
        } else {
            console.error('Content: Fehler bei unbekannter Nachricht:', unknownResponse.error);
        }

    } catch (error: unknown) {
        // Fängt Fehler ab, die von sendMessageToBackground abgelehnt wurden (z.B. runtime.lastError)
        const message = error instanceof Error ? error.message : String(error); // handle unknown error shape
        console.error('Content: Fehler während der Nachrichtenübermittlung:', message);
    }
}

// Führen Sie die Demonstration aus, sobald das Content-Skript geladen ist.
demonstrateMessaging();

/**
 * Optional: Beispiel für eine langlebige Port-Verbindung vom Content-Skript.
 * Weniger üblich für einfache Anfragen/Antworten, aber demonstriert die Port-Behandlung.
 */
const port = chrome.runtime.connect({ name: 'content-script-port' });

// Listener für Nachrichten, die über diesen Port empfangen werden.
port.onMessage.addListener((message: ResponseMessage) => {
    console.log('Content: Port-Nachricht empfangen:', message);
});

// WICHTIG: Behandelt die Trennung des Ports.
port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
        console.error('Content: Port getrennt mit Fehler:', chrome.runtime.lastError.message);
    } else {
        console.log('Content: Port normal getrennt.');
    }
});

// Senden einer Nachricht über den Port
port.postMessage({ type: MessageType.PING });