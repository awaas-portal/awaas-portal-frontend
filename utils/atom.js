import { atom } from "recoil";

export const langState = atom({
  key: "langState",
  default: "hi",
});

export const authState = atom({
  key: "authState",
  default: null,
});
