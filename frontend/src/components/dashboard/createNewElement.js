import { useState } from 'react';

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
        <div className="w-full h-full z-1000 fixed top-0 left-0 bg-black/30 justify-center items-center flex">
            <div className="bg-white p-6 rounded-md shadow-md w-1/3">
                <div className="text-2xl font-bold mb-4 text-[rgb(60,60,60)] text-center">Create New {tab && tab.slice(0, -1)}</div>
                <form onSubmit={(e) => { e.preventDefault(); onCreate(formData); }} className="flex flex-col gap-4">
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