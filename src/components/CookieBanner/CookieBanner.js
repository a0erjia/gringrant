import React from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

function CookieBanner() {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleAccept = () => {
    setIsVisible(false);
  };

  return (
    isVisible && (
      <Box bg="gray.700" color="white" p={4} position="fixed" bottom="0" width="100%" textAlign="center">
        <Text mb={2}>This site uses cookies to improve your experience. By clicking "Accept", you agree to our use of cookies.</Text>
        <Button colorScheme="teal" onClick={handleAccept}>Accept</Button>
      </Box>
    )
  );
}

export default CookieBanner;
