import { saveWorkerProfile } from "../services/profile.service.js";

export const setupWorkerProfile = async (req, res) => {
  const user = await saveWorkerProfile(req.user, req.body);
  res.status(200).json({
    success: true,
    message: "Profile completed successfully.",
    data: { user }
  });
};
