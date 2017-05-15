import React, { Component } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Navigator,
  Text,
  Alert,
  Modal,
  TextInput,
  Image,
  ListView,
  Dimensions,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import Video from 'react-native-video'
import request from '../common/request'
import config from '../common/config'
const { width, height } = Dimensions.get('window')

//已经渲染过的数据
var  cachedResults = {
  nextPage:1,
  items:[],
  total:0
}

export default class Detail extends React.Component {
  constructor(props){
    super(props)
    //视频详情数据
    var data = this.props.data

    //评论列表数据
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

    this.state = {
      //视频的详情数据
      data:data,
      //视频的评论列表数据
      dataSource:ds.cloneWithRows([]),

      videoLoaded:false,
      paused:false,
      videoOk:true,
      playing:false,//是否正在播放
      rate:1,//控制暂停/播放，0 代表暂停paused, 1代表播放normal
      muted:false,//静音
      resizeMode:'contain',//视频的自适应伸缩铺放行为，
      repeat:false,//是否重复播放
      videoProgress:0,//播放进度
      videoTotal:0,//视频总长度
      currentTime:0,//视频当前播放的时间

      // modal
      content: '',
      animationType: 'none',
      modalVisible: false,
      isSending: false,
    }
  }
  _onProgress(data){
    //进度条
    var duration = data.playableDuration
    var currentTime = data.currentTime
    var percent = Number((currentTime / duration).toFixed(2))

    var newState = {
      videoTotal:duration,
      currentTime:Number(currentTime.toFixed(2)),
      videoProgress:percent
    }

    //控制显示loading
    if(!this.state.videoLoaded){
      newState.videoLoaded = true
    }

    //控制显示playing
    if(!this.state.playing){
      newState.playing = true
    }

    this.setState(newState)

  }
  //播放结束
  _onEnd(){
    this.setState({
      videoProgress:1,
      playing:false,//停止播放
    })
  }
  _pause(){
    if(!this.state.paused){
      this.setState({
        paused:true,
      })
    }
  }
  //继续播放
  _resume(){
    if(this.state.paused){
      this.setState({
        paused:false,
      })
    }
  }
  _onError(e){
    this.setState({
      videoOk:false,
    })
  }
  //点击重播
  _replay(){
    this.refs.videoPlayer.seek(0)
  }
  //返回
  _pop(){
    this.props.navigator.pop()
  }

  //视频加载完成后再请求评论列表
  componentDidMount(){
    this._fetchData()
  }

  _fetchData(page){
    var that = this

    this.setState({
      isLoadingTail:true
    })

    //开始请求
    var  url = config.api.base + config.api.comment

    request.get(url,{
      creaction:124,
      accessToken:'123a'
    })
    .then((data) => {
      if(data.success){
        var items = cachedResults.items.slice()

        //上拉加载
        items = items.concat(data.data)
        cachedResults.nextPage = page++
        cachedResults.items = items
        cachedResults.total = data.total

        //是否正在请求数据
        that.setState({
          isLoadingTail:false,
          dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
        })

      }
    })
    .catch((error) => {
      //是否正在请求数据
      this.setState({
        isLoadingTail:false
      })
    });
  }

  _hasMore(){
    return cachedResults.items.length !== cachedResults.total
  }
  //
  _renderMoreData(){
    if(!this._hasMore() || this.state.isLoadingTail){
      return
    }
    var page = cachedResults.nextPage
    this._fetchData(page)
  }
  _renderFooter(){
    if(!this._hasMore()&&cachedResults.total!=0){
      return(
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>
            没有更多了
          </Text>
        </View>
      )
    }
    if(!this.state.isLoadingTail){
      return(
        <View style={styles.loadingMore}>
        </View>
      )
    }
    return <ActivityIndicator style={styles.loadingMore} />
  }

