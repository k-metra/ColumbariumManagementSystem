import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function OccupancyChart({ data }) {
    const chartData = [
        { name: 'Occupied', value: data.occupied, color: '#F59E0B' },
        { name: 'Full', value: data.full, color: '#EF4444' },
        { name: 'Available', value: data.available, color: '#10B981' }
    ];

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

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Niche Occupancy Rate</h3>
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
                    Occupancy Rate: <span className="font-bold text-gray-900">{data.occupancy_rate}%</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {(data.occupied + data.full)} out of {data.total} niches occupied
                </p>
            </div>
        </div>
    );
}