import Icon from "../components/icon";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import StatusTag from '../components/dashboard/statusTag';
import Table from '../components/dashboard/table';
import TabContent from '../components/dashboard/tabContent';

export default function DashboardPage() {
    const { authenticated, username, setUsername } = useAuth();
    const [selectedTab, setSelectedTab] = useState("Payments");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedElements, setSelectedElements] = useState([]);
    const [elements, setElements] = useState([])
    
    useEffect(() => {
        /*setElements([
            { id: 1, payer: "John Doe", amountPaid: 5000, balance: 5000, datePaid: "2024-06-01", status: "Completed" },
        ])*/
       console.log("Startup");
       
    }, [])

    const handleTabSelect = (e) => {
        setSelectedTab(e.target.innerText);
        console.log(e.target.innerText);

        setSelectedElements([]);
        setElements([]); // Clear current items when switching tabs
        setSearchQuery("");
    }

    const handleSelectRow = (id) => {
        setSelectedElements((prev) => 
            prev.includes(id) ? prev.filter((ppid) => ppid !== id) : [...prev, id]
        )
    }
    
    const handleSelectAll = (checked) => {
        if (checked) setSelectedElements(elements.map((p) => p.id));
        else setSelectedElements([]);
    }

    return (
        <div className="h-screen w-screen items-center flex flex-col bg-[#fbfbfb]">
            <title>Dashboard</title>
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
                        <button onClick={handleTabSelect} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-credit-card" className="mr-3"></Icon>Payments</button>

                        <button onClick={handleTabSelect} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-address-book" className="mr-3"></Icon>Contacts</button>

                        <button onClick={handleTabSelect} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-box-open" className="mr-3"></Icon>Occupants</button>

                        <button onClick={handleTabSelect} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-square-person-confined" className="mr-3"></Icon>Niches</button>

                        <button onClick={handleTabSelect} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-comments" className="mr-3"></Icon>Report</button>
                    </div>}

                    
                    {/* Main Content */}
                    <div className="content transition-all duration-300 ease-out bg-white w-full h-full flex flex-col mt-3 rounded-lg p-4 drop-shadow-md">

                        {/* Dynamic Tab Content rendered from a small config to keep things DRY */}
                        {(() => {
                            const tabs = {
                                Payments: {
                                    columns: ["", "Payment ID", "Payer Name", "Amount Paid", "Balance", "Date Paid", "Status"],
                                    toolbarButtons: [
                                        { label: 'Add Payment', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => {} },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: () => {} },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: () => {} },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">#{row.id.toString().padStart(3, "0")}</td>
                                            <td className="p-2">{row.payer}</td>
                                            <td className="p-2">₱ {row.amountPaid.toLocaleString("en-US", {minimumFractionDigits: 2 })}</td>
                                            <td className="p-2">₱ {row.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2">{row.datePaid}</td>
                                            <td className="p-2"><StatusTag status={row.status} />
                                    </td>
                                        </>
                                    )
                                },
                                Contacts: {
                                    columns: ["", "Contact ID", "Family Name", "Deceased's Name", "Deceased Date", "Contact Number"],
                                    toolbarButtons: [
                                        { label: 'Add Contact', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => {} },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: () => {} },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', textClass:'text-white', bg: 'bg-red-500 text-white', onClick: () => {} },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">#{row.id.toString().padStart(3, "0")}</td>
                                            <td className="p-2">{row.payer}</td>
                                            <td className="p-2">₱ {row.amountPaid.toLocaleString("en-US", {minimumFractionDigits: 2 })}</td>
                                            <td className="p-2">₱ {row.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                                            <td className="p-2">{row.datePaid}</td>
                                            <td className="p-2"><StatusTag status={row.status} />
                                    </td>
                                        </>
                                    )
                                },
                                Occupants: {
                                    columns: ["", "Occupant ID", "Name", "Date of Interment"],
                                    toolbarButtons: [
                                        { label: 'Add Occupant', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => {} },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: () => {} },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: () => {} },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">#{row.id.toString().padStart(3, "0")}</td>
                                            <td className="p-2">{row.name}</td>
                                            <td className="p-2">{row.dateOfInterment}</td>
                                        </>
                                    )   
                                },
                                Niches: {
                                    columns: ["", "Niche ID", "Deceased's Name", "Location", "Status"],
                                    toolbarButtons: [
                                        { label: 'Add Niche', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => {} },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: () => {} },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: () => {} },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">#{row.id.toString().padStart(3, "0")}</td>
                                            <td className="p-2">{row.name}</td>
                                            <td className="p-2">{row.dateOfInterment}</td>
                                        </>
                                    )
                                }
                                // Add other tabs here
                            }

                            const cfg = tabs[selectedTab];
                            if (!cfg) return null;

                            return (
                                <TabContent
                                    title={selectedTab}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    toolbarButtons={cfg.toolbarButtons}
                                    columns={cfg.columns}
                                    data={elements}
                                    selectedItems={selectedElements}
                                    onSelectAll={handleSelectAll}
                                    onSelectRow={handleSelectRow}
                                    getRowKey={(row) => row.id}
                                >
                                    {cfg.rowRenderer}
                                </TabContent>
                            )
                        })()}
                    </div>
                </div>
            </div>
        </div>
    )
}