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
    padding: 8px;
    background: rgba(0, 0, 0, 0.95);
    z-index: 999;
    justify-content: center;
    gap: 4px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const ListButton = styled.button`
  background: ${props => props.$active ? `rgba(50, 205, 50, 0.2)` : 'rgba(50, 205, 50, 0.05)'};
  color: #39FF14;
  border: 1px solid #39FF14;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 12px;
  }

  &:hover {
    background: rgba(50, 205, 50, 0.2);
  }
`;

const BubbleListSelector = ({ onListChange, setLoading, timeFrame }) => {
  const [activeList, setActiveList] = useState('Xen');
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
      handleListChange('Xen'); // Always load Xen by default
    }
  }, [handleListChange]);

  return (
    <ListSelector>
      <ButtonGroup>
        <ListButton 
          onClick={() => handleListChange('ALL')}
          $active={(activeList === 'ALL').toString()}
        >
          ALL
        </ListButton>
        <ListButton 
          onClick={() => handleListChange('Xen')}
          $active={(activeList === 'Xen').toString()}
        >
          Xen
        </ListButton>
        <ListButton 
          onClick={() => handleListChange('Xen-Alts')}
          $active={(activeList === 'Xen-Alts').toString()}
        >
          Alts
        </ListButton>
        <ListButton 
          onClick={() => handleListChange('DBXen')}
          $active={(activeList === 'DBXen').toString()}
        >
          DBXen
        </ListButton>
      </ButtonGroup>
    </ListSelector>
  );
};

export default BubbleListSelector; 