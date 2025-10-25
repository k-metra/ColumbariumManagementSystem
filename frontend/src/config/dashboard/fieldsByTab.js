// fields config for CreateNewElement to avoid duplicating form markup
export const fieldsByTab = {
        Customers: [
            { name: 'name', label: 'Customer Name', type: 'text', placeholder: 'Customer Name' },
            { name: 'contactNumber', label: 'Contact Number', type: 'text', placeholder: 'Contact Number' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'Email' },
            { name: 'address', label: "Address", type: 'textarea', placeholder: 'Address' },
            { name: 'deceasedName', label: "Deceased's Name", type: 'text', placeholder: "Deceased's Name" },
            { name: 'deceasedDate', label: "Deceased Date", type: 'date', placeholder: 'Deceased Date' },
            { name: 'relationshipToDeceased', label: 'Relationship to Deceased', type: 'text', placeholder: 'Relationship to Deceased' },
            { name: 'memorandumOfAgreement', label: 'Memorandum of Agreement', type: 'file', accept: 'image/*', placeholder: 'Upload memorandum (PNG/JPG)' },
        ],
        Payments: [
            { name: 'payer', label: 'Customer Name', type: 'select', placeholder: 'Payer Name' },
            { name: 'amountDue', label: 'Amount Due', type: 'number', placeholder: 'Amount Due' },
            { name: 'maintenanceFee', label: 'Maintenance Fee', type: 'number', placeholder: 'Maintenance Fee' },
        ],
        Contacts: [
            { name: 'familyName', label: "Family Name", type: 'text' },
            { name: 'deceasedName', label: "Deceased's Name", type: 'text' },
            { name: 'deceasedDate', label: "Deceased Date", type: 'date' },
            { name: 'address', label: "Address", type: 'textarea' },
            { name: 'contactNumber', label: 'Contact Number', type: 'text' },
        ],
        Occupants: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'intermentDate', label: 'Date of Interment', type: 'date' },
            { name: 'nicheId', label: 'Niche ID', type: 'select' },
        ],
        Niches: [
            { name: 'amount', label: "Amount", type: 'number' },
            { name: 'location', label: 'Location', type: 'text' },
            { name: 'type', label: 'Type', type: 'select', options: [
                { value: '', label: 'Select Type' },
                { value: "Granite", label: "Granite"},
                { value: "Glass", label: "Glass"},
            ] },
            { name: 'maxOccupants', label: 'Max Occupants', type: 'number', default: 4 },
        ],
        Users: [
            { name: 'username', label: 'Username', type: 'text',  },
            { name: 'password', label: 'Password', type: 'password' },
            { name: 'role', label: 'Role', type: 'select', options: [
                { value: '', label: 'Select Role' },
                { value: 'admin', label: 'Admin' },
                { value: 'staff', label: 'Staff' },
            ]},
        ],
}