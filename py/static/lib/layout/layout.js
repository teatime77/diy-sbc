"use strict";
var layout_ts;
(function (layout_ts) {
    //
    layout_ts.remove = i18n_ts.remove;
    class Vec2 {
        x;
        y;
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }
    layout_ts.Vec2 = Vec2;
    const $dic = new Map();
    function $(id) {
        let ele = $dic.get(id);
        if (ele == undefined) {
            ele = document.getElementById(id);
            $dic.set(id, ele);
        }
        return ele;
    }
    layout_ts.$ = $;
    function $div(id) {
        return $(id);
    }
    layout_ts.$div = $div;
    function $inp(id) {
        return $(id);
    }
    layout_ts.$inp = $inp;
    function $sel(id) {
        return $(id);
    }
    layout_ts.$sel = $sel;
    class MyError extends Error {
        constructor(text = "") {
            super(text);
        }
    }
    layout_ts.MyError = MyError;
    function assert(b, msg = "") {
        if (!b) {
            throw new MyError(msg);
        }
    }
    layout_ts.assert = assert;
    function msg(txt) {
        layout_ts.Log.log(txt);
    }
    layout_ts.msg = msg;
    function range(n) {
        return [...Array(n).keys()];
    }
    layout_ts.range = range;
    function last(v) {
        return v[v.length - 1];
    }
    layout_ts.last = last;
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
    layout_ts.unique = unique;
    function sum(v) {
        assert(v != undefined);
        if (v.length == 0) {
            return 0;
        }
        return v.reduce((acc, cur) => acc + cur, 0);
    }
    layout_ts.sum = sum;
    async function fetchText(fileURL) {
        const response = await fetch(fileURL);
        const text = await response.text();
        return text;
    }
    layout_ts.fetchText = fetchText;
    function pseudoColor(n) {
        n = Math.max(0, Math.min(1, n));
        let r, g, b;
        if (n < 0.25) {
            b = 1;
            g = n * 4;
            r = 0;
        }
        else if (n < 0.5) {
            b = (0.5 - n) * 4;
            g = 1;
            r = 0;
        }
        else if (n < 0.75) {
            b = 0;
            g = 1;
            r = (n - 0.5) * 4;
        }
        else {
            b = 0;
            g = (1 - n) * 4;
            r = 1;
        }
        return [r, g, b];
    }
    layout_ts.pseudoColor = pseudoColor;
    function toRadian(degree) {
        return degree * Math.PI / 180;
    }
    layout_ts.toRadian = toRadian;
    function toDegree(radian) {
        return radian * 180 / Math.PI;
    }
    layout_ts.toDegree = toDegree;
    function inRange(start, theta, end) {
        const f = (x) => { return 0 <= x ? x : 180 + x; };
        [start, theta, end] = [f(start), f(theta), f(end)];
        [theta, end] = [theta - start, end - start];
        const g = (x) => { return 0 <= x ? x : 360 + x; };
        [theta, end] = [g(theta), g(end)];
        assert(0 <= theta && 0 <= end);
        return theta <= end;
    }
    layout_ts.inRange = inRange;
    function linear(src_min, src_val, src_max, dst_min, dst_max) {
        const ratio = (src_val - src_min) / (src_max - src_min);
        const dst_val = dst_min + ratio * (dst_max - dst_min);
        return dst_val;
    }
    layout_ts.linear = linear;
    function getPhysicalSize() {
        const width = window.screen.width; // screen width in pixels
        const height = window.screen.height; // screen height in pixels
        const dpi = window.devicePixelRatio * 96; // approximate DPI
        const width_cm = (width / dpi) * 2.54;
        const height_cm = (height / dpi) * 2.54;
        return { width_cm, height_cm };
    }
    layout_ts.getPhysicalSize = getPhysicalSize;
    function setImgFile(img, file) {
        const reader = new FileReader();
        reader.addEventListener("load", (ev) => {
            if (ev.target != null) {
                if (typeof ev.target.result == "string") {
                    img.src = ev.target.result;
                }
                else {
                    throw new MyError(`load img error: ${file.name} result:${typeof ev.target.result}`);
                }
            }
            else {
                throw new MyError(`load img error: ${file.name}`);
            }
        });
        reader.readAsDataURL(file);
    }
    layout_ts.setImgFile = setImgFile;
})(layout_ts || (layout_ts = {}));
var layout_ts;
(function (layout_ts) {
    layout_ts.fgColor = "white";
    layout_ts.bgColor = "#003000";
    const AppMode = i18n_ts.AppMode;
    const TextSizeFill = 8;
    const inputPadding = 4;
    async function bodyOnLoad() {
        await i18n_ts.initI18n();
        const root = layout_ts.makeTestUI();
        Layout.initLayout(root);
    }
    layout_ts.bodyOnLoad = bodyOnLoad;
    function ratio(width) {
        width = width.trim();
        layout_ts.assert(width.endsWith("%"));
        const num_str = width.substring(0, width.length - 1);
        const num = parseFloat(num_str);
        return num / 100;
    }
    function pixel(length, remaining_length) {
        if (length != undefined) {
            if (length.endsWith("px")) {
                const num_str = length.substring(0, length.length - 2);
                return parseFloat(num_str);
            }
            else if (length.endsWith("%")) {
                if (remaining_length != undefined) {
                    return ratio(length) * remaining_length;
                }
            }
        }
        throw new layout_ts.MyError();
    }
    let Orientation;
    (function (Orientation) {
        Orientation[Orientation["horizontal"] = 0] = "horizontal";
        Orientation[Orientation["vertical"] = 1] = "vertical";
    })(Orientation || (Orientation = {}));
    class UI {
        static count = 0;
        idx;
        id;
        className;
        parent;
        obj;
        name;
        position;
        margin;
        color;
        backgroundColor;
        borderStyle;
        borderWidth;
        padding;
        paddingLeft;
        verticalAlign;
        horizontalAlign;
        textAlign;
        fontSize;
        width;
        height;
        visibility;
        colspan = 1;
        minSize;
        widthPix = NaN;
        heightPix = NaN;
        constructor(data) {
            Object.assign(this, data);
            this.idx = ++UI.count;
        }
        setStyle() {
            const ele = this.html();
            if (this.id != undefined) {
                ele.id = this.id;
            }
            if (this.className != undefined) {
                ele.className = this.className;
            }
            if (this.position != undefined) {
                ele.style.position = this.position;
            }
            else if (!(ele instanceof Dialog)) {
                ele.style.position = "absolute";
            }
            if (this.margin != undefined) {
                ele.style.margin = this.margin;
            }
            if (this.borderWidth != undefined) {
                ele.style.borderWidth = `${this.borderWidth}`;
            }
            if (this.borderStyle != undefined) {
                ele.style.borderStyle = this.borderStyle;
            }
            if (this.padding == undefined && (this instanceof InputText || this instanceof InputNumberRange)) {
                this.padding = inputPadding;
            }
            if (this.textAlign != undefined) {
                ele.style.textAlign = this.textAlign;
            }
            if (this.fontSize != undefined) {
                ele.style.fontSize = this.fontSize;
            }
            if (this.color != undefined) {
                ele.style.color = this.color;
            }
            if (this.backgroundColor != undefined) {
                ele.style.backgroundColor = this.backgroundColor;
            }
            else {
                ele.style.backgroundColor = layout_ts.bgColor;
            }
            if (this.width != undefined) {
                ele.style.width = this.width;
            }
            if (this.height != undefined) {
                ele.style.height = this.height;
            }
            if (this.visibility != undefined) {
                ele.style.visibility = this.visibility;
            }
            return this;
        }
        borderWidthPadding() {
            let n = 0;
            if (this.borderWidth != undefined) {
                n += 2 * this.borderWidth;
            }
            if (this.padding != undefined) {
                n += 2 * this.padding;
            }
            return n;
        }
        getMinSize() {
            if (this.minSize != undefined) {
                return this.minSize;
            }
            let width;
            let height;
            if (this.width != undefined && this.width.endsWith("px")) {
                width = pixel(this.width) + this.borderWidthPadding();
            }
            if (this.height != undefined && this.height.endsWith("px")) {
                height = pixel(this.height) + this.borderWidthPadding();
            }
            if (width == undefined || height == undefined) {
                let size;
                if (this instanceof AbstractText && !(this instanceof LaTeXBox)) {
                    size = this.getTextSize();
                }
                else {
                    const rect = this.html().getBoundingClientRect();
                    size = new layout_ts.Vec2(rect.width, rect.height);
                }
                if (width == undefined) {
                    width = size.x;
                }
                if (height == undefined) {
                    height = size.y;
                }
            }
            this.minSize = new layout_ts.Vec2(width, height);
            return this.minSize;
        }
        getMinWidth() {
            return this.getMinSize().x;
        }
        getMinHeight() {
            return this.getMinSize().y;
        }
        getWidth() {
            if (this.width != undefined) {
                if (this.width.endsWith("px")) {
                    return pixel(this.width);
                }
            }
            const rect = this.html().getBoundingClientRect();
            return rect.width;
        }
        getHeight() {
            if (this.height != undefined) {
                if (this.height.endsWith("px")) {
                    return pixel(this.height);
                }
            }
            const rect = this.html().getBoundingClientRect();
            return rect.height;
        }
        setXY(x, y) {
            const html = this.html();
            if (this.position != "static") {
                html.style.left = `${x}px`;
                html.style.top = `${y}px`;
            }
        }
        setSize(size) {
            if (size == undefined) {
                throw new layout_ts.MyError();
            }
            const html = this.html();
            const borderWidthPadding = this.borderWidthPadding();
            if (this.minSize == undefined) {
                throw new layout_ts.MyError();
            }
            if (this.width != undefined) {
                this.widthPix = this.minSize.x;
            }
            else {
                this.widthPix = size.x - borderWidthPadding;
            }
            if (this.height != undefined) {
                this.heightPix = this.minSize.y;
            }
            else {
                this.heightPix = size.y - borderWidthPadding;
            }
            html.style.width = `${this.widthPix}px`;
            html.style.height = `${this.heightPix}px`;
        }
        selectUI(selected) {
        }
        layout(x, y, size, nest) {
            if (i18n_ts.appMode == AppMode.lessonPlay) {
                layout_ts.msg(`${" ".repeat(4 * nest)} id:${this.constructor.name} x:${x.toFixed()} y:${y.toFixed()} position:${this.position} ${this.html().style.position}`);
            }
            this.setSize(size);
            if (this.horizontalAlign == "center") {
                x += 0.5 * (size.x - this.widthPix);
            }
            this.setXY(x, y);
        }
        ratio() {
            if (this.width == undefined || !this.width.endsWith("%")) {
                throw new layout_ts.MyError();
            }
            const s = this.width.substring(0, this.width.length - 1);
            return parseFloat(s);
        }
    }
    layout_ts.UI = UI;
    class AbstractText extends UI {
        text;
        constructor(data) {
            super(data);
            this.text = data.text;
        }
        setText(text) {
            this.text = text;
        }
        getTextSize() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const style = window.getComputedStyle(this.html());
            const font_info = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            ctx.font = font_info;
            const metrics = ctx.measureText(this.text);
            const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            // msg(`font :[${font_info}]  w:[${metrics.width}] h:[${actualHeight}] id:[${this.id}] [${this.text}]`);
            const width = metrics.width + this.borderWidthPadding() + TextSizeFill;
            const height = actualHeight + this.borderWidthPadding() + TextSizeFill;
            return new layout_ts.Vec2(width, height);
        }
    }
    layout_ts.AbstractText = AbstractText;
    class Label extends AbstractText {
        span;
        constructor(data) {
            super(data);
            this.span = document.createElement("span");
            this.span.innerText = this.text;
            // this.span.style.justifyContent = "center";
            // this.span.style.textAlign = "center";
        }
        html() {
            return this.span;
        }
    }
    layout_ts.Label = Label;
    class TextDiv extends AbstractText {
        div;
        constructor(data) {
            super(data);
            this.div = document.createElement("div");
            // this.div.style.borderStyle = "ridge";
            // this.div.style.borderWidth = "3px";
            // this.div.style.borderColor = "transparent";
        }
        html() {
            return this.div;
        }
        show() {
            this.div.style.display = "";
        }
        hide() {
            this.div.style.display = "none";
        }
        setBorderColor(color) {
            this.div.style.borderColor = color;
        }
    }
    layout_ts.TextDiv = TextDiv;
    class TextBox extends TextDiv {
        constructor(data) {
            super(data);
            this.div.innerHTML = data.text;
        }
        setText(text) {
            super.setText(text);
            this.div.innerHTML = text;
        }
        clearText() {
            this.setText("");
        }
    }
    layout_ts.TextBox = TextBox;
    class LaTeXBox extends TextDiv {
        click;
        constructor(data) {
            super(data);
            this.div.innerHTML = data.text;
            this.click = data.click;
            this.div.addEventListener("click", async (ev) => {
                if (this.click != undefined) {
                    await this.click(ev);
                }
            });
        }
        setStyle() {
            super.setStyle();
            parser_ts.renderKatexSub(this.div, this.text);
            return this;
        }
        setText(text) {
            super.setText(text);
            parser_ts.renderKatexSub(this.div, this.text);
        }
    }
    layout_ts.LaTeXBox = LaTeXBox;
    class AbstractInput extends UI {
        input;
        change;
        constructor(data) {
            super(data);
            this.change = data.change;
            this.input = document.createElement("input");
            this.input.style.color = layout_ts.fgColor;
            if (this instanceof InputText) {
                this.input.addEventListener("input", async (ev) => {
                    layout_ts.msg("input event");
                    if (this.change != undefined) {
                        await this.change(ev);
                    }
                });
            }
            else {
                this.input.addEventListener("change", async (ev) => {
                    layout_ts.msg("change event");
                    if (this.change != undefined) {
                        await this.change(ev);
                    }
                });
            }
        }
        html() {
            return this.input;
        }
    }
    class InputText extends AbstractInput {
        constructor(data) {
            super(data);
            this.input.type = "text";
            this.input.value = data.text;
        }
    }
    layout_ts.InputText = InputText;
    class InputColor extends AbstractInput {
        constructor(data) {
            super(data);
            this.input.type = "color";
        }
    }
    layout_ts.InputColor = InputColor;
    class InputNumberRange extends AbstractInput {
        constructor(data) {
            super(data);
            if (data.width == undefined) {
                data.width = "50px";
            }
            if (this instanceof InputNumber) {
                this.input.type = "number";
            }
            else {
                this.input.type = "range";
            }
            if (data.value != undefined) {
                this.input.value = `${data.value}`;
            }
            if (data.step != undefined) {
                this.input.step = `${data.step}`;
            }
            if (data.min != undefined) {
                this.input.min = `${data.min}`;
            }
            if (data.max != undefined) {
                this.input.max = `${data.max}`;
            }
        }
        setValue(value) {
            this.input.value = `${value}`;
        }
        getValue() {
            return parseFloat(this.input.value);
        }
        setMax(max_value) {
            this.input.max = `${max_value}`;
        }
    }
    class InputNumber extends InputNumberRange {
    }
    layout_ts.InputNumber = InputNumber;
    class InputRange extends InputNumberRange {
    }
    layout_ts.InputRange = InputRange;
    class CheckBox extends AbstractInput {
        span;
        constructor(data) {
            super(data);
            this.input.type = "checkbox";
            this.input.id = `layout.ts-checkbox-${this.idx}`;
            const label = document.createElement("label");
            label.htmlFor = this.input.id;
            label.textContent = data.text;
            label.style.color = layout_ts.fgColor;
            this.span = document.createElement("span");
            this.span.append(this.input);
            this.span.append(label);
        }
        html() {
            return this.span;
        }
        checked() {
            return this.input.checked;
        }
    }
    layout_ts.CheckBox = CheckBox;
    class TextArea extends UI {
        textArea;
        change;
        constructor(data) {
            super(data);
            this.change = data.change;
            this.textArea = document.createElement("textarea");
            if (data.value != undefined) {
                this.textArea.value = data.value;
            }
            if (data.cols != undefined) {
                this.textArea.cols = data.cols;
            }
            if (data.rows != undefined) {
                this.textArea.rows = data.rows;
            }
            this.textArea.style.color = layout_ts.fgColor;
            if (data.placeholder != undefined) {
                this.textArea.placeholder = data.placeholder;
            }
            this.textArea.addEventListener("input", async (ev) => {
                if (this.change != undefined) {
                    await this.change(ev);
                }
            });
        }
        html() {
            return this.textArea;
        }
        getValue() {
            return this.textArea.value;
        }
        setValue(text) {
            this.textArea.value = text;
        }
    }
    layout_ts.TextArea = TextArea;
    class Img extends UI {
        imgUrl;
        img;
        click;
        constructor(data) {
            super(data);
            this.imgUrl = data.imgUrl;
            this.img = document.createElement("img");
            this.img.style.objectFit = "contain";
            if (data.file != undefined) {
                layout_ts.setImgFile(this.img, data.file);
            }
            else {
                this.img.src = this.imgUrl;
            }
            if (data.click != undefined) {
                this.click = data.click;
                this.img.addEventListener("click", async (ev) => {
                    if (this.click != undefined) {
                        await this.click(ev);
                    }
                });
            }
        }
        html() {
            return this.img;
        }
        setImgUrl(url) {
            this.img.src = url;
            this.imgUrl = url;
        }
    }
    layout_ts.Img = Img;
    class AbstractButton extends UI {
        static imgMargin = 2;
        value;
        button;
        img;
        constructor(data) {
            super(data);
            this.value = data.value;
            this.button = document.createElement("button");
            this.button.style.padding = "1px";
            this.button.style.color = layout_ts.fgColor;
            if (data.disabled != undefined && data.disabled) {
                this.button.disabled = true;
            }
            if (data.text != undefined) {
                this.button.innerText = data.text;
            }
            if (data.url != undefined) {
                this.img = document.createElement("img");
                this.img.src = data.url;
                this.img.style.width = "100%";
                this.img.style.height = "100%";
                this.img.style.objectFit = "contain";
                this.button.append(this.img);
            }
        }
        setImgUrl(url) {
            this.img.src = url;
        }
    }
    class Button extends AbstractButton {
        click;
        constructor(data) {
            super(data);
            this.click = data.click;
            this.button.addEventListener("click", async (ev) => {
                if (this.click != undefined) {
                    await this.click(ev);
                }
            });
        }
        html() {
            return this.button;
        }
    }
    layout_ts.Button = Button;
    class Anchor extends UI {
        anchor;
        constructor(data) {
            super(data);
            this.anchor = document.createElement("a");
        }
        html() {
            return this.anchor;
        }
    }
    layout_ts.Anchor = Anchor;
    class RadioButton extends AbstractButton {
        constructor(data) {
            super(data);
            this.button.value = data.value;
            if (data.title != undefined) {
                this.button.title = data.title;
            }
            this.button.style.borderWidth = "3px";
            this.button.style.borderStyle = "outset";
        }
        html() {
            return this.button;
        }
        selectUI(selected) {
            if (this.parent == undefined) {
                throw new layout_ts.MyError();
            }
            if (this.parent.selectedUI != undefined) {
                const old_selected = this.parent.selectedUI;
                this.parent.selectedUI = undefined;
                old_selected.selectUI(false);
            }
            const html = this.html();
            if (selected) {
                html.style.borderStyle = "inset";
                if (this.parent.selectedUI != this) {
                    this.parent.selectedUI = this;
                    if (this.parent.onChange != undefined) {
                        this.parent.onChange(this);
                    }
                }
            }
            else {
                html.style.borderStyle = "outset";
            }
        }
    }
    layout_ts.RadioButton = RadioButton;
    class Block extends UI {
        div;
        children;
        selectedUI;
        onChange;
        constructor(data) {
            super(data);
            this.div = document.createElement("div");
            this.children = [];
            data.children.forEach(x => this.addChild(x));
            if (this.children.length != 0 && this.children[0] instanceof RadioButton) {
                this.children[0].selectUI(true);
            }
            this.children.forEach(x => this.div.append(x.html()));
        }
        html() {
            return this.div;
        }
        addChild(child) {
            child.parent = this;
            this.children.push(child);
            this.div.append(child.html());
            if (child instanceof RadioButton) {
                child.button.addEventListener("click", (ev) => {
                    child.selectUI(true);
                });
            }
        }
        popChild() {
            if (this.children.length == 0) {
                return undefined;
            }
            const child = this.children.pop();
            child.parent = undefined;
            this.div.removeChild(child.html());
            return child;
        }
        removeChild(child) {
            const idx = this.children.indexOf(child);
            if (idx == -1) {
                throw new layout_ts.MyError();
            }
            this.children.splice(idx, 1);
            this.div.removeChild(child.html());
        }
        getAllUI() {
            let uis = [this];
            for (const child of this.children) {
                if (child instanceof Block) {
                    uis = uis.concat(child.getAllUI());
                }
                else {
                    uis.push(child);
                }
            }
            return uis;
        }
        getAllHtml() {
            const uis = this.getAllUI();
            return uis.map(x => x.html());
        }
        getElementById(id) {
            return this.getAllHtml().find(x => x.id == id);
        }
        $(id) {
            return this.getUIById(id);
        }
        getUIById(id) {
            const uis = this.getAllUI();
            return uis.find(x => x.id == id);
        }
        clear() {
            this.children = [];
            this.div.innerHTML = "";
        }
    }
    layout_ts.Block = Block;
    class Flex extends Block {
        static initialWidth = "300px";
        static padding = 2;
        direction;
        constructor(data) {
            super(data);
            this.div.style.width = Flex.initialWidth;
            this.direction = (data.direction != undefined ? data.direction : "row");
            this.children = data.children;
            this.children.forEach(x => this.div.append(x.html()));
        }
        getMinSize() {
            let min_sizes = [];
            if (this.children.length != 0) {
                min_sizes = this.children.map(x => x.getMinSize());
            }
            let width;
            let height;
            if (this.width != undefined) {
                layout_ts.assert(this.width.endsWith("px"));
                width = pixel(this.width);
            }
            else {
                if (this.children.length == 0) {
                    width = 0;
                }
                else if (this.direction == "row") {
                    width = layout_ts.sum(min_sizes.map(sz => sz.x)) + (min_sizes.length - 1) * Flex.padding;
                }
                else if (this.direction == "column") {
                    width = Math.max(...min_sizes.map(sz => sz.x));
                }
            }
            if (this.height != undefined) {
                layout_ts.assert(this.height.endsWith("px"));
                height = pixel(this.height);
            }
            else {
                if (this.children.length == 0) {
                    height = 0;
                }
                else if (this.direction == "row") {
                    height = Math.max(...min_sizes.map(sz => sz.y));
                }
                else if (this.direction == "column") {
                    height = layout_ts.sum(min_sizes.map(sz => sz.y)) + (min_sizes.length - 1) * Flex.padding;
                }
            }
            if (width == undefined || height == undefined) {
                throw new layout_ts.MyError();
            }
            this.minSize = new layout_ts.Vec2(width + 2 * Flex.padding, height + 2 * Flex.padding);
            return this.minSize;
        }
        layout(x, y, size, nest) {
            super.layout(x, y, size, nest);
            let child_x = Flex.padding;
            let child_y = Flex.padding;
            if (this.direction == "row") {
                for (const [idx, child] of this.children.entries()) {
                    child.layout(child_x, child_y, child.getMinSize(), nest + 1);
                    child_x += child.minSize.x + Flex.padding;
                }
            }
            else if (this.direction == "column") {
                for (const [idx, child] of this.children.entries()) {
                    child.layout(child_x, child_y, child.getMinSize(), nest + 1);
                    child_y += child.minSize.y + Flex.padding;
                }
            }
            else {
                throw new layout_ts.MyError();
            }
        }
    }
    layout_ts.Flex = Flex;
    class PopupMenu extends UI {
        dlg;
        flex;
        click;
        constructor(data) {
            super(data);
            this.click = data.click;
            this.dlg = document.createElement("dialog");
            this.dlg.style.position = "fixed";
            this.dlg.style.zIndex = "1";
            this.flex = $flex({
                direction: "column",
                children: data.children
            });
            for (const child of data.children) {
                child.html().addEventListener("click", (ev) => {
                    const dlgs = document.body.getElementsByTagName("dialog");
                    for (const dlg of dlgs) {
                        dlg.close();
                    }
                });
            }
            this.dlg.append(this.flex.div);
            document.body.append(this.dlg);
        }
        html() {
            return this.dlg;
        }
        show(ev) {
            setTimeout(() => {
                this.flex.getAllUI().forEach(x => x.minSize = undefined);
                const size = this.flex.getMinSize();
                this.flex.layout(0, 0, size, 0);
                this.dlg.style.width = `${size.x}px`;
                this.dlg.style.height = `${size.y}px`;
                this.dlg.style.marginLeft = `${ev.pageX}px`;
                this.dlg.style.marginTop = `${ev.pageY}px`;
            });
            this.dlg.showModal();
        }
        close() {
            this.dlg.close();
        }
    }
    layout_ts.PopupMenu = PopupMenu;
    class Grid extends Block {
        columns;
        rows;
        minWidths = [];
        heights;
        numCols = NaN;
        numRows = NaN;
        constructor(data) {
            super(data);
            if (data.columns != undefined) {
                this.columns = data.columns.split(" ");
            }
            if (data.rows != undefined) {
                this.rows = data.rows.split(" ");
            }
        }
        getRow(idx) {
            layout_ts.assert(!isNaN(this.numCols) && !isNaN(this.numRows));
            return this.children.slice(idx * this.numCols, (idx + 1) * this.numCols);
        }
        getRowHeight(idx) {
            return Math.max(...this.getRow(idx).map(ui => ui.getMinHeight()));
        }
        getColumn(idx) {
            layout_ts.assert(!isNaN(this.numCols) && !isNaN(this.numRows));
            return layout_ts.range(this.children.length).filter(i => i % this.numCols == idx).map(i => this.children[i]);
        }
        getColumnWith(idx) {
            return Math.max(...this.getColumn(idx).map(ui => ui.getMinWidth()));
        }
        calcHeights() {
            const heights = layout_ts.range(this.rows.length).map(x => 0);
            for (const [idx, row] of this.rows.entries()) {
                if (row.endsWith("px")) {
                    heights[idx] = pixel(row);
                }
                else if (row == "auto") {
                    heights[idx] = this.getRowHeight(idx);
                }
            }
            return heights;
        }
        getMinSize() {
            let width;
            this.numCols = (this.columns == undefined ? 1 : this.columns.length);
            this.numRows = Math.ceil(this.children.length / this.numCols);
            layout_ts.assert(this.rows == undefined || this.rows.length == this.numRows);
            if (this.width != undefined) {
                layout_ts.assert(this.width.endsWith("px"));
                width = pixel(this.width);
            }
            else {
                if (this.columns == undefined) {
                    width = this.getColumnWith(0);
                }
                else {
                    this.minWidths = new Array(this.columns.length).fill(0);
                    for (const [idx, col] of this.columns.entries()) {
                        if (col.endsWith("px")) {
                            this.minWidths[idx] = pixel(col);
                        }
                        else {
                            const col_width = Math.max(...this.getColumn(idx).map(ui => ui.getMinWidth()));
                            if (col == "auto") {
                                this.minWidths[idx] = col_width;
                            }
                            else if (col.endsWith("%")) {
                                this.minWidths[idx] = col_width / ratio(col);
                            }
                            else {
                                throw new layout_ts.MyError();
                            }
                        }
                    }
                    width = layout_ts.sum(this.minWidths);
                }
            }
            let height;
            if (this.height != undefined) {
                layout_ts.assert(this.numRows == 1);
                layout_ts.assert(this.height.endsWith("px"));
                height = pixel(this.height);
                this.heights = [height];
            }
            else {
                if (this.rows == undefined) {
                    this.heights = layout_ts.range(this.numRows).map(i => this.getRowHeight(i));
                    height = layout_ts.sum(this.heights);
                }
                else {
                    this.heights = this.calcHeights();
                    let remaining_height = 0;
                    for (const [idx, size] of this.rows.entries()) {
                        if (size.endsWith("%")) {
                            const row_height = Math.max(...this.getRow(idx).map(ui => ui.getMinHeight()));
                            remaining_height = Math.max(row_height / ratio(size));
                        }
                    }
                    height = layout_ts.sum(this.heights) + remaining_height;
                }
            }
            this.minSize = new layout_ts.Vec2(width, height);
            return this.minSize;
        }
        layout(x, y, size, nest) {
            super.layout(x, y, size, nest);
            let widths = new Array(this.minWidths.length).fill(0);
            if (this.columns == undefined) {
                widths = [size.x];
            }
            else {
                let fixed_width = 0;
                for (const [idx, col] of this.columns.entries()) {
                    if (col.endsWith("px") || col == "auto") {
                        widths[idx] = this.minWidths[idx];
                        fixed_width += this.minWidths[idx];
                    }
                }
                const remaining_width = size.x - fixed_width;
                for (const [idx, col] of this.columns.entries()) {
                    if (col.endsWith("%")) {
                        widths[idx] = remaining_width * ratio(col);
                    }
                }
            }
            if (this.rows == undefined) {
                this.heights = layout_ts.range(this.numRows).map(i => this.getRowHeight(i));
            }
            else {
                if (this.heights == undefined) {
                    this.heights = this.calcHeights();
                }
                const remaining_height = size.y - layout_ts.sum(this.heights);
                for (const [idx, row] of this.rows.entries()) {
                    if (row.endsWith("%")) {
                        this.heights[idx] = pixel(row, remaining_height);
                    }
                }
            }
            if (i18n_ts.appMode == AppMode.lessonPlay) {
                layout_ts.msg(`${" ".repeat(4 * nest)} id:${this.id} widths:${widths.map(x => x.toFixed())} heights:${this.heights.map(x => x.toFixed())}`);
            }
            let row = 0;
            let col_idx = 0;
            let child_x = 0;
            let child_y = 0;
            for (const child of this.children) {
                let child_width;
                if (child.colspan == 1) {
                    child_width = widths[col_idx];
                }
                else {
                    child_width = layout_ts.sum(widths.slice(col_idx, col_idx + child.colspan));
                }
                child.layout(child_x, child_y, new layout_ts.Vec2(child_width, this.heights[row]), nest + 1);
                if (col_idx + child.colspan < widths.length) {
                    child_x += widths[col_idx];
                    col_idx += child.colspan;
                }
                else {
                    child_x = 0;
                    child_y += this.heights[row];
                    col_idx = 0;
                    row++;
                }
            }
        }
        updateRootLayout() {
            this.getAllUI().forEach(x => x.minSize = undefined);
            const size = this.getMinSize();
            let x;
            let y;
            if (this.columns != undefined && this.columns.some(x => x.endsWith("%"))) {
                size.x = window.innerWidth;
                x = 0;
            }
            else {
                x = Math.max(0, 0.5 * (window.innerWidth - size.x));
            }
            if (this.rows != undefined && this.rows.some(x => x.endsWith("%"))) {
                size.y = window.innerHeight;
                y = 0;
            }
            else {
                y = Math.max(0, 0.5 * (window.innerHeight - size.y));
            }
            this.layout(x, y, size, 0);
        }
    }
    layout_ts.Grid = Grid;
    class SelectionList extends Grid {
        selectedIndex = NaN;
        selectionChanged;
        constructor(data) {
            if (data.orientation == Orientation.vertical) {
                data.rows = data.children.map(_ => "auto").join(" ");
            }
            else {
                data.columns = data.children.map(_ => "auto").join(" ");
            }
            super(data);
            if (data.selectedIndex != undefined) {
                this.selectedIndex = data.selectedIndex;
            }
            if (data.selectionChanged != undefined) {
                this.selectionChanged = data.selectionChanged;
            }
            for (const [idx, ui] of this.children.entries()) {
                ui.html().addEventListener("click", (ev) => {
                    layout_ts.msg(`selection-Changed[${idx}]`);
                    this.selectedIndex = idx;
                    if (this.selectionChanged != undefined) {
                        this.selectionChanged(idx);
                    }
                });
            }
        }
        setStyle() {
            super.setStyle();
            // msg(`selected-Index : ${this.selectedIndex}`);
            if (!isNaN(this.selectedIndex)) {
                this.children[this.selectedIndex].selectUI(true);
            }
            return this;
        }
    }
    layout_ts.SelectionList = SelectionList;
    class Dialog extends UI {
        div;
        content;
        constructor(data) {
            super(data);
            this.content = data.content;
            this.div = document.createElement("div");
            this.div.style.position = "fixed";
            this.div.style.zIndex = "1";
            this.div.append(this.content.html());
        }
        html() {
            return this.div;
        }
        setXY(x, y) {
            this.div.style.marginLeft = `${x}px`;
            this.div.style.marginTop = `${y}px`;
        }
        showStyle(pageX, pageY) {
            const size = this.content.getMinSize();
            this.content.layout(0, 0, size, 0);
            // msg(`dlg: ${size.x} ${size.y} ${pageX} ${pageY}`);
            this.div.style.width = `${size.x + 10}px`;
            this.div.style.height = `${size.y + 10}px`;
            this.div.style.marginLeft = `${pageX}px`;
            this.div.style.marginTop = `${pageY}px`;
        }
        open() {
            return this.div.parentElement == layout_ts.modalDlg;
        }
        close() {
            layout_ts.modalDlg.innerHTML = "";
            layout_ts.modalDlg.style.display = "none";
        }
        showModal() {
            /*
                setTimeout(()=>{
                    // getBoundingClientRect can be used after showModal
        
                    this.showStyle(0, 0);
                });
            */
            if (this.div.parentElement != layout_ts.modalDlg) {
                layout_ts.modalDlg.append(this.div);
            }
            this.showStyle(0, 0);
            layout_ts.modalDlg.style.display = "block";
        }
    }
    layout_ts.Dialog = Dialog;
    class Log extends UI {
        static one;
        dlg;
        pre;
        texts = "";
        lastText = "";
        count = 0;
        static init() {
            if (Log.one == undefined) {
                Log.one = new Log({ width: `${0.5 * window.innerWidth}px`, height: `${0.5 * window.innerHeight}px` });
            }
        }
        static log(text) {
            Log.init();
            Log.one.addText(text);
            console.log(text);
        }
        static show(ev) {
            if (Log.one.dlg.open) {
                Log.one.dlg.close();
            }
            else {
                Log.init();
                Log.one.dlg.style.marginTop = `${0.8 * window.innerHeight}px`;
                Log.one.dlg.show();
            }
        }
        constructor(data) {
            super(data);
            if (data.width == undefined || data.height == undefined) {
                throw new layout_ts.MyError();
            }
            const width_px = pixel(data.width);
            const height_px = pixel(data.height);
            this.dlg = document.createElement("dialog");
            this.dlg.style.position = "fixed";
            this.dlg.style.width = `${width_px}px`;
            this.dlg.style.height = `${height_px}px`;
            this.dlg.style.padding = "0";
            this.dlg.style.marginRight = "0";
            this.dlg.style.zIndex = "1";
            const div = document.createElement("div");
            div.style.width = "100%";
            div.style.height = "100%";
            div.style.overflow = "auto";
            div.style.padding = "0";
            this.pre = document.createElement("pre");
            this.pre.style.width = "100%";
            this.pre.style.height = "100%";
            div.append(this.pre);
            this.dlg.append(div);
            document.body.append(this.dlg);
        }
        html() {
            return this.dlg;
        }
        addText(text) {
            if (text == this.lastText) {
                if (text != "") {
                    this.count++;
                    this.pre.innerText = this.texts + `\n${this.count}:` + text;
                }
            }
            else {
                this.texts += "\n" + this.lastText;
                this.lastText = text;
                this.pre.innerText = this.texts + "\n" + text;
                this.count = 1;
            }
        }
    }
    layout_ts.Log = Log;
    class Layout {
        static root;
        static initLayout(root) {
            Layout.root = root;
            document.body.append(root.div);
            Layout.root.updateRootLayout();
            window.addEventListener("resize", (ev) => {
                Layout.root.updateRootLayout();
            });
            layout_ts.modalDlg = layout_ts.$div("modal_dlg");
        }
    }
    layout_ts.Layout = Layout;
    function saveBlob(anchor, name, blob) {
        // a 要素の href 属性に Object URL をセット
        anchor.anchor.href = window.URL.createObjectURL(blob);
        // a 要素の download 属性にファイル名をセット
        anchor.anchor.download = `${name}.json`;
        // 疑似的に a 要素をクリックさせる
        anchor.anchor.click();
    }
    layout_ts.saveBlob = saveBlob;
    function $label(data) {
        return new Label(data).setStyle();
    }
    layout_ts.$label = $label;
    function $input_text(data) {
        return new InputText(data).setStyle();
    }
    layout_ts.$input_text = $input_text;
    function $input_color(data) {
        return new InputColor(data).setStyle();
    }
    layout_ts.$input_color = $input_color;
    function $input_number(data) {
        return new InputNumber(data).setStyle();
    }
    layout_ts.$input_number = $input_number;
    function $input_range(data) {
        return new InputRange(data).setStyle();
    }
    layout_ts.$input_range = $input_range;
    function $checkbox(data) {
        return new CheckBox(data).setStyle();
    }
    layout_ts.$checkbox = $checkbox;
    function $textarea(data) {
        return new TextArea(data).setStyle();
    }
    layout_ts.$textarea = $textarea;
    function $img(data) {
        return new Img(data).setStyle();
    }
    layout_ts.$img = $img;
    function $button(data) {
        return new Button(data).setStyle();
    }
    layout_ts.$button = $button;
    function $anchor(data) {
        return new Anchor(data).setStyle();
    }
    layout_ts.$anchor = $anchor;
    function $radio(data) {
        return new RadioButton(data).setStyle();
    }
    layout_ts.$radio = $radio;
    function $textbox(data) {
        return new TextBox(data).setStyle();
    }
    layout_ts.$textbox = $textbox;
    function $latex(data) {
        return new LaTeXBox(data).setStyle();
    }
    layout_ts.$latex = $latex;
    function $block(data) {
        return new Block(data).setStyle();
    }
    layout_ts.$block = $block;
    function $grid(data) {
        return new Grid(data).setStyle();
    }
    layout_ts.$grid = $grid;
    function $selection(data) {
        return new SelectionList(data).setStyle();
    }
    layout_ts.$selection = $selection;
    function $flex(data) {
        return new Flex(data).setStyle();
    }
    layout_ts.$flex = $flex;
    function $popup(data) {
        return new PopupMenu(data).setStyle();
    }
    layout_ts.$popup = $popup;
    function $dialog(data) {
        return new Dialog(data).setStyle();
    }
    layout_ts.$dialog = $dialog;
    function $imgdiv(data) {
        return new layout_ts.ImgDiv(data).setStyle();
    }
    layout_ts.$imgdiv = $imgdiv;
})(layout_ts || (layout_ts = {}));
var layout_ts;
(function (layout_ts) {
    //
    class ImgDiv extends layout_ts.UI {
        div;
        img;
        uploadImgFile;
        imgUrl = "";
        constructor(data) {
            super(data);
            this.uploadImgFile = data.uploadImgFile;
            this.div = document.createElement("div");
            this.div.style.display = "flex";
            this.div.style.justifyContent = "center";
            this.div.style.alignItems = "center";
            this.img = document.createElement("img");
            this.img.style.maxWidth = "100%";
            this.img.style.maxHeight = "100%";
            this.div.append(this.img);
            this.div.addEventListener("dragenter", (ev) => {
                preventDefaults(ev);
                layout_ts.msg("drag enter");
            });
            this.div.addEventListener("dragover", (ev) => {
                preventDefaults(ev);
                this.div.classList.add('dragover');
                layout_ts.msg("drag over");
            });
            this.div.addEventListener("dragleave", (ev) => {
                preventDefaults(ev);
                this.div.classList.remove('dragover');
                layout_ts.msg("drag leave");
            });
            this.div.addEventListener("drop", async (ev) => {
                preventDefaults(ev);
                this.div.classList.remove('dragover');
                layout_ts.msg("drop");
                const dt = ev.dataTransfer;
                if (dt == null) {
                    return;
                }
                const files = Array.from(dt.files);
                layout_ts.msg(`${files}`);
                if (files.length == 1) {
                    const file = files[0];
                    if (file.type == "image/png" || file.type == "image/jpeg") {
                        layout_ts.setImgFile(this.img, file);
                        this.imgUrl = await this.uploadImgFile(file);
                    }
                    else {
                        layout_ts.msg(`File name: ${file.name}, File size: ${file.size}, File type: ${file.type}`);
                    }
                }
            });
        }
        html() {
            return this.div;
        }
        setImgUrl(url) {
            this.img.src = url;
            this.imgUrl = url;
        }
        clearImg() {
            this.img.src = "";
            this.imgUrl = "";
        }
    }
    layout_ts.ImgDiv = ImgDiv;
    function preventDefaults(ev) {
        ev.preventDefault();
        ev.stopPropagation();
    }
    function closeDlg() {
        if (layout_ts.modalDlg.style.display != "none") {
            layout_ts.modalDlg.style.display = "none";
            layout_ts.modalDlg.innerHTML = "";
            return true;
        }
        return false;
    }
    layout_ts.closeDlg = closeDlg;
})(layout_ts || (layout_ts = {}));
var layout_ts;
(function (layout_ts) {
    //
    function makeTestUI() {
        const [origin, ,] = i18n_ts.parseURL();
        const img_menu = layout_ts.$popup({
            children: [
                layout_ts.$button({
                    width: "24px",
                    height: "24px",
                    url: `${origin}/lib/plane/img/line-segment.png`
                }),
                layout_ts.$button({
                    width: "24px",
                    height: "24px",
                    url: `${origin}/lib/plane/img/half-line.png`
                }),
                layout_ts.$button({
                    width: "24px",
                    height: "24px",
                    url: `${origin}/lib/plane/img/line.png`
                })
            ]
        });
        const text_menu = layout_ts.$popup({
            direction: "column",
            children: [
                layout_ts.$button({
                    text: "Cut"
                }),
                layout_ts.$button({
                    text: "Copy"
                }),
                layout_ts.$button({
                    text: "Paste"
                })
            ]
        });
        const root = layout_ts.$grid({
            rows: "50px 50px 100%",
            children: [
                layout_ts.$block({
                    children: [],
                }),
                layout_ts.$grid({
                    columns: "50% 50%",
                    children: [
                        layout_ts.$block({
                            children: [
                                layout_ts.$checkbox({
                                    text: "Axis"
                                })
                            ],
                        }),
                        layout_ts.$block({
                            children: [
                                layout_ts.$button({
                                    text: "Play",
                                    click: async (ev) => { }
                                })
                            ],
                        })
                    ]
                }),
                layout_ts.$grid({
                    columns: "50px 50% 50% 300px",
                    children: [
                        layout_ts.$block({
                            children: [
                                layout_ts.$radio({
                                    value: "",
                                    title: "",
                                    width: "24px",
                                    height: "24px",
                                    url: `${origin}/lib/plane/img/selection.png`
                                }),
                                layout_ts.$radio({
                                    value: "",
                                    title: "",
                                    width: "24px",
                                    height: "24px",
                                    url: `${origin}/lib/plane/img/point.png`
                                })
                            ],
                        }),
                        layout_ts.$block({
                            children: [
                                layout_ts.$button({
                                    id: "add-statement",
                                    width: "24px",
                                    height: "24px",
                                    url: `${origin}/lib/plane/img/text.png`,
                                    click: async (ev) => {
                                        layout_ts.msg("show text menu");
                                        text_menu.show(ev);
                                    }
                                }),
                                layout_ts.$button({
                                    width: "24px",
                                    height: "24px",
                                    url: `${origin}/lib/plane/img/statement.png`,
                                    click: async (ev) => {
                                        img_menu.show(ev);
                                    }
                                })
                            ],
                        }),
                        layout_ts.$block({
                            children: [],
                        }),
                        layout_ts.$block({
                            children: [],
                        }),
                    ]
                })
            ]
        });
        return root;
    }
    layout_ts.makeTestUI = makeTestUI;
})(layout_ts || (layout_ts = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdHMvbGF5b3V0X3V0aWwudHMiLCIuLi8uLi8uLi90cy9tYWluLnRzIiwiLi4vLi4vLi4vdHMvbWlzYy50cyIsIi4uLy4uLy4uL3RzL3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQVUsU0FBUyxDQXlMbEI7QUF6TEQsV0FBVSxTQUFTO0lBQ25CLEVBQUU7SUFDVyxnQkFBTSxHQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFFdEMsTUFBYSxJQUFJO1FBQ2IsQ0FBQyxDQUFTO1FBQ1YsQ0FBQyxDQUFTO1FBRVYsWUFBWSxDQUFRLEVBQUUsQ0FBUztZQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsQ0FBQztLQUNKO0lBUlksY0FBSSxPQVFoQixDQUFBO0lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7SUFFNUMsU0FBZ0IsQ0FBQyxDQUFDLEVBQVc7UUFDekIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QixJQUFHLEdBQUcsSUFBSSxTQUFTLEVBQUMsQ0FBQztZQUNqQixHQUFHLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBUmUsV0FBQyxJQVFoQixDQUFBO0lBRUQsU0FBZ0IsSUFBSSxDQUFDLEVBQVc7UUFDNUIsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFtQixDQUFDO0lBQ25DLENBQUM7SUFGZSxjQUFJLE9BRW5CLENBQUE7SUFFRCxTQUFnQixJQUFJLENBQUMsRUFBVztRQUM1QixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQXFCLENBQUM7SUFDckMsQ0FBQztJQUZlLGNBQUksT0FFbkIsQ0FBQTtJQUVELFNBQWdCLElBQUksQ0FBQyxFQUFXO1FBQzVCLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBc0IsQ0FBQztJQUN0QyxDQUFDO0lBRmUsY0FBSSxPQUVuQixDQUFBO0lBRUQsTUFBYSxPQUFRLFNBQVEsS0FBSztRQUM5QixZQUFZLE9BQWdCLEVBQUU7WUFDMUIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hCLENBQUM7S0FDSjtJQUpZLGlCQUFPLFVBSW5CLENBQUE7SUFFRCxTQUFnQixNQUFNLENBQUMsQ0FBVyxFQUFFLE1BQWUsRUFBRTtRQUNqRCxJQUFHLENBQUMsQ0FBQyxFQUFDLENBQUM7WUFDSCxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUM7SUFDTCxDQUFDO0lBSmUsZ0JBQU0sU0FJckIsQ0FBQTtJQUVELFNBQWdCLEdBQUcsQ0FBQyxHQUFZO1FBQzVCLFVBQUEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBRmUsYUFBRyxNQUVsQixDQUFBO0lBRUQsU0FBZ0IsS0FBSyxDQUFDLENBQVM7UUFDM0IsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUZlLGVBQUssUUFFcEIsQ0FBQTtJQUVELFNBQWdCLElBQUksQ0FBSSxDQUFZO1FBQ2hDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUZlLGNBQUksT0FFbkIsQ0FBQTtJQUVELFNBQWdCLE1BQU0sQ0FBSSxDQUFZO1FBQ2xDLElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxFQUFLLENBQUM7UUFDdkIsTUFBTSxHQUFHLEdBQVMsRUFBRSxDQUFDO1FBQ3JCLEtBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUM7WUFDZCxJQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDO2dCQUNaLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQixDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQVZlLGdCQUFNLFNBVXJCLENBQUE7SUFFRCxTQUFnQixHQUFHLENBQUMsQ0FBWTtRQUM1QixNQUFNLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZCLElBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUMsQ0FBQztZQUNkLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVELE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQVBlLGFBQUcsTUFPbEIsQ0FBQTtJQUVNLEtBQUssVUFBVSxTQUFTLENBQUMsT0FBZTtRQUMzQyxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QyxNQUFNLElBQUksR0FBRyxNQUFNLFFBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVwQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBTHFCLG1CQUFTLFlBSzlCLENBQUE7SUFFRCxTQUFnQixXQUFXLENBQUMsQ0FBVTtRQUNsQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVoQyxJQUFJLENBQVEsRUFBRSxDQUFRLEVBQUUsQ0FBUSxDQUFDO1FBRWpDLElBQUcsQ0FBQyxHQUFHLElBQUksRUFBQyxDQUFDO1lBQ1QsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNOLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLENBQUM7YUFDSSxJQUFHLENBQUMsR0FBRyxHQUFHLEVBQUMsQ0FBQztZQUNiLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNOLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixDQUFDO2FBQ0ksSUFBRyxDQUFDLEdBQUcsSUFBSSxFQUFDLENBQUM7WUFDZCxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ04sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNOLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQzthQUNHLENBQUM7WUFDRCxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ04sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUVELE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUEzQmUscUJBQVcsY0EyQjFCLENBQUE7SUFFRCxTQUFnQixRQUFRLENBQUMsTUFBZTtRQUNwQyxPQUFPLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUNsQyxDQUFDO0lBRmUsa0JBQVEsV0FFdkIsQ0FBQTtJQUVELFNBQWdCLFFBQVEsQ0FBQyxNQUFlO1FBQ3BDLE9BQU8sTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFGZSxrQkFBUSxXQUV2QixDQUFBO0lBRUQsU0FBZ0IsT0FBTyxDQUFDLEtBQWMsRUFBRSxLQUFjLEVBQUUsR0FBWTtRQUNoRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQVEsRUFBQyxFQUFFLEdBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUM7UUFFdEQsQ0FBQyxLQUFLLEVBQUcsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRCxDQUFFLEtBQUssRUFBRSxHQUFHLENBQUUsR0FBRyxDQUFFLEtBQUssR0FBRyxLQUFLLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBRSxDQUFDO1FBRWhELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBUSxFQUFDLEVBQUUsR0FBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQztRQUN0RCxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVuQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDL0IsT0FBTyxLQUFLLElBQUksR0FBRyxDQUFDO0lBQ3hCLENBQUM7SUFYZSxpQkFBTyxVQVd0QixDQUFBO0lBRUQsU0FBZ0IsTUFBTSxDQUFDLE9BQWdCLEVBQUUsT0FBZ0IsRUFBRSxPQUFnQixFQUFFLE9BQWdCLEVBQUUsT0FBZ0I7UUFDM0csTUFBTSxLQUFLLEdBQUcsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDeEQsTUFBTSxPQUFPLEdBQUcsT0FBTyxHQUFHLEtBQUssR0FBRyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQztRQUV0RCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBTGUsZ0JBQU0sU0FLckIsQ0FBQTtJQUVELFNBQWdCLGVBQWU7UUFDM0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyx5QkFBeUI7UUFDNUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQywwQkFBMEI7UUFDL0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQjtRQUU1RCxNQUFNLFFBQVEsR0FBSSxDQUFDLEtBQUssR0FBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDeEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRXhDLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQVRlLHlCQUFlLGtCQVM5QixDQUFBO0lBR0QsU0FBZ0IsVUFBVSxDQUFDLEdBQXNCLEVBQUUsSUFBVztRQUMxRCxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBRWhDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUE4QixFQUFDLEVBQUU7WUFDOUQsSUFBRyxFQUFFLENBQUMsTUFBTSxJQUFJLElBQUksRUFBQyxDQUFDO2dCQUVsQixJQUFHLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksUUFBUSxFQUFDLENBQUM7b0JBRXBDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLENBQUM7cUJBQ0csQ0FBQztvQkFFRCxNQUFNLElBQUksT0FBTyxDQUFDLG1CQUFtQixJQUFJLENBQUMsSUFBSSxXQUFXLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO1lBQ0wsQ0FBQztpQkFDRyxDQUFDO2dCQUVELE1BQU0sSUFBSSxPQUFPLENBQUMsbUJBQW1CLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFL0IsQ0FBQztJQXZCZSxvQkFBVSxhQXVCekIsQ0FBQTtBQUdELENBQUMsRUF6TFMsU0FBUyxLQUFULFNBQVMsUUF5TGxCO0FDekxELElBQVUsU0FBUyxDQWdrRGxCO0FBaGtERCxXQUFVLFNBQVM7SUFLTixpQkFBTyxHQUFHLE9BQU8sQ0FBQztJQUNsQixpQkFBTyxHQUFHLFNBQVMsQ0FBQztJQUtqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBRWhDLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQztJQUN2QixNQUFNLFlBQVksR0FBRyxDQUFDLENBQUM7SUFFaEIsS0FBSyxVQUFVLFVBQVU7UUFDNUIsTUFBTSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFekIsTUFBTSxJQUFJLEdBQUcsVUFBQSxVQUFVLEVBQUUsQ0FBQztRQUMxQixNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFMcUIsb0JBQVUsYUFLL0IsQ0FBQTtJQUdELFNBQVMsS0FBSyxDQUFDLEtBQWM7UUFDekIsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixVQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVyRCxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFaEMsT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ3JCLENBQUM7SUFHRCxTQUFTLEtBQUssQ0FBQyxNQUFlLEVBQUcsZ0JBQTBCO1FBQ3ZELElBQUcsTUFBTSxJQUFJLFNBQVMsRUFBQyxDQUFDO1lBQ3BCLElBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO2dCQUN0QixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUV2RCxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvQixDQUFDO2lCQUNJLElBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDO2dCQUMxQixJQUFHLGdCQUFnQixJQUFJLFNBQVMsRUFBQyxDQUFDO29CQUM5QixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztnQkFDNUMsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxJQUFJLFVBQUEsT0FBTyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUssV0FHSjtJQUhELFdBQUssV0FBVztRQUNaLHlEQUFVLENBQUE7UUFDVixxREFBUSxDQUFBO0lBQ1osQ0FBQyxFQUhJLFdBQVcsS0FBWCxXQUFXLFFBR2Y7SUEyQkQsTUFBc0IsRUFBRTtRQUNwQixNQUFNLENBQUMsS0FBSyxHQUFZLENBQUMsQ0FBQztRQUUxQixHQUFHLENBQVU7UUFDYixFQUFFLENBQVc7UUFDYixTQUFTLENBQVc7UUFDcEIsTUFBTSxDQUFVO1FBQ2hCLEdBQUcsQ0FBUTtRQUNYLElBQUksQ0FBVztRQUNmLFFBQVEsQ0FBVztRQUNuQixNQUFNLENBQVc7UUFDakIsS0FBSyxDQUFXO1FBQ2hCLGVBQWUsQ0FBVztRQUMxQixXQUFXLENBQVc7UUFDdEIsV0FBVyxDQUFXO1FBQ3RCLE9BQU8sQ0FBVztRQUNsQixXQUFXLENBQVc7UUFDdEIsYUFBYSxDQUFXO1FBQ3hCLGVBQWUsQ0FBVztRQUMxQixTQUFTLENBQVc7UUFDcEIsUUFBUSxDQUFXO1FBQ25CLEtBQUssQ0FBVztRQUNoQixNQUFNLENBQVc7UUFDakIsVUFBVSxDQUFXO1FBQ3JCLE9BQU8sR0FBWSxDQUFDLENBQUM7UUFFckIsT0FBTyxDQUFvQjtRQUMzQixRQUFRLEdBQWEsR0FBRyxDQUFDO1FBQ3pCLFNBQVMsR0FBWSxHQUFHLENBQUM7UUFFekIsWUFBWSxJQUFXO1lBQ25CLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzFCLENBQUM7UUFFRCxRQUFRO1lBQ0osTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXhCLElBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDckIsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3JCLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQzVCLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNuQyxDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsUUFBUSxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUMzQixHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3ZDLENBQUM7aUJBQ0ksSUFBRyxDQUFDLENBQUMsR0FBRyxZQUFZLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQy9CLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztZQUNwQyxDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN6QixHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ25DLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxXQUFXLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQzlCLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2xELENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxXQUFXLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQzlCLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDN0MsQ0FBQztZQUVELElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxTQUFTLElBQUksQ0FBQyxJQUFJLFlBQVksU0FBUyxJQUFJLElBQUksWUFBWSxnQkFBZ0IsQ0FBQyxFQUFDLENBQUM7Z0JBQzdGLElBQUksQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO1lBQ2hDLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQzVCLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDekMsQ0FBQztZQUVELElBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDM0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN2QyxDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsS0FBSyxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN4QixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2pDLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxlQUFlLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ2xDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDckQsQ0FBQztpQkFDRyxDQUFDO2dCQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFVBQUEsT0FBTyxDQUFDO1lBQ3hDLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ3hCLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDakMsQ0FBQztZQUVELElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDekIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNuQyxDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsVUFBVSxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUM3QixHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQzNDLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBSUQsa0JBQWtCO1lBQ2QsSUFBSSxDQUFDLEdBQVksQ0FBQyxDQUFDO1lBRW5CLElBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDOUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQzlCLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxPQUFPLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQzFCLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUMxQixDQUFDO1lBRUQsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO1FBRUQsVUFBVTtZQUNOLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3hCLENBQUM7WUFFRCxJQUFJLEtBQTBCLENBQUM7WUFDL0IsSUFBSSxNQUEyQixDQUFDO1lBRWhDLElBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQztnQkFDckQsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDMUQsQ0FBQztZQUVELElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQztnQkFDdkQsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDNUQsQ0FBQztZQUVELElBQUcsS0FBSyxJQUFJLFNBQVMsSUFBSSxNQUFNLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBRTFDLElBQUksSUFBVyxDQUFDO2dCQUVoQixJQUFHLElBQUksWUFBWSxZQUFZLElBQUksQ0FBQyxDQUFDLElBQUksWUFBWSxRQUFRLENBQUMsRUFBQyxDQUFDO29CQUM1RCxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM5QixDQUFDO3FCQUNHLENBQUM7b0JBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUM7b0JBQ2pELElBQUksR0FBRyxJQUFJLFVBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3QyxDQUFDO2dCQUVELElBQUcsS0FBSyxJQUFJLFNBQVMsRUFBQyxDQUFDO29CQUNuQixLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsQ0FBQztnQkFDRCxJQUFHLE1BQU0sSUFBSSxTQUFTLEVBQUMsQ0FBQztvQkFDcEIsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQUEsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN2QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUVELFdBQVc7WUFDUCxPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUdELFlBQVk7WUFDUixPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELFFBQVE7WUFDSixJQUFHLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ3hCLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQztvQkFDMUIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3QixDQUFDO1lBQ0wsQ0FBQztZQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ2pELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO1FBRUQsU0FBUztZQUNMLElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDekIsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO29CQUMzQixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLENBQUM7WUFDTCxDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDakQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxLQUFLLENBQUMsQ0FBVSxFQUFFLENBQVU7WUFDeEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXpCLElBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLEVBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUksR0FBRyxDQUFDLElBQUksQ0FBQztZQUMvQixDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sQ0FBQyxJQUFXO1lBQ2YsSUFBRyxJQUFJLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ2xCLE1BQU0sSUFBSSxVQUFBLE9BQU8sRUFBRSxDQUFDO1lBQ3hCLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFekIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUVyRCxJQUFHLElBQUksQ0FBQyxPQUFPLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQzFCLE1BQU0sSUFBSSxVQUFBLE9BQU8sRUFBRSxDQUFDO1lBQ3hCLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDcEMsQ0FBQztpQkFDRyxDQUFDO2dCQUNELElBQUksQ0FBQyxRQUFRLEdBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQztZQUNqRCxDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7aUJBQ0csQ0FBQztnQkFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUM7WUFDakQsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDO1FBQzlDLENBQUM7UUFFRCxRQUFRLENBQUMsUUFBa0I7UUFDM0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxDQUFVLEVBQUUsQ0FBVSxFQUFFLElBQVcsRUFBRSxJQUFhO1lBQ3JELElBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFDLENBQUM7Z0JBQ3RDLFVBQUEsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsYUFBYSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN6SixDQUFDO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQixJQUFHLElBQUksQ0FBQyxlQUFlLElBQUksUUFBUSxFQUFDLENBQUM7Z0JBQ2pDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUVELEtBQUs7WUFDRCxJQUFHLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxJQUFJLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQztnQkFDdEQsTUFBTSxJQUFJLFVBQUEsT0FBTyxFQUFFLENBQUM7WUFDeEIsQ0FBQztZQUVELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6RCxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixDQUFDOztJQTNQaUIsWUFBRSxLQTRQdkIsQ0FBQTtJQUVELE1BQXNCLFlBQWEsU0FBUSxFQUFFO1FBQ3pDLElBQUksQ0FBVTtRQUVkLFlBQVksSUFBK0I7WUFDdkMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzFCLENBQUM7UUFFRCxPQUFPLENBQUMsSUFBYTtZQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNyQixDQUFDO1FBRUQsV0FBVztZQUNQLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUUsQ0FBQztZQUVyQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbkQsTUFBTSxTQUFTLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzlFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1lBRXJCLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTNDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUM7WUFFeEYsd0dBQXdHO1lBRXhHLE1BQU0sS0FBSyxHQUFJLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsWUFBWSxDQUFDO1lBQ3hFLE1BQU0sTUFBTSxHQUFHLFlBQVksR0FBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxZQUFZLENBQUM7WUFDeEUsT0FBTyxJQUFJLFVBQUEsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNuQyxDQUFDO0tBQ0o7SUE5QnFCLHNCQUFZLGVBOEJqQyxDQUFBO0lBRUQsTUFBYSxLQUFNLFNBQVEsWUFBWTtRQUNuQyxJQUFJLENBQW1CO1FBRXZCLFlBQVksSUFBK0I7WUFDdkMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRVosSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDaEMsNkNBQTZDO1lBQzdDLHdDQUF3QztRQUM1QyxDQUFDO1FBRUQsSUFBSTtZQUNBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixDQUFDO0tBQ0o7SUFmWSxlQUFLLFFBZWpCLENBQUE7SUFFRCxNQUFzQixPQUFRLFNBQVEsWUFBWTtRQUM5QyxHQUFHLENBQWtCO1FBRXJCLFlBQVksSUFBK0I7WUFDdkMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLHdDQUF3QztZQUN4QyxzQ0FBc0M7WUFDdEMsOENBQThDO1FBQ2xELENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3BCLENBQUM7UUFFRCxJQUFJO1lBQ0EsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRUQsSUFBSTtZQUNBLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDcEMsQ0FBQztRQUVELGNBQWMsQ0FBQyxLQUFjO1lBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDdkMsQ0FBQztLQUNKO0lBMUJxQixpQkFBTyxVQTBCNUIsQ0FBQTtJQUVELE1BQWEsT0FBUSxTQUFRLE9BQU87UUFDaEMsWUFBWSxJQUErQjtZQUN2QyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ25DLENBQUM7UUFFRCxPQUFPLENBQUMsSUFBYTtZQUNqQixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUM5QixDQUFDO1FBRUQsU0FBUztZQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckIsQ0FBQztLQUNKO0lBZFksaUJBQU8sVUFjbkIsQ0FBQTtJQUVELE1BQWEsUUFBUyxTQUFRLE9BQU87UUFDakMsS0FBSyxDQUF1QjtRQUU1QixZQUFZLElBQTREO1lBQ3BFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBRXhCLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFhLEVBQUMsRUFBRTtnQkFDdEQsSUFBRyxJQUFJLENBQUMsS0FBSyxJQUFJLFNBQVMsRUFBQyxDQUFDO29CQUN4QixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pCLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFRCxRQUFRO1lBQ0osS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWpCLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFOUMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELE9BQU8sQ0FBQyxJQUFhO1lBQ2pCLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEIsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsRCxDQUFDO0tBQ0o7SUEzQlksa0JBQVEsV0EyQnBCLENBQUE7SUFFRCxNQUFlLGFBQWMsU0FBUSxFQUFFO1FBQ25DLEtBQUssQ0FBb0I7UUFDekIsTUFBTSxDQUFnQztRQUV0QyxZQUFZLElBQXlDO1lBQ2pELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUUxQixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFVBQUEsT0FBTyxDQUFDO1lBRWpDLElBQUcsSUFBSSxZQUFZLFNBQVMsRUFBQyxDQUFDO2dCQUUxQixJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBVSxFQUFDLEVBQUU7b0JBQ3JELFVBQUEsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNuQixJQUFHLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFDLENBQUM7d0JBQ3pCLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDMUIsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7aUJBQ0csQ0FBQztnQkFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBVSxFQUFDLEVBQUU7b0JBQ3RELFVBQUEsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNwQixJQUFHLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFDLENBQUM7d0JBQ3pCLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDMUIsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDO1FBRUQsSUFBSTtZQUNBLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO0tBQ0o7SUFFRCxNQUFhLFNBQVUsU0FBUSxhQUFhO1FBRXhDLFlBQVksSUFBd0Q7WUFDaEUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDakMsQ0FBQztLQUNKO0lBUFksbUJBQVMsWUFPckIsQ0FBQTtJQUdELE1BQWEsVUFBVyxTQUFRLGFBQWE7UUFDekMsWUFBWSxJQUF3RDtZQUNoRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7UUFDOUIsQ0FBQztLQUNKO0lBTFksb0JBQVUsYUFLdEIsQ0FBQTtJQUVELE1BQU0sZ0JBQWlCLFNBQVEsYUFBYTtRQUN4QyxZQUFZLElBQXdHO1lBQ2hILEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVaLElBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDeEIsQ0FBQztZQUVELElBQUcsSUFBSSxZQUFZLFdBQVcsRUFBQyxDQUFDO2dCQUU1QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7WUFDL0IsQ0FBQztpQkFDRyxDQUFDO2dCQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztZQUM5QixDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsS0FBSyxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN2QyxDQUFDO1lBQ0QsSUFBRyxJQUFJLENBQUMsSUFBSSxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxDQUFDO1lBQ0QsSUFBRyxJQUFJLENBQUMsR0FBRyxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNuQyxDQUFDO1lBQ0QsSUFBRyxJQUFJLENBQUMsR0FBRyxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNuQyxDQUFDO1FBQ0wsQ0FBQztRQUVELFFBQVEsQ0FBQyxLQUFjO1lBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUM7UUFDbEMsQ0FBQztRQUVELFFBQVE7WUFDSixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCxNQUFNLENBQUMsU0FBa0I7WUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxTQUFTLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0tBQ0o7SUFFRCxNQUFhLFdBQVksU0FBUSxnQkFBZ0I7S0FDaEQ7SUFEWSxxQkFBVyxjQUN2QixDQUFBO0lBR0QsTUFBYSxVQUFXLFNBQVEsZ0JBQWdCO0tBQy9DO0lBRFksb0JBQVUsYUFDdEIsQ0FBQTtJQUVELE1BQWEsUUFBUyxTQUFRLGFBQWE7UUFDdkMsSUFBSSxDQUFvQjtRQUV4QixZQUFZLElBQXdEO1lBQ2hFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVaLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztZQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxzQkFBc0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBRWpELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUM5QixLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDOUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsVUFBQSxPQUFPLENBQUM7WUFFNUIsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsSUFBSTtZQUNBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixDQUFDO1FBRUQsT0FBTztZQUNILE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDOUIsQ0FBQztLQUNKO0lBMUJZLGtCQUFRLFdBMEJwQixDQUFBO0lBRUQsTUFBYSxRQUFTLFNBQVEsRUFBRTtRQUM1QixRQUFRLENBQXVCO1FBQy9CLE1BQU0sQ0FBa0I7UUFFeEIsWUFBWSxJQUFpSDtZQUN6SCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ25ELElBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNyQyxDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsSUFBSSxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ25DLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxJQUFJLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDbkMsQ0FBQztZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFBLE9BQU8sQ0FBQztZQUVwQyxJQUFHLElBQUksQ0FBQyxXQUFXLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDakQsQ0FBQztZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFVLEVBQUMsRUFBRTtnQkFDeEQsSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBQyxDQUFDO29CQUN6QixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzFCLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7UUFFRCxRQUFRO1lBQ0osT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUMvQixDQUFDO1FBRUQsUUFBUSxDQUFDLElBQWE7WUFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQy9CLENBQUM7S0FDSjtJQTVDWSxrQkFBUSxXQTRDcEIsQ0FBQTtJQUVELE1BQWEsR0FBSSxTQUFRLEVBQUU7UUFDdkIsTUFBTSxDQUFVO1FBQ2hCLEdBQUcsQ0FBb0I7UUFDdkIsS0FBSyxDQUF1QjtRQUU1QixZQUFZLElBQTRFO1lBQ3BGLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUNyQyxJQUFHLElBQUksQ0FBQyxJQUFJLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBRXZCLFVBQUEsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLENBQUM7aUJBQ0csQ0FBQztnQkFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQy9CLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFFeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQWEsRUFBQyxFQUFFO29CQUN0RCxJQUFHLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxFQUFDLENBQUM7d0JBQ3hCLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekIsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDO1FBRUQsSUFBSTtZQUNBLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNwQixDQUFDO1FBRUQsU0FBUyxDQUFDLEdBQVk7WUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUksR0FBRyxDQUFDO1FBQ3ZCLENBQUM7S0FDSjtJQXRDWSxhQUFHLE1Bc0NmLENBQUE7SUFFRCxNQUFlLGNBQWUsU0FBUSxFQUFFO1FBQ3BDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLEtBQUssQ0FBWTtRQUNqQixNQUFNLENBQXFCO1FBQzNCLEdBQUcsQ0FBcUI7UUFFeEIsWUFBWSxJQUE4RTtZQUN0RixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFVBQUEsT0FBTyxDQUFDO1lBRWxDLElBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDaEMsQ0FBQztZQUVELElBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN0QyxDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsR0FBRyxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBRXhCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBSyxNQUFNLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBSSxNQUFNLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7Z0JBRXJDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxDQUFDO1FBQ0wsQ0FBQztRQUVELFNBQVMsQ0FBQyxHQUFZO1lBQ2xCLElBQUksQ0FBQyxHQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUN4QixDQUFDOztJQUdMLE1BQWEsTUFBTyxTQUFRLGNBQWM7UUFDdEMsS0FBSyxDQUF1QjtRQUU1QixZQUFZLElBQTZGO1lBQ3JHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUV4QixJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBYSxFQUFDLEVBQUU7Z0JBQ3pELElBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUMsQ0FBQztvQkFDeEIsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRUQsSUFBSTtZQUNBLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN2QixDQUFDO0tBQ0o7SUFqQlksZ0JBQU0sU0FpQmxCLENBQUE7SUFFRCxNQUFhLE1BQU8sU0FBUSxFQUFFO1FBQzFCLE1BQU0sQ0FBcUI7UUFFM0IsWUFBWSxJQUErQztZQUN2RCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFWixJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELElBQUk7WUFDQSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQztLQUNKO0lBWlksZ0JBQU0sU0FZbEIsQ0FBQTtJQUVELE1BQWEsV0FBWSxTQUFRLGNBQWM7UUFDM0MsWUFBWSxJQUE4RjtZQUN0RyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFWixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQy9CLElBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNuQyxDQUFDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO1FBQzdDLENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxRQUFRLENBQUMsUUFBa0I7WUFDdkIsSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN6QixNQUFNLElBQUksVUFBQSxPQUFPLEVBQUUsQ0FBQztZQUN4QixDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDcEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztnQkFDbkMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pCLElBQUcsUUFBUSxFQUFDLENBQUM7Z0JBRVQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO2dCQUVqQyxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLElBQUksRUFBQyxDQUFDO29CQUUvQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7b0JBQzlCLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksU0FBUyxFQUFDLENBQUM7d0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMvQixDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO2lCQUNHLENBQUM7Z0JBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO1lBQ3RDLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUE3Q1kscUJBQVcsY0E2Q3ZCLENBQUE7SUFFRCxNQUFhLEtBQU0sU0FBUSxFQUFFO1FBQ3pCLEdBQUcsQ0FBa0I7UUFDckIsUUFBUSxDQUFRO1FBQ2hCLFVBQVUsQ0FBTztRQUVqQixRQUFRLENBQWtCO1FBRTFCLFlBQVksSUFBaUM7WUFDekMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXpDLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTdDLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFlBQVksV0FBVyxFQUFDLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLENBQUM7WUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVELElBQUk7WUFDQSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEIsQ0FBQztRQUVELFFBQVEsQ0FBQyxLQUFVO1lBQ2YsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFFOUIsSUFBRyxLQUFLLFlBQVksV0FBVyxFQUFDLENBQUM7Z0JBRTdCLEtBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBYSxFQUFDLEVBQUU7b0JBQ3BELEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUM7UUFFRCxRQUFRO1lBQ0osSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUMsQ0FBQztnQkFDMUIsT0FBTyxTQUFTLENBQUM7WUFDckIsQ0FBQztZQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFHLENBQUM7WUFDbkMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7WUFFekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFFbkMsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVELFdBQVcsQ0FBQyxLQUFVO1lBQ2xCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLElBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUM7Z0JBQ1YsTUFBTSxJQUFJLFVBQUEsT0FBTyxFQUFFLENBQUM7WUFDeEIsQ0FBQztZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsUUFBUTtZQUNKLElBQUksR0FBRyxHQUFVLENBQUUsSUFBSSxDQUFFLENBQUM7WUFDMUIsS0FBSSxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFDLENBQUM7Z0JBQzlCLElBQUcsS0FBSyxZQUFZLEtBQUssRUFBQyxDQUFDO29CQUN2QixHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztxQkFDRyxDQUFDO29CQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7WUFDTCxDQUFDO1lBRUQsT0FBTyxHQUFHLENBQUM7UUFDZixDQUFDO1FBRUQsVUFBVTtZQUNOLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM1QixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsY0FBYyxDQUFDLEVBQVc7WUFDdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQsQ0FBQyxDQUFDLEVBQVc7WUFDVCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVELFNBQVMsQ0FBQyxFQUFXO1lBQ2pCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM1QixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxLQUFLO1lBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDSjtJQWxHWSxlQUFLLFFBa0dqQixDQUFBO0lBRUQsTUFBYSxJQUFLLFNBQVEsS0FBSztRQUMzQixNQUFNLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQztRQUM5QixNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUVuQixTQUFTLENBQVU7UUFFbkIsWUFBWSxJQUFxRDtZQUM3RCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUV6QyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUU5QixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVELFVBQVU7WUFDTixJQUFJLFNBQVMsR0FBWSxFQUFFLENBQUM7WUFFNUIsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUMsQ0FBQztnQkFDMUIsU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDdkQsQ0FBQztZQUVELElBQUksS0FBMEIsQ0FBQztZQUMvQixJQUFJLE1BQTJCLENBQUM7WUFFaEMsSUFBRyxJQUFJLENBQUMsS0FBSyxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN4QixVQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixDQUFDO2lCQUNHLENBQUM7Z0JBQ0QsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUMsQ0FBQztvQkFDMUIsS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDZCxDQUFDO3FCQUNJLElBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxLQUFLLEVBQUMsQ0FBQztvQkFDN0IsS0FBSyxHQUFHLFVBQUEsR0FBRyxDQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDckYsQ0FBQztxQkFDSSxJQUFHLElBQUksQ0FBQyxTQUFTLElBQUksUUFBUSxFQUFDLENBQUM7b0JBQ2hDLEtBQUssR0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDekIsVUFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkMsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEMsQ0FBQztpQkFDRyxDQUFDO2dCQUNELElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDLENBQUM7b0JBQzFCLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ2YsQ0FBQztxQkFDSSxJQUFHLElBQUksQ0FBQyxTQUFTLElBQUksS0FBSyxFQUFDLENBQUM7b0JBQzdCLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxDQUFDO3FCQUNJLElBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxRQUFRLEVBQUMsQ0FBQztvQkFDaEMsTUFBTSxHQUFHLFVBQUEsR0FBRyxDQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDdEYsQ0FBQztZQUNMLENBQUM7WUFFRCxJQUFHLEtBQUssSUFBSSxTQUFTLElBQUksTUFBTSxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUMxQyxNQUFNLElBQUksVUFBQSxPQUFPLEVBQUUsQ0FBQztZQUN4QixDQUFDO1lBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQUEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU3RSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUVELE1BQU0sQ0FBQyxDQUFVLEVBQUUsQ0FBVSxFQUFFLElBQVcsRUFBRSxJQUFhO1lBQ3JELEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFL0IsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUMzQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQzNCLElBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxLQUFLLEVBQUMsQ0FBQztnQkFFeEIsS0FBSSxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQztvQkFDL0MsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBRTdELE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUMvQyxDQUFDO1lBQ0wsQ0FBQztpQkFDSSxJQUFHLElBQUksQ0FBQyxTQUFTLElBQUksUUFBUSxFQUFDLENBQUM7Z0JBRWhDLEtBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUM7b0JBQy9DLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUU3RCxPQUFPLElBQUksS0FBSyxDQUFDLE9BQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDL0MsQ0FBQztZQUNMLENBQUM7aUJBQ0csQ0FBQztnQkFDRCxNQUFNLElBQUksVUFBQSxPQUFPLEVBQUUsQ0FBQztZQUN4QixDQUFDO1FBQ0wsQ0FBQzs7SUEzRlEsY0FBSSxPQTRGaEIsQ0FBQTtJQUVELE1BQWEsU0FBVSxTQUFRLEVBQUU7UUFDN0IsR0FBRyxDQUFzQjtRQUN6QixJQUFJLENBQVE7UUFDWixLQUFLLENBQTBEO1FBRS9ELFlBQVksSUFBa0U7WUFDMUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBRXhCLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBSSxHQUFHLENBQUM7WUFHN0IsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Z0JBQ2QsU0FBUyxFQUFHLFFBQVE7Z0JBQ3BCLFFBQVEsRUFBRyxJQUFJLENBQUMsUUFBUTthQUMzQixDQUFDLENBQUM7WUFFSCxLQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUMsQ0FBQztnQkFDOUIsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQWUsRUFBQyxFQUFFO29CQUN0RCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMxRCxLQUFJLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBQyxDQUFDO3dCQUVuQixHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2hCLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUE7WUFDTixDQUFDO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUvQixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELElBQUk7WUFDQSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEIsQ0FBQztRQUVELElBQUksQ0FBQyxFQUFlO1lBQ2hCLFVBQVUsQ0FBQyxHQUFFLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDO2dCQUV6RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBRXRDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQztnQkFDNUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFJLEdBQUcsRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDO1lBRWhELENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRUQsS0FBSztZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUNKO0lBMURZLG1CQUFTLFlBMERyQixDQUFBO0lBRUQsTUFBYSxJQUFLLFNBQVEsS0FBSztRQUMzQixPQUFPLENBQWE7UUFDcEIsSUFBSSxDQUFhO1FBRWpCLFNBQVMsR0FBYyxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUFhO1FBRXBCLE9BQU8sR0FBWSxHQUFHLENBQUM7UUFDdkIsT0FBTyxHQUFZLEdBQUcsQ0FBQztRQUV2QixZQUFZLElBQW1FO1lBQzNFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFFMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxDQUFDO1lBRUQsSUFBRyxJQUFJLENBQUMsSUFBSSxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUV2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JDLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQVk7WUFDZixVQUFBLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDckQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVELFlBQVksQ0FBQyxHQUFZO1lBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRUQsU0FBUyxDQUFDLEdBQVk7WUFDbEIsVUFBQSxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE9BQU8sVUFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkcsQ0FBQztRQUVELGFBQWEsQ0FBQyxHQUFZO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsV0FBVztZQUNQLE1BQU0sT0FBTyxHQUFHLFVBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsS0FBSSxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFLLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQztnQkFDMUMsSUFBRyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUM7b0JBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzlCLENBQUM7cUJBQ0ksSUFBRyxHQUFHLElBQUksTUFBTSxFQUFDLENBQUM7b0JBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxDQUFDO1lBQ0wsQ0FBQztZQUVELE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7UUFFRCxVQUFVO1lBQ04sSUFBSSxLQUFjLENBQUM7WUFFbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5RCxVQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFbkUsSUFBRyxJQUFJLENBQUMsS0FBSyxJQUFJLFNBQVMsRUFBQyxDQUFDO2dCQUN4QixVQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixDQUFDO2lCQUNHLENBQUM7Z0JBRUQsSUFBRyxJQUFJLENBQUMsT0FBTyxJQUFJLFNBQVMsRUFBQyxDQUFDO29CQUUxQixLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztxQkFDRyxDQUFDO29CQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXhELEtBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUM7d0JBQzVDLElBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDOzRCQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDckMsQ0FBQzs2QkFDRyxDQUFDOzRCQUNELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFFLENBQUM7NEJBQ2pGLElBQUcsR0FBRyxJQUFJLE1BQU0sRUFBQyxDQUFDO2dDQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDOzRCQUNwQyxDQUFDO2lDQUNJLElBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDO2dDQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ2pELENBQUM7aUNBQ0csQ0FBQztnQ0FDRCxNQUFNLElBQUksVUFBQSxPQUFPLEVBQUUsQ0FBQzs0QkFDeEIsQ0FBQzt3QkFDTCxDQUFDO29CQUNMLENBQUM7b0JBRUQsS0FBSyxHQUFHLFVBQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDaEMsQ0FBQztZQUNMLENBQUM7WUFFRCxJQUFJLE1BQWUsQ0FBQztZQUVwQixJQUFHLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ3pCLFVBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLFVBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUUsTUFBTSxDQUFFLENBQUM7WUFDOUIsQ0FBQztpQkFDRyxDQUFDO2dCQUVELElBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxTQUFTLEVBQUMsQ0FBQztvQkFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDO29CQUNuRSxNQUFNLEdBQUcsVUFBQSxHQUFHLENBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBRSxDQUFFO2dCQUNsQyxDQUFDO3FCQUNHLENBQUM7b0JBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBRWxDLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO29CQUN6QixLQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBQyxDQUFDO3dCQUMxQyxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQzs0QkFFbkIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUUsQ0FBQzs0QkFDaEYsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQzFELENBQUM7b0JBQ0wsQ0FBQztvQkFFRCxNQUFNLEdBQUcsVUFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLGdCQUFnQixDQUFDO2dCQUNsRCxDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxVQUFBLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUM7UUFFRCxNQUFNLENBQUMsQ0FBVSxFQUFFLENBQVUsRUFBRSxJQUFXLEVBQUUsSUFBYTtZQUNyRCxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRS9CLElBQUksTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRELElBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDMUIsTUFBTSxHQUFHLENBQUUsSUFBSSxDQUFDLENBQUMsQ0FBRSxDQUFDO1lBQ3hCLENBQUM7aUJBQ0csQ0FBQztnQkFDRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLEtBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUM7b0JBQzVDLElBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksTUFBTSxFQUFDLENBQUM7d0JBQ3BDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNuQyxXQUFXLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDdkMsQ0FBQztnQkFDTCxDQUFDO2dCQUVELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO2dCQUM3QyxLQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBQyxDQUFDO29CQUM1QyxJQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQzt3QkFDbEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFJLGVBQWUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hELENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7WUFHRCxJQUFHLElBQUksQ0FBQyxJQUFJLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUN2RSxDQUFDO2lCQUNHLENBQUM7Z0JBQ0QsSUFBRyxJQUFJLENBQUMsT0FBTyxJQUFJLFNBQVMsRUFBQyxDQUFDO29CQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEMsQ0FBQztnQkFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRCxLQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBQyxDQUFDO29CQUV6QyxJQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQzt3QkFFbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7b0JBQ3JELENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7WUFFRCxJQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsRUFBQyxDQUFDO2dCQUN0QyxVQUFBLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFFLFdBQVcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RJLENBQUM7WUFFRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDWixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDaEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztZQUNoQixLQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUMsQ0FBQztnQkFDOUIsSUFBSSxXQUFvQixDQUFDO2dCQUN6QixJQUFHLEtBQUssQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFDLENBQUM7b0JBQ25CLFdBQVcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2xDLENBQUM7cUJBQ0csQ0FBQztvQkFDRCxXQUFXLEdBQUcsVUFBQSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO2dCQUNyRSxDQUFDO2dCQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLFVBQUEsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBRSxDQUFDO2dCQUVwRixJQUFHLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUMsQ0FBQztvQkFFeEMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDM0IsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUM7Z0JBQzdCLENBQUM7cUJBQ0csQ0FBQztvQkFDRCxPQUFPLEdBQUssQ0FBQyxDQUFDO29CQUNkLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUU3QixPQUFPLEdBQUcsQ0FBQyxDQUFDO29CQUNaLEdBQUcsRUFBRSxDQUFDO2dCQUNWLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUdELGdCQUFnQjtZQUNaLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUUvQixJQUFJLENBQVUsQ0FBQztZQUNmLElBQUksQ0FBVSxDQUFDO1lBRWYsSUFBRyxJQUFJLENBQUMsT0FBTyxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDO2dCQUVyRSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQzNCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixDQUFDO2lCQUNHLENBQUM7Z0JBRUQsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsQ0FBQztZQUVELElBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQztnQkFFL0QsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO2dCQUM1QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsQ0FBQztpQkFDRyxDQUFDO2dCQUVELENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELENBQUM7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7S0FDSjtJQWhQWSxjQUFJLE9BZ1BoQixDQUFBO0lBRUQsTUFBYSxhQUFjLFNBQVEsSUFBSTtRQUNuQyxhQUFhLEdBQVksR0FBRyxDQUFDO1FBQzdCLGdCQUFnQixDQUF5QjtRQUV6QyxZQUFZLElBQXlJO1lBQ2pKLElBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFDLENBQUM7Z0JBQ3hDLElBQVksQ0FBQyxJQUFJLEdBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckUsQ0FBQztpQkFDRyxDQUFDO2dCQUNBLElBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVaLElBQUcsSUFBSSxDQUFDLGFBQWEsSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQzVDLENBQUM7WUFFRCxJQUFHLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFFbkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztZQUNsRCxDQUFDO1lBRUQsS0FBSSxNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQztnQkFDNUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQWUsRUFBQyxFQUFFO29CQUNuRCxVQUFBLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxHQUFHLENBQUMsQ0FBQztvQkFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7b0JBQ3pCLElBQUcsSUFBSSxDQUFDLGdCQUFnQixJQUFJLFNBQVMsRUFBQyxDQUFDO3dCQUNuQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQy9CLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1FBQ0wsQ0FBQztRQUVELFFBQVE7WUFDSixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFakIsaURBQWlEO1lBQ2pELElBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUNKO0lBM0NZLHVCQUFhLGdCQTJDekIsQ0FBQTtJQUVELE1BQWEsTUFBTyxTQUFRLEVBQUU7UUFDMUIsR0FBRyxDQUFrQjtRQUNyQixPQUFPLENBQU07UUFFYixZQUFZLElBQThCO1lBQ3RDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUU1QixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUksR0FBRyxDQUFDO1lBRTdCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRUQsSUFBSTtZQUNBLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNwQixDQUFDO1FBRUQsS0FBSyxDQUFDLENBQVUsRUFBRSxDQUFVO1lBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBSSxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3pDLENBQUM7UUFFRCxTQUFTLENBQUMsS0FBUyxFQUFFLEtBQVM7WUFDMUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVuQyxxREFBcUQ7WUFDckQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztZQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBRTNDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxHQUFHLEtBQUssSUFBSSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBSSxHQUFHLEtBQUssSUFBSSxDQUFDO1FBQzdDLENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxVQUFBLFFBQVEsQ0FBQztRQUM5QyxDQUFDO1FBRUQsS0FBSztZQUNELFVBQUEsUUFBUSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDeEIsVUFBQSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDcEMsQ0FBQztRQUVELFNBQVM7WUFDVDs7Ozs7O2NBTUU7WUFDRSxJQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLFVBQUEsUUFBUSxFQUFDLENBQUM7Z0JBRW5DLFVBQUEsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXJCLFVBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3JDLENBQUM7S0FDSjtJQTlEWSxnQkFBTSxTQThEbEIsQ0FBQTtJQUVELE1BQWEsR0FBSSxTQUFRLEVBQUU7UUFDdkIsTUFBTSxDQUFDLEdBQUcsQ0FBTztRQUVqQixHQUFHLENBQXFCO1FBQ3hCLEdBQUcsQ0FBa0I7UUFDckIsS0FBSyxHQUFZLEVBQUUsQ0FBQztRQUNwQixRQUFRLEdBQVksRUFBRSxDQUFDO1FBQ3ZCLEtBQUssR0FBWSxDQUFDLENBQUM7UUFFbkIsTUFBTSxDQUFDLElBQUk7WUFDUCxJQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ3JCLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUcsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFLE1BQU0sRUFBRyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzVHLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFhO1lBQ3BCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNYLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBZTtZQUN2QixJQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBQyxDQUFDO2dCQUVqQixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN4QixDQUFDO2lCQUNHLENBQUM7Z0JBRUQsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVYLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsSUFBSSxDQUFDO2dCQUM5RCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2QixDQUFDO1FBQ0wsQ0FBQztRQUVELFlBQVksSUFBVztZQUNuQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDWixJQUFHLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFDLENBQUM7Z0JBQ3BELE1BQU0sSUFBSSxVQUFBLE9BQU8sRUFBRSxDQUFDO1lBQ3hCLENBQUM7WUFFRCxNQUFNLFFBQVEsR0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFckMsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFJLEdBQUcsUUFBUSxJQUFJLENBQUM7WUFDeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsU0FBUyxJQUFJLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUksR0FBRyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFFNUIsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBSSxNQUFNLENBQUM7WUFDMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQzFCLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQTtZQUMzQixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7WUFFeEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBSSxNQUFNLENBQUM7WUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUUvQixHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELElBQUk7WUFDQSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEIsQ0FBQztRQUVELE9BQU8sQ0FBQyxJQUFhO1lBQ2pCLElBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUMsQ0FBQztnQkFDdEIsSUFBRyxJQUFJLElBQUksRUFBRSxFQUFDLENBQUM7b0JBRVgsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUViLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDO2dCQUNoRSxDQUFDO1lBQ0wsQ0FBQztpQkFDRyxDQUFDO2dCQUNELElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUVyQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBRTlDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUF6RlksYUFBRyxNQXlGZixDQUFBO0lBRUQsTUFBYSxNQUFNO1FBQ2YsTUFBTSxDQUFDLElBQUksQ0FBUTtRQUVuQixNQUFNLENBQUMsVUFBVSxDQUFDLElBQVc7WUFDekIsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFFbkIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUUvQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBWSxFQUFDLEVBQUU7Z0JBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztZQUVILFVBQUEsUUFBUSxHQUFHLFVBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7S0FDSjtJQWZZLGdCQUFNLFNBZWxCLENBQUE7SUFFRCxTQUFnQixRQUFRLENBQUMsTUFBZSxFQUFFLElBQWEsRUFBRSxJQUFXO1FBQ2hFLGlDQUFpQztRQUNqQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV0RCw4QkFBOEI7UUFDOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQztRQUV4QyxvQkFBb0I7UUFDcEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUUxQixDQUFDO0lBVmUsa0JBQVEsV0FVdkIsQ0FBQTtJQUVELFNBQWdCLE1BQU0sQ0FBQyxJQUErQjtRQUNsRCxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBVyxDQUFDO0lBQy9DLENBQUM7SUFGZSxnQkFBTSxTQUVyQixDQUFBO0lBRUQsU0FBZ0IsV0FBVyxDQUFDLElBQXdEO1FBQ2hGLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFlLENBQUM7SUFDdkQsQ0FBQztJQUZlLHFCQUFXLGNBRTFCLENBQUE7SUFFRCxTQUFnQixZQUFZLENBQUMsSUFBd0Q7UUFDakYsT0FBTyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQWdCLENBQUM7SUFDekQsQ0FBQztJQUZlLHNCQUFZLGVBRTNCLENBQUE7SUFFRCxTQUFnQixhQUFhLENBQUMsSUFBd0c7UUFDbEksT0FBTyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQWlCLENBQUM7SUFDM0QsQ0FBQztJQUZlLHVCQUFhLGdCQUU1QixDQUFBO0lBRUQsU0FBZ0IsWUFBWSxDQUFDLElBQXdHO1FBQ2pJLE9BQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFnQixDQUFDO0lBQ3pELENBQUM7SUFGZSxzQkFBWSxlQUUzQixDQUFBO0lBRUQsU0FBZ0IsU0FBUyxDQUFDLElBQXdEO1FBQzlFLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFjLENBQUM7SUFDckQsQ0FBQztJQUZlLG1CQUFTLFlBRXhCLENBQUE7SUFFRCxTQUFnQixTQUFTLENBQUMsSUFBaUg7UUFDdkksT0FBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQWMsQ0FBQztJQUNyRCxDQUFDO0lBRmUsbUJBQVMsWUFFeEIsQ0FBQTtJQUVELFNBQWdCLElBQUksQ0FBQyxJQUE0RTtRQUM3RixPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBUyxDQUFDO0lBQzNDLENBQUM7SUFGZSxjQUFJLE9BRW5CLENBQUE7SUFFRCxTQUFnQixPQUFPLENBQUMsSUFBNkY7UUFDakgsT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQVksQ0FBQztJQUNqRCxDQUFDO0lBRmUsaUJBQU8sVUFFdEIsQ0FBQTtJQUVELFNBQWdCLE9BQU8sQ0FBQyxJQUErQztRQUNuRSxPQUFPLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBWSxDQUFDO0lBQ2pELENBQUM7SUFGZSxpQkFBTyxVQUV0QixDQUFBO0lBRUQsU0FBZ0IsTUFBTSxDQUFDLElBQThGO1FBQ2pILE9BQU8sSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFpQixDQUFDO0lBQzNELENBQUM7SUFGZSxnQkFBTSxTQUVyQixDQUFBO0lBRUQsU0FBZ0IsUUFBUSxDQUFDLElBQStCO1FBQ3BELE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFhLENBQUM7SUFDbkQsQ0FBQztJQUZlLGtCQUFRLFdBRXZCLENBQUE7SUFFRCxTQUFnQixNQUFNLENBQUMsSUFBNEQ7UUFDL0UsT0FBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQWMsQ0FBQztJQUNyRCxDQUFDO0lBRmUsZ0JBQU0sU0FFckIsQ0FBQTtJQUVELFNBQWdCLE1BQU0sQ0FBQyxJQUFpQztRQUNwRCxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBVyxDQUFDO0lBQy9DLENBQUM7SUFGZSxnQkFBTSxTQUVyQixDQUFBO0lBRUQsU0FBZ0IsS0FBSyxDQUFDLElBQW1FO1FBQ3JGLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFVLENBQUM7SUFDN0MsQ0FBQztJQUZlLGVBQUssUUFFcEIsQ0FBQTtJQUVELFNBQWdCLFVBQVUsQ0FBQyxJQUF5STtRQUNoSyxPQUFPLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBbUIsQ0FBQztJQUMvRCxDQUFDO0lBRmUsb0JBQVUsYUFFekIsQ0FBQTtJQUVELFNBQWdCLEtBQUssQ0FBQyxJQUFxRDtRQUN2RSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBVSxDQUFDO0lBQzdDLENBQUM7SUFGZSxlQUFLLFFBRXBCLENBQUE7SUFFRCxTQUFnQixNQUFNLENBQUMsSUFBcUg7UUFDeEksT0FBTyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQWUsQ0FBQztJQUN2RCxDQUFDO0lBRmUsZ0JBQU0sU0FFckIsQ0FBQTtJQUVELFNBQWdCLE9BQU8sQ0FBQyxJQUE2RDtRQUNqRixPQUFPLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBWSxDQUFDO0lBQ2pELENBQUM7SUFGZSxpQkFBTyxVQUV0QixDQUFBO0lBRUQsU0FBZ0IsT0FBTyxDQUFDLElBQWdFO1FBQ3BGLE9BQU8sSUFBSSxVQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQVksQ0FBQztJQUNqRCxDQUFDO0lBRmUsaUJBQU8sVUFFdEIsQ0FBQTtBQUVELENBQUMsRUFoa0RTLFNBQVMsS0FBVCxTQUFTLFFBZ2tEbEI7QUNoa0RELElBQVUsU0FBUyxDQXNHbEI7QUF0R0QsV0FBVSxTQUFTO0lBQ25CLEVBQUU7SUFFRixNQUFhLE1BQU8sU0FBUSxVQUFBLEVBQUU7UUFDMUIsR0FBRyxDQUFrQjtRQUNyQixHQUFHLENBQW9CO1FBQ3ZCLGFBQWEsQ0FBa0M7UUFDL0MsTUFBTSxHQUFZLEVBQUUsQ0FBQztRQUVyQixZQUFZLElBQWdFO1lBQ3hFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUV4QyxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFVLE1BQU0sQ0FBQztZQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBTyxRQUFRLENBQUM7WUFFekMsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBSSxNQUFNLENBQUM7WUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztZQUVsQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFjLEVBQUMsRUFBRTtnQkFDckQsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNwQixVQUFBLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBYyxFQUFDLEVBQUU7Z0JBQ3BELGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO2dCQUVsQyxVQUFBLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBYyxFQUFDLEVBQUU7Z0JBQ3JELGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0QyxVQUFBLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFjLEVBQUMsRUFBRTtnQkFDdEQsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXRDLFVBQUEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNaLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUM7Z0JBQzNCLElBQUcsRUFBRSxJQUFJLElBQUksRUFBQyxDQUFDO29CQUNYLE9BQU87Z0JBQ1gsQ0FBQztnQkFFRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFbkMsVUFBQSxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUVoQixJQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDLENBQUM7b0JBQ2xCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFdEIsSUFBRyxJQUFJLENBQUMsSUFBSSxJQUFJLFdBQVcsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLFlBQVksRUFBQyxDQUFDO3dCQUV0RCxVQUFBLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUUzQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDakQsQ0FBQzt5QkFDRyxDQUFDO3dCQUNELFVBQUEsR0FBRyxDQUFDLGNBQWMsSUFBSSxDQUFDLElBQUksZ0JBQWdCLElBQUksQ0FBQyxJQUFJLGdCQUFnQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDckYsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRUQsSUFBSTtZQUNBLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNwQixDQUFDO1FBRUQsU0FBUyxDQUFDLEdBQVk7WUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUksR0FBRyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxRQUFRO1lBQ0osSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUksRUFBRSxDQUFDO1FBQ3RCLENBQUM7S0FDSjtJQWxGWSxnQkFBTSxTQWtGbEIsQ0FBQTtJQUVELFNBQVMsZUFBZSxDQUFDLEVBQVk7UUFDakMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3BCLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsU0FBZ0IsUUFBUTtRQUNwQixJQUFHLFVBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksTUFBTSxFQUFDLENBQUM7WUFDakMsVUFBQSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDaEMsVUFBQSxRQUFRLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUN4QixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQVJlLGtCQUFRLFdBUXZCLENBQUE7QUFFRCxDQUFDLEVBdEdTLFNBQVMsS0FBVCxTQUFTLFFBc0dsQjtBQ3RHRCxJQUFVLFNBQVMsQ0F3SWxCO0FBeElELFdBQVUsU0FBUztJQUNuQixFQUFFO0lBQ0YsU0FBZ0IsVUFBVTtRQUN0QixNQUFNLENBQUUsTUFBTSxFQUFFLEFBQUQsRUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUV6QyxNQUFNLFFBQVEsR0FBRyxVQUFBLE1BQU0sQ0FBQztZQUNwQixRQUFRLEVBQUc7Z0JBQ1AsVUFBQSxPQUFPLENBQUM7b0JBQ0osS0FBSyxFQUFHLE1BQU07b0JBQ2QsTUFBTSxFQUFHLE1BQU07b0JBQ2YsR0FBRyxFQUFHLEdBQUcsTUFBTSxpQ0FBaUM7aUJBQ25ELENBQUM7Z0JBRUYsVUFBQSxPQUFPLENBQUM7b0JBQ0osS0FBSyxFQUFHLE1BQU07b0JBQ2QsTUFBTSxFQUFHLE1BQU07b0JBQ2YsR0FBRyxFQUFHLEdBQUcsTUFBTSw4QkFBOEI7aUJBQ2hELENBQUM7Z0JBRUYsVUFBQSxPQUFPLENBQUM7b0JBQ0osS0FBSyxFQUFHLE1BQU07b0JBQ2QsTUFBTSxFQUFHLE1BQU07b0JBQ2YsR0FBRyxFQUFHLEdBQUcsTUFBTSx5QkFBeUI7aUJBQzNDLENBQUM7YUFDTDtTQUNKLENBQUMsQ0FBQztRQUVILE1BQU0sU0FBUyxHQUFHLFVBQUEsTUFBTSxDQUFDO1lBQ3JCLFNBQVMsRUFBRyxRQUFRO1lBQ3BCLFFBQVEsRUFBRztnQkFDUCxVQUFBLE9BQU8sQ0FBQztvQkFDSixJQUFJLEVBQUcsS0FBSztpQkFDZixDQUFDO2dCQUVGLFVBQUEsT0FBTyxDQUFDO29CQUNKLElBQUksRUFBRyxNQUFNO2lCQUNoQixDQUFDO2dCQUVGLFVBQUEsT0FBTyxDQUFDO29CQUNKLElBQUksRUFBRyxPQUFPO2lCQUNqQixDQUFDO2FBQ0w7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksR0FBRyxVQUFBLEtBQUssQ0FBQztZQUNmLElBQUksRUFBTyxnQkFBZ0I7WUFDM0IsUUFBUSxFQUFDO2dCQUNMLFVBQUEsTUFBTSxDQUFDO29CQUNILFFBQVEsRUFBRyxFQUFFO2lCQUNoQixDQUFDO2dCQUVGLFVBQUEsS0FBSyxDQUFDO29CQUNGLE9BQU8sRUFBSSxTQUFTO29CQUNwQixRQUFRLEVBQUU7d0JBQ04sVUFBQSxNQUFNLENBQUM7NEJBQ0gsUUFBUSxFQUFHO2dDQUNQLFVBQUEsU0FBUyxDQUFDO29DQUNOLElBQUksRUFBRyxNQUFNO2lDQUNoQixDQUFDOzZCQUNMO3lCQUNKLENBQUM7d0JBRUYsVUFBQSxNQUFNLENBQUM7NEJBQ0gsUUFBUSxFQUFHO2dDQUNQLFVBQUEsT0FBTyxDQUFDO29DQUNKLElBQUksRUFBRyxNQUFNO29DQUNiLEtBQUssRUFBRyxLQUFLLEVBQUUsRUFBYSxFQUFDLEVBQUUsR0FBQyxDQUFDO2lDQUNwQyxDQUFDOzZCQUNMO3lCQUNKLENBQUM7cUJBQ0w7aUJBQ0osQ0FBQztnQkFFRixVQUFBLEtBQUssQ0FBQztvQkFDRixPQUFPLEVBQUksb0JBQW9CO29CQUUvQixRQUFRLEVBQUc7d0JBQ1AsVUFBQSxNQUFNLENBQUM7NEJBQ0gsUUFBUSxFQUFHO2dDQUNQLFVBQUEsTUFBTSxDQUFDO29DQUNILEtBQUssRUFBRyxFQUFFO29DQUNWLEtBQUssRUFBRyxFQUFFO29DQUNWLEtBQUssRUFBRyxNQUFNO29DQUNkLE1BQU0sRUFBRyxNQUFNO29DQUNmLEdBQUcsRUFBRyxHQUFHLE1BQU0sOEJBQThCO2lDQUNoRCxDQUFDO2dDQUVGLFVBQUEsTUFBTSxDQUFDO29DQUNILEtBQUssRUFBRyxFQUFFO29DQUNWLEtBQUssRUFBRyxFQUFFO29DQUNWLEtBQUssRUFBRyxNQUFNO29DQUNkLE1BQU0sRUFBRyxNQUFNO29DQUNmLEdBQUcsRUFBRyxHQUFHLE1BQU0sMEJBQTBCO2lDQUM1QyxDQUFDOzZCQUNMO3lCQUNKLENBQUM7d0JBRUYsVUFBQSxNQUFNLENBQUM7NEJBQ0gsUUFBUSxFQUFHO2dDQUNQLFVBQUEsT0FBTyxDQUFDO29DQUNKLEVBQUUsRUFBRyxlQUFlO29DQUNwQixLQUFLLEVBQUcsTUFBTTtvQ0FDZCxNQUFNLEVBQUcsTUFBTTtvQ0FDZixHQUFHLEVBQUcsR0FBRyxNQUFNLHlCQUF5QjtvQ0FDeEMsS0FBSyxFQUFHLEtBQUssRUFBRSxFQUFlLEVBQUMsRUFBRTt3Q0FDN0IsVUFBQSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3Q0FDdEIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztvQ0FDdkIsQ0FBQztpQ0FDSixDQUFDO2dDQUVGLFVBQUEsT0FBTyxDQUFDO29DQUNKLEtBQUssRUFBRyxNQUFNO29DQUNkLE1BQU0sRUFBRyxNQUFNO29DQUNmLEdBQUcsRUFBRyxHQUFHLE1BQU0sOEJBQThCO29DQUM3QyxLQUFLLEVBQUcsS0FBSyxFQUFFLEVBQWUsRUFBQyxFQUFFO3dDQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29DQUN0QixDQUFDO2lDQUNKLENBQUM7NkJBQ0w7eUJBQ0osQ0FBQzt3QkFFRixVQUFBLE1BQU0sQ0FBQzs0QkFDSCxRQUFRLEVBQUcsRUFBRTt5QkFDaEIsQ0FBQzt3QkFFRixVQUFBLE1BQU0sQ0FBQzs0QkFDSCxRQUFRLEVBQUcsRUFBRTt5QkFDaEIsQ0FBQztxQkFDTDtpQkFDSixDQUFDO2FBQ0w7U0FDSixDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBcEllLG9CQUFVLGFBb0l6QixDQUFBO0FBRUQsQ0FBQyxFQXhJUyxTQUFTLEtBQVQsU0FBUyxRQXdJbEIiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgbGF5b3V0X3RzIHtcclxuLy9cclxuZXhwb3J0IGNvbnN0IHJlbW92ZSAgPSBpMThuX3RzLnJlbW92ZTtcclxuXHJcbmV4cG9ydCBjbGFzcyBWZWMyIHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4Om51bWJlciwgeTogbnVtYmVyKXtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0ICRkaWMgPSBuZXcgTWFwPHN0cmluZywgSFRNTEVsZW1lbnQ+KCk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJChpZCA6IHN0cmluZykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgZWxlID0gJGRpYy5nZXQoaWQpO1xyXG4gICAgaWYoZWxlID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgZWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpITtcclxuICAgICAgICAkZGljLnNldChpZCwgZWxlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZWxlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGRpdihpZCA6IHN0cmluZykgOiBIVE1MRGl2RWxlbWVudCB7XHJcbiAgICByZXR1cm4gJChpZCkgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkaW5wKGlkIDogc3RyaW5nKSA6IEhUTUxJbnB1dEVsZW1lbnQge1xyXG4gICAgcmV0dXJuICQoaWQpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkc2VsKGlkIDogc3RyaW5nKSA6IEhUTUxTZWxlY3RFbGVtZW50IHtcclxuICAgIHJldHVybiAkKGlkKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcclxufVxyXG4gICAgICAgIFxyXG5leHBvcnQgY2xhc3MgTXlFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICAgIGNvbnN0cnVjdG9yKHRleHQgOiBzdHJpbmcgPSBcIlwiKXtcclxuICAgICAgICBzdXBlcih0ZXh0KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChiIDogYm9vbGVhbiwgbXNnIDogc3RyaW5nID0gXCJcIil7XHJcbiAgICBpZighYil7XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IobXNnKTtcclxuICAgIH1cclxufSAgICBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtc2codHh0IDogc3RyaW5nKXtcclxuICAgIExvZy5sb2codHh0KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJhbmdlKG46IG51bWJlcikgOiBudW1iZXJbXXtcclxuICAgIHJldHVybiBbLi4uQXJyYXkobikua2V5cygpXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxhc3Q8VD4odiA6IEFycmF5PFQ+KSA6IFQge1xyXG4gICAgcmV0dXJuIHZbdi5sZW5ndGggLSAxXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZTxUPih2IDogQXJyYXk8VD4pIDogVFtdIHtcclxuICAgIGxldCBzZXQgPSBuZXcgU2V0PFQ+KCk7XHJcbiAgICBjb25zdCByZXQgOiBUW10gPSBbXTtcclxuICAgIGZvcihjb25zdCB4IG9mIHYpe1xyXG4gICAgICAgIGlmKCFzZXQuaGFzKHgpKXtcclxuICAgICAgICAgICAgc2V0LmFkZCh4KTtcclxuICAgICAgICAgICAgcmV0LnB1c2goeCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJldDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN1bSh2IDogbnVtYmVyW10pIDogbnVtYmVyIHtcclxuICAgIGFzc2VydCh2ICE9IHVuZGVmaW5lZCk7XHJcbiAgICBpZih2Lmxlbmd0aCA9PSAwKXtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHYucmVkdWNlKChhY2MsIGN1cikgPT4gYWNjICsgY3VyLCAwKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoVGV4dChmaWxlVVJMOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZmlsZVVSTCk7XHJcbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcG9uc2UhLnRleHQoKTtcclxuXHJcbiAgICByZXR1cm4gdGV4dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBzZXVkb0NvbG9yKG4gOiBudW1iZXIpIDogW251bWJlciwgbnVtYmVyLCBudW1iZXJdIHtcclxuICAgIG4gPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBuKSk7XHJcblxyXG4gICAgbGV0IHI6bnVtYmVyLCBnOm51bWJlciwgYjpudW1iZXI7XHJcblxyXG4gICAgaWYobiA8IDAuMjUpe1xyXG4gICAgICAgIGIgPSAxO1xyXG4gICAgICAgIGcgPSBuICogNDtcclxuICAgICAgICByID0gMDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYobiA8IDAuNSl7XHJcbiAgICAgICAgYiA9ICgwLjUgLSBuKSAqIDQ7XHJcbiAgICAgICAgZyA9IDE7XHJcbiAgICAgICAgciA9IDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKG4gPCAwLjc1KXtcclxuICAgICAgICBiID0gMDtcclxuICAgICAgICBnID0gMTtcclxuICAgICAgICByID0gKG4gLSAwLjUpICogNDtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgYiA9IDA7XHJcbiAgICAgICAgZyA9ICgxIC0gbikgKiA0O1xyXG4gICAgICAgIHIgPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbciwgZywgYl07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1JhZGlhbihkZWdyZWUgOiBudW1iZXIpIDogbnVtYmVyIHtcclxuICAgIHJldHVybiBkZWdyZWUgKiBNYXRoLlBJIC8gMTgwO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdG9EZWdyZWUocmFkaWFuIDogbnVtYmVyKSA6IG51bWJlciB7XHJcbiAgICByZXR1cm4gcmFkaWFuICogMTgwIC8gTWF0aC5QSTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluUmFuZ2Uoc3RhcnQgOiBudW1iZXIsIHRoZXRhIDogbnVtYmVyLCBlbmQgOiBudW1iZXIpIDogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBmID0gKHg6bnVtYmVyKT0+eyByZXR1cm4gMCA8PSB4ID8geCA6IDE4MCArIHggfTtcclxuXHJcbiAgICBbc3RhcnQgLCB0aGV0YSwgZW5kXSA9IFsgZihzdGFydCksIGYodGhldGEpLCBmKGVuZCldO1xyXG4gICAgWyB0aGV0YSwgZW5kIF0gPSBbIHRoZXRhIC0gc3RhcnQsIGVuZCAtIHN0YXJ0IF07XHJcblxyXG4gICAgY29uc3QgZyA9ICh4Om51bWJlcik9PnsgcmV0dXJuIDAgPD0geCA/IHggOiAzNjAgKyB4IH07XHJcbiAgICBbdGhldGEsIGVuZF0gPSBbIGcodGhldGEpLCBnKGVuZCldO1xyXG5cclxuICAgIGFzc2VydCgwIDw9IHRoZXRhICYmIDAgPD0gZW5kKTtcclxuICAgIHJldHVybiB0aGV0YSA8PSBlbmQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXIoc3JjX21pbiA6IG51bWJlciwgc3JjX3ZhbCA6IG51bWJlciwgc3JjX21heCA6IG51bWJlciwgZHN0X21pbiA6IG51bWJlciwgZHN0X21heCA6IG51bWJlcikgOiBudW1iZXIge1xyXG4gICAgY29uc3QgcmF0aW8gPSAoc3JjX3ZhbCAtIHNyY19taW4pIC8gKHNyY19tYXggLSBzcmNfbWluKTsgICAgXHJcbiAgICBjb25zdCBkc3RfdmFsID0gZHN0X21pbiArIHJhdGlvICogKGRzdF9tYXggLSBkc3RfbWluKTtcclxuXHJcbiAgICByZXR1cm4gZHN0X3ZhbDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBoeXNpY2FsU2l6ZSgpIHtcclxuICAgIGNvbnN0IHdpZHRoID0gd2luZG93LnNjcmVlbi53aWR0aDsgLy8gc2NyZWVuIHdpZHRoIGluIHBpeGVsc1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gd2luZG93LnNjcmVlbi5oZWlnaHQ7IC8vIHNjcmVlbiBoZWlnaHQgaW4gcGl4ZWxzXHJcbiAgICBjb25zdCBkcGkgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIDk2OyAvLyBhcHByb3hpbWF0ZSBEUElcclxuXHJcbiAgICBjb25zdCB3aWR0aF9jbSAgPSAod2lkdGggIC8gZHBpKSAqIDIuNTQ7XHJcbiAgICBjb25zdCBoZWlnaHRfY20gPSAoaGVpZ2h0IC8gZHBpKSAqIDIuNTQ7XHJcblxyXG4gICAgcmV0dXJuIHsgd2lkdGhfY20sIGhlaWdodF9jbSB9O1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEltZ0ZpbGUoaW1nIDogSFRNTEltYWdlRWxlbWVudCwgZmlsZSA6IEZpbGUpe1xyXG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICByZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2IDogUHJvZ3Jlc3NFdmVudDxGaWxlUmVhZGVyPik9PntcclxuICAgICAgICBpZihldi50YXJnZXQgIT0gbnVsbCl7XHJcblxyXG4gICAgICAgICAgICBpZih0eXBlb2YgZXYudGFyZ2V0LnJlc3VsdCA9PSBcInN0cmluZ1wiKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gZXYudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKGBsb2FkIGltZyBlcnJvcjogJHtmaWxlLm5hbWV9IHJlc3VsdDoke3R5cGVvZiBldi50YXJnZXQucmVzdWx0fWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcihgbG9hZCBpbWcgZXJyb3I6ICR7ZmlsZS5uYW1lfWApO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xyXG5cclxufVxyXG5cclxuXHJcbn1cclxuIiwibmFtZXNwYWNlIGxheW91dF90cyB7XHJcbi8vXHJcbnR5cGUgTW91c2VFdmVudENhbGxiYWNrID0gKGV2IDogTW91c2VFdmVudCk9PlByb21pc2U8dm9pZD47XHJcbnR5cGUgRXZlbnRDYWxsYmFjayA9IChldiA6IEV2ZW50KT0+UHJvbWlzZTx2b2lkPjtcclxuXHJcbmV4cG9ydCBjb25zdCBmZ0NvbG9yID0gXCJ3aGl0ZVwiO1xyXG5leHBvcnQgY29uc3QgYmdDb2xvciA9IFwiIzAwMzAwMFwiO1xyXG4vLyBleHBvcnQgY29uc3QgYmdDb2xvciA9IFwiYmxhY2tcIjtcclxuXHJcbmV4cG9ydCBsZXQgbW9kYWxEbGcgOiBIVE1MRGl2RWxlbWVudDtcclxuXHJcbmNvbnN0IEFwcE1vZGUgPSBpMThuX3RzLkFwcE1vZGU7XHJcblxyXG5jb25zdCBUZXh0U2l6ZUZpbGwgPSA4O1xyXG5jb25zdCBpbnB1dFBhZGRpbmcgPSA0O1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJvZHlPbkxvYWQoKXtcclxuICAgIGF3YWl0IGkxOG5fdHMuaW5pdEkxOG4oKTtcclxuXHJcbiAgICBjb25zdCByb290ID0gbWFrZVRlc3RVSSgpO1xyXG4gICAgTGF5b3V0LmluaXRMYXlvdXQocm9vdCk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByYXRpbyh3aWR0aCA6IHN0cmluZykgOiBudW1iZXIge1xyXG4gICAgd2lkdGggPSB3aWR0aC50cmltKCk7XHJcbiAgICBhc3NlcnQod2lkdGguZW5kc1dpdGgoXCIlXCIpKTtcclxuICAgIGNvbnN0IG51bV9zdHIgPSB3aWR0aC5zdWJzdHJpbmcoMCwgd2lkdGgubGVuZ3RoIC0gMSk7XHJcblxyXG4gICAgY29uc3QgbnVtID0gcGFyc2VGbG9hdChudW1fc3RyKTtcclxuXHJcbiAgICByZXR1cm4gbnVtIC8gMTAwO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcGl4ZWwobGVuZ3RoIDogc3RyaW5nLCAgcmVtYWluaW5nX2xlbmd0aD8gOiBudW1iZXIpIDogbnVtYmVyIHtcclxuICAgIGlmKGxlbmd0aCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGlmKGxlbmd0aC5lbmRzV2l0aChcInB4XCIpKXtcclxuICAgICAgICAgICAgY29uc3QgbnVtX3N0ciA9IGxlbmd0aC5zdWJzdHJpbmcoMCwgbGVuZ3RoLmxlbmd0aCAtIDIpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobnVtX3N0cik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYobGVuZ3RoLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgIGlmKHJlbWFpbmluZ19sZW5ndGggIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiByYXRpbyhsZW5ndGgpICogcmVtYWluaW5nX2xlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxufVxyXG5cclxuZW51bSBPcmllbnRhdGlvbiB7XHJcbiAgICBob3Jpem9udGFsLFxyXG4gICAgdmVydGljYWwsXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQXR0ciB7XHJcbiAgICBpZD8gOiBzdHJpbmc7XHJcbiAgICBjbGFzc05hbWU/IDogc3RyaW5nO1xyXG4gICAgcGFyZW50PyA6IEJsb2NrO1xyXG4gICAgb2JqPyA6IGFueTtcclxuICAgIG5hbWU/IDogc3RyaW5nO1xyXG4gICAgcG9zaXRpb24/IDogc3RyaW5nO1xyXG4gICAgbWFyZ2luPyA6IHN0cmluZztcclxuICAgIGNvbG9yPyA6IHN0cmluZztcclxuICAgIGJhY2tncm91bmRDb2xvcj8gOiBzdHJpbmc7XHJcbiAgICBib3JkZXJTdHlsZT8gOiBzdHJpbmc7XHJcbiAgICBib3JkZXJXaWR0aD8gOiBudW1iZXI7XHJcbiAgICBwYWRkaW5nPyA6IG51bWJlcjtcclxuICAgIHBhZGRpbmdMZWZ0PyA6IHN0cmluZztcclxuICAgIHZlcnRpY2FsQWxpZ24/IDogc3RyaW5nO1xyXG4gICAgaG9yaXpvbnRhbEFsaWduPyA6IHN0cmluZztcclxuICAgIHRleHRBbGlnbj8gOiBzdHJpbmc7XHJcbiAgICBmb250U2l6ZT8gOiBzdHJpbmc7XHJcbiAgICBjb2xzcGFuPyA6IG51bWJlcjtcclxuICAgIHdpZHRoPyA6IHN0cmluZztcclxuICAgIGhlaWdodD8gOiBzdHJpbmc7XHJcbiAgICBkaXNhYmxlZD8gOiBib29sZWFuO1xyXG4gICAgdmlzaWJpbGl0eT8gOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBVSSB7XHJcbiAgICBzdGF0aWMgY291bnQgOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGlkeCA6IG51bWJlcjtcclxuICAgIGlkPyA6IHN0cmluZztcclxuICAgIGNsYXNzTmFtZT8gOiBzdHJpbmc7XHJcbiAgICBwYXJlbnQ/IDogQmxvY2s7XHJcbiAgICBvYmo/IDogYW55O1xyXG4gICAgbmFtZT8gOiBzdHJpbmc7XHJcbiAgICBwb3NpdGlvbj8gOiBzdHJpbmc7XHJcbiAgICBtYXJnaW4/IDogc3RyaW5nO1xyXG4gICAgY29sb3I/IDogc3RyaW5nO1xyXG4gICAgYmFja2dyb3VuZENvbG9yPyA6IHN0cmluZztcclxuICAgIGJvcmRlclN0eWxlPyA6IHN0cmluZztcclxuICAgIGJvcmRlcldpZHRoPyA6IG51bWJlcjtcclxuICAgIHBhZGRpbmc/IDogbnVtYmVyO1xyXG4gICAgcGFkZGluZ0xlZnQ/IDogc3RyaW5nO1xyXG4gICAgdmVydGljYWxBbGlnbj8gOiBzdHJpbmc7XHJcbiAgICBob3Jpem9udGFsQWxpZ24/IDogc3RyaW5nO1xyXG4gICAgdGV4dEFsaWduPyA6IHN0cmluZztcclxuICAgIGZvbnRTaXplPyA6IHN0cmluZztcclxuICAgIHdpZHRoPyA6IHN0cmluZztcclxuICAgIGhlaWdodD8gOiBzdHJpbmc7XHJcbiAgICB2aXNpYmlsaXR5PyA6IHN0cmluZztcclxuICAgIGNvbHNwYW4gOiBudW1iZXIgPSAxO1xyXG5cclxuICAgIG1pblNpemUgOiBWZWMyIHwgdW5kZWZpbmVkO1xyXG4gICAgd2lkdGhQaXggIDogbnVtYmVyID0gTmFOO1xyXG4gICAgaGVpZ2h0UGl4IDogbnVtYmVyID0gTmFOO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXsgICBcclxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIGRhdGEpO1xyXG4gICAgICAgIHRoaXMuaWR4ID0gKytVSS5jb3VudDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRTdHlsZSgpIDogVUkge1xyXG4gICAgICAgIGNvbnN0IGVsZSA9IHRoaXMuaHRtbCgpO1xyXG5cclxuICAgICAgICBpZih0aGlzLmlkICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGVsZS5pZCA9IHRoaXMuaWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLmNsYXNzTmFtZSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBlbGUuY2xhc3NOYW1lID0gdGhpcy5jbGFzc05hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLnBvc2l0aW9uICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGVsZS5zdHlsZS5wb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoIShlbGUgaW5zdGFuY2VvZiBEaWFsb2cpICl7XHJcbiAgICAgICAgICAgIGVsZS5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMubWFyZ2luICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGVsZS5zdHlsZS5tYXJnaW4gPSB0aGlzLm1hcmdpbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMuYm9yZGVyV2lkdGggIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgZWxlLnN0eWxlLmJvcmRlcldpZHRoID0gYCR7dGhpcy5ib3JkZXJXaWR0aH1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5ib3JkZXJTdHlsZSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBlbGUuc3R5bGUuYm9yZGVyU3R5bGUgPSB0aGlzLmJvcmRlclN0eWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5wYWRkaW5nID09IHVuZGVmaW5lZCAmJiAodGhpcyBpbnN0YW5jZW9mIElucHV0VGV4dCB8fCB0aGlzIGluc3RhbmNlb2YgSW5wdXROdW1iZXJSYW5nZSkpe1xyXG4gICAgICAgICAgICB0aGlzLnBhZGRpbmcgPSBpbnB1dFBhZGRpbmc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLnRleHRBbGlnbiAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBlbGUuc3R5bGUudGV4dEFsaWduID0gdGhpcy50ZXh0QWxpZ247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLmZvbnRTaXplICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGVsZS5zdHlsZS5mb250U2l6ZSA9IHRoaXMuZm9udFNpemU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLmNvbG9yICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGVsZS5zdHlsZS5jb2xvciA9IHRoaXMuY29sb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLmJhY2tncm91bmRDb2xvciAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBlbGUuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5iYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGVsZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBiZ0NvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy53aWR0aCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBlbGUuc3R5bGUud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5oZWlnaHQgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgZWxlLnN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy52aXNpYmlsaXR5ICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGVsZS5zdHlsZS52aXNpYmlsaXR5ID0gdGhpcy52aXNpYmlsaXR5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgYWJzdHJhY3QgaHRtbCgpIDogSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgYm9yZGVyV2lkdGhQYWRkaW5nKCkgOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBuIDogbnVtYmVyID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBpZih0aGlzLmJvcmRlcldpZHRoICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIG4gKz0gMiAqIHRoaXMuYm9yZGVyV2lkdGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLnBhZGRpbmcgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgbiArPSAyICogdGhpcy5wYWRkaW5nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TWluU2l6ZSgpIDogVmVjMiB7XHJcbiAgICAgICAgaWYodGhpcy5taW5TaXplICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1pblNpemU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgd2lkdGggOiBudW1iZXIgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgbGV0IGhlaWdodCA6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgaWYodGhpcy53aWR0aCAhPSB1bmRlZmluZWQgJiYgdGhpcy53aWR0aC5lbmRzV2l0aChcInB4XCIpKXtcclxuICAgICAgICAgICAgd2lkdGggPSBwaXhlbCh0aGlzLndpZHRoKSArIHRoaXMuYm9yZGVyV2lkdGhQYWRkaW5nKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLmhlaWdodCAhPSB1bmRlZmluZWQgJiYgdGhpcy5oZWlnaHQuZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IHBpeGVsKHRoaXMuaGVpZ2h0KSArIHRoaXMuYm9yZGVyV2lkdGhQYWRkaW5nKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih3aWR0aCA9PSB1bmRlZmluZWQgfHwgaGVpZ2h0ID09IHVuZGVmaW5lZCl7XHJcblxyXG4gICAgICAgICAgICBsZXQgc2l6ZSA6IFZlYzI7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgQWJzdHJhY3RUZXh0ICYmICEodGhpcyBpbnN0YW5jZW9mIExhVGVYQm94KSl7XHJcbiAgICAgICAgICAgICAgICBzaXplID0gdGhpcy5nZXRUZXh0U2l6ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5odG1sKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgICAgICBzaXplID0gbmV3IFZlYzIocmVjdC53aWR0aCwgcmVjdC5oZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih3aWR0aCA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBzaXplLng7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoaGVpZ2h0ID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzaXplLnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pblNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TWluV2lkdGgoKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TWluU2l6ZSgpLng7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGdldE1pbkhlaWdodCgpIDogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRNaW5TaXplKCkueTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRXaWR0aCgpIDogbnVtYmVyIHtcclxuICAgICAgICBpZih0aGlzLndpZHRoICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMud2lkdGguZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGl4ZWwodGhpcy53aWR0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmh0bWwoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICByZXR1cm4gcmVjdC53aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRIZWlnaHQoKSA6IG51bWJlciB7XHJcbiAgICAgICAgaWYodGhpcy5oZWlnaHQgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgaWYodGhpcy5oZWlnaHQuZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGl4ZWwodGhpcy5oZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5odG1sKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgcmV0dXJuIHJlY3QuaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHNldFhZKHggOiBudW1iZXIsIHkgOiBudW1iZXIpe1xyXG4gICAgICAgIGNvbnN0IGh0bWwgPSB0aGlzLmh0bWwoKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5wb3NpdGlvbiAhPSBcInN0YXRpY1wiKXtcclxuICAgICAgICAgICAgaHRtbC5zdHlsZS5sZWZ0ID0gYCR7eH1weGA7XHJcbiAgICAgICAgICAgIGh0bWwuc3R5bGUudG9wICA9IGAke3l9cHhgO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRTaXplKHNpemUgOiBWZWMyKXtcclxuICAgICAgICBpZihzaXplID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGh0bWwgPSB0aGlzLmh0bWwoKTtcclxuXHJcbiAgICAgICAgY29uc3QgYm9yZGVyV2lkdGhQYWRkaW5nID0gdGhpcy5ib3JkZXJXaWR0aFBhZGRpbmcoKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5taW5TaXplID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLndpZHRoICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGhQaXggID0gdGhpcy5taW5TaXplLng7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGhQaXggID0gc2l6ZS54IC0gYm9yZGVyV2lkdGhQYWRkaW5nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5oZWlnaHQgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHRQaXggPSB0aGlzLm1pblNpemUueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHRQaXggPSBzaXplLnkgLSBib3JkZXJXaWR0aFBhZGRpbmc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBodG1sLnN0eWxlLndpZHRoICA9IGAke3RoaXMud2lkdGhQaXh9cHhgO1xyXG4gICAgICAgIGh0bWwuc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5oZWlnaHRQaXh9cHhgO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdFVJKHNlbGVjdGVkIDogYm9vbGVhbil7XHJcbiAgICB9XHJcblxyXG4gICAgbGF5b3V0KHggOiBudW1iZXIsIHkgOiBudW1iZXIsIHNpemUgOiBWZWMyLCBuZXN0IDogbnVtYmVyKXtcclxuICAgICAgICBpZihpMThuX3RzLmFwcE1vZGUgPT0gQXBwTW9kZS5sZXNzb25QbGF5KXsgICAgICAgICAgICBcclxuICAgICAgICAgICAgbXNnKGAke1wiIFwiLnJlcGVhdCg0ICogbmVzdCl9IGlkOiR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSB4OiR7eC50b0ZpeGVkKCl9IHk6JHt5LnRvRml4ZWQoKX0gcG9zaXRpb246JHt0aGlzLnBvc2l0aW9ufSAke3RoaXMuaHRtbCgpLnN0eWxlLnBvc2l0aW9ufWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRTaXplKHNpemUpO1xyXG4gICAgICAgIGlmKHRoaXMuaG9yaXpvbnRhbEFsaWduID09IFwiY2VudGVyXCIpe1xyXG4gICAgICAgICAgICB4ICs9IDAuNSAqIChzaXplLnggLSB0aGlzLndpZHRoUGl4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRYWSh4LCB5KTtcclxuICAgIH1cclxuXHJcbiAgICByYXRpbygpIDogbnVtYmVyIHtcclxuICAgICAgICBpZih0aGlzLndpZHRoID09IHVuZGVmaW5lZCB8fCAhIHRoaXMud2lkdGguZW5kc1dpdGgoXCIlXCIpKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHMgPSB0aGlzLndpZHRoLnN1YnN0cmluZygwLCB0aGlzLndpZHRoLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RUZXh0IGV4dGVuZHMgVUkge1xyXG4gICAgdGV4dCA6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0ciAmIHsgdGV4dCA6IHN0cmluZyB9KXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dCh0ZXh0IDogc3RyaW5nKXtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFRleHRTaXplKCkgOiBWZWMyIHtcclxuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSE7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5odG1sKCkpO1xyXG4gICAgICAgIGNvbnN0IGZvbnRfaW5mbyA9IGAke3N0eWxlLmZvbnRXZWlnaHR9ICR7c3R5bGUuZm9udFNpemV9ICR7c3R5bGUuZm9udEZhbWlseX1gO1xyXG4gICAgICAgIGN0eC5mb250ID0gZm9udF9pbmZvO1xyXG5cclxuICAgICAgICBjb25zdCBtZXRyaWNzID0gY3R4Lm1lYXN1cmVUZXh0KHRoaXMudGV4dCk7XHJcbiAgICAgIFxyXG4gICAgICAgIGNvbnN0IGFjdHVhbEhlaWdodCA9IG1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hBc2NlbnQgKyBtZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94RGVzY2VudDtcclxuICAgICAgXHJcbiAgICAgICAgLy8gbXNnKGBmb250IDpbJHtmb250X2luZm99XSAgdzpbJHttZXRyaWNzLndpZHRofV0gaDpbJHthY3R1YWxIZWlnaHR9XSBpZDpbJHt0aGlzLmlkfV0gWyR7dGhpcy50ZXh0fV1gKTtcclxuXHJcbiAgICAgICAgY29uc3Qgd2lkdGggID0gbWV0cmljcy53aWR0aCArIHRoaXMuYm9yZGVyV2lkdGhQYWRkaW5nKCkgKyBUZXh0U2l6ZUZpbGw7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gYWN0dWFsSGVpZ2h0ICArIHRoaXMuYm9yZGVyV2lkdGhQYWRkaW5nKCkgKyBUZXh0U2l6ZUZpbGw7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGFiZWwgZXh0ZW5kcyBBYnN0cmFjdFRleHQge1xyXG4gICAgc3BhbiA6IEhUTUxTcGFuRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0ciAmIHsgdGV4dCA6IHN0cmluZyB9KXsgICAgICAgIFxyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLnNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICB0aGlzLnNwYW4uaW5uZXJUZXh0ID0gdGhpcy50ZXh0O1xyXG4gICAgICAgIC8vIHRoaXMuc3Bhbi5zdHlsZS5qdXN0aWZ5Q29udGVudCA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgLy8gdGhpcy5zcGFuLnN0eWxlLnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICB9XHJcblxyXG4gICAgaHRtbCgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNwYW47XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUZXh0RGl2IGV4dGVuZHMgQWJzdHJhY3RUZXh0IHtcclxuICAgIGRpdiA6IEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyICYgeyB0ZXh0IDogc3RyaW5nIH0pe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICAvLyB0aGlzLmRpdi5zdHlsZS5ib3JkZXJTdHlsZSA9IFwicmlkZ2VcIjtcclxuICAgICAgICAvLyB0aGlzLmRpdi5zdHlsZS5ib3JkZXJXaWR0aCA9IFwiM3B4XCI7XHJcbiAgICAgICAgLy8gdGhpcy5kaXYuc3R5bGUuYm9yZGVyQ29sb3IgPSBcInRyYW5zcGFyZW50XCI7XHJcbiAgICB9XHJcblxyXG4gICAgaHRtbCgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRpdjtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCl7XHJcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZSgpe1xyXG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIH1cclxuXHJcbiAgICBzZXRCb3JkZXJDb2xvcihjb2xvciA6IHN0cmluZyl7XHJcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUuYm9yZGVyQ29sb3IgPSBjb2xvcjtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFRleHRCb3ggZXh0ZW5kcyBUZXh0RGl2IHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyICYgeyB0ZXh0IDogc3RyaW5nIH0pe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZGl2LmlubmVySFRNTCA9IGRhdGEudGV4dDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUZXh0KHRleHQgOiBzdHJpbmcpe1xyXG4gICAgICAgIHN1cGVyLnNldFRleHQodGV4dCk7XHJcbiAgICAgICAgdGhpcy5kaXYuaW5uZXJIVE1MID0gdGV4dDtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhclRleHQoKXtcclxuICAgICAgICB0aGlzLnNldFRleHQoXCJcIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMYVRlWEJveCBleHRlbmRzIFRleHREaXYge1xyXG4gICAgY2xpY2s/IDogTW91c2VFdmVudENhbGxiYWNrO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyICYgeyB0ZXh0IDogc3RyaW5nLCBjbGljaz8gOiBNb3VzZUV2ZW50Q2FsbGJhY2sgfSl7ICAgICAgICBcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLmRpdi5pbm5lckhUTUwgPSBkYXRhLnRleHQ7XHJcbiAgICAgICAgdGhpcy5jbGljayA9IGRhdGEuY2xpY2s7XHJcblxyXG4gICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoZXY6TW91c2VFdmVudCk9PntcclxuICAgICAgICAgICAgaWYodGhpcy5jbGljayAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jbGljayhldik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRTdHlsZSgpIDogVUkge1xyXG4gICAgICAgIHN1cGVyLnNldFN0eWxlKCk7XHJcblxyXG4gICAgICAgIHBhcnNlcl90cy5yZW5kZXJLYXRleFN1Yih0aGlzLmRpdiwgdGhpcy50ZXh0KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dCh0ZXh0IDogc3RyaW5nKXtcclxuICAgICAgICBzdXBlci5zZXRUZXh0KHRleHQpO1xyXG4gICAgICAgIHBhcnNlcl90cy5yZW5kZXJLYXRleFN1Yih0aGlzLmRpdiwgdGhpcy50ZXh0KTtcclxuICAgIH1cclxufVxyXG5cclxuYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RJbnB1dCBleHRlbmRzIFVJIHtcclxuICAgIGlucHV0IDogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGNoYW5nZT8gOiAoZXYgOiBFdmVudCk9PlByb21pc2U8dm9pZD47XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIgJiB7IGNoYW5nZT8gOiBFdmVudENhbGxiYWNrIH0pe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuY2hhbmdlID0gZGF0YS5jaGFuZ2U7XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS5jb2xvciA9IGZnQ29sb3I7XHJcblxyXG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBJbnB1dFRleHQpe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgYXN5bmMgKGV2IDogRXZlbnQpPT57XHJcbiAgICAgICAgICAgICAgICBtc2coXCJpbnB1dCBldmVudFwiKTtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY2hhbmdlICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jaGFuZ2UoZXYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoZXYgOiBFdmVudCk9PntcclxuICAgICAgICAgICAgICAgIG1zZyhcImNoYW5nZSBldmVudFwiKTtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY2hhbmdlICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jaGFuZ2UoZXYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaHRtbCgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSW5wdXRUZXh0IGV4dGVuZHMgQWJzdHJhY3RJbnB1dCB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyICYgeyB0ZXh0IDogc3RyaW5nLCBjaGFuZ2U/IDogRXZlbnRDYWxsYmFjayB9KXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLmlucHV0LnR5cGUgPSBcInRleHRcIjtcclxuICAgICAgICB0aGlzLmlucHV0LnZhbHVlID0gZGF0YS50ZXh0O1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIElucHV0Q29sb3IgZXh0ZW5kcyBBYnN0cmFjdElucHV0IHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyICYgeyB0ZXh0IDogc3RyaW5nLCBjaGFuZ2U/IDogRXZlbnRDYWxsYmFjayB9KXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLmlucHV0LnR5cGUgPSBcImNvbG9yXCI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIElucHV0TnVtYmVyUmFuZ2UgZXh0ZW5kcyBBYnN0cmFjdElucHV0IHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyICYgeyB2YWx1ZT8gOiBudW1iZXIsIHN0ZXA/IDogbnVtYmVyLCBtaW4/IDogbnVtYmVyLCBtYXg/IDogbnVtYmVyLCBjaGFuZ2U/IDogRXZlbnRDYWxsYmFjayB9KXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICBcclxuICAgICAgICBpZihkYXRhLndpZHRoID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGRhdGEud2lkdGggPSBcIjUwcHhcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBJbnB1dE51bWJlcil7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnR5cGUgPSBcIm51bWJlclwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbnB1dC50eXBlID0gXCJyYW5nZVwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoZGF0YS52YWx1ZSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnZhbHVlID0gYCR7ZGF0YS52YWx1ZX1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihkYXRhLnN0ZXAgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5zdGVwID0gYCR7ZGF0YS5zdGVwfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGRhdGEubWluICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQubWluID0gYCR7ZGF0YS5taW59YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZGF0YS5tYXggIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5tYXggPSBgJHtkYXRhLm1heH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRWYWx1ZSh2YWx1ZSA6IG51bWJlcil7XHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9IGAke3ZhbHVlfWA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VmFsdWUoKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5pbnB1dC52YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWF4KG1heF92YWx1ZSA6IG51bWJlcil7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5tYXggPSBgJHttYXhfdmFsdWV9YDsgICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSW5wdXROdW1iZXIgZXh0ZW5kcyBJbnB1dE51bWJlclJhbmdlIHtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBJbnB1dFJhbmdlIGV4dGVuZHMgSW5wdXROdW1iZXJSYW5nZSB7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDaGVja0JveCBleHRlbmRzIEFic3RyYWN0SW5wdXQge1xyXG4gICAgc3BhbiAgOiBIVE1MU3BhbkVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIgJiB7IHRleHQgOiBzdHJpbmcsIGNoYW5nZT8gOiBFdmVudENhbGxiYWNrIH0pe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnR5cGUgPSBcImNoZWNrYm94XCI7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5pZCA9IGBsYXlvdXQudHMtY2hlY2tib3gtJHt0aGlzLmlkeH1gO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIik7XHJcbiAgICAgICAgbGFiZWwuaHRtbEZvciA9IHRoaXMuaW5wdXQuaWQ7XHJcbiAgICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSBkYXRhLnRleHQ7ICAgIFxyXG4gICAgICAgIGxhYmVsLnN0eWxlLmNvbG9yID0gZmdDb2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5zcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgdGhpcy5zcGFuLmFwcGVuZCh0aGlzLmlucHV0KTtcclxuICAgICAgICB0aGlzLnNwYW4uYXBwZW5kKGxhYmVsKTtcclxuICAgIH1cclxuXHJcbiAgICBodG1sKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3BhbjtcclxuICAgIH1cclxuXHJcbiAgICBjaGVja2VkKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5jaGVja2VkO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVGV4dEFyZWEgZXh0ZW5kcyBVSSB7XHJcbiAgICB0ZXh0QXJlYSA6IEhUTUxUZXh0QXJlYUVsZW1lbnQ7XHJcbiAgICBjaGFuZ2U/IDogRXZlbnRDYWxsYmFjaztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0ciAmIHsgdmFsdWU/IDogc3RyaW5nLCBjb2xzPyA6IG51bWJlciwgcm93cz8gOiBudW1iZXIsIHBsYWNlaG9sZGVyPyA6IHN0cmluZywgY2hhbmdlPyA6IEV2ZW50Q2FsbGJhY2sgfSl7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2UgPSBkYXRhLmNoYW5nZTtcclxuICAgICAgICB0aGlzLnRleHRBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRleHRhcmVhXCIpO1xyXG4gICAgICAgIGlmKGRhdGEudmFsdWUgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QXJlYS52YWx1ZSA9IGRhdGEudmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihkYXRhLmNvbHMgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QXJlYS5jb2xzID0gZGF0YS5jb2xzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoZGF0YS5yb3dzICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEFyZWEucm93cyA9IGRhdGEucm93cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudGV4dEFyZWEuc3R5bGUuY29sb3IgPSBmZ0NvbG9yO1xyXG5cclxuICAgICAgICBpZihkYXRhLnBsYWNlaG9sZGVyICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEFyZWEucGxhY2Vob2xkZXIgPSBkYXRhLnBsYWNlaG9sZGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50ZXh0QXJlYS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgYXN5bmMgKGV2IDogRXZlbnQpPT57XHJcbiAgICAgICAgICAgIGlmKHRoaXMuY2hhbmdlICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNoYW5nZShldik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBodG1sKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dEFyZWE7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VmFsdWUoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dEFyZWEudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmFsdWUodGV4dCA6IHN0cmluZyl7XHJcbiAgICAgICAgdGhpcy50ZXh0QXJlYS52YWx1ZSA9IHRleHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJbWcgZXh0ZW5kcyBVSSB7XHJcbiAgICBpbWdVcmwgOiBzdHJpbmc7XHJcbiAgICBpbWcgOiBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gICAgY2xpY2s/IDogTW91c2VFdmVudENhbGxiYWNrO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyICYgeyBpbWdVcmwgOiBzdHJpbmcsIGZpbGU/IDogRmlsZSwgY2xpY2s/IDogTW91c2VFdmVudENhbGxiYWNrIH0pe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuaW1nVXJsID0gZGF0YS5pbWdVcmw7XHJcbiAgICAgICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xyXG4gICAgICAgIHRoaXMuaW1nLnN0eWxlLm9iamVjdEZpdCA9IFwiY29udGFpblwiO1xyXG4gICAgICAgIGlmKGRhdGEuZmlsZSAhPSB1bmRlZmluZWQpe1xyXG5cclxuICAgICAgICAgICAgc2V0SW1nRmlsZSh0aGlzLmltZywgZGF0YS5maWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW1nLnNyYyA9IHRoaXMuaW1nVXJsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoZGF0YS5jbGljayAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrID0gZGF0YS5jbGljaztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoZXY6TW91c2VFdmVudCk9PntcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY2xpY2sgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNsaWNrKGV2KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGh0bWwoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbWc7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SW1nVXJsKHVybCA6IHN0cmluZyl7XHJcbiAgICAgICAgdGhpcy5pbWcuc3JjID0gdXJsO1xyXG4gICAgICAgIHRoaXMuaW1nVXJsICA9IHVybDtcclxuICAgIH1cclxufVxyXG5cclxuYWJzdHJhY3QgY2xhc3MgQWJzdHJhY3RCdXR0b24gZXh0ZW5kcyBVSSB7XHJcbiAgICBzdGF0aWMgaW1nTWFyZ2luID0gMjtcclxuXHJcbiAgICB2YWx1ZT8gIDogc3RyaW5nO1xyXG4gICAgYnV0dG9uIDogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICBpbWc/IDogSFRNTEltYWdlRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0ciAmIHsgaWQ/IDogc3RyaW5nLCB2YWx1ZT8gOiBzdHJpbmcsIHRleHQ/IDogc3RyaW5nLCB1cmw/IDogc3RyaW5nIH0pe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSBkYXRhLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcclxuICAgICAgICB0aGlzLmJ1dHRvbi5zdHlsZS5wYWRkaW5nID0gXCIxcHhcIjtcclxuICAgICAgICB0aGlzLmJ1dHRvbi5zdHlsZS5jb2xvciA9IGZnQ29sb3I7XHJcblxyXG4gICAgICAgIGlmKGRhdGEuZGlzYWJsZWQgIT0gdW5kZWZpbmVkICYmIGRhdGEuZGlzYWJsZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihkYXRhLnRleHQgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy5idXR0b24uaW5uZXJUZXh0ID0gZGF0YS50ZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoZGF0YS51cmwgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmltZy5zcmMgPSBkYXRhLnVybDtcclxuICAgIFxyXG4gICAgICAgICAgICB0aGlzLmltZy5zdHlsZS53aWR0aCAgID0gXCIxMDAlXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaW1nLnN0eWxlLmhlaWdodCAgPSBcIjEwMCVcIjtcclxuICAgICAgICAgICAgdGhpcy5pbWcuc3R5bGUub2JqZWN0Rml0ID0gXCJjb250YWluXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLmFwcGVuZCh0aGlzLmltZyk7ICAgIFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRJbWdVcmwodXJsIDogc3RyaW5nKXtcclxuICAgICAgICB0aGlzLmltZyEuc3JjID0gdXJsO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgQWJzdHJhY3RCdXR0b24ge1xyXG4gICAgY2xpY2s/IDogTW91c2VFdmVudENhbGxiYWNrO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyICYgeyB2YWx1ZT8gOiBzdHJpbmcsIHRleHQ/IDogc3RyaW5nLCB1cmw/IDogc3RyaW5nLCBjbGljaz8gOiBNb3VzZUV2ZW50Q2FsbGJhY2sgfSl7ICAgICAgICBcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLmNsaWNrID0gZGF0YS5jbGljaztcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIChldjpNb3VzZUV2ZW50KT0+e1xyXG4gICAgICAgICAgICBpZih0aGlzLmNsaWNrICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNsaWNrKGV2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGh0bWwoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5idXR0b247XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBbmNob3IgZXh0ZW5kcyBVSSB7XHJcbiAgICBhbmNob3IgOiBIVE1MQW5jaG9yRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0ciAmIHsgdGV4dD8gOiBzdHJpbmcsIHVybD8gOiBzdHJpbmcgfSl7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaHRtbCgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFuY2hvcjtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFJhZGlvQnV0dG9uIGV4dGVuZHMgQWJzdHJhY3RCdXR0b24ge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIgJiB7IGlkPyA6IHN0cmluZywgdmFsdWUgOiBzdHJpbmcsIHRpdGxlPyA6IHN0cmluZywgdGV4dD8gOiBzdHJpbmcsIHVybD8gOiBzdHJpbmcgfSl7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uLnZhbHVlID0gZGF0YS52YWx1ZTtcclxuICAgICAgICBpZihkYXRhLnRpdGxlICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLnRpdGxlID0gZGF0YS50aXRsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idXR0b24uc3R5bGUuYm9yZGVyV2lkdGggPSBcIjNweFwiO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uLnN0eWxlLmJvcmRlclN0eWxlID0gXCJvdXRzZXRcIjtcclxuICAgIH1cclxuXHJcbiAgICBodG1sKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYnV0dG9uO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdFVJKHNlbGVjdGVkIDogYm9vbGVhbil7XHJcbiAgICAgICAgaWYodGhpcy5wYXJlbnQgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcy5wYXJlbnQuc2VsZWN0ZWRVSSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBjb25zdCBvbGRfc2VsZWN0ZWQgPSB0aGlzLnBhcmVudC5zZWxlY3RlZFVJO1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZWxlY3RlZFVJID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBvbGRfc2VsZWN0ZWQuc2VsZWN0VUkoZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaHRtbCA9IHRoaXMuaHRtbCgpO1xyXG4gICAgICAgIGlmKHNlbGVjdGVkKXtcclxuXHJcbiAgICAgICAgICAgIGh0bWwuc3R5bGUuYm9yZGVyU3R5bGUgPSBcImluc2V0XCI7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLnBhcmVudC5zZWxlY3RlZFVJICE9IHRoaXMpe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbGVjdGVkVUkgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5wYXJlbnQub25DaGFuZ2UgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5vbkNoYW5nZSh0aGlzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgaHRtbC5zdHlsZS5ib3JkZXJTdHlsZSA9IFwib3V0c2V0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQmxvY2sgZXh0ZW5kcyBVSSB7XHJcbiAgICBkaXYgOiBIVE1MRGl2RWxlbWVudDtcclxuICAgIGNoaWxkcmVuIDogVUlbXTtcclxuICAgIHNlbGVjdGVkVUk/IDogVUk7XHJcblxyXG4gICAgb25DaGFuZ2U/IDogKHVpOlVJKT0+dm9pZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0ciAmIHsgY2hpbGRyZW4gOiBVSVtdIH0peyAgICAgICAgXHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XHJcbiAgICAgICAgZGF0YS5jaGlsZHJlbi5mb3JFYWNoKHggPT4gdGhpcy5hZGRDaGlsZCh4KSk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY2hpbGRyZW4ubGVuZ3RoICE9IDAgJiYgdGhpcy5jaGlsZHJlblswXSBpbnN0YW5jZW9mIFJhZGlvQnV0dG9uKXtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlblswXS5zZWxlY3RVSSh0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCh4ID0+IHRoaXMuZGl2LmFwcGVuZCh4Lmh0bWwoKSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGh0bWwoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kaXY7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQ2hpbGQoY2hpbGQgOiBVSSl7XHJcbiAgICAgICAgY2hpbGQucGFyZW50ID0gdGhpcztcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG5cclxuICAgICAgICB0aGlzLmRpdi5hcHBlbmQoY2hpbGQuaHRtbCgpKTtcclxuXHJcbiAgICAgICAgaWYoY2hpbGQgaW5zdGFuY2VvZiBSYWRpb0J1dHRvbil7XHJcblxyXG4gICAgICAgICAgICBjaGlsZC5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldjpNb3VzZUV2ZW50KT0+e1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuc2VsZWN0VUkodHJ1ZSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcG9wQ2hpbGQoKSA6IFVJIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZih0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PSAwKXtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy5jaGlsZHJlbi5wb3AoKSE7XHJcbiAgICAgICAgY2hpbGQucGFyZW50ID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICB0aGlzLmRpdi5yZW1vdmVDaGlsZChjaGlsZC5odG1sKCkpO1xyXG5cclxuICAgICAgICByZXR1cm4gY2hpbGQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlQ2hpbGQoY2hpbGQgOiBVSSl7XHJcbiAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKTtcclxuICAgICAgICBpZihpZHggPT0gLTEpe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoaWR4LCAxKTtcclxuICAgICAgICB0aGlzLmRpdi5yZW1vdmVDaGlsZChjaGlsZC5odG1sKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFsbFVJKCkgOiBVSVtdIHtcclxuICAgICAgICBsZXQgdWlzIDogVUlbXSA9IFsgdGhpcyBdO1xyXG4gICAgICAgIGZvcihjb25zdCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKXtcclxuICAgICAgICAgICAgaWYoY2hpbGQgaW5zdGFuY2VvZiBCbG9jayl7XHJcbiAgICAgICAgICAgICAgICB1aXMgPSB1aXMuY29uY2F0KGNoaWxkLmdldEFsbFVJKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICB1aXMucHVzaChjaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1aXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QWxsSHRtbCgpIDogSFRNTEVsZW1lbnRbXSB7XHJcbiAgICAgICAgY29uc3QgdWlzID0gdGhpcy5nZXRBbGxVSSgpO1xyXG4gICAgICAgIHJldHVybiB1aXMubWFwKHggPT4geC5odG1sKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEVsZW1lbnRCeUlkKGlkIDogc3RyaW5nKSA6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBbGxIdG1sKCkuZmluZCh4ID0+IHguaWQgPT0gaWQpO1xyXG4gICAgfVxyXG5cclxuICAgICQoaWQgOiBzdHJpbmcpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFVJQnlJZChpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VUlCeUlkKGlkIDogc3RyaW5nKSA6IFVJIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCB1aXMgPSB0aGlzLmdldEFsbFVJKCk7XHJcbiAgICAgICAgcmV0dXJuIHVpcy5maW5kKHggPT4geC5pZCA9PSBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKXtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XHJcbiAgICAgICAgdGhpcy5kaXYuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZsZXggZXh0ZW5kcyBCbG9jayB7XHJcbiAgICBzdGF0aWMgaW5pdGlhbFdpZHRoID0gXCIzMDBweFwiO1xyXG4gICAgc3RhdGljIHBhZGRpbmcgPSAyO1xyXG5cclxuICAgIGRpcmVjdGlvbiA6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0ciAmIHsgZGlyZWN0aW9uPzogc3RyaW5nLCBjaGlsZHJlbiA6IFVJW10gfSl7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUud2lkdGggPSBGbGV4LmluaXRpYWxXaWR0aDtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAoZGF0YS5kaXJlY3Rpb24gIT0gdW5kZWZpbmVkID8gZGF0YS5kaXJlY3Rpb24gOiBcInJvd1wiKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gZGF0YS5jaGlsZHJlbjtcclxuXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKHggPT4gdGhpcy5kaXYuYXBwZW5kKHguaHRtbCgpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TWluU2l6ZSgpIDogVmVjMiB7XHJcbiAgICAgICAgbGV0IG1pbl9zaXplcyA6IFZlYzJbXSA9IFtdO1xyXG5cclxuICAgICAgICBpZih0aGlzLmNoaWxkcmVuLmxlbmd0aCAhPSAwKXtcclxuICAgICAgICAgICAgbWluX3NpemVzID0gdGhpcy5jaGlsZHJlbi5tYXAoeCA9PiB4LmdldE1pblNpemUoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgd2lkdGggOiBudW1iZXIgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgbGV0IGhlaWdodCA6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgaWYodGhpcy53aWR0aCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBhc3NlcnQodGhpcy53aWR0aC5lbmRzV2l0aChcInB4XCIpKTtcclxuICAgICAgICAgICAgd2lkdGggPSBwaXhlbCh0aGlzLndpZHRoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgaWYodGhpcy5jaGlsZHJlbi5sZW5ndGggPT0gMCl7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmRpcmVjdGlvbiA9PSBcInJvd1wiKXtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gc3VtKCBtaW5fc2l6ZXMubWFwKHN6ID0+IHN6LngpICkgKyAobWluX3NpemVzLmxlbmd0aCAtIDEpICogRmxleC5wYWRkaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5kaXJlY3Rpb24gPT0gXCJjb2x1bW5cIil7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCAgPSBNYXRoLm1heCguLi5taW5fc2l6ZXMubWFwKHN6ID0+IHN6LngpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5oZWlnaHQgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgYXNzZXJ0KHRoaXMuaGVpZ2h0LmVuZHNXaXRoKFwicHhcIikpO1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBwaXhlbCh0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09IDApe1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuZGlyZWN0aW9uID09IFwicm93XCIpe1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgoLi4ubWluX3NpemVzLm1hcChzeiA9PiBzei55KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmRpcmVjdGlvbiA9PSBcImNvbHVtblwiKXtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHN1bSggbWluX3NpemVzLm1hcChzeiA9PiBzei55KSApICsgKG1pbl9zaXplcy5sZW5ndGggLSAxKSAqIEZsZXgucGFkZGluZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYod2lkdGggPT0gdW5kZWZpbmVkIHx8IGhlaWdodCA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgIH0gICBcclxuXHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIod2lkdGggKyAyICogRmxleC5wYWRkaW5nLCBoZWlnaHQgKyAyICogRmxleC5wYWRkaW5nKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWluU2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICBsYXlvdXQoeCA6IG51bWJlciwgeSA6IG51bWJlciwgc2l6ZSA6IFZlYzIsIG5lc3QgOiBudW1iZXIpe1xyXG4gICAgICAgIHN1cGVyLmxheW91dCh4LCB5LCBzaXplLCBuZXN0KTtcclxuXHJcbiAgICAgICAgbGV0IGNoaWxkX3ggPSBGbGV4LnBhZGRpbmc7XHJcbiAgICAgICAgbGV0IGNoaWxkX3kgPSBGbGV4LnBhZGRpbmc7XHJcbiAgICAgICAgaWYodGhpcy5kaXJlY3Rpb24gPT0gXCJyb3dcIil7XHJcblxyXG4gICAgICAgICAgICBmb3IoY29uc3QgW2lkeCwgY2hpbGRdIG9mIHRoaXMuY2hpbGRyZW4uZW50cmllcygpKXtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmxheW91dChjaGlsZF94LCBjaGlsZF95LCBjaGlsZC5nZXRNaW5TaXplKCksIG5lc3QgKyAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjaGlsZF94ICs9IGNoaWxkLm1pblNpemUhLnggKyBGbGV4LnBhZGRpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0aGlzLmRpcmVjdGlvbiA9PSBcImNvbHVtblwiKXtcclxuXHJcbiAgICAgICAgICAgIGZvcihjb25zdCBbaWR4LCBjaGlsZF0gb2YgdGhpcy5jaGlsZHJlbi5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICAgICAgY2hpbGQubGF5b3V0KGNoaWxkX3gsIGNoaWxkX3ksIGNoaWxkLmdldE1pblNpemUoKSwgbmVzdCArIDEpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNoaWxkX3kgKz0gY2hpbGQubWluU2l6ZSEueSArIEZsZXgucGFkZGluZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBvcHVwTWVudSBleHRlbmRzIFVJIHtcclxuICAgIGRsZyAgOiBIVE1MRGlhbG9nRWxlbWVudDtcclxuICAgIGZsZXggOiBGbGV4O1xyXG4gICAgY2xpY2s/IDogKGluZGV4IDogbnVtYmVyLCBpZD8gOiBzdHJpbmcsIHZhbHVlPyA6IHN0cmluZyk9PnZvaWQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIgJiB7IGNoaWxkcmVuIDogVUlbXSwgY2xpY2s/IDogKGluZGV4IDogbnVtYmVyKT0+dm9pZCB9KXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLmNsaWNrID0gZGF0YS5jbGljaztcclxuXHJcbiAgICAgICAgdGhpcy5kbGcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGlhbG9nXCIpO1xyXG4gICAgICAgIHRoaXMuZGxnLnN0eWxlLnBvc2l0aW9uID0gXCJmaXhlZFwiO1xyXG4gICAgICAgIHRoaXMuZGxnLnN0eWxlLnpJbmRleCAgPSBcIjFcIjtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuZmxleCA9ICRmbGV4KHtcclxuICAgICAgICAgICAgZGlyZWN0aW9uIDogXCJjb2x1bW5cIixcclxuICAgICAgICAgICAgY2hpbGRyZW4gOiBkYXRhLmNoaWxkcmVuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBjaGlsZCBvZiBkYXRhLmNoaWxkcmVuKXtcclxuICAgICAgICAgICAgY2hpbGQuaHRtbCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXYgOiBNb3VzZUV2ZW50KT0+e1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGxncyA9IGRvY3VtZW50LmJvZHkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJkaWFsb2dcIik7XHJcbiAgICAgICAgICAgICAgICBmb3IoY29uc3QgZGxnIG9mIGRsZ3Mpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkbGcuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZGxnLmFwcGVuZCh0aGlzLmZsZXguZGl2KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQodGhpcy5kbGcpO1xyXG4gICAgfVxyXG5cclxuICAgIGh0bWwoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRsZztcclxuICAgIH1cclxuXHJcbiAgICBzaG93KGV2IDogTW91c2VFdmVudCl7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmZsZXguZ2V0QWxsVUkoKS5mb3JFYWNoKHggPT4geC5taW5TaXplID0gdW5kZWZpbmVkKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNpemUgPSB0aGlzLmZsZXguZ2V0TWluU2l6ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmZsZXgubGF5b3V0KDAsIDAsIHNpemUsIDApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kbGcuc3R5bGUud2lkdGggID0gYCR7c2l6ZS54fXB4YDtcclxuICAgICAgICAgICAgdGhpcy5kbGcuc3R5bGUuaGVpZ2h0ID0gYCR7c2l6ZS55fXB4YDtcclxuICAgIFxyXG4gICAgICAgICAgICB0aGlzLmRsZy5zdHlsZS5tYXJnaW5MZWZ0ID0gYCR7ZXYucGFnZVh9cHhgO1xyXG4gICAgICAgICAgICB0aGlzLmRsZy5zdHlsZS5tYXJnaW5Ub3AgID0gYCR7ZXYucGFnZVl9cHhgO1xyXG4gICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kbGcuc2hvd01vZGFsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKXsgICAgICAgIFxyXG4gICAgICAgIHRoaXMuZGxnLmNsb3NlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkIGV4dGVuZHMgQmxvY2sge1xyXG4gICAgY29sdW1ucz8gOiBzdHJpbmdbXTtcclxuICAgIHJvd3M/IDogc3RyaW5nW107XHJcblxyXG4gICAgbWluV2lkdGhzIDogbnVtYmVyW10gPSBbXTtcclxuICAgIGhlaWdodHMhIDogbnVtYmVyW107XHJcblxyXG4gICAgbnVtQ29scyA6IG51bWJlciA9IE5hTjtcclxuICAgIG51bVJvd3MgOiBudW1iZXIgPSBOYU47XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIgJiB7IGNvbHVtbnM/OiBzdHJpbmcsIHJvd3M/IDogc3RyaW5nLCBjaGlsZHJlbiA6IFVJW10gfSl7ICAgICAgICBcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICBpZihkYXRhLmNvbHVtbnMgIT0gdW5kZWZpbmVkKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY29sdW1ucyA9IGRhdGEuY29sdW1ucy5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihkYXRhLnJvd3MgIT0gdW5kZWZpbmVkKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucm93cyA9IGRhdGEucm93cy5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldFJvdyhpZHggOiBudW1iZXIpIDogVUlbXSB7XHJcbiAgICAgICAgYXNzZXJ0KCFpc05hTih0aGlzLm51bUNvbHMpICYmICFpc05hTih0aGlzLm51bVJvd3MpKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5zbGljZShpZHggKiB0aGlzLm51bUNvbHMsIChpZHggKyAxKSAqIHRoaXMubnVtQ29scyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um93SGVpZ2h0KGlkeCA6IG51bWJlcikgOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCguLi4gdGhpcy5nZXRSb3coaWR4KS5tYXAodWkgPT4gdWkuZ2V0TWluSGVpZ2h0KCkpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2x1bW4oaWR4IDogbnVtYmVyKSA6IFVJW117XHJcbiAgICAgICAgYXNzZXJ0KCFpc05hTih0aGlzLm51bUNvbHMpICYmICFpc05hTih0aGlzLm51bVJvd3MpKTtcclxuICAgICAgICByZXR1cm4gcmFuZ2UodGhpcy5jaGlsZHJlbi5sZW5ndGgpLmZpbHRlcihpID0+IGkgJSB0aGlzLm51bUNvbHMgPT0gaWR4KS5tYXAoaSA9PiB0aGlzLmNoaWxkcmVuW2ldKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2x1bW5XaXRoKGlkeCA6IG51bWJlcikgOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCguLi4gdGhpcy5nZXRDb2x1bW4oaWR4KS5tYXAodWkgPT4gdWkuZ2V0TWluV2lkdGgoKSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGNIZWlnaHRzKCl7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0cyA9IHJhbmdlKHRoaXMucm93cyEubGVuZ3RoKS5tYXAoeCA9PiAwKTtcclxuICAgICAgICBmb3IoY29uc3QgW2lkeCwgcm93XSBvZiB0aGlzLnJvd3MhLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIGlmKHJvdy5lbmRzV2l0aChcInB4XCIpKXtcclxuICAgICAgICAgICAgICAgIGhlaWdodHNbaWR4XSA9IHBpeGVsKHJvdyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihyb3cgPT0gXCJhdXRvXCIpe1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0c1tpZHhdID0gdGhpcy5nZXRSb3dIZWlnaHQoaWR4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGhlaWdodHM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TWluU2l6ZSgpIDogVmVjMiB7XHJcbiAgICAgICAgbGV0IHdpZHRoIDogbnVtYmVyO1xyXG5cclxuICAgICAgICB0aGlzLm51bUNvbHMgPSAodGhpcy5jb2x1bW5zID09IHVuZGVmaW5lZCA/IDEgOiB0aGlzLmNvbHVtbnMubGVuZ3RoKTtcclxuICAgICAgICB0aGlzLm51bVJvd3MgPSBNYXRoLmNlaWwodGhpcy5jaGlsZHJlbi5sZW5ndGggLyB0aGlzLm51bUNvbHMpO1xyXG4gICAgICAgIGFzc2VydCh0aGlzLnJvd3MgPT0gdW5kZWZpbmVkIHx8IHRoaXMucm93cy5sZW5ndGggPT0gdGhpcy5udW1Sb3dzKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy53aWR0aCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBhc3NlcnQodGhpcy53aWR0aC5lbmRzV2l0aChcInB4XCIpKTtcclxuICAgICAgICAgICAgd2lkdGggPSBwaXhlbCh0aGlzLndpZHRoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMuY29sdW1ucyA9PSB1bmRlZmluZWQpe1xyXG5cclxuICAgICAgICAgICAgICAgIHdpZHRoID0gdGhpcy5nZXRDb2x1bW5XaXRoKDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1pbldpZHRocyA9IG5ldyBBcnJheSh0aGlzLmNvbHVtbnMubGVuZ3RoKS5maWxsKDApO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvcihjb25zdCBbaWR4LCBjb2xdIG9mIHRoaXMuY29sdW1ucy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGNvbC5lbmRzV2l0aChcInB4XCIpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5XaWR0aHNbaWR4XSA9IHBpeGVsKGNvbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbF93aWR0aCA9IE1hdGgubWF4KC4uLiB0aGlzLmdldENvbHVtbihpZHgpLm1hcCh1aSA9PiB1aS5nZXRNaW5XaWR0aCgpKSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjb2wgPT0gXCJhdXRvXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5XaWR0aHNbaWR4XSA9IGNvbF93aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmKGNvbC5lbmRzV2l0aChcIiVcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5XaWR0aHNbaWR4XSA9IGNvbF93aWR0aCAvIHJhdGlvKGNvbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBzdW0odGhpcy5taW5XaWR0aHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaGVpZ2h0IDogbnVtYmVyO1xyXG5cclxuICAgICAgICBpZih0aGlzLmhlaWdodCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBhc3NlcnQodGhpcy5udW1Sb3dzID09IDEpO1xyXG4gICAgICAgICAgICBhc3NlcnQodGhpcy5oZWlnaHQuZW5kc1dpdGgoXCJweFwiKSk7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IHBpeGVsKHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHRzID0gWyBoZWlnaHQgXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMucm93cyA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHRzID0gcmFuZ2UodGhpcy5udW1Sb3dzKS5tYXAoaSA9PiB0aGlzLmdldFJvd0hlaWdodChpKSApO1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc3VtKCB0aGlzLmhlaWdodHMgKSA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhlaWdodHMgPSB0aGlzLmNhbGNIZWlnaHRzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHJlbWFpbmluZ19oZWlnaHQgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yKGNvbnN0IFtpZHgsIHNpemVdIG9mIHRoaXMucm93cy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHNpemUuZW5kc1dpdGgoXCIlXCIpKXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd19oZWlnaHQgPSBNYXRoLm1heCguLi4gdGhpcy5nZXRSb3coaWR4KS5tYXAodWkgPT4gdWkuZ2V0TWluSGVpZ2h0KCkpICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ19oZWlnaHQgPSBNYXRoLm1heChyb3dfaGVpZ2h0IC8gcmF0aW8oc2l6ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzdW0odGhpcy5oZWlnaHRzKSArIHJlbWFpbmluZ19oZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pblNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgbGF5b3V0KHggOiBudW1iZXIsIHkgOiBudW1iZXIsIHNpemUgOiBWZWMyLCBuZXN0IDogbnVtYmVyKXtcclxuICAgICAgICBzdXBlci5sYXlvdXQoeCwgeSwgc2l6ZSwgbmVzdCk7XHJcblxyXG4gICAgICAgIGxldCB3aWR0aHMgPSBuZXcgQXJyYXkodGhpcy5taW5XaWR0aHMubGVuZ3RoKS5maWxsKDApO1xyXG5cclxuICAgICAgICBpZih0aGlzLmNvbHVtbnMgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgd2lkdGhzID0gWyBzaXplLnggXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgbGV0IGZpeGVkX3dpZHRoID0gMDtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IFtpZHgsIGNvbF0gb2YgdGhpcy5jb2x1bW5zLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgICAgICBpZihjb2wuZW5kc1dpdGgoXCJweFwiKSB8fCBjb2wgPT0gXCJhdXRvXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoc1tpZHhdICA9IHRoaXMubWluV2lkdGhzW2lkeF07XHJcbiAgICAgICAgICAgICAgICAgICAgZml4ZWRfd2lkdGggKz0gdGhpcy5taW5XaWR0aHNbaWR4XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nX3dpZHRoID0gc2l6ZS54IC0gZml4ZWRfd2lkdGg7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBbaWR4LCBjb2xdIG9mIHRoaXMuY29sdW1ucy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoY29sLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGhzW2lkeF0gID0gcmVtYWluaW5nX3dpZHRoICogcmF0aW8oY29sKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmKHRoaXMucm93cyA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmhlaWdodHMgPSByYW5nZSh0aGlzLm51bVJvd3MpLm1hcChpID0+IHRoaXMuZ2V0Um93SGVpZ2h0KGkpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuaGVpZ2h0cyA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHRzID0gdGhpcy5jYWxjSGVpZ2h0cygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCByZW1haW5pbmdfaGVpZ2h0ID0gc2l6ZS55IC0gc3VtKHRoaXMuaGVpZ2h0cyk7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBbaWR4LCByb3ddIG9mIHRoaXMucm93cy5lbnRyaWVzKCkpe1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHJvdy5lbmRzV2l0aChcIiVcIikpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlaWdodHNbaWR4XSA9IHBpeGVsKHJvdywgcmVtYWluaW5nX2hlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGkxOG5fdHMuYXBwTW9kZSA9PSBBcHBNb2RlLmxlc3NvblBsYXkpe1xyXG4gICAgICAgICAgICBtc2coYCR7XCIgXCIucmVwZWF0KDQgKiBuZXN0KX0gaWQ6JHt0aGlzLmlkfSB3aWR0aHM6JHt3aWR0aHMubWFwKHggPT4geC50b0ZpeGVkKCkpfSBoZWlnaHRzOiR7dGhpcy5oZWlnaHRzLm1hcCh4ID0+IHgudG9GaXhlZCgpKX1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByb3cgPSAwO1xyXG4gICAgICAgIGxldCBjb2xfaWR4ID0gMDtcclxuICAgICAgICBsZXQgY2hpbGRfeCA9IDA7XHJcbiAgICAgICAgbGV0IGNoaWxkX3kgPSAwO1xyXG4gICAgICAgIGZvcihjb25zdCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKXtcclxuICAgICAgICAgICAgbGV0IGNoaWxkX3dpZHRoIDogbnVtYmVyO1xyXG4gICAgICAgICAgICBpZihjaGlsZC5jb2xzcGFuID09IDEpe1xyXG4gICAgICAgICAgICAgICAgY2hpbGRfd2lkdGggPSB3aWR0aHNbY29sX2lkeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGNoaWxkX3dpZHRoID0gc3VtKHdpZHRocy5zbGljZShjb2xfaWR4LCBjb2xfaWR4ICsgY2hpbGQuY29sc3BhbikpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoaWxkLmxheW91dChjaGlsZF94LCBjaGlsZF95LCBuZXcgVmVjMihjaGlsZF93aWR0aCwgdGhpcy5oZWlnaHRzW3Jvd10pLCBuZXN0ICsgMSApO1xyXG5cclxuICAgICAgICAgICAgaWYoY29sX2lkeCArIGNoaWxkLmNvbHNwYW4gPCB3aWR0aHMubGVuZ3RoKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjaGlsZF94ICs9IHdpZHRoc1tjb2xfaWR4XTtcclxuICAgICAgICAgICAgICAgIGNvbF9pZHggKz0gY2hpbGQuY29sc3BhbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgY2hpbGRfeCAgID0gMDtcclxuICAgICAgICAgICAgICAgIGNoaWxkX3kgKz0gdGhpcy5oZWlnaHRzW3Jvd107XHJcblxyXG4gICAgICAgICAgICAgICAgY29sX2lkeCA9IDA7XHJcbiAgICAgICAgICAgICAgICByb3crKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gIFxyXG5cclxuXHJcbiAgICB1cGRhdGVSb290TGF5b3V0KCl7XHJcbiAgICAgICAgdGhpcy5nZXRBbGxVSSgpLmZvckVhY2goeCA9PiB4Lm1pblNpemUgPSB1bmRlZmluZWQpO1xyXG4gICAgICAgIGNvbnN0IHNpemUgPSB0aGlzLmdldE1pblNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHggOiBudW1iZXI7XHJcbiAgICAgICAgbGV0IHkgOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY29sdW1ucyAhPSB1bmRlZmluZWQgJiYgdGhpcy5jb2x1bW5zLnNvbWUoeCA9PiB4LmVuZHNXaXRoKFwiJVwiKSkpe1xyXG5cclxuICAgICAgICAgICAgc2l6ZS54ID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgICAgIHggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgeCA9IE1hdGgubWF4KDAsIDAuNSAqICh3aW5kb3cuaW5uZXJXaWR0aCAgLSBzaXplLngpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMucm93cyAhPSB1bmRlZmluZWQgJiYgdGhpcy5yb3dzLnNvbWUoeCA9PiB4LmVuZHNXaXRoKFwiJVwiKSkpe1xyXG5cclxuICAgICAgICAgICAgc2l6ZS55ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgICAgICB5ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIHkgPSBNYXRoLm1heCgwLCAwLjUgKiAod2luZG93LmlubmVySGVpZ2h0IC0gc2l6ZS55KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxheW91dCh4LCB5LCBzaXplLCAwKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNlbGVjdGlvbkxpc3QgZXh0ZW5kcyBHcmlkIHtcclxuICAgIHNlbGVjdGVkSW5kZXggOiBudW1iZXIgPSBOYU47XHJcbiAgICBzZWxlY3Rpb25DaGFuZ2VkPyA6IChpbmRleDpudW1iZXIpPT52b2lkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyICYgeyBvcmllbnRhdGlvbj8gOiBPcmllbnRhdGlvbiwgY2hpbGRyZW4gOiBSYWRpb0J1dHRvbltdLCBzZWxlY3RlZEluZGV4PyA6IG51bWJlciwgc2VsZWN0aW9uQ2hhbmdlZD8gOiAoaW5kZXg6bnVtYmVyKT0+dm9pZCB9KXtcclxuICAgICAgICBpZihkYXRhLm9yaWVudGF0aW9uID09IE9yaWVudGF0aW9uLnZlcnRpY2FsKXtcclxuICAgICAgICAgICAgKGRhdGEgYXMgYW55KS5yb3dzICAgID0gZGF0YS5jaGlsZHJlbi5tYXAoXyA9PiBcImF1dG9cIikuam9pbihcIiBcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIChkYXRhIGFzIGFueSkuY29sdW1ucyA9IGRhdGEuY2hpbGRyZW4ubWFwKF8gPT4gXCJhdXRvXCIpLmpvaW4oXCIgXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgaWYoZGF0YS5zZWxlY3RlZEluZGV4ICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IGRhdGEuc2VsZWN0ZWRJbmRleDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGRhdGEuc2VsZWN0aW9uQ2hhbmdlZCAhPSB1bmRlZmluZWQpe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25DaGFuZ2VkID0gZGF0YS5zZWxlY3Rpb25DaGFuZ2VkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IFtpZHgsIHVpXSBvZiB0aGlzLmNoaWxkcmVuLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIHVpLmh0bWwoKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2IDogTW91c2VFdmVudCk9PntcclxuICAgICAgICAgICAgICAgIG1zZyhgc2VsZWN0aW9uLUNoYW5nZWRbJHtpZHh9XWApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gaWR4O1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5zZWxlY3Rpb25DaGFuZ2VkICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25DaGFuZ2VkKGlkeCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRTdHlsZSgpIDogVUkge1xyXG4gICAgICAgIHN1cGVyLnNldFN0eWxlKCk7XHJcblxyXG4gICAgICAgIC8vIG1zZyhgc2VsZWN0ZWQtSW5kZXggOiAke3RoaXMuc2VsZWN0ZWRJbmRleH1gKTtcclxuICAgICAgICBpZighaXNOYU4odGhpcy5zZWxlY3RlZEluZGV4KSl7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW5bdGhpcy5zZWxlY3RlZEluZGV4XS5zZWxlY3RVSSh0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRGlhbG9nIGV4dGVuZHMgVUkge1xyXG4gICAgZGl2IDogSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBjb250ZW50IDogVUk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIgJiB7IGNvbnRlbnQgOiBVSSB9KXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnQgPSBkYXRhLmNvbnRlbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICB0aGlzLmRpdi5zdHlsZS5wb3NpdGlvbiA9IFwiZml4ZWRcIjtcclxuICAgICAgICB0aGlzLmRpdi5zdHlsZS56SW5kZXggID0gXCIxXCI7XHJcblxyXG4gICAgICAgIHRoaXMuZGl2LmFwcGVuZCh0aGlzLmNvbnRlbnQuaHRtbCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBodG1sKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGl2O1xyXG4gICAgfVxyXG5cclxuICAgIHNldFhZKHggOiBudW1iZXIsIHkgOiBudW1iZXIpe1xyXG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLm1hcmdpbkxlZnQgPSBgJHt4fXB4YDtcclxuICAgICAgICB0aGlzLmRpdi5zdHlsZS5tYXJnaW5Ub3AgID0gYCR7eX1weGA7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1N0eWxlKHBhZ2VYIDogMCwgcGFnZVkgOiAwKXtcclxuICAgICAgICBjb25zdCBzaXplID0gdGhpcy5jb250ZW50LmdldE1pblNpemUoKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnQubGF5b3V0KDAsIDAsIHNpemUsIDApO1xyXG5cclxuICAgICAgICAvLyBtc2coYGRsZzogJHtzaXplLnh9ICR7c2l6ZS55fSAke3BhZ2VYfSAke3BhZ2VZfWApO1xyXG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLndpZHRoICA9IGAke3NpemUueCArIDEwfXB4YDtcclxuICAgICAgICB0aGlzLmRpdi5zdHlsZS5oZWlnaHQgPSBgJHtzaXplLnkgKyAxMH1weGA7XHJcblxyXG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLm1hcmdpbkxlZnQgPSBgJHtwYWdlWH1weGA7XHJcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUubWFyZ2luVG9wICA9IGAke3BhZ2VZfXB4YDtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kaXYucGFyZW50RWxlbWVudCA9PSBtb2RhbERsZztcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSgpe1xyXG4gICAgICAgIG1vZGFsRGxnLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgbW9kYWxEbGcuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dNb2RhbCgpe1xyXG4gICAgLypcclxuICAgICAgICBzZXRUaW1lb3V0KCgpPT57XHJcbiAgICAgICAgICAgIC8vIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBjYW4gYmUgdXNlZCBhZnRlciBzaG93TW9kYWxcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1N0eWxlKDAsIDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgKi9cclxuICAgICAgICBpZih0aGlzLmRpdi5wYXJlbnRFbGVtZW50ICE9IG1vZGFsRGxnKXtcclxuXHJcbiAgICAgICAgICAgIG1vZGFsRGxnLmFwcGVuZCh0aGlzLmRpdik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNob3dTdHlsZSgwLCAwKTtcclxuXHJcbiAgICAgICAgbW9kYWxEbGcuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExvZyBleHRlbmRzIFVJIHtcclxuICAgIHN0YXRpYyBvbmUgOiBMb2c7XHJcblxyXG4gICAgZGxnIDogSFRNTERpYWxvZ0VsZW1lbnQ7XHJcbiAgICBwcmUgOiBIVE1MUHJlRWxlbWVudDtcclxuICAgIHRleHRzIDogc3RyaW5nID0gXCJcIjtcclxuICAgIGxhc3RUZXh0IDogc3RyaW5nID0gXCJcIjtcclxuICAgIGNvdW50IDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBzdGF0aWMgaW5pdCgpe1xyXG4gICAgICAgIGlmKExvZy5vbmUgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgTG9nLm9uZSA9IG5ldyBMb2coeyB3aWR0aCA6IGAkezAuNSAqIHdpbmRvdy5pbm5lcldpZHRofXB4YCwgaGVpZ2h0IDogYCR7MC41ICogd2luZG93LmlubmVySGVpZ2h0fXB4YCB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGxvZyh0ZXh0IDogc3RyaW5nKXtcclxuICAgICAgICBMb2cuaW5pdCgpO1xyXG4gICAgICAgIExvZy5vbmUuYWRkVGV4dCh0ZXh0KTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvdyhldiA6IE1vdXNlRXZlbnQpe1xyXG4gICAgICAgIGlmKExvZy5vbmUuZGxnLm9wZW4pe1xyXG5cclxuICAgICAgICAgICAgTG9nLm9uZS5kbGcuY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIExvZy5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICBMb2cub25lLmRsZy5zdHlsZS5tYXJnaW5Ub3AgPSBgJHswLjggKiB3aW5kb3cuaW5uZXJIZWlnaHR9cHhgO1xyXG4gICAgICAgICAgICBMb2cub25lLmRsZy5zaG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICBpZihkYXRhLndpZHRoID09IHVuZGVmaW5lZCB8fCBkYXRhLmhlaWdodCA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgd2lkdGhfcHggID0gcGl4ZWwoZGF0YS53aWR0aCk7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0X3B4ID0gcGl4ZWwoZGF0YS5oZWlnaHQpO1xyXG5cclxuICAgICAgICB0aGlzLmRsZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaWFsb2dcIik7XHJcbiAgICAgICAgdGhpcy5kbGcuc3R5bGUucG9zaXRpb24gPSBcImZpeGVkXCI7XHJcbiAgICAgICAgdGhpcy5kbGcuc3R5bGUud2lkdGggID0gYCR7d2lkdGhfcHh9cHhgO1xyXG4gICAgICAgIHRoaXMuZGxnLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodF9weH1weGA7XHJcbiAgICAgICAgdGhpcy5kbGcuc3R5bGUucGFkZGluZyA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuZGxnLnN0eWxlLm1hcmdpblJpZ2h0ICA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuZGxnLnN0eWxlLnpJbmRleCA9IFwiMVwiO1xyXG5cclxuICAgICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5zdHlsZS53aWR0aCAgPSBcIjEwMCVcIjtcclxuICAgICAgICBkaXYuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcbiAgICAgICAgZGl2LnN0eWxlLm92ZXJmbG93ID0gXCJhdXRvXCJcclxuICAgICAgICBkaXYuc3R5bGUucGFkZGluZyA9IFwiMFwiO1xyXG5cclxuICAgICAgICB0aGlzLnByZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwcmVcIik7XHJcbiAgICAgICAgdGhpcy5wcmUuc3R5bGUud2lkdGggID0gXCIxMDAlXCI7XHJcbiAgICAgICAgdGhpcy5wcmUuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcblxyXG4gICAgICAgIGRpdi5hcHBlbmQodGhpcy5wcmUpO1xyXG4gICAgICAgIHRoaXMuZGxnLmFwcGVuZChkaXYpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKHRoaXMuZGxnKTtcclxuICAgIH1cclxuXHJcbiAgICBodG1sKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGxnO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZFRleHQodGV4dCA6IHN0cmluZyl7XHJcbiAgICAgICAgaWYodGV4dCA9PSB0aGlzLmxhc3RUZXh0KXtcclxuICAgICAgICAgICAgaWYodGV4dCAhPSBcIlwiKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvdW50Kys7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMucHJlLmlubmVyVGV4dCA9IHRoaXMudGV4dHMgKyBgXFxuJHt0aGlzLmNvdW50fTpgICsgdGV4dDsgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhpcy50ZXh0cyArPSBcIlxcblwiICsgdGhpcy5sYXN0VGV4dDtcclxuICAgICAgICAgICAgdGhpcy5sYXN0VGV4dCA9IHRleHQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnByZS5pbm5lclRleHQgPSB0aGlzLnRleHRzICsgXCJcXG5cIiArIHRleHQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNvdW50ID0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMYXlvdXQge1xyXG4gICAgc3RhdGljIHJvb3QgOiBHcmlkO1xyXG5cclxuICAgIHN0YXRpYyBpbml0TGF5b3V0KHJvb3QgOiBHcmlkKXtcclxuICAgICAgICBMYXlvdXQucm9vdCA9IHJvb3Q7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKHJvb3QuZGl2KTtcclxuICAgICAgICBMYXlvdXQucm9vdC51cGRhdGVSb290TGF5b3V0KCk7XHJcbiAgICBcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoZXYgOiBVSUV2ZW50KT0+e1xyXG4gICAgICAgICAgICBMYXlvdXQucm9vdC51cGRhdGVSb290TGF5b3V0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG1vZGFsRGxnID0gJGRpdihcIm1vZGFsX2RsZ1wiKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVCbG9iKGFuY2hvciA6IEFuY2hvciwgbmFtZSA6IHN0cmluZywgYmxvYiA6IEJsb2Ipe1xyXG4gICAgLy8gYSDopoHntKDjga4gaHJlZiDlsZ7mgKfjgasgT2JqZWN0IFVSTCDjgpLjgrvjg4Pjg4hcclxuICAgIGFuY2hvci5hbmNob3IuaHJlZiA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gICAgXHJcbiAgICAvLyBhIOimgee0oOOBriBkb3dubG9hZCDlsZ7mgKfjgavjg5XjgqHjgqTjg6vlkI3jgpLjgrvjg4Pjg4hcclxuICAgIGFuY2hvci5hbmNob3IuZG93bmxvYWQgPSBgJHtuYW1lfS5qc29uYDtcclxuICAgIFxyXG4gICAgLy8g55aR5Ly855qE44GrIGEg6KaB57Sg44KS44Kv44Oq44OD44Kv44GV44Gb44KLXHJcbiAgICBhbmNob3IuYW5jaG9yLmNsaWNrKCk7XHJcblxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGxhYmVsKGRhdGEgOiBBdHRyICYgeyB0ZXh0IDogc3RyaW5nIH0pIDogTGFiZWwge1xyXG4gICAgcmV0dXJuIG5ldyBMYWJlbChkYXRhKS5zZXRTdHlsZSgpIGFzIExhYmVsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGlucHV0X3RleHQoZGF0YSA6IEF0dHIgJiB7IHRleHQgOiBzdHJpbmcsIGNoYW5nZT8gOiBFdmVudENhbGxiYWNrIH0pIDogSW5wdXRUZXh0IHtcclxuICAgIHJldHVybiBuZXcgSW5wdXRUZXh0KGRhdGEpLnNldFN0eWxlKCkgYXMgSW5wdXRUZXh0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGlucHV0X2NvbG9yKGRhdGEgOiBBdHRyICYgeyB0ZXh0IDogc3RyaW5nLCBjaGFuZ2U/IDogRXZlbnRDYWxsYmFjayB9KSA6IElucHV0Q29sb3Ige1xyXG4gICAgcmV0dXJuIG5ldyBJbnB1dENvbG9yKGRhdGEpLnNldFN0eWxlKCkgYXMgSW5wdXRDb2xvcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRpbnB1dF9udW1iZXIoZGF0YSA6IEF0dHIgJiB7IHZhbHVlPyA6IG51bWJlciwgc3RlcD8gOiBudW1iZXIsIG1pbj8gOiBudW1iZXIsIG1heD8gOiBudW1iZXIsIGNoYW5nZT8gOiBFdmVudENhbGxiYWNrIH0pIDogSW5wdXROdW1iZXIge1xyXG4gICAgcmV0dXJuIG5ldyBJbnB1dE51bWJlcihkYXRhKS5zZXRTdHlsZSgpIGFzIElucHV0TnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGlucHV0X3JhbmdlKGRhdGEgOiBBdHRyICYgeyB2YWx1ZT8gOiBudW1iZXIsIHN0ZXA/IDogbnVtYmVyLCBtaW4/IDogbnVtYmVyLCBtYXg/IDogbnVtYmVyLCBjaGFuZ2U/IDogRXZlbnRDYWxsYmFjayB9KSA6IElucHV0UmFuZ2Uge1xyXG4gICAgcmV0dXJuIG5ldyBJbnB1dFJhbmdlKGRhdGEpLnNldFN0eWxlKCkgYXMgSW5wdXRSYW5nZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRjaGVja2JveChkYXRhIDogQXR0ciAmIHsgdGV4dCA6IHN0cmluZywgY2hhbmdlPyA6IEV2ZW50Q2FsbGJhY2sgfSkgOiBDaGVja0JveCB7XHJcbiAgICByZXR1cm4gbmV3IENoZWNrQm94KGRhdGEpLnNldFN0eWxlKCkgYXMgQ2hlY2tCb3g7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkdGV4dGFyZWEoZGF0YSA6IEF0dHIgJiB7IHZhbHVlPyA6IHN0cmluZywgY29scz8gOiBudW1iZXIsIHJvd3M/IDogbnVtYmVyLCBwbGFjZWhvbGRlcj8gOiBzdHJpbmcsIGNoYW5nZT8gOiBFdmVudENhbGxiYWNrIH0pIDogVGV4dEFyZWEge1xyXG4gICAgcmV0dXJuIG5ldyBUZXh0QXJlYShkYXRhKS5zZXRTdHlsZSgpIGFzIFRleHRBcmVhO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGltZyhkYXRhIDogQXR0ciAmIHsgaW1nVXJsIDogc3RyaW5nLCBmaWxlPyA6IEZpbGUsIGNsaWNrPyA6IE1vdXNlRXZlbnRDYWxsYmFjayB9KSA6IEltZyB7XHJcbiAgICByZXR1cm4gbmV3IEltZyhkYXRhKS5zZXRTdHlsZSgpIGFzIEltZztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRidXR0b24oZGF0YSA6IEF0dHIgJiB7IHZhbHVlPyA6IHN0cmluZywgdGV4dD8gOiBzdHJpbmcsIHVybD8gOiBzdHJpbmcsIGNsaWNrPyA6IE1vdXNlRXZlbnRDYWxsYmFjayB9KSA6IEJ1dHRvbiB7XHJcbiAgICByZXR1cm4gbmV3IEJ1dHRvbihkYXRhKS5zZXRTdHlsZSgpIGFzIEJ1dHRvbjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRhbmNob3IoZGF0YSA6IEF0dHIgJiB7IHRleHQ/IDogc3RyaW5nLCB1cmw/IDogc3RyaW5nIH0pIDogQW5jaG9yIHtcclxuICAgIHJldHVybiBuZXcgQW5jaG9yKGRhdGEpLnNldFN0eWxlKCkgYXMgQW5jaG9yO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJHJhZGlvKGRhdGEgOiBBdHRyICYgeyBpZD8gOiBzdHJpbmcsIHZhbHVlIDogc3RyaW5nLCB0aXRsZT8gOiBzdHJpbmcsIHRleHQ/IDogc3RyaW5nLCB1cmw/IDogc3RyaW5nIH0pIDogUmFkaW9CdXR0b24ge1xyXG4gICAgcmV0dXJuIG5ldyBSYWRpb0J1dHRvbihkYXRhKS5zZXRTdHlsZSgpIGFzIFJhZGlvQnV0dG9uO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJHRleHRib3goZGF0YSA6IEF0dHIgJiB7IHRleHQgOiBzdHJpbmcgfSkgOiBUZXh0Qm94IHtcclxuICAgIHJldHVybiBuZXcgVGV4dEJveChkYXRhKS5zZXRTdHlsZSgpIGFzIFRleHRCb3g7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkbGF0ZXgoZGF0YSA6IEF0dHIgJiB7IHRleHQgOiBzdHJpbmcsIGNsaWNrPyA6IE1vdXNlRXZlbnRDYWxsYmFjayB9KSA6IExhVGVYQm94IHtcclxuICAgIHJldHVybiBuZXcgTGFUZVhCb3goZGF0YSkuc2V0U3R5bGUoKSBhcyBMYVRlWEJveDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRibG9jayhkYXRhIDogQXR0ciAmIHsgY2hpbGRyZW4gOiBVSVtdIH0pIDogQmxvY2sge1xyXG4gICAgcmV0dXJuIG5ldyBCbG9jayhkYXRhKS5zZXRTdHlsZSgpIGFzIEJsb2NrO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGdyaWQoZGF0YSA6IEF0dHIgJiB7IGNvbHVtbnM/OiBzdHJpbmcsIHJvd3M/IDogc3RyaW5nLCBjaGlsZHJlbiA6IFVJW10gfSkgOiBHcmlkIHtcclxuICAgIHJldHVybiBuZXcgR3JpZChkYXRhKS5zZXRTdHlsZSgpIGFzIEdyaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkc2VsZWN0aW9uKGRhdGEgOiBBdHRyICYgeyBvcmllbnRhdGlvbj8gOiBPcmllbnRhdGlvbiwgY2hpbGRyZW4gOiBSYWRpb0J1dHRvbltdLCBzZWxlY3RlZEluZGV4PyA6IG51bWJlciwgc2VsZWN0aW9uQ2hhbmdlZD8gOiAoaW5kZXg6bnVtYmVyKT0+dm9pZCB9KSA6IFNlbGVjdGlvbkxpc3Qge1xyXG4gICAgcmV0dXJuIG5ldyBTZWxlY3Rpb25MaXN0KGRhdGEpLnNldFN0eWxlKCkgYXMgU2VsZWN0aW9uTGlzdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRmbGV4KGRhdGEgOiBBdHRyICYgeyBkaXJlY3Rpb24/OiBzdHJpbmcsIGNoaWxkcmVuIDogVUlbXSB9KSA6IEZsZXgge1xyXG4gICAgcmV0dXJuIG5ldyBGbGV4KGRhdGEpLnNldFN0eWxlKCkgYXMgRmxleDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRwb3B1cChkYXRhIDogQXR0ciAmIHsgZGlyZWN0aW9uPzogc3RyaW5nLCBjaGlsZHJlbiA6IFVJW10sIGNsaWNrPyA6IChpbmRleCA6IG51bWJlciwgaWQ/IDogc3RyaW5nLCB2YWx1ZT8gOiBzdHJpbmcpPT52b2lkIH0pIDogUG9wdXBNZW51IHtcclxuICAgIHJldHVybiBuZXcgUG9wdXBNZW51KGRhdGEpLnNldFN0eWxlKCkgYXMgUG9wdXBNZW51O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGRpYWxvZyhkYXRhIDogQXR0ciAmIHsgY29udGVudCA6IFVJLCBva0NsaWNrPyA6IE1vdXNlRXZlbnRDYWxsYmFjayB9KSA6IERpYWxvZyB7XHJcbiAgICByZXR1cm4gbmV3IERpYWxvZyhkYXRhKS5zZXRTdHlsZSgpIGFzIERpYWxvZztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRpbWdkaXYoZGF0YSA6IEF0dHIgJiB7IHVwbG9hZEltZ0ZpbGUgOiAoZmlsZSA6IEZpbGUpPT5Qcm9taXNlPHN0cmluZz4gfSkgOiBJbWdEaXYge1xyXG4gICAgcmV0dXJuIG5ldyBJbWdEaXYoZGF0YSkuc2V0U3R5bGUoKSBhcyBJbWdEaXY7XHJcbn1cclxuXHJcbn0iLCJuYW1lc3BhY2UgbGF5b3V0X3RzIHtcclxuLy9cclxuXHJcbmV4cG9ydCBjbGFzcyBJbWdEaXYgZXh0ZW5kcyBVSSB7XHJcbiAgICBkaXYgOiBIVE1MRGl2RWxlbWVudDtcclxuICAgIGltZyA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcbiAgICB1cGxvYWRJbWdGaWxlIDogKGZpbGUgOiBGaWxlKT0+UHJvbWlzZTxzdHJpbmc+O1xyXG4gICAgaW1nVXJsIDogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0ciAmIHsgdXBsb2FkSW1nRmlsZSA6IChmaWxlIDogRmlsZSk9PlByb21pc2U8c3RyaW5nPiB9KXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnVwbG9hZEltZ0ZpbGUgPSBkYXRhLnVwbG9hZEltZ0ZpbGU7XHJcblxyXG4gICAgICAgIHRoaXMuZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICB0aGlzLmRpdi5zdHlsZS5kaXNwbGF5ICAgICAgICA9IFwiZmxleFwiO1xyXG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLmp1c3RpZnlDb250ZW50ID0gXCJjZW50ZXJcIjtcclxuICAgICAgICB0aGlzLmRpdi5zdHlsZS5hbGlnbkl0ZW1zICAgICA9IFwiY2VudGVyXCI7XHJcblxyXG4gICAgICAgIHRoaXMuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcclxuICAgICAgICB0aGlzLmltZy5zdHlsZS5tYXhXaWR0aCAgPSBcIjEwMCVcIjtcclxuICAgICAgICB0aGlzLmltZy5zdHlsZS5tYXhIZWlnaHQgPSBcIjEwMCVcIjtcclxuXHJcbiAgICAgICAgdGhpcy5kaXYuYXBwZW5kKHRoaXMuaW1nKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCAoZXYgOiBEcmFnRXZlbnQpPT57XHJcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0cyhldik7XHJcbiAgICAgICAgICAgIG1zZyhcImRyYWcgZW50ZXJcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGV2IDogRHJhZ0V2ZW50KT0+e1xyXG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdHMoZXYpO1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5jbGFzc0xpc3QuYWRkKCdkcmFnb3ZlcicpXHJcbiAgICBcclxuICAgICAgICAgICAgbXNnKFwiZHJhZyBvdmVyXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCAoZXYgOiBEcmFnRXZlbnQpPT57XHJcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0cyhldik7XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdvdmVyJyk7XHJcbiAgICAgICAgICAgIG1zZyhcImRyYWcgbGVhdmVcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBhc3luYyAoZXYgOiBEcmFnRXZlbnQpPT57XHJcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0cyhldik7XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdvdmVyJyk7XHJcbiAgICBcclxuICAgICAgICAgICAgbXNnKFwiZHJvcFwiKTtcclxuICAgICAgICAgICAgY29uc3QgZHQgPSBldi5kYXRhVHJhbnNmZXI7XHJcbiAgICAgICAgICAgIGlmKGR0ID09IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBBcnJheS5mcm9tKGR0LmZpbGVzKTtcclxuICAgIFxyXG4gICAgICAgICAgICBtc2coYCR7ZmlsZXN9YCk7XHJcbiAgICBcclxuICAgICAgICAgICAgaWYoZmlsZXMubGVuZ3RoID09IDEpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IGZpbGVzWzBdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKGZpbGUudHlwZSA9PSBcImltYWdlL3BuZ1wiIHx8IGZpbGUudHlwZSA9PSBcImltYWdlL2pwZWdcIil7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNldEltZ0ZpbGUodGhpcy5pbWcsIGZpbGUpO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVcmwgPSBhd2FpdCB0aGlzLnVwbG9hZEltZ0ZpbGUoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNleyAgICBcclxuICAgICAgICAgICAgICAgICAgICBtc2coYEZpbGUgbmFtZTogJHtmaWxlLm5hbWV9LCBGaWxlIHNpemU6ICR7ZmlsZS5zaXplfSwgRmlsZSB0eXBlOiAke2ZpbGUudHlwZX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGh0bWwoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRpdjtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJbWdVcmwodXJsIDogc3RyaW5nKXtcclxuICAgICAgICB0aGlzLmltZy5zcmMgPSB1cmw7XHJcbiAgICAgICAgdGhpcy5pbWdVcmwgID0gdXJsO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFySW1nKCl7XHJcbiAgICAgICAgdGhpcy5pbWcuc3JjID0gXCJcIjtcclxuICAgICAgICB0aGlzLmltZ1VybCAgPSBcIlwiO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBwcmV2ZW50RGVmYXVsdHMoZXY6RHJhZ0V2ZW50KSB7XHJcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpOyBcclxuICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VEbGcoKSA6IGJvb2xlYW4ge1xyXG4gICAgaWYobW9kYWxEbGcuc3R5bGUuZGlzcGxheSAhPSBcIm5vbmVcIil7XHJcbiAgICAgICAgbW9kYWxEbGcuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgIG1vZGFsRGxnLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG59IiwibmFtZXNwYWNlIGxheW91dF90cyB7XHJcbi8vXHJcbmV4cG9ydCBmdW5jdGlvbiBtYWtlVGVzdFVJKCl7XHJcbiAgICBjb25zdCBbIG9yaWdpbiwgLCBdID0gaTE4bl90cy5wYXJzZVVSTCgpO1xyXG5cclxuICAgIGNvbnN0IGltZ19tZW51ID0gJHBvcHVwKHtcclxuICAgICAgICBjaGlsZHJlbiA6IFtcclxuICAgICAgICAgICAgJGJ1dHRvbih7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA6IFwiMjRweFwiLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0IDogXCIyNHB4XCIsXHJcbiAgICAgICAgICAgICAgICB1cmwgOiBgJHtvcmlnaW59L2xpYi9wbGFuZS9pbWcvbGluZS1zZWdtZW50LnBuZ2BcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAkYnV0dG9uKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoIDogXCIyNHB4XCIsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgOiBcIjI0cHhcIixcclxuICAgICAgICAgICAgICAgIHVybCA6IGAke29yaWdpbn0vbGliL3BsYW5lL2ltZy9oYWxmLWxpbmUucG5nYFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICRidXR0b24oe1xyXG4gICAgICAgICAgICAgICAgd2lkdGggOiBcIjI0cHhcIixcclxuICAgICAgICAgICAgICAgIGhlaWdodCA6IFwiMjRweFwiLFxyXG4gICAgICAgICAgICAgICAgdXJsIDogYCR7b3JpZ2lufS9saWIvcGxhbmUvaW1nL2xpbmUucG5nYFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIF1cclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHRleHRfbWVudSA9ICRwb3B1cCh7XHJcbiAgICAgICAgZGlyZWN0aW9uIDogXCJjb2x1bW5cIixcclxuICAgICAgICBjaGlsZHJlbiA6IFtcclxuICAgICAgICAgICAgJGJ1dHRvbih7XHJcbiAgICAgICAgICAgICAgICB0ZXh0IDogXCJDdXRcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICRidXR0b24oe1xyXG4gICAgICAgICAgICAgICAgdGV4dCA6IFwiQ29weVwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICxcclxuICAgICAgICAgICAgJGJ1dHRvbih7XHJcbiAgICAgICAgICAgICAgICB0ZXh0IDogXCJQYXN0ZVwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgXVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgcm9vdCA9ICRncmlkKHtcclxuICAgICAgICByb3dzICAgICA6IFwiNTBweCA1MHB4IDEwMCVcIixcclxuICAgICAgICBjaGlsZHJlbjpbXHJcbiAgICAgICAgICAgICRibG9jayh7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA6IFtdLFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICRncmlkKHtcclxuICAgICAgICAgICAgICAgIGNvbHVtbnMgIDogXCI1MCUgNTAlXCIsXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICAgICAgICAgICRibG9jayh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuIDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNoZWNrYm94KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0IDogXCJBeGlzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgJGJsb2NrKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4gOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkYnV0dG9uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0IDogXCJQbGF5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2sgOiBhc3luYyAoZXY6TW91c2VFdmVudCk9Pnt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICxcclxuICAgICAgICAgICAgJGdyaWQoe1xyXG4gICAgICAgICAgICAgICAgY29sdW1ucyAgOiBcIjUwcHggNTAlIDUwJSAzMDBweFwiLFxyXG5cclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuIDogW1xyXG4gICAgICAgICAgICAgICAgICAgICRibG9jayh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuIDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJhZGlvKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoIDogXCIyNHB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IDogXCIyNHB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsIDogYCR7b3JpZ2lufS9saWIvcGxhbmUvaW1nL3NlbGVjdGlvbi5wbmdgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJhZGlvKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoIDogXCIyNHB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IDogXCIyNHB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsIDogYCR7b3JpZ2lufS9saWIvcGxhbmUvaW1nL3BvaW50LnBuZ2BcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgJGJsb2NrKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4gOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkYnV0dG9uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA6IFwiYWRkLXN0YXRlbWVudFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoIDogXCIyNHB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IDogXCIyNHB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsIDogYCR7b3JpZ2lufS9saWIvcGxhbmUvaW1nL3RleHQucG5nYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljayA6IGFzeW5jIChldiA6IE1vdXNlRXZlbnQpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyhcInNob3cgdGV4dCBtZW51XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0X21lbnUuc2hvdyhldik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRidXR0b24oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoIDogXCIyNHB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IDogXCIyNHB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsIDogYCR7b3JpZ2lufS9saWIvcGxhbmUvaW1nL3N0YXRlbWVudC5wbmdgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrIDogYXN5bmMgKGV2IDogTW91c2VFdmVudCk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nX21lbnUuc2hvdyhldik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAkYmxvY2soe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbiA6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICRibG9jayh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuIDogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgXVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJvb3Q7XHJcbn1cclxuXHJcbn0iXX0=