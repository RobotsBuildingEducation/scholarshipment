import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Textarea,
  Box,
  Text,
} from "@chakra-ui/react";
import AI from "./AI";

const AiDrawer = ({
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
  fireScholarshipResponse,
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
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={() => {
        resetMessages();
        setExistingDraft("");
        onClose();
      }}
      closeOnOverlayClick={true}
      blockScrollOnMount={false}
      preserveScrollBarGap={false}
      returnFocusOnClose={false}
    >
      <DrawerOverlay bg="rgba(0,0,0,0.1)" />

      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Draft</DrawerHeader>

        <DrawerBody>
          <AI
            fireScholarshipResponse={fireScholarshipResponse}
            existingDraft={existingDraft}
            messages={messages}
            handleSave={handleSave}
            isSending={isSending}
            original={original}
          />
        </DrawerBody>

        <DrawerFooter>
          <Button
            onClick={() => {
              resetMessages();
              setExistingDraft("");
              onClose();
            }}
          >
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AiDrawer;
