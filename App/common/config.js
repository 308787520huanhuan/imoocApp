'use strict'

export default {
  header:{
    method:'post',
    headers:{
      'Accept':'application/json',
      'Content-Type':'application/json'
    }
  },
  api:{
    base:'http://rap.taobao.org/mockjs/11411/',
    //base: 'http://127.0.0.1:1234/',
    creactions:'api/creactions',
    up:'api/up',
    comment:'api/comments',
    signup:'api/u/signup',
    verify:'api/u/verify'
  }
}
