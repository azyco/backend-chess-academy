function handleWebSocket(req, res) {
  console.log(req);
  res.status(200).send('test ws works');
}

module.exports = {
  handleWebSocket,
};
