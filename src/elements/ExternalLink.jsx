import { Button, IconButton, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { TbLink } from "react-icons/tb";
import { TbLinkPlus } from "react-icons/tb";
import { RxExternalLink } from "react-icons/rx";

export const ExternalSiteIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="36px"
      height="36px"
    >
      <path d="M 35.478516 5.9804688 A 2.0002 2.0002 0 0 0 34.085938 9.4140625 L 35.179688 10.507812 C 23.476587 10.680668 14 20.256715 14 32 A 2.0002 2.0002 0 1 0 18 32 C 18 22.427546 25.627423 14.702715 35.154297 14.517578 L 34.085938 15.585938 A 2.0002 2.0002 0 1 0 36.914062 18.414062 L 41.236328 14.091797 A 2.0002 2.0002 0 0 0 41.228516 10.900391 L 36.914062 6.5859375 A 2.0002 2.0002 0 0 0 35.478516 5.9804688 z M 12.5 6 C 8.9338464 6 6 8.9338464 6 12.5 L 6 35.5 C 6 39.066154 8.9338464 42 12.5 42 L 35.5 42 C 39.066154 42 42 39.066154 42 35.5 L 42 28 A 2.0002 2.0002 0 1 0 38 28 L 38 35.5 C 38 36.903846 36.903846 38 35.5 38 L 12.5 38 C 11.096154 38 10 36.903846 10 35.5 L 10 12.5 C 10 11.096154 11.096154 10 12.5 10 L 20 10 A 2.0002 2.0002 0 1 0 20 6 L 12.5 6 z" />
    </svg>
  );
};
export const LinkIcon = () => {
  return (
    <svg
      width="36px"
      height="36px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.1625 18.4876L13.4417 19.2084C11.053 21.5971 7.18019 21.5971 4.79151 19.2084C2.40283 16.8198 2.40283 12.9469 4.79151 10.5583L5.51236 9.8374"
        stroke="#404040"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.8374 14.1625L14.1625 9.8374"
        stroke={"#404040"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.8374 5.51236L10.5583 4.79151C12.9469 2.40283 16.8198 2.40283 19.2084 4.79151C21.5971 7.18019 21.5971 11.053 19.2084 13.4417L18.4876 14.1625"
        stroke="#404040"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ExternalLink = ({
  textDisplay,
  link,
  color = "transparent",
  type,
  scholarshipID,
}) => {
  const [copyIsClicked, setCopyIsClicked] = useState(false);
  let toast = useToast();
  const handleClick = (e) => {
    if (type === "copyLink") {
      // Reset after 3 seconds
      setCopyIsClicked(true);
      e.preventDefault();
      navigator.clipboard.writeText(
        "https://girlsoncampus.app/" + scholarshipID
      );
      // .then(() => {
      //   toast({
      //     title: "Link copied",
      //     // description: "The link has been copied 📢 ❗❗❗❗❗",
      //     status: "info",
      //     duration: 2000,
      //     isClosable: true,
      //     position: "top",
      //   });
      // });
    }

    setTimeout(() => setCopyIsClicked(false), 400);
  };

  return (
    <a
      href={link}
      target={type === "externalWebsite" ? "_blank" : ""}
      style={{
        border: `1px solid ${copyIsClicked ? "purple" : color}`,
        color: "black",
        backgroundColor: color,
        borderRadius: "12px",
        margin: 6,
        textShadow: "0px 0px 0px black",
        display: "flex",
        width: "fit-content",
        justifyContent: "center",
        fontSize: 24,
      }}
      onClick={handleClick}
    >
      {type === "copyLink" ? (
        <IconButton variant="transparent" fontSize={24}>
          {copyIsClicked ? <TbLink color="purple" /> : <TbLink />}
        </IconButton>
      ) : (
        <IconButton variant="transparent" fontSize={24}>
          <RxExternalLink />
        </IconButton>
      )}
      {textDisplay}
    </a>
  );
};
