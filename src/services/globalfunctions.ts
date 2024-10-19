"use client";

import { notification } from "antd";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "./url";

interface DecodedToken {
  email: string;
  name: string;
  given_name: string;
  family_name: string;
}

export const getLocation = () => {
  return new Promise((res, rej) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        res({ longitude, latitude });
      },
      (error) => {
        rej(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

export const handleGoogleLoginSuccess = (response: any) => {
  if (response.error) {
    console.log(`Error: ${response.error}`);
    return false;
  }

  const decodedToken = jwtDecode<DecodedToken>(response.credential);

  const data = JSON.stringify({
    email: decodedToken.email,
    first_name: decodedToken.given_name,
    last_name: decodedToken.family_name
  })

  axios.post(`${BASE_URL}/auth/loginWithGoogle`, data)
    .then(response => {
      console.log(response);
    })
    .catch(err => {
      console.log(err.response);
      console.error(err);
    })

  notification.success({
    message: "Logged in successfully with Google!",
  });
};

export const handleGoogleLoginError = () => {
  console.log("error");
  notification.error({
    message: "Google Login Failed",
  });
};