  'use strict'
var chatFormDirective = function(){
  return {
    restrict : 'E',
    templateUrl : '/sites/all/modules/custom/community_chat/templates/chatFormDirective.html'
  }
}
angular.module('communityChat').directive('chatFormDirective',chatFormDirective);
