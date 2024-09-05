"use client";

import { useState, useRef } from "react";
import { Input, Space, Form, Upload, Spin, Select, DatePicker } from "antd";
import { Typography, Button } from "@mui/material";
import { LoadingOutlined } from "@ant-design/icons";
import { authState, langState } from "@/utils/atom";
import { useRecoilValue, useRecoilState } from "recoil";
import text from "@/text.json";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { SuccessMessage, ErrorMessage } from "@/components/Notification";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/utils/auth";
import { waitingLists } from "../page";
import krutidevUnicode from "@anthro-ai/krutidev-unicode";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const AddRecords = () => {
  const [processing, setProcessing] = useState(false);
  const lang = useRecoilValue(langState);
  const [auth, setAuth] = useRecoilState(authState);
  const t = text[lang];
  const form = useRef();
  const rankMap = Object.fromEntries(
    Object.keys(waitingLists)
      .map((key) => waitingLists[key].map((r) => [text["hi"][r], key]))
      .flat()
  );
  const router = useRouter();

  const addRecords = (jsonData) =>
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/application/active/create/many`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({ applications: jsonData }),
      }
    )
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          SuccessMessage(t["Records Added"]);
          form.current.resetFields();
          router.push("/admin/records");
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Adding Records"]);
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorMessage(t["Error Adding Records"]);
      })
      .finally(() => setProcessing(false));

  const handleAddRecords = (data) => {
    let jsonData;
    if (data.method === "sheet") {
      const reader = new FileReader();

      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, {
          type: "array",
        });

        // Assuming your Excel file has a sheet named 'Sheet1'
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse the sheet data into a JSON object
        jsonData = XLSX.utils
          .sheet_to_json(sheet, {
            dateNF: "dd/mm/yyyy",
            raw: false,
            cellDates: true,
            cellDated: function (cell, date) {
              if (XLSX.SSF.is_date(date)) {
                return new Date(date).toLocaleDateString("en-GB");
              }
              return cell.w;
            },
          })
          .map((record) => {
            const strippedRecord = {};
            Object.entries(record).forEach(([key, value]) => {
              const strippedKey = krutidevUnicode(key.trim());
              const strippedValue =
                typeof value === "string" ? value.trim() : value;
              strippedRecord[strippedKey] = strippedValue;
            });

            return {
              name:
                krutidevUnicode(strippedRecord[text["hi"]["Name"]] || "") ||
                "-",
              officerRank: krutidevUnicode(
                strippedRecord[text["hi"]["Rank"]] || ""
              ),
              pno: strippedRecord[text["hi"]["PNO"]],
              badgeNumber:
                krutidevUnicode(strippedRecord[text["hi"]["Badge No"]] || "") ||
                "-",
              mobile:
                krutidevUnicode(
                  strippedRecord[text["hi"]["Mobile No"]] || ""
                ) || "-",
              registrationNumber:
                krutidevUnicode(
                  strippedRecord[text["hi"][`Registration No`]] || ""
                ) || "-",
              applicationDate: strippedRecord[text["hi"][`Application Date`]]
                .split(/[-./]/)
                .reduce((acc, val) => (acc ? acc + "/" + val : val), ""),
              rank:
                rankMap[
                  krutidevUnicode(strippedRecord[text["hi"]["Rank"]] || "")
                ] || "-",
            };
          });

        console.log(jsonData);

        if (jsonData.length === 0) {
          ErrorMessage(t["No Records Found"]);
          setProcessing(false);
          return;
        }
        if (!jsonData.every((record) => record.rank)) {
          ErrorMessage(t["Invalid Rank"]);
          setProcessing(false);
          return;
        }

        // setProcessing(false);
        addRecords(jsonData);
      };

      setProcessing(true);
      reader.readAsArrayBuffer(data.excel_sheet.file);
    } else {
      setProcessing(true);

      jsonData = data.records.map((record) => {
        console.log(record);
        const date = new Date(record.applicationDate["$d"]).getDate();
        const month = new Date(record.applicationDate["$d"]).getMonth() + 1;
        const year = new Date(record.applicationDate["$d"]).getFullYear();

        return {
          ...record,
          rank: rankMap[text["hi"][record.rank]],
          officerRank: t[record.rank],
          applicationDate: `${date}/${month}/${year}`,
        };
      });

      if (jsonData.length === 0) {
        ErrorMessage(t["No Records Found"]);
        setProcessing(false);
        return;
      }
      if (!jsonData.every((record) => record.rank)) {
        ErrorMessage(t["Invalid Rank"]);
        setProcessing(false);
        return;
      }

      addRecords(jsonData);
    }
  };

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };
  const beforeUpload = () => false;

  return (
    <div>
      <Typography variant="h4" component="h4" align="center" m={5}>
        {t["Add Records"]}
      </Typography>
      <Form
        ref={form}
        name="add_records"
        onFinish={handleAddRecords}
        autoComplete="off"
      >
        <Space
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <Form.Item
            label={t["Input Method"]}
            name="method"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              placeholder={t["Select Method"]}
              options={[
                { label: t["Excel Sheet"], value: "sheet" },
                { label: t["Manual Input"], value: "manual" },
              ]}
            />
          </Form.Item>
          <Form.Item
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.method !== currentValues.method
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("method") === "sheet" && (
                <Space
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  <Form.Item
                    name="excel_sheet"
                    required
                    style={{ minWidth: "max-content" }}
                    valuePropName="file"
                  >
                    <Upload
                      name="logo"
                      customRequest={dummyRequest}
                      beforeUpload={beforeUpload}
                      listType="picture"
                    >
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={processing}
                        startIcon={<FileUploadIcon />}
                      >
                        {t["Select Excel Sheet"]}
                      </Button>
                    </Upload>
                  </Form.Item>
                  <Button
                    variant="contained"
                    disabled={processing}
                    type="submit"
                    startIcon={
                      processing ? (
                        <Spin
                          indicator={
                            <LoadingOutlined style={{ fontSize: 16 }} spin />
                          }
                        />
                      ) : null
                    }
                  >
                    {t["Submit"]}
                  </Button>
                </Space>
              )
            }
          </Form.Item>
        </Space>
        <Form.Item
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.method !== currentValues.method
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("method") === "manual" && (
              <Form.List
                name="records"
                rules={[
                  {
                    validator: async (_, records) => {
                      if (!records) {
                        return Promise.reject(
                          new Error("Enter at least 1 record")
                        );
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    <Space
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        position: "absolute",
                        right: "20%",
                        bottom: "100%",
                        width: "max-content",
                      }}
                    >
                      <Form.Item>
                        <Button
                          variant="outlined"
                          onClick={() => add()}
                          startIcon={<PlusOutlined />}
                          disabled={processing}
                        >
                          {t["Add Record"]}
                        </Button>
                        <Form.ErrorList errors={errors} />
                      </Form.Item>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={processing}
                        startIcon={
                          processing ? (
                            <Spin
                              indicator={
                                <LoadingOutlined
                                  style={{ fontSize: 16 }}
                                  spin
                                />
                              }
                            />
                          ) : null
                        }
                      >
                        {t["Submit"]}
                      </Button>
                    </Space>

                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        direction="vertical"
                        style={{
                          display: "flex",
                          justifyContent: "space-evenly",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Space>
                          <Form.Item
                            {...restField}
                            label={t["Registration No"]}
                            name={[name, "registrationNumber"]}
                            required
                          >
                            <Input lang={lang} type="number" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            label={t["Name"]}
                            name={[name, "name"]}
                            required
                          >
                            <Input lang={lang} type="text" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            label={t["Application Date"]}
                            name={[name, "applicationDate"]}
                            required
                          >
                            <DatePicker format="DD/MM/YYYY" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            label={t["Rank"]}
                            name={[name, "rank"]}
                            required
                          >
                            <Select
                              placeholder={t["Select Rank"]}
                              options={[
                                { label: t["inspector"], value: "inspector" },
                                { label: t["si"], value: "si" },
                                { label: t["hc"], value: "hc" },
                                { label: t["constable"], value: "constable" },
                                {
                                  label: t["various"],
                                  value: "various",
                                },
                              ]}
                            />
                          </Form.Item>
                        </Space>
                        <Space align="baseline">
                          <Form.Item
                            {...restField}
                            label={t["PNO"]}
                            name={[name, "pno"]}
                          >
                            <Input type="number" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            label={t["Badge No"]}
                            name={[name, "badgeNumber"]}
                          >
                            <Input type="number" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            label={t["Mobile No"]}
                            name={[name, "mobile"]}
                          >
                            <Input type="number" />
                          </Form.Item>

                          {fields.length > 1 ? (
                            <MinusCircleOutlined
                              className="dynamic-delete-button"
                              onClick={() => remove(name)}
                            />
                          ) : null}
                        </Space>
                      </Space>
                    ))}
                  </>
                )}
              </Form.List>
            )
          }
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddRecords;
