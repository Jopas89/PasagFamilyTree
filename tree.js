// ================= GLOBAL SETTINGS ===================

// Dimensions and spacing for tree nodes
const margin = { top: 20, right: 90, bottom: 30, left: 90 };
const rectWidth = 190;
const rectHeight = 60;
const horizontalSeparationBetweenNodes = 20;
const verticalSeparationBetweenNodes = 100;

// Tooltip selection
const tooltip = d3.select("#tooltip");

// SVG setup
const svg = d3.select("svg");

// FIXED — Never use svg.attr("width"), use real rendered size
function getSvgSize() {
  const box = svg.node().getBoundingClientRect();
  return { width: box.width, height: box.height };
}

// Main group for tree; initial position doesn’t matter because zoom handles positioning
const g = svg.append("g").attr("transform", `translate(0,0)`);

// D3 tree layout configuration
const tree = d3
  .tree()
  .nodeSize([rectWidth + horizontalSeparationBetweenNodes, verticalSeparationBetweenNodes])
  .separation(() => 1); // uniform spacing between siblings

let sourceHierarchyRoot = null;
let selectedNode = null;


// ===================== LOAD FAMILY TREE =====================
function loadNewNode(rootId) {
  const data = window.GlobalData.raw;

  const stratify = d3
    .stratify()
    .id(d => String(d.id))
    .parentId(d => String(d.parentId));

  const fullRoot = stratify(data);
  const dropdown = d3.select("#nodeSelect");

  // Populate dropdown
  const nodesSorted = fullRoot.descendants().sort((a, b) =>
    a.data.child.localeCompare(b.data.child)
  );

  dropdown
    .selectAll("option")
    .data(nodesSorted)
    .join("option")
    .attr("value", d => d.id)
    .text(d => d.data.child);

  dropdown.property("value", rootId);

  // Render initial subtree
  renderSubtree(rootId);

  dropdown.on("change", function () {
    renderSubtree(this.value);
  });

  displayMemberCount();

  // ===================== RENDER SUBTREE =====================
  function renderSubtree(nodeId) {
    g.selectAll("*").remove();

    const focusData = data.find(d => String(d.id) === String(nodeId));
    if (!focusData) return;

    const root = buildHierarchy(focusData);
    sourceHierarchyRoot = root;
    selectedNode = root;

    update(root);
    centerNode(root); // FIXED centering
  }

  // ===================== BUILD HIERARCHY =====================
  function buildHierarchy(nodeData) {
    const root = d3.hierarchy(nodeData, d =>
      data.filter(c => String(c.parentId) === String(d.id))
    );

    root.x0 = 0;
    root.y0 = 0;

    root.children?.forEach(collapse);
    expandSubtree(root, GLOBAL_DEPTH);
    return root;
  }

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  function expandSubtree(node, maxDepth, currentDepth = 0) {
    if (!node) return;
    if (currentDepth < maxDepth && node._children) {
      node.children = node._children;
      node._children = null;
    }
    node.children?.forEach(c =>
      expandSubtree(c, maxDepth, currentDepth + 1)
    );
  }

  // ===================== UPDATE TREE =====================
  function update(source) {

    // Remove unwanted nodes if any
    if (window.GlobalConfig?.unwantedNodes?.length) {
      window.GlobalConfig.unwantedNodes.forEach(name =>
        removeNodeByChildName(source, name)
      );
    }

    const nodes = tree(source);

    // ---------------- NODES ----------------
    const node = g.selectAll(".node")
      .data(nodes.descendants(), d => d.data.id);

    const nodeEnter = node.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", `translate(${source.x0},${source.y0})`)
      .on("click", (event, d) => {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else if (d._children) {
          d.children = d._children;
          d._children = null;
        }

        update(sourceHierarchyRoot);

        let focusNode = d;
        if (!d.children && !d._children && d.parent) focusNode = d.parent;

        selectedNode = focusNode;
        centerNode(focusNode); // FIXED centering
      });

    nodeEnter.append("rect")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("x", -rectWidth / 2)
      .attr("y", -rectHeight / 2)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", d => (d._children ? "#f39c12" : "#4a90e2"))
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5);

    nodeEnter.append("text")
      .attr("text-anchor", "middle")
      .each(function (d) {
        const text = d3.select(this);

        text.append("tspan")
          .text(d.data.child)
          .attr("font-weight", "bold")
          .attr("x", 0)
          .attr("dy", d.data.spouse ? -rectHeight / 5 : 0);

        if (d.data.spouse) {
          text.append("tspan").text("and").attr("x", 0).attr("dy", rectHeight / 4);
          text.append("tspan").text(d.data.spouse).attr("x", 0).attr("dy", rectHeight / 4);
        }
      });

    nodeEnter.merge(node)
      .transition()
      .duration(400)
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Highlight selected
    nodeEnter.select("rect")
      .transition()
      .duration(400)
      .attr("width", d => (d === selectedNode ? rectWidth * 1.2 : rectWidth))
      .attr("height", d => (d === selectedNode ? rectHeight * 1.2 : rectHeight))
      .attr("x", d => (d === selectedNode ? -rectWidth * 1.2 / 2 : -rectWidth / 2))
      .attr("y", d => (d === selectedNode ? -rectHeight * 1.2 / 2 : -rectHeight / 2));

    // ---------------- LINKS ----------------
    const link = g.selectAll(".link")
      .data(nodes.links(), d => d.target.data.id);

    link.enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("d", d =>
        diagonal({
          source: { x: source.x0, y: source.y0 },
          target: { x: source.x0, y: source.y0 }
        })
      )
      .merge(link)
      .transition()
      .duration(400)
      .attr("d", diagonal);

    node.exit().remove();
    link.exit().remove();

    // ---------------- TOOLTIP ----------------
    nodeEnter
      .on("mouseover", function (event, d) {
        d3.select(this).select("rect")
          .attr("stroke", "orange")
          .attr("stroke-width", 3);

        let html = `<strong>${d.data.child}</strong><br/>`;
        if (d.data.parent) html += `Parent: ${d.data.parent}<br/>`;
        if (d.data.spouse) html += `Spouse: ${d.data.spouse}<br/>`;
        if (d.data.place) html += `Location: ${d.data.place}<br/>`;
        if (d.data.born) html += `Born: ${d.data.born}<br/>`;
        if (d.data.died) html += `Died: ${d.data.died}<br/>`;
        if (d.data.authentication) html += `Authentication: ${d.data.authentication}<br/>`;
        if (d.data.dateSubmitted) html += `Date Joined: ${d.data.dateSubmitted}<br/>`;

        const navbarRect = document.getElementById("navbar").getBoundingClientRect();

        tooltip
          .style("display", "block")
          .html(html)
          .style("left", navbarRect.right - tooltip.node().offsetWidth - 10 + "px")
          .style("top", navbarRect.bottom - tooltip.node().offsetHeight + 100 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).select("rect")
          .attr("stroke", d => (d._children ? "#f39c12" : "#4a90e2"))
          .attr("stroke-width", 1.5);
        tooltip.style("display", "none");
      });

    nodes.descendants().forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }
}

