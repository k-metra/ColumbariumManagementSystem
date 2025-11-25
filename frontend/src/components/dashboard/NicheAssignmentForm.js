import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function NicheAssignmentForm({ holder, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        selectedNiche: null,
        date_of_availment: new Date().toISOString().split('T')[0]
    });
    const [availableNiches, setAvailableNiches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAvailableNiches();
    }, []);

    const fetchAvailableNiches = async () => {
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
                
                // Filter niches: only show Available ones
                const availableOptions = niches
                    .filter(niche => niche.status === 'Available')
                    .map(niche => ({
                        value: niche.id,
                        label: `${niche.location} (${niche.niche_type})`,
                        niche: niche
                    }));
                
                setAvailableNiches(availableOptions);
            } else {
                console.error('Failed to fetch niches');
                setAvailableNiches([]);
            }
        } catch (error) {
            console.error('Error fetching niches:', error);
            setAvailableNiches([]);
        }
    };

    const handleNicheChange = (selectedOption) => {
        setFormData({
            ...formData,
            selectedNiche: selectedOption
        });
    };

    const handleDateChange = (e) => {
        setFormData({
            ...formData,
            date_of_availment: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.selectedNiche) {
            setError('Please select a niche');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Assign the selected niche to the holder
            const response = await fetch(`http://localhost:8000/api/niches/edit/?niche_id=${formData.selectedNiche.value}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                },
                body: JSON.stringify({
                    holder: holder.id,
                    date_of_availment: formData.date_of_availment
                })
            });

            if (response.ok) {
                const result = await response.json();
                onSave(result);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to assign niche');
            }
        } catch (error) {
            console.error('Error assigning niche:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed w-screen h-screen top-0 left-0 bg-black/30 flex justify-center items-center z-[60]">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">
                    Assign Niche to {holder.name}
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
                            value={holder.name}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1">
                            Available Niches *
                        </label>
                        <Select
                            id="niche"
                            name="niche"
                            value={formData.selectedNiche}
                            onChange={handleNicheChange}
                            options={availableNiches}
                            placeholder="Search and select a niche..."
                            isSearchable={true}
                            isClearable={true}
                            noOptionsMessage={() => "No available niches"}
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
                        {availableNiches.length === 0 && (
                            <p className="text-sm text-red-600 mt-1">
                                No available niches. All niches are currently occupied, reserved, or full.
                            </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                            Only available niches are shown for assignment.
                        </p>
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
                            onChange={handleDateChange}
                            required
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Date when the holder acquires the niche (contract start date)
                        </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Assignment Details</h4>
                        <p className="text-xs text-blue-700">
                            • The niche status will change to "Reserved" after assignment<br/>
                            • Contract expiry will be calculated as 50 years from availment date<br/>
                            • The holder can have up to 4 niches maximum
                        </p>
                    </div>

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
                            disabled={!formData.selectedNiche || loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Assigning...' : 'Assign Niche'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}