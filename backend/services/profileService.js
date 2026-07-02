import EmployeeProfile from "../models/EmployeeProfile.js";

// Create Profile
export const createProfileService = async (employeeId, profileData) => {
  const existingProfile = await EmployeeProfile.findOne({
    employee: employeeId,
  });

  if (existingProfile) {
    throw new Error("Profile already exists");
  }

  const profile = await EmployeeProfile.create({
    employee: employeeId,
    ...profileData,
  });

  return profile;
};

// Get Profile
export const getProfileService = async (employeeId) => {
  const profile = await EmployeeProfile.findOne({
    employee: employeeId,
  }).populate(
    "employee",
    "firstName lastName email employeeId department designation profilePhoto"
  );

  return profile;
};

// Update Profile
export const updateProfileService = async (employeeId, profileData) => {
  const profile = await EmployeeProfile.findOneAndUpdate(
    {
      employee: employeeId,
    },
    profileData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!profile) {
    throw new Error("Profile not found");
  }

  return profile;
};