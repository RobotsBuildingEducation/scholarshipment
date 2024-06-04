import React, { useState } from "react";
import { Button, Tooltip } from "@chakra-ui/react";
import { CopyToClipboard } from "react-copy-to-clipboard";

const CopyButton = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CopyToClipboard text={content} onCopy={handleCopy}>
      <Tooltip label="Copied!" isOpen={copied} hasArrow>
        <Button size="sm" onClick={handleCopy}>
          Copy
        </Button>
      </Tooltip>
    </CopyToClipboard>
  );
};

export default CopyButton;
