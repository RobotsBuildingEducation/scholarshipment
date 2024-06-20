import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Spinner,
  keyframes,
  useToast,
  Button,
} from "@chakra-ui/react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { database } from "../database/setup";
import { useChatCompletion } from "../hooks/useChatCompletion";
import { Web5 } from "@web5/api/browser";
import ScholarshipCard from "../components/ScholarshipCard";
import AiDrawer from "../components/AiDrawer";
import logo from "../assets/logo.png";

// Define keyframes for animations
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const fluidDrop = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(0.9); }
`;

const ScholarshipDetail = () => {
  const { scholarshipID } = useParams();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [existingDraft, setExistingDraft] = useState(null);
  const [formText, setFormText] = useState("");
  const [didKey, setDidKey] = useState("");
  const { messages, submitPrompt, resetMessages, abortResponse } =
    useChatCompletion();
  const toast = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchDidKey = async () => {
      const id = localStorage.getItem("uniqueId");
      if (!id) {
        try {
          const { web5 } = await Web5.connect();
          const newId = web5?.did?.agent?.agentDid;
          localStorage.setItem("uniqueId", newId);
          setDidKey(newId);
          await setDoc(doc(database, "users", newId), {
            createdAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Error connecting to Web5:", error);
        }
      } else {
        setDidKey(id);
      }
    };

    fetchDidKey();

    setTimeout(() => {
      console.log("running y");
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (didKey) {
      const fetchScholarship = async () => {
        try {
          const docRef = doc(database, "scholarships", scholarshipID);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setScholarship({ id: scholarshipID, ...docSnap.data() });
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.log("Error getting document:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchScholarship();
    }
  }, [didKey, scholarshipID]);

  const handleSaveScholarship = async (scholarship) => {
    if (didKey) {
      try {
        const scholarshipDocRef = doc(
          database,
          `users/${didKey}/savedScholarships`,
          scholarship.id
        );
        await setDoc(scholarshipDocRef, scholarship);
        toast({
          title: "Scholarship Saved.",
          description:
            "The scholarship has been added to your saved collection.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } catch (error) {
        console.log("Error saving scholarship:", error);
      }
    } else {
      console.log("No unique ID found. Cannot save scholarship.");
    }
  };

  const onSend = async (scholarship) => {
    if (didKey) {
      try {
        setIsSending(true);
        const draftDocRef = doc(
          database,
          `users/${didKey}/drafts`,
          scholarship.id
        );
        const draftDoc = await getDoc(draftDocRef);

        if (draftDoc?.exists()) {
          const draftData = draftDoc.data();
          setExistingDraft(draftData.draftContent);
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
          console.log("Draft created successfully");
          setIsSending(false);
        }
      } catch (error) {
        console.log("Error creating draft:", error);
        setIsSending(false);
      }
    } else {
      console.log("No unique ID found. Cannot create draft.");
    }
  };

  const handleOpenSaveModal = (scholarship) => {
    setIsDrawerOpen(true);
    setExistingDraft(null); // Ensure existing draft is reset when opening drawer
    onSend(scholarship);
  };

  const handleSaveDraft = async (draftContent, originalContent) => {
    if (scholarship && didKey) {
      try {
        const draftDocRef = doc(
          database,
          `users/${didKey}/drafts`,
          scholarship.id
        );
        await setDoc(draftDocRef, {
          scholarshipId: scholarship.id,
          draftContent,
          originalContent:
            messages.length > 0 ? messages[messages.length - 1].content : "",
        });
        abortResponse();

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
    if (scholarship && didKey) {
      try {
        const scholarshipDocRef = doc(
          database,
          `users/${didKey}/savedScholarships`,
          scholarship.id
        );
        await setDoc(scholarshipDocRef, {
          ...scholarship,
          formText,
        });
        console.log("Form submitted and scholarship saved:", formText);
        setIsDrawerOpen(false);
      } catch (error) {
        console.log("Error submitting form:", error);
      }
    } else {
      console.log("No scholarship selected or unique ID found.");
    }
  };

  if (loading) {
    return (
      <Box
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        animation={`${fadeIn} 1s ease-in-out`}
      >
        <Box
          width={200}
          as="img"
          src={logo}
          borderRadius="34%"
          animation={`${rotate} 3s linear infinite, ${fluidDrop} 3s ease-in-out infinite`}
        />
      </Box>
    );
  }

  return (
    <Container p={2}>
      {scholarship ? (
        <>
          <ScholarshipCard
            scholarship={scholarship}
            onSaveScholarship={handleSaveScholarship}
            onSend={handleOpenSaveModal}
            onDelete={null} // Assuming delete is not needed in detail view
            onUpdate={null} // Assuming update is not needed in detail view
            isAdminMode={false} // Assuming detail view is not in admin mode
          />
          <AiDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            messages={messages}
            handleFormSubmit={handleFormSubmit}
            isSending={isSending}
            resetMessages={resetMessages}
            onSaveDraft={handleSaveDraft}
            existingDraft={existingDraft}
            setExistingDraft={setExistingDraft}
            original={null} // Placeholder, adjust as needed
          />
        </>
      ) : (
        <p>Scholarship not found</p>
      )}
    </Container>
  );
};

export default ScholarshipDetail;
