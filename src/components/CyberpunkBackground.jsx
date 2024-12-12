import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.95; }
  100% { opacity: 1; }
`;

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000000;
  overflow: hidden;
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(
        circle at center,
        rgba(57, 255, 20, 0.1) 0%,
        rgba(0, 0, 0, 0.9) 100%
      ),
      repeating-linear-gradient(
        0deg,
        rgba(57, 255, 20, 0.03) 0px,
        rgba(57, 255, 20, 0.03) 1px,
        transparent 1px,
        transparent 2px
      );
    pointer-events: none;
  }
`;

const Grid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(90deg, rgba(57, 255, 20, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(57, 255, 20, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  animation: ${pulse} 4s infinite;
`;

export const StyledHeader = styled.header`
  background: rgba(0, 0, 0, 0.9);
  border-bottom: 1px solid #39FF14;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
  backdrop-filter: blur(5px);
`;

export const StyledFooter = styled.footer`
  background: rgba(0, 0, 0, 0.9);
  border-top: 1px solid #39FF14;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
  backdrop-filter: blur(5px);
`;

export const StyledContent = styled.div`
  background: transparent;
  min-height: calc(100vh - 200px);
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(57, 255, 20, 0.1),
      transparent 70%
    );
    pointer-events: none;
  }
`;

const CyberpunkBackground = () => (
  <Background>
    <Grid />
  </Background>
);

export default CyberpunkBackground; 