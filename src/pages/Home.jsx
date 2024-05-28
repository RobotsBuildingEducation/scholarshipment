import React, { useState, useEffect } from "react";
import { Web5 } from "@web5/api/browser";

import { getDoc, doc, setDoc } from "firebase/firestore";
import { database } from "../database/setup";
import Feed from "../components/Feed";
import Onboarding from "../components/Onboarding";

const HomePage = () => {
  const [isNewUser, setIsNewUser] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [didKey, setDidKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const id = localStorage.getItem("uniqueId");
      if (!id) {
        setIsNewUser(true);
        const { web5 } = await Web5.connect();
        const id = web5?.did?.agent?.agentDid;
        localStorage.setItem("uniqueId", id);
        setUniqueId(id);
        setDidKey(id); // For simplicity, using DID as the key for now.

        await setDoc(doc(database, "users", id), {
          createdAt: new Date().toISOString(),
        });
      } else {
        const userDocRef = doc(database, "users", id);
        // const userDoc = await getDoc(userDocRef);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleOnboardingComplete = () => {
    setIsNewUser(false);
  };

  if (loading) return <div>Loading...</div>;

  return isNewUser ? (
    <Onboarding
      handleOnboardingComplete={handleOnboardingComplete}
      uniqueId={uniqueId}
    />
  ) : (
    <Feed />
  );
};

export default HomePage;
