import React from 'react';
import logo from '../../assets/images/logo.png';
import { Box, Flex, IconButton, Link, useDisclosure, Text, Image } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, StarIcon, RepeatIcon, ArrowBackIcon } from '@chakra-ui/icons';

function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg="white" px={4} boxShadow="md">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Image src={logo} alt="Logo" boxSize="40px" mr={2} />
          <Text fontSize="lg" fontWeight="bold">ГРИНГРАНТ</Text>
        </Box>
        <Flex alignItems="center">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} href={'#'}>
              <StarIcon /> Избранное
            </Link>
            <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} href={'#'}>
              <RepeatIcon /> История
            </Link>
            <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} href={'#'}>
              <ArrowBackIcon /> Выйти
            </Link>
          </Flex>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} href={'#'}>
            <StarIcon /> Избранное
          </Link>
          <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} href={'#'}>
            <RepeatIcon /> История
          </Link>
          <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} href={'#'}>
            <ArrowBackIcon /> Выйти
          </Link>
        </Box>
      ) : null}
    </Box>
  );
}

export default Header;
