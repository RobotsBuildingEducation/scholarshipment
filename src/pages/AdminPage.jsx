import React, { useState, useEffect } from "react";
import {
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Checkbox,
  Button,
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
} from "@chakra-ui/react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { database } from "../database/setup";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../database/setup";

const AdminPage = () => {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tagInput, setTagInput] = useState("");
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
  });
  const [files, setFiles] = useState([]);
  const [downloadURLs, setDownloadURLs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  useEffect(() => {
    const storedPassword = localStorage.getItem("adminPassword");
    if (storedPassword === correctPassword) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (password === correctPassword) {
      localStorage.setItem("adminPassword", password);
      setIsLoggedIn(true);
    }
  }, [password]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminPassword");
    setIsLoggedIn(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      collectionType: value,
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
      setFiles([...e.target.files]);
    }
  };

  const handleUpload = async (scholarshipId) => {
    if (files.length === 0) return;

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
      setDownloadURLs(urls);
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
      // Create the scholarship document first to get the ID
      const scholarshipRef = await addDoc(
        collection(database, "scholarships"),
        {
          ...formData,
          fileURLs: [], // Temporarily empty, will be updated later
        }
      );
      const scholarshipId = scholarshipRef.id;

      // Upload the files to the subdirectory with the scholarship ID
      const fileUploadResult = await handleUpload(scholarshipId);
      console.log("upload complete", fileUploadResult);

      // Update the scholarship document with the download URLs
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
      });
      setDownloadURLs([]);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const renderCheckmarks = formData.collectionType.includes("Latest");

  const collectionOptions = [
    "Latest",
    "Highschool",
    "International",
    "Underserved",
    "Undergraduate",
    "Graduate",
    "Major",
    "Networking",
    "Student Loan Resources",
    "Rolling Scholarships",
  ];

  if (isLoggedIn) {
    return (
      <Container>
        <Box>
          <Heading as="h2" size="xl" mb={4}>
            Create
          </Heading>

          <div>
            <h1>Upload Files</h1>
            <div>
              <Input
                style={{ border: "1px solid darkgray", height: 200 }}
                multiple
                type="file"
                onChange={handleFileChange}
              />
              <Button onClick={handleUpload}>Upload</Button>
              <div>{progress > 0 && `Upload is ${progress}% done`}</div>
              {error && <div>Error: {error}</div>}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <FormControl id="collectionType" mb={4}>
              <FormLabel>Collection Type (select multiple)</FormLabel>
              <Menu closeOnSelect={false}>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                  Select Options
                </MenuButton>
                <MenuList>
                  <MenuOptionGroup
                    defaultValue={formData.collectionType}
                    title="Options"
                    type="checkbox"
                    onChange={handleSelectChange}
                  >
                    {collectionOptions.map((option, index) => (
                      <MenuItemOption key={index} value={option}>
                        {option}
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                </MenuList>
              </Menu>

              <HStack mt={2} wrap="wrap">
                {formData.collectionType.map((option, index) => (
                  <Tag
                    key={index}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="teal"
                  >
                    <TagLabel>{option}</TagLabel>
                    <TagCloseButton
                      onClick={() =>
                        handleSelectChange(
                          formData.collectionType.filter((o) => o !== option)
                        )
                      }
                    />
                  </Tag>
                ))}
              </HStack>
              <br />

              {renderCheckmarks && (
                <VStack align="start" spacing={2} mb={4}>
                  <Checkbox
                    name="isHighschool"
                    isChecked={formData.isHighschool}
                    onChange={handleChange}
                  >
                    Highschool
                  </Checkbox>
                  <Checkbox
                    name="isCollege"
                    isChecked={formData.isCollege}
                    onChange={handleChange}
                  >
                    College
                  </Checkbox>
                  <Checkbox
                    name="isUnderserved"
                    isChecked={formData.isUnderserved}
                    onChange={handleChange}
                  >
                    Underserved
                  </Checkbox>
                  <Checkbox
                    name="isInternational"
                    isChecked={formData.isInternational}
                    onChange={handleChange}
                  >
                    International
                  </Checkbox>
                  <Checkbox
                    name="isStateOnly"
                    isChecked={formData.isStateOnly}
                    onChange={handleChange}
                  >
                    State Only
                  </Checkbox>
                </VStack>
              )}
            </FormControl>

            <FormControl id="isSpotlight" mb={4}>
              <Checkbox
                name="isSpotlight"
                isChecked={formData.isSpotlight}
                onChange={handleChange}
                style={{ border: "3px solid blue", padding: 12 }}
              >
                Spotlight?
              </Checkbox>
            </FormControl>

            <FormControl id="name" mb={4}>
              <FormLabel>Name</FormLabel>
              <Input
                style={{ border: "1px solid darkgray" }}
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="dueDate" mb={4}>
              <FormLabel>Due Date</FormLabel>
              <Input
                style={{ border: "1px solid darkgray" }}
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="year" mb={4}>
              <FormLabel>Year</FormLabel>
              <Input
                style={{ border: "1px solid darkgray" }}
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="eligibility" mb={4}>
              <FormLabel>Eligibility</FormLabel>
              <Textarea
                style={{ border: "1px solid darkgray" }}
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="major" mb={4}>
              <FormLabel>Major</FormLabel>
              <Input
                style={{ border: "1px solid darkgray" }}
                name="major"
                value={formData.major}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="amount" mb={4}>
              <FormLabel>Amount</FormLabel>
              <NumberInput
                value={formData.amount}
                onChange={handleAmountChange}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl id="ethnicity" mb={4}>
              <FormLabel>Ethnicity</FormLabel>
              <Input
                style={{ border: "1px solid darkgray" }}
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="link" mb={4}>
              <FormLabel>Link</FormLabel>
              <Input
                style={{ border: "1px solid darkgray" }}
                name="link"
                type="url"
                value={formData.link}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="tags" mb={4}>
              <FormLabel>Tags (press enter to create)</FormLabel>
              <Input
                style={{ border: "1px solid darkgray" }}
                value={tagInput}
                onChange={handleTagInputChange}
                placeholder="Add a tag and press enter"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <HStack spacing={4} mt={2}>
                {formData.tags.map((tag, index) => (
                  <Tag
                    key={index}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="teal"
                  >
                    <TagLabel>{tag}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                  </Tag>
                ))}
              </HStack>
            </FormControl>
            <FormControl id="details" mb={4}>
              <FormLabel>Details</FormLabel>
              <Textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                style={{ border: "1px solid darkgray" }}
              />
            </FormControl>
            <FormControl id="meta" mb={4}>
              <FormLabel>Meta</FormLabel>
              <Textarea
                name="meta"
                value={formData.meta}
                onChange={handleChange}
                placeholder="Add content about the resource to inform the AI when users ask to generate content"
              />
            </FormControl>
            <Button type="submit" colorScheme="teal" mb={4}>
              Publish Scholarship
            </Button>
          </form>
          <Button onClick={handleLogout} colorScheme="red">
            Logout
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box>
        <Heading as="h2" size="xl" mb={4}>
          Login
        </Heading>
        <FormControl id="password" mb={4}>
          <FormLabel>Password</FormLabel>
          <Input
            style={{ border: "1px solid darkgray" }}
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter admin password"
          />
        </FormControl>
      </Box>
    </Container>
  );
};

export default AdminPage;
