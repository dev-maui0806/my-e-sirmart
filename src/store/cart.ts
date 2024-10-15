import { createSlice } from "@reduxjs/toolkit";
import { CartItem, CartProduct } from "../utils/types";
import items from "razorpay/dist/types/items";

type InitialState = {
  cartItems: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  billAmount: number;
};

const initialState: InitialState = {
  cartItems: [],
  totalQuantity: 0,
  totalAmount: 0,
  billAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const newItem = action.payload as CartProduct;
      console.log(newItem);
      
      const existingItem = state.cartItems.find(
        (item) => item.product.id === newItem.id
      );
      
      if (existingItem) {
        existingItem.quantity++;
      } else {
        let cartItems = state.cartItems;
        cartItems.push({
          product: newItem,
          quantity: 1
        });
        state.cartItems = cartItems;
      }
      state.totalQuantity++;
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );

      state.billAmount = state.cartItems.reduce(
        (total, item) => total + item.product.newPrice * item.quantity,
        0
      );
    },
    removeItem: (state, action) => {
      const id = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.product.id === id
      );
      if (existingItem) {
        if (existingItem.quantity === 1) {
          state.cartItems = state.cartItems.filter(
            (item) => item.product.id !== id
          );
        } else {
          existingItem.quantity--;
        }
      }

      state.totalQuantity--;

      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + item.product.mrp * item.quantity,
        0
      );
      
      state.billAmount = state.cartItems.reduce(
        (total, item) => total + item.product.newPrice * item.quantity,
        0
      );
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
    setTotalQuantity: (state, action) => {
      state.totalQuantity = action.payload;
    },
    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload;
    },
    setBillAmount: (state, action) => {
      state.billAmount = action.payload;
    }
  },
});

export default cartSlice.reducer;
export const { addItem, removeItem, setTotalQuantity, setBillAmount, setCartItems, setTotalAmount } =
  cartSlice.actions;
