import React from 'react';
import { Box, Flex, IconButton, Link, useDisclosure, Text, Image } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, StarIcon, RepeatIcon, ArrowBackIcon, EditIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

function Header({ handleLogout }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

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
            <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} onClick={() => navigate('/favorites')}>
              <StarIcon /> Избранное
            </Link>
            <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} onClick={() => navigate('/history')}>
              <RepeatIcon /> История
            </Link>
            <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} onClick={() => navigate('/grant-form')}>
              <EditIcon /> Оценить
            </Link>
            <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} onClick={handleLogout}>
              <ArrowBackIcon /> Выйти
            </Link>
          </Flex>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} onClick={() => navigate('/favorites')}>
            <StarIcon /> Избранное
          </Link>
          <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} onClick={() => navigate('/history')}>
            <RepeatIcon /> История
          </Link>
          <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} onClick={() => navigate('/grant-form')}>
            <EditIcon /> Оценить
          </Link>
          <Link px={2} py={1} rounded={'md'} _hover={{ textDecoration: 'none', bg: 'gray.200' }} onClick={handleLogout}>
            <ArrowBackIcon /> Выйти
          </Link>
        </Box>
      ) : null}
    </Box>
  );
}

export default Header;
