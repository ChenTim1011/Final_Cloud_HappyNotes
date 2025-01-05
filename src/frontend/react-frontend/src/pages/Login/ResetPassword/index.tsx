// src/pages/Login/ResetPassword.tsx - ResetPassword

import React, { useState, useEffect } from "react";
import VerificationCodeModal from '@/pages/Login/ResetPassword/VerificationCodeModal';
import { UserData } from '@/interfaces/User/UserData';
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { updateUser, getUserByName } from '@/services/userService';
import { sendVerificationCode, verifyCode } from '@/services/loginService';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DOMPurify from 'dompurify';

const ResetPassword: React.FC = () => {

    // Username, email, password, and password match states
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");

    // Validate username, email, password, and password match
    const [userNameValid, setUserNameValid] = useState<boolean>(false);
    const [emailValid, setEmailValid] = useState<boolean>(false);
    const [passwordValid, setPasswordValid] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
    });
    const [passwordValidState, setPasswordValidState] = useState<boolean>(false);
    const [isPasswordMatch, setIsPasswordMatch] = useState<boolean>(false);

    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    const [showVerification, setShowVerification] = useState(false);

    const navigate = useNavigate();

    // Button disabled state
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

    // Use DOMPurify to sanitize input
    const sanitizeInput = (input: string) => DOMPurify.sanitize(input);

    // Validate username
    useEffect(() => {
        const userNameRegex = /^[A-Za-z0-9]+$/; // Allow only alphanumeric characters
        const valid = userNameRegex.test(userName) && userName.length > 0;
        setUserNameValid(valid);
    }, [userName]);

    // Validate email
    useEffect(() => {
        if (email.trim() === "") {
            setEmailValid(false);
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const valid = emailRegex.test(email);
        setEmailValid(valid);
    }, [email]);

    // Validate password
    useEffect(() => {
        const length = password.length >= 8;
        const uppercase = /[A-Z]/.test(password);
        const lowercase = /[a-z]/.test(password);
        const number = /\d/.test(password);
        setPasswordValid({ length, uppercase, lowercase, number });

        const isValid = length && uppercase && lowercase && number;
        setPasswordValidState(isValid);

        // Check if the password matches
        setIsPasswordMatch(password !== "" && password === passwordAgain);
    }, [password, passwordAgain]);

    const ResetPasswordHandler = async () => {
        // If the button is disabled, return
        if (isButtonDisabled) {
            return;
        }

        try {
            // Button disabled for 1 second
            setIsButtonDisabled(true);
            // Set button to be enabled after 1 second
            setTimeout(() => {
                setIsButtonDisabled(false);
            }, 1000);

            // B
            if (!userName || !password || !passwordAgain) {
                toast.error("請填寫所有必填欄位。");
                return;
            }

            // Check if the user exists
            const users = await getUserByName(userName);
            if (users.length === 0) {
                toast.error("帳號或密碼錯誤");
                return;
            }

            const currentUser = users[0];
            setCurrentUser(currentUser);

            const currentEmail = currentUser.email;
            const inputEmail = email.trim();

            // Verify username
            const userNameRegex = /^[A-Za-z0-9]+$/;
            if (!userNameRegex.test(userName)) {
                toast.error("帳號無效（僅含英文和數字）。");
                return;
            }

            // Verify password
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                toast.error("密碼無效（至少8個字元，包含大寫字母、小寫字母及數字）。");
                return;
            }

            // Verify password match
            if (password !== passwordAgain) {
                toast.error("請確保兩次輸入的密碼相同。");
                return;
            }

            // Ensure password meets all conditions before sending verification code
            if (inputEmail !== "") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(inputEmail)) {
                    toast.error("Email 格式無效。");
                    return;
                }
            }

            
            const allValid = Object.values(passwordValid).every(Boolean);
            if (!allValid) {
                toast.error("密碼不符合所有要求。");
                return;
            }

            // Send verification code
            await sendVerificationCode(userName, inputEmail || currentEmail);
            setShowVerification(true);

            // Show success toast with bold email
            toast.success(
                <div>
                    驗證碼已寄送到您的信箱 <strong>{inputEmail || currentEmail}</strong>。
                </div>,
            );

        } catch (error) {
            // Catch errors and output the error message
            if (error instanceof Error) {
                console.error("發生錯誤", error.message);
                toast.error(
                    <div>
                        發生錯誤。{error.message}
                    </div>,
                );
            } else {
                console.error("發生未知錯誤");
                toast.error(
                    <div>
                        發生未知錯誤。
                    </div>,
                );
            }
        }
    }

    const handleVerificationSubmit = async (code: string) => {
        try {
            if (!currentUser) {
                throw new Error("沒有找到當前用戶資料");
            }

            const userName = currentUser.userName;
            const inputEmail = email.trim() || currentUser.email;

            // Call the verifyCode function to verify the code
            const verifyResponse = await verifyCode(
                userName,
                inputEmail,
                code
            );

            if (verifyResponse.message === "驗證成功") {
                // Hash the password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Update user data
                const updatedUser: UserUpdateData = {
                    userName: userName,
                    userPassword: hashedPassword,
                    email: inputEmail,
                    isLoggedin: false,
                };

                // Update user data in the database
                await updateUser(currentUser._id, updatedUser);
                toast.success('更新成功');
                navigate('../../auth/login');
            } else {
                toast.error('驗證失敗，請確認驗證碼。');
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error("驗證失敗", error.message);
                toast.error(
                    <div>
                        驗證失敗。{error.message}
                    </div>,
                );
            } else {
                console.error("發生未知錯誤");
                toast.error(
                    <div>
                        發生未知錯誤。
                    </div>,
                );
            }
        } finally {
            setShowVerification(false);
        }
    };

    // Function to render validation icon and text
    const renderValidation = (isValid: boolean, text: string) => {
        return (
            <div className="flex items-center mb-1">
                {isValid ? (
                    <FaCheckCircle className="text-green-500 mr-2" />
                ) : (
                    <FaTimesCircle className="text-red-500 mr-2" />
                )}
                <span className={isValid ? "text-green-500" : "text-red-500"}>
                    {text}
                </span>
            </div>
        );
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#F7F1F0] to-[#C3A6A0]">
            <div className="w-[28rem] bg-white rounded-lg shadow-lg p-10 relative">
                {/* Back to Login Button */}
                <button
                    onClick={() => navigate("../../auth/login")}
                    className=" text-base text-[#A15C38] hover:text-[#262220] font-medium transition-colors mb-4"
                >
                    回登入畫面
                </button>

                {/* Title */}
                <h2 className="text-3xl font-semibold text-center text-[#262220] mb-8">
                    重新設定密碼
                </h2>

                {/* ResetPassword Form */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        ResetPasswordHandler();
                    }}
                >
                    <div className="mb-3">
                        <label
                            className="block text-base font-medium text-[#262220] mb-2"
                            htmlFor="userName"
                        >
                            帳號
                        </label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(sanitizeInput(e.target.value))}
                            id="userName"
                            className={`w-full px-5 py-3 border ${
                                userName ? (userNameValid ? "border-green-500" : "border-red-500") : "border-[#C3A6A0]"
                            } rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]`}
                            placeholder="輸入您的帳號 (英文、數字)"
                            required
                        />
                        {userName && renderValidation(userNameValid, userNameValid ? "帳號有效（僅含英文和數字）" : "帳號無效（僅含英文和數字）")}
                    </div>
                    <div className="mb-3">
                        <label
                            htmlFor="password"
                            className="block text-base font-medium text-[#262220] mb-2"
                        >
                            新密碼
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(sanitizeInput(e.target.value))}
                            id="password"
                            maxLength={100}
                            className={`w-full px-5 py-3 border ${
                                passwordValidState ? "border-green-500" : (password ? "border-red-500" : "border-[#C3A6A0]")
                            } rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]`}
                            placeholder="至少8個字元，包含大小寫字母及數字"
                            required
                        />
                        {/* Password Validation Indicators */}
                        <div className="mt-2">
                            {renderValidation(passwordValid.length, "至少8個字元")}
                            {renderValidation(passwordValid.uppercase, "至少一個大寫字母")}
                            {renderValidation(passwordValid.lowercase, "至少一個小寫字母")}
                            {renderValidation(passwordValid.number, "至少一個數字")}
                        </div>
                    </div>
                    <div className="mb-3">
                        <label
                            htmlFor="repassword"
                            className="block text-base font-medium text-[#262220] mb-2"
                        >
                            再次輸入新密碼
                        </label>
                        <input
                            type="password"
                            value={passwordAgain}
                            onChange={(e) => setPasswordAgain(sanitizeInput(e.target.value))}
                            id="repassword"
                            maxLength={100}

                            className={`w-full px-5 py-3 border ${
                                isPasswordMatch ? "border-green-500" : (passwordAgain ? "border-red-500" : "border-[#C3A6A0]")
                            } rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]`}
                            placeholder="再次輸入您的新密碼"
                            required
                        />
                        {passwordAgain && renderValidation(isPasswordMatch, isPasswordMatch ? "密碼一致" : "密碼不一致")}
                    </div>
                    <div className="mb-3">
                        <label
                            htmlFor="email"
                            className="block text-base font-medium text-[#262220] mb-2"
                        >
                            重新設定 Email (不重新設定請空白)
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                            id="email"
                            maxLength={100}
                            className={`w-full px-5 py-3 border ${
                                email ? (emailValid ? "border-green-500" : "border-red-500") : "border-[#C3A6A0]"
                            } rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]`}
                            placeholder="example@domain.com"
                        />
                        {email && renderValidation(emailValid, emailValid ? "Email 格式有效" : "Email 格式無效")}
                    </div>
                    <button
                        type="submit"
                        className={`w-full bg-[#A15C38] hover:bg-[#262220] text-white font-medium py-3 text-lg rounded-lg transition-colors ${
                            (!userNameValid || !passwordValidState || (email && !emailValid) || !isPasswordMatch || isButtonDisabled)
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                        disabled={!userNameValid || !passwordValidState || (email && !emailValid) || !isPasswordMatch || isButtonDisabled}
                    >
                        {isButtonDisabled ? "請稍候..." : "送出"}
                    </button>
                </form>
            </div>

            {showVerification && (
                <VerificationCodeModal
                    onClose={() => setShowVerification(false)}
                    onSubmit={handleVerificationSubmit}
                />
            )}
        </div>
    );
}

export default ResetPassword;
