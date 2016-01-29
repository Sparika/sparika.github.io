
// ************** Generate the tree diagram	 *****************
var margin = {top: 60, right: 60, bottom: 60, left: 60},
	width = 800 - margin.right - margin.left,
	height = 800 - margin.top - margin.bottom;
	
var i = 0;
var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });
	
	
var rOperator = 6,
	vMax = 2048,
	vPMax = 1,
	rBase = 10,
	depth = 90
    
var minEntropy = {
    'symmetric' : 100,
    'modulus' : 2048,
    'logarithmKey' : 200,
    'logarithmGrp' : 2048,
    'ec' : 200,
    'hash' : 200,
    'pwd' : 20
}
// Reference to model
var root, model, trust
	
//Update if blue and set to red
var blue = 1

// VALUE TOOLTIP
var div = d3.select("#viz-div").append("div")   
    .attr("class", "tooltip")    
    .attr("id", "tooltip-div")           
    .style("opacity", 0);
// DATA SETUP TOOLTIP
var divData = d3.select("#viz-div").append("div")
    .attr("class", "setData")
    .attr("id", "setEntropy-div")
    .style("opacity", 0)
// TRUST SETUP TOOLTIP
var divTrust = d3.select("#viz-div").append("div")
    .attr("class", "setTrust")
    .attr("id", "setTrust-div")
    .style("top", "25px")
    .style("left", "25px")         
    .style("opacity", 0);
    
    
var divText = divData.append("div")
var divInput = divData.append("div")

divText.append("label")
    .attr("id", "setEntropy-name")
    .style("display", "block")
    .style("text-align", "left")
    .style("position", "relative")
    .style("bottom", "0px")
    .style("left", "5px")
    .style("width", "130px")
    .text("...")
divText.append("label")
    .attr("id", "setEntropy-min")
    .style("display", "block")
    .style("text-align", "left")
    .style("position", "relative")
    .style("bottom", "-2px")
    .style("left", "5px")
    .style("width", "130px")
    .text("...")

divInput.append("label")
    .attr("id", "setEntropy-value")
    .style("display", "inline-block")
    .style("text-align", "left")
    .style("position", "relative")
    .style("bottom", "0px")
    .style("margin-bottom", "0px")
    .style("left", "5px")
    .style("width", "80px")
    .append("span")
    .text("...")
    .attr("for", "setEntropy")
    
divInput.append("input")
    .attr("id", "setEntropy")
    .style("display", "inline-block")
    .attr("type", "range")
    .attr("min", "0")
    .attr("max", "4096")
    .attr("value", "0")
    .style("width", "80px")
    .style("text-align", "right")
    .style("position", "relative")
    .style("bottom", "-5px")
    
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
  //Update weighted trust
  computeAllWeightedTrust(root)
  update(root)
});


/****************************************************************
 *                  TRUST SETTER
 ***************************************************************/
function initTrustPanel(){
    // CLEAR TRUST DIV
    divTrust.selectAll("*").remove()
    divTrust.append("label")
        .style("display", "inline-block")
        .style("text-align", "left")
        .style("position", "relative")
        .style("bottom", "0px")
        .style("left", "5px")
        .style("width", "100px")
        .text("Trust in actors:")
    var size = 1
    
    // ADD TRUST INPUT   
    for (var trustee in trust) {
        addTrustInput(trustee, trust[trustee])
        size ++
    }
    // SET SIZE
    divTrust.style("height", 25*size+"px")
    // SET POSITION
    divTrust.style("opacity", 1)
}

