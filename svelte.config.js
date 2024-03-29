import sveltePreprocess from 'svelte-preprocess'
import autoprefixer from 'autoprefixer'

export default {
	preprocess: sveltePreprocess({
		sourceMap: true,
		preprocess: sveltePreprocess({
			sourceMap: true,
			preprocess: {
				plugins: [autoprefixer()],
			},
			postcss: {
				plugins: [autoprefixer()],
			},
		}),
	}),
}
