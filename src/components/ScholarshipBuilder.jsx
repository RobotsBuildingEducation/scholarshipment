import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import ScholarshipCard from "./ScholarshipCard";

const ScholarshipBuilder = ({ formData }) => {
  console.log("Ffffofofoforromrromrormom d at a t at ta ta at", formData);
  return (
    <Box>
      <Heading as="h3" size="lg" mb={4}>
        Preview
      </Heading>
      <ScholarshipCard scholarship={formData} isAdminMode={false} />
    </Box>
  );
};

export default ScholarshipBuilder;
