import { useState } from "react";
import { Form, Input, Button, Spin, Upload, Modal } from "antd";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, langState } from "@/utils/atom";
import text from "@/text.json";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { SuccessMessage, ErrorMessage } from "./Notification";
import { checkAuth } from "@/utils/auth";

export default function NoticeForm({
  mode,
  notice,
  open,
  setOpen,
  fetchNotices,
}) {
  const [processing, setProcessing] = useState(false);
  const t = text[useRecoilValue(langState)];
  const [auth, setAuth] = useRecoilState(authState);

  const addNotice = (values) => {
    setProcessing(true);

    console.log(values);
    const formData = new FormData();
    formData.append("file", values.file.file);
    formData.append(
      "data",
      JSON.stringify({
        heading: values.heading,
        type: values.type,
      })
    );

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/general`, {
      method: "PUT",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
      body: formData,
    })
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          SuccessMessage(t["Notice Added"]);
          setOpen(false);
          fetchNotices();
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Adding Notice"]);
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorMessage(t["Error Adding Notice"]);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  const editNotice = (values) => {
    setProcessing(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/update`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth?.token}`,
      },
      body: JSON.stringify({ id: notice.id, data: values }),
    })
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          SuccessMessage(t["Notice Updated"]);
          setOpen(false);
          fetchNotices();
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Updating Notice"]);
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorMessage(t["Error Updating Notice"]);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };
  const beforeUpload = () => false;

  return (
    <Modal
      title={mode === "add" ? t["Add Notice"] : t["Edit Notice"]}
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
    >
      <Form
        name="add_notice"
        labelCol={{ xs: { span: 24 }, sm: { span: 8 } }}
        wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }}
        onFinish={mode === "add" ? addNotice : editNotice}
        autoComplete="off"
        initialValues={mode === "edit" ? notice : null}
        style={{ width: "90%", maxWidth: "600px", margin: "auto" }}
      >
        <Form.Item label={t["Heading"]} name="heading" required>
          <Input type="text" />
        </Form.Item>
        {mode === "add" && (
          <Form.Item
            valuePropName="file"
            label={t["Upload File"]}
            name="file"
            required
          >
            <Upload
              name="logo"
              customRequest={dummyRequest}
              beforeUpload={beforeUpload}
              listType="picture"
              accept=".pdf"
              valuePropName="file"
            >
              <Button variant="contained" component="span">
                {t["Select File"]}
              </Button>
            </Upload>
          </Form.Item>
        )}
        <Form.Item
          label={t["Notice Type"]}
          name="type"
          required
          style={{ marginBottom: "10px" }}
        >
          <Input type="text" />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 24 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button type="primary" htmlType="submit" disabled={processing}>
              {processing && (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              )}
              {t["Submit"]}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
