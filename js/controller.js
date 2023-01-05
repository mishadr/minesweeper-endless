// MODES = ["beginner", "intermediate", "expert", "endless"]

class Controller {
    constructor() {
        this.canvas = document.getElementById("canvas")
        this.canvas.parentElement.setAttribute("background-color", "black")

        this.drawer = new Drawer(this.canvas)
        this.parameters = new Parameters("endless", 0.19)
        this.game = null // new Game(this.parameters, this.drawer)

        this.status = 'off'
        this.resultSaved = true // whether current result is saved
        this.rating = -1 // place in the top-list
        this.timer = new Timer(100, () => {
            this.timeLabel.innerText = 'Time: ' + this.timer.time().toFixed(2)
        })

        this.updateInfo()

        // Add buttons listeners
        $(".button-cancel").click(() => {
            // Cancel changes
            this.parameters.setup()
            this.pause()
        })

        $(".button-back").click(() => {
            $(".finish").css('display', 'none')
        })

        $(".button-new").click(() => this.newGame())

        // Add keys listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p')
                this.pause()
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
            document.getElementById("status").innerText = 'Status: off'
            this.pauseButton.disabled = true
        })

        this.timeLabel = document.getElementById("time")

        this.paramtersButton = document.getElementById("parameters")
        this.paramtersButton.addEventListener('click', (e) => {
            this.pause()
        })

        this.newGameButton = document.getElementById("new-game")
        this.newGameButton.addEventListener('click', (e) => {
            this.newGame()
        })

        this.pauseButton = document.getElementById("pause")
        this.pauseButton.addEventListener('click', (e) => {
            console.log('pause')
            this.pause()
        })

        // Mouse clicking
        window.oncontextmenu = (e) => e.preventDefault()
        this.canvas.addEventListener("mousedown", (e) => {
            // console.log('button', e.button, 'buttons', e.buttons, 'which', e.which)
            // FIXME: double click also fires left click
            if (this.game.status !== ON)
                this.finish()
            else if (e.buttons === 1) {
                if (this.game.opened > 0) this.timer.pause()
                // TODO show loading picture
                this.game.leftClick(
                    e.offsetX + this.drawer.viewX,
                    e.offsetY + this.drawer.viewY) // this could take time
                if (this.game.opened > 0) this.timer.run()
                this.updateInfo()
                if (this.game.status !== ON)
                    this.finish()
            }
            else if (e.buttons === 2) {
                this.game.rightClick(
                    e.offsetX + this.drawer.viewX,
                    e.offsetY + this.drawer.viewY)
                this.updateInfo()
            }
            else if (e.buttons === 3) { // left + right
                this.game.doubleClick(
                    e.offsetX + this.drawer.viewX,
                    e.offsetY + this.drawer.viewY)
                this.updateInfo()
                if (this.game.status !== ON)
                    this.finish()
            }
        })
    }

    updateInfo() {
        $("#mode").text('Mode: ' + this.parameters.mode)
        $("#density").text('Density: ' + this.parameters.density)
        $("#bombs").text('Bombs: ' + this.parameters.bombs)
        if (this.game !== null) {
            $("#status").text('Status: ' + this.game.status)
            $("#opens").text('Open: ' + this.game.opened)
            $("#flags").text('Flags: ' + this.game.flags)
            // $("#dies").text('Dies: ' + this.game.dies)
        }
        // document.getElementById("best").innerText = 'Best score: ' + localStorage.getItem('bestScore')
    }

    newGame() {
        if (this.game && this.game.status === ON && this.game.opened > 0)
            if (!confirm("Are you sure? Current game will be lost"))
                return

        $(".finish").css('display', 'none')
        $(".pause").css('display', 'none')

        let parent = this.canvas.parentElement
        this.canvas.getContext("2d").canvas.width = parent.clientWidth - 10 // to prevent scrollers
        this.canvas.getContext("2d").canvas.height = parent.clientHeight - 10
        this.game = new Game(this.parameters, this.drawer)
        this.pauseButton.disabled = false
        if (this.parameters.mode === "endless") {
            $("#density").css("display", "inline")
            $("#bombs").css("display", "none")
        }
        else {
            $("#density").css("display", "none")
            $("#bombs").css("display", "inline")
        }
        $('#label-pause').text("PAUSE")

        this.timer.stop()
        this.status = 'play'
        this.resultSaved = false
        this.timeLabel.innerText = 'Time: ' + this.timer.time().toFixed(2)
        this.updateInfo()
    }

    pause() {
        if (this.status === 'play' || this.status === 'off') {
            this.status = 'pause'
            this.timer.pause()
        }
        else if (this.status === 'pause') {
            if (this.game) {
                this.status = 'play'
                if (this.game.opened > 0 && this.game.status === ON)
                    this.timer.run()
            }
            else { // before playing
                this.status = 'off'
            }
        }
        else
            return
        // document.getElementById("status").innerText = 'Status: ' + this.status
        // this.pauseButton.innerText = this.status === 'play' ? 'Pause' : 'Play'
        $(".pause").css('display', this.status === 'pause' ? 'flex' : 'none')
        this.timeLabel.innerText = 'Time: ' + this.timer.time().toFixed(2)
    }

    // Finish the game with WIN or EXPLODE result
    finish() {
        this.timer.pause()
        this.timeLabel.innerText = 'Time: ' + this.timer.time().toFixed(2)
        $(".finish").css('display', 'flex')
        $('#label-finish').text(this.game.status === WIN ? "You win!" : "You failed!")

        let resultsList = ResultsList.fromString(localStorage.getItem('resultsList'))
        let mode = this.parameters.mode

        if (this.game.status === WIN || mode === "endless") {
            // Save results
            if (!this.resultSaved) {
                let currentResult = new Result(
                    new Date(), mode, this.parameters.density,
                    this.game.opened, this.game.flags, this.timer.time())
                resultsList.add(currentResult)
                localStorage.setItem('resultsList', resultsList.toString())
                this.resultSaved = true
                this.rating = resultsList.index(currentResult)
            }
        }
        else {
            // TODO explode
            this.rating = -1
        }

        // Show this mode top results
        let $div = $('#finish-table')
        $div.html(`<u><b>Top results for ${mode}</b></u>`)
        $div.append(resultsList.table(mode, this.rating))
    }
}