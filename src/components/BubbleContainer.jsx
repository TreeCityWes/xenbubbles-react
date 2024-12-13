import React, { useState, useEffect, useRef, useCallback } from 'react';
import Bubble from './Bubble';
import BubbleListSelector from './BubbleListSelector';
import styled from 'styled-components';
import '../styles/bubble-animations.css';
import TokenModal from './TokenModal';
import { forceSimulation, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force';
import LoadingScreen from './LoadingScreen';
import TokenTable from './TokenTable';
import { colors } from '../styles/theme';
import TimeFrameSelector from './TimeFrameSelector';
import { fetchTokenData } from '../services/dexscreener';

// Add this helper function near the top of the file
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

// Add a media query helper
const mobile = `@media (max-width: 768px)`;
const smallMobile = `@media (max-width: 480px)`;

// Styled components (unchanged)
const Container = styled.div`
  width: 100%;
  height: calc(100vh - 124px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  position: relative;
  margin: 0 auto;
  margin-bottom: 16px;
  overflow: hidden;

  @media (max-width: 768px) {
    height: auto;
    min-height: calc(100vh - 90px);
    padding: 0;
    margin: 0;
    padding-top: 110px;
    margin-bottom: 16px;
    overflow-y: auto;
  }
`;

const BubblesGrid = styled.div.attrs({ className: 'bubbles-grid' })`
  width: 95%;
  height: 100%;
  background: ${colors.background};
  border: 2px solid ${colors.primary};
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  padding: 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0;
    border-left: none;
    border-right: none;
    height: auto;
    min-height: calc(100vh - 142px);
    overflow-y: auto;
  }
`;

const Toolbar = styled.div`
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
  height: 40px;
  background: rgba(50, 205, 50, 0.05);
  border-bottom: 1px solid ${colors.primary};
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  z-index: 3;

  @media (max-width: 768px) {
    top: 0;
    position: fixed;
    background: rgba(0, 0, 0, 0.95);
  }
`;

const BubblesArea = styled.div`
  position: absolute;
  top: 74px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  box-sizing: border-box;
  background: repeating-linear-gradient(
    0deg,
    rgba(57, 255, 20, 0.03) 0px,
    rgba(57, 255, 20, 0.03) 1px,
    transparent 1px,
    transparent 2px
  );

  @media (max-width: 768px) {
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
    padding: 16px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const Canvas = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;
  overflow-y: ${props => props.$isTable ? 'auto' : 'hidden'};
  -webkit-overflow-scrolling: touch;

  /* Cyberpunk scrollbar styling - only visible in table mode */
  ${props => props.$isTable && `
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(57, 255, 20, 0.3);
      border-radius: 3px;
      
      &:hover {
        background: rgba(57, 255, 20, 0.5);
      }
    }

    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(57, 255, 20, 0.3) transparent;
  `}

  @media (max-width: 768px) {
    position: relative;
    height: auto;
    padding: 8px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const BubbleWrapper = styled.div`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  transform-origin: center center;
  will-change: transform;
  cursor: grab;
  user-select: none;
  
  @media (max-width: 768px) {
    position: relative;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    transform: none !important;
    margin: 0;
  }
  
  font-size: ${props => Math.max(8, props.size * 0.15)}px;

  img {
    width: ${props => Math.max(16, props.size * 0.35)}px;
    height: ${props => Math.max(16, props.size * 0.35)}px;
  }
  
  .price-text {
    font-size: ${props => Math.max(6, props.size * 0.12)}px;
  }
  
  .percentage-text {
    font-size: ${props => Math.max(7, props.size * 0.14)}px;
  }
  
  &:active {
    cursor: grabbing;
  }
  
  &:hover {
    z-index: 1000;
  }
`;

const DonationLinks = styled.div`
  display: flex;
  gap: 15px;
  font-family: monospace;
  font-size: 12px;

  ${mobile} {
    font-size: 10px;
    gap: 8px;
  }
