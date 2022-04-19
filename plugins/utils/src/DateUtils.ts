export const now = () => new Date()
export const segDate = (date: Date = now()) => {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    misllisecond: date.getMilliseconds()
  }
}

export const firstDayOfWeek = (date: Date = now()) => {
  const { year: y, month: m, day: d } = segDate(date);
  let dayOfWeek = date.getDay() || 7;
  let nd = d - dayOfWeek + 1;
  return new Date(`${y}/${m}/${nd}`);
}

export const lastDayOfWeek = (date: Date = now()) => {
  const fd = firstDayOfWeek(date);
  return new Date(fd.getTime() + 6 * 24 * 60 * 60 * 1000);
};

export const nextDay = (date: Date = now()) => new Date(date.getTime() + 24 * 60 * 60 * 1000);

export const startSecondOfDay = (date: Date) => {
  const { year: y, month: m, day: d } = segDate(date);
  return new Date(`${y}/${m}/${d} 00:00:00`);
}

export const dateFormat = (date: Date = now(), fmt: string = 'yyyy/MM/dd') => {
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    "S": date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
