import { ObjectId } from 'mongodb'
import { PageInfo } from '../contact/types'

export enum UsersSort {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
}

export class User {
  _id: ObjectId
  username: string
  password: string
  userSigningKey: string
  createdAt: Date
  modifiedAt: Date
  islogin: boolean
  isDeleted: boolean
}

export class UserAddInput {
  username: string
  password: string
}

export class LoginResponse {
  token: string

  user: User
}

export class Payload {
  user: string
  username: string
  userSigningKey: string
  iat: number
}

export class UserFilterInput {
  searchTerm?: string
  islogin?: boolean
}

export class UserGetResponse {
  pageInfo: PageInfo
  nodes: User[]
}
export class UsersGetInput {
  filter?: UserFilterInput
  sort?: UsersSort
  page?: number
  perPage?: number
}