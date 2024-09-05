import React from "react";
import { ToastContainer, toast } from "react-toastify";
import Box from "@mui/material/Box";

const warningColor = {
  background: "#505050",
  text: "#fff",
};

const successColor = {
  background: "#98FB98",
  text: "#000",
};

const errorColor = {
  background: "#F08080",
  text: "#000",
};

export const WarningMessage = function (message) {
  toast.warn(message, { ...warningColor, autoClose: 5000 });
};

export const SuccessMessage = function (message) {
  toast.success(message, { ...successColor, autoClose: 5000 });
};

export const ErrorMessage = function (message) {
  toast.error(message, { ...errorColor, autoClose: 5000 });
};

export default function Notification() {
  return (
    <Box
      color="white"
      p={3}
      position="fixed"
      top={60}
      left="48%"
      zIndex={10000} // Example z-index value, adjust as needed
      maxWidth="80vw"
    >
      <ToastContainer />
    </Box>
  );
}
