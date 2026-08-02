import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // デザイントークン（全画面共通の色・文字・余白）

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
