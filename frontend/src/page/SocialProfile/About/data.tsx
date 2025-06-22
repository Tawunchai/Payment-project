import  ASSET_AVATARS  from "../../../assets/admin/product1.jpg";
import {
  MdOutlineBusiness,
  MdOutlineCake,
  MdOutlineFamilyRestroom,
  MdOutlineHouse,
  MdOutlineSchool,
} from "react-icons/md";

export interface Tabs {
  key: string;
  tab: string;
}
export const tabs: Tabs[] = [
  {
    key: "article",
    tab: "Overview",
  },
];
export interface User {
  id: number;
  name: string;
  profilePic: string;
}
export interface Abouts {
  id: number;
  title: string;
  icon: React.ElementType;
  usersList: User[] | [];
  desc: string;
}
export const aboutsData: Abouts[] = [
  {
    id: 1,
    title: "Works at",
    icon: MdOutlineBusiness,
    usersList: [],
    desc: "G-axon Tech Pvt. Ltd.",
  },
  {
    id: 2,
    title: "Birthday",
    icon: MdOutlineCake,
    usersList: [],
    desc: "Oct 25, 1984",
  },
  {
    id: 3,
    title: "Went to",
    icon: MdOutlineSchool,
    usersList: [],
    desc: "Oxford University",
  },
  {
    id: 4,
    title: "Lives in London",
    icon: MdOutlineHouse,
    usersList: [],
    desc: "From Switzerland",
  },
  {
    id: 5,
    title: "5 Family Members",
    icon: MdOutlineFamilyRestroom,
    usersList: [
      {
        id: 1500,
        name: "Alex Dolgove",
        profilePic: ASSET_AVATARS,
      },
      {
        id: 1501,
        name: "Kailasha",
        profilePic: ASSET_AVATARS,
      },
      {
        id: 1503,
        name: "Chelsea Johns",
       profilePic: ASSET_AVATARS,
      },
      {
        id: 1502,
        name: "Domnic Brown",
        profilePic: ASSET_AVATARS,
      },
      {
        id: 1504,
        name: "Michael Dogov",
        profilePic: ASSET_AVATARS,
      },
    ],
    desc: "",
  },
];
