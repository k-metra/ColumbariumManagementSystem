import { IoClose } from "react-icons/io5";
import { useEffect, useState, useRef } from 'react';
import NicheForm from './NicheForm';
import DeceasedForm from './DeceasedForm';

export default function CustomerModal({ info, onClose }) {
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageSrc, setImageSrc] = useState('');
    const [activeTab, setActiveTab] = useState('holder');
    const [niches, setNiches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNiche, setSelectedNiche] = useState(null);
    const [showNicheForm, setShowNicheForm] = useState(false);
    const [showDeceasedForm, setShowDeceasedForm] = useState(false);
    const [editingNiche, setEditingNiche] = useState(null);
    const [editingDeceased, setEditingDeceased] = useState(null);
    const imageModalRef = useRef(null);

    // Fetch niches for this holder
    const fetchNiches = async () => {
        if (!info?.id) return;
        
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/niches/list-holder/?holder_id=${info.id}`, {
                headers: {
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setNiches(data);
            } else {
                console.error('Failed to fetch niches:', response.status);
                setNiches([]);
            }
        } catch (error) {
            console.error('Error fetching niches:', error);
            setNiches([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (info?.id) {
            fetchNiches();
        }
    }, [info?.id]);

    const handleImageClick = (src) => {
        setImageSrc(src);
        setShowImageModal(true);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (imageModalRef.current && !imageModalRef.current.contains(e.target)) {
                setShowImageModal(false);
            }
        };

        if (showImageModal) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showImageModal]);

    // Helper functions
    const getImageUrl = (relativePath) => {
        if (!relativePath || relativePath === "Not Found") return null;
        if (relativePath.startsWith('http')) return relativePath;
        const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
        return `http://localhost:8000/${cleanPath}`;
    };

    const getFileType = (filePath) => {
        if (!filePath) return null;
        const extension = filePath.toLowerCase().split('.').pop();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        const pdfExtensions = ['pdf'];
        
        if (imageExtensions.includes(extension)) return 'image';
        if (pdfExtensions.includes(extension)) return 'pdf';
        return 'unknown';
    };

    const renderFileContent = (filePath, fileUrl) => {
        const fileType = getFileType(filePath);
        
        switch (fileType) {
            case 'image':
                return (
                    <div className="flex justify-center mt-4">
                        <img 
                            src={fileUrl} 
                            alt="Document" 
                            className="max-h-[300px] object-contain cursor-pointer border" 
                            onClick={() => handleImageClick(fileUrl)}
                            onError={(e) => {
                                console.error('Failed to load image:', fileUrl);
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div style={{display: 'none'}} className="text-center text-red-600 p-4 bg-red-50 rounded">
                            <p>Failed to load image</p>
                            <p className="text-sm text-gray-600">URL: {fileUrl}</p>
                        </div>
                    </div>
                );
            case 'pdf':
                return (
                    <div className="flex flex-col items-center mt-4">
                        <iframe
                            src={fileUrl}
                            className="w-full h-[400px] border"
                            title="Document PDF"
                        />
                        <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                            Open PDF in New Tab
                        </a>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center mt-4">
                        <div className="text-center text-zinc-600 mb-2">
                            File type not supported for preview
                        </div>
                        <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                        >
                            Download File
                        </a>
                    </div>
                );
        }
    };

    // Add/Edit/Delete handlers
    const handleAddNiche = () => {
        setEditingNiche(null);
        setShowNicheForm(true);
    };

    const handleEditNiche = (niche) => {
        setEditingNiche(niche);
        setShowNicheForm(true);
    };

    const handleDeleteNiche = async (nicheId) => {
        if (!window.confirm('Are you sure you want to delete this niche? This will also delete all deceased records in this niche.')) return;
        
        try {
            const response = await fetch('http://localhost:8000/api/niches/delete/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                },
                body: JSON.stringify({ element_ids: [nicheId] })
            });
            
            if (response.ok) {
                fetchNiches(); // Refresh niches list
            } else {
                alert('Failed to delete niche');
            }
        } catch (error) {
            console.error('Error deleting niche:', error);
            alert('Error deleting niche');
        }
    };

    const handleAddDeceased = (niche) => {
        setSelectedNiche(niche);
        setEditingDeceased(null);
        setShowDeceasedForm(true);
    };

    const handleEditDeceased = (deceased, niche) => {
        setSelectedNiche(niche);
        setEditingDeceased(deceased);
        setShowDeceasedForm(true);
    };

    const handleDeleteDeceased = async (deceasedId) => {
        if (!window.confirm('Are you sure you want to delete this deceased record?')) return;
        
        try {
            const response = await fetch('http://localhost:8000/api/niches/deceased/delete/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Session ${sessionStorage.getItem('token')}`,
                    'Session-Token': sessionStorage.getItem('token')
                },
                body: JSON.stringify({ element_ids: [deceasedId] })
            });
            
            if (response.ok) {
                fetchNiches(); // Refresh niches list
            } else {
                alert('Failed to delete deceased record');
            }
        } catch (error) {
            console.error('Error deleting deceased:', error);
            alert('Error deleting deceased record');
        }
    };

    const memorandumPath = info?.memorandumOfAgreement || info?.memorandum_of_agreement;
    const memorandumUrl = getImageUrl(memorandumPath);
    return (
        <>
            <div className="fixed w-screen h-screen top-0 left-0 bg-black/30 flex justify-center items-center z-50">
                <div className="bg-white overflow-y-auto rounded-lg drop-shadow-lg min-w-[60%] max-h-[90vh] max-w-[95%] p-6">
                    <button onClick={onClose} className="absolute hover:bg-black/10 rounded-full transition-all duration-200 right-4 top-4 text-zinc-700">
                        <IoClose size={35}/>
                    </button>

                    <div className="text-2xl font-bold mb-4 text-zinc-800 text-center">Holder Management</div>
                    
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab('holder')}
                            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                                activeTab === 'holder'
                                    ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <i className="fa-solid fa-user mr-2"></i>
                            Holder Info
                        </button>
                        <button
                            onClick={() => setActiveTab('niches')}
                            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                                activeTab === 'niches'
                                    ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <i className="fa-solid fa-building mr-2"></i>
                            Niches ({niches.length}/4)
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                                activeTab === 'documents'
                                    ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <i className="fa-solid fa-file-alt mr-2"></i>
                            Documents
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'holder' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Holder Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <span className="font-semibold text-gray-700">Full Name:</span>
                                        <p className="text-gray-600 ml-2">{info?.name || 'Name Not Found'}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Email:</span>
                                        <p className="text-gray-600 ml-2">{info?.email || 'Email Not Found'}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="font-semibold text-gray-700">Contact Number:</span>
                                        <p className="text-gray-600 ml-2">{info?.contact_number || info?.contactNumber || 'Contact Not Found'}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Address:</span>
                                        <p className="text-gray-600 ml-2">{info?.address || 'Address Not Found'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'niches' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800">Niches</h2>
                                <button
                                    onClick={handleAddNiche}
                                    disabled={niches.length >= 4}
                                    className={`px-4 py-2 rounded text-white font-medium transition-colors ${
                                        niches.length >= 4
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                >
                                    <i className="fa-solid fa-plus mr-2"></i>
                                    Add Niche {niches.length >= 4 ? '(Limit Reached)' : ''}
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">Loading niches...</div>
                            ) : niches.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No niches found for this holder.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {niches.map((niche) => (
                                        <div key={niche.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">{niche.location}</h3>
                                                    <div className="flex gap-4 text-sm text-gray-600">
                                                        <span>Type: {niche.niche_type}</span>
                                                        <span>Status: <span 
                                                            className={`px-2 py-1 rounded text-xs ${
                                                                niche.status === 'Available' ? 'bg-green-100 text-green-800' :
                                                                niche.status === 'Occupied' ? 'bg-yellow-100 text-yellow-800' :
                                                                niche.status === 'Full' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}
                                                            title="Status is automatically calculated based on occupancy"
                                                        >{niche.status}</span></span>
                                                        <span>Deceased: {niche.deceased_count}/4</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditNiche(niche)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                                    >
                                                        <i className="fa-solid fa-edit mr-1"></i>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNiche(niche.id)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                    >
                                                        <i className="fa-solid fa-trash mr-1"></i>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Deceased records for this niche */}
                                            <div className="mt-4 border-t border-gray-100 pt-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="text-md font-semibold text-gray-700">Deceased Records</h4>
                                                    <button
                                                        onClick={() => handleAddDeceased(niche)}
                                                        disabled={niche.deceased_count >= 4}
                                                        className={`px-3 py-1 rounded text-white text-sm transition-colors ${
                                                            niche.deceased_count >= 4
                                                                ? 'bg-gray-400 cursor-not-allowed'
                                                                : 'bg-green-500 hover:bg-green-600'
                                                        }`}
                                                    >
                                                        <i className="fa-solid fa-plus mr-1"></i>
                                                        Add Deceased {niche.deceased_count >= 4 ? '(Full)' : ''}
                                                    </button>
                                                </div>

                                                {niche.deceased_records?.length === 0 ? (
                                                    <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded">
                                                        No deceased records in this niche.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {niche.deceased_records?.map((deceased) => (
                                                            <div key={deceased.id} className="bg-gray-50 p-3 rounded border">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <h5 className="font-medium text-gray-800">{deceased.name}</h5>
                                                                        <div className="text-xs text-gray-600 space-y-1">
                                                                            {deceased.date_of_death && (
                                                                                <div>Death: {new Date(deceased.date_of_death).toLocaleDateString()}</div>
                                                                            )}
                                                                            {deceased.interment_date && (
                                                                                <div>Interment: {new Date(deceased.interment_date).toLocaleDateString()}</div>
                                                                            )}
                                                                            {deceased.relationship_to_holder && (
                                                                                <div>Relation: {deceased.relationship_to_holder}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-1 ml-2">
                                                                        <button
                                                                            onClick={() => handleEditDeceased(deceased, niche)}
                                                                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                                                        >
                                                                            <i className="fa-solid fa-edit"></i>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteDeceased(deceased.id)}
                                                                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                                        >
                                                                            <i className="fa-solid fa-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Documents</h2>
                            
                            {/* Memorandum of Agreement (Holder level) */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Memorandum of Agreement</h3>
                                {memorandumUrl ? (
                                    renderFileContent(memorandumPath, memorandumUrl)
                                ) : (
                                    <div className="text-center text-zinc-600 p-4 bg-gray-50 rounded">
                                        No Memorandum of Agreement Uploaded.
                                    </div>
                                )}
                            </div>

                            <hr className="border-gray-200" />

                            {/* Death Certificates (Per deceased) */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Death Certificates</h3>
                                {niches.length === 0 ? (
                                    <div className="text-center text-zinc-600 p-4 bg-gray-50 rounded">
                                        No niches found for this holder.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {niches.map((niche) => (
                                            niche.deceased_records?.length > 0 && (
                                                <div key={niche.id} className="border border-gray-200 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-800 mb-3">Niche: {niche.location}</h4>
                                                    <div className="space-y-4">
                                                        {niche.deceased_records.map((deceased) => (
                                                            <div key={deceased.id} className="bg-gray-50 p-3 rounded">
                                                                <h5 className="font-medium text-gray-700 mb-2">{deceased.name}</h5>
                                                                {deceased.death_certificate ? (
                                                                    renderFileContent(deceased.death_certificate, getImageUrl(deceased.death_certificate))
                                                                ) : (
                                                                    <div className="text-center text-zinc-600 p-2 bg-gray-100 rounded text-sm">
                                                                        No Death Certificate Uploaded
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                        {niches.every(niche => !niche.deceased_records?.length) && (
                                            <div className="text-center text-zinc-600 p-4 bg-gray-50 rounded">
                                                No deceased records found across all niches.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Modal */}
            {showImageModal && (
                <div className="bg-black/80 fixed top-0 left-0 w-screen h-screen flex justify-center items-center z-[500]">
                    <div className="absolute right-1 top-1 p-4 cursor-pointer text-white hover:bg-white/20 rounded-full">
                        <IoClose size={35} onClick={() => setShowImageModal(false)} />
                    </div> 
                    <div className="max-w-[90%] max-h-[90%] flex justify-center items-center">
                        <img ref={imageModalRef} src={imageSrc} alt="Enlarged Document" className="max-w-full max-h-full object-contain" />
                    </div> 
                </div>
            )}

            {/* Niche Form Modal */}
            {showNicheForm && (
                <NicheForm
                    niche={editingNiche}
                    holder={info}
                    onSave={(savedNiche) => {
                        setShowNicheForm(false);
                        setEditingNiche(null);
                        fetchNiches(); // Refresh the niches list
                    }}
                    onCancel={() => {
                        setShowNicheForm(false);
                        setEditingNiche(null);
                    }}
                />
            )}

            {/* Deceased Form Modal */}
            {showDeceasedForm && (
                <DeceasedForm
                    deceased={editingDeceased}
                    niche={selectedNiche}
                    onSave={(savedDeceased) => {
                        setShowDeceasedForm(false);
                        setEditingDeceased(null);
                        setSelectedNiche(null);
                        fetchNiches(); // Refresh to show updated deceased count
                    }}
                    onCancel={() => {
                        setShowDeceasedForm(false);
                        setEditingDeceased(null);
                        setSelectedNiche(null);
                    }}
                />
            )}
        </>
    );
}