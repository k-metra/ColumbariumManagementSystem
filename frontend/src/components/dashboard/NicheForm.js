import { useState, useEffect } from 'react';

export default function NicheForm({ niche, holder, onSave, onCancel }) {
    // Parse existing niche location if editing
    const parseNicheLocation = (location) => {
        if (!location) return { wall: '', row: '', column: '' };
        // Parse "Wall X - Row Y - Niche Z" format
        const parts = location.split(' - ');
        const wall = parts[0]?.replace('Wall ', '') || '';
        const row = parts[1]?.replace('Row ', '') || '';
        const column = parts[2]?.replace('Niche ', '') || '';
        return { wall, row, column };
    };

    const { wall: initialWall, row: initialRow, column: initialColumn } = parseNicheLocation(niche?.location);

    const [formData, setFormData] = useState({
        holder: holder?.id || '',
        wall: initialWall,
        row: initialRow,
        column: initialColumn,
        niche_type: niche?.niche_type || 'Granite',
        date_of_availment: niche?.date_of_availment ? 
            new Date(niche.date_of_availment).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Build location string from individual fields
    const buildLocation = (wall, row, column) => {
        if (!wall || !row || !column) return '';
        return `Wall ${wall} - Row ${row} - Niche ${column}`;
    };

    // Validation
    const validateField = (name, value) => {
        const errors = { ...fieldErrors };
        
        switch (name) {
            case 'wall':
            case 'row':
            case 'column':
                if (!value) {
                    errors[name] = 'This field is required';
                } else if (!/^\d+$/.test(value)) {
                    errors[name] = 'Must be a number';
                } else if (parseInt(value) <= 0) {
                    errors[name] = 'Must be a positive number';
                } else {
                    delete errors[name];
                }
                break;
            default:
                break;
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // For numeric fields, validate input
        if (['wall', 'row', 'column'].includes(name)) {
            validateField(name, value);
        }
        
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate all numeric fields
        const isValid = ['wall', 'row', 'column'].every(field => 
            validateField(field, formData[field])
        );

        if (!isValid) {
            setError('Please fix the validation errors before submitting');
            setLoading(false);
            return;
        }

        try {
            // Build the location string
            const location = buildLocation(formData.wall, formData.row, formData.column);
            
            const submitData = {
                ...formData,
                location: location
            };

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
                body: JSON.stringify(submitData)
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

    // Live preview of the location
    const previewLocation = buildLocation(formData.wall, formData.row, formData.column);

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
                    {holder && (
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
                    )}

                    {/* Niche Location Components */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="wall" className="block text-sm font-medium text-gray-700 mb-1">
                                Wall *
                            </label>
                            <input
                                type="text"
                                id="wall"
                                name="wall"
                                value={formData.wall}
                                onChange={handleChange}
                                required
                                placeholder="1"
                                pattern="[0-9]+"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    fieldErrors.wall ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {fieldErrors.wall && (
                                <p className="text-sm text-red-600 mt-1">{fieldErrors.wall}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="row" className="block text-sm font-medium text-gray-700 mb-1">
                                Row *
                            </label>
                            <input
                                type="text"
                                id="row"
                                name="row"
                                value={formData.row}
                                onChange={handleChange}
                                required
                                placeholder="1"
                                pattern="[0-9]+"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    fieldErrors.row ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {fieldErrors.row && (
                                <p className="text-sm text-red-600 mt-1">{fieldErrors.row}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="column" className="block text-sm font-medium text-gray-700 mb-1">
                                Column *
                            </label>
                            <input
                                type="text"
                                id="column"
                                name="column"
                                value={formData.column}
                                onChange={handleChange}
                                required
                                placeholder="1"
                                pattern="[0-9]+"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    fieldErrors.column ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {fieldErrors.column && (
                                <p className="text-sm text-red-600 mt-1">{fieldErrors.column}</p>
                            )}
                        </div>
                    </div>

                    {/* Location Preview */}
                    <div className="bg-gray-50 p-3 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location Preview
                        </label>
                        <p className="text-sm text-gray-900">
                            {previewLocation || 'Fill in the fields above to see preview'}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="niche_type" className="block text-sm font-medium text-gray-700 mb-1">
                            Material *
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

                    {holder && (
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
                    )}

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
                                        'Will be calculated after saving'}
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
                            disabled={loading || Object.keys(fieldErrors).length > 0}
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