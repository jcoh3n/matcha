const express = require('express');
const upload = require('../middleware/upload');
const Photo = require('../models/Photo');
const router = express.Router();

// Upload a photo
router.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get user ID from auth middleware
    const userId = req.user.id;

    // Generate URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Save photo info to database
    const photo = await Photo.create({
      userId: userId,
      url: fileUrl,
      isProfile: req.body.isProfile === 'true' || req.body.isProfile === true
    });

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: photo.toJSON()
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Set a photo as profile photo
router.put('/photos/:photoId/set-profile', async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user.id;

    // Set the photo as profile photo
    const photo = await Photo.setAsProfilePhoto(photoId, userId);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    res.json({
      message: 'Profile photo updated successfully',
      photo: photo.toJSON()
    });
  } catch (error) {
    console.error('Error setting profile photo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;