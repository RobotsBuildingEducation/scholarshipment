// Feed.jsx

import React, { useState, useEffect, useMemo } from "react";

import {
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { database, model } from "../database/setup";
import {
  Container,
  Heading,
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
  Checkbox,
  Stack,
  FormControl,
  FormLabel,
  Input as ChakraInput,
  Slider,
  SliderFilledTrack,
  SliderTrack,
  SliderThumb,
  Select,
  Text,
} from "@chakra-ui/react";

import { useChatCompletion } from "../hooks/useChatCompletion";
import ScholarshipList from "./ScholarshipList";
import AiDrawer from "./AiDrawer";
import ResponsiveTabs from "../elements/ResponsiveTabs";

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
import { useSimpleGeminiChat } from "../hooks/useGeminiChat";
import { InstallAppModal } from "./InstallModal";
import { TbFilterSearch } from "react-icons/tb";
import { IoAppsOutline } from "react-icons/io5";
import { LuDownload } from "react-icons/lu";
import { LoanInfoModal } from "./LoanInfoModal";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaInfoCircle } from "react-icons/fa";
import { ScholarshipSearchModal } from "./ScholarshipSearchModal";

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
    isOpen: isInstallModalOpen,
    onOpen: onInstallModalOpen,
    onClose: onInstallModalClose,
  } = useDisclosure();

  const {
    isOpen: isLoanInfoModalOpen,
    onOpen: onLoanInfoOpen,
    onClose: onLoanInfoClose,
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

  const [selectedCollection, setSelectedCollection] = useState("scholarships");

  const [isControlFilterActive, setIsControlFilterActive] = useState(false);
  const [filters, setFilters] = useState({
    amount: 10000, // maximum amount filter (if applicable)
    isHighschool: false, // if true, only show high school scholarships
    isCollege: false, // if true, only show college scholarships
    isUnderserved: false, // if true, only show underserved scholarships
    isInternational: false, // if true, only show international scholarships
    dueDate: "", // optional due date filter
  });

  const isMobile = useBreakpointValue({ base: true, md: false });
  const [localInput, setLocalInput] = useState("");

  const [suggestedScholarships, setSuggestedScholarships] = useState([]);
  const [isFetchingUserData, setIsFetchingUserData] = useState(false);
  const [scholarships, setScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [savedScholarships, setSavedScholarships] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isRenderingSpotlight, setIsRenderingSpotlight] = useState(true);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [formText, setFormText] = useState("");
  const [existingDraft, setExistingDraft] = useState(null);
  const [originalDraft, setOriginalDraft] = useState(null);
  const {
    messages,
    submitPrompt,
    resetMessages,
    abortPrompt,
    //  abortResponse
  } = useSimpleGeminiChat();
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

  const onSend = async (scholarship, generating = false) => {
    setIsSending(true);
    setSelectedScholarship(scholarship);
    handleOpenSaveModal(scholarship);

    const draftDocRef = doc(database, `users/${didKey}/drafts`, scholarship.id);
    const draftDoc = await getDoc(draftDocRef);

    const userDocRef = await doc(database, "users", didKey);
    const userDoc = await getDoc(userDocRef);

    const userData = userDoc.data();

    if (draftDoc?.exists() && !generating) {
      const draftData = draftDoc.data();
      setExistingDraft(draftData.draftContent);
      setOriginalDraft(draftData?.originalContent);
      setFormText(draftData.draftContent);
      setIsSending(false);

      // setFireScholarshipResponse(draftData);
    } else {
      resetMessages();
      setExistingDraft("");
      setOriginalDraft("");
      setFormText("");
      const prompt = `Draft a high quality scholarship essay in clean minimalist markdown without headers. The following JSON tells you more about the scholarship, with the meta field providing direct information from the creator ${JSON.stringify(
        scholarship
      )} Additionally, the user may have provided information about them personally, to make the essay draft more realistic. ${JSON.stringify(
        userData
      )}
      
Draft a high quality scholarship essay in clean minimalist markdown without headers. This scholarship should be realistic but professional. The following JSON tells you more about the scholarship, with the meta field providing direct information from the creator ${JSON.stringify(
        scholarship
      )} Additionally, the user may have provided information about them personally, ${JSON.stringify(
        userData
      )}
    
    Reflect deeply on your personal background, goals, and contributions to your community. In your response, aim to weave a compelling story that highlights the following elements:

1. Personal Story and Motivation
- Share formative childhood or life experiences that shaped your ambition and character.
- Explain why you chose your major or future career path and how it connects to your personal journey.

2. Overcoming Challenges
- Describe any adversity—financial, cultural, educational, or personal—you’ve faced, and explain how these obstacles influenced your growth.
- Illustrate the steps you’ve taken to address or triumph over these barriers.

3. Leadership and Initiative
- Highlight moments where you took the lead, whether at school, in clubs, in the community, or at work.
- Emphasize how you brought people together, organized events, or created new solutions to support others.

4. Community Engagement and Service
- Share the ways you give back—volunteering, mentorship, activism, or any initiatives you launched.
- Discuss the impact of these efforts and how they align with your core values and future ambitions.

5. Academic and Professional Development
- Talk about significant achievements (awards, internships, fellowships, clubs) and what you learned from those experiences.
- If applicable, detail your plans for further certifications or advanced degrees and why they are essential to your goals.

6. Vision for the Future
- Describe your long-term aspirations, both professionally and personally.
- Explain how you plan to use your skills, education, and network to create positive change in your field or community.

7. Financial Need and Determination
- If relevant, address any financial challenges you face.
- Convey how this scholarship support will help you focus on academics, service, and leadership, ultimately boosting your ability to give back.

8. Guidelines
Provide specific examples or anecdotes to illustrate your key points.
Show genuine passion and reflect on what drives you beyond just academic success.
Demonstrate your capacity for growth, adaptability, and commitment to ethical leadership.


Finally and most importantly: Aim for a tone that is honest, professional and forward-looking - be absolutely certin to avoid generic or poetic expressions about identity or perspective.
      `;
      submitPrompt(prompt);

      // setFireScholarshipResponse("");

      // fetchGoogleAI(scholarship, userData);
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
        // if (userData.filters) {
        //   setFilters(userData.filters);
        // }
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
        // if (userData.filters) {
        //   setFilters(userData.filters);
        // }
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
        const savedRef = collection(database, `users/${didKey}/drafts`);
        const savedQuery = query(savedRef, orderBy("dateSaved", "desc"));

        const querySnapshot = await getDocs(savedQuery);
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
        const savedRef = collection(
          database,
          `users/${didKey}/savedScholarships`
        );

        const savedQuery = query(savedRef, orderBy("dateSaved", "desc"));

        const querySnapshot = await getDocs(savedQuery);
        const loadedSavedScholarships = querySnapshot.docs.map((doc) => {
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

  // useEffect(() => {
  //   if (viewMode === "spotlight") {
  //     loadScholarships();
  //   }
  // }, [viewMode]);

  useEffect(() => {
    if (transformedMessages.length > 0) {
      if (transformedMessages[transformedMessages.length - 1].meta.done) {
        const recommendedIds = JSON.parse(
          transformedMessages[transformedMessages.length - 1].content
        ).response.suggested;

        const recommendedList = scholarships.filter((sch) =>
          recommendedIds.includes(sch.id)
        );

        setRecommendedScholarships(recommendedList);

        setIsFetchingUserData(false);
      }
    }
  }, [transformedMessages]);

  useEffect(() => {
    // If we have no scholarships loaded yet, just skip
    // if (!scholarships || scholarships.length === 0) return;

    setIsControlFilterActive(false);
    clearFilters();

    if (
      (isRenderingSpotlight && searchQuery.length > 0) ||
      viewMode === "drafts" ||
      viewMode === "saved"
    ) {
      setIsRenderingSpotlight(false);
      setViewMode("all");
    }

    if (searchQuery.trim() && searchQuery.length > 0) {
      // 1) Global search: search across ALL scholarships, ignoring viewMode & filters
      const lowerQuery = searchQuery.toLowerCase();
      const results = allScholarships.filter((sch) => {
        // console.log("filtering scholarship...", json.stringify)

        return JSON.stringify(sch).toLowerCase().includes(lowerQuery);
      });

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
  const loadScholarships = async (
    view = "spotlight",
    isCollectionSwitch = false
  ) => {
    function parseAsEndOfDay(dateStr) {
      // dateStr is "YYYY-MM-DD"
      const [year, month, day] = dateStr.split("-").map(Number);
      // Create a local date at 23:59:59.999 of that day
      return new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    // window.alert("ok");

    setViewMode(view);

    const now = new Date();

    if (view !== "spotlight") {
      setIsRenderingSpotlight(false);
    }

    if (allScholarships.length < 1 || isCollectionSwitch) {
      try {
        // const q = query(collection(database, "scholarships"));
        const q = query(collection(database, selectedCollection));
        const querySnapshot = await getDocs(q);
        const loadedScholarships = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const expired = loadedScholarships.filter((sch) => {
          if (!sch.dueDate) return false; // up to you: treat no dueDate as never expiring, or handle differently
          const dueLocalEOD = parseAsEndOfDay(sch.dueDate);

          return dueLocalEOD < now;
        });

        const nonExpired = loadedScholarships.filter((sch) => {
          if (!sch.dueDate) return true; // keep if no dueDate
          if (sch.dueDate.includes("Error: Invalid date format")) {
            return true;
          }
          const dueLocalEOD = parseAsEndOfDay(sch.dueDate);

          return dueLocalEOD >= now;
        });

        setAllScholarships(nonExpired);

        // By default, maybe show "spotlight" if your initial viewMode is "spotlight"
        // but you *still* keep the entire dataset in `allScholarships`

        if (view === "spotlight") {
          let spotlightScholarships = loadedScholarships.filter(
            (sch) => sch.isSpotlight
          );
          setFilteredScholarships(spotlightScholarships);

          for (const expScholarship of expired) {
            // Copy to "archivedScholarships"

            const archivedRef = doc(
              database,
              "archivedScholarships",
              expScholarship.id
            );
            await setDoc(archivedRef, {
              ...expScholarship,
              archivedAt: new Date(),
            });

            // Remove from original "scholarships"
            const originalRef = doc(
              database,
              // "scholarships",
              selectedCollection,
              expScholarship.id
            );
            await deleteDoc(originalRef);
          }

          if (spotlightScholarships.length === 0) {
            setIsRenderingSpotlight(false);
            setViewMode("all");
          }
        } else {
          setFilteredScholarships(loadedScholarships);
        }
      } catch (error) {
        console.log("error loading scholarships", error);
      }
    } else {
      const now = new Date();
      const nonExpired = allScholarships.filter((sch) => {
        if (!sch.dueDate) return true;
        const dueLocalEOD = parseAsEndOfDay(sch.dueDate);
        return dueLocalEOD >= now;
      });

      setAllScholarships(nonExpired);
      setFilteredScholarships(nonExpired);
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

    setFilteredScholarships(filtered);
  };

  const handleSaveSettings = async () => {
    try {
      if (didKey) {
        await updateDoc(doc(database, "users", didKey), {
          name: name,
          email: email,
        });
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

        await setDoc(scholarshipDocRef, {
          ...scholarship,
          dateSaved: serverTimestamp(), // Store a server-generated timestamp
        });
      } catch (error) {
        console.log("Error saving scholarship:", error);
      }
    } else {
      console.log("No unique ID found. Cannot save scholarship.");
    }
  };

  const handleDeleteScholarship = async (scholarship) => {
    try {
      // await deleteDoc(doc(database, "scholarships", scholarship.id));
      await deleteDoc(doc(database, selectedCollection, scholarship.id));

      setScholarships(scholarships.filter((sch) => sch.id !== scholarship.id));
      setFilteredScholarships(
        filteredScholarships.filter((sch) => sch.id !== scholarship.id)
      );
      console.log("Scholarship deleted successfully!");
    } catch (error) {
      console.log("Error deleting scholarship:", error);
    }
  };

  const removeFromSaved = async (scholarship, collectionType) => {
    let list =
      collectionType === "saved"
        ? "savedScholarships"
        : collectionType === "drafts"
        ? "drafts"
        : "spotlight";
    if (list === "savedScholarships" || list === "drafts") {
      try {
        await deleteDoc(
          doc(database, `users/${didKey}/${list}`, scholarship.id)
        );

        // Update state after removal
        if (list === "savedScholarships") {
          setSavedScholarships((prev) =>
            prev.filter((sch) => sch.id !== scholarship.id)
          );
          setFilteredScholarships((prev) =>
            prev.filter((sch) => sch.id !== scholarship.id)
          );
        } else if (list === "drafts") {
          setDrafts((prev) => prev.filter((sch) => sch.id !== scholarship.id));
          setFilteredScholarships((prev) =>
            prev.filter((sch) => sch.id !== scholarship.id)
          );
        }
      } catch (error) {
        console.log("Error removing scholarship from saved:", error);
      }
    } else {
      try {
        // const docRef = doc(database, "scholarships", scholarship.id);
        const docRef = doc(database, selectedCollection, scholarship.id);
        await updateDoc(docRef, { isSpotlight: false });

        // Optionally update your local states so the UI
        // doesn't still show it as spotlight
        setAllScholarships((prev) =>
          prev.map((sch) =>
            sch.id === scholarship.id ? { ...sch, isSpotlight: false } : sch
          )
        );
        // If you prefer to remove it entirely from the filtered list:
        setFilteredScholarships((prev) =>
          prev.filter((sch) => sch.id !== scholarship.id)
        );

        console.log("Scholarship removed from spotlight!");
      } catch (error) {
        console.log("Error removing scholarship from spotlight:", error);
      }
    }
  };

  const handleUpdateScholarship = async (updatedScholarship) => {
    try {
      // await updateDoc(
      //   doc(database, "scholarships", updatedScholarship.id),
      //   updatedScholarship
      // );
      await updateDoc(
        doc(database, selectedCollection, updatedScholarship.id),
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
          dateSaved: serverTimestamp(), // Store a server-generated timestamp
          scholarshipId: selectedScholarship.id,
          originalContent:
            messages.length > 0 ? messages[messages.length - 1].content : "",
          ...selectedScholarship,
          draftContent: draftContent,
        });
        // abortResponse();

        setOriginalDraft(
          messages.length > 0 ? messages[messages.length - 1].content : ""
        );
        setExistingDraft(draftContent);
        // resetMessages();

        // toast({
        //   title: "Draft Saved.",
        //   description:
        //     "The scholarship draft has been added to your drafts collection.",
        //   status: "success",
        //   duration: 3000,
        //   isClosable: true,
        //   position: "top",
        //   zIndex: 100000,
        // });
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

        onAiDrawerClose();
      } catch (error) {
        console.log("Error submitting form:", error);
      }
    } else {
      console.log("No scholarship selected or unique ID found.");
    }
  };

  const handleViewDraftsClick = () => {
    setIsControlFilterActive(false);

    setLocalInput("");

    setSearchQuery("");
    navigate("/");

    fetchDrafts("drafts");
  };

  const handleViewSavedClick = async () => {
    setIsControlFilterActive(false);
    setLocalInput("");
    setSearchQuery("");
    navigate("/");
    fetchSavedScholarships("saved");
  };

  const handleViewAllClick = () => {
    setLocalInput("");
    setSearchQuery("");
    navigate("/");
    setViewMode("all");

    setIsRenderingSpotlight(false);
    if (allScholarships.length < 1) {
      loadScholarships("all");
    } else {
      // setFilteredScholarships(allScholarships);
    }
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

  const applyFilters = () => {
    if (isRenderingSpotlight || viewMode === "drafts" || viewMode === "saved") {
      setViewMode("all");
    }
    setIsRenderingSpotlight(false);

    if (
      !filters.isCollege &&
      !filters.isUnderserved &&
      !filters.isHighschool &&
      !filters.isInternational
    ) {
      setFilteredScholarships(allScholarships);
    } else {
      const filtered = allScholarships.filter((scholarship) => {
        // Convert the entire scholarship object to a lower-case string
        const scholarshipStr = JSON.stringify(scholarship).toLowerCase();

        // Check the scholarship amount filter
        const amount = scholarship.amount;
        // if (amount > filters.amount) return false;

        // For each boolean filter, if active, verify that the corresponding keyword exists in the scholarship object string
        let filted = false;

        if (
          filters.isCollege &&
          (/\b(?:college|university)\b/i.test(scholarshipStr) ||
            scholarship.isCollege) &&
          amount <= filters.amount
        ) {
          filted = true;
        }

        if (
          filters.isHighschool &&
          (/\b(?:high school|hs)\b/i.test(scholarshipStr) ||
            scholarship.isHighschool) &&
          amount <= filters.amount
        ) {
          filted = true;
        }

        if (
          filters.isUnderserved &&
          (/\b(?:underserved|daca|undocumented|minority|women|woman|indigenous|black|latina|latino|hbcu|disability)\b/i.test(
            scholarshipStr
          ) ||
            scholarship.isUnderserved) &&
          amount <= filters.amount
        ) {
          filted = true;
        }

        if (
          filters.isInternational &&
          (/\binternational\b/i.test(scholarshipStr) ||
            scholarship.isInternational) &&
          amount <= filters.amount
        ) {
          filted = true;
        }

        // Check due date filter if it's set
        if (filters.dueDate) {
          const selectedDate = new Date(filters.dueDate);
          if (scholarship.dueDate) {
            const scholarshipDue = new Date(scholarship.dueDate);
            if (scholarshipDue > selectedDate) return false;
          }
        }

        return filted;
      });

      setFilteredScholarships(filtered);
    }
  };

  // useEffect(() => {
  //   if (viewMode !== "spotlight" && isControlFilterActive) {
  //     condolr.log("xx", isControlFilterActive)
  //     console.log("xyyzxyzy");
  //     applyFilters();
  //   }
  // }, [filters, allScholarships]);

  useEffect(() => {
    if (isControlFilterActive) {
      applyFilters();
    }
  }, [filters, isControlFilterActive]);

  // alert(!(viewMode === "spotlight"));
  // alert(params.scholarshipID && viewMode !== "spotlight");
  // alert(params.scholarshipID && viewMode === "spotlight");

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
              padding: 16,

              marginTop: isMobile ? null : "-0px",
            }}
          >
            <Heading
              as="h3"
              size="lg"
              mb={"-8"}
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
              removeFromSaved={removeFromSaved}
              secretMode={secretMode}
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
              scholarships={
                searchQuery.length > 0 || isControlFilterActive
                  ? filteredScholarships
                  : allScholarships
              }
              onSaveScholarship={handleSaveScholarship}
              onSend={onSend}
              onDelete={handleDeleteScholarship}
              onUpdate={handleUpdateScholarship}
              isAdminMode={isAdminMode}
              removeFromSaved={removeFromSaved}
            />
          )}
          {viewMode === "saved" && (
            <ScholarshipList
              scholarships={
                searchQuery.length > 0
                  ? filteredScholarships
                  : savedScholarships
              }
              onSaveScholarship={handleSaveScholarship}
              onSend={onSend}
              onDelete={handleDeleteScholarship}
              onUpdate={handleUpdateScholarship}
              isAdminMode={isAdminMode}
              viewMode={viewMode}
              removeFromSaved={removeFromSaved}
            />
          )}
          {viewMode === "drafts" && (
            <ScholarshipList
              scholarships={
                searchQuery.length > 0 ? filteredScholarships : drafts
              }
              onSaveScholarship={handleSaveScholarship}
              onSend={onSend}
              onDelete={handleDeleteScholarship}
              onUpdate={handleUpdateScholarship}
              isAdminMode={isAdminMode}
              viewMode={viewMode}
              removeFromSaved={removeFromSaved}
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
              removeFromSaved={removeFromSaved}
            />
          )}
        </>
      </>
    );
  }

  const debouncedOnChange = useMemo(() => {
    return debounce((value) => setSearchQuery(value), 300);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localInput);
    }, 300);

    // Cancel the timeout if localInput changes again before 300ms
    return () => clearTimeout(handler);
  }, [localInput]);

  const handleInputChange = (e) => {
    // Update input immediately
    setLocalInput(e.target.value);
  };

  useEffect(() => {
    if (!isAiDrawerOpen) {
      resetMessages();
    }
  }, [isAiDrawerOpen]);

  const clearFilters = () => {
    const defaultFilters = {
      amount: 5000,
      isHighschool: false,
      isCollege: false,
      isUnderserved: false,
      isInternational: false,
      dueDate: "",
    };

    setFilters({ ...defaultFilters });
  };

  useEffect(() => {
    let runSwitchCollection = async () => {
      setSearchQuery("");
      setLocalInput("");
      setIsControlFilterActive(false);
      clearFilters(); // Reset the filters visually

      setIsFetchingUserData(true);
      setAllScholarships([]);
      await loadScholarships("all", true);
      setIsFetchingUserData(false);
    };

    if (!isRenderingSpotlight) {
      runSwitchCollection();
    }
  }, [selectedCollection]);

  return (
    <>
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
            paddingBottom: 0,
            // position: "fixed",

            width: "100%",
            maxWidth: 606,

            borderRadius: 4,
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            top: 0,

            position: "fixed",
            background: "#faf2f4",
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
                setLocalInput("");
                setSearchQuery("");
                setViewMode("spotlight");
                setIsRenderingSpotlight(true);

                navigate(`/`);
              }}
            />
            {/* <Button
            onClick={onUserProfileOpen}
            boxShadow="0.5px 0.5px 1px 0px black"
          >
            <VscAccount
              style={{ color: "#C95F8F", textShadow: "3px 3px 3px black" }}
            /> */}
            {/* <SettingsIcon
            style={{ color: "#C95F8F", textShadow: "3px 3px 3px black" }}
          /> */}
            {/* &nbsp;&nbsp;Settings */}
            {/* </Button> */}
            {/* &nbsp;&nbsp;  
          {secretMode ? (
  
          ) : null} */}
            &nbsp;&nbsp;
            <ScholarshipSearchModal didKey={didKey} />
            <Box flex="1" ml={4} width="100%">
              <input
                type="text"
                placeholder={"Search"}
                // value={searchQuery}
                // onChange={(event) => debouncedOnChange(event.target.value)}

                value={localInput}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
                // disabled={!(viewMode === "spotlight" || viewMode === "all")}
              />
            </Box>
            <Button
              ml={2}
              onClick={onFiltersOpen}
              boxShadow="0.5px 0.5px 1px 0px black"
            >
              <TbFilterSearch
                style={{ color: "#C95F8F", textShadow: "3px 3px 3px black" }}
              />
            </Button>
            &nbsp;&nbsp;
            <Button
              onClick={onConnectDrawerOpen}
              boxShadow="0.5px 0.5px 1px 0px black"
            >
              <IoAppsOutline
                style={{ color: "#C95F8F", textShadow: "3px 3px 3px black" }}
              />
            </Button>
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
            loadScholarships={loadScholarships}
            setSelectedCollection={setSelectedCollection}
            selectedCollection={selectedCollection}
            setIsRenderingSpotlight={setIsRenderingSpotlight}
          >
            {feedRender}
          </ResponsiveTabs>
          {viewMode === "spotlight" ? <Box>{feedRender}</Box> : null}
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
            handleSaveSettings={handleSaveSettings}
            handleSubmitFilters={filterScholarships}
          />
        ) : null}

        {isAiDrawerOpen ? (
          <AiDrawer
            abortPrompt={abortPrompt}
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
            onSend={onSend}
            selectedScholarship={selectedScholarship}
            // fireScholarshipResponse={fireScholarshipResponse}
            // setFireScholarshipResponse={setFireScholarshipResponse}
          />
        ) : null}

        {isInstallModalOpen ? (
          <InstallAppModal
            isOpen={isInstallModalOpen}
            onClose={onInstallModalClose}
          />
        ) : null}

        {isLoanInfoModalOpen ? (
          <LoanInfoModal
            isOpen={isLoanInfoModalOpen}
            onClose={onLoanInfoClose}
          />
        ) : null}

        <Drawer
          isOpen={isFiltersOpen}
          placement="right"
          onClose={onFiltersClose}
          blockScrollOnMount={false}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader display="flex" alignItems={"center"}>
              {" "}
              <TbFilterSearch />
              &nbsp; More Filter Controls
            </DrawerHeader>

            <DrawerBody>
              {/* Scholarship Amount Filter */}

              {/* Due Date Filter */}
              {selectedCollection === "careers" ? null : (
                <FormControl mb={6}>
                  <FormLabel>Due Dates Up To</FormLabel>
                  <ChakraInput
                    type="date"
                    value={filters.dueDate}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }));
                      setIsControlFilterActive(true);
                    }}
                  />
                </FormControl>
              )}
              {selectedCollection === "careers" ? null : (
                <FormControl mb={6}>
                  <FormLabel>Scholarship Amount (Maximum)</FormLabel>
                  <HStack spacing={4}>
                    <Box flex="1">
                      <Slider
                        colorScheme="pink"
                        min={0}
                        max={50000}
                        step={500}
                        value={filters.amount}
                        onChange={(val) => {
                          setFilters((prev) => ({ ...prev, amount: val }));
                          setIsControlFilterActive(true);
                        }}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </Box>
                    {/* <Box width="100px">
                <ChakraInput
                  type="number"
                  value={filters.amount}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                />
              </Box> */}
                  </HStack>
                  <Box mt={2} fontSize="sm" color="gray.600">
                    Selected Maximum Amount: ${filters.amount}
                  </Box>
                </FormControl>
              )}

              {/* Boolean Filters */}
              <FormControl mb={6}>
                <FormLabel>Scholarship Categories</FormLabel>
                <Stack spacing={2}>
                  <Checkbox
                    colorScheme="pink"
                    isChecked={filters.isHighschool}
                    onChange={(e) => {
                      setIsControlFilterActive(true);

                      setFilters((prev) => ({
                        ...prev,
                        isHighschool: e.target.checked,
                      }));
                    }}
                  >
                    High School
                  </Checkbox>
                  <Checkbox
                    colorScheme="pink"
                    isChecked={filters.isCollege}
                    onChange={(e) => {
                      setIsControlFilterActive(true);
                      setFilters((prev) => ({
                        ...prev,
                        isCollege: e.target.checked,
                      }));
                    }}
                  >
                    College
                  </Checkbox>
                  <Checkbox
                    colorScheme="pink"
                    isChecked={filters.isUnderserved}
                    onChange={(e) => {
                      setIsControlFilterActive(true);
                      setFilters((prev) => ({
                        ...prev,
                        isUnderserved: e.target.checked,
                      }));
                    }}
                  >
                    Underserved
                  </Checkbox>
                  <Checkbox
                    colorScheme="pink"
                    isChecked={filters.isInternational}
                    onChange={(e) => {
                      setIsControlFilterActive(true);
                      setFilters((prev) => ({
                        ...prev,
                        isInternational: e.target.checked,
                      }));
                    }}
                  >
                    International
                  </Checkbox>
                </Stack>
              </FormControl>
            </DrawerBody>
            <DrawerFooter>
              <Button variant="outline" mr={3} onClick={onFiltersClose}>
                Close
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer
          isOpen={isConnectDrawerOpen}
          placement="right"
          onClose={onConnectDrawerClose}
          blockScrollOnMount={false}
        >
          {/* <DrawerOverlay /> */}
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader display="flex" alignItems={"center"}>
              {" "}
              <IoAppsOutline />
              &nbsp; Navigate
            </DrawerHeader>

            <DrawerBody>
              <VStack spacing={4}>
                {/* Example Connect Link Buttons */}

                <Link
                  div="button"
                  onClick={onUserProfileOpen}
                  display="flex"
                  alignItems={"center"}
                  width="100%"
                >
                  <VscAccount
                    style={{
                      color: "#C95F8F",
                      textShadow: "3px 3px 3px black",
                    }}
                  />{" "}
                  <div style={{ width: "100%", marginLeft: "7px" }}>
                    Profile
                  </div>
                </Link>

                <Link
                  href="https://www.girlsoncampus.org"
                  isExternal
                  style={{ display: "flex", alignItems: "center" }}
                  width="100%"
                  marginLeft="-4px"
                >
                  <Image
                    src={logo_transparent}
                    height="18px"
                    objectFit="cover"
                  />
                  <div style={{ width: "100%", marginLeft: "4px" }}>
                    Connect
                  </div>
                </Link>

                <Link
                  onClick={onLoanInfoOpen}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  width="100%"
                >
                  <div style={{ marginLeft: "0px" }}>
                    <FaInfoCircle color="#C95F8F" />
                  </div>
                  <div style={{ width: "100%", marginLeft: "5px" }}>
                    Student Loan Resources
                  </div>
                </Link>

                <Link
                  onClick={onInstallModalOpen}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  width="100%"
                >
                  <div style={{ marginLeft: "0.5px" }}>
                    <LuDownload color="#C95F8F" />
                  </div>
                  <div style={{ width: "100%", marginLeft: "7px" }}>
                    Install App
                  </div>
                </Link>

                {/* <Button onClick={() => console.log("Link 2 Selected")}>
                Connect Link 2
              </Button>
              <Button onClick={() => console.log("Link 3 Selected")}>
                Connect Link 3
              </Button> */}
              </VStack>
              <br />
              <VStack>
                {secretMode ? (
                  <>
                    <br />
                    <h4 style={{ width: "100%" }}>Admin stuff</h4>

                    <Link width="100%" onClick={() => navigate("/")} mb={3}>
                      View As User
                    </Link>
                    <Link width="100%" onClick={() => navigate("/edit")} mb={3}>
                      Edit
                    </Link>

                    <Link
                      width="100%"
                      onClick={() => navigate("/admin")}
                      mb={3}
                    >
                      Upload Content
                    </Link>

                    <Button
                      onClick={onWalletOpen}
                      boxShadow="0.5px 0.5px 1px 0px black"
                    >
                      <SiCashapp
                        style={{
                          color: "#C95F8F",
                          textShadow: "3px 3px 3px black",
                        }}
                      />{" "}
                      &nbsp; Wallet
                    </Button>
                  </>
                ) : null}
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
    </>
  );
};

export default Feed;