function addTrustInput(trustee, value) {
    var divTrustLine = divTrust.append("div")
    divTrustLine.append("label")
        .style("display", "inline-block")
        .style("text-align", "left")
        .style("position", "relative")
        .style("bottom", "0px")
        .style("margin-bottom", "0px")
        .style("left", "5px")
        .style("width", "25px")
        .text(trustee+": ")
    var trustValue = divTrustLine.append("label")
        .attr("id", "setTrust-value-"+trustee)
        .style("display", "inline-block")
        .style("text-align", "center")
        .style("position", "relative")
        .style("bottom", "0px")
        .style("margin-bottom", "0px")
        .style("left", "5px")
        .style("width", "25px")
        .append("span")
        .text(value)
        .attr("for", "setTrust-"+trustee)
    var trustInput = divTrustLine.append("input")
        .attr("id", trustee)
        .attr("type", "range")
        .attr("min", "0")
        .attr("max", "10")
        .attr("value", value*10)
        .style("display", "inline-block")
        .style("width", "80px")
        .style("text-align", "right")
        .style("position", "relative")
        .style("bottom", "-5px")
        
    trustInput.on("input", function() {
        trustValue.text(this.value/10);
        trust[this.id] = this.value/10
        
        // Update Trust Weight
        computeAllWeightedTrust(root)
        update(root)
    });
}







/****************************************************************
 *                  MODEL UPDATE
 ***************************************************************/

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
    // Hide trust toolip
    divTrust.style("opacity", 0)
  }
  
}

function update(source) {
	
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);
	  
  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * depth; });
  // Declare the nodesÉ
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
      .attr("r",function(d){
        if(d.op !== undefined)
          d.rNorm = rBase*2
        else
          d.rNorm = rBase
          
        return d.rNorm
      })
//	  .on("mouseover", function(d) {      
//            div.transition()        
//                .duration(200)      
//                .style("opacity", .9)
//            div.html(d.value + " bits")
//            	.style("left", d.x + Math.sqrt((d.rNorm*d.rNorm)/2)+ 2* rOperator + margin.left + 2 +"px")     
//            	.style("top", d.y + Math.sqrt((d.rNorm*d.rNorm)/2) + margin.top + 10 +"px") 
//      })   
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
            	.style("opacity", 1)
          	divData.style("left", d.x + Math.sqrt((d.rNorm*d.rNorm)/2)+ 2* rOperator + margin.left + 2 +"px")     
            	.style("top", d.y + Math.sqrt((d.rNorm*d.rNorm)/2) + margin.top + 10 +"px")
            
			d3.select("#setEntropy-name")
				.text("Category: "+d.type)
			d3.select("#setEntropy-min")
				.text("MinRec: "+minEntropy[d.type]+" bits")
			d3.select("#setEntropy")
				.property("value", d.bits)
				.property("max", minEntropy[d.type]*2 > d.bits ? minEntropy[d.type]*2 : d.bits)
				.property("nodename", d.name)
			d3.select("#setEntropy-value")
				.text(d.bits+" bits")
		}
	  })
  // UPDATE  
  node.selectAll("#entropyCircle")
	  .style("fill", function(d){
          return setNodeColor(d)
	  })
	  .style("stroke", function(d){
          return setNodeColor(d)
	  })
      
  // OPERATOR CIRCLE
  // ENTER  
  var trans = Math.sqrt((rOperator*rOperator)/6)
  nodeEnter.filter(function(d){ return (d.op !== "null" && d.op !== undefined)})
      .append("circle")
	  .attr("id", "op-symbol")
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
	  
	  
// COMPONENT NODE TITLE
  nodeEnter
    .filter(function(d){ return (d.op !== undefined)})
    // NAME LABEL
    .append("text")
	  .attr("id", "node-name")	  
	  .attr("x", 0)	
	  .attr("dy", 5)	 
	  .attr("text-anchor", "middle")	
	  .text(function(d) {
        var text = d.altname || d.name
        if(d.op !== undefined)
          return text
        if (d.X !== undefined) {
          text += '('+d.X+','+d.Y+')'
        }
        return text
      })
	  .style("fill-opacity", 1)
      
