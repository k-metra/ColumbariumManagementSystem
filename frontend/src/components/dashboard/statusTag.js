export default function StatusTag({status}) {
    const statusColors = {
        "Completed": "bg-green-100 text-green-600",
        "Canceled": "bg-red-100 text-red-600",
        "Pending": "bg-yellow-100 text-yellow-600",
        "Available": "bg-green-100 text-green-600",
        "Occupied": "bg-red-100 text-red-600",
        "Maintenance": "bg-yellow-100 text-yellow-600",
        "Reserved": "bg-orange-100 text-orange-600"
    }

    return (
        <span className={`px-2 py-1 rounded-full text-sm font-semibold ${statusColors[status]}`}>
            {status}
        </span>
    )
}