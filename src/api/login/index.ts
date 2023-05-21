import * as LoginModel from './login.model'

import prequest from '@/utils/request'
import type { UserPhone } from './login.model'

class LoginService {
  static byMiniappCode(param: any) {
    return prequest.post<Promise<LoginModel.GetMiniappCodeResp>>('/wx/login/byMiniappCode', {
      params: param
    })
  }
  static getLoingConfig(param: any) {
    return prequest.post<Promise<LoginModel.GetLoninConfigResp>>('/wx/baseinfo/login', {
      params: param
    })
  }
  static byMiniappPhone(param: UserPhone) {
    return prequest.post<Promise<LoginModel.GetPhoneLoginResp>>('/wx/login/byMiniappPhone', {
      params: param
    })
  }
}

export { LoginService, LoginModel }
