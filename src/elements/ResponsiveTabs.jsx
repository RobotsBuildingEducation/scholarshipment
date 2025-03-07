import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useBreakpointValue,
  Box,
  Select,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { HiOutlineBookmark, HiOutlineSparkles } from "react-icons/hi2";

const ResponsiveTabs = ({
  viewMode,
  setViewMode,
  handleViewAllClick,
  handleViewDraftsClick,
  handleViewSavedClick,
  handleMyScholarshipsClick,
  handleRecommendedClick,
  children,

  loadScholarships,
  setSelectedCollection,
  selectedCollection,
  setIsRenderingSpotlight,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [viewMode]); // Runs every time the viewMode changes
  const tabOrientation = useBreakpointValue({
    base: "horizontal",
    md: "horizontal",
  });
  const isMobile = useBreakpointValue({ base: true, md: false });

  // if (isMobile) {
  //   return (
  //     <Accordion allowToggle>
  //       <AccordionItem>
  //         <AccordionButton onClick={handleViewAllClick}>
  //           <Box flex="1" textAlign="left">
  //             All
  //           </Box>
  //           <AccordionIcon />
  //         </AccordionButton>
  //         <AccordionPanel>{viewMode === "all" && children}</AccordionPanel>
  //       </AccordionItem>
  //       <AccordionItem>
  //         <AccordionButton onClick={handleViewDraftsClick}>
  //           <Box flex="1" textAlign="left">
  //             Drafts
  //           </Box>
  //           <AccordionIcon />
  //         </AccordionButton>
  //         <AccordionPanel>{viewMode === "drafts" && children}</AccordionPanel>
  //       </AccordionItem>
  //       <AccordionItem>
  //         <AccordionButton onClick={handleViewSavedClick}>
  //           <Box flex="1" textAlign="left">
  //             Saved
  //           </Box>
  //           <AccordionIcon />
  //         </AccordionButton>
  //         <AccordionPanel>{viewMode === "saved" && children}</AccordionPanel>
  //       </AccordionItem>
  //       {/* <AccordionItem>
  //         <AccordionButton onClick={handleMyScholarshipsClick}>
  //           <Box flex="1" textAlign="left">
  //             Preferences
  //           </Box>
  //           <AccordionIcon />
  //         </AccordionButton>
  //         <AccordionPanel>
  //           {viewMode === "preferences" && children}
  //         </AccordionPanel>
  //       </AccordionItem> */}
  //       {/* <AccordionItem>
  //         <AccordionButton onClick={handleRecommendedClick}>
  //           <Box flex="1" textAlign="left">
  //             Recommended
  //           </Box>
  //           <AccordionIcon />
  //         </AccordionButton>
  //         <AccordionPanel>
  //           {viewMode === "recommended" && children}
  //         </AccordionPanel>
  //       </AccordionItem> */}
  //     </Accordion>
  //   );
  // } else {
  let idx = -1;
  if (viewMode === "all") {
    idx = 0;
  } else if (viewMode === "saved") {
    idx = 1;
  } else if (viewMode === "drafts") {
    idx = 2;
  }
  return (
    <Tabs
      isFitted
      orientation={tabOrientation}
      index={idx} // No tab selected for spotlight
      // onChange={(index) => {
      //   const modes = [
      //     "all",
      //     "drafts",
      //     "saved",
      //     // "preferences",
      //     // "recommended",
      //   ];
      //   setViewMode(modes[index]);
      // }}
      variant="soft-rounded"
      colorScheme="blue"
      style={{ marginBottom: 48 }}
    >
      <TabList
        position="fixed"
        background={"#faf2f4"}
        opacity="1"
        zIndex="10"
        maxWidth="606px"
        width="100%"
        marginTop="-18px"
        padding="4px"
        borderBottomRadius={"6px"}
      >
        <HStack width="100%" maxWidth="606px">
          <Select
            border="3px solid #EBE6F8"
            width="50%"
            value={selectedCollection}
            onChange={(e) => {
              setIsRenderingSpotlight(false);

              setSelectedCollection(e.target.value);
              // Optionally, reload the list from the newly selected collection.
              // loadScholarships("all");
            }}
          >
            <option value="scholarships">Scholarships</option>
            <option value="careers">Career</option>
          </Select>
          <HStack width="50%">
            <Tab onClick={handleViewAllClick}>All</Tab>
            <Tab
              textAlign="left"
              onClick={handleViewSavedClick}
              // display="flex"
              // alignItems={"center"}
            >
              <HiOutlineBookmark />
              &nbsp;
              {/* Saved */}
            </Tab>
            <Tab textAlign="left" onClick={handleViewDraftsClick}>
              <HiOutlineSparkles />
              &nbsp;
              {/* Drafts */}
            </Tab>
          </HStack>
        </HStack>

        {/* <Tab textAlign="left" onClick={handleMyScholarshipsClick}>
            Preferences
          </Tab> */}
        {/* <Tab textAlign="left" onClick={handleRecommendedClick}>
            Recommended
          </Tab> */}
      </TabList>
      <TabPanels>
        <TabPanel>{viewMode === "all" && children}</TabPanel>
        <TabPanel>{viewMode === "saved" && children}</TabPanel>
        <TabPanel>{viewMode === "drafts" && children}</TabPanel>
        {/* <TabPanel>{viewMode === "preferences" && children}</TabPanel> */}
        {/* <TabPanel>{viewMode === "recommended" && children}</TabPanel> */}
      </TabPanels>
    </Tabs>
  );
  // }
};

export default ResponsiveTabs;
