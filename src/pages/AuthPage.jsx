import React from 'react'
import logo from "../assets/logo.png";
import VerticalProgressIndicator from '../components/VerticalProgressIndicator';

const AuthPage = () => {
    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 to-black">
            <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
                <div className="flex justify-center items-center mb-4">
                    <img src={logo} alt="logo" className="w-24" />
                </div>
                <h2 className="text-center text-3xl font-bold  text-primary">
                    Welcome to BLACKGATE
                </h2>

                <div className="">
<VerticalProgressIndicator />
                </div>
            </div>
        </div>
    )
}

export default AuthPage
