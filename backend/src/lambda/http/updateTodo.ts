import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { todoExists, updateTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    createLogger(`Update todo event: ${event}`);

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const validTodo = await todoExists(todoId, userId)

    if (!validTodo) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }

    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    await updateTodo(todoId, userId, updatedTodo)

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
