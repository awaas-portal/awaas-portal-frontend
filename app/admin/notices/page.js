"use client";

import { useState, useEffect } from "react";
import { Typography, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Popconfirm, Space, Spin } from "antd";
import NoticeForm from "@/components/NoticeForm";
import { authState, langState } from "@/utils/atom";
import { useRecoilValue } from "recoil";
import text from "@/text.json";
import { LoadingOutlined } from "@ant-design/icons";
import { ErrorMessage, SuccessMessage } from "@/components/Notification";
import AddIcon from "@mui/icons-material/Add";
import { checkAuth } from "@/utils/auth";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [notice, setNotice] = useState();
  const t = text[useRecoilValue(langState)];
  const [auth, setAuth] = useState(authState);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotices = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/all`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
    })
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          setNotices(data.message);
        } else {
          console.error(data.message);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(fetchNotices, []);

  const deleteNotice = (id) => {
    setProcessing(id);
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/delete?id=${id}`,
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
          SuccessMessage(t["Notice Deleted"]);
          fetchNotices();
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Deleting Notice"]);
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorMessage(t["Error Deleting Notice"]);
      })
      .finally(() => setProcessing(false));
  };

  const columns = [
    {
      field: "heading",
      headerName: t["Heading"],
      flex: 1,
    },
    {
      field: "url",
      headerName: t["URL"],
      flex: 1,
      renderCell: (params) => (
        <a target="_blank" href={`${params.row.url}`}>
          URL
        </a>
      ),
    },
    {
      field: "type",
      headerName: t["Notice Type"],
      flex: 1,
    },
    {
      field: "releasedOn",
      headerName: t["Release Date"],
      flex: 1,
      renderCell: (params) => (
        <p>{new Date(params.row.releasedOn).toLocaleDateString("en-GB")}</p>
      ),
    },
    {
      field: "action",
      headerName: t["Actions"],
      renderCell: (params) => (
        <Space>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon fontSize="inherit" />}
            onClick={() => {
              setNotice(params.row);
              setEditOpen(true);
            }}
          >
            {t["Edit"]}
          </Button>
          <Popconfirm
            placement="topLeft"
            title={t[`Delete Notice`]}
            okText={t["Yes"]}
            cancelText={t["No"]}
            onConfirm={() => deleteNotice(params.row.id)}
          >
            <Button
              variant="outlined"
              color="warning"
              disabled={!!processing}
              startIcon={
                processing === params.row.id ? (
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
      width: 250,
    },
  ];

  return (
    <div className="root">
      <Typography variant="h4" component="h4" align="center" m={5}>
        {t["Notices"]}
      </Typography>
      <Button
        onClick={() => setAddOpen(true)}
        startIcon={<AddIcon />}
        variant="contained"
        style={{ marginBottom: "5px" }}
      >
        {t["Add Notice"]}
      </Button>
      <NoticeForm
        mode="add"
        notice={notice}
        open={addOpen}
        setOpen={setAddOpen}
        fetchNotices={fetchNotices}
      />
      <NoticeForm
        mode="edit"
        notice={notice}
        open={editOpen}
        setOpen={setEditOpen}
        fetchNotices={fetchNotices}
      />
      <DataGrid
        rows={notices}
        columns={columns}
        getRowId={(row) => row.id}
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

export default Notices;
