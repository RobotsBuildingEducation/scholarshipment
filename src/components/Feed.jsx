// Feed.jsx

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { database } from "../database/setup";
import {
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Button,
  useDisclosure,
  useBreakpointValue,
  Box,
  useToast,
  Skeleton,
  SkeletonText,
  HStack,
  VStack,
  Image,
  Link,
} from "@chakra-ui/react";
import UserProfileModal from "./UserProfileModal";
import { useChatCompletion } from "../hooks/useChatCompletion";
import ScholarshipList from "./ScholarshipList";
import AiDrawer from "./AiDrawer";
import ResponsiveTabs from "../elements/ResponsiveTabs";
import { SettingsIcon } from "@chakra-ui/icons";

import logo_transparent from "../assets/logo_transparent.png";
// import { SettingsIcon } from "../assets/settingsIcon";

// const tabOrientation = useBreakpointValue({
//   base: "vertical",
//   md: "horizontal",
// });

const Feed = ({ didKey, isAdminMode }) => {
  const {
    isOpen: isFiltersOpen,
    onOpen: onFiltersOpen,
    onClose: onFiltersClose,
  } = useDisclosure();
  const {
    isOpen: isUserProfileOpen,
    onOpen: onUserProfileOpen,
    onClose: onUserProfileClose,
  } = useDisclosure();
  const {
    isOpen: isAiDrawerOpen,
    onOpen: onAiDrawerOpen,
    onClose: onAiDrawerClose,
  } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const [suggestedScholarships, setSuggestedScholarships] = useState([]);
  const [isFetchingUserData, setIsFetchingUserData] = useState(false);
  const [scholarships, setScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [filters, setFilters] = useState(null);
  const [tempFilters, setTempFilters] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isRenderingSpotlight, setIsRenderingSpotlight] = useState(true);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [formText, setFormText] = useState("");
  const [existingDraft, setExistingDraft] = useState(null);
  const [originalDraft, setOriginalDraft] = useState(null);
  const { messages, submitPrompt, resetMessages, abortResponse } =
    useChatCompletion();
  const {
    messages: transformedMessages,
    submitPrompt: transformedSubmitPrompt,
    resetMessages: transformedResetMessages,
    abortResponse: transformAbortResponse,
  } = useChatCompletion({ response_format: { type: "json_object" } });
  const [promptData, setPromptData] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState("spotlight"); // Set initial view mode to spotlight
  const [recommendedScholarships, setRecommendedScholarships] = useState([]);

  const toast = useToast({});

  function capitalizeFirstLetter(str) {
    return str[0].toUpperCase() + str.slice(1);
  }

  const onSend = async (scholarship) => {
    try {
      setIsSending(true);
      setSelectedScholarship(scholarship);
      handleOpenSaveModal(scholarship);

      const draftDocRef = doc(
        database,
        `users/${didKey}/drafts`,
        scholarship.id
      );
      const draftDoc = await getDoc(draftDocRef);

      console.log("Scholarship being processed...", scholarship);
      if (draftDoc?.exists()) {
        const draftData = draftDoc.data();
        setExistingDraft(draftData.draftContent);
        setOriginalDraft(draftData?.originalContent);
        setFormText(draftData.draftContent);
        setIsSending(false);
      } else {
        await submitPrompt([
          {
            content: `Draft a sample scholarship essay in clean minimalist markdown without headers. 
            The following JSON tells you more about the scholarship, with the meta field providing direct information from the creator ${JSON.stringify(
              scholarship
            )}`,
            role: "user",
          },
        ]);
        setPromptData("");
        console.log("done");
        setIsSending(false);
      }
    } catch (error) {
      console.log("error", { error });
      setIsSending(false);
    }
  };

  const fetchUserData = async () => {
    const id = didKey;
    try {
      setIsFetchingUserData(true);
      const userDocRef = await doc(database, "users", id);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.name || "");
        setEmail(userData.email || "");
        if (userData.filters) {
          setTempFilters(userData.filters);
          setFilters(userData.filters);
        }
      }
      setIsFetchingUserData(false);
    } catch (error) {
      setIsFetchingUserData(false);
      console.log("Error fetching user data:", error);
    }
  };

  const fetchDrafts = async () => {
    setIsRenderingSpotlight(false);
    if (didKey) {
      try {
        const draftsQuery = query(
          collection(database, `users/${didKey}/drafts`)
        );
        const querySnapshot = await getDocs(draftsQuery);
        const loadedDrafts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDrafts(loadedDrafts);
      } catch (error) {
        console.log("Error fetching drafts:", error);
      }
    }
  };

  const fetchSavedScholarships = async () => {
    setIsRenderingSpotlight(false);
    if (didKey) {
      try {
        const savedQuery = query(
          collection(database, `users/${didKey}/savedScholarships`)
        );
        const querySnapshot = await getDocs(savedQuery);
        const loadedSavedScholarships = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedScholarships(loadedSavedScholarships);
      } catch (error) {
        console.log("Error fetching saved scholarships:", error);
      }
    }
  };

  useEffect(() => {
    setIsRenderingSpotlight(true);
    fetchUserData();
    loadScholarships(true);
  }, [didKey]);

  useEffect(() => {
    console.log("messages from effect", transformedMessages);
    if (transformedMessages.length > 0) {
      if (transformedMessages[transformedMessages.length - 1].meta.done) {
        console.log(
          "final message",
          JSON.stringify(
            transformedMessages[transformedMessages.length - 1].content,
            null,
            2
          )
        );

        const recommendedIds = JSON.parse(
          transformedMessages[transformedMessages.length - 1].content
        ).response.suggested;
        console.log("RECC", recommendedIds);
        const recommendedList = scholarships.filter((sch) =>
          recommendedIds.includes(sch.id)
        );

        console.log("recommendedList", recommendedList);
        setRecommendedScholarships(recommendedList);

        setIsFetchingUserData(false);
      }
    }
  }, [transformedMessages]);

  const loadScholarships = async (spotlightOnly = false) => {
    try {
      let q;
      if (spotlightOnly) {
        setIsRenderingSpotlight(true);
        q = query(
          collection(database, "scholarships"),
          where("isSpotlight", "==", true)
        );
      } else {
        setIsRenderingSpotlight(false);
        q = query(collection(database, "scholarships"));
      }
      const querySnapshot = await getDocs(q);
      const loadedScholarships = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setScholarships(loadedScholarships);
      setFilteredScholarships(loadedScholarships);
    } catch (error) {
      console.log("error loading scholarships", error);
    }
  };

  const filterScholarships = () => {
    setIsRenderingSpotlight(false);
    const filtered = scholarships.filter((scholarship) => {
      return (
        (filters?.collectionType?.length === 0 ||
          filters?.collectionType?.some((type) =>
            scholarship?.collectionType?.includes(type)
          )) &&
        (!filters.eligibility ||
          scholarship.eligibility.includes(filters.eligibility)) &&
        (!filters.major || scholarship.major.includes(filters.major)) &&
        (!filters.amount || scholarship.amount.toString() === filters.amount) &&
        (!filters.ethnicity ||
          scholarship.ethnicity.includes(filters.ethnicity)) &&
        (!filters.year || scholarship.year.toString() === filters.year) &&
        (filters.isHighschool === false ||
          scholarship.isHighschool === filters.isHighschool) &&
        (filters.isCollege === false ||
          scholarship.isCollege === filters.isCollege) &&
        (filters.isUnderserved === false ||
          scholarship.isUnderserved === filters.isUnderserved) &&
        (filters.isInternational === false ||
          scholarship.isInternational === filters.isInternational) &&
        (filters.isStateOnly === false ||
          scholarship.isStateOnly === filters.isStateOnly)
      );
    });

    console.log("filtered...");
    setFilteredScholarships(filtered);
  };

  const handleSaveSettings = async () => {
    try {
      if (didKey) {
        await updateDoc(doc(database, "users", didKey), {
          filters: tempFilters,
          name: name,
          email: email,
        });
        setFilters(tempFilters);

        console.log("Settings saved successfully!");
      } else {
        console.log("No unique ID found. Cannot save settings.");
      }
    } catch (error) {
      console.log("Error saving settings:", error);
    }
  };

  const handleMyScholarshipsClick = () => {
    filterScholarships();
    setViewMode("preferences");
  };

  const handleAllScholarshipsClick = () => {
    setFilteredScholarships(scholarships);
    setViewMode("all");
  };

  const handleSaveScholarship = async (scholarship) => {
    if (didKey) {
      try {
        const scholarshipDocRef = doc(
          database,
          `users/${didKey}/savedScholarships`,
          scholarship.id
        );
        await setDoc(scholarshipDocRef, scholarship);
        console.log("Scholarship saved successfully!");
      } catch (error) {
        console.log("Error saving scholarship:", error);
      }
    } else {
      console.log("No unique ID found. Cannot save scholarship.");
    }
  };

  const handleDeleteScholarship = async (scholarship) => {
    try {
      await deleteDoc(doc(database, "scholarships", scholarship.id));
      setScholarships(scholarships.filter((sch) => sch.id !== scholarship.id));
      setFilteredScholarships(
        filteredScholarships.filter((sch) => sch.id !== scholarship.id)
      );
      console.log("Scholarship deleted successfully!");
    } catch (error) {
      console.log("Error deleting scholarship:", error);
    }
  };

  const handleUpdateScholarship = async (updatedScholarship) => {
    try {
      await updateDoc(
        doc(database, "scholarships", updatedScholarship.id),
        updatedScholarship
      );
      setScholarships(
        scholarships.map((sch) =>
          sch.id === updatedScholarship.id ? updatedScholarship : sch
        )
      );
      setFilteredScholarships(
        filteredScholarships.map((sch) =>
          sch.id === updatedScholarship.id ? updatedScholarship : sch
        )
      );
      console.log("Scholarship updated successfully!");
    } catch (error) {
      console.log("Error updating scholarship:", error);
    }
  };

  const handleOpenSaveModal = (scholarship) => {
    setSelectedScholarship(scholarship);
    onAiDrawerOpen();
  };

  const handleSaveDraft = async (draftContent) => {
    if (selectedScholarship && didKey) {
      try {
        const draftDocRef = doc(
          database,
          `users/${didKey}/drafts`,
          selectedScholarship.id
        );
        await setDoc(draftDocRef, {
          scholarshipId: selectedScholarship.id,
          draftContent,
          originalContent:
            messages.length > 0 ? messages[messages.length - 1].content : "",
          ...selectedScholarship,
        });
        abortResponse();

        setOriginalDraft(
          messages.length > 0 ? messages[messages.length - 1].content : ""
        );
        setExistingDraft(draftContent);
        resetMessages();

        toast({
          title: "Draft Saved.",
          description:
            "The scholarship draft has been added to your drafts collection.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } catch (error) {
        console.log("Error saving draft:", error);
      }
    } else {
      console.log("No scholarship selected or unique ID found.");
    }
  };

  const handleFormSubmit = async () => {
    if (selectedScholarship && didKey) {
      try {
        const scholarshipDocRef = doc(
          database,
          `users/${didKey}/savedScholarships`,
          selectedScholarship.id
        );
        await setDoc(scholarshipDocRef, {
          ...selectedScholarship,
          formText,
        });
        console.log("Form submitted and scholarship saved:", formText);
        onAiDrawerClose();
      } catch (error) {
        console.log("Error submitting form:", error);
      }
    } else {
      console.log("No scholarship selected or unique ID found.");
    }
  };

  const handleViewDraftsClick = () => {
    fetchDrafts();
    setViewMode("drafts");
  };

  const handleViewSavedClick = () => {
    fetchSavedScholarships();
    setViewMode("saved");
  };

  const handleViewAllClick = async () => {
    loadScholarships();
    setViewMode("all");
  };

  const handleRecommendedClick = async () => {
    setIsFetchingUserData(true);
    const userDocRef = await doc(database, "users", didKey);
    const userDoc = await getDoc(userDocRef);

    const userData = userDoc.data();
    const userProfile = {
      name: userData.name,
      email: userData.email,
      filters: userData.filters,
    };

    const prompt = `
          Based on the following user profile: ${JSON.stringify(userProfile)},
          select the top 5 scholarships from the list: ${JSON.stringify(
            scholarships
          )} 
          that best match the user's profile. Return the list of scholarship IDs.

          Return the JSON in the following format:
          response { 
            suggested: [list of scholarship IDs]
          }
        `;

    await transformedSubmitPrompt([{ content: prompt, role: "user" }]).then(
      () => {
        setViewMode("recommended");
      }
    );
  };

  let feedRender = null;
  if (isFetchingUserData) {
    feedRender = (
      <>
        <Box
          padding="6"
          boxShadow="lg"
          borderRadius="md"
          width="100%"
          mt="4"
          ml="0"
        >
          {/* Main Content Skeleton */}
          <VStack spacing="4" align="start">
            <Skeleton
              height="30px"
              width="60%"
              startColor="pink.100"
              endColor="pink.300"
            />
            <Skeleton
              height="20px"
              width="40%"
              startColor="pink.100"
              endColor="pink.300"
            />
            <Skeleton
              height="200px"
              width="100%"
              startColor="pink.100"
              endColor="pink.300"
            />
            {/* Tabs Skeleton */}
            <HStack spacing="4" mb="4">
              <Skeleton
                height="20px"
                width="50px"
                startColor="pink.100"
                endColor="pink.300"
              />
              <Skeleton
                height="20px"
                width="50px"
                startColor="pink.100"
                endColor="pink.300"
              />
              <Skeleton
                height="20px"
                width="50px"
                startColor="pink.100"
                endColor="pink.300"
              />
              <Skeleton
                height="20px"
                width="50px"
                startColor="pink.100"
                endColor="pink.300"
              />
            </HStack>
            <HStack spacing="4" mb="4">
              <Skeleton
                height="40px"
                width="40px"
                startColor="pink.100"
                endColor="pink.300"
              />
              <Skeleton
                height="40px"
                width="40px"
                startColor="pink.100"
                endColor="pink.300"
              />
            </HStack>
            <SkeletonText
              mt="4"
              noOfLines={4}
              spacing="4"
              width="100%"
              startColor="pink.100"
              endColor="pink.300"
            />
          </VStack>
        </Box>
      </>
    );
  } else {
    feedRender = (
      <>
        {isRenderingSpotlight ? (
          <div
            style={{
              paddingTop: 16,
              paddingBottom: 16,
              marginTop: isMobile ? null : "-52px",
            }}
          >
            <Heading as="h3" size="lg">
              Spotlight
            </Heading>
            <ScholarshipList
              scholarships={scholarships.filter((sch) => sch.isSpotlight)}
              onSaveScholarship={handleSaveScholarship}
              onSend={onSend}
              onDelete={handleDeleteScholarship}
              onUpdate={handleUpdateScholarship}
              isAdminMode={isAdminMode}
            />
          </div>
        ) : null}
        <>
          {/* {viewMode === "spotlight" ? null : (
            <Heading as="h3" size="lg">
              {capitalizeFirstLetter(viewMode)}
            </Heading>
          )} */}
          {viewMode === "all" && (
            <ScholarshipList
              scholarships={filteredScholarships}
              onSaveScholarship={handleSaveScholarship}
              onSend={onSend}
              onDelete={handleDeleteScholarship}
              onUpdate={handleUpdateScholarship}
              isAdminMode={isAdminMode}
            />
          )}
          {viewMode === "saved" && (
            <ScholarshipList
              scholarships={savedScholarships}
              onSaveScholarship={handleSaveScholarship}
              onSend={onSend}
              onDelete={handleDeleteScholarship}
              onUpdate={handleUpdateScholarship}
              isAdminMode={isAdminMode}
            />
          )}
          {viewMode === "drafts" && (
            <ScholarshipList
              scholarships={drafts}
              onSaveScholarship={handleSaveScholarship}
              onSend={onSend}
              onDelete={handleDeleteScholarship}
              onUpdate={handleUpdateScholarship}
              isAdminMode={isAdminMode}
            />
          )}

          {viewMode === "recommended" && (
            <ScholarshipList
              scholarships={recommendedScholarships}
              onSaveScholarship={handleSaveScholarship}
              onSend={onSend}
              onDelete={handleDeleteScholarship}
              onUpdate={handleUpdateScholarship}
              isAdminMode={isAdminMode}
            />
          )}
        </>
      </>
    );
  }

  return (
    <Container
      style={{ paddingTop: 12, paddingInlineEnd: 0, paddingInlineStart: 0 }}
    >
      {/* <Banner /> */}
      {/* <Button onClick={onUserProfileOpen}>User Profile</Button> */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link
          href="https://girlsoncampus.org"
          isExternal
          style={{ display: "flex", alignItems: "center" }}
        >
          <Image src={logo_transparent} height="18px" objectFit="cover" />
          &nbsp;Connect
        </Link>
        &nbsp; &nbsp;
        <Button onClick={onUserProfileOpen}>
          <SettingsIcon
            style={{ color: "#C95F8F", textShadow: "3px 3px 3px black" }}
          />
          &nbsp;&nbsp;Settings
        </Button>
      </div>
      <br />
      <br />
      <Box overflowX="auto">
        <ResponsiveTabs
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleViewAllClick={handleViewAllClick}
          handleViewDraftsClick={handleViewDraftsClick}
          handleViewSavedClick={handleViewSavedClick}
          handleMyScholarshipsClick={handleMyScholarshipsClick}
          handleRecommendedClick={handleRecommendedClick}
        >
          {feedRender}
        </ResponsiveTabs>

        {isRenderingSpotlight ? <div>{feedRender}</div> : null}
      </Box>
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={onUserProfileClose}
        didKey={didKey}
        initialName={name}
        initialEmail={email}
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        handleSaveSettings={handleSaveSettings}
        handleSubmitFilters={filterScholarships}
      />
      <AiDrawer
        setExistingDraft={setExistingDraft}
        existingDraft={existingDraft}
        isOpen={isAiDrawerOpen}
        onClose={onAiDrawerClose}
        messages={messages}
        handleFormSubmit={handleFormSubmit}
        resetMessages={resetMessages}
        onSaveDraft={handleSaveDraft}
        isSending={isSending}
        original={originalDraft}
      />
    </Container>
  );
};

export default Feed;
