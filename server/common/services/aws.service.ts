import * as path from 'path'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as AWS from 'aws-sdk'
import sharp = require('sharp')
import { PromiseResult } from 'aws-sdk/lib/request'

@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name)
  private readonly awsS3: AWS.S3
  public readonly CDN_URL: string
  public readonly S3_BUCKET_NAME: string

  constructor(private readonly configService: ConfigService) {
    this.awsS3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    })
    this.CDN_URL = this.configService.get('AWS_S3_CDN_URL')
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME')
  }

  public async uploadFileToS3(
    folder: string,
    file: Express.Multer.File,
    imageOptions?: {
      width: number
      height: number
      fit?: keyof sharp.FitEnum
      notImageErrorMessage?: string
    },
  ): Promise<{
    key: string
    s3Object: PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>
    contentType: string
  }> {
    try {
      if (imageOptions) {
        const { width, height, fit, notImageErrorMessage } = imageOptions
        // ex. file.mimetype == 'image/png'
        if (!(file.mimetype.split('/')[0] === 'image'))
          throw new BadRequestException(
            notImageErrorMessage || 'Non-images cannot be resized.',
          )
        const originFormat = file.mimetype.split('/')[1] // ex. png, jpg, ...
        const sharpFormat = (originFormat === 'jpg' ? 'jpeg' : originFormat) as
          | keyof sharp.FormatEnum
          | sharp.AvailableFormatInfo
        const originKey =
          `${folder}/${Date.now()}_${width}x${height}_${path.basename(
            file.originalname,
          )}`.replace(/ /g, '') // ex. users/wow.hello.jpg
        const sharpKey = `${originKey
          .split('.')
          .slice(0, -1)
          .join('_')}.${sharpFormat}` // ex. users/wow_hello.jpeg
        const contentType = `image/${sharpFormat}`
        const resizedImage = await sharp(file.buffer)
          .resize(width, height, {
            fit: fit ? fit : 'cover',
          })
          .toFormat(sharpFormat)
          .toBuffer()
        const s3Object = await this.awsS3
          .putObject({
            Bucket: this.S3_BUCKET_NAME,
            Key: sharpKey,
            Body: resizedImage,
            ACL: 'public-read',
            ContentType: contentType,
          })
          .promise()
        return { key: sharpKey, s3Object, contentType }
      } else {
        const key = `${folder}/${Date.now()}_${path.basename(
          file.originalname,
        )}`.replace(/ /g, '')
        const s3Object = await this.awsS3
          .putObject({
            Bucket: this.S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ACL: 'public-read',
            ContentType: file.mimetype,
          })
          .promise()
        return { key, s3Object, contentType: file.mimetype }
      }
    } catch (error) {
      throw new BadRequestException(`File upload failed : ${error}`)
    }
  }

  public async deleteS3Object(
    key: string,
    callback?: (err: AWS.AWSError, data: AWS.S3.DeleteObjectOutput) => void,
  ): Promise<{ success: true }> {
    try {
      await this.awsS3
        .deleteObject(
          {
            Bucket: this.S3_BUCKET_NAME,
            Key: key,
          },
          callback,
        )
        .promise()
      return { success: true }
    } catch (error) {
      throw new BadRequestException(`Failed to delete file : ${error}`)
    }
  }

  public getAwsS3FileUrl(objectKey: string) {
    return this.CDN_URL
      ? `https://${this.CDN_URL}/${objectKey}`
      : `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${objectKey}`
  }
}
