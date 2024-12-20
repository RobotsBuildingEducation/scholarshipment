import React, { useState, useEffect } from "react";
// import { Web5 } from "@web5/api/browser";
import { DidDht } from "@web5/dids";
import { DidJwk } from "@web5/dids";

import { doc, setDoc } from "firebase/firestore";
import { database } from "../database/setup";
import { Box, Input, keyframes, Skeleton } from "@chakra-ui/react";

import Feed from "../components/Feed";
import logo_transparent from "../assets/logo_transparent.png";

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
        const didDht = await DidDht.create({ publish: true });

        // DID and its associated data which can be exported and used in different contexts/apps
        // const portableDid = await didDht.export();

        // DID string
        const did = didDht.uri;

        // DID Document
        // console.log("did dht", didDht);
        // console.log("document", didDht.document);
        // const didDocument = JSON.stringify(didDht.document);
        // console.log("did st", didDocument);
        setIsNewUser(true);
        // const { web5 } = await Web5.connect();
        // const id = web5?.did?.agent?.agentDid;
        // // const id = "test";
        // console.log("web5", web5);
        // console.log("id", id);
        let id = did;
        localStorage.setItem("uniqueId", id);
        setDidKey(id); // For simplicity, using DID as the key for now.
        await setDoc(doc(database, "users", id), {
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        // localStorage.setItem("uniqueId", "global");
        // await setDoc(doc(database, "users", id), {
        //   createdAt: new Date().toISOString(),
        // });
        // checkUser();
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
    }, 1000);
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handlePasscodeChange = (e) => {
    setPasscode(e.target.value);
  };

  console.log("didKey", didKey);

  if (loading && !localStorage.getItem("uniqueId"))
    return (
      <Box
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        animation={`${fadeIn} 1s ease-in-out`}
      >
        <Box
          height="200px"
          width="200px"
          startColor="pink.500"
          endColor="orange.500"
          borderRadius="34%"
          animation={`${rotate} 5s linear infinite, ${fluidDrop} 5s ease-in-out infinite`}
        >
          <Box width={200} as="img" src={logo_transparent} borderRadius="34%" />
        </Box>
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
