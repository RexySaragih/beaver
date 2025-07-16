import React from 'react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  position: relative;
`;

const Sidebar = styled.div`
  width: 240px;
  background-color: #fff;
  border-right: 1px solid #e9ecef;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Canvas = styled.div`
  flex: 1;
  position: relative;
`;

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  return (
    <LayoutContainer>
      <MainContent>
        {sidebar && <Sidebar>{sidebar}</Sidebar>}
        <Canvas>
          {children}
        </Canvas>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout; 