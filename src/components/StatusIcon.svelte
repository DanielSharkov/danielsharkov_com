<svg
class='icon' viewBox='0 0 120 120' fill='none'
aria-hidden='true' focusable='false' role='presentation' xmlns='http://www.w3.org/2000/svg'
class:failed={failed}
class:succeeded={succeeded}
class:loading={loading && !failed && !succeeded}>
	<style>
		svg:not(.failed) .cross,
		svg:not(.succeeded) .check {
			opacity: 0;
			-webkit-animation: none;
			animation: none;
		}
		.circle-bg {
			stroke: var(--font-base-clr-005);
		}
		.circle, .cross, .check {
			transform-origin: center;
			transform-box: view-box;
		}

		svg.loading .circle {
			stroke-dasharray: 290;
			stroke-dashoffset: 0;
			-webkit-animation: loadingCircle 3s infinite linear;
			animation: loadingCircle 3s infinite linear;
			stroke: var(--font-base-clr-025);
		}
		@keyframes loadingCircle {
			0% {
				transform: rotate(0deg);
				stroke-dashoffset: 0;
			}
			50% {
				transform: rotate(180deg);
				stroke-dashoffset: 290;
			}
			100% {
				transform: rotate(720deg);
				stroke-dashoffset: 0;
			}
		}

		svg.failed .circle-bg {
			stroke: var(--color-crit-01)
		}
		svg.failed .circle {
			stroke-dasharray: 290;
			stroke-dashoffset: 0;
			-webkit-animation: failedCircle 1s linear;
			animation: failedCircle 1s linear;
			stroke: var(--color-crit);
		}
		@keyframes failedCircle {
			0% {
				transform: rotate(0deg);
				stroke-dashoffset: 0;
				stroke: var(--font-base-clr-01);
			}
			50% {
				transform: rotate(180deg);
				stroke-dashoffset: 290;
			}
			100% {
				transform: rotate(720deg);
				stroke-dashoffset: 0;
				stroke: var(--color-crit);
			}
		}
		svg.failed .cross_1 {
			stroke-dasharray: 90;
			stroke-dashoffset: 204;
			stroke: var(--color-crit);
			-webkit-animation: cross_1 .75s both cubic-bezier(.22, .61, .36, 1);
			animation: cross_1 .75s both cubic-bezier(.22, .61, .36, 1);
			-webkit-animation-delay: .3s;
			animation-delay: .3s;
		}
		@keyframes cross_1 {
			from {
				stroke-dashoffset: 90;
			}
		}
		svg.failed .cross_2 {
			stroke-dasharray: 93;
			stroke-dashoffset: 212;
			stroke: var(--color-crit);
			-webkit-animation: cross_2 .4s both cubic-bezier(.22, .61, .36, 1);
			animation: cross_2 .4s both cubic-bezier(.22, .61, .36, 1);
			-webkit-animation-delay: .55s;
			animation-delay: .55s;
		}
		@keyframes cross_2 {
			from {
				stroke-dashoffset: 93;
			}
		}

		svg.succeeded .circle-bg {
			stroke: var(--color-success-01)
		}
		svg.succeeded .circle {
			stroke-dasharray: 290;
			stroke-dashoffset: 0;
			-webkit-animation: succeededCircle 1s linear;
			animation: succeededCircle 1s linear;
			stroke: var(--color-success);
		}
		@keyframes succeededCircle {
			0% {
				transform: rotate(0deg);
				stroke-dashoffset: 0;
				stroke: var(--font-base-clr-01);
			}
			50% {
				transform: rotate(180deg);
				stroke-dashoffset: 290;
			}
			100% {
				transform: rotate(720deg);
				stroke-dashoffset: 0;
				stroke: var(--color-success);
			}
		}
		svg.succeeded .check {
			stroke-dasharray: 105;
			stroke-dashoffset: 105;
			stroke: var(--color-success);
			-webkit-animation: check .75s both var(--transition-easing);
			animation: check .75s both var(--transition-easing);
			-webkit-animation-delay: .35s;
			animation-delay: .35s;
		}
		@keyframes check {
			from {
				stroke-dashoffset: 105;
			}
			to {
				stroke-dashoffset: 35;
			}
		}
	</style>
	<path class='circle-bg' d='M60 106C85.4051 106 106 85.4051 106 60C106 34.5949 85.4051 14 60 14C34.5949 14 14 34.5949 14 60C14 85.4051 34.5949 106 60 106Z' stroke-width='.1rem' stroke-linecap='round' stroke-linejoin='round'/>
	<path class='circle' d='M60 106C85.4051 106 106 85.4051 106 60C106 34.5949 85.4051 14 60 14C34.5949 14 14 34.5949 14 60C14 85.4051 34.5949 106 60 106Z' stroke-width='.1rem' stroke-linecap='round' stroke-linejoin='round'/>
	<path class='check' d='M83.5614 43L48.9583 77.8633L36.0001 64.9051C23.5949 52.5 11.5001 58 17.0003 76.5' stroke-width='.1rem' stroke-linecap='round' stroke-linejoin='round'/>
	<path class='cross cross_1' d='M82.9993 83L37.0003 37.001C29.4993 29.5 24.5 28 19 39' stroke-width='.1rem' stroke-linecap='round' stroke-linejoin='round'/>
	<path class='cross cross_2' d='M37.0001 82.9386L82.9991 36.9397C91.5 28.4388 83.9999 19 75.9999 17' stroke-width='.1rem' stroke-linecap='round' stroke-linejoin='round'/>
</svg>



<script lang='ts'>
	export let failed: boolean = false
	export let succeeded: boolean = false
	export let loading: boolean = false
</script>
