import PreLoader from "@repo/ui/pre-loader";
import { useAuthContext } from "../provider/AuthProvider";
import React from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: any }) => {
  const navigate = useNavigate();
  const { authUser, loading } = useAuthContext();

  if (loading) {
    return <PreLoader />;
  }

  if (!authUser) {
    // navigate("/auth");
  }

  return <>{children}</>;
};

export default ProtectedRoute;
