import React, { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa"; // Download icon
import { Link } from "react-router-dom"; // Assuming you're using react-router for navigation
import firstHeder from "../../assets/images/ad-1.png";
import secondHeder from "../../assets/images/ad-small-1.png";
import icon from "../../assets/images/ad-small-2.png";
import image from "../../assets/images/ad-21.png";
const HeroArea: React.FC = () => {
  const [isMobileView, setIsMobileView] = useState<boolean>(
    window.innerWidth <= 639
  );
  const [isExactWidth639, setIsExactWidth639] = useState<boolean>(
    window.innerWidth === 639
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 639);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsExactWidth639(window.innerWidth <= 639); // Update state when width is exactly 639px
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="w-full space-y-4 mt-3 px-4">
      {!isExactWidth639 && (
        <div>
          <img src={firstHeder} />
        </div>
      )}

      {isMobileView && (
        <div>
          <img src={secondHeder} />
        </div>
      )}

      {!isExactWidth639 && (
        <div>
          <img src={image} />
        </div>
      )}

      {isMobileView && (
        <div>
          <img src={icon} />
        </div>
      )}
    </div>
  );
};

export default HeroArea;
