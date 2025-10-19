import axios from "axios";
import { ReviewInterface } from "../interface/IReview";
import { UsersInterface } from "../interface/IUser";
import { NewsInterface } from "../interface/INews";
import { GetstartedInterface } from "../interface/IGetstarted";
import { EVchargingInterface } from "../interface/IEV";
import { EmployeeInterface, CreateEmployeeInput } from "../interface/IEmployee";
import { CalendarInterface } from "../interface/ICalendar";
import { GendersInterface } from "../interface/IGender";
import { UserroleInterface } from "../interface/IUserrole";
import { TypeInterface } from "../interface/IType";
import { StatusInterface } from "../interface/IStatus";
import { ReportInterface } from "../interface/IReport";
import { PaymentsInterface, EVChargingPaymentInterface, PaymentCreateInterface, PaymentInterface, EVChargingPayListmentInterface } from "../interface/IPayment";
import { MethodInterface } from "../interface/IMethod";
import { InverterStatus } from "../interface/IInverterStatus"
import { BankInterface } from "../interface/IBank"
import { PaymentCoinInterface } from "../interface/IPaymentCoin";

//const apiUrl = "http://10.0.14.228:8000";
//export const apiUrlPicture = "http://10.0.14.228:8000/";
//export const apiUrlPicture = "http://localhost:8000/";
//const apiUrl = "http://localhost:8000";
export const apiUrlPicture = "https://payment-project-t4dj.onrender.com/";
const apiUrl = "https://payment-project-t4dj.onrender.com";

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

export const GetInverterStatus = async (): Promise<InverterStatus | null> => {
  try {
    const response = await axios.get(`${apiUrl}/inverter`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(), // ถ้ามีการ auth ด้วย token
      },
    });

    if (response.status === 200) {
      return response.data; // เป็น InverterStatus
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching inverter status:", error);
    return null;
  }
};

export const uploadSlip = async (file: File): Promise<any | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${apiUrl}/api/check-slip`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error uploading slip:", error.response?.data || error.message);
    return null;
  }
};

export const uploadSlipOK = async (file: File): Promise<any | null> => {
  try {
    const base64 = await convertToBase64(file);
    if (!base64) throw new Error("ไม่สามารถแปลงไฟล์เป็น base64");

    // ส่งไปยัง backend แบบไม่ต้องมี amount ใน URL
    const response = await axios.post(`${apiUrl}/api/check-slipok`, {
      img: base64, // ส่ง base64 พร้อม prefix
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error checking slip:", error.response?.data || error.message);
    return null;
  }
};

// ฟังก์ชันช่วยแปลงไฟล์ภาพเป็น base64
const convertToBase64 = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
  });
};


export interface PromptPayChargeRequest {
  amount: number; // จำนวนเงินเป็น "บาท"
}

export interface PromptPayChargeResponse {
  // สามารถปรับได้ตามโครงสร้างที่ backend ส่งกลับ เช่น Omise charge object
  [key: string]: any;
}

export const createPromptPayCharge = async (
  chargeData: PromptPayChargeRequest
): Promise<PromptPayChargeResponse | null> => {
  try {
    const response = await axios.post(`${apiUrl}/api/create-promptpay-charge`, chargeData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      return response.data as PromptPayChargeResponse;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error creating PromptPay charge:", error.response?.data || error.message);
    return null;
  }
};

export interface ChargeRequest {
  amount: number;  // จำนวนเงินเป็นบาท เช่น 100
  token: string;   // Omise token ที่ได้จาก Omise.js ฝั่ง client
}

export interface ChargeResponse {
  // โครงสร้าง response จาก Omise API อาจจะยืดหยุ่น จึงใช้ any
  [key: string]: any;
}

export const createCharge = async (
  chargeData: ChargeRequest
): Promise<ChargeResponse | null> => {
  try {
    const response = await axios.post(`${apiUrl}/api/charge`, chargeData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      return response.data as ChargeResponse;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error creating charge:", error.response?.data || error.message);
    return null;
  }
};

export const UpdateUserProfileByID = async (
  id: number,
  formData: FormData
): Promise<boolean> => {
  try {
    const res = await axios.patch(`${apiUrl}/update-user-profile/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeader(), // ถ้ามี JWT ใช้ header นี้
      },
    });

    if (res.status === 200) {
      console.log("✅ User profile updated successfully:", res.data);
      return true;
    }

    console.warn("⚠️ Unexpected status:", res.status);
    return false;
  } catch (error: any) {
    console.error("❌ Error updating user profile:", error);
    return false;
  }
};

