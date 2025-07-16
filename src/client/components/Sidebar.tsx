import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
  font-weight: 500;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
`;

interface StyledButtonProps {
  $active?: boolean;
  color?: string;
}

const ColorButton = styled.button<StyledButtonProps>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 2px solid ${props => props.$active ? '#1a73e8' : 'transparent'};
  background-color: ${props => props.color};
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const StrokeWidthButton = styled.button<StyledButtonProps>`
  width: 100%;
  height: 36px;
  border: none;
  background-color: ${props => props.$active ? '#e9ecef' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  gap: 0.5rem;

  &:hover {
    background-color: #e9ecef;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  height: 36px;
  border: none;
  background-color: #1a73e8;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background-color: #1557b0;
  }

  &:active {
    background-color: #0d47a1;
  }
`;

const StrokePreview = styled.div<{ width: number }>`
  width: 40px;
  height: ${props => props.width}px;
  background-color: #1e1e1e;
  border-radius: ${props => props.width / 2}px;
`;

interface SidebarProps {
  selectedColor: string;
  strokeWidth: number;
  onColorSelect: (color: string) => void;
  onStrokeWidthSelect: (width: number) => void;
  onGenerateDocumentation: () => void;
}

const COLORS = [
  '#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#9c36b5',
  '#868e96', '#fa5252', '#40c057', '#339af0', '#ffd43b', '#cc5de8',
];

const STROKE_WIDTHS = [2, 4, 6];

const Sidebar: React.FC<SidebarProps> = ({
  selectedColor,
  strokeWidth,
  onColorSelect,
  onStrokeWidthSelect,
  onGenerateDocumentation,
}) => {
  return (
    <SidebarContainer>
      <Section>
        <SectionTitle>Stroke</SectionTitle>
        <ColorGrid>
          {COLORS.map((color) => (
            <ColorButton
              key={color}
              color={color}
              $active={selectedColor === color}
              onClick={() => onColorSelect(color)}
            />
          ))}
        </ColorGrid>
      </Section>

      <Section>
        <SectionTitle>Stroke Width</SectionTitle>
        {STROKE_WIDTHS.map((width) => (
          <StrokeWidthButton
            key={width}
            $active={strokeWidth === width}
            onClick={() => onStrokeWidthSelect(width)}
          >
            <StrokePreview width={width} />
            {width}px
          </StrokeWidthButton>
        ))}
      </Section>

      <Section>
        <SectionTitle>Actions</SectionTitle>
        <ActionButton onClick={onGenerateDocumentation}>
          Generate Documentation
        </ActionButton>
      </Section>
    </SidebarContainer>
  );
};

export default Sidebar; 