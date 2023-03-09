import React from "react";
import ReactDOM from "react-dom/client";
import ContentApp from "./ContentApp";
import { waitForElement } from "./utils";
import "./content.css";

(async () => {
    try {
        const controls = await waitForElement("#ghx-controls", 5000);
        if (controls) {
            const rootElement = document.createElement("div");
            rootElement.id = "jira-standup";
            controls.appendChild(rootElement);

            const root = ReactDOM.createRoot(rootElement);
            root.render(
                <React.StrictMode>
                    <ContentApp />
                </React.StrictMode>
            );
        }
    } catch (e) {
        console.error(`Jira Standup Chrome Extension: Unable to load: ${e}`)
    }
})();
