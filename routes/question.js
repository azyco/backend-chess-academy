const sqlConnector = require('../sql/connector');

function handleGetQuestion(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'coach') {
      const filters = {
        coach_id: req.session.user_authentication.id,
        classroom_id: req.query.classroom_id,
        class_id: req.query.class_id,
      }
      sqlConnector.getQuestionCoach(filters).then((question_array) => {
        console.log('question array sent for coach');
        res.status(200).send(question_array);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log('unauthorized user with invalid user type trying to access question ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to access question');
    res.sendStatus(403);
  }
}

function handleAddQuestion(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.checkClassAccessPrivilegeCoach(req.session.user_authentication.id, req.body.question_details.class_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.addQuestion(req.body.question_details).then((response) => {
            console.log('question added by coach');
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
          console.log('unauthorized coach trying to add question ', req.session.user_authentication);
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
      console.log('unauthorized user with invalid user type trying to add question ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to add question');
    res.sendStatus(403);
  }
}

function handleDeleteQuestion(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.checkClassAccessPrivilegeCoach(req.session.user_authentication.id, req.query.class_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.deleteQuestion(req.query.question_id).then((response) => {
            console.log('question deleted by coach');
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
          console.log('unauthorized coach trying to delete question ', req.session.user_authentication);
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
      console.log('unauthorized user with invalid user type trying to delete question ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to delete question');
    res.sendStatus(403);
  }
}

module.exports = {
  handleGetQuestion,
  handleAddQuestion,
  handleDeleteQuestion,
};