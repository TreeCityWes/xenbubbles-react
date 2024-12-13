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
    -45deg, 
    rgba(0, 0, 0, 0.95), 
    rgba(0, 20, 0, 0.98),
    rgba(0, 40, 0, 0.95),
    rgba(0, 10, 0, 0.97)
  );
  background-size: 400% 400%;
  animation: ${gradientMove} 15s ease infinite;
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
        rgba(57, 255, 20, 0.1) 0%,
        rgba(0, 0, 0, 0.9) 100%
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0px,
        transparent 1px,
        rgba(57, 255, 20, 0.03) 1px,
        rgba(57, 255, 20, 0.03) 2px
      );
    pointer-events: none;
    opacity: 0.3;
    animation: ${pulse} 4s ease-in-out infinite;
  }
`;

const Grid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: ${pulse} 4s infinite;
  
  &::after {
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