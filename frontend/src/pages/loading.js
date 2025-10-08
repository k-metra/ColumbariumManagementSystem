import  loading_ring  from '../assets/loading_ring.png';

export default function LoadingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#fbfbfb]">
            <img className="animate-spin max-h-[6%] max-w-[6%]" src={loading_ring} alt="Loading..." />
        </div>
    )
}