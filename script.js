var socket;
var nickname;
var errorSign = "<i class='fa fa-times error'></i> ";
var init = function() {
  socket = io.connect("https://lam-node-test.herokuapp.com");
  socket.on("connect", handlers);
};
var handlers = function() {
  $("div#loadingScreenCover").remove();
  socket.emit("nickname", nickname);
  socket.on("taken", function() {
    $("body").empty();
    $("body").append("<p id='errorTaken'>" + errorSign + "<strong>Error: Nickname taken</strong>. Reloading in three seconds.");
    setTimeout(function() {
      location.reload();
    }, 3000);
    socket = null;
    return;
  });
  var message = function(message, type, nick, color) {
    var nickPrint = (nick == undefined) ? "" : "<strong>" + nick + "</strong> ";
    var messageElem = $("<div>");
    messageElem.addClass("message");
    if(type != undefined)
      messageElem.addClass(type);
    if(color != undefined)
      messageElem.css({backgroundColor: "#" + color, borderColor: "#" + color});
    messageElem.html(nickPrint);
    if(type == "image" || type == "yourImage")
      messageElem.append("<img src='" + message + "' />");
    else if(type == "status" || type == "statusBad")
      messageElem.append(message);
    else {
      message = message.replace(/</, "&lt;");
      message = message.replace(/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/, "<a class='messageLink' href='$1' target='blank'>$1 <i class='fa fa-external-link'></i></a>");
      messageElem.append(message);
    }
    $("#messages").append(messageElem);
    $("body").stop().animate({scrollTop: $(document).height()}, 200);
  };
  socket.on("allNicknames", function(allNicknames) {
    var nicknameArray = allNicknames.split(",");
    $("#nicknames").empty().html("<span id='numUsers' class='nickname'>" + nicknameArray.length + " user" + (nicknameArray.length == 1 ? "" : "s" ) + ":</span>");
    for(var i = 0; i < nicknameArray.length; i++) {
      var className = (nickname == nicknameArray[i]) ? "myNickname" : "";
      $("#nicknames").append("<span class='nickname " + className + "'>" + nicknameArray[i] + "</span>");
    }
  });
  socket.on("newuser", function(nickname) {
    message("<i class='fa fa-male'> " + nickname + " has joined the chat.", "status");
  });
  socket.on("disconnect", function(nickname) {
    message("<span class='fa-stack fa-lg'><i class='fa fa-male fa-stack-1x'></i><i class='fa fa-ban fa-stack-2x text-danger'></i></span> " + nickname + " has left the chat.", "statusBad");
  });
  socket.on("message", function(msg, nick, color) {
    message(msg, undefined, nick, color);
  });
  socket.on("yourMessage", function(msg) {
    message(msg, "your");
  });
  socket.on("image", function(imageUrl, nick, color) {
    message(imageUrl, "image", nick, color);
  });
  socket.on("yourImage", function(imageUrl) {
    message(imageUrl, "yourImage");
  });
};
$(function() {
  $("#send").blur(function() {
    if($(this).val() == "")
      return;
    socket.emit("message", $(this).val(), nickname);
    $(this).val("");
  });
  $("#nickname").blur(function() {
    if($(this).val().trim() == "") {
      $("#nicknameError").html(errorSign + "Error: Empty nickname.");
      return;
    } else if($(this).val().indexOf(",") > -1) {
      $("#nicknameError").html(errorSign + "Error: Nickname contains comma.");
      return;
    } else if($(this).val().length > 20) {
      $("#nicknameError").html(errorSign + "Error: Nickname is too long.");
      return;
    }
    $("#getNickname").remove();
    nickname = $(this).val().trim();
    $("#myNickname").text(nickname);
    init();
  });
  $("#nickname, #send").keydown(function(event) {
    if(event.which == 13) {
      event.preventDefault();
      $(this).blur();
      $("#send").focus();
    };
  });
  $("#myNickname").click(function() {
    $(this).toggleClass("active");
    $("#nicknames").slideToggle(200);
  });
  $(window).scroll(function() {
    if($("body").scrollTop() > 0) {
      $("#send").addClass("wide");
    } else {
      $("#send").removeClass("wide");
    }
  });
  $("#uploadPhoto").click(function() {
    var imageUrl = prompt("Enter image url");
    if(imageUrl == "")
      return;
    socket.emit("image", imageUrl, nickname);
  });
  $("#info").click(function() {
    alert("Realtime Chatting &hellip; w/ Node.js & Socket.io\nby Jonathan Lam <jlam55555@gmail.com>\n@ lam-node-test.herokuapp.com");
  });
});
