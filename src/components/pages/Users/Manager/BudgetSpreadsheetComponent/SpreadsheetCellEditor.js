import "./spreadsheetStyles.css"

export const textEditorClassname = `rdg-text-editor spreadsheet-cell-text-editor`;

function autoFocusAndSelect(input) {
  input?.focus();
  input?.select();
}

export default function SpreadsheetTextEditor({ row, column, onRowChange, onClose }) {
  return (
    <input className={textEditorClassname}
      ref={autoFocusAndSelect}
      value={row[column.key].f == undefined ? row[column.key].v : `=${row[column.key].f}`}
      onChange={
        (event) => {
          return onRowChange({ ...row, [column.key]: { v: event.target.value, ...column[column.key] } })
        }
      }
      onBlur={
        () => onClose(true)
      }
    />
  );
}