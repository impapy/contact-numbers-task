import { NextFunction, Request, Response } from 'express'
import { UserService } from './User'
import { omit } from 'ramda'
import Error from '../../interfaces/error.interfaces'
import { validationCreateUser, validationObjectId } from '../../validator'

const userService = new UserService()

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = validationCreateUser(req.body)
    if (error) {
      throw new Error(` invalid request ${(error as Error).message}`)
    }
    const user = await userService.creat(value)
    const userArgs = omit(['password'], user)
    res.json({
      status: 'succss',
      data: userArgs,
      message: 'add user succss',
    })
  } catch (error) {
    next(error)
  }
}

export const user = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = validationObjectId(req.params)
    if (error) {
      throw new Error(` invalid request ${(error as Error).message}`)
    }
    const user = await userService.user(value as { _id: string })
    const userArgs = omit(['password'], user)
    res.json({
      status: 'succss',
      data: userArgs,
      message: 'add user succss',
    })
  } catch (error) {
    next(error)
  }
}

export const logIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = validationCreateUser(req.body)
    if (error) {
      throw new Error(` invalid request ${(error as Error).message}`)
    }
    const loginResponse = await userService.logIn(value)

    res.json({
      status: 'succss',
      data: { ...loginResponse, user: omit(['password'], loginResponse.user) },
      message: 'add user succss',
    })
  } catch (error) {
    next(error)
  }
}
export const logOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.logOut(req.cookies)

    res.json({
      status: 'succss',
      message: ' logout succss',
    })
  } catch (error) {
    next(error)
  }
}
