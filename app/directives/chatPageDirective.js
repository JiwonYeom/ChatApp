  'use strict'
var chatPageListDirective = function(){
  return {
    restrict : 'E',
    templateUrl : '/sites/all/modules/custom/community_chat/templates/chatPageListDirective.html'
  }
}
var chatPageCardDirective = function(){
  return {
    restrict : 'E',
    templateUrl : '/sites/all/modules/custom/community_chat/templates/chatPageCardDirective.html'
  }
}
angular.module('communityChat').directive('chatPageListDirective',chatPageListDirective);
angular.module('communityChat').directive('chatPageCardDirective',chatPageCardDirective);