import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function NicheStatusChart({ data }) {
    const chartData = [
        { name: 'Available', value: data.available || 0, color: '#10B981' },
        { name: 'Occupied', value: data.occupied || 0, color: '#3B82F6' },
        { name: 'Reserved', value: data.reserved || 0, color: '#F59E0B' },
        { name: 'Expired', value: data.expired || 0, color: '#EF4444' },
        { name: 'Full', value: data.full || 0, color: '#8B5CF6' }
    ].filter(item => item.value > 0); // Only show categories with values

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                fontSize="14"
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const totalNiches = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Niche Status Distribution</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value, name) => [`${value} niches`, name]}
                        />
                        <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value, entry) => (
                                <span style={{ color: entry.color, fontWeight: 'bold' }}>
                                    {value}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    Total Niches: <span className="font-bold text-gray-900">{totalNiches}</span>
                </p>
                <div className="text-xs text-gray-500 mt-2 grid grid-cols-2 gap-2">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex items-center justify-center gap-1">
                            <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span>{item.name}: {item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}