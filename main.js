const canvas = document.getElementById("background-canvas")

let font

let colours = ["#000000", "#FF5500", "#8B4513", "#4169E1", "#228B22", "#FFFF00"]

let downX = 0
let downY = 0

let upX = 0
let upY = 0

let toolbarIndex = 0

let frame = 0
let picking = false

let perspective = 1
let targetPerspective = 1
let rotation = Math.PI/4

let scl = 20

let mouseWheelIndex = 0

let border = 4

let boardSizeX = 20
let boardSizeY = 14

let boardImage

let backgroundColor = "#fcba03"

let parts = []
let selectedParts = []
let loadedParts = []

let wires = []

//parts.push(new Part(...Library.power))

//parts[3].z = 1


function preload() {
    font = loadFont(FONT_MONO)
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight, WEBGL, canvas)
    //setAttributes('antialias', true);
    //setAttributes('perPixelLighting', true);
    textureWrap(REPEAT)

    frameRate(60)

    noStroke()

    textFont(font)
    textAlign(CENTER, CENTER)

    rectMode(CENTER)

    boardImage = loadImage(IMG_BOARD)
    //noLights()

    let index = 0
    Object.keys(library).forEach(key => {

        loadedParts.push(library[key])
        loadedParts[index].name = key
        index++
    })

    let savedLayout = localStorage.getItem("layout")

    if (savedLayout) {
        let layout = loadLayout(savedLayout,library)

        boardSizeX = layout.boardSizeX
        boardSizeY = layout.boardSizeY
        parts = layout.parts
    }


}


