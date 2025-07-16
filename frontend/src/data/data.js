function getArr(len) {
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr.push(Math.round(Math.random() * 100));
  }
  return arr;
}

function getCountrySalesData(n) {
  let countries = 'US,Germany,UK,Korea,Italy,Greece'.split(',');
  let data = [];
  n = n ? n : countries.length;
  for (let i = 0; i < n; i++) {
    data.push({
      id: i,
      country: countries[i],
      active: Math.random() > 0.5 ? true : false,
      sales: Math.round(Math.random() * 10000),
      trends: getArr(20),
    });
  }
  return data;
}

function scaleY(value, min, max) {
  return 100 - Math.round(((value - min) / (max - min)) * 100);
}
function wrapSvg(svg, title) {
  return (
    '<div aria-label="' +
    title +
    '" ' +
    'style="width:100%;height:100%;box-sizing:border-box;padding:4px">' +
    '<svg width="100%" height="100%" style="stroke:currentColor;color:#FFC107;"><g>' +
    svg +
    '</g></svg></div>'
  );
}

export function getSparklines(data) {
  var svg = '',
    min = Math.min.apply(Math, data),
    max = Math.max.apply(Math, data),
    x1 = 0,
    y1 = scaleY(data[0], min, max),
    x2,
    y2;
  for (var i = 1; i < data.length; i++) {
    x2 = Math.round((i / (data.length - 1)) * 100);
    y2 = scaleY(data[i], min, max);
    svg +=
      '<line x1=' + x1 + '% y1=' + y1 + '% x2=' + x2 + '% y2=' + y2 + '% />';
    x1 = x2;
    y1 = y2;
  }
  return wrapSvg(svg, 'sparklines');
}

export const data = getCountrySalesData();
