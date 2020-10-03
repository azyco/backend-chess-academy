const sqlConnector = require('../sql/connector');

function handleGetClassRoom(req, res) {
    if (req.session.user_authentication && req.session.user_authentication.user_type === 'admin') {
        sqlConnector.getClassrooms().then((classrom_array) => {
        console.log("classroom array sent");
        res.send({
            classrom_array: classrom_array
        });
        }).catch((error) => {
        console.log(error);
        res.status(500).send({
            error_type: 'database',
            error_code: error.code,
            error_message: error.sqlMessage
        });
        });
    } else {
        res.sendStatus(403);
    }
}

function handleClassRoomCreate(req, res) {
    console.log("posted classroom: ");
    console.log(req.body.classroom_data);
    if (req.session.user_authentication && req.session.user_authentication.user_type === 'admin') {
        if (req.body.classroom_data) {
        sqlConnector.addClassroom(req.body.classroom_data).then((response) => {
            console.log("classroom added", response);
            res.sendStatus(201);
        }).catch((error) => {
            console.log(error);
            res.status(500).send({
            error_type: 'database',
            error_code: error.code,
            error_message: error.sqlMessage
            });
        });
        } else {
            console.log("Bad Data");
            res.sendStatus(400);
        }
    } else {
        console.log("Unauthorized");
        res.sendStatus(403);
    }
}

module.exports = {
    handleGetClassRoom,
    handleClassRoomCreate
}
