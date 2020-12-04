const express = require('express');

const router = express.Router();

const classroomhandler = require('./classroom');
const profilehandler = require('./profile');
const coachhandler = require('./coach');
const studenthandler = require('./student');
const loginHandler = require('./login');
const classHandler = require('./classroom_class');
const questionHandler = require('./question');
const solutionHandler = require('./solution');

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
router.put('/classroom', classroomhandler.handleEditClassroom);
router.get('/user', classroomhandler.handleGetUsers);
router.get('/classroom_mappings', classroomhandler.handleGetClassroomMapping);

router.get('/class', classHandler.handleGetClasses);
router.post('/class', classHandler.handleAddClass);
router.delete('/class', classHandler.handleDeleteClass);
router.get('/enter_class', classHandler.handleClassEntry);
router.get('/start_class', classHandler.handleClassStart);
router.get('/end_class', classHandler.handleClassEnd);

router.get('/question', questionHandler.handleGetQuestion);
router.post('/question', questionHandler.handleAddQuestion);
router.delete('/question', questionHandler.handleDeleteQuestion);

router.get('/solution', solutionHandler.handleGetSolution);
router.post('/solution', solutionHandler.handleAddSolution);
router.put('/solution', solutionHandler.handleUpdateSolution);
router.delete('/solution', solutionHandler.handleDeleteSolution);

module.exports = router;
