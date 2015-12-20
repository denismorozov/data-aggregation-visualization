import cytoscape from 'cytoscape';


export default class Graph {
    /**
     * Constructor for the Graph class. Initializes the graph's setting and renders the graph.
     */
    constructor() {
        // Grid information
        this.numberOfColumns = 11;
        this.numberOfRows = 9;
        this.numberOfNodes = this.numberOfColumns * this.numberOfRows;
        this.data = {
            nodes: this.createGridNodes(),
            edges: this.createGridEdges()
        };

        // An associative array to keep track of how many times each element was visited
        this.elementVisitedCounter = {};

        // Simulation configuration
        this.numberOfEvents = 15;

        // Draw the Cytoscape graph
        this.cy = cytoscape({
            // container to render the graph on
            container: document.getElementById('graph'),
            // styling for the graph
            style: cytoscape.stylesheet()
                .selector('node').css({
                    // nice for debugging the layout:
                    //'content': 'data(id)'
                })
                .selector('edge').css({
                    'width': 4,
                    'line-color': '#ddd',
                })
                .selector('.sink').css({
                    'label': 'Sink',
                    'color': 'black;',
                    'background-color': '#000',
                })
                .selector('.aggregator').css({
                    'label': 'Aggregator',
                    'background-color': '#900',
                })
                .selector('.visited1').css({
                    'background-color': '#b2b2ff',
                    'line-color': '#b2b2ff',
                    'transition-property': 'background-color, line-color',
                    'transition-duration': '0.5s',
                })
                .selector('.visited2').css({
                    'background-color': '#6666ff',
                    'line-color': '#6666ff',
                    'transition-property': 'background-color, line-color',
                    'transition-duration': '0.5s',
                })
                .selector('.visited3').css({
                    'background-color': '#3232ff',
                    'line-color': '#3232ff',
                    'transition-property': 'background-color, line-color',
                    'transition-duration': '0.5s',
                })
                .selector('.visited4').css({
                    'background-color': '#1919ff',
                    'line-color': '#1919ff',
                    'transition-property': 'background-color, line-color',
                    'transition-duration': '0.5s',
                })
                .selector('.visited5').css({
                    'background-color': '#0000ff',
                    'line-color': '#0000ff',
                    'transition-property': 'background-color, line-color',
                    'transition-duration': '0.5s',
                })
                .selector('.highlight').css({
                    'background-color': '#61bffc',
                    'line-color': '#61bffc',
                    'transition-property': 'background-color, line-color',
                    'transition-duration': '0.5s',
                })
                .selector('.highlight-red').css({
                    'background-color': 'crimson',
                    'line-color': 'crimson',
                    'transition-property': 'background-color, line-color',
                    'transition-duration': '0.5s',
                }),
            elements: this.data,
            zoomingEnabled: false,
            userPanningEnabled: false,
            boxSelectionEnabled: false,
            autoungrabify: true,
            layout: {
                name: 'grid',
                fit: true,
                padding: 10,
                rows: this.numberOfRows,
                columns: this.numberOfColumns,
            },
            ready: function() {
                //window.Graph.cy = this;
            }
        });
    }

    /**
     * Generate random sensor events and send them directly to sink.
     */
    runWithoutAggregation() {
        for( var i = 0; i < this.numberOfEvents; i++ ) {
            let random = Math.floor(Math.random() * 100 + 1);
            this.drawPath('#' + random.toString(), '#' + this.sinkNode.toString());
        }
    };

    /**
     * Generates random sensor events and send them to the closest aggregator.
     */
    runWithAggregation() {
        // make aggregators
        // todo: an actual algorithm for selecting the aggregators would be cool
        this.cy.$('#25').addClass('aggregator');
        this.cy.$('#31').addClass('aggregator');
        this.cy.$('#69').addClass('aggregator');
        this.cy.$('#75').addClass('aggregator');
        const destinations = this.cy.$('.aggregator, .sink');

        // initialize destination visit counters
        let destinationVisits = {};
        for(let i = 0; i < destinations.length; i++) {
            destinationVisits[destinations[i].id] = 0;
        }

        // generate new random sensor events
        for(let i = 0; i < this.numberOfEvents; i++) {
            let randomNumber = Math.floor((Math.random() * 100) + 1);
            let dijkstra = this.cy.elements().dijkstra('#' + randomNumber.toString(), function() {
                return this.data('weight');
            });

            // find closest destination
            // todo: turn this into a reduce after I get get this back to a working state
            let closest = destinations[0];
            for(var j = 1; j < destinations.length; j++) {
                if (dijkstra.distanceTo(closest) > dijkstra.distanceTo(destinations[j])) {
                    closest = destinations[j];
                }
            }
            destinationVisits[closest.id]++;

            // send messages to the aggregators
            this.drawPath('#' + randomNumber.toString(), '#' + closest.id(), 'highlight', () => {
                // send aggregated information to the sink node
                for(var k = 0; k < destinations.length; k++) {
                    if(!destinations[k].hasClass('sink') && destinationVisits[destinations[k].id] !== 0) {
                        this.drawPath('#' + destinations[k].id(), '#' + this.sinkNode.toString(), 'highlight-red');
                    }
                }
            });
        }
    }

