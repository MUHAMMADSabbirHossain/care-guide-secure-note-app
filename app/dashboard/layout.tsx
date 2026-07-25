import React, { Suspense } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Suspense fallback={<div>Loading search...</div>}>{children}</Suspense>
    </>
  );
};

export default DashboardLayout;
