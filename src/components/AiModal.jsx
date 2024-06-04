import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Textarea,
  Box,
  Text,
} from "@chakra-ui/react";
import AI from "./AI";

const AiModal = ({
  isOpen,
  onClose,
  messages,
  handleFormSubmit,
  isSending,
  resetMessages,
  onSaveDraft,
  existingDraft,
  setExistingDraft,
  original,
}) => {
  const [draftContent, setDraftContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");

  useEffect(() => {
    if (messages.length > 0) {
      setOriginalContent(messages[messages.length - 1].content);
      setDraftContent(messages[messages.length - 1].content);
    }
  }, [messages]);

  const handleSave = (content = null) => {
    if (content) {
      onSaveDraft(content, originalContent);
    } else {
      onSaveDraft(draftContent, originalContent);
    }

    setExistingDraft(content);
    // onClose();
  };

  return (
    <Modal
      size={"full"}
      isOpen={isOpen}
      onClose={() => {
        resetMessages();
        setExistingDraft("");
        onClose();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Draft</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* {originalContent && (
            <Box mb={4}>
              <Text fontWeight="bold">Original Draft:</Text>
              <Textarea mt={2} value={originalContent} isReadOnly size="sm" />
            </Box>
          )} */}

          <AI
            existingDraft={existingDraft}
            messages={messages}
            handleSave={handleSave}
            isSending={isSending}
            original={original}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              resetMessages();
              setExistingDraft("");
              onClose();
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AiModal;
