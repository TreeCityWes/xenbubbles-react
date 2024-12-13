import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles/theme';

const TimeFrameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TimeButton = styled.button`
  background: ${props => props.$active ? `rgba(50, 205, 50, 0.2)` : 'rgba(50, 205, 50, 0.05)'};
  color: ${colors.primary};
  border: 1px solid ${colors.primary};
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  text-shadow: ${props => props.$active ? `0 0 5px ${colors.shadow}` : 'none'};
  box-shadow: ${props => props.$active ? `0 0 10px ${colors.shadow}` : 'none'};

  &:hover {
    background: rgba(50, 205, 50, 0.2);
    box-shadow: 0 0 10px ${colors.shadow};
  }
`;

const timeFrames = [
  { id: '5m', label: '5M' },
  { id: '1h', label: '1H' },
  { id: '6h', label: '6H' },
  { id: '24h', label: '24H' }
];

const TimeFrameSelector = ({ selectedTimeFrame, onTimeFrameChange }) => {
  return (
    <TimeFrameContainer>
      {timeFrames.map(({ id, label }) => (
        <TimeButton
          key={id}
          $active={selectedTimeFrame === id}
          onClick={() => onTimeFrameChange(id)}
        >
          {label}
        </TimeButton>
      ))}
    </TimeFrameContainer>
  );
};

export default TimeFrameSelector; 