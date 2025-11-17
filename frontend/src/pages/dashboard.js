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
    const [holderInfo, setHolderInfo] = useState({});
    
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
                                    columns: [], // Holders uses custom grid layout instead of table
                                    toolbarButtons: [
                                        { label: 'Add Holder', icon: 'fa-solid fa-plus', bg: 'bg-blue-500', textClass: 'text-white', onClick: () => setOpenCreateModal(true) },
                                        { label: 'Edit Selected', icon: 'fa-solid fa-pencil', onClick: (e) => { handleEditClick(e) } },
                                        { label: `(${selectedElements.length}) Remove Selected`, icon: 'fa fa-trash', bg: 'bg-red-500', textClass: 'text-white', onClick: (e) => { handleRemoveSelected(e) } },
                                    ],
                                    rowRenderer: () => null, // Not used for custom grid
                                    customComponent: HoldersGrid // Use custom grid component
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
                                }
                                // Add other tabs here
                            }

                            const cfg = tabs[selectedTab];
                            if (!cfg) return null;

                            if (tableLoading) return <LoadingPage />;

                            // Special handling for custom components (Analytics and Holders)
                            if (cfg.customComponent) {
                                const CustomComponent = cfg.customComponent;
                                if (selectedTab === 'Analytics') {
                                    return <CustomComponent />;
                                } else if (selectedTab === 'Holders') {
                                    return (
                                        <div className="space-y-4">
                                            {/* Toolbar for Holders */}
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
                                            {/* Search bar */}
                                            <div className="mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Search holders..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                            {/* Holders Grid */}
                                            <CustomComponent
                                                holders={elements}
                                                searchQuery={searchQuery}
                                                selectedItems={selectedElements}
                                                onSelectHolder={handleSelectRow}
                                                onViewHolder={(holder) => {
                                                    setShowCustomerModal(true);
                                                    setHolderInfo(holder);
                                                }}
                                                loading={tableLoading}
                                            />
                                        </div>
                                    );
                                }
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