import React, { useEffect, useState } from "react";
import { Box, Text, Flex, Button, Textarea } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { CopyIcon } from "@chakra-ui/icons";

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
  fireScholarshipResponse,
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(content);
    setTimeout(() => setCopiedMessageId(null), 300);
  };

  const handleEditToggle = (content) => {
    setIsEditing(!isEditing);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    handleSave(editContent);
  };

  useEffect(() => {
    setIsGenerating(true);
    if (!isSending) {
      setIsGenerating(false);
    }
  }, [isSending]);

  const renderContent = (content, key) => (
    <Box key={key} bg="#F0F0F0" borderRadius="24px" p="24px" mb={4}>
      <Box display={"flex"} justifyContent={"flex-end"}>
        <Button
          size="sm"
          onClick={() => handleCopy(content)}
          backgroundColor={copiedMessageId === content ? "pink.100" : "white"}
          color={copiedMessageId === content ? "pink.600" : "black"}
        >
          <CopyIcon />
          {/* {copiedMessageId === content ? "Copied" : "Copy"} */}
        </Button>
        &nbsp;
      </Box>

      <Flex
        align="center"
        position="sticky"
        top="-8px"
        bg="#F0F0F0"
        zIndex="1"
        p={3}
        borderBottom="1px solid #ddd"
      >
        <Button size="sm" onClick={() => handleEditToggle(content)}>
          {isEditing ? "View" : "Edit"}
        </Button>
        &nbsp;
        <Button size="sm" onClick={handleSaveEdit}>
          Save
        </Button>
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

  return (
    <>
      <Text>
        Creates a draft essay based off user profile and scholarship data
      </Text>

      {existingDraft && renderContent(existingDraft, "existing-draft")}
      {/* {} */}
      {messages.length > 0 &&
        !existingDraft &&
        messages.map((msg, i) => {
          if (msg.role === "assistant") {
            return renderContent(msg.content, `msg-${ms.content}`);
          }
          return null;
        })}
      {fireScholarshipResponse.length > 0 &&
        !existingDraft &&
        renderContent(fireScholarshipResponse, `msg-${"x"}`)}
    </>
  );
};

export default AI;
