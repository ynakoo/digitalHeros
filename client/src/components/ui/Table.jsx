import styles from './Table.module.css';

export default function Table({ columns, data, emptyMessage = 'No data found', onRowClick }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((col, j) => (
                  <td key={j}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
