import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

const LoginButton = () => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("ログイン成功:", result.user);
    } catch (error) {
      console.error("ログインエラー:", error);
    }
  };

  return <button onClick={handleLogin}>Googleでログイン</button>;
};

export default LoginButton;
