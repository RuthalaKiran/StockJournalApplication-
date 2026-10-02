import fs from 'fs';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

export const uploadTradeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded or file rejected by validator.',
      });
    }

    // If Cloudinary is configured, upload to Cloudinary and delete local temp file
    if (isCloudinaryConfigured) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'tradejournal/screenshots',
          resource_type: 'image',
        });

        // Clean up local temp file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully to Cloudinary',
          data: {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            filename: req.file.filename,
          },
        });
      } catch (cloudErr) {
        console.warn('⚠️ [Cloudinary Upload Error, falling back to local static URL]:', cloudErr.message);
      }
    }

    // Fallback to local server static URL
    const protocol = req.protocol;
    const host = req.get('host');
    const localUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: localUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    next(error);
  }
};
