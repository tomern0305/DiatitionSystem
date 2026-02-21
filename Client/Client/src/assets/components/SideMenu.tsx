import React, { useState } from "react";
import "./SideMenu.css";

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`side-menu ${isOpen ? "open" : ""}`}>
      <button className="menu-toggle" onClick={toggleMenu}>
        {isOpen ? "X" : "☰"}
      </button>
      <div className="menu-content">
        <h3>תפריט</h3>
        <ul>
          <li>מסך ראשי</li>
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