    /**
     * Function stub for a graph reset. The colors of the nodes and edges just have to be reset. Currently the
     * button that would trigger this function just refreshes the page.
     *
     * todo: implement this instead of just refreshing the page, not a priority at all
     */
    reset() {
    }

    /**
     * Draw a path from one node to another.
     * @param {string} from - Starting node.
     * @param {string} to - Destination node.
     * @param {string} [style] - Name of styling class that is to be added. Styling class must be predefined.
     * @param {function} [callback] - Optional callback function.
     */
    drawPath(from, to, style, callback) {
        // run dijkstra's from the starting node
        var dijkstra = this.cy.elements().dijkstra(from, function(){ return this.data('weight'); }, false );
        // get path, including both edges and nodes
        var path = dijkstra.pathTo( this.cy.$(to) );
        var i = 0;
        var highlightNextElement = () => {
            let element = path[i];
            // update visited counter for the current element
            if( this.elementVisitedCounter[element.id] ) {
                this.elementVisitedCounter[element.id]++;
            }
            else{
                this.elementVisitedCounter[element.id] = 1;
            }

            // highlight element if its not an aggregator or sink
            if(!element.hasClass('aggregator') && !element.hasClass('sink')) {
                let newStyle = (() => {
                    // if a styling class was provided, use it
                    if(style) {
                        return style;
                    }
                    // otherwise set color depending on how many times it was visited
                    // just chooses a different predefined styling class
                    let timesVisited = this.elementVisitedCounter[element.id];
                    console.log(timesVisited);
                    if(timesVisited < 5) {
                        return 'visited' + timesVisited;
                    }
                    // everything with more than 5 visits looks the same
                    else {
                        return 'visited5';
                    }
                })();
                element.addClass(newStyle);
            }
            // recur until the end of the path
            if(i < path.length - 2) {
                i++;
                setTimeout(highlightNextElement, 750);
            }
            // callback after end of the path
            else if( callback && typeof(callback) === "function" ) {
                setTimeout(callback, 3000);
            }
        };

        // start drawing
        highlightNextElement();
    }

    /**
     *  Create a grid of nodes and make the center one the sink.
     */
    createGridNodes() {
        var nodes = [];
        for(var i = 1; i <= this.numberOfNodes; i++) {
            nodes.push({
                data:
                {
                    id: i.toString(),
                    //parent: '',
                }
            });
        }

        // set the sink node which would be in the middle of the grid by default
        this.sinkNode = Math.floor(this.numberOfNodes/2);
        nodes[this.sinkNode] =
        {
            data:
            {
                // this increment is needed to have the proper id
                id: (++this.sinkNode).toString(),
            },
            classes: 'sink'
        };
        return nodes;
    }

    /**
     * Connect adjacent nodes in the grid.
     * Represents sensors that are within range of each other.
     */
    createGridEdges() {
        // construct an edge from starting and destination indices
        function createEdge(from, to) {
            let fromID = from.toString();
            let toID = to.toString();
            return {
                data: {
                    source: fromID,
                    target: toID,
                    weight: 5,
                }
            };
        }

        // create the set of edges
        var edges = [];
        for(var i = 1; i < this.numberOfNodes; i++) {
            // if current node is not at the end of the row, connect it to the next node (right of current node).
            if( i % this.numberOfColumns != 0 ) {
                edges.push( createEdge(i, i+1) );
            }

            // add all the nodes underneath unless current node is in the last row
            if( i <= this.numberOfNodes - this.numberOfColumns) {
                // connect it to the node underneath
                edges.push( createEdge(i, i+this.numberOfColumns));

                // connect it to the node southeast of it
                if( i % this.numberOfColumns != 0 ) {
                    edges.push( createEdge(i, i + this.numberOfColumns + 1));
                }

                // connect it to the node southwest of it
                if( (i-1) % this.numberOfColumns != 0) {
                    edges.push( createEdge(i, i + this.numberOfColumns - 1));
                }
            }
        }
        return edges;
    }
}
