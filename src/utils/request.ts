import Lock from '@prequest/lock'
import md5 from 'blueimp-md5'
import { PreQuest, create } from '@prequest/miniprogram'
import type { MiddlewareCallback } from '@prequest/types'
import { useUserStore } from '@/stores/user'
import { useConfigStore } from '@/stores/config'
import type { ApiResp } from '@/api/types'

const userStore = useUserStore()
const configStore = useConfigStore()

declare module '@prequest/types' {
  interface PQRequest {
    skipTokenCheck: boolean
  }
}

PreQuest.defaults.baseURL = import.meta.env.VITE_APP_URL
PreQuest.defaults.header = {}

const prequest = create(uni.request)

const lock = new Lock({
  getValue() {
    return Promise.resolve(userStore.token)
  },
  setValue(token) {
    userStore.token = token
  },
  clearValue() {
    userStore.token = ''
  }
})
const wrapper = Lock.createLockWrapper(lock)

// 设置通用参数
const requestSetParam: MiddlewareCallback = async (ctx, next) => {
  const params = Object.assign({ ...ctx.request.params }, configStore.getQueryParms)
  params.sign = md5(JSON.stringify(params)).toUpperCase()
  ctx.request.params = params
  console.log('request: ' + JSON.stringify(ctx.request))
  next()
}

const refreshToken: MiddlewareCallback = async (ctx, next) => {
  if (ctx.request.skipTokenCheck) return next()

  const token = await wrapper(
    () =>
      new Promise((resolve) => {
        uni.login({
          async success(res) {
            if (res.code) {
              prequest('/login', {
                method: 'post',
                skipTokenCheck: true,
                data: { code: res.code }
              }).then((res1) => resolve(res1.data.data.token))
            }
          }
        })
      })
  )
  if (ctx.request.header) {
    ctx.request.header['Authorization'] = `Bearer ${token}`
  }
  await next()
}

const responeParse: MiddlewareCallback = async (ctx, next) => {
  await next()
  const { statusCode, data } = ctx.response
  console.log('status: ' + statusCode)
  console.log('response :', ctx.response)
  if (![200, 301, 302].includes(statusCode)) {
    throw new Error(`${statusCode}`)
  }
  const result: ApiResp = data
  if (result.code == 777) {
    uni.showToast({ title: result.msg, icon: 'fail' })
    return
  }
  return Promise.resolve(result.data)
}

// prequest.use(refreshToken).use(parse)
prequest.use(requestSetParam).use(responeParse)

export default prequest
