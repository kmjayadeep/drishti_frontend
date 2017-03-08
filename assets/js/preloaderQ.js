var PreloaderQ = (function(){
  var PreloaderQ = function(initialQueue){
    this.count = 0;
    this.queue = typeof(initialQueue)=='object' && typeof(initialQueue[0])!='undefined' ? initialQueue : []
    this.emptyCb = null
    this.firstCb = null
    this.enqueueCb = null
    this.dequeueCb = null
  }

  PreloaderQ.prototype.enqueueTask = function(id){
    if(this.queue.indexOf(id)>=0)
    throw new Error('Task already exists in queue')
    this.queue.push(id)
    if(this.enqueueCb)
      this.enqueueCb(id)
    if(this.firstCb&&this.queue.length==1)
      this.firstCb(id)
  }

  PreloaderQ.prototype.dequeueTask = function(id){
    if(this.queue.indexOf(id)==-1)
    throw new Error('Task doesnt exist in queue')
    this.queue  = this.queue.filter(function(q){
      return q!=id
    })
    if(this.dequeueCb)
      this.dequeueCb(id)
    if(this.emptyCb&&this.queue.length==0)
      this.emptyCb(id)
  }

  PreloaderQ.prototype.clear = function(){
    this.queue = []
  }

  PreloaderQ.prototype.setEmptyCallback = function(cb){
    this.emptyCb = cb
  }

  PreloaderQ.prototype.setFirstTaskCallback = function(cb){
    this.firstCb = cb
  }

  PreloaderQ.prototype.setEnqueueCallback = function(cb){
    this.enqueueCb = cb
  }

  PreloaderQ.prototype.setDequeueCallback = function(cb){
    this.dequeueCb = cb
  }

  PreloaderQ.prototype.getQueue = function(){
    return this.queue
  }

  return PreloaderQ;
})();

if(typeof window=='undefined')
  module.exports = PreloaderQ;
else
  window.PreloaderQ = PreloaderQ;
