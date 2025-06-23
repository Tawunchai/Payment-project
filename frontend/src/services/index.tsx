import axios from "axios";
import { ReviewInterface } from "../interface/IReview";
import { UsersInterface } from "../interface/IUser";
import { NewsInterface } from "../interface/INews";
import { GetstartedInterface } from "../interface/IGetstarted";
import { EVchargingInterface } from "../interface/IEV";
import { EmployeeInterface } from "../interface/IEmployee";
import { CalendarInterface } from "../interface/ICalendar";
import { GendersInterface } from "../interface/IGender";
import { UserroleInterface } from "../interface/IUserrole";
import { TypeInterface } from "../interface/IType";
import { StatusInterface } from "../interface/IStatus";
import { ReportInterface } from "../interface/IReport";

const apiUrl = "http://localhost:8000";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return { Authorization: `${tokenType} ${token}` };
};

const getRequestOptions = () => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
  };
};

const deleteRequestOptions = () => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
  };
};

const postRequestOptions = (body: any) => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
    body: JSON.stringify(body),
  };
};

export const getEmployeeByID = async (
  id: number
): Promise<EmployeeInterface | null> => {
  try {
    const response = await axios.get(`${apiUrl}/employeebyid/${id}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data as EmployeeInterface;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching employee:", error.response?.data || error.message);
    return null;
  }
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

export const onLikeButtonClick = async (
  reviewID: number,
  userID: number
): Promise<any | false> => {
  try {
    const postOptions = postRequestOptions({
      user_id: userID,
      review_id: reviewID,
    });

    const response = await fetch(`${apiUrl}/reviews/like`, postOptions);

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการกดไลค์:", error);
    return false;
  }
};

export const fetchLikeStatus = async (
  reviewID: number,
  userID: number
): Promise<{ hasLiked: boolean; likeCount: number } | false> => {
  try {
    const requestOptions = getRequestOptions();

    const response = await fetch(
      `${apiUrl}/reviews/${userID}/${reviewID}/like`,
      requestOptions
    );

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    const data = await response.json();
    return {
      hasLiked: data.hasLiked ?? false,
      likeCount: data.likeCount ?? 0,
    };
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงสถานะไลค์:", error);
    return false;
  }
};

export const onUnlikeButtonClick = async (reviewID: number, userID: number) => {
  try {
    const deleteOptions = deleteRequestOptions();

    const response = await fetch(`${apiUrl}/reviews/unlike`, {
      ...deleteOptions,
      body: JSON.stringify({ user_id: userID, review_id: reviewID }),
    });

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการยกเลิกไลค์:", error);
    return false;
  }
};

export const getUserByID = async (
  id: number
): Promise<UsersInterface | null> => {
  try {
    const response = await axios.get(`${apiUrl}/users/${id}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data as UsersInterface;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching user:", error.response?.data || error.message);
    return null;
  }
};

export const CreateUser = async (
  userData: UsersInterface
): Promise<{ message: string; user: any } | null> => {
    console.log(userData)
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


// News Services
export const ListNews = async (): Promise<NewsInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/news`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data; // ควรเป็น [] ของข่าว
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    return null;
  }
};

export const CreateNews = async (formData: FormData): Promise<{ message: string; data: any } | null> => {
  try {
    const response = await axios.post(`${apiUrl}/create-news`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
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
    console.error("Error creating news:", error.response?.data || error.message);
    return null;
  }
};

export const UpdateNewsByID = async (
  id: number,
  formData: FormData
): Promise<{ message: string; data: any } | null> => {
  try {
    const response = await axios.patch(`${apiUrl}/update-news/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error updating news:", error.response?.data || error.message);
    return null;
  }
};


