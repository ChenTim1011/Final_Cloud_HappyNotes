// src/pages/Login/Register.tsx - Register

import React, { useState, useEffect } from "react";
import { createUser, getUserByName } from '@/services/userService';
import { CreateUserData } from '@/interfaces/User/CreateUserData';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import VerificationCodeModal from '@/pages/Login/ResetPassword/VerificationCodeModal'; 
import { sendVerificationCode, verifyCode } from '@/services/loginService'; 
import DOMPurify from 'dompurify'; 

const Register: React.FC = () => {
    // State to manage form inputs
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [email, setEmail] = useState("");

    // State to track password validity
    const [passwordValid, setPasswordValid] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
    });

    // State to track if passwords match
    const [isPasswordMatch, setIsPasswordMatch] = useState<boolean>(false);

    // State to handle verification modal
    const [showVerification, setShowVerification] = useState(false);
    
    // Temporary state to hold user data until verification
    const [tempUserData, setTempUserData] = useState<CreateUserData | null>(null);

    // Validation states for each field
    const [userNameValid, setUserNameValid] = useState<boolean>(false);
    const [passwordValidState, setPasswordValidState] = useState<boolean>(false);
    const [emailValid, setEmailValid] = useState<boolean>(false);

    // Use the useNavigate hook to handle page navigation
    const navigate = useNavigate();    

    // Function to sanitize input using DOMPurify to prevent injection
    const sanitizeInput = (input: string) => DOMPurify.sanitize(input);

    // Effect to validate password on change
    useEffect(() => {
        const length = password.length >= 8;
        const uppercase = /[A-Z]/.test(password);
        const lowercase = /[a-z]/.test(password);
        const number = /\d/.test(password);
        setPasswordValid({ length, uppercase, lowercase, number });

        // Update password validity state
        const isValid = length && uppercase && lowercase && number;
        setPasswordValidState(isValid);

        // Check if passwords match
        setIsPasswordMatch(password !== "" && password === passwordAgain);
    }, [password, passwordAgain]);

    // Effect to validate email in real-time
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const valid = emailRegex.test(email);
        setEmailValid(valid);
    }, [email]);

    // Effect to validate userName in real-time
    useEffect(() => {
        // Updated regex: only English letters and numbers
        const userNameRegex = /^[A-Za-z0-9]+$/;
        const valid = userNameRegex.test(userName) && userName.length > 0;
        setUserNameValid(valid);
    }, [userName]);

    const registerHandler = async () => {
        try {
            // Perform final validation before submission
            if (!userNameValid || !passwordValidState || !emailValid || !isPasswordMatch) {
                toast.error("請修正表單中的錯誤。");
                return;
            }

            // Avoid Duplicated userName
            const users = await getUserByName(userName);
            if(users.length !== 0){
                toast.error("此使用者已存在");
                return;
            }

            // Prepare temporary user data
            const newUserData: CreateUserData = {
                userName: userName,
                userPassword: "", // Placeholder, will set after hashing
                email: email,
            };
            setTempUserData(newUserData);

            // Send verification code
            await sendVerificationCode(userName, email);
            setShowVerification(true);

            // Show success toast with bold email
            toast.success(
                <div>
                    驗證碼已寄送到您的信箱 <strong>{email}</strong>。
                </div>,
            );

        } catch (error) {
            // Catch errors and output the error message
            if (error instanceof Error) {
                console.error("註冊失敗", error.message);
                toast.error(
                    <div>
                        註冊失敗。{error.message}
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
    };

    const handleVerificationSubmit = async (code: string) => {
        try {
            if (!tempUserData) {
                throw new Error("沒有暫存的用戶資料");
            }

            // Verify the code via API
            const verifyResponse = await verifyCode(
                tempUserData.userName,
                tempUserData.email,
                code
            );

            if (verifyResponse.message === "驗證成功") {
                // Hash the password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Update the temporary user data with hashed password
                const finalUserData: CreateUserData = {
                    ...tempUserData,
                    userPassword: hashedPassword,
                };

                // Create the user
                await createUser(finalUserData);
                toast.success('註冊成功！');
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
            setTempUserData(null);
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
                <h2 className="text-2xl font-semibold text-center text-[#262220] mb-6">
                    註冊
                </h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        registerHandler();
                    }}
                >
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-[#262220] mb-1"
                            htmlFor="userName"
                        >
                            帳號
                        </label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(sanitizeInput(e.target.value))}
                            id="userName"
                            maxLength={100} 
                            className={`w-full px-4 py-2 border ${
                                userName ? (userNameValid ? "border-green-500" : "border-red-500") : "border-[#C3A6A0]"
                            } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A15C38]`}
                            placeholder="輸入您的帳號 (英文、數字)"
                            required
                        />
                        {userName && renderValidation(userNameValid, userNameValid ? "帳號有效（僅含英文和數字）" : "帳號無效（僅含英文和數字）")}
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-[#262220] mb-1"
                            htmlFor="password"
                        >
                            密碼
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(sanitizeInput(e.target.value))}
                            id="password"
                            maxLength={100} 
                            className={`w-full px-4 py-2 border ${
                                password ? (passwordValidState ? "border-green-500" : "border-red-500") : "border-[#C3A6A0]"
                            } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A15C38]`}
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
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-[#262220] mb-1"
                            htmlFor="repassword"
                        >
                            再次輸入密碼
                        </label>
                        <input
                            type="password"
                            value={passwordAgain}
                            onChange={(e) => setPasswordAgain(sanitizeInput(e.target.value))}
                            id="repassword"
                            maxLength={100} 
                            className={`w-full px-4 py-2 border ${
                                passwordAgain ? (isPasswordMatch ? "border-green-500" : "border-red-500") : "border-[#C3A6A0]"
                            } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A15C38]`}
                            placeholder="再次輸入您的密碼"
                            required
                        />
                        {passwordAgain && renderValidation(isPasswordMatch, isPasswordMatch ? "密碼一致" : "密碼不一致")}
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-[#262220] mb-1"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            maxLength={100} 
                            onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                            id="email"
                            className={`w-full px-4 py-2 border ${
                                email ? (emailValid ? "border-green-500" : "border-red-500") : "border-[#C3A6A0]"
                            } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A15C38]`}
                            placeholder="example@domain.com"
                            required
                        />
                        {email && renderValidation(emailValid, emailValid ? "Email 格式有效" : "Email 格式無效")}
                    </div>
                    <button
                        type="submit"
                        className={`w-full bg-[#A15C38] hover:bg-[#262220] text-white font-medium py-2 text-sm rounded-lg transition-colors ${
                            !userNameValid || !passwordValidState || !emailValid || !isPasswordMatch
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                        disabled={!userNameValid || !passwordValidState || !emailValid || !isPasswordMatch}
                    >
                        送出
                    </button>
                </form>
                
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => navigate("../../auth/login")}
                        className="text-sm text-[#A15C38] hover:text-[#262220] font-medium transition-colors"
                    >
                        回登入畫面
                    </button>
                </div>
            </div>
            
            {showVerification && tempUserData && (
                <VerificationCodeModal
                    onClose={() => setShowVerification(false)}
                    onSubmit={handleVerificationSubmit}
                />
            )}
        </div>
    );

};

export default Register;
