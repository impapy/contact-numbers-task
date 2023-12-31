import { ObjectId } from 'mongodb'

export enum DBCollections {
  USERS = 'users',
  CONTACTS = 'contacts',
}

export class BaseDocument {
  _id: ObjectId

  createdAt: Date

  modifiedAt: Date

  isDeleted: boolean
}

export interface ResourcesSortOptions {
  NEWEST: { createdAt: -1 }
  OLDEST: { createdAt: 1 }
}