var chatController = function($scope, ngDialog, $window, $http, $timeout, Upload) {
  function getUrlParams() {
    var params = {};
    var url = window.location.pathname;
    var url_arr = url.split('/');
    return url_arr[2];
  }
  params = getUrlParams();

  gid = params;
  $scope.gid = gid;
  // 처음 리스트 형태 결정
  $scope.list = 'list';
  //유저 obj
  $http.get('/api/user').success(function(result){
    $scope.user = result;
  });

  //리스트 불러오기 세트 수
  var set = 1;
  //채널 리스트 불러오기
  $scope.activeClass = 0; // active 클래스 부여
  getChannel();
  function getChannel(){
    $http.get('/api/retrieve/channel/' + gid).success(function(result){
      $scope.channels = result;
      // 처음 cid를 첫번째 cid로 설정
      // 채널이 없을 경우 기본 채널을 하나 생성해줌
      if($scope.channels.length == 0){
        $scope.channelName = '일반채널';
        $http.get('/api/add/channel/' + gid + '/' + $scope.channelName).success(function(result){
        $scope.channels = result;
        $scope.add = false;
        $scope.channelName = '';
        $scope.cid = result[0]['cid'];
        $scope.chanName = result[0]['channel_name']; //채널명 설정
        //처음 페이지 나오자마자 로드
        loadChat();
        });
      }else{
        $scope.cid = result[0]['cid'];
        $scope.chanName = result[0]['channel_name']; //채널명 설정
        //처음 페이지 나오자마자 로드
        loadChat();
      }
    });
  };

  //채널 클릭시 채널 전환
  $scope.changeChannel = function(index){
    //로드되는 채팅 갯수 초기화
    $http.get('/api/retrieve/channel/' + gid).success(function(result){
      $scope.channels = result;
      // 처음 cid를 첫번째 cid로 설정
      $scope.cid = result[index]['cid'];
      $scope.chanName = result[index]['channel_name']; //채널명 설정
      set =1;
      loadChat();
      $scope.activeClass = index; // active class 부여
    });
  }

  function loadInterval(){
    $timeout(function() {
      loadChat();
      loadInterval();
    }, 1000)
  };
  loadInterval();

  //챗 리스트 불러오기
  function loadChat(){
    // console.log(set);
    $http.get('/api/retrieve/chat/' + $scope.cid + '/' + set).success(function(result){
      $scope.chatArray = result;
    });
  }

  //챗 리스트 '더' 불러오기
  $scope.loadMore = function(){
    set++;
  }

  //showFile (임시)
  $scope.showFile = function(){
  }

  //토큰 받아오기
  var token;
  $http.get('/services/session/token').success(function(result){
    token = result;
  });

  //채널 추가하기
  $scope.addChannel = function(){
    $http.get('/api/add/channel/' + gid + '/' + $scope.channelName).success(function(result){
      $scope.channels = result;
      $scope.add = false;
      $scope.channelName = '';
    });
  }

  //채널 삭제하기
  $scope.deleteChannel = function(index){
    //마지막 남은 채널이라면 지울 수 없게 함
    if($scope.channels.length == 1){
      // alert('You cannot remove last channel');
      var notDelAlert = ngDialog.openConfirm({
        template:
          '<p>You cannot remove last channel.</p>' +
          '<div>' +
            '<button type="button" class="btn btn-default" ng-click="closeThisDialog(0)">취소</button>' +
          '</div>',
        plain: true,
        className: 'notdel_alert ngdialog-theme-default'
      }).then(function (value) {
      }, function (value) {
      });
    }else{
      //index of selected channel
      var cid = $scope.channels[index]['cid'];
      // 삭제 확인 메세지
      var deleteConf = ngDialog.openConfirm({
        template:
          '<p>'+ $scope.channels[index]['channel_name'] +' 채널을 삭제합니다.</p>' +
          '<div>' +
            '<button type="button" class="btn btn-default" ng-click="closeThisDialog(0)">취소</button>' +
            '<button type="button" class="btn btn-danger" ng-click="confirm(1)">삭제</button>' +
          '</div>',
        plain: true,
        className: 'del_conf ngdialog-theme-default'
      }).then(function (value) {
        $http.get('/api/delete/channel/' + gid + '/' + cid).success(function(result){
          $scope.channels = result;
          //지워진 채널이 현재 보고 있는 채널이라면 채널을 바로 위 채널로 이동
          if($scope.cid == cid){
            $scope.cid--;
          }
        });
        getChannel();
      }, function (value) {
      });
    }
  }

  //채팅 submit
  $scope.chatSubmit = function(){
    if(typeof $scope.file.size ==='undefined' || typeof $scope.file === 'undefined'){
      // 메세지 객체 선언
      var MsgObj = {"message": $scope.msg,
                    "cid": $scope.cid,
                    "gid" : $scope.gid,
                    "language": 'en'};
      $http({
      method: 'POST',
      url: '/api/add/chat',
      data: MsgObj
      }).then(function successCallback(response) {
        $scope.msg='';
        $scope.file='';
      }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      });
    }else if ($scope.form.file.$valid && $scope.file) {
      fid = $scope.upload($scope.file);
      }
      angular.element('.chat_text').blur();
      $timeout(function(){
        angular.element('.main_content')[0].scrollTop = angular.element('.main_content')[0].scrollHeight;
      },1000);
    }

    // upload image
    $scope.upload = function (file) {
      //filename = file.name
      Upload.base64DataUrl(file).then(function(datastring){
        dataArray = datastring.split(",");
        Upload.http({
            url: '/eds-chat/file',
            data: {file:{
                        file: dataArray[1],
                        filename:file.name,
                        filepath:'public://chat/' + file.name}},
            headers: {"Content-Type":"application/json", "Accept":"application/json", "X-CSRF-Token":token}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded.');
            var fid = resp.data.fid;
            // 메세지 객체 선언
            var MsgObj = {"message": $scope.msg,
                          "cid": $scope.cid,
                          "gid": $scope.gid,
                          "fid":fid,
                          "language": 'en'};
            $http({
            method: 'POST',
            url: '/api/add/chat',
            data: MsgObj
            }).then(function successCallback(response) {
              $scope.msg='';
              $scope.file='';
            }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            });
            //fid = resp.data.fid
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        });
      });
      $timeout(function(){
        angular.element('.main_content')[0].scrollTop = angular.element('.main_content')[0].scrollHeight;
      },1000);
    };
  //챗 지우기
  $scope.deleteChat = function(index){
    var chatId = $scope.chatArray[index].id;
    // 삭제 확인 메세지
    var deleteChatConf = ngDialog.openConfirm({
      template:
        '<p>해당 메세지를 삭제합니다.</p>' +
        '<div>' +
          '<button type="button" class="btn btn-default" ng-click="closeThisDialog(0)">취소</button>' +
          '<button type="button" class="btn btn-danger" ng-click="confirm(1)">삭제</button>' +
        '</div>',
      plain: true,
      className: 'del_conf ngdialog-theme-default'
    }).then(function (value) {
      $http.get('/api/delete/chat/' + chatId);
    }, function (value) {
    });
  }
  //챗 수정 보조 (열기)
  $scope.editChat = function(index){
    // $scope.edit = true;
    $scope.editChatId = $scope.chatArray[index].id;
    $scope.currentEditMsg = $scope.chatArray[index].message;
    $scope.editMsg = 'asd';
    // 수정 메세지
    var deleteChatConf = ngDialog.openConfirm({
      template:
        '<p>해당 메세지를 수정합니다.</p>' +
        '<input class="form-control" ng-model="currentEditMsg"/>' +
        '<div>' +
          '<button type="button" class="btn btn-default" ng-click="closeThisDialog(0)">취소</button>' +
          '<button type="button" class="btn btn-success" ng-click="confirm(currentEditMsg)">수정</button>' +
        '</div>',
      plain: true,
      className: 'edit_conf ngdialog-theme-default'
    }).then(function (value) {
      $scope.editMsg = value;
      $scope.executeEdit();
    }, function (value) {
      console.log('cancel');
    });
  }

  //챗 수정 보조 (닫기)
  $scope.closeEdit = function(index){
    // $scope.edit = false;
    $scope.editChatId = '';
    $scope.currentEditMsg = '';
  }

  //챗 수정
  $scope.executeEdit = function(){
    // editObj = {'message':$scope.currentEditMsg,'chatId':$scope.editChatId};
    editObj = {'message':$scope.editMsg,'chatId':$scope.editChatId};
    $http({
      method: 'POST',
      url: '/api/edit/chat',
      data: editObj
      }).then(function successCallback(response) {
        $scope.closeEdit();
      }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      });
  }

  $scope.chatSearch = function(){
   //검색어를 view에 보내서 결과값을 받아옴
    $http.get('/chat-message-search?gid=' + $scope.gid + '&message=' + $scope.searchVal + '&cid=' + $scope.cid)
    .success(function(resp){
      $scope.searchValue = $scope.searchVal;
      $scope.searchArray = resp['nodes'];
      ngDialog.open({
        template: '/sites/all/modules/custom/community_chat/templates/chatSearchResult.html',
        className: 'searchRes_dialog ngdialog-theme-default',
        scope: $scope
      });
      $scope.searchVal = '';
      angular.element('.src-list').blur();
    });
  }

  // 커뮤니티 정보 받기
  $http.get('/api/info/' + $scope.gid).success(function(result){
    $scope.comInfo = result;
    $timeout(function() {$scope.checkDeskW()});
  });

  // 커뮤니티 설명 말줄임 on/off
  $scope.moreClass = '';
  $scope.moreVisible = false;
  $scope.more = 'more';
  $scope.comDescript = function(){
    if ($scope.moreClass == 'fulltext') {
      $scope.moreClass = '';
      $scope.more = 'more';
    }
    else {
      $scope.moreClass = 'fulltext';
      $scope.more = 'less';
    }
  }
  $scope.checkDeskW = function() {
    var offsetDesc = angular.element('.community-title p')[0].offsetWidth;
    var scrollDesc = angular.element('.community-title span')[0].offsetWidth;
    if (offsetDesc < scrollDesc)
      $scope.moreVisible = false;
    else
      $scope.moreVisible = true;
  }
}//controller end
angular.module('communityChat').controller('chatController', chatController);
