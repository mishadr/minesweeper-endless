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

    left() {
        return new Pos(this.x-1, this.y)
    }

    right() {
        return new Pos(this.x+1, this.y)
    }

    top() {
        return new Pos(this.x, this.y-1)
    }

    bottom() {
        return new Pos(this.x, this.y+1)
    }

    toIndex() {
        return ix(this.x, this.y)
    }

    static add(pos1, pos2) {
        return new Pos(pos1.x + pos2.x, pos1.y + pos2.y)
    }

    static sub(pos1, pos2) {
        return new Pos(pos1.x - pos2.x, pos1.y - pos2.y)
    }
}

function ix(i, j) {
    return `${i},${j}`
}



// Real values
// OPEN with 0 - 8
BOMB = 9
BOMB_EXPLODE = 10
FLAG = 11
FLAG_WRONG = 12
HIDDEN = 100
// NOT OPEN yet = 100-109
// WITH FLAG = 200-209

// Statuses
ON = "on" // in progress
WIN = "win" // opened all cells
EXPLODE = "explode" // exploded


class Game {
    constructor(parameters, drawer) {
        this.parameters = parameters
        this.drawer = drawer

        this.opened = 0
        this.flags = 0
        this.dies = 0

        this.status = ON

        this.area = {} // i,j -> value
        this.blocks = new Set() // x,y -> bool

        let [w, h] = this.drawer.init(this.parameters)

        if (this.parameters.mode === "endless") {
            this.step = Math.min(w, h)
            this.xMinBlock = 0
            this.xMaxBlock = 0
            this.yMinBlock = 0
            this.yMaxBlock = 0
            this.addBlock(new Pos(0, 0))
        }
        else {
            this.step = Math.max(w, h)
            this.drawer.updateViewBox(0, 0, w, h)
            this.createArea()
        }

    }

    openByFlags(i, j) {
        let a = this.area
        let f = 0
        for(let [di, dj] of [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]])
            if (a[ix(i+di,j+dj)] === BOMB_EXPLODE || a[ix(i+di,j+dj)] >= 200) //
                f += 1

