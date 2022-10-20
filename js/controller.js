function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Controller {
    constructor() {
        this.gamePanel = document.getElementById("svg")
        this.drawer = new Drawer(this.gamePanel)

        this.level = null
        this.game = null

        this.status = 'off'
        this.running = false
        this.time = 0

        // Add keys listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p')
                this.pause()
        })

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift')
                this.accelerate = false
        })

        window.addEventListener("beforeunload", (e) => {
            // console.log(e)
            if (this.status === 'play' || this.status === 'pause') {
                e.preventDefault()
                confirm("Are you sure??")
            }
        })

        window.addEventListener('load', (e) => {
            this.status = 'off'
            document.getElementById("status").innerText = 'Status: ' + this.status
            this.pauseButton.disabled = true
        })

        this.timeLabel = document.getElementById("time")

        this.newGameButton = document.getElementById("new-game")
        this.newGameButton.addEventListener('click', (e) => {
            this.newGame()
        })

        this.pauseButton = document.getElementById("pause")
        this.pauseButton.addEventListener('click', (e) => {
            this.pause()
        })

        this.svg = document.getElementById("svg")
        this.svg.addEventListener("click", (e) => {
            if (e.buttons === 0)
                this.game.leftClick(e.layerX, e.layerY)
            // console.log(e)
        })
        this.svg.oncontextmenu = (e) => {
            e.preventDefault()
            // console.log(e)
            if (e.buttons === 2)
                this.game.rightClick(e.layerX, e.layerY)
            else if (e.buttons === 3)
                this.game.doubleClick(e.layerX, e.layerY)
        }
    }

    updateInfo() {
        let bestScore = localStorage.getItem('bestScore')
        if (this.game.score > bestScore)
            localStorage.setItem('bestScore', this.game.score)

        // document.getElementById("mode").innerText = 'Mode: ' + this.level.name
        // document.getElementById("level").innerText = 'Level: ' + this.level.level
        // document.getElementById("status").innerText = 'Status: ' + this.status
        // document.getElementById("steps").innerText = 'Steps: ' + this.game.steps
        // document.getElementById("apples").innerText = 'Apples: ' + this.game.apples
        // document.getElementById("score").innerText = 'Score: ' + this.game.score
        // document.getElementById("best").innerText = 'Best score: ' + localStorage.getItem('bestScore')
    }

    newGame() {
        if (this.status === 'play') {
            if (!confirm("Are you sure? Current game will be lost"))
                return
        }
        else if (this.status === 'pause') {
            if (!confirm("Are you sure? Current game will be lost"))
                return
            this.pause()
        }

        // TODO read paramters menu
        // this.level = new LevelZero()
        // this.level = new LevelClassic()

        this.game = new Game(15, 15, 1, this.drawer)
        this.time = 0
        this.pauseButton.disabled = false
        this.status = 'play'
        if (!this.running) {
            this.run()
        }
    }

    pause() {
        if (this.status === 'play')
            this.status = 'pause'
        else if (this.status === 'pause')
            this.status = 'play'
        else
            return
        document.getElementById("status").innerText = 'Status: ' + this.status
        this.pauseButton.innerText = this.status === 'play' ? 'Pause' : 'Play'
        $(".game-box .pause").css('display', this.status === 'play' ? 'none' : 'inline')
    }

    // Perform 1 step of the game
    step() {
        let success = this.game.step()
        if (success < 0) {
            this.status = 'game over'
            this.pauseButton.disabled = true
        }
        this.updateInfo()
    }

    // Main game loop
    async run() {
        this.running = true
        while (1) {
            await sleep(100)
            if (this.status === 'play') {
                this.time += 0.1
                // console.log(this.time)
                this.timeLabel.innerText = 'Time: ' + this.time.toFixed(1)
            }
            if (!this.running)
                break
        }
    }
}