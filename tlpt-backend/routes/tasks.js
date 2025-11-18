import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('project', 'name')
      .populate('subTasks.subTasks.assignedUsers', 'username email team');

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, category, project: projectId, subTasks } = req.body;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Check if user is admin of the project
    if (project.admin.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only project admin can create tasks' 
      });
    }

    const task = new Task({
      title,
      category,
      project: projectId,
      subTasks: subTasks || []
    });

    await task.save();

    // Add task to project
    project.tasks.push(task._id);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Start task timer
router.post('/:taskId/subtasks/:subIndex/:subSubIndex/start', auth, async (req, res) => {
  try {
    const { taskId, subIndex, subSubIndex } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    const thirdLevelTask = task.subTasks[subIndex]?.subTasks[subSubIndex];
    if (!thirdLevelTask) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subtask not found' 
      });
    }

    // Check if user is assigned to this task
    const isAssigned = thirdLevelTask.assignedUsers.some(
      userId => userId.toString() === req.userId
    );

    if (!isAssigned) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this task' 
      });
    }

    // Create new time entry
    const timeEntry = {
      user: req.userId,
      startTime: new Date(),
      status: 'in_progress'
    };

    thirdLevelTask.timeEntries.push(timeEntry);
    await task.save();

    res.json({
      success: true,
      message: 'Task timer started',
      timeEntry
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Stop task timer
router.post('/:taskId/subtasks/:subIndex/:subSubIndex/stop', auth, async (req, res) => {
  try {
    const { taskId, subIndex, subSubIndex } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    const thirdLevelTask = task.subTasks[subIndex]?.subTasks[subSubIndex];
    if (!thirdLevelTask) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subtask not found' 
      });
    }

    // Find active time entry for this user
    const activeEntry = thirdLevelTask.timeEntries.find(
      entry => entry.user.toString() === req.userId && 
               entry.status === 'in_progress'
    );

    if (!activeEntry) {
      return res.status(400).json({ 
        success: false, 
        message: 'No active timer found' 
      });
    }

    activeEntry.endTime = new Date();
    activeEntry.status = 'completed';
    
    if (req.body.notes) {
      activeEntry.notes = req.body.notes;
    }
    if (req.body.commands) {
      activeEntry.commands = req.body.commands;
    }
    if (req.body.tools) {
      activeEntry.tools = req.body.tools;
    }

    await task.save();

    res.json({
      success: true,
      message: 'Task timer stopped',
      timeEntry: activeEntry
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Mark task as not applicable
router.post('/:taskId/subtasks/:subIndex/:subSubIndex/not-applicable', auth, async (req, res) => {
  try {
    const { taskId, subIndex, subSubIndex } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    const thirdLevelTask = task.subTasks[subIndex]?.subTasks[subSubIndex];
    if (!thirdLevelTask) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subtask not found' 
      });
    }

    // Create time entry with not applicable status
    const timeEntry = {
      user: req.userId,
      status: 'not_applicable',
      notes: req.body.notes || 'Marked as not applicable'
    };

    thirdLevelTask.timeEntries.push(timeEntry);
    await task.save();

    res.json({
      success: true,
      message: 'Task marked as not applicable',
      timeEntry
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update task notes
router.put('/:taskId/subtasks/:subIndex/:subSubIndex/notes', auth, async (req, res) => {
  try {
    const { taskId, subIndex, subSubIndex } = req.params;
    const { notes } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    const thirdLevelTask = task.subTasks[subIndex]?.subTasks[subSubIndex];
    if (!thirdLevelTask) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subtask not found' 
      });
    }

    // Find the latest time entry for this user
    const userEntries = thirdLevelTask.timeEntries.filter(
      entry => entry.user.toString() === req.userId
    ).sort((a, b) => new Date(b.startTime || b.createdAt) - new Date(a.startTime || a.createdAt));

    if (userEntries.length > 0) {
      userEntries[0].notes = notes;
      await task.save();
    }

    res.json({
      success: true,
      message: 'Notes updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router;
