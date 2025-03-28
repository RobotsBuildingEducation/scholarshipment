import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  Spinner,
  Box,
  Link,
  VStack,
  Divider,
  HStack,
  Textarea,
  Checkbox,
  FormControl,
  FormLabel,
  UnorderedList,
  ListItem,
  Heading,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { useWebSearchAgent } from "../hooks/useChatCompletion";
import Markdown from "react-markdown";
import { MdSupportAgent } from "react-icons/md";
import { doc, getDoc } from "firebase/firestore";
import { database } from "../database/setup";

// Helper: Parse suggestions and group annotations.
// This function assumes your suggestions are numbered (e.g., "1. ", "2. ", etc.)

const newTheme = {
  p: (props) => <Text fontSize="sm" mb={2} lineHeight="1.6" {...props} />,
  ul: (props) => <UnorderedList pl={6} spacing={2} {...props} />,
  ol: (props) => <UnorderedList as="ol" pl={6} spacing={2} {...props} />,
  li: (props) => <ListItem mb={1} {...props} />,
  h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
};

export const ScholarshipSearchModal = ({ didKey }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { fullResponse, messages, loading, submitPrompt } = useWebSearchAgent({
    model: "gpt-4o-mini",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    temperature: 0.9,
    useWebSearch: true, // use the web search endpoint
  });

  // New state for custom query and the checkbox.
  const [customQuery, setCustomQuery] = useState("");
  const [includeProfile, setIncludeProfile] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!didKey) return;
      try {
        const docRef = doc(database, "users", didKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({
            description: docSnap.data().description,
          });
        } else {
          console.error("No profile data found for", didKey);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      // setLoading(false);
    };

    fetchProfile();
  }, [didKey]);

  // Trigger a web search query when the user clicks "Start Search".
  const handleSearch = async () => {
    const defaultQuery = `"10 scholarship application pages scholarships up to $1,000."`;
    let query = customQuery.length > 0 ? customQuery : defaultQuery;

    // Get the current date in a human-readable format.
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Append a condition to the query that excludes scholarships with deadlines before today.
    query += `\n\nIMPORTANT: Please do not return any scholarships that have a deadline before ${today} (today) since they are expired and not useful. This is a strict requirement, scholarships must be dated as of today or after. Under no circumstance should we return a scholarship who's deadline is before the date provided and we must look for valid scholarship dates only. Do not mention that invalid scholarships are invalid, simply skip it and do not include it at all. This requirement is extremely important to follow or else our task, app and user experience will completely fail.`;

    // For testing, using a dummy profile. Replace with real profile data as needed.
    const userProfile = {
      name: "Test User",
      email: "test@example.com",
      description: "This is a test description for the user profile.",
    };

    if (includeProfile) {
      query +=
        "\n\nThe user has included private information about themselves and would like it to be prioritized in the search: \n" +
        JSON.stringify(profile, null, 2);
    }

    query +=
      "Finally, include at least 10 results. Make descriptions for each in list format that highlight amount, due date, description, eligibility and link.";

    await submitPrompt([{ content: query, role: "user" }]);
  };

  const lastMessage = messages[messages.length - 1];

  console.log(
    "DAY",
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );

  const renderFullResponse = () => {
    if (!fullResponse) return null;
    return (
      <VStack align="start" spacing={4}>
        {fullResponse.output &&
          fullResponse.output.map((item, idx) => {
            if (item.type === "message") {
              const outputTextItem = item.content.find(
                (c) => c.type === "output_text"
              );
              if (!outputTextItem) return null;
              if (
                outputTextItem.annotations &&
                outputTextItem.annotations.length > 0 &&
                outputTextItem.text.includes(". ")
              ) {
                return (
                  <Box
                    key={idx}
                    p={2}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <Markdown
                      children={outputTextItem.text}
                      // components={{
                      //   a: ({ node, ...props }) => (
                      //     <Link
                      //       {...props}
                      //       color="blue.600"
                      //       fontWeight="bold"
                      //       textDecoration="underline"
                      //       isExternal
                      //     >
                      //       {props.children}
                      //     </Link>
                      //   ),
                      //   ol: ({ node, children, ...props }) => (
                      //     <ol {...props}>
                      //       {React.Children.map(children, (child) =>
                      //         React.isValidElement(child)
                      //           ? React.cloneElement(child, {
                      //               style: { marginBottom: "24px" },
                      //             })
                      //           : child
                      //       )}
                      //     </ol>
                      //   ),
                      // }}
                      components={ChakraUIRenderer(newTheme)}
                    />
                  </Box>
                );
              } else {
                return (
                  <Box
                    key={idx}
                    p={2}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <Text whiteSpace="pre-wrap" fontSize="md" mb={2}>
                      {outputTextItem.text}
                    </Text>
                    {outputTextItem.annotations &&
                      outputTextItem.annotations.length > 0 && (
                        <>
                          <Divider />
                          <Text fontSize="sm" fontWeight="bold" mt={2}>
                            Citations:
                          </Text>
                          <VStack align="start" spacing={1} mt={1}>
                            {outputTextItem.annotations.map((citation, idx) => (
                              <Link
                                key={idx}
                                href={citation.url}
                                isExternal
                                color="blue.500"
                                fontSize="sm"
                              >
                                {citation.title || citation.url}
                              </Link>
                            ))}
                          </VStack>
                        </>
                      )}
                  </Box>
                );
              }
            }
            return null;
          })}
      </VStack>
    );
  };

  return (
    <>
      <Button onClick={onOpen} boxShadow="0.5px 0.5px 1px 0px black">
        <MdSupportAgent
          style={{ color: "#C95F8F", textShadow: "3px 3px 3px black" }}
        />
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader display="flex" alignItems={"center"}>
            <MdSupportAgent style={{ textShadow: "3px 3px 3px black" }} />
            &nbsp; Scholarship Searching Agent
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm">
                This feature searches the web and organizes a list of
                scholarships for you.
              </Text>
              {/* Input fields for custom query and profile inclusion */}
              <FormControl>
                <Checkbox
                  colorScheme="pink"
                  isChecked={includeProfile}
                  onChange={(e) => {
                    setIncludeProfile(e.target.checked);
                  }}
                >
                  Include the About Me from my profile
                </Checkbox>
              </FormControl>
              <FormControl>
                <FormLabel>Personalize your search</FormLabel>
                <Textarea
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Enter any specific needs or preferences..."
                />
              </FormControl>

              <Divider />
              {/* Render search results or loading states */}
              {loading ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="xl" />
                  <Text mt={4}>Searching the web...</Text>
                </Box>
              ) : fullResponse ? (
                renderFullResponse()
              ) : lastMessage ? (
                <VStack align="start" spacing={4}>
                  <Text fontSize="lg" fontWeight="bold">
                    {lastMessage.role === "assistant"
                      ? "Results:"
                      : "Your Query:"}
                  </Text>
                  <Text whiteSpace="pre-wrap" fontSize="md">
                    {lastMessage.content}
                  </Text>
                  {lastMessage.meta &&
                    lastMessage.meta.annotations &&
                    lastMessage.meta.annotations.length > 0 && (
                      <>
                        <Divider />
                        <Text fontSize="sm" fontWeight="bold" mt={2}>
                          Citations:
                        </Text>
                        <VStack align="start" spacing={1} mt={1}>
                          {lastMessage.meta.annotations.map((citation, idx) => (
                            <Link
                              key={idx}
                              href={citation.url}
                              isExternal
                              color="blue.500"
                              fontSize="sm"
                            >
                              {citation.title || citation.url}
                            </Link>
                          ))}
                        </VStack>
                      </>
                    )}
                </VStack>
              ) : (
                <Text>
                  No results yet. Click "Start Search" below to fetch results.
                </Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button variant="outline" onClick={handleSearch}>
                Start Search
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ScholarshipSearchModal;
