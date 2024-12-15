import React, { useState, useEffect, useRef, useCallback } from 'react';
import Bubble from './Bubble';
import BubbleListSelector from './BubbleListSelector';
import styled, { keyframes } from 'styled-components';
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

// Add these keyframes at the top with other imports
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const gridPulse = keyframes`
  0% {
    opacity: 0.015;
  }
  50% {
    opacity: 0.03;
  }
  100% {
    opacity: 0.015;
  }
`;

const consoleScroll = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 -100px;
  }
`;

// Styled components (unchanged)
const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #000000;
  font-family: 'Fira Code', monospace;

  @media (max-width: 768px) {
    height: 100%;
    min-height: 100vh;
    padding-top: 60px;
    padding-bottom: 40px;
    overflow-y: auto;
  }
`;

const BubblesGrid = styled.div`
  width: 95%;
  height: calc(100vh - 140px);
  background: #0b0f12;
  border: 1px solid #333;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  padding: 0;
  margin: 20px auto 60px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    width: 100%;
    height: calc(100vh - 180px);
    margin: 0;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
  }
`;

const Toolbar = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 8px 16px;
  height: 40px;

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    right: 0;
    transform: none;
    top: 80px;
    background: rgba(0, 0, 0, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    flex-direction: column;
    padding: 8px;
    z-index: 1000;
  }
`;

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    width: 100%;
    padding: 6px;
    gap: 4px;
    justify-content: center;
    
    &:first-child {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const BubblesArea = styled.div`
  position: absolute;
  top: 41px;
  left: 2px;
  right: 2px;
  bottom: 34px;
  box-sizing: border-box;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.02) 0px,
    rgba(255, 255, 255, 0.02) 1px,
    transparent 1px,
    transparent 2px
  );
  border-bottom: 1px solid #333;
  overflow: hidden;
  touch-action: none;

  @media (max-width: 768px) {
    position: fixed;
    top: 180px;
    left: 0;
    right: 0;
    bottom: 40px;
    height: auto;
    margin: 0;
    border: none;
    border-radius: 0;
    overflow: hidden;
  }
`;

const Canvas = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;
  overflow: ${props => props.$isTable ? 'auto' : 'hidden'};

  @media (max-width: 768px) {
    height: 100%;
    overflow: hidden;
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
  touch-action: none;
  
  @media (max-width: 768px) {
    position: absolute;
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    &:active {
      cursor: grabbing;
      z-index: 1000;
    }
  }

  @media (max-width: 768px) {
    .bubble {
      transform-origin: center;
      transition: transform 0.3s ease;
      
      &.price-up {
        transform: scale(1.5);
        animation: pulseGreen 2s infinite;
      }
      
      &.price-down {
        transform: scale(0.6);
        animation: pulseRed 2s infinite;
      }
    }
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
    margin: 0;
    gap: 4px;
    transform: scale(0.8);
    justify-content: center;
  }
`;

const ToggleLabel = styled.span`
  color: ${colors.primary};
  font-size: 14px;
  opacity: ${props => props.$active ? 1 : 0.6};
  text-shadow: ${props => props.$active ? `0 0 5px ${colors.shadow}` : 'none'};

  @media (max-width: 768px) {
    font-size: 10px;
    margin: 0 2px;
  }
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

  @media (max-width: 768px) {
    width: 40px;
    height: 22px;
    border-width: 1px;
    border-radius: 11px;
    background: ${props => props.$active ? 'rgba(57, 255, 20, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '28px' : '2px'};
    width: 26px;
    height: 26px;
    background: ${colors.primary};
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 0 10px ${colors.shadow};

    @media (max-width: 768px) {
      width: 18px;
      height: 18px;
      top: 1px;
      left: ${props => props.$active ? 'calc(100% - 19px)' : '1px'};
      box-shadow: 0 0 5px ${colors.shadow};
    }
  }
`;

const StatusBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: #000000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 4px solid #39FF14;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  font-family: monospace;
  font-size: 12px;
  color: #ffffff;
  z-index: 1000;
  overflow-x: auto;
  white-space: nowrap;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    height: 32px;
    padding: 4px 8px;
    font-size: 10px;
    border-bottom-width: 2px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: max-content;
  padding: 0 16px;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 8px;
    padding: 0 8px;
  }
