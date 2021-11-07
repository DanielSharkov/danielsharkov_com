const sveltePreprocess = require('svelte-preprocess')
const autoprefixer = require('autoprefixer')

module.exports = {
	preprocess: sveltePreprocess({
		sourceMap: true,
		preprocess: sveltePreprocess({
			sourceMap: true,
			stylus: {includePaths: ['src']},
			preprocess: {
				plugins: [autoprefixer()],
			},
			postcss: {
				plugins: [autoprefixer()],
			},
		}),
	}),
}
