import { useState } from "react";
import "./AuthPage.css";

function AuthPage({ authUrl, onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${authUrl}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isSignup ? { name: name.trim() } : {}),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = Array.isArray(data?.detail)
          ? data.detail.map((item) => item.msg).join(", ")
          : data?.detail;
        throw new Error(detail || "We couldn't complete your request. Please try again.");
      }

      sessionStorage.setItem("product-generator-user", JSON.stringify(data.user));
      onAuthenticated(data.user);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Unable to connect to the backend. Start it from the backend folder with: python -m uvicorn main:app --reload --port 8000"
          : requestError.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="About the product generator">
        <a className="auth-brand" href="/" aria-label="Product Studio home">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span>Product Studio</span>
        </a>
        <div className="story-content">
          <span className="story-eyebrow"><span /> YOUR NEXT GREAT LISTING STARTS HERE</span>
          <h1>Words that make<br />products <em>stand out.</em></h1>
          <p>
            Turn product details into descriptions your customers can’t wait to read.
            A little inspiration goes a long way.
          </p>
          <div className="story-note">
            <span className="note-icon" aria-hidden="true">✦</span>
            <span>Made for the makers, sellers, and big ideas behind every product.</span>
          </div>
        </div>
        <div className="story-footer">Thoughtful words. Better storefronts.</div>
        <span className="story-orb story-orb-one" aria-hidden="true" />
        <span className="story-orb story-orb-two" aria-hidden="true" />
      </section>

      <section className="auth-panel">
        <div className="auth-panel-top">
          <span>Already have an account?</span>
          <button className="text-button" onClick={() => switchMode(isSignup ? "login" : "signup")}>
            {isSignup ? "Log in" : "Create account"}
          </button>
        </div>

        <div className="auth-card">
          <span className="auth-kicker">{isSignup ? "GET STARTED FOR FREE" : "WELCOME BACK"}</span>
          <h2>{isSignup ? "Create your account" : "Sign in to your account"}</h2>
          <p className="auth-subtitle">
            {isSignup
              ? "Your next product description is just a few details away."
              : "Pick up where your next great product story begins."}
          </p>

          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button
              type="button"
              role="tab"
              aria-selected={!isSignup}
              className={!isSignup ? "selected" : ""}
              onClick={() => switchMode("login")}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignup}
              className={isSignup ? "selected" : ""}
              onClick={() => switchMode("signup")}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="auth-field">
                <label htmlFor="auth-name">Your name</label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={1}
                  maxLength={100}
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                required
              />
            </div>

            <div className="auth-field">
              <div className="field-label-row">
                <label htmlFor="auth-password">Password</label>
                {!isSignup && <span className="password-hint">Keep it safe</span>}
              </div>
              <div className="password-input-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-legal">
            By continuing, you agree to use Product Studio responsibly and keep your
            account details secure.
          </p>
        </div>

        <div className="auth-panel-footer">
          <span>© 2026 Product Studio</span>
          <span>Built for better product stories</span>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
