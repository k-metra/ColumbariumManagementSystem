import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function NicheForm({ niche, holder, onSave, onCancel }) {
    // Predefined niche locations
    const allLocations = [
        "Wall 3 – Row 2 – Niche 4",
        "Wall 1 – Row 4 – Niche 2", 
        "Wall 4 – Row 1 – Niche 5",
        "Wall 2 – Row 3 – Niche 1",
        "Wall 1 – Row 2 – Niche 3",
        "Wall 4 – Row 4 – Niche 4",
        "Wall 2 – Row 1 – Niche 5", 
        "Wall 3 – Row 3 – Niche 2",
        "Wall 4 – Row 2 – Niche 1",
        "Wall 1 – Row 3 – Niche 4"
    ];

    const [formData, setFormData] = useState({
        holder: holder?.id || '',
        location: niche?.location || '',
        niche_type: niche?.niche_type || 'Granite',
        date_of_availment: niche?.date_of_availment ? 
            new Date(niche.date_of_availment).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0]
    });
    const [availableLocations, setAvailableLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch taken locations when component mounts
    useEffect(() => {
        fetchTakenLocations();
    }, []);

    const fetchTakenLocations = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/niches/list-all/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                }
            });

            if (response.ok) {
                const niches = await response.json();
                const takenLocations = niches.map(n => n.location);
                
                // Filter out taken locations, but keep current location if editing
                const available = allLocations.filter(location => 
                    !takenLocations.includes(location) || location === niche?.location
                );
                
                setAvailableLocations(available);
            } else {
                console.error('Failed to fetch niches');
                // If API fails, show all locations as fallback
                setAvailableLocations(allLocations);
            }
        } catch (error) {
            console.error('Error fetching niches:', error);
            // If API fails, show all locations as fallback
            setAvailableLocations(allLocations);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLocationChange = (selectedOption) => {
        setFormData({
            ...formData,
            location: selectedOption ? selectedOption.value : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = niche 
                ? `http://localhost:8000/api/niches/edit/?niche_id=${niche.id}`
                : 'http://localhost:8000/api/niches/create-new/';
            
            const method = niche ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                onSave(result);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to save niche');
            }
        } catch (error) {
            console.error('Error saving niche:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed w-screen h-screen top-0 left-0 bg-black/30 flex justify-center items-center z-[60]">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">
                    {niche ? 'Edit Niche' : 'Add New Niche'}
                </h3>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="holder" className="block text-sm font-medium text-gray-700 mb-1">
                            Holder
                        </label>
                        <input
                            type="text"
                            id="holder"
                            value={holder?.name || 'Unknown Holder'}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        />
                        <input
                            type="hidden"
                            name="holder"
                            value={formData.holder}
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                            Location *
                        </label>
                        <Select
                            id="location"
                            name="location"
                            value={availableLocations.find(loc => formData.location === loc) ? 
                                { value: formData.location, label: formData.location } : null}
                            onChange={handleLocationChange}
                            options={availableLocations.map(location => ({
                                value: location,
                                label: location
                            }))}
                            placeholder="Search or select a location..."
                            isSearchable={true}
                            isClearable={true}
                            noOptionsMessage={() => "No available locations"}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={{
                                control: (provided, state) => ({
                                    ...provided,
                                    borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
                                    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                                    '&:hover': {
                                        borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF'
                                    }
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: '#9CA3AF'
                                })
                            }}
                        />
                        {availableLocations.length === 0 && (
                            <p className="text-sm text-red-600 mt-1">
                                No available locations. All niches are taken.
                            </p>
                        )}
                        {!niche && availableLocations.length < allLocations.length && (
                            <p className="text-sm text-gray-600 mt-1">
                                {allLocations.length - availableLocations.length} location(s) are already taken and hidden from this list.
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="niche_type" className="block text-sm font-medium text-gray-700 mb-1">
                            Niche Type *
                        </label>
                        <select
                            id="niche_type"
                            name="niche_type"
                            value={formData.niche_type}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="Granite">Granite</option>
                            <option value="Glass">Glass</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="date_of_availment" className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Availment *
                        </label>
                        <input
                            type="date"
                            id="date_of_availment"
                            name="date_of_availment"
                            value={formData.date_of_availment}
                            onChange={handleChange}
                            required
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Contract start date (expiry calculated as 50 years from this date)
                        </p>
                    </div>

                    {niche && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contract Expiry Date
                                </label>
                                <input
                                    type="text"
                                    value={niche?.date_of_expiry ? 
                                        new Date(niche.date_of_expiry).toLocaleDateString() : 
                                        'Calculating...'}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {niche?.days_until_expiry !== undefined ? 
                                        `${niche.days_until_expiry} days remaining` : 
                                        'Automatically calculated as 50 years from availment date'}
                                </p>
                                {niche?.is_expiring_soon && (
                                    <p className="text-sm text-orange-600 mt-1 font-medium">
                                        ⚠️ Contract expires within one year!
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status (Auto-calculated)
                                </label>
                                <input
                                    type="text"
                                    value={niche?.status || 'Available'}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Status is automatically calculated based on occupancy
                                </p>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : (niche ? 'Update Niche' : 'Create Niche')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}