import { useState } from "react";
import { Modal, Form, Input, Select, Button, Spin } from "antd";
import { useRecoilValue, useRecoilState } from "recoil";
import { langState, authState } from "@/utils/atom";
import text from "@/text.json";
import { SuccessMessage, ErrorMessage } from "./Notification";
import { LoadingOutlined } from "@ant-design/icons";
import { checkAuth } from "@/utils/auth";

export default function EditRecord({ record, open, setOpen, fetchRecords }) {
  const [processing, setProcessing] = useState(false);
  const lang = useRecoilValue(langState);
  const [auth, setAuth] = useRecoilState(authState);
  const t = text[lang];

  const editRecord = (values) => {
    setProcessing(true);
    console.log(values);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/application/update`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth?.token}`,
      },
      body: JSON.stringify({ id: record.id, data: { ...record, values } }),
    })
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          SuccessMessage(t["Record Updated"]);
          fetchRecords();
          setOpen(false);
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Updating Record"]);
        }
      })
      .catch((err) => {
        console.error(err);
        openNotification("error", t["Error Updating Record"]);
      })
      .finally(() => setProcessing(false));
  };

  return (
    <Modal
      title={t["Edit Record"]}
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
    >
      <Form
        name="edit_record"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={editRecord}
        autoComplete="off"
        style={{ color: "#fff" }}
        labelAlign="left"
        initialValues={{
          registrationNumber: record?.registrationNumber || "",
          name: record?.name || "",
          pno: record?.pno || "",
          badgeNumber: record?.badgeNumber || "",
          mobile: record?.mobile || "",
          applicationDate: record?.applicationDate || "",
        }}
      >
        {auth.role === "admin" && (
          <Form.Item label={t["Registration No"]} name="registrationNumber">
            <Input lang={lang} type="number" />
          </Form.Item>
        )}
        {auth.role === "admin" && (
          <Form.Item label={t["Name"]} name="name">
            <Input lang={lang} type="text" />
          </Form.Item>
        )}
        <Form.Item label={t["PNO"]} name="pno">
          <Input type="number" />
        </Form.Item>
        {auth.role === "admin" && (
          <Form.Item label={t["Badge No"]} name="badgeNumber">
            <Input type="number" />
          </Form.Item>
        )}
        <Form.Item label={t["Mobile No"]} name="mobile">
          <Input type="number" />
        </Form.Item>
        {auth.role === "admin" && (
          <Form.Item label={t["Application Date"]} name="applicationDate">
            <Input type="text" />
          </Form.Item>
        )}
        <Form.Item style={{ margin: "auto" }} wrapperCol={{ span: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={processing}
            style={{ marginLeft: "50%", transform: "translateX(-50%)" }}
          >
            {processing && (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
            )}
            {t["Submit"]}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
