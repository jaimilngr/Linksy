import cloudinary from './cloudinaryconfig';

const uploadImages = async (filePaths: string[]) => {
    const uploadPromises = filePaths.map(filePath => {
      return cloudinary.uploader.upload(filePath, {
        folder: 'service_images',
      });
    });
  
    try {
      const uploadResults = await Promise.all(uploadPromises);
      return uploadResults.map(result => result.secure_url);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };
  
  export default uploadImages;