// ================= REMOVE UNWANTED NODES =================
function removeNodeByChildName(node, removeName) {
  if (node.children) {
    node.children = node.children.filter(c => c.data.child !== removeName);
    node.children.forEach(c =>
      removeNodeByChildName(c, removeName)
    );
  }
  if (node._children) {
    node._children = node._children.filter(c => c.data.child !== removeName);
    node._children.forEach(c =>
      removeNodeByChildName(c, removeName)
    );
  }
}

// ================= ZOOM & PAN =================
const zoom = d3.zoom()
  .scaleExtent([0.2, 3])
  .on("zoom", event => g.attr("transform", event.transform));

svg.call(zoom);


// ================= CENTER NODE (COMPLETE FIX FOR iPHONE) =================
function centerNode(source) {
  const transform = d3.zoomTransform(svg.node());
  const scale = transform.k;

  // FIX — use real rendered size
  const { width, height } = getSvgSize();

  const x = -source.x * scale + width / 2;
  const y = -source.y * scale + height / 6;

  svg.transition()
    .duration(400)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(x, y).scale(scale)
    );
}


// ================= RESET VIEW BUTTON =================
function resetViewAndRoot() {
  loadNewNode("1");

  const { width } = getSvgSize();

  svg.transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, 80).scale(1)
    );
}


// ================= LINK CURVE FUNCTION =================
function diagonal(d) {
  return `
    M ${d.source.x},${d.source.y}
    C ${d.source.x},${(d.source.y + d.target.y) / 2}
      ${d.target.x},${(d.source.y + d.target.y) / 2}
      ${d.target.x},${d.target.y}
  `;
}
