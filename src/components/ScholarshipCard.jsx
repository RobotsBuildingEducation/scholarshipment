import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";

const ScholarshipCard = ({ scholarship, onSaveScholarship, onSend }) => {
  return (
    <Box p={4} borderWidth={1} borderRadius="lg" w="100%" textAlign="left">
      <Text fontWeight="bold">{scholarship.name}</Text>
      <Text>Due Date: {scholarship.dueDate}</Text>
      <Text>Year: {scholarship.year}</Text>
      <Text>Eligibility: {scholarship.eligibility}</Text>
      <Text>Major: {scholarship.major}</Text>
      <Text>Amount: {scholarship.amount}</Text>
      <Text>Ethnicity: {scholarship.ethnicity}</Text>
      <Text>
        <a href={scholarship.link} target="_blank" rel="noopener noreferrer">
          More Info
        </a>
      </Text>
      <Text>Details: {scholarship.details}</Text>
      <Button onClick={() => onSaveScholarship(scholarship)} mt={2}>
        Save
      </Button>
      <Button onClick={() => onSend(scholarship)} mt={2} ml={2}>
        Draft
      </Button>
    </Box>
  );
};

export default ScholarshipCard;
