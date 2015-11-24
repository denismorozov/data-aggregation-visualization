import './main.css';
import 'array.prototype.findindex';
import Graph from './graph.js';

main();

function main() {
    const graph = new Graph();
    graph.runWithoutAggregation();
}