`;

const DonationLink = styled.a`
  color: ${colors.primary};
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s, text-shadow 0.2s;
  text-shadow: 0 0 2px ${colors.shadow};
  
  &:hover {
    opacity: 1;
    text-shadow: 0 0 5px ${colors.shadow};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 12px;
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 8px;
  }
`;

const ToggleLabel = styled.span`
  color: ${colors.primary};
  font-size: 14px;
  opacity: ${props => props.$active ? 1 : 0.6};
  text-shadow: ${props => props.$active ? `0 0 5px ${colors.shadow}` : 'none'};
`;

const ToggleSwitch = styled.div`
  width: 60px;
  height: 30px;
  background: rgba(50, 205, 50, 0.1);
  border: 2px solid ${colors.primary};
  border-radius: 15px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px ${colors.shadow};

  &:hover {
    box-shadow: 0 0 15px ${colors.shadow};
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '32px' : '2px'};
    width: 22px;
    height: 22px;
    background: ${colors.primary};
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 0 10px ${colors.shadow};
  }
`;

const ScrollIndicator = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(57, 255, 20, 0.1);
    border: 1px solid #39FF14;
    border-radius: 20px;
    padding: 10px;
    color: #39FF14;
    z-index: 1000;
    cursor: pointer;
    
    &::after {
      content: '${props => props.$isAtBottom ? '︿' : '﹀'}';
      font-size: 24px;
      line-height: 1;
    }
  }
`;

const StatusBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: rgba(11, 15, 18, 0.95);
  border-top: 1px solid ${colors.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 12px;
  font-family: monospace;
  font-size: 11px;
  color: ${colors.primary};
  z-index: 1000;
  overflow-x: auto;
  white-space: nowrap;
  box-shadow: 0 -4px 20px ${colors.shadow};

  /* Hide scrollbar but keep functionality */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: max-content;
  padding: 0 12px;
  justify-content: center;
`;

const SocialIcon = styled.a`
  color: ${colors.primary};
  opacity: 0.8;
  transition: all 0.2s;
  font-size: 14px;
  text-decoration: none;
  padding: 0 3px;
  
  &:hover {
    opacity: 1;
    text-shadow: 0 0 5px ${colors.shadow};
  }
`;

const DonationText = styled.span`
  opacity: 0.8;
  margin: 0 6px;
  font-weight: bold;
`;

const WalletAddress = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  font-family: monospace;
  font-size: 11px;
  padding: 0 4px;
  margin: 0 2px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s;

  &:hover {
    opacity: 1;
    text-shadow: 0 0 5px ${colors.shadow};
  }
`;

const CopiedTooltip = styled.span`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(50, 205, 50, 0.1);
  border: 1px solid ${colors.primary};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1001;
  backdrop-filter: blur(4px);
  box-shadow: 0 0 10px ${colors.shadow};
`;

const MobileDisclaimer = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    text-align: center;
    padding: 8px;
    background: rgba(50, 205, 50, 0.05);
    color: ${colors.primary};
    font-size: 12px;
    font-style: italic;
    border-bottom: 1px solid ${colors.primary};
  }
`;

// Add back the TerminalHeader and TerminalTitle components
const TerminalHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  z-index: 3;

  @media (max-width: 768px) {
    display: none; // Hide on mobile
  }
`;

const TerminalTitle = styled.div`
  color: ${colors.primary};
  font-size: 14px;
  font-family: monospace;
  text-shadow: 0 0 5px ${colors.shadow};
  &::before {
    content: '> ';
  }
  &::after {
    content: '_';
    animation: blink 1s infinite;
  }

  ${mobile} {
    font-size: 12px;
  }
`;

// Add this function near the top of BubbleContainer
const scatterBubbles = (bubbles, width, height) => {
  return bubbles.map(bubble => {
    const angle = Math.random() * Math.PI * 2;
    const force = Math.random() * 30 + 20; // Random force between 20-50
    return {
      ...bubble,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force,
      settling: true
    };
  });
};

