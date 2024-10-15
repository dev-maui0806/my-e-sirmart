"use client";

import { notification } from "antd";
import axios from "axios";
import { FORGOTPASSWORD, LOGIN, REGISTER } from "../url.js";

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


export const userLogin = async (payload: LOGINDATA) => {
  try {
    const loginData: any = {
      data: {
        attributes: payload,
      },
    };

    // Ensure the payload is properly formatted
    const response = await axios.post(LOGIN, loginData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

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
      localStorage.setItem("userInfo", JSON.stringify(response.data));
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
