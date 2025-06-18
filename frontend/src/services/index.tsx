import axios from "axios";
import { ReviewInterface } from "../interface/IReview";
import { UsersInterface } from "../interface/IUser";

const apiUrl = "http://localhost:8000";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return { Authorization: `${tokenType} ${token}` };
};

export const ListReviews = async (): Promise<ReviewInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/reviews`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data; // เป็น array ของ ReviewInterface
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return null;
  }
};

export const CreateUser = async (
  userData: UsersInterface
): Promise<{ message: string; user: any } | null> => {
  try {
    const response = await axios.post(`${apiUrl}/create-user`, userData, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 201) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error creating user:", error.response?.data || error.message);
    return null;
  }
};