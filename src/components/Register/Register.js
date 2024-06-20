import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Link, Image } from '@chakra-ui/react';
import logo from '../../assets/images/logo.png'; // Путь к логотипу

function Register({ onRegister, setIsRegistering }) {
  const [credentials, setCredentials] = useState({
    nickname: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();
      onRegister(result.token);  // Вызываем onRegister с токеном
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="white"
      p={4}
    >
      <Box
        w="full"
        maxW="md"
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        textAlign="center"
      >
        <Image src={logo} alt="Logo" boxSize="100px" mx="auto" mb={4} />
        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl id="nickname">
            <FormLabel>Придумайте логин</FormLabel>
            <Input
              type="text"
              name="nickname"
              placeholder="Введите логин"
              value={credentials.nickname}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Придумайте пароль</FormLabel>
            <Input
              type="password"
              name="password"
              placeholder="Введите пароль"
              value={credentials.password}
              onChange={handleChange}
            />
          </FormControl>
          <Button colorScheme="teal" size="lg" w="full" type="submit">
            Зарегистрироваться
          </Button>
        </VStack>
        <Text mt={4}>
          Уже есть аккаунт? <Link color="brown.500" onClick={() => setIsRegistering(false)}>Войти</Link>
        </Text>
      </Box>
    </Box>
  );
}

export default Register;
