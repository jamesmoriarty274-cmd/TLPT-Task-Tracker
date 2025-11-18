import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import ProjectMember from '../models/ProjectMember.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'username', 'email']
        },
        {
          model: ProjectMember,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'email', 'team']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, teamMembers } = req.body;

    // Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Create project
    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
      category: category || 'threat_intel',
      adminId: req.userId
    });

    // Create project members if provided
    if (teamMembers && Array.isArray(teamMembers)) {
      for (const member of teamMembers) {
        await ProjectMember.create({
          ProjectId: project.id,
          UserId: member.userId,
          team: member.team
        });
      }
    }

    // Get project with all associations
    const projectWithAssociations = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'username', 'email']
        },
        {
          model: ProjectMember,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'email', 'team']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: projectWithAssociations
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'username', 'email']
        },
        {
          model: ProjectMember,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'email', 'team']
            }
          ]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router;
