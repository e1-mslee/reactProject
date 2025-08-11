export function getNextTableId(items: { TABLE_ID?: string }[]): string {
  const maxSeq = items.reduce((max, item) => {
    const match = item.TABLE_ID?.match(/^uda_db_(\d{3})$/);
    const num = match && match[1] ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);

  const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
  return `uda_db_${nextSeq}`;
}