// REQUIREMENT NODE TITLE
  nodeEnter
    .filter(function(d){ return (d.op == undefined)})
    // NAME LABEL
    .append("text")
	  .attr("id", "node-name")	  
	  .attr("x", 15 )	
	  .attr("dy", 0 )	 
	  .attr("text-anchor", "left")	
	  .text(function(d) {
        var text = d.altname || d.name
        if(d.op !== undefined)
          return text
        if (d.X !== undefined) {
          text += '('+d.X+','+d.Y+')'
        }
        return text
      })
	  .style("fill-opacity", 1)
  nodeEnter
    .filter(function(d){ return (d.op == undefined)})
    // NAME LABEL
    .append("text")
	  .attr("id", "value-label")	  
	  .attr("x", 25 )	
	  .attr("dy", 15 )	 
	  .attr("text-anchor", "left")	
	  .text(function(d) {
        return "t= "+d.value
      })
	  .style("fill-opacity", 1)
  nodeEnter
    .filter(function(d){ return (d.op == undefined)})
    // NAME LABEL
    .append("text")
	  .attr("id", "wvalue-label")	  
	  .attr("x", 25 )	
	  .attr("dy", 30 )	 
	  .attr("text-anchor", "left")	
	  .text(function(d) {
        return "wt= "+ (d.w_value != undefined ? d.w_value : d.value)
      })
	  .style("fill-opacity", 1)
      
      
  // UPDATE
  node.selectAll("#value-label") 
	  .text(function(d) {
        return "t= "+d.value
      })
  node.selectAll("#wvalue-label") 
	  .text(function(d) {
        return "wt= "+ (d.w_value != undefined ? d.w_value : d.value)
      })
		  
  // Declare the linksÉ
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });
  // Enter the links.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", diagonal)
}

// RESTART EXPLORATION FROM EACH NODE IN TREE WITH TRUSTED WEIGHT
function computeAllWeightedTrust(node) {
    // Do nothing for leaf
    if (node.children == undefined && node.aux_children == undefined) return;
    // Explore children but not aux
    if (node.children) node.children.forEach(computeAllWeightedTrust)
    // Compute for this if it's a requirement
    if (!node.op) node.w_value = computeWeightedTrust(node, new Set())
}

function computeWeightedTrust(node, actorSet) {
    var nodeTrust = 0
    // IF NODE IS LEAF RETURN VALUE WITH WEIGHT
	if(node.children == undefined && node.aux_children == undefined){
        nodeTrust = node.value
        actorSet.forEach(function(actor, index, array){
            nodeTrust = nodeTrust * trust[actor]
        })
	} else {
        switch (node.op) {
            case "MIN":
                nodeTrust = MINTrust(node, actorSet)
            break;
            case "SUM":
            case "AVG":
                var num = 0
                if (node.children) {    
                    nodeTrust = SUMTrust(node, node.children, actorSet)
                    num += node.children.length
                } if(node.aux_children){
                    nodeTrust = SUMTrust(node, node.aux_children, actorSet)
                    num += node.children.length
                }
                if (node.op == "AVG") nodeTrust = nodeTrust/num
                if(nodeTrust > 1) nodeTrust = 1
            break;
            default:
                nodeTrust = defaultTrust(node, actorSet)
            break;
        }
    }
    return nodeTrust
}

function MINTrust(parent, actorSet) {
    var nodeTrust = 1
    if (parent.children) {    
        parent.children.forEach(function(child, index, array){
            var t = computeWeightedTrust(child, actorSet)
            if (t<nodeTrust) nodeTrust = t
        })
    } if(parent.aux_children){
        parent.aux_children.forEach(function(child, index, array){
            var t = computeWeightedTrust(child, actorSet)
            if (t<nodeTrust) nodeTrust = t
        })
	}
    return nodeTrust
}
function SUMTrust(parent, children, actorSet) {
    var nodeTrust = 0
    children.forEach(function(child, index, array){
            nodeTrust += computeWeightedTrust(child, actorSet)})
    return nodeTrust
}
function defaultTrust(parent, actorSet) {
	// TEST IF ONLY ONE CHILD
    var child
	if(parent.aux_children == undefined && parent.children.length == 1)
        child = parent.children[0]
	else if(parent.children == undefined && parent.aux_children.length == 1)
        child = parent.aux_children[0]
	else {
		alert("Error: no operator set for node "+parent.name+"\n "+ parent)
        return -1
	}
    // TEST IF OP=NULL (COMPONENT WITH ONE CHILD)
    if (parent.op == "null")  return computeWeightedTrust(child, actorSet)
    // CREATE NEW ACTOR SET WITH X AND Y ADDED
    var localActorSet = new Set(actorSet)
    if (parent.X != undefined)
        localActorSet.add(parent.X)
    if (parent.Y != undefined)
        localActorSet.add(parent.Y)
    // TODO Don't add actor if actor is passive
    // EXPLORE NEXT NODE
    return computeWeightedTrust(child, localActorSet)
}

