import React, { useEffect, useState } from "react";
import { Attendee, MessageTypes } from "./types";
import attendeesJson from "./attendees.json";

const ContentApp = () => {
    const [hidden, setHidden] = useState(true);
    const [attendees, setAttendees] = useState<Attendee[]>([]);

    const onAttendeeClick = (attendee: Attendee) => {
        const temp = attendees.map(a => {
            if (a.id === attendee.id) {
                a.satDown = true;
            }
            return a;
        });
        setAttendees(temp);
        chrome.storage.local.set({ attendees: temp });

        const url = new URL(window.location.href);
        url.searchParams.set('assignee', attendee.id);
        window.location.href = url.toString();
    };

    const shuffleAttendees = (attendeesToShuffle: Attendee[]) => {
        const temp = attendeesToShuffle.slice();
        for (let i = temp.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [temp[i], temp[j]] = [temp[j], temp[i]];
        }
        setAttendees(temp);
        chrome.storage.local.set({ attendees: temp });
    };

    const clear = (attendeesToClear: Attendee[]) => {
        const temp = attendeesToClear.map(a => ({
            ...a,
            satDown: false
        }));
        setAttendees(temp);
        chrome.storage.local.set({ attendees: temp });

        const url = new URL(window.location.href);
        url.hash = '';
        url.search = '';
        window.location.href = url.toString();
    };

    const attendeesMarkup = attendees.map(a => {
        return (
            <li key={a.id} className={a.satDown ? "satDown" : ""} onClick={() => onAttendeeClick(a)}>
                <img src={a.avatarUrl} className={"avatar"} />
                {a.name}
            </li>
        );
    });

    useEffect(() => {
        const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.enabled) {
                setHidden(!changes.enabled.newValue);
            }
        };
        chrome.storage.onChanged.addListener(listener);
        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    }, []);

    useEffect(() => {
        chrome.runtime.onMessage.addListener((message: MessageTypes) => {
            switch (message.type) {
                case "CLEAR":
                    clear(attendees);
                    break;
                case "SHUFFLE":
                    shuffleAttendees(attendees);
                    break;
                default:
                    break;
            }
        });
    }, [attendees]);

    useEffect(() => {
        (async () => {
            const enabledResult = await chrome.storage.local.get("enabled");
            setHidden(!enabledResult.enabled);

            const attendeesResult = await chrome.storage.local.get("attendees");
            let attendees = attendeesResult.attendees;
            if (!attendees) {
                attendees = attendeesJson.map(a => ({
                    ...a,
                    satDown: false
                }));
            }
            setAttendees(attendees);
        })();
    }, []);

    return (
        <div className={hidden ? "container hidden" : "container"}>
            <ul className="group">{attendeesMarkup}</ul>
        </div>
    );
};

export default ContentApp