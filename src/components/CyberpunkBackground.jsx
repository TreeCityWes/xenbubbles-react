import React from 'react';
import styled, { keyframes } from 'styled-components';

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 0.4; }
  100% { opacity: 0.3; }
`;

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(
    to bottom,
    #050505,
    #0a0a0a
  );
  overflow: hidden;
  z-index: 0;
  
  @media (max-width: 768px) {
    position: fixed;
    height: 100%;
    pointer-events: none;
  }
  
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
        rgba(255, 255, 255, 0.02) 0%,
        transparent 70%
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
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
`;

const FloatingParticles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(
    circle at center,
    rgba(57, 255, 20, 0.15) 0%,
    transparent 10%
  );
  background-size: 120px 120px;
  animation: ${pulse} 3s ease-in-out infinite;
  opacity: 0.3;
  pointer-events: none;
`;

const CyberpunkBackground = () => (
  <Background>
    <Grid />
    <FloatingParticles />
  </Background>
);

export default CyberpunkBackground; 