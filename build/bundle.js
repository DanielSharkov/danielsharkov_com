
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
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
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
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
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
            const d = (program.b - t);
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
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
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

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
    function vibrateLink(node, opts) {
        let _hasVibrated = false;
        function _click(event) {
            if (!_hasVibrated) {
                event.preventDefault();
                _hasVibrated = true;
                vibrate(opts === null || opts === void 0 ? void 0 : opts.duration);
                node.click();
            }
            else {
                _hasVibrated = false;
            }
        }
        node.addEventListener('click', _click, { passive: false });
        return {
            destroy() {
                node.removeEventListener('click', _click);
            }
        };
    }
    function modalBgAnim(_, duration) {
        const reducedMotion = get_store_value(GlobalStore).a11y.reducedMotion;
        duration = (!reducedMotion &&
            Number.isNaN(Number(duration)) ? 400 : duration);
        return {
            duration: duration,
            css: (t) => `opacity: ${cubicInOut(t)};`,
        };
    }
    function projectModalAnim(_, o) {
        const reducedMotion = get_store_value(GlobalStore).a11y.reducedMotion;
        return {
            duration: !reducedMotion && 400,
            css(t) {
                return (`opacity: ${t};` +
                    `transform: translate(0, ${8 - 8 * cubicInOut(t)}rem);`);
            },
        };
    }
    function socialModalAnim(_, o) {
        const reducedMotion = get_store_value(GlobalStore).a11y.reducedMotion;
        return {
            duration: !reducedMotion && 250,
            css(t) {
                return (`opacity: ${t};` +
                    `transform: scale(${.5 + .5 * cubicInOut(t)});`);
            },
        };
    }

    var __GlobalStore_store;
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const moreContrastMediaQuery = window.matchMedia('(prefers-contrast: more)');
    class _GlobalStore {
        constructor() {
            __GlobalStore_store.set(this, writable({
                a11y: {
                    darkMode: darkModeMediaQuery.matches,
                    reducedMotion: reducedMotionMediaQuery.matches,
                    moreContrast: moreContrastMediaQuery.matches,
                },
                lockScroll: {
                    state: false,
                    stack: [],
                },
                socialMedia: [
                    {
                        name: 'GitHub',
                        url: 'https://github.com/DanielSharkov',
                    },
                    {
                        name: 'Codepen',
                        url: 'https://codepen.io/DanielSharkov',
                    },
                    {
                        name: 'Discord',
                        url: 'https://discordapp.com/users/253168850969821184',
                        app: 'discord://discordapp.com/users/253168850969821184',
                    },
                    {
                        name: 'Telegram',
                        url: 'https://t.me/danielsharkov',
                        app: 'tg://t.me/danielsharkov',
                    },
                    {
                        name: 'Twitter',
                        url: 'https://twitter.com/Daniel_Sharkov',
                    },
                    {
                        name: 'Medium',
                        url: 'https://medium.com/@danielsharkov',
                    },
                    {
                        name: 'Quora',
                        url: 'https://quora.com/profile/Daniel-Sharkov-1',
                    },
                ],
                openedSocialModal: null,
                socialModalEl: null,
            }));
            this.subscribe = __classPrivateFieldGet(this, __GlobalStore_store, "f").subscribe;
            darkModeMediaQuery.addEventListener('change', this._darkModeChanged.bind(this), { passive: true });
            reducedMotionMediaQuery.addEventListener('change', this._reducedMotionChanged.bind(this), { passive: true });
            moreContrastMediaQuery.addEventListener('change', this._moreContrastChanged.bind(this), { passive: true });
            // const ua = window.navigator.userAgent
            // const isIPhone = (
            // 	/iP(ad|hone)/i.test(ua) && /WebKit/i.test(ua) &&
            // 	!ua.match(/CriOS/i)
            // )
            // const isIPad = (
            // 	/WebKit/i.test(ua) && navigator.maxTouchPoints &&
            // 	navigator.maxTouchPoints > 2
            // )
        }
        _darkModeChanged() {
            __classPrivateFieldGet(this, __GlobalStore_store, "f").update((store) => {
                store.a11y.darkMode = darkModeMediaQuery.matches;
                return store;
            });
        }
        _reducedMotionChanged() {
            __classPrivateFieldGet(this, __GlobalStore_store, "f").update((store) => {
                store.a11y.reducedMotion = reducedMotionMediaQuery.matches;
                return store;
            });
        }
        _moreContrastChanged() {
            __classPrivateFieldGet(this, __GlobalStore_store, "f").update((store) => {
                store.a11y.moreContrast = moreContrastMediaQuery.matches;
                return store;
            });
        }
        lockScroll(id) {
            if (id === '') {
                throw new Error('lockScroll: invalid ID provided');
            }
            let err = null;
            __classPrivateFieldGet(this, __GlobalStore_store, "f").update((store) => {
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
            __classPrivateFieldGet(this, __GlobalStore_store, "f").update((store) => {
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
        setSocialModalEl(el) {
            __classPrivateFieldGet(this, __GlobalStore_store, "f").update((store) => {
                store.socialModalEl = el;
                return store;
            });
        }
        openSocialModal(idx, socialButtonsEl) {
            vibrate();
            __classPrivateFieldGet(this, __GlobalStore_store, "f").update((store) => {
                store.openedSocialModal = idx;
                return store;
            });
            this.socialButtonsEl = socialButtonsEl;
            if (this.socialModalEl) {
                this.socialModalEl.focus();
            }
            this.lockScroll('social_media_modal');
        }
        closeSocialModal() {
            vibrate();
            __classPrivateFieldGet(this, __GlobalStore_store, "f").update((store) => {
                store.openedSocialModal = null;
                return store;
            });
            if (this.socialButtonsEl) {
                this.socialButtonsEl.focus();
            }
            this.socialButtonsEl = undefined;
            this.unlockScroll('social_media_modal');
        }
    }
    __GlobalStore_store = new WeakMap();
    const GlobalStore = new _GlobalStore;

    var isMergeableObject = function isMergeableObject(value) {
    	return isNonNullObject(value)
    		&& !isSpecial(value)
    };

    function isNonNullObject(value) {
    	return !!value && typeof value === 'object'
    }

    function isSpecial(value) {
    	var stringValue = Object.prototype.toString.call(value);

    	return stringValue === '[object RegExp]'
    		|| stringValue === '[object Date]'
    		|| isReactElement(value)
    }

    // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
    var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
    var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

    function isReactElement(value) {
    	return value.$$typeof === REACT_ELEMENT_TYPE
    }

    function emptyTarget(val) {
    	return Array.isArray(val) ? [] : {}
    }

    function cloneUnlessOtherwiseSpecified(value, options) {
    	return (options.clone !== false && options.isMergeableObject(value))
    		? deepmerge(emptyTarget(value), value, options)
    		: value
    }

    function defaultArrayMerge(target, source, options) {
    	return target.concat(source).map(function(element) {
    		return cloneUnlessOtherwiseSpecified(element, options)
    	})
    }

    function getMergeFunction(key, options) {
    	if (!options.customMerge) {
    		return deepmerge
    	}
    	var customMerge = options.customMerge(key);
    	return typeof customMerge === 'function' ? customMerge : deepmerge
    }

    function getEnumerableOwnPropertySymbols(target) {
    	return Object.getOwnPropertySymbols
    		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
    			return target.propertyIsEnumerable(symbol)
    		})
    		: []
    }

    function getKeys(target) {
    	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
    }

    function propertyIsOnObject(object, property) {
    	try {
    		return property in object
    	} catch(_) {
    		return false
    	}
    }

    // Protects from prototype poisoning and unexpected merging up the prototype chain.
    function propertyIsUnsafe(target, key) {
    	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
    		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
    			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
    }

    function mergeObject(target, source, options) {
    	var destination = {};
    	if (options.isMergeableObject(target)) {
    		getKeys(target).forEach(function(key) {
    			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    		});
    	}
    	getKeys(source).forEach(function(key) {
    		if (propertyIsUnsafe(target, key)) {
    			return
    		}

    		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
    			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
    		} else {
    			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    		}
    	});
    	return destination
    }

    function deepmerge(target, source, options) {
    	options = options || {};
    	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    	// implementations can use it. The caller may not replace it.
    	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

    	var sourceIsArray = Array.isArray(source);
    	var targetIsArray = Array.isArray(target);
    	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    	if (!sourceAndTargetTypesMatch) {
    		return cloneUnlessOtherwiseSpecified(source, options)
    	} else if (sourceIsArray) {
    		return options.arrayMerge(target, source, options)
    	} else {
    		return mergeObject(target, source, options)
    	}
    }

    deepmerge.all = function deepmergeAll(array, options) {
    	if (!Array.isArray(array)) {
    		throw new Error('first argument should be an array')
    	}

    	return array.reduce(function(prev, next) {
    		return deepmerge(prev, next, options)
    	}, {})
    };

    var deepmerge_1 = deepmerge;

    var cjs = deepmerge_1;

    var ErrorKind;
    (function (ErrorKind) {
        /** Argument is unclosed (e.g. `{0`) */
        ErrorKind[ErrorKind["EXPECT_ARGUMENT_CLOSING_BRACE"] = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE";
        /** Argument is empty (e.g. `{}`). */
        ErrorKind[ErrorKind["EMPTY_ARGUMENT"] = 2] = "EMPTY_ARGUMENT";
        /** Argument is malformed (e.g. `{foo!}``) */
        ErrorKind[ErrorKind["MALFORMED_ARGUMENT"] = 3] = "MALFORMED_ARGUMENT";
        /** Expect an argument type (e.g. `{foo,}`) */
        ErrorKind[ErrorKind["EXPECT_ARGUMENT_TYPE"] = 4] = "EXPECT_ARGUMENT_TYPE";
        /** Unsupported argument type (e.g. `{foo,foo}`) */
        ErrorKind[ErrorKind["INVALID_ARGUMENT_TYPE"] = 5] = "INVALID_ARGUMENT_TYPE";
        /** Expect an argument style (e.g. `{foo, number, }`) */
        ErrorKind[ErrorKind["EXPECT_ARGUMENT_STYLE"] = 6] = "EXPECT_ARGUMENT_STYLE";
        /** The number skeleton is invalid. */
        ErrorKind[ErrorKind["INVALID_NUMBER_SKELETON"] = 7] = "INVALID_NUMBER_SKELETON";
        /** The date time skeleton is invalid. */
        ErrorKind[ErrorKind["INVALID_DATE_TIME_SKELETON"] = 8] = "INVALID_DATE_TIME_SKELETON";
        /** Exepct a number skeleton following the `::` (e.g. `{foo, number, ::}`) */
        ErrorKind[ErrorKind["EXPECT_NUMBER_SKELETON"] = 9] = "EXPECT_NUMBER_SKELETON";
        /** Exepct a date time skeleton following the `::` (e.g. `{foo, date, ::}`) */
        ErrorKind[ErrorKind["EXPECT_DATE_TIME_SKELETON"] = 10] = "EXPECT_DATE_TIME_SKELETON";
        /** Unmatched apostrophes in the argument style (e.g. `{foo, number, 'test`) */
        ErrorKind[ErrorKind["UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"] = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE";
        /** Missing select argument options (e.g. `{foo, select}`) */
        ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_OPTIONS"] = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS";
        /** Expecting an offset value in `plural` or `selectordinal` argument (e.g `{foo, plural, offset}`) */
        ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"] = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE";
        /** Offset value in `plural` or `selectordinal` is invalid (e.g. `{foo, plural, offset: x}`) */
        ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"] = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE";
        /** Expecting a selector in `select` argument (e.g `{foo, select}`) */
        ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR"] = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR";
        /** Expecting a selector in `plural` or `selectordinal` argument (e.g `{foo, plural}`) */
        ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR"] = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR";
        /** Expecting a message fragment after the `select` selector (e.g. `{foo, select, apple}`) */
        ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"] = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT";
        /**
         * Expecting a message fragment after the `plural` or `selectordinal` selector
         * (e.g. `{foo, plural, one}`)
         */
        ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"] = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT";
        /** Selector in `plural` or `selectordinal` is malformed (e.g. `{foo, plural, =x {#}}`) */
        ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_SELECTOR"] = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR";
        /**
         * Duplicate selectors in `plural` or `selectordinal` argument.
         * (e.g. {foo, plural, one {#} one {#}})
         */
        ErrorKind[ErrorKind["DUPLICATE_PLURAL_ARGUMENT_SELECTOR"] = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR";
        /** Duplicate selectors in `select` argument.
         * (e.g. {foo, select, apple {apple} apple {apple}})
         */
        ErrorKind[ErrorKind["DUPLICATE_SELECT_ARGUMENT_SELECTOR"] = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR";
        /** Plural or select argument option must have `other` clause. */
        ErrorKind[ErrorKind["MISSING_OTHER_CLAUSE"] = 22] = "MISSING_OTHER_CLAUSE";
        /** The tag is malformed. (e.g. `<bold!>foo</bold!>) */
        ErrorKind[ErrorKind["INVALID_TAG"] = 23] = "INVALID_TAG";
        /** The tag name is invalid. (e.g. `<123>foo</123>`) */
        ErrorKind[ErrorKind["INVALID_TAG_NAME"] = 25] = "INVALID_TAG_NAME";
        /** The closing tag does not match the opening tag. (e.g. `<bold>foo</italic>`) */
        ErrorKind[ErrorKind["UNMATCHED_CLOSING_TAG"] = 26] = "UNMATCHED_CLOSING_TAG";
        /** The opening tag has unmatched closing tag. (e.g. `<bold>foo`) */
        ErrorKind[ErrorKind["UNCLOSED_TAG"] = 27] = "UNCLOSED_TAG";
    })(ErrorKind || (ErrorKind = {}));

    var TYPE;
    (function (TYPE) {
        /**
         * Raw text
         */
        TYPE[TYPE["literal"] = 0] = "literal";
        /**
         * Variable w/o any format, e.g `var` in `this is a {var}`
         */
        TYPE[TYPE["argument"] = 1] = "argument";
        /**
         * Variable w/ number format
         */
        TYPE[TYPE["number"] = 2] = "number";
        /**
         * Variable w/ date format
         */
        TYPE[TYPE["date"] = 3] = "date";
        /**
         * Variable w/ time format
         */
        TYPE[TYPE["time"] = 4] = "time";
        /**
         * Variable w/ select format
         */
        TYPE[TYPE["select"] = 5] = "select";
        /**
         * Variable w/ plural format
         */
        TYPE[TYPE["plural"] = 6] = "plural";
        /**
         * Only possible within plural argument.
         * This is the `#` symbol that will be substituted with the count.
         */
        TYPE[TYPE["pound"] = 7] = "pound";
        /**
         * XML-like tag
         */
        TYPE[TYPE["tag"] = 8] = "tag";
    })(TYPE || (TYPE = {}));
    var SKELETON_TYPE;
    (function (SKELETON_TYPE) {
        SKELETON_TYPE[SKELETON_TYPE["number"] = 0] = "number";
        SKELETON_TYPE[SKELETON_TYPE["dateTime"] = 1] = "dateTime";
    })(SKELETON_TYPE || (SKELETON_TYPE = {}));
    /**
     * Type Guards
     */
    function isLiteralElement(el) {
        return el.type === TYPE.literal;
    }
    function isArgumentElement(el) {
        return el.type === TYPE.argument;
    }
    function isNumberElement(el) {
        return el.type === TYPE.number;
    }
    function isDateElement(el) {
        return el.type === TYPE.date;
    }
    function isTimeElement(el) {
        return el.type === TYPE.time;
    }
    function isSelectElement(el) {
        return el.type === TYPE.select;
    }
    function isPluralElement(el) {
        return el.type === TYPE.plural;
    }
    function isPoundElement(el) {
        return el.type === TYPE.pound;
    }
    function isTagElement(el) {
        return el.type === TYPE.tag;
    }
    function isNumberSkeleton(el) {
        return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.number);
    }
    function isDateTimeSkeleton(el) {
        return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.dateTime);
    }

    // @generated from regex-gen.ts
    var SPACE_SEPARATOR_REGEX = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;

    /**
     * https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * Credit: https://github.com/caridy/intl-datetimeformat-pattern/blob/master/index.js
     * with some tweaks
     */
    var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
    /**
     * Parse Date time skeleton into Intl.DateTimeFormatOptions
     * Ref: https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * @public
     * @param skeleton skeleton string
     */
    function parseDateTimeSkeleton(skeleton) {
        var result = {};
        skeleton.replace(DATE_TIME_REGEX, function (match) {
            var len = match.length;
            switch (match[0]) {
                // Era
                case 'G':
                    result.era = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
                    break;
                // Year
                case 'y':
                    result.year = len === 2 ? '2-digit' : 'numeric';
                    break;
                case 'Y':
                case 'u':
                case 'U':
                case 'r':
                    throw new RangeError('`Y/u/U/r` (year) patterns are not supported, use `y` instead');
                // Quarter
                case 'q':
                case 'Q':
                    throw new RangeError('`q/Q` (quarter) patterns are not supported');
                // Month
                case 'M':
                case 'L':
                    result.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][len - 1];
                    break;
                // Week
                case 'w':
                case 'W':
                    throw new RangeError('`w/W` (week) patterns are not supported');
                case 'd':
                    result.day = ['numeric', '2-digit'][len - 1];
                    break;
                case 'D':
                case 'F':
                case 'g':
                    throw new RangeError('`D/F/g` (day) patterns are not supported, use `d` instead');
                // Weekday
                case 'E':
                    result.weekday = len === 4 ? 'short' : len === 5 ? 'narrow' : 'short';
                    break;
                case 'e':
                    if (len < 4) {
                        throw new RangeError('`e..eee` (weekday) patterns are not supported');
                    }
                    result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                    break;
                case 'c':
                    if (len < 4) {
                        throw new RangeError('`c..ccc` (weekday) patterns are not supported');
                    }
                    result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                    break;
                // Period
                case 'a': // AM, PM
                    result.hour12 = true;
                    break;
                case 'b': // am, pm, noon, midnight
                case 'B': // flexible day periods
                    throw new RangeError('`b/B` (period) patterns are not supported, use `a` instead');
                // Hour
                case 'h':
                    result.hourCycle = 'h12';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'H':
                    result.hourCycle = 'h23';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'K':
                    result.hourCycle = 'h11';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'k':
                    result.hourCycle = 'h24';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'j':
                case 'J':
                case 'C':
                    throw new RangeError('`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead');
                // Minute
                case 'm':
                    result.minute = ['numeric', '2-digit'][len - 1];
                    break;
                // Second
                case 's':
                    result.second = ['numeric', '2-digit'][len - 1];
                    break;
                case 'S':
                case 'A':
                    throw new RangeError('`S/A` (second) patterns are not supported, use `s` instead');
                // Zone
                case 'z': // 1..3, 4: specific non-location format
                    result.timeZoneName = len < 4 ? 'short' : 'long';
                    break;
                case 'Z': // 1..3, 4, 5: The ISO8601 varios formats
                case 'O': // 1, 4: miliseconds in day short, long
                case 'v': // 1, 4: generic non-location format
                case 'V': // 1, 2, 3, 4: time zone ID or city
                case 'X': // 1, 2, 3, 4: The ISO8601 varios formats
                case 'x': // 1, 2, 3, 4: The ISO8601 varios formats
                    throw new RangeError('`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead');
            }
            return '';
        });
        return result;
    }

    // @generated from regex-gen.ts
    var WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;

    function parseNumberSkeletonFromString(skeleton) {
        if (skeleton.length === 0) {
            throw new Error('Number skeleton cannot be empty');
        }
        // Parse the skeleton
        var stringTokens = skeleton
            .split(WHITE_SPACE_REGEX)
            .filter(function (x) { return x.length > 0; });
        var tokens = [];
        for (var _i = 0, stringTokens_1 = stringTokens; _i < stringTokens_1.length; _i++) {
            var stringToken = stringTokens_1[_i];
            var stemAndOptions = stringToken.split('/');
            if (stemAndOptions.length === 0) {
                throw new Error('Invalid number skeleton');
            }
            var stem = stemAndOptions[0], options = stemAndOptions.slice(1);
            for (var _a = 0, options_1 = options; _a < options_1.length; _a++) {
                var option = options_1[_a];
                if (option.length === 0) {
                    throw new Error('Invalid number skeleton');
                }
            }
            tokens.push({ stem: stem, options: options });
        }
        return tokens;
    }
    function icuUnitToEcma(unit) {
        return unit.replace(/^(.*?)-/, '');
    }
    var FRACTION_PRECISION_REGEX = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g;
    var SIGNIFICANT_PRECISION_REGEX = /^(@+)?(\+|#+)?[rs]?$/g;
    var INTEGER_WIDTH_REGEX = /(\*)(0+)|(#+)(0+)|(0+)/g;
    var CONCISE_INTEGER_WIDTH_REGEX = /^(0+)$/;
    function parseSignificantPrecision(str) {
        var result = {};
        if (str[str.length - 1] === 'r') {
            result.roundingPriority = 'morePrecision';
        }
        else if (str[str.length - 1] === 's') {
            result.roundingPriority = 'lessPrecision';
        }
        str.replace(SIGNIFICANT_PRECISION_REGEX, function (_, g1, g2) {
            // @@@ case
            if (typeof g2 !== 'string') {
                result.minimumSignificantDigits = g1.length;
                result.maximumSignificantDigits = g1.length;
            }
            // @@@+ case
            else if (g2 === '+') {
                result.minimumSignificantDigits = g1.length;
            }
            // .### case
            else if (g1[0] === '#') {
                result.maximumSignificantDigits = g1.length;
            }
            // .@@## or .@@@ case
            else {
                result.minimumSignificantDigits = g1.length;
                result.maximumSignificantDigits =
                    g1.length + (typeof g2 === 'string' ? g2.length : 0);
            }
            return '';
        });
        return result;
    }
    function parseSign(str) {
        switch (str) {
            case 'sign-auto':
                return {
                    signDisplay: 'auto',
                };
            case 'sign-accounting':
            case '()':
                return {
                    currencySign: 'accounting',
                };
            case 'sign-always':
            case '+!':
                return {
                    signDisplay: 'always',
                };
            case 'sign-accounting-always':
            case '()!':
                return {
                    signDisplay: 'always',
                    currencySign: 'accounting',
                };
            case 'sign-except-zero':
            case '+?':
                return {
                    signDisplay: 'exceptZero',
                };
            case 'sign-accounting-except-zero':
            case '()?':
                return {
                    signDisplay: 'exceptZero',
                    currencySign: 'accounting',
                };
            case 'sign-never':
            case '+_':
                return {
                    signDisplay: 'never',
                };
        }
    }
    function parseConciseScientificAndEngineeringStem(stem) {
        // Engineering
        var result;
        if (stem[0] === 'E' && stem[1] === 'E') {
            result = {
                notation: 'engineering',
            };
            stem = stem.slice(2);
        }
        else if (stem[0] === 'E') {
            result = {
                notation: 'scientific',
            };
            stem = stem.slice(1);
        }
        if (result) {
            var signDisplay = stem.slice(0, 2);
            if (signDisplay === '+!') {
                result.signDisplay = 'always';
                stem = stem.slice(2);
            }
            else if (signDisplay === '+?') {
                result.signDisplay = 'exceptZero';
                stem = stem.slice(2);
            }
            if (!CONCISE_INTEGER_WIDTH_REGEX.test(stem)) {
                throw new Error('Malformed concise eng/scientific notation');
            }
            result.minimumIntegerDigits = stem.length;
        }
        return result;
    }
    function parseNotationOptions(opt) {
        var result = {};
        var signOpts = parseSign(opt);
        if (signOpts) {
            return signOpts;
        }
        return result;
    }
    /**
     * https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md#skeleton-stems-and-options
     */
    function parseNumberSkeleton(tokens) {
        var result = {};
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            switch (token.stem) {
                case 'percent':
                case '%':
                    result.style = 'percent';
                    continue;
                case '%x100':
                    result.style = 'percent';
                    result.scale = 100;
                    continue;
                case 'currency':
                    result.style = 'currency';
                    result.currency = token.options[0];
                    continue;
                case 'group-off':
                case ',_':
                    result.useGrouping = false;
                    continue;
                case 'precision-integer':
                case '.':
                    result.maximumFractionDigits = 0;
                    continue;
                case 'measure-unit':
                case 'unit':
                    result.style = 'unit';
                    result.unit = icuUnitToEcma(token.options[0]);
                    continue;
                case 'compact-short':
                case 'K':
                    result.notation = 'compact';
                    result.compactDisplay = 'short';
                    continue;
                case 'compact-long':
                case 'KK':
                    result.notation = 'compact';
                    result.compactDisplay = 'long';
                    continue;
                case 'scientific':
                    result = __assign(__assign(__assign({}, result), { notation: 'scientific' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                    continue;
                case 'engineering':
                    result = __assign(__assign(__assign({}, result), { notation: 'engineering' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                    continue;
                case 'notation-simple':
                    result.notation = 'standard';
                    continue;
                // https://github.com/unicode-org/icu/blob/master/icu4c/source/i18n/unicode/unumberformatter.h
                case 'unit-width-narrow':
                    result.currencyDisplay = 'narrowSymbol';
                    result.unitDisplay = 'narrow';
                    continue;
                case 'unit-width-short':
                    result.currencyDisplay = 'code';
                    result.unitDisplay = 'short';
                    continue;
                case 'unit-width-full-name':
                    result.currencyDisplay = 'name';
                    result.unitDisplay = 'long';
                    continue;
                case 'unit-width-iso-code':
                    result.currencyDisplay = 'symbol';
                    continue;
                case 'scale':
                    result.scale = parseFloat(token.options[0]);
                    continue;
                // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
                case 'integer-width':
                    if (token.options.length > 1) {
                        throw new RangeError('integer-width stems only accept a single optional option');
                    }
                    token.options[0].replace(INTEGER_WIDTH_REGEX, function (_, g1, g2, g3, g4, g5) {
                        if (g1) {
                            result.minimumIntegerDigits = g2.length;
                        }
                        else if (g3 && g4) {
                            throw new Error('We currently do not support maximum integer digits');
                        }
                        else if (g5) {
                            throw new Error('We currently do not support exact integer digits');
                        }
                        return '';
                    });
                    continue;
            }
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
            if (CONCISE_INTEGER_WIDTH_REGEX.test(token.stem)) {
                result.minimumIntegerDigits = token.stem.length;
                continue;
            }
            if (FRACTION_PRECISION_REGEX.test(token.stem)) {
                // Precision
                // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#fraction-precision
                // precision-integer case
                if (token.options.length > 1) {
                    throw new RangeError('Fraction-precision stems only accept a single optional option');
                }
                token.stem.replace(FRACTION_PRECISION_REGEX, function (_, g1, g2, g3, g4, g5) {
                    // .000* case (before ICU67 it was .000+)
                    if (g2 === '*') {
                        result.minimumFractionDigits = g1.length;
                    }
                    // .### case
                    else if (g3 && g3[0] === '#') {
                        result.maximumFractionDigits = g3.length;
                    }
                    // .00## case
                    else if (g4 && g5) {
                        result.minimumFractionDigits = g4.length;
                        result.maximumFractionDigits = g4.length + g5.length;
                    }
                    else {
                        result.minimumFractionDigits = g1.length;
                        result.maximumFractionDigits = g1.length;
                    }
                    return '';
                });
                var opt = token.options[0];
                // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#trailing-zero-display
                if (opt === 'w') {
                    result = __assign(__assign({}, result), { trailingZeroDisplay: 'stripIfInteger' });
                }
                else if (opt) {
                    result = __assign(__assign({}, result), parseSignificantPrecision(opt));
                }
                continue;
            }
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#significant-digits-precision
            if (SIGNIFICANT_PRECISION_REGEX.test(token.stem)) {
                result = __assign(__assign({}, result), parseSignificantPrecision(token.stem));
                continue;
            }
            var signOpts = parseSign(token.stem);
            if (signOpts) {
                result = __assign(__assign({}, result), signOpts);
            }
            var conciseScientificAndEngineeringOpts = parseConciseScientificAndEngineeringStem(token.stem);
            if (conciseScientificAndEngineeringOpts) {
                result = __assign(__assign({}, result), conciseScientificAndEngineeringOpts);
            }
        }
        return result;
    }

    var _a;
    var SPACE_SEPARATOR_START_REGEX = new RegExp("^" + SPACE_SEPARATOR_REGEX.source + "*");
    var SPACE_SEPARATOR_END_REGEX = new RegExp(SPACE_SEPARATOR_REGEX.source + "*$");
    function createLocation(start, end) {
        return { start: start, end: end };
    }
    // #region Ponyfills
    // Consolidate these variables up top for easier toggling during debugging
    var hasNativeStartsWith = !!String.prototype.startsWith;
    var hasNativeFromCodePoint = !!String.fromCodePoint;
    var hasNativeFromEntries = !!Object.fromEntries;
    var hasNativeCodePointAt = !!String.prototype.codePointAt;
    var hasTrimStart = !!String.prototype.trimStart;
    var hasTrimEnd = !!String.prototype.trimEnd;
    var hasNativeIsSafeInteger = !!Number.isSafeInteger;
    var isSafeInteger = hasNativeIsSafeInteger
        ? Number.isSafeInteger
        : function (n) {
            return (typeof n === 'number' &&
                isFinite(n) &&
                Math.floor(n) === n &&
                Math.abs(n) <= 0x1fffffffffffff);
        };
    // IE11 does not support y and u.
    var REGEX_SUPPORTS_U_AND_Y = true;
    try {
        var re = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
        /**
         * legacy Edge or Xbox One browser
         * Unicode flag support: supported
         * Pattern_Syntax support: not supported
         * See https://github.com/formatjs/formatjs/issues/2822
         */
        REGEX_SUPPORTS_U_AND_Y = ((_a = re.exec('a')) === null || _a === void 0 ? void 0 : _a[0]) === 'a';
    }
    catch (_) {
        REGEX_SUPPORTS_U_AND_Y = false;
    }
    var startsWith = hasNativeStartsWith
        ? // Native
            function startsWith(s, search, position) {
                return s.startsWith(search, position);
            }
        : // For IE11
            function startsWith(s, search, position) {
                return s.slice(position, position + search.length) === search;
            };
    var fromCodePoint = hasNativeFromCodePoint
        ? String.fromCodePoint
        : // IE11
            function fromCodePoint() {
                var codePoints = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    codePoints[_i] = arguments[_i];
                }
                var elements = '';
                var length = codePoints.length;
                var i = 0;
                var code;
                while (length > i) {
                    code = codePoints[i++];
                    if (code > 0x10ffff)
                        throw RangeError(code + ' is not a valid code point');
                    elements +=
                        code < 0x10000
                            ? String.fromCharCode(code)
                            : String.fromCharCode(((code -= 0x10000) >> 10) + 0xd800, (code % 0x400) + 0xdc00);
                }
                return elements;
            };
    var fromEntries = 
    // native
    hasNativeFromEntries
        ? Object.fromEntries
        : // Ponyfill
            function fromEntries(entries) {
                var obj = {};
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var _a = entries_1[_i], k = _a[0], v = _a[1];
                    obj[k] = v;
                }
                return obj;
            };
    var codePointAt = hasNativeCodePointAt
        ? // Native
            function codePointAt(s, index) {
                return s.codePointAt(index);
            }
        : // IE 11
            function codePointAt(s, index) {
                var size = s.length;
                if (index < 0 || index >= size) {
                    return undefined;
                }
                var first = s.charCodeAt(index);
                var second;
                return first < 0xd800 ||
                    first > 0xdbff ||
                    index + 1 === size ||
                    (second = s.charCodeAt(index + 1)) < 0xdc00 ||
                    second > 0xdfff
                    ? first
                    : ((first - 0xd800) << 10) + (second - 0xdc00) + 0x10000;
            };
    var trimStart = hasTrimStart
        ? // Native
            function trimStart(s) {
                return s.trimStart();
            }
        : // Ponyfill
            function trimStart(s) {
                return s.replace(SPACE_SEPARATOR_START_REGEX, '');
            };
    var trimEnd = hasTrimEnd
        ? // Native
            function trimEnd(s) {
                return s.trimEnd();
            }
        : // Ponyfill
            function trimEnd(s) {
                return s.replace(SPACE_SEPARATOR_END_REGEX, '');
            };
    // Prevent minifier to translate new RegExp to literal form that might cause syntax error on IE11.
    function RE(s, flag) {
        return new RegExp(s, flag);
    }
    // #endregion
    var matchIdentifierAtIndex;
    if (REGEX_SUPPORTS_U_AND_Y) {
        // Native
        var IDENTIFIER_PREFIX_RE_1 = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
        matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
            var _a;
            IDENTIFIER_PREFIX_RE_1.lastIndex = index;
            var match = IDENTIFIER_PREFIX_RE_1.exec(s);
            return (_a = match[1]) !== null && _a !== void 0 ? _a : '';
        };
    }
    else {
        // IE11
        matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
            var match = [];
            while (true) {
                var c = codePointAt(s, index);
                if (c === undefined || _isWhiteSpace(c) || _isPatternSyntax(c)) {
                    break;
                }
                match.push(c);
                index += c >= 0x10000 ? 2 : 1;
            }
            return fromCodePoint.apply(void 0, match);
        };
    }
    var Parser$1 = /** @class */ (function () {
        function Parser(message, options) {
            if (options === void 0) { options = {}; }
            this.message = message;
            this.position = { offset: 0, line: 1, column: 1 };
            this.ignoreTag = !!options.ignoreTag;
            this.requiresOtherClause = !!options.requiresOtherClause;
            this.shouldParseSkeletons = !!options.shouldParseSkeletons;
        }
        Parser.prototype.parse = function () {
            if (this.offset() !== 0) {
                throw Error('parser can only be used once');
            }
            return this.parseMessage(0, '', false);
        };
        Parser.prototype.parseMessage = function (nestingLevel, parentArgType, expectingCloseTag) {
            var elements = [];
            while (!this.isEOF()) {
                var char = this.char();
                if (char === 123 /* `{` */) {
                    var result = this.parseArgument(nestingLevel, expectingCloseTag);
                    if (result.err) {
                        return result;
                    }
                    elements.push(result.val);
                }
                else if (char === 125 /* `}` */ && nestingLevel > 0) {
                    break;
                }
                else if (char === 35 /* `#` */ &&
                    (parentArgType === 'plural' || parentArgType === 'selectordinal')) {
                    var position = this.clonePosition();
                    this.bump();
                    elements.push({
                        type: TYPE.pound,
                        location: createLocation(position, this.clonePosition()),
                    });
                }
                else if (char === 60 /* `<` */ &&
                    !this.ignoreTag &&
                    this.peek() === 47 // char code for '/'
                ) {
                    if (expectingCloseTag) {
                        break;
                    }
                    else {
                        return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(this.clonePosition(), this.clonePosition()));
                    }
                }
                else if (char === 60 /* `<` */ &&
                    !this.ignoreTag &&
                    _isAlpha(this.peek() || 0)) {
                    var result = this.parseTag(nestingLevel, parentArgType);
                    if (result.err) {
                        return result;
                    }
                    elements.push(result.val);
                }
                else {
                    var result = this.parseLiteral(nestingLevel, parentArgType);
                    if (result.err) {
                        return result;
                    }
                    elements.push(result.val);
                }
            }
            return { val: elements, err: null };
        };
        /**
         * A tag name must start with an ASCII lower/upper case letter. The grammar is based on the
         * [custom element name][] except that a dash is NOT always mandatory and uppercase letters
         * are accepted:
         *
         * ```
         * tag ::= "<" tagName (whitespace)* "/>" | "<" tagName (whitespace)* ">" message "</" tagName (whitespace)* ">"
         * tagName ::= [a-z] (PENChar)*
         * PENChar ::=
         *     "-" | "." | [0-9] | "_" | [a-z] | [A-Z] | #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] |
         *     [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
         *     [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
         * ```
         *
         * [custom element name]: https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
         * NOTE: We're a bit more lax here since HTML technically does not allow uppercase HTML element but we do
         * since other tag-based engines like React allow it
         */
        Parser.prototype.parseTag = function (nestingLevel, parentArgType) {
            var startPosition = this.clonePosition();
            this.bump(); // `<`
            var tagName = this.parseTagName();
            this.bumpSpace();
            if (this.bumpIf('/>')) {
                // Self closing tag
                return {
                    val: {
                        type: TYPE.literal,
                        value: "<" + tagName + "/>",
                        location: createLocation(startPosition, this.clonePosition()),
                    },
                    err: null,
                };
            }
            else if (this.bumpIf('>')) {
                var childrenResult = this.parseMessage(nestingLevel + 1, parentArgType, true);
                if (childrenResult.err) {
                    return childrenResult;
                }
                var children = childrenResult.val;
                // Expecting a close tag
                var endTagStartPosition = this.clonePosition();
                if (this.bumpIf('</')) {
                    if (this.isEOF() || !_isAlpha(this.char())) {
                        return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                    }
                    var closingTagNameStartPosition = this.clonePosition();
                    var closingTagName = this.parseTagName();
                    if (tagName !== closingTagName) {
                        return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(closingTagNameStartPosition, this.clonePosition()));
                    }
                    this.bumpSpace();
                    if (!this.bumpIf('>')) {
                        return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                    }
                    return {
                        val: {
                            type: TYPE.tag,
                            value: tagName,
                            children: children,
                            location: createLocation(startPosition, this.clonePosition()),
                        },
                        err: null,
                    };
                }
                else {
                    return this.error(ErrorKind.UNCLOSED_TAG, createLocation(startPosition, this.clonePosition()));
                }
            }
            else {
                return this.error(ErrorKind.INVALID_TAG, createLocation(startPosition, this.clonePosition()));
            }
        };
        /**
         * This method assumes that the caller has peeked ahead for the first tag character.
         */
        Parser.prototype.parseTagName = function () {
            var startOffset = this.offset();
            this.bump(); // the first tag name character
            while (!this.isEOF() && _isPotentialElementNameChar(this.char())) {
                this.bump();
            }
            return this.message.slice(startOffset, this.offset());
        };
        Parser.prototype.parseLiteral = function (nestingLevel, parentArgType) {
            var start = this.clonePosition();
            var value = '';
            while (true) {
                var parseQuoteResult = this.tryParseQuote(parentArgType);
                if (parseQuoteResult) {
                    value += parseQuoteResult;
                    continue;
                }
                var parseUnquotedResult = this.tryParseUnquoted(nestingLevel, parentArgType);
                if (parseUnquotedResult) {
                    value += parseUnquotedResult;
                    continue;
                }
                var parseLeftAngleResult = this.tryParseLeftAngleBracket();
                if (parseLeftAngleResult) {
                    value += parseLeftAngleResult;
                    continue;
                }
                break;
            }
            var location = createLocation(start, this.clonePosition());
            return {
                val: { type: TYPE.literal, value: value, location: location },
                err: null,
            };
        };
        Parser.prototype.tryParseLeftAngleBracket = function () {
            if (!this.isEOF() &&
                this.char() === 60 /* `<` */ &&
                (this.ignoreTag ||
                    // If at the opening tag or closing tag position, bail.
                    !_isAlphaOrSlash(this.peek() || 0))) {
                this.bump(); // `<`
                return '<';
            }
            return null;
        };
        /**
         * Starting with ICU 4.8, an ASCII apostrophe only starts quoted text if it immediately precedes
         * a character that requires quoting (that is, "only where needed"), and works the same in
         * nested messages as on the top level of the pattern. The new behavior is otherwise compatible.
         */
        Parser.prototype.tryParseQuote = function (parentArgType) {
            if (this.isEOF() || this.char() !== 39 /* `'` */) {
                return null;
            }
            // Parse escaped char following the apostrophe, or early return if there is no escaped char.
            // Check if is valid escaped character
            switch (this.peek()) {
                case 39 /* `'` */:
                    // double quote, should return as a single quote.
                    this.bump();
                    this.bump();
                    return "'";
                // '{', '<', '>', '}'
                case 123:
                case 60:
                case 62:
                case 125:
                    break;
                case 35: // '#'
                    if (parentArgType === 'plural' || parentArgType === 'selectordinal') {
                        break;
                    }
                    return null;
                default:
                    return null;
            }
            this.bump(); // apostrophe
            var codePoints = [this.char()]; // escaped char
            this.bump();
            // read chars until the optional closing apostrophe is found
            while (!this.isEOF()) {
                var ch = this.char();
                if (ch === 39 /* `'` */) {
                    if (this.peek() === 39 /* `'` */) {
                        codePoints.push(39);
                        // Bump one more time because we need to skip 2 characters.
                        this.bump();
                    }
                    else {
                        // Optional closing apostrophe.
                        this.bump();
                        break;
                    }
                }
                else {
                    codePoints.push(ch);
                }
                this.bump();
            }
            return fromCodePoint.apply(void 0, codePoints);
        };
        Parser.prototype.tryParseUnquoted = function (nestingLevel, parentArgType) {
            if (this.isEOF()) {
                return null;
            }
            var ch = this.char();
            if (ch === 60 /* `<` */ ||
                ch === 123 /* `{` */ ||
                (ch === 35 /* `#` */ &&
                    (parentArgType === 'plural' || parentArgType === 'selectordinal')) ||
                (ch === 125 /* `}` */ && nestingLevel > 0)) {
                return null;
            }
            else {
                this.bump();
                return fromCodePoint(ch);
            }
        };
        Parser.prototype.parseArgument = function (nestingLevel, expectingCloseTag) {
            var openingBracePosition = this.clonePosition();
            this.bump(); // `{`
            this.bumpSpace();
            if (this.isEOF()) {
                return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
            }
            if (this.char() === 125 /* `}` */) {
                this.bump();
                return this.error(ErrorKind.EMPTY_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
            }
            // argument name
            var value = this.parseIdentifierIfPossible().value;
            if (!value) {
                return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
            }
            this.bumpSpace();
            if (this.isEOF()) {
                return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
            }
            switch (this.char()) {
                // Simple argument: `{name}`
                case 125 /* `}` */: {
                    this.bump(); // `}`
                    return {
                        val: {
                            type: TYPE.argument,
                            // value does not include the opening and closing braces.
                            value: value,
                            location: createLocation(openingBracePosition, this.clonePosition()),
                        },
                        err: null,
                    };
                }
                // Argument with options: `{name, format, ...}`
                case 44 /* `,` */: {
                    this.bump(); // `,`
                    this.bumpSpace();
                    if (this.isEOF()) {
                        return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
                    }
                    return this.parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition);
                }
                default:
                    return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
            }
        };
        /**
         * Advance the parser until the end of the identifier, if it is currently on
         * an identifier character. Return an empty string otherwise.
         */
        Parser.prototype.parseIdentifierIfPossible = function () {
            var startingPosition = this.clonePosition();
            var startOffset = this.offset();
            var value = matchIdentifierAtIndex(this.message, startOffset);
            var endOffset = startOffset + value.length;
            this.bumpTo(endOffset);
            var endPosition = this.clonePosition();
            var location = createLocation(startingPosition, endPosition);
            return { value: value, location: location };
        };
        Parser.prototype.parseArgumentOptions = function (nestingLevel, expectingCloseTag, value, openingBracePosition) {
            var _a;
            // Parse this range:
            // {name, type, style}
            //        ^---^
            var typeStartPosition = this.clonePosition();
            var argType = this.parseIdentifierIfPossible().value;
            var typeEndPosition = this.clonePosition();
            switch (argType) {
                case '':
                    // Expecting a style string number, date, time, plural, selectordinal, or select.
                    return this.error(ErrorKind.EXPECT_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
                case 'number':
                case 'date':
                case 'time': {
                    // Parse this range:
                    // {name, number, style}
                    //              ^-------^
                    this.bumpSpace();
                    var styleAndLocation = null;
                    if (this.bumpIf(',')) {
                        this.bumpSpace();
                        var styleStartPosition = this.clonePosition();
                        var result = this.parseSimpleArgStyleIfPossible();
                        if (result.err) {
                            return result;
                        }
                        var style = trimEnd(result.val);
                        if (style.length === 0) {
                            return this.error(ErrorKind.EXPECT_ARGUMENT_STYLE, createLocation(this.clonePosition(), this.clonePosition()));
                        }
                        var styleLocation = createLocation(styleStartPosition, this.clonePosition());
                        styleAndLocation = { style: style, styleLocation: styleLocation };
                    }
                    var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                    if (argCloseResult.err) {
                        return argCloseResult;
                    }
                    var location_1 = createLocation(openingBracePosition, this.clonePosition());
                    // Extract style or skeleton
                    if (styleAndLocation && startsWith(styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style, '::', 0)) {
                        // Skeleton starts with `::`.
                        var skeleton = trimStart(styleAndLocation.style.slice(2));
                        if (argType === 'number') {
                            var result = this.parseNumberSkeletonFromString(skeleton, styleAndLocation.styleLocation);
                            if (result.err) {
                                return result;
                            }
                            return {
                                val: { type: TYPE.number, value: value, location: location_1, style: result.val },
                                err: null,
                            };
                        }
                        else {
                            if (skeleton.length === 0) {
                                return this.error(ErrorKind.EXPECT_DATE_TIME_SKELETON, location_1);
                            }
                            var style = {
                                type: SKELETON_TYPE.dateTime,
                                pattern: skeleton,
                                location: styleAndLocation.styleLocation,
                                parsedOptions: this.shouldParseSkeletons
                                    ? parseDateTimeSkeleton(skeleton)
                                    : {},
                            };
                            var type = argType === 'date' ? TYPE.date : TYPE.time;
                            return {
                                val: { type: type, value: value, location: location_1, style: style },
                                err: null,
                            };
                        }
                    }
                    // Regular style or no style.
                    return {
                        val: {
                            type: argType === 'number'
                                ? TYPE.number
                                : argType === 'date'
                                    ? TYPE.date
                                    : TYPE.time,
                            value: value,
                            location: location_1,
                            style: (_a = styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style) !== null && _a !== void 0 ? _a : null,
                        },
                        err: null,
                    };
                }
                case 'plural':
                case 'selectordinal':
                case 'select': {
                    // Parse this range:
                    // {name, plural, options}
                    //              ^---------^
                    var typeEndPosition_1 = this.clonePosition();
                    this.bumpSpace();
                    if (!this.bumpIf(',')) {
                        return this.error(ErrorKind.EXPECT_SELECT_ARGUMENT_OPTIONS, createLocation(typeEndPosition_1, __assign({}, typeEndPosition_1)));
                    }
                    this.bumpSpace();
                    // Parse offset:
                    // {name, plural, offset:1, options}
                    //                ^-----^
                    //
                    // or the first option:
                    //
                    // {name, plural, one {...} other {...}}
                    //                ^--^
                    var identifierAndLocation = this.parseIdentifierIfPossible();
                    var pluralOffset = 0;
                    if (argType !== 'select' && identifierAndLocation.value === 'offset') {
                        if (!this.bumpIf(':')) {
                            return this.error(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, createLocation(this.clonePosition(), this.clonePosition()));
                        }
                        this.bumpSpace();
                        var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, ErrorKind.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
                        if (result.err) {
                            return result;
                        }
                        // Parse another identifier for option parsing
                        this.bumpSpace();
                        identifierAndLocation = this.parseIdentifierIfPossible();
                        pluralOffset = result.val;
                    }
                    var optionsResult = this.tryParsePluralOrSelectOptions(nestingLevel, argType, expectingCloseTag, identifierAndLocation);
                    if (optionsResult.err) {
                        return optionsResult;
                    }
                    var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                    if (argCloseResult.err) {
                        return argCloseResult;
                    }
                    var location_2 = createLocation(openingBracePosition, this.clonePosition());
                    if (argType === 'select') {
                        return {
                            val: {
                                type: TYPE.select,
                                value: value,
                                options: fromEntries(optionsResult.val),
                                location: location_2,
                            },
                            err: null,
                        };
                    }
                    else {
                        return {
                            val: {
                                type: TYPE.plural,
                                value: value,
                                options: fromEntries(optionsResult.val),
                                offset: pluralOffset,
                                pluralType: argType === 'plural' ? 'cardinal' : 'ordinal',
                                location: location_2,
                            },
                            err: null,
                        };
                    }
                }
                default:
                    return this.error(ErrorKind.INVALID_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
            }
        };
        Parser.prototype.tryParseArgumentClose = function (openingBracePosition) {
            // Parse: {value, number, ::currency/GBP }
            //
            if (this.isEOF() || this.char() !== 125 /* `}` */) {
                return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
            }
            this.bump(); // `}`
            return { val: true, err: null };
        };
        /**
         * See: https://github.com/unicode-org/icu/blob/af7ed1f6d2298013dc303628438ec4abe1f16479/icu4c/source/common/messagepattern.cpp#L659
         */
        Parser.prototype.parseSimpleArgStyleIfPossible = function () {
            var nestedBraces = 0;
            var startPosition = this.clonePosition();
            while (!this.isEOF()) {
                var ch = this.char();
                switch (ch) {
                    case 39 /* `'` */: {
                        // Treat apostrophe as quoting but include it in the style part.
                        // Find the end of the quoted literal text.
                        this.bump();
                        var apostrophePosition = this.clonePosition();
                        if (!this.bumpUntil("'")) {
                            return this.error(ErrorKind.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, createLocation(apostrophePosition, this.clonePosition()));
                        }
                        this.bump();
                        break;
                    }
                    case 123 /* `{` */: {
                        nestedBraces += 1;
                        this.bump();
                        break;
                    }
                    case 125 /* `}` */: {
                        if (nestedBraces > 0) {
                            nestedBraces -= 1;
                        }
                        else {
                            return {
                                val: this.message.slice(startPosition.offset, this.offset()),
                                err: null,
                            };
                        }
                        break;
                    }
                    default:
                        this.bump();
                        break;
                }
            }
            return {
                val: this.message.slice(startPosition.offset, this.offset()),
                err: null,
            };
        };
        Parser.prototype.parseNumberSkeletonFromString = function (skeleton, location) {
            var tokens = [];
            try {
                tokens = parseNumberSkeletonFromString(skeleton);
            }
            catch (e) {
                return this.error(ErrorKind.INVALID_NUMBER_SKELETON, location);
            }
            return {
                val: {
                    type: SKELETON_TYPE.number,
                    tokens: tokens,
                    location: location,
                    parsedOptions: this.shouldParseSkeletons
                        ? parseNumberSkeleton(tokens)
                        : {},
                },
                err: null,
            };
        };
        /**
         * @param nesting_level The current nesting level of messages.
         *     This can be positive when parsing message fragment in select or plural argument options.
         * @param parent_arg_type The parent argument's type.
         * @param parsed_first_identifier If provided, this is the first identifier-like selector of
         *     the argument. It is a by-product of a previous parsing attempt.
         * @param expecting_close_tag If true, this message is directly or indirectly nested inside
         *     between a pair of opening and closing tags. The nested message will not parse beyond
         *     the closing tag boundary.
         */
        Parser.prototype.tryParsePluralOrSelectOptions = function (nestingLevel, parentArgType, expectCloseTag, parsedFirstIdentifier) {
            var _a;
            var hasOtherClause = false;
            var options = [];
            var parsedSelectors = new Set();
            var selector = parsedFirstIdentifier.value, selectorLocation = parsedFirstIdentifier.location;
            // Parse:
            // one {one apple}
            // ^--^
            while (true) {
                if (selector.length === 0) {
                    var startPosition = this.clonePosition();
                    if (parentArgType !== 'select' && this.bumpIf('=')) {
                        // Try parse `={number}` selector
                        var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, ErrorKind.INVALID_PLURAL_ARGUMENT_SELECTOR);
                        if (result.err) {
                            return result;
                        }
                        selectorLocation = createLocation(startPosition, this.clonePosition());
                        selector = this.message.slice(startPosition.offset, this.offset());
                    }
                    else {
                        break;
                    }
                }
                // Duplicate selector clauses
                if (parsedSelectors.has(selector)) {
                    return this.error(parentArgType === 'select'
                        ? ErrorKind.DUPLICATE_SELECT_ARGUMENT_SELECTOR
                        : ErrorKind.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, selectorLocation);
                }
                if (selector === 'other') {
                    hasOtherClause = true;
                }
                // Parse:
                // one {one apple}
                //     ^----------^
                this.bumpSpace();
                var openingBracePosition = this.clonePosition();
                if (!this.bumpIf('{')) {
                    return this.error(parentArgType === 'select'
                        ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT
                        : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, createLocation(this.clonePosition(), this.clonePosition()));
                }
                var fragmentResult = this.parseMessage(nestingLevel + 1, parentArgType, expectCloseTag);
                if (fragmentResult.err) {
                    return fragmentResult;
                }
                var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                if (argCloseResult.err) {
                    return argCloseResult;
                }
                options.push([
                    selector,
                    {
                        value: fragmentResult.val,
                        location: createLocation(openingBracePosition, this.clonePosition()),
                    },
                ]);
                // Keep track of the existing selectors
                parsedSelectors.add(selector);
                // Prep next selector clause.
                this.bumpSpace();
                (_a = this.parseIdentifierIfPossible(), selector = _a.value, selectorLocation = _a.location);
            }
            if (options.length === 0) {
                return this.error(parentArgType === 'select'
                    ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR
                    : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, createLocation(this.clonePosition(), this.clonePosition()));
            }
            if (this.requiresOtherClause && !hasOtherClause) {
                return this.error(ErrorKind.MISSING_OTHER_CLAUSE, createLocation(this.clonePosition(), this.clonePosition()));
            }
            return { val: options, err: null };
        };
        Parser.prototype.tryParseDecimalInteger = function (expectNumberError, invalidNumberError) {
            var sign = 1;
            var startingPosition = this.clonePosition();
            if (this.bumpIf('+')) ;
            else if (this.bumpIf('-')) {
                sign = -1;
            }
            var hasDigits = false;
            var decimal = 0;
            while (!this.isEOF()) {
                var ch = this.char();
                if (ch >= 48 /* `0` */ && ch <= 57 /* `9` */) {
                    hasDigits = true;
                    decimal = decimal * 10 + (ch - 48);
                    this.bump();
                }
                else {
                    break;
                }
            }
            var location = createLocation(startingPosition, this.clonePosition());
            if (!hasDigits) {
                return this.error(expectNumberError, location);
            }
            decimal *= sign;
            if (!isSafeInteger(decimal)) {
                return this.error(invalidNumberError, location);
            }
            return { val: decimal, err: null };
        };
        Parser.prototype.offset = function () {
            return this.position.offset;
        };
        Parser.prototype.isEOF = function () {
            return this.offset() === this.message.length;
        };
        Parser.prototype.clonePosition = function () {
            // This is much faster than `Object.assign` or spread.
            return {
                offset: this.position.offset,
                line: this.position.line,
                column: this.position.column,
            };
        };
        /**
         * Return the code point at the current position of the parser.
         * Throws if the index is out of bound.
         */
        Parser.prototype.char = function () {
            var offset = this.position.offset;
            if (offset >= this.message.length) {
                throw Error('out of bound');
            }
            var code = codePointAt(this.message, offset);
            if (code === undefined) {
                throw Error("Offset " + offset + " is at invalid UTF-16 code unit boundary");
            }
            return code;
        };
        Parser.prototype.error = function (kind, location) {
            return {
                val: null,
                err: {
                    kind: kind,
                    message: this.message,
                    location: location,
                },
            };
        };
        /** Bump the parser to the next UTF-16 code unit. */
        Parser.prototype.bump = function () {
            if (this.isEOF()) {
                return;
            }
            var code = this.char();
            if (code === 10 /* '\n' */) {
                this.position.line += 1;
                this.position.column = 1;
                this.position.offset += 1;
            }
            else {
                this.position.column += 1;
                // 0 ~ 0x10000 -> unicode BMP, otherwise skip the surrogate pair.
                this.position.offset += code < 0x10000 ? 1 : 2;
            }
        };
        /**
         * If the substring starting at the current position of the parser has
         * the given prefix, then bump the parser to the character immediately
         * following the prefix and return true. Otherwise, don't bump the parser
         * and return false.
         */
        Parser.prototype.bumpIf = function (prefix) {
            if (startsWith(this.message, prefix, this.offset())) {
                for (var i = 0; i < prefix.length; i++) {
                    this.bump();
                }
                return true;
            }
            return false;
        };
        /**
         * Bump the parser until the pattern character is found and return `true`.
         * Otherwise bump to the end of the file and return `false`.
         */
        Parser.prototype.bumpUntil = function (pattern) {
            var currentOffset = this.offset();
            var index = this.message.indexOf(pattern, currentOffset);
            if (index >= 0) {
                this.bumpTo(index);
                return true;
            }
            else {
                this.bumpTo(this.message.length);
                return false;
            }
        };
        /**
         * Bump the parser to the target offset.
         * If target offset is beyond the end of the input, bump the parser to the end of the input.
         */
        Parser.prototype.bumpTo = function (targetOffset) {
            if (this.offset() > targetOffset) {
                throw Error("targetOffset " + targetOffset + " must be greater than or equal to the current offset " + this.offset());
            }
            targetOffset = Math.min(targetOffset, this.message.length);
            while (true) {
                var offset = this.offset();
                if (offset === targetOffset) {
                    break;
                }
                if (offset > targetOffset) {
                    throw Error("targetOffset " + targetOffset + " is at invalid UTF-16 code unit boundary");
                }
                this.bump();
                if (this.isEOF()) {
                    break;
                }
            }
        };
        /** advance the parser through all whitespace to the next non-whitespace code unit. */
        Parser.prototype.bumpSpace = function () {
            while (!this.isEOF() && _isWhiteSpace(this.char())) {
                this.bump();
            }
        };
        /**
         * Peek at the *next* Unicode codepoint in the input without advancing the parser.
         * If the input has been exhausted, then this returns null.
         */
        Parser.prototype.peek = function () {
            if (this.isEOF()) {
                return null;
            }
            var code = this.char();
            var offset = this.offset();
            var nextCode = this.message.charCodeAt(offset + (code >= 0x10000 ? 2 : 1));
            return nextCode !== null && nextCode !== void 0 ? nextCode : null;
        };
        return Parser;
    }());
    /**
     * This check if codepoint is alphabet (lower & uppercase)
     * @param codepoint
     * @returns
     */
    function _isAlpha(codepoint) {
        return ((codepoint >= 97 && codepoint <= 122) ||
            (codepoint >= 65 && codepoint <= 90));
    }
    function _isAlphaOrSlash(codepoint) {
        return _isAlpha(codepoint) || codepoint === 47; /* '/' */
    }
    /** See `parseTag` function docs. */
    function _isPotentialElementNameChar(c) {
        return (c === 45 /* '-' */ ||
            c === 46 /* '.' */ ||
            (c >= 48 && c <= 57) /* 0..9 */ ||
            c === 95 /* '_' */ ||
            (c >= 97 && c <= 122) /** a..z */ ||
            (c >= 65 && c <= 90) /* A..Z */ ||
            c == 0xb7 ||
            (c >= 0xc0 && c <= 0xd6) ||
            (c >= 0xd8 && c <= 0xf6) ||
            (c >= 0xf8 && c <= 0x37d) ||
            (c >= 0x37f && c <= 0x1fff) ||
            (c >= 0x200c && c <= 0x200d) ||
            (c >= 0x203f && c <= 0x2040) ||
            (c >= 0x2070 && c <= 0x218f) ||
            (c >= 0x2c00 && c <= 0x2fef) ||
            (c >= 0x3001 && c <= 0xd7ff) ||
            (c >= 0xf900 && c <= 0xfdcf) ||
            (c >= 0xfdf0 && c <= 0xfffd) ||
            (c >= 0x10000 && c <= 0xeffff));
    }
    /**
     * Code point equivalent of regex `\p{White_Space}`.
     * From: https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
     */
    function _isWhiteSpace(c) {
        return ((c >= 0x0009 && c <= 0x000d) ||
            c === 0x0020 ||
            c === 0x0085 ||
            (c >= 0x200e && c <= 0x200f) ||
            c === 0x2028 ||
            c === 0x2029);
    }
    /**
     * Code point equivalent of regex `\p{Pattern_Syntax}`.
     * See https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
     */
    function _isPatternSyntax(c) {
        return ((c >= 0x0021 && c <= 0x0023) ||
            c === 0x0024 ||
            (c >= 0x0025 && c <= 0x0027) ||
            c === 0x0028 ||
            c === 0x0029 ||
            c === 0x002a ||
            c === 0x002b ||
            c === 0x002c ||
            c === 0x002d ||
            (c >= 0x002e && c <= 0x002f) ||
            (c >= 0x003a && c <= 0x003b) ||
            (c >= 0x003c && c <= 0x003e) ||
            (c >= 0x003f && c <= 0x0040) ||
            c === 0x005b ||
            c === 0x005c ||
            c === 0x005d ||
            c === 0x005e ||
            c === 0x0060 ||
            c === 0x007b ||
            c === 0x007c ||
            c === 0x007d ||
            c === 0x007e ||
            c === 0x00a1 ||
            (c >= 0x00a2 && c <= 0x00a5) ||
            c === 0x00a6 ||
            c === 0x00a7 ||
            c === 0x00a9 ||
            c === 0x00ab ||
            c === 0x00ac ||
            c === 0x00ae ||
            c === 0x00b0 ||
            c === 0x00b1 ||
            c === 0x00b6 ||
            c === 0x00bb ||
            c === 0x00bf ||
            c === 0x00d7 ||
            c === 0x00f7 ||
            (c >= 0x2010 && c <= 0x2015) ||
            (c >= 0x2016 && c <= 0x2017) ||
            c === 0x2018 ||
            c === 0x2019 ||
            c === 0x201a ||
            (c >= 0x201b && c <= 0x201c) ||
            c === 0x201d ||
            c === 0x201e ||
            c === 0x201f ||
            (c >= 0x2020 && c <= 0x2027) ||
            (c >= 0x2030 && c <= 0x2038) ||
            c === 0x2039 ||
            c === 0x203a ||
            (c >= 0x203b && c <= 0x203e) ||
            (c >= 0x2041 && c <= 0x2043) ||
            c === 0x2044 ||
            c === 0x2045 ||
            c === 0x2046 ||
            (c >= 0x2047 && c <= 0x2051) ||
            c === 0x2052 ||
            c === 0x2053 ||
            (c >= 0x2055 && c <= 0x205e) ||
            (c >= 0x2190 && c <= 0x2194) ||
            (c >= 0x2195 && c <= 0x2199) ||
            (c >= 0x219a && c <= 0x219b) ||
            (c >= 0x219c && c <= 0x219f) ||
            c === 0x21a0 ||
            (c >= 0x21a1 && c <= 0x21a2) ||
            c === 0x21a3 ||
            (c >= 0x21a4 && c <= 0x21a5) ||
            c === 0x21a6 ||
            (c >= 0x21a7 && c <= 0x21ad) ||
            c === 0x21ae ||
            (c >= 0x21af && c <= 0x21cd) ||
            (c >= 0x21ce && c <= 0x21cf) ||
            (c >= 0x21d0 && c <= 0x21d1) ||
            c === 0x21d2 ||
            c === 0x21d3 ||
            c === 0x21d4 ||
            (c >= 0x21d5 && c <= 0x21f3) ||
            (c >= 0x21f4 && c <= 0x22ff) ||
            (c >= 0x2300 && c <= 0x2307) ||
            c === 0x2308 ||
            c === 0x2309 ||
            c === 0x230a ||
            c === 0x230b ||
            (c >= 0x230c && c <= 0x231f) ||
            (c >= 0x2320 && c <= 0x2321) ||
            (c >= 0x2322 && c <= 0x2328) ||
            c === 0x2329 ||
            c === 0x232a ||
            (c >= 0x232b && c <= 0x237b) ||
            c === 0x237c ||
            (c >= 0x237d && c <= 0x239a) ||
            (c >= 0x239b && c <= 0x23b3) ||
            (c >= 0x23b4 && c <= 0x23db) ||
            (c >= 0x23dc && c <= 0x23e1) ||
            (c >= 0x23e2 && c <= 0x2426) ||
            (c >= 0x2427 && c <= 0x243f) ||
            (c >= 0x2440 && c <= 0x244a) ||
            (c >= 0x244b && c <= 0x245f) ||
            (c >= 0x2500 && c <= 0x25b6) ||
            c === 0x25b7 ||
            (c >= 0x25b8 && c <= 0x25c0) ||
            c === 0x25c1 ||
            (c >= 0x25c2 && c <= 0x25f7) ||
            (c >= 0x25f8 && c <= 0x25ff) ||
            (c >= 0x2600 && c <= 0x266e) ||
            c === 0x266f ||
            (c >= 0x2670 && c <= 0x2767) ||
            c === 0x2768 ||
            c === 0x2769 ||
            c === 0x276a ||
            c === 0x276b ||
            c === 0x276c ||
            c === 0x276d ||
            c === 0x276e ||
            c === 0x276f ||
            c === 0x2770 ||
            c === 0x2771 ||
            c === 0x2772 ||
            c === 0x2773 ||
            c === 0x2774 ||
            c === 0x2775 ||
            (c >= 0x2794 && c <= 0x27bf) ||
            (c >= 0x27c0 && c <= 0x27c4) ||
            c === 0x27c5 ||
            c === 0x27c6 ||
            (c >= 0x27c7 && c <= 0x27e5) ||
            c === 0x27e6 ||
            c === 0x27e7 ||
            c === 0x27e8 ||
            c === 0x27e9 ||
            c === 0x27ea ||
            c === 0x27eb ||
            c === 0x27ec ||
            c === 0x27ed ||
            c === 0x27ee ||
            c === 0x27ef ||
            (c >= 0x27f0 && c <= 0x27ff) ||
            (c >= 0x2800 && c <= 0x28ff) ||
            (c >= 0x2900 && c <= 0x2982) ||
            c === 0x2983 ||
            c === 0x2984 ||
            c === 0x2985 ||
            c === 0x2986 ||
            c === 0x2987 ||
            c === 0x2988 ||
            c === 0x2989 ||
            c === 0x298a ||
            c === 0x298b ||
            c === 0x298c ||
            c === 0x298d ||
            c === 0x298e ||
            c === 0x298f ||
            c === 0x2990 ||
            c === 0x2991 ||
            c === 0x2992 ||
            c === 0x2993 ||
            c === 0x2994 ||
            c === 0x2995 ||
            c === 0x2996 ||
            c === 0x2997 ||
            c === 0x2998 ||
            (c >= 0x2999 && c <= 0x29d7) ||
            c === 0x29d8 ||
            c === 0x29d9 ||
            c === 0x29da ||
            c === 0x29db ||
            (c >= 0x29dc && c <= 0x29fb) ||
            c === 0x29fc ||
            c === 0x29fd ||
            (c >= 0x29fe && c <= 0x2aff) ||
            (c >= 0x2b00 && c <= 0x2b2f) ||
            (c >= 0x2b30 && c <= 0x2b44) ||
            (c >= 0x2b45 && c <= 0x2b46) ||
            (c >= 0x2b47 && c <= 0x2b4c) ||
            (c >= 0x2b4d && c <= 0x2b73) ||
            (c >= 0x2b74 && c <= 0x2b75) ||
            (c >= 0x2b76 && c <= 0x2b95) ||
            c === 0x2b96 ||
            (c >= 0x2b97 && c <= 0x2bff) ||
            (c >= 0x2e00 && c <= 0x2e01) ||
            c === 0x2e02 ||
            c === 0x2e03 ||
            c === 0x2e04 ||
            c === 0x2e05 ||
            (c >= 0x2e06 && c <= 0x2e08) ||
            c === 0x2e09 ||
            c === 0x2e0a ||
            c === 0x2e0b ||
            c === 0x2e0c ||
            c === 0x2e0d ||
            (c >= 0x2e0e && c <= 0x2e16) ||
            c === 0x2e17 ||
            (c >= 0x2e18 && c <= 0x2e19) ||
            c === 0x2e1a ||
            c === 0x2e1b ||
            c === 0x2e1c ||
            c === 0x2e1d ||
            (c >= 0x2e1e && c <= 0x2e1f) ||
            c === 0x2e20 ||
            c === 0x2e21 ||
            c === 0x2e22 ||
            c === 0x2e23 ||
            c === 0x2e24 ||
            c === 0x2e25 ||
            c === 0x2e26 ||
            c === 0x2e27 ||
            c === 0x2e28 ||
            c === 0x2e29 ||
            (c >= 0x2e2a && c <= 0x2e2e) ||
            c === 0x2e2f ||
            (c >= 0x2e30 && c <= 0x2e39) ||
            (c >= 0x2e3a && c <= 0x2e3b) ||
            (c >= 0x2e3c && c <= 0x2e3f) ||
            c === 0x2e40 ||
            c === 0x2e41 ||
            c === 0x2e42 ||
            (c >= 0x2e43 && c <= 0x2e4f) ||
            (c >= 0x2e50 && c <= 0x2e51) ||
            c === 0x2e52 ||
            (c >= 0x2e53 && c <= 0x2e7f) ||
            (c >= 0x3001 && c <= 0x3003) ||
            c === 0x3008 ||
            c === 0x3009 ||
            c === 0x300a ||
            c === 0x300b ||
            c === 0x300c ||
            c === 0x300d ||
            c === 0x300e ||
            c === 0x300f ||
            c === 0x3010 ||
            c === 0x3011 ||
            (c >= 0x3012 && c <= 0x3013) ||
            c === 0x3014 ||
            c === 0x3015 ||
            c === 0x3016 ||
            c === 0x3017 ||
            c === 0x3018 ||
            c === 0x3019 ||
            c === 0x301a ||
            c === 0x301b ||
            c === 0x301c ||
            c === 0x301d ||
            (c >= 0x301e && c <= 0x301f) ||
            c === 0x3020 ||
            c === 0x3030 ||
            c === 0xfd3e ||
            c === 0xfd3f ||
            (c >= 0xfe45 && c <= 0xfe46));
    }

    function pruneLocation(els) {
        els.forEach(function (el) {
            delete el.location;
            if (isSelectElement(el) || isPluralElement(el)) {
                for (var k in el.options) {
                    delete el.options[k].location;
                    pruneLocation(el.options[k].value);
                }
            }
            else if (isNumberElement(el) && isNumberSkeleton(el.style)) {
                delete el.style.location;
            }
            else if ((isDateElement(el) || isTimeElement(el)) &&
                isDateTimeSkeleton(el.style)) {
                delete el.style.location;
            }
            else if (isTagElement(el)) {
                pruneLocation(el.children);
            }
        });
    }
    function parse(message, opts) {
        if (opts === void 0) { opts = {}; }
        opts = __assign({ shouldParseSkeletons: true, requiresOtherClause: true }, opts);
        var result = new Parser$1(message, opts).parse();
        if (result.err) {
            var error = SyntaxError(ErrorKind[result.err.kind]);
            // @ts-expect-error Assign to error object
            error.location = result.err.location;
            // @ts-expect-error Assign to error object
            error.originalMessage = result.err.message;
            throw error;
        }
        if (!(opts === null || opts === void 0 ? void 0 : opts.captureLocation)) {
            pruneLocation(result.val);
        }
        return result.val;
    }

    //
    // Main
    //
    function memoize(fn, options) {
        var cache = options && options.cache ? options.cache : cacheDefault;
        var serializer = options && options.serializer ? options.serializer : serializerDefault;
        var strategy = options && options.strategy ? options.strategy : strategyDefault;
        return strategy(fn, {
            cache: cache,
            serializer: serializer,
        });
    }
    //
    // Strategy
    //
    function isPrimitive(value) {
        return (value == null || typeof value === 'number' || typeof value === 'boolean'); // || typeof value === "string" 'unsafe' primitive for our needs
    }
    function monadic(fn, cache, serializer, arg) {
        var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
        var computedValue = cache.get(cacheKey);
        if (typeof computedValue === 'undefined') {
            computedValue = fn.call(this, arg);
            cache.set(cacheKey, computedValue);
        }
        return computedValue;
    }
    function variadic(fn, cache, serializer) {
        var args = Array.prototype.slice.call(arguments, 3);
        var cacheKey = serializer(args);
        var computedValue = cache.get(cacheKey);
        if (typeof computedValue === 'undefined') {
            computedValue = fn.apply(this, args);
            cache.set(cacheKey, computedValue);
        }
        return computedValue;
    }
    function assemble(fn, context, strategy, cache, serialize) {
        return strategy.bind(context, fn, cache, serialize);
    }
    function strategyDefault(fn, options) {
        var strategy = fn.length === 1 ? monadic : variadic;
        return assemble(fn, this, strategy, options.cache.create(), options.serializer);
    }
    function strategyVariadic(fn, options) {
        return assemble(fn, this, variadic, options.cache.create(), options.serializer);
    }
    function strategyMonadic(fn, options) {
        return assemble(fn, this, monadic, options.cache.create(), options.serializer);
    }
    //
    // Serializer
    //
    var serializerDefault = function () {
        return JSON.stringify(arguments);
    };
    //
    // Cache
    //
    function ObjectWithoutPrototypeCache() {
        this.cache = Object.create(null);
    }
    ObjectWithoutPrototypeCache.prototype.get = function (key) {
        return this.cache[key];
    };
    ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
        this.cache[key] = value;
    };
    var cacheDefault = {
        create: function create() {
            // @ts-ignore
            return new ObjectWithoutPrototypeCache();
        },
    };
    var strategies = {
        variadic: strategyVariadic,
        monadic: strategyMonadic,
    };

    var ErrorCode;
    (function (ErrorCode) {
        // When we have a placeholder but no value to format
        ErrorCode["MISSING_VALUE"] = "MISSING_VALUE";
        // When value supplied is invalid
        ErrorCode["INVALID_VALUE"] = "INVALID_VALUE";
        // When we need specific Intl API but it's not available
        ErrorCode["MISSING_INTL_API"] = "MISSING_INTL_API";
    })(ErrorCode || (ErrorCode = {}));
    var FormatError = /** @class */ (function (_super) {
        __extends(FormatError, _super);
        function FormatError(msg, code, originalMessage) {
            var _this = _super.call(this, msg) || this;
            _this.code = code;
            _this.originalMessage = originalMessage;
            return _this;
        }
        FormatError.prototype.toString = function () {
            return "[formatjs Error: " + this.code + "] " + this.message;
        };
        return FormatError;
    }(Error));
    var InvalidValueError = /** @class */ (function (_super) {
        __extends(InvalidValueError, _super);
        function InvalidValueError(variableId, value, options, originalMessage) {
            return _super.call(this, "Invalid values for \"" + variableId + "\": \"" + value + "\". Options are \"" + Object.keys(options).join('", "') + "\"", ErrorCode.INVALID_VALUE, originalMessage) || this;
        }
        return InvalidValueError;
    }(FormatError));
    var InvalidValueTypeError = /** @class */ (function (_super) {
        __extends(InvalidValueTypeError, _super);
        function InvalidValueTypeError(value, type, originalMessage) {
            return _super.call(this, "Value for \"" + value + "\" must be of type " + type, ErrorCode.INVALID_VALUE, originalMessage) || this;
        }
        return InvalidValueTypeError;
    }(FormatError));
    var MissingValueError = /** @class */ (function (_super) {
        __extends(MissingValueError, _super);
        function MissingValueError(variableId, originalMessage) {
            return _super.call(this, "The intl string context variable \"" + variableId + "\" was not provided to the string \"" + originalMessage + "\"", ErrorCode.MISSING_VALUE, originalMessage) || this;
        }
        return MissingValueError;
    }(FormatError));

    var PART_TYPE;
    (function (PART_TYPE) {
        PART_TYPE[PART_TYPE["literal"] = 0] = "literal";
        PART_TYPE[PART_TYPE["object"] = 1] = "object";
    })(PART_TYPE || (PART_TYPE = {}));
    function mergeLiteral(parts) {
        if (parts.length < 2) {
            return parts;
        }
        return parts.reduce(function (all, part) {
            var lastPart = all[all.length - 1];
            if (!lastPart ||
                lastPart.type !== PART_TYPE.literal ||
                part.type !== PART_TYPE.literal) {
                all.push(part);
            }
            else {
                lastPart.value += part.value;
            }
            return all;
        }, []);
    }
    function isFormatXMLElementFn(el) {
        return typeof el === 'function';
    }
    // TODO(skeleton): add skeleton support
    function formatToParts(els, locales, formatters, formats, values, currentPluralValue, 
    // For debugging
    originalMessage) {
        // Hot path for straight simple msg translations
        if (els.length === 1 && isLiteralElement(els[0])) {
            return [
                {
                    type: PART_TYPE.literal,
                    value: els[0].value,
                },
            ];
        }
        var result = [];
        for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
            var el = els_1[_i];
            // Exit early for string parts.
            if (isLiteralElement(el)) {
                result.push({
                    type: PART_TYPE.literal,
                    value: el.value,
                });
                continue;
            }
            // TODO: should this part be literal type?
            // Replace `#` in plural rules with the actual numeric value.
            if (isPoundElement(el)) {
                if (typeof currentPluralValue === 'number') {
                    result.push({
                        type: PART_TYPE.literal,
                        value: formatters.getNumberFormat(locales).format(currentPluralValue),
                    });
                }
                continue;
            }
            var varName = el.value;
            // Enforce that all required values are provided by the caller.
            if (!(values && varName in values)) {
                throw new MissingValueError(varName, originalMessage);
            }
            var value = values[varName];
            if (isArgumentElement(el)) {
                if (!value || typeof value === 'string' || typeof value === 'number') {
                    value =
                        typeof value === 'string' || typeof value === 'number'
                            ? String(value)
                            : '';
                }
                result.push({
                    type: typeof value === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                    value: value,
                });
                continue;
            }
            // Recursively format plural and select parts' option — which can be a
            // nested pattern structure. The choosing of the option to use is
            // abstracted-by and delegated-to the part helper object.
            if (isDateElement(el)) {
                var style = typeof el.style === 'string'
                    ? formats.date[el.style]
                    : isDateTimeSkeleton(el.style)
                        ? el.style.parsedOptions
                        : undefined;
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters
                        .getDateTimeFormat(locales, style)
                        .format(value),
                });
                continue;
            }
            if (isTimeElement(el)) {
                var style = typeof el.style === 'string'
                    ? formats.time[el.style]
                    : isDateTimeSkeleton(el.style)
                        ? el.style.parsedOptions
                        : undefined;
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters
                        .getDateTimeFormat(locales, style)
                        .format(value),
                });
                continue;
            }
            if (isNumberElement(el)) {
                var style = typeof el.style === 'string'
                    ? formats.number[el.style]
                    : isNumberSkeleton(el.style)
                        ? el.style.parsedOptions
                        : undefined;
                if (style && style.scale) {
                    value =
                        value *
                            (style.scale || 1);
                }
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters
                        .getNumberFormat(locales, style)
                        .format(value),
                });
                continue;
            }
            if (isTagElement(el)) {
                var children = el.children, value_1 = el.value;
                var formatFn = values[value_1];
                if (!isFormatXMLElementFn(formatFn)) {
                    throw new InvalidValueTypeError(value_1, 'function', originalMessage);
                }
                var parts = formatToParts(children, locales, formatters, formats, values, currentPluralValue);
                var chunks = formatFn(parts.map(function (p) { return p.value; }));
                if (!Array.isArray(chunks)) {
                    chunks = [chunks];
                }
                result.push.apply(result, chunks.map(function (c) {
                    return {
                        type: typeof c === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                        value: c,
                    };
                }));
            }
            if (isSelectElement(el)) {
                var opt = el.options[value] || el.options.other;
                if (!opt) {
                    throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
                }
                result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values));
                continue;
            }
            if (isPluralElement(el)) {
                var opt = el.options["=" + value];
                if (!opt) {
                    if (!Intl.PluralRules) {
                        throw new FormatError("Intl.PluralRules is not available in this environment.\nTry polyfilling it using \"@formatjs/intl-pluralrules\"\n", ErrorCode.MISSING_INTL_API, originalMessage);
                    }
                    var rule = formatters
                        .getPluralRules(locales, { type: el.pluralType })
                        .select(value - (el.offset || 0));
                    opt = el.options[rule] || el.options.other;
                }
                if (!opt) {
                    throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
                }
                result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values, value - (el.offset || 0)));
                continue;
            }
        }
        return mergeLiteral(result);
    }

    /*
    Copyright (c) 2014, Yahoo! Inc. All rights reserved.
    Copyrights licensed under the New BSD License.
    See the accompanying LICENSE file for terms.
    */
    // -- MessageFormat --------------------------------------------------------
    function mergeConfig(c1, c2) {
        if (!c2) {
            return c1;
        }
        return __assign(__assign(__assign({}, (c1 || {})), (c2 || {})), Object.keys(c1).reduce(function (all, k) {
            all[k] = __assign(__assign({}, c1[k]), (c2[k] || {}));
            return all;
        }, {}));
    }
    function mergeConfigs(defaultConfig, configs) {
        if (!configs) {
            return defaultConfig;
        }
        return Object.keys(defaultConfig).reduce(function (all, k) {
            all[k] = mergeConfig(defaultConfig[k], configs[k]);
            return all;
        }, __assign({}, defaultConfig));
    }
    function createFastMemoizeCache(store) {
        return {
            create: function () {
                return {
                    get: function (key) {
                        return store[key];
                    },
                    set: function (key, value) {
                        store[key] = value;
                    },
                };
            },
        };
    }
    function createDefaultFormatters(cache) {
        if (cache === void 0) { cache = {
            number: {},
            dateTime: {},
            pluralRules: {},
        }; }
        return {
            getNumberFormat: memoize(function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new ((_a = Intl.NumberFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
            }, {
                cache: createFastMemoizeCache(cache.number),
                strategy: strategies.variadic,
            }),
            getDateTimeFormat: memoize(function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new ((_a = Intl.DateTimeFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
            }, {
                cache: createFastMemoizeCache(cache.dateTime),
                strategy: strategies.variadic,
            }),
            getPluralRules: memoize(function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new ((_a = Intl.PluralRules).bind.apply(_a, __spreadArray([void 0], args, false)))();
            }, {
                cache: createFastMemoizeCache(cache.pluralRules),
                strategy: strategies.variadic,
            }),
        };
    }
    var IntlMessageFormat = /** @class */ (function () {
        function IntlMessageFormat(message, locales, overrideFormats, opts) {
            var _this = this;
            if (locales === void 0) { locales = IntlMessageFormat.defaultLocale; }
            this.formatterCache = {
                number: {},
                dateTime: {},
                pluralRules: {},
            };
            this.format = function (values) {
                var parts = _this.formatToParts(values);
                // Hot path for straight simple msg translations
                if (parts.length === 1) {
                    return parts[0].value;
                }
                var result = parts.reduce(function (all, part) {
                    if (!all.length ||
                        part.type !== PART_TYPE.literal ||
                        typeof all[all.length - 1] !== 'string') {
                        all.push(part.value);
                    }
                    else {
                        all[all.length - 1] += part.value;
                    }
                    return all;
                }, []);
                if (result.length <= 1) {
                    return result[0] || '';
                }
                return result;
            };
            this.formatToParts = function (values) {
                return formatToParts(_this.ast, _this.locales, _this.formatters, _this.formats, values, undefined, _this.message);
            };
            this.resolvedOptions = function () { return ({
                locale: Intl.NumberFormat.supportedLocalesOf(_this.locales)[0],
            }); };
            this.getAst = function () { return _this.ast; };
            if (typeof message === 'string') {
                this.message = message;
                if (!IntlMessageFormat.__parse) {
                    throw new TypeError('IntlMessageFormat.__parse must be set to process `message` of type `string`');
                }
                // Parse string messages into an AST.
                this.ast = IntlMessageFormat.__parse(message, {
                    ignoreTag: opts === null || opts === void 0 ? void 0 : opts.ignoreTag,
                });
            }
            else {
                this.ast = message;
            }
            if (!Array.isArray(this.ast)) {
                throw new TypeError('A message must be provided as a String or AST.');
            }
            // Creates a new object with the specified `formats` merged with the default
            // formats.
            this.formats = mergeConfigs(IntlMessageFormat.formats, overrideFormats);
            // Defined first because it's used to build the format pattern.
            this.locales = locales;
            this.formatters =
                (opts && opts.formatters) || createDefaultFormatters(this.formatterCache);
        }
        Object.defineProperty(IntlMessageFormat, "defaultLocale", {
            get: function () {
                if (!IntlMessageFormat.memoizedDefaultLocale) {
                    IntlMessageFormat.memoizedDefaultLocale =
                        new Intl.NumberFormat().resolvedOptions().locale;
                }
                return IntlMessageFormat.memoizedDefaultLocale;
            },
            enumerable: false,
            configurable: true
        });
        IntlMessageFormat.memoizedDefaultLocale = null;
        IntlMessageFormat.__parse = parse;
        // Default format options used as the prototype of the `formats` provided to the
        // constructor. These are used when constructing the internal Intl.NumberFormat
        // and Intl.DateTimeFormat instances.
        IntlMessageFormat.formats = {
            number: {
                integer: {
                    maximumFractionDigits: 0,
                },
                currency: {
                    style: 'currency',
                },
                percent: {
                    style: 'percent',
                },
            },
            date: {
                short: {
                    month: 'numeric',
                    day: 'numeric',
                    year: '2-digit',
                },
                medium: {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                },
                long: {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                },
                full: {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                },
            },
            time: {
                short: {
                    hour: 'numeric',
                    minute: 'numeric',
                },
                medium: {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                },
                long: {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZoneName: 'short',
                },
                full: {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZoneName: 'short',
                },
            },
        };
        return IntlMessageFormat;
    }());

    /*
    Copyright (c) 2014, Yahoo! Inc. All rights reserved.
    Copyrights licensed under the New BSD License.
    See the accompanying LICENSE file for terms.
    */
    var o = IntlMessageFormat;

    const r={},i=(e,n,t)=>t?(n in r||(r[n]={}),e in r[n]||(r[n][e]=t),t):t,l=(e,n)=>{if(null==n)return;if(n in r&&e in r[n])return r[n][e];const t=E(n);for(let o=0;o<t.length;o++){const r=c(t[o],e);if(r)return i(e,n,r)}};let a;const s=writable({});function u(e){return e in a}function c(e,n){if(!u(e))return null;return function(e,n){if(null==n)return;if(n in e)return e[n];const t=n.split(".");let o=e;for(let e=0;e<t.length;e++)if("object"==typeof o){if(e>0){const n=t.slice(e,t.length).join(".");if(n in o){o=o[n];break}}o=o[t[e]];}else o=void 0;return o}(function(e){return a[e]||null}(e),n)}function m(e,...n){delete r[e],s.update((o=>(o[e]=cjs.all([o[e]||{},...n]),o)));}derived([s],(([e])=>Object.keys(e)));s.subscribe((e=>a=e));const d={};function g(e){return d[e]}function w(e){return null!=e&&E(e).some((e=>{var n;return null===(n=g(e))||void 0===n?void 0:n.size}))}function h(e,n){return Promise.all(n.map((n=>(function(e,n){d[e].delete(n),0===d[e].size&&delete d[e];}(e,n),n().then((e=>e.default||e)))))).then((n=>m(e,...n)))}const p={};function b(e){if(!w(e))return e in p?p[e]:Promise.resolve();const n=function(e){return E(e).map((e=>{const n=g(e);return [e,n?[...n]:[]]})).filter((([,e])=>e.length>0))}(e);return p[e]=Promise.all(n.map((([e,n])=>h(e,n)))).then((()=>{if(w(e))return b(e);delete p[e];})),p[e]}function y(e,n){g(e)||function(e){d[e]=new Set;}(e);const t=g(e);g(e).has(n)||(u(e)||s.update((n=>(n[e]={},n))),t.add(n));}
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
    ***************************************************************************** */function v(e,n){var t={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&n.indexOf(o)<0&&(t[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)n.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(t[o[r]]=e[o[r]]);}return t}const O={fallbackLocale:null,loadingDelay:200,formats:{number:{scientific:{notation:"scientific"},engineering:{notation:"engineering"},compactLong:{notation:"compact",compactDisplay:"long"},compactShort:{notation:"compact",compactDisplay:"short"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}},warnOnMissingMessages:!0,ignoreTag:!0};function j(){return O}function $(e){const{formats:n}=e,t=v(e,["formats"]),o=e.initialLocale||e.fallbackLocale;return Object.assign(O,t,{initialLocale:o}),n&&("number"in n&&Object.assign(O.formats.number,n.number),"date"in n&&Object.assign(O.formats.date,n.date),"time"in n&&Object.assign(O.formats.time,n.time)),M.set(o)}const k=writable(!1);let L;const T=writable(null);function x(e){return e.split("-").map(((e,n,t)=>t.slice(0,n+1).join("-"))).reverse()}function E(e,n=j().fallbackLocale){const t=x(e);return n?[...new Set([...t,...x(n)])]:t}function D(){return null!=L?L:void 0}T.subscribe((e=>{L=null!=e?e:void 0,"undefined"!=typeof window&&null!=e&&document.documentElement.setAttribute("lang",e);}));const M=Object.assign(Object.assign({},T),{set:e=>{if(e&&function(e){if(null==e)return;const n=E(e);for(let e=0;e<n.length;e++){const t=n[e];if(u(t))return t}}(e)&&w(e)){const{loadingDelay:n}=j();let t;return "undefined"!=typeof window&&null!=D()&&n?t=window.setTimeout((()=>k.set(!0)),n):k.set(!0),b(e).then((()=>{T.set(e);})).finally((()=>{clearTimeout(t),k.set(!1);}))}return T.set(e)}}),I=()=>"undefined"==typeof window?null:window.navigator.language||window.navigator.languages[0],Z=e=>{const n=Object.create(null);return t=>{const o=JSON.stringify(t);return o in n?n[o]:n[o]=e(t)}},C=(e,n)=>{const{formats:t}=j();if(e in t&&n in t[e])return t[e][n];throw new Error(`[svelte-i18n] Unknown "${n}" ${e} format.`)},G=Z((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format numbers');return t&&(o=C("number",t)),new Intl.NumberFormat(n,o)})),J=Z((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format dates');return t?o=C("date",t):0===Object.keys(o).length&&(o=C("date","short")),new Intl.DateTimeFormat(n,o)})),U=Z((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format time values');return t?o=C("time",t):0===Object.keys(o).length&&(o=C("time","short")),new Intl.DateTimeFormat(n,o)})),_=(e={})=>{var{locale:n=D()}=e,t=v(e,["locale"]);return G(Object.assign({locale:n},t))},q=(e={})=>{var{locale:n=D()}=e,t=v(e,["locale"]);return J(Object.assign({locale:n},t))},B=(e={})=>{var{locale:n=D()}=e,t=v(e,["locale"]);return U(Object.assign({locale:n},t))},H=Z(((e,n=D())=>new o(e,n,j().formats,{ignoreTag:j().ignoreTag}))),K=(e,n={})=>{let t=n;"object"==typeof e&&(t=e,e=t.id);const{values:o,locale:r=D(),default:i}=t;if(null==r)throw new Error("[svelte-i18n] Cannot format a message without first setting the initial locale.");let a=l(e,r);if(a){if("string"!=typeof a)return console.warn(`[svelte-i18n] Message with id "${e}" must be of type "string", found: "${typeof a}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`),a}else j().warnOnMissingMessages&&console.warn(`[svelte-i18n] The message "${e}" was not found in "${E(r).join('", "')}".${w(D())?"\n\nNote: there are at least one loader still registered to this locale that wasn't executed.":""}`),a=null!=i?i:e;if(!o)return a;let s=a;try{s=H(a,r).format(o);}catch(n){console.warn(`[svelte-i18n] Message "${e}" has syntax error:`,n.message);}return s},Q=(e,n)=>B(n).format(e),R=(e,n)=>q(n).format(e),V=(e,n)=>_(n).format(e),W=(e,n=D())=>l(e,n),X=derived([M,s],(()=>K));derived([M],(()=>Q));derived([M],(()=>R));derived([M],(()=>V));derived([M,s],(()=>W));

    var _LazyLoader_store;
    var LazyLoadStatus;
    (function (LazyLoadStatus) {
        LazyLoadStatus[LazyLoadStatus["LOADING"] = 0] = "LOADING";
        LazyLoadStatus[LazyLoadStatus["DONE"] = 1] = "DONE";
        LazyLoadStatus[LazyLoadStatus["ERR"] = 2] = "ERR";
    })(LazyLoadStatus || (LazyLoadStatus = {}));
    class LazyLoader {
        constructor(src) {
            _LazyLoader_store.set(this, writable({
                status: LazyLoadStatus.LOADING,
            }));
            this.subscribe = __classPrivateFieldGet(this, _LazyLoader_store, "f").subscribe;
            this.changeSource(src);
        }
        _removeListeners() {
            this._imgEl.removeEventListener('load', this._doneLoading.bind(this));
            this._imgEl.removeEventListener('error', this._failedToLoad.bind(this));
            this._imgEl.removeEventListener('abort', this._failedToLoad.bind(this));
        }
        _doneLoading() {
            __classPrivateFieldGet(this, _LazyLoader_store, "f").update((store) => {
                store.status = LazyLoadStatus.DONE;
                return store;
            });
            this._removeListeners();
        }
        _failedToLoad() {
            console.error('LazyLoader: failed to load', this._mediaSrc);
            __classPrivateFieldGet(this, _LazyLoader_store, "f").update((store) => {
                store.status = LazyLoadStatus.ERR;
                return store;
            });
            this._removeListeners();
        }
        _load() {
            this._imgEl.addEventListener('load', this._doneLoading.bind(this), { passive: true });
            this._imgEl.addEventListener('error', this._failedToLoad.bind(this), { passive: true });
            this._imgEl.addEventListener('abort', this._failedToLoad.bind(this), { passive: true });
            this._imgEl.src = this._mediaSrc;
            if (this._imgEl.complete) {
                if (this._imgEl.naturalWidth === 0 || this._imgEl.naturalHeight === 0) {
                    return this._failedToLoad();
                }
                return this._doneLoading();
            }
        }
        load() {
            if (document.readyState === 'complete') {
                this._load();
            }
            else
                window.addEventListener('load', this._load.bind(this), { once: true, passive: true });
        }
        changeSource(newSrc) {
            this._mediaSrc = newSrc;
            this._imgEl = document.createElement('img');
        }
        destroy() {
            if (!this._imgEl)
                return;
            this._removeListeners();
            this._imgEl.remove();
        }
    }
    _LazyLoader_store = new WeakMap();

    /* src\sections\LandingSection.svelte generated by Svelte v3.44.1 */
    const file$9 = "src\\sections\\LandingSection.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i].name;
    	child_ctx[24] = list[i].app;
    	child_ctx[25] = list[i].url;
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_2$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    // (145:1) {#if showBigProfilePicture}
    function create_if_block_1$5(ctx) {
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
    			attr_dev(div0, "class", "bg svelte-11qvigb");
    			add_location(div0, file$9, 146, 3, 7386);
    			attr_dev(div1, "class", "picture block-select svelte-11qvigb");
    			set_style(div1, "background-image", "url(" + /*profilePicSrc*/ ctx[0] + ")");
    			add_location(div1, file$9, 151, 3, 7487);
    			attr_dev(div2, "id", "BigProfilePicture");
    			attr_dev(div2, "class", "flex flex-center svelte-11qvigb");
    			add_location(div2, file$9, 145, 2, 7328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*closeBigProfilePicture*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*profilePicSrc*/ 1) {
    				set_style(div1, "background-image", "url(" + /*profilePicSrc*/ ctx[0] + ")");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*bigPicBgTrans*/ ctx[12], {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*bigPicTrans*/ ctx[11], {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*bigPicBgTrans*/ ctx[12], {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*bigPicTrans*/ ctx[11], {}, false);
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
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(145:1) {#if showBigProfilePicture}",
    		ctx
    	});

    	return block;
    }

    // (172:5) {#each professions as pfsn, idx}
    function create_each_block_2$3(ctx) {
    	let span;
    	let t0_value = /*$_*/ ctx[5]('section.landing.profession.' + /*pfsn*/ ctx[27]) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "profession flex flex-center-y svelte-11qvigb");
    			set_style(span, "animation-delay", 50 + /*idx*/ ctx[22] * 100 + "ms");
    			add_location(span, file$9, 172, 6, 8121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 32 && t0_value !== (t0_value = /*$_*/ ctx[5]('section.landing.profession.' + /*pfsn*/ ctx[27]) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$3.name,
    		type: "each",
    		source: "(172:5) {#each professions as pfsn, idx}",
    		ctx
    	});

    	return block;
    }

    // (191:6) {:else}
    function create_else_block$5(ctx) {
    	let a;
    	let svg;
    	let title;
    	let t0_value = /*name*/ ctx[23] + "";
    	let t0;
    	let use;
    	let use_xlink_href_value;
    	let t1;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			use = svg_element("use");
    			t1 = space();
    			attr_dev(title, "class", "svelte-11qvigb");
    			add_location(title, file$9, 196, 9, 9190);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#LOGO_" + /*name*/ ctx[23]);
    			attr_dev(use, "class", "svelte-11qvigb");
    			add_location(use, file$9, 197, 9, 9222);
    			attr_dev(svg, "class", "logo icon-big svelte-11qvigb");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 195, 8, 9095);
    			attr_dev(a, "href", a_href_value = /*url*/ ctx[25]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "role", "listitem");
    			attr_dev(a, "class", "btn flex flex-center svelte-11qvigb");
    			set_style(a, "animation-delay", 50 + /*idx*/ ctx[22] * 100 + "ms");
    			add_location(a, file$9, 191, 7, 8926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(svg, use);
    			append_dev(a, t1);

    			if (!mounted) {
    				dispose = action_destroyer(vibrateLink.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$GlobalStore*/ 16 && t0_value !== (t0_value = /*name*/ ctx[23] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$GlobalStore*/ 16 && use_xlink_href_value !== (use_xlink_href_value = "#LOGO_" + /*name*/ ctx[23])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}

    			if (dirty & /*$GlobalStore*/ 16 && a_href_value !== (a_href_value = /*url*/ ctx[25])) {
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
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(191:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (181:6) {#if app}
    function create_if_block$7(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = /*name*/ ctx[23] + "";
    	let t0;
    	let use;
    	let use_xlink_href_value;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[13](/*idx*/ ctx[22]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			use = svg_element("use");
    			t1 = space();
    			attr_dev(title, "class", "svelte-11qvigb");
    			add_location(title, file$9, 186, 9, 8804);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#LOGO_" + /*name*/ ctx[23]);
    			attr_dev(use, "class", "svelte-11qvigb");
    			add_location(use, file$9, 187, 9, 8836);
    			attr_dev(svg, "class", "icon icon-big svelte-11qvigb");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 185, 8, 8709);
    			attr_dev(button, "role", "listitem");
    			attr_dev(button, "class", "btn flex flex-center svelte-11qvigb");
    			set_style(button, "animation-delay", 50 + /*idx*/ ctx[22] * 100 + "ms");
    			add_location(button, file$9, 181, 7, 8509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(svg, use);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$GlobalStore*/ 16 && t0_value !== (t0_value = /*name*/ ctx[23] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$GlobalStore*/ 16 && use_xlink_href_value !== (use_xlink_href_value = "#LOGO_" + /*name*/ ctx[23])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(181:6) {#if app}",
    		ctx
    	});

    	return block;
    }

    // (180:5) {#each $GlobalStore.socialMedia as {name, app, url}
    function create_each_block_1$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*app*/ ctx[24]) return create_if_block$7;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(180:5) {#each $GlobalStore.socialMedia as {name, app, url}",
    		ctx
    	});

    	return block;
    }

    // (211:4) {#each questions as questID, idx}
    function create_each_block$6(ctx) {
    	let li;
    	let svg;
    	let path;
    	let t0;
    	let a;
    	let q;
    	let t1_value = /*$_*/ ctx[5]('section.landing.question.' + /*questID*/ ctx[20]) + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[15](/*questID*/ ctx[20]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			a = element("a");
    			q = element("q");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(path, "d", "M39.2134 102.64L81.6398 60.2132L39.2134 17.7868");
    			attr_dev(path, "stroke-width", "20");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "class", "svelte-11qvigb");
    			add_location(path, file$9, 213, 7, 9812);
    			attr_dev(svg, "class", "icon stroke icon-default flex-base-size svelte-11qvigb");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "fill", "none");
    			add_location(svg, file$9, 212, 6, 9624);
    			attr_dev(q, "class", "svelte-11qvigb");
    			add_location(q, file$9, 216, 7, 10090);
    			attr_dev(a, "href", "#" + /*questID*/ ctx[20]);
    			attr_dev(a, "role", "button");
    			attr_dev(a, "class", "question flex flex-center-y svelte-11qvigb");
    			add_location(a, file$9, 215, 6, 9958);
    			attr_dev(li, "role", "listitem");
    			attr_dev(li, "class", "question-entry flex flex-center-y nowrap gap-1 svelte-11qvigb");
    			set_style(li, "animation-delay", 50 + /*idx*/ ctx[22] * 100 + "ms");
    			add_location(li, file$9, 211, 5, 9501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, svg);
    			append_dev(svg, path);
    			append_dev(li, t0);
    			append_dev(li, a);
    			append_dev(a, q);
    			append_dev(q, t1);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(click_handler_1), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$_*/ 32 && t1_value !== (t1_value = /*$_*/ ctx[5]('section.landing.question.' + /*questID*/ ctx[20]) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(211:4) {#each questions as questID, idx}",
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
    	let path8;
    	let defs;
    	let pattern;
    	let image;
    	let linearGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient1;
    	let stop2;
    	let stop3;
    	let linearGradient2;
    	let stop4;
    	let stop5;
    	let linearGradient3;
    	let stop6;
    	let stop7;
    	let linearGradient4;
    	let stop8;
    	let stop9;
    	let linearGradient5;
    	let stop10;
    	let stop11;
    	let linearGradient6;
    	let stop12;
    	let stop13;
    	let linearGradient7;
    	let stop14;
    	let stop15;
    	let stop16;
    	let stop17;
    	let stop18;
    	let stop19;
    	let stop20;
    	let t0;
    	let t1;
    	let div3;
    	let div2;
    	let button;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let div1;
    	let h1;
    	let t3_value = /*$_*/ ctx[5]('my_name') + "";
    	let t3;
    	let t4;
    	let div0;
    	let t5;
    	let ul0;
    	let t6;
    	let p;
    	let t7_value = /*$_*/ ctx[5]('about_me') + "";
    	let t7;
    	let t8;
    	let nav;
    	let ul1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*showBigProfilePicture*/ ctx[2] && create_if_block_1$5(ctx);
    	let each_value_2 = /*professions*/ ctx[6];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$3(get_each_context_2$3(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*$GlobalStore*/ ctx[4].socialMedia;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	let each_value = /*questions*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
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
    			path8 = svg_element("path");
    			defs = svg_element("defs");
    			pattern = svg_element("pattern");
    			image = svg_element("image");
    			linearGradient0 = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			linearGradient2 = svg_element("linearGradient");
    			stop4 = svg_element("stop");
    			stop5 = svg_element("stop");
    			linearGradient3 = svg_element("linearGradient");
    			stop6 = svg_element("stop");
    			stop7 = svg_element("stop");
    			linearGradient4 = svg_element("linearGradient");
    			stop8 = svg_element("stop");
    			stop9 = svg_element("stop");
    			linearGradient5 = svg_element("linearGradient");
    			stop10 = svg_element("stop");
    			stop11 = svg_element("stop");
    			linearGradient6 = svg_element("linearGradient");
    			stop12 = svg_element("stop");
    			stop13 = svg_element("stop");
    			linearGradient7 = svg_element("linearGradient");
    			stop14 = svg_element("stop");
    			stop15 = svg_element("stop");
    			stop16 = svg_element("stop");
    			stop17 = svg_element("stop");
    			stop18 = svg_element("stop");
    			stop19 = svg_element("stop");
    			stop20 = svg_element("stop");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button = element("button");
    			img = element("img");
    			t2 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t3 = text(t3_value);
    			t4 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t5 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();
    			p = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			nav = element("nav");
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(path0, "d", "M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z");
    			attr_dev(path0, "fill", "url(#code_bg)");
    			add_location(path0, file$9, 88, 2, 3017);
    			attr_dev(path1, "d", "M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z");
    			attr_dev(path1, "fill", "url(#code_bg_image)");
    			add_location(path1, file$9, 89, 2, 3254);
    			attr_dev(path2, "d", "M91.5 0C91.5 0 86.1631 7.06026 88.1214 14.9719C86.7321 6.79253 97.7283 0 97.7283 0H91.5Z");
    			attr_dev(path2, "fill", "url(#code_bg_4fh89hn3)");
    			add_location(path2, file$9, 91, 3, 3520);
    			attr_dev(path3, "d", "M94.8513 46.0436C95.3713 44.2961 96.1324 42.4256 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304C90.2987 19.645 89.8082 18.9873 89.4106 18.3337C89.4399 18.3891 89.4697 18.4446 89.5 18.5C91.3067 21.8122 92.796 24.0364 93.9407 25.7459C96.5975 29.7138 97.3978 30.9089 96 36.5C95.1652 39.8391 94.8114 43.0208 94.8513 46.0436Z");
    			attr_dev(path3, "fill", "url(#code_bg_um0uf8e3)");
    			add_location(path3, file$9, 92, 3, 3655);
    			attr_dev(g0, "opacity", "0.25");
    			add_location(g0, file$9, 90, 2, 3497);
    			attr_dev(path4, "d", "M95 0C95 0 83.6728 8.40057 89.1794 17.9354C83.9654 8.50155 97.7283 0 97.7283 0H95Z");
    			attr_dev(path4, "fill", "url(#code_bg_4870n8fd)");
    			add_location(path4, file$9, 95, 3, 4067);
    			attr_dev(path5, "d", "M128 87.8149C128 87.8149 103.765 89.4978 95.2574 82.7149C103.903 97.6885 128 87.8149 128 87.8149Z");
    			attr_dev(path5, "fill", "url(#code_bg_u09fjdkm)");
    			add_location(path5, file$9, 96, 3, 4196);
    			attr_dev(path6, "d", "M92.6529 74.9318C92.8084 74.3456 93.0253 73.7335 93.308 73.0945C95.6407 67.8214 95.053 63.6313 94.44 59.2609C94.2624 57.9946 94.0826 56.7131 93.9712 55.3858C93.3331 57.739 92.8055 60.4069 92.5 63.5C92.0587 67.9679 92.1469 71.7458 92.6529 74.9318Z");
    			attr_dev(path6, "fill", "url(#code_bg_0dn09kmd)");
    			add_location(path6, file$9, 97, 3, 4340);
    			attr_dev(path7, "d", "M94.8756 25.2082C93.8007 23.6916 92.4808 22.0656 90.8928 20.304C92.4505 22.0844 93.7686 23.7098 94.8756 25.2082Z");
    			attr_dev(path7, "fill", "url(#code_bg_mlfu93jf)");
    			add_location(path7, file$9, 98, 3, 4633);
    			attr_dev(g1, "opacity", "0.75");
    			add_location(g1, file$9, 94, 2, 4044);
    			attr_dev(path8, "d", "M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z");
    			attr_dev(path8, "fill", "url(#code_bg_rainbow)");
    			attr_dev(path8, "fill-opacity", "0.15");
    			add_location(path8, file$9, 100, 2, 4799);
    			attr_dev(image, "id", "image0");
    			attr_dev(image, "width", "1024");
    			attr_dev(image, "height", "2146");
    			xlink_attr(image, "xlink:href", /*codingBgSrc*/ ctx[1]);
    			attr_dev(image, "transform", "translate(-0.0478835) scale(0.00102516 0.000465983)");
    			add_location(image, file$9, 103, 4, 5170);
    			attr_dev(pattern, "id", "code_bg_image");
    			attr_dev(pattern, "patternContentUnits", "objectBoundingBox");
    			attr_dev(pattern, "width", "1");
    			attr_dev(pattern, "height", "1");
    			add_location(pattern, file$9, 102, 3, 5075);
    			add_location(stop0, file$9, 106, 4, 5447);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#403828");
    			add_location(stop1, file$9, 106, 11, 5454);
    			attr_dev(linearGradient0, "id", "code_bg");
    			attr_dev(linearGradient0, "x1", "108.668");
    			attr_dev(linearGradient0, "y1", "6.1376e-07");
    			attr_dev(linearGradient0, "x2", "178.511");
    			attr_dev(linearGradient0, "y2", "83.6924");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient0, file$9, 105, 3, 5326);
    			attr_dev(stop2, "stop-color", "#E1C769");
    			add_location(stop2, file$9, 109, 4, 5644);
    			attr_dev(stop3, "offset", "1");
    			attr_dev(stop3, "stop-color", "#0038FF");
    			add_location(stop3, file$9, 110, 4, 5678);
    			attr_dev(linearGradient1, "id", "code_bg_4fh89hn3");
    			attr_dev(linearGradient1, "x1", "93.1988");
    			attr_dev(linearGradient1, "y1", "1.73314e-07");
    			attr_dev(linearGradient1, "x2", "117.5");
    			attr_dev(linearGradient1, "y2", "55");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient1, file$9, 108, 3, 5520);
    			attr_dev(stop4, "stop-color", "#E1C769");
    			add_location(stop4, file$9, 113, 4, 5868);
    			attr_dev(stop5, "offset", "1");
    			attr_dev(stop5, "stop-color", "#0038FF");
    			add_location(stop5, file$9, 114, 4, 5902);
    			attr_dev(linearGradient2, "id", "code_bg_um0uf8e3");
    			attr_dev(linearGradient2, "x1", "93.1988");
    			attr_dev(linearGradient2, "y1", "1.73314e-07");
    			attr_dev(linearGradient2, "x2", "117.5");
    			attr_dev(linearGradient2, "y2", "55");
    			attr_dev(linearGradient2, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient2, file$9, 112, 3, 5744);
    			attr_dev(stop6, "stop-color", "#E1C769");
    			add_location(stop6, file$9, 117, 4, 6076);
    			attr_dev(stop7, "offset", "1");
    			attr_dev(stop7, "stop-color", "#FF004D");
    			add_location(stop7, file$9, 118, 4, 6110);
    			attr_dev(linearGradient3, "id", "code_bg_4870n8fd");
    			attr_dev(linearGradient3, "x1", "122");
    			attr_dev(linearGradient3, "y1", "87");
    			attr_dev(linearGradient3, "x2", "86");
    			attr_dev(linearGradient3, "y2", "97");
    			attr_dev(linearGradient3, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient3, file$9, 116, 3, 5968);
    			attr_dev(stop8, "stop-color", "#E1C769");
    			add_location(stop8, file$9, 121, 4, 6284);
    			attr_dev(stop9, "offset", "1");
    			attr_dev(stop9, "stop-color", "#FF004D");
    			add_location(stop9, file$9, 122, 4, 6318);
    			attr_dev(linearGradient4, "id", "code_bg_u09fjdkm");
    			attr_dev(linearGradient4, "x1", "122");
    			attr_dev(linearGradient4, "y1", "87");
    			attr_dev(linearGradient4, "x2", "86");
    			attr_dev(linearGradient4, "y2", "97");
    			attr_dev(linearGradient4, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient4, file$9, 120, 3, 6176);
    			attr_dev(stop10, "stop-color", "#E1C769");
    			add_location(stop10, file$9, 125, 4, 6492);
    			attr_dev(stop11, "offset", "1");
    			attr_dev(stop11, "stop-color", "#FF004D");
    			add_location(stop11, file$9, 126, 4, 6526);
    			attr_dev(linearGradient5, "id", "code_bg_0dn09kmd");
    			attr_dev(linearGradient5, "x1", "122");
    			attr_dev(linearGradient5, "y1", "87");
    			attr_dev(linearGradient5, "x2", "86");
    			attr_dev(linearGradient5, "y2", "97");
    			attr_dev(linearGradient5, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient5, file$9, 124, 3, 6384);
    			attr_dev(stop12, "stop-color", "#E1C769");
    			add_location(stop12, file$9, 129, 4, 6700);
    			attr_dev(stop13, "offset", "1");
    			attr_dev(stop13, "stop-color", "#FF004D");
    			add_location(stop13, file$9, 130, 4, 6734);
    			attr_dev(linearGradient6, "id", "code_bg_mlfu93jf");
    			attr_dev(linearGradient6, "x1", "122");
    			attr_dev(linearGradient6, "y1", "87");
    			attr_dev(linearGradient6, "x2", "86");
    			attr_dev(linearGradient6, "y2", "97");
    			attr_dev(linearGradient6, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient6, file$9, 128, 3, 6592);
    			attr_dev(stop14, "stop-color", "#FF7A00");
    			add_location(stop14, file$9, 133, 4, 6919);
    			attr_dev(stop15, "offset", "0.151042");
    			attr_dev(stop15, "stop-color", "#FFE300");
    			add_location(stop15, file$9, 134, 4, 6953);
    			attr_dev(stop16, "offset", "0.307292");
    			attr_dev(stop16, "stop-color", "#74FF33");
    			add_location(stop16, file$9, 135, 4, 7005);
    			attr_dev(stop17, "offset", "0.479167");
    			attr_dev(stop17, "stop-color", "#00DD8D");
    			add_location(stop17, file$9, 136, 4, 7057);
    			attr_dev(stop18, "offset", "0.671875");
    			attr_dev(stop18, "stop-color", "#3AB8FF");
    			add_location(stop18, file$9, 137, 4, 7109);
    			attr_dev(stop19, "offset", "0.8125");
    			attr_dev(stop19, "stop-color", "#A661FF");
    			add_location(stop19, file$9, 138, 4, 7161);
    			attr_dev(stop20, "offset", "1");
    			attr_dev(stop20, "stop-color", "#FF03D7");
    			add_location(stop20, file$9, 139, 4, 7211);
    			attr_dev(linearGradient7, "id", "code_bg_rainbow");
    			attr_dev(linearGradient7, "x1", "106");
    			attr_dev(linearGradient7, "y1", "-5.5");
    			attr_dev(linearGradient7, "x2", "157.999");
    			attr_dev(linearGradient7, "y2", "75.0645");
    			attr_dev(linearGradient7, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient7, file$9, 132, 3, 6800);
    			add_location(defs, file$9, 101, 2, 5064);
    			attr_dev(svg, "id", "LandingCodingBG");
    			attr_dev(svg, "viewBox", "0 0 128 91");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "class", "svelte-11qvigb");
    			add_location(svg, file$9, 87, 1, 2819);
    			attr_dev(img, "class", "block-select svelte-11qvigb");
    			if (!src_url_equal(img.src, img_src_value = /*profilePicSrc*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*$_*/ ctx[5]('profile_pic_alt'));
    			add_location(img, file$9, 164, 4, 7844);
    			attr_dev(button, "class", "picture block-select svelte-11qvigb");
    			toggle_class(button, "big-preview", /*showBigProfilePicture*/ ctx[2]);
    			add_location(button, file$9, 160, 3, 7714);
    			attr_dev(h1, "class", "name svelte-11qvigb");
    			add_location(h1, file$9, 168, 4, 7973);
    			attr_dev(div0, "class", "professions flex flex-center-y list gap-05 svelte-11qvigb");
    			add_location(div0, file$9, 170, 4, 8018);
    			attr_dev(ul0, "tabindex", "-1");
    			attr_dev(ul0, "role", "listbox");
    			attr_dev(ul0, "class", "social-media flex flex-center-y gap-1 svelte-11qvigb");
    			add_location(ul0, file$9, 178, 4, 8309);
    			attr_dev(div1, "class", "grid gap-05");
    			add_location(div1, file$9, 167, 3, 7942);
    			attr_dev(div2, "class", "header grid grid-center-y gap-2 svelte-11qvigb");
    			add_location(div2, file$9, 159, 2, 7664);
    			attr_dev(p, "class", "text-block svelte-11qvigb");
    			add_location(p, file$9, 206, 2, 9348);
    			attr_dev(ul1, "class", "grid gap-1 question-list");
    			attr_dev(ul1, "role", "list");
    			add_location(ul1, file$9, 209, 3, 9406);
    			attr_dev(nav, "class", "svelte-11qvigb");
    			add_location(nav, file$9, 208, 2, 9396);
    			attr_dev(div3, "class", "contents grid svelte-11qvigb");
    			add_location(div3, file$9, 158, 1, 7633);
    			attr_dev(section, "id", "LandingSection");
    			attr_dev(section, "class", "auto-height svelte-11qvigb");
    			add_location(section, file$9, 86, 0, 2767);
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
    			append_dev(svg, path8);
    			append_dev(svg, defs);
    			append_dev(defs, pattern);
    			append_dev(pattern, image);
    			append_dev(defs, linearGradient0);
    			append_dev(linearGradient0, stop0);
    			append_dev(linearGradient0, stop1);
    			append_dev(defs, linearGradient1);
    			append_dev(linearGradient1, stop2);
    			append_dev(linearGradient1, stop3);
    			append_dev(defs, linearGradient2);
    			append_dev(linearGradient2, stop4);
    			append_dev(linearGradient2, stop5);
    			append_dev(defs, linearGradient3);
    			append_dev(linearGradient3, stop6);
    			append_dev(linearGradient3, stop7);
    			append_dev(defs, linearGradient4);
    			append_dev(linearGradient4, stop8);
    			append_dev(linearGradient4, stop9);
    			append_dev(defs, linearGradient5);
    			append_dev(linearGradient5, stop10);
    			append_dev(linearGradient5, stop11);
    			append_dev(defs, linearGradient6);
    			append_dev(linearGradient6, stop12);
    			append_dev(linearGradient6, stop13);
    			append_dev(defs, linearGradient7);
    			append_dev(linearGradient7, stop14);
    			append_dev(linearGradient7, stop15);
    			append_dev(linearGradient7, stop16);
    			append_dev(linearGradient7, stop17);
    			append_dev(linearGradient7, stop18);
    			append_dev(linearGradient7, stop19);
    			append_dev(linearGradient7, stop20);
    			append_dev(section, t0);
    			if (if_block) if_block.m(section, null);
    			append_dev(section, t1);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(button, img);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div1, t5);
    			append_dev(div1, ul0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			/*ul0_binding*/ ctx[14](ul0);
    			append_dev(div3, t6);
    			append_dev(div3, p);
    			append_dev(p, t7);
    			append_dev(div3, t8);
    			append_dev(div3, nav);
    			append_dev(nav, ul1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*openBigProfilePicture*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*codingBgSrc*/ 2) {
    				xlink_attr(image, "xlink:href", /*codingBgSrc*/ ctx[1]);
    			}

    			if (/*showBigProfilePicture*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showBigProfilePicture*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$5(ctx);
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

    			if (!current || dirty & /*profilePicSrc*/ 1 && !src_url_equal(img.src, img_src_value = /*profilePicSrc*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*$_*/ 32 && img_alt_value !== (img_alt_value = /*$_*/ ctx[5]('profile_pic_alt'))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*showBigProfilePicture*/ 4) {
    				toggle_class(button, "big-preview", /*showBigProfilePicture*/ ctx[2]);
    			}

    			if ((!current || dirty & /*$_*/ 32) && t3_value !== (t3_value = /*$_*/ ctx[5]('my_name') + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*$_, professions*/ 96) {
    				each_value_2 = /*professions*/ ctx[6];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$3(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*GlobalStore, socialMediaButtons, $GlobalStore*/ 24) {
    				each_value_1 = /*$GlobalStore*/ ctx[4].socialMedia;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$4(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if ((!current || dirty & /*$_*/ 32) && t7_value !== (t7_value = /*$_*/ ctx[5]('about_me') + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*questions, goToSection, $_*/ 416) {
    				each_value = /*questions*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul1, null);
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
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			/*ul0_binding*/ ctx[14](null);
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

    function instance$9($$self, $$props, $$invalidate) {
    	let $GlobalStore;
    	let $_;
    	validate_store(GlobalStore, 'GlobalStore');
    	component_subscribe($$self, GlobalStore, $$value => $$invalidate(4, $GlobalStore = $$value));
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(5, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LandingSection', slots, []);
    	const dispatch = createEventDispatcher();
    	let profilePicSrc = 'me-myself-and-i-thumb.jpg';
    	let codingBgSrc = 'code-bg-thumb.png';
    	const professions = ['software_engineer', 'fullstack_webdev', 'ux_ui_designer', 'junior_devop'];
    	const questions = ['projects', 'skills', 'about', 'contact']; // 'worked-with',

    	function goToSection(questID) {
    		dispatch('goToSection', questID);
    	}

    	let showBigProfilePicture = false;

    	const openBigProfilePicture = () => {
    		if (showBigProfilePicture) return;
    		vibrate();
    		GlobalStore.lockScroll('landing_big_profile_pic');
    		$$invalidate(2, showBigProfilePicture = true);
    	};

    	const closeBigProfilePicture = () => {
    		if (!showBigProfilePicture) return;
    		vibrate();
    		$$invalidate(2, showBigProfilePicture = false);
    		GlobalStore.unlockScroll('landing_big_profile_pic');
    	};

    	let profilePicLazyloader = new LazyLoader('me-myself-and-i.jpg');
    	profilePicLazyloader.load();

    	profilePicLazyloader.subscribe(s => {
    		if (s.status === LazyLoadStatus.DONE) {
    			$$invalidate(0, profilePicSrc = 'me-myself-and-i.jpg');
    		}

    		profilePicLazyloader.destroy();
    	});

    	let codingBgLazyloader = new LazyLoader('code-bg.png');
    	codingBgLazyloader.load();

    	codingBgLazyloader.subscribe(s => {
    		if (s.status === LazyLoadStatus.DONE) {
    			$$invalidate(1, codingBgSrc = 'code-bg.png');
    		}

    		codingBgLazyloader.destroy();
    	});

    	const displayDesktop = window.matchMedia('screen and (min-width: 600px)');

    	function bigPicTrans(_, o) {
    		const reducedMotion = $GlobalStore.a11y.reducedMotion;

    		if (displayDesktop.matches) {
    			return {
    				duration: !reducedMotion && 500,
    				css(t) {
    					t = cubicInOut(t);
    					return `opacity: ${t};` + `transform: ` + `scale(${.8 + .2 * t}) ` + `translate(-${10 - 10 * t}em, -${2 - 2 * t}em);`;
    				}
    			};
    		}

    		return {
    			duration: !reducedMotion && 500,
    			css(t) {
    				t = cubicInOut(t);
    				return `opacity: ${t};` + `transform: scale(${.75 + .25 * t}) translateY(-${5 - 5 * t}em);`;
    			}
    		};
    	}

    	function bigPicBgTrans(_, o) {
    		const reducedMotion = $GlobalStore.a11y.reducedMotion;

    		return {
    			duration: !reducedMotion && 400,
    			css: t => `opacity: ${cubicInOut(t)}`
    		};
    	}

    	let socialMediaButtons;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LandingSection> was created with unknown prop '${key}'`);
    	});

    	const click_handler = idx => GlobalStore.openSocialModal(idx, socialMediaButtons);

    	function ul0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			socialMediaButtons = $$value;
    			$$invalidate(3, socialMediaButtons);
    		});
    	}

    	const click_handler_1 = questID => goToSection(questID);

    	$$self.$capture_state = () => ({
    		cubicInOut,
    		GlobalStore,
    		createEventDispatcher,
    		vibrate,
    		vibrateLink,
    		dispatch,
    		_: X,
    		LazyLoader,
    		LazyLoadStatus,
    		profilePicSrc,
    		codingBgSrc,
    		professions,
    		questions,
    		goToSection,
    		showBigProfilePicture,
    		openBigProfilePicture,
    		closeBigProfilePicture,
    		profilePicLazyloader,
    		codingBgLazyloader,
    		displayDesktop,
    		bigPicTrans,
    		bigPicBgTrans,
    		socialMediaButtons,
    		$GlobalStore,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('profilePicSrc' in $$props) $$invalidate(0, profilePicSrc = $$props.profilePicSrc);
    		if ('codingBgSrc' in $$props) $$invalidate(1, codingBgSrc = $$props.codingBgSrc);
    		if ('showBigProfilePicture' in $$props) $$invalidate(2, showBigProfilePicture = $$props.showBigProfilePicture);
    		if ('profilePicLazyloader' in $$props) profilePicLazyloader = $$props.profilePicLazyloader;
    		if ('codingBgLazyloader' in $$props) codingBgLazyloader = $$props.codingBgLazyloader;
    		if ('socialMediaButtons' in $$props) $$invalidate(3, socialMediaButtons = $$props.socialMediaButtons);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		profilePicSrc,
    		codingBgSrc,
    		showBigProfilePicture,
    		socialMediaButtons,
    		$GlobalStore,
    		$_,
    		professions,
    		questions,
    		goToSection,
    		openBigProfilePicture,
    		closeBigProfilePicture,
    		bigPicTrans,
    		bigPicBgTrans,
    		click_handler,
    		ul0_binding,
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

    /* src\sections\AboutMeSection.svelte generated by Svelte v3.44.1 */
    const file$8 = "src\\sections\\AboutMeSection.svelte";

    function create_fragment$8(ctx) {
    	let section;
    	let div0;
    	let h1;
    	let t0_value = /*$_*/ ctx[0]('section.about_me.title') + "";
    	let t0;
    	let t1;
    	let article0;
    	let h20;
    	let t2_value = /*$_*/ ctx[0]('section.about_me.designer.title') + "";
    	let t2;
    	let t3;
    	let p0;
    	let t4_value = /*$_*/ ctx[0]('section.about_me.designer.block_1') + "";
    	let t4;
    	let t5;
    	let p1;
    	let t6_value = /*$_*/ ctx[0]('section.about_me.designer.block_2') + "";
    	let t6;
    	let t7;
    	let article1;
    	let h21;
    	let t8_value = /*$_*/ ctx[0]('section.about_me.gamer.title') + "";
    	let t8;
    	let t9;
    	let p2;
    	let t10_value = /*$_*/ ctx[0]('section.about_me.gamer.block_1') + "";
    	let t10;
    	let t11;
    	let p3;
    	let t12_value = /*$_*/ ctx[0]('section.about_me.gamer.block_2') + "";
    	let t12;
    	let t13;
    	let p4;
    	let t14_value = /*$_*/ ctx[0]('section.about_me.gamer.block_3') + "";
    	let t14;
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
    	let t19_value = /*$_*/ ctx[0]('section.about_me.gamer.game_lis') + "";
    	let t19;
    	let t20;
    	let em0;
    	let t21;
    	let t22_value = /*$_*/ ctx[0]('section.about_me.gamer.game_lis_cta') + "";
    	let t22;
    	let t23;
    	let a2;
    	let t25;
    	let t26;
    	let div4;
    	let a3;
    	let img1;
    	let img1_src_value;
    	let t27;
    	let div3;
    	let h31;
    	let a4;
    	let t29;
    	let p6;
    	let t30_value = /*$_*/ ctx[0]('section.about_me.gamer.game_mc') + "";
    	let t30;
    	let t31;
    	let p7;
    	let q;
    	let t32_value = /*$_*/ ctx[0]('section.about_me.gamer.game_mc_qoute') + "";
    	let t32;
    	let t33;
    	let t34;
    	let em1;
    	let t35;
    	let t36_value = /*$_*/ ctx[0]('section.about_me.gamer.game_lis_cta') + "";
    	let t36;
    	let t37;
    	let a5;
    	let t39;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			article0 = element("article");
    			h20 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			p0 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			p1 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			article1 = element("article");
    			h21 = element("h2");
    			t8 = text(t8_value);
    			t9 = space();
    			p2 = element("p");
    			t10 = text(t10_value);
    			t11 = space();
    			p3 = element("p");
    			t12 = text(t12_value);
    			t13 = space();
    			p4 = element("p");
    			t14 = text(t14_value);
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
    			t19 = text(t19_value);
    			t20 = space();
    			em0 = element("em");
    			t21 = text("(");
    			t22 = text(t22_value);
    			t23 = text(":\r\n\t\t\t\t\t");
    			a2 = element("a");
    			a2.textContent = "YouTube – Life is Strange Gronkh\r\n\t\t\t\t\t";
    			t25 = text(")");
    			t26 = space();
    			div4 = element("div");
    			a3 = element("a");
    			img1 = element("img");
    			t27 = space();
    			div3 = element("div");
    			h31 = element("h3");
    			a4 = element("a");
    			a4.textContent = "Minecraft";
    			t29 = space();
    			p6 = element("p");
    			t30 = text(t30_value);
    			t31 = space();
    			p7 = element("p");
    			q = element("q");
    			t32 = text(t32_value);
    			t33 = text(" – Gronkh.");
    			t34 = space();
    			em1 = element("em");
    			t35 = text("(");
    			t36 = text(t36_value);
    			t37 = text(":\r\n\t\t\t\t\t");
    			a5 = element("a");
    			a5.textContent = "YouTube – Minecraft Gronkh\r\n\t\t\t\t\t";
    			t39 = text(")");
    			attr_dev(h1, "id", "about");
    			attr_dev(h1, "class", "display-3");
    			add_location(h1, file$8, 2, 2, 49);
    			attr_dev(div0, "class", "header svelte-kiv4ak");
    			add_location(div0, file$8, 1, 1, 25);
    			attr_dev(h20, "class", "article-title svelte-kiv4ak");
    			add_location(h20, file$8, 11, 2, 276);
    			attr_dev(p0, "class", "svelte-kiv4ak");
    			add_location(p0, file$8, 12, 2, 350);
    			attr_dev(p1, "class", "svelte-kiv4ak");
    			add_location(p1, file$8, 13, 2, 402);
    			attr_dev(article0, "class", "designe svelte-kiv4ak");
    			add_location(article0, file$8, 10, 1, 247);
    			attr_dev(h21, "class", "article-title svelte-kiv4ak");
    			add_location(h21, file$8, 17, 2, 495);
    			attr_dev(p2, "class", "svelte-kiv4ak");
    			add_location(p2, file$8, 18, 2, 566);
    			attr_dev(p3, "class", "svelte-kiv4ak");
    			add_location(p3, file$8, 19, 2, 615);
    			attr_dev(p4, "class", "svelte-kiv4ak");
    			add_location(p4, file$8, 20, 2, 664);
    			if (!src_url_equal(img0.src, img0_src_value = "life_is_strange.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Life is Strange danielsharkov.com");
    			attr_dev(img0, "class", "svelte-kiv4ak");
    			add_location(img0, file$8, 23, 4, 897);
    			attr_dev(a0, "class", "image-container tilt-left svelte-kiv4ak");
    			attr_dev(a0, "href", "https://lifeisstrange.square-enix-games.com/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$8, 22, 3, 770);
    			attr_dev(a1, "class", "link svelte-kiv4ak");
    			attr_dev(a1, "href", "https://lifeisstrange.square-enix-games.com/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$8, 26, 8, 1013);
    			attr_dev(h30, "class", "svelte-kiv4ak");
    			add_location(h30, file$8, 26, 4, 1009);
    			attr_dev(p5, "class", "svelte-kiv4ak");
    			add_location(p5, file$8, 29, 4, 1140);
    			attr_dev(a2, "class", "link svelte-kiv4ak");
    			attr_dev(a2, "href", "https://www.youtube.com/results?search_query=gronkh+life+is+strange");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$8, 32, 5, 1255);
    			add_location(em0, file$8, 30, 4, 1192);
    			attr_dev(div1, "class", "content svelte-kiv4ak");
    			add_location(div1, file$8, 25, 3, 982);
    			attr_dev(div2, "class", "game-container grid grid-center grid-1 svelte-kiv4ak");
    			add_location(div2, file$8, 21, 2, 713);
    			if (!src_url_equal(img1.src, img1_src_value = "minecraft.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Minecraft danielsharkov.com");
    			attr_dev(img1, "class", "svelte-kiv4ak");
    			add_location(img1, file$8, 40, 4, 1617);
    			attr_dev(a3, "class", "image-container tilt-right svelte-kiv4ak");
    			attr_dev(a3, "href", "https://www.minecraft.net/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$8, 39, 3, 1507);
    			attr_dev(a4, "class", "link svelte-kiv4ak");
    			attr_dev(a4, "href", "https://www.minecraft.net/");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$8, 43, 8, 1721);
    			attr_dev(h31, "class", "svelte-kiv4ak");
    			add_location(h31, file$8, 43, 4, 1717);
    			attr_dev(p6, "class", "svelte-kiv4ak");
    			add_location(p6, file$8, 46, 4, 1824);
    			add_location(q, file$8, 47, 7, 1878);
    			attr_dev(p7, "class", "svelte-kiv4ak");
    			add_location(p7, file$8, 47, 4, 1875);
    			attr_dev(a5, "class", "link svelte-kiv4ak");
    			attr_dev(a5, "href", "https://www.youtube.com/results?search_query=gronkh+minecraft");
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$8, 50, 5, 2012);
    			add_location(em1, file$8, 48, 4, 1949);
    			attr_dev(div3, "class", "content svelte-kiv4ak");
    			add_location(div3, file$8, 42, 3, 1690);
    			attr_dev(div4, "class", "game-container grid grid-center grid-1 svelte-kiv4ak");
    			add_location(div4, file$8, 38, 2, 1450);
    			attr_dev(article1, "class", "gamer svelte-kiv4ak");
    			add_location(article1, file$8, 16, 1, 468);
    			attr_dev(section, "class", "grid svelte-kiv4ak");
    			add_location(section, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(section, t1);
    			append_dev(section, article0);
    			append_dev(article0, h20);
    			append_dev(h20, t2);
    			append_dev(article0, t3);
    			append_dev(article0, p0);
    			append_dev(p0, t4);
    			append_dev(article0, t5);
    			append_dev(article0, p1);
    			append_dev(p1, t6);
    			append_dev(section, t7);
    			append_dev(section, article1);
    			append_dev(article1, h21);
    			append_dev(h21, t8);
    			append_dev(article1, t9);
    			append_dev(article1, p2);
    			append_dev(p2, t10);
    			append_dev(article1, t11);
    			append_dev(article1, p3);
    			append_dev(p3, t12);
    			append_dev(article1, t13);
    			append_dev(article1, p4);
    			append_dev(p4, t14);
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
    			append_dev(div1, t20);
    			append_dev(div1, em0);
    			append_dev(em0, t21);
    			append_dev(em0, t22);
    			append_dev(em0, t23);
    			append_dev(em0, a2);
    			append_dev(em0, t25);
    			append_dev(article1, t26);
    			append_dev(article1, div4);
    			append_dev(div4, a3);
    			append_dev(a3, img1);
    			append_dev(div4, t27);
    			append_dev(div4, div3);
    			append_dev(div3, h31);
    			append_dev(h31, a4);
    			append_dev(div3, t29);
    			append_dev(div3, p6);
    			append_dev(p6, t30);
    			append_dev(div3, t31);
    			append_dev(div3, p7);
    			append_dev(p7, q);
    			append_dev(q, t32);
    			append_dev(p7, t33);
    			append_dev(div3, t34);
    			append_dev(div3, em1);
    			append_dev(em1, t35);
    			append_dev(em1, t36);
    			append_dev(em1, t37);
    			append_dev(em1, a5);
    			append_dev(em1, t39);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(vibrateLink.call(null, a0)),
    					action_destroyer(vibrateLink.call(null, a3))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$_*/ 1 && t0_value !== (t0_value = /*$_*/ ctx[0]('section.about_me.title') + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$_*/ 1 && t2_value !== (t2_value = /*$_*/ ctx[0]('section.about_me.designer.title') + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$_*/ 1 && t4_value !== (t4_value = /*$_*/ ctx[0]('section.about_me.designer.block_1') + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*$_*/ 1 && t6_value !== (t6_value = /*$_*/ ctx[0]('section.about_me.designer.block_2') + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*$_*/ 1 && t8_value !== (t8_value = /*$_*/ ctx[0]('section.about_me.gamer.title') + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*$_*/ 1 && t10_value !== (t10_value = /*$_*/ ctx[0]('section.about_me.gamer.block_1') + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*$_*/ 1 && t12_value !== (t12_value = /*$_*/ ctx[0]('section.about_me.gamer.block_2') + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*$_*/ 1 && t14_value !== (t14_value = /*$_*/ ctx[0]('section.about_me.gamer.block_3') + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*$_*/ 1 && t19_value !== (t19_value = /*$_*/ ctx[0]('section.about_me.gamer.game_lis') + "")) set_data_dev(t19, t19_value);
    			if (dirty & /*$_*/ 1 && t22_value !== (t22_value = /*$_*/ ctx[0]('section.about_me.gamer.game_lis_cta') + "")) set_data_dev(t22, t22_value);
    			if (dirty & /*$_*/ 1 && t30_value !== (t30_value = /*$_*/ ctx[0]('section.about_me.gamer.game_mc') + "")) set_data_dev(t30, t30_value);
    			if (dirty & /*$_*/ 1 && t32_value !== (t32_value = /*$_*/ ctx[0]('section.about_me.gamer.game_mc_qoute') + "")) set_data_dev(t32, t32_value);
    			if (dirty & /*$_*/ 1 && t36_value !== (t36_value = /*$_*/ ctx[0]('section.about_me.gamer.game_lis_cta') + "")) set_data_dev(t36, t36_value);
    		},
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
    	let $_;
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(0, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AboutMeSection', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AboutMeSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ _: X, vibrateLink, $_ });
    	return [$_];
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

    const thisBaseURL = (window.location.protocol + '//' + window.location.host + window.location.pathname);
    function queryObjToString(queryObj) {
        let str = '';
        let itr = 0;
        for (const key of Object.keys(queryObj)) {
            str += key + '=' + queryObj[key];
            if (itr + 1 < Object.keys(queryObj).length) {
                str += '&';
            }
            itr++;
        }
        return str;
    }
    function removeQuery(queryName) {
        var _a, _b;
        const query = {};
        if ((_a = window.location) === null || _a === void 0 ? void 0 : _a.search) {
            for (const qrs of window.location.search
                .substring(1, window.location.search.length)
                .split('&')) {
                let [key, val] = qrs.split('=');
                if (key != queryName)
                    query[key] = val;
            }
        }
        if ((_b = window.history) === null || _b === void 0 ? void 0 : _b.pushState) {
            window.history.pushState(null, '', (thisBaseURL + '?' + queryObjToString(query) + window.location.hash));
        }
    }
    function getFullQuery() {
        var _a;
        const query = {};
        if ((_a = window.location) === null || _a === void 0 ? void 0 : _a.search) {
            for (const qrs of window.location.search
                .substring(1, window.location.search.length)
                .split('&')) {
                let [key, val] = qrs.split('=');
                query[key] = val;
            }
        }
        return query;
    }
    function getQuery(queryName) {
        var _a;
        if ((_a = window.location) === null || _a === void 0 ? void 0 : _a.search) {
            for (const qrs of window.location.search
                .substring(1, window.location.search.length)
                .split('&')) {
                let [key, val] = qrs.split('=');
                if (key == queryName)
                    return val;
            }
        }
        return undefined;
    }
    function setQuery(queryName, value, state, title, replaceState) {
        var _a, _b;
        const queryObj = getFullQuery();
        queryObj[queryName] = value;
        if (replaceState && ((_a = window.history) === null || _a === void 0 ? void 0 : _a.replaceState)) {
            window.history.replaceState(state, title, thisBaseURL + '?' + queryObjToString(queryObj) + window.location.hash);
        }
        else if ((_b = window.history) === null || _b === void 0 ? void 0 : _b.pushState) {
            window.history.pushState(state, title, thisBaseURL + '?' + queryObjToString(queryObj) + window.location.hash);
        }
    }

    var __i18n_store;
    var Locale;
    (function (Locale) {
        Locale["DE"] = "de";
        Locale["EN"] = "en";
    })(Locale || (Locale = {}));
    const localeMap = {
        'en': Locale.EN,
        'en-us': Locale.EN,
        'en-gb': Locale.EN,
        'de': Locale.DE,
        'de-de': Locale.DE,
        // 'ru': 'ru',
    };
    const LocaleList = [Locale.EN, Locale.DE];
    const LocaleFullName = {
        en: 'English',
        de: 'Deutsch',
        // ru: 'Русский',
    };
    LocaleList[0];
    const LOC_STORE_ID = 'DaSh_x097_locale';
    class _i18n {
        constructor() {
            __i18n_store.set(this, writable());
            this.subscribe = __classPrivateFieldGet(this, __i18n_store, "f").subscribe;
            for (const l of Object.keys(localeMap)) {
                y(l, async () => {
                    const resp = await fetch(`lang/${localeMap[l]}.json`);
                    return await resp.json();
                });
            }
            let locStore = this._readLocalStore();
            if (locStore === null) {
                locStore = getQuery('lang');
            }
            $({ fallbackLocale: 'en' });
            const navLocale = (locStore ||
                localeMap[I().toLowerCase()] ||
                I().toLowerCase());
            this.switch(navLocale);
        }
        _syncLocalStore(state) {
            if (localStorage) {
                localStorage.setItem(LOC_STORE_ID, state);
            }
        }
        _readLocalStore() {
            if (localStorage) {
                return localStorage.getItem(LOC_STORE_ID);
            }
            return null;
        }
        switch(l) {
            var _a, _b, _c;
            if (!LocaleList.includes(l) && localeMap[l]) {
                l = localeMap[l];
            }
            __classPrivateFieldGet(this, __i18n_store, "f").set(l);
            M.set(l);
            document.documentElement.setAttribute('lang', l);
            if (!localStorage && LocaleList.includes(l)) {
                setQuery('lang', l, (_a = window.history) === null || _a === void 0 ? void 0 : _a.state, (_c = (_b = window.history) === null || _b === void 0 ? void 0 : _b.state) === null || _c === void 0 ? void 0 : _c.title, true);
            }
            else {
                removeQuery('lang');
            }
            this._syncLocalStore(l);
        }
    }
    __i18n_store = new WeakMap();
    const i18n = new _i18n;
    const isInvalidLocale = derived(i18n, (s) => !LocaleList.includes(s));

    const careerBegin = 2012;
    var TechnologyType;
    (function (TechnologyType) {
        TechnologyType["Software"] = "software";
        TechnologyType["Language"] = "language";
        TechnologyType["Framework"] = "framework";
        TechnologyType["Library"] = "library";
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
    };
    const projects = [
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
            projectUrl: 'COMING_SOON',
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
            darkTheme: false,
            projectUrl: 'COMING_SOON',
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
            darkTheme: false,
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
            cover: false,
            darkTheme: false,
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
            projectUrl: null,
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
            projectUrl: 'COMING_SOON',
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
            darkTheme: false,
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
            darkTheme: false,
            projectUrl: 'https://youtu.be/uWZoT4Nvd3I',
            usedTechnologies: ['PowerDirector15', 'GIMP', 'OBS'],
            about: true,
            gradient: ['#a7a5a4', '#695747'],
            locale: [Locale.DE, Locale.EN],
        },
        {
            id: 'black_russian_training_video',
            cover: true,
            darkTheme: false,
            projectUrl: 'https://www.youtube.com/watch?v=ix7fj1-SOps',
            usedTechnologies: ['PowerDirector15', 'GIMP', 'OBS'],
            about: true,
            locale: [Locale.DE, Locale.EN],
        },
    ];
    const projectsIndexByID = {};
    for (const p in projects)
        projectsIndexByID[projects[p].id] = Number(p);

    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2021, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */

    /**
     * DO NOT EDIT THIS FILE
     * The code in this file is generated from files in ./src/
     */

    function getDefaults() {
      return {
        baseUrl: null,
        breaks: false,
        extensions: null,
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

    let defaults = getDefaults();

    function changeDefaults(newDefaults) {
      defaults = newDefaults;
    }

    /**
     * Helpers
     */
    const escapeTest = /[&<>"']/;
    const escapeReplace = /[&<>"']/g;
    const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
    const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
    const escapeReplacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    const getEscapeReplacement = (ch) => escapeReplacements[ch];
    function escape(html, encode) {
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

    const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

    function unescape(html) {
      // explicitly match decimal, hex, and named HTML entities
      return html.replace(unescapeTest, (_, n) => {
        n = n.toLowerCase();
        if (n === 'colon') return ':';
        if (n.charAt(0) === '#') {
          return n.charAt(1) === 'x'
            ? String.fromCharCode(parseInt(n.substring(2), 16))
            : String.fromCharCode(+n.substring(1));
        }
        return '';
      });
    }

    const caret = /(^|[^\[])\^/g;
    function edit(regex, opt) {
      regex = regex.source || regex;
      opt = opt || '';
      const obj = {
        replace: (name, val) => {
          val = val.source || val;
          val = val.replace(caret, '$1');
          regex = regex.replace(name, val);
          return obj;
        },
        getRegex: () => {
          return new RegExp(regex, opt);
        }
      };
      return obj;
    }

    const nonWordAndColonTest = /[^\w:]/g;
    const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
    function cleanUrl(sanitize, base, href) {
      if (sanitize) {
        let prot;
        try {
          prot = decodeURIComponent(unescape(href))
            .replace(nonWordAndColonTest, '')
            .toLowerCase();
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

    const baseUrls = {};
    const justDomain = /^[^:]+:\/*[^/]*$/;
    const protocol = /^([^:]+:)[\s\S]*$/;
    const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

    function resolveUrl(base, href) {
      if (!baseUrls[' ' + base]) {
        // we can ignore everything in base after the last slash of its path component,
        // but we might need to add _that_
        // https://tools.ietf.org/html/rfc3986#section-3
        if (justDomain.test(base)) {
          baseUrls[' ' + base] = base + '/';
        } else {
          baseUrls[' ' + base] = rtrim(base, '/', true);
        }
      }
      base = baseUrls[' ' + base];
      const relativeBase = base.indexOf(':') === -1;

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

    const noopTest = { exec: function noopTest() {} };

    function merge(obj) {
      let i = 1,
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

    function splitCells(tableRow, count) {
      // ensure that every cell-delimiting pipe has a space
      // before it to distinguish it from an escaped pipe
      const row = tableRow.replace(/\|/g, (match, offset, str) => {
          let escaped = false,
            curr = offset;
          while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
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
      let i = 0;

      // First/last cell in a row cannot be empty if it has no leading/trailing pipe
      if (!cells[0].trim()) { cells.shift(); }
      if (!cells[cells.length - 1].trim()) { cells.pop(); }

      if (cells.length > count) {
        cells.splice(count);
      } else {
        while (cells.length < count) cells.push('');
      }

      for (; i < cells.length; i++) {
        // leading or trailing whitespace is ignored per the gfm spec
        cells[i] = cells[i].trim().replace(/\\\|/g, '|');
      }
      return cells;
    }

    // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
    // /c*$/ is vulnerable to REDOS.
    // invert: Remove suffix of non-c chars instead. Default falsey.
    function rtrim(str, c, invert) {
      const l = str.length;
      if (l === 0) {
        return '';
      }

      // Length of suffix matching the invert condition.
      let suffLen = 0;

      // Step left until we fail to match the invert condition.
      while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
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

    function findClosingBracket(str, b) {
      if (str.indexOf(b[1]) === -1) {
        return -1;
      }
      const l = str.length;
      let level = 0,
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

    function checkSanitizeDeprecation(opt) {
      if (opt && opt.sanitize && !opt.silent) {
        console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
      }
    }

    // copied from https://stackoverflow.com/a/5450113/806777
    function repeatString(pattern, count) {
      if (count < 1) {
        return '';
      }
      let result = '';
      while (count > 1) {
        if (count & 1) {
          result += pattern;
        }
        count >>= 1;
        pattern += pattern;
      }
      return result + pattern;
    }

    function outputLink(cap, link, raw, lexer) {
      const href = link.href;
      const title = link.title ? escape(link.title) : null;
      const text = cap[1].replace(/\\([\[\]])/g, '$1');

      if (cap[0].charAt(0) !== '!') {
        lexer.state.inLink = true;
        const token = {
          type: 'link',
          raw,
          href,
          title,
          text,
          tokens: lexer.inlineTokens(text, [])
        };
        lexer.state.inLink = false;
        return token;
      } else {
        return {
          type: 'image',
          raw,
          href,
          title,
          text: escape(text)
        };
      }
    }

    function indentCodeCompensation(raw, text) {
      const matchIndentToCode = raw.match(/^(\s+)(?:```)/);

      if (matchIndentToCode === null) {
        return text;
      }

      const indentToCode = matchIndentToCode[1];

      return text
        .split('\n')
        .map(node => {
          const matchIndentInNode = node.match(/^\s+/);
          if (matchIndentInNode === null) {
            return node;
          }

          const [indentInNode] = matchIndentInNode;

          if (indentInNode.length >= indentToCode.length) {
            return node.slice(indentToCode.length);
          }

          return node;
        })
        .join('\n');
    }

    /**
     * Tokenizer
     */
    class Tokenizer {
      constructor(options) {
        this.options = options || defaults;
      }

      space(src) {
        const cap = this.rules.block.newline.exec(src);
        if (cap) {
          if (cap[0].length > 1) {
            return {
              type: 'space',
              raw: cap[0]
            };
          }
          return { raw: '\n' };
        }
      }

      code(src) {
        const cap = this.rules.block.code.exec(src);
        if (cap) {
          const text = cap[0].replace(/^ {1,4}/gm, '');
          return {
            type: 'code',
            raw: cap[0],
            codeBlockStyle: 'indented',
            text: !this.options.pedantic
              ? rtrim(text, '\n')
              : text
          };
        }
      }

      fences(src) {
        const cap = this.rules.block.fences.exec(src);
        if (cap) {
          const raw = cap[0];
          const text = indentCodeCompensation(raw, cap[3] || '');

          return {
            type: 'code',
            raw,
            lang: cap[2] ? cap[2].trim() : cap[2],
            text
          };
        }
      }

      heading(src) {
        const cap = this.rules.block.heading.exec(src);
        if (cap) {
          let text = cap[2].trim();

          // remove trailing #s
          if (/#$/.test(text)) {
            const trimmed = rtrim(text, '#');
            if (this.options.pedantic) {
              text = trimmed.trim();
            } else if (!trimmed || / $/.test(trimmed)) {
              // CommonMark requires space before trailing #s
              text = trimmed.trim();
            }
          }

          const token = {
            type: 'heading',
            raw: cap[0],
            depth: cap[1].length,
            text: text,
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      hr(src) {
        const cap = this.rules.block.hr.exec(src);
        if (cap) {
          return {
            type: 'hr',
            raw: cap[0]
          };
        }
      }

      blockquote(src) {
        const cap = this.rules.block.blockquote.exec(src);
        if (cap) {
          const text = cap[0].replace(/^ *> ?/gm, '');

          return {
            type: 'blockquote',
            raw: cap[0],
            tokens: this.lexer.blockTokens(text, []),
            text
          };
        }
      }

      list(src) {
        let cap = this.rules.block.list.exec(src);
        if (cap) {
          let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine,
            line, lines, itemContents;

          let bull = cap[1].trim();
          const isordered = bull.length > 1;

          const list = {
            type: 'list',
            raw: '',
            ordered: isordered,
            start: isordered ? +bull.slice(0, -1) : '',
            loose: false,
            items: []
          };

          bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;

          if (this.options.pedantic) {
            bull = isordered ? bull : '[*+-]';
          }

          // Get next list item
          const itemRegex = new RegExp(`^( {0,3}${bull})((?: [^\\n]*| *)(?:\\n[^\\n]*)*(?:\\n|$))`);

          // Get each top-level item
          while (src) {
            if (this.rules.block.hr.test(src)) { // End list if we encounter an HR (possibly move into itemRegex?)
              break;
            }

            if (!(cap = itemRegex.exec(src))) {
              break;
            }

            lines = cap[2].split('\n');

            if (this.options.pedantic) {
              indent = 2;
              itemContents = lines[0].trimLeft();
            } else {
              indent = cap[2].search(/[^ ]/); // Find first non-space char
              indent = cap[1].length + (indent > 4 ? 1 : indent); // intented code blocks after 4 spaces; indent is always 1
              itemContents = lines[0].slice(indent - cap[1].length);
            }

            blankLine = false;
            raw = cap[0];

            if (!lines[0] && /^ *$/.test(lines[1])) { // items begin with at most one blank line
              raw = cap[1] + lines.slice(0, 2).join('\n') + '\n';
              list.loose = true;
              lines = [];
            }

            const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])`);

            for (i = 1; i < lines.length; i++) {
              line = lines[i];

              if (this.options.pedantic) { // Re-align to follow commonmark nesting rules
                line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
              }

              // End list item if found start of new bullet
              if (nextBulletRegex.test(line)) {
                raw = cap[1] + lines.slice(0, i).join('\n') + '\n';
                break;
              }

              // Until we encounter a blank line, item contents do not need indentation
              if (!blankLine) {
                if (!line.trim()) { // Check if current line is empty
                  blankLine = true;
                }

                // Dedent if possible
                if (line.search(/[^ ]/) >= indent) {
                  itemContents += '\n' + line.slice(indent);
                } else {
                  itemContents += '\n' + line;
                }
                continue;
              }

              // Dedent this line
              if (line.search(/[^ ]/) >= indent || !line.trim()) {
                itemContents += '\n' + line.slice(indent);
                continue;
              } else { // Line was not properly indented; end of this item
                raw = cap[1] + lines.slice(0, i).join('\n') + '\n';
                break;
              }
            }

            if (!list.loose) {
              // If the previous item ended with a blank line, the list is loose
              if (endsWithBlankLine) {
                list.loose = true;
              } else if (/\n *\n *$/.test(raw)) {
                endsWithBlankLine = true;
              }
            }

            // Check for task list items
            if (this.options.gfm) {
              istask = /^\[[ xX]\] /.exec(itemContents);
              if (istask) {
                ischecked = istask[0] !== '[ ] ';
                itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
              }
            }

            list.items.push({
              type: 'list_item',
              raw: raw,
              task: !!istask,
              checked: ischecked,
              loose: false,
              text: itemContents
            });

            list.raw += raw;
            src = src.slice(raw.length);
          }

          // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
          list.items[list.items.length - 1].raw = raw.trimRight();
          list.items[list.items.length - 1].text = itemContents.trimRight();
          list.raw = list.raw.trimRight();

          const l = list.items.length;

          // Item child tokens handled here at end because we needed to have the final item to trim it first
          for (i = 0; i < l; i++) {
            this.lexer.state.top = false;
            list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
            if (list.items[i].tokens.some(t => t.type === 'space')) {
              list.loose = true;
              list.items[i].loose = true;
            }
          }

          return list;
        }
      }

      html(src) {
        const cap = this.rules.block.html.exec(src);
        if (cap) {
          const token = {
            type: 'html',
            raw: cap[0],
            pre: !this.options.sanitizer
              && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
            text: cap[0]
          };
          if (this.options.sanitize) {
            token.type = 'paragraph';
            token.text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]);
            token.tokens = [];
            this.lexer.inline(token.text, token.tokens);
          }
          return token;
        }
      }

      def(src) {
        const cap = this.rules.block.def.exec(src);
        if (cap) {
          if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
          const tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
          return {
            type: 'def',
            tag,
            raw: cap[0],
            href: cap[2],
            title: cap[3]
          };
        }
      }

      table(src) {
        const cap = this.rules.block.table.exec(src);
        if (cap) {
          const item = {
            type: 'table',
            header: splitCells(cap[1]).map(c => { return { text: c }; }),
            align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
            rows: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
          };

          if (item.header.length === item.align.length) {
            item.raw = cap[0];

            let l = item.align.length;
            let i, j, k, row;
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

            l = item.rows.length;
            for (i = 0; i < l; i++) {
              item.rows[i] = splitCells(item.rows[i], item.header.length).map(c => { return { text: c }; });
            }

            // parse child tokens inside headers and cells

            // header child tokens
            l = item.header.length;
            for (j = 0; j < l; j++) {
              item.header[j].tokens = [];
              this.lexer.inlineTokens(item.header[j].text, item.header[j].tokens);
            }

            // cell child tokens
            l = item.rows.length;
            for (j = 0; j < l; j++) {
              row = item.rows[j];
              for (k = 0; k < row.length; k++) {
                row[k].tokens = [];
                this.lexer.inlineTokens(row[k].text, row[k].tokens);
              }
            }

            return item;
          }
        }
      }

      lheading(src) {
        const cap = this.rules.block.lheading.exec(src);
        if (cap) {
          const token = {
            type: 'heading',
            raw: cap[0],
            depth: cap[2].charAt(0) === '=' ? 1 : 2,
            text: cap[1],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      paragraph(src) {
        const cap = this.rules.block.paragraph.exec(src);
        if (cap) {
          const token = {
            type: 'paragraph',
            raw: cap[0],
            text: cap[1].charAt(cap[1].length - 1) === '\n'
              ? cap[1].slice(0, -1)
              : cap[1],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      text(src) {
        const cap = this.rules.block.text.exec(src);
        if (cap) {
          const token = {
            type: 'text',
            raw: cap[0],
            text: cap[0],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      escape(src) {
        const cap = this.rules.inline.escape.exec(src);
        if (cap) {
          return {
            type: 'escape',
            raw: cap[0],
            text: escape(cap[1])
          };
        }
      }

      tag(src) {
        const cap = this.rules.inline.tag.exec(src);
        if (cap) {
          if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
            this.lexer.state.inLink = true;
          } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
            this.lexer.state.inLink = false;
          }
          if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            this.lexer.state.inRawBlock = true;
          } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            this.lexer.state.inRawBlock = false;
          }

          return {
            type: this.options.sanitize
              ? 'text'
              : 'html',
            raw: cap[0],
            inLink: this.lexer.state.inLink,
            inRawBlock: this.lexer.state.inRawBlock,
            text: this.options.sanitize
              ? (this.options.sanitizer
                ? this.options.sanitizer(cap[0])
                : escape(cap[0]))
              : cap[0]
          };
        }
      }

      link(src) {
        const cap = this.rules.inline.link.exec(src);
        if (cap) {
          const trimmedUrl = cap[2].trim();
          if (!this.options.pedantic && /^</.test(trimmedUrl)) {
            // commonmark requires matching angle brackets
            if (!(/>$/.test(trimmedUrl))) {
              return;
            }

            // ending angle bracket cannot be escaped
            const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');
            if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
              return;
            }
          } else {
            // find closing parenthesis
            const lastParenIndex = findClosingBracket(cap[2], '()');
            if (lastParenIndex > -1) {
              const start = cap[0].indexOf('!') === 0 ? 5 : 4;
              const linkLen = start + cap[1].length + lastParenIndex;
              cap[2] = cap[2].substring(0, lastParenIndex);
              cap[0] = cap[0].substring(0, linkLen).trim();
              cap[3] = '';
            }
          }
          let href = cap[2];
          let title = '';
          if (this.options.pedantic) {
            // split pedantic href and title
            const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

            if (link) {
              href = link[1];
              title = link[3];
            }
          } else {
            title = cap[3] ? cap[3].slice(1, -1) : '';
          }

          href = href.trim();
          if (/^</.test(href)) {
            if (this.options.pedantic && !(/>$/.test(trimmedUrl))) {
              // pedantic allows starting angle bracket without ending angle bracket
              href = href.slice(1);
            } else {
              href = href.slice(1, -1);
            }
          }
          return outputLink(cap, {
            href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
            title: title ? title.replace(this.rules.inline._escapes, '$1') : title
          }, cap[0], this.lexer);
        }
      }

      reflink(src, links) {
        let cap;
        if ((cap = this.rules.inline.reflink.exec(src))
            || (cap = this.rules.inline.nolink.exec(src))) {
          let link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
          link = links[link.toLowerCase()];
          if (!link || !link.href) {
            const text = cap[0].charAt(0);
            return {
              type: 'text',
              raw: text,
              text
            };
          }
          return outputLink(cap, link, cap[0], this.lexer);
        }
      }

      emStrong(src, maskedSrc, prevChar = '') {
        let match = this.rules.inline.emStrong.lDelim.exec(src);
        if (!match) return;

        // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well
        if (match[3] && prevChar.match(/[\p{L}\p{N}]/u)) return;

        const nextChar = match[1] || match[2] || '';

        if (!nextChar || (nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
          const lLength = match[0].length - 1;
          let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;

          const endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
          endReg.lastIndex = 0;

          // Clip maskedSrc to same section of string as src (move to lexer?)
          maskedSrc = maskedSrc.slice(-1 * src.length + lLength);

          while ((match = endReg.exec(maskedSrc)) != null) {
            rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];

            if (!rDelim) continue; // skip single * in __abc*abc__

            rLength = rDelim.length;

            if (match[3] || match[4]) { // found another Left Delim
              delimTotal += rLength;
              continue;
            } else if (match[5] || match[6]) { // either Left or Right Delim
              if (lLength % 3 && !((lLength + rLength) % 3)) {
                midDelimTotal += rLength;
                continue; // CommonMark Emphasis Rules 9-10
              }
            }

            delimTotal -= rLength;

            if (delimTotal > 0) continue; // Haven't found enough closing delimiters

            // Remove extra characters. *a*** -> *a*
            rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);

            // Create `em` if smallest delimiter has odd char count. *a***
            if (Math.min(lLength, rLength) % 2) {
              const text = src.slice(1, lLength + match.index + rLength);
              return {
                type: 'em',
                raw: src.slice(0, lLength + match.index + rLength + 1),
                text,
                tokens: this.lexer.inlineTokens(text, [])
              };
            }

            // Create 'strong' if smallest delimiter has even char count. **a***
            const text = src.slice(2, lLength + match.index + rLength - 1);
            return {
              type: 'strong',
              raw: src.slice(0, lLength + match.index + rLength + 1),
              text,
              tokens: this.lexer.inlineTokens(text, [])
            };
          }
        }
      }

      codespan(src) {
        const cap = this.rules.inline.code.exec(src);
        if (cap) {
          let text = cap[2].replace(/\n/g, ' ');
          const hasNonSpaceChars = /[^ ]/.test(text);
          const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
          if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
            text = text.substring(1, text.length - 1);
          }
          text = escape(text, true);
          return {
            type: 'codespan',
            raw: cap[0],
            text
          };
        }
      }

      br(src) {
        const cap = this.rules.inline.br.exec(src);
        if (cap) {
          return {
            type: 'br',
            raw: cap[0]
          };
        }
      }

      del(src) {
        const cap = this.rules.inline.del.exec(src);
        if (cap) {
          return {
            type: 'del',
            raw: cap[0],
            text: cap[2],
            tokens: this.lexer.inlineTokens(cap[2], [])
          };
        }
      }

      autolink(src, mangle) {
        const cap = this.rules.inline.autolink.exec(src);
        if (cap) {
          let text, href;
          if (cap[2] === '@') {
            text = escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
            href = 'mailto:' + text;
          } else {
            text = escape(cap[1]);
            href = text;
          }

          return {
            type: 'link',
            raw: cap[0],
            text,
            href,
            tokens: [
              {
                type: 'text',
                raw: text,
                text
              }
            ]
          };
        }
      }

      url(src, mangle) {
        let cap;
        if (cap = this.rules.inline.url.exec(src)) {
          let text, href;
          if (cap[2] === '@') {
            text = escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
            href = 'mailto:' + text;
          } else {
            // do extended autolink path validation
            let prevCapZero;
            do {
              prevCapZero = cap[0];
              cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
            } while (prevCapZero !== cap[0]);
            text = escape(cap[0]);
            if (cap[1] === 'www.') {
              href = 'http://' + text;
            } else {
              href = text;
            }
          }
          return {
            type: 'link',
            raw: cap[0],
            text,
            href,
            tokens: [
              {
                type: 'text',
                raw: text,
                text
              }
            ]
          };
        }
      }

      inlineText(src, smartypants) {
        const cap = this.rules.inline.text.exec(src);
        if (cap) {
          let text;
          if (this.lexer.state.inRawBlock) {
            text = this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0];
          } else {
            text = escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
          }
          return {
            type: 'text',
            raw: cap[0],
            text
          };
        }
      }
    }

    /**
     * Block-Level Grammar
     */
    const block = {
      newline: /^(?: *(?:\n|$))+/,
      code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
      fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3}bull)( [^\n]+?)?(?:\n|$)/,
      html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
        + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (6)
        + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) open tag
        + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) closing tag
        + ')',
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      table: noopTest,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
      // regex template, placeholders will be replaced according to different paragraph
      // interruption rules of commonmark and the original markdown spec:
      _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html| +\n)[^\n]+)*)/,
      text: /^[^\n]+/
    };

    block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
    block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
    block.def = edit(block.def)
      .replace('label', block._label)
      .replace('title', block._title)
      .getRegex();

    block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
    block.listItemStart = edit(/^( *)(bull) */)
      .replace('bull', block.bullet)
      .getRegex();

    block.list = edit(block.list)
      .replace(/bull/g, block.bullet)
      .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
      .replace('def', '\\n+(?=' + block.def.source + ')')
      .getRegex();

    block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
      + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
      + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
      + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
      + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
      + '|track|ul';
    block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
    block.html = edit(block.html, 'i')
      .replace('comment', block._comment)
      .replace('tag', block._tag)
      .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
      .getRegex();

    block.paragraph = edit(block._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();

    block.blockquote = edit(block.blockquote)
      .replace('paragraph', block.paragraph)
      .getRegex();

    /**
     * Normal Block Grammar
     */

    block.normal = merge({}, block);

    /**
     * GFM Block Grammar
     */

    block.gfm = merge({}, block.normal, {
      table: '^ *([^\\n ].*\\|.*)\\n' // Header
        + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?' // Align
        + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells
    });

    block.gfm.table = edit(block.gfm.table)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('blockquote', ' {0,3}>')
      .replace('code', ' {4}[^\\n]')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();

    /**
     * Pedantic grammar (original John Gruber's loose markdown specification)
     */

    block.pedantic = merge({}, block.normal, {
      html: edit(
        '^ *(?:comment *(?:\\n|\\s*$)'
        + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
        .replace('comment', block._comment)
        .replace(/tag/g, '(?!(?:'
          + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
          + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
          + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
        .getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^(#{1,6})(.*)(?:\n+|$)/,
      fences: noopTest, // fences not supported
      paragraph: edit(block.normal._paragraph)
        .replace('hr', block.hr)
        .replace('heading', ' *#{1,6} *[^\n]')
        .replace('lheading', block.lheading)
        .replace('blockquote', ' {0,3}>')
        .replace('|fences', '')
        .replace('|list', '')
        .replace('|html', '')
        .getRegex()
    });

    /**
     * Inline-Level Grammar
     */
    const inline = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      url: noopTest,
      tag: '^comment'
        + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
      link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      reflinkSearch: 'reflink|nolink(?!\\()',
      emStrong: {
        lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
        //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
        //        () Skip orphan delim inside strong    (1) #***                (2) a***#, a***                   (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
        rDelimAst: /^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
        rDelimUnd: /^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _
      },
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      del: noopTest,
      text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
      punctuation: /^([\spunctuation])/
    };

    // list of punctuation marks from CommonMark spec
    // without * and _ to handle the different emphasis markers * and _
    inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
    inline.punctuation = edit(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex();

    // sequences em should skip over [title](link), `code`, <html>
    inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
    inline.escapedEmSt = /\\\*|\\_/g;

    inline._comment = edit(block._comment).replace('(?:-->|$)', '-->').getRegex();

    inline.emStrong.lDelim = edit(inline.emStrong.lDelim)
      .replace(/punct/g, inline._punctuation)
      .getRegex();

    inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, 'g')
      .replace(/punct/g, inline._punctuation)
      .getRegex();

    inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, 'g')
      .replace(/punct/g, inline._punctuation)
      .getRegex();

    inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

    inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
    inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
    inline.autolink = edit(inline.autolink)
      .replace('scheme', inline._scheme)
      .replace('email', inline._email)
      .getRegex();

    inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

    inline.tag = edit(inline.tag)
      .replace('comment', inline._comment)
      .replace('attribute', inline._attribute)
      .getRegex();

    inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
    inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
    inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

    inline.link = edit(inline.link)
      .replace('label', inline._label)
      .replace('href', inline._href)
      .replace('title', inline._title)
      .getRegex();

    inline.reflink = edit(inline.reflink)
      .replace('label', inline._label)
      .getRegex();

    inline.reflinkSearch = edit(inline.reflinkSearch, 'g')
      .replace('reflink', inline.reflink)
      .replace('nolink', inline.nolink)
      .getRegex();

    /**
     * Normal Inline Grammar
     */

    inline.normal = merge({}, inline);

    /**
     * Pedantic Inline Grammar
     */

    inline.pedantic = merge({}, inline.normal, {
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
      link: edit(/^!?\[(label)\]\((.*?)\)/)
        .replace('label', inline._label)
        .getRegex(),
      reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
        .replace('label', inline._label)
        .getRegex()
    });

    /**
     * GFM Inline Grammar
     */

    inline.gfm = merge({}, inline.normal, {
      escape: edit(inline.escape).replace('])', '~|])').getRegex(),
      _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
      url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
      _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
      del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
      text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
    });

    inline.gfm.url = edit(inline.gfm.url, 'i')
      .replace('email', inline.gfm._extended_email)
      .getRegex();
    /**
     * GFM + Line Breaks Inline Grammar
     */

    inline.breaks = merge({}, inline.gfm, {
      br: edit(inline.br).replace('{2,}', '*').getRegex(),
      text: edit(inline.gfm.text)
        .replace('\\b_', '\\b_| {2,}\\n')
        .replace(/\{2,\}/g, '*')
        .getRegex()
    });

    /**
     * smartypants text replacement
     */
    function smartypants(text) {
      return text
        // em-dashes
        .replace(/---/g, '\u2014')
        // en-dashes
        .replace(/--/g, '\u2013')
        // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
        // closing singles & apostrophes
        .replace(/'/g, '\u2019')
        // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
        // closing doubles
        .replace(/"/g, '\u201d')
        // ellipses
        .replace(/\.{3}/g, '\u2026');
    }

    /**
     * mangle email addresses
     */
    function mangle(text) {
      let out = '',
        i,
        ch;

      const l = text.length;
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
    class Lexer {
      constructor(options) {
        this.tokens = [];
        this.tokens.links = Object.create(null);
        this.options = options || defaults;
        this.options.tokenizer = this.options.tokenizer || new Tokenizer();
        this.tokenizer = this.options.tokenizer;
        this.tokenizer.options = this.options;
        this.tokenizer.lexer = this;
        this.inlineQueue = [];
        this.state = {
          inLink: false,
          inRawBlock: false,
          top: true
        };

        const rules = {
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
      static get rules() {
        return {
          block,
          inline
        };
      }

      /**
       * Static Lex Method
       */
      static lex(src, options) {
        const lexer = new Lexer(options);
        return lexer.lex(src);
      }

      /**
       * Static Lex Inline Method
       */
      static lexInline(src, options) {
        const lexer = new Lexer(options);
        return lexer.inlineTokens(src);
      }

      /**
       * Preprocessing
       */
      lex(src) {
        src = src
          .replace(/\r\n|\r/g, '\n')
          .replace(/\t/g, '    ');

        this.blockTokens(src, this.tokens);

        let next;
        while (next = this.inlineQueue.shift()) {
          this.inlineTokens(next.src, next.tokens);
        }

        return this.tokens;
      }

      /**
       * Lexing
       */
      blockTokens(src, tokens = []) {
        if (this.options.pedantic) {
          src = src.replace(/^ +$/gm, '');
        }
        let token, lastToken, cutSrc, lastParagraphClipped;

        while (src) {
          if (this.options.extensions
            && this.options.extensions.block
            && this.options.extensions.block.some((extTokenizer) => {
              if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                return true;
              }
              return false;
            })) {
            continue;
          }

          // newline
          if (token = this.tokenizer.space(src)) {
            src = src.substring(token.raw.length);
            if (token.type) {
              tokens.push(token);
            }
            continue;
          }

          // code
          if (token = this.tokenizer.code(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            // An indented code block cannot interrupt a paragraph.
            if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.text;
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          // fences
          if (token = this.tokenizer.fences(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // heading
          if (token = this.tokenizer.heading(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // hr
          if (token = this.tokenizer.hr(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // blockquote
          if (token = this.tokenizer.blockquote(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // list
          if (token = this.tokenizer.list(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // html
          if (token = this.tokenizer.html(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // def
          if (token = this.tokenizer.def(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.raw;
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else if (!this.tokens.links[token.tag]) {
              this.tokens.links[token.tag] = {
                href: token.href,
                title: token.title
              };
            }
            continue;
          }

          // table (gfm)
          if (token = this.tokenizer.table(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // lheading
          if (token = this.tokenizer.lheading(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // top-level paragraph
          // prevent paragraph consuming extensions by clipping 'src' to extension start
          cutSrc = src;
          if (this.options.extensions && this.options.extensions.startBlock) {
            let startIndex = Infinity;
            const tempSrc = src.slice(1);
            let tempStart;
            this.options.extensions.startBlock.forEach(function(getStartIndex) {
              tempStart = getStartIndex.call({ lexer: this }, tempSrc);
              if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
            });
            if (startIndex < Infinity && startIndex >= 0) {
              cutSrc = src.substring(0, startIndex + 1);
            }
          }
          if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
            lastToken = tokens[tokens.length - 1];
            if (lastParagraphClipped && lastToken.type === 'paragraph') {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.text;
              this.inlineQueue.pop();
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            lastParagraphClipped = (cutSrc.length !== src.length);
            src = src.substring(token.raw.length);
            continue;
          }

          // text
          if (token = this.tokenizer.text(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && lastToken.type === 'text') {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.text;
              this.inlineQueue.pop();
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          if (src) {
            const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
            if (this.options.silent) {
              console.error(errMsg);
              break;
            } else {
              throw new Error(errMsg);
            }
          }
        }

        this.state.top = true;
        return tokens;
      }

      inline(src, tokens) {
        this.inlineQueue.push({ src, tokens });
      }

      /**
       * Lexing/Compiling
       */
      inlineTokens(src, tokens = []) {
        let token, lastToken, cutSrc;

        // String with links masked to avoid interference with em and strong
        let maskedSrc = src;
        let match;
        let keepPrevChar, prevChar;

        // Mask out reflinks
        if (this.tokens.links) {
          const links = Object.keys(this.tokens.links);
          if (links.length > 0) {
            while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
              if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
              }
            }
          }
        }
        // Mask out other blocks
        while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
          maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
        }

        // Mask out escaped em & strong delimiters
        while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
          maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
        }

        while (src) {
          if (!keepPrevChar) {
            prevChar = '';
          }
          keepPrevChar = false;

          // extensions
          if (this.options.extensions
            && this.options.extensions.inline
            && this.options.extensions.inline.some((extTokenizer) => {
              if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                return true;
              }
              return false;
            })) {
            continue;
          }

          // escape
          if (token = this.tokenizer.escape(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // tag
          if (token = this.tokenizer.tag(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && token.type === 'text' && lastToken.type === 'text') {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          // link
          if (token = this.tokenizer.link(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // reflink, nolink
          if (token = this.tokenizer.reflink(src, this.tokens.links)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && token.type === 'text' && lastToken.type === 'text') {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          // em & strong
          if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // code
          if (token = this.tokenizer.codespan(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // br
          if (token = this.tokenizer.br(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // del (gfm)
          if (token = this.tokenizer.del(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // autolink
          if (token = this.tokenizer.autolink(src, mangle)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // url (gfm)
          if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // text
          // prevent inlineText consuming extensions by clipping 'src' to extension start
          cutSrc = src;
          if (this.options.extensions && this.options.extensions.startInline) {
            let startIndex = Infinity;
            const tempSrc = src.slice(1);
            let tempStart;
            this.options.extensions.startInline.forEach(function(getStartIndex) {
              tempStart = getStartIndex.call({ lexer: this }, tempSrc);
              if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
            });
            if (startIndex < Infinity && startIndex >= 0) {
              cutSrc = src.substring(0, startIndex + 1);
            }
          }
          if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
            src = src.substring(token.raw.length);
            if (token.raw.slice(-1) !== '_') { // Track prevChar before string of ____ started
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
            const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
            if (this.options.silent) {
              console.error(errMsg);
              break;
            } else {
              throw new Error(errMsg);
            }
          }
        }

        return tokens;
      }
    }

    /**
     * Renderer
     */
    class Renderer {
      constructor(options) {
        this.options = options || defaults;
      }

      code(code, infostring, escaped) {
        const lang = (infostring || '').match(/\S*/)[0];
        if (this.options.highlight) {
          const out = this.options.highlight(code, lang);
          if (out != null && out !== code) {
            escaped = true;
            code = out;
          }
        }

        code = code.replace(/\n$/, '') + '\n';

        if (!lang) {
          return '<pre><code>'
            + (escaped ? code : escape(code, true))
            + '</code></pre>\n';
        }

        return '<pre><code class="'
          + this.options.langPrefix
          + escape(lang, true)
          + '">'
          + (escaped ? code : escape(code, true))
          + '</code></pre>\n';
      }

      blockquote(quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n';
      }

      html(html) {
        return html;
      }

      heading(text, level, raw, slugger) {
        if (this.options.headerIds) {
          return '<h'
            + level
            + ' id="'
            + this.options.headerPrefix
            + slugger.slug(raw)
            + '">'
            + text
            + '</h'
            + level
            + '>\n';
        }
        // ignore IDs
        return '<h' + level + '>' + text + '</h' + level + '>\n';
      }

      hr() {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
      }

      list(body, ordered, start) {
        const type = ordered ? 'ol' : 'ul',
          startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
      }

      listitem(text) {
        return '<li>' + text + '</li>\n';
      }

      checkbox(checked) {
        return '<input '
          + (checked ? 'checked="" ' : '')
          + 'disabled="" type="checkbox"'
          + (this.options.xhtml ? ' /' : '')
          + '> ';
      }

      paragraph(text) {
        return '<p>' + text + '</p>\n';
      }

      table(header, body) {
        if (body) body = '<tbody>' + body + '</tbody>';

        return '<table>\n'
          + '<thead>\n'
          + header
          + '</thead>\n'
          + body
          + '</table>\n';
      }

      tablerow(content) {
        return '<tr>\n' + content + '</tr>\n';
      }

      tablecell(content, flags) {
        const type = flags.header ? 'th' : 'td';
        const tag = flags.align
          ? '<' + type + ' align="' + flags.align + '">'
          : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
      }

      // span level renderer
      strong(text) {
        return '<strong>' + text + '</strong>';
      }

      em(text) {
        return '<em>' + text + '</em>';
      }

      codespan(text) {
        return '<code>' + text + '</code>';
      }

      br() {
        return this.options.xhtml ? '<br/>' : '<br>';
      }

      del(text) {
        return '<del>' + text + '</del>';
      }

      link(href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }
        let out = '<a href="' + escape(href) + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
      }

      image(href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }

        let out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
      }

      text(text) {
        return text;
      }
    }

    /**
     * TextRenderer
     * returns only the textual part of the token
     */
    class TextRenderer {
      // no need for block level renderers
      strong(text) {
        return text;
      }

      em(text) {
        return text;
      }

      codespan(text) {
        return text;
      }

      del(text) {
        return text;
      }

      html(text) {
        return text;
      }

      text(text) {
        return text;
      }

      link(href, title, text) {
        return '' + text;
      }

      image(href, title, text) {
        return '' + text;
      }

      br() {
        return '';
      }
    }

    /**
     * Slugger generates header id
     */
    class Slugger {
      constructor() {
        this.seen = {};
      }

      serialize(value) {
        return value
          .toLowerCase()
          .trim()
          // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '')
          // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
          .replace(/\s/g, '-');
      }

      /**
       * Finds the next safe (unique) slug to use
       */
      getNextSafeSlug(originalSlug, isDryRun) {
        let slug = originalSlug;
        let occurenceAccumulator = 0;
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
      slug(value, options = {}) {
        const slug = this.serialize(value);
        return this.getNextSafeSlug(slug, options.dryrun);
      }
    }

    /**
     * Parsing & Compiling
     */
    class Parser {
      constructor(options) {
        this.options = options || defaults;
        this.options.renderer = this.options.renderer || new Renderer();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
        this.textRenderer = new TextRenderer();
        this.slugger = new Slugger();
      }

      /**
       * Static Parse Method
       */
      static parse(tokens, options) {
        const parser = new Parser(options);
        return parser.parse(tokens);
      }

      /**
       * Static Parse Inline Method
       */
      static parseInline(tokens, options) {
        const parser = new Parser(options);
        return parser.parseInline(tokens);
      }

      /**
       * Parse Loop
       */
      parse(tokens, top = true) {
        let out = '',
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
          checkbox,
          ret;

        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];

          // Run any renderer extensions
          if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
            ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
            if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(token.type)) {
              out += ret || '';
              continue;
            }
          }

          switch (token.type) {
            case 'space': {
              continue;
            }
            case 'hr': {
              out += this.renderer.hr();
              continue;
            }
            case 'heading': {
              out += this.renderer.heading(
                this.parseInline(token.tokens),
                token.depth,
                unescape(this.parseInline(token.tokens, this.textRenderer)),
                this.slugger);
              continue;
            }
            case 'code': {
              out += this.renderer.code(token.text,
                token.lang,
                token.escaped);
              continue;
            }
            case 'table': {
              header = '';

              // header
              cell = '';
              l2 = token.header.length;
              for (j = 0; j < l2; j++) {
                cell += this.renderer.tablecell(
                  this.parseInline(token.header[j].tokens),
                  { header: true, align: token.align[j] }
                );
              }
              header += this.renderer.tablerow(cell);

              body = '';
              l2 = token.rows.length;
              for (j = 0; j < l2; j++) {
                row = token.rows[j];

                cell = '';
                l3 = row.length;
                for (k = 0; k < l3; k++) {
                  cell += this.renderer.tablecell(
                    this.parseInline(row[k].tokens),
                    { header: false, align: token.align[k] }
                  );
                }

                body += this.renderer.tablerow(cell);
              }
              out += this.renderer.table(header, body);
              continue;
            }
            case 'blockquote': {
              body = this.parse(token.tokens);
              out += this.renderer.blockquote(body);
              continue;
            }
            case 'list': {
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
                    if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
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
            case 'html': {
              // TODO parse inline content if parameter markdown=1
              out += this.renderer.html(token.text);
              continue;
            }
            case 'paragraph': {
              out += this.renderer.paragraph(this.parseInline(token.tokens));
              continue;
            }
            case 'text': {
              body = token.tokens ? this.parseInline(token.tokens) : token.text;
              while (i + 1 < l && tokens[i + 1].type === 'text') {
                token = tokens[++i];
                body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
              }
              out += top ? this.renderer.paragraph(body) : body;
              continue;
            }

            default: {
              const errMsg = 'Token with "' + token.type + '" type was not found.';
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
      parseInline(tokens, renderer) {
        renderer = renderer || this.renderer;
        let out = '',
          i,
          token,
          ret;

        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];

          // Run any renderer extensions
          if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
            ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
            if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(token.type)) {
              out += ret || '';
              continue;
            }
          }

          switch (token.type) {
            case 'escape': {
              out += renderer.text(token.text);
              break;
            }
            case 'html': {
              out += renderer.html(token.text);
              break;
            }
            case 'link': {
              out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
              break;
            }
            case 'image': {
              out += renderer.image(token.href, token.title, token.text);
              break;
            }
            case 'strong': {
              out += renderer.strong(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'em': {
              out += renderer.em(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'codespan': {
              out += renderer.codespan(token.text);
              break;
            }
            case 'br': {
              out += renderer.br();
              break;
            }
            case 'del': {
              out += renderer.del(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'text': {
              out += renderer.text(token.text);
              break;
            }
            default: {
              const errMsg = 'Token with "' + token.type + '" type was not found.';
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
    }

    /**
     * Marked
     */
    function marked(src, opt, callback) {
      // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked(): input parameter is undefined or null');
      }
      if (typeof src !== 'string') {
        throw new Error('marked(): input parameter is of type '
          + Object.prototype.toString.call(src) + ', string expected');
      }

      if (typeof opt === 'function') {
        callback = opt;
        opt = null;
      }

      opt = merge({}, marked.defaults, opt || {});
      checkSanitizeDeprecation(opt);

      if (callback) {
        const highlight = opt.highlight;
        let tokens;

        try {
          tokens = Lexer.lex(src, opt);
        } catch (e) {
          return callback(e);
        }

        const done = function(err) {
          let out;

          if (!err) {
            try {
              if (opt.walkTokens) {
                marked.walkTokens(tokens, opt.walkTokens);
              }
              out = Parser.parse(tokens, opt);
            } catch (e) {
              err = e;
            }
          }

          opt.highlight = highlight;

          return err
            ? callback(err)
            : callback(null, out);
        };

        if (!highlight || highlight.length < 3) {
          return done();
        }

        delete opt.highlight;

        if (!tokens.length) return done();

        let pending = 0;
        marked.walkTokens(tokens, function(token) {
          if (token.type === 'code') {
            pending++;
            setTimeout(() => {
              highlight(token.text, token.lang, function(err, code) {
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
        const tokens = Lexer.lex(src, opt);
        if (opt.walkTokens) {
          marked.walkTokens(tokens, opt.walkTokens);
        }
        return Parser.parse(tokens, opt);
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if (opt.silent) {
          return '<p>An error occurred:</p><pre>'
            + escape(e.message + '', true)
            + '</pre>';
        }
        throw e;
      }
    }

    /**
     * Options
     */

    marked.options =
    marked.setOptions = function(opt) {
      merge(marked.defaults, opt);
      changeDefaults(marked.defaults);
      return marked;
    };

    marked.getDefaults = getDefaults;

    marked.defaults = defaults;

    /**
     * Use Extension
     */

    marked.use = function(...args) {
      const opts = merge({}, ...args);
      const extensions = marked.defaults.extensions || { renderers: {}, childTokens: {} };
      let hasExtensions;

      args.forEach((pack) => {
        // ==-- Parse "addon" extensions --== //
        if (pack.extensions) {
          hasExtensions = true;
          pack.extensions.forEach((ext) => {
            if (!ext.name) {
              throw new Error('extension name required');
            }
            if (ext.renderer) { // Renderer extensions
              const prevRenderer = extensions.renderers ? extensions.renderers[ext.name] : null;
              if (prevRenderer) {
                // Replace extension with func to run new extension but fall back if false
                extensions.renderers[ext.name] = function(...args) {
                  let ret = ext.renderer.apply(this, args);
                  if (ret === false) {
                    ret = prevRenderer.apply(this, args);
                  }
                  return ret;
                };
              } else {
                extensions.renderers[ext.name] = ext.renderer;
              }
            }
            if (ext.tokenizer) { // Tokenizer Extensions
              if (!ext.level || (ext.level !== 'block' && ext.level !== 'inline')) {
                throw new Error("extension level must be 'block' or 'inline'");
              }
              if (extensions[ext.level]) {
                extensions[ext.level].unshift(ext.tokenizer);
              } else {
                extensions[ext.level] = [ext.tokenizer];
              }
              if (ext.start) { // Function to check for start of token
                if (ext.level === 'block') {
                  if (extensions.startBlock) {
                    extensions.startBlock.push(ext.start);
                  } else {
                    extensions.startBlock = [ext.start];
                  }
                } else if (ext.level === 'inline') {
                  if (extensions.startInline) {
                    extensions.startInline.push(ext.start);
                  } else {
                    extensions.startInline = [ext.start];
                  }
                }
              }
            }
            if (ext.childTokens) { // Child tokens to be visited by walkTokens
              extensions.childTokens[ext.name] = ext.childTokens;
            }
          });
        }

        // ==-- Parse "overwrite" extensions --== //
        if (pack.renderer) {
          const renderer = marked.defaults.renderer || new Renderer();
          for (const prop in pack.renderer) {
            const prevRenderer = renderer[prop];
            // Replace renderer with func to run extension, but fall back if false
            renderer[prop] = (...args) => {
              let ret = pack.renderer[prop].apply(renderer, args);
              if (ret === false) {
                ret = prevRenderer.apply(renderer, args);
              }
              return ret;
            };
          }
          opts.renderer = renderer;
        }
        if (pack.tokenizer) {
          const tokenizer = marked.defaults.tokenizer || new Tokenizer();
          for (const prop in pack.tokenizer) {
            const prevTokenizer = tokenizer[prop];
            // Replace tokenizer with func to run extension, but fall back if false
            tokenizer[prop] = (...args) => {
              let ret = pack.tokenizer[prop].apply(tokenizer, args);
              if (ret === false) {
                ret = prevTokenizer.apply(tokenizer, args);
              }
              return ret;
            };
          }
          opts.tokenizer = tokenizer;
        }

        // ==-- Parse WalkTokens extensions --== //
        if (pack.walkTokens) {
          const walkTokens = marked.defaults.walkTokens;
          opts.walkTokens = function(token) {
            pack.walkTokens.call(this, token);
            if (walkTokens) {
              walkTokens.call(this, token);
            }
          };
        }

        if (hasExtensions) {
          opts.extensions = extensions;
        }

        marked.setOptions(opts);
      });
    };

    /**
     * Run callback for every token
     */

    marked.walkTokens = function(tokens, callback) {
      for (const token of tokens) {
        callback.call(marked, token);
        switch (token.type) {
          case 'table': {
            for (const cell of token.header) {
              marked.walkTokens(cell.tokens, callback);
            }
            for (const row of token.rows) {
              for (const cell of row) {
                marked.walkTokens(cell.tokens, callback);
              }
            }
            break;
          }
          case 'list': {
            marked.walkTokens(token.items, callback);
            break;
          }
          default: {
            if (marked.defaults.extensions && marked.defaults.extensions.childTokens && marked.defaults.extensions.childTokens[token.type]) { // Walk any extensions
              marked.defaults.extensions.childTokens[token.type].forEach(function(childTokens) {
                marked.walkTokens(token[childTokens], callback);
              });
            } else if (token.tokens) {
              marked.walkTokens(token.tokens, callback);
            }
          }
        }
      }
    };

    /**
     * Parse Inline
     */
    marked.parseInline = function(src, opt) {
      // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked.parseInline(): input parameter is undefined or null');
      }
      if (typeof src !== 'string') {
        throw new Error('marked.parseInline(): input parameter is of type '
          + Object.prototype.toString.call(src) + ', string expected');
      }

      opt = merge({}, marked.defaults, opt || {});
      checkSanitizeDeprecation(opt);

      try {
        const tokens = Lexer.lexInline(src, opt);
        if (opt.walkTokens) {
          marked.walkTokens(tokens, opt.walkTokens);
        }
        return Parser.parseInline(tokens, opt);
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if (opt.silent) {
          return '<p>An error occurred:</p><pre>'
            + escape(e.message + '', true)
            + '</pre>';
        }
        throw e;
      }
    };

    /**
     * Expose
     */
    marked.Parser = Parser;
    marked.parser = Parser.parse;
    marked.Renderer = Renderer;
    marked.TextRenderer = TextRenderer;
    marked.Lexer = Lexer;
    marked.lexer = Lexer.lex;
    marked.Tokenizer = Tokenizer;
    marked.Slugger = Slugger;
    marked.parse = marked;
    Parser.parse;
    Lexer.lex;

    /* src\components\StatusIcon.svelte generated by Svelte v3.44.1 */

    const file$7 = "src\\components\\StatusIcon.svelte";

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
    			t = text("svg:not(.failed) .cross,\r\n\t\tsvg:not(.succeeded) .check {\r\n\t\t\topacity: 0;\r\n\t\t\t-webkit-animation: none;\r\n\t\t\tanimation: none;\r\n\t\t}\r\n\t\t.circle-bg {\r\n\t\t\tstroke: var(--font-base-clr-005);\r\n\t\t}\r\n\t\t.circle, .cross, .check {\r\n\t\t\ttransform-origin: center;\r\n\t\t\ttransform-box: view-box;\r\n\t\t}\r\n\r\n\t\tsvg.loading .circle {\r\n\t\t\tstroke-dasharray: 290;\r\n\t\t\tstroke-dashoffset: 0;\r\n\t\t\t-webkit-animation: loadingCircle 3s infinite linear;\r\n\t\t\tanimation: loadingCircle 3s infinite linear;\r\n\t\t\tstroke: var(--font-base-clr-025);\r\n\t\t}\r\n\t\t@-webkit-keyframes loadingCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes loadingCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\tsvg.failed .circle-bg {\r\n\t\t\tstroke: var(--color-crit-01)\r\n\t\t}\r\n\t\tsvg.failed .circle {\r\n\t\t\tstroke-dasharray: 290;\r\n\t\t\tstroke-dashoffset: 0;\r\n\t\t\t-webkit-animation: failedCircle 1s linear;\r\n\t\t\tanimation: failedCircle 1s linear;\r\n\t\t\tstroke: var(--color-crit);\r\n\t\t}\r\n\t\t@-webkit-keyframes failedCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--font-base-clr-01);\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--color-crit);\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes failedCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--font-base-clr-01);\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--color-crit);\r\n\t\t\t}\r\n\t\t}\r\n\t\tsvg.failed .cross_1 {\r\n\t\t\tstroke-dasharray: 90;\r\n\t\t\tstroke-dashoffset: 204;\r\n\t\t\tstroke: var(--color-crit);\r\n\t\t\t-webkit-animation: cross_1 .75s both cubic-bezier(.22, .61, .36, 1);\r\n\t\t\tanimation: cross_1 .75s both cubic-bezier(.22, .61, .36, 1);\r\n\t\t\t-webkit-animation-delay: .3s;\r\n\t\t\tanimation-delay: .3s;\r\n\t\t}\r\n\t\t@-webkit-keyframes cross_1 {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 90;\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes cross_1 {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 90;\r\n\t\t\t}\r\n\t\t}\r\n\t\tsvg.failed .cross_2 {\r\n\t\t\tstroke-dasharray: 93;\r\n\t\t\tstroke-dashoffset: 212;\r\n\t\t\tstroke: var(--color-crit);\r\n\t\t\t-webkit-animation: cross_2 .4s both cubic-bezier(.22, .61, .36, 1);\r\n\t\t\tanimation: cross_2 .4s both cubic-bezier(.22, .61, .36, 1);\r\n\t\t\t-webkit-animation-delay: .55s;\r\n\t\t\tanimation-delay: .55s;\r\n\t\t}\r\n\t\t@-webkit-keyframes cross_2 {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 93;\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes cross_2 {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 93;\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\tsvg.succeeded .circle-bg {\r\n\t\t\tstroke: var(--color-success-01)\r\n\t\t}\r\n\t\tsvg.succeeded .circle {\r\n\t\t\tstroke-dasharray: 290;\r\n\t\t\tstroke-dashoffset: 0;\r\n\t\t\t-webkit-animation: succeededCircle 1s linear;\r\n\t\t\tanimation: succeededCircle 1s linear;\r\n\t\t\tstroke: var(--color-success);\r\n\t\t}\r\n\t\t@-webkit-keyframes succeededCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--font-base-clr-01);\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--color-success);\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes succeededCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--font-base-clr-01);\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--color-success);\r\n\t\t\t}\r\n\t\t}\r\n\t\tsvg.succeeded .check {\r\n\t\t\tstroke-dasharray: 105;\r\n\t\t\tstroke-dashoffset: 105;\r\n\t\t\tstroke: var(--color-success);\r\n\t\t\t-webkit-animation: check .75s both var(--transition-easing);\r\n\t\t\tanimation: check .75s both var(--transition-easing);\r\n\t\t\t-webkit-animation-delay: .35s;\r\n\t\t\tanimation-delay: .35s;\r\n\t\t}\r\n\t\t@-webkit-keyframes check {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 105;\r\n\t\t\t}\r\n\t\t\tto {\r\n\t\t\t\tstroke-dashoffset: 35;\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes check {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 105;\r\n\t\t\t}\r\n\t\t\tto {\r\n\t\t\t\tstroke-dashoffset: 35;\r\n\t\t\t}\r\n\t\t}\r\n");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			add_location(style, file$7, 6, 1, 251);
    			attr_dev(path0, "class", "circle-bg");
    			attr_dev(path0, "d", "M60 106C85.4051 106 106 85.4051 106 60C106 34.5949 85.4051 14 60 14C34.5949 14 14 34.5949 14 60C14 85.4051 34.5949 106 60 106Z");
    			attr_dev(path0, "stroke-width", ".1rem");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			add_location(path0, file$7, 206, 1, 4687);
    			attr_dev(path1, "class", "circle");
    			attr_dev(path1, "d", "M60 106C85.4051 106 106 85.4051 106 60C106 34.5949 85.4051 14 60 14C34.5949 14 14 34.5949 14 60C14 85.4051 34.5949 106 60 106Z");
    			attr_dev(path1, "stroke-width", ".1rem");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			add_location(path1, file$7, 207, 1, 4914);
    			attr_dev(path2, "class", "check");
    			attr_dev(path2, "d", "M83.5614 43L48.9583 77.8633L36.0001 64.9051C23.5949 52.5 11.5001 58 17.0003 76.5");
    			attr_dev(path2, "stroke-width", ".1rem");
    			attr_dev(path2, "stroke-linecap", "round");
    			attr_dev(path2, "stroke-linejoin", "round");
    			add_location(path2, file$7, 208, 1, 5138);
    			attr_dev(path3, "class", "cross cross_1");
    			attr_dev(path3, "d", "M82.9993 83L37.0003 37.001C29.4993 29.5 24.5 28 19 39");
    			attr_dev(path3, "stroke-width", ".1rem");
    			attr_dev(path3, "stroke-linecap", "round");
    			attr_dev(path3, "stroke-linejoin", "round");
    			add_location(path3, file$7, 209, 1, 5315);
    			attr_dev(path4, "class", "cross cross_2");
    			attr_dev(path4, "d", "M37.0001 82.9386L82.9991 36.9397C91.5 28.4388 83.9999 19 75.9999 17");
    			attr_dev(path4, "stroke-width", ".1rem");
    			attr_dev(path4, "stroke-linecap", "round");
    			attr_dev(path4, "stroke-linejoin", "round");
    			add_location(path4, file$7, 210, 1, 5473);
    			attr_dev(svg, "class", "icon");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
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
    	validate_slots('StatusIcon', slots, []);
    	let { failed = false } = $$props;
    	let { succeeded = false } = $$props;
    	let { loading = false } = $$props;
    	const writable_props = ['failed', 'succeeded', 'loading'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StatusIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('failed' in $$props) $$invalidate(0, failed = $$props.failed);
    		if ('succeeded' in $$props) $$invalidate(1, succeeded = $$props.succeeded);
    		if ('loading' in $$props) $$invalidate(2, loading = $$props.loading);
    	};

    	$$self.$capture_state = () => ({ failed, succeeded, loading });

    	$$self.$inject_state = $$props => {
    		if ('failed' in $$props) $$invalidate(0, failed = $$props.failed);
    		if ('succeeded' in $$props) $$invalidate(1, succeeded = $$props.succeeded);
    		if ('loading' in $$props) $$invalidate(2, loading = $$props.loading);
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

    /* node_modules\svelte-meta-tags\MetaTags.svelte generated by Svelte v3.44.1 */

    const file$6 = "node_modules\\svelte-meta-tags\\MetaTags.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    function get_each_context_10(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    function get_each_context_11(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    function get_each_context_12(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	return child_ctx;
    }

    // (53:2) {#if description}
    function create_if_block_54(ctx) {
    	let meta;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "description");
    			attr_dev(meta, "content", /*description*/ ctx[3]);
    			add_location(meta, file$6, 53, 4, 1530);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*description*/ 8) {
    				attr_dev(meta, "content", /*description*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_54.name,
    		type: "if",
    		source: "(53:2) {#if description}",
    		ctx
    	});

    	return block;
    }

    // (57:2) {#if canonical}
    function create_if_block_53(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "canonical");
    			attr_dev(link, "href", /*canonical*/ ctx[9]);
    			add_location(link, file$6, 57, 4, 1611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*canonical*/ 512) {
    				attr_dev(link, "href", /*canonical*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_53.name,
    		type: "if",
    		source: "(57:2) {#if canonical}",
    		ctx
    	});

    	return block;
    }

    // (61:2) {#if mobileAlternate}
    function create_if_block_52(ctx) {
    	let link;
    	let link_media_value;
    	let link_href_value;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "alternate");
    			attr_dev(link, "media", link_media_value = /*mobileAlternate*/ ctx[4].media);
    			attr_dev(link, "href", link_href_value = /*mobileAlternate*/ ctx[4].href);
    			add_location(link, file$6, 61, 4, 1690);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mobileAlternate*/ 16 && link_media_value !== (link_media_value = /*mobileAlternate*/ ctx[4].media)) {
    				attr_dev(link, "media", link_media_value);
    			}

    			if (dirty[0] & /*mobileAlternate*/ 16 && link_href_value !== (link_href_value = /*mobileAlternate*/ ctx[4].href)) {
    				attr_dev(link, "href", link_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_52.name,
    		type: "if",
    		source: "(61:2) {#if mobileAlternate}",
    		ctx
    	});

    	return block;
    }

    // (65:2) {#if languageAlternates && languageAlternates.length > 0}
    function create_if_block_51(ctx) {
    	let each_1_anchor;
    	let each_value_12 = /*languageAlternates*/ ctx[5];
    	validate_each_argument(each_value_12);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_12.length; i += 1) {
    		each_blocks[i] = create_each_block_12(get_each_context_12(ctx, each_value_12, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*languageAlternates*/ 32) {
    				each_value_12 = /*languageAlternates*/ ctx[5];
    				validate_each_argument(each_value_12);
    				let i;

    				for (i = 0; i < each_value_12.length; i += 1) {
    					const child_ctx = get_each_context_12(ctx, each_value_12, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_12(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_12.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_51.name,
    		type: "if",
    		source: "(65:2) {#if languageAlternates && languageAlternates.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (66:4) {#each languageAlternates as languageAlternate}
    function create_each_block_12(ctx) {
    	let link;
    	let link_hreflang_value;
    	let link_href_value;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "alternate");
    			attr_dev(link, "hreflang", link_hreflang_value = /*languageAlternate*/ ctx[45].hrefLang);
    			attr_dev(link, "href", link_href_value = /*languageAlternate*/ ctx[45].href);
    			add_location(link, file$6, 66, 6, 1900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*languageAlternates*/ 32 && link_hreflang_value !== (link_hreflang_value = /*languageAlternate*/ ctx[45].hrefLang)) {
    				attr_dev(link, "hreflang", link_hreflang_value);
    			}

    			if (dirty[0] & /*languageAlternates*/ 32 && link_href_value !== (link_href_value = /*languageAlternate*/ ctx[45].href)) {
    				attr_dev(link, "href", link_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_12.name,
    		type: "each",
    		source: "(66:4) {#each languageAlternates as languageAlternate}",
    		ctx
    	});

    	return block;
    }

    // (71:2) {#if twitter}
    function create_if_block_47(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let if_block0 = /*twitter*/ ctx[6].cardType && create_if_block_50(ctx);
    	let if_block1 = /*twitter*/ ctx[6].site && create_if_block_49(ctx);
    	let if_block2 = /*twitter*/ ctx[6].handle && create_if_block_48(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*twitter*/ ctx[6].cardType) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_50(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*twitter*/ ctx[6].site) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_49(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*twitter*/ ctx[6].handle) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_48(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_47.name,
    		type: "if",
    		source: "(71:2) {#if twitter}",
    		ctx
    	});

    	return block;
    }

    // (72:4) {#if twitter.cardType}
    function create_if_block_50(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:card");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[6].cardType);
    			add_location(meta, file$6, 72, 6, 2063);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*twitter*/ 64 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[6].cardType)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_50.name,
    		type: "if",
    		source: "(72:4) {#if twitter.cardType}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if twitter.site}
    function create_if_block_49(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:site");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[6].site);
    			add_location(meta, file$6, 75, 6, 2158);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*twitter*/ 64 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[6].site)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_49.name,
    		type: "if",
    		source: "(75:4) {#if twitter.site}",
    		ctx
    	});

    	return block;
    }

    // (78:4) {#if twitter.handle}
    function create_if_block_48(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:creator");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[6].handle);
    			add_location(meta, file$6, 78, 6, 2251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*twitter*/ 64 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[6].handle)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_48.name,
    		type: "if",
    		source: "(78:4) {#if twitter.handle}",
    		ctx
    	});

    	return block;
    }

    // (83:2) {#if facebook}
    function create_if_block_46(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "fb:app_id");
    			attr_dev(meta, "content", meta_content_value = /*facebook*/ ctx[7].appId);
    			add_location(meta, file$6, 83, 4, 2348);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*facebook*/ 128 && meta_content_value !== (meta_content_value = /*facebook*/ ctx[7].appId)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_46.name,
    		type: "if",
    		source: "(83:2) {#if facebook}",
    		ctx
    	});

    	return block;
    }

    // (87:2) {#if openGraph}
    function create_if_block_2$4(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let if_block7_anchor;
    	let if_block0 = (/*openGraph*/ ctx[8].url || /*canonical*/ ctx[9]) && create_if_block_45(ctx);
    	let if_block1 = /*openGraph*/ ctx[8].type && create_if_block_17$1(ctx);
    	let if_block2 = (/*openGraph*/ ctx[8].title || /*title*/ ctx[0]) && create_if_block_16$1(ctx);
    	let if_block3 = (/*openGraph*/ ctx[8].description || /*description*/ ctx[3]) && create_if_block_15$1(ctx);
    	let if_block4 = /*openGraph*/ ctx[8].images && /*openGraph*/ ctx[8].images.length && create_if_block_11$1(ctx);
    	let if_block5 = /*openGraph*/ ctx[8].videos && /*openGraph*/ ctx[8].videos.length && create_if_block_5$2(ctx);
    	let if_block6 = /*openGraph*/ ctx[8].locale && create_if_block_4$2(ctx);
    	let if_block7 = /*openGraph*/ ctx[8].site_name && create_if_block_3$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			t6 = space();
    			if (if_block7) if_block7.c();
    			if_block7_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, if_block7_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*openGraph*/ ctx[8].url || /*canonical*/ ctx[9]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_45(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*openGraph*/ ctx[8].type) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_17$1(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*openGraph*/ ctx[8].title || /*title*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_16$1(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*openGraph*/ ctx[8].description || /*description*/ ctx[3]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_15$1(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*openGraph*/ ctx[8].images && /*openGraph*/ ctx[8].images.length) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_11$1(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*openGraph*/ ctx[8].videos && /*openGraph*/ ctx[8].videos.length) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_5$2(ctx);
    					if_block5.c();
    					if_block5.m(t5.parentNode, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*openGraph*/ ctx[8].locale) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_4$2(ctx);
    					if_block6.c();
    					if_block6.m(t6.parentNode, t6);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*openGraph*/ ctx[8].site_name) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_3$2(ctx);
    					if_block7.c();
    					if_block7.m(if_block7_anchor.parentNode, if_block7_anchor);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(if_block7_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(87:2) {#if openGraph}",
    		ctx
    	});

    	return block;
    }

    // (88:4) {#if openGraph.url || canonical}
    function create_if_block_45(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:url");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].url || /*canonical*/ ctx[9]);
    			add_location(meta, file$6, 88, 6, 2473);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph, canonical*/ 768 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].url || /*canonical*/ ctx[9])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_45.name,
    		type: "if",
    		source: "(88:4) {#if openGraph.url || canonical}",
    		ctx
    	});

    	return block;
    }

    // (92:4) {#if openGraph.type}
    function create_if_block_17$1(ctx) {
    	let meta;
    	let meta_content_value;
    	let t;
    	let show_if;
    	let show_if_1;
    	let show_if_2;
    	let show_if_3;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*openGraph*/ 256) show_if = !!(/*openGraph*/ ctx[8].type.toLowerCase() === 'profile' && /*openGraph*/ ctx[8].profile);
    		if (show_if) return create_if_block_18$1;
    		if (show_if_1 == null || dirty[0] & /*openGraph*/ 256) show_if_1 = !!(/*openGraph*/ ctx[8].type.toLowerCase() === 'book' && /*openGraph*/ ctx[8].book);
    		if (show_if_1) return create_if_block_23$1;
    		if (show_if_2 == null || dirty[0] & /*openGraph*/ 256) show_if_2 = !!(/*openGraph*/ ctx[8].type.toLowerCase() === 'article' && /*openGraph*/ ctx[8].article);
    		if (show_if_2) return create_if_block_28$1;
    		if (show_if_3 == null || dirty[0] & /*openGraph*/ 256) show_if_3 = !!(/*openGraph*/ ctx[8].type.toLowerCase() === 'video.movie' || /*openGraph*/ ctx[8].type.toLowerCase() === 'video.episode' || /*openGraph*/ ctx[8].type.toLowerCase() === 'video.tv_show' || /*openGraph*/ ctx[8].type.toLowerCase() === 'video.other' && /*openGraph*/ ctx[8].video);
    		if (show_if_3) return create_if_block_35;
    	}

    	let current_block_type = select_block_type(ctx, [-1, -1]);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(meta, "property", "og:type");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].type.toLowerCase());
    			add_location(meta, file$6, 92, 6, 2579);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].type.toLowerCase())) {
    				attr_dev(meta, "content", meta_content_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    			if (detaching) detach_dev(t);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17$1.name,
    		type: "if",
    		source: "(92:4) {#if openGraph.type}",
    		ctx
    	});

    	return block;
    }

    // (158:238) 
    function create_if_block_35(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let if_block6_anchor;
    	let if_block0 = /*openGraph*/ ctx[8].video.actors && /*openGraph*/ ctx[8].video.actors.length && create_if_block_42(ctx);
    	let if_block1 = /*openGraph*/ ctx[8].video.directors && /*openGraph*/ ctx[8].video.directors.length && create_if_block_41(ctx);
    	let if_block2 = /*openGraph*/ ctx[8].video.writers && /*openGraph*/ ctx[8].video.writers.length && create_if_block_40(ctx);
    	let if_block3 = /*openGraph*/ ctx[8].video.duration && create_if_block_39(ctx);
    	let if_block4 = /*openGraph*/ ctx[8].video.releaseDate && create_if_block_38(ctx);
    	let if_block5 = /*openGraph*/ ctx[8].video.tags && /*openGraph*/ ctx[8].video.tags.length && create_if_block_37(ctx);
    	let if_block6 = /*openGraph*/ ctx[8].video.series && create_if_block_36(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			if_block6_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, if_block6_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*openGraph*/ ctx[8].video.actors && /*openGraph*/ ctx[8].video.actors.length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_42(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*openGraph*/ ctx[8].video.directors && /*openGraph*/ ctx[8].video.directors.length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_41(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*openGraph*/ ctx[8].video.writers && /*openGraph*/ ctx[8].video.writers.length) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_40(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*openGraph*/ ctx[8].video.duration) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_39(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*openGraph*/ ctx[8].video.releaseDate) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_38(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*openGraph*/ ctx[8].video.tags && /*openGraph*/ ctx[8].video.tags.length) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_37(ctx);
    					if_block5.c();
    					if_block5.m(t5.parentNode, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*openGraph*/ ctx[8].video.series) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_36(ctx);
    					if_block6.c();
    					if_block6.m(if_block6_anchor.parentNode, if_block6_anchor);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(if_block6_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_35.name,
    		type: "if",
    		source: "(158:238) ",
    		ctx
    	});

    	return block;
    }

    // (130:80) 
    function create_if_block_28$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let if_block5_anchor;
    	let if_block0 = /*openGraph*/ ctx[8].article.publishedTime && create_if_block_34(ctx);
    	let if_block1 = /*openGraph*/ ctx[8].article.modifiedTime && create_if_block_33(ctx);
    	let if_block2 = /*openGraph*/ ctx[8].article.expirationTime && create_if_block_32(ctx);
    	let if_block3 = /*openGraph*/ ctx[8].article.authors && /*openGraph*/ ctx[8].article.authors.length && create_if_block_31(ctx);
    	let if_block4 = /*openGraph*/ ctx[8].article.section && create_if_block_30(ctx);
    	let if_block5 = /*openGraph*/ ctx[8].article.tags && /*openGraph*/ ctx[8].article.tags.length && create_if_block_29(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			if_block5_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, if_block5_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*openGraph*/ ctx[8].article.publishedTime) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_34(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*openGraph*/ ctx[8].article.modifiedTime) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_33(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*openGraph*/ ctx[8].article.expirationTime) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_32(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*openGraph*/ ctx[8].article.authors && /*openGraph*/ ctx[8].article.authors.length) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_31(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*openGraph*/ ctx[8].article.section) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_30(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*openGraph*/ ctx[8].article.tags && /*openGraph*/ ctx[8].article.tags.length) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_29(ctx);
    					if_block5.c();
    					if_block5.m(if_block5_anchor.parentNode, if_block5_anchor);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(if_block5_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_28$1.name,
    		type: "if",
    		source: "(130:80) ",
    		ctx
    	});

    	return block;
    }

    // (110:74) 
    function create_if_block_23$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let if_block3_anchor;
    	let if_block0 = /*openGraph*/ ctx[8].book.authors && /*openGraph*/ ctx[8].book.authors.length && create_if_block_27$1(ctx);
    	let if_block1 = /*openGraph*/ ctx[8].book.isbn && create_if_block_26$1(ctx);
    	let if_block2 = /*openGraph*/ ctx[8].book.releaseDate && create_if_block_25$1(ctx);
    	let if_block3 = /*openGraph*/ ctx[8].book.tags && /*openGraph*/ ctx[8].book.tags.length && create_if_block_24$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*openGraph*/ ctx[8].book.authors && /*openGraph*/ ctx[8].book.authors.length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_27$1(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*openGraph*/ ctx[8].book.isbn) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_26$1(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*openGraph*/ ctx[8].book.releaseDate) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_25$1(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*openGraph*/ ctx[8].book.tags && /*openGraph*/ ctx[8].book.tags.length) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_24$1(ctx);
    					if_block3.c();
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23$1.name,
    		type: "if",
    		source: "(110:74) ",
    		ctx
    	});

    	return block;
    }

    // (94:6) {#if openGraph.type.toLowerCase() === 'profile' && openGraph.profile}
    function create_if_block_18$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let if_block3_anchor;
    	let if_block0 = /*openGraph*/ ctx[8].profile.firstName && create_if_block_22$1(ctx);
    	let if_block1 = /*openGraph*/ ctx[8].profile.lastName && create_if_block_21$1(ctx);
    	let if_block2 = /*openGraph*/ ctx[8].profile.username && create_if_block_20$1(ctx);
    	let if_block3 = /*openGraph*/ ctx[8].profile.gender && create_if_block_19$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*openGraph*/ ctx[8].profile.firstName) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_22$1(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*openGraph*/ ctx[8].profile.lastName) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_21$1(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*openGraph*/ ctx[8].profile.username) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_20$1(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*openGraph*/ ctx[8].profile.gender) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_19$1(ctx);
    					if_block3.c();
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18$1.name,
    		type: "if",
    		source: "(94:6) {#if openGraph.type.toLowerCase() === 'profile' && openGraph.profile}",
    		ctx
    	});

    	return block;
    }

    // (159:8) {#if openGraph.video.actors && openGraph.video.actors.length}
    function create_if_block_42(ctx) {
    	let each_1_anchor;
    	let each_value_11 = /*openGraph*/ ctx[8].video.actors;
    	validate_each_argument(each_value_11);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_11.length; i += 1) {
    		each_blocks[i] = create_each_block_11(get_each_context_11(ctx, each_value_11, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256) {
    				each_value_11 = /*openGraph*/ ctx[8].video.actors;
    				validate_each_argument(each_value_11);
    				let i;

    				for (i = 0; i < each_value_11.length; i += 1) {
    					const child_ctx = get_each_context_11(ctx, each_value_11, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_11(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_11.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_42.name,
    		type: "if",
    		source: "(159:8) {#if openGraph.video.actors && openGraph.video.actors.length}",
    		ctx
    	});

    	return block;
    }

    // (161:12) {#if actor.profile}
    function create_if_block_44(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "video:actor");
    			attr_dev(meta, "content", meta_content_value = /*actor*/ ctx[42].profile);
    			add_location(meta, file$6, 161, 14, 5552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*actor*/ ctx[42].profile)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_44.name,
    		type: "if",
    		source: "(161:12) {#if actor.profile}",
    		ctx
    	});

    	return block;
    }

    // (164:12) {#if actor.role}
    function create_if_block_43(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "video:actor:role");
    			attr_dev(meta, "content", meta_content_value = /*actor*/ ctx[42].role);
    			add_location(meta, file$6, 164, 14, 5669);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*actor*/ ctx[42].role)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_43.name,
    		type: "if",
    		source: "(164:12) {#if actor.role}",
    		ctx
    	});

    	return block;
    }

    // (160:10) {#each openGraph.video.actors as actor}
    function create_each_block_11(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*actor*/ ctx[42].profile && create_if_block_44(ctx);
    	let if_block1 = /*actor*/ ctx[42].role && create_if_block_43(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*actor*/ ctx[42].profile) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_44(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*actor*/ ctx[42].role) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_43(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_11.name,
    		type: "each",
    		source: "(160:10) {#each openGraph.video.actors as actor}",
    		ctx
    	});

    	return block;
    }

    // (170:8) {#if openGraph.video.directors && openGraph.video.directors.length}
    function create_if_block_41(ctx) {
    	let each_1_anchor;
    	let each_value_10 = /*openGraph*/ ctx[8].video.directors;
    	validate_each_argument(each_value_10);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_10.length; i += 1) {
    		each_blocks[i] = create_each_block_10(get_each_context_10(ctx, each_value_10, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256) {
    				each_value_10 = /*openGraph*/ ctx[8].video.directors;
    				validate_each_argument(each_value_10);
    				let i;

    				for (i = 0; i < each_value_10.length; i += 1) {
    					const child_ctx = get_each_context_10(ctx, each_value_10, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_10(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_10.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_41.name,
    		type: "if",
    		source: "(170:8) {#if openGraph.video.directors && openGraph.video.directors.length}",
    		ctx
    	});

    	return block;
    }

    // (171:10) {#each openGraph.video.directors as director}
    function create_each_block_10(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "video:director");
    			attr_dev(meta, "content", meta_content_value = /*director*/ ctx[39]);
    			add_location(meta, file$6, 171, 12, 5922);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*director*/ ctx[39])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_10.name,
    		type: "each",
    		source: "(171:10) {#each openGraph.video.directors as director}",
    		ctx
    	});

    	return block;
    }

    // (176:8) {#if openGraph.video.writers && openGraph.video.writers.length}
    function create_if_block_40(ctx) {
    	let each_1_anchor;
    	let each_value_9 = /*openGraph*/ ctx[8].video.writers;
    	validate_each_argument(each_value_9);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		each_blocks[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256) {
    				each_value_9 = /*openGraph*/ ctx[8].video.writers;
    				validate_each_argument(each_value_9);
    				let i;

    				for (i = 0; i < each_value_9.length; i += 1) {
    					const child_ctx = get_each_context_9(ctx, each_value_9, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_9.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_40.name,
    		type: "if",
    		source: "(176:8) {#if openGraph.video.writers && openGraph.video.writers.length}",
    		ctx
    	});

    	return block;
    }

    // (177:10) {#each openGraph.video.writers as writer}
    function create_each_block_9(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "video:writer");
    			attr_dev(meta, "content", meta_content_value = /*writer*/ ctx[36]);
    			add_location(meta, file$6, 177, 12, 6145);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*writer*/ ctx[36])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(177:10) {#each openGraph.video.writers as writer}",
    		ctx
    	});

    	return block;
    }

    // (182:8) {#if openGraph.video.duration}
    function create_if_block_39(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "video:duration");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].video.duration.toString());
    			add_location(meta, file$6, 182, 10, 6277);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].video.duration.toString())) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_39.name,
    		type: "if",
    		source: "(182:8) {#if openGraph.video.duration}",
    		ctx
    	});

    	return block;
    }

    // (186:8) {#if openGraph.video.releaseDate}
    function create_if_block_38(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "video:release_date");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].video.releaseDate);
    			add_location(meta, file$6, 186, 10, 6425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].video.releaseDate)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_38.name,
    		type: "if",
    		source: "(186:8) {#if openGraph.video.releaseDate}",
    		ctx
    	});

    	return block;
    }

    // (190:8) {#if openGraph.video.tags && openGraph.video.tags.length}
    function create_if_block_37(ctx) {
    	let each_1_anchor;
    	let each_value_8 = /*openGraph*/ ctx[8].video.tags;
    	validate_each_argument(each_value_8);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256) {
    				each_value_8 = /*openGraph*/ ctx[8].video.tags;
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_8.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_37.name,
    		type: "if",
    		source: "(190:8) {#if openGraph.video.tags && openGraph.video.tags.length}",
    		ctx
    	});

    	return block;
    }

    // (191:10) {#each openGraph.video.tags as tag}
    function create_each_block_8(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "video:tag");
    			attr_dev(meta, "content", meta_content_value = /*tag*/ ctx[14]);
    			add_location(meta, file$6, 191, 12, 6641);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*tag*/ ctx[14])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(191:10) {#each openGraph.video.tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (196:8) {#if openGraph.video.series}
    function create_if_block_36(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "video:series");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].video.series);
    			add_location(meta, file$6, 196, 10, 6765);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].video.series)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_36.name,
    		type: "if",
    		source: "(196:8) {#if openGraph.video.series}",
    		ctx
    	});

    	return block;
    }

    // (131:8) {#if openGraph.article.publishedTime}
    function create_if_block_34(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:published_time");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].article.publishedTime);
    			add_location(meta, file$6, 131, 10, 4163);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].article.publishedTime)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_34.name,
    		type: "if",
    		source: "(131:8) {#if openGraph.article.publishedTime}",
    		ctx
    	});

    	return block;
    }

    // (135:8) {#if openGraph.article.modifiedTime}
    function create_if_block_33(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:modified_time");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].article.modifiedTime);
    			add_location(meta, file$6, 135, 10, 4318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].article.modifiedTime)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_33.name,
    		type: "if",
    		source: "(135:8) {#if openGraph.article.modifiedTime}",
    		ctx
    	});

    	return block;
    }

    // (139:8) {#if openGraph.article.expirationTime}
    function create_if_block_32(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:expiration_time");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].article.expirationTime);
    			add_location(meta, file$6, 139, 10, 4473);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].article.expirationTime)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_32.name,
    		type: "if",
    		source: "(139:8) {#if openGraph.article.expirationTime}",
    		ctx
    	});

    	return block;
    }

    // (143:8) {#if openGraph.article.authors && openGraph.article.authors.length}
    function create_if_block_31(ctx) {
    	let each_1_anchor;
    	let each_value_7 = /*openGraph*/ ctx[8].article.authors;
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256) {
    				each_value_7 = /*openGraph*/ ctx[8].article.authors;
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_31.name,
    		type: "if",
    		source: "(143:8) {#if openGraph.article.authors && openGraph.article.authors.length}",
    		ctx
    	});

    	return block;
    }

    // (144:10) {#each openGraph.article.authors as author}
    function create_each_block_7(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:author");
    			attr_dev(meta, "content", meta_content_value = /*author*/ ctx[27]);
    			add_location(meta, file$6, 144, 12, 4717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*author*/ ctx[27])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(144:10) {#each openGraph.article.authors as author}",
    		ctx
    	});

    	return block;
    }

    // (149:8) {#if openGraph.article.section}
    function create_if_block_30(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:section");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].article.section);
    			add_location(meta, file$6, 149, 10, 4852);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].article.section)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_30.name,
    		type: "if",
    		source: "(149:8) {#if openGraph.article.section}",
    		ctx
    	});

    	return block;
    }

    // (153:8) {#if openGraph.article.tags && openGraph.article.tags.length}
    function create_if_block_29(ctx) {
    	let each_1_anchor;
    	let each_value_6 = /*openGraph*/ ctx[8].article.tags;
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256) {
    				each_value_6 = /*openGraph*/ ctx[8].article.tags;
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_29.name,
    		type: "if",
    		source: "(153:8) {#if openGraph.article.tags && openGraph.article.tags.length}",
    		ctx
    	});

    	return block;
    }

    // (154:10) {#each openGraph.article.tags as tag}
    function create_each_block_6(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:tag");
    			attr_dev(meta, "content", meta_content_value = /*tag*/ ctx[14]);
    			add_location(meta, file$6, 154, 12, 5069);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*tag*/ ctx[14])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(154:10) {#each openGraph.article.tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (111:8) {#if openGraph.book.authors && openGraph.book.authors.length}
    function create_if_block_27$1(ctx) {
    	let each_1_anchor;
    	let each_value_5 = /*openGraph*/ ctx[8].book.authors;
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256) {
    				each_value_5 = /*openGraph*/ ctx[8].book.authors;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_27$1.name,
    		type: "if",
    		source: "(111:8) {#if openGraph.book.authors && openGraph.book.authors.length}",
    		ctx
    	});

    	return block;
    }

    // (112:10) {#each openGraph.book.authors as author}
    function create_each_block_5(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "book:author");
    			attr_dev(meta, "content", meta_content_value = /*author*/ ctx[27]);
    			add_location(meta, file$6, 112, 12, 3488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*author*/ ctx[27])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(112:10) {#each openGraph.book.authors as author}",
    		ctx
    	});

    	return block;
    }

    // (117:8) {#if openGraph.book.isbn}
    function create_if_block_26$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "book:isbn");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].book.isbn);
    			add_location(meta, file$6, 117, 10, 3614);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].book.isbn)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_26$1.name,
    		type: "if",
    		source: "(117:8) {#if openGraph.book.isbn}",
    		ctx
    	});

    	return block;
    }

    // (121:8) {#if openGraph.book.releaseDate}
    function create_if_block_25$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "book:release_date");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].book.releaseDate);
    			add_location(meta, file$6, 121, 10, 3740);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].book.releaseDate)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_25$1.name,
    		type: "if",
    		source: "(121:8) {#if openGraph.book.releaseDate}",
    		ctx
    	});

    	return block;
    }

    // (125:8) {#if openGraph.book.tags && openGraph.book.tags.length}
    function create_if_block_24$1(ctx) {
    	let each_1_anchor;
    	let each_value_4 = /*openGraph*/ ctx[8].book.tags;
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256) {
    				each_value_4 = /*openGraph*/ ctx[8].book.tags;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_24$1.name,
    		type: "if",
    		source: "(125:8) {#if openGraph.book.tags && openGraph.book.tags.length}",
    		ctx
    	});

    	return block;
    }

    // (126:10) {#each openGraph.book.tags as tag}
    function create_each_block_4(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "book:tag");
    			attr_dev(meta, "content", meta_content_value = /*tag*/ ctx[14]);
    			add_location(meta, file$6, 126, 12, 3951);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*tag*/ ctx[14])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(126:10) {#each openGraph.book.tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (95:8) {#if openGraph.profile.firstName}
    function create_if_block_22$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "profile:first_name");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].profile.firstName);
    			add_location(meta, file$6, 95, 10, 2774);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].profile.firstName)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22$1.name,
    		type: "if",
    		source: "(95:8) {#if openGraph.profile.firstName}",
    		ctx
    	});

    	return block;
    }

    // (99:8) {#if openGraph.profile.lastName}
    function create_if_block_21$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "profile:last_name");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].profile.lastName);
    			add_location(meta, file$6, 99, 10, 2917);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].profile.lastName)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21$1.name,
    		type: "if",
    		source: "(99:8) {#if openGraph.profile.lastName}",
    		ctx
    	});

    	return block;
    }

    // (103:8) {#if openGraph.profile.username}
    function create_if_block_20$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "profile:username");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].profile.username);
    			add_location(meta, file$6, 103, 10, 3058);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].profile.username)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20$1.name,
    		type: "if",
    		source: "(103:8) {#if openGraph.profile.username}",
    		ctx
    	});

    	return block;
    }

    // (107:8) {#if openGraph.profile.gender}
    function create_if_block_19$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "profile:gender");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].profile.gender);
    			add_location(meta, file$6, 107, 10, 3196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].profile.gender)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19$1.name,
    		type: "if",
    		source: "(107:8) {#if openGraph.profile.gender}",
    		ctx
    	});

    	return block;
    }

    // (202:4) {#if openGraph.title || title}
    function create_if_block_16$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:title");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].title || /*title*/ ctx[0]);
    			add_location(meta, file$6, 202, 6, 6909);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph, title*/ 257 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].title || /*title*/ ctx[0])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16$1.name,
    		type: "if",
    		source: "(202:4) {#if openGraph.title || title}",
    		ctx
    	});

    	return block;
    }

    // (206:4) {#if openGraph.description || description}
    function create_if_block_15$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:description");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].description || /*description*/ ctx[3]);
    			add_location(meta, file$6, 206, 6, 7037);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph, description*/ 264 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].description || /*description*/ ctx[3])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15$1.name,
    		type: "if",
    		source: "(206:4) {#if openGraph.description || description}",
    		ctx
    	});

    	return block;
    }

    // (210:4) {#if openGraph.images && openGraph.images.length}
    function create_if_block_11$1(ctx) {
    	let each_1_anchor;
    	let each_value_3 = /*openGraph*/ ctx[8].images;
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$2(get_each_context_3$2(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256) {
    				each_value_3 = /*openGraph*/ ctx[8].images;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$2(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$1.name,
    		type: "if",
    		source: "(210:4) {#if openGraph.images && openGraph.images.length}",
    		ctx
    	});

    	return block;
    }

    // (213:8) {#if image.alt}
    function create_if_block_14$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:image:alt");
    			attr_dev(meta, "content", meta_content_value = /*image*/ ctx[22].alt);
    			add_location(meta, file$6, 213, 10, 7315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*image*/ ctx[22].alt)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14$1.name,
    		type: "if",
    		source: "(213:8) {#if image.alt}",
    		ctx
    	});

    	return block;
    }

    // (216:8) {#if image.width}
    function create_if_block_13$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:image:width");
    			attr_dev(meta, "content", meta_content_value = /*image*/ ctx[22].width.toString());
    			add_location(meta, file$6, 216, 10, 7418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*image*/ ctx[22].width.toString())) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13$1.name,
    		type: "if",
    		source: "(216:8) {#if image.width}",
    		ctx
    	});

    	return block;
    }

    // (219:8) {#if image.height}
    function create_if_block_12$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:image:height");
    			attr_dev(meta, "content", meta_content_value = /*image*/ ctx[22].height.toString());
    			add_location(meta, file$6, 219, 10, 7537);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*image*/ ctx[22].height.toString())) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12$1.name,
    		type: "if",
    		source: "(219:8) {#if image.height}",
    		ctx
    	});

    	return block;
    }

    // (211:6) {#each openGraph.images as image}
    function create_each_block_3$2(ctx) {
    	let meta;
    	let meta_content_value;
    	let t0;
    	let t1;
    	let t2;
    	let if_block2_anchor;
    	let if_block0 = /*image*/ ctx[22].alt && create_if_block_14$1(ctx);
    	let if_block1 = /*image*/ ctx[22].width && create_if_block_13$1(ctx);
    	let if_block2 = /*image*/ ctx[22].height && create_if_block_12$1(ctx);

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(meta, "property", "og:image");
    			attr_dev(meta, "content", meta_content_value = /*image*/ ctx[22].url);
    			add_location(meta, file$6, 211, 8, 7232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*image*/ ctx[22].url)) {
    				attr_dev(meta, "content", meta_content_value);
    			}

    			if (/*image*/ ctx[22].alt) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_14$1(ctx);
    					if_block0.c();
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*image*/ ctx[22].width) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_13$1(ctx);
    					if_block1.c();
    					if_block1.m(t2.parentNode, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*image*/ ctx[22].height) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_12$1(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$2.name,
    		type: "each",
    		source: "(211:6) {#each openGraph.images as image}",
    		ctx
    	});

    	return block;
    }

    // (225:4) {#if openGraph.videos && openGraph.videos.length}
    function create_if_block_5$2(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*openGraph*/ ctx[8].videos;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256) {
    				each_value_2 = /*openGraph*/ ctx[8].videos;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(225:4) {#if openGraph.videos && openGraph.videos.length}",
    		ctx
    	});

    	return block;
    }

    // (228:8) {#if video.alt}
    function create_if_block_10$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:video:alt");
    			attr_dev(meta, "content", meta_content_value = /*video*/ ctx[19].alt);
    			add_location(meta, file$6, 228, 10, 7831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*video*/ ctx[19].alt)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(228:8) {#if video.alt}",
    		ctx
    	});

    	return block;
    }

    // (231:8) {#if video.width}
    function create_if_block_9$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:video:width");
    			attr_dev(meta, "content", meta_content_value = /*video*/ ctx[19].width.toString());
    			add_location(meta, file$6, 231, 10, 7934);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*video*/ ctx[19].width.toString())) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(231:8) {#if video.width}",
    		ctx
    	});

    	return block;
    }

    // (234:8) {#if video.height}
    function create_if_block_8$1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:video:height");
    			attr_dev(meta, "content", meta_content_value = /*video*/ ctx[19].height.toString());
    			add_location(meta, file$6, 234, 10, 8053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*video*/ ctx[19].height.toString())) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(234:8) {#if video.height}",
    		ctx
    	});

    	return block;
    }

    // (237:8) {#if video.secureUrl}
    function create_if_block_7$2(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:video:secure_url");
    			attr_dev(meta, "content", meta_content_value = /*video*/ ctx[19].secureUrl.toString());
    			add_location(meta, file$6, 237, 10, 8177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*video*/ ctx[19].secureUrl.toString())) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(237:8) {#if video.secureUrl}",
    		ctx
    	});

    	return block;
    }

    // (240:8) {#if video.type}
    function create_if_block_6$2(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:video:type");
    			attr_dev(meta, "content", meta_content_value = /*video*/ ctx[19].type.toString());
    			add_location(meta, file$6, 240, 10, 8303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*video*/ ctx[19].type.toString())) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(240:8) {#if video.type}",
    		ctx
    	});

    	return block;
    }

    // (226:6) {#each openGraph.videos as video}
    function create_each_block_2$2(ctx) {
    	let meta;
    	let meta_content_value;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let if_block4_anchor;
    	let if_block0 = /*video*/ ctx[19].alt && create_if_block_10$1(ctx);
    	let if_block1 = /*video*/ ctx[19].width && create_if_block_9$1(ctx);
    	let if_block2 = /*video*/ ctx[19].height && create_if_block_8$1(ctx);
    	let if_block3 = /*video*/ ctx[19].secureUrl && create_if_block_7$2(ctx);
    	let if_block4 = /*video*/ ctx[19].type && create_if_block_6$2(ctx);

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			t4 = space();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    			attr_dev(meta, "property", "og:video");
    			attr_dev(meta, "content", meta_content_value = /*video*/ ctx[19].url);
    			add_location(meta, file$6, 226, 8, 7748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, if_block4_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*video*/ ctx[19].url)) {
    				attr_dev(meta, "content", meta_content_value);
    			}

    			if (/*video*/ ctx[19].alt) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_10$1(ctx);
    					if_block0.c();
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*video*/ ctx[19].width) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_9$1(ctx);
    					if_block1.c();
    					if_block1.m(t2.parentNode, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*video*/ ctx[19].height) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_8$1(ctx);
    					if_block2.c();
    					if_block2.m(t3.parentNode, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*video*/ ctx[19].secureUrl) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_7$2(ctx);
    					if_block3.c();
    					if_block3.m(t4.parentNode, t4);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*video*/ ctx[19].type) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_6$2(ctx);
    					if_block4.c();
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(if_block4_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(226:6) {#each openGraph.videos as video}",
    		ctx
    	});

    	return block;
    }

    // (246:4) {#if openGraph.locale}
    function create_if_block_4$2(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:locale");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].locale);
    			add_location(meta, file$6, 246, 6, 8441);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].locale)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(246:4) {#if openGraph.locale}",
    		ctx
    	});

    	return block;
    }

    // (250:4) {#if openGraph.site_name}
    function create_if_block_3$2(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:site_name");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[8].site_name);
    			add_location(meta, file$6, 250, 6, 8545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*openGraph*/ 256 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[8].site_name)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(250:4) {#if openGraph.site_name}",
    		ctx
    	});

    	return block;
    }

    // (255:2) {#if additionalMetaTags && additionalMetaTags.length > 0}
    function create_if_block_1$4(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*additionalMetaTags*/ ctx[10];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*additionalMetaTags*/ 1024) {
    				each_value_1 = /*additionalMetaTags*/ ctx[10];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(255:2) {#if additionalMetaTags && additionalMetaTags.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (256:4) {#each additionalMetaTags as tag}
    function create_each_block_1$3(ctx) {
    	let meta;
    	let meta_levels = [/*tag*/ ctx[14]];
    	let meta_data = {};

    	for (let i = 0; i < meta_levels.length; i += 1) {
    		meta_data = assign(meta_data, meta_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			set_attributes(meta, meta_data);
    			add_location(meta, file$6, 256, 6, 8731);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(meta, meta_data = get_spread_update(meta_levels, [dirty[0] & /*additionalMetaTags*/ 1024 && /*tag*/ ctx[14]]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(256:4) {#each additionalMetaTags as tag}",
    		ctx
    	});

    	return block;
    }

    // (261:2) {#if additionalLinkTags?.length}
    function create_if_block$6(ctx) {
    	let each_1_anchor;
    	let each_value = /*additionalLinkTags*/ ctx[11];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*additionalLinkTags*/ 2048) {
    				each_value = /*additionalLinkTags*/ ctx[11];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(261:2) {#if additionalLinkTags?.length}",
    		ctx
    	});

    	return block;
    }

    // (262:4) {#each additionalLinkTags as tag}
    function create_each_block$5(ctx) {
    	let link;
    	let link_levels = [/*tag*/ ctx[14]];
    	let link_data = {};

    	for (let i = 0; i < link_levels.length; i += 1) {
    		link_data = assign(link_data, link_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			link = element("link");
    			set_attributes(link, link_data);
    			add_location(link, file$6, 262, 6, 8849);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(link, link_data = get_spread_update(link_levels, [dirty[0] & /*additionalLinkTags*/ 2048 && /*tag*/ ctx[14]]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(262:4) {#each additionalLinkTags as tag}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let title_value;
    	let meta0;
    	let meta0_content_value;
    	let meta1;
    	let meta1_content_value;
    	let if_block0_anchor;
    	let if_block1_anchor;
    	let if_block2_anchor;
    	let if_block3_anchor;
    	let if_block4_anchor;
    	let if_block5_anchor;
    	let if_block6_anchor;
    	let if_block7_anchor;
    	let if_block8_anchor;
    	document.title = title_value = /*title*/ ctx[0];
    	let if_block0 = /*description*/ ctx[3] && create_if_block_54(ctx);
    	let if_block1 = /*canonical*/ ctx[9] && create_if_block_53(ctx);
    	let if_block2 = /*mobileAlternate*/ ctx[4] && create_if_block_52(ctx);
    	let if_block3 = /*languageAlternates*/ ctx[5] && /*languageAlternates*/ ctx[5].length > 0 && create_if_block_51(ctx);
    	let if_block4 = /*twitter*/ ctx[6] && create_if_block_47(ctx);
    	let if_block5 = /*facebook*/ ctx[7] && create_if_block_46(ctx);
    	let if_block6 = /*openGraph*/ ctx[8] && create_if_block_2$4(ctx);
    	let if_block7 = /*additionalMetaTags*/ ctx[10] && /*additionalMetaTags*/ ctx[10].length > 0 && create_if_block_1$4(ctx);
    	let if_block8 = /*additionalLinkTags*/ ctx[11]?.length && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    			if (if_block5) if_block5.c();
    			if_block5_anchor = empty();
    			if (if_block6) if_block6.c();
    			if_block6_anchor = empty();
    			if (if_block7) if_block7.c();
    			if_block7_anchor = empty();
    			if (if_block8) if_block8.c();
    			if_block8_anchor = empty();
    			attr_dev(meta0, "name", "robots");
    			attr_dev(meta0, "content", meta0_content_value = `${/*noindex*/ ctx[1] ? 'noindex' : 'index'},${/*nofollow*/ ctx[2] ? 'nofollow' : 'follow'}${/*robotsParams*/ ctx[12]}`);
    			add_location(meta0, file$6, 43, 2, 1242);
    			attr_dev(meta1, "name", "googlebot");
    			attr_dev(meta1, "content", meta1_content_value = `${/*noindex*/ ctx[1] ? 'noindex' : 'index'},${/*nofollow*/ ctx[2] ? 'nofollow' : 'follow'}${/*robotsParams*/ ctx[12]}`);
    			add_location(meta1, file$6, 47, 2, 1373);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			if (if_block0) if_block0.m(document.head, null);
    			append_dev(document.head, if_block0_anchor);
    			if (if_block1) if_block1.m(document.head, null);
    			append_dev(document.head, if_block1_anchor);
    			if (if_block2) if_block2.m(document.head, null);
    			append_dev(document.head, if_block2_anchor);
    			if (if_block3) if_block3.m(document.head, null);
    			append_dev(document.head, if_block3_anchor);
    			if (if_block4) if_block4.m(document.head, null);
    			append_dev(document.head, if_block4_anchor);
    			if (if_block5) if_block5.m(document.head, null);
    			append_dev(document.head, if_block5_anchor);
    			if (if_block6) if_block6.m(document.head, null);
    			append_dev(document.head, if_block6_anchor);
    			if (if_block7) if_block7.m(document.head, null);
    			append_dev(document.head, if_block7_anchor);
    			if (if_block8) if_block8.m(document.head, null);
    			append_dev(document.head, if_block8_anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*title*/ 1 && title_value !== (title_value = /*title*/ ctx[0])) {
    				document.title = title_value;
    			}

    			if (dirty[0] & /*noindex, nofollow, robotsParams*/ 4102 && meta0_content_value !== (meta0_content_value = `${/*noindex*/ ctx[1] ? 'noindex' : 'index'},${/*nofollow*/ ctx[2] ? 'nofollow' : 'follow'}${/*robotsParams*/ ctx[12]}`)) {
    				attr_dev(meta0, "content", meta0_content_value);
    			}

    			if (dirty[0] & /*noindex, nofollow, robotsParams*/ 4102 && meta1_content_value !== (meta1_content_value = `${/*noindex*/ ctx[1] ? 'noindex' : 'index'},${/*nofollow*/ ctx[2] ? 'nofollow' : 'follow'}${/*robotsParams*/ ctx[12]}`)) {
    				attr_dev(meta1, "content", meta1_content_value);
    			}

    			if (/*description*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_54(ctx);
    					if_block0.c();
    					if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*canonical*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_53(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*mobileAlternate*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_52(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*languageAlternates*/ ctx[5] && /*languageAlternates*/ ctx[5].length > 0) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_51(ctx);
    					if_block3.c();
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*twitter*/ ctx[6]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_47(ctx);
    					if_block4.c();
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*facebook*/ ctx[7]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_46(ctx);
    					if_block5.c();
    					if_block5.m(if_block5_anchor.parentNode, if_block5_anchor);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*openGraph*/ ctx[8]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_2$4(ctx);
    					if_block6.c();
    					if_block6.m(if_block6_anchor.parentNode, if_block6_anchor);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*additionalMetaTags*/ ctx[10] && /*additionalMetaTags*/ ctx[10].length > 0) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_1$4(ctx);
    					if_block7.c();
    					if_block7.m(if_block7_anchor.parentNode, if_block7_anchor);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*additionalLinkTags*/ ctx[11]?.length) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block$6(ctx);
    					if_block8.c();
    					if_block8.m(if_block8_anchor.parentNode, if_block8_anchor);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			if (if_block0) if_block0.d(detaching);
    			detach_dev(if_block0_anchor);
    			if (if_block1) if_block1.d(detaching);
    			detach_dev(if_block1_anchor);
    			if (if_block2) if_block2.d(detaching);
    			detach_dev(if_block2_anchor);
    			if (if_block3) if_block3.d(detaching);
    			detach_dev(if_block3_anchor);
    			if (if_block4) if_block4.d(detaching);
    			detach_dev(if_block4_anchor);
    			if (if_block5) if_block5.d(detaching);
    			detach_dev(if_block5_anchor);
    			if (if_block6) if_block6.d(detaching);
    			detach_dev(if_block6_anchor);
    			if (if_block7) if_block7.d(detaching);
    			detach_dev(if_block7_anchor);
    			if (if_block8) if_block8.d(detaching);
    			detach_dev(if_block8_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MetaTags', slots, []);
    	let { title = '' } = $$props;
    	let { noindex = false } = $$props;
    	let { nofollow = false } = $$props;
    	let { robotsProps = undefined } = $$props;
    	let { description = undefined } = $$props;
    	let { mobileAlternate = undefined } = $$props;
    	let { languageAlternates = undefined } = $$props;
    	let { twitter = undefined } = $$props;
    	let { facebook = undefined } = $$props;
    	let { openGraph = undefined } = $$props;
    	let { canonical = undefined } = $$props;
    	let { additionalMetaTags = undefined } = $$props;
    	let { additionalLinkTags = undefined } = $$props;
    	let robotsParams = '';

    	if (robotsProps) {
    		const { nosnippet, maxSnippet, maxImagePreview, maxVideoPreview, noarchive, noimageindex, notranslate, unavailableAfter } = robotsProps;

    		robotsParams = `${nosnippet ? ',nosnippet' : ''}${maxSnippet ? `,max-snippet:${maxSnippet}` : ''}${maxImagePreview
		? `,max-image-preview:${maxImagePreview}`
		: ''}${noarchive ? ',noarchive' : ''}${unavailableAfter
		? `,unavailable_after:${unavailableAfter}`
		: ''}${noimageindex ? ',noimageindex' : ''}${maxVideoPreview
		? `,max-video-preview:${maxVideoPreview}`
		: ''}${notranslate ? ',notranslate' : ''}`;
    	}

    	const writable_props = [
    		'title',
    		'noindex',
    		'nofollow',
    		'robotsProps',
    		'description',
    		'mobileAlternate',
    		'languageAlternates',
    		'twitter',
    		'facebook',
    		'openGraph',
    		'canonical',
    		'additionalMetaTags',
    		'additionalLinkTags'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MetaTags> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('noindex' in $$props) $$invalidate(1, noindex = $$props.noindex);
    		if ('nofollow' in $$props) $$invalidate(2, nofollow = $$props.nofollow);
    		if ('robotsProps' in $$props) $$invalidate(13, robotsProps = $$props.robotsProps);
    		if ('description' in $$props) $$invalidate(3, description = $$props.description);
    		if ('mobileAlternate' in $$props) $$invalidate(4, mobileAlternate = $$props.mobileAlternate);
    		if ('languageAlternates' in $$props) $$invalidate(5, languageAlternates = $$props.languageAlternates);
    		if ('twitter' in $$props) $$invalidate(6, twitter = $$props.twitter);
    		if ('facebook' in $$props) $$invalidate(7, facebook = $$props.facebook);
    		if ('openGraph' in $$props) $$invalidate(8, openGraph = $$props.openGraph);
    		if ('canonical' in $$props) $$invalidate(9, canonical = $$props.canonical);
    		if ('additionalMetaTags' in $$props) $$invalidate(10, additionalMetaTags = $$props.additionalMetaTags);
    		if ('additionalLinkTags' in $$props) $$invalidate(11, additionalLinkTags = $$props.additionalLinkTags);
    	};

    	$$self.$capture_state = () => ({
    		title,
    		noindex,
    		nofollow,
    		robotsProps,
    		description,
    		mobileAlternate,
    		languageAlternates,
    		twitter,
    		facebook,
    		openGraph,
    		canonical,
    		additionalMetaTags,
    		additionalLinkTags,
    		robotsParams
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('noindex' in $$props) $$invalidate(1, noindex = $$props.noindex);
    		if ('nofollow' in $$props) $$invalidate(2, nofollow = $$props.nofollow);
    		if ('robotsProps' in $$props) $$invalidate(13, robotsProps = $$props.robotsProps);
    		if ('description' in $$props) $$invalidate(3, description = $$props.description);
    		if ('mobileAlternate' in $$props) $$invalidate(4, mobileAlternate = $$props.mobileAlternate);
    		if ('languageAlternates' in $$props) $$invalidate(5, languageAlternates = $$props.languageAlternates);
    		if ('twitter' in $$props) $$invalidate(6, twitter = $$props.twitter);
    		if ('facebook' in $$props) $$invalidate(7, facebook = $$props.facebook);
    		if ('openGraph' in $$props) $$invalidate(8, openGraph = $$props.openGraph);
    		if ('canonical' in $$props) $$invalidate(9, canonical = $$props.canonical);
    		if ('additionalMetaTags' in $$props) $$invalidate(10, additionalMetaTags = $$props.additionalMetaTags);
    		if ('additionalLinkTags' in $$props) $$invalidate(11, additionalLinkTags = $$props.additionalLinkTags);
    		if ('robotsParams' in $$props) $$invalidate(12, robotsParams = $$props.robotsParams);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		noindex,
    		nofollow,
    		description,
    		mobileAlternate,
    		languageAlternates,
    		twitter,
    		facebook,
    		openGraph,
    		canonical,
    		additionalMetaTags,
    		additionalLinkTags,
    		robotsParams,
    		robotsProps
    	];
    }

    class MetaTags extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				title: 0,
    				noindex: 1,
    				nofollow: 2,
    				robotsProps: 13,
    				description: 3,
    				mobileAlternate: 4,
    				languageAlternates: 5,
    				twitter: 6,
    				facebook: 7,
    				openGraph: 8,
    				canonical: 9,
    				additionalMetaTags: 10,
    				additionalLinkTags: 11
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MetaTags",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get title() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noindex() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noindex(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nofollow() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nofollow(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get robotsProps() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set robotsProps(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mobileAlternate() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mobileAlternate(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get languageAlternates() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set languageAlternates(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get twitter() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set twitter(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get facebook() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set facebook(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openGraph() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openGraph(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canonical() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canonical(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get additionalMetaTags() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set additionalMetaTags(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get additionalLinkTags() {
    		throw new Error("<MetaTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set additionalLinkTags(value) {
    		throw new Error("<MetaTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ProjectDetails.svelte generated by Svelte v3.44.1 */

    const { Error: Error_1, window: window_1 } = globals;
    const file$5 = "src\\components\\ProjectDetails.svelte";

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	return child_ctx;
    }

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[47] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[50] = list[i];
    	return child_ctx;
    }

    // (200:35) 
    function create_if_block_28(ctx) {
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
    			attr_dev(path0, "class", "fill svelte-1ytb52c");
    			attr_dev(path0, "opacity", ".1");
    			add_location(path0, file$5, 201, 4, 11110);
    			attr_dev(path1, "d", "M85.5569 84.9356L84.8498 85.6427L119.562 120.355L120.269 119.647L85.5569 84.9356Z");
    			attr_dev(path1, "class", "fill svelte-1ytb52c");
    			attr_dev(path1, "opacity", ".1");
    			add_location(path1, file$5, 202, 4, 11238);
    			attr_dev(path2, "d", "M35.5018 84.9993L34.7947 84.2922L-0.0606959 119.148L0.646411 119.855L35.5018 84.9993Z");
    			attr_dev(path2, "class", "fill svelte-1ytb52c");
    			attr_dev(path2, "opacity", ".1");
    			add_location(path2, file$5, 203, 4, 11363);
    			attr_dev(path3, "d", "M35.3523 36.1452L36.0594 35.4381L0.0606224 -0.560669L-0.646484 0.146438L35.3523 36.1452Z");
    			attr_dev(path3, "class", "fill svelte-1ytb52c");
    			attr_dev(path3, "opacity", ".1");
    			add_location(path3, file$5, 204, 4, 11492);
    			attr_dev(path4, "d", "M89.5 46V77C89.5 77.8284 88.8284 78.5 88 78.5H32C31.1716 78.5 30.5 77.8284 30.5 77V46C30.5 45.1716 31.1716 44.5 32 44.5H44.6667C45.6759 44.5 46.5862 43.8932 46.9744 42.9615L49.6987 36.4231C49.9316 35.8641 50.4778 35.5 51.0833 35.5H53.5H60H66.5H68.9167C69.5222 35.5 70.0684 35.8641 70.3013 36.4231L73.0256 42.9615C73.4138 43.8932 74.3241 44.5 75.3333 44.5H88C88.8284 44.5 89.5 45.1716 89.5 46Z");
    			attr_dev(path4, "opacity", ".5");
    			attr_dev(path4, "class", "stroke svelte-1ytb52c");
    			add_location(path4, file$5, 205, 4, 11624);
    			attr_dev(circle, "cx", "60");
    			attr_dev(circle, "cy", "60");
    			attr_dev(circle, "r", "9.5");
    			attr_dev(circle, "opacity", ".5");
    			attr_dev(circle, "class", "stroke svelte-1ytb52c");
    			add_location(circle, file$5, 206, 4, 12062);
    			attr_dev(svg, "class", "no-image icon svelte-1ytb52c");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			add_location(svg, file$5, 200, 3, 10951);
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
    		id: create_if_block_28.name,
    		type: "if",
    		source: "(200:35) ",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#if project.cover}
    function create_if_block_19(ctx) {
    	let div;
    	let div_class_value;

    	function select_block_type_1(ctx, dirty) {
    		if (/*lazyloader*/ ctx[8] !== undefined && /*$GlobalStore*/ ctx[21].a11y.darkMode && /*project*/ ctx[0].darkTheme) return create_if_block_20;
    		if (/*lazyloader*/ ctx[8] !== undefined) return create_if_block_24;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();

    			attr_dev(div, "class", div_class_value = "" + ((/*$GlobalStore*/ ctx[21].a11y.darkMode
    			? 'dark'
    			: 'light') + " flex flex-center" + " svelte-1ytb52c"));

    			add_location(div, file$5, 12, 3, 720);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty[0] & /*$GlobalStore*/ 2097152 && div_class_value !== (div_class_value = "" + ((/*$GlobalStore*/ ctx[21].a11y.darkMode
    			? 'dark'
    			: 'light') + " flex flex-center" + " svelte-1ytb52c"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(12:2) {#if project.cover}",
    		ctx
    	});

    	return block;
    }

    // (106:39) 
    function create_if_block_24(ctx) {
    	let if_block_anchor;

    	function select_block_type_4(ctx, dirty) {
    		if (/*$lazyloader*/ ctx[22].status === LazyLoadStatus.DONE) return create_if_block_25;
    		return create_else_block_5;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(106:39) ",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#if lazyloader !== undefined && $GlobalStore.a11y.darkMode && project.darkTheme}
    function create_if_block_20(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*$lazyloader*/ ctx[22].status === LazyLoadStatus.DONE) return create_if_block_21;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(14:4) {#if lazyloader !== undefined && $GlobalStore.a11y.darkMode && project.darkTheme}",
    		ctx
    	});

    	return block;
    }

    // (117:5) {:else}
    function create_else_block_5(ctx) {
    	let div0;
    	let t0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t1;
    	let div1;

    	function select_block_type_5(ctx, dirty) {
    		if (/*$lazyloader*/ ctx[22].status === LazyLoadStatus.LOADING) return create_if_block_26;
    		if (/*$lazyloader*/ ctx[22].status === LazyLoadStatus.ERR) return create_if_block_27;
    	}

    	let current_block_type = select_block_type_5(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "thumb bg-cover svelte-1ytb52c");
    			set_style(div0, "background-image", "url(projects/" + /*project*/ ctx[0].id + "/thumbnail.jpg)");
    			add_location(div0, file$5, 117, 6, 6236);
    			attr_dev(img, "class", "thumb image svelte-1ytb52c");
    			if (!src_url_equal(img.src, img_src_value = "projects/" + /*project*/ ctx[0].id + "/thumbnail.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*project*/ ctx[0].id + " thumbnail"));
    			add_location(img, file$5, 121, 6, 6364);
    			attr_dev(div1, "class", "lazyloader flex flex-center svelte-1ytb52c");
    			add_location(div1, file$5, 126, 6, 6501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1) {
    				set_style(div0, "background-image", "url(projects/" + /*project*/ ctx[0].id + "/thumbnail.jpg)");
    			}

    			if (dirty[0] & /*project*/ 1 && !src_url_equal(img.src, img_src_value = "projects/" + /*project*/ ctx[0].id + "/thumbnail.jpg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*project*/ 1 && img_alt_value !== (img_alt_value = "" + (/*project*/ ctx[0].id + " thumbnail"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (current_block_type !== (current_block_type = select_block_type_5(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_5.name,
    		type: "else",
    		source: "(117:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (107:5) {#if $lazyloader.status === LazyLoadStatus.DONE}
    function create_if_block_25(ctx) {
    	let div;
    	let t;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			img = element("img");
    			attr_dev(div, "class", "bg-cover svelte-1ytb52c");
    			set_style(div, "background-image", "url(projects/" + /*project*/ ctx[0].id + "/cover.png)");
    			add_location(div, file$5, 107, 6, 5981);
    			attr_dev(img, "class", "image svelte-1ytb52c");
    			if (!src_url_equal(img.src, img_src_value = "projects/" + /*project*/ ctx[0].id + "/cover.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*project*/ ctx[0].id + " cover"));
    			add_location(img, file$5, 111, 6, 6099);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1) {
    				set_style(div, "background-image", "url(projects/" + /*project*/ ctx[0].id + "/cover.png)");
    			}

    			if (dirty[0] & /*project*/ 1 && !src_url_equal(img.src, img_src_value = "projects/" + /*project*/ ctx[0].id + "/cover.png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*project*/ 1 && img_alt_value !== (img_alt_value = "" + (/*project*/ ctx[0].id + " cover"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(107:5) {#if $lazyloader.status === LazyLoadStatus.DONE}",
    		ctx
    	});

    	return block;
    }

    // (191:59) 
    function create_if_block_27(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z");
    			attr_dev(path, "class", "svelte-1ytb52c");
    			add_location(path, file$5, 192, 9, 10331);
    			attr_dev(svg, "class", "icon icon-error icon-large fill svelte-1ytb52c");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "fill", "none");
    			add_location(svg, file$5, 191, 8, 10206);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_27.name,
    		type: "if",
    		source: "(191:59) ",
    		ctx
    	});

    	return block;
    }

    // (128:7) {#if $lazyloader.status === LazyLoadStatus.LOADING}
    function create_if_block_26(ctx) {
    	let svg;
    	let g0;
    	let rect0;
    	let animate0;
    	let g1;
    	let rect1;
    	let animate1;
    	let g2;
    	let rect2;
    	let animate2;
    	let g3;
    	let rect3;
    	let animate3;
    	let g4;
    	let rect4;
    	let animate4;
    	let g5;
    	let rect5;
    	let animate5;
    	let g6;
    	let rect6;
    	let animate6;
    	let g7;
    	let rect7;
    	let animate7;
    	let g8;
    	let rect8;
    	let animate8;
    	let g9;
    	let rect9;
    	let animate9;
    	let g10;
    	let rect10;
    	let animate10;
    	let g11;
    	let rect11;
    	let animate11;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			rect0 = svg_element("rect");
    			animate0 = svg_element("animate");
    			g1 = svg_element("g");
    			rect1 = svg_element("rect");
    			animate1 = svg_element("animate");
    			g2 = svg_element("g");
    			rect2 = svg_element("rect");
    			animate2 = svg_element("animate");
    			g3 = svg_element("g");
    			rect3 = svg_element("rect");
    			animate3 = svg_element("animate");
    			g4 = svg_element("g");
    			rect4 = svg_element("rect");
    			animate4 = svg_element("animate");
    			g5 = svg_element("g");
    			rect5 = svg_element("rect");
    			animate5 = svg_element("animate");
    			g6 = svg_element("g");
    			rect6 = svg_element("rect");
    			animate6 = svg_element("animate");
    			g7 = svg_element("g");
    			rect7 = svg_element("rect");
    			animate7 = svg_element("animate");
    			g8 = svg_element("g");
    			rect8 = svg_element("rect");
    			animate8 = svg_element("animate");
    			g9 = svg_element("g");
    			rect9 = svg_element("rect");
    			animate9 = svg_element("animate");
    			g10 = svg_element("g");
    			rect10 = svg_element("rect");
    			animate10 = svg_element("animate");
    			g11 = svg_element("g");
    			rect11 = svg_element("rect");
    			animate11 = svg_element("animate");
    			attr_dev(animate0, "attributeName", "opacity");
    			attr_dev(animate0, "values", "1;0");
    			attr_dev(animate0, "keyTimes", "0;1");
    			attr_dev(animate0, "dur", "1s");
    			attr_dev(animate0, "begin", "-0.9166666666666666s");
    			attr_dev(animate0, "repeatCount", "indefinite");
    			add_location(animate0, file$5, 131, 11, 6909);
    			attr_dev(rect0, "x", "49");
    			attr_dev(rect0, "y", "7");
    			attr_dev(rect0, "rx", "0");
    			attr_dev(rect0, "ry", "0");
    			attr_dev(rect0, "width", "2");
    			attr_dev(rect0, "height", "26");
    			add_location(rect0, file$5, 130, 10, 6841);
    			attr_dev(g0, "transform", "rotate(0 50 50)");
    			attr_dev(g0, "class", "svelte-1ytb52c");
    			add_location(g0, file$5, 129, 9, 6798);
    			attr_dev(animate1, "attributeName", "opacity");
    			attr_dev(animate1, "values", "1;0");
    			attr_dev(animate1, "keyTimes", "0;1");
    			attr_dev(animate1, "dur", "1s");
    			attr_dev(animate1, "begin", "-0.8333333333333334s");
    			attr_dev(animate1, "repeatCount", "indefinite");
    			add_location(animate1, file$5, 136, 11, 7191);
    			attr_dev(rect1, "x", "49");
    			attr_dev(rect1, "y", "7");
    			attr_dev(rect1, "rx", "0");
    			attr_dev(rect1, "ry", "0");
    			attr_dev(rect1, "width", "2");
    			attr_dev(rect1, "height", "26");
    			add_location(rect1, file$5, 135, 10, 7123);
    			attr_dev(g1, "transform", "rotate(30 50 50)");
    			attr_dev(g1, "class", "svelte-1ytb52c");
    			add_location(g1, file$5, 134, 9, 7079);
    			attr_dev(animate2, "attributeName", "opacity");
    			attr_dev(animate2, "values", "1;0");
    			attr_dev(animate2, "keyTimes", "0;1");
    			attr_dev(animate2, "dur", "1s");
    			attr_dev(animate2, "begin", "-0.75s");
    			attr_dev(animate2, "repeatCount", "indefinite");
    			add_location(animate2, file$5, 141, 11, 7473);
    			attr_dev(rect2, "x", "49");
    			attr_dev(rect2, "y", "7");
    			attr_dev(rect2, "rx", "0");
    			attr_dev(rect2, "ry", "0");
    			attr_dev(rect2, "width", "2");
    			attr_dev(rect2, "height", "26");
    			add_location(rect2, file$5, 140, 10, 7405);
    			attr_dev(g2, "transform", "rotate(60 50 50)");
    			attr_dev(g2, "class", "svelte-1ytb52c");
    			add_location(g2, file$5, 139, 9, 7361);
    			attr_dev(animate3, "attributeName", "opacity");
    			attr_dev(animate3, "values", "1;0");
    			attr_dev(animate3, "keyTimes", "0;1");
    			attr_dev(animate3, "dur", "1s");
    			attr_dev(animate3, "begin", "-0.6666666666666666s");
    			attr_dev(animate3, "repeatCount", "indefinite");
    			add_location(animate3, file$5, 146, 11, 7741);
    			attr_dev(rect3, "x", "49");
    			attr_dev(rect3, "y", "7");
    			attr_dev(rect3, "rx", "0");
    			attr_dev(rect3, "ry", "0");
    			attr_dev(rect3, "width", "2");
    			attr_dev(rect3, "height", "26");
    			add_location(rect3, file$5, 145, 10, 7673);
    			attr_dev(g3, "transform", "rotate(90 50 50)");
    			attr_dev(g3, "class", "svelte-1ytb52c");
    			add_location(g3, file$5, 144, 9, 7629);
    			attr_dev(animate4, "attributeName", "opacity");
    			attr_dev(animate4, "values", "1;0");
    			attr_dev(animate4, "keyTimes", "0;1");
    			attr_dev(animate4, "dur", "1s");
    			attr_dev(animate4, "begin", "-0.5833333333333334s");
    			attr_dev(animate4, "repeatCount", "indefinite");
    			add_location(animate4, file$5, 151, 11, 8024);
    			attr_dev(rect4, "x", "49");
    			attr_dev(rect4, "y", "7");
    			attr_dev(rect4, "rx", "0");
    			attr_dev(rect4, "ry", "0");
    			attr_dev(rect4, "width", "2");
    			attr_dev(rect4, "height", "26");
    			add_location(rect4, file$5, 150, 10, 7956);
    			attr_dev(g4, "transform", "rotate(120 50 50)");
    			attr_dev(g4, "class", "svelte-1ytb52c");
    			add_location(g4, file$5, 149, 9, 7911);
    			attr_dev(animate5, "attributeName", "opacity");
    			attr_dev(animate5, "values", "1;0");
    			attr_dev(animate5, "keyTimes", "0;1");
    			attr_dev(animate5, "dur", "1s");
    			attr_dev(animate5, "begin", "-0.5s");
    			attr_dev(animate5, "repeatCount", "indefinite");
    			add_location(animate5, file$5, 156, 11, 8307);
    			attr_dev(rect5, "x", "49");
    			attr_dev(rect5, "y", "7");
    			attr_dev(rect5, "rx", "0");
    			attr_dev(rect5, "ry", "0");
    			attr_dev(rect5, "width", "2");
    			attr_dev(rect5, "height", "26");
    			add_location(rect5, file$5, 155, 10, 8239);
    			attr_dev(g5, "transform", "rotate(150 50 50)");
    			attr_dev(g5, "class", "svelte-1ytb52c");
    			add_location(g5, file$5, 154, 9, 8194);
    			attr_dev(animate6, "attributeName", "opacity");
    			attr_dev(animate6, "values", "1;0");
    			attr_dev(animate6, "keyTimes", "0;1");
    			attr_dev(animate6, "dur", "1s");
    			attr_dev(animate6, "begin", "-0.4166666666666667s");
    			attr_dev(animate6, "repeatCount", "indefinite");
    			add_location(animate6, file$5, 161, 11, 8575);
    			attr_dev(rect6, "x", "49");
    			attr_dev(rect6, "y", "7");
    			attr_dev(rect6, "rx", "0");
    			attr_dev(rect6, "ry", "0");
    			attr_dev(rect6, "width", "2");
    			attr_dev(rect6, "height", "26");
    			add_location(rect6, file$5, 160, 10, 8507);
    			attr_dev(g6, "transform", "rotate(180 50 50)");
    			attr_dev(g6, "class", "svelte-1ytb52c");
    			add_location(g6, file$5, 159, 9, 8462);
    			attr_dev(animate7, "attributeName", "opacity");
    			attr_dev(animate7, "values", "1;0");
    			attr_dev(animate7, "keyTimes", "0;1");
    			attr_dev(animate7, "dur", "1s");
    			attr_dev(animate7, "begin", "-0.3333333333333333s");
    			attr_dev(animate7, "repeatCount", "indefinite");
    			add_location(animate7, file$5, 166, 11, 8858);
    			attr_dev(rect7, "x", "49");
    			attr_dev(rect7, "y", "7");
    			attr_dev(rect7, "rx", "0");
    			attr_dev(rect7, "ry", "0");
    			attr_dev(rect7, "width", "2");
    			attr_dev(rect7, "height", "26");
    			add_location(rect7, file$5, 165, 10, 8790);
    			attr_dev(g7, "transform", "rotate(210 50 50)");
    			attr_dev(g7, "class", "svelte-1ytb52c");
    			add_location(g7, file$5, 164, 9, 8745);
    			attr_dev(animate8, "attributeName", "opacity");
    			attr_dev(animate8, "values", "1;0");
    			attr_dev(animate8, "keyTimes", "0;1");
    			attr_dev(animate8, "dur", "1s");
    			attr_dev(animate8, "begin", "-0.25s");
    			attr_dev(animate8, "repeatCount", "indefinite");
    			add_location(animate8, file$5, 171, 11, 9141);
    			attr_dev(rect8, "x", "49");
    			attr_dev(rect8, "y", "7");
    			attr_dev(rect8, "rx", "0");
    			attr_dev(rect8, "ry", "0");
    			attr_dev(rect8, "width", "2");
    			attr_dev(rect8, "height", "26");
    			add_location(rect8, file$5, 170, 10, 9073);
    			attr_dev(g8, "transform", "rotate(240 50 50)");
    			attr_dev(g8, "class", "svelte-1ytb52c");
    			add_location(g8, file$5, 169, 9, 9028);
    			attr_dev(animate9, "attributeName", "opacity");
    			attr_dev(animate9, "values", "1;0");
    			attr_dev(animate9, "keyTimes", "0;1");
    			attr_dev(animate9, "dur", "1s");
    			attr_dev(animate9, "begin", "-0.16666666666666666s");
    			attr_dev(animate9, "repeatCount", "indefinite");
    			add_location(animate9, file$5, 176, 11, 9410);
    			attr_dev(rect9, "x", "49");
    			attr_dev(rect9, "y", "7");
    			attr_dev(rect9, "rx", "0");
    			attr_dev(rect9, "ry", "0");
    			attr_dev(rect9, "width", "2");
    			attr_dev(rect9, "height", "26");
    			add_location(rect9, file$5, 175, 10, 9342);
    			attr_dev(g9, "transform", "rotate(270 50 50)");
    			attr_dev(g9, "class", "svelte-1ytb52c");
    			add_location(g9, file$5, 174, 9, 9297);
    			attr_dev(animate10, "attributeName", "opacity");
    			attr_dev(animate10, "values", "1;0");
    			attr_dev(animate10, "keyTimes", "0;1");
    			attr_dev(animate10, "dur", "1s");
    			attr_dev(animate10, "begin", "-0.08333333333333333s");
    			attr_dev(animate10, "repeatCount", "indefinite");
    			add_location(animate10, file$5, 181, 11, 9694);
    			attr_dev(rect10, "x", "49");
    			attr_dev(rect10, "y", "7");
    			attr_dev(rect10, "rx", "0");
    			attr_dev(rect10, "ry", "0");
    			attr_dev(rect10, "width", "2");
    			attr_dev(rect10, "height", "26");
    			add_location(rect10, file$5, 180, 10, 9626);
    			attr_dev(g10, "transform", "rotate(300 50 50)");
    			attr_dev(g10, "class", "svelte-1ytb52c");
    			add_location(g10, file$5, 179, 9, 9581);
    			attr_dev(animate11, "attributeName", "opacity");
    			attr_dev(animate11, "values", "1;0");
    			attr_dev(animate11, "keyTimes", "0;1");
    			attr_dev(animate11, "dur", "1s");
    			attr_dev(animate11, "begin", "0s");
    			attr_dev(animate11, "repeatCount", "indefinite");
    			add_location(animate11, file$5, 186, 11, 9978);
    			attr_dev(rect11, "x", "49");
    			attr_dev(rect11, "y", "7");
    			attr_dev(rect11, "rx", "0");
    			attr_dev(rect11, "ry", "0");
    			attr_dev(rect11, "width", "2");
    			attr_dev(rect11, "height", "26");
    			add_location(rect11, file$5, 185, 10, 9910);
    			attr_dev(g11, "transform", "rotate(330 50 50)");
    			attr_dev(g11, "class", "svelte-1ytb52c");
    			add_location(g11, file$5, 184, 9, 9865);
    			attr_dev(svg, "class", "icon icon-load icon-large fill svelte-1ytb52c");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid");
    			add_location(svg, file$5, 128, 8, 6612);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g0);
    			append_dev(g0, rect0);
    			append_dev(rect0, animate0);
    			append_dev(svg, g1);
    			append_dev(g1, rect1);
    			append_dev(rect1, animate1);
    			append_dev(svg, g2);
    			append_dev(g2, rect2);
    			append_dev(rect2, animate2);
    			append_dev(svg, g3);
    			append_dev(g3, rect3);
    			append_dev(rect3, animate3);
    			append_dev(svg, g4);
    			append_dev(g4, rect4);
    			append_dev(rect4, animate4);
    			append_dev(svg, g5);
    			append_dev(g5, rect5);
    			append_dev(rect5, animate5);
    			append_dev(svg, g6);
    			append_dev(g6, rect6);
    			append_dev(rect6, animate6);
    			append_dev(svg, g7);
    			append_dev(g7, rect7);
    			append_dev(rect7, animate7);
    			append_dev(svg, g8);
    			append_dev(g8, rect8);
    			append_dev(rect8, animate8);
    			append_dev(svg, g9);
    			append_dev(g9, rect9);
    			append_dev(rect9, animate9);
    			append_dev(svg, g10);
    			append_dev(g10, rect10);
    			append_dev(rect10, animate10);
    			append_dev(svg, g11);
    			append_dev(g11, rect11);
    			append_dev(rect11, animate11);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_26.name,
    		type: "if",
    		source: "(128:7) {#if $lazyloader.status === LazyLoadStatus.LOADING}",
    		ctx
    	});

    	return block;
    }

    // (25:5) {:else}
    function create_else_block_4(ctx) {
    	let div0;
    	let t0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t1;
    	let div1;

    	function select_block_type_3(ctx, dirty) {
    		if (/*$lazyloader*/ ctx[22].status === LazyLoadStatus.LOADING) return create_if_block_22;
    		if (/*$lazyloader*/ ctx[22].status === LazyLoadStatus.ERR) return create_if_block_23;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "thumb bg-cover svelte-1ytb52c");
    			set_style(div0, "background-image", "url(projects/" + /*project*/ ctx[0].id + "/thumbnail_dark.jpg)");
    			add_location(div0, file$5, 25, 6, 1211);
    			attr_dev(img, "class", "thumb image svelte-1ytb52c");
    			if (!src_url_equal(img.src, img_src_value = "projects/" + /*project*/ ctx[0].id + "/thumbnail_dark.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*project*/ ctx[0].id + " dark thumbnail"));
    			add_location(img, file$5, 29, 6, 1344);
    			attr_dev(div1, "class", "lazyloader flex flex-center svelte-1ytb52c");
    			add_location(div1, file$5, 34, 6, 1491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1) {
    				set_style(div0, "background-image", "url(projects/" + /*project*/ ctx[0].id + "/thumbnail_dark.jpg)");
    			}

    			if (dirty[0] & /*project*/ 1 && !src_url_equal(img.src, img_src_value = "projects/" + /*project*/ ctx[0].id + "/thumbnail_dark.jpg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*project*/ 1 && img_alt_value !== (img_alt_value = "" + (/*project*/ ctx[0].id + " dark thumbnail"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(25:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:5) {#if $lazyloader.status === LazyLoadStatus.DONE}
    function create_if_block_21(ctx) {
    	let div;
    	let t;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			img = element("img");
    			attr_dev(div, "class", "bg-cover svelte-1ytb52c");
    			set_style(div, "background-image", "url(projects/" + /*project*/ ctx[0].id + "/cover_dark.png)");
    			add_location(div, file$5, 15, 6, 946);
    			attr_dev(img, "class", "image svelte-1ytb52c");
    			if (!src_url_equal(img.src, img_src_value = "projects/" + /*project*/ ctx[0].id + "/cover_dark.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*project*/ ctx[0].id + " cover"));
    			add_location(img, file$5, 19, 6, 1069);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1) {
    				set_style(div, "background-image", "url(projects/" + /*project*/ ctx[0].id + "/cover_dark.png)");
    			}

    			if (dirty[0] & /*project*/ 1 && !src_url_equal(img.src, img_src_value = "projects/" + /*project*/ ctx[0].id + "/cover_dark.png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*project*/ 1 && img_alt_value !== (img_alt_value = "" + (/*project*/ ctx[0].id + " cover"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(15:5) {#if $lazyloader.status === LazyLoadStatus.DONE}",
    		ctx
    	});

    	return block;
    }

    // (99:59) 
    function create_if_block_23(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z");
    			attr_dev(path, "class", "svelte-1ytb52c");
    			add_location(path, file$5, 100, 9, 5321);
    			attr_dev(svg, "class", "icon icon-error icon-large fill svelte-1ytb52c");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "fill", "none");
    			add_location(svg, file$5, 99, 8, 5196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(99:59) ",
    		ctx
    	});

    	return block;
    }

    // (36:7) {#if $lazyloader.status === LazyLoadStatus.LOADING}
    function create_if_block_22(ctx) {
    	let svg;
    	let g0;
    	let rect0;
    	let animate0;
    	let g1;
    	let rect1;
    	let animate1;
    	let g2;
    	let rect2;
    	let animate2;
    	let g3;
    	let rect3;
    	let animate3;
    	let g4;
    	let rect4;
    	let animate4;
    	let g5;
    	let rect5;
    	let animate5;
    	let g6;
    	let rect6;
    	let animate6;
    	let g7;
    	let rect7;
    	let animate7;
    	let g8;
    	let rect8;
    	let animate8;
    	let g9;
    	let rect9;
    	let animate9;
    	let g10;
    	let rect10;
    	let animate10;
    	let g11;
    	let rect11;
    	let animate11;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			rect0 = svg_element("rect");
    			animate0 = svg_element("animate");
    			g1 = svg_element("g");
    			rect1 = svg_element("rect");
    			animate1 = svg_element("animate");
    			g2 = svg_element("g");
    			rect2 = svg_element("rect");
    			animate2 = svg_element("animate");
    			g3 = svg_element("g");
    			rect3 = svg_element("rect");
    			animate3 = svg_element("animate");
    			g4 = svg_element("g");
    			rect4 = svg_element("rect");
    			animate4 = svg_element("animate");
    			g5 = svg_element("g");
    			rect5 = svg_element("rect");
    			animate5 = svg_element("animate");
    			g6 = svg_element("g");
    			rect6 = svg_element("rect");
    			animate6 = svg_element("animate");
    			g7 = svg_element("g");
    			rect7 = svg_element("rect");
    			animate7 = svg_element("animate");
    			g8 = svg_element("g");
    			rect8 = svg_element("rect");
    			animate8 = svg_element("animate");
    			g9 = svg_element("g");
    			rect9 = svg_element("rect");
    			animate9 = svg_element("animate");
    			g10 = svg_element("g");
    			rect10 = svg_element("rect");
    			animate10 = svg_element("animate");
    			g11 = svg_element("g");
    			rect11 = svg_element("rect");
    			animate11 = svg_element("animate");
    			attr_dev(animate0, "attributeName", "opacity");
    			attr_dev(animate0, "values", "1;0");
    			attr_dev(animate0, "keyTimes", "0;1");
    			attr_dev(animate0, "dur", "1s");
    			attr_dev(animate0, "begin", "-0.9166666666666666s");
    			attr_dev(animate0, "repeatCount", "indefinite");
    			add_location(animate0, file$5, 39, 11, 1899);
    			attr_dev(rect0, "x", "49");
    			attr_dev(rect0, "y", "7");
    			attr_dev(rect0, "rx", "0");
    			attr_dev(rect0, "ry", "0");
    			attr_dev(rect0, "width", "2");
    			attr_dev(rect0, "height", "26");
    			add_location(rect0, file$5, 38, 10, 1831);
    			attr_dev(g0, "transform", "rotate(0 50 50)");
    			attr_dev(g0, "class", "svelte-1ytb52c");
    			add_location(g0, file$5, 37, 9, 1788);
    			attr_dev(animate1, "attributeName", "opacity");
    			attr_dev(animate1, "values", "1;0");
    			attr_dev(animate1, "keyTimes", "0;1");
    			attr_dev(animate1, "dur", "1s");
    			attr_dev(animate1, "begin", "-0.8333333333333334s");
    			attr_dev(animate1, "repeatCount", "indefinite");
    			add_location(animate1, file$5, 44, 11, 2181);
    			attr_dev(rect1, "x", "49");
    			attr_dev(rect1, "y", "7");
    			attr_dev(rect1, "rx", "0");
    			attr_dev(rect1, "ry", "0");
    			attr_dev(rect1, "width", "2");
    			attr_dev(rect1, "height", "26");
    			add_location(rect1, file$5, 43, 10, 2113);
    			attr_dev(g1, "transform", "rotate(30 50 50)");
    			attr_dev(g1, "class", "svelte-1ytb52c");
    			add_location(g1, file$5, 42, 9, 2069);
    			attr_dev(animate2, "attributeName", "opacity");
    			attr_dev(animate2, "values", "1;0");
    			attr_dev(animate2, "keyTimes", "0;1");
    			attr_dev(animate2, "dur", "1s");
    			attr_dev(animate2, "begin", "-0.75s");
    			attr_dev(animate2, "repeatCount", "indefinite");
    			add_location(animate2, file$5, 49, 11, 2463);
    			attr_dev(rect2, "x", "49");
    			attr_dev(rect2, "y", "7");
    			attr_dev(rect2, "rx", "0");
    			attr_dev(rect2, "ry", "0");
    			attr_dev(rect2, "width", "2");
    			attr_dev(rect2, "height", "26");
    			add_location(rect2, file$5, 48, 10, 2395);
    			attr_dev(g2, "transform", "rotate(60 50 50)");
    			attr_dev(g2, "class", "svelte-1ytb52c");
    			add_location(g2, file$5, 47, 9, 2351);
    			attr_dev(animate3, "attributeName", "opacity");
    			attr_dev(animate3, "values", "1;0");
    			attr_dev(animate3, "keyTimes", "0;1");
    			attr_dev(animate3, "dur", "1s");
    			attr_dev(animate3, "begin", "-0.6666666666666666s");
    			attr_dev(animate3, "repeatCount", "indefinite");
    			add_location(animate3, file$5, 54, 11, 2731);
    			attr_dev(rect3, "x", "49");
    			attr_dev(rect3, "y", "7");
    			attr_dev(rect3, "rx", "0");
    			attr_dev(rect3, "ry", "0");
    			attr_dev(rect3, "width", "2");
    			attr_dev(rect3, "height", "26");
    			add_location(rect3, file$5, 53, 10, 2663);
    			attr_dev(g3, "transform", "rotate(90 50 50)");
    			attr_dev(g3, "class", "svelte-1ytb52c");
    			add_location(g3, file$5, 52, 9, 2619);
    			attr_dev(animate4, "attributeName", "opacity");
    			attr_dev(animate4, "values", "1;0");
    			attr_dev(animate4, "keyTimes", "0;1");
    			attr_dev(animate4, "dur", "1s");
    			attr_dev(animate4, "begin", "-0.5833333333333334s");
    			attr_dev(animate4, "repeatCount", "indefinite");
    			add_location(animate4, file$5, 59, 11, 3014);
    			attr_dev(rect4, "x", "49");
    			attr_dev(rect4, "y", "7");
    			attr_dev(rect4, "rx", "0");
    			attr_dev(rect4, "ry", "0");
    			attr_dev(rect4, "width", "2");
    			attr_dev(rect4, "height", "26");
    			add_location(rect4, file$5, 58, 10, 2946);
    			attr_dev(g4, "transform", "rotate(120 50 50)");
    			attr_dev(g4, "class", "svelte-1ytb52c");
    			add_location(g4, file$5, 57, 9, 2901);
    			attr_dev(animate5, "attributeName", "opacity");
    			attr_dev(animate5, "values", "1;0");
    			attr_dev(animate5, "keyTimes", "0;1");
    			attr_dev(animate5, "dur", "1s");
    			attr_dev(animate5, "begin", "-0.5s");
    			attr_dev(animate5, "repeatCount", "indefinite");
    			add_location(animate5, file$5, 64, 11, 3297);
    			attr_dev(rect5, "x", "49");
    			attr_dev(rect5, "y", "7");
    			attr_dev(rect5, "rx", "0");
    			attr_dev(rect5, "ry", "0");
    			attr_dev(rect5, "width", "2");
    			attr_dev(rect5, "height", "26");
    			add_location(rect5, file$5, 63, 10, 3229);
    			attr_dev(g5, "transform", "rotate(150 50 50)");
    			attr_dev(g5, "class", "svelte-1ytb52c");
    			add_location(g5, file$5, 62, 9, 3184);
    			attr_dev(animate6, "attributeName", "opacity");
    			attr_dev(animate6, "values", "1;0");
    			attr_dev(animate6, "keyTimes", "0;1");
    			attr_dev(animate6, "dur", "1s");
    			attr_dev(animate6, "begin", "-0.4166666666666667s");
    			attr_dev(animate6, "repeatCount", "indefinite");
    			add_location(animate6, file$5, 69, 11, 3565);
    			attr_dev(rect6, "x", "49");
    			attr_dev(rect6, "y", "7");
    			attr_dev(rect6, "rx", "0");
    			attr_dev(rect6, "ry", "0");
    			attr_dev(rect6, "width", "2");
    			attr_dev(rect6, "height", "26");
    			add_location(rect6, file$5, 68, 10, 3497);
    			attr_dev(g6, "transform", "rotate(180 50 50)");
    			attr_dev(g6, "class", "svelte-1ytb52c");
    			add_location(g6, file$5, 67, 9, 3452);
    			attr_dev(animate7, "attributeName", "opacity");
    			attr_dev(animate7, "values", "1;0");
    			attr_dev(animate7, "keyTimes", "0;1");
    			attr_dev(animate7, "dur", "1s");
    			attr_dev(animate7, "begin", "-0.3333333333333333s");
    			attr_dev(animate7, "repeatCount", "indefinite");
    			add_location(animate7, file$5, 74, 11, 3848);
    			attr_dev(rect7, "x", "49");
    			attr_dev(rect7, "y", "7");
    			attr_dev(rect7, "rx", "0");
    			attr_dev(rect7, "ry", "0");
    			attr_dev(rect7, "width", "2");
    			attr_dev(rect7, "height", "26");
    			add_location(rect7, file$5, 73, 10, 3780);
    			attr_dev(g7, "transform", "rotate(210 50 50)");
    			attr_dev(g7, "class", "svelte-1ytb52c");
    			add_location(g7, file$5, 72, 9, 3735);
    			attr_dev(animate8, "attributeName", "opacity");
    			attr_dev(animate8, "values", "1;0");
    			attr_dev(animate8, "keyTimes", "0;1");
    			attr_dev(animate8, "dur", "1s");
    			attr_dev(animate8, "begin", "-0.25s");
    			attr_dev(animate8, "repeatCount", "indefinite");
    			add_location(animate8, file$5, 79, 11, 4131);
    			attr_dev(rect8, "x", "49");
    			attr_dev(rect8, "y", "7");
    			attr_dev(rect8, "rx", "0");
    			attr_dev(rect8, "ry", "0");
    			attr_dev(rect8, "width", "2");
    			attr_dev(rect8, "height", "26");
    			add_location(rect8, file$5, 78, 10, 4063);
    			attr_dev(g8, "transform", "rotate(240 50 50)");
    			attr_dev(g8, "class", "svelte-1ytb52c");
    			add_location(g8, file$5, 77, 9, 4018);
    			attr_dev(animate9, "attributeName", "opacity");
    			attr_dev(animate9, "values", "1;0");
    			attr_dev(animate9, "keyTimes", "0;1");
    			attr_dev(animate9, "dur", "1s");
    			attr_dev(animate9, "begin", "-0.16666666666666666s");
    			attr_dev(animate9, "repeatCount", "indefinite");
    			add_location(animate9, file$5, 84, 11, 4400);
    			attr_dev(rect9, "x", "49");
    			attr_dev(rect9, "y", "7");
    			attr_dev(rect9, "rx", "0");
    			attr_dev(rect9, "ry", "0");
    			attr_dev(rect9, "width", "2");
    			attr_dev(rect9, "height", "26");
    			add_location(rect9, file$5, 83, 10, 4332);
    			attr_dev(g9, "transform", "rotate(270 50 50)");
    			attr_dev(g9, "class", "svelte-1ytb52c");
    			add_location(g9, file$5, 82, 9, 4287);
    			attr_dev(animate10, "attributeName", "opacity");
    			attr_dev(animate10, "values", "1;0");
    			attr_dev(animate10, "keyTimes", "0;1");
    			attr_dev(animate10, "dur", "1s");
    			attr_dev(animate10, "begin", "-0.08333333333333333s");
    			attr_dev(animate10, "repeatCount", "indefinite");
    			add_location(animate10, file$5, 89, 11, 4684);
    			attr_dev(rect10, "x", "49");
    			attr_dev(rect10, "y", "7");
    			attr_dev(rect10, "rx", "0");
    			attr_dev(rect10, "ry", "0");
    			attr_dev(rect10, "width", "2");
    			attr_dev(rect10, "height", "26");
    			add_location(rect10, file$5, 88, 10, 4616);
    			attr_dev(g10, "transform", "rotate(300 50 50)");
    			attr_dev(g10, "class", "svelte-1ytb52c");
    			add_location(g10, file$5, 87, 9, 4571);
    			attr_dev(animate11, "attributeName", "opacity");
    			attr_dev(animate11, "values", "1;0");
    			attr_dev(animate11, "keyTimes", "0;1");
    			attr_dev(animate11, "dur", "1s");
    			attr_dev(animate11, "begin", "0s");
    			attr_dev(animate11, "repeatCount", "indefinite");
    			add_location(animate11, file$5, 94, 11, 4968);
    			attr_dev(rect11, "x", "49");
    			attr_dev(rect11, "y", "7");
    			attr_dev(rect11, "rx", "0");
    			attr_dev(rect11, "ry", "0");
    			attr_dev(rect11, "width", "2");
    			attr_dev(rect11, "height", "26");
    			add_location(rect11, file$5, 93, 10, 4900);
    			attr_dev(g11, "transform", "rotate(330 50 50)");
    			attr_dev(g11, "class", "svelte-1ytb52c");
    			add_location(g11, file$5, 92, 9, 4855);
    			attr_dev(svg, "class", "icon icon-load icon-large fill svelte-1ytb52c");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid");
    			add_location(svg, file$5, 36, 8, 1602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g0);
    			append_dev(g0, rect0);
    			append_dev(rect0, animate0);
    			append_dev(svg, g1);
    			append_dev(g1, rect1);
    			append_dev(rect1, animate1);
    			append_dev(svg, g2);
    			append_dev(g2, rect2);
    			append_dev(rect2, animate2);
    			append_dev(svg, g3);
    			append_dev(g3, rect3);
    			append_dev(rect3, animate3);
    			append_dev(svg, g4);
    			append_dev(g4, rect4);
    			append_dev(rect4, animate4);
    			append_dev(svg, g5);
    			append_dev(g5, rect5);
    			append_dev(rect5, animate5);
    			append_dev(svg, g6);
    			append_dev(g6, rect6);
    			append_dev(rect6, animate6);
    			append_dev(svg, g7);
    			append_dev(g7, rect7);
    			append_dev(rect7, animate7);
    			append_dev(svg, g8);
    			append_dev(g8, rect8);
    			append_dev(rect8, animate8);
    			append_dev(svg, g9);
    			append_dev(g9, rect9);
    			append_dev(rect9, animate9);
    			append_dev(svg, g10);
    			append_dev(g10, rect10);
    			append_dev(rect10, animate10);
    			append_dev(svg, g11);
    			append_dev(g11, rect11);
    			append_dev(rect11, animate11);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(36:7) {#if $lazyloader.status === LazyLoadStatus.LOADING}",
    		ctx
    	});

    	return block;
    }

    // (226:43) 
    function create_if_block_18(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "logo svelte-1ytb52c");
    			if (!src_url_equal(img.src, img_src_value = "technologies/logo_" + /*techno*/ ctx[50] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*techno*/ ctx[50] + " Logo"));
    			add_location(img, file$5, 226, 7, 12955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1 && !src_url_equal(img.src, img_src_value = "technologies/logo_" + /*techno*/ ctx[50] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*project*/ 1 && img_alt_value !== (img_alt_value = "" + (/*techno*/ ctx[50] + " Logo"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(226:43) ",
    		ctx
    	});

    	return block;
    }

    // (221:6) {#if technologies[techno].icon}
    function create_if_block_17(ctx) {
    	let svg;
    	let title;
    	let t0_value = /*techno*/ ctx[50] + "";
    	let t0;
    	let t1;
    	let use;
    	let use_xlink_href_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			t1 = text(" Logo");
    			use = svg_element("use");
    			add_location(title, file$5, 222, 8, 12814);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#LOGO_" + /*techno*/ ctx[50]);
    			add_location(use, file$5, 223, 8, 12852);
    			attr_dev(svg, "class", "logo svelte-1ytb52c");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$5, 221, 7, 12729);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			append_dev(svg, use);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1 && t0_value !== (t0_value = /*techno*/ ctx[50] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*project*/ 1 && use_xlink_href_value !== (use_xlink_href_value = "#LOGO_" + /*techno*/ ctx[50])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(221:6) {#if technologies[techno].icon}",
    		ctx
    	});

    	return block;
    }

    // (215:4) {#each project.usedTechnologies as techno}
    function create_each_block_3$1(ctx) {
    	let a;
    	let div;
    	let t0;
    	let t1;
    	let span;
    	let t2_value = technologies[/*techno*/ ctx[50]].name + "";
    	let t2;
    	let t3;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	function select_block_type_6(ctx, dirty) {
    		if (technologies[/*techno*/ ctx[50]].icon) return create_if_block_17;
    		if (technologies[/*techno*/ ctx[50]].image) return create_if_block_18;
    	}

    	let current_block_type = select_block_type_6(ctx);
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
    			attr_dev(div, "class", "color svelte-1ytb52c");
    			set_style(div, "background-color", technologies[/*techno*/ ctx[50]].color);
    			add_location(div, file$5, 216, 6, 12582);
    			attr_dev(span, "class", "name svelte-1ytb52c");
    			add_location(span, file$5, 232, 6, 13088);
    			attr_dev(a, "href", a_href_value = technologies[/*techno*/ ctx[50]].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "role", "listitem");
    			attr_dev(a, "class", "techno flex flex-center gap-05 svelte-1ytb52c");
    			add_location(a, file$5, 215, 5, 12451);
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
    				dispose = action_destroyer(vibrateLink.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1) {
    				set_style(div, "background-color", technologies[/*techno*/ ctx[50]].color);
    			}

    			if (current_block_type === (current_block_type = select_block_type_6(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(a, t1);
    				}
    			}

    			if (dirty[0] & /*project*/ 1 && t2_value !== (t2_value = technologies[/*techno*/ ctx[50]].name + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*project*/ 1 && a_href_value !== (a_href_value = technologies[/*techno*/ ctx[50]].link)) {
    				attr_dev(a, "href", a_href_value);
    			}
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
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(215:4) {#each project.usedTechnologies as techno}",
    		ctx
    	});

    	return block;
    }

    // (241:3) {#if Array.isArray(project.otherLinks)}
    function create_if_block_16(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*project*/ ctx[0].otherLinks;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project, $_*/ 1048577) {
    				each_value_2 = /*project*/ ctx[0].otherLinks;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(241:3) {#if Array.isArray(project.otherLinks)}",
    		ctx
    	});

    	return block;
    }

    // (242:4) {#each project.otherLinks as link}
    function create_each_block_2$1(ctx) {
    	let a;
    	let svg;
    	let path;
    	let t0;
    	let span;
    	let t1_value = /*$_*/ ctx[20](/*link*/ ctx[47].name) + "";
    	let t1;
    	let t2;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(path, "d", "M34.2893 54.7108L19.0614 69.9387C10.6513 78.3489 10.6513 91.9844 19.0614 100.395C27.4716 108.805 41.1071 108.805 49.5173 100.395L64.7452 85.1667C73.1553 76.7565 73.1553 63.121 64.7452 54.7108M85.0491 64.8628L100.277 49.6348C108.687 41.2247 108.687 27.5891 100.277 19.179C91.8669 10.7688 78.2313 10.7688 69.8212 19.179L54.5932 34.4069C52.0762 36.924 50.3124 39.9091 49.302 43.0821C46.9364 50.5109 48.7001 58.9697 54.5932 64.8628");
    			attr_dev(path, "stroke-width", ".5rem");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "class", "svelte-1ytb52c");
    			add_location(path, file$5, 244, 7, 13682);
    			attr_dev(svg, "class", "icon icon-default stroke svelte-1ytb52c");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$5, 243, 6, 13509);
    			attr_dev(span, "class", "label svelte-1ytb52c");
    			add_location(span, file$5, 246, 6, 14211);
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[47].url);
    			attr_dev(a, "role", "button");
    			attr_dev(a, "class", "other-link flex flex-center gap-05 svelte-1ytb52c");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$5, 242, 5, 13393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path);
    			append_dev(a, t0);
    			append_dev(a, span);
    			append_dev(span, t1);
    			append_dev(a, t2);

    			if (!mounted) {
    				dispose = action_destroyer(vibrateLink.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_, project*/ 1048577 && t1_value !== (t1_value = /*$_*/ ctx[20](/*link*/ ctx[47].name) + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*project*/ 1 && a_href_value !== (a_href_value = /*link*/ ctx[47].url)) {
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
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(242:4) {#each project.otherLinks as link}",
    		ctx
    	});

    	return block;
    }

    // (251:3) {#if project.codeUrl}
    function create_if_block_15(ctx) {
    	let a;
    	let svg;
    	let path;
    	let t0;
    	let span;
    	let t1_value = /*$_*/ ctx[20]('project_source_code') + "";
    	let t1;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(path, "d", "M42.0439 53.512L17.2039 62.8L42.0439 72.088V79.576L8.85188 66.688V58.912L42.0439 46.024V53.512ZM68.2406 27.376H76.3046L52.5446 95.2H44.4806L68.2406 27.376ZM111.231 58.912V66.688L78.0394 79.576V72.088L102.879 62.8L78.0394 53.512V46.024L111.231 58.912Z");
    			attr_dev(path, "class", "svelte-1ytb52c");
    			add_location(path, file$5, 253, 6, 14616);
    			attr_dev(svg, "class", "icon fill icon-medium svelte-1ytb52c");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$5, 252, 5, 14447);
    			attr_dev(span, "class", "label svelte-1ytb52c");
    			add_location(span, file$5, 255, 5, 14898);
    			attr_dev(a, "href", a_href_value = /*project*/ ctx[0].codeUrl);
    			attr_dev(a, "role", "button");
    			attr_dev(a, "class", "open-source-code flex flex-center gap-05 svelte-1ytb52c");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$5, 251, 4, 14319);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path);
    			append_dev(a, t0);
    			append_dev(a, span);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = action_destroyer(vibrateLink.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t1_value !== (t1_value = /*$_*/ ctx[20]('project_source_code') + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*project*/ 1 && a_href_value !== (a_href_value = /*project*/ ctx[0].codeUrl)) {
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
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(251:3) {#if project.codeUrl}",
    		ctx
    	});

    	return block;
    }

    // (259:3) {#if project.codeUrl === null}
    function create_if_block_14(ctx) {
    	let div;
    	let svg;
    	let path0;
    	let path1;
    	let line;
    	let t0;
    	let span;
    	let t1_value = /*$_*/ ctx[20]('project_closed_source') + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			line = svg_element("line");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(path0, "d", "M16.5 53C16.5 49.4101 19.4101 46.5 23 46.5H60H97C100.59 46.5 103.5 49.4101 103.5 53V97C103.5 100.59 100.59 103.5 97 103.5H23C19.4101 103.5 16.5 100.59 16.5 97V53Z");
    			attr_dev(path0, "stroke-width", ".5rem");
    			attr_dev(path0, "class", "svelte-1ytb52c");
    			add_location(path0, file$5, 261, 6, 15243);
    			attr_dev(path1, "d", "M78 45V33C78 23.0589 69.9411 15 60 15V15C50.0589 15 42 23.0589 42 33V45");
    			attr_dev(path1, "stroke-width", ".5rem");
    			attr_dev(path1, "class", "svelte-1ytb52c");
    			add_location(path1, file$5, 262, 6, 15446);
    			attr_dev(line, "x1", "60");
    			attr_dev(line, "y1", "67");
    			attr_dev(line, "x2", "60");
    			attr_dev(line, "y2", "83");
    			attr_dev(line, "stroke-width", ".6rem");
    			attr_dev(line, "stroke-linecap", "round");
    			attr_dev(line, "stroke-linejoin", "round");
    			attr_dev(line, "class", "svelte-1ytb52c");
    			add_location(line, file$5, 263, 6, 15558);
    			attr_dev(svg, "class", "icon stroke icon-default svelte-1ytb52c");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$5, 260, 5, 15071);
    			attr_dev(span, "class", "label svelte-1ytb52c");
    			add_location(span, file$5, 265, 5, 15685);
    			attr_dev(div, "class", "closed-source flex flex-center gap-05 svelte-1ytb52c");
    			add_location(div, file$5, 259, 4, 15013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, line);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t1_value !== (t1_value = /*$_*/ ctx[20]('project_closed_source') + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(259:3) {#if project.codeUrl === null}",
    		ctx
    	});

    	return block;
    }

    // (278:50) 
    function create_if_block_13(ctx) {
    	let div;
    	let span;
    	let t0_value = /*$_*/ ctx[20]('project_coming_soon') + "";
    	let t0;
    	let t1;
    	let svg;
    	let circle;
    	let path;
    	let div_href_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			path = svg_element("path");
    			attr_dev(span, "class", "label svelte-1ytb52c");
    			add_location(span, file$5, 279, 5, 16715);
    			attr_dev(circle, "cx", "60");
    			attr_dev(circle, "cy", "60");
    			attr_dev(circle, "r", "53");
    			attr_dev(circle, "stroke-width", ".5rem");
    			attr_dev(circle, "class", "svelte-1ytb52c");
    			add_location(circle, file$5, 281, 6, 16947);
    			attr_dev(path, "d", "M60 23V60L77 73");
    			attr_dev(path, "stroke-width", ".5rem");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "class", "svelte-1ytb52c");
    			add_location(path, file$5, 282, 6, 17008);
    			attr_dev(svg, "class", "icon stroke icon-medium svelte-1ytb52c");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$5, 280, 5, 16776);
    			attr_dev(div, "href", div_href_value = /*project*/ ctx[0].projectUrl);
    			attr_dev(div, "class", "open-project-soon flex flex-center gap-05 svelte-1ytb52c");
    			add_location(div, file$5, 278, 4, 16627);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t0_value !== (t0_value = /*$_*/ ctx[20]('project_coming_soon') + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*project*/ 1 && div_href_value !== (div_href_value = /*project*/ ctx[0].projectUrl)) {
    				attr_dev(div, "href", div_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(278:50) ",
    		ctx
    	});

    	return block;
    }

    // (269:3) {#if project.projectUrl !== null && project.projectUrl !== 'COMING_SOON'}
    function create_if_block_12(ctx) {
    	let a;
    	let div;
    	let t0;
    	let span;
    	let t1_value = /*$_*/ ctx[20]('open_project') + "";
    	let t1;
    	let t2;
    	let svg;
    	let path0;
    	let path1;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(div, "class", "shine svelte-1ytb52c");
    			add_location(div, file$5, 270, 5, 15974);
    			attr_dev(span, "class", "label svelte-1ytb52c");
    			add_location(span, file$5, 271, 5, 16001);
    			attr_dev(path0, "d", "M57.7778 25H35C29.4772 25 25 29.4772 25 35V85C25 90.5228 29.4772 95 35 95H85C90.5228 95 95 90.5228 95 85V62.2222");
    			attr_dev(path0, "stroke-width", ".5rem");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "class", "svelte-1ytb52c");
    			add_location(path0, file$5, 273, 6, 16226);
    			attr_dev(path1, "d", "M105 15L60 60M105 15L105 45M105 15L75 15");
    			attr_dev(path1, "stroke-width", ".5rem");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "class", "svelte-1ytb52c");
    			add_location(path1, file$5, 274, 6, 16426);
    			attr_dev(svg, "class", "icon stroke icon-medium svelte-1ytb52c");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$5, 272, 5, 16055);
    			attr_dev(a, "href", a_href_value = /*project*/ ctx[0].projectUrl);
    			attr_dev(a, "role", "button");
    			attr_dev(a, "class", "open-project flex flex-center gap-05 svelte-1ytb52c");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$5, 269, 4, 15847);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(a, t0);
    			append_dev(a, span);
    			append_dev(span, t1);
    			append_dev(a, t2);
    			append_dev(a, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);

    			if (!mounted) {
    				dispose = action_destroyer(vibrateLink.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t1_value !== (t1_value = /*$_*/ ctx[20]('open_project') + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*project*/ 1 && a_href_value !== (a_href_value = /*project*/ ctx[0].projectUrl)) {
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
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(269:3) {#if project.projectUrl !== null && project.projectUrl !== 'COMING_SOON'}",
    		ctx
    	});

    	return block;
    }

    // (289:1) {#if project.about}
    function create_if_block$5(ctx) {
    	let div0;
    	let hr0;
    	let t0;
    	let t1;
    	let hr1;
    	let t2;
    	let div4;
    	let div3;
    	let span0;
    	let t3_value = /*$_*/ ctx[20]('share') + "";
    	let t3;
    	let t4;
    	let t5;
    	let button0;
    	let div1;
    	let span1;
    	let t6;
    	let statusicon0;
    	let t7;
    	let svg0;
    	let path0;
    	let t8;
    	let span2;
    	let t9_value = /*$_*/ ctx[20]('copy_url') + "";
    	let t9;
    	let t10;
    	let button1;
    	let div2;
    	let span3;
    	let t11;
    	let statusicon1;
    	let t12;
    	let svg1;
    	let path1;
    	let t13;
    	let span4;
    	let t14_value = /*$_*/ ctx[20]('share_with') + "";
    	let t14;
    	let t15;
    	let button2;
    	let svg2;
    	let path2;
    	let t16;
    	let span5;
    	let t17_value = /*$_*/ ctx[20]('close') + "";
    	let t17;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type_8(ctx, dirty) {
    		if (/*projectAbout*/ ctx[4] !== null && !(/*projectAbout*/ ctx[4] instanceof Error)) return create_if_block_6$1;
    		if (!/*aboutAvailableInCurrentLocale*/ ctx[17] && !/*isLoadingAbout*/ ctx[5]) return create_if_block_10;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_8(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_10(ctx, dirty) {
    		if (/*shareURLWasCanceled*/ ctx[10]) return create_if_block_4$1;
    		if (/*shareURLWasSuccess*/ ctx[11]) return create_if_block_5$1;
    		return create_else_block_1$2;
    	}

    	let current_block_type_1 = select_block_type_10(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	statusicon0 = new StatusIcon({
    			props: {
    				loading: /*userIsSharingURL*/ ctx[9],
    				failed: /*shareURLWasCanceled*/ ctx[10],
    				succeeded: /*shareURLWasSuccess*/ ctx[11]
    			},
    			$$inline: true
    		});

    	function select_block_type_11(ctx, dirty) {
    		if (/*shareNotSupported*/ ctx[14]) return create_if_block_1$3;
    		if (/*shareWasCanceled*/ ctx[13]) return create_if_block_2$3;
    		if (/*shareWasSuccess*/ ctx[15]) return create_if_block_3$1;
    		return create_else_block$4;
    	}

    	let current_block_type_2 = select_block_type_11(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	statusicon1 = new StatusIcon({
    			props: {
    				loading: /*userIsSharing*/ ctx[12],
    				failed: /*shareWasCanceled*/ ctx[13] || /*shareNotSupported*/ ctx[14],
    				succeeded: /*shareWasSuccess*/ ctx[15]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			hr0 = element("hr");
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			hr1 = element("hr");
    			t2 = space();
    			div4 = element("div");
    			div3 = element("div");
    			span0 = element("span");
    			t3 = text(t3_value);
    			t4 = text(":");
    			t5 = space();
    			button0 = element("button");
    			div1 = element("div");
    			span1 = element("span");
    			if_block1.c();
    			t6 = space();
    			create_component(statusicon0.$$.fragment);
    			t7 = space();
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t8 = space();
    			span2 = element("span");
    			t9 = text(t9_value);
    			t10 = space();
    			button1 = element("button");
    			div2 = element("div");
    			span3 = element("span");
    			if_block2.c();
    			t11 = space();
    			create_component(statusicon1.$$.fragment);
    			t12 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t13 = space();
    			span4 = element("span");
    			t14 = text(t14_value);
    			t15 = space();
    			button2 = element("button");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t16 = space();
    			span5 = element("span");
    			t17 = text(t17_value);
    			attr_dev(hr0, "class", "seperator top svelte-1ytb52c");
    			add_location(hr0, file$5, 290, 3, 17245);
    			attr_dev(hr1, "class", "seperator bot svelte-1ytb52c");
    			add_location(hr1, file$5, 354, 3, 20580);
    			attr_dev(div0, "class", "about svelte-1ytb52c");
    			toggle_class(div0, "loading", /*projectAbout*/ ctx[4] !== null);
    			add_location(div0, file$5, 289, 2, 17183);
    			attr_dev(span0, "class", "label svelte-1ytb52c");
    			add_location(span0, file$5, 358, 4, 20714);
    			attr_dev(span1, "class", "label svelte-1ytb52c");
    			add_location(span1, file$5, 365, 6, 21017);
    			attr_dev(div1, "class", "status grid gap-05 grid-center-x svelte-1ytb52c");
    			attr_dev(div1, "role", "alert");
    			toggle_class(div1, "active", /*userIsSharingURL*/ ctx[9]);
    			add_location(div1, file$5, 364, 5, 20918);
    			attr_dev(path0, "d", "M34.2893 54.7108L19.0614 69.9387C10.6513 78.3489 10.6513 91.9844 19.0614 100.395C27.4716 108.805 41.1071 108.805 49.5173 100.395L64.7452 85.1667C73.1553 76.7565 73.1553 63.121 64.7452 54.7108M85.0491 64.8628L100.277 49.6348C108.687 41.2247 108.687 27.5891 100.277 19.179C91.8669 10.7688 78.2313 10.7688 69.8212 19.179L54.5932 34.4069C52.0762 36.924 50.3124 39.9091 49.302 43.0821C46.9364 50.5109 48.7001 58.9697 54.5932 64.8628");
    			attr_dev(path0, "stroke-width", ".5rem");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "class", "svelte-1ytb52c");
    			add_location(path0, file$5, 381, 6, 21589);
    			attr_dev(svg0, "class", "icon icon-default stroke svelte-1ytb52c");
    			attr_dev(svg0, "viewBox", "0 0 120 120");
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "focusable", "false");
    			attr_dev(svg0, "role", "presentation");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$5, 380, 5, 21417);
    			attr_dev(span2, "class", "label svelte-1ytb52c");
    			add_location(span2, file$5, 383, 5, 22116);
    			attr_dev(button0, "role", "button");
    			attr_dev(button0, "class", "share-option flex flex-center gap-05 nowrap svelte-1ytb52c");
    			toggle_class(button0, "is-sharing", /*userIsSharingURL*/ ctx[9]);
    			add_location(button0, file$5, 359, 4, 20761);
    			attr_dev(span3, "class", "label svelte-1ytb52c");
    			add_location(span3, file$5, 391, 6, 22431);
    			attr_dev(div2, "class", "status grid gap-05 grid-center-x svelte-1ytb52c");
    			attr_dev(div2, "role", "alert");
    			toggle_class(div2, "active", /*userIsSharing*/ ctx[12]);
    			add_location(div2, file$5, 390, 5, 22335);
    			attr_dev(path1, "d", "M45.25 40H35C29.4772 40 25 44.4772 25 50V100C25 105.523 29.4772 110 35 110H85C90.5229 110 95 105.523 95 100V50C95 44.4772 90.5229 40 85 40H74.75M60.5 10V70M60.5 10L77 26.5M60.5 10L44 26.5");
    			attr_dev(path1, "stroke-width", ".5rem");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "class", "svelte-1ytb52c");
    			add_location(path1, file$5, 409, 6, 23061);
    			attr_dev(svg1, "class", "icon stroke icon-default svelte-1ytb52c");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 120 120");
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "focusable", "false");
    			attr_dev(svg1, "role", "presentation");
    			attr_dev(svg1, "fill", "none");
    			add_location(svg1, file$5, 408, 5, 22889);
    			attr_dev(span4, "class", "label svelte-1ytb52c");
    			add_location(span4, file$5, 411, 5, 23348);
    			attr_dev(button1, "role", "button");
    			attr_dev(button1, "class", "share-option flex flex-center gap-05 nowrap svelte-1ytb52c");
    			toggle_class(button1, "is-sharing", /*userIsSharing*/ ctx[12]);
    			add_location(button1, file$5, 385, 4, 22180);
    			attr_dev(div3, "class", "share-post flex flex-center-y svelte-1ytb52c");
    			add_location(div3, file$5, 357, 3, 20665);
    			attr_dev(path2, "d", "M10 110l50-50m0 0l50-50M60 60l50 50M60 60L10 10");
    			attr_dev(path2, "stroke-width", ".5rem");
    			attr_dev(path2, "stroke-linecap", "round");
    			attr_dev(path2, "stroke-linejoin", "round");
    			attr_dev(path2, "class", "svelte-1ytb52c");
    			add_location(path2, file$5, 418, 5, 23755);
    			attr_dev(svg2, "class", "icon stroke icon-small svelte-1ytb52c");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "viewBox", "0 0 120 120");
    			attr_dev(svg2, "aria-hidden", "true");
    			attr_dev(svg2, "focusable", "false");
    			attr_dev(svg2, "role", "presentation");
    			add_location(svg2, file$5, 417, 4, 23586);
    			attr_dev(span5, "class", "label svelte-1ytb52c");
    			add_location(span5, file$5, 420, 4, 23900);
    			attr_dev(button2, "role", "button");
    			attr_dev(button2, "class", "close flex flex-center-y flex-self-right gap-1 nowrap svelte-1ytb52c");
    			add_location(button2, file$5, 416, 3, 23474);
    			attr_dev(div4, "class", "footer grid grid-center-y svelte-1ytb52c");
    			add_location(div4, file$5, 356, 2, 20621);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, hr0);
    			append_dev(div0, t0);
    			if_block0.m(div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, hr1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, span0);
    			append_dev(span0, t3);
    			append_dev(span0, t4);
    			append_dev(div3, t5);
    			append_dev(div3, button0);
    			append_dev(button0, div1);
    			append_dev(div1, span1);
    			if_block1.m(span1, null);
    			append_dev(div1, t6);
    			mount_component(statusicon0, div1, null);
    			append_dev(button0, t7);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(button0, t8);
    			append_dev(button0, span2);
    			append_dev(span2, t9);
    			append_dev(div3, t10);
    			append_dev(div3, button1);
    			append_dev(button1, div2);
    			append_dev(div2, span3);
    			if_block2.m(span3, null);
    			append_dev(div2, t11);
    			mount_component(statusicon1, div2, null);
    			append_dev(button1, t12);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			append_dev(button1, t13);
    			append_dev(button1, span4);
    			append_dev(span4, t14);
    			append_dev(div4, t15);
    			append_dev(div4, button2);
    			append_dev(button2, svg2);
    			append_dev(svg2, path2);
    			append_dev(button2, t16);
    			append_dev(button2, span5);
    			append_dev(span5, t17);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*shareURL*/ ctx[27], false, false, false),
    					listen_dev(button1, "click", /*shareThis*/ ctx[28], false, false, false),
    					listen_dev(button2, "click", /*closeModal*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_8(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, t1);
    				}
    			}

    			if (dirty[0] & /*projectAbout*/ 16) {
    				toggle_class(div0, "loading", /*projectAbout*/ ctx[4] !== null);
    			}

    			if ((!current || dirty[0] & /*$_*/ 1048576) && t3_value !== (t3_value = /*$_*/ ctx[20]('share') + "")) set_data_dev(t3, t3_value);

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_10(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(span1, null);
    				}
    			}

    			const statusicon0_changes = {};
    			if (dirty[0] & /*userIsSharingURL*/ 512) statusicon0_changes.loading = /*userIsSharingURL*/ ctx[9];
    			if (dirty[0] & /*shareURLWasCanceled*/ 1024) statusicon0_changes.failed = /*shareURLWasCanceled*/ ctx[10];
    			if (dirty[0] & /*shareURLWasSuccess*/ 2048) statusicon0_changes.succeeded = /*shareURLWasSuccess*/ ctx[11];
    			statusicon0.$set(statusicon0_changes);

    			if (dirty[0] & /*userIsSharingURL*/ 512) {
    				toggle_class(div1, "active", /*userIsSharingURL*/ ctx[9]);
    			}

    			if ((!current || dirty[0] & /*$_*/ 1048576) && t9_value !== (t9_value = /*$_*/ ctx[20]('copy_url') + "")) set_data_dev(t9, t9_value);

    			if (dirty[0] & /*userIsSharingURL*/ 512) {
    				toggle_class(button0, "is-sharing", /*userIsSharingURL*/ ctx[9]);
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_11(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(span3, null);
    				}
    			}

    			const statusicon1_changes = {};
    			if (dirty[0] & /*userIsSharing*/ 4096) statusicon1_changes.loading = /*userIsSharing*/ ctx[12];
    			if (dirty[0] & /*shareWasCanceled, shareNotSupported*/ 24576) statusicon1_changes.failed = /*shareWasCanceled*/ ctx[13] || /*shareNotSupported*/ ctx[14];
    			if (dirty[0] & /*shareWasSuccess*/ 32768) statusicon1_changes.succeeded = /*shareWasSuccess*/ ctx[15];
    			statusicon1.$set(statusicon1_changes);

    			if (dirty[0] & /*userIsSharing*/ 4096) {
    				toggle_class(div2, "active", /*userIsSharing*/ ctx[12]);
    			}

    			if ((!current || dirty[0] & /*$_*/ 1048576) && t14_value !== (t14_value = /*$_*/ ctx[20]('share_with') + "")) set_data_dev(t14, t14_value);

    			if (dirty[0] & /*userIsSharing*/ 4096) {
    				toggle_class(button1, "is-sharing", /*userIsSharing*/ ctx[12]);
    			}

    			if ((!current || dirty[0] & /*$_*/ 1048576) && t17_value !== (t17_value = /*$_*/ ctx[20]('close') + "")) set_data_dev(t17, t17_value);
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
    			if (detaching) detach_dev(t2);
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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(289:1) {#if project.about}",
    		ctx
    	});

    	return block;
    }

    // (345:3) {:else}
    function create_else_block_3(ctx) {
    	let div;
    	let h1;
    	let t0_value = /*$_*/ ctx[20]('project_about_failed') + "";
    	let t0;
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
    			t0 = text(t0_value);
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
    			attr_dev(h1, "class", "svelte-1ytb52c");
    			add_location(h1, file$5, 346, 5, 20392);
    			attr_dev(hr, "class", "h1-border svelte-1ytb52c");
    			add_location(hr, file$5, 347, 5, 20436);
    			attr_dev(p0, "class", "i svelte-1ytb52c");
    			add_location(p0, file$5, 348, 5, 20465);
    			attr_dev(h3, "class", "svelte-1ytb52c");
    			add_location(h3, file$5, 349, 5, 20490);
    			attr_dev(p1, "class", "ii svelte-1ytb52c");
    			add_location(p1, file$5, 350, 5, 20507);
    			attr_dev(p2, "class", "iii svelte-1ytb52c");
    			add_location(p2, file$5, 351, 5, 20533);
    			attr_dev(div, "class", "placeholder svelte-1ytb52c");
    			toggle_class(div, "error-placeholder", /*projectAbout*/ ctx[4] instanceof Error);
    			add_location(div, file$5, 345, 4, 20304);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
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
    			if (dirty[0] & /*$_*/ 1048576 && t0_value !== (t0_value = /*$_*/ ctx[20]('project_about_failed') + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*projectAbout*/ 16) {
    				toggle_class(div, "error-placeholder", /*projectAbout*/ ctx[4] instanceof Error);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(345:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (324:63) 
    function create_if_block_10(ctx) {
    	let div;

    	function select_block_type_9(ctx, dirty) {
    		if (/*project*/ ctx[0].locale.length < 1) return create_if_block_11;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type_9(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "not-available-in-locale text-center grid grid-center svelte-1ytb52c");
    			add_location(div, file$5, 324, 4, 19468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_9(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(324:63) ",
    		ctx
    	});

    	return block;
    }

    // (292:3) {#if projectAbout !== null && !(projectAbout instanceof Error)}
    function create_if_block_6$1(ctx) {
    	let t;
    	let div;
    	let if_block = /*project*/ ctx[0].locale.length > 1 && create_if_block_7$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			div = element("div");
    			attr_dev(div, "class", "rtf-content svelte-1ytb52c");
    			add_location(div, file$5, 322, 4, 19347);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			div.innerHTML = /*renderedRTF*/ ctx[3];
    		},
    		p: function update(ctx, dirty) {
    			if (/*project*/ ctx[0].locale.length > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_7$1(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*renderedRTF*/ 8) div.innerHTML = /*renderedRTF*/ ctx[3];		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(292:3) {#if projectAbout !== null && !(projectAbout instanceof Error)}",
    		ctx
    	});

    	return block;
    }

    // (330:5) {:else}
    function create_else_block_2$1(ctx) {
    	let p;
    	let t0_value = /*$_*/ ctx[20]('project_about_only_available_in') + "";
    	let t0;
    	let t1;
    	let div;
    	let each_value_1 = /*project*/ ctx[0].locale;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "svelte-1ytb52c");
    			add_location(p, file$5, 330, 6, 19683);
    			attr_dev(div, "class", "options flex list flex-center-y gap-1 svelte-1ytb52c");
    			add_location(div, file$5, 331, 6, 19737);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t0_value !== (t0_value = /*$_*/ ctx[20]('project_about_only_available_in') + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*fetchAbout, project*/ 16777217) {
    				each_value_1 = /*project*/ ctx[0].locale;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(330:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (326:5) {#if project.locale.length < 1}
    function create_if_block_11(ctx) {
    	let p;
    	let t_value = /*$_*/ ctx[20]('project_about_unavailable') + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "no-translations svelte-1ytb52c");
    			add_location(p, file$5, 326, 6, 19580);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t_value !== (t_value = /*$_*/ ctx[20]('project_about_unavailable') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(326:5) {#if project.locale.length < 1}",
    		ctx
    	});

    	return block;
    }

    // (333:7) {#each project.locale as locale}
    function create_each_block_1$2(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = LocaleFullName[/*locale*/ ctx[42]] + "";
    	let t0;
    	let t1;
    	let use;
    	let use_xlink_href_value;
    	let t2;
    	let span;
    	let t3_value = LocaleFullName[/*locale*/ ctx[42]] + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[34](/*locale*/ ctx[42]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			t1 = text(" Flag");
    			use = svg_element("use");
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			add_location(title, file$5, 335, 10, 20044);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#FLAG_" + /*locale*/ ctx[42]);
    			add_location(use, file$5, 336, 10, 20100);
    			attr_dev(svg, "class", "flag icon icon-large svelte-1ytb52c");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$5, 334, 9, 19941);
    			attr_dev(span, "class", "label svelte-1ytb52c");
    			add_location(span, file$5, 338, 9, 20162);
    			attr_dev(button, "class", "option flex nowrap flex-center-y gap-05 svelte-1ytb52c");
    			add_location(button, file$5, 333, 8, 19839);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			append_dev(svg, use);
    			append_dev(button, t2);
    			append_dev(button, span);
    			append_dev(span, t3);
    			append_dev(button, t4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*project*/ 1 && t0_value !== (t0_value = LocaleFullName[/*locale*/ ctx[42]] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*project*/ 1 && use_xlink_href_value !== (use_xlink_href_value = "#FLAG_" + /*locale*/ ctx[42])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}

    			if (dirty[0] & /*project*/ 1 && t3_value !== (t3_value = LocaleFullName[/*locale*/ ctx[42]] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(333:7) {#each project.locale as locale}",
    		ctx
    	});

    	return block;
    }

    // (293:4) {#if project.locale.length > 1}
    function create_if_block_7$1(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let svg0;
    	let path0;
    	let t0;
    	let span;
    	let t1_value = /*$_*/ ctx[20]('project_load_different_translation') + "";
    	let t1;
    	let t2;
    	let svg1;
    	let path1;
    	let t3;
    	let mounted;
    	let dispose;
    	let if_block = /*isSelectingDifferentTranslation*/ ctx[7] && create_if_block_8(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(path0, "d", "M10.72 12.464L8.62545 10.448L8.65818 10.432C10.0483 8.9241 11.0868 7.13894 11.7018 5.2H14.0909V3.6H8.36364V2H6.72727V3.6H1V5.2H10.1473C9.57977 6.78406 8.69529 8.24175 7.54545 9.488C6.79634 8.67616 6.15827 7.7726 5.64727 6.8H4.01091C4.61636 8.096 5.43455 9.344 6.46545 10.448L2.29273 14.464L3.45455 15.6L7.54545 11.6L10.0818 14.08L10.7036 12.464H10.72ZM15.3182 8.4H13.6818L10 18H11.6364L12.5527 15.6H16.4473L17.3636 18H19L15.3182 8.4V8.4ZM13.1745 14L14.5 10.528L15.8255 14H13.1745V14Z");
    			attr_dev(path0, "class", "svelte-1ytb52c");
    			add_location(path0, file$5, 297, 9, 17755);
    			attr_dev(svg0, "class", "icon icon-small fill svelte-1ytb52c");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			add_location(svg0, file$5, 296, 8, 17643);
    			attr_dev(span, "class", "label svelte-1ytb52c");
    			add_location(span, file$5, 299, 8, 18276);
    			attr_dev(path1, "d", "M18 39L60.4264 81.4264L102.853 39");
    			attr_dev(path1, "stroke-width", "10");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "class", "svelte-1ytb52c");
    			add_location(path1, file$5, 301, 9, 18471);
    			attr_dev(svg1, "class", "icon icon-small stroke svelte-1ytb52c");
    			attr_dev(svg1, "viewBox", "0 0 120 120");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$5, 300, 8, 18355);
    			attr_dev(button, "class", "loaded-translation flex nowrap flex-center-y gap-05 svelte-1ytb52c");
    			toggle_class(button, "active", /*isSelectingDifferentTranslation*/ ctx[7]);
    			add_location(button, file$5, 295, 7, 17479);
    			attr_dev(div0, "class", "disclosure svelte-1ytb52c");
    			add_location(div0, file$5, 294, 6, 17446);
    			attr_dev(div1, "class", "load-different-locale flex flex-center-y svelte-1ytb52c");
    			add_location(div1, file$5, 293, 5, 17384);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, svg0);
    			append_dev(svg0, path0);
    			append_dev(button, t0);
    			append_dev(button, span);
    			append_dev(span, t1);
    			append_dev(button, t2);
    			append_dev(button, svg1);
    			append_dev(svg1, path1);
    			append_dev(div0, t3);
    			if (if_block) if_block.m(div0, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleDifferentTranslations*/ ctx[25], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t1_value !== (t1_value = /*$_*/ ctx[20]('project_load_different_translation') + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*isSelectingDifferentTranslation*/ 128) {
    				toggle_class(button, "active", /*isSelectingDifferentTranslation*/ ctx[7]);
    			}

    			if (/*isSelectingDifferentTranslation*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_8(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(293:4) {#if project.locale.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (305:7) {#if isSelectingDifferentTranslation}
    function create_if_block_8(ctx) {
    	let div;
    	let each_value = /*project*/ ctx[0].locale;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "options grid gap-05 svelte-1ytb52c");
    			add_location(div, file$5, 305, 8, 18671);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectDifferentTranslation, project, loadedAboutTranslation*/ 67108929) {
    				each_value = /*project*/ ctx[0].locale;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(305:7) {#if isSelectingDifferentTranslation}",
    		ctx
    	});

    	return block;
    }

    // (308:10) {#if locale !== loadedAboutTranslation}
    function create_if_block_9(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = LocaleFullName[/*locale*/ ctx[42]] + "";
    	let t0;
    	let t1;
    	let use;
    	let use_xlink_href_value;
    	let t2;
    	let span;
    	let t3_value = LocaleFullName[/*locale*/ ctx[42]] + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[33](/*locale*/ ctx[42]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			t1 = text(" Flag");
    			use = svg_element("use");
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			add_location(title, file$5, 310, 13, 19038);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#FLAG_" + /*locale*/ ctx[42]);
    			add_location(use, file$5, 311, 13, 19097);
    			attr_dev(svg, "class", "flag icon icon-large svelte-1ytb52c");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$5, 309, 12, 18932);
    			attr_dev(span, "class", "label svelte-1ytb52c");
    			add_location(span, file$5, 313, 12, 19165);
    			attr_dev(button, "class", "option flex nowrap flex-center-y gap-05 svelte-1ytb52c");
    			add_location(button, file$5, 308, 11, 18811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			append_dev(svg, use);
    			append_dev(button, t2);
    			append_dev(button, span);
    			append_dev(span, t3);
    			append_dev(button, t4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*project*/ 1 && t0_value !== (t0_value = LocaleFullName[/*locale*/ ctx[42]] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*project*/ 1 && use_xlink_href_value !== (use_xlink_href_value = "#FLAG_" + /*locale*/ ctx[42])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}

    			if (dirty[0] & /*project*/ 1 && t3_value !== (t3_value = LocaleFullName[/*locale*/ ctx[42]] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(308:10) {#if locale !== loadedAboutTranslation}",
    		ctx
    	});

    	return block;
    }

    // (307:9) {#each project.locale as locale}
    function create_each_block$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*locale*/ ctx[42] !== /*loadedAboutTranslation*/ ctx[6] && create_if_block_9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*locale*/ ctx[42] !== /*loadedAboutTranslation*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(307:9) {#each project.locale as locale}",
    		ctx
    	});

    	return block;
    }

    // (371:7) {:else}
    function create_else_block_1$2(ctx) {
    	let t_value = /*$_*/ ctx[20]('copy_url_inprocess') + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t_value !== (t_value = /*$_*/ ctx[20]('copy_url_inprocess') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(371:7) {:else}",
    		ctx
    	});

    	return block;
    }

    // (369:36) 
    function create_if_block_5$1(ctx) {
    	let t_value = /*$_*/ ctx[20]('copy_url_success') + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t_value !== (t_value = /*$_*/ ctx[20]('copy_url_success') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(369:36) ",
    		ctx
    	});

    	return block;
    }

    // (367:7) {#if shareURLWasCanceled}
    function create_if_block_4$1(ctx) {
    	let t_value = /*$_*/ ctx[20]('copy_url_failed') + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t_value !== (t_value = /*$_*/ ctx[20]('copy_url_failed') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(367:7) {#if shareURLWasCanceled}",
    		ctx
    	});

    	return block;
    }

    // (399:7) {:else}
    function create_else_block$4(ctx) {
    	let t_value = /*$_*/ ctx[20]('sharing') + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t_value !== (t_value = /*$_*/ ctx[20]('sharing') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(399:7) {:else}",
    		ctx
    	});

    	return block;
    }

    // (397:33) 
    function create_if_block_3$1(ctx) {
    	let t_value = /*$_*/ ctx[20]('shared') + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t_value !== (t_value = /*$_*/ ctx[20]('shared') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(397:33) ",
    		ctx
    	});

    	return block;
    }

    // (395:34) 
    function create_if_block_2$3(ctx) {
    	let t_value = /*$_*/ ctx[20]('share_canceled') + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t_value !== (t_value = /*$_*/ ctx[20]('share_canceled') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(395:34) ",
    		ctx
    	});

    	return block;
    }

    // (393:7) {#if shareNotSupported}
    function create_if_block_1$3(ctx) {
    	let t_value = /*$_*/ ctx[20]('share_not_supported') + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t_value !== (t_value = /*$_*/ ctx[20]('share_not_supported') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(393:7) {#if shareNotSupported}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div5;
    	let button;
    	let svg;
    	let path;
    	let t0;
    	let div0;
    	let t1;
    	let div4;
    	let div2;
    	let h1;
    	let t2_value = /*$_*/ ctx[20]('project.' + /*project*/ ctx[0].id) + "";
    	let t2;
    	let t3;
    	let div1;
    	let t4;
    	let div3;
    	let show_if = Array.isArray(/*project*/ ctx[0].otherLinks);
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let div5_transition;
    	let t9;
    	let metatags;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*project*/ ctx[0].cover) return create_if_block_19;
    		if (/*project*/ ctx[0].about === null) return create_if_block_28;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let each_value_3 = /*project*/ ctx[0].usedTechnologies;
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	let if_block1 = show_if && create_if_block_16(ctx);
    	let if_block2 = /*project*/ ctx[0].codeUrl && create_if_block_15(ctx);
    	let if_block3 = /*project*/ ctx[0].codeUrl === null && create_if_block_14(ctx);

    	function select_block_type_7(ctx, dirty) {
    		if (/*project*/ ctx[0].projectUrl !== null && /*project*/ ctx[0].projectUrl !== 'COMING_SOON') return create_if_block_12;
    		if (/*project*/ ctx[0].projectUrl === 'COMING_SOON') return create_if_block_13;
    	}

    	let current_block_type_1 = select_block_type_7(ctx);
    	let if_block4 = current_block_type_1 && current_block_type_1(ctx);
    	let if_block5 = /*project*/ ctx[0].about && create_if_block$5(ctx);

    	metatags = new MetaTags({
    			props: {
    				openGraph: {
    					site_name: /*$_*/ ctx[20]('page_title'),
    					url: `http://danielsharkov.com/?project=${/*project*/ ctx[0].id}`,
    					title: /*$_*/ ctx[20]('page_title'),
    					description: /*$_*/ ctx[20]('about_me'),
    					locale: /*$i18n*/ ctx[1],
    					profile: {
    						firstName: 'Daniel',
    						lastName: 'Scharkov',
    						username: 'DaSh_x097'
    					},
    					images: [
    						{
    							url: `http://danielsharkov.com/projects/${/*project*/ ctx[0].id}/cover.png`,
    							width: 1920,
    							height: 1200,
    							alt: `danielsharkov.com ${/*$_*/ ctx[20]('project.' + /*project*/ ctx[0].id)} cover`
    						},
    						{
    							url: `http://danielsharkov.com/projects/${/*project*/ ctx[0].id}/preview.png`,
    							width: 1024,
    							height: 640,
    							alt: `danielsharkov.com ${/*$_*/ ctx[20]('project.' + /*project*/ ctx[0].id)} preview`
    						},
    						{
    							url: `http://danielsharkov.com/projects/${/*project*/ ctx[0].id}/thumbnail.png`,
    							width: 300,
    							height: 188,
    							alt: `danielsharkov.com ${/*$_*/ ctx[20]('project.' + /*project*/ ctx[0].id)} thumbnail`
    						}
    					]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div3 = element("div");
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			if (if_block3) if_block3.c();
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			if (if_block5) if_block5.c();
    			t9 = space();
    			create_component(metatags.$$.fragment);
    			attr_dev(path, "d", "M10 110l50-50m0 0l50-50M60 60l50 50M60 60L10 10");
    			attr_dev(path, "stroke-width", ".25rem");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "class", "svelte-1ytb52c");
    			add_location(path, file$5, 3, 3, 367);
    			attr_dev(svg, "class", "icon stroke icon-big svelte-1ytb52c");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$5, 2, 2, 202);
    			attr_dev(button, "class", "close-modal flex flex-center svelte-1ytb52c");
    			add_location(button, file$5, 1, 1, 131);
    			attr_dev(div0, "class", "image-container flex flex-center block-select svelte-1ytb52c");
    			attr_dev(div0, "role", "img");
    			attr_dev(div0, "style", /*customGradientBG*/ ctx[16]);
    			toggle_class(div0, "no-image", !/*project*/ ctx[0].cover);
    			toggle_class(div0, "dark-theme", /*project*/ ctx[0].darkTheme);
    			add_location(div0, file$5, 6, 1, 520);
    			attr_dev(h1, "class", "name svelte-1ytb52c");
    			add_location(h1, file$5, 212, 3, 12277);
    			attr_dev(div1, "class", "used-technologies flex list gap-05");
    			attr_dev(div1, "role", "listbox");
    			add_location(div1, file$5, 213, 3, 12333);
    			attr_dev(div2, "class", "left-piece grid gap-1");
    			add_location(div2, file$5, 211, 2, 12237);
    			attr_dev(div3, "class", "right-piece flex svelte-1ytb52c");
    			toggle_class(div3, "single-btn", /*anyHeaderBtnActive*/ ctx[19]);
    			toggle_class(div3, "no-btn", /*noHeaderBtn*/ ctx[18]);
    			add_location(div3, file$5, 239, 2, 13207);
    			attr_dev(div4, "class", "header grid gap-2 svelte-1ytb52c");
    			attr_dev(div4, "tabindex", "-1");
    			add_location(div4, file$5, 210, 1, 12155);
    			attr_dev(div5, "id", "Project_Details_Modal");
    			attr_dev(div5, "class", "grid svelte-1ytb52c");
    			attr_dev(div5, "role", "article");
    			toggle_class(div5, "no-about", /*project*/ ctx[0].about === null);
    			add_location(div5, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(div5, t0);
    			append_dev(div5, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, h1);
    			append_dev(h1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div3, t5);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div3, t6);
    			if (if_block3) if_block3.m(div3, null);
    			append_dev(div3, t7);
    			if (if_block4) if_block4.m(div3, null);
    			/*div4_binding*/ ctx[32](div4);
    			append_dev(div5, t8);
    			if (if_block5) if_block5.m(div5, null);
    			insert_dev(target, t9, anchor);
    			mount_component(metatags, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "hashchange", /*closeModal*/ ctx[23], false, false, false),
    					listen_dev(window_1, "popstate", /*closeModal*/ ctx[23], false, false, false),
    					listen_dev(window_1, "keyup", /*keyup_handler*/ ctx[31], false, false, false),
    					listen_dev(button, "click", /*closeModal*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (!current || dirty[0] & /*customGradientBG*/ 65536) {
    				attr_dev(div0, "style", /*customGradientBG*/ ctx[16]);
    			}

    			if (dirty[0] & /*project*/ 1) {
    				toggle_class(div0, "no-image", !/*project*/ ctx[0].cover);
    			}

    			if (dirty[0] & /*project*/ 1) {
    				toggle_class(div0, "dark-theme", /*project*/ ctx[0].darkTheme);
    			}

    			if ((!current || dirty[0] & /*$_, project*/ 1048577) && t2_value !== (t2_value = /*$_*/ ctx[20]('project.' + /*project*/ ctx[0].id) + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*project*/ 1) {
    				each_value_3 = /*project*/ ctx[0].usedTechnologies;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (dirty[0] & /*project*/ 1) show_if = Array.isArray(/*project*/ ctx[0].otherLinks);

    			if (show_if) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_16(ctx);
    					if_block1.c();
    					if_block1.m(div3, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*project*/ ctx[0].codeUrl) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_15(ctx);
    					if_block2.c();
    					if_block2.m(div3, t6);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*project*/ ctx[0].codeUrl === null) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_14(ctx);
    					if_block3.c();
    					if_block3.m(div3, t7);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_7(ctx)) && if_block4) {
    				if_block4.p(ctx, dirty);
    			} else {
    				if (if_block4) if_block4.d(1);
    				if_block4 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(div3, null);
    				}
    			}

    			if (dirty[0] & /*anyHeaderBtnActive*/ 524288) {
    				toggle_class(div3, "single-btn", /*anyHeaderBtnActive*/ ctx[19]);
    			}

    			if (dirty[0] & /*noHeaderBtn*/ 262144) {
    				toggle_class(div3, "no-btn", /*noHeaderBtn*/ ctx[18]);
    			}

    			if (/*project*/ ctx[0].about) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*project*/ 1) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block$5(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div5, null);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*project*/ 1) {
    				toggle_class(div5, "no-about", /*project*/ ctx[0].about === null);
    			}

    			const metatags_changes = {};

    			if (dirty[0] & /*$_, project, $i18n*/ 1048579) metatags_changes.openGraph = {
    				site_name: /*$_*/ ctx[20]('page_title'),
    				url: `http://danielsharkov.com/?project=${/*project*/ ctx[0].id}`,
    				title: /*$_*/ ctx[20]('page_title'),
    				description: /*$_*/ ctx[20]('about_me'),
    				locale: /*$i18n*/ ctx[1],
    				profile: {
    					firstName: 'Daniel',
    					lastName: 'Scharkov',
    					username: 'DaSh_x097'
    				},
    				images: [
    					{
    						url: `http://danielsharkov.com/projects/${/*project*/ ctx[0].id}/cover.png`,
    						width: 1920,
    						height: 1200,
    						alt: `danielsharkov.com ${/*$_*/ ctx[20]('project.' + /*project*/ ctx[0].id)} cover`
    					},
    					{
    						url: `http://danielsharkov.com/projects/${/*project*/ ctx[0].id}/preview.png`,
    						width: 1024,
    						height: 640,
    						alt: `danielsharkov.com ${/*$_*/ ctx[20]('project.' + /*project*/ ctx[0].id)} preview`
    					},
    					{
    						url: `http://danielsharkov.com/projects/${/*project*/ ctx[0].id}/thumbnail.png`,
    						width: 300,
    						height: 188,
    						alt: `danielsharkov.com ${/*$_*/ ctx[20]('project.' + /*project*/ ctx[0].id)} thumbnail`
    					}
    				]
    			};

    			metatags.$set(metatags_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block5);

    			add_render_callback(() => {
    				if (!div5_transition) div5_transition = create_bidirectional_transition(div5, projectModalAnim, {}, true);
    				div5_transition.run(1);
    			});

    			transition_in(metatags.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block5);
    			if (!div5_transition) div5_transition = create_bidirectional_transition(div5, projectModalAnim, {}, false);
    			div5_transition.run(0);
    			transition_out(metatags.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);

    			if (if_block0) {
    				if_block0.d();
    			}

    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();

    			if (if_block4) {
    				if_block4.d();
    			}

    			/*div4_binding*/ ctx[32](null);
    			if (if_block5) if_block5.d();
    			if (detaching && div5_transition) div5_transition.end();
    			if (detaching) detach_dev(t9);
    			destroy_component(metatags, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	let anyHeaderBtnActive;
    	let noHeaderBtn;
    	let aboutAvailableInCurrentLocale;
    	let customGradientBG;
    	let $_;
    	let $i18n;
    	let $GlobalStore;

    	let $lazyloader,
    		$$unsubscribe_lazyloader = noop,
    		$$subscribe_lazyloader = () => ($$unsubscribe_lazyloader(), $$unsubscribe_lazyloader = subscribe(lazyloader, $$value => $$invalidate(22, $lazyloader = $$value)), lazyloader);

    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(20, $_ = $$value));
    	validate_store(i18n, 'i18n');
    	component_subscribe($$self, i18n, $$value => $$invalidate(1, $i18n = $$value));
    	validate_store(GlobalStore, 'GlobalStore');
    	component_subscribe($$self, GlobalStore, $$value => $$invalidate(21, $GlobalStore = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_lazyloader());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProjectDetails', slots, []);
    	const dispatch = createEventDispatcher();

    	function closeModal() {
    		vibrate();
    		dispatch('close');
    	}

    	let { projectIndex } = $$props;
    	let _prevIdx = projectIndex;
    	let project = projects[projectIndex];
    	let projectModalHeaderEl;
    	let renderedRTF = null;
    	let projectAbout = null;
    	let isLoadingAbout = false;
    	let loadedAboutTranslation = null;
    	let isSelectingDifferentTranslation = false;

    	async function fetchAbout(locale) {
    		if (typeof locale !== 'string') {
    			locale = $i18n;
    		}

    		try {
    			$$invalidate(3, renderedRTF = null);
    			$$invalidate(4, projectAbout = null);
    			$$invalidate(5, isLoadingAbout = true);

    			if (!LocaleList.includes(locale)) {
    				throw new Error(`invalid locale (${locale}) provided`);
    			}

    			const resp = await fetch(`projects/${project.id}/about/${locale}.md`);
    			if (resp.status !== 200) throw new Error('404');
    			const text = await resp.text();
    			$$invalidate(4, projectAbout = text);
    			$$invalidate(3, renderedRTF = marked.parse(projectAbout, { smartLists: true }));

    			setTimeout(() => {
    				for (const link of document.querySelectorAll('.rtf-content a')) {
    					link.setAttribute('target', '_blank');
    				}

    				$$invalidate(6, loadedAboutTranslation = locale);
    				$$invalidate(5, isLoadingAbout = false);
    			});
    		} catch(err) {
    			setTimeout(
    				() => {
    					$$invalidate(4, projectAbout = err);
    					$$invalidate(5, isLoadingAbout = false);
    				},
    				1e3
    			);
    		}
    	}

    	function resetAbout() {
    		$$invalidate(3, renderedRTF = null);
    		$$invalidate(4, projectAbout = null);
    		$$invalidate(5, isLoadingAbout = false);
    		$$invalidate(7, isSelectingDifferentTranslation = false);
    	}

    	function toggleDifferentTranslations() {
    		$$invalidate(7, isSelectingDifferentTranslation = !isSelectingDifferentTranslation);
    	}

    	function selectDifferentTranslation(locale) {
    		$$invalidate(7, isSelectingDifferentTranslation = false);
    		fetchAbout(locale);
    	}

    	let isCurrentDarkMode = $GlobalStore.a11y.darkMode;
    	let lazyloader;

    	function loadCover() {
    		if (!project.cover) return;

    		if (isCurrentDarkMode && project.darkTheme) {
    			$$subscribe_lazyloader($$invalidate(8, lazyloader = new LazyLoader(`projects/${project.id}/cover_dark.png`)));
    		} else {
    			$$subscribe_lazyloader($$invalidate(8, lazyloader = new LazyLoader(`projects/${project.id}/cover.png`)));
    		}

    		lazyloader.load();
    	}

    	const unSubDarkModeWatcher = GlobalStore.subscribe(s => {
    		if (s.a11y.darkMode !== isCurrentDarkMode) {
    			isCurrentDarkMode = s.a11y.darkMode;
    			loadCover();
    		}
    	});

    	onMount(() => {
    		projectModalHeaderEl.focus();

    		if (project.about && project.locale.includes($i18n)) {
    			fetchAbout();
    		}

    		loadCover();
    	});

    	onDestroy(function () {
    		unSubDarkModeWatcher();
    		if (lazyloader && lazyloader.destroy) lazyloader.destroy();
    	});

    	let userIsSharingURL = false;
    	let shareURLWasCanceled = false;
    	let shareURLWasSuccess = false;

    	async function shareURL() {
    		var _a;
    		if (userIsSharingURL) return;
    		$$invalidate(10, shareURLWasCanceled = false);
    		$$invalidate(11, shareURLWasSuccess = false);
    		shareThisReset();

    		if ((_a = window.location) === null || _a === void 0
    		? void 0
    		: _a.href) {
    			$$invalidate(9, userIsSharingURL = true);
    			vibrate();

    			if (await copyToClipboard(window.location.href)) {
    				vibrate([0, 500, 200, 100, 50]);

    				setTimeout(() => {
    					$$invalidate(11, shareURLWasSuccess = true);
    					setTimeout(shareURLReset, 2000);
    				});
    			} else {
    				vibrate([0, 500, 100, 50, 100]);

    				setTimeout(() => {
    					$$invalidate(10, shareURLWasCanceled = true);
    					setTimeout(shareURLReset, 2000);
    				});
    			}
    		} else {
    			vibrate([0, 500, 100, 50, 100, 200, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
    			$$invalidate(9, userIsSharingURL = true);

    			setTimeout(() => {
    				$$invalidate(10, shareURLWasCanceled = true);
    				setTimeout(shareURLReset, 2000);
    			});
    		}
    	}

    	function shareURLReset() {
    		$$invalidate(9, userIsSharingURL = false);

    		setTimeout(() => {
    			$$invalidate(10, shareURLWasCanceled = false);
    			$$invalidate(11, shareURLWasSuccess = false);
    		});
    	}

    	let userIsSharing = false;
    	let shareWasCanceled = false;
    	let shareNotSupported = false;
    	let shareWasSuccess = false;

    	async function shareThis() {
    		var _a, _b;
    		if (userIsSharing) return;
    		$$invalidate(13, shareWasCanceled = false);
    		$$invalidate(15, shareWasSuccess = false);
    		shareURLReset();

    		if (((_a = window.navigator) === null || _a === void 0
    		? void 0
    		: _a.share) && ((_b = window.location) === null || _b === void 0
    		? void 0
    		: _b.href)) {
    			vibrate();
    			$$invalidate(12, userIsSharing = true);

    			try {
    				await navigator.share({
    					title: $_('a_project_by', {
    						values: { 'name': $_('project.' + project.id) }
    					}),
    					url: window.location.href
    				});

    				vibrate([0, 500, 200, 100, 50]);

    				setTimeout(() => {
    					$$invalidate(15, shareWasSuccess = true);
    					setTimeout(shareThisReset, 2000);
    				});
    			} catch(err) {
    				vibrate([0, 500, 100, 50, 100]);

    				setTimeout(() => {
    					$$invalidate(13, shareWasCanceled = true);
    					setTimeout(shareThisReset, 2000);
    				});
    			}
    		} else {
    			vibrate([0, 500, 100, 50, 100, 200, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
    			$$invalidate(12, userIsSharing = true);

    			setTimeout(() => {
    				$$invalidate(14, shareNotSupported = true);
    				setTimeout(shareThisReset, 3000);
    			});
    		}
    	}

    	function shareThisReset() {
    		$$invalidate(12, userIsSharing = false);

    		setTimeout(() => {
    			$$invalidate(13, shareWasCanceled = false);
    			$$invalidate(14, shareNotSupported = false);
    			$$invalidate(15, shareWasSuccess = false);
    		});
    	}

    	const writable_props = ['projectIndex'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProjectDetails> was created with unknown prop '${key}'`);
    	});

    	const keyup_handler = e => e.key == 'Escape' ? closeModal() : 0;

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			projectModalHeaderEl = $$value;
    			$$invalidate(2, projectModalHeaderEl);
    		});
    	}

    	const click_handler = locale => selectDifferentTranslation(locale);
    	const click_handler_1 = locale => fetchAbout(locale);

    	$$self.$$set = $$props => {
    		if ('projectIndex' in $$props) $$invalidate(29, projectIndex = $$props.projectIndex);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		dispatch,
    		projects,
    		technologies,
    		marked,
    		GlobalStore,
    		vibrate,
    		vibrateLink,
    		copyToClipboard,
    		StatusIcon,
    		MetaTags,
    		_: X,
    		projectModalAnim,
    		i18n,
    		LocaleFullName,
    		LocaleList,
    		LazyLoader,
    		LazyLoadStatus,
    		closeModal,
    		projectIndex,
    		_prevIdx,
    		project,
    		projectModalHeaderEl,
    		renderedRTF,
    		projectAbout,
    		isLoadingAbout,
    		loadedAboutTranslation,
    		isSelectingDifferentTranslation,
    		fetchAbout,
    		resetAbout,
    		toggleDifferentTranslations,
    		selectDifferentTranslation,
    		isCurrentDarkMode,
    		lazyloader,
    		loadCover,
    		unSubDarkModeWatcher,
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
    		customGradientBG,
    		aboutAvailableInCurrentLocale,
    		noHeaderBtn,
    		anyHeaderBtnActive,
    		$_,
    		$i18n,
    		$GlobalStore,
    		$lazyloader
    	});

    	$$self.$inject_state = $$props => {
    		if ('projectIndex' in $$props) $$invalidate(29, projectIndex = $$props.projectIndex);
    		if ('_prevIdx' in $$props) $$invalidate(30, _prevIdx = $$props._prevIdx);
    		if ('project' in $$props) $$invalidate(0, project = $$props.project);
    		if ('projectModalHeaderEl' in $$props) $$invalidate(2, projectModalHeaderEl = $$props.projectModalHeaderEl);
    		if ('renderedRTF' in $$props) $$invalidate(3, renderedRTF = $$props.renderedRTF);
    		if ('projectAbout' in $$props) $$invalidate(4, projectAbout = $$props.projectAbout);
    		if ('isLoadingAbout' in $$props) $$invalidate(5, isLoadingAbout = $$props.isLoadingAbout);
    		if ('loadedAboutTranslation' in $$props) $$invalidate(6, loadedAboutTranslation = $$props.loadedAboutTranslation);
    		if ('isSelectingDifferentTranslation' in $$props) $$invalidate(7, isSelectingDifferentTranslation = $$props.isSelectingDifferentTranslation);
    		if ('isCurrentDarkMode' in $$props) isCurrentDarkMode = $$props.isCurrentDarkMode;
    		if ('lazyloader' in $$props) $$subscribe_lazyloader($$invalidate(8, lazyloader = $$props.lazyloader));
    		if ('userIsSharingURL' in $$props) $$invalidate(9, userIsSharingURL = $$props.userIsSharingURL);
    		if ('shareURLWasCanceled' in $$props) $$invalidate(10, shareURLWasCanceled = $$props.shareURLWasCanceled);
    		if ('shareURLWasSuccess' in $$props) $$invalidate(11, shareURLWasSuccess = $$props.shareURLWasSuccess);
    		if ('userIsSharing' in $$props) $$invalidate(12, userIsSharing = $$props.userIsSharing);
    		if ('shareWasCanceled' in $$props) $$invalidate(13, shareWasCanceled = $$props.shareWasCanceled);
    		if ('shareNotSupported' in $$props) $$invalidate(14, shareNotSupported = $$props.shareNotSupported);
    		if ('shareWasSuccess' in $$props) $$invalidate(15, shareWasSuccess = $$props.shareWasSuccess);
    		if ('customGradientBG' in $$props) $$invalidate(16, customGradientBG = $$props.customGradientBG);
    		if ('aboutAvailableInCurrentLocale' in $$props) $$invalidate(17, aboutAvailableInCurrentLocale = $$props.aboutAvailableInCurrentLocale);
    		if ('noHeaderBtn' in $$props) $$invalidate(18, noHeaderBtn = $$props.noHeaderBtn);
    		if ('anyHeaderBtnActive' in $$props) $$invalidate(19, anyHeaderBtnActive = $$props.anyHeaderBtnActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*projectIndex, _prevIdx, project, $i18n*/ 1610612739) {
    			if (projectIndex !== _prevIdx) {
    				$$invalidate(0, project = projects[projectIndex]);
    				((($$invalidate(0, project), $$invalidate(29, projectIndex)), $$invalidate(30, _prevIdx)), $$invalidate(1, $i18n));
    				$$invalidate(30, _prevIdx = projectIndex);
    				loadCover();

    				if (project.about && project.locale.includes($i18n)) {
    					fetchAbout();
    				} else {
    					resetAbout();
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*project*/ 1) {
    			$$invalidate(19, anyHeaderBtnActive = project.codeUrl !== undefined && project.projectUrl === undefined || project.codeUrl === undefined && project.projectUrl !== undefined);
    		}

    		if ($$self.$$.dirty[0] & /*project*/ 1) {
    			$$invalidate(18, noHeaderBtn = project.codeUrl === undefined && project.projectUrl === null);
    		}

    		if ($$self.$$.dirty[0] & /*project, $i18n*/ 3) {
    			$$invalidate(17, aboutAvailableInCurrentLocale = project.locale.includes($i18n));
    		}

    		if ($$self.$$.dirty[0] & /*project*/ 1) {
    			$$invalidate(16, customGradientBG = Array.isArray(project.gradient)
    			? `background: -webkit-linear-gradient(125deg, ${project.gradient.join(',')});` + `background: linear-gradient(125deg, ${project.gradient.join(',')});`
    			: '');
    		}
    	};

    	return [
    		project,
    		$i18n,
    		projectModalHeaderEl,
    		renderedRTF,
    		projectAbout,
    		isLoadingAbout,
    		loadedAboutTranslation,
    		isSelectingDifferentTranslation,
    		lazyloader,
    		userIsSharingURL,
    		shareURLWasCanceled,
    		shareURLWasSuccess,
    		userIsSharing,
    		shareWasCanceled,
    		shareNotSupported,
    		shareWasSuccess,
    		customGradientBG,
    		aboutAvailableInCurrentLocale,
    		noHeaderBtn,
    		anyHeaderBtnActive,
    		$_,
    		$GlobalStore,
    		$lazyloader,
    		closeModal,
    		fetchAbout,
    		toggleDifferentTranslations,
    		selectDifferentTranslation,
    		shareURL,
    		shareThis,
    		projectIndex,
    		_prevIdx,
    		keyup_handler,
    		div4_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class ProjectDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { projectIndex: 29 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectDetails",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*projectIndex*/ ctx[29] === undefined && !('projectIndex' in props)) {
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

    /* src\components\ProjectPreviewTile.svelte generated by Svelte v3.44.1 */
    const file$4 = "src\\components\\ProjectPreviewTile.svelte";

    // (222:2) {:else}
    function create_else_block_2(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let circle;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			circle = svg_element("circle");
    			attr_dev(div0, "class", "bg svelte-1eg37wb");
    			attr_dev(div0, "style", /*customGradientBG*/ ctx[2]);
    			add_location(div0, file$4, 223, 4, 11748);
    			attr_dev(path0, "d", "M84.2922 34.7947L84.9993 35.5018L120.855 -0.353501L120.147 -1.06061L84.2922 34.7947Z");
    			attr_dev(path0, "class", "fill svelte-1eg37wb");
    			attr_dev(path0, "opacity", ".25");
    			add_location(path0, file$4, 225, 5, 11947);
    			attr_dev(path1, "d", "M85.5569 84.9356L84.8498 85.6427L119.562 120.355L120.269 119.647L85.5569 84.9356Z");
    			attr_dev(path1, "class", "fill svelte-1eg37wb");
    			attr_dev(path1, "opacity", ".25");
    			add_location(path1, file$4, 226, 5, 12077);
    			attr_dev(path2, "d", "M35.5018 84.9993L34.7947 84.2922L-0.0606959 119.148L0.646411 119.855L35.5018 84.9993Z");
    			attr_dev(path2, "class", "fill svelte-1eg37wb");
    			attr_dev(path2, "opacity", ".25");
    			add_location(path2, file$4, 227, 5, 12204);
    			attr_dev(path3, "d", "M35.3523 36.1452L36.0594 35.4381L0.0606224 -0.560669L-0.646484 0.146438L35.3523 36.1452Z");
    			attr_dev(path3, "class", "fill svelte-1eg37wb");
    			attr_dev(path3, "opacity", ".25");
    			add_location(path3, file$4, 228, 5, 12335);
    			attr_dev(path4, "d", "M89.5 46V77C89.5 77.8284 88.8284 78.5 88 78.5H32C31.1716 78.5 30.5 77.8284 30.5 77V46C30.5 45.1716 31.1716 44.5 32 44.5H44.6667C45.6759 44.5 46.5862 43.8932 46.9744 42.9615L49.6987 36.4231C49.9316 35.8641 50.4778 35.5 51.0833 35.5H53.5H60H66.5H68.9167C69.5222 35.5 70.0684 35.8641 70.3013 36.4231L73.0256 42.9615C73.4138 43.8932 74.3241 44.5 75.3333 44.5H88C88.8284 44.5 89.5 45.1716 89.5 46Z");
    			attr_dev(path4, "class", "stroke svelte-1eg37wb");
    			add_location(path4, file$4, 229, 5, 12469);
    			attr_dev(circle, "cx", "60");
    			attr_dev(circle, "cy", "60");
    			attr_dev(circle, "r", "9.5");
    			attr_dev(circle, "class", "stroke svelte-1eg37wb");
    			add_location(circle, file$4, 230, 5, 12895);
    			attr_dev(svg, "class", "icon svelte-1eg37wb");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			add_location(svg, file$4, 224, 4, 11796);
    			attr_dev(div1, "class", "no-image flex flex-center svelte-1eg37wb");
    			add_location(div1, file$4, 222, 3, 11703);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			append_dev(div1, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, circle);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*customGradientBG*/ 4) {
    				attr_dev(div0, "style", /*customGradientBG*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(222:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (54:2) {#if project.cover}
    function create_if_block$4(ctx) {
    	let div;
    	let div_class_value;

    	function select_block_type_1(ctx, dirty) {
    		if (/*$GlobalStore*/ ctx[3].a11y.darkMode && /*project*/ ctx[6].darkTheme) return create_if_block_1$2;
    		if (/*$lazyloader*/ ctx[4].status === LazyLoadStatus.DONE) return create_if_block_5;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", div_class_value = "image-container " + (/*$GlobalStore*/ ctx[3].a11y.darkMode ? 'dark' : 'light') + " svelte-1eg37wb");
    			add_location(div, file$4, 54, 3, 2015);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*$GlobalStore*/ 8 && div_class_value !== (div_class_value = "image-container " + (/*$GlobalStore*/ ctx[3].a11y.darkMode ? 'dark' : 'light') + " svelte-1eg37wb")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(54:2) {#if project.cover}",
    		ctx
    	});

    	return block;
    }

    // (144:5) {:else}
    function create_else_block_1$1(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;
    	let div;

    	function select_block_type_4(ctx, dirty) {
    		if (/*$lazyloader*/ ctx[4].status === LazyLoadStatus.LOADING) return create_if_block_6;
    		if (/*$lazyloader*/ ctx[4].status === LazyLoadStatus.ERR) return create_if_block_7;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			if (!src_url_equal(img.src, img_src_value = /*thumbSrc*/ ctx[7])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `Daniel Sharkov's project ${/*$_*/ ctx[5]('project.' + /*project*/ ctx[6].id)} thumbnail`);
    			attr_dev(img, "class", "thumb svelte-1eg37wb");
    			add_location(img, file$4, 144, 6, 7138);
    			attr_dev(div, "class", "lazyloader flex flex-center svelte-1eg37wb");
    			add_location(div, file$4, 148, 6, 7279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 32 && img_alt_value !== (img_alt_value = `Daniel Sharkov's project ${/*$_*/ ctx[5]('project.' + /*project*/ ctx[6].id)} thumbnail`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (current_block_type !== (current_block_type = select_block_type_4(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(144:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (139:5) {#if $lazyloader.status === LazyLoadStatus.DONE}
    function create_if_block_5(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*previewSrc*/ ctx[8])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `Daniel Sharkov's project ${/*$_*/ ctx[5]('project.' + /*project*/ ctx[6].id)} preview`);
    			attr_dev(img, "class", "image svelte-1eg37wb");
    			add_location(img, file$4, 139, 6, 6983);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 32 && img_alt_value !== (img_alt_value = `Daniel Sharkov's project ${/*$_*/ ctx[5]('project.' + /*project*/ ctx[6].id)} preview`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(139:5) {#if $lazyloader.status === LazyLoadStatus.DONE}",
    		ctx
    	});

    	return block;
    }

    // (56:4) {#if $GlobalStore.a11y.darkMode && project.darkTheme}
    function create_if_block_1$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*$lazyloader*/ ctx[4].status === LazyLoadStatus.DONE) return create_if_block_2$2;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(56:4) {#if $GlobalStore.a11y.darkMode && project.darkTheme}",
    		ctx
    	});

    	return block;
    }

    // (213:59) 
    function create_if_block_7(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z");
    			add_location(path, file$4, 214, 9, 11109);
    			attr_dev(svg, "class", "icon icon-error icon-large fill svelte-1eg37wb");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "fill", "none");
    			add_location(svg, file$4, 213, 8, 10984);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(213:59) ",
    		ctx
    	});

    	return block;
    }

    // (150:7) {#if $lazyloader.status === LazyLoadStatus.LOADING}
    function create_if_block_6(ctx) {
    	let svg;
    	let g0;
    	let rect0;
    	let animate0;
    	let g1;
    	let rect1;
    	let animate1;
    	let g2;
    	let rect2;
    	let animate2;
    	let g3;
    	let rect3;
    	let animate3;
    	let g4;
    	let rect4;
    	let animate4;
    	let g5;
    	let rect5;
    	let animate5;
    	let g6;
    	let rect6;
    	let animate6;
    	let g7;
    	let rect7;
    	let animate7;
    	let g8;
    	let rect8;
    	let animate8;
    	let g9;
    	let rect9;
    	let animate9;
    	let g10;
    	let rect10;
    	let animate10;
    	let g11;
    	let rect11;
    	let animate11;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			rect0 = svg_element("rect");
    			animate0 = svg_element("animate");
    			g1 = svg_element("g");
    			rect1 = svg_element("rect");
    			animate1 = svg_element("animate");
    			g2 = svg_element("g");
    			rect2 = svg_element("rect");
    			animate2 = svg_element("animate");
    			g3 = svg_element("g");
    			rect3 = svg_element("rect");
    			animate3 = svg_element("animate");
    			g4 = svg_element("g");
    			rect4 = svg_element("rect");
    			animate4 = svg_element("animate");
    			g5 = svg_element("g");
    			rect5 = svg_element("rect");
    			animate5 = svg_element("animate");
    			g6 = svg_element("g");
    			rect6 = svg_element("rect");
    			animate6 = svg_element("animate");
    			g7 = svg_element("g");
    			rect7 = svg_element("rect");
    			animate7 = svg_element("animate");
    			g8 = svg_element("g");
    			rect8 = svg_element("rect");
    			animate8 = svg_element("animate");
    			g9 = svg_element("g");
    			rect9 = svg_element("rect");
    			animate9 = svg_element("animate");
    			g10 = svg_element("g");
    			rect10 = svg_element("rect");
    			animate10 = svg_element("animate");
    			g11 = svg_element("g");
    			rect11 = svg_element("rect");
    			animate11 = svg_element("animate");
    			attr_dev(animate0, "attributeName", "opacity");
    			attr_dev(animate0, "values", "1;0");
    			attr_dev(animate0, "keyTimes", "0;1");
    			attr_dev(animate0, "dur", "1s");
    			attr_dev(animate0, "begin", "-0.9166666666666666s");
    			attr_dev(animate0, "repeatCount", "indefinite");
    			add_location(animate0, file$4, 153, 11, 7687);
    			attr_dev(rect0, "x", "49");
    			attr_dev(rect0, "y", "7");
    			attr_dev(rect0, "rx", "0");
    			attr_dev(rect0, "ry", "0");
    			attr_dev(rect0, "width", "2");
    			attr_dev(rect0, "height", "26");
    			add_location(rect0, file$4, 152, 10, 7619);
    			attr_dev(g0, "transform", "rotate(0 50 50)");
    			add_location(g0, file$4, 151, 9, 7576);
    			attr_dev(animate1, "attributeName", "opacity");
    			attr_dev(animate1, "values", "1;0");
    			attr_dev(animate1, "keyTimes", "0;1");
    			attr_dev(animate1, "dur", "1s");
    			attr_dev(animate1, "begin", "-0.8333333333333334s");
    			attr_dev(animate1, "repeatCount", "indefinite");
    			add_location(animate1, file$4, 158, 11, 7969);
    			attr_dev(rect1, "x", "49");
    			attr_dev(rect1, "y", "7");
    			attr_dev(rect1, "rx", "0");
    			attr_dev(rect1, "ry", "0");
    			attr_dev(rect1, "width", "2");
    			attr_dev(rect1, "height", "26");
    			add_location(rect1, file$4, 157, 10, 7901);
    			attr_dev(g1, "transform", "rotate(30 50 50)");
    			add_location(g1, file$4, 156, 9, 7857);
    			attr_dev(animate2, "attributeName", "opacity");
    			attr_dev(animate2, "values", "1;0");
    			attr_dev(animate2, "keyTimes", "0;1");
    			attr_dev(animate2, "dur", "1s");
    			attr_dev(animate2, "begin", "-0.75s");
    			attr_dev(animate2, "repeatCount", "indefinite");
    			add_location(animate2, file$4, 163, 11, 8251);
    			attr_dev(rect2, "x", "49");
    			attr_dev(rect2, "y", "7");
    			attr_dev(rect2, "rx", "0");
    			attr_dev(rect2, "ry", "0");
    			attr_dev(rect2, "width", "2");
    			attr_dev(rect2, "height", "26");
    			add_location(rect2, file$4, 162, 10, 8183);
    			attr_dev(g2, "transform", "rotate(60 50 50)");
    			add_location(g2, file$4, 161, 9, 8139);
    			attr_dev(animate3, "attributeName", "opacity");
    			attr_dev(animate3, "values", "1;0");
    			attr_dev(animate3, "keyTimes", "0;1");
    			attr_dev(animate3, "dur", "1s");
    			attr_dev(animate3, "begin", "-0.6666666666666666s");
    			attr_dev(animate3, "repeatCount", "indefinite");
    			add_location(animate3, file$4, 168, 11, 8519);
    			attr_dev(rect3, "x", "49");
    			attr_dev(rect3, "y", "7");
    			attr_dev(rect3, "rx", "0");
    			attr_dev(rect3, "ry", "0");
    			attr_dev(rect3, "width", "2");
    			attr_dev(rect3, "height", "26");
    			add_location(rect3, file$4, 167, 10, 8451);
    			attr_dev(g3, "transform", "rotate(90 50 50)");
    			add_location(g3, file$4, 166, 9, 8407);
    			attr_dev(animate4, "attributeName", "opacity");
    			attr_dev(animate4, "values", "1;0");
    			attr_dev(animate4, "keyTimes", "0;1");
    			attr_dev(animate4, "dur", "1s");
    			attr_dev(animate4, "begin", "-0.5833333333333334s");
    			attr_dev(animate4, "repeatCount", "indefinite");
    			add_location(animate4, file$4, 173, 11, 8802);
    			attr_dev(rect4, "x", "49");
    			attr_dev(rect4, "y", "7");
    			attr_dev(rect4, "rx", "0");
    			attr_dev(rect4, "ry", "0");
    			attr_dev(rect4, "width", "2");
    			attr_dev(rect4, "height", "26");
    			add_location(rect4, file$4, 172, 10, 8734);
    			attr_dev(g4, "transform", "rotate(120 50 50)");
    			add_location(g4, file$4, 171, 9, 8689);
    			attr_dev(animate5, "attributeName", "opacity");
    			attr_dev(animate5, "values", "1;0");
    			attr_dev(animate5, "keyTimes", "0;1");
    			attr_dev(animate5, "dur", "1s");
    			attr_dev(animate5, "begin", "-0.5s");
    			attr_dev(animate5, "repeatCount", "indefinite");
    			add_location(animate5, file$4, 178, 11, 9085);
    			attr_dev(rect5, "x", "49");
    			attr_dev(rect5, "y", "7");
    			attr_dev(rect5, "rx", "0");
    			attr_dev(rect5, "ry", "0");
    			attr_dev(rect5, "width", "2");
    			attr_dev(rect5, "height", "26");
    			add_location(rect5, file$4, 177, 10, 9017);
    			attr_dev(g5, "transform", "rotate(150 50 50)");
    			add_location(g5, file$4, 176, 9, 8972);
    			attr_dev(animate6, "attributeName", "opacity");
    			attr_dev(animate6, "values", "1;0");
    			attr_dev(animate6, "keyTimes", "0;1");
    			attr_dev(animate6, "dur", "1s");
    			attr_dev(animate6, "begin", "-0.4166666666666667s");
    			attr_dev(animate6, "repeatCount", "indefinite");
    			add_location(animate6, file$4, 183, 11, 9353);
    			attr_dev(rect6, "x", "49");
    			attr_dev(rect6, "y", "7");
    			attr_dev(rect6, "rx", "0");
    			attr_dev(rect6, "ry", "0");
    			attr_dev(rect6, "width", "2");
    			attr_dev(rect6, "height", "26");
    			add_location(rect6, file$4, 182, 10, 9285);
    			attr_dev(g6, "transform", "rotate(180 50 50)");
    			add_location(g6, file$4, 181, 9, 9240);
    			attr_dev(animate7, "attributeName", "opacity");
    			attr_dev(animate7, "values", "1;0");
    			attr_dev(animate7, "keyTimes", "0;1");
    			attr_dev(animate7, "dur", "1s");
    			attr_dev(animate7, "begin", "-0.3333333333333333s");
    			attr_dev(animate7, "repeatCount", "indefinite");
    			add_location(animate7, file$4, 188, 11, 9636);
    			attr_dev(rect7, "x", "49");
    			attr_dev(rect7, "y", "7");
    			attr_dev(rect7, "rx", "0");
    			attr_dev(rect7, "ry", "0");
    			attr_dev(rect7, "width", "2");
    			attr_dev(rect7, "height", "26");
    			add_location(rect7, file$4, 187, 10, 9568);
    			attr_dev(g7, "transform", "rotate(210 50 50)");
    			add_location(g7, file$4, 186, 9, 9523);
    			attr_dev(animate8, "attributeName", "opacity");
    			attr_dev(animate8, "values", "1;0");
    			attr_dev(animate8, "keyTimes", "0;1");
    			attr_dev(animate8, "dur", "1s");
    			attr_dev(animate8, "begin", "-0.25s");
    			attr_dev(animate8, "repeatCount", "indefinite");
    			add_location(animate8, file$4, 193, 11, 9919);
    			attr_dev(rect8, "x", "49");
    			attr_dev(rect8, "y", "7");
    			attr_dev(rect8, "rx", "0");
    			attr_dev(rect8, "ry", "0");
    			attr_dev(rect8, "width", "2");
    			attr_dev(rect8, "height", "26");
    			add_location(rect8, file$4, 192, 10, 9851);
    			attr_dev(g8, "transform", "rotate(240 50 50)");
    			add_location(g8, file$4, 191, 9, 9806);
    			attr_dev(animate9, "attributeName", "opacity");
    			attr_dev(animate9, "values", "1;0");
    			attr_dev(animate9, "keyTimes", "0;1");
    			attr_dev(animate9, "dur", "1s");
    			attr_dev(animate9, "begin", "-0.16666666666666666s");
    			attr_dev(animate9, "repeatCount", "indefinite");
    			add_location(animate9, file$4, 198, 11, 10188);
    			attr_dev(rect9, "x", "49");
    			attr_dev(rect9, "y", "7");
    			attr_dev(rect9, "rx", "0");
    			attr_dev(rect9, "ry", "0");
    			attr_dev(rect9, "width", "2");
    			attr_dev(rect9, "height", "26");
    			add_location(rect9, file$4, 197, 10, 10120);
    			attr_dev(g9, "transform", "rotate(270 50 50)");
    			add_location(g9, file$4, 196, 9, 10075);
    			attr_dev(animate10, "attributeName", "opacity");
    			attr_dev(animate10, "values", "1;0");
    			attr_dev(animate10, "keyTimes", "0;1");
    			attr_dev(animate10, "dur", "1s");
    			attr_dev(animate10, "begin", "-0.08333333333333333s");
    			attr_dev(animate10, "repeatCount", "indefinite");
    			add_location(animate10, file$4, 203, 11, 10472);
    			attr_dev(rect10, "x", "49");
    			attr_dev(rect10, "y", "7");
    			attr_dev(rect10, "rx", "0");
    			attr_dev(rect10, "ry", "0");
    			attr_dev(rect10, "width", "2");
    			attr_dev(rect10, "height", "26");
    			add_location(rect10, file$4, 202, 10, 10404);
    			attr_dev(g10, "transform", "rotate(300 50 50)");
    			add_location(g10, file$4, 201, 9, 10359);
    			attr_dev(animate11, "attributeName", "opacity");
    			attr_dev(animate11, "values", "1;0");
    			attr_dev(animate11, "keyTimes", "0;1");
    			attr_dev(animate11, "dur", "1s");
    			attr_dev(animate11, "begin", "0s");
    			attr_dev(animate11, "repeatCount", "indefinite");
    			add_location(animate11, file$4, 208, 11, 10756);
    			attr_dev(rect11, "x", "49");
    			attr_dev(rect11, "y", "7");
    			attr_dev(rect11, "rx", "0");
    			attr_dev(rect11, "ry", "0");
    			attr_dev(rect11, "width", "2");
    			attr_dev(rect11, "height", "26");
    			add_location(rect11, file$4, 207, 10, 10688);
    			attr_dev(g11, "transform", "rotate(330 50 50)");
    			add_location(g11, file$4, 206, 9, 10643);
    			attr_dev(svg, "class", "icon icon-load icon-large fill svelte-1eg37wb");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid");
    			add_location(svg, file$4, 150, 8, 7390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g0);
    			append_dev(g0, rect0);
    			append_dev(rect0, animate0);
    			append_dev(svg, g1);
    			append_dev(g1, rect1);
    			append_dev(rect1, animate1);
    			append_dev(svg, g2);
    			append_dev(g2, rect2);
    			append_dev(rect2, animate2);
    			append_dev(svg, g3);
    			append_dev(g3, rect3);
    			append_dev(rect3, animate3);
    			append_dev(svg, g4);
    			append_dev(g4, rect4);
    			append_dev(rect4, animate4);
    			append_dev(svg, g5);
    			append_dev(g5, rect5);
    			append_dev(rect5, animate5);
    			append_dev(svg, g6);
    			append_dev(g6, rect6);
    			append_dev(rect6, animate6);
    			append_dev(svg, g7);
    			append_dev(g7, rect7);
    			append_dev(rect7, animate7);
    			append_dev(svg, g8);
    			append_dev(g8, rect8);
    			append_dev(rect8, animate8);
    			append_dev(svg, g9);
    			append_dev(g9, rect9);
    			append_dev(rect9, animate9);
    			append_dev(svg, g10);
    			append_dev(g10, rect10);
    			append_dev(rect10, animate10);
    			append_dev(svg, g11);
    			append_dev(g11, rect11);
    			append_dev(rect11, animate11);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(150:7) {#if $lazyloader.status === LazyLoadStatus.LOADING}",
    		ctx
    	});

    	return block;
    }

    // (62:5) {:else}
    function create_else_block$3(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;
    	let div;

    	function select_block_type_3(ctx, dirty) {
    		if (/*$lazyloader*/ ctx[4].status === LazyLoadStatus.LOADING) return create_if_block_3;
    		if (/*$lazyloader*/ ctx[4].status === LazyLoadStatus.ERR) return create_if_block_4;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			if (!src_url_equal(img.src, img_src_value = /*thumbDarkSrc*/ ctx[9])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `Daniel Sharkov's project ${/*$_*/ ctx[5]('project.' + /*project*/ ctx[6].id)} thumbnail`);
    			attr_dev(img, "class", "thumb svelte-1eg37wb");
    			add_location(img, file$4, 62, 6, 2376);
    			attr_dev(div, "class", "lazyloader flex flex-center svelte-1eg37wb");
    			add_location(div, file$4, 66, 6, 2521);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 32 && img_alt_value !== (img_alt_value = `Daniel Sharkov's project ${/*$_*/ ctx[5]('project.' + /*project*/ ctx[6].id)} thumbnail`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(62:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:5) {#if $lazyloader.status === LazyLoadStatus.DONE}
    function create_if_block_2$2(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*previewDarkSrc*/ ctx[10])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `Daniel Sharkov's project ${/*$_*/ ctx[5]('project.' + /*project*/ ctx[6].id)} preview dark`);
    			attr_dev(img, "class", "image svelte-1eg37wb");
    			add_location(img, file$4, 57, 6, 2212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 32 && img_alt_value !== (img_alt_value = `Daniel Sharkov's project ${/*$_*/ ctx[5]('project.' + /*project*/ ctx[6].id)} preview dark`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(57:5) {#if $lazyloader.status === LazyLoadStatus.DONE}",
    		ctx
    	});

    	return block;
    }

    // (131:59) 
    function create_if_block_4(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z");
    			add_location(path, file$4, 132, 9, 6351);
    			attr_dev(svg, "class", "icon icon-error icon-large fill svelte-1eg37wb");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "fill", "none");
    			add_location(svg, file$4, 131, 8, 6226);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(131:59) ",
    		ctx
    	});

    	return block;
    }

    // (68:7) {#if $lazyloader.status === LazyLoadStatus.LOADING}
    function create_if_block_3(ctx) {
    	let svg;
    	let g0;
    	let rect0;
    	let animate0;
    	let g1;
    	let rect1;
    	let animate1;
    	let g2;
    	let rect2;
    	let animate2;
    	let g3;
    	let rect3;
    	let animate3;
    	let g4;
    	let rect4;
    	let animate4;
    	let g5;
    	let rect5;
    	let animate5;
    	let g6;
    	let rect6;
    	let animate6;
    	let g7;
    	let rect7;
    	let animate7;
    	let g8;
    	let rect8;
    	let animate8;
    	let g9;
    	let rect9;
    	let animate9;
    	let g10;
    	let rect10;
    	let animate10;
    	let g11;
    	let rect11;
    	let animate11;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			rect0 = svg_element("rect");
    			animate0 = svg_element("animate");
    			g1 = svg_element("g");
    			rect1 = svg_element("rect");
    			animate1 = svg_element("animate");
    			g2 = svg_element("g");
    			rect2 = svg_element("rect");
    			animate2 = svg_element("animate");
    			g3 = svg_element("g");
    			rect3 = svg_element("rect");
    			animate3 = svg_element("animate");
    			g4 = svg_element("g");
    			rect4 = svg_element("rect");
    			animate4 = svg_element("animate");
    			g5 = svg_element("g");
    			rect5 = svg_element("rect");
    			animate5 = svg_element("animate");
    			g6 = svg_element("g");
    			rect6 = svg_element("rect");
    			animate6 = svg_element("animate");
    			g7 = svg_element("g");
    			rect7 = svg_element("rect");
    			animate7 = svg_element("animate");
    			g8 = svg_element("g");
    			rect8 = svg_element("rect");
    			animate8 = svg_element("animate");
    			g9 = svg_element("g");
    			rect9 = svg_element("rect");
    			animate9 = svg_element("animate");
    			g10 = svg_element("g");
    			rect10 = svg_element("rect");
    			animate10 = svg_element("animate");
    			g11 = svg_element("g");
    			rect11 = svg_element("rect");
    			animate11 = svg_element("animate");
    			attr_dev(animate0, "attributeName", "opacity");
    			attr_dev(animate0, "values", "1;0");
    			attr_dev(animate0, "keyTimes", "0;1");
    			attr_dev(animate0, "dur", "1s");
    			attr_dev(animate0, "begin", "-0.9166666666666666s");
    			attr_dev(animate0, "repeatCount", "indefinite");
    			add_location(animate0, file$4, 71, 11, 2929);
    			attr_dev(rect0, "x", "49");
    			attr_dev(rect0, "y", "7");
    			attr_dev(rect0, "rx", "0");
    			attr_dev(rect0, "ry", "0");
    			attr_dev(rect0, "width", "2");
    			attr_dev(rect0, "height", "26");
    			add_location(rect0, file$4, 70, 10, 2861);
    			attr_dev(g0, "transform", "rotate(0 50 50)");
    			add_location(g0, file$4, 69, 9, 2818);
    			attr_dev(animate1, "attributeName", "opacity");
    			attr_dev(animate1, "values", "1;0");
    			attr_dev(animate1, "keyTimes", "0;1");
    			attr_dev(animate1, "dur", "1s");
    			attr_dev(animate1, "begin", "-0.8333333333333334s");
    			attr_dev(animate1, "repeatCount", "indefinite");
    			add_location(animate1, file$4, 76, 11, 3211);
    			attr_dev(rect1, "x", "49");
    			attr_dev(rect1, "y", "7");
    			attr_dev(rect1, "rx", "0");
    			attr_dev(rect1, "ry", "0");
    			attr_dev(rect1, "width", "2");
    			attr_dev(rect1, "height", "26");
    			add_location(rect1, file$4, 75, 10, 3143);
    			attr_dev(g1, "transform", "rotate(30 50 50)");
    			add_location(g1, file$4, 74, 9, 3099);
    			attr_dev(animate2, "attributeName", "opacity");
    			attr_dev(animate2, "values", "1;0");
    			attr_dev(animate2, "keyTimes", "0;1");
    			attr_dev(animate2, "dur", "1s");
    			attr_dev(animate2, "begin", "-0.75s");
    			attr_dev(animate2, "repeatCount", "indefinite");
    			add_location(animate2, file$4, 81, 11, 3493);
    			attr_dev(rect2, "x", "49");
    			attr_dev(rect2, "y", "7");
    			attr_dev(rect2, "rx", "0");
    			attr_dev(rect2, "ry", "0");
    			attr_dev(rect2, "width", "2");
    			attr_dev(rect2, "height", "26");
    			add_location(rect2, file$4, 80, 10, 3425);
    			attr_dev(g2, "transform", "rotate(60 50 50)");
    			add_location(g2, file$4, 79, 9, 3381);
    			attr_dev(animate3, "attributeName", "opacity");
    			attr_dev(animate3, "values", "1;0");
    			attr_dev(animate3, "keyTimes", "0;1");
    			attr_dev(animate3, "dur", "1s");
    			attr_dev(animate3, "begin", "-0.6666666666666666s");
    			attr_dev(animate3, "repeatCount", "indefinite");
    			add_location(animate3, file$4, 86, 11, 3761);
    			attr_dev(rect3, "x", "49");
    			attr_dev(rect3, "y", "7");
    			attr_dev(rect3, "rx", "0");
    			attr_dev(rect3, "ry", "0");
    			attr_dev(rect3, "width", "2");
    			attr_dev(rect3, "height", "26");
    			add_location(rect3, file$4, 85, 10, 3693);
    			attr_dev(g3, "transform", "rotate(90 50 50)");
    			add_location(g3, file$4, 84, 9, 3649);
    			attr_dev(animate4, "attributeName", "opacity");
    			attr_dev(animate4, "values", "1;0");
    			attr_dev(animate4, "keyTimes", "0;1");
    			attr_dev(animate4, "dur", "1s");
    			attr_dev(animate4, "begin", "-0.5833333333333334s");
    			attr_dev(animate4, "repeatCount", "indefinite");
    			add_location(animate4, file$4, 91, 11, 4044);
    			attr_dev(rect4, "x", "49");
    			attr_dev(rect4, "y", "7");
    			attr_dev(rect4, "rx", "0");
    			attr_dev(rect4, "ry", "0");
    			attr_dev(rect4, "width", "2");
    			attr_dev(rect4, "height", "26");
    			add_location(rect4, file$4, 90, 10, 3976);
    			attr_dev(g4, "transform", "rotate(120 50 50)");
    			add_location(g4, file$4, 89, 9, 3931);
    			attr_dev(animate5, "attributeName", "opacity");
    			attr_dev(animate5, "values", "1;0");
    			attr_dev(animate5, "keyTimes", "0;1");
    			attr_dev(animate5, "dur", "1s");
    			attr_dev(animate5, "begin", "-0.5s");
    			attr_dev(animate5, "repeatCount", "indefinite");
    			add_location(animate5, file$4, 96, 11, 4327);
    			attr_dev(rect5, "x", "49");
    			attr_dev(rect5, "y", "7");
    			attr_dev(rect5, "rx", "0");
    			attr_dev(rect5, "ry", "0");
    			attr_dev(rect5, "width", "2");
    			attr_dev(rect5, "height", "26");
    			add_location(rect5, file$4, 95, 10, 4259);
    			attr_dev(g5, "transform", "rotate(150 50 50)");
    			add_location(g5, file$4, 94, 9, 4214);
    			attr_dev(animate6, "attributeName", "opacity");
    			attr_dev(animate6, "values", "1;0");
    			attr_dev(animate6, "keyTimes", "0;1");
    			attr_dev(animate6, "dur", "1s");
    			attr_dev(animate6, "begin", "-0.4166666666666667s");
    			attr_dev(animate6, "repeatCount", "indefinite");
    			add_location(animate6, file$4, 101, 11, 4595);
    			attr_dev(rect6, "x", "49");
    			attr_dev(rect6, "y", "7");
    			attr_dev(rect6, "rx", "0");
    			attr_dev(rect6, "ry", "0");
    			attr_dev(rect6, "width", "2");
    			attr_dev(rect6, "height", "26");
    			add_location(rect6, file$4, 100, 10, 4527);
    			attr_dev(g6, "transform", "rotate(180 50 50)");
    			add_location(g6, file$4, 99, 9, 4482);
    			attr_dev(animate7, "attributeName", "opacity");
    			attr_dev(animate7, "values", "1;0");
    			attr_dev(animate7, "keyTimes", "0;1");
    			attr_dev(animate7, "dur", "1s");
    			attr_dev(animate7, "begin", "-0.3333333333333333s");
    			attr_dev(animate7, "repeatCount", "indefinite");
    			add_location(animate7, file$4, 106, 11, 4878);
    			attr_dev(rect7, "x", "49");
    			attr_dev(rect7, "y", "7");
    			attr_dev(rect7, "rx", "0");
    			attr_dev(rect7, "ry", "0");
    			attr_dev(rect7, "width", "2");
    			attr_dev(rect7, "height", "26");
    			add_location(rect7, file$4, 105, 10, 4810);
    			attr_dev(g7, "transform", "rotate(210 50 50)");
    			add_location(g7, file$4, 104, 9, 4765);
    			attr_dev(animate8, "attributeName", "opacity");
    			attr_dev(animate8, "values", "1;0");
    			attr_dev(animate8, "keyTimes", "0;1");
    			attr_dev(animate8, "dur", "1s");
    			attr_dev(animate8, "begin", "-0.25s");
    			attr_dev(animate8, "repeatCount", "indefinite");
    			add_location(animate8, file$4, 111, 11, 5161);
    			attr_dev(rect8, "x", "49");
    			attr_dev(rect8, "y", "7");
    			attr_dev(rect8, "rx", "0");
    			attr_dev(rect8, "ry", "0");
    			attr_dev(rect8, "width", "2");
    			attr_dev(rect8, "height", "26");
    			add_location(rect8, file$4, 110, 10, 5093);
    			attr_dev(g8, "transform", "rotate(240 50 50)");
    			add_location(g8, file$4, 109, 9, 5048);
    			attr_dev(animate9, "attributeName", "opacity");
    			attr_dev(animate9, "values", "1;0");
    			attr_dev(animate9, "keyTimes", "0;1");
    			attr_dev(animate9, "dur", "1s");
    			attr_dev(animate9, "begin", "-0.16666666666666666s");
    			attr_dev(animate9, "repeatCount", "indefinite");
    			add_location(animate9, file$4, 116, 11, 5430);
    			attr_dev(rect9, "x", "49");
    			attr_dev(rect9, "y", "7");
    			attr_dev(rect9, "rx", "0");
    			attr_dev(rect9, "ry", "0");
    			attr_dev(rect9, "width", "2");
    			attr_dev(rect9, "height", "26");
    			add_location(rect9, file$4, 115, 10, 5362);
    			attr_dev(g9, "transform", "rotate(270 50 50)");
    			add_location(g9, file$4, 114, 9, 5317);
    			attr_dev(animate10, "attributeName", "opacity");
    			attr_dev(animate10, "values", "1;0");
    			attr_dev(animate10, "keyTimes", "0;1");
    			attr_dev(animate10, "dur", "1s");
    			attr_dev(animate10, "begin", "-0.08333333333333333s");
    			attr_dev(animate10, "repeatCount", "indefinite");
    			add_location(animate10, file$4, 121, 11, 5714);
    			attr_dev(rect10, "x", "49");
    			attr_dev(rect10, "y", "7");
    			attr_dev(rect10, "rx", "0");
    			attr_dev(rect10, "ry", "0");
    			attr_dev(rect10, "width", "2");
    			attr_dev(rect10, "height", "26");
    			add_location(rect10, file$4, 120, 10, 5646);
    			attr_dev(g10, "transform", "rotate(300 50 50)");
    			add_location(g10, file$4, 119, 9, 5601);
    			attr_dev(animate11, "attributeName", "opacity");
    			attr_dev(animate11, "values", "1;0");
    			attr_dev(animate11, "keyTimes", "0;1");
    			attr_dev(animate11, "dur", "1s");
    			attr_dev(animate11, "begin", "0s");
    			attr_dev(animate11, "repeatCount", "indefinite");
    			add_location(animate11, file$4, 126, 11, 5998);
    			attr_dev(rect11, "x", "49");
    			attr_dev(rect11, "y", "7");
    			attr_dev(rect11, "rx", "0");
    			attr_dev(rect11, "ry", "0");
    			attr_dev(rect11, "width", "2");
    			attr_dev(rect11, "height", "26");
    			add_location(rect11, file$4, 125, 10, 5930);
    			attr_dev(g11, "transform", "rotate(330 50 50)");
    			add_location(g11, file$4, 124, 9, 5885);
    			attr_dev(svg, "class", "icon icon-load icon-large fill svelte-1eg37wb");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid");
    			add_location(svg, file$4, 68, 8, 2632);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g0);
    			append_dev(g0, rect0);
    			append_dev(rect0, animate0);
    			append_dev(svg, g1);
    			append_dev(g1, rect1);
    			append_dev(rect1, animate1);
    			append_dev(svg, g2);
    			append_dev(g2, rect2);
    			append_dev(rect2, animate2);
    			append_dev(svg, g3);
    			append_dev(g3, rect3);
    			append_dev(rect3, animate3);
    			append_dev(svg, g4);
    			append_dev(g4, rect4);
    			append_dev(rect4, animate4);
    			append_dev(svg, g5);
    			append_dev(g5, rect5);
    			append_dev(rect5, animate5);
    			append_dev(svg, g6);
    			append_dev(g6, rect6);
    			append_dev(rect6, animate6);
    			append_dev(svg, g7);
    			append_dev(g7, rect7);
    			append_dev(rect7, animate7);
    			append_dev(svg, g8);
    			append_dev(g8, rect8);
    			append_dev(rect8, animate8);
    			append_dev(svg, g9);
    			append_dev(g9, rect9);
    			append_dev(rect9, animate9);
    			append_dev(svg, g10);
    			append_dev(g10, rect10);
    			append_dev(rect10, animate10);
    			append_dev(svg, g11);
    			append_dev(g11, rect11);
    			append_dev(rect11, animate11);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(68:7) {#if $lazyloader.status === LazyLoadStatus.LOADING}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let button;
    	let div0;
    	let t0;
    	let div1;
    	let span;
    	let t1_value = /*$_*/ ctx[5]('project.' + /*project*/ ctx[6].id) + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*project*/ ctx[6].cover) return create_if_block$4;
    		return create_else_block_2;
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
    			t1 = text(t1_value);
    			attr_dev(div0, "class", "preview block-select svelte-1eg37wb");
    			attr_dev(div0, "role", "img");
    			toggle_class(div0, "dark-theme", /*project*/ ctx[6].darkTheme);
    			add_location(div0, file$4, 52, 1, 1905);
    			attr_dev(span, "class", "name svelte-1eg37wb");
    			add_location(span, file$4, 236, 2, 13013);
    			attr_dev(div1, "class", "contents svelte-1eg37wb");
    			add_location(div1, file$4, 235, 1, 12987);
    			attr_dev(button, "class", "project grid svelte-1eg37wb");
    			set_style(button, "animation-delay", 1000 + /*projectIndex*/ ctx[0] * 100 + "ms");
    			add_location(button, file$4, 51, 0, 1791);
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
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*openThisProject*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    			if (dirty & /*$_*/ 32 && t1_value !== (t1_value = /*$_*/ ctx[5]('project.' + /*project*/ ctx[6].id) + "")) set_data_dev(t1, t1_value);

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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let customGradientBG;
    	let $GlobalStore;

    	let $lazyloader,
    		$$unsubscribe_lazyloader = noop,
    		$$subscribe_lazyloader = () => ($$unsubscribe_lazyloader(), $$unsubscribe_lazyloader = subscribe(lazyloader, $$value => $$invalidate(4, $lazyloader = $$value)), lazyloader);

    	let $_;
    	validate_store(GlobalStore, 'GlobalStore');
    	component_subscribe($$self, GlobalStore, $$value => $$invalidate(3, $GlobalStore = $$value));
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(5, $_ = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_lazyloader());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProjectPreviewTile', slots, []);
    	const dispatch = createEventDispatcher();
    	let { projectIndex } = $$props;
    	let project = projects[projectIndex];
    	const thumbSrc = `projects/${project.id}/thumbnail.jpg`;
    	const previewSrc = `projects/${project.id}/preview.jpg`;
    	const thumbDarkSrc = `projects/${project.id}/thumbnail_dark.jpg`;
    	const previewDarkSrc = `projects/${project.id}/preview_dark.jpg`;

    	function openThisProject() {
    		vibrate();
    		dispatch('open');
    	}

    	let isCurrentDarkMode = get_store_value(GlobalStore).a11y.darkMode;
    	let lazyloader;

    	function loadPreview() {
    		if (!project.cover) return;

    		if (isCurrentDarkMode && project.darkTheme) {
    			$$subscribe_lazyloader($$invalidate(1, lazyloader = new LazyLoader(`projects/${project.id}/preview_dark.jpg`)));
    		} else {
    			$$subscribe_lazyloader($$invalidate(1, lazyloader = new LazyLoader(`projects/${project.id}/preview.jpg`)));
    		}

    		lazyloader.load();
    	}

    	loadPreview();

    	const unSubDarkModeWatcher = GlobalStore.subscribe(s => {
    		if (s.a11y.darkMode !== isCurrentDarkMode) {
    			isCurrentDarkMode = s.a11y.darkMode;
    			loadPreview();
    		}
    	});

    	onDestroy(function () {
    		unSubDarkModeWatcher();
    		if (lazyloader && lazyloader.destroy) lazyloader.destroy();
    	});

    	const writable_props = ['projectIndex'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProjectPreviewTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('projectIndex' in $$props) $$invalidate(0, projectIndex = $$props.projectIndex);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		dispatch,
    		projects,
    		GlobalStore,
    		vibrate,
    		_: X,
    		LazyLoader,
    		LazyLoadStatus,
    		getStore: get_store_value,
    		projectIndex,
    		project,
    		thumbSrc,
    		previewSrc,
    		thumbDarkSrc,
    		previewDarkSrc,
    		openThisProject,
    		isCurrentDarkMode,
    		lazyloader,
    		loadPreview,
    		unSubDarkModeWatcher,
    		customGradientBG,
    		$GlobalStore,
    		$lazyloader,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('projectIndex' in $$props) $$invalidate(0, projectIndex = $$props.projectIndex);
    		if ('project' in $$props) $$invalidate(6, project = $$props.project);
    		if ('isCurrentDarkMode' in $$props) isCurrentDarkMode = $$props.isCurrentDarkMode;
    		if ('lazyloader' in $$props) $$subscribe_lazyloader($$invalidate(1, lazyloader = $$props.lazyloader));
    		if ('customGradientBG' in $$props) $$invalidate(2, customGradientBG = $$props.customGradientBG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(2, customGradientBG = Array.isArray(project.gradient)
    	? `background: -webkit-linear-gradient(125deg, ${project.gradient.join(',')});` + `background: linear-gradient(125deg, ${project.gradient.join(',')});`
    	: '');

    	return [
    		projectIndex,
    		lazyloader,
    		customGradientBG,
    		$GlobalStore,
    		$lazyloader,
    		$_,
    		project,
    		thumbSrc,
    		previewSrc,
    		thumbDarkSrc,
    		previewDarkSrc,
    		openThisProject
    	];
    }

    class ProjectPreviewTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { projectIndex: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectPreviewTile",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*projectIndex*/ ctx[0] === undefined && !('projectIndex' in props)) {
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

    /* src\sections\ProjectsSection.svelte generated by Svelte v3.44.1 */
    const file$3 = "src\\sections\\ProjectsSection.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (35:1) {#if clickedProject !== null}
    function create_if_block$3(ctx) {
    	let projectdetails;
    	let updating_projectIndex;
    	let current;

    	function projectdetails_projectIndex_binding(value) {
    		/*projectdetails_projectIndex_binding*/ ctx[4](value);
    	}

    	let projectdetails_props = {};

    	if (/*clickedProject*/ ctx[0] !== void 0) {
    		projectdetails_props.projectIndex = /*clickedProject*/ ctx[0];
    	}

    	projectdetails = new ProjectDetails({
    			props: projectdetails_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(projectdetails, 'projectIndex', projectdetails_projectIndex_binding));
    	projectdetails.$on("close", /*closeProject*/ ctx[2]);

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

    			if (!updating_projectIndex && dirty & /*clickedProject*/ 1) {
    				updating_projectIndex = true;
    				projectdetails_changes.projectIndex = /*clickedProject*/ ctx[0];
    				add_flush_callback(() => updating_projectIndex = false);
    			}

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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(35:1) {#if clickedProject !== null}",
    		ctx
    	});

    	return block;
    }

    // (46:2) {#each projects as _, idx}
    function create_each_block$3(ctx) {
    	let projectpreviewtile;
    	let current;

    	function open_handler() {
    		return /*open_handler*/ ctx[5](/*idx*/ ctx[9]);
    	}

    	projectpreviewtile = new ProjectPreviewTile({
    			props: { projectIndex: /*idx*/ ctx[9] },
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(46:2) {#each projects as _, idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div0;
    	let t0;
    	let section;
    	let h1;
    	let t1_value = /*$_*/ ctx[1]('section.projects.title') + "";
    	let t1;
    	let t2;
    	let div1;
    	let current;
    	let if_block = /*clickedProject*/ ctx[0] !== null && create_if_block$3(ctx);
    	let each_value = projects;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			section = element("section");
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "id", "ProjectDetailsContainer");
    			attr_dev(div0, "class", "modal-container svelte-1edq1sk");
    			toggle_class(div0, "active", /*clickedProject*/ ctx[0] !== null);
    			add_location(div0, file$3, 33, 0, 1218);
    			attr_dev(h1, "id", "projects");
    			attr_dev(h1, "class", "display-3 svelte-1edq1sk");
    			add_location(h1, file$3, 43, 1, 1471);
    			attr_dev(div1, "class", "projects grid svelte-1edq1sk");
    			attr_dev(div1, "role", "feed");
    			add_location(div1, file$3, 44, 1, 1545);
    			add_location(section, file$3, 42, 0, 1459);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if (if_block) if_block.m(div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(h1, t1);
    			append_dev(section, t2);
    			append_dev(section, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
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
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*clickedProject*/ 1) {
    				toggle_class(div0, "active", /*clickedProject*/ ctx[0] !== null);
    			}

    			if ((!current || dirty & /*$_*/ 2) && t1_value !== (t1_value = /*$_*/ ctx[1]('section.projects.title') + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*openProject*/ 8) {
    				each_value = projects;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
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
    			if (detaching) detach_dev(div0);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
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

    const LockScroll_SectionModal = 'projects_section_modal';

    function instance$3($$self, $$props, $$invalidate) {
    	let $_;
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(1, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProjectsSection', slots, []);
    	let clickedProject = null;

    	function closeProject() {
    		if (clickedProject !== null) {
    			GlobalStore.unlockScroll(LockScroll_SectionModal);
    		}

    		removeQuery('project');
    		$$invalidate(0, clickedProject = null);
    	}

    	function openProject(idx) {
    		$$invalidate(0, clickedProject = idx);
    		$$invalidate(0, clickedProject);

    		setQuery(
    			'project',
    			projects[clickedProject].id,
    			{
    				'project_id': projects[clickedProject].id,
    				'title': $_('project.' + projects[clickedProject].id)
    			},
    			$_('project.' + projects[clickedProject].id)
    		);

    		GlobalStore.lockScroll(LockScroll_SectionModal);
    	}

    	let queryProject = getQuery('project');

    	if (projectsIndexByID[queryProject]) {
    		openProject(projectsIndexByID[queryProject]);
    	} else {
    		removeQuery('project');
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProjectsSection> was created with unknown prop '${key}'`);
    	});

    	function projectdetails_projectIndex_binding(value) {
    		clickedProject = value;
    		$$invalidate(0, clickedProject);
    	}

    	const open_handler = idx => openProject(idx);

    	$$self.$capture_state = () => ({
    		ProjectDetails,
    		GlobalStore,
    		projects,
    		projectsIndexByID,
    		ProjectPreviewTile,
    		_: X,
    		getQuery,
    		removeQuery,
    		setQuery,
    		LockScroll_SectionModal,
    		clickedProject,
    		closeProject,
    		openProject,
    		queryProject,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('clickedProject' in $$props) $$invalidate(0, clickedProject = $$props.clickedProject);
    		if ('queryProject' in $$props) queryProject = $$props.queryProject;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		clickedProject,
    		$_,
    		closeProject,
    		openProject,
    		projectdetails_projectIndex_binding,
    		open_handler
    	];
    }

    class ProjectsSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectsSection",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\sections\SkillsSection.svelte generated by Svelte v3.44.1 */

    const { Object: Object_1 } = globals;
    const file$2 = "src\\sections\\SkillsSection.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (8:3) {#each Array(yearsSinceCareerBegin) as _}
    function create_each_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "period svelte-1syys9o");
    			add_location(div, file$2, 8, 4, 331);
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
    		source: "(8:3) {#each Array(yearsSinceCareerBegin) as _}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {:else}
    function create_else_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "period placeholder svelte-1syys9o");
    			add_location(span, file$2, 16, 5, 590);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(16:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#if showHeaderYear(idx)}
    function create_if_block_2$1(ctx) {
    	let span;
    	let t_value = careerBegin + /*idx*/ ctx[13] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "period flex flex-center svelte-1syys9o");
    			add_location(span, file$2, 14, 5, 506);
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(14:4) {#if showHeaderYear(idx)}",
    		ctx
    	});

    	return block;
    }

    // (13:3) {#each Array(yearsSinceCareerBegin) as _, idx}
    function create_each_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*showHeaderYear*/ ctx[4](/*idx*/ ctx[13])) return create_if_block_2$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(13:3) {#each Array(yearsSinceCareerBegin) as _, idx}",
    		ctx
    	});

    	return block;
    }

    // (35:5) {:else}
    function create_else_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "logo placeholder svelte-1syys9o");
    			add_location(div, file$2, 35, 6, 1191);
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(35:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (29:42) 
    function create_if_block_1$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "logo svelte-1syys9o");
    			if (!src_url_equal(img.src, img_src_value = "technologies/logo_" + /*techno*/ ctx[5] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "" + (/*techno*/ ctx[5] + " Logo"));
    			add_location(img, file$2, 29, 6, 1061);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(29:42) ",
    		ctx
    	});

    	return block;
    }

    // (24:5) {#if technologies[techno].icon}
    function create_if_block$2(ctx) {
    	let svg;
    	let title;
    	let t0_value = /*techno*/ ctx[5] + "";
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
    			add_location(title, file$2, 25, 7, 924);
    			xlink_attr(use, "xlink:href", "#LOGO_" + /*techno*/ ctx[5]);
    			add_location(use, file$2, 26, 7, 961);
    			attr_dev(svg, "class", "logo flex-base-size svelte-1syys9o");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$2, 24, 6, 825);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(24:5) {#if technologies[techno].icon}",
    		ctx
    	});

    	return block;
    }

    // (54:5) {#each technologies[techno].careerSpan as period}
    function create_each_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "period svelte-1syys9o");
    			attr_dev(div, "style", /*technoCareerSpan*/ ctx[3](technologies[/*techno*/ ctx[5]], /*period*/ ctx[8]));
    			add_location(div, file$2, 54, 6, 2312);
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(54:5) {#each technologies[techno].careerSpan as period}",
    		ctx
    	});

    	return block;
    }

    // (21:2) {#each Object.keys(technologies) as techno}
    function create_each_block$2(ctx) {
    	let li;
    	let div1;
    	let t0;
    	let div0;
    	let span0;
    	let t1_value = technologies[/*techno*/ ctx[5]].name + "";
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*$_*/ ctx[0]('section.skills.technology_type.' + technologies[/*techno*/ ctx[5]].type) + "";
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

    	function select_block_type_1(ctx, dirty) {
    		if (technologies[/*techno*/ ctx[5]].icon) return create_if_block$2;
    		if (technologies[/*techno*/ ctx[5]].image) return create_if_block_1$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_1 = technologies[/*techno*/ ctx[5]].careerSpan;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
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
    			attr_dev(span0, "class", "name flex-base-size svelte-1syys9o");
    			add_location(span0, file$2, 38, 6, 1269);
    			attr_dev(span1, "class", "type flex-base-size svelte-1syys9o");
    			add_location(span1, file$2, 41, 6, 1362);
    			attr_dev(div0, "class", "naming svelte-1syys9o");
    			add_location(div0, file$2, 37, 5, 1241);
    			attr_dev(path0, "d", "M57.7778 25H35C29.4772 25 25 29.4772 25 35V85C25 90.5228 29.4772 95 35 95H85C90.5228 95 95 90.5228 95 85V62.2222");
    			attr_dev(path0, "stroke-width", ".5em");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "class", "svelte-1syys9o");
    			add_location(path0, file$2, 47, 7, 1785);
    			attr_dev(path1, "d", "M105 15L60 60M105 15L105 45M105 15L75 15");
    			attr_dev(path1, "stroke-width", ".5em");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "class", "svelte-1syys9o");
    			add_location(path1, file$2, 48, 7, 1985);
    			attr_dev(svg, "class", "icon stroke icon-medium svelte-1syys9o");
    			attr_dev(svg, "viewBox", "0 0 120 120");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$2, 46, 6, 1613);
    			attr_dev(a, "href", technologies[/*techno*/ ctx[5]].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "link flex flex-center svelte-1syys9o");
    			add_location(a, file$2, 45, 5, 1507);
    			attr_dev(div1, "class", "header flex flex-center-y svelte-1syys9o");
    			add_location(div1, file$2, 22, 4, 740);
    			attr_dev(div2, "class", "time-span grid svelte-1syys9o");
    			set_style(div2, "grid-template-columns", "repeat(" + (/*currentYear*/ ctx[1] - careerBegin) + ", 1fr)");
    			add_location(div2, file$2, 52, 4, 2147);
    			attr_dev(li, "class", "techno svelte-1syys9o");
    			add_location(li, file$2, 21, 3, 715);
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
    				dispose = action_destroyer(vibrateLink.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    			if (dirty & /*$_*/ 1 && t3_value !== (t3_value = /*$_*/ ctx[0]('section.skills.technology_type.' + technologies[/*techno*/ ctx[5]].type) + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*technoCareerSpan, technologies, Object*/ 8) {
    				each_value_1 = technologies[/*techno*/ ctx[5]].careerSpan;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(21:2) {#each Object.keys(technologies) as techno}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let div0;
    	let h1;
    	let t0_value = /*$_*/ ctx[0]('section.skills.title') + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*$_*/ ctx[0]('section.skills.description') + "";
    	let t2;
    	let t3;
    	let ul;
    	let div1;
    	let t4;
    	let div2;
    	let t5;
    	let each_value_3 = Array(/*yearsSinceCareerBegin*/ ctx[2]);
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = Array(/*yearsSinceCareerBegin*/ ctx[2]);
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = Object.keys(technologies);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
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

    			attr_dev(h1, "id", "skills");
    			attr_dev(h1, "class", "display-3 svelte-1syys9o");
    			add_location(h1, file$2, 2, 2, 64);
    			attr_dev(p, "class", "subtitle");
    			add_location(p, file$2, 3, 2, 135);
    			attr_dev(div0, "class", "section-header svelte-1syys9o");
    			add_location(div0, file$2, 1, 1, 32);
    			attr_dev(div1, "class", "background-seperators flex svelte-1syys9o");
    			add_location(div1, file$2, 6, 2, 239);
    			attr_dev(div2, "class", "header flex flex-center-y svelte-1syys9o");
    			add_location(div2, file$2, 11, 2, 378);
    			attr_dev(ul, "class", "technologies grid svelte-1syys9o");
    			add_location(ul, file$2, 5, 1, 205);
    			attr_dev(section, "class", "auto-height svelte-1syys9o");
    			add_location(section, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(p, t2);
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
    			if (dirty & /*$_*/ 1 && t0_value !== (t0_value = /*$_*/ ctx[0]('section.skills.title') + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$_*/ 1 && t2_value !== (t2_value = /*$_*/ ctx[0]('section.skills.description') + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*careerBegin, showHeaderYear*/ 16) {
    				each_value_2 = Array(/*yearsSinceCareerBegin*/ ctx[2]);
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

    			if (dirty & /*currentYear, careerBegin, technologies, Object, technoCareerSpan, $_*/ 11) {
    				each_value = Object.keys(technologies);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $_;
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(0, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SkillsSection', slots, []);
    	const currentYear = Number(new Date().getFullYear());
    	const yearsSinceCareerBegin = currentYear - careerBegin + 1;

    	function technoCareerSpan(techno, [begin, end]) {
    		let endPos = yearsSinceCareerBegin;
    		if (end !== null) endPos = endPos - (currentYear - end);
    		return `background-color: ${techno.color};` + `grid-column-start: ${begin - careerBegin + 1};` + `grid-column-end: ${endPos};`;
    	}

    	function showHeaderYear(idx) {
    		return idx === 0 || idx + 1 === yearsSinceCareerBegin || (careerBegin + idx) % 5 === 0 && idx > 1 && idx < yearsSinceCareerBegin - 2;
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SkillsSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		_: X,
    		careerBegin,
    		technologies,
    		vibrateLink,
    		currentYear,
    		yearsSinceCareerBegin,
    		technoCareerSpan,
    		showHeaderYear,
    		$_
    	});

    	return [$_, currentYear, yearsSinceCareerBegin, technoCareerSpan, showHeaderYear];
    }

    class SkillsSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SkillsSection",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\sections\FooterSection.svelte generated by Svelte v3.44.1 */
    const file$1 = "src\\sections\\FooterSection.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i].name;
    	child_ctx[7] = list[i].url;
    	child_ctx[8] = list[i].app;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (27:4) {:else}
    function create_else_block$1(ctx) {
    	let a;
    	let svg;
    	let title;
    	let t0_value = /*name*/ ctx[6] + "";
    	let t0;
    	let use;
    	let use_xlink_href_value;
    	let t1;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			use = svg_element("use");
    			t1 = space();
    			add_location(title, file$1, 31, 7, 1140);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#LOGO_" + /*name*/ ctx[6]);
    			add_location(use, file$1, 32, 7, 1170);
    			attr_dev(svg, "class", "icon icon-large svelte-fcuril");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$1, 30, 6, 1045);
    			attr_dev(a, "href", a_href_value = /*url*/ ctx[7]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "role", "listitem");
    			attr_dev(a, "class", "btn flex flex-center svelte-fcuril");
    			add_location(a, file$1, 27, 5, 934);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(svg, use);
    			append_dev(a, t1);

    			if (!mounted) {
    				dispose = action_destroyer(vibrateLink.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$GlobalStore*/ 4 && t0_value !== (t0_value = /*name*/ ctx[6] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$GlobalStore*/ 4 && use_xlink_href_value !== (use_xlink_href_value = "#LOGO_" + /*name*/ ctx[6])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}

    			if (dirty & /*$GlobalStore*/ 4 && a_href_value !== (a_href_value = /*url*/ ctx[7])) {
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(27:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#if app}
    function create_if_block$1(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = /*name*/ ctx[6] + "";
    	let t0;
    	let use;
    	let use_xlink_href_value;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*idx*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			use = svg_element("use");
    			t1 = space();
    			add_location(title, file$1, 22, 7, 822);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#LOGO_" + /*name*/ ctx[6]);
    			add_location(use, file$1, 23, 7, 852);
    			attr_dev(svg, "class", "icon icon-large svelte-fcuril");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$1, 21, 6, 727);
    			attr_dev(button, "role", "listitem");
    			attr_dev(button, "class", "btn flex flex-center svelte-fcuril");
    			add_location(button, file$1, 18, 5, 585);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(svg, use);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$GlobalStore*/ 4 && t0_value !== (t0_value = /*name*/ ctx[6] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$GlobalStore*/ 4 && use_xlink_href_value !== (use_xlink_href_value = "#LOGO_" + /*name*/ ctx[6])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(18:4) {#if app}",
    		ctx
    	});

    	return block;
    }

    // (17:3) {#each $GlobalStore.socialMedia as {name, url, app}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*app*/ ctx[8]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(17:3) {#each $GlobalStore.socialMedia as {name, url, app}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let footer;
    	let div;
    	let h1;
    	let t0_value = /*$_*/ ctx[1]('section.contact.title') + "";
    	let t0;
    	let t1;
    	let ul;
    	let t2;
    	let p;
    	let t3_value = /*$_*/ ctx[1]('copyright', { values: { year: /*currentYear*/ ctx[3] } }) + "";
    	let t3;
    	let each_value = /*$GlobalStore*/ ctx[2].socialMedia;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			attr_dev(h1, "id", "contact");
    			attr_dev(h1, "class", "text-center");
    			add_location(h1, file$1, 11, 2, 306);
    			attr_dev(ul, "role", "listbox");
    			attr_dev(ul, "tabindex", "-1");
    			attr_dev(ul, "class", "social-media flex flex-center gap-1 svelte-fcuril");
    			add_location(ul, file$1, 15, 2, 393);
    			attr_dev(div, "class", "get-in-touch grid grid-center svelte-fcuril");
    			add_location(div, file$1, 10, 1, 259);
    			attr_dev(p, "class", "copyright svelte-fcuril");
    			attr_dev(p, "role", "contentinfo");
    			add_location(p, file$1, 40, 1, 1273);
    			attr_dev(footer, "class", "grid svelte-fcuril");
    			add_location(footer, file$1, 9, 0, 235);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			/*ul_binding*/ ctx[5](ul);
    			append_dev(footer, t2);
    			append_dev(footer, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$_*/ 2 && t0_value !== (t0_value = /*$_*/ ctx[1]('section.contact.title') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*GlobalStore, socialMediaButtons, $GlobalStore*/ 5) {
    				each_value = /*$GlobalStore*/ ctx[2].socialMedia;
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

    			if (dirty & /*$_*/ 2 && t3_value !== (t3_value = /*$_*/ ctx[1]('copyright', { values: { year: /*currentYear*/ ctx[3] } }) + "")) set_data_dev(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_each(each_blocks, detaching);
    			/*ul_binding*/ ctx[5](null);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let $_;
    	let $GlobalStore;
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(1, $_ = $$value));
    	validate_store(GlobalStore, 'GlobalStore');
    	component_subscribe($$self, GlobalStore, $$value => $$invalidate(2, $GlobalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FooterSection', slots, []);
    	const currentYear = new Date().getFullYear();
    	let socialMediaButtons;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FooterSection> was created with unknown prop '${key}'`);
    	});

    	const click_handler = idx => GlobalStore.openSocialModal(idx, socialMediaButtons);

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			socialMediaButtons = $$value;
    			$$invalidate(0, socialMediaButtons);
    		});
    	}

    	$$self.$capture_state = () => ({
    		_: X,
    		GlobalStore,
    		vibrateLink,
    		currentYear,
    		socialMediaButtons,
    		$_,
    		$GlobalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('socialMediaButtons' in $$props) $$invalidate(0, socialMediaButtons = $$props.socialMediaButtons);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [socialMediaButtons, $_, $GlobalStore, currentYear, click_handler, ul_binding];
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

    /* src\App.svelte generated by Svelte v3.44.1 */
    const file = "src\\App.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (371:0) {:else}
    function create_else_block(ctx) {
    	let metatags;
    	let t0;
    	let main;
    	let span;
    	let t1_value = /*$_*/ ctx[7]('b_e_t_a') + "";
    	let t1;
    	let t2;
    	let div1;
    	let button;
    	let svg0;
    	let path;
    	let t3;
    	let svg1;
    	let title;
    	let t4_value = LocaleFullName[/*$i18n*/ ctx[8]] + "";
    	let t4;
    	let use;
    	let use_xlink_href_value;
    	let t5;
    	let div0;
    	let div1_tabindex_value;
    	let t6;
    	let landingsection;
    	let t7;
    	let projectssection;
    	let t8;
    	let skillssection;
    	let t9;
    	let aboutmesection;
    	let t10;
    	let footersection;
    	let t11;
    	let div2;
    	let main_lock_scroll_value;
    	let main_reduced_motion_value;
    	let main_more_contrast_value;
    	let current;
    	let mounted;
    	let dispose;

    	metatags = new MetaTags({
    			props: {
    				title: /*$_*/ ctx[7]('page_title'),
    				description: /*$_*/ ctx[7]('about_me'),
    				twitter: {
    					handle: '@Daniel_Sharkov',
    					site: '@Daniel_Sharkov',
    					cardType: 'summary_large_image'
    				},
    				openGraph: {
    					site_name: /*$_*/ ctx[7]('page_title'),
    					url: 'http://danielsharkov.com',
    					title: /*$_*/ ctx[7]('page_title'),
    					description: /*$_*/ ctx[7]('about_me'),
    					locale: /*$i18n*/ ctx[8],
    					profile: {
    						firstName: 'Daniel',
    						lastName: 'Scharkov',
    						username: 'DaSh_x097'
    					},
    					images: [
    						{
    							url: 'http://danielsharkov.com/projects/danielsharkov_com/cover.png',
    							width: 1920,
    							height: 1200,
    							alt: 'danielsharkov.com cover'
    						},
    						{
    							url: 'http://danielsharkov.com/projects/danielsharkov_com/preview.png',
    							width: 1024,
    							height: 640,
    							alt: 'danielsharkov.com preview'
    						},
    						{
    							url: 'http://danielsharkov.com/projects/danielsharkov_com/thumbnail.png',
    							width: 300,
    							height: 188,
    							alt: 'danielsharkov.com thumbnail'
    						}
    					]
    				}
    			},
    			$$inline: true
    		});

    	let each_value_1 = LocaleList;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	landingsection = new LandingSection({ $$inline: true });
    	landingsection.$on("goToSection", /*goToSection*/ ctx[10]);
    	projectssection = new ProjectsSection({ $$inline: true });
    	skillssection = new SkillsSection({ $$inline: true });
    	aboutmesection = new AboutMeSection({ $$inline: true });
    	footersection = new FooterSection({ $$inline: true });
    	let if_block = /*$GlobalStore*/ ctx[1].openedSocialModal !== null && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			create_component(metatags.$$.fragment);
    			t0 = space();
    			main = element("main");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			button = element("button");
    			svg0 = svg_element("svg");
    			path = svg_element("path");
    			t3 = space();
    			svg1 = svg_element("svg");
    			title = svg_element("title");
    			t4 = text(t4_value);
    			use = svg_element("use");
    			t5 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			create_component(landingsection.$$.fragment);
    			t7 = space();
    			create_component(projectssection.$$.fragment);
    			t8 = space();
    			create_component(skillssection.$$.fragment);
    			t9 = space();
    			create_component(aboutmesection.$$.fragment);
    			t10 = space();
    			create_component(footersection.$$.fragment);
    			t11 = space();
    			div2 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(span, "id", "BetaLabel");
    			add_location(span, file, 411, 2, 80339);
    			attr_dev(path, "d", "M10.72 12.464L8.62545 10.448L8.65818 10.432C10.0483 8.9241 11.0868 7.13894 11.7018 5.2H14.0909V3.6H8.36364V2H6.72727V3.6H1V5.2H10.1473C9.57977 6.78406 8.69529 8.24175 7.54545 9.488C6.79634 8.67616 6.15827 7.7726 5.64727 6.8H4.01091C4.61636 8.096 5.43455 9.344 6.46545 10.448L2.29273 14.464L3.45455 15.6L7.54545 11.6L10.0818 14.08L10.7036 12.464H10.72ZM15.3182 8.4H13.6818L10 18H11.6364L12.5527 15.6H16.4473L17.3636 18H19L15.3182 8.4V8.4ZM13.1745 14L14.5 10.528L15.8255 14H13.1745V14Z");
    			add_location(path, file, 415, 5, 80668);
    			attr_dev(svg0, "class", "icon icon-default fill");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			add_location(svg0, file, 414, 4, 80558);
    			add_location(title, file, 418, 5, 81279);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#FLAG_" + /*$i18n*/ ctx[8]);
    			add_location(use, file, 419, 5, 81324);
    			attr_dev(svg1, "class", "flag icon icon-large");
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "focusable", "false");
    			attr_dev(svg1, "role", "presentation");
    			add_location(svg1, file, 417, 4, 81181);
    			attr_dev(button, "class", "selected gap-1 flex flex-center");
    			add_location(button, file, 413, 3, 80476);
    			attr_dev(div0, "class", "options grid gap-05");
    			add_location(div0, file, 422, 3, 81388);
    			attr_dev(div1, "id", "AppLangSelect");
    			attr_dev(div1, "tabindex", div1_tabindex_value = /*selectingLang*/ ctx[3] ? 1 : -1);
    			toggle_class(div1, "active", /*selectingLang*/ ctx[3]);
    			add_location(div1, file, 412, 2, 80386);
    			attr_dev(div2, "id", "SocialModal");
    			attr_dev(div2, "tabindex", "-1");
    			attr_dev(div2, "class", "modal-container flex flex-center");
    			toggle_class(div2, "active", /*$GlobalStore*/ ctx[1].openedSocialModal !== null);
    			add_location(div2, file, 441, 2, 82075);
    			attr_dev(main, "id", "App");
    			attr_dev(main, "role", "main");
    			attr_dev(main, "lock-scroll", main_lock_scroll_value = /*$GlobalStore*/ ctx[1].lockScroll.state);
    			attr_dev(main, "reduced-motion", main_reduced_motion_value = /*$GlobalStore*/ ctx[1].a11y.reducedMotion);
    			attr_dev(main, "more-contrast", main_more_contrast_value = /*$GlobalStore*/ ctx[1].a11y.moreContrast);
    			add_location(main, file, 406, 1, 80116);
    		},
    		m: function mount(target, anchor) {
    			mount_component(metatags, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, span);
    			append_dev(span, t1);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			append_dev(div1, button);
    			append_dev(button, svg0);
    			append_dev(svg0, path);
    			append_dev(button, t3);
    			append_dev(button, svg1);
    			append_dev(svg1, title);
    			append_dev(title, t4);
    			append_dev(svg1, use);
    			append_dev(div1, t5);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(main, t6);
    			mount_component(landingsection, main, null);
    			append_dev(main, t7);
    			mount_component(projectssection, main, null);
    			append_dev(main, t8);
    			mount_component(skillssection, main, null);
    			append_dev(main, t9);
    			mount_component(aboutmesection, main, null);
    			append_dev(main, t10);
    			mount_component(footersection, main, null);
    			append_dev(main, t11);
    			append_dev(main, div2);
    			if (if_block) if_block.m(div2, null);
    			/*div2_binding*/ ctx[16](div2);
    			/*main_binding*/ ctx[17](main);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*toggleLangSelect*/ ctx[11], false, false, false),
    					listen_dev(main, "scroll", /*scrollingApp*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const metatags_changes = {};
    			if (dirty & /*$_*/ 128) metatags_changes.title = /*$_*/ ctx[7]('page_title');
    			if (dirty & /*$_*/ 128) metatags_changes.description = /*$_*/ ctx[7]('about_me');

    			if (dirty & /*$_, $i18n*/ 384) metatags_changes.openGraph = {
    				site_name: /*$_*/ ctx[7]('page_title'),
    				url: 'http://danielsharkov.com',
    				title: /*$_*/ ctx[7]('page_title'),
    				description: /*$_*/ ctx[7]('about_me'),
    				locale: /*$i18n*/ ctx[8],
    				profile: {
    					firstName: 'Daniel',
    					lastName: 'Scharkov',
    					username: 'DaSh_x097'
    				},
    				images: [
    					{
    						url: 'http://danielsharkov.com/projects/danielsharkov_com/cover.png',
    						width: 1920,
    						height: 1200,
    						alt: 'danielsharkov.com cover'
    					},
    					{
    						url: 'http://danielsharkov.com/projects/danielsharkov_com/preview.png',
    						width: 1024,
    						height: 640,
    						alt: 'danielsharkov.com preview'
    					},
    					{
    						url: 'http://danielsharkov.com/projects/danielsharkov_com/thumbnail.png',
    						width: 300,
    						height: 188,
    						alt: 'danielsharkov.com thumbnail'
    					}
    				]
    			};

    			metatags.$set(metatags_changes);
    			if ((!current || dirty & /*$_*/ 128) && t1_value !== (t1_value = /*$_*/ ctx[7]('b_e_t_a') + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*$i18n*/ 256) && t4_value !== (t4_value = LocaleFullName[/*$i18n*/ ctx[8]] + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*$i18n*/ 256 && use_xlink_href_value !== (use_xlink_href_value = "#FLAG_" + /*$i18n*/ ctx[8])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}

    			if (dirty & /*selectingLang, LocaleList, $i18n, selectLang, LocaleFullName*/ 4360) {
    				each_value_1 = LocaleList;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (!current || dirty & /*selectingLang*/ 8 && div1_tabindex_value !== (div1_tabindex_value = /*selectingLang*/ ctx[3] ? 1 : -1)) {
    				attr_dev(div1, "tabindex", div1_tabindex_value);
    			}

    			if (dirty & /*selectingLang*/ 8) {
    				toggle_class(div1, "active", /*selectingLang*/ ctx[3]);
    			}

    			if (/*$GlobalStore*/ ctx[1].openedSocialModal !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$GlobalStore*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*$GlobalStore*/ 2) {
    				toggle_class(div2, "active", /*$GlobalStore*/ ctx[1].openedSocialModal !== null);
    			}

    			if (!current || dirty & /*$GlobalStore*/ 2 && main_lock_scroll_value !== (main_lock_scroll_value = /*$GlobalStore*/ ctx[1].lockScroll.state)) {
    				attr_dev(main, "lock-scroll", main_lock_scroll_value);
    			}

    			if (!current || dirty & /*$GlobalStore*/ 2 && main_reduced_motion_value !== (main_reduced_motion_value = /*$GlobalStore*/ ctx[1].a11y.reducedMotion)) {
    				attr_dev(main, "reduced-motion", main_reduced_motion_value);
    			}

    			if (!current || dirty & /*$GlobalStore*/ 2 && main_more_contrast_value !== (main_more_contrast_value = /*$GlobalStore*/ ctx[1].a11y.moreContrast)) {
    				attr_dev(main, "more-contrast", main_more_contrast_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(metatags.$$.fragment, local);
    			transition_in(landingsection.$$.fragment, local);
    			transition_in(projectssection.$$.fragment, local);
    			transition_in(skillssection.$$.fragment, local);
    			transition_in(aboutmesection.$$.fragment, local);
    			transition_in(footersection.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(metatags.$$.fragment, local);
    			transition_out(landingsection.$$.fragment, local);
    			transition_out(projectssection.$$.fragment, local);
    			transition_out(skillssection.$$.fragment, local);
    			transition_out(aboutmesection.$$.fragment, local);
    			transition_out(footersection.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(metatags, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			destroy_component(landingsection);
    			destroy_component(projectssection);
    			destroy_component(skillssection);
    			destroy_component(aboutmesection);
    			destroy_component(footersection);
    			if (if_block) if_block.d();
    			/*div2_binding*/ ctx[16](null);
    			/*main_binding*/ ctx[17](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(371:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (359:27) 
    function create_if_block_1(ctx) {
    	let div;
    	let each_value = LocaleList;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "InvalidLocaleSelect");
    			attr_dev(div, "class", "flex flex-center gap-1");
    			add_location(div, file, 359, 1, 78675);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectLang, LocaleList, LocaleFullName*/ 4096) {
    				each_value = LocaleList;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(359:27) ",
    		ctx
    	});

    	return block;
    }

    // (294:0) {#if $isLoading}
    function create_if_block(ctx) {
    	let div;
    	let svg;
    	let g0;
    	let rect0;
    	let animate0;
    	let g1;
    	let rect1;
    	let animate1;
    	let g2;
    	let rect2;
    	let animate2;
    	let g3;
    	let rect3;
    	let animate3;
    	let g4;
    	let rect4;
    	let animate4;
    	let g5;
    	let rect5;
    	let animate5;
    	let g6;
    	let rect6;
    	let animate6;
    	let g7;
    	let rect7;
    	let animate7;
    	let g8;
    	let rect8;
    	let animate8;
    	let g9;
    	let rect9;
    	let animate9;
    	let g10;
    	let rect10;
    	let animate10;
    	let g11;
    	let rect11;
    	let animate11;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			rect0 = svg_element("rect");
    			animate0 = svg_element("animate");
    			g1 = svg_element("g");
    			rect1 = svg_element("rect");
    			animate1 = svg_element("animate");
    			g2 = svg_element("g");
    			rect2 = svg_element("rect");
    			animate2 = svg_element("animate");
    			g3 = svg_element("g");
    			rect3 = svg_element("rect");
    			animate3 = svg_element("animate");
    			g4 = svg_element("g");
    			rect4 = svg_element("rect");
    			animate4 = svg_element("animate");
    			g5 = svg_element("g");
    			rect5 = svg_element("rect");
    			animate5 = svg_element("animate");
    			g6 = svg_element("g");
    			rect6 = svg_element("rect");
    			animate6 = svg_element("animate");
    			g7 = svg_element("g");
    			rect7 = svg_element("rect");
    			animate7 = svg_element("animate");
    			g8 = svg_element("g");
    			rect8 = svg_element("rect");
    			animate8 = svg_element("animate");
    			g9 = svg_element("g");
    			rect9 = svg_element("rect");
    			animate9 = svg_element("animate");
    			g10 = svg_element("g");
    			rect10 = svg_element("rect");
    			animate10 = svg_element("animate");
    			g11 = svg_element("g");
    			rect11 = svg_element("rect");
    			animate11 = svg_element("animate");
    			attr_dev(animate0, "attributeName", "opacity");
    			attr_dev(animate0, "values", "1;0");
    			attr_dev(animate0, "keyTimes", "0;1");
    			attr_dev(animate0, "dur", "1s");
    			attr_dev(animate0, "begin", "-0.9166666666666666s");
    			attr_dev(animate0, "repeatCount", "indefinite");
    			add_location(animate0, file, 298, 5, 75756);
    			attr_dev(rect0, "x", "49");
    			attr_dev(rect0, "y", "7");
    			attr_dev(rect0, "rx", "0");
    			attr_dev(rect0, "ry", "0");
    			attr_dev(rect0, "width", "2");
    			attr_dev(rect0, "height", "26");
    			add_location(rect0, file, 297, 4, 75694);
    			attr_dev(g0, "transform", "rotate(0 50 50)");
    			add_location(g0, file, 296, 3, 75657);
    			attr_dev(animate1, "attributeName", "opacity");
    			attr_dev(animate1, "values", "1;0");
    			attr_dev(animate1, "keyTimes", "0;1");
    			attr_dev(animate1, "dur", "1s");
    			attr_dev(animate1, "begin", "-0.8333333333333334s");
    			attr_dev(animate1, "repeatCount", "indefinite");
    			add_location(animate1, file, 303, 5, 76008);
    			attr_dev(rect1, "x", "49");
    			attr_dev(rect1, "y", "7");
    			attr_dev(rect1, "rx", "0");
    			attr_dev(rect1, "ry", "0");
    			attr_dev(rect1, "width", "2");
    			attr_dev(rect1, "height", "26");
    			add_location(rect1, file, 302, 4, 75946);
    			attr_dev(g1, "transform", "rotate(30 50 50)");
    			add_location(g1, file, 301, 3, 75908);
    			attr_dev(animate2, "attributeName", "opacity");
    			attr_dev(animate2, "values", "1;0");
    			attr_dev(animate2, "keyTimes", "0;1");
    			attr_dev(animate2, "dur", "1s");
    			attr_dev(animate2, "begin", "-0.75s");
    			attr_dev(animate2, "repeatCount", "indefinite");
    			add_location(animate2, file, 308, 5, 76260);
    			attr_dev(rect2, "x", "49");
    			attr_dev(rect2, "y", "7");
    			attr_dev(rect2, "rx", "0");
    			attr_dev(rect2, "ry", "0");
    			attr_dev(rect2, "width", "2");
    			attr_dev(rect2, "height", "26");
    			add_location(rect2, file, 307, 4, 76198);
    			attr_dev(g2, "transform", "rotate(60 50 50)");
    			add_location(g2, file, 306, 3, 76160);
    			attr_dev(animate3, "attributeName", "opacity");
    			attr_dev(animate3, "values", "1;0");
    			attr_dev(animate3, "keyTimes", "0;1");
    			attr_dev(animate3, "dur", "1s");
    			attr_dev(animate3, "begin", "-0.6666666666666666s");
    			attr_dev(animate3, "repeatCount", "indefinite");
    			add_location(animate3, file, 313, 5, 76498);
    			attr_dev(rect3, "x", "49");
    			attr_dev(rect3, "y", "7");
    			attr_dev(rect3, "rx", "0");
    			attr_dev(rect3, "ry", "0");
    			attr_dev(rect3, "width", "2");
    			attr_dev(rect3, "height", "26");
    			add_location(rect3, file, 312, 4, 76436);
    			attr_dev(g3, "transform", "rotate(90 50 50)");
    			add_location(g3, file, 311, 3, 76398);
    			attr_dev(animate4, "attributeName", "opacity");
    			attr_dev(animate4, "values", "1;0");
    			attr_dev(animate4, "keyTimes", "0;1");
    			attr_dev(animate4, "dur", "1s");
    			attr_dev(animate4, "begin", "-0.5833333333333334s");
    			attr_dev(animate4, "repeatCount", "indefinite");
    			add_location(animate4, file, 318, 5, 76751);
    			attr_dev(rect4, "x", "49");
    			attr_dev(rect4, "y", "7");
    			attr_dev(rect4, "rx", "0");
    			attr_dev(rect4, "ry", "0");
    			attr_dev(rect4, "width", "2");
    			attr_dev(rect4, "height", "26");
    			add_location(rect4, file, 317, 4, 76689);
    			attr_dev(g4, "transform", "rotate(120 50 50)");
    			add_location(g4, file, 316, 3, 76650);
    			attr_dev(animate5, "attributeName", "opacity");
    			attr_dev(animate5, "values", "1;0");
    			attr_dev(animate5, "keyTimes", "0;1");
    			attr_dev(animate5, "dur", "1s");
    			attr_dev(animate5, "begin", "-0.5s");
    			attr_dev(animate5, "repeatCount", "indefinite");
    			add_location(animate5, file, 323, 5, 77004);
    			attr_dev(rect5, "x", "49");
    			attr_dev(rect5, "y", "7");
    			attr_dev(rect5, "rx", "0");
    			attr_dev(rect5, "ry", "0");
    			attr_dev(rect5, "width", "2");
    			attr_dev(rect5, "height", "26");
    			add_location(rect5, file, 322, 4, 76942);
    			attr_dev(g5, "transform", "rotate(150 50 50)");
    			add_location(g5, file, 321, 3, 76903);
    			attr_dev(animate6, "attributeName", "opacity");
    			attr_dev(animate6, "values", "1;0");
    			attr_dev(animate6, "keyTimes", "0;1");
    			attr_dev(animate6, "dur", "1s");
    			attr_dev(animate6, "begin", "-0.4166666666666667s");
    			attr_dev(animate6, "repeatCount", "indefinite");
    			add_location(animate6, file, 328, 5, 77242);
    			attr_dev(rect6, "x", "49");
    			attr_dev(rect6, "y", "7");
    			attr_dev(rect6, "rx", "0");
    			attr_dev(rect6, "ry", "0");
    			attr_dev(rect6, "width", "2");
    			attr_dev(rect6, "height", "26");
    			add_location(rect6, file, 327, 4, 77180);
    			attr_dev(g6, "transform", "rotate(180 50 50)");
    			add_location(g6, file, 326, 3, 77141);
    			attr_dev(animate7, "attributeName", "opacity");
    			attr_dev(animate7, "values", "1;0");
    			attr_dev(animate7, "keyTimes", "0;1");
    			attr_dev(animate7, "dur", "1s");
    			attr_dev(animate7, "begin", "-0.3333333333333333s");
    			attr_dev(animate7, "repeatCount", "indefinite");
    			add_location(animate7, file, 333, 5, 77495);
    			attr_dev(rect7, "x", "49");
    			attr_dev(rect7, "y", "7");
    			attr_dev(rect7, "rx", "0");
    			attr_dev(rect7, "ry", "0");
    			attr_dev(rect7, "width", "2");
    			attr_dev(rect7, "height", "26");
    			add_location(rect7, file, 332, 4, 77433);
    			attr_dev(g7, "transform", "rotate(210 50 50)");
    			add_location(g7, file, 331, 3, 77394);
    			attr_dev(animate8, "attributeName", "opacity");
    			attr_dev(animate8, "values", "1;0");
    			attr_dev(animate8, "keyTimes", "0;1");
    			attr_dev(animate8, "dur", "1s");
    			attr_dev(animate8, "begin", "-0.25s");
    			attr_dev(animate8, "repeatCount", "indefinite");
    			add_location(animate8, file, 338, 5, 77748);
    			attr_dev(rect8, "x", "49");
    			attr_dev(rect8, "y", "7");
    			attr_dev(rect8, "rx", "0");
    			attr_dev(rect8, "ry", "0");
    			attr_dev(rect8, "width", "2");
    			attr_dev(rect8, "height", "26");
    			add_location(rect8, file, 337, 4, 77686);
    			attr_dev(g8, "transform", "rotate(240 50 50)");
    			add_location(g8, file, 336, 3, 77647);
    			attr_dev(animate9, "attributeName", "opacity");
    			attr_dev(animate9, "values", "1;0");
    			attr_dev(animate9, "keyTimes", "0;1");
    			attr_dev(animate9, "dur", "1s");
    			attr_dev(animate9, "begin", "-0.16666666666666666s");
    			attr_dev(animate9, "repeatCount", "indefinite");
    			add_location(animate9, file, 343, 5, 77987);
    			attr_dev(rect9, "x", "49");
    			attr_dev(rect9, "y", "7");
    			attr_dev(rect9, "rx", "0");
    			attr_dev(rect9, "ry", "0");
    			attr_dev(rect9, "width", "2");
    			attr_dev(rect9, "height", "26");
    			add_location(rect9, file, 342, 4, 77925);
    			attr_dev(g9, "transform", "rotate(270 50 50)");
    			add_location(g9, file, 341, 3, 77886);
    			attr_dev(animate10, "attributeName", "opacity");
    			attr_dev(animate10, "values", "1;0");
    			attr_dev(animate10, "keyTimes", "0;1");
    			attr_dev(animate10, "dur", "1s");
    			attr_dev(animate10, "begin", "-0.08333333333333333s");
    			attr_dev(animate10, "repeatCount", "indefinite");
    			add_location(animate10, file, 348, 5, 78241);
    			attr_dev(rect10, "x", "49");
    			attr_dev(rect10, "y", "7");
    			attr_dev(rect10, "rx", "0");
    			attr_dev(rect10, "ry", "0");
    			attr_dev(rect10, "width", "2");
    			attr_dev(rect10, "height", "26");
    			add_location(rect10, file, 347, 4, 78179);
    			attr_dev(g10, "transform", "rotate(300 50 50)");
    			add_location(g10, file, 346, 3, 78140);
    			attr_dev(animate11, "attributeName", "opacity");
    			attr_dev(animate11, "values", "1;0");
    			attr_dev(animate11, "keyTimes", "0;1");
    			attr_dev(animate11, "dur", "1s");
    			attr_dev(animate11, "begin", "0s");
    			attr_dev(animate11, "repeatCount", "indefinite");
    			add_location(animate11, file, 353, 5, 78495);
    			attr_dev(rect11, "x", "49");
    			attr_dev(rect11, "y", "7");
    			attr_dev(rect11, "rx", "0");
    			attr_dev(rect11, "ry", "0");
    			attr_dev(rect11, "width", "2");
    			attr_dev(rect11, "height", "26");
    			add_location(rect11, file, 352, 4, 78433);
    			attr_dev(g11, "transform", "rotate(330 50 50)");
    			add_location(g11, file, 351, 3, 78394);
    			attr_dev(svg, "class", "icon loader fill");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid");
    			add_location(svg, file, 295, 2, 75434);
    			attr_dev(div, "id", "AppLoader");
    			attr_dev(div, "class", "flex flex-center");
    			add_location(div, file, 294, 1, 75385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, g0);
    			append_dev(g0, rect0);
    			append_dev(rect0, animate0);
    			append_dev(svg, g1);
    			append_dev(g1, rect1);
    			append_dev(rect1, animate1);
    			append_dev(svg, g2);
    			append_dev(g2, rect2);
    			append_dev(rect2, animate2);
    			append_dev(svg, g3);
    			append_dev(g3, rect3);
    			append_dev(rect3, animate3);
    			append_dev(svg, g4);
    			append_dev(g4, rect4);
    			append_dev(rect4, animate4);
    			append_dev(svg, g5);
    			append_dev(g5, rect5);
    			append_dev(rect5, animate5);
    			append_dev(svg, g6);
    			append_dev(g6, rect6);
    			append_dev(rect6, animate6);
    			append_dev(svg, g7);
    			append_dev(g7, rect7);
    			append_dev(rect7, animate7);
    			append_dev(svg, g8);
    			append_dev(g8, rect8);
    			append_dev(rect8, animate8);
    			append_dev(svg, g9);
    			append_dev(g9, rect9);
    			append_dev(rect9, animate9);
    			append_dev(svg, g10);
    			append_dev(g10, rect10);
    			append_dev(rect10, animate10);
    			append_dev(svg, g11);
    			append_dev(g11, rect11);
    			append_dev(rect11, animate11);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(294:0) {#if $isLoading}",
    		ctx
    	});

    	return block;
    }

    // (424:4) {#each LocaleList as locale}
    function create_each_block_1(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = LocaleFullName[/*locale*/ ctx[21]] + "";
    	let t0;
    	let t1;
    	let use;
    	let t2;
    	let span;
    	let t3_value = LocaleFullName[/*locale*/ ctx[21]] + "";
    	let t3;
    	let t4;
    	let button_tabindex_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[15](/*locale*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			t1 = text(" Flag");
    			use = svg_element("use");
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			add_location(title, file, 426, 7, 81724);
    			xlink_attr(use, "xlink:href", "#FLAG_" + /*locale*/ ctx[21]);
    			add_location(use, file, 427, 7, 81777);
    			attr_dev(svg, "class", "flag icon icon-large");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file, 425, 6, 81624);
    			attr_dev(span, "class", "label");
    			add_location(span, file, 429, 6, 81833);
    			attr_dev(button, "class", "option flex nowrap flex-center-y gap-1");
    			attr_dev(button, "tabindex", button_tabindex_value = /*selectingLang*/ ctx[3] ? 1 : -1);
    			toggle_class(button, "active", /*locale*/ ctx[21] === /*$i18n*/ ctx[8]);
    			add_location(button, file, 424, 5, 81462);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			append_dev(svg, use);
    			append_dev(button, t2);
    			append_dev(button, span);
    			append_dev(span, t3);
    			append_dev(button, t4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*selectingLang*/ 8 && button_tabindex_value !== (button_tabindex_value = /*selectingLang*/ ctx[3] ? 1 : -1)) {
    				attr_dev(button, "tabindex", button_tabindex_value);
    			}

    			if (dirty & /*LocaleList, $i18n*/ 256) {
    				toggle_class(button, "active", /*locale*/ ctx[21] === /*$i18n*/ ctx[8]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(424:4) {#each LocaleList as locale}",
    		ctx
    	});

    	return block;
    }

    // (447:3) {#if $GlobalStore.openedSocialModal !== null}
    function create_if_block_2(ctx) {
    	let div0;
    	let div0_transition;
    	let t0;
    	let div1;
    	let h1;
    	let t1_value = /*selectedSocial*/ ctx[4].name + "";
    	let t1;
    	let t2;
    	let a0;
    	let t3_value = /*$_*/ ctx[7]('section.contact.social_open_app') + "";
    	let t3;
    	let a0_href_value;
    	let t4;
    	let a1;
    	let t5_value = /*$_*/ ctx[7]('section.contact.social_open_link') + "";
    	let t5;
    	let a1_href_value;
    	let t6;
    	let button;
    	let t7_value = /*$_*/ ctx[7]('close') + "";
    	let t7;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			a0 = element("a");
    			t3 = text(t3_value);
    			t4 = space();
    			a1 = element("a");
    			t5 = text(t5_value);
    			t6 = space();
    			button = element("button");
    			t7 = text(t7_value);
    			attr_dev(div0, "class", "modal-bg");
    			add_location(div0, file, 447, 4, 82308);
    			attr_dev(h1, "class", "name");
    			add_location(h1, file, 453, 5, 82483);
    			attr_dev(a0, "href", a0_href_value = /*selectedSocial*/ ctx[4].app);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "btn open-app flex flex-center");
    			add_location(a0, file, 454, 5, 82533);
    			attr_dev(a1, "href", a1_href_value = /*selectedSocial*/ ctx[4].url);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "btn open-link flex flex-center");
    			add_location(a1, file, 457, 5, 82681);
    			attr_dev(button, "class", "btn close flex flex-center");
    			add_location(button, file, 460, 5, 82831);
    			attr_dev(div1, "class", "modal grid gap-05");
    			add_location(div1, file, 452, 4, 82418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, a0);
    			append_dev(a0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, a1);
    			append_dev(a1, t5);
    			append_dev(div1, t6);
    			append_dev(div1, button);
    			append_dev(button, t7);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*closeSocialModal*/ ctx[13], false, false, false),
    					listen_dev(button, "click", /*closeSocialModal*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*selectedSocial*/ 16) && t1_value !== (t1_value = /*selectedSocial*/ ctx[4].name + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*$_*/ 128) && t3_value !== (t3_value = /*$_*/ ctx[7]('section.contact.social_open_app') + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*selectedSocial*/ 16 && a0_href_value !== (a0_href_value = /*selectedSocial*/ ctx[4].app)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if ((!current || dirty & /*$_*/ 128) && t5_value !== (t5_value = /*$_*/ ctx[7]('section.contact.social_open_link') + "")) set_data_dev(t5, t5_value);

    			if (!current || dirty & /*selectedSocial*/ 16 && a1_href_value !== (a1_href_value = /*selectedSocial*/ ctx[4].url)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if ((!current || dirty & /*$_*/ 128) && t7_value !== (t7_value = /*$_*/ ctx[7]('close') + "")) set_data_dev(t7, t7_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, modalBgAnim, 250, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, socialModalAnim, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, modalBgAnim, 250, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, socialModalAnim, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(447:3) {#if $GlobalStore.openedSocialModal !== null}",
    		ctx
    	});

    	return block;
    }

    // (361:2) {#each LocaleList as locale}
    function create_each_block(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = LocaleFullName[/*locale*/ ctx[21]] + "";
    	let t0;
    	let t1;
    	let use;
    	let t2;
    	let span;
    	let t3_value = LocaleFullName[/*locale*/ ctx[21]] + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*locale*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			t1 = text(" Flag");
    			use = svg_element("use");
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			add_location(title, file, 363, 5, 78968);
    			xlink_attr(use, "xlink:href", "#FLAG_" + /*locale*/ ctx[21]);
    			add_location(use, file, 364, 5, 79019);
    			attr_dev(svg, "class", "flag icon icon-large");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file, 362, 4, 78870);
    			attr_dev(span, "class", "label");
    			add_location(span, file, 366, 4, 79071);
    			attr_dev(button, "class", "option flex nowrap flex-center-y gap-05");
    			add_location(button, file, 361, 3, 78773);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			append_dev(svg, use);
    			append_dev(button, t2);
    			append_dev(button, span);
    			append_dev(span, t3);
    			append_dev(button, t4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(361:2) {#each LocaleList as locale}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let svg29;
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
    	let path51;
    	let path52;
    	let path53;
    	let symbol20;
    	let svg20;
    	let path54;
    	let path55;
    	let path56;
    	let path57;
    	let symbol21;
    	let svg21;
    	let path58;
    	let symbol22;
    	let svg22;
    	let path59;
    	let symbol23;
    	let svg23;
    	let path60;
    	let symbol24;
    	let svg24;
    	let path61;
    	let path62;
    	let path63;
    	let symbol25;
    	let svg25;
    	let circle;
    	let path64;
    	let symbol26;
    	let svg26;
    	let clipPath0;
    	let path65;
    	let linearGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient1;
    	let stop2;
    	let stop3;
    	let linearGradient2;
    	let stop4;
    	let stop5;
    	let g0;
    	let path66;
    	let path67;
    	let path68;
    	let symbol27;
    	let svg27;
    	let mask;
    	let path69;
    	let g1;
    	let path70;
    	let path71;
    	let path72;
    	let symbol28;
    	let svg28;
    	let g2;
    	let rect0;
    	let rect1;
    	let path73;
    	let path74;
    	let defs;
    	let pattern0;
    	let use0;
    	let pattern1;
    	let use1;
    	let clipPath1;
    	let rect2;
    	let image0;
    	let image1;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$isLoading*/ ctx[5]) return 0;
    		if (/*$isInvalidLocale*/ ctx[6]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			svg29 = svg_element("svg");
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
    			path51 = svg_element("path");
    			path52 = svg_element("path");
    			path53 = svg_element("path");
    			symbol20 = svg_element("symbol");
    			svg20 = svg_element("svg");
    			path54 = svg_element("path");
    			path55 = svg_element("path");
    			path56 = svg_element("path");
    			path57 = svg_element("path");
    			symbol21 = svg_element("symbol");
    			svg21 = svg_element("svg");
    			path58 = svg_element("path");
    			symbol22 = svg_element("symbol");
    			svg22 = svg_element("svg");
    			path59 = svg_element("path");
    			symbol23 = svg_element("symbol");
    			svg23 = svg_element("svg");
    			path60 = svg_element("path");
    			symbol24 = svg_element("symbol");
    			svg24 = svg_element("svg");
    			path61 = svg_element("path");
    			path62 = svg_element("path");
    			path63 = svg_element("path");
    			symbol25 = svg_element("symbol");
    			svg25 = svg_element("svg");
    			circle = svg_element("circle");
    			path64 = svg_element("path");
    			symbol26 = svg_element("symbol");
    			svg26 = svg_element("svg");
    			clipPath0 = svg_element("clipPath");
    			path65 = svg_element("path");
    			linearGradient0 = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			linearGradient2 = svg_element("linearGradient");
    			stop4 = svg_element("stop");
    			stop5 = svg_element("stop");
    			g0 = svg_element("g");
    			path66 = svg_element("path");
    			path67 = svg_element("path");
    			path68 = svg_element("path");
    			symbol27 = svg_element("symbol");
    			svg27 = svg_element("svg");
    			mask = svg_element("mask");
    			path69 = svg_element("path");
    			g1 = svg_element("g");
    			path70 = svg_element("path");
    			path71 = svg_element("path");
    			path72 = svg_element("path");
    			symbol28 = svg_element("symbol");
    			svg28 = svg_element("svg");
    			g2 = svg_element("g");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			path73 = svg_element("path");
    			path74 = svg_element("path");
    			defs = svg_element("defs");
    			pattern0 = svg_element("pattern");
    			use0 = svg_element("use");
    			pattern1 = svg_element("pattern");
    			use1 = svg_element("use");
    			clipPath1 = svg_element("clipPath");
    			rect2 = svg_element("rect");
    			image0 = svg_element("image");
    			image1 = svg_element("image");
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M60 11C32.3894 11 10 33.3844 10 61C10 83.0905 24.3265 101.833 44.1931 108.444C46.6919 108.907 47.6093 107.359 47.6093 106.039C47.6093 104.847 47.5629 100.908 47.5414 96.7298C33.6314 99.7544 30.6962 90.8304 30.6962 90.8304C28.4217 85.052 25.1446 83.5144 25.1446 83.5144C20.6081 80.4111 25.4865 80.4749 25.4865 80.4749C30.5074 80.8276 33.1511 85.6282 33.1511 85.6282C37.6106 93.2713 44.848 91.0614 47.7012 89.7839C48.1508 86.5531 49.4458 84.3465 50.8757 83.0979C39.77 81.8344 28.0955 77.5463 28.0955 58.3877C28.0955 52.9297 30.0487 48.4685 33.2472 44.967C32.728 43.7077 31.0166 38.6222 33.7324 31.7351C33.7324 31.7351 37.931 30.3921 47.4851 36.8611C51.4735 35.7533 55.7508 35.1977 60 35.1778C64.2492 35.1977 68.5298 35.7533 72.5257 36.8611C82.069 30.3921 86.2618 31.7351 86.2618 31.7351C88.9834 38.6222 87.272 43.7077 86.7528 44.967C89.9588 48.4685 91.8979 52.9297 91.8979 58.3877C91.8979 77.5927 80.201 81.8204 69.0672 83.0582C70.8606 84.6098 72.4586 87.6526 72.4586 92.3175C72.4586 99.0075 72.4015 104.392 72.4015 106.039C72.4015 107.37 73.3007 108.928 75.8351 108.438C95.6917 101.819 110 83.0839 110 61C110 33.3844 87.6139 11 60 11Z");
    			add_location(path0, file, 62, 3, 2132);
    			attr_dev(path1, "d", "M28.9379 82.7884C28.8277 83.0377 28.4369 83.1122 28.0809 82.9416C27.7174 82.7777 27.5146 82.439 27.6321 82.1898C27.7398 81.9348 28.1306 81.8636 28.4932 82.0341C28.8559 82.1973 29.0629 82.5392 28.9379 82.7884Z");
    			add_location(path1, file, 63, 3, 3322);
    			attr_dev(path2, "d", "M30.9634 85.0476C30.7249 85.2686 30.2579 85.166 29.9425 84.8166C29.6146 84.468 29.5541 84.001 29.7959 83.7775C30.0418 83.5564 30.4939 83.6599 30.8209 84.0085C31.1488 84.3612 31.2126 84.8232 30.9634 85.0476Z");
    			add_location(path2, file, 64, 3, 3547);
    			attr_dev(path3, "d", "M32.9347 87.9268C32.6284 88.1405 32.1266 87.9409 31.8169 87.4963C31.5106 87.0508 31.5106 86.5176 31.8244 86.304C32.1341 86.0904 32.6284 86.2833 32.9422 86.7238C33.2477 87.1759 33.2477 87.7091 32.9347 87.9268Z");
    			add_location(path3, file, 65, 3, 3770);
    			attr_dev(path4, "d", "M35.6353 90.7092C35.3612 91.0114 34.7775 90.9303 34.3503 90.5171C33.9131 90.1147 33.7914 89.5426 34.0655 89.2404C34.3437 88.9373 34.9307 89.0226 35.3612 89.4316C35.7951 89.834 35.9267 90.4103 35.6353 90.7092Z");
    			add_location(path4, file, 66, 3, 3995);
    			attr_dev(path5, "d", "M39.3612 92.3247C39.2395 92.7163 38.6781 92.8935 38.1118 92.7271C37.5463 92.5557 37.1762 92.0978 37.2904 91.702C37.408 91.3079 37.9727 91.1224 38.5432 91.3005C39.1078 91.471 39.4788 91.9264 39.3612 92.3247Z");
    			add_location(path5, file, 67, 3, 4220);
    			attr_dev(path6, "d", "M43.4534 92.6239C43.4675 93.0363 42.9873 93.3782 42.3928 93.3857C41.795 93.3989 41.3106 93.0652 41.304 92.6595C41.304 92.243 41.7743 91.9052 42.3713 91.8945C42.9657 91.8829 43.4534 92.2149 43.4534 92.6239Z");
    			add_location(path6, file, 68, 3, 4443);
    			attr_dev(path7, "d", "M47.261 91.9762C47.3322 92.3778 46.919 92.7909 46.3287 92.901C45.7483 93.0078 45.2109 92.7586 45.1372 92.3604C45.0652 91.948 45.485 91.5349 46.0654 91.4281C46.6566 91.3254 47.1856 91.5672 47.261 91.9762Z");
    			add_location(path7, file, 69, 3, 4665);
    			attr_dev(svg0, "class", "icon fill contrast");
    			attr_dev(svg0, "viewBox", "0 0 120 120");
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "focusable", "false");
    			attr_dev(svg0, "role", "presentation");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file, 61, 2, 1981);
    			attr_dev(symbol0, "id", "LOGO_GitHub");
    			add_location(symbol0, file, 60, 1, 1952);
    			attr_dev(path8, "d", "M108.103 41.1921L62.3996 10.7233C60.8396 9.76331 59.1748 9.75452 57.6006 10.7233L11.8973 41.1921C10.7254 41.9732 10 43.3685 10 44.7634V75.2321C10 76.6272 10.7254 78.0223 11.8975 78.8036L57.6007 109.277C59.1607 110.237 60.8256 110.245 62.3998 109.277L108.103 78.8036C109.275 78.0225 110.001 76.6272 110.001 75.2321V44.7634C110 43.3685 109.275 41.9732 108.103 41.1921V41.1921ZM64.2971 22.3301L97.9468 44.7634L82.9356 54.8082L64.2971 42.3638V22.3301ZM55.7033 22.3301V42.3638L37.0647 54.8082L22.0536 44.7634L55.7033 22.3301ZM18.5938 52.7992L29.3639 59.9979L18.5938 67.1965V52.7992ZM55.7033 97.6656L22.0536 75.2323L37.0647 65.1875L55.7033 77.6319V97.6656ZM60.0002 70.1541L44.8214 59.9979L60.0002 49.8416L75.1789 59.9979L60.0002 70.1541ZM64.2971 97.6656V77.6319L82.9356 65.1875L97.9468 75.2323L64.2971 97.6656ZM101.407 67.1965L90.6364 59.9979L101.407 52.7992V67.1965Z");
    			add_location(path8, file, 74, 3, 5086);
    			attr_dev(svg1, "class", "icon fill contrast");
    			attr_dev(svg1, "viewBox", "0 0 120 120");
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "focusable", "false");
    			attr_dev(svg1, "role", "presentation");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file, 73, 2, 4935);
    			attr_dev(symbol1, "id", "LOGO_Codepen");
    			add_location(symbol1, file, 72, 1, 4905);
    			attr_dev(path9, "d", "M74.05 57.5C74.05 60.55 71.8 63.05 68.95 63.05C66.15 63.05 63.85 60.55 63.85 57.5C63.85 54.45 66.1 51.95 68.95 51.95C71.8 51.95 74.05 54.45 74.05 57.5ZM50.7 51.95C47.85 51.95 45.6 54.45 45.6 57.5C45.6 60.55 47.9 63.05 50.7 63.05C53.55 63.05 55.8 60.55 55.8 57.5C55.85 54.45 53.55 51.95 50.7 51.95ZM103.5 20.3V110C90.9035 98.8684 94.932 102.553 80.3 88.95L82.95 98.2H26.25C20.6 98.2 16 93.6 16 87.9V20.3C16 14.6 20.6 10 26.25 10H93.25C98.9 10 103.5 14.6 103.5 20.3ZM89.25 67.7C89.25 51.6 82.05 38.55 82.05 38.55C74.85 33.15 68 33.3 68 33.3L67.3 34.1C75.8 36.7 79.75 40.45 79.75 40.45C67.8729 33.9404 53.9211 33.9393 42.4 39C40.55 39.85 39.45 40.45 39.45 40.45C39.45 40.45 43.6 36.5 52.6 33.9L52.1 33.3C52.1 33.3 45.25 33.15 38.05 38.55C38.05 38.55 30.85 51.6 30.85 67.7C30.85 67.7 35.05 74.95 46.1 75.3C46.1 75.3 47.95 73.05 49.45 71.15C43.1 69.25 40.7 65.25 40.7 65.25C41.4355 65.7648 42.6484 66.4322 42.75 66.5C51.1895 71.2262 63.1773 72.7746 73.95 68.25C75.7 67.6 77.65 66.65 79.7 65.3C79.7 65.3 77.2 69.4 70.65 71.25C72.15 73.15 73.95 75.3 73.95 75.3C85 74.95 89.25 67.7 89.25 67.7V67.7Z");
    			add_location(path9, file, 79, 3, 6165);
    			attr_dev(svg2, "class", "icon fill contrast");
    			attr_dev(svg2, "viewBox", "0 0 120 120");
    			attr_dev(svg2, "aria-hidden", "true");
    			attr_dev(svg2, "focusable", "false");
    			attr_dev(svg2, "role", "presentation");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file, 78, 2, 6014);
    			attr_dev(symbol2, "id", "LOGO_Discord");
    			add_location(symbol2, file, 77, 1, 5984);
    			attr_dev(path10, "d", "M103.246 29.2578L90.0432 91.5234C89.0471 95.918 86.4494 97.0117 82.758 94.9414L62.6409 80.1172L52.9338 89.4531C51.8596 90.5273 50.9612 91.4258 48.8909 91.4258L50.3362 70.9375L87.6213 37.2461C89.2424 35.8008 87.2698 35 85.1018 36.4453L39.008 65.4687L19.1643 59.2578C14.8479 57.9102 14.7698 54.9414 20.0627 52.8711L97.6799 22.9687C101.274 21.6211 104.418 23.7695 103.246 29.2578V29.2578Z");
    			add_location(path10, file, 84, 3, 7474);
    			attr_dev(svg3, "class", "icon fill contrast");
    			attr_dev(svg3, "viewBox", "0 0 120 120");
    			attr_dev(svg3, "aria-hidden", "true");
    			attr_dev(svg3, "focusable", "false");
    			attr_dev(svg3, "role", "presentation");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg3, file, 83, 2, 7323);
    			attr_dev(symbol3, "id", "LOGO_Telegram");
    			add_location(symbol3, file, 82, 1, 7292);
    			attr_dev(path11, "d", "M99.7211 39.2411C99.7845 40.1294 99.7845 41.0179 99.7845 41.9061C99.7845 69 79.1628 100.218 41.4722 100.218C29.8604 100.218 19.0737 96.8554 10 91.0181C11.6498 91.2083 13.236 91.2718 14.9492 91.2718C24.5303 91.2718 33.3503 88.0358 40.3935 82.5155C31.3833 82.3251 23.8325 76.4241 21.2309 68.3021C22.5 68.4924 23.769 68.6193 25.1016 68.6193C26.9417 68.6193 28.7819 68.3654 30.495 67.9215C21.1041 66.0178 14.0608 57.7691 14.0608 47.8071V47.5534C16.7891 49.0763 19.962 50.028 23.3247 50.1548C17.8043 46.4745 14.1877 40.1929 14.1877 33.0862C14.1877 29.2791 15.2028 25.7893 16.9795 22.7436C27.0684 35.1801 42.2335 43.3019 59.2385 44.1903C58.9213 42.6675 58.7309 41.0813 58.7309 39.495C58.7309 28.2004 67.868 19 79.2259 19C85.1269 19 90.4568 21.4746 94.2005 25.4721C98.8324 24.5838 103.274 22.8705 107.208 20.5229C105.685 25.2819 102.449 29.2793 98.198 31.8172C102.322 31.3733 106.32 30.2309 110 28.6448C107.209 32.7055 103.719 36.3221 99.7211 39.2411V39.2411Z");
    			add_location(path11, file, 89, 3, 8077);
    			attr_dev(svg4, "class", "icon fill contrast");
    			attr_dev(svg4, "viewBox", "0 0 120 120");
    			attr_dev(svg4, "aria-hidden", "true");
    			attr_dev(svg4, "focusable", "false");
    			attr_dev(svg4, "role", "presentation");
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg4, file, 88, 2, 7926);
    			attr_dev(symbol4, "id", "LOGO_Twitter");
    			add_location(symbol4, file, 87, 1, 7896);
    			attr_dev(path12, "d", "M21.8462 36.1877C21.9702 34.968 21.4947 33.7482 20.5851 32.9212L11.2611 21.6746V20H40.246L62.6566 69.142L82.3589 20H110V21.6746L102.02 29.324C101.338 29.8408 100.986 30.7091 101.131 31.5568V87.79C100.986 88.6376 101.338 89.5059 102.02 90.0227L109.814 97.6721V99.3467H70.5954V97.6721L78.6789 89.8367C79.4645 89.0511 79.4645 88.803 79.4645 87.6039V42.1625L56.9919 99.202H53.9529L27.821 42.1625V80.3887C27.5936 82.0012 28.1311 83.6138 29.2681 84.7716L39.7705 97.5067V99.1813H10V97.5274L20.5024 84.7716C21.6188 83.6138 22.1356 81.9806 21.8462 80.3887V36.1877Z");
    			add_location(path12, file, 94, 3, 9246);
    			attr_dev(svg5, "class", "icon fill contrast");
    			attr_dev(svg5, "viewBox", "0 0 120 120");
    			attr_dev(svg5, "aria-hidden", "true");
    			attr_dev(svg5, "focusable", "false");
    			attr_dev(svg5, "role", "presentation");
    			attr_dev(svg5, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg5, file, 93, 2, 9095);
    			attr_dev(symbol5, "id", "LOGO_Medium");
    			add_location(symbol5, file, 92, 1, 9066);
    			attr_dev(path13, "d", "M63.442 87.9756C59.9772 81.1561 55.9126 74.2681 47.9838 74.2681C46.468 74.2681 44.9544 74.5186 43.5649 75.153L40.8714 69.7618C44.1535 66.9462 49.4579 64.7135 56.2753 64.7135C66.8814 64.7135 72.3242 69.8225 76.6457 76.3435C79.2107 70.7758 80.4301 63.257 80.4301 53.9373C80.4301 30.6646 73.1519 18.7142 56.1504 18.7142C39.3973 18.7142 32.1586 30.6646 32.1586 53.9373C32.1586 77.088 39.3973 88.9148 56.1511 88.9148C58.8136 88.9148 61.2248 88.622 63.442 87.9756ZM67.5948 96.0978C63.9226 97.0822 60.0203 97.6255 56.1504 97.6255C33.8423 97.6255 12 79.8252 12 53.938C12 27.8038 33.8423 10 56.1504 10C78.8332 10 100.466 27.6768 100.466 53.9373C100.466 68.5445 93.6493 80.4151 83.7432 88.0878C86.9441 92.8835 90.2395 96.0688 94.8277 96.0688C99.8351 96.0688 101.855 92.199 102.193 89.1639H108.714C109.096 93.2053 107.074 110 88.848 110C77.8086 110 71.9721 103.602 67.5948 96.0978Z");
    			add_location(path13, file, 99, 3, 10017);
    			attr_dev(svg6, "class", "icon fill contrast");
    			attr_dev(svg6, "viewBox", "0 0 120 120");
    			attr_dev(svg6, "aria-hidden", "true");
    			attr_dev(svg6, "focusable", "false");
    			attr_dev(svg6, "role", "presentation");
    			attr_dev(svg6, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg6, file, 98, 2, 9866);
    			attr_dev(symbol6, "id", "LOGO_Quora");
    			add_location(symbol6, file, 97, 1, 9838);
    			attr_dev(path14, "d", "M63.7381 28.5649C64.1311 28.564 64.5239 28.585 64.9146 28.6278C64.459 28.3425 64.0835 27.9458 63.8237 27.4751C63.5639 27.0044 63.4283 26.4753 63.4297 25.9377V16.9024C63.4297 16.5254 63.4297 16.2056 63.0299 16.2056H60.5683C60.484 16.2111 60.4017 16.2339 60.3266 16.2725C60.2515 16.3111 60.1851 16.3647 60.1315 16.4301C60.078 16.4954 60.0384 16.571 60.0153 16.6523C59.9922 16.7335 59.986 16.8186 59.9971 16.9024V26.1091C60.0074 27.1045 60.254 28.0833 60.7168 28.9647C61.7009 28.6943 62.7175 28.5598 63.7381 28.5649ZM86.8462 28.5649V19.0613H88.9423C89.5781 19.0568 90.2082 19.1817 90.7943 19.4283C91.3804 19.675 91.9102 20.0383 92.3515 20.4962C92.7927 20.954 93.1363 21.4968 93.3612 22.0916C93.5861 22.6863 93.6877 23.3206 93.6598 23.9559C93.687 24.5799 93.5868 25.2029 93.3655 25.787C93.1442 26.3711 92.8064 26.9041 92.3725 27.3534C91.9386 27.8028 91.4179 28.1591 90.8419 28.4008C90.2659 28.6425 89.6468 28.7644 89.0222 28.7591C90.6496 29.1478 92.2065 29.7876 93.637 30.6553C94.7702 29.9747 95.7011 29.004 96.3336 27.8433C96.9662 26.6826 97.2774 25.3741 97.2351 24.053C97.2285 23.0094 97.0151 21.9774 96.6073 21.0168C96.1994 20.0561 95.6053 19.1858 94.8591 18.4561C94.113 17.7265 93.2297 17.1519 92.2602 16.7656C91.2906 16.3793 90.2542 16.189 89.2107 16.2056H84.5388C84.179 16.2056 83.3965 16.5369 83.3965 16.9024V28.8962C84.4617 28.6634 85.5505 28.5561 86.6406 28.5764C86.7777 28.5649 86.2751 28.5649 86.8462 28.5649ZM73.139 26.1091V16.9024C73.139 16.5369 73.139 16.2056 72.7734 16.2056H70.3118C70.2281 16.2127 70.1467 16.2365 70.0724 16.2756C69.9981 16.3147 69.9323 16.3684 69.8791 16.4333C69.8258 16.4983 69.7861 16.5733 69.7624 16.6538C69.7386 16.7344 69.7312 16.8189 69.7407 16.9024V25.9777C69.7685 26.7147 69.5206 27.4356 69.0453 27.9995C68.5701 28.5635 67.9016 28.93 67.1706 29.0276C68.7127 29.5073 69.9577 30.2784 71.3228 30.8552C72.6306 29.7072 73.139 27.9938 73.139 26.1091ZM76.5658 31.5634C78.2792 31.4206 79.4214 30.9923 79.9926 30.5239V17.0452C79.9926 16.6682 79.9412 16.2056 79.5642 16.2056H76.9142C76.5372 16.2056 76.5658 16.6682 76.5658 17.0452V31.5634ZM34.3018 30.8495V28.9476C34.3068 28.7612 34.2405 28.5799 34.1162 28.4408C33.992 28.3017 33.8194 28.2154 33.6336 28.1994H28.0193V16.9024C28.0181 16.7238 27.949 16.5523 27.8259 16.4229C27.7029 16.2935 27.5351 16.2158 27.3568 16.2056H25.3178C25.1311 16.2082 24.9524 16.2816 24.8178 16.411C24.6831 16.5403 24.6026 16.7159 24.5925 16.9024V29.7758C26.2885 30.9082 28.2659 31.5469 30.3038 31.6205C31.6758 31.646 33.0378 31.3834 34.3018 30.8495ZM39.442 17.0452C39.4026 16.8294 39.2956 16.6318 39.1364 16.4809C38.9773 16.3299 38.7743 16.2335 38.5567 16.2056H36.8433C36.6323 16.2352 36.4369 16.3335 36.2872 16.4852C36.1375 16.637 36.042 16.8337 36.0152 17.0452V29.7758C37.0872 29.2266 38.2469 28.869 39.442 28.7192V17.0452ZM103.74 41.3013C102.101 42.2559 100.238 42.7589 98.3403 42.7589C96.4431 42.7589 94.5797 42.2559 92.9402 41.3013C91.1496 40.2654 89.1176 39.72 87.049 39.72C84.9803 39.72 82.9483 40.2654 81.1577 41.3013C79.5182 42.2559 77.6548 42.7589 75.7576 42.7589C73.8604 42.7589 71.9971 42.2559 70.3575 41.3013C68.5671 40.2649 66.535 39.7192 64.4663 39.7192C62.3975 39.7192 60.3654 40.2649 58.575 41.3013C56.9551 42.2995 55.08 42.8055 53.1778 42.7577C51.2757 42.8048 49.4008 42.2989 47.7806 41.3013C46.0093 40.222 43.9658 39.673 41.8922 39.7192C39.8183 39.671 37.7743 40.2202 36.0038 41.3013C34.3838 42.2995 32.5087 42.8055 30.6065 42.7577C28.7044 42.8051 26.8294 42.2992 25.2093 41.3013C23.4388 40.2202 21.3948 39.671 19.3209 39.7192C17.2451 39.6699 15.199 40.2191 13.4268 41.3013C12.3706 41.9336 11.2102 42.3726 10 42.5977V43.6543C11.3851 43.4261 12.7145 42.9377 13.918 42.2151C15.5379 41.2168 17.413 40.7109 19.3152 40.7587C21.2174 40.7112 23.0924 41.2172 24.7124 42.2151C26.4829 43.2961 28.5269 43.8453 30.6008 43.7971C32.6767 43.8464 34.7228 43.2972 36.4949 42.2151C38.1149 41.2168 39.99 40.7109 41.8922 40.7587C43.7943 40.7112 45.6693 41.2172 47.2894 42.2151C49.0607 43.2943 51.1041 43.8434 53.1778 43.7971C55.2517 43.8453 57.2957 43.2961 59.0662 42.2151C60.7057 41.2604 62.569 40.7574 64.4663 40.7574C66.3635 40.7574 68.2268 41.2604 69.8664 42.2151C71.657 43.2509 73.689 43.7963 75.7576 43.7963C77.8262 43.7963 79.8583 43.2509 81.6489 42.2151C83.2884 41.2604 85.1517 40.7574 87.049 40.7574C88.9462 40.7574 90.8095 41.2604 92.449 42.2151C94.2396 43.2509 96.2717 43.7963 98.3403 43.7963C100.409 43.7963 102.441 43.2509 104.232 42.2151C105.852 41.2172 107.727 40.7112 109.629 40.7587H110V39.7363H109.629C107.557 39.6849 105.513 40.228 103.74 41.3013Z");
    			attr_dev(path14, "fill", "#000099");
    			add_location(path14, file, 104, 3, 11076);
    			attr_dev(path15, "d", "M109.629 31.4206C107.553 31.3786 105.508 31.9358 103.74 33.0255C102.101 33.9819 100.238 34.4858 98.3403 34.4858C96.4427 34.4858 94.5792 33.9819 92.9402 33.0255C91.1494 31.9902 89.1174 31.4452 87.049 31.4452C84.9805 31.4452 82.9485 31.9902 81.1577 33.0255C79.5182 33.9802 77.6548 34.4831 75.7576 34.4831C73.8604 34.4831 71.9971 33.9802 70.3575 33.0255C68.5671 31.9891 66.535 31.4434 64.4663 31.4434C62.3975 31.4434 60.3654 31.9891 58.575 33.0255C58.1866 33.2311 57.804 33.4367 57.4042 33.5966L55.1197 30.3697C56.0315 29.6217 56.768 28.6826 57.2772 27.6187C57.7864 26.5549 58.056 25.3923 58.0667 24.2129C58.0589 22.9412 57.7558 21.6886 57.1814 20.554C56.607 19.4194 55.7769 18.4336 54.7566 17.6745C53.7363 16.9153 52.5536 16.4035 51.3018 16.1793C50.05 15.9551 48.7632 16.0247 47.5428 16.3825C46.3225 16.7404 45.2019 17.3768 44.2694 18.2416C43.3369 19.1063 42.618 20.1758 42.1692 21.3658C41.7205 22.5557 41.5543 23.8336 41.6836 25.0988C41.8129 26.3639 42.2343 27.5818 42.9145 28.6563C46.7754 29.1875 47.4493 31.432 52.0527 31.5691L53.5776 34.4248H53.2006C51.2985 34.4719 49.4236 33.966 47.8034 32.9684C46.0322 31.8891 43.9887 31.3401 41.915 31.3863C39.8411 31.3382 37.7971 31.8873 36.0266 32.9684C34.4067 33.9666 32.5316 34.4726 30.6294 34.4248C28.7272 34.4723 26.8522 33.9663 25.2322 32.9684C23.4617 31.8873 21.4177 31.3382 19.3438 31.3863C17.254 31.3515 15.1988 31.9228 13.4268 33.0312C12.3711 33.6656 11.2106 34.1066 10 34.3334V35.39C11.3855 35.1601 12.715 34.6698 13.918 33.945C15.5379 32.9468 17.413 32.4408 19.3152 32.4886C21.2174 32.4411 23.0924 32.9471 24.7124 33.945C26.4829 35.0261 28.5269 35.5752 30.6008 35.5271C32.6747 35.5752 34.7187 35.0261 36.4892 33.945C38.1092 32.9468 39.9843 32.4408 41.8865 32.4886C43.7886 32.4411 45.6636 32.9471 47.2837 33.945C49.0566 35.0253 51.1022 35.5744 53.1778 35.5271C55.2517 35.5752 57.2957 35.0261 59.0662 33.945C60.7057 32.9904 62.569 32.4874 64.4663 32.4874C66.3635 32.4874 68.2268 32.9904 69.8664 33.945C71.657 34.9808 73.689 35.5262 75.7576 35.5262C77.8262 35.5262 79.8583 34.9808 81.6489 33.945C83.2884 32.9904 85.1517 32.4874 87.049 32.4874C88.9462 32.4874 90.8095 32.9904 92.449 33.945C94.2396 34.9808 96.2717 35.5262 98.3403 35.5262C100.409 35.5262 102.441 34.9808 104.232 33.945C105.852 32.9471 107.727 32.4411 109.629 32.4886H110V31.4206H109.629ZM49.8424 29.0561C48.5904 29.013 47.4041 28.4854 46.5336 27.5845C45.6632 26.6836 45.1767 25.4799 45.1767 24.2272C45.1767 22.9745 45.6632 21.7707 46.5336 20.8698C47.4041 19.9689 48.5904 19.4413 49.8424 19.3982C51.1198 19.419 52.3388 19.9372 53.24 20.8427C54.1413 21.7483 54.6538 22.9696 54.6685 24.2472C54.6639 25.5241 54.1535 26.7473 53.2489 27.6486C52.3443 28.55 51.1194 29.0561 49.8424 29.0561Z");
    			attr_dev(path15, "fill", "#000099");
    			add_location(path15, file, 105, 3, 15628);
    			attr_dev(path16, "d", "M103.74 37.1663C102.101 38.1209 100.238 38.6239 98.3403 38.6239C96.4431 38.6239 94.5797 38.1209 92.9402 37.1663C91.1496 36.1305 89.1176 35.5851 87.049 35.5851C84.9803 35.5851 82.9483 36.1305 81.1577 37.1663C79.5182 38.1209 77.6548 38.6239 75.7576 38.6239C73.8604 38.6239 71.9971 38.1209 70.3575 37.1663C68.5671 36.1299 66.535 35.5842 64.4663 35.5842C62.3975 35.5842 60.3654 36.1299 58.575 37.1663C56.9551 38.1645 55.08 38.6705 53.1778 38.6227C51.2756 38.6701 49.4006 38.1642 47.7806 37.1663C46.0093 36.087 43.9658 35.538 41.8922 35.5842C39.8183 35.536 37.7743 36.0852 36.0038 37.1663C34.3838 38.1645 32.5087 38.6705 30.6065 38.6227C28.7044 38.6701 26.8294 38.1642 25.2093 37.1663C23.4388 36.0852 21.3948 35.536 19.3209 35.5842C17.2451 35.5349 15.199 36.0842 13.4268 37.1663C12.3711 37.8007 11.2106 38.2417 10 38.4685V39.5251C11.3855 39.2951 12.715 38.8048 13.918 38.0801C15.5379 37.0819 17.413 36.5759 19.3152 36.6237C21.2174 36.5762 23.0924 37.0822 24.7124 38.0801C26.4829 39.1611 28.5269 39.7103 30.6008 39.6621C32.6747 39.7103 34.7187 39.1611 36.4892 38.0801C38.1092 37.0819 39.9843 36.5759 41.8865 36.6237C43.7886 36.5762 45.6636 37.0822 47.2837 38.0801C49.0566 39.1604 51.1022 39.7095 53.1778 39.6621C55.2517 39.7103 57.2957 39.1611 59.0662 38.0801C60.7057 37.1254 62.569 36.6224 64.4663 36.6224C66.3635 36.6224 68.2268 37.1254 69.8664 38.0801C71.657 39.1159 73.689 39.6613 75.7576 39.6613C77.8262 39.6613 79.8583 39.1159 81.6489 38.0801C83.2884 37.1254 85.1517 36.6224 87.049 36.6224C88.9462 36.6224 90.8095 37.1254 92.449 38.0801C94.2396 39.1159 96.2717 39.6613 98.3403 39.6613C100.409 39.6613 102.441 39.1159 104.232 38.0801C105.852 37.0822 107.727 36.5762 109.629 36.6237H110V35.6014H109.629C107.557 35.55 105.513 36.093 103.74 37.1663Z");
    			attr_dev(path16, "fill", "#000099");
    			add_location(path16, file, 106, 3, 18356);
    			attr_dev(svg7, "viewBox", "0 0 120 60");
    			attr_dev(svg7, "aria-hidden", "true");
    			attr_dev(svg7, "focusable", "false");
    			attr_dev(svg7, "role", "presentation");
    			attr_dev(svg7, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg7, file, 103, 2, 10953);
    			attr_dev(symbol7, "id", "LOGO_Liquid");
    			add_location(symbol7, file, 102, 1, 10924);
    			attr_dev(path17, "d", "M28.6735 110C37.8735 110 45.3402 102.533 45.3402 93.3333V76.6666H28.6735C19.4735 76.6666 12.0068 84.1333 12.0068 93.3333C12.0068 102.533 19.4735 110 28.6735 110Z");
    			attr_dev(path17, "fill", "#0ACF83");
    			add_location(path17, file, 111, 3, 20304);
    			attr_dev(path18, "d", "M12.0068 60C12.0068 50.8 19.4735 43.3334 28.6735 43.3334H45.3402V76.6666H28.6735C19.4735 76.6666 12.0068 69.2 12.0068 60Z");
    			attr_dev(path18, "fill", "#A259FF");
    			add_location(path18, file, 112, 3, 20497);
    			attr_dev(path19, "d", "M12.0068 26.6667C12.0068 17.4667 19.4735 10 28.6735 10H45.3402V43.3333H28.6735C19.4735 43.3333 12.0068 35.8667 12.0068 26.6667Z");
    			attr_dev(path19, "fill", "#F24E1E");
    			add_location(path19, file, 113, 3, 20650);
    			attr_dev(path20, "d", "M45.3398 10H62.0065C71.2066 10 78.6732 17.4667 78.6732 26.6667C78.6732 35.8667 71.2066 43.3333 62.0065 43.3333H45.3398V10Z");
    			attr_dev(path20, "fill", "#FF7262");
    			add_location(path20, file, 114, 3, 20809);
    			attr_dev(path21, "d", "M78.6732 60C78.6732 69.2 71.2066 76.6666 62.0065 76.6666C52.8065 76.6666 45.3398 69.2 45.3398 60C45.3398 50.8 52.8065 43.3334 62.0065 43.3334C71.2066 43.3334 78.6732 50.8 78.6732 60Z");
    			attr_dev(path21, "fill", "#1ABCFE");
    			add_location(path21, file, 115, 3, 20963);
    			attr_dev(svg8, "viewBox", "0 0 90 120");
    			attr_dev(svg8, "aria-hidden", "true");
    			attr_dev(svg8, "focusable", "false");
    			attr_dev(svg8, "role", "presentation");
    			attr_dev(svg8, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg8, file, 110, 2, 20181);
    			attr_dev(symbol8, "id", "LOGO_Figma");
    			add_location(symbol8, file, 109, 1, 20153);
    			attr_dev(path22, "d", "M105.795 69.9703C111.268 64.4968 111.268 55.591 105.795 50.1175C103.144 47.466 99.6184 46.0062 95.8688 46.0062C94.9781 46.0062 94.102 46.0875 93.2469 46.2472C96.9727 43.6988 99.3875 39.4132 99.3875 34.648C99.3875 26.9074 93.0898 20.6101 85.3492 20.6101C80.5746 20.6101 76.2816 23.0339 73.7348 26.7726C74.5773 22.3285 73.2559 17.5785 69.8793 14.2023C67.2289 11.5507 63.7031 10.0906 59.9539 10.0906C56.2039 10.0906 52.6789 11.5507 50.0273 14.2023C46.6512 17.5785 45.3297 22.3285 46.1719 26.7726C43.6254 23.0343 39.3324 20.6101 34.5574 20.6101C26.8172 20.6101 20.5199 26.907 20.5199 34.648C20.5199 39.4136 22.934 43.6988 26.6598 46.2472C25.7952 46.0862 24.9177 46.0055 24.0383 46.0062C20.2883 46.0062 16.7633 47.4664 14.1121 50.1179C11.4602 52.7691 10 56.2945 10 60.0437C10 63.7937 11.4602 67.3187 14.1117 69.9703C16.7629 72.6214 20.2883 74.082 24.0375 74.082C24.9281 74.082 25.8043 74.0007 26.6594 73.8406C22.9336 76.3894 20.5195 80.675 20.5195 85.4402C20.5195 93.1804 26.8164 99.4777 34.557 99.4777C39.332 99.4777 43.6254 97.0535 46.1719 93.3152C45.3293 97.7597 46.6508 102.51 50.0273 105.886C52.6785 108.537 56.2039 109.997 59.9531 109.997C63.7031 109.997 67.2285 108.537 69.8797 105.886C73.2559 102.509 74.5773 97.7593 73.7348 93.3152C76.2816 97.0535 80.5746 99.4777 85.3492 99.4777C93.0898 99.4777 99.3871 93.1808 99.3871 85.4402C99.3871 80.6746 96.973 76.3894 93.2469 73.8406C94.102 74.0007 94.9785 74.082 95.8688 74.082C99.6184 74.082 103.144 72.6214 105.795 69.9703Z");
    			attr_dev(path22, "fill", "black");
    			add_location(path22, file, 120, 3, 21347);
    			attr_dev(path23, "d", "M101.559 54.3508C98.4151 51.207 93.3175 51.207 90.1733 54.3508H73.6952L85.3472 42.6992C89.7937 42.6992 93.3979 39.0945 93.3979 34.648C93.3979 30.2016 89.7937 26.5965 85.3472 26.5965C80.9003 26.5965 77.296 30.2016 77.296 34.648L65.644 46.3V29.8215C68.7882 26.6773 68.7882 21.5797 65.644 18.4355C62.4995 15.291 57.4019 15.291 54.2577 18.4355C51.1136 21.5801 51.1136 26.6777 54.2577 29.8215V46.3L42.6062 34.6477C42.6062 30.2016 39.0015 26.5969 34.555 26.5969C30.1085 26.5969 26.5038 30.2016 26.5038 34.6477C26.5038 39.0945 30.1085 42.6992 34.5546 42.6992L46.2069 54.3508H29.7284C26.5839 51.2066 21.4862 51.207 18.3417 54.3508C15.1979 57.4953 15.1979 62.593 18.3417 65.7375C21.4862 68.8813 26.5839 68.8813 29.7284 65.7375H46.2062L34.555 77.3887C30.1085 77.3887 26.5038 80.993 26.5038 85.4395C26.5038 89.8863 30.1085 93.491 34.5546 93.491C39.0015 93.491 42.6062 89.8863 42.6062 85.4398L54.2577 73.7879V90.266C51.1136 93.4102 51.1136 98.5082 54.2577 101.652C57.4022 104.796 62.4999 104.796 65.6444 101.652C68.7882 98.5078 68.7882 93.4102 65.6444 90.2656V73.7879L77.296 85.4398C77.296 89.8863 80.9003 93.4906 85.3468 93.4906C89.7937 93.4906 93.3983 89.8863 93.3983 85.4398C93.3983 80.993 89.7937 77.3887 85.3472 77.3887L73.6948 65.7367H90.1733C93.3179 68.8813 98.4155 68.8813 101.559 65.7367C104.704 62.5926 104.704 57.4945 101.559 54.3504");
    			attr_dev(path23, "fill", "#FFB13B");
    			add_location(path23, file, 121, 3, 22848);
    			attr_dev(svg9, "viewBox", "0 0 120 120");
    			attr_dev(svg9, "aria-hidden", "true");
    			attr_dev(svg9, "focusable", "false");
    			attr_dev(svg9, "role", "presentation");
    			attr_dev(svg9, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg9, file, 119, 2, 21223);
    			attr_dev(symbol9, "id", "LOGO_SVG");
    			add_location(symbol9, file, 118, 1, 21197);
    			attr_dev(path24, "d", "M10 10H110V110H10V10Z");
    			attr_dev(path24, "fill", "#F0DB4F");
    			add_location(path24, file, 126, 3, 24389);
    			attr_dev(path25, "d", "M101.816 86.1503C101.084 81.5875 98.1083 77.7567 89.2965 74.1826C86.2357 72.7757 82.8231 71.7682 81.806 69.4487C81.4448 68.0989 81.3973 67.3384 81.6254 66.521C82.2813 63.8689 85.4467 63.0419 87.9562 63.8023C89.5722 64.3441 91.1026 65.5895 92.0246 67.5761C96.3402 64.7815 96.3307 64.8004 99.344 62.8804C98.2414 61.1693 97.652 60.3803 96.9296 59.6484C94.3345 56.7492 90.7984 55.2568 85.1425 55.3708C84.1634 55.4944 83.1749 55.6274 82.1957 55.7511C79.3726 56.464 76.6824 57.9469 75.1045 59.9336C70.3707 65.3043 71.7205 74.7054 77.4809 78.5743C83.1558 82.8329 91.4923 83.8025 92.557 87.7854C93.5931 92.6618 88.9734 94.2397 84.3821 93.6789C80.998 92.9755 79.116 91.255 77.0817 88.1276C73.3365 90.2949 73.3365 90.2949 69.4867 92.5097C70.3993 94.5059 71.3592 95.409 72.8898 97.139C80.1331 104.487 98.2604 104.126 101.511 93.004C101.644 92.6237 102.519 90.0761 101.816 86.1503ZM64.3631 55.9601H55.0094C55.0094 64.04 54.9715 72.0628 54.9715 80.1427C54.9715 85.2853 55.2377 90.0001 54.4012 91.445C53.0323 94.2871 49.4867 93.9355 47.8707 93.384C46.2263 92.5761 45.3898 91.4259 44.4202 89.8005C44.154 89.3347 43.9544 88.9735 43.8878 88.945C41.3498 90.4944 38.8212 92.0532 36.2832 93.6028C37.5476 96.1978 39.4106 98.4507 41.7965 99.9145C45.3611 102.053 50.152 102.709 55.1616 101.559C58.4221 100.608 61.2357 98.6408 62.7091 95.6465C64.8383 91.7206 64.3821 86.9678 64.3631 81.7111C64.4106 73.1369 64.3631 64.5628 64.3631 55.9601Z");
    			attr_dev(path25, "fill", "#323330");
    			add_location(path25, file, 127, 3, 24442);
    			attr_dev(svg10, "viewBox", "0 0 120 120");
    			attr_dev(svg10, "aria-hidden", "true");
    			attr_dev(svg10, "focusable", "false");
    			attr_dev(svg10, "role", "presentation");
    			attr_dev(svg10, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg10, file, 125, 2, 24265);
    			attr_dev(symbol10, "id", "LOGO_JavaScript");
    			add_location(symbol10, file, 124, 1, 24232);
    			attr_dev(path26, "d", "M10 60V10H110V110H10");
    			attr_dev(path26, "fill", "#007ACC");
    			add_location(path26, file, 132, 3, 26066);
    			attr_dev(path27, "d", "M31.9248 60.175V64.25H44.9248V101.25H54.1498V64.25H67.1499V60.25C67.1499 58 67.1499 56.175 67.0499 56.125C67.0499 56.05 59.1249 56.025 49.4998 56.025L31.9998 56.1V60.2L31.9248 60.175ZM90.3499 56C92.8999 56.6 94.8499 57.75 96.5999 59.575C97.5249 60.575 98.8999 62.325 98.9999 62.775C98.9999 62.925 94.6749 65.85 92.0499 67.475C91.9499 67.55 91.5499 67.125 91.1499 66.475C89.8499 64.625 88.5249 63.825 86.4499 63.675C83.4499 63.475 81.4499 65.05 81.4499 67.675C81.4499 68.475 81.5999 68.925 81.8999 69.575C82.5749 70.95 83.8249 71.775 87.6999 73.475C94.8499 76.55 97.9499 78.575 99.8249 81.475C101.95 84.725 102.425 89.8251 101 93.6501C99.3999 97.8251 95.4999 100.65 89.9249 101.575C88.1749 101.875 84.1749 101.825 82.2999 101.5C78.2999 100.75 74.4749 98.7501 72.1249 96.1751C71.1999 95.1751 69.4249 92.5001 69.5249 92.3251L70.4749 91.7251L74.2249 89.5501L77.0499 87.9001L77.6999 88.7751C78.5249 90.0751 80.3749 91.8251 81.4499 92.4251C84.6999 94.1001 89.0499 93.8751 91.1999 91.9251C92.1249 91.0751 92.5249 90.1751 92.5249 88.9251C92.5249 87.7751 92.3499 87.25 91.7749 86.375C90.9749 85.275 89.3749 84.375 84.8749 82.375C79.6999 80.175 77.4999 78.775 75.4499 76.625C74.2749 75.325 73.1999 73.3 72.6999 71.625C72.3249 70.175 72.1999 66.625 72.5499 65.2C73.6249 60.2 77.3999 56.7 82.7999 55.7C84.5499 55.35 88.6749 55.5 90.3999 55.95L90.3499 56Z");
    			attr_dev(path27, "fill", "white");
    			add_location(path27, file, 133, 3, 26118);
    			attr_dev(svg11, "viewBox", "0 0 120 120");
    			attr_dev(svg11, "aria-hidden", "true");
    			attr_dev(svg11, "focusable", "false");
    			attr_dev(svg11, "role", "presentation");
    			attr_dev(svg11, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg11, file, 131, 2, 25942);
    			attr_dev(symbol11, "id", "LOGO_TypeScript");
    			add_location(symbol11, file, 130, 1, 25909);
    			attr_dev(path28, "d", "M93.201 26.0851C84.7148 13.9458 67.9526 10.3476 55.8346 18.0654L34.5534 31.6243C33.1217 32.5238 31.7861 33.5697 30.5709 34.7452C29.3543 35.9208 28.2641 37.2198 27.3173 38.6209C26.3705 40.0221 25.5716 41.5178 24.9327 43.0836C24.2955 44.6502 23.8223 46.2786 23.5209 47.9427C23.2693 49.3378 23.1321 50.7527 23.1138 52.1706C23.094 53.5901 23.1931 55.008 23.4081 56.4092C23.623 57.8119 23.9539 59.1948 24.3961 60.5426C24.8382 61.8904 25.3917 63.1985 26.0503 64.4548C25.5972 65.1434 25.1789 65.8543 24.797 66.5848C24.4143 67.3151 24.0698 68.0653 23.7633 68.8306C23.4569 69.596 23.19 70.3766 22.9629 71.1695C22.7357 71.9623 22.5497 72.7658 22.4033 73.5769C21.7951 76.9878 21.8755 80.4859 22.6396 83.8653C23.0208 85.5501 23.5682 87.1937 24.2756 88.7702C24.983 90.3467 25.8445 91.85 26.8508 93.2557C35.337 105.395 52.0977 108.993 64.2157 101.275L85.4969 87.7731C86.9286 86.872 88.2611 85.8245 89.4763 84.6475C90.6913 83.4714 91.7811 82.1725 92.7284 80.7718C93.6752 79.3722 94.4741 77.8765 95.113 76.3106C95.7518 74.7463 96.226 73.118 96.5294 71.4546C96.781 70.0595 96.9166 68.6461 96.9349 67.2282C96.9532 65.8103 96.8541 64.3923 96.6376 62.9912C96.4227 61.59 96.0918 60.2087 95.6481 58.8609C95.2045 57.5146 94.651 56.2064 93.9923 54.9501C94.4452 54.2625 94.8644 53.5504 95.2471 52.8201C95.6283 52.0898 95.9744 51.3397 96.2809 50.5743C96.5873 49.8089 96.8557 49.0283 97.0844 48.2355C97.3115 47.4442 97.5006 46.6407 97.6485 45.8295C97.9504 44.128 98.0815 42.4006 98.0418 40.6731C98.0022 38.9457 97.7903 37.2274 97.4091 35.5411C97.0279 33.8564 96.4806 32.2128 95.7731 30.6363C95.0666 29.0595 94.205 27.5569 93.201 26.1507");
    			attr_dev(path28, "fill", "#FF3E00");
    			add_location(path28, file, 138, 3, 27663);
    			attr_dev(path29, "d", "M53.7552 94.4297C52.0897 94.8624 50.3678 95.0383 48.6491 94.9512C46.9309 94.8627 45.2354 94.5151 43.6223 93.9159C42.0092 93.3177 40.4966 92.4771 39.1368 91.4231C37.778 90.3684 36.5879 89.1129 35.6072 87.6999C35.0019 86.8537 34.4835 85.9511 34.0596 85.0027C33.6346 84.055 33.3051 83.0672 33.0762 82.054C32.8491 81.0401 32.721 80.0064 32.6981 78.9681C32.6753 77.9298 32.7561 76.8915 32.939 75.8685C32.968 75.7023 33.0015 75.5361 33.0381 75.3714C33.0732 75.2052 33.1128 75.0406 33.1555 74.8774C33.1967 74.7128 33.2424 74.5496 33.2912 74.3865C33.3385 74.2249 33.3903 74.0633 33.4437 73.9032L33.8447 72.6789L34.9379 73.4946C35.5645 73.952 36.2109 74.3835 36.8742 74.786C37.5374 75.19 38.2174 75.5651 38.9126 75.9096C39.6064 76.2557 40.3169 76.5729 41.038 76.858C41.7592 77.1446 42.4926 77.3992 43.2366 77.6234L44.0523 77.8597L43.9791 78.6754C43.9398 79.2305 43.9976 79.7883 44.1499 80.3235C44.2246 80.5919 44.3237 80.8511 44.4441 81.1011C44.5646 81.3512 44.7064 81.5905 44.868 81.8162C45.1641 82.2418 45.5235 82.6197 45.9337 82.9368C46.3423 83.2539 46.7982 83.507 47.2846 83.687C47.7709 83.8669 48.2802 83.9705 48.7986 83.9965C49.3154 84.0239 49.8338 83.9705 50.3354 83.8394C50.4513 83.8089 50.5641 83.7739 50.6769 83.7342C50.7898 83.6946 50.9011 83.6519 51.0093 83.6031C51.1191 83.5558 51.2258 83.504 51.3326 83.4476C51.4378 83.3927 51.5399 83.3332 51.6405 83.2692L72.8898 69.7088C73.1503 69.5455 73.393 69.3554 73.614 69.1417C73.8351 68.9267 74.0317 68.6904 74.204 68.4357C74.3763 68.1811 74.5196 67.9082 74.6355 67.6231C74.7499 67.338 74.8352 67.0422 74.8901 66.7403C74.9435 66.4308 74.9664 66.1182 74.9587 65.8042C74.9511 65.4916 74.9115 65.1806 74.8413 64.8741C74.7727 64.5692 74.6721 64.2719 74.5425 63.9852C74.4144 63.7001 74.2559 63.4287 74.0729 63.1741C73.7771 62.7487 73.4188 62.3722 73.0087 62.055C72.5986 61.7379 72.1427 61.4848 71.6578 61.3049C71.1719 61.1249 70.6614 61.02 70.1438 60.9939C69.6255 60.9679 69.1071 61.0213 68.6055 61.1509C68.4911 61.1814 68.3768 61.2165 68.2639 61.2561C68.1511 61.2957 68.0413 61.3384 67.9316 61.3857C67.8218 61.4345 67.7151 61.4863 67.6099 61.5427C67.5047 61.5976 67.401 61.6586 67.3004 61.7226L59.1404 66.9035C58.808 67.1139 58.4665 67.3121 58.1188 67.4981C57.7697 67.6826 57.416 67.8548 57.0546 68.0134C56.6933 68.172 56.3258 68.3168 55.9538 68.4464C55.5818 68.5775 55.2052 68.6934 54.824 68.7956C53.1606 69.2255 51.4423 69.3993 49.7271 69.3109C48.0118 69.2225 46.321 68.8733 44.7109 68.2772C43.1009 67.6795 41.5915 66.8394 40.2345 65.7874C38.8776 64.7354 37.6883 63.4836 36.708 62.0733C36.1057 61.2271 35.5889 60.323 35.1666 59.3747C34.7427 58.4263 34.4149 57.4383 34.1877 56.426C33.9605 55.4121 33.8355 54.3783 33.8142 53.34C33.7913 52.3033 33.8721 51.265 34.0566 50.2434C34.4171 48.2322 35.1928 46.3182 36.3344 44.6235C37.4768 42.9289 38.9605 41.4915 40.6904 40.4033L62.0052 26.8444C62.336 26.634 62.6745 26.4358 63.0206 26.2498C63.3667 26.0653 63.7204 25.893 64.0787 25.7345C64.4378 25.5758 64.803 25.4314 65.1734 25.3015C65.5424 25.1703 65.9175 25.0529 66.2971 24.9508C67.9621 24.5193 69.6834 24.3424 71.4002 24.4294C73.1185 24.5178 74.8124 24.8654 76.4255 25.4646C78.0386 26.0623 79.5495 26.9039 80.9095 27.9574C82.2678 29.0127 83.4575 30.2687 84.4376 31.6822C85.0413 32.5268 85.5612 33.4294 85.9866 34.3778C86.412 35.3261 86.7413 36.3126 86.9716 37.3265C87.2003 38.3404 87.3283 39.3741 87.3512 40.4124C87.3756 41.4507 87.2963 42.489 87.1133 43.5121C87.0813 43.6798 87.0478 43.8475 87.0097 44.0137C86.9731 44.1799 86.9334 44.346 86.8907 44.5107C86.8496 44.6769 86.8038 44.8416 86.7566 45.0047C86.7093 45.1694 86.6605 45.3325 86.6072 45.4941L86.2001 46.7184L85.1145 45.9027C84.4864 45.4408 83.8384 45.0077 83.1736 44.6007C82.5089 44.1951 81.8258 43.817 81.129 43.4678C79.7341 42.772 78.2831 42.1946 76.7914 41.7419L75.9742 41.5056L76.0489 40.6899C76.0717 40.4109 76.0702 40.1303 76.0443 39.8529C76.0199 39.5754 75.9696 39.2994 75.8964 39.0295C75.8217 38.7612 75.7256 38.4974 75.6052 38.2459C75.4863 37.9928 75.3445 37.7519 75.1829 37.5232C74.8854 37.1053 74.526 36.7351 74.1171 36.4254C73.7088 36.1143 73.2553 35.8675 72.7724 35.6936C71.8019 35.3415 70.7471 35.2942 69.749 35.5579C69.6331 35.5884 69.5187 35.6234 69.4074 35.6616C69.2946 35.7012 69.1833 35.7454 69.0735 35.7927C68.9653 35.8399 68.857 35.8933 68.7518 35.9482C68.6466 36.0046 68.5429 36.0641 68.4423 36.1281L47.1535 49.6641C46.8943 49.8272 46.6518 50.0178 46.4323 50.2312C46.2127 50.4447 46.0145 50.681 45.8422 50.9341C45.6714 51.1887 45.5268 51.4599 45.4108 51.7437C45.2949 52.0288 45.2095 52.3231 45.1546 52.625C45.1013 52.9345 45.0784 53.2486 45.086 53.5626C45.1043 54.1913 45.2457 54.8103 45.5022 55.3846C45.6316 55.6705 45.7883 55.9432 45.9703 56.1988C46.2646 56.6196 46.6213 56.9947 47.0284 57.3087C47.4347 57.6243 47.8866 57.8762 48.3686 58.0558C49.3379 58.4162 50.3937 58.4741 51.3966 58.222C51.5109 58.19 51.6253 58.1549 51.7381 58.1153C51.8494 58.0756 51.9607 58.0314 52.0705 57.9842C52.1798 57.9367 52.2871 57.8848 52.3922 57.8287C52.4974 57.7738 52.6011 57.7143 52.7017 57.6503L60.8617 52.4786C61.1956 52.2652 61.5356 52.0639 61.8847 51.8779C62.2324 51.6904 62.5876 51.5181 62.9505 51.358C63.3121 51.1993 63.6799 51.0549 64.0528 50.925C64.4264 50.7938 64.8045 50.678 65.1872 50.5773C66.8521 50.1443 68.5719 49.9675 70.2902 50.0529C72.0085 50.1398 73.7024 50.4874 75.3155 51.0851C76.9271 51.6827 78.4395 52.5228 79.798 53.5779C81.158 54.6314 82.3472 55.8862 83.3276 57.2996C83.9314 58.1458 84.4498 59.0484 84.8751 59.9967C85.3005 60.9445 85.6304 61.9323 85.8601 62.9454C86.0888 63.9578 86.2168 64.9915 86.2412 66.0298C86.2656 67.0696 86.1848 68.1079 86.0034 69.1295C85.8236 70.1324 85.54 71.114 85.1572 72.0583C84.7747 73.0029 84.2944 73.9048 83.724 74.7494C83.1553 75.594 82.4997 76.3777 81.7679 77.0867C81.036 77.7957 80.2325 78.4269 79.3696 78.9696L58.0792 92.5285C57.7453 92.7404 57.4038 92.9401 57.0561 93.1262C56.707 93.3122 56.3517 93.4844 55.9889 93.643C55.6275 93.8031 55.2601 93.9479 54.8865 94.0791C54.5145 94.2102 54.1364 94.3276 53.7552 94.4297Z");
    			attr_dev(path29, "fill", "white");
    			add_location(path29, file, 139, 3, 29304);
    			attr_dev(svg12, "viewBox", "0 0 120 120");
    			attr_dev(svg12, "aria-hidden", "true");
    			attr_dev(svg12, "focusable", "false");
    			attr_dev(svg12, "role", "presentation");
    			attr_dev(svg12, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg12, file, 137, 2, 27539);
    			attr_dev(symbol12, "id", "LOGO_Svelte");
    			add_location(symbol12, file, 136, 1, 27510);
    			attr_dev(path30, "d", "M71.548 17L60 37L48.452 17H10L60 103.604L110 17H71.548Z");
    			attr_dev(path30, "fill", "#4DBA87");
    			add_location(path30, file, 144, 3, 35488);
    			attr_dev(path31, "d", "M71.548 17L60 37L48.452 17H30L60 68.96L90 17H71.548Z");
    			attr_dev(path31, "fill", "#435466");
    			add_location(path31, file, 145, 3, 35575);
    			attr_dev(svg13, "viewBox", "0 0 120 120");
    			attr_dev(svg13, "aria-hidden", "true");
    			attr_dev(svg13, "focusable", "false");
    			attr_dev(svg13, "role", "presentation");
    			attr_dev(svg13, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg13, file, 143, 2, 35364);
    			attr_dev(symbol13, "id", "LOGO_VueJS");
    			add_location(symbol13, file, 142, 1, 35336);
    			attr_dev(path32, "d", "M21.4468 101.964L15 29.655H85.84L79.3862 101.953L50.3765 109.995L21.4468 101.964Z");
    			attr_dev(path32, "fill", "#E44D26");
    			add_location(path32, file, 150, 3, 35830);
    			attr_dev(path33, "d", "M50.4199 103.848L73.8609 97.349L79.3764 35.5676H50.4199V103.848Z");
    			attr_dev(path33, "fill", "#F16529");
    			add_location(path33, file, 151, 3, 35943);
    			attr_dev(path34, "d", "M50.4201 62.3861H38.6851L37.8745 53.3047H50.4201V44.4362H28.1821L28.3946 46.8154L30.5743 71.2543H50.4201V62.3861ZM50.4201 85.4181L50.3811 85.4287L40.5044 82.7616L39.873 75.6888H30.9706L32.2132 89.6136L50.3795 94.6566L50.4201 94.6451V85.4181Z");
    			attr_dev(path34, "fill", "#EBEBEB");
    			add_location(path34, file, 152, 3, 36039);
    			attr_dev(path35, "d", "M21.5908 10.0046H26.0975V14.4573H30.2201V10.0046H34.727V23.4884H30.2201V18.9733H26.0975V23.4884H21.5911L21.5908 10.0046ZM40.6539 14.4763H36.6865V10.0046H49.1307V14.4763H45.1614V23.4884H40.654V14.4763H40.6539ZM51.1053 10.0046H55.8049L58.6957 14.7425L61.5837 10.0046H66.2849V23.4884H61.7959V16.805L58.6952 21.5992H58.6178L55.515 16.805V23.4884H51.1052V10.0046H51.1053ZM68.5275 10.0046H73.0355V19.0316H79.3737V23.4884H68.5275V10.0046Z");
    			attr_dev(path35, "fill", "black");
    			add_location(path35, file, 153, 3, 36312);
    			attr_dev(path36, "d", "M50.3892 62.3861V71.2543H61.3098L60.2802 82.7561L50.3892 85.4255V94.6519L68.5699 89.6136L68.7029 88.1148L70.7872 64.7676L71.0036 62.3861H68.614H50.3892ZM50.3892 44.4362V53.3047H71.8107L71.9883 51.3112L72.3924 46.8154L72.6046 44.4362H50.3892Z");
    			attr_dev(path36, "fill", "white");
    			add_location(path36, file, 154, 3, 36773);
    			attr_dev(svg14, "viewBox", "0 0 100 120");
    			attr_dev(svg14, "aria-hidden", "true");
    			attr_dev(svg14, "focusable", "false");
    			attr_dev(svg14, "role", "presentation");
    			attr_dev(svg14, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg14, file, 149, 2, 35706);
    			attr_dev(symbol14, "id", "LOGO_HTML");
    			add_location(symbol14, file, 148, 1, 35679);
    			attr_dev(path37, "d", "M70.5166 13.7003H64.6401L70.7526 20.3368V23.493H58.1595V19.7968H64.272L58.1595 13.1602V10H70.5206L70.5166 13.7003ZM55.6593 13.7003H49.7749L55.8954 20.3368V23.493H43.2983V19.7968H49.4108L43.2983 13.1602V10H55.6593V13.7003ZM40.9461 13.8523H34.6056V19.6447H40.9461V23.497H30.0933V10H40.9461V13.8523Z");
    			attr_dev(path37, "fill", "#131313");
    			add_location(path37, file, 159, 3, 37214);
    			attr_dev(path38, "d", "M21.4485 101.971L15 29.6576H85.8457L79.3891 101.959L50.3788 110L21.4485 101.971Z");
    			attr_dev(path38, "fill", "#1572B6");
    			add_location(path38, file, 160, 3, 37542);
    			attr_dev(path39, "d", "M50.4229 103.856L73.8647 97.355L79.3772 35.5699H50.4229V103.856Z");
    			attr_dev(path39, "fill", "#33A9DC");
    			add_location(path39, file, 161, 3, 37654);
    			attr_dev(path40, "d", "M50.4229 61.7681H62.1598L62.9679 52.6874H50.4229V43.8228H72.6646L72.4526 46.2029L70.2724 70.6448H50.4229V61.7681Z");
    			attr_dev(path40, "fill", "white");
    			add_location(path40, file, 162, 3, 37750);
    			attr_dev(path41, "d", "M50.4709 84.8019H50.4309L40.5541 82.1337L39.9221 75.0612H31.0254L32.2695 88.9863L50.4389 94.0427H50.4909V84.8019H50.4709Z");
    			attr_dev(path41, "fill", "#EBEBEB");
    			add_location(path41, file, 163, 3, 37893);
    			attr_dev(path42, "d", "M61.4077 70.2568L60.3396 82.1258L50.4468 84.794V94.0347L68.6282 88.9943L68.7602 87.4942L70.3044 70.2528H61.4077V70.2568Z");
    			attr_dev(path42, "fill", "white");
    			add_location(path42, file, 164, 3, 38046);
    			attr_dev(path43, "d", "M50.4551 43.8228V52.6914H29.0374L28.8534 50.6993L28.4493 46.2029L28.2373 43.8228H50.4551ZM50.4231 61.7681V70.6368H40.6583L40.4863 68.6446L40.0823 64.1483L39.8702 61.7681H50.4191H50.4231Z");
    			attr_dev(path43, "fill", "#EBEBEB");
    			add_location(path43, file, 165, 3, 38196);
    			attr_dev(svg15, "viewBox", "0 0 100 120");
    			attr_dev(svg15, "aria-hidden", "true");
    			attr_dev(svg15, "focusable", "false");
    			attr_dev(svg15, "role", "presentation");
    			attr_dev(svg15, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg15, file, 158, 2, 37090);
    			attr_dev(symbol15, "id", "LOGO_CSS");
    			add_location(symbol15, file, 157, 1, 37064);
    			attr_dev(path44, "d", "M109.026 36.1319C108.748 35.9 106.243 33.9985 100.863 33.9985C99.4719 33.9985 98.0341 34.1376 96.6427 34.3695C95.6224 27.2735 89.7322 23.8414 89.5003 23.6559L88.0626 22.821L87.135 24.166C85.9755 25.9748 85.0943 28.0155 84.5841 30.1026C83.6101 34.1376 84.2131 37.9407 86.2538 41.1873C83.7957 42.5786 79.807 42.9033 78.9722 42.9497H13.1135C11.3974 42.9497 10.0061 44.3411 10.0061 46.0571C9.91329 51.8081 10.8873 57.5592 12.8816 62.9856C15.1542 68.9221 18.5399 73.3282 22.8995 76.0182C27.8157 79.0328 35.8394 80.7489 44.8833 80.7489C48.9647 80.7489 53.0461 80.3779 57.0811 79.6358C62.693 78.6154 68.073 76.6675 73.0356 73.8384C77.117 71.473 80.781 68.4584 83.8884 64.9335C89.1293 59.0433 92.2367 52.4575 94.5093 46.6137H95.4369C101.142 46.6137 104.666 44.3411 106.614 42.3931C107.913 41.1873 108.887 39.7031 109.583 38.0335L110 36.8276L109.026 36.1319Z");
    			attr_dev(path44, "fill", "#0091E2");
    			add_location(path44, file, 170, 3, 38586);
    			attr_dev(path45, "d", "M19.2357 41.0482H28.0478C28.4652 41.0482 28.8362 40.7235 28.8362 40.2597V32.3752C28.8362 31.9578 28.5116 31.5868 28.0478 31.5868H19.2357C18.8183 31.5868 18.4473 31.9114 18.4473 32.3752V40.2597C18.4936 40.7235 18.8183 41.0482 19.2357 41.0482ZM31.3871 41.0482H40.1992C40.6166 41.0482 40.9876 40.7235 40.9876 40.2597V32.3752C40.9876 31.9578 40.663 31.5868 40.1992 31.5868H31.3871C30.9697 31.5868 30.5987 31.9114 30.5987 32.3752V40.2597C30.645 40.7235 30.9697 41.0482 31.3871 41.0482ZM43.7704 41.0482H52.5825C52.9999 41.0482 53.3709 40.7235 53.3709 40.2597V32.3752C53.3709 31.9578 53.0463 31.5868 52.5825 31.5868H43.7704C43.353 31.5868 42.982 31.9114 42.982 32.3752V40.2597C42.982 40.7235 43.3066 41.0482 43.7704 41.0482ZM55.9682 41.0482H64.7803C65.1977 41.0482 65.5687 40.7235 65.5687 40.2597V32.3752C65.5687 31.9578 65.2441 31.5868 64.7803 31.5868H55.9682C55.5508 31.5868 55.1797 31.9114 55.1797 32.3752V40.2597C55.1797 40.7235 55.5508 41.0482 55.9682 41.0482ZM31.3871 29.778H40.1992C40.6166 29.778 40.9876 29.4069 40.9876 28.9895V21.105C40.9876 20.6876 40.663 20.3166 40.1992 20.3166H31.3871C30.9697 20.3166 30.5987 20.6412 30.5987 21.105V28.9895C30.645 29.4069 30.9697 29.778 31.3871 29.778ZM43.7704 29.778H52.5825C52.9999 29.778 53.3709 29.4069 53.3709 28.9895V21.105C53.3709 20.6876 53.0463 20.3166 52.5825 20.3166H43.7704C43.353 20.3166 42.982 20.6412 42.982 21.105V28.9895C42.982 29.4069 43.3066 29.778 43.7704 29.778ZM55.9682 29.778H64.7803C65.1977 29.778 65.5687 29.4069 65.5687 28.9895V21.105C65.5687 20.6876 65.1977 20.3166 64.7803 20.3166H55.9682C55.5508 20.3166 55.1797 20.6412 55.1797 21.105V28.9895C55.1797 29.4069 55.5508 29.778 55.9682 29.778ZM55.9682 18.4614H64.7803C65.1977 18.4614 65.5687 18.1367 65.5687 17.673V9.78846C65.5687 9.37104 65.1977 9 64.7803 9H55.9682C55.5508 9 55.1797 9.32466 55.1797 9.78846V17.673C55.1797 18.0904 55.5508 18.4614 55.9682 18.4614ZM68.2587 41.0482H77.0708C77.4882 41.0482 77.8593 40.7235 77.8593 40.2597V32.3752C77.8593 31.9578 77.5346 31.5868 77.0708 31.5868H68.2587C67.8413 31.5868 67.4703 31.9114 67.4703 32.3752V40.2597C67.5167 40.7235 67.8413 41.0482 68.2587 41.0482Z");
    			attr_dev(path45, "fill", "#0091E2");
    			add_location(path45, file, 171, 3, 39467);
    			attr_dev(svg16, "viewBox", "0 0 120 90");
    			attr_dev(svg16, "aria-hidden", "true");
    			attr_dev(svg16, "focusable", "false");
    			attr_dev(svg16, "role", "presentation");
    			attr_dev(svg16, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg16, file, 169, 2, 38463);
    			attr_dev(symbol16, "id", "LOGO_Docker");
    			add_location(symbol16, file, 168, 1, 38434);
    			attr_dev(path46, "d", "M16.7062 85.0189C17.1602 85.826 17.8159 86.4313 18.623 86.8852L57.4628 109.281C59.0769 110.24 61.0441 110.24 62.6078 109.281L101.448 86.8852C103.062 85.9773 104.02 84.2623 104.02 82.396V37.604C104.02 35.7377 103.062 34.0227 101.448 33.1148L62.6078 10.7188C60.9937 9.7604 59.0265 9.7604 57.4628 10.7188L18.623 33.1148C16.9584 34.0227 16 35.7377 16 37.604V82.4464C16 83.3543 16.2018 84.2118 16.7062 85.0189Z");
    			attr_dev(path46, "fill", "#009639");
    			add_location(path46, file, 176, 3, 41790);
    			attr_dev(path47, "d", "M47.5763 77.0996C47.5763 79.8739 45.3568 82.0933 42.5826 82.0933C39.8083 82.0933 37.5889 79.8739 37.5889 77.0996V42.85C37.5889 40.1766 39.9596 38.0076 43.2383 38.0076C45.609 38.0076 48.3833 38.966 50.0479 41.0341L51.5611 42.85L72.4439 67.8184V42.9508C72.4439 40.1766 74.6633 37.9572 77.4375 37.9572C80.2118 37.9572 82.4312 40.1766 82.4312 42.9508V77.2005C82.4312 79.8739 80.0605 82.0429 76.7818 82.0429C74.4111 82.0429 71.6368 81.0845 69.9722 79.0164L47.5763 52.2825V77.0996Z");
    			attr_dev(path47, "fill", "white");
    			add_location(path47, file, 177, 3, 42227);
    			attr_dev(svg17, "viewBox", "0 0 120 120");
    			attr_dev(svg17, "aria-hidden", "true");
    			attr_dev(svg17, "focusable", "false");
    			attr_dev(svg17, "role", "presentation");
    			attr_dev(svg17, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg17, file, 175, 2, 41666);
    			attr_dev(symbol17, "id", "LOGO_Nginx");
    			add_location(symbol17, file, 174, 1, 41638);
    			attr_dev(path48, "d", "M17.5435 22.7021C17.3501 22.7021 17.3017 22.6054 17.3984 22.4603L18.4139 21.1547C18.5106 21.0096 18.7524 20.9129 18.9458 20.9129H36.2089C36.4023 20.9129 36.4507 21.058 36.3539 21.2031L35.5319 22.4603C35.4352 22.6054 35.1934 22.7504 35.0483 22.7504L17.5435 22.7021ZM10.2418 27.1508C10.0483 27.1508 9.99998 27.0541 10.0967 26.909L11.1122 25.6034C11.2089 25.4584 11.4507 25.3617 11.6441 25.3617H33.6944C33.8878 25.3617 33.9845 25.5067 33.9362 25.6518L33.5493 26.8123C33.5009 27.0058 33.3075 27.1025 33.1141 27.1025L10.2418 27.1508ZM21.9439 31.5996C21.7505 31.5996 21.7021 31.4545 21.7988 31.3094L22.4758 30.1005C22.5725 29.9555 22.7659 29.8104 22.9594 29.8104H32.6305C32.824 29.8104 32.9207 29.9555 32.9207 30.1489L32.824 31.3094C32.824 31.5029 32.6305 31.6479 32.4855 31.6479L21.9439 31.5996ZM72.1373 21.8317C69.0909 22.6054 67.0116 23.1856 64.0135 23.9593C63.2882 24.1528 63.2398 24.2011 62.6112 23.4758C61.8859 22.6537 61.3539 22.1218 60.3385 21.6383C57.2921 20.1392 54.3423 20.5744 51.5861 22.3636C48.2979 24.4913 46.6054 27.6344 46.6538 31.5512C46.7021 35.4197 49.3617 38.6112 53.1818 39.1431C56.47 39.5783 59.2263 38.4178 61.4023 35.9516C61.8375 35.4197 62.2244 34.8394 62.7079 34.1624H53.3752C52.3597 34.1624 52.118 33.5338 52.4565 32.7118C53.0851 31.2127 54.2456 28.6982 54.9226 27.441C55.0677 27.1508 55.4062 26.6673 56.1315 26.6673H73.7331C73.6363 27.9729 73.6363 29.2785 73.4429 30.5841C72.911 34.0657 71.6054 37.2572 69.4777 40.0619C65.9961 44.6557 61.4507 47.5087 55.6963 48.2824C50.9574 48.911 46.557 47.9922 42.6886 45.0909C39.1102 42.3829 37.0793 38.8046 36.5474 34.3559C35.9187 29.0851 37.4661 24.3462 40.6576 20.1876C44.0909 15.6905 48.6363 12.8375 54.1973 11.822C58.7427 11 63.0948 11.5319 67.0116 14.1914C69.5745 15.8839 71.412 18.205 72.6209 21.0096C72.911 21.4448 72.7176 21.6866 72.1373 21.8317Z");
    			attr_dev(path48, "fill", "#01ADD8");
    			add_location(path48, file, 182, 3, 42900);
    			attr_dev(path49, "d", "M88.1432 48.5726C83.7428 48.4759 79.7293 47.2186 76.3444 44.3173C73.4914 41.8511 71.7022 38.708 71.1219 34.9846C70.2515 29.5204 71.7506 24.6848 75.0388 20.3811C78.5688 15.7389 82.8241 13.3212 88.5784 12.3057C93.5107 11.4353 98.1529 11.9188 102.36 14.7718C106.18 17.383 108.549 20.913 109.178 25.5552C110 32.0832 108.114 37.4024 103.617 41.9478C100.426 45.1877 96.5088 47.2186 92.0117 48.1374C90.7061 48.3792 89.4005 48.4275 88.1432 48.5726ZM99.6519 29.0368C99.6036 28.4082 99.6036 27.9246 99.5069 27.4411C98.6364 22.6538 94.2361 19.9459 89.6423 21.0097C85.1452 22.0252 82.2438 24.8782 81.18 29.4237C80.3096 33.1954 82.1471 37.0155 85.6287 38.5629C88.2883 39.7235 90.9479 39.5784 93.5107 38.2728C97.3308 36.2902 99.4101 33.1954 99.6519 29.0368Z");
    			attr_dev(path49, "fill", "#01ADD8");
    			add_location(path49, file, 183, 3, 44747);
    			attr_dev(svg18, "viewBox", "0 0 120 60");
    			attr_dev(svg18, "aria-hidden", "true");
    			attr_dev(svg18, "focusable", "false");
    			attr_dev(svg18, "role", "presentation");
    			attr_dev(svg18, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg18, file, 181, 2, 42777);
    			attr_dev(symbol18, "id", "LOGO_Go");
    			add_location(symbol18, file, 180, 1, 42752);
    			attr_dev(path50, "d", "M12 354s-24-17 5-41l67-59s19-21 40-3l619 469v225s-1 35-46 31z");
    			attr_dev(path50, "fill", "#2489ca");
    			add_location(path50, file, 188, 3, 45702);
    			attr_dev(path51, "d", "M172 499 12 644s-16 12 0 34l74 67s18 19 44-2l169-129z");
    			attr_dev(path51, "fill", "#1070b3");
    			add_location(path51, file, 189, 3, 45795);
    			attr_dev(path52, "d", "m452 500 293-223-2-224s-13-49-55-23L299 384z");
    			attr_dev(path52, "fill", "#0877b9");
    			add_location(path52, file, 190, 3, 45880);
    			attr_dev(path53, "d", "M697 976c17 18 38 12 38 12l228-112c29-20 25-45 25-45V160c0-30-30-40-30-40L760 25c-43-27-71 5-71 5s36-27 54 23v887c0 7-2 13-4 18-5 10-17 20-44 16z");
    			attr_dev(path53, "fill", "#3c99d4");
    			add_location(path53, file, 191, 3, 45956);
    			attr_dev(svg19, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg19, "aria-hidden", "true");
    			attr_dev(svg19, "focusable", "false");
    			attr_dev(svg19, "role", "presentation");
    			attr_dev(svg19, "viewBox", "-11.9 -2 1003.9 995.6");
    			add_location(svg19, file, 187, 2, 45568);
    			attr_dev(symbol19, "id", "LOGO_VSC");
    			add_location(symbol19, file, 186, 1, 45542);
    			attr_dev(path54, "d", "M255 158a13 13 0 0 0-10.7-8.6c-2.5-.3-5.3-.2-8.6.5-5.8 1.2-10.1 1.6-13.3 1.7a255 255 0 0 0 27-64.2c9-34.7 4.2-50.5-1.4-57.6A77.5 77.5 0 0 0 185.6.4c-14-.2-26.2 2.5-32.5 4.5-6-1-12.3-1.6-19-1.7a61.7 61.7 0 0 0-33 8.1c-5.3-1.7-13.7-4.2-23.5-5.8-22.8-3.8-41.2-.9-54.7 8.7C6.6 25.7-.9 45.7.5 73.6c.4 9 5.4 36 13.2 61.5 4.5 14.7 9.3 27 14.2 36.3 7 13.4 14.6 21.2 23 24a22.6 22.6 0 0 0 22.4-4.8c1.1 1.4 2.7 2.7 4.7 4 2.6 1.6 5.7 3 8.9 3.8 11.3 2.8 22 2 31-1.9a581.5 581.5 0 0 1 .3 10.7A109.5 109.5 0 0 0 123 240c1.4 4.2 3.6 11 9.3 16.5 6 5.5 13.1 7.3 19.7 7.3 3.3 0 6.4-.5 9.2-1 9.8-2.2 21-5.4 29-16.9 7.6-10.8 11.4-27.2 12-53l.3-2 .1-1.4 1.8.2h.5c10 .4 22.2-1.7 29.7-5.2 6-2.7 25-12.8 20.5-26.3");
    			add_location(path54, file, 196, 3, 46346);
    			attr_dev(path55, "d", "M238 160.7c-29.8 6.2-31.9-4-31.9-4 31.4-46.5 44.5-105.6 33.2-120.1C208.4-3 155 15.8 154 16.3h-.3a106 106 0 0 0-19.8-2 49 49 0 0 0-31.4 9.3S7-15.7 11.5 73.1c1 18.9 27 142.9 58.2 105.4 11.4-13.7 22.4-25.3 22.4-25.3 5.5 3.7 12 5.5 18.9 4.8l.5-.4c-.2 1.7 0 3.4.2 5.3-8 9-5.6 10.6-21.7 13.9-16.2 3.3-6.7 9.3-.5 10.8 7.6 2 25 4.6 36.8-12l-.4 2c3.1 2.5 5.3 16.3 5 29-.4 12.5-.7 21.1 1.8 27.8 2.5 6.8 5 22 26 17.4 17.7-3.7 26.8-13.5 28-29.9 1-11.6 3-9.8 3.2-20.2l1.6-5c1.9-15.7.3-20.7 11.2-18.4l2.6.2c8 .4 18.4-1.2 24.6-4 13.2-6.2 21-16.5 8-13.8");
    			attr_dev(path55, "fill", "#336791");
    			add_location(path55, file, 197, 3, 47052);
    			attr_dev(path56, "d", "M108 81.5c-2.6-.3-5 0-6.3 1-.6.5-.9 1-1 1.5 0 1 .7 2.3 1.2 3 1.3 1.7 3.3 3 5.2 3.2h.9c3.2 0 6.2-2.5 6.4-4.3.4-2.4-3-4-6.3-4.4m88.8.1c-.3-1.8-3.6-2.4-6.6-2-3.1.5-6.1 1.9-5.9 3.7.2 1.5 2.8 3.9 5.8 3.9h.8c2-.3 3.6-1.6 4.3-2.4 1-1.1 1.7-2.4 1.6-3.2");
    			attr_dev(path56, "fill", "#FFF");
    			add_location(path56, file, 198, 3, 47621);
    			attr_dev(path57, "d", "M247.8 160c-1.1-3.4-4.8-4.5-10.8-3.3-18 3.8-24.5 1.2-26.6-.4 14-21.3 25.5-47 31.7-71.1 3-11.4 4.6-22 4.7-30.6.1-9.5-1.5-16.4-4.8-20.7a70.4 70.4 0 0 0-56.9-26.5c-16.3-.2-30.2 4-32.8 5.2a82 82 0 0 0-18.6-2.4c-12.2-.2-22.9 2.7-31.7 8.7-3.8-1.4-13.6-4.8-25.7-6.7-20.9-3.4-37.5-.8-49.3 7.5-14.1 10-20.7 28-19.4 53.2.4 8.5 5.3 34.6 13 59.7 10 33 21 51.6 32.4 55.5 1.4.4 3 .7 4.6.7 4.2 0 9.4-1.9 14.7-8.3a529.8 529.8 0 0 1 20.3-23c4.5 2.5 9.5 3.8 14.6 4v.4a117.7 117.7 0 0 0-2.6 3.2c-3.5 4.4-4.2 5.4-15.5 7.7-3.3.7-11.8 2.4-12 8.4-.1 6.6 10.2 9.3 11.3 9.6 4.1 1 8 1.6 11.8 1.6 9 0 17-3 23.5-8.8-.2 23.4.8 46.4 3.6 53.4 2.3 5.8 7.9 19.8 25.6 19.8 2.6 0 5.5-.3 8.7-1 18.5-4 26.5-12.1 29.6-30.2 1.7-9.6 4.6-32.6 5.9-45 2.8.9 6.5 1.3 10.4 1.3 8.3 0 17.8-1.8 23.7-4.5 6.7-3.1 18.8-10.7 16.6-17.4zm-44.1-83.5c0 3.7-.6 7-1.1 10.5-.6 3.7-1.2 7.5-1.3 12.2-.2 4.5.4 9.2 1 13.8a49.2 49.2 0 0 1-2.2 28 36.5 36.5 0 0 1-2-4c-.5-1.2-1.7-3.4-3.3-6.3-6.4-11.5-21.4-38.4-13.7-49.3 2.2-3.3 8-6.7 22.6-4.9zm-17.6-61.7c21.3.4 38.2 8.4 50.1 23.7 9.2 11.7-1 65-30.1 111a171.3 171.3 0 0 0-1-1.2l-.3-.4c7.6-12.5 6-24.8 4.8-35.8-.6-4.5-1-8.7-1-12.7a90 90 0 0 1 1.3-11.3 71.6 71.6 0 0 0 1.3-16c-.5-5-6.3-20.2-18-33.8a81 81 0 0 0-28.6-21.5c5.5-1.2 13-2.2 21.5-2zm-119.4 161c-6 7-10 5.7-11.3 5.3-8.8-3-18.9-21.4-27.8-50.7A330.7 330.7 0 0 1 15 72.5C13.8 50 19.3 34.2 31.2 25.8c19.4-13.8 51.3-5.6 64.2-1.4l-.6.5c-21 21.3-20.5 57.6-20.5 59.8 0 .9 0 2 .2 3.7.3 6.1 1 17.5-.8 30.4-1.7 12 2 23.6 10.1 32a36.3 36.3 0 0 0 2.6 2.6 541 541 0 0 0-19.7 22.4zm22.5-30a31 31 0 0 1-8.2-26 157 157 0 0 0 .8-31.8v-2.3c3-2.7 17.2-10.3 27.4-8 4.6 1 7.4 4.2 8.6 9.6 6 28.1.8 39.9-3.4 49.3a91 91 0 0 0-2.4 5.6l-.6 1.5c-1.3 3.7-2.6 7.2-3.4 10.4-7 0-13.7-3-18.8-8.3zm1 37.9c-2-.5-3.8-1.4-4.9-2.1.9-.4 2.5-1 5.2-1.6 13.4-2.7 15.4-4.7 20-10.4 1-1.3 2.1-2.8 3.8-4.6 2.4-2.7 3.5-2.2 5.5-1.4 1.6.7 3.2 2.7 3.8 5 .3 1 .7 3-.5 4.6-9.4 13.1-23 13-32.9 10.5zm69.8 65c-16.3 3.4-22-4.9-25.9-14.4-2.4-6.2-3.6-33.9-2.8-64.5 0-.4 0-.8-.2-1.1a15.4 15.4 0 0 0-.4-2.2 15 15 0 0 0-8.1-9.7c-1.5-.6-4.2-1.7-7.5-1 .7-2.8 2-6 3.2-9.5l.6-1.5c.6-1.7 1.4-3.4 2.2-5.2 4.4-9.9 10.5-23.3 4-53.8-2.5-11.4-10.8-17-23.3-15.7A53.5 53.5 0 0 0 82 76.7c1-11.5 4.6-33 18-46.6a44.3 44.3 0 0 1 33.6-12.6 71.2 71.2 0 0 1 54.4 26c8.5 10 13 20.1 14.9 25.5-13.8-1.4-23.1 1.4-27.9 8.1-10.3 14.8 5.7 43.4 13.3 57.2 1.4 2.5 2.7 4.7 3 5.6a51 51 0 0 0 8.1 13l2 2.6c-4.2 1.2-11.7 4-11 17.8-.5 7-4.4 39.6-6.4 51-2.6 15.3-8.2 21-24 24.3zm68.1-78c-4.2 2-11.4 3.5-18.1 3.8-7.5.3-11.3-.9-12.2-1.6-.4-8.6 2.8-9.5 6.2-10.5l1.5-.5 1 .8c6 4 16.8 4.4 32 1.3h.1c-2 1.8-5.5 4.4-10.5 6.7z");
    			attr_dev(path57, "fill", "#FFF");
    			add_location(path57, file, 199, 3, 47894);
    			attr_dev(svg20, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg20, "aria-hidden", "true");
    			attr_dev(svg20, "focusable", "false");
    			attr_dev(svg20, "role", "presentation");
    			attr_dev(svg20, "viewBox", "0 0 256 264");
    			attr_dev(svg20, "preserveAspectRatio", "xMinYMin meet");
    			add_location(svg20, file, 195, 2, 46186);
    			attr_dev(symbol20, "id", "LOGO_PostgreSQL");
    			add_location(symbol20, file, 194, 1, 46153);
    			attr_dev(path58, "d", "M17.7 19.9a2 2 0 0 1-.7.1h-1a2 2 0 0 1-2-2v-3c0-1.1.9-2 2-2h1a2 2 0 0 1 2 2v3c0 .5-.2 1-.5 1.3l.8.8-.7.7-1-1Zm-1-.9H16a1 1 0 0 1-1-1v-3c0-.6.4-1 1-1h1c.6 0 1 .4 1 1v3c0 .2 0 .4-.2.6l-1.4-1.4-.7.7 1 1.1ZM8 10a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h17a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3H8Zm2 3a2 2 0 1 0 0 4h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1H8c0 1.1.9 2 2 2h1a2 2 0 1 0 0-4h-1a1 1 0 1 1 0-2h1c.6 0 1 .5 1 1h1a2 2 0 0 0-2-2h-1Zm15 6v1h-5v-7h1v6h4Z");
    			attr_dev(path58, "fill", "#FFAB00");
    			attr_dev(path58, "fill-rule", "evenodd");
    			add_location(path58, file, 204, 3, 50659);
    			attr_dev(svg21, "viewBox", "0 0 32 32");
    			attr_dev(svg21, "aria-hidden", "true");
    			attr_dev(svg21, "focusable", "false");
    			attr_dev(svg21, "role", "presentation");
    			attr_dev(svg21, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg21, file, 203, 2, 50537);
    			attr_dev(symbol21, "id", "LOGO_SQL");
    			add_location(symbol21, file, 202, 1, 50511);
    			attr_dev(path59, "d", "M25.4119 56.7741C28.0057 53.6718 28.3108 50.4677 26.302 44.5173C25.0305 40.7536 22.9198 37.8548 24.4709 35.5153C26.1239 33.0232 29.633 35.4392 26.7088 38.7702L27.2936 39.1773C30.803 39.5841 32.5321 34.7778 29.9127 33.4048C22.9961 29.7939 16.944 36.736 19.6139 44.7716C20.7584 48.179 22.3604 51.7899 21.0635 54.6636C19.9446 57.1302 17.7832 58.5796 16.3336 58.6304C13.3076 58.7831 15.3166 51.8409 18.8004 50.1116C19.1055 49.9593 19.5377 49.7558 19.1309 49.2472C14.8334 48.764 12.3158 50.7474 10.8664 53.5192C6.64514 61.5802 18.8766 64.5554 25.4119 56.7741ZM100.936 33.0741C101.928 35.5155 103.429 37.9312 102.538 40.0671C101.801 41.8981 100.835 42.6608 99.7666 42.839C98.2664 43.0933 98.6733 38.3888 101.242 36.9903C101.47 36.8632 101.801 36.2528 101.496 35.8968C98.2408 35.7189 96.41 37.2698 95.4182 39.3298C92.5448 45.3564 101.928 47.0095 106.531 41.0843C108.362 38.7194 108.438 36.38 106.683 32.1331C105.564 29.4378 103.861 27.4288 104.929 25.6487C106.073 23.7671 108.819 25.3946 106.76 27.912L107.217 28.1663C109.887 28.3189 110.981 24.7589 108.947 23.8689C103.581 21.5802 98.5715 27.3526 100.936 33.0741V33.0741ZM66.9631 26.6405C65.1069 25.1657 59.8938 27.6323 58.419 31.294C56.5625 35.9476 53.8162 42.7374 51.1207 45.7124C48.2727 48.8401 47.993 46.4245 48.2727 44.619C48.9338 40.3724 53.0787 30.5312 55.342 27.7595C54.5028 26.5134 49.01 26.6915 45.1957 32.6165C43.7719 34.8542 40.5168 42.305 36.9059 48.179C36.1176 49.4505 35.1258 48.5605 35.8887 45.5853C36.7533 42.1524 39.2961 32.7181 42.5766 25.2929C51.1715 23.5892 60.3006 22.3939 67.2936 22.3685C68.2346 22.1142 68.8703 21.2751 67.2936 21.2241C61.267 21.0208 52.2143 21.7327 43.7463 22.8009C45.3739 19.5458 47.1283 16.9521 48.9084 15.8587C46.9758 14.638 43.0598 15.1212 40.8219 18.4271C39.8303 19.9019 38.8385 21.6819 37.8977 23.6146C31.6928 24.5808 26.3781 25.6743 23.6828 26.6915C20.8856 27.7595 21.1906 31.1415 22.8944 30.506C26.4291 29.1837 31.2098 27.8103 36.5244 26.5898C33.1424 34.2187 30.4977 43.2204 29.8619 46.8821C28.2854 55.7825 33.8033 55.7315 36.499 52.2224C39.4233 48.3825 45.5264 34.8796 46.4672 33.4556C46.7469 32.9724 47.1283 33.2267 46.925 33.6591C40.11 47.2636 40.6948 52.5274 46.2129 51.3577C48.7051 50.8237 53.0026 46.5517 54.1213 44.3394C54.3502 43.8052 54.8334 43.8562 54.7317 44.0851C50.4088 55.2993 44.916 64.3774 41.2287 67.2255C37.8721 69.7939 35.3801 64.2249 47.2555 56.2401C49.0102 55.0448 48.1963 53.4175 46.2129 53.9769C40.0846 54.9433 22.5385 60.512 14.8334 65.8523C14.2485 66.2591 13.7145 66.5898 13.7399 67.429C13.7653 67.912 14.6045 67.7341 15.0114 67.4798C24.9795 61.504 33.1422 59.1644 42.5002 57.2064C42.6274 57.2571 42.7799 57.2825 42.9071 57.2317C43.3395 57.1302 43.3141 57.3589 43.0342 57.537C42.3985 57.8931 41.7627 58.2235 41.6104 58.2745C35.3037 60.7411 31.4893 66.1827 32.8371 68.9546C33.9817 71.345 40.1608 70.4804 43.0852 68.9038C50.2561 65.0132 55.4692 57.3843 59.0291 46.8569C62.1315 37.5243 66.0477 26.9458 66.9631 26.6405V26.6405ZM108.641 48.179C96.9696 46.6532 71.7946 48.6876 60.6821 51.6374C57.3764 52.5021 58.2918 54.2565 59.9701 53.9261C59.9955 53.9261 60.7074 53.748 60.733 53.748C69.8619 51.9681 92.0108 50.4169 104.929 52.8835C106.48 53.1632 111.133 48.5097 108.641 48.179ZM70.218 46.806C73.4729 45.1784 78.3045 35.1085 81.483 29.5903C81.7119 29.1835 82.1188 29.5142 81.8901 29.7939C73.8543 43.6273 77.2619 45.2294 80.4405 45.0259C84.6871 44.7716 88.6033 38.6685 89.4678 37.2954C89.8239 36.7614 90.0274 37.1939 89.8239 37.5751C89.6205 38.2108 88.883 39.3298 88.1963 40.8556C87.2301 43.0169 88.2471 43.8562 89.0864 44.2376C90.4086 44.8733 94.0198 44.4665 94.5791 42.254C90.9682 42.1778 99.6141 25.1403 100.504 24.0978C98.0883 22.6991 94.3502 24.2247 92.6465 27.5815C89.0102 34.7778 85.9586 40.5757 84.0514 40.6774C80.3389 40.881 88.3235 24.6317 89.6205 24.1231C88.8321 22.9788 83.7717 23.462 80.949 27.8358C79.9319 29.4124 73.7272 40.3978 72.2016 42.2032C69.5061 45.4073 69.3026 42.661 70.0655 39.4569C70.3198 38.3634 70.752 36.9648 71.3115 35.4136C73.0914 31.396 74.9987 30.1245 76.1684 28.8276C84.026 20.1054 88.527 13.036 86.7469 10.2642C85.1703 7.79756 79.9065 8.89112 76.5244 13.9771C70.2944 23.3095 64.5473 36.1001 63.8098 41.9489C63.0979 47.7976 67.3446 48.23 70.218 46.806ZM73.5239 29.6921C73.8035 29.0564 73.9815 28.8784 74.4647 27.8103C77.2619 21.6565 80.7711 15.172 83.1869 12.146C84.6871 10.5694 86.7979 12.7054 82.9834 18.5542C80.7457 22.0124 78.2028 25.1911 75.4311 27.9884V28.0138C74.719 28.8021 74.0834 29.4632 73.8035 29.8446C73.6 30.0989 73.3713 30.0481 73.5239 29.6921V29.6921Z");
    			attr_dev(path59, "fill", "#333333");
    			attr_dev(path59, "stroke", "#aaa");
    			attr_dev(path59, "stroke-width", "1");
    			add_location(path59, file, 209, 3, 51313);
    			attr_dev(svg22, "viewBox", "0 0 120 80");
    			attr_dev(svg22, "aria-hidden", "true");
    			attr_dev(svg22, "focusable", "false");
    			attr_dev(svg22, "role", "presentation");
    			attr_dev(svg22, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg22, file, 208, 2, 51190);
    			attr_dev(symbol22, "id", "LOGO_Stylus");
    			add_location(symbol22, file, 207, 1, 51161);
    			attr_dev(path60, "d", "M92.4 45c-3.1 0-5.8.8-8.1 2-.9-1.7-1.7-3.2-1.8-4.3-.2-1.2-.4-2-.2-3.6.2-1.5 1-3.6 1-3.8 0-.2-.1-1-2-1-1.7 0-3.3.4-3.5.9-.2.4-.5 1.5-.7 2.7-.3 1.6-3.7 7.5-5.5 10.6a11 11 0 01-1.3-3c-.1-1.4-.3-2.1-.1-3.7.2-1.5 1-3.6 1-3.8 0-.2-.2-1-2-1s-3.3.4-3.5.9l-.8 2.7c-.3 1-4.7 11-5.9 13.5a55 55 0 01-1.4 3l-.1.2-.5.9c-.2.5-.5.9-.6.9-.1 0-.3-1.2 0-2.8.7-3.4 2.2-8.8 2.2-9 0 0 .3-1-1-1.5s-1.7.3-1.8.3l-.2.3s1.4-6-2.8-6c-2.6 0-6.1 2.9-8 5.5-1 .6-3.4 2-6 3.3L36 50.8l-.2-.2c-5-5.4-14.3-9.2-14-16.5.2-2.6 1.1-9.6 18-18 13.7-7 24.7-5 26.6-.8 2.8 6-5.8 17.2-20.2 18.8-5.4.6-8.3-1.5-9-2.3-.7-.8-.8-.8-1.1-.7-.5.3-.2 1 0 1.4.4 1.2 2.2 3.1 5.1 4.1 2.7.9 9 1.4 16.8-1.6 8.7-3.4 15.4-12.8 13.4-20.6-2-8-15.1-10.6-27.6-6.2a62.5 62.5 0 00-21.1 12.2c-6.9 6.5-8 12.1-7.5 14.4 1.6 8.4 13 13.8 17.5 17.8l-.6.4c-2.3 1.1-11 5.7-13.2 10.6-2.4 5.5.4 9.4 2.3 10 6 1.6 12-1.4 15.2-6.2a15.4 15.4 0 001.3-14.1v-.1l1.8-1c1.1-.8 2.3-1.4 3.3-2-.6 1.6-1 3.4-1.2 6-.3 3.2 1 7.2 2.7 8.8a3 3 0 002.1.7c2 0 2.9-1.6 3.8-3.5 1.2-2.4 2.3-5.1 2.3-5.1s-1.3 7.4 2.3 7.4c1.3 0 2.6-1.7 3.2-2.6l.1-.2.2-.3 3.5-6.6c2.2-4.5 4.4-10.1 4.4-10.1s.2 1.4.9 3.6c.4 1.4 1.2 2.9 1.9 4.3l-.9 1.2-1.4 1.7c-1.7 2.2-3.9 4.7-4.2 5.4-.3.8-.2 1.4.4 2 .5.3 1.3.4 2.2.3 1.6-.1 2.8-.5 3.3-.8 1-.3 2-.8 2.9-1.5a6.4 6.4 0 002.7-5.6c0-1.4-.5-2.7-1-4l.4-.7c2.8-4.1 5-8.6 5-8.6s.2 1.4.8 3.6c.4 1.2 1 2.4 1.6 3.7a15.7 15.7 0 00-4.8 6.2c-1 3-.2 4.4 1.3 4.7.7.2 1.7-.2 2.4-.5 1-.3 2-.8 3-1.5 1.8-1.4 3.5-3.2 3.4-5.6 0-1.2-.3-2.3-.7-3.4 2.2-.9 5-1.4 8.7-1 7.8 1 9.4 5.9 9 8-.2 2-1.9 3.1-2.4 3.5-.6.3-.7.4-.7.7 0 .4.3.3.8.3.7-.1 4.1-1.7 4.3-5.5.2-4.9-4.4-10.2-12.6-10.1zM32.1 65.7c-2.6 2.8-6.2 3.9-7.7 3-1.7-1-1-5.2 2.1-8.2 2-1.9 4.5-3.6 6.1-4.6l1.6-1 .2-.1.4-.3c1.2 4.4 0 8.2-2.7 11.2zm19-13c-1 2.2-2.9 8-4 7.6-1-.3-1.6-4.6-.2-8.8.7-2.2 2.2-4.7 3-5.7 1.5-1.6 3-2.1 3.4-1.5.5.9-1.7 7-2.3 8.4zm15.5 7.5c-.4.2-.7.4-.9.2l.2-.3 2.7-3 1.5-2v.2c0 2.5-2.4 4.2-3.5 5zm12-2.7c-.2-.3-.2-1 .7-3A11 11 0 0182 51l.3 1.5c0 3.2-2.3 4.4-3.7 4.9z");
    			attr_dev(path60, "fill", "#CF649A");
    			add_location(path60, file, 214, 3, 56077);
    			attr_dev(svg23, "viewBox", "0 0 120 80");
    			attr_dev(svg23, "fill", "none");
    			attr_dev(svg23, "aria-hidden", "true");
    			attr_dev(svg23, "focusable", "false");
    			attr_dev(svg23, "role", "presentation");
    			attr_dev(svg23, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg23, file, 213, 2, 55942);
    			attr_dev(symbol23, "id", "LOGO_SASS_SCSS");
    			add_location(symbol23, file, 212, 1, 55910);
    			attr_dev(path61, "d", "M93 29.6a1 1 0 00-1-.8l-8-.6-5.9-5.8c-.6-.6-1.7-.4-2.2-.3l-3 1c-1.7-5.2-4.9-9.9-10.4-9.9H62c-1.5-2-3.5-3-5.2-3-12.9 0-19 16.1-21 24.3l-9 2.7c-2.7 1-2.8 1-3.2 3.6L16 99.1l57 10.7 30.8-6.7L93 29.6zM69.7 24L65 25.5v-1c0-3.2-.5-5.8-1.2-7.8 2.9.3 4.8 3.6 6 7.3zm-9.5-6.7c.8 2 1.3 4.8 1.3 8.7v.5l-10 3c2-7.3 5.6-10.8 8.7-12.2zm-3.8-3.6a3 3 0 011.6.6C54 16.2 49.6 21 47.7 30.8l-7.9 2.4c2.2-7.4 7.4-19.5 16.7-19.5z");
    			attr_dev(path61, "fill", "#95BF46");
    			add_location(path61, file, 219, 3, 58238);
    			attr_dev(path62, "d", "M92 28.8l-8-.6-5.9-5.8c-.2-.2-.5-.4-.8-.4L73 109.8l30.8-6.7L93 29.6a1 1 0 00-.8-.8");
    			attr_dev(path62, "fill", "#5E8E3E");
    			add_location(path62, file, 220, 3, 58676);
    			attr_dev(path63, "d", "M62.5 45.8l-3.8 11.3s-3.3-1.8-7.4-1.8c-6 0-6.3 3.8-6.3 4.7 0 5.2 13.4 7.1 13.4 19.2 0 9.5-6 15.6-14.1 15.6-9.8 0-14.8-6-14.8-6L32 80s5.1 4.4 9.5 4.4c2.8 0 4-2.2 4-3.8 0-6.7-11-7-11-18 0-9.4 6.6-18.4 20.1-18.4 5.2 0 7.8 1.5 7.8 1.5");
    			attr_dev(path63, "fill", "#fff");
    			add_location(path63, file, 221, 3, 58790);
    			attr_dev(svg24, "viewBox", "0 0 120 120");
    			attr_dev(svg24, "fill", "none");
    			attr_dev(svg24, "aria-hidden", "true");
    			attr_dev(svg24, "focusable", "false");
    			attr_dev(svg24, "role", "presentation");
    			attr_dev(svg24, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg24, file, 218, 2, 58102);
    			attr_dev(symbol24, "id", "LOGO_Shopify");
    			add_location(symbol24, file, 217, 1, 58072);
    			attr_dev(circle, "cx", "37.5");
    			attr_dev(circle, "cy", "37.5");
    			attr_dev(circle, "fill", "#302e31");
    			attr_dev(circle, "r", "35.8");
    			attr_dev(circle, "stroke", "#fff");
    			attr_dev(circle, "stroke-width", "3.47");
    			add_location(circle, file, 226, 3, 59231);
    			attr_dev(path64, "fill", "#c4c2c4");
    			attr_dev(path64, "d", "m19.3 18.7c1.1-5.31 4.7-10.1 9.54-12.5-.842.855-1.86 1.51-2.64 2.44-3.19 3.44-4.63 8.42-3.75 13 1.11 6.99 7.68 12.7 14.8 12.6 5.52.247 10.9-2.93 13.6-7.72 5.78.196 11.4 3.18 14.7 7.97 1.69 2.5 3.01 5.43 3.1 8.48-1.07-4.05-3.76-7.65-7.43-9.68-3.55-2-7.91-2.51-11.8-1.33-4.88 1.4-8.91 5.39-10.3 10.3-1.18 3.91-.675 8.22 1.18 11.8-2.58 4.47-7.24 7.66-12.3 8.62-3.89.816-7.98.186-11.6-1.45 3.24.945 6.76 1.11 9.98-.035 4.32-1.43 7.89-4.9 9.46-9.18 1.74-4.66 1.08-10.2-1.85-14.2-2.19-3.15-5.64-5.37-9.39-6.16-1.19-.212-2.39-.308-3.59-.418-1.91-3.85-2.61-8.32-1.65-12.5z");
    			add_location(path64, file, 227, 3, 59323);
    			attr_dev(svg25, "viewBox", "-.035 -.035 75.07 75.07");
    			attr_dev(svg25, "aria-hidden", "true");
    			attr_dev(svg25, "focusable", "false");
    			attr_dev(svg25, "role", "presentation");
    			attr_dev(svg25, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg25, file, 225, 2, 59095);
    			attr_dev(symbol25, "id", "LOGO_OBS");
    			add_location(symbol25, file, 224, 1, 59069);
    			attr_dev(path65, "d", "M0,0h7.75a45.5,45.5 0 1 1 0,91h-7.75v-20h7.75a25.5,25.5 0 1 0 0,-51h-7.75zm36.2510,0h32a27.75,27.75 0 0 1 21.331,45.5a27.75,27.75 0 0 1 -21.331,45.5h-32a53.6895,53.6895 0 0 0 18.7464,-20h13.2526a7.75,7.75 0 1 0 0,-15.5h-7.75a53.6895,53.6895 0 0 0 0,-20h7.75a7.75,7.75 0 1 0 0,-15.5h-13.2526a53.6895,53.6895 0 0 0 -18.7464,-20z");
    			add_location(path65, file, 233, 4, 60084);
    			attr_dev(clipPath0, "id", "d3js-clip");
    			add_location(clipPath0, file, 232, 3, 60053);
    			attr_dev(stop0, "offset", "0");
    			attr_dev(stop0, "stop-color", "#f9a03c");
    			add_location(stop0, file, 236, 4, 60555);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#f7974e");
    			add_location(stop1, file, 237, 4, 60606);
    			attr_dev(linearGradient0, "id", "d3js-gradient-1");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			attr_dev(linearGradient0, "x1", "7");
    			attr_dev(linearGradient0, "y1", "64");
    			attr_dev(linearGradient0, "x2", "50");
    			attr_dev(linearGradient0, "y2", "107");
    			add_location(linearGradient0, file, 235, 3, 60449);
    			attr_dev(stop2, "offset", "0");
    			attr_dev(stop2, "stop-color", "#f26d58");
    			add_location(stop2, file, 240, 4, 60783);
    			attr_dev(stop3, "offset", "1");
    			attr_dev(stop3, "stop-color", "#f9a03c");
    			add_location(stop3, file, 241, 4, 60834);
    			attr_dev(linearGradient1, "id", "d3js-gradient-2");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			attr_dev(linearGradient1, "x1", "2");
    			attr_dev(linearGradient1, "y1", "-2");
    			attr_dev(linearGradient1, "x2", "87");
    			attr_dev(linearGradient1, "y2", "84");
    			add_location(linearGradient1, file, 239, 3, 60678);
    			attr_dev(stop4, "offset", "0");
    			attr_dev(stop4, "stop-color", "#b84e51");
    			add_location(stop4, file, 244, 4, 61014);
    			attr_dev(stop5, "offset", "1");
    			attr_dev(stop5, "stop-color", "#f68e48");
    			add_location(stop5, file, 245, 4, 61065);
    			attr_dev(linearGradient2, "id", "d3js-gradient-3");
    			attr_dev(linearGradient2, "gradientUnits", "userSpaceOnUse");
    			attr_dev(linearGradient2, "x1", "45");
    			attr_dev(linearGradient2, "y1", "-10");
    			attr_dev(linearGradient2, "x2", "108");
    			attr_dev(linearGradient2, "y2", "53");
    			add_location(linearGradient2, file, 243, 3, 60906);
    			attr_dev(path66, "d", "M-100,-102m-27,0v300h300z");
    			attr_dev(path66, "fill", "url(#d3js-gradient-1)");
    			add_location(path66, file, 248, 4, 61174);
    			attr_dev(path67, "d", "M-100,-102m27,0h300v300z");
    			attr_dev(path67, "fill", "url(#d3js-gradient-3)");
    			add_location(path67, file, 249, 4, 61252);
    			attr_dev(path68, "d", "M-100,-102l300,300");
    			attr_dev(path68, "fill", "none");
    			attr_dev(path68, "stroke", "url(#d3js-gradient-2)");
    			attr_dev(path68, "stroke-width", "40");
    			add_location(path68, file, 250, 4, 61329);
    			attr_dev(g0, "clip-path", "url(#d3js-clip)");
    			add_location(g0, file, 247, 3, 61137);
    			attr_dev(svg26, "viewBox", "0 0 96 91");
    			attr_dev(svg26, "aria-hidden", "true");
    			attr_dev(svg26, "focusable", "false");
    			attr_dev(svg26, "role", "presentation");
    			add_location(svg26, file, 231, 2, 59966);
    			attr_dev(symbol26, "id", "LOGO_d3js");
    			add_location(symbol26, file, 230, 1, 59939);
    			attr_dev(path69, "d", "M0 6C0 2.68629 2.68629 0 6 0H34C37.3137 0 40 2.68629 40 6V24C40 27.3137 37.3137 30 34 30H6C2.68629 30 0 27.3137 0 24V6Z");
    			attr_dev(path69, "fill", "#FFCE00");
    			add_location(path69, file, 257, 4, 61735);
    			attr_dev(mask, "id", "flag_de_clip");
    			set_style(mask, "mask-type", "alpha");
    			attr_dev(mask, "maskUnits", "userSpaceOnUse");
    			attr_dev(mask, "x", "0");
    			attr_dev(mask, "y", "0");
    			attr_dev(mask, "width", "40");
    			attr_dev(mask, "height", "30");
    			add_location(mask, file, 256, 3, 61619);
    			attr_dev(path70, "d", "M0 10H40V20H0V10Z");
    			attr_dev(path70, "fill", "#DD0000");
    			add_location(path70, file, 260, 4, 61933);
    			attr_dev(path71, "d", "M0 0H40V10H0V0Z");
    			attr_dev(path71, "fill", "#000000");
    			add_location(path71, file, 261, 4, 61983);
    			attr_dev(path72, "d", "M0 20H40V30H0V20Z");
    			attr_dev(path72, "fill", "#FFCE00");
    			add_location(path72, file, 262, 4, 62031);
    			attr_dev(g1, "mask", "url(#flag_de_clip)");
    			add_location(g1, file, 259, 3, 61898);
    			attr_dev(svg27, "viewBox", "0 0 40 30");
    			attr_dev(svg27, "aria-hidden", "true");
    			attr_dev(svg27, "focusable", "false");
    			attr_dev(svg27, "role", "presentation");
    			attr_dev(svg27, "fill", "none");
    			attr_dev(svg27, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg27, file, 255, 2, 61485);
    			attr_dev(symbol27, "id", "FLAG_de");
    			add_location(symbol27, file, 254, 1, 61460);
    			attr_dev(rect0, "width", "40");
    			attr_dev(rect0, "height", "30");
    			attr_dev(rect0, "rx", "6");
    			attr_dev(rect0, "fill", "black");
    			add_location(rect0, file, 269, 4, 62351);
    			attr_dev(rect1, "width", "40");
    			attr_dev(rect1, "height", "30");
    			attr_dev(rect1, "fill", "url(#flag_en_db)");
    			add_location(rect1, file, 270, 4, 62407);
    			attr_dev(path73, "d", "M0 0H40L6 30H0V0Z");
    			attr_dev(path73, "fill", "url(#flag_en_us)");
    			add_location(path73, file, 271, 4, 62467);
    			attr_dev(path74, "d", "M41 -1L5 31");
    			attr_dev(path74, "stroke", "var(--bg-clr)");
    			attr_dev(path74, "stroke-width", "3");
    			add_location(path74, file, 272, 4, 62526);
    			attr_dev(g2, "clip-path", "url(#clip0_1015:6)");
    			add_location(g2, file, 268, 3, 62311);
    			xlink_attr(use0, "xlink:href", "#flag_en_gb_flag");
    			attr_dev(use0, "transform", "scale(0.00314465 0.00628931)");
    			add_location(use0, file, 276, 5, 62708);
    			attr_dev(pattern0, "id", "flag_en_db");
    			attr_dev(pattern0, "patternContentUnits", "objectBoundingBox");
    			attr_dev(pattern0, "width", "1");
    			attr_dev(pattern0, "height", "1");
    			add_location(pattern0, file, 275, 4, 62615);
    			xlink_attr(use1, "xlink:href", "#flag_en_us_flag");
    			attr_dev(use1, "transform", "translate(-0.210484) scale(0.00714286 0.00952381)");
    			add_location(use1, file, 279, 5, 62900);
    			attr_dev(pattern1, "id", "flag_en_us");
    			attr_dev(pattern1, "patternContentUnits", "objectBoundingBox");
    			attr_dev(pattern1, "width", "1");
    			attr_dev(pattern1, "height", "1");
    			add_location(pattern1, file, 278, 4, 62807);
    			attr_dev(rect2, "width", "40");
    			attr_dev(rect2, "height", "30");
    			attr_dev(rect2, "rx", "6");
    			attr_dev(rect2, "fill", "#ffffff");
    			add_location(rect2, file, 282, 5, 63055);
    			attr_dev(clipPath1, "id", "clip0_1015:6");
    			add_location(clipPath1, file, 281, 4, 63020);
    			attr_dev(image0, "id", "flag_en_gb_flag");
    			attr_dev(image0, "width", "318");
    			attr_dev(image0, "height", "159");
    			xlink_attr(image0, "xlink:href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT4AAACfCAYAAABgD7XPAAATIUlEQVR4Ae2dTYsdRRfHy4WEWQQUF5kHQtCNCAN+A/0IguAm8CxGRSbzbFz5AdzEbbITIRuDoGuXIYiQiYMbIUoQhZClEtxEnwSDD/VQPXPOvdP3pbveT9X5X7jU3Je53X3qf3516tTpbnP/vQ/tXz//aiU8njx9Zm/cvGXNpSvWmP2hfe6VQ4tnGRuY59+1X3x1e7YUvn/tDXu8s2ePX3i97HNnz7ptz324Y3LHBh2V0ZGzM/vw7sHg08635zz+998n9uH1z5Lr6Tvzqr1jztkf33nfPr5335qTN84Pb0gBoDOQE+tgQACwmMMCfOXA0CuEGXiXrtjPv/xmDuuG7/zz+E/74Oo1e2ResnfNy8nAR8D76fLBmQDP0Gi96Quz9zzTFwHAcs4I8JWzdW/giwXeXfOvDMDbHNAx+FoAoLl4iClwxqk/wAfw+QKZgXfhwCvCc1PanBGem9Jum8GugO8sAI3IKTAb+9KVYtNAX0G0+H2AD+Cbq1v2wV0/4A1T2k+u2zvmfIYIbz6vNoLvLABPkoLbCJppprvxZ13+wHUSFkHSOSvAl86WcwHS2vcYeMJzeBvBcfrBJPjOAnDznHlqQ7k+BwDTOSvAl86WrQFtan+jgPfJdXtkdjNEeOE8mg2+swA8Z8erJLnANvd3HQCXO2eqI/H5qpMDfKs20a4T9qmLh145PFqlLb1oMZcX3uAbA3AqiTh3R1J9bwDghQNMgQMWQQA+gI9Az8B78QMv4A2LFgJyeFM8CQbfWQDOTypO7VCqzzEF9ndigM/fZgSKXloGXmAOL8+iRfoZZjT4zgIwfM6dCnjj30Ed4HxnBvjm26oX0NFxMPBCprRDDq9M4fHYv0NfG1clXaJSOnQHU/0fIsBppwb4pm1EoOilZeAFRni5cni51xAMFRK2EqLGgnA4b3MXOcB1jgvw6QEfA6+xwuNY/6f/N/RHK0lJ2t/YFqvAq04O8K3aZN0A0fJ7DLzAKW2uAKn0IimDj0BCEWCuELb0AdJxbWoxBV44O8C3sEXLcFu37wy8wCltqYsHbPLT1O+vgI82QKeWSCs8pP1L3QKAh8Olm1wqYO4Dl6WSD8oo4AksPJ6rzanvbQQf/SMVIvZGfDq+cat5CoyITz7I1kVz695j4HmeS0szvjwBj5xTXyfBR2CgCLCXOT4d16Z2WARRVggN8LUPvijgNVB4vMlffd83JqQyO+MFA5EDrOd8AF8926+L2nzeY+AF5vByBTS5y1J8gbeo6li6zLub5s190BRYyyKIM5gTYs9XgwH42gNfFPAaLDyey6fx98b+a2hUgQHHplr/uudFEICvHfBF+evVa1Z7wMLgSwLAq9eGG3poOBOkxxwgwCcffAy8kBRVtghP3rn64wiP+EbtCvj4A5oCBxo4T86gPQOTPVtoAT654GPgBRcen1NzaqqZsSi5EXzkqFEGR0jd1KXxAT554GP/C1y00FSG5pg1Nwc/Cb4VAIZ0QMZCSGmrRi3nAAE+OeCLBZ72HB5xa1M7G3z0A7EdomUEGnKAjd0VDuCrDz72LxQer19dPH03NsDwBt8KAD07KG8htLwcoOugVm6LCfDVA18o8OBPYX0WDL5YAGo5NYaGrdgRiuydswX4wpwopk8YeCEppIwnEkhLIaWeQUWDjzo9tgORkyjvdNR31AJ85fogyl+QM49eNEwGPnYeKoPBCEbB3tpWYgQI8OUHHwMvpCwFVRLRwGNO0R+p26gOHk6WRt1R6j6Z+j2ALx/42B9QF7s2EKA3pwqPpzQ89/PkEd94w7EdnmcVWN4iSKkOH/fP8muALz34WP+BM6A7RkcAMOTwZhQeL+s15u/s4KOdixUAcoDpnZL6hlqAL52No/Se7dSy9LdppEgttK2V8ikGPnaumBygIkHUiAABvnjwRQEPObxkOTzizaa2OPhoR2IFkudcYHkj4jAFKFQIDfCFg4/1rPSuZXMjvloRHnGH2mrg4x2gCDBEMIquGOsEw8516UqWkRHg8wcf94moQn45l3gnIA4DuKDbulYH3woAPQWEQmh/ZyWbj1uAb74tGXiBixZ5Fu3kzVhKDNhjHc95LQZ8tLNRgspY2KnhkvgA3zT4oE+K4ba3Uqa0xJVxKw58tINRAlN0Kk/KERXg2ww+1qNn4THNSLRUJUgHHvOF/pDahgou78nbfeZQAL5V8LH+UHi8NcRLOQCXYJHYiG988CzAkEWQjBFgT1NggG8BPtZbYA5PVdWBoEWLMTc2vW4GfHQAsYLUMuUIqQME+A7PrJy7KGbug2YYmhYtnE/OveIx+a+UtjnwkeEYgJ45Fwh0EdWQLanVDD7WU2CEhwF1s65IX5LaZsFHRowVLKYkC8FqBB/rJySHly2FIu9c8lYWLYgLU23z4KMDjBKwokLooZCUisZHhdCawMd6CZwx5Lp4gMSc8Zy7lpEfttJ2Az4yeJSglZ8rqQF8rI/AKa2mHN6yrci/emm7Ax91zHKnhSWpdzPch/S8lXhJb2ezIUlt9q2LCOc+vn/tDXu8s2ePX3i97HNnz7ptz30MUa7Z50R8iB605PB6m9ISD8Ztt+CjA40CYLYcjtBTi8y+vXHz1lyeDPBpAXzumBzYfYBHhcdHJscAKK8OVAvwmAv0R+8tA9DzXGBaBc6zCCIvif3g4W/dgc/nmLT197acb89M6D7iG3ceAxCF0LMBt+mLrUx1N+3/8vsD8K5es3kGOHkR/gC8Qpc7G/ughNfqwEdGZwAGJrm15HyW4TD+uwfwUYSXa0orOqc7WtUn39DQqgUfdW4sALWs8o2h5163DD6K8LQMYC7Cc5pv9UwL8tdUrTHmssWTbPDWYIvrn35tnzx9ts7XV94jB7pjjM3x/OHNt+0fR8cr25XwRovg+/v3R/aXjz7O0leu/yXV4TkNOy2f+PeJtuHrp74uwYGwD21aoEXwtWlp7HVqC5jUP4jf02MBgE9PX/d2pABfbz1a8HgAvoLGxqaSWgDgS2pOXT8G8Onq756OFuDrqTcLHwvAV9jg2FwyCwB8yUyp74cAPn193ssRA3y99GSF4wD4Khgdm0xiAYAviRl1/gjAp7PfezhqgK+HXqx0DABfJcNjs9EWAPiiTaj3BwA+vX3f+pGbR7e/tXjCBr4acKfR1Qaf2wff/cb3oXWnAeOuSoEnbBCigSoXIaWrPe/sQbfw3WANmOKXDSfhoi17uXbYG/aGBlgDAB/EwGLAIFj43iHQXjXtAXwQXzXxAbQAbS0NAHwAH8AHDajTAMAH0asTfa0oA9uVE+ECfAAfwAcNqNMAwAfRqxM9Ii85kVetvgD4AD6ADxpQpwGAD6JXJ/paUQa2KyfSBPgAPoAPGlCnAYAPolcnekReciKvWn0B8AF8AB80oE4DAB9Er070taIMbFdOpAnwAXwAHzSgTgMAH0SvTvSIvOREXrX6AuAD+AA+aECdBgA+iF6d6GtFGdiunEgT4AP4AD5oQJ0GAD6IXp3oEXnJibxq9QXAB/ABfNCAOg0AfBC9OtHXijKwXTmRJsAH8AF80IA6DQB8EL060SPykhN51eoLgA/gA/igAXUaAPggenWirxVlYLtyIk2AD+AD+KABdRoA+CB6daJH5CUn8qrVFwAfwAfwQQPqNADwQfTqRF8rysB25USa5sjsWjxhgxANHO/s1YPmzh50C98N1oB5dPtbiyds4KuBP46O7fevvWGrwG9nb9i22wff/cb3oXWnAWPxgAUCLVAbfIG7jX+DBQA+aCDcAgBfuO3wn3UtgIivrv2b3jrA13T3qd55gE9198cdPMAXZz/8dz0LAHz1bN/8lgG+5rtQ7QEAfGq7Pv7AAb54G+IX6lgA4Ktj9y62CvB10Y0qDwLgU9ntaQ4a4EtjR/xKeQsAfOVt3s0WAb5uulLdgQB86ro83QEDfOlsiV8qawFjzGWLJ9ngrcEW1z/92j55+qxsT2zY2l8//2p/unxg7xiT5fnLRx/bv39/tGHr298G+Fbt8/jeffvDm29n6SungQdXr9l/Hv+5uuE17zgNOy2f+PeJtuHrp77+3CuHVvPTXLpijdm3rv38y2/WyKfOWwvgnbffmVeTXQzgrnl5OLHbx4E2WQDg22QZa4f++/d/7B1zLkP/veQFQLeXX3x1e/Bz0rpmn3fHbrQaQDTwBofJATx/h9ns2rb6RQq27ZuUz6QNYADgSaCnDnwMvAsH8iK8TBHCHXPeO0KYAw5EfHOsdPKdBQDlRIDm4iHPdrQFQGrAx8DbFQi80xxe6imtm2b5TmkfPPxttje3Aj6fY5p98IFfXADQJJ8Ch/S3iwDZNy5dUZP26h58y50qM4cnIwJwtnH5nxs3b8126VbA547JHZu4/hcU4TvbDLmv03x37xFgt+CTD7wcObxd7wjvTM7H7A9J8LnkawV8Q1TjHBqLWJNdqwWA3YGPgXfxUM0If2T8Fy3OAO90imOef7df8D3/7klEg1X8Sfi5LwwzgCVb9RYBdgM+Bt6LH8gD3pDDSz+lTZ3T0QA+cmDWi8QBMlvO13+RawDghQOOlsl+rbfNg48FLLYOL0cS21/Aw3Rvd7uANYGPHJf1I3HAzJYD9F/06m0K3Cz4WLBiR2wZOTwfwWoE3woAJQ6gmQCYKkVCNmypbQ58DDwIdGuuZl0Ob0qYmsFHthGtr2EK3N6ASraV1DYDPhYkCo+3As8nwhsLEeBbnL7JepM4wGbKAYZGgGYihTLWmYTX4sHHAhQ7pW0nhzclOIBvAT6yFetPYg4wEwBDFs2GRZCGVoHFgo8FJ3bETb9Ke2T86/BSCg7gWwXfCgAlDsCCcoAxMw6ydYlWHPjkA6/fHAvAtxl85IysT4kARA5w9il3YsDHgpJ4Lq2SERXgmwbfCgAxI5nMObNvCzoXuDr42CgSFy2U5VAAvvngWwGgxAFbkH7n1JGSTUu01cDHwFM1YoadWlbq8kEAnz/4yElZzxIH8EwzlpDLnUnJARYHHwtELPBk5PBC6vDICUNbgC8cfGRz0frOBMDQMhhnM7pwBNmvVFsMfBDE1lQIf1gDeCQ2gC8efGzLpdIOF+VIeSyuByhjgK8VAWYHHwNPYh1UphEwpA6qJvDYWRVcnYWOtVTL+hc7wxFUh1rwYgjZwMcdLnbZX0aHuxHPFOzwbQ6PiC9dxDe2M/uDxABgWARJX5cqOQBIDj7uYLEjnO4Qf+yQy68BvnzgIzuzf0gMCDLNgCTmAJOBjztUFfDCVmmdE9RK6pIDrmsBvvzgI7vr9JewM5Ny+Es0+LgDJdYxZRrBWl7GJ8db1wJ85cBH9mf/ERswpJ8Ch0aAKcu6gsHHHSYReIIKN4ccXiO38QP4yoNvBYDwp60L4Kn8yRt8DDyMUFs7aKhUbwR47HxY1Z19rifZLHXL/iURgB3NoGaDjztELPCwaBHrhIj46kV8477T6W/lcuaT4OMOwCrUZITnxCtx0WLsVJteA3xywEd9xP6HgGOr//kWQm8EHxscdUdbDS6h8JicJLYF+OSBj/qU/VFiAJItp+5/U625dbEr4GMDix1hZBQeDzk8IYXH5ByxLcAnF3zUt+yfEgOSbDlA/7vCTQUkDD42qFjgIYdH4s/VAnzywUd9L9pfMwEwtAzG2WycgjIw4NaZLH84NYKQIFtuAb52wEc6E+2/wxRYRsAy9l9jVIXMYTmDdSMGCa+nFuBrD3ykP/kAFFQI7e4KxyFN5T8Wl8vJkcMLyxFIuXgAiTt3C/C1Cz7SBgNQYh1gtkUQf/+uDr4F8HKMCGHnBrJ4BN0jgISdswX42gcf6YM1LBGAAnKA1cC3AJ6MHIBvHRAJrKcW4OsHfKRLBiAWLc/MaYuDbwCeAOKTFQC8hbMDfAtbEDh6aeUDsOyMrxj4FhGejBzeUOi4dHnwXgQecxwAX7/gI10wAJUXQmcHX07ghdb1GLeqY/atEwEJAu2hBfj6Bx/pnAGo9K5w2cC3AB5yeCQ26S3Apwd8pEUGoMQcYKaU2F3zcvpyFmk5vHHhInU42lUnB/hWbaJFJwxAsVPgtAFUsogvJ/BCblqCRQt/Jwb4/G3WGxgZgBIjwIR1gNHgW0xpcyxahJ1poa3wOJXzAXwAH2mJASjxzK4BgHGrwMHgWwAvbQjq5t9HBoXHJMCSLcAH8I31xgCUOAWOyAF6g08i8FxnYZU23mkBvngbjsHRy2sGoNgpsF8ANht8eXN4YVNaAC+towJ8ae3ZC/SWj0M+AOdNgSfBt4jwcuTw/E8udqu0y8Zf7hT8Hee4AF+c/TTpj31Q4rnAMxZBNoJvAbx5BD1+4XU753mSwwu7qUjK+2pqEuncYwX4AL65WqHvMQAbK4ReAd8CeH5z5inohS5aoA6vnDMCfOVsTeDopWUASswBDosgZ3nG4MuZwws9tcyJAosW5ZwR4Ctn616ANz4O0QAcpsAnADSP7923P77zvnVFwt+ZV2dNV6eiO/58Z88+vP6Z/efxn3QxlK3tk6fP7I2bt5DDe6WOAwJ8dew+hkcPrxmAuweDTzvflvBwAd799z60/wfhFmuzJlIYTgAAAABJRU5ErkJggg==");
    			add_location(image0, file, 284, 4, 63130);
    			attr_dev(image1, "id", "flag_en_us_flag");
    			attr_dev(image1, "width", "200");
    			attr_dev(image1, "height", "105");
    			xlink_attr(image1, "xlink:href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABpCAYAAAB/GGzVAAAPkUlEQVR4Ae2dB5gVRRLH9+7Eu/Nyzvk8EwqmM+ecMZ/xTCALKhiAI4iCCgooGQQByZwEDyQjUZAluwiIiCCIBGWRJS67IH3fr6GGfm965j3B/W5vXs33zXZPT01Xv9r6T/d0VVfn5R1d0+h5cDI47KgHzZQjquqZYBnkKTgODhzITQGS/JeDAuQQelAFiAJEh18xAFKAKEBSAPLtqg+bbxxXK6XMN0T73sl1vxKab1V52FSqXPsrqSubNh1+/EPmmyc8lJGf/GYFiAIkRVluqtPdXPDPl1LKRFkkRalb95wQSwNth36TzWEZwHZtrS7msgc6xNYFgF589c1YGvi16zPJAABppy+9okZHc3XNzrE07nMKEAWI+dox+ebPlzSx57AJC0yvYTNt/k8XN0lRpF+cVd+W39e4r9lQtMX85dIn7fURVR8J6L57Uh1bduRlTU3x1p3m1kd72Oufn1UvoIEfdcPz32Pmmn4jZtt8FL+76r9qijZvN3/dz+87J9YJ6iJPPdzbVLzd3Fm/l72mraLoLr/+b8w2g0bPDfhxT+h8qQJEAWIVpFrtrlYJzf7j06Kt5soanVKU5/cXNDLT5y0XErN3717Tvu/klCESPcbTnUaZL77YG9BNmb3M/Pb8hil1XXp/e7N+45aA5rNN28xVD6by+935Dc1bHn5uL+HjN2vhSgsAV+Evua+9WfdZccBv4+fbzDX5XVLa5NJLXgGiAAmU5PYnegYKxFBElMRN6S12le62dL3/U+ClgX7o+AWWZsu2khQAuXXdXLd7wI+hlntP8gzndpSUWroBI+d4aaClV+DYvnNX5DcGLwE5bnykW2RdwpsUMJZtKtYzwTLIepq322vTzaMth5imHUZGfmMAnOETCw3KNnvhR3Z45ioUeb4Z5i9Zbd/QY99abM65o41XGTsPnGrqtR5mGr403H4/pNfD9cX3tjMjp7xrrqvd1cxdtMo7gcCkwrzFqw0gGzV1kbnwnrZefvR28Krf+nXTacBUL016GwCIHsmWQNYAcb8B3LyrNG75T894wvhmjn7098fMD0991CogY/w/XtTYq4xuXW7e5cez8p3w49MeNz/YX69LAy94Unao/Nx6yStAkg0Ofl3WAElXDr1WgCQfHgoQb++VLfi1B0k+RLQHibGUZwKKAkQBckhv2EwK9v9+XwGS4wDBkJdJiZn+zURz8o0tzNFXPp2R7rbHM9eVDb8TrnvGHHd1s6+E3x31ekXWowDJYYCcenNLO3WaSfmXr/7MWqrj6Fp0G2satR0eqWg8W7Xas6Zw6ZpYGuiWrlhvjrkqHmzNOo8yT3UcGVvXsVc1M++v3BBLA79FH6w1x1/7jJeu0tE1zewq1fRMsAxC3yDn3fWieXvBCrNq7SZrDceG0Gd4QTA1i9LgGvLamHnmnaVr7CtkxccbzbS5HxhAxX3Orx+bbxq0ed3aIDAIfr5lh83XaTE4mJqF7uw72pgZ8z80H31SZOvCRoLLB9O2UhdTxgNHzTEL3vvY0qxcs9Fa7U+/9YWAhincJ1oNszxwY9m8dafNP/7C0BR+Z/yjlX2WOjiok7rhIfzgTRtoCwdto41n3d46oIFWLek5akk/8frnTGnZPov4uOlLDF68ojySfv+UumbmOyusAgGAqCFUk/YjLA1/6rYYHKqH+nhDl+wqs3STCt43rv+W8MOPCxByYBGnB5B7bgoo5cDo596TPMMv6uCYOucDQ91yT1L8uCbPWmZpdpaUeXsRBUiOAoQxPM59uITQm4jSpKfvfbjeOhQCEHyx0u9zzVAHqzrDJ97mPhqGTLzxh4ybb+a8u8pLw3PUQc9FD4EzpK8uhnL0erz9sYz7aHBepI7BY+fbXtBHQxn1QEPbjrriqVBdCpAcBQjOgjgDoiS4uNNbpCvRL8+uHzgQonDn3vliiIZn8LbFvQS/qagP3ovuaWf+cOE+gN3wcLfA8u3yZAgkPll46Ea53eOxy8cz6zrIu3VInmfFOo+byk9OPzCcExqs79c/9LJ9Hos9bZR7kipAchQgogCaxq9XV4AoQEJvTQXNAdAoQBQgCpAYS7sCRAGiAIkByOGVa5vigkI9EyyDkB3EHUL97fKmGQGSDQ1LXH2u6C4v8tnUlQ0NH/SuHSWdj1xnU1ccjVrSZUI9uWkkQJilYkpVlCkqZdGTb5bLpc9vNjByRknoUGrWvMt1VMoCKVnfEUVzf+N+5t5GfWLrYp3IiEmFsTTUzwKwn515wIjo8lSAJBcY8stCAMFvqkbT/qb74OnWmEYehXONaSho9Sf7m1rNBpndu/fYFX/QVb6meaBwWLaZsqWc1X5YosnLVK0oGi4mlHcdNM0aCx98aoDl54KO3ueBJv0MQMOA2bH/FPsM9hqph5RpWeqaVbjSFBSusHlWN7o0PANNpwFTbF01nx5o63Z7OHjDj3sYMLsMnGqfoa1uXQoQUaPkpiGAEOjg2a5jzJ49X1hXk1Vri7zLYgnHs35jsaUp273HGuVwL3EV6Dfn/ctgGSeAA+foqYusm4pLsy+wwkgLNGjWrP/cnH93OLQQy2vXfro54Pdk+zdCS2x/dU4DM+Ht9wJ+42csMfSELj+W4PIsbYYfdfpsHNhKaAs0vAQweKbHBFOAJBcY8stCAEGZGO6gQNt2lFg/JVfB3DxuKNBw+txDoGWos6u0zNZHIAb3eckz3IGGeoaOn++lgfaNyQstzc6SUu9yXmgwDlIXPU2UYZKlwNQBv7hhFkM+aKhPlglLm0kVIKJGyU29AEHJcCpEKXoMmeH1xeKeOBVCGxVw7aXeE81JN7Swjoz0TK6CSR63euHXc+jbxo1tJTQotfDzDdWErm3viQaHxFNuammef2Wclx9DP/gxrIKfO5yTegB8vxGz7Mf+3Q162+Gi3JNUAZJcYMgv8wKEf7woAd8S7rWUp5elX/vosqHhOR9deln69f+CH23QI9kS8AJElE3TA1ZznywqHZNvFt1SV88Ey0ABEmMI9IHCLVNLulrSg6GWqxia39ezKEByHCC4qGcCQzY0jNXTp0h99WZTVzY0TB1z+ni4ZdnUFUejAMlhgLCegkDTrkL58i/0GG+X1/ruSRmBp6PWiwgNa0aadxmdkV/L7uMyKj/BqH22DeFFCmCjZtVcOmiiwKYAyUGAMJ2KpRybxep1m2yea3fWCPBQhgsGa81RSK5dazuzX5Rxsqa9y8BpwTX3RAmFHxZvIqzjQ8UzPn4sbCLSO5Hl4/j1GDrDvDJkhpcfbeRZQEuUeurk2t04B96U0RaizGP9T+dH+xUgOQgQ1mu/u+yTlLm7viNmpRgCUWqCWbsH0T9cVxMUCPvBth371n5Du3V7Scgni+W2LKV1D/i5thDWxBNc2j0WL18XWifu44fNRMBIytp5CTYh9cHPBbePH8uLq6S5mihAchAgKBEGNAnaELeNAZZtDtZ3R43V3W0T0v2wRHFRTgnaQIQRKU9PZdsEQOcLJAG9u20Cy4XT6+AaI6AEbWAdvI+GMtk2gaANLmCFXgGSowBhyES0DxwSCVwgCuGmjMt5i9/TsI8NyuCG/HHp2MaA7wa2QGvVw781G75XbL6DUyRvd3cIJnXh50XPhutKQeFKc+ZtrbztEj5ter1p2vaZ5KUhfA/BKNgNa+H7n3i/oWgDPRttwtHS9w1V6bhaZn3f4XomWAZeOwghdWTWiWAKDKlEUSXFX0scAfnA9kX9gNYddrl5qYeUYZbwI1iEz++J74Ffn9vAtgNwRoUZcnm4eZcfz8qHNw6VvrUjtEF2voLWF6yObxU9ki0BL0BcZdJ8tDVdAZJscPDrFCCHYElXgChAQkMr7VEO9CgKEAWIAiSmh1GAKEBSAMJy1agQo27PErU25MvS8GEcFWL0y9aVTZuIEBn18e/yk7wCRAGSApBnuoyxO92KgvhSZo6YhvXdc8uYIiaEqFuWnmdH3agA1EJL1BHi8Mp1VMr0cdRMmzxDLN/G7UZkrEvoFSAKEDv9SkDoN2cuNUWbt1vXC/KsyHPtFdgyWIKL4rOOGxpW67lTqGybgNWadeoc2CDGTFtsVwCK0sm2CTyPW8mGoi22rseeT93GgO2jiaiCBR9+EwuWmldfn5myjQGuMBg6uccBLc+w5YLLj20T4IfrCTzJA8z0NfbyjKSVjs03Kxq30zPBMshqFgtFad1zglUy/rClgQsOURiMabtK922b8Na85dZ/Se5JitISwZ0Di/hptxzY40No4IdxUQ6cJn38MPhh5ebA8OcLQk0ZPRrHjpJSr4GRunGUlOO5l8d6+Un7JFVLeo5a0kUB3BRQLPlwnWHjmdrNBwVvYJfmyMuaWiVkXw328nDvuXmGRLzVUW4Mde49ybPPBztAsYNV1L4iRGinDnqkuGHdrIUrLQ20EkVe+EhKDwWvZR9tMPVaD/O2SWglVYAoQAJFIQYWPkz4aaU7AIrC4GUrG9vgpuLGmhIahlk4FXKN8x9uLXLPTYmBhf8TVnxiZbn3JH959Y6BpR63EXc4JzT0IBJEjo16CFck99wUHvDCL4x4WO69qLwCRAGSlaJEKVDSyxUgChAFSIwdRAGiAFGAKEDMlCOSD4So35jVLFbSh0oH+/u0B0k+cPKqX9vI6HlwMsi/rrHaQBJsA8HGlSdz/5qqBFQCYQkoQMIy0RKVQCABBUggCs2oBMISUICEZaIlKoFAAgqQQBSaUQmEJaAACctES1QCgQQUIIEoNKMSCEsgT+M6aVwr1YFoHciLMrFrefKtxPo/zvw/VoDksJ+RAkQBktOOdgqAzADIJCPtQbQH0ZdIjA4oQGKEk+ntovcP/Q1d0WWoAFGAaA8SowMKkBjhVPS3m7av/HuwPN3nW/c5Vx2I1gG1pIeNp1qiEggkoAAJRKEZlUBYAgqQsEy0RCUQSEABEohCMyqBsAQUIGGZaIlKIJCAAiQQhWZUAmEJKEDCMtESlUAggbzigkKjp8pAdcCvA2pJV0u6uprE6IACJEY46spR/q4cFV3GChAFiPYgMTqgAIkRTkV/u2n7yr+HU4AoQLQHidEBBUiMcPQNXf5v6IouYwWIAkR7kBgdyJtdpZrRU2WgOuDXAbWkBzZTzagEwhJQgIRloiUqgUACCpBAFJpRCYQloAAJy0RLVAKBBBQggSg0oxIIS0ABEpaJlqgEAgkoQAJRaEYlEJZAXtmmYqOnykB1wK8DakmPsaJWdDcIbV/5u8IoQBQg6moSowMKkBjh6Bu6/N/QFV3GChAFiPYgMTqgAIkRTkV/u2n7yr+HU4AoQLQHidEBBUiMcPQNXf5v6IouYwWIAkR7kBgd+C/TG4Zgf6sXPAAAAABJRU5ErkJggg==");
    			add_location(image1, file, 285, 4, 69834);
    			add_location(defs, file, 274, 3, 62603);
    			attr_dev(svg28, "viewBox", "0 0 40 30");
    			attr_dev(svg28, "aria-hidden", "true");
    			attr_dev(svg28, "focusable", "false");
    			attr_dev(svg28, "role", "presentation");
    			attr_dev(svg28, "fill", "none");
    			attr_dev(svg28, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg28, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg28, file, 267, 2, 62134);
    			attr_dev(symbol28, "id", "FLAG_en");
    			add_location(symbol28, file, 266, 1, 62109);
    			attr_dev(svg29, "id", "AppIcons");
    			add_location(svg29, file, 59, 0, 1930);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg29, anchor);
    			append_dev(svg29, symbol0);
    			append_dev(symbol0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, path2);
    			append_dev(svg0, path3);
    			append_dev(svg0, path4);
    			append_dev(svg0, path5);
    			append_dev(svg0, path6);
    			append_dev(svg0, path7);
    			append_dev(svg29, symbol1);
    			append_dev(symbol1, svg1);
    			append_dev(svg1, path8);
    			append_dev(svg29, symbol2);
    			append_dev(symbol2, svg2);
    			append_dev(svg2, path9);
    			append_dev(svg29, symbol3);
    			append_dev(symbol3, svg3);
    			append_dev(svg3, path10);
    			append_dev(svg29, symbol4);
    			append_dev(symbol4, svg4);
    			append_dev(svg4, path11);
    			append_dev(svg29, symbol5);
    			append_dev(symbol5, svg5);
    			append_dev(svg5, path12);
    			append_dev(svg29, symbol6);
    			append_dev(symbol6, svg6);
    			append_dev(svg6, path13);
    			append_dev(svg29, symbol7);
    			append_dev(symbol7, svg7);
    			append_dev(svg7, path14);
    			append_dev(svg7, path15);
    			append_dev(svg7, path16);
    			append_dev(svg29, symbol8);
    			append_dev(symbol8, svg8);
    			append_dev(svg8, path17);
    			append_dev(svg8, path18);
    			append_dev(svg8, path19);
    			append_dev(svg8, path20);
    			append_dev(svg8, path21);
    			append_dev(svg29, symbol9);
    			append_dev(symbol9, svg9);
    			append_dev(svg9, path22);
    			append_dev(svg9, path23);
    			append_dev(svg29, symbol10);
    			append_dev(symbol10, svg10);
    			append_dev(svg10, path24);
    			append_dev(svg10, path25);
    			append_dev(svg29, symbol11);
    			append_dev(symbol11, svg11);
    			append_dev(svg11, path26);
    			append_dev(svg11, path27);
    			append_dev(svg29, symbol12);
    			append_dev(symbol12, svg12);
    			append_dev(svg12, path28);
    			append_dev(svg12, path29);
    			append_dev(svg29, symbol13);
    			append_dev(symbol13, svg13);
    			append_dev(svg13, path30);
    			append_dev(svg13, path31);
    			append_dev(svg29, symbol14);
    			append_dev(symbol14, svg14);
    			append_dev(svg14, path32);
    			append_dev(svg14, path33);
    			append_dev(svg14, path34);
    			append_dev(svg14, path35);
    			append_dev(svg14, path36);
    			append_dev(svg29, symbol15);
    			append_dev(symbol15, svg15);
    			append_dev(svg15, path37);
    			append_dev(svg15, path38);
    			append_dev(svg15, path39);
    			append_dev(svg15, path40);
    			append_dev(svg15, path41);
    			append_dev(svg15, path42);
    			append_dev(svg15, path43);
    			append_dev(svg29, symbol16);
    			append_dev(symbol16, svg16);
    			append_dev(svg16, path44);
    			append_dev(svg16, path45);
    			append_dev(svg29, symbol17);
    			append_dev(symbol17, svg17);
    			append_dev(svg17, path46);
    			append_dev(svg17, path47);
    			append_dev(svg29, symbol18);
    			append_dev(symbol18, svg18);
    			append_dev(svg18, path48);
    			append_dev(svg18, path49);
    			append_dev(svg29, symbol19);
    			append_dev(symbol19, svg19);
    			append_dev(svg19, path50);
    			append_dev(svg19, path51);
    			append_dev(svg19, path52);
    			append_dev(svg19, path53);
    			append_dev(svg29, symbol20);
    			append_dev(symbol20, svg20);
    			append_dev(svg20, path54);
    			append_dev(svg20, path55);
    			append_dev(svg20, path56);
    			append_dev(svg20, path57);
    			append_dev(svg29, symbol21);
    			append_dev(symbol21, svg21);
    			append_dev(svg21, path58);
    			append_dev(svg29, symbol22);
    			append_dev(symbol22, svg22);
    			append_dev(svg22, path59);
    			append_dev(svg29, symbol23);
    			append_dev(symbol23, svg23);
    			append_dev(svg23, path60);
    			append_dev(svg29, symbol24);
    			append_dev(symbol24, svg24);
    			append_dev(svg24, path61);
    			append_dev(svg24, path62);
    			append_dev(svg24, path63);
    			append_dev(svg29, symbol25);
    			append_dev(symbol25, svg25);
    			append_dev(svg25, circle);
    			append_dev(svg25, path64);
    			append_dev(svg29, symbol26);
    			append_dev(symbol26, svg26);
    			append_dev(svg26, clipPath0);
    			append_dev(clipPath0, path65);
    			append_dev(svg26, linearGradient0);
    			append_dev(linearGradient0, stop0);
    			append_dev(linearGradient0, stop1);
    			append_dev(svg26, linearGradient1);
    			append_dev(linearGradient1, stop2);
    			append_dev(linearGradient1, stop3);
    			append_dev(svg26, linearGradient2);
    			append_dev(linearGradient2, stop4);
    			append_dev(linearGradient2, stop5);
    			append_dev(svg26, g0);
    			append_dev(g0, path66);
    			append_dev(g0, path67);
    			append_dev(g0, path68);
    			append_dev(svg29, symbol27);
    			append_dev(symbol27, svg27);
    			append_dev(svg27, mask);
    			append_dev(mask, path69);
    			append_dev(svg27, g1);
    			append_dev(g1, path70);
    			append_dev(g1, path71);
    			append_dev(g1, path72);
    			append_dev(svg29, symbol28);
    			append_dev(symbol28, svg28);
    			append_dev(svg28, g2);
    			append_dev(g2, rect0);
    			append_dev(g2, rect1);
    			append_dev(g2, path73);
    			append_dev(g2, path74);
    			append_dev(svg28, defs);
    			append_dev(defs, pattern0);
    			append_dev(pattern0, use0);
    			append_dev(defs, pattern1);
    			append_dev(pattern1, use1);
    			append_dev(defs, clipPath1);
    			append_dev(clipPath1, rect2);
    			append_dev(defs, image0);
    			append_dev(defs, image1);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if (detaching) detach_dev(svg29);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let selectedSocial;
    	let $GlobalStore;
    	let $isLoading;
    	let $isInvalidLocale;
    	let $_;
    	let $i18n;
    	validate_store(GlobalStore, 'GlobalStore');
    	component_subscribe($$self, GlobalStore, $$value => $$invalidate(1, $GlobalStore = $$value));
    	validate_store(k, 'isLoading');
    	component_subscribe($$self, k, $$value => $$invalidate(5, $isLoading = $$value));
    	validate_store(isInvalidLocale, 'isInvalidLocale');
    	component_subscribe($$self, isInvalidLocale, $$value => $$invalidate(6, $isInvalidLocale = $$value));
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(7, $_ = $$value));
    	validate_store(i18n, 'i18n');
    	component_subscribe($$self, i18n, $$value => $$invalidate(8, $i18n = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const pageScroll = { y: 0, x: 0 };

    	function scrollingApp(e) {
    		pageScroll.y = e.target.scrollTop;
    		pageScroll.x = e.target.scrollLeft;
    	}

    	let MainEl = null;

    	async function goToSection(sectionID) {
    		if (MainEl === null) return;

    		await easeScrolling(MainEl, {
    			top: document.getElementById(sectionID.detail).offsetTop,
    			duration: 1000,
    			easing: cubicInOut
    		});
    	} // Remvoed due to scroll bug in iOS iPhone Safari
    	// window.location.hash = sectionID.detail

    	let selectingLang = false;

    	function closeLangSelect() {
    		$$invalidate(3, selectingLang = false);
    	}

    	function openLangSelect() {
    		$$invalidate(3, selectingLang = true);
    	}

    	function toggleLangSelect() {
    		vibrate();
    		if (selectingLang) closeLangSelect(); else openLangSelect();
    	}

    	function selectLang(locale) {
    		vibrate();
    		i18n.switch(locale);
    		closeLangSelect();
    	}

    	let socialModalContainer;

    	function closeSocialModal() {
    		GlobalStore.closeSocialModal();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = locale => selectLang(locale);
    	const click_handler_1 = locale => selectLang(locale);

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			socialModalContainer = $$value;
    			$$invalidate(0, socialModalContainer);
    		});
    	}

    	function main_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			MainEl = $$value;
    			$$invalidate(2, MainEl);
    		});
    	}

    	$$self.$capture_state = () => ({
    		LandingSection,
    		AboutMeSection,
    		ProjectsSection,
    		SkillsSection,
    		FooterSection,
    		GlobalStore,
    		EaseScrolling: easeScrolling,
    		cubicInOut,
    		MetaTags,
    		isLoading: k,
    		_: X,
    		i18n,
    		LocaleList,
    		LocaleFullName,
    		isInvalidLocale,
    		modalBgAnim,
    		socialModalAnim,
    		vibrate,
    		pageScroll,
    		scrollingApp,
    		MainEl,
    		goToSection,
    		selectingLang,
    		closeLangSelect,
    		openLangSelect,
    		toggleLangSelect,
    		selectLang,
    		socialModalContainer,
    		closeSocialModal,
    		selectedSocial,
    		$GlobalStore,
    		$isLoading,
    		$isInvalidLocale,
    		$_,
    		$i18n
    	});

    	$$self.$inject_state = $$props => {
    		if ('MainEl' in $$props) $$invalidate(2, MainEl = $$props.MainEl);
    		if ('selectingLang' in $$props) $$invalidate(3, selectingLang = $$props.selectingLang);
    		if ('socialModalContainer' in $$props) $$invalidate(0, socialModalContainer = $$props.socialModalContainer);
    		if ('selectedSocial' in $$props) $$invalidate(4, selectedSocial = $$props.selectedSocial);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*socialModalContainer*/ 1) {
    			GlobalStore.setSocialModalEl(socialModalContainer);
    		}

    		if ($$self.$$.dirty & /*$GlobalStore*/ 2) {
    			$$invalidate(4, selectedSocial = $GlobalStore.openedSocialModal !== null && $GlobalStore.socialMedia[$GlobalStore.openedSocialModal]);
    		}
    	};

    	return [
    		socialModalContainer,
    		$GlobalStore,
    		MainEl,
    		selectingLang,
    		selectedSocial,
    		$isLoading,
    		$isInvalidLocale,
    		$_,
    		$i18n,
    		scrollingApp,
    		goToSection,
    		toggleLangSelect,
    		selectLang,
    		closeSocialModal,
    		click_handler,
    		click_handler_1,
    		div2_binding,
    		main_binding
    	];
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

})();
//# sourceMappingURL=bundle.js.map
