import cytoscape from 'cytoscape';

export default class Graph {
    constructor(){
        // Set node and edge data for the graph
        this.numberOfColumns = 11;
        this.numberOfRows = 9;
        this.numberOfNodes = this.numberOfColumns * this.numberOfRows;
        this.data = {
            nodes: this.createNodes(),
            edges: this.createEdges(),
        };

        // Draws the Cytoscape graph
        this.cy = cytoscape({
            container: document.getElementById('graph'),
            // styling for the graph
            style: cytoscape.stylesheet()
                .selector('node').css({
                    // nice for debugging the layout
                    //'content': 'data(id)'
                })
                .selector('.sink').css({
                    'label': 'Sink',
                    'color': 'black;',
                    'background-color': '#000',
                })
                .selector('.aggregator').css({
                    'background-color': '#900',
                })
                .selector('edge').css({
                    'width': 4,
                    'line-color': '#ddd',
                })
                .selector('.highlighted').css({
                    'background-color': '#61bffc',
                    'line-color': '#61bffc',
                    'transition-property': 'background-color, line-color',
                    'transition-duration': '0.5s',
                }),
            elements: this.data,
            zoomingEnabled: false,
            layout: {
                name: 'grid',
                fit: true,
                padding: 10,
                rows: this.numberOfRows,
                columns: this.numberOfColumns,
            },
            ready: function(){
                //window.Graph.cy = this;
            }
        });
    }

    /* Generate 15 random messages being sent directly to the sink */
    runWithoutAggregation(){
        for( var i = 0; i < 15; i++ ){
            let random = Math.floor((Math.random() * 100) + 1);
            this.drawPath( '#' + random.toString(), '#' + this.sinkNode.toString());
        }
    };

    /* Generates 15 random messages and sends them to closest aggregators */
    runWithAggregation(){
        // select aggregators, hardcoded for now
        this.cy.$('#25').addClass('aggregator');
        this.cy.$('#31').addClass('aggregator');
        this.cy.$('#69').addClass('aggregator');
        this.cy.$('#75').addClass('aggregator');
        const aggs = this.cy.$('.aggregator, .sink');

        // generate new messages
        for( var i = 0; i < 30; i++ ){
            let random = Math.floor((Math.random() * 100) + 1);
            let dijkstra = this.cy.elements().dijkstra('#' + random.toString(), function(){
                return this.data('weight');
            });

            let closest = aggs[0];
            for( var j = 1; j < aggs.length; j++){
                if( dijkstra.distanceTo(closest) > dijkstra.distanceTo( aggs[j] )){
                    closest = aggs[j];
                }
            }
            this.drawPath( '#' + random.toString(), '#' + closest.id());
        }
        setTimeout( this.drawPath('#' + this.cy.$('#25').id(), '#' + this.sinkNode.toString()), 10000);
    }

    /* Helper method to draw a path */
    drawPath(from, to){
        var dijkstra = this.cy.elements().dijkstra(from,function(){
            return this.data('weight');
        }, false );
        var path = dijkstra.pathTo( this.cy.$(to) );
        var x=0;
        // doesn't check for end
        var highlightNextEle = function(){
            var element = path[x];
            if(!element.hasClass('aggregator') && !element.hasClass('sink')){
                element.addClass('highlighted');
            }
            if(x < path.length - 2){
                x++;
                setTimeout(highlightNextEle, 1000);
            }
        };
        highlightNextEle();
    }

    /* Create a grid of nodes and makes the center one the sink
    */
    createNodes(){
        var nodes = [];
        for(var i = 1; i <= this.numberOfNodes; i++)
        {
            nodes.push(
                {
                    data:
                    {
                        id: i.toString(),
                        //parent: '',
                    }
                }
            );
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
            classes: 'sink',
        };
        return nodes;
    }

    /* Connects adjacent nodes together in the grid */
    createEdges(){
        function createEdge(from, to){
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

        var edges = [];
        for(var i = 1; i < this.numberOfNodes; i++)
        {
            // if its not the end of the row connect the next one
            if( i % this.numberOfColumns != 0 ) {
                edges.push( createEdge(i, i+1) );
            }

            // add all the nodes underneath unless index is on the last row
            if( i <= this.numberOfNodes - this.numberOfColumns) {
                edges.push( createEdge(i, i+this.numberOfColumns));
                if( i % this.numberOfColumns != 0 ){
                    edges.push( createEdge(i, i + this.numberOfColumns + 1));
                }
                if( (i-1) % this.numberOfColumns != 0){
                    edges.push( createEdge(i, i + this.numberOfColumns - 1));
                }
            }
        }
        return edges;
    }
}
