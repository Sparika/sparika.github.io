
// ************** Generate the tree diagram	 *****************
var margin = {top: 60, right: 60, bottom: 60, left: 60},
	width = 800 - margin.right - margin.left,
	height = 800 - margin.top - margin.bottom;

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });

var i = 0;
	
var rOperator = 6,
	vMax = 2048,
	vPMax = 1,
	rBase = 20,
	depth = 90
    
// Reference to model
var root, model, trust
	
//Update if blue and set to red
var blue = 1

// VALUE TOOLTIP
var div = d3.select("#viz-div").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);
// DATA SETUP TOOLTIP
var divData = d3.select("#viz-div").append("div")
    .attr("class", "setData")
    .attr("id", "setEntropy-div")
    .style("opacity", 0)

divData.append("label")
    .style("display", "inline-block")
    .style("text-align", "right")
    .style("position", "relative")
    .style("bottom", "9px")
    .style("left", "5px")
    .style("width", "50px")
    .append("span")
    .attr("id", "setEntropy-value")
    .text("...")
    .attr("for", "setEntropy")
    
divData.append("input")
    .attr("type", "range")
    .attr("min", "0")
    .attr("max", "4096")
    .attr("id", "setEntropy")
    .attr("value", "0")
    .style("width", "80px")
    .style("text-align", "right")
    
        
d3.select("body:not(#setEntropy-div)")
	.on("click",function(d){
   	divData.transition()        
       	.duration(500)      
       	.style("opacity", 0)
  })


d3.select("#setEntropy").on("input", function() {
  //vMax = 1
  d3.select("#setEntropy-value").text(this.value+" bits");
  d3.select("#setEntropy").property("value", this.value);
  // Update values
  blue = blue==0? 1:0
  updateTrust(root,this.nodename,parseInt(this.value))
  update(root)
});
 

// SVG and TREE and SIZE
var svgFixed = d3.select("#viz-div").append("svg"),
    tree = d3.layout.tree()
var svg = svgFixed.append("g")
      .style("z-index", 0)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function resize(newWidth, newHeight) {
  height = newHeight - margin.top - margin.bottom
  
  if (height > 0) {
  tree =tree.size([width, height]);
  svgFixed.style("width", "100%")// width + margin.right + margin.left)
      .style("height", height + margin.top + margin.bottom + "px")
  } else {
    // Else skip showing SVG
    svgFixed.style("height", "0px")
  }
  
}

