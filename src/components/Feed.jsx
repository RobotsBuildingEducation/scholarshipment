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
} from "firebase/firestore";
import { database } from "../database/setup";
import { Container, Heading, Button, useDisclosure } from "@chakra-ui/react";
import FiltersModal from "./FiltersModal";
import EditProfileModal from "./EditProfileModal";
import AiModal from "./AiModal";
import { useChatCompletion } from "../hooks/useChatCompletion";
import ScholarshipList from "./ScholarshipList";

const Feed = () => {
  const {
    isOpen: isFiltersOpen,
    onOpen: onFiltersOpen,
    onClose: onFiltersClose,
  } = useDisclosure();
  const {
    isOpen: isEditProfileOpen,
    onOpen: onEditProfileOpen,
    onClose: onEditProfileClose,
  } = useDisclosure();
  const {
    isOpen: isAiModalOpen,
    onOpen: onAiModalOpen,
    onClose: onAiModalClose,
  } = useDisclosure();

  const [uniqueId, setUniqueId] = useState("");
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
  const [promptData, setPromptData] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // New state to manage view mode

  const onSend = async (scholarship) => {
    try {
      setIsSending(true);
      setSelectedScholarship(scholarship);
      handleOpenSaveModal(scholarship);

      // Check if a draft already exists
      const draftDocRef = doc(
        database,
        `users/${uniqueId}/drafts`,
        scholarship.id
      );
      const draftDoc = await getDoc(draftDocRef);

      if (draftDoc?.exists()) {
        const draftData = draftDoc.data();
        setExistingDraft(draftData.draftContent);
        setOriginalDraft(draftData?.originalContent);
        setFormText(draftData.draftContent);
        setIsSending(false);
      } else {
        await submitPrompt([
          {
            content: `Draft a sample scholarship essay in clean minimalist markdown without headers. Do not write anything other than the markdown content.`,
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
    const id = localStorage.getItem("uniqueId");
    setUniqueId(id);

    if (id) {
      try {
        const userDocRef = doc(database, "users", id);
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
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    }
  };

  const fetchDrafts = async () => {
    setIsRenderingSpotlight(false);
    if (uniqueId) {
      try {
        const draftsQuery = query(
          collection(database, `users/${uniqueId}/drafts`)
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
    if (uniqueId) {
      try {
        const savedQuery = query(
          collection(database, `users/${uniqueId}/savedScholarships`)
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
    loadScholarships(true); // Load spotlight scholarships initially
    // fetchDrafts();
    // fetchSavedScholarships();
  }, []);

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
    setFilteredScholarships(filtered);
  };

  const handleSaveSettings = async () => {
    try {
      if (uniqueId) {
        await updateDoc(doc(database, "users", uniqueId), {
          filters: tempFilters,
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
  };

  const handleAllScholarshipsClick = () => {
    setFilteredScholarships(scholarships);
  };

  const handleSaveScholarship = async (scholarship) => {
    if (uniqueId) {
      try {
        const scholarshipDocRef = doc(
          database,
          `users/${uniqueId}/savedScholarships`,
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

  const handleOpenSaveModal = (scholarship) => {
    setSelectedScholarship(scholarship);
    onAiModalOpen();
  };

  const handleSaveDraft = async (draftContent) => {
    if (selectedScholarship && uniqueId) {
      try {
        const draftDocRef = doc(
          database,
          `users/${uniqueId}/drafts`,
          selectedScholarship.id
        );
        await setDoc(draftDocRef, {
          scholarshipId: selectedScholarship.id,
          draftContent,
          originalContent:
            messages.length > 0 ? messages[messages.length - 1].content : "",
        });
        abortResponse();

        setOriginalDraft(
          messages.length > 0 ? messages[messages.length - 1].content : ""
        );
        setExistingDraft(draftContent);
        resetMessages();
        console.log("Draft saved successfully:", draftContent);
      } catch (error) {
        console.log("Error saving draft:", error);
      }
    } else {
      console.log("No scholarship selected or unique ID found.");
    }
  };

  const handleFormSubmit = async () => {
    if (selectedScholarship && uniqueId) {
      try {
        const scholarshipDocRef = doc(
          database,
          `users/${uniqueId}/savedScholarships`,
          selectedScholarship.id
        );
        await setDoc(scholarshipDocRef, {
          ...selectedScholarship,
          formText,
        });
        console.log("Form submitted and scholarship saved:", formText);
        onAiModalClose();
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

  console.log("isrendering", isRenderingSpotlight);
  return (
    <Container>
      <Heading as="h1" mb={4}>
        Scholarships
      </Heading>
      <Button onClick={onFiltersOpen}>Set Preferences</Button>
      <Button onClick={onEditProfileOpen} ml={4}>
        Edit Profile
      </Button>

      <br />
      <br />
      <>
        <Button onClick={handleViewAllClick} ml={4}>
          View All
        </Button>

        <Button onClick={handleViewDraftsClick} ml={4}>
          View Drafts
        </Button>
        <Button onClick={handleViewSavedClick} ml={4}>
          View Saved
        </Button>
        {filters && (
          <Button onClick={handleMyScholarshipsClick} ml={4}>
            My Preferences
          </Button>
        )}
      </>
      <br />
      <br />
      {isRenderingSpotlight ? (
        <Heading as="h3" size="lg">
          Spotlight
        </Heading>
      ) : null}

      {viewMode === "all" && (
        <ScholarshipList
          scholarships={filteredScholarships}
          onSaveScholarship={handleSaveScholarship}
          onSend={onSend}
        />
      )}
      {viewMode === "drafts" && (
        <ScholarshipList
          scholarships={drafts}
          onSaveScholarship={handleSaveScholarship}
          onSend={onSend}
        />
      )}
      {viewMode === "saved" && (
        <ScholarshipList
          scholarships={savedScholarships}
          onSaveScholarship={handleSaveScholarship}
          onSend={onSend}
        />
      )}

      <FiltersModal
        isOpen={isFiltersOpen}
        onClose={onFiltersClose}
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        handleSaveSettings={handleSaveSettings}
        handleSubmitFilters={filterScholarships}
        handleMyScholarshipsClick={handleMyScholarshipsClick}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={onEditProfileClose}
        uniqueId={uniqueId}
        initialName={name}
        initialEmail={email}
      />

      <AiModal
        setExistingDraft={setExistingDraft}
        existingDraft={existingDraft}
        isOpen={isAiModalOpen}
        onClose={onAiModalClose}
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
