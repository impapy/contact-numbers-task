import { ObjectId } from 'mongodb'

export class User {
  _id: ObjectId
  username: string
  password: string
  userSigningKey: string
  createdAt: Date
  modifiedAt: Date
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
