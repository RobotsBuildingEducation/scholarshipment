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
  OrderedList,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { database } from "../database/setup";
import { FormLabel } from "react-bootstrap";
import { useSharedNostr } from "../hooks/useNOSTR";
import useDidKeyStore from "../hooks/useDidKeyStore";
import { VscAccount } from "react-icons/vsc";

const sections = [
  {
    title: "Clear Sense of Purpose and Vision",
    points: [
      "Demonstrates focus on specific career fields (e.g., accounting, finance, risk management).",
      "Expresses clear long-term goals (CPA, MBA, future nonprofit ventures).",
      "Conveys excitement and rationale for chosen major or field of study.",
    ],
  },
  {
    title: "Authentic Personal Narrative",
    points: [
      "Shares personal backstory (e.g., low-income upbringing, first-generation student, single-parent household).",
      "Highlights formative childhood experiences (e.g., building Hot Wheels rollercoasters, sewing doll dresses) to show early creativity/initiative.",
      "Reflects honestly on struggles (financial, language barriers, lack of guidance).",
    ],
  },
  {
    title: "Overcoming Adversity and Resilience",
    points: [
      "Demonstrates how personal or family challenges fueled determination (financial difficulties, fear of speaking English, balancing multiple roles).",
      "Illustrates problem-solving mindset and the capacity to persist under pressure.",
    ],
  },
  {
    title: "Leadership and Initiative",
    points: [
      "Mentions founding or leading organizations (e.g., 'Girls on Campus').",
      "Takes on leadership roles in clubs (e.g., treasurer for the accounting club, YIP fellowship, organizing panels or speaker events).",
      "Goes beyond personal gain to build communities and empower others.",
    ],
  },
  {
    title: "Community Engagement and Service",
    points: [
      "Provides mentorship or volunteer support (Latina Mentor Program, VITA program for taxes, stock competition representation).",
      "Shows passion for uplifting underrepresented groups (women of color, low-income students).",
      "Creates or contributes to programs and workshops that encourage higher education pursuits.",
    ],
  },
  {
    title: "Academic Excellence and Professional Development",
    points: [
      "Maintains high GPAs, Dean’s List recognition, honor societies (Alpha Chi).",
      "Completes relevant internships (at Deloitte, Bank of America) or fellowships (YIP Institute).",
      "Mentions specific coursework (auditing, accounting, cybersecurity, finance) and certifications (CFE, CPA) that align with career goals.",
    ],
  },
  {
    title: "Entrepreneurial and Innovative Spirit",
    points: [
      "Early examples of selling homemade crafts (Etsy shop, childhood gift-bag business).",
      "Active exploration in investing (Robinhood, Forex).",
      "Emphasizes creative problem-solving (turning cardboard boxes into picture books, forming social media communities).",
    ],
  },
  {
    title: "Collaboration and Networking",
    points: [
      "Highlights working in teams (Bloomberg stock competition, Deloitte audit engagements).",
      "Demonstrates openness to seeking advice and mentorship from professors and industry professionals.",
      "Recognizes the importance of building meaningful professional relationships.",
    ],
  },
  {
    title: "Passion for Social Impact",
    points: [
      "Aspires to use degree(s) for collective good, especially in underserved communities.",
      "Aims to start nonprofits or social ventures (Girls On Campus, language learning centers).",
      "Ties personal growth to a broader mission of equity, inclusion, and access to education.",
    ],
  },
  {
    title: "Reflective Growth Mindset",
    points: [
      "Acknowledges moments of uncertainty but embraces them to learn and grow.",
      "Actively pursues self-improvement (public speaking, time management, new skills).",
      "Demonstrates willingness to accept feedback (retaking midterms, learning from professors) and evolve.",
    ],
  },
  {
    title: "Effective Communication Skills",
    points: [
      "Tells a compelling story with clarity and substance.",
      "Uses personal anecdotes to connect with the reader.",
      "Demonstrates awareness of audience (scholarship committees, mentors, etc.).",
    ],
  },
  {
    title: "Alignment of Personal Values and Career Goals",
    points: [
      "Illustrates how personal convictions (integrity, empathy, community) shape professional aspirations.",
      "Reinforces the idea that career success and social impact can (and should) coexist.",
      "Seeks certifications and industries (anti-fraud, accounting ethics) that reflect a commitment to moral responsibility.",
    ],
  },
  {
    title: "Financial Need Paired with Determination",
    points: [
      "Clearly communicates financial hardships without sounding solely needy—balances it with gratitude and hope.",
      "Frames the scholarship as a pathway to achieving bigger contributions to society, not just personal gain.",
    ],
  },
  {
    title: "Forward-Looking Ambition",
    points: [
      "Outlines how each current step (internship, clubs, certifications) leads to future achievements.",
      "Shows desire to keep learning (MBA, second or third language, new tech skills).",
      "Expresses motivation to scale impact beyond immediate circles (globally, digitally, or within specialized industries).",
    ],
  },
];
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
                <AccordionButton height="60px">
                  <Box flex="1" textAlign="left">
                    Profile advice
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel>
                  <Box mb={4}>
                    The following list describes attributes and qualities that
                    create successful scholarship applications. We recommend
                    outlining what resonates with you so we can take care of the
                    rest!
                  </Box>
                  <OrderedList ml="-2" spacing={0}>
                    {sections.map((section, index) => (
                      <ListItem key={index} fontWeight="bold">
                        {section.title}
                        <UnorderedList
                          ml="-2"
                          mt={1}
                          fontWeight="normal"
                          mb={3}
                        >
                          {section.points.map((point, i) => (
                            <ListItem key={i} mb={2}>
                              {point}
                            </ListItem>
                          ))}
                        </UnorderedList>
                      </ListItem>
                    ))}
                  </OrderedList>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton height="60px">
                  <Box flex="1" textAlign="left">
                    Your account key
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4}>
                    <Text size="sm">
                      Your secret key is used to log into decentralized apps. It
                      works just like mailbox, so keep your key somewhere safe!
                      Visit{" "}
                      <Link
                        target="_blank"
                        href="https://otherstuff.app"
                        textDecoration={"underline"}
                      >
                        the Other Stuff app store
                      </Link>{" "}
                      to experience and access more apps with your key.
                    </Text>
                    <Button onClick={handleCopySecretKey}>
                      🔑 Copy Secret Key
                    </Button>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton height="60px">
                  <Box flex="1" textAlign="left">
                    Switch account
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
