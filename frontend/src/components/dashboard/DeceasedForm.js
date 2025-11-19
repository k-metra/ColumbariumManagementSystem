import { useState, useEffect } from 'react';

export default function DeceasedForm({ deceased, niche, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        niche: niche?.id || '',
        name: deceased?.name || '',
        date_of_birth: deceased?.date_of_birth || '',
        date_of_death: deceased?.date_of_death || '',
        interment_date: deceased?.interment_date || '',
        relationship_to_holder: deceased?.relationship_to_holder || '',
        slot: deceased?.slot || '',
        disposition_after_expiry: deceased?.disposition_after_expiry || 'Communal Ossuary'
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [deathCertificate, setDeathCertificate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const allSlots = ['Upper Left', 'Upper Right', 'Lower Left', 'Lower Right'];

    useEffect(() => {
        if (niche?.id) {
            fetchAvailableSlots();
        }
    }, [niche?.id]);

    const fetchAvailableSlots = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/niches/list-holder/?holder_id=${niche.holder}`, {
                headers: {
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const niches = await response.json();
                const currentNiche = niches.find(n => n.id === niche.id);
                
                if (currentNiche) {
                    // Get occupied slots from deceased records
                    const occupiedSlots = currentNiche.deceased_records?.map(d => d.slot).filter(Boolean) || [];
                    
                    // If editing, exclude current deceased's slot from occupied slots
                    if (deceased?.slot) {
                        const currentSlotIndex = occupiedSlots.indexOf(deceased.slot);
                        if (currentSlotIndex > -1) {
                            occupiedSlots.splice(currentSlotIndex, 1);
                        }
                    }
                    
                    // Calculate available slots
                    const available = allSlots.filter(slot => !occupiedSlots.includes(slot));
                    setAvailableSlots(available);
                } else {
                    setAvailableSlots(allSlots);
                }
            } else {
                console.error('Failed to fetch niche data');
                setAvailableSlots(allSlots);
            }
        } catch (error) {
            console.error('Error fetching available slots:', error);
            setAvailableSlots(allSlots);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setDeathCertificate(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            
            // Append all text fields
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            // Only append file if a new one is selected
            if (deathCertificate) {
                formDataToSend.append('death_certificate', deathCertificate);
            }

            const url = deceased 
                ? `http://localhost:8000/api/niches/deceased/edit/?deceased_id=${deceased.id}`
                : 'http://localhost:8000/api/niches/deceased/create-new/';
            
            const method = deceased ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                },
                body: formDataToSend
            });

            if (response.ok) {
                const result = await response.json();
                onSave(result);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to save deceased record');
            }
        } catch (error) {
            console.error('Error saving deceased:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed w-screen h-screen top-0 left-0 bg-black/30 flex justify-center items-center z-[60]">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">
                    {deceased ? 'Edit Deceased Record' : 'Add Deceased Person'}
                </h3>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1">
                            Niche Location
                        </label>
                        <input
                            type="text"
                            id="niche"
                            value={niche?.location || 'Unknown Location'}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        />
                        <input
                            type="hidden"
                            name="niche"
                            value={formData.niche}
                        />
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                id="date_of_birth"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="date_of_death" className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Death *
                            </label>
                            <input
                                type="date"
                                id="date_of_death"
                                name="date_of_death"
                                value={formData.date_of_death}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="interment_date" className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Interment
                        </label>
                        <input
                            type="date"
                            id="interment_date"
                            name="interment_date"
                            value={formData.interment_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                            Date when remains were placed in the niche
                        </p>
                    </div>

                    <div>
                        <label htmlFor="slot" className="block text-sm font-medium text-gray-700 mb-1">
                            Slot Position *
                        </label>
                        <select
                            id="slot"
                            name="slot"
                            value={formData.slot}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select slot position</option>
                            {deceased?.slot && !availableSlots.includes(deceased.slot) && (
                                <option value={deceased.slot}>{deceased.slot} (current)</option>
                            )}
                            {availableSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-600 mt-1">
                            Position of the urn within this niche
                        </p>
                        {availableSlots.length === 0 && !deceased?.slot && (
                            <p className="text-sm text-red-600 mt-1">
                                No available slots in this niche
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="relationship_to_holder" className="block text-sm font-medium text-gray-700 mb-1">
                            Relationship to Holder
                        </label>
                        <select
                            id="relationship_to_holder"
                            name="relationship_to_holder"
                            value={formData.relationship_to_holder}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select relationship</option>
                            <option value="Self">Self</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Parent">Parent</option>
                            <option value="Child">Child</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Grandparent">Grandparent</option>
                            <option value="Grandchild">Grandchild</option>
                            <option value="Other Family">Other Family</option>
                            <option value="Friend">Friend</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="disposition_after_expiry" className="block text-sm font-medium text-gray-700 mb-1">
                            Disposition After Expiry *
                        </label>
                        <select
                            value={formData.disposition_after_expiry}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    disposition_after_expiry: e.target.value
                                });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="Communal Ossuary">Communal Ossuary</option>
                            <option value="Returned to Family">Returned to Family</option>
                            <option value="Unclaimed Remains Disposal">Unclaimed Remains Disposal</option>
                        </select>
                        <p className="text-sm text-gray-600 mt-1">
                            Where the remains will be transferred after niche lease expires
                        </p>
                    </div>

                    <div>
                        <label htmlFor="death_certificate" className="block text-sm font-medium text-gray-700 mb-1">
                            Death Certificate
                        </label>
                        <input
                            type="file"
                            id="death_certificate"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                            Accepted formats: PDF, JPG, JPEG, PNG
                        </p>
                        {deceased?.death_certificate && (
                            <p className="text-sm text-green-600 mt-1">
                                Current file: {deceased.death_certificate.split('/').pop()}
                            </p>
                        )}
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
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : (deceased ? 'Update Record' : 'Add Deceased')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}