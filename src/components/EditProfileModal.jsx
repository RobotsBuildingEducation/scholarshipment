import React, { useEffect, useState } from "react";
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
  Textarea,
  VStack,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  useToast,
} from "@chakra-ui/react";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { database } from "../database/setup";

const AccountSwitcherAndProfileEditor = ({
  isOpen,
  onClose,
  initialName,
  initialEmail,
  initialDescription,
}) => {
  const [didKey, setDidKey] = useState("");
  const [isValidDidKey, setIsValidDidKey] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [description, setDescription] = useState(initialDescription);
  const [hasCopied, setHasCopied] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
    setDescription(initialDescription);
    setDidKey(localStorage.getItem("uniqueId"));
  }, [initialName, initialEmail, initialDescription]);

  const checkDidKey = async (key) => {
    console.log("running...");
    try {
      const docRef = doc(database, "users", key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setIsValidDidKey(true);
        toast({
          title: "Valid DID Key.",
          description: "The DID Key exists in Firestore.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setIsValidDidKey(false);
        toast({
          title: "Invalid DID Key.",
          description: "The DID Key does not exist in Firestore.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      setIsValidDidKey(false);
      toast({
        title: "Error.",
        description: `An error occurred: ${error.message}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDidKeyChange = (e) => {
    const key = e.target.value;
    setDidKey(key);
    const regex = /^did:dht:[a-zA-Z]{4,}/;
    if (regex.test(key)) {
      checkDidKey(key);
    } else {
      setIsValidDidKey(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(database, "users", didKey), {
        name: name,
        email: email,
        description: description,
      });
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(didKey);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 3000); // Reset after 3 seconds
  };

  // console.log("didkeydidKeydidKeydidKeydidKeydidKey", didKey);
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
            <Textarea
              placeholder="About you"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Accordion allowToggle width="100%">
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Switch Account
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4}>
                    <Input
                      placeholder="Enter DID Key"
                      value={didKey}
                      onChange={handleDidKeyChange}
                    />
                    <Text>ID: {didKey}</Text>
                    <Button onClick={handleCopy} colorScheme="teal">
                      {hasCopied ? "Copied" : "Copy ID"}
                    </Button>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            {name || description ? (
              <div>
                <Heading as="h3" size="md">
                  Profile
                </Heading>
                {name ? <small>{name}</small> : null}
                <br />
                {description ? <small>{description}</small> : null}
              </div>
            ) : null}
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

export default AccountSwitcherAndProfileEditor;
