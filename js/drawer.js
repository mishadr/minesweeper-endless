COLORS = {
    0: '#d7d7d7',
    1: '#4eabff',
    2: '#0ec400',
    3: '#ff0000',
    4: '#0115a5',
    5: '#b44a1d',
    6: '#6bdbb2',
    7: '#000000',
    8: '#8b8b8b',
}


class Drawer {
    constructor(element) {
        this.element = element
        // TODO parameter, maybe scale?
        this.size = 30

        this.ctx = this.element.getContext("2d", {willReadFrequently: true})
        this.viewX = 0
        this.viewY = 0
        this.margin = 50

        this.img = {}
        for (let i=0;i<9;++i) {
            let img = new Image(this.size, this.size)
            img.crossOrigin = "anonymous"
            img.src = `assets/pole${i}.png`
            this.img[i] = img
        }

        for (let [key, src] of [
            [HIDDEN, "assets/hidden.png"],
            [BOMB, "assets/bomb.png"],
            [BOMB_EXPLODE, "assets/bomb_explode.png"],
            [FLAG, "assets/flag.png"],
            [FLAG_WRONG, "assets/flag_wrong.png"],]) {

            let img = new Image(this.size, this.size)
            img.crossOrigin = "anonymous"
            img.src = src
            img.alt = src
            this.img[key] = img
        }

        // // Load all images
        // for (const img of Object.values(this.img)) {
        //     // console.log('not loaded yet')
        //     img.onload = () => {
        //         console.log("loaded img", img.src)
        //     }
        // }
    }

    // Compute coordinates transform
    init(parameters) {
        this.viewX = 0
        this.viewY = 0
        let w = parameters.width
        let h = parameters.height
        if (parameters.mode === "endless") {
            w = Math.floor((this.element.clientWidth - 2 * this.margin) / this.size)
            h = Math.floor((this.element.clientHeight - 2 * this.margin) / this.size)
        }
        return [w, h]
    }

    // Field i -> X coordinate
    getX(i) {
        return this.size * i - this.viewX + this.margin
    }

    // Field j -> Y coordinate
    getY(j) {
        return this.size * j - this.viewY + this.margin
    }

    // X,Y coordinates -> field position
    find (x, y) {
        x = Math.floor((x - this.margin) / this.size)
        y = Math.floor((y - this.margin) / this.size)
        return new Pos(x, y)
    }

    // Change primitives at cell (i, j) according to its value
    set(pos, value) {
        let x = this.getX(pos.x)
        let y = this.getY(pos.y)
        let ctx = this.ctx

        if (value >= 200) {// Flag
            ctx.drawImage(this.img[FLAG], x, y, this.size, this.size)
        }
        else if (value >= 100) {// Not open
            ctx.drawImage(this.img[HIDDEN], x, y, this.size, this.size)
        }
        // else if (0 <= value && value < 9) { // Raster number
        //     this.ctx.fillStyle = '#d7d7d7'
        //     this.ctx.fillRect(x+1, y+1, this.size-1, this.size-1)
        //     this.ctx.font = `${Math.floor(this.size)}px Arial`
        //     this.ctx.fillStyle = COLORS[value]
        //     this.ctx.textAlign = "center"
        //     this.ctx.fillText(value.toString(), x+this.size/2, y+Math.floor(this.size*0.9))
        // }
        else { // Image
            if (!(value >= 0))
                console.log(this.img[value], value)
            this.ctx.drawImage(this.img[value], x, y, this.size, this.size)
        }
    }

    updateViewBox(xMinBlock, yMinBlock, xMaxBlock, yMaxBlock) {
        let x0 = xMinBlock * this.size
        let y0 = yMinBlock * this.size
        let x1 = xMaxBlock * this.size
        let y1 = yMaxBlock * this.size

        let dx = 0
        let dy = 0

        let old = this.ctx.getImageData(0, 0, this.ctx.canvas.width - 1, this.ctx.canvas.height - 1)
        old.crossOrigin = "anonymous";

        let parent = this.element.parentElement
        let pw = parent.clientWidth
        let ph = parent.clientHeight

        if (xMinBlock * this.size < this.viewX) {
            dx = this.viewX - xMinBlock * this.size
            this.viewX = xMinBlock * this.size
        }
        if (yMinBlock * this.size < this.viewY) {
            dy = this.viewY - yMinBlock * this.size
            this.viewY = yMinBlock * this.size
        }

        // This is to avoid visible picture moves when
        this.ctx.canvas.width = Math.max(x1-x0 + 2*this.margin, pw + dx, pw + parent.scrollLeft)
        this.ctx.canvas.height = Math.max(y1-y0 + 2*this.margin, ph + dy, ph + parent.scrollTop)

        parent.scrollLeft += dx
        parent.scrollTop += dy

        this.ctx.putImageData(old, dx, dy)
    }
}