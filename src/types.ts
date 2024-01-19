interface Clear {
    type: "CLEAR"
}

interface Shuffle {
    type: "SHUFFLE"
}

interface AttendeesUpdated {
    type: "ATTENDEES_UPDATED"
}

export type MessageTypes = Clear | Shuffle | AttendeesUpdated;

export type Attendee = {
    id: string,
    name: string,
    avatarUrl: string,
    satDown: boolean,
    hasLinger: boolean
};