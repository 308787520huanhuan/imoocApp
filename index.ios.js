/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, { Component } from 'react';
import {
  AppRegistry,
  AsyncStorage,
  Navigator,
  StyleSheet,
  Text,
  TabBarIOS,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import List from './App/creation/index'
import Edit from './App/edit/index'
import Account from './App/account/index'
import Login from './App/account/login'

export default class imoocApp extends Component {
  state = {
    user:null,
    selectedTab: 'List',
    logined:false,
    notifCount: 0,
    presses: 0,
  };
  componentDidMount(){
    this._asyncAppStatus()
  }
  _asyncAppStatus=()=>{
    var that = this
    AsyncStorage.getItem('user').then((data)=>{
        var user
        var newState = {}
        if(data){
          user = JSON.parse(data)
        }
        if(user && user.accessToken){
          newState.user = user
          newState.logined = true
        }
        else{
          newState.logined = false
        }

        that.setState(newState)
      })
  }

  _afterLogin=(user) => {
    var that = this
    AsyncStorage.setItem('user',JSON.stringify(user))
      .then(()=>{
        that.setState({
          logined:true,
          user:user
        })
      })
  }

  render() {
    if(!this.state.logined){
      return <Login afterLogin={this._afterLogin}/>
    }
    return (
      <TabBarIOS tintColor="#ee735c">
        <Icon.TabBarItem
          iconName='ios-videocam-outline'
          selectedIconName='ios-videocam'
          selected={this.state.selectedTab === 'List'}
          onPress={() => {
            this.setState({
              selectedTab: 'List',
            });
          }}>
          <Navigator
            initialRoute={{
              name:'list',
              component:List
            }}
            configureScene={(route) =>{
              return Navigator.SceneConfigs.FloatFromRight
            }}
            renderScene={(route,navigator)=>{
              var Component = route.component

              return < Component {...route.params} navigator={navigator}/>
            }}
          />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-recording-outline'
          selectedIconName='ios-recording'
          selected={this.state.selectedTab === 'Edit'}
          onPress={() => {
            this.setState({
              selectedTab: 'Edit',
              notifCount: this.state.notifCount + 1,
            });
          }}>
          <Edit />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-more-outline'
          selectedIconName='ios-more'
          selected={this.state.selectedTab === 'Account'}
          onPress={() => {
            this.setState({
              selectedTab: 'Account',
              presses: this.state.presses + 1
            });
          }}>
          <Account />
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('imoocApp', () => imoocApp);
