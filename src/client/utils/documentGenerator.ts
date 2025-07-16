import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, TableLayoutType, ImageRun } from 'docx';

export interface Documentation {
  title: string;
  introduction: {
    objective: string;
    keyOutput: string;
    whyThisFeatureIsNeeded: string;
  };
  coreProcessingLogic: {
    stepByStepFlow: Array<{
      step: string;
      description: string;
      component: string;
    }>;
  };
  technicalSpecs?: {
    architecture: string;
    dataFlow: string;
    components: Array<{
      name: string;
      description: string;
      responsibilities: string[];
    }>;
  };
  businessSpecs?: {
    processFlow: string;
    stakeholders: string[];
    requirements: string[];
  };
  generatedAt: string;
  canvasImage?: Buffer;
}

export async function generateDocxDocumentation(documentation: Documentation): Promise<Blob> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: documentation.title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
            before: 400
          }
        }),

        // Introduction Section
        new Paragraph({
          text: "Introduction",
          heading: HeadingLevel.HEADING_2,
          spacing: {
            after: 200,
            before: 400
          }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "Objective",
              bold: true
            }),
            new TextRun({
              text: ": "
            }),
            new TextRun({
              text: documentation.introduction.objective
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "Key Output",
              bold: true
            }),
            new TextRun({
              text: ": "
            }),
            new TextRun({
              text: documentation.introduction.keyOutput
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "Why This Feature Is Needed",
              bold: true
            }),
            new TextRun({
              text: ": "
            }),
            new TextRun({
              text: documentation.introduction.whyThisFeatureIsNeeded
            })
          ],
          spacing: { after: 400 }
        }),

        // Table of Contents
        new Paragraph({
          text: "Table of Contents",
          heading: HeadingLevel.HEADING_2,
          spacing: {
            after: 200,
            before: 400
          }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "1. ",
              bold: true
            }),
            new TextRun({
              text: "Introduction",
              bold: true
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   1.1. ",
              bold: true
            }),
            new TextRun({
              text: "Objective"
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   1.2. ",
              bold: true
            }),
            new TextRun({
              text: "Key Output"
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   1.3. ",
              bold: true
            }),
            new TextRun({
              text: "Why This Feature Is Needed"
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "2. ",
              bold: true
            }),
            new TextRun({
              text: "User Interface Specification",
              bold: true
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "3. ",
              bold: true
            }),
            new TextRun({
              text: "Core Processing Logic",
              bold: true
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   3.1. ",
              bold: true
            }),
            new TextRun({
              text: "Step-by-Step Flow"
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   3.2. ",
              bold: true
            }),
            new TextRun({
              text: "Technical Specification"
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   3.3. ",
              bold: true
            }),
            new TextRun({
              text: "Data Flow"
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   3.4. ",
              bold: true
            }),
            new TextRun({
              text: "Components"
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   3.5. ",
              bold: true
            }),
            new TextRun({
              text: "Business Specification"
            })
          ],
          spacing: { after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   3.6. ",
              bold: true
            }),
            new TextRun({
              text: "Requirement"
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "4. ",
              bold: true
            }),
            new TextRun({
              text: "New API / Crons / Consumers / Scripts",
              bold: true
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "5. ",
              bold: true
            }),
            new TextRun({
              text: "Data Source Mapping",
              bold: true
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "6. ",
              bold: true
            }),
            new TextRun({
              text: "Deployment Checklist",
              bold: true
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   6.1. ",
              bold: true
            }),
            new TextRun({
              text: "Step 1 - Preparation",
            })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "   6.2. ",
              bold: true
            }),
            new TextRun({
              text: "Step 2 - Deploying Production",
            })
          ],
          spacing: { after: 400 }
        }),

        // User Interface Specification placeholder
        new Paragraph({
          text: "User Interface Specification",
          heading: HeadingLevel.HEADING_2,
          spacing: {
            after: 200,
            before: 400
          }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "{{This should be added manually by the developer}}",
              italics: true
            })
          ],
          spacing: { after: 400 }
        }),

        // Core Processing Logic Section
        new Paragraph({
          text: "Core Processing Logic",
          heading: HeadingLevel.HEADING_2,
          spacing: {
            after: 200,
            before: 400
          }
        }),

        // Canvas Image
        ...(documentation.canvasImage ? [
          new Paragraph({
            children: [
              new ImageRun({
                data: documentation.canvasImage,
                transformation: {
                  width: 800,
                  height: 600,
                },
                type: "png"
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          })
        ] : [
          new Paragraph({
            children: [
              new TextRun({
                text: "[Canvas Diagram Image will be inserted here]",
                italics: true,
                color: "666666"
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          })
        ]),

        // Step-by-Step Flow
        new Paragraph({
          text: "Step-by-Step Flow",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 200 }
        }),

        // Step-by-step flow table
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          layout: TableLayoutType.FIXED,
          columnWidths: [2000, 4500, 2000],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    text: "Step",
                    heading: HeadingLevel.HEADING_4,
                  })],
                  shading: {
                    fill: "F2F2F2",
                  },
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    text: "Description",
                    heading: HeadingLevel.HEADING_4,
                  })],
                  shading: {
                    fill: "F2F2F2",
                  },
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    text: "Component",
                    heading: HeadingLevel.HEADING_4,
                  })],
                  shading: {
                    fill: "F2F2F2",
                  },
                }),
              ],
            }),
            ...documentation.coreProcessingLogic.stepByStepFlow.map((step, index) =>
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      text: step.step,
                      spacing: { after: 120 }
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      text: step.description,
                      spacing: { after: 120 }
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      text: step.component,
                      spacing: { after: 120 }
                    })],
                  }),
                ],
              })
            ),
          ],
        }),

        // Technical Specification
        new Paragraph({
          text: "Technical Specification",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 200 }
        }),

        ...(documentation.technicalSpecs ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "Architecture: ",
                bold: true
              }),
              new TextRun({
                text: documentation.technicalSpecs.architecture
              })
            ],
            spacing: { after: 200 }
          })
        ] : []),

        // Data Flow
        new Paragraph({
          text: "Data Flow",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 200 }
        }),

        ...(documentation.technicalSpecs ? [
          new Paragraph({
            children: [
              new TextRun({
                text: documentation.technicalSpecs.dataFlow
              })
            ],
            spacing: { after: 400 }
          })
        ] : []),

        // Components
        new Paragraph({
          text: "Components",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 200 }
        }),

        ...(documentation.technicalSpecs ? [
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            layout: TableLayoutType.FIXED,
            columnWidths: [3000, 5000],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      text: "Component",
                      heading: HeadingLevel.HEADING_4,
                    })],
                    shading: {
                      fill: "F2F2F2",
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      text: "Responsibility",
                      heading: HeadingLevel.HEADING_4,
                    })],
                    shading: {
                      fill: "F2F2F2",
                    },
                  }),
                ],
              }),
              ...documentation.technicalSpecs.components.map(component =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ 
                        text: component.name,
                        spacing: { after: 120 }
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ 
                        text: component.responsibilities.join(", "),
                        spacing: { after: 120 }
                      })],
                    }),
                  ],
                })
              ),
            ],
          })
        ] : []),

        // Business Specification
        new Paragraph({
          text: "Business Specification",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 200 }
        }),

        ...(documentation.businessSpecs ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "Process Flow: ",
                bold: true
              }),
              new TextRun({
                text: documentation.businessSpecs.processFlow
              })
            ],
            spacing: { after: 200 }
          })
        ] : []),

        // Requirement
        new Paragraph({
          text: "Requirement",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 200 }
        }),

        ...(documentation.businessSpecs ? [
          new Paragraph({
            children: [
              new TextRun({
                text: documentation.businessSpecs.requirements.join(", ")
              })
            ],
            spacing: { after: 400 }
          })
        ] : []),

        // New API / Crons / Consumers / Scripts placeholder
        new Paragraph({
          text: "New API / Crons / Consumers / Scripts",
          heading: HeadingLevel.HEADING_2,
          spacing: {
            after: 200,
            before: 400
          }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "{{This should be added manually by the developer}}",
              italics: true
            })
          ],
          spacing: { after: 400 }
        }),

        // Data Source Mapping placeholder
        new Paragraph({
          text: "Data Source Mapping",
          heading: HeadingLevel.HEADING_2,
          spacing: {
            after: 200,
            before: 400
          }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "{{This should be added manually by the developer}}",
              italics: true
            })
          ],
          spacing: { after: 400 }
        }),

        // Deployment Checklist placeholder
        new Paragraph({
          text: "Deployment Checklist",
          heading: HeadingLevel.HEADING_2,
          spacing: {
            after: 200,
            before: 400
          }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "{{This should be added manually by the developer}}",
              italics: true
            })
          ],
          spacing: { after: 400 }
        }),

        // Step 1 - Preparation placeholder
        new Paragraph({
          text: "Step 1 - Preparation",
          heading: HeadingLevel.HEADING_2,
          spacing: {
            after: 200,
            before: 400
          }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "{{This should be added manually by the developer}}",
              italics: true
            })
          ],
          spacing: { after: 400 }
        }),

        // Step 2 - Deploying Production placeholder
        new Paragraph({
          text: "Step 2 - Deploying Production",
          heading: HeadingLevel.HEADING_2,
          spacing: {
            after: 200,
            before: 400
          }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "{{This should be added manually by the developer}}",
              italics: true
            })
          ],
          spacing: { after: 400 }
        }),

        // Generated At
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${new Date(documentation.generatedAt).toLocaleString()}`,
              size: 20,
              color: "666666"
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 }
        })
      ]
    }]
  });

  return await Packer.toBlob(doc);
} 