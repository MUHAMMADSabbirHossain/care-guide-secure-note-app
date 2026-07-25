import React, { Suspense } from "react";

const AdminNoteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Suspense>{children}</Suspense>
    </>
  );
};

export default AdminNoteLayout;
