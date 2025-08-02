// 📄 src/lib/gptClient.ts

export const gpt = async (messages: { role: string; content: string }[]) => {
  // Dummy-Funktion für lokale GPT-Nutzung oder Testzwecke
  const lastMessage = messages[messages.length - 1]?.content || "No message"
  return `Simulierte GPT-Antwort auf: "${lastMessage}"`
}
