import { IoClose } from "react-icons/io5";

export default function ErrorModal({ isOpen, title, message, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed w-screen h-screen top-0 left-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg drop-shadow-lg min-w-[30%] max-w-[50%] p-6">
                <button onClick={onClose} className="absolute hover:bg-black/10 rounded-full transition-all duration-200 right-4 top-4 text-zinc-700">
                    <IoClose size={25}/>
                </button>

                <div className="text-xl font-bold mb-4 text-red-600 text-center">{title || "Error"}</div>
                <hr className="border-t border-black/20" />
                
                <div className="mt-4 text-center">
                    <p className="text-gray-700 mb-4">{message}</p>
                    <button 
                        onClick={onClose}
                        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}