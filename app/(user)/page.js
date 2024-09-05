"use client";

import { useState, useEffect, useRef } from "react";
import { List, Spin, Flex, Form, Input, Descriptions, Divider } from "antd";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Button,
} from "@mui/material";
import { langState } from "@/utils/atom";
import { useRecoilValue } from "recoil";
import { AuditOutlined, CreditCardOutlined } from "@ant-design/icons";
import text from "@/text.json";
import { LoadingOutlined } from "@ant-design/icons";
import { SuccessMessage, ErrorMessage } from "@/components/Notification";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

export default function Home() {
  const [notices, setNotices] = useState([]);
  const lang = useRecoilValue(langState);
  const t = text[lang];
  const [client, setClient] = useState(false);
  const [application, setApplication] = useState(null);
  const [processing, setProcessing] = useState(false);
  const statusRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const contacts = [
    {
      department: "Awas Cell",
      contact: "Police Lines, Kanpur Nagar commissionerate",
    },
    { department: "ACP Lines", contact: "Email: lineacp89@gmail.com" },
    {
      department: "DCP Headquarters",
      contact: "Email: dcphqknr@gmail.com / CUG No: 9454400579",
    },
  ];

  const fetchStatus = (values) => {
    setProcessing(true);
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/application/active/info?id=${values.id}`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setApplication(data.message);
          console.log(application);
          SuccessMessage(t["Application Loaded"]);
        } else {
          setApplication(null);
          if (data.message === "No application found") {
            ErrorMessage(t["No Application Found"]);
            return;
          }
          console.error(data.message);
          ErrorMessage(t["Error Loading Application"]);
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorMessage(t["Error Loading Application"]);
      })
      .finally(() => setProcessing(false));
  };

  useEffect(() => {
    setClient(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/all`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setNotices(data.message);
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Loading Notices"]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return !loading ? (
    <div>
      <Flex
        style={{ backgroundColor: "#d5f2fe" }}
        align="center"
        justify="space-evenly"
        className="flex-normal"
        id="home"
      >
        <img
          src="1.png"
          alt="landing_image"
          style={{
            width: client && window.innerWidth < 768 ? "70%" : "40%",
            paddingTop: client && window.innerWidth < 768 ? "40px" : 0,
            maxWidth: "500px",
          }}
        />
        <div
          style={{
            marginBottom: client && window.innerWidth < 768 ? "10%" : "5%",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" component="h3" align="center" m={5}>
            {t["Awas Portal"]}
          </Typography>

          <Button
            type="link"
            onClick={() => {
              if (statusRef.current) {
                statusRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "nearest",
                });
              }
            }}
          >
            <Typography variant="h5" component="h5">
              {t["Check Allocation Status"]}
            </Typography>
          </Button>
        </div>
      </Flex>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-evenly",
          padding: "50px 0",
          alignItems: "stretch",
        }}
        className="flex"
      >
        <section id="notices" style={{ flex: 1 }}>
          <Typography variant="h4" align="center" my={4}>
            {t["Notices"]}
          </Typography>
          <div style={{ width: "90%", margin: "auto" }}>
            <List
              itemLayout="vertical"
              size="small"
              pagination={{
                onChange: (page) => {
                  console.log(page);
                },
                pageSize: 5,
              }}
              dataSource={notices.sort(
                (a, b) => new Date(b.releasedOn) - new Date(a.releasedOn)
              )}
              renderItem={(notice) => (
                <List.Item
                  key={notice.heading}
                  extra={
                    <div className="pdf-container">
                      <div className="pdf-link">
                        <iframe
                          src={notice.url}
                          title="PDF Preview"
                          width="100%"
                          className="pdf-iframe"
                        ></iframe>
                      </div>
                      <a
                        target="_blank"
                        href={notice.url}
                        className="pdf-overlay"
                      >
                        View
                      </a>
                    </div>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      notice.type === "allotment" ? (
                        <AuditOutlined />
                      ) : (
                        <CreditCardOutlined />
                      )
                    }
                    title={
                      <a target="_blank" href={notice.url}>
                        {notice.heading}{" "}
                      </a>
                    }
                    description={`${t["Release Date"]}: ${new Date(
                      notice.releasedOn
                    ).toLocaleDateString("en-GB")}, ${t["Notice Type"]}: ${
                      notice.type
                    }`}
                  />
                  <a href={notice.url} target="_blank">
                    <Button variant="outlined" startIcon={<PictureAsPdfIcon />}>
                      {t["View Notice"]}
                    </Button>
                  </a>
                </List.Item>
              )}
            />
          </div>
        </section>

        <Divider
          type="vertical"
          style={{
            borderInlineStartWidth: "4px",
            alignSelf: "center",
            height: "300px",
          }}
          className="desktop"
        />

        <section
          ref={statusRef}
          id="status"
          style={{ width: "50%", margin: "0 auto" }}
        >
          <Typography variant="h4" align="center" gutterBottom my={4}>
            {t["Check Allocation Status"]}
          </Typography>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              flexDirection: "column",
            }}
          >
            <Form
              name="status"
              onFinish={fetchStatus}
              autoComplete="off"
              layout="inline"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
              labelAlign="left"
            >
              <Form.Item label={t["Enter PNO"]} name="id" required>
                <Input />
              </Form.Item>
              <Form.Item wrapperCol={{ span: 24 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={processing}
                  style={{ marginLeft: "50%", transform: "translateX(-50%)" }}
                  startIcon={
                    processing && (
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 24 }} spin />
                        }
                      />
                    )
                  }
                >
                  {t["Submit"]}
                </Button>
              </Form.Item>
            </Form>
            {application && (
              <Descriptions
                title={
                  <Typography variant="h5" align="center">
                    {t["Application Info"]}
                  </Typography>
                }
                items={[
                  {
                    key: 1,
                    label: t["Name"],
                    children: application["name"],
                  },
                  {
                    key: 2,
                    label: t["PNO"],
                    children: application["pno"],
                  },
                  {
                    key: 3,
                    label: t["Badge No"],
                    children: application["badgeNumber"],
                  },
                  {
                    key: 4,
                    label: t["Rank"],
                    children: application["officerRank"],
                  },
                  {
                    key: 5,
                    label: t["Application Date"],
                    children: application["applicationDate"],
                  },
                  {
                    key: 6,
                    label: t["Registration No"],
                    children: application["registrationNumber"],
                  },
                  {
                    key: 7,
                    label: t["Initial Waiting"],
                    children: application["initialWaiting"],
                  },
                  {
                    key: 8,
                    label: t["Current Waiting"],
                    children: application["currentWaiting"],
                    labelStyle: { backgroundColor: "#1976d2", color: "white" },
                  },
                  {
                    key: 9,
                    label: t["Mobile No"],
                    children: application["mobile"],
                  },
                ]}
                style={{
                  width: "95%",
                  margin: "auto",
                  marginTop: "30px",
                }}
                bordered
                labelStyle={{ backgroundColor: "#d5f2fe" }}
              />
            )}
          </div>
        </section>
      </div>

      <Container id="contact" style={{ minWidth: "90%" }}>
        <Typography variant="h4" align="center" gutterBottom my={4}>
          Contact Us
        </Typography>
        <Grid
          container
          spacing={3}
          alignItems="stretch"
          style={{ marginTop: 0, marginLeft: 0, width: "100%" }}
        >
          {contacts.map((contact, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              lg={index < 3 ? 4 : 6}
              key={index}
              style={{
                minHeight: "100%",
                paddingTop: "10px",
                paddingRight: "12px",
                paddingLeft: "12px",
              }}
            >
              <Card
                style={{
                  boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
                  },
                  height: "100%",
                }}
                elevation={3}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    component="h2"
                    style={{
                      marginBottom: "8px",
                    }}
                  >
                    {contact.department}
                  </Typography>
                  {contact.contact.split("/").map((line, index) => (
                    <Typography key={index} color="textSecondary">
                      {line}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  ) : (
    <Spin spinning={true} fullscreen />
  );
}
