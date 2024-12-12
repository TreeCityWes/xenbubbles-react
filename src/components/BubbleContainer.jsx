import React, { useState, useEffect, useRef, useCallback } from 'react';
import Bubble from './Bubble';
import BubbleListSelector from './BubbleListSelector';
import styled from 'styled-components';
import '../styles/bubble-animations.css';
import TokenModal from './TokenModal';
import { forceSimulation, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force';

const Container = styled.div`
  padding: 10px;
  background: transparent;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const BubblesGrid = styled.div`
  position: relative;
  width: 95vw;
  height: calc(100vh - 180px);
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #39FF14;
  box-shadow: 
    0 0 30px rgba(57, 255, 20, 0.2),
    inset 0 0 30px rgba(57, 255, 20, 0.1);
  overflow: hidden;
  border-radius: 12px;
  padding: 40px 20px 20px;
  
  /* Terminal/Browser Header */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 35px;
    background: rgba(57, 255, 20, 0.1);
    border-bottom: 2px solid #39FF14;
    display: flex;
    align-items: center;
    padding: 0 10px;
  }

  /* Window Controls */
  &::after {
    content: '● ● ●';
    position: absolute;
    top: 8px;
    left: 10px;
    color: #39FF14;
    font-size: 12px;
    letter-spacing: 2px;
    text-shadow: 0 0 5px #39FF14;
  }
