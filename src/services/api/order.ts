"use client";

import axios from "axios";
import { ORDERCREATEURL, VERIFYPAYMENT, GETORDERS } from "../url";

interface addressData {
  lat: number;
  lng: number;
}

interface PaymentDetails {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  amount: Number;
  currency: string;
  addressData: addressData;
}

export const orderCreate = async (adjustedBillAmount: number) => {
  const userData = localStorage.getItem("user");

  if (userData) {
    const accessToken: any = JSON.parse(userData);
    try{
      const response = await axios.post(
        ORDERCREATEURL,
        {
          amount: adjustedBillAmount + 2,
          currency: "INR",
          receipt: "receipt#1",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken.access_token}`,
          },
        }
      );
      return response;
    } catch(error: any) {
      return error.response;
    }

  }
};

export const verifyPaymentOnBackend = async (paymentDetails: PaymentDetails): Promise<any> => {
  const userData = localStorage.getItem("user");
  const cartItems: any[] = JSON.parse(localStorage.getItem("cartProducts") || "[]");

  if (userData) {
    const accessToken: { access_token: string } = JSON.parse(userData);

    try {
      const response = await axios.post(
        VERIFYPAYMENT,
        JSON.stringify({paymentDetails: paymentDetails, cartItems: cartItems}),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken.access_token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  } else {
    throw new Error("User not authenticated");
  }
};

export const getOrders = async (): Promise<any> => {
  const userData = localStorage.getItem("user");

  if (userData) {
    const accessToken: any = JSON.parse(userData);

    const response = await axios.get(
      GETORDERS,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken.access_token}`,
        },
      }
    );

    return response.data.orders;
  }
};