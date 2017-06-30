$(document).ready(function () {
  
  const socket = io();
  let nickName = null;

  function getMessage() {
    return $("#message").val();
  }

  function resetMessage() {
    $("#message").val('');
  }

  function submitMessage(e) {
    e.preventDefault();
    if(getMessage() !== '') {
      socket.emit('chat message', {user: nickName, msg: getMessage()});
      resetMessage();
    }
    return false;
  }

  function submitNickName() {
    if($("#nickname").val() !== '') {
      socket.emit('user has nickname', {previous: nickName, new: $("#nickname").val()});
      nickName = $("#nickname").val();
      $("button[data-dismiss='modal']").trigger('click');
      $("#nickname").val('');
    }
  }

  function appendMessage(msgObject) {
    let html = 
    `<div class="panel panel-default">
      <div class="panel-body">
        <div class="pull-left" style="margin-right: 20px; color: #999;">
          ${msgObject.user}: 
        </div>
          ${msgObject.msg}
          <div class="pull-right" style="color: #aaa">
          ${(new Date()).toLocaleString()}
          </div>
      </div>
    </div>`;
    $("#messages").append(html);
  }

  function userConnected(who) {
    let html = `<p class="text-center">
      <span class="text-primary">${who} </span> 
      joined the chat
      </p>`;
    $("#messages").append(html);
  }

  function userHasNickName(user) {
    let html = `<p class="text-center">
      <span class="text-primary">${user.previous} </span> 
      is known as 
      <span class="text-success"> ${user.new}</span>
      </p>`;
    $("#messages").append(html);
  }

  function autoScrollDown() {
    $("#messages-container").animate({scrollTop: $("#messages").height()}, 50);
  }

  $("#message-form").on('submit', submitMessage);

  $("#message-form-btn").on('click', submitMessage);

  $("#nickname-submit").on('click', submitNickName);

  socket.on('chat message', function(msgObject) {
    appendMessage(msgObject);
    autoScrollDown();
  });

  socket.on('guestId', function(id) {
    nickName = `guest-${id}`;    
  });

  socket.on('user connected', function(user) {
    userConnected(user);
    autoScrollDown();
  });

  socket.on('user has nickname', function(user) {
    userHasNickName(user);
    autoScrollDown();
  });

  socket.on('total', function(total) {
    let html = `<p class="text-center">${total} person connected</p>`;
    $("#messages").append(html);
  })

});