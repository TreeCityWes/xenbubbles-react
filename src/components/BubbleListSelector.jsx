import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Papa from 'papaparse';
import { fetchTokenData } from '../services/dexscreener';

const ListSelector = styled.div`
  margin-bottom: 10px;
`;

const Button = styled.button`
  background: rgba(57, 255, 20, 0.1);
  color: #39FF14;
  border: 2px solid #39FF14;
  padding: 8px 20px;
  margin: 0 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1em;
  text-shadow: 0 0 5px #39FF14;
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.2);

  &:hover {
    background: rgba(57, 255, 20, 0.2);
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
  }

  &:active {
    background: rgba(57, 255, 20, 0.3);
    box-shadow: 0 0 25px rgba(57, 255, 20, 0.5);
  }

  ${props => props.active && `
    background: rgba(57, 255, 20, 0.2);
    box-shadow: 
      0 0 20px rgba(57, 255, 20, 0.4),
      inset 0 0 10px rgba(57, 255, 20, 0.2);
  `}
`;

const lists = [
  { id: 'ALL', file: null },
  { id: 'Xen', file: 'Xen.csv' },
  { id: 'Xen-Alts', file: 'Xen-Alts.csv' },
  { id: 'DBXen', file: 'DBXen.csv' }
];

const BubbleListSelector = ({ onListChange }) => {
  const [activeList, setActiveList] = useState('Xen');
  const [listData, setListData] = useState([]);

  useEffect(() => {
    loadListData(activeList);
  }, [activeList]);

  const loadListData = async (listId) => {
    try {
      if (listId === 'ALL') {
        // Load and combine all lists
        const allData = await Promise.all(
          lists
            .filter(list => list.file) // Skip the ALL entry
            .map(async list => {
              const response = await fetch(`/lists/${list.file}`);
              const text = await response.text();
              return new Promise(resolve => {
                Papa.parse(text, {
                  header: true,
                  complete: (results) => resolve(results.data)
                });
              });
            })
        );

        // Combine and process all data
        const combinedTokens = allData.flat().filter(row => row.contract && row.chain);
        processTokens(combinedTokens);
        return;
      }

      // Load single list
      const selectedList = lists.find(list => list.id === listId);
      if (!selectedList) return;

      const response = await fetch(`/lists/${selectedList.file}`);
      const text = await response.text();
      
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          const validTokens = results.data.filter(row => row.contract && row.chain);
          processTokens(validTokens);
        }
      });
    } catch (error) {
      console.error('Error loading CSV:', error);
    }
  };

  const processTokens = async (validTokens) => {
    const tokensWithData = await Promise.all(
      validTokens.map(async (token) => {
        try {
          const marketData = await fetchTokenData(token.chain, token.contract);
          return {
            contract: token.contract,
            chain: token.chain,
            ...marketData,
            color: marketData?.color || '#3498db'
          };
        } catch (error) {
          console.error(`Error fetching data for ${token.contract}:`, error);
          return null;
        }
      })
    );

    const filteredTokens = tokensWithData.filter(token => token !== null);
    setListData(filteredTokens);
    onListChange(filteredTokens);
  };

  return (
    <ListSelector>
      {lists.map(list => (
        <Button
          key={list.id}
          active={activeList === list.id}
          onClick={() => setActiveList(list.id)}
        >
          {list.id}
        </Button>
      ))}
    </ListSelector>
  );
};

export default BubbleListSelector; 