import type { SceneDiagramAnalysis } from '../client/utils/sceneDiagramAnalyzer';
import { libraryMapping } from '../client/assets/libraries/libraryMapping';

// Helper to infer type from shape
function inferTypeFromShape(elements: any[]): string {
  const types = elements.map(el => el.type);
  if (types.includes('ellipse') || types.includes('cylinder')) return 'database';
  if (types.includes('rectangle')) return 'process';
  return 'component';
}

// Helper to analyze scene and generate a natural language explanation
export function parseSceneToExplanation(scene: any[]): { analysis: SceneDiagramAnalysis, explanation: string } {
  console.log('[SceneParser] Raw scene:', JSON.stringify(scene, null, 2));
  // --- Extract components and relationships ---

  // Group elements by groupIds
  const groupMap: Record<string, any[]> = {};
  scene.forEach(el => {
    if (el.groupIds && el.groupIds.length > 0) {
      el.groupIds.forEach((gid: string) => {
        if (!groupMap[gid]) groupMap[gid] = [];
        groupMap[gid].push(el);
      });
    }
  });

  console.log('[SceneParser] Group map:', Object.keys(groupMap).map(gid => `${gid}: ${groupMap[gid].length} elements`));

  // Grouped components: mapped or generic
  const groupComponents = Object.entries(groupMap)
    .map(([groupId, elements]) => {
      // 1. Try mapped text element
      const mappedText = elements.find(el => el.type === 'text' && typeof el.id === 'string' && el.id in libraryMapping);
      if (mappedText) {
        const mainEl = elements.find(el => el.type !== 'text') || elements[0];
        if (!mainEl) return undefined;
        return {
          id: groupId,
          name: libraryMapping[mappedText.id as keyof typeof libraryMapping],
          type: 'component',
          position: { x: mainEl.x, y: mainEl.y }
        };
      }
      // 2. Else, use first text label and infer type
      const textEl = elements.find(el => el.type === 'text' && typeof el.text === 'string' && el.text.trim() !== '');
      if (textEl) {
        const mainEl = elements.find(el => el.type !== 'text') || elements[0];
        if (!mainEl) return undefined;
        return {
          id: groupId,
          name: textEl.text,
          type: inferTypeFromShape(elements),
          position: { x: mainEl.x, y: mainEl.y }
        };
      }
      return undefined;
    })
    .filter((c): c is { id: string; name: string; type: string; position: { x: number; y: number } } => !!c);

  // Ungrouped rectangles/ellipses as generic components
  const texts = scene.filter(el => el.type === 'text' && !el.isDeleted);
  const ungroupedShapes = scene.filter(el =>
    (el.type === 'rectangle' || el.type === 'ellipse' || el.type === 'cylinder') &&
    !el.isDeleted && (!el.groupIds || el.groupIds.length === 0)
  );
  const ungroupedComponents = ungroupedShapes.map(shape => {
    const label = texts.find(txt => txt.containerId === shape.id);
    return {
      id: shape.id,
      name: label ? label.text : 'Unnamed',
      type: shape.type === 'ellipse' || shape.type === 'cylinder' ? 'database' : 'process',
      position: { x: shape.x, y: shape.y }
    };
  });

  const components = [...groupComponents, ...ungroupedComponents];

  // Relationships (arrows between groups or rectangles)
  const arrows = scene.filter(el => el.type === 'arrow' && !el.isDeleted);
  const relationships = arrows.map(arrow => {
    // Try to find the group/component for start and end
    const fromComponent = components.find(comp => {
      if (!comp || !arrow.startBinding) return false;
      if (comp.id === arrow.startBinding.elementId) return true;
      return groupMap[comp.id]?.some(el => el.id === arrow.startBinding.elementId);
    });
    const toComponent = components.find(comp => {
      if (!comp || !arrow.endBinding) return false;
      if (comp.id === arrow.endBinding.elementId) return true;
      return groupMap[comp.id]?.some(el => el.id === arrow.endBinding.elementId);
    });
    return fromComponent && toComponent
      ? { from: fromComponent.name, to: toComponent.name, type: 'flows to' }
      : null;
  }).filter((r): r is { from: string; to: string; type: string } => r !== null);

  // --- Generate a natural language explanation ---
  let explanation = '';
  if (components.length === 0) {
    explanation = 'No mapped or built-in components detected.';
  } else if (components.length === 1) {
    explanation = `The diagram contains a single component: ${components[0].name}.`;
  } else {
    explanation = `The diagram shows a system with the following components: `;
    explanation += components.map(c => `${c.name} (${c.type})`).join(', ');
    if (relationships.length > 0) {
      explanation += `. The flow is: ` + relationships.map(r => `${r.from} → ${r.to}`).join(', ') + '.';
    }
  }

  // Find a free-floating text element that starts with 'flow:'
  const freeFlowLabel = scene.find(el =>
    el.type === 'text' &&
    !el.isDeleted &&
    (!el.groupIds || el.groupIds.length === 0) &&
    !scene.some(other => other.containerId === el.id) &&
    typeof el.text === 'string' &&
    el.text.trim().toLowerCase().startsWith('flow:')
  );
  let flowContext: string | undefined = undefined;
  if (freeFlowLabel) {
    flowContext = freeFlowLabel.text.trim().slice(5).trim();
  }

  console.log('[SceneParser] Structured analysis:', JSON.stringify({ components, relationships, diagramType: 'System Architecture', flowContext }, null, 2));
  console.log('[SceneParser] Explanation:', explanation);

  return {
    analysis: {
      components,
      relationships,
      diagramType: 'System Architecture',
      flowContext
    },
    explanation
  };
} 