import React from "react";
import { isDesktop, isMobile } from "react-device-detect";
import { useMediaQuery } from "react-responsive";
import { MdWarningAmber } from "react-icons/md"; // ⚠️ Warning icon

const Warning = ({ children }) => {
  // Detect mobile view width
  const isMobileView = useMediaQuery({ query: "(max-width: 428px)" });

  // Show mobile content if device is mobile OR viewport is small
  const shouldShowMobile = isMobile || isMobileView || isDesktop;

  return shouldShowMobile ? (
    children
  ) : (
    <div className="flex justify-center items-center my-40 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center border border-yellow-400">
        <MdWarningAmber className="text-6xl text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Access Restricted
        </h2>
        <p className="text-gray-600">
          This page is only available on{" "}
          <span className="font-semibold text-sky-600">mobile devices</span>.
        </p>
      </div>
    </div>
  );
};

export default Warning;