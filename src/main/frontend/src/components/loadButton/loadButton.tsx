import { useState } from "react";
import React from "react";
import "./loadButton.scss";
import axios from "axios";

export default function LoadButton() {
  const API_URL = "http://localhost:8080/api/auth/";
  const [selectedFile, setSelectedFile] = useState<File | null>()
  
  const onFileChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files)
      setSelectedFile(files[0])
  }
  const onFileUpload = () => {
    const formData = new FormData();
    if (selectedFile)
      formData.append('newFile', selectedFile, selectedFile.name)
      console.log(selectedFile)
      axios.post(API_URL, formData)
  }
  const fileData = () =>{
    if (selectedFile){
      return(
        <div>
          <h2>File Details:</h2>
          <p>
              File Name:{" "}
              {selectedFile.name}
          </p>

          <p>
              File Type:{" "}
              {selectedFile.type}
          </p>

          <p>
              Last Modified:{" "}
              {selectedFile.lastModified}
          </p>
      </div>
            );
        } else {
            return (
                <div>
                    <br />
                    <h4>
                        Choose before Pressing the Upload
                        button
                    </h4>
                </div>
            );
        }
    };
  return (
    <div>
      <label className="button-holder">
        <input
          className="show-button"
          type="file"
          onChange={onFileChange}
        />
        <span className="button-text">Show files</span>
      </label>
      <button onClick={onFileUpload}>Upload!</button>
      {fileData()}
    </div>
  );
}
