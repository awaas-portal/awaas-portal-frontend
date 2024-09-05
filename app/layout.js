"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { RecoilRoot } from "recoil";
import Notification from "@/components/Notification";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html>
      <meta charSet="UTF-8" />
      <body className={inter.className}>
        <Notification />
        <RecoilRoot>{children}</RecoilRoot>
      </body>
    </html>
  );
}
