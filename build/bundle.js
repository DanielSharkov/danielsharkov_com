
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
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
    function once(fn) {
        let ran = false;
        return function (...args) {
            if (ran)
                return;
            ran = true;
            fn.call(this, ...args);
        };
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
        return style_element.sheet;
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
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
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
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
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
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
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
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
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

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
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

    /******************************************************************************
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

    const r={},i=(e,n,t)=>t?(n in r||(r[n]={}),e in r[n]||(r[n][e]=t),t):t,l=(e,n)=>{if(null==n)return;if(n in r&&e in r[n])return r[n][e];const t=E(n);for(let o=0;o<t.length;o++){const r=c(t[o],e);if(r)return i(e,n,r)}};let a;const s=writable({});function u(e){return e in a}function c(e,n){if(!u(e))return null;const t=function(e){return a[e]||null}(e);return function(e,n){if(null==n)return;if(n in e)return e[n];const t=n.split(".");let o=e;for(let e=0;e<t.length;e++)if("object"==typeof o){if(e>0){const n=t.slice(e,t.length).join(".");if(n in o){o=o[n];break}}o=o[t[e]];}else o=void 0;return o}(t,n)}function m(e,...n){delete r[e],s.update((o=>(o[e]=cjs.all([o[e]||{},...n]),o)));}derived([s],(([e])=>Object.keys(e)));s.subscribe((e=>a=e));const d={};function g(e){return d[e]}function h(e){return null!=e&&E(e).some((e=>{var n;return null===(n=g(e))||void 0===n?void 0:n.size}))}function w(e,n){const t=Promise.all(n.map((n=>(function(e,n){d[e].delete(n),0===d[e].size&&delete d[e];}(e,n),n().then((e=>e.default||e))))));return t.then((n=>m(e,...n)))}const p={};function b(e){if(!h(e))return e in p?p[e]:Promise.resolve();const n=function(e){return E(e).map((e=>{const n=g(e);return [e,n?[...n]:[]]})).filter((([,e])=>e.length>0))}(e);return p[e]=Promise.all(n.map((([e,n])=>w(e,n)))).then((()=>{if(h(e))return b(e);delete p[e];})),p[e]}function y(e,n){g(e)||function(e){d[e]=new Set;}(e);const t=g(e);g(e).has(n)||(u(e)||s.update((n=>(n[e]={},n))),t.add(n));}
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
    ***************************************************************************** */function v(e,n){var t={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&n.indexOf(o)<0&&(t[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)n.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(t[o[r]]=e[o[r]]);}return t}function O({locale:e,id:n}){console.warn(`[svelte-i18n] The message "${n}" was not found in "${E(e).join('", "')}".${h(P())?"\n\nNote: there are at least one loader still registered to this locale that wasn't executed.":""}`);}const j={fallbackLocale:null,loadingDelay:200,formats:{number:{scientific:{notation:"scientific"},engineering:{notation:"engineering"},compactLong:{notation:"compact",compactDisplay:"long"},compactShort:{notation:"compact",compactDisplay:"short"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}},warnOnMissingMessages:!0,handleMissingMessage:void 0,ignoreTag:!0};function M(){return j}function $(e){const{formats:n}=e,t=v(e,["formats"]),o=e.initialLocale||e.fallbackLocale;return t.warnOnMissingMessages&&(delete t.warnOnMissingMessages,null==t.handleMissingMessage?t.handleMissingMessage=O:console.warn('[svelte-i18n] The "warnOnMissingMessages" option is deprecated. Please use the "handleMissingMessage" option instead.')),Object.assign(j,t,{initialLocale:o}),n&&("number"in n&&Object.assign(j.formats.number,n.number),"date"in n&&Object.assign(j.formats.date,n.date),"time"in n&&Object.assign(j.formats.time,n.time)),D.set(o)}const k=writable(!1);let T;const L=writable(null);function x(e){return e.split("-").map(((e,n,t)=>t.slice(0,n+1).join("-"))).reverse()}function E(e,n=M().fallbackLocale){const t=x(e);return n?[...new Set([...t,...x(n)])]:t}function P(){return null!=T?T:void 0}L.subscribe((e=>{T=null!=e?e:void 0,"undefined"!=typeof window&&null!=e&&document.documentElement.setAttribute("lang",e);}));const D=Object.assign(Object.assign({},L),{set:e=>{if(e&&function(e){if(null==e)return;const n=E(e);for(let e=0;e<n.length;e++){const t=n[e];if(u(t))return t}}(e)&&h(e)){const{loadingDelay:n}=M();let t;return "undefined"!=typeof window&&null!=P()&&n?t=window.setTimeout((()=>k.set(!0)),n):k.set(!0),b(e).then((()=>{L.set(e);})).finally((()=>{clearTimeout(t),k.set(!1);}))}return L.set(e)}}),F=()=>"undefined"==typeof window?null:window.navigator.language||window.navigator.languages[0],C=e=>{const n=Object.create(null);return t=>{const o=JSON.stringify(t);return o in n?n[o]:n[o]=e(t)}},G=(e,n)=>{const{formats:t}=M();if(e in t&&n in t[e])return t[e][n];throw new Error(`[svelte-i18n] Unknown "${n}" ${e} format.`)},J=C((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format numbers');return t&&(o=G("number",t)),new Intl.NumberFormat(n,o)})),U=C((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format dates');return t?o=G("date",t):0===Object.keys(o).length&&(o=G("date","short")),new Intl.DateTimeFormat(n,o)})),V=C((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format time values');return t?o=G("time",t):0===Object.keys(o).length&&(o=G("time","short")),new Intl.DateTimeFormat(n,o)})),_=(e={})=>{var{locale:n=P()}=e,t=v(e,["locale"]);return J(Object.assign({locale:n},t))},q=(e={})=>{var{locale:n=P()}=e,t=v(e,["locale"]);return U(Object.assign({locale:n},t))},B=(e={})=>{var{locale:n=P()}=e,t=v(e,["locale"]);return V(Object.assign({locale:n},t))},H=C(((e,n=P())=>new IntlMessageFormat(e,n,M().formats,{ignoreTag:M().ignoreTag}))),K=(e,n={})=>{var t,o,r,i;let a=n;"object"==typeof e&&(a=e,e=a.id);const{values:s,locale:u=P(),default:c}=a;if(null==u)throw new Error("[svelte-i18n] Cannot format a message without first setting the initial locale.");let m=l(e,u);if(m){if("string"!=typeof m)return console.warn(`[svelte-i18n] Message with id "${e}" must be of type "string", found: "${typeof m}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`),m}else m=null!==(i=null!==(r=null===(o=(t=M()).handleMissingMessage)||void 0===o?void 0:o.call(t,{locale:u,id:e,defaultValue:c}))&&void 0!==r?r:c)&&void 0!==i?i:e;if(!s)return m;let f=m;try{f=H(m,u).format(s);}catch(n){console.warn(`[svelte-i18n] Message "${e}" has syntax error:`,n.message);}return f},Q=(e,n)=>B(n).format(e),R=(e,n)=>q(n).format(e),W=(e,n)=>_(n).format(e),X=(e,n=P())=>l(e,n),Y=derived([D,s],(()=>K));derived([D],(()=>Q));const ne=derived([D],(()=>R));derived([D],(()=>W));derived([D,s],(()=>X));

    function fallbackCopyToClipboard(data) {
        const tempEl = document.createElement('textarea');
        tempEl.value = data;
        // Avoid scrolling to bottom
        tempEl.style.position = 'fixed';
        tempEl.style.display = 'hidden !important';
        document.body.appendChild(tempEl);
        tempEl.focus({ preventScroll: true });
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
        if (!((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.clipboard)) {
            return fallbackCopyToClipboard(data);
        }
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
    function randNum(max, min) {
        const x = Math.floor(Math.random() * max);
        if (!Number.isNaN(Number(min)) && x < min) {
            return min;
        }
        return x;
    }
    function randString(max, min, base) {
        let len = randNum(max);
        if (min && len < min)
            len = min;
        if (len > max)
            len = max;
        let arr = new Uint8Array(len / 2);
        window.crypto.getRandomValues(arr);
        return Array.from(arr, (dec) => (dec.toString(base || 36).padStart(2, '0'))).join('');
    }
    function randID(len = 8) {
        return randString(len, len, 36);
    }

    async function lazyLoad(url) {
        const _img = document.createElement('img');
        let resolve;
        let reject;
        const loader = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        if (document.readyState === 'complete') {
            _load();
        }
        else {
            window.addEventListener('load', _load, { once: true });
        }
        function _load() {
            _img.addEventListener('load', _finish);
            _img.addEventListener('error', _fail);
            _img.addEventListener('abort', _fail);
            _img.src = url;
            if (_img.complete) {
                if (_img.naturalWidth === 0) {
                    _fail(new Error('width is 0px'));
                }
                else if (_img.naturalHeight === 0) {
                    _fail(new Error('height is 0px'));
                }
                else {
                    _finish();
                }
            }
        }
        function _finish() {
            _removeListeners();
            resolve(url);
        }
        function _fail(reason) {
            _removeListeners();
            reject(reason);
        }
        function _removeListeners() {
            _img.removeEventListener('load', _finish);
            _img.removeEventListener('error', _fail);
            _img.removeEventListener('abort', _fail);
        }
        return loader;
    }
    const lazyLoadAction = (node, { thumb, source }) => {
        let _thumb = thumb;
        let _source = source;
        node.src = _thumb;
        function _load(url) {
            node.setAttribute('lazyloading', url);
            lazyLoad(url)
                .then((url) => {
                node.src = url;
                node.removeAttribute('lazyloading');
            })
                .catch((reason) => { console.dir(reason); });
        }
        _load(_source);
        return {
            update({ source }) {
                if (source !== _source) {
                    _source = source;
                    _load(_source);
                }
            },
        };
    };
    const lazyLoadSVGImgAction = (node, { thumb, source }) => {
        let _thumb = thumb;
        let _source = source;
        node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', _thumb);
        function _load(url) {
            node.setAttribute('lazyloading', url);
            lazyLoad(url)
                .then((url) => {
                node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', url);
                node.removeAttribute('lazyloading');
            })
                .catch((reason) => { console.dir(reason); });
        }
        _load(_source);
        return {
            update({ source }) {
                if (source !== _source) {
                    _source = source;
                    _load(_source);
                }
            },
        };
    };

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicIn(t) {
        return t * t * t;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    function modalBgTransition(node, opts) {
        return fade(node, {
            duration: (appState.$().a11y.reducedMotion ? 0 : ((opts === null || opts === void 0 ? void 0 : opts.duration) || 200)),
            easing: cubicInOut,
        });
    }
    function projectModalAnim(_, o) {
        return {
            duration: appState.$().a11y.reducedMotion ? 0 : 600,
            css: (t) => (`opacity: ${cubicInOut(t)};` +
                `transform: scale(${.9 + .1 * cubicInOut(t)}) translate(0, ${20 - 20 * cubicInOut(t)}rem);`),
        };
    }
    function modalTransition(_, o) {
        return {
            duration: appState.$().a11y.reducedMotion ? 0 : 250,
            css: (t) => (`opacity: ${t};` +
                `transform: scale(${.5 + .5 * cubicOut(t)});`),
        };
    }
    function disclosureTransition(_, o) {
        return {
            duration: appState.$().a11y.reducedMotion ? 0 : 250,
            css: (t) => (`opacity: ${cubicOut(t)};` +
                `transform: translateY(-${1 - cubicOut(t)}rem);`),
        };
    }

    /* src/components/modals/SocialMedia.svelte generated by Svelte v3.49.0 */
    const file$b = "src/components/modals/SocialMedia.svelte";

    function create_fragment$b(ctx) {
    	let div2;
    	let div0;
    	let div0_transition;
    	let t0;
    	let div1;
    	let h1;
    	let t1_value = /*props*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let a0;
    	let t3_value = /*$_*/ ctx[3]('section.contact.social_open_app') + "";
    	let t3;
    	let a0_href_value;
    	let t4;
    	let a1;
    	let t5_value = /*$_*/ ctx[3]('section.contact.social_open_link') + "";
    	let t5;
    	let a1_href_value;
    	let t6;
    	let button;
    	let t7_value = /*$_*/ ctx[3]('close') + "";
    	let t7;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
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
    			attr_dev(div0, "class", "background");
    			attr_dev(div0, "aria-hidden", "true");
    			add_location(div0, file$b, 1, 1, 51);
    			attr_dev(h1, "class", "name svelte-16h9ft6");
    			add_location(h1, file$b, 10, 2, 284);
    			attr_dev(a0, "href", a0_href_value = /*props*/ ctx[0].app);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "btn open-app flex flex-center svelte-16h9ft6");
    			add_location(a0, file$b, 12, 2, 322);
    			attr_dev(a1, "href", a1_href_value = /*props*/ ctx[0].url);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "btn open-link flex flex-center svelte-16h9ft6");
    			add_location(a1, file$b, 16, 2, 450);
    			attr_dev(button, "class", "btn close flex flex-center svelte-16h9ft6");
    			add_location(button, file$b, 20, 2, 580);
    			attr_dev(div1, "class", "modal grid gap-05 svelte-16h9ft6");
    			attr_dev(div1, "tabindex", "-1");
    			add_location(div1, file$b, 9, 1, 190);
    			attr_dev(div2, "class", "modal-container flex");
    			attr_dev(div2, "role", "generic");
    			add_location(div2, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
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
    			/*div1_binding*/ ctx[6](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button, "click", /*closeThis*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*props*/ 1) && t1_value !== (t1_value = /*props*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*$_*/ 8) && t3_value !== (t3_value = /*$_*/ ctx[3]('section.contact.social_open_app') + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*props*/ 1 && a0_href_value !== (a0_href_value = /*props*/ ctx[0].app)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if ((!current || dirty & /*$_*/ 8) && t5_value !== (t5_value = /*$_*/ ctx[3]('section.contact.social_open_link') + "")) set_data_dev(t5, t5_value);

    			if (!current || dirty & /*props*/ 1 && a1_href_value !== (a1_href_value = /*props*/ ctx[0].url)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if ((!current || dirty & /*$_*/ 8) && t7_value !== (t7_value = /*$_*/ ctx[3]('close') + "")) set_data_dev(t7, t7_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, modalBgTransition, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, modalTransition, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, modalBgTransition, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, modalTransition, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && div0_transition) div0_transition.end();
    			/*div1_binding*/ ctx[6](null);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $_;
    	validate_store(Y, '_');
    	component_subscribe($$self, Y, $$value => $$invalidate(3, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SocialMedia', slots, []);
    	const dispatch = createEventDispatcher();
    	let thisEl;

    	onMount(() => {
    		dispatch('mounted', thisEl);
    	});

    	let { props } = $$props;
    	let { escapable } = $$props;

    	function closeThis() {
    		dispatch('close');
    	}

    	const writable_props = ['props', 'escapable'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SocialMedia> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		if (escapable) {
    			closeThis();
    		}
    	};

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			thisEl = $$value;
    			$$invalidate(2, thisEl);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('props' in $$props) $$invalidate(0, props = $$props.props);
    		if ('escapable' in $$props) $$invalidate(1, escapable = $$props.escapable);
    	};

    	$$self.$capture_state = () => ({
    		_: Y,
    		onMount,
    		createEventDispatcher,
    		modalBgTransition,
    		modalTransition,
    		dispatch,
    		thisEl,
    		props,
    		escapable,
    		closeThis,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('thisEl' in $$props) $$invalidate(2, thisEl = $$props.thisEl);
    		if ('props' in $$props) $$invalidate(0, props = $$props.props);
    		if ('escapable' in $$props) $$invalidate(1, escapable = $$props.escapable);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [props, escapable, thisEl, $_, closeThis, click_handler, div1_binding];
    }

    class SocialMedia extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { props: 0, escapable: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SocialMedia",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*props*/ ctx[0] === undefined && !('props' in props)) {
    			console.warn("<SocialMedia> was created without expected prop 'props'");
    		}

    		if (/*escapable*/ ctx[1] === undefined && !('escapable' in props)) {
    			console.warn("<SocialMedia> was created without expected prop 'escapable'");
    		}
    	}

    	get props() {
    		throw new Error("<SocialMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<SocialMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get escapable() {
    		throw new Error("<SocialMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set escapable(value) {
    		throw new Error("<SocialMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
                if (key != queryName) {
                    query[key] = val;
                }
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
                if (key == queryName) {
                    return val;
                }
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
    var Language;
    (function (Language) {
        Language["DE"] = "de";
        Language["EN"] = "en";
    })(Language || (Language = {}));
    const langMap = {
        'en': Language.EN,
        'en-us': Language.EN,
        'en-gb': Language.EN,
        'de': Language.DE,
        'de-de': Language.DE,
        // 'ru': 'ru',
    };
    const LanguageList = [
        Language.EN, Language.DE,
    ];
    const LanguageFullName = {
        en: 'English',
        de: 'Deutsch',
        // ru: 'Русский',
    };
    LanguageList[0];
    const LOC_STORE_ID = 'danielsharkov_com_lang';
    class _i18n {
        constructor() {
            __i18n_store.set(this, writable());
            this.subscribe = __classPrivateFieldGet(this, __i18n_store, "f").subscribe;
            for (const l of Object.keys(langMap)) {
                y(l, async () => {
                    const resp = await fetch(`lang/${langMap[l]}.json`);
                    return await resp.json();
                });
            }
            let locStore = this._readLocalStore();
            if (locStore === null) {
                locStore = getQuery('lang');
            }
            $({ fallbackLocale: 'en' });
            const navLanguage = (locStore ||
                langMap[F().toLowerCase()] ||
                F().toLowerCase());
            this.switch(navLanguage);
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
            if (!LanguageList.includes(l) && langMap[l]) {
                l = langMap[l];
            }
            __classPrivateFieldGet(this, __i18n_store, "f").set(l);
            D.set(l);
            document.documentElement.setAttribute('lang', l);
            if (!localStorage && LanguageList.includes(l)) {
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
    const isInvalidLanguage = derived(i18n, (s) => LanguageList.indexOf(s) === -1);

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
            name: 'Svelte',
            color: '#FF3E00',
            hasIcon: true,
            type: TechnologyType.Framework,
            link: 'https://svelte.dev',
            careerSpan: [
                [2018, null],
            ],
        },
        TypeScript: {
            name: 'TypeScript',
            color: '#007ACC',
            hasIcon: true,
            type: TechnologyType.Language,
            link: 'https://www.typescriptlang.org',
            careerSpan: [
                [2019, null],
            ],
        },
        JavaScript: {
            name: 'JavaScript',
            color: '#F0DB4F',
            hasIcon: true,
            type: TechnologyType.Language,
            link: 'https://www.javascript.com',
            careerSpan: [
                [2013, null],
            ],
        },
        VueJS: {
            name: 'Vue.js',
            color: '#4DBA87',
            hasIcon: true,
            type: TechnologyType.Framework,
            link: 'https://vuejs.org',
            careerSpan: [
                [2016, null],
            ],
        },
        Go: {
            name: 'Go',
            color: '#01ADD8',
            hasIcon: true,
            type: TechnologyType.Language,
            link: 'https://go.dev',
            careerSpan: [
                [2016, null],
            ],
        },
        SVG: {
            name: 'SVG',
            color: '#FFB13B',
            hasIcon: true,
            type: TechnologyType.Language,
            link: 'https://developer.mozilla.org/en-US/docs/Web/SVG',
            careerSpan: [
                [2018, null],
            ],
        },
        Docker: {
            name: 'Docker',
            color: '#0091E2',
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
        SQL: {
            name: 'SQL',
            color: '#FFAB00',
            hasIcon: true,
            type: TechnologyType.Language,
            link: 'https://en.wikipedia.org/wiki/SQL',
            careerSpan: [
                [2016, null],
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
        VSC: {
            name: 'VS Code',
            color: '#3B99D4',
            hasIcon: true,
            type: TechnologyType.Software,
            link: 'https://code.visualstudio.com/',
            careerSpan: [
                [2016, null],
            ],
        },
        Stylus: {
            name: 'Stylus',
            color: '#FF6347',
            hasIcon: true,
            type: TechnologyType.Language,
            link: 'https://stylus-lang.com',
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
        HTML: {
            name: 'HTML5',
            color: '#EC652B',
            hasIcon: true,
            type: TechnologyType.Language,
            link: 'https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5',
            careerSpan: [
                [careerBegin, null],
            ],
        },
        CSS: {
            name: 'CSS3',
            color: '#1F60AA',
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
        Liquid: {
            name: 'Liquid',
            color: '#000099',
            hasIcon: true,
            type: TechnologyType.Language,
            link: 'https://shopify.github.io/liquid/',
            careerSpan: [
                [2019, null],
            ],
        },
        Shopify: {
            name: 'Shopify',
            color: '#96bf46',
            hasIcon: true,
            type: TechnologyType.Software,
            link: 'https://www.shopify.de/',
            careerSpan: [
                [2019, null],
            ],
        },
        Figma: {
            name: 'Figma',
            color: '#0ACF83',
            hasIcon: true,
            type: TechnologyType.Software,
            link: 'https://www.figma.com',
            careerSpan: [
                [2015, null],
            ],
        },
        PowerDirector15: {
            name: 'Power Director 15',
            color: '#402E77',
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
            color: '#615A48',
            hasImage: true,
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
            darkThemed: true,
            projectUrl: null,
            codeUrl: 'https://github.com/DanielSharkov/danielsharkov_com',
            usedTechnologies: [
                'Svelte', 'TypeScript', 'SVG', 'Stylus', 'Docker', 'Nginx',
                'Figma', 'VSC',
            ],
            gradient: ['#fcb6b6', '#f6df88'],
            lang: [Language.DE, Language.EN],
            prjImpl: new Date('1 May 2021'),
        },
        {
            id: 'timetabler',
            darkThemed: true,
            projectUrl: 'COMING_SOON',
            codeUrl: null,
            usedTechnologies: [
                'Svelte', 'SVG', 'Go', 'Stylus', 'Docker', 'Nginx', 'Figma',
                'VSC', 'SQL', 'PostgreSQL',
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
                { name: 'Gronkh.tv', url: 'https://gronkh.tv' },
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
                'Nginx', 'Figma', 'VSC', 'SQL', 'PostgreSQL',
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
            usedTechnologies: ['Svelte', 'VSC'],
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
            projectUrl: 'COMING_SOON',
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
            projectUrl: null,
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
            projectUrl: 'COMING_SOON',
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
    ];
    const projectsIdxMap = {};
    for (const p in projects) {
        projectsIdxMap[projects[p].id] = Number(p);
    }

    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2022, Christopher Jeffrey. (MIT Licensed)
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

    /**
     * @param {string} html
     */
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

    /**
     * @param {string | RegExp} regex
     * @param {string} opt
     */
    function edit(regex, opt) {
      regex = typeof regex === 'string' ? regex : regex.source;
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

    /**
     * @param {boolean} sanitize
     * @param {string} base
     * @param {string} href
     */
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

    /**
     * @param {string} base
     * @param {string} href
     */
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
      if (cells.length > 0 && !cells[cells.length - 1].trim()) { cells.pop(); }

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

    /**
     * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
     * /c*$/ is vulnerable to REDOS.
     *
     * @param {string} str
     * @param {string} c
     * @param {boolean} invert Remove suffix of non-c chars instead. Default falsey.
     */
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

      return str.slice(0, l - suffLen);
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
    /**
     * @param {string} pattern
     * @param {number} count
     */
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
      }
      return {
        type: 'image',
        raw,
        href,
        title,
        text: escape(text)
      };
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
        if (cap && cap[0].length > 0) {
          return {
            type: 'space',
            raw: cap[0]
          };
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
            text,
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
          const text = cap[0].replace(/^ *>[ \t]?/gm, '');

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
            line, nextLine, rawLine, itemContents, endEarly;

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
          const itemRegex = new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|$))`);

          // Check if current bullet point can start a new List Item
          while (src) {
            endEarly = false;
            if (!(cap = itemRegex.exec(src))) {
              break;
            }

            if (this.rules.block.hr.test(src)) { // End list if bullet was actually HR (possibly move into itemRegex?)
              break;
            }

            raw = cap[0];
            src = src.substring(raw.length);

            line = cap[2].split('\n', 1)[0];
            nextLine = src.split('\n', 1)[0];

            if (this.options.pedantic) {
              indent = 2;
              itemContents = line.trimLeft();
            } else {
              indent = cap[2].search(/[^ ]/); // Find first non-space char
              indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent
              itemContents = line.slice(indent);
              indent += cap[1].length;
            }

            blankLine = false;

            if (!line && /^ *$/.test(nextLine)) { // Items begin with at most one blank line
              raw += nextLine + '\n';
              src = src.substring(nextLine.length + 1);
              endEarly = true;
            }

            if (!endEarly) {
              const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?: [^\\n]*)?(?:\\n|$))`);
              const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
              const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
              const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);

              // Check if following lines should be included in List Item
              while (src) {
                rawLine = src.split('\n', 1)[0];
                line = rawLine;

                // Re-align to follow commonmark nesting rules
                if (this.options.pedantic) {
                  line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
                }

                // End list item if found code fences
                if (fencesBeginRegex.test(line)) {
                  break;
                }

                // End list item if found start of new heading
                if (headingBeginRegex.test(line)) {
                  break;
                }

                // End list item if found start of new bullet
                if (nextBulletRegex.test(line)) {
                  break;
                }

                // Horizontal rule found
                if (hrRegex.test(src)) {
                  break;
                }

                if (line.search(/[^ ]/) >= indent || !line.trim()) { // Dedent if possible
                  itemContents += '\n' + line.slice(indent);
                } else if (!blankLine) { // Until blank line, item doesn't need indentation
                  itemContents += '\n' + line;
                } else { // Otherwise, improper indentation ends this item
                  break;
                }

                if (!blankLine && !line.trim()) { // Check if current line is blank
                  blankLine = true;
                }

                raw += rawLine + '\n';
                src = src.substring(rawLine.length + 1);
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
              raw,
              task: !!istask,
              checked: ischecked,
              loose: false,
              text: itemContents
            });

            list.raw += raw;
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
            const spacers = list.items[i].tokens.filter(t => t.type === 'space');
            const hasMultipleLineBreaks = spacers.every(t => {
              const chars = t.raw.split('');
              let lineBreaks = 0;
              for (const char of chars) {
                if (char === '\n') {
                  lineBreaks += 1;
                }
                if (lineBreaks > 1) {
                  return true;
                }
              }

              return false;
            });

            if (!list.loose && spacers.length && hasMultipleLineBreaks) {
              // Having a single line break doesn't mean a list is loose. A single line break is terminating the last list item
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
            rows: cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, '').split('\n') : []
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
              this.lexer.inline(item.header[j].text, item.header[j].tokens);
            }

            // cell child tokens
            l = item.rows.length;
            for (j = 0; j < l; j++) {
              row = item.rows[j];
              for (k = 0; k < row.length; k++) {
                row[k].tokens = [];
                this.lexer.inline(row[k].text, row[k].tokens);
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
      hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
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
      def: /^ {0,3}\[(label)\]: *(?:\n *)?<?([^\s>]+)>?(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
      table: noopTest,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
      // regex template, placeholders will be replaced according to different paragraph
      // interruption rules of commonmark and the original markdown spec:
      _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
      text: /^[^\n]+/
    };

    block._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
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
      .replace('|table', '')
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

    block.gfm.paragraph = edit(block._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('table', block.gfm.table) // interrupt paragraphs with table
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
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
      reflink: /^!?\[(label)\]\[(ref)\]/,
      nolink: /^!?\[(ref)\](?:\[\])?/,
      reflinkSearch: 'reflink|nolink(?!\\()',
      emStrong: {
        lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
        //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
        //          () Skip orphan inside strong  () Consume to delim (1) #***                (2) a***#, a***                   (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
        rDelimAst: /^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[^*]+(?=[^*])|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
        rDelimUnd: /^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _
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
      .replace('ref', block._label)
      .getRegex();

    inline.nolink = edit(inline.nolink)
      .replace('ref', block._label)
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
     * @param {string} text
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
     * @param {string} text
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
          .replace(/\r\n|\r/g, '\n');

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
          src = src.replace(/\t/g, '    ').replace(/^ +$/gm, '');
        } else {
          src = src.replace(/^( *)(\t+)/gm, (_, leading, tabs) => {
            return leading + '    '.repeat(tabs.length);
          });
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
            if (token.raw.length === 1 && tokens.length > 0) {
              // if there's a single \n as a spacer, it's terminating the last line,
              // so move it there so that we don't get unecessary paragraph tags
              tokens[tokens.length - 1].raw += '\n';
            } else {
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

      /**
       * @param {string} quote
       */
      blockquote(quote) {
        return `<blockquote>\n${quote}</blockquote>\n`;
      }

      html(html) {
        return html;
      }

      /**
       * @param {string} text
       * @param {string} level
       * @param {string} raw
       * @param {any} slugger
       */
      heading(text, level, raw, slugger) {
        if (this.options.headerIds) {
          const id = this.options.headerPrefix + slugger.slug(raw);
          return `<h${level} id="${id}">${text}</h${level}>\n`;
        }

        // ignore IDs
        return `<h${level}>${text}</h${level}>\n`;
      }

      hr() {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
      }

      list(body, ordered, start) {
        const type = ordered ? 'ol' : 'ul',
          startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
      }

      /**
       * @param {string} text
       */
      listitem(text) {
        return `<li>${text}</li>\n`;
      }

      checkbox(checked) {
        return '<input '
          + (checked ? 'checked="" ' : '')
          + 'disabled="" type="checkbox"'
          + (this.options.xhtml ? ' /' : '')
          + '> ';
      }

      /**
       * @param {string} text
       */
      paragraph(text) {
        return `<p>${text}</p>\n`;
      }

      /**
       * @param {string} header
       * @param {string} body
       */
      table(header, body) {
        if (body) body = `<tbody>${body}</tbody>`;

        return '<table>\n'
          + '<thead>\n'
          + header
          + '</thead>\n'
          + body
          + '</table>\n';
      }

      /**
       * @param {string} content
       */
      tablerow(content) {
        return `<tr>\n${content}</tr>\n`;
      }

      tablecell(content, flags) {
        const type = flags.header ? 'th' : 'td';
        const tag = flags.align
          ? `<${type} align="${flags.align}">`
          : `<${type}>`;
        return tag + content + `</${type}>\n`;
      }

      /**
       * span level renderer
       * @param {string} text
       */
      strong(text) {
        return `<strong>${text}</strong>`;
      }

      /**
       * @param {string} text
       */
      em(text) {
        return `<em>${text}</em>`;
      }

      /**
       * @param {string} text
       */
      codespan(text) {
        return `<code>${text}</code>`;
      }

      br() {
        return this.options.xhtml ? '<br/>' : '<br>';
      }

      /**
       * @param {string} text
       */
      del(text) {
        return `<del>${text}</del>`;
      }

      /**
       * @param {string} href
       * @param {string} title
       * @param {string} text
       */
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

      /**
       * @param {string} href
       * @param {string} title
       * @param {string} text
       */
      image(href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }

        let out = `<img src="${href}" alt="${text}"`;
        if (title) {
          out += ` title="${title}"`;
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

      /**
       * @param {string} value
       */
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
       * @param {string} originalSlug
       * @param {boolean} isDryRun
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
       * @param {object} [options]
       * @param {boolean} [options.dryrun] Generates the next unique slug without
       * updating the internal accumulator.
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
     * @param {string} src
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

    marked.options;
    marked.setOptions;
    marked.use;
    marked.walkTokens;
    marked.parseInline;
    Parser.parse;
    Lexer.lex;

    /* src/components/StatusIcon.svelte generated by Svelte v3.49.0 */

    const file$a = "src/components/StatusIcon.svelte";

    function create_fragment$a(ctx) {
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
    			t = text("svg:not(.failed) .cross,\r\n\t\tsvg:not(.succeeded) .check {\r\n\t\t\topacity: 0;\r\n\t\t\t-webkit-animation: none;\r\n\t\t\tanimation: none;\r\n\t\t}\r\n\t\t.circle-bg {\r\n\t\t\tstroke: var(--font-base-clr-005);\r\n\t\t}\r\n\t\t.circle, .cross, .check {\r\n\t\t\ttransform-origin: center;\r\n\t\t\ttransform-box: view-box;\r\n\t\t}\r\n\r\n\t\tsvg.loading .circle {\r\n\t\t\tstroke-dasharray: 290;\r\n\t\t\tstroke-dashoffset: 0;\r\n\t\t\t-webkit-animation: loadingCircle 3s infinite linear;\r\n\t\t\tanimation: loadingCircle 3s infinite linear;\r\n\t\t\tstroke: var(--font-base-clr-025);\r\n\t\t}\r\n\t\t@-webkit-keyframes loadingCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes loadingCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\tsvg.failed .circle-bg {\r\n\t\t\tstroke: var(--clr-red-01)\r\n\t\t}\r\n\t\tsvg.failed .circle {\r\n\t\t\tstroke-dasharray: 290;\r\n\t\t\tstroke-dashoffset: 0;\r\n\t\t\t-webkit-animation: failedCircle 1s linear;\r\n\t\t\tanimation: failedCircle 1s linear;\r\n\t\t\tstroke: var(--clr-red);\r\n\t\t}\r\n\t\t@-webkit-keyframes failedCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--font-base-clr-01);\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--clr-red);\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes failedCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--font-base-clr-01);\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--clr-red);\r\n\t\t\t}\r\n\t\t}\r\n\t\tsvg.failed .cross_1 {\r\n\t\t\tstroke-dasharray: 90;\r\n\t\t\tstroke-dashoffset: 204;\r\n\t\t\tstroke: var(--clr-red);\r\n\t\t\t-webkit-animation: cross_1 .75s both cubic-bezier(.22, .61, .36, 1);\r\n\t\t\tanimation: cross_1 .75s both cubic-bezier(.22, .61, .36, 1);\r\n\t\t\t-webkit-animation-delay: .3s;\r\n\t\t\tanimation-delay: .3s;\r\n\t\t}\r\n\t\t@-webkit-keyframes cross_1 {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 90;\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes cross_1 {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 90;\r\n\t\t\t}\r\n\t\t}\r\n\t\tsvg.failed .cross_2 {\r\n\t\t\tstroke-dasharray: 93;\r\n\t\t\tstroke-dashoffset: 212;\r\n\t\t\tstroke: var(--clr-red);\r\n\t\t\t-webkit-animation: cross_2 .4s both cubic-bezier(.22, .61, .36, 1);\r\n\t\t\tanimation: cross_2 .4s both cubic-bezier(.22, .61, .36, 1);\r\n\t\t\t-webkit-animation-delay: .55s;\r\n\t\t\tanimation-delay: .55s;\r\n\t\t}\r\n\t\t@-webkit-keyframes cross_2 {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 93;\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes cross_2 {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 93;\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\tsvg.succeeded .circle-bg {\r\n\t\t\tstroke: var(--clr-green-01)\r\n\t\t}\r\n\t\tsvg.succeeded .circle {\r\n\t\t\tstroke-dasharray: 290;\r\n\t\t\tstroke-dashoffset: 0;\r\n\t\t\t-webkit-animation: succeededCircle 1s linear;\r\n\t\t\tanimation: succeededCircle 1s linear;\r\n\t\t\tstroke: var(--clr-green);\r\n\t\t}\r\n\t\t@-webkit-keyframes succeededCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--font-base-clr-01);\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--clr-green);\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes succeededCircle {\r\n\t\t\t0% {\r\n\t\t\t\ttransform: rotate(0deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--font-base-clr-01);\r\n\t\t\t}\r\n\t\t\t50% {\r\n\t\t\t\ttransform: rotate(180deg);\r\n\t\t\t\tstroke-dashoffset: 290;\r\n\t\t\t}\r\n\t\t\t100% {\r\n\t\t\t\ttransform: rotate(720deg);\r\n\t\t\t\tstroke-dashoffset: 0;\r\n\t\t\t\tstroke: var(--clr-green);\r\n\t\t\t}\r\n\t\t}\r\n\t\tsvg.succeeded .check {\r\n\t\t\tstroke-dasharray: 105;\r\n\t\t\tstroke-dashoffset: 105;\r\n\t\t\tstroke: var(--clr-green);\r\n\t\t\t-webkit-animation: check .75s both var(--transition-easing);\r\n\t\t\tanimation: check .75s both var(--transition-easing);\r\n\t\t\t-webkit-animation-delay: .35s;\r\n\t\t\tanimation-delay: .35s;\r\n\t\t}\r\n\t\t@-webkit-keyframes check {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 105;\r\n\t\t\t}\r\n\t\t\tto {\r\n\t\t\t\tstroke-dashoffset: 35;\r\n\t\t\t}\r\n\t\t}\r\n\t\t@keyframes check {\r\n\t\t\tfrom {\r\n\t\t\t\tstroke-dashoffset: 105;\r\n\t\t\t}\r\n\t\t\tto {\r\n\t\t\t\tstroke-dashoffset: 35;\r\n\t\t\t}\r\n\t\t}\r\n");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			add_location(style, file$a, 7, 1, 342);
    			attr_dev(path0, "class", "circle-bg");
    			attr_dev(path0, "d", "M60 106C85.4051 106 106 85.4051 106 60C106 34.5949 85.4051 14 60 14C34.5949 14 14 34.5949 14 60C14 85.4051 34.5949 106 60 106Z");
    			attr_dev(path0, "stroke-width", "3");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			add_location(path0, file$a, 207, 1, 4740);
    			attr_dev(path1, "class", "circle");
    			attr_dev(path1, "d", "M60 106C85.4051 106 106 85.4051 106 60C106 34.5949 85.4051 14 60 14C34.5949 14 14 34.5949 14 60C14 85.4051 34.5949 106 60 106Z");
    			attr_dev(path1, "stroke-width", "3");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			add_location(path1, file$a, 208, 1, 4963);
    			attr_dev(path2, "class", "check");
    			attr_dev(path2, "d", "M83.5614 43L48.9583 77.8633L36.0001 64.9051C23.5949 52.5 11.5001 58 17.0003 76.5");
    			attr_dev(path2, "stroke-width", "3");
    			attr_dev(path2, "stroke-linecap", "round");
    			attr_dev(path2, "stroke-linejoin", "round");
    			add_location(path2, file$a, 209, 1, 5183);
    			attr_dev(path3, "class", "cross cross_1");
    			attr_dev(path3, "d", "M82.9993 83L37.0003 37.001C29.4993 29.5 24.5 28 19 39");
    			attr_dev(path3, "stroke-width", "3");
    			attr_dev(path3, "stroke-linecap", "round");
    			attr_dev(path3, "stroke-linejoin", "round");
    			add_location(path3, file$a, 210, 1, 5356);
    			attr_dev(path4, "class", "cross cross_2");
    			attr_dev(path4, "d", "M37.0001 82.9386L82.9991 36.9397C91.5 28.4388 83.9999 19 75.9999 17");
    			attr_dev(path4, "stroke-width", "3");
    			attr_dev(path4, "stroke-linecap", "round");
    			attr_dev(path4, "stroke-linejoin", "round");
    			add_location(path4, file$a, 211, 1, 5510);
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
    			add_location(svg, file$a, 5, 0, 116);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { failed: 0, succeeded: 1, loading: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StatusIcon",
    			options,
    			id: create_fragment$a.name
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

    /* src/components/modals/Project.svelte generated by Svelte v3.49.0 */

    const { Error: Error_1$2, window: window_1$1 } = globals;
    const file$9 = "src/components/modals/Project.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[50] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[53] = list[i];
    	return child_ctx;
    }

    // (25:3) {#if !props.project.hasNoCover}
    function create_if_block_25(ctx) {
    	let div;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1,
    		value: 56
    	};

    	handle_promise(promise = /*lazyLoader*/ ctx[6], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "flex flex-center svelte-7thq00");
    			add_location(div, file$9, 25, 4, 796);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty[0] & /*lazyLoader*/ 64 && promise !== (promise = /*lazyLoader*/ ctx[6]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(25:3) {#if !props.project.hasNoCover}",
    		ctx
    	});

    	return block;
    }

    // (44:5) {:catch}
    function create_catch_block_1(ctx) {
    	let div0;
    	let style_background_image = `url(${/*_thumbSrc*/ ctx[19]})`;
    	let t0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t1;
    	let div1;
    	let svg;
    	let use;
    	let t2;
    	let span;
    	let t3_value = /*$_*/ ctx[20]('failed_to_load_image') + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			attr_dev(div0, "class", "thumb bg-cover svelte-7thq00");
    			set_style(div0, "background-image", style_background_image, false);
    			add_location(div0, file$9, 44, 6, 1428);
    			attr_dev(img, "class", "thumb image svelte-7thq00");
    			if (!src_url_equal(img.src, img_src_value = /*_thumbSrc*/ ctx[19])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*props*/ ctx[0].project.id + " thumbnail"));
    			add_location(img, file$9, 48, 6, 1527);
    			xlink_attr(use, "xlink:href", "#Icon_ErrorCircle");
    			add_location(use, file$9, 54, 8, 1784);
    			attr_dev(svg, "class", "icon icon-thinner svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 53, 7, 1687);
    			attr_dev(span, "class", "fail-msg svelte-7thq00");
    			add_location(span, file$9, 56, 7, 1843);
    			attr_dev(div1, "class", "lazyload-overlay flex flex-center svelte-7thq00");
    			add_location(div1, file$9, 52, 6, 1632);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, svg);
    			append_dev(svg, use);
    			append_dev(div1, t2);
    			append_dev(div1, span);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*_thumbSrc*/ 524288 && style_background_image !== (style_background_image = `url(${/*_thumbSrc*/ ctx[19]})`)) {
    				set_style(div0, "background-image", style_background_image, false);
    			}

    			if (dirty[0] & /*_thumbSrc*/ 524288 && !src_url_equal(img.src, img_src_value = /*_thumbSrc*/ ctx[19])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*props*/ 1 && img_alt_value !== (img_alt_value = "" + (/*props*/ ctx[0].project.id + " thumbnail"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*$_*/ 1048576 && t3_value !== (t3_value = /*$_*/ ctx[20]('failed_to_load_image') + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(44:5) {:catch}",
    		ctx
    	});

    	return block;
    }

    // (41:5) {:then src}
    function create_then_block_1(ctx) {
    	let div;
    	let style_background_image = `url(${/*src*/ ctx[56]})`;
    	let t;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			img = element("img");
    			attr_dev(div, "class", "bg-cover svelte-7thq00");
    			set_style(div, "background-image", style_background_image, false);
    			add_location(div, file$9, 41, 6, 1284);
    			attr_dev(img, "class", "image svelte-7thq00");
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[56])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*props*/ ctx[0].project.id + " cover"));
    			add_location(img, file$9, 42, 6, 1350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*lazyLoader*/ 64 && style_background_image !== (style_background_image = `url(${/*src*/ ctx[56]})`)) {
    				set_style(div, "background-image", style_background_image, false);
    			}

    			if (dirty[0] & /*lazyLoader*/ 64 && !src_url_equal(img.src, img_src_value = /*src*/ ctx[56])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*props*/ 1 && img_alt_value !== (img_alt_value = "" + (/*props*/ ctx[0].project.id + " cover"))) {
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
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(41:5) {:then src}",
    		ctx
    	});

    	return block;
    }

    // (27:24)        <div        class='thumb bg-cover'        style:background-image='url({_thumbSrc}
    function create_pending_block_1(ctx) {
    	let div0;
    	let style_background_image = `url(${/*_thumbSrc*/ ctx[19]})`;
    	let t0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t1;
    	let div1;
    	let svg;
    	let use;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(div0, "class", "thumb bg-cover svelte-7thq00");
    			set_style(div0, "background-image", style_background_image, false);
    			add_location(div0, file$9, 27, 6, 858);
    			attr_dev(img, "class", "thumb image svelte-7thq00");
    			if (!src_url_equal(img.src, img_src_value = /*_thumbSrc*/ ctx[19])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*props*/ ctx[0].project.id + " thumbnail"));
    			add_location(img, file$9, 31, 6, 957);
    			xlink_attr(use, "xlink:href", "#Icon_Loader");
    			add_location(use, file$9, 37, 8, 1201);
    			attr_dev(svg, "class", "icon svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 36, 7, 1117);
    			attr_dev(div1, "class", "lazyload-overlay flex flex-center svelte-7thq00");
    			add_location(div1, file$9, 35, 6, 1062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, svg);
    			append_dev(svg, use);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*_thumbSrc*/ 524288 && style_background_image !== (style_background_image = `url(${/*_thumbSrc*/ ctx[19]})`)) {
    				set_style(div0, "background-image", style_background_image, false);
    			}

    			if (dirty[0] & /*_thumbSrc*/ 524288 && !src_url_equal(img.src, img_src_value = /*_thumbSrc*/ ctx[19])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*props*/ 1 && img_alt_value !== (img_alt_value = "" + (/*props*/ ctx[0].project.id + " thumbnail"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(27:24)        <div        class='thumb bg-cover'        style:background-image='url({_thumbSrc}",
    		ctx
    	});

    	return block;
    }

    // (66:4) {#if props.project.usedTechnologies.length > 0}
    function create_if_block_22(ctx) {
    	let div;
    	let each_value_3 = /*props*/ ctx[0].project.usedTechnologies;
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "used-technologies flex gap-05");
    			attr_dev(div, "role", "listbox");
    			add_location(div, file$9, 66, 5, 2150);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*props*/ 1) {
    				each_value_3 = /*props*/ ctx[0].project.usedTechnologies;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(66:4) {#if props.project.usedTechnologies.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (82:48) 
    function create_if_block_24(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "logo svelte-7thq00");
    			if (!src_url_equal(img.src, img_src_value = "technologies/" + /*techno*/ ctx[53] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*techno*/ ctx[53] + " Logo"));
    			add_location(img, file$9, 82, 9, 2813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*props*/ 1 && !src_url_equal(img.src, img_src_value = "technologies/" + /*techno*/ ctx[53] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*props*/ 1 && img_alt_value !== (img_alt_value = "" + (/*techno*/ ctx[53] + " Logo"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(82:48) ",
    		ctx
    	});

    	return block;
    }

    // (77:8) {#if technologies[techno].hasIcon}
    function create_if_block_23(ctx) {
    	let svg;
    	let title;
    	let t0_value = /*techno*/ ctx[53] + "";
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
    			add_location(title, file$9, 78, 10, 2665);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#Logo_" + /*techno*/ ctx[53]);
    			add_location(use, file$9, 79, 10, 2704);
    			attr_dev(svg, "class", "logo svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 77, 9, 2579);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			append_dev(svg, use);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*props*/ 1 && t0_value !== (t0_value = /*techno*/ ctx[53] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*props*/ 1 && use_xlink_href_value !== (use_xlink_href_value = "#Logo_" + /*techno*/ ctx[53])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(77:8) {#if technologies[techno].hasIcon}",
    		ctx
    	});

    	return block;
    }

    // (68:6) {#each props.project.usedTechnologies as techno}
    function create_each_block_3$1(ctx) {
    	let a;
    	let div;
    	let t0;
    	let t1;
    	let span;
    	let t2_value = technologies[/*techno*/ ctx[53]].name + "";
    	let t2;
    	let t3;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (technologies[/*techno*/ ctx[53]].hasIcon) return create_if_block_23;
    		if (technologies[/*techno*/ ctx[53]].hasImage) return create_if_block_24;
    	}

    	let current_block_type = select_block_type(ctx);
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
    			attr_dev(div, "class", "color svelte-7thq00");
    			set_style(div, "background-color", technologies[/*techno*/ ctx[53]].color);
    			add_location(div, file$9, 72, 8, 2424);
    			attr_dev(span, "class", "name svelte-7thq00");
    			add_location(span, file$9, 88, 8, 2947);
    			attr_dev(a, "href", a_href_value = technologies[/*techno*/ ctx[53]].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "techno flex flex-center gap-05 svelte-7thq00");
    			attr_dev(a, "role", "listitem");
    			add_location(a, file$9, 68, 7, 2271);
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
    			if (dirty[0] & /*props*/ 1) {
    				set_style(div, "background-color", technologies[/*techno*/ ctx[53]].color);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(a, t1);
    				}
    			}

    			if (dirty[0] & /*props*/ 1 && t2_value !== (t2_value = technologies[/*techno*/ ctx[53]].name + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*props*/ 1 && a_href_value !== (a_href_value = technologies[/*techno*/ ctx[53]].link)) {
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
    		source: "(68:6) {#each props.project.usedTechnologies as techno}",
    		ctx
    	});

    	return block;
    }

    // (98:4) {#if Array.isArray(props.project.otherLinks)}
    function create_if_block_21(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*props*/ ctx[0].project.otherLinks;
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
    			if (dirty[0] & /*props, $_*/ 1048577) {
    				each_value_2 = /*props*/ ctx[0].project.otherLinks;
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
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(98:4) {#if Array.isArray(props.project.otherLinks)}",
    		ctx
    	});

    	return block;
    }

    // (99:5) {#each props.project.otherLinks as link}
    function create_each_block_2$1(ctx) {
    	let a;
    	let svg;
    	let use;
    	let t0;
    	let span;
    	let t1_value = /*$_*/ ctx[20](/*link*/ ctx[50].name) + "";
    	let t1;
    	let t2;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			xlink_attr(use, "xlink:href", "#Icon_Chain");
    			add_location(use, file$9, 101, 8, 3479);
    			attr_dev(svg, "class", "icon svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 100, 7, 3395);
    			attr_dev(span, "class", "label svelte-7thq00");
    			add_location(span, file$9, 103, 7, 3532);
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[50].url);
    			attr_dev(a, "role", "button");
    			attr_dev(a, "class", "other-link flex flex-center gap-05 svelte-7thq00");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 99, 6, 3279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, use);
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
    			if (dirty[0] & /*$_, props*/ 1048577 && t1_value !== (t1_value = /*$_*/ ctx[20](/*link*/ ctx[50].name) + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*props*/ 1 && a_href_value !== (a_href_value = /*link*/ ctx[50].url)) {
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
    		source: "(99:5) {#each props.project.otherLinks as link}",
    		ctx
    	});

    	return block;
    }

    // (108:4) {#if props.project.codeUrl}
    function create_if_block_20(ctx) {
    	let a;
    	let svg;
    	let use;
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
    			use = svg_element("use");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			xlink_attr(use, "xlink:href", "#Icon_Code");
    			add_location(use, file$9, 110, 7, 3863);
    			attr_dev(svg, "class", "icon svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 109, 6, 3780);
    			attr_dev(span, "class", "label svelte-7thq00");
    			add_location(span, file$9, 112, 6, 3913);
    			attr_dev(a, "href", a_href_value = /*props*/ ctx[0].project.codeUrl);
    			attr_dev(a, "role", "button");
    			attr_dev(a, "class", "open-source-code flex flex-center gap-05 svelte-7thq00");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 108, 5, 3646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, use);
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

    			if (dirty[0] & /*props*/ 1 && a_href_value !== (a_href_value = /*props*/ ctx[0].project.codeUrl)) {
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
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(108:4) {#if props.project.codeUrl}",
    		ctx
    	});

    	return block;
    }

    // (116:4) {#if props.project.codeUrl === null}
    function create_if_block_19(ctx) {
    	let div;
    	let svg;
    	let use;
    	let t0;
    	let span;
    	let t1_value = /*$_*/ ctx[20]('project_closed_source') + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			xlink_attr(use, "xlink:href", "#Icon_Lock");
    			add_location(use, file$9, 118, 7, 4175);
    			attr_dev(svg, "class", "icon svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 117, 6, 4092);
    			attr_dev(span, "class", "label svelte-7thq00");
    			add_location(span, file$9, 120, 6, 4225);
    			attr_dev(div, "class", "closed-source flex flex-center gap-05 svelte-7thq00");
    			add_location(div, file$9, 116, 5, 4034);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, use);
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
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(116:4) {#if props.project.codeUrl === null}",
    		ctx
    	});

    	return block;
    }

    // (132:57) 
    function create_if_block_18(ctx) {
    	let div;
    	let span;
    	let t0_value = /*$_*/ ctx[20]('project_coming_soon') + "";
    	let t0;
    	let t1;
    	let svg;
    	let use;
    	let div_href_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(span, "class", "label svelte-7thq00");
    			add_location(span, file$9, 133, 6, 4907);
    			xlink_attr(use, "xlink:href", "#Icon_Time");
    			add_location(use, file$9, 135, 7, 5051);
    			attr_dev(svg, "class", "icon svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 134, 6, 4968);
    			attr_dev(div, "href", div_href_value = /*props*/ ctx[0].project.projectUrl);
    			attr_dev(div, "class", "open-project-soon flex flex-center gap-05 svelte-7thq00");
    			add_location(div, file$9, 132, 5, 4813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, svg);
    			append_dev(svg, use);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t0_value !== (t0_value = /*$_*/ ctx[20]('project_coming_soon') + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*props*/ 1 && div_href_value !== (div_href_value = /*props*/ ctx[0].project.projectUrl)) {
    				attr_dev(div, "href", div_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(132:57) ",
    		ctx
    	});

    	return block;
    }

    // (124:4) {#if props.project.projectUrl !== null && props.project.projectUrl !== 'COMING_SOON'}
    function create_if_block_17(ctx) {
    	let a;
    	let div;
    	let t0;
    	let span;
    	let t1_value = /*$_*/ ctx[20]('open_project') + "";
    	let t1;
    	let t2;
    	let svg;
    	let use;
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
    			use = svg_element("use");
    			attr_dev(div, "class", "shine svelte-7thq00");
    			add_location(div, file$9, 125, 6, 4532);
    			attr_dev(span, "class", "label svelte-7thq00");
    			add_location(span, file$9, 126, 6, 4559);
    			xlink_attr(use, "xlink:href", "#Icon_Link");
    			add_location(use, file$9, 128, 7, 4696);
    			attr_dev(svg, "class", "icon svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 127, 6, 4613);
    			attr_dev(a, "href", a_href_value = /*props*/ ctx[0].project.projectUrl);
    			attr_dev(a, "role", "button");
    			attr_dev(a, "class", "open-project flex flex-center gap-05 svelte-7thq00");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$9, 124, 5, 4399);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(a, t0);
    			append_dev(a, span);
    			append_dev(span, t1);
    			append_dev(a, t2);
    			append_dev(a, svg);
    			append_dev(svg, use);

    			if (!mounted) {
    				dispose = action_destroyer(vibrateLink.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t1_value !== (t1_value = /*$_*/ ctx[20]('open_project') + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*props*/ 1 && a_href_value !== (a_href_value = /*props*/ ctx[0].project.projectUrl)) {
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
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(124:4) {#if props.project.projectUrl !== null && props.project.projectUrl !== 'COMING_SOON'}",
    		ctx
    	});

    	return block;
    }

    // (144:3) {#if !articleTranslationUnavailable && (props.project.lang.length > 1 || articleHasMetaSet)}
    function create_if_block_9(ctx) {
    	let div;
    	let t;
    	let current;
    	let if_block0 = /*props*/ ctx[0].project.lang.length > 1 && create_if_block_14(ctx);
    	let if_block1 = /*articleHasMetaSet*/ ctx[18] && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "about-header grid gap-1 svelte-7thq00");
    			add_location(div, file$9, 144, 4, 5303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*props*/ ctx[0].project.lang.length > 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*props*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_14(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*articleHasMetaSet*/ ctx[18]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_10(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(144:3) {#if !articleTranslationUnavailable && (props.project.lang.length > 1 || articleHasMetaSet)}",
    		ctx
    	});

    	return block;
    }

    // (146:5) {#if props.project.lang.length > 1}
    function create_if_block_14(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let svg0;
    	let use0;
    	let t0;
    	let span;
    	let t1_value = /*$_*/ ctx[20]('project_load_different_translation') + "";
    	let t1;
    	let t2;
    	let svg1;
    	let use1;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*isSelectingTranslation*/ ctx[5] && create_if_block_15(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			svg0 = svg_element("svg");
    			use0 = svg_element("use");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			svg1 = svg_element("svg");
    			use1 = svg_element("use");
    			t3 = space();
    			if (if_block) if_block.c();
    			xlink_attr(use0, "xlink:href", "#Icon_Translation");
    			add_location(use0, file$9, 153, 10, 5766);
    			attr_dev(svg0, "class", "icon svelte-7thq00");
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "focusable", "false");
    			attr_dev(svg0, "role", "presentation");
    			add_location(svg0, file$9, 152, 9, 5680);
    			attr_dev(span, "class", "label svelte-7thq00");
    			add_location(span, file$9, 155, 9, 5829);
    			xlink_attr(use1, "xlink:href", "#Icon_Chevron");
    			add_location(use1, file$9, 157, 10, 6003);
    			attr_dev(svg1, "class", "icon icon-075 svelte-7thq00");
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "focusable", "false");
    			attr_dev(svg1, "role", "presentation");
    			add_location(svg1, file$9, 156, 9, 5908);
    			attr_dev(button, "class", "loaded-translation flex nowrap flex-center-y gap-05 svelte-7thq00");
    			attr_dev(button, "aria-haspopup", "true");
    			toggle_class(button, "active", /*isSelectingTranslation*/ ctx[5]);
    			add_location(button, file$9, 148, 8, 5481);
    			attr_dev(div0, "class", "disclosure svelte-7thq00");
    			add_location(div0, file$9, 147, 7, 5448);
    			attr_dev(div1, "class", "load-different-lang flex flex-center-y svelte-7thq00");
    			add_location(div1, file$9, 146, 6, 5388);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, svg0);
    			append_dev(svg0, use0);
    			append_dev(button, t0);
    			append_dev(button, span);
    			append_dev(span, t1);
    			append_dev(button, t2);
    			append_dev(button, svg1);
    			append_dev(svg1, use1);
    			append_dev(div0, t3);
    			if (if_block) if_block.m(div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleTranslationSelection*/ ctx[24], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$_*/ 1048576) && t1_value !== (t1_value = /*$_*/ ctx[20]('project_load_different_translation') + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*isSelectingTranslation*/ 32) {
    				toggle_class(button, "active", /*isSelectingTranslation*/ ctx[5]);
    			}

    			if (/*isSelectingTranslation*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*isSelectingTranslation*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_15(ctx);
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
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(146:5) {#if props.project.lang.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (161:8) {#if isSelectingTranslation}
    function create_if_block_15(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let each_value_1 = /*props*/ ctx[0].project.lang;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "options grid gap-05 svelte-7thq00");
    			add_location(div, file$9, 161, 9, 6117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectDifferentTranslation, props, loadedTranslation*/ 33554437) {
    				each_value_1 = /*props*/ ctx[0].project.lang;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
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
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, disclosureTransition, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, disclosureTransition, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(161:8) {#if isSelectingTranslation}",
    		ctx
    	});

    	return block;
    }

    // (164:11) {#if lang !== loadedTranslation}
    function create_if_block_16(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = LanguageFullName[/*lang*/ ctx[44]] + "";
    	let t0;
    	let t1;
    	let use;
    	let use_xlink_href_value;
    	let t2;
    	let span;
    	let t3_value = LanguageFullName[/*lang*/ ctx[44]] + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[31](/*lang*/ ctx[44]);
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
    			add_location(title, file$9, 166, 14, 6507);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#Flag_" + /*lang*/ ctx[44]);
    			add_location(use, file$9, 167, 14, 6566);
    			attr_dev(svg, "class", "flag icon icon-175 svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 165, 13, 6403);
    			attr_dev(span, "class", "label svelte-7thq00");
    			add_location(span, file$9, 169, 13, 6632);
    			attr_dev(button, "class", "option flex nowrap flex-center-y gap-05 svelte-7thq00");
    			add_location(button, file$9, 164, 12, 6284);
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
    			if (dirty[0] & /*props*/ 1 && t0_value !== (t0_value = LanguageFullName[/*lang*/ ctx[44]] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*props*/ 1 && use_xlink_href_value !== (use_xlink_href_value = "#Flag_" + /*lang*/ ctx[44])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}

    			if (dirty[0] & /*props*/ 1 && t3_value !== (t3_value = LanguageFullName[/*lang*/ ctx[44]] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(164:11) {#if lang !== loadedTranslation}",
    		ctx
    	});

    	return block;
    }

    // (163:10) {#each props.project.lang as lang}
    function create_each_block_1$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*lang*/ ctx[44] !== /*loadedTranslation*/ ctx[2] && create_if_block_16(ctx);

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
    			if (/*lang*/ ctx[44] !== /*loadedTranslation*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_16(ctx);
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
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(163:10) {#each props.project.lang as lang}",
    		ctx
    	});

    	return block;
    }

    // (179:5) {#if articleHasMetaSet}
    function create_if_block_10(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*props*/ ctx[0].project.articleWritten !== undefined && create_if_block_13(ctx);
    	let if_block1 = /*props*/ ctx[0].project.prjImpl !== undefined && create_if_block_12(ctx);
    	let if_block2 = /*props*/ ctx[0].project.prjUpdt !== undefined && create_if_block_11(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "metadata flex gap-05 svelte-7thq00");
    			add_location(div, file$9, 179, 6, 6844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*props*/ ctx[0].project.articleWritten !== undefined) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_13(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*props*/ ctx[0].project.prjImpl !== undefined) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_12(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*props*/ ctx[0].project.prjUpdt !== undefined) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_11(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(179:5) {#if articleHasMetaSet}",
    		ctx
    	});

    	return block;
    }

    // (181:7) {#if props.project.articleWritten !== undefined}
    function create_if_block_13(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*$_*/ ctx[20]('project_article_written') + "";
    	let t0;
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*$_date*/ ctx[21](/*props*/ ctx[0].project.articleWritten, { month: 'long', year: 'numeric' }) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			attr_dev(span0, "class", "svelte-7thq00");
    			add_location(span0, file$9, 182, 9, 6971);
    			attr_dev(span1, "class", "svelte-7thq00");
    			add_location(span1, file$9, 183, 9, 7026);
    			attr_dev(div, "class", "flex svelte-7thq00");
    			add_location(div, file$9, 181, 8, 6943);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			append_dev(span1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t0_value !== (t0_value = /*$_*/ ctx[20]('project_article_written') + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*$_date, props*/ 2097153 && t3_value !== (t3_value = /*$_date*/ ctx[21](/*props*/ ctx[0].project.articleWritten, { month: 'long', year: 'numeric' }) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(181:7) {#if props.project.articleWritten !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (187:7) {#if props.project.prjImpl !== undefined}
    function create_if_block_12(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*$_*/ ctx[20]('project_implemented') + "";
    	let t0;
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*$_date*/ ctx[21](/*props*/ ctx[0].project.prjImpl, { month: 'long', year: 'numeric' }) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			attr_dev(span0, "class", "svelte-7thq00");
    			add_location(span0, file$9, 188, 9, 7225);
    			attr_dev(span1, "class", "svelte-7thq00");
    			add_location(span1, file$9, 189, 9, 7276);
    			attr_dev(div, "class", "flex svelte-7thq00");
    			add_location(div, file$9, 187, 8, 7197);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			append_dev(span1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t0_value !== (t0_value = /*$_*/ ctx[20]('project_implemented') + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*$_date, props*/ 2097153 && t3_value !== (t3_value = /*$_date*/ ctx[21](/*props*/ ctx[0].project.prjImpl, { month: 'long', year: 'numeric' }) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(187:7) {#if props.project.prjImpl !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (193:7) {#if props.project.prjUpdt !== undefined}
    function create_if_block_11(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*$_*/ ctx[20]('project_updated') + "";
    	let t0;
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*$_date*/ ctx[21](/*props*/ ctx[0].project.prjUpdt, { month: 'long', year: 'numeric' }) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			attr_dev(span0, "class", "svelte-7thq00");
    			add_location(span0, file$9, 194, 9, 7468);
    			attr_dev(span1, "class", "svelte-7thq00");
    			add_location(span1, file$9, 195, 9, 7515);
    			attr_dev(div, "class", "flex svelte-7thq00");
    			add_location(div, file$9, 193, 8, 7440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			append_dev(span1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_*/ 1048576 && t0_value !== (t0_value = /*$_*/ ctx[20]('project_updated') + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*$_date, props*/ 2097153 && t3_value !== (t3_value = /*$_date*/ ctx[21](/*props*/ ctx[0].project.prjUpdt, { month: 'long', year: 'numeric' }) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(193:7) {#if props.project.prjUpdt !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (224:28) 
    function create_if_block_8(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 47
    	};

    	handle_promise(promise = /*about*/ ctx[4], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty[0] & /*about*/ 16 && promise !== (promise = /*about*/ ctx[4]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(224:28) ",
    		ctx
    	});

    	return block;
    }

    // (203:3) {#if articleTranslationUnavailable && about === null}
    function create_if_block_6(ctx) {
    	let div;

    	function select_block_type_3(ctx, dirty) {
    		if (/*props*/ ctx[0].project.lang.length < 1) return create_if_block_7;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "lang-unavailable flex-base-size-variable grid grid-center svelte-7thq00");
    			add_location(div, file$9, 203, 4, 7727);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(203:3) {#if articleTranslationUnavailable && about === null}",
    		ctx
    	});

    	return block;
    }

    // (236:4) {:catch}
    function create_catch_block$1(ctx) {
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
    			attr_dev(h1, "class", "svelte-7thq00");
    			add_location(h1, file$9, 237, 6, 8936);
    			attr_dev(hr, "class", "h1-border svelte-7thq00");
    			attr_dev(hr, "aria-hidden", "true");
    			add_location(hr, file$9, 238, 6, 8980);
    			attr_dev(p0, "class", "i svelte-7thq00");
    			attr_dev(p0, "aria-hidden", "true");
    			add_location(p0, file$9, 239, 6, 9029);
    			attr_dev(h3, "aria-hidden", "true");
    			attr_dev(h3, "class", "svelte-7thq00");
    			add_location(h3, file$9, 241, 6, 9114);
    			attr_dev(p1, "class", "ii svelte-7thq00");
    			attr_dev(p1, "aria-hidden", "true");
    			add_location(p1, file$9, 242, 6, 9150);
    			attr_dev(p2, "class", "iii svelte-7thq00");
    			attr_dev(p2, "aria-hidden", "true");
    			add_location(p2, file$9, 243, 6, 9195);
    			attr_dev(div, "class", "placeholder error svelte-7thq00");
    			add_location(div, file$9, 236, 5, 8898);
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
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(236:4) {:catch}",
    		ctx
    	});

    	return block;
    }

    // (234:4) {:then rtfContent}
    function create_then_block$1(ctx) {
    	let article;
    	let raw_value = /*rtfContent*/ ctx[47] + "";

    	const block = {
    		c: function create() {
    			article = element("article");
    			attr_dev(article, "class", "rtf-content svelte-7thq00");
    			add_location(article, file$9, 234, 5, 8822);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			article.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*about*/ 16 && raw_value !== (raw_value = /*rtfContent*/ ctx[47] + "")) article.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(234:4) {:then rtfContent}",
    		ctx
    	});

    	return block;
    }

    // (225:18)       <div class='placeholder' aria-hidden='true'>       <h1>______________</h1>       <hr class='h1-border'/>       <p class='i'>_</p>       <h3>_</h3>       <p class='ii'>_</p>       <p class='iii'>_</p>      </div>     {:then rtfContent}
    function create_pending_block$1(ctx) {
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
    			h1.textContent = "______________";
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
    			attr_dev(h1, "class", "svelte-7thq00");
    			add_location(h1, file$9, 226, 6, 8633);
    			attr_dev(hr, "class", "h1-border svelte-7thq00");
    			add_location(hr, file$9, 227, 6, 8663);
    			attr_dev(p0, "class", "i svelte-7thq00");
    			add_location(p0, file$9, 228, 6, 8693);
    			attr_dev(h3, "class", "svelte-7thq00");
    			add_location(h3, file$9, 229, 6, 8718);
    			attr_dev(p1, "class", "ii svelte-7thq00");
    			add_location(p1, file$9, 230, 6, 8735);
    			attr_dev(p2, "class", "iii svelte-7thq00");
    			add_location(p2, file$9, 231, 6, 8761);
    			attr_dev(div, "class", "placeholder svelte-7thq00");
    			attr_dev(div, "aria-hidden", "true");
    			add_location(div, file$9, 225, 5, 8582);
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
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(225:18)       <div class='placeholder' aria-hidden='true'>       <h1>______________</h1>       <hr class='h1-border'/>       <p class='i'>_</p>       <h3>_</h3>       <p class='ii'>_</p>       <p class='iii'>_</p>      </div>     {:then rtfContent}",
    		ctx
    	});

    	return block;
    }

    // (209:5) {:else}
    function create_else_block_2(ctx) {
    	let p;
    	let t0_value = /*$_*/ ctx[20]('project_about_only_available_in') + "";
    	let t0;
    	let t1;
    	let div;
    	let each_value = /*props*/ ctx[0].project.lang;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
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

    			attr_dev(p, "class", "svelte-7thq00");
    			add_location(p, file$9, 209, 6, 7945);
    			attr_dev(div, "class", "options flex flex-center-y gap-1 svelte-7thq00");
    			add_location(div, file$9, 210, 6, 7998);
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

    			if (dirty[0] & /*fetchArticle, props*/ 8388609) {
    				each_value = /*props*/ ctx[0].project.lang;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
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
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(209:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (205:5) {#if props.project.lang.length < 1}
    function create_if_block_7(ctx) {
    	let p;
    	let t_value = /*$_*/ ctx[20]('project_about_unavailable') + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "no-translations svelte-7thq00");
    			add_location(p, file$9, 205, 6, 7846);
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
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(205:5) {#if props.project.lang.length < 1}",
    		ctx
    	});

    	return block;
    }

    // (212:7) {#each props.project.lang as lang}
    function create_each_block$6(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = LanguageFullName[/*lang*/ ctx[44]] + "";
    	let t0;
    	let t1;
    	let use;
    	let use_xlink_href_value;
    	let t2;
    	let span;
    	let t3_value = LanguageFullName[/*lang*/ ctx[44]] + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[32](/*lang*/ ctx[44]);
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
    			add_location(title, file$9, 214, 10, 8296);
    			xlink_attr(use, "xlink:href", use_xlink_href_value = "#Flag_" + /*lang*/ ctx[44]);
    			add_location(use, file$9, 215, 10, 8351);
    			attr_dev(svg, "class", "flag icon icon-175 svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 213, 9, 8196);
    			attr_dev(span, "class", "label svelte-7thq00");
    			add_location(span, file$9, 217, 9, 8409);
    			attr_dev(button, "class", "option flex nowrap flex-center-y gap-05 svelte-7thq00");
    			add_location(button, file$9, 212, 8, 8095);
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
    				dispose = listen_dev(button, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*props*/ 1 && t0_value !== (t0_value = LanguageFullName[/*lang*/ ctx[44]] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*props*/ 1 && use_xlink_href_value !== (use_xlink_href_value = "#Flag_" + /*lang*/ ctx[44])) {
    				xlink_attr(use, "xlink:href", use_xlink_href_value);
    			}

    			if (dirty[0] & /*props*/ 1 && t3_value !== (t3_value = LanguageFullName[/*lang*/ ctx[44]] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(212:7) {#each props.project.lang as lang}",
    		ctx
    	});

    	return block;
    }

    // (260:6) {:else}
    function create_else_block_1$1(ctx) {
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
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(260:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (258:35) 
    function create_if_block_5(ctx) {
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(258:35) ",
    		ctx
    	});

    	return block;
    }

    // (256:6) {#if shareURLWasCanceled}
    function create_if_block_4(ctx) {
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(256:6) {#if shareURLWasCanceled}",
    		ctx
    	});

    	return block;
    }

    // (276:3) {#if isSharingSupported}
    function create_if_block$5(ctx) {
    	let button;
    	let div;
    	let span0;
    	let t0;
    	let statusicon;
    	let t1;
    	let svg;
    	let use;
    	let t2;
    	let span1;
    	let t3_value = /*$_*/ ctx[20]('share_with') + "";
    	let t3;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type_5(ctx, dirty) {
    		if (/*shareNotSupported*/ ctx[12]) return create_if_block_1$2;
    		if (/*shareWasCanceled*/ ctx[11]) return create_if_block_2$2;
    		if (/*shareWasSuccess*/ ctx[13]) return create_if_block_3;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type_5(ctx);
    	let if_block = current_block_type(ctx);

    	statusicon = new StatusIcon({
    			props: {
    				loading: /*userIsSharing*/ ctx[10],
    				failed: /*shareWasCanceled*/ ctx[11] || /*shareNotSupported*/ ctx[12],
    				succeeded: /*shareWasSuccess*/ ctx[13]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			div = element("div");
    			span0 = element("span");
    			if_block.c();
    			t0 = space();
    			create_component(statusicon.$$.fragment);
    			t1 = space();
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			attr_dev(span0, "class", "label svelte-7thq00");
    			add_location(span0, file$9, 280, 6, 10396);
    			attr_dev(div, "class", "status grid gap-05 grid-center-x svelte-7thq00");
    			attr_dev(div, "role", "alert");
    			toggle_class(div, "active", /*userIsSharing*/ ctx[10]);
    			add_location(div, file$9, 279, 5, 10301);
    			xlink_attr(use, "xlink:href", "#Icon_Share");
    			add_location(use, file$9, 298, 6, 10919);
    			attr_dev(svg, "class", "icon svelte-7thq00");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$9, 297, 5, 10837);
    			attr_dev(span1, "class", "label svelte-7thq00");
    			add_location(span1, file$9, 300, 5, 10968);
    			attr_dev(button, "class", "share-option flex flex-center gap-05 nowrap svelte-7thq00");
    			toggle_class(button, "is-sharing", /*userIsSharing*/ ctx[10]);
    			add_location(button, file$9, 276, 4, 10173);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, div);
    			append_dev(div, span0);
    			if_block.m(span0, null);
    			append_dev(div, t0);
    			mount_component(statusicon, div, null);
    			append_dev(button, t1);
    			append_dev(button, svg);
    			append_dev(svg, use);
    			append_dev(button, t2);
    			append_dev(button, span1);
    			append_dev(span1, t3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*shareThis*/ ctx[27], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span0, null);
    				}
    			}

    			const statusicon_changes = {};
    			if (dirty[0] & /*userIsSharing*/ 1024) statusicon_changes.loading = /*userIsSharing*/ ctx[10];
    			if (dirty[0] & /*shareWasCanceled, shareNotSupported*/ 6144) statusicon_changes.failed = /*shareWasCanceled*/ ctx[11] || /*shareNotSupported*/ ctx[12];
    			if (dirty[0] & /*shareWasSuccess*/ 8192) statusicon_changes.succeeded = /*shareWasSuccess*/ ctx[13];
    			statusicon.$set(statusicon_changes);

    			if (dirty[0] & /*userIsSharing*/ 1024) {
    				toggle_class(div, "active", /*userIsSharing*/ ctx[10]);
    			}

    			if ((!current || dirty[0] & /*$_*/ 1048576) && t3_value !== (t3_value = /*$_*/ ctx[20]('share_with') + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*userIsSharing*/ 1024) {
    				toggle_class(button, "is-sharing", /*userIsSharing*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(statusicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(statusicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			destroy_component(statusicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(276:3) {#if isSharingSupported}",
    		ctx
    	});

    	return block;
    }

    // (288:7) {:else}
    function create_else_block$5(ctx) {
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
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(288:7) {:else}",
    		ctx
    	});

    	return block;
    }

    // (286:33) 
    function create_if_block_3(ctx) {
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(286:33) ",
    		ctx
    	});

    	return block;
    }

    // (284:34) 
    function create_if_block_2$2(ctx) {
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
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(284:34) ",
    		ctx
    	});

    	return block;
    }

    // (282:7) {#if shareNotSupported}
    function create_if_block_1$2(ctx) {
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(282:7) {#if shareNotSupported}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div9;
    	let div0;
    	let div0_transition;
    	let t0;
    	let div8;
    	let button0;
    	let svg0;
    	let use0;
    	let button0_aria_label_value;
    	let t1;
    	let div1;
    	let t2;
    	let div4;
    	let div2;
    	let h1;
    	let t3_value = /*$_*/ ctx[20]('project.' + /*props*/ ctx[0].project.id) + "";
    	let t3;
    	let t4;
    	let t5;
    	let div3;
    	let show_if = Array.isArray(/*props*/ ctx[0].project.otherLinks);
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let div5;
    	let hr0;
    	let t10;
    	let t11;
    	let t12;
    	let hr1;
    	let t13;
    	let div7;
    	let button1;
    	let div6;
    	let span0;
    	let t14;
    	let statusicon;
    	let t15;
    	let svg1;
    	let use1;
    	let t16;
    	let span1;
    	let t17_value = /*$_*/ ctx[20]('copy_url') + "";
    	let t17;
    	let t18;
    	let t19;
    	let button2;
    	let svg2;
    	let use2;
    	let t20;
    	let span2;
    	let t21_value = /*$_*/ ctx[20]('close') + "";
    	let t21;
    	let div8_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*props*/ ctx[0].project.hasNoCover && create_if_block_25(ctx);
    	let if_block1 = /*props*/ ctx[0].project.usedTechnologies.length > 0 && create_if_block_22(ctx);
    	let if_block2 = show_if && create_if_block_21(ctx);
    	let if_block3 = /*props*/ ctx[0].project.codeUrl && create_if_block_20(ctx);
    	let if_block4 = /*props*/ ctx[0].project.codeUrl === null && create_if_block_19(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*props*/ ctx[0].project.projectUrl !== null && /*props*/ ctx[0].project.projectUrl !== 'COMING_SOON') return create_if_block_17;
    		if (/*props*/ ctx[0].project.projectUrl === 'COMING_SOON') return create_if_block_18;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block5 = current_block_type && current_block_type(ctx);
    	let if_block6 = !/*articleTranslationUnavailable*/ ctx[14] && (/*props*/ ctx[0].project.lang.length > 1 || /*articleHasMetaSet*/ ctx[18]) && create_if_block_9(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*articleTranslationUnavailable*/ ctx[14] && /*about*/ ctx[4] === null) return create_if_block_6;
    		if (/*about*/ ctx[4] !== null) return create_if_block_8;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block7 = current_block_type_1 && current_block_type_1(ctx);

    	function select_block_type_4(ctx, dirty) {
    		if (/*shareURLWasCanceled*/ ctx[8]) return create_if_block_4;
    		if (/*shareURLWasSuccess*/ ctx[9]) return create_if_block_5;
    		return create_else_block_1$1;
    	}

    	let current_block_type_2 = select_block_type_4(ctx);
    	let if_block8 = current_block_type_2(ctx);

    	statusicon = new StatusIcon({
    			props: {
    				loading: /*userIsSharingURL*/ ctx[7],
    				failed: /*shareURLWasCanceled*/ ctx[8],
    				succeeded: /*shareURLWasSuccess*/ ctx[9]
    			},
    			$$inline: true
    		});

    	let if_block9 = /*isSharingSupported*/ ctx[28] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div8 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			use0 = svg_element("use");
    			t1 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div4 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div3 = element("div");
    			if (if_block2) if_block2.c();
    			t6 = space();
    			if (if_block3) if_block3.c();
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			if (if_block5) if_block5.c();
    			t9 = space();
    			div5 = element("div");
    			hr0 = element("hr");
    			t10 = space();
    			if (if_block6) if_block6.c();
    			t11 = space();
    			if (if_block7) if_block7.c();
    			t12 = space();
    			hr1 = element("hr");
    			t13 = space();
    			div7 = element("div");
    			button1 = element("button");
    			div6 = element("div");
    			span0 = element("span");
    			if_block8.c();
    			t14 = space();
    			create_component(statusicon.$$.fragment);
    			t15 = space();
    			svg1 = svg_element("svg");
    			use1 = svg_element("use");
    			t16 = space();
    			span1 = element("span");
    			t17 = text(t17_value);
    			t18 = space();
    			if (if_block9) if_block9.c();
    			t19 = space();
    			button2 = element("button");
    			svg2 = svg_element("svg");
    			use2 = svg_element("use");
    			t20 = space();
    			span2 = element("span");
    			t21 = text(t21_value);
    			attr_dev(div0, "class", "background");
    			attr_dev(div0, "aria-hidden", "true");
    			add_location(div0, file$9, 1, 1, 51);
    			xlink_attr(use0, "xlink:href", "#Icon_Cross");
    			add_location(use0, file$9, 15, 4, 510);
    			attr_dev(svg0, "class", "icon svelte-7thq00");
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "focusable", "false");
    			attr_dev(svg0, "role", "presentation");
    			add_location(svg0, file$9, 14, 3, 430);
    			attr_dev(button0, "class", "close-modal flex flex-center svelte-7thq00");
    			attr_dev(button0, "aria-label", button0_aria_label_value = /*$_*/ ctx[20]('close'));
    			add_location(button0, file$9, 13, 2, 335);
    			attr_dev(div1, "class", "image-container flex flex-center block-select svelte-7thq00");
    			attr_dev(div1, "role", "img");
    			attr_dev(div1, "style", /*customGradientBG*/ ctx[15]);
    			toggle_class(div1, "no-image", /*props*/ ctx[0].project.hasNoCover);
    			toggle_class(div1, "dark-theme", /*props*/ ctx[0].project.darkThemed);
    			add_location(div1, file$9, 19, 2, 567);
    			attr_dev(h1, "class", "name svelte-7thq00");
    			add_location(h1, file$9, 64, 4, 2035);
    			attr_dev(div2, "class", "left-piece grid gap-1");
    			add_location(div2, file$9, 63, 3, 1995);
    			attr_dev(div3, "class", "right-piece flex svelte-7thq00");
    			toggle_class(div3, "single-btn", /*anyHeaderBtnActive*/ ctx[17]);
    			toggle_class(div3, "no-btn", /*noHeaderBtn*/ ctx[16]);
    			add_location(div3, file$9, 96, 3, 3081);
    			attr_dev(div4, "class", "header grid gap-2 svelte-7thq00");
    			add_location(div4, file$9, 62, 2, 1960);
    			attr_dev(hr0, "class", "seperator top svelte-7thq00");
    			add_location(hr0, file$9, 142, 3, 5175);
    			attr_dev(hr1, "class", "seperator bot svelte-7thq00");
    			add_location(hr1, file$9, 247, 3, 9272);
    			attr_dev(div5, "class", "about flex flex-col svelte-7thq00");
    			add_location(div5, file$9, 141, 2, 5138);
    			attr_dev(span0, "class", "label svelte-7thq00");
    			add_location(span0, file$9, 254, 5, 9585);
    			attr_dev(div6, "class", "status grid gap-05 grid-center-x svelte-7thq00");
    			attr_dev(div6, "role", "alert");
    			toggle_class(div6, "active", /*userIsSharingURL*/ ctx[7]);
    			add_location(div6, file$9, 253, 4, 9488);
    			xlink_attr(use1, "xlink:href", "#Icon_Chain");
    			add_location(use1, file$9, 270, 5, 10036);
    			attr_dev(svg1, "class", "icon svelte-7thq00");
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "focusable", "false");
    			attr_dev(svg1, "role", "presentation");
    			add_location(svg1, file$9, 269, 4, 9955);
    			attr_dev(span1, "class", "label svelte-7thq00");
    			add_location(span1, file$9, 272, 4, 10083);
    			attr_dev(button1, "class", "share-option flex flex-center gap-05 nowrap svelte-7thq00");
    			toggle_class(button1, "is-sharing", /*userIsSharingURL*/ ctx[7]);
    			add_location(button1, file$9, 250, 3, 9361);
    			xlink_attr(use2, "xlink:href", "#Icon_Cross");
    			add_location(use2, file$9, 306, 5, 11218);
    			attr_dev(svg2, "class", "icon svelte-7thq00");
    			attr_dev(svg2, "aria-hidden", "true");
    			attr_dev(svg2, "focusable", "false");
    			attr_dev(svg2, "role", "presentation");
    			add_location(svg2, file$9, 305, 4, 11137);
    			attr_dev(span2, "class", "label svelte-7thq00");
    			add_location(span2, file$9, 308, 4, 11265);
    			attr_dev(button2, "class", "close flex flex-center-y flex-self-right gap-1 nowrap svelte-7thq00");
    			add_location(button2, file$9, 304, 3, 11041);
    			attr_dev(div7, "class", "footer flex flex-center-y gap-05 svelte-7thq00");
    			add_location(div7, file$9, 249, 2, 9311);
    			attr_dev(div8, "id", "Project_Details_Modal");
    			attr_dev(div8, "class", "grid svelte-7thq00");
    			attr_dev(div8, "role", "article");
    			attr_dev(div8, "tabindex", "-1");
    			add_location(div8, file$9, 9, 1, 208);
    			attr_dev(div9, "class", "modal-container flex svelte-7thq00");
    			attr_dev(div9, "role", "generic");
    			add_location(div9, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div0);
    			append_dev(div9, t0);
    			append_dev(div9, div8);
    			append_dev(div8, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, use0);
    			append_dev(div8, t1);
    			append_dev(div8, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div8, t2);
    			append_dev(div8, div4);
    			append_dev(div4, div2);
    			append_dev(div2, h1);
    			append_dev(h1, t3);
    			append_dev(div2, t4);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div3, t6);
    			if (if_block3) if_block3.m(div3, null);
    			append_dev(div3, t7);
    			if (if_block4) if_block4.m(div3, null);
    			append_dev(div3, t8);
    			if (if_block5) if_block5.m(div3, null);
    			append_dev(div8, t9);
    			append_dev(div8, div5);
    			append_dev(div5, hr0);
    			append_dev(div5, t10);
    			if (if_block6) if_block6.m(div5, null);
    			append_dev(div5, t11);
    			if (if_block7) if_block7.m(div5, null);
    			append_dev(div5, t12);
    			append_dev(div5, hr1);
    			append_dev(div8, t13);
    			append_dev(div8, div7);
    			append_dev(div7, button1);
    			append_dev(button1, div6);
    			append_dev(div6, span0);
    			if_block8.m(span0, null);
    			append_dev(div6, t14);
    			mount_component(statusicon, div6, null);
    			append_dev(button1, t15);
    			append_dev(button1, svg1);
    			append_dev(svg1, use1);
    			append_dev(button1, t16);
    			append_dev(button1, span1);
    			append_dev(span1, t17);
    			append_dev(div7, t18);
    			if (if_block9) if_block9.m(div7, null);
    			append_dev(div7, t19);
    			append_dev(div7, button2);
    			append_dev(button2, svg2);
    			append_dev(svg2, use2);
    			append_dev(button2, t20);
    			append_dev(button2, span2);
    			append_dev(span2, t21);
    			/*div8_binding*/ ctx[33](div8);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1$1, "hashchange", /*closeThis*/ ctx[22], false, false, false),
    					listen_dev(window_1$1, "popstate", /*closeThis*/ ctx[22], false, false, false),
    					listen_dev(div0, "click", /*click_handler*/ ctx[30], false, false, false),
    					listen_dev(button0, "click", /*closeThis*/ ctx[22], false, false, false),
    					listen_dev(button1, "click", /*shareURL*/ ctx[26], false, false, false),
    					listen_dev(button2, "click", /*closeThis*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*$_*/ 1048576 && button0_aria_label_value !== (button0_aria_label_value = /*$_*/ ctx[20]('close'))) {
    				attr_dev(button0, "aria-label", button0_aria_label_value);
    			}

    			if (!/*props*/ ctx[0].project.hasNoCover) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_25(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty[0] & /*customGradientBG*/ 32768) {
    				attr_dev(div1, "style", /*customGradientBG*/ ctx[15]);
    			}

    			if (dirty[0] & /*props*/ 1) {
    				toggle_class(div1, "no-image", /*props*/ ctx[0].project.hasNoCover);
    			}

    			if (dirty[0] & /*props*/ 1) {
    				toggle_class(div1, "dark-theme", /*props*/ ctx[0].project.darkThemed);
    			}

    			if ((!current || dirty[0] & /*$_, props*/ 1048577) && t3_value !== (t3_value = /*$_*/ ctx[20]('project.' + /*props*/ ctx[0].project.id) + "")) set_data_dev(t3, t3_value);

    			if (/*props*/ ctx[0].project.usedTechnologies.length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_22(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*props*/ 1) show_if = Array.isArray(/*props*/ ctx[0].project.otherLinks);

    			if (show_if) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_21(ctx);
    					if_block2.c();
    					if_block2.m(div3, t6);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*props*/ ctx[0].project.codeUrl) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_20(ctx);
    					if_block3.c();
    					if_block3.m(div3, t7);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*props*/ ctx[0].project.codeUrl === null) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_19(ctx);
    					if_block4.c();
    					if_block4.m(div3, t8);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block5) {
    				if_block5.p(ctx, dirty);
    			} else {
    				if (if_block5) if_block5.d(1);
    				if_block5 = current_block_type && current_block_type(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(div3, null);
    				}
    			}

    			if (dirty[0] & /*anyHeaderBtnActive*/ 131072) {
    				toggle_class(div3, "single-btn", /*anyHeaderBtnActive*/ ctx[17]);
    			}

    			if (dirty[0] & /*noHeaderBtn*/ 65536) {
    				toggle_class(div3, "no-btn", /*noHeaderBtn*/ ctx[16]);
    			}

    			if (!/*articleTranslationUnavailable*/ ctx[14] && (/*props*/ ctx[0].project.lang.length > 1 || /*articleHasMetaSet*/ ctx[18])) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty[0] & /*articleTranslationUnavailable, props, articleHasMetaSet*/ 278529) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_9(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div5, t11);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block7) {
    				if_block7.p(ctx, dirty);
    			} else {
    				if (if_block7) if_block7.d(1);
    				if_block7 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block7) {
    					if_block7.c();
    					if_block7.m(div5, t12);
    				}
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_4(ctx)) && if_block8) {
    				if_block8.p(ctx, dirty);
    			} else {
    				if_block8.d(1);
    				if_block8 = current_block_type_2(ctx);

    				if (if_block8) {
    					if_block8.c();
    					if_block8.m(span0, null);
    				}
    			}

    			const statusicon_changes = {};
    			if (dirty[0] & /*userIsSharingURL*/ 128) statusicon_changes.loading = /*userIsSharingURL*/ ctx[7];
    			if (dirty[0] & /*shareURLWasCanceled*/ 256) statusicon_changes.failed = /*shareURLWasCanceled*/ ctx[8];
    			if (dirty[0] & /*shareURLWasSuccess*/ 512) statusicon_changes.succeeded = /*shareURLWasSuccess*/ ctx[9];
    			statusicon.$set(statusicon_changes);

    			if (dirty[0] & /*userIsSharingURL*/ 128) {
    				toggle_class(div6, "active", /*userIsSharingURL*/ ctx[7]);
    			}

    			if ((!current || dirty[0] & /*$_*/ 1048576) && t17_value !== (t17_value = /*$_*/ ctx[20]('copy_url') + "")) set_data_dev(t17, t17_value);

    			if (dirty[0] & /*userIsSharingURL*/ 128) {
    				toggle_class(button1, "is-sharing", /*userIsSharingURL*/ ctx[7]);
    			}

    			if (/*isSharingSupported*/ ctx[28]) if_block9.p(ctx, dirty);
    			if ((!current || dirty[0] & /*$_*/ 1048576) && t21_value !== (t21_value = /*$_*/ ctx[20]('close') + "")) set_data_dev(t21, t21_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, modalBgTransition, { duration: 600 }, true);
    				div0_transition.run(1);
    			});

    			transition_in(if_block6);
    			transition_in(statusicon.$$.fragment, local);
    			transition_in(if_block9);

    			add_render_callback(() => {
    				if (!div8_transition) div8_transition = create_bidirectional_transition(div8, projectModalAnim, {}, true);
    				div8_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, modalBgTransition, { duration: 600 }, false);
    			div0_transition.run(0);
    			transition_out(if_block6);
    			transition_out(statusicon.$$.fragment, local);
    			transition_out(if_block9);
    			if (!div8_transition) div8_transition = create_bidirectional_transition(div8, projectModalAnim, {}, false);
    			div8_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (detaching && div0_transition) div0_transition.end();
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();

    			if (if_block5) {
    				if_block5.d();
    			}

    			if (if_block6) if_block6.d();

    			if (if_block7) {
    				if_block7.d();
    			}

    			if_block8.d();
    			destroy_component(statusicon);
    			if (if_block9) if_block9.d();
    			/*div8_binding*/ ctx[33](null);
    			if (detaching && div8_transition) div8_transition.end();
    			mounted = false;
    			run_all(dispose);
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
    	let _thumbSrc;
    	let articleHasMetaSet;
    	let anyHeaderBtnActive;
    	let noHeaderBtn;
    	let customGradientBG;
    	let articleTranslationUnavailable;
    	let $_;
    	let $i18n;
    	let $appState;
    	let $_date;
    	validate_store(Y, '_');
    	component_subscribe($$self, Y, $$value => $$invalidate(20, $_ = $$value));
    	validate_store(i18n, 'i18n');
    	component_subscribe($$self, i18n, $$value => $$invalidate(35, $i18n = $$value));
    	validate_store(appState, 'appState');
    	component_subscribe($$self, appState, $$value => $$invalidate(29, $appState = $$value));
    	validate_store(ne, '_date');
    	component_subscribe($$self, ne, $$value => $$invalidate(21, $_date = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Project', slots, []);
    	var _a;
    	const dispatch = createEventDispatcher();

    	function closeThis() {
    		vibrate();
    		dispatch('close');
    	}

    	let { props } = $$props;
    	let { escapable } = $$props;
    	let thisEl;
    	const thumbSrc = `projects/${props.project.id}/thumbnail.jpg`;
    	const coverSrc = `projects/${props.project.id}/cover.png`;
    	const thumbDarkSrc = `projects/${props.project.id}/thumbnail_dark.jpg`;
    	const coverDarkSrc = `projects/${props.project.id}/cover_dark.png`;
    	let about = null;
    	let loadedTranslation = $i18n;

    	async function fetchArticle(lang) {
    		$$invalidate(4, about = null);

    		$$invalidate(4, about = new Promise(async (resolve, reject) => {
    				try {
    					if (!LanguageList.includes(lang)) {
    						throw new Error(`invalid language (${lang}) provided`);
    					}

    					const resp = await fetch(`projects/${props.project.id}/article/${lang}.md`);

    					if (resp.status !== 200) {
    						throw new Error('404');
    					}

    					const rtf = marked.parse(await resp.text(), { smartLists: true });
    					$$invalidate(2, loadedTranslation = lang);

    					setTimeout(() => {
    						for (const link of document.querySelectorAll('.rtf-content a')) {
    							link.setAttribute('target', '_blank');
    						}
    					});

    					resolve(rtf);
    				} catch(err) {
    					setTimeout(() => reject(err), 1e3);
    				}
    			}));
    	}

    	let isSelectingTranslation = false;

    	function toggleTranslationSelection() {
    		$$invalidate(5, isSelectingTranslation = !isSelectingTranslation);
    	}

    	function selectDifferentTranslation(lang) {
    		$$invalidate(5, isSelectingTranslation = false);
    		fetchArticle(lang);
    	}

    	let lazyLoader;

    	function loadCoverImg() {
    		if (!props.project.hasNoCover) {
    			if (props.project.darkThemed && $appState.a11y.isDarkTheme) {
    				$$invalidate(6, lazyLoader = lazyLoad(coverDarkSrc));
    			} else {
    				$$invalidate(6, lazyLoader = lazyLoad(coverSrc));
    			}
    		}
    	}

    	colorSchemaMediaQuery.addEventListener('change', loadCoverImg);

    	onMount(() => {
    		dispatch('mounted', thisEl);

    		setQuery(
    			'project',
    			props.project.id,
    			{
    				'project_id': props.project.id,
    				'title': $_('project.' + props.project.id)
    			},
    			$_('project.' + props.project.id)
    		);

    		if (props.project.lang.length > 0 && !articleTranslationUnavailable) {
    			fetchArticle($i18n);
    		}

    		loadCoverImg();
    	});

    	onDestroy(function () {
    		removeQuery('project');
    		colorSchemaMediaQuery.removeEventListener('change', loadCoverImg);
    	});

    	let userIsSharingURL = false;
    	let shareURLWasCanceled = false;
    	let shareURLWasSuccess = false;

    	async function shareURL() {
    		var _a;

    		if (userIsSharingURL) {
    			return;
    		}

    		$$invalidate(8, shareURLWasCanceled = false);
    		$$invalidate(9, shareURLWasSuccess = false);
    		shareThisReset();

    		if ((_a = window.location) === null || _a === void 0
    		? void 0
    		: _a.href) {
    			$$invalidate(7, userIsSharingURL = true);
    			vibrate();

    			if (await copyToClipboard(window.location.href)) {
    				vibrate([0, 500, 200, 100, 50]);

    				setTimeout(() => {
    					$$invalidate(9, shareURLWasSuccess = true);
    					setTimeout(shareURLReset, 2000);
    				});
    			} else {
    				vibrate([0, 500, 100, 50, 100]);

    				setTimeout(() => {
    					$$invalidate(8, shareURLWasCanceled = true);
    					setTimeout(shareURLReset, 2000);
    				});
    			}
    		} else {
    			vibrate([0, 500, 100, 50, 100, 200, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
    			$$invalidate(7, userIsSharingURL = true);

    			setTimeout(() => {
    				$$invalidate(8, shareURLWasCanceled = true);
    				setTimeout(shareURLReset, 2000);
    			});
    		}
    	}

    	function shareURLReset() {
    		$$invalidate(7, userIsSharingURL = false);

    		setTimeout(() => {
    			$$invalidate(8, shareURLWasCanceled = false);
    			$$invalidate(9, shareURLWasSuccess = false);
    		});
    	}

    	let userIsSharing = false;
    	let shareWasCanceled = false;
    	let shareNotSupported = false;
    	let shareWasSuccess = false;

    	async function shareThis() {
    		var _a, _b;

    		if (userIsSharing) {
    			return;
    		}

    		$$invalidate(11, shareWasCanceled = false);
    		$$invalidate(13, shareWasSuccess = false);
    		shareURLReset();

    		if (((_a = window.navigator) === null || _a === void 0
    		? void 0
    		: _a.share) && ((_b = window.location) === null || _b === void 0
    		? void 0
    		: _b.href)) {
    			vibrate();
    			$$invalidate(10, userIsSharing = true);

    			try {
    				await navigator.share({
    					title: $_('a_project_by', {
    						values: {
    							'name': $_('project.' + props.project.id)
    						}
    					}),
    					url: window.location.href
    				});

    				vibrate([0, 500, 200, 100, 50]);

    				setTimeout(() => {
    					$$invalidate(13, shareWasSuccess = true);
    					setTimeout(shareThisReset, 2000);
    				});
    			} catch(err) {
    				vibrate([0, 500, 100, 50, 100]);

    				setTimeout(() => {
    					$$invalidate(11, shareWasCanceled = true);
    					setTimeout(shareThisReset, 2000);
    				});
    			}
    		} else {
    			vibrate([0, 500, 100, 50, 100, 200, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
    			$$invalidate(10, userIsSharing = true);

    			setTimeout(() => {
    				$$invalidate(12, shareNotSupported = true);
    				setTimeout(shareThisReset, 3000);
    			});
    		}
    	}

    	function shareThisReset() {
    		$$invalidate(10, userIsSharing = false);

    		setTimeout(() => {
    			$$invalidate(11, shareWasCanceled = false);
    			$$invalidate(12, shareNotSupported = false);
    			$$invalidate(13, shareWasSuccess = false);
    		});
    	}

    	const isSharingSupported = ((_a = window.navigator) === null || _a === void 0
    	? void 0
    	: _a.share) !== undefined;

    	const writable_props = ['props', 'escapable'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		if (escapable) {
    			closeThis();
    		}
    	};

    	const click_handler_1 = lang => selectDifferentTranslation(lang);
    	const click_handler_2 = lang => fetchArticle(lang);

    	function div8_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			thisEl = $$value;
    			$$invalidate(3, thisEl);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('props' in $$props) $$invalidate(0, props = $$props.props);
    		if ('escapable' in $$props) $$invalidate(1, escapable = $$props.escapable);
    	};

    	$$self.$capture_state = () => ({
    		_a,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		dispatch,
    		technologies,
    		marked,
    		appState,
    		colorSchemaMediaQuery,
    		vibrate,
    		vibrateLink,
    		copyToClipboard,
    		StatusIcon,
    		_: Y,
    		_date: ne,
    		projectModalAnim,
    		modalBgTransition,
    		disclosureTransition,
    		i18n,
    		Language,
    		LanguageFullName,
    		LanguageList,
    		lazyLoad,
    		removeQuery,
    		setQuery,
    		closeThis,
    		props,
    		escapable,
    		thisEl,
    		thumbSrc,
    		coverSrc,
    		thumbDarkSrc,
    		coverDarkSrc,
    		about,
    		loadedTranslation,
    		fetchArticle,
    		isSelectingTranslation,
    		toggleTranslationSelection,
    		selectDifferentTranslation,
    		lazyLoader,
    		loadCoverImg,
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
    		isSharingSupported,
    		articleTranslationUnavailable,
    		customGradientBG,
    		noHeaderBtn,
    		anyHeaderBtnActive,
    		articleHasMetaSet,
    		_thumbSrc,
    		$_,
    		$i18n,
    		$appState,
    		$_date
    	});

    	$$self.$inject_state = $$props => {
    		if ('_a' in $$props) _a = $$props._a;
    		if ('props' in $$props) $$invalidate(0, props = $$props.props);
    		if ('escapable' in $$props) $$invalidate(1, escapable = $$props.escapable);
    		if ('thisEl' in $$props) $$invalidate(3, thisEl = $$props.thisEl);
    		if ('about' in $$props) $$invalidate(4, about = $$props.about);
    		if ('loadedTranslation' in $$props) $$invalidate(2, loadedTranslation = $$props.loadedTranslation);
    		if ('isSelectingTranslation' in $$props) $$invalidate(5, isSelectingTranslation = $$props.isSelectingTranslation);
    		if ('lazyLoader' in $$props) $$invalidate(6, lazyLoader = $$props.lazyLoader);
    		if ('userIsSharingURL' in $$props) $$invalidate(7, userIsSharingURL = $$props.userIsSharingURL);
    		if ('shareURLWasCanceled' in $$props) $$invalidate(8, shareURLWasCanceled = $$props.shareURLWasCanceled);
    		if ('shareURLWasSuccess' in $$props) $$invalidate(9, shareURLWasSuccess = $$props.shareURLWasSuccess);
    		if ('userIsSharing' in $$props) $$invalidate(10, userIsSharing = $$props.userIsSharing);
    		if ('shareWasCanceled' in $$props) $$invalidate(11, shareWasCanceled = $$props.shareWasCanceled);
    		if ('shareNotSupported' in $$props) $$invalidate(12, shareNotSupported = $$props.shareNotSupported);
    		if ('shareWasSuccess' in $$props) $$invalidate(13, shareWasSuccess = $$props.shareWasSuccess);
    		if ('articleTranslationUnavailable' in $$props) $$invalidate(14, articleTranslationUnavailable = $$props.articleTranslationUnavailable);
    		if ('customGradientBG' in $$props) $$invalidate(15, customGradientBG = $$props.customGradientBG);
    		if ('noHeaderBtn' in $$props) $$invalidate(16, noHeaderBtn = $$props.noHeaderBtn);
    		if ('anyHeaderBtnActive' in $$props) $$invalidate(17, anyHeaderBtnActive = $$props.anyHeaderBtnActive);
    		if ('articleHasMetaSet' in $$props) $$invalidate(18, articleHasMetaSet = $$props.articleHasMetaSet);
    		if ('_thumbSrc' in $$props) $$invalidate(19, _thumbSrc = $$props._thumbSrc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$appState, props*/ 536870913) {
    			$$invalidate(19, _thumbSrc = $appState.a11y.isDarkTheme && props.project.darkThemed
    			? thumbDarkSrc
    			: thumbSrc);
    		}

    		if ($$self.$$.dirty[0] & /*props*/ 1) {
    			$$invalidate(18, articleHasMetaSet = props.project.articleWritten !== undefined || props.project.prjImpl !== undefined || props.project.prjUpdt !== undefined);
    		}

    		if ($$self.$$.dirty[0] & /*props*/ 1) {
    			$$invalidate(17, anyHeaderBtnActive = props.project.codeUrl !== undefined && props.project.projectUrl === undefined || props.project.codeUrl === undefined && props.project.projectUrl !== undefined);
    		}

    		if ($$self.$$.dirty[0] & /*props*/ 1) {
    			$$invalidate(16, noHeaderBtn = props.project.codeUrl === undefined && props.project.projectUrl === null);
    		}

    		if ($$self.$$.dirty[0] & /*props*/ 1) {
    			$$invalidate(15, customGradientBG = Array.isArray(props.project.gradient)
    			? `background: -webkit-linear-gradient(125deg, ${props.project.gradient.join(',')});` + `background: linear-gradient(125deg, ${props.project.gradient.join(',')});`
    			: '');
    		}

    		if ($$self.$$.dirty[0] & /*props, loadedTranslation*/ 5) {
    			$$invalidate(14, articleTranslationUnavailable = props.project.lang.indexOf(loadedTranslation) === -1);
    		}
    	};

    	return [
    		props,
    		escapable,
    		loadedTranslation,
    		thisEl,
    		about,
    		isSelectingTranslation,
    		lazyLoader,
    		userIsSharingURL,
    		shareURLWasCanceled,
    		shareURLWasSuccess,
    		userIsSharing,
    		shareWasCanceled,
    		shareNotSupported,
    		shareWasSuccess,
    		articleTranslationUnavailable,
    		customGradientBG,
    		noHeaderBtn,
    		anyHeaderBtnActive,
    		articleHasMetaSet,
    		_thumbSrc,
    		$_,
    		$_date,
    		closeThis,
    		fetchArticle,
    		toggleTranslationSelection,
    		selectDifferentTranslation,
    		shareURL,
    		shareThis,
    		isSharingSupported,
    		$appState,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		div8_binding
    	];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { props: 0, escapable: 1 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*props*/ ctx[0] === undefined && !('props' in props)) {
    			console.warn("<Project> was created without expected prop 'props'");
    		}

    		if (/*escapable*/ ctx[1] === undefined && !('escapable' in props)) {
    			console.warn("<Project> was created without expected prop 'escapable'");
    		}
    	}

    	get props() {
    		throw new Error_1$2("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error_1$2("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get escapable() {
    		throw new Error_1$2("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set escapable(value) {
    		throw new Error_1$2("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/modals/BigPicture.svelte generated by Svelte v3.49.0 */
    const file$8 = "src/components/modals/BigPicture.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let div0;
    	let div0_transition;
    	let t;
    	let img;
    	let img_intro;
    	let img_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			img = element("img");
    			attr_dev(div0, "class", "background svelte-4gavhg");
    			add_location(div0, file$8, 1, 1, 48);
    			attr_dev(img, "alt", "Daniel Scharkov");
    			attr_dev(img, "class", "svelte-4gavhg");
    			add_location(img, file$8, 6, 1, 166);
    			attr_dev(div1, "class", "modal-container flex flex-center svelte-4gavhg");
    			add_location(div1, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			append_dev(div1, img);
    			/*img_binding*/ ctx[4](img);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false),
    					action_destroyer(lazyLoadAction.call(null, img, {
    						thumb: 'me-myself-and-i-thumb.jpg',
    						source: 'me-myself-and-i.jpg'
    					}))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, modalBgTransition, { duration: 400 }, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (img_outro) img_outro.end(1);
    				img_intro = create_in_transition(img, /*bigPicTransition*/ ctx[2], { isOut: false });
    				img_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, modalBgTransition, { duration: 400 }, false);
    			div0_transition.run(0);
    			if (img_intro) img_intro.invalidate();
    			img_outro = create_out_transition(img, /*bigPicTransition*/ ctx[2], { isOut: true });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div0_transition) div0_transition.end();
    			/*img_binding*/ ctx[4](null);
    			if (detaching && img_outro) img_outro.end();
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
    	validate_slots('BigPicture', slots, []);
    	const dispatch = createEventDispatcher();
    	const displayDesktop = window.matchMedia('screen and (min-width: 600px)');
    	let thisEl;

    	onMount(() => {
    		dispatch('mounted', thisEl);
    	});

    	function bigPicTransition(_, { isOut }) {
    		const duration = !appState.$().a11y.reducedMotion && 500;
    		const easing = isOut ? cubicIn : cubicOut;

    		if (displayDesktop.matches) {
    			return {
    				duration,
    				css(t) {
    					t = easing(t);
    					return `opacity: ${t};` + `transform: ` + `scale(${.8 + .2 * t}) ` + `translate(-${10 - 10 * t}em, -${2 - 2 * t}em);`;
    				}
    			};
    		}

    		return {
    			duration,
    			css(t) {
    				t = easing(t);
    				return `opacity: ${t};` + `transform: scale(${.75 + .25 * t}) translateY(-${5 - 5 * t}em);`;
    			}
    		};
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BigPicture> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		dispatch('close');
    	};

    	function img_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			thisEl = $$value;
    			$$invalidate(0, thisEl);
    		});
    	}

    	$$self.$capture_state = () => ({
    		modalBgTransition,
    		lazyLoadAction,
    		createEventDispatcher,
    		onMount,
    		cubicIn,
    		cubicOut,
    		appState,
    		dispatch,
    		displayDesktop,
    		thisEl,
    		bigPicTransition
    	});

    	$$self.$inject_state = $$props => {
    		if ('thisEl' in $$props) $$invalidate(0, thisEl = $$props.thisEl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [thisEl, dispatch, bigPicTransition, click_handler, img_binding];
    }

    class BigPicture extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BigPicture",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/Modals.svelte generated by Svelte v3.49.0 */

    const { Error: Error_1$1 } = globals;
    const file$7 = "src/components/Modals.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (82:1) {#each $thisStore as modal (modal.id)}
    function create_each_block$5(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	function close_handler() {
    		return /*close_handler*/ ctx[1](/*modal*/ ctx[3]);
    	}

    	function mounted_handler(...args) {
    		return /*mounted_handler*/ ctx[2](/*modal*/ ctx[3], ...args);
    	}

    	var switch_value = _modalComponent[/*modal*/ ctx[3].name];

    	function switch_props(ctx) {
    		return {
    			props: {
    				openModal,
    				escapable: /*modal*/ ctx[3].escapable,
    				props: /*modal*/ ctx[3].props
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("close", once(close_handler));
    		switch_instance.$on("mounted", once(mounted_handler));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty & /*$thisStore*/ 1) switch_instance_changes.escapable = /*modal*/ ctx[3].escapable;
    			if (dirty & /*$thisStore*/ 1) switch_instance_changes.props = /*modal*/ ctx[3].props;

    			if (switch_value !== (switch_value = _modalComponent[/*modal*/ ctx[3].name])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("close", once(close_handler));
    					switch_instance.$on("mounted", once(mounted_handler));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(82:1) {#each $thisStore as modal (modal.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_aria_hidden_value;
    	let current;
    	let each_value = /*$thisStore*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*modal*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "AppModals");
    			attr_dev(div, "role", "generic");
    			attr_dev(div, "aria-hidden", div_aria_hidden_value = /*$thisStore*/ ctx[0].length < 1);
    			attr_dev(div, "class", "svelte-501p9e");
    			toggle_class(div, "active", /*$thisStore*/ ctx[0].length > 0);
    			add_location(div, file$7, 80, 0, 2574);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*_modalComponent, $thisStore, openModal, closeModal, _modalMounted*/ 1) {
    				each_value = /*$thisStore*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
    				check_outros();
    			}

    			if (!current || dirty & /*$thisStore*/ 1 && div_aria_hidden_value !== (div_aria_hidden_value = /*$thisStore*/ ctx[0].length < 1)) {
    				attr_dev(div, "aria-hidden", div_aria_hidden_value);
    			}

    			if (dirty & /*$thisStore*/ 1) {
    				toggle_class(div, "active", /*$thisStore*/ ctx[0].length > 0);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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

    const _modalComponent = {
    	bigPicture: BigPicture,
    	project: Project,
    	socialMedia: SocialMedia
    };

    const thisStore$1 = writable([]);
    let _modalLastFocus = document.activeElement;
    let _modalResolver = {};

    function openModal({ name, props = null, escapable = true }) {
    	let resolve;

    	const promise = new Promise(r => {
    			resolve = r;
    		});

    	thisStore$1.update($ => {
    		_modalLastFocus = document.activeElement;

    		if (name in _modalComponent) {
    			const id = randID();
    			$.push({ id, name, props, escapable });
    			lockScroll(id);

    			const actionID = stackAction(function () {
    				if (escapable) {
    					closeModal(id);
    				}
    			});

    			_modalResolver[id] = {
    				actionID,
    				resolve,
    				releaseFocusRestriction: null
    			};
    		} else {
    			throw new Error(`no modal registered by name "${name}"`);
    		}

    		return $;
    	});

    	return promise;
    }

    function closeModal(id) {
    	if (!(id in _modalResolver)) {
    		throw new Error(`closeModal: provided ID not existing`);
    	}

    	unlockScroll(id);
    	resolveAction(_modalResolver[id].actionID);

    	thisStore$1.update($ => {
    		const idx = $.findIndex(modal => modal.id === id);
    		_modalResolver[id].releaseFocusRestriction();
    		_modalResolver[id].resolve();
    		delete _modalResolver[id];
    		$.splice(idx, 1);

    		if ($.length < 1) {
    			_modalLastFocus.focus();
    		}

    		return $;
    	});
    }

    function closeAllModals() {
    	thisStore$1.update($ => {
    		for (let idx = 0; idx < $.length; idx++) {
    			unlockScroll($[idx].id);
    			resolveAction(_modalResolver[$[idx].id].actionID);
    			_modalResolver[$[idx].id].releaseFocusRestriction();
    			_modalResolver[$[idx].id].resolve();
    		}

    		_modalResolver = {};
    		$ = [];
    		_modalLastFocus.focus();
    		return $;
    	});
    }

    function _modalMounted(id, el) {
    	_modalResolver[id].releaseFocusRestriction = restrictFocus(el);
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $thisStore;
    	validate_store(thisStore$1, 'thisStore');
    	component_subscribe($$self, thisStore$1, $$value => $$invalidate(0, $thisStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modals', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modals> was created with unknown prop '${key}'`);
    	});

    	const close_handler = modal => closeModal(modal.id);
    	const mounted_handler = (modal, { detail: el }) => _modalMounted(modal.id, el);

    	$$self.$capture_state = () => ({
    		writable,
    		randID,
    		lockScroll,
    		unlockScroll,
    		stackAction,
    		resolveAction,
    		restrictFocus,
    		Modal_BigPicture: BigPicture,
    		Modal_Project: Project,
    		Modal_SocialMedia: SocialMedia,
    		_modalComponent,
    		thisStore: thisStore$1,
    		_modalLastFocus,
    		_modalResolver,
    		openModal,
    		closeModal,
    		closeAllModals,
    		_modalMounted,
    		$thisStore
    	});

    	return [$thisStore, close_handler, mounted_handler];
    }

    class Modals extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modals",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/sections/Landing.svelte generated by Svelte v3.49.0 */
    const file$6 = "src/sections/Landing.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i].name;
    	child_ctx[7] = list[i].app;
    	child_ctx[8] = list[i].url;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (105:5) {#each professions as pfsn, idx}
    function create_each_block_1$2(ctx) {
    	let span;
    	let t0_value = /*$_*/ ctx[1]('section.landing.profession.' + /*pfsn*/ ctx[11]) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "profession flex flex-center-y svelte-1966cld");
    			set_style(span, "animation-delay", 50 + /*idx*/ ctx[10] * 100 + "ms");
    			add_location(span, file$6, 105, 6, 5911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 2 && t0_value !== (t0_value = /*$_*/ ctx[1]('section.landing.profession.' + /*pfsn*/ ctx[11]) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(105:5) {#each professions as pfsn, idx}",
    		ctx
    	});

    	return block;
    }

    // (124:6) {:else}
    function create_else_block$4(ctx) {
    	let a;
    	let svg;
    	let title;
    	let t0_value = /*name*/ ctx[6] + "";
    	let t0;
    	let use;
    	let t1;
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
    			add_location(title, file$6, 129, 9, 6940);
    			xlink_attr(use, "xlink:href", "#Logo_" + /*name*/ ctx[6]);
    			add_location(use, file$6, 130, 9, 6972);
    			attr_dev(svg, "class", "logo icon-15 svelte-1966cld");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$6, 128, 8, 6846);
    			attr_dev(a, "href", /*url*/ ctx[8]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "role", "listitem");
    			attr_dev(a, "class", "btn flex flex-center svelte-1966cld");
    			set_style(a, "animation-delay", 50 + /*idx*/ ctx[10] * 100 + "ms");
    			add_location(a, file$6, 124, 7, 6677);
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
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(124:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (114:6) {#if app}
    function create_if_block$4(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = /*name*/ ctx[6] + "";
    	let t0;
    	let use;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*name*/ ctx[6], /*url*/ ctx[8], /*app*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			use = svg_element("use");
    			t1 = space();
    			add_location(title, file$6, 119, 9, 6555);
    			xlink_attr(use, "xlink:href", "#Logo_" + /*name*/ ctx[6]);
    			add_location(use, file$6, 120, 9, 6587);
    			attr_dev(svg, "class", "icon icon-15 svelte-1966cld");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$6, 118, 8, 6461);
    			attr_dev(button, "role", "listitem");
    			attr_dev(button, "class", "btn flex flex-center svelte-1966cld");
    			set_style(button, "animation-delay", 50 + /*idx*/ ctx[10] * 100 + "ms");
    			add_location(button, file$6, 114, 7, 6256);
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
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(114:6) {#if app}",
    		ctx
    	});

    	return block;
    }

    // (113:5) {#each socialMedia as {name, app, url}
    function create_each_block$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*app*/ ctx[7]) return create_if_block$4;
    		return create_else_block$4;
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(113:5) {#each socialMedia as {name, app, url}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
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
    	let div4;
    	let div3;
    	let button;
    	let img;
    	let img_alt_value;
    	let t1;
    	let div2;
    	let h1;
    	let t2_value = /*$_*/ ctx[1]('my_name') + "";
    	let t2;
    	let t3;
    	let div0;
    	let t4;
    	let div1;
    	let t5;
    	let p;
    	let t6_value = /*$_*/ ctx[1]('about_me') + "";
    	let t6;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*professions*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = socialMedia;
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
    			div4 = element("div");
    			div3 = element("div");
    			button = element("button");
    			img = element("img");
    			t1 = space();
    			div2 = element("div");
    			h1 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			p = element("p");
    			t6 = text(t6_value);
    			attr_dev(path0, "d", "M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z");
    			attr_dev(path0, "fill", "url(#code_bg)");
    			add_location(path0, file$6, 25, 2, 960);
    			attr_dev(path1, "d", "M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z");
    			attr_dev(path1, "fill", "url(#code_bg_image)");
    			add_location(path1, file$6, 26, 2, 1197);
    			attr_dev(path2, "d", "M91.5 0C91.5 0 86.1631 7.06026 88.1214 14.9719C86.7321 6.79253 97.7283 0 97.7283 0H91.5Z");
    			attr_dev(path2, "fill", "url(#code_bg_4fh89hn3)");
    			add_location(path2, file$6, 28, 3, 1463);
    			attr_dev(path3, "d", "M94.8513 46.0436C95.3713 44.2961 96.1324 42.4256 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304C90.2987 19.645 89.8082 18.9873 89.4106 18.3337C89.4399 18.3891 89.4697 18.4446 89.5 18.5C91.3067 21.8122 92.796 24.0364 93.9407 25.7459C96.5975 29.7138 97.3978 30.9089 96 36.5C95.1652 39.8391 94.8114 43.0208 94.8513 46.0436Z");
    			attr_dev(path3, "fill", "url(#code_bg_um0uf8e3)");
    			add_location(path3, file$6, 29, 3, 1598);
    			attr_dev(g0, "opacity", "0.25");
    			add_location(g0, file$6, 27, 2, 1440);
    			attr_dev(path4, "d", "M95 0C95 0 83.6728 8.40057 89.1794 17.9354C83.9654 8.50155 97.7283 0 97.7283 0H95Z");
    			attr_dev(path4, "fill", "url(#code_bg_4870n8fd)");
    			add_location(path4, file$6, 32, 3, 2010);
    			attr_dev(path5, "d", "M128 87.8149C128 87.8149 103.765 89.4978 95.2574 82.7149C103.903 97.6885 128 87.8149 128 87.8149Z");
    			attr_dev(path5, "fill", "url(#code_bg_u09fjdkm)");
    			add_location(path5, file$6, 33, 3, 2139);
    			attr_dev(path6, "d", "M92.6529 74.9318C92.8084 74.3456 93.0253 73.7335 93.308 73.0945C95.6407 67.8214 95.053 63.6313 94.44 59.2609C94.2624 57.9946 94.0826 56.7131 93.9712 55.3858C93.3331 57.739 92.8055 60.4069 92.5 63.5C92.0587 67.9679 92.1469 71.7458 92.6529 74.9318Z");
    			attr_dev(path6, "fill", "url(#code_bg_0dn09kmd)");
    			add_location(path6, file$6, 34, 3, 2283);
    			attr_dev(path7, "d", "M94.8756 25.2082C93.8007 23.6916 92.4808 22.0656 90.8928 20.304C92.4505 22.0844 93.7686 23.7098 94.8756 25.2082Z");
    			attr_dev(path7, "fill", "url(#code_bg_mlfu93jf)");
    			add_location(path7, file$6, 35, 3, 2576);
    			attr_dev(g1, "opacity", "0.75");
    			add_location(g1, file$6, 31, 2, 1987);
    			attr_dev(path8, "d", "M90.8928 20.304C81.5811 9.97438 97.7283 0 97.7283 0H128V87.8149C128 87.8149 85.4901 90.7668 93.308 73.0945C98.4599 61.4487 89.367 55.0853 97.217 40.3962C100.149 34.9103 99.1144 29.4244 90.8928 20.304Z");
    			attr_dev(path8, "fill", "url(#code_bg_rainbow)");
    			attr_dev(path8, "fill-opacity", "0.15");
    			add_location(path8, file$6, 37, 2, 2742);
    			attr_dev(image, "id", "image0");
    			attr_dev(image, "width", "1024");
    			attr_dev(image, "height", "2146");
    			attr_dev(image, "transform", "translate(-0.0478835) scale(0.00102516 0.000465983)");
    			add_location(image, file$6, 40, 4, 3113);
    			attr_dev(pattern, "id", "code_bg_image");
    			attr_dev(pattern, "patternContentUnits", "objectBoundingBox");
    			attr_dev(pattern, "width", "1");
    			attr_dev(pattern, "height", "1");
    			add_location(pattern, file$6, 39, 3, 3018);
    			add_location(stop0, file$6, 46, 4, 3462);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#403828");
    			add_location(stop1, file$6, 46, 11, 3469);
    			attr_dev(linearGradient0, "id", "code_bg");
    			attr_dev(linearGradient0, "x1", "108.668");
    			attr_dev(linearGradient0, "y1", "6.1376e-07");
    			attr_dev(linearGradient0, "x2", "178.511");
    			attr_dev(linearGradient0, "y2", "83.6924");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient0, file$6, 45, 3, 3341);
    			attr_dev(stop2, "stop-color", "#E1C769");
    			add_location(stop2, file$6, 49, 4, 3659);
    			attr_dev(stop3, "offset", "1");
    			attr_dev(stop3, "stop-color", "#0038FF");
    			add_location(stop3, file$6, 50, 4, 3693);
    			attr_dev(linearGradient1, "id", "code_bg_4fh89hn3");
    			attr_dev(linearGradient1, "x1", "93.1988");
    			attr_dev(linearGradient1, "y1", "1.73314e-07");
    			attr_dev(linearGradient1, "x2", "117.5");
    			attr_dev(linearGradient1, "y2", "55");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient1, file$6, 48, 3, 3535);
    			attr_dev(stop4, "stop-color", "#E1C769");
    			add_location(stop4, file$6, 53, 4, 3883);
    			attr_dev(stop5, "offset", "1");
    			attr_dev(stop5, "stop-color", "#0038FF");
    			add_location(stop5, file$6, 54, 4, 3917);
    			attr_dev(linearGradient2, "id", "code_bg_um0uf8e3");
    			attr_dev(linearGradient2, "x1", "93.1988");
    			attr_dev(linearGradient2, "y1", "1.73314e-07");
    			attr_dev(linearGradient2, "x2", "117.5");
    			attr_dev(linearGradient2, "y2", "55");
    			attr_dev(linearGradient2, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient2, file$6, 52, 3, 3759);
    			attr_dev(stop6, "stop-color", "#E1C769");
    			add_location(stop6, file$6, 57, 4, 4091);
    			attr_dev(stop7, "offset", "1");
    			attr_dev(stop7, "stop-color", "#FF004D");
    			add_location(stop7, file$6, 58, 4, 4125);
    			attr_dev(linearGradient3, "id", "code_bg_4870n8fd");
    			attr_dev(linearGradient3, "x1", "122");
    			attr_dev(linearGradient3, "y1", "87");
    			attr_dev(linearGradient3, "x2", "86");
    			attr_dev(linearGradient3, "y2", "97");
    			attr_dev(linearGradient3, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient3, file$6, 56, 3, 3983);
    			attr_dev(stop8, "stop-color", "#E1C769");
    			add_location(stop8, file$6, 61, 4, 4299);
    			attr_dev(stop9, "offset", "1");
    			attr_dev(stop9, "stop-color", "#FF004D");
    			add_location(stop9, file$6, 62, 4, 4333);
    			attr_dev(linearGradient4, "id", "code_bg_u09fjdkm");
    			attr_dev(linearGradient4, "x1", "122");
    			attr_dev(linearGradient4, "y1", "87");
    			attr_dev(linearGradient4, "x2", "86");
    			attr_dev(linearGradient4, "y2", "97");
    			attr_dev(linearGradient4, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient4, file$6, 60, 3, 4191);
    			attr_dev(stop10, "stop-color", "#E1C769");
    			add_location(stop10, file$6, 65, 4, 4507);
    			attr_dev(stop11, "offset", "1");
    			attr_dev(stop11, "stop-color", "#FF004D");
    			add_location(stop11, file$6, 66, 4, 4541);
    			attr_dev(linearGradient5, "id", "code_bg_0dn09kmd");
    			attr_dev(linearGradient5, "x1", "122");
    			attr_dev(linearGradient5, "y1", "87");
    			attr_dev(linearGradient5, "x2", "86");
    			attr_dev(linearGradient5, "y2", "97");
    			attr_dev(linearGradient5, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient5, file$6, 64, 3, 4399);
    			attr_dev(stop12, "stop-color", "#E1C769");
    			add_location(stop12, file$6, 69, 4, 4715);
    			attr_dev(stop13, "offset", "1");
    			attr_dev(stop13, "stop-color", "#FF004D");
    			add_location(stop13, file$6, 70, 4, 4749);
    			attr_dev(linearGradient6, "id", "code_bg_mlfu93jf");
    			attr_dev(linearGradient6, "x1", "122");
    			attr_dev(linearGradient6, "y1", "87");
    			attr_dev(linearGradient6, "x2", "86");
    			attr_dev(linearGradient6, "y2", "97");
    			attr_dev(linearGradient6, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient6, file$6, 68, 3, 4607);
    			attr_dev(stop14, "stop-color", "#FF7A00");
    			add_location(stop14, file$6, 73, 4, 4934);
    			attr_dev(stop15, "offset", "0.151042");
    			attr_dev(stop15, "stop-color", "#FFE300");
    			add_location(stop15, file$6, 74, 4, 4968);
    			attr_dev(stop16, "offset", "0.307292");
    			attr_dev(stop16, "stop-color", "#74FF33");
    			add_location(stop16, file$6, 75, 4, 5020);
    			attr_dev(stop17, "offset", "0.479167");
    			attr_dev(stop17, "stop-color", "#00DD8D");
    			add_location(stop17, file$6, 76, 4, 5072);
    			attr_dev(stop18, "offset", "0.671875");
    			attr_dev(stop18, "stop-color", "#3AB8FF");
    			add_location(stop18, file$6, 77, 4, 5124);
    			attr_dev(stop19, "offset", "0.8125");
    			attr_dev(stop19, "stop-color", "#A661FF");
    			add_location(stop19, file$6, 78, 4, 5176);
    			attr_dev(stop20, "offset", "1");
    			attr_dev(stop20, "stop-color", "#FF03D7");
    			add_location(stop20, file$6, 79, 4, 5226);
    			attr_dev(linearGradient7, "id", "code_bg_rainbow");
    			attr_dev(linearGradient7, "x1", "106");
    			attr_dev(linearGradient7, "y1", "-5.5");
    			attr_dev(linearGradient7, "x2", "157.999");
    			attr_dev(linearGradient7, "y2", "75.0645");
    			attr_dev(linearGradient7, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient7, file$6, 72, 3, 4815);
    			add_location(defs, file$6, 38, 2, 3007);
    			attr_dev(svg, "id", "LandingCodingBG");
    			attr_dev(svg, "viewBox", "0 0 128 91");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "class", "svelte-1966cld");
    			add_location(svg, file$6, 24, 1, 762);
    			attr_dev(img, "class", "block-select svelte-1966cld");
    			attr_dev(img, "alt", img_alt_value = /*$_*/ ctx[1]('profile_pic_alt'));
    			add_location(img, file$6, 90, 4, 5523);
    			attr_dev(button, "class", "picture block-select svelte-1966cld");
    			toggle_class(button, "big-preview", /*showBigProfilePicture*/ ctx[0]);
    			add_location(button, file$6, 86, 3, 5393);
    			attr_dev(h1, "class", "name svelte-1966cld");
    			add_location(h1, file$6, 101, 4, 5768);
    			attr_dev(div0, "class", "professions flex flex-center-y gap-05 svelte-1966cld");
    			add_location(div0, file$6, 103, 4, 5813);
    			attr_dev(div1, "tabindex", "-1");
    			attr_dev(div1, "role", "listbox");
    			attr_dev(div1, "class", "social-media flex flex-center-y gap-1 svelte-1966cld");
    			add_location(div1, file$6, 111, 4, 6099);
    			attr_dev(div2, "class", "grid gap-05");
    			add_location(div2, file$6, 100, 3, 5737);
    			attr_dev(div3, "class", "header grid grid-center-y gap-2 svelte-1966cld");
    			add_location(div3, file$6, 85, 2, 5343);
    			attr_dev(p, "class", "text-block svelte-1966cld");
    			add_location(p, file$6, 139, 2, 7099);
    			attr_dev(div4, "class", "contents grid svelte-1966cld");
    			add_location(div4, file$6, 84, 1, 5312);
    			attr_dev(section, "id", "LandingSection");
    			attr_dev(section, "class", "auto-height svelte-1966cld");
    			add_location(section, file$6, 23, 0, 710);
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
    			append_dev(section, div4);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			append_dev(button, img);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(h1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div4, t5);
    			append_dev(div4, p);
    			append_dev(p, t6);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(lazyLoadSVGImgAction.call(null, image, {
    						thumb: 'code-bg-thumb.png',
    						source: 'code-bg.png'
    					})),
    					action_destroyer(lazyLoadAction.call(null, img, {
    						thumb: 'me-myself-and-i-thumb.jpg',
    						source: 'me-myself-and-i.jpg'
    					})),
    					listen_dev(button, "click", /*openBigProfilePicture*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$_*/ 2 && img_alt_value !== (img_alt_value = /*$_*/ ctx[1]('profile_pic_alt'))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*showBigProfilePicture*/ 1) {
    				toggle_class(button, "big-preview", /*showBigProfilePicture*/ ctx[0]);
    			}

    			if (dirty & /*$_*/ 2 && t2_value !== (t2_value = /*$_*/ ctx[1]('my_name') + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*$_, professions*/ 6) {
    				each_value_1 = /*professions*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*openModal, socialMedia*/ 0) {
    				each_value = socialMedia;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$_*/ 2 && t6_value !== (t6_value = /*$_*/ ctx[1]('about_me') + "")) set_data_dev(t6, t6_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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
    	let $_;
    	validate_store(Y, '_');
    	component_subscribe($$self, Y, $$value => $$invalidate(1, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Landing', slots, []);
    	const professions = ['software_engineer', 'fullstack_webdev', 'ux_ui_designer', 'junior_devop'];
    	const questions = ['projects', 'skills', 'contact']; //'about',
    	let showBigProfilePicture = false;

    	function openBigProfilePicture() {
    		vibrate();
    		$$invalidate(0, showBigProfilePicture = true);

    		openModal({ name: 'bigPicture', props: null }).then(() => {
    			$$invalidate(0, showBigProfilePicture = false);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Landing> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (name, url, app) => openModal({
    		name: 'socialMedia',
    		props: { name, url, app }
    	});

    	$$self.$capture_state = () => ({
    		_: Y,
    		vibrate,
    		vibrateLink,
    		lazyLoadAction,
    		lazyLoadSVGImgAction,
    		socialMedia,
    		openModal,
    		professions,
    		questions,
    		showBigProfilePicture,
    		openBigProfilePicture,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('showBigProfilePicture' in $$props) $$invalidate(0, showBigProfilePicture = $$props.showBigProfilePicture);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showBigProfilePicture, $_, professions, openBigProfilePicture, click_handler];
    }

    class Landing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Landing",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/ProjectPreviewTile.svelte generated by Svelte v3.49.0 */
    const file$5 = "src/components/ProjectPreviewTile.svelte";

    // (79:2) {:else}
    function create_else_block$3(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let svg;
    	let use;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(div0, "class", "bg svelte-2l2xai");
    			attr_dev(div0, "style", /*customGradientBG*/ ctx[2]);
    			add_location(div0, file$5, 80, 4, 2900);
    			xlink_attr(use, "xlink:href", "#Icon_NoImage");
    			add_location(use, file$5, 82, 5, 3030);
    			attr_dev(svg, "class", "icon svelte-2l2xai");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$5, 81, 4, 2948);
    			attr_dev(div1, "class", "no-image flex flex-center svelte-2l2xai");
    			add_location(div1, file$5, 79, 3, 2855);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			append_dev(div1, svg);
    			append_dev(svg, use);
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
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(79:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (49:2) {#if !project.hasNoCover}
    function create_if_block$3(ctx) {
    	let div;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 13
    	};

    	handle_promise(promise = /*lazyLoader*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "image-container svelte-2l2xai");
    			add_location(div, file$5, 49, 3, 1825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*lazyLoader*/ 2 && promise !== (promise = /*lazyLoader*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(49:2) {#if !project.hasNoCover}",
    		ctx
    	});

    	return block;
    }

    // (66:4) {:catch}
    function create_catch_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div;
    	let svg;
    	let use;
    	let t1;
    	let span;
    	let t2_value = /*$_*/ ctx[4]('failed_to_load_image') + "";
    	let t2;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			div = element("div");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			if (!src_url_equal(img.src, img_src_value = /*_thumbSrc*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `Daniel Scharkov's project ${/*$_*/ ctx[4]('project.' + /*project*/ ctx[5].id)} thumbnail`);
    			attr_dev(img, "class", "thumb svelte-2l2xai");
    			add_location(img, file$5, 66, 5, 2393);
    			xlink_attr(use, "xlink:href", "#Icon_ErrorCircle");
    			add_location(use, file$5, 72, 7, 2684);
    			attr_dev(svg, "class", "icon icon-thinner svelte-2l2xai");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$5, 71, 6, 2587);
    			attr_dev(span, "class", "fail-msg svelte-2l2xai");
    			add_location(span, file$5, 74, 6, 2743);
    			attr_dev(div, "class", "lazyload-overlay flex flex-center svelte-2l2xai");
    			add_location(div, file$5, 70, 5, 2532);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, use);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*_thumbSrc*/ 8 && !src_url_equal(img.src, img_src_value = /*_thumbSrc*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$_*/ 16 && img_alt_value !== (img_alt_value = `Daniel Scharkov's project ${/*$_*/ ctx[4]('project.' + /*project*/ ctx[5].id)} thumbnail`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*$_*/ 16 && t2_value !== (t2_value = /*$_*/ ctx[4]('failed_to_load_image') + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(66:4) {:catch}",
    		ctx
    	});

    	return block;
    }

    // (61:4) {:then src}
    function create_then_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[13])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `Daniel Scharkov's project ${/*$_*/ ctx[4]('project.' + /*project*/ ctx[5].id)} preview dark`);
    			attr_dev(img, "class", "image svelte-2l2xai");
    			add_location(img, file$5, 61, 5, 2247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*lazyLoader*/ 2 && !src_url_equal(img.src, img_src_value = /*src*/ ctx[13])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$_*/ 16 && img_alt_value !== (img_alt_value = `Daniel Scharkov's project ${/*$_*/ ctx[4]('project.' + /*project*/ ctx[5].id)} preview dark`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(61:4) {:then src}",
    		ctx
    	});

    	return block;
    }

    // (51:23)        <img src={_thumbSrc}
    function create_pending_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;
    	let div;
    	let svg;
    	let use;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			div = element("div");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			if (!src_url_equal(img.src, img_src_value = /*_thumbSrc*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `Daniel Scharkov's project ${/*$_*/ ctx[4]('project.' + /*project*/ ctx[5].id)} thumbnail`);
    			attr_dev(img, "class", "thumb svelte-2l2xai");
    			add_location(img, file$5, 51, 5, 1886);
    			xlink_attr(use, "xlink:href", "#Icon_Loader");
    			add_location(use, file$5, 57, 7, 2164);
    			attr_dev(svg, "class", "icon svelte-2l2xai");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$5, 56, 6, 2080);
    			attr_dev(div, "class", "lazyload-overlay flex flex-center svelte-2l2xai");
    			add_location(div, file$5, 55, 5, 2025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, use);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*_thumbSrc*/ 8 && !src_url_equal(img.src, img_src_value = /*_thumbSrc*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$_*/ 16 && img_alt_value !== (img_alt_value = `Daniel Scharkov's project ${/*$_*/ ctx[4]('project.' + /*project*/ ctx[5].id)} thumbnail`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(51:23)        <img src={_thumbSrc}",
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
    	let t1_value = /*$_*/ ctx[4]('project.' + /*project*/ ctx[5].id) + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*project*/ ctx[5].hasNoCover) return create_if_block$3;
    		return create_else_block$3;
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
    			attr_dev(div0, "class", "preview block-select svelte-2l2xai");
    			attr_dev(div0, "role", "img");
    			toggle_class(div0, "dark-theme", /*project*/ ctx[5].darkThemed);
    			add_location(div0, file$5, 47, 1, 1708);
    			attr_dev(span, "class", "name svelte-2l2xai");
    			add_location(span, file$5, 88, 2, 3133);
    			attr_dev(div1, "class", "contents svelte-2l2xai");
    			add_location(div1, file$5, 87, 1, 3107);
    			attr_dev(button, "class", "project grid svelte-2l2xai");
    			set_style(button, "animation-delay", 1000 + /*projectIndex*/ ctx[0] * 100 + "ms");
    			attr_dev(button, "aria-haspopup", "dialog");
    			add_location(button, file$5, 43, 0, 1568);
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
    				dispose = listen_dev(button, "click", /*openThisProject*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    			if (dirty & /*$_*/ 16 && t1_value !== (t1_value = /*$_*/ ctx[4]('project.' + /*project*/ ctx[5].id) + "")) set_data_dev(t1, t1_value);

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
    	let _thumbSrc;
    	let customGradientBG;
    	let $appState;
    	let $_;
    	validate_store(appState, 'appState');
    	component_subscribe($$self, appState, $$value => $$invalidate(7, $appState = $$value));
    	validate_store(Y, '_');
    	component_subscribe($$self, Y, $$value => $$invalidate(4, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProjectPreviewTile', slots, []);
    	let { projectIndex } = $$props;
    	const project = projects[projectIndex];
    	const thumbSrc = `projects/${project.id}/thumbnail.jpg`;
    	const previewSrc = `projects/${project.id}/preview.jpg`;
    	const thumbDarkSrc = `projects/${project.id}/thumbnail_dark.jpg`;
    	const previewDarkSrc = `projects/${project.id}/preview_dark.jpg`;

    	function openThisProject() {
    		vibrate();
    		openModal({ name: 'project', props: { project } });
    	}

    	let lazyLoader;

    	function loadPreviewImg() {
    		if (!project.hasNoCover) {
    			if (project.darkThemed && $appState.a11y.isDarkTheme) {
    				$$invalidate(1, lazyLoader = lazyLoad(previewDarkSrc));
    			} else {
    				$$invalidate(1, lazyLoader = lazyLoad(previewSrc));
    			}
    		}
    	}

    	colorSchemaMediaQuery.addEventListener('change', loadPreviewImg);
    	onMount(loadPreviewImg);

    	onDestroy(() => {
    		colorSchemaMediaQuery.removeEventListener('change', loadPreviewImg);
    	});

    	const writable_props = ['projectIndex'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProjectPreviewTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('projectIndex' in $$props) $$invalidate(0, projectIndex = $$props.projectIndex);
    	};

    	$$self.$capture_state = () => ({
    		_: Y,
    		projects,
    		vibrate,
    		openModal,
    		onDestroy,
    		onMount,
    		lazyLoad,
    		appState,
    		colorSchemaMediaQuery,
    		projectIndex,
    		project,
    		thumbSrc,
    		previewSrc,
    		thumbDarkSrc,
    		previewDarkSrc,
    		openThisProject,
    		lazyLoader,
    		loadPreviewImg,
    		customGradientBG,
    		_thumbSrc,
    		$appState,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('projectIndex' in $$props) $$invalidate(0, projectIndex = $$props.projectIndex);
    		if ('lazyLoader' in $$props) $$invalidate(1, lazyLoader = $$props.lazyLoader);
    		if ('customGradientBG' in $$props) $$invalidate(2, customGradientBG = $$props.customGradientBG);
    		if ('_thumbSrc' in $$props) $$invalidate(3, _thumbSrc = $$props._thumbSrc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$appState*/ 128) {
    			$$invalidate(3, _thumbSrc = $appState.a11y.isDarkTheme && project.darkThemed
    			? thumbDarkSrc
    			: thumbSrc);
    		}
    	};

    	$$invalidate(2, customGradientBG = Array.isArray(project.gradient)
    	? `background: -webkit-linear-gradient(125deg, ${project.gradient.join(',')});` + `background: linear-gradient(125deg, ${project.gradient.join(',')});`
    	: '');

    	return [
    		projectIndex,
    		lazyLoader,
    		customGradientBG,
    		_thumbSrc,
    		$_,
    		project,
    		openThisProject,
    		$appState
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

    /* src/sections/Projects.svelte generated by Svelte v3.49.0 */
    const file$4 = "src/sections/Projects.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (11:2) {#each projects as _, idx}
    function create_each_block$3(ctx) {
    	let projectpreviewtile;
    	let current;

    	projectpreviewtile = new ProjectPreviewTile({
    			props: { projectIndex: /*idx*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(projectpreviewtile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectpreviewtile, target, anchor);
    			current = true;
    		},
    		p: noop,
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
    		source: "(11:2) {#each projects as _, idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let h1;
    	let t0_value = /*$_*/ ctx[0]('section.projects.title') + "";
    	let t0;
    	let t1;
    	let div;
    	let current;
    	let each_value = projects;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "id", "projects");
    			attr_dev(h1, "class", "display-3 svelte-aoitri");
    			add_location(h1, file$4, 8, 1, 194);
    			attr_dev(div, "class", "projects grid svelte-aoitri");
    			attr_dev(div, "role", "feed");
    			add_location(div, file$4, 9, 1, 268);
    			add_location(section, file$4, 7, 0, 182);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(h1, t0);
    			append_dev(section, t1);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$_*/ 1) && t0_value !== (t0_value = /*$_*/ ctx[0]('section.projects.title') + "")) set_data_dev(t0, t0_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
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

    function instance$4($$self, $$props, $$invalidate) {
    	let $_;
    	validate_store(Y, '_');
    	component_subscribe($$self, Y, $$value => $$invalidate(0, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Projects', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ projects, ProjectPreviewTile, _: Y, $_ });
    	return [$_];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/sections/Skills.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1 } = globals;
    const file$3 = "src/sections/Skills.svelte";

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
    			attr_dev(div, "aria-hidden", "true");
    			attr_dev(div, "class", "period svelte-3ss4ro");
    			add_location(div, file$3, 8, 4, 350);
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
    			attr_dev(span, "aria-hidden", "true");
    			attr_dev(span, "class", "period placeholder svelte-3ss4ro");
    			add_location(span, file$3, 16, 5, 628);
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
    			attr_dev(span, "class", "period flex flex-center svelte-3ss4ro");
    			add_location(span, file$3, 14, 5, 544);
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
    			attr_dev(div, "class", "logo placeholder svelte-3ss4ro");
    			add_location(div, file$3, 35, 6, 1249);
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

    // (29:45) 
    function create_if_block_1$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "logo svelte-3ss4ro");
    			if (!src_url_equal(img.src, img_src_value = "technologies/" + /*techno*/ ctx[5] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "" + (/*techno*/ ctx[5] + " Logo"));
    			add_location(img, file$3, 29, 6, 1124);
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
    		source: "(29:45) ",
    		ctx
    	});

    	return block;
    }

    // (24:5) {#if technologies[techno].hasIcon}
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
    			add_location(title, file$3, 25, 7, 984);
    			xlink_attr(use, "xlink:href", "#Logo_" + /*techno*/ ctx[5]);
    			add_location(use, file$3, 26, 7, 1021);
    			attr_dev(svg, "class", "logo flex-base-size svelte-3ss4ro");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$3, 24, 6, 885);
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
    		source: "(24:5) {#if technologies[techno].hasIcon}",
    		ctx
    	});

    	return block;
    }

    // (56:5) {#each technologies[techno].careerSpan as period}
    function create_each_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "period svelte-3ss4ro");
    			attr_dev(div, "style", /*technoCareerSpan*/ ctx[3](technologies[/*techno*/ ctx[5]], /*period*/ ctx[8]));
    			add_location(div, file$3, 56, 6, 2102);
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
    		source: "(56:5) {#each technologies[techno].careerSpan as period}",
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
    	let use;
    	let a_aria_label_value;
    	let t5;
    	let div2;
    	let t6;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (technologies[/*techno*/ ctx[5]].hasIcon) return create_if_block$2;
    		if (technologies[/*techno*/ ctx[5]].hasImage) return create_if_block_1$1;
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
    			use = svg_element("use");
    			t5 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			attr_dev(span0, "class", "name flex-base-size svelte-3ss4ro");
    			add_location(span0, file$3, 38, 6, 1327);
    			attr_dev(span1, "class", "type flex-base-size svelte-3ss4ro");
    			add_location(span1, file$3, 41, 6, 1420);
    			attr_dev(div0, "class", "naming svelte-3ss4ro");
    			add_location(div0, file$3, 37, 5, 1299);
    			xlink_attr(use, "xlink:href", "#Icon_Link");
    			add_location(use, file$3, 50, 7, 1864);
    			attr_dev(svg, "class", "icon svelte-3ss4ro");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$3, 49, 6, 1780);
    			attr_dev(a, "href", technologies[/*techno*/ ctx[5]].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "link flex flex-center svelte-3ss4ro");

    			attr_dev(a, "aria-label", a_aria_label_value = /*$_*/ ctx[0]('section.skills.aria_open_site', {
    				values: { x: technologies[/*techno*/ ctx[5]].name }
    			}));

    			add_location(a, file$3, 45, 5, 1565);
    			attr_dev(div1, "class", "header flex flex-center-y svelte-3ss4ro");
    			add_location(div1, file$3, 22, 4, 797);
    			attr_dev(div2, "class", "time-span grid svelte-3ss4ro");
    			set_style(div2, "grid-template-columns", "repeat(" + (/*currentYear*/ ctx[1] - careerBegin) + ", 1fr)");
    			add_location(div2, file$3, 54, 4, 1937);
    			attr_dev(li, "class", "techno svelte-3ss4ro");
    			add_location(li, file$3, 21, 3, 772);
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
    			append_dev(svg, use);
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

    			if (dirty & /*$_*/ 1 && a_aria_label_value !== (a_aria_label_value = /*$_*/ ctx[0]('section.skills.aria_open_site', {
    				values: { x: technologies[/*techno*/ ctx[5]].name }
    			}))) {
    				attr_dev(a, "aria-label", a_aria_label_value);
    			}

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

    function create_fragment$3(ctx) {
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
    			attr_dev(h1, "class", "display-3 svelte-3ss4ro");
    			add_location(h1, file$3, 2, 2, 64);
    			attr_dev(p, "class", "subtitle");
    			add_location(p, file$3, 3, 2, 135);
    			attr_dev(div0, "class", "section-header svelte-3ss4ro");
    			add_location(div0, file$3, 1, 1, 32);
    			attr_dev(div1, "aria-hidden", "true");
    			attr_dev(div1, "class", "background-seperators flex svelte-3ss4ro");
    			add_location(div1, file$3, 6, 2, 239);
    			attr_dev(div2, "class", "header flex flex-center-y svelte-3ss4ro");
    			add_location(div2, file$3, 11, 2, 416);
    			attr_dev(ul, "class", "technologies grid svelte-3ss4ro");
    			add_location(ul, file$3, 5, 1, 205);
    			attr_dev(section, "class", "auto-height svelte-3ss4ro");
    			add_location(section, file$3, 0, 0, 0);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $_;
    	validate_store(Y, '_');
    	component_subscribe($$self, Y, $$value => $$invalidate(0, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skills', slots, []);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skills> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		_: Y,
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

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/sections/Footer.svelte generated by Svelte v3.49.0 */
    const file$2 = "src/sections/Footer.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i].name;
    	child_ctx[4] = list[i].url;
    	child_ctx[5] = list[i].app;
    	return child_ctx;
    }

    // (25:4) {:else}
    function create_else_block$1(ctx) {
    	let a;
    	let svg;
    	let title;
    	let t0_value = /*name*/ ctx[3] + "";
    	let t0;
    	let use;
    	let t1;
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
    			add_location(title, file$2, 29, 7, 1100);
    			xlink_attr(use, "xlink:href", "#Logo_" + /*name*/ ctx[3]);
    			add_location(use, file$2, 30, 7, 1130);
    			attr_dev(svg, "class", "icon svelte-19vmuft");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$2, 28, 6, 1016);
    			attr_dev(a, "href", /*url*/ ctx[4]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "role", "listitem");
    			attr_dev(a, "class", "btn flex flex-center svelte-19vmuft");
    			add_location(a, file$2, 25, 5, 905);
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
    		p: noop,
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
    		source: "(25:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#if app}
    function create_if_block$1(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = /*name*/ ctx[3] + "";
    	let t0;
    	let use;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*name*/ ctx[3], /*url*/ ctx[4], /*app*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(t0_value);
    			use = svg_element("use");
    			t1 = space();
    			add_location(title, file$2, 20, 7, 793);
    			xlink_attr(use, "xlink:href", "#Logo_" + /*name*/ ctx[3]);
    			add_location(use, file$2, 21, 7, 823);
    			attr_dev(svg, "class", "icon svelte-19vmuft");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$2, 19, 6, 709);
    			attr_dev(button, "role", "listitem");
    			attr_dev(button, "class", "btn flex flex-center svelte-19vmuft");
    			attr_dev(button, "aria-haspopup", "dialog");
    			add_location(button, file$2, 15, 5, 533);
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
    		source: "(15:4) {#if app}",
    		ctx
    	});

    	return block;
    }

    // (14:3) {#each socialMedia as {name, url, app}}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*app*/ ctx[5]) return create_if_block$1;
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
    			if_block.p(ctx, dirty);
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
    		source: "(14:3) {#each socialMedia as {name, url, app}}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let footer;
    	let div1;
    	let h1;
    	let t0_value = /*$_*/ ctx[0]('section.contact.title') + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let p;
    	let t3_value = /*$_*/ ctx[0]('copyright', { values: { year: /*currentYear*/ ctx[1] } }) + "";
    	let t3;
    	let each_value = socialMedia;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			attr_dev(h1, "id", "contact");
    			attr_dev(h1, "class", "svelte-19vmuft");
    			add_location(h1, file$2, 10, 2, 330);
    			attr_dev(div0, "role", "listbox");
    			attr_dev(div0, "tabindex", "-1");
    			attr_dev(div0, "class", "social-media flex flex-center gap-15 svelte-19vmuft");
    			add_location(div0, file$2, 12, 2, 388);
    			attr_dev(div1, "class", "get-in-touch grid grid-center svelte-19vmuft");
    			add_location(div1, file$2, 9, 1, 283);
    			attr_dev(p, "class", "copyright svelte-19vmuft");
    			attr_dev(p, "role", "contentinfo");
    			add_location(p, file$2, 38, 1, 1234);
    			attr_dev(footer, "class", "grid svelte-19vmuft");
    			add_location(footer, file$2, 8, 0, 259);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(footer, t2);
    			append_dev(footer, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$_*/ 1 && t0_value !== (t0_value = /*$_*/ ctx[0]('section.contact.title') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*openModal, socialMedia*/ 0) {
    				each_value = socialMedia;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$_*/ 1 && t3_value !== (t3_value = /*$_*/ ctx[0]('copyright', { values: { year: /*currentYear*/ ctx[1] } }) + "")) set_data_dev(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
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
    	validate_store(Y, '_');
    	component_subscribe($$self, Y, $$value => $$invalidate(0, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const currentYear = new Date().getFullYear();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (name, url, app) => openModal({
    		name: 'socialMedia',
    		props: { name, url, app }
    	});

    	$$self.$capture_state = () => ({
    		_: Y,
    		socialMedia,
    		openModal,
    		vibrateLink,
    		currentYear,
    		$_
    	});

    	return [$_, currentYear, click_handler];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Icons.svelte generated by Svelte v3.49.0 */

    const file$1 = "src/components/Icons.svelte";

    function create_fragment$1(ctx) {
    	let svg41;
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
    	let circle0;
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
    	let symbol29;
    	let svg29;
    	let g15;
    	let g3;
    	let rect3;
    	let animate0;
    	let g4;
    	let rect4;
    	let animate1;
    	let g5;
    	let rect5;
    	let animate2;
    	let g6;
    	let rect6;
    	let animate3;
    	let g7;
    	let rect7;
    	let animate4;
    	let g8;
    	let rect8;
    	let animate5;
    	let g9;
    	let rect9;
    	let animate6;
    	let g10;
    	let rect10;
    	let animate7;
    	let g11;
    	let rect11;
    	let animate8;
    	let g12;
    	let rect12;
    	let animate9;
    	let g13;
    	let rect13;
    	let animate10;
    	let g14;
    	let rect14;
    	let animate11;
    	let symbol30;
    	let svg30;
    	let path75;
    	let path76;
    	let path77;
    	let path78;
    	let path79;
    	let circle1;
    	let symbol31;
    	let svg31;
    	let circle2;
    	let path80;
    	let symbol32;
    	let svg32;
    	let path81;
    	let symbol33;
    	let svg33;
    	let path82;
    	let path83;
    	let symbol34;
    	let svg34;
    	let path84;
    	let symbol35;
    	let svg35;
    	let path85;
    	let symbol36;
    	let svg36;
    	let path86;
    	let symbol37;
    	let svg37;
    	let path87;
    	let symbol38;
    	let svg38;
    	let path88;
    	let symbol39;
    	let svg39;
    	let path89;
    	let symbol40;
    	let svg40;
    	let path90;

    	const block = {
    		c: function create() {
    			svg41 = svg_element("svg");
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
    			circle0 = svg_element("circle");
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
    			symbol29 = svg_element("symbol");
    			svg29 = svg_element("svg");
    			g15 = svg_element("g");
    			g3 = svg_element("g");
    			rect3 = svg_element("rect");
    			animate0 = svg_element("animate");
    			g4 = svg_element("g");
    			rect4 = svg_element("rect");
    			animate1 = svg_element("animate");
    			g5 = svg_element("g");
    			rect5 = svg_element("rect");
    			animate2 = svg_element("animate");
    			g6 = svg_element("g");
    			rect6 = svg_element("rect");
    			animate3 = svg_element("animate");
    			g7 = svg_element("g");
    			rect7 = svg_element("rect");
    			animate4 = svg_element("animate");
    			g8 = svg_element("g");
    			rect8 = svg_element("rect");
    			animate5 = svg_element("animate");
    			g9 = svg_element("g");
    			rect9 = svg_element("rect");
    			animate6 = svg_element("animate");
    			g10 = svg_element("g");
    			rect10 = svg_element("rect");
    			animate7 = svg_element("animate");
    			g11 = svg_element("g");
    			rect11 = svg_element("rect");
    			animate8 = svg_element("animate");
    			g12 = svg_element("g");
    			rect12 = svg_element("rect");
    			animate9 = svg_element("animate");
    			g13 = svg_element("g");
    			rect13 = svg_element("rect");
    			animate10 = svg_element("animate");
    			g14 = svg_element("g");
    			rect14 = svg_element("rect");
    			animate11 = svg_element("animate");
    			symbol30 = svg_element("symbol");
    			svg30 = svg_element("svg");
    			path75 = svg_element("path");
    			path76 = svg_element("path");
    			path77 = svg_element("path");
    			path78 = svg_element("path");
    			path79 = svg_element("path");
    			circle1 = svg_element("circle");
    			symbol31 = svg_element("symbol");
    			svg31 = svg_element("svg");
    			circle2 = svg_element("circle");
    			path80 = svg_element("path");
    			symbol32 = svg_element("symbol");
    			svg32 = svg_element("svg");
    			path81 = svg_element("path");
    			symbol33 = svg_element("symbol");
    			svg33 = svg_element("svg");
    			path82 = svg_element("path");
    			path83 = svg_element("path");
    			symbol34 = svg_element("symbol");
    			svg34 = svg_element("svg");
    			path84 = svg_element("path");
    			symbol35 = svg_element("symbol");
    			svg35 = svg_element("svg");
    			path85 = svg_element("path");
    			symbol36 = svg_element("symbol");
    			svg36 = svg_element("svg");
    			path86 = svg_element("path");
    			symbol37 = svg_element("symbol");
    			svg37 = svg_element("svg");
    			path87 = svg_element("path");
    			symbol38 = svg_element("symbol");
    			svg38 = svg_element("svg");
    			path88 = svg_element("path");
    			symbol39 = svg_element("symbol");
    			svg39 = svg_element("svg");
    			path89 = svg_element("path");
    			symbol40 = svg_element("symbol");
    			svg40 = svg_element("svg");
    			path90 = svg_element("path");
    			attr_dev(path0, "fill", "var(--icon)");
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M60 11C32.3894 11 10 33.3844 10 61C10 83.0905 24.3265 101.833 44.1931 108.444C46.6919 108.907 47.6093 107.359 47.6093 106.039C47.6093 104.847 47.5629 100.908 47.5414 96.7298C33.6314 99.7544 30.6962 90.8304 30.6962 90.8304C28.4217 85.052 25.1446 83.5144 25.1446 83.5144C20.6081 80.4111 25.4865 80.4749 25.4865 80.4749C30.5074 80.8276 33.1511 85.6282 33.1511 85.6282C37.6106 93.2713 44.848 91.0614 47.7012 89.7839C48.1508 86.5531 49.4458 84.3465 50.8757 83.0979C39.77 81.8344 28.0955 77.5463 28.0955 58.3877C28.0955 52.9297 30.0487 48.4685 33.2472 44.967C32.728 43.7077 31.0166 38.6222 33.7324 31.7351C33.7324 31.7351 37.931 30.3921 47.4851 36.8611C51.4735 35.7533 55.7508 35.1977 60 35.1778C64.2492 35.1977 68.5298 35.7533 72.5257 36.8611C82.069 30.3921 86.2618 31.7351 86.2618 31.7351C88.9834 38.6222 87.272 43.7077 86.7528 44.967C89.9588 48.4685 91.8979 52.9297 91.8979 58.3877C91.8979 77.5927 80.201 81.8204 69.0672 83.0582C70.8606 84.6098 72.4586 87.6526 72.4586 92.3175C72.4586 99.0075 72.4015 104.392 72.4015 106.039C72.4015 107.37 73.3007 108.928 75.8351 108.438C95.6917 101.819 110 83.0839 110 61C110 33.3844 87.6139 11 60 11Z");
    			add_location(path0, file$1, 5, 3, 213);
    			attr_dev(path1, "fill", "var(--icon)");
    			attr_dev(path1, "d", "M28.9379 82.7884C28.8277 83.0377 28.4369 83.1122 28.0809 82.9416C27.7174 82.7777 27.5146 82.439 27.6321 82.1898C27.7398 81.9348 28.1306 81.8636 28.4932 82.0341C28.8559 82.1973 29.0629 82.5392 28.9379 82.7884Z");
    			add_location(path1, file$1, 6, 3, 1421);
    			attr_dev(path2, "fill", "var(--icon)");
    			attr_dev(path2, "d", "M30.9634 85.0476C30.7249 85.2686 30.2579 85.166 29.9425 84.8166C29.6146 84.468 29.5541 84.001 29.7959 83.7775C30.0418 83.5564 30.4939 83.6599 30.8209 84.0085C31.1488 84.3612 31.2126 84.8232 30.9634 85.0476Z");
    			add_location(path2, file$1, 7, 3, 1664);
    			attr_dev(path3, "fill", "var(--icon)");
    			attr_dev(path3, "d", "M32.9347 87.9268C32.6284 88.1405 32.1266 87.9409 31.8169 87.4963C31.5106 87.0508 31.5106 86.5176 31.8244 86.304C32.1341 86.0904 32.6284 86.2833 32.9422 86.7238C33.2477 87.1759 33.2477 87.7091 32.9347 87.9268Z");
    			add_location(path3, file$1, 8, 3, 1905);
    			attr_dev(path4, "fill", "var(--icon)");
    			attr_dev(path4, "d", "M35.6353 90.7092C35.3612 91.0114 34.7775 90.9303 34.3503 90.5171C33.9131 90.1147 33.7914 89.5426 34.0655 89.2404C34.3437 88.9373 34.9307 89.0226 35.3612 89.4316C35.7951 89.834 35.9267 90.4103 35.6353 90.7092Z");
    			add_location(path4, file$1, 9, 3, 2148);
    			attr_dev(path5, "fill", "var(--icon)");
    			attr_dev(path5, "d", "M39.3612 92.3247C39.2395 92.7163 38.6781 92.8935 38.1118 92.7271C37.5463 92.5557 37.1762 92.0978 37.2904 91.702C37.408 91.3079 37.9727 91.1224 38.5432 91.3005C39.1078 91.471 39.4788 91.9264 39.3612 92.3247Z");
    			add_location(path5, file$1, 10, 3, 2391);
    			attr_dev(path6, "fill", "var(--icon)");
    			attr_dev(path6, "d", "M43.4534 92.6239C43.4675 93.0363 42.9873 93.3782 42.3928 93.3857C41.795 93.3989 41.3106 93.0652 41.304 92.6595C41.304 92.243 41.7743 91.9052 42.3713 91.8945C42.9657 91.8829 43.4534 92.2149 43.4534 92.6239Z");
    			add_location(path6, file$1, 11, 3, 2632);
    			attr_dev(path7, "fill", "var(--icon)");
    			attr_dev(path7, "d", "M47.261 91.9762C47.3322 92.3778 46.919 92.7909 46.3287 92.901C45.7483 93.0078 45.2109 92.7586 45.1372 92.3604C45.0652 91.948 45.485 91.5349 46.0654 91.4281C46.6566 91.3254 47.1856 91.5672 47.261 91.9762Z");
    			add_location(path7, file$1, 12, 3, 2872);
    			attr_dev(svg0, "viewBox", "0 0 120 120");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$1, 4, 2, 147);
    			attr_dev(symbol0, "id", "Logo_GitHub");
    			add_location(symbol0, file$1, 3, 1, 119);
    			attr_dev(path8, "fill", "var(--icon)");
    			attr_dev(path8, "d", "M108.103 41.1921L62.3996 10.7233C60.8396 9.76331 59.1748 9.75452 57.6006 10.7233L11.8973 41.1921C10.7254 41.9732 10 43.3685 10 44.7634V75.2321C10 76.6272 10.7254 78.0223 11.8975 78.8036L57.6007 109.277C59.1607 110.237 60.8256 110.245 62.3998 109.277L108.103 78.8036C109.275 78.0225 110.001 76.6272 110.001 75.2321V44.7634C110 43.3685 109.275 41.9732 108.103 41.1921V41.1921ZM64.2971 22.3301L97.9468 44.7634L82.9356 54.8082L64.2971 42.3638V22.3301ZM55.7033 22.3301V42.3638L37.0647 54.8082L22.0536 44.7634L55.7033 22.3301ZM18.5938 52.7992L29.3639 59.9979L18.5938 67.1965V52.7992ZM55.7033 97.6656L22.0536 75.2323L37.0647 65.1875L55.7033 77.6319V97.6656ZM60.0002 70.1541L44.8214 59.9979L60.0002 49.8416L75.1789 59.9979L60.0002 70.1541ZM64.2971 97.6656V77.6319L82.9356 65.1875L97.9468 75.2323L64.2971 97.6656ZM101.407 67.1965L90.6364 59.9979L101.407 52.7992V67.1965Z");
    			add_location(path8, file$1, 17, 3, 3223);
    			attr_dev(svg1, "viewBox", "0 0 120 120");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$1, 16, 2, 3157);
    			attr_dev(symbol1, "id", "Logo_Codepen");
    			add_location(symbol1, file$1, 15, 1, 3128);
    			attr_dev(path9, "fill", "var(--icon)");
    			attr_dev(path9, "d", "M74.05 57.5C74.05 60.55 71.8 63.05 68.95 63.05C66.15 63.05 63.85 60.55 63.85 57.5C63.85 54.45 66.1 51.95 68.95 51.95C71.8 51.95 74.05 54.45 74.05 57.5ZM50.7 51.95C47.85 51.95 45.6 54.45 45.6 57.5C45.6 60.55 47.9 63.05 50.7 63.05C53.55 63.05 55.8 60.55 55.8 57.5C55.85 54.45 53.55 51.95 50.7 51.95ZM103.5 20.3V110C90.9035 98.8684 94.932 102.553 80.3 88.95L82.95 98.2H26.25C20.6 98.2 16 93.6 16 87.9V20.3C16 14.6 20.6 10 26.25 10H93.25C98.9 10 103.5 14.6 103.5 20.3ZM89.25 67.7C89.25 51.6 82.05 38.55 82.05 38.55C74.85 33.15 68 33.3 68 33.3L67.3 34.1C75.8 36.7 79.75 40.45 79.75 40.45C67.8729 33.9404 53.9211 33.9393 42.4 39C40.55 39.85 39.45 40.45 39.45 40.45C39.45 40.45 43.6 36.5 52.6 33.9L52.1 33.3C52.1 33.3 45.25 33.15 38.05 38.55C38.05 38.55 30.85 51.6 30.85 67.7C30.85 67.7 35.05 74.95 46.1 75.3C46.1 75.3 47.95 73.05 49.45 71.15C43.1 69.25 40.7 65.25 40.7 65.25C41.4355 65.7648 42.6484 66.4322 42.75 66.5C51.1895 71.2262 63.1773 72.7746 73.95 68.25C75.7 67.6 77.65 66.65 79.7 65.3C79.7 65.3 77.2 69.4 70.65 71.25C72.15 73.15 73.95 75.3 73.95 75.3C85 74.95 89.25 67.7 89.25 67.7V67.7Z");
    			add_location(path9, file$1, 22, 3, 4232);
    			attr_dev(svg2, "viewBox", "0 0 120 120");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file$1, 21, 2, 4166);
    			attr_dev(symbol2, "id", "Logo_Discord");
    			add_location(symbol2, file$1, 20, 1, 4137);
    			attr_dev(path10, "fill", "var(--icon)");
    			attr_dev(path10, "d", "M103.246 29.2578L90.0432 91.5234C89.0471 95.918 86.4494 97.0117 82.758 94.9414L62.6409 80.1172L52.9338 89.4531C51.8596 90.5273 50.9612 91.4258 48.8909 91.4258L50.3362 70.9375L87.6213 37.2461C89.2424 35.8008 87.2698 35 85.1018 36.4453L39.008 65.4687L19.1643 59.2578C14.8479 57.9102 14.7698 54.9414 20.0627 52.8711L97.6799 22.9687C101.274 21.6211 104.418 23.7695 103.246 29.2578V29.2578Z");
    			add_location(path10, file$1, 27, 3, 5471);
    			attr_dev(svg3, "viewBox", "0 0 120 120");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg3, file$1, 26, 2, 5405);
    			attr_dev(symbol3, "id", "Logo_Telegram");
    			add_location(symbol3, file$1, 25, 1, 5375);
    			attr_dev(path11, "fill", "var(--icon)");
    			attr_dev(path11, "d", "M99.7211 39.2411C99.7845 40.1294 99.7845 41.0179 99.7845 41.9061C99.7845 69 79.1628 100.218 41.4722 100.218C29.8604 100.218 19.0737 96.8554 10 91.0181C11.6498 91.2083 13.236 91.2718 14.9492 91.2718C24.5303 91.2718 33.3503 88.0358 40.3935 82.5155C31.3833 82.3251 23.8325 76.4241 21.2309 68.3021C22.5 68.4924 23.769 68.6193 25.1016 68.6193C26.9417 68.6193 28.7819 68.3654 30.495 67.9215C21.1041 66.0178 14.0608 57.7691 14.0608 47.8071V47.5534C16.7891 49.0763 19.962 50.028 23.3247 50.1548C17.8043 46.4745 14.1877 40.1929 14.1877 33.0862C14.1877 29.2791 15.2028 25.7893 16.9795 22.7436C27.0684 35.1801 42.2335 43.3019 59.2385 44.1903C58.9213 42.6675 58.7309 41.0813 58.7309 39.495C58.7309 28.2004 67.868 19 79.2259 19C85.1269 19 90.4568 21.4746 94.2005 25.4721C98.8324 24.5838 103.274 22.8705 107.208 20.5229C105.685 25.2819 102.449 29.2793 98.198 31.8172C102.322 31.3733 106.32 30.2309 110 28.6448C107.209 32.7055 103.719 36.3221 99.7211 39.2411V39.2411Z");
    			add_location(path11, file$1, 32, 3, 6004);
    			attr_dev(svg4, "viewBox", "0 0 120 120");
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg4, file$1, 31, 2, 5938);
    			attr_dev(symbol4, "id", "Logo_Twitter");
    			add_location(symbol4, file$1, 30, 1, 5909);
    			attr_dev(path12, "fill", "var(--icon)");
    			attr_dev(path12, "d", "M21.8462 36.1877C21.9702 34.968 21.4947 33.7482 20.5851 32.9212L11.2611 21.6746V20H40.246L62.6566 69.142L82.3589 20H110V21.6746L102.02 29.324C101.338 29.8408 100.986 30.7091 101.131 31.5568V87.79C100.986 88.6376 101.338 89.5059 102.02 90.0227L109.814 97.6721V99.3467H70.5954V97.6721L78.6789 89.8367C79.4645 89.0511 79.4645 88.803 79.4645 87.6039V42.1625L56.9919 99.202H53.9529L27.821 42.1625V80.3887C27.5936 82.0012 28.1311 83.6138 29.2681 84.7716L39.7705 97.5067V99.1813H10V97.5274L20.5024 84.7716C21.6188 83.6138 22.1356 81.9806 21.8462 80.3887V36.1877Z");
    			add_location(path12, file$1, 37, 3, 7103);
    			attr_dev(svg5, "viewBox", "0 0 120 120");
    			attr_dev(svg5, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg5, file$1, 36, 2, 7037);
    			attr_dev(symbol5, "id", "Logo_Medium");
    			add_location(symbol5, file$1, 35, 1, 7009);
    			attr_dev(path13, "fill", "var(--icon)");
    			attr_dev(path13, "d", "M63.442 87.9756C59.9772 81.1561 55.9126 74.2681 47.9838 74.2681C46.468 74.2681 44.9544 74.5186 43.5649 75.153L40.8714 69.7618C44.1535 66.9462 49.4579 64.7135 56.2753 64.7135C66.8814 64.7135 72.3242 69.8225 76.6457 76.3435C79.2107 70.7758 80.4301 63.257 80.4301 53.9373C80.4301 30.6646 73.1519 18.7142 56.1504 18.7142C39.3973 18.7142 32.1586 30.6646 32.1586 53.9373C32.1586 77.088 39.3973 88.9148 56.1511 88.9148C58.8136 88.9148 61.2248 88.622 63.442 87.9756ZM67.5948 96.0978C63.9226 97.0822 60.0203 97.6255 56.1504 97.6255C33.8423 97.6255 12 79.8252 12 53.938C12 27.8038 33.8423 10 56.1504 10C78.8332 10 100.466 27.6768 100.466 53.9373C100.466 68.5445 93.6493 80.4151 83.7432 88.0878C86.9441 92.8835 90.2395 96.0688 94.8277 96.0688C99.8351 96.0688 101.855 92.199 102.193 89.1639H108.714C109.096 93.2053 107.074 110 88.848 110C77.8086 110 71.9721 103.602 67.5948 96.0978Z");
    			add_location(path13, file$1, 42, 3, 7804);
    			attr_dev(svg6, "viewBox", "0 0 120 120");
    			attr_dev(svg6, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg6, file$1, 41, 2, 7738);
    			attr_dev(symbol6, "id", "Logo_Quora");
    			add_location(symbol6, file$1, 40, 1, 7711);
    			attr_dev(path14, "d", "M63.7381 28.5649C64.1311 28.564 64.5239 28.585 64.9146 28.6278C64.459 28.3425 64.0835 27.9458 63.8237 27.4751C63.5639 27.0044 63.4283 26.4753 63.4297 25.9377V16.9024C63.4297 16.5254 63.4297 16.2056 63.0299 16.2056H60.5683C60.484 16.2111 60.4017 16.2339 60.3266 16.2725C60.2515 16.3111 60.1851 16.3647 60.1315 16.4301C60.078 16.4954 60.0384 16.571 60.0153 16.6523C59.9922 16.7335 59.986 16.8186 59.9971 16.9024V26.1091C60.0074 27.1045 60.254 28.0833 60.7168 28.9647C61.7009 28.6943 62.7175 28.5598 63.7381 28.5649ZM86.8462 28.5649V19.0613H88.9423C89.5781 19.0568 90.2082 19.1817 90.7943 19.4283C91.3804 19.675 91.9102 20.0383 92.3515 20.4962C92.7927 20.954 93.1363 21.4968 93.3612 22.0916C93.5861 22.6863 93.6877 23.3206 93.6598 23.9559C93.687 24.5799 93.5868 25.2029 93.3655 25.787C93.1442 26.3711 92.8064 26.9041 92.3725 27.3534C91.9386 27.8028 91.4179 28.1591 90.8419 28.4008C90.2659 28.6425 89.6468 28.7644 89.0222 28.7591C90.6496 29.1478 92.2065 29.7876 93.637 30.6553C94.7702 29.9747 95.7011 29.004 96.3336 27.8433C96.9662 26.6826 97.2774 25.3741 97.2351 24.053C97.2285 23.0094 97.0151 21.9774 96.6073 21.0168C96.1994 20.0561 95.6053 19.1858 94.8591 18.4561C94.113 17.7265 93.2297 17.1519 92.2602 16.7656C91.2906 16.3793 90.2542 16.189 89.2107 16.2056H84.5388C84.179 16.2056 83.3965 16.5369 83.3965 16.9024V28.8962C84.4617 28.6634 85.5505 28.5561 86.6406 28.5764C86.7777 28.5649 86.2751 28.5649 86.8462 28.5649ZM73.139 26.1091V16.9024C73.139 16.5369 73.139 16.2056 72.7734 16.2056H70.3118C70.2281 16.2127 70.1467 16.2365 70.0724 16.2756C69.9981 16.3147 69.9323 16.3684 69.8791 16.4333C69.8258 16.4983 69.7861 16.5733 69.7624 16.6538C69.7386 16.7344 69.7312 16.8189 69.7407 16.9024V25.9777C69.7685 26.7147 69.5206 27.4356 69.0453 27.9995C68.5701 28.5635 67.9016 28.93 67.1706 29.0276C68.7127 29.5073 69.9577 30.2784 71.3228 30.8552C72.6306 29.7072 73.139 27.9938 73.139 26.1091ZM76.5658 31.5634C78.2792 31.4206 79.4214 30.9923 79.9926 30.5239V17.0452C79.9926 16.6682 79.9412 16.2056 79.5642 16.2056H76.9142C76.5372 16.2056 76.5658 16.6682 76.5658 17.0452V31.5634ZM34.3018 30.8495V28.9476C34.3068 28.7612 34.2405 28.5799 34.1162 28.4408C33.992 28.3017 33.8194 28.2154 33.6336 28.1994H28.0193V16.9024C28.0181 16.7238 27.949 16.5523 27.8259 16.4229C27.7029 16.2935 27.5351 16.2158 27.3568 16.2056H25.3178C25.1311 16.2082 24.9524 16.2816 24.8178 16.411C24.6831 16.5403 24.6026 16.7159 24.5925 16.9024V29.7758C26.2885 30.9082 28.2659 31.5469 30.3038 31.6205C31.6758 31.646 33.0378 31.3834 34.3018 30.8495ZM39.442 17.0452C39.4026 16.8294 39.2956 16.6318 39.1364 16.4809C38.9773 16.3299 38.7743 16.2335 38.5567 16.2056H36.8433C36.6323 16.2352 36.4369 16.3335 36.2872 16.4852C36.1375 16.637 36.042 16.8337 36.0152 17.0452V29.7758C37.0872 29.2266 38.2469 28.869 39.442 28.7192V17.0452ZM103.74 41.3013C102.101 42.2559 100.238 42.7589 98.3403 42.7589C96.4431 42.7589 94.5797 42.2559 92.9402 41.3013C91.1496 40.2654 89.1176 39.72 87.049 39.72C84.9803 39.72 82.9483 40.2654 81.1577 41.3013C79.5182 42.2559 77.6548 42.7589 75.7576 42.7589C73.8604 42.7589 71.9971 42.2559 70.3575 41.3013C68.5671 40.2649 66.535 39.7192 64.4663 39.7192C62.3975 39.7192 60.3654 40.2649 58.575 41.3013C56.9551 42.2995 55.08 42.8055 53.1778 42.7577C51.2757 42.8048 49.4008 42.2989 47.7806 41.3013C46.0093 40.222 43.9658 39.673 41.8922 39.7192C39.8183 39.671 37.7743 40.2202 36.0038 41.3013C34.3838 42.2995 32.5087 42.8055 30.6065 42.7577C28.7044 42.8051 26.8294 42.2992 25.2093 41.3013C23.4388 40.2202 21.3948 39.671 19.3209 39.7192C17.2451 39.6699 15.199 40.2191 13.4268 41.3013C12.3706 41.9336 11.2102 42.3726 10 42.5977V43.6543C11.3851 43.4261 12.7145 42.9377 13.918 42.2151C15.5379 41.2168 17.413 40.7109 19.3152 40.7587C21.2174 40.7112 23.0924 41.2172 24.7124 42.2151C26.4829 43.2961 28.5269 43.8453 30.6008 43.7971C32.6767 43.8464 34.7228 43.2972 36.4949 42.2151C38.1149 41.2168 39.99 40.7109 41.8922 40.7587C43.7943 40.7112 45.6693 41.2172 47.2894 42.2151C49.0607 43.2943 51.1041 43.8434 53.1778 43.7971C55.2517 43.8453 57.2957 43.2961 59.0662 42.2151C60.7057 41.2604 62.569 40.7574 64.4663 40.7574C66.3635 40.7574 68.2268 41.2604 69.8664 42.2151C71.657 43.2509 73.689 43.7963 75.7576 43.7963C77.8262 43.7963 79.8583 43.2509 81.6489 42.2151C83.2884 41.2604 85.1517 40.7574 87.049 40.7574C88.9462 40.7574 90.8095 41.2604 92.449 42.2151C94.2396 43.2509 96.2717 43.7963 98.3403 43.7963C100.409 43.7963 102.441 43.2509 104.232 42.2151C105.852 41.2172 107.727 40.7112 109.629 40.7587H110V39.7363H109.629C107.557 39.6849 105.513 40.228 103.74 41.3013Z");
    			attr_dev(path14, "fill", "#000099");
    			add_location(path14, file$1, 47, 3, 8820);
    			attr_dev(path15, "d", "M109.629 31.4206C107.553 31.3786 105.508 31.9358 103.74 33.0255C102.101 33.9819 100.238 34.4858 98.3403 34.4858C96.4427 34.4858 94.5792 33.9819 92.9402 33.0255C91.1494 31.9902 89.1174 31.4452 87.049 31.4452C84.9805 31.4452 82.9485 31.9902 81.1577 33.0255C79.5182 33.9802 77.6548 34.4831 75.7576 34.4831C73.8604 34.4831 71.9971 33.9802 70.3575 33.0255C68.5671 31.9891 66.535 31.4434 64.4663 31.4434C62.3975 31.4434 60.3654 31.9891 58.575 33.0255C58.1866 33.2311 57.804 33.4367 57.4042 33.5966L55.1197 30.3697C56.0315 29.6217 56.768 28.6826 57.2772 27.6187C57.7864 26.5549 58.056 25.3923 58.0667 24.2129C58.0589 22.9412 57.7558 21.6886 57.1814 20.554C56.607 19.4194 55.7769 18.4336 54.7566 17.6745C53.7363 16.9153 52.5536 16.4035 51.3018 16.1793C50.05 15.9551 48.7632 16.0247 47.5428 16.3825C46.3225 16.7404 45.2019 17.3768 44.2694 18.2416C43.3369 19.1063 42.618 20.1758 42.1692 21.3658C41.7205 22.5557 41.5543 23.8336 41.6836 25.0988C41.8129 26.3639 42.2343 27.5818 42.9145 28.6563C46.7754 29.1875 47.4493 31.432 52.0527 31.5691L53.5776 34.4248H53.2006C51.2985 34.4719 49.4236 33.966 47.8034 32.9684C46.0322 31.8891 43.9887 31.3401 41.915 31.3863C39.8411 31.3382 37.7971 31.8873 36.0266 32.9684C34.4067 33.9666 32.5316 34.4726 30.6294 34.4248C28.7272 34.4723 26.8522 33.9663 25.2322 32.9684C23.4617 31.8873 21.4177 31.3382 19.3438 31.3863C17.254 31.3515 15.1988 31.9228 13.4268 33.0312C12.3711 33.6656 11.2106 34.1066 10 34.3334V35.39C11.3855 35.1601 12.715 34.6698 13.918 33.945C15.5379 32.9468 17.413 32.4408 19.3152 32.4886C21.2174 32.4411 23.0924 32.9471 24.7124 33.945C26.4829 35.0261 28.5269 35.5752 30.6008 35.5271C32.6747 35.5752 34.7187 35.0261 36.4892 33.945C38.1092 32.9468 39.9843 32.4408 41.8865 32.4886C43.7886 32.4411 45.6636 32.9471 47.2837 33.945C49.0566 35.0253 51.1022 35.5744 53.1778 35.5271C55.2517 35.5752 57.2957 35.0261 59.0662 33.945C60.7057 32.9904 62.569 32.4874 64.4663 32.4874C66.3635 32.4874 68.2268 32.9904 69.8664 33.945C71.657 34.9808 73.689 35.5262 75.7576 35.5262C77.8262 35.5262 79.8583 34.9808 81.6489 33.945C83.2884 32.9904 85.1517 32.4874 87.049 32.4874C88.9462 32.4874 90.8095 32.9904 92.449 33.945C94.2396 34.9808 96.2717 35.5262 98.3403 35.5262C100.409 35.5262 102.441 34.9808 104.232 33.945C105.852 32.9471 107.727 32.4411 109.629 32.4886H110V31.4206H109.629ZM49.8424 29.0561C48.5904 29.013 47.4041 28.4854 46.5336 27.5845C45.6632 26.6836 45.1767 25.4799 45.1767 24.2272C45.1767 22.9745 45.6632 21.7707 46.5336 20.8698C47.4041 19.9689 48.5904 19.4413 49.8424 19.3982C51.1198 19.419 52.3388 19.9372 53.24 20.8427C54.1413 21.7483 54.6538 22.9696 54.6685 24.2472C54.6639 25.5241 54.1535 26.7473 53.2489 27.6486C52.3443 28.55 51.1194 29.0561 49.8424 29.0561Z");
    			attr_dev(path15, "fill", "#000099");
    			add_location(path15, file$1, 48, 3, 13371);
    			attr_dev(path16, "d", "M103.74 37.1663C102.101 38.1209 100.238 38.6239 98.3403 38.6239C96.4431 38.6239 94.5797 38.1209 92.9402 37.1663C91.1496 36.1305 89.1176 35.5851 87.049 35.5851C84.9803 35.5851 82.9483 36.1305 81.1577 37.1663C79.5182 38.1209 77.6548 38.6239 75.7576 38.6239C73.8604 38.6239 71.9971 38.1209 70.3575 37.1663C68.5671 36.1299 66.535 35.5842 64.4663 35.5842C62.3975 35.5842 60.3654 36.1299 58.575 37.1663C56.9551 38.1645 55.08 38.6705 53.1778 38.6227C51.2756 38.6701 49.4006 38.1642 47.7806 37.1663C46.0093 36.087 43.9658 35.538 41.8922 35.5842C39.8183 35.536 37.7743 36.0852 36.0038 37.1663C34.3838 38.1645 32.5087 38.6705 30.6065 38.6227C28.7044 38.6701 26.8294 38.1642 25.2093 37.1663C23.4388 36.0852 21.3948 35.536 19.3209 35.5842C17.2451 35.5349 15.199 36.0842 13.4268 37.1663C12.3711 37.8007 11.2106 38.2417 10 38.4685V39.5251C11.3855 39.2951 12.715 38.8048 13.918 38.0801C15.5379 37.0819 17.413 36.5759 19.3152 36.6237C21.2174 36.5762 23.0924 37.0822 24.7124 38.0801C26.4829 39.1611 28.5269 39.7103 30.6008 39.6621C32.6747 39.7103 34.7187 39.1611 36.4892 38.0801C38.1092 37.0819 39.9843 36.5759 41.8865 36.6237C43.7886 36.5762 45.6636 37.0822 47.2837 38.0801C49.0566 39.1604 51.1022 39.7095 53.1778 39.6621C55.2517 39.7103 57.2957 39.1611 59.0662 38.0801C60.7057 37.1254 62.569 36.6224 64.4663 36.6224C66.3635 36.6224 68.2268 37.1254 69.8664 38.0801C71.657 39.1159 73.689 39.6613 75.7576 39.6613C77.8262 39.6613 79.8583 39.1159 81.6489 38.0801C83.2884 37.1254 85.1517 36.6224 87.049 36.6224C88.9462 36.6224 90.8095 37.1254 92.449 38.0801C94.2396 39.1159 96.2717 39.6613 98.3403 39.6613C100.409 39.6613 102.441 39.1159 104.232 38.0801C105.852 37.0822 107.727 36.5762 109.629 36.6237H110V35.6014H109.629C107.557 35.55 105.513 36.093 103.74 37.1663Z");
    			attr_dev(path16, "fill", "#000099");
    			add_location(path16, file$1, 49, 3, 16098);
    			attr_dev(svg7, "viewBox", "0 0 120 60");
    			attr_dev(svg7, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg7, file$1, 46, 2, 8755);
    			attr_dev(symbol7, "id", "Logo_Liquid");
    			add_location(symbol7, file$1, 45, 1, 8727);
    			attr_dev(path17, "d", "M28.6735 110C37.8735 110 45.3402 102.533 45.3402 93.3333V76.6666H28.6735C19.4735 76.6666 12.0068 84.1333 12.0068 93.3333C12.0068 102.533 19.4735 110 28.6735 110Z");
    			attr_dev(path17, "fill", "#0ACF83");
    			add_location(path17, file$1, 54, 3, 17984);
    			attr_dev(path18, "d", "M12.0068 60C12.0068 50.8 19.4735 43.3334 28.6735 43.3334H45.3402V76.6666H28.6735C19.4735 76.6666 12.0068 69.2 12.0068 60Z");
    			attr_dev(path18, "fill", "#A259FF");
    			add_location(path18, file$1, 55, 3, 18176);
    			attr_dev(path19, "d", "M12.0068 26.6667C12.0068 17.4667 19.4735 10 28.6735 10H45.3402V43.3333H28.6735C19.4735 43.3333 12.0068 35.8667 12.0068 26.6667Z");
    			attr_dev(path19, "fill", "#F24E1E");
    			add_location(path19, file$1, 56, 3, 18328);
    			attr_dev(path20, "d", "M45.3398 10H62.0065C71.2066 10 78.6732 17.4667 78.6732 26.6667C78.6732 35.8667 71.2066 43.3333 62.0065 43.3333H45.3398V10Z");
    			attr_dev(path20, "fill", "#FF7262");
    			add_location(path20, file$1, 57, 3, 18486);
    			attr_dev(path21, "d", "M78.6732 60C78.6732 69.2 71.2066 76.6666 62.0065 76.6666C52.8065 76.6666 45.3398 69.2 45.3398 60C45.3398 50.8 52.8065 43.3334 62.0065 43.3334C71.2066 43.3334 78.6732 50.8 78.6732 60Z");
    			attr_dev(path21, "fill", "#1ABCFE");
    			add_location(path21, file$1, 58, 3, 18639);
    			attr_dev(svg8, "viewBox", "0 0 90 120");
    			attr_dev(svg8, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg8, file$1, 53, 2, 17919);
    			attr_dev(symbol8, "id", "Logo_Figma");
    			add_location(symbol8, file$1, 52, 1, 17892);
    			attr_dev(path22, "d", "M105.795 69.9703C111.268 64.4968 111.268 55.591 105.795 50.1175C103.144 47.466 99.6184 46.0062 95.8688 46.0062C94.9781 46.0062 94.102 46.0875 93.2469 46.2472C96.9727 43.6988 99.3875 39.4132 99.3875 34.648C99.3875 26.9074 93.0898 20.6101 85.3492 20.6101C80.5746 20.6101 76.2816 23.0339 73.7348 26.7726C74.5773 22.3285 73.2559 17.5785 69.8793 14.2023C67.2289 11.5507 63.7031 10.0906 59.9539 10.0906C56.2039 10.0906 52.6789 11.5507 50.0273 14.2023C46.6512 17.5785 45.3297 22.3285 46.1719 26.7726C43.6254 23.0343 39.3324 20.6101 34.5574 20.6101C26.8172 20.6101 20.5199 26.907 20.5199 34.648C20.5199 39.4136 22.934 43.6988 26.6598 46.2472C25.7952 46.0862 24.9177 46.0055 24.0383 46.0062C20.2883 46.0062 16.7633 47.4664 14.1121 50.1179C11.4602 52.7691 10 56.2945 10 60.0437C10 63.7937 11.4602 67.3187 14.1117 69.9703C16.7629 72.6214 20.2883 74.082 24.0375 74.082C24.9281 74.082 25.8043 74.0007 26.6594 73.8406C22.9336 76.3894 20.5195 80.675 20.5195 85.4402C20.5195 93.1804 26.8164 99.4777 34.557 99.4777C39.332 99.4777 43.6254 97.0535 46.1719 93.3152C45.3293 97.7597 46.6508 102.51 50.0273 105.886C52.6785 108.537 56.2039 109.997 59.9531 109.997C63.7031 109.997 67.2285 108.537 69.8797 105.886C73.2559 102.509 74.5773 97.7593 73.7348 93.3152C76.2816 97.0535 80.5746 99.4777 85.3492 99.4777C93.0898 99.4777 99.3871 93.1808 99.3871 85.4402C99.3871 80.6746 96.973 76.3894 93.2469 73.8406C94.102 74.0007 94.9785 74.082 95.8688 74.082C99.6184 74.082 103.144 72.6214 105.795 69.9703Z");
    			attr_dev(path22, "fill", "black");
    			add_location(path22, file$1, 63, 3, 18961);
    			attr_dev(path23, "d", "M101.559 54.3508C98.4151 51.207 93.3175 51.207 90.1733 54.3508H73.6952L85.3472 42.6992C89.7937 42.6992 93.3979 39.0945 93.3979 34.648C93.3979 30.2016 89.7937 26.5965 85.3472 26.5965C80.9003 26.5965 77.296 30.2016 77.296 34.648L65.644 46.3V29.8215C68.7882 26.6773 68.7882 21.5797 65.644 18.4355C62.4995 15.291 57.4019 15.291 54.2577 18.4355C51.1136 21.5801 51.1136 26.6777 54.2577 29.8215V46.3L42.6062 34.6477C42.6062 30.2016 39.0015 26.5969 34.555 26.5969C30.1085 26.5969 26.5038 30.2016 26.5038 34.6477C26.5038 39.0945 30.1085 42.6992 34.5546 42.6992L46.2069 54.3508H29.7284C26.5839 51.2066 21.4862 51.207 18.3417 54.3508C15.1979 57.4953 15.1979 62.593 18.3417 65.7375C21.4862 68.8813 26.5839 68.8813 29.7284 65.7375H46.2062L34.555 77.3887C30.1085 77.3887 26.5038 80.993 26.5038 85.4395C26.5038 89.8863 30.1085 93.491 34.5546 93.491C39.0015 93.491 42.6062 89.8863 42.6062 85.4398L54.2577 73.7879V90.266C51.1136 93.4102 51.1136 98.5082 54.2577 101.652C57.4022 104.796 62.4999 104.796 65.6444 101.652C68.7882 98.5078 68.7882 93.4102 65.6444 90.2656V73.7879L77.296 85.4398C77.296 89.8863 80.9003 93.4906 85.3468 93.4906C89.7937 93.4906 93.3983 89.8863 93.3983 85.4398C93.3983 80.993 89.7937 77.3887 85.3472 77.3887L73.6948 65.7367H90.1733C93.3179 68.8813 98.4155 68.8813 101.559 65.7367C104.704 62.5926 104.704 57.4945 101.559 54.3504");
    			attr_dev(path23, "fill", "#FFB13B");
    			add_location(path23, file$1, 64, 3, 20461);
    			attr_dev(svg9, "viewBox", "0 0 120 120");
    			attr_dev(svg9, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg9, file$1, 62, 2, 18895);
    			attr_dev(symbol9, "id", "Logo_SVG");
    			add_location(symbol9, file$1, 61, 1, 18870);
    			attr_dev(path24, "d", "M10 10H110V110H10V10Z");
    			attr_dev(path24, "fill", "#F0DB4F");
    			add_location(path24, file$1, 69, 3, 21940);
    			attr_dev(path25, "d", "M101.816 86.1503C101.084 81.5875 98.1083 77.7567 89.2965 74.1826C86.2357 72.7757 82.8231 71.7682 81.806 69.4487C81.4448 68.0989 81.3973 67.3384 81.6254 66.521C82.2813 63.8689 85.4467 63.0419 87.9562 63.8023C89.5722 64.3441 91.1026 65.5895 92.0246 67.5761C96.3402 64.7815 96.3307 64.8004 99.344 62.8804C98.2414 61.1693 97.652 60.3803 96.9296 59.6484C94.3345 56.7492 90.7984 55.2568 85.1425 55.3708C84.1634 55.4944 83.1749 55.6274 82.1957 55.7511C79.3726 56.464 76.6824 57.9469 75.1045 59.9336C70.3707 65.3043 71.7205 74.7054 77.4809 78.5743C83.1558 82.8329 91.4923 83.8025 92.557 87.7854C93.5931 92.6618 88.9734 94.2397 84.3821 93.6789C80.998 92.9755 79.116 91.255 77.0817 88.1276C73.3365 90.2949 73.3365 90.2949 69.4867 92.5097C70.3993 94.5059 71.3592 95.409 72.8898 97.139C80.1331 104.487 98.2604 104.126 101.511 93.004C101.644 92.6237 102.519 90.0761 101.816 86.1503ZM64.3631 55.9601H55.0094C55.0094 64.04 54.9715 72.0628 54.9715 80.1427C54.9715 85.2853 55.2377 90.0001 54.4012 91.445C53.0323 94.2871 49.4867 93.9355 47.8707 93.384C46.2263 92.5761 45.3898 91.4259 44.4202 89.8005C44.154 89.3347 43.9544 88.9735 43.8878 88.945C41.3498 90.4944 38.8212 92.0532 36.2832 93.6028C37.5476 96.1978 39.4106 98.4507 41.7965 99.9145C45.3611 102.053 50.152 102.709 55.1616 101.559C58.4221 100.608 61.2357 98.6408 62.7091 95.6465C64.8383 91.7206 64.3821 86.9678 64.3631 81.7111C64.4106 73.1369 64.3631 64.5628 64.3631 55.9601Z");
    			attr_dev(path25, "fill", "#323330");
    			add_location(path25, file$1, 70, 3, 21992);
    			attr_dev(svg10, "viewBox", "0 0 120 120");
    			attr_dev(svg10, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg10, file$1, 68, 2, 21874);
    			attr_dev(symbol10, "id", "Logo_JavaScript");
    			add_location(symbol10, file$1, 67, 1, 21842);
    			attr_dev(path26, "d", "M10 60V10H110V110H10");
    			attr_dev(path26, "fill", "#007ACC");
    			add_location(path26, file$1, 75, 3, 23554);
    			attr_dev(path27, "d", "M31.9248 60.175V64.25H44.9248V101.25H54.1498V64.25H67.1499V60.25C67.1499 58 67.1499 56.175 67.0499 56.125C67.0499 56.05 59.1249 56.025 49.4998 56.025L31.9998 56.1V60.2L31.9248 60.175ZM90.3499 56C92.8999 56.6 94.8499 57.75 96.5999 59.575C97.5249 60.575 98.8999 62.325 98.9999 62.775C98.9999 62.925 94.6749 65.85 92.0499 67.475C91.9499 67.55 91.5499 67.125 91.1499 66.475C89.8499 64.625 88.5249 63.825 86.4499 63.675C83.4499 63.475 81.4499 65.05 81.4499 67.675C81.4499 68.475 81.5999 68.925 81.8999 69.575C82.5749 70.95 83.8249 71.775 87.6999 73.475C94.8499 76.55 97.9499 78.575 99.8249 81.475C101.95 84.725 102.425 89.8251 101 93.6501C99.3999 97.8251 95.4999 100.65 89.9249 101.575C88.1749 101.875 84.1749 101.825 82.2999 101.5C78.2999 100.75 74.4749 98.7501 72.1249 96.1751C71.1999 95.1751 69.4249 92.5001 69.5249 92.3251L70.4749 91.7251L74.2249 89.5501L77.0499 87.9001L77.6999 88.7751C78.5249 90.0751 80.3749 91.8251 81.4499 92.4251C84.6999 94.1001 89.0499 93.8751 91.1999 91.9251C92.1249 91.0751 92.5249 90.1751 92.5249 88.9251C92.5249 87.7751 92.3499 87.25 91.7749 86.375C90.9749 85.275 89.3749 84.375 84.8749 82.375C79.6999 80.175 77.4999 78.775 75.4499 76.625C74.2749 75.325 73.1999 73.3 72.6999 71.625C72.3249 70.175 72.1999 66.625 72.5499 65.2C73.6249 60.2 77.3999 56.7 82.7999 55.7C84.5499 55.35 88.6749 55.5 90.3999 55.95L90.3499 56Z");
    			attr_dev(path27, "fill", "white");
    			add_location(path27, file$1, 76, 3, 23605);
    			attr_dev(svg11, "viewBox", "0 0 120 120");
    			attr_dev(svg11, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg11, file$1, 74, 2, 23488);
    			attr_dev(symbol11, "id", "Logo_TypeScript");
    			add_location(symbol11, file$1, 73, 1, 23456);
    			attr_dev(path28, "d", "M93.201 26.0851C84.7148 13.9458 67.9526 10.3476 55.8346 18.0654L34.5534 31.6243C33.1217 32.5238 31.7861 33.5697 30.5709 34.7452C29.3543 35.9208 28.2641 37.2198 27.3173 38.6209C26.3705 40.0221 25.5716 41.5178 24.9327 43.0836C24.2955 44.6502 23.8223 46.2786 23.5209 47.9427C23.2693 49.3378 23.1321 50.7527 23.1138 52.1706C23.094 53.5901 23.1931 55.008 23.4081 56.4092C23.623 57.8119 23.9539 59.1948 24.3961 60.5426C24.8382 61.8904 25.3917 63.1985 26.0503 64.4548C25.5972 65.1434 25.1789 65.8543 24.797 66.5848C24.4143 67.3151 24.0698 68.0653 23.7633 68.8306C23.4569 69.596 23.19 70.3766 22.9629 71.1695C22.7357 71.9623 22.5497 72.7658 22.4033 73.5769C21.7951 76.9878 21.8755 80.4859 22.6396 83.8653C23.0208 85.5501 23.5682 87.1937 24.2756 88.7702C24.983 90.3467 25.8445 91.85 26.8508 93.2557C35.337 105.395 52.0977 108.993 64.2157 101.275L85.4969 87.7731C86.9286 86.872 88.2611 85.8245 89.4763 84.6475C90.6913 83.4714 91.7811 82.1725 92.7284 80.7718C93.6752 79.3722 94.4741 77.8765 95.113 76.3106C95.7518 74.7463 96.226 73.118 96.5294 71.4546C96.781 70.0595 96.9166 68.6461 96.9349 67.2282C96.9532 65.8103 96.8541 64.3923 96.6376 62.9912C96.4227 61.59 96.0918 60.2087 95.6481 58.8609C95.2045 57.5146 94.651 56.2064 93.9923 54.9501C94.4452 54.2625 94.8644 53.5504 95.2471 52.8201C95.6283 52.0898 95.9744 51.3397 96.2809 50.5743C96.5873 49.8089 96.8557 49.0283 97.0844 48.2355C97.3115 47.4442 97.5006 46.6407 97.6485 45.8295C97.9504 44.128 98.0815 42.4006 98.0418 40.6731C98.0022 38.9457 97.7903 37.2274 97.4091 35.5411C97.0279 33.8564 96.4806 32.2128 95.7731 30.6363C95.0666 29.0595 94.205 27.5569 93.201 26.1507");
    			attr_dev(path28, "fill", "#FF3E00");
    			add_location(path28, file$1, 81, 3, 25088);
    			attr_dev(path29, "d", "M53.7552 94.4297C52.0897 94.8624 50.3678 95.0383 48.6491 94.9512C46.9309 94.8627 45.2354 94.5151 43.6223 93.9159C42.0092 93.3177 40.4966 92.4771 39.1368 91.4231C37.778 90.3684 36.5879 89.1129 35.6072 87.6999C35.0019 86.8537 34.4835 85.9511 34.0596 85.0027C33.6346 84.055 33.3051 83.0672 33.0762 82.054C32.8491 81.0401 32.721 80.0064 32.6981 78.9681C32.6753 77.9298 32.7561 76.8915 32.939 75.8685C32.968 75.7023 33.0015 75.5361 33.0381 75.3714C33.0732 75.2052 33.1128 75.0406 33.1555 74.8774C33.1967 74.7128 33.2424 74.5496 33.2912 74.3865C33.3385 74.2249 33.3903 74.0633 33.4437 73.9032L33.8447 72.6789L34.9379 73.4946C35.5645 73.952 36.2109 74.3835 36.8742 74.786C37.5374 75.19 38.2174 75.5651 38.9126 75.9096C39.6064 76.2557 40.3169 76.5729 41.038 76.858C41.7592 77.1446 42.4926 77.3992 43.2366 77.6234L44.0523 77.8597L43.9791 78.6754C43.9398 79.2305 43.9976 79.7883 44.1499 80.3235C44.2246 80.5919 44.3237 80.8511 44.4441 81.1011C44.5646 81.3512 44.7064 81.5905 44.868 81.8162C45.1641 82.2418 45.5235 82.6197 45.9337 82.9368C46.3423 83.2539 46.7982 83.507 47.2846 83.687C47.7709 83.8669 48.2802 83.9705 48.7986 83.9965C49.3154 84.0239 49.8338 83.9705 50.3354 83.8394C50.4513 83.8089 50.5641 83.7739 50.6769 83.7342C50.7898 83.6946 50.9011 83.6519 51.0093 83.6031C51.1191 83.5558 51.2258 83.504 51.3326 83.4476C51.4378 83.3927 51.5399 83.3332 51.6405 83.2692L72.8898 69.7088C73.1503 69.5455 73.393 69.3554 73.614 69.1417C73.8351 68.9267 74.0317 68.6904 74.204 68.4357C74.3763 68.1811 74.5196 67.9082 74.6355 67.6231C74.7499 67.338 74.8352 67.0422 74.8901 66.7403C74.9435 66.4308 74.9664 66.1182 74.9587 65.8042C74.9511 65.4916 74.9115 65.1806 74.8413 64.8741C74.7727 64.5692 74.6721 64.2719 74.5425 63.9852C74.4144 63.7001 74.2559 63.4287 74.0729 63.1741C73.7771 62.7487 73.4188 62.3722 73.0087 62.055C72.5986 61.7379 72.1427 61.4848 71.6578 61.3049C71.1719 61.1249 70.6614 61.02 70.1438 60.9939C69.6255 60.9679 69.1071 61.0213 68.6055 61.1509C68.4911 61.1814 68.3768 61.2165 68.2639 61.2561C68.1511 61.2957 68.0413 61.3384 67.9316 61.3857C67.8218 61.4345 67.7151 61.4863 67.6099 61.5427C67.5047 61.5976 67.401 61.6586 67.3004 61.7226L59.1404 66.9035C58.808 67.1139 58.4665 67.3121 58.1188 67.4981C57.7697 67.6826 57.416 67.8548 57.0546 68.0134C56.6933 68.172 56.3258 68.3168 55.9538 68.4464C55.5818 68.5775 55.2052 68.6934 54.824 68.7956C53.1606 69.2255 51.4423 69.3993 49.7271 69.3109C48.0118 69.2225 46.321 68.8733 44.7109 68.2772C43.1009 67.6795 41.5915 66.8394 40.2345 65.7874C38.8776 64.7354 37.6883 63.4836 36.708 62.0733C36.1057 61.2271 35.5889 60.323 35.1666 59.3747C34.7427 58.4263 34.4149 57.4383 34.1877 56.426C33.9605 55.4121 33.8355 54.3783 33.8142 53.34C33.7913 52.3033 33.8721 51.265 34.0566 50.2434C34.4171 48.2322 35.1928 46.3182 36.3344 44.6235C37.4768 42.9289 38.9605 41.4915 40.6904 40.4033L62.0052 26.8444C62.336 26.634 62.6745 26.4358 63.0206 26.2498C63.3667 26.0653 63.7204 25.893 64.0787 25.7345C64.4378 25.5758 64.803 25.4314 65.1734 25.3015C65.5424 25.1703 65.9175 25.0529 66.2971 24.9508C67.9621 24.5193 69.6834 24.3424 71.4002 24.4294C73.1185 24.5178 74.8124 24.8654 76.4255 25.4646C78.0386 26.0623 79.5495 26.9039 80.9095 27.9574C82.2678 29.0127 83.4575 30.2687 84.4376 31.6822C85.0413 32.5268 85.5612 33.4294 85.9866 34.3778C86.412 35.3261 86.7413 36.3126 86.9716 37.3265C87.2003 38.3404 87.3283 39.3741 87.3512 40.4124C87.3756 41.4507 87.2963 42.489 87.1133 43.5121C87.0813 43.6798 87.0478 43.8475 87.0097 44.0137C86.9731 44.1799 86.9334 44.346 86.8907 44.5107C86.8496 44.6769 86.8038 44.8416 86.7566 45.0047C86.7093 45.1694 86.6605 45.3325 86.6072 45.4941L86.2001 46.7184L85.1145 45.9027C84.4864 45.4408 83.8384 45.0077 83.1736 44.6007C82.5089 44.1951 81.8258 43.817 81.129 43.4678C79.7341 42.772 78.2831 42.1946 76.7914 41.7419L75.9742 41.5056L76.0489 40.6899C76.0717 40.4109 76.0702 40.1303 76.0443 39.8529C76.0199 39.5754 75.9696 39.2994 75.8964 39.0295C75.8217 38.7612 75.7256 38.4974 75.6052 38.2459C75.4863 37.9928 75.3445 37.7519 75.1829 37.5232C74.8854 37.1053 74.526 36.7351 74.1171 36.4254C73.7088 36.1143 73.2553 35.8675 72.7724 35.6936C71.8019 35.3415 70.7471 35.2942 69.749 35.5579C69.6331 35.5884 69.5187 35.6234 69.4074 35.6616C69.2946 35.7012 69.1833 35.7454 69.0735 35.7927C68.9653 35.8399 68.857 35.8933 68.7518 35.9482C68.6466 36.0046 68.5429 36.0641 68.4423 36.1281L47.1535 49.6641C46.8943 49.8272 46.6518 50.0178 46.4323 50.2312C46.2127 50.4447 46.0145 50.681 45.8422 50.9341C45.6714 51.1887 45.5268 51.4599 45.4108 51.7437C45.2949 52.0288 45.2095 52.3231 45.1546 52.625C45.1013 52.9345 45.0784 53.2486 45.086 53.5626C45.1043 54.1913 45.2457 54.8103 45.5022 55.3846C45.6316 55.6705 45.7883 55.9432 45.9703 56.1988C46.2646 56.6196 46.6213 56.9947 47.0284 57.3087C47.4347 57.6243 47.8866 57.8762 48.3686 58.0558C49.3379 58.4162 50.3937 58.4741 51.3966 58.222C51.5109 58.19 51.6253 58.1549 51.7381 58.1153C51.8494 58.0756 51.9607 58.0314 52.0705 57.9842C52.1798 57.9367 52.2871 57.8848 52.3922 57.8287C52.4974 57.7738 52.6011 57.7143 52.7017 57.6503L60.8617 52.4786C61.1956 52.2652 61.5356 52.0639 61.8847 51.8779C62.2324 51.6904 62.5876 51.5181 62.9505 51.358C63.3121 51.1993 63.6799 51.0549 64.0528 50.925C64.4264 50.7938 64.8045 50.678 65.1872 50.5773C66.8521 50.1443 68.5719 49.9675 70.2902 50.0529C72.0085 50.1398 73.7024 50.4874 75.3155 51.0851C76.9271 51.6827 78.4395 52.5228 79.798 53.5779C81.158 54.6314 82.3472 55.8862 83.3276 57.2996C83.9314 58.1458 84.4498 59.0484 84.8751 59.9967C85.3005 60.9445 85.6304 61.9323 85.8601 62.9454C86.0888 63.9578 86.2168 64.9915 86.2412 66.0298C86.2656 67.0696 86.1848 68.1079 86.0034 69.1295C85.8236 70.1324 85.54 71.114 85.1572 72.0583C84.7747 73.0029 84.2944 73.9048 83.724 74.7494C83.1553 75.594 82.4997 76.3777 81.7679 77.0867C81.036 77.7957 80.2325 78.4269 79.3696 78.9696L58.0792 92.5285C57.7453 92.7404 57.4038 92.9401 57.0561 93.1262C56.707 93.3122 56.3517 93.4844 55.9889 93.643C55.6275 93.8031 55.2601 93.9479 54.8865 94.0791C54.5145 94.2102 54.1364 94.3276 53.7552 94.4297Z");
    			attr_dev(path29, "fill", "white");
    			add_location(path29, file$1, 82, 3, 26728);
    			attr_dev(svg12, "viewBox", "0 0 120 120");
    			attr_dev(svg12, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg12, file$1, 80, 2, 25022);
    			attr_dev(symbol12, "id", "Logo_Svelte");
    			add_location(symbol12, file$1, 79, 1, 24994);
    			attr_dev(path30, "d", "M71.548 17L60 37L48.452 17H10L60 103.604L110 17H71.548Z");
    			attr_dev(path30, "fill", "#4DBA87");
    			add_location(path30, file$1, 87, 3, 32850);
    			attr_dev(path31, "d", "M71.548 17L60 37L48.452 17H30L60 68.96L90 17H71.548Z");
    			attr_dev(path31, "fill", "#435466");
    			add_location(path31, file$1, 88, 3, 32936);
    			attr_dev(svg13, "viewBox", "0 0 120 120");
    			attr_dev(svg13, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg13, file$1, 86, 2, 32784);
    			attr_dev(symbol13, "id", "Logo_VueJS");
    			add_location(symbol13, file$1, 85, 1, 32757);
    			attr_dev(path32, "d", "M21.4468 101.964L15 29.655H85.84L79.3862 101.953L50.3765 109.995L21.4468 101.964Z");
    			attr_dev(path32, "fill", "#E44D26");
    			add_location(path32, file$1, 93, 3, 33129);
    			attr_dev(path33, "d", "M50.4199 103.848L73.8609 97.349L79.3764 35.5676H50.4199V103.848Z");
    			attr_dev(path33, "fill", "#F16529");
    			add_location(path33, file$1, 94, 3, 33241);
    			attr_dev(path34, "d", "M50.4201 62.3861H38.6851L37.8745 53.3047H50.4201V44.4362H28.1821L28.3946 46.8154L30.5743 71.2543H50.4201V62.3861ZM50.4201 85.4181L50.3811 85.4287L40.5044 82.7616L39.873 75.6888H30.9706L32.2132 89.6136L50.3795 94.6566L50.4201 94.6451V85.4181Z");
    			attr_dev(path34, "fill", "#EBEBEB");
    			add_location(path34, file$1, 95, 3, 33336);
    			attr_dev(path35, "d", "M21.5908 10.0046H26.0975V14.4573H30.2201V10.0046H34.727V23.4884H30.2201V18.9733H26.0975V23.4884H21.5911L21.5908 10.0046ZM40.6539 14.4763H36.6865V10.0046H49.1307V14.4763H45.1614V23.4884H40.654V14.4763H40.6539ZM51.1053 10.0046H55.8049L58.6957 14.7425L61.5837 10.0046H66.2849V23.4884H61.7959V16.805L58.6952 21.5992H58.6178L55.515 16.805V23.4884H51.1052V10.0046H51.1053ZM68.5275 10.0046H73.0355V19.0316H79.3737V23.4884H68.5275V10.0046Z");
    			attr_dev(path35, "fill", "black");
    			add_location(path35, file$1, 96, 3, 33608);
    			attr_dev(path36, "d", "M50.3892 62.3861V71.2543H61.3098L60.2802 82.7561L50.3892 85.4255V94.6519L68.5699 89.6136L68.7029 88.1148L70.7872 64.7676L71.0036 62.3861H68.614H50.3892ZM50.3892 44.4362V53.3047H71.8107L71.9883 51.3112L72.3924 46.8154L72.6046 44.4362H50.3892Z");
    			attr_dev(path36, "fill", "white");
    			add_location(path36, file$1, 97, 3, 34068);
    			attr_dev(svg14, "viewBox", "0 0 100 120");
    			attr_dev(svg14, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg14, file$1, 92, 2, 33063);
    			attr_dev(symbol14, "id", "Logo_HTML");
    			add_location(symbol14, file$1, 91, 1, 33037);
    			attr_dev(path37, "d", "M70.5166 13.7003H64.6401L70.7526 20.3368V23.493H58.1595V19.7968H64.272L58.1595 13.1602V10H70.5206L70.5166 13.7003ZM55.6593 13.7003H49.7749L55.8954 20.3368V23.493H43.2983V19.7968H49.4108L43.2983 13.1602V10H55.6593V13.7003ZM40.9461 13.8523H34.6056V19.6447H40.9461V23.497H30.0933V10H40.9461V13.8523Z");
    			attr_dev(path37, "fill", "#131313");
    			add_location(path37, file$1, 102, 3, 34447);
    			attr_dev(path38, "d", "M21.4485 101.971L15 29.6576H85.8457L79.3891 101.959L50.3788 110L21.4485 101.971Z");
    			attr_dev(path38, "fill", "#1572B6");
    			add_location(path38, file$1, 103, 3, 34774);
    			attr_dev(path39, "d", "M50.4229 103.856L73.8647 97.355L79.3772 35.5699H50.4229V103.856Z");
    			attr_dev(path39, "fill", "#33A9DC");
    			add_location(path39, file$1, 104, 3, 34885);
    			attr_dev(path40, "d", "M50.4229 61.7681H62.1598L62.9679 52.6874H50.4229V43.8228H72.6646L72.4526 46.2029L70.2724 70.6448H50.4229V61.7681Z");
    			attr_dev(path40, "fill", "white");
    			add_location(path40, file$1, 105, 3, 34980);
    			attr_dev(path41, "d", "M50.4709 84.8019H50.4309L40.5541 82.1337L39.9221 75.0612H31.0254L32.2695 88.9863L50.4389 94.0427H50.4909V84.8019H50.4709Z");
    			attr_dev(path41, "fill", "#EBEBEB");
    			add_location(path41, file$1, 106, 3, 35122);
    			attr_dev(path42, "d", "M61.4077 70.2568L60.3396 82.1258L50.4468 84.794V94.0347L68.6282 88.9943L68.7602 87.4942L70.3044 70.2528H61.4077V70.2568Z");
    			attr_dev(path42, "fill", "white");
    			add_location(path42, file$1, 107, 3, 35274);
    			attr_dev(path43, "d", "M50.4551 43.8228V52.6914H29.0374L28.8534 50.6993L28.4493 46.2029L28.2373 43.8228H50.4551ZM50.4231 61.7681V70.6368H40.6583L40.4863 68.6446L40.0823 64.1483L39.8702 61.7681H50.4191H50.4231Z");
    			attr_dev(path43, "fill", "#EBEBEB");
    			add_location(path43, file$1, 108, 3, 35423);
    			attr_dev(svg15, "viewBox", "0 0 100 120");
    			attr_dev(svg15, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg15, file$1, 101, 2, 34381);
    			attr_dev(symbol15, "id", "Logo_CSS");
    			add_location(symbol15, file$1, 100, 1, 34356);
    			attr_dev(path44, "d", "M109.026 36.1319C108.748 35.9 106.243 33.9985 100.863 33.9985C99.4719 33.9985 98.0341 34.1376 96.6427 34.3695C95.6224 27.2735 89.7322 23.8414 89.5003 23.6559L88.0626 22.821L87.135 24.166C85.9755 25.9748 85.0943 28.0155 84.5841 30.1026C83.6101 34.1376 84.2131 37.9407 86.2538 41.1873C83.7957 42.5786 79.807 42.9033 78.9722 42.9497H13.1135C11.3974 42.9497 10.0061 44.3411 10.0061 46.0571C9.91329 51.8081 10.8873 57.5592 12.8816 62.9856C15.1542 68.9221 18.5399 73.3282 22.8995 76.0182C27.8157 79.0328 35.8394 80.7489 44.8833 80.7489C48.9647 80.7489 53.0461 80.3779 57.0811 79.6358C62.693 78.6154 68.073 76.6675 73.0356 73.8384C77.117 71.473 80.781 68.4584 83.8884 64.9335C89.1293 59.0433 92.2367 52.4575 94.5093 46.6137H95.4369C101.142 46.6137 104.666 44.3411 106.614 42.3931C107.913 41.1873 108.887 39.7031 109.583 38.0335L110 36.8276L109.026 36.1319Z");
    			attr_dev(path44, "fill", "#0091E2");
    			add_location(path44, file$1, 113, 3, 35751);
    			attr_dev(path45, "d", "M19.2357 41.0482H28.0478C28.4652 41.0482 28.8362 40.7235 28.8362 40.2597V32.3752C28.8362 31.9578 28.5116 31.5868 28.0478 31.5868H19.2357C18.8183 31.5868 18.4473 31.9114 18.4473 32.3752V40.2597C18.4936 40.7235 18.8183 41.0482 19.2357 41.0482ZM31.3871 41.0482H40.1992C40.6166 41.0482 40.9876 40.7235 40.9876 40.2597V32.3752C40.9876 31.9578 40.663 31.5868 40.1992 31.5868H31.3871C30.9697 31.5868 30.5987 31.9114 30.5987 32.3752V40.2597C30.645 40.7235 30.9697 41.0482 31.3871 41.0482ZM43.7704 41.0482H52.5825C52.9999 41.0482 53.3709 40.7235 53.3709 40.2597V32.3752C53.3709 31.9578 53.0463 31.5868 52.5825 31.5868H43.7704C43.353 31.5868 42.982 31.9114 42.982 32.3752V40.2597C42.982 40.7235 43.3066 41.0482 43.7704 41.0482ZM55.9682 41.0482H64.7803C65.1977 41.0482 65.5687 40.7235 65.5687 40.2597V32.3752C65.5687 31.9578 65.2441 31.5868 64.7803 31.5868H55.9682C55.5508 31.5868 55.1797 31.9114 55.1797 32.3752V40.2597C55.1797 40.7235 55.5508 41.0482 55.9682 41.0482ZM31.3871 29.778H40.1992C40.6166 29.778 40.9876 29.4069 40.9876 28.9895V21.105C40.9876 20.6876 40.663 20.3166 40.1992 20.3166H31.3871C30.9697 20.3166 30.5987 20.6412 30.5987 21.105V28.9895C30.645 29.4069 30.9697 29.778 31.3871 29.778ZM43.7704 29.778H52.5825C52.9999 29.778 53.3709 29.4069 53.3709 28.9895V21.105C53.3709 20.6876 53.0463 20.3166 52.5825 20.3166H43.7704C43.353 20.3166 42.982 20.6412 42.982 21.105V28.9895C42.982 29.4069 43.3066 29.778 43.7704 29.778ZM55.9682 29.778H64.7803C65.1977 29.778 65.5687 29.4069 65.5687 28.9895V21.105C65.5687 20.6876 65.1977 20.3166 64.7803 20.3166H55.9682C55.5508 20.3166 55.1797 20.6412 55.1797 21.105V28.9895C55.1797 29.4069 55.5508 29.778 55.9682 29.778ZM55.9682 18.4614H64.7803C65.1977 18.4614 65.5687 18.1367 65.5687 17.673V9.78846C65.5687 9.37104 65.1977 9 64.7803 9H55.9682C55.5508 9 55.1797 9.32466 55.1797 9.78846V17.673C55.1797 18.0904 55.5508 18.4614 55.9682 18.4614ZM68.2587 41.0482H77.0708C77.4882 41.0482 77.8593 40.7235 77.8593 40.2597V32.3752C77.8593 31.9578 77.5346 31.5868 77.0708 31.5868H68.2587C67.8413 31.5868 67.4703 31.9114 67.4703 32.3752V40.2597C67.5167 40.7235 67.8413 41.0482 68.2587 41.0482Z");
    			attr_dev(path45, "fill", "#0091E2");
    			add_location(path45, file$1, 114, 3, 36631);
    			attr_dev(svg16, "viewBox", "0 0 120 90");
    			attr_dev(svg16, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg16, file$1, 112, 2, 35686);
    			attr_dev(symbol16, "id", "Logo_Docker");
    			add_location(symbol16, file$1, 111, 1, 35658);
    			attr_dev(path46, "d", "M16.7062 85.0189C17.1602 85.826 17.8159 86.4313 18.623 86.8852L57.4628 109.281C59.0769 110.24 61.0441 110.24 62.6078 109.281L101.448 86.8852C103.062 85.9773 104.02 84.2623 104.02 82.396V37.604C104.02 35.7377 103.062 34.0227 101.448 33.1148L62.6078 10.7188C60.9937 9.7604 59.0265 9.7604 57.4628 10.7188L18.623 33.1148C16.9584 34.0227 16 35.7377 16 37.604V82.4464C16 83.3543 16.2018 84.2118 16.7062 85.0189Z");
    			attr_dev(path46, "fill", "#009639");
    			add_location(path46, file$1, 119, 3, 38892);
    			attr_dev(path47, "d", "M47.5763 77.0996C47.5763 79.8739 45.3568 82.0933 42.5826 82.0933C39.8083 82.0933 37.5889 79.8739 37.5889 77.0996V42.85C37.5889 40.1766 39.9596 38.0076 43.2383 38.0076C45.609 38.0076 48.3833 38.966 50.0479 41.0341L51.5611 42.85L72.4439 67.8184V42.9508C72.4439 40.1766 74.6633 37.9572 77.4375 37.9572C80.2118 37.9572 82.4312 40.1766 82.4312 42.9508V77.2005C82.4312 79.8739 80.0605 82.0429 76.7818 82.0429C74.4111 82.0429 71.6368 81.0845 69.9722 79.0164L47.5763 52.2825V77.0996Z");
    			attr_dev(path47, "fill", "white");
    			add_location(path47, file$1, 120, 3, 39328);
    			attr_dev(svg17, "viewBox", "0 0 120 120");
    			attr_dev(svg17, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg17, file$1, 118, 2, 38826);
    			attr_dev(symbol17, "id", "Logo_Nginx");
    			add_location(symbol17, file$1, 117, 1, 38799);
    			attr_dev(path48, "d", "M17.5435 22.7021C17.3501 22.7021 17.3017 22.6054 17.3984 22.4603L18.4139 21.1547C18.5106 21.0096 18.7524 20.9129 18.9458 20.9129H36.2089C36.4023 20.9129 36.4507 21.058 36.3539 21.2031L35.5319 22.4603C35.4352 22.6054 35.1934 22.7504 35.0483 22.7504L17.5435 22.7021ZM10.2418 27.1508C10.0483 27.1508 9.99998 27.0541 10.0967 26.909L11.1122 25.6034C11.2089 25.4584 11.4507 25.3617 11.6441 25.3617H33.6944C33.8878 25.3617 33.9845 25.5067 33.9362 25.6518L33.5493 26.8123C33.5009 27.0058 33.3075 27.1025 33.1141 27.1025L10.2418 27.1508ZM21.9439 31.5996C21.7505 31.5996 21.7021 31.4545 21.7988 31.3094L22.4758 30.1005C22.5725 29.9555 22.7659 29.8104 22.9594 29.8104H32.6305C32.824 29.8104 32.9207 29.9555 32.9207 30.1489L32.824 31.3094C32.824 31.5029 32.6305 31.6479 32.4855 31.6479L21.9439 31.5996ZM72.1373 21.8317C69.0909 22.6054 67.0116 23.1856 64.0135 23.9593C63.2882 24.1528 63.2398 24.2011 62.6112 23.4758C61.8859 22.6537 61.3539 22.1218 60.3385 21.6383C57.2921 20.1392 54.3423 20.5744 51.5861 22.3636C48.2979 24.4913 46.6054 27.6344 46.6538 31.5512C46.7021 35.4197 49.3617 38.6112 53.1818 39.1431C56.47 39.5783 59.2263 38.4178 61.4023 35.9516C61.8375 35.4197 62.2244 34.8394 62.7079 34.1624H53.3752C52.3597 34.1624 52.118 33.5338 52.4565 32.7118C53.0851 31.2127 54.2456 28.6982 54.9226 27.441C55.0677 27.1508 55.4062 26.6673 56.1315 26.6673H73.7331C73.6363 27.9729 73.6363 29.2785 73.4429 30.5841C72.911 34.0657 71.6054 37.2572 69.4777 40.0619C65.9961 44.6557 61.4507 47.5087 55.6963 48.2824C50.9574 48.911 46.557 47.9922 42.6886 45.0909C39.1102 42.3829 37.0793 38.8046 36.5474 34.3559C35.9187 29.0851 37.4661 24.3462 40.6576 20.1876C44.0909 15.6905 48.6363 12.8375 54.1973 11.822C58.7427 11 63.0948 11.5319 67.0116 14.1914C69.5745 15.8839 71.412 18.205 72.6209 21.0096C72.911 21.4448 72.7176 21.6866 72.1373 21.8317Z");
    			attr_dev(path48, "fill", "#01ADD8");
    			add_location(path48, file$1, 125, 3, 39939);
    			attr_dev(path49, "d", "M88.1432 48.5726C83.7428 48.4759 79.7293 47.2186 76.3444 44.3173C73.4914 41.8511 71.7022 38.708 71.1219 34.9846C70.2515 29.5204 71.7506 24.6848 75.0388 20.3811C78.5688 15.7389 82.8241 13.3212 88.5784 12.3057C93.5107 11.4353 98.1529 11.9188 102.36 14.7718C106.18 17.383 108.549 20.913 109.178 25.5552C110 32.0832 108.114 37.4024 103.617 41.9478C100.426 45.1877 96.5088 47.2186 92.0117 48.1374C90.7061 48.3792 89.4005 48.4275 88.1432 48.5726ZM99.6519 29.0368C99.6036 28.4082 99.6036 27.9246 99.5069 27.4411C98.6364 22.6538 94.2361 19.9459 89.6423 21.0097C85.1452 22.0252 82.2438 24.8782 81.18 29.4237C80.3096 33.1954 82.1471 37.0155 85.6287 38.5629C88.2883 39.7235 90.9479 39.5784 93.5107 38.2728C97.3308 36.2902 99.4101 33.1954 99.6519 29.0368Z");
    			attr_dev(path49, "fill", "#01ADD8");
    			add_location(path49, file$1, 126, 3, 41785);
    			attr_dev(svg18, "viewBox", "0 0 120 60");
    			attr_dev(svg18, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg18, file$1, 124, 2, 39874);
    			attr_dev(symbol18, "id", "Logo_Go");
    			add_location(symbol18, file$1, 123, 1, 39850);
    			attr_dev(path50, "d", "M12 354s-24-17 5-41l67-59s19-21 40-3l619 469v225s-1 35-46 31z");
    			attr_dev(path50, "fill", "#2489ca");
    			add_location(path50, file$1, 131, 3, 42678);
    			attr_dev(path51, "d", "M172 499 12 644s-16 12 0 34l74 67s18 19 44-2l169-129z");
    			attr_dev(path51, "fill", "#1070b3");
    			add_location(path51, file$1, 132, 3, 42770);
    			attr_dev(path52, "d", "m452 500 293-223-2-224s-13-49-55-23L299 384z");
    			attr_dev(path52, "fill", "#0877b9");
    			add_location(path52, file$1, 133, 3, 42854);
    			attr_dev(path53, "d", "M697 976c17 18 38 12 38 12l228-112c29-20 25-45 25-45V160c0-30-30-40-30-40L760 25c-43-27-71 5-71 5s36-27 54 23v887c0 7-2 13-4 18-5 10-17 20-44 16z");
    			attr_dev(path53, "fill", "#3c99d4");
    			add_location(path53, file$1, 134, 3, 42929);
    			attr_dev(svg19, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg19, "viewBox", "-11.9 -2 1003.9 995.6");
    			add_location(svg19, file$1, 130, 2, 42602);
    			attr_dev(symbol19, "id", "Logo_VSC");
    			add_location(symbol19, file$1, 129, 1, 42577);
    			attr_dev(path54, "d", "M255 158a13 13 0 0 0-10.7-8.6c-2.5-.3-5.3-.2-8.6.5-5.8 1.2-10.1 1.6-13.3 1.7a255 255 0 0 0 27-64.2c9-34.7 4.2-50.5-1.4-57.6A77.5 77.5 0 0 0 185.6.4c-14-.2-26.2 2.5-32.5 4.5-6-1-12.3-1.6-19-1.7a61.7 61.7 0 0 0-33 8.1c-5.3-1.7-13.7-4.2-23.5-5.8-22.8-3.8-41.2-.9-54.7 8.7C6.6 25.7-.9 45.7.5 73.6c.4 9 5.4 36 13.2 61.5 4.5 14.7 9.3 27 14.2 36.3 7 13.4 14.6 21.2 23 24a22.6 22.6 0 0 0 22.4-4.8c1.1 1.4 2.7 2.7 4.7 4 2.6 1.6 5.7 3 8.9 3.8 11.3 2.8 22 2 31-1.9a581.5 581.5 0 0 1 .3 10.7A109.5 109.5 0 0 0 123 240c1.4 4.2 3.6 11 9.3 16.5 6 5.5 13.1 7.3 19.7 7.3 3.3 0 6.4-.5 9.2-1 9.8-2.2 21-5.4 29-16.9 7.6-10.8 11.4-27.2 12-53l.3-2 .1-1.4 1.8.2h.5c10 .4 22.2-1.7 29.7-5.2 6-2.7 25-12.8 20.5-26.3");
    			add_location(path54, file$1, 139, 3, 43257);
    			attr_dev(path55, "d", "M238 160.7c-29.8 6.2-31.9-4-31.9-4 31.4-46.5 44.5-105.6 33.2-120.1C208.4-3 155 15.8 154 16.3h-.3a106 106 0 0 0-19.8-2 49 49 0 0 0-31.4 9.3S7-15.7 11.5 73.1c1 18.9 27 142.9 58.2 105.4 11.4-13.7 22.4-25.3 22.4-25.3 5.5 3.7 12 5.5 18.9 4.8l.5-.4c-.2 1.7 0 3.4.2 5.3-8 9-5.6 10.6-21.7 13.9-16.2 3.3-6.7 9.3-.5 10.8 7.6 2 25 4.6 36.8-12l-.4 2c3.1 2.5 5.3 16.3 5 29-.4 12.5-.7 21.1 1.8 27.8 2.5 6.8 5 22 26 17.4 17.7-3.7 26.8-13.5 28-29.9 1-11.6 3-9.8 3.2-20.2l1.6-5c1.9-15.7.3-20.7 11.2-18.4l2.6.2c8 .4 18.4-1.2 24.6-4 13.2-6.2 21-16.5 8-13.8");
    			attr_dev(path55, "fill", "#336791");
    			add_location(path55, file$1, 140, 3, 43962);
    			attr_dev(path56, "d", "M108 81.5c-2.6-.3-5 0-6.3 1-.6.5-.9 1-1 1.5 0 1 .7 2.3 1.2 3 1.3 1.7 3.3 3 5.2 3.2h.9c3.2 0 6.2-2.5 6.4-4.3.4-2.4-3-4-6.3-4.4m88.8.1c-.3-1.8-3.6-2.4-6.6-2-3.1.5-6.1 1.9-5.9 3.7.2 1.5 2.8 3.9 5.8 3.9h.8c2-.3 3.6-1.6 4.3-2.4 1-1.1 1.7-2.4 1.6-3.2");
    			attr_dev(path56, "fill", "#FFF");
    			add_location(path56, file$1, 141, 3, 44530);
    			attr_dev(path57, "d", "M247.8 160c-1.1-3.4-4.8-4.5-10.8-3.3-18 3.8-24.5 1.2-26.6-.4 14-21.3 25.5-47 31.7-71.1 3-11.4 4.6-22 4.7-30.6.1-9.5-1.5-16.4-4.8-20.7a70.4 70.4 0 0 0-56.9-26.5c-16.3-.2-30.2 4-32.8 5.2a82 82 0 0 0-18.6-2.4c-12.2-.2-22.9 2.7-31.7 8.7-3.8-1.4-13.6-4.8-25.7-6.7-20.9-3.4-37.5-.8-49.3 7.5-14.1 10-20.7 28-19.4 53.2.4 8.5 5.3 34.6 13 59.7 10 33 21 51.6 32.4 55.5 1.4.4 3 .7 4.6.7 4.2 0 9.4-1.9 14.7-8.3a529.8 529.8 0 0 1 20.3-23c4.5 2.5 9.5 3.8 14.6 4v.4a117.7 117.7 0 0 0-2.6 3.2c-3.5 4.4-4.2 5.4-15.5 7.7-3.3.7-11.8 2.4-12 8.4-.1 6.6 10.2 9.3 11.3 9.6 4.1 1 8 1.6 11.8 1.6 9 0 17-3 23.5-8.8-.2 23.4.8 46.4 3.6 53.4 2.3 5.8 7.9 19.8 25.6 19.8 2.6 0 5.5-.3 8.7-1 18.5-4 26.5-12.1 29.6-30.2 1.7-9.6 4.6-32.6 5.9-45 2.8.9 6.5 1.3 10.4 1.3 8.3 0 17.8-1.8 23.7-4.5 6.7-3.1 18.8-10.7 16.6-17.4zm-44.1-83.5c0 3.7-.6 7-1.1 10.5-.6 3.7-1.2 7.5-1.3 12.2-.2 4.5.4 9.2 1 13.8a49.2 49.2 0 0 1-2.2 28 36.5 36.5 0 0 1-2-4c-.5-1.2-1.7-3.4-3.3-6.3-6.4-11.5-21.4-38.4-13.7-49.3 2.2-3.3 8-6.7 22.6-4.9zm-17.6-61.7c21.3.4 38.2 8.4 50.1 23.7 9.2 11.7-1 65-30.1 111a171.3 171.3 0 0 0-1-1.2l-.3-.4c7.6-12.5 6-24.8 4.8-35.8-.6-4.5-1-8.7-1-12.7a90 90 0 0 1 1.3-11.3 71.6 71.6 0 0 0 1.3-16c-.5-5-6.3-20.2-18-33.8a81 81 0 0 0-28.6-21.5c5.5-1.2 13-2.2 21.5-2zm-119.4 161c-6 7-10 5.7-11.3 5.3-8.8-3-18.9-21.4-27.8-50.7A330.7 330.7 0 0 1 15 72.5C13.8 50 19.3 34.2 31.2 25.8c19.4-13.8 51.3-5.6 64.2-1.4l-.6.5c-21 21.3-20.5 57.6-20.5 59.8 0 .9 0 2 .2 3.7.3 6.1 1 17.5-.8 30.4-1.7 12 2 23.6 10.1 32a36.3 36.3 0 0 0 2.6 2.6 541 541 0 0 0-19.7 22.4zm22.5-30a31 31 0 0 1-8.2-26 157 157 0 0 0 .8-31.8v-2.3c3-2.7 17.2-10.3 27.4-8 4.6 1 7.4 4.2 8.6 9.6 6 28.1.8 39.9-3.4 49.3a91 91 0 0 0-2.4 5.6l-.6 1.5c-1.3 3.7-2.6 7.2-3.4 10.4-7 0-13.7-3-18.8-8.3zm1 37.9c-2-.5-3.8-1.4-4.9-2.1.9-.4 2.5-1 5.2-1.6 13.4-2.7 15.4-4.7 20-10.4 1-1.3 2.1-2.8 3.8-4.6 2.4-2.7 3.5-2.2 5.5-1.4 1.6.7 3.2 2.7 3.8 5 .3 1 .7 3-.5 4.6-9.4 13.1-23 13-32.9 10.5zm69.8 65c-16.3 3.4-22-4.9-25.9-14.4-2.4-6.2-3.6-33.9-2.8-64.5 0-.4 0-.8-.2-1.1a15.4 15.4 0 0 0-.4-2.2 15 15 0 0 0-8.1-9.7c-1.5-.6-4.2-1.7-7.5-1 .7-2.8 2-6 3.2-9.5l.6-1.5c.6-1.7 1.4-3.4 2.2-5.2 4.4-9.9 10.5-23.3 4-53.8-2.5-11.4-10.8-17-23.3-15.7A53.5 53.5 0 0 0 82 76.7c1-11.5 4.6-33 18-46.6a44.3 44.3 0 0 1 33.6-12.6 71.2 71.2 0 0 1 54.4 26c8.5 10 13 20.1 14.9 25.5-13.8-1.4-23.1 1.4-27.9 8.1-10.3 14.8 5.7 43.4 13.3 57.2 1.4 2.5 2.7 4.7 3 5.6a51 51 0 0 0 8.1 13l2 2.6c-4.2 1.2-11.7 4-11 17.8-.5 7-4.4 39.6-6.4 51-2.6 15.3-8.2 21-24 24.3zm68.1-78c-4.2 2-11.4 3.5-18.1 3.8-7.5.3-11.3-.9-12.2-1.6-.4-8.6 2.8-9.5 6.2-10.5l1.5-.5 1 .8c6 4 16.8 4.4 32 1.3h.1c-2 1.8-5.5 4.4-10.5 6.7z");
    			attr_dev(path57, "fill", "#FFF");
    			add_location(path57, file$1, 142, 3, 44802);
    			attr_dev(svg20, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg20, "viewBox", "0 0 256 264");
    			attr_dev(svg20, "preserveAspectRatio", "xMinYMin meet");
    			add_location(svg20, file$1, 138, 2, 43155);
    			attr_dev(symbol20, "id", "Logo_PostgreSQL");
    			add_location(symbol20, file$1, 137, 1, 43123);
    			attr_dev(path58, "d", "M17.7 19.9a2 2 0 0 1-.7.1h-1a2 2 0 0 1-2-2v-3c0-1.1.9-2 2-2h1a2 2 0 0 1 2 2v3c0 .5-.2 1-.5 1.3l.8.8-.7.7-1-1Zm-1-.9H16a1 1 0 0 1-1-1v-3c0-.6.4-1 1-1h1c.6 0 1 .4 1 1v3c0 .2 0 .4-.2.6l-1.4-1.4-.7.7 1 1.1ZM8 10a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h17a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3H8Zm2 3a2 2 0 1 0 0 4h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1H8c0 1.1.9 2 2 2h1a2 2 0 1 0 0-4h-1a1 1 0 1 1 0-2h1c.6 0 1 .5 1 1h1a2 2 0 0 0-2-2h-1Zm15 6v1h-5v-7h1v6h4Z");
    			attr_dev(path58, "fill", "#FFAB00");
    			attr_dev(path58, "fill-rule", "evenodd");
    			add_location(path58, file$1, 147, 3, 47505);
    			attr_dev(svg21, "viewBox", "0 0 32 32");
    			attr_dev(svg21, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg21, file$1, 146, 2, 47441);
    			attr_dev(symbol21, "id", "Logo_SQL");
    			add_location(symbol21, file$1, 145, 1, 47416);
    			attr_dev(path59, "d", "M25.4119 56.7741C28.0057 53.6718 28.3108 50.4677 26.302 44.5173C25.0305 40.7536 22.9198 37.8548 24.4709 35.5153C26.1239 33.0232 29.633 35.4392 26.7088 38.7702L27.2936 39.1773C30.803 39.5841 32.5321 34.7778 29.9127 33.4048C22.9961 29.7939 16.944 36.736 19.6139 44.7716C20.7584 48.179 22.3604 51.7899 21.0635 54.6636C19.9446 57.1302 17.7832 58.5796 16.3336 58.6304C13.3076 58.7831 15.3166 51.8409 18.8004 50.1116C19.1055 49.9593 19.5377 49.7558 19.1309 49.2472C14.8334 48.764 12.3158 50.7474 10.8664 53.5192C6.64514 61.5802 18.8766 64.5554 25.4119 56.7741ZM100.936 33.0741C101.928 35.5155 103.429 37.9312 102.538 40.0671C101.801 41.8981 100.835 42.6608 99.7666 42.839C98.2664 43.0933 98.6733 38.3888 101.242 36.9903C101.47 36.8632 101.801 36.2528 101.496 35.8968C98.2408 35.7189 96.41 37.2698 95.4182 39.3298C92.5448 45.3564 101.928 47.0095 106.531 41.0843C108.362 38.7194 108.438 36.38 106.683 32.1331C105.564 29.4378 103.861 27.4288 104.929 25.6487C106.073 23.7671 108.819 25.3946 106.76 27.912L107.217 28.1663C109.887 28.3189 110.981 24.7589 108.947 23.8689C103.581 21.5802 98.5715 27.3526 100.936 33.0741V33.0741ZM66.9631 26.6405C65.1069 25.1657 59.8938 27.6323 58.419 31.294C56.5625 35.9476 53.8162 42.7374 51.1207 45.7124C48.2727 48.8401 47.993 46.4245 48.2727 44.619C48.9338 40.3724 53.0787 30.5312 55.342 27.7595C54.5028 26.5134 49.01 26.6915 45.1957 32.6165C43.7719 34.8542 40.5168 42.305 36.9059 48.179C36.1176 49.4505 35.1258 48.5605 35.8887 45.5853C36.7533 42.1524 39.2961 32.7181 42.5766 25.2929C51.1715 23.5892 60.3006 22.3939 67.2936 22.3685C68.2346 22.1142 68.8703 21.2751 67.2936 21.2241C61.267 21.0208 52.2143 21.7327 43.7463 22.8009C45.3739 19.5458 47.1283 16.9521 48.9084 15.8587C46.9758 14.638 43.0598 15.1212 40.8219 18.4271C39.8303 19.9019 38.8385 21.6819 37.8977 23.6146C31.6928 24.5808 26.3781 25.6743 23.6828 26.6915C20.8856 27.7595 21.1906 31.1415 22.8944 30.506C26.4291 29.1837 31.2098 27.8103 36.5244 26.5898C33.1424 34.2187 30.4977 43.2204 29.8619 46.8821C28.2854 55.7825 33.8033 55.7315 36.499 52.2224C39.4233 48.3825 45.5264 34.8796 46.4672 33.4556C46.7469 32.9724 47.1283 33.2267 46.925 33.6591C40.11 47.2636 40.6948 52.5274 46.2129 51.3577C48.7051 50.8237 53.0026 46.5517 54.1213 44.3394C54.3502 43.8052 54.8334 43.8562 54.7317 44.0851C50.4088 55.2993 44.916 64.3774 41.2287 67.2255C37.8721 69.7939 35.3801 64.2249 47.2555 56.2401C49.0102 55.0448 48.1963 53.4175 46.2129 53.9769C40.0846 54.9433 22.5385 60.512 14.8334 65.8523C14.2485 66.2591 13.7145 66.5898 13.7399 67.429C13.7653 67.912 14.6045 67.7341 15.0114 67.4798C24.9795 61.504 33.1422 59.1644 42.5002 57.2064C42.6274 57.2571 42.7799 57.2825 42.9071 57.2317C43.3395 57.1302 43.3141 57.3589 43.0342 57.537C42.3985 57.8931 41.7627 58.2235 41.6104 58.2745C35.3037 60.7411 31.4893 66.1827 32.8371 68.9546C33.9817 71.345 40.1608 70.4804 43.0852 68.9038C50.2561 65.0132 55.4692 57.3843 59.0291 46.8569C62.1315 37.5243 66.0477 26.9458 66.9631 26.6405V26.6405ZM108.641 48.179C96.9696 46.6532 71.7946 48.6876 60.6821 51.6374C57.3764 52.5021 58.2918 54.2565 59.9701 53.9261C59.9955 53.9261 60.7074 53.748 60.733 53.748C69.8619 51.9681 92.0108 50.4169 104.929 52.8835C106.48 53.1632 111.133 48.5097 108.641 48.179ZM70.218 46.806C73.4729 45.1784 78.3045 35.1085 81.483 29.5903C81.7119 29.1835 82.1188 29.5142 81.8901 29.7939C73.8543 43.6273 77.2619 45.2294 80.4405 45.0259C84.6871 44.7716 88.6033 38.6685 89.4678 37.2954C89.8239 36.7614 90.0274 37.1939 89.8239 37.5751C89.6205 38.2108 88.883 39.3298 88.1963 40.8556C87.2301 43.0169 88.2471 43.8562 89.0864 44.2376C90.4086 44.8733 94.0198 44.4665 94.5791 42.254C90.9682 42.1778 99.6141 25.1403 100.504 24.0978C98.0883 22.6991 94.3502 24.2247 92.6465 27.5815C89.0102 34.7778 85.9586 40.5757 84.0514 40.6774C80.3389 40.881 88.3235 24.6317 89.6205 24.1231C88.8321 22.9788 83.7717 23.462 80.949 27.8358C79.9319 29.4124 73.7272 40.3978 72.2016 42.2032C69.5061 45.4073 69.3026 42.661 70.0655 39.4569C70.3198 38.3634 70.752 36.9648 71.3115 35.4136C73.0914 31.396 74.9987 30.1245 76.1684 28.8276C84.026 20.1054 88.527 13.036 86.7469 10.2642C85.1703 7.79756 79.9065 8.89112 76.5244 13.9771C70.2944 23.3095 64.5473 36.1001 63.8098 41.9489C63.0979 47.7976 67.3446 48.23 70.218 46.806ZM73.5239 29.6921C73.8035 29.0564 73.9815 28.8784 74.4647 27.8103C77.2619 21.6565 80.7711 15.172 83.1869 12.146C84.6871 10.5694 86.7979 12.7054 82.9834 18.5542C80.7457 22.0124 78.2028 25.1911 75.4311 27.9884V28.0138C74.719 28.8021 74.0834 29.4632 73.8035 29.8446C73.6 30.0989 73.3713 30.0481 73.5239 29.6921V29.6921Z");
    			attr_dev(path59, "fill", "#333333");
    			attr_dev(path59, "stroke", "#aaa");
    			attr_dev(path59, "stroke-width", "1");
    			add_location(path59, file$1, 152, 3, 48097);
    			attr_dev(svg22, "viewBox", "0 0 120 80");
    			attr_dev(svg22, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg22, file$1, 151, 2, 48032);
    			attr_dev(symbol22, "id", "Logo_Stylus");
    			add_location(symbol22, file$1, 150, 1, 48004);
    			attr_dev(path60, "d", "M92.4 45c-3.1 0-5.8.8-8.1 2-.9-1.7-1.7-3.2-1.8-4.3-.2-1.2-.4-2-.2-3.6.2-1.5 1-3.6 1-3.8 0-.2-.1-1-2-1-1.7 0-3.3.4-3.5.9-.2.4-.5 1.5-.7 2.7-.3 1.6-3.7 7.5-5.5 10.6a11 11 0 01-1.3-3c-.1-1.4-.3-2.1-.1-3.7.2-1.5 1-3.6 1-3.8 0-.2-.2-1-2-1s-3.3.4-3.5.9l-.8 2.7c-.3 1-4.7 11-5.9 13.5a55 55 0 01-1.4 3l-.1.2-.5.9c-.2.5-.5.9-.6.9-.1 0-.3-1.2 0-2.8.7-3.4 2.2-8.8 2.2-9 0 0 .3-1-1-1.5s-1.7.3-1.8.3l-.2.3s1.4-6-2.8-6c-2.6 0-6.1 2.9-8 5.5-1 .6-3.4 2-6 3.3L36 50.8l-.2-.2c-5-5.4-14.3-9.2-14-16.5.2-2.6 1.1-9.6 18-18 13.7-7 24.7-5 26.6-.8 2.8 6-5.8 17.2-20.2 18.8-5.4.6-8.3-1.5-9-2.3-.7-.8-.8-.8-1.1-.7-.5.3-.2 1 0 1.4.4 1.2 2.2 3.1 5.1 4.1 2.7.9 9 1.4 16.8-1.6 8.7-3.4 15.4-12.8 13.4-20.6-2-8-15.1-10.6-27.6-6.2a62.5 62.5 0 00-21.1 12.2c-6.9 6.5-8 12.1-7.5 14.4 1.6 8.4 13 13.8 17.5 17.8l-.6.4c-2.3 1.1-11 5.7-13.2 10.6-2.4 5.5.4 9.4 2.3 10 6 1.6 12-1.4 15.2-6.2a15.4 15.4 0 001.3-14.1v-.1l1.8-1c1.1-.8 2.3-1.4 3.3-2-.6 1.6-1 3.4-1.2 6-.3 3.2 1 7.2 2.7 8.8a3 3 0 002.1.7c2 0 2.9-1.6 3.8-3.5 1.2-2.4 2.3-5.1 2.3-5.1s-1.3 7.4 2.3 7.4c1.3 0 2.6-1.7 3.2-2.6l.1-.2.2-.3 3.5-6.6c2.2-4.5 4.4-10.1 4.4-10.1s.2 1.4.9 3.6c.4 1.4 1.2 2.9 1.9 4.3l-.9 1.2-1.4 1.7c-1.7 2.2-3.9 4.7-4.2 5.4-.3.8-.2 1.4.4 2 .5.3 1.3.4 2.2.3 1.6-.1 2.8-.5 3.3-.8 1-.3 2-.8 2.9-1.5a6.4 6.4 0 002.7-5.6c0-1.4-.5-2.7-1-4l.4-.7c2.8-4.1 5-8.6 5-8.6s.2 1.4.8 3.6c.4 1.2 1 2.4 1.6 3.7a15.7 15.7 0 00-4.8 6.2c-1 3-.2 4.4 1.3 4.7.7.2 1.7-.2 2.4-.5 1-.3 2-.8 3-1.5 1.8-1.4 3.5-3.2 3.4-5.6 0-1.2-.3-2.3-.7-3.4 2.2-.9 5-1.4 8.7-1 7.8 1 9.4 5.9 9 8-.2 2-1.9 3.1-2.4 3.5-.6.3-.7.4-.7.7 0 .4.3.3.8.3.7-.1 4.1-1.7 4.3-5.5.2-4.9-4.4-10.2-12.6-10.1zM32.1 65.7c-2.6 2.8-6.2 3.9-7.7 3-1.7-1-1-5.2 2.1-8.2 2-1.9 4.5-3.6 6.1-4.6l1.6-1 .2-.1.4-.3c1.2 4.4 0 8.2-2.7 11.2zm19-13c-1 2.2-2.9 8-4 7.6-1-.3-1.6-4.6-.2-8.8.7-2.2 2.2-4.7 3-5.7 1.5-1.6 3-2.1 3.4-1.5.5.9-1.7 7-2.3 8.4zm15.5 7.5c-.4.2-.7.4-.9.2l.2-.3 2.7-3 1.5-2v.2c0 2.5-2.4 4.2-3.5 5zm12-2.7c-.2-.3-.2-1 .7-3A11 11 0 0182 51l.3 1.5c0 3.2-2.3 4.4-3.7 4.9z");
    			attr_dev(path60, "fill", "#CF649A");
    			add_location(path60, file$1, 157, 3, 52799);
    			attr_dev(svg23, "viewBox", "0 0 120 80");
    			attr_dev(svg23, "fill", "none");
    			attr_dev(svg23, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg23, file$1, 156, 2, 52722);
    			attr_dev(symbol23, "id", "Logo_SASS_SCSS");
    			add_location(symbol23, file$1, 155, 1, 52691);
    			attr_dev(path61, "d", "M93 29.6a1 1 0 00-1-.8l-8-.6-5.9-5.8c-.6-.6-1.7-.4-2.2-.3l-3 1c-1.7-5.2-4.9-9.9-10.4-9.9H62c-1.5-2-3.5-3-5.2-3-12.9 0-19 16.1-21 24.3l-9 2.7c-2.7 1-2.8 1-3.2 3.6L16 99.1l57 10.7 30.8-6.7L93 29.6zM69.7 24L65 25.5v-1c0-3.2-.5-5.8-1.2-7.8 2.9.3 4.8 3.6 6 7.3zm-9.5-6.7c.8 2 1.3 4.8 1.3 8.7v.5l-10 3c2-7.3 5.6-10.8 8.7-12.2zm-3.8-3.6a3 3 0 011.6.6C54 16.2 49.6 21 47.7 30.8l-7.9 2.4c2.2-7.4 7.4-19.5 16.7-19.5z");
    			attr_dev(path61, "fill", "#95BF46");
    			add_location(path61, file$1, 162, 3, 54898);
    			attr_dev(path62, "d", "M92 28.8l-8-.6-5.9-5.8c-.2-.2-.5-.4-.8-.4L73 109.8l30.8-6.7L93 29.6a1 1 0 00-.8-.8");
    			attr_dev(path62, "fill", "#5E8E3E");
    			add_location(path62, file$1, 163, 3, 55335);
    			attr_dev(path63, "d", "M62.5 45.8l-3.8 11.3s-3.3-1.8-7.4-1.8c-6 0-6.3 3.8-6.3 4.7 0 5.2 13.4 7.1 13.4 19.2 0 9.5-6 15.6-14.1 15.6-9.8 0-14.8-6-14.8-6L32 80s5.1 4.4 9.5 4.4c2.8 0 4-2.2 4-3.8 0-6.7-11-7-11-18 0-9.4 6.6-18.4 20.1-18.4 5.2 0 7.8 1.5 7.8 1.5");
    			attr_dev(path63, "fill", "#fff");
    			add_location(path63, file$1, 164, 3, 55448);
    			attr_dev(svg24, "viewBox", "0 0 120 120");
    			attr_dev(svg24, "fill", "none");
    			attr_dev(svg24, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg24, file$1, 161, 2, 54820);
    			attr_dev(symbol24, "id", "Logo_Shopify");
    			add_location(symbol24, file$1, 160, 1, 54791);
    			attr_dev(circle0, "cx", "37.5");
    			attr_dev(circle0, "cy", "37.5");
    			attr_dev(circle0, "fill", "#302e31");
    			attr_dev(circle0, "r", "35.8");
    			attr_dev(circle0, "stroke", "#fff");
    			attr_dev(circle0, "stroke-width", "3.47");
    			add_location(circle0, file$1, 169, 3, 55827);
    			attr_dev(path64, "fill", "#c4c2c4");
    			attr_dev(path64, "d", "m19.3 18.7c1.1-5.31 4.7-10.1 9.54-12.5-.842.855-1.86 1.51-2.64 2.44-3.19 3.44-4.63 8.42-3.75 13 1.11 6.99 7.68 12.7 14.8 12.6 5.52.247 10.9-2.93 13.6-7.72 5.78.196 11.4 3.18 14.7 7.97 1.69 2.5 3.01 5.43 3.1 8.48-1.07-4.05-3.76-7.65-7.43-9.68-3.55-2-7.91-2.51-11.8-1.33-4.88 1.4-8.91 5.39-10.3 10.3-1.18 3.91-.675 8.22 1.18 11.8-2.58 4.47-7.24 7.66-12.3 8.62-3.89.816-7.98.186-11.6-1.45 3.24.945 6.76 1.11 9.98-.035 4.32-1.43 7.89-4.9 9.46-9.18 1.74-4.66 1.08-10.2-1.85-14.2-2.19-3.15-5.64-5.37-9.39-6.16-1.19-.212-2.39-.308-3.59-.418-1.91-3.85-2.61-8.32-1.65-12.5z");
    			add_location(path64, file$1, 170, 3, 55918);
    			attr_dev(svg25, "viewBox", "-.035 -.035 75.07 75.07");
    			attr_dev(svg25, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg25, file$1, 168, 2, 55749);
    			attr_dev(symbol25, "id", "Logo_OBS");
    			add_location(symbol25, file$1, 167, 1, 55724);
    			attr_dev(path65, "d", "M0,0h7.75a45.5,45.5 0 1 1 0,91h-7.75v-20h7.75a25.5,25.5 0 1 0 0,-51h-7.75zm36.2510,0h32a27.75,27.75 0 0 1 21.331,45.5a27.75,27.75 0 0 1 -21.331,45.5h-32a53.6895,53.6895 0 0 0 18.7464,-20h13.2526a7.75,7.75 0 1 0 0,-15.5h-7.75a53.6895,53.6895 0 0 0 0,-20h7.75a7.75,7.75 0 1 0 0,-15.5h-13.2526a53.6895,53.6895 0 0 0 -18.7464,-20z");
    			add_location(path65, file$1, 176, 4, 56616);
    			attr_dev(clipPath0, "id", "d3js-clip");
    			add_location(clipPath0, file$1, 175, 3, 56586);
    			attr_dev(stop0, "offset", "0");
    			attr_dev(stop0, "stop-color", "#f9a03c");
    			add_location(stop0, file$1, 179, 4, 57084);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#f7974e");
    			add_location(stop1, file$1, 180, 4, 57134);
    			attr_dev(linearGradient0, "id", "d3js-gradient-1");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			attr_dev(linearGradient0, "x1", "7");
    			attr_dev(linearGradient0, "y1", "64");
    			attr_dev(linearGradient0, "x2", "50");
    			attr_dev(linearGradient0, "y2", "107");
    			add_location(linearGradient0, file$1, 178, 3, 56979);
    			attr_dev(stop2, "offset", "0");
    			attr_dev(stop2, "stop-color", "#f26d58");
    			add_location(stop2, file$1, 183, 4, 57308);
    			attr_dev(stop3, "offset", "1");
    			attr_dev(stop3, "stop-color", "#f9a03c");
    			add_location(stop3, file$1, 184, 4, 57358);
    			attr_dev(linearGradient1, "id", "d3js-gradient-2");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			attr_dev(linearGradient1, "x1", "2");
    			attr_dev(linearGradient1, "y1", "-2");
    			attr_dev(linearGradient1, "x2", "87");
    			attr_dev(linearGradient1, "y2", "84");
    			add_location(linearGradient1, file$1, 182, 3, 57204);
    			attr_dev(stop4, "offset", "0");
    			attr_dev(stop4, "stop-color", "#b84e51");
    			add_location(stop4, file$1, 187, 4, 57535);
    			attr_dev(stop5, "offset", "1");
    			attr_dev(stop5, "stop-color", "#f68e48");
    			add_location(stop5, file$1, 188, 4, 57585);
    			attr_dev(linearGradient2, "id", "d3js-gradient-3");
    			attr_dev(linearGradient2, "gradientUnits", "userSpaceOnUse");
    			attr_dev(linearGradient2, "x1", "45");
    			attr_dev(linearGradient2, "y1", "-10");
    			attr_dev(linearGradient2, "x2", "108");
    			attr_dev(linearGradient2, "y2", "53");
    			add_location(linearGradient2, file$1, 186, 3, 57428);
    			attr_dev(path66, "d", "M-100,-102m-27,0v300h300z");
    			attr_dev(path66, "fill", "url(#d3js-gradient-1)");
    			add_location(path66, file$1, 191, 4, 57691);
    			attr_dev(path67, "d", "M-100,-102m27,0h300v300z");
    			attr_dev(path67, "fill", "url(#d3js-gradient-3)");
    			add_location(path67, file$1, 192, 4, 57768);
    			attr_dev(path68, "d", "M-100,-102l300,300");
    			attr_dev(path68, "fill", "none");
    			attr_dev(path68, "stroke", "url(#d3js-gradient-2)");
    			attr_dev(path68, "stroke-width", "40");
    			add_location(path68, file$1, 193, 4, 57844);
    			attr_dev(g0, "clip-path", "url(#d3js-clip)");
    			add_location(g0, file$1, 190, 3, 57655);
    			attr_dev(svg26, "viewBox", "0 0 96 91");
    			add_location(svg26, file$1, 174, 2, 56557);
    			attr_dev(symbol26, "id", "Logo_d3js");
    			add_location(symbol26, file$1, 173, 1, 56531);
    			attr_dev(path69, "d", "M0 6C0 2.68629 2.68629 0 6 0H34C37.3137 0 40 2.68629 40 6V24C40 27.3137 37.3137 30 34 30H6C2.68629 30 0 27.3137 0 24V6Z");
    			attr_dev(path69, "fill", "#FFCE00");
    			add_location(path69, file$1, 203, 4, 58266);
    			attr_dev(mask, "id", "flag_de_clip");
    			set_style(mask, "mask-type", "alpha");
    			attr_dev(mask, "maskUnits", "userSpaceOnUse");
    			attr_dev(mask, "x", "0");
    			attr_dev(mask, "y", "0");
    			attr_dev(mask, "width", "40");
    			attr_dev(mask, "height", "30");
    			add_location(mask, file$1, 202, 3, 58151);
    			attr_dev(path70, "d", "M0 10H40V20H0V10Z");
    			attr_dev(path70, "fill", "#DD0000");
    			add_location(path70, file$1, 206, 4, 58461);
    			attr_dev(path71, "d", "M0 0H40V10H0V0Z");
    			attr_dev(path71, "fill", "#000000");
    			add_location(path71, file$1, 207, 4, 58510);
    			attr_dev(path72, "d", "M0 20H40V30H0V20Z");
    			attr_dev(path72, "fill", "#FFCE00");
    			add_location(path72, file$1, 208, 4, 58557);
    			attr_dev(g1, "mask", "url(#flag_de_clip)");
    			add_location(g1, file$1, 205, 3, 58427);
    			attr_dev(svg27, "viewBox", "0 0 40 30");
    			attr_dev(svg27, "fill", "none");
    			attr_dev(svg27, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg27, file$1, 201, 2, 58075);
    			attr_dev(symbol27, "id", "Flag_de");
    			add_location(symbol27, file$1, 200, 1, 58051);
    			attr_dev(rect0, "width", "40");
    			attr_dev(rect0, "height", "30");
    			attr_dev(rect0, "rx", "6");
    			attr_dev(rect0, "fill", "black");
    			add_location(rect0, file$1, 215, 4, 58813);
    			attr_dev(rect1, "width", "40");
    			attr_dev(rect1, "height", "30");
    			attr_dev(rect1, "fill", "url(#flag_en_db)");
    			add_location(rect1, file$1, 216, 4, 58868);
    			attr_dev(path73, "d", "M0 0H40L6 30H0V0Z");
    			attr_dev(path73, "fill", "url(#flag_en_us)");
    			add_location(path73, file$1, 217, 4, 58927);
    			attr_dev(path74, "d", "M41 -1L5 31");
    			attr_dev(path74, "stroke", "var(--page-bg)");
    			attr_dev(path74, "stroke-width", "3");
    			add_location(path74, file$1, 218, 4, 58985);
    			attr_dev(g2, "clip-path", "url(#clip0_1015:6)");
    			add_location(g2, file$1, 214, 3, 58774);
    			xlink_attr(use0, "xlink:href", "#flag_en_gb_flag");
    			attr_dev(use0, "transform", "scale(0.00314465 0.00628931)");
    			add_location(use0, file$1, 222, 5, 59164);
    			attr_dev(pattern0, "id", "flag_en_db");
    			attr_dev(pattern0, "patternContentUnits", "objectBoundingBox");
    			attr_dev(pattern0, "width", "1");
    			attr_dev(pattern0, "height", "1");
    			add_location(pattern0, file$1, 221, 4, 59072);
    			xlink_attr(use1, "xlink:href", "#flag_en_us_flag");
    			attr_dev(use1, "transform", "translate(-0.210484) scale(0.00714286 0.00952381)");
    			add_location(use1, file$1, 225, 5, 59353);
    			attr_dev(pattern1, "id", "flag_en_us");
    			attr_dev(pattern1, "patternContentUnits", "objectBoundingBox");
    			attr_dev(pattern1, "width", "1");
    			attr_dev(pattern1, "height", "1");
    			add_location(pattern1, file$1, 224, 4, 59261);
    			attr_dev(rect2, "width", "40");
    			attr_dev(rect2, "height", "30");
    			attr_dev(rect2, "rx", "6");
    			attr_dev(rect2, "fill", "#ffffff");
    			add_location(rect2, file$1, 228, 5, 59505);
    			attr_dev(clipPath1, "id", "clip0_1015:6");
    			add_location(clipPath1, file$1, 227, 4, 59471);
    			attr_dev(image0, "id", "flag_en_gb_flag");
    			attr_dev(image0, "width", "318");
    			attr_dev(image0, "height", "159");
    			xlink_attr(image0, "xlink:href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT4AAACfCAYAAABgD7XPAAATIUlEQVR4Ae2dTYsdRRfHy4WEWQQUF5kHQtCNCAN+A/0IguAm8CxGRSbzbFz5AdzEbbITIRuDoGuXIYiQiYMbIUoQhZClEtxEnwSDD/VQPXPOvdP3pbveT9X5X7jU3Je53X3qf3516tTpbnP/vQ/tXz//aiU8njx9Zm/cvGXNpSvWmP2hfe6VQ4tnGRuY59+1X3x1e7YUvn/tDXu8s2ePX3i97HNnz7ptz324Y3LHBh2V0ZGzM/vw7sHg08635zz+998n9uH1z5Lr6Tvzqr1jztkf33nfPr5335qTN84Pb0gBoDOQE+tgQACwmMMCfOXA0CuEGXiXrtjPv/xmDuuG7/zz+E/74Oo1e2ResnfNy8nAR8D76fLBmQDP0Gi96Quz9zzTFwHAcs4I8JWzdW/giwXeXfOvDMDbHNAx+FoAoLl4iClwxqk/wAfw+QKZgXfhwCvCc1PanBGem9Jum8GugO8sAI3IKTAb+9KVYtNAX0G0+H2AD+Cbq1v2wV0/4A1T2k+u2zvmfIYIbz6vNoLvLABPkoLbCJppprvxZ13+wHUSFkHSOSvAl86WcwHS2vcYeMJzeBvBcfrBJPjOAnDznHlqQ7k+BwDTOSvAl86WrQFtan+jgPfJdXtkdjNEeOE8mg2+swA8Z8erJLnANvd3HQCXO2eqI/H5qpMDfKs20a4T9qmLh145PFqlLb1oMZcX3uAbA3AqiTh3R1J9bwDghQNMgQMWQQA+gI9Az8B78QMv4A2LFgJyeFM8CQbfWQDOTypO7VCqzzEF9ndigM/fZgSKXloGXmAOL8+iRfoZZjT4zgIwfM6dCnjj30Ed4HxnBvjm26oX0NFxMPBCprRDDq9M4fHYv0NfG1clXaJSOnQHU/0fIsBppwb4pm1EoOilZeAFRni5cni51xAMFRK2EqLGgnA4b3MXOcB1jgvw6QEfA6+xwuNY/6f/N/RHK0lJ2t/YFqvAq04O8K3aZN0A0fJ7DLzAKW2uAKn0IimDj0BCEWCuELb0AdJxbWoxBV44O8C3sEXLcFu37wy8wCltqYsHbPLT1O+vgI82QKeWSCs8pP1L3QKAh8Olm1wqYO4Dl6WSD8oo4AksPJ6rzanvbQQf/SMVIvZGfDq+cat5CoyITz7I1kVz695j4HmeS0szvjwBj5xTXyfBR2CgCLCXOT4d16Z2WARRVggN8LUPvijgNVB4vMlffd83JqQyO+MFA5EDrOd8AF8926+L2nzeY+AF5vByBTS5y1J8gbeo6li6zLub5s190BRYyyKIM5gTYs9XgwH42gNfFPAaLDyey6fx98b+a2hUgQHHplr/uudFEICvHfBF+evVa1Z7wMLgSwLAq9eGG3poOBOkxxwgwCcffAy8kBRVtghP3rn64wiP+EbtCvj4A5oCBxo4T86gPQOTPVtoAT654GPgBRcen1NzaqqZsSi5EXzkqFEGR0jd1KXxAT554GP/C1y00FSG5pg1Nwc/Cb4VAIZ0QMZCSGmrRi3nAAE+OeCLBZ72HB5xa1M7G3z0A7EdomUEGnKAjd0VDuCrDz72LxQer19dPH03NsDwBt8KAD07KG8htLwcoOugVm6LCfDVA18o8OBPYX0WDL5YAGo5NYaGrdgRiuydswX4wpwopk8YeCEppIwnEkhLIaWeQUWDjzo9tgORkyjvdNR31AJ85fogyl+QM49eNEwGPnYeKoPBCEbB3tpWYgQI8OUHHwMvpCwFVRLRwGNO0R+p26gOHk6WRt1R6j6Z+j2ALx/42B9QF7s2EKA3pwqPpzQ89/PkEd94w7EdnmcVWN4iSKkOH/fP8muALz34WP+BM6A7RkcAMOTwZhQeL+s15u/s4KOdixUAcoDpnZL6hlqAL52No/Se7dSy9LdppEgttK2V8ikGPnaumBygIkHUiAABvnjwRQEPObxkOTzizaa2OPhoR2IFkudcYHkj4jAFKFQIDfCFg4/1rPSuZXMjvloRHnGH2mrg4x2gCDBEMIquGOsEw8516UqWkRHg8wcf94moQn45l3gnIA4DuKDbulYH3woAPQWEQmh/ZyWbj1uAb74tGXiBixZ5Fu3kzVhKDNhjHc95LQZ8tLNRgspY2KnhkvgA3zT4oE+K4ba3Uqa0xJVxKw58tINRAlN0Kk/KERXg2ww+1qNn4THNSLRUJUgHHvOF/pDahgou78nbfeZQAL5V8LH+UHi8NcRLOQCXYJHYiG988CzAkEWQjBFgT1NggG8BPtZbYA5PVdWBoEWLMTc2vW4GfHQAsYLUMuUIqQME+A7PrJy7KGbug2YYmhYtnE/OveIx+a+UtjnwkeEYgJ45Fwh0EdWQLanVDD7WU2CEhwF1s65IX5LaZsFHRowVLKYkC8FqBB/rJySHly2FIu9c8lYWLYgLU23z4KMDjBKwokLooZCUisZHhdCawMd6CZwx5Lp4gMSc8Zy7lpEfttJ2Az4yeJSglZ8rqQF8rI/AKa2mHN6yrci/emm7Ax91zHKnhSWpdzPch/S8lXhJb2ezIUlt9q2LCOc+vn/tDXu8s2ePX3i97HNnz7ptz30MUa7Z50R8iB605PB6m9ISD8Ztt+CjA40CYLYcjtBTi8y+vXHz1lyeDPBpAXzumBzYfYBHhcdHJscAKK8OVAvwmAv0R+8tA9DzXGBaBc6zCCIvif3g4W/dgc/nmLT197acb89M6D7iG3ceAxCF0LMBt+mLrUx1N+3/8vsD8K5es3kGOHkR/gC8Qpc7G/ughNfqwEdGZwAGJrm15HyW4TD+uwfwUYSXa0orOqc7WtUn39DQqgUfdW4sALWs8o2h5163DD6K8LQMYC7Cc5pv9UwL8tdUrTHmssWTbPDWYIvrn35tnzx9ts7XV94jB7pjjM3x/OHNt+0fR8cr25XwRovg+/v3R/aXjz7O0leu/yXV4TkNOy2f+PeJtuHrp74uwYGwD21aoEXwtWlp7HVqC5jUP4jf02MBgE9PX/d2pABfbz1a8HgAvoLGxqaSWgDgS2pOXT8G8Onq756OFuDrqTcLHwvAV9jg2FwyCwB8yUyp74cAPn193ssRA3y99GSF4wD4Khgdm0xiAYAviRl1/gjAp7PfezhqgK+HXqx0DABfJcNjs9EWAPiiTaj3BwA+vX3f+pGbR7e/tXjCBr4acKfR1Qaf2wff/cb3oXWnAeOuSoEnbBCigSoXIaWrPe/sQbfw3WANmOKXDSfhoi17uXbYG/aGBlgDAB/EwGLAIFj43iHQXjXtAXwQXzXxAbQAbS0NAHwAH8AHDajTAMAH0asTfa0oA9uVE+ECfAAfwAcNqNMAwAfRqxM9Ii85kVetvgD4AD6ADxpQpwGAD6JXJ/paUQa2KyfSBPgAPoAPGlCnAYAPolcnekReciKvWn0B8AF8AB80oE4DAB9Er070taIMbFdOpAnwAXwAHzSgTgMAH0SvTvSIvOREXrX6AuAD+AA+aECdBgA+iF6d6GtFGdiunEgT4AP4AD5oQJ0GAD6IXp3oEXnJibxq9QXAB/ABfNCAOg0AfBC9OtHXijKwXTmRJsAH8AF80IA6DQB8EL060SPykhN51eoLgA/gA/igAXUaAPggenWirxVlYLtyIk2AD+AD+KABdRoA+CB6daJH5CUn8qrVFwAfwAfwQQPqNADwQfTqRF8rysB25USa5sjsWjxhgxANHO/s1YPmzh50C98N1oB5dPtbiyds4KuBP46O7fevvWGrwG9nb9i22wff/cb3oXWnAWPxgAUCLVAbfIG7jX+DBQA+aCDcAgBfuO3wn3UtgIivrv2b3jrA13T3qd55gE9198cdPMAXZz/8dz0LAHz1bN/8lgG+5rtQ7QEAfGq7Pv7AAb54G+IX6lgA4Ktj9y62CvB10Y0qDwLgU9ntaQ4a4EtjR/xKeQsAfOVt3s0WAb5uulLdgQB86ro83QEDfOlsiV8qawFjzGWLJ9ngrcEW1z/92j55+qxsT2zY2l8//2p/unxg7xiT5fnLRx/bv39/tGHr298G+Fbt8/jeffvDm29n6SungQdXr9l/Hv+5uuE17zgNOy2f+PeJtuHrp77+3CuHVvPTXLpijdm3rv38y2/WyKfOWwvgnbffmVeTXQzgrnl5OLHbx4E2WQDg22QZa4f++/d/7B1zLkP/veQFQLeXX3x1e/Bz0rpmn3fHbrQaQDTwBofJATx/h9ns2rb6RQq27ZuUz6QNYADgSaCnDnwMvAsH8iK8TBHCHXPeO0KYAw5EfHOsdPKdBQDlRIDm4iHPdrQFQGrAx8DbFQi80xxe6imtm2b5TmkfPPxttje3Aj6fY5p98IFfXADQJJ8Ch/S3iwDZNy5dUZP26h58y50qM4cnIwJwtnH5nxs3b8126VbA547JHZu4/hcU4TvbDLmv03x37xFgt+CTD7wcObxd7wjvTM7H7A9J8LnkawV8Q1TjHBqLWJNdqwWA3YGPgXfxUM0If2T8Fy3OAO90imOef7df8D3/7klEg1X8Sfi5LwwzgCVb9RYBdgM+Bt6LH8gD3pDDSz+lTZ3T0QA+cmDWi8QBMlvO13+RawDghQOOlsl+rbfNg48FLLYOL0cS21/Aw3Rvd7uANYGPHJf1I3HAzJYD9F/06m0K3Cz4WLBiR2wZOTwfwWoE3woAJQ6gmQCYKkVCNmypbQ58DDwIdGuuZl0Ob0qYmsFHthGtr2EK3N6ASraV1DYDPhYkCo+3As8nwhsLEeBbnL7JepM4wGbKAYZGgGYihTLWmYTX4sHHAhQ7pW0nhzclOIBvAT6yFetPYg4wEwBDFs2GRZCGVoHFgo8FJ3bETb9Ke2T86/BSCg7gWwXfCgAlDsCCcoAxMw6ydYlWHPjkA6/fHAvAtxl85IysT4kARA5w9il3YsDHgpJ4Lq2SERXgmwbfCgAxI5nMObNvCzoXuDr42CgSFy2U5VAAvvngWwGgxAFbkH7n1JGSTUu01cDHwFM1YoadWlbq8kEAnz/4yElZzxIH8EwzlpDLnUnJARYHHwtELPBk5PBC6vDICUNbgC8cfGRz0frOBMDQMhhnM7pwBNmvVFsMfBDE1lQIf1gDeCQ2gC8efGzLpdIOF+VIeSyuByhjgK8VAWYHHwNPYh1UphEwpA6qJvDYWRVcnYWOtVTL+hc7wxFUh1rwYgjZwMcdLnbZX0aHuxHPFOzwbQ6PiC9dxDe2M/uDxABgWARJX5cqOQBIDj7uYLEjnO4Qf+yQy68BvnzgIzuzf0gMCDLNgCTmAJOBjztUFfDCVmmdE9RK6pIDrmsBvvzgI7vr9JewM5Ny+Es0+LgDJdYxZRrBWl7GJ8db1wJ85cBH9mf/ERswpJ8Ch0aAKcu6gsHHHSYReIIKN4ccXiO38QP4yoNvBYDwp60L4Kn8yRt8DDyMUFs7aKhUbwR47HxY1Z19rifZLHXL/iURgB3NoGaDjztELPCwaBHrhIj46kV8477T6W/lcuaT4OMOwCrUZITnxCtx0WLsVJteA3xywEd9xP6HgGOr//kWQm8EHxscdUdbDS6h8JicJLYF+OSBj/qU/VFiAJItp+5/U625dbEr4GMDix1hZBQeDzk8IYXH5ByxLcAnF3zUt+yfEgOSbDlA/7vCTQUkDD42qFjgIYdH4s/VAnzywUd9L9pfMwEwtAzG2WycgjIw4NaZLH84NYKQIFtuAb52wEc6E+2/wxRYRsAy9l9jVIXMYTmDdSMGCa+nFuBrD3ykP/kAFFQI7e4KxyFN5T8Wl8vJkcMLyxFIuXgAiTt3C/C1Cz7SBgNQYh1gtkUQf/+uDr4F8HKMCGHnBrJ4BN0jgISdswX42gcf6YM1LBGAAnKA1cC3AJ6MHIBvHRAJrKcW4OsHfKRLBiAWLc/MaYuDbwCeAOKTFQC8hbMDfAtbEDh6aeUDsOyMrxj4FhGejBzeUOi4dHnwXgQecxwAX7/gI10wAJUXQmcHX07ghdb1GLeqY/atEwEJAu2hBfj6Bx/pnAGo9K5w2cC3AB5yeCQ26S3Apwd8pEUGoMQcYKaU2F3zcvpyFmk5vHHhInU42lUnB/hWbaJFJwxAsVPgtAFUsogvJ/BCblqCRQt/Jwb4/G3WGxgZgBIjwIR1gNHgW0xpcyxahJ1poa3wOJXzAXwAH2mJASjxzK4BgHGrwMHgWwAvbQjq5t9HBoXHJMCSLcAH8I31xgCUOAWOyAF6g08i8FxnYZU23mkBvngbjsHRy2sGoNgpsF8ANht8eXN4YVNaAC+towJ8ae3ZC/SWj0M+AOdNgSfBt4jwcuTw/E8udqu0y8Zf7hT8Hee4AF+c/TTpj31Q4rnAMxZBNoJvAbx5BD1+4XU753mSwwu7qUjK+2pqEuncYwX4AL65WqHvMQAbK4ReAd8CeH5z5inohS5aoA6vnDMCfOVsTeDopWUASswBDosgZ3nG4MuZwws9tcyJAosW5ZwR4Ctn616ANz4O0QAcpsAnADSP7923P77zvnVFwt+ZV2dNV6eiO/58Z88+vP6Z/efxn3QxlK3tk6fP7I2bt5DDe6WOAwJ8dew+hkcPrxmAuweDTzvflvBwAd799z60/wfhFmuzJlIYTgAAAABJRU5ErkJggg==");
    			add_location(image0, file$1, 230, 4, 59578);
    			attr_dev(image1, "id", "flag_en_us_flag");
    			attr_dev(image1, "width", "200");
    			attr_dev(image1, "height", "105");
    			xlink_attr(image1, "xlink:href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABpCAYAAAB/GGzVAAAPkUlEQVR4Ae2dB5gVRRLH9+7Eu/Nyzvk8EwqmM+ecMZ/xTCALKhiAI4iCCgooGQQByZwEDyQjUZAluwiIiCCIBGWRJS67IH3fr6GGfm965j3B/W5vXs33zXZPT01Xv9r6T/d0VVfn5R1d0+h5cDI47KgHzZQjquqZYBnkKTgODhzITQGS/JeDAuQQelAFiAJEh18xAFKAKEBSAPLtqg+bbxxXK6XMN0T73sl1vxKab1V52FSqXPsrqSubNh1+/EPmmyc8lJGf/GYFiAIkRVluqtPdXPDPl1LKRFkkRalb95wQSwNth36TzWEZwHZtrS7msgc6xNYFgF589c1YGvi16zPJAABppy+9okZHc3XNzrE07nMKEAWI+dox+ebPlzSx57AJC0yvYTNt/k8XN0lRpF+cVd+W39e4r9lQtMX85dIn7fURVR8J6L57Uh1bduRlTU3x1p3m1kd72Oufn1UvoIEfdcPz32Pmmn4jZtt8FL+76r9qijZvN3/dz+87J9YJ6iJPPdzbVLzd3Fm/l72mraLoLr/+b8w2g0bPDfhxT+h8qQJEAWIVpFrtrlYJzf7j06Kt5soanVKU5/cXNDLT5y0XErN3717Tvu/klCESPcbTnUaZL77YG9BNmb3M/Pb8hil1XXp/e7N+45aA5rNN28xVD6by+935Dc1bHn5uL+HjN2vhSgsAV+Evua+9WfdZccBv4+fbzDX5XVLa5NJLXgGiAAmU5PYnegYKxFBElMRN6S12le62dL3/U+ClgX7o+AWWZsu2khQAuXXdXLd7wI+hlntP8gzndpSUWroBI+d4aaClV+DYvnNX5DcGLwE5bnykW2RdwpsUMJZtKtYzwTLIepq322vTzaMth5imHUZGfmMAnOETCw3KNnvhR3Z45ioUeb4Z5i9Zbd/QY99abM65o41XGTsPnGrqtR5mGr403H4/pNfD9cX3tjMjp7xrrqvd1cxdtMo7gcCkwrzFqw0gGzV1kbnwnrZefvR28Krf+nXTacBUL016GwCIHsmWQNYAcb8B3LyrNG75T894wvhmjn7098fMD0991CogY/w/XtTYq4xuXW7e5cez8p3w49MeNz/YX69LAy94Unao/Nx6yStAkg0Ofl3WAElXDr1WgCQfHgoQb++VLfi1B0k+RLQHibGUZwKKAkQBckhv2EwK9v9+XwGS4wDBkJdJiZn+zURz8o0tzNFXPp2R7rbHM9eVDb8TrnvGHHd1s6+E3x31ekXWowDJYYCcenNLO3WaSfmXr/7MWqrj6Fp0G2satR0eqWg8W7Xas6Zw6ZpYGuiWrlhvjrkqHmzNOo8yT3UcGVvXsVc1M++v3BBLA79FH6w1x1/7jJeu0tE1zewq1fRMsAxC3yDn3fWieXvBCrNq7SZrDceG0Gd4QTA1i9LgGvLamHnmnaVr7CtkxccbzbS5HxhAxX3Orx+bbxq0ed3aIDAIfr5lh83XaTE4mJqF7uw72pgZ8z80H31SZOvCRoLLB9O2UhdTxgNHzTEL3vvY0qxcs9Fa7U+/9YWAhincJ1oNszxwY9m8dafNP/7C0BR+Z/yjlX2WOjiok7rhIfzgTRtoCwdto41n3d46oIFWLek5akk/8frnTGnZPov4uOlLDF68ojySfv+UumbmOyusAgGAqCFUk/YjLA1/6rYYHKqH+nhDl+wqs3STCt43rv+W8MOPCxByYBGnB5B7bgoo5cDo596TPMMv6uCYOucDQ91yT1L8uCbPWmZpdpaUeXsRBUiOAoQxPM59uITQm4jSpKfvfbjeOhQCEHyx0u9zzVAHqzrDJ97mPhqGTLzxh4ybb+a8u8pLw3PUQc9FD4EzpK8uhnL0erz9sYz7aHBepI7BY+fbXtBHQxn1QEPbjrriqVBdCpAcBQjOgjgDoiS4uNNbpCvRL8+uHzgQonDn3vliiIZn8LbFvQS/qagP3ovuaWf+cOE+gN3wcLfA8u3yZAgkPll46Ea53eOxy8cz6zrIu3VInmfFOo+byk9OPzCcExqs79c/9LJ9Hos9bZR7kipAchQgogCaxq9XV4AoQEJvTQXNAdAoQBQgCpAYS7sCRAGiAIkByOGVa5vigkI9EyyDkB3EHUL97fKmGQGSDQ1LXH2u6C4v8tnUlQ0NH/SuHSWdj1xnU1ccjVrSZUI9uWkkQJilYkpVlCkqZdGTb5bLpc9vNjByRknoUGrWvMt1VMoCKVnfEUVzf+N+5t5GfWLrYp3IiEmFsTTUzwKwn515wIjo8lSAJBcY8stCAMFvqkbT/qb74OnWmEYehXONaSho9Sf7m1rNBpndu/fYFX/QVb6meaBwWLaZsqWc1X5YosnLVK0oGi4mlHcdNM0aCx98aoDl54KO3ueBJv0MQMOA2bH/FPsM9hqph5RpWeqaVbjSFBSusHlWN7o0PANNpwFTbF01nx5o63Z7OHjDj3sYMLsMnGqfoa1uXQoQUaPkpiGAEOjg2a5jzJ49X1hXk1Vri7zLYgnHs35jsaUp273HGuVwL3EV6Dfn/ctgGSeAA+foqYusm4pLsy+wwkgLNGjWrP/cnH93OLQQy2vXfro54Pdk+zdCS2x/dU4DM+Ht9wJ+42csMfSELj+W4PIsbYYfdfpsHNhKaAs0vAQweKbHBFOAJBcY8stCAEGZGO6gQNt2lFg/JVfB3DxuKNBw+txDoGWos6u0zNZHIAb3eckz3IGGeoaOn++lgfaNyQstzc6SUu9yXmgwDlIXPU2UYZKlwNQBv7hhFkM+aKhPlglLm0kVIKJGyU29AEHJcCpEKXoMmeH1xeKeOBVCGxVw7aXeE81JN7Swjoz0TK6CSR63euHXc+jbxo1tJTQotfDzDdWErm3viQaHxFNuammef2Wclx9DP/gxrIKfO5yTegB8vxGz7Mf+3Q162+Gi3JNUAZJcYMgv8wKEf7woAd8S7rWUp5elX/vosqHhOR9deln69f+CH23QI9kS8AJElE3TA1ZznywqHZNvFt1SV88Ey0ABEmMI9IHCLVNLulrSg6GWqxia39ezKEByHCC4qGcCQzY0jNXTp0h99WZTVzY0TB1z+ni4ZdnUFUejAMlhgLCegkDTrkL58i/0GG+X1/ruSRmBp6PWiwgNa0aadxmdkV/L7uMyKj/BqH22DeFFCmCjZtVcOmiiwKYAyUGAMJ2KpRybxep1m2yea3fWCPBQhgsGa81RSK5dazuzX5Rxsqa9y8BpwTX3RAmFHxZvIqzjQ8UzPn4sbCLSO5Hl4/j1GDrDvDJkhpcfbeRZQEuUeurk2t04B96U0RaizGP9T+dH+xUgOQgQ1mu/u+yTlLm7viNmpRgCUWqCWbsH0T9cVxMUCPvBth371n5Du3V7Scgni+W2LKV1D/i5thDWxBNc2j0WL18XWifu44fNRMBIytp5CTYh9cHPBbePH8uLq6S5mihAchAgKBEGNAnaELeNAZZtDtZ3R43V3W0T0v2wRHFRTgnaQIQRKU9PZdsEQOcLJAG9u20Cy4XT6+AaI6AEbWAdvI+GMtk2gaANLmCFXgGSowBhyES0DxwSCVwgCuGmjMt5i9/TsI8NyuCG/HHp2MaA7wa2QGvVw781G75XbL6DUyRvd3cIJnXh50XPhutKQeFKc+ZtrbztEj5ter1p2vaZ5KUhfA/BKNgNa+H7n3i/oWgDPRttwtHS9w1V6bhaZn3f4XomWAZeOwghdWTWiWAKDKlEUSXFX0scAfnA9kX9gNYddrl5qYeUYZbwI1iEz++J74Ffn9vAtgNwRoUZcnm4eZcfz8qHNw6VvrUjtEF2voLWF6yObxU9ki0BL0BcZdJ8tDVdAZJscPDrFCCHYElXgChAQkMr7VEO9CgKEAWIAiSmh1GAKEBSAMJy1agQo27PErU25MvS8GEcFWL0y9aVTZuIEBn18e/yk7wCRAGSApBnuoyxO92KgvhSZo6YhvXdc8uYIiaEqFuWnmdH3agA1EJL1BHi8Mp1VMr0cdRMmzxDLN/G7UZkrEvoFSAKEDv9SkDoN2cuNUWbt1vXC/KsyHPtFdgyWIKL4rOOGxpW67lTqGybgNWadeoc2CDGTFtsVwCK0sm2CTyPW8mGoi22rseeT93GgO2jiaiCBR9+EwuWmldfn5myjQGuMBg6uccBLc+w5YLLj20T4IfrCTzJA8z0NfbyjKSVjs03Kxq30zPBMshqFgtFad1zglUy/rClgQsOURiMabtK922b8Na85dZ/Se5JitISwZ0Di/hptxzY40No4IdxUQ6cJn38MPhh5ebA8OcLQk0ZPRrHjpJSr4GRunGUlOO5l8d6+Un7JFVLeo5a0kUB3BRQLPlwnWHjmdrNBwVvYJfmyMuaWiVkXw328nDvuXmGRLzVUW4Mde49ybPPBztAsYNV1L4iRGinDnqkuGHdrIUrLQ20EkVe+EhKDwWvZR9tMPVaD/O2SWglVYAoQAJFIQYWPkz4aaU7AIrC4GUrG9vgpuLGmhIahlk4FXKN8x9uLXLPTYmBhf8TVnxiZbn3JH959Y6BpR63EXc4JzT0IBJEjo16CFck99wUHvDCL4x4WO69qLwCRAGSlaJEKVDSyxUgChAFSIwdRAGiAFGAKEDMlCOSD4So35jVLFbSh0oH+/u0B0k+cPKqX9vI6HlwMsi/rrHaQBJsA8HGlSdz/5qqBFQCYQkoQMIy0RKVQCABBUggCs2oBMISUICEZaIlKoFAAgqQQBSaUQmEJaAACctES1QCgQQUIIEoNKMSCEsgT+M6aVwr1YFoHciLMrFrefKtxPo/zvw/VoDksJ+RAkQBktOOdgqAzADIJCPtQbQH0ZdIjA4oQGKEk+ntovcP/Q1d0WWoAFGAaA8SowMKkBjhVPS3m7av/HuwPN3nW/c5Vx2I1gG1pIeNp1qiEggkoAAJRKEZlUBYAgqQsEy0RCUQSEABEohCMyqBsAQUIGGZaIlKIJCAAiQQhWZUAmEJKEDCMtESlUAggbzigkKjp8pAdcCvA2pJV0u6uprE6IACJEY46spR/q4cFV3GChAFiPYgMTqgAIkRTkV/u2n7yr+HU4AoQLQHidEBBUiMcPQNXf5v6IouYwWIAkR7kBgdyJtdpZrRU2WgOuDXAbWkBzZTzagEwhJQgIRloiUqgUACCpBAFJpRCYQloAAJy0RLVAKBBBQggSg0oxIIS0ABEpaJlqgEAgkoQAJRaEYlEJZAXtmmYqOnykB1wK8DakmPsaJWdDcIbV/5u8IoQBQg6moSowMKkBjh6Bu6/N/QFV3GChAFiPYgMTqgAIkRTkV/u2n7yr+HU4AoQLQHidEBBUiMcPQNXf5v6IouYwWIAkR7kBgd+C/TG4Zgf6sXPAAAAABJRU5ErkJggg==");
    			add_location(image1, file$1, 231, 4, 66281);
    			add_location(defs, file$1, 220, 3, 59061);
    			attr_dev(svg28, "viewBox", "0 0 40 30");
    			attr_dev(svg28, "fill", "none");
    			attr_dev(svg28, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg28, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg28, file$1, 213, 2, 58655);
    			attr_dev(symbol28, "id", "Flag_en");
    			add_location(symbol28, file$1, 212, 1, 58631);
    			attr_dev(animate0, "attributeName", "opacity");
    			attr_dev(animate0, "values", "1;0");
    			attr_dev(animate0, "keyTimes", "0;1");
    			attr_dev(animate0, "dur", "1s");
    			attr_dev(animate0, "begin", "-0.9166666666666666s");
    			attr_dev(animate0, "repeatCount", "indefinite");
    			add_location(animate0, file$1, 243, 6, 72170);
    			attr_dev(rect3, "x", "49");
    			attr_dev(rect3, "y", "7");
    			attr_dev(rect3, "rx", "0");
    			attr_dev(rect3, "ry", "0");
    			attr_dev(rect3, "width", "2");
    			attr_dev(rect3, "height", "26");
    			add_location(rect3, file$1, 242, 5, 72108);
    			attr_dev(g3, "transform", "rotate(0 50 50)");
    			add_location(g3, file$1, 241, 4, 72071);
    			attr_dev(animate1, "attributeName", "opacity");
    			attr_dev(animate1, "values", "1;0");
    			attr_dev(animate1, "keyTimes", "0;1");
    			attr_dev(animate1, "dur", "1s");
    			attr_dev(animate1, "begin", "-0.8333333333333334s");
    			attr_dev(animate1, "repeatCount", "indefinite");
    			add_location(animate1, file$1, 248, 6, 72422);
    			attr_dev(rect4, "x", "49");
    			attr_dev(rect4, "y", "7");
    			attr_dev(rect4, "rx", "0");
    			attr_dev(rect4, "ry", "0");
    			attr_dev(rect4, "width", "2");
    			attr_dev(rect4, "height", "26");
    			add_location(rect4, file$1, 247, 5, 72360);
    			attr_dev(g4, "transform", "rotate(30 50 50)");
    			add_location(g4, file$1, 246, 4, 72322);
    			attr_dev(animate2, "attributeName", "opacity");
    			attr_dev(animate2, "values", "1;0");
    			attr_dev(animate2, "keyTimes", "0;1");
    			attr_dev(animate2, "dur", "1s");
    			attr_dev(animate2, "begin", "-0.75s");
    			attr_dev(animate2, "repeatCount", "indefinite");
    			add_location(animate2, file$1, 253, 6, 72674);
    			attr_dev(rect5, "x", "49");
    			attr_dev(rect5, "y", "7");
    			attr_dev(rect5, "rx", "0");
    			attr_dev(rect5, "ry", "0");
    			attr_dev(rect5, "width", "2");
    			attr_dev(rect5, "height", "26");
    			add_location(rect5, file$1, 252, 5, 72612);
    			attr_dev(g5, "transform", "rotate(60 50 50)");
    			add_location(g5, file$1, 251, 4, 72574);
    			attr_dev(animate3, "attributeName", "opacity");
    			attr_dev(animate3, "values", "1;0");
    			attr_dev(animate3, "keyTimes", "0;1");
    			attr_dev(animate3, "dur", "1s");
    			attr_dev(animate3, "begin", "-0.6666666666666666s");
    			attr_dev(animate3, "repeatCount", "indefinite");
    			add_location(animate3, file$1, 258, 6, 72912);
    			attr_dev(rect6, "x", "49");
    			attr_dev(rect6, "y", "7");
    			attr_dev(rect6, "rx", "0");
    			attr_dev(rect6, "ry", "0");
    			attr_dev(rect6, "width", "2");
    			attr_dev(rect6, "height", "26");
    			add_location(rect6, file$1, 257, 5, 72850);
    			attr_dev(g6, "transform", "rotate(90 50 50)");
    			add_location(g6, file$1, 256, 4, 72812);
    			attr_dev(animate4, "attributeName", "opacity");
    			attr_dev(animate4, "values", "1;0");
    			attr_dev(animate4, "keyTimes", "0;1");
    			attr_dev(animate4, "dur", "1s");
    			attr_dev(animate4, "begin", "-0.5833333333333334s");
    			attr_dev(animate4, "repeatCount", "indefinite");
    			add_location(animate4, file$1, 263, 6, 73165);
    			attr_dev(rect7, "x", "49");
    			attr_dev(rect7, "y", "7");
    			attr_dev(rect7, "rx", "0");
    			attr_dev(rect7, "ry", "0");
    			attr_dev(rect7, "width", "2");
    			attr_dev(rect7, "height", "26");
    			add_location(rect7, file$1, 262, 5, 73103);
    			attr_dev(g7, "transform", "rotate(120 50 50)");
    			add_location(g7, file$1, 261, 4, 73064);
    			attr_dev(animate5, "attributeName", "opacity");
    			attr_dev(animate5, "values", "1;0");
    			attr_dev(animate5, "keyTimes", "0;1");
    			attr_dev(animate5, "dur", "1s");
    			attr_dev(animate5, "begin", "-0.5s");
    			attr_dev(animate5, "repeatCount", "indefinite");
    			add_location(animate5, file$1, 268, 6, 73418);
    			attr_dev(rect8, "x", "49");
    			attr_dev(rect8, "y", "7");
    			attr_dev(rect8, "rx", "0");
    			attr_dev(rect8, "ry", "0");
    			attr_dev(rect8, "width", "2");
    			attr_dev(rect8, "height", "26");
    			add_location(rect8, file$1, 267, 5, 73356);
    			attr_dev(g8, "transform", "rotate(150 50 50)");
    			add_location(g8, file$1, 266, 4, 73317);
    			attr_dev(animate6, "attributeName", "opacity");
    			attr_dev(animate6, "values", "1;0");
    			attr_dev(animate6, "keyTimes", "0;1");
    			attr_dev(animate6, "dur", "1s");
    			attr_dev(animate6, "begin", "-0.4166666666666667s");
    			attr_dev(animate6, "repeatCount", "indefinite");
    			add_location(animate6, file$1, 273, 6, 73656);
    			attr_dev(rect9, "x", "49");
    			attr_dev(rect9, "y", "7");
    			attr_dev(rect9, "rx", "0");
    			attr_dev(rect9, "ry", "0");
    			attr_dev(rect9, "width", "2");
    			attr_dev(rect9, "height", "26");
    			add_location(rect9, file$1, 272, 5, 73594);
    			attr_dev(g9, "transform", "rotate(180 50 50)");
    			add_location(g9, file$1, 271, 4, 73555);
    			attr_dev(animate7, "attributeName", "opacity");
    			attr_dev(animate7, "values", "1;0");
    			attr_dev(animate7, "keyTimes", "0;1");
    			attr_dev(animate7, "dur", "1s");
    			attr_dev(animate7, "begin", "-0.3333333333333333s");
    			attr_dev(animate7, "repeatCount", "indefinite");
    			add_location(animate7, file$1, 278, 6, 73909);
    			attr_dev(rect10, "x", "49");
    			attr_dev(rect10, "y", "7");
    			attr_dev(rect10, "rx", "0");
    			attr_dev(rect10, "ry", "0");
    			attr_dev(rect10, "width", "2");
    			attr_dev(rect10, "height", "26");
    			add_location(rect10, file$1, 277, 5, 73847);
    			attr_dev(g10, "transform", "rotate(210 50 50)");
    			add_location(g10, file$1, 276, 4, 73808);
    			attr_dev(animate8, "attributeName", "opacity");
    			attr_dev(animate8, "values", "1;0");
    			attr_dev(animate8, "keyTimes", "0;1");
    			attr_dev(animate8, "dur", "1s");
    			attr_dev(animate8, "begin", "-0.25s");
    			attr_dev(animate8, "repeatCount", "indefinite");
    			add_location(animate8, file$1, 283, 6, 74162);
    			attr_dev(rect11, "x", "49");
    			attr_dev(rect11, "y", "7");
    			attr_dev(rect11, "rx", "0");
    			attr_dev(rect11, "ry", "0");
    			attr_dev(rect11, "width", "2");
    			attr_dev(rect11, "height", "26");
    			add_location(rect11, file$1, 282, 5, 74100);
    			attr_dev(g11, "transform", "rotate(240 50 50)");
    			add_location(g11, file$1, 281, 4, 74061);
    			attr_dev(animate9, "attributeName", "opacity");
    			attr_dev(animate9, "values", "1;0");
    			attr_dev(animate9, "keyTimes", "0;1");
    			attr_dev(animate9, "dur", "1s");
    			attr_dev(animate9, "begin", "-0.16666666666666666s");
    			attr_dev(animate9, "repeatCount", "indefinite");
    			add_location(animate9, file$1, 288, 6, 74401);
    			attr_dev(rect12, "x", "49");
    			attr_dev(rect12, "y", "7");
    			attr_dev(rect12, "rx", "0");
    			attr_dev(rect12, "ry", "0");
    			attr_dev(rect12, "width", "2");
    			attr_dev(rect12, "height", "26");
    			add_location(rect12, file$1, 287, 5, 74339);
    			attr_dev(g12, "transform", "rotate(270 50 50)");
    			add_location(g12, file$1, 286, 4, 74300);
    			attr_dev(animate10, "attributeName", "opacity");
    			attr_dev(animate10, "values", "1;0");
    			attr_dev(animate10, "keyTimes", "0;1");
    			attr_dev(animate10, "dur", "1s");
    			attr_dev(animate10, "begin", "-0.08333333333333333s");
    			attr_dev(animate10, "repeatCount", "indefinite");
    			add_location(animate10, file$1, 293, 6, 74655);
    			attr_dev(rect13, "x", "49");
    			attr_dev(rect13, "y", "7");
    			attr_dev(rect13, "rx", "0");
    			attr_dev(rect13, "ry", "0");
    			attr_dev(rect13, "width", "2");
    			attr_dev(rect13, "height", "26");
    			add_location(rect13, file$1, 292, 5, 74593);
    			attr_dev(g13, "transform", "rotate(300 50 50)");
    			add_location(g13, file$1, 291, 4, 74554);
    			attr_dev(animate11, "attributeName", "opacity");
    			attr_dev(animate11, "values", "1;0");
    			attr_dev(animate11, "keyTimes", "0;1");
    			attr_dev(animate11, "dur", "1s");
    			attr_dev(animate11, "begin", "0s");
    			attr_dev(animate11, "repeatCount", "indefinite");
    			add_location(animate11, file$1, 298, 6, 74909);
    			attr_dev(rect14, "x", "49");
    			attr_dev(rect14, "y", "7");
    			attr_dev(rect14, "rx", "0");
    			attr_dev(rect14, "ry", "0");
    			attr_dev(rect14, "width", "2");
    			attr_dev(rect14, "height", "26");
    			add_location(rect14, file$1, 297, 5, 74847);
    			attr_dev(g14, "transform", "rotate(330 50 50)");
    			add_location(g14, file$1, 296, 4, 74808);
    			attr_dev(g15, "fill", "var(--icon)");
    			add_location(g15, file$1, 240, 3, 72044);
    			attr_dev(svg29, "viewBox", "0 0 100 100");
    			attr_dev(svg29, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg29, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg29, "preserveAspectRatio", "xMidYMid");
    			add_location(svg29, file$1, 239, 2, 71904);
    			attr_dev(symbol29, "id", "Icon_Loader");
    			add_location(symbol29, file$1, 238, 1, 71876);
    			attr_dev(path75, "fill", "var(--icon)");
    			attr_dev(path75, "opacity", ".25");
    			attr_dev(path75, "d", "M84.2922 34.7947L84.9993 35.5018L120.855 -0.353501L120.147 -1.06061L84.2922 34.7947Z");
    			add_location(path75, file$1, 306, 3, 75175);
    			attr_dev(path76, "fill", "var(--icon)");
    			attr_dev(path76, "opacity", ".25");
    			attr_dev(path76, "d", "M85.5569 84.9356L84.8498 85.6427L119.562 120.355L120.269 119.647L85.5569 84.9356Z");
    			add_location(path76, file$1, 307, 3, 75308);
    			attr_dev(path77, "fill", "var(--icon)");
    			attr_dev(path77, "opacity", ".25");
    			attr_dev(path77, "d", "M35.5018 84.9993L34.7947 84.2922L-0.0606959 119.148L0.646411 119.855L35.5018 84.9993Z");
    			add_location(path77, file$1, 308, 3, 75438);
    			attr_dev(path78, "fill", "var(--icon)");
    			attr_dev(path78, "opacity", ".25");
    			attr_dev(path78, "d", "M35.3523 36.1452L36.0594 35.4381L0.0606224 -0.560669L-0.646484 0.146438L35.3523 36.1452Z");
    			add_location(path78, file$1, 309, 3, 75572);
    			attr_dev(path79, "stroke", "var(--icon)");
    			attr_dev(path79, "d", "M89.5 46V77C89.5 77.8284 88.8284 78.5 88 78.5H32C31.1716 78.5 30.5 77.8284 30.5 77V46C30.5 45.1716 31.1716 44.5 32 44.5H44.6667C45.6759 44.5 46.5862 43.8932 46.9744 42.9615L49.6987 36.4231C49.9316 35.8641 50.4778 35.5 51.0833 35.5H53.5H60H66.5H68.9167C69.5222 35.5 70.0684 35.8641 70.3013 36.4231L73.0256 42.9615C73.4138 43.8932 74.3241 44.5 75.3333 44.5H88C88.8284 44.5 89.5 45.1716 89.5 46Z");
    			add_location(path79, file$1, 310, 3, 75709);
    			attr_dev(circle1, "stroke", "var(--icon)");
    			attr_dev(circle1, "cx", "60");
    			attr_dev(circle1, "cy", "60");
    			attr_dev(circle1, "r", "9.5");
    			add_location(circle1, file$1, 311, 3, 76138);
    			attr_dev(svg30, "fill", "none");
    			attr_dev(svg30, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg30, "viewBox", "0 0 120 120");
    			add_location(svg30, file$1, 305, 2, 75097);
    			attr_dev(symbol30, "id", "Icon_NoImage");
    			add_location(symbol30, file$1, 304, 1, 75068);
    			attr_dev(circle2, "fill", "var(--icon-bg, transparent)");
    			attr_dev(circle2, "stroke", "var(--icon-border, var(--icon))");
    			attr_dev(circle2, "stroke-width", "var(--thickness-border, var(--thickness))");
    			attr_dev(circle2, "cx", "30");
    			attr_dev(circle2, "cy", "30");
    			attr_dev(circle2, "r", "25");
    			add_location(circle2, file$1, 316, 3, 76323);
    			attr_dev(path80, "stroke", "var(--icon-symbol, var(--icon))");
    			attr_dev(path80, "stroke-width", "var(--thickness-symbol, var(--thickness))");
    			attr_dev(path80, "d", "M30 17v18m0 6-1 1 1 1 1-1-1-1Z");
    			add_location(path80, file$1, 317, 3, 76492);
    			attr_dev(svg31, "viewBox", "0 0 60 60");
    			attr_dev(svg31, "fill", "none");
    			attr_dev(svg31, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg31, file$1, 315, 2, 76247);
    			attr_dev(symbol31, "id", "Icon_ErrorCircle");
    			add_location(symbol31, file$1, 314, 1, 76214);
    			attr_dev(path81, "stroke", "var(--icon)");
    			attr_dev(path81, "stroke-width", "var(--thickness)");
    			attr_dev(path81, "stroke-linecap", "round");
    			attr_dev(path81, "d", "M52 8L8 52M8 8L52 52");
    			add_location(path81, file$1, 322, 3, 76757);
    			attr_dev(svg32, "viewBox", "0 0 60 60");
    			attr_dev(svg32, "fill", "none");
    			attr_dev(svg32, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg32, file$1, 321, 2, 76681);
    			attr_dev(symbol32, "id", "Icon_Cross");
    			add_location(symbol32, file$1, 320, 1, 76654);
    			attr_dev(path82, "stroke", "var(--icon)");
    			attr_dev(path82, "stroke-width", "var(--thickness)");
    			attr_dev(path82, "d", "M57.5 30C57.5 45.1878 45.1878 57.5 30 57.5C14.8122 57.5 2.5 45.1878 2.5 30C2.5 14.8122 14.8122 2.5 30 2.5C45.1878 2.5 57.5 14.8122 57.5 30Z");
    			add_location(path82, file$1, 327, 3, 76989);
    			attr_dev(path83, "stroke", "var(--icon)");
    			attr_dev(path83, "stroke-width", "var(--thickness)");
    			attr_dev(path83, "d", "M30 11V30L39 37");
    			add_location(path83, file$1, 328, 3, 77197);
    			attr_dev(svg33, "viewBox", "0 0 60 60");
    			attr_dev(svg33, "fill", "none");
    			attr_dev(svg33, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg33, file$1, 326, 2, 76913);
    			attr_dev(symbol33, "id", "Icon_Time");
    			add_location(symbol33, file$1, 325, 1, 76887);
    			attr_dev(path84, "stroke", "var(--icon)");
    			attr_dev(path84, "stroke-width", "4");
    			attr_dev(path84, "d", "M17 27v-8a13 13 0 0 1 26 0v8m-26 0H9a1 1 0 0 0-1 1v25c0 .6.4 1 1 1h42c.6 0 1-.4 1-1V28c0-.6-.4-1-1-1h-8m-26 0h26m-13 9v10");
    			add_location(path84, file$1, 333, 3, 77401);
    			attr_dev(svg34, "viewBox", "0 0 60 60");
    			attr_dev(svg34, "fill", "none");
    			attr_dev(svg34, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg34, file$1, 332, 2, 77325);
    			attr_dev(symbol34, "id", "Icon_Lock");
    			add_location(symbol34, file$1, 331, 1, 77299);
    			attr_dev(path85, "stroke", "var(--icon)");
    			attr_dev(path85, "stroke-width", "var(--thickness)");
    			attr_dev(path85, "d", "M30 10H14c-2 0-4 2-4 4v32c0 2 2 4 4 4h32c2 0 4-2 4-4V30m4-24L25 35M54 6v17m0-17H37");
    			add_location(path85, file$1, 338, 3, 77696);
    			attr_dev(svg35, "viewBox", "0 0 60 60");
    			attr_dev(svg35, "fill", "none");
    			attr_dev(svg35, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg35, file$1, 337, 2, 77620);
    			attr_dev(symbol35, "id", "Icon_Link");
    			add_location(symbol35, file$1, 336, 1, 77594);
    			attr_dev(path86, "fill", "var(--icon)");
    			attr_dev(path86, "d", "M21.7 27.6 9 32.4l12.8 4.8v4L4.6 34.4v-4l17.1-6.7v3.8Zm13.6-13.5h4.1l-12.3 35H23l12.3-35Zm22.2 16.3v4l-17.2 6.7v-3.9l12.9-4.8-12.9-4.8v-3.8l17.2 6.6Z");
    			add_location(path86, file$1, 343, 3, 77967);
    			attr_dev(svg36, "viewBox", "0 0 60 60");
    			attr_dev(svg36, "fill", "none");
    			attr_dev(svg36, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg36, file$1, 342, 2, 77891);
    			attr_dev(symbol36, "id", "Icon_Code");
    			add_location(symbol36, file$1, 341, 1, 77865);
    			attr_dev(path87, "stroke", "var(--icon)");
    			attr_dev(path87, "stroke-width", "var(--thickness)");
    			attr_dev(path87, "stroke-linecap", "round");
    			attr_dev(path87, "d", "m17.14 27.36-7.6 7.6A10.77 10.77 0 0 0 24.75 50.2l7.61-7.62c4.2-4.2 4.2-11.02 0-15.22m10.15 5.07 7.62-7.61A10.77 10.77 0 0 0 34.9 9.59L27.3 17.2a10.77 10.77 0 0 0 0 15.23");
    			add_location(path87, file$1, 348, 3, 78272);
    			attr_dev(svg37, "viewBox", "0 0 60 60");
    			attr_dev(svg37, "fill", "none");
    			attr_dev(svg37, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg37, file$1, 347, 2, 78196);
    			attr_dev(symbol37, "id", "Icon_Chain");
    			add_location(symbol37, file$1, 346, 1, 78169);
    			attr_dev(path88, "fill", "var(--icon)");
    			attr_dev(path88, "d", "M30 43L7 17H53L30 43Z");
    			add_location(path88, file$1, 353, 3, 78657);
    			attr_dev(svg38, "viewBox", "0 0 60 60");
    			attr_dev(svg38, "fill", "none");
    			attr_dev(svg38, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg38, file$1, 352, 2, 78581);
    			attr_dev(symbol38, "id", "Icon_Chevron");
    			add_location(symbol38, file$1, 351, 1, 78552);
    			attr_dev(path89, "fill", "var(--icon)");
    			attr_dev(path89, "d", "M10.72 12.464L8.62545 10.448L8.65818 10.432C10.0483 8.9241 11.0868 7.13894 11.7018 5.2H14.0909V3.6H8.36364V2H6.72727V3.6H1V5.2H10.1473C9.57977 6.78406 8.69529 8.24175 7.54545 9.488C6.79634 8.67616 6.15827 7.7726 5.64727 6.8H4.01091C4.61636 8.096 5.43455 9.344 6.46545 10.448L2.29273 14.464L3.45455 15.6L7.54545 11.6L10.0818 14.08L10.7036 12.464H10.72ZM15.3182 8.4H13.6818L10 18H11.6364L12.5527 15.6H16.4473L17.3636 18H19L15.3182 8.4V8.4ZM13.1745 14L14.5 10.528L15.8255 14H13.1745V14Z");
    			add_location(path89, file$1, 358, 3, 78840);
    			attr_dev(svg39, "viewBox", "0 0 20 20");
    			attr_dev(svg39, "fill", "none");
    			attr_dev(svg39, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg39, file$1, 357, 2, 78764);
    			attr_dev(symbol39, "id", "Icon_Translation");
    			add_location(symbol39, file$1, 356, 1, 78731);
    			attr_dev(path90, "stroke", "var(--icon)");
    			attr_dev(path90, "stroke-width", "var(--thickness)");
    			attr_dev(path90, "stroke-linecap", "round");
    			attr_dev(path90, "d", "M22.6 20h-5.1a5 5 0 0 0-5 5v25a5 5 0 0 0 5 5h25a5 5 0 0 0 5-5V25a5 5 0 0 0-5-5h-5.1M30.3 5v30m0-30 8.2 8.3M30.2 5 22 13.3");
    			add_location(path90, file$1, 363, 3, 79479);
    			attr_dev(svg40, "viewBox", "0 0 60 60");
    			attr_dev(svg40, "fill", "none");
    			attr_dev(svg40, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg40, file$1, 362, 2, 79403);
    			attr_dev(symbol40, "id", "Icon_Share");
    			add_location(symbol40, file$1, 361, 1, 79376);
    			attr_dev(svg41, "id", "AppIcons");
    			attr_dev(svg41, "aria-hidden", "true");
    			attr_dev(svg41, "class", "svelte-p43f3c");
    			add_location(svg41, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg41, anchor);
    			append_dev(svg41, symbol0);
    			append_dev(symbol0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, path2);
    			append_dev(svg0, path3);
    			append_dev(svg0, path4);
    			append_dev(svg0, path5);
    			append_dev(svg0, path6);
    			append_dev(svg0, path7);
    			append_dev(svg41, symbol1);
    			append_dev(symbol1, svg1);
    			append_dev(svg1, path8);
    			append_dev(svg41, symbol2);
    			append_dev(symbol2, svg2);
    			append_dev(svg2, path9);
    			append_dev(svg41, symbol3);
    			append_dev(symbol3, svg3);
    			append_dev(svg3, path10);
    			append_dev(svg41, symbol4);
    			append_dev(symbol4, svg4);
    			append_dev(svg4, path11);
    			append_dev(svg41, symbol5);
    			append_dev(symbol5, svg5);
    			append_dev(svg5, path12);
    			append_dev(svg41, symbol6);
    			append_dev(symbol6, svg6);
    			append_dev(svg6, path13);
    			append_dev(svg41, symbol7);
    			append_dev(symbol7, svg7);
    			append_dev(svg7, path14);
    			append_dev(svg7, path15);
    			append_dev(svg7, path16);
    			append_dev(svg41, symbol8);
    			append_dev(symbol8, svg8);
    			append_dev(svg8, path17);
    			append_dev(svg8, path18);
    			append_dev(svg8, path19);
    			append_dev(svg8, path20);
    			append_dev(svg8, path21);
    			append_dev(svg41, symbol9);
    			append_dev(symbol9, svg9);
    			append_dev(svg9, path22);
    			append_dev(svg9, path23);
    			append_dev(svg41, symbol10);
    			append_dev(symbol10, svg10);
    			append_dev(svg10, path24);
    			append_dev(svg10, path25);
    			append_dev(svg41, symbol11);
    			append_dev(symbol11, svg11);
    			append_dev(svg11, path26);
    			append_dev(svg11, path27);
    			append_dev(svg41, symbol12);
    			append_dev(symbol12, svg12);
    			append_dev(svg12, path28);
    			append_dev(svg12, path29);
    			append_dev(svg41, symbol13);
    			append_dev(symbol13, svg13);
    			append_dev(svg13, path30);
    			append_dev(svg13, path31);
    			append_dev(svg41, symbol14);
    			append_dev(symbol14, svg14);
    			append_dev(svg14, path32);
    			append_dev(svg14, path33);
    			append_dev(svg14, path34);
    			append_dev(svg14, path35);
    			append_dev(svg14, path36);
    			append_dev(svg41, symbol15);
    			append_dev(symbol15, svg15);
    			append_dev(svg15, path37);
    			append_dev(svg15, path38);
    			append_dev(svg15, path39);
    			append_dev(svg15, path40);
    			append_dev(svg15, path41);
    			append_dev(svg15, path42);
    			append_dev(svg15, path43);
    			append_dev(svg41, symbol16);
    			append_dev(symbol16, svg16);
    			append_dev(svg16, path44);
    			append_dev(svg16, path45);
    			append_dev(svg41, symbol17);
    			append_dev(symbol17, svg17);
    			append_dev(svg17, path46);
    			append_dev(svg17, path47);
    			append_dev(svg41, symbol18);
    			append_dev(symbol18, svg18);
    			append_dev(svg18, path48);
    			append_dev(svg18, path49);
    			append_dev(svg41, symbol19);
    			append_dev(symbol19, svg19);
    			append_dev(svg19, path50);
    			append_dev(svg19, path51);
    			append_dev(svg19, path52);
    			append_dev(svg19, path53);
    			append_dev(svg41, symbol20);
    			append_dev(symbol20, svg20);
    			append_dev(svg20, path54);
    			append_dev(svg20, path55);
    			append_dev(svg20, path56);
    			append_dev(svg20, path57);
    			append_dev(svg41, symbol21);
    			append_dev(symbol21, svg21);
    			append_dev(svg21, path58);
    			append_dev(svg41, symbol22);
    			append_dev(symbol22, svg22);
    			append_dev(svg22, path59);
    			append_dev(svg41, symbol23);
    			append_dev(symbol23, svg23);
    			append_dev(svg23, path60);
    			append_dev(svg41, symbol24);
    			append_dev(symbol24, svg24);
    			append_dev(svg24, path61);
    			append_dev(svg24, path62);
    			append_dev(svg24, path63);
    			append_dev(svg41, symbol25);
    			append_dev(symbol25, svg25);
    			append_dev(svg25, circle0);
    			append_dev(svg25, path64);
    			append_dev(svg41, symbol26);
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
    			append_dev(svg41, symbol27);
    			append_dev(symbol27, svg27);
    			append_dev(svg27, mask);
    			append_dev(mask, path69);
    			append_dev(svg27, g1);
    			append_dev(g1, path70);
    			append_dev(g1, path71);
    			append_dev(g1, path72);
    			append_dev(svg41, symbol28);
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
    			append_dev(svg41, symbol29);
    			append_dev(symbol29, svg29);
    			append_dev(svg29, g15);
    			append_dev(g15, g3);
    			append_dev(g3, rect3);
    			append_dev(rect3, animate0);
    			append_dev(g15, g4);
    			append_dev(g4, rect4);
    			append_dev(rect4, animate1);
    			append_dev(g15, g5);
    			append_dev(g5, rect5);
    			append_dev(rect5, animate2);
    			append_dev(g15, g6);
    			append_dev(g6, rect6);
    			append_dev(rect6, animate3);
    			append_dev(g15, g7);
    			append_dev(g7, rect7);
    			append_dev(rect7, animate4);
    			append_dev(g15, g8);
    			append_dev(g8, rect8);
    			append_dev(rect8, animate5);
    			append_dev(g15, g9);
    			append_dev(g9, rect9);
    			append_dev(rect9, animate6);
    			append_dev(g15, g10);
    			append_dev(g10, rect10);
    			append_dev(rect10, animate7);
    			append_dev(g15, g11);
    			append_dev(g11, rect11);
    			append_dev(rect11, animate8);
    			append_dev(g15, g12);
    			append_dev(g12, rect12);
    			append_dev(rect12, animate9);
    			append_dev(g15, g13);
    			append_dev(g13, rect13);
    			append_dev(rect13, animate10);
    			append_dev(g15, g14);
    			append_dev(g14, rect14);
    			append_dev(rect14, animate11);
    			append_dev(svg41, symbol30);
    			append_dev(symbol30, svg30);
    			append_dev(svg30, path75);
    			append_dev(svg30, path76);
    			append_dev(svg30, path77);
    			append_dev(svg30, path78);
    			append_dev(svg30, path79);
    			append_dev(svg30, circle1);
    			append_dev(svg41, symbol31);
    			append_dev(symbol31, svg31);
    			append_dev(svg31, circle2);
    			append_dev(svg31, path80);
    			append_dev(svg41, symbol32);
    			append_dev(symbol32, svg32);
    			append_dev(svg32, path81);
    			append_dev(svg41, symbol33);
    			append_dev(symbol33, svg33);
    			append_dev(svg33, path82);
    			append_dev(svg33, path83);
    			append_dev(svg41, symbol34);
    			append_dev(symbol34, svg34);
    			append_dev(svg34, path84);
    			append_dev(svg41, symbol35);
    			append_dev(symbol35, svg35);
    			append_dev(svg35, path85);
    			append_dev(svg41, symbol36);
    			append_dev(symbol36, svg36);
    			append_dev(svg36, path86);
    			append_dev(svg41, symbol37);
    			append_dev(symbol37, svg37);
    			append_dev(svg37, path87);
    			append_dev(svg41, symbol38);
    			append_dev(symbol38, svg38);
    			append_dev(svg38, path88);
    			append_dev(svg41, symbol39);
    			append_dev(symbol39, svg39);
    			append_dev(svg39, path89);
    			append_dev(svg41, symbol40);
    			append_dev(symbol40, svg40);
    			append_dev(svg40, path90);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg41);
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
    	validate_slots('Icons', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icons> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Icons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icons",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */

    const { Error: Error_1, console: console_1, window: window_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (282:0) {:else}
    function create_else_block(ctx) {
    	let main;
    	let div;
    	let button;
    	let svg0;
    	let use0;
    	let t0;
    	let svg1;
    	let title;
    	let t1_value = LanguageFullName[/*$i18n*/ ctx[3]] + "";
    	let t1;
    	let use1;
    	let use1_xlink_href_value;
    	let t2;
    	let div_tabindex_value;
    	let t3;
    	let section_landing;
    	let t4;
    	let section_projects;
    	let t5;
    	let section_skills;
    	let t6;
    	let section_footer;
    	let t7;
    	let modals;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*selectingLang*/ ctx[0] && create_if_block_2(ctx);
    	section_landing = new Landing({ $$inline: true });
    	section_projects = new Projects({ $$inline: true });
    	section_skills = new Skills({ $$inline: true });
    	section_footer = new Footer({ $$inline: true });
    	modals = new Modals({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			button = element("button");
    			svg0 = svg_element("svg");
    			use0 = svg_element("use");
    			t0 = space();
    			svg1 = svg_element("svg");
    			title = svg_element("title");
    			t1 = text(t1_value);
    			use1 = svg_element("use");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(section_landing.$$.fragment);
    			t4 = space();
    			create_component(section_projects.$$.fragment);
    			t5 = space();
    			create_component(section_skills.$$.fragment);
    			t6 = space();
    			create_component(section_footer.$$.fragment);
    			t7 = space();
    			create_component(modals.$$.fragment);
    			xlink_attr(use0, "xlink:href", "#Icon_Translation");
    			add_location(use0, file, 286, 5, 9076);
    			attr_dev(svg0, "class", "icon");
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "focusable", "false");
    			attr_dev(svg0, "role", "presentation");
    			add_location(svg0, file, 285, 4, 8994);
    			add_location(title, file, 289, 5, 9227);
    			xlink_attr(use1, "xlink:href", use1_xlink_href_value = "#Flag_" + /*$i18n*/ ctx[3]);
    			add_location(use1, file, 290, 5, 9274);
    			attr_dev(svg1, "class", "flag icon icon-175");
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "focusable", "false");
    			attr_dev(svg1, "role", "presentation");
    			add_location(svg1, file, 288, 4, 9131);
    			attr_dev(button, "class", "selected gap-1 flex flex-center");
    			attr_dev(button, "aria-hidden", /*selectingLang*/ ctx[0]);
    			add_location(button, file, 284, 3, 8884);
    			attr_dev(div, "id", "AppLangSelect");
    			attr_dev(div, "tabindex", div_tabindex_value = /*selectingLang*/ ctx[0] ? 1 : -1);
    			toggle_class(div, "active", /*selectingLang*/ ctx[0]);
    			add_location(div, file, 283, 2, 8794);
    			attr_dev(main, "id", "App");
    			add_location(main, file, 282, 1, 8775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, button);
    			append_dev(button, svg0);
    			append_dev(svg0, use0);
    			append_dev(button, t0);
    			append_dev(button, svg1);
    			append_dev(svg1, title);
    			append_dev(title, t1);
    			append_dev(svg1, use1);
    			append_dev(div, t2);
    			if (if_block) if_block.m(div, null);
    			append_dev(main, t3);
    			mount_component(section_landing, main, null);
    			append_dev(main, t4);
    			mount_component(section_projects, main, null);
    			append_dev(main, t5);
    			mount_component(section_skills, main, null);
    			append_dev(main, t6);
    			mount_component(section_footer, main, null);
    			insert_dev(target, t7, anchor);
    			mount_component(modals, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleLangSelect*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$i18n*/ 8) && t1_value !== (t1_value = LanguageFullName[/*$i18n*/ ctx[3]] + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*$i18n*/ 8 && use1_xlink_href_value !== (use1_xlink_href_value = "#Flag_" + /*$i18n*/ ctx[3])) {
    				xlink_attr(use1, "xlink:href", use1_xlink_href_value);
    			}

    			if (!current || dirty & /*selectingLang*/ 1) {
    				attr_dev(button, "aria-hidden", /*selectingLang*/ ctx[0]);
    			}

    			if (/*selectingLang*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*selectingLang*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*selectingLang*/ 1 && div_tabindex_value !== (div_tabindex_value = /*selectingLang*/ ctx[0] ? 1 : -1)) {
    				attr_dev(div, "tabindex", div_tabindex_value);
    			}

    			if (dirty & /*selectingLang*/ 1) {
    				toggle_class(div, "active", /*selectingLang*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(section_landing.$$.fragment, local);
    			transition_in(section_projects.$$.fragment, local);
    			transition_in(section_skills.$$.fragment, local);
    			transition_in(section_footer.$$.fragment, local);
    			transition_in(modals.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(section_landing.$$.fragment, local);
    			transition_out(section_projects.$$.fragment, local);
    			transition_out(section_skills.$$.fragment, local);
    			transition_out(section_footer.$$.fragment, local);
    			transition_out(modals.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			destroy_component(section_landing);
    			destroy_component(section_projects);
    			destroy_component(section_skills);
    			destroy_component(section_footer);
    			if (detaching) detach_dev(t7);
    			destroy_component(modals, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(282:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (270:29) 
    function create_if_block_1(ctx) {
    	let div;
    	let each_value = LanguageList;
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
    			add_location(div, file, 270, 1, 8278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectLang, LanguageList, LanguageFullName*/ 32) {
    				each_value = LanguageList;
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
    		source: "(270:29) ",
    		ctx
    	});

    	return block;
    }

    // (264:0) {#if $isLoading}
    function create_if_block(ctx) {
    	let div;
    	let svg;
    	let use;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			xlink_attr(use, "xlink:href", "#Icon_Loader");
    			add_location(use, file, 266, 3, 8193);
    			attr_dev(svg, "class", "icon icon-load");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file, 265, 2, 8103);
    			attr_dev(div, "id", "AppLoader");
    			attr_dev(div, "class", "flex flex-center");
    			add_location(div, file, 264, 1, 8054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, use);
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
    		source: "(264:0) {#if $isLoading}",
    		ctx
    	});

    	return block;
    }

    // (294:3) {#if selectingLang}
    function create_if_block_2(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let each_value_1 = LanguageList;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "options grid gap-05");
    			add_location(div, file, 294, 4, 9363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*LanguageList, $i18n, selectLang, LanguageFullName*/ 40) {
    				each_value_1 = LanguageList;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
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
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, disclosureTransition, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, disclosureTransition, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(294:3) {#if selectingLang}",
    		ctx
    	});

    	return block;
    }

    // (296:5) {#each LanguageList as locale}
    function create_each_block_1(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = LanguageFullName[/*locale*/ ctx[11]] + "";
    	let t0;
    	let t1;
    	let use;
    	let t2;
    	let span;
    	let t3_value = LanguageFullName[/*locale*/ ctx[11]] + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[8](/*locale*/ ctx[11]);
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
    			add_location(title, file, 300, 8, 9717);
    			xlink_attr(use, "xlink:href", "#Flag_" + /*locale*/ ctx[11]);
    			add_location(use, file, 301, 8, 9773);
    			attr_dev(svg, "class", "flag icon icon-175");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file, 299, 7, 9618);
    			attr_dev(span, "class", "label");
    			add_location(span, file, 303, 7, 9831);
    			attr_dev(button, "class", "option flex nowrap flex-center-y gap-1");
    			toggle_class(button, "active", /*locale*/ ctx[11] === /*$i18n*/ ctx[3]);
    			add_location(button, file, 296, 6, 9473);
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

    			if (dirty & /*LanguageList, $i18n*/ 8) {
    				toggle_class(button, "active", /*locale*/ ctx[11] === /*$i18n*/ ctx[3]);
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
    		source: "(296:5) {#each LanguageList as locale}",
    		ctx
    	});

    	return block;
    }

    // (272:2) {#each LanguageList as locale}
    function create_each_block(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t0_value = LanguageFullName[/*locale*/ ctx[11]] + "";
    	let t0;
    	let t1;
    	let use;
    	let t2;
    	let span;
    	let t3_value = LanguageFullName[/*locale*/ ctx[11]] + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*locale*/ ctx[11]);
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
    			add_location(title, file, 274, 5, 8571);
    			xlink_attr(use, "xlink:href", "#Flag_" + /*locale*/ ctx[11]);
    			add_location(use, file, 275, 5, 8624);
    			attr_dev(svg, "class", "flag icon icon-175");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file, 273, 4, 8475);
    			attr_dev(span, "class", "label");
    			add_location(span, file, 277, 4, 8676);
    			attr_dev(button, "class", "option flex nowrap flex-center-y gap-05");
    			add_location(button, file, 272, 3, 8378);
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
    		source: "(272:2) {#each LanguageList as locale}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let icons;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	icons = new Icons({ $$inline: true });
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$isLoading*/ ctx[1]) return 0;
    		if (/*$isInvalidLanguage*/ ctx[2]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(icons.$$.fragment);
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(icons, target, anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "focus", _checkIsFocusAllowed, true, false, false),
    					listen_dev(window_1, "online", _userOnlineStatus, false, false, false),
    					listen_dev(window_1, "offline", _userOnlineStatus, false, false, false),
    					listen_dev(window_1, "keydown", /*keydown_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
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
    			transition_in(icons.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icons.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icons, detaching);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
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

    const reducedMotionMediaQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const moreContrastMediaQuery = matchMedia('(prefers-contrast: more)');
    const colorSchemaMediaQuery = matchMedia('(prefers-color-scheme: dark)');
    var t_AppTheme;

    (function (t_AppTheme) {
    	t_AppTheme["System"] = "sys";
    	t_AppTheme["Light"] = "light";
    	t_AppTheme["Dark"] = "dark";
    })(t_AppTheme || (t_AppTheme = {}));

    const socialMedia = [
    	{
    		name: 'GitHub',
    		url: 'https://github.com/DanielSharkov'
    	},
    	{
    		name: 'Codepen',
    		url: 'https://codepen.io/DanielSharkov'
    	},
    	{
    		name: 'Discord',
    		url: 'https://discordapp.com/users/253168850969821184',
    		app: 'discord://discordapp.com/users/253168850969821184'
    	},
    	{
    		name: 'Telegram',
    		url: 'https://t.me/danielsharkov',
    		app: 'tg://t.me/danielsharkov'
    	},
    	{
    		name: 'Twitter',
    		url: 'https://twitter.com/DanielSharkov'
    	}
    ];

    const appThemeLocStoreID = 'danielsharkov_com';
    let _appTheme = t_AppTheme.System;

    if ('localStorage' in window) {
    	const locStore = localStorage.getItem(appThemeLocStoreID);

    	if (locStore) {
    		_appTheme = locStore;
    	}
    }

    const thisStore = writable({
    	theme: _appTheme,
    	isOffline: typeof (navigator === null || navigator === void 0
    	? void 0
    	: navigator.onLine) === 'boolean' && !(navigator === null || navigator === void 0
    	? void 0
    	: navigator.onLine),
    	a11y: {
    		isDarkTheme: colorSchemaMediaQuery.matches,
    		reducedMotion: reducedMotionMediaQuery.matches,
    		moreContrast: moreContrastMediaQuery.matches
    	}
    });

    const appState = {
    	subscribe: thisStore.subscribe,
    	$: () => get_store_value(appState)
    };

    function _reducedMotionChanged() {
    	thisStore.update($ => {
    		$.a11y.reducedMotion = reducedMotionMediaQuery.matches;
    		return $;
    	});
    }

    function _moreContrastChanged() {
    	thisStore.update($ => {
    		$.a11y.moreContrast = moreContrastMediaQuery.matches;
    		return $;
    	});
    }

    function _colorSchemaChanged() {
    	thisStore.update($ => {
    		$.a11y.isDarkTheme = colorSchemaMediaQuery.matches;
    		return $;
    	});
    }

    function _userOnlineStatus() {
    	thisStore.update($ => {
    		$.isOffline = !(navigator === null || navigator === void 0
    		? void 0
    		: navigator.onLine);

    		return $;
    	});
    }

    reducedMotionMediaQuery.addEventListener('change', _reducedMotionChanged);
    moreContrastMediaQuery.addEventListener('change', _moreContrastChanged);
    colorSchemaMediaQuery.addEventListener('change', _colorSchemaChanged);

    thisStore.subscribe($ => {
    	document.documentElement.setAttribute('app-theme', $.theme);
    	document.documentElement.setAttribute('reduced-motion', $.a11y.reducedMotion ? 'true' : 'false');
    	document.documentElement.setAttribute('more-contrast', $.a11y.moreContrast ? 'true' : 'false');

    	if ('localStorage' in window) {
    		localStorage.setItem(appThemeLocStoreID, $.theme);
    	}
    });

    const lockScrollStore = writable([]);

    function lockScroll(id) {
    	if (id === '') {
    		throw new Error(`lockScroll: invalid ID given, got "${id}"`);
    	}

    	let err = null;

    	lockScrollStore.update($ => {
    		if ($.indexOf(id) >= 0) {
    			err = new Error(`lockScroll: ID "${id}" already locked`);
    			return $;
    		}

    		$.push(id);

    		if ($.length > 0) {
    			document.scrollingElement.setAttribute('lock-scroll', 'true');
    		}

    		return $;
    	});

    	if (err !== null) {
    		throw err;
    	}
    }

    function unlockScroll(id) {
    	if (id === '') {
    		throw new Error(`unlockScroll: invalid ID given "${id}"`);
    	}

    	let err = null;

    	lockScrollStore.update($ => {
    		const idx = $.indexOf(id);

    		if (idx < 0) {
    			err = new Error(`unlockScroll: ID "${id}" not locked`);
    			return $;
    		}

    		$.splice(idx, 1);

    		if ($.length < 1) {
    			document.scrollingElement.removeAttribute('lock-scroll');
    		}

    		return $;
    	});

    	if (err !== null) {
    		throw err;
    	}
    }

    function setTheme(theme) {
    	thisStore.update($ => {
    		$.theme = theme;
    		return $;
    	});
    }

    const _actionStack = [];

    function stackAction(resolver) {
    	const id = randID();
    	_actionStack.unshift({ id, resolver });
    	return id;
    }

    function resolveAction(id) {
    	for (let i = 0; i < _actionStack.length; i++) {
    		if (_actionStack[i].id === id) {
    			_actionStack.splice(i, 1);
    		}
    	}
    }

    // unstack recent action by ESC key
    function escapeAction(event) {
    	if (_actionStack.length > 0) {
    		event.preventDefault();
    		_actionStack[0].resolver();
    		return false;
    	}

    	return true;
    }

    // the latest restriction will be 
    let _restrictedFocusStack = [];

    function restrictFocus(el) {
    	if (Number.isNaN(Number(el.tabIndex))) {
    		console.error(el);
    		throw new Error('cannot restrict focus on given element, because the element is ' + 'not focusable (invalid tabindex)');
    	}

    	const id = randID();
    	_restrictedFocusStack.unshift({ id, target: el });
    	el.focus({ preventScroll: true });

    	return function () {
    		for (let i = 0; i < _restrictedFocusStack.length; i++) {
    			if (_restrictedFocusStack[i].id === id) {
    				_restrictedFocusStack.splice(i, 1);
    				break;
    			}
    		}
    	};
    }

    function _checkIsFocusAllowed(event) {
    	if (_restrictedFocusStack.length > 0) {
    		let isAllowedFocus = false;

    		for (const el of event.composedPath()) {
    			if (el === _restrictedFocusStack[0].target) {
    				isAllowedFocus = true;
    				break;
    			}
    		}

    		if (!isAllowedFocus) {
    			event.preventDefault();
    			_restrictedFocusStack[0].target.focus();
    			return false;
    		}

    		return true;
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let $isLoading;
    	let $isInvalidLanguage;
    	let $i18n;
    	validate_store(k, 'isLoading');
    	component_subscribe($$self, k, $$value => $$invalidate(1, $isLoading = $$value));
    	validate_store(isInvalidLanguage, 'isInvalidLanguage');
    	component_subscribe($$self, isInvalidLanguage, $$value => $$invalidate(2, $isInvalidLanguage = $$value));
    	validate_store(i18n, 'i18n');
    	component_subscribe($$self, i18n, $$value => $$invalidate(3, $i18n = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let selectingLang = false;

    	function closeLangSelect() {
    		$$invalidate(0, selectingLang = false);
    	}

    	function openLangSelect() {
    		$$invalidate(0, selectingLang = true);
    	}

    	function toggleLangSelect() {
    		vibrate();
    		if (selectingLang) closeLangSelect(); else openLangSelect();
    	}

    	function selectLang(lang) {
    		vibrate();
    		i18n.switch(lang);
    		closeLangSelect();
    	}

    	onMount(() => {
    		let queryProjectID = getQuery('project');

    		if (queryProjectID in projectsIdxMap) {
    			openModal({
    				name: 'project',
    				props: {
    					project: projects[projectsIdxMap[queryProjectID]]
    				}
    			});
    		} else {
    			removeQuery('project');
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = event => {
    		if (event.key == 'Escape') {
    			return escapeAction(event);
    		}
    	};

    	const click_handler = locale => selectLang(locale);
    	const click_handler_1 = locale => selectLang(locale);

    	$$self.$capture_state = () => ({
    		writable,
    		get$: get_store_value,
    		reducedMotionMediaQuery,
    		moreContrastMediaQuery,
    		colorSchemaMediaQuery,
    		t_AppTheme,
    		socialMedia,
    		appThemeLocStoreID,
    		_appTheme,
    		thisStore,
    		appState,
    		_reducedMotionChanged,
    		_moreContrastChanged,
    		_colorSchemaChanged,
    		_userOnlineStatus,
    		lockScrollStore,
    		lockScroll,
    		unlockScroll,
    		setTheme,
    		_actionStack,
    		stackAction,
    		resolveAction,
    		escapeAction,
    		_restrictedFocusStack,
    		restrictFocus,
    		_checkIsFocusAllowed,
    		Section_Landing: Landing,
    		Section_Projects: Projects,
    		Section_Skills: Skills,
    		Section_Footer: Footer,
    		Modals,
    		openModal,
    		Icons,
    		isLoading: k,
    		_: Y,
    		i18n,
    		LanguageList,
    		LanguageFullName,
    		isInvalidLanguage,
    		Language,
    		randID,
    		vibrate,
    		disclosureTransition,
    		onMount,
    		getQuery,
    		removeQuery,
    		projects,
    		projectsIdxMap,
    		selectingLang,
    		closeLangSelect,
    		openLangSelect,
    		toggleLangSelect,
    		selectLang,
    		$isLoading,
    		$isInvalidLanguage,
    		$i18n
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectingLang' in $$props) $$invalidate(0, selectingLang = $$props.selectingLang);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectingLang,
    		$isLoading,
    		$isInvalidLanguage,
    		$i18n,
    		toggleLangSelect,
    		selectLang,
    		keydown_handler,
    		click_handler,
    		click_handler_1
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
