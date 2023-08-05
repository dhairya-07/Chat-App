const { Router } = require("express");
const io = require("socket.io");
const router = Router();

router.get("/", (req, res) => {
  return res.render("home");
});

router.post("/", (req, res) => {
  const { name, roomId } = req.body;
  const queryParams = req.params;
  queryParams.name = name;
  queryParams.roomId = roomId;
  const redirectURL =
    `/chat-room?` + new URLSearchParams(queryParams).toString();
  return res.redirect(redirectURL);
});

router.get("/chat-room", (req, res) => {
  return res.render("chat_room");
});

module.exports = router;
