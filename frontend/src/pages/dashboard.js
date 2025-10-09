import Icon from "../components/icon";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import StatusTag from '../components/dashboard/statusTag';
import TabContent from '../components/dashboard/tabContent';

import LoadingPage from './loading';
import CreateNewElement from "../components/dashboard/createNewElement";
import EditElement from "../components/dashboard/editElement";
import AccountModal from "../components/dashboard/accountModal";

function getCsrf() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            return cookie.substring('csrftoken='.length, cookie.length);
        }
    }
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const { username, setUsername } = useAuth();
    const [selectedTab, setSelectedTab] = useState("Payments");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedElements, setSelectedElements] = useState([]);
    const [elementToEdit, setElementToEdit] = useState(null);
    const [elements, setElements] = useState([])

    const [openAccountModal, setOpenAccountModal] = useState(false);
    const accountModalRef = useRef(null);
    const [filter, setFilter] = useState("");
    
    async function fetchItems(endpoint) {
        setElements([]);
        console.log(endpoint, " fetching items.");
        try {
            await fetch (`http://localhost:8000/api/${endpoint.toLowerCase()}/list-all/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`
                },
                credentials: 'include',
            }).then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch items");
                } else {
                    return response.json();
                }
            }).then(data => {
                // normalize server response keys to camelCase for consistent UI usage
                const normalizeKey = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

                const normalizeObject = (obj) => {
                    if (obj === null || obj === undefined) return obj;
                    if (Array.isArray(obj)) return obj.map(normalizeObject);
                    if (typeof obj !== 'object') return obj;
                    const res = {};
                    Object.keys(obj).forEach(k => {
                        const newKey = normalizeKey(k);
                        const val = obj[k];
                        res[newKey] = normalizeObject(val);
                    });
                    return res;
                }

                const normalized = Array.isArray(data) ? data.map(normalizeObject) : data;
                setElements(normalized);
                console.log("Fetched items (normalized): ", normalized);
            })
        } catch (Exception) {
            console.log("Error fetching items: ", Exception);
        }
    }

    // convert camelCase keys used in the UI back to snake_case for the API
    const camelToSnake = (s) => s.replace(/([A-Z])/g, (m) => '_' + m.toLowerCase());

    const convertKeysToSnake = (obj) => {
        if (obj === null || obj === undefined) return obj;
        if (Array.isArray(obj)) return obj.map(convertKeysToSnake);
        if (obj instanceof Date) return obj.toISOString();
        if (typeof obj !== 'object') return obj;

        const res = {};
        Object.keys(obj).forEach((k) => {
            const newKey = camelToSnake(k);
            res[newKey] = convertKeysToSnake(obj[k]);
        });
        return res;
    }

    const handleEditClick = () => {
         if (selectedElements.length === 1) {
            setElementToEdit(elements.find(e => e.id === selectedElements[0]))
            setShowEditModal(true);
            }
        }
    

    async function handleRemoveSelected(e) {
        e.preventDefault();

        if (selectedElements.length === 0) return;

        const endpoint = selectedTab.toLowerCase();

        const confirmation = window.confirm(`Are you sure you want to delete ${selectedElements.length} items? This action cannot be undone.`);

        if (confirmation) {
            try {
                await fetch(`http://localhost:8000/api/${endpoint}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Session-Token': sessionStorage.getItem('token'),
                        'Authorization': `Session ${sessionStorage.getItem('token')}`,
                        'X-CSRFToken': getCsrf(),
                    },
                    body: JSON.stringify({ element_ids: selectedElements }),
                    credentials: 'include',
                })
            } catch (Exception) {
                console.log("Error deleting items: ", Exception);
            } finally {
                setSelectedElements([]);

                await fetchItems(selectedTab);
            }
        }
    }

    const handleEdit = async(data) => {
        // close on both edit and cancel
        setShowEditModal(false);
        if (data === null) return;

        const endpoint = selectedTab.toLowerCase();

        try {
            // convert field names to snake_case before sending to API
            const payload = convertKeysToSnake(data);

            await fetch(`http://localhost:8000/api/${endpoint}/edit/?${endpoint.slice(0, -1)}_id=${elementToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'X-CSRFToken': getCsrf(),
                },
                body: JSON.stringify(payload),
                credentials: 'include',
            }).then(response => {
                if (!response.ok) {
                    console.log("Failed to edit item")
                }

                return response.json();
            }).then(data => {
                console.log(data);
            })
        } catch (Exception) {

        } finally {
            setSelectedElements([]);
            setElementToEdit(null);
            fetchItems(selectedTab);
        }
    }

    const handleCreate = async (data) => {
        // close on both create and cancel
        setOpenCreateModal(false);

        // cancel action (CreateNewElement calls onCreate(null) on cancel)
        if (data === null) return;

        // naive local-create: assign a new id and append to elements.
        // In a real app you'd POST to the API and refresh from server.
       /* const maxId = elements.reduce((m, it) => Math.max(m, it.id || 0), 0);
        const newItem = { id: maxId + 1, ...data };
        setElements((prev) => [newItem, ...prev]);
        setSelectedElements([]); */

        const endpoint = selectedTab.toLowerCase();
        try {
            // convert field names to snake_case before sending to API
            const payload = convertKeysToSnake(data);

            await fetch("http://localhost:8000/api/" + endpoint + "/create-new/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'X-CSRFToken': getCsrf(),
                },
                body: JSON.stringify(payload),
                credentials: 'include',
            }).then(response => {
                if (!response.ok) {
                    throw new Error("Failed to create item");
                }

                return response.json();
            }).then(data => {
                console.log(data);
            })

            await fetchItems(selectedTab);
        } catch (error) {
            console.error("Error creating item: ", error);
        }
        
    }

    useEffect(() => {
        setFilter("");
       const storedUsername = username || sessionStorage.getItem('username');
       if (storedUsername) {
           setUsername(storedUsername);
       }

       fetchItems(selectedTab);

       const loader = setTimeout(() => {
           setLoading(false);
       }, 800);

       return () => {
           clearTimeout(loader);
                
       }
    }, [username, selectedTab, setUsername])

    // for account modal
    useEffect(() => {
        
        function handleClickOutside(e) {
           if (accountModalRef.current &&
               !accountModalRef.current.contains(e.target)
           ) {
               setOpenAccountModal(false);
           }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    })

    const handleTabSelect = (tab) => {
        setElements([])
        setSelectedElements([]);
        setSelectedTab(tab);
        setSearchQuery("");

        // fetch new items for the selected tab
        console.log("Switching to tab:", tab)
        fetchItems(tab);
    }

    // fields config for CreateNewElement to avoid duplicating form markup
    const fieldsByTab = {
        Payments: [
            { name: 'payer', label: 'Payer Name', type: 'text', placeholder: 'Payer Name' },
            { name: 'amountDue', label: 'Amount Due', type: 'number', placeholder: 'Amount Due' },
            { name: 'amountPaid', label: 'Amount Paid', type: 'number', placeholder: 'Amount Paid' },
            { name: 'maintenanceFee', label: 'Maintenance Fee', type: 'number', placeholder: 'Maintenance Fee' },
            { name: 'paymentDate', label: 'Date Paid', type: 'date' },
        ],
        Contacts: [
            { name: 'familyName', label: "Family Name", type: 'text' },
            { name: 'deceasedName', label: "Deceased's Name", type: 'text' },
            { name: 'deceasedDate', label: "Deceased Date", type: 'date' },
            { name: 'address', label: "Address", type: 'textarea' },
            { name: 'contactNumber', label: 'Contact Number', type: 'text' },
        ],
        Occupants: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'intermentDate', label: 'Date of Interment', type: 'date' },
            { name: 'niche', label: 'Niche', type: 'text' },
        ],
        Niches: [
            { name: 'name', label: "Deceased's Name", type: 'text' },
            { name: 'location', label: 'Location', type: 'text' },
            { name: 'status', label: 'Status', type: 'select', options: [
                { value: '', label: 'Select Status' },
                { value: 'Available', label: 'Available' },
                { value: 'Occupied', label: 'Occupied' },
            ] },
        ],
    };

    const handleSelectRow = (id) => {
        console.log(id);
        setSelectedElements((prev) => 
            prev.includes(id) ? prev.filter((ppid) => ppid !== id) : [...prev, id]
        )
    }
    
    const handleSelectAll = (checked) => {
        if (checked) setSelectedElements(elements.map((p) => p.id));
        else setSelectedElements([]);
    }

    if (loading) return <LoadingPage />;    

    return (
        <div className="min-h-screen screen overflow-auto items-center flex flex-col bg-[#fbfbfb]">
            <title>Dashboard</title>
            <div className="min-w-[90%] min-h-[80%] max-w-[100%] max-h-[100%]">
                <div className="header bg-white w-full self-center flex flex-row justify-between mt-3 rounded-lg p-4 drop-shadow-md">
                    <div className="flex flex-row items-center">
                        <button onClick={(e) => {setSidebarOpen(!sidebarOpen)}} className="p-2 text-[22px] rounded-full hover:bg-black/10 text-zinc-700 mr-4"><Icon icon="fa-solid fa-bars"></Icon></button>
                        <h1 className="text-3xl font-bold text-zinc-700">Columbarium Dashboard</h1>
                    </div>
                    <div id="accountControl" className="flex flex-row items-center">
                        <button onClick={() => setOpenAccountModal(!openAccountModal)} className="p-2 hover:underline text-md text-zinc-700 mr-4"><Icon icon="fa-solid fa-user" className="mr-3"></Icon>{username !== "" ? username : "User Not Found"}</button>
                    </div>
                </div>

                <div className="w-[100%] h-[85%] flex flex-row gap-3">
                    {/* Sidebar */}
                    { sidebarOpen &&
                    <div className="sidebar bg-white w-[18%] h-full self-start flex flex-col mt-3 rounded-lg p-4 drop-shadow-md gap-1">

                        {/* Tabs */}
                        <button onClick={() => handleTabSelect("Payments")} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-credit-card" className="mr-3"></Icon>Payments</button>

                        <button onClick={() => handleTabSelect("Contacts")} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-address-book" className="mr-3"></Icon>Contacts</button>

                        <button onClick={ () => handleTabSelect("Occupants")} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-box-open" className="mr-3"></Icon>Occupants</button>

                        <button onClick={() => handleTabSelect("Niches")} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-square-person-confined" className="mr-3"></Icon>Niches</button>
                        
                        {/* Audit Logs*/}
                        {sessionStorage.getItem("permissions").split(",").includes("view_audit") && <button onClick={() => handleTabSelect("Audit")} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-users" className="mr-3"></Icon>Audit Logs</button>}

                        <button onClick={() => handleTabSelect("Report")} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700"><Icon icon="fa-solid fa-comments" className="mr-3"></Icon>Report</button>
                    </div>}

                    
                    {/* Main Content */}
                    <div className="content transition-all duration-300 ease-out bg-white w-full h-full flex flex-col mt-3 rounded-lg p-4 drop-shadow-md overflow-auto">

                        {/* Dynamic Tab Content rendered from a small config to keep things DRY */}
                        {(() => {
                            const tabs = {
                                Payments: {
                                    columns: [
                                        { label: "", key: "_select" },
                                        { label: "Payment ID", key: "id", type: 'number' },
                                        { label: "Payer Name", key: "payer", type: 'text' },
                                        { label: "Amount Paid", key: "amountPaid", type: 'number' },
                                        { label: "Amount Due", key: "amountDue", type: 'number' },
                                        { label: "Remaining Balance", key: "remainingBalance", type: 'number' },
                                        { label: "Maintenance Fee", key: "maintenanceFee", type: 'number' },
                                        { label: "Date Paid", key: "paymentDate", type: 'date' },
                                        { label: "Status", key: "status", type: 'text' }
                                    ],
                                    toolbarButtons: [
                                        { label: 'Add Payment', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => setOpenCreateModal(true) },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: (e) => { handleEditClick(e) } },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: (e) => { handleRemoveSelected(e) } },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                        <td className="p-2">#{(row.id ?? '').toString().padStart(3, "0")}</td>
                        <td className="p-2">{row.payer ?? row.payerName ?? ''}</td>
                        <td className="p-2">₱ {Number(row.amountPaid ?? row.amountPaid ?? row.amount_paid ?? 0).toLocaleString("en-US", {minimumFractionDigits: 2 })}</td>
                        <td className="p-2">₱ {Number(row.amountDue ?? row.amount_due ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="p-2">₱ {Number(row.remainingBalance ?? row.remaining_balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="p-2">₱ {Number(row.maintenanceFee ?? row.maintenance_fee ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="p-2">{row.paymentDate ? new Intl.DateTimeFormat('en-US').format(new Date(row.paymentDate)) : ''}</td>
                        <td className="p-2"><StatusTag status={row.status ?? row.state ?? ''} />
                                    </td>
                                        </>
                                    )
                                },
                                Contacts: {
                                    columns: [
                                        { label: "", key: "_select" },
                                        { label: "Contact ID", key: "id", type: 'number' },
                                        { label: "Family Name", key: "familyName", type: 'text' },
                                        { label: "Deceased's Name", key: "deceasedName", type: 'text' },
                                        { label: "Deceased Date", key: "deceasedDate", type: 'date' },
                                        { label: "Address", key: "address", type: 'text' },
                                        { label: "Contact Number", key: "contactNumber", type: 'text' }
                                    ],
                                    toolbarButtons: [
                                        { label: 'Add Contact', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => setOpenCreateModal(true) },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: (e) => { handleEditClick(e) } },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', textClass:'text-white', bg: 'bg-red-500 text-white', onClick: handleRemoveSelected },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">#{(row.id ?? '').toString().padStart(3, "0")}</td>
                                            <td className="p-2">{row.familyName ?? ''}</td>
                                            <td className="p-2">{row.deceasedName ?? ''}</td>
                                            <td className="p-2">{row.deceasedDate ? new Intl.DateTimeFormat('en-US').format(new Date(row.deceasedDate)) : ''}</td>
                                            <td className="p-2">{row.address ?? ''}</td>
                                            <td className="p-2">{row.contactNumber ?? ''}</td>
                                            <td className="p-2"><StatusTag status={row.status ?? ''} />
                                    </td>
                                        </>
                                    )
                                },
                                Occupants: {
                                    columns: [
                                        { label: "", key: "_select" },
                                        { label: "Occupant ID", key: "id", type: 'number' },
                                        { label: "Name", key: "name", type: 'text' },
                                        { label: "Date of Interment", key: "intermentDate", type: 'date' },
                                        { label: "Niche", key: "niche", type: 'text' }
                                    ],
                                    toolbarButtons: [
                                        { label: 'Add Occupant', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => setOpenCreateModal(true) },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: (e) => { handleEditClick(e) } },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: handleRemoveSelected },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">#{(row.id ?? '').toString().padStart(3, "0")}</td>
                                            <td className="p-2">{row.name ?? ''}</td>
                                            <td className="p-2">{row.intermentDate ? new Intl.DateTimeFormat('en-US').format(new Date(row.intermentDate)) : ''}</td>
                                            <td className="p-2">{row.niche ?? ''}</td>
                                        </>
                                    )   
                                },
                                Niches: {
                                    columns: [
                                        { label: "", key: "_select" },
                                        { label: "Niche ID", key: "id", type: 'number' },
                                        { label: "Deceased's Name", key: "name", type: 'text' },
                                        { label: "Location", key: "location", type: 'text' },
                                        { label: "Status", key: "status", type: 'text' }
                                    ],
                                    toolbarButtons: [
                                        { label: 'Add Niche', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => setOpenCreateModal(true) },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: () => {} },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: () => {} },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">#{(row.id ?? '').toString().padStart(3, "0")}</td>
                                            <td className="p-2">{row.name ?? row.deceased_name ?? ''}</td>
                                            <td className="p-2">{row.location ?? ''}</td>
                                            <td className="p-2"><StatusTag status={row.status ?? ''} /></td>
                                        </>
                                    )
                                },
                                Audit: {
                                    columns: [
                                        { label: "User", key: "user", type: 'text' },
                                        { label: "Role", key: "role", type: 'text' },
                                        { label: "IP Address", key: "ipAddress", type: 'text' },
                                        { label: "Object ID", key: "objectId", type: 'text' },
                                        { label: "Action", key: "action", type: 'text' },
                                        { label: "Application", key: "app", type: 'text' },
                                        { label: "URL", key: "path", type: 'text' },
                                        { label: "Timestamp", key: "timestamp", type: 'date' },
                                    ],
                                    toolbarButtons: [],
                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">{row.user ?? ''}</td>
                                            <td className="p-2">{row.role ?? ''}</td>
                                            <td className="p-2">{row.ipAddress ?? ''}</td>
                                            <td className="p-2">{row.responseData?.id ?? ''}</td>
                                            <td className="p-2">{row.action ?? ''}</td>
                                            <td className="p-2">{row.app ?? ''}</td>
                                            <td className="p-2">{row.path ?? ''}</td>
                                            <td className="p-2">{row.timestamp ? new Intl.DateTimeFormat('en-US', {year:'numeric', month:'numeric',day:'numeric', hour:'numeric', minute:'numeric', second:'numeric'}).format(new Date(row.timestamp)) : ''}</td>
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
                                    data={elements.length > 0 ? elements : []}
                                    selectedItems={selectedElements}
                                    onSelectAll={handleSelectAll}
                                    onSelectRow={handleSelectRow}
                                    getRowKey={(row) => row.id}
                                    onFilterChange={(value) => setFilter(value)}
                                >
                                    {cfg.rowRenderer}
                                </TabContent>
                            )
                        })()}
                    </div>
                </div>
            </div>

            { openCreateModal && <CreateNewElement tab={selectedTab} onCreate={handleCreate} fields={fieldsByTab[selectedTab]} /> }
            { /* EditElement modal can be added here similarly when needed */ }
            { showEditModal && <EditElement tab={selectedTab} elementData={elementToEdit} fields={fieldsByTab[selectedTab]} onEdit={handleEdit} />}

            <div ref={accountModalRef}>
                <AccountModal isOpen={openAccountModal} username={username} role={sessionStorage.getItem("role") || 'Staff'} />
            </div>
        </div>
    )
}