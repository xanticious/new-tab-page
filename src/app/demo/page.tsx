import { DatabaseDemo, ThemePreview } from "@/components";
import React from "react";

const DemoPage = () => {
  return (
    <div>
      <div className="pt-24 space-y-8">
        <ThemePreview />
        <DatabaseDemo />
      </div>
    </div>
  );
};

export default DemoPage;
