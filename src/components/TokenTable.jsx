import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import LoadingScreen from './LoadingScreen';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: rgba(0, 0, 0, 0.95);

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const TableWrapper = styled.div`
  overflow: auto;
  
  /* Cyberpunk scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(57, 255, 20, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #39FF14;
    border-radius: 4px;
    border: 2px solid rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #fff;
  min-width: 800px;
  
  @media (max-width: 768px) {
    th, td {
      padding: 8px 4px;
    }
  }
`;

const Thead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.9);
`;

const Th = styled.th`
  background: ${props => props.$isSelected ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)'};
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #39FF14;
  cursor: pointer;
  user-select: none;
  color: #39FF14;
  font-weight: bold;
  white-space: nowrap;
  transition: background-color 0.3s ease;

  &:hover {
    background: rgba(57, 255, 20, 0.3);
  }

  &::after {
    content: '${props => props.$sorted === 'asc' ? ' ↑' : props.$sorted === 'desc' ? ' ↓' : ''}';
    opacity: ${props => props.$sorted ? '1' : '0.3'};
  }
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid rgba(57, 255, 20, 0.2);
  background: ${props => props.$isSelected ? 'rgba(57, 255, 20, 0.05)' : 'transparent'};
`;

const Tr = styled.tr`
  &:hover {
    background: rgba(57, 255, 20, 0.05);
  }
`;

const ZeroCount = styled.sub`
  font-size: 0.6em;
  vertical-align: sub;
  color: inherit;
  opacity: 0.9;
`;

const formatNumber = (num) => {
  if (!num) return '-';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${parseFloat(num).toFixed(2)}`;
};

