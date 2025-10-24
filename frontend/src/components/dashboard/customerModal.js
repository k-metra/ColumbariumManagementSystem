import { IoClose } from "react-icons/io5";

import { useEffect, useState, useRef } from 'react';

export default function CustomerModal({ info, onClose }) {
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageSrc, setImageSrc] = useState('');
    const imageModalRef = useRef(null);

    info = info || {
        name: "Not Found",
        email: "Not Found",
        address: "Not Found",
        deceasedName: "Not Found",
        dateOfDeath: "Not Found",
        relationshipToDeceased: "Not Found",
        memorandumOfAgreement: "Not Found"
    }

    const handleImageClick = (e) => {
        const src = e.target.src;

        setImageSrc(src);
        setShowImageModal(true);
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (imageModalRef.current && !imageModalRef.current.contains(e.target)) {
                setShowImageModal(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    })

    // Helper function to construct full image URL
    const getImageUrl = (relativePath) => {
        if (!relativePath || relativePath === "Not Found") return null;
        // If it's already a full URL, return as is
        if (relativePath.startsWith('http')) return relativePath;
        // Otherwise, construct full URL with backend server
        return `http://localhost:8000${relativePath}`;
    };

    const memorandumPath = info.memorandumOfAgreement || info.memorandum_of_agreement;
    const memorandumUrl = getImageUrl(memorandumPath);

    console.log('CustomerModal info', info);
    return (
        <>
        <div className="fixed w-screen h-screen top-0 left-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white overflow-y-auto rounded-lg drop-shadow-lg min-w-[10%] max-h-[80vh] min-h-[15%] max-w-[70%] p-6">
                <button onClick={onClose} className="absolute hover:bg-black/10 rounded-full transition-all duration-200 right-4 top-4 text-zinc-700">
                    <IoClose size={35}/>
                </button>

                <div className="text-2xl font-bold mb-4 text-zinc-800 text-center">Customer Details</div>
                <hr className="border-t border-black/20" />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer details content goes here */}
                    <div className="text-lg text-zinc-800 border-r border-black/5 px-6 py-2">
                        <h1 className="text-2xl text-center mb-4 font-bold">Customer Information</h1>
                        <span className="font-semibold">Full Name:</span>
                        <span className="ml-2">{ info.name ?? 'Name Not Found'}</span>
                        <br />
                        <span className=" font-semibold">Email: </span>
                        <span className="ml-2">{info.email ?? 'Email Not Found'}</span>
                        <br />
                        <span className="font-semibold">Address: </span>
                        <span className="ml-2">{info.address ?? 'Address Not Found'}</span>
                    </div>
                    <div className="text-lg text-zinc-800 px-6 py-2">
                        <h1 className="text-2xl text-center mb-4 font-bold">Deceased Information</h1>
                        <span className="font-semibold">Full Name: </span>
                        <span className="ml-2">{info.deceasedName ?? 'Name Not Found'}</span>
                        <br />
                        <span className="font-semibold">Date of Death: </span>
                        <span className="ml-2">{info.deceasedDate ?? 'Date Not Found'}</span>
                        <br />
                        <span className="font-semibold">Relationship: </span>
                        <span className="ml-2">{info.relationshipToDeceased ?? 'Relationship Not Found'}</span>
                    </div>
                </div>
                <hr className="border-t my-4 border-black/20"/>
                <span className="text-2xl block text-zinc-800 font-semibold text-center">Memorandum of Agreement</span>

                {/* Memorandum of Agreement here */}
                {
                    memorandumUrl ? (
                        <div className="flex justify-center mt-4">
                            <img src={memorandumUrl} alt="Memorandum of Agreement" className="max-h-[400px] object-contain cursor-pointer border" onClick={handleImageClick}/>
                        </div>
                    ) : (
                        <div className="text-center text-zinc-600 mt-4">No Memorandum of Agreement Uploaded.</div>
                    )
                }
            </div>
        </div>
        {showImageModal && (
            <div className="bg-black/80 fixed top-0 left-0 w-screen h-screen flex justify-center items-center z-[500]">
                <div className="absolute right-1 top-1 p-4 cursor-pointer text-white hover:bg-white/20 rounded-full">
                    <IoClose size={35} onClick={() => setShowImageModal(false)} />
                </div> 
                <div className="max-w-[90%] max-h-[90%] flex justify-center items-center">
                    <img ref={imageModalRef} src={imageSrc} alt="Enlarged Memorandum of Agreement" className="max-w-full max-h-full object-contain" />
                </div> 
            </div>
        )}

        </>
    )
}