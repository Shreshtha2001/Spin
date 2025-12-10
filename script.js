let h1 = document.querySelector('.hQuestion');
let answerh = document.querySelector('.answerh2');
var padding = { top: 8, right: 40, bottom: 0, left: 90 },
    w = 560 - padding.left - padding.right,
    h = 560 - padding.top - padding.bottom,
    r = Math.min(w, h) / 2,
    rotation = 0,
    oldrotation = 0,
    pickedIndex = 0,
    color = d3.scale.category20b();

var answerShow = false;
var data = [
    { "label": "1", "value": 1, "question": "Once the Progress Check-In is complete, there is no need for further alignment until Q4.", "answer": "MYTH: Continuous feedback and check-ins are expected year-round, not just during formal check-ins." },
    { "label": "2", "value": 2, "question": "The Progress Check-In is primarily for underperformers and isn't relevant if everything is going smoothly. ", "answer": "MYTH: It's for everyone, not just those facing challenges.It ensures ongoing alignment and recognizes progress across the board." },
    { "label": "3", "value": 3, "question": "The Progress Check-In includes both a review of goal progress and observed behaviors.", "answer": "FACT: It's meant to assess both WHAT and HOW." },
    { "label": "4", "value": 4, "question": "If a goal becomes irrelevant during the year, it should be deleted and not considered in the final evaluation.", "answer": "MYTH: If work was completed, the goal should still be evaluated with adjusted weighting, even if it's no longer valid for the current role." },
    { "label": "5", "value": 5, "question": "Employees placed in the Improvement Zone during the Progress Check-In will automatically be placed there in the year-end evaluation as well.", "answer": "MYTH: The Q3 zone is an interim snapshot. Employees can improve and move to a different zone by year-end based on their progress, development, and support received." },
    { "label": "6", "value": 6, "question": "Once a performance zone is assigned, there's no flexibility to adjust it.", "answer": "MYTH: Managers have discretion to adjust performance zones in special cases based on consistent trends or unique contributions." },
    { "label": "7", "value": 7, "question": "The performance zone is based only on final results from Q4.", "answer": "MYTH: The performance zone reflects the entire year's performance. It considers input from all SAP Talks, goal progress, context, and feedback-not just Q4 outcomes." },
    { "label": "8", "value": 8, "question": "Performance management is a shared responsibility between employees and managers.", "answer": "FACT: Employees are expected to take ownership of their goals and development, while managers provide guidance and feedback throughout the year." },
    { "label": "9", "value": 9, "question": "Once a performance zone is assigned, there's no flexibility to adjust it.", "answer": "MYTH: Managers have discretion to adjust performance zones in special cases based on consistent trends or unique contributions." },
    { "label": "10", "value": 10, "question": "No documented feedbacks are required to initiate PIP ?", "answer": "MYTH: At least two documented feedbacks are necessary to initiate the PIP." }
];

// Define the custom sequence (index-based)
var sequence = [0, 2, 4, 3, 1, 8, 7, 5, 6, 9]; // corresponds to 1,3,5,4,2,9,8,6,7,10

var svg = d3.select('#chart')
    .append("svg")
    .data([data])
    .attr("width", w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);

var container = svg.append("g")
    .attr("class", "chartholder")
    .attr("transform", "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")");

var vis = container.append("g");

var answerDiv = document.querySelector("#answer");
var showButton = document.querySelector(".show-answer-button");

var pie = d3.layout.pie().sort(null).value(function (d) { return 1; });
var arc = d3.svg.arc().outerRadius(r);

var arcs = vis.selectAll("g.slice")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "slice");

arcs.append("path")
    .attr("fill", function (d, i) { return color(i); })
    .attr("d", arc);

arcs.append("text").attr("transform", function (d) {
    d.innerRadius = 0;
    d.outerRadius = r;
    d.angle = (d.startAngle + d.endAngle) / 2;
    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius - 10) + ")";
})
    .attr("text-anchor", "end")
    .text(function (d, i) {
        return data[i].label;
    });

container.on("click", spin);

function spin() {
    container.on("click", null);

    // Determine current pick based on sequence
    pickedIndex = pickedIndex % sequence.length;
    let picked = sequence[pickedIndex];
    pickedIndex++;

    var ps = 360 / data.length;
    rotation += 360 * 5 + (360 - picked * ps - ps / 2); // spin multiple rotations + align slice

    vis.transition()
        .duration(3000)
        .attrTween("transform", rotTween)
        .each("end", function () {
            d3.selectAll(".slice path").attr("fill", function (d, i) { return color(i); });
            d3.select(".slice:nth-child(" + (picked + 1) + ") path").attr("fill", "#FFD700");
            d3.select("#question h2").text(data[picked].question);
            d3.select("#answer h2").text(data[picked].answer)
                .style("font-size", "19px")
                .style("font-weight", "normal");

            oldrotation = rotation;
            answerDiv.style.visibility = "hidden";

            // Re-enable spin
            container.on("click", spin);
        });
}

container.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 60)
    .style({ "fill": "white", "cursor": "pointer" });

container.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("SPIN")
    .style({ "font-weight": "bold", "font-size": "30px" });

function rotTween() {
    var i = d3.interpolate(oldrotation % 360, rotation);
    return function (t) {
        return "rotate(" + i(t) + ")";
    };
}

function showAnswer() {
    answerShow = !answerShow;
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
