export const careerBegin: number = 2012

export enum TechnologyType {
	Software = 0,
	Language,
	Framework,
	Library,
}

export type Technology = {
	name:       string
	color:      string
	icon?:      boolean
	link:       string
	image?:     boolean
	type:       TechnologyType
	// careerSpan = begin Year, end Year or Null (stil using)
	careerSpan: Array<[number, number|null]>
}
export type TechnologyList = { [key: string]: Technology }

export const technologies: TechnologyList = {
	Svelte: {
		name: 'Svelte', color: '#FF3E00', icon: true,
		type: TechnologyType.Framework,
		link: 'https://svelte.dev',
		careerSpan: [
			[2018, null],
		],
	},
	TypeScript: {
		name: 'TypeScript', color: '#007ACC', icon: true,
		type: TechnologyType.Language,
		link: 'https://www.typescriptlang.org',
		careerSpan: [
			[2019, null],
		],
	},
	JavaScript: {
		name: 'JavaScript', color: '#F0DB4F', icon: true,
		type: TechnologyType.Language,
		link: 'https://www.javascript.com',
		careerSpan: [
			[2013, null],
		],
	},
	VueJS: {
		name: 'Vue.js', color: '#4DBA87', icon: true,
		type: TechnologyType.Framework,
		link: 'https://vuejs.org',
		careerSpan: [
			[2016, null],
		],
	},
	Golang: {
		name: 'Golang', color: '#01ADD8', icon: true,
		type: TechnologyType.Language,
		link: 'https://golang.org',
		careerSpan: [
			[2016, null],
		],
	},
	SVG: {
		name: 'SVG', color: '#FFB13B', icon: true,
		type: TechnologyType.Language,
		link: 'https://developer.mozilla.org/en-US/docs/Web/SVG',
		careerSpan: [
			[2018, null],
		],
	},
	Docker: {
		name: 'Docker', color: '#0091E2', icon: true,
		type: TechnologyType.Software,
		link: 'https://www.docker.com/company',
		careerSpan: [
			[2018, null],
		],
	},
	Nginx: {
		name: 'Nginx', color: '#009639', icon: true,
		type: TechnologyType.Software,
		link: 'https://nginx.org/en/',
		careerSpan: [
			[2018, null],
		],
	},
	Stylus: {
		name: 'Stylus', color: '#FF6347', icon: true,
		type: TechnologyType.Language,
		link: 'https://stylus-lang.com',
		careerSpan: [
			[2018, null],
		],
	},
	SASS_SCSS: {
		name: 'SASS / SCSS', color: '#cf659a', icon: true,
		type: TechnologyType.Language,
		link: 'https://sass-lang.com/',
		careerSpan: [
			[2019, null],
		],
	},
	LESS: {
		name: 'LESS', color: '#1d365d', image: true,
		type: TechnologyType.Language,
		link: 'https://lesscss.org/',
		careerSpan: [
			[2019, 2020],
		],
	},
	HTML: {
		name: 'HTML5', color: '#EC652B', icon: true,
		type: TechnologyType.Language,
		link: 'https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5',
		careerSpan: [
			[careerBegin, null],
		],
	},
	CSS: {
		name: 'CSS3', color: '#1F60AA', icon: true,
		type: TechnologyType.Language,
		link: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
		careerSpan: [
			[careerBegin, null],
		],
	},
	d3js: {
		name: 'D3.js', color: '#f89d42', icon: true,
		type: TechnologyType.Library,
		link: 'https://d3js.org/',
		careerSpan: [
			[2020, null],
		],
	},
	Liquid: {
		name: 'Liquid', color: '#000099', icon: true,
		type: TechnologyType.Language,
		link: 'https://shopify.github.io/liquid/',
		careerSpan: [
			[2019, null],
		],
	},
	Shopify: {
		name: 'Shopify', color: '#96bf46', icon: true,
		type: TechnologyType.Software,
		link: 'https://www.shopify.de/',
		careerSpan: [
			[2019, null],
		],
	},
	Figma: {
		name: 'Figma', color: '#0ACF83', icon: true,
		type: TechnologyType.Software,
		link: 'https://www.figma.com',
		careerSpan: [
			[2015, null],
		],
	},
	PowerDirector15: {
		name: 'Power Director 15', color: '#402E77', image: true,
		type: TechnologyType.Software,
		link: 'https://de.cyberlink.com/products/powerdirector-video-editing-software/overview_de_DE.html',
		careerSpan: [
			[2016, 2018],
		],
	},
	OBS: {
		name: 'Open Broadcaster Software', color: '#151515', icon: true,
		type: TechnologyType.Software,
		link: 'https://obsproject.com/',
		careerSpan: [
			[2016, null],
		],
	},
	GIMP: {
		name: 'GIMP', color: '#615A48', image: true,
		type: TechnologyType.Software,
		link: 'https://www.gimp.org',
		careerSpan: [
			[careerBegin, null],
		],
	},
}

