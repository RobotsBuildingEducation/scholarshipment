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
  Container,
} from "@chakra-ui/react";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";
import { ExternalLink } from "../elements/ExternalLink";

const ScholarshipDetail = ({ scholarship, onSaveScholarship, onSend }) => {
  const toast = useToast();

  const gallery = scholarship?.fileURLs ? scholarship?.fileURLs : [];

  const booleanTags = [
    { label: "High School", value: scholarship?.isHighschool },
    { label: "State Only", value: scholarship?.isStateOnly },
    { label: "International", value: scholarship?.isInternational },
    { label: "College", value: scholarship?.isCollege },
    { label: "Spotlight", value: scholarship?.isSpotlight },
    { label: "Underserved", value: scholarship?.isUnderserved },
  ];

  return (
    <Container p={2}>
      <Box
        borderWidth={1}
        textAlign="left"
        position="relative"
        style={{
          border: "1px solid rgba(201, 201, 201 , 0.6)",
          width: "100%",
          minHeight: "70vh",
          boxShadow: "0px 12px 12px -6px rgba(42, 51, 69, 0.04)",
          borderRadius: 32,
          backgroundColor: "#e6e6e6",
          width: "100%",
          maxWidth: "1280px",
        }}
      >
        <div style={{ padding: 12, marginLeft: 12, paddingBottom: 0 }}>
          <Heading as="h3" fontWeight="bold">
            {scholarship?.name}
          </Heading>
          <Text>Amount: {scholarship?.amount}</Text>
        </div>
        {gallery.length > 1 ? (
          <Carousel data-bs-theme="dark" touch={true} interval={null}>
            {gallery?.map((url, index) => (
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
                  // style={{
                  //   borderTopLeftRadius: index === 0 ? 32 : 0,
                  //   borderTopRightRadius: index === gallery.length - 1 ? 32 : 0,
                  // }}
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
            src={gallery[0]}
            alt="Scholarship"
            width="100%"
            height="300px"
            objectFit="cover"
            // style={{
            //   borderTopLeftRadius: 32,
            //   borderTopRightRadius: 32,
            // }}
          />
        )}
        <div style={{ display: "flex", marginLeft: 24, marginTop: 12 }}>
          <ExternalLink
            textDisplay=""
            // link={scholarship?.link}
            type="copyLink"
            scholarshipID={scholarship?.id}
          />
          <ExternalLink
            textDisplay=""
            link={scholarship?.link}
            type="externalWebsite"
          />
        </div>

        <Box p={6} style={{ marginTop: "-4px" }}>
          <Text>Due Date: {scholarship?.dueDate}</Text>
          <Text>Eligibility: {scholarship?.eligibility}</Text>

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
                <Text>Year: {scholarship?.year}</Text>

                <Text>Major: {scholarship?.major}</Text>
                <Text>Ethnicity: {scholarship?.ethnicity}</Text>
                <Text>Details: {scholarship?.details}</Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <br />
          <Wrap>
            {booleanTags?.map(
              (tag, index) =>
                tag.value && (
                  <Tag key={index} colorScheme="blue" size="sm">
                    {tag.label}
                  </Tag>
                )
            )}
            {scholarship?.tags?.map((tag, index) => (
              <Tag key={index} colorScheme="green">
                {tag}
              </Tag>
            ))}
          </Wrap>

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
        </Box>
      </Box>
    </Container>
  );
};

export default ScholarshipDetail;
