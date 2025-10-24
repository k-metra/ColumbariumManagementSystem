import brand_logo from '../assets/brand_logo.png';
import header_bg from '../assets/header_bg.jpg';
import landing_bg from '../assets/landing_bg.jpg';

import { IoMdMenu } from "react-icons/io";

import NavItem from '../components/home/navItem';
import NavBar from '../components/home/navbar';

import about_img from '../assets/about.jpg';

export default function HomePage() {
    return (
        <div className="w-screen h-screen overflow-y-auto flex-col flex drop-shadow-2xl shadow-2xl">
            <header id="header" className="w-full md:min-h-20 md:py-10 bg-[#003366] flex items-center px-6 text-[#fbfbfb] justify-between">
                <div
                    className="absolute z-[1] top-0 left-0 inset-0 bg-right bg-no-repeat bg-contain opacity-30"
                    style={{ backgroundImage: `linear-gradient(to left, rgba(0,0,0,0) 25%, rgba(100,100,255,0.9) 65%), url(${header_bg})`

                    }}
                />

                <div className="flex flex-row gap-6 p-4 z-[5] items-center">
                    <img src={brand_logo} alt="Brand Logo" className="h-[60px] md:h-[80px]" />
                    <div className="flex flex-col justify-center">
                        <h1 className="text-md md:block md:text-3xl font-semibold">Mary, Cause of Our Joy Parish</h1>
                        <p className="hidden md:block md:text-sm">The Roman Catholic Diocese of Paranaque</p>
                    </div>
                </div>

                <NavBar />
            </header>

                <main id="body" className="min-h-full w-full bg-red-50 z-[50]">
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
                    <section id="about" className="w-full min-h-screen bg-[#f8f9fa] py-16 px-6 md:px-12 lg:px-20">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                {/* Left Column - Image */}
                                <div className="flex justify-center lg:justify-start">
                                    <div className="w-full max-w-md">
                                        <img 
                                            src={about_img}
                                            alt="Our Lady of Perpetual Help" 
                                            className="w-full h-auto rounded-lg shadow-lg"
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Content */}
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-bold text-[#003366] mb-4">About Us</h1>
                                        <div className="w-24 h-1 bg-[#FFD700] mb-8"></div>
                                    </div>

                                    {/* Our Vision */}
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-semibold text-[#4a5568] mb-4">Our Vision</h2>
                                        <p className="text-gray-700 text-lg leading-relaxed">
                                            To be role models to lay young boys and men in the Parish Community to which we are 
                                            called to share in the priestly, prophetic, and royal office of Christ.
                                        </p>
                                    </div>

                                    {/* Our Mission */}
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-semibold text-[#4a5568] mb-4">Our Mission</h2>
                                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                                            As a Parish-Based Ministry, our mission is to support the Priest as an agent of Vocation 
                                            Promotions for the Priesthood. We are committed to:
                                        </p>

                                        <div className="space-y-6">
                                            {/* Our Members */}
                                            <div className="border-l-4 border-[#FFD700] pl-6 py-2">
                                                <h3 className="font-semibold text-[#003366] text-xl mb-2">Our Members:</h3>
                                                <p className="text-gray-700 leading-relaxed">
                                                    We provide an environment that attracts, develops, and rewards committed 
                                                    young lay boys and men to be of service to the Church and the community.
                                                </p>
                                            </div>

                                            {/* Our Officers and Moderators */}
                                            <div className="border-l-4 border-[#FFD700] pl-6 py-2">
                                                <h3 className="font-semibold text-[#003366] text-xl mb-2">Our Officers and Moderators:</h3>
                                                <p className="text-gray-700 leading-relaxed">
                                                    We provide a leading edge in stewardship to enhance and develop values 
                                                    and service for the glory of God.
                                                </p>
                                            </div>

                                            {/* Our Parish Community */}
                                            <div className="border-l-4 border-[#FFD700] pl-6 py-2">
                                                <h3 className="font-semibold text-[#003366] text-xl mb-2">Our Parish Community:</h3>
                                                <p className="text-gray-700 leading-relaxed">
                                                    We provide the community, especially the youth, a training ground 
                                                    to develop future leaders in the Parish.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
        </div>
    )
}