import { Random } from 'koishi'
import { MapUneval } from 'koishi'
import { Context, Query } from 'koishi'

export const name = 'clockin'

declare module 'koishi' {
  interface Tables {
    clockin: Clockin
  }
}

export interface Clockin {
  id: string
  name: string,
  user: string,
  date: Date,
  note: string,
}

export function apply(ctx: Context) {
  ctx.model.extend('clockin', {
    id: 'string',
    name: 'string',
    user: 'string',
    date: 'date',
    note: 'string',
  }, {
    // 使用自增的主键值
    autoInc: true,
  })

  ctx.command('clockin.a [name] [date] [note]')
    .alias('打卡')
    .action(async ({ session }, name, dataStr, note) => {
      let date: Date;
      try { date = getDateFormStr(dataStr) } catch (e) { return e };
      const query: Query = { user: session.uid, date };
      let tData: Clockin = {
        id: uuid(),
        name: name || '',
        user: session.uid,
        date,
        note: note || '',
      }
      const oldData = await ctx.database.get('clockin', query);
      if (oldData && oldData.length > 0) {
        await ctx.database.set('clockin', query, tData);
        return "已打卡\n" + getRetMsg(tData);
      } else {
        tData = await ctx.database.create('clockin', tData);
        return "打卡成功\n" + getRetMsg(tData);
      }
    })

  ctx.command('clockin.q [date]', '查询指定日期的打卡情况')
    .action(async ({ session }, dataStr) => {
      let date: Date;
      try { date = getDateFormStr(dataStr) } catch (e) { return e };
      const query: Query = { user: session.uid, date };
      const tDate = await ctx.database.get('clockin', query);
      return tDate.reduce((prev, cur) => {
        return prev + getRetMsg(cur) + '\n'
      }, '');
    })

  ctx.command('clockin.w', '查询本周打卡情况')
    .alias('本周打卡')
    .action(async ({ session }) => {
      const now = new Date();
      const query: Query = {
        user: session.uid,
        date: {
          $gte: firstDayOfWeek(now),
          $lte: lastDayOfWeek(now),
        }
      }
      const tDate = await ctx.database.get('clockin', query);
      return tDate.reduce((prev, cur) => {
        return prev + getRetMsg(cur) + '\n'
      }, '');
    })
  // .option('query', '-q <date> 查询指定指定日期的用户打卡记录')
  // .option('add', '-a <date> 添加指定指定日期的用户打卡记录')
  // .option('week', '-w 查询本周的用户打卡记录')
  // .option('delete', '-d <date> 删除指定日期的用户打卡记录')



}


const getRetMsg = (data: Clockin) => `打卡内容：${data.name || '无'}，打卡时间：${data.date}，备注：${data.note || '无'}`


export const getDateFormStr = (str: string): Date => {
  let tDate: Date;
  if (!str) {
    tDate = new Date();
  } else {
    tDate = new Date(str);
  }
  tDate = str ? new Date(str) : new Date();
  if (tDate.toString() === 'Invalid Date') {
    throw '日期格式错误, 请检查！参考格式：2022/01/01';
  }
  return tDate;
}

export const dateFormat = (date: Date, fmt: string = 'yyyy/MM/dd') => { //author: meizz 
  var o = {
    "M+": date.getMonth() + 1, //月份 
    "d+": date.getDate(), //日 
    "h+": date.getHours(), //小时 
    "m+": date.getMinutes(), //分 
    "s+": date.getSeconds(), //秒 
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
    "S": date.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


export const uuid = () => {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}
const firstDayOfWeek = (date: Date) => { 
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();
  let dayOfWeek = date.getDay() || 7;
  let nd = d - dayOfWeek + 1;
  return new Date(`${y}/${m}/${nd}`);
}

const lastDayOfWeek = (date: Date) => { 
  const fd = firstDayOfWeek(date);
  return new Date(fd.getTime() + 6 * 24 * 60 * 60 * 1000);
};
