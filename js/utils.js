function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function time() {
    return performance.now()
}

class Timer {
    constructor(interval, callback) {
        this.interval = interval
        this.callback = callback

        this._lastCallbackTime = null // time of the last callback call
        this._lastRunTime = null // time of the last run call after last callback
        this._sinceCallbackTime = 0 // total time passed since the last callback call excluding paused periods
        this._running = false // if the timer is running
        this._promise = null // last started promise
        this._time = 0
    }

    // Start/continue timer
    async run(doBefore=false) {
        if (this._running) {
            console.warn('Timer is already running')
            return
        }
        if (this._lastCallbackTime == null) {
            this._lastCallbackTime = time()
        }
        this._lastRunTime = time()
        if (doBefore)
            this.callback()
        this._running = true

        while (1) {
            let interval = this.interval // this.interval can be changed during execution
            let promise = sleep(this._sinceCallbackTime > 0 ? Math.max(0, interval - this._sinceCallbackTime) : interval)
            promise.alive = true
            this._promise = promise
            await promise
            // Check if pause was not called while waiting the promise
            if (this._running && promise.alive) {
                this._lastCallbackTime = time()
                this._lastRunTime = time()
                this._time += interval
                this._sinceCallbackTime = 0
                this.callback()
            }
            else // If timer is not running or the promise was deactivated
                break
        }
    }

    // Pause timer and deactivate last promise
    pause() {
        if (this._running) {
            this._sinceCallbackTime += time() - this._lastRunTime
            this._running = false
            this._promise.alive = false
        }
    }

    // Stop timer and deactivate last promise
    stop() {
        this._running = false
        if (this._promise)
            this._promise.alive = false
        this._lastCallbackTime = null
        this._lastRunTime = null
        this._sinceCallbackTime = 0
        this._time = 0
    }

    // Get total time passed since first run command excluding pauses
    time() {
        let t = this._time + this._sinceCallbackTime
        if (this._running)
            t += time() - this._lastRunTime
        return t / 1000
    }
}