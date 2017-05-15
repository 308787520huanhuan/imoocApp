import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  Alert,
  View
} from 'react-native';
export default class MyCountTime extends React.Component{
    constructor(props) {
        super(props);
        let timeLeft=this.props.timeLeft>0 ? this.props.timeLeft:5
        let width=this.props.width || 60
        let height=this.props.height || 32
        let color=this.props.color || '#fff'
        let fontSize=this.props.fontSize || 22
        let fontWeight=this.props.fontWeight || '600'
        let borderColor=this.props.borderColor || '#ee735c'
        let borderWidth=this.props.borderWidth || 1
        let borderRadius=this.props.borderRadius || 4
        let backgroundColor=this.props.backgroundColor || '#ee735c'

        this.afterEnd=this.props.afterEnd || this._afterEnd
        this.style=this.props.style || this.countTextStyle

        this.state={
            timeLeft:timeLeft
        }
        this.countTextStyle={
            textAlign:'center',
            color:color,
            fontSize:fontSize,
            fontWeight:fontWeight

        }
        this.countViewStyle={
          backgroundColor:backgroundColor,
          alignItems:'center',
          borderColor:borderColor,
          borderWidth:borderWidth,
          borderRadius:borderRadius,
          width:width,
          height:height
        }
    }
    countdownfn(timeLeft,callback){
      if(timeLeft>0){
          let that=this
          let interval=setInterval(function(){
              if(that.state.timeLeft<1){
                  clearInterval(interval)
                  callback()
              }else{
                let totalTime=that.state.timeLeft
                that.setState({
                    timeLeft:totalTime-1
                })
              }
          },1000)
      }
    }
    _afterEnd(){
        console.log('------------time over');
    }
    componentDidMount(){
        let time=this.state.timeLeft
        let afterEnd=this.afterEnd
        this.countdownfn(time,afterEnd)
    }
    render(){
        return (
            <View>
                <Text style={this.style}>剩余{this.state.timeLeft}秒</Text>
            </View>
        )
    }
}
