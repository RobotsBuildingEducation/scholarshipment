// FileUpload.js
import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../database/setup";
import { Input } from "@chakra-ui/react";

export const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    console.log(e.target.files);
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        setError(error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onUploadSuccess(downloadURL);
          setFile(null);
          setProgress(0);
          setError("");
        });
      }
    );
  };

  return (
    <div>
      <Input multiple type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <div>{progress > 0 && `Upload is ${progress}% done`}</div>
      {error && <div>Error: {error}</div>}
    </div>
  );
};
