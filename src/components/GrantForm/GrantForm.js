import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack, Text } from '@chakra-ui/react';

function GrantForm() {
  const [grant, setGrant] = useState({
    title: '',
    destination_id: '',
    description: '',
    goals: '',
    social_meaning: '',
    target_audience: '',
    tasks: ''
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGrant((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(grant),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке заявки');
      }

      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <Box p={4}>
      <VStack as="form" spacing={4} onSubmit={handleSubmit}>
        <FormControl id="title">
          <FormLabel>Название проекта</FormLabel>
          <Input type="text" name="title" value={grant.title} onChange={handleChange} />
        </FormControl>
        <FormControl id="destination_id">
          <FormLabel>Идентификатор направления</FormLabel>
          <Input type="number" name="destination_id" value={grant.destination_id} onChange={handleChange} />
        </FormControl>
        <FormControl id="description">
          <FormLabel>Описание</FormLabel>
          <Textarea name="description" value={grant.description} onChange={handleChange} />
        </FormControl>
        <FormControl id="goals">
          <FormLabel>Цели</FormLabel>
          <Textarea name="goals" value={grant.goals} onChange={handleChange} />
        </FormControl>
        <FormControl id="social_meaning">
          <FormLabel>Социальное значение</FormLabel>
          <Textarea name="social_meaning" value={grant.social_meaning} onChange={handleChange} />
        </FormControl>
        <FormControl id="target_audience">
          <FormLabel>Целевая аудитория</FormLabel>
          <Textarea name="target_audience" value={grant.target_audience} onChange={handleChange} />
        </FormControl>
        <FormControl id="tasks">
          <FormLabel>Задачи</FormLabel>
          <Textarea name="tasks" value={grant.tasks} onChange={handleChange} />
        </FormControl>
        <Button colorScheme="teal" type="submit">Отправить заявку</Button>
      </VStack>
      {result && (
        <Box mt={4}>
          <Text>Результат оценки:</Text>
          <Text>Название: {result.title}</Text>
          <Text>Описание: {result.description}</Text>
          <Text>Оценка: {result.score}</Text>
          <Text>Комментарии: {result.comments}</Text>
        </Box>
      )}
    </Box>
  );
}

export default GrantForm;
