const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const { username, room, type } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

//join chatroom
socket.emit('joinroom', {username, room, type, allowed: false});

socket.on('message', message => {
  outputMessage(message);

  //scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  document.querySelector('#msg').value = '';
  document.querySelector('#msg').focus();
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  //emit messsage to server
  socket.emit('chatMessage', msg);
});

//get users in the room
socket.on('roomUsers', ({room, users}) => {
  outputUsers(users);
});

outputMessage = (msg) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
    <p class="meta">${msg.username} <span>${msg.time}</span></p>
    <p class="text">
      ${msg.text}
    </p>
    `;
  chatMessages.appendChild(div);
}

outputUsers = users => {
  const userList = document.querySelector('#users');
  const teacherName = document.querySelector('#teacher');
  while(userList.hasChildNodes()){
    userList.removeChild(userList.firstChild);
  }
  while(teacherName.hasChildNodes()){
    teacherName.removeChild(teacherName.firstChild);
  }

  users.map(user => {
    const div = document.createElement('div');
    div.className = 'chatUsers';
    const button = document.createElement('button');
    const muteButton = document.createElement('button');
    const viewButton = document.createElement('button');
    button.id = user.id;
    muteButton.id = user.id;
    viewButton.id = user.id;
    button.className = 'button';
    muteButton.className = 'button';
    viewButton.className = 'button';
    button.innerHTML = user.allowed ? "<i class=\"fal fa-times\"></i> Disallow" : "<i class=\"far fa-check\"></i> Allow";
    muteButton.innerHTML = user.muted ? "<i class=\"fas fa-volume\"></i> Unmute" : "<i class=\"fas fa-volume\"></i> Mute";
    viewButton.innerHTML = "View Video";
    button.onclick = () => handleClick(event, users);
    const listElement = document.createElement('li');
    listElement.innerHTML = user.username;
    div.appendChild(listElement);
    if(user.type === "student" && type === "teacher"){
      div.appendChild(button);
      div.appendChild(viewButton);
    }else{
      const span1 = document.createElement('span');
      const span2 = document.createElement('span');
      div.appendChild(span1);
      div.appendChild(span2);
    }
    div.append(muteButton);
    user.type === 'teacher' ? (type === 'student' ? teacherName.appendChild(div) : null)  : userList.appendChild(div);
  })
}

handleClick = (e, users) => {
  const kickToggleId = e.target.id;
  const a = users.find(user => user.id === kickToggleId);
  a.allowed = !a.allowed;
  socket.emit('changeArray', kickToggleId);
  outputUsers(users);
}

//student raises hand to request access
raiseHand = () => {
  socket.emit('requesting', username);
}

window.onload = () => {
  document.querySelector('#msg').placeholder = type==='teacher' ? 'Type your answer here...' : 'Type your query here...';
  document.querySelector('.raise-btn').style.visibility = type==='teacher' ? 'hidden' : 'visible';
  document.querySelector('#msg').style.width = type==='teacher' ? '100%' : '75%';
  document.getElementById("urr").innerHTML = 'Username: '+username;
  update_button();
}





"use strict"
    const _states={
      idle: 0,
      loading: 1,
      enabled: 2,
      disabled: 3
    };
    let attentive = 0;
    let non_atten = 0;
    let globalId;
    let total = 0;
    let ct;
    let _state = _states.enabled;
    let newData = [];
    let uname = username;
    let connectedUsers = []; 
    let yvalue;
    let val = []; 
    var uiii = {};
    var un;
   


    function toggle_canvasContainer(isShow){
      const DOMcanvasContainer = document.getElementById('glanceTrackerCanvasContainer');
      if (!DOMcanvasContainer) return;
      DOMcanvasContainer.style.opacity = (isShow) ? '0' : '0';
    };

  // function myname() {
  //   const usr = document.getElementById("alli").value;
  //   username = usr;
  //   document.getElementById("urr").innerHTML = 'Username: '+usr;
  //   // var textfield = document.getElementById("registerfield");
  //   // var charset = document.getElementById("chartContainer");
  //   // var charset1 = document.getElementById("barChartContainer");
  //   // textfield.remove();
  //   // charset.remove();
  //   // charset1.remove();
  // };


    function toggle_glanceTracking(event){
    //the user clic on the button
      switch(_state){
        case _states.idle:
          init_glanceTracking();
          break;

        case _states.loading:
          break;

        case _states.enabled:
          GLANCETRACKERAPI.toggle_pause(true, true);
          toggle_canvasContainer(false);
          _state = _states.disabled;
          break;

        case _states.disabled:
          GLANCETRACKERAPI.toggle_pause(false, true);
          toggle_canvasContainer(true);
          _state = _states.enabled;
          break;
      }
      update_button();
    }; //end toggle_glanceTracking()

    function myFunction() {
      globalId = document.getElementById("thisi").childNodes[0].id;
    }
    
    function update_button(){
      const  DOMbutton = document.getElementById('toggleGlanceTracking');
      let buttonText = 'undefined';
      
      switch(_state){
        case _states.idle:
        case _states.disabled:
          buttonText = 'Enable glance tracking';
          DOMbutton.style.backgroundColor = 'rgb(12, 127, 194)';
          break;

        case _states.loading:
          buttonText = 'LOADING...';
          break;

        case _states.enabled:
          buttonText = 'Disable glance tracking';
          DOMbutton.style.backgroundColor = 'indianred';
          break;
      }
      DOMbutton.innerHTML = buttonText;
    }; //end update_button()

    function calAttention(duration, noat){
      return duration - noat;
    }
    function init_glanceTracking(){
      console.log('aa');
      _state = _states.loading;
      GLANCETRACKERAPI.init({
        callbackTrack: function(isDetected){
          // console.log('DETECTION changed ! isDetected = ', isDetected);
          myFunction();
          const DOMvideo = document.getElementById(globalId);
          if (!DOMvideo) return;
          if (isDetected){
            // DOMvideo.play();
            yvalue = 1;
            ct = DOMvideo.currentTime
            non_atten = DOMvideo.currentTime
            toggle_canvasContainer(false);
            
          } else {
            // DOMvideo.pause();
            attentive = DOMvideo.currentTime - non_atten;
            total += attentive;
            yvalue = 0;
            // console.log(total);
            toggle_canvasContainer(true);
          }
        },
        callbackReady: function(error){
          if (error){
            alert('AN ERROR HAPPENS :( CODE ='+error);
            return;
          }
          console.log('GLANCETRACKERAPI is READY YEAH !');
          _state = _states.enabled;
          update_button();
          toggle_canvasContainer(true);
        },
       
        isDisplayVideo: true,
        canvasId: 'glanceTrackerCanvas',
        NNCpath: 'https://appstatic.jeeliz.com/glanceTracker/' //where is NNC.json ?
      }); //end GLANCETRACKERAPI.init call
    }; //end init()

     $(function () {
      init_glanceTracking();
       var socket = io();
        setInterval(function() {
         socket.emit('chat message', {'yvalue': yvalue, 'username': uname});
        }, 3000);  
        socket.on('chat message', function(msg){
          console.log(msg);
          if (document.getElementsByClassName("teacher")[0].innerHTML == "<p>This is admin</p>"){
            if (!connectedUsers.includes(msg.username)) {
              connectedUsers.push(msg.username);
              val.push(msg.yvalue);
              uiii[msg.username] = 0;
              var a=0;
              var b=0;
              newData.push({'type': "spline", 'showInLegend': true, 'name': msg.username, 'dataPoints': [],'average': a,'count':b})
            } 
            uiii[msg.username] = msg.yvalue;
            //console.log(uiii,66)
            }
        });
      });
