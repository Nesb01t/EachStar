import { Context } from 'koa'
import { RepositoryPostgres } from '../stores'

export class CardController {
  repository
  constructor() {
    this.repository = new RepositoryPostgres()
  }

  async createCard(ctx: Context) {
    const body = ctx.request.body
    const userId = BigInt(body.userId)
    const title = body.title
    const context = body.context
    const starPrice = BigInt(body.starPrice)
    const starNum = BigInt(body.starNum)
    const expireTime = new Date(body.expireTime)

    const card = await this.repository.createCard(
      userId,
      title,
      context,
      starPrice,
      starNum,
      expireTime,
    )
    ctx.body = card
  }

  async getCard(ctx: Context) {
    const start = ctx.query.start

    const cards = await this.repository.getCardsByTimeSort(Number(start))
    ctx.body = cards
  }
}
export default CardController