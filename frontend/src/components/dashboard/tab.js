import Icon from '../icon'

export default function Tab({ children, onClick, icon }) {
    return (
        <button onClick={onClick} className="p-2 py-3 border-b border-black/5 transition-all duration-500 ease-out text-left rounded-sm hover:bg-black/10 text-zinc-700">
            <Icon icon={icon} className="mr-3"></Icon>
            {children}
        </button>
    )
}