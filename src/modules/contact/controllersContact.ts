import { NextFunction, Request, Response } from 'express'
import { omit } from 'ramda'
import Error from '../../interfaces/error.interfaces'
import { validationCreateContact, validationObjectId, validationUpdateContact } from '../../validator'
import { ContactService } from './Contact'
import { Contact } from './types'

const contactService = new ContactService()

export const createContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = validationCreateContact(req.body)
    if (error) {
      throw new Error(` invalid request ${(error as Error).message}`)
    }
    const contact = await contactService.creat(value)
    res.json({
      status: 'succss',
      data: contact,
      message: 'add user succss',
    })
  } catch (error) {
    next(error)
  }
}

export const allContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.contacts(req.body)
    res.json({
      status: 'succss',
      data: contact,
      message: 'allContacts succss',
    })
  } catch (error) {
    next(error)
  }
}

export const updateContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = validationObjectId(req.params)
    const { error: errotInput, value: input } = validationUpdateContact(req.body)

    if (error || errotInput) {
      throw new Error(` invalid request ${(error as Error).message}`)
    }
    const contact = await contactService.contactEdit(value, input)
    res.json({
      status: 'succss',
      data: contact,
      message: 'update Contact succss',
    })
  } catch (error) {
    next(error)
  }
}

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = validationObjectId(req.params)

    if (error) {
      throw new Error(` invalid request ${(error as Error).message}`)
    }
    await contactService.contactDelete(value)
    res.json({
      status: 'succss',
      data: value as Contact,
      message: 'delete Contact succss',
    })
  } catch (error) {
    next(error)
  }
}

export const contact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = validationObjectId(req.params)
    if (error) {
      throw new Error(` invalid request ${(error as Error).message}`)
    }
    const contact = await contactService.contact(value as { _id: string })
    res.json({
      status: 'succss',
      data: contact,
      message: 'found success',
    })
  } catch (error) {
    next(error)
  }
}
