import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({
  signatureVersion: 'v4',
});

const bucketName = process.env.CONTACT_PHOTO_S3_BUCKET_NAME;
const urlExpiration = parseInt(process.env.AWS_SIGNED_URL_EXPIRATION) || 300;

export interface ContactPhotoMetadata {
  uploadUrl: string,
  objectUrl: string,
}

export function generateUploadUrl(objectId: string): ContactPhotoMetadata {
  const uploadUrl: string = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: objectId,
    Expires: urlExpiration
  });

  return {
    uploadUrl,
    objectUrl: `https://${bucketName}.s3.amazonaws.com/${objectId}`,
  };
}