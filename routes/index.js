const express = require('express');

const router = express.Router();

const classroomhandler = require('./classroom');
const profilehandler = require('./profile');
const coachhandler = require('./coach');
const studenthandler = require('./student');
const loginHandler = require('./login');

router.get('/', (req, res) => {
  res.send('pong');
});

router.get('/login', loginHandler.handleGetLogin);
router.post('/login', loginHandler.handleCreateLogin);
router.delete('/login', loginHandler.handleLogout);

router.get('/student', studenthandler.handleGetStudent);
router.post('/student', studenthandler.handleCreateStudent);

router.get('/coach', coachhandler.handleGetCoach);
router.post('/coach', coachhandler.handleCreateCoach);

router.get('/profile', profilehandler.handleGetProfile);
router.put('/profile', profilehandler.handleUpdateProfile);

router.get('/classroom', classroomhandler.handleGetClassRoom);
router.post('/classroom', classroomhandler.handleCreateClassRoom);
router.put('/classroom',classroomhandler.handleEditClassroom);
router.get('/user', classroomhandler.handleGetUsers);

router.get('/classroom_mappings', classroomhandler.handleGetClassroomMapping);

module.exports = router;
