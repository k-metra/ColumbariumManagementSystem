import { useState } from 'react';
import Select from 'react-select';

/**
 * Generic modal form for creating elements. Use `fields` prop to drive the form.
 * fields: [{ name, label, type: 'text'|'number'|'date'|'select'|'textarea', options?: [{value,label}] }]
 * If no fields prop is provided, a sensible default for Payments is used so existing calls keep working.
 */
export default function CreateNewElement({ tab, onCreate, fields }) {
    const [formData, setFormData] = useState({});

    const defaultFields = {
        Payments: [
            { name: 'payer', label: 'Payer Name', type: 'text', placeholder: 'Payer Name' },
            { name: 'amount_due', label: 'Amount Due', type: 'number', placeholder: 'Amount Due' },
            { name: 'amount_paid', label: 'Amount Paid', type: 'number', placeholder: 'Amount Paid' },
            { name: 'payment_date', label: 'Date Paid', type: 'date' },
            { name: 'status', label: 'Status', type: 'select', options: [
                { value: '', label: 'Select Status' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Inactive', label: 'Inactive' },
            ] }
        ],
        // Add defaults for other tabs if you want quick fallbacks
    }

    const fieldsToRender = fields || defaultFields[tab] || [];

    const handleChange = (name, value) => {
        
        console.log('handleChange', name, value);
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const handleFileChange = (name, file) => {
        console.log('handleFileChange', name, file);
        // Only set the file if it's actually a File object, otherwise set to null
        if (file && file instanceof File) {
            setFormData((prev) => ({ ...prev, [name]: file }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: null }));
        }
    }

    const renderField = (f) => {
        const value = f.type === "select" ? f.options.find(opt => opt.value === formData[f.name]) || '' : formData[f.name] ?? '';

        const common = {
            name: f.name,
            value,
            onChange: (e) => handleChange(f.name, e ? e.value ?? e.target.value : ''),
            className: 'border p-2 rounded'
        };

        return (
            <div key={f.name} className="flex flex-col gap-1">
                <label htmlFor={f.name} className="text-sm text-black/70 block">{f.label}</label>
                {f.type === 'select' ? (
                    
                    <Select isClearable isSearchable options={f.options} {...common} />
                ) : f.type === 'textarea' ? (
                    <textarea {...common} placeholder={f.placeholder || ''} />
                ) : f.type === 'file' ? (
                    <input 
                        type="file" 
                        name={f.name}
                        accept={f.accept || '*'}
                        onChange={(e) => handleFileChange(f.name, e.target.files[0])}
                        className="border p-2 rounded"
                    />
                ) : (
                    <input {...common} type={f.type || 'text'} placeholder={f.placeholder || ''} />
                )}
            </div>
        )
    }

    return (
        <div className="w-full h-full z-1000 fixed top-0 left-0 bg-black/30 justify-center items-center flex">
            <div className="bg-white max-h-[90%] overflow-y-auto p-6 rounded-md shadow-md w-1/3">
                <div className="text-2xl font-bold mb-4 text-[rgb(60,60,60)] text-center">Create New {tab && tab.slice(0, -1)}</div>
                <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    console.log('CreateNewElement submit', formData);
                    
                    // Check if we have any file fields
                    const hasFiles = Object.values(formData).some(value => value instanceof File);
                    
                    if (hasFiles) {
                        // Create FormData for file uploads
                        const form = new FormData();
                        console.log('Creating FormData, formData keys and values:', Object.entries(formData));
                        Object.keys(formData).forEach(key => {
                            const value = formData[key];
                            const field = fields.find(f => f.name === key);
                            
                            console.log(`Processing key: ${key}, value type: ${typeof value}, isFile: ${value instanceof File}, field type: ${field?.type}`);
                            
                            if (value !== null && value !== undefined) {
                                if (field?.type === 'file') {
                                    // For file fields, only add if it's actually a File object
                                    if (value instanceof File) {
                                        console.log(`Adding file ${key}:`, value.name);
                                        form.append(key, value);
                                    } else {
                                        console.log(`Skipping non-file value for file field ${key}:`, value);
                                    }
                                    // Skip empty file fields entirely
                                } else {
                                    // For non-file fields, add all values (including empty strings)
                                    console.log(`Adding non-file field ${key}:`, value);
                                    form.append(key, value);
                                }
                            }
                        });
                        
                        console.log('FormData entries:');
                        for (let [key, value] of form.entries()) {
                            console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
                        }
                        
                        onCreate(form);
                    } else {
                        onCreate(formData);
                    }
                }} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        {fieldsToRender.map(renderField)}

                        <div className="flex justify-end gap-2 mt-4">
                            <div onClick={() => onCreate(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded cursor-pointer hover:bg-gray-400">Cancel</div>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}