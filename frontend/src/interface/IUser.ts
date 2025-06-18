import { UserroleInterface } from "../interface/IUserrole"
import { GendersInterface } from "../interface/IGender"

export interface UsersInterface {
    ID?: number;
    Username?: string;
    Password?: string;
    Email?: string;
    FirstName?: string;
    LastName?: string;
    Profile?: string ;
    Phonenumber?: string;
    UserRoleID?: UserroleInterface;
    GenderID?: GendersInterface;
  }