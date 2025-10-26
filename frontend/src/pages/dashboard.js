import Icon from "../components/icon";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import StatusTag from '../components/dashboard/statusTag';
import TabContent from '../components/dashboard/tabContent';
import { FaEdit, FaTrash } from 'react-icons/fa';

import LoadingPage from './loading';
import CreateNewElement from "../components/dashboard/createNewElement";
import EditElement from "../components/dashboard/editElement";
import AccountModal from "../components/dashboard/accountModal";
import CustomerModal from "../components/dashboard/customerModal";
import PaymentDetailModal from "../components/dashboard/paymentDetailModal";
import Analytics from "../components/dashboard/analytics/Analytics";

import { fieldsByTab } from "../config/dashboard/fieldsByTab";

import Tab from '../components/dashboard/tab';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const { username, setUsername } = useAuth();
    const [selectedTab, setSelectedTab] = useState("Customers");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);

    const [tableLoading, setTableLoading] = useState(false);

    const [selectedElements, setSelectedElements] = useState([]);
    const [elementToEdit, setElementToEdit] = useState(null);
    const [elements, setElements] = useState([])

    const [openAccountModal, setOpenAccountModal] = useState(false);
    const accountModalRef = useRef(null);
    const [filter, setFilter] = useState("");
    const [customerOptions, setCustomerOptions] = useState([]);
    const [nicheOptions, setNicheOptions] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({});
    
    async function fetchItems(endpoint) {
        // Skip fetching for Analytics tab since it handles its own data
        if (endpoint === 'Analytics') {
            setTableLoading(false);
            return;
        }

        setTableLoading(true);
        setElements([]);
        console.log(endpoint, " fetching items.");
        try {
            await fetch (`https://mcj-parish.hopto.org/api/${endpoint.toLowerCase()}/list-all/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`
                },
                credentials: 'include',
            }).then(async response => {
                if (!response.ok) {
                    console.error(`Failed to fetch ${endpoint} items - Status:`, response.status, response.statusText);
                    try {
                        const errorData = await response.json();
                        console.error(`Error response body:`, errorData);
                    } catch (e) {
                        console.error('Could not parse error response as JSON');
                    }
                    throw new Error("Failed to fetch items");
                } else {
                    return response.json();
                }
            }).then(data => {
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

                setTableLoading(false);

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

    const handleCloseCustomerModal = () => {
        setShowCustomerModal(false);
    }

    const handleEditClick = () => {
         if (selectedElements.length === 1) {
            // ensure customer options are loaded when editing Payments
            const prepareAndShow = async () => {
                if (selectedTab === 'Payments') await fetchCustomerOptions();
                setElementToEdit(elements.find(e => e.id === selectedElements[0]));
                setShowEditModal(true);
            }
            prepareAndShow();
         }
        }
    

    async function handleRemoveSelected(e) {
        e.preventDefault();

        if (selectedElements.length === 0) return;

        const endpoint = selectedTab.toLowerCase();

        const confirmation = window.confirm(`Are you sure you want to delete ${selectedElements.length} items? This action cannot be undone.`);

        if (confirmation) {
            try {
                const response = await fetch(`https://mcj-parish.hopto.org/api/${endpoint}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Session-Token': sessionStorage.getItem('token'),
                        'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ element_ids: selectedElements }),
                    credentials: 'include',
                });

                if (!response.ok) {
                    console.error(`Failed to delete ${endpoint} items - Status:`, response.status, response.statusText);
                    try {
                        const errorData = await response.json();
                        console.error(`Delete error response:`, errorData);
                    } catch (e) {
                        console.error('Could not parse delete error response as JSON');
                    }
                }
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
            let headers = {
                'Session-Token': sessionStorage.getItem('token'),
                'Authorization': `Session ${sessionStorage.getItem('token')}`,
            };
            
            let body;
            
            if (data instanceof FormData) {
                // For file uploads, don't set Content-Type, let browser set it with boundary
                body = data;
                
                // Convert keys to snake_case for FormData
                const newFormData = new FormData();
                for (let [key, value] of data.entries()) {
                    const snakeKey = camelToSnake(key);
                    newFormData.append(snakeKey, value);
                }
                body = newFormData;
            } else {
                // Regular JSON request
                headers['Content-Type'] = 'application/json';
                const payload = convertKeysToSnake(data);
                body = JSON.stringify(payload);
            }

            console.log("Edit data type:", data instanceof FormData ? 'FormData' : 'JSON');

            const response = await fetch(`https://mcj-parish.hopto.org/api/${endpoint}/edit/?${endpoint.slice(0, -1)}_id=${elementToEdit.id}`, {
                method: 'PUT',
                headers,
                body,
                credentials: 'include',
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData);

                // Update local state instead of refetching
                setElements(prev => prev.map(element => 
                    element.id === elementToEdit.id 
                        ? { ...element, ...data } 
                        : element
                ));
            } else {
                console.error(`Failed to edit ${endpoint} item - Status:`, response.status, response.statusText);
                try {
                    const errorData = await response.json();
                    console.error(`Edit error response:`, errorData);
                } catch (e) {
                    console.error('Could not parse edit error response as JSON');
                }
                console.log("Failed to edit item");
                // On failure, still refetch to ensure data consistency
                await fetchItems(selectedTab);
            }
        } catch (Exception) {
            console.error("Error editing item:", Exception);
            // On error, refetch to ensure data consistency
            await fetchItems(selectedTab);
        } finally {
            setSelectedElements([]);
            setElementToEdit(null);
        }
    }

    const handleCreate = async (data) => {
        // close on both create and cancel
        setOpenCreateModal(false);

        // cancel action (CreateNewElement calls onCreate(null) on cancel)
        console.log('handleCreate received data:', data);
        if (data === null) return;
        const endpoint = selectedTab.toLowerCase();
        try {
            let headers = {
                'Session-Token': sessionStorage.getItem('token'),
                'Authorization': `Session ${sessionStorage.getItem('token')}`,
            };
            
            let body;
            
            if (data instanceof FormData) {
                // For file uploads, don't set Content-Type, let browser set it with boundary
                body = data;
                
                // Convert keys to snake_case for FormData
                const newFormData = new FormData();
                for (let [key, value] of data.entries()) {
                    const snakeKey = camelToSnake(key);
                    newFormData.append(snakeKey, value);
                }
                body = newFormData;
            } else {
                // Regular JSON request
                headers['Content-Type'] = 'application/json';
                const safeData = data || {};
                const payload = convertKeysToSnake(safeData);
                body = JSON.stringify(payload);
            }

            console.log('Creating', endpoint, 'data type:', data instanceof FormData ? 'FormData' : 'JSON');

            await fetch("https://mcj-parish.hopto.org/api/" + endpoint + "/create-new/", {
                method: 'POST',
                headers,
                body,
                credentials: 'include',
            }).then(async response => {
                if (!response.ok) {
                    console.error(`Failed to create ${endpoint} item - Status:`, response.status, response.statusText);
                    try {
                        const errorData = await response.json();
                        console.error(`Create error response:`, errorData);
                    } catch (e) {
                        console.error('Could not parse create error response as JSON');
                    }
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

        // fetch new items for the selected tab (skip Analytics as it handles its own data)
        console.log("Switching to tab:", tab)
        if (tab !== 'Analytics') {
            fetchItems(tab);
        }
    }

    // fetch customer names to use as options for Payments.payer select
    const fetchCustomerOptions = async () => {
        try {
            const res = await fetch('https://mcj-parish.hopto.org/api/customers/list-all/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`
                },
                credentials: 'include',
            });
            if (!res.ok) {
                console.error(`Failed to fetch customers - Status:`, res.status, res.statusText);
                try {
                    const errorData = await res.json();
                    console.error(`Customer fetch error response:`, errorData);
                } catch (e) {
                    console.error('Could not parse customer fetch error response as JSON');
                }
                throw new Error('Failed to fetch customers');
            }
            const data = await res.json();

            // normalize keys (reuse normalizeKey logic)
            const normalizeKey = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
            const normalizeObject = (obj) => {
                if (obj === null || obj === undefined) return obj;
                if (Array.isArray(obj)) return obj.map(normalizeObject);
                if (typeof obj !== 'object') return obj;
                const res = {};
                Object.keys(obj).forEach(k => {
                    const newKey = normalizeKey(k);
                    res[newKey] = normalizeObject(obj[k]);
                });

                setTableLoading(false);
                return res;
            }

            const normalized = Array.isArray(data) ? data.map(normalizeObject) : [];
            const opts = normalized.map(c => ({ value: c.name, label: c.name || c.fullName || (`#${String(c.id).padStart(3, '0')}`) }));
            setCustomerOptions(opts);
        } catch (err) {
            console.error('Error fetching customer options', err);
            setCustomerOptions([]);
        }
    }

    const fetchNicheOptions = async () => {
        try {
            const res = await fetch('https://mcj-parish.hopto.org/api/niches/list-all/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`
                },
                credentials: 'include',
            });
            if (!res.ok) {
                console.error(`Failed to fetch niches - Status:`, res.status, res.statusText);
                try {
                    const errorData = await res.json();
                    console.error(`Niche fetch error response:`, errorData);
                } catch (e) {
                    console.error('Could not parse niche fetch error response as JSON');
                }
                throw new Error('Failed to fetch niches');
            }
            const data = await res.json();

            const available = data.filter(n => n.status === 'Available' || n.status === 'Occupied');

            // normalize keys (reuse normalizeKey logic)
            const normalizeKey = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
            const normalizeObject = (obj) => {
                if (obj === null || obj === undefined) return obj;
                if (Array.isArray(obj)) return obj.map(normalizeObject).filter(entry => entry.status === 'Available');
                if (typeof obj !== 'object') return obj;
                const res = {};
                Object.keys(obj).forEach(k => {
                    const newKey = normalizeKey(k);
                    res[newKey] = normalizeObject(obj[k]);
                });

                console.log(res);
                setTableLoading(false);
                return res;
            }
            const normalized = Array.isArray(available) ? available.map(normalizeObject) : [];
            const opts = normalized.map(n => ({ value: n.id, label: (`${n.location ?? 'No location'} - #${String(n.id).padStart(3, '0')}`) || (`#${String(n.id).padStart(3, '0')}`) }));
            setNicheOptions(opts);
        } catch (err) {
            console.error('Error fetching niche options', err);
            setNicheOptions([]);
        }
    }
    
    

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

                <div className="lg:w-[100%] md:w-[90%] h-[85%] flex flex-row gap-3">
                    {/* Sidebar */}
                    { sidebarOpen &&
                    <div className="sidebar bg-white w-[20%] h-full self-start flex flex-col mt-3 rounded-lg p-4 drop-shadow-md gap-1">

                        {/* Tabs */}
                        <Tab onClick={() => handleTabSelect("Customers")} icon="fa-solid fa-users">Customers</Tab>

                        <Tab onClick={() => handleTabSelect("Payments")} icon="fa-solid fa-credit-card">Payments</Tab>

                        <Tab onClick={() => handleTabSelect("Contacts")} icon="fa-solid fa-address-book">Contacts</Tab>

                        <Tab onClick={() => handleTabSelect("Occupants")} icon="fa-solid fa-box-open">Occupants</Tab>

                        <Tab onClick={() => handleTabSelect("Niches")} icon="fa-solid fa-square-person-confined">Niches</Tab>

                        {/* Audit Logs*/}
                        {sessionStorage.getItem("permissions").split(",").includes("view_audit") && <Tab onClick={() => handleTabSelect("Audit")} icon="fa-solid fa-users">Audit Logs</Tab>}

                        {/* User Account Control */}
                        {sessionStorage.getItem("permissions").split(",").includes("manage_users") &&
                        <Tab onClick={() => handleTabSelect("Users")} icon="fa-solid fa-user-shield">User Management</Tab>}


                        <Tab onClick={() => handleTabSelect("Analytics")} icon="fa-solid fa-chart-simple">Analytics</Tab>
                    </div>}

                    
                    {/* Main Content */}
                    <div className="content transition-all duration-300 ease-out bg-white w-full h-full flex flex-col mt-3 rounded-lg p-4 drop-shadow-md overflow-auto">

                        {/* Dynamic Tab Content rendered from a small config to keep things DRY */}
                        {(() => {
                            const tabs = {
                                Customers: {
                                    columns: [
                                        {label: "", key: "_select" },
                                        { label: "Customer ID", key: "id", type: 'number' },
                                        { label: "Full Name", key: "name", type: 'text' },
                                        { label: "Information", key: "information", type: 'text'},
                                       {/* { label: "Contact Number", key: "contactNumber", type: 'text' },
                                        { label: "Email", key: "email", type: 'text' },
                                        { label: "Address", key: "address", type: 'text' },
                                        { label: "Deceased's Name", key: "deceasedName", type: 'text' },
                                        { label: "Date Deceased", key: "deceasedDate", type: 'date' },
                                        { label: "Relationship to Deceased", key: "relationshipToDeceased", type: 'text' } */}
                                    ],
                                    toolbarButtons: [
                                        { label: 'Add Customer', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => setOpenCreateModal(true) },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: (e) => { handleEditClick(e) } },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: (e) => { handleRemoveSelected(e) } },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">#{(row.id ?? '').toString().padStart(3, "0")}</td>
                                            <td className="p-2">{row.name ?? '' }</td>
                                            <td className="p-2"><button className="hover:bg-black/5 p-4 rounded-lg hover:underline" onClick={() => { setShowCustomerModal(true); setCustomerInfo(row); }}>Click to show</button></td>
                                          {/* <td className="p-2">{row.contactNumber ?? ''}</td>
                                            <td className="p-2">{row.email ?? ''}</td>
                                            <td className="p-2">{row.address ?? ''}</td>
                                            <td className="p-2">{row.deceasedName ?? ''}</td>
                                            <td className="p-2">{row.deceasedDate ?? ''}</td>
                                            <td className="p-2">{row.relationshipToDeceased ?? ''}</td> */}
                                        </>
                                    )
                                },
                                Payments: {
                                    columns: [
                                        { label: "", key: "_select" },
                                        { label: "Payment ID", key: "id", type: 'number' },
                                        { label: "Customer Name", key: "payer", type: 'text' },
                                        { label: "Amount Paid", key: "amountPaid", type: 'number' },
                                        { label: "Remaining Balance", key: "remainingBalance", type: 'number' },
                                        { label: "Last Payment Date", key: "lastPaymentDate", type: 'date' },
                                        { label: "Status", key: "status", type: 'text' }
                                    ],
                                    toolbarButtons: [
                                        { label: 'Add Payment', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: async () => { await fetchCustomerOptions(); setOpenCreateModal(true); } },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: (e) => { handleEditClick(e) } },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: (e) => { handleRemoveSelected(e) } },
                                      
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                        <td className="p-2">#{(row.id ?? '').toString().padStart(3, "0")}</td>
                        <td className="p-2">{(function(){
                            // prefer 'payer' field; it may contain either the customer id or the name
                            const payerVal = row.payer ?? row.payer_id ?? row.payerId ?? null;
                            // if payerVal matches an option value, show the option label
                            const opt = customerOptions.find(o => String(o.value) === String(payerVal));
                            if (opt) return opt.label;
                            // otherwise show the raw value (name) if present
                            return payerVal ?? '';
                        })()}</td>
                        <td className="p-2">₱ {Number(row.amountPaid ?? row.amount_paid ?? 0).toLocaleString("en-US", {minimumFractionDigits: 2 })}</td>
                        <td className="p-2">₱ {Number(row.remainingBalance ?? row.remaining_balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="p-2">{row.lastPaymentDate ? new Intl.DateTimeFormat('en-US').format(new Date(row.lastPaymentDate)) : 'No payments yet'}</td>
                        <td className="p-2">
                            <div className="flex items-center gap-4">
                                <StatusTag status={row.status ?? row.state ?? ''} />
                                <button 
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPaymentId(row.id);
                                        setShowPaymentModal(true);
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </td>
                                        </>
                                    )
                                },

                                Transactions: {
                                    columns: [
                                        { label: "", key: "_select" },
                                        { label: "Transaction #", key: "id", type: 'number' },
                                        { label: "Account", key: "account", type: 'text' },
                                        { label: "Date of Transaction", key:"date", type: 'date'},
                                        { label: "Type of Transaction", key:"type", type: "text"},
                                        { label: "Processed By", key:"processedBy", type:"text"},
                                    ],

                                    toolbarButtons: [
                                        { label: "Add Transaction", icon: "fa-solid fa-plus", onClick: setOpenCreateModal },
                                        { label: "Edit Selected", icon: "fa-solid fa-pen-to-square", onClick: handleEditClick },
                                        { label: "Remove Selected", icon: "fa-solid fa-trash", onClick: handleRemoveSelected },
                                    ],

                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">{ row.id ? row.id.padStart(3, "0") : '' }</td>
                                            <td className="p-2">{ row.account ?? '' }</td>
                                            <td className="p-2">{ row.date ? new Intl.DateTimeFormat('en-US').format(new Date(row.date)) : '' }</td>
                                            <td className="p-2">{ row.type ?? '' }</td>
                                            <td className="p-2">{ row.processedBy ?? '' }</td>
                                        </>
                                    )


                                },

                                Contacts: {
                                    columns: [
                                        { label: "", key: "_select" },
                                        { label: "Contact ID", key: "id", type: 'number' },
                                        { label: "Family Name", key: "familyName", type: 'text' },
                                        { label: "Customer's Name", key: "deceasedName", type: 'text' },
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
                                        { label: 'Add Occupant', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: async () => { await fetchNicheOptions(); setOpenCreateModal(true) }},
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
                                        { label: "Amount", key: "amount", type: 'number' },
                                        { label: "Location", key: "location", type: 'text' },
                                        { label: "# Occupants", key:"occupantCount", type: 'number' },
                                        { label: "Type", key: "type", type: 'text' },
                                        { label: "Status", key: "status", type: 'text' }
                                    ],
                                    toolbarButtons: [
                                        { label: 'Add Niche', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => setOpenCreateModal(true) },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: handleEditClick },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: handleRemoveSelected },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                                            <td className="p-2">#{(row.id ?? '').toString().padStart(3, "0")}</td>
                                            <td className="p-2">₱ {Number(row.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2})}</td>
                                            <td className="p-2">{row.location ?? ''}</td>
                                            <td className="p-2">{row.occupantCount ?? '0'}</td>
                                            <td className="p-2">{row.type ?? ''}</td>
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
                                            <td className="p-2">{row.responseData?.ids?.join(', ') ?? ''}</td>
                                            <td className="p-2">{row.action ?? ''}</td>
                                            <td className="p-2">{row.app ?? ''}</td>
                                            <td className="p-2">{row.path ?? ''}</td>
                                            <td className="p-2">{row.timestamp ? new Intl.DateTimeFormat('en-US', {year:'numeric', month:'numeric',day:'numeric', hour:'numeric', minute:'numeric', second:'numeric'}).format(new Date(row.timestamp)) : ''}</td>
                                        </>
                                    )
                                },
                                Users: {
                                    columns: [
                                        { label: "", key: "_select" },
                                        { label: "User ID", key: "id", type: 'number' },
                                        { label: "Username", key: "username", type: 'text' },
                                        { label: "Role", key: "role", type: 'text' },
                                    ],
                                    toolbarButtons: [
                                        { label: 'Add User', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => setOpenCreateModal(true) },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: handleEditClick },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: handleRemoveSelected },
                                    ],
                                    rowRenderer: (row) => (
                                        <>
                                            
                                            <td className="p-2">{row.id ?? ''}</td>
                                            <td className="p-2">{row.username ?? ''}</td>
                                            <td className="p-2">{row.role ?? ''}</td>
                                        </>
                                    )
                                },
                                Analytics: {
                                    columns: [], // Analytics doesn't use the standard table format
                                    toolbarButtons: [],
                                    rowRenderer: () => null, // Not used for analytics
                                    customComponent: Analytics // Use custom component instead
                                }
                                // Add other tabs here
                            }

                            const cfg = tabs[selectedTab];
                            if (!cfg) return null;

                            if (tableLoading) return <LoadingPage />;

                            // Special handling for Analytics tab
                            if (selectedTab === 'Analytics' && cfg.customComponent) {
                                const AnalyticsComponent = cfg.customComponent;
                                return <AnalyticsComponent />;
                            }

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

            { openCreateModal && (() => {
                let fieldsToPass = fieldsByTab[selectedTab];
                if (selectedTab === 'Payments') {
                    // ensure options are available
                    const paymentsFields = (fieldsByTab.Payments || []).map(f => ({ ...f }));
                    // replace payerId field with select options
                    const baseOpts = customerOptions.length ? customerOptions : [{ value: '', label: 'No customers' }];
                    const optsWithPrompt = [{ value: '', label: 'Select Customer' }, ...baseOpts];
                    fieldsToPass = paymentsFields.map(f => f.name === 'payer' ? ({ ...f, type: 'select', options: optsWithPrompt }) : f);
                } else if (selectedTab === 'Occupants') {
                    const occupantFields = (fieldsByTab.Occupants || []).map(f => ({ ...f }));
                    const baseOpts = nicheOptions.length ? nicheOptions : [{ value: '', label: 'No niches' }];
                    const optsWithPrompt = [{ value: '', label: 'Select Niche' }, ...baseOpts];
                    fieldsToPass = occupantFields.map(f => f.name === 'nicheId' ? ({ ...f, type: 'select', options: optsWithPrompt }) : f);
                }

                return <CreateNewElement tab={selectedTab} onCreate={handleCreate} fields={fieldsToPass} />
            })() }
            { /* EditElement modal can be added here similarly when needed */ }
            { showEditModal && (() => {
                let editFields = fieldsByTab[selectedTab];
                if (selectedTab === 'Payments') {
                    const paymentsFields = (fieldsByTab.Payments || []).map(f => ({ ...f }));
                    const baseEditOpts = customerOptions.length ? customerOptions : [{ value: '', label: 'No customers' }];
                    const editOptsWithPrompt = [{ value: '', label: 'Select Customer' }, ...baseEditOpts];
                    editFields = paymentsFields.map(f => f.name === 'payer' ? ({ ...f, type: 'select', options: editOptsWithPrompt }) : f);
                }
                return <EditElement tab={selectedTab} elementData={elementToEdit} fields={editFields} onEdit={handleEdit} />
            })()}

            <div ref={accountModalRef}>
                <AccountModal isOpen={openAccountModal} username={username} role={sessionStorage.getItem("role") || 'Staff'} />
            </div>

            {showCustomerModal && <CustomerModal onClose={handleCloseCustomerModal} info={customerInfo} />}
            
            {showPaymentModal && (
                <PaymentDetailModal 
                    paymentId={selectedPaymentId}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedPaymentId(null);
                    }}
                    onPaymentAdded={() => {
                        // Refresh the payments list when a new payment is added
                        fetchItems(selectedTab);
                    }}
                />
            )}
        </div>
    )
}