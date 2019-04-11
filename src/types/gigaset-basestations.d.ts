declare namespace gigasetBasestations {
    export type IRootObject = IRootObjectItem[];
    export interface IRootObjectItem {
        id: string;
        friendly_name: string;
        status: string;
        firmware_status: string;
        updates_available: boolean;
        version: string;
        latest_version: string;
        fw_outdated: boolean;
        intrusion_settings: IIntrusion_settings;
        timezone: string;
        endnodes: IEndnodesItem[];
        sensors: ISensorsItem[];
    }
    export interface IIntrusion_settings {
        active_mode: string;
        modes: IModesItem[];
    }
    export interface IModesItem {
        home?: IHome;
        night?: INight;
        custom?: ICustom;
        away?: IAway;
    }
    export interface IHome {
        sirens_on: boolean;
        privacy_mode: boolean;
    }
    export interface INight {
        sirens_on: boolean;
        trigger_delay: number;
        privacy_mode: boolean;
        settings: ISettingsItem[];
    }
    export interface ISettingsItem {
        endnode_id: string;
        behaviors: IBehaviors;
    }
    export interface IBehaviors {
        movement?: string;
        prealert?: string;
        open?: string;
        forcedentry?: string;
    }
    export interface ICustom {
        sirens_on: boolean;
        privacy_mode: boolean;
        settings: ISettingsItem[];
    }
    export interface IAway {
        sirens_on: boolean;
        privacy_mode: boolean;
    }
    export interface IEndnodesItem {
        id: string;
        type: string;
        friendly_name: string;
        status: string;
        firmware_status: string;
        fw_version: string;
        latest_version: string;
        battery?: IBattery;
        ts_button?: number;
        position_status?: string;
    }
    export interface IBattery {
        state: string;
    }
    export interface ISensorsItem {
        id: string;
        type: string;
        friendly_name: string;
        status: string;
        firmware_status: string;
        fw_version: string;
        latest_version: string;
        battery?: IBattery;
        ts_button?: number;
        position_status?: string;
    }
}

