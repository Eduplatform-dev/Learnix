import { useState } from "react";
import {
  loginUser,
  registerUser,
  loginWithGoogle,
} from "../../app/services/authService";

import { User, Lock, Mail } from "lucide-react";
import loginImg from "../../assets/4d6ab98f39ae75e687adcc13329d1df80212a3d4.png";
import registerImg from "../../assets/b087d7bc1149e49b815ebddc955d693760362ab7.png";

export function Login() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
  });

  /* ---------------- ERROR FORMATTER ---------------- */
  const getErrorMessage = (err: any) => {
    const msg = err?.message || "";

    if (msg.includes("auth/user-not-found")) return "User not found";
    if (msg.includes("auth/wrong-password")) return "Wrong password";
    if (msg.includes("auth/email-already-in-use")) return "Email already used";
    if (msg.includes("auth/invalid-email")) return "Invalid email";
    if (msg.includes("auth/popup-closed")) return "Google popup closed";

    return "Something went wrong. Try again.";
  };

  /* ---------------- SIGN IN ---------------- */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await loginUser(signInData.email, signInData.password);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGN UP ---------------- */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (signUpData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerUser(
        signUpData.email,
        signUpData.password,
        signUpData.username
      );
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogle = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${isSignUpMode ? "sign-up-mode" : ""}`}>
      <div className="login-circle-bg" />

      <section className="login-forms-container">
        <div className="login-signin-signup">

          {/* SIGN IN */}
          <form
            onSubmit={handleSignIn}
            className={`login-form ${!isSignUpMode ? "active" : ""}`}
          >
            <h2 className="login-title">Sign In</h2>

            {error && !isSignUpMode && (
              <p className="text-red-500 text-sm mb-2">{error}</p>
            )}

            <div className="login-input-field">
              <Mail className="login-input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={signInData.email}
                onChange={(e) =>
                  setSignInData({ ...signInData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="login-input-field">
              <Lock className="login-input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={signInData.password}
                onChange={(e) =>
                  setSignInData({ ...signInData, password: e.target.value })
                }
                required
              />
            </div>

            <button type="submit" className="login-btn solid" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="login-social-text">Or continue with</p>

            <button
              type="button"
              className="login-btn"
              onClick={handleGoogle}
              disabled={loading}
            >
              Continue with Google
            </button>
          </form>

          {/* SIGN UP */}
          <form
            onSubmit={handleSignUp}
            className={`login-form ${isSignUpMode ? "active" : ""}`}
          >
            <h2 className="login-title">Sign Up</h2>

            {error && isSignUpMode && (
              <p className="text-red-500 text-sm mb-2">{error}</p>
            )}

            <div className="login-input-field">
              <User className="login-input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={signUpData.username}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, username: e.target.value })
                }
                required
              />
            </div>

            <div className="login-input-field">
              <Mail className="login-input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={signUpData.email}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="login-input-field">
              <Lock className="login-input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={signUpData.password}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, password: e.target.value })
                }
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>
        </div>
      </section>

      {/* PANELS */}
      <section className="login-panels-container">
        <div className={`login-panel left-panel ${isSignUpMode ? "hidden-panel" : ""}`}>
          <div className="login-panel-content">
            <h3>New here?</h3>
            <p>Create an account to start learning.</p>
            <button
              className="login-btn transparent"
              onClick={() => setIsSignUpMode(true)}
            >
              Sign Up
            </button>
          </div>
          <img src={loginImg} className="login-panel-image" alt="Sign in" />
        </div>

        <div className={`login-panel right-panel ${!isSignUpMode ? "hidden-panel" : ""}`}>
          <div className="login-panel-content">
            <h3>Already a member?</h3>
            <p>Sign in to continue.</p>
            <button
              className="login-btn transparent"
              onClick={() => setIsSignUpMode(false)}
            >
              Sign In
            </button>
          </div>
          <img src={registerImg} className="login-panel-image" alt="Sign up" />
        </div>
      </section>
    </div>
  );
}
