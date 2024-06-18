import React, { useState, useEffect } from "react";
import { Web5 } from "@web5/api/browser";
import { doc, setDoc } from "firebase/firestore";
import { database } from "../database/setup";
import { Box, Input, keyframes } from "@chakra-ui/react";

import Feed from "../components/Feed";
import logo from "../assets/logo.png";

// Define keyframes for animations
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const fluidDrop = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(0.9); }
`;

const HomePage = ({ isAdminMode = false }) => {
  const [isNewUser, setIsNewUser] = useState(false);
  const [didKey, setDidKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPasscodeCorrect, setIsPasscodeCorrect] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passcode, setPasscode] = useState("");

  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  useEffect(() => {
    if (passcode === correctPassword) {
      localStorage.setItem("adminPassword", passcode);
      setIsLoggedIn(true);
    }
  }, [passcode]);

  const checkUser = async () => {
    if (isAdminMode) {
      const storedPassword = localStorage.getItem("adminPassword");
      if (storedPassword === correctPassword) {
        setIsLoggedIn(true);
      }
    }

    const id = localStorage.getItem("uniqueId");
    if (!id) {
      try {
        setIsNewUser(true);
        const { web5 } = await Web5.connect();
        const id = web5?.did?.agent?.agentDid;
        localStorage.setItem("uniqueId", id);

        setDidKey(id); // For simplicity, using DID as the key for now.
        await setDoc(doc(database, "users", id), {
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        checkUser();
      }
    } else {
      console.log("oh...");
      setDidKey(id); // For simplicity, using DID as the key for now.
      const userDocRef = await doc(database, "users", id);

      // const userDoc = await getDoc(userDocRef);
    }
    console.log("running x");

    setTimeout(() => {
      console.log("running y");
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handlePasscodeChange = (e) => {
    setPasscode(e.target.value);
  };

  if (loading)
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

  if (isAdminMode && !isLoggedIn)
    return (
      <Box
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        animation={`${fadeIn} 1s ease-in-out`}
      >
        <Box>
          <Input
            placeholder="Enter passcode"
            value={passcode}
            onChange={handlePasscodeChange}
            style={{ border: "1px solid darkgray" }}
          />
        </Box>
      </Box>
    );

  return <Feed didKey={didKey} isAdminMode={isAdminMode} />;
};

export default HomePage;
