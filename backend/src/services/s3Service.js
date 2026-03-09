const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Verify S3 bucket exists and is accessible
exports.verifyBucket = async () => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET
    };
    await s3.headBucket(params).promise();
    console.log(`✓ S3 bucket '${process.env.AWS_S3_BUCKET}' is accessible`);
    return { success: true, message: 'Bucket is accessible' };
  } catch (error) {
    console.error(`✗ S3 bucket error:`, error.message);
    if (error.code === 'NotFound') {
      return { success: false, message: 'Bucket does not exist' };
    } else if (error.code === 'Forbidden') {
      return { success: false, message: 'Access denied to bucket' };
    }
    return { success: false, message: error.message };
  }
};

// Upload file to S3
exports.uploadFile = async (file, folder) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${folder}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' // Make files publicly accessible
    };

    const result = await s3.upload(params).promise();

    return {
      success: true,
      fileName: file.originalname,
      fileUrl: result.Location,
      key: result.Key,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

// Delete file from S3
exports.deleteFile = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey
    };

    await s3.deleteObject(params).promise();
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

// Get file from S3
exports.getFile = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey
    };

    const result = await s3.getObject(params).promise();
    return result.Body;
  } catch (error) {
    console.error('S3 get file error:', error);
    throw new Error(`Failed to get file: ${error.message}`);
  }
};

// List files in a folder
exports.listFiles = async (folder) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: folder + '/'
    };

    const result = await s3.listObjectsV2(params).promise();
    return {
      success: true,
      files: result.Contents.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified
      }))
    };
  } catch (error) {
    console.error('S3 list files error:', error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
};
