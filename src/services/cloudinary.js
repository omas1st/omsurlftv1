// src/services/cloudinary.js
import axios from 'axios';

const cloudinaryService = {
  // Upload image to Cloudinary
  uploadImage: async (file, preset = 'unsigned_preset') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      formData.append('cloud_name', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // You can dispatch this progress to a state or context
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );

      return {
        success: true,
        data: response.data,
        url: response.data.secure_url,
        publicId: response.data.public_id,
        format: response.data.format,
        width: response.data.width,
        height: response.data.height,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload image',
      };
    }
  },

  // Upload multiple images
  uploadMultipleImages: async (files, preset = 'unsigned_preset') => {
    try {
      const uploadPromises = files.map((file) => 
        cloudinaryService.uploadImage(file, preset)
      );
      
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter((result) => result.success);
      const failedUploads = results.filter((result) => !result.success);
      
      return {
        success: successfulUploads.length > 0,
        successful: successfulUploads,
        failed: failedUploads,
        total: results.length,
        successfulCount: successfulUploads.length,
        failedCount: failedUploads.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload multiple images',
      };
    }
  },

  // Delete image from Cloudinary
  deleteImage: async (publicId) => {
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          public_id: publicId,
          api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
          api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET,
          timestamp: Math.floor(Date.now() / 1000),
        }
      );

      return {
        success: response.data.result === 'ok',
        message: response.data.result === 'ok' ? 'Image deleted successfully' : 'Failed to delete image',
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        message: 'Failed to delete image',
      };
    }
  },

  // Generate image URL with transformations
  generateImageUrl: (publicId, transformations = []) => {
    const baseUrl = `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    if (transformations.length === 0) {
      return `${baseUrl}/${publicId}`;
    }
    
    const transformationString = transformations
      .map((t) => Object.entries(t).map(([key, value]) => `${key}_${value}`).join(','))
      .join('/');
    
    return `${baseUrl}/${transformationString}/${publicId}`;
  },

  // Upload QR code
  uploadQRCode: async (qrCodeDataUrl, preset = 'qr_code_preset') => {
    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      return await cloudinaryService.uploadImage(file, preset);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload QR code',
      };
    }
  },

  // Upload CSV file
  uploadCSV: async (file, preset = 'document_preset') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      formData.append('cloud_name', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        formData
      );

      return {
        success: true,
        data: response.data,
        url: response.data.secure_url,
        publicId: response.data.public_id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload CSV file',
      };
    }
  },

  // Generate signature for secure uploads
  generateSignature: async (params) => {
    try {
      const response = await axios.post('/api/cloudinary/signature', params);
      return {
        success: true,
        signature: response.data.signature,
        timestamp: response.data.timestamp,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate signature',
      };
    }
  },

  // Get image info
  getImageInfo: async (publicId) => {
    try {
      const response = await axios.get(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          params: {
            public_ids: publicId,
            api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get image info',
      };
    }
  },

  // Resize and optimize image
  optimizeImage: (url, width = 800, quality = 'auto') => {
    const optimizedUrl = url.replace(
      '/upload/',
      `/upload/w_${width},q_${quality},f_auto/`
    );
    return optimizedUrl;
  },

  // Get responsive image URLs
  getResponsiveImageUrls: (publicId, sizes = [320, 640, 768, 1024, 1366, 1600]) => {
    const urls = {};
    
    sizes.forEach((size) => {
      urls[size] = cloudinaryService.generateImageUrl(publicId, [
        { width: size, crop: 'scale' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ]);
    });

    return urls;
  },
};

export default cloudinaryService;