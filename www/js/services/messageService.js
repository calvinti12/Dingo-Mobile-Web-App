/**
 * Message Service.
 *
 */

dingo.services.factory('Message', function($http, $state, User) {

  return {

    active_chat: {
      conversation_id: null,
      peer: {},
      messages: []
    },

    getPeers: function(callback){
      $http.get('/api/v1/messages/peers').success(function(peers){
        callback(peers);
      });
    },

    loadChat: function(callback){
      var self = this;
      var conversationId = self.active_chat.conversation_id;
      if(conversationId){
        $http.get('/api/v1/messages?conversation_id='+conversationId).success(function(res){
          var messages = res.messages.reverse();
          self.active_chat.messages = messages;
          // mark all messages in the conversation as read
          $http.post('/api/v1/messages/mark_all_as_read',{
            conversation_id: conversationId
          }).success(function(res){
            // update badge icon
            User.setInfo(res);
          });
          if(typeof(callback)=='function') callback();
        });
      }
    },

    getTicketId: function(){
      var conversationId = this.active_chat.conversation_id;
      var x = conversationId.split('-');
      x.pop();
      x.pop();
      return x.join('-');
    },

    sendMessage: function(msg,callback){
      console.log('sending message of conversation_id',this.active_chat.conversation_id);
      var self = this;
      $http.post('/api/v1/messages',{
        receiver_id: self.active_chat.peer.user_id,
        ticket_id: self.getTicketId(),
        content: msg
      }).success(callback);
    },

    incomingMsg: function(msgObj){
      var conversation_id = msgObj.conversation_id;
      var content = msgObj.message;
      if(this.active_chat!=null && conversation_id == this.active_chat.conversation_id){
        this.loadChat();
      }
      else {
        User.info.num_unread_messages++;
        // refresh peers
        
      }
      $state.go($state.current, {}, {reload: false});
    },

    getNewConversationId: function(ticketId,receiverId){
      var idPart1 = 0
      var idPart2 = 0
      var senderId = User.getInfo().id;
      if(senderId < receiverId){
        idPart1 = senderId;
        idPart2 = receiverId;
      }
      else {
        idPart2 = senderId;
        idPart1 = receiverId;
      }
      var conversationId = ticketId + '-' + idPart1 + '-' + idPart2;
      return conversationId;
    }

  };

});