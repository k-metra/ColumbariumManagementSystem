import LoginForm from "../components/login/loginForm"

import landing_bg from "../assets//landing_bg.jpg"

export default function LoginPage() {
    return (
        <div className="w-screen h-screen overflow-hidden flex justify-center items-center bg-[#fbfbfb]">
            <img src={landing_bg} className="fixed h-full w-full object-cover z-10"/>
            <LoginForm />
        </div>
    )

}