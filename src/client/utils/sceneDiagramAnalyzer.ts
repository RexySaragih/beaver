// src/client/utils/sceneDiagramAnalyzer.ts

export interface DiagramComponent {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  tag?: string | null;
}

export interface DiagramRelationship {
  from: string;
  to: string;
  type: string;
  condition?: string | null;
}

export interface SceneDiagramAnalysis {
  components: DiagramComponent[];
  relationships: DiagramRelationship[];
  diagramType: string;
  flowContext?: string;
}

export function analyzeSceneDiagram(elements: any[]): SceneDiagramAnalysis {
  // Get all elements that have tags and are not arrows or deleted
  const taggedComponents = elements.filter(el => 
    el.tag && 
    el.type !== 'arrow' && 
    !el.isDeleted
  );
  
  const arrows = elements.filter(el => el.type === 'arrow' && !el.isDeleted);

  // Map tagged components to diagram components
  const boxMap = taggedComponents.map(component => {
    // Use tag property directly as component name and type
    const componentName = component.tag;
    const componentType = component.tag;
    
    return {
      id: component.id,
      name: componentName,
      type: componentType,
      position: { x: component.x, y: component.y }
    };
  });

  // Map arrows to relationships
  const relationships = arrows.map(arrow => {
    const fromBox = boxMap.find(box => box.id === arrow.startBinding?.elementId);
    const toBox = boxMap.find(box => box.id === arrow.endBinding?.elementId);
    return fromBox && toBox
      ? { from: fromBox.name, to: toBox.name, type: 'flows to' }
      : null;
  }).filter(Boolean) as DiagramRelationship[];

  return {
    components: boxMap,
    relationships,
    diagramType: 'Flow Diagram'
  };
} 