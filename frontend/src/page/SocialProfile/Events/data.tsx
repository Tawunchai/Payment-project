import ASSET_IMAGES  from "../../../assets/admin/product1.jpg";

export interface Events {
  id: number;
  image: string;
  title: string;
  name: string;
  location: string;
  date: string;
}
export const events: Events[] = [
  {
    id: 1,
    image: ASSET_IMAGES,
    title: "Sundance Film Festival",
    name: "Musical Concert",
    location: "Downsview Park, Toronto, Canada",
    date: "Feb 23, 2020",
  },
  {
    id: 2,
    image: ASSET_IMAGES,
    title: "Underwater Musical Festival",
    name: "Magic Show",
    location: "Downsview Park, Toronto, Canada",
    date: "Feb 11, 2020",
  },
  {
    id: 3,
    image: ASSET_IMAGES,
    title: "Village Feast Fac",
    name: "Musical Concert",
    location: "Downsview Park, Toronto, Canada",
    date: "Jan 02, 2020",
  },
  {
    id: 4,
    image: ASSET_IMAGES,
    title: "Sundance Film Festival",
    name: "Musical Concert",
    location: "Downsview Park, Toronto, Canada",
    date: "Feb 23, 2020",
  },
  {
    id: 5,
    image: ASSET_IMAGES,
    title: "Underwater Musical Festival",
    name: "Magic Show",
    location: "Downsview Park, Toronto, Canada",
    date: "Feb 11, 2020",
  },
  {
    id: 6,
    image: ASSET_IMAGES,
    title: "Village Feast Fac",
    name: "Musical Concert",
    location: "Downsview Park, Toronto, Canada",
    date: "Jan 02, 2020",
  },
];
