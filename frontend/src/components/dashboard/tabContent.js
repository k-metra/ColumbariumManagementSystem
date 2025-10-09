import Icon from "../../components/icon";
import Table from './table';
import { useState, useMemo } from 'react';

// Reusable panel for tab content: header, search, toolbar, and table.
// columns expected as array of { label, key, type? }
export default function TabContent({
    title,
    searchQuery,
    onSearchChange,
    toolbarButtons = [],
    columns = [], // [{ label, key, type }]
    data = [],
    selectedItems = [],
    onSelectAll,
    onSelectRow,
    getRowKey,
    children, // row renderer: function(row) => JSX
    onFilterChange // optional callback when column filter changes
}) {
    const [filterColumn, setFilterColumn] = useState('all');

    // derive filterable columns (exclude selection/empty columns)
    const filterableColumns = columns
        .filter(c => c && c.key && c.key !== '_select')
        .map(c => ({ label: c.label, key: c.key, type: c.type || 'text' }));

    const q = (searchQuery || '').toString().trim().toLowerCase();

    const filteredData = useMemo(() => {
        if (!q) return data;

        const matches = (val, type = 'text') => {
            if (val === null || val === undefined) return false;

            // DATE / TIMESTAMP handling
            if (type === 'date') {
                // try to construct a Date from value (supports ISO strings, timestamps)
                let d = new Date(val);
                if (isNaN(d.getTime())) {
                    const num = Number(val);
                    if (!Number.isNaN(num)) d = new Date(num);
                    if (isNaN(d.getTime())) return false;
                }

                const parts = [];
                const iso = d.toISOString();
                parts.push(iso); // 2024-06-01T00:00:00.000Z
                parts.push(iso.slice(0,10)); // 2024-06-01
                parts.push(iso.slice(0,7)); // 2024-06
                parts.push(d.toDateString().toLowerCase());
                parts.push(d.toLocaleDateString().toLowerCase());
                parts.push(d.getFullYear().toString());
                parts.push((d.getMonth() + 1).toString().padStart(2, '0'));
                parts.push(d.toLocaleTimeString().toLowerCase());
                parts.push(String(d.getTime())); // epoch ms
                parts.push(String(Math.floor(d.getTime()/1000))); // epoch sec

                return parts.some(p => p.includes(q));
            }

            // NUMBER handling
            if (type === 'number') {
                // tolerate formatted numbers (e.g., "₱ 5,000.00") by stripping non-numeric chars
                const toNumeric = (v) => {
                    if (v === null || v === undefined) return NaN;
                    if (typeof v === 'number') return v;
                    const cleaned = String(v).replace(/[^0-9.-]/g, '');
                    return Number(cleaned);
                };

                const num = toNumeric(val);
                if (!Number.isNaN(Number(q))) {
                    // numeric query: match numeric string (e.g., 5000) or substring of numeric representation
                    return String(num).toLowerCase().includes(q);
                }
                return String(val).toLowerCase().includes(q);
            }

            // default: text match
            return String(val).toLowerCase().includes(q);
        };

        return data.filter(row => {
            if (filterColumn === 'all') {
                return filterableColumns.some(col => matches(row[col.key], col.type));
            } else {
                const col = filterableColumns.find(c => c.key === filterColumn);
                if (!col) return false;
                return matches(row[col.key], col.type);
            }
        });
    }, [data, q, filterColumn, filterableColumns]);

    const columnLabels = columns.map(c => (typeof c === 'string' ? c : c.label));

    const selectedCol = filterableColumns.find(c => c.key === filterColumn);
    const placeholder = filterColumn === 'all' ? 'Search...' : (selectedCol ? `Search ${selectedCol.label.toLowerCase()}...` : 'Search...');

    return (
        <div className="w-full h-full flex flex-col overflow-auto">
            <h2 className="text-2xl ml-2 font-bold text-zinc-700">{title}</h2>
            <div className="flex justify-center items-center flex-row gap-2">
                <input value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} id="search" className="bg-slate-50 border border-black/10 rounded-lg self-center h-12 min-h-12 min-w-[60%] w-[60%] text-zinc-700 outline-none px-3" placeholder={placeholder}></input>

                <div className="flex flex-col justify-center -translate-y-3">
                    <label htmlFor="filter" className="text-sm text-zinc-600 block mb-1">Filter by:</label>
                    <select
                        value={filterColumn}
                        onChange={(e) => { setFilterColumn(e.target.value); if (onFilterChange) onFilterChange(e.target.value); }}
                        name="filter"
                        className="min-w-12 px-3 text-md h-10 rounded bg-[#fbfbfb] border border-black/30"
                    >
                        <option value="all">All columns</option>
                        {filterableColumns.map(col => (
                            <option key={col.key} value={col.key}>{col.label}</option>
                        ))}
                    </select>
                </div>
            </div>


            <div className="flex flex-row gap-2 self-center items-center justify-center border-b border-black/12 py-3 px-10 pt-4 mb-6">
                {toolbarButtons.map((btn, idx) => (
                    <button key={idx} onClick={btn.onClick} className={`rounded-lg ${btn.bg || 'bg-[#fbfbfb]'} ${btn.textClass || 'text-zinc-700'} p-2 px-4 hover:opacity-70 transition-all duration-300 ease-out`}>
                        {btn.icon && <Icon icon={btn.icon} className="mr-2" />}
                        {btn.label}
                    </button>
                ))}
            </div>

            <Table
                columns={columnLabels}
                data={filteredData}
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
