import React from 'react';
import styled from 'styled-components';

interface DocumentationData {
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
}

const DocumentationContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  margin-top: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 3px solid #3498db;
  padding-bottom: 1rem;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: #34495e;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: #3498db;
    border-radius: 2px;
  }
`;

const SubSection = styled.div`
  margin-bottom: 2rem;
`;

const SubSectionTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const Content = styled.div`
  color: #555;
  line-height: 1.6;
  font-size: 1rem;
`;

const StepList = styled.ol`
  counter-reset: step-counter;
  list-style: none;
  padding: 0;
`;

const StepItem = styled.li`
  counter-increment: step-counter;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
  
  &::before {
    content: counter(step-counter);
    background: #3498db;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 1rem;
  }
`;

const StepTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.div`
  color: #555;
  margin-bottom: 0.5rem;
`;

const StepComponent = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
  font-style: italic;
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
`;

const SpecsCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const SpecsTitle = styled.h4`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const GeneratedAt = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

interface DocumentationViewerProps {
  documentation: DocumentationData;
}

const DocumentationViewer: React.FC<DocumentationViewerProps> = ({ documentation }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  if (
    !documentation ||
    !documentation.introduction ||
    !documentation.coreProcessingLogic
  ) {
    return (
      <DocumentationContainer>
        <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>
          Documentation data is incomplete or malformed.<br />
          Please try generating documentation again or check the backend response.
        </div>
      </DocumentationContainer>
    );
  }

  return (
    <DocumentationContainer ref={containerRef}>
      <div style={{ marginBottom: '2rem' }}>
        <Title>{documentation.title}</Title>
      </div>
      {/* Introduction Section */}
      <Section>
        <SectionTitle>Introduction</SectionTitle>
        <SubSection>
          <SubSectionTitle>Objective</SubSectionTitle>
          <Content>{documentation.introduction.objective}</Content>
        </SubSection>
        <SubSection>
          <SubSectionTitle>Key Output</SubSectionTitle>
          <Content>{documentation.introduction.keyOutput}</Content>
        </SubSection>
        <SubSection>
          <SubSectionTitle>Why This Feature Is Needed</SubSectionTitle>
          <Content>{documentation.introduction.whyThisFeatureIsNeeded}</Content>
        </SubSection>
      </Section>

      {/* Core Processing Logic Section */}
      <Section>
        <SectionTitle>Core Processing Logic</SectionTitle>
        <SubSection>
          <SubSectionTitle>Step-by-Step Flow</SubSectionTitle>
          <StepList>
            {documentation.coreProcessingLogic.stepByStepFlow.map((step, index) => (
              <StepItem key={index}>
                <StepTitle>{step.step}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
                <StepComponent>Component: {step.component}</StepComponent>
              </StepItem>
            ))}
          </StepList>
        </SubSection>
      </Section>

      {/* Technical Specs Section */}
      {documentation.technicalSpecs && (
        <Section>
          <SectionTitle>Technical Specifications</SectionTitle>
          <SpecsGrid>
            <SpecsCard>
              <SpecsTitle>Architecture</SpecsTitle>
              <Content>{documentation.technicalSpecs.architecture}</Content>
            </SpecsCard>
            <SpecsCard>
              <SpecsTitle>Data Flow</SpecsTitle>
              <Content>{documentation.technicalSpecs.dataFlow}</Content>
            </SpecsCard>
          </SpecsGrid>
          <SubSection>
            <SubSectionTitle>Components</SubSectionTitle>
            <List>
              {documentation.technicalSpecs.components.map((component, index) => (
                <ListItem key={index}>
                  <strong>{component.name}</strong>: {component.description}
                  <List>
                    {component.responsibilities.map((responsibility, respIndex) => (
                      <ListItem key={respIndex} style={{ paddingLeft: '1rem', fontSize: '0.9rem' }}>
                        • {responsibility}
                      </ListItem>
                    ))}
                  </List>
                </ListItem>
              ))}
            </List>
          </SubSection>
        </Section>
      )}

      {/* Business Specs Section */}
      {documentation.businessSpecs && (
        <Section>
          <SectionTitle>Business Specifications</SectionTitle>
          <SpecsGrid>
            <SpecsCard>
              <SpecsTitle>Process Flow</SpecsTitle>
              <Content>{documentation.businessSpecs.processFlow}</Content>
            </SpecsCard>
            <SpecsCard>
              <SpecsTitle>Stakeholders</SpecsTitle>
              <List>
                {documentation.businessSpecs.stakeholders.map((stakeholder, index) => (
                  <ListItem key={index}>• {stakeholder}</ListItem>
                ))}
              </List>
            </SpecsCard>
          </SpecsGrid>
          <SubSection>
            <SubSectionTitle>Requirements</SubSectionTitle>
            <List>
              {documentation.businessSpecs.requirements.map((requirement, index) => (
                <ListItem key={index}>• {requirement}</ListItem>
              ))}
            </List>
          </SubSection>
        </Section>
      )}

      <GeneratedAt>
        Generated on: {new Date(documentation.generatedAt).toLocaleString()}
      </GeneratedAt>
    </DocumentationContainer>
  );
};

export default DocumentationViewer; 