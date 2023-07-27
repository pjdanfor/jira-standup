interface Clear {
    type: "CLEAR"
}

interface Shuffle {
    type: "SHUFFLE"
}

export type MessageTypes = Clear | Shuffle;

export type Attendee = {
    id: string,
    name: string,
    avatarUrl: string,
    satDown: boolean,
    hasLinger: boolean
};