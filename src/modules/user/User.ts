import { ClientSession, FilterQuery, ObjectId } from 'mongodb'
import { db } from '../../db'
import { DBCollections, ResourcesSortOptions } from '../../types'
import { LoginResponse, User, UserAddInput, UserFilterInput, UserGetResponse, UsersGetInput, UsersSort } from './types'
import { sanitizeUsername } from '../../helpers'
import { compare, genSalt, hash } from 'bcryptjs'
import Error from '../../interfaces/error.interfaces'
import secrets from '../../secrets'
import { sign } from 'jsonwebtoken'
import { mergeDeepRight } from 'ramda'
import { PER_PAGE } from '../../constants'

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

  protected sort(sort: UsersSort = UsersSort.NEWEST): ResourcesSortOptions[UsersSort] {
    const options: ResourcesSortOptions = {
      NEWEST: { createdAt: -1 },
      OLDEST: { createdAt: 1 },
    }

    return options[sort] || sort
  }

  protected filter(filter: UserFilterInput): FilterQuery<User> {
    const symbolsRegex = /[.*+?^${}()|[\]\\]/g
    const searchObject = filter.searchTerm && {
      $regex: filter.searchTerm.replace(symbolsRegex, '\\$&'),
      $options: 'i',
    }
    return {
      ...(filter.searchTerm && {
        username: searchObject,
      }),
      ...(filter.islogin && {
        islogin: filter.islogin,
      }),
      isDeleted: false,
    }
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
        { ...userAddInput, password: hashPassword, userSigningKey: salt, createdAt: now, modifiedAt: now, isDeleted: false, islogin: false },
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

  async users(input: UsersGetInput): Promise<UserGetResponse> {
    try {
      const sortOptions = this.sort(input.sort || UsersSort.NEWEST)
      const filterOptions = this.filter(input?.filter || {})
      const skip = (input.page ? input.page - 1 : 1 - 1) * (input.perPage || PER_PAGE)
      const [nodes, total] = await Promise.all([
        await db
          .collection<User>(DBCollections.USERS)
          .find(filterOptions)
          .sort(sortOptions)
          .skip(skip)
          .limit(input.perPage || PER_PAGE)
          .toArray(),
        await db.collection<User>(DBCollections.USERS).find(filterOptions).count(),
      ])
      const hasNextPage = (input.page || 1) * (input.perPage || PER_PAGE) < total
      return { nodes, pageInfo: { total, hasNextPage, perPage: input.perPage || PER_PAGE, currentPage: input.page || 1 } }
    } catch (error) {
      throw new Error('not found users')
    }
  }

  async userIsLoginEdit(filter: { _id: string }, session?: ClientSession): Promise<User> {
    const resource = await this.user({ _id: filter._id })
    if (!resource) {
      throw new Error('NOT FOUND')
    }

    const mergedResource = mergeDeepRight(resource, {}) as User

    await db.collection<User>(DBCollections.USERS).updateOne(
      {
        _id: new ObjectId(filter._id),
        isDeleted: false,
      },
      {
        $set: { islogin: true, modifiedAt: new Date() },
      },
      { session },
    )

    return mergedResource
  }

  async logIn(loginInput: UserAddInput): Promise<LoginResponse> {
    try {
      const usersLogin = await (await this.users({ filter: { islogin: true } })).pageInfo.total
      if (usersLogin >= 2) throw new Error('Login 2 users')
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

      if (token) {
        this.userIsLoginEdit({ _id: user._id })
      }

      return {
        token,
        user: user!,
      }
    } catch (error) {
      throw new Error(` ${(error as Error).message}`)
    }
  }
}
