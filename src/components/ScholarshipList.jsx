import React from "react";
import { VStack } from "@chakra-ui/react";
import ScholarshipCard from "./ScholarshipCard";

const ScholarshipList = ({ scholarships, onSaveScholarship, onSend }) => {
  return (
    <VStack spacing={4} mt={4}>
      {scholarships.map((scholarship, index) => (
        <ScholarshipCard
          key={index}
          scholarship={scholarship}
          onSaveScholarship={onSaveScholarship}
          onSend={onSend}
        />
      ))}
    </VStack>
  );
};

export default ScholarshipList;
