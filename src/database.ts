import {Locale} from './i18n'

export const careerBegin: number = 2012

export enum TechnologyType {
	Software = 'software',
	Language = 'language',
	Framework = 'framework',
	Library = 'library',
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
export type TechnologyList = {[key: string]: Technology}

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
	Go: {
		name: 'Go', color: '#01ADD8', icon: true,
		type: TechnologyType.Language,
		link: 'https://go.dev',
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
	SQL: {
		name: 'SQL', color: '#FFAB00', icon: true,
		type: TechnologyType.Language,
		link: 'https://en.wikipedia.org/wiki/SQL',
		careerSpan: [
			[2016, null],
		],
	},
	PostgreSQL: {
		name: 'PostgreSQL', color: '#336790', icon: true,
		type: TechnologyType.Software,
		link: 'https://www.postgresql.org/',
		careerSpan: [
			[2018, null],
		],
	},
	VSC: {
		name: 'VS Code', color: '#3B99D4', icon: true,
		type: TechnologyType.Software,
		link: 'https://code.visualstudio.com/',
		careerSpan: [
			[2016, null],
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
		name: 'Open Broadcaster Software', color: '#333333', icon: true,
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
	id:               string
	cover?:           boolean
	darkTheme?:       boolean
	projectUrl:       string|null
	codeUrl?:         string|null
	otherLinks?:      Array<ProjectLink>
	usedTechnologies: Array<string>
	about:            boolean
	gradient?:        Array<string>
	locale:           Array<Locale>
}

export const projects: Array<Project> = [
	{
		id: 'danielsharkov_com',
		cover: true,
		darkTheme: true,
		projectUrl: null,
		codeUrl: 'https://github.com/DanielSharkov/danielsharkov_com',
		usedTechnologies: [
			'Svelte', 'TypeScript', 'SVG', 'Stylus', 'Docker', 'Nginx',
			'Figma', 'VSC',
		],
		about: true,
		gradient: ['#fcb6b6', '#f6df88'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'timetabler',
		cover: true,
		darkTheme: true,
		projectUrl: 'COMING_SOON',//'https://danielsharkov.github.io/timetabler',
		codeUrl: null,
		usedTechnologies: [
			'Svelte', 'SVG', 'Go', 'Stylus', 'Docker', 'Nginx', 'Figma',
			'VSC', 'SQL', 'PostgreSQL',
		],
		about: true,
		gradient: ['#b5ffdd', '#65C7F7', '#0066ff'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'gronkh_de_concept',
		cover: true,
		darkTheme: true,
		projectUrl: 'https://danielsharkov.github.io/gronkh_de_concept',
		codeUrl: 'https://github.com/DanielSharkov/gronkh_de_concept',
		otherLinks: [
			{ name: 'Gronkh.tv', url: 'https://gronkh.tv' },
		],
		usedTechnologies: ['VueJS', 'Stylus', 'VSC'],
		about: true,
		gradient: ['#ff51ea', '#fe9840', '#42ffc2', '#b870fa', '#54ff32'],
		locale: [Locale.DE],
	},
	{
		id: 'cowo_space',
		cover: true,
		projectUrl: 'COMING_SOON',//'https://danielsharkov.github.io/cowo-space',
		codeUrl: 'https://github.com/DanielSharkov/cowo-space',
		usedTechnologies: [
			'Svelte', 'SVG', 'Stylus', 'Docker', 'Nginx', 'Figma', 'VSC',
		],
		about: true,
		gradient: ['#FAACA8', '#DDD6F3'],
		locale: [],
	},
	{
		id: 'org_graph',
		cover: true,
		darkTheme: true,
		projectUrl: null,
		codeUrl: null,
		usedTechnologies: [
			'Svelte', 'SVG', 'TypeScript', 'Go', 'Stylus', 'Docker',
			'Nginx', 'Figma', 'VSC', 'SQL', 'PostgreSQL',
		],
		about: true,
		gradient: ['#1488CC', '#2B32B2'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'svelte_chess',
		cover: true,
		projectUrl: 'https://danielsharkov.github.io/svelte-chess',
		codeUrl: 'https://github.com/DanielSharkov/svelte-chess',
		usedTechnologies: ['Svelte', 'Stylus', 'SVG', 'Figma', 'VSC'],
		about: true,
		gradient: ['#093028', '#344740'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'pattern_visualizer',
		cover: true,
		darkTheme: true,
		projectUrl: 'https://danielsharkov.github.io/PatternVisualizer/',
		codeUrl: 'https://github.com/DanielSharkov/PatternVisualizer',
		usedTechnologies: ['Svelte', 'VSC'],
		about: true,
		gradient: ['#f399d3', '#a7276e', '#2c9c88', '#713dc3', '#00bfff'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'svelte_router',
		cover: false,
		darkTheme: false,
		projectUrl: 'https://www.npmjs.com/package/@danielsharkov/svelte-router',
		codeUrl: 'https://github.com/danielsharkov/svelte-router',
		usedTechnologies: ['Svelte', 'JavaScript', 'VSC'],
		about: true,
		gradient: ['#ffc73e', '#ff6505'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'dgraph_graphql_go_svelte',
		projectUrl: null,
		codeUrl: 'https://github.com/DanielSharkov/dgraph_graphql_go_svelte',
		usedTechnologies: ['Svelte', 'Stylus', 'SVG', 'VSC'],
		about: true,
		gradient: ['#0062ff', '#cbf6ff'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'infocenter',
		cover: true,
		darkTheme: true,
		projectUrl: null,//'https://danielsharkov.github.io/eod_infocenter',
		codeUrl: null,
		usedTechnologies: ['Svelte', 'Stylus', 'SVG', 'VSC'],
		about: true,
		gradient: ['#a1c4fd', '#c2e9fb'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'fitcat_app',
		cover: true,
		darkTheme: true,
		projectUrl: 'COMING_SOON',//'https://danielsharkov.github.io/fitcat',
		codeUrl: 'https://github.com/DanielSharkov/fitcat-frontend',
		otherLinks: [
			{ name: 'other_link.figma', url: '' },
		],
		usedTechnologies: ['Svelte', 'Stylus', 'SVG', 'Nginx', 'Figma', 'VSC'],
		about: true,
		gradient: ['#ffffff', '#63d0ff', '#ffffff', '#ffdd7d', '#ffffff'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'shopify_cyber_theme',
		cover: true,
		darkTheme: true,
		projectUrl: 'https://cyber-theme.myshopify.com',
		codeUrl: null,
		// codeUrl: 'https://github.com/DanielSharkov/shopify-cyber_theme',
		otherLinks: [
			{ name: 'other_link.figma', url: 'https://www.figma.com/file/KqzYEiazPpaj1bfXC2FzZ7/Shop-skribble' },
		],
		usedTechnologies: [
			'JavaScript', 'Liquid', 'Shopify', 'Stylus', 'SVG', 'Figma',
			'SASS_SCSS', 'VSC',
		],
		about: true,
		gradient: ['#1F1C2C', '#928DAB'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'vivobarefoot_redesign_proposal',
		cover: true,
		projectUrl: 'https://danielsharkov.github.io/vivobarefoot_redesign_proposal',
		codeUrl: 'https://github.com/DanielSharkov/vivobarefoot_redesign_proposal',
		usedTechnologies: ['HTML', 'CSS', 'JavaScript', 'VSC'],
		about: true,
		gradient: ['#a02828', '#ff5b5b'],
		locale: [Locale.DE],
	},
	{
		id: 'chrome_redesign_inspiration',
		cover: true,
		darkTheme: true,
		projectUrl: 'https://codepen.io/DanielSharkov/full/gvZgQN',
		codeUrl: 'https://codepen.io/DanielSharkov/pen/gvZgQN',
		usedTechnologies: ['VueJS', 'Stylus', 'VSC'],
		about: true,
		gradient: ['#08AEEA', '#2AF598'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'dev_documentation',
		cover: true,
		darkTheme: true,
		projectUrl: null,
		usedTechnologies: [],
		about: true,
		gradient: ['#08AEEA', '#2AF598'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'logo_redesign_proposal',
		cover: true,
		darkTheme: true,
		projectUrl: null,
		usedTechnologies: ['Figma', 'SVG', 'VSC'],
		about: true,
		gradient: ['#FA8BFF', '#2BD2FF', '#2BFF88'],
		locale: [Locale.DE],
	},
	{
		id: 'lost_santos_teaser',
		cover: true,
		projectUrl: 'https://youtu.be/uWZoT4Nvd3I',
		usedTechnologies: ['PowerDirector15', 'GIMP', 'OBS'],
		about: true,
		gradient: ['#a7a5a4', '#695747'],
		locale: [Locale.DE, Locale.EN],
	},
	{
		id: 'black_russian_training_video',
		cover: true,
		projectUrl: 'https://www.youtube.com/watch?v=ix7fj1-SOps',
		usedTechnologies: ['PowerDirector15', 'GIMP', 'OBS'],
		about: true,
		locale: [Locale.DE, Locale.EN],
	},
]

export type T_projectByID = { [key: string]: number }
export const projectsIndexByID: T_projectByID = {}
for (const p in projects) projectsIndexByID[projects[p].id] = Number(p)

export function getProjectByID(id) {
	return projects[projectsIndexByID[id]]
}
