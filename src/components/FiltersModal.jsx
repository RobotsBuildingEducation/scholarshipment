// FiltersModal.js
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Checkbox,
  CheckboxGroup,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

const FiltersModal = ({
  isOpen,
  onClose,
  tempFilters,
  setTempFilters,
  handleSaveSettings,
  handleSubmitFilters,
  handleMyScholarshipsClick,
}) => {
  const handleTempFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCollectionTypeChange = (value) => {
    setTempFilters((prevFilters) => ({
      ...prevFilters,
      collectionType: value,
    }));
  };

  const collectionOptions = [
    "Latest",
    "Highschool",
    "International",
    "Underserved",
    "Undergraduate",
    "Graduate",
    "Major",
    "Networking",
    "Student Loan Resources",
    "Rolling Scholarships",
  ];

  const showCheckboxes = tempFilters?.collectionType?.includes("Latest");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Filter Scholarships</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Menu closeOnSelect={false}>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Filter by Collection Type
            </MenuButton>
            <MenuList>
              <MenuOptionGroup
                defaultValue={tempFilters?.collectionType}
                title="Collection Type"
                type="checkbox"
                onChange={handleCollectionTypeChange}
              >
                {collectionOptions.map((option, index) => (
                  <MenuItemOption key={index} value={option}>
                    {option}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          {showCheckboxes && (
            <CheckboxGroup>
              <VStack mt={4} align="start" spacing={3}>
                <Checkbox
                  name="isHighschool"
                  isChecked={tempFilters.isHighschool}
                  onChange={handleTempFilterChange}
                >
                  Highschool
                </Checkbox>
                <Checkbox
                  name="isCollege"
                  isChecked={tempFilters.isCollege}
                  onChange={handleTempFilterChange}
                >
                  College
                </Checkbox>
                <Checkbox
                  name="isUnderserved"
                  isChecked={tempFilters.isUnderserved}
                  onChange={handleTempFilterChange}
                >
                  Underserved
                </Checkbox>
                <Checkbox
                  name="isInternational"
                  isChecked={tempFilters.isInternational}
                  onChange={handleTempFilterChange}
                >
                  International
                </Checkbox>
                <Checkbox
                  name="isStateOnly"
                  isChecked={tempFilters.isStateOnly}
                  onChange={handleTempFilterChange}
                >
                  State Only
                </Checkbox>
              </VStack>
            </CheckboxGroup>
          )}

          <Input
            mt={4}
            placeholder="Filter by Eligibility"
            name="eligibility"
            value={tempFilters.eligibility}
            onChange={handleTempFilterChange}
          />
          <Input
            mt={2}
            placeholder="Filter by Major"
            name="major"
            value={tempFilters.major}
            onChange={handleTempFilterChange}
          />
          <Input
            mt={2}
            placeholder="Filter by Amount"
            name="amount"
            value={tempFilters.amount}
            onChange={handleTempFilterChange}
          />
          <Input
            mt={2}
            placeholder="Filter by Ethnicity"
            name="ethnicity"
            value={tempFilters.ethnicity}
            onChange={handleTempFilterChange}
          />
          <Input
            mt={2}
            placeholder="Filter by Year"
            name="year"
            type="number"
            value={tempFilters.year}
            onChange={handleTempFilterChange}
          />

          <br />
          <br />
          <Button onClick={handleSaveSettings} ml={2}>
            Save Settings
          </Button>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmitFilters}>
            Apply Filters
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FiltersModal;
