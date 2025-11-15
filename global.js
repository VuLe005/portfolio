console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// const navLinks = $$('nav a');

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );

// if (currentLink) {
//   currentLink.classList.add('current');
// }

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact'},
  { url: 'resume/', title:'Resume' },
  { url: 'meta/', title: 'Meta'},
  { url: "https://github.com/VuLe005", title: "GitHub" },
];

document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
		</select>
	</label>`,
);

let nav = document.createElement('nav');
document.body.prepend(nav);

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";         // GitHub Pages repo name

for (let p of pages) {
  let url = p.url;
  let title = p.title;

    if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);

    if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
    }

    if (a.host !== location.host) {
        a.target = '_blank';
    }

}

const select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
}


if ('colorScheme' in localStorage) {
  const saved = localStorage.colorScheme;
  setColorScheme(saved);
  select.value = saved;
}

select.addEventListener('input', function (event) {
  const value = event.target.value;
  setColorScheme(value);
  localStorage.colorScheme = value;
});

const form = document.querySelector('form');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);

  let url = form.action;
  const params = [];

  for (let [name, value] of data) {
    params.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  }

  if (params.length) {
    url += (url.includes('?') ? '&' : '?') + params.join('&');
  }

  location.href = url;
});



export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    console.log(response);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}


export function renderProjects(project, containerElement, headingLevel = 'h2') {
  if (!containerElement) return;

  const renderOne = p => {
    const title = p?.title ?? '';
    const image = p?.image ?? '';
    const description = p?.description ?? '';
    const year = p?.year ?? '';
    const url = p?.url ?? '';

    const linkHTML = url
      ? `<p class="project-link">
           <a href="${url}"${url.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>
             View project
           </a>
         </p>`
      : '';

    const article = document.createElement('article');
    article.innerHTML = `
      <${headingLevel}>${title}</${headingLevel}>
      ${image ? `<img src="${image}" alt="${title}">` : ''}
      <div class="project-body">
        <p>${description}</p>
        ${year ? `<small class="year">c. <span>${year}</span></small>` : ''}
        ${linkHTML}
      </div>
    `;
    containerElement.appendChild(article);
  };

  containerElement.innerHTML = '';
  if (Array.isArray(project)) project.forEach(renderOne);
  else if (project && typeof project === 'object') renderOne(project);
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${encodeURIComponent(username)}`);
}