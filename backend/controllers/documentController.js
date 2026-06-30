import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

import Employee from "../models/Employee.js";
import Document from "../models/Document.js";

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a document.",
      });
    }

    const { documentType } = req.body;

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "Document type is required.",
      });
    }

    // Find Employee
    const employee = await Employee.findById(req.user._id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Check if document already exists
    const existingDocument = await Document.findOne({
      employee: employee._id,
      documentType,
    });

    // Delete old file from Cloudinary if replacing
    if (existingDocument) {
      await cloudinary.uploader.destroy(existingDocument.publicId);
      await Document.findByIdAndDelete(existingDocument._id);
    }

    const folder = `hrm/employee-documents/${employee.employeeId}/${documentType
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: error.message,
          });
        }

        const document = await Document.create({
          employee: employee._id,
          documentType,
          fileName: req.file.originalname,
          fileUrl: result.secure_url,
          publicId: result.public_id,
        });

        return res.status(201).json({
          success: true,
          message: "Document uploaded successfully.",
          data: document,
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate("employee", "employeeId firstName lastName email department designation")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyDocument = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    document.status = status;
    if (remarks !== undefined) document.remarks = remarks;
    document.verifiedBy = req.user.firstName + " " + req.user.lastName;
    document.verifiedAt = new Date();

    await document.save();

    res.status(200).json({
      success: true,
      message: `Document marked as ${status.toLowerCase()} successfully.`,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    // If called by Employee, they can only delete their own and if it's not Verified
    if (req.user.role === "Employee") {
      if (document.employee.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this document.",
        });
      }
      if (document.status === "Verified") {
        return res.status(400).json({
          success: false,
          message: "You cannot delete a verified document.",
        });
      }
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(document.publicId);
    } catch (cloudErr) {
      console.error("Failed to delete from Cloudinary:", cloudErr.message);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};