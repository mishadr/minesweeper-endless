class Parameters {
    constructor(mode, density) {
        this.mode = mode
        this.density = density
        this.width = null // field size
        this.height = null // field size
        this.bombs = null // number of bombs

        // Initial setup
        this.setup()

        let self = this

        // Add listeners
        $("input[name=mode]").click(function () {
            switch (this.value) {
                case "beginner":
                    self.width = 9
                    self.height = 9
                    self.bombs = 10
                    break
                case "intermediate":
                    self.width = 16
                    self.height = 16
                    self.bombs = 40
                    break
                case "expert":
                    self.width = 30
                    self.height = 16
                    self.bombs = 99
                    break
                case "endless":
                    self.width = 0
                    self.height = 0
                    self.bombs = 0
                    break
            }
            $("#range-density").prop("disabled", this.value !== "endless")
            self.mode = this.value
            if (self.mode !== "endless") {
                self.density = self.bombs / self.width / self.height
                self.setDensity()
            }
        })

        $("#range-density").on("input",function () {
            self.density = parseFloat(this.value)
            self.setDensity()
        })
    }

    setDensity() {
        $("#label-density").text("Bombs density: " + parseFloat(this.density).toFixed(3))
        $("#range-density")[0].value = this.density
    }

    setup() {
        this.setDensity()
        $("input[name=mode]").prop("checked", false)
        $(`input[name=mode][value=${this.mode}]`).prop("checked", true)
    }
}


class Result {
    constructor(date, mode, density, opened, flags, time) {
        this.date = date
        this.mode = mode
        this.density = density
        this.opened = opened
        this.flags = flags
        this.time = time
    }

    static header(mode) {
        if (mode === "endless")
            return ["#", "Density", "Open", "Time", "Date"]
        else
            return ["#", "Time", "Flags", "Date"]
    }

    tr(ix) {
        let $tr = $("<tr></tr>")
        $tr.append($("<td></td>").text(ix + '.'))
        // $tr.append($("<td></td>").text(this.mode))
        if (this.mode === "endless") {
            $tr.append($("<td></td>").text(this.density.toFixed(3)))
            $tr.append($("<td></td>").text(this.opened))
        }
        $tr.append($("<td></td>").text(this.time.toFixed(2)))
        if (this.mode !== "endless") {
            $tr.append($("<td></td>").text(this.flags))
        }
        $tr.append($("<td></td>").text(this.date.toLocaleString('RU'))) // TODO add locale select
        return $tr
    }

    static comparator(r1, r2) {
        if (r1.mode !== r2.mode)
            console.error("Can't compare different modes", r1, r2)
        if (r1.density !== r2.density)
            return r2.density - r1.density
        if (r1.opened !== r2.opened)
            return r2.opened - r1.opened
        if (r1.time !== r2.time) // less better
            return r1.time - r2.time
        if (r1.flags !== r2.flags) // less better
            return r1.flags - r2.flags
        return 0
    }

    toString() {
        return JSON.stringify([this.date, this.mode, this.density, this.opened, this.time])
    }

    static fromObj(obj) {
        return new Result(
            new Date(obj["date"]), obj["mode"], obj["density"], obj["opened"], obj["flags"], obj["time"])
    }
}


class ResultsList {
    constructor(top=10) {
        this.top = top
        this.list = {} // mode -> []
    }

    // Add a new result to the list
    add(result) {
        let mode = result.mode
        if (!(mode in this.list))
            this.list[mode] = []
        this.list[mode].push(result)
        this.list[mode].sort(Result.comparator)
        this.list[mode].splice(this.top)
    }

    // Get index of a given result in list[mode] or -1
    index(result) {
        if (result.mode in this.list)
            for (let i=0; i<this.list[result.mode].length; ++i) {
                let r = this.list[result.mode][i]
                if (r.date === result.date) return i
            }
        return -1
    }

    toString() {
        return JSON.stringify(this.list)
    }

    static fromString(str) {
        if (str === null)
            return new ResultsList()

        let obj = JSON.parse(str)
        let rl = new ResultsList()
        rl.list = {}
        for (const [mode, list] of Object.entries(obj)) {
            rl.list[mode] = []
            for (const r of list)
                rl.list[mode].push(Result.fromObj(r))
        }
        return rl
    }

    // Get list as an html table
    table(mode, rating) {
        let $table = $("<table></table>")
        let $tr = $("<tr></tr>")
        $table.append($tr)
        for (const h of Result.header(mode))
            $tr.append($("<th></th>").text(h))

        if (mode in this.list)
            for (let i=0; i<this.list[mode].length; ++i) {
                let result = this.list[mode][i]
                let $tr = result.tr(i+1)
                $table.append($tr)
                if (i === rating) // highlight
                    $tr.css('background-color', 'rgba(255,255,0,0.58)')
            }

        return $table
    }
}
