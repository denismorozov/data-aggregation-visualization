import './main.css';
import Graph from './graph.js';

main();

function main() {
    var graph = new Graph();
    document.getElementById("runNoAggregation").onclick = () => {
        graph.runWithoutAggregation();
    };
    document.getElementById("runAggregation").onclick = () => {
        graph.runWithAggregation();
    };
    document.getElementById("reset").onclick = () => {
        graph.reset();
    };
}
