
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const careerBegin = 2012;
    var TechnologyType;
    (function (TechnologyType) {
        TechnologyType[TechnologyType["Software"] = 0] = "Software";
        TechnologyType[TechnologyType["Language"] = 1] = "Language";
        TechnologyType[TechnologyType["Framework"] = 2] = "Framework";
        TechnologyType[TechnologyType["Library"] = 3] = "Library";
    })(TechnologyType || (TechnologyType = {}));
    const technologies = {
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
    };
    const projects = [
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
            projectUrl: 'COMING_SOON',
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
            projectUrl: 'COMING_SOON',
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
            projectUrl: 'https://dgraph_go.danielsharkov.com',
            codeUrl: 'https://github.com/DanielSharkov/dgraph_graphql_go_svelte',
            usedTechnologies: ['Svelte', 'Stylus', 'SVG'],
            about: true,
        },
        {
            name: `Infocenter`,
            id: 'infocenter',
            cover: true,
            darkTheme: true,
            projectUrl: null,
            codeUrl: null,
            usedTechnologies: ['Svelte', 'Stylus', 'SVG'],
            about: true,
        },
        {
            name: `FitCat App`,
            id: 'fitcat_app',
            cover: true,
            darkTheme: true,
            projectUrl: 'COMING_SOON',
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
    ];
    const projectsIndexByID = {};
    for (const p in projects)
        projectsIndexByID[projects[p].id] = Number(p);

    var _store;
    var ImageThumbKind;
    (function (ImageThumbKind) {
        ImageThumbKind["LIGHT"] = "light";
        ImageThumbKind["DARK"] = "dark";
    })(ImageThumbKind || (ImageThumbKind = {}));
    class _GlobalStore {
        constructor() {
            _store.set(this, writable({
                lockScroll: {
                    state: false,
                    stack: [],
                },
                socialMedia: [
                    { name: 'GitHub', url: 'https://github.com/DanielSharkov' },
                    { name: 'Codepen', url: 'https://codepen.io/DanielSharkov' },
                    { name: 'Discord', url: 'https://discordapp.com/invite/DMBS9xd' },
                    { name: 'Telegram', url: 'https://t.me/danielsharkov' },
                    { name: 'Twitter', url: 'https://twitter.com/Daniel_Sharkov' },
                    { name: 'Medium', url: 'https://medium.com/@danielsharkov' },
                    { name: 'Quora', url: 'https://quora.com/profile/Daniel-Sharkov-1' },
                ],
                projectImgLoad: {},
            }));
            this.subscribe = __classPrivateFieldGet(this, _store).subscribe;
        }
        init() {
            __classPrivateFieldGet(this, _store).update((store) => {
                for (const p of projects) {
                    store.projectImgLoad[p.id] = {
                        light: false,
                        dark: false,
                    };
                }
                return store;
            });
        }
        thumbDone(projectID, kind) {
            __classPrivateFieldGet(this, _store).update((store) => {
                store.projectImgLoad[projectID][kind] = true;
                return store;
            });
        }
        isThumbLoaded(projectID, kind) {
            return get_store_value(__classPrivateFieldGet(this, _store)).projectImgLoad[projectID][kind];
        }
        lockScroll(id) {
            if (id === '') {
                throw new Error('lockScroll: invalid ID provided');
            }
            let err = null;
            __classPrivateFieldGet(this, _store).update((store) => {
                if (store.lockScroll.stack.indexOf(id) >= 0) {
                    err = new Error('lockScroll: unable to lock scroll, ' +
                        'provided ID is already in stack');
                    return store;
                }
                if (!store.lockScroll.state) {
                    store.lockScroll.state = true;
                }
                store.lockScroll.stack.push(id);
                return store;
            });
            if (err !== null)
                throw err;
            return true;
        }
        unlockScroll(id) {
            if (id === '') {
                throw new Error('unlockScroll: invalid ID provided');
            }
            let err = null;
            __classPrivateFieldGet(this, _store).update((store) => {
                const idx = store.lockScroll.stack.indexOf(id);
                if (idx < 0) {
                    err = new Error('unlockScroll: unable to unlock scroll, ' +
                        'stack does not contain the provided ID');
                    return store;
                }
                store.lockScroll.stack.splice(idx, 1);
                if (store.lockScroll.stack.length < 1) {
                    store.lockScroll.state = false;
                }
                return store;
            });
            if (err !== null)
                throw err;
            return true;
        }
    }
    _store = new WeakMap();
    const GlobalStore = new _GlobalStore;
    GlobalStore.init();

    function fallbackCopyToClipboard(data) {
        const tempEl = document.createElement('textarea');
        tempEl.value = data;
        // Avoid scrolling to bottom
        tempEl.style.position = 'fixed';
        tempEl.classList.add('hidden');
        document.body.appendChild(tempEl);
        tempEl.focus();
        tempEl.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(tempEl);
            return true;
        }
        catch (err) {
            document.body.removeChild(tempEl);
            return false;
        }
    }
    async function copyToClipboard(data) {
        var _a;
        if (!((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.clipboard))
            return fallbackCopyToClipboard(data);
        try {
            await navigator.clipboard.writeText(data);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function vibrate(duration) {
        var _a;
        if ((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.vibrate) {
            window.navigator.vibrate(duration ? duration : 1);
        }
    }
    let _linkClickFirstVibrate = false;
    function vibrateLink(event, duration) {
        var _a;
        if (!_linkClickFirstVibrate) {
            event.preventDefault();
            _linkClickFirstVibrate = true;
            if ((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.vibrate) {
                window.navigator.vibrate(duration ? duration : 1);
            }
            event.target.click();
        }
        else {
            _linkClickFirstVibrate = false;
        }
    }

    /* src\sections\LandingSection.svelte generated by Svelte v3.37.0 */

    const { Object: Object_1$1 } = globals;
    const file$9 = "src\\sections\\LandingSection.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i].name;
    	child_ctx[17] = list[i].url;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (70:1) {#if showBigProfilePicture}
    function create_if_block$4(ctx) {
    	let div2;
    	let div0;
    	let div0_transition;
    	let t;
    	let div1;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "bg svelte-11dnhem");
    			add_location(div0, file$9, 71, 3, 3965);
    			attr_dev(div1, "class", "picture block-select svelte-11dnhem");
    			set_style(div1, "background-image", "url(" + profilePicUrl + ")");
    			add_location(div1, file$9, 76, 3, 4068);
    			attr_dev(div2, "id", "BigProfilePicture");
    			attr_dev(div2, "class", "flex flex-center svelte-11dnhem");
    			add_location(div2, file$9, 70, 2, 3907);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*closeBigProfilePicture*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*bigPicBgTrans*/ ctx[8], {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*bigPicTrans*/ ctx[7], {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*bigPicBgTrans*/ ctx[8], {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*bigPicTrans*/ ctx[7], {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(70:1) {#if showBigProfilePicture}",
    		ctx
    	});

    	return block;
    }

    // (96:5) {#each professions as job, idx}
    function create_each_block_2$1(ctx) {
    	let span;
    	let t0_value = /*job*/ ctx[19] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "profession flex flex-center-y svelte-11dnhem");
    			set_style(span, "animation-delay", 50 + /*idx*/ ctx[15] * 100 + "ms");
    			add_location(span, file$9, 96, 6, 4726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(96:5) {#each professions as job, idx}",
    		ctx
    	});

    	return block;
    }

    // (103:5) {#each $GlobalStore.socialMedia as {name, url}
    function create_each_block_1$1(ctx) {
    	let a;
    	let svg;
    	let title;
    	let t0_value = /*name*/ ctx[16] + "";
    	let t0;
    	let t1;
    	let use;
    	let use_xlink_href_value;
    	let t2;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			t1 = text(" Logo");
    			use = svg_element("use");
    			t2 = space();
    			attr_dev(title, "class", "svelte-11dnhem");
    			add_location(title, file$9, 105, 8, 5145);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#LOGO_" + /*name*/ ctx[16]);
    			attr_dev(use, "class", "svelte-11dnhem");
    			add_location(use, file$9, 106, 8, 5181);
    			attr_dev(svg, "class", "logo icon-big svelte-11dnhem");
    			add_location(svg, file$9, 104, 7, 5108);
    			attr_dev(a, "href", a_href_value = /*url*/ ctx[17]);
    			attr_dev(a, "target", "_blank");
    			set_style(a, "animation-delay", 50 + /*idx*/ ctx[15] * 100 + "ms");
    			attr_dev(a, "class", "svelte-11dnhem");
    			add_location(a, file$9, 103, 6, 4993);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			append_dev(svg, use);
    			append_dev(a, t2);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$GlobalStore*/ 4 && t0_value !== (t0_value = /*name*/ ctx[16] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$GlobalStore*/ 4 && use_xlink_href_value !== (use_xlink_href_value = "#LOGO_" + /*name*/ ctx[16])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}

    			if (dirty & /*$GlobalStore*/ 4 && a_href_value !== (a_href_value = /*url*/ ctx[17])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(103:5) {#each $GlobalStore.socialMedia as {name, url}",
    		ctx
    	});

    	return block;
    }

    // (121:4) {#each Object.keys(questions) as questID, idx}
    function create_each_block$4(ctx) {
    	let li;
    	let svg;
    	let path;
    	let t0;
    	let a;
    	let span;
    	let t1_value = /*questions*/ ctx[9][/*questID*/ ctx[13]] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[12](/*questID*/ ctx[13], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			a = element("a");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(path, "d", "M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z");
    			attr_dev(path, "class", "svelte-11dnhem");
    			add_location(path, file$9, 123, 7, 5961);
    			attr_dev(svg, "class", "icon fill icon-default flex-base-size svelte-11dnhem");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 256 512");
    			add_location(svg, file$9, 122, 6, 5844);
    			attr_dev(span, "class", "svelte-11dnhem");
    			add_location(span, file$9, 132, 7, 6444);
    			attr_dev(a, "href", "#" + /*questID*/ ctx[13]);
    			attr_dev(a, "class", "question flex flex-center-y svelte-11dnhem");
    			add_location(a, file$9, 125, 6, 6260);
    			attr_dev(li, "class", "question-entry flex flex-center-y gap-1 svelte-11dnhem");
    			set_style(li, "animation-delay", 50 + /*idx*/ ctx[15] * 100 + "ms");
    			add_location(li, file$9, 121, 5, 5744);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, svg);
    			append_dev(svg, path);
    			append_dev(li, t0);
    			append_dev(li, a);
    			append_dev(a, span);
    			append_dev(span, t1);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(121:4) {#each Object.keys(questions) as questID, idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let section;
    	let svg;
    	let path0;
    	let path1;
    	let g0;
    	let path2;
    	let path3;
    	let g1;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let defs;
    	let pattern;
    	let image;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let t0;
    	let t1;
    	let div4;
    	let div3;
    	let button;
    	let img;
    	let img_src_value;
    	let t2;
    	let div2;
    	let h1;
    	let t4;
    	let div0;
    	let t5;
    	let div1;
    	let t6;
    	let p;
    	let t8;
    	let nav;
    	let ul;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*showBigProfilePicture*/ ctx[0] && create_if_block$4(ctx);
    	let each_value_2 = /*professions*/ ctx[4];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*$GlobalStore*/ ctx[2].socialMedia;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = Object.keys(/*questions*/ ctx[9]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			g1 = svg_element("g");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			defs = svg_element("defs");
    			pattern = svg_element("pattern");
    			image = svg_element("image");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			button = element("button");
    			img = element("img");
    			t2 = space();
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Daniel Sharkov";
    			t4 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t5 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();
    			p = element("p");
    			p.textContent = "Hallo! Ich bin ein FullStack Software Engineer mit Fokus auf web app Front- & Backend Systeme.\r\n\t\t\tTypeScript, Svelte, Stylus, Vue.js, Go und viele weiter Werkzeuge sind Teil meines professionellen Arsenals.\r\n\t\t\t5 Jahre Erfahrung in UX & UI Design machen mich zu einem hervorragenden vielseitigen Entwickler.";
    			t8 = space();
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(path0, "d", "M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z");
    			attr_dev(path0, "fill", "url(#paint0_linear)");
    			add_location(path0, file$9, 48, 2, 1708);
    			attr_dev(path1, "d", "M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z");
    			attr_dev(path1, "fill", "url(#pattern0)");
    			add_location(path1, file$9, 49, 2, 1951);
    			attr_dev(path2, "d", "M91.5 0C91.5 0 86.1631 7.06026 88.1214 14.9719C86.7321 6.79253 97.7283 0 97.7283 0H91.5Z");
    			attr_dev(path2, "fill", "#E1C769");
    			add_location(path2, file$9, 51, 3, 2212);
    			attr_dev(path3, "d", "M94.8513 46.0436C95.3713 44.2961 96.1324 42.4256 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304C90.2987 19.645 89.8082 18.9873 89.4106 18.3337C89.4399 18.3891 89.4697 18.4446 89.5 18.5C91.3067 21.8122 92.796 24.0364 93.9407 25.7459C96.5975 29.7138 97.3978 30.9089 96 36.5C95.1652 39.8391 94.8114 43.0208 94.8513 46.0436Z");
    			attr_dev(path3, "fill", "#E1C769");
    			add_location(path3, file$9, 52, 3, 2332);
    			attr_dev(g0, "opacity", "0.25");
    			add_location(g0, file$9, 50, 2, 2189);
    			attr_dev(path4, "d", "M95 0C95 0 83.6728 8.40057 89.1794 17.9354C83.9654 8.50155 97.7283 0 97.7283 0H95Z");
    			attr_dev(path4, "fill", "#E1C769");
    			add_location(path4, file$9, 55, 3, 2729);
    			attr_dev(path5, "d", "M128 87.8149C128 87.8149 103.765 89.4978 95.2574 82.7149C103.903 97.6885 128 87.8149 128 87.8149Z");
    			attr_dev(path5, "fill", "#E1C769");
    			add_location(path5, file$9, 56, 3, 2843);
    			attr_dev(path6, "d", "M92.6529 74.9318C92.8084 74.3456 93.0253 73.7335 93.308 73.0945C95.6407 67.8214 95.053 63.6313 94.44 59.2609C94.2624 57.9946 94.0826 56.7131 93.9712 55.3858C93.3331 57.739 92.8055 60.4069 92.5 63.5C92.0587 67.9679 92.1469 71.7458 92.6529 74.9318Z");
    			attr_dev(path6, "fill", "#E1C769");
    			add_location(path6, file$9, 57, 3, 2972);
    			attr_dev(path7, "d", "M94.8756 25.2082C93.8007 23.6916 92.4808 22.0656 90.8928 20.304C92.4505 22.0844 93.7686 23.7098 94.8756 25.2082Z");
    			attr_dev(path7, "fill", "#E1C769");
    			add_location(path7, file$9, 58, 3, 3250);
    			attr_dev(g1, "opacity", "0.75");
    			add_location(g1, file$9, 54, 2, 2706);
    			attr_dev(image, "id", "image0");
    			attr_dev(image, "width", "1024");
    			attr_dev(image, "height", "2146");
    			xlink_attr(image, "xlink:href", "code-bg.png");
    			attr_dev(image, "transform", "translate(-0.0478835) scale(0.00102516 0.000465983)");
    			add_location(image, file$9, 62, 4, 3502);
    			attr_dev(pattern, "id", "pattern0");
    			attr_dev(pattern, "patternContentUnits", "objectBoundingBox");
    			attr_dev(pattern, "width", "1");
    			attr_dev(pattern, "height", "1");
    			add_location(pattern, file$9, 61, 3, 3412);
    			add_location(stop0, file$9, 65, 4, 3785);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#403828");
    			add_location(stop1, file$9, 65, 11, 3792);
    			attr_dev(linearGradient, "id", "paint0_linear");
    			attr_dev(linearGradient, "x1", "108.668");
    			attr_dev(linearGradient, "y1", "6.1376e-07");
    			attr_dev(linearGradient, "x2", "178.511");
    			attr_dev(linearGradient, "y2", "83.6924");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient, file$9, 64, 3, 3658);
    			add_location(defs, file$9, 60, 2, 3401);
    			attr_dev(svg, "id", "LandingCodingBG");
    			attr_dev(svg, "viewBox", "0 0 128 91");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "class", "svelte-11dnhem");
    			add_location(svg, file$9, 47, 1, 1567);
    			attr_dev(img, "class", "block-select svelte-11dnhem");
    			if (img.src !== (img_src_value = profilePicUrl)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Me, Myself and I");
    			add_location(img, file$9, 90, 4, 4462);
    			attr_dev(button, "class", "picture block-select svelte-11dnhem");
    			toggle_class(button, "big-preview", /*showBigProfilePicture*/ ctx[0]);
    			add_location(button, file$9, 85, 3, 4295);
    			attr_dev(h1, "class", "name svelte-11dnhem");
    			add_location(h1, file$9, 93, 4, 4582);
    			attr_dev(div0, "class", "professions flex flex-center-y list gap-05 svelte-11dnhem");
    			add_location(div0, file$9, 94, 4, 4624);
    			attr_dev(div1, "class", "social-media flex flex-center-y gap-1 svelte-11dnhem");
    			add_location(div1, file$9, 101, 4, 4875);
    			attr_dev(div2, "class", "grid gap-05");
    			add_location(div2, file$9, 92, 3, 4551);
    			attr_dev(div3, "class", "header grid grid-center-y gap-2 svelte-11dnhem");
    			add_location(div3, file$9, 84, 2, 4245);
    			attr_dev(p, "class", "text-block svelte-11dnhem");
    			add_location(p, file$9, 113, 2, 5291);
    			attr_dev(ul, "class", "grid gap-1 question-list");
    			add_location(ul, file$9, 119, 3, 5648);
    			attr_dev(nav, "class", "svelte-11dnhem");
    			add_location(nav, file$9, 118, 2, 5638);
    			attr_dev(div4, "class", "contents grid svelte-11dnhem");
    			add_location(div4, file$9, 83, 1, 4214);
    			attr_dev(section, "id", "LandingSection");
    			attr_dev(section, "class", "svelte-11dnhem");
    			add_location(section, file$9, 46, 0, 1535);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(svg, g1);
    			append_dev(g1, path4);
    			append_dev(g1, path5);
    			append_dev(g1, path6);
    			append_dev(g1, path7);
    			append_dev(svg, defs);
    			append_dev(defs, pattern);
    			append_dev(pattern, image);
    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			append_dev(section, t0);
    			if (if_block) if_block.m(section, null);
    			append_dev(section, t1);
    			append_dev(section, div4);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			append_dev(button, img);
    			/*button_binding*/ ctx[10](button);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t4);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div2, t5);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div4, t6);
    			append_dev(div4, p);
    			append_dev(div4, t8);
    			append_dev(div4, nav);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*openBigProfilePicture*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showBigProfilePicture*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showBigProfilePicture*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(section, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*showBigProfilePicture*/ 1) {
    				toggle_class(button, "big-preview", /*showBigProfilePicture*/ ctx[0]);
    			}

    			if (dirty & /*professions*/ 16) {
    				each_value_2 = /*professions*/ ctx[4];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*$GlobalStore, vibrateLink*/ 4) {
    				each_value_1 = /*$GlobalStore*/ ctx[2].socialMedia;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*Object, questions, dispatch*/ 520) {
    				each_value = Object.keys(/*questions*/ ctx[9]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block) if_block.d();
    			/*button_binding*/ ctx[10](null);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const profilePicUrl = "me-myself-and-i.jpg";

    function instance$9($$self, $$props, $$invalidate) {
    	let $GlobalStore;
    	validate_store(GlobalStore, "GlobalStore");
    	component_subscribe($$self, GlobalStore, $$value => $$invalidate(2, $GlobalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LandingSection", slots, []);
    	const dispatch = createEventDispatcher();
    	const professions = ["Software Engineer", "FullStack WebDev", "UX & UI Designer", "Junior DevOp"];
    	let showBigProfilePicture = false;

    	const openBigProfilePicture = () => {
    		vibrate();
    		GlobalStore.lockScroll("landing_big_profile_pic");
    		$$invalidate(0, showBigProfilePicture = true);
    	};

    	const closeBigProfilePicture = () => {
    		vibrate();
    		$$invalidate(0, showBigProfilePicture = false);
    		GlobalStore.unlockScroll("landing_big_profile_pic");
    	};

    	let smallPictureEl = null;

    	const bigPicTrans = () => ({
    		duration: 600,
    		css(t) {
    			t = cubicInOut(t);
    			return `opacity: ${t};` + `transform: ` + `scale(${0.9 + 0.1 * t}) ` + `translate(-${5 - 5 * t}rem, -${1 - t}rem);`;
    		}
    	});

    	const bigPicBgTrans = () => ({
    		duration: 600,
    		css: t => `opacity: ${cubicInOut(t)}`
    	});

    	const questions = {
    		"projects": "An welchen Projekten arbeitest du oder welche hast du bereits geschaffen?",
    		"skills": "Was ist dein Programmierer-Stack? (Fertigkeiten)",
    		// 'worked-with': 'Wo hast du bereits gearbeitet?',
    		"me-myself-and-i": "Erzähl mir ein wenig über dich.",
    		"get-in-touch": "Ich würde dich gerne kontaktieren."
    	};

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LandingSection> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			smallPictureEl = $$value;
    			$$invalidate(1, smallPictureEl);
    		});
    	}

    	const click_handler = e => vibrateLink(e);

    	const click_handler_1 = (questID, e) => {
    		e.preventDefault();
    		dispatch("goToSection", questID);
    	};

    	$$self.$capture_state = () => ({
    		cubicInOut,
    		GlobalStore,
    		createEventDispatcher,
    		vibrate,
    		vibrateLink,
    		dispatch,
    		profilePicUrl,
    		professions,
    		showBigProfilePicture,
    		openBigProfilePicture,
    		closeBigProfilePicture,
    		smallPictureEl,
    		bigPicTrans,
    		bigPicBgTrans,
    		questions,
    		$GlobalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("showBigProfilePicture" in $$props) $$invalidate(0, showBigProfilePicture = $$props.showBigProfilePicture);
    		if ("smallPictureEl" in $$props) $$invalidate(1, smallPictureEl = $$props.smallPictureEl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showBigProfilePicture,
    		smallPictureEl,
    		$GlobalStore,
    		dispatch,
    		professions,
    		openBigProfilePicture,
    		closeBigProfilePicture,
    		bigPicTrans,
    		bigPicBgTrans,
    		questions,
    		button_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class LandingSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LandingSection",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\sections\AboutMeSection.svelte generated by Svelte v3.37.0 */
    const file$8 = "src\\sections\\AboutMeSection.svelte";

    function create_fragment$8(ctx) {
    	let section;
    	let div0;
    	let h1;
    	let t1;
    	let article0;
    	let h20;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let article1;
    	let h21;
    	let t9;
    	let p2;
    	let t11;
    	let p3;
    	let t13;
    	let p4;
    	let t15;
    	let div2;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t16;
    	let div1;
    	let h30;
    	let a1;
    	let t18;
    	let p5;
    	let t19;
    	let em0;
    	let t20;
    	let a2;
    	let t22;
    	let t23;
    	let div4;
    	let a3;
    	let img1;
    	let img1_src_value;
    	let t24;
    	let div3;
    	let h31;
    	let a4;
    	let t26;
    	let p6;
    	let t27;
    	let em1;
    	let t29;
    	let em2;
    	let t30;
    	let a5;
    	let t32;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Hallo, das bin ich!";
    			t1 = space();
    			article0 = element("article");
    			h20 = element("h2");
    			h20.textContent = "Designer";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Es macht mir Spaß User Experience Designes zu entwerfen und\r\n\t\t\tgibt mir dazu die Hoffnung auf bessere Anwendungen für Menschen.\r\n\t\t\tSchon oft musste ich mich, wie auch viele andere Menschen,\r\n\t\t\tdurch von Grund auf unverständlich gestalteten Anwendungen durchkämpfen,\r\n\t\t\twelche eigentlich eine Erleichterung der hauptsächlichen Arbeit sein sollen,\r\n\t\t\tjodoch zur weiteren Arbeit ausarten.\r\n\t\t\tEin tolles Gefühl ist das Lächeln eines Menschen,\r\n\t\t\tdurch eine saubere und verständliche UX Führung.";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Ein schönes User Interface darf auch nicht fehl am Platz sein,\r\n\t\t\tdamit die Stimmung entsprechend zum Thema passt.\r\n\t\t\tHandelt es sich um etwas seriöses z.B. finanzen,\r\n\t\t\tso könnte man überwiegend Grautöne nutzen.\r\n\t\t\tHandelt es sich aber z.B. um was lockeres für die Freizeit,\r\n\t\t\tso verwendet man oft hellere Designs mit viel Farbe,\r\n\t\t\tdamit es sich für die Augen sanft und heimlicher fühlt.\r\n\t\t\tDurch das ausleben der freien Kreativität,\r\n\t\t\tgefällt mir die Gestaltung verschiedenster UIs.";
    			t7 = space();
    			article1 = element("article");
    			h21 = element("h2");
    			h21.textContent = "Gamer";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "Ich mag Spiele – jeder mag Spiele. Mal kompetitiv gegen den Computer,\r\n\t\t\tmal online mit oder gegen andere Menschen oder auch mal was sehr\r\n\t\t\tentspanntes und ruhiges zum runter kommen und kreativ sein.\r\n\t\t\tSchon von Anfang an, als ich noch jünger 10 war, wusste ich,\r\n\t\t\tdass Spiele nicht nur Spaß machen, sondern auch Dinge lehren können.";
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "Ob es die Sprache ist, welches man extra zum Lernen einstellt,\r\n\t\t\tob es die Benutzeroberfläche ist, von der man sich\r\n\t\t\tfür seine UX & UI Designs inspirieren lässt,\r\n\t\t\toder ob es die blinde Interaktionskommunikation ist,\r\n\t\t\tin dem das Spiel versucht dem Spieler ohne Sprache etwas zu sagen,\r\n\t\t\tum die Immersion nich zu zerstören, dass z.B. der Spieler mit etwas interagieren kann.\r\n\t\t\tOb es die Kreativität ist, die man frei entfalten kann und Dinge ausprobiert,\r\n\t\t\tob es die Gesichte ist, die einen ebenfalls inspirieren lässt,\r\n\t\t\tdas Leben ergänzt oder auch einer sehr tiefgreifenden Metapher lehrt\r\n\t\t\tund viele mehr Gründ, was Spiele alles bieten.";
    			t13 = space();
    			p4 = element("p");
    			p4.textContent = "Spiele sind meiner Meinung nach genau der richtige Ansatz,\r\n\t\t\tum Menschen etwas auf eine spannende und interaktive Art und Weise zu lehren.\r\n\t\t\tEs gibt so viele Spiele, doch alle hier zu nennen,\r\n\t\t\tdie ich persönlich mag oder allgemein äußerst gelungen sind,\r\n\t\t\twäre ein echter Overkill. Hier einige folgende:";
    			t15 = space();
    			div2 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t16 = space();
    			div1 = element("div");
    			h30 = element("h3");
    			a1 = element("a");
    			a1.textContent = "Life is Strange";
    			t18 = space();
    			p5 = element("p");
    			t19 = text("ist ein wundervolles Meisterwerk,\r\n\t\t\t\t\twelches einem sehr tief in's Herz greif und\r\n\t\t\t\t\tzeigt was Gefühle und Emotionen überhaupt sind.\r\n\t\t\t\t\tDer Grafikstil ist passend zur Geschichte pittoresk.\r\n\t\t\t\t\t");
    			em0 = element("em");
    			t20 = text("(Da kann ich dir nur das Let's Play von Gronkh an's Herz legen: ");
    			a2 = element("a");
    			a2.textContent = "YouTube – Life is Strange Gronkh";
    			t22 = text(")");
    			t23 = space();
    			div4 = element("div");
    			a3 = element("a");
    			img1 = element("img");
    			t24 = space();
    			div3 = element("div");
    			h31 = element("h3");
    			a4 = element("a");
    			a4.textContent = "Minecraft";
    			t26 = space();
    			p6 = element("p");
    			t27 = text("ist eine Sandbox die wenig bietet,\r\n\t\t\t\t\tdoch die unendlichen Möglichkeiten einem selbst überlässt.\r\n\t\t\t\t\tOb Überleben oder Kreativ sein, oder auch beides in einem,\r\n\t\t\t\t\tob Haus, Anwesen oder Schloss und\r\n\t\t\t\t\tob in Ruhe alleine oder gemeinsam mit Freunden vereint.\r\n\t\t\t\t\tDu selbst entscheidest, welche Möglichkeiten es dir bietet,\r\n\t\t\t\t\toder auch nicht.\r\n\t\t\t\t\t");
    			em1 = element("em");
    			em1.textContent = "„Sehr viele glaubten von Anfang an,\r\n\t\t\t\t\t\tdass man das Spiel nicht Let's Playen könnte.\r\n\t\t\t\t\t\tIch tat es einfach.“";
    			t29 = text(" – Gronkh.\r\n\t\t\t\t\t");
    			em2 = element("em");
    			t30 = text("(Auch hier liegt meine Empfehlung beim Let's Play von Gronkh:\r\n\t\t\t\t\t\t");
    			a5 = element("a");
    			a5.textContent = "YouTube – Minecraft Gronkh\r\n\t\t\t\t\t\t";
    			t32 = text(")");
    			attr_dev(h1, "class", "display-3");
    			add_location(h1, file$8, 2, 2, 70);
    			attr_dev(div0, "class", "header svelte-3fotpv");
    			add_location(div0, file$8, 1, 1, 46);
    			attr_dev(h20, "class", "article-title svelte-3fotpv");
    			add_location(h20, file$8, 11, 2, 275);
    			attr_dev(p0, "class", "svelte-3fotpv");
    			add_location(p0, file$8, 12, 2, 318);
    			attr_dev(p1, "class", "svelte-3fotpv");
    			add_location(p1, file$8, 22, 2, 835);
    			attr_dev(article0, "class", "designe svelte-3fotpv");
    			add_location(article0, file$8, 10, 1, 246);
    			attr_dev(h21, "class", "article-title svelte-3fotpv");
    			add_location(h21, file$8, 36, 2, 1391);
    			attr_dev(p2, "class", "svelte-3fotpv");
    			add_location(p2, file$8, 37, 2, 1431);
    			attr_dev(p3, "class", "svelte-3fotpv");
    			add_location(p3, file$8, 44, 2, 1791);
    			attr_dev(p4, "class", "svelte-3fotpv");
    			add_location(p4, file$8, 56, 2, 2469);
    			if (img0.src !== (img0_src_value = "life_is_strange.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Life is Strange danielsharkov.com");
    			attr_dev(img0, "class", "svelte-3fotpv");
    			add_location(img0, file$8, 65, 4, 2988);
    			attr_dev(a0, "class", "image-container tilt-left svelte-3fotpv");
    			attr_dev(a0, "href", "https://lifeisstrange.square-enix-games.com/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$8, 64, 3, 2858);
    			attr_dev(a1, "class", "link svelte-3fotpv");
    			attr_dev(a1, "href", "https://lifeisstrange.square-enix-games.com/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$8, 68, 8, 3104);
    			attr_dev(h30, "class", "svelte-3fotpv");
    			add_location(h30, file$8, 68, 4, 3100);
    			attr_dev(a2, "class", "link svelte-3fotpv");
    			attr_dev(a2, "href", "https://www.youtube.com/results?search_query=gronkh+life+is+strange");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$8, 76, 73, 3512);
    			add_location(em0, file$8, 76, 5, 3444);
    			attr_dev(p5, "class", "svelte-3fotpv");
    			add_location(p5, file$8, 71, 4, 3231);
    			attr_dev(div1, "class", "content svelte-3fotpv");
    			add_location(div1, file$8, 67, 3, 3073);
    			attr_dev(div2, "class", "game-container grid grid-center grid-1 svelte-3fotpv");
    			add_location(div2, file$8, 63, 2, 2801);
    			if (img1.src !== (img1_src_value = "minecraft.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Minecraft danielsharkov.com");
    			attr_dev(img1, "class", "svelte-3fotpv");
    			add_location(img1, file$8, 82, 4, 3866);
    			attr_dev(a3, "class", "image-container tilt-right svelte-3fotpv");
    			attr_dev(a3, "href", "https://www.minecraft.net/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$8, 81, 3, 3753);
    			attr_dev(a4, "class", "link svelte-3fotpv");
    			attr_dev(a4, "href", "https://www.minecraft.net/");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$8, 85, 8, 3970);
    			attr_dev(h31, "class", "svelte-3fotpv");
    			add_location(h31, file$8, 85, 4, 3966);
    			add_location(em1, file$8, 96, 5, 4445);
    			attr_dev(a5, "class", "link svelte-3fotpv");
    			attr_dev(a5, "href", "https://www.youtube.com/results?search_query=gronkh+minecraft");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$8, 103, 6, 4683);
    			add_location(em2, file$8, 101, 5, 4602);
    			attr_dev(p6, "class", "svelte-3fotpv");
    			add_location(p6, file$8, 88, 4, 4073);
    			attr_dev(div3, "class", "content svelte-3fotpv");
    			add_location(div3, file$8, 84, 3, 3939);
    			attr_dev(div4, "class", "game-container grid grid-center grid-1 svelte-3fotpv");
    			add_location(div4, file$8, 80, 2, 3696);
    			attr_dev(article1, "class", "gamer svelte-3fotpv");
    			add_location(article1, file$8, 35, 1, 1364);
    			attr_dev(section, "id", "me-myself-and-i");
    			attr_dev(section, "class", "grid svelte-3fotpv");
    			add_location(section, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h1);
    			append_dev(section, t1);
    			append_dev(section, article0);
    			append_dev(article0, h20);
    			append_dev(article0, t3);
    			append_dev(article0, p0);
    			append_dev(article0, t5);
    			append_dev(article0, p1);
    			append_dev(section, t7);
    			append_dev(section, article1);
    			append_dev(article1, h21);
    			append_dev(article1, t9);
    			append_dev(article1, p2);
    			append_dev(article1, t11);
    			append_dev(article1, p3);
    			append_dev(article1, t13);
    			append_dev(article1, p4);
    			append_dev(article1, t15);
    			append_dev(article1, div2);
    			append_dev(div2, a0);
    			append_dev(a0, img0);
    			append_dev(div2, t16);
    			append_dev(div2, div1);
    			append_dev(div1, h30);
    			append_dev(h30, a1);
    			append_dev(div1, t18);
    			append_dev(div1, p5);
    			append_dev(p5, t19);
    			append_dev(p5, em0);
    			append_dev(em0, t20);
    			append_dev(em0, a2);
    			append_dev(em0, t22);
    			append_dev(article1, t23);
    			append_dev(article1, div4);
    			append_dev(div4, a3);
    			append_dev(a3, img1);
    			append_dev(div4, t24);
    			append_dev(div4, div3);
    			append_dev(div3, h31);
    			append_dev(h31, a4);
    			append_dev(div3, t26);
    			append_dev(div3, p6);
    			append_dev(p6, t27);
    			append_dev(p6, em1);
    			append_dev(p6, t29);
    			append_dev(p6, em2);
    			append_dev(em2, t30);
    			append_dev(em2, a5);
    			append_dev(em2, t32);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", vibrate, false, false, false),
    					listen_dev(a3, "click", vibrate, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AboutMeSection", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AboutMeSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ vibrate });
    	return [];
    }

    class AboutMeSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutMeSection",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2021, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */

    var marked = createCommonjsModule(function (module, exports) {
    /**
     * DO NOT EDIT THIS FILE
     * The code in this file is generated from files in ./src/
     */

    (function (global, factory) {
      module.exports = factory() ;
    }(commonjsGlobal, (function () {
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
      }

      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }

      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;

        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

        return arr2;
      }

      function _createForOfIteratorHelperLoose(o, allowArrayLike) {
        var it;

        if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
          if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            return function () {
              if (i >= o.length) return {
                done: true
              };
              return {
                done: false,
                value: o[i++]
              };
            };
          }

          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }

        it = o[Symbol.iterator]();
        return it.next.bind(it);
      }

      function createCommonjsModule(fn) {
        var module = { exports: {} };
      	return fn(module, module.exports), module.exports;
      }

      var defaults$5 = createCommonjsModule(function (module) {
        function getDefaults() {
          return {
            baseUrl: null,
            breaks: false,
            gfm: true,
            headerIds: true,
            headerPrefix: '',
            highlight: null,
            langPrefix: 'language-',
            mangle: true,
            pedantic: false,
            renderer: null,
            sanitize: false,
            sanitizer: null,
            silent: false,
            smartLists: false,
            smartypants: false,
            tokenizer: null,
            walkTokens: null,
            xhtml: false
          };
        }

        function changeDefaults(newDefaults) {
          module.exports.defaults = newDefaults;
        }

        module.exports = {
          defaults: getDefaults(),
          getDefaults: getDefaults,
          changeDefaults: changeDefaults
        };
      });

      /**
       * Helpers
       */
      var escapeTest = /[&<>"']/;
      var escapeReplace = /[&<>"']/g;
      var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
      var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
      var escapeReplacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      var getEscapeReplacement = function getEscapeReplacement(ch) {
        return escapeReplacements[ch];
      };

      function escape$2(html, encode) {
        if (encode) {
          if (escapeTest.test(html)) {
            return html.replace(escapeReplace, getEscapeReplacement);
          }
        } else {
          if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
          }
        }

        return html;
      }

      var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

      function unescape$1(html) {
        // explicitly match decimal, hex, and named HTML entities
        return html.replace(unescapeTest, function (_, n) {
          n = n.toLowerCase();
          if (n === 'colon') return ':';

          if (n.charAt(0) === '#') {
            return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
          }

          return '';
        });
      }

      var caret = /(^|[^\[])\^/g;

      function edit$1(regex, opt) {
        regex = regex.source || regex;
        opt = opt || '';
        var obj = {
          replace: function replace(name, val) {
            val = val.source || val;
            val = val.replace(caret, '$1');
            regex = regex.replace(name, val);
            return obj;
          },
          getRegex: function getRegex() {
            return new RegExp(regex, opt);
          }
        };
        return obj;
      }

      var nonWordAndColonTest = /[^\w:]/g;
      var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

      function cleanUrl$1(sanitize, base, href) {
        if (sanitize) {
          var prot;

          try {
            prot = decodeURIComponent(unescape$1(href)).replace(nonWordAndColonTest, '').toLowerCase();
          } catch (e) {
            return null;
          }

          if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
            return null;
          }
        }

        if (base && !originIndependentUrl.test(href)) {
          href = resolveUrl(base, href);
        }

        try {
          href = encodeURI(href).replace(/%25/g, '%');
        } catch (e) {
          return null;
        }

        return href;
      }

      var baseUrls = {};
      var justDomain = /^[^:]+:\/*[^/]*$/;
      var protocol = /^([^:]+:)[\s\S]*$/;
      var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

      function resolveUrl(base, href) {
        if (!baseUrls[' ' + base]) {
          // we can ignore everything in base after the last slash of its path component,
          // but we might need to add _that_
          // https://tools.ietf.org/html/rfc3986#section-3
          if (justDomain.test(base)) {
            baseUrls[' ' + base] = base + '/';
          } else {
            baseUrls[' ' + base] = rtrim$1(base, '/', true);
          }
        }

        base = baseUrls[' ' + base];
        var relativeBase = base.indexOf(':') === -1;

        if (href.substring(0, 2) === '//') {
          if (relativeBase) {
            return href;
          }

          return base.replace(protocol, '$1') + href;
        } else if (href.charAt(0) === '/') {
          if (relativeBase) {
            return href;
          }

          return base.replace(domain, '$1') + href;
        } else {
          return base + href;
        }
      }

      var noopTest$1 = {
        exec: function noopTest() {}
      };

      function merge$2(obj) {
        var i = 1,
            target,
            key;

        for (; i < arguments.length; i++) {
          target = arguments[i];

          for (key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
              obj[key] = target[key];
            }
          }
        }

        return obj;
      }

      function splitCells$1(tableRow, count) {
        // ensure that every cell-delimiting pipe has a space
        // before it to distinguish it from an escaped pipe
        var row = tableRow.replace(/\|/g, function (match, offset, str) {
          var escaped = false,
              curr = offset;

          while (--curr >= 0 && str[curr] === '\\') {
            escaped = !escaped;
          }

          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
            cells = row.split(/ \|/);
        var i = 0;

        if (cells.length > count) {
          cells.splice(count);
        } else {
          while (cells.length < count) {
            cells.push('');
          }
        }

        for (; i < cells.length; i++) {
          // leading or trailing whitespace is ignored per the gfm spec
          cells[i] = cells[i].trim().replace(/\\\|/g, '|');
        }

        return cells;
      } // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
      // /c*$/ is vulnerable to REDOS.
      // invert: Remove suffix of non-c chars instead. Default falsey.


      function rtrim$1(str, c, invert) {
        var l = str.length;

        if (l === 0) {
          return '';
        } // Length of suffix matching the invert condition.


        var suffLen = 0; // Step left until we fail to match the invert condition.

        while (suffLen < l) {
          var currChar = str.charAt(l - suffLen - 1);

          if (currChar === c && !invert) {
            suffLen++;
          } else if (currChar !== c && invert) {
            suffLen++;
          } else {
            break;
          }
        }

        return str.substr(0, l - suffLen);
      }

      function findClosingBracket$1(str, b) {
        if (str.indexOf(b[1]) === -1) {
          return -1;
        }

        var l = str.length;
        var level = 0,
            i = 0;

        for (; i < l; i++) {
          if (str[i] === '\\') {
            i++;
          } else if (str[i] === b[0]) {
            level++;
          } else if (str[i] === b[1]) {
            level--;

            if (level < 0) {
              return i;
            }
          }
        }

        return -1;
      }

      function checkSanitizeDeprecation$1(opt) {
        if (opt && opt.sanitize && !opt.silent) {
          console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
        }
      } // copied from https://stackoverflow.com/a/5450113/806777


      function repeatString$1(pattern, count) {
        if (count < 1) {
          return '';
        }

        var result = '';

        while (count > 1) {
          if (count & 1) {
            result += pattern;
          }

          count >>= 1;
          pattern += pattern;
        }

        return result + pattern;
      }

      var helpers = {
        escape: escape$2,
        unescape: unescape$1,
        edit: edit$1,
        cleanUrl: cleanUrl$1,
        resolveUrl: resolveUrl,
        noopTest: noopTest$1,
        merge: merge$2,
        splitCells: splitCells$1,
        rtrim: rtrim$1,
        findClosingBracket: findClosingBracket$1,
        checkSanitizeDeprecation: checkSanitizeDeprecation$1,
        repeatString: repeatString$1
      };

      var defaults$4 = defaults$5.defaults;
      var rtrim = helpers.rtrim,
          splitCells = helpers.splitCells,
          _escape = helpers.escape,
          findClosingBracket = helpers.findClosingBracket;

      function outputLink(cap, link, raw) {
        var href = link.href;
        var title = link.title ? _escape(link.title) : null;
        var text = cap[1].replace(/\\([\[\]])/g, '$1');

        if (cap[0].charAt(0) !== '!') {
          return {
            type: 'link',
            raw: raw,
            href: href,
            title: title,
            text: text
          };
        } else {
          return {
            type: 'image',
            raw: raw,
            href: href,
            title: title,
            text: _escape(text)
          };
        }
      }

      function indentCodeCompensation(raw, text) {
        var matchIndentToCode = raw.match(/^(\s+)(?:```)/);

        if (matchIndentToCode === null) {
          return text;
        }

        var indentToCode = matchIndentToCode[1];
        return text.split('\n').map(function (node) {
          var matchIndentInNode = node.match(/^\s+/);

          if (matchIndentInNode === null) {
            return node;
          }

          var indentInNode = matchIndentInNode[0];

          if (indentInNode.length >= indentToCode.length) {
            return node.slice(indentToCode.length);
          }

          return node;
        }).join('\n');
      }
      /**
       * Tokenizer
       */


      var Tokenizer_1 = /*#__PURE__*/function () {
        function Tokenizer(options) {
          this.options = options || defaults$4;
        }

        var _proto = Tokenizer.prototype;

        _proto.space = function space(src) {
          var cap = this.rules.block.newline.exec(src);

          if (cap) {
            if (cap[0].length > 1) {
              return {
                type: 'space',
                raw: cap[0]
              };
            }

            return {
              raw: '\n'
            };
          }
        };

        _proto.code = function code(src) {
          var cap = this.rules.block.code.exec(src);

          if (cap) {
            var text = cap[0].replace(/^ {1,4}/gm, '');
            return {
              type: 'code',
              raw: cap[0],
              codeBlockStyle: 'indented',
              text: !this.options.pedantic ? rtrim(text, '\n') : text
            };
          }
        };

        _proto.fences = function fences(src) {
          var cap = this.rules.block.fences.exec(src);

          if (cap) {
            var raw = cap[0];
            var text = indentCodeCompensation(raw, cap[3] || '');
            return {
              type: 'code',
              raw: raw,
              lang: cap[2] ? cap[2].trim() : cap[2],
              text: text
            };
          }
        };

        _proto.heading = function heading(src) {
          var cap = this.rules.block.heading.exec(src);

          if (cap) {
            var text = cap[2].trim(); // remove trailing #s

            if (/#$/.test(text)) {
              var trimmed = rtrim(text, '#');

              if (this.options.pedantic) {
                text = trimmed.trim();
              } else if (!trimmed || / $/.test(trimmed)) {
                // CommonMark requires space before trailing #s
                text = trimmed.trim();
              }
            }

            return {
              type: 'heading',
              raw: cap[0],
              depth: cap[1].length,
              text: text
            };
          }
        };

        _proto.nptable = function nptable(src) {
          var cap = this.rules.block.nptable.exec(src);

          if (cap) {
            var item = {
              type: 'table',
              header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : [],
              raw: cap[0]
            };

            if (item.header.length === item.align.length) {
              var l = item.align.length;
              var i;

              for (i = 0; i < l; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              l = item.cells.length;

              for (i = 0; i < l; i++) {
                item.cells[i] = splitCells(item.cells[i], item.header.length);
              }

              return item;
            }
          }
        };

        _proto.hr = function hr(src) {
          var cap = this.rules.block.hr.exec(src);

          if (cap) {
            return {
              type: 'hr',
              raw: cap[0]
            };
          }
        };

        _proto.blockquote = function blockquote(src) {
          var cap = this.rules.block.blockquote.exec(src);

          if (cap) {
            var text = cap[0].replace(/^ *> ?/gm, '');
            return {
              type: 'blockquote',
              raw: cap[0],
              text: text
            };
          }
        };

        _proto.list = function list(src) {
          var cap = this.rules.block.list.exec(src);

          if (cap) {
            var raw = cap[0];
            var bull = cap[2];
            var isordered = bull.length > 1;
            var list = {
              type: 'list',
              raw: raw,
              ordered: isordered,
              start: isordered ? +bull.slice(0, -1) : '',
              loose: false,
              items: []
            }; // Get each top-level item.

            var itemMatch = cap[0].match(this.rules.block.item);
            var next = false,
                item,
                space,
                bcurr,
                bnext,
                addBack,
                loose,
                istask,
                ischecked,
                endMatch;
            var l = itemMatch.length;
            bcurr = this.rules.block.listItemStart.exec(itemMatch[0]);

            for (var i = 0; i < l; i++) {
              item = itemMatch[i];
              raw = item;

              if (!this.options.pedantic) {
                // Determine if current item contains the end of the list
                endMatch = item.match(new RegExp('\\n\\s*\\n {0,' + (bcurr[0].length - 1) + '}\\S'));

                if (endMatch) {
                  addBack = item.length - endMatch.index + itemMatch.slice(i + 1).join('\n').length;
                  list.raw = list.raw.substring(0, list.raw.length - addBack);
                  item = item.substring(0, endMatch.index);
                  raw = item;
                  l = i + 1;
                }
              } // Determine whether the next list item belongs here.
              // Backpedal if it does not belong in this list.


              if (i !== l - 1) {
                bnext = this.rules.block.listItemStart.exec(itemMatch[i + 1]);

                if (!this.options.pedantic ? bnext[1].length >= bcurr[0].length || bnext[1].length > 3 : bnext[1].length > bcurr[1].length) {
                  // nested list or continuation
                  itemMatch.splice(i, 2, itemMatch[i] + (!this.options.pedantic && bnext[1].length < bcurr[0].length && !itemMatch[i].match(/\n$/) ? '' : '\n') + itemMatch[i + 1]);
                  i--;
                  l--;
                  continue;
                } else if ( // different bullet style
                !this.options.pedantic || this.options.smartLists ? bnext[2][bnext[2].length - 1] !== bull[bull.length - 1] : isordered === (bnext[2].length === 1)) {
                  addBack = itemMatch.slice(i + 1).join('\n').length;
                  list.raw = list.raw.substring(0, list.raw.length - addBack);
                  i = l - 1;
                }

                bcurr = bnext;
              } // Remove the list item's bullet
              // so it is seen as the next token.


              space = item.length;
              item = item.replace(/^ *([*+-]|\d+[.)]) ?/, ''); // Outdent whatever the
              // list item contains. Hacky.

              if (~item.indexOf('\n ')) {
                space -= item.length;
                item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
              } // trim item newlines at end


              item = rtrim(item, '\n');

              if (i !== l - 1) {
                raw = raw + '\n';
              } // Determine whether item is loose or not.
              // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
              // for discount behavior.


              loose = next || /\n\n(?!\s*$)/.test(raw);

              if (i !== l - 1) {
                next = raw.slice(-2) === '\n\n';
                if (!loose) loose = next;
              }

              if (loose) {
                list.loose = true;
              } // Check for task list items


              if (this.options.gfm) {
                istask = /^\[[ xX]\] /.test(item);
                ischecked = undefined;

                if (istask) {
                  ischecked = item[1] !== ' ';
                  item = item.replace(/^\[[ xX]\] +/, '');
                }
              }

              list.items.push({
                type: 'list_item',
                raw: raw,
                task: istask,
                checked: ischecked,
                loose: loose,
                text: item
              });
            }

            return list;
          }
        };

        _proto.html = function html(src) {
          var cap = this.rules.block.html.exec(src);

          if (cap) {
            return {
              type: this.options.sanitize ? 'paragraph' : 'html',
              raw: cap[0],
              pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
              text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
            };
          }
        };

        _proto.def = function def(src) {
          var cap = this.rules.block.def.exec(src);

          if (cap) {
            if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
            var tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
            return {
              type: 'def',
              tag: tag,
              raw: cap[0],
              href: cap[2],
              title: cap[3]
            };
          }
        };

        _proto.table = function table(src) {
          var cap = this.rules.block.table.exec(src);

          if (cap) {
            var item = {
              type: 'table',
              header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            };

            if (item.header.length === item.align.length) {
              item.raw = cap[0];
              var l = item.align.length;
              var i;

              for (i = 0; i < l; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              l = item.cells.length;

              for (i = 0; i < l; i++) {
                item.cells[i] = splitCells(item.cells[i].replace(/^ *\| *| *\| *$/g, ''), item.header.length);
              }

              return item;
            }
          }
        };

        _proto.lheading = function lheading(src) {
          var cap = this.rules.block.lheading.exec(src);

          if (cap) {
            return {
              type: 'heading',
              raw: cap[0],
              depth: cap[2].charAt(0) === '=' ? 1 : 2,
              text: cap[1]
            };
          }
        };

        _proto.paragraph = function paragraph(src) {
          var cap = this.rules.block.paragraph.exec(src);

          if (cap) {
            return {
              type: 'paragraph',
              raw: cap[0],
              text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
            };
          }
        };

        _proto.text = function text(src) {
          var cap = this.rules.block.text.exec(src);

          if (cap) {
            return {
              type: 'text',
              raw: cap[0],
              text: cap[0]
            };
          }
        };

        _proto.escape = function escape(src) {
          var cap = this.rules.inline.escape.exec(src);

          if (cap) {
            return {
              type: 'escape',
              raw: cap[0],
              text: _escape(cap[1])
            };
          }
        };

        _proto.tag = function tag(src, inLink, inRawBlock) {
          var cap = this.rules.inline.tag.exec(src);

          if (cap) {
            if (!inLink && /^<a /i.test(cap[0])) {
              inLink = true;
            } else if (inLink && /^<\/a>/i.test(cap[0])) {
              inLink = false;
            }

            if (!inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              inRawBlock = true;
            } else if (inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              inRawBlock = false;
            }

            return {
              type: this.options.sanitize ? 'text' : 'html',
              raw: cap[0],
              inLink: inLink,
              inRawBlock: inRawBlock,
              text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
            };
          }
        };

        _proto.link = function link(src) {
          var cap = this.rules.inline.link.exec(src);

          if (cap) {
            var trimmedUrl = cap[2].trim();

            if (!this.options.pedantic && /^</.test(trimmedUrl)) {
              // commonmark requires matching angle brackets
              if (!/>$/.test(trimmedUrl)) {
                return;
              } // ending angle bracket cannot be escaped


              var rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');

              if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
                return;
              }
            } else {
              // find closing parenthesis
              var lastParenIndex = findClosingBracket(cap[2], '()');

              if (lastParenIndex > -1) {
                var start = cap[0].indexOf('!') === 0 ? 5 : 4;
                var linkLen = start + cap[1].length + lastParenIndex;
                cap[2] = cap[2].substring(0, lastParenIndex);
                cap[0] = cap[0].substring(0, linkLen).trim();
                cap[3] = '';
              }
            }

            var href = cap[2];
            var title = '';

            if (this.options.pedantic) {
              // split pedantic href and title
              var link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

              if (link) {
                href = link[1];
                title = link[3];
              }
            } else {
              title = cap[3] ? cap[3].slice(1, -1) : '';
            }

            href = href.trim();

            if (/^</.test(href)) {
              if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
                // pedantic allows starting angle bracket without ending angle bracket
                href = href.slice(1);
              } else {
                href = href.slice(1, -1);
              }
            }

            return outputLink(cap, {
              href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
              title: title ? title.replace(this.rules.inline._escapes, '$1') : title
            }, cap[0]);
          }
        };

        _proto.reflink = function reflink(src, links) {
          var cap;

          if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
            var link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
            link = links[link.toLowerCase()];

            if (!link || !link.href) {
              var text = cap[0].charAt(0);
              return {
                type: 'text',
                raw: text,
                text: text
              };
            }

            return outputLink(cap, link, cap[0]);
          }
        };

        _proto.emStrong = function emStrong(src, maskedSrc, prevChar) {
          if (prevChar === void 0) {
            prevChar = '';
          }

          var match = this.rules.inline.emStrong.lDelim.exec(src);
          if (!match) return;
          if (match[3] && prevChar.match(/(?:[0-9A-Za-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])/)) return; // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well

          var nextChar = match[1] || match[2] || '';

          if (!nextChar || nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar))) {
            var lLength = match[0].length - 1;
            var rDelim,
                rLength,
                delimTotal = lLength,
                midDelimTotal = 0;
            var endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
            endReg.lastIndex = 0;
            maskedSrc = maskedSrc.slice(-1 * src.length + lLength); // Bump maskedSrc to same section of string as src (move to lexer?)

            while ((match = endReg.exec(maskedSrc)) != null) {
              rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
              if (!rDelim) continue; // matched the first alternative in rules.js (skip the * in __abc*abc__)

              rLength = rDelim.length;

              if (match[3] || match[4]) {
                // found another Left Delim
                delimTotal += rLength;
                continue;
              } else if (match[5] || match[6]) {
                // either Left or Right Delim
                if (lLength % 3 && !((lLength + rLength) % 3)) {
                  midDelimTotal += rLength;
                  continue; // CommonMark Emphasis Rules 9-10
                }
              }

              delimTotal -= rLength;
              if (delimTotal > 0) continue; // Haven't found enough closing delimiters
              // If this is the last rDelimiter, remove extra characters. *a*** -> *a*

              if (delimTotal + midDelimTotal - rLength <= 0 && !maskedSrc.slice(endReg.lastIndex).match(endReg)) {
                rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
              }

              if (Math.min(lLength, rLength) % 2) {
                return {
                  type: 'em',
                  raw: src.slice(0, lLength + match.index + rLength + 1),
                  text: src.slice(1, lLength + match.index + rLength)
                };
              }

              if (Math.min(lLength, rLength) % 2 === 0) {
                return {
                  type: 'strong',
                  raw: src.slice(0, lLength + match.index + rLength + 1),
                  text: src.slice(2, lLength + match.index + rLength - 1)
                };
              }
            }
          }
        };

        _proto.codespan = function codespan(src) {
          var cap = this.rules.inline.code.exec(src);

          if (cap) {
            var text = cap[2].replace(/\n/g, ' ');
            var hasNonSpaceChars = /[^ ]/.test(text);
            var hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);

            if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
              text = text.substring(1, text.length - 1);
            }

            text = _escape(text, true);
            return {
              type: 'codespan',
              raw: cap[0],
              text: text
            };
          }
        };

        _proto.br = function br(src) {
          var cap = this.rules.inline.br.exec(src);

          if (cap) {
            return {
              type: 'br',
              raw: cap[0]
            };
          }
        };

        _proto.del = function del(src) {
          var cap = this.rules.inline.del.exec(src);

          if (cap) {
            return {
              type: 'del',
              raw: cap[0],
              text: cap[2]
            };
          }
        };

        _proto.autolink = function autolink(src, mangle) {
          var cap = this.rules.inline.autolink.exec(src);

          if (cap) {
            var text, href;

            if (cap[2] === '@') {
              text = _escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
              href = 'mailto:' + text;
            } else {
              text = _escape(cap[1]);
              href = text;
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.url = function url(src, mangle) {
          var cap;

          if (cap = this.rules.inline.url.exec(src)) {
            var text, href;

            if (cap[2] === '@') {
              text = _escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
              href = 'mailto:' + text;
            } else {
              // do extended autolink path validation
              var prevCapZero;

              do {
                prevCapZero = cap[0];
                cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
              } while (prevCapZero !== cap[0]);

              text = _escape(cap[0]);

              if (cap[1] === 'www.') {
                href = 'http://' + text;
              } else {
                href = text;
              }
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.inlineText = function inlineText(src, inRawBlock, smartypants) {
          var cap = this.rules.inline.text.exec(src);

          if (cap) {
            var text;

            if (inRawBlock) {
              text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0];
            } else {
              text = _escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
            }

            return {
              type: 'text',
              raw: cap[0],
              text: text
            };
          }
        };

        return Tokenizer;
      }();

      var noopTest = helpers.noopTest,
          edit = helpers.edit,
          merge$1 = helpers.merge;
      /**
       * Block-Level Grammar
       */

      var block$1 = {
        newline: /^(?: *(?:\n|$))+/,
        code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
        fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
        hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
        heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
        blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
        list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?! {0,3}bull )\n*|\s*$)/,
        html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
        + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
        + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
        + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
        + ')',
        def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
        nptable: noopTest,
        table: noopTest,
        lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
        // regex template, placeholders will be replaced according to different paragraph
        // interruption rules of commonmark and the original markdown spec:
        _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html| +\n)[^\n]+)*)/,
        text: /^[^\n]+/
      };
      block$1._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
      block$1._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
      block$1.def = edit(block$1.def).replace('label', block$1._label).replace('title', block$1._title).getRegex();
      block$1.bullet = /(?:[*+-]|\d{1,9}[.)])/;
      block$1.item = /^( *)(bull) ?[^\n]*(?:\n(?! *bull ?)[^\n]*)*/;
      block$1.item = edit(block$1.item, 'gm').replace(/bull/g, block$1.bullet).getRegex();
      block$1.listItemStart = edit(/^( *)(bull) */).replace('bull', block$1.bullet).getRegex();
      block$1.list = edit(block$1.list).replace(/bull/g, block$1.bullet).replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))').replace('def', '\\n+(?=' + block$1.def.source + ')').getRegex();
      block$1._tag = 'address|article|aside|base|basefont|blockquote|body|caption' + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' + '|track|ul';
      block$1._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
      block$1.html = edit(block$1.html, 'i').replace('comment', block$1._comment).replace('tag', block$1._tag).replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
      block$1.paragraph = edit(block$1._paragraph).replace('hr', block$1.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block$1._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();
      block$1.blockquote = edit(block$1.blockquote).replace('paragraph', block$1.paragraph).getRegex();
      /**
       * Normal Block Grammar
       */

      block$1.normal = merge$1({}, block$1);
      /**
       * GFM Block Grammar
       */

      block$1.gfm = merge$1({}, block$1.normal, {
        nptable: '^ *([^|\\n ].*\\|.*)\\n' // Header
        + ' {0,3}([-:]+ *\\|[-| :]*)' // Align
        + '(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)',
        // Cells
        table: '^ *\\|(.+)\\n' // Header
        + ' {0,3}\\|?( *[-:]+[-| :]*)' // Align
        + '(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells

      });
      block$1.gfm.nptable = edit(block$1.gfm.nptable).replace('hr', block$1.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block$1._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
      block$1.gfm.table = edit(block$1.gfm.table).replace('hr', block$1.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block$1._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
      /**
       * Pedantic grammar (original John Gruber's loose markdown specification)
       */

      block$1.pedantic = merge$1({}, block$1.normal, {
        html: edit('^ *(?:comment *(?:\\n|\\s*$)' + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))').replace('comment', block$1._comment).replace(/tag/g, '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b').getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^(#{1,6})(.*)(?:\n+|$)/,
        fences: noopTest,
        // fences not supported
        paragraph: edit(block$1.normal._paragraph).replace('hr', block$1.hr).replace('heading', ' *#{1,6} *[^\n]').replace('lheading', block$1.lheading).replace('blockquote', ' {0,3}>').replace('|fences', '').replace('|list', '').replace('|html', '').getRegex()
      });
      /**
       * Inline-Level Grammar
       */

      var inline$1 = {
        escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
        autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
        url: noopTest,
        tag: '^comment' + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>',
        // CDATA section
        link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
        reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
        nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
        reflinkSearch: 'reflink|nolink(?!\\()',
        emStrong: {
          lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
          //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
          //        () Skip other delimiter (1) #***                (2) a***#, a***                   (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
          rDelimAst: /\_\_[^_]*?\*[^_]*?\_\_|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
          rDelimUnd: /\*\*[^*]*?\_[^*]*?\*\*|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _

        },
        code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
        br: /^( {2,}|\\)\n(?!\s*$)/,
        del: noopTest,
        text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
        punctuation: /^([\spunctuation])/
      }; // list of punctuation marks from CommonMark spec
      // without * and _ to handle the different emphasis markers * and _

      inline$1._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
      inline$1.punctuation = edit(inline$1.punctuation).replace(/punctuation/g, inline$1._punctuation).getRegex(); // sequences em should skip over [title](link), `code`, <html>

      inline$1.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
      inline$1.escapedEmSt = /\\\*|\\_/g;
      inline$1._comment = edit(block$1._comment).replace('(?:-->|$)', '-->').getRegex();
      inline$1.emStrong.lDelim = edit(inline$1.emStrong.lDelim).replace(/punct/g, inline$1._punctuation).getRegex();
      inline$1.emStrong.rDelimAst = edit(inline$1.emStrong.rDelimAst, 'g').replace(/punct/g, inline$1._punctuation).getRegex();
      inline$1.emStrong.rDelimUnd = edit(inline$1.emStrong.rDelimUnd, 'g').replace(/punct/g, inline$1._punctuation).getRegex();
      inline$1._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
      inline$1._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
      inline$1._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
      inline$1.autolink = edit(inline$1.autolink).replace('scheme', inline$1._scheme).replace('email', inline$1._email).getRegex();
      inline$1._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
      inline$1.tag = edit(inline$1.tag).replace('comment', inline$1._comment).replace('attribute', inline$1._attribute).getRegex();
      inline$1._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
      inline$1._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
      inline$1._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
      inline$1.link = edit(inline$1.link).replace('label', inline$1._label).replace('href', inline$1._href).replace('title', inline$1._title).getRegex();
      inline$1.reflink = edit(inline$1.reflink).replace('label', inline$1._label).getRegex();
      inline$1.reflinkSearch = edit(inline$1.reflinkSearch, 'g').replace('reflink', inline$1.reflink).replace('nolink', inline$1.nolink).getRegex();
      /**
       * Normal Inline Grammar
       */

      inline$1.normal = merge$1({}, inline$1);
      /**
       * Pedantic Inline Grammar
       */

      inline$1.pedantic = merge$1({}, inline$1.normal, {
        strong: {
          start: /^__|\*\*/,
          middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
          endAst: /\*\*(?!\*)/g,
          endUnd: /__(?!_)/g
        },
        em: {
          start: /^_|\*/,
          middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
          endAst: /\*(?!\*)/g,
          endUnd: /_(?!_)/g
        },
        link: edit(/^!?\[(label)\]\((.*?)\)/).replace('label', inline$1._label).getRegex(),
        reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace('label', inline$1._label).getRegex()
      });
      /**
       * GFM Inline Grammar
       */

      inline$1.gfm = merge$1({}, inline$1.normal, {
        escape: edit(inline$1.escape).replace('])', '~|])').getRegex(),
        _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
        url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
        _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
        del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
        text: /^([`~]+|[^`~])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
      });
      inline$1.gfm.url = edit(inline$1.gfm.url, 'i').replace('email', inline$1.gfm._extended_email).getRegex();
      /**
       * GFM + Line Breaks Inline Grammar
       */

      inline$1.breaks = merge$1({}, inline$1.gfm, {
        br: edit(inline$1.br).replace('{2,}', '*').getRegex(),
        text: edit(inline$1.gfm.text).replace('\\b_', '\\b_| {2,}\\n').replace(/\{2,\}/g, '*').getRegex()
      });
      var rules = {
        block: block$1,
        inline: inline$1
      };

      var defaults$3 = defaults$5.defaults;
      var block = rules.block,
          inline = rules.inline;
      var repeatString = helpers.repeatString;
      /**
       * smartypants text replacement
       */

      function smartypants(text) {
        return text // em-dashes
        .replace(/---/g, "\u2014") // en-dashes
        .replace(/--/g, "\u2013") // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018") // closing singles & apostrophes
        .replace(/'/g, "\u2019") // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C") // closing doubles
        .replace(/"/g, "\u201D") // ellipses
        .replace(/\.{3}/g, "\u2026");
      }
      /**
       * mangle email addresses
       */


      function mangle(text) {
        var out = '',
            i,
            ch;
        var l = text.length;

        for (i = 0; i < l; i++) {
          ch = text.charCodeAt(i);

          if (Math.random() > 0.5) {
            ch = 'x' + ch.toString(16);
          }

          out += '&#' + ch + ';';
        }

        return out;
      }
      /**
       * Block Lexer
       */


      var Lexer_1 = /*#__PURE__*/function () {
        function Lexer(options) {
          this.tokens = [];
          this.tokens.links = Object.create(null);
          this.options = options || defaults$3;
          this.options.tokenizer = this.options.tokenizer || new Tokenizer_1();
          this.tokenizer = this.options.tokenizer;
          this.tokenizer.options = this.options;
          var rules = {
            block: block.normal,
            inline: inline.normal
          };

          if (this.options.pedantic) {
            rules.block = block.pedantic;
            rules.inline = inline.pedantic;
          } else if (this.options.gfm) {
            rules.block = block.gfm;

            if (this.options.breaks) {
              rules.inline = inline.breaks;
            } else {
              rules.inline = inline.gfm;
            }
          }

          this.tokenizer.rules = rules;
        }
        /**
         * Expose Rules
         */


        /**
         * Static Lex Method
         */
        Lexer.lex = function lex(src, options) {
          var lexer = new Lexer(options);
          return lexer.lex(src);
        }
        /**
         * Static Lex Inline Method
         */
        ;

        Lexer.lexInline = function lexInline(src, options) {
          var lexer = new Lexer(options);
          return lexer.inlineTokens(src);
        }
        /**
         * Preprocessing
         */
        ;

        var _proto = Lexer.prototype;

        _proto.lex = function lex(src) {
          src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ');
          this.blockTokens(src, this.tokens, true);
          this.inline(this.tokens);
          return this.tokens;
        }
        /**
         * Lexing
         */
        ;

        _proto.blockTokens = function blockTokens(src, tokens, top) {
          if (tokens === void 0) {
            tokens = [];
          }

          if (top === void 0) {
            top = true;
          }

          if (this.options.pedantic) {
            src = src.replace(/^ +$/gm, '');
          }

          var token, i, l, lastToken;

          while (src) {
            // newline
            if (token = this.tokenizer.space(src)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              }

              continue;
            } // code


            if (token = this.tokenizer.code(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1]; // An indented code block cannot interrupt a paragraph.

              if (lastToken && lastToken.type === 'paragraph') {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
              } else {
                tokens.push(token);
              }

              continue;
            } // fences


            if (token = this.tokenizer.fences(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // heading


            if (token = this.tokenizer.heading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // table no leading pipe (gfm)


            if (token = this.tokenizer.nptable(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // hr


            if (token = this.tokenizer.hr(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // blockquote


            if (token = this.tokenizer.blockquote(src)) {
              src = src.substring(token.raw.length);
              token.tokens = this.blockTokens(token.text, [], top);
              tokens.push(token);
              continue;
            } // list


            if (token = this.tokenizer.list(src)) {
              src = src.substring(token.raw.length);
              l = token.items.length;

              for (i = 0; i < l; i++) {
                token.items[i].tokens = this.blockTokens(token.items[i].text, [], false);
              }

              tokens.push(token);
              continue;
            } // html


            if (token = this.tokenizer.html(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // def


            if (top && (token = this.tokenizer.def(src))) {
              src = src.substring(token.raw.length);

              if (!this.tokens.links[token.tag]) {
                this.tokens.links[token.tag] = {
                  href: token.href,
                  title: token.title
                };
              }

              continue;
            } // table (gfm)


            if (token = this.tokenizer.table(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // lheading


            if (token = this.tokenizer.lheading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // top-level paragraph


            if (top && (token = this.tokenizer.paragraph(src))) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // text


            if (token = this.tokenizer.text(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1];

              if (lastToken && lastToken.type === 'text') {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
              } else {
                tokens.push(token);
              }

              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          return tokens;
        };

        _proto.inline = function inline(tokens) {
          var i, j, k, l2, row, token;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'paragraph':
              case 'text':
              case 'heading':
                {
                  token.tokens = [];
                  this.inlineTokens(token.text, token.tokens);
                  break;
                }

              case 'table':
                {
                  token.tokens = {
                    header: [],
                    cells: []
                  }; // header

                  l2 = token.header.length;

                  for (j = 0; j < l2; j++) {
                    token.tokens.header[j] = [];
                    this.inlineTokens(token.header[j], token.tokens.header[j]);
                  } // cells


                  l2 = token.cells.length;

                  for (j = 0; j < l2; j++) {
                    row = token.cells[j];
                    token.tokens.cells[j] = [];

                    for (k = 0; k < row.length; k++) {
                      token.tokens.cells[j][k] = [];
                      this.inlineTokens(row[k], token.tokens.cells[j][k]);
                    }
                  }

                  break;
                }

              case 'blockquote':
                {
                  this.inline(token.tokens);
                  break;
                }

              case 'list':
                {
                  l2 = token.items.length;

                  for (j = 0; j < l2; j++) {
                    this.inline(token.items[j].tokens);
                  }

                  break;
                }
            }
          }

          return tokens;
        }
        /**
         * Lexing/Compiling
         */
        ;

        _proto.inlineTokens = function inlineTokens(src, tokens, inLink, inRawBlock) {
          if (tokens === void 0) {
            tokens = [];
          }

          if (inLink === void 0) {
            inLink = false;
          }

          if (inRawBlock === void 0) {
            inRawBlock = false;
          }

          var token, lastToken; // String with links masked to avoid interference with em and strong

          var maskedSrc = src;
          var match;
          var keepPrevChar, prevChar; // Mask out reflinks

          if (this.tokens.links) {
            var links = Object.keys(this.tokens.links);

            if (links.length > 0) {
              while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
                if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                  maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
                }
              }
            }
          } // Mask out other blocks


          while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
          } // Mask out escaped em & strong delimiters


          while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
          }

          while (src) {
            if (!keepPrevChar) {
              prevChar = '';
            }

            keepPrevChar = false; // escape

            if (token = this.tokenizer.escape(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // tag


            if (token = this.tokenizer.tag(src, inLink, inRawBlock)) {
              src = src.substring(token.raw.length);
              inLink = token.inLink;
              inRawBlock = token.inRawBlock;
              var _lastToken = tokens[tokens.length - 1];

              if (_lastToken && token.type === 'text' && _lastToken.type === 'text') {
                _lastToken.raw += token.raw;
                _lastToken.text += token.text;
              } else {
                tokens.push(token);
              }

              continue;
            } // link


            if (token = this.tokenizer.link(src)) {
              src = src.substring(token.raw.length);

              if (token.type === 'link') {
                token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
              }

              tokens.push(token);
              continue;
            } // reflink, nolink


            if (token = this.tokenizer.reflink(src, this.tokens.links)) {
              src = src.substring(token.raw.length);
              var _lastToken2 = tokens[tokens.length - 1];

              if (token.type === 'link') {
                token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
                tokens.push(token);
              } else if (_lastToken2 && token.type === 'text' && _lastToken2.type === 'text') {
                _lastToken2.raw += token.raw;
                _lastToken2.text += token.text;
              } else {
                tokens.push(token);
              }

              continue;
            } // em & strong


            if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // code


            if (token = this.tokenizer.codespan(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // br


            if (token = this.tokenizer.br(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // del (gfm)


            if (token = this.tokenizer.del(src)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // autolink


            if (token = this.tokenizer.autolink(src, mangle)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // url (gfm)


            if (!inLink && (token = this.tokenizer.url(src, mangle))) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // text


            if (token = this.tokenizer.inlineText(src, inRawBlock, smartypants)) {
              src = src.substring(token.raw.length);

              if (token.raw.slice(-1) !== '_') {
                // Track prevChar before string of ____ started
                prevChar = token.raw.slice(-1);
              }

              keepPrevChar = true;
              lastToken = tokens[tokens.length - 1];

              if (lastToken && lastToken.type === 'text') {
                lastToken.raw += token.raw;
                lastToken.text += token.text;
              } else {
                tokens.push(token);
              }

              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          return tokens;
        };

        _createClass(Lexer, null, [{
          key: "rules",
          get: function get() {
            return {
              block: block,
              inline: inline
            };
          }
        }]);

        return Lexer;
      }();

      var defaults$2 = defaults$5.defaults;
      var cleanUrl = helpers.cleanUrl,
          escape$1 = helpers.escape;
      /**
       * Renderer
       */

      var Renderer_1 = /*#__PURE__*/function () {
        function Renderer(options) {
          this.options = options || defaults$2;
        }

        var _proto = Renderer.prototype;

        _proto.code = function code(_code, infostring, escaped) {
          var lang = (infostring || '').match(/\S*/)[0];

          if (this.options.highlight) {
            var out = this.options.highlight(_code, lang);

            if (out != null && out !== _code) {
              escaped = true;
              _code = out;
            }
          }

          _code = _code.replace(/\n$/, '') + '\n';

          if (!lang) {
            return '<pre><code>' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
          }

          return '<pre><code class="' + this.options.langPrefix + escape$1(lang, true) + '">' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
        };

        _proto.blockquote = function blockquote(quote) {
          return '<blockquote>\n' + quote + '</blockquote>\n';
        };

        _proto.html = function html(_html) {
          return _html;
        };

        _proto.heading = function heading(text, level, raw, slugger) {
          if (this.options.headerIds) {
            return '<h' + level + ' id="' + this.options.headerPrefix + slugger.slug(raw) + '">' + text + '</h' + level + '>\n';
          } // ignore IDs


          return '<h' + level + '>' + text + '</h' + level + '>\n';
        };

        _proto.hr = function hr() {
          return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
        };

        _proto.list = function list(body, ordered, start) {
          var type = ordered ? 'ol' : 'ul',
              startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
          return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
        };

        _proto.listitem = function listitem(text) {
          return '<li>' + text + '</li>\n';
        };

        _proto.checkbox = function checkbox(checked) {
          return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + (this.options.xhtml ? ' /' : '') + '> ';
        };

        _proto.paragraph = function paragraph(text) {
          return '<p>' + text + '</p>\n';
        };

        _proto.table = function table(header, body) {
          if (body) body = '<tbody>' + body + '</tbody>';
          return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
        };

        _proto.tablerow = function tablerow(content) {
          return '<tr>\n' + content + '</tr>\n';
        };

        _proto.tablecell = function tablecell(content, flags) {
          var type = flags.header ? 'th' : 'td';
          var tag = flags.align ? '<' + type + ' align="' + flags.align + '">' : '<' + type + '>';
          return tag + content + '</' + type + '>\n';
        } // span level renderer
        ;

        _proto.strong = function strong(text) {
          return '<strong>' + text + '</strong>';
        };

        _proto.em = function em(text) {
          return '<em>' + text + '</em>';
        };

        _proto.codespan = function codespan(text) {
          return '<code>' + text + '</code>';
        };

        _proto.br = function br() {
          return this.options.xhtml ? '<br/>' : '<br>';
        };

        _proto.del = function del(text) {
          return '<del>' + text + '</del>';
        };

        _proto.link = function link(href, title, text) {
          href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<a href="' + escape$1(href) + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += '>' + text + '</a>';
          return out;
        };

        _proto.image = function image(href, title, text) {
          href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<img src="' + href + '" alt="' + text + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += this.options.xhtml ? '/>' : '>';
          return out;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        return Renderer;
      }();

      /**
       * TextRenderer
       * returns only the textual part of the token
       */
      var TextRenderer_1 = /*#__PURE__*/function () {
        function TextRenderer() {}

        var _proto = TextRenderer.prototype;

        // no need for block level renderers
        _proto.strong = function strong(text) {
          return text;
        };

        _proto.em = function em(text) {
          return text;
        };

        _proto.codespan = function codespan(text) {
          return text;
        };

        _proto.del = function del(text) {
          return text;
        };

        _proto.html = function html(text) {
          return text;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        _proto.link = function link(href, title, text) {
          return '' + text;
        };

        _proto.image = function image(href, title, text) {
          return '' + text;
        };

        _proto.br = function br() {
          return '';
        };

        return TextRenderer;
      }();

      /**
       * Slugger generates header id
       */
      var Slugger_1 = /*#__PURE__*/function () {
        function Slugger() {
          this.seen = {};
        }

        var _proto = Slugger.prototype;

        _proto.serialize = function serialize(value) {
          return value.toLowerCase().trim() // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '') // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '').replace(/\s/g, '-');
        }
        /**
         * Finds the next safe (unique) slug to use
         */
        ;

        _proto.getNextSafeSlug = function getNextSafeSlug(originalSlug, isDryRun) {
          var slug = originalSlug;
          var occurenceAccumulator = 0;

          if (this.seen.hasOwnProperty(slug)) {
            occurenceAccumulator = this.seen[originalSlug];

            do {
              occurenceAccumulator++;
              slug = originalSlug + '-' + occurenceAccumulator;
            } while (this.seen.hasOwnProperty(slug));
          }

          if (!isDryRun) {
            this.seen[originalSlug] = occurenceAccumulator;
            this.seen[slug] = 0;
          }

          return slug;
        }
        /**
         * Convert string to unique id
         * @param {object} options
         * @param {boolean} options.dryrun Generates the next unique slug without updating the internal accumulator.
         */
        ;

        _proto.slug = function slug(value, options) {
          if (options === void 0) {
            options = {};
          }

          var slug = this.serialize(value);
          return this.getNextSafeSlug(slug, options.dryrun);
        };

        return Slugger;
      }();

      var defaults$1 = defaults$5.defaults;
      var unescape = helpers.unescape;
      /**
       * Parsing & Compiling
       */

      var Parser_1 = /*#__PURE__*/function () {
        function Parser(options) {
          this.options = options || defaults$1;
          this.options.renderer = this.options.renderer || new Renderer_1();
          this.renderer = this.options.renderer;
          this.renderer.options = this.options;
          this.textRenderer = new TextRenderer_1();
          this.slugger = new Slugger_1();
        }
        /**
         * Static Parse Method
         */


        Parser.parse = function parse(tokens, options) {
          var parser = new Parser(options);
          return parser.parse(tokens);
        }
        /**
         * Static Parse Inline Method
         */
        ;

        Parser.parseInline = function parseInline(tokens, options) {
          var parser = new Parser(options);
          return parser.parseInline(tokens);
        }
        /**
         * Parse Loop
         */
        ;

        var _proto = Parser.prototype;

        _proto.parse = function parse(tokens, top) {
          if (top === void 0) {
            top = true;
          }

          var out = '',
              i,
              j,
              k,
              l2,
              l3,
              row,
              cell,
              header,
              body,
              token,
              ordered,
              start,
              loose,
              itemBody,
              item,
              checked,
              task,
              checkbox;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'space':
                {
                  continue;
                }

              case 'hr':
                {
                  out += this.renderer.hr();
                  continue;
                }

              case 'heading':
                {
                  out += this.renderer.heading(this.parseInline(token.tokens), token.depth, unescape(this.parseInline(token.tokens, this.textRenderer)), this.slugger);
                  continue;
                }

              case 'code':
                {
                  out += this.renderer.code(token.text, token.lang, token.escaped);
                  continue;
                }

              case 'table':
                {
                  header = ''; // header

                  cell = '';
                  l2 = token.header.length;

                  for (j = 0; j < l2; j++) {
                    cell += this.renderer.tablecell(this.parseInline(token.tokens.header[j]), {
                      header: true,
                      align: token.align[j]
                    });
                  }

                  header += this.renderer.tablerow(cell);
                  body = '';
                  l2 = token.cells.length;

                  for (j = 0; j < l2; j++) {
                    row = token.tokens.cells[j];
                    cell = '';
                    l3 = row.length;

                    for (k = 0; k < l3; k++) {
                      cell += this.renderer.tablecell(this.parseInline(row[k]), {
                        header: false,
                        align: token.align[k]
                      });
                    }

                    body += this.renderer.tablerow(cell);
                  }

                  out += this.renderer.table(header, body);
                  continue;
                }

              case 'blockquote':
                {
                  body = this.parse(token.tokens);
                  out += this.renderer.blockquote(body);
                  continue;
                }

              case 'list':
                {
                  ordered = token.ordered;
                  start = token.start;
                  loose = token.loose;
                  l2 = token.items.length;
                  body = '';

                  for (j = 0; j < l2; j++) {
                    item = token.items[j];
                    checked = item.checked;
                    task = item.task;
                    itemBody = '';

                    if (item.task) {
                      checkbox = this.renderer.checkbox(checked);

                      if (loose) {
                        if (item.tokens.length > 0 && item.tokens[0].type === 'text') {
                          item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;

                          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                            item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                          }
                        } else {
                          item.tokens.unshift({
                            type: 'text',
                            text: checkbox
                          });
                        }
                      } else {
                        itemBody += checkbox;
                      }
                    }

                    itemBody += this.parse(item.tokens, loose);
                    body += this.renderer.listitem(itemBody, task, checked);
                  }

                  out += this.renderer.list(body, ordered, start);
                  continue;
                }

              case 'html':
                {
                  // TODO parse inline content if parameter markdown=1
                  out += this.renderer.html(token.text);
                  continue;
                }

              case 'paragraph':
                {
                  out += this.renderer.paragraph(this.parseInline(token.tokens));
                  continue;
                }

              case 'text':
                {
                  body = token.tokens ? this.parseInline(token.tokens) : token.text;

                  while (i + 1 < l && tokens[i + 1].type === 'text') {
                    token = tokens[++i];
                    body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
                  }

                  out += top ? this.renderer.paragraph(body) : body;
                  continue;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        }
        /**
         * Parse Inline Tokens
         */
        ;

        _proto.parseInline = function parseInline(tokens, renderer) {
          renderer = renderer || this.renderer;
          var out = '',
              i,
              token;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'escape':
                {
                  out += renderer.text(token.text);
                  break;
                }

              case 'html':
                {
                  out += renderer.html(token.text);
                  break;
                }

              case 'link':
                {
                  out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'image':
                {
                  out += renderer.image(token.href, token.title, token.text);
                  break;
                }

              case 'strong':
                {
                  out += renderer.strong(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'em':
                {
                  out += renderer.em(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'codespan':
                {
                  out += renderer.codespan(token.text);
                  break;
                }

              case 'br':
                {
                  out += renderer.br();
                  break;
                }

              case 'del':
                {
                  out += renderer.del(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'text':
                {
                  out += renderer.text(token.text);
                  break;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        };

        return Parser;
      }();

      var merge = helpers.merge,
          checkSanitizeDeprecation = helpers.checkSanitizeDeprecation,
          escape = helpers.escape;
      var getDefaults = defaults$5.getDefaults,
          changeDefaults = defaults$5.changeDefaults,
          defaults = defaults$5.defaults;
      /**
       * Marked
       */

      function marked(src, opt, callback) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        if (typeof opt === 'function') {
          callback = opt;
          opt = null;
        }

        opt = merge({}, marked.defaults, opt || {});
        checkSanitizeDeprecation(opt);

        if (callback) {
          var highlight = opt.highlight;
          var tokens;

          try {
            tokens = Lexer_1.lex(src, opt);
          } catch (e) {
            return callback(e);
          }

          var done = function done(err) {
            var out;

            if (!err) {
              try {
                out = Parser_1.parse(tokens, opt);
              } catch (e) {
                err = e;
              }
            }

            opt.highlight = highlight;
            return err ? callback(err) : callback(null, out);
          };

          if (!highlight || highlight.length < 3) {
            return done();
          }

          delete opt.highlight;
          if (!tokens.length) return done();
          var pending = 0;
          marked.walkTokens(tokens, function (token) {
            if (token.type === 'code') {
              pending++;
              setTimeout(function () {
                highlight(token.text, token.lang, function (err, code) {
                  if (err) {
                    return done(err);
                  }

                  if (code != null && code !== token.text) {
                    token.text = code;
                    token.escaped = true;
                  }

                  pending--;

                  if (pending === 0) {
                    done();
                  }
                });
              }, 0);
            }
          });

          if (pending === 0) {
            done();
          }

          return;
        }

        try {
          var _tokens = Lexer_1.lex(src, opt);

          if (opt.walkTokens) {
            marked.walkTokens(_tokens, opt.walkTokens);
          }

          return Parser_1.parse(_tokens, opt);
        } catch (e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape(e.message + '', true) + '</pre>';
          }

          throw e;
        }
      }
      /**
       * Options
       */


      marked.options = marked.setOptions = function (opt) {
        merge(marked.defaults, opt);
        changeDefaults(marked.defaults);
        return marked;
      };

      marked.getDefaults = getDefaults;
      marked.defaults = defaults;
      /**
       * Use Extension
       */

      marked.use = function (extension) {
        var opts = merge({}, extension);

        if (extension.renderer) {
          (function () {
            var renderer = marked.defaults.renderer || new Renderer_1();

            var _loop = function _loop(prop) {
              var prevRenderer = renderer[prop];

              renderer[prop] = function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                var ret = extension.renderer[prop].apply(renderer, args);

                if (ret === false) {
                  ret = prevRenderer.apply(renderer, args);
                }

                return ret;
              };
            };

            for (var prop in extension.renderer) {
              _loop(prop);
            }

            opts.renderer = renderer;
          })();
        }

        if (extension.tokenizer) {
          (function () {
            var tokenizer = marked.defaults.tokenizer || new Tokenizer_1();

            var _loop2 = function _loop2(prop) {
              var prevTokenizer = tokenizer[prop];

              tokenizer[prop] = function () {
                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = arguments[_key2];
                }

                var ret = extension.tokenizer[prop].apply(tokenizer, args);

                if (ret === false) {
                  ret = prevTokenizer.apply(tokenizer, args);
                }

                return ret;
              };
            };

            for (var prop in extension.tokenizer) {
              _loop2(prop);
            }

            opts.tokenizer = tokenizer;
          })();
        }

        if (extension.walkTokens) {
          var walkTokens = marked.defaults.walkTokens;

          opts.walkTokens = function (token) {
            extension.walkTokens(token);

            if (walkTokens) {
              walkTokens(token);
            }
          };
        }

        marked.setOptions(opts);
      };
      /**
       * Run callback for every token
       */


      marked.walkTokens = function (tokens, callback) {
        for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
          var token = _step.value;
          callback(token);

          switch (token.type) {
            case 'table':
              {
                for (var _iterator2 = _createForOfIteratorHelperLoose(token.tokens.header), _step2; !(_step2 = _iterator2()).done;) {
                  var cell = _step2.value;
                  marked.walkTokens(cell, callback);
                }

                for (var _iterator3 = _createForOfIteratorHelperLoose(token.tokens.cells), _step3; !(_step3 = _iterator3()).done;) {
                  var row = _step3.value;

                  for (var _iterator4 = _createForOfIteratorHelperLoose(row), _step4; !(_step4 = _iterator4()).done;) {
                    var _cell = _step4.value;
                    marked.walkTokens(_cell, callback);
                  }
                }

                break;
              }

            case 'list':
              {
                marked.walkTokens(token.items, callback);
                break;
              }

            default:
              {
                if (token.tokens) {
                  marked.walkTokens(token.tokens, callback);
                }
              }
          }
        }
      };
      /**
       * Parse Inline
       */


      marked.parseInline = function (src, opt) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked.parseInline(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked.parseInline(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        opt = merge({}, marked.defaults, opt || {});
        checkSanitizeDeprecation(opt);

        try {
          var tokens = Lexer_1.lexInline(src, opt);

          if (opt.walkTokens) {
            marked.walkTokens(tokens, opt.walkTokens);
          }

          return Parser_1.parseInline(tokens, opt);
        } catch (e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape(e.message + '', true) + '</pre>';
          }

          throw e;
        }
      };
      /**
       * Expose
       */


      marked.Parser = Parser_1;
      marked.parser = Parser_1.parse;
      marked.Renderer = Renderer_1;
      marked.TextRenderer = TextRenderer_1;
      marked.Lexer = Lexer_1;
      marked.lexer = Lexer_1.lex;
      marked.Tokenizer = Tokenizer_1;
      marked.Slugger = Slugger_1;
      marked.parse = marked;
      var marked_1 = marked;

      return marked_1;

    })));
    });

    /* src\StatusIcon.svelte generated by Svelte v3.37.0 */

    const file$7 = "src\\StatusIcon.svelte";

    function create_fragment$7(ctx) {
    	let svg;
    	let style;
    	let t;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			style = svg_element("style");
    			t = text("svg:not(.failed) .cross,\nsvg:not(.succeeded) .check {\n  opacity: 0;\n  -webkit-animation: none;\n  animation: none;\n}\n.circle-bg {\n  stroke: var(--foreground-005);\n}\n.circle,\n.cross,\n.check {\n  transform-origin: center;\n  transform-box: view-box;\n}\nsvg.loading .circle {\n  stroke-dasharray: 290;\n  stroke-dashoffset: 0;\n  -webkit-animation: loadingCircle 3s infinite linear;\n  animation: loadingCircle 3s infinite linear;\n  stroke: var(--foreground-025);\n}\nsvg.failed .circle-bg {\n  stroke: var(--color-danger-01);\n}\nsvg.failed .circle {\n  stroke-dasharray: 290;\n  stroke-dashoffset: 0;\n  -webkit-animation: failedCircle 1s linear;\n  animation: failedCircle 1s linear;\n  stroke: var(--color-danger);\n}\nsvg.failed .cross_1 {\n  stroke-dasharray: 90;\n  stroke-dashoffset: 204;\n  stroke: var(--color-danger);\n  -webkit-animation: cross_1 0.75s both cubic-bezier(0.22, 0.61, 0.36, 1);\n  animation: cross_1 0.75s both cubic-bezier(0.22, 0.61, 0.36, 1);\n  -webkit-animation-delay: 0.3s;\n  animation-delay: 0.3s;\n}\nsvg.failed .cross_2 {\n  stroke-dasharray: 93;\n  stroke-dashoffset: 212;\n  stroke: var(--color-danger);\n  -webkit-animation: cross_2 0.4s both cubic-bezier(0.22, 0.61, 0.36, 1);\n  animation: cross_2 0.4s both cubic-bezier(0.22, 0.61, 0.36, 1);\n  -webkit-animation-delay: 0.55s;\n  animation-delay: 0.55s;\n}\nsvg.succeeded .circle-bg {\n  stroke: var(--color-success-01);\n}\nsvg.succeeded .circle {\n  stroke-dasharray: 290;\n  stroke-dashoffset: 0;\n  -webkit-animation: succeededCircle 1s linear;\n  animation: succeededCircle 1s linear;\n  stroke: var(--color-success);\n}\nsvg.succeeded .check {\n  stroke-dasharray: 105;\n  stroke-dashoffset: 105;\n  stroke: var(--color-success);\n  -webkit-animation: check 0.75s both var(--transition-easing);\n  animation: check 0.75s both var(--transition-easing);\n  -webkit-animation-delay: 0.35s;\n  animation-delay: 0.35s;\n}\n@-webkit-keyframes loadingCircle {\n  0% {\n    transform: rotate(0deg);\n    stroke-dashoffset: 0;\n  }\n  50% {\n    transform: rotate(180deg);\n    stroke-dashoffset: 290;\n  }\n  100% {\n    transform: rotate(720deg);\n    stroke-dashoffset: 0;\n  }\n}\n@keyframes loadingCircle {\n  0% {\n    transform: rotate(0deg);\n    stroke-dashoffset: 0;\n  }\n  50% {\n    transform: rotate(180deg);\n    stroke-dashoffset: 290;\n  }\n  100% {\n    transform: rotate(720deg);\n    stroke-dashoffset: 0;\n  }\n}\n@-webkit-keyframes failedCircle {\n  0% {\n    transform: rotate(0deg);\n    stroke-dashoffset: 0;\n    stroke: var(--foreground-01);\n  }\n  50% {\n    transform: rotate(180deg);\n    stroke-dashoffset: 290;\n  }\n  100% {\n    transform: rotate(720deg);\n    stroke-dashoffset: 0;\n    stroke: var(--color-danger);\n  }\n}\n@keyframes failedCircle {\n  0% {\n    transform: rotate(0deg);\n    stroke-dashoffset: 0;\n    stroke: var(--foreground-01);\n  }\n  50% {\n    transform: rotate(180deg);\n    stroke-dashoffset: 290;\n  }\n  100% {\n    transform: rotate(720deg);\n    stroke-dashoffset: 0;\n    stroke: var(--color-danger);\n  }\n}\n@-webkit-keyframes cross_1 {\n  from {\n    stroke-dashoffset: 90;\n  }\n}\n@keyframes cross_1 {\n  from {\n    stroke-dashoffset: 90;\n  }\n}\n@-webkit-keyframes cross_2 {\n  from {\n    stroke-dashoffset: 93;\n  }\n}\n@keyframes cross_2 {\n  from {\n    stroke-dashoffset: 93;\n  }\n}\n@-webkit-keyframes succeededCircle {\n  0% {\n    transform: rotate(0deg);\n    stroke-dashoffset: 0;\n    stroke: var(--foreground-01);\n  }\n  50% {\n    transform: rotate(180deg);\n    stroke-dashoffset: 290;\n  }\n  100% {\n    transform: rotate(720deg);\n    stroke-dashoffset: 0;\n    stroke: var(--color-success);\n  }\n}\n@keyframes succeededCircle {\n  0% {\n    transform: rotate(0deg);\n    stroke-dashoffset: 0;\n    stroke: var(--foreground-01);\n  }\n  50% {\n    transform: rotate(180deg);\n    stroke-dashoffset: 290;\n  }\n  100% {\n    transform: rotate(720deg);\n    stroke-dashoffset: 0;\n    stroke: var(--color-success);\n  }\n}\n@-webkit-keyframes check {\n  from {\n    stroke-dashoffset: 105;\n  }\n  to {\n    stroke-dashoffset: 35;\n  }\n}\n@keyframes check {\n  from {\n    stroke-dashoffset: 105;\n  }\n  to {\n    stroke-dashoffset: 35;\n  }\n}\n");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			add_location(style, file$7, 5, 1, 193);
    			attr_dev(path0, "class", "circle-bg");
    			attr_dev(path0, "d", "M60 106C85.4051 106 106 85.4051 106 60C106 34.5949 85.4051 14 60 14C34.5949 14 14 34.5949 14 60C14 85.4051 34.5949 106 60 106Z");
    			attr_dev(path0, "stroke-width", ".1rem");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			add_location(path0, file$7, 203, 1, 4256);
    			attr_dev(path1, "class", "circle");
    			attr_dev(path1, "d", "M60 106C85.4051 106 106 85.4051 106 60C106 34.5949 85.4051 14 60 14C34.5949 14 14 34.5949 14 60C14 85.4051 34.5949 106 60 106Z");
    			attr_dev(path1, "stroke-width", ".1rem");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			add_location(path1, file$7, 204, 1, 4483);
    			attr_dev(path2, "class", "check");
    			attr_dev(path2, "d", "M83.5614 43L48.9583 77.8633L36.0001 64.9051C23.5949 52.5 11.5001 58 17.0003 76.5");
    			attr_dev(path2, "stroke-width", ".1rem");
    			attr_dev(path2, "stroke-linecap", "round");
    			attr_dev(path2, "stroke-linejoin", "round");
    			add_location(path2, file$7, 205, 1, 4707);
    			attr_dev(path3, "class", "cross cross_1");
    			attr_dev(path3, "d", "M82.9993 83L37.0003 37.001C29.4993 29.5 24.5 28 19 39");
    			attr_dev(path3, "stroke-width", ".1rem");
    			attr_dev(path3, "stroke-linecap", "round");
    			attr_dev(path3, "stroke-linejoin", "round");
    			add_location(path3, file$7, 206, 1, 4884);
    			attr_dev(path4, "class", "cross cross_2");
    			attr_dev(path4, "d", "M37.0001 82.9386L82.9991 36.9397C91.5 28.4388 83.9999 19 75.9999 17");
    			attr_dev(path4, "stroke-width", ".1rem");
    			attr_dev(path4, "stroke-linecap", "round");
    			attr_dev(path4, "stroke-linejoin", "round");
    			add_location(path4, file$7, 207, 1, 5042);
    			attr_dev(svg, "class", "icon");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			toggle_class(svg, "failed", /*failed*/ ctx[0]);
    			toggle_class(svg, "succeeded", /*succeeded*/ ctx[1]);
    			toggle_class(svg, "loading", /*loading*/ ctx[2] && !/*failed*/ ctx[0] && !/*succeeded*/ ctx[1]);
    			add_location(svg, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, style);
    			append_dev(style, t);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*failed*/ 1) {
    				toggle_class(svg, "failed", /*failed*/ ctx[0]);
    			}

    			if (dirty & /*succeeded*/ 2) {
    				toggle_class(svg, "succeeded", /*succeeded*/ ctx[1]);
    			}

    			if (dirty & /*loading, failed, succeeded*/ 7) {
    				toggle_class(svg, "loading", /*loading*/ ctx[2] && !/*failed*/ ctx[0] && !/*succeeded*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("StatusIcon", slots, []);
    	let { failed = false } = $$props;
    	let { succeeded = false } = $$props;
    	let { loading = false } = $$props;
    	const writable_props = ["failed", "succeeded", "loading"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StatusIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("failed" in $$props) $$invalidate(0, failed = $$props.failed);
    		if ("succeeded" in $$props) $$invalidate(1, succeeded = $$props.succeeded);
    		if ("loading" in $$props) $$invalidate(2, loading = $$props.loading);
    	};

    	$$self.$capture_state = () => ({ failed, succeeded, loading });

    	$$self.$inject_state = $$props => {
    		if ("failed" in $$props) $$invalidate(0, failed = $$props.failed);
    		if ("succeeded" in $$props) $$invalidate(1, succeeded = $$props.succeeded);
    		if ("loading" in $$props) $$invalidate(2, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [failed, succeeded, loading];
    }

    class StatusIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { failed: 0, succeeded: 1, loading: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StatusIcon",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get failed() {
    		throw new Error("<StatusIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set failed(value) {
    		throw new Error("<StatusIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get succeeded() {
    		throw new Error("<StatusIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set succeeded(value) {
    		throw new Error("<StatusIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<StatusIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<StatusIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ProjectDetails.svelte generated by Svelte v3.37.0 */

    const { Error: Error_1, window: window_1 } = globals;
    const file$6 = "src\\ProjectDetails.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    // (61:36) 
    function create_if_block_19(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let circle;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			circle = svg_element("circle");
    			attr_dev(path0, "d", "M84.2922 34.7947L84.9993 35.5018L120.855 -0.353501L120.147 -1.06061L84.2922 34.7947Z");
    			attr_dev(path0, "class", "fill");
    			attr_dev(path0, "opacity", ".1");
    			add_location(path0, file$6, 62, 5, 2330);
    			attr_dev(path1, "d", "M85.5569 84.9356L84.8498 85.6427L119.562 120.355L120.269 119.647L85.5569 84.9356Z");
    			attr_dev(path1, "class", "fill");
    			attr_dev(path1, "opacity", ".1");
    			add_location(path1, file$6, 63, 5, 2459);
    			attr_dev(path2, "d", "M35.5018 84.9993L34.7947 84.2922L-0.0606959 119.148L0.646411 119.855L35.5018 84.9993Z");
    			attr_dev(path2, "class", "fill");
    			attr_dev(path2, "opacity", ".1");
    			add_location(path2, file$6, 64, 5, 2585);
    			attr_dev(path3, "d", "M35.3523 36.1452L36.0594 35.4381L0.0606224 -0.560669L-0.646484 0.146438L35.3523 36.1452Z");
    			attr_dev(path3, "class", "fill");
    			attr_dev(path3, "opacity", ".1");
    			add_location(path3, file$6, 65, 5, 2715);
    			attr_dev(path4, "d", "M89.5 46V77C89.5 77.8284 88.8284 78.5 88 78.5H32C31.1716 78.5 30.5 77.8284 30.5 77V46C30.5 45.1716 31.1716 44.5 32 44.5H44.6667C45.6759 44.5 46.5862 43.8932 46.9744 42.9615L49.6987 36.4231C49.9316 35.8641 50.4778 35.5 51.0833 35.5H53.5H60H66.5H68.9167C69.5222 35.5 70.0684 35.8641 70.3013 36.4231L73.0256 42.9615C73.4138 43.8932 74.3241 44.5 75.3333 44.5H88C88.8284 44.5 89.5 45.1716 89.5 46Z");
    			attr_dev(path4, "opacity", ".5");
    			attr_dev(path4, "class", "stroke");
    			add_location(path4, file$6, 66, 5, 2848);
    			attr_dev(circle, "cx", "60");
    			attr_dev(circle, "cy", "60");
    			attr_dev(circle, "r", "9.5");
    			attr_dev(circle, "opacity", ".5");
    			attr_dev(circle, "class", "stroke");
    			add_location(circle, file$6, 67, 5, 3287);
    			attr_dev(svg, "class", "no-image icon svelte-n80b00");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			add_location(svg, file$6, 61, 4, 2179);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, circle);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(61:36) ",
    		ctx
    	});

    	return block;
    }

    // (12:3) {#if project.cover}
    function create_if_block_13(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let if_block0 = !/*$GlobalStore*/ ctx[9].projectImgLoad[/*project*/ ctx[11].id].light && create_if_block_18(ctx);
    	let if_block1 = /*$GlobalStore*/ ctx[9].projectImgLoad[/*project*/ ctx[11].id].light && create_if_block_17(ctx);
    	let if_block2 = /*project*/ ctx[11].darkTheme && create_if_block_14(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(div, "class", "light flex flex-center svelte-n80b00");
    			add_location(div, file$6, 12, 4, 694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*$GlobalStore*/ ctx[9].projectImgLoad[/*project*/ ctx[11].id].light) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_18(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$GlobalStore*/ ctx[9].projectImgLoad[/*project*/ ctx[11].id].light) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_17(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*project*/ ctx[11].darkTheme) if_block2.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(12:3) {#if project.cover}",
    		ctx
    	});

    	return block;
    }

    // (14:5) {#if !$GlobalStore.projectImgLoad[project.id].light}
    function create_if_block_18(ctx) {
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "thumb bg-cover svelte-n80b00");
    			set_style(div0, "background-image", "url(projects/" + /*project*/ ctx[11].id + "/thumbnail.jpg)");
    			add_location(div0, file$6, 14, 5, 796);
    			attr_dev(div1, "class", "thumb image svelte-n80b00");
    			set_style(div1, "background-image", "url(projects/" + /*project*/ ctx[11].id + "/thumbnail.jpg)");
    			add_location(div1, file$6, 18, 5, 920);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(14:5) {#if !$GlobalStore.projectImgLoad[project.id].light}",
    		ctx
    	});

    	return block;
    }

    // (24:5) {#if $GlobalStore.projectImgLoad[project.id].light}
    function create_if_block_17(ctx) {
    	let div;
    	let t;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			img = element("img");
    			attr_dev(div, "class", "bg-cover svelte-n80b00");
    			set_style(div, "background-image", "url(projects/" + /*project*/ ctx[11].id + "/cover.png)");
    			add_location(div, file$6, 24, 6, 1112);
    			attr_dev(img, "class", "image svelte-n80b00");
    			if (img.src !== (img_src_value = "projects/" + /*project*/ ctx[11].id + "/cover.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "" + (/*project*/ ctx[11].id + " cover"));
    			add_location(img, file$6, 28, 6, 1230);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(24:5) {#if $GlobalStore.projectImgLoad[project.id].light}",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#if project.darkTheme}
    function create_if_block_14(ctx) {
    	let div;
    	let t;
    	let if_block0 = !/*$GlobalStore*/ ctx[9].projectImgLoad[/*project*/ ctx[11].id].dark && create_if_block_16(ctx);
    	let if_block1 = /*$GlobalStore*/ ctx[9].projectImgLoad[/*project*/ ctx[11].id].dark && create_if_block_15(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "dark flex flex-center svelte-n80b00");
    			add_location(div, file$6, 36, 5, 1405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*$GlobalStore*/ ctx[9].projectImgLoad[/*project*/ ctx[11].id].dark) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_16(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$GlobalStore*/ ctx[9].projectImgLoad[/*project*/ ctx[11].id].dark) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_15(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(36:4) {#if project.darkTheme}",
    		ctx
    	});

    	return block;
    }

    // (38:6) {#if !$GlobalStore.projectImgLoad[project.id].dark}
    function create_if_block_16(ctx) {
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "thumb bg-cover svelte-n80b00");
    			set_style(div0, "background-image", "url(projects/" + /*project*/ ctx[11].id + "/thumbnail_dark.jpg)");
    			add_location(div0, file$6, 38, 6, 1507);
    			attr_dev(div1, "class", "thumb image svelte-n80b00");
    			set_style(div1, "background-image", "url(projects/" + /*project*/ ctx[11].id + "/thumbnail_dark.jpg)");
    			add_location(div1, file$6, 42, 6, 1640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(38:6) {#if !$GlobalStore.projectImgLoad[project.id].dark}",
    		ctx
    	});

    	return block;
    }

    // (48:6) {#if $GlobalStore.projectImgLoad[project.id].dark}
    function create_if_block_15(ctx) {
    	let div;
    	let t;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			img = element("img");
    			attr_dev(div, "class", "bg-cover svelte-n80b00");
    			set_style(div, "background-image", "url(projects/" + /*project*/ ctx[11].id + "/cover_dark.png)");
    			add_location(div, file$6, 48, 7, 1842);
    			attr_dev(img, "class", "image svelte-n80b00");
    			if (img.src !== (img_src_value = "projects/" + /*project*/ ctx[11].id + "/cover_dark.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "" + (/*project*/ ctx[11].id + " dark cover"));
    			add_location(img, file$6, 52, 7, 1969);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(48:6) {#if $GlobalStore.projectImgLoad[project.id].dark}",
    		ctx
    	});

    	return block;
    }

    // (87:44) 
    function create_if_block_12(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "logo svelte-n80b00");
    			if (img.src !== (img_src_value = "technologies/logo_" + /*techno*/ ctx[26] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "" + (/*techno*/ ctx[26] + " Logo"));
    			add_location(img, file$6, 87, 8, 4060);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(87:44) ",
    		ctx
    	});

    	return block;
    }

    // (82:7) {#if technologies[techno].icon}
    function create_if_block_11(ctx) {
    	let svg;
    	let title;
    	let t0_value = /*techno*/ ctx[26] + "";
    	let t0;
    	let t1;
    	let use;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			t1 = text(" Logo");
    			use = svg_element("use");
    			add_location(title, file$6, 83, 9, 3915);
    			xlink_attr(use, "xlink:href", "#LOGO_" + /*techno*/ ctx[26]);
    			add_location(use, file$6, 84, 9, 3954);
    			attr_dev(svg, "class", "logo svelte-n80b00");
    			add_location(svg, file$6, 82, 8, 3886);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			append_dev(svg, use);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(82:7) {#if technologies[techno].icon}",
    		ctx
    	});

    	return block;
    }

    // (76:5) {#each project.usedTechnologies as techno, idx}
    function create_each_block$3(ctx) {
    	let a;
    	let div;
    	let t0;
    	let t1;
    	let span;
    	let t2_value = technologies[/*techno*/ ctx[26]].name + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (technologies[/*techno*/ ctx[26]].icon) return create_if_block_11;
    		if (technologies[/*techno*/ ctx[26]].image) return create_if_block_12;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(div, "class", "color svelte-n80b00");
    			set_style(div, "background-color", technologies[/*techno*/ ctx[26]].color);
    			add_location(div, file$6, 77, 7, 3734);
    			attr_dev(span, "class", "name svelte-n80b00");
    			add_location(span, file$6, 93, 7, 4199);
    			attr_dev(a, "href", technologies[/*techno*/ ctx[26]].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "techno flex flex-center gap-05 svelte-n80b00");
    			add_location(a, file$6, 76, 6, 3615);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(a, t0);
    			if (if_block) if_block.m(a, null);
    			append_dev(a, t1);
    			append_dev(a, span);
    			append_dev(span, t2);
    			append_dev(a, t3);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", vibrate, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (if_block) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(76:5) {#each project.usedTechnologies as techno, idx}",
    		ctx
    	});

    	return block;
    }

    // (102:4) {#if project.codeUrl}
    function create_if_block_10(ctx) {
    	let a;
    	let svg;
    	let path;
    	let t0;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Source code";
    			attr_dev(path, "d", "M42.0439 53.512L17.2039 62.8L42.0439 72.088V79.576L8.85188 66.688V58.912L42.0439 46.024V53.512ZM68.2406 27.376H76.3046L52.5446 95.2H44.4806L68.2406 27.376ZM111.231 58.912V66.688L78.0394 79.576V72.088L102.879 62.8L78.0394 53.512V46.024L111.231 58.912Z");
    			attr_dev(path, "class", "svelte-n80b00");
    			add_location(path, file$6, 104, 7, 4700);
    			attr_dev(svg, "class", "icon fill icon-medium svelte-n80b00");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$6, 103, 6, 4587);
    			attr_dev(span, "class", "label svelte-n80b00");
    			add_location(span, file$6, 106, 6, 4984);
    			attr_dev(a, "href", /*project*/ ctx[11].codeUrl);
    			attr_dev(a, "class", "open-source-code flex flex-center gap-05 svelte-n80b00");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 102, 5, 4456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path);
    			append_dev(a, t0);
    			append_dev(a, span);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[19], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(102:4) {#if project.codeUrl}",
    		ctx
    	});

    	return block;
    }

    // (110:4) {#if project.codeUrl === null}
    function create_if_block_9(ctx) {
    	let div;
    	let svg;
    	let path0;
    	let path1;
    	let line;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			line = svg_element("line");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Closed source";
    			attr_dev(path0, "d", "M16.5 53C16.5 49.4101 19.4101 46.5 23 46.5H60H97C100.59 46.5 103.5 49.4101 103.5 53V97C103.5 100.59 100.59 103.5 97 103.5H23C19.4101 103.5 16.5 100.59 16.5 97V53Z");
    			attr_dev(path0, "stroke-width", ".5rem");
    			attr_dev(path0, "class", "svelte-n80b00");
    			add_location(path0, file$6, 112, 7, 5262);
    			attr_dev(path1, "d", "M78 45V33C78 23.0589 69.9411 15 60 15V15C50.0589 15 42 23.0589 42 33V45");
    			attr_dev(path1, "stroke-width", ".5rem");
    			attr_dev(path1, "class", "svelte-n80b00");
    			add_location(path1, file$6, 113, 7, 5466);
    			attr_dev(line, "x1", "60");
    			attr_dev(line, "y1", "67");
    			attr_dev(line, "x2", "60");
    			attr_dev(line, "y2", "83");
    			attr_dev(line, "stroke-width", ".6rem");
    			attr_dev(line, "stroke-linecap", "round");
    			attr_dev(line, "stroke-linejoin", "round");
    			attr_dev(line, "class", "svelte-n80b00");
    			add_location(line, file$6, 114, 7, 5579);
    			attr_dev(svg, "class", "icon stroke icon-default svelte-n80b00");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$6, 111, 6, 5146);
    			attr_dev(span, "class", "label svelte-n80b00");
    			add_location(span, file$6, 116, 6, 5708);
    			attr_dev(div, "class", "closed-source flex flex-center gap-05 svelte-n80b00");
    			add_location(div, file$6, 110, 5, 5087);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, line);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(110:4) {#if project.codeUrl === null}",
    		ctx
    	});

    	return block;
    }

    // (129:51) 
    function create_if_block_8(ctx) {
    	let div;
    	let span;
    	let t1;
    	let svg;
    	let circle;
    	let path;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Bald verfügbar";
    			t1 = space();
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			path = svg_element("path");
    			attr_dev(span, "class", "label svelte-n80b00");
    			add_location(span, file$6, 130, 6, 6675);
    			attr_dev(circle, "cx", "60");
    			attr_dev(circle, "cy", "60");
    			attr_dev(circle, "r", "53");
    			attr_dev(circle, "stroke-width", ".5rem");
    			attr_dev(circle, "class", "svelte-n80b00");
    			add_location(circle, file$6, 132, 7, 6839);
    			attr_dev(path, "d", "M60 23V60L77 73");
    			attr_dev(path, "stroke-width", ".5rem");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "class", "svelte-n80b00");
    			add_location(path, file$6, 133, 7, 6901);
    			attr_dev(svg, "class", "icon stroke icon-medium svelte-n80b00");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$6, 131, 6, 6724);
    			attr_dev(div, "href", /*project*/ ctx[11].projectUrl);
    			attr_dev(div, "class", "open-project-soon flex flex-center gap-05 svelte-n80b00");
    			add_location(div, file$6, 129, 5, 6586);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(129:51) ",
    		ctx
    	});

    	return block;
    }

    // (120:4) {#if project.projectUrl !== null && project.projectUrl !== 'COMING_SOON'}
    function create_if_block_7(ctx) {
    	let a;
    	let div;
    	let t0;
    	let span;
    	let t2;
    	let svg;
    	let path0;
    	let path1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Projekt öffnen";
    			t2 = space();
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(div, "class", "shine svelte-n80b00");
    			add_location(div, file$6, 121, 6, 5988);
    			attr_dev(span, "class", "label svelte-n80b00");
    			add_location(span, file$6, 122, 6, 6016);
    			attr_dev(path0, "d", "M57.7778 25H35C29.4772 25 25 29.4772 25 35V85C25 90.5228 29.4772 95 35 95H85C90.5228 95 95 90.5228 95 85V62.2222");
    			attr_dev(path0, "stroke-width", ".5rem");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "class", "svelte-n80b00");
    			add_location(path0, file$6, 124, 7, 6180);
    			attr_dev(path1, "d", "M105 15L60 60M105 15L105 45M105 15L75 15");
    			attr_dev(path1, "stroke-width", ".5rem");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "class", "svelte-n80b00");
    			add_location(path1, file$6, 125, 7, 6381);
    			attr_dev(svg, "class", "icon stroke icon-medium svelte-n80b00");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$6, 123, 6, 6065);
    			attr_dev(a, "href", /*project*/ ctx[11].projectUrl);
    			attr_dev(a, "class", "open-project flex flex-center gap-05 svelte-n80b00");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 120, 5, 5858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(a, t0);
    			append_dev(a, span);
    			append_dev(a, t2);
    			append_dev(a, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_1*/ ctx[20], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(120:4) {#if project.projectUrl !== null && project.projectUrl !== 'COMING_SOON'}",
    		ctx
    	});

    	return block;
    }

    // (140:2) {#if project.about}
    function create_if_block$3(ctx) {
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let span0;
    	let t2;
    	let button0;
    	let div1;
    	let span1;
    	let t3;
    	let statusicon0;
    	let t4;
    	let svg0;
    	let path0;
    	let t5;
    	let span2;
    	let t7;
    	let button1;
    	let div2;
    	let span3;
    	let t8;
    	let statusicon1;
    	let t9;
    	let svg1;
    	let path1;
    	let t10;
    	let span4;
    	let t12;
    	let button2;
    	let svg2;
    	let path2;
    	let t13;
    	let span5;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type_3(ctx, dirty) {
    		if (/*projectAbout*/ ctx[1] !== null && !(/*projectAbout*/ ctx[1] instanceof Error)) return create_if_block_6;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_4(ctx, dirty) {
    		if (/*shareURLWasCanceled*/ ctx[3]) return create_if_block_4$1;
    		if (/*shareURLWasSuccess*/ ctx[4]) return create_if_block_5$1;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_4(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	statusicon0 = new StatusIcon({
    			props: {
    				loading: /*userIsSharingURL*/ ctx[2],
    				failed: /*shareURLWasCanceled*/ ctx[3],
    				succeeded: /*shareURLWasSuccess*/ ctx[4]
    			},
    			$$inline: true
    		});

    	function select_block_type_5(ctx, dirty) {
    		if (/*shareNotSupported*/ ctx[7]) return create_if_block_1$2;
    		if (/*shareWasCanceled*/ ctx[6]) return create_if_block_2$1;
    		if (/*shareWasSuccess*/ ctx[8]) return create_if_block_3$1;
    		return create_else_block$2;
    	}

    	let current_block_type_2 = select_block_type_5(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	statusicon1 = new StatusIcon({
    			props: {
    				loading: /*userIsSharing*/ ctx[5],
    				failed: /*shareWasCanceled*/ ctx[6] || /*shareNotSupported*/ ctx[7],
    				succeeded: /*shareWasSuccess*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			span0 = element("span");
    			span0.textContent = "Teilen:";
    			t2 = space();
    			button0 = element("button");
    			div1 = element("div");
    			span1 = element("span");
    			if_block1.c();
    			t3 = space();
    			create_component(statusicon0.$$.fragment);
    			t4 = space();
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t5 = space();
    			span2 = element("span");
    			span2.textContent = "URL kopieren";
    			t7 = space();
    			button1 = element("button");
    			div2 = element("div");
    			span3 = element("span");
    			if_block2.c();
    			t8 = space();
    			create_component(statusicon1.$$.fragment);
    			t9 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t10 = space();
    			span4 = element("span");
    			span4.textContent = "Teilen mit...";
    			t12 = space();
    			button2 = element("button");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t13 = space();
    			span5 = element("span");
    			span5.textContent = "Schließen";
    			attr_dev(div0, "class", "about svelte-n80b00");
    			toggle_class(div0, "loading", /*projectAbout*/ ctx[1] !== null);
    			add_location(div0, file$6, 140, 3, 7083);
    			attr_dev(span0, "class", "label svelte-n80b00");
    			add_location(span0, file$6, 156, 5, 7694);
    			attr_dev(span1, "class", "label svelte-n80b00");
    			add_location(span1, file$6, 162, 7, 7964);
    			attr_dev(div1, "class", "status grid gap-05 grid-center-x svelte-n80b00");
    			toggle_class(div1, "active", /*userIsSharingURL*/ ctx[2]);
    			add_location(div1, file$6, 161, 6, 7877);
    			attr_dev(path0, "d", "M34.2893 54.7108L19.0614 69.9387C10.6513 78.3489 10.6513 91.9844 19.0614 100.395C27.4716 108.805 41.1071 108.805 49.5173 100.395L64.7452 85.1667C73.1553 76.7565 73.1553 63.121 64.7452 54.7108M85.0491 64.8628L100.277 49.6348C108.687 41.2247 108.687 27.5891 100.277 19.179C91.8669 10.7688 78.2313 10.7688 69.8212 19.179L54.5932 34.4069C52.0762 36.924 50.3124 39.9091 49.302 43.0821C46.9364 50.5109 48.7001 58.9697 54.5932 64.8628");
    			attr_dev(path0, "stroke-width", ".5rem");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "class", "svelte-n80b00");
    			add_location(path0, file$6, 178, 7, 8473);
    			attr_dev(svg0, "class", "icon icon-default stroke svelte-n80b00");
    			attr_dev(svg0, "viewBox", "0 0 120 120");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$6, 177, 6, 8357);
    			attr_dev(span2, "class", "label svelte-n80b00");
    			add_location(span2, file$6, 180, 6, 9002);
    			attr_dev(button0, "class", "share-option flex flex-center gap-05 nowrap svelte-n80b00");
    			toggle_class(button0, "is-sharing", /*userIsSharingURL*/ ctx[2]);
    			add_location(button0, file$6, 157, 5, 7735);
    			attr_dev(span3, "class", "label svelte-n80b00");
    			add_location(span3, file$6, 187, 7, 9288);
    			attr_dev(div2, "class", "status grid gap-05 grid-center-x svelte-n80b00");
    			toggle_class(div2, "active", /*userIsSharing*/ ctx[5]);
    			add_location(div2, file$6, 186, 6, 9204);
    			attr_dev(path1, "d", "M45.25 40H35C29.4772 40 25 44.4772 25 50V100C25 105.523 29.4772 110 35 110H85C90.5229 110 95 105.523 95 100V50C95 44.4772 90.5229 40 85 40H74.75M60.5 10V70M60.5 10L77 26.5M60.5 10L44 26.5");
    			attr_dev(path1, "stroke-width", ".5rem");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "class", "svelte-n80b00");
    			add_location(path1, file$6, 205, 7, 9886);
    			attr_dev(svg1, "class", "icon stroke icon-default svelte-n80b00");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 120 120");
    			attr_dev(svg1, "fill", "none");
    			add_location(svg1, file$6, 204, 6, 9770);
    			attr_dev(span4, "class", "label svelte-n80b00");
    			add_location(span4, file$6, 207, 6, 10175);
    			attr_dev(button1, "class", "share-option flex flex-center gap-05 nowrap svelte-n80b00");
    			toggle_class(button1, "is-sharing", /*userIsSharing*/ ctx[5]);
    			add_location(button1, file$6, 182, 5, 9064);
    			attr_dev(div3, "class", "share-post flex flex-center-y svelte-n80b00");
    			add_location(div3, file$6, 155, 4, 7644);
    			attr_dev(path2, "d", "M10 110l50-50m0 0l50-50M60 60l50 50M60 60L10 10");
    			attr_dev(path2, "stroke-width", ".5rem");
    			attr_dev(path2, "stroke-linecap", "round");
    			attr_dev(path2, "stroke-linejoin", "round");
    			attr_dev(path2, "class", "svelte-n80b00");
    			add_location(path2, file$6, 214, 6, 10513);
    			attr_dev(svg2, "class", "icon stroke icon-small svelte-n80b00");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "viewBox", "0 0 120 120");
    			add_location(svg2, file$6, 213, 5, 10400);
    			attr_dev(span5, "class", "label svelte-n80b00");
    			add_location(span5, file$6, 216, 5, 10660);
    			attr_dev(button2, "class", "close flex flex-center-y flex-self-right gap-1 nowrap svelte-n80b00");
    			add_location(button2, file$6, 212, 4, 10301);
    			attr_dev(div4, "class", "footer grid grid-center-y svelte-n80b00");
    			add_location(div4, file$6, 154, 3, 7599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if_block0.m(div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, span0);
    			append_dev(div3, t2);
    			append_dev(div3, button0);
    			append_dev(button0, div1);
    			append_dev(div1, span1);
    			if_block1.m(span1, null);
    			append_dev(div1, t3);
    			mount_component(statusicon0, div1, null);
    			append_dev(button0, t4);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(button0, t5);
    			append_dev(button0, span2);
    			append_dev(div3, t7);
    			append_dev(div3, button1);
    			append_dev(button1, div2);
    			append_dev(div2, span3);
    			if_block2.m(span3, null);
    			append_dev(div2, t8);
    			mount_component(statusicon1, div2, null);
    			append_dev(button1, t9);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			append_dev(button1, t10);
    			append_dev(button1, span4);
    			append_dev(div4, t12);
    			append_dev(div4, button2);
    			append_dev(button2, svg2);
    			append_dev(svg2, path2);
    			append_dev(button2, t13);
    			append_dev(button2, span5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*shareURL*/ ctx[16], false, false, false),
    					listen_dev(button1, "click", /*shareThis*/ ctx[17], false, false, false),
    					listen_dev(button2, "click", /*closeModal*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (dirty & /*projectAbout*/ 2) {
    				toggle_class(div0, "loading", /*projectAbout*/ ctx[1] !== null);
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_4(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(span1, null);
    				}
    			}

    			const statusicon0_changes = {};
    			if (dirty & /*userIsSharingURL*/ 4) statusicon0_changes.loading = /*userIsSharingURL*/ ctx[2];
    			if (dirty & /*shareURLWasCanceled*/ 8) statusicon0_changes.failed = /*shareURLWasCanceled*/ ctx[3];
    			if (dirty & /*shareURLWasSuccess*/ 16) statusicon0_changes.succeeded = /*shareURLWasSuccess*/ ctx[4];
    			statusicon0.$set(statusicon0_changes);

    			if (dirty & /*userIsSharingURL*/ 4) {
    				toggle_class(div1, "active", /*userIsSharingURL*/ ctx[2]);
    			}

    			if (dirty & /*userIsSharingURL*/ 4) {
    				toggle_class(button0, "is-sharing", /*userIsSharingURL*/ ctx[2]);
    			}

    			if (current_block_type_2 !== (current_block_type_2 = select_block_type_5(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(span3, null);
    				}
    			}

    			const statusicon1_changes = {};
    			if (dirty & /*userIsSharing*/ 32) statusicon1_changes.loading = /*userIsSharing*/ ctx[5];
    			if (dirty & /*shareWasCanceled, shareNotSupported*/ 192) statusicon1_changes.failed = /*shareWasCanceled*/ ctx[6] || /*shareNotSupported*/ ctx[7];
    			if (dirty & /*shareWasSuccess*/ 256) statusicon1_changes.succeeded = /*shareWasSuccess*/ ctx[8];
    			statusicon1.$set(statusicon1_changes);

    			if (dirty & /*userIsSharing*/ 32) {
    				toggle_class(div2, "active", /*userIsSharing*/ ctx[5]);
    			}

    			if (dirty & /*userIsSharing*/ 32) {
    				toggle_class(button1, "is-sharing", /*userIsSharing*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(statusicon0.$$.fragment, local);
    			transition_in(statusicon1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(statusicon0.$$.fragment, local);
    			transition_out(statusicon1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if_block0.d();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    			if_block1.d();
    			destroy_component(statusicon0);
    			if_block2.d();
    			destroy_component(statusicon1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(140:2) {#if project.about}",
    		ctx
    	});

    	return block;
    }

    // (144:4) {:else}
    function create_else_block_2(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let hr;
    	let t2;
    	let p0;
    	let t4;
    	let h3;
    	let t6;
    	let p1;
    	let t8;
    	let p2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Entschuldige, irgendwas ist schief gelaufen.";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "_";
    			t4 = space();
    			h3 = element("h3");
    			h3.textContent = "_";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "_";
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "_";
    			attr_dev(h1, "class", "svelte-n80b00");
    			add_location(h1, file$6, 145, 6, 7377);
    			attr_dev(hr, "class", "h1-border svelte-n80b00");
    			add_location(hr, file$6, 146, 6, 7438);
    			attr_dev(p0, "class", "i svelte-n80b00");
    			add_location(p0, file$6, 147, 6, 7468);
    			attr_dev(h3, "class", "svelte-n80b00");
    			add_location(h3, file$6, 148, 6, 7494);
    			attr_dev(p1, "class", "ii svelte-n80b00");
    			add_location(p1, file$6, 149, 6, 7512);
    			attr_dev(p2, "class", "iii svelte-n80b00");
    			add_location(p2, file$6, 150, 6, 7539);
    			attr_dev(div, "class", "placeholder svelte-n80b00");
    			toggle_class(div, "error-placeholder", /*projectAbout*/ ctx[1] instanceof Error);
    			add_location(div, file$6, 144, 5, 7288);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, hr);
    			append_dev(div, t2);
    			append_dev(div, p0);
    			append_dev(div, t4);
    			append_dev(div, h3);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(div, t8);
    			append_dev(div, p2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*projectAbout, Error*/ 2) {
    				toggle_class(div, "error-placeholder", /*projectAbout*/ ctx[1] instanceof Error);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(144:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (142:4) {#if projectAbout !== null && !(projectAbout instanceof Error)}
    function create_if_block_6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "rtf-content svelte-n80b00");
    			add_location(div, file$6, 142, 5, 7218);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = /*renderedRTF*/ ctx[0];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*renderedRTF*/ 1) div.innerHTML = /*renderedRTF*/ ctx[0];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(142:4) {#if projectAbout !== null && !(projectAbout instanceof Error)}",
    		ctx
    	});

    	return block;
    }

    // (168:8) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Wird kopiert...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(168:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (166:37) 
    function create_if_block_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("URL Kopiert");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(166:37) ",
    		ctx
    	});

    	return block;
    }

    // (164:8) {#if shareURLWasCanceled}
    function create_if_block_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Etwas ist schief gelaufen");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(164:8) {#if shareURLWasCanceled}",
    		ctx
    	});

    	return block;
    }

    // (195:8) {:else}
    function create_else_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Wird geteilt...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(195:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (193:34) 
    function create_if_block_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Geteilt");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(193:34) ",
    		ctx
    	});

    	return block;
    }

    // (191:35) 
    function create_if_block_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Abgebrochen");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(191:35) ",
    		ctx
    	});

    	return block;
    }

    // (189:8) {#if shareNotSupported}
    function create_if_block_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Dein Browser unterstützt leider diese Funktion nicht");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(189:8) {#if shareNotSupported}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div7;
    	let div0;
    	let div0_transition;
    	let t0;
    	let div6;
    	let button;
    	let svg;
    	let path;
    	let t1;
    	let div1;
    	let t2;
    	let div5;
    	let div3;
    	let h1;
    	let t4;
    	let div2;
    	let t5;
    	let div4;
    	let t6;
    	let t7;
    	let t8;
    	let div6_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*project*/ ctx[11].cover) return create_if_block_13;
    		if (/*project*/ ctx[11].about === null) return create_if_block_19;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let each_value = /*project*/ ctx[11].usedTechnologies;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	let if_block1 = /*project*/ ctx[11].codeUrl && create_if_block_10(ctx);
    	let if_block2 = /*project*/ ctx[11].codeUrl === null && create_if_block_9(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*project*/ ctx[11].projectUrl !== null && /*project*/ ctx[11].projectUrl !== "COMING_SOON") return create_if_block_7;
    		if (/*project*/ ctx[11].projectUrl === "COMING_SOON") return create_if_block_8;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block3 = current_block_type_1 && current_block_type_1(ctx);
    	let if_block4 = /*project*/ ctx[11].about && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div6 = element("div");
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t1 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*project*/ ctx[11].name}`;
    			t4 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div4 = element("div");
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			if (if_block3) if_block3.c();
    			t8 = space();
    			if (if_block4) if_block4.c();
    			attr_dev(div0, "class", "bg svelte-n80b00");
    			add_location(div0, file$6, 1, 1, 39);
    			attr_dev(path, "d", "M10 110l50-50m0 0l50-50M60 60l50 50M60 60L10 10");
    			attr_dev(path, "stroke-width", ".25rem");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "class", "svelte-n80b00");
    			add_location(path, file$6, 5, 4, 370);
    			attr_dev(svg, "class", "icon stroke icon-big svelte-n80b00");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			add_location(svg, file$6, 4, 3, 261);
    			attr_dev(button, "class", "close-modal flex flex-center svelte-n80b00");
    			add_location(button, file$6, 3, 2, 189);
    			attr_dev(div1, "class", "image-container flex flex-center block-select svelte-n80b00");
    			toggle_class(div1, "no-image", !/*project*/ ctx[11].cover);
    			toggle_class(div1, "dark-theme", /*project*/ ctx[11].darkTheme);
    			add_location(div1, file$6, 8, 2, 526);
    			attr_dev(h1, "class", "name svelte-n80b00");
    			add_location(h1, file$6, 73, 4, 3461);
    			attr_dev(div2, "class", "used-technologies flex list gap-05");
    			add_location(div2, file$6, 74, 4, 3505);
    			attr_dev(div3, "class", "left-piece grid gap-1");
    			add_location(div3, file$6, 72, 3, 3420);
    			attr_dev(div4, "class", "right-piece flex svelte-n80b00");
    			toggle_class(div4, "single-btn", /*anyHeaderBtnActive*/ ctx[14]);
    			toggle_class(div4, "no-btn", /*noHeaderBtn*/ ctx[15]);
    			add_location(div4, file$6, 100, 3, 4327);
    			attr_dev(div5, "class", "header grid gap-2 svelte-n80b00");
    			add_location(div5, file$6, 71, 2, 3384);
    			attr_dev(div6, "id", "Project_Details_Modal");
    			attr_dev(div6, "class", "grid svelte-n80b00");
    			toggle_class(div6, "no-about", /*project*/ ctx[11].about === null);
    			add_location(div6, file$6, 2, 1, 78);
    			attr_dev(div7, "id", "Project_Details_Container");
    			attr_dev(div7, "class", "svelte-n80b00");
    			add_location(div7, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div0);
    			append_dev(div7, t0);
    			append_dev(div7, div6);
    			append_dev(div6, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, h1);
    			append_dev(div3, t4);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div4, t6);
    			if (if_block2) if_block2.m(div4, null);
    			append_dev(div4, t7);
    			if (if_block3) if_block3.m(div4, null);
    			append_dev(div6, t8);
    			if (if_block4) if_block4.m(div6, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "hashchange", /*closeModal*/ ctx[10], false, false, false),
    					listen_dev(window_1, "popstate", /*closeModal*/ ctx[10], false, false, false),
    					listen_dev(button, "click", /*closeModal*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (if_block0) if_block0.p(ctx, dirty);

    			if (dirty & /*technologies, project, vibrate*/ 2048) {
    				each_value = /*project*/ ctx[11].usedTechnologies;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*project*/ ctx[11].codeUrl) if_block1.p(ctx, dirty);
    			if (if_block3) if_block3.p(ctx, dirty);
    			if (/*project*/ ctx[11].about) if_block4.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*bgTrans*/ ctx[12], {}, true);
    				div0_transition.run(1);
    			});

    			transition_in(if_block4);

    			add_render_callback(() => {
    				if (!div6_transition) div6_transition = create_bidirectional_transition(div6, /*modalTrans*/ ctx[13], {}, true);
    				div6_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*bgTrans*/ ctx[12], {}, false);
    			div0_transition.run(0);
    			transition_out(if_block4);
    			if (!div6_transition) div6_transition = create_bidirectional_transition(div6, /*modalTrans*/ ctx[13], {}, false);
    			div6_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			if (detaching && div0_transition) div0_transition.end();

    			if (if_block0) {
    				if_block0.d();
    			}

    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();

    			if (if_block3) {
    				if_block3.d();
    			}

    			if (if_block4) if_block4.d();
    			if (detaching && div6_transition) div6_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $GlobalStore;
    	validate_store(GlobalStore, "GlobalStore");
    	component_subscribe($$self, GlobalStore, $$value => $$invalidate(9, $GlobalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectDetails", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	const dispatch = createEventDispatcher();

    	function closeModal() {
    		vibrate();
    		dispatch("close");
    	}

    	let { projectIndex } = $$props;
    	const project = projects[projectIndex];

    	const bgTrans = () => ({
    		duration: 500,
    		css: t => `opacity: ${cubicInOut(t)}`
    	});

    	const modalTrans = () => ({
    		duration: 500,
    		css(t) {
    			t = cubicInOut(t);
    			return `opacity: ${t}; transform: translate(0, ${8 - 8 * t}rem);`;
    		}
    	});

    	let renderedRTF = null;
    	let projectAbout = null;

    	function fetchAbout() {
    		return __awaiter(this, void 0, void 0, function* () {
    			try {
    				const resp = yield fetch(`projects/${project.id}/about/de.md`);
    				if (resp.status !== 200) throw new Error("404");
    				const text = yield resp.text();
    				$$invalidate(1, projectAbout = text);
    				$$invalidate(0, renderedRTF = marked(projectAbout, { smartLists: true }));

    				setTimeout(() => {
    					for (const link of document.querySelectorAll(".rtf-content a")) {
    						link.setAttribute("target", "_blank");
    					}
    				});
    			} catch(err) {
    				setTimeout(() => $$invalidate(1, projectAbout = err), 1000);
    			}
    		});
    	}

    	if (project.about) fetchAbout();
    	const anyHeaderBtnActive = project.codeUrl !== undefined && project.projectUrl === undefined || project.codeUrl === undefined && project.projectUrl !== undefined;
    	const noHeaderBtn = project.codeUrl === undefined && project.projectUrl === null;
    	let userIsSharingURL = false;
    	let shareURLWasCanceled = false;
    	let shareURLWasSuccess = false;

    	function shareURL() {
    		var _a;

    		return __awaiter(this, void 0, void 0, function* () {
    			if (userIsSharingURL) return;
    			$$invalidate(3, shareURLWasCanceled = false);
    			$$invalidate(4, shareURLWasSuccess = false);
    			shareThisReset();

    			if ((_a = window.location) === null || _a === void 0
    			? void 0
    			: _a.href) {
    				$$invalidate(2, userIsSharingURL = true);
    				vibrate();

    				if (yield copyToClipboard(window.location.href)) {
    					vibrate([0, 500, 200, 100, 50]);

    					setTimeout(() => {
    						$$invalidate(4, shareURLWasSuccess = true);
    						setTimeout(shareURLReset, 2000);
    					});
    				} else {
    					vibrate([0, 500, 100, 50, 100]);

    					setTimeout(() => {
    						$$invalidate(3, shareURLWasCanceled = true);
    						setTimeout(shareURLReset, 2000);
    					});
    				}
    			} else {
    				vibrate([0, 500, 100, 50, 100, 200, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
    				$$invalidate(2, userIsSharingURL = true);

    				setTimeout(() => {
    					$$invalidate(3, shareURLWasCanceled = true);
    					setTimeout(shareURLReset, 2000);
    				});
    			}
    		});
    	}

    	function shareURLReset() {
    		$$invalidate(2, userIsSharingURL = false);

    		setTimeout(() => {
    			$$invalidate(3, shareURLWasCanceled = false);
    			$$invalidate(4, shareURLWasSuccess = false);
    		});
    	}

    	let userIsSharing = false;
    	let shareWasCanceled = false;
    	let shareNotSupported = false;
    	let shareWasSuccess = false;

    	function shareThis() {
    		var _a, _b;
    		if (userIsSharing) return;
    		$$invalidate(6, shareWasCanceled = false);
    		$$invalidate(8, shareWasSuccess = false);
    		shareURLReset();

    		if (((_a = window.navigator) === null || _a === void 0
    		? void 0
    		: _a.share) && ((_b = window.location) === null || _b === void 0
    		? void 0
    		: _b.href)) {
    			vibrate();
    			$$invalidate(5, userIsSharing = true);

    			navigator.share({
    				title: project.name + " - A project by Daniel Sharkov",
    				url: window.location.href
    			}).then(() => {
    				vibrate([0, 500, 200, 100, 50]);

    				setTimeout(() => {
    					$$invalidate(8, shareWasSuccess = true);
    					setTimeout(shareThisReset, 2000);
    				});
    			}).catch(() => {
    				vibrate([0, 500, 100, 50, 100]);

    				setTimeout(() => {
    					$$invalidate(6, shareWasCanceled = true);
    					setTimeout(shareThisReset, 2000);
    				});
    			});
    		} else {
    			vibrate([0, 500, 100, 50, 100, 200, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
    			$$invalidate(5, userIsSharing = true);

    			setTimeout(() => {
    				$$invalidate(7, shareNotSupported = true);
    				setTimeout(shareThisReset, 3000);
    			});
    		}
    	}

    	function shareThisReset() {
    		$$invalidate(5, userIsSharing = false);

    		setTimeout(() => {
    			$$invalidate(6, shareWasCanceled = false);
    			$$invalidate(7, shareNotSupported = false);
    			$$invalidate(8, shareWasSuccess = false);
    		});
    	}

    	const writable_props = ["projectIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectDetails> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => vibrateLink(e);
    	const click_handler_1 = e => vibrateLink(e);

    	$$self.$$set = $$props => {
    		if ("projectIndex" in $$props) $$invalidate(18, projectIndex = $$props.projectIndex);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		createEventDispatcher,
    		dispatch,
    		cubicInOut,
    		projects,
    		technologies,
    		Marked: marked,
    		GlobalStore,
    		vibrate,
    		vibrateLink,
    		copyToClipboard,
    		StatusIcon,
    		closeModal,
    		projectIndex,
    		project,
    		bgTrans,
    		modalTrans,
    		renderedRTF,
    		projectAbout,
    		fetchAbout,
    		anyHeaderBtnActive,
    		noHeaderBtn,
    		userIsSharingURL,
    		shareURLWasCanceled,
    		shareURLWasSuccess,
    		shareURL,
    		shareURLReset,
    		userIsSharing,
    		shareWasCanceled,
    		shareNotSupported,
    		shareWasSuccess,
    		shareThis,
    		shareThisReset,
    		$GlobalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("projectIndex" in $$props) $$invalidate(18, projectIndex = $$props.projectIndex);
    		if ("renderedRTF" in $$props) $$invalidate(0, renderedRTF = $$props.renderedRTF);
    		if ("projectAbout" in $$props) $$invalidate(1, projectAbout = $$props.projectAbout);
    		if ("userIsSharingURL" in $$props) $$invalidate(2, userIsSharingURL = $$props.userIsSharingURL);
    		if ("shareURLWasCanceled" in $$props) $$invalidate(3, shareURLWasCanceled = $$props.shareURLWasCanceled);
    		if ("shareURLWasSuccess" in $$props) $$invalidate(4, shareURLWasSuccess = $$props.shareURLWasSuccess);
    		if ("userIsSharing" in $$props) $$invalidate(5, userIsSharing = $$props.userIsSharing);
    		if ("shareWasCanceled" in $$props) $$invalidate(6, shareWasCanceled = $$props.shareWasCanceled);
    		if ("shareNotSupported" in $$props) $$invalidate(7, shareNotSupported = $$props.shareNotSupported);
    		if ("shareWasSuccess" in $$props) $$invalidate(8, shareWasSuccess = $$props.shareWasSuccess);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		renderedRTF,
    		projectAbout,
    		userIsSharingURL,
    		shareURLWasCanceled,
    		shareURLWasSuccess,
    		userIsSharing,
    		shareWasCanceled,
    		shareNotSupported,
    		shareWasSuccess,
    		$GlobalStore,
    		closeModal,
    		project,
    		bgTrans,
    		modalTrans,
    		anyHeaderBtnActive,
    		noHeaderBtn,
    		shareURL,
    		shareThis,
    		projectIndex,
    		click_handler,
    		click_handler_1
    	];
    }

    class ProjectDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { projectIndex: 18 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectDetails",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*projectIndex*/ ctx[18] === undefined && !("projectIndex" in props)) {
    			console.warn("<ProjectDetails> was created without expected prop 'projectIndex'");
    		}
    	}

    	get projectIndex() {
    		throw new Error_1("<ProjectDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projectIndex(value) {
    		throw new Error_1("<ProjectDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ProjectPreviewTile.svelte generated by Svelte v3.37.0 */
    const file$5 = "src\\ProjectPreviewTile.svelte";

    // (66:2) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let circle;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			circle = svg_element("circle");
    			attr_dev(path0, "d", "M84.2922 34.7947L84.9993 35.5018L120.855 -0.353501L120.147 -1.06061L84.2922 34.7947Z");
    			attr_dev(path0, "class", "fill");
    			attr_dev(path0, "opacity", ".1");
    			add_location(path0, file$5, 68, 5, 2367);
    			attr_dev(path1, "d", "M85.5569 84.9356L84.8498 85.6427L119.562 120.355L120.269 119.647L85.5569 84.9356Z");
    			attr_dev(path1, "class", "fill");
    			attr_dev(path1, "opacity", ".1");
    			add_location(path1, file$5, 69, 5, 2496);
    			attr_dev(path2, "d", "M35.5018 84.9993L34.7947 84.2922L-0.0606959 119.148L0.646411 119.855L35.5018 84.9993Z");
    			attr_dev(path2, "class", "fill");
    			attr_dev(path2, "opacity", ".1");
    			add_location(path2, file$5, 70, 5, 2622);
    			attr_dev(path3, "d", "M35.3523 36.1452L36.0594 35.4381L0.0606224 -0.560669L-0.646484 0.146438L35.3523 36.1452Z");
    			attr_dev(path3, "class", "fill");
    			attr_dev(path3, "opacity", ".1");
    			add_location(path3, file$5, 71, 5, 2752);
    			attr_dev(path4, "d", "M89.5 46V77C89.5 77.8284 88.8284 78.5 88 78.5H32C31.1716 78.5 30.5 77.8284 30.5 77V46C30.5 45.1716 31.1716 44.5 32 44.5H44.6667C45.6759 44.5 46.5862 43.8932 46.9744 42.9615L49.6987 36.4231C49.9316 35.8641 50.4778 35.5 51.0833 35.5H53.5H60H66.5H68.9167C69.5222 35.5 70.0684 35.8641 70.3013 36.4231L73.0256 42.9615C73.4138 43.8932 74.3241 44.5 75.3333 44.5H88C88.8284 44.5 89.5 45.1716 89.5 46Z");
    			attr_dev(path4, "opacity", ".35");
    			attr_dev(path4, "class", "stroke");
    			add_location(path4, file$5, 72, 5, 2885);
    			attr_dev(circle, "cx", "60");
    			attr_dev(circle, "cy", "60");
    			attr_dev(circle, "r", "9.5");
    			attr_dev(circle, "opacity", ".35");
    			attr_dev(circle, "class", "stroke");
    			add_location(circle, file$5, 73, 5, 3325);
    			attr_dev(svg, "class", "icon svelte-v1qy3a");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			add_location(svg, file$5, 67, 4, 2225);
    			attr_dev(div, "class", "no-image flex flex-center svelte-v1qy3a");
    			add_location(div, file$5, 66, 3, 2180);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, circle);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(66:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:2) {#if project.cover}
    function create_if_block$2(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let if_block0 = /*project*/ ctx[4].darkTheme && create_if_block_3(ctx);
    	let if_block1 = !/*$GlobalStore*/ ctx[3].projectImgLoad[/*project*/ ctx[4].id].light && create_if_block_2(ctx);
    	let if_block2 = /*$GlobalStore*/ ctx[3].projectImgLoad[/*project*/ ctx[4].id].light && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "image-container light svelte-v1qy3a");
    			add_location(div, file$5, 45, 3, 1556);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*project*/ ctx[4].darkTheme) if_block0.p(ctx, dirty);

    			if (!/*$GlobalStore*/ ctx[3].projectImgLoad[/*project*/ ctx[4].id].light) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$GlobalStore*/ ctx[3].projectImgLoad[/*project*/ ctx[4].id].light) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(23:2) {#if project.cover}",
    		ctx
    	});

    	return block;
    }

    // (24:3) {#if project.darkTheme}
    function create_if_block_3(ctx) {
    	let div;
    	let t;
    	let if_block0 = !/*$GlobalStore*/ ctx[3].projectImgLoad[/*project*/ ctx[4].id].dark && create_if_block_5(ctx);
    	let if_block1 = /*$GlobalStore*/ ctx[3].projectImgLoad[/*project*/ ctx[4].id].dark && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "image-container dark svelte-v1qy3a");
    			add_location(div, file$5, 24, 4, 895);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*$GlobalStore*/ ctx[3].projectImgLoad[/*project*/ ctx[4].id].dark) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$GlobalStore*/ ctx[3].projectImgLoad[/*project*/ ctx[4].id].dark) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(24:3) {#if project.darkTheme}",
    		ctx
    	});

    	return block;
    }

    // (26:5) {#if !$GlobalStore.projectImgLoad[project.id].dark}
    function create_if_block_5(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "thumb svelte-v1qy3a");
    			if (img.src !== (img_src_value = "projects/" + /*project*/ ctx[4].id + "/thumbnail_dark.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", `Daniel Sharkov's project ${/*project*/ ctx[4].name} dark thumbnail`);
    			add_location(img, file$5, 26, 5, 994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "load", /*load_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(26:5) {#if !$GlobalStore.projectImgLoad[project.id].dark}",
    		ctx
    	});

    	return block;
    }

    // (36:5) {#if $GlobalStore.projectImgLoad[project.id].dark}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "image svelte-v1qy3a");
    			if (img.src !== (img_src_value = "projects/" + /*project*/ ctx[4].id + "/preview_dark.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", `Daniel Sharkov's project ${/*project*/ ctx[4].name} dark themed`);
    			add_location(img, file$5, 36, 6, 1326);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "load", /*lazyLoadedDark*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(36:5) {#if $GlobalStore.projectImgLoad[project.id].dark}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if !$GlobalStore.projectImgLoad[project.id].light}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "thumb svelte-v1qy3a");
    			if (img.src !== (img_src_value = "projects/" + /*project*/ ctx[4].id + "/thumbnail.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", `Daniel Sharkov's project ${/*project*/ ctx[4].name} thumbnail`);
    			add_location(img, file$5, 47, 5, 1656);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "load", /*load_handler_1*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(47:4) {#if !$GlobalStore.projectImgLoad[project.id].light}",
    		ctx
    	});

    	return block;
    }

    // (57:4) {#if $GlobalStore.projectImgLoad[project.id].light}
    function create_if_block_1$1(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "image svelte-v1qy3a");
    			if (img.src !== (img_src_value = "projects/" + /*project*/ ctx[4].id + "/preview.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", `Daniel Sharkov's project ${/*project*/ ctx[4].name}`);
    			add_location(img, file$5, 57, 5, 1977);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "load", /*lazyLoaded*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(57:4) {#if $GlobalStore.projectImgLoad[project.id].light}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let button;
    	let div0;
    	let t0;
    	let div1;
    	let span;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*project*/ ctx[4].cover) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = `${/*project*/ ctx[4].name}`;
    			attr_dev(div0, "class", "preview block-select svelte-v1qy3a");
    			toggle_class(div0, "loaded", /*highResImgDone*/ ctx[1]);
    			toggle_class(div0, "loaded-dark", /*highResImgDarkDone*/ ctx[2]);
    			toggle_class(div0, "dark-theme", /*project*/ ctx[4].darkTheme);
    			add_location(div0, file$5, 18, 1, 686);
    			attr_dev(span, "class", "name svelte-v1qy3a");
    			add_location(span, file$5, 79, 2, 3457);
    			attr_dev(div1, "class", "contents svelte-v1qy3a");
    			add_location(div1, file$5, 78, 1, 3431);
    			attr_dev(button, "class", "project grid svelte-v1qy3a");
    			set_style(button, "animation-delay", 1000 + /*projectIndex*/ ctx[0] * 100 + "ms");
    			add_location(button, file$5, 17, 0, 572);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, div0);
    			if_block.m(div0, null);
    			append_dev(button, t0);
    			append_dev(button, div1);
    			append_dev(div1, span);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*openThisProject*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if_block.p(ctx, dirty);

    			if (dirty & /*highResImgDone*/ 2) {
    				toggle_class(div0, "loaded", /*highResImgDone*/ ctx[1]);
    			}

    			if (dirty & /*highResImgDarkDone*/ 4) {
    				toggle_class(div0, "loaded-dark", /*highResImgDarkDone*/ ctx[2]);
    			}

    			if (dirty & /*projectIndex*/ 1) {
    				set_style(button, "animation-delay", 1000 + /*projectIndex*/ ctx[0] * 100 + "ms");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $GlobalStore;
    	validate_store(GlobalStore, "GlobalStore");
    	component_subscribe($$self, GlobalStore, $$value => $$invalidate(3, $GlobalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectPreviewTile", slots, []);
    	const dispatch = createEventDispatcher();
    	let { projectIndex } = $$props;
    	let project = projects[projectIndex];
    	let highResImgDone = false;
    	let highResImgDarkDone = false;
    	const lazyLoaded = () => $$invalidate(1, highResImgDone = true);
    	const lazyLoadedDark = () => $$invalidate(2, highResImgDarkDone = true);

    	function openThisProject() {
    		vibrate();
    		dispatch("open");
    	}

    	const writable_props = ["projectIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectPreviewTile> was created with unknown prop '${key}'`);
    	});

    	const load_handler = () => {
    		GlobalStore.thumbDone(project.id, ImageThumbKind.DARK);
    	};

    	const load_handler_1 = () => {
    		GlobalStore.thumbDone(project.id, ImageThumbKind.LIGHT);
    	};

    	$$self.$$set = $$props => {
    		if ("projectIndex" in $$props) $$invalidate(0, projectIndex = $$props.projectIndex);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		projects,
    		GlobalStore,
    		ImageThumbKind,
    		vibrate,
    		projectIndex,
    		project,
    		highResImgDone,
    		highResImgDarkDone,
    		lazyLoaded,
    		lazyLoadedDark,
    		openThisProject,
    		$GlobalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("projectIndex" in $$props) $$invalidate(0, projectIndex = $$props.projectIndex);
    		if ("project" in $$props) $$invalidate(4, project = $$props.project);
    		if ("highResImgDone" in $$props) $$invalidate(1, highResImgDone = $$props.highResImgDone);
    		if ("highResImgDarkDone" in $$props) $$invalidate(2, highResImgDarkDone = $$props.highResImgDarkDone);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		projectIndex,
    		highResImgDone,
    		highResImgDarkDone,
    		$GlobalStore,
    		project,
    		lazyLoaded,
    		lazyLoadedDark,
    		openThisProject,
    		load_handler,
    		load_handler_1
    	];
    }

    class ProjectPreviewTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { projectIndex: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectPreviewTile",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*projectIndex*/ ctx[0] === undefined && !("projectIndex" in props)) {
    			console.warn("<ProjectPreviewTile> was created without expected prop 'projectIndex'");
    		}
    	}

    	get projectIndex() {
    		throw new Error("<ProjectPreviewTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projectIndex(value) {
    		throw new Error("<ProjectPreviewTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\sections\ProjectsSection.svelte generated by Svelte v3.37.0 */
    const file$4 = "src\\sections\\ProjectsSection.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (49:0) {#if clickedProject !== null}
    function create_if_block$1(ctx) {
    	let projectdetails;
    	let current;

    	projectdetails = new ProjectDetails({
    			props: { projectIndex: /*clickedProject*/ ctx[0] },
    			$$inline: true
    		});

    	projectdetails.$on("close", /*closeProject*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(projectdetails.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectdetails, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const projectdetails_changes = {};
    			if (dirty & /*clickedProject*/ 1) projectdetails_changes.projectIndex = /*clickedProject*/ ctx[0];
    			projectdetails.$set(projectdetails_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectdetails.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectdetails.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projectdetails, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(49:0) {#if clickedProject !== null}",
    		ctx
    	});

    	return block;
    }

    // (56:2) {#each projects as _, pIdx}
    function create_each_block$2(ctx) {
    	let projectpreviewtile;
    	let current;

    	function open_handler() {
    		return /*open_handler*/ ctx[3](/*pIdx*/ ctx[7]);
    	}

    	projectpreviewtile = new ProjectPreviewTile({
    			props: { projectIndex: /*pIdx*/ ctx[7] },
    			$$inline: true
    		});

    	projectpreviewtile.$on("open", open_handler);

    	const block = {
    		c: function create() {
    			create_component(projectpreviewtile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectpreviewtile, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectpreviewtile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectpreviewtile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projectpreviewtile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(56:2) {#each projects as _, pIdx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let section;
    	let h1;
    	let t2;
    	let div;
    	let current;
    	let if_block = /*clickedProject*/ ctx[0] !== null && create_if_block$1(ctx);
    	let each_value = projects;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Projekte";
    			t2 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "display-3 svelte-19jt1h8");
    			add_location(h1, file$4, 53, 1, 1823);
    			attr_dev(div, "class", "projects grid svelte-19jt1h8");
    			add_location(div, file$4, 54, 1, 1861);
    			attr_dev(section, "id", "projects");
    			add_location(section, file$4, 52, 0, 1797);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t2);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*clickedProject*/ ctx[0] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*clickedProject*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*openProject*/ 4) {
    				each_value = projects;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function _resetURL() {
    	window.history.pushState(null, "", window.location.protocol + "//" + window.location.host + window.location.pathname);
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectsSection", slots, []);
    	var _a;
    	let clickedProject = null;

    	function closeProject() {
    		var _a;

    		if ((_a = window.history) === null || _a === void 0
    		? void 0
    		: _a.pushState) _resetURL();

    		GlobalStore.unlockScroll("projects_section_modal");
    		$$invalidate(0, clickedProject = null);
    	}

    	function openProject(idx) {
    		var _a;
    		$$invalidate(0, clickedProject = idx);

    		if ((_a = window.history) === null || _a === void 0
    		? void 0
    		: _a.pushState) {
    			window.history.pushState(
    				// State
    				{
    					"project_id": projects[clickedProject].id
    				},
    				// Title
    				projects[clickedProject].name,
    				// New URL
    				window.location.protocol + "//" + window.location.host + window.location.pathname + "?project=" + projects[clickedProject].id
    			);
    		}

    		GlobalStore.lockScroll("projects_section_modal");
    	}

    	if ((_a = window.location) === null || _a === void 0
    	? void 0
    	: _a.search) {
    		for (const qrs of window.location.search.substring(1, window.location.search.length).split("&")) {
    			let q = qrs.split("=");

    			if (q[0] == "project" && projectsIndexByID[q[1]]) {
    				openProject(projectsIndexByID[q[1]]);
    			} else _resetURL();
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectsSection> was created with unknown prop '${key}'`);
    	});

    	const open_handler = pIdx => openProject(pIdx);

    	$$self.$capture_state = () => ({
    		_a,
    		ProjectDetails,
    		GlobalStore,
    		projects,
    		projectsIndexByID,
    		ProjectPreviewTile,
    		_resetURL,
    		clickedProject,
    		closeProject,
    		openProject
    	});

    	$$self.$inject_state = $$props => {
    		if ("_a" in $$props) _a = $$props._a;
    		if ("clickedProject" in $$props) $$invalidate(0, clickedProject = $$props.clickedProject);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [clickedProject, closeProject, openProject, open_handler];
    }

    class ProjectsSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectsSection",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\sections\SkillsSection.svelte generated by Svelte v3.37.0 */

    const { Object: Object_1 } = globals;
    const file$3 = "src\\sections\\SkillsSection.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (10:3) {#each Array(currentYear - careerBegin + 1) as _}
    function create_each_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "period svelte-1lazkhm");
    			add_location(div, file$3, 10, 4, 448);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(10:3) {#each Array(currentYear - careerBegin + 1) as _}",
    		ctx
    	});

    	return block;
    }

    // (15:3) {#each Array(currentYear - careerBegin + 1) as _, idx}
    function create_each_block_2(ctx) {
    	let span;
    	let t_value = careerBegin + /*idx*/ ctx[12] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "period flex flex-center svelte-1lazkhm");
    			add_location(span, file$3, 15, 4, 602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(15:3) {#each Array(currentYear - careerBegin + 1) as _, idx}",
    		ctx
    	});

    	return block;
    }

    // (33:5) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "logo placeholder svelte-1lazkhm");
    			add_location(div, file$3, 33, 6, 1159);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(33:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (27:42) 
    function create_if_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "logo svelte-1lazkhm");
    			if (img.src !== (img_src_value = "technologies/logo_" + /*techno*/ ctx[4] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "" + (/*techno*/ ctx[4] + " Logo"));
    			add_location(img, file$3, 27, 6, 1029);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(27:42) ",
    		ctx
    	});

    	return block;
    }

    // (22:5) {#if technologies[techno].icon}
    function create_if_block(ctx) {
    	let svg;
    	let title;
    	let t0_value = /*techno*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let use;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			t1 = text(" Logo");
    			use = svg_element("use");
    			add_location(title, file$3, 23, 7, 892);
    			xlink_attr(use, "xlink:href", "#LOGO_" + /*techno*/ ctx[4]);
    			add_location(use, file$3, 24, 7, 929);
    			attr_dev(svg, "class", "logo flex-base-size svelte-1lazkhm");
    			add_location(svg, file$3, 22, 6, 850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			append_dev(svg, use);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(22:5) {#if technologies[techno].icon}",
    		ctx
    	});

    	return block;
    }

    // (52:5) {#each technologies[techno].careerSpan as period}
    function create_each_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "period svelte-1lazkhm");
    			attr_dev(div, "style", /*technoCareerSpan*/ ctx[2](technologies[/*techno*/ ctx[4]], /*period*/ ctx[7]));
    			add_location(div, file$3, 52, 6, 2196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(52:5) {#each technologies[techno].careerSpan as period}",
    		ctx
    	});

    	return block;
    }

    // (19:2) {#each Object.keys(technologies) as techno}
    function create_each_block$1(ctx) {
    	let li;
    	let div1;
    	let t0;
    	let div0;
    	let span0;
    	let t1_value = technologies[/*techno*/ ctx[4]].name + "";
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*technoName*/ ctx[1][technologies[/*techno*/ ctx[4]].type] + "";
    	let t3;
    	let t4;
    	let a;
    	let svg;
    	let path0;
    	let path1;
    	let t5;
    	let div2;
    	let t6;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (technologies[/*techno*/ ctx[4]].icon) return create_if_block;
    		if (technologies[/*techno*/ ctx[4]].image) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_1 = technologies[/*techno*/ ctx[4]].careerSpan;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div1 = element("div");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			a = element("a");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t5 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			attr_dev(span0, "class", "name flex-base-size svelte-1lazkhm");
    			add_location(span0, file$3, 36, 6, 1237);
    			attr_dev(span1, "class", "type flex-base-size svelte-1lazkhm");
    			add_location(span1, file$3, 39, 6, 1330);
    			attr_dev(div0, "class", "naming svelte-1lazkhm");
    			add_location(div0, file$3, 35, 5, 1209);
    			attr_dev(path0, "d", "M57.7778 25H35C29.4772 25 25 29.4772 25 35V85C25 90.5228 29.4772 95 35 95H85C90.5228 95 95 90.5228 95 85V62.2222");
    			attr_dev(path0, "stroke-width", ".5rem");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "class", "svelte-1lazkhm");
    			add_location(path0, file$3, 45, 7, 1667);
    			attr_dev(path1, "d", "M105 15L60 60M105 15L105 45M105 15L75 15");
    			attr_dev(path1, "stroke-width", ".5rem");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "class", "svelte-1lazkhm");
    			add_location(path1, file$3, 46, 7, 1868);
    			attr_dev(svg, "class", "icon stroke icon-medium svelte-1lazkhm");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$3, 44, 6, 1552);
    			attr_dev(a, "class", "link svelte-1lazkhm");
    			attr_dev(a, "href", technologies[/*techno*/ ctx[4]].link);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 43, 5, 1447);
    			attr_dev(div1, "class", "header flex flex-center-y svelte-1lazkhm");
    			add_location(div1, file$3, 20, 4, 765);
    			attr_dev(div2, "class", "time-span grid svelte-1lazkhm");
    			set_style(div2, "grid-template-columns", "repeat(" + (/*currentYear*/ ctx[0] - careerBegin) + ", 1fr)");
    			add_location(div2, file$3, 50, 4, 2031);
    			attr_dev(li, "class", "techno svelte-1lazkhm");
    			add_location(li, file$3, 19, 3, 740);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div1);
    			if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(span1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, a);
    			append_dev(a, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(li, t5);
    			append_dev(li, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(li, t6);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);

    			if (dirty & /*technoCareerSpan, technologies, Object*/ 4) {
    				each_value_1 = technologies[/*techno*/ ctx[4]].careerSpan;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(19:2) {#each Object.keys(technologies) as techno}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let ul;
    	let div1;
    	let t4;
    	let div2;
    	let t5;
    	let each_value_3 = Array(/*currentYear*/ ctx[0] - careerBegin + 1);
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = Array(/*currentYear*/ ctx[0] - careerBegin + 1);
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = Object.keys(technologies);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Fertigkeiten";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Programmiersprachen die ich spreche und Technologien die ich kenne und benutze - in einem Zeitstrahl dargestellt, seit wann ich damit angefangen habe.";
    			t3 = space();
    			ul = element("ul");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t4 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "display-3 svelte-1lazkhm");
    			add_location(h1, file$3, 2, 2, 76);
    			attr_dev(p, "class", "subtitle svelte-1lazkhm");
    			add_location(p, file$3, 3, 2, 119);
    			attr_dev(div0, "class", "section-header svelte-1lazkhm");
    			add_location(div0, file$3, 1, 1, 44);
    			attr_dev(div1, "class", "background-seperators flex svelte-1lazkhm");
    			add_location(div1, file$3, 8, 2, 348);
    			attr_dev(div2, "class", "header flex flex-align-end-y svelte-1lazkhm");
    			add_location(div2, file$3, 13, 2, 495);
    			attr_dev(ul, "class", "technologies grid svelte-1lazkhm");
    			add_location(ul, file$3, 7, 1, 314);
    			attr_dev(section, "id", "skills");
    			attr_dev(section, "class", "auto-height svelte-1lazkhm");
    			add_location(section, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(section, t3);
    			append_dev(section, ul);
    			append_dev(ul, div1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div1, null);
    			}

    			append_dev(ul, t4);
    			append_dev(ul, div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(ul, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*careerBegin*/ 0) {
    				each_value_2 = Array(/*currentYear*/ ctx[0] - careerBegin + 1);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*currentYear, careerBegin, technologies, Object, technoCareerSpan, vibrateLink, technoName*/ 7) {
    				each_value = Object.keys(technologies);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SkillsSection", slots, []);
    	const currentYear = Number(new Date().getFullYear());
    	const technoName = ["Software", "Sprache", "Framework", "Bibliothek"];

    	function technoCareerSpan(techno, [begin, end]) {
    		let endPos = currentYear - careerBegin + 1;
    		if (end !== null) endPos = endPos - (currentYear - end);
    		return `background-color: ${techno.color};` + `grid-column-start: ${begin - careerBegin + 1};` + `grid-column-end: ${endPos};`;
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SkillsSection> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => vibrateLink(e);

    	$$self.$capture_state = () => ({
    		careerBegin,
    		technologies,
    		vibrateLink,
    		currentYear,
    		technoName,
    		technoCareerSpan
    	});

    	return [currentYear, technoName, technoCareerSpan, click_handler];
    }

    class SkillsSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SkillsSection",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\sections\ContactSection.svelte generated by Svelte v3.37.0 */
    const file$2 = "src\\sections\\ContactSection.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i].name;
    	child_ctx[10] = list[i].url;
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (4:2) {#each $GlobalStore.socialMedia as {name, url}
    function create_each_block(ctx) {
    	let a;
    	let svg;
    	let title;
    	let t0_value = /*name*/ ctx[9] + "";
    	let t0;
    	let t1;
    	let use;
    	let use_xlink_href_value;
    	let t2;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			t1 = text(" Logo");
    			use = svg_element("use");
    			t2 = space();
    			attr_dev(title, "class", "svelte-112pfop");
    			add_location(title, file$2, 6, 5, 365);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#LOGO_" + /*name*/ ctx[9]);
    			attr_dev(use, "class", "svelte-112pfop");
    			add_location(use, file$2, 7, 5, 398);
    			attr_dev(svg, "class", "logo icon-big svelte-112pfop");
    			add_location(svg, file$2, 5, 4, 331);
    			attr_dev(a, "href", a_href_value = /*url*/ ctx[10]);
    			attr_dev(a, "target", "_blank");
    			set_style(a, "animation-delay", 50 + /*idx*/ ctx[12] * 50 + "ms");
    			attr_dev(a, "class", "svelte-112pfop");
    			add_location(a, file$2, 4, 3, 224);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			append_dev(svg, use);
    			append_dev(a, t2);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$GlobalStore*/ 16 && t0_value !== (t0_value = /*name*/ ctx[9] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$GlobalStore*/ 16 && use_xlink_href_value !== (use_xlink_href_value = "#LOGO_" + /*name*/ ctx[9])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}

    			if (dirty & /*$GlobalStore*/ 16 && a_href_value !== (a_href_value = /*url*/ ctx[10])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(4:2) {#each $GlobalStore.socialMedia as {name, url}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let h1;
    	let t1;
    	let div0;
    	let t2;
    	let div6;
    	let div1;
    	let span;
    	let t4;
    	let div2;
    	let label0;
    	let t6;
    	let input0;
    	let t7;
    	let div3;
    	let label1;
    	let t9;
    	let input1;
    	let t10;
    	let div4;
    	let label2;
    	let t12;
    	let textarea;
    	let t13;
    	let div5;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*$GlobalStore*/ ctx[4].socialMedia;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Du möchtest mich gerne erreichen?";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div6 = element("div");
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "Derzeit nur durch Soziale Medien kontaktierbar. 👆";
    			t4 = space();
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "Deine Email";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Betreff";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			div4 = element("div");
    			label2 = element("label");
    			label2.textContent = "Nachricht";
    			t12 = space();
    			textarea = element("textarea");
    			t13 = space();
    			div5 = element("div");
    			button = element("button");
    			button.textContent = "Versenden";
    			add_location(h1, file$2, 1, 1, 67);
    			attr_dev(div0, "class", "social-media flex flex-center-y gap-1 svelte-112pfop");
    			add_location(div0, file$2, 2, 1, 112);
    			add_location(span, file$2, 14, 3, 591);
    			attr_dev(div1, "class", "currently-unavailable flex flex-center svelte-112pfop");
    			add_location(div1, file$2, 13, 2, 534);
    			attr_dev(label0, "for", "Contact_Email");
    			add_location(label0, file$2, 17, 3, 704);
    			attr_dev(input0, "id", "Contact_Email");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-112pfop");
    			add_location(input0, file$2, 18, 3, 755);
    			attr_dev(div2, "class", "field grid gap-05");
    			add_location(div2, file$2, 16, 2, 668);
    			attr_dev(label1, "for", "Contact_Subejct");
    			add_location(label1, file$2, 21, 3, 863);
    			attr_dev(input1, "id", "Contact_Subejct");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-112pfop");
    			add_location(input1, file$2, 22, 3, 912);
    			attr_dev(div3, "class", "field grid gap-05");
    			add_location(div3, file$2, 20, 2, 827);
    			attr_dev(label2, "for", "Contact_Message");
    			add_location(label2, file$2, 25, 3, 1018);
    			attr_dev(textarea, "id", "Contact_Message");
    			attr_dev(textarea, "class", "svelte-112pfop");
    			add_location(textarea, file$2, 26, 3, 1069);
    			attr_dev(div4, "class", "grid gap-05");
    			add_location(div4, file$2, 24, 2, 988);
    			attr_dev(button, "class", "flex-self-right svelte-112pfop");
    			add_location(button, file$2, 29, 3, 1191);
    			attr_dev(div5, "class", "actions flex flex-center-y svelte-112pfop");
    			add_location(div5, file$2, 28, 2, 1146);
    			attr_dev(div6, "class", "formular grid gap-1 svelte-112pfop");
    			attr_dev(div6, "valid-form", /*validForm*/ ctx[3]);
    			add_location(div6, file$2, 12, 1, 474);
    			attr_dev(section, "id", "get-in-touch");
    			attr_dev(section, "class", "auto-height grid grid-center svelte-112pfop");
    			add_location(section, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(section, t2);
    			append_dev(section, div6);
    			append_dev(div6, div1);
    			append_dev(div1, span);
    			append_dev(div6, t4);
    			append_dev(div6, div2);
    			append_dev(div2, label0);
    			append_dev(div2, t6);
    			append_dev(div2, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append_dev(div6, t7);
    			append_dev(div6, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t9);
    			append_dev(div3, input1);
    			set_input_value(input1, /*subject*/ ctx[1]);
    			append_dev(div6, t10);
    			append_dev(div6, div4);
    			append_dev(div4, label2);
    			append_dev(div4, t12);
    			append_dev(div4, textarea);
    			set_input_value(textarea, /*message*/ ctx[2]);
    			append_dev(div6, t13);
    			append_dev(div6, div5);
    			append_dev(div5, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$GlobalStore, vibrateLink*/ 16) {
    				each_value = /*$GlobalStore*/ ctx[4].socialMedia;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*subject*/ 2 && input1.value !== /*subject*/ ctx[1]) {
    				set_input_value(input1, /*subject*/ ctx[1]);
    			}

    			if (dirty & /*message*/ 4) {
    				set_input_value(textarea, /*message*/ ctx[2]);
    			}

    			if (dirty & /*validForm*/ 8) {
    				attr_dev(div6, "valid-form", /*validForm*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let validForm;
    	let $GlobalStore;
    	validate_store(GlobalStore, "GlobalStore");
    	component_subscribe($$self, GlobalStore, $$value => $$invalidate(4, $GlobalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContactSection", slots, []);
    	let email = "";
    	let subject = "";
    	let message = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactSection> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => vibrateLink(e);

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	function input1_input_handler() {
    		subject = this.value;
    		$$invalidate(1, subject);
    	}

    	function textarea_input_handler() {
    		message = this.value;
    		$$invalidate(2, message);
    	}

    	$$self.$capture_state = () => ({
    		GlobalStore,
    		vibrateLink,
    		email,
    		subject,
    		message,
    		validForm,
    		$GlobalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("email" in $$props) $$invalidate(0, email = $$props.email);
    		if ("subject" in $$props) $$invalidate(1, subject = $$props.subject);
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    		if ("validForm" in $$props) $$invalidate(3, validForm = $$props.validForm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*email, subject, message*/ 7) {
    			$$invalidate(3, validForm = email.length > 0 && subject.length > 0 && message.length > 0);
    		}
    	};

    	return [
    		email,
    		subject,
    		message,
    		validForm,
    		$GlobalStore,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		textarea_input_handler
    	];
    }

    class ContactSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactSection",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\sections\FooterSection.svelte generated by Svelte v3.37.0 */

    const file$1 = "src\\sections\\FooterSection.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let p;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			p = element("p");
    			p.textContent = "Copyright © Daniel Sharkov 2021. Alle Rechte vorbehalten.";
    			attr_dev(p, "class", "copyright svelte-16ajsvd");
    			add_location(p, file$1, 1, 1, 11);
    			attr_dev(footer, "class", "svelte-16ajsvd");
    			add_location(footer, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FooterSection", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FooterSection> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class FooterSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FooterSection",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const rAF = (window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) { window.setTimeout(callback, 1000 / 60); });
    function easeScrolling(el, { top = 0, duration = 1000, easing = null }) {
        if (!(el instanceof HTMLElement)) {
            throw new Error('Invalid element provided');
        }
        const toScroll = Number(top) - el.scrollTop;
        if (toScroll == 0)
            return;
        const scrollBegin = el.scrollTop;
        let _startTime = null;
        rAF(_scrollAnim);
        function _scrollAnim(now) {
            if (_startTime == null)
                _startTime = now;
            const frame = now - _startTime;
            const progress = 1 / Number(duration) * frame;
            const easedProgress = easing ? easing(progress) : progress;
            const result = scrollBegin + toScroll * easedProgress;
            if (Number(duration) - frame > 0) {
                if (frame > 0)
                    el.scrollTop = result;
                rAF(_scrollAnim);
            }
            else
                el.scrollTop = Number(top);
        }
    }

    /* src\App.svelte generated by Svelte v3.37.0 */

    const { document: document_1 } = globals;
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let link0;
    	let meta0;
    	let meta1;
    	let meta2;
    	let meta3;
    	let meta4;
    	let meta5;
    	let meta6;
    	let link1;
    	let link2;
    	let link3;
    	let link4;
    	let link5;
    	let link6;
    	let link7;
    	let link8;
    	let t0;
    	let svg24;
    	let symbol0;
    	let svg0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let symbol1;
    	let svg1;
    	let path8;
    	let symbol2;
    	let svg2;
    	let path9;
    	let symbol3;
    	let svg3;
    	let path10;
    	let symbol4;
    	let svg4;
    	let path11;
    	let symbol5;
    	let svg5;
    	let path12;
    	let symbol6;
    	let svg6;
    	let path13;
    	let symbol7;
    	let svg7;
    	let path14;
    	let path15;
    	let path16;
    	let symbol8;
    	let svg8;
    	let path17;
    	let path18;
    	let path19;
    	let path20;
    	let path21;
    	let symbol9;
    	let svg9;
    	let path22;
    	let path23;
    	let symbol10;
    	let svg10;
    	let path24;
    	let path25;
    	let symbol11;
    	let svg11;
    	let path26;
    	let path27;
    	let symbol12;
    	let svg12;
    	let path28;
    	let path29;
    	let symbol13;
    	let svg13;
    	let path30;
    	let path31;
    	let symbol14;
    	let svg14;
    	let path32;
    	let path33;
    	let path34;
    	let path35;
    	let path36;
    	let symbol15;
    	let svg15;
    	let path37;
    	let path38;
    	let path39;
    	let path40;
    	let path41;
    	let path42;
    	let path43;
    	let symbol16;
    	let svg16;
    	let path44;
    	let path45;
    	let symbol17;
    	let svg17;
    	let path46;
    	let path47;
    	let symbol18;
    	let svg18;
    	let path48;
    	let path49;
    	let symbol19;
    	let svg19;
    	let path50;
    	let symbol20;
    	let svg20;
    	let path51;
    	let symbol21;
    	let svg21;
    	let path52;
    	let path53;
    	let path54;
    	let symbol22;
    	let svg22;
    	let circle;
    	let path55;
    	let symbol23;
    	let svg23;
    	let clipPath;
    	let path56;
    	let linearGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient1;
    	let stop2;
    	let stop3;
    	let linearGradient2;
    	let stop4;
    	let stop5;
    	let g;
    	let path57;
    	let path58;
    	let path59;
    	let t1;
    	let link9;
    	let t2;
    	let main;
    	let span;
    	let t4;
    	let landingsection;
    	let t5;
    	let projectssection;
    	let t6;
    	let skillssection;
    	let t7;
    	let aboutmesection;
    	let t8;
    	let contactsection;
    	let t9;
    	let footersection;
    	let main_lock_scroll_value;
    	let current;
    	let mounted;
    	let dispose;
    	landingsection = new LandingSection({ $$inline: true });
    	landingsection.$on("goToSection", /*goToSection*/ ctx[3]);
    	projectssection = new ProjectsSection({ $$inline: true });
    	skillssection = new SkillsSection({ $$inline: true });
    	aboutmesection = new AboutMeSection({ $$inline: true });
    	contactsection = new ContactSection({ $$inline: true });
    	footersection = new FooterSection({ $$inline: true });

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			meta0 = element("meta");
    			meta1 = element("meta");
    			meta2 = element("meta");
    			meta3 = element("meta");
    			meta4 = element("meta");
    			meta5 = element("meta");
    			meta6 = element("meta");
    			link1 = element("link");
    			link2 = element("link");
    			link3 = element("link");
    			link4 = element("link");
    			link5 = element("link");
    			link6 = element("link");
    			link7 = element("link");
    			link8 = element("link");
    			t0 = space();
    			svg24 = svg_element("svg");
    			symbol0 = svg_element("symbol");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			symbol1 = svg_element("symbol");
    			svg1 = svg_element("svg");
    			path8 = svg_element("path");
    			symbol2 = svg_element("symbol");
    			svg2 = svg_element("svg");
    			path9 = svg_element("path");
    			symbol3 = svg_element("symbol");
    			svg3 = svg_element("svg");
    			path10 = svg_element("path");
    			symbol4 = svg_element("symbol");
    			svg4 = svg_element("svg");
    			path11 = svg_element("path");
    			symbol5 = svg_element("symbol");
    			svg5 = svg_element("svg");
    			path12 = svg_element("path");
    			symbol6 = svg_element("symbol");
    			svg6 = svg_element("svg");
    			path13 = svg_element("path");
    			symbol7 = svg_element("symbol");
    			svg7 = svg_element("svg");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			symbol8 = svg_element("symbol");
    			svg8 = svg_element("svg");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			path21 = svg_element("path");
    			symbol9 = svg_element("symbol");
    			svg9 = svg_element("svg");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			symbol10 = svg_element("symbol");
    			svg10 = svg_element("svg");
    			path24 = svg_element("path");
    			path25 = svg_element("path");
    			symbol11 = svg_element("symbol");
    			svg11 = svg_element("svg");
    			path26 = svg_element("path");
    			path27 = svg_element("path");
    			symbol12 = svg_element("symbol");
    			svg12 = svg_element("svg");
    			path28 = svg_element("path");
    			path29 = svg_element("path");
    			symbol13 = svg_element("symbol");
    			svg13 = svg_element("svg");
    			path30 = svg_element("path");
    			path31 = svg_element("path");
    			symbol14 = svg_element("symbol");
    			svg14 = svg_element("svg");
    			path32 = svg_element("path");
    			path33 = svg_element("path");
    			path34 = svg_element("path");
    			path35 = svg_element("path");
    			path36 = svg_element("path");
    			symbol15 = svg_element("symbol");
    			svg15 = svg_element("svg");
    			path37 = svg_element("path");
    			path38 = svg_element("path");
    			path39 = svg_element("path");
    			path40 = svg_element("path");
    			path41 = svg_element("path");
    			path42 = svg_element("path");
    			path43 = svg_element("path");
    			symbol16 = svg_element("symbol");
    			svg16 = svg_element("svg");
    			path44 = svg_element("path");
    			path45 = svg_element("path");
    			symbol17 = svg_element("symbol");
    			svg17 = svg_element("svg");
    			path46 = svg_element("path");
    			path47 = svg_element("path");
    			symbol18 = svg_element("symbol");
    			svg18 = svg_element("svg");
    			path48 = svg_element("path");
    			path49 = svg_element("path");
    			symbol19 = svg_element("symbol");
    			svg19 = svg_element("svg");
    			path50 = svg_element("path");
    			symbol20 = svg_element("symbol");
    			svg20 = svg_element("svg");
    			path51 = svg_element("path");
    			symbol21 = svg_element("symbol");
    			svg21 = svg_element("svg");
    			path52 = svg_element("path");
    			path53 = svg_element("path");
    			path54 = svg_element("path");
    			symbol22 = svg_element("symbol");
    			svg22 = svg_element("svg");
    			circle = svg_element("circle");
    			path55 = svg_element("path");
    			symbol23 = svg_element("symbol");
    			svg23 = svg_element("svg");
    			clipPath = svg_element("clipPath");
    			path56 = svg_element("path");
    			linearGradient0 = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			linearGradient2 = svg_element("linearGradient");
    			stop4 = svg_element("stop");
    			stop5 = svg_element("stop");
    			g = svg_element("g");
    			path57 = svg_element("path");
    			path58 = svg_element("path");
    			path59 = svg_element("path");
    			t1 = space();
    			link9 = element("link");
    			t2 = space();
    			main = element("main");
    			span = element("span");
    			span.textContent = "B E T A – Version - Currently only German 🇩🇪";
    			t4 = space();
    			create_component(landingsection.$$.fragment);
    			t5 = space();
    			create_component(projectssection.$$.fragment);
    			t6 = space();
    			create_component(skillssection.$$.fragment);
    			t7 = space();
    			create_component(aboutmesection.$$.fragment);
    			t8 = space();
    			create_component(contactsection.$$.fragment);
    			t9 = space();
    			create_component(footersection.$$.fragment);
    			document_1.title = "Daniel Sharkov";
    			attr_dev(link0, "rel", "mask-icon");
    			attr_dev(link0, "href", "logo/vector.svg");
    			attr_dev(link0, "color", "#000000");
    			add_location(link0, file, 40, 1, 1856);
    			attr_dev(meta0, "name", "theme-color");
    			attr_dev(meta0, "content", "#000000");
    			add_location(meta0, file, 41, 1, 1920);
    			attr_dev(meta1, "name", "apple-mobile-web-app-status-bar-style");
    			attr_dev(meta1, "content", "#000000");
    			add_location(meta1, file, 42, 1, 1966);
    			attr_dev(meta2, "name", "apple-touch-fullscreen");
    			attr_dev(meta2, "content", "yes");
    			add_location(meta2, file, 43, 1, 2038);
    			attr_dev(meta3, "name", "apple-mobile-web-app-capable");
    			attr_dev(meta3, "content", "yes");
    			add_location(meta3, file, 44, 1, 2091);
    			attr_dev(meta4, "name", "application-name");
    			attr_dev(meta4, "content", "Daniel Sharkov");
    			add_location(meta4, file, 45, 1, 2150);
    			attr_dev(meta5, "name", "msapplication-TileColor");
    			attr_dev(meta5, "content", "#000000");
    			add_location(meta5, file, 46, 1, 2208);
    			attr_dev(meta6, "name", "msapplication-navbutton-color");
    			attr_dev(meta6, "content", "#000000");
    			add_location(meta6, file, 47, 1, 2266);
    			attr_dev(link1, "rel", "apple-touch-icon");
    			attr_dev(link1, "type", "image/png");
    			attr_dev(link1, "href", "logo/64x64.png");
    			add_location(link1, file, 48, 1, 2330);
    			attr_dev(link2, "rel", "apple-touch-icon");
    			attr_dev(link2, "type", "image/png");
    			attr_dev(link2, "sizes", "128x128");
    			attr_dev(link2, "href", "logo/128x128.png");
    			add_location(link2, file, 49, 1, 2401);
    			attr_dev(link3, "rel", "apple-touch-icon");
    			attr_dev(link3, "type", "image/png");
    			attr_dev(link3, "sizes", "192x192");
    			attr_dev(link3, "href", "logo/192x192.png");
    			add_location(link3, file, 50, 1, 2490);
    			attr_dev(link4, "rel", "apple-touch-icon");
    			attr_dev(link4, "type", "image/png");
    			attr_dev(link4, "sizes", "256x256");
    			attr_dev(link4, "href", "logo/256x256.png");
    			add_location(link4, file, 51, 1, 2579);
    			attr_dev(link5, "rel", "apple-touch-icon");
    			attr_dev(link5, "type", "image/png");
    			attr_dev(link5, "sizes", "512x512");
    			attr_dev(link5, "href", "logo/512x512.png");
    			add_location(link5, file, 52, 1, 2668);
    			attr_dev(link6, "rel", "bookmark");
    			attr_dev(link6, "title", "DaSh");
    			attr_dev(link6, "href", "https://danielsharkov.com");
    			add_location(link6, file, 53, 1, 2757);
    			attr_dev(link7, "rel", "fluid-icon");
    			attr_dev(link7, "type", "image/png");
    			attr_dev(link7, "href", "logo/512x512.png");
    			add_location(link7, file, 54, 1, 2827);
    			attr_dev(link8, "rel", "manifest");
    			attr_dev(link8, "href", "manifest.json");
    			add_location(link8, file, 55, 1, 2894);
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M60 11C32.3894 11 10 33.3844 10 61C10 83.0905 24.3265 101.833 44.1931 108.444C46.6919 108.907 47.6093 107.359 47.6093 106.039C47.6093 104.847 47.5629 100.908 47.5414 96.7298C33.6314 99.7544 30.6962 90.8304 30.6962 90.8304C28.4217 85.052 25.1446 83.5144 25.1446 83.5144C20.6081 80.4111 25.4865 80.4749 25.4865 80.4749C30.5074 80.8276 33.1511 85.6282 33.1511 85.6282C37.6106 93.2713 44.848 91.0614 47.7012 89.7839C48.1508 86.5531 49.4458 84.3465 50.8757 83.0979C39.77 81.8344 28.0955 77.5463 28.0955 58.3877C28.0955 52.9297 30.0487 48.4685 33.2472 44.967C32.728 43.7077 31.0166 38.6222 33.7324 31.7351C33.7324 31.7351 37.931 30.3921 47.4851 36.8611C51.4735 35.7533 55.7508 35.1977 60 35.1778C64.2492 35.1977 68.5298 35.7533 72.5257 36.8611C82.069 30.3921 86.2618 31.7351 86.2618 31.7351C88.9834 38.6222 87.272 43.7077 86.7528 44.967C89.9588 48.4685 91.8979 52.9297 91.8979 58.3877C91.8979 77.5927 80.201 81.8204 69.0672 83.0582C70.8606 84.6098 72.4586 87.6526 72.4586 92.3175C72.4586 99.0075 72.4015 104.392 72.4015 106.039C72.4015 107.37 73.3007 108.928 75.8351 108.438C95.6917 101.819 110 83.0839 110 61C110 33.3844 87.6139 11 60 11Z");
    			add_location(path0, file, 61, 3, 3088);
    			attr_dev(path1, "d", "M28.9379 82.7884C28.8277 83.0377 28.4369 83.1122 28.0809 82.9416C27.7174 82.7777 27.5146 82.439 27.6321 82.1898C27.7398 81.9348 28.1306 81.8636 28.4932 82.0341C28.8559 82.1973 29.0629 82.5392 28.9379 82.7884Z");
    			add_location(path1, file, 62, 3, 4278);
    			attr_dev(path2, "d", "M30.9634 85.0476C30.7249 85.2686 30.2579 85.166 29.9425 84.8166C29.6146 84.468 29.5541 84.001 29.7959 83.7775C30.0418 83.5564 30.4939 83.6599 30.8209 84.0085C31.1488 84.3612 31.2126 84.8232 30.9634 85.0476Z");
    			add_location(path2, file, 63, 3, 4503);
    			attr_dev(path3, "d", "M32.9347 87.9268C32.6284 88.1405 32.1266 87.9409 31.8169 87.4963C31.5106 87.0508 31.5106 86.5176 31.8244 86.304C32.1341 86.0904 32.6284 86.2833 32.9422 86.7238C33.2477 87.1759 33.2477 87.7091 32.9347 87.9268Z");
    			add_location(path3, file, 64, 3, 4726);
    			attr_dev(path4, "d", "M35.6353 90.7092C35.3612 91.0114 34.7775 90.9303 34.3503 90.5171C33.9131 90.1147 33.7914 89.5426 34.0655 89.2404C34.3437 88.9373 34.9307 89.0226 35.3612 89.4316C35.7951 89.834 35.9267 90.4103 35.6353 90.7092Z");
    			add_location(path4, file, 65, 3, 4951);
    			attr_dev(path5, "d", "M39.3612 92.3247C39.2395 92.7163 38.6781 92.8935 38.1118 92.7271C37.5463 92.5557 37.1762 92.0978 37.2904 91.702C37.408 91.3079 37.9727 91.1224 38.5432 91.3005C39.1078 91.471 39.4788 91.9264 39.3612 92.3247Z");
    			add_location(path5, file, 66, 3, 5176);
    			attr_dev(path6, "d", "M43.4534 92.6239C43.4675 93.0363 42.9873 93.3782 42.3928 93.3857C41.795 93.3989 41.3106 93.0652 41.304 92.6595C41.304 92.243 41.7743 91.9052 42.3713 91.8945C42.9657 91.8829 43.4534 92.2149 43.4534 92.6239Z");
    			add_location(path6, file, 67, 3, 5399);
    			attr_dev(path7, "d", "M47.261 91.9762C47.3322 92.3778 46.919 92.7909 46.3287 92.901C45.7483 93.0078 45.2109 92.7586 45.1372 92.3604C45.0652 91.948 45.485 91.5349 46.0654 91.4281C46.6566 91.3254 47.1856 91.5672 47.261 91.9762Z");
    			add_location(path7, file, 68, 3, 5621);
    			attr_dev(svg0, "class", "icon");
    			attr_dev(svg0, "viewBox", "0 0 120 120");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file, 60, 2, 3008);
    			attr_dev(symbol0, "id", "LOGO_GitHub");
    			add_location(symbol0, file, 59, 1, 2979);
    			attr_dev(path8, "d", "M108.103 41.1921L62.3996 10.7233C60.8396 9.76331 59.1748 9.75452 57.6006 10.7233L11.8973 41.1921C10.7254 41.9732 10 43.3685 10 44.7634V75.2321C10 76.6272 10.7254 78.0223 11.8975 78.8036L57.6007 109.277C59.1607 110.237 60.8256 110.245 62.3998 109.277L108.103 78.8036C109.275 78.0225 110.001 76.6272 110.001 75.2321V44.7634C110 43.3685 109.275 41.9732 108.103 41.1921V41.1921ZM64.2971 22.3301L97.9468 44.7634L82.9356 54.8082L64.2971 42.3638V22.3301ZM55.7033 22.3301V42.3638L37.0647 54.8082L22.0536 44.7634L55.7033 22.3301ZM18.5938 52.7992L29.3639 59.9979L18.5938 67.1965V52.7992ZM55.7033 97.6656L22.0536 75.2323L37.0647 65.1875L55.7033 77.6319V97.6656ZM60.0002 70.1541L44.8214 59.9979L60.0002 49.8416L75.1789 59.9979L60.0002 70.1541ZM64.2971 97.6656V77.6319L82.9356 65.1875L97.9468 75.2323L64.2971 97.6656ZM101.407 67.1965L90.6364 59.9979L101.407 52.7992V67.1965Z");
    			add_location(path8, file, 73, 3, 5971);
    			attr_dev(svg1, "class", "icon");
    			attr_dev(svg1, "viewBox", "0 0 120 120");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file, 72, 2, 5891);
    			attr_dev(symbol1, "id", "LOGO_Codepen");
    			add_location(symbol1, file, 71, 1, 5861);
    			attr_dev(path9, "d", "M74.05 57.5C74.05 60.55 71.8 63.05 68.95 63.05C66.15 63.05 63.85 60.55 63.85 57.5C63.85 54.45 66.1 51.95 68.95 51.95C71.8 51.95 74.05 54.45 74.05 57.5ZM50.7 51.95C47.85 51.95 45.6 54.45 45.6 57.5C45.6 60.55 47.9 63.05 50.7 63.05C53.55 63.05 55.8 60.55 55.8 57.5C55.85 54.45 53.55 51.95 50.7 51.95ZM103.5 20.3V110C90.9035 98.8684 94.932 102.553 80.3 88.95L82.95 98.2H26.25C20.6 98.2 16 93.6 16 87.9V20.3C16 14.6 20.6 10 26.25 10H93.25C98.9 10 103.5 14.6 103.5 20.3ZM89.25 67.7C89.25 51.6 82.05 38.55 82.05 38.55C74.85 33.15 68 33.3 68 33.3L67.3 34.1C75.8 36.7 79.75 40.45 79.75 40.45C67.8729 33.9404 53.9211 33.9393 42.4 39C40.55 39.85 39.45 40.45 39.45 40.45C39.45 40.45 43.6 36.5 52.6 33.9L52.1 33.3C52.1 33.3 45.25 33.15 38.05 38.55C38.05 38.55 30.85 51.6 30.85 67.7C30.85 67.7 35.05 74.95 46.1 75.3C46.1 75.3 47.95 73.05 49.45 71.15C43.1 69.25 40.7 65.25 40.7 65.25C41.4355 65.7648 42.6484 66.4322 42.75 66.5C51.1895 71.2262 63.1773 72.7746 73.95 68.25C75.7 67.6 77.65 66.65 79.7 65.3C79.7 65.3 77.2 69.4 70.65 71.25C72.15 73.15 73.95 75.3 73.95 75.3C85 74.95 89.25 67.7 89.25 67.7V67.7Z");
    			add_location(path9, file, 78, 3, 6979);
    			attr_dev(svg2, "class", "icon");
    			attr_dev(svg2, "viewBox", "0 0 120 120");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file, 77, 2, 6899);
    			attr_dev(symbol2, "id", "LOGO_Discord");
    			add_location(symbol2, file, 76, 1, 6869);
    			attr_dev(path10, "d", "M103.246 29.2578L90.0432 91.5234C89.0471 95.918 86.4494 97.0117 82.758 94.9414L62.6409 80.1172L52.9338 89.4531C51.8596 90.5273 50.9612 91.4258 48.8909 91.4258L50.3362 70.9375L87.6213 37.2461C89.2424 35.8008 87.2698 35 85.1018 36.4453L39.008 65.4687L19.1643 59.2578C14.8479 57.9102 14.7698 54.9414 20.0627 52.8711L97.6799 22.9687C101.274 21.6211 104.418 23.7695 103.246 29.2578V29.2578Z");
    			add_location(path10, file, 83, 3, 8217);
    			attr_dev(svg3, "class", "icon");
    			attr_dev(svg3, "viewBox", "0 0 120 120");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg3, file, 82, 2, 8137);
    			attr_dev(symbol3, "id", "LOGO_Telegram");
    			add_location(symbol3, file, 81, 1, 8106);
    			attr_dev(path11, "d", "M99.7211 39.2411C99.7845 40.1294 99.7845 41.0179 99.7845 41.9061C99.7845 69 79.1628 100.218 41.4722 100.218C29.8604 100.218 19.0737 96.8554 10 91.0181C11.6498 91.2083 13.236 91.2718 14.9492 91.2718C24.5303 91.2718 33.3503 88.0358 40.3935 82.5155C31.3833 82.3251 23.8325 76.4241 21.2309 68.3021C22.5 68.4924 23.769 68.6193 25.1016 68.6193C26.9417 68.6193 28.7819 68.3654 30.495 67.9215C21.1041 66.0178 14.0608 57.7691 14.0608 47.8071V47.5534C16.7891 49.0763 19.962 50.028 23.3247 50.1548C17.8043 46.4745 14.1877 40.1929 14.1877 33.0862C14.1877 29.2791 15.2028 25.7893 16.9795 22.7436C27.0684 35.1801 42.2335 43.3019 59.2385 44.1903C58.9213 42.6675 58.7309 41.0813 58.7309 39.495C58.7309 28.2004 67.868 19 79.2259 19C85.1269 19 90.4568 21.4746 94.2005 25.4721C98.8324 24.5838 103.274 22.8705 107.208 20.5229C105.685 25.2819 102.449 29.2793 98.198 31.8172C102.322 31.3733 106.32 30.2309 110 28.6448C107.209 32.7055 103.719 36.3221 99.7211 39.2411V39.2411Z");
    			add_location(path11, file, 88, 3, 8749);
    			attr_dev(svg4, "class", "icon");
    			attr_dev(svg4, "viewBox", "0 0 120 120");
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg4, file, 87, 2, 8669);
    			attr_dev(symbol4, "id", "LOGO_Twitter");
    			add_location(symbol4, file, 86, 1, 8639);
    			attr_dev(path12, "d", "M21.8462 36.1877C21.9702 34.968 21.4947 33.7482 20.5851 32.9212L11.2611 21.6746V20H40.246L62.6566 69.142L82.3589 20H110V21.6746L102.02 29.324C101.338 29.8408 100.986 30.7091 101.131 31.5568V87.79C100.986 88.6376 101.338 89.5059 102.02 90.0227L109.814 97.6721V99.3467H70.5954V97.6721L78.6789 89.8367C79.4645 89.0511 79.4645 88.803 79.4645 87.6039V42.1625L56.9919 99.202H53.9529L27.821 42.1625V80.3887C27.5936 82.0012 28.1311 83.6138 29.2681 84.7716L39.7705 97.5067V99.1813H10V97.5274L20.5024 84.7716C21.6188 83.6138 22.1356 81.9806 21.8462 80.3887V36.1877Z");
    			add_location(path12, file, 93, 3, 9847);
    			attr_dev(svg5, "class", "icon");
    			attr_dev(svg5, "viewBox", "0 0 120 120");
    			attr_dev(svg5, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg5, file, 92, 2, 9767);
    			attr_dev(symbol5, "id", "LOGO_Medium");
    			add_location(symbol5, file, 91, 1, 9738);
    			attr_dev(path13, "d", "M63.442 87.9756C59.9772 81.1561 55.9126 74.2681 47.9838 74.2681C46.468 74.2681 44.9544 74.5186 43.5649 75.153L40.8714 69.7618C44.1535 66.9462 49.4579 64.7135 56.2753 64.7135C66.8814 64.7135 72.3242 69.8225 76.6457 76.3435C79.2107 70.7758 80.4301 63.257 80.4301 53.9373C80.4301 30.6646 73.1519 18.7142 56.1504 18.7142C39.3973 18.7142 32.1586 30.6646 32.1586 53.9373C32.1586 77.088 39.3973 88.9148 56.1511 88.9148C58.8136 88.9148 61.2248 88.622 63.442 87.9756ZM67.5948 96.0978C63.9226 97.0822 60.0203 97.6255 56.1504 97.6255C33.8423 97.6255 12 79.8252 12 53.938C12 27.8038 33.8423 10 56.1504 10C78.8332 10 100.466 27.6768 100.466 53.9373C100.466 68.5445 93.6493 80.4151 83.7432 88.0878C86.9441 92.8835 90.2395 96.0688 94.8277 96.0688C99.8351 96.0688 101.855 92.199 102.193 89.1639H108.714C109.096 93.2053 107.074 110 88.848 110C77.8086 110 71.9721 103.602 67.5948 96.0978Z");
    			add_location(path13, file, 98, 3, 10547);
    			attr_dev(svg6, "class", "icon");
    			attr_dev(svg6, "viewBox", "0 0 120 120");
    			attr_dev(svg6, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg6, file, 97, 2, 10467);
    			attr_dev(symbol6, "id", "LOGO_Quora");
    			add_location(symbol6, file, 96, 1, 10439);
    			attr_dev(path14, "d", "M63.7381 28.5649C64.1311 28.564 64.5239 28.585 64.9146 28.6278C64.459 28.3425 64.0835 27.9458 63.8237 27.4751C63.5639 27.0044 63.4283 26.4753 63.4297 25.9377V16.9024C63.4297 16.5254 63.4297 16.2056 63.0299 16.2056H60.5683C60.484 16.2111 60.4017 16.2339 60.3266 16.2725C60.2515 16.3111 60.1851 16.3647 60.1315 16.4301C60.078 16.4954 60.0384 16.571 60.0153 16.6523C59.9922 16.7335 59.986 16.8186 59.9971 16.9024V26.1091C60.0074 27.1045 60.254 28.0833 60.7168 28.9647C61.7009 28.6943 62.7175 28.5598 63.7381 28.5649ZM86.8462 28.5649V19.0613H88.9423C89.5781 19.0568 90.2082 19.1817 90.7943 19.4283C91.3804 19.675 91.9102 20.0383 92.3515 20.4962C92.7927 20.954 93.1363 21.4968 93.3612 22.0916C93.5861 22.6863 93.6877 23.3206 93.6598 23.9559C93.687 24.5799 93.5868 25.2029 93.3655 25.787C93.1442 26.3711 92.8064 26.9041 92.3725 27.3534C91.9386 27.8028 91.4179 28.1591 90.8419 28.4008C90.2659 28.6425 89.6468 28.7644 89.0222 28.7591C90.6496 29.1478 92.2065 29.7876 93.637 30.6553C94.7702 29.9747 95.7011 29.004 96.3336 27.8433C96.9662 26.6826 97.2774 25.3741 97.2351 24.053C97.2285 23.0094 97.0151 21.9774 96.6073 21.0168C96.1994 20.0561 95.6053 19.1858 94.8591 18.4561C94.113 17.7265 93.2297 17.1519 92.2602 16.7656C91.2906 16.3793 90.2542 16.189 89.2107 16.2056H84.5388C84.179 16.2056 83.3965 16.5369 83.3965 16.9024V28.8962C84.4617 28.6634 85.5505 28.5561 86.6406 28.5764C86.7777 28.5649 86.2751 28.5649 86.8462 28.5649ZM73.139 26.1091V16.9024C73.139 16.5369 73.139 16.2056 72.7734 16.2056H70.3118C70.2281 16.2127 70.1467 16.2365 70.0724 16.2756C69.9981 16.3147 69.9323 16.3684 69.8791 16.4333C69.8258 16.4983 69.7861 16.5733 69.7624 16.6538C69.7386 16.7344 69.7312 16.8189 69.7407 16.9024V25.9777C69.7685 26.7147 69.5206 27.4356 69.0453 27.9995C68.5701 28.5635 67.9016 28.93 67.1706 29.0276C68.7127 29.5073 69.9577 30.2784 71.3228 30.8552C72.6306 29.7072 73.139 27.9938 73.139 26.1091ZM76.5658 31.5634C78.2792 31.4206 79.4214 30.9923 79.9926 30.5239V17.0452C79.9926 16.6682 79.9412 16.2056 79.5642 16.2056H76.9142C76.5372 16.2056 76.5658 16.6682 76.5658 17.0452V31.5634ZM34.3018 30.8495V28.9476C34.3068 28.7612 34.2405 28.5799 34.1162 28.4408C33.992 28.3017 33.8194 28.2154 33.6336 28.1994H28.0193V16.9024C28.0181 16.7238 27.949 16.5523 27.8259 16.4229C27.7029 16.2935 27.5351 16.2158 27.3568 16.2056H25.3178C25.1311 16.2082 24.9524 16.2816 24.8178 16.411C24.6831 16.5403 24.6026 16.7159 24.5925 16.9024V29.7758C26.2885 30.9082 28.2659 31.5469 30.3038 31.6205C31.6758 31.646 33.0378 31.3834 34.3018 30.8495ZM39.442 17.0452C39.4026 16.8294 39.2956 16.6318 39.1364 16.4809C38.9773 16.3299 38.7743 16.2335 38.5567 16.2056H36.8433C36.6323 16.2352 36.4369 16.3335 36.2872 16.4852C36.1375 16.637 36.042 16.8337 36.0152 17.0452V29.7758C37.0872 29.2266 38.2469 28.869 39.442 28.7192V17.0452ZM103.74 41.3013C102.101 42.2559 100.238 42.7589 98.3403 42.7589C96.4431 42.7589 94.5797 42.2559 92.9402 41.3013C91.1496 40.2654 89.1176 39.72 87.049 39.72C84.9803 39.72 82.9483 40.2654 81.1577 41.3013C79.5182 42.2559 77.6548 42.7589 75.7576 42.7589C73.8604 42.7589 71.9971 42.2559 70.3575 41.3013C68.5671 40.2649 66.535 39.7192 64.4663 39.7192C62.3975 39.7192 60.3654 40.2649 58.575 41.3013C56.9551 42.2995 55.08 42.8055 53.1778 42.7577C51.2757 42.8048 49.4008 42.2989 47.7806 41.3013C46.0093 40.222 43.9658 39.673 41.8922 39.7192C39.8183 39.671 37.7743 40.2202 36.0038 41.3013C34.3838 42.2995 32.5087 42.8055 30.6065 42.7577C28.7044 42.8051 26.8294 42.2992 25.2093 41.3013C23.4388 40.2202 21.3948 39.671 19.3209 39.7192C17.2451 39.6699 15.199 40.2191 13.4268 41.3013C12.3706 41.9336 11.2102 42.3726 10 42.5977V43.6543C11.3851 43.4261 12.7145 42.9377 13.918 42.2151C15.5379 41.2168 17.413 40.7109 19.3152 40.7587C21.2174 40.7112 23.0924 41.2172 24.7124 42.2151C26.4829 43.2961 28.5269 43.8453 30.6008 43.7971C32.6767 43.8464 34.7228 43.2972 36.4949 42.2151C38.1149 41.2168 39.99 40.7109 41.8922 40.7587C43.7943 40.7112 45.6693 41.2172 47.2894 42.2151C49.0607 43.2943 51.1041 43.8434 53.1778 43.7971C55.2517 43.8453 57.2957 43.2961 59.0662 42.2151C60.7057 41.2604 62.569 40.7574 64.4663 40.7574C66.3635 40.7574 68.2268 41.2604 69.8664 42.2151C71.657 43.2509 73.689 43.7963 75.7576 43.7963C77.8262 43.7963 79.8583 43.2509 81.6489 42.2151C83.2884 41.2604 85.1517 40.7574 87.049 40.7574C88.9462 40.7574 90.8095 41.2604 92.449 42.2151C94.2396 43.2509 96.2717 43.7963 98.3403 43.7963C100.409 43.7963 102.441 43.2509 104.232 42.2151C105.852 41.2172 107.727 40.7112 109.629 40.7587H110V39.7363H109.629C107.557 39.6849 105.513 40.228 103.74 41.3013Z");
    			attr_dev(path14, "fill", "#000099");
    			add_location(path14, file, 103, 3, 11549);
    			attr_dev(path15, "d", "M109.629 31.4206C107.553 31.3786 105.508 31.9358 103.74 33.0255C102.101 33.9819 100.238 34.4858 98.3403 34.4858C96.4427 34.4858 94.5792 33.9819 92.9402 33.0255C91.1494 31.9902 89.1174 31.4452 87.049 31.4452C84.9805 31.4452 82.9485 31.9902 81.1577 33.0255C79.5182 33.9802 77.6548 34.4831 75.7576 34.4831C73.8604 34.4831 71.9971 33.9802 70.3575 33.0255C68.5671 31.9891 66.535 31.4434 64.4663 31.4434C62.3975 31.4434 60.3654 31.9891 58.575 33.0255C58.1866 33.2311 57.804 33.4367 57.4042 33.5966L55.1197 30.3697C56.0315 29.6217 56.768 28.6826 57.2772 27.6187C57.7864 26.5549 58.056 25.3923 58.0667 24.2129C58.0589 22.9412 57.7558 21.6886 57.1814 20.554C56.607 19.4194 55.7769 18.4336 54.7566 17.6745C53.7363 16.9153 52.5536 16.4035 51.3018 16.1793C50.05 15.9551 48.7632 16.0247 47.5428 16.3825C46.3225 16.7404 45.2019 17.3768 44.2694 18.2416C43.3369 19.1063 42.618 20.1758 42.1692 21.3658C41.7205 22.5557 41.5543 23.8336 41.6836 25.0988C41.8129 26.3639 42.2343 27.5818 42.9145 28.6563C46.7754 29.1875 47.4493 31.432 52.0527 31.5691L53.5776 34.4248H53.2006C51.2985 34.4719 49.4236 33.966 47.8034 32.9684C46.0322 31.8891 43.9887 31.3401 41.915 31.3863C39.8411 31.3382 37.7971 31.8873 36.0266 32.9684C34.4067 33.9666 32.5316 34.4726 30.6294 34.4248C28.7272 34.4723 26.8522 33.9663 25.2322 32.9684C23.4617 31.8873 21.4177 31.3382 19.3438 31.3863C17.254 31.3515 15.1988 31.9228 13.4268 33.0312C12.3711 33.6656 11.2106 34.1066 10 34.3334V35.39C11.3855 35.1601 12.715 34.6698 13.918 33.945C15.5379 32.9468 17.413 32.4408 19.3152 32.4886C21.2174 32.4411 23.0924 32.9471 24.7124 33.945C26.4829 35.0261 28.5269 35.5752 30.6008 35.5271C32.6747 35.5752 34.7187 35.0261 36.4892 33.945C38.1092 32.9468 39.9843 32.4408 41.8865 32.4886C43.7886 32.4411 45.6636 32.9471 47.2837 33.945C49.0566 35.0253 51.1022 35.5744 53.1778 35.5271C55.2517 35.5752 57.2957 35.0261 59.0662 33.945C60.7057 32.9904 62.569 32.4874 64.4663 32.4874C66.3635 32.4874 68.2268 32.9904 69.8664 33.945C71.657 34.9808 73.689 35.5262 75.7576 35.5262C77.8262 35.5262 79.8583 34.9808 81.6489 33.945C83.2884 32.9904 85.1517 32.4874 87.049 32.4874C88.9462 32.4874 90.8095 32.9904 92.449 33.945C94.2396 34.9808 96.2717 35.5262 98.3403 35.5262C100.409 35.5262 102.441 34.9808 104.232 33.945C105.852 32.9471 107.727 32.4411 109.629 32.4886H110V31.4206H109.629ZM49.8424 29.0561C48.5904 29.013 47.4041 28.4854 46.5336 27.5845C45.6632 26.6836 45.1767 25.4799 45.1767 24.2272C45.1767 22.9745 45.6632 21.7707 46.5336 20.8698C47.4041 19.9689 48.5904 19.4413 49.8424 19.3982C51.1198 19.419 52.3388 19.9372 53.24 20.8427C54.1413 21.7483 54.6538 22.9696 54.6685 24.2472C54.6639 25.5241 54.1535 26.7473 53.2489 27.6486C52.3443 28.55 51.1194 29.0561 49.8424 29.0561Z");
    			attr_dev(path15, "fill", "#000099");
    			add_location(path15, file, 104, 3, 16101);
    			attr_dev(path16, "d", "M103.74 37.1663C102.101 38.1209 100.238 38.6239 98.3403 38.6239C96.4431 38.6239 94.5797 38.1209 92.9402 37.1663C91.1496 36.1305 89.1176 35.5851 87.049 35.5851C84.9803 35.5851 82.9483 36.1305 81.1577 37.1663C79.5182 38.1209 77.6548 38.6239 75.7576 38.6239C73.8604 38.6239 71.9971 38.1209 70.3575 37.1663C68.5671 36.1299 66.535 35.5842 64.4663 35.5842C62.3975 35.5842 60.3654 36.1299 58.575 37.1663C56.9551 38.1645 55.08 38.6705 53.1778 38.6227C51.2756 38.6701 49.4006 38.1642 47.7806 37.1663C46.0093 36.087 43.9658 35.538 41.8922 35.5842C39.8183 35.536 37.7743 36.0852 36.0038 37.1663C34.3838 38.1645 32.5087 38.6705 30.6065 38.6227C28.7044 38.6701 26.8294 38.1642 25.2093 37.1663C23.4388 36.0852 21.3948 35.536 19.3209 35.5842C17.2451 35.5349 15.199 36.0842 13.4268 37.1663C12.3711 37.8007 11.2106 38.2417 10 38.4685V39.5251C11.3855 39.2951 12.715 38.8048 13.918 38.0801C15.5379 37.0819 17.413 36.5759 19.3152 36.6237C21.2174 36.5762 23.0924 37.0822 24.7124 38.0801C26.4829 39.1611 28.5269 39.7103 30.6008 39.6621C32.6747 39.7103 34.7187 39.1611 36.4892 38.0801C38.1092 37.0819 39.9843 36.5759 41.8865 36.6237C43.7886 36.5762 45.6636 37.0822 47.2837 38.0801C49.0566 39.1604 51.1022 39.7095 53.1778 39.6621C55.2517 39.7103 57.2957 39.1611 59.0662 38.0801C60.7057 37.1254 62.569 36.6224 64.4663 36.6224C66.3635 36.6224 68.2268 37.1254 69.8664 38.0801C71.657 39.1159 73.689 39.6613 75.7576 39.6613C77.8262 39.6613 79.8583 39.1159 81.6489 38.0801C83.2884 37.1254 85.1517 36.6224 87.049 36.6224C88.9462 36.6224 90.8095 37.1254 92.449 38.0801C94.2396 39.1159 96.2717 39.6613 98.3403 39.6613C100.409 39.6613 102.441 39.1159 104.232 38.0801C105.852 37.0822 107.727 36.5762 109.629 36.6237H110V35.6014H109.629C107.557 35.55 105.513 36.093 103.74 37.1663Z");
    			attr_dev(path16, "fill", "#000099");
    			add_location(path16, file, 105, 3, 18829);
    			attr_dev(svg7, "viewBox", "0 0 120 60");
    			attr_dev(svg7, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg7, file, 102, 2, 11483);
    			attr_dev(symbol7, "id", "LOGO_Liquid");
    			add_location(symbol7, file, 101, 1, 11454);
    			attr_dev(path17, "d", "M28.6735 110C37.8735 110 45.3402 102.533 45.3402 93.3333V76.6666H28.6735C19.4735 76.6666 12.0068 84.1333 12.0068 93.3333C12.0068 102.533 19.4735 110 28.6735 110Z");
    			attr_dev(path17, "fill", "#0ACF83");
    			add_location(path17, file, 110, 3, 20720);
    			attr_dev(path18, "d", "M12.0068 60C12.0068 50.8 19.4735 43.3334 28.6735 43.3334H45.3402V76.6666H28.6735C19.4735 76.6666 12.0068 69.2 12.0068 60Z");
    			attr_dev(path18, "fill", "#A259FF");
    			add_location(path18, file, 111, 3, 20913);
    			attr_dev(path19, "d", "M12.0068 26.6667C12.0068 17.4667 19.4735 10 28.6735 10H45.3402V43.3333H28.6735C19.4735 43.3333 12.0068 35.8667 12.0068 26.6667Z");
    			attr_dev(path19, "fill", "#F24E1E");
    			add_location(path19, file, 112, 3, 21066);
    			attr_dev(path20, "d", "M45.3398 10H62.0065C71.2066 10 78.6732 17.4667 78.6732 26.6667C78.6732 35.8667 71.2066 43.3333 62.0065 43.3333H45.3398V10Z");
    			attr_dev(path20, "fill", "#FF7262");
    			add_location(path20, file, 113, 3, 21225);
    			attr_dev(path21, "d", "M78.6732 60C78.6732 69.2 71.2066 76.6666 62.0065 76.6666C52.8065 76.6666 45.3398 69.2 45.3398 60C45.3398 50.8 52.8065 43.3334 62.0065 43.3334C71.2066 43.3334 78.6732 50.8 78.6732 60Z");
    			attr_dev(path21, "fill", "#1ABCFE");
    			add_location(path21, file, 114, 3, 21379);
    			attr_dev(svg8, "viewBox", "0 0 90 120");
    			attr_dev(svg8, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg8, file, 109, 2, 20654);
    			attr_dev(symbol8, "id", "LOGO_Figma");
    			add_location(symbol8, file, 108, 1, 20626);
    			attr_dev(path22, "d", "M105.795 69.9703C111.268 64.4968 111.268 55.591 105.795 50.1175C103.144 47.466 99.6184 46.0062 95.8688 46.0062C94.9781 46.0062 94.102 46.0875 93.2469 46.2472C96.9727 43.6988 99.3875 39.4132 99.3875 34.648C99.3875 26.9074 93.0898 20.6101 85.3492 20.6101C80.5746 20.6101 76.2816 23.0339 73.7348 26.7726C74.5773 22.3285 73.2559 17.5785 69.8793 14.2023C67.2289 11.5507 63.7031 10.0906 59.9539 10.0906C56.2039 10.0906 52.6789 11.5507 50.0273 14.2023C46.6512 17.5785 45.3297 22.3285 46.1719 26.7726C43.6254 23.0343 39.3324 20.6101 34.5574 20.6101C26.8172 20.6101 20.5199 26.907 20.5199 34.648C20.5199 39.4136 22.934 43.6988 26.6598 46.2472C25.7952 46.0862 24.9177 46.0055 24.0383 46.0062C20.2883 46.0062 16.7633 47.4664 14.1121 50.1179C11.4602 52.7691 10 56.2945 10 60.0437C10 63.7937 11.4602 67.3187 14.1117 69.9703C16.7629 72.6214 20.2883 74.082 24.0375 74.082C24.9281 74.082 25.8043 74.0007 26.6594 73.8406C22.9336 76.3894 20.5195 80.675 20.5195 85.4402C20.5195 93.1804 26.8164 99.4777 34.557 99.4777C39.332 99.4777 43.6254 97.0535 46.1719 93.3152C45.3293 97.7597 46.6508 102.51 50.0273 105.886C52.6785 108.537 56.2039 109.997 59.9531 109.997C63.7031 109.997 67.2285 108.537 69.8797 105.886C73.2559 102.509 74.5773 97.7593 73.7348 93.3152C76.2816 97.0535 80.5746 99.4777 85.3492 99.4777C93.0898 99.4777 99.3871 93.1808 99.3871 85.4402C99.3871 80.6746 96.973 76.3894 93.2469 73.8406C94.102 74.0007 94.9785 74.082 95.8688 74.082C99.6184 74.082 103.144 72.6214 105.795 69.9703Z");
    			attr_dev(path22, "fill", "black");
    			add_location(path22, file, 119, 3, 21706);
    			attr_dev(path23, "d", "M101.559 54.3508C98.4151 51.207 93.3175 51.207 90.1733 54.3508H73.6952L85.3472 42.6992C89.7937 42.6992 93.3979 39.0945 93.3979 34.648C93.3979 30.2016 89.7937 26.5965 85.3472 26.5965C80.9003 26.5965 77.296 30.2016 77.296 34.648L65.644 46.3V29.8215C68.7882 26.6773 68.7882 21.5797 65.644 18.4355C62.4995 15.291 57.4019 15.291 54.2577 18.4355C51.1136 21.5801 51.1136 26.6777 54.2577 29.8215V46.3L42.6062 34.6477C42.6062 30.2016 39.0015 26.5969 34.555 26.5969C30.1085 26.5969 26.5038 30.2016 26.5038 34.6477C26.5038 39.0945 30.1085 42.6992 34.5546 42.6992L46.2069 54.3508H29.7284C26.5839 51.2066 21.4862 51.207 18.3417 54.3508C15.1979 57.4953 15.1979 62.593 18.3417 65.7375C21.4862 68.8813 26.5839 68.8813 29.7284 65.7375H46.2062L34.555 77.3887C30.1085 77.3887 26.5038 80.993 26.5038 85.4395C26.5038 89.8863 30.1085 93.491 34.5546 93.491C39.0015 93.491 42.6062 89.8863 42.6062 85.4398L54.2577 73.7879V90.266C51.1136 93.4102 51.1136 98.5082 54.2577 101.652C57.4022 104.796 62.4999 104.796 65.6444 101.652C68.7882 98.5078 68.7882 93.4102 65.6444 90.2656V73.7879L77.296 85.4398C77.296 89.8863 80.9003 93.4906 85.3468 93.4906C89.7937 93.4906 93.3983 89.8863 93.3983 85.4398C93.3983 80.993 89.7937 77.3887 85.3472 77.3887L73.6948 65.7367H90.1733C93.3179 68.8813 98.4155 68.8813 101.559 65.7367C104.704 62.5926 104.704 57.4945 101.559 54.3504");
    			attr_dev(path23, "fill", "#FFB13B");
    			add_location(path23, file, 120, 3, 23207);
    			attr_dev(svg9, "viewBox", "0 0 120 120");
    			attr_dev(svg9, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg9, file, 118, 2, 21639);
    			attr_dev(symbol9, "id", "LOGO_SVG");
    			add_location(symbol9, file, 117, 1, 21613);
    			attr_dev(path24, "d", "M10 10H110V110H10V10Z");
    			attr_dev(path24, "fill", "#F0DB4F");
    			add_location(path24, file, 125, 3, 24691);
    			attr_dev(path25, "d", "M101.816 86.1503C101.084 81.5875 98.1083 77.7567 89.2965 74.1826C86.2357 72.7757 82.8231 71.7682 81.806 69.4487C81.4448 68.0989 81.3973 67.3384 81.6254 66.521C82.2813 63.8689 85.4467 63.0419 87.9562 63.8023C89.5722 64.3441 91.1026 65.5895 92.0246 67.5761C96.3402 64.7815 96.3307 64.8004 99.344 62.8804C98.2414 61.1693 97.652 60.3803 96.9296 59.6484C94.3345 56.7492 90.7984 55.2568 85.1425 55.3708C84.1634 55.4944 83.1749 55.6274 82.1957 55.7511C79.3726 56.464 76.6824 57.9469 75.1045 59.9336C70.3707 65.3043 71.7205 74.7054 77.4809 78.5743C83.1558 82.8329 91.4923 83.8025 92.557 87.7854C93.5931 92.6618 88.9734 94.2397 84.3821 93.6789C80.998 92.9755 79.116 91.255 77.0817 88.1276C73.3365 90.2949 73.3365 90.2949 69.4867 92.5097C70.3993 94.5059 71.3592 95.409 72.8898 97.139C80.1331 104.487 98.2604 104.126 101.511 93.004C101.644 92.6237 102.519 90.0761 101.816 86.1503ZM64.3631 55.9601H55.0094C55.0094 64.04 54.9715 72.0628 54.9715 80.1427C54.9715 85.2853 55.2377 90.0001 54.4012 91.445C53.0323 94.2871 49.4867 93.9355 47.8707 93.384C46.2263 92.5761 45.3898 91.4259 44.4202 89.8005C44.154 89.3347 43.9544 88.9735 43.8878 88.945C41.3498 90.4944 38.8212 92.0532 36.2832 93.6028C37.5476 96.1978 39.4106 98.4507 41.7965 99.9145C45.3611 102.053 50.152 102.709 55.1616 101.559C58.4221 100.608 61.2357 98.6408 62.7091 95.6465C64.8383 91.7206 64.3821 86.9678 64.3631 81.7111C64.4106 73.1369 64.3631 64.5628 64.3631 55.9601Z");
    			attr_dev(path25, "fill", "#323330");
    			add_location(path25, file, 126, 3, 24744);
    			attr_dev(svg10, "viewBox", "0 0 120 120");
    			attr_dev(svg10, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg10, file, 124, 2, 24624);
    			attr_dev(symbol10, "id", "LOGO_JavaScript");
    			add_location(symbol10, file, 123, 1, 24591);
    			attr_dev(path26, "d", "M10 60V10H110V110H10");
    			attr_dev(path26, "fill", "#007ACC");
    			add_location(path26, file, 131, 3, 26311);
    			attr_dev(path27, "d", "M31.9248 60.175V64.25H44.9248V101.25H54.1498V64.25H67.1499V60.25C67.1499 58 67.1499 56.175 67.0499 56.125C67.0499 56.05 59.1249 56.025 49.4998 56.025L31.9998 56.1V60.2L31.9248 60.175ZM90.3499 56C92.8999 56.6 94.8499 57.75 96.5999 59.575C97.5249 60.575 98.8999 62.325 98.9999 62.775C98.9999 62.925 94.6749 65.85 92.0499 67.475C91.9499 67.55 91.5499 67.125 91.1499 66.475C89.8499 64.625 88.5249 63.825 86.4499 63.675C83.4499 63.475 81.4499 65.05 81.4499 67.675C81.4499 68.475 81.5999 68.925 81.8999 69.575C82.5749 70.95 83.8249 71.775 87.6999 73.475C94.8499 76.55 97.9499 78.575 99.8249 81.475C101.95 84.725 102.425 89.8251 101 93.6501C99.3999 97.8251 95.4999 100.65 89.9249 101.575C88.1749 101.875 84.1749 101.825 82.2999 101.5C78.2999 100.75 74.4749 98.7501 72.1249 96.1751C71.1999 95.1751 69.4249 92.5001 69.5249 92.3251L70.4749 91.7251L74.2249 89.5501L77.0499 87.9001L77.6999 88.7751C78.5249 90.0751 80.3749 91.8251 81.4499 92.4251C84.6999 94.1001 89.0499 93.8751 91.1999 91.9251C92.1249 91.0751 92.5249 90.1751 92.5249 88.9251C92.5249 87.7751 92.3499 87.25 91.7749 86.375C90.9749 85.275 89.3749 84.375 84.8749 82.375C79.6999 80.175 77.4999 78.775 75.4499 76.625C74.2749 75.325 73.1999 73.3 72.6999 71.625C72.3249 70.175 72.1999 66.625 72.5499 65.2C73.6249 60.2 77.3999 56.7 82.7999 55.7C84.5499 55.35 88.6749 55.5 90.3999 55.95L90.3499 56Z");
    			attr_dev(path27, "fill", "white");
    			add_location(path27, file, 132, 3, 26363);
    			attr_dev(svg11, "viewBox", "0 0 120 120");
    			attr_dev(svg11, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg11, file, 130, 2, 26244);
    			attr_dev(symbol11, "id", "LOGO_TypeScript");
    			add_location(symbol11, file, 129, 1, 26211);
    			attr_dev(path28, "d", "M93.201 26.0851C84.7148 13.9458 67.9526 10.3476 55.8346 18.0654L34.5534 31.6243C33.1217 32.5238 31.7861 33.5697 30.5709 34.7452C29.3543 35.9208 28.2641 37.2198 27.3173 38.6209C26.3705 40.0221 25.5716 41.5178 24.9327 43.0836C24.2955 44.6502 23.8223 46.2786 23.5209 47.9427C23.2693 49.3378 23.1321 50.7527 23.1138 52.1706C23.094 53.5901 23.1931 55.008 23.4081 56.4092C23.623 57.8119 23.9539 59.1948 24.3961 60.5426C24.8382 61.8904 25.3917 63.1985 26.0503 64.4548C25.5972 65.1434 25.1789 65.8543 24.797 66.5848C24.4143 67.3151 24.0698 68.0653 23.7633 68.8306C23.4569 69.596 23.19 70.3766 22.9629 71.1695C22.7357 71.9623 22.5497 72.7658 22.4033 73.5769C21.7951 76.9878 21.8755 80.4859 22.6396 83.8653C23.0208 85.5501 23.5682 87.1937 24.2756 88.7702C24.983 90.3467 25.8445 91.85 26.8508 93.2557C35.337 105.395 52.0977 108.993 64.2157 101.275L85.4969 87.7731C86.9286 86.872 88.2611 85.8245 89.4763 84.6475C90.6913 83.4714 91.7811 82.1725 92.7284 80.7718C93.6752 79.3722 94.4741 77.8765 95.113 76.3106C95.7518 74.7463 96.226 73.118 96.5294 71.4546C96.781 70.0595 96.9166 68.6461 96.9349 67.2282C96.9532 65.8103 96.8541 64.3923 96.6376 62.9912C96.4227 61.59 96.0918 60.2087 95.6481 58.8609C95.2045 57.5146 94.651 56.2064 93.9923 54.9501C94.4452 54.2625 94.8644 53.5504 95.2471 52.8201C95.6283 52.0898 95.9744 51.3397 96.2809 50.5743C96.5873 49.8089 96.8557 49.0283 97.0844 48.2355C97.3115 47.4442 97.5006 46.6407 97.6485 45.8295C97.9504 44.128 98.0815 42.4006 98.0418 40.6731C98.0022 38.9457 97.7903 37.2274 97.4091 35.5411C97.0279 33.8564 96.4806 32.2128 95.7731 30.6363C95.0666 29.0595 94.205 27.5569 93.201 26.1507");
    			attr_dev(path28, "fill", "#FF3E00");
    			add_location(path28, file, 137, 3, 27851);
    			attr_dev(path29, "d", "M53.7552 94.4297C52.0897 94.8624 50.3678 95.0383 48.6491 94.9512C46.9309 94.8627 45.2354 94.5151 43.6223 93.9159C42.0092 93.3177 40.4966 92.4771 39.1368 91.4231C37.778 90.3684 36.5879 89.1129 35.6072 87.6999C35.0019 86.8537 34.4835 85.9511 34.0596 85.0027C33.6346 84.055 33.3051 83.0672 33.0762 82.054C32.8491 81.0401 32.721 80.0064 32.6981 78.9681C32.6753 77.9298 32.7561 76.8915 32.939 75.8685C32.968 75.7023 33.0015 75.5361 33.0381 75.3714C33.0732 75.2052 33.1128 75.0406 33.1555 74.8774C33.1967 74.7128 33.2424 74.5496 33.2912 74.3865C33.3385 74.2249 33.3903 74.0633 33.4437 73.9032L33.8447 72.6789L34.9379 73.4946C35.5645 73.952 36.2109 74.3835 36.8742 74.786C37.5374 75.19 38.2174 75.5651 38.9126 75.9096C39.6064 76.2557 40.3169 76.5729 41.038 76.858C41.7592 77.1446 42.4926 77.3992 43.2366 77.6234L44.0523 77.8597L43.9791 78.6754C43.9398 79.2305 43.9976 79.7883 44.1499 80.3235C44.2246 80.5919 44.3237 80.8511 44.4441 81.1011C44.5646 81.3512 44.7064 81.5905 44.868 81.8162C45.1641 82.2418 45.5235 82.6197 45.9337 82.9368C46.3423 83.2539 46.7982 83.507 47.2846 83.687C47.7709 83.8669 48.2802 83.9705 48.7986 83.9965C49.3154 84.0239 49.8338 83.9705 50.3354 83.8394C50.4513 83.8089 50.5641 83.7739 50.6769 83.7342C50.7898 83.6946 50.9011 83.6519 51.0093 83.6031C51.1191 83.5558 51.2258 83.504 51.3326 83.4476C51.4378 83.3927 51.5399 83.3332 51.6405 83.2692L72.8898 69.7088C73.1503 69.5455 73.393 69.3554 73.614 69.1417C73.8351 68.9267 74.0317 68.6904 74.204 68.4357C74.3763 68.1811 74.5196 67.9082 74.6355 67.6231C74.7499 67.338 74.8352 67.0422 74.8901 66.7403C74.9435 66.4308 74.9664 66.1182 74.9587 65.8042C74.9511 65.4916 74.9115 65.1806 74.8413 64.8741C74.7727 64.5692 74.6721 64.2719 74.5425 63.9852C74.4144 63.7001 74.2559 63.4287 74.0729 63.1741C73.7771 62.7487 73.4188 62.3722 73.0087 62.055C72.5986 61.7379 72.1427 61.4848 71.6578 61.3049C71.1719 61.1249 70.6614 61.02 70.1438 60.9939C69.6255 60.9679 69.1071 61.0213 68.6055 61.1509C68.4911 61.1814 68.3768 61.2165 68.2639 61.2561C68.1511 61.2957 68.0413 61.3384 67.9316 61.3857C67.8218 61.4345 67.7151 61.4863 67.6099 61.5427C67.5047 61.5976 67.401 61.6586 67.3004 61.7226L59.1404 66.9035C58.808 67.1139 58.4665 67.3121 58.1188 67.4981C57.7697 67.6826 57.416 67.8548 57.0546 68.0134C56.6933 68.172 56.3258 68.3168 55.9538 68.4464C55.5818 68.5775 55.2052 68.6934 54.824 68.7956C53.1606 69.2255 51.4423 69.3993 49.7271 69.3109C48.0118 69.2225 46.321 68.8733 44.7109 68.2772C43.1009 67.6795 41.5915 66.8394 40.2345 65.7874C38.8776 64.7354 37.6883 63.4836 36.708 62.0733C36.1057 61.2271 35.5889 60.323 35.1666 59.3747C34.7427 58.4263 34.4149 57.4383 34.1877 56.426C33.9605 55.4121 33.8355 54.3783 33.8142 53.34C33.7913 52.3033 33.8721 51.265 34.0566 50.2434C34.4171 48.2322 35.1928 46.3182 36.3344 44.6235C37.4768 42.9289 38.9605 41.4915 40.6904 40.4033L62.0052 26.8444C62.336 26.634 62.6745 26.4358 63.0206 26.2498C63.3667 26.0653 63.7204 25.893 64.0787 25.7345C64.4378 25.5758 64.803 25.4314 65.1734 25.3015C65.5424 25.1703 65.9175 25.0529 66.2971 24.9508C67.9621 24.5193 69.6834 24.3424 71.4002 24.4294C73.1185 24.5178 74.8124 24.8654 76.4255 25.4646C78.0386 26.0623 79.5495 26.9039 80.9095 27.9574C82.2678 29.0127 83.4575 30.2687 84.4376 31.6822C85.0413 32.5268 85.5612 33.4294 85.9866 34.3778C86.412 35.3261 86.7413 36.3126 86.9716 37.3265C87.2003 38.3404 87.3283 39.3741 87.3512 40.4124C87.3756 41.4507 87.2963 42.489 87.1133 43.5121C87.0813 43.6798 87.0478 43.8475 87.0097 44.0137C86.9731 44.1799 86.9334 44.346 86.8907 44.5107C86.8496 44.6769 86.8038 44.8416 86.7566 45.0047C86.7093 45.1694 86.6605 45.3325 86.6072 45.4941L86.2001 46.7184L85.1145 45.9027C84.4864 45.4408 83.8384 45.0077 83.1736 44.6007C82.5089 44.1951 81.8258 43.817 81.129 43.4678C79.7341 42.772 78.2831 42.1946 76.7914 41.7419L75.9742 41.5056L76.0489 40.6899C76.0717 40.4109 76.0702 40.1303 76.0443 39.8529C76.0199 39.5754 75.9696 39.2994 75.8964 39.0295C75.8217 38.7612 75.7256 38.4974 75.6052 38.2459C75.4863 37.9928 75.3445 37.7519 75.1829 37.5232C74.8854 37.1053 74.526 36.7351 74.1171 36.4254C73.7088 36.1143 73.2553 35.8675 72.7724 35.6936C71.8019 35.3415 70.7471 35.2942 69.749 35.5579C69.6331 35.5884 69.5187 35.6234 69.4074 35.6616C69.2946 35.7012 69.1833 35.7454 69.0735 35.7927C68.9653 35.8399 68.857 35.8933 68.7518 35.9482C68.6466 36.0046 68.5429 36.0641 68.4423 36.1281L47.1535 49.6641C46.8943 49.8272 46.6518 50.0178 46.4323 50.2312C46.2127 50.4447 46.0145 50.681 45.8422 50.9341C45.6714 51.1887 45.5268 51.4599 45.4108 51.7437C45.2949 52.0288 45.2095 52.3231 45.1546 52.625C45.1013 52.9345 45.0784 53.2486 45.086 53.5626C45.1043 54.1913 45.2457 54.8103 45.5022 55.3846C45.6316 55.6705 45.7883 55.9432 45.9703 56.1988C46.2646 56.6196 46.6213 56.9947 47.0284 57.3087C47.4347 57.6243 47.8866 57.8762 48.3686 58.0558C49.3379 58.4162 50.3937 58.4741 51.3966 58.222C51.5109 58.19 51.6253 58.1549 51.7381 58.1153C51.8494 58.0756 51.9607 58.0314 52.0705 57.9842C52.1798 57.9367 52.2871 57.8848 52.3922 57.8287C52.4974 57.7738 52.6011 57.7143 52.7017 57.6503L60.8617 52.4786C61.1956 52.2652 61.5356 52.0639 61.8847 51.8779C62.2324 51.6904 62.5876 51.5181 62.9505 51.358C63.3121 51.1993 63.6799 51.0549 64.0528 50.925C64.4264 50.7938 64.8045 50.678 65.1872 50.5773C66.8521 50.1443 68.5719 49.9675 70.2902 50.0529C72.0085 50.1398 73.7024 50.4874 75.3155 51.0851C76.9271 51.6827 78.4395 52.5228 79.798 53.5779C81.158 54.6314 82.3472 55.8862 83.3276 57.2996C83.9314 58.1458 84.4498 59.0484 84.8751 59.9967C85.3005 60.9445 85.6304 61.9323 85.8601 62.9454C86.0888 63.9578 86.2168 64.9915 86.2412 66.0298C86.2656 67.0696 86.1848 68.1079 86.0034 69.1295C85.8236 70.1324 85.54 71.114 85.1572 72.0583C84.7747 73.0029 84.2944 73.9048 83.724 74.7494C83.1553 75.594 82.4997 76.3777 81.7679 77.0867C81.036 77.7957 80.2325 78.4269 79.3696 78.9696L58.0792 92.5285C57.7453 92.7404 57.4038 92.9401 57.0561 93.1262C56.707 93.3122 56.3517 93.4844 55.9889 93.643C55.6275 93.8031 55.2601 93.9479 54.8865 94.0791C54.5145 94.2102 54.1364 94.3276 53.7552 94.4297Z");
    			attr_dev(path29, "fill", "white");
    			add_location(path29, file, 138, 3, 29492);
    			attr_dev(svg12, "viewBox", "0 0 120 120");
    			attr_dev(svg12, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg12, file, 136, 2, 27784);
    			attr_dev(symbol12, "id", "LOGO_Svelte");
    			add_location(symbol12, file, 135, 1, 27755);
    			attr_dev(path30, "d", "M71.548 17L60 37L48.452 17H10L60 103.604L110 17H71.548Z");
    			attr_dev(path30, "fill", "#4DBA87");
    			add_location(path30, file, 143, 3, 35619);
    			attr_dev(path31, "d", "M71.548 17L60 37L48.452 17H30L60 68.96L90 17H71.548Z");
    			attr_dev(path31, "fill", "#435466");
    			add_location(path31, file, 144, 3, 35706);
    			attr_dev(svg13, "viewBox", "0 0 120 120");
    			attr_dev(svg13, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg13, file, 142, 2, 35552);
    			attr_dev(symbol13, "id", "LOGO_VueJS");
    			add_location(symbol13, file, 141, 1, 35524);
    			attr_dev(path32, "d", "M21.4468 101.964L15 29.655H85.84L79.3862 101.953L50.3765 109.995L21.4468 101.964Z");
    			attr_dev(path32, "fill", "#E44D26");
    			add_location(path32, file, 149, 3, 35904);
    			attr_dev(path33, "d", "M50.4199 103.848L73.8609 97.349L79.3764 35.5676H50.4199V103.848Z");
    			attr_dev(path33, "fill", "#F16529");
    			add_location(path33, file, 150, 3, 36017);
    			attr_dev(path34, "d", "M50.4201 62.3861H38.6851L37.8745 53.3047H50.4201V44.4362H28.1821L28.3946 46.8154L30.5743 71.2543H50.4201V62.3861ZM50.4201 85.4181L50.3811 85.4287L40.5044 82.7616L39.873 75.6888H30.9706L32.2132 89.6136L50.3795 94.6566L50.4201 94.6451V85.4181Z");
    			attr_dev(path34, "fill", "#EBEBEB");
    			add_location(path34, file, 151, 3, 36113);
    			attr_dev(path35, "d", "M21.5908 10.0046H26.0975V14.4573H30.2201V10.0046H34.727V23.4884H30.2201V18.9733H26.0975V23.4884H21.5911L21.5908 10.0046ZM40.6539 14.4763H36.6865V10.0046H49.1307V14.4763H45.1614V23.4884H40.654V14.4763H40.6539ZM51.1053 10.0046H55.8049L58.6957 14.7425L61.5837 10.0046H66.2849V23.4884H61.7959V16.805L58.6952 21.5992H58.6178L55.515 16.805V23.4884H51.1052V10.0046H51.1053ZM68.5275 10.0046H73.0355V19.0316H79.3737V23.4884H68.5275V10.0046Z");
    			attr_dev(path35, "fill", "black");
    			add_location(path35, file, 152, 3, 36386);
    			attr_dev(path36, "d", "M50.3892 62.3861V71.2543H61.3098L60.2802 82.7561L50.3892 85.4255V94.6519L68.5699 89.6136L68.7029 88.1148L70.7872 64.7676L71.0036 62.3861H68.614H50.3892ZM50.3892 44.4362V53.3047H71.8107L71.9883 51.3112L72.3924 46.8154L72.6046 44.4362H50.3892Z");
    			attr_dev(path36, "fill", "white");
    			add_location(path36, file, 153, 3, 36847);
    			attr_dev(svg14, "viewBox", "0 0 100 120");
    			attr_dev(svg14, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg14, file, 148, 2, 35837);
    			attr_dev(symbol14, "id", "LOGO_HTML");
    			add_location(symbol14, file, 147, 1, 35810);
    			attr_dev(path37, "d", "M70.5166 13.7003H64.6401L70.7526 20.3368V23.493H58.1595V19.7968H64.272L58.1595 13.1602V10H70.5206L70.5166 13.7003ZM55.6593 13.7003H49.7749L55.8954 20.3368V23.493H43.2983V19.7968H49.4108L43.2983 13.1602V10H55.6593V13.7003ZM40.9461 13.8523H34.6056V19.6447H40.9461V23.497H30.0933V10H40.9461V13.8523Z");
    			attr_dev(path37, "fill", "#131313");
    			add_location(path37, file, 158, 3, 37231);
    			attr_dev(path38, "d", "M21.4485 101.971L15 29.6576H85.8457L79.3891 101.959L50.3788 110L21.4485 101.971Z");
    			attr_dev(path38, "fill", "#1572B6");
    			add_location(path38, file, 159, 3, 37559);
    			attr_dev(path39, "d", "M50.4229 103.856L73.8647 97.355L79.3772 35.5699H50.4229V103.856Z");
    			attr_dev(path39, "fill", "#33A9DC");
    			add_location(path39, file, 160, 3, 37671);
    			attr_dev(path40, "d", "M50.4229 61.7681H62.1598L62.9679 52.6874H50.4229V43.8228H72.6646L72.4526 46.2029L70.2724 70.6448H50.4229V61.7681Z");
    			attr_dev(path40, "fill", "white");
    			add_location(path40, file, 161, 3, 37767);
    			attr_dev(path41, "d", "M50.4709 84.8019H50.4309L40.5541 82.1337L39.9221 75.0612H31.0254L32.2695 88.9863L50.4389 94.0427H50.4909V84.8019H50.4709Z");
    			attr_dev(path41, "fill", "#EBEBEB");
    			add_location(path41, file, 162, 3, 37910);
    			attr_dev(path42, "d", "M61.4077 70.2568L60.3396 82.1258L50.4468 84.794V94.0347L68.6282 88.9943L68.7602 87.4942L70.3044 70.2528H61.4077V70.2568Z");
    			attr_dev(path42, "fill", "white");
    			add_location(path42, file, 163, 3, 38063);
    			attr_dev(path43, "d", "M50.4551 43.8228V52.6914H29.0374L28.8534 50.6993L28.4493 46.2029L28.2373 43.8228H50.4551ZM50.4231 61.7681V70.6368H40.6583L40.4863 68.6446L40.0823 64.1483L39.8702 61.7681H50.4191H50.4231Z");
    			attr_dev(path43, "fill", "#EBEBEB");
    			add_location(path43, file, 164, 3, 38213);
    			attr_dev(svg15, "viewBox", "0 0 100 120");
    			attr_dev(svg15, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg15, file, 157, 2, 37164);
    			attr_dev(symbol15, "id", "LOGO_CSS");
    			add_location(symbol15, file, 156, 1, 37138);
    			attr_dev(path44, "d", "M109.026 36.1319C108.748 35.9 106.243 33.9985 100.863 33.9985C99.4719 33.9985 98.0341 34.1376 96.6427 34.3695C95.6224 27.2735 89.7322 23.8414 89.5003 23.6559L88.0626 22.821L87.135 24.166C85.9755 25.9748 85.0943 28.0155 84.5841 30.1026C83.6101 34.1376 84.2131 37.9407 86.2538 41.1873C83.7957 42.5786 79.807 42.9033 78.9722 42.9497H13.1135C11.3974 42.9497 10.0061 44.3411 10.0061 46.0571C9.91329 51.8081 10.8873 57.5592 12.8816 62.9856C15.1542 68.9221 18.5399 73.3282 22.8995 76.0182C27.8157 79.0328 35.8394 80.7489 44.8833 80.7489C48.9647 80.7489 53.0461 80.3779 57.0811 79.6358C62.693 78.6154 68.073 76.6675 73.0356 73.8384C77.117 71.473 80.781 68.4584 83.8884 64.9335C89.1293 59.0433 92.2367 52.4575 94.5093 46.6137H95.4369C101.142 46.6137 104.666 44.3411 106.614 42.3931C107.913 41.1873 108.887 39.7031 109.583 38.0335L110 36.8276L109.026 36.1319Z");
    			attr_dev(path44, "fill", "#0091E2");
    			add_location(path44, file, 169, 3, 38546);
    			attr_dev(path45, "d", "M19.2357 41.0482H28.0478C28.4652 41.0482 28.8362 40.7235 28.8362 40.2597V32.3752C28.8362 31.9578 28.5116 31.5868 28.0478 31.5868H19.2357C18.8183 31.5868 18.4473 31.9114 18.4473 32.3752V40.2597C18.4936 40.7235 18.8183 41.0482 19.2357 41.0482ZM31.3871 41.0482H40.1992C40.6166 41.0482 40.9876 40.7235 40.9876 40.2597V32.3752C40.9876 31.9578 40.663 31.5868 40.1992 31.5868H31.3871C30.9697 31.5868 30.5987 31.9114 30.5987 32.3752V40.2597C30.645 40.7235 30.9697 41.0482 31.3871 41.0482ZM43.7704 41.0482H52.5825C52.9999 41.0482 53.3709 40.7235 53.3709 40.2597V32.3752C53.3709 31.9578 53.0463 31.5868 52.5825 31.5868H43.7704C43.353 31.5868 42.982 31.9114 42.982 32.3752V40.2597C42.982 40.7235 43.3066 41.0482 43.7704 41.0482ZM55.9682 41.0482H64.7803C65.1977 41.0482 65.5687 40.7235 65.5687 40.2597V32.3752C65.5687 31.9578 65.2441 31.5868 64.7803 31.5868H55.9682C55.5508 31.5868 55.1797 31.9114 55.1797 32.3752V40.2597C55.1797 40.7235 55.5508 41.0482 55.9682 41.0482ZM31.3871 29.778H40.1992C40.6166 29.778 40.9876 29.4069 40.9876 28.9895V21.105C40.9876 20.6876 40.663 20.3166 40.1992 20.3166H31.3871C30.9697 20.3166 30.5987 20.6412 30.5987 21.105V28.9895C30.645 29.4069 30.9697 29.778 31.3871 29.778ZM43.7704 29.778H52.5825C52.9999 29.778 53.3709 29.4069 53.3709 28.9895V21.105C53.3709 20.6876 53.0463 20.3166 52.5825 20.3166H43.7704C43.353 20.3166 42.982 20.6412 42.982 21.105V28.9895C42.982 29.4069 43.3066 29.778 43.7704 29.778ZM55.9682 29.778H64.7803C65.1977 29.778 65.5687 29.4069 65.5687 28.9895V21.105C65.5687 20.6876 65.1977 20.3166 64.7803 20.3166H55.9682C55.5508 20.3166 55.1797 20.6412 55.1797 21.105V28.9895C55.1797 29.4069 55.5508 29.778 55.9682 29.778ZM55.9682 18.4614H64.7803C65.1977 18.4614 65.5687 18.1367 65.5687 17.673V9.78846C65.5687 9.37104 65.1977 9 64.7803 9H55.9682C55.5508 9 55.1797 9.32466 55.1797 9.78846V17.673C55.1797 18.0904 55.5508 18.4614 55.9682 18.4614ZM68.2587 41.0482H77.0708C77.4882 41.0482 77.8593 40.7235 77.8593 40.2597V32.3752C77.8593 31.9578 77.5346 31.5868 77.0708 31.5868H68.2587C67.8413 31.5868 67.4703 31.9114 67.4703 32.3752V40.2597C67.5167 40.7235 67.8413 41.0482 68.2587 41.0482Z");
    			attr_dev(path45, "fill", "#0091E2");
    			add_location(path45, file, 170, 3, 39427);
    			attr_dev(svg16, "viewBox", "0 0 120 90");
    			attr_dev(svg16, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg16, file, 168, 2, 38480);
    			attr_dev(symbol16, "id", "LOGO_Docker");
    			add_location(symbol16, file, 167, 1, 38451);
    			attr_dev(path46, "d", "M16.7062 85.0189C17.1602 85.826 17.8159 86.4313 18.623 86.8852L57.4628 109.281C59.0769 110.24 61.0441 110.24 62.6078 109.281L101.448 86.8852C103.062 85.9773 104.02 84.2623 104.02 82.396V37.604C104.02 35.7377 103.062 34.0227 101.448 33.1148L62.6078 10.7188C60.9937 9.7604 59.0265 9.7604 57.4628 10.7188L18.623 33.1148C16.9584 34.0227 16 35.7377 16 37.604V82.4464C16 83.3543 16.2018 84.2118 16.7062 85.0189Z");
    			attr_dev(path46, "fill", "#009639");
    			add_location(path46, file, 175, 3, 41693);
    			attr_dev(path47, "d", "M47.5763 77.0996C47.5763 79.8739 45.3568 82.0933 42.5826 82.0933C39.8083 82.0933 37.5889 79.8739 37.5889 77.0996V42.85C37.5889 40.1766 39.9596 38.0076 43.2383 38.0076C45.609 38.0076 48.3833 38.966 50.0479 41.0341L51.5611 42.85L72.4439 67.8184V42.9508C72.4439 40.1766 74.6633 37.9572 77.4375 37.9572C80.2118 37.9572 82.4312 40.1766 82.4312 42.9508V77.2005C82.4312 79.8739 80.0605 82.0429 76.7818 82.0429C74.4111 82.0429 71.6368 81.0845 69.9722 79.0164L47.5763 52.2825V77.0996Z");
    			attr_dev(path47, "fill", "white");
    			add_location(path47, file, 176, 3, 42130);
    			attr_dev(svg17, "viewBox", "0 0 120 120");
    			attr_dev(svg17, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg17, file, 174, 2, 41626);
    			attr_dev(symbol17, "id", "LOGO_Nginx");
    			add_location(symbol17, file, 173, 1, 41598);
    			attr_dev(path48, "d", "M17.5435 22.7021C17.3501 22.7021 17.3017 22.6054 17.3984 22.4603L18.4139 21.1547C18.5106 21.0096 18.7524 20.9129 18.9458 20.9129H36.2089C36.4023 20.9129 36.4507 21.058 36.3539 21.2031L35.5319 22.4603C35.4352 22.6054 35.1934 22.7504 35.0483 22.7504L17.5435 22.7021ZM10.2418 27.1508C10.0483 27.1508 9.99998 27.0541 10.0967 26.909L11.1122 25.6034C11.2089 25.4584 11.4507 25.3617 11.6441 25.3617H33.6944C33.8878 25.3617 33.9845 25.5067 33.9362 25.6518L33.5493 26.8123C33.5009 27.0058 33.3075 27.1025 33.1141 27.1025L10.2418 27.1508ZM21.9439 31.5996C21.7505 31.5996 21.7021 31.4545 21.7988 31.3094L22.4758 30.1005C22.5725 29.9555 22.7659 29.8104 22.9594 29.8104H32.6305C32.824 29.8104 32.9207 29.9555 32.9207 30.1489L32.824 31.3094C32.824 31.5029 32.6305 31.6479 32.4855 31.6479L21.9439 31.5996ZM72.1373 21.8317C69.0909 22.6054 67.0116 23.1856 64.0135 23.9593C63.2882 24.1528 63.2398 24.2011 62.6112 23.4758C61.8859 22.6537 61.3539 22.1218 60.3385 21.6383C57.2921 20.1392 54.3423 20.5744 51.5861 22.3636C48.2979 24.4913 46.6054 27.6344 46.6538 31.5512C46.7021 35.4197 49.3617 38.6112 53.1818 39.1431C56.47 39.5783 59.2263 38.4178 61.4023 35.9516C61.8375 35.4197 62.2244 34.8394 62.7079 34.1624H53.3752C52.3597 34.1624 52.118 33.5338 52.4565 32.7118C53.0851 31.2127 54.2456 28.6982 54.9226 27.441C55.0677 27.1508 55.4062 26.6673 56.1315 26.6673H73.7331C73.6363 27.9729 73.6363 29.2785 73.4429 30.5841C72.911 34.0657 71.6054 37.2572 69.4777 40.0619C65.9961 44.6557 61.4507 47.5087 55.6963 48.2824C50.9574 48.911 46.557 47.9922 42.6886 45.0909C39.1102 42.3829 37.0793 38.8046 36.5474 34.3559C35.9187 29.0851 37.4661 24.3462 40.6576 20.1876C44.0909 15.6905 48.6363 12.8375 54.1973 11.822C58.7427 11 63.0948 11.5319 67.0116 14.1914C69.5745 15.8839 71.412 18.205 72.6209 21.0096C72.911 21.4448 72.7176 21.6866 72.1373 21.8317Z");
    			attr_dev(path48, "fill", "#01ADD8");
    			add_location(path48, file, 181, 3, 42750);
    			attr_dev(path49, "d", "M88.1432 48.5726C83.7428 48.4759 79.7293 47.2186 76.3444 44.3173C73.4914 41.8511 71.7022 38.708 71.1219 34.9846C70.2515 29.5204 71.7506 24.6848 75.0388 20.3811C78.5688 15.7389 82.8241 13.3212 88.5784 12.3057C93.5107 11.4353 98.1529 11.9188 102.36 14.7718C106.18 17.383 108.549 20.913 109.178 25.5552C110 32.0832 108.114 37.4024 103.617 41.9478C100.426 45.1877 96.5088 47.2186 92.0117 48.1374C90.7061 48.3792 89.4005 48.4275 88.1432 48.5726ZM99.6519 29.0368C99.6036 28.4082 99.6036 27.9246 99.5069 27.4411C98.6364 22.6538 94.2361 19.9459 89.6423 21.0097C85.1452 22.0252 82.2438 24.8782 81.18 29.4237C80.3096 33.1954 82.1471 37.0155 85.6287 38.5629C88.2883 39.7235 90.9479 39.5784 93.5107 38.2728C97.3308 36.2902 99.4101 33.1954 99.6519 29.0368Z");
    			attr_dev(path49, "fill", "#01ADD8");
    			add_location(path49, file, 182, 3, 44597);
    			attr_dev(svg18, "viewBox", "0 0 120 60");
    			attr_dev(svg18, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg18, file, 180, 2, 42684);
    			attr_dev(symbol18, "id", "LOGO_Golang");
    			add_location(symbol18, file, 179, 1, 42655);
    			attr_dev(path50, "d", "M25.4119 56.7741C28.0057 53.6718 28.3108 50.4677 26.302 44.5173C25.0305 40.7536 22.9198 37.8548 24.4709 35.5153C26.1239 33.0232 29.633 35.4392 26.7088 38.7702L27.2936 39.1773C30.803 39.5841 32.5321 34.7778 29.9127 33.4048C22.9961 29.7939 16.944 36.736 19.6139 44.7716C20.7584 48.179 22.3604 51.7899 21.0635 54.6636C19.9446 57.1302 17.7832 58.5796 16.3336 58.6304C13.3076 58.7831 15.3166 51.8409 18.8004 50.1116C19.1055 49.9593 19.5377 49.7558 19.1309 49.2472C14.8334 48.764 12.3158 50.7474 10.8664 53.5192C6.64514 61.5802 18.8766 64.5554 25.4119 56.7741ZM100.936 33.0741C101.928 35.5155 103.429 37.9312 102.538 40.0671C101.801 41.8981 100.835 42.6608 99.7666 42.839C98.2664 43.0933 98.6733 38.3888 101.242 36.9903C101.47 36.8632 101.801 36.2528 101.496 35.8968C98.2408 35.7189 96.41 37.2698 95.4182 39.3298C92.5448 45.3564 101.928 47.0095 106.531 41.0843C108.362 38.7194 108.438 36.38 106.683 32.1331C105.564 29.4378 103.861 27.4288 104.929 25.6487C106.073 23.7671 108.819 25.3946 106.76 27.912L107.217 28.1663C109.887 28.3189 110.981 24.7589 108.947 23.8689C103.581 21.5802 98.5715 27.3526 100.936 33.0741V33.0741ZM66.9631 26.6405C65.1069 25.1657 59.8938 27.6323 58.419 31.294C56.5625 35.9476 53.8162 42.7374 51.1207 45.7124C48.2727 48.8401 47.993 46.4245 48.2727 44.619C48.9338 40.3724 53.0787 30.5312 55.342 27.7595C54.5028 26.5134 49.01 26.6915 45.1957 32.6165C43.7719 34.8542 40.5168 42.305 36.9059 48.179C36.1176 49.4505 35.1258 48.5605 35.8887 45.5853C36.7533 42.1524 39.2961 32.7181 42.5766 25.2929C51.1715 23.5892 60.3006 22.3939 67.2936 22.3685C68.2346 22.1142 68.8703 21.2751 67.2936 21.2241C61.267 21.0208 52.2143 21.7327 43.7463 22.8009C45.3739 19.5458 47.1283 16.9521 48.9084 15.8587C46.9758 14.638 43.0598 15.1212 40.8219 18.4271C39.8303 19.9019 38.8385 21.6819 37.8977 23.6146C31.6928 24.5808 26.3781 25.6743 23.6828 26.6915C20.8856 27.7595 21.1906 31.1415 22.8944 30.506C26.4291 29.1837 31.2098 27.8103 36.5244 26.5898C33.1424 34.2187 30.4977 43.2204 29.8619 46.8821C28.2854 55.7825 33.8033 55.7315 36.499 52.2224C39.4233 48.3825 45.5264 34.8796 46.4672 33.4556C46.7469 32.9724 47.1283 33.2267 46.925 33.6591C40.11 47.2636 40.6948 52.5274 46.2129 51.3577C48.7051 50.8237 53.0026 46.5517 54.1213 44.3394C54.3502 43.8052 54.8334 43.8562 54.7317 44.0851C50.4088 55.2993 44.916 64.3774 41.2287 67.2255C37.8721 69.7939 35.3801 64.2249 47.2555 56.2401C49.0102 55.0448 48.1963 53.4175 46.2129 53.9769C40.0846 54.9433 22.5385 60.512 14.8334 65.8523C14.2485 66.2591 13.7145 66.5898 13.7399 67.429C13.7653 67.912 14.6045 67.7341 15.0114 67.4798C24.9795 61.504 33.1422 59.1644 42.5002 57.2064C42.6274 57.2571 42.7799 57.2825 42.9071 57.2317C43.3395 57.1302 43.3141 57.3589 43.0342 57.537C42.3985 57.8931 41.7627 58.2235 41.6104 58.2745C35.3037 60.7411 31.4893 66.1827 32.8371 68.9546C33.9817 71.345 40.1608 70.4804 43.0852 68.9038C50.2561 65.0132 55.4692 57.3843 59.0291 46.8569C62.1315 37.5243 66.0477 26.9458 66.9631 26.6405V26.6405ZM108.641 48.179C96.9696 46.6532 71.7946 48.6876 60.6821 51.6374C57.3764 52.5021 58.2918 54.2565 59.9701 53.9261C59.9955 53.9261 60.7074 53.748 60.733 53.748C69.8619 51.9681 92.0108 50.4169 104.929 52.8835C106.48 53.1632 111.133 48.5097 108.641 48.179ZM70.218 46.806C73.4729 45.1784 78.3045 35.1085 81.483 29.5903C81.7119 29.1835 82.1188 29.5142 81.8901 29.7939C73.8543 43.6273 77.2619 45.2294 80.4405 45.0259C84.6871 44.7716 88.6033 38.6685 89.4678 37.2954C89.8239 36.7614 90.0274 37.1939 89.8239 37.5751C89.6205 38.2108 88.883 39.3298 88.1963 40.8556C87.2301 43.0169 88.2471 43.8562 89.0864 44.2376C90.4086 44.8733 94.0198 44.4665 94.5791 42.254C90.9682 42.1778 99.6141 25.1403 100.504 24.0978C98.0883 22.6991 94.3502 24.2247 92.6465 27.5815C89.0102 34.7778 85.9586 40.5757 84.0514 40.6774C80.3389 40.881 88.3235 24.6317 89.6205 24.1231C88.8321 22.9788 83.7717 23.462 80.949 27.8358C79.9319 29.4124 73.7272 40.3978 72.2016 42.2032C69.5061 45.4073 69.3026 42.661 70.0655 39.4569C70.3198 38.3634 70.752 36.9648 71.3115 35.4136C73.0914 31.396 74.9987 30.1245 76.1684 28.8276C84.026 20.1054 88.527 13.036 86.7469 10.2642C85.1703 7.79756 79.9065 8.89112 76.5244 13.9771C70.2944 23.3095 64.5473 36.1001 63.8098 41.9489C63.0979 47.7976 67.3446 48.23 70.218 46.806ZM73.5239 29.6921C73.8035 29.0564 73.9815 28.8784 74.4647 27.8103C77.2619 21.6565 80.7711 15.172 83.1869 12.146C84.6871 10.5694 86.7979 12.7054 82.9834 18.5542C80.7457 22.0124 78.2028 25.1911 75.4311 27.9884V28.0138C74.719 28.8021 74.0834 29.4632 73.8035 29.8446C73.6 30.0989 73.3713 30.0481 73.5239 29.6921V29.6921Z");
    			attr_dev(path50, "fill", "#333333");
    			attr_dev(path50, "stroke", "#aaa");
    			attr_dev(path50, "stroke-width", "1");
    			add_location(path50, file, 187, 3, 45487);
    			attr_dev(svg19, "viewBox", "0 0 120 80");
    			attr_dev(svg19, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg19, file, 186, 2, 45421);
    			attr_dev(symbol19, "id", "LOGO_Stylus");
    			add_location(symbol19, file, 185, 1, 45392);
    			attr_dev(path51, "d", "M92.4 45c-3.1 0-5.8.8-8.1 2-.9-1.7-1.7-3.2-1.8-4.3-.2-1.2-.4-2-.2-3.6.2-1.5 1-3.6 1-3.8 0-.2-.1-1-2-1-1.7 0-3.3.4-3.5.9-.2.4-.5 1.5-.7 2.7-.3 1.6-3.7 7.5-5.5 10.6a11 11 0 01-1.3-3c-.1-1.4-.3-2.1-.1-3.7.2-1.5 1-3.6 1-3.8 0-.2-.2-1-2-1s-3.3.4-3.5.9l-.8 2.7c-.3 1-4.7 11-5.9 13.5a55 55 0 01-1.4 3l-.1.2-.5.9c-.2.5-.5.9-.6.9-.1 0-.3-1.2 0-2.8.7-3.4 2.2-8.8 2.2-9 0 0 .3-1-1-1.5s-1.7.3-1.8.3l-.2.3s1.4-6-2.8-6c-2.6 0-6.1 2.9-8 5.5-1 .6-3.4 2-6 3.3L36 50.8l-.2-.2c-5-5.4-14.3-9.2-14-16.5.2-2.6 1.1-9.6 18-18 13.7-7 24.7-5 26.6-.8 2.8 6-5.8 17.2-20.2 18.8-5.4.6-8.3-1.5-9-2.3-.7-.8-.8-.8-1.1-.7-.5.3-.2 1 0 1.4.4 1.2 2.2 3.1 5.1 4.1 2.7.9 9 1.4 16.8-1.6 8.7-3.4 15.4-12.8 13.4-20.6-2-8-15.1-10.6-27.6-6.2a62.5 62.5 0 00-21.1 12.2c-6.9 6.5-8 12.1-7.5 14.4 1.6 8.4 13 13.8 17.5 17.8l-.6.4c-2.3 1.1-11 5.7-13.2 10.6-2.4 5.5.4 9.4 2.3 10 6 1.6 12-1.4 15.2-6.2a15.4 15.4 0 001.3-14.1v-.1l1.8-1c1.1-.8 2.3-1.4 3.3-2-.6 1.6-1 3.4-1.2 6-.3 3.2 1 7.2 2.7 8.8a3 3 0 002.1.7c2 0 2.9-1.6 3.8-3.5 1.2-2.4 2.3-5.1 2.3-5.1s-1.3 7.4 2.3 7.4c1.3 0 2.6-1.7 3.2-2.6l.1-.2.2-.3 3.5-6.6c2.2-4.5 4.4-10.1 4.4-10.1s.2 1.4.9 3.6c.4 1.4 1.2 2.9 1.9 4.3l-.9 1.2-1.4 1.7c-1.7 2.2-3.9 4.7-4.2 5.4-.3.8-.2 1.4.4 2 .5.3 1.3.4 2.2.3 1.6-.1 2.8-.5 3.3-.8 1-.3 2-.8 2.9-1.5a6.4 6.4 0 002.7-5.6c0-1.4-.5-2.7-1-4l.4-.7c2.8-4.1 5-8.6 5-8.6s.2 1.4.8 3.6c.4 1.2 1 2.4 1.6 3.7a15.7 15.7 0 00-4.8 6.2c-1 3-.2 4.4 1.3 4.7.7.2 1.7-.2 2.4-.5 1-.3 2-.8 3-1.5 1.8-1.4 3.5-3.2 3.4-5.6 0-1.2-.3-2.3-.7-3.4 2.2-.9 5-1.4 8.7-1 7.8 1 9.4 5.9 9 8-.2 2-1.9 3.1-2.4 3.5-.6.3-.7.4-.7.7 0 .4.3.3.8.3.7-.1 4.1-1.7 4.3-5.5.2-4.9-4.4-10.2-12.6-10.1zM32.1 65.7c-2.6 2.8-6.2 3.9-7.7 3-1.7-1-1-5.2 2.1-8.2 2-1.9 4.5-3.6 6.1-4.6l1.6-1 .2-.1.4-.3c1.2 4.4 0 8.2-2.7 11.2zm19-13c-1 2.2-2.9 8-4 7.6-1-.3-1.6-4.6-.2-8.8.7-2.2 2.2-4.7 3-5.7 1.5-1.6 3-2.1 3.4-1.5.5.9-1.7 7-2.3 8.4zm15.5 7.5c-.4.2-.7.4-.9.2l.2-.3 2.7-3 1.5-2v.2c0 2.5-2.4 4.2-3.5 5zm12-2.7c-.2-.3-.2-1 .7-3A11 11 0 0182 51l.3 1.5c0 3.2-2.3 4.4-3.7 4.9z");
    			attr_dev(path51, "fill", "#CF649A");
    			add_location(path51, file, 192, 3, 50194);
    			attr_dev(svg20, "viewBox", "0 0 120 80");
    			attr_dev(svg20, "fill", "none");
    			attr_dev(svg20, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg20, file, 191, 2, 50116);
    			attr_dev(symbol20, "id", "LOGO_SASS_SCSS");
    			add_location(symbol20, file, 190, 1, 50084);
    			attr_dev(path52, "d", "M93 29.6a1 1 0 00-1-.8l-8-.6-5.9-5.8c-.6-.6-1.7-.4-2.2-.3l-3 1c-1.7-5.2-4.9-9.9-10.4-9.9H62c-1.5-2-3.5-3-5.2-3-12.9 0-19 16.1-21 24.3l-9 2.7c-2.7 1-2.8 1-3.2 3.6L16 99.1l57 10.7 30.8-6.7L93 29.6zM69.7 24L65 25.5v-1c0-3.2-.5-5.8-1.2-7.8 2.9.3 4.8 3.6 6 7.3zm-9.5-6.7c.8 2 1.3 4.8 1.3 8.7v.5l-10 3c2-7.3 5.6-10.8 8.7-12.2zm-3.8-3.6a3 3 0 011.6.6C54 16.2 49.6 21 47.7 30.8l-7.9 2.4c2.2-7.4 7.4-19.5 16.7-19.5z");
    			attr_dev(path52, "fill", "#95BF46");
    			add_location(path52, file, 197, 3, 52298);
    			attr_dev(path53, "d", "M92 28.8l-8-.6-5.9-5.8c-.2-.2-.5-.4-.8-.4L73 109.8l30.8-6.7L93 29.6a1 1 0 00-.8-.8");
    			attr_dev(path53, "fill", "#5E8E3E");
    			add_location(path53, file, 198, 3, 52736);
    			attr_dev(path54, "d", "M62.5 45.8l-3.8 11.3s-3.3-1.8-7.4-1.8c-6 0-6.3 3.8-6.3 4.7 0 5.2 13.4 7.1 13.4 19.2 0 9.5-6 15.6-14.1 15.6-9.8 0-14.8-6-14.8-6L32 80s5.1 4.4 9.5 4.4c2.8 0 4-2.2 4-3.8 0-6.7-11-7-11-18 0-9.4 6.6-18.4 20.1-18.4 5.2 0 7.8 1.5 7.8 1.5");
    			attr_dev(path54, "fill", "#fff");
    			add_location(path54, file, 199, 3, 52850);
    			attr_dev(svg21, "viewBox", "0 0 120 120");
    			attr_dev(svg21, "fill", "none");
    			attr_dev(svg21, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg21, file, 196, 2, 52219);
    			attr_dev(symbol21, "id", "LOGO_Shopify");
    			add_location(symbol21, file, 195, 1, 52189);
    			attr_dev(circle, "cx", "37.5");
    			attr_dev(circle, "cy", "37.5");
    			attr_dev(circle, "fill", "#302e31");
    			attr_dev(circle, "r", "35.8");
    			attr_dev(circle, "stroke", "#fff");
    			attr_dev(circle, "stroke-width", "3.47");
    			add_location(circle, file, 204, 3, 53234);
    			attr_dev(path55, "fill", "#c4c2c4");
    			attr_dev(path55, "d", "m19.3 18.7c1.1-5.31 4.7-10.1 9.54-12.5-.842.855-1.86 1.51-2.64 2.44-3.19 3.44-4.63 8.42-3.75 13 1.11 6.99 7.68 12.7 14.8 12.6 5.52.247 10.9-2.93 13.6-7.72 5.78.196 11.4 3.18 14.7 7.97 1.69 2.5 3.01 5.43 3.1 8.48-1.07-4.05-3.76-7.65-7.43-9.68-3.55-2-7.91-2.51-11.8-1.33-4.88 1.4-8.91 5.39-10.3 10.3-1.18 3.91-.675 8.22 1.18 11.8-2.58 4.47-7.24 7.66-12.3 8.62-3.89.816-7.98.186-11.6-1.45 3.24.945 6.76 1.11 9.98-.035 4.32-1.43 7.89-4.9 9.46-9.18 1.74-4.66 1.08-10.2-1.85-14.2-2.19-3.15-5.64-5.37-9.39-6.16-1.19-.212-2.39-.308-3.59-.418-1.91-3.85-2.61-8.32-1.65-12.5z");
    			add_location(path55, file, 205, 3, 53326);
    			attr_dev(svg22, "viewBox", "-.035 -.035 75.07 75.07");
    			attr_dev(svg22, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg22, file, 203, 2, 53155);
    			attr_dev(symbol22, "id", "LOGO_OBS");
    			add_location(symbol22, file, 202, 1, 53129);
    			attr_dev(path56, "d", "M0,0h7.75a45.5,45.5 0 1 1 0,91h-7.75v-20h7.75a25.5,25.5 0 1 0 0,-51h-7.75zm36.2510,0h32a27.75,27.75 0 0 1 21.331,45.5a27.75,27.75 0 0 1 -21.331,45.5h-32a53.6895,53.6895 0 0 0 18.7464,-20h13.2526a7.75,7.75 0 1 0 0,-15.5h-7.75a53.6895,53.6895 0 0 0 0,-20h7.75a7.75,7.75 0 1 0 0,-15.5h-13.2526a53.6895,53.6895 0 0 0 -18.7464,-20z");
    			add_location(path56, file, 211, 4, 54030);
    			attr_dev(clipPath, "id", "d3js-clip");
    			add_location(clipPath, file, 210, 3, 53999);
    			attr_dev(stop0, "offset", "0");
    			attr_dev(stop0, "stop-color", "#f9a03c");
    			add_location(stop0, file, 214, 4, 54501);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#f7974e");
    			add_location(stop1, file, 215, 4, 54552);
    			attr_dev(linearGradient0, "id", "d3js-gradient-1");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			attr_dev(linearGradient0, "x1", "7");
    			attr_dev(linearGradient0, "y1", "64");
    			attr_dev(linearGradient0, "x2", "50");
    			attr_dev(linearGradient0, "y2", "107");
    			add_location(linearGradient0, file, 213, 3, 54395);
    			attr_dev(stop2, "offset", "0");
    			attr_dev(stop2, "stop-color", "#f26d58");
    			add_location(stop2, file, 218, 4, 54729);
    			attr_dev(stop3, "offset", "1");
    			attr_dev(stop3, "stop-color", "#f9a03c");
    			add_location(stop3, file, 219, 4, 54780);
    			attr_dev(linearGradient1, "id", "d3js-gradient-2");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			attr_dev(linearGradient1, "x1", "2");
    			attr_dev(linearGradient1, "y1", "-2");
    			attr_dev(linearGradient1, "x2", "87");
    			attr_dev(linearGradient1, "y2", "84");
    			add_location(linearGradient1, file, 217, 3, 54624);
    			attr_dev(stop4, "offset", "0");
    			attr_dev(stop4, "stop-color", "#b84e51");
    			add_location(stop4, file, 222, 4, 54960);
    			attr_dev(stop5, "offset", "1");
    			attr_dev(stop5, "stop-color", "#f68e48");
    			add_location(stop5, file, 223, 4, 55011);
    			attr_dev(linearGradient2, "id", "d3js-gradient-3");
    			attr_dev(linearGradient2, "gradientUnits", "userSpaceOnUse");
    			attr_dev(linearGradient2, "x1", "45");
    			attr_dev(linearGradient2, "y1", "-10");
    			attr_dev(linearGradient2, "x2", "108");
    			attr_dev(linearGradient2, "y2", "53");
    			add_location(linearGradient2, file, 221, 3, 54852);
    			attr_dev(path57, "d", "M-100,-102m-27,0v300h300z");
    			attr_dev(path57, "fill", "url(#d3js-gradient-1)");
    			add_location(path57, file, 226, 4, 55120);
    			attr_dev(path58, "d", "M-100,-102m27,0h300v300z");
    			attr_dev(path58, "fill", "url(#d3js-gradient-3)");
    			add_location(path58, file, 227, 4, 55198);
    			attr_dev(path59, "d", "M-100,-102l300,300");
    			attr_dev(path59, "fill", "none");
    			attr_dev(path59, "stroke", "url(#d3js-gradient-2)");
    			attr_dev(path59, "stroke-width", "40");
    			add_location(path59, file, 228, 4, 55275);
    			attr_dev(g, "clip-path", "url(#d3js-clip)");
    			add_location(g, file, 225, 3, 55083);
    			attr_dev(svg23, "viewBox", "0 0 96 91");
    			add_location(svg23, file, 209, 2, 53969);
    			attr_dev(symbol23, "id", "LOGO_d3js");
    			add_location(symbol23, file, 208, 1, 53942);
    			attr_dev(svg24, "id", "APP_ICONS");
    			attr_dev(svg24, "class", "svelte-1t4qwrn");
    			add_location(svg24, file, 58, 0, 2956);
    			attr_dev(link9, "href", "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap");
    			attr_dev(link9, "rel", "stylesheet");
    			add_location(link9, file, 234, 0, 55415);
    			attr_dev(span, "id", "BETA_LABEL");
    			attr_dev(span, "class", "svelte-1t4qwrn");
    			add_location(span, file, 237, 1, 55676);
    			attr_dev(main, "id", "app");
    			attr_dev(main, "lock-scroll", main_lock_scroll_value = /*$GlobalStore*/ ctx[1].lockScroll.state);
    			attr_dev(main, "class", "svelte-1t4qwrn");
    			add_location(main, file, 236, 0, 55566);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link0);
    			append_dev(document_1.head, meta0);
    			append_dev(document_1.head, meta1);
    			append_dev(document_1.head, meta2);
    			append_dev(document_1.head, meta3);
    			append_dev(document_1.head, meta4);
    			append_dev(document_1.head, meta5);
    			append_dev(document_1.head, meta6);
    			append_dev(document_1.head, link1);
    			append_dev(document_1.head, link2);
    			append_dev(document_1.head, link3);
    			append_dev(document_1.head, link4);
    			append_dev(document_1.head, link5);
    			append_dev(document_1.head, link6);
    			append_dev(document_1.head, link7);
    			append_dev(document_1.head, link8);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, svg24, anchor);
    			append_dev(svg24, symbol0);
    			append_dev(symbol0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, path2);
    			append_dev(svg0, path3);
    			append_dev(svg0, path4);
    			append_dev(svg0, path5);
    			append_dev(svg0, path6);
    			append_dev(svg0, path7);
    			append_dev(svg24, symbol1);
    			append_dev(symbol1, svg1);
    			append_dev(svg1, path8);
    			append_dev(svg24, symbol2);
    			append_dev(symbol2, svg2);
    			append_dev(svg2, path9);
    			append_dev(svg24, symbol3);
    			append_dev(symbol3, svg3);
    			append_dev(svg3, path10);
    			append_dev(svg24, symbol4);
    			append_dev(symbol4, svg4);
    			append_dev(svg4, path11);
    			append_dev(svg24, symbol5);
    			append_dev(symbol5, svg5);
    			append_dev(svg5, path12);
    			append_dev(svg24, symbol6);
    			append_dev(symbol6, svg6);
    			append_dev(svg6, path13);
    			append_dev(svg24, symbol7);
    			append_dev(symbol7, svg7);
    			append_dev(svg7, path14);
    			append_dev(svg7, path15);
    			append_dev(svg7, path16);
    			append_dev(svg24, symbol8);
    			append_dev(symbol8, svg8);
    			append_dev(svg8, path17);
    			append_dev(svg8, path18);
    			append_dev(svg8, path19);
    			append_dev(svg8, path20);
    			append_dev(svg8, path21);
    			append_dev(svg24, symbol9);
    			append_dev(symbol9, svg9);
    			append_dev(svg9, path22);
    			append_dev(svg9, path23);
    			append_dev(svg24, symbol10);
    			append_dev(symbol10, svg10);
    			append_dev(svg10, path24);
    			append_dev(svg10, path25);
    			append_dev(svg24, symbol11);
    			append_dev(symbol11, svg11);
    			append_dev(svg11, path26);
    			append_dev(svg11, path27);
    			append_dev(svg24, symbol12);
    			append_dev(symbol12, svg12);
    			append_dev(svg12, path28);
    			append_dev(svg12, path29);
    			append_dev(svg24, symbol13);
    			append_dev(symbol13, svg13);
    			append_dev(svg13, path30);
    			append_dev(svg13, path31);
    			append_dev(svg24, symbol14);
    			append_dev(symbol14, svg14);
    			append_dev(svg14, path32);
    			append_dev(svg14, path33);
    			append_dev(svg14, path34);
    			append_dev(svg14, path35);
    			append_dev(svg14, path36);
    			append_dev(svg24, symbol15);
    			append_dev(symbol15, svg15);
    			append_dev(svg15, path37);
    			append_dev(svg15, path38);
    			append_dev(svg15, path39);
    			append_dev(svg15, path40);
    			append_dev(svg15, path41);
    			append_dev(svg15, path42);
    			append_dev(svg15, path43);
    			append_dev(svg24, symbol16);
    			append_dev(symbol16, svg16);
    			append_dev(svg16, path44);
    			append_dev(svg16, path45);
    			append_dev(svg24, symbol17);
    			append_dev(symbol17, svg17);
    			append_dev(svg17, path46);
    			append_dev(svg17, path47);
    			append_dev(svg24, symbol18);
    			append_dev(symbol18, svg18);
    			append_dev(svg18, path48);
    			append_dev(svg18, path49);
    			append_dev(svg24, symbol19);
    			append_dev(symbol19, svg19);
    			append_dev(svg19, path50);
    			append_dev(svg24, symbol20);
    			append_dev(symbol20, svg20);
    			append_dev(svg20, path51);
    			append_dev(svg24, symbol21);
    			append_dev(symbol21, svg21);
    			append_dev(svg21, path52);
    			append_dev(svg21, path53);
    			append_dev(svg21, path54);
    			append_dev(svg24, symbol22);
    			append_dev(symbol22, svg22);
    			append_dev(svg22, circle);
    			append_dev(svg22, path55);
    			append_dev(svg24, symbol23);
    			append_dev(symbol23, svg23);
    			append_dev(svg23, clipPath);
    			append_dev(clipPath, path56);
    			append_dev(svg23, linearGradient0);
    			append_dev(linearGradient0, stop0);
    			append_dev(linearGradient0, stop1);
    			append_dev(svg23, linearGradient1);
    			append_dev(linearGradient1, stop2);
    			append_dev(linearGradient1, stop3);
    			append_dev(svg23, linearGradient2);
    			append_dev(linearGradient2, stop4);
    			append_dev(linearGradient2, stop5);
    			append_dev(svg23, g);
    			append_dev(g, path57);
    			append_dev(g, path58);
    			append_dev(g, path59);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, link9, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, span);
    			append_dev(main, t4);
    			mount_component(landingsection, main, null);
    			append_dev(main, t5);
    			mount_component(projectssection, main, null);
    			append_dev(main, t6);
    			mount_component(skillssection, main, null);
    			append_dev(main, t7);
    			mount_component(aboutmesection, main, null);
    			append_dev(main, t8);
    			mount_component(contactsection, main, null);
    			append_dev(main, t9);
    			mount_component(footersection, main, null);
    			/*main_binding*/ ctx[4](main);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(main, "scroll", /*scrollingApp*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$GlobalStore*/ 2 && main_lock_scroll_value !== (main_lock_scroll_value = /*$GlobalStore*/ ctx[1].lockScroll.state)) {
    				attr_dev(main, "lock-scroll", main_lock_scroll_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(landingsection.$$.fragment, local);
    			transition_in(projectssection.$$.fragment, local);
    			transition_in(skillssection.$$.fragment, local);
    			transition_in(aboutmesection.$$.fragment, local);
    			transition_in(contactsection.$$.fragment, local);
    			transition_in(footersection.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(landingsection.$$.fragment, local);
    			transition_out(projectssection.$$.fragment, local);
    			transition_out(skillssection.$$.fragment, local);
    			transition_out(aboutmesection.$$.fragment, local);
    			transition_out(contactsection.$$.fragment, local);
    			transition_out(footersection.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(meta2);
    			detach_dev(meta3);
    			detach_dev(meta4);
    			detach_dev(meta5);
    			detach_dev(meta6);
    			detach_dev(link1);
    			detach_dev(link2);
    			detach_dev(link3);
    			detach_dev(link4);
    			detach_dev(link5);
    			detach_dev(link6);
    			detach_dev(link7);
    			detach_dev(link8);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(svg24);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(link9);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(main);
    			destroy_component(landingsection);
    			destroy_component(projectssection);
    			destroy_component(skillssection);
    			destroy_component(aboutmesection);
    			destroy_component(contactsection);
    			destroy_component(footersection);
    			/*main_binding*/ ctx[4](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $GlobalStore;
    	validate_store(GlobalStore, "GlobalStore");
    	component_subscribe($$self, GlobalStore, $$value => $$invalidate(1, $GlobalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	const pageScroll = { y: 0, x: 0 };

    	function scrollingApp(e) {
    		pageScroll.y = e.target.scrollTop;
    		pageScroll.x = e.target.scrollLeft;
    	}

    	let MainEl = null;

    	function goToSection(sectionID) {
    		return __awaiter(this, void 0, void 0, function* () {
    			if (MainEl === null) return;

    			yield easeScrolling(MainEl, {
    				top: document.getElementById(sectionID.detail).offsetTop,
    				duration: 1000,
    				easing: cubicInOut
    			});

    			window.location.hash = sectionID.detail;
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function main_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			MainEl = $$value;
    			$$invalidate(0, MainEl);
    		});
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		LandingSection,
    		AboutMeSection,
    		ProjectsSection,
    		SkillsSection,
    		ContactSection,
    		FooterSection,
    		GlobalStore,
    		EaseScrolling: easeScrolling,
    		cubicInOut,
    		pageScroll,
    		scrollingApp,
    		MainEl,
    		goToSection,
    		$GlobalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("MainEl" in $$props) $$invalidate(0, MainEl = $$props.MainEl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [MainEl, $GlobalStore, scrollingApp, goToSection, main_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({ target: document.body });

    return app;

}());
//# sourceMappingURL=bundle.js.map
