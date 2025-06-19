import axios from "axios";
import { ReviewInterface } from "../interface/IReview";
import { UsersInterface } from "../interface/IUser";
import { NewsInterface } from "../interface/INews";
import { GetstartedInterface } from "../interface/IGetstarted";
import { EVchargingInterface } from "../interface/IEV";
import { EmployeeInterface } from "../interface/IEmployee";
import { CalendarInterface } from "../interface/ICalendar";

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