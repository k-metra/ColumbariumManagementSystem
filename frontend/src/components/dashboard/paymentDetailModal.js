import { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function PaymentDetailModal({ paymentId, onClose, onPaymentAdded }) {
    const [loading, setLoading] = useState(true);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState([]);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [newPayment, setNewPayment] = useState({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [error, setError] = useState('');
    const [canAddPayment, setCanAddPayment] = useState(false);

    const fetchPaymentDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://mcj-parish.hopto.org/api/payments/${paymentId}/details/`, {
                method: 'GET',
                headers: {
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payment details');
            }

            const data = await response.json();
            setPaymentInfo(data.payment);
            setPaymentDetails(data.details);
            setCanAddPayment(data.can_add_payment);
        } catch (error) {
            console.error('Error fetching payment details:', error);
            setError('Failed to load payment details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        setError('');

        if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
            setError('Please enter a valid payment amount');
            return;
        }

        try {
            const response = await fetch(`https://mcj-parish.hopto.org/api/payments/${paymentId}/add-payment/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify(newPayment),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.type === 'payment_completed') {
                    setError('This payment is already completed. No additional payments can be added.');
                } else if (data.type === 'amount_exceeds_balance') {
                    setError(data.error);
                } else {
                    setError(data.error || 'Failed to add payment');
                }
                return;
            }

            // Success - refresh the data
            setNewPayment({
                amount: '',
                payment_date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setShowAddPayment(false);
            await fetchPaymentDetails();
            
            // Notify parent component
            if (onPaymentAdded) {
                onPaymentAdded(data.updated_payment);
            }

        } catch (error) {
            console.error('Error adding payment:', error);
            setError('Failed to add payment');
        }
    };

    const handleEditPaymentDetail = (detail) => {
        setEditingPayment({
            id: detail.id,
            amount: detail.amount,
            payment_date: detail.payment_date,
            notes: detail.notes || ''
        });
    };

    const handleUpdatePaymentDetail = async (e) => {
        e.preventDefault();
        setError('');

        if (!editingPayment.amount || parseFloat(editingPayment.amount) <= 0) {
            setError('Please enter a valid payment amount');
            return;
        }

        try {
            const response = await fetch(`https://mcj-parish.hopto.org/api/payments/detail/${editingPayment.id}/edit/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    amount: editingPayment.amount,
                    payment_date: editingPayment.payment_date,
                    notes: editingPayment.notes
                }),
                credentials: 'include',
            });

            if (response.ok) {
                // Update local state instead of refetching
                setPaymentDetails(prev => prev.map(detail => 
                    detail.id === editingPayment.id 
                        ? { ...detail, ...editingPayment }
                        : detail
                ));
                setEditingPayment(null);
                // Refresh payment info to get updated totals
                await fetchPaymentDetails();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update payment');
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            setError('Failed to update payment');
        }
    };

    const handleDeletePaymentDetail = async (detailId) => {
        const confirmation = window.confirm('Are you sure you want to delete this payment detail? This action cannot be undone.');
        
        if (!confirmation) return;

        try {
            const response = await fetch(`https://mcj-parish.hopto.org/api/payments/detail/${detailId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Session-Token': sessionStorage.getItem('token'),
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                },
                credentials: 'include',
            });

            if (response.ok) {
                // Remove from local state instead of refetching
                setPaymentDetails(prev => prev.filter(detail => detail.id !== detailId));
                // Refresh payment info to get updated totals
                await fetchPaymentDetails();
            } else {
                setError('Failed to delete payment detail');
            }
        } catch (error) {
            console.error('Error deleting payment detail:', error);
            setError('Failed to delete payment detail');
        }
    };

    const formatCurrency = (amount) => {
        return `₱ ${Number(amount).toLocaleString("en-US", {minimumFractionDigits: 2})}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    useEffect(() => {
        if (paymentId) {
            fetchPaymentDetails();
        }
    }, [paymentId]);

    if (loading) {
        return (
            <div className="fixed w-screen h-screen top-0 left-0 bg-black/30 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-6">
                    <div className="text-center">Loading payment details...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed w-screen h-screen top-0 left-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg drop-shadow-lg min-w-[60%] max-w-[80%] max-h-[90%] p-6 overflow-y-auto">
                <button onClick={onClose} className="absolute hover:bg-black/10 rounded-full transition-all duration-200 right-4 top-4 text-zinc-700">
                    <IoClose size={35}/>
                </button>

                <div className="text-2xl font-bold mb-4 text-zinc-800 text-center">Payment Details</div>
                <hr className="border-t border-black/20" />

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {paymentInfo && (
                    <div className="mt-4 space-y-4">
                        {/* Payment Overview */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Payment Overview</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <span className="text-sm text-gray-600">Payer:</span>
                                    <div className="font-medium">{paymentInfo.payer}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Total Due:</span>
                                    <div className="font-medium">{formatCurrency(paymentInfo.amount_due)}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Amount Paid:</span>
                                    <div className="font-medium text-green-600">{formatCurrency(paymentInfo.amount_paid)}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Remaining:</span>
                                    <div className="font-medium text-red-600">{formatCurrency(paymentInfo.remaining_balance)}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Maintenance Fee:</span>
                                    <div className="font-medium">{formatCurrency(paymentInfo.maintenance_fee)}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Months Paid:</span>
                                    <div className="font-medium">{paymentInfo.months_paid} month(s)</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Status:</span>
                                    <div className={`font-medium ${
                                        paymentInfo.status === 'Completed' ? 'text-green-600' :
                                        paymentInfo.status === 'Pending' ? 'text-yellow-600' : 'text-gray-600'
                                    }`}>
                                        {paymentInfo.status}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Last Payment:</span>
                                    <div className="font-medium">
                                        {paymentInfo.last_payment_date ? formatDate(paymentInfo.last_payment_date) : 'None'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add Payment Button */}
                        {canAddPayment && !showAddPayment && (
                            <div className="text-center">
                                <button 
                                    onClick={() => setShowAddPayment(true)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                                >
                                    Add Payment
                                </button>
                            </div>
                        )}

                        {/* Add Payment Form */}
                        {showAddPayment && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Add New Payment</h3>
                                <form onSubmit={handleAddPayment} className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Amount</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newPayment.amount}
                                                onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="0.00"
                                                max={paymentInfo.remaining_balance}
                                                required
                                            />
                                            <div className="text-xs text-gray-500 mt-1">
                                                Max: {formatCurrency(paymentInfo.remaining_balance)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Payment Date</label>
                                            <input
                                                type="date"
                                                value={newPayment.payment_date}
                                                onChange={(e) => setNewPayment({...newPayment, payment_date: e.target.value})}
                                                className="w-full border rounded px-3 py-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                            <input
                                                type="text"
                                                value={newPayment.notes}
                                                onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="Payment notes..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            type="submit"
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                        >
                                            Add Payment
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setShowAddPayment(false)}
                                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Payment History */}
                        <div className="overflow-y-auto" style={{maxHeight: '300px'}}>
                            <h3 className="text-lg font-semibold mb-3">Payment History</h3>
                            {paymentDetails.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Added By</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Notes</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paymentDetails.map((detail, index) => (
                                                <tr key={detail.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    {editingPayment && editingPayment.id === detail.id ? (
                                                        // Edit mode
                                                        <>
                                                            <td className="border border-gray-300 px-2 py-2">
                                                                <input
                                                                    type="date"
                                                                    value={editingPayment.payment_date}
                                                                    onChange={(e) => setEditingPayment({...editingPayment, payment_date: e.target.value})}
                                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 px-2 py-2">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={editingPayment.amount}
                                                                    onChange={(e) => setEditingPayment({...editingPayment, amount: e.target.value})}
                                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 px-2 py-2">
                                                                {detail.created_by || 'System'}
                                                            </td>
                                                            <td className="border border-gray-300 px-2 py-2">
                                                                <input
                                                                    type="text"
                                                                    value={editingPayment.notes}
                                                                    onChange={(e) => setEditingPayment({...editingPayment, notes: e.target.value})}
                                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                                    placeholder="Notes..."
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 px-2 py-2">
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={handleUpdatePaymentDetail}
                                                                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs"
                                                                        title="Save"
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingPayment(null)}
                                                                        className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs"
                                                                        title="Cancel"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        // Display mode
                                                        <>
                                                            <td className="border border-gray-300 px-4 py-2">
                                                                {formatDate(detail.payment_date)}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 font-medium">
                                                                {formatCurrency(detail.amount)}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2">
                                                                {detail.created_by || 'System'}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2">
                                                                {detail.notes || '-'}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2">
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleEditPaymentDetail(detail)}
                                                                        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                                        title="Edit Payment"
                                                                    >
                                                                        <FaEdit size={10} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeletePaymentDetail(detail.id)}
                                                                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                                        title="Delete Payment"
                                                                    >
                                                                        <FaTrash size={10} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    No payments have been made yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}