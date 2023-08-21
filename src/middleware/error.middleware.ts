import { NextFunction, Request, Response } from 'express'
import Error from '../interfaces/error.interfaces'

const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500
  const message = error.message || 'Something wrong'
  res.status(status).json({ status, message })
}

export default errorMiddleware
