"use client";

import { useState, useEffect, useRef } from "react";
import { Typography, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { Popconfirm, Space, Input, Form, Spin } from "antd";
import { authState, langState } from "@/utils/atom";
import { useRecoilValue, useRecoilState } from "recoil";
import text from "@/text.json";
import { SuccessMessage, ErrorMessage } from "@/components/Notification";
import { LoadingOutlined } from "@ant-design/icons";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/utils/auth";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const lang = useRecoilValue(langState);
  const [auth, setAuth] = useRecoilState(authState);
  const t = text[lang];
  const form = useRef();
  const router = useRouter();

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/manager/all`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
    })
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          setUsers(data.message);
        } else {
          console.error(data.message);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (auth.role !== "admin") {
      WarningMessage(t["Access Denied"]);
      router.push("/admin/records");
    }

    fetchUsers();
  }, []);

  const deleteUser = (id) => {
    setProcessing(id);
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/manager/delete?id=${id}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      }
    )
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          SuccessMessage(t["User Deleted"]);
          fetchUsers();
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Deleting User"]);
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorMessage(t["Error Deleting User"]);
      })
      .finally(() => setProcessing(false));
  };

  const addUser = (values) => {
    setProcessing("add");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/manager/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth?.token}`,
      },
      body: JSON.stringify(values),
    })
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          form.current.resetFields();
          SuccessMessage(t["User Added"]);
          fetchUsers();
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Adding User"]);
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorMessage(t["Error Adding User"]);
      })
      .finally(() => setProcessing(false));
  };

  const columns = [
    {
      field: "email",
      headerName: t["Email"],
      flex: 1,
    },
    {
      field: "role",
      headerName: t["Role"],
      flex: 1,
      renderCell: (params) => <p>{params.row.customClaims.role}</p>,
    },
    {
      field: "action",
      headerName: t["Actions"],
      renderCell: (params) => (
        <Space>
          <Popconfirm
            placement="topLeft"
            title={t["User Delete"]}
            okText={t["Yes"]}
            cancelText={t["No"]}
            onConfirm={() => deleteUser(params.row.uid)}
          >
            <Button
              variant="outlined"
              color="warning"
              disabled={!!processing && processing !== "add"}
              startIcon={
                processing === params.row.uid ? (
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                  />
                ) : (
                  <DeleteIcon fontSize="inherit" />
                )
              }
            >
              {t["Delete"]}
            </Button>
          </Popconfirm>
        </Space>
      ),
      flex: 1,
    },
  ];

  return (
    <div className="root">
      <Typography variant="h4" component="h4" align="center" m={5}>
        {t["Users"]}
      </Typography>
      <Form
        ref={form}
        name="add_user"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={addUser}
        autoComplete="off"
        style={{ color: "#fff", marginBottom: "10px" }}
        layout="inline"
      >
        <Form.Item label={t["Username"]} name="email" required>
          <Input lang={lang} type="email" />
        </Form.Item>
        <Form.Item label={t["Password"]} name="password" required>
          <Input.Password lang={lang} type="text" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={processing === "add"}
            variant="contained"
            style={{ width: "max-content" }}
            startIcon={
              processing === "add" ? (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              ) : (
                <AddIcon />
              )
            }
          >
            {t["Add User"]}
          </Button>
        </Form.Item>
      </Form>
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.uid}
        showColumnVerticalBorder
        showCellVerticalBorder
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[5]}
        disableRowSelectionOnClick
        autoHeight
        getRowClassName={() => "row"}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            printOptions: { disableToolbarButton: true },
            csvOptions: { disableToolbarButton: true },
          },
        }}
        disableExtendRowFullWidth
        loading={loading}
      />
    </div>
  );
};

export default Users;