function updateTrust(node, name, update){
    // ALREADY UPDATED (we don't really work with a tree)
    if (node.blue == blue) return ;
    // Else (red) count as updated
    node.blue = blue
	// UPDATE LEAF VALUE (PRIMITIVE)
	if(node.children == undefined && node.aux_children == undefined){
        if(node.name == name) normNodeValue(node, update)
        else if(update == undefined) normNodeValue(node)
	} else {
        // UPDATE REQUIREMENT VALUE
        // APPLY OPERATOR
		switch(node.op){
		case "MIN":
			node.value = 1
			node.children.forEach(MIN, {"parent": node, "update":update, "name":name})
			if(node.aux_children)
				node.aux_children.forEach(MIN, {"parent": node, "update":update, "name":name})
		break;
		case "SUM":
        case "AVG":
			node.value = 0
            var num = 0
            if (node.children) {    
                node.children.forEach(SUM, {"parent": node, "update":update, "name":name})
                num += node.children.length
            } if(node.aux_children){
				node.aux_children.forEach(SUM, {"parent": node, "update":update, "name":name})
				num += node.aux_children.length
			}
            //Normalization max at 1
            if (node.op == "AVG") node.value = node.value/num
            if(node.value > 1) node.value = 1
		break;
		default:
			DEFAULTOP(node, update, name)
		break;
		}
	}
}

function SUM(child, index, array){
	updateTrust(child, this.name, this.update)
	this.parent.value += child.value
}
function MIN(child, index, array){
	updateTrust(child, this.name, this.update)
	if (this.parent.value > child.value)
		this.parent.value = child.value
}
function DEFAULTOP(parent, update, name){
	// TEST IF ONLY ONE CHILD
	if(parent.aux_children == undefined && parent.children.length == 1){
        updateTrust(parent.children[0], name, update)
		parent.value = parent.children[0].value
	} else if(parent.children == undefined && parent.aux_children.length == 1){
        updateTrust(parent.aux_children[0], name, update)
		parent.value = parent.aux_children[0].value
	} else {
		alert("Error: no operator set for node "+parent.name+"\n "+ parent)
        parent.value = -1
	}
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

function normNodeValue(node, update) {
    node.bits = (update == undefined) ? node.value : update
    var min = minEntropy[node.type]
    node.value = (node.bits >= min) ? 1 : Math.pow(2,node.bits-min)
}

function setNodeColor(d) {
  if (d.children == undefined)
    return d3.rgb(50,50,50)
  else if(d.op !== undefined)
    return d3.rgb(175,175,175)
  else{
    var xr = d.w_value < 0.5 ? 1 : 2-d.w_value/0.5
    var xg = d.w_value < 0.5 ? (d.w_value-0.5)/0.5 : 1
    return d3.rgb(35+202*xr, 35+202*xg, 35)
  }
}

function reloadTrustModel(jsonModel, newWidth, newHeight){
    resize(newWidth, newHeight)
    svg.selectAll("g > *").remove();
    model = jsonModel
    root = model.model
    trust = model.trust
    updateTrust(root, blue)
    computeAllWeightedTrust(root)
    update(root);
    initTrustPanel();
}

function clearModel() {
  d3.select("#viz-div").select("svg").remove()
}