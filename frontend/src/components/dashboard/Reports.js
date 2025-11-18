import { useState, useEffect } from 'react';

export default function Reports({ onViewDetails }) {
    const [expiringSoon, setExpiringSoon] = useState([]);
    const [recentlyAvailed, setRecentlyAvailed] = useState([]);
    const [expired, setExpired] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReportsData();
    }, []);

    const fetchReportsData = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            
            const [expiringSoonRes, recentlyAvailedRes, expiredRes] = await Promise.all([
                fetch(`http://localhost:8000/api/customers/expiring-soon/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Session-Token': token,
                        'Authorization': `Session ${token}`
                    },
                    credentials: 'include',
                }),
                fetch(`http://localhost:8000/api/customers/recently-availed/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Session-Token': token,
                        'Authorization': `Session ${token}`
                    },
                    credentials: 'include',
                }),
                fetch(`http://localhost:8000/api/customers/expired-niches/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Session-Token': token,
                        'Authorization': `Session ${token}`
                    },
                    credentials: 'include',
                })
            ]);

            if (expiringSoonRes.ok) {
                const expiringSoonData = await expiringSoonRes.json();
                setExpiringSoon(expiringSoonData);
            } else {
                console.error('Failed to fetch expiring soon data:', expiringSoonRes.status, expiringSoonRes.statusText);
            }

            if (recentlyAvailedRes.ok) {
                const recentlyAvailedData = await recentlyAvailedRes.json();
                setRecentlyAvailed(recentlyAvailedData);
            } else {
                console.error('Failed to fetch recently availed data:', recentlyAvailedRes.status, recentlyAvailedRes.statusText);
            }

            if (expiredRes.ok) {
                const expiredData = await expiredRes.json();
                setExpired(expiredData);
            } else {
                console.error('Failed to fetch expired data:', expiredRes.status, expiredRes.statusText);
            }

        } catch (err) {
            setError('Failed to fetch reports data');
            console.error('Reports fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getDaysUntilExpiry = (days) => {
        if (days === null || days === undefined) return 'N/A';
        if (days === 0) return 'Today';
        if (days === 1) return '1 day';
        return `${days} days`;
    };

    const getExpiryStatusColor = (status) => {
        switch (status) {
            case 'EXPIRED': return 'text-red-600 bg-red-100';
            case 'CRITICAL': return 'text-red-500 bg-red-50';
            case 'WARNING': return 'text-orange-500 bg-orange-50';
            case 'EXPIRING': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-lg">Loading reports...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Soon to Expire Niches */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="bg-yellow-500 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-semibold">Soon to Expire Niches</h2>
                    <p className="text-yellow-100">Niches expiring within one year</p>
                </div>
                <div className="p-6">
                    {expiringSoon.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No niches expiring soon</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold">Holder Name</th>
                                        <th className="text-left py-3 px-4 font-semibold">Contact</th>
                                        <th className="text-left py-3 px-4 font-semibold">Days Until Expiry</th>
                                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                                        <th className="text-center py-3 px-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expiringSoon.map((holder) => (
                                        <tr key={holder.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">{holder.name}</td>
                                            <td className="py-3 px-4">{holder.contact_number || 'N/A'}</td>
                                            <td className="py-3 px-4">{getDaysUntilExpiry(holder.earliest_expiry_days)}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpiryStatusColor(holder.expiry_status)}`}>
                                                    {holder.expiry_status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => onViewDetails(holder)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Recently Availed Niches */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="bg-green-500 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-semibold">Recently Availed Niches</h2>
                    <p className="text-green-100">Latest 3 niche purchases</p>
                </div>
                <div className="p-6">
                    {recentlyAvailed.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No recent niches found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold">Holder Name</th>
                                        <th className="text-left py-3 px-4 font-semibold">Niche Location</th>
                                        <th className="text-left py-3 px-4 font-semibold">Date of Availment</th>
                                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                                        <th className="text-center py-3 px-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentlyAvailed.map((niche) => (
                                        <tr key={niche.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">{niche.holder_name}</td>
                                            <td className="py-3 px-4">{niche.location}</td>
                                            <td className="py-3 px-4">{formatDate(niche.date_of_availment)}</td>
                                            <td className="py-3 px-4">{niche.niche_type}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        // Find the holder data for this niche
                                                        fetch(`http://localhost:8000/api/customers/list-all/`, {
                                                            method: 'GET',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Session-Token': sessionStorage.getItem('token'),
                                                                'Authorization': `Session ${sessionStorage.getItem('token')}`
                                                            },
                                                            credentials: 'include',
                                                        })
                                                        .then(res => res.json())
                                                        .then(data => {
                                                            const holder = data.find(h => h.id === niche.holder);
                                                            if (holder) onViewDetails(holder);
                                                        })
                                                        .catch(console.error);
                                                    }}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                                                >
                                                    View Holder
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Expired Niches */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="bg-red-500 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-semibold">Expired Niches</h2>
                    <p className="text-red-100">Niches that have already expired</p>
                </div>
                <div className="p-6">
                    {expired.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No expired niches</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold">Holder Name</th>
                                        <th className="text-left py-3 px-4 font-semibold">Contact</th>
                                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                                        <th className="text-center py-3 px-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expired.map((holder) => (
                                        <tr key={holder.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">{holder.name}</td>
                                            <td className="py-3 px-4">{holder.contact_number || 'N/A'}</td>
                                            <td className="py-3 px-4">{holder.email || 'N/A'}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => onViewDetails(holder)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}