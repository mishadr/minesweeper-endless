class Pos {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    add(pos) {
        this.x += pos.x
        this.y += pos.y
        return this
    }

    eq(pos) {
        return pos.x === this.x && pos.y === this.y
    }

    static add(pos1, pos2) {
        return new Pos(pos1.x + pos2.x, pos1.y + pos2.y)
    }

    static sub(pos1, pos2) {
        return new Pos(pos1.x - pos2.x, pos1.y - pos2.y)
    }

    // static mul(pos1, pos2) {
    //     return new Pos(pos1.x - pos2.x, pos1.y - pos2.y)
    // }

}


// Real values
BOMB = 9
// OPEN with 0 - 8
// When not open yet = real - 10
// FLAG =

class Game {
    constructor(width, height, density, drawer) {
        // this.width = width
        // this.height = height
        this.density = density
        this.drawer = drawer

        this.score = 0
        let [w, h] = this.drawer.init()
        this.width = w
        this.height = h

        this.blocks = {}
        this.blocks["0,0"] = this.addArea(new Pos(0, 0))
    }

    addArea(blockPos, left=null, right=null, top=null, bottom=null) {
        let a = new Array(this.width) // W x H array of integers
        for (let i=0; i<this.width; ++i) {
            a[i] = new Array(this.height)
            for (let j=0; j<this.height; ++j) {
                a[i][j] = 0 // TODO
                let pos = new Pos(blockPos.x * this.width + i, blockPos.y * this.height + j)
                this.drawer.add(pos, a[i][j] - 10)
            }
        }
        return a
    }

    open(blockPos, area, areaPos) {
        console.log(pos)
        let i = areaPos.x
        let j = areaPos.y
        if (area[i][j] < 0) {
            area[i][j] += 10
            let pos = new Pos(blockPos.x * this.width + i, blockPos.y * this.height + j)
            this.drawer.change(pos, area[i][j])
        }
    }

    leftClick(x, y) {
        console.log('leftClick')
        x = Math.floor(x / this.drawer.size)
        y = Math.floor(y / this.drawer.size)
        let blockPos = new Pos(Math.floor(x / this.width), Math.floor(y / this.height))
        let areaPos = new Pos(x % this.width, y % this.height)
        let blockIndex = `${blockPos.x},${blockPos.y}`
        console.log(blockPos, blockIndex)
        if (blockIndex in this.blocks) {
            let area = this.blocks[blockIndex]
            this.open(blockPos, area, areaPos)
        }
        else {
            // TODO create new block
        }

    }

    rightClick(pos) {
        console.log('rightClick')

    }

    doubleClick(pos) {
        console.log('doubleClick')

    }

}
