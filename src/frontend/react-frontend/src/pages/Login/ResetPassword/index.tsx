// src/pages/Login/ResetPassword.tsx - ResetPassword

import React, { useRef, useState, useEffect } from "react";
import VerificationCodeModal from '@/pages/Login/ResetPassword/VerificationCodeModal';
import { UserData } from '@/interfaces/User/UserData';
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { updateUser, getUserByName } from '@/services/userService';
import { sendVerificationCode, verifyCode } from '@/services/loginService';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ResetPassword: React.FC = () => {

    const userNameRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    
    // Use the useNavigate hook to handle page navigation
    const navigate = useNavigate();

    const [showVerification, setShowVerification] = useState(false);
    const [currentUser, setcurrentUser] = useState<UserData | null>(null);

    // State to track password values and their validity
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [passwordValid, setPasswordValid] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
    });
    const [isPasswordMatch, setIsPasswordMatch] = useState<boolean>(false);

    // Effect to validate password on change
    useEffect(() => {
        const length = password.length >= 8;
        const uppercase = /[A-Z]/.test(password);
        const lowercase = /[a-z]/.test(password);
        const number = /\d/.test(password);
        setPasswordValid({ length, uppercase, lowercase, number });

        // Check if passwords match
        setIsPasswordMatch(password !== "" && password === passwordAgain);
    }, [password, passwordAgain]);

    const ResetPasswordHandler = async () => {

        try {

            // Validation function: allows only Chinese characters, English letters, and numbers
            const validateInput = (input: string | null, fieldName: string) => {
                if (fieldName === "帳號") {
                    // Check if input is null or contains invalid characters
                    if (input === null || !/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(input)) {
                        toast.error(
                            <div>
                                {fieldName}只能包含中英文、數字，且不能為空
                            </div>,
                        );
                        throw new Error(`${fieldName}只能包含中英文、數字，且不能為空`);
                    }
                } else if (fieldName === "密碼") {
                    // Check if password meets requirements
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
                    if (input === null || !passwordRegex.test(input)) {
                        toast.error(
                            <div>
                                {fieldName}必須包含大小寫英文、數字，且長度至少為8個字元
                            </div>,
                        );
                        throw new Error(`${fieldName}必須包含大小寫英文、數字，且長度至少為8個字元`);
                    }
                } else if (fieldName === "email") {
                    // Basic email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (input === null || input === "" || !emailRegex.test(input)) {
                        toast.error(
                            <div>
                                {fieldName}格式不正確
                            </div>,
                        );
                        throw new Error(`${fieldName}格式不正確`);
                    }
                }
            };

            // Get input values from refs
            const userName = userNameRef.current?.value || null;
            const userPassword = password || null;
            const userPasswordAgain = passwordAgain || null;

            // Avoid Not-existed userName
            const users = await getUserByName(userName);
            if (users.length === 0) {
                toast.error(`此用戶不存在`);
                throw new Error(`此用戶不存在`);
            }

            const currentUser = users[0];
            setcurrentUser(currentUser);

            const currentEmail = currentUser!.email;
            const inputEmail = emailRef.current?.value || currentUser!.email;

            // Validate each input
            validateInput(userName, "帳號");
            validateInput(userPassword, "密碼");
            validateInput(userPasswordAgain, "密碼");
            validateInput(inputEmail, "email");

            // Avoid inconsistent password
            if (userPassword !== userPasswordAgain) {
                toast.error(`請確保兩次輸入的密碼相同。`);
                throw new Error(`請確保兩次輸入的密碼相同。`);
            }

            // Ensure password meets all conditions before sending verification code
            const allValid = Object.values(passwordValid).every(Boolean);
            if (!allValid) {
                toast.error(`密碼不符合所有要求。`);
                throw new Error(`密碼不符合所有要求。`);
            }

            const response = await sendVerificationCode(userName, currentEmail);

           
            setShowVerification(true);

            // Show success toast with bold email
            toast.success(
                <div>
                    驗證碼已寄送到您的信箱 <strong>{currentEmail}</strong>。
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
    
            const userName = userNameRef.current?.value || currentUser.userName;
            const inputEmail = emailRef.current?.value || currentUser.email;
    
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
        <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#F7F1F0] to-[#C3A6A0]">
            <div className="w-[28rem] bg-white rounded-lg shadow-lg p-10 relative">
                {/* Back to Login Button */}
                <button
                    onClick={() => navigate("../../auth/login")}
                    className="text-base text-[#A15C38] hover:text-[#262220] font-medium transition-colors"
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
                    <div className="mb-6">
                        <label
                            className="block text-base font-medium text-[#262220] mb-2"
                            htmlFor="userName"
                        >
                            帳號
                        </label>
                    <input
                        ref={userNameRef}
                        id="userName"
                        className="w-full px-5 py-3 border border-[#C3A6A0] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                        placeholder="輸入您的帳號"
                        required
                    />
                    </div>
                    <div className="mb-6">
                        <label
                            htmlFor="password"
                            className="block text-base font-medium text-[#262220] mb-2"
                        >
                            新密碼
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            className="w-full px-5 py-3 border border-[#C3A6A0] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                            placeholder="輸入您的新密碼"
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
                    <div className="mb-6">
                        <label
                            htmlFor="repassword"
                            className="block text-base font-medium text-[#262220] mb-2"
                        >
                            再次輸入新密碼
                        </label>
                        <input
                            type="password"
                            value={passwordAgain}
                            onChange={(e) => setPasswordAgain(e.target.value)}
                            id="repassword"
                            className="w-full px-5 py-3 border border-[#C3A6A0] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                            placeholder="再次輸入您的新密碼"
                            required
                        />
                        {/* Password Match Indicator */}
                        {passwordAgain && (
                            <div className="flex items-center mt-1">
                                {isPasswordMatch ? (
                                    <FaCheckCircle className="text-green-500 mr-2" />
                                ) : (
                                    <FaTimesCircle className="text-red-500 mr-2" />
                                )}
                                <span className={isPasswordMatch ? "text-green-500" : "text-red-500"}>
                                    {isPasswordMatch ? "密碼一致" : "密碼不一致"}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="mb-6">
                        <label
                            htmlFor="email"
                            className="block text-base font-medium text-[#262220] mb-2"
                        >
                            修改 email (不修改請空白)
                        </label>
                        <input
                            type="email"
                            ref={emailRef}
                            id="email"
                            className="w-full px-5 py-3 border border-[#C3A6A0] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                            placeholder="輸入您的email"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#A15C38] hover:bg-[#262220] text-white font-medium py-3 text-lg rounded-lg transition-colors"
                        disabled={!Object.values(passwordValid).every(Boolean) || !isPasswordMatch}
                    >
                        送出
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

export default ResetPassword