export const DeleteNews = async (
  id: number
): Promise<{ message: string } | null> => {
  try {
    const response = await axios.delete(`${apiUrl}/delete-news/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error deleting news:", error.response?.data || error.message);
    return null;
  }
};

export const ListReports = async (): Promise<ReportInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/reports`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data; // คาดว่า backend ส่ง array ของ ReportInterface
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
    return null;
  }
};

export const CreateReport = async (
  formData: FormData
): Promise<{ message: string; data: any } | null> => {
  try {
    const response = await axios.post(`${apiUrl}/create-report`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
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
    console.error("Error creating report:", error.response?.data || error.message);
    return null;
  }
};

export const UpdateReportByID = async (
  id: number,
  status: string
): Promise<{ message: string; data: any } | null> => {
  try {
    const response = await axios.put(`${apiUrl}/update-reports/${id}`, { status }, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error updating report:", error.response?.data || error.message);
    return null;
  }
};

export const DeleteReportByID = async (
  id: number
): Promise<{ message: string } | null> => {
  try {
    const response = await axios.delete(`${apiUrl}/delete-report/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data; 
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error deleting report:", error.response?.data || error.message);
    return null;
  }
};

export const ListGetStarted = async (): Promise<GetstartedInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/getstarteds`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data; 
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching get started list:", error);
    return null;
  }
};

export const CreateGettingStarted = async (data: { title: string; description: string; employeeID: number }): Promise<{ message: string; data: any } | null> => {
  try {
    const response = await axios.post(`${apiUrl}/create-getting`, data, {
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
    console.error("Error creating getting started:", error.response?.data || error.message);
    return null;
  }
};

export const UpdateGettingStartedByID = async (
  id: number,
  formData: FormData
): Promise<{ message: string; data: any } | null> => {
  try {
    const response = await axios.patch(`${apiUrl}/update-gettings/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error updating GettingStarted:", error.response?.data || error.message);
    return null;
  }
};

export const DeleteGettingByID = async (
  id: number
): Promise<{ message: string } | null> => {
  try {
    const response = await axios.delete(`${apiUrl}/delete-gettings/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error deleting GettingStarted:", error.response?.data || error.message);
    return null;
  }
};


export const ListUsers = async (): Promise<UsersInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/users`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user list:", error);
    return null;
  }
};

export const DeleteUser = async (
  id: number
): Promise<{ message: string } | null> => {
  try {
    const response = await axios.delete(`${apiUrl}/delete-users/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error deleting user:", error.response?.data || error.message);
    return null;
  }
};

export const ListUsersByRoleAdmin = async (): Promise<UsersInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/users/by-role/admin`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user list by role Admin:", error);
    return null;
  }
};


export const ListUsersByRoleUser = async (): Promise<UsersInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/users/by-role/user`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user list by role User:", error);
    return null;
  }
};

export const ListEVCharging = async (): Promise<EVchargingInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/evs`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching EV charging data:", error);
    return null;
  }
};

export const UpdateEVByID = async (
  id: number,
  data: Partial<EVchargingInterface>
): Promise<{ message: string; data: EVchargingInterface } | null> => {
  try {
    const response = await axios.patch(`${apiUrl}/update-evs/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error updating EV Charging:", error.response?.data || error.message);
    return null;
  }
};


export const DeleteEVcharging = async (
  id: number
): Promise<{ message: string } | null> => {
  try {
    const response = await axios.delete(`${apiUrl}/delete-evchargings/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error deleting EVcharging:", error.response?.data || error.message);
    return null;
  }
};

//Type
export const ListTypeEV = async (): Promise<TypeInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/types`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching EV Types:", error.response?.data || error.message);
    return null;
  }
};

//Status
export const ListStatus = async (): Promise<StatusInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/statuss`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching Status list:", error.response?.data || error.message);
    return null;
  }
};

// services/employee.ts
export const GetEmployeeByUserID = async (id: number): Promise<EmployeeInterface | null> => {
  try {
    const response = await axios.get(`${apiUrl}/employees/user/${id}`);
    if (response.status === 200) return response.data;
    return null;
  } catch (error) {
    console.error("Error fetching employee by user ID", error);
    return null;
  }
};

export const UpdateAdminByID = async (
  id: number,
  data: Partial<Pick<EmployeeInterface, "Salary">> & { userRoleID?: number }
): Promise<{ message: string; data: EmployeeInterface } | null> => {
  try {
    // สร้าง payload เป็น JSON object
    const payload: any = {};

    if (data.Salary !== undefined) {
      payload.salary = data.Salary;
    }

    if (data.userRoleID !== undefined) {
      payload.userRoleID = data.userRoleID;
    }

    const response = await axios.patch(`${apiUrl}/update-boss-admins/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status code:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error updating admin:", error.response?.data || error.message);
    return null;
  }
};


export const DeleteAdmin = async (
  id: number
): Promise<{ message: string } | null> => {
  try {
    const response = await axios.delete(`${apiUrl}/delete-admins/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error deleting admin:", error.response?.data || error.message);
    return null;
  }
};


export const CreateCalendar = async (
  calendarData: CalendarInterface
): Promise<{ message: string; calendar: CalendarInterface } | null> => {
  try {
    const response = await axios.post(`${apiUrl}/create-calendar`, calendarData, {
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
    console.error("Error creating calendar:", error.response?.data || error.message);
    return null;
  }
};


export const ListCalendars = async (): Promise<CalendarInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/calendars`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching calendars:", error.response?.data || error.message);
    return null;
  }
};

export const UpdateCalendar = async (
  id: number,
  calendarData: CalendarInterface
): Promise<{ message: string; calendar: CalendarInterface } | null> => {
  try {
    const response = await axios.put(`${apiUrl}/update-calendar/${id}`, calendarData, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error updating calendar:", error.response?.data || error.message);
    return null;
  }
};

export const DeleteCalendar = async (
  id: number
): Promise<{ message: string } | null> => {
  try {
    const response = await axios.delete(`${apiUrl}/delete-calendar/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error deleting calendar:", error.response?.data || error.message);
    return null;
  }
};

export const UpdateUser = async (
  id: number,
  data: Partial<UsersInterface>
): Promise<{ message: string; user: UsersInterface } | null> => {
  try {
    const response = await axios.patch(`${apiUrl}/update-user/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status code:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error updating user:", error.response?.data || error.message);
    return null;
  }
};

export const ListGenders = async (): Promise<GendersInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/genders`);
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching genders:", error);
    return null;
  }
};

export const ListUserRoles = async (): Promise<UserroleInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/userroles`);
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return null;
  }
};