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
 *
 *
 * Logs are put in a blockChain
 * A<-B<-C<-D<-now
 * Dequeue A
 * B<-C<-D
 * etc...
 * On a incoming log, chain another if the current one is full
 * and try to dequeue the first block and so on
 * 
 */
function LogProc(opts){
    opts = opts || {};
    this.states = {READY:0, LOCKED:1};
    this.opts = {};
    this.opts.processTimeout = opts.processTimeout || 1000;        //time allowed to fullfill ok or reject upon processing the block
    this.opts.maxBlockSize = opts.maxBlockSize || 1e5;         //1ko or more should be logged
    this.opts.minFullLength = opts.minFullLength   || 1e7;           //100Mo of log retention is way more than enough
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
    self.BlockFactory = {
        allocate:function(){
            return new Block(blockSize);
        },
        maxSize: this.opts.blockSize
    }
}

function Block(maxSize){
    this.n = maxSize;
    this.bytes = 0;
    this.full = false;
}
Block.prototype.canAdd = function(task){
    return this.bytes + task[0].length < this.n;
}
Block.prototype.add = function(task){
    this.stack.push(task);
    this.bytes += task[0].length;
}
Block.prototype.size = function(){
    return this.bytes;
}
Block.prototype.markFull = function(){
    this.full = true;
}
Block.prototype.isFull = function(){
    return this.full;
}

LogProc.prototype.init = function(){
    this.state = this.states.READY;
    this.stack = [];
    this.bytes = 0;
    this.lastDequeue = Date.now();
    this.blocks = [new Block];
    this.currentBlock = this.blocks[0]
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
    if(!this.blocks[0].size()){
        return;
    }
    if(force){
        return this._dequeue();
    }
    if(this.bytes > self.BlockFactory.maxSize){
        return this._dequeue();
    }
    return;
}

/**
 * TODO abstract task and revert control over trigger to the caller
 * @param  {[0,1]} task [description]
 * @return {[type]}      [description]
 */
LogProc.prototype.write = function(task){
    var self = this;
    if(self.BlockFactory.maxSize < task[0].length){
        console.log('task too big (length > ',task[0].length, self.BlockFactory.maxSize);
        return;
    }
    if(!this.currentBlock.canAdd(task)){
        this.blocks.push(self.BlockFactory.allocate());
        this.currentBlock = this.blocks[this.blocks.length-1];
    }
    this.currentBlock.add(task);
    this.bytes += task[0].length;
    if(this.state == this.states.READY){
        return this._processReadyStack();
    }
    if(this.state == this.states.LOCKED){
        if(this.bytes > this.opts.minFullLength){
            return this.fail();
        }
        return;
    }
    return;
}


LogProc.prototype.fail = function(){
    console.log(new Date,
        'lgs bytes overflow : ', this.bytes,
        'last dequeue', new Date(this.lastDequeue),
        'sl', this.stack.length,
        'minl', this.opts.minFullLength,
        'minb', this.opts.minBlockLength,
        'ulaf', this.opts.unlockAfter,
        'tickEvery', this.opts.tickEvery
    )
    this.opts.onFail();
    this.init();
}
Logger.prototype.shiftBlock = function(){
    self.state = this.states.READY;
    var block = this.blocks[0];
    var self = this;
    self.bytes = Math.max(0, self.bytes-block.size());
    self.blocks.shift();
    if(self.blocks.length == 0){
        self.blocks.push(self.BlockFactory.allocate());
    }
    self.lastDequeue = Date.now();
}
/*
During a dequeue, I can be called only because of a tick
or by myself for a retry
If it is a tick the tick is forced to come AFTER my timeout
My own critical section lasts at most: (nbRetry+1) * this.opts.processTimeout
So ensure unlockAfter > nbRetry * this.opts.processTimeout
 */
LogProc.prototype._dequeue = function(){
    var self = this;
    this.state = this.states.LOCKED;
    var block = this.blocks[0];
    if(block.nbRetry > 3){
        //too many attempts... retry later
        console.log('too many attempt..skipping block');
        return self.shiftBlock();
    }
    if(block.nbRetry == 1 || block.nbRetry == 2){
        console.log('dequeing');
    }else if(block.nbRetry == 0){
        self.lastDequeue = Date.now();
    }
    var _cbkCalled = false;
    var bytes = this.bytes;
    self.opts.dequeue(block.stack, function(err){
        if(!err){
            self.shiftBlock();
            _cbkCalled = true;
            return self._tick();
        }
        if(!_cbkCalled){
            console.log('ko',err)
            _cbkCalled = true;
            self.blocks[0].nbRetry++;
            return self._dequeue();
        }
        //do nothing, dequeue already called
    })
    setTimeout(function(){
        if(!_cbkCalled){
            console.log('timeout')
            _cbkCalled = true;
            self.blocks[0].nbRetry++;
            return self._dequeue();
        }  
        //do nothing, dequeue already called
    }, this.opts.processTimeout);
}

module.exports = LogProc;