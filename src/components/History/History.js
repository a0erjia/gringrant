import React, { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, VStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { StarIcon, CheckIcon, DeleteIcon } from '@chakra-ui/icons';

function History({ handleEditGrant, handleViewGrantProp }) {
  const [history, setHistory] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/grants/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        setHistory(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleViewGrant = (grant) => {
    setSelectedGrant(grant);
    onOpen();
  };

  const handleToggleFavorite = async (grantId, isBookmarked) => {
    const token = localStorage.getItem('token');
    const method = isBookmarked ? 'DELETE' : 'POST';
    const endpoint = isBookmarked ? `http://localhost:8000/grants/favorites/${grantId}` : 'http://localhost:8000/grants/favorites';
    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ grant_id: grantId })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      // Обновляем состояние, чтобы отразить изменения
      setHistory((prevHistory) =>
        prevHistory.map((grant) =>
          grant.id === grantId ? { ...grant, is_bookmarked: !grant.is_bookmarked } : grant
        )
      );
      setSelectedGrant((prevGrant) => ({ ...prevGrant, is_bookmarked: !prevGrant.is_bookmarked }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!Array.isArray(history)) {
    return <div>Invalid data format</div>;
  }

  return (
    <Box p={4}>
      <Heading as="h2" size="xl" mb={4} textAlign="center">
        История
      </Heading>
      <VStack spacing={4} align="stretch">
        {history.map((grant) => (
          <Box
            key={grant.id}
            p={4}
            borderWidth={1}
            borderRadius="lg"
            boxShadow="lg"
            w="full"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            bg="white"
          >
            <Box>
              <Heading as="h3" size="md" mb={2}>
                {grant.title}
              </Heading>
              <Text>{new Date(grant.created_at).toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' })}</Text>
              <Text>
                Оценка нейросети:{" "}
                <Text as="span" color={grant.estimated_chance > 84 ? 'green.500' : 'red.500'}>
                  {grant.estimated_chance}%
                </Text>
              </Text>
            </Box>
            <Button
              colorScheme="teal"
              variant="outline"
              onClick={() => handleViewGrant(grant)}
            >
              Посмотреть
            </Button>
          </Box>
        ))}
      </VStack>

      {selectedGrant && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Детали заявки</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text><strong>Название:</strong> {selectedGrant.title}</Text>
              <Text><strong>Описание:</strong> {selectedGrant.description}</Text>
              <Text><strong>Цели:</strong> {selectedGrant.goals}</Text>
              <Text><strong>Социальная значимость:</strong> {selectedGrant.social_meaning}</Text>
              <Text><strong>Целевая аудитория:</strong> {selectedGrant.target_audience}</Text>
              <Text><strong>Задачи:</strong> {selectedGrant.tasks}</Text>
              <Text><strong>Направление:</strong> {selectedGrant.destination}</Text>
              <Text><strong>Дата создания:</strong> {new Date(selectedGrant.created_at).toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' })}</Text>
              <Text>
                <strong>Оценка нейросети: </strong> 
                <Text as="span" color={selectedGrant.estimated_chance > 84 ? 'green.500' : 'red.500'}>
                  {selectedGrant.estimated_chance}%
                </Text>
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" onClick={onClose}>
                Закрыть
              </Button>
              <Button
                colorScheme={selectedGrant.is_bookmarked ? "green" : "yellow"}
                onClick={() => handleToggleFavorite(selectedGrant.id, selectedGrant.is_bookmarked)}
                ml={3}
              >
                {selectedGrant.is_bookmarked ? (
                  <>
                    <CheckIcon mr={2} />
                    В избранном
                  </>
                ) : (
                  <>
                    <StarIcon mr={2} />
                    Добавить в избранное
                  </>
                )}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}

export default History;
