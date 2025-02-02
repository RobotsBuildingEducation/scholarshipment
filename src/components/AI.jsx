import React, { useEffect, useState } from "react";
import { Box, Text, Flex, Button, Textarea, Spinner } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { TbEdit, TbEditOff, TbWriting } from "react-icons/tb";
import { FaCheck, FaCopy, FaSave } from "react-icons/fa";
import { RiAiGenerate } from "react-icons/ri";

const newTheme = {
  p: (props) => {
    const { children } = props;
    return (
      <Text mb={2} fontSize={"12px"}>
        {children}
      </Text>
    );
  },
};

const AI = ({
  messages,
  handleSave,
  isSending,
  existingDraft,
  original,
  selectedScholarship,
  onSend,
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (messages && messages?.length > 0) {
      setEditContent(messages[0].content);
    }
  }, [messages]);

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(content);
    setTimeout(() => setCopiedMessageId(null), 600);
  };

  const handleEditToggle = (content) => {
    setIsEditing(!isEditing);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    setIsSaved(true);
    handleSave(editContent);
    setTimeout(() => {
      setIsSaved(false);
    }, 600);
  };

  useEffect(() => {
    setIsGenerating(true);
    if (!isSending) {
      setIsGenerating(false);
    }
  }, [isSending]);

  const renderContent = (content, key) => {
    return (
      <Box key={key} bg="#F0F0F0" borderRadius="24px" p="24px" mb={4}>
        <Flex
          align="center"
          position="sticky"
          top="-8px"
          bg="#F0F0F0"
          zIndex="1"
          p={3}
          borderBottom="1px solid #ddd"
        >
          <Button
            size="sm"
            onClick={handleSaveEdit}
            aria-label="Save changes"
            mr={2}
          >
            {isSaved ? <FaCheck color="green" /> : <FaSave color="#4A5568" />}
          </Button>

          <Button
            size="sm"
            onClick={() => handleEditToggle(content)}
            aria-label={isEditing ? "View mode" : "Edit mode"}
            mr={2}
          >
            {isEditing ? <TbEditOff /> : <TbEdit color="#4A5568" />}
          </Button>
          {!isEditing && (
            <Button
              size="sm"
              onClick={() => handleCopy(content)}
              aria-label="Copy"
              mr={2}
            >
              {copiedMessageId === content ? (
                <FaCheck color="green" />
              ) : (
                <FaCopy color="#4A5568" />
              )}
            </Button>
          )}

          {!isEditing && (
            <Button
              color="#4A5568"
              size="sm"
              onClick={() => onSend(selectedScholarship, true)}
              aria-label="Save changes"
            >
              <RiAiGenerate />
            </Button>
          )}

          {/* {original ? (
          <Button size="sm" onClick={() => handleEditToggle(original)}>
            Reset
          </Button>
        ) : null} */}
        </Flex>
        <br />
        {isEditing ? (
          <Textarea
            mt={2}
            value={isGenerating ? msg.content : editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={45}
          />
        ) : (
          <ReactMarkdown
            components={ChakraUIRenderer(newTheme)}
            children={content}
            skipHtml
          />
        )}
      </Box>
    );
  };

  return (
    <>
      <Text>
        Creates a draft essay based off user profile and scholarship data
      </Text>

      {isSending ? <Spinner /> : null}
      {existingDraft && renderContent(existingDraft, "existing-draft")}
      {messages &&
        messages?.length > 0 &&
        !existingDraft &&
        messages.map((msg, i) => {
          // if (msg.role === "assistant") {
          return renderContent(msg.content, `msg-${i}`);
          // }
          // return null;
        })}
    </>
  );
};

export default AI;
