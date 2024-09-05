"use client";

import { useState } from "react";
import { Input, Popconfirm, Checkbox, Spin } from "antd";
import { Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { langState, authState } from "@/utils/atom";
import text from "@/text.json";
import { useRecoilValue, useRecoilState } from "recoil";
import { SuccessMessage, ErrorMessage } from "@/components/Notification";
import { LoadingOutlined } from "@ant-design/icons";
import DeleteIcon from "@mui/icons-material/Delete";
import { checkAuth } from "@/utils/auth";

const ArchivedRecords = ({ records, fetchRecords, loading }) => {
  const [id, setId] = useState("");
  const t = text[useRecoilValue(langState)];
  const [processing, setProcessing] = useState(false);
  const [auth, setAuth] = useRecoilState(authState);
  const [selected, setSelected] = useState([]);

  const deleteRecord = (id) => {
    setProcessing(id);
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/application/archive/delete/many`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${auth?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: [id],
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

  const clear = (type) => {
    if (type === "selected") {
      setProcessing("selected");
    } else {
      setProcessing("all");
    }

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/application/archive/delete/many`,
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
    auth.role === "admin" && {
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
      flex: 1,
    },
    {
      field: "badgeNumber",
      headerName: t["Badge No"],
      flex: 1,
    },
    {
      field: "initialWaiting",
      headerName: t["Initial Waiting"],
      flex: 1,
    },
    {
      field: "currentWaiting",
      headerName: t["Current Waiting"],
      flex: 1,
    },
    {
      field: "applicationDate",
      headerName: t["Application Date"],
      flex: 1,
    },
    auth.role === "admin" && {
      field: "action",
      headerName: t["Actions"],
      renderCell: (params) => (
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
              processing === params.row.id ? (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              ) : (
                <DeleteIcon fontSize="inherit" />
              )
            }
          >
            {t["Delete"]}
          </Button>
        </Popconfirm>
      ),
      disableExport: true,
      flex: 1,
    },
  ];

  return (
    <div className="root">
      <div style={{ display: "flex", marginBottom: "5px", width: "100%" }}>
        <Input
          placeholder={t["Enter PNO"]}
          value={id}
          onChange={(e) => setId(e.target.value)}
          type="text"
          style={{ flex: 1, marginRight: "5px" }}
        />
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
              style={{ marginRight: "5px" }}
              startIcon={
                processing === "selected" ? (
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
        getRowClassName={() => "row"}
        slots={{ toolbar: GridToolbar }}
        loading={loading}
      />
    </div>
  );
};

export default ArchivedRecords;
