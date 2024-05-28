// Feed.js
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { database } from "../database/setup";
import { Web5 } from "@web5/api/browser";
import {
  Container,
  Heading,
  VStack,
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import FiltersModal from "./FiltersModal";
import EditProfileModal from "./EditProfileModal";

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
  const [uniqueId, setUniqueId] = useState("");
  const [scholarships, setScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [filters, setFilters] = useState(null);
  const [tempFilters, setTempFilters] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isRenderingSpotlight, setIsRenderingSpotight] = useState(false);

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

  useEffect(() => {
    fetchUserData();
    loadScholarships(true); // Load spotlight scholarships initially
  }, []);

  const loadScholarships = async (spotlightOnly = false) => {
    try {
      let q;
      if (spotlightOnly) {
        setIsRenderingSpotight(true);
        q = query(
          collection(database, "scholarships"),
          where("isSpotlight", "==", true)
        );
      } else {
        setIsRenderingSpotight(false);
        q = query(collection(database, "scholarships"));
      }
      const querySnapshot = await getDocs(q);
      const loadedScholarships = querySnapshot.docs.map((doc) => doc.data());
      setScholarships(loadedScholarships);
      setFilteredScholarships(loadedScholarships);
    } catch (error) {
      console.log("error loading scholarships", error);
    }
  };

  const filterScholarships = () => {
    setIsRenderingSpotight(false);
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
        <Button onClick={() => loadScholarships(false)} ml={4}>
          All
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

      <VStack spacing={4} mt={4}>
        {filteredScholarships.map((scholarship, index) => (
          <Box
            key={index}
            p={4}
            borderWidth={1}
            borderRadius="lg"
            w="100%"
            textAlign="left"
          >
            <Text fontWeight="bold">{scholarship.name}</Text>
            <Text>Due Date: {scholarship.dueDate}</Text>
            <Text>Year: {scholarship.year}</Text>
            <Text>Eligibility: {scholarship.eligibility}</Text>
            <Text>Major: {scholarship.major}</Text>
            <Text>Amount: {scholarship.amount}</Text>
            <Text>Ethnicity: {scholarship.ethnicity}</Text>
            <Text>
              <a
                href={scholarship.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                More Info:
              </a>
            </Text>
            <Text>Details: {scholarship.details}</Text>
          </Box>
        ))}
      </VStack>

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
    </Container>
  );
};

export default Feed;
