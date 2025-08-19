"use strict";
var i18n_ts;
(function (i18n_ts) {
    let urlOrigin;
    let urlParams;
    i18n_ts.isEdge = false;
    let AppMode;
    (function (AppMode) {
        AppMode[AppMode["edit"] = 0] = "edit";
        AppMode[AppMode["play"] = 1] = "play";
        AppMode[AppMode["lessonEdit"] = 2] = "lessonEdit";
        AppMode[AppMode["lessonPlay"] = 3] = "lessonPlay";
    })(AppMode = i18n_ts.AppMode || (i18n_ts.AppMode = {}));
    i18n_ts.textLanguageCode = "eng";
    let TextToId;
    const languages = [
        ["اَلْعَرَبِيَّةُ", "ara", ['"', '"']],
        ["汉语", "chi", ['“', '”']],
        ["English", "eng", ['"', '"']],
        ["français", "fre", ['« ', ' »']],
        ["Deutsch", "ger", ['„', '“']],
        ["हिन्दी", "hin", ['"', '"']],
        ["Indonesia", "ind", ['"', '"']],
        ["日本語", "jpn", ['「', '」']],
        ["한국어", "kor", ['"', '"']],
        ["Русский", "rus", ['«', '»']],
        ["español", "spa", ['"', '"']],
        ["português", "por", ['"', '"']],
    ];
    const engTexts = [];
    /**
    Quotation mark
        https://en.wikipedia.org/wiki/Quotation_mark
     */
    let quotationMarks = new Map([]);
    /*
    List of ISO 639 language codes
        https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
    
    Arabic	ar	ara	ara
    Bengali	bn	ben	ben
    Burmese	my	mya	bur
    Chinese	zh	zho	chi
    Dutch	nl	nld	dut
    English	en	eng	eng
    French	    fr	fra	fre
    German	    de	deu	ger
    Greek	    el	ell	gre
    Hebrew	    he	heb	heb
    Hindi	hi	hin	hin
    Indonesian	id	ind	ind
    Italian	    it	ita	ita
    Japanese    ja	jpn	jpn
    Javanese	jv	jav	jav
    Khmer	km	khm	khm
    Korean	ko	kor	kor
    Mongolian	mn	mon	mon
    Nepali	ne	nep	nep
    Persian	fa	fas	per
    Polish	pl	pol	pol
    Punjabi	pa	pan	pan
    Portuguese	pt	por	por
    Russian	ru	rus	rus
    Spanish	es	spa	spa
    Tagalog	tl	tgl	tgl
    Tamil	ta	tam	tam
    Thai	th	tha	tha
    Turkish	tr	tur	tur
    Urdu	ur	urd	urd
    Vietnamese	vi	vie	vie
    
    
    Internet users by language
        https://en.wikipedia.org/wiki/Languages_used_on_the_Internet
    
    1	English	1,186,451,052	25.9%
    2	Chinese	888,453,068	19.4%
    3	Spanish	363,684,593	  7.9%
    4	Arabic	237,418,349	  5.2%
    5	Indonesian	198,029,815	  4.3%
    6	Portuguese	171,750,818	  3.7%
    7	French	144,695,288	  3.3 %
    8	Japanese	118,626,672	  2.6%
    9	Russian	116,353,942	  2.5%
    10	German	92,525,427	  2.0%
    1–10	Top 10 languages	3,525,027,347	  76.9%
    
    */
    let translationMap = new Map();
    let maxTranslationId;
    function setTextLanguageCode(code3) {
        const code3s = languages.map(x => x[1]);
        if (code3.includes(code3)) {
            i18n_ts.textLanguageCode = code3;
        }
        else {
            throw new i18n_ts.MyError();
        }
    }
    i18n_ts.setTextLanguageCode = setTextLanguageCode;
    function initLetters() {
        const A = "A".charCodeAt(0);
        const a = "a".charCodeAt(0);
        const Alpha = "Α".charCodeAt(0);
        const alpha = "α".charCodeAt(0);
        i18n_ts.upperLatinLetters = i18n_ts.range(26).map(i => String.fromCharCode(A + i)).join("");
        i18n_ts.lowerLatinLetters = i18n_ts.range(26).map(i => String.fromCharCode(a + i)).join("");
        i18n_ts.latinLetters = i18n_ts.upperLatinLetters + i18n_ts.lowerLatinLetters;
        i18n_ts.upperGreekLetters = i18n_ts.range(24).filter(i => i != 17).map(i => String.fromCharCode(Alpha + i)).join("");
        i18n_ts.lowerGreekLetters = i18n_ts.range(24).filter(i => i != 17).map(i => String.fromCharCode(alpha + i)).join("");
        // msg(upperLatinLetters);
        // msg(lowerLatinLetters);
        // msg(upperGreekLetters);
        // msg(lowerGreekLetters);
    }
    async function getAllTexts() {
        const [origin, ,] = i18n_ts.parseURL();
        const names = [
            "parser",
            "plane",
            "firebase",
            "movie"
        ];
        const texts = [];
        for (const name of names) {
            const url = `${origin}/lib/${name}/${name}.js`;
            i18n_ts.msg(`js url:${url}`);
            const text = await i18n_ts.fetchText(url);
            for (const quote of ["'", '"']) {
                let start = 0;
                const TT_quote = `TT(${quote}`;
                while (true) {
                    const k1 = text.indexOf(TT_quote, start);
                    if (k1 == -1) {
                        break;
                    }
                    if (0 < k1 && i18n_ts.isIdentifierLetter(text.charAt(k1 - 1))) {
                        start = k1 + 3;
                        continue;
                    }
                    const k2 = text.indexOf(quote, k1 + 3);
                    i18n_ts.assert(k2 != -1);
                    const s = text.substring(k1 + 3, k2);
                    texts.push(s);
                    start = k2 + 1;
                }
            }
        }
        return texts;
    }
    i18n_ts.getAllTexts = getAllTexts;
    function TT(text) {
        text = text.trim();
        if (text == "" || i18n_ts.textLanguageCode == "eng") {
            return text;
        }
        const target = translationMap.get(text);
        if (target == undefined) {
            if (!engTexts.includes(text)) {
                i18n_ts.msg(`new text:[${text}]`);
                engTexts.push(text);
            }
        }
        return target != undefined ? target.trim() : text;
    }
    i18n_ts.TT = TT;
    function getEngTexts() {
        return Array.from(engTexts.entries()).map(x => `${maxTranslationId + 1 + x[0]}:${x[1]}`).join("\n\n");
    }
    i18n_ts.getEngTexts = getEngTexts;
    function TTs(text) {
        const lines = text.split("\n").map(x => x.trim()).filter(x => x != "");
        return lines.map(x => TT(x));
    }
    i18n_ts.TTs = TTs;
    function getIdFromText(text) {
        return TextToId.get(text);
    }
    i18n_ts.getIdFromText = getIdFromText;
    function getQuotationMarks() {
        const marks = quotationMarks.get(i18n_ts.textLanguageCode);
        if (marks == undefined) {
            return ['"', '"'];
        }
        else {
            return marks;
        }
    }
    function token(text) {
        if (i18n_ts.textLanguageCode == "ara") {
            switch ("ABCDE".indexOf(text)) {
                case 0: return "أ";
                case 1: return "ب";
                case 2: return "ج";
                case 3: return "د";
                case 4: return "هـ";
            }
            throw new i18n_ts.MyError();
        }
        const [start_mark, end_mark] = getQuotationMarks();
        return start_mark + text + end_mark;
    }
    i18n_ts.token = token;
    class AbstractSpeech {
        static one;
        prevCharIndex = 0;
        speaking = false;
        callback;
    }
    i18n_ts.AbstractSpeech = AbstractSpeech;
    class Reading {
        readable;
        text;
        args;
        children;
        phrases = [];
        start = NaN;
        end = NaN;
        constructor(readable, text, args) {
            this.readable = readable;
            this.text = text;
            this.args = args;
            this.children = args.map(x => x.reading());
        }
        setPhrases() {
            if (this.children.length == 0) {
                this.phrases = [this.text];
            }
            else {
                const quotes = i18n_ts.range(this.children.length).map(i => token(i18n_ts.upperLatinLetters.charAt(i)));
                const positions = quotes.map(x => this.text.indexOf(x));
                i18n_ts.assert(positions.every(i => i != -1));
                const index_positions = Array.from(positions.entries());
                index_positions.sort((a, b) => a[1] - b[1]);
                let pos = 0;
                for (const [index, position] of index_positions) {
                    if (pos < position) {
                        this.phrases.push(this.text.substring(pos, position));
                    }
                    this.phrases.push(this.children[index]);
                    pos = position + quotes[index].length;
                }
                if (pos < this.text.length) {
                    this.phrases.push(this.text.substring(pos));
                }
            }
        }
        setStartEnd(start) {
            if (this.children.length == 0) {
                this.start = start;
                this.end = start + this.text.length;
            }
            else {
                let pos = start;
                for (const phrase of this.phrases) {
                    if (typeof phrase == "string") {
                        pos += phrase.length;
                    }
                    else {
                        phrase.setStartEnd(pos);
                        pos = phrase.end;
                    }
                }
            }
        }
        getAllTexts(texts) {
            if (this.children.length == 0) {
                texts.push(this.text);
            }
            else {
                for (const phrase of this.phrases) {
                    if (typeof phrase == "string") {
                        texts.push(phrase);
                    }
                    else {
                        phrase.getAllTexts(texts);
                    }
                }
            }
        }
        prepareReading() {
            this.setPhrases();
            this.setStartEnd(0);
            const texts = [];
            this.getAllTexts(texts);
            const all_text = texts.join("");
            return all_text;
        }
        getAllReadingsSub(readings) {
            readings.push(this);
            this.children.forEach(x => x.getAllReadingsSub(readings));
        }
        getAllReadings() {
            const readings = [];
            this.getAllReadingsSub(readings);
            return readings;
        }
    }
    i18n_ts.Reading = Reading;
    async function getTranslationMap(lang_code) {
        const url = `${urlOrigin}/lib/i18n/translation/${lang_code}.txt?ver=${Date.now()}`;
        let texts = await i18n_ts.fetchText(url);
        // for chinese text.
        texts = texts.replaceAll("：", ":");
        const id_to_text = new Map();
        const text_to_id = new Map();
        for (let line of texts.split("\n")) {
            line = line.trim();
            if (line == "") {
                continue;
            }
            const k3 = line.indexOf(":");
            i18n_ts.assert(k3 != -1);
            const id = parseInt(line.substring(0, k3));
            const text = line.substring(k3 + 1);
            if (text == "") {
                i18n_ts.msg(`skip:${lang_code} ${id}`);
                continue;
            }
            id_to_text.set(id, text);
            const id2 = text_to_id.get(text);
            if (id2 != undefined) {
                i18n_ts.msg(`dup:${lang_code} ${id2} ${id} ${text}`);
            }
            text_to_id.set(text, id);
        }
        i18n_ts.msg(`get-Translation-Map:${lang_code} ${id_to_text.size} ${text_to_id.size}`);
        return [id_to_text, text_to_id];
    }
    async function loadTranslationMap() {
        const [id_to_text1, text_to_id1] = await getTranslationMap("eng");
        i18n_ts.EngTextToId = text_to_id1;
        if (i18n_ts.textLanguageCode == "eng") {
            TextToId = text_to_id1;
            return;
        }
        const [id_to_text2, text_to_id2] = await getTranslationMap(i18n_ts.textLanguageCode);
        TextToId = text_to_id2;
        for (const [id, text2] of id_to_text2.entries()) {
            const text1 = id_to_text1.get(id);
            if (text1 != undefined) {
                translationMap.set(text1.trim(), text2.trim());
            }
            else {
                i18n_ts.msg(`no translation:${id} ${text2}`);
            }
        }
        maxTranslationId = Math.max(...Array.from(id_to_text1.keys()));
        i18n_ts.msg(`translation-Map size:${translationMap.size} max:${maxTranslationId}`);
    }
    i18n_ts.loadTranslationMap = loadTranslationMap;
    function checkBrowser() {
        if (navigator.userAgentData != undefined) {
            const brands = navigator.userAgentData.brands;
            for (const brand of brands) {
                if (brand.brand.includes("Edge")) {
                    i18n_ts.isEdge = true;
                    i18n_ts.msg("is Edge : true");
                }
                i18n_ts.msg(`userAgentData:[${brand.brand}]`);
            }
        }
        i18n_ts.msg(`userAgent:[${navigator.userAgent}]`);
    }
    async function initI18n() {
        checkBrowser();
        initLetters();
        for (const [name, code, quotes] of languages) {
            quotationMarks.set(code, quotes);
        }
        [urlOrigin, , urlParams] = i18n_ts.parseURL();
        if (urlParams.get("lesson") != undefined) {
            i18n_ts.appMode = AppMode.lessonPlay;
        }
        else {
            switch (urlParams.get("mode")) {
                case "edit":
                    i18n_ts.appMode = AppMode.edit;
                    break;
                case "lesson":
                    i18n_ts.appMode = AppMode.lessonEdit;
                    break;
                default:
                    i18n_ts.appMode = AppMode.play;
                    break;
            }
        }
        if (quotationMarks.has(i18n_ts.textLanguageCode)) {
            i18n_ts.msg(`lang code:${i18n_ts.textLanguageCode}`);
            await loadTranslationMap();
        }
        else {
            i18n_ts.msg(`illegal lang code:${i18n_ts.textLanguageCode}`);
        }
    }
    i18n_ts.initI18n = initI18n;
    async function bodyOnLoad() {
        await initI18n();
        const texts = await getAllTexts();
        const text = Array.from(texts.entries()).map(x => (x[0] + ":" + x[1])).join("\n");
        i18n_ts.msg(`all texts:`);
        i18n_ts.msg(text);
        i18n_ts.$inp("all-texts").value = text;
    }
    i18n_ts.bodyOnLoad = bodyOnLoad;
})(i18n_ts || (i18n_ts = {}));
var i18n_ts;
(function (i18n_ts) {
    i18n_ts.voiceLanguageCode = "eng";
    let cancelSpeechFlag = false;
    const voiceMap = new Map();
    i18n_ts.langCodeList = [
        ["ara", "ar-EG"],
        ["chi", "zh-CN"],
        ["eng", "en-US"],
        ["fre", "fr-FR"],
        ["ger", "de-DE"],
        ["hin", "hi-IN"],
        ["ind", "id-ID"],
        ["jpn", "ja-JP"],
        ["kor", "ko-KR"],
        ["rus", "ru-RU"],
        ["spa", "es-ES"],
        ["por", "pt-PT"],
    ];
    i18n_ts.langCodeMap = new Map(i18n_ts.langCodeList);
    const voiceNamesDic = {
        "ja-JP": [
            "Microsoft Nanami Online (Natural) - Japanese (Japan)",
            "Google 日本語",
            "Microsoft Ayumi - Japanese (Japan)"
        ],
        "en-US": [
            "Microsoft Ava Online (Natural) - English (United States)",
            "Google US English",
            "Microsoft Zira - English (United States)"
        ]
    };
    let languageRegion;
    function setVoiceLanguageCode(code) {
        i18n_ts.voiceLanguageCode = code;
    }
    i18n_ts.setVoiceLanguageCode = setVoiceLanguageCode;
    function getVoiceByLangCode(lang_code) {
        languageRegion = i18n_ts.langCodeMap.get(lang_code);
        if (languageRegion == undefined) {
            throw new i18n_ts.MyError(`unknown lang code:${lang_code}`);
        }
        const voices = voiceMap.get(languageRegion);
        if (voices == undefined) {
            i18n_ts.msg(`no voice for ${languageRegion}`);
            return undefined;
        }
        const default_names = voiceNamesDic[languageRegion];
        if (default_names != undefined) {
            for (const name of default_names) {
                const voice = voices.find(x => x.name == name);
                if (voice != undefined) {
                    return voice;
                }
            }
        }
        const natural_voice = voices.find(x => x.name.indexOf("Online (Natural)") != -1);
        if (natural_voice != undefined) {
            return natural_voice;
        }
        return voices[0];
    }
    class Speech extends i18n_ts.AbstractSpeech {
        static maxId = 0;
        id;
        voice;
        text;
        constructor() {
            super();
            i18n_ts.AbstractSpeech.one = this;
            this.id = Speech.maxId++;
            this.initVoice();
        }
        initVoice() {
            if (voiceMap.size == 0) {
                setVoiceList();
            }
            if (this.voice == undefined) {
                this.voice = getVoiceByLangCode(i18n_ts.voiceLanguageCode);
                if (this.voice != undefined) {
                    // msg(`use voice:${this.voice.name}`);
                }
            }
        }
        emulate(speech_id) {
            let charIndex = 0;
            const id = setInterval(() => {
                if (i18n_ts.voiceLanguageCode == "jpn") {
                    charIndex++;
                }
                else {
                    charIndex = this.text.indexOf(" ", charIndex);
                    if (charIndex == -1) {
                        charIndex = this.text.length;
                    }
                    else {
                        charIndex++;
                    }
                }
                const ev = {
                    charIndex: charIndex,
                };
                this.onBoundary(ev);
                if (this.text.length <= charIndex) {
                    this.onEnd(ev);
                    clearInterval(id);
                }
            }, 1);
        }
        async speak(text) {
            cancelSpeechFlag = false;
            this.text = text.trim();
            if (this.text == "") {
                this.speaking = false;
                return;
            }
            this.speaking = true;
            if (i18n_ts.onSpeak != undefined) {
                i18n_ts.onSpeak(this.text);
            }
            const speech_id = i18n_ts.getIdFromText(this.text);
            if (i18n_ts.getPlayMode() == i18n_ts.PlayMode.fastForward) {
                this.emulate(speech_id);
                return;
            }
            /*
                    if(speech_id != undefined){
                        const ok = await playAudio(this, speech_id);
                        if(ok){
                            return;
                        }
                    }
            */
            this.initVoice();
            i18n_ts.msg(`Speak ${this.id}[${this.text}] ${this.voice != undefined ? this.voice.name : "no voice"}`);
            this.prevCharIndex = 0;
            const uttr = new SpeechSynthesisUtterance(this.text.replaceAll("○", "マル").replaceAll("×", "バツ"));
            uttr.addEventListener("end", this.onEnd.bind(this));
            uttr.addEventListener("boundary", this.onBoundary.bind(this));
            uttr.addEventListener("mark", this.onMark.bind(this));
            //uttr.rate = 5.0;// parseFloat(speechRate.value);
            if (this.voice != undefined) {
                uttr.voice = this.voice;
            }
            speechSynthesis.speak(uttr);
        }
        onBoundary(ev) {
            const text = this.text.substring(this.prevCharIndex, ev.charIndex).trim();
            if (ev.charIndex == 0) {
                i18n_ts.msg(`Speech start text:[${this.text}]`);
            }
            else {
                // msg(`Speech bdr: idx:${ev.charIndex} name:${ev.name} type:${ev.type} text:[${text}]`);
            }
            if (this.callback != undefined) {
                this.callback(ev.charIndex);
            }
            this.prevCharIndex = ev.charIndex;
        }
        onEnd(ev) {
            // msg(`Speech end: id:${this.id} idx:${ev.charIndex} name:${ev.name} type:${ev.type} text:[${this.text.substring(this.prevCharIndex)}]`);
            if (this.callback != undefined) {
                this.callback(this.text.length);
            }
            this.speaking = false;
        }
        onMark(ev) {
        }
        async waitEndNEW() {
            for (const i of i18n_ts.range(100)) {
                if (cancelSpeechFlag || !this.speaking) {
                    break;
                }
                await i18n_ts.sleep(10);
            }
            // msg(`wait end:${this.id}`);
        }
        waitEnd() {
            return new Promise((resolve) => {
                const id = setInterval(() => {
                    if (cancelSpeechFlag || !this.speaking) {
                        clearInterval(id);
                        // msg(`wait end:${this.id}`);
                        resolve();
                    }
                }, 10);
            });
        }
        async speak_waitEnd(text) {
            await this.speak(text);
            await this.waitEnd();
        }
    }
    i18n_ts.Speech = Speech;
    function pronunciation(word) {
        if (word[0] == '\\') {
            const tbl = {
                "dif": ["diff"],
                "Delta": ["delta"],
                "lim": ["limit"],
                "frac": ["fraction"],
                "sqrt": "square root".split(" "),
                "ne": "not equals".split(" "),
                "lt": "is less than".split(" "),
                "gt": "is greater than".split(" "),
                "le": "is less than or equals".split(" "),
                "ge": "is greater than or equals".split(" "),
            };
            const name = word.substring(1);
            if (name in tbl) {
                return tbl[name];
            }
            else {
                return [name];
            }
        }
        return [word];
    }
    i18n_ts.pronunciation = pronunciation;
    function setVoiceList() {
        const voices = Array.from(speechSynthesis.getVoices());
        if (voices.length == 0) {
            i18n_ts.msg("no voice");
            return;
        }
        for (const voice of voices) {
            // if(voice.lang == languageRegion){
            // msg(`voice lang:[${voice.lang}] name:[${voice.name}]`);
            // }
            let voice_lang = voice.lang.replaceAll("_", "-");
            const k = voice_lang.indexOf("-#");
            if (k != -1) {
                voice_lang = voice_lang.substring(0, k);
                // msg(`lang:${voice.lang} => ${voice_lang}`);
            }
            if (voiceMap.get(voice_lang) == undefined) {
                voiceMap.set(voice_lang, []);
                if (Array.from(i18n_ts.langCodeMap.values()).includes(voice_lang)) {
                    // msg(`voice lang:${voice_lang}`);
                }
            }
            voiceMap.get(voice_lang).push(voice);
        }
    }
    function initSpeechSub() {
        if ('speechSynthesis' in window) {
            i18n_ts.msg("このブラウザは音声合成に対応しています。🎉");
        }
        else {
            i18n_ts.msg("このブラウザは音声合成に対応していません。😭");
        }
    }
    function initSpeech() {
        initSpeechSub();
        speechSynthesis.onvoiceschanged = function () {
            i18n_ts.msg("voices changed 1");
            setVoiceList();
        };
        speechSynthesis.addEventListener("voiceschanged", (ev) => {
            setVoiceList();
            i18n_ts.msg("voices changed 2");
        });
    }
    i18n_ts.initSpeech = initSpeech;
    async function asyncInitSpeech() {
        initSpeechSub();
        return new Promise((resolve) => {
            speechSynthesis.addEventListener("voiceschanged", (ev) => {
                setVoiceList();
                i18n_ts.msg("speech initialized");
                resolve();
            });
        });
    }
    i18n_ts.asyncInitSpeech = asyncInitSpeech;
    function cancelSpeech() {
        cancelSpeechFlag = true;
        speechSynthesis.cancel();
    }
    i18n_ts.cancelSpeech = cancelSpeech;
})(i18n_ts || (i18n_ts = {}));
var i18n_ts;
(function (i18n_ts) {
    //
    let PlayMode;
    (function (PlayMode) {
        PlayMode[PlayMode["stop"] = 0] = "stop";
        PlayMode[PlayMode["normal"] = 1] = "normal";
        PlayMode[PlayMode["fastForward"] = 2] = "fastForward";
    })(PlayMode = i18n_ts.PlayMode || (i18n_ts.PlayMode = {}));
    let thePlayMode = PlayMode.stop;
    const $dic = new Map();
    function setPlayMode(play_mode) {
        thePlayMode = play_mode;
    }
    i18n_ts.setPlayMode = setPlayMode;
    function getPlayMode() {
        return thePlayMode;
    }
    i18n_ts.getPlayMode = getPlayMode;
    function $(id) {
        let ele = $dic.get(id);
        if (ele == undefined) {
            ele = document.getElementById(id);
            $dic.set(id, ele);
        }
        return ele;
    }
    i18n_ts.$ = $;
    function $div(id) {
        return $(id);
    }
    i18n_ts.$div = $div;
    function $inp(id) {
        return $(id);
    }
    i18n_ts.$inp = $inp;
    function $sel(id) {
        return $(id);
    }
    i18n_ts.$sel = $sel;
    class MyError extends Error {
        constructor(text = "") {
            super(text);
        }
    }
    i18n_ts.MyError = MyError;
    function assert(b, msg = "") {
        if (!b) {
            throw new MyError(msg);
        }
    }
    i18n_ts.assert = assert;
    function check(b, msg = "") {
        if (!b) {
            throw new MyError(msg);
        }
    }
    i18n_ts.check = check;
    function msg(txt) {
        console.log(txt);
    }
    i18n_ts.msg = msg;
    async function sleep(milliseconds, fast_sleep = 1) {
        if (thePlayMode == PlayMode.fastForward) {
            assert(fast_sleep == 1);
            milliseconds = fast_sleep;
        }
        if (1 < milliseconds) {
            // msg(`sleep:[${milliseconds}]`);
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, milliseconds);
        });
    }
    i18n_ts.sleep = sleep;
    function range(n) {
        return [...Array(n).keys()];
    }
    i18n_ts.range = range;
    function range2(start, end) {
        return range(end - start).map(x => start + x);
    }
    i18n_ts.range2 = range2;
    function last(v) {
        return v[v.length - 1];
    }
    i18n_ts.last = last;
    function arrayFill(size, value) {
        return new Array(size).fill(value);
    }
    i18n_ts.arrayFill = arrayFill;
    function unique(v) {
        let set = new Set();
        const ret = [];
        for (const x of v) {
            if (!set.has(x)) {
                set.add(x);
                ret.push(x);
            }
        }
        return ret;
    }
    i18n_ts.unique = unique;
    function remove(v, x, existence_check = true) {
        const idx = v.indexOf(x);
        if (idx == -1) {
            if (existence_check) {
                throw new MyError();
            }
        }
        else {
            v.splice(idx, 1);
        }
    }
    i18n_ts.remove = remove;
    function append(v, x) {
        if (!v.includes(x)) {
            v.push(x);
        }
    }
    i18n_ts.append = append;
    function sum(v) {
        return v.reduce((acc, cur) => acc + cur, 0);
    }
    i18n_ts.sum = sum;
    function list(set) {
        if (set == undefined) {
            return [];
        }
        else {
            return Array.from(set);
        }
    }
    i18n_ts.list = list;
    function intersection(set1, set2) {
        if (set1 == undefined || set2 == undefined) {
            return [];
        }
        return Array.from(set1.values()).filter(x => set2.has(x));
    }
    i18n_ts.intersection = intersection;
    function permutation(v) {
        if (v.length == 2) {
            return [[v[0], v[1]], [v[1], v[0]]];
        }
        const vv = [];
        for (const i of range(v.length)) {
            const v1 = v.slice();
            const c = v1[i];
            v1.splice(i, 1);
            const vv1 = permutation(v1);
            for (const v2 of vv1) {
                v2.unshift(c);
                vv.push(v2);
            }
        }
        return vv;
    }
    i18n_ts.permutation = permutation;
    function circularPermutation(v) {
        const vv = permutation(v.slice(1));
        vv.forEach(x => x.unshift(v[0]));
        return vv;
    }
    i18n_ts.circularPermutation = circularPermutation;
    function areSetsEqual(A, B) {
        const setA = new Set(A);
        const setB = new Set(B);
        // Check if sizes are different
        if (setA.size !== setB.size) {
            return false;
        }
        // Check if all elements of setA are present in setB
        for (const element of setA) {
            if (!setB.has(element)) {
                return false;
            }
        }
        return true;
    }
    i18n_ts.areSetsEqual = areSetsEqual;
    function isSubSet(A, B) {
        const setB = new Set(B);
        return A.every(x => setB.has(x));
    }
    i18n_ts.isSubSet = isSubSet;
    function isIdentifierLetter(c) {
        return i18n_ts.latinLetters.indexOf(c) != -1 || c == "_";
    }
    i18n_ts.isIdentifierLetter = isIdentifierLetter;
    async function fetchText(fileURL) {
        const response = await fetch(fileURL);
        const text = await response.text();
        return text;
    }
    i18n_ts.fetchText = fetchText;
    function parseURL() {
        const url = document.location.href;
        const parser = new URL(url);
        // console.log(`href:${url} origin:${parser.origin} pathname:${parser.pathname} search:${parser.search}`)
        assert(parser.origin + parser.pathname + parser.search == url);
        const queryString = parser.search.substring(1);
        const queries = queryString.split("&");
        const params = new Map();
        queries.forEach(query => {
            const [key, value] = query.split("=");
            params.set(decodeURIComponent(key), decodeURIComponent(value));
        });
        return [parser.origin, parser.pathname, params];
    }
    i18n_ts.parseURL = parseURL;
})(i18n_ts || (i18n_ts = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL3JlYWRpbmcudHMiLCIuLi8uLi8uLi90cy9zcGVlY2gudHMiLCIuLi8uLi8uLi90cy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFVLE9BQU8sQ0FxZmhCO0FBcmZELFdBQVUsT0FBTztJQUVqQixJQUFJLFNBQWtCLENBQUM7SUFDdkIsSUFBSSxTQUErQixDQUFDO0lBR3pCLGNBQU0sR0FBYSxLQUFLLENBQUM7SUFFcEMsSUFBWSxPQUtYO0lBTEQsV0FBWSxPQUFPO1FBQ2YscUNBQUksQ0FBQTtRQUNKLHFDQUFJLENBQUE7UUFDSixpREFBVSxDQUFBO1FBQ1YsaURBQVUsQ0FBQTtJQUNkLENBQUMsRUFMVyxPQUFPLEdBQVAsZUFBTyxLQUFQLGVBQU8sUUFLbEI7SUFFVSx3QkFBZ0IsR0FBWSxLQUFLLENBQUM7SUFVN0MsSUFBSSxRQUE4QixDQUFDO0lBRW5DLE1BQU0sU0FBUyxHQUEyQztRQUN0RCxDQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2QyxDQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLENBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqQyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0IsQ0FBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3BDLENBQUM7SUFFRixNQUFNLFFBQVEsR0FBYyxFQUFFLENBQUM7SUFFL0I7OztPQUdHO0lBQ0gsSUFBSSxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQTJCLEVBQ3RELENBQUMsQ0FBQztJQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01Bb0RFO0lBRUYsSUFBSSxjQUFjLEdBQXlCLElBQUksR0FBRyxFQUFrQixDQUFDO0lBQ3JFLElBQUksZ0JBQXlCLENBQUM7SUFFOUIsU0FBZ0IsbUJBQW1CLENBQUMsS0FBYztRQUM5QyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEMsSUFBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUM7WUFDdEIsUUFBQSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDN0IsQ0FBQzthQUNHLENBQUM7WUFDRCxNQUFNLElBQUksUUFBQSxPQUFPLEVBQUUsQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQVJlLDJCQUFtQixzQkFRbEMsQ0FBQTtJQUVELFNBQVMsV0FBVztRQUNoQixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBR2hDLFFBQUEsaUJBQWlCLEdBQUcsUUFBQSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBQSxpQkFBaUIsR0FBRyxRQUFBLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1RSxRQUFBLFlBQVksR0FBRyxRQUFBLGlCQUFpQixHQUFHLFFBQUEsaUJBQWlCLENBQUM7UUFFckQsUUFBQSxpQkFBaUIsR0FBRyxRQUFBLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckcsUUFBQSxpQkFBaUIsR0FBRyxRQUFBLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFF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LENBQUMsRUFBRTtZQUNwQixNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ25FLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBaEJlLGdCQUFRLFdBZ0J2QixDQUFBO0FBRUQsQ0FBQyxFQXpPUyxPQUFPLEtBQVAsT0FBTyxRQXlPaEIiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgaTE4bl90cyB7XHJcblxyXG5sZXQgdXJsT3JpZ2luIDogc3RyaW5nO1xyXG5sZXQgdXJsUGFyYW1zIDogTWFwPHN0cmluZywgc3RyaW5nPjtcclxuXHJcbmV4cG9ydCBsZXQgYXBwTW9kZSA6IEFwcE1vZGU7XHJcbmV4cG9ydCBsZXQgaXNFZGdlIDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuZXhwb3J0IGVudW0gQXBwTW9kZSB7XHJcbiAgICBlZGl0LFxyXG4gICAgcGxheSxcclxuICAgIGxlc3NvbkVkaXQsXHJcbiAgICBsZXNzb25QbGF5LFxyXG59XHJcblxyXG5leHBvcnQgbGV0IHRleHRMYW5ndWFnZUNvZGUgOiBzdHJpbmcgPSBcImVuZ1wiO1xyXG5cclxuZXhwb3J0IGxldCAgdXBwZXJMYXRpbkxldHRlcnMgOiBzdHJpbmc7XHJcbmV4cG9ydCBsZXQgIGxvd2VyTGF0aW5MZXR0ZXJzIDogc3RyaW5nO1xyXG5leHBvcnQgbGV0ICBsYXRpbkxldHRlcnMgOiBzdHJpbmc7XHJcblxyXG5leHBvcnQgbGV0ICB1cHBlckdyZWVrTGV0dGVycyA6IHN0cmluZztcclxuZXhwb3J0IGxldCAgbG93ZXJHcmVla0xldHRlcnMgOiBzdHJpbmc7XHJcblxyXG5leHBvcnQgbGV0IEVuZ1RleHRUb0lkIDogTWFwPHN0cmluZywgbnVtYmVyPjtcclxubGV0IFRleHRUb0lkIDogTWFwPHN0cmluZywgbnVtYmVyPjtcclxuXHJcbmNvbnN0IGxhbmd1YWdlcyA6IChbc3RyaW5nLCBzdHJpbmcsIFtzdHJpbmcsc3RyaW5nXV0pW10gPSBbXHJcbiAgICBbIFwi2KfZjtmE2ZLYudmO2LHZjtio2ZDZitmO2ZHYqdmPXCIsIFwiYXJhXCIsIFsnXCInLCAnXCInXV0sXHJcbiAgICBbIFwi5rGJ6K+tXCIsIFwiY2hpXCIsIFsn4oCcJywgJ+KAnSddXSxcclxuICAgIFsgXCJFbmdsaXNoXCIsIFwiZW5nXCIsIFsnXCInLCAnXCInXV0sXHJcbiAgICBbIFwiZnJhbsOnYWlzXCIsIFwiZnJlXCIsIFsnwqvCoCcsICfCoMK7J11dLFxyXG4gICAgWyBcIkRldXRzY2hcIiwgXCJnZXJcIiwgWyfigJ4nLCAn4oCcJ11dLFxyXG4gICAgWyBcIuCkueCkv+CkqOCljeCkpuClgFwiLCBcImhpblwiLCBbJ1wiJywgJ1wiJ11dLFxyXG4gICAgWyBcIkluZG9uZXNpYVwiLCBcImluZFwiLCBbJ1wiJywgJ1wiJ11dLFxyXG4gICAgWyBcIuaXpeacrOiqnlwiLCBcImpwblwiLCBbJ+OAjCcsICfjgI0nXV0sXHJcbiAgICBbIFwi7ZWc6rWt7Ja0XCIsIFwia29yXCIsIFsnXCInLCAnXCInXV0sXHJcbiAgICBbIFwi0KDRg9GB0YHQutC40LlcIiwgXCJydXNcIiwgWyfCqycsICfCuyddXSxcclxuICAgIFsgXCJlc3Bhw7FvbFwiLCBcInNwYVwiLCBbJ1wiJywgJ1wiJ11dLFxyXG4gICAgWyBcInBvcnR1Z3XDqnNcIiwgXCJwb3JcIiwgWydcIicsICdcIiddXSxcclxuXTtcclxuXHJcbmNvbnN0IGVuZ1RleHRzIDogc3RyaW5nW10gPSBbXTtcclxuXHJcbi8qKlxyXG5RdW90YXRpb24gbWFya1xyXG4gICAgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUXVvdGF0aW9uX21hcmtcclxuICovXHJcbmxldCBxdW90YXRpb25NYXJrcyA9IG5ldyBNYXA8c3RyaW5nLCBbc3RyaW5nLCBzdHJpbmddPihbXHJcbl0pO1xyXG5cclxuLypcclxuTGlzdCBvZiBJU08gNjM5IGxhbmd1YWdlIGNvZGVzXHJcbiAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX0lTT182MzlfbGFuZ3VhZ2VfY29kZXNcclxuXHJcbkFyYWJpY1x0YXJcdGFyYVx0YXJhXHJcbkJlbmdhbGlcdGJuXHRiZW5cdGJlblxyXG5CdXJtZXNlXHRteVx0bXlhXHRidXJcclxuQ2hpbmVzZVx0emhcdHpob1x0Y2hpXHJcbkR1dGNoXHRubFx0bmxkXHRkdXRcclxuRW5nbGlzaFx0ZW5cdGVuZ1x0ZW5nXHJcbkZyZW5jaFx0ICAgIGZyXHRmcmFcdGZyZVxyXG5HZXJtYW5cdCAgICBkZVx0ZGV1XHRnZXJcclxuR3JlZWtcdCAgICBlbFx0ZWxsXHRncmVcclxuSGVicmV3XHQgICAgaGVcdGhlYlx0aGViXHJcbkhpbmRpXHRoaVx0aGluXHRoaW5cclxuSW5kb25lc2lhblx0aWRcdGluZFx0aW5kXHJcbkl0YWxpYW5cdCAgICBpdFx0aXRhXHRpdGFcclxuSmFwYW5lc2UgICAgamFcdGpwblx0anBuXHJcbkphdmFuZXNlXHRqdlx0amF2XHRqYXZcclxuS2htZXJcdGttXHRraG1cdGtobVxyXG5Lb3JlYW5cdGtvXHRrb3JcdGtvclxyXG5Nb25nb2xpYW5cdG1uXHRtb25cdG1vblxyXG5OZXBhbGlcdG5lXHRuZXBcdG5lcFxyXG5QZXJzaWFuXHRmYVx0ZmFzXHRwZXJcclxuUG9saXNoXHRwbFx0cG9sXHRwb2xcclxuUHVuamFiaVx0cGFcdHBhblx0cGFuXHJcblBvcnR1Z3Vlc2VcdHB0XHRwb3JcdHBvclxyXG5SdXNzaWFuXHRydVx0cnVzXHRydXNcclxuU3BhbmlzaFx0ZXNcdHNwYVx0c3BhXHJcblRhZ2Fsb2dcdHRsXHR0Z2xcdHRnbFxyXG5UYW1pbFx0dGFcdHRhbVx0dGFtXHJcblRoYWlcdHRoXHR0aGFcdHRoYVxyXG5UdXJraXNoXHR0clx0dHVyXHR0dXJcclxuVXJkdVx0dXJcdHVyZFx0dXJkXHJcblZpZXRuYW1lc2VcdHZpXHR2aWVcdHZpZVxyXG5cclxuXHJcbkludGVybmV0IHVzZXJzIGJ5IGxhbmd1YWdlXHJcbiAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MYW5ndWFnZXNfdXNlZF9vbl90aGVfSW50ZXJuZXRcclxuXHJcbjFcdEVuZ2xpc2hcdDEsMTg2LDQ1MSwwNTJcdDI1LjklXHJcbjJcdENoaW5lc2VcdDg4OCw0NTMsMDY4XHQxOS40JVxyXG4zXHRTcGFuaXNoXHQzNjMsNjg0LDU5M1x0ICA3LjklXHJcbjRcdEFyYWJpY1x0MjM3LDQxOCwzNDlcdCAgNS4yJVxyXG41XHRJbmRvbmVzaWFuXHQxOTgsMDI5LDgxNVx0ICA0LjMlXHJcbjZcdFBvcnR1Z3Vlc2VcdDE3MSw3NTAsODE4XHQgIDMuNyVcclxuN1x0RnJlbmNoXHQxNDQsNjk1LDI4OFx0ICAzLjMgJVxyXG44XHRKYXBhbmVzZVx0MTE4LDYyNiw2NzJcdCAgMi42JVxyXG45XHRSdXNzaWFuXHQxMTYsMzUzLDk0Mlx0ICAyLjUlXHJcbjEwXHRHZXJtYW5cdDkyLDUyNSw0MjdcdCAgMi4wJVxyXG4x4oCTMTBcdFRvcCAxMCBsYW5ndWFnZXNcdDMsNTI1LDAyNywzNDdcdCAgNzYuOSVcclxuXHJcbiovXHJcblxyXG5sZXQgdHJhbnNsYXRpb25NYXAgOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcclxubGV0IG1heFRyYW5zbGF0aW9uSWQgOiBudW1iZXI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0VGV4dExhbmd1YWdlQ29kZShjb2RlMyA6IHN0cmluZyl7XHJcbiAgICBjb25zdCBjb2RlM3MgPSBsYW5ndWFnZXMubWFwKHggPT4geFsxXSk7XHJcbiAgICBpZihjb2RlMy5pbmNsdWRlcyhjb2RlMykpe1xyXG4gICAgICAgIHRleHRMYW5ndWFnZUNvZGUgPSBjb2RlMztcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdExldHRlcnMoKXtcclxuICAgIGNvbnN0IEEgPSBcIkFcIi5jaGFyQ29kZUF0KDApO1xyXG4gICAgY29uc3QgYSA9IFwiYVwiLmNoYXJDb2RlQXQoMCk7XHJcblxyXG4gICAgY29uc3QgQWxwaGEgPSBcIs6RXCIuY2hhckNvZGVBdCgwKTtcclxuICAgIGNvbnN0IGFscGhhID0gXCLOsVwiLmNoYXJDb2RlQXQoMCk7XHJcblxyXG5cclxuICAgIHVwcGVyTGF0aW5MZXR0ZXJzID0gcmFuZ2UoMjYpLm1hcChpID0+IFN0cmluZy5mcm9tQ2hhckNvZGUoQSArIGkpKS5qb2luKFwiXCIpO1xyXG4gICAgbG93ZXJMYXRpbkxldHRlcnMgPSByYW5nZSgyNikubWFwKGkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShhICsgaSkpLmpvaW4oXCJcIik7XHJcbiAgICBsYXRpbkxldHRlcnMgPSB1cHBlckxhdGluTGV0dGVycyArIGxvd2VyTGF0aW5MZXR0ZXJzO1xyXG5cclxuICAgIHVwcGVyR3JlZWtMZXR0ZXJzID0gcmFuZ2UoMjQpLmZpbHRlcihpID0+IGkgIT0gMTcpLm1hcChpID0+IFN0cmluZy5mcm9tQ2hhckNvZGUoQWxwaGEgKyBpKSkuam9pbihcIlwiKTtcclxuICAgIGxvd2VyR3JlZWtMZXR0ZXJzID0gcmFuZ2UoMjQpLmZpbHRlcihpID0+IGkgIT0gMTcpLm1hcChpID0+IFN0cmluZy5mcm9tQ2hhckNvZGUoYWxwaGEgKyBpKSkuam9pbihcIlwiKTtcclxuXHJcbiAgICAvLyBtc2codXBwZXJMYXRpbkxldHRlcnMpO1xyXG4gICAgLy8gbXNnKGxvd2VyTGF0aW5MZXR0ZXJzKTtcclxuICAgIC8vIG1zZyh1cHBlckdyZWVrTGV0dGVycyk7XHJcbiAgICAvLyBtc2cobG93ZXJHcmVla0xldHRlcnMpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsVGV4dHMoKSB7XHJcbiAgICBjb25zdCBbIG9yaWdpbiwgLCBdID0gaTE4bl90cy5wYXJzZVVSTCgpO1xyXG5cclxuICAgIGNvbnN0IG5hbWVzID0gW1xyXG4gICAgICAgIFwicGFyc2VyXCIsXHJcbiAgICAgICAgXCJwbGFuZVwiLFxyXG4gICAgICAgIFwiZmlyZWJhc2VcIixcclxuICAgICAgICBcIm1vdmllXCJcclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgdGV4dHMgOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIGZvcihjb25zdCBuYW1lIG9mIG5hbWVzKXtcclxuICAgICAgICBjb25zdCB1cmwgPSBgJHtvcmlnaW59L2xpYi8ke25hbWV9LyR7bmFtZX0uanNgO1xyXG4gICAgICAgIG1zZyhganMgdXJsOiR7dXJsfWApO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCBmZXRjaFRleHQodXJsKTtcclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IHF1b3RlIG9mIFsgXCInXCIsICdcIicgXSl7XHJcbiAgICAgICAgICAgIGxldCBzdGFydCA9IDA7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBUVF9xdW90ZSA9IGBUVCgke3F1b3RlfWA7XHJcbiAgICAgICAgICAgIHdoaWxlKHRydWUpe1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGsxID0gdGV4dC5pbmRleE9mKFRUX3F1b3RlLCBzdGFydCk7XHJcbiAgICAgICAgICAgICAgICBpZihrMSA9PSAtMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoMCA8IGsxICYmIGlzSWRlbnRpZmllckxldHRlcih0ZXh0LmNoYXJBdChrMSAtIDEpKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBrMSArIDM7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgazIgPSB0ZXh0LmluZGV4T2YocXVvdGUsIGsxICsgMyk7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoazIgIT0gLTEpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcyA9IHRleHQuc3Vic3RyaW5nKGsxICsgMywgazIpO1xyXG4gICAgICAgICAgICAgICAgdGV4dHMucHVzaChzKTtcclxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gazIgKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0ZXh0cztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFRUKHRleHQgOiBzdHJpbmcpIDogc3RyaW5nIHtcclxuICAgIHRleHQgPSB0ZXh0LnRyaW0oKTtcclxuXHJcbiAgICBpZih0ZXh0ID09IFwiXCIgfHwgdGV4dExhbmd1YWdlQ29kZSA9PSBcImVuZ1wiKXtcclxuICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0YXJnZXQgPSB0cmFuc2xhdGlvbk1hcC5nZXQodGV4dCk7XHJcbiAgICBpZih0YXJnZXQgPT0gdW5kZWZpbmVkKXtcclxuXHJcbiAgICAgICAgaWYoIWVuZ1RleHRzLmluY2x1ZGVzKHRleHQpKXtcclxuICAgICAgICAgICAgbXNnKGBuZXcgdGV4dDpbJHt0ZXh0fV1gKTtcclxuICAgICAgICAgICAgZW5nVGV4dHMucHVzaCh0ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGFyZ2V0ICE9IHVuZGVmaW5lZCA/IHRhcmdldC50cmltKCkgOiB0ZXh0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW5nVGV4dHMoKSA6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShlbmdUZXh0cy5lbnRyaWVzKCkpLm1hcCh4ID0+IGAke21heFRyYW5zbGF0aW9uSWQgKyAxICsgeFswXX06JHt4WzFdfWApLmpvaW4oXCJcXG5cXG5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBUVHModGV4dCA6IHN0cmluZykgOiBzdHJpbmdbXSB7XHJcbiAgICBjb25zdCBsaW5lcyA9IHRleHQuc3BsaXQoXCJcXG5cIikubWFwKHggPT4geC50cmltKCkpLmZpbHRlcih4ID0+IHggIT0gXCJcIik7XHJcbiAgICByZXR1cm4gbGluZXMubWFwKHggPT4gVFQoeCkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SWRGcm9tVGV4dCh0ZXh0IDogc3RyaW5nKSA6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gVGV4dFRvSWQuZ2V0KHRleHQpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0UXVvdGF0aW9uTWFya3MoKSA6IFtzdHJpbmcsIHN0cmluZ117XHJcbiAgICBjb25zdCBtYXJrcyA9IHF1b3RhdGlvbk1hcmtzLmdldCh0ZXh0TGFuZ3VhZ2VDb2RlKTtcclxuICAgIGlmKG1hcmtzID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgcmV0dXJuIFsnXCInLCAnXCInXTtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgcmV0dXJuIG1hcmtzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdG9rZW4odGV4dCA6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgaWYodGV4dExhbmd1YWdlQ29kZSA9PSBcImFyYVwiKXtcclxuICAgICAgICBzd2l0Y2goXCJBQkNERVwiLmluZGV4T2YodGV4dCkpe1xyXG4gICAgICAgIGNhc2UgMDogcmV0dXJuIFwi2KNcIjtcclxuICAgICAgICBjYXNlIDE6IHJldHVybiBcItioXCI7XHJcbiAgICAgICAgY2FzZSAyOiByZXR1cm4gXCLYrFwiO1xyXG4gICAgICAgIGNhc2UgMzogcmV0dXJuIFwi2K9cIjtcclxuICAgICAgICBjYXNlIDQ6IHJldHVybiBcItmH2YBcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgW3N0YXJ0X21hcmssIGVuZF9tYXJrXSA9IGdldFF1b3RhdGlvbk1hcmtzKCk7XHJcbiAgICByZXR1cm4gc3RhcnRfbWFyayArIHRleHQgKyBlbmRfbWFyaztcclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzICBBYnN0cmFjdFNwZWVjaCB7ICAgIFxyXG4gICAgc3RhdGljIG9uZSA6IEFic3RyYWN0U3BlZWNoO1xyXG5cclxuICAgIHByZXZDaGFySW5kZXggPSAwO1xyXG4gICAgc3BlYWtpbmcgOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgY2FsbGJhY2sgOiAoKGlkeDpudW1iZXIpPT52b2lkKSB8IHVuZGVmaW5lZDtcclxuICAgIGFic3RyYWN0IHNwZWFrKHRleHQgOiBzdHJpbmcpIDogUHJvbWlzZTx2b2lkPjtcclxuICAgIGFic3RyYWN0IHdhaXRFbmQoKSA6IFByb21pc2U8dm9pZD47XHJcbiAgICBhYnN0cmFjdCBzcGVha193YWl0RW5kKHRleHQgOiBzdHJpbmcpIDogUHJvbWlzZTx2b2lkPjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZWFkYWJsZSB7XHJcbiAgICByZWFkaW5nKCkgOiBSZWFkaW5nO1xyXG4gICAgaGlnaGxpZ2h0KG9uIDogYm9vbGVhbikgOiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUmVhZGluZyB7XHJcbiAgICByZWFkYWJsZSA6IFJlYWRhYmxlO1xyXG4gICAgdGV4dCA6IHN0cmluZztcclxuICAgIGFyZ3MgOiBSZWFkYWJsZVtdO1xyXG4gICAgY2hpbGRyZW4gOiBSZWFkaW5nW107XHJcbiAgICBwaHJhc2VzIDogKHN0cmluZyB8IFJlYWRpbmcpW10gPSBbXTtcclxuICAgIHN0YXJ0IDogbnVtYmVyID0gTmFOO1xyXG4gICAgZW5kICAgOiBudW1iZXIgPSBOYU47XHJcblxyXG4gICAgY29uc3RydWN0b3IocmVhZGFibGUgOiBSZWFkYWJsZSwgdGV4dCA6IHN0cmluZywgYXJncyA6IFJlYWRhYmxlW10pe1xyXG4gICAgICAgIHRoaXMucmVhZGFibGUgPSByZWFkYWJsZTtcclxuXHJcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcclxuXHJcbiAgICAgICAgdGhpcy5hcmdzID0gYXJncztcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gYXJncy5tYXAoeCA9PiB4LnJlYWRpbmcoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UGhyYXNlcygpe1xyXG4gICAgICAgIGlmKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09IDApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5waHJhc2VzID0gWyB0aGlzLnRleHQgXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgY29uc3QgcXVvdGVzID0gcmFuZ2UodGhpcy5jaGlsZHJlbi5sZW5ndGgpLm1hcChpID0+IHRva2VuKCB1cHBlckxhdGluTGV0dGVycy5jaGFyQXQoaSkgKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IHF1b3Rlcy5tYXAoeCA9PiB0aGlzLnRleHQuaW5kZXhPZih4KSk7XHJcbiAgICAgICAgICAgIGFzc2VydChwb3NpdGlvbnMuZXZlcnkoaSA9PiBpICE9IC0xKSk7XHJcbiAgICBcclxuICAgICAgICAgICAgY29uc3QgaW5kZXhfcG9zaXRpb25zID0gQXJyYXkuZnJvbShwb3NpdGlvbnMuZW50cmllcygpKTtcclxuICAgICAgICAgICAgaW5kZXhfcG9zaXRpb25zLnNvcnQoKGEsIGIpPT4gYVsxXSAtIGJbMV0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvcyA9IDA7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBbaW5kZXgsIHBvc2l0aW9uXSBvZiBpbmRleF9wb3NpdGlvbnMpe1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHBvcyA8IHBvc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBocmFzZXMucHVzaCh0aGlzLnRleHQuc3Vic3RyaW5nKHBvcywgcG9zaXRpb24pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBocmFzZXMucHVzaCh0aGlzLmNoaWxkcmVuW2luZGV4XSk7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIHBvcyA9IHBvc2l0aW9uICsgcXVvdGVzW2luZGV4XS5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBpZihwb3MgPCB0aGlzLnRleHQubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucGhyYXNlcy5wdXNoKHRoaXMudGV4dC5zdWJzdHJpbmcocG9zKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0U3RhcnRFbmQoc3RhcnQgOiBudW1iZXIpIHtcclxuICAgICAgICBpZih0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PSAwKXtcclxuICAgICAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xyXG4gICAgICAgICAgICB0aGlzLmVuZCAgID0gc3RhcnQgKyB0aGlzLnRleHQubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBsZXQgcG9zID0gc3RhcnQ7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBwaHJhc2Ugb2YgdGhpcy5waHJhc2VzKXtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBwaHJhc2UgPT0gXCJzdHJpbmdcIil7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBvcyArPSBwaHJhc2UubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGhyYXNlLnNldFN0YXJ0RW5kKHBvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zID0gcGhyYXNlLmVuZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRBbGxUZXh0cyh0ZXh0czogc3RyaW5nW10pe1xyXG4gICAgICAgIGlmKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09IDApe1xyXG4gICAgICAgICAgICB0ZXh0cy5wdXNoKHRoaXMudGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBwaHJhc2Ugb2YgdGhpcy5waHJhc2VzKXtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBwaHJhc2UgPT0gXCJzdHJpbmdcIil7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRleHRzLnB1c2gocGhyYXNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBocmFzZS5nZXRBbGxUZXh0cyh0ZXh0cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJlcGFyZVJlYWRpbmcoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgdGhpcy5zZXRQaHJhc2VzKCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdGFydEVuZCgwKTtcclxuXHJcbiAgICAgICAgY29uc3QgdGV4dHMgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIHRoaXMuZ2V0QWxsVGV4dHModGV4dHMpO1xyXG5cclxuICAgICAgICBjb25zdCBhbGxfdGV4dCA9IHRleHRzLmpvaW4oXCJcIik7XHJcblxyXG4gICAgICAgIHJldHVybiBhbGxfdGV4dDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBbGxSZWFkaW5nc1N1YihyZWFkaW5nczogUmVhZGluZ1tdKXtcclxuICAgICAgICByZWFkaW5ncy5wdXNoKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCh4ID0+IHguZ2V0QWxsUmVhZGluZ3NTdWIocmVhZGluZ3MpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBbGxSZWFkaW5ncygpIDogUmVhZGluZ1tdIHtcclxuICAgICAgICBjb25zdCByZWFkaW5nczogUmVhZGluZ1tdID0gW107XHJcbiAgICAgICAgdGhpcy5nZXRBbGxSZWFkaW5nc1N1YihyZWFkaW5ncyk7XHJcblxyXG4gICAgICAgIHJldHVybiByZWFkaW5ncztcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uTWFwKGxhbmdfY29kZSA6IHN0cmluZykgOiBQcm9taXNlPFtNYXA8bnVtYmVyLCBzdHJpbmc+LCBNYXA8c3RyaW5nLCBudW1iZXI+XT4ge1xyXG4gICAgY29uc3QgdXJsID0gYCR7dXJsT3JpZ2lufS9saWIvaTE4bi90cmFuc2xhdGlvbi8ke2xhbmdfY29kZX0udHh0P3Zlcj0ke0RhdGUubm93KCl9YDtcclxuICAgIGxldCB0ZXh0cyA9IGF3YWl0IGZldGNoVGV4dCh1cmwpO1xyXG5cclxuICAgIC8vIGZvciBjaGluZXNlIHRleHQuXHJcbiAgICB0ZXh0cyA9IHRleHRzLnJlcGxhY2VBbGwoXCLvvJpcIiwgXCI6XCIpO1xyXG5cclxuICAgIGNvbnN0IGlkX3RvX3RleHQgPSBuZXcgTWFwPG51bWJlciwgc3RyaW5nPigpO1xyXG4gICAgY29uc3QgdGV4dF90b19pZCA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XHJcblxyXG4gICAgZm9yKGxldCBsaW5lIG9mIHRleHRzLnNwbGl0KFwiXFxuXCIpKXtcclxuICAgICAgICBsaW5lID0gbGluZS50cmltKCk7XHJcbiAgICAgICAgaWYobGluZSA9PSBcIlwiKXtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGszID0gbGluZS5pbmRleE9mKFwiOlwiKTtcclxuICAgICAgICBhc3NlcnQoazMgIT0gLTEpO1xyXG4gICAgICAgIGNvbnN0IGlkID0gcGFyc2VJbnQoIGxpbmUuc3Vic3RyaW5nKDAsIGszKSApO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBsaW5lLnN1YnN0cmluZyhrMyArIDEpO1xyXG4gICAgICAgIGlmKHRleHQgPT0gXCJcIil7XHJcbiAgICAgICAgICAgIG1zZyhgc2tpcDoke2xhbmdfY29kZX0gJHtpZH1gKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlkX3RvX3RleHQuc2V0KGlkLCB0ZXh0KTtcclxuXHJcbiAgICAgICAgY29uc3QgaWQyID0gdGV4dF90b19pZC5nZXQodGV4dCk7XHJcbiAgICAgICAgaWYoaWQyICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIG1zZyhgZHVwOiR7bGFuZ19jb2RlfSAke2lkMn0gJHtpZH0gJHt0ZXh0fWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0ZXh0X3RvX2lkLnNldCh0ZXh0LCBpZCk7XHJcbiAgICB9XHJcbiAgICBtc2coYGdldC1UcmFuc2xhdGlvbi1NYXA6JHtsYW5nX2NvZGV9ICR7aWRfdG9fdGV4dC5zaXplfSAke3RleHRfdG9faWQuc2l6ZX1gKTtcclxuXHJcbiAgICByZXR1cm4gW2lkX3RvX3RleHQsIHRleHRfdG9faWRdO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFRyYW5zbGF0aW9uTWFwKCkge1xyXG4gICAgY29uc3QgW2lkX3RvX3RleHQxLCB0ZXh0X3RvX2lkMV0gPSBhd2FpdCBnZXRUcmFuc2xhdGlvbk1hcChcImVuZ1wiKTtcclxuICAgIEVuZ1RleHRUb0lkID0gdGV4dF90b19pZDE7XHJcblxyXG4gICAgaWYodGV4dExhbmd1YWdlQ29kZSA9PSBcImVuZ1wiKXtcclxuICAgICAgICBUZXh0VG9JZCA9IHRleHRfdG9faWQxO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBbaWRfdG9fdGV4dDIsIHRleHRfdG9faWQyXSA9IGF3YWl0IGdldFRyYW5zbGF0aW9uTWFwKHRleHRMYW5ndWFnZUNvZGUpO1xyXG4gICAgVGV4dFRvSWQgPSB0ZXh0X3RvX2lkMjtcclxuXHJcbiAgICBmb3IoY29uc3QgW2lkLCB0ZXh0Ml0gb2YgaWRfdG9fdGV4dDIuZW50cmllcygpKXtcclxuICAgICAgICBjb25zdCB0ZXh0MSA9IGlkX3RvX3RleHQxLmdldChpZCk7XHJcbiAgICAgICAgaWYodGV4dDEgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdHJhbnNsYXRpb25NYXAuc2V0KHRleHQxLnRyaW0oKSwgdGV4dDIudHJpbSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgbXNnKGBubyB0cmFuc2xhdGlvbjoke2lkfSAke3RleHQyfWApO1xyXG4gICAgICAgIH1cclxuICAgIH0gICAgXHJcblxyXG4gICAgbWF4VHJhbnNsYXRpb25JZCA9IE1hdGgubWF4KC4uLiBBcnJheS5mcm9tKGlkX3RvX3RleHQxLmtleXMoKSkpO1xyXG4gICAgbXNnKGB0cmFuc2xhdGlvbi1NYXAgc2l6ZToke3RyYW5zbGF0aW9uTWFwLnNpemV9IG1heDoke21heFRyYW5zbGF0aW9uSWR9YCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNoZWNrQnJvd3Nlcigpe1xyXG4gICAgaWYoKG5hdmlnYXRvciBhcyBhbnkpLnVzZXJBZ2VudERhdGEgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICBjb25zdCBicmFuZHMgPSAobmF2aWdhdG9yIGFzIGFueSkudXNlckFnZW50RGF0YS5icmFuZHM7XHJcbiAgICAgICAgZm9yKGNvbnN0IGJyYW5kIG9mIGJyYW5kcyl7XHJcbiAgICAgICAgICAgIGlmKChicmFuZC5icmFuZCBhcyBzdHJpbmcpLmluY2x1ZGVzKFwiRWRnZVwiKSl7XHJcbiAgICAgICAgICAgICAgICBpc0VkZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgbXNnKFwiaXMgRWRnZSA6IHRydWVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbXNnKGB1c2VyQWdlbnREYXRhOlske2JyYW5kLmJyYW5kfV1gKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG1zZyhgdXNlckFnZW50Olske25hdmlnYXRvci51c2VyQWdlbnR9XWApO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdEkxOG4oKXtcclxuICAgIGNoZWNrQnJvd3NlcigpO1xyXG5cclxuICAgIGluaXRMZXR0ZXJzKCk7XHJcblxyXG4gICAgZm9yKGNvbnN0IFtuYW1lLCBjb2RlLCBxdW90ZXNdIG9mIGxhbmd1YWdlcyl7XHJcbiAgICAgICAgcXVvdGF0aW9uTWFya3Muc2V0KGNvZGUsIHF1b3Rlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgWyB1cmxPcmlnaW4sICwgdXJsUGFyYW1zXSA9IGkxOG5fdHMucGFyc2VVUkwoKTtcclxuXHJcbiAgICBpZih1cmxQYXJhbXMuZ2V0KFwibGVzc29uXCIpICE9IHVuZGVmaW5lZCl7XHJcblxyXG4gICAgICAgIGFwcE1vZGUgPSBBcHBNb2RlLmxlc3NvblBsYXk7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG5cclxuICAgICAgICBzd2l0Y2godXJsUGFyYW1zLmdldChcIm1vZGVcIikpe1xyXG4gICAgICAgIGNhc2UgXCJlZGl0XCI6XHJcbiAgICAgICAgICAgIGFwcE1vZGUgPSBBcHBNb2RlLmVkaXQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJsZXNzb25cIjpcclxuICAgICAgICAgICAgYXBwTW9kZSA9IEFwcE1vZGUubGVzc29uRWRpdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgYXBwTW9kZSA9IEFwcE1vZGUucGxheTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZihxdW90YXRpb25NYXJrcy5oYXModGV4dExhbmd1YWdlQ29kZSkpe1xyXG4gICAgICAgIG1zZyhgbGFuZyBjb2RlOiR7dGV4dExhbmd1YWdlQ29kZX1gKTtcclxuICAgICAgICBhd2FpdCBsb2FkVHJhbnNsYXRpb25NYXAoKTtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgbXNnKGBpbGxlZ2FsIGxhbmcgY29kZToke3RleHRMYW5ndWFnZUNvZGV9YCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBib2R5T25Mb2FkKCl7XHJcbiAgICBhd2FpdCBpbml0STE4bigpO1xyXG5cclxuICAgIGNvbnN0IHRleHRzID0gYXdhaXQgZ2V0QWxsVGV4dHMoKTtcclxuICAgIGNvbnN0IHRleHQgPSBBcnJheS5mcm9tKHRleHRzLmVudHJpZXMoKSkubWFwKHg9Pih4WzBdICsgXCI6XCIgKyB4WzFdKSkuam9pbihcIlxcblwiKTtcclxuICAgIG1zZyhgYWxsIHRleHRzOmApO1xyXG4gICAgbXNnKHRleHQpO1xyXG5cclxuICAgICRpbnAoXCJhbGwtdGV4dHNcIikudmFsdWUgPSB0ZXh0O1xyXG5cclxufVxyXG5cclxufSIsIm5hbWVzcGFjZSBpMThuX3Rze1xuXG5leHBvcnQgbGV0IHZvaWNlTGFuZ3VhZ2VDb2RlIDogc3RyaW5nID0gXCJlbmdcIjtcbmV4cG9ydCBsZXQgb25TcGVhayA6ICh0ZXh0IDogc3RyaW5nKSA9PiB2b2lkO1xuXG5sZXQgY2FuY2VsU3BlZWNoRmxhZyA6IGJvb2xlYW4gPSBmYWxzZTtcblxuY29uc3Qgdm9pY2VNYXAgPSBuZXcgTWFwPHN0cmluZywgU3BlZWNoU3ludGhlc2lzVm9pY2VbXT4oKTtcblxuZXhwb3J0IGNvbnN0IGxhbmdDb2RlTGlzdCA6IFtzdHJpbmcsIHN0cmluZ11bXSA9IFtcbiAgICBbXCJhcmFcIiwgXCJhci1FR1wiXSxcbiAgICBbXCJjaGlcIiwgXCJ6aC1DTlwiXSxcbiAgICBbXCJlbmdcIiwgXCJlbi1VU1wiXSxcbiAgICBbXCJmcmVcIiwgXCJmci1GUlwiXSxcbiAgICBbXCJnZXJcIiwgXCJkZS1ERVwiXSxcbiAgICBbXCJoaW5cIiwgXCJoaS1JTlwiXSxcbiAgICBbXCJpbmRcIiwgXCJpZC1JRFwiXSxcbiAgICBbXCJqcG5cIiwgXCJqYS1KUFwiXSxcbiAgICBbXCJrb3JcIiwgXCJrby1LUlwiXSxcbiAgICBbXCJydXNcIiwgXCJydS1SVVwiXSxcbiAgICBbXCJzcGFcIiwgXCJlcy1FU1wiXSxcbiAgICBbXCJwb3JcIiwgXCJwdC1QVFwiXSxcbl07XG5cbmV4cG9ydCBjb25zdCBsYW5nQ29kZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KGxhbmdDb2RlTGlzdCk7XG5cbmNvbnN0IHZvaWNlTmFtZXNEaWMgOiB7IFtsYW5nOiBzdHJpbmddOiBzdHJpbmdbXSB9ID0ge1xuICAgIFwiamEtSlBcIiA6IFtcbiAgICAgICAgXCJNaWNyb3NvZnQgTmFuYW1pIE9ubGluZSAoTmF0dXJhbCkgLSBKYXBhbmVzZSAoSmFwYW4pXCIsXG4gICAgICAgIFwiR29vZ2xlIOaXpeacrOiqnlwiLFxuICAgICAgICBcIk1pY3Jvc29mdCBBeXVtaSAtIEphcGFuZXNlIChKYXBhbilcIlxuICAgIF1cbiAgICAsXG4gICAgXCJlbi1VU1wiIDogW1xuICAgICAgICBcIk1pY3Jvc29mdCBBdmEgT25saW5lIChOYXR1cmFsKSAtIEVuZ2xpc2ggKFVuaXRlZCBTdGF0ZXMpXCIsXG4gICAgICAgIFwiR29vZ2xlIFVTIEVuZ2xpc2hcIixcbiAgICAgICAgXCJNaWNyb3NvZnQgWmlyYSAtIEVuZ2xpc2ggKFVuaXRlZCBTdGF0ZXMpXCJcbiAgICBdXG59O1xuXG5sZXQgbGFuZ3VhZ2VSZWdpb24gOiBzdHJpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRWb2ljZUxhbmd1YWdlQ29kZShjb2RlIDogc3RyaW5nKXtcbiAgICB2b2ljZUxhbmd1YWdlQ29kZSA9IGNvZGU7XG59XG5cbmZ1bmN0aW9uIGdldFZvaWNlQnlMYW5nQ29kZShsYW5nX2NvZGUgOiBzdHJpbmcpIDogU3BlZWNoU3ludGhlc2lzVm9pY2UgfCB1bmRlZmluZWQge1xuICAgIGxhbmd1YWdlUmVnaW9uID0gbGFuZ0NvZGVNYXAuZ2V0KGxhbmdfY29kZSkhO1xuICAgIGlmKGxhbmd1YWdlUmVnaW9uID09IHVuZGVmaW5lZCl7XG4gICAgICAgIHRocm93IG5ldyBNeUVycm9yKGB1bmtub3duIGxhbmcgY29kZToke2xhbmdfY29kZX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCB2b2ljZXMgPSB2b2ljZU1hcC5nZXQobGFuZ3VhZ2VSZWdpb24pO1xuICAgIGlmKHZvaWNlcyA9PSB1bmRlZmluZWQpe1xuICAgICAgICBtc2coYG5vIHZvaWNlIGZvciAke2xhbmd1YWdlUmVnaW9ufWApO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRfbmFtZXMgPSB2b2ljZU5hbWVzRGljW2xhbmd1YWdlUmVnaW9uXTtcbiAgICBpZihkZWZhdWx0X25hbWVzICE9IHVuZGVmaW5lZCl7XG4gICAgICAgIGZvcihjb25zdCBuYW1lIG9mIGRlZmF1bHRfbmFtZXMpe1xuICAgICAgICAgICAgY29uc3Qgdm9pY2UgPSB2b2ljZXMuZmluZCh4ID0+IHgubmFtZSA9PSBuYW1lKTtcbiAgICAgICAgICAgIGlmKHZvaWNlICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZvaWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbmF0dXJhbF92b2ljZSA9IHZvaWNlcy5maW5kKHggPT4geC5uYW1lLmluZGV4T2YoXCJPbmxpbmUgKE5hdHVyYWwpXCIpICE9IC0xKTtcbiAgICBpZihuYXR1cmFsX3ZvaWNlICE9IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybiBuYXR1cmFsX3ZvaWNlO1xuICAgIH1cblxuICAgIHJldHVybiB2b2ljZXNbMF07XG59XG5cbmV4cG9ydCBjbGFzcyBTcGVlY2ggZXh0ZW5kcyBpMThuX3RzLkFic3RyYWN0U3BlZWNoIHtcbiAgICBzdGF0aWMgbWF4SWQgPSAwO1xuXG4gICAgaWQgICAgIDogbnVtYmVyO1xuICAgIHZvaWNlPyA6IFNwZWVjaFN5bnRoZXNpc1ZvaWNlO1xuICAgIHRleHQhICAgOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcigpeyBcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgXG4gICAgICAgIGkxOG5fdHMuQWJzdHJhY3RTcGVlY2gub25lID0gdGhpcztcbiAgICAgICAgdGhpcy5pZCA9IFNwZWVjaC5tYXhJZCsrO1xuXG4gICAgICAgIHRoaXMuaW5pdFZvaWNlKCk7XG4gICAgfVxuXG4gICAgaW5pdFZvaWNlKCl7XG4gICAgICAgIGlmKHZvaWNlTWFwLnNpemUgPT0gMCl7XG4gICAgICAgICAgICBzZXRWb2ljZUxpc3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMudm9pY2UgPT0gdW5kZWZpbmVkKXtcblxuICAgICAgICAgICAgdGhpcy52b2ljZSA9IGdldFZvaWNlQnlMYW5nQ29kZSh2b2ljZUxhbmd1YWdlQ29kZSk7XG4gICAgICAgICAgICBpZih0aGlzLnZvaWNlICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgLy8gbXNnKGB1c2Ugdm9pY2U6JHt0aGlzLnZvaWNlLm5hbWV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbXVsYXRlKHNwZWVjaF9pZCA6IG51bWJlciB8IHVuZGVmaW5lZCl7XG4gICAgICAgIGxldCBjaGFySW5kZXggPSAwO1xuXG4gICAgICAgIGNvbnN0IGlkID0gc2V0SW50ZXJ2YWwoKCk9PntcbiAgICAgICAgICAgIGlmKHZvaWNlTGFuZ3VhZ2VDb2RlID09IFwianBuXCIpe1xuICAgICAgICAgICAgICAgIGNoYXJJbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICAgIGNoYXJJbmRleCA9IHRoaXMudGV4dC5pbmRleE9mKFwiIFwiLCBjaGFySW5kZXgpO1xuICAgICAgICAgICAgICAgIGlmKGNoYXJJbmRleCA9PSAtMSl7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJJbmRleCA9IHRoaXMudGV4dC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJJbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZXYgOiBhbnkgPSB7XG4gICAgICAgICAgICAgICAgY2hhckluZGV4IDogY2hhckluZGV4LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5vbkJvdW5kYXJ5KGV2IGFzIFNwZWVjaFN5bnRoZXNpc0V2ZW50KTtcblxuICAgICAgICAgICAgaWYodGhpcy50ZXh0Lmxlbmd0aCA8PSBjaGFySW5kZXgpe1xuICAgICAgICAgICAgICAgIHRoaXMub25FbmQoZXYgYXMgU3BlZWNoU3ludGhlc2lzRXZlbnQpO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxKTtcbiAgICB9XG5cbiAgICBhc3luYyBzcGVhayh0ZXh0IDogc3RyaW5nKSA6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjYW5jZWxTcGVlY2hGbGFnID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dC50cmltKCk7XG4gICAgICAgIGlmKHRoaXMudGV4dCA9PSBcIlwiKXtcblxuICAgICAgICAgICAgdGhpcy5zcGVha2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zcGVha2luZyA9IHRydWU7XG5cbiAgICAgICAgaWYob25TcGVhayAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgb25TcGVhayh0aGlzLnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3BlZWNoX2lkID0gaTE4bl90cy5nZXRJZEZyb21UZXh0KHRoaXMudGV4dCk7XG5cbiAgICAgICAgaWYoZ2V0UGxheU1vZGUoKSA9PSBQbGF5TW9kZS5mYXN0Rm9yd2FyZCl7XG5cbiAgICAgICAgICAgIHRoaXMuZW11bGF0ZShzcGVlY2hfaWQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbi8qICAgICAgICBcbiAgICAgICAgaWYoc3BlZWNoX2lkICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBjb25zdCBvayA9IGF3YWl0IHBsYXlBdWRpbyh0aGlzLCBzcGVlY2hfaWQpO1xuICAgICAgICAgICAgaWYob2spe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuKi9cblxuICAgICAgICB0aGlzLmluaXRWb2ljZSgpO1xuICAgICAgICBtc2coYFNwZWFrICR7dGhpcy5pZH1bJHt0aGlzLnRleHR9XSAke3RoaXMudm9pY2UgIT0gdW5kZWZpbmVkID8gdGhpcy52b2ljZS5uYW1lIDogXCJubyB2b2ljZVwifWApO1xuXG4gICAgICAgIHRoaXMucHJldkNoYXJJbmRleCA9IDA7XG4gICAgXG4gICAgICAgIGNvbnN0IHV0dHIgPSBuZXcgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlKHRoaXMudGV4dC5yZXBsYWNlQWxsKFwi4peLXCIsIFwi44Oe44OrXCIpLnJlcGxhY2VBbGwoXCLDl1wiLCBcIuODkOODhFwiKSk7XG5cbiAgICAgICAgdXR0ci5hZGRFdmVudExpc3RlbmVyKFwiZW5kXCIsIHRoaXMub25FbmQuYmluZCh0aGlzKSk7XG4gICAgICAgIHV0dHIuYWRkRXZlbnRMaXN0ZW5lcihcImJvdW5kYXJ5XCIsIHRoaXMub25Cb3VuZGFyeS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdXR0ci5hZGRFdmVudExpc3RlbmVyKFwibWFya1wiLCB0aGlzLm9uTWFyay5iaW5kKHRoaXMpKTtcbiAgICBcbiAgICAgICAgLy91dHRyLnJhdGUgPSA1LjA7Ly8gcGFyc2VGbG9hdChzcGVlY2hSYXRlLnZhbHVlKTtcblxuICAgICAgICBpZih0aGlzLnZvaWNlICE9IHVuZGVmaW5lZCl7XG5cbiAgICAgICAgICAgIHV0dHIudm9pY2UgPSB0aGlzLnZvaWNlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3BlZWNoU3ludGhlc2lzLnNwZWFrKHV0dHIpO1xuICAgIH1cblxuICAgIG9uQm91bmRhcnkoZXY6IFNwZWVjaFN5bnRoZXNpc0V2ZW50KSA6IHZvaWQge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy50ZXh0LnN1YnN0cmluZyh0aGlzLnByZXZDaGFySW5kZXgsIGV2LmNoYXJJbmRleCkudHJpbSgpO1xuICAgICAgICBpZihldi5jaGFySW5kZXggPT0gMCl7XG5cbiAgICAgICAgICAgIG1zZyhgU3BlZWNoIHN0YXJ0IHRleHQ6WyR7dGhpcy50ZXh0fV1gKVxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgXG4gICAgICAgICAgICAvLyBtc2coYFNwZWVjaCBiZHI6IGlkeDoke2V2LmNoYXJJbmRleH0gbmFtZToke2V2Lm5hbWV9IHR5cGU6JHtldi50eXBlfSB0ZXh0Olske3RleHR9XWApO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMuY2FsbGJhY2sgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soZXYuY2hhckluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJldkNoYXJJbmRleCA9IGV2LmNoYXJJbmRleDtcbiAgICB9XG5cbiAgICBvbkVuZChldjogU3BlZWNoU3ludGhlc2lzRXZlbnQpIDogdm9pZCB7XG4gICAgICAgIC8vIG1zZyhgU3BlZWNoIGVuZDogaWQ6JHt0aGlzLmlkfSBpZHg6JHtldi5jaGFySW5kZXh9IG5hbWU6JHtldi5uYW1lfSB0eXBlOiR7ZXYudHlwZX0gdGV4dDpbJHt0aGlzLnRleHQuc3Vic3RyaW5nKHRoaXMucHJldkNoYXJJbmRleCl9XWApO1xuICAgICAgICBpZih0aGlzLmNhbGxiYWNrICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMudGV4dC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3BlYWtpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgb25NYXJrKGV2OiBTcGVlY2hTeW50aGVzaXNFdmVudCkgOiB2b2lkIHtcbiAgICB9XG5cbiAgICBhc3luYyB3YWl0RW5kTkVXKCl7XG4gICAgICAgIGZvcihjb25zdCBpIG9mIHJhbmdlKDEwMCkpe1xuICAgICAgICAgICAgaWYoY2FuY2VsU3BlZWNoRmxhZyB8fCAhIHRoaXMuc3BlYWtpbmcpe1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgc2xlZXAoMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbXNnKGB3YWl0IGVuZDoke3RoaXMuaWR9YCk7XG4gICAgfVxuXG4gICAgd2FpdEVuZCgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKT0+e1xuICAgICAgICAgICAgICAgIGlmKGNhbmNlbFNwZWVjaEZsYWcgfHwgISB0aGlzLnNwZWFraW5nKXtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1zZyhgd2FpdCBlbmQ6JHt0aGlzLmlkfWApO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBzcGVha193YWl0RW5kKHRleHQgOiBzdHJpbmcpe1xuICAgICAgICBhd2FpdCB0aGlzLnNwZWFrKHRleHQpO1xuICAgICAgICBhd2FpdCB0aGlzLndhaXRFbmQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9udW5jaWF0aW9uKHdvcmQ6IHN0cmluZykgOiBzdHJpbmdbXXtcbiAgICBpZih3b3JkWzBdID09ICdcXFxcJyl7XG4gICAgICAgIGNvbnN0IHRibCA6IHtba2V5OnN0cmluZ106c3RyaW5nW119ID0ge1xuICAgICAgICAgICAgXCJkaWZcIiA6IFtcImRpZmZcIl0sXG4gICAgICAgICAgICBcIkRlbHRhXCIgOiBbXCJkZWx0YVwiXSxcbiAgICAgICAgICAgIFwibGltXCIgOiBbXCJsaW1pdFwiXSxcbiAgICAgICAgICAgIFwiZnJhY1wiIDogW1wiZnJhY3Rpb25cIl0sXG4gICAgICAgICAgICBcInNxcnRcIiA6IFwic3F1YXJlIHJvb3RcIi5zcGxpdChcIiBcIiksXG4gICAgICAgICAgICBcIm5lXCIgOiBcIm5vdCBlcXVhbHNcIi5zcGxpdChcIiBcIiksXG4gICAgICAgICAgICBcImx0XCIgOiBcImlzIGxlc3MgdGhhblwiLnNwbGl0KFwiIFwiKSxcbiAgICAgICAgICAgIFwiZ3RcIiA6IFwiaXMgZ3JlYXRlciB0aGFuXCIuc3BsaXQoXCIgXCIpLFxuICAgICAgICAgICAgXCJsZVwiIDogXCJpcyBsZXNzIHRoYW4gb3IgZXF1YWxzXCIuc3BsaXQoXCIgXCIpLFxuICAgICAgICAgICAgXCJnZVwiIDogXCJpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWxzXCIuc3BsaXQoXCIgXCIpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSB3b3JkLnN1YnN0cmluZygxKTtcbiAgICAgICAgaWYobmFtZSBpbiB0Ymwpe1xuICAgICAgICAgICAgcmV0dXJuIHRibFtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgcmV0dXJuIFtuYW1lXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gW3dvcmRdO1xufVxuXG5cbmZ1bmN0aW9uIHNldFZvaWNlTGlzdCgpe1xuICAgIGNvbnN0IHZvaWNlcyA9IEFycmF5LmZyb20oc3BlZWNoU3ludGhlc2lzLmdldFZvaWNlcygpKTtcbiAgICBpZih2b2ljZXMubGVuZ3RoID09IDApe1xuICAgICAgICBtc2coXCJubyB2b2ljZVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvcihjb25zdCB2b2ljZSBvZiB2b2ljZXMpe1xuICAgICAgICAvLyBpZih2b2ljZS5sYW5nID09IGxhbmd1YWdlUmVnaW9uKXtcblxuICAgICAgICAgICAgLy8gbXNnKGB2b2ljZSBsYW5nOlske3ZvaWNlLmxhbmd9XSBuYW1lOlske3ZvaWNlLm5hbWV9XWApO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgbGV0IHZvaWNlX2xhbmcgPSB2b2ljZS5sYW5nLnJlcGxhY2VBbGwoXCJfXCIsIFwiLVwiKTtcbiAgICAgICAgY29uc3QgayA9IHZvaWNlX2xhbmcuaW5kZXhPZihcIi0jXCIpO1xuICAgICAgICBpZihrICE9IC0xKXtcbiAgICAgICAgICAgIHZvaWNlX2xhbmcgPSB2b2ljZV9sYW5nLnN1YnN0cmluZygwLCBrKTtcbiAgICAgICAgICAgIC8vIG1zZyhgbGFuZzoke3ZvaWNlLmxhbmd9ID0+ICR7dm9pY2VfbGFuZ31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHZvaWNlTWFwLmdldCh2b2ljZV9sYW5nKSA9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdm9pY2VNYXAuc2V0KHZvaWNlX2xhbmcsIFtdKTtcblxuICAgICAgICAgICAgaWYoQXJyYXkuZnJvbSggbGFuZ0NvZGVNYXAudmFsdWVzKCkgKS5pbmNsdWRlcyh2b2ljZV9sYW5nKSl7XG5cbiAgICAgICAgICAgICAgICAvLyBtc2coYHZvaWNlIGxhbmc6JHt2b2ljZV9sYW5nfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdm9pY2VNYXAuZ2V0KHZvaWNlX2xhbmcpIS5wdXNoKHZvaWNlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluaXRTcGVlY2hTdWIoKXtcblxuICAgIGlmICgnc3BlZWNoU3ludGhlc2lzJyBpbiB3aW5kb3cpIHtcbiAgICAgICAgbXNnKFwi44GT44Gu44OW44Op44Km44K244Gv6Z+z5aOw5ZCI5oiQ44Gr5a++5b+c44GX44Gm44GE44G+44GZ44CC8J+OiVwiKTtcblxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbXNnKFwi44GT44Gu44OW44Op44Km44K244Gv6Z+z5aOw5ZCI5oiQ44Gr5a++5b+c44GX44Gm44GE44G+44Gb44KT44CC8J+YrVwiKTtcbiAgICB9ICAgIFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdFNwZWVjaCgpe1xuICAgIGluaXRTcGVlY2hTdWIoKTtcblxuICAgIHNwZWVjaFN5bnRoZXNpcy5vbnZvaWNlc2NoYW5nZWQgPSBmdW5jdGlvbigpe1xuICAgICAgICBtc2coXCJ2b2ljZXMgY2hhbmdlZCAxXCIpO1xuICAgICAgICBzZXRWb2ljZUxpc3QoKTtcbiAgICB9O1xuXG4gICAgc3BlZWNoU3ludGhlc2lzLmFkZEV2ZW50TGlzdGVuZXIoXCJ2b2ljZXNjaGFuZ2VkXCIsIChldjpFdmVudCk9PntcbiAgICAgICAgc2V0Vm9pY2VMaXN0KCk7XG4gICAgICAgIG1zZyhcInZvaWNlcyBjaGFuZ2VkIDJcIik7XG4gICAgfSlcblxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXN5bmNJbml0U3BlZWNoKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpbml0U3BlZWNoU3ViKCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc3BlZWNoU3ludGhlc2lzLmFkZEV2ZW50TGlzdGVuZXIoXCJ2b2ljZXNjaGFuZ2VkXCIsIChldjpFdmVudCk9PntcbiAgICAgICAgICAgIHNldFZvaWNlTGlzdCgpO1xuICAgICAgICAgICAgbXNnKFwic3BlZWNoIGluaXRpYWxpemVkXCIpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KVxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsU3BlZWNoKCl7XG4gICAgY2FuY2VsU3BlZWNoRmxhZyA9IHRydWU7XG4gICAgc3BlZWNoU3ludGhlc2lzLmNhbmNlbCgpO1xufVxuXG4gICAgXG59IiwiXHJcbm5hbWVzcGFjZSBpMThuX3RzIHtcclxuLy9cclxuXHJcbmV4cG9ydCBlbnVtIFBsYXlNb2RlIHtcclxuICAgIHN0b3AsXHJcbiAgICBub3JtYWwsXHJcbiAgICBmYXN0Rm9yd2FyZCxcclxufVxyXG5cclxubGV0IHRoZVBsYXlNb2RlIDogUGxheU1vZGUgID0gUGxheU1vZGUuc3RvcDtcclxuXHJcbmNvbnN0ICRkaWMgPSBuZXcgTWFwPHN0cmluZywgSFRNTEVsZW1lbnQ+KCk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGxheU1vZGUocGxheV9tb2RlIDogUGxheU1vZGUpe1xyXG4gICAgdGhlUGxheU1vZGUgPSBwbGF5X21vZGU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQbGF5TW9kZSgpe1xyXG4gICAgcmV0dXJuIHRoZVBsYXlNb2RlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJChpZCA6IHN0cmluZykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgZWxlID0gJGRpYy5nZXQoaWQpO1xyXG4gICAgaWYoZWxlID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgZWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpITtcclxuICAgICAgICAkZGljLnNldChpZCwgZWxlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZWxlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGRpdihpZCA6IHN0cmluZykgOiBIVE1MRGl2RWxlbWVudCB7XHJcbiAgICByZXR1cm4gJChpZCkgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkaW5wKGlkIDogc3RyaW5nKSA6IEhUTUxJbnB1dEVsZW1lbnQge1xyXG4gICAgcmV0dXJuICQoaWQpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkc2VsKGlkIDogc3RyaW5nKSA6IEhUTUxTZWxlY3RFbGVtZW50IHtcclxuICAgIHJldHVybiAkKGlkKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcclxufVxyXG4gICAgICAgIFxyXG5leHBvcnQgY2xhc3MgTXlFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICAgIGNvbnN0cnVjdG9yKHRleHQgOiBzdHJpbmcgPSBcIlwiKXtcclxuICAgICAgICBzdXBlcih0ZXh0KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChiIDogYm9vbGVhbiwgbXNnIDogc3RyaW5nID0gXCJcIil7XHJcbiAgICBpZighYil7XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IobXNnKTtcclxuICAgIH1cclxufSAgICBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVjayhiIDogYm9vbGVhbiwgbXNnIDogc3RyaW5nID0gXCJcIil7XHJcbiAgICBpZighYil7XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IobXNnKTtcclxuICAgIH1cclxufSAgICBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtc2codHh0IDogc3RyaW5nKXtcclxuICAgIGNvbnNvbGUubG9nKHR4dCk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzbGVlcChtaWxsaXNlY29uZHMgOiBudW1iZXIsIGZhc3Rfc2xlZXAgOiBudW1iZXIgPSAxKSA6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYodGhlUGxheU1vZGUgPT0gUGxheU1vZGUuZmFzdEZvcndhcmQpe1xyXG4gICAgICAgIGFzc2VydChmYXN0X3NsZWVwID09IDEpO1xyXG4gICAgICAgIG1pbGxpc2Vjb25kcyA9IGZhc3Rfc2xlZXA7XHJcbiAgICB9XHJcbiAgICBpZigxIDwgbWlsbGlzZWNvbmRzKXtcclxuICAgICAgICAvLyBtc2coYHNsZWVwOlske21pbGxpc2Vjb25kc31dYCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSwgbWlsbGlzZWNvbmRzKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmFuZ2UobjogbnVtYmVyKSA6IG51bWJlcltde1xyXG4gICAgcmV0dXJuIFsuLi5BcnJheShuKS5rZXlzKCldO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmFuZ2UyKHN0YXJ0OiBudW1iZXIsIGVuZCA6IG51bWJlcikgOiBudW1iZXJbXXtcclxuICAgIHJldHVybiByYW5nZShlbmQgLSBzdGFydCkubWFwKHggPT4gc3RhcnQgKyB4KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxhc3Q8VD4odiA6IEFycmF5PFQ+KSA6IFQge1xyXG4gICAgcmV0dXJuIHZbdi5sZW5ndGggLSAxXTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhcnJheUZpbGw8VD4oc2l6ZSA6IG51bWJlciwgdmFsdWUgOiBUKSA6IFRbXSB7XHJcbiAgICByZXR1cm4gbmV3IEFycmF5PFQ+KHNpemUpLmZpbGwodmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdW5pcXVlPFQ+KHYgOiBBcnJheTxUPikgOiBUW10ge1xyXG4gICAgbGV0IHNldCA9IG5ldyBTZXQ8VD4oKTtcclxuICAgIGNvbnN0IHJldCA6IFRbXSA9IFtdO1xyXG4gICAgZm9yKGNvbnN0IHggb2Ygdil7XHJcbiAgICAgICAgaWYoIXNldC5oYXMoeCkpe1xyXG4gICAgICAgICAgICBzZXQuYWRkKHgpO1xyXG4gICAgICAgICAgICByZXQucHVzaCh4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlPFQ+KHYgOiBBcnJheTxUPiwgeCA6IFQsIGV4aXN0ZW5jZV9jaGVjayA6IGJvb2xlYW4gPSB0cnVlKXtcclxuICAgIGNvbnN0IGlkeCA9IHYuaW5kZXhPZih4KTtcclxuICAgIGlmKGlkeCA9PSAtMSl7XHJcbiAgICAgICAgaWYoZXhpc3RlbmNlX2NoZWNrKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIHYuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmQ8VD4odiA6IEFycmF5PFQ+LCB4IDogVCl7XHJcbiAgICBpZighIHYuaW5jbHVkZXMoeCkpe1xyXG4gICAgICAgIHYucHVzaCh4KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN1bSh2IDogbnVtYmVyW10pIDogbnVtYmVyIHtcclxuICAgIHJldHVybiB2LnJlZHVjZSgoYWNjLCBjdXIpID0+IGFjYyArIGN1ciwgMCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsaXN0PFQ+KHNldCA6IFNldDxUPiB8IHVuZGVmaW5lZCkgOiBUW10ge1xyXG4gICAgaWYoc2V0ID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuXHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oc2V0KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGludGVyc2VjdGlvbjxUPihzZXQxIDogU2V0PFQ+IHwgdW5kZWZpbmVkLCBzZXQyIDogU2V0PFQ+IHwgdW5kZWZpbmVkKSA6IFRbXSB7XHJcbiAgICBpZihzZXQxID09IHVuZGVmaW5lZCB8fCBzZXQyID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBBcnJheS5mcm9tKHNldDEudmFsdWVzKCkpLmZpbHRlcih4ID0+IHNldDIuaGFzKHgpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBlcm11dGF0aW9uPFQ+KHYgOiBUW10pIDogVFtdW10ge1xyXG4gICAgaWYodi5sZW5ndGggPT0gMil7XHJcbiAgICAgICAgcmV0dXJuIFsgW3ZbMF0sIHZbMV1dLCBbdlsxXSwgdlswXV0gXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2diA6IFRbXVtdID0gW107XHJcbiAgICBmb3IoY29uc3QgaSBvZiByYW5nZSh2Lmxlbmd0aCkpe1xyXG4gICAgICAgIGNvbnN0IHYxID0gdi5zbGljZSgpO1xyXG4gICAgICAgIGNvbnN0IGMgPSB2MVtpXTtcclxuICAgICAgICB2MS5zcGxpY2UoaSwgIDEpO1xyXG5cclxuICAgICAgICBjb25zdCB2djEgPSBwZXJtdXRhdGlvbih2MSk7XHJcbiAgICAgICAgZm9yKGNvbnN0IHYyIG9mIHZ2MSl7XHJcblxyXG4gICAgICAgICAgICB2Mi51bnNoaWZ0KGMpO1xyXG4gICAgICAgICAgICB2di5wdXNoKHYyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHZ2O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2lyY3VsYXJQZXJtdXRhdGlvbjxUPih2IDogVFtdKSA6IFRbXVtdIHtcclxuICAgIGNvbnN0IHZ2ID0gcGVybXV0YXRpb24odi5zbGljZSgxKSk7XHJcbiAgICB2di5mb3JFYWNoKHggPT4geC51bnNoaWZ0KHZbMF0pKTtcclxuXHJcbiAgICByZXR1cm4gdnY7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhcmVTZXRzRXF1YWw8VD4oQTogVFtdLCBCOiBUW10pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHNldEEgPSBuZXcgU2V0PFQ+KEEpO1xyXG4gICAgY29uc3Qgc2V0QiA9IG5ldyBTZXQ8VD4oQik7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgc2l6ZXMgYXJlIGRpZmZlcmVudFxyXG4gICAgaWYgKHNldEEuc2l6ZSAhPT0gc2V0Qi5zaXplKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGlmIGFsbCBlbGVtZW50cyBvZiBzZXRBIGFyZSBwcmVzZW50IGluIHNldEJcclxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZXRBKSB7XHJcbiAgICAgICAgaWYgKCFzZXRCLmhhcyhlbGVtZW50KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNTdWJTZXQ8VD4oQTogVFtdLCBCOiBUW10pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHNldEIgPSBuZXcgU2V0PFQ+KEIpO1xyXG5cclxuICAgIHJldHVybiBBLmV2ZXJ5KHggPT4gc2V0Qi5oYXMoeCkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyTGV0dGVyKGMgOiBzdHJpbmcpIDogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gbGF0aW5MZXR0ZXJzLmluZGV4T2YoYykgIT0gLTEgfHwgYyA9PSBcIl9cIjtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoVGV4dChmaWxlVVJMOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZmlsZVVSTCk7XHJcbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcG9uc2UhLnRleHQoKTtcclxuXHJcbiAgICByZXR1cm4gdGV4dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVVJMKCk6IFtzdHJpbmcsIHN0cmluZywgTWFwPHN0cmluZywgc3RyaW5nPl0ge1xyXG4gICAgY29uc3QgdXJsID0gZG9jdW1lbnQubG9jYXRpb24uaHJlZjtcclxuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBVUkwodXJsKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKGBocmVmOiR7dXJsfSBvcmlnaW46JHtwYXJzZXIub3JpZ2lufSBwYXRobmFtZToke3BhcnNlci5wYXRobmFtZX0gc2VhcmNoOiR7cGFyc2VyLnNlYXJjaH1gKVxyXG4gICAgYXNzZXJ0KHBhcnNlci5vcmlnaW4gKyBwYXJzZXIucGF0aG5hbWUgKyBwYXJzZXIuc2VhcmNoID09IHVybCk7XHJcblxyXG4gICAgY29uc3QgcXVlcnlTdHJpbmcgPSBwYXJzZXIuc2VhcmNoLnN1YnN0cmluZygxKTtcclxuICAgIGNvbnN0IHF1ZXJpZXMgPSBxdWVyeVN0cmluZy5zcGxpdChcIiZcIik7XHJcblxyXG4gICAgY29uc3QgcGFyYW1zID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcclxuICAgIHF1ZXJpZXMuZm9yRWFjaChxdWVyeSA9PiB7XHJcbiAgICAgICAgY29uc3QgW2tleSwgdmFsdWVdID0gcXVlcnkuc3BsaXQoXCI9XCIpO1xyXG4gICAgICAgIHBhcmFtcy5zZXQoZGVjb2RlVVJJQ29tcG9uZW50KGtleSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHJldHVybiBbIHBhcnNlci5vcmlnaW4sIHBhcnNlci5wYXRobmFtZSwgcGFyYW1zXTtcclxufVxyXG5cclxufVxyXG4iXX0=