`;

const SocialIcon = styled.a`
  color: #999;
  opacity: 0.8;
  transition: all 0.3s ease;
  font-size: 14px;
  text-decoration: none;
  padding: 0 6px;
  
  &:hover {
    opacity: 1;
    color: #39FF14;
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 0 4px;
  }
`;

const DonationText = styled.span`
  opacity: 0.8;
  margin: 0 8px;
  font-weight: bold;
  color: #39FF14;
`;

const WalletAddress = styled.button`
  background: none;
  border: none;
  color: #999;
  font-family: monospace;
  font-size: 11px;
  padding: 4px 8px;
  margin: 0 4px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &:hover {
    opacity: 1;
    color: #39FF14;
    border-color: rgba(57, 255, 20, 0.3);
    background: rgba(57, 255, 20, 0.1);
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    font-size: 10px;
    padding: 2px 4px;
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

// Add back the TerminalHeader and TerminalTitle components
const TerminalHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  background: rgba(0, 0, 0, 0.95);
  border-bottom: 1px solid rgba(57, 255, 20, 0.2);
  z-index: 3;

  @media (max-width: 768px) {
    display: none;
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

// Add this new styled component with the other styled components
const MobileViewIndicator = styled.div`
  width: 100%;
  padding: 6px;
  background: rgba(57, 255, 20, 0.05);
  color: ${colors.primary};
  font-size: 12px;
  text-align: center;
  font-family: monospace;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(57, 255, 20, 0.2);
  text-shadow: 0 0 5px ${colors.shadow};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  i {
    font-size: 14px;
  }

  @media (min-width: 769px) {
    display: none;
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

// Add new styled components
const SizeToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 12px;
  
  @media (max-width: 768px) {
    margin: 0;
    gap: 4px;
    transform: scale(0.8);
    justify-content: center;
  }
`;

// If you have keyframe animations, you might want to make them more dramatic too
const pulseAnimation = keyframes`
  0% {
    transform: scale(1.5);
  }
  50% {
    transform: scale(1.7); // More dramatic pulse
  }
  100% {
    transform: scale(1.5);
  }
`;

const shrinkAnimation = keyframes`
  0% {
    transform: scale(0.6);
  }
  50% {
    transform: scale(0.4); // More dramatic shrink
  }
  100% {
    transform: scale(0.6);
  }
`;

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
  const [sizeMode, setSizeMode] = useState('priceChange');
  const activeFetchesRef = useRef(new Set());

  const getBubbleSize = useCallback((token, totalTokens) => {
    if (!containerRef.current) return 140;
    
    const bubblesArea = containerRef.current.querySelector('[data-bubbles-area]');
    if (!bubblesArea) return 140;
    
    const areaRect = bubblesArea.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    
    // Calculate base size using a smaller divisor for larger bubbles
    const availableArea = areaRect.width * areaRect.height;
    const baseSize = Math.sqrt(availableArea / (totalTokens * 1.2));
    
    if (sizeMode === 'marketCap') {
      const marketCaps = currentList.map(t => t.marketCap || 0).filter(mc => mc > 0);
      const minMarketCap = Math.min(...marketCaps);
      const maxMarketCap = Math.max(...marketCaps);
      
      const getLogScale = (value) => {
        if (value <= 0) return 0;
        const minLog = Math.log(minMarketCap);
        const maxLog = Math.log(maxMarketCap);
        const valueLog = Math.log(value);
        return (valueLog - minLog) / (maxLog - minLog) || 0;
      };

      const marketCapRatio = getLogScale(token.marketCap || 0);
      
      if (isMobile) {
        const minSize = 40;  // Reduced from 50
        const maxSize = 120; // Increased from 90
        return Math.max(minSize, Math.min(maxSize, minSize + (maxSize - minSize) * marketCapRatio));
      }
      
      const minSize = Math.min(baseSize * 0.6, 100);
      const maxSize = Math.min(baseSize * 2.0, 400);
      return Math.max(minSize, Math.min(maxSize, minSize + (maxSize - minSize) * marketCapRatio));
    }
    
    // Price change based sizing with more dramatic scaling for mobile
    const priceChange = Math.abs(token.priceChange24h || 0);
    
    if (isMobile) {
      const minSize = 40;  // Reduced minimum size
      const maxSize = 120; // Increased maximum size
      
      // More dramatic scaling based on price change
      const sizeMultiplier = priceChange === 0 ? 0.5 :
        priceChange <= 5 ? 0.6 + (priceChange / 5) * 0.4 :
        priceChange <= 10 ? 1.0 + (priceChange / 10) * 0.5 :
        priceChange <= 20 ? 1.5 + (priceChange / 20) * 0.5 :
        2.0;
      
      return Math.max(minSize, Math.min(maxSize, minSize * sizeMultiplier));
    }
    
    // Desktop sizing remains the same
    const minSize = Math.min(baseSize * 0.4, 80);
    const maxSize = Math.min(baseSize * 1.4, 250);
    
    const sizeMultiplier = priceChange === 0 ? 0.4 :
      priceChange <= 5 ? 0.5 + (priceChange / 5) * 0.3 :
      priceChange <= 10 ? 0.8 + (priceChange / 10) * 0.3 :
      priceChange <= 20 ? 1.1 + (priceChange / 20) * 0.2 :
      1.3;
    
    return Math.round(minSize + (maxSize - minSize) * sizeMultiplier);
  }, [timeFrame, sizeMode, currentList]);

  const initializeBubblePositions = useCallback((list) => {
    if (!list?.length || !containerRef.current) return;
    
    const bubblesArea = containerRef.current.querySelector('[data-bubbles-area]');
    if (!bubblesArea) return;
    
    const rect = bubblesArea.getBoundingClientRect();
    setContainerDimensions({ width: rect.width, height: rect.height });

    const isMobile = window.innerWidth <= 768;
    const simulation = forceSimulation(list)
      .force('charge', forceManyBody().strength(isMobile ? -50 : -400))
      .force('center', forceCenter(rect.width / 2, rect.height / 2))
      .force('collision', forceCollide().radius(d => getBubbleSize(d, list.length) / 1.8))
      .force('x', forceX(rect.width / 2).strength(isMobile ? 0.1 : 0.05))
      .force('y', forceY(rect.height / 2).strength(isMobile ? 0.1 : 0.05))
      .stop();

    for (let i = 0; i < 300; ++i) simulation.tick();

    const bubbles = list.map((token, i) => {
      const node = simulation.nodes()[i];
      const size = getBubbleSize(token, list.length);
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isMobile ? 2 : 5) + (isMobile ? 0.5 : 2);
      
      return {
        x: Math.max(size/2, Math.min(rect.width - size/2, node.x)),
        y: Math.max(32 + size/2, Math.min(rect.height - size/2, node.y)),
        size: size,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
      };
    });

    setBubblePositions(bubbles);
  }, [getBubbleSize]);

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
    setSelectedToken({
      ...token,
      price: token.price,
      priceChange24h: token.priceChange24h
    });
  }, []);

  const updateBubblePositions = useCallback(() => {
    if (!containerRef.current || viewMode !== 'bubbles') return;
    
    const area = containerRef.current.querySelector('[data-bubbles-area]');
    if (!area) return;
    
    const areaRect = area.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    const padding = size => size * 0.1; // Dynamic padding based on bubble size
    
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
        
        const bubblePadding = padding(size);
        
        // Boundary checks
        const minX = bubblePadding;
        const maxX = areaRect.width - size - bubblePadding;
        const minY = bubblePadding;
        const maxY = areaRect.height - size - bubblePadding;
        
        if (x < minX) {
          x = minX;
          vx = Math.abs(vx) * 0.3;
        }
        if (x > maxX) {
          x = maxX;
          vx = -Math.abs(vx) * 0.3;
        }
        if (y < minY) {
          y = minY;
          vy = Math.abs(vy) * 0.3;
        }
        if (y > maxY) {
          y = maxY;
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

  // Move applyMomentum before the handlers
  const applyMomentum = useCallback((index, vx, vy) => {
    setBubblePositions(prev => {
      const newPositions = [...prev];
      if (!newPositions[index]) return prev;
      
      newPositions[index] = {
        ...newPositions[index],
        vx: vx,
        vy: vy,
        settling: true
      };
      return newPositions;
    });
  }, []);

  // Then the mouse/touch handlers that use it
  const handleMouseDown = useCallback((index, e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    
    dragRef.current = {
      index,
      initialX: bubblePositions[index].x,
      initialY: bubblePositions[index].y,
      startX: e.clientX,
      startY: e.clientY,
      isDragging: false,
      movementThreshold: 3,
      startTime: Date.now()
    };
    
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, [bubblePositions]);

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current || dragRef.current.index === null) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    if (!dragRef.current.isDragging && 
        (Math.abs(deltaX) > dragRef.current.movementThreshold || 
         Math.abs(deltaY) > dragRef.current.movementThreshold)) {
      dragRef.current.isDragging = true;
      setIsDragging(true);
    }
    
    if (dragRef.current.isDragging) {
      setBubblePositions(prev => {
        const newPositions = [...prev];
        const index = dragRef.current.index;
        if (!newPositions[index]) return prev;
        
        newPositions[index] = {
          ...newPositions[index],
          x: dragRef.current.initialX + deltaX,
          y: dragRef.current.initialY + deltaY,
          vx: (e.clientX - mouseRef.current.x) * 0.1,
          vy: (e.clientY - mouseRef.current.y) * 0.1
        };
        
        mouseRef.current = { x: e.clientX, y: e.clientY };
        return newPositions;
      });
    }
  }, []);

  const handleGlobalMouseUp = useCallback((e) => {
    if (!dragRef.current || dragRef.current.index === null) return;
    
    const { index, isDragging, startTime } = dragRef.current;
    const timeDiff = Date.now() - startTime;
    const isQuickInteraction = timeDiff < 200;
    
    if (!isDragging && isQuickInteraction) {
      handleBubbleClick(currentList[index]);
    } else if (isDragging) {
      const bubble = bubblePositions[index];
      if (bubble) {
        const vx = (e.clientX - mouseRef.current.x) * 0.1;
        const vy = (e.clientY - mouseRef.current.y) * 0.1;
        applyMomentum(index, vx, vy);
      }
    }
    
    dragRef.current = { index: null };
    setIsDragging(false);
  }, [bubblePositions, handleBubbleClick, currentList, applyMomentum]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleMouseMove, handleGlobalMouseUp]);

  // Update the touch event handlers
  const handleTouchStart = useCallback((index, e) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    dragRef.current = {
      index,
      initialX: bubblePositions[index].x,
      initialY: bubblePositions[index].y,
      startX: touch.clientX,
      startY: touch.clientY,
      isDragging: false,
      movementThreshold: 3,
      startTime: Date.now()
    };
    
    mouseRef.current = { x: touch.clientX, y: touch.clientY };
  }, [bubblePositions]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!dragRef.current || dragRef.current.index === null) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragRef.current.startX;
    const deltaY = touch.clientY - dragRef.current.startY;
    
    if (!dragRef.current.isDragging && 
        (Math.abs(deltaX) > dragRef.current.movementThreshold || 
         Math.abs(deltaY) > dragRef.current.movementThreshold)) {
      dragRef.current.isDragging = true;
      setIsDragging(true);
    }
    
    if (dragRef.current.isDragging) {
      setBubblePositions(prev => {
        const newPositions = [...prev];
        const index = dragRef.current.index;
        if (!newPositions[index]) return prev;
        
        newPositions[index] = {
          ...newPositions[index],
          x: dragRef.current.initialX + deltaX,
          y: dragRef.current.initialY + deltaY,
          vx: (touch.clientX - mouseRef.current.x) * 0.1,
          vy: (touch.clientY - mouseRef.current.y) * 0.1
        };
        
        mouseRef.current = { x: touch.clientX, y: touch.clientY };
        return newPositions;
      });
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!dragRef.current || dragRef.current.index === null) return;
    
    const { index, isDragging, startTime } = dragRef.current;
    const timeDiff = Date.now() - startTime;
    const isQuickInteraction = timeDiff < 200;
    
    if (!isDragging && isQuickInteraction) {
      handleBubbleClick(currentList[index]);
    } else if (isDragging) {
      const bubble = bubblePositions[index];
      if (bubble) {
        applyMomentum(index, bubble.vx || 0, bubble.vy || 0);
      }
    }
    
    dragRef.current = { index: null };
    setIsDragging(false);
  }, [bubblePositions, handleBubbleClick, currentList, applyMomentum]);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      if (currentList.length) {
        initializeBubblePositions(currentList);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call it initially
    
    return () => window.removeEventListener('resize', handleResize);
  }, [currentList, initializeBubblePositions]);

  // Update the timeFrame effect
  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!currentList.length || !viewMode === 'bubbles' || isLoading) return;
      
      setIsLoading(true);
      try {
        // Create a Map of unique tokens
        const uniqueTokens = new Map();
        currentList.forEach(token => {
          const key = `${token.chain}-${token.contract}`;
          if (!uniqueTokens.has(key)) {
            uniqueTokens.set(key, token);
          }
        });

        const tokens = Array.from(uniqueTokens.values());
        const updatedTokens = await Promise.all(
          tokens.map(async (token) => {
            try {
              const marketData = await fetchTokenData(token.chain, token.contract, timeFrame);
              return marketData ? { ...token, ...marketData } : token;
            } catch (error) {
              console.error(`Error processing token ${token.contract}:`, error);
              return token;
            }
          })
        );

        if (isActive) {
          setCurrentList(updatedTokens);
          initializeBubblePositions(updatedTokens);
        }
      } catch (error) {
        console.error('Error updating tokens:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [timeFrame, currentList.length, viewMode]);

  return (
    <Container ref={containerRef}>
      <BubblesGrid>
        {!isMobile && (
          <TerminalHeader>
            <TerminalTitle>XEN Network Monitor v1.0</TerminalTitle>
            <ToolbarRow>
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
              <SizeToggle>
                <ToggleLabel $active={sizeMode === 'priceChange'}>Price Δ</ToggleLabel>
                <ToggleSwitch 
                  $active={sizeMode === 'marketCap'} 
                  onClick={() => setSizeMode(prev => prev === 'priceChange' ? 'marketCap' : 'priceChange')}
                />
                <ToggleLabel $active={sizeMode === 'marketCap'}>MCap</ToggleLabel>
              </SizeToggle>
              <ViewToggle>
                <ToggleLabel $active={viewMode === 'bubbles'}>Bubble</ToggleLabel>
                <ToggleSwitch 
                  $active={viewMode === 'table'} 
                  onClick={() => setViewMode(prev => prev === 'bubbles' ? 'table' : 'bubbles')}
                />
                <ToggleLabel $active={viewMode === 'table'}>Table</ToggleLabel>
              </ViewToggle>
            </ToolbarRow>
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
        
        {/* Mobile Toolbar */}
        {isMobile && (
          <Toolbar $isMobile={true}>
            <ToolbarRow>
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
            </ToolbarRow>
            <ToolbarRow>
              <SizeToggle>
                <ToggleLabel $active={sizeMode === 'priceChange'}>Price Δ</ToggleLabel>
                <ToggleSwitch 
                  $active={sizeMode === 'marketCap'} 
                  onClick={() => setSizeMode(prev => prev === 'priceChange' ? 'marketCap' : 'priceChange')}
                />
                <ToggleLabel $active={sizeMode === 'marketCap'}>MCap</ToggleLabel>
              </SizeToggle>
              <ViewToggle>
                <ToggleLabel $active={viewMode === 'bubbles'}>Bubble</ToggleLabel>
                <ToggleSwitch 
                  $active={viewMode === 'table'} 
                  onClick={() => setViewMode(prev => prev === 'bubbles' ? 'table' : 'bubbles')}
                />
                <ToggleLabel $active={viewMode === 'table'}>Table</ToggleLabel>
              </ViewToggle>
            </ToolbarRow>
          </Toolbar>
        )}
        
        <BubblesArea>
          <Canvas data-bubbles-area $isTable={viewMode === 'table'}>
            {isLoading && <LoadingScreen />}
            {!isLoading && (
              <>
                {viewMode === 'bubbles' && (
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
                            sizeMode={sizeMode}
                          />
                        </BubbleWrapper>
                      );
                    })
                )}

                {viewMode === 'table' && (
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
            <SocialIcon href="https://www.youtube.com/@TreeCityWes" target="_blank">
              <i className="fab fa-youtube"></i>
            </SocialIcon>
            <SocialIcon href="https://twitter.com/TreeCityWes" target="_blank">
              <i className="fab fa-twitter"></i>
            </SocialIcon>
            <SocialIcon href="https://github.com/TreeCityWes" target="_blank">
              <i className="fab fa-github"></i>
            </SocialIcon>
            <SocialIcon href="https://t.me/TreeCityTrading" target="_blank">
              <i className="fab fa-telegram"></i>
            </SocialIcon>
            <SocialIcon href="https://buymeacoffee.com/treecitywes" target="_blank">
              <i className="fas fa-coffee"></i>
            </SocialIcon>

            {/* Update the mobile wallet address buttons */}
            <WalletAddress 
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText('0xe4bB184781bBC9C7004e8DafD4A9B49d203BC9bC');
                  setCopiedAddress('ETH');
                  setTimeout(() => setCopiedAddress(null), 2000);
                } catch (err) {
                  // Fallback for browsers that don't support clipboard API
                  const textArea = document.createElement('textarea');
                  textArea.value = '0xe4bB184781bBC9C7004e8DafD4A9B49d203BC9bC';
                  document.body.appendChild(textArea);
                  textArea.select();
                  try {
                    document.execCommand('copy');
                    setCopiedAddress('ETH');
                    setTimeout(() => setCopiedAddress(null), 2000);
                  } catch (err) {
                    console.error('Failed to copy text: ', err);
                  }
                  document.body.removeChild(textArea);
                }
              }}
            >
              {window.innerWidth > 768 ? 'ETH: 0xe4b...9bC' : 'ETH'}
              <CopiedTooltip $visible={copiedAddress === 'ETH'}>Copied!</CopiedTooltip>
            </WalletAddress>

            <WalletAddress 
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText('bc1qrglll5kcgjk7lrwll4mzfcw0yxm0zh9anq7x6g');
                  setCopiedAddress('BTC');
                  setTimeout(() => setCopiedAddress(null), 2000);
                } catch (err) {
                  // Fallback for browsers that don't support clipboard API
                  const textArea = document.createElement('textarea');
                  textArea.value = 'bc1qrglll5kcgjk7lrwll4mzfcw0yxm0zh9anq7x6g';
                  document.body.appendChild(textArea);
                  textArea.select();
                  try {
                    document.execCommand('copy');
                    setCopiedAddress('BTC');
                    setTimeout(() => setCopiedAddress(null), 2000);
                  } catch (err) {
                    console.error('Failed to copy text: ', err);
                  }
                  document.body.removeChild(textArea);
                }
              }}
            >
              {window.innerWidth > 768 ? 'BTC: bc1q...6g' : 'BTC'}
              <CopiedTooltip $visible={copiedAddress === 'BTC'}>Copied!</CopiedTooltip>
            </WalletAddress>

            <WalletAddress 
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText('8bXf8Rg3u4Prz71LgKR5mpa7aMe2F4cSKYYRctmqro6x');
                  setCopiedAddress('SOL');
                  setTimeout(() => setCopiedAddress(null), 2000);
                } catch (err) {
                  // Fallback for browsers that don't support clipboard API
                  const textArea = document.createElement('textarea');
                  textArea.value = '8bXf8Rg3u4Prz71LgKR5mpa7aMe2F4cSKYYRctmqro6x';
                  document.body.appendChild(textArea);
                  textArea.select();
                  try {
                    document.execCommand('copy');
                    setCopiedAddress('SOL');
                    setTimeout(() => setCopiedAddress(null), 2000);
                  } catch (err) {
                    console.error('Failed to copy text: ', err);
                  }
                  document.body.removeChild(textArea);
                }
              }}
            >
              {window.innerWidth > 768 ? 'SOL: 8bXf...6x' : 'SOL'}
              <CopiedTooltip $visible={copiedAddress === 'SOL'}>Copied!</CopiedTooltip>
            </WalletAddress>
          </StatusSection>
        </StatusBar>
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
