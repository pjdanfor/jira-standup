import React, { useEffect, useState } from "react";
import { MessageTypes } from "./types";

type CheckboxProps = {
    checked: boolean
};

const Checkbox = (props: CheckboxProps) => {
    const [checked, setChecked] = useState(props.checked);

    useEffect(() => {
        setChecked(props.checked);
    }, [props.checked]);

    const handleOnChange = () => {
        chrome.storage.local.set({ enabled: !checked });
        setChecked(!checked);
    };

    return (
        <label>
            <input type="checkbox" name="enabled" checked={checked} onChange={handleOnChange} /> Enabled
        </label>
    );
};

const PopupApp = () => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        (async () => {
            const result = await chrome.storage.local.get("enabled");
            setEnabled(!!result.enabled);
        })();
    }, []);

    const sendMessage = async (message: MessageTypes) => {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, message);
        }
    };

    const handleOnShuffle = () => {
        sendMessage({ type: "SHUFFLE" });
    };

    const handleOnClear = () => {
        sendMessage({ type: "CLEAR" });
    };

    return (
        <div className="container">
            <h2>Jira Standup 👋</h2>
            <Checkbox checked={enabled} />
            <div className="controls">
                <button className="button" onClick={handleOnShuffle}>Shuffle</button>
                <button className="button" onClick={handleOnClear}>Clear</button>
            </div>
        </div>
    );
};

export default PopupApp
