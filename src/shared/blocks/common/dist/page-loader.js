'use client';
"use strict";
exports.__esModule = true;
exports.PageLoader = void 0;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var prismatic_burst_1 = require("@/shared/components/magicui/prismatic-burst");
// Quotes with attributions in the style of the reference image
var LOADING_QUOTES = [
    { text: 'AI 是笔，创意是墨，故事永远由你书写。', author: 'AI-Manga' },
    { text: '从构思到成画，让创作的距离缩短为一个想法。', author: 'AI-Manga' },
    { text: '人人都可以是漫画家，只要心中有故事。', author: 'AI-Manga' },
    { text: '技术降低门槛，热爱决定高度。', author: 'AI-Manga' },
    { text: '你的故事，AI 来画。', author: 'AI-Manga' },
    { text: '让每一个脑洞都有机会成为作品。', author: 'AI-Manga' },
    { text: '电影就是梦的语言。', author: '费德里科·费里尼' },
    { text: '创作自由，表达无限。', author: 'AI-Manga' },
];
var TEXT_INTERVAL = 3000;
var FADE_DURATION = 500;
var MIN_DISPLAY_TIME = 2500;
var EXIT_DURATION = 600;
function PageLoader() {
    var _a = react_1.useState('pending'), state = _a[0], setState = _a[1];
    var _b = react_1.useState(function () {
        return Math.floor(Math.random() * LOADING_QUOTES.length);
    }), currentIndex = _b[0], setCurrentIndex = _b[1];
    var startTimeRef = react_1.useRef(0);
    react_1.useEffect(function () {
        startTimeRef.current = Date.now();
        setState('visible');
    }, []);
    react_1.useEffect(function () {
        if (state !== 'visible')
            return;
        var interval = setInterval(function () {
            setCurrentIndex(function (prev) { return (prev + 1) % LOADING_QUOTES.length; });
        }, TEXT_INTERVAL);
        return function () { return clearInterval(interval); };
    }, [state]);
    react_1.useEffect(function () {
        if (state !== 'visible')
            return;
        var triggerExit = function () {
            var elapsed = Date.now() - startTimeRef.current;
            var remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
            setTimeout(function () {
                setState('exiting');
                setTimeout(function () {
                    setState('hidden');
                }, EXIT_DURATION);
            }, remaining);
        };
        if (document.readyState === 'complete') {
            triggerExit();
        }
        else {
            window.addEventListener('load', triggerExit, { once: true });
            return function () { return window.removeEventListener('load', triggerExit); };
        }
    }, [state]);
    if (state === 'pending' || state === 'hidden')
        return null;
    var currentQuote = LOADING_QUOTES[currentIndex];
    return (React.createElement(framer_motion_1.motion.div, { className: "fixed inset-0 z-[9999] flex items-center justify-center bg-white", initial: { opacity: 1 }, animate: { opacity: state === 'exiting' ? 0 : 1 }, transition: { duration: EXIT_DURATION / 1000, ease: 'easeInOut' } },
        React.createElement("div", { className: "absolute inset-0" },
            React.createElement(prismatic_burst_1.PrismaticBurst, { animationType: "rotate3d", intensity: 15, speed: 2, colors: ['#EBD4DC', '#D4DCF0', '#DADADE', '#E0D4EB', '#D4E8E2', '#F0E4D8'], paused: state === 'exiting', mixBlendMode: "normal" })),
        React.createElement("div", { className: "relative z-10 flex flex-col items-center justify-center px-6" },
            React.createElement(framer_motion_1.AnimatePresence, { mode: "wait" },
                React.createElement(framer_motion_1.motion.div, { key: currentIndex, className: "flex flex-col items-center gap-3", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: FADE_DURATION / 1000, ease: 'easeInOut' } },
                    React.createElement("p", { className: "text-center text-lg font-medium tracking-wide text-gray-700 md:text-xl lg:text-2xl" }, currentQuote.text),
                    React.createElement("p", { className: "text-center text-sm text-gray-400" },
                        "\u2014\u2014",
                        currentQuote.author))))));
}
exports.PageLoader = PageLoader;
