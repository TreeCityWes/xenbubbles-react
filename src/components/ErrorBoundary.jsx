import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          color: '#39FF14', 
          textAlign: 'center', 
          padding: '20px',
          background: 'rgba(0,0,0,0.8)'
        }}>
          <h2>Something went wrong.</h2>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              border: '2px solid #39FF14',
              color: '#39FF14',
              padding: '10px 20px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 