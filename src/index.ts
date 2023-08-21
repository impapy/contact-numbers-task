import cors from 'cors'
import exppress, { Application, Request, Response } from 'express'
import helmet from 'helmet'
import errorMiddleware from './middleware/error.middleware'
import secrets from './secrets'
import { connectToDB } from './db'
import routes from './routes'
import { Server } from 'socket.io'
import http from 'http'

const checkEnvVariables = () => {
  for (const key in secrets) {
    if (!secrets[key as keyof typeof secrets]) console.warn(`env variable ${key} is not set`) // eslint-disable-line no-console
  }
}

const main = async (): Promise<void> => {
  await connectToDB()
  checkEnvVariables()
  const app: Application = exppress()
  app.use(cors())
  app.use(helmet())
  app.use(exppress.json())

  const server = http.createServer(app)
  const io = new Server(server)

  app.use('/api', routes)
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'hello world',
    })
  })
  app.use(errorMiddleware)
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      message: 'ohh you are lost, read the doqumentation to find your way back home',
    })
  })

  server.listen(secrets.PORT || 5000, () => {
    console.log(`server ready on http://localhost:${secrets.PORT || 5000}`)
  })
}
main().catch((err) => console.log(err)) // eslint-disable-line no-console