function draw() {
    frame++
    //clear()
    background(backgroundColor)

    ortho()

    //RENDER TO SCREEN

    toolbarIndex = Math.min(Math.max(toolbarIndex, 0), loadedParts.length - 1)
    //console.log(toolbarIndex)

    //TUTORIAL
    fill(255)
    textSize(20)
    text("[WASD]        move part     ", - width * 0.5 + 200, - height * 0.5 + 20)
    text("[E]           move part up  ", - width * 0.5 + 200, - height * 0.5 + 50)
    text("[Q]           move part down", - width * 0.5 + 200, - height * 0.5 + 80)
    text("[R]           rotate part   ", - width * 0.5 + 200, - height * 0.5 + 110)
    text("[Del]         delete part   ", - width * 0.5 + 200, - height * 0.5 + 140)
    text("[CTRL-S]      save layout   ", - width * 0.5 + 200, - height * 0.5 + 170)
    text("[Tab]         change view   ", - width * 0.5 + 200, - height * 0.5 + 200)
    text("[mouse wheel] link solder   ", - width * 0.5 + 200, - height * 0.5 + 230)

    fill(255)
    textSize(60)
    clickableText("<", 50, 128, (-width * 0.5) + 20, height * 0.5 - 45, picking)
    clickableText(loadedParts[toolbarIndex].name, 120, 129, 0, height * 0.5 - 50, picking)
    clickableText(">", 50, 130, (width * 0.5) - 20, height * 0.5 - 45, picking)

    perspective = flerp(perspective, targetPerspective, 0.5)

    rotateX(perspective * PI / 4)

    rotateZ(rotation)

    //RENDER ON THE GROUND FROM CENTER
    scale(scl)

    fill(255)
    textSize(3)
    text(boardSizeX, 0, -(boardSizeY * 0.5) - 3)
    text(boardSizeY, -(boardSizeX * 0.5) - 3, 0)

    textSize(5)
    clickableText("+", 3, 131, (boardSizeX * 0.5) + 2, -2, picking)
    clickableText("-", 3, 132, (boardSizeX * 0.5) + 2, 1, picking)

    clickableText("+", 3, 133, 2, (boardSizeY * 0.5) + 2, picking)
    clickableText("-", 3, 134, -1, (boardSizeY * 0.5) + 2, picking)


    //sphere(0.5,12,16)

    let u = boardSizeX * 32
    let v = boardSizeY * 32


    translate(-(boardSizeX * 0.5) - border, -(boardSizeY * 0.5) - border, 0)

    //RENDER ON THE GROUND FROM BOARD CORNER
    lights()

    texture(boardImage)
    noStroke()

    beginShape(TRIANGLES)
    vertex(border, border, 0, 0, 0)
    vertex(boardSizeX + border, border, 0, u, 0)
    vertex(boardSizeX + border, boardSizeY + border, 0, u, v)

    vertex(boardSizeX + border, boardSizeY + border, 0, u, v)
    vertex(border, boardSizeY + border, 0, 0, v)
    vertex(border, border, 0, 0, 0)
    endShape();

    beginShape(TRIANGLES)
    vertex(boardSizeX + border, border, -0.512, u, 0)
    vertex(border, border, -0.512, 0, 0)
    vertex(border, boardSizeY + border, -0.512, 0, v)

    vertex(boardSizeX + border, border, -0.512, u, 0)
    vertex(border, boardSizeY + border, -0.512, 0, v)
    vertex(boardSizeX + border, boardSizeY + border, -0.512, u, v)


    endShape();

    fill("#20A020")
    noStroke()

    push()
    translate(boardSizeX * 0.5 + border, boardSizeY * 0.5 + border, -0.256)
    scale(boardSizeX, boardSizeY, 0.5)
    box(1)
    pop()



    if (!picking) {
        parts.forEach(part => {
            part.render()
        })
    } else {
        noLights()
        noStroke()

        parts.forEach(part => {
            part.picking = true

            part.render()
        })

        let pick = get(mouseX, mouseY)
        let id = pick[0] - 128
        console.log(pick)
        console.log(id)

        //SPECIAL PICK CASES
        if (pick[1] == 128) toolbarIndex--
        if (pick[1] == 130) toolbarIndex++
        if (pick[1] == 131) boardSizeX = Math.max(Math.min(boardSizeX + 1, 127 - border * 2), 0)
        if (pick[1] == 132) boardSizeX = Math.max(Math.min(boardSizeX - 1, 127 - border * 2), 0)
        if (pick[1] == 133) boardSizeY = Math.max(Math.min(boardSizeY + 1, 127 - border * 2), 0)
        if (pick[1] == 134) boardSizeY = Math.max(Math.min(boardSizeY - 1, 127 - border * 2), 0)

        if (pick[1] == 129) {
            console.log("y")
            let part = new Part(loadedParts[toolbarIndex])
            parts.push(part)
            selectedParts.push(part)
        }

        if (color(pick).levels.toString() == color(backgroundColor).levels.toString()) {
            selectedParts = []

            parts.forEach(part => {
                part.highlight = false
            })
        } else {
            /*
            if(id < 100){
                selectedParts.push(parts[id])
            }
            */

            parts.forEach(part => {

                if (pick[0] == part.id) {
                    selectedParts.push(part)
                }
            })

        }

    }

    selectedParts.forEach(part => {
        part.highlight = true
    })

    let index = 0
    parts.forEach(part => {

        //[128:255]
        part.id = 128 + index

        if (part.link) {
            let sign = Math.sign((part.z + part.link.z) * 0.5)
            let distance = dist(part.x, part.y, part.z, part.link.x, part.link.y, part.link.z)
            if (sign == 0) sign = -1

            cable(part.colour, sign * (distance * 2), part.x, part.y, part.z, part.link.x, part.link.y, part.link.z)
        }

        if (part.name != "Solder") {
            push()
            translate(part.x, part.y, part.z + part.height)
            rotateZ(part.rotation * PI / 2)
            translate(part.w * 0.5, part.l * 0.5, 0)
            fill(255)
            textSize(0.9)
            text(part.name, 0, 0)
            pop()
        }

        index++
    })

    picking = false
}