export const createEmployeeByAdmin = async (
  employeeData: CreateEmployeeInput
): Promise<EmployeeInterface | null> => {
  try {
    const response = await axios.post(`${apiUrl}/create-employees`, employeeData, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 201) {
      return response.data.employee as EmployeeInterface;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error creating employee:", error.response?.data || error.message);
    return null;
  }
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

// ✅ อัปเดตข้อมูลพนักงาน (PATCH /update-employee-profile/:id)
export const UpdateEmployeeProfile = async (
  id: number,
  data: FormData
): Promise<EmployeeInterface | null> => {
  try {
    const res = await axios.patch(`${apiUrl}/update-employee-profile/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeader(),
      },
    });

    if (res.status === 200) {
      console.log("✅ Employee profile updated successfully");
      return res.data.employee as EmployeeInterface;
    }

    console.error("Unexpected status:", res.status);
    return null;
  } catch (err) {
    console.error("❌ Error updating employee profile:", err);
    return null;
  }
};

export interface UpdateCoinInput {
  user_id: number;
  coin: number;
}

export const UpdateCoin = async (data: UpdateCoinInput): Promise<boolean> => {
  try {
    const response = await axios.put(`${apiUrl}/users/update-coin`, data, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return true;
    } else {
      console.error("Unexpected status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error updating coin:", error);
    return false;
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

export const ListReviewsVisible = async (): Promise<ReviewInterface[] | null> => {
  try {
    const res = await axios.get(`${apiUrl}/reviews/visible`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    if (res.status === 200) return res.data as ReviewInterface[];
    console.error("Unexpected status:", res.status);
    return null;
  } catch (err) {
    console.error("Error fetching visible reviews:", err);
    return null;
  }
};

/** อัปเดตสถานะการมองเห็นรีวิว (true/false) ตาม ID */
export const UpdateReviewStatusByID = async (
  id: number | string,
  status: boolean
): Promise<ReviewInterface | null> => {
  try {
    const res = await axios.patch(
      `${apiUrl}/reviews/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      }
    );
    if (res.status === 200) return res.data as ReviewInterface;
    console.error("Unexpected status:", res.status);
    return null;
  } catch (err) {
    console.error(`Error updating review status (id=${id}):`, err);
    return null;
  }
};

/** ลบรีวิวตาม ID (ฝั่ง backend เป็น soft delete จาก gorm.Model) */
export const DeleteReviewByID = async (id: number | string): Promise<boolean> => {
  try {
    const res = await axios.delete(`${apiUrl}/reviews/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    if (res.status === 200) return true;
    console.error("Unexpected status:", res.status);
    return false;
  } catch (err) {
    console.error(`Error deleting review (id=${id}):`, err);
    return false;
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
  userData: UsersInterface | FormData
): Promise<{ message: string; user: any } | null> => {
  try {
    const headers = userData instanceof FormData
      ? {
        ...getAuthHeader(),
      }
      : {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      };

    const response = await axios.post(`${apiUrl}/create-user`, userData, {
      headers,
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

export const CreateEV = async (
  formData: FormData
): Promise<{ message: string; data: EVchargingInterface } | null> => {
  try {
    const response = await axios.post(`${apiUrl}/create-evs`, formData, {
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
    console.error("Error creating EVcharging:", error.response?.data || error.message);
    return null;
  }
};

export const UpdateEVByID = async (
  id: number,
  formData: FormData
): Promise<{ message: string; data: EVchargingInterface } | null> => {
  try {
    const response = await axios.patch(`${apiUrl}/update-evs/${id}`, formData, {
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

export const ListMethods = async (): Promise<MethodInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/methods`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(), // ถ้ามี auth
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching methods list:", error);
    return null;
  }
};

export const ListPayments = async (): Promise<PaymentsInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/payments`, {
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
    console.error("Error fetching payments list:", error);
    return null;
  }
};

export const CreateReview = async (
  reviewData: {
    rating: number;
    comment: string;
    user_id: number;
  }
): Promise<any | false> => {
  try {
    const Authorization = localStorage.getItem("token");
    const Bearer = localStorage.getItem("token_type");

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${Bearer} ${Authorization}`,
      },
      body: JSON.stringify(reviewData),
    };

    const response = await fetch(`${apiUrl}/reviews-create`, requestOptions);

    if (!response.ok) {
      console.error("Response status:", response.status);
      throw new Error("Invalid response from server");
    }

    const data = await response.json();
    console.log("Response data:", data);
    return data;
  } catch (error) {
    console.error("Error creating review:", error);
    return false;
  }
};


