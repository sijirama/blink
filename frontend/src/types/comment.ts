import { User } from ".";

export type Comment = {
    ID: string;
    AlertID: number;
    UserID: number;
    Content: string;
    CreatedAt: string;
    UpdatedAt: string;
    User?: User
};

