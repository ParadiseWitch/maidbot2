import { Context, Query } from 'koishi'
import { DateUtils, UUID } from '@maidbot2/utils'

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
        id: UUID(),
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
          $gte: DateUtils.firstDayOfWeek(now),
          $lte: DateUtils.lastDayOfWeek(now),
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
  tDate = str ? new Date(str) : new Date();
  if (tDate.toString() === 'Invalid Date') {
    throw '日期格式错误, 请检查！参考格式：2022/01/01';
  }
  return tDate;
}




