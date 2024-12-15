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
    padding: 4px;
    background: transparent;
    z-index: 999;
    justify-content: center;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 4px;
    width: 100%;
    display: flex;
    justify-content: center;
    grid-gap: 4px;
    max-width: 280px;
    margin: 0 auto;
  }
`;

const ListButton = styled.button`
  background: ${props => props.$active ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.05)'};
  color: #39FF14;
  border: 1px solid #39FF14;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 60px;
  text-align: center;

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 11px;
    min-width: unset;
    width: auto;
    flex: 1;
    max-width: 65px;
  }
`;

const BubbleListSelector = ({ onListChange, setLoading, timeFrame }) => {
  const [activeList, setActiveList] = useState('Xen');
  const [isLoading, setIsLoading] = useState(false);
  const initialLoadRef = useRef(false);
  const selectorRef = useRef(null);

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
                sourceList: selectedList.id,
                uniqueKey: `${token.chain.toLowerCase()}-${token.contract.toLowerCase()}`
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

  const handleListChange = useCallback(async (newListId) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setLoading(true);
    setActiveList(newListId);

    try {
      let tokensToProcess = [];
      
      if (newListId === 'ALL') {
        const allLists = await Promise.all(
          lists
            .filter(list => list.url)
            .map(list => loadSingleList(list.id))
        );
        tokensToProcess = allLists.flat();
      } else {
        const loadedTokens = await loadSingleList(newListId);
        if (Array.isArray(loadedTokens)) {
          tokensToProcess = loadedTokens;
        }
      }

      if (!Array.isArray(tokensToProcess)) {
        tokensToProcess = [];
      }

      const uniqueTokens = Array.from(
        new Map(
          tokensToProcess.map(token => 
            [`${token.chain}-${token.contract}`, token]
          )
        ).values()
      );

      const processedTokens = await Promise.all(
        uniqueTokens
          .filter(token => token && token.chain && token.contract)
          .map(async (token) => {
            try {
              const marketData = await fetchTokenData(
                token.chain,
                token.contract,
                timeFrame
              );

              return {
                ...token,
                ...marketData,
                chain: token.chain,
                contract: token.contract,
                sourceList: token.sourceList,
                uniqueId: `${token.sourceList}-${token.chain.toLowerCase()}-${token.contract.toLowerCase()}-${Math.random()}`
              };
            } catch (error) {
              console.error(`Error processing token ${token.chain}-${token.contract}:`, error);
              return null;
            }
          })
      );

      const filteredTokens = processedTokens
        .filter(token => token !== null)
        .sort((a, b) => {
          const listOrder = { 'Xen-Alts': 1, 'DBXen': 2, 'Xen': 3 };
          const listCompare = (listOrder[a.sourceList] || 0) - (listOrder[b.sourceList] || 0);
          if (listCompare !== 0) return listCompare;
          
          return a.chain.localeCompare(b.chain);
        });

      console.log('Processed tokens:', filteredTokens);
      
      onListChange(filteredTokens, newListId);
    } catch (error) {
      console.error('Error loading list data:', error);
      onListChange([], newListId);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [isLoading, loadSingleList, onListChange, setLoading, lists, timeFrame]);

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      handleListChange('Xen');
    }
  }, [handleListChange]);

  useEffect(() => {
    const handleLoadList = async (event) => {
      const { listId } = event.detail;
      await handleListChange(listId);
    };

    const selector = selectorRef.current;
    if (selector) {
      selector.addEventListener('loadList', handleLoadList);
    }

    return () => {
      if (selector) {
        selector.removeEventListener('loadList', handleLoadList);
      }
    };
  }, [handleListChange]);

  return (
    <ListSelector ref={selectorRef} data-list-selector>
      <ButtonGroup>
        <ListButton 
          onClick={() => handleListChange('ALL')}
          $active={activeList === 'ALL'}
        >
          ALL
        </ListButton>
        <ListButton 
          onClick={() => handleListChange('Xen')}
          $active={activeList === 'Xen'}
        >
          Xen
        </ListButton>
        <ListButton 
          onClick={() => handleListChange('Xen-Alts')}
          $active={activeList === 'Xen-Alts'}
        >
          Alts
        </ListButton>
        <ListButton 
          onClick={() => handleListChange('DBXen')}
          $active={activeList === 'DBXen'}
        >
          DBXen
        </ListButton>
      </ButtonGroup>
    </ListSelector>
  );
};

export default BubbleListSelector; 