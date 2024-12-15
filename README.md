<div align="center">
  <img src="public/logo512.png" alt="XenBubbles Logo" width="200"/>
  <h1>XenBubbles</h1>
  <p>A dynamic bubble map for exploring the Xen Crypto ecosystem</p>
</div>

---

## Overview

**XenBubbles**, crafted by [TreeCityWes](https://github.com/TreeCityWes), is a real-time visualization tool for tracking tokens within the Xen Crypto ecosystem. This interactive bubble map helps the Xen community monitor price changes, market activity, and various Xen-related projects in an engaging and intuitive interface.

## Features

- 🚀 **Interactive Bubbles**: Drag and explore bubbles representing different tokens.
- 🔄 **Real-time Data**: Live price and market cap data via the **DexScreener API**.
- 📊 **Multiple Views**: Switch between a bubble map and table view for data insights.
- 🔍 **Filtering Options**: Focus on specific categories like **XEN**, **DBXen**, and **Xen-Alts**.
- ⏳ **Time Frame Selection**: View price changes across different time periods.
- 📱 **Responsive Design**: Seamlessly works on desktop and mobile devices.

## Token Categories

- **XEN**: Original XEN tokens across various blockchains.
- **DBXen**: Tokens associated with the DBXen protocol.
- **Xen-Alts**: Alternative tokens within the Xen ecosystem.

## Getting Started

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/TreeCityWes/xenbubbles-react.git
    ```

2. **Install Dependencies:**
    ```bash
    cd xenbubbles-react
    npm install
    ```

3. **Run the Development Server:**
    ```bash
    npm run dev
    ```

4. **Build for Production:**
    ```bash
    npm run build
    ```

## Development Scripts

```bash
npm run dev      # Start development server
npm start        # Alias for dev server
npm run build    # Build for production
npm run test     # Run tests
```

## Project Structure

```
xenbubbles-react/
├── public/
│   ├── lists/           # CSV files for token lists
│   ├── favicon.png      # Site favicon
│   ├── logo192.png      # Small logo
│   └── logo512.png      # Large logo
├── src/
│   ├── components/      # React components
│   ├── services/        # API services
│   ├── styles/          # CSS and styled-components
│   └── App.jsx          # Main application
```

## Technology Stack

- **Frontend**: React.js with Styled Components
- **Data Visualization**: D3.js for bubble animations
- **API**: DexScreener for real-time market data
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel Platform

## Environment Variables

Set up the required environment variable in your `.env` file:

```bash
REACT_APP_VERCEL_ANALYTICS_ID=your_analytics_id
```

## Live Demo

Check out **XenBubbles** in action:

🌐 [https://bubbles.hashhead.io](https://bubbles.hashhead.io)

## Support & Social

- 🌐 **Website**: [HashHead.io](https://hashhead.io)  
- 🛍️ **Store**: [store.hashhead.io](https://store.hashhead.io)  
- 🐦 **Twitter**: [@TreeCityWes](https://twitter.com/TreeCityWes)  
- 💻 **GitHub**: [TreeCityWes](https://github.com/TreeCityWes/)  
- 📧 **Contact**: [Email Us](mailto:your@email.com)  

## Donations

Support the development of **XenBubbles**:

- **ETH**: `0xe4bB184781bBC9C7004e8DafD4A9B49d203BC9bC`  
- **BTC**: `bc1qrglll5kcgjk7lrwll4mzfcw0yxm0zh9anq7x6g`  
- **SOL**: `8bXf8Rg3u4Prz71LgKR5mpa7aMe2F4cSKYYRctmqro6x`  

## Contributing

We welcome contributions to **XenBubbles**!

1. **Fork the repository**  
2. **Create your feature branch**: `git checkout -b feature/AmazingFeature`  
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`  
4. **Push to the branch**: `git push origin feature/AmazingFeature`  
5. **Open a Pull Request**  

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

- Special thanks to the **Xen Crypto community**.  
- Built with ❤️ by [HashHead.io](https://hashhead.io).
