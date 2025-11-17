// fields config for CreateNewElement to avoid duplicating form markup
export const fieldsByTab = {
        Holders: [
            // Holder Information Only
            { name: 'name', label: 'Holder Name', type: 'text', placeholder: 'Full Name', required: true },
            { name: 'contactNumber', label: 'Contact Number', type: 'text', placeholder: 'Contact Number', required: true },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'Email Address', required: false },
            { name: 'address', label: "Address", type: 'textarea', placeholder: 'Complete Address', required: false },
            { name: 'memorandumOfAgreement', label: 'Memorandum of Agreement (Optional)', type: 'file', accept: 'image/*,application/pdf', placeholder: 'Upload memorandum (PDF or image)', required: false },
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