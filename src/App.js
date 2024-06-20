import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import GrantForm from './components/GrantForm/GrantForm';
import History from './components/History/History';
import Favorites from './components/Favorites/Favorites';
import EditGrantForm from './components/EditGrantForm/EditGrantForm';
import CookieBanner from './components/CookieBanner/CookieBanner';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [currentGrant, setCurrentGrant] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedPage = localStorage.getItem('currentPage') || 'grantForm';

    if (token) {
      setIsAuthenticated(true);
      setCurrentPage(savedPage);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setCurrentPage('grantForm');
    localStorage.setItem('currentPage', 'grantForm');
  };

  const handleRegister = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setCurrentPage('grantForm');
    localStorage.setItem('currentPage', 'grantForm');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('currentPage');
      setIsAuthenticated(false);
      setCurrentPage('login');
    }
  };

  const handleEditGrant = (grant) => {
    setCurrentGrant(grant);
    setCurrentPage('editGrantForm');
    localStorage.setItem('currentPage', 'editGrantForm');
  };

  const handleViewGrant = (grant) => {
    // Implement view grant functionality
  };

  const handleRemoveFavorite = async (grantId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/grants/favorites/${grantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }
      // Refresh the favorites list
      setFavorites(favorites.filter(favorite => favorite.id !== grantId));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
  };

  return (
    <ChakraProvider>
      <Flex direction="column" minHeight="100vh">
        {isAuthenticated && currentPage !== 'login' && <Header setCurrentPage={handlePageChange} handleLogout={handleLogout} />}
        <Box flex="1">
          {isAuthenticated ? (
            currentPage === 'grantForm' ? (
              <GrantForm />
            ) : currentPage === 'history' ? (
              <History handleEditGrant={handleEditGrant} handleViewGrant={handleViewGrant} />
            ) : currentPage === 'favorites' ? (
              <Favorites handleEditGrant={handleEditGrant} handleRemoveFavorite={handleRemoveFavorite} />
            ) : (
              <EditGrantForm grant={currentGrant} />
            )
          ) : isRegistering ? (
            <Register onRegister={handleRegister} setIsRegistering={setIsRegistering} />
          ) : (
            <Login onLogin={handleLogin} setIsRegistering={setIsRegistering} />
          )}
        </Box>
        <Footer />
      </Flex>
      <CookieBanner />
    </ChakraProvider>
  );
}

export default App;
