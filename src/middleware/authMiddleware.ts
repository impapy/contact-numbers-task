import { NextFunction, Request, Response } from 'express'
import Error from '../interfaces/error.interfaces'
import { decode, verify } from 'jsonwebtoken'
import { Payload, User } from '../modules/user/types'
import { db } from '../db'
import { UserService } from '../modules/user/User'
import secrets from '../secrets'

const handelUnAuthError = (next: NextFunction) => {
  const error: Error = new Error('Login Error : please try again')
  error.status = 401
  next(error)
}
const validateTokenAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userService = new UserService()
    const header = req.get('authorization')
    if (header) {
      const bearer = header.split(' ')[0].toLowerCase()
      const token = header.split(' ')[1]
      if (token && bearer === 'bearer') {
        const data = decode(token) as Payload
        const user = await userService.user({ _id: data.user })
        const payload = verify(token, `${secrets.JWT_SECRET}${user?.userSigningKey}`) as Payload
        if (payload) {
          next()
        } else {
          handelUnAuthError(next)
        }
      } else {
        handelUnAuthError(next)
      }
    } else {
      handelUnAuthError(next)
    }
  } catch (error) {
    handelUnAuthError(next)
  }
}

export default validateTokenAuth
