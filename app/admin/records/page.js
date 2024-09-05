"use client";

import { Typography } from "@mui/material";
import { langState } from "@/utils/atom";
import text from "@/text.json";
import { useRecoilValue } from "recoil";
import ArchivedRecords from "@/components/ArchivedRecords";
import PendingRecords from "@/components/PendingRecords";
import { Tabs } from "antd";
import { useRecoilState } from "recoil";
import { authState } from "@/utils/atom";
import { useState, useEffect } from "react";
import { checkAuth } from "@/utils/auth";

export const waitingLists = {
  rank1: ["inspector", "si"],
  rank2: ["constable", "hc", "various"],
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Records = () => {
  const t = text[useRecoilValue(langState)];
  const [auth, setAuth] = useRecoilState(authState);
  const [pendingRecords, setPendingRecords] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [archivedRecords, setArchivedRecords] = useState([]);
  const [archivedLoading, setArchivedLoading] = useState(false);

  const fetchPendingRecords = () => {
    setPendingLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/application/active/all`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
    })
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          setPendingRecords(data.message);
        } else {
          console.error(data.message);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setPendingLoading(false));
  };

  const fetchArchivedRecords = () => {
    setArchivedLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/application/archive/all`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
    })
      .then((res) => checkAuth(res, setAuth))
      .then((data) => {
        if (data.status) {
          setArchivedRecords(data.message);
        } else {
          console.error(data.message);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setArchivedLoading(false));
  };

  useEffect(() => {
    fetchPendingRecords();
    fetchArchivedRecords();
  }, []);

  return (
    <div>
      <Typography variant="h4" component="h4" align="center" m={5}>
        {t["Records"]}
      </Typography>

      <Tabs
        defaultActiveKey="p1"
        items={[
          {
            key: "p1",
            label: `${t["Pending List"]} 1 - ${t["p1"]}`,
            children: (
              <PendingRecords
                records={pendingRecords.filter(
                  (record) => record.rank === "rank1"
                )}
                fetchRecords={fetchPendingRecords}
                loading={pendingLoading}
              />
            ),
          },
          {
            key: "p2",
            label: `${t["Pending List"]} 2 - ${t["p2"]}`,
            children: (
              <PendingRecords
                records={pendingRecords.filter(
                  (record) => record.rank === "rank2"
                )}
                fetchRecords={fetchPendingRecords}
                loading={pendingLoading}
              />
            ),
          },
          {
            key: "a1",
            label: `${t["Alloted List"]} 1`,
            children: (
              <ArchivedRecords
                records={archivedRecords.filter(
                  (record) => record.rank === "rank1"
                )}
                fetchRecords={fetchPendingRecords}
                loading={pendingLoading}
              />
            ),
          },
          {
            key: "a2",
            label: `${t["Alloted List"]} 2`,
            children: (
              <ArchivedRecords
                records={archivedRecords.filter(
                  (record) => record.rank === "rank2"
                )}
                fetchRecords={fetchPendingRecords}
                loading={pendingLoading}
              />
            ),
          },
        ]}
        centered
      />
    </div>
  );
};

export default Records;
