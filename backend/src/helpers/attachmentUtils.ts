import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { addAttachmentUrl } from '../businessLogic/todos'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

// Implement the fileStogare logic
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration: number = 300

const logger = createLogger("attachmentUtils");

export async function createAttachmentPresignedUrl(todoId: string, userId: string) {
  logger.info(`creating upload url for todo ${todoId} on bucket ${bucketName} with expiration ${urlExpiration}`)

  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })

  if (signedUrl) {
    await addAttachmentUrl(bucketName, todoId, userId)
    return signedUrl
  }
}