import axios from "axios";
import { LoginInterface } from "../interface/Login"
import { EmployeeInterface } from "../interface/IEmployee";

const apiUrl = "http://localhost:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return {
    "Authorization": `${tokenType} ${token}`,
    "Content-Type": "application/json",
  };
}

const requestOptions = {
  headers: getAuthHeaders(),
};

const getHeaders = (): Record<string, string> => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  };
};


async function AddLogin(data: LoginInterface) {
  return await axios  
    .post(`${apiUrl}/login`, data, requestOptions)
    .then((res) => res) 
    .catch((e) => e.response);
}

export const GetEmployeeByUserID = async (
  id: number | string
): Promise<EmployeeInterface | false> => {
  try {
    const response = await axios.get(`${apiUrl}/employee/${id}`, {
      headers: getHeaders(),
    });

    console.log("Response from API:", response.data); 
    return response.data.employeeID; 
  } catch (error: any) {
    console.error(
      "Error fetching EmployeeID:",
      error.response?.data || error.message
    );
    return false; 
  }
};

export const CreateUser = async (
  formData: FormData
): Promise<any | false> => {
  try {
    const response = await axios.post(`${apiUrl}/signup`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `${localStorage.getItem(
          "token_type"
        )} ${localStorage.getItem("token")}`,
      },
    });

    if (response.status !== 201) {
      throw new Error("Error creating user");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
};

async function GetGender() {
  try {
    const response = await axios.get(`${apiUrl}/genders`, {
      headers: getAuthHeaders(),
    });
    return response.data; // สมมติว่า API ส่งข้อมูล genders กลับมาใน response.data
  } catch (error) {
    console.error("Error fetching genders:", error);
    return [];
  }
}


export {
  AddLogin,
  GetGender,
};