function update(source) {
	
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);
	  
  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * depth; });
  // Declare the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // ENTER NODES
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")  
	  .attr("transform", function(d) {
	  	return "translate(" + d.x + "," + d.y + ")"; })  
  // ENTROPY CIRCLE
  // ENTER
  nodeEnter.append("circle")
	  .attr("id", "entropyCircle")
	  .style("fill", function(d){
		  if(d.children == undefined && d.aux_children == undefined) return "#32CD32"
		  else return "#4682B4"
	  })
	  .style("stroke", function(d){
		  if(d.children == undefined && d.aux_children == undefined) return "#32CD32"
		  else return "#4682B4"
	  })
	  .on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9)
            div.html(d.value + " bits")
            	.style("left", d.x + Math.sqrt((d.rNorm*d.rNorm)/2)+ 2* rOperator + margin.left + 2 +"px")     
            	.style("top", d.y + Math.sqrt((d.rNorm*d.rNorm)/2) + margin.top + 10 +"px") 
      })   
      .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
      })
	  .on("dblclick",function(d){
	      //LEAF ELSE DO NOTHING
		  if(d.children == undefined && d.aux_children == undefined){
		  	div.transition()        
          		.duration(500)      
          		.style("opacity", 0);
          	divData.transition()        
            	.duration(200)      
            	.style("opacity", .9)
          	divData.style("left", d.x + Math.sqrt((d.rNorm*d.rNorm)/2)+ 2* rOperator + margin.left + 2 +"px")     
            	.style("top", d.y + Math.sqrt((d.rNorm*d.rNorm)/2) + margin.top + 10 +"px")
			d3.select("#setEntropy")
				.property("value", d.value)
				.property("nodename", d.name)
			d3.select("#setEntropy-value")
				.text(d.value+" bits")
		}
	  })
  // UPDATE  
  node.selectAll("#entropyCircle")
	  .attr("r", function(d){
		  d.rNorm = (d.value/vMax) * rBase
		  if (d.rNorm > rBase) {
			console.log("Too big circle!")
			console.log(d)
			console.log(vMax)
		  }
		  return d.rNorm = (d.rNorm >= 5 ? d.rNorm : 5)
	  })
  // OPERATOR CIRCLE
  // ENTER  
  var trans = Math.sqrt((rOperator*rOperator)/6)
  nodeEnter.append("circle")
	  .attr("id", "op-symbol")
	  .filter(function(d){ return (d.op !== "null" && d.op !== undefined)})
	  .attr("r", rOperator)
	  .style("fill", "#FFFFFF")
	  .style("stroke", "#000000")
	  .style("stroke-width", "2px")
	  
  //AVERAGE		  
  nodeEnter.append("line")
	  .attr("id", "op-symbol")
	      .filter(function(d){ return d.op === "AVG" })
	      .attr("x1", -trans)
	      .attr("y1", trans)
	      .attr("x2", trans)
	      .attr("y2", -trans)
	  .style("fill", function(d){
		  if(d.children == undefined) return "#FFFFFF"
		  else return "#FFFFFF"
	  })
	  .style("stroke-width", "2px")
	  .style("stroke", function(d){
		  if(d.children == undefined) return "#000000"
		  else return "#000000"
	  })

  //MIN		  
  nodeEnter.append("line")
	  .attr("id", "op-symbol")
	      .filter(function(d){ return d.op === "MIN" })
	      .attr("x1", - rOperator/2)
	      .attr("y1", 0)
	      .attr("x2", + rOperator/2)
	      .attr("y2", 0)
	  .style("fill", function(d){
		  if(d.children == undefined) return "#FFFFFF"
		  else return "#FFFFFF"
	  })
	  .style("stroke-width", "2px")
	  .style("stroke", function(d){
		  if(d.children == undefined) return "#000000"
		  else return "#000000"
	  })
  //SUM 1/2		  
  nodeEnter.append("line")
	  .attr("id", "op-symbol")
	      .filter(function(d){ return d.op === "SUM" })
	      .attr("x1", - rOperator/2)
	      .attr("y1", 0)
	      .attr("x2", + rOperator/2)
	      .attr("y2", 0)
	  .style("fill", function(d){
		  if(d.children == undefined) return "#FFFFFF"
		  else return "#FFFFFF"
	  })
	  .style("stroke-width", "2px")
	  .style("stroke", function(d){
		  if(d.children == undefined) return "#000000"
		  else return "#000000"
	  })
  //SUM 2/2	  
  nodeEnter.append("line")
	  .attr("id", "op-symbol")
	      .filter(function(d){ return d.op === "SUM" })
	      .attr("x1", 0)
	      .attr("y1", - rOperator/2)
	      .attr("x2", 0)
	      .attr("y2", + rOperator/2)
	  .style("fill", function(d){
		  if(d.children == undefined) return "#FFFFFF"
		  else return "#FFFFFF"
	  })
	  .style("stroke-width", "2px")
	  .style("stroke", function(d){
		  if(d.children == undefined) return "#000000"
		  else return "#000000"
	  })
  // UPDATE
  node.selectAll("#op-symbol")
	  .attr("transform", translateOpNode);
	  
	  
// NODE TITLE
  nodeEnter.append("text")
	  .attr("id", "node-name")	  
	  .attr("x", 0)
	  .attr("text-anchor", "middle")
	  .text(function(d) { 
		  if(d.altname == undefined){
		  	return (d.name)
		  } else {
			  if(d.X == undefined){
			  	  return (d.altname)
			  } else {
				  return (d.altname+"("+d.X+","+d.Y+")")
			  }
		  }})
	  .style("fill-opacity", 1)
  // UPDATE
  node.selectAll("#node-name")
	  .attr("dy", function(d){ return - d.rNorm -5})	  
		  
  // Declare the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });
  // Enter the links.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", diagonal)
}

function updateTrust(node, name, update){
	//Leaf
	if(node.children == undefined && node.aux_children == undefined){
	  if(node.blue == blue){	
	  //Blue means Already updated
		console.log("red "+node.name)
		return node.value
	  }
	  node.isLeaf = true
	  if(update != undefined && node.name == name){
	  	node.value = update
	  } else if(node.value == undefined){
	  	node.value = 0
	  } //else do nothing
	//Node
	} else if(node.blue == blue){	
	//Blue means Already updated
		console.log("red "+node.name)
		return node.value
	} else {
		//Update children
		if(node.children != undefined) for(var i=0; i<node.children.length; i++){
			updateTrust(node.children[i], name, update)
		}
		if(node.aux_children != undefined) for(var i=0; i<node.aux_children.length; i++){
			updateTrust(node.aux_children[i], name, update)
		}
		
		//Compute trust weight from actors X and Y
		var trustW = 1
		if(node.X != undefined && node.Y != undefined){
			//Probability that both actors behave correctly
			var x = trust[node.X]
			var y = trust[node.Y]
			trustW = (x*y)
		}
		node.trustW = trustW
		
		//else red (not yet updated)
		//set to blue and update
		node.blue = blue
		switch(node.op){
		case "MIN":
			node.value = -1
			node.children.forEach(MIN, node)
			if(node.aux_children)
				node.aux_children.forEach(MIN, node)
		break;
		case "SUM":
			node.value = 0
			node.children.forEach(SUM, node)
			if(node.aux_children){
				node.aux_children.forEach(SUM, node)
			}
		break;
		case "AVG":
			node.value = 0
			node.children.forEach(SUM, node)
			var num = node.children.length
			if(node.aux_children){
				node.aux_children.forEach(SUM, node)
				num += node.aux_children.length
			}
			node.value = node.value/num
			break;
		default:
			DEFAULTOP(node)
		break;
		}
	}
	//if(node.value>vMax){ vMax = node.value
	//  console.log(node)
	//  console.log(vMax)
	//}
	return node.value
}

