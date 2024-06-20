import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Select, Textarea, VStack, useDisclosure, Heading } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';

function EditGrantForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { grant } = state;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [grantData, setGrantData] = useState({
    title: grant?.title || '',
    destination_id: grant?.destination_id || '',
    description: grant?.description || '',
    goals: grant?.goals || '',
    social_meaning: grant?.social_meaning || '',
    target_audience: grant?.target_audience || '',
    tasks: grant?.tasks || ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/categories')
      .then(response => response.json())
      .then(data => {
        setCategories(data.categories);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading categories:', error);
        setError(error);
        setLoading(false);
      });
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
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/grants/${grant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(grantData),
      });

      if (!response.ok) {
        throw new Error('Failed to update grant');
      }

      const result = await response.json();
      console.log('Update Result:', result);

      // Повторная оценка заявки нейросетью
      await fetch('http://localhost:8000/grants/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(grantData)
      });

      onOpen();
    } catch (error) {
      console.error(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading categories: {error.message}</div>;
  }

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
        maxW="2xl"
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        textAlign="center"
      >
        <Heading as="h2" size="lg" mb={4}>
          Редактировать проект
        </Heading>
        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl id="title">
            <FormLabel>Введите название проекта</FormLabel>
            <Input
              type="text"
              name="title"
              placeholder="Введите название проекта"
              value={grantData.title}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="destination_id">
            <FormLabel>Выберите направление</FormLabel>
            <Select
              name="destination_id"
              placeholder="Выберите направление"
              value={grantData.destination_id}
              onChange={handleChange}
            >
              {categories.map((category, index) => (
                <option key={index} value={index + 1}>
                  {category}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl id="description">
            <FormLabel>Введите краткое описание проекта</FormLabel>
            <Textarea
              name="description"
              placeholder="Введите краткое описание проекта"
              value={grantData.description}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="goals">
            <FormLabel>Укажите цели проекта</FormLabel>
            <Textarea
              name="goals"
              placeholder="Укажите цели проекта"
              value={grantData.goals}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="social_meaning">
            <FormLabel>Опишите социальную значимость проекта</FormLabel>
            <Textarea
              name="social_meaning"
              placeholder="Опишите социальную значимость проекта"
              value={grantData.social_meaning}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="target_audience">
            <FormLabel>Опишите целевые группы проекта</FormLabel>
            <Textarea
              name="target_audience"
              placeholder="Опишите целевые группы проекта"
              value={grantData.target_audience}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="tasks">
            <FormLabel>Опишите задачи проекта</FormLabel>
            <Textarea
              name="tasks"
              placeholder="Опишите задачи проекта"
              value={grantData.tasks}
              onChange={handleChange}
            />
          </FormControl>
          <Button colorScheme="teal" size="lg" w="full" type="submit">
            Обновить
          </Button>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Заявка успешно обновлена</ModalHeader>
          <ModalBody>
            Ваша заявка была успешно обновлена и повторно оценена.
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={() => navigate('/history')}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default EditGrantForm;
