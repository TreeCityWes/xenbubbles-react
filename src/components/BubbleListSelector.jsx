import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import Papa from 'papaparse';
import { fetchTokenData } from '../services/dexscreener';

const ListSelector = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    padding: 8px;
    background: rgba(0, 0, 0, 0.95);
    border-bottom: 1px solid #39FF14;
    z-index: 999;
    justify-content: center;
    gap: 4px;
  }
`;

const Button = styled.button`
  background: rgba(57, 255, 20, 0.1);
  color: #39FF14;
  border: 1px solid #39FF14;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  text-shadow: 0 0 5px #39FF14;
  height: 36px;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px 8px;
    height: 32px;
    flex: 1;
    max-width: 70px;
    background: rgba(0, 0, 0, 0.8);
  }

  ${props => props.active === 'true' && `
    background: rgba(57, 255, 20, 0.2);
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.4);
    
    @media (max-width: 768px) {
      background: rgba(57, 255, 20, 0.3);
    }
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    margin-top: 70px; // Add space for the fixed header
  }
`;

const ButtonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: 200px;
    margin: 0 auto;
  }
`;

const DisclaimerText = styled.div`
  color: rgba(57, 255, 20, 0.7);
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
  font-style: italic;
  
  @media (min-width: 769px) {
    display: none; // Only show on mobile
  }
`;

const BubbleListSelector = ({ onListChange, setLoading, timeFrame }) => {
  const [activeList, setActiveList] = useState(() => {
    // Default to 'ALL' on mobile, 'Xen' on desktop
    return window.innerWidth <= 768 ? 'ALL' : 'Xen';
  });
  const [isLoading, setIsLoading] = useState(false);
  const initialLoadRef = useRef(false);

  const lists = useMemo(() => [
    { id: 'ALL' },
    { id: 'Xen', url: 'Xen.csv' },
    { id: 'Xen-Alts', url: 'Xen-Alts.csv' },
    { id: 'DBXen', url: 'DBXen.csv' }
  ], []);

  const loadSingleList = useCallback(async (listId) => {
    const selectedList = lists.find(list => list.id === listId);
    if (!selectedList || !selectedList.url) return [];

    try {
      const response = await fetch(`/lists/${selectedList.url}`);
      if (!response.ok) {
        console.error(`Failed to load ${selectedList.url}`);
        return [];
      }
      const text = await response.text();
      
      return new Promise((resolve) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const validTokens = results.data
              .filter(token => token.chain && token.contract && token.chain !== '' && token.contract !== '')
              .map(token => ({
                ...token,
                sourceList: selectedList.id  // Use sourceList instead of listId
              }));
            resolve(validTokens);
          }
        });
      });
    } catch (error) {
      console.error(`Error loading ${listId}:`, error);
      return [];
    }
  }, [lists]);

  const processTokens = useCallback(async (tokens, listId) => {
    try {
      const processedTokens = await Promise.all(
        tokens.map(async (token) => {
          try {
            const marketData = await fetchTokenData(token.chain, token.contract, timeFrame);
            return {
              ...token,
              ...marketData,
              sourceList: token.sourceList || listId,
              listId: token.sourceList || listId
            };
          } catch (error) {
            console.error(`Error processing token ${token.contract}:`, error);
            return null;
          }
        })
      );

      const filteredTokens = processedTokens.filter(token => token !== null);
      setActiveList(listId);
      onListChange(filteredTokens, listId);
    } catch (error) {
      console.error('Error processing tokens:', error);
    }
  }, [onListChange, timeFrame]);

  const handleListChange = useCallback(async (newList) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setLoading(true);
    onListChange([], newList); // Clear current list immediately

    try {
      let tokens = [];
      
      if (newList === 'ALL') {
        // Create a Map to track unique tokens by chain-contract combination
        const uniqueTokens = new Map();
        
        // Load all lists in parallel
        const listPromises = lists
          .filter(list => list.id !== 'ALL' && list.url)
          .map(async (list) => {
            const listTokens = await loadSingleList(list.id);
            // For each token in the list
            listTokens.forEach(token => {
              const key = `${token.chain}-${token.contract}`;
              // Only add if we haven't seen this token before
              if (!uniqueTokens.has(key)) {
                uniqueTokens.set(key, {
                  ...token,
                  sourceList: list.id  // Preserve the source list
                });
              }
            });
          });
        
        await Promise.all(listPromises);
        tokens = Array.from(uniqueTokens.values());
      } else {
        tokens = await loadSingleList(newList);
      }

      const validTokens = tokens.filter(token => token.chain && token.contract);
      await processTokens(validTokens, newList);
    } catch (error) {
      console.error('Error loading list data:', error);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [isLoading, loadSingleList, processTokens, onListChange, setLoading, lists]);

  // Initial load - use useRef to ensure it only runs once
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      // Load ALL by default on mobile, Xen on desktop
      handleListChange(window.innerWidth <= 768 ? 'ALL' : 'Xen');
    }
  }, [handleListChange]);

  return (
    <ListSelector>
      <Button 
        onClick={() => handleListChange('ALL')}
        active={(activeList === 'ALL').toString()}
      >
        ALL
      </Button>
      <Button 
        onClick={() => handleListChange('Xen')}
        active={(activeList === 'Xen').toString()}
      >
        Xen
      </Button>
      <Button 
        onClick={() => handleListChange('Xen-Alts')}
        active={(activeList === 'Xen-Alts').toString()}
      >
        Alts
      </Button>
      <Button 
        onClick={() => handleListChange('DBXen')}
        active={(activeList === 'DBXen').toString()}
      >
        DBXen
      </Button>
    </ListSelector>
  );
};

export default BubbleListSelector; 