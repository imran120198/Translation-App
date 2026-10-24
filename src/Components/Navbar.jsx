import React from "react";
import { MdTranslate } from "react-icons/md";

const Navbar = () => {
  return (
    <header className="navbarContainer">
      <div className="navbarContent">
        <div className="logoGroup">
          <div className="logoIconWrapper">
            <MdTranslate className="logoIcon" />
          </div>
          <div>
            <div className="titleRow">
              <h1 className="brandTitle">Language Translator App</h1>
            </div>
            <p className="brandSubtitle">Instant Neural Translation & Multilingual Voice</p>
          </div>
        </div>

        <div className="navStatusBadge">
          <span className="statusDot"></span>
          <span className="statusText">Voice & Neural Engine Active</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
