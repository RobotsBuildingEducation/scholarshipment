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
  Text,
  Select,
} from "@chakra-ui/react";
import ScholarshipBuilder from "../components/ScholarshipBuilder";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../database/setup";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { database } from "../database/setup";
import Papa from "papaparse";
import { useChatCompletion } from "../hooks/useChatCompletion";
import useDidKeyStore from "../hooks/useDidKeyStore";
import { useSharedNostr } from "../hooks/useNOSTR";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const navigate = useNavigate();
  const { auth, postNostrContent } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );
  const { enableSecretMode, secretMode } = useDidKeyStore();
  const [secretKeyInput, setSecretKeyInput] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // NEW: State to track which collection we're creating to
  const [selectedCollection, setSelectedCollection] = useState("scholarships");

  const [formData, setFormData] = useState({
    collectionType: selectedCollection,

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

  const {
    messages,
    loading: isAIParsing,
    submitPrompt,
  } = useChatCompletion({
    response_format: { type: "json_object" },
  });

  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  const [scholarshipWebsiteText, setScholarshipWebsiteText] = useState("");
  const [excelMode, setExcelMode] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [singleSubmissionMessage, setSingleSubmissionMessage] = useState("");
  const [batchSubmissionMessage, setBatchSubmissionMessage] = useState("");

  useEffect(() => {
    let getKeys = async () => {
      let keySet = await auth(localStorage.getItem("local_nsec"));
      console.log("keysetnpub", keySet);
      if (
        keySet.user.npub ===
        "npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2"
      ) {
        enableSecretMode();
      }
    };
    getKeys();
  }, []);

  const mapRowToDocData = (row) => {
    if (selectedCollection === "careers") {
      // New CSV mapping for careers
      const additionalTags = [];
      const combined = `${row["Requirements/Grade"] || ""} ${
        row["Information"] || ""
      }`.toLowerCase();

      if (combined.includes("full ride")) {
        additionalTags.push("Full ride");
      }
      if (combined.includes("rolling")) {
        additionalTags.push("Rolling");
      }
      return {
        collectionType: selectedCollection,
        name: row["Summer Programs"] || row["Name"] || "",
        details: row["Information"] || "",
        eligibility: row["Requirements/Grade"] || "",
        link: row["LINK"] || "",
        dueDate: "", // Not provided in new CSV
        year: "",
        major: "",
        amount: 0,
        ethnicity: "",
        meta: "",
        isHighschool:
          row["Requirements/Grade"]?.toLowerCase().includes("hs") ||
          row["For who"]?.toLowerCase().includes("hs") ||
          false,
        isCollege:
          row["Requirements/Grade"]?.toLowerCase().includes("college") ||
          row["For who"]?.toLowerCase().includes("undergrad") ||
          false,
        isUnderserved: false,
        isInternational:
          row["Requirements/Grade"]?.toLowerCase().includes("international") ||
          false,
        isStateOnly: false,
        isSpotlight: false,
        fileURLs: [],
        tags: additionalTags,
      };
    } else {
      // Legacy CSV mapping (for scholarships or legacy careers)
      const usedColumns = [
        "Name",
        "Date Due",
        "Immigration status/Eligibility Requirements ",
        "Race/Ethnicity/Gender",
        "Amount ",
        "Description",
        "Open to ",
        "link",
      ];
      const additionalTags = [];
      for (const key in row) {
        if (row[key] && !usedColumns.includes(key)) {
          if (key.toLocaleLowerCase().includes("full ride")) {
            additionalTags.push("Full ride");
          } else if (key.toLocaleLowerCase().includes("rolling")) {
            additionalTags.push("Rolling");
          } else {
            row[key].split(", ").forEach((word) => additionalTags.push(word));
          }
        }
      }
      const convertDateFormat = (dateStr) => {
        try {
          const [month, day, year] = dateStr.split("/");
          if (
            !month ||
            !day ||
            !year ||
            isNaN(month) ||
            isNaN(day) ||
            isNaN(year)
          ) {
            return "";
          }
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        } catch (error) {
          return "";
        }
      };
      return {
        collectionType: selectedCollection,
        name: row.Name || "",
        dueDate: convertDateFormat(row["Date Due"]) || "",
        year: "",
        eligibility: row["Immigration status/Eligibility Requirements "] || "",
        major: "",
        amount: parseFloat(row["Amount "]?.replace(/[^0-9.-]+/g, "")) || 0,
        ethnicity: row["Race/Ethnicity/Gender"] || "",
        link: row.link || "",
        tags: additionalTags,
        details: row.Description || "",
        meta: "",
        isHighschool:
          row["Open to "]?.includes("HS") ||
          row["Open to "]?.includes("below 18") ||
          row["Open to "]?.includes("18+") ||
          false,
        isCollege:
          row["Open to "]?.includes("College") ||
          row["Open to "]?.includes("Grad") ||
          row["Open to "]?.includes("18+") ||
          false,
        isUnderserved:
          row["Immigration status/Eligibility Requirements "]
            .toLocaleLowerCase()
            .includes("undocumented") ||
          row["Immigration status/Eligibility Requirements "]
            .toLocaleLowerCase()
            .includes("DACA") ||
          row["Immigration status/Eligibility Requirements "]
            .toLocaleLowerCase()
            .includes("underserved") ||
          row["Description"].toLocaleLowerCase().includes("undocumented") ||
          row["Description"].toLocaleLowerCase().includes("DACA") ||
          row["Description"].toLocaleLowerCase().includes("underserved") ||
          row["Name"].toLocaleLowerCase().includes("undocumented") ||
          row["Name"].toLocaleLowerCase().includes("DACA") ||
          row["Name"].toLocaleLowerCase().includes("underserved") ||
          false,
        isInternational:
          row["Immigration status/Eligibility Requirements "]
            .toLocaleLowerCase()
            .includes("international") ||
          row["Description"].toLocaleLowerCase().includes("international"),
        isStateOnly: false,
        isSpotlight: false,
        fileURLs: [],
      };
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    console.log("FILE", file);
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        console.log("RESULT", result);
        setExcelData(result.data);
        setExcelMode(true);
        setCurrentRowIndex(0);
      },
    });
  };

  // Modified populateForm to handle both new CSV columns and legacy ones
  const populateForm = (row) => {
    // Check for new CSV column "Summer Programs"
    if (selectedCollection === "careers") {
      // Map new CSV columns to formData keys
      // New CSV mapping for careers
      const additionalTags = [];
      const combined = `${row["Requirements/Grade"] || ""} ${
        row["Information"] || ""
      }`.toLowerCase();

      if (combined.includes("full ride")) {
        additionalTags.push("Full ride");
      }
      if (combined.includes("rolling")) {
        additionalTags.push("Rolling");
      }
      setFormData({
        collectionType: selectedCollection,
        name: row["Summer Programs"] || row["Name"] || "",
        details: row["Information"] || "",
        eligibility: row["Requirements/Grade"] || "",
        link: row["LINK"] || "",
        dueDate: "", // Not provided in new CSV
        year: "",
        major: "",
        amount: 0,
        ethnicity: "",
        meta: "",
        isHighschool:
          row["Requirements/Grade"]?.toLowerCase().includes("hs") ||
          row["For who"]?.toLowerCase().includes("hs") ||
          false,
        isCollege:
          row["Requirements/Grade"]?.toLowerCase().includes("college") ||
          row["For who"]?.toLowerCase().includes("undergrad") ||
          false,
        isUnderserved: false,
        isInternational:
          row["Requirements/Grade"]?.toLowerCase().includes("international") ||
          false,
        isStateOnly: false,
        isSpotlight: false,
        fileURLs: [],
        tags: additionalTags,
      });
    } else {
      // Legacy CSV columns mapping
      const usedColumns = [
        "Name",
        "Date Due",
        "Immigration status/Eligibility Requirements ",
        "Race/Ethnicity/Gender",
        "Amount ",
        "Description",
        "Open to ",
        "link",
      ];
      const additionalTags = [];
      for (const key in row) {
        if (row[key] && !usedColumns.includes(key)) {
          if (key.toLocaleLowerCase().includes("full ride")) {
            additionalTags.push("Full ride");
          } else if (key.toLocaleLowerCase().includes("rolling")) {
            additionalTags.push("Rolling");
          } else {
            let data = row[key].split(", ");
            data.forEach((word) => {
              additionalTags.push(word);
            });
          }
        }
      }
      let convertDateFormat = (dateStr) => {
        try {
          const [month, day, year] = dateStr.split("/");
          if (
            !month ||
            !day ||
            !year ||
            isNaN(month) ||
            isNaN(day) ||
            isNaN(year)
          ) {
            throw new Error("Invalid date format");
          }
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        } catch (error) {
          return `Error: ${error.message}`;
        }
      };
      setFormData({
        collectionType: selectedCollection,

        name: row.Name || "",
        dueDate: convertDateFormat(row["Date Due"]) || "",
        year: "",
        eligibility: row["Immigration status/Eligibility Requirements "] || "",
        major: "",
        amount: parseFloat(row["Amount "].replace(/[^0-9.-]+/g, "")) || 0,
        ethnicity: row["Race/Ethnicity/Gender"] || "",
        link: row.link || "",
        tags: additionalTags || [],
        details: row.Description || "",
        meta: "",
        isHighschool:
          row["Open to "]?.includes("HS") ||
          row["Open to "]?.includes("below 18") ||
          row["Open to "]?.includes("18+") ||
          false,
        isCollege:
          row["Open to "]?.includes("College") ||
          row["Open to "]?.includes("Grad") ||
          row["Open to "]?.includes("18+") ||
          false,
        isUnderserved:
          row["Immigration status/Eligibility Requirements "]
            .toLocaleLowerCase()
            .includes("undocumented") ||
          row["Immigration status/Eligibility Requirements "]
            .toLocaleLowerCase()
            .includes("DACA") ||
          row["Immigration status/Eligibility Requirements "]
            .toLocaleLowerCase()
            .includes("underserved") ||
          row["Description"].toLocaleLowerCase().includes("undocumented") ||
          row["Description"].toLocaleLowerCase().includes("DACA") ||
          row["Description"].toLocaleLowerCase().includes("underserved") ||
          row["Name"].toLocaleLowerCase().includes("undocumented") ||
          row["Name"].toLocaleLowerCase().includes("DACA") ||
          row["Name"].toLocaleLowerCase().includes("underserved") ||
          false,
        isInternational:
          row["Immigration status/Eligibility Requirements "]
            .toLocaleLowerCase()
            .includes("international") ||
          row["Description"].toLocaleLowerCase().includes("international"),
        isStateOnly: false,
        isSpotlight: false,
        fileURLs: [],
      });
    }
  };

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.meta?.done) {
      try {
        const parsed = JSON.parse(lastMsg.content.trim() || "{}");
        setFormData((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          dueDate: parsed.dueDate || prev.dueDate,
          year: parsed.year || prev.year,
          eligibility: parsed.eligibility || prev.eligibility,
          major: parsed.major || prev.major,
          amount: parsed.amount ?? prev.amount,
          link: parsed.link || prev.link,
          details: parsed.details || prev.details,
          meta: parsed.meta || prev.meta,
          isHighschool: parsed.isHighschool ?? prev.isHighschool,
          isCollege: parsed.isCollege ?? prev.isCollege,
          isUnderserved: parsed.isUnderserved ?? prev.isUnderserved,
          isInternational: parsed.isInternational ?? prev.isInternational,
          isStateOnly: parsed.isStateOnly ?? prev.isStateOnly,
          isSpotlight: parsed.isSpotlight ?? prev.isSpotlight,
          tags: Array.isArray(parsed.tags) ? parsed.tags : prev.tags,
        }));
      } catch (err) {
        console.error("Failed to parse JSON from AI:", err);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (excelMode && excelData.length > 0) {
      populateForm(excelData[currentRowIndex]);
    }
  }, [excelMode, currentRowIndex]);

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
      const fileURLs = newFiles.map((file) => URL.createObjectURL(file));
      setFormData((prevData) => ({
        ...prevData,
        fileURLs: fileURLs,
      }));
    }
  };

  const handleUpload = async (docId) => {
    if (files.length === 0) return [];
    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `uploads/${docId}/${file.name}`);
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
    setSingleSubmissionMessage("");
    try {
      // Use the selectedCollection here instead of hardcoding "scholarships"
      const docRef = await addDoc(collection(database, selectedCollection), {
        ...formData,
        fileURLs: [],
      });
      const docId = docRef.id;
      if (formData.name && formData.dueDate !== "Error: Invalid date format") {
        // Adjust the post message based on the selected collection
        postNostrContent(
          `Just published a new ${
            selectedCollection === "scholarships" ? "scholarship" : "career"
          }! View it at https://girlsoncampus.app/${docId} & learn more about the ${
            formData.name
          } ${
            selectedCollection === "scholarships" ? "scholarship" : "career"
          } due ${formData.dueDate}. \n\n #LearnWithNostr`
        );
      }
      const fileUploadResult = await handleUpload(docId);
      await updateDoc(doc(database, selectedCollection, docId), {
        fileURLs: fileUploadResult,
      });
      setSingleSubmissionMessage(
        `${
          selectedCollection === "scholarships" ? "Scholarship" : "Career"
        } published successfully: ${formData.name}`
      );
      if (excelMode && currentRowIndex < excelData.length - 1) {
        setCurrentRowIndex((prevIndex) => prevIndex + 1);
      } else if (excelMode) {
        alert("All rows processed");
        setExcelMode(false);
      } else {
        setFormData({
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
          collectionType: selectedCollection,
        });
      }
      setFiles([]);
    } catch (error) {
      console.error("Error adding document: ", error);
      setSingleSubmissionMessage("Error publishing document.");
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminPassword");
    setIsLoggedIn(false);
  };

  const handleSecretKeyChange = (e) => {
    setSecretKeyInput(e.target.value);
  };

  const handleLogin = async () => {
    setIsAuthenticating(true);
    setErrorMessage("");
    try {
      const result = await auth(secretKeyInput);
      if (
        result.user.npub ===
        "npub1ae02dvwewx8w0z2sftpcg2ta4xyu6hc00mxuq03x2aclta6et76q90esq2"
      ) {
        enableSecretMode();
      } else {
        setErrorMessage("Invalid Secret Key.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.error("Secret Key Validation Error:", error);
    }
    setIsAuthenticating(false);
  };

  const generateFormDataFromText = () => {
    const prompt = `
      You are an assistant for extracting scholarship information from the provided text.
      The user will supply you with a block of text from a scholarship website.
      Your job is to return ONLY valid JSON (without extra commentary) that includes the keys and values. Derive the appropriate values.
      {
        "name": string,
        "dueDate": string,
        "year": string,
        "eligibility": string,
        "major": string,
        "amount": number,
        "link": string,
        "tags": string[],
        "details": string,
        "meta": string,
        "isHighschool": boolean,
        "isCollege": boolean,
        "isUnderserved": boolean,
        "isInternational": boolean,
        "isStateOnly": boolean,
        "isSpotlight": boolean
      }
      The user's text is:
      """${scholarshipWebsiteText}"""
    `;
    submitPrompt([{ role: "user", content: prompt }]);
  };

  const handleSubmitAll = async () => {
    setBatchSubmissionMessage("");
    if (!excelMode || excelData.length === 0) return;
    let successCount = 0;
    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      try {
        const rowDocData = mapRowToDocData(row);
        const docRef = await addDoc(
          collection(database, selectedCollection),
          rowDocData
        );
        const docId = docRef.id;
        postNostrContent(
          `Just published a new ${
            selectedCollection === "scholarships" ? "scholarship" : "career"
          }! View it at https://girlsoncampus.app/${docId} & learn more about the ${
            rowDocData.name
          } ${
            selectedCollection === "scholarships" ? "scholarship" : "career"
          } due ${rowDocData.dueDate}. \n\n #LearnWithNostr`
        );
        successCount++;
      } catch (error) {
        console.error("Error adding document from row:", error);
      }
    }
    setBatchSubmissionMessage(
      `Successfully submitted ${successCount} document(s) out of ${excelData.length}.`
    );
    setExcelMode(false);
  };

  console.log("tttttt", formData);

  if (secretMode) {
    return (
      <Container>
        <Box mt={8} mb={8}>
          <Button onClick={() => navigate("/")} boxShadow="0.5px 0.5px 1px 0px">
            Back to app
          </Button>
          &nbsp;&nbsp;&nbsp;
          <Button
            onClick={() => navigate("/edit")}
            boxShadow="0.5px 0.5px 1px 0px"
          >
            Back to edit mode
          </Button>
        </Box>
        {/* NEW: Dropdown to select the target collection */}
        <Box mb={4}>
          <Select
            border="3px solid skyblue"
            value={selectedCollection}
            onChange={(e) => {
              setSelectedCollection(e.target.value);
              setFormData({ ...formData, collectionType: e.target.value });
            }}
          >
            <option value="scholarships">Scholarships</option>
            <option value="careers">Careers</option>
          </Select>
        </Box>
        <Box>
          <Heading as="h2" size="xl" mb={4}>
            Create{" "}
            {selectedCollection === "scholarships" ? "Scholarship" : "Career"}
          </Heading>

          <FormControl mb={4}>
            <FormLabel>Website Scholarship Text (Experimental)</FormLabel>
            <Text fontSize={"sm"}>
              Copy and paste the content from the website or platform so AI can
              fill out the form
            </Text>
            <Textarea
              placeholder="Paste text from the website here..."
              value={scholarshipWebsiteText}
              onChange={(e) => setScholarshipWebsiteText(e.target.value)}
              rows={6}
              style={{ border: "1px solid black" }}
            />
            <Button
              mt={2}
              onClick={generateFormDataFromText}
              isLoading={isAIParsing}
              colorScheme="purple"
            >
              Generate from text
            </Button>
          </FormControl>
          <br />
          <br />
          {!excelMode && (
            <FormControl mb={4}>
              <FormLabel>Upload CSV for Excel Mode (optional)</FormLabel>
              <Text fontSize="sm">
                Excel mode will create a document for each row. You'll need to
                optionally verify and publish each after uploading.
              </Text>
              <Input type="file" onChange={handleFileUpload} />
            </FormControl>
          )}
          {excelMode && excelData.length > 0 && (
            <>
              <Text fontSize="md" mb={2}>
                <strong>Excel Mode Active:</strong> Found {excelData.length}{" "}
                row(s).
              </Text>
              <Button colorScheme="green" onClick={handleSubmitAll}>
                Submit All
              </Button>
              {batchSubmissionMessage && (
                <Text color="blue.600" mt={2}>
                  {batchSubmissionMessage}
                </Text>
              )}
            </>
          )}
          <br />
          <br />
          <Heading as="h2" size="xl" mb={4}>
            Create{" "}
            {selectedCollection === "scholarships" ? "Scholarship" : "Career"}
          </Heading>
          <Text>Fields are optional</Text>
          <Checkbox
            name="isSpotlight"
            isChecked={formData.isSpotlight}
            onChange={handleChange}
            sx={{ "& .chakra-checkbox__control": { borderColor: "black" } }}
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
                <FormLabel>Meta (optional)</FormLabel>
                <Textarea
                  style={{ border: "1px solid black" }}
                  name="meta"
                  value={formData.meta}
                  onChange={handleChange}
                  placeholder="Additional context for the AI"
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
                    "& .chakra-checkbox__control": { borderColor: "black" },
                  }}
                >
                  High School
                </Checkbox>
                <Checkbox
                  name="isCollege"
                  isChecked={formData.isCollege}
                  onChange={handleChange}
                  sx={{
                    "& .chakra-checkbox__control": { borderColor: "black" },
                  }}
                >
                  College
                </Checkbox>
                <Checkbox
                  name="isUnderserved"
                  isChecked={formData.isUnderserved}
                  onChange={handleChange}
                  sx={{
                    "& .chakra-checkbox__control": { borderColor: "black" },
                  }}
                >
                  Underserved
                </Checkbox>
                <Checkbox
                  name="isInternational"
                  isChecked={formData.isInternational}
                  onChange={handleChange}
                  sx={{
                    "& .chakra-checkbox__control": { borderColor: "black" },
                  }}
                >
                  International
                </Checkbox>
                <Checkbox
                  name="isStateOnly"
                  isChecked={formData.isStateOnly}
                  onChange={handleChange}
                  sx={{
                    "& .chakra-checkbox__control": { borderColor: "black" },
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
                  style={{ border: "1px solid transparent" }}
                />
                <div>{progress > 0 && `Upload is ${progress}% done`}</div>
                {error && <div>Error: {error}</div>}
              </FormControl>
            </GridItem>
          </Grid>
          <br />
          <br />
          <ScholarshipBuilder formData={formData} />
          <br />
          <br />
          <Button
            type="submit"
            colorScheme="teal"
            mt={4}
            onClick={handleSubmit}
          >
            {excelMode
              ? "Submit and Next"
              : "Publish " +
                (selectedCollection === "scholarships"
                  ? "Scholarship"
                  : "Career")}
          </Button>
          {singleSubmissionMessage && (
            <Text color="green.600" mt={2}>
              {singleSubmissionMessage}
            </Text>
          )}
        </Box>
        <br />
        <br />
      </Container>
    );
  }

  return (
    <Container>
      <Box>
        <Heading as="h2" size="xl" mb={4}>
          Enter Secret Key
        </Heading>
        <Input
          placeholder="Secret Key"
          type="password"
          value={secretKeyInput}
          onChange={handleSecretKeyChange}
          mb={4}
          isDisabled={isAuthenticating}
        />
        <Button onClick={handleLogin} isLoading={isAuthenticating}>
          Login
        </Button>
        {errorMessage && (
          <Text color="red.500" mt={4}>
            {errorMessage}
          </Text>
        )}
      </Box>
    </Container>
  );
};

export default AdminPage;