  _renderHeader(){
    var data = this.state.data
    return(
      <View style={styles.listHeader}>
        <View style={styles.infoBox}>
          <Image style={styles.avatar} source={{uri:data.author.avatar}} />
          <View style={styles.descBox}>
            <Text style={styles.nickName}>
              {data.author.nickName}
            </Text>
            <Text style={styles.title}>
              {data.author.title}
            </Text>
          </View>
        </View>
        <View style={styles.commentBox}>
          <View style={styles.comment}>
            <TextInput
              placeholder='敢不敢评论一个...'
              style={styles.content}
              multiline={true}
              onFocus={()=>this._focus()}
            />
          </View>
        </View>

        <View style={styles.commentArea}>
          <Text style={styles.commentTitle}>精彩评论</Text>
        </View>

      </View>
    )
  }

  //请求评论列表
  _renderRow(row){
    return (
      <View key={row._id} style={styles.replyBox}>
        <Image style={styles.replyAvatar} source={{uri:row.replyBy.avatar}} />
        <View style={styles.reply}>
          <Text style={styles.replyNickName}>
            {row.replyBy.nickName}
          </Text>
          <Text style={styles.replyContent}>
            {row.content}
          </Text>
        </View>
      </View>
    )
  }

  //
  _focus() {
    this._setModalVisible(true)
  }

  _blur() {

  }

  _closeModal() {
    this._setModalVisible(false)
  }

  _setModalVisible(isVisible) {
    this.setState({
      modalVisible: isVisible
    })
  }

  //提交评论
  _submit() {
    var that = this

    if (!this.state.content) {
      return Alert.alert('留言不能为空！')
    }

    if (this.state.isSending) {
      return Alert.alert('正在评论中！')
    }

    this.setState({
      isSending: true
    }, function() {
      var body = {
        accessToken:'abc',
        creation: '123',
        content: this.state.content
      }

      var url = config.api.base + config.api.comment

      request.post(url, body)
        .then(function(data) {
          if (data && data.success) {
            var items = cachedResults.items.slice()
            var content = that.state.content

            items = data.data.concat(items)
            cachedResults.items = items
            cachedResults.total = cachedResults.total + 1

            that.setState({
              content: '',
              isSending: false,
              dataSource: that.state.dataSource.cloneWithRows(cachedResults.items)
            })

            that._setModalVisible(false)
          }
        })
        .catch((err) => {
          console.log(err)
          that.setState({
            isSending: false
          })
          that._setModalVisible(false)
          Alert.alert('留言失败，稍后重试！')
        })
    })
  }

  render(){
    var  data = this.props.data
    return(
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBox} onPress={()=>this._pop()}>
            <Icon name='ios-arrow-back' style={styles.backIcon} />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOflines={1}>
          视频详情页
          </Text>
        </View>
        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
            source={{uri:data.video}}
            style={styles.video}
            volume={1}
            paused={this.state.paused}
            rate={this.state.rate}
            muted={this.state.muted}
            resizeMode={this.state.resizeMode}
            repeat={this.state.repeat}

            onProgress={(data)=>this._onProgress(data)}
            onEnd={()=>this._onEnd()}
            onError={()=>this._onError()}
            />
            {
              !this.state.videoOk && <Text style={styles.failText}>视频出错了！很抱歉</Text>
            }
            {
              !this.state.videoLoaded && <ActivityIndicator color='#fff' style={styles.loading}/>
            }
            {
              this.state.videoLoaded && !this.state.playing
              ?
                <Icon
                  onPress={()=>this._replay()}
                  name='ios-play'
                  size={48}
                  style={styles.playIcon}
                />
              : null
            }
            {
              this.state.videoLoaded && this.state.playing
              ?
                <TouchableOpacity onPress={()=>this._pause()} style={styles.pauseBtn}>
                {
                  this.state.paused
                  ? <Icon onPress={()=>this._resume()} name='ios-play' style={styles.resumeIcon} size={48}/>
                  : <Text></Text>
                }
                </TouchableOpacity>
              : null
            }
            <View style={styles.progressBox}>
              <View style={[styles.progressBar,{width:width*this.state.videoProgress}]}>
              </View>
            </View>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          onEndReached={()=>this._renderMoreData()}
          onEndReachedThreshold={10}
          renderFooter={()=>this._renderFooter()}
          renderHeader={()=>this._renderHeader()}
          enableEmptySections={true}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          renderRow={(rowData) => this._renderRow(rowData)}
        />

        <Modal
          visible={this.state.modalVisible}>
          <View style={styles.modalContainer}>
            <Icon
              onPress={()=>this._closeModal()}
              name='ios-close-outline'
              style={styles.closeIcon} />
            <View style={styles.commentBox}>
              <View style={styles.comment}>
                <TextInput
                  placeholder='敢不敢评论一个...'
                  style={styles.content}
                  multiline={true}
                  defaultValue={this.state.content}
                  onChangeText={(text) => {
                    this.setState({
                      content: text
                    })
                  }}
                />
              </View>
            </View>

            <Text style={styles.submitBtn} onPress={()=>this._submit()}>评论</Text>
          </View>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: '#fff'
  },

