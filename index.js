var EventEmitter = require('events').EventEmitter
var ScuttleBucket = require('scuttlebucket')
var Model = require('scuttlebutt/model')
var RtcUtil = require('./rtc_utils')
var Uuid = require('hat')

DEBUG_MODE = true

var multiverse
initialize()

function initialize(){
  // create multiverse
  var core = createMultiverse()
  animate(core)

  // set/get hash location
  var roomId = window.location.hash.slice(1)

  // you are a guest
  if (roomId) {
    startGuest(roomId)
  // you are the host
  } else {
    roomId = Uuid()
    if (!DEBUG_MODE) window.location.hash = roomId
    if (DEBUG_MODE) roomId = 'kumavis_debug'
    startHost(roomId)
  }

}

function createMultiverse(){
  multiverse = new ScuttleBucket()
  var core = new Model()
  multiverse.add('core', core)
  // listen for changes to core
  core.updates = new EventEmitter()
  core.on('update',function(keyValue){
    var key = keyValue[0]
    var value = keyValue[1]
    core.updates.emit(key,value)
  })
  // deberg
  window.multiverse = multiverse
  window.core = core
  return core
}

function startHost(roomId){
  // establish connection
  var host = RtcUtil.RtcConnection(roomId)
  host.on('connectionEstablished',connectionEstablished)
  host.on('connectionLost',connectionLost)
}

function startGuest(roomId){
  // establish connection
  var host = RtcUtil.connectToHost(roomId)
  host.on('connectionEstablished',connectionEstablished)
  host.on('connectionLost',connectionLost)
}

function connectionEstablished(duplexStream){
  console.log('connectionEstablished',duplexStream)
  var multiverseStream = multiverse.createStream()
  duplexStream.pipe(multiverseStream).pipe(duplexStream)
}
function connectionLost(duplexStream){
  console.log('connectionLost',duplexStream)
}

function animate(actor){
  actor.updates.on('color',function(value){
    document.body.style.backgroundColor = value
  })
}

window.color = function color(value){
  core.set('color',value)
}