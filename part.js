class Part {

    highlight = false
    picking = false
    link

    scheme = []

    name = "default"
    colour = "#008808"
    id = 0

    x = 0
    y = 0
    z = 1

    w = 0
    l = 0

    rotation = 0
    height = 1

    constructor(props) {
        console.log(props)
        this.name = props.name
        this.colour = props.colour
        this.height = props.height
        this.scheme = props.scheme

        this.w = this.scheme[0].length
        this.l = this.scheme.length
    }

    render() {
        noStroke()

        if (this.highlight) {
            stroke(255)
            strokeWeight(5)
            fill(this.colour)
        } else {
            fill(this.colour)
        }

        if (this.picking) {
            fill(this.id, 255, 255)
        }

        push()
        translate(this.x, this.y, 0)
        rotateZ(this.rotation * PI / 2)
        translate((this.w * 0.5), (this.l * 0.5), this.z + (this.height * 0.5))


        push()
        fill(255)
        for (let y = 0; y < this.l; y++) {
            for (let x = 0; x < this.w; x++) {
                
                if (this.scheme[y][x] < 0) {
                    push()
                    translate((x - (this.w * 0.5)) + 0.5, (y - (this.l * 0.5)) + 0.5, -this.height * 0.5 - this.scheme[y][x] - 0.5)
                    scale(0.98, 0.98, 0.98)
                    box(1)
                    //sphere(0.5,8,14)
                    pop()
                }
                if (this.scheme[y][x] > 0) {
                    push()
                    translate((x - (this.w * 0.5)) + 0.5, (y - (this.l * 0.5)) + 0.5, - ((this.height + this.z) * 0.5) - 0.5)
                    scale(0.4, 0.4, this.z + 1 + 0.25)
                    box(1)
                    //sphere(0.5,8,14)
                    pop()
                }
                if (this.scheme[y][x] > 1) {
                    push()
                    translate((x - (this.w * 0.5)) + 0.5, (y - (this.l * 0.5)) + 0.5, -this.height * 0.5 + this.scheme[y][x] - 1.5)
                    scale(0.98, 0.98, 0.98)
                    box(1)
                    //sphere(0.5,8,14)
                    pop()
                }
            }
        }
        pop()
        scale(this.w, this.l, this.height)
        box(0.95)
        pop()

        this.picking = false
    }

}