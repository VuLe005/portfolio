import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

let selectedIndex = -1;
let selectedLabel = null;

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: String(year) };
  });

  let colors = d3.scaleOrdinal(d3.schemeTableau10)
                 .domain(newData.map(d => d.label));

  // re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  // TODO: clear up paths and legends
  let newSVG = d3.select('#projects-pie-plot');
  newSVG.selectAll('path').remove();
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  // update paths and legends, refer to steps 1.4 and 2.2
  newArcs.forEach((arcPath, i) => {
    const label = newData[i].label;

    newSVG.append('path')
      .attr('d', arcPath)
      .attr('fill', colors(label))
      .attr('class', label === selectedLabel ? 'selected' : null)
      .on('click', () => {
        const deselect = selectedIndex === i;
        selectedIndex  = deselect ? -1 : i;
        selectedLabel  = deselect ? null : newData[i].label;

        newSVG.selectAll('path')
          .attr('class', (_, idx) =>
            newData[idx].label === selectedLabel ? 'selected' : null
          );

        legend.selectAll('li')
          .attr('class', (_, idx) =>
            newData[idx].label === selectedLabel ? 'selected' : null
          );

        const filtered = getFilteredProjects();
        renderProjects(filtered, projectsContainer, 'h2');
        renderPieChart(projects); 
      });
  });

  newData.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color:${colors(d.label)}`)
      .attr('class', d.label === selectedLabel ? 'selected' : null)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

renderPieChart(projects);

let query = '';
function setQuery(q) {
  query = q;
  return getFilteredProjects();
}

function getFilteredProjects() {
  return projects.filter((p) => {
    const passQuery = Object.values(p).join('\n').toLowerCase()
      .includes(String(query).toLowerCase());
    const passYear  = (selectedLabel == null) || (String(p.year) === selectedLabel);
    return passQuery && passYear;
  });
}

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  const filtered = setQuery(event.target.value);
  renderProjects(filtered, projectsContainer, 'h2')

});
