import { useState, useEffect } from 'react';
import KPICard from './KPICard';
import OccupancyChart from './OccupancyChart';
import NicheStatusChart from './NicheStatusChart';
import LoadingPage from '../../../pages/loading';
import apiClient from '../../../axios/api';

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('holders');

    const fetchAnalyticsData = async () => {
        setLoading(true);
        setError('');
        
        console.log('Fetching analytics data...');
        
        try {
            const response = await apiClient.get('/analytics/data/', {
                headers: {
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`
                }
            });

            console.log('Analytics response status: 200');
            console.log('Analytics data received:', response.data);
            setAnalyticsData(response.data);
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
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('holders')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === 'holders'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <i className="fa-solid fa-users mr-2"></i>
                                Holder Statistics
                            </button>
                            <button
                                onClick={() => setActiveTab('niches')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === 'niches'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <i className="fa-solid fa-building mr-2"></i>
                                Niche Status
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'holders' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <OccupancyChart data={analyticsData.holder_status || {with_deceased: 0, without_deceased: 0, total: 0, deceased_rate: 0}} />
                            </div>
                            <div className="space-y-4">
                                <KPICard
                                    title="Total Holders"
                                    value={analyticsData.kpi?.total_customers || 0}
                                    icon="fa-solid fa-users"
                                    color="blue"
                                />
                                <KPICard
                                    title="With Deceased"
                                    value={analyticsData.holder_status?.with_deceased || 0}
                                    icon="fa-solid fa-heart"
                                    color="red"
                                />
                                <KPICard
                                    title="Niche Only"
                                    value={analyticsData.holder_status?.without_deceased || 0}
                                    icon="fa-solid fa-building"
                                    color="green"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'niches' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <NicheStatusChart data={analyticsData.niche_status || {available: 0, occupied: 0, reserved: 0, expired: 0, full: 0}} />
                            </div>
                            <div className="space-y-4">
                                <KPICard
                                    title="Total Niches"
                                    value={analyticsData.kpi?.total_niches || 0}
                                    icon="fa-solid fa-building"
                                    color="blue"
                                />
                                <KPICard
                                    title="Available"
                                    value={analyticsData.niche_status?.available || 0}
                                    icon="fa-solid fa-circle-check"
                                    color="green"
                                />
                                <KPICard
                                    title="Occupied"
                                    value={analyticsData.niche_status?.occupied || 0}
                                    icon="fa-solid fa-users"
                                    color="blue"
                                />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">No analytics data available</p>
                </div>
            )}
        </div>
    );
}