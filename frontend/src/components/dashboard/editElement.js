import { useState } from 'react';

export default function EditElement({ tab, elementData, fields, onEdit }) {
    const [formData, setFormData] = useState({ ...elementData });

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                ) : (
                    <input {...common} type={f.type || 'text'} placeholder={f.placeholder || ''} />
                )}
            </div>
        )
    }

    return (
        <div className="fixed bg-black/30 flex flex-col justify-center items-center top-0 left-0 w-full h-full">
            <div className="bg-white p-6 rounded shadow-lg w-96">

                <div className="text-2xl font-bold mb-4 text-[rgb(60,60,60)] text-center">Edit {tab && tab.slice(0, -1)}</div>
                <form onSubmit={(e) => { e.preventDefault(); onEdit(formData); }} className="flex flex-col gap-4">
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