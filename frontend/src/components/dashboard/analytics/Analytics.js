import { useState, useEffect } from 'react';
import KPICard from './KPICard';
import OccupancyChart from './OccupancyChart';
import LoadingPage from '../../../pages/loading';

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [error, setError] = useState('');

    const fetchAnalyticsData = async () => {
        setLoading(true);
        setError('');
        
        console.log('Fetching analytics data...');
        
        try {
            const response = await fetch('https://mcj-parish.hopto.org/api/analytics/data/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`
                },
                credentials: 'include',
            });

            console.log('Analytics response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Analytics API error:', errorText);
                throw new Error(`Failed to fetch analytics data: ${response.status}`);
            }

            const data = await response.json();
            console.log('Analytics data received:', data);
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError(`Failed to load analytics data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    if (loading) return <LoadingPage />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
                <button 
                    onClick={fetchAnalyticsData}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <button 
                    onClick={fetchAnalyticsData}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <i className="fa-solid fa-refresh"></i>
                    Refresh Data
                </button>
            </div>

            {analyticsData ? (
                <>
                    {/* Top Row - Earnings KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <KPICard
                            title="Total Earnings"
                            value={analyticsData.total_earnings || 0}
                            icon="fa-solid fa-peso-sign"
                            color="green"
                            prefix="₱"
                        />
                        <KPICard
                            title="Monthly Earnings"
                            value={analyticsData.monthly_earnings || 0}
                            icon="fa-solid fa-calendar-month"
                            color="blue"
                            prefix="₱"
                        />
                    </div>

                    {/* Second Row - Occupancy Chart and Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <OccupancyChart data={analyticsData.occupancy || {occupied: 0, full: 0, available: 0, total: 0, occupancy_rate: 0}} />
                        </div>
                        <div className="space-y-4">
                            <KPICard
                                title="Total Niches"
                                value={analyticsData.kpi?.total_niches || 0}
                                icon="fa-solid fa-square-person-confined"
                                color="purple"
                            />
                            <KPICard
                                title="Total Customers"
                                value={analyticsData.kpi?.total_customers || 0}
                                icon="fa-solid fa-users"
                                color="orange"
                            />
                            <KPICard
                                title="Total Occupants"
                                value={analyticsData.kpi?.total_occupants || 0}
                                icon="fa-solid fa-person"
                                color="blue"
                            />
                        </div>
                    </div>

                    {/* Third Row - Niche Status Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KPICard
                            title="Occupied Niches"
                            value={analyticsData.kpi?.occupied_niches || 0}
                            icon="fa-solid fa-user-check"
                            color="orange"
                        />
                        <KPICard
                            title="Full Niches"
                            value={analyticsData.kpi?.full_niches || 0}
                            icon="fa-solid fa-users"
                            color="red"
                        />
                        <KPICard
                            title="Available Niches"
                            value={analyticsData.kpi?.available_niches || 0}
                            icon="fa-solid fa-circle"
                            color="green"
                        />
                    </div>
                </>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">No analytics data available</p>
                </div>
            )}
        </div>
    );
}