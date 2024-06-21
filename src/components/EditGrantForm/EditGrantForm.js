import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Select, Textarea, VStack, Heading, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';

function EditGrantForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  const grant = location.state ? location.state.grant : null;
  
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
  const [validationError, setValidationError] = useState(null);

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

  const validateForm = () => {
    if (!grantData.title || !grantData.destination_id || !grantData.description || !grantData.goals || !grantData.social_meaning || !grantData.target_audience || !grantData.tasks) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setValidationError('Все поля должны быть заполнены.');
      return;
    }
    const token = localStorage.getItem('token');
    console.log('Grant ID:', grant.id); // Логирование ID заявки
    console.log('Grant Data:', grantData); // Логирование данных заявки
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

      // Повторная оценка обновленной заявки без создания новой записи
      await fetch(`http://localhost:8000/grants/evaluate/${grant.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(grantData)
      });

      setIsOpen(true);
    } catch (error) {
      console.error(error.message);
      setError('Не удалось обновить заявку. Пожалуйста, попробуйте снова.');
    }
  };

  if (loading) {
    return <div>Загрузка. Пожалуйста, подождите...</div>;
  }

  if (error) {
    return <div>Не удалось загрузить список категорий. Свяжитесь с системным администратором и назовите ему эту ошибку: {error}</div>;
  }

  if (!grant) {
    return <div>Данные о грантах в настоящее время недоступны</div>;
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
        {validationError && <Box color="red.500" mb={4}>{validationError}</Box>}
        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl id="title" isRequired>
            <FormLabel>Введите название проекта</FormLabel>
            <Input
              type="text"
              name="title"
              placeholder="Введите название проекта"
              value={grantData.title}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="destination_id" isRequired>
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
          <FormControl id="description" isRequired>
            <FormLabel>Введите краткое описание проекта</FormLabel>
            <Textarea
              name="description"
              placeholder="Введите краткое описание проекта"
              value={grantData.description}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="goals" isRequired>
            <FormLabel>Укажите цели проекта</FormLabel>
            <Textarea
              name="goals"
              placeholder="Укажите цели проекта"
              value={grantData.goals}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="social_meaning" isRequired>
            <FormLabel>Опишите социальную значимость проекта</FormLabel>
            <Textarea
              name="social_meaning"
              placeholder="Опишите социальную значимость проекта"
              value={grantData.social_meaning}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="target_audience" isRequired>
            <FormLabel>Опишите целевые группы проекта</FormLabel>
            <Textarea
              name="target_audience"
              placeholder="Опишите целевые группы проекта"
              value={grantData.target_audience}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="tasks" isRequired>
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
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
