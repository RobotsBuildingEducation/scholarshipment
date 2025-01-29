import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Flex,
  Divider,
  Text,
} from "@chakra-ui/react";
import { IoShareOutline } from "react-icons/io5";
import { IoIosMore } from "react-icons/io";
import { BsPlusSquare } from "react-icons/bs";
import { LuBadgeCheck } from "react-icons/lu";

export const InstallAppModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Install App</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" pb={0}>
            <IoIosMore size={32} />
            <Text mt={2}>
              1. Open this page in your browser with the More Options button
            </Text>
          </Flex>
          <Divider mb={6} />

          <Flex direction="column" pb={0}>
            <IoShareOutline size={32} />
            <Text mt={2}>2. Press the Share button</Text>
          </Flex>
          <Divider mb={6} />

          <Flex direction="column" pb={0}>
            <BsPlusSquare size={32} />
            <Text mt={2}>3. Press the Add To Homescreen button</Text>
          </Flex>
          <Divider mb={6} />

          <Flex direction="column" pb={0}>
            <LuBadgeCheck size={32} />
            <Text mt={2}>
              4. That's it! You don't need to download the app through an app
              store because we're using open-source standards called Progressive
              Web Apps.
            </Text>
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onMouseDown={onClose}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClose();
              }
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
