import React from "react";
import styles from "../Styles/SelectBox.module.css";

const SelectBox = ({ id, select }) => {
  return (
    <div className={styles.select}>
      <select id={id} onChange={select}>
        <option value="">Select Language</option>
        <option value="en">English</option>
        <option value="hi"> Hindi</option>
        <option value="es">Spanish</option>
        <option value="de">German</option>
        <option value="fr"> French</option>
        <option value="tr"> Turkish</option>
      </select>
    </div>
  );
};

export default SelectBox;
