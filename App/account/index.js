import React, { Component } from 'react';
import {
  StyleSheet,
  Image,
  AsyncStorage,
  TouchableOpacity,
  Dimensions,
  Text,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'

const { width, height } = Dimensions.get('window')

export default class Account extends React.Component {
  constructor(props){
    super(props)
    var user = this.props.user || {}
    this.state = {
      user:user
    }
  }
  //先读取缓存里面user的信息
  componentDidMount(){
    var that = this
    AsyncStorage.getItem('user')
      .then((data)=>{
        var user
        console.log(data)
        if(data){
          user = JSON.parse(data)
        }
        if(user && user.accessToken){
          that.setState({
            user:user
          })
        }
      })
  }
  render(){
    var user = this.state.user
    return(
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarTip}>添加嘟嘟头像</Text>
          <TouchableOpacity style={styles.avatarBox}>
            <Icon
              name='ios-cloud-upload-outline'
              style={styles.plusIcon}
              />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.avatarContainer}>
          <Image source={{uri:user.avatar}} style={styles.avatarContainer}>
            <View style={styles.avatarBox}>
              <Image
                source={{uri:user.avatar}}
                style={styles.avatar}
                />
            </View>
            <Text style={styles.avatarTip}>戳这里换头像</Text>
          </Image>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  toolbar:{
    flexDirection:'row',
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c'
  },
  toolbarTitle:{
    flex:1,
    fontSize:16,
    color:"#fff",
    textAlign:'center',
    fontWeight:'600'
  },
  avatarContainer:{
    width:width,
    height:140,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#eee'
  },
  avatarBox:{
    marginTop:15,
    alignItems:'center',
    justifyContent:"center"
  },
  avatarTip:{
    color:'#fff',
    backgroundColor:'transparent',
    fontSize:14
  },
  avatar:{
    marginBottom:15,
    width:width * 0.2,
    height:width * 0.2,
    resizeMode:'cover',
    borderRadius:width * 0.1
  },
  plusIcon:{
    paddingVertical:20,
    paddingHorizontal:25,
    color:'#999',
    fontSize:24,
    backgroundColor:"#fff",
    borderRadius:8
  }
});
