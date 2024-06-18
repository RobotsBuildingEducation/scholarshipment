import React, { useState } from "react";
import {
  Box,
  Text,
  Button,
  Image,
  useToast,
  Heading,
  Tag,
  Wrap,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";
import { ExternalLink } from "../elements/ExternalLink";
import EditScholarshipDrawer from "./EditScholarshipDrawer"; // Import the drawer component

const ScholarshipCard = ({
  scholarship,
  onSaveScholarship,
  onSend,
  onDelete,
  onUpdate,
  isAdminMode,
}) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const images = scholarship?.fileURLs || [];
  const booleanTags = [
    { label: "High School", value: scholarship.isHighschool },
    { label: "State Only", value: scholarship.isStateOnly },
    { label: "International", value: scholarship.isInternational },
    { label: "College", value: scholarship.isCollege },
    { label: "Spotlight", value: scholarship.isSpotlight },
    { label: "Underserved", value: scholarship.isUnderserved },
  ];

  return (
    <Box
      borderWidth={1}
      w="100%"
      textAlign="left"
      position="relative"
      style={{
        border: "1px solid rgba(201, 201, 201 , 0.6)",
        width: "100%",
        minHeight: "70vh",
        boxShadow: "0px 12px 12px -6px rgba(42, 51, 69, 0.04)",
        borderRadius: 32,
        backgroundColor: "#e6e6e6",
      }}
    >
      <div style={{ padding: 12, marginLeft: 12, paddingBottom: 0 }}>
        <Heading as="h3" fontWeight="bold">
          {scholarship.name}
        </Heading>
        <Text style={{ fontWeight: "bold" }}>{scholarship.amount}</Text>
      </div>
      {images.length > 1 ? (
        <Carousel data-bs-theme="dark" touch={true} interval={null}>
          {images?.map((url, index) => (
            <Carousel.Item
              key={index}
              style={{ transition: "0.1s all ease-in-out" }}
            >
              <Image
                src={url}
                alt={`Scholarship ${index + 1}`}
                width="100%"
                height="500px"
                objectFit="cover"
              />
              <Carousel.Caption>
                <h3>{`Slide ${index + 1}`}</h3>
                <p>{`Description for slide ${index + 1}`}</p>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <Image
          src={images[0]}
          alt="Scholarship"
          width="100%"
          height="300px"
          objectFit="cover"
        />
      )}
      <br />
      <Wrap style={{ marginLeft: 12 }}>
        {booleanTags?.map(
          (tag, index) =>
            tag.value && (
              <Tag key={index} colorScheme="blue" size="sm">
                {tag.label}
              </Tag>
            )
        )}
        {scholarship.tags?.map((tag, index) => (
          <Tag key={index} colorScheme="green">
            {tag}
          </Tag>
        ))}
      </Wrap>
      <div style={{ display: "flex", marginLeft: 12, marginTop: 12 }}>
        <ExternalLink
          textDisplay=""
          type="copyLink"
          scholarshipID={scholarship.id}
        />
        <ExternalLink
          textDisplay=""
          link={scholarship.link}
          type="externalWebsite"
        />
      </div>

      <Box p={6} style={{ marginTop: "-4px" }}>
        <Text>Due Date: {scholarship.dueDate}</Text>
        <Text>Eligibility: {scholarship.eligibility}</Text>

        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton
              style={{
                backgroundColor: "#D8D8D8",
              }}
            >
              <Box flex="1" textAlign="left">
                Show More Details
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel
              pb={4}
              style={{
                backgroundColor: "#D8D8D8",
              }}
            >
              <Text>Year: {scholarship.year}</Text>
              <Text>Major: {scholarship.major}</Text>
              <Text>Ethnicity: {scholarship.ethnicity}</Text>
              <Text>Details: {scholarship.details}</Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <br />

        <Button
          onClick={() => {
            onSaveScholarship(scholarship);
            toast({
              title: "Scholarship Saved.",
              description:
                "The scholarship has been added to your saved collection.",
              status: "success",
              duration: 5000,
              isClosable: true,
              position: "top",
            });
          }}
          mt={2}
        >
          Save
        </Button>
        <Button
          onClick={() => {
            onSend(scholarship);
            toast({
              title: "Draft Created.",
              description: "The draft has been created successfully.",
              status: "info",
              duration: 5000,
              isClosable: true,
              position: "top",
            });
          }}
          mt={2}
          ml={2}
        >
          Draft
        </Button>
        {isAdminMode && (
          <>
            <Button
              onClick={() => {
                setIsEditing(true);
              }}
              mt={2}
              ml={2}
              colorScheme="yellow"
            >
              Edit
            </Button>
            <Button
              onClick={() => {
                onDelete(scholarship);
                toast({
                  title: "Scholarship Deleted.",
                  description: "The scholarship has been deleted successfully.",
                  status: "error",
                  duration: 5000,
                  isClosable: true,
                  position: "top",
                });
              }}
              mt={2}
              ml={2}
              colorScheme="red"
            >
              Delete
            </Button>
          </>
        )}
      </Box>
      {isEditing && (
        <EditScholarshipDrawer
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          scholarship={scholarship}
          onUpdate={onUpdate}
        />
      )}
    </Box>
  );
};

export default ScholarshipCard;
