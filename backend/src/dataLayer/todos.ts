import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}

const docClient: DocumentClient = createDynamoDBClient();
const todosTable = process.env.TODOS_TABLE;
const todosIdxName = process.env.TODOS_CREATED_AT_INDEX;

const getAllTodos = async (userId: string): Promise<TodoItem[]> => {
  console.log('Getting all todos')

  const params = {
    TableName: todosTable,
    IndexName: todosIdxName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }

  const result = await docClient.query(params).promise()

  return result.Items as TodoItem[]
}

const createTodo = async (todo: TodoItem): Promise<TodoItem> => {
  await docClient.put({
    TableName: todosTable,
    Item: todo
  }).promise()

  return todo
}

const updateTodo = async (todoId: string, userId: string, updatedTodo: UpdateTodoRequest): Promise<void> => {
  await docClient.update({
    TableName: todosTable,
    Key: {
      todoId,
      userId
    },
    ExpressionAttributeNames: {
      '#N': 'name'
    },
    UpdateExpression: 'SET #N = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done
    }
  }).promise()
}

const updateTodoAttachment = async (todoId: string, userId: string, attachmentUrl: string): Promise<void> => {
  await docClient.update({
    TableName: todosTable,
    Key: {
      todoId,
      userId
    },
    UpdateExpression: 'SET attachmentUrl = :attachment',
    ExpressionAttributeValues: {
      ':attachment': attachmentUrl
    }
  }).promise()
}

const deleteTodo = async (todoId: string, userId: string): Promise<void> => {
  try {
    await docClient.delete({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      }
    }).promise()
  } catch (err) {
    createLogger(`Error while deleting document: ${err}`)
  }
}

const getTodo = async (todoId: string, userId: string) => {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      }
    })
    .promise()

  return result.Item
}

export {
  getAllTodos,
  createTodo,
  updateTodo,
  updateTodoAttachment,
  deleteTodo,
  getTodo,
};