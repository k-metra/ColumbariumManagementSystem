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
import Analytics from "../components/dashboard/analytics/Analytics";
import HoldersGrid from "../components/dashboard/holdersGrid";
import Reports from "../components/dashboard/Reports";
import Table from "../components/dashboard/table";

import { fieldsByTab } from "../config/dashboard/fieldsByTab";

import Tab from '../components/dashboard/tab';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const { username, setUsername } = useAuth();
    const [selectedTab, setSelectedTab] = useState("Holders");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);

    const [tableLoading, setTableLoading] = useState(false);

    const [selectedElements, setSelectedElements] = useState([]);
    const [elementToEdit, setElementToEdit] = useState(null);
    const [elements, setElements] = useState([])

    const [openAccountModal, setOpenAccountModal] = useState(false);
    const accountModalRef = useRef(null);
    const [filter, setFilter] = useState("");
    const [searchFilter, setSearchFilter] = useState("holder"); // "holder", "deceased", or "refno"
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [holderInfo, setHolderInfo] = useState({});
    const [expiredNichesCount, setExpiredNichesCount] = useState(0);
    
    async function fetchItems(endpoint) {
        // Skip fetching for Analytics and Reports tabs since they handle their own data
        if (endpoint === 'Analytics' || endpoint === 'Reports') {
            setTableLoading(false);
            return;
        }

        setTableLoading(true);
        setElements([]);
        console.log(endpoint, " fetching items.");
        try {
            const apiEndpoint = endpoint === 'Holders' ? 'customers' : endpoint.toLowerCase();
            await fetch (`http://localhost:8000/api/${apiEndpoint}/list-all/`, {
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

    async function fetchExpiredNichesCount() {
        try {
            const response = await fetch(`http://localhost:8000/api/customers/expired-count/`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`
                },
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setExpiredNichesCount(data.count || 0);
            } else {
                console.error('Failed to fetch expired count:', response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error fetching expired niches count:", error);
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

    const handleViewHolderDetails = (holder) => {
        setHolderInfo(holder);
        setShowCustomerModal(true);
    }

    const handleEditClick = () => {
         if (selectedElements.length === 1) {
            setElementToEdit(elements.find(e => e.id === selectedElements[0]));
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
                const apiEndpoint = selectedTab === 'Holders' ? 'customers' : endpoint.toLowerCase();
                const response = await fetch(`http://localhost:8000/api/${apiEndpoint}/delete/`, {
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
                // Convert keys to snake_case for FormData while preserving file objects
                const newFormData = new FormData();
                for (let [key, value] of data.entries()) {
                    const snakeKey = camelToSnake(key);
                    // Preserve file objects as-is, convert other values
                    if (value instanceof File) {
                        newFormData.append(snakeKey, value);
                    } else {
                        newFormData.append(snakeKey, value);
                    }
                }
                body = newFormData;
            } else {
                // Regular JSON request
                headers['Content-Type'] = 'application/json';
                const payload = convertKeysToSnake(data);
                body = JSON.stringify(payload);
            }

            console.log("Edit data type:", data instanceof FormData ? 'FormData' : 'JSON');
            if (data instanceof FormData) {
                console.log("FormData entries:");
                for (let [key, value] of data.entries()) {
                    console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
                }
            }

            const apiEndpoint = selectedTab === 'Holders' ? 'customers' : endpoint.toLowerCase();
            const entityType = selectedTab === 'Holders' ? 'customer' : endpoint.slice(0, -1).toLowerCase();
            const response = await fetch(`http://localhost:8000/api/${apiEndpoint}/edit/?${entityType}_id=${elementToEdit.id}`, {
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
                // Convert keys to snake_case for FormData while preserving file objects
                const newFormData = new FormData();
                for (let [key, value] of data.entries()) {
                    const snakeKey = camelToSnake(key);
                    // Preserve file objects as-is, convert other values
                    if (value instanceof File) {
                        newFormData.append(snakeKey, value);
                    } else {
                        newFormData.append(snakeKey, value);
                    }
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
            if (data instanceof FormData) {
                console.log("FormData entries:");
                for (let [key, value] of data.entries()) {
                    console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
                }
            }

            const apiEndpoint = selectedTab === 'Holders' ? 'customers' : endpoint.toLowerCase();
            await fetch("http://localhost:8000/api/" + apiEndpoint + "/create-new/", {
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
       fetchExpiredNichesCount(); // Fetch expired niches count for notification badge

       const loader = setTimeout(() => {
           setLoading(false);
       }, 800);

       return () => {
           clearTimeout(loader);
                
       }
    }, [username, selectedTab, setUsername])

    // Handle filtering
    useEffect(() => {
        const applyFilters = async () => {
            setCurrentPage(1); // Reset to first page when filtering
            
            if (!filter.trim()) {
                setFilteredData(elements);
                return;
            }

            const lowerFilter = filter.toLowerCase();

            if (selectedTab === 'Holders' && searchFilter === 'deceased') {
                // Search by deceased - make API call to find holders with deceased matching the query
                try {
                    const response = await fetch(`http://localhost:8000/api/customers/search-by-deceased/?query=${encodeURIComponent(filter)}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Session-Token': sessionStorage.getItem('token'),
                            'Authorization': `Session ${sessionStorage.getItem('token')}`
                        },
                        credentials: 'include',
                    });

                    if (response.ok) {
                        const deceasedSearchResults = await response.json();
                        setFilteredData(deceasedSearchResults);
                        return;
                    }
                } catch (error) {
                    console.error('Deceased search failed:', error);
                }
            }

            if (selectedTab === 'Holders' && searchFilter === 'refno') {
                // Search by reference number - make API call to find holders by niche reference number
                try {
                    const response = await fetch(`http://localhost:8000/api/customers/search-by-refno/?query=${encodeURIComponent(filter)}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Session-Token': sessionStorage.getItem('token'),
                            'Authorization': `Session ${sessionStorage.getItem('token')}`
                        },
                        credentials: 'include',
                    });

                    if (response.ok) {
                        const refNoSearchResults = await response.json();
                        setFilteredData(refNoSearchResults);
                        return;
                    }
                } catch (error) {
                    console.error('Reference number search failed:', error);
                }
            }

            // Regular client-side filtering
            const filtered = elements.filter(el => {
                if (selectedTab === 'Holders') {
                    const searchableFields = [
                        el.name,
                        el.contactNumber,
                        el.email,
                        el.address,
                        el.id?.toString()
                    ];
                    
                    return searchableFields.some(field => 
                        field && field.toString().toLowerCase().includes(lowerFilter)
                    );
                } else {
                    // Generic search for other tabs
                    return Object.values(el).some(value => 
                        value && value.toString().toLowerCase().includes(lowerFilter)
                    );
                }
            });

            setFilteredData(filtered);
        };

        applyFilters();
    }, [elements, filter, searchFilter, selectedTab]);

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
        setCurrentPage(1); // Reset pagination when switching tabs
        setFilter(""); // Reset filter when switching tabs

        // fetch new items for the selected tab (skip Analytics as it handles its own data)
        console.log("Switching to tab:", tab)
        if (tab !== 'Analytics') {
            fetchItems(tab);
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
                        <Tab onClick={() => handleTabSelect("Holders")} icon="fa-solid fa-users">Holders</Tab>

                        <Tab onClick={() => handleTabSelect("Reports")} icon="fa-solid fa-chart-bar">
                            Reports
                            {expiredNichesCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center ml-2">
                                    {expiredNichesCount}
                                </span>
                            )}
                        </Tab>

                        {/* Audit Logs*/}
                        {sessionStorage.getItem("permissions").split(",").includes("view_audit") && <Tab onClick={() => handleTabSelect("Audit")} icon="fa-solid fa-clipboard-list">Audit Logs</Tab>}

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
                                Holders: {
                                    columns: [
                                        { label: "", key: "_select" },
                                        { label: "ID", key: "id", type: 'number' },
                                        { label: "Name", key: "name", type: 'text' },
                                        { label: "Contact Number", key: "contactNumber", type: 'text' },
                                        { label: "Email Address", key: "email", type: 'text' },
                                        { label: "Actions", key: "_actions" },
                                    ],
                                    toolbarButtons: [
                                        { label: 'Add Holder', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => setOpenCreateModal(true) },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: (e) => { handleEditClick(e) } },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: (e) => { handleRemoveSelected(e) } },
                                    ],
                                    rowRenderer: (row) => {
                                        // Determine status indicator based on expiry status
                                        let statusIndicator = null;
                                        
                                        if (row.expiryStatus === 'EXPIRED') {
                                            statusIndicator = (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <i className="fa-solid fa-exclamation-triangle mr-1"></i>
                                                    EXPIRED
                                                </span>
                                            );
                                        } else if (row.expiryStatus === 'CRITICAL') {
                                            statusIndicator = (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    <i className="fa-solid fa-clock mr-1"></i>
                                                    {row.earliestExpiryDays} days left
                                                </span>
                                            );
                                        } else if (row.expiryStatus === 'WARNING') {
                                            statusIndicator = (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                    <i className="fa-solid fa-warning mr-1"></i>
                                                    {row.earliestExpiryDays} days left
                                                </span>
                                            );
                                        } else if (row.expiryStatus === 'EXPIRING') {
                                            statusIndicator = (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                    <i className="fa-solid fa-calendar-alt mr-1"></i>
                                                    Expiring in {row.earliestExpiryDays} days
                                                </span>
                                            );
                                        }
                                        
                                        return (
                                            <>
                                                <td className="p-2">{row.id ?? ''}</td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        {row.name ?? ''}
                                                        {statusIndicator}
                                                    </div>
                                                </td>
                                                <td className="p-2">{row.contactNumber ?? ''}</td>
                                                <td className="p-2">{row.email ?? ''}</td>
                                                <td className="p-2">
                                                    <button
                                                        onClick={() => handleViewHolderDetails(row)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                                    >
                                                        <i className="fa-solid fa-eye mr-1"></i>
                                                        Show Details
                                                    </button>
                                                </td>
                                            </>
                                        );
                                    }
                                },
                                Analytics: {
                                    columns: [], // Analytics doesn't use the standard table format
                                    toolbarButtons: [],
                                    rowRenderer: () => null, // Not used for analytics
                                    customComponent: Analytics // Use custom component instead
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
                                Reports: {
                                    columns: [], // Reports doesn't use the standard table format
                                    toolbarButtons: [],
                                    rowRenderer: () => null, // Not used for reports
                                    customComponent: Reports // Use custom component instead
                                }
                                // Add other tabs here
                            }

                            const cfg = tabs[selectedTab];
                            if (!cfg) return null;

                            if (tableLoading) return <LoadingPage />;

                            // Special handling for Analytics custom component
                            if (cfg.customComponent) {
                                const CustomComponent = cfg.customComponent;
                                // Pass special props to Reports component
                                if (selectedTab === 'Reports') {
                                    return <CustomComponent onViewDetails={handleViewHolderDetails} />;
                                }
                                return <CustomComponent />;
                            }

                            return (
                                <>
                                    {/* Toolbar */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {cfg.toolbarButtons.map((button, index) => (
                                            <button
                                                key={index}
                                                onClick={button.onClick}
                                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                                    button.bg || 'bg-gray-200'
                                                } ${
                                                    button.textClass || 'text-gray-700'
                                                } hover:opacity-90`}
                                            >
                                                {button.icon && <i className={button.icon}></i>}
                                                {button.label}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Search and Filter for Holders */}
                                    {selectedTab === 'Holders' && (
                                        <div className="flex gap-3 mb-4">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Search..."
                                                    value={filter}
                                                    onChange={(e) => setFilter(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                            <div className="w-48">
                                                <select
                                                    value={searchFilter}
                                                    onChange={(e) => setSearchFilter(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                >
                                                    <option value="holder">Search by Holder</option>
                                                    <option value="deceased">Search by Deceased</option>
                                                    <option value="refno">Search by Ref No.</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Other tabs search */}
                                    {selectedTab !== 'Holders' && selectedTab !== 'Analytics' && (
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    )}

                                    {/* Table */}
                                    <div className="overflow-auto w-full">
                                        {(() => {
                                            // Calculate pagination for Holders and Audit tabs
                                            const shouldPaginate = selectedTab === 'Holders' || selectedTab === 'Audit';
                                            let displayData = filteredData;
                                            let totalPages = 1;
                                            
                                            if (shouldPaginate && filteredData) {
                                                totalPages = Math.ceil(filteredData.length / itemsPerPage);
                                                const startIndex = (currentPage - 1) * itemsPerPage;
                                                const endIndex = startIndex + itemsPerPage;
                                                displayData = filteredData.slice(startIndex, endIndex);
                                            }
                                            
                                            return (
                                                <>
                                                    <Table
                                                        columns={cfg.columns.map(col => col.label)}
                                                        data={displayData}
                                                        selectedItems={selectedElements}
                                                        onSelectAll={handleSelectAll}
                                                        onSelectRow={handleSelectRow}
                                                        getRowKey={(row) => row.id}
                                                        getRowClassName={selectedTab === 'Holders' ? (row) => {
                                                            let baseClassName = "border-b border-black/10 hover:bg-black/5 text-zinc-700";
                                                            
                                                            // Use camelCase field names that match the actual data
                                                            if (row.expiryStatus === 'EXPIRED') {
                                                                return `${baseClassName} !bg-red-100 !border-l-4 !border-red-600`;
                                                            } else if (row.expiryStatus === 'CRITICAL') {
                                                                return `${baseClassName} !bg-red-100 !border-l-4 !border-red-500`;
                                                            } else if (row.expiryStatus === 'WARNING') {
                                                                return `${baseClassName} !bg-orange-100 !border-l-4 !border-orange-500`;
                                                            } else if (row.expiryStatus === 'EXPIRING') {
                                                                return `${baseClassName} !bg-yellow-100 !border-l-4 !border-yellow-500`;
                                                            }
                                                            
                                                            return `${baseClassName} even:bg-[#fafafa]`;
                                                        } : null}
                                                    >
                                                        {cfg.rowRenderer}
                                                    </Table>
                                                    
                                                    {/* Pagination Controls */}
                                                    {shouldPaginate && filteredData && filteredData.length > itemsPerPage && (
                                                        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
                                                            <div className="flex items-center text-sm text-gray-700">
                                                                <span>
                                                                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to{' '}
                                                                    {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                                    disabled={currentPage === 1}
                                                                    className={`px-3 py-1 rounded-md ${
                                                                        currentPage === 1
                                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                                >
                                                                    Previous
                                                                </button>
                                                                
                                                                {/* Page Numbers */}
                                                                <div className="flex space-x-1">
                                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                        let pageNumber;
                                                                        if (totalPages <= 5) {
                                                                            pageNumber = i + 1;
                                                                        } else if (currentPage <= 3) {
                                                                            pageNumber = i + 1;
                                                                        } else if (currentPage >= totalPages - 2) {
                                                                            pageNumber = totalPages - 4 + i;
                                                                        } else {
                                                                            pageNumber = currentPage - 2 + i;
                                                                        }
                                                                        
                                                                        return (
                                                                            <button
                                                                                key={pageNumber}
                                                                                onClick={() => setCurrentPage(pageNumber)}
                                                                                className={`px-3 py-1 rounded-md ${
                                                                                    currentPage === pageNumber
                                                                                        ? 'bg-blue-500 text-white'
                                                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                                                }`}
                                                                            >
                                                                                {pageNumber}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                                
                                                                <button
                                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                                    disabled={currentPage === totalPages}
                                                                    className={`px-3 py-1 rounded-md ${
                                                                        currentPage === totalPages
                                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </>
                            )
                            
                        })()}
                    </div>
                </div>
            </div>

            { openCreateModal && (() => {
                let fieldsToPass = fieldsByTab[selectedTab] || [];
                return <CreateNewElement tab={selectedTab} onCreate={handleCreate} fields={fieldsToPass} />
            })() }
            { /* EditElement modal can be added here similarly when needed */ }
            { showEditModal && (() => {
                let editFields = fieldsByTab[selectedTab] || [];
                return <EditElement tab={selectedTab} elementData={elementToEdit} fields={editFields} onEdit={handleEdit} />
            })()}

            <div ref={accountModalRef}>
                <AccountModal isOpen={openAccountModal} username={username} role={sessionStorage.getItem("role") || 'Staff'} />
            </div>

            {showCustomerModal && <CustomerModal onClose={handleCloseCustomerModal} info={holderInfo} />}
            
        </div>
    )
}