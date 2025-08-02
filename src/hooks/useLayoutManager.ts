import { useState, useCallback, useMemo } from 'react';
import { LayoutElement, LayoutGroup, Section } from '@/modules/cv-designer/types/section';
import { generateId } from '@/utils/helpers';

// ============================================================================
// TYPES
// ============================================================================

export interface LayoutManagerConfig {
  gridSize?: number;
  snapToGrid?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface LayoutManagerActions {
  // Element Management
  addElement: (element: Omit<LayoutElement, 'id'>) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<LayoutElement>) => void;
  duplicateElement: (id: string) => void;
  
  // Position & Size
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  
  // Grouping
  groupElements: (elementIds: string[], groupTitle?: string) => void;
  ungroupElements: (groupId: string) => void;
  
  // Bulk Operations
  selectAll: () => void;
  clearLayout: () => void;
  reorderElements: (fromIndex: number, toIndex: number) => void;
  
  // Grid & Snapping
  setGridSize: (size: number) => void;
  toggleSnapToGrid: () => void;
  snapElementToGrid: (id: string) => void;
  snapAllToGrid: () => void;
  
  // Layout Operations
  autoArrange: () => void;
  alignElements: (elementIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeElements: (elementIds: string[], direction: 'horizontal' | 'vertical') => void;
}

export interface LayoutManagerReturn {
  layout: LayoutElement[];
  config: LayoutManagerConfig;
  actions: LayoutManagerActions;
  
  // Utility getters
  selectedElements: LayoutElement[];
  groups: LayoutGroup[];
  sections: Section[];
  
