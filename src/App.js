import React from 'react';
import BubbleContainer from './components/BubbleContainer';
import Layout from './components/Layout';
import CyberpunkBackground from './components/CyberpunkBackground';
import styled from 'styled-components';

const AppContainer = styled.div`
  position: relative;
  min-height: 100vh;
  color: #fff;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const FooterIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 15px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;

  a, a:visited, a:link {
    color: rgb(57, 255, 20) !important;
    font-size: 28px;
    transition: all 0.3s ease;
    text-decoration: none;
    filter: drop-shadow(0 0 8px rgba(57, 255, 20, 0.8)) brightness(1.2);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    background: none;

    i, svg {
      color: rgb(57, 255, 20) !important;
      filter: inherit;
      opacity: 1;
    }

    &:hover {
      color: rgb(57, 255, 20) !important;
      filter: drop-shadow(0 0 12px rgba(57, 255, 20, 1)) brightness(1.4);
      transform: scale(1.1);
      
      i, svg {
        color: rgb(57, 255, 20) !important;
      }
    }
  }
`;

function App() {
  return (
    <AppContainer>
      <CyberpunkBackground />
      <ContentWrapper>
        <Layout>
          <BubbleContainer />
        </Layout>
      </ContentWrapper>
      <FooterIcons>
        <a href="/" target="_blank" rel="noopener noreferrer">
          <i className="fas fa-store"></i>
        </a>
        <a href="/" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-twitter"></i>
        </a>
        <a href="/" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-github"></i>
        </a>
        <a href="/" target="_blank" rel="noopener noreferrer">
          <i className="fas fa-envelope"></i>
        </a>
      </FooterIcons>
    </AppContainer>
  );
}

export default App; 