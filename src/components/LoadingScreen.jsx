import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
`;

const LoadingText = styled.div`
  color: #39FF14;
  font-size: 28px;
  font-weight: bold;
  margin-top: 20px;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.8);
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Spinner = styled.div`
  width: 80px;
  height: 80px;
  border: 6px solid rgba(57, 255, 20, 0.1);
  border-left-color: #39FF14;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
`;

const LoadingScreen = () => (
  <LoadingOverlay>
    <Spinner />
    <LoadingText>Loading Tokens...</LoadingText>
  </LoadingOverlay>
);

export default LoadingScreen; 