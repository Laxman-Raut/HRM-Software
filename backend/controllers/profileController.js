import {
  createProfileService,
  getProfileService,
  updateProfileService,
} from "../services/profileService.js";

export const createProfile = async (req, res) => {
  try {
    const profile = await createProfileService(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getMyProfile = async (req, res) => {
  try {
    const profile = await getProfileService(req.user._id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

};

export const updateProfile = async (req, res) => {
  try {
    const profile = await updateProfileService(req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};