function SUM(child, index, array){
	//Ponderate with trust in actors if child is leaf
		console.log("SUM")
	if(child.isLeaf) this.value += applyTrust(child.value, this.trustW);
	else this.value += child.value
	this.nominal += child.value
}
function MIN(child, index, array){
	if(this.value == -1) {
		console.log("MIN")
		//Ponderate with trust in actors if child is leaf
		if(child.isLeaf) this.value = applyTrust(child.value, this.trustW);
		else this.value = child.value
		this.nominal = child.value
	} else if (this.value > child.value){
		//Ponderate with trust in actors if child is leaf
		console.log("MIN")
		if(child.isLeaf) this.value = applyTrust(child.value, this.trustW);
		else this.value = child.value
		this.nominal = child.value
	}
}

function DEFAULTOP(node){
	//test if only one child
	var child
	if(node.aux_children == undefined){
		if(node.children.length == 1){
			child = node.children[0]
		} else {
			alert("Error: no operator set for node "+node.name+"\n "+ node)
		}
	} else if(node.children == undefined && node.aux_children.length == 1){
			child = node.aux_children[0]
	} else if(node.aux_children.length + node.children.length == 1){
		alert("TODO: children and aux == 1")
	} else {
		alert("Error: no operator set for node "+node.name+"\n "+ node)
	}
		console.log("DEFAULT")
	//Ponderate with trust in actors if child is leaf
	if(child.isLeaf) node.value = applyTrust(child.value, node.trustW);
	else node.value = child.value
	node.nominal = child.value
}

function auxLink(){
	var couplingParent1 = tree.nodes(root).filter(function(d) {
            return d['name'] === 'DTLS-SRTPAB';
        })[0];
	var couplingChild1 = tree.nodes(root).filter(function(d) {
            return d['name'] === 'authAB';
        })[0];
	
	multiParents = [{
                    parent: couplingParent1,
                    child: couplingChild1
                }];
		
	multiParents.forEach(function(multiPair) {
            svg.append("path", "g")
            .attr("class", "additionalParentLink")
                .attr("d", function() {
                    var oTarget = {
                        x: multiPair.parent.x,
                        y: multiPair.parent.y
                    };
                    var oSource = {
                        x: multiPair.child.x,
                        y: multiPair.child.y
                    };
					//TRANSFORM 
					
					oSource.y -= oSource.x
					
                    /*if (multiPair.child.depth === multiPair.couplingParent1.depth) {
                        return "M" + oSource.y + " " + oSource.x + " L" + (oTarget.y + ((Math.abs((oTarget.x - oSource.x))) * 0.25)) + " " + oTarget.x + " " + oTarget.y + " " + oTarget.x;
                    }*/
                    return diagonal({
                        source: oSource,
                        target: oTarget
                    });
                });
        });	
}

function translateNode(d){
	return "translate("+ d.rNorm + "," + d.rNorm + ")"}
function translateOpNode(d){
	return "translate("+ (Math.sqrt((d.rNorm*d.rNorm)/2)) + "," + (Math.sqrt((d.rNorm*d.rNorm)/2)) + ")"}
function translateValue(d){
	return "translate("+ (Math.sqrt((d.rNorm*d.rNorm)/2) + rOperator*2) + "," + (Math.sqrt((d.rNorm*d.rNorm)/2)) + ")"}

function applyTrust(value, trustW){
  //Value is in power base 2
  //Trust is in base 10
  //Switch trust in base 2 and add it to value
  var v = value + Math.log2(trustW)
  return (v >= 0 ? v : 0)
}

function reloadTrustModel(jsonModel, newWidth, newHeight){
    resize(newWidth, newHeight)
    svg.selectAll("g > *").remove();
    model = jsonModel
    root = model.model
    trust = model.trust
    updateTrust(root, blue)
    update(root);
}

function clearModel() {
  d3.select("#viz-div").select("svg").remove()
}