import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Heading, Text, VStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

function Favorites({ handleEditGrant, handleRemoveFavorite }) {
  const [favorites, setFavorites] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [grantToDelete, setGrantToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/grants/favorites', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }

        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleViewGrant = (grant) => {
    setSelectedGrant(grant);
    onOpen();
  };

  const handleRemoveFromFavorites = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/grants/favorites/${grantToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      setFavorites(favorites.filter(favorite => favorite.id !== grantToDelete.id));
      onAlertClose();
    } catch (error) {
      setError(error.message);
    }
  };

  const confirmRemoveFromFavorites = (grant) => {
    setGrantToDelete(grant);
    onAlertOpen();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!Array.isArray(favorites)) {
    return <div>Invalid data format</div>;
  }

  return (
    <Box p={4}>
      <Heading as="h2" size="xl" mb={4} textAlign="center">
        Избранное
      </Heading>
      <VStack spacing={4} align="stretch">
        {favorites.map((grant) => (
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
                <Text as="span" color={grant.estimated_chance > 60 ? 'green.500' : 'red.500'}>
                  {grant.estimated_chance}%
                </Text>
              </Text>
            </Box>
            <Box display="flex" alignItems="center">
              <Button
                colorScheme="teal"
                variant="outline"
                onClick={() => handleViewGrant(grant)}
                mr={2}
              >
                Посмотреть
              </Button>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={() => confirmRemoveFromFavorites(grant)}
              >
                <CloseIcon />
              </Button>
            </Box>
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
              <Text><strong>Направление:</strong> {selectedGrant.destination}</Text>
              <Text><strong>Дата создания:</strong> {new Date(selectedGrant.created_at).toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' })}</Text>
              <Text>
                <strong>Оценка нейросети: </strong> 
                <Text as="span" color={selectedGrant.estimated_chance > 60 ? 'green.500' : 'red.500'}>
                  {selectedGrant.estimated_chance}%
                </Text>
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" onClick={onClose}>
                Закрыть
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Удаление заявки из избранного
            </AlertDialogHeader>

            <AlertDialogBody>
              Вы уверены, что хотите удалить заявку из избранного?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Нет
              </Button>
              <Button colorScheme="red" onClick={handleRemoveFromFavorites} ml={3}>
                Да
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default Favorites;
