import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Select, Textarea, VStack, useDisclosure, Heading, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody } from '@chakra-ui/react';

function GrantForm() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [grantData, setGrantData] = useState({
    title: '',
    destination_id: '',
    description: '',
    goals: '',
    social_meaning: '',
    target_audience: '',
    tasks: ''
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGrantData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/grants/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(grantData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to evaluate grant: ${JSON.stringify(errorData.detail)}`);
      }

      const result = await response.json();
      console.log('Evaluation Result:', result);
      onOpen();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="white" p={4}>
      <Box w="full" maxW="2xl" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" textAlign="center">
        <Heading as="h2" size="lg" mb={4}>
          Расскажите нам о проекте, чтобы оценить Ваши шансы
        </Heading>
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl id="title">
            <FormLabel>Введите название проекта</FormLabel>
            <Input type="text" name="title" placeholder="Введите название проекта" value={grantData.title} onChange={handleChange} />
          </FormControl>
          <FormControl id="destination_id">
            <FormLabel>Выберите направление</FormLabel>
            <Select name="destination_id" placeholder="Выберите направление" value={grantData.destination_id} onChange={handleChange}>
              {categories.map((category, index) => (
                <option key={index} value={index + 1}>
                  {category}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl id="description">
            <FormLabel>Введите краткое описание проекта</FormLabel>
            <Textarea name="description" placeholder="Введите краткое описание проекта" value={grantData.description} onChange={handleChange} />
          </FormControl>
          <FormControl id="goals">
            <FormLabel>Укажите цели проекта</FormLabel>
            <Textarea name="goals" placeholder="Укажите цели проекта" value={grantData.goals} onChange={handleChange} />
          </FormControl>
          <FormControl id="social_meaning">
            <FormLabel>Опишите социальную значимость проекта</FormLabel>
            <Textarea name="social_meaning" placeholder="Опишите социальную значимость проекта" value={grantData.social_meaning} onChange={handleChange} />
          </FormControl>
          <FormControl id="target_audience">
            <FormLabel>Опишите целевые группы проекта</FormLabel>
            <Textarea name="target_audience" placeholder="Опишите целевые группы проекта" value={grantData.target_audience} onChange={handleChange} />
          </FormControl>
          <FormControl id="tasks">
            <FormLabel>Опишите задачи проекта</FormLabel>
            <Textarea name="tasks" placeholder="Опишите задачи проекта" value={grantData.tasks} onChange={handleChange} />
          </FormControl>
          <Button colorScheme="teal" size="lg" w="full" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : 'Оценить'}
          </Button>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Заявка успешно отправлена</ModalHeader>
          <ModalBody>
            Ваша заявка была успешно отправлена и будет рассмотрена в ближайшее время.
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={onClose}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default GrantForm;
