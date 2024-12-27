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
import { database, model } from "../database/setup";
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
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import UserProfileModal from "./UserProfileModal";
import { useChatCompletion } from "../hooks/useChatCompletion";
import ScholarshipList from "./ScholarshipList";
import AiDrawer from "./AiDrawer";
import ResponsiveTabs from "../elements/ResponsiveTabs";
import { SettingsIcon } from "@chakra-ui/icons";

import logo_transparent from "../assets/logo_transparent.png";
import EditProfileModal from "./EditProfileModal";
import { VscAccount } from "react-icons/vsc";
import ScholarshipDetail from "../pages/ScholarshipDetail";
import { useNavigate, useParams } from "react-router-dom";
import debounce from "lodash/debounce";
import { useSharedNostr } from "../hooks/useNOSTR";
import useDidKeyStore from "../hooks/useDidKeyStore";
import { SiCashapp } from "react-icons/si";
import { WalletModal } from "./WalletModal";

// import logo_transparent from "../assets/logo_transparent.png";

// import { SettingsIcon } from "../assets/settingsIcon";

// const tabOrientation = useBreakpointValue({
//   base: "vertical",
//   md: "horizontal",
// });

const Feed = ({ setDidKey, didKey, isAdminMode }) => {
  let navigate = useNavigate();
  let params = useParams();
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

  const {
    isOpen: isConnectDrawerOpen,
    onOpen: onConnectDrawerOpen,
    onClose: onConnectDrawerClose,
  } = useDisclosure();

  const {
    isOpen: isWalletOpen,
    onOpen: onWalletOpen,
    onClose: onWalletClose,
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
  const [description, setDescription] = useState("");
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

  const [fireScholarshipResponse, setFireScholarshipResponse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allScholarships, setAllScholarships] = useState([]);

  const { auth } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );
  const { enableSecretMode, secretMode } = useDidKeyStore();

  const fetchGoogleAI = async (scholarship, userData) => {
    // Provide a prompt that contains text
    // const prompt = "Write a story about a magic backpack.";

    const prompt = `Draft a high quality scholarship essay in clean minimalist markdown without headers. The following JSON tells you more about the scholarship, with the meta field providing direct information from the creator ${JSON.stringify(
      scholarship
    )} Additionally, the user may have provided information about them personally, to make the essay draft more realistic. ${JSON.stringify(
      userData
    )}`;

    // To stream generated text output, call generateContentStream with the text input
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
      setFireScholarshipResponse((prevText) => prevText + chunkText);
    }

    console.log("aggregated response: ", await result.response);
  };

  const onSend = async (scholarship) => {
    setIsSending(true);
    setSelectedScholarship(scholarship);
    handleOpenSaveModal(scholarship);

    const draftDocRef = doc(database, `users/${didKey}/drafts`, scholarship.id);
    const draftDoc = await getDoc(draftDocRef);

    const userDocRef = await doc(database, "users", didKey);
    const userDoc = await getDoc(userDocRef);

    const userData = userDoc.data();

    if (draftDoc?.exists()) {
      const draftData = draftDoc.data();
      setExistingDraft(draftData.draftContent);
      setOriginalDraft(draftData?.originalContent);
      setFormText(draftData.draftContent);
      setIsSending(false);
    } else {
      // await submitPrompt([
      //   {
      //     content: `Draft a high quality scholarship essay in clean minimalist markdown without headers.

      //     The following JSON tells you more about the scholarship, with the meta field providing direct information from the creator ${JSON.stringify(
      //       scholarship
      //     )}

      //     Additionally, the user may have provided information about them personally, to make the essay draft more realistic. ${JSON.stringify(
      //       userData
      //     )}
      //     `,

      //     role: "user",
      //   },
      // ]);

      fetchGoogleAI(scholarship, userData);
      setPromptData("");

      setIsSending(false);
    }
    // } catch (error) {
    //   console.log("error", { error });
    //   setIsSending(false);
    // }
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
        setDescription(userData.description || "");
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

  const fetchUserDataNoLoading = async () => {
    const id = didKey;
    try {
      const userDocRef = await doc(database, "users", id);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.name || "");
        setEmail(userData.email || "");
        setDescription(userData.description || "");
        if (userData.filters) {
          setTempFilters(userData.filters);
          setFilters(userData.filters);
        }
      }
    } catch (error) {
      // setIsFetchingUserData(false);
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
        setViewMode("drafts");
      } catch (error) {
        console.log("Error fetching drafts:", error);
      }
    }
  };

  const fetchSavedScholarships = async () => {
    setIsRenderingSpotlight(false);

    if (didKey) {
      try {
        console.log("DID KEY?", didKey);
        const savedQuery = query(
          collection(database, `users/${didKey}/savedScholarships`)
        );
        const querySnapshot = await getDocs(savedQuery);
        const loadedSavedScholarships = querySnapshot.docs.map((doc) => {
          console.log("doc...", doc);
          return {
            id: doc.id,
            ...doc.data(),
          };
        });

        setSavedScholarships(loadedSavedScholarships);
        setViewMode("saved");
      } catch (error) {
        console.log("Error fetching saved scholarships:", error);
      }
    }
  };

  useEffect(() => {
    let getKeys = async () => {
      let keySet = await auth(localStorage.getItem("local_nsec"));

      console.log("keysetnpub", keySet);
      if (
        keySet.user.npub ===
        // "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt"
        "npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2"
      ) {
        enableSecretMode();
      }
    };

    getKeys();
  }, []);

  useEffect(() => {
    setIsRenderingSpotlight(true);
    fetchUserData();
    loadScholarships(); // Don’t pass true or false here
  }, [didKey]);

  useEffect(() => {
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

  useEffect(() => {
    console.log("query...", searchQuery);
    // If we have no scholarships loaded yet, just skip
    // if (!scholarships || scholarships.length === 0) return;
    console.log("cont...");
    if (searchQuery.trim() && searchQuery.length > 0) {
      console.log("THE QUERY IS EMPTY", searchQuery === "");
      // 1) Global search: search across ALL scholarships, ignoring viewMode & filters
      const lowerQuery = searchQuery.toLowerCase();
      const results = allScholarships.filter((sch) =>
        JSON.stringify(sch).toLowerCase().includes(lowerQuery)
      );
      setFilteredScholarships(results);
    } else {
      // 2) NO search query? Fallback to your normal display logic
      //    (You can decide if you want to show spotlight only, filters, etc.)
      if (viewMode === "spotlight") {
        setFilteredScholarships(
          allScholarships.filter((sch) => sch.isSpotlight)
        );
      } else if (viewMode === "saved") {
        // For example, setFilteredScholarships(savedScholarships)...
        setFilteredScholarships(savedScholarships);
      } else if (viewMode === "drafts") {
        // setFilteredScholarships(drafts)...
        setFilteredScholarships(drafts);
      } else if (viewMode === "recommended") {
        // setFilteredScholarships(recommendedScholarships)...
        setFilteredScholarships(recommendedScholarships);
      } else {
        // e.g. "all"
        setFilteredScholarships(allScholarships);
      }
    }
  }, [searchQuery]);
  // Always load all scholarships in one go
  const loadScholarships = async (view = "spotlight") => {
    setViewMode(view);
    if (view !== "spotlight") {
      setIsRenderingSpotlight(false);
    }
    try {
      const q = query(collection(database, "scholarships"));
      const querySnapshot = await getDocs(q);
      const loadedScholarships = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Store them in allScholarships
      setAllScholarships(loadedScholarships);

      // By default, maybe show "spotlight" if your initial viewMode is "spotlight"
      // but you *still* keep the entire dataset in `allScholarships`
      console.log("VIEW MODE?", viewMode);
      if (viewMode === "spotlight") {
        console.log("Its spot");
        console.log("LOADED SCHOLARSHIPS", loadedScholarships);
        setFilteredScholarships(
          loadedScholarships.filter((sch) => sch.isSpotlight)
        );
      } else {
        setFilteredScholarships(loadedScholarships);
      }
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
    setViewMode("preferences");
    filterScholarships();
  };

  const handleAllScholarshipsClick = () => {
    setViewMode("all");
    setFilteredScholarships(scholarships);
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
          zIndex: 100000,
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
    fetchDrafts("drafts");
  };

  const handleViewSavedClick = async () => {
    fetchSavedScholarships("saved");
  };

  const handleViewAllClick = async () => {
    setViewMode("all");
    loadScholarships("all");
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

  // alert(!(viewMode === "spotlight"));
  // alert(params.scholarshipID && viewMode !== "spotlight");
  // alert(params.scholarshipID && viewMode === "spotlight");

  console.log("seecert mode", secretMode);

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
        {params.scholarshipID && viewMode === "spotlight" ? (
          <ScholarshipDetail
            didKey={didKey}
            scholarships={filteredScholarships}
            handleSaveScholarship={handleSaveScholarship}
            onSend={onSend}
            onDelete={handleDeleteScholarship}
            onUpdate={handleUpdateScholarship}
            isAdminMode={isAdminMode}
          />
        ) : isRenderingSpotlight ? (
          <div
            style={{
              paddingTop: 16,
              paddingBottom: 16,
              marginTop: isMobile ? null : "-52px",
            }}
          >
            <Heading
              as="h3"
              size="lg"
              // border="1px solid red"
            >
              Spotlight
            </Heading>
            <ScholarshipList
              scholarships={filteredScholarships}
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
      width="100%"
      position="relative"
      style={{ paddingTop: 12, paddingInlineEnd: 0, paddingInlineStart: 0 }}
    >
      {/* <Banner /> */}
      {/* <Button onClick={onUserProfileOpen}>User Profile</Button> */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          // justifyContent: "flex-end",

          padding: 8,
          // position: "fixed",

          width: "100%",
          maxWidth: 606,

          borderRadius: 4,
          top: 0,

          position: "fixed",
          backgroundColor: "pink",
          zIndex: 2,
        }}
      >
        <Box display="flex" alignItems={"center"} width="100%">
          {/* <Link
          href="https://girlsoncampus.org"
          isExternal
          style={{ display: "flex", alignItems: "center" }}
        >
          <Image src={logo_transparent} height="18px" objectFit="cover" />
          &nbsp;Connect
        </Link> */}
          <Box
            width={50}
            as="img"
            src={logo_transparent}
            borderRadius="34%"
            style={{ cursor: "pointer" }}
            onClick={() => {
              navigate(`/`);
            }}
          />
          &nbsp; &nbsp;
          <Button
            onClick={onUserProfileOpen}
            boxShadow="0.5px 0.5px 1px 0px black"
          >
            <VscAccount
              style={{ color: "#C95F8F", textShadow: "3px 3px 3px black" }}
            />

            {/* <SettingsIcon
            style={{ color: "#C95F8F", textShadow: "3px 3px 3px black" }}
          /> */}
            {/* &nbsp;&nbsp;Settings */}
          </Button>
          &nbsp;&nbsp;
          <Button
            onClick={onConnectDrawerOpen}
            boxShadow="0.5px 0.5px 1px 0px black"
          >
            <SettingsIcon
              style={{ color: "#C95F8F", textShadow: "3px 3px 3px black" }}
            />
          </Button>
          &nbsp;&nbsp;
          {secretMode ? (
            <Button
              onClick={onWalletOpen}
              boxShadow="0.5px 0.5px 1px 0px black"
            >
              <SiCashapp
                style={{ color: "#C95F8F", textShadow: "3px 3px 3px black" }}
              />
            </Button>
          ) : null}
          <Box flex="1" ml={4} width="100%">
            <input
              type="text"
              placeholder={
                !(viewMode === "spotlight" || viewMode === "all")
                  ? "Search disabled"
                  : "Search scholarships..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
              disabled={!(viewMode === "spotlight" || viewMode === "all")}
            />
          </Box>
        </Box>
      </div>

      <Box overflowX="auto" mt={16}>
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
        {viewMode === "spotlight" ? <div>{feedRender}</div> : null}
      </Box>
      {isUserProfileOpen ? (
        <EditProfileModal
          fetchUserDataNoLoading={fetchUserDataNoLoading}
          isOpen={isUserProfileOpen}
          onClose={onUserProfileClose}
          setDidKey={setDidKey}
          didKey={didKey}
          initialName={name}
          initialEmail={email}
          initialDescription={description}
          tempFilters={tempFilters}
          setTempFilters={setTempFilters}
          handleSaveSettings={handleSaveSettings}
          handleSubmitFilters={filterScholarships}
        />
      ) : null}

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
        fireScholarshipResponse={fireScholarshipResponse}
      />

      <Drawer
        isOpen={isConnectDrawerOpen}
        placement="right"
        onClose={onConnectDrawerClose}
      >
        {/* <DrawerOverlay /> */}
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Settings</DrawerHeader>

          <DrawerBody>
            <VStack spacing={4}>
              {/* Example Connect Link Buttons */}
              <Link
                href="https://girlsoncampus.org"
                isExternal
                style={{ display: "flex", alignItems: "center" }}
              >
                <Image src={logo_transparent} height="18px" objectFit="cover" />
                &nbsp;Connect
              </Link>
              {/* <Button onClick={() => console.log("Link 2 Selected")}>
                Connect Link 2
              </Button>
              <Button onClick={() => console.log("Link 3 Selected")}>
                Connect Link 3
              </Button> */}
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onConnectDrawerClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {isWalletOpen ? (
        <WalletModal isOpen={isWalletOpen} onClose={onWalletClose} />
      ) : null}
    </Container>
  );
};

export default Feed;
