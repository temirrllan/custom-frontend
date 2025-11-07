import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import WebApp from "@twa-dev/sdk";
import "./index.css";
import "./App.css";
import "./styles/app.css";

WebApp.ready();
WebApp.expand();
const initDataUnsafe = WebApp.initDataUnsafe;
const user = initDataUnsafe?.user;
console.log("Telegram user:", user);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
