import dotenv from 'dotenv'

dotenv.config()

export interface Secrets {
  DB_URL: string
  JWT_SECRET: string
  PORT: String
}

const secrets: Secrets = {
  DB_URL: process.env.DB_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  PORT: process.env.PORT as string,
}

export default secrets
