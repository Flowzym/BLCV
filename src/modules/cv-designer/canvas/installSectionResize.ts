// src/modules/cv-designer/canvas/installSectionResize.ts
import { getFabric } from "@/lib/fabric-shim";

type WithData = fabric.Object & { data?: any };

function isSectionGroup(obj: any): obj is fabric.Group & WithData {
  // Check if it's a group and has a sectionId directly on the object, indicating it's one of our custom section groups
  return !!obj && obj.type === 'group' && !!(obj as any).sectionId;
}

function ensureRatios(group: fabric.Group & WithData) {
  const g: any = group as any;
  // Only compute ratios once
  if (g.__ratiosComputed) return;
  
  const gw = group.width || 1; // Group's current width
  const gh = group.height || 1; // Group's current height

  group._objects.forEach((child: any) => {
    // Calculate child's top-left corner relative to group's top-left corner
    const lx = (child.left ?? 0) + (child.originX === 'center' ? child.width!/2 : 0);
    // Calculate child's top-left corner relative to group's top-left corner
    // Assuming child.left and child.top are already relative to the group's top-left (default for Fabric.js objects in a group)
    )
    
    // Store ratios relative to group's original dimensions
    child.__ratio = {
      left: (child.left || 0) / gw,   // Ratio of child's left to group's width
      top:  (child.top || 0) / gh,    // Ratio of child's top to group's height
      width: (child.width || 0) / gw,
      height: (child.height || 0) / gh,
    };
  });
  g.__ratiosComputed = true;
}

export async function installSectionResize(canvas: fabric.Canvas) {
  const fabric = await getFabric();

  canvas.on("object:scaling", (e) => {
    const target = e.target as fabric.Group & WithData;
    if (!isSectionGroup(target)) return;

    // Ensure ratios are computed (only once per group)
    ensureRatios(target);

    // Calculate new dimensions based on current scale
    const newW = (target.width || 0) * (target.scaleX || 1);
    const newH = (target.height || 0) * (target.scaleY || 1);

    // Normalize the group: set new dimensions and reset scale to 1
    target.set({ width: newW, height: newH, scaleX: 1, scaleY: 1 });

    const gw = newW || 1;
    const gh = newH || 1;
    const children = (target as any)._objects as fabric.Object[];

    children.forEach((child: any) => {
      const r = child.__ratio;
      if (!r) return;

      // Update child's size based on new group dimensions and stored ratios
      if (child.type === "textbox") {
        // For textboxes, only width controls reflow. Height is auto-calculated.
        // Set objectCaching to false temporarily to force re-render of text.
        child.set({ width: Math.max(1, r.width * gw), scaleX:1, scaleY:1, objectCaching:false });
        child.set("dirty", true); // Mark as dirty to ensure re-render
      } else if (child.type === "rect" || child.type === "image" || child.type === "line") {
        // For other objects, update both width and height
        child.set({
          width:  Math.max(1, r.width * gw),
          height: Math.max(1, r.height * gh),
          scaleX:1, scaleY:1
        });
      }

      // Update child's position based on new group dimensions and stored ratios
      // Positions are relative to the group's top-left origin
      const nx = r.left * gw;
      const ny = r.top  * gh;
      child.set({ left: nx, top: ny });
      child.setCoords(); // Update child's coordinates
    });

    target.setCoords(); // Update group's coordinates
    canvas.requestRenderAll(); // Request a re-render of the canvas
  });

  canvas.on("object:modified", (e) => {
    const target = e.target as fabric.Group & WithData;
    if (!isSectionGroup(target)) return;
    
    // Final cleanup after scaling/modification is complete
    (target as any)._objects?.forEach((child: any) => {
      if (child.type === "textbox") {
        // Re-enable object caching for textboxes for performance
        child.set({ objectCaching: true });
        child.set("dirty", true); // Mark as dirty to ensure final re-render
      }
      child.setCoords(); // Ensure all child coordinates are updated
    });
    target.setCoords(); // Ensure group coordinates are updated
    canvas.requestRenderAll(); // Final re-render
  });
}