        if (a[ix(i,j)] === f) {
            for(let [di, dj] of [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]])
                if (a[ix(i+di,j+dj)] < 200)
                    this.open(new Pos(i+di, j+dj))
        }
    }

    count(i, j) {
        let a = this.area
        let ij = ix(i,j)
        if (!(ij in a)) return

        if (a[ij] % 100 !== BOMB) {
            let b = 0
            for(let [di, dj] of [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]]) {
                let v = a[ix(i + di, j + dj)] % 100
                if (v === BOMB || v === BOMB_EXPLODE)
                    b += 1
            }
            a[ij] = 100 * Math.floor(a[ij] / 100) + (b % 100)
        }
        // Hide and draw
        if (a[ij] < 100)
            a[ij] += 100
        this.drawer.set(new Pos(i, j), a[ij])
    }

    // Create a field for non-endless mode
    createArea() {
        let w = this.parameters.width
        let h = this.parameters.height

        // Fill with zeros
        for (let i=0; i<w; ++i)
            for (let j=0; j<h; ++j)
                this.area[ix(i,j)] = 0

        // Add bombs
        for (let b=0; b<this.parameters.bombs; ++b) {
            while (1) {
                let i = Math.floor(Math.random()*w)
                let j = Math.floor(Math.random()*h)
                if (this.area[ix(i,j)] !== BOMB) {
                    this.area[ix(i,j)] = BOMB
                    break
                }
            }
        }
        // Count inner region
        for (let i=0; i<w; ++i)
            for (let j=0; j<h; ++j)
                this.count(i, j)

        console.log("Created area", w, h)
        this.blocks.add(ix(0, 0))
    }

    addBlock(blockPos) {
        let s = this.step
        let xShift = blockPos.x * s
        let yShift = blockPos.y * s
        let density = parseFloat(this.parameters.density)

        // this.drawer.beginBatch()

        // Fill with bombs
        for (let i=0; i<s; ++i)
            for (let j=0; j<s; ++j)
                // this.area[ix(xShift+i,yShift+j)] = (31*i*j%100)/100 < density ? BOMB : 0
                this.area[ix(xShift+i,yShift+j)] = Math.random() < density ? BOMB : 0

        // Count inner region
        for (let i=0; i<s; ++i)
            for (let j=0; j<s; ++j)
                this.count(xShift+i, yShift+j)

        // Get info about neighbors
        if (this.blocks.has(blockPos.left().toIndex()))
            // Update numbers at our left border and its right border
            for (let y=0; y<s; ++y) {
                this.count(xShift - 1, y + yShift)
                this.count(xShift, y + yShift)
            }
        if (this.blocks.has(blockPos.right().toIndex()))
            // Update numbers at our right border and its left border
            for (let y=0; y<s; ++y) {
                this.count(xShift + s - 1, y + yShift)
                this.count(xShift + s, y + yShift)
            }
        if (this.blocks.has(blockPos.top().toIndex()))
            // Update numbers at our top border and its bottom border
            for (let x=0; x<s; ++x) {
                this.count(x + xShift, yShift - 1)
                this.count(x + xShift, yShift)
            }
        if (this.blocks.has(blockPos.bottom().toIndex()))
            // Update numbers at our bottom border and its top border
            for (let x=0; x<s; ++x) {
                this.count(x + xShift, yShift + s - 1)
                this.count(x + xShift, yShift + s)
            }
        // 4 corner's neighbors' corners
        if (this.blocks.has(blockPos.left().top().toIndex()))
            this.count(xShift - 1, yShift - 1)
        if (this.blocks.has(blockPos.right().top().toIndex()))
            this.count(xShift + s, yShift - 1)
        if (this.blocks.has(blockPos.left().bottom().toIndex()))
            this.count(xShift - 1, yShift + s)
        if (this.blocks.has(blockPos.right().bottom().toIndex()))
            this.count(xShift + s, yShift + s)

        // this.drawer.endBatch()

        // console.log("Added block", blockPos.toIndex())
        // console.log("Count time", this._time)
        // console.log("Drawer add time", this.drawer._addtime)
        // console.log("Drawer del time", this.drawer._deltime)

        this.blocks.add(blockPos.toIndex())
    }

    updateViewBox() {
        this.drawer.updateViewBox(
            this.xMinBlock * this.step,
            this.yMinBlock * this.step,
            (this.xMaxBlock + 1) * this.step,
            (this.yMaxBlock + 1) * this.step)
    }

    // Open and remove bomb if it is there
    happyOpen(pos) {
        let a = this.area
        let v = a[pos.toIndex()]
        if (v % 100 !== BOMB)
            return
        a[pos.toIndex()] = 0 + 100 // 0 will be re-counted

        if (this.parameters.mode !== "endless") {
            let w = this.parameters.width
            let h = this.parameters.height
            // Generate a new bomb
            while (1) {
                let i = Math.floor(Math.random()*w)
                let j = Math.floor(Math.random()*h)
                if (a[ix(i,j)] !== BOMB) {
                    a[ix(i,j)] = BOMB + 100
                    // Update around a new bomb
                    for (let [di, dj] of [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]])
                        this.count(i+di, j+dj)
                    break
                }
            }
        }

        // Update 3x3
        for (let di=-1; di<=1; di++)
            for (let dj=-1; dj<=1; dj++)
                this.count(pos.x + di, pos.y + dj)
    }

    // Recursively open cell
    open(pos) {
        let s = this.step
        let blockPos = new Pos(Math.floor(pos.x / s), Math.floor(pos.y / s))
        // console.log("open", pos)
        let i = pos.x
        let j = pos.y

        if (this.parameters.mode === "endless") {
            // Check if border
            if (i % s === 0) {
                let left = blockPos.left()
                if (!(this.blocks.has(left.toIndex()))) {
                    if (left.x < this.xMinBlock) {
                        this.xMinBlock = left.x
                        this.updateViewBox()
                    }
                    this.addBlock(left)
                }
            }
            if ((i + 1) % s === 0) {
                let right = blockPos.right()
                if (!(this.blocks.has(right.toIndex()))) {
                    if (right.x > this.xMaxBlock) {
                        this.xMaxBlock = right.x
                        this.updateViewBox()
                    }
                    this.addBlock(right)
                }
            }
            if (j % s === 0) {
                let top = blockPos.top()
                if (!(this.blocks.has(top.toIndex()))) {
                    if (top.y < this.yMinBlock) {
                        this.yMinBlock = top.y
                        this.updateViewBox()
                    }
                    this.addBlock(top)
                }
            }
            if ((j + 1) % s === 0) {
                let bottom = blockPos.bottom()
                if (!(this.blocks.has(bottom.toIndex()))) {
                    if (bottom.y > this.yMaxBlock) {
                        this.yMaxBlock = bottom.y
                        this.updateViewBox()
                    }
                    this.addBlock(bottom)
                }
            }
            // Check if corner
            if (i % s === 0 && j % s === 0) {
                let topLeft = blockPos.top().left()
                if (!(this.blocks.has(topLeft.toIndex()))) {
                    if (topLeft.y < this.yMinBlock) {
                        this.yMinBlock = topLeft.y
                        this.updateViewBox()
                    }
                    if (topLeft.x < this.xMinBlock) {
                        this.xMinBlock = topLeft.x
                        this.updateViewBox()
                    }
                    this.addBlock(topLeft)
                }
            }
            if ((i + 1) % s === 0 && j % s === 0) {
                let topRight = blockPos.top().right()
                if (!(this.blocks.has(topRight.toIndex()))) {
                    if (topRight.y > this.yMaxBlock) {
                        this.yMaxBlock = topRight.y
                        this.updateViewBox()
                    }
                    if (topRight.x < this.xMinBlock) {
                        this.xMinBlock = topRight.x
                        this.updateViewBox()
                    }
                    this.addBlock(topRight)
                }
            }
            if (i % s === 0 && (j + 1) % s === 0) {
                let bottomLeft = blockPos.bottom().left()
                if (!(this.blocks.has(bottomLeft.toIndex()))) {
                    if (bottomLeft.y > this.yMaxBlock) {
                        this.yMaxBlock = bottomLeft.y
                        this.updateViewBox()
                    }
                    if (bottomLeft.x < this.xMinBlock) {
                        this.xMinBlock = bottomLeft.x
                        this.updateViewBox()
                    }
                    this.addBlock(bottomLeft)
                }
            }
            if ((i + 1) % s === 0 && (j + 1) % s === 0) {
                let bottomRight = blockPos.bottom().right()
                if (!(this.blocks.has(bottomRight.toIndex()))) {
                    if (bottomRight.y > this.yMaxBlock) {
                        this.yMaxBlock = bottomRight.y
                        this.updateViewBox()
                    }
                    if (bottomRight.x > this.xMaxBlock) {
                        this.xMaxBlock = bottomRight.x
                        this.updateViewBox()
                    }
                    this.addBlock(bottomRight)
                }
            }
        }

        // Check if need to open
        let a = this.area[ix(i,j)]
        if (a >= 100 && a < 200) { // HIDDEN and not FLAG
            a -= 100
            if (a === BOMB) {
                // If the first click -> remove bomb
                if (this.opened === 0) {
                    this.happyOpen(pos)
                    a = this.area[ix(i,j)] - 100 // area was updated
                }
                else {
                    a = BOMB_EXPLODE
                    this.dies += 1
                    this.status = EXPLODE
                }
            }
            this.opened += 1
            this.area[ix(i,j)] = a
            this.drawer.set(pos, a)
            if (this.opened - this.dies + this.parameters.bombs ===
                this.parameters.width * this.parameters.height) {
                // all possible cells are open
                this.status = WIN
            }

            if (this.area[ix(i,j)] === 0) { // Open neighbors
                // TODO avoid recursion
                // TODO if result=win for any, then return win
                this.open(pos.left().top())
                this.open(pos.left())
                this.open(pos.left().bottom())
                this.open(pos.top())
                this.open(pos.bottom())
                this.open(pos.right().top())
                this.open(pos.right())
                this.open(pos.right().bottom())
            }
        }
    }

    leftClick(x, y) {
        // console.log('leftClick')
        let pos = this.drawer.find(x, y)
        let blockPos = new Pos(Math.floor(pos.x / this.step), Math.floor(pos.y / this.step))
        if (this.blocks.has(blockPos.toIndex()))
            return this.open(pos)
        else {
            // TODO create new block
        }
    }

    rightClick(x, y) {
        // console.log('rightClick')
        let pos = this.drawer.find(x, y)
        let blockPos = new Pos(Math.floor(pos.x / this.step), Math.floor(pos.y / this.step))
        if (this.blocks.has(blockPos.toIndex())) {
            let a = this.area[pos.toIndex()]
            if (a >= 100) {
                // Toggle flag
                this.flags += a < 200 ? 1 : -1
                this.area[pos.toIndex()] = a < 200 ? a + 100 : a - 100
                this.drawer.set(pos, this.area[pos.toIndex()])
            }
        }
    }

    doubleClick(x, y) {
        // console.log('doubleClick')
        let pos = this.drawer.find(x, y)
        let blockPos = new Pos(Math.floor(pos.x / this.step), Math.floor(pos.y / this.step))
        if (this.blocks.has(blockPos.toIndex())) {
            let a = this.area[pos.toIndex()]
            if (a < 100) { // is open
                this.openByFlags(pos.x, pos.y)
            }
        }
    }

}