export const CreateEVChargingPayment = async (
  paymentData: EVChargingPaymentInterface
): Promise<EVChargingPaymentInterface | null> => {
  try {
    const response = await axios.post(
      `${apiUrl}/create-evchargingpayments`,
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      return response.data; // ข้อมูล EVChargingPayment ที่ถูกสร้างจาก backend
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error creating EVChargingPayment:", error.response?.data || error.message);
    return null;
  }
};

export const ListEVChargingPayments = async (): Promise<EVChargingPayListmentInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/evcharging-payments`, {
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
    console.error("Error fetching EV charging payments:", error.response?.data || error.message);
    return null;
  }
};

export const CreatePayment = async (
  paymentData: PaymentCreateInterface
): Promise<PaymentInterface | null> => {
  try {
    const formData = new FormData();

    formData.append("date", paymentData.date);
    formData.append("amount", paymentData.amount.toString());
    formData.append("user_id", paymentData.user_id.toString());
    formData.append("method_id", paymentData.method_id.toString());
    formData.append("reference_number", paymentData.reference_number || "");

    // ✅ แนบรูปเฉพาะถ้ามี
    if (paymentData.picture instanceof File) {
      formData.append("picture", paymentData.picture);
    }

    const response = await axios.post(`${apiUrl}/create-payments`, formData, {
      headers: {
        ...getAuthHeader(),
        // ไม่ต้องตั้ง Content-Type
      },
    });

    if (response.status === 200 || response.status === 201) {
      return response.data.data as PaymentInterface;
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error: any) {
    console.error("Error creating Payment:", error.response?.data || error.message);
    return null;
  }
};

// ฟังก์ชันดึงรายการธนาคาร
export const ListBank = async (): Promise<BankInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/banks`, {
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
    console.error("Error fetching banks list:", error);
    return null;
  }
};

// ฟังก์ชัน PATCH อัปเดตข้อมูลธนาคาร
export const UpdateBank = async (
  id: number,
  data: { promptpay?: string; manager?: string; banking?: string; minimum?: number }
): Promise<BankInterface | null> => {
  try {
    const response = await axios.patch(`${apiUrl}/banks/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (response.status === 200) {
      return response.data.data; // ตามโครงสร้าง response จาก backend
    } else {
      console.error("Unexpected status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error updating bank:", error);
    return null;
  }
};

export const ListPaymentCoins = async (): Promise<PaymentCoinInterface[] | null> => {
  try {
    const response = await axios.get(`${apiUrl}/payment-coins`, {
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
    console.error("Error fetching payment coins:", error);
    return null;
  }
};

export const CreatePaymentCoin = async (data: any) => {
  try {
    const formData = new FormData();
    formData.append("Date", data.Date);
    formData.append("Amount", data.Amount);
    formData.append("ReferenceNumber", data.ReferenceNumber);
    formData.append("UserID", data.UserID);
    formData.append("Picture", data.Picture); // <<< File

    const response = await axios.post(
      `${apiUrl}/create-payment-coins`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...getAuthHeader(),
        },
      }
    );
    if (response.status === 201) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

