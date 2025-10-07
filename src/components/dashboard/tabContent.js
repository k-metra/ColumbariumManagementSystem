import Icon from "../../components/icon";
import Table from './table';

// Reusable panel for tab content: header, search, toolbar, and table.
export default function TabContent({
    title,
    searchQuery,
    onSearchChange,
    toolbarButtons = [],
    columns = [],
    data = [],
    selectedItems = [],
    onSelectAll,
    onSelectRow,
    getRowKey,
    children // row renderer: function(row) => JSX
}) {
    return (
        <div className="w-full h-full flex flex-col">
            <h2 className="text-2xl ml-2 font-bold text-zinc-700">{title}</h2>
            <input value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} id="search" className="bg-slate-50 border border-black/10 rounded-lg self-center h-12 w-[60%] text-zinc-700 outline-none px-3" placeholder="Search..."></input>

            <div className="flex flex-row gap-2 self-center items-center justify-center border-b border-black/12 py-3 px-10 pt-4 mb-6">
                {toolbarButtons.map((btn, idx) => (
                    <button key={idx} onClick={btn.onClick} className={`rounded-lg ${btn.bg || 'bg-[#fbfbfb]'} ${btn.textClass || 'text-zinc-700'} p-2 px-4 hover:opacity-70 transition-all duration-300 ease-out`}>
                        {btn.icon && <Icon icon={btn.icon} className="mr-2" />}
                        {btn.label}
                    </button>
                ))}
            </div>

            <Table
                columns={columns}
                data={data}
                selectedItems={selectedItems}
                onSelectAll={onSelectAll}
                onSelectRow={onSelectRow}
                getRowKey={getRowKey}
            >
                {children}
            </Table>
        </div>
    )
}
