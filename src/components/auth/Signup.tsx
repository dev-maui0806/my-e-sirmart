import React, { useState, useEffect } from "react";
import backgroundImage from "../../assets/left_section.png";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Spin, notification } from "antd";
import { REGISTERDATA, userRegister } from "../../services/api/auth";
import { LoadingOutlined } from "@ant-design/icons";
import {
  GoogleLogin,
  googleLogout,
  GoogleOAuthProvider,
} from "@react-oauth/google"; // Import Google login and logout
// Import jwt-decode library.
import { GoogleLoginClientID } from "../../services/url";
import {
  handleGoogleLoginSuccess,
  handleGoogleLoginError,
} from "../../services/api/auth";

interface SignupProps {
  switchToLoginModal: () => void;
  toggleSignupModal: () => void;
}

const Signup: React.FC<SignupProps> = ({
  switchToLoginModal,
  toggleSignupModal,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(
    window.innerWidth <= 1023
  );
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleRepeatPasswordVisibility = () => {
    setShowRepeatPassword((prevState) => !prevState);
  };

  const validateInputs = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword
    ) {
      notification.error({ message: "Please input all fields" });
      return false;
    }
    if (password !== confirmPassword) {
      notification.error({ message: "Passwords do not match" });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    const registerData: REGISTERDATA = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
      password: password,
    };

    setLoading(true);

    try {
      const response: any = await userRegister(registerData);
      if (response === "Success") {
        notification.success({
          message: "Sign up successfully!",
        });
        switchToLoginModal();
      }
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("loading signup");
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1023);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <div
        key="signup-modal"
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <div className="max-w-screen-lg m-0 sm:m-28 bg-white shadow sm:rounded-lg flex justify-center flex-1 relative">
          <button
            className="absolute top-8 right-4 text-gray-700 hover:text-gray-900 focus:outline-none"
            onClick={toggleSignupModal}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <div className="lg:w-2/3 xl:w-7/12 p-8 bg-white rounded-lg py-24 flex justify-center items-center">
            <div className="max-w-md w-full px-10">
              <h2 className="text-3xl font-bold text-center text-[#06A67E] mb-6">
                Create Account!
              </h2>

              <div className="flex justify-center items-center mt-10 w-full">
                <GoogleOAuthProvider clientId={GoogleLoginClientID}>
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    useOneTap
                    shape="square"
                    width="366px"
                    text="signup_with"
                  />
                </GoogleOAuthProvider>
              </div>

              <div className="flex items-center justify-center my-6">
                <div className="flex-grow h-px bg-gray-300"></div>{" "}
                <span className="px-3 text-gray-500 text-sm">or </span>{" "}
                <div className="flex-grow h-px bg-gray-300"></div>{" "}
              </div>

              <div className="space-y-4 flex justify-center items-center flex-col">
                <div className="w-full flex flex-row">
                  <div className="border border-gray-300 w-full rounded-lg">
                    <input
                      className="w-full px-5 py-4 rounded-lg font-medium bg-white border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-[#06A67E]"
                      type="text"
                      placeholder="FirstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="border border-gray-300 w-full rounded-lg">
                    <input
                      className="w-full px-5 py-4 rounded-lg font-medium bg-white border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-[#06A67E]"
                      type="text"
                      placeholder="LastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border border-gray-300 w-full rounded-lg">
                  <input
                    className="w-full px-5 py-4 rounded-lg font-medium bg-white border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-[#06A67E]"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="border border-gray-300 w-full rounded-lg">
                  <input
                    className="w-full px-5 py-4 rounded-lg font-medium bg-white border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-[#06A67E]"
                    type="text"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="w-full flex flex-row">
                  <div className="border border-gray-300 w-full rounded-lg relative">
                    <input
                      className="w-full px-5 py-4 rounded-lg font-medium bg-white border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-[#06A67E]"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute top-5 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="border border-gray-300 w-full rounded-lg relative">
                    <input
                      className="w-full px-5 py-4 rounded-lg font-medium bg-white border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-[#06A67E]"
                      type={showRepeatPassword ? "text" : "password"}
                      placeholder="Repeat Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={toggleRepeatPasswordVisibility}
                      className="absolute top-5 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showRepeatPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div
                onClick={handleRegister}
                className="w-full cursor-pointer mt-7 py-4 hidden lg:flex justify-center items-center bg-[#06A67E] text-white font-semibold rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out"
              >
                {loading ? (
                  <Spin
                    indicator={<LoadingOutlined spin />}
                    style={{ marginRight: "15px", color: "#fff" }}
                  />
                ) : (
                  "SIGN UP"
                )}
              </div>

              {isMobileView && (
                <div className="flex flex-row justify-between items-center">
                  <div
                    onClick={handleRegister}
                    className="w-full cursor-pointer mt-4 py-4 flex justify-center items-center bg-[#06A67E] text-white font-semibold rounded-[50px] hover:bg-opacity-90 transition duration-300 ease-in-out"
                  >
                    {loading ? (
                      <Spin
                        indicator={<LoadingOutlined spin />}
                        style={{ marginRight: "15px", color: "#fff" }}
                      />
                    ) : (
                      "SIGN UP111"
                    )}
                  </div>
                  <div
                    onClick={switchToLoginModal}
                    className="w-full cursor-pointer mt-4 py-4 flex justify-center items-center bg-[#06A67E] text-white font-semibold rounded-[50px] hover:bg-opacity-90 transition duration-300 ease-in-out"
                  >
                    <p className="ml-2">SIGN IN</p>
                    <FaAnglesRight />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="flex-1 bg-[#06A67E] text-center hidden lg:flex sm:rounded-lg justify-center items-center"
            style={{
              borderTopLeftRadius: "0px",
              borderBottomLeftRadius: "0px",
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex flex-col items-center justify-center p-8 rounded-lg max-w-sm">
              <h1 className="text-3xl font-bold text-white mb-4">
                Welcome Back!
              </h1>
              <p className="text-white mb-8 text-center">
                To keep connected with us please login with your personal info
              </p>

              <div
                onClick={switchToLoginModal}
                className="px-8 py-3 border-2 cursor-pointer border-white text-white rounded-full hover:bg-white hover:text-[#06A67E] transition-all duration-300 ease-in-out flex flex-row justify-center items-center"
              >
                <FaAnglesLeft />
                <p className="ml-2">SIGN IN</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
