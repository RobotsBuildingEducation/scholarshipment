import React from "react";
import { VStack } from "@chakra-ui/react";
import ScholarshipCard from "./ScholarshipCard";

const ScholarshipList = ({
  scholarships,
  onSaveScholarship,
  onSend,
  onDelete,
  isAdminMode,
  onUpdate,
}) => {
  return (
    <VStack spacing={4} mt={4}>
      {scholarships.map((scholarship, index) => (
        <ScholarshipCard
          key={index}
          scholarship={scholarship}
          onSaveScholarship={onSaveScholarship}
          onSend={onSend}
          onDelete={onDelete}
          isAdminMode={isAdminMode}
          onUpdate={onUpdate}
        />
      ))}
    </VStack>
  );
};

export default ScholarshipList;
