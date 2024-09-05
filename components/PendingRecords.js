"use client";

import { useState } from "react";
import { Popconfirm, Space, Input, Spin, Checkbox } from "antd";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { SuccessMessage, ErrorMessage } from "@/components/Notification";
import { LoadingOutlined } from "@ant-design/icons";
import CheckIcon from "@mui/icons-material/Check";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { authState, langState } from "@/utils/atom";
import text from "@/text.json";
import { useRecoilValue, useRecoilState } from "recoil";
import { Button } from "@mui/material";
import EditRecord from "./EditRecord";
import { checkAuth } from "@/utils/auth";

const PendingRecords = ({ records, fetchRecords, loading }) => {
  const [id, setId] = useState("");
  const [processing, setProcessing] = useState(false);
  const t = text[useRecoilValue(langState)];
  const [auth, setAuth] = useRecoilState(authState);
  const [selected, setSelected] = useState([]);
  const [record, setRecord] = useState();
  const [open, setOpen] = useState(false);

  const deleteRecord = (id) => {
    setProcessing(`delete_${id}`);
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/application/delete?id=${id}`,
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
          SuccessMessage(t["Record Deleted"]);
          fetchRecords();
          setSelected([]);
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Deleting Record"]);
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorMessage(t["Error Deleting Record"]);
      })
      .finally(() => setProcessing(false));
  };

  const markAlloted = (ids = []) => {
    if (ids.length === 1) setProcessing(`allot_${ids[0]}`);
    else setProcessing("allot");

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/allot`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth?.token}`,
      },
      body: JSON.stringify({ ids: ids.length ? ids : selected }),
    })
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          SuccessMessage(t["Record Alloted"]);
          fetchRecords();
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Alloting Record"]);
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorMessage(t["Error Alloting Record"]);
      })
      .finally(() => setProcessing(false));
  };

  const clear = (type) => {
    if (type === "selected") {
      setProcessing("selected");
    } else {
      setProcessing("all");
    }

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/application/active/delete/many`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${auth?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: type === "selected" ? selected : records.map((r) => r.id),
        }),
      }
    )
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          SuccessMessage(t["Record Deleted"]);
          fetchRecords();
          setSelected([]);
        } else {
          console.error(data.message);
          ErrorMessage(t["Error Deleting Record"]);
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorMessage(t["Error Deleting Record"]);
      })
      .finally(() => setProcessing(false));
  };

  const columns = [
    {
      field: "checkbox",
      headerName: "",
      renderCell: (params) => (
        <Checkbox
          onChange={(e) =>
            selected.find((id) => id === params.row.id)
              ? setSelected(selected.filter((id) => id !== params.row.id))
              : setSelected([...selected, params.row.id])
          }
        />
      ),
      width: 6,
      disableExport: true,
    },
    {
      field: "registrationNumber",
      headerName: t["Registration No"],
      flex: 1,
    },
    {
      field: "pno",
      headerName: t["PNO"],
      flex: 1,
    },
    {
      field: "name",
      headerName: t["Name"],
      flex: 1,
    },
    {
      field: "officerRank",
      headerName: t["Rank"],
    },
    {
      field: "badgeNumber",
      headerName: t["Badge No"],
    },
    {
      field: "initialWaiting",
      headerName: t["Initial Waiting"],
    },
    {
      field: "currentWaiting",
      headerName: t["Current Waiting"],
    },
    {
      field: "applicationDate",
      headerName: t["Application Date"],
    },
    {
      field: "action",
      headerName: t["Actions"],
      renderCell: (params) => (
        <Space direction="vertical">
          <Popconfirm
            placement="topLeft"
            title={t["Allot Record"]}
            okText={t["Yes"]}
            cancelText={t["No"]}
            onConfirm={() => markAlloted([params.row.id])}
          >
            <Button
              variant="outlined"
              color="primary"
              disabled={!!processing}
              startIcon={
                processing === `allot_${params.row.id}` ? (
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                  />
                ) : (
                  <CheckIcon fontSize="inherit" />
                )
              }
            >
              {t["Mark Alloted"]}
            </Button>
          </Popconfirm>
          <Space>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon fontSize="inherit" />}
              onClick={() => {
                console.log(params.row);
                setRecord(params.row);
                setOpen(true);
              }}
              disabled={!!processing}
            >
              {t["Edit"]}
            </Button>
            {auth.role === "admin" && (
              <Popconfirm
                placement="topLeft"
                title={t["Delete Record"]}
                okText={t["Yes"]}
                cancelText={t["No"]}
                onConfirm={() => deleteRecord(params.row.id)}
              >
                <Button
                  variant="outlined"
                  color="warning"
                  disabled={!!processing}
                  startIcon={
                    processing === `delete_${params.row.id}` ? (
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
            )}
          </Space>
        </Space>
      ),
      width: 250,
      disableExport: true,
    },
  ];

  return (
    <div className="root">
      <EditRecord
        record={record}
        open={open}
        setOpen={setOpen}
        fetchRecords={fetchRecords}
      />
      <div
        style={{
          marginBottom: "5px",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Input
          placeholder={t["Enter PNO"]}
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{ flex: 1, marginRight: "10px" }}
          type="text"
        />
        <Popconfirm
          placement="topLeft"
          title={t["Allot Record"]}
          okText={t["Yes"]}
          cancelText={t["No"]}
          onConfirm={() => markAlloted()}
        >
          <Button
            variant="outlined"
            color="primary"
            disabled={!!processing || selected.length === 0}
            style={{ marginRight: "10px" }}
            startIcon={
              processing === `allot` ? (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              ) : (
                <CheckIcon fontSize="inherit" />
              )
            }
          >
            {t["Mark Selected Alloted"]}
          </Button>
        </Popconfirm>
        {auth.role === "admin" && (
          <Popconfirm
            placement="topLeft"
            title={t["Clear Selected"]}
            okText={t["Yes"]}
            cancelText={t["No"]}
            onConfirm={() => clear("selected")}
          >
            <Button
              variant="outlined"
              color="warning"
              disabled={!!processing || selected.length === 0}
              style={{ marginRight: "10px" }}
              startIcon={
                processing === `selected` ? (
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
              {t["Delete Selected"]}
            </Button>
          </Popconfirm>
        )}
        {auth.role === "admin" && (
          <Popconfirm
            placement="topLeft"
            title={t["Delete List"]}
            okText={t["Yes"]}
            cancelText={t["No"]}
            onConfirm={() => clear("all")}
          >
            <Button
              variant="outlined"
              color="warning"
              disabled={!!processing || !records?.length}
              startIcon={
                processing === "all" ? (
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
              {t["Clear List"]}
            </Button>
          </Popconfirm>
        )}
      </div>

      <DataGrid
        rows={records?.filter((a) => String(a.pno).includes(id))}
        columns={columns}
        getRowId={(row) => row.id}
        showColumnVerticalBorder
        showCellVerticalBorder
        pageSize={10}
        autoHeight
        rowHeight={100}
        getRowClassName={() => "row"}
        slots={{ toolbar: GridToolbar }}
        rowSelection={false}
        loading={loading}
        onRowClick={(params) =>
          selected.find((id) => id === params.row.id)
            ? setSelected(selected.filter((id) => id !== params.row.id))
            : setSelected([...selected, params.row.id])
        }
        disableColumnSelector
        disableColumnFilter
        disableRowSelectionOnClick
      />
    </div>
  );
};

export default PendingRecords;
