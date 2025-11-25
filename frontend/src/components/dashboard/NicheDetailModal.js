import { IoClose } from "react-icons/io5";
import { useState, useEffect } from 'react';
import Select from 'react-select';
import CustomerModal from './customerModal';

export default function NicheDetailModal({ niche, onClose, onSave }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableHolders, setAvailableHolders] = useState([]);
    const [selectedHolder, setSelectedHolder] = useState(null);
    const [availmentDate, setAvailmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [nicheData, setNicheData] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    useEffect(() => {
        if (niche?.id) {
            fetchNicheDetails();
            fetchAvailableHolders();
        }
    }, [niche?.id]);

    const fetchNicheDetails = async () => {
        try {
            // Fetch the specific niche with full details including holder_details
            const response = await fetch(`http://localhost:8000/api/niches/list-all/`, {
                headers: {
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const niches = await response.json();
                const currentNiche = niches.find(n => n.id === niche.id);
                
                if (currentNiche) {
                    // If we have a holder but no holder_details, fetch detailed niche data
                    if (currentNiche.holder && !currentNiche.holder_details) {
                        // Fetch using the full NicheSerializer endpoint
                        const detailResponse = await fetch(`http://localhost:8000/api/niches/list-holder/?holder_id=${currentNiche.holder}`, {
                            headers: {
                                'Authorization': `Session ${sessionStorage.getItem('token')}`,
                                'Session-Token': sessionStorage.getItem('token')
                            }
                        });
                        
                        if (detailResponse.ok) {
                            const holderNiches = await detailResponse.json();
                            const detailedNiche = holderNiches.find(n => n.id === niche.id);
                            if (detailedNiche) {
                                setNicheData(detailedNiche);
                            } else {
                                setNicheData(currentNiche);
                            }
                        } else {
                            setNicheData(currentNiche);
                        }
                    } else {
                        setNicheData(currentNiche);
                    }
                    
                    // Set selected holder if niche has one
                    if (currentNiche?.holder) {
                        setSelectedHolder({
                            value: currentNiche.holder,
                            label: currentNiche.holder_name
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching niche details:', error);
            setError('Failed to fetch niche details');
        }
    };

    const fetchAvailableHolders = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/customers/list-all/`, {
                headers: {
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const customers = await response.json();
                // Filter holders who have less than 4 niches
                const availableCustomers = customers
                    .filter(customer => (customer.niche_count || 0) < 4)
                    .map(customer => ({
                        value: customer.id,
                        label: `${customer.name} (${customer.niche_count || 0}/4 niches)`
                    }));
                
                setAvailableHolders(availableCustomers);
            }
        } catch (error) {
            console.error('Error fetching holders:', error);
            setError('Failed to fetch available holders');
        }
    };

    const handleAssignHolder = async () => {
        if (!selectedHolder) {
            setError('Please select a holder');
            return;
        }

        if (!availmentDate) {
            setError('Please select a date of availment');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:8000/api/niches/edit/?niche_id=${niche.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                },
                body: JSON.stringify({
                    holder: selectedHolder.value,
                    date_of_availment: availmentDate
                })
            });

            if (response.ok) {
                fetchNicheDetails(); // Refresh niche data
                onSave?.(); // Callback to refresh parent data
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to assign holder');
            }
        } catch (error) {
            console.error('Error assigning holder:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleUnassignHolder = async () => {
        if (!window.confirm('Are you sure you want to unassign this holder? This will also unassign the niche from the holder.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:8000/api/niches/edit/?niche_id=${niche.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                },
                body: JSON.stringify({
                    holder: null
                })
            });

            if (response.ok) {
                setSelectedHolder(null);
                fetchNicheDetails(); // Refresh niche data
                onSave?.(); // Callback to refresh parent data
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to unassign holder');
            }
        } catch (error) {
            console.error('Error unassigning holder:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleViewHolderDetails = () => {
        if (nicheData?.holder_details) {
            setShowCustomerModal(true);
        }
    };

    if (!nicheData) {
        return (
            <div className="fixed w-screen h-screen top-0 left-0 bg-black/30 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg min-w-[500px]">
                    <div className="text-center">Loading niche details...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed w-screen h-screen top-0 left-0 bg-black/30 flex justify-center items-center z-50">
                <div className="bg-white overflow-y-auto rounded-lg drop-shadow-lg min-w-[60%] max-h-[90vh] max-w-[95%] p-6">
                    <button onClick={onClose} className="absolute hover:bg-black/10 rounded-full transition-all duration-200 right-4 top-4 text-zinc-700">
                        <IoClose size={35}/>
                    </button>

                    <div className="text-2xl font-bold mb-4 text-zinc-800 text-center">Niche Management</div>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Niche Information */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Niche Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <span className="font-semibold text-gray-700">Niche ID:</span>
                                    <p className="text-gray-600 ml-2">{nicheData.id}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Location:</span>
                                    <p className="text-gray-600 ml-2">{nicheData.location}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Type:</span>
                                    <p className="text-gray-600 ml-2">{nicheData.niche_type}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <span className="font-semibold text-gray-700">Status:</span>
                                    <p className="text-gray-600 ml-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            nicheData.status === 'Available' ? 'bg-green-100 text-green-800' :
                                            nicheData.status === 'Reserved' ? 'bg-blue-100 text-blue-800' :
                                            nicheData.status === 'Occupied' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {nicheData.status}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Deceased Count:</span>
                                    <p className="text-gray-600 ml-2">{nicheData.deceased_count || 0}/4</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Date of Availment:</span>
                                    <p className="text-gray-600 ml-2">
                                        {nicheData.date_of_availment ? 
                                            new Date(nicheData.date_of_availment).toLocaleDateString() : 
                                            'Not set'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Holder Assignment */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Holder Assignment</h2>
                        
                        {nicheData.holder ? (
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Current Holder</h3>
                                        <p className="text-gray-600">{nicheData.holder_name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleViewHolderDetails}
                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                        >
                                            <i className="fa-solid fa-eye mr-1"></i>
                                            View Details
                                        </button>
                                        <button
                                            onClick={handleUnassignHolder}
                                            disabled={loading}
                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                                        >
                                            <i className="fa-solid fa-times mr-1"></i>
                                            Unassign
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Holder
                                    </label>
                                    <Select
                                        value={selectedHolder}
                                        onChange={setSelectedHolder}
                                        options={availableHolders}
                                        placeholder="Search and select a holder..."
                                        isSearchable={true}
                                        isClearable={true}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                    <p className="text-sm text-gray-600 mt-1">
                                        Only holders with less than 4 niches are shown
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Availment *
                                    </label>
                                    <input
                                        type="date"
                                        value={availmentDate}
                                        onChange={(e) => setAvailmentDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="text-sm text-gray-600 mt-1">
                                        Date when the holder acquires the niche (defaults to today)
                                    </p>
                                </div>
                                <button
                                    onClick={handleAssignHolder}
                                    disabled={!selectedHolder || loading}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <i className="fa-solid fa-user-plus mr-1"></i>
                                    {loading ? 'Assigning...' : 'Assign Holder'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Deceased Records (if any) */}
                    {nicheData.deceased_records && nicheData.deceased_records.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Deceased Records</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {nicheData.deceased_records.map((deceased) => (
                                    <div key={deceased.id} className="bg-gray-50 p-3 rounded border">
                                        <h5 className="font-medium text-gray-800">{deceased.name}</h5>
                                        <div className="text-xs text-gray-600 space-y-1">
                                            {deceased.slot && (
                                                <div className="font-medium text-blue-600">Slot: {deceased.slot}</div>
                                            )}
                                            {deceased.date_of_death && (
                                                <div>Death: {new Date(deceased.date_of_death).toLocaleDateString()}</div>
                                            )}
                                            {deceased.disposition_after_expiry && (
                                                <div>Disposition: {deceased.disposition_after_expiry}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Modal for viewing holder details */}
            {showCustomerModal && nicheData?.holder_details && (
                <CustomerModal 
                    onClose={() => setShowCustomerModal(false)} 
                    info={nicheData.holder_details} 
                />
            )}
        </>
    );
}