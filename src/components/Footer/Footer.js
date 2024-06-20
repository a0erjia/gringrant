import React from 'react';
import { Box, Text } from '@chakra-ui/react';

function Footer() {
  return (
    <Box as="footer" py={4} bg="gray.100" textAlign="center">
      <Text>&copy; 2024 GrinGrant. All rights reserved.</Text>
    </Box>
  );
}

export default Footer;
