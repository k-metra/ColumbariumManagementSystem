import Icon from '../icon';

export default function AccountModal({ username, role, isOpen }) {
    const handleLogout = async () => {

        await fetch('http://72.61.149.6/api/logout-api/', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Session ${sessionStorage.getItem("session_token")}`
            }
        }).then(() => {
            sessionStorage.clear();
            window.location.href = '/login';
        })
    }
    return (
        <>
            <div className={`transition-all duration-200 ease-out p-6 m-2 border rounded-md w-[190px] min-h-12 top-[66px] ${isOpen ? 'z-[999] opacity-100 scale-100' : '-z-10 opacity-0 scale-95'} right-10 absolute shadow-md bg-white flex flex-col gap-1 justify-start items-left`}>
                
                <div className="text-lg font-semibold mb-0 text-zinc-700 flex flex-row justify-between">
                    <Icon icon="fa-regular fa-user" className="inline-block mr-2 text-zinc-700 text-[48px]" />
                    <div className="flex flex-col">
                        <span className="text-md font-bold max-w-[120px] truncate text-zinc-700">{username}</span>
                        <span className="text-sm text-zinc-600 font-normal whitespace-normal break-words max-w-[120px] mr-4 text-right">{role}</span>
                    </div>
                </div>
                <div className="text-right self-end block mt-0">
                    <button onClick={handleLogout} className={`text-zinc-700 ${!isOpen && 'pointer-events-none'} hover:font-semibold mt-2 py-0 transition-all duration-100 ease-out`}>Logout</button>
                </div>
            </div>
        </>
    )
}