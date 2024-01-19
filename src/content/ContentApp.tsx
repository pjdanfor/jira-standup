import React, { useEffect, useState } from "react";
import { Attendee, MessageTypes } from "../types";

const ContentApp = () => {
    const [hidden, setHidden] = useState(true);
    const [shuffling, setShuffling] = useState(false);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [activeAttendee, setActiveAttendee] = useState<string>('');

    const onAttendeeClick = (attendee: Attendee) => {
        const temp = attendees.map(a => {
            if (a.id === attendee.id) {
                a.satDown = true;
            }
            return a;
        });

        storeAttendees(temp);

        var checkbox = document.getElementById('assignee-' + activeAttendee);
        if (checkbox) {
            checkbox.click();
        } else {
            document.getElementById('assignee-show-more')?.click();
            var button = document.getElementById(activeAttendee);
            button?.click();
            document.getElementById('assignee-show-more')?.click();
        }

        if (activeAttendee !== attendee.id) {
            checkbox = document.getElementById('assignee-' + attendee.id);
            if (checkbox) {
                checkbox.click();
            } else {
                document.getElementById('assignee-show-more')?.click();
                button = document.getElementById(attendee.id);
                button?.click();
                document.getElementById('assignee-show-more')?.click();
            }
            setActiveAttendee(attendee.id);
        }
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

        var checkbox = document.getElementById('assignee-' + activeAttendee);
        if (checkbox) {
            checkbox.click();
        } else {
            document.getElementById('assignee-show-more')?.click();
            var button = document.getElementById(activeAttendee);
            button?.click();
            document.getElementById('assignee-show-more')?.click();
        }
        setActiveAttendee('');
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
                storageAttendees = [{
                    id: "unassigned",
                    name: "Unassigned",
                    avatarUrl: "https://via.placeholder.com/48x48",
                    satDown: false,
                    hasLinger: false
                }];
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
