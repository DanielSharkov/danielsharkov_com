<div id='Project_Details_Container'>
	<div class='bg' transition:bgTrans/>
	<div id='Project_Details_Modal' class='grid' role='article' transition:modalTrans class:no-about={project.about === null}>
		<button class='close-modal flex flex-center' on:click={closeModal}>
			<svg class='icon stroke icon-big' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation'>
				<path d='M10 110l50-50m0 0l50-50M60 60l50 50M60 60L10 10' stroke-width='.25rem' stroke-linecap='round' stroke-linejoin='round'/>
			</svg>
		</button>
		<div class='image-container flex flex-center block-select'
		role='img'
		class:no-image={!project.cover}
		class:dark-theme={project.darkTheme}
		style={customGradientBG}>
			{#if project.cover}
				<div class='{$GlobalStore.a11y.darkMode ? 'dark':'light'} flex flex-center'>
					{#if $GlobalStore.a11y.darkMode && project.darkTheme}
						{#if $lazyloader.status === LazyLoadStatus.DONE}
							<div
								class='bg-cover'
								style='background-image: url(projects/{project.id}/cover_dark.png)'
							/>
							<img
								class='image'
								src='projects/{project.id}/cover_dark.png'
								alt='{project.id} cover'
							/>
						{:else}
							<div
								class='thumb bg-cover'
								style='background-image: url(projects/{project.id}/thumbnail_dark.jpg)'
							/>
							<img
								class='thumb image'
								src='projects/{project.id}/thumbnail_dark.jpg'
								alt='{project.id} dark thumbnail'
							/>
							<div class='lazyloader flex flex-center'>
								{#if $lazyloader.status === LazyLoadStatus.LOADING}
									<svg class='icon icon-load icon-large fill' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='xMidYMid'>
										<g transform='rotate(0 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.9166666666666666s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(30 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.8333333333333334s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(60 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.75s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(90 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.6666666666666666s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(120 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.5833333333333334s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(150 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.5s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(180 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.4166666666666667s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(210 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.3333333333333333s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(240 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.25s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(270 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.16666666666666666s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(300 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.08333333333333333s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(330 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='0s' repeatCount='indefinite'/>
											</rect>
										</g>
									</svg>
								{:else if $lazyloader.status === LazyLoadStatus.ERR}
									<svg class='icon icon-error icon-large fill' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill='none'>
										<path d='M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z'/>
									</svg>
								{/if}
							</div>
						{/if}
					{:else}
						{#if $lazyloader.status === LazyLoadStatus.DONE}
							<div
								class='bg-cover'
								style='background-image: url(projects/{project.id}/cover.png)'
							/>
							<img
								class='image'
								src='projects/{project.id}/cover.png'
								alt='{project.id} cover'
							/>
						{:else}
							<div
								class='thumb bg-cover'
								style='background-image: url(projects/{project.id}/thumbnail.jpg)'
							/>
							<img
								class='thumb image'
								src='projects/{project.id}/thumbnail.jpg'
								alt='{project.id} thumbnail'
							/>
							<div class='lazyloader flex flex-center'>
								{#if $lazyloader.status === LazyLoadStatus.LOADING}
									<svg class='icon icon-load icon-large fill' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='xMidYMid'>
										<g transform='rotate(0 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.9166666666666666s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(30 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.8333333333333334s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(60 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.75s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(90 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.6666666666666666s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(120 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.5833333333333334s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(150 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.5s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(180 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.4166666666666667s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(210 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.3333333333333333s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(240 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.25s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(270 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.16666666666666666s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(300 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='-0.08333333333333333s' repeatCount='indefinite'/>
											</rect>
										</g>
										<g transform='rotate(330 50 50)'>
											<rect x='49' y='7' rx='0' ry='0' width='2' height='26'>
												<animate attributeName='opacity' values='1;0' keyTimes='0;1' dur='1s' begin='0s' repeatCount='indefinite'/>
											</rect>
										</g>
									</svg>
								{:else if $lazyloader.status === LazyLoadStatus.ERR}
									<svg class='icon icon-error icon-large fill' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill='none'>
										<path d='M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z'/>
									</svg>
								{/if}
							</div>
						{/if}
					{/if}
				</div>
			{:else if project.about === null}
				<svg class='no-image icon' fill='none' aria-hidden='true' focusable='false' role='presentation' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
					<path d='M84.2922 34.7947L84.9993 35.5018L120.855 -0.353501L120.147 -1.06061L84.2922 34.7947Z' class='fill' opacity='.1'/>
					<path d='M85.5569 84.9356L84.8498 85.6427L119.562 120.355L120.269 119.647L85.5569 84.9356Z' class='fill' opacity='.1'/>
					<path d='M35.5018 84.9993L34.7947 84.2922L-0.0606959 119.148L0.646411 119.855L35.5018 84.9993Z' class='fill' opacity='.1'/>
					<path d='M35.3523 36.1452L36.0594 35.4381L0.0606224 -0.560669L-0.646484 0.146438L35.3523 36.1452Z' class='fill' opacity='.1'/>
					<path d='M89.5 46V77C89.5 77.8284 88.8284 78.5 88 78.5H32C31.1716 78.5 30.5 77.8284 30.5 77V46C30.5 45.1716 31.1716 44.5 32 44.5H44.6667C45.6759 44.5 46.5862 43.8932 46.9744 42.9615L49.6987 36.4231C49.9316 35.8641 50.4778 35.5 51.0833 35.5H53.5H60H66.5H68.9167C69.5222 35.5 70.0684 35.8641 70.3013 36.4231L73.0256 42.9615C73.4138 43.8932 74.3241 44.5 75.3333 44.5H88C88.8284 44.5 89.5 45.1716 89.5 46Z' opacity='.5' class='stroke'/>
					<circle cx='60' cy='60' r='9.5' opacity='.5' class='stroke'/>
				</svg>
			{/if}
		</div>
		<div class='header grid gap-2'>
			<div class='left-piece grid gap-1'>
				<h1 class='name'>{$_('project.' + project.id)}</h1>
				<div class='used-technologies flex list gap-05' role='listbox'>
					{#each project.usedTechnologies as techno}
						<a href={technologies[techno].link} target='_blank' role='listitem' class='techno flex flex-center gap-05' use:vibrateLink>
							<div
								class='color'
								style='background-color: {technologies[techno].color}'
							/>
							{#if technologies[techno].icon}
								<svg class='logo' aria-hidden='true' focusable='false' role='presentation'>
									<title>{techno} Logo</title>
									<use xlink:href='#LOGO_{techno}'/>
								</svg>
							{:else if technologies[techno].image}
								<img
									class='logo'
									src='technologies/logo_{techno}.png'
									alt='{techno} Logo'
								/>
							{/if}
							<span class='name'>
								{technologies[techno].name}
							</span>
						</a>
					{/each}
				</div>
			</div>
			<div class='right-piece flex' class:single-btn={anyHeaderBtnActive} class:no-btn={noHeaderBtn}>
				{#if Array.isArray(project.otherLinks)}
					{#each project.otherLinks as link}
						<a href={link.url} role='button' class='other-link flex flex-center gap-05' target='_blank' use:vibrateLink>
							<svg class='icon icon-default stroke' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation' fill='none' xmlns='http://www.w3.org/2000/svg'>
								<path d='M34.2893 54.7108L19.0614 69.9387C10.6513 78.3489 10.6513 91.9844 19.0614 100.395C27.4716 108.805 41.1071 108.805 49.5173 100.395L64.7452 85.1667C73.1553 76.7565 73.1553 63.121 64.7452 54.7108M85.0491 64.8628L100.277 49.6348C108.687 41.2247 108.687 27.5891 100.277 19.179C91.8669 10.7688 78.2313 10.7688 69.8212 19.179L54.5932 34.4069C52.0762 36.924 50.3124 39.9091 49.302 43.0821C46.9364 50.5109 48.7001 58.9697 54.5932 64.8628' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
							</svg>
							<span class='label'>{$_(link.name)}</span>
						</a>
					{/each}
				{/if}
				{#if project.codeUrl}
					<a href={project.codeUrl} role='button' class='open-source-code flex flex-center gap-05' target='_blank' use:vibrateLink>
						<svg class='icon fill icon-medium' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M42.0439 53.512L17.2039 62.8L42.0439 72.088V79.576L8.85188 66.688V58.912L42.0439 46.024V53.512ZM68.2406 27.376H76.3046L52.5446 95.2H44.4806L68.2406 27.376ZM111.231 58.912V66.688L78.0394 79.576V72.088L102.879 62.8L78.0394 53.512V46.024L111.231 58.912Z'/>
						</svg>
						<span class='label'>{$_('project_source_code')}</span>
					</a>
				{/if}
				{#if project.codeUrl === null}
					<div class='closed-source flex flex-center gap-05'>
						<svg class='icon stroke icon-default' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M16.5 53C16.5 49.4101 19.4101 46.5 23 46.5H60H97C100.59 46.5 103.5 49.4101 103.5 53V97C103.5 100.59 100.59 103.5 97 103.5H23C19.4101 103.5 16.5 100.59 16.5 97V53Z' stroke-width='.5rem'/>
							<path d='M78 45V33C78 23.0589 69.9411 15 60 15V15C50.0589 15 42 23.0589 42 33V45' stroke-width='.5rem'/>
							<line x1='60' y1='67' x2='60' y2='83' stroke-width='.6rem' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
						<span class='label'>{$_('project_closed_source')}</span>
					</div>
				{/if}
				{#if project.projectUrl !== null && project.projectUrl !== 'COMING_SOON'}
					<a href={project.projectUrl} role='button' class='open-project flex flex-center gap-05' target='_blank' use:vibrateLink>
						<div class='shine'/>
						<span class='label'>{$_('open_project')}</span>
						<svg class='icon stroke icon-medium' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M57.7778 25H35C29.4772 25 25 29.4772 25 35V85C25 90.5228 29.4772 95 35 95H85C90.5228 95 95 90.5228 95 85V62.2222' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
							<path d='M105 15L60 60M105 15L105 45M105 15L75 15' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
					</a>
				{:else if project.projectUrl === 'COMING_SOON'}
					<div href={project.projectUrl} class='open-project-soon flex flex-center gap-05'>
						<span class='label'>{$_('project_coming_soon')}</span>
						<svg class='icon stroke icon-medium' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<circle cx='60' cy='60' r='53' stroke-width='.5rem'/>
							<path d='M60 23V60L77 73' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
					</div>
				{/if}
			</div>
		</div>
		{#if project.about}
			<div class='about' class:loading={projectAbout !== null}>
				<hr class='seperator top'/>
				{#if projectAbout !== null && !(projectAbout instanceof Error)}
					{#if project.locale.length > 1}
						<div class='load-different-locale flex flex-center-y'>
							<div class='disclosure'>
								<button class='loaded-translation flex nowrap flex-center-y gap-05' class:active={isSelectingDifferentTranslation} on:click={toggleDifferentTranslations}>
									<svg class='icon icon-small fill' fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
										<path d='M10.72 12.464L8.62545 10.448L8.65818 10.432C10.0483 8.9241 11.0868 7.13894 11.7018 5.2H14.0909V3.6H8.36364V2H6.72727V3.6H1V5.2H10.1473C9.57977 6.78406 8.69529 8.24175 7.54545 9.488C6.79634 8.67616 6.15827 7.7726 5.64727 6.8H4.01091C4.61636 8.096 5.43455 9.344 6.46545 10.448L2.29273 14.464L3.45455 15.6L7.54545 11.6L10.0818 14.08L10.7036 12.464H10.72ZM15.3182 8.4H13.6818L10 18H11.6364L12.5527 15.6H16.4473L17.3636 18H19L15.3182 8.4V8.4ZM13.1745 14L14.5 10.528L15.8255 14H13.1745V14Z'/>
									</svg>
									<span class='label'>{$_('project_load_different_translation')}</span>
									<svg class='icon icon-small stroke' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
										<path d='M18 39L60.4264 81.4264L102.853 39' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/>
									</svg>
								</button>
								{#if isSelectingDifferentTranslation}
									<div class='options grid gap-05'>
										{#each project.locale as locale}
											{#if locale !== loadedAboutTranslation}
												<button class='option flex nowrap flex-center-y gap-05' on:click={()=> selectDifferentTranslation(locale)}>
													<svg class='flag icon icon-large' aria-hidden='true' focusable='false' role='presentation'>
														<title>{LocaleFullName[locale]} Flag</title>
														<use xlink:href='#FLAG_{locale}'/>
													</svg>
													<span class='label'>{LocaleFullName[locale]}</span>
												</button>
											{/if}
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{/if}
					<div class='rtf-content'>{@html renderedRTF}</div>
				{:else if !aboutAvailableInCurrentLocale && !isLoadingAbout}
					<div class='not-available-in-locale text-center grid grid-center'>
						{#if project.locale.length < 1}
							<p class='no-translations'>
								{$_('project_about_unavailable')}
							</p>
						{:else}
							<p>{$_('project_about_only_available_in')}</p>
							<div class='options'>
								{#each project.locale as locale}
									<button class='option flex nowrap flex-center-y gap-05' on:click={()=> fetchAbout(locale)}>
										<svg class='flag icon icon-large' aria-hidden='true' focusable='false' role='presentation'>
											<title>{LocaleFullName[locale]} Flag</title>
											<use xlink:href='#FLAG_{locale}'/>
										</svg>
										<span class='label'>{LocaleFullName[locale]}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{:else}
					<div class='placeholder' class:error-placeholder={projectAbout instanceof Error}>
						<h1>{$_('project_about_failed')}</h1>
						<hr class='h1-border'>
						<p class='i'>_</p>
						<h3>_</h3>
						<p class='ii'>_</p>
						<p class='iii'>_</p>
					</div>
				{/if}
				<hr class='seperator bot'/>
			</div>
			<div class='footer grid grid-center-y'>
				<div class='share-post flex flex-center-y'>
					<span class='label'>{$_('share')}:</span>
					<button
					role='button'
					class='share-option flex flex-center gap-05 nowrap'
					class:is-sharing={userIsSharingURL}
					on:click={shareURL}>
						<div class='status grid gap-05 grid-center-x' role='alert' class:active={userIsSharingURL}>
							<span class='label'>
								{#if shareURLWasCanceled}
									{$_('copy_url_failed')}
								{:else if shareURLWasSuccess}
									{$_('copy_url_success')}
								{:else}
									{$_('copy_url_inprocess')}
								{/if}
							</span>
							<StatusIcon
								loading={userIsSharingURL}
								failed={shareURLWasCanceled}
								succeeded={shareURLWasSuccess}
							/>
						</div>
						<svg class='icon icon-default stroke' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M34.2893 54.7108L19.0614 69.9387C10.6513 78.3489 10.6513 91.9844 19.0614 100.395C27.4716 108.805 41.1071 108.805 49.5173 100.395L64.7452 85.1667C73.1553 76.7565 73.1553 63.121 64.7452 54.7108M85.0491 64.8628L100.277 49.6348C108.687 41.2247 108.687 27.5891 100.277 19.179C91.8669 10.7688 78.2313 10.7688 69.8212 19.179L54.5932 34.4069C52.0762 36.924 50.3124 39.9091 49.302 43.0821C46.9364 50.5109 48.7001 58.9697 54.5932 64.8628' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
						<span class='label'>{$_('copy_url')}</span>
					</button>
					<button
					role='button'
					class='share-option flex flex-center gap-05 nowrap'
					class:is-sharing={userIsSharing}
					on:click={shareThis}>
						<div class='status grid gap-05 grid-center-x' role='alert' class:active={userIsSharing}>
							<span class='label'>
								{#if shareNotSupported}
									{$_('share_not_supported')}
								{:else if shareWasCanceled}
									{$_('share_canceled')}
								{:else if shareWasSuccess}
									{$_('shared')}
								{:else}
									{$_('sharing')}
								{/if}
							</span>
							<StatusIcon
								loading={userIsSharing}
								failed={shareWasCanceled || shareNotSupported}
								succeeded={shareWasSuccess}
							/>
						</div>
						<svg class='icon stroke icon-default' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation' fill='none'>
							<path d='M45.25 40H35C29.4772 40 25 44.4772 25 50V100C25 105.523 29.4772 110 35 110H85C90.5229 110 95 105.523 95 100V50C95 44.4772 90.5229 40 85 40H74.75M60.5 10V70M60.5 10L77 26.5M60.5 10L44 26.5' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
						</svg>
						<span class='label'>{$_('share_with')}</span>
					</button>
					<!-- {#if isSharingSupported}
					{/if} -->
				</div>
				<button role='button' class='close flex flex-center-y flex-self-right gap-1 nowrap' on:click={closeModal}>
					<svg class='icon stroke icon-small' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 120 120' aria-hidden='true' focusable='false' role='presentation'>
						<path d='M10 110l50-50m0 0l50-50M60 60l50 50M60 60L10 10' stroke-width='.5rem' stroke-linecap='round' stroke-linejoin='round'/>
					</svg>
					<span class='label'>{$_('close')}</span>
				</button>
			</div>
		{/if}
	</div>
</div>



<MetaTags
	openGraph={{
		site_name: $_('page_title'),
		url: `http://danielsharkov.com/?project=${project.id}`,
		title: $_('page_title'),
		description: $_('about_me'),
		locale: $i18n,
		profile: {
			firstName: 'Daniel',
			lastName: 'Scharkov',
			username: 'DaSh_x097',
		},
		images: [{
			url: `http://danielsharkov.com/projects/${project.id}/cover.png`,
			width: 1920, height: 1200,
			alt: `danielsharkov.com ${$_('project.' + project.id)} cover`
		},{
			url: `http://danielsharkov.com/projects/${project.id}/preview.png`,
			width: 1024, height: 640,
			alt: `danielsharkov.com ${$_('project.' + project.id)} preview`
		},{
			url: `http://danielsharkov.com/projects/${project.id}/thumbnail.png`,
			width: 300, height: 188,
			alt: `danielsharkov.com ${$_('project.' + project.id)} thumbnail`
		}],
	}}
/>



<script lang='ts'>
	import {createEventDispatcher, onDestroy} from 'svelte'
	const dispatch = createEventDispatcher()
	import {cubicInOut} from 'svelte/easing'
	import type {Project} from '../database'
	import {projects, technologies} from '../database'
	import Marked from 'marked'
	import {GlobalStore} from '../global_store'
	import {vibrate, vibrateLink, copyToClipboard} from '../utils/misc'
	import StatusIcon from './StatusIcon.svelte'
	import {MetaTags} from 'svelte-meta-tags'
	import {_} from 'svelte-i18n'
	import {i18n, Locale, LocaleFullName, LocaleList} from '../i18n'
	import {get as getStore} from 'svelte/store'
	import {LazyLoader, LazyLoadStatus} from '../utils/lazy_loader'

	function closeModal(): void {
		vibrate()
		dispatch('close')
	}

	export let projectIndex: number
	const project: Project = projects[projectIndex]

	function bgTrans(_, o?) {
		const reducedMotion = getStore(GlobalStore).a11y.reducedMotion
		return {
			duration: !reducedMotion && 500,
			css: (t)=> `opacity: ${cubicInOut(t)}`,
		}
	}

	function modalTrans(_, o?) {
		const reducedMotion = getStore(GlobalStore).a11y.reducedMotion
		return {
			duration: !reducedMotion && 500,
			css(t) {
				t = cubicInOut(t)
				return `opacity: ${t}; transform: translate(0, ${8 - 8 * t}rem);`
			},
		}
	}

	let renderedRTF = null
	let projectAbout = null
	let isLoadingAbout = false
	let loadedAboutTranslation: Locale = null
	let isSelectingDifferentTranslation = false
	let aboutAvailableInCurrentLocale = project.locale.includes($i18n as Locale)
	async function fetchAbout(locale?: Locale): Promise<void> {
		if (typeof locale !== 'string') {
			locale = $i18n as Locale
		}

		try {
			renderedRTF = null
			projectAbout = null
			isLoadingAbout = true
			if (!LocaleList.includes(locale)) {
				throw new Error(`invalid locale (${locale}) provided`)
			}

			const resp = await fetch(`projects/${project.id}/about/${locale}.md`)
			if (resp.status !== 200) throw new Error('404')
			const text = await resp.text()
			projectAbout = text
			renderedRTF = Marked(projectAbout, {
				smartLists: true,
			})
			setTimeout(()=> {
				for (const link of document.querySelectorAll('.rtf-content a')) {
					link.setAttribute('target', '_blank')
				}
				loadedAboutTranslation = locale
				isLoadingAbout = false
			})
		} catch(err) {
			setTimeout(()=> {
				projectAbout = err
				isLoadingAbout = false
			}, 1000)
		}
	}
	if (project.about && project.locale.includes($i18n as Locale)) {
		fetchAbout()
	}

	function toggleDifferentTranslations(): void {
		isSelectingDifferentTranslation = !isSelectingDifferentTranslation
	}
	function selectDifferentTranslation(locale: Locale): void {
		isSelectingDifferentTranslation = false
		fetchAbout(locale)
	}

	let isCurrentDarkMode = getStore(GlobalStore).a11y.darkMode
	let lazyloader: LazyLoader
	function loadCover() {
		if (!project.cover) return
		if (isCurrentDarkMode && project.darkTheme) {
			lazyloader = new LazyLoader(`projects/${project.id}/cover_dark.png`)
		}
		else {
			lazyloader = new LazyLoader(`projects/${project.id}/cover.png`)
		}
		lazyloader.load()
	}
	loadCover()
	const unSubDarkModeWatcher = GlobalStore.subscribe((s)=> {
		if (s.a11y.darkMode !== isCurrentDarkMode) {
			isCurrentDarkMode = s.a11y.darkMode
			loadCover()
		}
	})

	onDestroy(function() {
		unSubDarkModeWatcher()
		if (lazyloader && lazyloader.destroy) lazyloader.destroy()
	})

	const anyHeaderBtnActive = (
		project.codeUrl !== undefined && project.projectUrl === undefined ||
		project.codeUrl === undefined && project.projectUrl !== undefined
	)

	const noHeaderBtn = (
		project.codeUrl === undefined && project.projectUrl === null
	)

	let userIsSharingURL = false
	let shareURLWasCanceled = false
	let shareURLWasSuccess = false
	async function shareURL(): Promise<void> {
		if (userIsSharingURL) return
		shareURLWasCanceled = false
		shareURLWasSuccess = false
		shareThisReset()

		if (window.location?.href) {
			userIsSharingURL = true
			vibrate()
			if (await copyToClipboard(window.location.href)) {
				vibrate([0,500,200,100,50])
				setTimeout(()=> {
					shareURLWasSuccess = true
					setTimeout(shareURLReset, 2000)
				})
			}
			else {
				vibrate([0,500,100,50,100])
				setTimeout(()=> {
					shareURLWasCanceled = true
					setTimeout(shareURLReset, 2000)
				})
			}
		}
		else {
			vibrate([0,500, 100,50,100, 200, 50,50,50,50,50,50,50,50,50])
			userIsSharingURL = true
			setTimeout(()=> {
				shareURLWasCanceled = true
				setTimeout(shareURLReset, 2000)
			})
		}
	}
	function shareURLReset() {
		userIsSharingURL = false
		setTimeout(()=> {
			shareURLWasCanceled = false
			shareURLWasSuccess = false
		})
	}

	let userIsSharing = false
	let shareWasCanceled = false
	let shareNotSupported = false
	let shareWasSuccess = false
	async function shareThis() {
		if (userIsSharing) return
		shareWasCanceled = false
		shareWasSuccess = false
		shareURLReset()

		if (window.navigator?.share && window.location?.href) {
			vibrate()
			userIsSharing = true

			try {
				await navigator.share({
					title: (
						$_('a_project_by', {
							values: {
								'name': $_('project.' + project.id),
							},
						})
					),
					url: window.location.href,
				})
				vibrate([0,500,200,100,50])
				setTimeout(()=> {
					shareWasSuccess = true
					setTimeout(shareThisReset, 2000)
				})
			} catch(err) {
				vibrate([0,500,100,50,100])
				setTimeout(()=> {
					shareWasCanceled = true
					setTimeout(shareThisReset, 2000)
				})
			}
		}
		else {
			vibrate([0,500, 100,50,100, 200, 50,50,50,50,50,50,50,50,50])
			userIsSharing = true
			setTimeout(()=> {
				shareNotSupported = true
				setTimeout(shareThisReset, 3000)
			})
		}
	}
	function shareThisReset() {
		userIsSharing = false
		setTimeout(()=> {
			shareWasCanceled = false
			shareNotSupported = false
			shareWasSuccess = false
		})
	}

	$:customGradientBG = (
		Array.isArray(project.gradient) ?
			`background: -webkit-linear-gradient(125deg, ${project.gradient.join(',')});` +
			`background: linear-gradient(125deg, ${project.gradient.join(',')});`
		: ''
	)

	// const isSharingSupported = window.navigator?.share !== undefined
</script>



<svelte:window
	on:hashchange={closeModal}
	on:popstate={closeModal}
	on:keyup={(e)=> e.key == 'Escape' ? closeModal() : 0}
/>



<style lang='stylus'>
	#Project_Details_Container
		z-index: 100
		position: fixed
		top: 0
		left: 0
		width: 100%
		height: 100%
		overflow-y: auto
		@media screen and (min-width: 600px)
			padding: 1rem
		@media screen and (min-width: 1400px)
			padding: 2rem
		> .bg
			z-index: -1
			position: fixed
			top: 0
			right: 0
			bottom: 0
			left: 0
			background-color: var(--overlay-bg)

	#Project_Details_Modal
		position: relative
		right: 0
		left: 0
		min-height: 100%
		max-width: 1500px
		margin: auto
		background-color: var(--bg-clr)
		grid-template-rows: auto auto 1fr
		transform: translate3d(0,0,0)
		@media screen and (min-width: 600px)
			margin-bottom: 5rem
			box-shadow: var(--shadow-2)
			border-radius: .5rem
		@media screen and (min-width: 1400px)
			margin-bottom: 10rem
			box-shadow: var(--shadow-4)
		@media screen and (min-width: 1400px)
			margin-bottom: 15rem
		@media screen and (max-width: 600px)
			box-shadow: none !important
		> .close-modal
			z-index: 100
			position: absolute
			top: 1rem
			right: 1rem
			padding: 1rem
			background-color: var(--bg-clr)
			border: solid 1px var(--font-base-clr)
			box-shadow: var(--shadow-1)
			border-radius: 2rem
			line-height: 1
			transition: var(--transition)
			transition-property: transform, background-color, box-shadow, color
			will-change: transform, background-color, box-shadow, color
			&:hover, &:active
				transform: scale(1.25)
				background-color: var(--color-accent)
				border-color: #fff
				box-shadow: var(--shadow-2)
				.icon.stroke > *
					stroke: #fff
			&:active
				box-shadow: var(--shadow-0)
				transform: scale(0.95)
		> .image-container
			position: relative
			height: auto
			min-height: 65vh
			max-height: 65vh
			background-color: var(--font-base-clr-005)
			border-bottom: solid .25rem var(--bg-clr-025)
			overflow: hidden
			border-radius: inherit
			border-bottom-left-radius: 0
			border-bottom-right-radius: 0
			.lazyloader
				z-index: 10
				position: absolute
				top: 0
				right: 0
				bottom: 0
				left: 0
				background-color: var(--bg-clr-075)
				.icon
					font-size: 3em
			@media screen and (max-width: 600px)
				min-height: auto
				max-height: 55vh
			> div
				top: 0
				right: 0
				bottom: 0
				left: 0
				padding: 1.5rem
				@media screen and (min-width: 600px)
					position: absolute
				@media screen and (max-width: 600px)
					padding: 5rem 1rem 2rem 1rem
			.bg-cover
				z-index: 1
				background-size: cover
				background-position: top
				opacity: .1
				position: absolute
				top: 0
				left: 0
				width: 100%
				height: 100%
				background-position: center
				background-repeat: no-repeat
				@media screen and (min-width: 600px)
					border-radius: .5rem .5rem 0 0
			.image
				height: auto
				max-height: 100%
				width: auto
				max-width: 100%
				margin: auto
				z-index: 3
				box-shadow:
					var(--shadow-contrast),
					0 0 1px var(--shadow-ao-clr),
					0 18px 30px -20px var(--shadow-huge-clr)
				background-size: contain
				border-radius: .5rem
			.image, .bg-cover
				&.thumb
					filter: blur(5px)
			.dark
				background-color: var(--bg-clr-05)
			&.no-image
				height: 4.5rem
				min-height: unset
			> .no-image
				width: 25%
				height: 25%
		> .header
			padding: 2rem
			grid-template-columns: 1fr minmax(auto, 45%)
			@media screen and (max-width: 600px)
				grid-template-columns: 1fr
				padding: 1rem
			> .left-piece .name
				letter-spacing: 0
			> .right-piece
				justify-content: flex-end
				align-content: center
				align-items: center
				gap: .5em
				@media screen and (max-width: 600px)
					display: grid
					grid-template-columns: 1fr 1fr
					grid-gap: .5rem
					&.single-btn
						grid-template-columns: 1fr
					&.no-btn
						display: none
			.used-technologies
				.techno
					z-index: 0
					position: relative
					padding: .25rem .75rem
					line-height: 1
					text-decoration: none
					border-radius: 1rem
					color: var(--font-heading-clr)
					transition: var(--transition)
					transition-property: transform, box-shadow, color
					will-change: transform, box-shadow, color
					> .color
						z-index: -1
						position: absolute
						top: 0
						left: 0
						width: 100%
						height: 100%
						border-radius: 1rem
						opacity: .1
						transition: var(--transition)
						transition-property: opacity, background-color
						will-change: opacity, background-color
					> .logo
						height: 1.25rem
						width: 1.25rem
					> img.logo
						object-fit: contain
						object-position: center
					> .name
						font-size: .85rem
					&:hover
						transform: translate(0, -.25rem)
						box-shadow:
							0 0 1px var(--shadow-ao-clr),
							0 10px 20px -10px var(--shadow-huge-clr)
						> .color
							opacity: .25
			.open-project, .open-project-soon, .open-source-code, .other-link
				padding: .5rem 1rem
				border-radius: 2rem
				text-decoration: none
				font-size: 1.15rem
				color: var(--font-heading-clr)
				@media screen and (max-width: 600px)
					padding: .5rem
					font-size: 1rem
					flex-wrap: nowrap
			.open-source-code, .other-link
				transition: var(--transition)
				transition-property: opacity, background-color
				will-change: opacity, background-color
				&:hover
					background-color: var(--font-base-clr-01)
				&:not(:hover)
					opacity: .75
			.closed-source
				margin-right: 2rem
				color: var(--font-base-clr-035)
				.icon.stroke > *
					stroke: var(--font-base-clr-025)
			.closed-source, .open-source-code
				@media screen and (max-width: 600px)
					margin: 0
			.open-project
				position: relative
				background-color: var(--color-accent)
				color: #FFF
				overflow: hidden
				transition: var(--transition)
				transition-property: transform, box-shadow, color
				will-change: transform, box-shadow, color
				.icon.stroke > *
					stroke: #FFF
				.shine
					position: absolute
					left: 0
					top: 0
					height: 100%
					width: 100%
					background: rgb(#FFF)
					background: -moz-linear-gradient(90deg, rgba(#FFF,0) 30%, rgba(#FFF,.15) 30%, rgba(#FFF,.15) 70%, rgba(#FFF,0) 70%)
					background: -webkit-linear-gradient(90deg, rgba(#FFF,0) 30%, rgba(#FFF,.15) 30%, rgba(#FFF,.15) 70%, rgba(#FFF,0) 70%)
					background: linear-gradient(90deg, rgba(#FFF,0) 30%, rgba(#FFF,.15) 30%, rgba(#FFF,.15) 70%, rgba(#FFF,0) 70%)
					transform: skew(35deg) translate(-100%,0)
					transition: var(--transition)
					transition-property: transform, box-shadow, color
					will-change: transform, box-shadow, color
				&:hover
					box-shadow:
						0 0 1px var(--shadow-ao-clr),
						0 5px 20px -10px var(--color-accent)
					transform: scale(1.05)
					.shine
						transition-duration: 1s
						transform: skew(35deg) translate(100%,0)
			.open-project-soon
				cursor: default
				background-color: var(--font-base-clr-01)
		> .about
			position: relative
			min-height: 25vh
			> .seperator
				position: absolute
				left: 0
				right: 0
				margin: 0
				&.top
					top: -2px
				&.bot
					bottom: -2px
			> .load-different-locale
				width: 100%
				max-width: 1000px
				margin: auto
				padding: 1em
				> .disclosure
					position: relative
					> .loaded-translation
						padding: .5em 1em
						background-color: var(--fg-clr)
						border-radius: 2em
						box-shadow: var(--shadow-0)
						transition: var(--transition)
						transition-property: background-color, color
						will-change: background-color, color
						.label
							margin-right: .5em
						.icon
							font-size: 1.25em
						&:hover, &:active, &.active
							background-color: var(--color-accent)
							color: #fff
							.icon
								&.fill > *, .fill
									fill: #fff
								&.stroke > *, .stroke
									stroke: #fff
						&:active, &.active
							background-color: var(--font-base-clr)
							color: var(--bg-clr)
							.icon
								&.fill > *, .fill
									fill: var(--bg-clr)
								&.stroke > *, .stroke
									stroke: var(--bg-clr)
					> .options
						position: absolute
						top: auto
						right: auto
						min-width: 100%
						padding: .5em
						border-radius: .5em
						box-shadow: var(--shadow-4)
						background-color: var(--fg-clr)
						.option
							padding: .5em 1em
							border-radius: .25em
							transition: var(--transition)
							transition-property: background-color, color
							will-change: background-color, color
							> .label
								margin-right: .5em
							&:hover
								background-color: var(--font-base-clr-01)
							&:active
								background-color: var(--font-base-clr-025)
			> .not-available-in-locale
				width: 100%
				height: 100%
				padding: 2em 0
				> p
					max-width: 500px
					margin-bottom: 1em
					font-size: 1.25em
					&.no-translations
						color: var(--font-base-clr-05)
				> .options
					> .option
						padding: .5em
						border-radius: .5em
						background-color: var(--fg-clr)
						box-shadow: var(--shadow-1)
						transition: var(--transition)
						transition-property: background-color, box-shadow, color, transform
						will-change: background-color, box-shadow, color, transform
						&:hover
							box-shadow: var(--shadow-3)
							transform: translateY(-.25em)
						&:active, &:focus
							box-shadow: var(--shadow-1)
							transform: translateY(.15em)
							background-color: var(--color-accent)
							color: #fff
			> .placeholder
				pointer-events: none
				user-select: none
				h1, h3, p, .image
					position: relative
					margin-bottom: 1rem
					background-color: var(--font-base-clr-0025)
					overflow: hidden
					border-radius: .25rem
					color: transparent
					&:after
						content: ''
						position: absolute
						top: 0
						left: 0
						width: 100%
						height: 100%
						background: transparent
				h1
					display: inline-block
					margin: 0
					padding: 0 .25rem
					line-height: 1.25
					font-size: 2.5em
				.h1-border
					width: 100%
					margin: .25rem 0 1rem 0
					border: solid var(--border-soft)
					border-width: 1px 0 0
				h3
					width: 25%
					margin-top: 1.5rem
					line-height: 1.25
				p
					&.i
						width: 68%
					&.ii
						width: 85%
					&.iii
						width: 38%
				&.error-placeholder
					h1
						color: var(--color-crit)
					h1, h3, p, .image
						background-color: var(--color-crit-01)
						transition: 1s var(--transition-easing)
						transition-property: background-color, color
						will-change: background-color, color
				&:not(.error-placeholder)
					h1, h3, p, .image
						&:after
							content: ''
							position: absolute
							top: 0
							left: 0
							width: 100%
							height: 100%
							animation: textLoading 2s linear infinite
							background: transparent
							background: -moz-linear-gradient(90deg, rgba(#FFF, 0) 0%, var(--placeholder-loading) 50%, rgba(#FFF, 0) 100%)
							background: -webkit-linear-gradient(90deg, rgba(#FFF, 0) 0%, var(--placeholder-loading) 50%, rgba(#FFF, 0) 100%)
							background: linear-gradient(90deg, rgba(#FFF, 0) 0%, var(--placeholder-loading) 50%, rgba(#FFF, 0) 100%)
			> .rtf-content, > .placeholder, > .error-placeholder
				max-width: 1000px
				margin: auto
				padding: 2rem
				@media screen and (max-width: 1000px)
					padding: 2rem 1rem
			> .rtf-content
				font-size: 1.15rem
				@media screen and (max-width: 1000px)
					font-size: 1rem
		> .footer
			padding: 2rem
			grid-template-columns: auto auto
			justify-content: space-between
			grid-gap: 1rem
			border-radius: inherit
			border-top-left-radius: 0
			border-top-right-radius: 0
			@media screen and (max-width: 600px)
				padding: 2rem 1rem
				grid-template-columns: 1fr
				grid-gap: 2rem
			.share-post
				> .label
					margin-right: 1rem
				.share-option
					position: relative
					padding: .5rem 1rem
					background-color: var(--font-base-clr-01)
					border-radius: 2rem
					transition: var(--transition)
					transition-property: background-color, transform, box-shadow
					will-change: background-color, transform, box-shadow
					@media screen and (max-width: 600px)
						margin-right: 0 !important
						padding: 1rem
					.status
						z-index: 10
						position: absolute
						left: auto
						bottom: 150%
						margin: 0
						padding: 1rem
						background-color: var(--fg-clr)
						box-shadow:
							0 0 1px var(--shadow-ao-clr),
							0 70px 10px -54px var(--shadow-big-clr),
							0 10px 30px -10px var(--shadow-huge-clr)
						border-radius: .5rem
						transition: var(--transition)
						transition-property: opacity, transform
						will-change: opacity, transform
						pointer-events: none
						color: var(--font-heading-clr)
						&:not(.active)
							opacity: 0
							transform: translate(0, 2rem)
						> .label
							font-size: .85rem
						:global > .icon
							width: 6rem
							height: 6rem
						&:before
							content: ''
							position: absolute
							bottom: -2rem
							border: solid 1rem transparent
							border-top-color: var(--fg-clr)
					&:not(:last-child)
						margin-right: .5rem
					&:hover, &:active, &:focus, &.is-sharing
						background-color: var(--color-accent)
						transform: translate(0, -.25rem)
						box-shadow: var(--shadow-4)
						color: #fff
						.icon.fill > *
							fill: #fff
						.icon.stroke > *
							stroke: #fff
					&:active, &:focus
						transform: translate(0, .15rem)
					&.is-sharing
						background-color: var(--font-base-clr)
						color: var(--bg-clr)
						.icon.fill > *
							fill: var(--bg-clr)
						.icon.stroke > *
							stroke: var(--bg-clr)
				@media screen and (max-width: 600px)
					> .label, .share-option
						margin: 0
						flex: 1 1 100%
					.share-option
						margin-top: 1rem
			.close
				padding: .5rem 1rem
				border-radius: 2rem
				font-size: 1.15rem
				background-color: var(--font-base-clr-01)
				transition: var(--transition)
				transition-property: transform, box-shadow, color, background-color
				will-change: transform, box-shadow, color, background-color
				&:hover
					background-color: var(--font-base-clr)
					transform: translate(0, -.25rem)
					box-shadow: var(--shadow-4)
					color: var(--bg-clr)
					.icon.stroke > *
						stroke: var(--bg-clr)
				&:active
					background-color: var(--color-accent)
					transform: translate(0, .15rem)
					box-shadow: var(--shadow-3)
					color: #fff
					.icon.stroke > *
						stroke: #fff
		&.no-about
			grid-template-rows: 1fr auto
			margin-bottom: 0
			> .image-container
				height: auto

	@media (prefers-color-scheme: light)
		#Project_Details_Modal > .image-container .dark
			display: none

	@media (prefers-color-scheme: dark)
		#Project_Details_Modal
			> .image-container
				&.dark-theme .light
					display: none
				.light
					background-color: var(--bg-clr-05)
			> .header
				.used-technologies .techno
					> .color
						opacity: .25
					&:hover > .color
						opacity: .4
				.open-source-code:hover
					background-color: var(--font-base-clr-015)
			> .header, > .footer
				background-color: var(--font-base-clr-01)

	@keyframes textLoading
		from
			transform: translate(125%, 0) skew(-45deg)
		to
			transform: translate(-125%, 0) skew(-45deg)

	@media (prefers-contrast: more)
		#Project_Details_Modal
			> .header .used-technologies .techno,
			> .header .open-project, > .header .open-source-code,
			> .header .closed-source, > .header .open-project-soon,
			> .footer button, > .footer a
				border: solid 1px var(--border-hard) !important
</style>
