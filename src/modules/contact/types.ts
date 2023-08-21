import { ObjectId } from 'mongodb'
import { PER_PAGE } from '../../constants'

export interface ResourcesSortOptions {
  NEWEST: { createdAt: -1 }
  OLDEST: { createdAt: 1 }
}

export enum ContactsSort {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
}

export class Contact {
  _id: ObjectId
  name: string
  phone: string
  address: string
  notes: string
  islocked: boolean
  createdAt: Date
  modifiedAt: Date
  isDeleted: boolean
}

export class ContactAddInput {
  name: string
  phone: string
  address: string
  notes: string
}

export class ContactEditInput {
  name?: string
  phone?: string
  address?: string
  notes?: string
}

export class ContactFilterInput {
  searchTerm?: string
  name?: string
  phone?: string
  address?: string
  notes?: string
  islocked?: boolean
}

export class PageInfo {
  total: number
  currentPage: number
  perPage: number
  hasNextPage: boolean
}

export type Keysof<T> = keyof Omit<T, 'isDeleted' | 'createdAt' | 'modifiedAt' | '_id'>

export class ContactGetResponse {
  pageInfo: PageInfo
  nodes: Contact[]
}
export class ContactsGetInput {
  filter?: ContactFilterInput
  sort?: ContactsSort
  page?: number
  perPage?: number
}
