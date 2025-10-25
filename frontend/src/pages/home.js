import brand_logo from '../assets/brand_logo.png';
import header_bg from '../assets/header_bg.jpg';
import landing_bg from '../assets/landing_bg.jpg';



import { IoMdMenu } from "react-icons/io";

import NavItem from '../components/home/navItem';
import NavBar from '../components/home/navbar';

import about_img from '../assets/about.jpg';
import gallery1 from '../assets/gallery1.jpg';
import gallery2 from '../assets/gallery2.jpg';
import gallery3 from '../assets/gallery3.jpg';
import gallery4 from '../assets/gallery4.jpg';
import gallery5 from '../assets/gallery5.jpg';
import gallery6 from '../assets/gallery6.jpg';
import gallery7 from '../assets/gallery7.jpg';
import gallery8 from '../assets/gallery8.jpg';
import gallery9 from '../assets/gallery9.jpg';
import gallery10 from '../assets/gallery10.jpg';

import { FaFacebook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaPhoneFlip } from "react-icons/fa6";

import fbpage_bg from '../assets/fbpage_bg.png';

export default function HomePage() {

    const NICHE_PDF_URL = "https://drive.google.com/drive/folders/1nzre21PcbtsEofHwm-AMZeO3haGa4GHU?usp=drive_link"

    const handleImageClick = (e) => {
        const src = e.target.src;

        window.open(src);
    }

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
                    <section id="gallery" className="min-h-screen w-full bg-white py-16 px-6 md:px-12">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold text-[#003366] mb-8 text-center">Gallery</h1>
                            <p className="text-center text-zinc-700 mb-12 max-w-2xl mx-auto">
                                A glimpse into our serene columbarium and mortuary facilities, designed to provide a peaceful resting place for your loved ones.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {/* Gallery Images */}
                                <div className="overflow-hidden rounded-lg shadow-lg">
                                    <img src={gallery1} alt="Gallery Image 1" className="w-full cursor-pointer h-auto transform hover:scale-105 transition-transform duration-300" onClick={handleImageClick} />
                                </div>
                                <div className="overflow-hidden rounded-lg shadow-lg">
                                    <img src={gallery2} alt="Gallery Image 2" className="w-full cursor-pointer h-auto transform hover:scale-105 transition-transform duration-300" onClick={handleImageClick} />
                                </div>
                                <div className="overflow-hidden rounded-lg shadow-lg">
                                    <img src={gallery3} alt="Gallery Image 3" className="w-full cursor-pointer h-auto transform hover:scale-105 transition-transform duration-300" onClick={handleImageClick} />
                                </div>
                                <div className="overflow-hidden rounded-lg shadow-lg">
                                    <img src={gallery4} alt="Gallery Image 4" className="w-full cursor-pointer h-auto transform hover:scale-105 transition-transform duration-300" onClick={handleImageClick} />
                                </div>
                                <div className="overflow-hidden rounded-lg shadow-lg">
                                    <img src={gallery5} alt="Gallery Image 5" className="w-full cursor-pointer h-auto transform hover:scale-105 transition-transform duration-300" onClick={handleImageClick} />
                                </div>
                                <div className="overflow-hidden rounded-lg shadow-lg">
                                    <img src={gallery6} alt="Gallery Image 6" className="w-full cursor-pointer h-auto transform hover:scale-105 transition-transform duration-300" onClick={handleImageClick} />
                                </div>
                                <div className="overflow-hidden rounded-lg shadow-lg">
                                    <img src={gallery7} alt="Gallery Image 7" className="w-full cursor-pointer h-auto transform hover:scale-105 transition-transform duration-300" onClick={handleImageClick} />
                                </div>
                                <div className="overflow-hidden rounded-lg shadow-lg">
                                    <img src={gallery8} alt="Gallery Image 8" className="w-full cursor-pointer h-auto transform hover:scale-105 transition-transform duration-300" onClick={handleImageClick} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="services" className="w-full min-h-screen bg-[#f8f9fa] py-16 px-2 md:px-12 lg:px-20">
                        <div className="max-w-7xl mx-auto text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-[#003366] mb-8">Our Services</h1>

                            <hr className="w-[80%] justify-self-center border-t border-blue-600"/>
                        </div>
                        <div className="mx-11 mb-4 max-w-7xl">
                            <h1 className="text-2xl text-center md:text-left md:text-3xl font-semibold text-cyan-900 mb-4">Columbarium Services</h1>
                            <p className="text-slate-800 mx-0 md:mx-4 text-lg indent-6 leading-relaxed mb-6">
                                Our columbarium services offer a peaceful and respectful resting place for your loved ones. We have various niches available in different sizes and locations to suit your preferences. You can choose from our regular and VIP niches, as well as glass-encased options.
                            </p>
                            <p className="text-slate-800 mx-0 md:mx-4 text-lg indent-6 leading-relaxed">
                                We also provide assistance with the necessary documentation and arrangements for interment. Our dedicated staff will guide you through the process to ensure everything is handled with care and professionalism. Contact us for more details or to make a reservation. We aim to provide a serene environment where your loved ones can rest in peace, and where families can come together in remembrance.
                            </p>
                        </div>
                        <div className="mx-11 max-w-7xl">
                            <h1 className="text-2xl md:text-3xl font-semibold text-cyan-900 mb-4">Available Niches</h1>
                            <p className="text-slate-800 mx-0 md:mx-4 text-lg indent-6 leading-relaxed mb-6">
                                We offer a variety of niches in our peaceful columbarium for the placement of urns. Select from different sizes and locations based on your preference and availability. Our niches are designed to provide a serene resting place for your loved ones, with options including regular niches, VIP niches, and glass-encased niches. Each niche is crafted with care to ensure a dignified and respectful environment.
                            </p>
                            
                            
                        </div>
                        <div className="mx-11 max-w-7xl">
                            <h1 className="text-2xl md:text-3xl mx-0 md:mx-4 font-semibold text-cyan-900 mb-4">Niche Fees</h1>
                            <p className="text-slate-800 mx-0 md:mx-4 text-lg indent-6 leading-relaxed mb-6">
                                Our niche fees vary depending on the size, location, and type of niche selected. You may click the link below for a link download to the PDF file for the complete list of our niche fees.
                            </p>

                            <div className="my-8 w-full flex justify-center">
                                <button onClick={() => window.open(NICHE_PDF_URL)} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 transition-transform-colors duration-300 ease-out">
                                    Download Niche Fees
                                </button>
                            </div>

                            <p className="text-slate-800 mx-0 md:mx-4 text-lg indent-6 leading-relaxed">
                                For specific pricing details and to discuss your requirements, please contact our office directly. Our staff will be happy to assist you in selecting the right niche and provide you with all the necessary information regarding fees and payment options.
                            </p>
                        </div>
                    </section>

                    <section id="announcements" className="w-full min-h-[50vh] bg-white py-16 px-6 md:px-12 lg:px-20">
                        <div className="max-w-7xl mx-auto text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-[#003366] mb-8">Announcements & Events</h1>
                            <p className="text-lg text-slate-800">To stay tuned for the latest updates and events, you may check us out on our <a className="underline underline-offset-2 text-blue-600 font-semibold hover:text-blue-900 hover:underline-offset-8 transition-transform-colors duration-300 ease-out" href="https://www.facebook.com/mcjparish/" target="_blank">Facebook page</a> where we regularly post news and information.</p>

                            <img src={fbpage_bg} alt="Facebook Page" className="w-full self-center  justify-self-center md:w-1/2 mt-8 rounded-lg shadow-lg" />
                        </div>
                    </section>

                    <section id="contact" className="w-full min-h-screen bg-blue-950 py-16 px-6 md:px-12 lg:px-20">
                        <div className="max-w-7xl mx-auto text-center mb-8">
                            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">Contact Us</h1>
                        </div>

                        <div className="flex flex-row gap-8 text-white w-[90%] mx-auto mb-8 justify-center items-center">
                            <a className="hover:font-semibold cursor-pointer hover:-translate-y-0.5 transition-transform-colors duration-300 ease-out">
                                <FaFacebook size={30} className="inline-block mr-2 mb-1"/> Facebook: <span className="underline underline-offset-2 hover:underline-offset-4">mcjparish</span>
                            </a>
                            <a className="hover:font-semibold cursor-pointer hover:-translate-y-0.5 transition-transform-colors duration-300 ease-out">
                                <FaPhoneFlip size={30} className="inline-block mr-2 mb-1"/> Phone: <span className="underline underline-offset-2 hover:underline-offset-4">+632 8251 871</span>
                            </a>
                            <a className="hover:font-semibold cursor-pointer hover:-translate-y-0.5 transition-transform-colors duration-300 ease-out">
                                <MdEmail size={30} className="inline-block mr-2 mb-1"/> Email: <span className="underline underline-offset-2 hover:underline-offset-4">info@example.com</span>
                            </a>
                        </div>

                         <div className="w-full flex justify-center items-center mt-8">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3864.4471549278214!2d121.03256567414589!3d14.401367681925306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d05360582529%3A0xedc43c6e31a52381!2sMary%2C%20Cause%20of%20Our%20Joy%20Parish!5e0!3m2!1sen!2sph!4v1761380995133!5m2!1sen!2sph"
                                    width="600"
                                    height="450"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                ></iframe>
                            </div>
                    </section>
                </main>
        </div>
    )
}