import Warning from "../models/Warning.js";

export const createWarningService = async (warningData) => {
  const warning = await Warning.create(warningData);
  return warning;
};
