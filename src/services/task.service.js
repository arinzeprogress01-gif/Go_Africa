import { Task } from "../models/task.model.js";
import { Organization } from "../models/organization.model.js";
import { ApiError } from "../utils/api-error.js";

const memoryTasks = [];

export const taskService = {
  async createTask(phone, payload) {
    const organization = await Organization.findOne({ phone });

    if (!organization) {
      throw new ApiError(404, "Organization account not found.");
    }

    if (!organization.isProfileComplete) {
      throw new ApiError(400, "Complete your organization profile first.");
    }

    if (organization.verificationStatus !== "approved") {
      throw new ApiError(
        403,
        "Your organization must be approved before publishing tasks."
      );
    }

    const {
      title,
      description,
      category,
      lga,
      location,
      neighborhood,
      date,
      startTime,
      endTime,
      workersNeeded,
      payPerWorker,
      volunteerOnly,
      proofRequirements,
      contactName,
      contactPhone
    } = payload;

    if (
      !title || !description || !category || !lga || !location ||
      !date || !startTime || !endTime || !workersNeeded ||
      !contactName || !contactPhone
    ) {
      throw new ApiError(400, "Please provide all required task details.");
    }

    if (!volunteerOnly && Number(payPerWorker) <= 0) {
      throw new ApiError(400, "Enter a valid payment per worker.");
    }

    const taskData = {
      organizationPhone: phone,
      organizationName: organization.name,
      title,
      description,
      category,
      lga,
      location,
      neighborhood: neighborhood || "",
      date: new Date(date),
      startTime,
      endTime,
      workersNeeded: Number(workersNeeded),
      payPerWorker: volunteerOnly ? 0 : Number(payPerWorker),
      volunteerOnly: Boolean(volunteerOnly),
      proofRequirements: Array.isArray(proofRequirements)
        ? proofRequirements
        : [],
      contactName,
      contactPhone,
      status: "published"
    };

    const today = new Date();
today.setHours(0, 0, 0, 0);

const taskDay = new Date(taskData.date);
taskDay.setHours(0, 0, 0, 0);

if (Number.isNaN(taskData.date.getTime()) || taskDay < today) {
  throw new ApiError(400, "Task date cannot be in the past.");
}

    const task = await Task.create(taskData);

    return task;
  },

  async getPublishedTasks(filters = {}) {
    const query = { status: "published" };

    if (filters.lga) query.lga = new RegExp(`^${filters.lga}$`, "i");
    if (filters.category) query.category = filters.category;

    return Task.find(query).sort({ createdAt: -1 }).lean();
  },

  async getTaskById(id) {
    const task = await Task.findOne({
      _id: id,
      status: "published"
    }).lean();

    if (!task) throw new ApiError(404, "Task not found.");

    return task;
  },

  async getOrganizationTasks(phone) {
    return Task.find({ organizationPhone: phone })
      .sort({ createdAt: -1 })
      .lean();
  }
};