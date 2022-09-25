import type { RepositoryType, User, Card, UserStar } from '../types'
import { Pool } from 'pg'
export enum VerificationStatus {
  valid = 'valid',
  used = 'used',
  expired = 'expired',
}

interface UserPO {
  id: bigint
  github_name: string
  price: bigint
  created_at: Date
  updated_at: Date
}

interface CardPO {
  id: bigint
  user_id: bigint
  title: string
  context: string
  star_price: bigint
  star_num: bigint
  expire_time: Date
  created_at: Date
  updated_at: Date
}

interface UserStarPO {
  id: bigint
  user_id: bigint
  card_id: bigint
  created_at: Date
}

export class RepositoryPostgres implements RepositoryType {
  pool: Pool
  constructor(pool: Pool) {
    this.pool = pool
  }

  genId() {
    return BigInt((Math.random() * Number.MAX_SAFE_INTEGER) << 0)
  }

  protected formatUserPo({
    id,
    github_name,
    price,
    created_at,
    updated_at,
  }: UserPO): User {
    return {
      id: BigInt(id),
      githubName: github_name,
      price: BigInt(price),
      createdAt: created_at,
      updatedAt: updated_at,
    }
  }

  protected formatCardPo({
    id,
    user_id,
    title,
    context,
    star_price,
    star_num,
    expire_time,
    created_at,
    updated_at,
  }: CardPO): Card {
    return {
      id: BigInt(id),
      userId: BigInt(user_id),
      title: title,
      context: context,
      starPrice: BigInt(star_price),
      starNum: BigInt(star_num),
      expireTime: expire_time,
      createdAt: created_at,
      updatedAt: updated_at,
    }
  }

  async createUser(data: User): Promise<User> {
    const { id, githubName, price = 0 } = data

    const result = await this.pool.query<UserPO>(
      `--sql
      INSERT INTO users (
        "id",
        "github_name",
        "price",
        "created_at",
        "updated_at"
      ) VALUES (
        $1,
        $2,
        $3,
        NOW(),
        NOW()
      ) RETURNING *
    `,
      [id, githubName, price],
    )
    await this.pool.end()
    return this.formatUserPo(result.rows[0])
  }

  async getUserById(id: bigint): Promise<User | undefined> {
    const result = await this.pool.query<UserPO>(
      `--sql
      SELECT * FROM users WHERE id = $1
      `,
      [id],
    )
    await this.pool.end()
    return result.rows[0] && this.formatUserPo(result.rows[0])
  }

  async changeUserPrice(UserId: bigint, newPrice: bigint): Promise<User> {
    const result = await this.pool.query<UserPO>(
      `--sql
      UPDATE users SET star_price = $1,
      updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [newPrice, UserId],
    )
    await this.pool.end()
    return this.formatUserPo(result.rows[0])
  }

  async createCard(
    userId: bigint,
    title: string,
    context: string,
    starPrice: bigint,
    starNum: bigint,
    expireTime: Date,
  ): Promise<Card> {
    const id = this.genId()

    const result = await this.pool.query<CardPO>(
      `--sql
      INSERT INTO cards (
        "id",
        "user_id",
        "title",
        "context",
        "star_price",
        "star_num",
        "expire_time",
        "created_at",
        "updated_at"
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW(),
        NOW()
      ) RETURNING *
    `,
      [id, userId, title, context, starPrice, starNum, expireTime],
    )
    await this.pool.end()
    console.log(result.rows[0])
    return this.formatCardPo(result.rows[0])
  }
  async updateCard(data: Card): Promise<Card> {
    const { id, userId, title, context, starPrice, expireTime } = data

    const result = await this.pool.query<CardPO>(
      `--sql
      UPDATE cards SET 
      title = $1,
      context = $2,
      star_price = $3,
      expire_time = $4,
      updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `,
      [title, context, starPrice, expireTime, id],
    )
    await this.pool.end()
    return this.formatCardPo(result.rows[0])
  }

  async getCardsByTimeSort(start: number): Promise<any> {
    const connectionString = 'postgresql://postgres:nes816224@localhost:5432/eachstar'
    const pool = new Pool({
      connectionString,
    })
    const result = await pool.query<CardPO>(
      `--sql
      SELECT * FROM cards ORDER BY updated_at DESC limit 10 offset $1
    `,
      [start],
    )
    await pool.end()

    let cards = []
    for (let index in result.rows) {
      cards.push(this.formatCardPo(result.rows[index]))
    }
    const resCount = await pool.query(
      `--sql
      SELECT count(*) FROM cards
    `,
    )
    await pool.end()
    return { count: BigInt(resCount.rows[0].count), data: cards }
  }
}
