import { useState, useRef, useEffect } from 'react';
import { IoMdMenu, IoMdClose } from "react-icons/io";

const NavigationItems = {
    about: {
        label: "About",
        href: "#about"
    },
    services: {
        label: "Services",
        href: "#services"
    },
    gallery: {
        label: "Gallery",
        href: "#gallery"
    },
    contact: {
        label: "Contact",
        href: "#contact"
    }
} 

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(true);
    const buttonRef = useRef(null);
    const sidebarRef = useRef(null);
    

    const toggleMenu = () => {
        setIsOpen(prev => !prev);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('touchstart', handleClickOutside);
        }
    })

    return (
        <>
        <div className="md:hidden z-[5]">
            <button ref={buttonRef} onClick={toggleMenu} className="p-2 rounded-full">
                {isOpen ? <IoMdClose size={32}/> : <IoMdMenu size={32} />}
            </button>
        </div>

        <div className="hidden md:flex md:flex-row md:gap-6 md:p-4 md:z-[5] md:items-center">
            {Object.values(NavigationItems).map((item) => (
                <a key={item.href} href={item.href} className="text-white hover:text-blue-300">
                    {item.label}
                </a>
            ))}
        </div>

            <nav ref={sidebarRef} className={`md:hidden absolute z-[100] ${isOpen ? 'translate-x-0' : 'translate-x-full'} right-0 top-[90px] min-h-screen min-w-44 transition-transform duration-200 ease-out bg-white border-t border-gray-200`}>
                <ul className="flex flex-col p-4 gap-4">
                    {Object.values(NavigationItems).map((item) => (
                        <li key={item.href}>
                            <a href={item.href} className="text-gray-800 hover:text-blue-600" onClick={toggleMenu}>
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    )
}
