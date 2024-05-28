import React, { useState, useEffect } from "react";
import { setDoc, doc, updateDoc } from "firebase/firestore";
import { database } from "../database/setup";
import {
  Container,
  Heading,
  Input,
  Button,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";

const Onboarding = ({ handleOnboardingComplete, uniqueId }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const toast = useToast();

  const handleOnboarding = async () => {
    await updateDoc(doc(database, "users", uniqueId), {
      uniqueId: uniqueId,
      name: name,
      email: email,
    });

    handleOnboardingComplete();
  };

  const handleCopyDidKey = async () => {
    try {
      await navigator.clipboard.writeText(uniqueId);
      toast({
        title: "Copied to clipboard",
        description: "Your DID key has been copied to the clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy DID key to clipboard.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container>
      <Heading as="h1" mb={4}>
        Welcome to Our App
      </Heading>
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
        <Button onClick={handleOnboarding}>Complete Onboarding</Button>

        <Text>
          Please save your DID key: <br />
          <strong>{uniqueId}</strong>
        </Text>
        <Button onClick={handleCopyDidKey}>Copy DID Key</Button>
      </VStack>
    </Container>
  );
};

export default Onboarding;
