export default function Table({ columns, data, selectedItems, onSelectAll, onSelectRow, getRowKey, children  }) {
    const allSelected = data.length > 0 && selectedItems.length === data.length;

    return (
        <table>
            <thead className="text-left border-b border-black/10 text-zinc-700">
                <tr>
                    {columns.map((column, index) => (
                        column === "" ? 
                        <th key={index} className="p-2 pl-4">
                            <input type="checkbox" checked={allSelected} onChange={(e) => onSelectAll(e.target.checked)} /></th> : <th key={index} className="p-2 pl-4">{column}</th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {data.map((row, idx) => {
                    const rowKey = getRowKey(row);
                    const isSelected = selectedItems.includes(rowKey);

                    return (
                        <tr 
                            key={rowKey}
                            className="border-b even:bg-[#fafafa] even:hover:bg:black/10 border-black/10 hover:bg-black/5 text-zinc-700"
                        >
                            { columns[0] === "" && <td className="p-2 py-4 pl-4">
                                <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    
                                    onChange={() => onSelectRow(rowKey)}
                                />
                            </td>}

                            {children(row, idx)}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}