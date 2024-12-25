// src/pages/Login/ResetPassword.tsx - ResetPassword

import React, {useRef} from "react";
import { updateUser, getUserByName} from '@/services/userService';
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const ResetPassword: React.FC = () =>{

    const userNameRef = useRef<HTMLInputElement | null>(null);
    const userPasswordRef = useRef<HTMLInputElement | null>(null);
    const userPasswordAgainRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    
    // Use the useNavigate hook to handle page navigation
    const navigate = useNavigate();

    const resetpassword = async () => {
        
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
                }
                console.log(input);
            };

            // Get input values from refs
            const userName = userNameRef.current?.value || null;
            const userPassword = userPasswordRef.current?.value || null;
            const userPasswordAgain = userPasswordAgainRef.current?.value || null;

            // Avoid Not-existed userName
            const users = await getUserByName(userName);
            if(users.length === 0){
                toast.error(`此用戶不存在`);
                throw new Error(`此用戶不存在`);
            }

            const email = emailRef.current?.value || users[0].email;

            // Validate each input
            validateInput(userName, "帳號");
            validateInput(userPassword, "密碼");
            validateInput(userPasswordAgain, "密碼");
            validateInput(email, "email");

            //Avoid incosistent password
            if(userPassword !== userPasswordAgain){
                toast.error(`請確保兩次輸入的密碼相同。`);
                throw new Error(`請確保兩次輸入的密碼相同。`);
            }

            // If all validation passes, update user information
            const updateduser: UserUpdateData = {
                userName: userName,
                userPassword: userPassword,
                email: email,
                isLoggedin: false,
                whiteboards: users[0].whiteboards,
            };

            try {
                await updateUser(users[0]._id,updateduser);
                toast.success('更新成功！');
                navigate('../../auth/login');
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(`更新失敗: ${error.message}`);
                } else {
                    toast.error('更新失敗: 未知錯誤');
                }
            }

        } catch(error) {
            // Catch errors and output the error message
            if (error instanceof Error) {
                console.error("更新失敗", error.message);
                toast.error(
                    <div>
                        更新失敗。
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
    
    return(
    <div className="flex items-center justify-center h-screen bg-gray-100">
        <button
            onClick={()=>{navigate('../../auth/login');}}
            className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 transition"
        >
            回登入畫面
        </button>
        <div className="w-96 p-6 bg-white shadow-md rounded-md">
            {/* ResetPassword Form */}
            <form onSubmit={(e) => { e.preventDefault(); resetpassword(); }}>
                <h2 className="text-xl font-semibold text-center mb-4">重新設定</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        帳號
                    </label>
                    <input
                        ref={userNameRef}
                        id="userName"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="輸入您的帳號"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        新密碼
                    </label>
                    <input
                        type="password"
                        ref={userPasswordRef}
                        id="password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="輸入您的新密碼"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        再次輸入新密碼
                    </label>
                    <input
                        type="password"
                        ref={userPasswordAgainRef}
                        id="repassword"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="再次輸入您的新密碼"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        email(可空白)
                    </label>
                    <input
                        type="email"
                        ref={emailRef}
                        id="email"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="輸入您的email"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded"
                >
                    送出
                </button>
            </form>        
        </div>
    </div>
    );
}

export default ResetPassword