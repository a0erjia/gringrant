import React, { useState, useEffect } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isCookieConsentGiven = localStorage.getItem('cookieConsent');
    if (!isCookieConsentGiven) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      position="fixed"
      bottom="0"
      width="100%"
      bg="gray.700"
      color="white"
      p={4}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      zIndex="1000"
    >
      <Text>
        Мы используем файлы cookie для улучшения работы нашего сайта. Продолжая использовать сайт, вы соглашаетесь на использование cookie.
      </Text>
      <Button colorScheme="teal" onClick={handleConsent}>
        Согласен
      </Button>
    </Box>
  );
}

export default CookieBanner;
