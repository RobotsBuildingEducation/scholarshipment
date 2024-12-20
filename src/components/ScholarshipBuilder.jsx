import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import ScholarshipCard from "./ScholarshipCard";

const ScholarshipBuilder = ({ formData }) => {
  return (
    <Box>
      <Heading as="h3" size="lg" mb={4}>
        Scholarship Preview
      </Heading>
      <ScholarshipCard scholarship={formData} isAdminMode={false} />
    </Box>
  );
};

export default ScholarshipBuilder;
