import brand_logo from '../assets/brand_logo.png';
import header_bg from '../assets/header_bg.jpg';
import landing_bg from '../assets/landing_bg.jpg';

import NavItem from '../components/home/navItem';

export default function HomePage() {
    return (
        <div className="w-screen h-screen overflow-auto flex-col flex drop-shadow-2xl shadow-2xl">
            <header id="header" className="w-full md:min-h-16 sm:min-h-3 md:py-5 sm:py-1 bg-[#003366] flex items-center px-6 text-[#fbfbfb] justify-between">
                <div
                    className="absolute z-[1] top-0 left-0 inset-0 bg-right bg-no-repeat bg-contain opacity-30"
                    style={{ backgroundImage: `linear-gradient(to left, rgba(0,0,0,0) 25%, rgba(100,100,255,0.9) 65%), url(${header_bg})`
                
                }}  
                />

                <div className="flex flex-row gap-6 pl-4 z-[5] items-center">
                    <img src={brand_logo} alt="Brand Logo" className="md:h-[80px] sm:h-[48px]" />
                    <div className="flex flex-col justify-center">
                        <h1 className="md:text-3xl max-[420px]:font-sm font-semibold">Mary, Cause of Our Joy Parish</h1>
                        <p className="text-sm">The Roman Catholic Diocese of Paranaque</p>
                    </div>
                </div>

                <nav className="z-[5] pr-8">
                    <ul className="flex flex-row">
                        <NavItem href="#about">About</NavItem>
                        <NavItem href="#services">Services</NavItem>
                        <NavItem href="#gallery">Gallery</NavItem>
                        <NavItem href="#contact">Contact</NavItem>
                    </ul>
                </nav>
            </header>

                <main id="body" className="h-screen w-screen bg-red-50 z-[50]">
                    <section className="w-full h-full relative" id="landing">
                        <div className="w-full h-full relative">
                            <img className="w-full h-full object-cover" src={landing_bg} />
                        </div>

                        <div className="absolute top-1/2 left-1/2 text-center z-[80] -translate-x-1/2 -translate-y-1/2 text-white">
                            <h1 className="font-semibold text-4xl text-shadow-lg/30">Columbarium and the Mortuary</h1>
                            <h2 className='text-lg text-shadow-lg/30'>Your loved ones deserve better peace and a place to rest. Let us provide them just that.</h2>
                            <a href="https://www.facebook.com/mcjparish" className="inline-block mt-4 px-6 font-semibold cursor-pointer py-2 border text-[#003366] drop-shadow-2xl bg-[#FFD700] border-[#003366] rounded hover:bg-[#003366] hover:text-[#FFD700] hover:border-[#FFD700] transition">Learn More</a>
                        </div>
                    </section>
                </main>
        </div>
    )
}