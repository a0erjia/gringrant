import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Link, Image, Spinner } from '@chakra-ui/react';
import logo from '../../assets/images/logo.png'; // Путь к логотипу

function Login({ onLogin, setIsRegistering }) {
  const [credentials, setCredentials] = useState({ nickname: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const result = await response.json();
      onLogin(result.token);  // Вызываем onLogin с токеном
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="white" p={4}>
      <Box w="full" maxW="md" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" textAlign="center">
        <Image src={logo} alt="Logo" boxSize="100px" mx="auto" mb={4} />
        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl id="nickname">
            <FormLabel>Введите логин</FormLabel>
            <Input type="text" name="nickname" placeholder="Введите логин" value={credentials.nickname} onChange={handleChange} />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Введите пароль</FormLabel>
            <Input type="password" name="password" placeholder="Введите пароль" value={credentials.password} onChange={handleChange} />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button colorScheme="teal" size="lg" w="full" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : 'Войти'}
          </Button>
        </VStack>
        <Text mt={4}>
          Нет аккаунта? <Link color="brown.500" onClick={() => setIsRegistering(true)}>Зарегистрироваться</Link>
        </Text>
      </Box>
    </Box>
  );
}

export default Login;
