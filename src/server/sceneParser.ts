import type { SceneDiagramAnalysis } from "../client/utils/sceneDiagramAnalyzer";
import { libraryMapping } from "../client/assets/libraries/libraryMapping";

// Helper to infer type from shape and tag
function inferTypeFromShapeAndTag(elements: any[]): string {
  // First check if any element has a tag
  const taggedElement = elements.find((el) => el.tag);
  if (taggedElement) {
    const tag = taggedElement.tag.toLowerCase();

    // Map library component names to types
    if (tag.includes("user request")) return "input";
    if (tag.includes("auth") && tag.includes("iam")) return "auth";
    if (tag.includes("message queue") || tag.includes("message q"))
      return "queue";
    if (tag.includes("mobile")) return "output";
    if (tag.includes("archive")) return "storage";
    if (tag.includes("server")) return "process";
    if (
      tag.includes("application server") ||
      tag.includes("multi instance server")
    )
      return "process";
    if (
      tag.includes("relational database") ||
      tag.includes("document db") ||
      tag.includes("columnar db") ||
      tag.includes("graph db")
    )
      return "database";
    if (
      tag.includes("object storage") ||
      tag.includes("cold storage") ||
      tag.includes("stack storage") ||
      tag.includes("storage")
    )
      return "storage";
    if (tag.includes("load balancer")) return "load_balancer";
    if (tag.includes("cache")) return "cache";
    if (tag.includes("content delivery network")) return "cdn";
    if (tag.includes("dns server")) return "dns";
    if (tag.includes("pipeline")) return "pipeline";
    if (tag.includes("multi instance")) return "multi_instance";
    if (tag.includes("cloud")) return "cloud";
    if (tag.includes("web application")) return "web_app";
    if (tag.includes("sftp") || tag.includes("ssh")) return "file_transfer";
    if (tag.includes("slack")) return "communication";
  }

  // Check text content for component identification
  const textElements = elements.filter((el) => el.type === "text" && el.text);
  for (const textEl of textElements) {
    const text = textEl.text.toLowerCase();

    // Map by text content
    if (text.includes("user") && text.includes("request")) return "input";
    if (text.includes("auth") && text.includes("iam")) return "auth";
    if (text.includes("message") && text.includes("q")) return "queue";
    if (text.includes("mobile")) return "output";
    if (text.includes("archive")) return "storage";
    if (text.includes("server")) return "process";
    if (
      text.includes("start") ||
      text.includes("begin") ||
      text.includes("init")
    )
      return "start_point";
    if (
      text.includes("end") ||
      text.includes("stop") ||
      text.includes("terminate") ||
      text.includes("finish")
    )
      return "end_point";
    if (text.includes("is ") || text.includes("?") || text.includes("if ") || text.includes("condition") || text.includes("yes") || text.includes("no")) return "decision";
  }

  // Check for circles/ellipses that might be start/end points
  const circleElements = elements.filter(
    (el) => el.type === "ellipse" || el.type === "circle"
  );
  if (circleElements.length > 0) {
    // Check text content for start/end indicators
    for (const textEl of textElements) {
      const text = textEl.text.toLowerCase();
      if (
        text.includes("start") ||
        text.includes("begin") ||
        text.includes("init")
      )
        return "start_point";
      if (
        text.includes("end") ||
        text.includes("stop") ||
        text.includes("terminate") ||
        text.includes("finish")
      )
        return "end_point";
    }

    // Also check for nearby text that might indicate start/end points
    const hasStartText = textElements.some((textEl) => {
      const text = textEl.text.toLowerCase();
      return (
        text.includes("start") ||
        text.includes("begin") ||
        text.includes("init")
      );
    });

    const hasEndText = textElements.some((textEl) => {
      const text = textEl.text.toLowerCase();
      return (
        text.includes("end") ||
        text.includes("stop") ||
        text.includes("terminate") ||
        text.includes("finish")
      );
    });

    if (hasStartText) return "start_point";
    if (hasEndText) return "end_point";
  }

  // Fallback to shape-based inference
  const types = elements.map((el) => el.type);
  if (types.includes("ellipse") || types.includes("cylinder"))
    return "database";
  if (types.includes("rectangle")) return "process";
  if (types.includes("diamond")) return "decision";
  return "component";
}

