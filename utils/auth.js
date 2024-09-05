import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import app from "./firebase";
import { SuccessMessage, ErrorMessage } from "@/components/Notification";

export const auth = getAuth(app);

export const logIn = async (email, password) => {
  try {
    const creds = await signInWithEmailAndPassword(auth, email, password);
    console.log(creds);
    const lastSignIn = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/log`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${creds.user.accessToken}`,
        },
      }
    ).then((res) => res.json());

    if (lastSignIn.status) {
      SuccessMessage(
        "Last Login: " +
          new Date(lastSignIn.message.time).toLocaleString("en-IN")
      );
    }

    return creds.user;
  } catch (error) {
    console.error("Login failed:", error.message);
    ErrorMessage(error.message);
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const checkAuth = (res, setAuth) => {
  if (res.status === 401) {
    logOut().then(() => {
      setAuth(null);
      localStorage.removeItem("auth");
      router.push("/admin");
    });
  }
  return res.json();
};
