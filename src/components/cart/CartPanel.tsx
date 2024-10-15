import { notification, Spin, Tag, Modal } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import delivery from "../../assets/fast-delivery.png";
import gross from "../../assets/gross.png";
import handing from "../../assets/handing.png";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { orderCreate, verifyPaymentOnBackend } from "../../services/api/order";
import {
  listProductsApi,
  ProductSearchPayload,
} from "../../services/api/products";
import { hideCart } from "../../store/ui";
import { shuffleItems } from "../../utils/helper";
import { CartItem, ProductItem } from "../../utils/types";
import AddToCartButton from "../shared/AddToCartButton";
import Login from "../auth/Login";
import SignUp from "../auth/Signup";
import { ComapnyDescription, CompanyName, razorpayKeyId, SERVER_URL } from "../../services/url";
import { setBillAmount, setCartItems, setTotalQuantity } from "../../store/cart";
import AddressSelection from "../addressSection";

type UserInfo = {
  username: string;
  email: string;
  phone_number: string;
} | null;

const CartPanelItem = (props: CartItem) => {
  const { image, title, price, newPrice } = props.product;
  return (
    <div className="flex p-4 gap-4 border-t _border-muted">
      <div>
        <div className="h-[72px] w-[72px] border rounded-[4px] overflow-hidden">
          <img
            src={`${SERVER_URL}/${image}`}
            alt=""
            className="h-full w-full"
          />
        </div>
      </div>
      <div className="text-left flex flex-col flex-1">
        <div className="_text-default text-[15px] leading-tight mb-2">
          {title}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-[14px] _text-default">₹{newPrice}</span>
            {price-newPrice > 0 && <span
              className="text-[14px]"
              style={{
                textDecorationLine: "line-through",
                marginLeft: "5px",
              }}
            >
              ₹{price}
            </span>}
          </div>
          <div className="h-9 w-[90px]">
            <AddToCartButton product={props.product} />
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPanel = () => {
  const dispatch = useAppDispatch();
  const { totalQuantity, cartItems, billAmount, totalAmount } =
    useAppSelector((state) => state.cart);

  const [topProducts, setTopProducts] = useState<ProductItem[]>([]);
  const [isUserInfo, setIsUserInfo] = useState<UserInfo>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState<boolean>(false);

  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [isProceedStatus, setProceedStatus] = useState<boolean>(false);
  const [addressData, setAddressData] = useState<any>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    const userInformation = localStorage.getItem("userInfo");

    if (userInformation) {
      try {
        const parsedUserInfo = JSON.parse(userInformation);
        setIsUserInfo(parsedUserInfo);
      } catch (error) {
        console.error(
          "Failed to parse user information from localStorage:",
          error
        );
      }
    } else {
      setIsUserInfo(null);
    }
  }, []);

  const toggleLoginModal = () => {
    setIsLoginModalOpen(!isLoginModalOpen);
  };

  const toggleSignupModal = () => {
    setIsSignUpModalOpen(!isSignUpModalOpen);
  };

  const switchToSignUpModal = () => {
    setIsLoginModalOpen(false); // Close login modal
    setIsSignUpModalOpen(true); // Open sign-up modal
  };

  const switchToLoginModal = () => {
    setIsSignUpModalOpen(false); // Close sign-up modal
    setIsLoginModalOpen(true); // Open login modal
  };

  const switchToForgotPassModal = () => {
    
  }

  useEffect(() => {
    const fetchProducts = async () => {
      const data: ProductSearchPayload = {
        searchText: "",
        shopId: "",
        category: "",
        nearby: false,
        page: 1,
        limit: 50,
      };
      try {
        const productItems = await listProductsApi(data); // Await the promise
        const allProducts: ProductItem[] = [];

        productItems.forEach((obj: any) => {
          const items = obj.products.map((product: any) => product);
          allProducts.push(...items);
        });

        const addedProducts = cartItems.map((item) => item.product.id);
        const otherProducts = allProducts.filter(
          (item) => !addedProducts.includes(item._id.toString())
        );
        const shuffledProducts = shuffleItems(otherProducts).slice(0, 10);
        setTopProducts(shuffledProducts);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, [cartItems]);

  const clearCart = () => {
    localStorage.removeItem("cartProducts");

    dispatch(setCartItems([]));
    dispatch(setTotalQuantity(0));
    dispatch(setBillAmount(0));
  };

  const toggleAddressModal = () => {
    setIsAddressModalOpen(!isAddressModalOpen);
  };

  const handleAddressSelect = (latitude: number, longitude: number) => {
    setAddressData({ lat: latitude, lng: longitude });
    setIsAddressModalOpen(false);
  };

  const initiatePayment = async () => {
    if (!addressData) {
      toggleAddressModal();
      return;
    }

    setProceedStatus(true);
    const response = await orderCreate(adjustedBillAmount);
    
    if (response?.status === 401) {
      notification.error({
        message: "Proceed Failed, Please login again!"
      });
      localStorage.removeItem("user");
      setProceedStatus(false);
      return;
    }

    const data = response?.data;
    
    const options: any = {
      key: razorpayKeyId,
      amount: data.amount,
      currency: data.currency,
      name: CompanyName,
      description: ComapnyDescription,
      order_id: data.id,
      handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        notification.success({
          message: "Payment Successful",
          description: `Your payment of ₹${data.amount / 100} has been successfully processed. Thank you for your purchase!`,
        });

        verifyPaymentOnBackend({...response, amount: data.amount, currency: data.currency, addressData: addressData})
          .then((result) => {
            console.log(result);

            clearCart();
            notification.success({
              message: "Payment Verification Successful",
              description: "Your payment has been verified and your order is confirmed.",
            });
            setProceedStatus(false);
          })
          .catch((error) => {
            notification.error({
              message: "Payment Verification Failed",
              description: error?.response?.data?.message || "An error occurred during payment verification.",
            });
            setProceedStatus(false);
          });
      },
      prefill: {
        name: isUserInfo?.username || "Guest",
        email: isUserInfo?.email,
        contact: isUserInfo?.phone_number,
      },
      theme: {
        // color: "#61dafb",
        color: "#3399cc"
      },
      modal: {
        ondismiss: () => {
          notification.warning({
            message: "Payment Cancelled",
            description: "You closed the payment window. If this was a mistake, you can retry the payment.",
          });
          setProceedStatus(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.open();

    rzp.on('payment.failed', (response: any) => {
      notification.error({
        message: "Payment Failed",
        description: `Payment failed due to: ${response.error.description}. Please try again or use another payment method.`,
      });
    });
  };

  useEffect(() => {
    const loginData = localStorage.getItem("user");

    if (loginData) {
      setLoginStatus(true);
    } else {
      setLoginStatus(false);
    }
  }, []);

  const adjustedBillAmount = billAmount < 100 ? billAmount + 15 : billAmount;

  return (
    <div className="fixed inset-0 h-screen w-screen z-50 overflow-hidden p-4">
      <div
        className="absolute z-10 inset-0 bg-black bg-opacity-[.65]"
        onClick={() => !isProceedStatus ? dispatch(hideCart()) : null}
      />
      <aside
        className="_drawer flex flex-col overflow-y-auto overflow-x-hidden"
        style={{ right: "15px" }}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between p-4">
          <h2 className="font-extrabold text-2xl _text-default">My Cart</h2>
          <IoClose
            size={24}
            className="cursor-pointer"
            onClick={() => {!isProceedStatus ? dispatch(hideCart()) : null}}
          />
        </div>
        {totalQuantity === 0 && cartItems.length === 0 ? (
          <div className="flex-1 bg-white p-6">
            <div className="flex flex-col gap-3 justify-center items-center text-center">
              <img src="empty-cart.webp" alt="" className="h-36 w-36" />
              <h3 className="font-bold text-lg leading-tight">
                You don't have any items in your cart
              </h3>
              <p className="text-sm _text-default mb-2">
                Your favourite items are just a click away
              </p>
              <button
                type="button"
                onClick={() => dispatch(hideCart())}
                className="bg-[#0c831f] text-white rounded-[8px] px-4 py-3 leading-none text-[13px] font-medium cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1" style={{ padding: "15px" }}>
              <div className="space-y-3 my-3">
                <div
                  className="bg-white border-y _border-muted"
                  style={{
                    borderRadius: "5px",
                    boxShadow: "0.5px 0.1px 1px 1px #ede7e7",
                  }}
                >
                  <div className="flex flex-col px-4 pt-5">
                    <div className="flex justify-between _text-muted text-xs">
                      <span>shipment of&nbsp;{totalQuantity} items</span>
                    </div>
                    <p className="text-sm _text-default font-bold mb-1">
                      Delivery in some times
                    </p>
                  </div>
                  <div className="divide-y-1">
                    {cartItems.length > 0
                      ? cartItems.map((item) => (
                          <CartPanelItem key={item.product.id} {...item} />
                        ))
                      : cartItems.map((item) => (
                          <CartPanelItem key={item.product.id} {...item} />
                        ))}
                  </div>
                </div>
                <div
                  className="bg-white"
                  style={{
                    borderRadius: "5px",
                    boxShadow: "0.5px 0.1px 1px 1px #ede7e7",
                  }}
                >
                  <div
                    className="font-bold text-xl text-black pt-5 px-4"
                    style={{ fontSize: "17px" }}
                  >
                    Bill Details
                  </div>
                  <div className="px-4 text-xs space-y-2 py-2">
                    <div className="flex items-start justify-between _text-default">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={gross}
                          alt="gross"
                          style={{ width: "18px", marginRight: "5px" }}
                        />
                        <span>Items total</span>
                        {totalAmount - billAmount > 0 && <Tag
                          style={{
                            backgroundColor: '#EDF4FF',
                            borderColor: '#f0f5ff',
                            color: 'rgb(37, 111, 239)',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            marginLeft: '5px'
                          }}
                        >
                          Saved ₹{totalAmount - billAmount}
                        </Tag>}
                      </div>
                      <span>
                          {totalAmount - billAmount > 0 &&  <span
                            style={{
                              textDecorationLine: "line-through",
                              marginRight: "5px",
                            }}
                          >
                            ₹{totalAmount}
                          </span>}
                        <span>₹{billAmount}</span>
                      </span>
                    </div>
                    <div className="flex items-start justify-between _text-default">
                      <p className="flex flex-col">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={delivery}
                            alt="delivery"
                            style={{ width: "20px", marginRight: "5px" }}
                          />
                          <span>Delivery charge</span>
                        </div>
                      </p>
                      {billAmount > 100 ? (
                        <span>
                          <span
                            style={{
                              textDecorationLine: "line-through",
                              marginRight: "5px",
                            }}
                          >
                            ₹15
                          </span>
                          <span
                            className="text-[#0c831f]"
                            style={{ fontSize: "13px" }}
                          >
                            Free
                          </span>
                        </span>
                      ) : (
                        <span>₹15</span>
                      )}
                    </div>
                    <div className="flex items-start justify-between _text-default">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={handing}
                          alt="Handing charge"
                          style={{ width: "17px", marginRight: "5px" }}
                        />
                        <span>Handling charge</span>
                      </div>
                      <span>₹2</span>
                    </div>
                    <div className="flex items-start justify-between text-[14px] text-black font-bold py-2">
                      <span style={{ color: "#404040" }}>Grand total</span>
                      <span>₹{adjustedBillAmount + 2}</span>
                    </div>
                  </div>
                </div>
                <div
                  className="bg-white border-y _border-muted"
                  style={{
                    borderRadius: "5px",
                    boxShadow: "0.5px 0.1px 1px 1px #ede7e7",
                  }}
                >
                  <div className="flex flex-col px-4 pt-2">
                    <p className="text-sm _text-default font-bold mb-1">
                      Delivery in some times
                    </p>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        fontStyle: "normal",
                        fontFamily: "Okra",
                        lineHeight: "15px",
                        paddingBottom: "12px",
                        color: "#828282",
                      }}
                    >
                      Orders cannot be cancelled once packed for delivery. In
                      case of unexpected delays, a refund will be provided, if
                      applicable.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="sticky bottom-0 bg-white px-4 pt-2 pb-4 min-h-[68px] _shadow_sticky"
              onClick={() => {
                if (!loginStatus) {
                  toggleLoginModal();
                } else {
                  initiatePayment();
                }
              }}
            >
              <div className="bg-[#0c831f] cursor-pointer text-white flex items-center px-3 py-3 rounded-[4px] font-medium text-[14px]">
                <div className="font-bold">{totalQuantity} Items</div>
                <div className="font-bold">&nbsp; &middot; &nbsp;</div>
                <div>
                  <span className="font-extrabold">
                    ₹{adjustedBillAmount + 2}
                  </span>
                </div>
                <div className="ml-auto flex items-center font-bold">
                  {!isProceedStatus ? (
                    <>
                      {!loginStatus ? "Login to " : null}Proceed
                    </>
                  ) : (
                    <Spin 
                      indicator={<LoadingOutlined spin />} 
                      style={{ marginRight: '15px', color: '#fff' }} 
                    />
                  )}
                  <FiChevronRight size={18} className="ml-2" />
                </div>
              </div>
            </div>

            <Modal
              title="Select Address"
              visible={isAddressModalOpen}
              onCancel={toggleAddressModal}
              footer={null}
              width={1000}
            >
              <AddressSelection onAddressSelect={handleAddressSelect} />
            </Modal>
            {/* Render Login Modal */}
            {isLoginModalOpen && (
              <Login
                toggleLoginModal={toggleLoginModal}
                switchToSignupModal={switchToSignUpModal}
                switchToForgotPassModal={switchToForgotPassModal}
              />
            )}

            {/* Render Sign Up Modal */}
            {isSignUpModalOpen && (
              <SignUp
                switchToLoginModal={switchToLoginModal}
                toggleSignupModal={toggleSignupModal}
              />
            )}
          </>
        )}
      </aside>
    </div>
  );
};

export default CartPanel;