import { organizationService } from "../services/organization.service.js";

export const setupOrganizationProfile = async (req, res) => {
    const organization = await organizationService.setupProfile(
        req.user.phone,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Organization profile submitted for verification.",
        data: { organization }
    });
};

export const getOrganizationProfile = async (req, res) => {
    const organization = await organizationService.getProfile(req.user.phone);

    res.status(200).json({
        success: true,
        data: { organization }
    });
};