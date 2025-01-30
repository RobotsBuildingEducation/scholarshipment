import React, { useEffect, useState } from "react";
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
import { HiOutlineDocumentRemove } from "react-icons/hi";

const ScholarshipCard = ({
  scholarship,
  onSaveScholarship,
  onSend,
  onDelete,
  onUpdate,
  isAdminMode,
  viewMode = "all",
  removeFromSaved,
  secretMode = false,
}) => {
  console.log("secret mode?", secretMode);
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
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

  const handleSaveClick = () => {
    setIsSaved(true);
    onSaveScholarship(scholarship);

    setTimeout(() => setIsSaved(false), 600); // Reset after 2s
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
        minHeight: "100%",

        boxShadow: "0px 12px 12px -6px rgba(42, 51, 69, 0.04)",
        borderRadius: 32,
        backgroundColor: "rgba(255,255,255, 0.1)",
        // border: "1px solid red",
        border: "1px solid lightgray",
        fontSize: 12,
      }}
    >
      <div style={{ padding: 18, marginLeft: 12, paddingBottom: 0 }}>
        <h3>{scholarship.name}</h3>
        <Text style={{ fontWeight: "bold" }} fontSize={"lg"}>
          {scholarship.amount === 0
            ? "Scholarship amount varies"
            : formatAmount(scholarship.amount)}
        </Text>
      </div>
      {images.length > 1 ? (
        <Carousel
          slide={false}
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
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Image
                  src={url ? url : logo_transparent}
                  alt={`Scholarship ${index + 1}`}
                  layout="fill"
                  objectFit="fit"
                />
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      ) : images.length === 0 ? null : (
        // <div
        //   style={{
        //     display: "flex",
        //     justifyContent: "center",
        //     padding: 100,
        //   }}
        // >
        //   <Image
        //     textAlign={"center"}
        //     width="100px"
        //     src={logo_transparent}
        //     alt="Scholarship"
        //     // layout="fill"
        //     // objectFit="fit"
        //   />
        // </div>
        <div
          style={{ display: "flex", width: "100%", justifyContent: "center" }}
        >
          <Image
            src={images[0]}
            alt="Scholarship"
            layout="fill"
            objectFit="fit"
          />
        </div>
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

        {scholarship?.eligibility ? (
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
        ) : null}
        {/* <Text>
          <b>Year:</b> {scholarship?.year || "-"}
        </Text>
        <Text>
          <b>Major:</b> {scholarship?.major || "-"}
        </Text> */}

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
              {/* <Text>
                <b>Eligibility</b>{" "}
                <Markdown
                  // components={ChakraUIRenderer()}
                  children={scholarship?.eligibility || "-"}
                  style={{ fontSize: 12 }}
                >

                </Markdown>
              </Text> */}
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
        <Box height="100%">
          {secretMode && (
            <Button
              onClick={() => {
                removeFromSaved(scholarship, "spotlight");
                toast({
                  title: "Scholarship Removed.",
                  description:
                    "The scholarship has been removed from your collection.",
                  status: "success",
                  duration: 1000,
                  isClosable: true,
                  position: "top",
                });
              }}
              mt={2}
              mr={2}
            >
              <HiOutlineDocumentRemove />
              &nbsp;Remove from list
            </Button>
          )}
          {viewMode === "drafts" && (
            <Button
              onClick={() => {
                removeFromSaved(scholarship, "drafts");
                toast({
                  title: "Scholarship Removed.",
                  description:
                    "The scholarship has been removed from your collection.",
                  status: "success",
                  duration: 1000,
                  isClosable: true,
                  position: "top",
                });
              }}
              mt={2}
              mr={2}
            >
              <HiOutlineDocumentRemove />
              &nbsp;Remove from list
            </Button>
          )}
          {viewMode !== "saved" && (
            <Button
              onClick={() => {
                onSaveScholarship(scholarship);
                handleSaveClick();
              }}
              style={{
                border: `2px solid ${isSaved ? "purple" : "transparent"}`,
                color: isSaved ? "purple" : "black",
              }}
              mt={2}
            >
              <HiOutlineBookmark />
              &nbsp;{isSaved ? "Saved" : "Save"}
            </Button>
          )}

          {viewMode === "saved" && (
            <Button
              onClick={() => {
                removeFromSaved(scholarship, "saved");
              }}
              mt={2}
            >
              <HiOutlineDocumentRemove />
              &nbsp;Remove from list
            </Button>
          )}

          {/* {viewMode !== "drafts" && ( */}
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
          {/* )} */}
        </Box>
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
