import { useState } from "react";
import AuthPage from "./AuthPage.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "/api/products/generate";

const AUTH_URL =
  import.meta.env.VITE_AUTH_URL ||
  "/api/auth";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("product-generator-user") || "null");
    } catch {
      return null;
    }
  });

  if (!user) {
    return <AuthPage authUrl={AUTH_URL} onAuthenticated={setUser} />;
  }

  return (
    <ProductGenerator
      user={user}
      onLogout={() => {
        sessionStorage.removeItem("product-generator-user");
        setUser(null);
      }}
    />
  );
}

function ProductGenerator({ user, onLogout }) {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [features, setFeatures] = useState("");
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English");

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generateDescription(e) {
    e.preventDefault();

    setError("");
    setDescription("");
    setCopied(false);

    if (!productName.trim() || !category || !features.trim()) {
      setError("Please enter product name, category and features.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName: productName.trim(),
          category,
          features: features.trim(),
          tone,
          language,
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          response.ok
            ? "Failed to parse response from server."
            : `Server returned an error status (${response.status}).`
        );
      }

      if (!response.ok || (data && data.success === false)) {
        const errorDetail =
          data?.message ||
          (Array.isArray(data?.detail)
            ? data.detail.map((d) => d.msg || d.message).join(", ")
            : typeof data?.detail === "string"
            ? data.detail
            : `Server error: ${response.status}`);
        throw new Error(errorDetail || "Generation failed.");
      }

      const generatedText = data.description || data.product?.description;
      if (!generatedText) {
        throw new Error("The server returned an empty description.");
      }

      setDescription(generatedText);
    } catch (err) {
      console.error("Description generation error:", err);

      if (err instanceof TypeError) {
        setError(
          "Cannot connect to backend. Please ensure your backend is running on port 8000."
        );
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyDescription() {
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Please select and copy the text manually.");
    }
  }

  function clearForm() {
    setProductName("");
    setCategory("Electronics");
    setFeatures("");
    setTone("Professional");
    setLanguage("English");
    setDescription("");
    setError("");
    setCopied(false);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>AI Product Description Generator</h1>
            <p>Create attractive product descriptions using AI</p>
          </div>
          <div className="account-actions">
            <span>Hi, {user.name}</span>
            <button type="button" onClick={onLogout}>Log out</button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="form-card">
          <h2>Product Details</h2>

          <form onSubmit={generateDescription}>
            <label htmlFor="productName">Product Name</label>
            <input
              id="productName"
              type="text"
              placeholder="e.g. Wireless Headphones"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              maxLength={150}
              required
            />

            <label htmlFor="category">Product Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Home & Kitchen</option>
              <option>Beauty & Personal Care</option>
              <option>Sports</option>
              <option>Books</option>
              <option>Accessories</option>
              <option>Other</option>
            </select>

            <label htmlFor="features">Product Features</label>
            <textarea
              id="features"
              placeholder="Enter features, benefits, material, size, etc."
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows="4"
              maxLength={2000}
              required
            />

            <label htmlFor="tone">Writing Tone</label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option>Professional</option>
              <option>Creative</option>
              <option>Friendly</option>
              <option>Luxury</option>
              <option>Persuasive</option>
            </select>

            <label htmlFor="language">Language</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
            </select>

            <div className="buttons">
              <button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate Description"}
              </button>

              <button
                type="button"
                className="clear-button"
                onClick={clearForm}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </form>

          {error && (
            <div className="error" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}
        </section>

        <section className="result-card">
          <h2>Generated Description</h2>

          {loading && <p>Please wait, AI is generating your description...</p>}

          {!loading && !description && !error && (
            <p className="placeholder">
              Your generated product description will appear here.
            </p>
          )}

          {description && (
            <>
              <div className="description">{description}</div>

              <button type="button" onClick={copyDescription}>
                {copied ? "✓ Copied!" : "Copy Description"}
              </button>
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        AI Product Description Generator | Built with React
      </footer>
    </div>
  );
}

export default App;