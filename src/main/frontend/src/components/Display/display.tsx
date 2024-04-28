import { useState } from "react";
import React from "react";
import "./display.scss";

export default function Display() {
  const [show, setClicked] = useState(false);
  function handleChange(event: any) {
    setClicked(event.target.checked);
  }
  return (
    <>
      <label className="button-holder">
        <input
          className="show-button"
          type="checkbox"
          checked={show}
          onChange={handleChange}
        />
        <span className="button-text">Show files</span>
      </label>
    </>
  );
}
