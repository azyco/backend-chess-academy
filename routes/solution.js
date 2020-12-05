const sqlConnector = require('../sql/connector');

function handleGetSolution(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'student') {
      const filters = {
        student_id: req.session.user_authentication.id,
        class_id: req.query.class_id,
        classroom_id: req.query.classroom_id,
      }
      sqlConnector.getSolutionStudent(filters).then((solution_array) => {
        console.log('solution array sent for student');
        res.status(200).send(solution_array);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else if (req.session.user_authentication.user_type === 'coach') {
      const filters = {
        coach_id: req.session.user_authentication.id,
        class_id: req.query.class_id,
        classroom_id: req.query.classroom_id,
        student_id: req.query.student_id,
        question_id: req.query.question_id,
      }
      sqlConnector.getSolutionCoach(filters).then((solution_array) => {
        console.log('solution array sent for coach');
        res.status(200).send(solution_array);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log('unauthorized user with invalid user type trying to access solution ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to access solution');
    res.sendStatus(403);
  }
}

function handleAddSolution(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'student') {
      sqlConnector.checkClassAccessPrivilegeStudent(req.session.user_authentication.id, req.body.solution_details.class_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.addSolution(req.body.solution_details).then((response) => {
            console.log('solution added by student');
            res.status(201).send(response);
          }).catch((error) => {
            console.log(error);
            res.status(500).send({
              error_type: 'database',
              error_code: error.code,
              error_message: error.sqlMessage,
            });
          });
        } else {
          console.log('unauthorized student trying to add solution ', req.session.user_authentication);
          res.sendStatus(403);
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log('unauthorized user with invalid user type trying to add solution ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to add solution');
    res.sendStatus(403);
  }
}

function handleUpdateSolution(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.getQuestionCoach({ coach_id: req.session.user_authentication.id }).then((question_array) => {
        let privilege = false;
        question_array.forEach((element) => { if (!privilege && element.id === req.body.solution_update_details.question_id){privilege = true}})
        if (privilege) {
          sqlConnector.updateSolution(req.body.solution_update_details).then((response) => {
            console.log('solution updated by coach');
            res.status(200).send(response);
          }).catch((error) => {
            console.log(error);
            res.status(500).send({
              error_type: 'database',
              error_code: error.code,
              error_message: error.sqlMessage,
            });
          });
        }
        else {
          console.log('unauthorized coach trying to update solution ', req.session.user_authentication);
          res.sendStatus(403);
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log('unauthorized user with invalid user type trying to update solution ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to update solution');
    res.sendStatus(403);
  }
}

function handleDeleteSolution(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'student') {
      sqlConnector.checkClassAccessPrivilegestudent(req.session.user_authentication.id, req.query.class_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.deleteSolution(req.query.solution_id).then((response) => {
            console.log('solution deleted by student');
            res.status(200).send(response);
          }).catch((error) => {
            console.log(error);
            res.status(500).send({
              error_type: 'database',
              error_code: error.code,
              error_message: error.sqlMessage,
            });
          });
        } else {
          console.log('unauthorized student trying to delete solution ', req.session.user_authentication);
          res.sendStatus(403);
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log('unauthorized user with invalid user type trying to delete solution ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to delete solution');
    res.sendStatus(403);
  }
}

module.exports = {
  handleGetSolution,
  handleAddSolution,
  handleDeleteSolution,
  handleUpdateSolution,
};