`;

const BubbleWrapper = styled.div`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  transform-origin: center center;
  will-change: transform;
  cursor: pointer;
  
  &:hover {
    z-index: 10;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  padding: 20px;
  text-align: center;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  margin: 20px;
`;

// Add a terminal title
const TerminalTitle = styled.div`
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  color: #39FF14;
  font-size: 14px;
  font-family: monospace;
  z-index: 1;
  text-shadow: 0 0 5px #39FF14;
  &::before {
    content: '> ';
  }
  &::after {
    content: '_';
    animation: blink 1s infinite;
  }
`;

// Update the BubbleListSelector styling
const SelectorButton = styled.button`
  background: transparent;
  border: 1px solid #39FF14;
  color: #39FF14;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px #39FF14;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
  
  &:hover {
    background: rgba(57, 255, 20, 0.1);
    box-shadow: 0 0 15px rgba(57, 255, 20, 0.3);
  }
  
  &.active {
    background: rgba(57, 255, 20, 0.2);
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
  }
`;

// Adjust these physics constants
const DAMPING = 0.98; // Slightly stronger damping
const COLLISION_DAMPING = 0.5; // More energy loss on collision
const VELOCITY_LIMIT = 1.0;
const DRIFT_FORCE = 0.01; // Smaller random drift

// Add this helper function for random drift
const addRandomDrift = (velocity) => {
  return velocity + (Math.random() - 0.5) * DRIFT_FORCE;
};

const limitVelocity = (velocity) => {
  return Math.max(Math.min(velocity, VELOCITY_LIMIT), -VELOCITY_LIMIT);
};

// Add loading indicator
const LoadingIndicator = styled.div`
  color: #39FF14;
  text-align: center;
  margin: 10px 0;
  font-size: 14px;
  text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
`;

const BubbleContainer = () => {
  const [currentList, setCurrentList] = useState([]);
  const [error, setError] = useState(null);
  const [bubblePositions, setBubblePositions] = useState([]);
  const animationFrameRef = useRef();
  const containerRef = useRef();
  const dragRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [selectedToken, setSelectedToken] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastDragTime = useRef(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleListChange = useCallback(async (newList) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const validTokens = newList.filter(token => {
        const symbol = token.baseToken?.symbol || token.symbol;
        return symbol && symbol !== 'Unknown';
      });

      setCurrentList(validTokens);
      initializeBubblePositions(validTokens);
    } catch (err) {
      setError('Error loading token list: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeBubblePositions = (list) => {
    const containerWidth = window.innerWidth * 0.95;
    const containerHeight = window.innerHeight - 180;
    const padding = 30;
    
    let positions = [];
    const totalBubbles = list.length;
    
    // Calculate grid dimensions
    const aspectRatio = containerWidth / containerHeight;
    const cols = Math.ceil(Math.sqrt(totalBubbles * aspectRatio));
    const rows = Math.ceil(totalBubbles / cols);
    
    // Calculate cell size
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;
    
    list.forEach((token, index) => {
      const size = getBubbleSize(token, totalBubbles);
      
      // Calculate grid position
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      // Add some randomness within the cell
      const randomX = (Math.random() - 0.5) * (cellWidth * 0.3);
      const randomY = (Math.random() - 0.5) * (cellHeight * 0.3);
      
      // Calculate base position
      let x = (col + 0.5) * cellWidth + randomX;
      let y = (row + 0.5) * cellHeight + randomY;
      
      // Ensure bubbles stay within bounds
      x = Math.max(size/2 + padding, Math.min(x, containerWidth - size/2 - padding));
      y = Math.max(size/2 + padding, Math.min(y, containerHeight - size/2 - padding));
      
      positions.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3, // Reduced initial velocity
        vy: (Math.random() - 0.5) * 0.3,
        size
      });
    });
    
    setBubblePositions(positions);
  };

  const getBubbleSize = (token, totalBubbles) => {
    // Base size gets smaller as total number of bubbles increases
    const baseSize = Math.max(140, 240 - (totalBubbles * 3));
    const priceChange = token.priceChange24h || 0;
    
    // More conservative size scaling
    const multiplier = Math.min(Math.max(Math.abs(priceChange) / 25, 0.8), 1.2);
    
    return Math.max(baseSize * multiplier, 120); // Minimum size of 120px
  };

  const handleMouseDown = (index, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      index,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
      timestamp: Date.now()
    };
    mouseRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    
    setBubblePositions(prev => {
      const newPositions = [...prev];
      newPositions[index].isDragging = true;
      return newPositions;
    });
  };

  const handleMouseMove = (e) => {
    if (dragRef.current !== null) {
      const { index } = dragRef.current;
      const dx = e.clientX - mouseRef.current.x;
      const dy = e.clientY - mouseRef.current.y;
      
      setBubblePositions(prev => {
        const newPositions = [...prev];
        newPositions[index].x += dx;
        newPositions[index].y += dy;
        
        // Calculate velocity based on movement
        const now = Date.now();
        const dt = now - lastDragTime.current;
        if (dt > 0) {
          newPositions[index].vx = dx / dt * 16; // Scale for 60fps
          newPositions[index].vy = dy / dt * 16;
        }
        lastDragTime.current = now;
        
        return newPositions;
      });
      
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    if (dragRef.current !== null) {
      const index = dragRef.current.index;
      setBubblePositions(prev => {
        const newPositions = [...prev];
        newPositions[index].isDragging = false;
        return newPositions;
      });
      
      // Add small delay before clearing drag state
      setTimeout(() => {
        setIsDragging(false);
      }, 100);
      
      dragRef.current = null;
    }
  };

  const updateBubblePositions = () => {
    setBubblePositions(prevPositions => {
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth * 0.95;
      const containerHeight = (containerRef.current?.clientHeight || window.innerHeight) - 180;
      const newPositions = [...prevPositions];
      
      for (let i = 0; i < newPositions.length; i++) {
        if (newPositions[i].isDragging) continue;
        
        const size = newPositions[i].size;
        const padding = 40;
        
        // Update position first
        newPositions[i].x += newPositions[i].vx;
        newPositions[i].y += newPositions[i].vy;
        
        // Check boundaries and bounce
        const rightBound = containerWidth - size - padding;
        const bottomBound = containerHeight - size - padding;
        
        // Right/Left bounds
        if (newPositions[i].x > rightBound) {
          newPositions[i].x = rightBound;
          newPositions[i].vx = -Math.abs(newPositions[i].vx) * COLLISION_DAMPING;
        } else if (newPositions[i].x < padding) {
          newPositions[i].x = padding;
          newPositions[i].vx = Math.abs(newPositions[i].vx) * COLLISION_DAMPING;
        }
        
        // Bottom/Top bounds
        if (newPositions[i].y > bottomBound) {
          newPositions[i].y = bottomBound;
          newPositions[i].vy = -Math.abs(newPositions[i].vy) * COLLISION_DAMPING;
        } else if (newPositions[i].y < padding) {
          newPositions[i].y = padding;
          newPositions[i].vy = Math.abs(newPositions[i].vy) * COLLISION_DAMPING;
        }
        
        // Add very slight random movement to prevent stagnation
        if (Math.abs(newPositions[i].vx) < 0.1 && Math.abs(newPositions[i].vy) < 0.1) {
          newPositions[i].vx += (Math.random() - 0.5) * 0.2;
          newPositions[i].vy += (Math.random() - 0.5) * 0.2;
        }
        
        // Apply damping
        newPositions[i].vx *= DAMPING;
        newPositions[i].vy *= DAMPING;
        
        // Add bubble-to-bubble collisions
        for (let j = i + 1; j < newPositions.length; j++) {
          const dx = newPositions[j].x - newPositions[i].x;
          const dy = newPositions[j].y - newPositions[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (newPositions[i].size + newPositions[j].size) / 2;
          
          if (distance < minDistance) {
            const angle = Math.atan2(dy, dx);
            const force = (minDistance - distance) * 0.05;
            
            const moveX = Math.cos(angle) * force;
            const moveY = Math.sin(angle) * force;
            
            if (!newPositions[i].isDragging) {
              newPositions[i].vx -= moveX;
              newPositions[i].vy -= moveY;
            }
            if (!newPositions[j].isDragging) {
              newPositions[j].vx += moveX;
              newPositions[j].vy += moveY;
            }
          }
        }
      }
      
      return newPositions;
    });
    
    animationFrameRef.current = requestAnimationFrame(updateBubblePositions);
  };

  // Start animation loop
  useEffect(() => {
    if (currentList.length > 0) {
      animationFrameRef.current = requestAnimationFrame(updateBubblePositions);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentList]);

  // Add mouse event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Initialize positions when component mounts
  useEffect(() => {
    if (currentList.length > 0) {
      initializeBubblePositions(currentList);
    }
  }, []);

  const handleBubbleClick = (token) => {
    // Ensure all necessary data is included
    const modalData = {
      ...token,
      chain: token.chain || token.baseToken?.chain,
      pairAddress: token.pairAddress || token.baseToken?.pairAddress,
      websites: token.websites || [{ url: token.website }].filter(w => w.url),
      socials: [
        token.twitter && { platform: 'twitter', handle: token.twitter.split('/').pop() },
        token.telegram && { platform: 'telegram', handle: token.telegram.split('/').pop() }
      ].filter(Boolean)
    };
    
    setSelectedToken(modalData);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Increase minimum radius for better logo visibility
    const minRadius = Math.min(width, height) * 0.04; // Increased from typical 0.02-0.03
    const maxRadius = Math.min(width, height) * 0.15;

    const simulation = forceSimulation(currentList)
      .force('charge', forceManyBody().strength(30))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide().radius(d => d.size + 5)) // Added padding between bubbles
      .force('x', forceX(width / 2).strength(0.05))
      .force('y', forceY(height / 2).strength(0.05));

    // Ensure bubbles stay within bounds
    const boundingForce = () => {
      for (let node of currentList) {
        node.x = Math.max(node.size, Math.min(width - node.size, node.x));
        node.y = Math.max(node.size, Math.min(height - node.size, node.y));
      }
    };

    simulation.on('tick', () => {
      boundingForce();
      // ... rest of tick handling
    });

    // ... rest of component code
  }, [currentList]);

  return (
    <Container ref={containerRef}>
      <BubbleListSelector onListChange={handleListChange} />
      {isLoading && (
        <LoadingIndicator>
          Loading tokens...
        </LoadingIndicator>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <BubblesGrid>
        <TerminalTitle>XEN Network Monitor v1.0</TerminalTitle>
        {currentList
          .filter(token => {
            const symbol = token.baseToken?.symbol || token.symbol;
            return symbol && symbol !== 'Unknown';
          })
          .map((token, index) => {
            const position = bubblePositions[index] || { 
              x: 0, 
              y: 0, 
              size: getBubbleSize(token, currentList.length) 
            };
            return (
              <BubbleWrapper
                key={token.symbol}
                size={position.size}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'opacity 0.3s ease'
                }}
                onMouseDown={(e) => handleMouseDown(index, e)}
              >
                <Bubble
                  size={position.size}
                  color={token.color}
                  data={token}
                  onClick={handleBubbleClick}
                />
              </BubbleWrapper>
            );
        })}
      </BubblesGrid>
      {selectedToken && (
        <TokenModal
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </Container>
  );
};

export default BubbleContainer; 