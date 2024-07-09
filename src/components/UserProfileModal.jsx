import React, { useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
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
  FormLabel,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { updateDoc, doc } from "firebase/firestore";
import { database } from "../database/setup";

const UserProfileDrawer = ({
  isOpen,
  onClose,
  didKey,
  initialName,
  initialEmail,
  tempFilters,
  setTempFilters,
  handleSaveSettings,
  handleSubmitFilters,
}) => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(database, "users", didKey), {
        name: name,
        email: email,
      });
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

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
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      closeOnOverlayClick={false}
      blockScrollOnMount={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Edit Profile and Filter Scholarships</DrawerHeader>
        <DrawerBody>
          <VStack spacing={4}>
            <div>
              <FormLabel>User name</FormLabel>
              <Input
                placeholder="User name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {/* <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            /> */}
          </VStack>
          <br />
          <Menu closeOnSelect={false} mt={6}>
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
        </DrawerBody>
        <DrawerFooter>
          <Button mr={3} onClick={handleSaveSettings} style={{ padding: 40 }}>
            Save Profile
          </Button>

          <Button mr={3} onClick={handleSubmitFilters} style={{ padding: 40 }}>
            Apply Filters
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default UserProfileDrawer;
