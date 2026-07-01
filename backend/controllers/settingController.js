import Setting from "../models/Setting.js";

// Get Settings (Admins only)
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // Create default settings if they don't exist
      settings = await Setting.create({
        companyName: "HRM Portal",
        supportEmail: "support@company.com",
        currency: "USD",
        allowEmployeeRegistration: false,
        themeMode: "dark",
        themeColor: "blue",
        smtpHost: process.env.EMAIL_HOST || "smtp.gmail.com",
        smtpPort: Number(process.env.EMAIL_PORT || 587),
        smtpUser: process.env.EMAIL_USER || "",
        smtpPass: process.env.EMAIL_PASS || "",
        roleSettings: [
          {
            role: "Admin",
            maxLeavesPerYear: 30,
            canApproveLeaves: true,
            canManageAttendance: true,
            canManagePayroll: true,
            canCreateAnnouncements: true,
            canIssueWarnings: true,
            workFromHomeAllowed: true,
          },
          {
            role: "HR",
            maxLeavesPerYear: 20,
            canApproveLeaves: true,
            canManageAttendance: true,
            canManagePayroll: true,
            canCreateAnnouncements: true,
            canIssueWarnings: true,
            workFromHomeAllowed: true,
          },
          {
            role: "Manager",
            maxLeavesPerYear: 18,
            canApproveLeaves: true,
            canManageAttendance: false,
            canManagePayroll: false,
            canCreateAnnouncements: true,
            canIssueWarnings: true,
            workFromHomeAllowed: true,
          },
          {
            role: "Employee",
            maxLeavesPerYear: 15,
            canApproveLeaves: false,
            canManageAttendance: false,
            canManagePayroll: false,
            canCreateAnnouncements: false,
            canIssueWarnings: false,
            workFromHomeAllowed: false,
          },
        ],
      });
    }
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve settings",
    });
  }
};

// Update Settings (Admins only)
export const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    const { companyName, supportEmail, currency, allowEmployeeRegistration, themeMode, themeColor, smtpHost, smtpPort, smtpUser, smtpPass, roleSettings } = req.body;

    if (companyName !== undefined) settings.companyName = companyName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (currency !== undefined) settings.currency = currency;
    if (allowEmployeeRegistration !== undefined) settings.allowEmployeeRegistration = allowEmployeeRegistration;
    if (themeMode !== undefined) settings.themeMode = themeMode;
    if (themeColor !== undefined) settings.themeColor = themeColor;
    if (smtpHost !== undefined) settings.smtpHost = smtpHost;
    if (smtpPort !== undefined) settings.smtpPort = smtpPort;
    if (smtpUser !== undefined) settings.smtpUser = smtpUser;
    if (smtpPass !== undefined) settings.smtpPass = smtpPass;
    if (roleSettings !== undefined) settings.roleSettings = roleSettings;

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update settings",
    });
  }
};

// Get permissions for logged-in user role (all authenticated users)
export const getMyPermissions = async (req, res) => {
  try {
    const role = req.user.role;

    // Find system settings
    const settings = await Setting.findOne();

    const defaultRoleSettings = {
      Admin: {
        maxLeavesPerYear: 30,
        canApproveLeaves: true,
        canManageAttendance: true,
        canManagePayroll: true,
        canCreateAnnouncements: true,
        canIssueWarnings: true,
        workFromHomeAllowed: true,
      },
      HR: {
        maxLeavesPerYear: 20,
        canApproveLeaves: true,
        canManageAttendance: true,
        canManagePayroll: true,
        canCreateAnnouncements: true,
        canIssueWarnings: true,
        workFromHomeAllowed: true,
      },
      Manager: {
        maxLeavesPerYear: 18,
        canApproveLeaves: true,
        canManageAttendance: false,
        canManagePayroll: false,
        canCreateAnnouncements: true,
        canIssueWarnings: true,
        workFromHomeAllowed: true,
      },
      Employee: {
        maxLeavesPerYear: 15,
        canApproveLeaves: false,
        canManageAttendance: false,
        canManagePayroll: false,
        canCreateAnnouncements: false,
        canIssueWarnings: false,
        workFromHomeAllowed: false,
      },
    };

    let permissions = defaultRoleSettings[role] || defaultRoleSettings.Employee;

    if (settings && settings.roleSettings && settings.roleSettings.length > 0) {
      const roleConf = settings.roleSettings.find((r) => r.role === role);
      if (roleConf) {
        permissions = roleConf;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        permissions,
        themeMode: settings ? settings.themeMode : "dark",
        themeColor: settings ? settings.themeColor : "blue",
        companyName: settings ? settings.companyName : "HRM Portal",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve permissions",
    });
  }
};
