import { useState } from 'react';
import LoadingPage from '../../pages/loading';

export default function HoldersGrid({ 
    holders = [], 
    searchQuery = '', 
    selectedItems = [], 
    onSelectHolder, 
    onViewHolder, 
    loading = false 
}) {
    // Filter holders based on search query
    const filteredHolders = holders.filter(holder => {
        const searchLower = searchQuery.toLowerCase();
        return (
            (holder.name || '').toLowerCase().includes(searchLower) ||
            (holder.email || '').toLowerCase().includes(searchLower) ||
            (holder.contactNumber || '').toLowerCase().includes(searchLower) ||
            (holder.address || '').toLowerCase().includes(searchLower) ||
            // Search by niche count
            (holder.nicheCount && holder.nicheCount.toString().includes(searchLower)) ||
            // Search by total deceased count
            (holder.totalDeceasedCount && holder.totalDeceasedCount.toString().includes(searchLower)) ||
            // Legacy fields for backward compatibility
            (holder.deceasedName || '').toLowerCase().includes(searchLower) ||
            (holder.nicheLocation || '').toLowerCase().includes(searchLower) ||
            (holder.nicheType || '').toLowerCase().includes(searchLower) ||
            (holder.relationshipToDeceased || '').toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return <LoadingPage />;
    }

    if (filteredHolders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 text-6xl mb-4">
                    <i className="fa-solid fa-users"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {searchQuery ? 'No holders found' : 'No holders yet'}
                </h3>
                <p className="text-gray-500">
                    {searchQuery 
                        ? `No holders match "${searchQuery}"`
                        : 'Add your first holder to get started'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHolders.map((holder) => {
                const isSelected = selectedItems.includes(holder.id);
                
                return (
                    <div
                        key={holder.id}
                        className={`relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 cursor-pointer ${
                            isSelected 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => onSelectHolder && onSelectHolder(holder.id)}
                    >
                        {/* Profile Header */}
                        <div className="p-6">
                            {/* Profile Avatar/Image */}
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {(holder.name || 'H').charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {/* Holder Info */}
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {holder.name || 'Unnamed Holder'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    ID: #{(holder.id || '').toString().padStart(3, '0')}
                                </p>
                            </div>

                            {/* Quick Info */}
                            <div className="space-y-2 mb-4">
                                {holder.contactNumber && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fa-solid fa-phone w-4 text-blue-500 mr-2"></i>
                                        <span className="truncate">{holder.contactNumber}</span>
                                    </div>
                                )}
                                {holder.email && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fa-solid fa-envelope w-4 text-green-500 mr-2"></i>
                                        <span className="truncate">{holder.email}</span>
                                    </div>
                                )}
                                
                                {/* Show niche count - handle undefined values from API */}
                                {holder.nicheCount && holder.nicheCount > 0 ? (
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <i className="fa-solid fa-building w-4 text-purple-500 mr-2"></i>
                                            <span>
                                                {holder.nicheCount} Niche{holder.nicheCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                                            (holder.totalDeceasedCount || 0) === 0 ? 'bg-green-100 text-green-800' :
                                            (holder.totalDeceasedCount || 0) >= (4 * (holder.nicheCount || 1)) ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {holder.totalDeceasedCount || 0} Occupant{(holder.totalDeceasedCount || 0) !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                ): null}

                                {/* Legacy fields - keep for backwards compatibility but hide if new data exists */}
                                {(!holder.nicheCount || holder.nicheCount === 0) && holder.nicheLocation && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fa-solid fa-map-marker-alt w-4 text-purple-500 mr-2"></i>
                                        <span className="truncate">{holder.nicheLocation}</span>
                                    </div>
                                )}
                                {(!holder.nicheCount || holder.nicheCount === 0) && holder.deceasedName && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fa-solid fa-heart w-4 text-red-500 mr-2"></i>
                                        <span className="truncate">For: {holder.deceasedName}</span>
                                    </div>
                                )}
                                {(!holder.nicheCount || holder.nicheCount === 0) && holder.nicheType && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <i className="fa-solid fa-cube w-4 text-indigo-500 mr-2"></i>
                                        <span className="truncate">{holder.nicheType} Niche</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewHolder && onViewHolder(holder);
                                    }}
                                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                >
                                    <i className="fa-solid fa-eye mr-1"></i>
                                    View Details
                                </button>
                            </div>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <i className="fa-solid fa-check text-white text-xs"></i>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}