import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary configured with cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('Cloudinary API Key:', process.env.CLOUDINARY_API_KEY ? '***' : 'Not Set');
console.log('Cloudinary API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' : 'Not Set'); 

/**
 * Upload file to Cloudinary
 * @param {string|Buffer} filePathOrBuffer - Local file path or buffer (for serverless)
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - 'image', 'video', 'raw', 'auto'
 * @param {string} originalFilename - Original filename (needed for buffer uploads)
 * @returns {Promise<object>} Upload result
 */
export const uploadToCloudinary = async (filePathOrBuffer, folder = 'webchat', resourceType = 'auto', originalFilename = null) => {
  try {
    let uploadOptions = {
      folder: folder,
      resource_type: resourceType,
      chunk_size: 6000000,
      use_filename: true,
      unique_filename: true,
    };

    // If buffer is provided, upload from buffer (serverless-friendly)
    if (Buffer.isBuffer(filePathOrBuffer)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              resolve({
                success: false,
                error: error.message
              });
            } else {
              resolve({
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                resourceType: result.resource_type,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
                duration: result.duration,
              });
            }
          }
        );
        uploadStream.end(filePathOrBuffer);
      });
    } else {
      // Traditional file path upload (for local development)
      const result = await cloudinary.uploader.upload(filePathOrBuffer, uploadOptions);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
      };
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image', 'video', 'raw'
 * @returns {Promise<object>} Delete result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // Invalidate CDN cache
    });

    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array<string>} publicIds - Array of public IDs
 * @param {string} resourceType - 'image', 'video', 'raw'
 * @returns {Promise<object>} Delete result
 */
export const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });

    return {
      success: true,
      result: result.deleted
    };
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default cloudinary;
