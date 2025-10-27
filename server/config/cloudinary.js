import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path or buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - 'image', 'video', 'raw', 'auto'
 * @returns {Promise<object>} Upload result
 */
export const uploadToCloudinary = async (filePath, folder = 'webchat', resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: resourceType,
      // For large files
      chunk_size: 6000000,
      // Generate unique filename
      use_filename: true,
      unique_filename: true,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration, // for videos
    };
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
