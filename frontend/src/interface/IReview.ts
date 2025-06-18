import {UsersInterface} from "./IUser"

export interface ReviewInterface {
    ID?: number;
    Rating?: number;
    Comment?: string;
    ReviewDate?: Date; 
    User?: UsersInterface; 
}
