"use strict"
import queryString from 'query-string'
import lodash from 'lodash'
import Mock from 'mockjs'
import config from './config'

var request = {}

request.get = (url,params)=>{
  if(params){
    url += "?" + queryString.stringify(params)
  }
  return fetch(url)
    .then((response) => response.json())
    .then((response) => Mock.mock(response))
}

request.post = (url,body)=>{
  var options = lodash.extend(config.header,{
    body:JSON.stringify(body)
  })
  return fetch(url,options)
    .then((response) => response.json())
    .then((response) => Mock.mock(response))
}
export default request
