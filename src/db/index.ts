import { MongoClient } from 'mongodb'
import type { Db } from 'mongodb'
import secrets from '../secrets'

export let db: Db
export let client: MongoClient

export const connectToDB = async (): Promise<void> => {
  const url = secrets.DB_URL
  client = await MongoClient.connect(url, { useUnifiedTopology: true })
  // eslint-disable-next-line no-console
  console.log('connected to db @ ', url)
  db = client.db()
}
