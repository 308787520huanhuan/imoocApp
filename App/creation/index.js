import React, { Component } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Text,
  Alert,
  ListView,
  Image,
  TouchableHighlight,
  Dimensions,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import request from '../common/request'
import config from '../common/config'
import Detail from './detail'

const { width, height } = Dimensions.get('window')

//已经渲染过的数据
var  cachedResults = {
  nextPage:1,
  items:[],
  total:0
}
//子组件
export class Item extends React.Component {
  constructor(props){
    super(props)
    var row = this.props.row
    this.state = {
      row:row,
      up:row.voted
    }
  }
  //点赞
  _up=()=>{
    var that = this
    var up = !this.state.up
    var row = this.state.row
    var url = config.api.base + config.api.up
    var body = {
      id:row._id,
      up:up,
      accessToken:'abc'
    }
    //开始请求
    request.post(url,body)
    .then(function(data){
      if(data && data.success){
        that.setState({
          up:up
        })
      }else{
        Alert.alert("点赞失败，稍后重试")
      }
    })
    .catch((err)=>{
      console.log(err)
      Alert.alert("点赞失败，稍后重试")
    })
  }
  render(){
    var row = this.state.row
    return (
      <TouchableHighlight onPress={this.props.onSelect}>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <Image source={{url:row.thumb}} style={styles.thumb}>
            <Icon
              name='ios-play'
              size={28}
              style={styles.play} />
          </Image>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon
                name={this.state.up?'ios-heart':'ios-heart-outline'}
                size={28}
                onPress={this._up}
                style={[styles.up,this.state.up?null:styles.down]}
              />
              <Text style={styles.handleText}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon
                name='ios-chatboxes-outline'
                size={28}
                style={styles.commenticon}
              />
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

//父组件
export default class List extends React.Component {
  // 构造函数
  constructor (props) {
    super(props)
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      isLoadingTail:false,
      isRefreshing:false
    };
  }
  componentDidMount(){
    this._fetchData(1)
  }
  _renderRow(row){
    return <Item
      row={row}
      key={row._id}
      onSelect={()=>this._loadPage(row)}
      />
  }

  _fetchData(page){
    var that = this

    if(page==0){
      //是否正在请求数据
      this.setState({
        isRefreshing:true
      })
    }else{
      //是否正在请求数据
      this.setState({
        isLoadingTail:true
      })
    }
    //开始请求
    request.get(config.api.base+config.api.creactions,{
      accessToken:'abcde',
      page:page
    })
    .then((data) => {
      if(data.success){
        var items = cachedResults.items.slice()
        //刷新
        if(page==0){
          items = data.data
        }
        //上拉加载
        else{
          items = items.concat(data.data)
          cachedResults.nextPage = page++
        }
        cachedResults.items = items
        cachedResults.total = data.total

        setTimeout(function(){
          if(page==0){
            that.setState({
              isRefreshing:false,
              dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
            })
          }else{
            //是否正在请求数据
            that.setState({
              isLoadingTail:false,
              dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
            })
          }
        },200)

      }
    })
    .catch((error) => {
      if(page==0){
        that.setState({
          isRefreshing:false
        })
      }else{
        //是否正在请求数据
        this.setState({
          isLoadingTail:false
        })
      }
    });
  }

  _hasMore(){
    return cachedResults.items.length !== cachedResults.total
  }
  //刷新
  _onRefresh(){
    if(!this._hasMore() && this.state.isRefreshing){
      return
    }
    this._fetchData(0)
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
  //点击进入详情页
  _loadPage=(row)=>{
    this.props.navigator.push({
      name:'detail',
      component:Detail,
      params:{
        data:row
      }
    })
  }
  render(){
    return(
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          onEndReached={()=>this._renderMoreData()}
          onEndReachedThreshold={10}
          renderFooter={()=>this._renderFooter()}
          enableEmptySections={true}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={()=>this._onRefresh()}
                tintColor="#ff6600"
                title="Loading..."
                titleColor="#ff6600"
              />
            }
          renderRow={(rowData) => this._renderRow(rowData)}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header:{
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:"#ee735c"
  },
  headerTitle:{
    color:"#fff",
    fontSize:16,
    textAlign:"center",
    fontWeight:'600'
  },
  item:{
    width:width,
    marginBottom:10,
    backgroundColor:'#fff'
  },
  thumb:{
    width:width,
    height:width * 0.5,
    resizeMode:'cover'
  },
  title:{
    padding:10,
    fontSize:18,
    color:"#333"
  },
  itemFooter:{
    flexDirection:"row",
    justifyContent:'space-between',
    backgroundColor:'#eee'
  },
  handleBox:{
    padding:10,
    flexDirection:'row',
    width:width /2 -0.5,
    justifyContent:'center',
    backgroundColor:"#fff"
  },
  play:{
    position:'absolute',
    bottom:14,
    right:14,
    width:46,
    height:46,
    paddingTop:9,
    paddingLeft:18,
    backgroundColor:"transparent",
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:23,
    color:"#ed7b66"
  },
  handleText:{
    paddingLeft:12,
    fontSize:18,
    color:"#333"
  },
  down:{
    fontSize:22,
    color:"#333"
  },
  up:{
    fontSize:22,
    color:"red"
  },
  commenticon:{
    fontSize:22,
    color:"#333"
  },
  loadingMore:{
    marginVertical:20
  },
  loadingText:{
    color:"#777",
    textAlign:'center'
  }
});
