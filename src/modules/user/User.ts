import { ClientSession, ObjectId } from 'mongodb'
import { db } from '../../db'
import { DBCollections } from '../../types'
import { LoginResponse, User, UserAddInput } from './types'
import { sanitizeUsername } from '../../helpers'
import { compare, genSalt, hash } from 'bcryptjs'
import Error from '../../interfaces/error.interfaces'
import secrets from '../../secrets'
import { sign } from 'jsonwebtoken'

export class UserService {
  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt()
    const hashedPassword = await hash(password, salt)
    return hashedPassword
  }

  async comparePasswords(password: string, passwordHash: string): Promise<boolean> {
    const passwordMatched = await compare(password, passwordHash)
    return passwordMatched
  }

  async signToken(payload: Record<string, string>, userSigningKey: string): Promise<string> {
    const keysMix = `${secrets.JWT_SECRET}${userSigningKey}`
    const token = sign(payload, keysMix)
    return token
  }

  async creat(userAddInput: Omit<UserAddInput, 'createdAt' | 'modifiedAt' | 'isDeleted' | 'userSigningKey'>, session?: ClientSession): Promise<User> {
    try {
      const sanitizedUsername = sanitizeUsername(userAddInput.username)
      const salt = await genSalt()
      const possibleUser = await db.collection<User>(DBCollections.USERS).findOne({
        username: sanitizedUsername,
        isDeleted: false,
      })
      if (possibleUser) throw new Error('USER EXISTS')
      const hashPassword = await this.hashPassword(userAddInput.password)
      const now = new Date()
      const result = await db.collection<User>(DBCollections.USERS).insertOne(
        { ...userAddInput, password: hashPassword, userSigningKey: salt, createdAt: now, modifiedAt: now, isDeleted: false },
        {
          session,
        },
      )
      return result.ops[0] as User
    } catch (error) {
      throw new Error(`unable to create : ${(error as Error).message}`)
    }
  }

  async user(filter: { _id: string }): Promise<User | null> {
    try {
      return await db.collection<User>(DBCollections.USERS).findOne({
        _id: new ObjectId(filter._id),
        isDeleted: false,
      })
    } catch (error) {
      throw new Error('not found user')
    }
  }

  async logIn(loginInput: UserAddInput): Promise<LoginResponse> {
    try {
      const user = await db.collection<User>(DBCollections.USERS).findOne({
        username: sanitizeUsername(loginInput.username),
        isDeleted: false,
      })
      if (!user) {
        throw new Error('NOT FOUND')
      }
      const isMatches = await this.comparePasswords(loginInput.password, user.password as string)
      if (!isMatches) {
        throw new Error('INCORRECT CREDENTIALS')
      }

      const token = await this.signToken(
        {
          user: user._id.toString(),
          username: user.username,
          userSigningKey: user.userSigningKey,
        },
        user.userSigningKey,
      )

      return {
        token,
        user: user!,
      }
    } catch (error) {
      throw new Error(` ${(error as Error).message}`)
    }
  }
}
