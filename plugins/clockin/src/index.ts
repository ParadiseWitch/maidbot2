import { Context } from 'koishi'

export const name = 'clockin'

declare module 'koishi' {
  interface Tables {
    clockin: Clockin
  }
}

export interface Clockin {
  id: number
  name: string,
  user: string,
  date: string,
  note: string,
}

export function apply(ctx: Context) {
  ctx.model.extend('clockin', {
    id: 'unsigned',
    name: 'string',
    user: 'string',
    date: 'string',
    note: 'string',
  }, {
    // 使用自增的主键值
    autoInc: true,
  })



  // TOOD 显示错误提示信息
  ctx.command('clockin.q [date]')
    .action(async (_, dataStr) => {
      const date = getDateFormStr(dataStr);
      return date.toString();
    })
  ctx.command('clockin.a [date]')
    .alias('打卡')
    .action(async ({ session }, dataStr) => {
      const date = getDateFormStr(dataStr);
      const clockinDate = await ctx.database.create('clockin', {
        name: "",
        user: session.uid,
        date: dateFormat(date),
        note: "",
      })
      
      return `打卡成功!\n打卡内容：${clockinDate.name || '无'}，打卡时间：${clockinDate.date}，备注：${clockinDate.note || '无'}`;
    })
  // .option('query', '-q <date> 查询指定指定日期的用户打卡记录')
  // .option('add', '-a <date> 添加指定指定日期的用户打卡记录')
  // .option('week', '-w 查询本周的用户打卡记录')
  // .option('delete', '-d <date> 删除指定日期的用户打卡记录')



}


export const getDateFormStr = (str: string): Date => {
  let tDate: Date;
  if (!str) {
    tDate = new Date();
  } else {
    tDate = new Date(str);
  }
  tDate = str ? new Date(str) : new Date();
  if (tDate.toString() === 'Invalid Date') {
    throw '日期格式错误，请检查！参考格式：2022/01/01';
  }
  return tDate;
}

const dateFormat = (date: Date, fmt: string = 'yyyy/MM/dd') => { //author: meizz 
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
