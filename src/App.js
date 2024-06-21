import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
  const [currentGrant, setCurrentGrant] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleRegister = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
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
      setIsAuthenticated(false);
    }
  };

  const handleEditGrant = (grant) => {
    setCurrentGrant(grant);
  };

  return (
    <ChakraProvider>
      <Flex direction="column" minHeight="100vh">
        {isAuthenticated && <Header handleLogout={handleLogout} />}
        <Box flex="1">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/grant-form" /> : <Navigate to="/login" />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/grant-form" /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/grant-form" /> : <Register onRegister={handleRegister} />} />
            <Route path="/grant-form" element={isAuthenticated ? <GrantForm /> : <Navigate to="/login" />} />
            <Route path="/history" element={isAuthenticated ? <History handleEditGrant={handleEditGrant} /> : <Navigate to="/login" />} />
            <Route path="/favorites" element={isAuthenticated ? <Favorites handleEditGrant={handleEditGrant} /> : <Navigate to="/login" />} />
            <Route path="/edit-grant" element={isAuthenticated ? <EditGrantForm grant={currentGrant} /> : <Navigate to="/login" />} />
          </Routes>
        </Box>
        <Footer />
      </Flex>
      <CookieBanner />
    </ChakraProvider>
  );
}

export default App;
