import { createSlice } from "@reduxjs/toolkit";
import { CartItem, CartProduct } from "../utils/types";

type InitialState = {
  cartItems: { [key: string]: CartItem[] }; // Change to an object keyed by store ID
  totalQuantity: number;
  totalAmount: number;
  billAmount: number;
};

// Sample initial data
const initialCartItems: { [key: string]: CartItem[] } = {
  store1: [
    {
      product: {
        id: "1",
        title: "Wireless Mouse",
        price: 26,
        subTitle: "Ergonomic wireless mouse",
        newPrice: 20,
        mrp: 30,
        shopId: "store1",
        image: "logo-192.png"
      },
      quantity: 3,
    },
    {
      product: {
        id: "2",
        title: "Mechanical Keyboard",
        price: 90,
        subTitle: "High-quality mechanical keyboard",
        newPrice: 90,
        mrp: 100,
        shopId: "store1",
        image: "logo-192.png"
      },
      quantity: 1,
    },
  ],
  store2: [
    {
      product: {
        id: "3",
        title: "HDMI Cable",
        price: 10.5,
        subTitle: "High-speed HDMI cable",
        newPrice: 10.5,
        mrp: 13,
        shopId: "store2",
        image: "logo-192.png"
      },
      quantity: 1,
    },
    {
      product: {
        id: "4",
        title: "USB-C Hub",
        price: 30,
        subTitle: "Multi-port USB-C hub",
        newPrice: 30,
        mrp: 35,
        shopId: "store2",
        image: "logo-192.png"
      },
      quantity: 1,
    },
  ],
  store3: [
    {
      product: {
        id: "5",
        title: "Bluetooth Speaker",
        price: 50,
        subTitle: "Portable Bluetooth speaker",
        newPrice: 50,
        mrp: 60,
        shopId: "store3",
        image: "logo-192.png"
      },
      quantity: 1,
    },
  ],
};

const initialState: InitialState = {
  cartItems: initialCartItems,
  totalQuantity: 7,
  totalAmount: 258.5,
  billAmount: 240.5,
};

// const initialState: InitialState = {
//   cartItems: {},
//   totalQuantity: 0,
//   totalAmount: 0,
//   billAmount: 0,
// };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const newItem = action.payload as CartProduct;
      const storeId = newItem.shopId; // Use shopId from CartProduct

      // Initialize the store's cart if it doesn't exist
      if (!state.cartItems[storeId]) {
        state.cartItems[storeId] = [];
      }

      const existingItem = state.cartItems[storeId].find(
        (item) => item.product.id === newItem.id
      );

      if (existingItem) {
        existingItem.quantity++;
      } else {
        state.cartItems[storeId].push({
          product: newItem,
          quantity: 1
        });
      }
      state.totalQuantity++;
      state.totalAmount = Object.values(state.cartItems).reduce(
        (total, items) =>
          total + items.reduce((subtotal, item) => subtotal + item.product.price * item.quantity, 0),
        0
      );

      state.billAmount = Object.values(state.cartItems).reduce(
        (total, items) =>
          total + items.reduce((subtotal, item) => subtotal + item.product.newPrice * item.quantity, 0),
        0
      );
    },
    removeItem: (state, action) => {
      const { id, storeId } = action.payload; // Expecting payload to contain both id and storeId
      const existingItem = state.cartItems[storeId]?.find(
        (item) => item.product.id === id
      );
      if (existingItem) {
        if (existingItem.quantity === 1) {
          state.cartItems[storeId] = state.cartItems[storeId].filter(
            (item) => item.product.id !== id
          );
        } else {
          existingItem.quantity--;
        }
      }

      state.totalQuantity--;

      state.totalAmount = Object.values(state.cartItems).reduce(
        (total, items) =>
          total + items.reduce((subtotal, item) => subtotal + item.product.mrp * item.quantity, 0),
        0
      );

      state.billAmount = Object.values(state.cartItems).reduce(
        (total, items) =>
          total + items.reduce((subtotal, item) => subtotal + item.product.newPrice * item.quantity, 0),
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
