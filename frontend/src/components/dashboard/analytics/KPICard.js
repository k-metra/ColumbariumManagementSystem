export default function KPICard({ title, value, icon, color = "blue", prefix = "", suffix = "" }) {
    const colorClasses = {
        blue: "bg-blue-500",
        green: "bg-green-500",
        purple: "bg-purple-500",
        orange: "bg-orange-500",
        red: "bg-red-500",
        gray: "bg-gray-500"
    };

    const bgColorClass = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {prefix}{value.toLocaleString()}{suffix}
                    </p>
                </div>
                {icon && (
                    <div className={`p-3 rounded-full ${bgColorClass}`}>
                        <i className={`${icon} text-white text-xl`}></i>
                    </div>
                )}
            </div>
        </div>
    );
}