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
  Link,
  Spinner,
  CloseButton,
} from "@chakra-ui/react";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { database } from "../database/setup";
import { FormLabel } from "react-bootstrap";
import { useSharedNostr } from "../hooks/useNOSTR";
import useDidKeyStore from "../hooks/useDidKeyStore";
import { VscAccount } from "react-icons/vsc";

const AccountSwitcherAndProfileEditor = ({
  fetchUserDataNoLoading,
  isOpen,
  onClose,
  initialName,
  initialEmail,
  initialDescription,
  didKey,
  setDidKey,
}) => {
  const { enableSecretMode, secretMode } = useDidKeyStore(); // Access enableSecretMode function

  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const [formDidKey, setFormDidKey] = useState("");
  // const { didKey, setDidKey } = useDidKeyStore();

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isValidDidKey, setIsValidDidKey] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [description, setDescription] = useState(initialDescription);
  const [hasCopied, setHasCopied] = useState(false);
  const toast = useToast();
  const { auth } = useSharedNostr();

  console.log("XDID", didKey);
  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
    setDescription(initialDescription);
  }, [initialName, initialEmail, initialDescription]);

  useEffect(() => {
    let getKeys = async () => {
      let keySet = await auth(localStorage.getItem("local_nsec"));

      console.log("keysetnpub", keySet);
      if (
        keySet.user.npub ===
        // "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
        "npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2"
      )
        enableSecretMode();
    };

    getKeys();
  }, []);

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
    setFormDidKey(key);
    // const regex = /^did:dht:[a-zA-Z]{4,}/;
    // if (regex.test(key)) {
    //   checkDidKey(key);
    // } else {
    //   setIsValidDidKey(false);
    // }
  };

  const handleSaveProfile = async () => {
    console.log("MY DID KEY", didKey);
    try {
      await updateDoc(doc(database, "users", didKey), {
        name: name,
        email: email,
        description: description,
      });
      fetchUserDataNoLoading();

      toast({
        title: "Profile updated.",
        description: "You've updated your profile!",
        status: "info",
        duration: 1500,

        position: "top",

        render: () => (
          <Box
            color="black"
            p={3}
            bg="#f7f5df" // Custom background color here!
            borderRadius="md"
            boxShadow="lg"
          >
            <Text fontWeight="bold">Profile updated.</Text>
            <Text>You've updated your profile!</Text>
          </Box>
        ),
      });

      // onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Profile not updated.",
        description: "Could not update your profile 😞",
        status: "error",
        duration: 3000,
        position: "top",
        render: ({ onClose }) => (
          <Box
            color="white"
            p={3}
            bg="#850b03" // Custom background color here!
            borderRadius="md"
            boxShadow="lg"
          >
            <Text
              fontWeight="bold"
              display={"flex"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              Profile not updated.
              <CloseButton onClick={() => onClose()} />
            </Text>
            <Text>Could not update your profile 😞</Text>
          </Box>
        ),
      });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(didKey);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 3000); // Reset after 3 seconds
  };

  const handleCopySecretKey = () => {
    const keysToCopy = `${localStorage.getItem("local_nsec")}`;
    navigator.clipboard.writeText(keysToCopy);
    toast({
      title: "Secret key copied",
      description: "Your secret key has been copied!",
      status: "info",
      duration: 1500,
      isClosable: true,
      position: "top",
      render: () => (
        <Box
          color="black"
          p={3}
          bg="#fffbe3" // Custom background color here!
          borderRadius="md"
          boxShadow="lg"
        >
          <Text fontWeight="bold">Secret key copied</Text>
          <Text>Your secret key has been copied!</Text>
        </Box>
      ),
    });
  };

  const handleAuth = async () => {
    setIsAuthLoading(true);
    let result = await auth(formDidKey);
    console.log("USER", result);
    setIsAuthLoading(false);
    if (
      result.user.npub ===
      // "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
      "npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2"
    ) {
      enableSecretMode(); // Enable secret mode
    }

    if (result?.user) {
      setAuthSuccessMsg("You've switched accounts!");
      setFormDidKey("");
      setDidKey(result?.user?.npub);
    } else {
      setAuthSuccessMsg("Failed to switch accounts.");
    }
  };

  // const handleSignIn = async () => {
  //   setIsSigningIn(true);
  //   await auth(secretKey);
  //   const npub = localStorage.getItem("local_npub");
  //   const userName = localStorage.getItem("displayName");

  //   // Check if user exists in Firestore and create if necessary
  //   const userDoc = doc(database, "users", npub);

  //   const userSnapshot = await getDoc(userDoc).catch((error) =>
  //     console.log("ERRX", error)
  //   );

  //   if (!userSnapshot) {
  //     try {
  //       await createUser(npub, userName, userLanguage);
  //     } catch (error) {
  //       console.log("error creaitn ug", error);
  //     }
  //     const defaultInterval = 2880;

  //     const currentTime = new Date();
  //     const endTime = new Date(currentTime.getTime() + defaultInterval * 60000);
  //     try {
  //       await updateUserData(
  //         npub,
  //         defaultInterval, // Set the default interval for the streak
  //         0, // Initial streak count is 0
  //         currentTime, // Start time
  //         endTime // End time, 48 hours from start time
  //       );
  //     } catch (error) {
  //       console.log("error creaitn ug x2", error);
  //     }
  //   }

  //   const currentStep = await getUserStep(npub); // Retrieve the current step
  //   setIsSigningIn(false);
  //   setIsSignedIn(true);

  //   navigate(`/q/${currentStep}`); // Navigate to the user's current step
  // };

  // console.log("didkeydidKeydidKeydidKeydidKeydidKey", didKey);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display="flex" alignItems={"center"}>
          <VscAccount />
          &nbsp; Edit Profile
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box fontSize="sm" mb={4}>
            Create a profile to help our AI write better drafts!
          </Box>
          <VStack spacing={4} justify={"flex-start"}>
            <Box width="100%">
              <FormLabel htmlFor="name">
                <Text
                  padding={0}
                  margin={0}
                  fontSize={"sm"}
                  fontWeight={"bold"}
                >
                  Name
                </Text>
              </FormLabel>
              <Input
                id="name"
                name="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Box>
            {/* <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            /> */}
            <Box width="100%">
              <FormLabel htmlFor="aboutYou">
                <Text
                  padding={0}
                  margin={0}
                  fontSize={"sm"}
                  fontWeight={"bold"}
                >
                  About you
                </Text>
              </FormLabel>
              <Textarea
                placeholder="Information to personalize your drafts"
                id="aboutYou"
                name="aboutYou"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Box>
            <Accordion allowToggle width="100%">
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Your account key
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4}>
                    <Text size="sm">
                      Your secret key is used to log into decentralized apps.
                      Visit{" "}
                      <Link
                        target="_blank"
                        href="https://otherstuff.app"
                        textDecoration={"underline"}
                      >
                        the Other Stuff app store
                      </Link>{" "}
                      to experience more. Keep your key somewhere safe!
                    </Text>
                    <Button onClick={handleCopySecretKey}>
                      🔑 Copy Secret Key
                    </Button>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
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
                      placeholder="Enter your secret key"
                      value={formDidKey}
                      onChange={handleDidKeyChange}
                    />

                    {/* <Button onClick={handleCopy} colorScheme="teal">
                      {hasCopied ? "Copied" : "Copy ID"}
                    </Button> */}
                    <Button onClick={handleAuth} variant={"outline"}>
                      {isAuthLoading ? <Spinner /> : "Sign in"}
                    </Button>

                    <Text>
                      ID: {localStorage.getItem("uniqueId").substring(0, 16)}
                    </Text>
                    <Text
                      color={
                        authSuccessMsg === `You've switched accounts!`
                          ? "teal"
                          : "orange"
                      }
                    >
                      {authSuccessMsg}
                    </Text>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
          {/* {name || description ? (
            <Box mt={8}>
              <Heading as="h3" size="md">
                Profile
              </Heading>
              {name ? <small>{name}</small> : null}
              <br />
              {description ? <small>{description}</small> : null}
            </Box>
          ) : null} */}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccountSwitcherAndProfileEditor;
