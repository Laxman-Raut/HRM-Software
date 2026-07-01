import Setting from "../models/Setting.js";

export const checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    // Check if user is authenticated and attached by protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no user found",
      });
    }

    const { role } = req.user;

    // Admin always has all permissions (bypass checks)
    if (role === "Admin") {
      return next();
    }

    try {
      // Find system settings
      const settings = await Setting.findOne();
      
      // Default fallback configurations if settings are not in DB yet
      const defaultRoleSettings = {
        HR: {
          canApproveLeaves: true,
          canManageAttendance: true,
          canManagePayroll: true,
          canCreateAnnouncements: true,
          workFromHomeAllowed: true,
        },
        Manager: {
          canApproveLeaves: true,
          canManageAttendance: false,
          canManagePayroll: false,
          canCreateAnnouncements: true,
          workFromHomeAllowed: true,
        },
        Employee: {
          canApproveLeaves: false,
          canManageAttendance: false,
          canManagePayroll: false,
          canCreateAnnouncements: false,
          workFromHomeAllowed: false,
        }
      };

      let hasPermission = false;

      if (settings && settings.roleSettings && settings.roleSettings.length > 0) {
        const roleConf = settings.roleSettings.find(r => r.role === role);
        if (roleConf && roleConf[permissionKey] !== undefined) {
          hasPermission = roleConf[permissionKey];
        }
      } else {
        // Fallback to default configs
        const roleConf = defaultRoleSettings[role];
        if (roleConf && roleConf[permissionKey] !== undefined) {
          hasPermission = roleConf[permissionKey];
        }
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied: role '${role}' does not have permission '${permissionKey}'`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "RBAC verification failed",
      });
    }
  };
};