  closeIcon: {
    alignSelf: 'center',
    fontSize: 30,
    color: '#ee753c'
  },

  submitBtn: {
    width: width - 20,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ee753c',
    alignSelf: 'center',
    textAlign: 'center',
    borderRadius: 4,
    fontSize: 18,
    color: '#ee753c'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: 64,
    paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff'
  },
  backBox: {
    position: 'absolute',
    left: 12,
    top: 32,
    width: 50,
    flexDirection: 'row',
    alignItems: 'center'
  },

  headerTitle: {
    width: width - 120,
    textAlign: 'center'
  },

  backIcon: {
    color: '#999',
    fontSize: 20,
    marginRight: 5
  },

  backText: {
    color: '#999'
  },
  videoBox:{
    width:width,
    height:width*0.56,
    backgroundColor:"#000"
  },
  video:{
    width:width,
    height:width*0.56,
    backgroundColor:"#000"
  },
  loading:{
    position:'absolute',
    left:0,
    top:80,
    width:width,
    alignSelf:'center',
    backgroundColor:'transparent'
  },
  progressBox:{
    width:width,
    height:2,
    backgroundColor:"#ccc"
  },
  progressBar:{
    width:1,
    height:2,
    backgroundColor:"#ff6600"
  },
  playIcon: {
    position: 'absolute',
    top: 90,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66'
  },
  pauseBtn:{
    position:'absolute',
    left:0,
    top:0,
    width:width,
    height:360
  },
  resumeIcon:{
    position: 'absolute',
    top: 80,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66'
  },
  failText: {
    position: 'absolute',
    left: 0,
    top: 120,
    width: width,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'transparent'
  },
  infoBox:{
    width:width,
    flexDirection:"row",
    justifyContent:'center',
    marginTop:10
  },
  avatar:{
    width:60,
    height:60,
    marginRight:10,
    marginLeft:10,
    borderRadius:30
  },
  descBox:{
    flex:1
  },
  nickName:{
    fontSize:18
  },
  title:{
    marginTop:10,
    fontSize:16,
    color:"#666"
  },
  replyBox:{
    flexDirection:'row',
    justifyContent:'flex-start',
    marginTop:10
  },
  replyAvatar:{
    width:40,
    height:40,
    marginRight:10,
    marginLeft:10,
    borderRadius:20
  },
  replyNickName:{
    color:"#666"
  },
  replyContent:{
    color:"#666",
    marginTop:4
  },
  reply:{
    flex:1
  },
  loadingMore:{
    marginVertical:20
  },
  loadingText:{
    color:"#777",
    textAlign:'center'
  },
  listHeader:{
    marginTop:10,
    width:width
  },
  commentBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    width: width
  },
  content: {
    paddingLeft: 2,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 14,
    height: 80
  },
  commentArea: {
    width: width,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  }
});
