export const generateId = (): string => {
  return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9)
}