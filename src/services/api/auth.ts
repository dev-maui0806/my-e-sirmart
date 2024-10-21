"use client";

import { notification } from "antd";
import axios from "axios";
import { FORGOTPASSWORD, LOGIN, REGISTER, BASE_URL } from "../url.js";
import { jwtDecode } from "jwt-decode";

export interface LOGINDATA {
  email: string;
  password: string;
}

export interface REGISTERDATA {
  first_name: string;
  last_name: string;
  email: string;
  // username: string;
  phone_number: string;
  password: string;
}

export interface DecodedToken {
  email: string;
  name: string;
  given_name: string;
  family_name: string;
}


export const userLogin = async (payload: LOGINDATA) => {
  try {
    const loginData: any = {
      data: {
        attributes: payload,
      },
    };

    console.log(loginData);


    // Ensure the payload is properly formatted
    const response = await axios.post(LOGIN, loginData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(response, response.data);
    return response.data;

  } catch (error: any) {
    notification.error({
      message: error.response.data.errors[0].detail,
    });
    console.error(
      "Error in sending request: ",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const userRegister = async (payload: REGISTERDATA) => {
  try {
    const response = await axios.post(REGISTER, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response && response.data) {
      return response.data.message || "Success";
    } else {
      throw new Error("Invalid response format from server");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.errors?.[0]?.detail ||
      error.response?.data?.message ||
      "An unknown error occurred";
    notification.error({
      message: errorMessage,
    });
    console.error(
      "Error in sending request: ",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const forgotPassword = async (email: string) => {
  const response = await axios.post(FORGOTPASSWORD, JSON.stringify({ email }), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
};

export const resetPassword = async (email: string) => {
  const response = await axios.post(FORGOTPASSWORD, JSON.stringify({ email }), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
};


// export const handleGoogleLoginSuccess = (response: any) => {

//   if (response.error) {
//     console.log(`Error: ${response.error}`);
//     return false;
//   }

//   const decodedToken = jwtDecode<DecodedToken>(response.credential);

//   const data = {
//     email: decodedToken.email,
//     first_name: decodedToken.given_name,
//     last_name: decodedToken.family_name,
//   };

//   axios
//     .post(`${BASE_URL}/auth/loginWithGoogle`, data)
//     .then((response) => {
//       const token = response.data.token; // Assuming token is in `response.data.token`

//       localStorage.setItem("user", token);
//       notification.success({
//         message: "Logged in successfully with Google!",
//       });
//     })
//     .catch((err) => {
//       console.error("Error:", err.response);

//       // Show error notification
//       notification.error({
//         message: "Login failed!",
//       });
//     });
// };

export const handleGoogleLoginError = () => {
  console.log("error");
  notification.error({
    message: "Google Login Failed",
  });
};