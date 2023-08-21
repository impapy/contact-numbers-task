import { Router, Request, Response } from 'express'
import * as controller from './controllersContact'
import validateTokenAuth from '../../middleware/authMiddleware'

const routes = Router()

routes.post('/', validateTokenAuth, controller.createContact)
routes.get('/', validateTokenAuth, controller.allContacts)
routes.get('/:_id', validateTokenAuth, controller.contact)
routes.patch('/:_id', validateTokenAuth, controller.updateContact)
routes.delete('/:_id', validateTokenAuth, controller.deleteContact)

export default routes
