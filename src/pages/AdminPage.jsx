import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Heading,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Checkbox,
  Wrap,
  Tag,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  VStack,
  TagCloseButton,
} from "@chakra-ui/react";
import ScholarshipBuilder from "../components/ScholarshipBuilder";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../database/setup";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { database } from "../database/setup";

const AdminPage = () => {
  const [formData, setFormData] = useState({
    collectionType: [],
    name: "",
    dueDate: "",
    year: "",
    eligibility: "",
    major: "",
    amount: 0,
    ethnicity: "",
    link: "",
    tags: [],
    details: "",
    meta: "",
    isHighschool: false,
    isCollege: false,
    isUnderserved: false,
    isInternational: false,
    isStateOnly: false,
    isSpotlight: false,
    fileURLs: [], // Holds URLs of uploaded files
  });

  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  useEffect(() => {
    const storedPassword = localStorage.getItem("adminPassword");
    if (storedPassword === correctPassword) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAmountChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      amount: value,
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData((prevData) => ({
        ...prevData,
        tags: [...prevData.tags, tagInput],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      tags: prevData.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(newFiles);

      // Generate preview URLs for the selected files
      const fileURLs = newFiles.map((file) => URL.createObjectURL(file));
      setFormData((prevData) => ({
        ...prevData,
        fileURLs: fileURLs,
      }));
    }
  };

  const handleUpload = async (scholarshipId) => {
    if (files.length === 0) return [];

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const storageRef = ref(
          storage,
          `uploads/${scholarshipId}/${file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(progress);
          },
          (error) => {
            setError(error.message);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setFormData((prevData) => ({
        ...prevData,
        fileURLs: urls,
      }));
      setFiles([]);
      setProgress(0);
      setError("");
      return urls;
    } catch (error) {
      console.error("Error uploading files: ", error);
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const scholarshipRef = await addDoc(
        collection(database, "scholarships"),
        {
          ...formData,
          fileURLs: [], // Temporarily empty, will be updated later
        }
      );
      const scholarshipId = scholarshipRef.id;

      const fileUploadResult = await handleUpload(scholarshipId);

      await updateDoc(doc(database, "scholarships", scholarshipId), {
        fileURLs: fileUploadResult,
      });

      alert("Scholarship published successfully");
      setFormData({
        collectionType: [],
        name: "",
        dueDate: "",
        year: "",
        eligibility: "",
        major: "",
        amount: 0,
        ethnicity: "",
        link: "",
        tags: [],
        details: "",
        meta: "",
        isHighschool: false,
        isCollege: false,
        isUnderserved: false,
        isInternational: false,
        isStateOnly: false,
        isSpotlight: false,
        fileURLs: [],
      });
      setFiles([]);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminPassword");
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    if (password === correctPassword) {
      localStorage.setItem("adminPassword", password);
      setIsLoggedIn(true);
    }
  };

  if (isLoggedIn) {
    return (
      <Container>
        <Box>
          <br />
          <br />
          <Heading as="h2" size="xl" mb={4}>
            Create Scholarship
          </Heading>
          <Checkbox
            name="isSpotlight"
            isChecked={formData.isSpotlight}
            onChange={handleChange}
            sx={{
              "& .chakra-checkbox__control": {
                borderColor: "black",
              },
            }}
          >
            Spotlight
          </Checkbox>
          <br />
          <br />
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem colSpan={2}>
              <FormLabel htmlFor="name">Name</FormLabel>

              <Input
                style={{ border: "1px solid black" }}
                placeholder="Name"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
              />
            </GridItem>
            <GridItem colSpan={2}>
              <FormLabel htmlFor="link">Link</FormLabel>

              <Input
                style={{ border: "1px solid black" }}
                placeholder="Link"
                name="link"
                type="url"
                value={formData.link}
                onChange={handleChange}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <FormLabel htmlFor="amount">Amount</FormLabel>
              <NumberInput
                name="amount"
                id="amount"
                style={{ border: "1px solid black" }}
                value={formData.amount}
                onChange={handleAmountChange}
              >
                <NumberInputField placeholder="Amount" />
              </NumberInput>
            </GridItem>
            <GridItem colSpan={1}>
              <FormLabel htmlFor="major">Major</FormLabel>
              <Input
                style={{ border: "1px solid black" }}
                placeholder="Major"
                name="major"
                value={formData.major}
                onChange={handleChange}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <FormLabel htmlFor="dueDate">Due Date</FormLabel>

              <Input
                style={{ border: "1px solid black" }}
                placeholder="Due Date"
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </GridItem>
            <GridItem colSpan={1}>
              <FormLabel htmlFor="year">Year</FormLabel>

              <Input
                id="year"
                style={{ border: "1px solid black" }}
                placeholder="Semester or year"
                name="year"
                value={formData.year}
                onChange={handleChange}
              />
            </GridItem>

            <GridItem colSpan={2}>
              <FormLabel htmlFor="eligibility">Eligibility</FormLabel>

              <Textarea
                style={{ border: "1px solid black" }}
                placeholder="Eligibility"
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
              />
            </GridItem>
            {/* <GridItem colSpan={1}>
            <FormLabel htmlFor="eligibility">Eligibility</FormLabel>

              <Input
                style={{ border: "1px solid black" }}
                placeholder="Ethnicity"
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleChange}
              />
            </GridItem> */}

            <GridItem colSpan={2}>
              <FormLabel htmlFor="details">Details</FormLabel>
              <Textarea
                id="details"
                style={{ border: "1px solid black" }}
                placeholder="Details"
                name="details"
                value={formData.details}
                onChange={handleChange}
              />
            </GridItem>
            <GridItem colSpan={2}>
              <FormControl id="meta" mb={4}>
                <FormLabel>Meta</FormLabel>
                <Textarea
                  style={{ border: "1px solid black" }}
                  name="meta"
                  value={formData.meta}
                  onChange={handleChange}
                  placeholder="Add content about the resource to inform the AI when users ask to generate content"
                />
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormLabel htmlFor="tags">Tags</FormLabel>

              <VStack align="start">
                <Checkbox
                  name="isHighschool"
                  isChecked={formData.isHighschool}
                  onChange={handleChange}
                  colorScheme="purple"
                  sx={{
                    "& .chakra-checkbox__control": {
                      borderColor: "black",
                    },
                  }}
                >
                  High School
                </Checkbox>
                <Checkbox
                  name="isCollege"
                  isChecked={formData.isCollege}
                  onChange={handleChange}
                  sx={{
                    "& .chakra-checkbox__control": {
                      borderColor: "black",
                    },
                  }}
                >
                  College
                </Checkbox>
                <Checkbox
                  name="isUnderserved"
                  isChecked={formData.isUnderserved}
                  onChange={handleChange}
                  sx={{
                    "& .chakra-checkbox__control": {
                      borderColor: "black",
                    },
                  }}
                >
                  Underserved
                </Checkbox>
                <Checkbox
                  name="isInternational"
                  isChecked={formData.isInternational}
                  onChange={handleChange}
                  sx={{
                    "& .chakra-checkbox__control": {
                      borderColor: "black",
                    },
                  }}
                >
                  International
                </Checkbox>
                <Checkbox
                  name="isStateOnly"
                  isChecked={formData.isStateOnly}
                  onChange={handleChange}
                  sx={{
                    "& .chakra-checkbox__control": {
                      borderColor: "black",
                    },
                  }}
                >
                  State Only
                </Checkbox>
              </VStack>
            </GridItem>
            <GridItem colSpan={2}>
              <FormLabel htmlFor="tags">Custom Tags</FormLabel>

              <Input
                id="tags"
                style={{ border: "1px solid black" }}
                placeholder="Tags (press enter to submit a tag)"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Wrap mt={2}>
                {formData.tags.map((tag, index) => (
                  <Tag
                    key={index}
                    style={{ backgroundColor: "#C95F8F", color: "white" }}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <TagCloseButton />
                  </Tag>
                ))}
              </Wrap>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl>
                <FormLabel>Upload Files</FormLabel>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  style={{
                    border: "1px solid transparent",
                  }}
                />
                <div>{progress > 0 && `Upload is ${progress}% done`}</div>
                {error && <div>Error: {error}</div>}
              </FormControl>
            </GridItem>
            <br />
          </Grid>
          <br />
          <br />
          {/* <Box flex="1" textAlign="left">
            Preview Scholarship
          </Box> */}
          <ScholarshipBuilder formData={formData} />
          {/* <Accordion allowToggle mt={4} style={{ border: "1px solid gray" }}>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Preview Scholarship
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <ScholarshipBuilder formData={formData} />
              </AccordionPanel>
            </AccordionItem>
          </Accordion> */}
          <br />
          <br />
          <Button onClick={handleSubmit} colorScheme="teal" mt={4}>
            Publish Scholarship
          </Button>
        </Box>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </Container>
    );
  }

  return (
    <Container>
      <Box>
        <Heading as="h2" size="xl" mb={4}>
          Login
        </Heading>
        <Input
          style={{ border: "1px solid black" }}
          placeholder="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          mb={4}
        />
        <Button onClick={handleLogin} colorScheme="teal">
          Login
        </Button>
      </Box>
    </Container>
  );
};

export default AdminPage;
