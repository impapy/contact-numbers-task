import { Router, Request, Response } from 'express'
import * as controller from './controllersUser'
import validateTokenAuth from '../../middleware/authMiddleware'

const routes = Router()

routes.post('/', controller.createUser)
routes.get('/:_id', validateTokenAuth, controller.user)
routes.post('/login', controller.logIn)

export default routes