  // Statistics
  stats: {
    totalElements: number;
    totalGroups: number;
    totalSections: number;
    canvasUsage: number; // Percentage of canvas used
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Snaps a value to the nearest grid position
 */
function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Checks if an element is a group
 */
function isGroup(element: LayoutElement): element is LayoutGroup {
  return element.type === 'group' && 'children' in element;
}

/**
 * Checks if an element is a section
 */
function isSection(element: LayoutElement): element is Section {
  return !isGroup(element);
}

/**
 * Validates layout element properties
 */
function validateLayoutElement(element: LayoutElement): boolean {
  return !!(
    element.id &&
    element.type &&
    typeof element.x === 'number' &&
    typeof element.y === 'number' &&
    typeof element.width === 'number' &&
    typeof element.height === 'number'
  );
}

/**
 * Ensures element has required position/size properties
 */
function ensureElementProperties(element: Partial<LayoutElement>): LayoutElement {
  return {
    id: element.id || generateId(),
    type: element.type || 'text',
    x: element.x ?? 0,
    y: element.y ?? 0,
    width: element.width ?? 300,
    height: element.height ?? 100,
    title: element.title || '',
    content: element.content || '',
    ...element
  } as LayoutElement;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useLayoutManager(
  initialLayout: LayoutElement[] = [],
  initialConfig: LayoutManagerConfig = {},
  callbacks?: {
    onSaveLayout?: (layout: LayoutElement[]) => void;
    onLoadLayout?: () => Promise<LayoutElement[]> | LayoutElement[];
    onLayoutChange?: (layout: LayoutElement[]) => void;
  }
): LayoutManagerReturn {
  
  // State
  const [layout, setLayout] = useState<LayoutElement[]>(() => 
    initialLayout.map(ensureElementProperties)
  );
  
  const [config, setConfig] = useState<LayoutManagerConfig>({
    gridSize: 20,
    snapToGrid: true,
    canvasWidth: 800,
    canvasHeight: 1200,
    ...initialConfig
  });

  // Notify parent of layout changes
  const notifyLayoutChange = useCallback((newLayout: LayoutElement[]) => {
    callbacks?.onLayoutChange?.(newLayout);
  }, [callbacks]);

  // ============================================================================
  // ELEMENT MANAGEMENT
  // ============================================================================

  const addElement = useCallback((elementData: Omit<LayoutElement, 'id'>) => {
    const newElement = ensureElementProperties({
      ...elementData,
      id: generateId()
    });

    // Snap to grid if enabled
    if (config.snapToGrid && config.gridSize) {
      newElement.x = snapToGrid(newElement.x, config.gridSize);
      newElement.y = snapToGrid(newElement.y, config.gridSize);
      newElement.width = snapToGrid(newElement.width, config.gridSize);
      newElement.height = snapToGrid(newElement.height, config.gridSize);
    }

    const newLayout = [...layout, newElement];
    setLayout(newLayout);
    notifyLayoutChange(newLayout);
  }, [layout, config, notifyLayoutChange]);

  const removeElement = useCallback((id: string) => {
    const newLayout = layout.filter(element => {
      // If removing a group, also remove its children
      if (isGroup(element) && element.id === id) {
        return false;
      }
      // If removing a child of a group, remove it from the group
      if (isGroup(element)) {
        element.children = element.children.filter(child => child.id !== id);
      }
      return element.id !== id;
    });
    
    setLayout(newLayout);
    notifyLayoutChange(newLayout);
  }, [layout, notifyLayoutChange]);

  const updateElement = useCallback((id: string, updates: Partial<LayoutElement>) => {
    const newLayout = layout.map(element => {
      if (element.id === id) {
        const updated = { ...element, ...updates };
        
        // Snap to grid if enabled and position/size changed
        if (config.snapToGrid && config.gridSize) {
          if ('x' in updates) updated.x = snapToGrid(updated.x, config.gridSize);
          if ('y' in updates) updated.y = snapToGrid(updated.y, config.gridSize);
          if ('width' in updates) updated.width = snapToGrid(updated.width, config.gridSize);
          if ('height' in updates) updated.height = snapToGrid(updated.height, config.gridSize);
        }
        
        return updated;
      }
      
      // Update children in groups
      if (isGroup(element)) {
        const updatedChildren = element.children.map(child => 
          child.id === id ? { ...child, ...updates } : child
        );
        return { ...element, children: updatedChildren };
      }
      
      return element;
    });
    
    setLayout(newLayout);
    notifyLayoutChange(newLayout);
  }, [layout, config, notifyLayoutChange]);

  const duplicateElement = useCallback((id: string) => {
    const elementToDuplicate = layout.find(el => el.id === id);
    if (!elementToDuplicate) return;

    const duplicate = {
      ...elementToDuplicate,
      id: generateId(),
      x: elementToDuplicate.x + (config.gridSize || 20),
      y: elementToDuplicate.y + (config.gridSize || 20)
    };

    // If duplicating a group, also duplicate children with new IDs
    if (isGroup(duplicate)) {
      duplicate.children = duplicate.children.map(child => ({
        ...child,
        id: generateId()
      }));
    }

    const newLayout = [...layout, duplicate];
    setLayout(newLayout);
    notifyLayoutChange(newLayout);
  }, [layout, config, notifyLayoutChange]);

  // ============================================================================
  // POSITION & SIZE
  // ============================================================================

  const moveElement = useCallback((id: string, x: number, y: number) => {
    updateElement(id, { x, y });
  }, [updateElement]);

  const resizeElement = useCallback((id: string, width: number, height: number) => {
    updateElement(id, { width, height });
  }, [updateElement]);

  // ============================================================================
  // GROUPING
  // ============================================================================

  const groupElements = useCallback((elementIds: string[], groupTitle: string = 'Neue Gruppe') => {
    const elementsToGroup = layout.filter(el => elementIds.includes(el.id) && isSection(el));
    if (elementsToGroup.length < 2) return;

    // Calculate group bounds
    const minX = Math.min(...elementsToGroup.map(el => el.x));
    const minY = Math.min(...elementsToGroup.map(el => el.y));
    const maxX = Math.max(...elementsToGroup.map(el => el.x + el.width));
    const maxY = Math.max(...elementsToGroup.map(el => el.y + el.height));

    // Create new group
    const newGroup: LayoutGroup = {
      id: generateId(),
      type: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      children: elementsToGroup as Section[],
      props: {
        title: groupTitle,
        border: true,
        padding: '8px'
      }
    };

    // Remove grouped elements from layout and add group
    const newLayout = [
      ...layout.filter(el => !elementIds.includes(el.id)),
      newGroup
    ];

    setLayout(newLayout);
    notifyLayoutChange(newLayout);
  }, [layout, notifyLayoutChange]);

  const ungroupElements = useCallback((groupId: string) => {
    const group = layout.find(el => el.id === groupId && isGroup(el)) as LayoutGroup;
    if (!group) return;

    // Convert children back to individual elements
    const ungroupedElements: LayoutElement[] = group.children.map(child => ({
      ...child,
      x: group.x + (child.x || 0),
      y: group.y + (child.y || 0),
      width: child.width || 200,
      height: child.height || 80
    }));

    // Remove group and add ungrouped elements
    const newLayout = [
      ...layout.filter(el => el.id !== groupId),
      ...ungroupedElements
    ];

    setLayout(newLayout);
    notifyLayoutChange(newLayout);
  }, [layout, notifyLayoutChange]);

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  const clearLayout = useCallback(() => {
    setLayout([]);
    notifyLayoutChange([]);
  }, [notifyLayoutChange]);

  const reorderElements = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
        fromIndex >= layout.length || toIndex >= layout.length) return;

    const newLayout = [...layout];
    const [movedElement] = newLayout.splice(fromIndex, 1);
    newLayout.splice(toIndex, 0, movedElement);
    
    setLayout(newLayout);
    notifyLayoutChange(newLayout);
  }, [layout, notifyLayoutChange]);

