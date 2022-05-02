import * as uuid from 'uuid'

import * as todo from '../dataLayer/todos'

import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

// Implement businessLogic

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return await todo.getAllTodos(userId)
}

export async function createTodo(
  userId: string,
  payload: CreateTodoRequest
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const data: TodoItem = {
    ...payload,
    todoId,
    userId,
    createdAt: new Date().toISOString(),
    done: false
  }

  await todo.createTodo(data)
}


export async function updateTodo(todoId: string, userId: string, payload: UpdateTodoRequest): Promise<void> {
  await todo.updateTodo(todoId, userId, payload)
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
  await todo.deleteTodo(todoId, userId)
}

export async function todoExists(todoId: string, userId: string) {
  const item = await todo.getTodo(todoId, userId)

  console.log('Get todo: ', item)
  return !!item
}

export async function addAttachmentUrl(bucketName, todoId, userId) {
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  await todo.updateTodoAttachment(todoId, userId, attachmentUrl)
}