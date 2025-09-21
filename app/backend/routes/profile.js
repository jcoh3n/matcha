const express = require("express");
const {
  getProfile,
  updateProfile,
  getAllTags,
  addUserTags,
  getUserTags,
  addPhoto,
  setProfilePhoto,
  deletePhoto,
  updateLocation,
} = require("../controllers/profileController");
const {
  getPublicProfile,
  likeUser,
  unlikeUser,
  blockUser,
  unblockUser,
  reportUser,
  passUser,
  unpassUser,
} = require("../controllers/socialController");
const { authJWT } = require("../middleware/authJWT");

const router = express.Router();

// Profile routes
router.get("/me", authJWT, getProfile);
router.put("/me", authJWT, updateProfile);

// Public profile route
router.get("/:id", authJWT, getPublicProfile);

// Social interaction routes
router.post("/likes/:id", authJWT, likeUser);
router.delete("/likes/:id", authJWT, unlikeUser);
router.post("/:id/block", authJWT, blockUser);
router.delete("/:id/block", authJWT, unblockUser);
router.post("/:id/report", authJWT, reportUser);
// Pass routes
router.post("/:id/pass", authJWT, passUser);
router.delete("/:id/pass", authJWT, unpassUser);

// Tag routes
router.get("/tags", getAllTags);
router.post("/me/tags", authJWT, addUserTags);
router.get("/me/tags", authJWT, getUserTags);

// Photo routes
router.post("/me/photos", authJWT, addPhoto);
router.put("/me/photos/:photoId/profile", authJWT, setProfilePhoto);
router.delete("/me/photos/:photoId", authJWT, deletePhoto);

// Location routes
router.put("/me/location", authJWT, updateLocation);

module.exports = router;