  // ============================================================================
  // GRID & SNAPPING
  // ============================================================================

  const setGridSize = useCallback((size: number) => {
    if (size > 0 && size <= 200) {
      setConfig(prev => ({ ...prev, gridSize: size }));
    }
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    setConfig(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  }, []);

  const snapElementToGrid = useCallback((id: string) => {
    if (!config.gridSize) return;
    
    const element = layout.find(el => el.id === id);
    if (!element) return;

    updateElement(id, {
      x: snapToGrid(element.x, config.gridSize),
      y: snapToGrid(element.y, config.gridSize),
      width: snapToGrid(element.width, config.gridSize),
      height: snapToGrid(element.height, config.gridSize)
    });
  }, [layout, config.gridSize, updateElement]);

  const snapAllToGrid = useCallback(() => {
    if (!config.gridSize) return;
    
    const newLayout = layout.map(element => ({
      ...element,
      x: snapToGrid(element.x, config.gridSize!),
      y: snapToGrid(element.y, config.gridSize!),
      width: snapToGrid(element.width, config.gridSize!),
      height: snapToGrid(element.height, config.gridSize!)
    }));
    
    setLayout(newLayout);
    notifyLayoutChange(newLayout);
  }, [layout, config.gridSize, notifyLayoutChange]);

  // ============================================================================
  // LAYOUT OPERATIONS
  // ============================================================================

  const autoArrange = useCallback(() => {
    const gridSize = config.gridSize || 20;
    const padding = gridSize * 2;
    const columns = Math.floor((config.canvasWidth || 800) / (300 + padding));
    
    const newLayout = layout.map((element, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      
      return {
        ...element,
        x: padding + col * (300 + padding),
        y: padding + row * (120 + padding),
        width: 300,
        height: 100
      };
    });
    
    setLayout(newLayout);
    notifyLayoutChange(newLayout);
  }, [layout, config, notifyLayoutChange]);

  const alignElements = useCallback((elementIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const elementsToAlign = layout.filter(el => elementIds.includes(el.id));
    if (elementsToAlign.length < 2) return;

    let referenceValue: number;
    
    switch (alignment) {
      case 'left':
        referenceValue = Math.min(...elementsToAlign.map(el => el.x));
        elementsToAlign.forEach(el => updateElement(el.id, { x: referenceValue }));
        break;
      case 'right':
        referenceValue = Math.max(...elementsToAlign.map(el => el.x + el.width));
        elementsToAlign.forEach(el => updateElement(el.id, { x: referenceValue - el.width }));
        break;
      case 'center':
        const centerX = (Math.min(...elementsToAlign.map(el => el.x)) + 
                       Math.max(...elementsToAlign.map(el => el.x + el.width))) / 2;
        elementsToAlign.forEach(el => updateElement(el.id, { x: centerX - el.width / 2 }));
        break;
      case 'top':
        referenceValue = Math.min(...elementsToAlign.map(el => el.y));
        elementsToAlign.forEach(el => updateElement(el.id, { y: referenceValue }));
        break;
      case 'bottom':
        referenceValue = Math.max(...elementsToAlign.map(el => el.y + el.height));
        elementsToAlign.forEach(el => updateElement(el.id, { y: referenceValue - el.height }));
        break;
      case 'middle':
        const centerY = (Math.min(...elementsToAlign.map(el => el.y)) + 
                        Math.max(...elementsToAlign.map(el => el.y + el.height))) / 2;
        elementsToAlign.forEach(el => updateElement(el.id, { y: centerY - el.height / 2 }));
        break;
    }
  }, [layout, updateElement]);

  const distributeElements = useCallback((elementIds: string[], direction: 'horizontal' | 'vertical') => {
    const elementsToDistribute = layout.filter(el => elementIds.includes(el.id));
    if (elementsToDistribute.length < 3) return;

    elementsToDistribute.sort((a, b) => direction === 'horizontal' ? a.x - b.x : a.y - b.y);
    
    const first = elementsToDistribute[0];
    const last = elementsToDistribute[elementsToDistribute.length - 1];
    
    if (direction === 'horizontal') {
      const totalSpace = (last.x + last.width) - first.x;
      const elementSpace = elementsToDistribute.reduce((sum, el) => sum + el.width, 0);
      const gap = (totalSpace - elementSpace) / (elementsToDistribute.length - 1);
      
      let currentX = first.x;
      elementsToDistribute.forEach((el, index) => {
        if (index > 0) {
          updateElement(el.id, { x: currentX });
        }
        currentX += el.width + gap;
      });
    } else {
      const totalSpace = (last.y + last.height) - first.y;
      const elementSpace = elementsToDistribute.reduce((sum, el) => sum + el.height, 0);
      const gap = (totalSpace - elementSpace) / (elementsToDistribute.length - 1);
      
      let currentY = first.y;
      elementsToDistribute.forEach((el, index) => {
        if (index > 0) {
          updateElement(el.id, { y: currentY });
        }
        currentY += el.height + gap;
      });
    }
  }, [layout, updateElement]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedElements = useMemo(() => 
    layout.filter(el => el.props?.selected), 
    [layout]
  );

  const groups = useMemo(() => 
    layout.filter(isGroup), 
    [layout]
  );

  const sections = useMemo(() => 
    layout.filter(isSection), 
    [layout]
  );

  const stats = useMemo(() => {
    const totalElements = layout.length;
    const totalGroups = groups.length;
    const totalSections = sections.length;
    
    // Calculate canvas usage
    let canvasUsage = 0;
    if (layout.length > 0 && config.canvasWidth && config.canvasHeight) {
      const maxX = Math.max(...layout.map(el => el.x + el.width));
      const maxY = Math.max(...layout.map(el => el.y + el.height));
      const usedArea = maxX * maxY;
      const totalArea = config.canvasWidth * config.canvasHeight;
      canvasUsage = Math.min(100, (usedArea / totalArea) * 100);
    }
    
    return {
      totalElements,
      totalGroups,
      totalSections,
      canvasUsage: Math.round(canvasUsage)
    };
  }, [layout, groups, sections, config]);

  // ============================================================================
  // ACTIONS OBJECT
  // ============================================================================

  const actions: LayoutManagerActions = useMemo(() => ({
    // Element Management
    addElement,
    removeElement,
    updateElement,
    duplicateElement,
    
    // Position & Size
    moveElement,
    resizeElement,
    
    // Grouping
    groupElements,
    ungroupElements,
    
    // Bulk Operations
    selectAll: () => {
      const newLayout = layout.map(el => ({
        ...el,
        props: { ...el.props, selected: true }
      }));
      setLayout(newLayout);
      notifyLayoutChange(newLayout);
    },
    clearLayout,
    reorderElements,
    
    // Grid & Snapping
    setGridSize,
    toggleSnapToGrid,
    snapElementToGrid,
    snapAllToGrid,
    
    // Layout Operations
    autoArrange,
    alignElements,
    distributeElements
  }), [
    addElement, removeElement, updateElement, duplicateElement,
    moveElement, resizeElement, groupElements, ungroupElements,
    clearLayout, reorderElements, setGridSize, toggleSnapToGrid,
    snapElementToGrid, snapAllToGrid, autoArrange, alignElements,
    distributeElements, layout, notifyLayoutChange
  ]);

  // ============================================================================
  // RETURN VALUE
  // ============================================================================

  return {
    layout,
    config,
    actions,
    selectedElements,
    groups,
    sections,
    stats
  };
}

export default useLayoutManager;