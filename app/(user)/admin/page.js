"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { logIn } from "@/utils/auth";
import { authState, langState } from "@/utils/atom";
import { useRecoilValue, useRecoilState } from "recoil";
import text from "@/text.json";
import { Spin } from "antd";

export default function Login() {
  const router = useRouter();
  const lang = useRecoilValue(langState);
  const [auth, setAuth] = useRecoilState(authState);
  const t = text[lang];
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      router.push("/admin/records");
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
      })
        .then((res) => {
          if (res.status === 401) {
            setLoading(false);
            localStorage.removeItem("auth");
          } else {
            setAuth(JSON.parse(localStorage.getItem("auth")));
            router.push("/admin/records");
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }

    setLoading(false);
  }, []);

  const performLogin = async () => {
    setProcessing(true);
    try {
      const user = await logIn(email, password);
      const idTokenResult = await user.getIdTokenResult();
      setAuth({
        user: user.email,
        token: user.accessToken,
        role: idTokenResult.claims.role,
      });
      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: user.email,
          token: user.accessToken,
          role: idTokenResult.claims.role,
        })
      );
      router.push("/admin/records");
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return loading ? (
    <Spin spinning={true} fullscreen />
  ) : (
    <Container component="div" maxWidth="xs" style={{ marginTop: "15vh" }}>
      <Typography component="h1" variant="h5" align="center">
        {t["Login"]}
      </Typography>
      <form className="login-form" noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label={t["Username"]}
          name="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label={t["Password"]}
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="button"
          fullWidth
          variant="contained"
          color="primary"
          className="login-submit"
          onClick={() => performLogin()}
          startIcon={
            processing ? <CircularProgress size={20} color="inherit" /> : null
          }
          disabled={processing || !email || !password}
        >
          {t["Submit"]}
        </Button>
      </form>
    </Container>
  );
}
