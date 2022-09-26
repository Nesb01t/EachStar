import type { Context, Next } from 'koa'
import { RepositoryPostgres } from '../stores'
export const authorization = async (ctx: Context, next: Next) => {
  const repository = new RepositoryPostgres()
  const userId = ctx.cookies.get('userId')
  if (userId != undefined) {
    const user = await repository.getUserById(BigInt(userId))
    console.log(user)
    if (user) {
      ctx.user = user
      ctx.cookies.set('userId', userId, { httpOnly: false })
    }
  }

  await next()
}
