// src/components/LoginButton.tsx

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./LoginButton.css"; 

const LoginButton = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("ログイン成功:", result.user);
      navigate("/"); // ホームへ移動
    } catch (error) {
      console.error("ログインエラー:", error);
    }
  };

  return (
    <button className="google-login-button" onClick={handleLogin}>
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Googleロゴ"
        className="google-icon"
      />
      Googleでログイン
    </button>
  );
};

export default LoginButton;