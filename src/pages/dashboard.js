import Icon from "../components/icon";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import StatusTag from '../components/dashboard/statusTag';

export default function DashboardPage() {
    const { authenticated, username, setUsername } = useAuth();
    const [selectedTab, setSelectedTab] = useState("Payments");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedPayments, setSelectedPayments] = useState([]);
    
    return (
        <div className="h-screen w-screen items-center flex flex-col bg-[#fbfbfb]">
            <div className="w-[90%] h-[80%]">
                <div className="header bg-white w-full self-center flex flex-row justify-between mt-3 rounded-lg p-4 drop-shadow-md">
                    <div className="flex flex-row items-center">
                        <button onClick={(e) => {setSidebarOpen(!sidebarOpen)}} className="p-2 text-[22px] rounded-full hover:bg-black/10 text-zinc-700 mr-4"><Icon icon="fa-solid fa-bars"></Icon></button>
                        <h1 className="text-3xl font-bold text-zinc-700">Columbarium Dashboard</h1>
                    </div>
                    <div id="accountControl" className="flex flex-row items-center">
                        <button className="p-2 hover:underline text-md text-zinc-700 mr-4"><Icon icon="fa-solid fa-user" className="mr-3"></Icon>{username !== "" ? username : "User Not Found"}</button>
                    </div>
                </div>

                <div className="w-[100%] h-[85%] flex flex-row gap-3">
                    {/* Sidebar */}
                    { sidebarOpen &&
                    <div className="sidebar bg-white w-[18%] h-full self-start flex flex-col mt-3 rounded-lg p-4 drop-shadow-md gap-1">

                        {/* Tabs */}
                        <button onClick={(e) => setSelectedTab(e.target.innerText)} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-credit-card" className="mr-3"></Icon>Payments</button>

                        <button onClick={(e) => setSelectedTab(e.target.innerText)} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-address-book" className="mr-3"></Icon>Contacts</button>

                        <button onClick={(e) => setSelectedTab(e.target.innerText)} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-box-open" className="mr-3"></Icon>Occupants</button>

                        <button onClick={(e) => setSelectedTab(e.target.innerText)} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-square-person-confined" className="mr-3"></Icon>Niches</button>

                        <button onClick={(e) => setSelectedTab(e.target.innerText)} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-comments" className="mr-3"></Icon>Report</button>
                    </div>}

                    
                    {/* Main Content */}
                    <div className="content transition-all duration-300 ease-out bg-white w-full h-full flex flex-col mt-3 rounded-lg p-4 drop-shadow-md">

                        {/* Payments Tab */}
                        {selectedTab === "Payments" && 
                        <div className="w-full h-full flex flex-col">
                            <h2 className="text-2xl ml-2 font-bold text-zinc-700">{selectedTab}</h2>
                            <input onChange={(e) => setSearchQuery(e.target.value)} id="search" className="bg-slate-50 border border-black/10 rounded-lg self-center h-12 w-[60%] text-zinc-700 outline-none px-3" placeholder="Search..."></input>
                            <div className="flex flex-row gap-2 self-center items-center justify-center border-b border-black/12 py-3 px-10 pt-4 mb-6">
                                <button className="rounded-lg bg-blue-500 text-white p-2 px-4 hover:bg-blue-600 transition-all duration-300 ease-out">
                                    <Icon icon="fa-solid fa-plus" className="mr-2"></Icon>
                                    Add Payment
                                </button>
                                <button className="rounded-lg bg-[#fbfbfb] border-black/8 border p-2 px-4 hover:bg-[#f2f2f2] text-zinc-700 transition-all duration-300 ease-out">
                                    <Icon icon="fa-solid fa-pencil" className="mr-2"></Icon>
                                    Edit Selected
                                </button>
                                <button className="rounded-lg bg-red-500 text-white p-2 px-4 hover:bg-red-600 transition-all duration-300 ease-out">
                                    <Icon icon="fa fa-trash" className="mr-2"></Icon>
                                    ({selectedPayments.length}) Remove Selected
                                </button>
                            </div>

                            <table>
                                <thead>
                                    <tr className="text-left border-b border-black/10 text-zinc-700">
                                        <th className="p-2 pl-4"><input type="checkbox" /></th>
                                        <th className="p-2">Payment ID</th>
                                        <th className="p-2">Contact Name</th>
                                        <th className="p-2">Amount Due</th>
                                        <th className="p-2">Amount Paid</th>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b even:bg-[#fafafa] even:hover:bg-black/10 border-black/10 hover:bg-black/5 text-zinc-700">
                                        <td className="p-2 py-4 pl-4"><input type="checkbox" /></td>
                                        <td className="p-2">#001</td>
                                        <td className="p-2">John Doe</td>
                                        <td className="p-2">₱ 5,000.00</td>
                                        <td className="p-2">₱ 5,000.00</td>
                                        <td className="p-2">2024-06-01</td>
                                        <td className="p-2"><StatusTag status="Completed" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}