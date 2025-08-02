// 📄 src/modules/cv-designer/layout-canvas/snapGrid.ts

export const DEFAULT_SNAP_SIZE = 20
export const MIN_SNAP_SIZE = 5
export const MAX_SNAP_SIZE = 100

let currentSnapSize = DEFAULT_SNAP_SIZE
let snapEnabled = true

export function setSnapSize(size: number) {
  if (size >= MIN_SNAP_SIZE && size <= MAX_SNAP_SIZE) {
    currentSnapSize = size
  }
}

export function getSnapSize(): number {
  return currentSnapSize
}

export function setSnapEnabled(enabled: boolean) {
  snapEnabled = enabled
}

export function isSnapEnabled(): boolean {
  return snapEnabled
}

/**
 * Snappt eine gegebene Zahl auf das aktuelle Raster
 */
export function snap(value: number, gridSize?: number): number {
  if (!snapEnabled) return value
  const effectiveGrid = gridSize ?? currentSnapSize
  return Math.round(value / effectiveGrid) * effectiveGrid
}

/**
 * Snappt Position und Größe eines Elements
 */
export function snapElement(element: {
  x: number
  y: number
  width: number
  height: number
}, gridSize?: number): {
  x: number
  y: number
  width: number
  height: number
} {
  if (!snapEnabled) return element
  
  const grid = gridSize ?? currentSnapSize
  return {
    x: snap(element.x, grid),
    y: snap(element.y, grid),
    width: snap(element.width, grid),
    height: snap(element.height, grid)
  }
}

/**
 * Snappt nur die Position eines Elements
 */
export function snapPosition(position: { x: number; y: number }, gridSize?: number): { x: number; y: number } {
  if (!snapEnabled) return position
  
  const grid = gridSize ?? currentSnapSize
  return {
    x: snap(position.x, grid),
    y: snap(position.y, grid)
  }
}

/**
 * Snappt nur die Größe eines Elements
 */
export function snapSize(size: { width: number; height: number }, gridSize?: number): { width: number; height: number } {
  if (!snapEnabled) return size
  
  const grid = gridSize ?? currentSnapSize
  return {
    width: Math.max(grid, snap(size.width, grid)),
    height: Math.max(grid, snap(size.height, grid))
  }
}

/**
 * Berechnet Snap-Guides für visuelles Feedback
 */
export function getSnapGuides(
  elements: Array<{ x: number; y: number; width: number; height: number }>,
  currentElement: { x: number; y: number; width: number; height: number },
  threshold: number = 5
): Array<{ type: 'vertical' | 'horizontal'; position: number; elements: string[] }> {
  const guides: Array<{ type: 'vertical' | 'horizontal'; position: number; elements: string[] }> = []
  
  elements.forEach((element, index) => {
    // Vertikale Guides (X-Positionen)
    const verticalPositions = [
      element.x, // Linke Kante
      element.x + element.width / 2, // Mitte
      element.x + element.width // Rechte Kante
    ]
    
    const currentVerticalPositions = [
      currentElement.x,
      currentElement.x + currentElement.width / 2,
      currentElement.x + currentElement.width
    ]
    
    verticalPositions.forEach(pos => {
      currentVerticalPositions.forEach(currentPos => {
        if (Math.abs(pos - currentPos) <= threshold) {
          const existingGuide = guides.find(g => g.type === 'vertical' && Math.abs(g.position - pos) <= 1)
          if (existingGuide) {
            existingGuide.elements.push(`element-${index}`)
          } else {
            guides.push({
              type: 'vertical',
              position: pos,
              elements: [`element-${index}`]
            })
          }
        }
      })
    })
    
    // Horizontale Guides (Y-Positionen)
    const horizontalPositions = [
      element.y, // Obere Kante
      element.y + element.height / 2, // Mitte
      element.y + element.height // Untere Kante
    ]
    
    const currentHorizontalPositions = [
      currentElement.y,
      currentElement.y + currentElement.height / 2,
      currentElement.y + currentElement.height
    ]
    
    horizontalPositions.forEach(pos => {
      currentHorizontalPositions.forEach(currentPos => {
        if (Math.abs(pos - currentPos) <= threshold) {
          const existingGuide = guides.find(g => g.type === 'horizontal' && Math.abs(g.position - pos) <= 1)
          if (existingGuide) {
            existingGuide.elements.push(`element-${index}`)
          } else {
            guides.push({
              type: 'horizontal',
              position: pos,
              elements: [`element-${index}`]
            })
          }
        }
      })
    })
  })
  
  return guides
}

/**
 * Magnetisches Snapping zu anderen Elementen
 */
export function magneticSnap(
  currentElement: { x: number; y: number; width: number; height: number },
  otherElements: Array<{ x: number; y: number; width: number; height: number }>,
  threshold: number = 10
): { x: number; y: number } {
  if (!snapEnabled) return { x: currentElement.x, y: currentElement.y }
  
  let snappedX = currentElement.x
  let snappedY = currentElement.y
  
  otherElements.forEach(element => {
    // X-Achse Snapping
    const xPositions = [
      element.x, // Linke Kante zu linker Kante
      element.x + element.width, // Linke Kante zu rechter Kante
      element.x - currentElement.width, // Rechte Kante zu linker Kante
      element.x + element.width - currentElement.width // Rechte Kante zu rechter Kante
    ]
    
    xPositions.forEach(pos => {
      if (Math.abs(currentElement.x - pos) <= threshold) {
        snappedX = pos
      }
    })
    
    // Y-Achse Snapping
    const yPositions = [
      element.y, // Obere Kante zu oberer Kante
      element.y + element.height, // Obere Kante zu unterer Kante
      element.y - currentElement.height, // Untere Kante zu oberer Kante
      element.y + element.height - currentElement.height // Untere Kante zu unterer Kante
    ]
    
    yPositions.forEach(pos => {
      if (Math.abs(currentElement.y - pos) <= threshold) {
        snappedY = pos
      }
    })
  })
  
  return { x: snappedX, y: snappedY }
}