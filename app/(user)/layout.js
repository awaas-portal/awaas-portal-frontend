"use client";

import { useEffect, useState } from "react";
import { Layout, Menu, Typography, Flex, Space } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import { useRecoilValue } from "recoil";
import { langState } from "@/utils/atom";
import text from "@/text.json";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HomeIcon from "@mui/icons-material/Home";

const { Header, Content, Footer: FooterContainer } = Layout;
const { Title } = Typography;

const RootLayout = ({ children }) => {
  const currentURL = usePathname();
  const lang = useRecoilValue(langState);
  const t = text[lang];
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  const menuItems = [
    {
      key: "1",
      label: <Link href="/">{t["Home"]}</Link>,
      icon: <HomeIcon />,
    },
    client &&
      window.innerWidth > 768 && {
        key: "2",
        label: <Link href="/admin">{t["Admin"]}</Link>,
        icon: <AdminPanelSettingsIcon />,
      },
  ];

  return (
    <Layout
      style={{
        minHeight: "100vh",
        fontFamily: lang === "hi" ? "Mangal" : "Roboto",
      }}
    >
      <Header
        style={{
          position: "sticky",
          top: "0",
          zIndex: 1000,
          height: "max-content",
        }}
      >
        <Flex justify="space-between" align="center">
          <Link href="/">
            <Title level={3} style={{ color: "white", margin: 0 }}>
              {t["Awas Portal"]}
            </Title>
          </Link>

          <Space className="desktop">
            <Menu
              theme="dark"
              mode="horizontal"
              disabledOverflow
              defaultSelectedKeys={
                currentURL.split("/")[1] === "" ? ["1"] : ["2"]
              }
              items={menuItems}
            />
            <LanguageSwitcher />
          </Space>
          <div className="mobile">
            <LanguageSwitcher />
          </div>
        </Flex>
      </Header>

      <Content
        style={{
          margin: 0,
          minHeight: "100%",
          backgroundColor: "white",
          paddingBottom: "50px",
        }}
      >
        {children}
      </Content>

      <FooterContainer style={{ backgroundColor: "#d5f2fe" }}>
        <Footer />
      </FooterContainer>
    </Layout>
  );
};

export default RootLayout;
