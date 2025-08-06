import LoginButton from "../components/LoginButton";
import "./Login.css";

export default function Login() {
  return (
    <div className="login-container">
      <h2 className="login-title">ログインしてください</h2>
      <LoginButton />
    </div>
  );
}
