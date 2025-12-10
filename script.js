// Requires D3 v5+ to be included in the page, e.g.:
// <script src="https://d3js.org/d3.v5.min.js"></script>

var padding = { top: 8, right: 40, bottom: 0, left: 90 },
    w = 560 - padding.left - padding.right,
    h = 560 - padding.top - padding.bottom,
    r = Math.min(w, h) / 2,
    rotation = 0,
    oldrotation = 0,
    pickedIndex = 0;

// Custom sequence you requested: questions 1, 3, 5, 4, 2, 9, 8, 6, 7, 10
// Stored as zero-based indices
var sequence = [0, 2, 4, 3, 1, 8, 7, 5, 6, 9];

var color = d3.scaleOrdinal(d3.schemeCategory10);

var data = [
    { idx: 0, label: "1", value: 1, question: "Question 1 (placeholder)", answer: "Answer 1 (placeholder)" },
    { idx: 1, label: "2", value: 1, question: "Question 2 (placeholder)", answer: "Answer 2 (placeholder)" },
    { idx: 2, label: "3", value: 1, question: "Question 3 (placeholder)", answer: "Answer 3 (placeholder)" },
    { idx: 3, label: "4", value: 1, question: "Question 4 (placeholder)", answer: "Answer 4 (placeholder)" },
    { idx: 4, label: "5", value: 1, question: "Question 5 (placeholder)", answer: "Answer 5 (placeholder)" },
    { idx: 5, label: "6", value: 1, question: "Question 6 (placeholder)", answer: "Answer 6 (placeholder)" },
    { idx: 6, label: "7", value: 1, question: "Question 7 (placeholder)", answer: "Answer 7 (placeholder)" },
    { idx: 7, label: "8", value: 1, question: "Question 8 (placeholder)", answer: "Answer 8 (placeholder)" },
    { idx: 8, label: "9", value: 1, question: "Question 9 (placeholder)", answer: "Answer 9 (placeholder)" },
    { idx: 9, label: "10", value: 1, question: "Question 10 (placeholder)", answer: "Answer 10 (placeholder)" }
];

var svg = d3.select('#chart')
    .append("svg")
    .attr("width", w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);

// compute center coords for things that should not rotate with the wheel
var centerX = w / 2 + padding.left;
var centerY = h / 2 + padding.top;

// pointer/arrow group appended to svg (so it does NOT rotate with the wheel)
var pointerGroup = svg.append("g")
    .attr("class", "pointer")
    .attr("transform", "translate(" + centerX + "," + centerY + ")");

// draw a triangular pointer above the wheel
// tip at y = -(r + 15), base around y = -(r - 5)
var tipY = -(r + 15);
var baseY = -(r - 5);
var halfBase = 12;
pointerGroup.append("path")
    .attr("d", "M 0 " + tipY + " L " + (-halfBase) + " " + baseY + " L " + halfBase + " " + baseY + " Z")
    .attr("fill", "#e53935")
    .attr("stroke", "#b71c1c")
    .attr("stroke-width", 1);

// an optional small circle under the pointer for emphasis
pointerGroup.append("circle")
    .attr("cx", 0)
    .attr("cy", baseY + 8)
    .attr("r", 4)
    .attr("fill", "#b71c1c");

var container = svg.append("g")
    .attr("class", "chartholder")
    .attr("transform", "translate(" + centerX + "," + centerY + ")");

var vis = container.append("g");

var answerDiv = document.querySelector("#answer");
var showButton = document.querySelector(".show-answer-button");

var pie = d3.pie().sort(null).value(function (d) { return 1; });
var arc = d3.arc().outerRadius(r).innerRadius(0);

var arcs = vis.selectAll("g.slice")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "slice")
    .attr("data-idx", function(d) { return d.data.idx; });

// paths
arcs.append("path")
    .attr("d", arc)
    .attr("fill", function (d) { return color(d.data.idx); })
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1);

// labels using arc.centroid for placement and rotation for readability
arcs.append("text")
    .attr("transform", function (d) {
        var c = arc.centroid(d); // [x, y] at arc centroid
        var angle = (d.startAngle + d.endAngle) / 2;
        var degrees = angle * 180 / Math.PI;
        // rotate text so it is radially aligned; flip it if it's upside down for readability
        var rot = degrees - 90;
        if (degrees > 90 && degrees < 270) rot += 180;
        return "translate(" + c[0] + "," + c[1] + ") rotate(" + rot + ")";
    })
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#000")
    .style("pointer-events", "none")
    .text(function (d) {
        return d.data.label;
    });

// center button (kept inside container so it rotates only if we change that behavior)
container.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 60)
    .attr("fill", "white")
    .style("cursor", "pointer");

container.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("SPIN")
    .style("font-weight", "bold")
    .style("font-size", "30px")
    .style("pointer-events", "none"); // so clicks go to container

container.on("click", spin);

function rotTween() {
    var i = d3.interpolateNumber(oldrotation % 360, rotation);
    return function (t) {
        return "rotate(" + i(t) + ")";
    };
}

function spin() {
    // temporarily disable clicking
    container.on("click", null);

    // Choose the next pick from the custom sequence
    var seqPos = pickedIndex % sequence.length;
    var picked = sequence[seqPos];
    pickedIndex = (pickedIndex + 1) % sequence.length;

    var ps = 360 / data.length;
    // targetAngle: center of the picked slice in degrees
    var targetAngle = picked * ps + ps / 2;
    // Spin multiple full rotations then land so that the picked slice is at the top (0 degrees)
    rotation += 360 * 5 + (360 - targetAngle);

    // Animate rotation of the slice group
    vis.transition()
        .duration(3000)
        .attrTween("transform", rotTween)
        .on("end", function () {
            // reset fills
            vis.selectAll("path").attr("fill", function(d){ return color(d.data.idx); });

            // highlight the picked slice by idx
            vis.selectAll("g.slice").filter(function(d){
                return d.data.idx === picked;
            }).select("path").attr("fill", "#FFD700");

            // update question & answer text safely (if elements exist)
            var qEl = document.querySelector("#question h2");
            var aEl = document.querySelector("#answer h2");
            if (qEl) qEl.textContent = data[picked].question;
            if (aEl) {
                aEl.textContent = data[picked].answer;
                aEl.style.fontSize = "19px";
                aEl.style.fontWeight = "normal";
            }

            oldrotation = rotation;

            // hide answer area after spin (user can toggle via button)
            if (answerDiv) answerDiv.style.visibility = "hidden";

            // re-enable spin
            container.on("click", spin);
        });
}

var answerShow = false;
function showAnswer() {
    answerShow = !answerShow;
    if (!answerDiv || !showButton) return;
    if (answerShow) {
        answerDiv.style.visibility = "visible";
        showButton.textContent = "Hide Answer";
        showButton.style.background = "red";
    } else {
        answerDiv.style.visibility = "hidden";
        showButton.textContent = "Show Answer";
        showButton.style.background = "#4CAF50";
    }
}

// attach showAnswer to the button if present
if (showButton) {
    showButton.addEventListener("click", showAnswer);
}
