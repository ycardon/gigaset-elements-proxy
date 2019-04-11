declare namespace gigasetEvents {
    export interface IRootObject {
        events: IEventsItem[];
        home_state: string;
    }
    export interface IEventsItem {
        id: string;
        state: string;
        ts: string;
        type: string;
        o: IO;
        source_id: string;
        source_type: string;
        state_pre: string;
        source_name?: string;
    }
    export interface IO {
        modeBefore?: string;
        modeAfter?: string;
        basestationId?: string;
        basestationFriendlyName?: string;
        basestationType?: string;
        frontendTags?: IFrontendTags;
        friendly_name?: string;
        id?: string;
        type?: string;
        archive_rand_id?: string;
        archive_id?: string;
    }
    export interface IFrontendTags {
    }
}

