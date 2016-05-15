var ref = new Firebase("https://ltm-js-atl-1.firebaseio.com/");

$(document).ready(function () {
    if (jsApp.isLoggedIn()) {
        $('#loginInfo').html(jsApp.currentUser.google.displayName);
        $('#loggedIn').show();
        $('#btnLogin').hide();
        messageClass.getMessages();
    } else {
        $('#loggedIn').hide();
        $('#btnLogin').show();
    }
    $('#btnLogin').on('click', jsApp.login);
    $('#btnLogout').on('click', jsApp.logout);
    $('#sendMessage').on('click', messageClass.postMessage);
})

var jsApp = {
    currentUser: {},
    username: '',
    isLoggedIn: function () {
        jsApp.currentUser = ref.getAuth();
        if (jsApp.currentUser !== null) {
            jsApp.username = jsApp.currentUser.google.displayName;
        }
        return (jsApp.currentUser !== null);
    },
    login: function () {
        if (!jsApp.isLoggedIn()) {
            ref.authWithOAuthPopup("google", function (error, authData) {
                if (error) {
                    $('#loginInfo').html(error);
                } else {
                    jsApp.currentUser = authData;
                    jsApp.username = authData.google.displayName;
                    $('#loginInfo').html(jsApp.username);
                    $('#loggedIn').show();
                    $('#btnLogin').hide();
                }
            });
        } else {
            $('#loginInfo').html(jsApp.username);
        }
    },
    logout: function () {
        jsApp.currentUser = null;
        jsApp.username = '';
        ref.unauth();
        $('#loggedIn').hide();
        $('#btnLogin').show();
    }
};

var messageClass = (function () {

    var postMessage = function (event) {
        // by default a form submit reloads the DOM which will subsequently reload all our JS
        // to avoid this we preventDefault()
        event.preventDefault()

        // grab user message input
        var message = $('#message').val()

        // clear message input (for UX purposes)
        $('#message').val('')

        // create a section for messages data in your db
        var messagesReference = ref.child('messages');

        // use the set method to save data to the messages
        messagesReference.push({
            message: message,
            user: jsApp.username,
            votes: 0
        })
    };

    var getMessages = function (event) {
        var allMessages = [];
        var $messageBoard = $('#results');
        // use reference to app database to listen for changes in messages data
        ref.child('messages').on('value', function (results) {
            $messageBoard.html('');
            allMessages = [];
            var messages = results.val();
            // iterate through results coming from database call; messages
            for (var item in messages) {
                var msg = messages[item].message;
                var votes = messages[item].votes;
                var user = messages[item].user;
                // bind the results to the DOM
                $messageList = $('<li></li>');
                $messageList.attr('data-id', item);
                $user = $('<div class="user">').html(user);

                // create up vote element
                var $upVoteElement = $('<i class="fa fa-thumbs-up pull-right"></i>')
                $upVoteElement.on('click', function (e) {
                    var id = $(e.target.parentNode).data('id');
                    votes = Number.parseInt($(e.target.parentNode).find('.curvotes').html());
                    updateMessage(id, ++votes);
                });

                // create down vote element
                var $downVoteElement = $('<i class="fa fa-thumbs-down pull-right"></i>')
                $downVoteElement.on('click', function (e) {
                    var id = $(e.target.parentNode).data('id');
                    votes = Number.parseInt($(e.target.parentNode).find('.curvotes').html());
                    updateMessage(id, --votes);
                });

                var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>')
                $deleteElement.click(function (e) {
                    var id = $(e.target.parentNode).data('id')
                    deleteMessage(id)
                })

                $messageList.html(msg);
                $messageList.append($user);
                $messageList.append($deleteElement);
                $messageList.append($upVoteElement);
                $messageList.append($downVoteElement);
                $messageList.append('<div class="curvotes pull-right">' + votes + '</div>')
                allMessages.push($messageList);
            }
            for (var i in allMessages) {
                $messageBoard.append(allMessages[i]);
            }
        });
    };

    var updateMessage = function updateMessage(id, votes) {
        // find message whose objectId is equal to the id we're searching with
        var messageReference = new Firebase('https://ltm-js-atl-1.firebaseio.com/messages/' + id)

        // update votes property
        messageReference.update({
            votes: votes
        })
    };

    var deleteMessage = function (id) {
        // find message whose objectId is equal to the id we're searching with
        var messageReference = new Firebase('https://ltm-js-atl-1.firebaseio.com/messages/' + id)
        messageReference.remove()
    };

    return {
        postMessage: postMessage,
        getMessages: getMessages,
        updateMessage: updateMessage
    }

})();