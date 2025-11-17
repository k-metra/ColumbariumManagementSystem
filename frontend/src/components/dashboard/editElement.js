import { useState } from 'react';

export default function EditElement({ tab, elementData, fields, onEdit }) {
    const [formData, setFormData] = useState({ ...elementData });

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const handleFileChange = (name, file) => {
        console.log('handleFileChange', name, file);
        setFormData((prev) => ({ ...prev, [name]: file }));
    }

    const renderField = (f) => {
        const value = formData[f.name] ?? '';
        const common = {
            name: f.name,
            value,
            onChange: (e) => handleChange(f.name, e.target.value),
            className: 'border p-2 rounded'
        };
        /*switch (f.type) {
            case 'text':
            case 'number':
            case 'date':
                return <input type={f.type} {...common} />;
            default:
                return null;
        }*/

        return (
            <div key={f.name} className="flex flex-col gap-1">
                <label htmlFor={f.name} className="text-sm text-black/70 block">{f.label}</label>
                {f.type === 'select' ? (
                    <select {...common}>
                        {(f.options || []).map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ) : f.type === 'textarea' ? (
                    <textarea {...common} placeholder={f.placeholder || ''} />
                ) : f.type === 'file' ? (
                    <div className="flex flex-col gap-2">
                        <input 
                            type="file" 
                            name={f.name}
                            accept={f.accept || '*'}
                            onChange={(e) => handleFileChange(f.name, e.target.files[0])}
                            className="border p-2 rounded"
                        />
                        {elementData[f.name] && (
                            <div className="text-sm text-gray-600">
                                Current: <a href={`http://localhost:8000/media/${elementData[f.name]}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    View current file
                                </a>
                                <div className="text-xs text-gray-500 mt-1">
                                    Leave empty to keep current file, or select a new file to replace it.
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <input {...common} type={f.type || 'text'} placeholder={f.placeholder || ''} />
                )}
            </div>
        )
    }

    return (
        <div className="fixed bg-black/30 flex flex-col justify-center items-center top-0 left-0 w-full h-full">
            <div className="bg-white p-6 overflow-y-auto max-h-[90vh] rounded shadow-lg w-96">

                <div className="text-2xl font-bold mb-4 text-[rgb(60,60,60)] text-center">Edit {tab && tab.slice(0, -1)}</div>
                <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    
                    // Check if we have any new file uploads
                    const hasNewFiles = Object.values(formData).some(value => value instanceof File);
                    
                    if (hasNewFiles) {
                        // Create FormData for file uploads
                        const form = new FormData();
                        Object.keys(formData).forEach(key => {
                            const value = formData[key];
                            const field = fields.find(f => f.name === key);
                            
                            if (value !== null && value !== undefined) {
                                if (value instanceof File) {
                                    // New file upload
                                    form.append(key, value);
                                } else if (field?.type === 'file' && typeof value === 'string' && value.trim() !== '') {
                                    // Existing file - don't include in FormData to keep existing file
                                    // The backend will keep the existing file if no new file is provided
                                } else if (field?.type !== 'file' && value !== '') {
                                    // Regular form field with non-empty value
                                    form.append(key, value);
                                } else if (field?.type !== 'file') {
                                    // Regular form field (including empty values for non-file fields)
                                    form.append(key, value);
                                }
                            }
                        });
                        console.log('Submitting FormData for edit with new files');
                        onEdit(form);
                    } else {
                        // No new files, send as JSON but exclude file fields with string values (existing files)
                        const jsonData = { ...formData };
                        fields.forEach(field => {
                            if (field.type === 'file' && typeof jsonData[field.name] === 'string') {
                                // Remove existing file path from JSON data to preserve existing file
                                delete jsonData[field.name];
                            }
                        });
                        console.log('Submitting JSON data for edit without file changes');
                        onEdit(jsonData);
                    }
                }} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        {fields.map(renderField)}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => onEdit(null)} className="px-4 py-2 bg-gray-300 text-black rounded hover:opacity-70 transition-all duration-300 ease-out">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:opacity-70 transition-all duration-300 ease-out">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}