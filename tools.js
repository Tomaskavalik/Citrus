function clickableText(t, radius, id, x, y, picking) {
    noStroke()
    if (picking) {
        fill(255, id, 255)
        rect(x, y, radius, radius)
    } else {
        text(t, x, y)
    }
}

function flerp(a, b, alpha) {
    alpha = Math.min(Math.max(alpha, 0), 1)

    return (a + b) * alpha
}

function cable(c, h, startX, startY, startZ, endX, endY, endZ) {
    noFill()
    stroke(color(c))
    strokeWeight(10)
    curve(startX + 0.5, startY + 0.5, -h, startX + 0.5, startY + 0.5, startZ, endX + 0.5, endY + 0.5, endZ, endX + 0.5, endY + 0.5, -h);
}