// Helper to get component name from elements
function getComponentName(elements: any[]): string {
  // Find all text elements in the group
  const textElements = elements.filter(
    (el) => el.type === "text" && el.text && el.text.trim() !== ""
  );

  // If we have text elements, prioritize longer, more descriptive text
  if (textElements.length > 0) {
    // Sort text elements by length (longer text first) and filter out garbage
    const validTextElements = textElements
      .map((el) => ({ element: el, text: el.text.trim() }))
      .filter(
        ({ text }) =>
          text.length > 0 &&
          text.length < 100 &&
          !text.toLowerCase().includes("lorem ipsum")
      )
      .sort((a, b) => b.text.length - a.text.length); // Longer text first

    for (const { element: textEl, text } of validTextElements) {
      // Map common component names by text content
      const lowerText = text.toLowerCase();

      if (lowerText.includes("server")) {
        return "Server";
      }
      if (lowerText.includes("auth") && lowerText.includes("iam")) {
        return "Auth & IAM";
      }
      if (lowerText.includes("message") && lowerText.includes("q")) {
        return "Message Q";
      }
      if (lowerText.includes("mobile")) {
        return "Mobile";
      }
      if (lowerText.includes("archive")) {
        return "Archive";
      }
      if (lowerText.includes("user") && lowerText.includes("request")) {
        return "User Request";
      }
      if (lowerText.includes("start")) {
        return "Start";
      }
      if (lowerText.includes("end")) {
        return "End";
      }
      if (lowerText.includes("is ") && lowerText.includes("?")) {
        return text; // Decision text
      }
      if (lowerText.includes("generated") && lowerText.includes("?")) {
        return text; // Decision text
      }
      if (lowerText.includes("successfully") && lowerText.includes("?")) {
        return text; // Decision text
      }

      // If no specific mapping, return the text as-is
      return text;
    }
  }

  // Try library mapping as fallback
  const mappedElement = elements.find(
    (el) =>
      el.type === "text" && typeof el.id === "string" && el.id in libraryMapping
  );
  if (mappedElement) {
    return libraryMapping[mappedElement.id as keyof typeof libraryMapping];
  }

  // If we still have no name, throw error with details
  throw Error(
    "No component name found: " +
      JSON.stringify({
        elements: elements.map((el) => ({
          type: el.type,
          text: el.text,
          tag: el.tag,
        })),
        textElements: textElements.map((el) => el.text),
      })
  );
}

// Helper to find text elements near a component
function findNearbyText(
  elements: any[],
  componentElements: any[]
): string | null {
  // Find the main shape element to get its position
  const mainShape = componentElements.find(
    (el) =>
      el.type === "rectangle" ||
      el.type === "ellipse" ||
      el.type === "diamond" ||
      el.type === "cylinder"
  );

  if (!mainShape) return null;

  // Calculate component bounds
  const componentBounds = {
    minX: Math.min(...componentElements.map((el) => el.x || 0)),
    maxX: Math.max(
      ...componentElements.map((el) => (el.x || 0) + (el.width || 0))
    ),
    minY: Math.min(...componentElements.map((el) => el.y || 0)),
    maxY: Math.max(
      ...componentElements.map((el) => (el.y || 0) + (el.height || 0))
    ),
  };

  // Look for text elements that are positioned near this component
  const nearbyTexts = elements.filter(
    (el) =>
      el.type === "text" &&
      el.text &&
      el.text.trim() !== "" &&
      !el.groupIds?.length && // Only ungrouped texts
      el.x >= componentBounds.minX - 50 &&
      el.x <= componentBounds.maxX + 50 &&
      el.y >= componentBounds.minY - 50 &&
      el.y <= componentBounds.maxY + 50
  );

  if (nearbyTexts.length > 0) {
    // Filter out garbage text and find the best match
    const validTexts = nearbyTexts.filter((text) => {
      const textContent = text.text.trim().toLowerCase();
      return (
        textContent.length > 0 &&
        textContent.length < 100 &&
        !textContent.includes("lorem ipsum") &&
        !textContent.includes("consectetur") &&
        !textContent.includes("adipiscing")
      );
    });

    if (validTexts.length === 0) return null;

    // Return the closest text
    const closestText = validTexts.reduce((closest, current) => {
      const closestDist = Math.sqrt(
        Math.pow(
          closest.x - (componentBounds.minX + componentBounds.maxX) / 2,
          2
        ) +
          Math.pow(
            closest.y - (componentBounds.minY + componentBounds.maxY) / 2,
            2
          )
      );
      const currentDist = Math.sqrt(
        Math.pow(
          current.x - (componentBounds.minX + componentBounds.maxX) / 2,
          2
        ) +
          Math.pow(
            current.y - (componentBounds.minY + componentBounds.maxY) / 2,
            2
          )
      );
      return currentDist < closestDist ? current : closest;
    });

    return closestText.text;
  }

  return null;
}

