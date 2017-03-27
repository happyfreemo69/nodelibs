/**
 * With some effort we could abstract for bigger cause but keep it simple.
 *
 * Purpose is to:
 * handle stacking logs before sending them over the network (in order not to spam the socket)
 * in case of network failure retry
 * in case of spam drop the logs not to fail the application because of the heap
 *
 * Two states: READY and LOCKED
 * Events:
 * - write (called from client)
 * - tick (setInterval will wakeup LogProc (whether LOCKED or READY)
 * - when asking the client to process, LOCKED state
 * - in case of client::ok, pass in READY mode
 */
function LogProc(opts){
    opts = opts || {};
    this.states = {READY:0, LOCKED:1};
    this.opts = {};
    this.opts.processTimeout = opts.processTimeout || 1000;        //time allowed to fullfill ok or reject upon processing the block
    this.opts.minBlockLength = opts.minBlockLength || 1e3;
    this.opts.minFullLength = opts.maxFullLength || 1e5;  //100ko should be logged
    this.opts.unlockAfter = opts.unlockAfter || this.opts.processTimeout * 3; 
    this.opts.onFail = opts.onFail || function(){};
    this.opts.tickEvery = opts.tickEvery || 0;              //0 to disable, expect ms
    this.opts.dequeue = opts.dequeue || function(cbk){cbk(null)}

    this.init();
    var self = this;
    if(this.opts.tickEvery){
        setInterval(function(){
            self._tick();
        }, this.opts.tickEvery)
    }
}
LogProc.prototype.init = function(){
    this.state = this.states.READY;
    this.stack = [];
    this.bytes = 0;
}

/**
 * Tick is called to refresh the system
 * In case the system can log, force the logging whether the block is full or not
 * @return {[type]} [description]
 */
LogProc.prototype._tick = function(){
    if(this.state == this.states.READY){
        return this._processReadyStack(true);
    }
    if(this.state == this.states.LOCKED){
        if(Date.now() - this.lastDequeue > this.opts.unlockAfter){
            this.state = this.states.READY;
            this._tick();
            return;
        }
    }
}

LogProc.prototype._processReadyStack = function(force){
    if(!this.stack.length){
        return;
    }
    if(force){
        return this._dequeue();
    }
    if(this.bytes > this.opts.minBlockLength){
        return this._dequeue();
    }
    if(this.bytes > this.opts.minFullLength){
        console.log(new Date,'lgs overflow : ', this.bytes, this.opts.minFullLength)
        return this.fail();
    }
    return;
}

/**
 * TODO abstract task and revert control over trigger to the caller
 * @param  {[0,1]} task [description]
 * @return {[type]}      [description]
 */
LogProc.prototype.write = function(task){
    if(this.state == this.states.READY){
        this.stack.push(task);
        this.bytes += task[0].length;
        return this._processReadyStack();
    }
    if(this.state == this.states.LOCKED){
        this.stack.push(task);
        if(this.bytes > this.opts.minFullLength){
            return this.fail();
        }
        return;
    }
    return;
}


LogProc.prototype.fail = function(){
    this.opts.onFail();
    this.init();
}
/*
During a dequeue, I can be called only because of a tick
or by myself for a retry
If it is a tick the tick is forced to come AFTER my timeout
My own critical section lasts at most: (nbRetry+1) * this.opts.processTimeout
So ensure unlockAfter > nbRetry * this.opts.processTimeout
 */
LogProc.prototype._dequeue = function(nbRetry = 0){
    var self = this;
    this.state = this.states.LOCKED;
    if(nbRetry > 2){
        //too many attempts... retry later
        console.log('too many attempt');
        return;
    }else if(nbRetry == 1){
        console.log('dequeing');
    }else if(nbRetry == 0){
        self.lastDequeue = Date.now();
    }
    var _cbkCalled = false;
    var n = this.stack.length;
    var bytes = this.bytes;
    self.opts.dequeue(this.stack, function(err){
        if(!err){
            self.state = self.states.READY;
            for(var i = 0; i<n; ++i){
                self.stack.shift();
            }
            self.bytes = Math.max(0, self.bytes-bytes);
            _cbkCalled = true;
            return self._tick();
        }
        if(!_cbkCalled){
            console.log('ko')
            _cbkCalled = true;
            return self._dequeue(nbRetry+1);
        }
        //do nothing, dequeue already called
    })
    setTimeout(function(){
        if(!_cbkCalled){
            console.log('timeout')
            _cbkCalled = true;
            return self._dequeue(nbRetry+1);
        }  
        //do nothing, dequeue already called
    }, this.opts.processTimeout);
}

module.exports = LogProc;