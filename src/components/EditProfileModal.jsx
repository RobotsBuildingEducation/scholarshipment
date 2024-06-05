// EditProfileModal.js
import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
} from "@chakra-ui/react";
import { updateDoc, doc } from "firebase/firestore";
import { database } from "../database/setup";

const EditProfileModal = ({
  isOpen,
  onClose,
  didKey,
  initialName,
  initialEmail,
}) => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(database, "users", didKey), {
        name: name,
        email: email,
      });
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSaveProfile}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;
