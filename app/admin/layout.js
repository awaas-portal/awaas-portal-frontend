"use client";

import { Layout, Menu, Flex, Typography, Space, Button } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRecoilValue, useRecoilState } from "recoil";
import { langState, authState } from "@/utils/atom";
import text from "@/text.json";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import GroupIcon from "@mui/icons-material/Group";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import FolderIcon from "@mui/icons-material/Folder";
import NoteIcon from "@mui/icons-material/Note";
import { logOut } from "@/utils/auth";
import WithAuthorization from "@/components/WithAuth";
import { useRouter } from "next/navigation";

const { Sider, Content, Header } = Layout;
export default function DashboardWrapper({ children }) {
  const pathname = usePathname();
  const t = text[useRecoilValue(langState)];
  const [auth, setAuth] = useRecoilState(authState);
  const router = useRouter();

  return (
    <WithAuthorization>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          width={200}
          style={{
            maxHeight: "100vh",
            position: "sticky",
            left: 0,
            top: 0,
          }}
        >
          <Link href="/">
            <Typography.Title
              level={3}
              style={{ color: "white", textAlign: "center" }}
            >
              {t["Awas Portal"]}
            </Typography.Title>
          </Link>
          <Menu
            mode="inline"
            defaultSelectedKeys={
              pathname.split("/")[2] === "records"
                ? pathname.split("/").length <= 3
                  ? ["1"]
                  : ["2"]
                : pathname.split("/")[2] === "notices"
                ? ["3"]
                : ["4"]
            }
            theme="dark"
            style={{
              borderRight: 0,
              padding: "0 10px",
              marginLeft: "auto",
            }}
            items={[
              {
                key: "1",
                label: <Link href="/admin/records">{t["Records"]}</Link>,
                icon: <FolderIcon />,
              },
              {
                key: "2",
                label: (
                  <Link href="/admin/records/add">{t["Add Records"]}</Link>
                ),
                icon: <CreateNewFolderIcon />,
              },
              {
                key: "3",
                label: <Link href="/admin/notices">{t["Notices"]}</Link>,
                icon: <NoteIcon />,
              },
              auth?.role === "admin" && {
                key: "4",
                label: <Link href="/admin/users">{t["Users"]}</Link>,
                icon: <GroupIcon />,
              },
            ]}
          />
          <div style={{ marginLeft: "20px", marginTop: "20px" }}>
            <LanguageSwitcher />
          </div>
        </Sider>
        <Layout style={{ background: "white" }}>
          <Header style={{ position: "sticky", top: "0", zIndex: 1000 }}>
            <Flex justify="flex-end" align="center">
              <Menu
                theme="dark"
                mode="horizontal"
                disabledOverflow
                defaultSelectedKeys={
                  pathname.split("/")[1] === "" ? ["1"] : ["2"]
                }
                items={[
                  {
                    key: "1",
                    label: <Link href="/">{t["Home"]}</Link>,
                    icon: <HomeIcon />,
                  },
                  {
                    key: "2",
                    label: <Link href="/admin">{t["Admin"]}</Link>,
                    icon: <AdminPanelSettingsIcon />,
                  },
                ]}
              />
              <Button
                onClick={() =>
                  logOut().then(() => {
                    setAuth(null);
                    localStorage.removeItem("auth");
                    router.push("/admin");
                  })
                }
                style={{ marginLeft: "15px" }}
              >
                Logout
              </Button>
            </Flex>
          </Header>
          <Content
            style={{
              margin: 0,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </WithAuthorization>
  );
}
