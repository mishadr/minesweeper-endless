class Drawer {
    constructor(element) {
        this.element = element

        this.size = 30
        // this.left = null
        // this.top = null

        this.width = this.element.clientWidth
        this.height = this.element.clientHeight
    }

    // Compute coordinates transform
    init() {
        this.element.innerHTML = ''
        let w = Math.ceil(this.width / this.size)
        let h = Math.ceil(this.height / this.size)
        return [w, h]
    }

    getX(i) {
        return this.size * i
    }

    getY(j) {
        return this.size * j
    }

    id(pos) {
        return `${pos.x}-${pos.y}`
    }

    // Change primitives at cell (i, j) according to its value
    add(pos, value) {
        if (value < 0) {// Not open
            let x = this.getX(pos.x)
            let y = this.getY(pos.y)
            let box = document.createElementNS("http://www.w3.org/2000/svg", "path")
            box.setAttribute('d', `M${x + 1},${y + this.size / 2} L${x + this.size - 1},${y + this.size / 2}`)
            box.setAttribute('stroke', '#d7d7d7')
            box.setAttribute('stroke-width', this.size - 2)
            box.setAttribute('class', `field cell-${this.id(pos)}`)
            this.element.appendChild(box)
        }
        else {
            // TODO
        }
    }

    // Move primitives of class=type primitives from cell at posFrom to cell at posTo
    change(pos, value) {
        // TODO remove
        // TODO add

        let objs = $(`.${type}.cell-${this.id(posFrom)}`)
        for (const obj of objs) {
            let cx = parseFloat(obj.getAttribute('cx'))
            let cy = parseFloat(obj.getAttribute('cy'))
            obj.setAttribute('cx', cx + (posTo.x - posFrom.x) * this.size)
            obj.setAttribute('cy', cy + (posTo.y - posFrom.y) * this.size)
            obj.setAttribute('class', `${type} cell-${this.id(posTo)}`)
        }
    }

    // Delete primitives of class=type from cell at pos
    del(type, pos) {
        let objs = $(`.${type}.cell-${this.id(pos)}`)
        for (const obj of objs) {
            obj.outerHTML = ''
        }
    }

    addFree(pos) {
        let x = this.getX(pos.x)
        let y = this.getY(pos.y)
        let box = document.createElementNS("http://www.w3.org/2000/svg", "path")
        box.setAttribute('d', `M${x + 1},${y + this.size / 2} L${x + this.size - 1},${y + this.size / 2}`)
        box.setAttribute('stroke', '#d7d7d7')
        box.setAttribute('stroke-width', this.size - 2)
        box.setAttribute('class', `field cell-${this.id(pos)}`)
        this.element.appendChild(box)
    }

}