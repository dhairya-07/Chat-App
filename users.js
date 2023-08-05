const users = new Map();

function userJoined(socketId, name, room) {
  const user = { name, room };
  users.set(socketId, user);
  return user;
}

function getUser(socketId) {
  return users.get(socketId);
}

function deleteUser(socketId) {
  return users.delete(socketId);
}
function deleteAllUsers() {
  users.clear();
}
// deleteAllUsers();

function usersInRoom(room) {
  let count = 0;
  users.forEach((user) => {
    if (user.room === room) count++;
  });
  return count;
}

module.exports = { users, userJoined, getUser, deleteUser, usersInRoom };
