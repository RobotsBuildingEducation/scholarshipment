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
  useBreakpointValue,
  IconButton,
} from "@chakra-ui/react";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";
import { ExternalLink } from "../elements/ExternalLink";
import EditScholarshipDrawer from "./EditScholarshipDrawer"; // Import the drawer component
// import { BookMarkIcon } from "../assets/bookmarkIcon";
import { HiOutlineSparkles } from "react-icons/hi2";
import { HiOutlineBookmark } from "react-icons/hi2";

import Markdown from "react-markdown";
import logo_transparent from "../assets/logo_transparent.png";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { GrFormNext } from "react-icons/gr";
import { GrFormPrevious } from "react-icons/gr";

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
  const isMobile = useBreakpointValue({ base: true, md: false });

  const images = scholarship?.fileURLs || [];
  const booleanTags = [
    { label: "High School", value: scholarship.isHighschool },
    { label: "State Only", value: scholarship.isStateOnly },
    { label: "International", value: scholarship.isInternational },
    { label: "College", value: scholarship.isCollege },
    { label: "Spotlight", value: scholarship.isSpotlight },
    { label: "Underserved", value: scholarship.isUnderserved },
  ];
  let formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box
      borderWidth={1}
      w="100%"
      textAlign="left"
      position="relative"
      style={{
        // border: "1px solid rgba(201, 201, 201 , 0.6)",
        width: "100%",
        minHeight: "70vh",
        boxShadow: "0px 12px 12px -6px rgba(42, 51, 69, 0.04)",
        borderRadius: !isMobile ? 32 : null,
        backgroundColor: "rgba(255,255,255, 0.1)",
        // border: "1px solid red",
        border: "1px solid lightgray",
        fontSize: 12,
      }}
    >
      <div style={{ padding: 18, marginLeft: 12, paddingBottom: 0 }}>
        <Heading as="h3" fontWeight="bold">
          {scholarship.name}
        </Heading>
        <Text style={{ fontWeight: "bold" }}>
          {formatAmount(scholarship.amount)}
        </Text>
      </div>
      {images.length > 1 ? (
        <Carousel
          touch={true}
          interval={null}
          nextIcon={
            <IconButton
              boxShadow="0px 0.5px 1px 0px black"
              borderRadius="40%"
              variant="outline"
              icon={<GrFormNext color="black" />}
            />
          }
          prevIcon={
            <IconButton
              boxShadow="0px 0.5px 1px 0px black"
              borderRadius="40%"
              variant="outline"
              icon={<GrFormPrevious color="black" />}
            />
          }
        >
          {images?.map((url, index) => (
            <Carousel.Item
              key={index}
              style={{ transition: "0.1s all ease-in-out" }}
            >
              <Image
                src={url ? url : logo_transparent}
                alt={`Scholarship ${index + 1}`}
                layout="fill"
                objectFit="fit"
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <Image
          src={images[0]}
          alt="Scholarship"
          layout="fill"
          objectFit="fit"
        />
      )}
      <br />
      <Wrap style={{ marginLeft: 12 }}>
        {booleanTags?.map(
          (tag, index) =>
            tag.value && (
              <Tag
                key={index}
                style={{ backgroundColor: "#8B4E9E", color: "white" }}
              >
                {tag.label}
              </Tag>
            )
        )}
        {scholarship.tags?.map((tag, index) => (
          <Tag
            key={index}
            style={{ backgroundColor: "#C95F8F", color: "white" }}
          >
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
        <Text>
          <b>Due Date:</b> {scholarship?.dueDate || "-"}
        </Text>
        <Text>
          <b>Year:</b> {scholarship?.year || "-"}
        </Text>
        <Text>
          <b>Major:</b> {scholarship?.major || "-"}
        </Text>

        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton
              style={{
                backgroundColor: "transparent",
              }}
            >
              <Box flex="1" textAlign="left">
                Learn more
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel
              pb={4}
              style={{
                backgroundColor: "transparent",
              }}
            >
              {/* <Text>
                <b>Ethnicity:</b> {scholarship?.ethnicity || "-"}
              </Text> */}
              <Text>
                <b>Eligibility</b>{" "}
                <Markdown
                  // components={ChakraUIRenderer()}
                  children={scholarship?.eligibility || "-"}
                  style={{ fontSize: 12 }}
                >
                  {/* {scholarship?.eligibility} */}
                </Markdown>
              </Text>
              <Text>
                <b>Details</b>
                <Markdown
                  // components={ChakraUIRenderer()}
                  children={scholarship?.details || "-"}
                  style={{ fontSize: 12 }}
                >
                  {/* {scholarship?.eligibility} */}
                </Markdown>
              </Text>
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
          <HiOutlineBookmark />
          &nbsp;Save
        </Button>
        <Button
          onClick={() => {
            onSend(scholarship);
            // toast({
            //   title: "Draft Created.",
            //   description: "The draft has been created successfully.",
            //   status: "info",
            //   duration: 5000,
            //   isClosable: true,
            //   position: "top",
            // });
          }}
          mt={2}
          ml={2}
        >
          <HiOutlineSparkles />
          &nbsp;Draft
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
