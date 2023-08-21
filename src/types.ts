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
