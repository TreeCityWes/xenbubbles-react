import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  background-color: rgba(0, 0, 0, 0.9);
  padding: 0.5rem;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #39FF14;
  box-shadow: 0 0 30px rgba(57, 255, 20, 0.2);
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
`;

const Logo = styled.a`
  font-size: 2.5rem;
  font-weight: bold;
  color: #39FF14;
  text-shadow: 
    0 0 10px #39FF14,
    0 0 20px #39FF14,
    0 0 30px #39FF14;
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;

  a {
    color: #39FF14;
    text-decoration: none;
    transition: all 0.3s ease;
    font-size: 1.2rem;
    text-shadow: 0 0 5px #39FF14;

    &:hover {
      color: #fff;
      text-shadow: 
        0 0 10px #39FF14,
        0 0 20px #39FF14;
    }
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  position: relative;
  z-index: 1;
`;

const Footer = styled.footer`
  background-color: rgba(0, 0, 0, 0.9);
  padding: 0.5rem 0;
  text-align: center;
  position: relative;
  z-index: 2;
  margin-top: auto;
  border-top: 2px solid #39FF14;
  box-shadow: 0 0 30px rgba(57, 255, 20, 0.2);
  backdrop-filter: blur(10px);
`;

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 0.5rem;

  img {
    width: 30px;
    height: 30px;
    transition: all 0.3s ease;
    filter: brightness(0) saturate(100%) invert(95%) sepia(48%) 
           saturate(1640%) hue-rotate(68deg) brightness(97%) contrast(108%);

    &:hover {
      transform: scale(1.2);
      filter: brightness(0) saturate(100%) invert(95%) sepia(48%) 
             saturate(1640%) hue-rotate(68deg) brightness(120%) contrast(108%);
    }
  }
`;

const SocialIcon = styled.img`
  width: 40px;
  height: 40px;
  transition: all 0.3s ease;
  filter: brightness(0) saturate(100%) invert(95%) sepia(48%) 
         saturate(1640%) hue-rotate(68deg) brightness(97%) contrast(108%);

  &:hover {
    transform: scale(1.2);
    filter: brightness(0) saturate(100%) invert(95%) sepia(48%) 
           saturate(1640%) hue-rotate(68deg) brightness(120%) contrast(108%);
  }
`;

const FooterText = styled.p`
  color: #39FF14;
  text-shadow: 0 0 5px #39FF14;
`;

const Layout = ({ children }) => {
  return (
    <Container>
      <HeaderContainer>
        <Nav>
          <Logo href="https://hashhead.io">HashHead.io</Logo>
          <NavLinks>
            <a href="https://store.hashhead.io">Store</a>
            <a href="https://twitter.com/TreeCityWes">Twitter</a>
            <a href="https://github.com/TreeCityWes/">GitHub</a>
            <a href="/cdn-cgi/l/email-protection#3b4c5e487b4f495e5e58524f424f495a5f52555c154e48">Contact</a>
          </NavLinks>
        </Nav>
      </HeaderContainer>
      <Main>{children}</Main>
      <Footer>
        <div>
          <SocialIcons>
            <a href="https://youtube.com/treecitywes">
              <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" />
            </a>
            <a href="https://twitter.com/treecitywes">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" />
            </a>
            <a href="https://t.me/treecitytrading">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="Telegram" />
            </a>
            <a href="https://github.com/treecitywes">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="GitHub" />
            </a>
          </SocialIcons>
          <p>© 2024 HashHead.io. All rights reserved.</p>
        </div>
      </Footer>
    </Container>
  );
};

export default Layout; 