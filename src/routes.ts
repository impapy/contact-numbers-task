import { Router } from 'express'
import usersRoutes from './modules/user/routesUser'
import contactsRoutes from './modules/contact/routesContact'

const routes = Router()
routes.use('/users', usersRoutes)
routes.use('/contacts', contactsRoutes)

export default routes
