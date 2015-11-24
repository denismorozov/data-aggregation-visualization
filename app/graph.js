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
                    'content': 'data(id)'
                })
                .selector('.sink').css({
                    'content': 'Sink',
                    'background-color': '#000'
                })
                .selector('.aggregator').css({
                    'background-color': '#900'
                })
                .selector('edge').css({
                    'width': 4,
                    'line-color': '#ddd',
                    'target-arrow-color': '#ddd'
                })
                .selector('.highlighted').css({
                    'background-color': '#61bffc',
                    'line-color': '#61bffc',
                    'target-arrow-color': '#61bffc',
                    'transition-property': 'background-color, line-color, target-arrow-color',
                    'transition-duration': '0.5s'
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

        // add edge for every nearby node


    }

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
        var sinkNode = Math.floor(this.numberOfNodes/2);
        nodes[sinkNode] =
        {
            data:
            {
                id: (++sinkNode).toString(),
            },
            classes: 'sink',
        };
        return nodes;
    }

    /* Connecting */
    createEdges(){
        var edges = [];
        for(var i = 1; i < this.numberOfNodes; i++)
        {
            let current = i.toString();

            // if its not the end of the row
            if( i % this.numberOfColumns != 0 ) {
                let right = (i + 1).toString();
                edges.push(
                    {
                        data: {
                            // I guess nodes and edges share the same IDs? Prefixing with 0 is needed for the first 10 IDs
                            id: (i < 10 ? '0'+current : current) + (i < 10 ? '0'+right : right),
                            source: current,
                            target: right,
                            weight: 5,
                        }
                    }
                );
            }

            // add the nodes underneath unless index is on the last row
            if( i <= this.numberOfNodes - this.numberOfColumns) {
                let bottom = (i+this.numberOfColumns).toString();
                edges.push(
                    {
                        data: {
                            id: (i < 10 ? '0'+current : current) + bottom,
                            source: current,
                            target: bottom,
                            weight: 5,
                        }
                    }
                );
            }
        }
        return edges;
    }


    drawPath(from, to){
        var dijkstra = this.cy.elements().dijkstra(from,function(){
            return this.data('weight');
        },false);
        var path = dijkstra.pathTo( this.cy.$(to) );
        var x=0;
        // doesn't check for end
        var highlightNextEle = function(){
            var element = path[x];
            element.addClass('highlighted');
            if(x < path.length - 1){
                x++;
                setTimeout(highlightNextEle, 500);
            }
        };
        highlightNextEle();
    }
}
