import React, { useEffect, useState } from "react";
import { Attendee, MessageTypes } from "../types";

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
        <div className="checkbox">
            <input className="checkbox__input" type="checkbox" id="enabled" name="enabled" checked={checked} onChange={handleOnChange} />
            <label className="checkbox__label" htmlFor="enabled">Enabled</label>
        </div>
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

    const handleOnReload = () => {
        chrome.storage.local.set({ attendees: null });
        chrome.runtime.reload();
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList) {
            return;
        }
        const file = fileList.item(0);
        if (!file) {
            return;
        }
        const data = await file.text();
        let attendees = JSON.parse(data);
        if (!(attendees instanceof Array)) {
            console.log("Attendees import must be an array of valid attendees");
            return;
        }
        const isValid = attendees.every(a => a.id && a.name && a.avatarUrl);
        if (!isValid) {
            console.log("Attendees import must be an array of attendee objects with id, name, and avatarUrl");
            return;
        }
        attendees = attendees.map(a => ({
            ...a,
            satDown: false,
            hasLinger: false
        }));
        chrome.storage.local.set({ attendees });
        sendMessage({ type: "ATTENDEES_UPDATED" });
    };

    const handleOnImport = () => {
        const input = document.querySelector('#importedAttendees') as HTMLInputElement;
        input && input.click();
    };

    const handleOnExport = async () => {
        const attendeesResult = await chrome.storage.local.get("attendees");
        if (!attendeesResult.attendees) {
            console.log("Error exporting attendees. Attendees not found.");
            return;
        }
        const attendees: Attendee[] = attendeesResult.attendees.map((a: Attendee) => ({
            id: a.id,
            name: a.name,
            avatarUrl: a.avatarUrl
        }));
        const content = JSON.stringify(attendees, null, 2);
        const blob = new Blob([content], {
            type: 'application/json'
        });
        const fileName = "attendees.json";
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="container">
            <h2>Jira Standup 👋</h2>
            <Checkbox checked={enabled} />
            <div className="controls">
                <button className="button" onClick={handleOnShuffle}>Shuffle</button>
                <button className="button" onClick={handleOnClear}>Clear</button>
                <button className="button" onClick={handleOnReload}>Reload</button>
            </div>
            <div className="manage-attendees">
                <input type="file" name="importedAttendees" id="importedAttendees" accept=".json" onChange={handleImport} />
                <button className="button" onClick={handleOnImport}>Import</button>
                <button className="button" onClick={handleOnExport}>Export</button>
            </div>
        </div>
    );
};

export default PopupApp
