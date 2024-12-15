import React from 'react';
import styled from 'styled-components';

const TimeFrameContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    max-width: 280px;
    margin: 0 auto;
  }
`;

const TimeButton = styled.button`
  background: ${props => props.$active ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.05)'};
  color: #39FF14;
  border: 1px solid #39FF14;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 50px;
  text-align: center;

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 11px;
    flex: 1;
    max-width: 65px;
  }

  &:hover {
    background: rgba(57, 255, 20, 0.2);
  }
`;

const TimeFrameSelector = ({ selectedTimeFrame, onTimeFrameChange, setLoading }) => {
  const timeFrames = [
    { id: '5m', label: '5M' },
    { id: '1h', label: '1H' },
    { id: '6h', label: '6H' },
    { id: '24h', label: '24H' },
  ];

  const handleTimeFrameChange = (timeFrame) => {
    if (timeFrame === selectedTimeFrame) return;
    setLoading?.(true);
    onTimeFrameChange(timeFrame);
  };

  return (
    <TimeFrameContainer>
      {timeFrames.map(({ id, label }) => (
        <TimeButton
          key={id}
          $active={selectedTimeFrame === id}
          onClick={() => handleTimeFrameChange(id)}
        >
          {label}
        </TimeButton>
      ))}
    </TimeFrameContainer>
  );
};

export default TimeFrameSelector; 