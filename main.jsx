import React from "react";
import ReactDOM from "react-dom/client";
import GewuApp from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GewuApp />
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js?v=9", { updateViaCache: "none" }).then((registration) => registration.update()).catch(() => {});
  });
}