// Helper to analyze scene and generate a natural language explanation
export function parseSceneToExplanation(scene: any[]): {
  analysis: SceneDiagramAnalysis;
  explanation: string;
} {
  // --- Extract components and relationships ---

  // First, identify library components by their tags
  const taggedElements = scene.filter(
    (el) => el.tag && el.tag.trim() !== "" && !el.isDeleted
  );

  const componentGroups: Record<string, any[]> = {};

  // Group elements by their tag
  taggedElements.forEach((el) => {
    if (!componentGroups[el.tag]) {
      componentGroups[el.tag] = [];
    }
    componentGroups[el.tag].push(el);
  });



  let components: any[] = [];
  let componentGroupsForRelationships: Record<string, any[]> = {};

  // If no tagged elements found, try to detect by groupIds (fallback)
  if (taggedElements.length === 0) {

    // Group elements by groupIds
    const groupMap: Record<string, any[]> = {};
    scene.forEach((el) => {
      if (el.groupIds && el.groupIds.length > 0) {
        el.groupIds.forEach((gid: string) => {
          if (!groupMap[gid]) groupMap[gid] = [];
          groupMap[gid].push(el);
        });
      }
    });

    console.log(
      "[SceneParser] Group map:",
      Object.keys(groupMap).map(
        (gid) => `${gid}: ${groupMap[gid].length} elements`
      )
    );

    // Filter out groups that are just connections (only lines/arrows) or have no text elements
    const componentGroupMap: Record<string, any[]> = {};
    Object.entries(groupMap).forEach(([groupId, elements]) => {
      // Check if this group has any non-line elements (actual components)
      const hasComponents = elements.some(
        (el) =>
          el.type !== "line" && el.type !== "arrow" && el.type !== "freedraw"
      );

      // Check if this group has any text elements (needed for component names)
      const textElements = elements.filter(
        (el) => el.type === "text" && el.text && el.text.trim() !== ""
      );

      // Check if any text elements are valid (not garbage)
      const hasValidText = textElements.some((el) => {
        const text = el.text.trim().toLowerCase();
        return (
          text.length > 0 &&
          text.length < 100 &&
          !text.includes("lorem ipsum") &&
          !text.includes("consectetur") &&
          !text.includes("adipiscing")
        );
      });

      if (hasComponents && hasValidText) {
        componentGroupMap[groupId] = elements;
      } else {
        console.log(
          `[SceneParser] Skipping group ${groupId} - hasComponents: ${hasComponents}, hasValidText: ${hasValidText}, elements:`,
          elements.map((el) => el.type)
        );
      }
    });

    console.log(
      "[SceneParser] Component groups after filtering:",
      Object.keys(componentGroupMap).map(
        (gid) => `${gid}: ${componentGroupMap[gid].length} elements`
      )
    );

    // Create components from groups
    const groupComponents = Object.entries(componentGroupMap)
      .map(([groupId, elements]) => {
        const mainEl = elements.find((el) => el.type !== "text") || elements[0];
        if (!mainEl) return undefined;

        // Check for group tag at index 0 (new method)
        let groupTag = null;
        if (
          elements.length > 0 &&
          elements[0].groupIds &&
          elements[0].groupIds.length > 0
        ) {
          // Look for any element in this group that has a tag
          const taggedElement = elements.find((el) => el.tag);
          if (taggedElement) {
            groupTag = taggedElement.tag;
          }
        }

        const componentName = getComponentName(elements);
        const componentType = inferTypeFromShapeAndTag(elements);

        // Try to find nearby text if no name found
        let finalComponentName = componentName;
        if (componentName === "Unnamed Component") {
          const nearbyText = findNearbyText(scene, elements);
          if (nearbyText) {
            finalComponentName = nearbyText;
          }
        }

        // Try to identify library components by text content
        let libraryComponentName = finalComponentName;
        if (finalComponentName === "Unnamed Component") {
          const textElement = elements.find(
            (el) => el.type === "text" && el.text
          );
          if (textElement) {
            const text = textElement.text.toLowerCase();
            // Check for known library component names
            if (text.includes("auth") && text.includes("iam")) {
              libraryComponentName = "Auth & IAM";
            } else if (text.includes("message") && text.includes("q")) {
              libraryComponentName = "Message Q";
            } else if (text.includes("mobile")) {
              libraryComponentName = "Mobile";
            } else if (text.includes("server")) {
              libraryComponentName = "Server";
            } else if (text.includes("archive")) {
              libraryComponentName = "Archive";
            } else if (text.includes("user") && text.includes("request")) {
              libraryComponentName = "User Request";
            }
          }
        }

        // Also check nearby text for component identification
        if (libraryComponentName === "Unnamed Component") {
          const nearbyText = findNearbyText(scene, elements);
          if (nearbyText) {
            const text = nearbyText.toLowerCase();
            if (text.includes("auth") && text.includes("iam")) {
              libraryComponentName = "Auth & IAM";
            } else if (text.includes("message") && text.includes("q")) {
              libraryComponentName = "Message Q";
            } else if (text.includes("mobile")) {
              libraryComponentName = "Mobile";
            } else if (text.includes("server")) {
              libraryComponentName = "Server";
            } else if (text.includes("archive")) {
              libraryComponentName = "Archive";
            } else if (text.includes("user") && text.includes("request")) {
              libraryComponentName = "User Request";
            } else {
              // Only use nearby text if it's not garbage
              const cleanText = nearbyText.trim();
              if (
                cleanText.length > 0 &&
                cleanText.length < 50 &&
                !cleanText.toLowerCase().includes("lorem ipsum") &&
                !cleanText.toLowerCase().includes("consectetur")
              ) {
                libraryComponentName = cleanText;
              }
            }
          }
        }

        // Additional check: Look for specific visual patterns
        if (libraryComponentName === "Unnamed Component") {
          const elementTypes = elements.map((el) => el.type);
          const hasEllipses = elementTypes.includes("ellipse");
          const hasRectangles = elementTypes.includes("rectangle");
          const hasLines = elementTypes.includes("line");

          // Check for Archive component pattern (file cabinet icon)
          if (hasRectangles && hasLines && elements.length > 5) {
            const textElements = elements.filter(
              (el) => el.type === "text" && el.text
            );
            const hasArchiveText = textElements.some((el) =>
              el.text.toLowerCase().includes("archive")
            );
            if (hasArchiveText) {
              libraryComponentName = "Archive";
            }
          }
        }

        console.log(`[SceneParser] Processing group ${groupId}:`, {
          name: libraryComponentName,
          type: componentType,
          tag: groupTag,
          elementTypes: elements.map((el) => el.type),
          nearbyText:
            finalComponentName !== componentName ? finalComponentName : null,
        });

        return {
          id: groupId,
          name: libraryComponentName,
          type: componentType,
          position: { x: mainEl.x, y: mainEl.y },
          tag: groupTag,
        };
      })
      .filter(
        (
          c
        ): c is {
          id: string;
          name: string;
          type: string;
          position: { x: number; y: number };
          tag: string | null;
        } => !!c
      );

    // Handle ungrouped elements
    const ungroupedShapes = scene.filter(
      (el) =>
        (el.type === "rectangle" ||
          el.type === "ellipse" ||
          el.type === "cylinder" ||
          el.type === "diamond") &&
        !el.isDeleted &&
        (!el.groupIds || el.groupIds.length === 0)
    );

    const texts = scene.filter((el) => el.type === "text" && !el.isDeleted);
    const ungroupedComponents = ungroupedShapes.map((shape) => {
      const label = texts.find((txt) => txt.containerId === shape.id);
      let componentName = label ? label.text : "Unnamed";

      // Try to find nearby text if no label found
      if (componentName === "Unnamed") {
        const nearbyText = findNearbyText(scene, [shape]);
        if (nearbyText) {
          componentName = nearbyText;
        }
      }

      // Determine component type based on shape and text content
      let componentType = "process";
      if (shape.type === "ellipse" || shape.type === "cylinder") {
        // Check if it's a database or start/end point
        if (label && label.text) {
          const text = label.text.toLowerCase();
          if (
            text.includes("start") ||
            text.includes("begin") ||
            text.includes("init")
          ) {
            componentType = "start_point";
          } else if (
            text.includes("end") ||
            text.includes("stop") ||
            text.includes("terminate") ||
            text.includes("finish")
          ) {
            componentType = "end_point";
          } else {
            componentType = "database";
          }
        } else {
          // Check for nearby text that might indicate start/end
          const nearbyText = findNearbyText(scene, [shape]);
          if (nearbyText) {
            const text = nearbyText.toLowerCase();
            if (
              text.includes("start") ||
              text.includes("begin") ||
              text.includes("init")
            ) {
              componentType = "start_point";
            } else if (
              text.includes("end") ||
              text.includes("stop") ||
              text.includes("terminate") ||
              text.includes("finish")
            ) {
              componentType = "end_point";
            } else {
              componentType = "database";
            }
          } else {
            componentType = "database";
          }
        }
      } else if (shape.type === "diamond") {
        componentType = "decision";
      }

      // Check for group tag in the shape itself
      let groupTag = shape.tag || null;

      console.log(`[SceneParser] Processing ungrouped shape ${shape.id}:`, {
        name: componentName,
        type: componentType,
        shapeType: shape.type,
        tag: groupTag,
      });

      return {
        id: shape.id,
        name: componentName,
        type: componentType,
        position: { x: shape.x, y: shape.y },
        tag: groupTag,
      };
    });

    components = [...groupComponents, ...ungroupedComponents];
    componentGroupsForRelationships = groupMap;
  } else {
    // Create components from tagged groups
    const taggedComponents = Object.entries(componentGroups)
      .map(([tag, elements]) => {
        // Find the main shape element (rectangle, ellipse, etc.)
        const mainShape = elements.find(
          (el) =>
            el.type === "rectangle" ||
            el.type === "ellipse" ||
            el.type === "diamond" ||
            el.type === "cylinder"
        );

        // Find text element for display name
        const textElement = elements.find(
          (el) => el.type === "text" && el.text
        );

        if (!mainShape) return null;

        const componentName = textElement ? textElement.text : tag;
        const componentType = inferTypeFromShapeAndTag(elements);

        // Check for group tag in the elements
        let groupTag = tag;
        const taggedElement = elements.find((el) => el.tag);
        if (taggedElement) {
          groupTag = taggedElement.tag;
        }

        console.log(`[SceneParser] Processing tagged component "${tag}":`, {
          name: componentName,
          type: componentType,
          elementTypes: elements.map((el) => el.type),
          groupTag: groupTag,
        });

        return {
          id: mainShape.id,
          name: componentName,
          type: componentType,
          position: { x: mainShape.x, y: mainShape.y },
          tag: groupTag,
        };
      })
      .filter(
        (
          c
        ): c is {
          id: string;
          name: string;
          type: string;
          position: { x: number; y: number };
          tag: string;
        } => !!c
      );

    // Handle ungrouped elements (elements without tags)
    const untaggedElements = scene.filter(
      (el) =>
        !el.tag &&
        !el.isDeleted &&
        (el.type === "rectangle" ||
          el.type === "ellipse" ||
          el.type === "diamond" ||
          el.type === "cylinder")
    );

    const texts = scene.filter((el) => el.type === "text" && !el.isDeleted);
    const ungroupedComponents = untaggedElements.map((shape) => {
      const label = texts.find((txt) => txt.containerId === shape.id);
      const componentName = label ? label.text : "Unnamed";

      // Determine component type based on shape and text content
      let componentType = "process";
      if (shape.type === "ellipse" || shape.type === "cylinder") {
        // Check if it's a database or start/end point
        if (label && label.text) {
          const text = label.text.toLowerCase();
          if (
            text.includes("start") ||
            text.includes("begin") ||
            text.includes("init")
          ) {
            componentType = "start_point";
          } else if (
            text.includes("end") ||
            text.includes("stop") ||
            text.includes("terminate") ||
            text.includes("finish")
          ) {
            componentType = "end_point";
          } else {
            componentType = "database";
          }
        } else {
          componentType = "database";
        }
      } else if (shape.type === "diamond") {
        componentType = "decision";
      }

      console.log(`[SceneParser] Processing ungrouped shape ${shape.id}:`, {
        name: componentName,
        type: componentType,
        shapeType: shape.type,
        tag: shape.tag || null,
      });

      return {
        id: shape.id,
        name: componentName,
        type: componentType,
        position: { x: shape.x, y: shape.y },
        tag: shape.tag || null,
      };
    });

    components = [...taggedComponents, ...ungroupedComponents];
    componentGroupsForRelationships = componentGroups;
  }

  // Improved relationship detection with better arrow analysis
  const arrows = scene.filter((el) => el.type === "arrow" && !el.isDeleted);
  console.log("[SceneParser] Found arrows:", arrows.length);

  // First, collect all relationships
  const allRelationships = arrows
    .map((arrow) => {
      console.log("[SceneParser] Processing arrow:", {
        id: arrow.id,
        startBinding: arrow.startBinding,
        endBinding: arrow.endBinding,
        points: arrow.points?.length,
      });

      // Find the component for start and end
      const fromComponent = components.find((comp) => {
        if (!comp || !arrow.startBinding) return false;
        if (comp.id === arrow.startBinding.elementId) return true;
        // Check if the arrow starts from any element in a tagged component
        if (comp.tag) {
          const taggedElements =
            componentGroupsForRelationships[comp.tag] || [];
          return taggedElements.some(
            (el) => el.id === arrow.startBinding.elementId
          );
        }
        // Check if the arrow starts from any element in the component group
        const componentElements =
          componentGroupsForRelationships[comp.id] || [];
        return componentElements.some(
          (el) => el.id === arrow.startBinding.elementId
        );
      });

      const toComponent = components.find((comp) => {
        if (!comp || !arrow.endBinding) return false;
        if (comp.id === arrow.endBinding.elementId) return true;
        // Check if the arrow ends at any element in a tagged component
        if (comp.tag) {
          const taggedElements =
            componentGroupsForRelationships[comp.tag] || [];
          return taggedElements.some(
            (el) => el.id === arrow.endBinding.elementId
          );
        }
        // Check if the arrow ends at any element in the component group
        const componentElements =
          componentGroupsForRelationships[comp.id] || [];
        return componentElements.some(
          (el) => el.id === arrow.endBinding.elementId
        );
      });

      // If we can't find components by binding, try to find by proximity
      if (!fromComponent || !toComponent) {
        console.log(
          "[SceneParser] Arrow binding failed, trying proximity detection..."
        );

        // Find components by arrow position proximity
        const arrowStart = arrow.points?.[0] || [0, 0];
        const arrowEnd = arrow.points?.[arrow.points.length - 1] || [0, 0];

        const fromComponentByProximity = components.find((comp) => {
          const distance = Math.sqrt(
            Math.pow(comp.position.x - arrowStart[0], 2) +
              Math.pow(comp.position.y - arrowStart[1], 2)
          );
          return distance < 100; // Within 100 pixels
        });

        const toComponentByProximity = components.find((comp) => {
          const distance = Math.sqrt(
            Math.pow(comp.position.x - arrowEnd[0], 2) +
              Math.pow(comp.position.y - arrowEnd[1], 2)
          );
          return distance < 100; // Within 100 pixels
        });

        if (fromComponentByProximity && toComponentByProximity) {
          console.log("[SceneParser] Found components by proximity:", {
            from: fromComponentByProximity.name,
            to: toComponentByProximity.name,
          });
          return {
            from: fromComponentByProximity.name,
            to: toComponentByProximity.name,
            type: "flows to",
            condition: null,
          };
        }
      }

      console.log("[SceneParser] Arrow relationship:", {
        from: fromComponent?.name || "unknown",
        to: toComponent?.name || "unknown",
        fromType: fromComponent?.type,
        toType: toComponent?.type,
      });

      if (!fromComponent || !toComponent) return null;

      // Look for text labels on the arrow that might indicate conditions
      const texts = scene.filter((el) => el.type === "text" && !el.isDeleted);
      const arrowLabels = texts.filter((txt) => {
        // Check if text is positioned near the arrow with more flexible bounds
        const arrowBounds = {
          minX: Math.min(arrow.x || 0, (arrow.x || 0) + (arrow.width || 0)),
          maxX: Math.max(arrow.x || 0, (arrow.x || 0) + (arrow.width || 0)),
          minY: Math.min(arrow.y || 0, (arrow.y || 0) + (arrow.height || 0)),
          maxY: Math.max(arrow.y || 0, (arrow.y || 0) + (arrow.height || 0)),
        };

        // More flexible detection - check if text is within 100 pixels of arrow path
        let isNearArrow =
          txt.x >= arrowBounds.minX - 100 &&
          txt.x <= arrowBounds.maxX + 100 &&
          txt.y >= arrowBounds.minY - 100 &&
          txt.y <= arrowBounds.maxY + 100;
        
        // If arrow bounds are too small, use a broader search around the arrow's center
        if (arrowBounds.maxX - arrowBounds.minX < 10 || arrowBounds.maxY - arrowBounds.minY < 10) {
          const arrowCenterX = (arrow.x || 0) + (arrow.width || 0) / 2;
          const arrowCenterY = (arrow.y || 0) + (arrow.height || 0) / 2;
          const distance = Math.sqrt(
            Math.pow(txt.x - arrowCenterX, 2) + Math.pow(txt.y - arrowCenterY, 2)
          );
          isNearArrow = distance < 150; // Within 150 pixels of arrow center
        }

        // Also check if text content looks like a condition label
        const textContent = txt.text.toLowerCase().trim();
        const isConditionLabel =
          textContent === "yes" ||
          textContent === "no" ||
          textContent === "true" ||
          textContent === "false" ||
          (textContent.includes("yes") && textContent.length < 10) ||
          (textContent.includes("no") && textContent.length < 10) ||
          (textContent.includes("positive") && textContent.length < 15) ||
          (textContent.includes("negative") && textContent.length < 15);

        console.log("[SceneParser] Arrow label check:", {
          text: txt.text,
          isNearArrow,
          isConditionLabel,
          arrowBounds,
          textPosition: { x: txt.x, y: txt.y },
        });

        // If it's a condition label, don't require position check
        if (isConditionLabel) {
          return true;
        }

        return isNearArrow;
      });

      // Determine relationship type based on component types and labels
      let relationshipType = "flows to";
      let condition: string | null = null;

      if (fromComponent.type === "decision" && toComponent.type === "process") {
        relationshipType = "conditionally flows to";
        // Check for yes/no labels
        const label = arrowLabels.find(
          (l) =>
            l.text.toLowerCase().includes("yes") ||
            l.text.toLowerCase().includes("no") ||
            l.text.toLowerCase().includes("positive") ||
            l.text.toLowerCase().includes("negative")
        );
        if (label) {
          condition = label.text;
          console.log("[SceneParser] Found decision condition:", condition);
        }
      } else if (
        fromComponent.type === "decision" &&
        toComponent.type === "storage"
      ) {
        relationshipType = "conditionally flows to";
        // Check for yes/no labels
        const label = arrowLabels.find(
          (l) =>
            l.text.toLowerCase().includes("yes") ||
            l.text.toLowerCase().includes("no") ||
            l.text.toLowerCase().includes("positive") ||
            l.text.toLowerCase().includes("negative")
        );
        if (label) {
          condition = label.text;
          console.log("[SceneParser] Found decision condition:", condition);
        }
      } else if (
        fromComponent.type === "start_point" &&
        toComponent.type === "process"
      ) {
        relationshipType = "initiates";
      } else if (
        fromComponent.type === "start_point" &&
        toComponent.type === "input"
      ) {
        relationshipType = "begins with";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "end_point"
      ) {
        relationshipType = "terminates at";
      } else if (
        fromComponent.type === "decision" &&
        toComponent.type === "end_point"
      ) {
        relationshipType = "conditionally terminates at";
        const label = arrowLabels.find(
          (l) =>
            l.text.toLowerCase().includes("yes") ||
            l.text.toLowerCase().includes("no") ||
            l.text.toLowerCase().includes("positive") ||
            l.text.toLowerCase().includes("negative")
        );
        if (label) {
          condition = label.text;
        }
      } else if (
        fromComponent.type === "decision" &&
        toComponent.type === "storage"
      ) {
        relationshipType = "conditionally flows to";
        const label = arrowLabels.find(
          (l) =>
            l.text.toLowerCase().includes("yes") ||
            l.text.toLowerCase().includes("no")
        );
        if (label) {
          condition = label.text;
          console.log("[SceneParser] Found decision condition:", condition);
        }
      } else if (
        fromComponent.type === "input" &&
        toComponent.type === "process"
      ) {
        relationshipType = "triggers";
      } else if (
        fromComponent.type === "input" &&
        toComponent.type === "auth"
      ) {
        relationshipType = "authenticates with";
      } else if (
        fromComponent.type === "auth" &&
        toComponent.type === "process"
      ) {
        relationshipType = "authorizes";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "output"
      ) {
        relationshipType = "delivers to";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "storage"
      ) {
        relationshipType = "stores in";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "queue"
      ) {
        relationshipType = "sends to";
      } else if (
        fromComponent.type === "queue" &&
        toComponent.type === "output"
      ) {
        relationshipType = "delivers to";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "database"
      ) {
        relationshipType = "persists to";
      } else if (
        fromComponent.type === "database" &&
        toComponent.type === "process"
      ) {
        relationshipType = "provides data to";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "cache"
      ) {
        relationshipType = "caches in";
      } else if (
        fromComponent.type === "cache" &&
        toComponent.type === "process"
      ) {
        relationshipType = "serves from cache to";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "load_balancer"
      ) {
        relationshipType = "distributes through";
      } else if (
        fromComponent.type === "load_balancer" &&
        toComponent.type === "process"
      ) {
        relationshipType = "routes to";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "cdn"
      ) {
        relationshipType = "serves through";
      } else if (
        fromComponent.type === "cdn" &&
        toComponent.type === "output"
      ) {
        relationshipType = "delivers to";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "dns"
      ) {
        relationshipType = "resolves through";
      } else if (
        fromComponent.type === "dns" &&
        toComponent.type === "process"
      ) {
        relationshipType = "resolves for";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "pipeline"
      ) {
        relationshipType = "processes through";
      } else if (
        fromComponent.type === "pipeline" &&
        toComponent.type === "process"
      ) {
        relationshipType = "transforms for";
      } else if (
        fromComponent.type === "pipeline" &&
        toComponent.type === "decision"
      ) {
        relationshipType = "flows to decision";
      } else if (
        fromComponent.type === "decision" &&
        toComponent.type === "cloud"
      ) {
        relationshipType = "conditionally flows to";
        const label = arrowLabels.find(
          (l) =>
            l.text.toLowerCase().includes("yes") ||
            l.text.toLowerCase().includes("no")
        );
        if (label) {
          condition = label.text;
          console.log("[SceneParser] Found decision condition:", condition);
        }
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "multi_instance"
      ) {
        relationshipType = "scales to";
      } else if (
        fromComponent.type === "multi_instance" &&
        toComponent.type === "process"
      ) {
        relationshipType = "instances of";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "cloud"
      ) {
        relationshipType = "deploys to";
      } else if (
        fromComponent.type === "cloud" &&
        toComponent.type === "process"
      ) {
        relationshipType = "hosts";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "web_app"
      ) {
        relationshipType = "serves to";
      } else if (
        fromComponent.type === "web_app" &&
        toComponent.type === "output"
      ) {
        relationshipType = "presents to";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "file_transfer"
      ) {
        relationshipType = "transfers via";
      } else if (
        fromComponent.type === "file_transfer" &&
        toComponent.type === "process"
      ) {
        relationshipType = "transfers to";
      } else if (
        fromComponent.type === "process" &&
        toComponent.type === "communication"
      ) {
        relationshipType = "notifies via";
      } else if (
        fromComponent.type === "communication" &&
        toComponent.type === "output"
      ) {
        relationshipType = "notifies";
      } else if (fromComponent.type === "decision") {
        relationshipType = "conditionally flows to";
        const label = arrowLabels.find(
          (l) =>
            l.text.toLowerCase().includes("yes") ||
            l.text.toLowerCase().includes("no")
        );
        if (label) {
          condition = label.text;
        }
      }

      return {
        from: fromComponent.name,
        to: toComponent.name,
        type: relationshipType,
        condition,
      };
    })
    .filter(
      (
        r
      ): r is {
        from: string;
        to: string;
        type: string;
        condition: string | null;
      } => r !== null
    );

  // Sort relationships to prioritize decision point logic
  const relationships = allRelationships.sort((a, b) => {
    // Prioritize decision point relationships
    const aIsDecision = a?.from?.toLowerCase().includes("generated") || a?.to?.toLowerCase().includes("generated");
    const bIsDecision = b?.from?.toLowerCase().includes("generated") || b?.to?.toLowerCase().includes("generated");
    
    if (aIsDecision && !bIsDecision) return -1;
    if (!aIsDecision && bIsDecision) return 1;
    
    return 0;
  });

  // Filter out relationships that should only happen after decision points
  const filteredRelationships = relationships.filter((rel) => {
    // If this is a cloud → SFTP relationship, only include it if there's a decision point that flows to cloud
    if (rel.from.toLowerCase().includes("cloud") && rel.to.toLowerCase().includes("sftp")) {
      const hasDecisionToCloud = relationships.some((r) => 
        r.from.toLowerCase().includes("generated") && 
        r.to.toLowerCase().includes("cloud") && 
        r.condition === "yes"
      );
      return hasDecisionToCloud;
    }
    return true;
  });

  // --- Generate a natural language explanation ---
  let explanation = "";
  if (components.length === 0) {
    explanation = "No mapped or built-in components detected.";
  } else if (components.length === 1) {
    explanation = `The diagram contains a single component: ${components[0].name}.`;
  } else {
    explanation = `The diagram shows a system with the following components: `;
    explanation += components.map((c) => `${c.name} (${c.type})`).join(", ");
    if (filteredRelationships.length > 0) {
      explanation +=
        `. The flow is: ` +
        filteredRelationships
          .map((r) => {
            let rel = `${r.from} ${r.type} ${r.to}`;
            if (r.condition) {
              rel += ` (${r.condition})`;
            }
            return rel;
          })
          .join(", ") +
        ".";
    }
  }

  // Find a free-floating text element that starts with 'flow:'
  const freeFlowLabel = scene.find(
    (el) =>
      el.type === "text" &&
      !el.isDeleted &&
      (!el.groupIds || el.groupIds.length === 0) &&
      !scene.some((other) => other.containerId === el.id) &&
      typeof el.text === "string" &&
      el.text.trim().toLowerCase().startsWith("flow:")
  );
  let flowContext: string | undefined = undefined;
  if (freeFlowLabel) {
    flowContext = freeFlowLabel.text.trim().slice(5).trim();
  }

  console.log(
    "[SceneParser] Structured analysis:",
    JSON.stringify(
      {
        components,
        relationships,
        diagramType: "System Architecture",
        flowContext,
      },
      null,
      2
    )
  );
  console.log("[SceneParser] Explanation:", explanation);

  return {
    analysis: {
      components,
      relationships: filteredRelationships,
      diagramType: "System Architecture",
      flowContext,
    },
    explanation,
  };
}