function mouseDragged() {
    rotation -= (mouseX - pmouseX) * 0.002
}

function saveLayout(boardSizeX, boardSizeY, parts) {

    let layout = {
        "boardSizeX": boardSizeX,
        "boardSizeY": boardSizeY,
        "parts": []
    }

    parts.forEach(part => {
        let linkIndex = null
        if(part.link){
            linkIndex = parts.indexOf(part.link)
        }
        console.log(part.colour)
        layout.parts.push({ "name": part.name,"colour":part.colour, "x": part.x, "y": part.y, "z": part.z, "rotation": part.rotation, "linkIndex": linkIndex })
    })

    return JSON.stringify(layout)
}

function loadLayout(save, lib) {
    save = JSON.parse(save)

    let layout = {
        "boardSizeX": save.boardSizeX,
        "boardSizeY": save.boardSizeY,
        "parts": []
    }

    save.parts.forEach(part => {

        

        newPart = new Part(lib[part.name])
        newPart.name = part.name
        newPart.colour = part.colour
        newPart.x = part.x
        newPart.y = part.y
        newPart.z = part.z
        newPart.rotation = part.rotation
        newPart.link = part.linkIndex

        layout.parts.push(newPart)
    })

    layout.parts.forEach(part => {
        part.link = layout.parts[part.link]
    })

    return layout
}

document.addEventListener("mouseup", (event) => {
    //console.log(event)

    if (event.button == 0) {

        upX = mouseX
        upY = mouseY

        if (abs(upX - downX) < 8 && abs(upY - downY) < 8) {

            if (!event.ctrlKey) {
                selectedParts.forEach(part => {
                    part.highlight = false
                })
                selectedParts = []
            }
            picking = true

        }
    }

    if (event.button == 2) {

    }

})


document.addEventListener("mousedown", (event) => {
    event.preventDefault()

    if (event.button == 0) {
        //console.log(event)
        downX = mouseX
        downY = mouseY
    }
})

document.addEventListener("keydown", (event) => {
    event.preventDefault()

    let key = event.key
    let ctrl = event.ctrlKey
    console.log(key)
    console.log(ctrl)

    let offsetX = 0
    let offsetY = 0
    let offsetZ = 0
    let del = false

    let offsetR = 0

    if (key == "Tab") targetPerspective = (targetPerspective + 1) % 5
    if (key == "d") offsetX = 1
    if (key == "a") offsetX = -1
    if (key == "w") offsetY = -1
    if (key == "s") offsetY = 1
    if (key == "e") offsetZ = 1
    if (key == "q") offsetZ = -1
    if (key == "r") offsetR = 1

    if (key == "Delete") del = true

    if (ctrl == true) {
        if (key == "s") {
            localStorage.setItem("layout", saveLayout(boardSizeX, boardSizeY, parts))
        }
    }

    selectedParts.forEach(part => {

        if (del) {
            parts.splice(parts.indexOf(part), 1)
        }

        part.x = Math.max(Math.min(part.x + offsetX, boardSizeX + 8), 0)
        part.y = Math.max(Math.min(part.y + offsetY, boardSizeY + 8), 0)
        part.z = Math.max(Math.min(part.z + offsetZ, 127), 0)

        part.rotation += offsetR

    })

    if (del) {
        selectedParts = []
    }

})

document.addEventListener("wheel", (event) => {
    let dir = Math.sign(event.deltaY)

    mouseWheelIndex++
    let colourIndex = (mouseWheelIndex + dir) % colours.length

    console.log(selectedParts.length)

    if (selectedParts.length == 2) {
        if (selectedParts[0].name == "Solder" && selectedParts[1].name == "Solder") {
            selectedParts[0].link = selectedParts[1]

            //console.log(color(mouseWheelIndex))

            console.log(colours[colourIndex])

            selectedParts[0].colour = colours[colourIndex]
            selectedParts[1].colour = colours[colourIndex]
        }
    }


})

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}