import {Language} from './i18n'

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
	link:       string
	hasIcon?:   boolean // svg symbol in #AppIcons by id "#Logo_{project_id}"
	hasImage?:  boolean // located in "/public/technologies/{project_id}.png"
	type:       TechnologyType
	// careerSpan = begin Year, end Year or Null (stil using)
	careerSpan: Array<[number, number|null]>
}
export interface TechnologyList {
	Svelte:          Technology,
	TypeScript:      Technology,
	JavaScript:      Technology,
	VueJS:           Technology,
	React:           Technology,
	Redux:           Technology,
	Go:              Technology,
	NodeJs:          Technology,
	GraphQL:         Technology,
	Deno:            Technology,
	SVG:             Technology,
	SASS_SCSS:       Technology,
	PostgreSQL:      Technology,
	SQL:             Technology,
	Docker:          Technology,
	Nginx:           Technology,
	VSC:             Technology,
	Figma:           Technology,
	Stylus:          Technology,
	HTML:            Technology,
	CSS:             Technology,
	d3js:            Technology,
	FFmpeg:          Technology,
	LESS:            Technology,
	Liquid:          Technology,
	Shopify:         Technology,
	PowerDirector15: Technology,
	OBS:             Technology,
	GIMP:            Technology,
}

export const technologies: TechnologyList = {
	Svelte: {
		name: 'Svelte',
		color: '#ff3e00',
		hasIcon: true,
		type: TechnologyType.Framework,
		link: 'https://svelte.dev',
		careerSpan: [
			[2018, null],
		],
	},
	TypeScript: {
		name: 'TypeScript',
		color: '#007acc',
		hasIcon: true,
		type: TechnologyType.Language,
		link: 'https://www.typescriptlang.org',
		careerSpan: [
			[2019, null],
		],
	},
	JavaScript: {
		name: 'JavaScript',
		color: '#f0db4f',
		hasIcon: true,
		type: TechnologyType.Language,
		link: 'https://www.javascript.com',
		careerSpan: [
			[2013, null],
		],
	},
	VueJS: {
		name: 'Vue.js',
		color: '#4dba87',
		hasIcon: true,
		type: TechnologyType.Framework,
		link: 'https://vuejs.org',
		careerSpan: [
			[2016, 2021],
		],
	},
	React: {
		name: 'React',
		color: '#61dafb',
		hasIcon: true,
		type: TechnologyType.Framework,
		link: 'https://reactjs.org/',
		careerSpan: [
			[2021, null],
		],
	},
	Redux: {
		name: 'Redux',
		color: '#764abc',
		hasIcon: true,
		type: TechnologyType.Library,
		link: 'https://redux.js.org/',
		careerSpan: [
			[2021, null],
		],
	},
	Go: {
		name: 'Go',
		color: '#01add8',
		hasIcon: true,
		type: TechnologyType.Language,
		link: 'https://go.dev',
		careerSpan: [
			[2016, null],
		],
	},
	NodeJs: {
		name: 'Node.js',
		color: '#44883e',
		hasIcon: true,
		type: TechnologyType.Framework,
		link: 'https://nodejs.org/',
		careerSpan: [
			[2015, null],
		],
	},
	GraphQL: {
		name: 'GraphQL',
		color: '#e535ab',
		hasIcon: true,
		type: TechnologyType.Framework,
		link: 'https://graphql.org/',
		careerSpan: [
			[2017, null],
		],
	},
	Deno: {
		name: 'Deno',
		color: '#333333',
		hasIcon: true,
		type: TechnologyType.Framework,
		link: 'https://deno.land/',
		careerSpan: [
			[2022, null],
		],
	},
	SVG: {
		name: 'SVG',
		color: '#ffb13b',
		hasIcon: true,
		type: TechnologyType.Language,
		link: 'https://developer.mozilla.org/en-US/docs/Web/SVG',
		careerSpan: [
			[2018, null],
		],
	},
	SASS_SCSS: {
		name: 'SASS / SCSS',
		color: '#cf659a',
		hasIcon: true,
		type: TechnologyType.Language,
		link: 'https://sass-lang.com/',
		careerSpan: [
			[2019, null],
		],
	},
	PostgreSQL: {
		name: 'PostgreSQL',
		color: '#336790',
		hasIcon: true,
		type: TechnologyType.Software,
		link: 'https://www.postgresql.org/',
		careerSpan: [
			[2018, null],
		],
	},
	SQL: {
		name: 'SQL',
		color: '#ffab00',
		hasIcon: true,
		type: TechnologyType.Language,
		link: 'https://en.wikipedia.org/wiki/SQL',
		careerSpan: [
			[2016, null],
		],
	},
	Docker: {
		name: 'Docker',
		color: '#0091e2',
		hasIcon: true,
		type: TechnologyType.Software,
		link: 'https://www.docker.com/company',
		careerSpan: [
			[2018, null],
		],
	},
	Nginx: {
		name: 'Nginx',
		color: '#009639',
		hasIcon: true,
		type: TechnologyType.Software,
		link: 'https://nginx.org/en/',
		careerSpan: [
			[2018, null],
		],
	},
	VSC: {
		name: 'VS Code',
		color: '#3b99d4',
		hasIcon: true,
		type: TechnologyType.Software,
		link: 'https://code.visualstudio.com/',
		careerSpan: [
			[2016, null],
		],
	},
	Figma: {
		name: 'Figma',
		color: '#0acf83',
		hasIcon: true,
		type: TechnologyType.Software,
		link: 'https://www.figma.com',
		careerSpan: [
			[2015, null],
		],
	},
	Stylus: {
		name: 'Stylus',
		color: '#ff6347',
		hasIcon: true,
		type: TechnologyType.Language,
		link: 'https://stylus-lang.com',
		careerSpan: [
			[2018, 2022],
		],
	},
	HTML: {
		name: 'HTML5',
		color: '#ec652b',
		hasIcon: true,
		type: TechnologyType.Language,
		link: 'https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5',
		careerSpan: [
			[careerBegin, null],
		],
	},
	CSS: {
		name: 'CSS3',
		color: '#1f60aa',
		hasIcon: true,
		type: TechnologyType.Language,
		link: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
		careerSpan: [
			[careerBegin, null],
		],
	},
	d3js: {
		name: 'D3.js',
		color: '#f89d42',
		hasIcon: true,
		type: TechnologyType.Library,
		link: 'https://d3js.org/',
		careerSpan: [
			[2020, null],
		],
	},
	FFmpeg: {
		name: 'FFmpeg',
		color: '#337522',
		hasIcon: true,
		type: TechnologyType.Library,
		link: 'https://ffmpeg.org/',
		careerSpan: [
			[2020, null],
		],
	},
	LESS: {
		name: 'LESS',
		color: '#1d365d',
		hasImage: true,
		type: TechnologyType.Language,
		link: 'https://lesscss.org/',
		careerSpan: [
			[2019, 2020],
		],
	},
	Liquid: {
		name: 'Liquid',
		color: '#000099',
		hasIcon: true,
		type: TechnologyType.Language,
		link: 'https://shopify.github.io/liquid/',
		careerSpan: [
			[2019, 2022],
		],
	},
	Shopify: {
		name: 'Shopify',
		color: '#96bf46',
		hasIcon: true,
		type: TechnologyType.Software,
		link: 'https://www.shopify.de/',
		careerSpan: [
			[2019, 2022],
		],
	},
	PowerDirector15: {
		name: 'Power Director 15',
		color: '#402e77',
		hasImage: true,
		type: TechnologyType.Software,
		link: 'https://de.cyberlink.com/products/powerdirector-video-editing-software/overview_de_DE.html',
		careerSpan: [
			[2016, 2018],
		],
	},
	OBS: {
		name: 'Open Broadcaster Software',
		color: '#333333',
		hasIcon: true,
		type: TechnologyType.Software,
		link: 'https://obsproject.com/',
		careerSpan: [
			[2016, null],
		],
	},
	GIMP: {
		name: 'GIMP',
		color: '#615a48',
		hasImage: true,
		type: TechnologyType.Software,
		link: 'https://www.gimp.org',
		careerSpan: [
			[careerBegin, null],
		],
	},
}

