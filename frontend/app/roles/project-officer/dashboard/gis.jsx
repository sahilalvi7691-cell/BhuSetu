"use client";

import dynamic from "next/dynamic";
import React from "react";

const GisClient = dynamic(() => import("./gis.client"), { ssr: false });

const Gis = (props) => {
  return (
    <div className="h-full w-full">
      <GisClient {...props} />
    </div>
  );
};

export default Gis;