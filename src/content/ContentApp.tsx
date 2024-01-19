import React, { useEffect, useState } from "react";
import { Attendee, MessageTypes } from "../types";
import attendeesJson from "../data/attendees.json";

const ContentApp = () => {
    const [hidden, setHidden] = useState(true);
    const [shuffling, setShuffling] = useState(false);
    const [attendees, setAttendees] = useState<Attendee[]>([]);

    const onAttendeeClick = (attendee: Attendee) => {
        const temp = attendees.map(a => {
            if (a.id === attendee.id) {
                a.satDown = true;
            }
            return a;
        });

        storeAttendees(temp);

        const url = new URL(window.location.href);
        url.searchParams.set('assignee', attendee.id);
        window.location.href = url.toString();
    };

    const onAttendeeRightClick = (e: React.MouseEvent, attendee: Attendee) => {
        e.preventDefault();
        const temp = attendees.map(a => {
            if (a.id === attendee.id) {
                a.hasLinger = !a.hasLinger;
            }
            return a;
        });

        storeAttendees(temp);
    };

    const shuffleAttendees = (attendeesToShuffle: Attendee[]) => {
        setShuffling(true);
        setTimeout(() => {
            const temp = attendeesToShuffle.slice();
            for (let i = temp.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [temp[i], temp[j]] = [temp[j], temp[i]];
            }
            storeAttendees(temp);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setShuffling(false);
                });
            });
        }, 175);
    };

    const storeAttendees = async (attendeesToStore: Attendee[]) => {
        setAttendees(attendeesToStore);
        await chrome.storage.local.set({ attendees: attendeesToStore });
    };

    const clear = (attendeesToClear: Attendee[]) => {
        const temp = attendeesToClear.map(a => ({
            ...a,
            satDown: false,
            hasLinger: false
        }));

        storeAttendees(temp);

        const url = new URL(window.location.href);
        url.hash = '';
        url.search = '';
        window.location.href = url.toString();
    };

    const attendeesMarkup = attendees.map(a => {
        const hasSatDown = a.satDown ? "satDown" : "";
        const hasLinger = a.hasLinger ? "hasLinger" : "";

        return (
            <li key={a.id} className={`${hasSatDown} ${hasLinger}`} onClick={() => onAttendeeClick(a)} onContextMenu={(e) => onAttendeeRightClick(e, a)}>
                <img src={a.avatarUrl} className="avatar" />
                <span className="name">{a.name}</span>
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
        const listener = async (message: MessageTypes) => {
            switch (message.type) {
                case "CLEAR":
                    clear(attendees);
                    break;
                case "SHUFFLE":
                    shuffleAttendees(attendees);
                    break;
                case "ATTENDEES_UPDATED":
                    const attendeesResult = await chrome.storage.local.get("attendees");
                    setAttendees(attendeesResult.attendees);
                default:
                    break;
            }
        };
        chrome.runtime.onMessage.addListener(listener);
        return () => {
            chrome.runtime.onMessage.removeListener(listener);
        };
    }, [attendees]);

    useEffect(() => {
        (async () => {
            const enabledResult = await chrome.storage.local.get("enabled");
            setHidden(!enabledResult.enabled);

            const attendeesResult = await chrome.storage.local.get("attendees");
            let storageAttendees = attendeesResult.attendees;
            if (!storageAttendees) {
                storageAttendees = attendeesJson.map(a => ({
                    ...a,
                    satDown: false
                }));
                await storeAttendees(storageAttendees);
            } else {
                setAttendees(storageAttendees);
            }
        })();
    }, []);

    return (
        <div className={hidden ? "container hidden" : "container"}>
            <ul className={shuffling ? "group shuffling" : "group"}>{attendeesMarkup}</ul>
        </div>
    );
};

export default ContentApp
