export default function LoginForm() {
    return (
        <div className="p-6 m-2 border rounded-md min-w-12 min-h-12 shadow-md bg-white">
            <div className="text-2xl font-bold mb-4 text-center">Admin Login</div>
            <form className="flex flex-col gap-4">
                <div id="field">
                    <label className="block mb-1 text-sm text-zinc-600 " htmlFor="username">Username</label>
                    <input className="w-full p-2 border rounded-md " type="text" id="username" name="username" placeholder="Enter your username" required />
                </div>
                <div id="field">
                    <label className="block mb-1 text-sm text-zinc-600 " htmlFor="password">Password</label>
                    <input className="w-full p-2 border rounded-md " type="password" id="password" name="password" placeholder="Enter your password" required />
                </div>
                <button className="w-full p-2 bg-blue-500 text-white rounded-md  hover:bg-blue-600" type="submit">Login</button>
            </form>
        </div>
    )
}