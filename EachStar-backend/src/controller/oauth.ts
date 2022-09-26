import axios from 'axios'
import { Context } from 'koa'
import { RepositoryPostgres } from '../stores'
import serviceConfig from '../config'
export class OAuthController {
  repository
  constructor() {
    this.repository = new RepositoryPostgres()
  }

  async redirectGithubAuth(ctx: Context) {
    //重定向到认证接口,并配置参数
    var path = 'https://github.com/login/oauth/authorize'
    path += '?client_id=' + serviceConfig.auth.githubClientId
    //将地址及参数返回前端
    ctx.status = 301
    ctx.redirect(path) //重定向到请求页面
  }

  async githubCallBack(ctx: Context) {
    const code = ctx.query.code //返回的授权码
    const params = JSON.stringify({
      client_id: serviceConfig.auth.githubClientId,
      client_secret: serviceConfig.auth.githubClientSecret,
      code: code,
    })
    //使用这个授权码，向 GitHub 请求令牌
    let res = await axios({
      method: 'post',
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: params,
    })

    const accessToken = res.data.access_token

    //再通过令牌获取用户信息
    res = await axios({
      method: 'get',
      url: 'https://api.github.com/user',
      headers: {
        Authorization: 'token ' + accessToken,
      },
    })
    console.log(res.data.id)
    if (!(await this.repository.getUserById(BigInt(res.data.id)))) {
      await this.repository.createUser(res.data.id, res.data.login, BigInt(0))
    }
    ctx.cookies.set('userId', res.data.id, { httpOnly: false }) //用户名称
    ctx.status = 301
    ctx.redirect(serviceConfig.auth.redirectPath) //重定向到请求页面
  }
}
export default OAuthController