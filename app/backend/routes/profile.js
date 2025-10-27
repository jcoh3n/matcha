const express = require("express");
const router = express.Router();
const { authJWT } = require("../middleware/authJWT");
const profileController = require("../controllers/profileController");
const socialController = require("../controllers/socialController");

router.get("/me", authJWT, profileController.getProfile);
router.put("/me", authJWT, profileController.updateProfile);

router.get("/:id", authJWT, socialController.getPublicProfile);

router.post("/likes/:id", authJWT, socialController.likeUser);
router.delete("/likes/:id", authJWT, socialController.unlikeUser);
router.post("/:id/block", authJWT, socialController.blockUser);
router.delete("/:id/block", authJWT, socialController.unblockUser);
router.post("/:id/report", authJWT, socialController.reportUser);
router.post("/:id/pass", authJWT, socialController.passUser);
router.delete("/:id/pass", authJWT, socialController.unpassUser);

router.get("/tags", profileController.getAllTags);
router.post("/me/tags", authJWT, profileController.addUserTags);
router.get("/me/tags", authJWT, profileController.getUserTags);

router.post("/me/photos", authJWT, profileController.addPhoto);
router.put(
  "/me/photos/:photoId/profile",
  authJWT,
  profileController.setProfilePhoto
);
router.delete("/me/photos/:photoId", authJWT, profileController.deletePhoto);

router.get("/me/matches", authJWT, profileController.getMatchesUser);

router.put("/me/location", authJWT, profileController.updateLocation);

module.exports = router;