const formatPrice = (num) => {
  if (!num) return '$0.00';
  
  const str = num.toString();
  
  // For scientific notation (very small numbers)
  if (str.includes('e-')) {
    const [n, exp] = str.split('e-');
    const zeroCount = parseInt(exp) - 1;
    // Convert scientific notation to full decimal string
    const fullDecimal = parseFloat(n).toFixed(10); // Use more precision
    const significantDigits = fullDecimal.replace('.', '').slice(0, 5);
    return (
      <>
        $0.0<ZeroCount>{zeroCount}</ZeroCount>{significantDigits}
      </>
    );
  }
  
  // For regular decimal numbers
  if (num < 1) {
    const parts = str.split('.');
    if (parts[1]) {
      const zeros = parts[1].match(/^0+/)?.[0]?.length || 0;
      if (zeros > 0) {
        const allDigits = parts[1].slice(zeros);
        const significantDigits = allDigits.slice(0, 6);
        return (
          <>
            $0.0<ZeroCount>{zeros}</ZeroCount>{significantDigits}
          </>
        );
      }
    }
    return `$${parseFloat(num).toFixed(6)}`;
  }
  
  // For regular numbers
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${parseFloat(num).toFixed(4)}`;
};

const MobileTableContainer = styled(TableContainer)`
  @media (max-width: 768px) {
    position: relative;
    height: calc(100vh - 180px);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const MobileTableWrapper = styled(TableWrapper)`
  @media (max-width: 768px) {
    overflow: visible;
    
    table {
      min-width: auto;
      width: 100%;
    }

    th, td {
      padding: 8px 4px;
      font-size: 13px;
      white-space: nowrap;
    }
  }
`;

const AccessibleTh = styled(Th)`
  &:focus {
    outline: 2px solid #39FF14;
    outline-offset: -2px;
  }
  
  @media (max-width: 768px) {
    padding: 8px 4px;
    font-size: 12px;
    
    &::after {
      font-size: 10px;
      margin-left: 2px;
    }
  }
`;

const AccessibleTr = styled(Tr)`
  &:focus-within {
    outline: 1px solid #39FF14;
  }
  
  @media (max-width: 768px) {
    &:active {
      background: rgba(57, 255, 20, 0.1);
    }
  }
`;

const TokenTable = ({ tokens, onTokenClick, timeFrame, fetchTokenData }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'marketCap',
    direction: 'desc'
  });
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Update data when timeFrame or tokens change
  useEffect(() => {
    const updateTableData = async () => {
      setIsLoading(true);
      try {
        // First, deduplicate tokens based on chain and contract
        const uniqueTokens = tokens.reduce((acc, token) => {
          const key = `${token.chain}-${token.contract}`;
          if (!acc.has(key)) {
            acc.set(key, token);
          }
          return acc;
        }, new Map());

        const updatedTokens = await Promise.all(
          Array.from(uniqueTokens.values()).map(async (token) => {
            try {
              const marketData = await fetchTokenData(token.chain, token.contract, timeFrame);
              if (!marketData) return null;
              
              return {
                ...token,
                ...marketData,
                id: `${token.chain}-${token.contract}`,
                symbol: token.symbol || marketData?.symbol || 'Unknown',
                chain: token.chain || marketData?.chain || 'Unknown',
                price: marketData?.price || 0,
                priceChange24h: marketData?.priceChange24h || 0,
                marketCap: marketData?.marketCap || 0,
                volume24h: marketData?.volume24h || 0,
                liquidity: marketData?.liquidity || 0,
                sourceList: token.sourceList // Preserve the source list
              };
            } catch (error) {
              console.error(`Error updating token data: ${error}`);
              return null;
            }
          })
        );

        // Filter out null values and set table data
        const validTokens = updatedTokens.filter(token => token !== null);
        console.log('Setting table data:', validTokens.length, 'tokens');
        setTableData(validTokens);
      } catch (error) {
        console.error('Error updating table data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (tokens.length > 0) {
      updateTableData();
    } else {
      setTableData([]);
    }
  }, [timeFrame, tokens, fetchTokenData]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: 
        prevConfig.key === key && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const sortedTokens = useMemo(() => {
    let sortableTokens = [...tableData];
    if (sortConfig.key) {
      sortableTokens.sort((a, b) => {
        let aValue = a[sortConfig.key] ?? 0;
        let bValue = b[sortConfig.key] ?? 0;
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTokens;
  }, [tableData, sortConfig]);

  const getTimeFrameLabel = () => {
    switch(timeFrame) {
      case '5m': return '5M';
      case '1h': return '1H';
      case '6h': return '6H';
      default: return '24H';
    }
  };

  return (
    <MobileTableContainer role="region" aria-label="Token prices and market data">
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <MobileTableWrapper>
          <Table>
            <Thead>
              <tr>
                <AccessibleTh 
                  onClick={() => handleSort('symbol')}
                  $sorted={sortConfig.key === 'symbol' ? sortConfig.direction : null}
                  $isSelected={sortConfig.key === 'symbol'}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortConfig.key === 'symbol' 
                      ? sortConfig.direction === 'asc' 
                        ? 'ascending' 
                        : 'descending'
                      : 'none'
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('symbol');
                    }
                  }}
                >
                  Symbol
                </AccessibleTh>
                <AccessibleTh 
                  onClick={() => handleSort('chain')}
                  $sorted={sortConfig.key === 'chain' ? sortConfig.direction : null}
                  $isSelected={sortConfig.key === 'chain'}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortConfig.key === 'chain' 
                      ? sortConfig.direction === 'asc' 
                        ? 'ascending' 
                        : 'descending'
                      : 'none'
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('chain');
                    }
                  }}
                >
                  Chain
                </AccessibleTh>
                <AccessibleTh 
                  onClick={() => handleSort('price')}
                  $sorted={sortConfig.key === 'price' ? sortConfig.direction : null}
                  $isSelected={sortConfig.key === 'price'}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortConfig.key === 'price' 
                      ? sortConfig.direction === 'asc' 
                        ? 'ascending' 
                        : 'descending'
                      : 'none'
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('price');
                    }
                  }}
                >
                  Price
                </AccessibleTh>
                <AccessibleTh 
                  onClick={() => handleSort('priceChange24h')}
                  $sorted={sortConfig.key === 'priceChange24h' ? sortConfig.direction : null}
                  $isSelected={sortConfig.key === 'priceChange24h'}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortConfig.key === 'priceChange24h' 
                      ? sortConfig.direction === 'asc' 
                        ? 'ascending' 
                        : 'descending'
                      : 'none'
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('priceChange24h');
                    }
                  }}
                >
                  {getTimeFrameLabel()} Change
                </AccessibleTh>
                <AccessibleTh 
                  onClick={() => handleSort('marketCap')}
                  $sorted={sortConfig.key === 'marketCap' ? sortConfig.direction : null}
                  $isSelected={sortConfig.key === 'marketCap'}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortConfig.key === 'marketCap' 
                      ? sortConfig.direction === 'asc' 
                        ? 'ascending' 
                        : 'descending'
                      : 'none'
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('marketCap');
                    }
                  }}
                >
                  Market Cap
                </AccessibleTh>
                <AccessibleTh 
                  onClick={() => handleSort('volume24h')}
                  $sorted={sortConfig.key === 'volume24h' ? sortConfig.direction : null}
                  $isSelected={sortConfig.key === 'volume24h'}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortConfig.key === 'volume24h' 
                      ? sortConfig.direction === 'asc' 
                        ? 'ascending' 
                        : 'descending'
                      : 'none'
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('volume24h');
                    }
                  }}
                >
                  Volume 24h
                </AccessibleTh>
                <AccessibleTh 
                  onClick={() => handleSort('liquidity')}
                  $sorted={sortConfig.key === 'liquidity' ? sortConfig.direction : null}
                  $isSelected={sortConfig.key === 'liquidity'}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortConfig.key === 'liquidity' 
                      ? sortConfig.direction === 'asc' 
                        ? 'ascending' 
                        : 'descending'
                      : 'none'
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('liquidity');
                    }
                  }}
                >
                  Liquidity
                </AccessibleTh>
              </tr>
            </Thead>
            <tbody>
              {sortedTokens.map((token) => (
                <AccessibleTr 
                  key={token.id}
                  onClick={() => onTokenClick && onTokenClick(token)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onTokenClick && onTokenClick(token);
                    }
                  }}
                  tabIndex={0}
                  role="row"
                  aria-label={`${token.symbol} token data`}
                  style={{ cursor: 'pointer' }}
                >
                  <Td 
                    $isSelected={sortConfig.key === 'symbol'}
                    role="cell"
                  >
                    {token.symbol}
                  </Td>
                  <Td 
                    $isSelected={sortConfig.key === 'chain'}
                    role="cell"
                  >
                    {token.chain}
                  </Td>
                  <Td 
                    $isSelected={sortConfig.key === 'price'}
                    role="cell"
                    aria-label={`Price: ${formatPrice(token.price)}`}
                  >
                    {formatPrice(token.price)}
                  </Td>
                  <Td 
                    $isSelected={sortConfig.key === 'priceChange24h'}
                    style={{ color: token.priceChange24h >= 0 ? '#39FF14' : '#FF3939' }}
                    role="cell"
                    aria-label={`${getTimeFrameLabel()} change: ${token.priceChange24h ? `${token.priceChange24h.toFixed(2)}%` : 'no change'}`}
                  >
                    {token.priceChange24h ? `${token.priceChange24h.toFixed(2)}%` : '-'}
                  </Td>
                  <Td 
                    $isSelected={sortConfig.key === 'marketCap'}
                    role="cell"
                    aria-label={`Market cap: ${token.marketCap ? formatNumber(token.marketCap) : 'not available'}`}
                  >
                    {token.marketCap ? formatNumber(token.marketCap) : '-'}
                  </Td>
                  <Td 
                    $isSelected={sortConfig.key === 'volume24h'}
                    role="cell"
                    aria-label={`24 hour volume: ${token.volume24h ? formatNumber(token.volume24h) : 'not available'}`}
                  >
                    {token.volume24h ? formatNumber(token.volume24h) : '-'}
                  </Td>
                  <Td 
                    $isSelected={sortConfig.key === 'liquidity'}
                    role="cell"
                    aria-label={`Liquidity: ${token.liquidity ? formatNumber(token.liquidity) : 'not available'}`}
                  >
                    {token.liquidity ? formatNumber(token.liquidity) : '-'}
                  </Td>
                </AccessibleTr>
              ))}
            </tbody>
          </Table>
        </MobileTableWrapper>
      )}
    </MobileTableContainer>
  );
};

export default TokenTable; 