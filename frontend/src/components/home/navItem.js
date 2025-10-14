export default function NavItem({ href, children }) {
    return (
        <li className="border-r border-white/80 text-center px-4 hover:underline">
            <a href={href}>{children}</a>
        </li>
    )
}