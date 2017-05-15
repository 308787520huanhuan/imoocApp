import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  Alert,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import Button from 'react-native-button'

import request from '../common/request'
import config from '../common/config'
import MyCountTime from '../component/myCountTime'

export default class Login extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      codeSent:false,
      countingDone:false,
      verifyCode:null,
      phone:null
    }
  }
  //获取验证码
  _sendVerifyCode=()=>{
    var phone = this.state.phone
    if(phone==null){
      Alert.alert("手机号不能为空！")
      return
    }

    var signupUrl = config.api.base + config.api.signup
    var body = {
      phone:phone
    }
    var that = this
    request.post(signupUrl,body)
      .then((data)=>{
        if(data && data.success){
          that._showVerifyCode()
        }else{
          Alert.alert("获取验证码失败，请检查手机号是否正确")
        }
      })
      .catch((error)=>{
        Alert.alert("检查网络是否正常！")
      })
  }

  //已发送验证码
  _showVerifyCode=()=>{
    this.setState({
      codeSent:true,
      countingDone:false
    })
  }
  //倒计时结束
  _countingDone=()=>{
    this.setState({
      countingDone:true
    })
  }

  //登录
  _submit=()=>{
    var phone = this.state.phone
    var verifyCode = this.state.verifyCode
    if(!phone||!verifyCode){
      return Alert.alert("手机号或者验证码不能为空！")
    }

    var verifyUrl = config.api.base + config.api.verify
    var body = {
      phone:phone,
      verifyCode:verifyCode
    }
    var that = this
    //先验证验证码是否正确
    request.post(verifyUrl,body)
      .then((data)=>{
        if(data && data.success){
          that.props.afterLogin(data.data)
        }else{
          Alert.alert("获取验证码失败，请检查手机号是否正确")
        }
      })
      .catch((error)=>{
        Alert.alert("检查网络是否正常！")
      })
  }

  render(){
    return(
      <View style={styles.container}>
        <View style={styles.signupBox}>
          <Text style={styles.title}>快速登录</Text>
          <TextInput
           placeholder='输入手机号'
           autoCaptialize={'none'}
           autoCorrect={false}
           keyboradType={'number-pad'}
           style={styles.inputField}
           onChangeText={(text)=>{
             this.setState({
               phone:text
             })
           }}
          />

          {
            this.state.codeSent
            ? <View style={styles.verfyCodeBox}>
                <TextInput
                 placeholder='输入验证码'
                 autoCaptialize={'none'}
                 autoCorrect={false}
                 keyboradType={'number-pad'}
                 style={styles.inputField}
                 onChangeText={(text)=>{
                   this.setState({
                     verifyCode:text
                   })
                 }}
                />
                {
                  this.state.countingDone
                  ? <Button
                    style={styles.countBtn}
                    onPress={this._sendVerifyCode}>获得验证码</Button>
                  : <MyCountTime
                    timeLeft={5} //倒计时的总时间
                    style={styles.countBtn}
                    color={'#fff'}
                    fontSize={24}
                    fontWeight={'normal'}
                    borderColor={'transparent'}
                    borderWidth={1}
                    borderRadius={2}
                    let backgroundColor={'#ee735c'}
                    afterEnd={this._countingDone}/>
                }
              </View>
            : null
          }
          {
            this.state.codeSent
            ? <Button
              style={styles.btnStyle}
              onPress={this._submit}>登录</Button>
            : <Button
              style={styles.btnStyle}
              onPress={this._sendVerifyCode}>获取验证码</Button>
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#f9f9f9",
    padding:10
  },
  signupBox:{
    marginTop:30
  },
  title:{
    marginBottom:20,
    color:"#333",
    fontSize:20,
    textAlign:'center'
  },
  inputField:{
    flex:1,
    height:40,
    padding:5,
    color:"#666",
    fontSize:16,
    backgroundColor:"#fff",
    borderRadius:4
  },
  verfyCodeBox:{
    marginTop:10,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  countBtn:{
    width:110,
    height:40,
    padding:10,
    marginLeft:8,
    backgroundColor:"#ee735c",
    borderColor:'#ee735c',
    color:"#fff",
    textAlign:'left',
    fontWeight:'600',
    fontSize:15,
    borderRadius:2
  },
  btnStyle:{
    marginTop:10,
    padding:10,
    backgroundColor:'transparent',
    borderColor:"#ee735c",
    color:"#ee735c",
    borderWidth:1,
    borderRadius:4
  }
});
