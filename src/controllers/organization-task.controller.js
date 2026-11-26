import { taskService } from "../services/task.service.js";

export const createTask = async (req, res) => {
    const task = await taskService.createTask(req.user.phone, req.body);

    res.status(201).json({
        success: true,
        message: "Task published successfully.",
        data: { task }
    });
};

export const discoverTasks = async (req, res) => {
    const tasks = await taskService.getPublishedTasks({
        lga: req.query.lga,
        category: req.query.category
    });

    res.status(200).json({
        success: true,
        data: {
            count: tasks.length,
            tasks
        }
    });
};

export const getTaskDetails = async (req, res) => {
    const task = await taskService.getTaskById(req.params.id);

    res.status(200).json({
        success: true,
        data: { task }
    });
};

export const getMyOrganizationTasks = async (req, res) => {
    const tasks = await taskService.getOrganizationTasks(req.user.phone);

    res.status(200).json({
        success: true,
        data: { tasks }
    });
};