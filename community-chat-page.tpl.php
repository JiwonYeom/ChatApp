<?php
$block = module_invoke('block', 'block_view', 9);
?>

<div id="chatContainer" ng-app="communityChat">
  <div class="controller_container" ng-controller="chatController">
    <div class="sidebar_area"></div>
    <div class="sidebar col-md-3 panel panel-default">
      <div class="comInfo">
        <div class="mainImage">
          <div>
            <img src="{{comInfo.imagepath}}" alt="community main image" />
          </div>
        </div>
        <h2 class="community-title">{{comInfo.title}}</h2>
      </div>
      <ul class="side_list panel-body list-unstyled">
        <li class="general">
          <h3 class="title">일반</h3>
          <ul class="side_items list-unstyled" id="test">
            <li ng-click="category = 'collection'">Data-Set Collection</li>
            <li ng-click="category = ''">주요공지</li>
            <li ng-click="category = ''">일정</li>
            <li ng-click="category = ''">주소록</li>
          </ul>
        </li>
        <li class="channels">
          <h3 class="title">채널
            <span class="add_btn" ng-click="add =true">
              <span class="glyphicon glyphicon-plus-sign" ng-hide="add == true"></span>
              <span class="disable glyphicon glyphicon-plus-sign" ng-show="add == true"></span>
            </span>
            <div class="add_container form-group" ng-show="add == true">
              <label for="addChannel">채널명</label>
              <span class="cancel_btn glyphicon glyphicon-remove-sign" ng-show="add == true" ng-click="add =false"></span>
              <div class="input-group">
                <input type='text' class="form-control" id="addChannel" ng-model="channelName"/>
                <div class="add_channel_btn input-group-addon" ng-click="addChannel()">
                  <span class="glyphicon glyphicon-plus"></span>
                </div>
              </div>
            </div>
          </h3>
          <ul class="side_items list-unstyled">
              <li ng-repeat="channel in channels" ng-click="changeChannel($index)" ng-class="{'active': activeClass==$index}">
                {{channel.channel_name}}
                <span class="del_btn glyphicon glyphicon-minus-sign" ng-click="deleteChannel($index)"></span>
              </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="main_container col-md-9">
      <div class="content_header">
        <div class="page-header community-title">
          <h2>{{comInfo.title}}<small><p class="{{moreClass}}"><span>{{comInfo.description}}</span></p><a class="readmore" ng-hide="moreVisible" ng-click="comDescript()">{{more}}</a></small></h2>
        </div>
        <div class="content_option">
          <div class="switch btn-group" role="group">
            <button type="button" class="btn btn-default switch-card" ng-click="list = 'card'">
              <span class="glyphicon glyphicon-th-large"></span>
            </button>
            <button type="button" class="btn btn-default switch-list" ng-click="list = 'list'">
              <span class="glyphicon glyphicon-list"></span>
            </button>
          </div>
          <form action="" class="form-inline" name="search" ng-submit="chatSearch()">
            <div class="search-list form-group">
              <label class="search-addon glyphicon glyphicon-search" for="src-list"></label>
              <input type="text" class="src-list form-control" name="src-list" placeholder="search" ng-model="searchVal"/>
              <input type="submit" class="src-submit" name="src-submit" value="Submit" />
            </div>
          </form>
        </div>
        <h3 class="content-subtitle">{{chanName}}</h3>
      </div>
      <div class="main_content">
        <!-- 블록 렌더 -->
        <div ng-show="category == 'collection'"><?php print render($block['content']); ?></div>
        <chat-page-list-directive ng-show="list == 'list'"></chat-page-list-directive>
        <chat-page-card-directive ng-show="list == 'card'"></chat-page-card-directive>
        <chat-form-directive></chat-form-directive>
      </div>
    </div>
  </div>
</div>

