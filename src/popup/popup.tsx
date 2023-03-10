import React from "react";
import ReactDOM from "react-dom/client";
import PopupApp from "./PopupApp";
import "./popup.css";

const rootElement = document.getElementById("popup")!;
const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <PopupApp />
    </React.StrictMode>
);
