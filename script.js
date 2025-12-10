let currentIndex = 0; // Track the current question index

container.on("click", spin);

function spin(d) {
    setTimeout(() => {
        h1.style.display = 'flex';
    }, 3000);

    container.on("click", null); // Disable click during spin

    // all slices have been seen, all done
    if (currentIndex >= data.length) {
        console.log("All questions shown");
        container.on("click", null);
        return;
    }

    var ps = 360 / data.length,
        rng = Math.floor(Math.random() * 1440) + 360;

    rotation = (Math.round(rng / ps) * ps);

    // Calculate picked based on currentIndex, not randomly
    picked = currentIndex;

    rotation += 90 - Math.round(ps / 2); // Rotate to align slice nicely

    vis.transition()
        .duration(3000)
        .attrTween("transform", rotTween)
        .each("end", function () {
            // Mark question as seen
            d3.select(".slice:nth-child(" + (picked + 1) + ") path")
                .attr("fill", "#FFD700");

            // Populate question
            d3.select("#question h2")
                .text(data[picked].question);

            d3.select("#answer h2")
                .text(data[picked].answer)
                .style("font-size", "19px")
                .style("font-weight", "normal");

            oldrotation = rotation;
            answerDiv.style.visibility = "hidden";

            console.log(data[picked].value);

            currentIndex++; // Move to next question
            container.on("click", spin); // Re-enable click
        });
}
