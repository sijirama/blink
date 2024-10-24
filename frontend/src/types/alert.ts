import { Flag } from "lucide-react";

export interface Location {
    Latitude: number;
    Longitude: number;
}

export interface Alert {
    ID: number;
    UserID: number;
    Location: Location;
    Title: string;
    Description: string;
    Status: string;
    Urgency: number;
    Verifications: any; // Use `any` or a more specific type if you have a clear structure for Verifications
    Comments: any; // Use `any` or a more specific type if you have a clear structure for Comments
    CreatedAt: string; // ISO 8601 date string
    UpdatedAt: string; // ISO 8601 date string
    Flags: Flag[]
}

export interface Flag {
    "ID": number,
    "AlertID": number,
    "UserID": number,
    "Type": "Verify" | "Dismiss",
    "CreatedAt": Date,
}
