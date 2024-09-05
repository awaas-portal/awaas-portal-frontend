import { List, Divider, Typography, Flex } from "antd";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="footer" style={{ padding: "10px 10%" }}>
      <Typography.Paragraph style={{ textAlign: "center" }}>
        © Copyright 2024. All Rights Reserved
      </Typography.Paragraph>
    </div>
  );
}
