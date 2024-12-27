import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const ScholarshipDetail = ({
  didKey,
  scholarships,
  handleSaveScholarship,
  onSend,
  handleDeleteScholarship,
  handleUpdateScholarship,
  isAdminMode,
}) => {
  const { scholarshipID } = useParams();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [existingDraft, setExistingDraft] = useState(null);
  const [formText, setFormText] = useState("");
  // const [didKey, setDidKey] = useState("");
  const { messages, submitPrompt, resetMessages, abortResponse } =
    useChatCompletion();
  const toast = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchDidKey = async () => {
  //     const id = localStorage.getItem("uniqueId");
  //     if (!id) {
  //       try {
  //         const { web5 } = await Web5.connect();
  //         const newId = web5?.did?.agent?.agentDid;
  //         localStorage.setItem("uniqueId", newId);
  //         setDidKey(newId);
  //         await setDoc(doc(database, "users", newId), {
  //           createdAt: new Date().toISOString(),
  //         });
  //       } catch (error) {
  //         console.error("Error connecting to Web5:", error);
  //       }
  //     } else {
  //       setDidKey(id);
  //     }
  //   };

  //   fetchDidKey();

  //   setTimeout(() => {
  //     console.log("running y");
  //     setLoading(false);
  //   }, 1500);
  // }, []);

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
            onSend={onSend}
            onDelete={handleDeleteScholarship} // Assuming delete is not needed in detail view
            onUpdate={handleUpdateScholarship} // Assuming update is not needed in detail view
            isAdminMode={isAdminMode} // Assuming detail view is not in admin mode
          />
        </>
      ) : (
        <p>Scholarship not found</p>
      )}
    </Container>
  );
};

export default ScholarshipDetail;