const BubbleContainer = () => {
  const [currentList, setCurrentList] = useState([]);
  const [bubblePositions, setBubblePositions] = useState([]);
  const animationFrameRef = useRef();
  const containerRef = useRef();
  const dragRef = useRef({
    index: null,
    initialX: 0,
    initialY: 0,
    startX: 0,
    startY: 0,
    isDragging: false,
    movementThreshold: 3,
    startTime: 0
  });
  const mouseRef = useRef({ x: 0, y: 0 });
  const [selectedToken, setSelectedToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(() => {
    // Default to 'ALL' on mobile, 'Xen' on desktop
    return window.innerWidth <= 768 ? 'ALL' : 'Xen';
  });
  const [isDragging, setIsDragging] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [viewMode, setViewMode] = useState('bubbles');
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [timeFrame, setTimeFrame] = useState('24h');

  const getBubbleSize = useCallback((token, totalTokens) => {
    if (!containerRef.current) return 140;
    
    const bubblesArea = containerRef.current.querySelector('[data-bubbles-area]');
    if (!bubblesArea) return 140;
    
    const areaRect = bubblesArea.getBoundingClientRect();
    
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return 100;
    
    const availableArea = areaRect.width * areaRect.height;
    const baseSize = Math.sqrt(availableArea / (totalTokens * 3));
    
    const minSize = Math.min(baseSize * 0.3, 60);
    const maxSize = Math.min(baseSize * 1.5, 200);
    
    // Use absolute price change based on timeframe
    const priceChange = Math.abs(token.priceChange24h || 0);
    
    // Adjust size multiplier based on timeframe
    let sizeMultiplier;
    switch(timeFrame) {
      case '5m':
        // More dramatic size changes for short timeframes
        sizeMultiplier = priceChange === 0 ? 0.3 :
          priceChange <= 0.5 ? 0.4 :
          priceChange <= 2 ? 0.6 + (priceChange / 2) * 0.3 :
          priceChange <= 5 ? 0.9 + (priceChange / 5) * 0.4 :
          1.5;
        break;
      case '1h':
        sizeMultiplier = priceChange === 0 ? 0.3 :
          priceChange <= 1 ? 0.4 :
          priceChange <= 3 ? 0.6 + (priceChange / 3) * 0.3 :
          priceChange <= 8 ? 0.9 + (priceChange / 8) * 0.4 :
          1.5;
        break;
      case '6h':
        sizeMultiplier = priceChange === 0 ? 0.3 :
          priceChange <= 2 ? 0.4 :
          priceChange <= 5 ? 0.6 + (priceChange / 5) * 0.3 :
          priceChange <= 15 ? 0.9 + (priceChange / 15) * 0.4 :
          1.5;
        break;
      default: // 24h
        sizeMultiplier = priceChange === 0 ? 0.3 :
          priceChange <= 5 ? 0.4 :
          priceChange <= 10 ? 0.6 + (priceChange / 10) * 0.3 :
          priceChange <= 20 ? 0.9 + (priceChange / 20) * 0.4 :
          1.5;
    }
    
    const size = minSize + (maxSize - minSize) * sizeMultiplier;
    return Math.round(size);
  }, [timeFrame]);

  const initializeBubblePositions = useCallback((list) => {
    if (!list?.length || !containerRef.current) return;
    
    const bubblesArea = containerRef.current.querySelector('[data-bubbles-area]');
    if (!bubblesArea) return;
    
    const rect = bubblesArea.getBoundingClientRect();
    setContainerDimensions({ width: rect.width, height: rect.height });

    if (bubblePositions.length === list.length) return;

    const simulation = forceSimulation(list)
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(rect.width / 2, rect.height / 2))
      .force('collision', forceCollide().radius(d => getBubbleSize(d, list.length) / 1.5 + 20))
      .force('x', forceX(rect.width / 2).strength(0.02))
      .force('y', forceY(rect.height / 2).strength(0.02))
      .stop();

    for (let i = 0; i < 500; ++i) simulation.tick();

    const bubbles = list.map((token, i) => {
      const node = simulation.nodes()[i];
      const size = getBubbleSize(token, list.length);
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      
      return {
        x: Math.max(size/2, Math.min(rect.width - size/2, node.x)),
        y: Math.max(32 + size/2, Math.min(rect.height - size/2, node.y)),
        size: size,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
      };
    });

    setBubblePositions(bubbles);
  }, [getBubbleSize, bubblePositions.length]);

  const handleListChange = useCallback(async (newList, selectedListId) => {
    setIsLoading(true);
    setSelectedTab(selectedListId);
    
    if (newList && newList.length > 0) {
      const validTokens = newList.filter(token => {
        const symbol = token.baseToken?.symbol || token.symbol;
        return symbol && symbol !== 'Unknown';
      });

      try {
        const processedTokens = await Promise.all(
          validTokens.map(async (token) => {
            // Store original logo URLs before fetching market data
            const originalLogoUrl = token.logoUrl || token.imageUrl;
            const originalImageUrl = token.imageUrl || token.logoUrl;
            
            try {
              const marketData = await fetchTokenData(token.chain, token.contract, timeFrame);
              return {
                ...token,
                ...marketData,
                // Preserve original logo URLs if market data doesn't provide new ones
                logoUrl: marketData.logoUrl || originalLogoUrl || token.logo,
                imageUrl: marketData.imageUrl || originalImageUrl || token.logo,
                listId: selectedListId
              };
            } catch (error) {
              console.error(`Error processing token ${token.contract}:`, error);
              // Return token with original logos if market data fetch fails
              return {
                ...token,
                logoUrl: originalLogoUrl || token.logo,
                imageUrl: originalImageUrl || token.logo,
                listId: selectedListId
              };
            }
          })
        );

        setCurrentList(processedTokens);
        if (viewMode === 'bubbles') {
          initializeBubblePositions(processedTokens);
        }
      } catch (error) {
        console.error('Error processing tokens:', error);
      }
    }
    setIsLoading(false);
  }, [initializeBubblePositions, viewMode, timeFrame]);

  const handleBubbleClick = useCallback((token) => {
    if (!token || !token.chain) return;
    setSelectedToken(token);
  }, []);

  const updateBubblePositions = useCallback(() => {
    if (!containerRef.current || viewMode !== 'bubbles') return;
    
    const area = containerRef.current.querySelector('[data-bubbles-area]');
    if (!area) return;
    
    const areaRect = area.getBoundingClientRect();
    
    setBubblePositions(prevPositions => {
      return prevPositions.map((bubble, i) => {
        if (bubble.isDragging) return bubble;
        
        let { x, y, vx, vy, size, settling } = bubble;
        
        // Reduce damping for smoother movement
        const dampingFactor = settling ? 0.95 : 0.98;
        vx *= dampingFactor;
        vy *= dampingFactor;
        
        x += vx;
        y += vy;
        
        const padding = size * 0.05;
        
        // Softer boundary collisions
        if (x < padding) {
          x = padding;
          vx = Math.abs(vx) * 0.3; // Reduced bounce
        }
        if (x > areaRect.width - size - padding) {
          x = areaRect.width - size - padding;
          vx = -Math.abs(vx) * 0.3;
        }
        if (y < padding) {
          y = padding;
          vy = Math.abs(vy) * 0.3;
        }
        if (y > areaRect.height - size - padding) {
          y = areaRect.height - size - padding;
          vy = -Math.abs(vy) * 0.3;
        }

        // Gentler bubble collisions
        prevPositions.forEach((other, j) => {
          if (i !== j) {
            const dx = other.x - x;
            const dy = other.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = (size + other.size) / 2;
            
            if (distance < minDist) {
              const angle = Math.atan2(dy, dx);
              const force = (minDist - distance) * 0.02; // Reduced force
              
              const pushX = Math.cos(angle) * force;
              const pushY = Math.sin(angle) * force;
              
              vx -= pushX;
              vy -= pushY;
            }
          }
        });
        
        return { ...bubble, x, y, vx, vy, settling };
      });
    });
    
    animationFrameRef.current = requestAnimationFrame(updateBubblePositions);
  }, [viewMode]);

  useEffect(() => {
    if (currentList.length > 0 && viewMode === 'bubbles') {
      animationFrameRef.current = requestAnimationFrame(updateBubblePositions);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentList, updateBubblePositions, viewMode]);

  useEffect(() => {
    if (viewMode === 'bubbles' && currentList.length > 0) {
      const timer = setTimeout(() => {
        initializeBubblePositions(currentList);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, currentList, initializeBubblePositions]);

  // Start dragging on mousedown
  const handleMouseDown = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const bubble = bubblePositions[index];
    if (!bubble) return;

    mouseRef.current = { x: e.clientX, y: e.clientY };

    dragRef.current = {
      index,
      initialX: bubble.x,
      initialY: bubble.y,
      startX: e.clientX,
      startY: e.clientY,
      isDragging: false,
      movementThreshold: 3,
      startTime: Date.now()
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current || dragRef.current.index === null) return;

    const { index, startX, startY } = dragRef.current;
    const bubble = bubblePositions[index];
    if (!bubble) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (!dragRef.current.isDragging && 
        (Math.abs(deltaX) > dragRef.current.movementThreshold || 
         Math.abs(deltaY) > dragRef.current.movementThreshold)) {
      dragRef.current.isDragging = true;
      setIsDragging(true);
    }

    if (dragRef.current.isDragging) {
      const size = bubble.size || 50;
      const newX = Math.max(0, Math.min(containerDimensions.width - size, bubble.x + (e.clientX - mouseRef.current.x)));
      const newY = Math.max(32, Math.min(containerDimensions.height - size, bubble.y + (e.clientY - mouseRef.current.y)));

      mouseRef.current = { x: e.clientX, y: e.clientY };

      setBubblePositions(prev => {
        const newPositions = [...prev];
        if (!newPositions[index]) return prev;
        
        newPositions[index] = {
          ...newPositions[index],
          x: newX,
          y: newY,
          vx: e.movementX * 0.1,
          vy: e.movementY * 0.1
        };
        return newPositions;
      });
    }
  }, [bubblePositions, containerDimensions]);

  const applyMomentum = useCallback((index, initialVx, initialVy) => {
    let vx = initialVx;
    let vy = initialVy;
    let frame = 0;
    
    const animate = () => {
      if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) return;
      
      setBubblePositions(prev => {
        const newPositions = [...prev];
        const bubble = newPositions[index];
        if (!bubble) return prev;

        const friction = 0.95;
        vx *= friction;
        vy *= friction;

        const newX = bubble.x + vx;
        const newY = bubble.y + vy;

        const size = bubble.size || 50;
        const minX = 0;
        const maxX = containerDimensions.width - size;
        const minY = 32;
        const maxY = containerDimensions.height - size;

        if (newX < minX || newX > maxX) {
          vx *= -0.8;
        }
        if (newY < minY || newY > maxY) {
          vy *= -0.8;
        }

        newPositions[index] = {
          ...bubble,
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY)),
          vx,
          vy
        };
        return newPositions;
      });

      if (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01) {
        frame = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [containerDimensions]);

  // Handle global mouse up
  const handleGlobalMouseUp = useCallback((e) => {
    if (!dragRef.current || dragRef.current.index === null) return;

    const { index, isDragging, startTime } = dragRef.current;
    const timeDiff = Date.now() - startTime;
    const isQuickInteraction = timeDiff < 200;

    const bubble = bubblePositions[index];
    const token = currentList[index];

    if (!isDragging && isQuickInteraction && token) {
      // Click
      handleBubbleClick(token);
    } else if (isDragging && bubble) {
      // Drag end with momentum
      applyMomentum(index, bubble.vx || 0, bubble.vy || 0);
    }

    dragRef.current = { index: null };
    setIsDragging(false);
  }, [bubblePositions, applyMomentum, handleBubbleClick, currentList]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleMouseMove, handleGlobalMouseUp]);

  // Touch events adapted similarly to mouse
  const handleTouchStart = useCallback((index, e) => {
    const touch = e.touches[0];
    const syntheticEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation()
    };
    handleMouseDown(index, syntheticEvent);
  }, [handleMouseDown]);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const syntheticEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault()
    };
    handleMouseMove(syntheticEvent);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback((e) => {
    handleGlobalMouseUp(e);
  }, [handleGlobalMouseUp]);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setViewMode('table'); // Force table view on mobile
        setSelectedTab('ALL'); // Force ALL view on mobile
      }
      if (currentList.length) {
        initializeBubblePositions(currentList);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call it initially
    
    return () => window.removeEventListener('resize', handleResize);
  }, [currentList, initializeBubblePositions]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = (scrolled / maxScroll) * 70;
      setScrollPercentage(percentage);
      setIsAtBottom(Math.ceil(scrolled + window.innerHeight) >= document.documentElement.scrollHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollClick = () => {
    if (isAtBottom) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Modify the timeFrame effect
  useEffect(() => {
    if (currentList.length > 0 && viewMode === 'bubbles') {
      const fetchData = async () => {
        setIsLoading(true);
        
        try {
          const processedTokens = await Promise.all(
            currentList.map(async (token) => {
              try {
                const marketData = await fetchTokenData(token.chain, token.contract, timeFrame);
                return { ...token, ...marketData };
              } catch (error) {
                console.error(`Error processing token ${token.contract}:`, error);
                return token;
              }
            })
          );

          setCurrentList(processedTokens);
          setBubblePositions(processedTokens.map((token, index) => {
            const oldPosition = bubblePositions[index] || { x: 0, y: 0 };
            return {
              ...oldPosition,
              size: getBubbleSize(token, processedTokens.length),
              vx: oldPosition.vx || 0,
              vy: oldPosition.vy || 0
            };
          }));
        } catch (error) {
          console.error('Error updating tokens and bubbles:', error);
        } finally {
          // Single timeout to remove loading state
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
      };

      fetchData();
    }
  }, [timeFrame, currentList.length, viewMode, getBubbleSize]);

  return (
    <Container ref={containerRef}>
      <BubblesGrid>
        {!isMobile && (
          <TerminalHeader>
            <TerminalTitle>XEN Network Monitor v1.0</TerminalTitle>
            <DonationLinks>
              <DonationLink 
                href="https://buymeacoffee.com/treecitywes" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                ☕ Buy me a coffee
              </DonationLink>
            </DonationLinks>
          </TerminalHeader>
        )}
        {isMobile && (
          <MobileDisclaimer>
            ⓘ Bubble view is optimized for desktop. Using table view for mobile devices.
          </MobileDisclaimer>
        )}
        <Toolbar>
          <BubbleListSelector 
            onListChange={handleListChange} 
            setLoading={setIsLoading}
            timeFrame={timeFrame}
          />
          <TimeFrameSelector 
            selectedTimeFrame={timeFrame}
            onTimeFrameChange={setTimeFrame}
            setLoading={setIsLoading}
          />
          {!isMobile && (
            <ViewToggle>
              <ToggleLabel $active={viewMode === 'bubbles'}>Bubble</ToggleLabel>
              <ToggleSwitch 
                $active={viewMode === 'table'} 
                onClick={() => setViewMode(prev => prev === 'bubbles' ? 'table' : 'bubbles')}
              />
              <ToggleLabel $active={viewMode === 'table'}>Table</ToggleLabel>
            </ViewToggle>
          )}
        </Toolbar>
        <BubblesArea>
          <Canvas data-bubbles-area $isTable={viewMode === 'table' || isMobile}>
            {isLoading && <LoadingScreen />}
            {!isLoading && (
              <>
                {!isMobile && viewMode === 'bubbles' && (
                  currentList
                    .filter(token => {
                      const symbol = token.baseToken?.symbol || token.symbol;
                      return symbol && symbol !== 'Unknown';
                    })
                    .map((token, index) => {
                      const position = bubblePositions[index] || { x: 0, y: 0 };
                      const size = position.size || getBubbleSize(token, currentList.length);
                      return (
                        <BubbleWrapper
                          key={`${token.chain}-${token.contract}-${index}`}
                          size={size}
                          style={{
                            transform: `translate(${position.x}px, ${position.y}px)`,
                            transition: position.x === undefined ? 'none' : 'opacity 0.3s ease'
                          }}
                          onMouseDown={(e) => handleMouseDown(index, e)}
                          onTouchStart={(e) => handleTouchStart(index, e)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                        >
                          <Bubble
                            size={size}
                            color={token.color}
                            data={token}
                            selectedTab={selectedTab}
                          />
                        </BubbleWrapper>
                      );
                    })
                )}

                {(isMobile || viewMode === 'table') && (
                  <TokenTable 
                    tokens={currentList} 
                    onTokenClick={handleBubbleClick}
                    timeFrame={timeFrame}
                    fetchTokenData={fetchTokenData}
                  />
                )}
              </>
            )}
          </Canvas>
        </BubblesArea>
        <StatusBar>
          <StatusSection>
            <SocialIcon href="https://youtube.com/@hashheadio" target="_blank">
              <i className="fab fa-youtube"></i>
            </SocialIcon>
            <SocialIcon href="https://twitter.com/hashheadio" target="_blank">
              <i className="fab fa-twitter"></i>
            </SocialIcon>
            <SocialIcon href="https://github.com/hashheadio" target="_blank">
              <i className="fab fa-github"></i>
            </SocialIcon>
            <SocialIcon href="https://t.me/hashheadio" target="_blank">
              <i className="fab fa-telegram"></i>
            </SocialIcon>
            <SocialIcon href="https://buymeacoffee.com/treecitywes" target="_blank">
              <i className="fas fa-coffee"></i>
            </SocialIcon>
            <DonationText>   Click To Copy Donation Address
            </DonationText>
            <WalletAddress 
              onClick={async () => {
                await copyToClipboard('0xe4bB184781bBC9C7004e8DafD4A9B49d203BC9bC');
                setCopiedAddress('ETH');
                setTimeout(() => setCopiedAddress(null), 2000);
              }}
            >
            ETH: 0xe4b...9bC
              <CopiedTooltip $visible={copiedAddress === 'ETH'}>Copied!</CopiedTooltip>
            </WalletAddress>
            <WalletAddress 
              onClick={async () => {
                await copyToClipboard('bc1qrglll5kcgjk7lrwll4mzfcw0yxm0zh9anq7x6g');
                setCopiedAddress('BTC');
                setTimeout(() => setCopiedAddress(null), 2000);
              }}
            >
              BTC: bc1q...6g
              <CopiedTooltip $visible={copiedAddress === 'BTC'}>Copied!</CopiedTooltip>
            </WalletAddress>
            <WalletAddress 
              onClick={async () => {
                await copyToClipboard('8bXf8Rg3u4Prz71LgKR5mpa7aMe2F4cSKYYRctmqro6x');
                setCopiedAddress('SOL');
                setTimeout(() => setCopiedAddress(null), 2000);
              }}
            >
              SOL: 8bXf...6x
              <CopiedTooltip $visible={copiedAddress === 'SOL'}>Copied!</CopiedTooltip>
            </WalletAddress>
          </StatusSection>
        </StatusBar>
      </BubblesGrid>

      <ScrollIndicator 
        onClick={handleScrollClick}
        $isAtBottom={isAtBottom}
      />
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
