/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var GraphTS = {
  sort:function(nodes,useParent,rootId){
    var MAX_VERTS       = nodes.length+1;
    var vertexList      = []; // list of vertices
    var matrix          = []; //adjacency matrix
    var numVerts        = 0; // current number of vertices
    var sortedArray     = [];
    
    for (var i = 0; i < MAX_VERTS; i++){
        for (var k = 0; k < MAX_VERTS; k++){
            matrix[i] = [];
            matrix[i][k] = 0;
        }   
    }

        
    function addVertex(v) {
        vertexList.push(v);
        numVerts++;
    }

    function addEdge(start, end) {
        matrix[start][end] = 1;
    }

    function displayVertex(v) {
        //System.out.print(vertexList[v].label);
    }

    function topo() // toplogical sort
    {
        var orig_nVerts = numVerts; 

        while (numVerts > 0) // while vertices remain,
        {
            // get a vertex with no successors, or -1
            var currentVertex = noSuccessors();
            if (currentVertex == -1) // must be a cycle
            {
                //System.out.println("ERROR: Graph has cycles");
                return;
            }
            // insert vertex label in sorted array (start at end)
            sortedArray[numVerts - 1] = vertexList[currentVertex];//.label;

            deleteVertex(currentVertex); // delete vertex
        }

        // vertices all gone; display sortedArray
        //System.out.print("Topologically sorted order: ");
        //for (var j = 0; j < orig_nVerts; j++)
        //System.out.print(sortedArray[j]);
        //System.out.println("");
    }

    function noSuccessors() // returns vert with no successors (or -1 if no such verts)
    { 
        var isEdge; // edge from row to column in adjMat

        for (var row = 0; row < numVerts; row++) {
            isEdge = false; // check edges
            for (var col = 0; col < numVerts; col++) {
                if (matrix[row][col] > 0) // if edge to another,
                {
                    isEdge = true;
                    break; // this vertex has a successor try another
                }
            }
            if (!isEdge) // if no edges, has no successors
                return row;
        }
        return -1; // no
    }

    function deleteVertex(delVert) {
        if (delVert != numVerts - 1) // if not last vertex, delete from vertexList
        {
            for (var j = delVert; j < numVerts - 1; j++)
                vertexList[j] = vertexList[j + 1];

            for (var row = delVert; row < numVerts - 1; row++)
                moveRowUp(row, numVerts);

            for (var col = delVert; col < numVerts - 1; col++)
                moveColLeft(col, numVerts - 1);
        }
        numVerts--; // one less vertex
    }

    function moveRowUp(row, length) {
        for (var col = 0; col < length; col++)
            matrix[row][col] = matrix[row + 1][col];
    }

    function moveColLeft(col, length) {
        for (var row = 0; row < length; row++)
            matrix[row][col] = matrix[row][col + 1];
    }

    function getVertexIndex(id){
        for(var i=0;i<vertexList.length;i++)
            if(vertexList[i].id == id)
                return i;
        return -1;
    }

    addVertex({id:typeof rootId == "undefined"? 'root':rootId,children:[]});
    for(i=0;i<nodes.length;i++){
        addVertex(nodes[i]);
    }
        
    for(i=0;i<nodes.length;i++){        
        addEdge(getVertexIndex(nodes[i].id),(typeof useParent == "undefined" || useParent)?getVertexIndex(nodes[i].parent):getVertexIndex(nodes[i].pre_sibling));
    }    
    topo();    
    return sortedArray;
  },
  toTree:function(nodes){        
    var sortedNodes = GraphTS.sort(nodes,true).reverse();        
    var  root = sortedNodes.splice(0,1)[0];
    this.convertToTree(root, sortedNodes,0);
    return /*--this.buildStatementTree*/(root);
  },  
  convertToTree:function(curNode, nodes,startIndex){
        
        for(var i=startIndex;i<nodes.length;i++){
            var node = nodes[i];
            if(node.parent == curNode.id){
                curNode.children.push(node);
                node.parent = curNode;
                this.convertToTree(node,nodes,i+1);
            }          
        }
        var sortedNodes = GraphTS.sort(curNode.children,false).reverse();
        sortedNodes.splice(0,1);
        curNode.children = sortedNodes;
    }
};


