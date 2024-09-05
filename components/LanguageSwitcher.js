import { Button, Space } from "antd";
import { useRecoilState } from "recoil";
import { langState } from "@/utils/atom";

const LanguageSwitcher = () => {
  const [lang, setLang] = useRecoilState(langState);
  return (
    <Space>
      <Button
        onClick={() => setLang(lang === "en" ? "hi" : "en")}
        type="primary"
      >
        {lang === "en" ? "हिन्दी" : "English"}
      </Button>
    </Space>
  );
};

export default LanguageSwitcher;
