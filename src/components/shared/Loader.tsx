// const Loader = ({ fullscreen }: { fullscreen?: boolean }) => {
//   const loaderImg = (
//     <span className="w-3 h-3 rounded-full my-6 mx-auto block relative text-[#0c831f] _loader"></span>
//   );
//   return fullscreen ? (
//     <div className="h-scrren w-screen flex items-center justify-center fixed inset-0 z-50">
//       {loaderImg}
//     </div>
//   ) : (
//     loaderImg
//   );
// };

// export default Loader;

import React from "react";
import "./Loader.css"; // Ensure you include this CSS file

const Loader = () => {
  return (
    <div className="w-full absolute h-full top-0 left-0 flex justify-center items-center">
      <div className="loader3">
        <div className="circle1"></div>
        <div className="circle1"></div>
        <div className="circle1"></div>
        <div className="circle1"></div>
        <div className="circle1"></div>
      </div>
    </div>
  );
};

export default Loader;
