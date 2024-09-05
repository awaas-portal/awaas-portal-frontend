import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { authState } from "@/utils/atom";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

const WithAuthorization = ({ children }) => {
  const [auth, setAuth] = useRecoilState(authState);
  const router = useRouter();

  useEffect(() => {
    if (!auth && !localStorage.getItem("auth")) {
      router.push(`/admin`);
      return;
    }

    if (localStorage.getItem("auth")) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/check`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("auth")).token
          }`,
        },
      }).then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("auth");
          router.push("/admin");
        } else {
          setAuth(JSON.parse(localStorage.getItem("auth")));
        }
      });
    }
  }, []);

  return auth ? children : <Spin spinning={true} fullscreen />;
};

export default WithAuthorization;