export type Project = {
	id:               string
	hasNoCover?:      boolean
	darkThemed?:      boolean
	projectUrl:       string|null
	codeUrl?:         string|null // null means closed source
	otherLinks?:      Array<{name: string, url: string}>
	usedTechnologies: Array<keyof typeof technologies>
	gradient?:        Array<string>
	lang:             Array<Language>
	articleWritten?:  Date
	prjImpl?:         Date
	prjUpdt?:         Date
}

export const projects: Array<Project> = [
	{
		id: 'danielsharkov_com',
		darkThemed: true,
		projectUrl: null,
		codeUrl: 'https://github.com/DanielSharkov/danielsharkov_com',
		usedTechnologies: [
			'Svelte', 'TypeScript', 'SVG', 'Stylus', 'SASS_SCSS', 'Docker', 'Nginx',
			'Figma', 'VSC', 'SASS_SCSS',
		],
		gradient: ['#fcb6b6', '#f6df88'],
		lang: [Language.DE, Language.EN],
		prjImpl: new Date('1 May 2021'),
	},
	{
		id: 'timetabler',
		darkThemed: true,
		projectUrl: 'COMING_SOON',//'https://danielsharkov.github.io/timetabler',
		codeUrl: null,
		usedTechnologies: [
			'Svelte', 'SVG', 'Go', 'Stylus', 'SASS_SCSS', 'Docker', 'Nginx', 'Figma',
			'VSC', 'SQL', 'PostgreSQL', 'GraphQL', 'SASS_SCSS',
		],
		gradient: ['#b5ffdd', '#65C7F7', '#0066ff'],
		lang: [Language.DE, Language.EN],
		prjImpl: new Date('1 July 2019'),
		prjUpdt: new Date('1 February 2022'),
	},
	{
		id: 'gronkh_de_concept',
		darkThemed: true,
		projectUrl: 'https://danielsharkov.github.io/gronkh_de_concept',
		codeUrl: 'https://github.com/DanielSharkov/gronkh_de_concept',
		otherLinks: [
			{name: 'Gronkh.tv', url: 'https://gronkh.tv'},
		],
		usedTechnologies: ['VueJS', 'Stylus', 'VSC'],
		gradient: ['#ff51ea', '#fe9840', '#42ffc2', '#b870fa', '#54ff32'],
		lang: [Language.DE],
		articleWritten: new Date('1 June 2021'),
		prjImpl: new Date('1 March 2018'),
	},
	{
		id: 'org_graph',
		darkThemed: true,
		projectUrl: null,
		codeUrl: null,
		usedTechnologies: [
			'Svelte', 'SVG', 'TypeScript', 'Go', 'Stylus', 'Docker',
			'Nginx', 'Figma', 'VSC', 'SQL', 'PostgreSQL', 'GraphQL', 'd3js',
		],
		gradient: ['#1488CC', '#2B32B2'],
		lang: [Language.DE, Language.EN],
		prjImpl: new Date('1 December 2020'),
	},
	{
		id: 'svelte_chess',
		projectUrl: 'https://danielsharkov.github.io/svelte-chess',
		codeUrl: 'https://github.com/DanielSharkov/svelte-chess',
		usedTechnologies: ['Svelte', 'Stylus', 'SVG', 'Figma', 'VSC'],
		gradient: ['#093028', '#344740'],
		lang: [Language.DE, Language.EN],
		articleWritten: new Date('2 June 2021'),
		prjImpl: new Date('1 July 2019'),
	},
	{
		id: 'svelte_router',
		darkThemed: true,
		projectUrl: 'https://www.npmjs.com/package/@danielsharkov/svelte-router',
		codeUrl: 'https://github.com/danielsharkov/svelte-router',
		usedTechnologies: ['Svelte', 'JavaScript', 'TypeScript', 'VSC', 'Figma'],
		gradient: ['#ffc73e', '#ff6505'],
		lang: [Language.DE],
		articleWritten: new Date('19 January 2022'),
		prjImpl: new Date('12 June 2019'),
		prjUpdt: new Date('11 February 2022'),
	},
	{
		id: 'svelte_router_example',
		darkThemed: true,
		projectUrl: 'https://danielsharkov.github.io/svelte-router-examples/',
		codeUrl: 'https://github.com/danielsharkov/svelte-router-examples',
		usedTechnologies: ['Svelte', 'JavaScript', 'TypeScript', 'VSC', 'Figma'],
		gradient: ['#ff4081', '#ff6e40'],
		lang: [Language.DE],
		articleWritten: new Date('22 January 2022'),
		prjImpl: new Date('21 November 2021'),
		prjUpdt: new Date('8 February 2022'),
	},
	{
		id: 'animation_creator',
		projectUrl: 'https://danielsharkov.github.io/animation-creator/',
		codeUrl: 'https://github.com/danielsharkov/animation-creator',
		usedTechnologies: ['Svelte', 'JavaScript', 'TypeScript', 'VSC', 'Figma'],
		gradient: ['#000000', '#000000', '#f71d44', '#4bb05a', '#3bbbeb', '#000000', '#000000'],
		lang: [Language.DE],
		articleWritten: new Date('28 February 2022'),
		prjImpl: new Date('10 December 2021'),
		prjUpdt: new Date('19 January 2022'),
	},
	{
		id: 'pattern_visualizer',
		darkThemed: true,
		projectUrl: 'https://danielsharkov.github.io/PatternVisualizer/',
		codeUrl: 'https://github.com/DanielSharkov/PatternVisualizer',
		usedTechnologies: ['Svelte', 'VSC', 'Stylus', 'SASS_SCSS'],
		gradient: ['#f399d3', '#a7276e', '#2c9c88', '#713dc3', '#00bfff'],
		lang: [Language.DE, Language.EN],
		articleWritten: new Date('31 May 2021'),
		prjImpl: new Date('1 August 2019'),
	},
	{
		id: 'logo_redesign_proposal',
		darkThemed: true,
		projectUrl: null,
		usedTechnologies: ['Figma', 'SVG', 'VSC'],
		gradient: ['#FA8BFF', '#2BD2FF', '#2BFF88'],
		lang: [Language.DE],
		articleWritten: new Date('31 May 2021'),
		prjImpl: new Date('1 March 2019'),
	},
	{
		id: 'cowo_space',
		projectUrl: 'COMING_SOON',//'https://danielsharkov.github.io/cowo-space',
		codeUrl: 'https://github.com/DanielSharkov/cowo-space',
		usedTechnologies: [
			'Svelte', 'SVG', 'Stylus', 'Docker', 'Nginx', 'Figma', 'VSC',
		],
		gradient: ['#FAACA8', '#DDD6F3'],
		lang: [],
	},
	{
		id: 'dgraph_graphql_go_svelte',
		hasNoCover: true,
		projectUrl: null,
		codeUrl: 'https://github.com/DanielSharkov/dgraph_graphql_go_svelte',
		usedTechnologies: ['Svelte', 'Stylus', 'SVG', 'VSC'],
		gradient: ['#0062ff', '#cbf6ff'],
		lang: [Language.DE, Language.EN],
		articleWritten: new Date('31 May 2021'),
		prjImpl: new Date('1 May 2018'),
	},
	{
		id: 'infocenter',
		darkThemed: true,
		projectUrl: null,//'https://danielsharkov.github.io/eod_infocenter',
		codeUrl: null,
		usedTechnologies: ['Svelte', 'Stylus', 'SVG', 'VSC'],
		gradient: ['#a1c4fd', '#c2e9fb'],
		lang: [Language.DE, Language.EN],
		articleWritten: new Date('31 May 2021'),
		prjImpl: new Date('1 December 2018'),
	},
	{
		id: 'fitcat_app',
		darkThemed: true,
		projectUrl: 'COMING_SOON',//'https://danielsharkov.github.io/fitcat',
		codeUrl: 'https://github.com/DanielSharkov/fitcat-frontend',
		usedTechnologies: ['Svelte', 'Stylus', 'SVG', 'Nginx', 'Figma', 'VSC'],
		gradient: ['#ffffff', '#63d0ff', '#ffffff', '#ffdd7d', '#ffffff'],
		lang: [Language.DE, Language.EN],
		articleWritten: new Date('31 May 2021'),
		prjImpl: new Date('1 February 2019'),
	},
	{
		id: 'shopify_cyber_theme',
		darkThemed: true,
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
		gradient: ['#1F1C2C', '#928DAB'],
		lang: [Language.DE, Language.EN],
		prjImpl: new Date('1 November 2019'),
	},
	{
		id: 'vivobarefoot_redesign_proposal',
		projectUrl: 'https://danielsharkov.github.io/vivobarefoot_redesign_proposal',
		codeUrl: 'https://github.com/DanielSharkov/vivobarefoot_redesign_proposal',
		usedTechnologies: ['HTML', 'CSS', 'JavaScript', 'VSC'],
		gradient: ['#a02828', '#ff5b5b'],
		lang: [Language.DE],
		articleWritten: new Date('31 May 2021'),
		prjImpl: new Date('1 February 2019'),
	},
	{
		id: 'chrome_redesign_inspiration',
		darkThemed: true,
		projectUrl: 'https://codepen.io/DanielSharkov/full/gvZgQN',
		codeUrl: 'https://codepen.io/DanielSharkov/pen/gvZgQN',
		usedTechnologies: ['VueJS', 'Stylus', 'VSC'],
		gradient: ['#08AEEA', '#2AF598'],
		lang: [Language.DE, Language.EN],
		articleWritten: new Date('1 July 2021'),
		prjImpl: new Date('28 February 2018'),
	},
	{
		id: 'dev_documentation',
		darkThemed: true,
		projectUrl: null,
		usedTechnologies: [],
		gradient: ['#08AEEA', '#2AF598'],
		lang: [Language.DE, Language.EN],
		prjImpl: new Date('1 December 2018'),
	},
	{
		id: 'lost_santos_teaser',
		projectUrl: 'https://youtu.be/uWZoT4Nvd3I',
		usedTechnologies: ['PowerDirector15', 'GIMP', 'OBS'],
		gradient: ['#a7a5a4', '#695747'],
		lang: [Language.DE, Language.EN],
		articleWritten: new Date('1 July 2021'),
		prjImpl: new Date('1 December 2016'),
	},
]

export const projectsIdxMap: {[key: string]: number} = {}
for (const p in projects) {
	projectsIdxMap[projects[p].id] = Number(p)
}
