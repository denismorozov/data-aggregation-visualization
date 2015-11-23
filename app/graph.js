import cytoscape from 'cytoscape';

export default class Graph {
    constructor(){
        // Set node and edge data for the graph
        this.data = {
            nodes: [
                { data: { id: 'a' } },
                { data: { id: 'b' } },
                { data: { id: 'c' } },
                { data: { id: 'd' } },
                { data: { id: 'e' } },
                { data: { id: 'f' } },
                { data: { id: 'g' } },
                { data: { id: 'h' } },
                { data: { id: 'i' } }
            ],

            edges: [
                { data: { id: 'ab', weight: 1, source: 'a', target: 'b' } },
                { data: { id: 'ac', weight: 2, source: 'a', target: 'c' } },
                { data: { id: 'bd', weight: 3, source: 'b', target: 'd' } },
                { data: { id: 'be', weight: 4, source: 'b', target: 'e' } },
                { data: { id: 'cf', weight: 5, source: 'c', target: 'f' } },
                { data: { id: 'cg', weight: 6, source: 'c', target: 'g' } },
                { data: { id: 'ah', weight: 7, source: 'a', target: 'h' } },
                { data: { id: 'hi', weight: 8, source: 'h', target: 'i' } }
            ]
        };

        // Draws the Cytoscape graph
        this.cy = cytoscape({
            container: document.getElementById('graph'),
            style: cytoscape.stylesheet()
                .selector('node').css({
                    'content': 'data(id)'
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
                name: 'breadthfirst',
                directed: true,
                roots: '#a',
                padding: 15
            },
            ready: function(){
                //window.Graph.cy = this;
            }
        });
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
