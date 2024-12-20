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
  Textarea,
  NumberInput,
  NumberInputField,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
} from "@chakra-ui/react";

const EditScholarshipDrawer = ({ isOpen, onClose, scholarship, onUpdate }) => {
  const [formData, setFormData] = useState({ ...scholarship });
  const [tagInput, setTagInput] = useState("");
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAmountChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      amount: value,
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData((prevData) => ({
        ...prevData,
        tags: [...prevData.tags, tagInput],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      tags: prevData.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
    toast({
      title: "Scholarship Updated.",
      description: "The scholarship has been updated successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      closeOnOverlayClick={false}
      blockScrollOnMount={false}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Edit Scholarship</DrawerHeader>
        <DrawerBody>
          <FormControl id="name" mb={4}>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </FormControl>
          <FormControl id="dueDate" mb={4}>
            <FormLabel>Due Date</FormLabel>
            <Input
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="year" mb={4}>
            <FormLabel>Year</FormLabel>
            <Input
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="eligibility" mb={4}>
            <FormLabel>Eligibility</FormLabel>
            <Input
              name="eligibility"
              value={formData.eligibility}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="major" mb={4}>
            <FormLabel>Major</FormLabel>
            <Input
              name="major"
              value={formData.major}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="amount" mb={4}>
            <FormLabel>Amount</FormLabel>
            <NumberInput value={formData.amount} onChange={handleAmountChange}>
              <NumberInputField />
            </NumberInput>
          </FormControl>
          <FormControl id="ethnicity" mb={4}>
            <FormLabel>Ethnicity</FormLabel>
            <Input
              name="ethnicity"
              value={formData.ethnicity}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="link" mb={4}>
            <FormLabel>Link</FormLabel>
            <Input
              name="link"
              type="url"
              value={formData.link}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="tags" mb={4}>
            <FormLabel>Tags (press enter to create)</FormLabel>
            <Input
              value={tagInput}
              onChange={handleTagInputChange}
              placeholder="Add a tag and press enter"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <HStack spacing={4} mt={2}>
              {formData.tags.map((tag, index) => (
                <Tag
                  key={index}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="teal"
                >
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                </Tag>
              ))}
            </HStack>
          </FormControl>
          <FormControl id="details" mb={4}>
            <FormLabel>Details</FormLabel>
            <Textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="meta" mb={4}>
            <FormLabel>Meta</FormLabel>
            <Textarea
              name="meta"
              value={formData.meta}
              onChange={handleChange}
              placeholder="Add content about the resource to inform the AI when users ask to generate content"
            />
          </FormControl>
          <FormControl id="isHighschool" mb={4}>
            <Checkbox
              name="isHighschool"
              isChecked={formData.isHighschool}
              onChange={handleChange}
            >
              Highschool
            </Checkbox>
          </FormControl>
          <FormControl id="isCollege" mb={4}>
            <Checkbox
              name="isCollege"
              isChecked={formData.isCollege}
              onChange={handleChange}
            >
              College
            </Checkbox>
          </FormControl>
          <FormControl id="isUnderserved" mb={4}>
            <Checkbox
              name="isUnderserved"
              isChecked={formData.isUnderserved}
              onChange={handleChange}
            >
              Underserved
            </Checkbox>
          </FormControl>
          <FormControl id="isInternational" mb={4}>
            <Checkbox
              name="isInternational"
              isChecked={formData.isInternational}
              onChange={handleChange}
            >
              International
            </Checkbox>
          </FormControl>
          <FormControl id="isStateOnly" mb={4}>
            <Checkbox
              name="isStateOnly"
              isChecked={formData.isStateOnly}
              onChange={handleChange}
            >
              State Only
            </Checkbox>
          </FormControl>
          <FormControl id="isSpotlight" mb={4}>
            <Checkbox
              name="isSpotlight"
              isChecked={formData.isSpotlight}
              onChange={handleChange}
            >
              Spotlight
            </Checkbox>
          </FormControl>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="teal" onClick={handleSubmit}>
            Update Scholarship
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditScholarshipDrawer;
