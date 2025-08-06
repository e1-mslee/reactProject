interface CountryData {
  id: number;
  country: string;
  active: boolean;
  sales: number;
  trends: number[];
}

function getArr(len: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(Math.round(Math.random() * 100));
  }
  return arr;
}

function getCountrySalesData(n?: number): CountryData[] {
  const countries = 'US,Germany,UK,Korea,Italy,Greece'.split(',');
  const data: CountryData[] = [];
  n = n ?? countries.length;
  n = Math.min(n, countries.length);

  for (let i = 0; i < n; i++) {
    data.push({
      id: i,
      country: countries[i]!,
      active: Math.random() > 0.5,
      sales: Math.round(Math.random() * 10000),
      trends: getArr(20),
    });
  }
  return data;
}

function scaleY(value: number, min: number, max: number): number {
  return 100 - Math.round(((value - min) / (max - min)) * 100);
}

function wrapSvg(svg: string, title: string): string {
  return (
    `<div aria-label="${title}" style="width:100%;height:100%;box-sizing:border-box;padding:4px">` +
    `<svg width="100%" height="100%" style="stroke:currentColor;color:#FFC107;"><g>` +
    svg +
    `</g></svg></div>`
  );
}

export function getSparklines(data: number[]): string {
  let svg = '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  let x1 = 0;
  let y1 = scaleY(data[0]!, min, max);
  let x2: number, y2: number;

  for (let i = 1; i < data.length; i++) {
    x2 = Math.round((i / (data.length - 1)) * 100);
    y2 = scaleY(data[i]!, min, max);
    svg += `<line x1=${x1}% y1=${y1}% x2=${x2}% y2=${y2}% />`;
    x1 = x2;
    y1 = y2;
  }

  return wrapSvg(svg, 'sparklines');
}

export const data: CountryData[] = getCountrySalesData();
