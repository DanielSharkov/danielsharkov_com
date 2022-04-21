import App from './App.svelte'
const app = new App({target: document.body})
export default app

// Remove predefined meta tags, because libraray "Svelte Meta Tags" doesn't
// override them. The predefined tags are required for search engines and
// site previews, because JS is either not loaded at all or delayed and
// therefor the metadata is missing.
function _removePredefinedMetaTags() {
	document.querySelectorAll(
		`meta[name='robots'], meta[name='googlebot'], meta[name='description'],`+
		`meta[name^='twitter:'], meta[property^='og:']`
	).forEach((metaTag)=> {
		document.head.removeChild(metaTag)
	})
}
_removePredefinedMetaTags()