type ProjectLink = {
	name: string
	url:  string
}

export type Project = {
	name:             string
	id:               string
	cover:            boolean
	darkTheme:        boolean
	projectUrl:       string|null
	codeUrl?:         string|null
	otherLinks?:      Array<ProjectLink>
	usedTechnologies: Array<String>
	about:            boolean
}

export const projects: Array<Project> = [
	{
		name: `DanielSharkov.com`,
		id: 'danielsharkov_com',
		cover: true,
		darkTheme: true,
		projectUrl: null,
		codeUrl: 'https://github.com/DanielSharkov/danielsharkov_com',
		usedTechnologies: [
			'Svelte', 'TypeScript', 'SVG', 'Stylus',
			'Docker', 'Nginx', 'Figma',
		],
		about: true,
	},
	{
		name: `Organisations Graph`,
		id: 'org_graph',
		cover: true,
		darkTheme: true,
		projectUrl: null,
		codeUrl: null,
		usedTechnologies: [
			'Svelte', 'SVG', 'TypeScript', 'Golang',
			'Stylus', 'Docker', 'Nginx', 'Figma',
		],
		about: true,
	},
	{
		name: `Timetabler`,
		id: 'timetabler',
		cover: true,
		darkTheme: true,
		projectUrl: 'COMING_SOON',//'https://danielsharkov.github.io/timetabler',
		codeUrl: null,
		usedTechnologies: [
			'Svelte', 'SVG', 'Golang', 'Stylus',
			'Docker', 'Nginx', 'Figma',
		],
		about: true,
	},
	{
		name: `CoWo Space`,
		id: 'cowo_space',
		cover: true,
		darkTheme: false,
		projectUrl: 'COMING_SOON',//'https://danielsharkov.github.io/cowo-space',
		codeUrl: 'https://github.com/DanielSharkov/cowo-space',
		usedTechnologies: [
			'Svelte', 'SVG', 'Stylus', 'Docker', 'Nginx', 'Figma',
		],
		about: true,
	},
	{
		name: `Svelte Chess`,
		id: 'svelte_chess',
		cover: true,
		darkTheme: false,
		projectUrl: 'https://danielsharkov.github.io/svelte-chess',
		codeUrl: 'https://github.com/DanielSharkov/svelte-chess',
		usedTechnologies: ['Svelte', 'Stylus', 'SVG', 'Figma'],
		about: true,
	},
	{
		name: `Pattern Visualizer`,
		id: 'pattern_visualizer',
		cover: true,
		darkTheme: true,
		projectUrl: 'https://danielsharkov.github.io/PatternVisualizer/',
		codeUrl: 'https://github.com/DanielSharkov/PatternVisualizer',
		usedTechnologies: ['Svelte'],
		about: true,
	},
	{
		name: `Svelte Router`,
		id: 'svelte_router',
		cover: false,
		darkTheme: false,
		projectUrl: 'https://www.npmjs.com/package/@danielsharkov/svelte-router',
		codeUrl: 'https://github.com/danielsharkov/svelte-router',
		usedTechnologies: ['Svelte', 'JavaScript'],
		about: true,
	},
	{
		name: `Dgraph-GraphQL-Go-Svelte`,
		id: 'dgraph_graphql_go_svelte',
		cover: false,
		darkTheme: false,
		projectUrl: null,
		codeUrl: 'https://github.com/DanielSharkov/dgraph_graphql_go_svelte',
		usedTechnologies: ['Svelte', 'Stylus', 'SVG'],
		about: true,
	},
	{
		name: `Infocenter`,
		id: 'infocenter',
		cover: true,
		darkTheme: true,
		projectUrl: null,//'https://danielsharkov.github.io/eod_infocenter',
		codeUrl: null,
		usedTechnologies: ['Svelte', 'Stylus', 'SVG'],
		about: true,
	},
	{
		name: `FitCat App`,
		id: 'fitcat_app',
		cover: true,
		darkTheme: true,
		projectUrl: 'COMING_SOON',//'https://danielsharkov.github.io/fitcat',
		codeUrl: 'https://github.com/DanielSharkov/fitcat-frontend',
		otherLinks: [
			{ name: 'Figma UX&UI Design', url: '' },
		],
		usedTechnologies: ['Svelte', 'Stylus', 'SVG', 'Nginx', 'Figma'],
		about: true,
	},
	{
		name: `Shopify Cyber-Theme`,
		id: 'shopify_cyber_theme',
		cover: true,
		darkTheme: true,
		projectUrl: 'https://cyber-theme.myshopify.com',
		codeUrl: null,
		// codeUrl: 'https://github.com/DanielSharkov/shopify-cyber_theme',
		otherLinks: [
			{ name: 'Figma UX&UI Design', url: 'https://www.figma.com/file/KqzYEiazPpaj1bfXC2FzZ7/Shop-skribble' },
		],
		usedTechnologies: [
			'JavaScript', 'Liquid', 'Shopify', 'Stylus', 'SVG', 'Figma',
			'SASS_SCSS',
		],
		about: true,
	},
	{
		name: `Vivobarefoot Redesign Proposal`,
		id: 'vivobarefoot_redesign_proposal',
		cover: true,
		darkTheme: false,
		projectUrl: 'https://danielsharkov.github.io/vivobarefoot_redesign_proposal',
		codeUrl: 'https://github.com/DanielSharkov/vivobarefoot_redesign_proposal',
		usedTechnologies: ['HTML', 'CSS', 'JavaScript'],
		about: true,
	},
	{
		name: `Gronkh.de Konzept`,
		id: 'gronkh_de_concept',
		cover: true,
		darkTheme: true,
		projectUrl: 'https://danielsharkov.github.io/gronkh_de_concept',
		codeUrl: 'https://github.com/DanielSharkov/gronkh_de_concept',
		otherLinks: [
			{ name: 'Gronkh', url: 'https://gronkh.de' },
		],
		usedTechnologies: ['VueJS', 'Stylus'],
		about: true,
	},
	{
		name: `Chrome Redesign Inspiration`,
		id: 'chrome_redesign_inspiration',
		cover: true,
		darkTheme: true,
		projectUrl: 'https://codepen.io/DanielSharkov/full/gvZgQN',
		codeUrl: 'https://codepen.io/DanielSharkov/pen/gvZgQN',
		usedTechnologies: ['VueJS', 'Stylus'],
		about: true,
	},
	{
		name: `Einsteiger Doku für Webentwickler`,
		id: 'dev_documentation',
		cover: true,
		darkTheme: true,
		projectUrl: null,
		usedTechnologies: [],
		about: true,
	},
	{
		name: `Logo Redesign Proposal`,
		id: 'logo_redesign_proposal',
		cover: true,
		darkTheme: true,
		projectUrl: null,
		usedTechnologies: ['Figma', 'SVG'],
		about: true,
	},
	{
		name: `"Lost Santos" Series Teaser`,
		id: 'lost_santos_teaser',
		cover: true,
		darkTheme: false,
		projectUrl: 'https://youtu.be/uWZoT4Nvd3I',
		usedTechnologies: ['PowerDirector15', 'GIMP', 'OBS'],
		about: true,
	},
	{
		name: `"BRT" Video`,
		id: 'black_russian_training_video',
		cover: true,
		darkTheme: false,
		projectUrl: 'https://www.youtube.com/watch?v=ix7fj1-SOps',
		usedTechnologies: ['PowerDirector15', 'GIMP', 'OBS'],
		about: true,
	},
]

export type T_projectByID = { [key: string]: number }
export const projectsIndexByID: T_projectByID = {}
for (const p in projects) projectsIndexByID[projects[p].id] = Number(p)

export function getProjectByID(id) {
	return projects[projectsIndexByID[id]]
}
