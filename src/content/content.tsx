import React from "react";
import ReactDOM from "react-dom/client";
import ContentApp from "./ContentApp";
import { waitForElement } from "../utils";
import "./content.css";

(async () => {
    try {
        const isOldJiraVersion = document.body.classList.contains('ghx-agile')
        const controls = isOldJiraVersion ? await waitForElement("#ghx-controls", 5000) : await waitForElement(`[data-test-id="software-board.header.controls-bar"]`, 5000)
        if (controls) {
            const rootElement = document.createElement("div");
            rootElement.id = "jira-standup";
            if (isOldJiraVersion) {
                controls.appendChild(rootElement);
            } else {
                controls.insertAdjacentElement("afterend", rootElement);
            }

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
