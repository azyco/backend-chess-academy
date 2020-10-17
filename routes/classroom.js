const sqlConnector = require('../sql/connector');

function handleGetClassRoom(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'admin') {
      sqlConnector.getClassrooms().then((classroom_array) => {
        console.log('classroom array sent for admin');
        res.send({
          classroom_array: classroom_array,
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else if (req.session.user_authentication.user_type === 'student') {
      sqlConnector.getClassroomsStudent(req.query.student_id).then((classroom_array) => {
        console.log('classroom array sent for student');
        res.send({
          classroom_array: classroom_array,
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.getClassroomsCoach(req.query.coach_id).then((classroom_array) => {
        console.log('classroom array sent for coach');
        res.send({
          classroom_array: classroom_array,
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log("unauthorized user with invalid user type trying to access classrooms");
      res.sendStatus(403);
    }
  }
  else {
    console.log("unauthorized user no authentication user type trying to access classrooms");
    res.sendStatus(403);
  }
}

function handleCreateClassRoom(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'admin') {
      if (req.body.classroom_data) {
        sqlConnector.addClassroom(req.body.classroom_data).then(() => {
          console.log('classroom added by admin');
          res.sendStatus(201);
        }).catch((error) => {
          console.log(error);
          res.status(500).send({
            error_type: 'database',
            error_code: error.code,
            error_message: error.sqlMessage,
          });
        });
      } else {
        console.log("bad request while trying to add classroom");
        res.sendStatus(400);
      }
    } else {
      console.log("unauthorized user with invalid user type trying to add classrooms");
      res.sendStatus(403);
    }
  }
  else {
    console.log("unauthorized user with no authentication trying to add classrooms");
    res.sendStatus(403);
  }
}

function handleGetClassroomMapping(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'admin') {
      sqlConnector.getClassroomMappings(req.query.classroom_id).then((mappings) => {
        console.log('mapping array sent for admin');
        res.send(mappings);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log("unauthorized user with invalid user type trying to get classroom mappings");
      res.sendStatus(403);
    }
  }
  else {
    console.log("unauthorized user with no authentication trying to get classroom mappings");
    res.sendStatus(403);
  }
}

function handleEditClassroom(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'admin') {
      if (req.body.classroom_data) {
        sqlConnector.editClassroom(req.body.classroom_data).then((response) => {
          console.log('classroom edited by admin', response);
          res.sendStatus(200);
        }).catch((error) => {
          console.log(error);
          res.status(500).send({
            error_type: 'database',
            error_code: error.code,
            error_message: error.sqlMessage,
          });
        });
      } else {
        console.log("bad request while trying to edit classroom");
        res.sendStatus(400);
      }
    } else {
      console.log("unauthorized user with invalid user type trying to edit classroom");
      res.sendStatus(403);
    }
  }
  else {
    console.log("unauthorized user with no authentication trying to edit classroom");
    res.sendStatus(403);
  }
}

function handleGetUsers(req, res) {
  if(req.session.user_authentication){
    if (req.session.user_authentication.user_type === 'admin') {
      sqlConnector.getUsers(req.query.classroom_id).then((user_array) => {
        console.log('users array sent for admin');
        res.send(user_array);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log("unauthorized user with invalid user type trying to get users");
      res.sendStatus(403);
    }
  }
  else{
    console.log("unauthorized user with no authentication trying to get users");
    res.sendStatus(403);
  }
}

module.exports = {
  handleGetClassRoom,
  handleCreateClassRoom,
  handleGetClassroomMapping,
  handleEditClassroom,
  handleGetUsers
};
