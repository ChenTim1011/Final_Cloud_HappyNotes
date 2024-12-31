// src/pages/Login.tsx - Log in

import React, {useRef} from "react";
import { useNavigate } from "react-router-dom";
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { updateUser, getUserByName} from '@/services/userService';
import { authenticateUser } from "@/services/loginService";
import { toast } from 'react-toastify';

const Login: React.FC = () => {

  const userNameRef = useRef<HTMLInputElement | null>(null);
  const userPasswordRef = useRef<HTMLInputElement | null>(null);

  // Use the useNavigate hook to handle page navigation
  const navigate = useNavigate();

  const login = async () =>{
      try {

          // Validation function: allows only Chinese characters, English letters, and numbers
          const validateInput = (input: string | null, fieldName: string) => {
              if (fieldName === "帳號") {
                  // Check if input is null or contains invalid characters
                  if (input === null || !/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(input)) {
                      throw new Error(`帳號或密碼錯誤，請重新輸入`);
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
              }
          };

          // Get input values from refs
          const userName = userNameRef.current?.value || null;
          const userPassword = userPasswordRef.current?.value || null;

          // Validate each input
          validateInput(userName, "帳號");
          validateInput(userPassword, "密碼");

          const users = await getUserByName(userName);

          const updateduser: UserUpdateData = {
              isLoggedin: true,
          };

          try {
            const [auth, accessToken, refreshToken] = await authenticateUser(userName, userPassword);
            await updateUser(users[0]._id,updateduser);
            
            // store tokens
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            toast.success('登入成功！');
            navigate(`../../map/${auth.userName}`);
          } catch (error) {

            console.log(error);
            toast.error(
                <div>
                    帳號或密碼錯誤，請重新輸入
                </div>,
            );
          }

      } catch(error) {
          // Catch errors and output the error message
          if (error instanceof Error) {
              console.error("帳號或密碼錯誤，請重新輸入", error.message);
              toast.error(
                  <div>
                      帳號或密碼錯誤，請重新輸入
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

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <button
        onClick={()=>{navigate('../..');}}
        className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded shadow-lg hover:bg-gray-800 transition"
      >
        回首頁
      </button>
      <div className="w-96 p-6 bg-white shadow-md rounded-md">
        <div className="flex justify-start space-x-4 mb-6">
          {/* Forget Password Button */}
          <button 
            className="text-white bg-red-500 hover:bg-red-600 font-medium py-2 px-4 rounded"
            onClick={() => {navigate('../../auth/reset-password')}}
          >
            忘記密碼?
          </button>

          {/* Register Button */}
          <button 
            className="text-white bg-green-500 hover:bg-green-600 font-medium py-2 px-4 rounded"
            onClick={() => {navigate('../../auth/register')}}
          >
            註冊
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={(e) => { e.preventDefault(); login(); }}>
          <h2 className="text-xl font-semibold text-center mb-4">登入</h2>
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
              密碼
            </label>
            <input
              type="password"
              ref={userPasswordRef}
              id="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="輸入您的密碼"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            登入
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
