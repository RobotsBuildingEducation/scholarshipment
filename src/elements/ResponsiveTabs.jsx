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
} from "@chakra-ui/react";

const ResponsiveTabs = ({
  viewMode,
  setViewMode,
  handleViewAllClick,
  handleViewDraftsClick,
  handleViewSavedClick,
  handleMyScholarshipsClick,
  handleRecommendedClick,
  children,
}) => {
  const tabOrientation = useBreakpointValue({
    base: "vertical",
    md: "horizontal",
  });
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (isMobile) {
    return (
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton onClick={handleViewAllClick}>
            <Box flex="1" textAlign="left">
              All
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>{viewMode === "all" && children}</AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton onClick={handleViewDraftsClick}>
            <Box flex="1" textAlign="left">
              Drafts
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>{viewMode === "drafts" && children}</AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton onClick={handleViewSavedClick}>
            <Box flex="1" textAlign="left">
              Saved
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>{viewMode === "saved" && children}</AccordionPanel>
        </AccordionItem>
        {/* <AccordionItem>
          <AccordionButton onClick={handleMyScholarshipsClick}>
            <Box flex="1" textAlign="left">
              Preferences
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {viewMode === "preferences" && children}
          </AccordionPanel>
        </AccordionItem> */}
        <AccordionItem>
          <AccordionButton onClick={handleRecommendedClick}>
            <Box flex="1" textAlign="left">
              Recommended
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {viewMode === "recommended" && children}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  } else {
    return (
      <Tabs
        isFitted
        orientation={tabOrientation}
        index={viewMode === "spotlight" ? -1 : undefined} // No tab selected for spotlight
        onChange={(index) => {
          const modes = [
            "all",
            "drafts",
            "saved",
            // "preferences",
            "recommended",
          ];
          setViewMode(modes[index]);
        }}
        variant="soft-rounded"
        colorScheme="blue"
        style={{ marginBottom: 48 }}
      >
        <TabList>
          <Tab onMouseDown={handleViewAllClick}>All</Tab>
          <Tab textAlign="left" onClick={handleViewSavedClick}>
            Saved
          </Tab>
          <Tab textAlign="left" onClick={handleViewDraftsClick}>
            Drafts
          </Tab>

          {/* <Tab textAlign="left" onClick={handleMyScholarshipsClick}>
            Preferences
          </Tab> */}
          <Tab textAlign="left" onClick={handleRecommendedClick}>
            Recommended
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>{viewMode === "all" && children}</TabPanel>
          <TabPanel>{viewMode === "saved" && children}</TabPanel>
          <TabPanel>{viewMode === "drafts" && children}</TabPanel>
          {/* <TabPanel>{viewMode === "preferences" && children}</TabPanel> */}
          <TabPanel>{viewMode === "recommended" && children}</TabPanel>
        </TabPanels>
      </Tabs>
    );
  }
};

export default ResponsiveTabs;
