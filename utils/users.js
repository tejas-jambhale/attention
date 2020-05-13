const users = [];

//join user to chat
function userJoin(id, username, room, type) {
    const user = {
        id,
        username,
        room,
        type,
        muted: false
    };
    user.allowed = user.type === "student" ? false : true;

    users.push(user);
    return user;
}

function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

function userLeaves(id) {
    const index = users.findIndex(user => user.id ===id);
    if(index != -1){
        return users.splice(index, 1)[0];
    }
}

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

function changeItem(id){
    const a = users.find(user => user.id === id);
    a.allowed = !a.allowed;
}

module.exports = {userJoin, getCurrentUser, userLeaves, getRoomUsers, changeItem};