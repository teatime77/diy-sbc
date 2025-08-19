"use strict";
var diagram_ts;
(function (diagram_ts) {
    //
    diagram_ts.MyError = i18n_ts.MyError;
    diagram_ts.assert = i18n_ts.assert;
    diagram_ts.msg = i18n_ts.msg;
    diagram_ts.range = i18n_ts.range;
    diagram_ts.range2 = i18n_ts.range2;
    diagram_ts.setPlayMode = i18n_ts.setPlayMode;
    diagram_ts.PlayMode = i18n_ts.PlayMode;
    diagram_ts.sleep = i18n_ts.sleep;
    diagram_ts.append = i18n_ts.append;
    diagram_ts.$ = i18n_ts.$;
    diagram_ts.last = i18n_ts.last;
    diagram_ts.unique = i18n_ts.unique;
    diagram_ts.remove = i18n_ts.remove;
    diagram_ts.arrayFill = i18n_ts.arrayFill;
    diagram_ts.sum = i18n_ts.sum;
    diagram_ts.list = i18n_ts.list;
    diagram_ts.intersection = i18n_ts.intersection;
    diagram_ts.permutation = i18n_ts.permutation;
    diagram_ts.circularPermutation = i18n_ts.circularPermutation;
    diagram_ts.areSetsEqual = i18n_ts.areSetsEqual;
    diagram_ts.isSubSet = i18n_ts.isSubSet;
    diagram_ts.check = i18n_ts.check;
    diagram_ts.Speech = i18n_ts.Speech;
    diagram_ts.parseMath = parser_ts.parseMath;
    diagram_ts.renderKatexSub = parser_ts.renderKatexSub;
    diagram_ts.showFlow = parser_ts.showFlow;
    diagram_ts.makeIdToTermMap = parser_ts.makeIdToTermMap;
    diagram_ts.Rational = parser_ts.Rational;
    diagram_ts.Term = parser_ts.Term;
    diagram_ts.ConstNum = parser_ts.ConstNum;
    diagram_ts.App = parser_ts.App;
    diagram_ts.RefVar = parser_ts.RefVar;
    diagram_ts.operator = parser_ts.operator;
    diagram_ts.Vec2 = plane_ts.Vec2;
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    //
    const AUTO = "auto";
    const TextSizeFill = 8;
    diagram_ts.textColor = "black";
    function ratio(width) {
        width = width.trim();
        diagram_ts.assert(width.endsWith("%"));
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
        throw new diagram_ts.MyError();
    }
    function setContext2D(ctx, ui) {
        ui.ctx = ctx;
        ui.children().forEach(child => setContext2D(ctx, child));
    }
    diagram_ts.setContext2D = setContext2D;
    class UI {
        static count = 0;
        idx;
        ctx;
        position = diagram_ts.Vec2.zero();
        boxSize = diagram_ts.Vec2.zero();
        width;
        height;
        minSize;
        colspan = 1;
        rowspan = 1;
        margin = [4, 4, 4, 4]; // left, right, top, bottom
        borderWidth = 3;
        padding = [0, 0, 0, 0]; // left, right, top, bottom
        horizontalAlign;
        backgroundColor;
        constructor(data) {
            this.idx = ++UI.count;
            if (data.colspan != undefined) {
                this.colspan = data.colspan;
            }
            this.backgroundColor = data.backgroundColor;
        }
        children() {
            return [];
        }
        getAllUISub(uis) {
            uis.push(this);
            this.children().forEach(x => x.getAllUISub(uis));
        }
        getAllUI() {
            let uis = [];
            this.getAllUISub(uis);
            return uis;
        }
        marginWidth() {
            return this.margin[0] + this.margin[1];
        }
        marginHeight() {
            return this.margin[2] + this.margin[3];
        }
        marginBorderPaddingWidth() {
            return this.margin[0] + this.margin[1] + 2 * this.borderWidth + this.padding[0] + this.padding[1];
        }
        marginBorderPaddingHeight() {
            return this.margin[2] + this.margin[3] + 2 * this.borderWidth + this.padding[2] + this.padding[3];
        }
        setMinSize() {
            this.minSize = diagram_ts.Vec2.zero();
            diagram_ts.msg(`set-min-size:${this.constructor.name}`);
        }
        getMinWidth() {
            diagram_ts.assert(this.minSize != undefined);
            return this.minSize.x;
        }
        getMinHeight() {
            diagram_ts.assert(this.minSize != undefined);
            return this.minSize.y;
        }
        setPosition(position) {
            this.position = position;
        }
        layout(x, y, size, nest) {
            this.boxSize = size;
            this.setPosition(new diagram_ts.Vec2(x, y));
        }
        drawBox() {
            const x = this.position.x + this.margin[0];
            const y = this.position.y + this.margin[2];
            const w = this.boxSize.x - this.marginWidth();
            const h = this.boxSize.y - this.marginHeight();
            return [new diagram_ts.Vec2(x, y), new diagram_ts.Vec2(w, h)];
        }
        draw() {
            const [pos, size] = this.drawBox();
            this.drawRidgeRect2(this.ctx, pos.x, pos.y, size.x, size.y, this.borderWidth);
        }
        str() {
            if (this.minSize == undefined) {
                throw new diagram_ts.MyError();
            }
            const width = (this.width != undefined ? `width:${this.width} ` : "");
            const height = (this.height != undefined ? `height:${this.height} ` : "");
            const minSize = (this.minSize != undefined ? `min-size:${this.minSize.x.toFixed()}, ${this.minSize.y.toFixed()} ` : "");
            const position = `pos:(${this.position.x},${this.position.y}) `;
            const boxSize = `box:(${this.boxSize.x},${this.boxSize.y}) `;
            return `${this.constructor.name} ${width}${height}${minSize}${position}${boxSize}`;
        }
        dump(nest) {
            diagram_ts.msg(`${" ".repeat(nest * 4)}${this.str()}`);
        }
        drawRidgeRect2(ctx, x, y, width, height, ridgeWidth, isInset = false) {
            // Define light and dark colors
            // const lightColor = isInset ? '#888' : '#eee'; // Darker for inset top/left
            // const darkColor = isInset ? '#eee' : '#888';  // Lighter for inset bottom/right
            const lightColor = "#ffffff";
            const darkColor = "#888888";
            const backgroundColor = (this.backgroundColor != undefined ? this.backgroundColor : "#cccccc");
            // Optionally, draw the inner rectangle (fill or another stroke)
            ctx.fillStyle = backgroundColor; // Example inner color
            ctx.fillRect(x + ridgeWidth, y + ridgeWidth, width - 2 * ridgeWidth, height - 2 * ridgeWidth);
            // Draw the "light" sides (top and left)
            ctx.strokeStyle = lightColor;
            ctx.lineWidth = ridgeWidth;
            ctx.beginPath();
            ctx.moveTo(x + ridgeWidth / 2, y + height - ridgeWidth / 2); // Bottom-left corner
            ctx.lineTo(x + ridgeWidth / 2, y + ridgeWidth / 2); // Top-left corner
            ctx.lineTo(x + width - ridgeWidth / 2, y + ridgeWidth / 2); // Top-right corner
            ctx.stroke();
            // Draw the "dark" sides (bottom and right)
            ctx.strokeStyle = darkColor;
            ctx.lineWidth = ridgeWidth;
            ctx.beginPath();
            ctx.moveTo(x + width - ridgeWidth / 2, y + ridgeWidth / 2); // Top-right corner
            ctx.lineTo(x + width - ridgeWidth / 2, y + height - ridgeWidth / 2); // Bottom-right corner
            ctx.lineTo(x + ridgeWidth / 2, y + height - ridgeWidth / 2); // Bottom-left corner
            ctx.stroke();
        }
        drawRidgeRect(ctx, x, y, width, height, borderWidth, isInset = false) {
            // Colors for ridge effect
            const lightColor = "#ffffff";
            const darkColor = "#888888";
            const backgroundColor = "#cccccc";
            // Fill rectangle background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, width, height);
            // Top & left (highlight)
            ctx.strokeStyle = lightColor;
            ctx.lineWidth = borderWidth;
            ctx.beginPath();
            ctx.moveTo(x + width, y); // Top-right
            ctx.lineTo(x, y); // Top-left
            ctx.lineTo(x, y + height); // Bottom-left
            ctx.stroke();
            // Bottom & right (shadow)
            ctx.strokeStyle = darkColor;
            ctx.beginPath();
            ctx.moveTo(x, y + height); // Bottom-left
            ctx.lineTo(x + width, y + height); // Bottom-right
            ctx.lineTo(x + width, y); // Top-right
            ctx.stroke();
        }
    }
    diagram_ts.UI = UI;
    class Filler extends UI {
    }
    diagram_ts.Filler = Filler;
    class TextUI extends UI {
        fontSize;
        textAlign;
        text;
        metrics;
        actualHeight;
        constructor(data) {
            super(data);
            this.fontSize = data.fontSize;
            this.textAlign = data.textAlign;
            this.text = (data.text != undefined ? data.text : "");
        }
        setMinSize() {
            this.metrics = this.ctx.measureText(this.text);
            this.actualHeight = this.metrics.actualBoundingBoxAscent + this.metrics.actualBoundingBoxDescent;
            diagram_ts.msg(`idx:[${this.idx}]  font :[${this.fontSize}]  w:[${this.metrics.width}] h:[${this.actualHeight}] [${this.text}]`);
            const width = this.metrics.width + this.marginBorderPaddingWidth() + TextSizeFill;
            const height = this.actualHeight + this.marginBorderPaddingHeight() + TextSizeFill;
            this.minSize = new diagram_ts.Vec2(width, height);
        }
        draw() {
            super.draw();
            const x = this.position.x + this.margin[0] + this.borderWidth + this.padding[0];
            const y = this.position.y + this.margin[2] + this.borderWidth + this.padding[2]
                + this.actualHeight;
            this.ctx.strokeStyle = diagram_ts.textColor;
            this.ctx.strokeText(this.text, x, y);
        }
        str() {
            return `${super.str()} text:${this.text}`;
        }
    }
    diagram_ts.TextUI = TextUI;
    class Label extends TextUI {
    }
    diagram_ts.Label = Label;
    class Button extends TextUI {
        click;
        constructor(data) {
            super(data);
            this.click = data.click;
        }
    }
    diagram_ts.Button = Button;
    class Node extends UI {
        constructor(data) {
            super(data);
        }
    }
    diagram_ts.Node = Node;
    class Editor extends UI {
        blocks = [];
        children() {
            return this.blocks.slice();
        }
        addBlock(block) {
            this.blocks.push(block);
        }
        draw() {
            super.draw();
            this.blocks.forEach(x => x.draw());
        }
    }
    diagram_ts.Editor = Editor;
    class Grid extends UI {
        colDescs;
        rowDescs;
        cells;
        minWidths = [];
        minHeights = [];
        colWidths = [];
        rowHeights = [];
        numRows;
        numCols;
        constructor(data) {
            super(data);
            this.cells = data.cells;
            this.numRows = this.cells.length;
            this.numCols = Math.max(...this.cells.map(row => diagram_ts.sum(row.map(ui => ui.colspan))));
            if (data.columns == undefined) {
                this.colDescs = diagram_ts.arrayFill(this.numCols, "auto");
            }
            else {
                this.colDescs = data.columns.split(" ");
            }
            if (data.rows == undefined) {
                this.rowDescs = diagram_ts.arrayFill(this.numRows, "auto");
            }
            else {
                this.rowDescs = data.rows.split(" ");
            }
            diagram_ts.assert(this.colDescs.length == this.numCols);
            diagram_ts.assert(this.rowDescs.length == this.numRows);
        }
        children() {
            return this.cells.flat();
        }
        getRow(idx) {
            return this.cells[idx];
        }
        getRowHeight(idx) {
            return Math.max(...this.getRow(idx).map(ui => ui.getMinHeight()));
        }
        getColumnWith(col_idx) {
            let max_width = 0;
            for (const row of this.cells) {
                let offset = 0;
                for (const ui of row) {
                    if (offset == col_idx) {
                        if (ui.colspan == 1) {
                            max_width = Math.max(max_width, ui.getMinWidth());
                        }
                        break;
                    }
                    offset += ui.colspan;
                    if (col_idx < offset) {
                        break;
                    }
                }
            }
            return max_width;
        }
        calcHeights() {
            const heights = new Array(this.rowDescs.length).fill(0);
            for (const [idx, row] of this.rowDescs.entries()) {
                if (row.endsWith("px")) {
                    heights[idx] = pixel(row);
                }
                else if (row == AUTO) {
                    heights[idx] = this.getRowHeight(idx);
                }
            }
            return heights;
        }
        setMinSizeSub(is_width) {
            let offset_size_px_ui_spans = [];
            const min_sizes = diagram_ts.arrayFill(is_width ? this.numCols : this.numRows, 0);
            for (const [row_idx, row] of this.cells.entries()) {
                let offset = 0;
                for (const ui of row) {
                    let size_px;
                    const [ui_size, ui_min_size, ui_span] = (is_width ? [ui.width, ui.minSize.x, ui.colspan] : [ui.height, ui.minSize.y, ui.rowspan]);
                    if (ui_size == undefined) {
                        size_px = ui_min_size;
                    }
                    else {
                        if (ui_size.endsWith("px")) {
                            size_px = pixel(ui_size);
                            if (size_px < ui_min_size) {
                                throw new diagram_ts.MyError();
                            }
                        }
                        else if (ui_size.endsWith("%")) {
                            size_px = ui_min_size / ratio(ui_size);
                        }
                        else {
                            throw new diagram_ts.MyError();
                        }
                    }
                    const pos = (is_width ? offset : row_idx);
                    if (ui_span == 1) {
                        if (min_sizes[pos] < size_px) {
                            min_sizes[pos] = size_px;
                        }
                    }
                    else {
                        offset_size_px_ui_spans.push([pos, size_px, ui, ui_span]);
                    }
                    offset += ui.colspan;
                }
            }
            let max_remaining_size = 0;
            const descs = (is_width ? this.colDescs : this.rowDescs);
            for (const [offset, width_px, ui, ui_span] of offset_size_px_ui_spans) {
                let fixed_px = 0;
                let ratio_sum = 0;
                for (const idx of diagram_ts.range2(offset, offset + ui_span)) {
                    if (descs[idx].endsWith("%")) {
                        ratio_sum += ratio(descs[idx]);
                    }
                    else {
                        fixed_px += min_sizes[idx];
                    }
                }
                if (ratio_sum == 0) {
                    if (fixed_px < ui.minSize.x) {
                        throw new diagram_ts.MyError();
                    }
                }
                else {
                    if (fixed_px <= ui.minSize.x) {
                        const ratio_px = ui.minSize.x - fixed_px;
                        const remaining_width = ratio_px / ratio_sum;
                        if (max_remaining_size < remaining_width) {
                            max_remaining_size = remaining_width;
                        }
                    }
                    else {
                        throw new diagram_ts.MyError();
                    }
                }
            }
            for (const [idx, col] of descs.entries()) {
                if (col.endsWith("px")) {
                    min_sizes[idx] = pixel(col);
                }
                else if (col.endsWith("%")) {
                    min_sizes[idx] = max_remaining_size * ratio(col);
                }
            }
            const size = diagram_ts.sum(min_sizes);
            const this_size = (is_width ? this.width : this.height);
            let this_size_px;
            if (this_size == undefined || this_size == "auto") {
                this_size_px = size;
            }
            else {
                if (this_size.endsWith("px")) {
                    this_size_px = pixel(this_size);
                    if (this_size_px < size) {
                        throw new diagram_ts.MyError();
                    }
                }
                else if (this_size.endsWith("%")) {
                    this_size_px = size / ratio(this_size);
                }
                else {
                    throw new diagram_ts.MyError();
                }
            }
            if (is_width) {
                this.minWidths = min_sizes;
                this.minSize.x = this_size_px + this.marginBorderPaddingWidth();
            }
            else {
                this.minHeights = min_sizes;
                this.minSize.y = this_size_px + this.marginBorderPaddingHeight();
            }
        }
        setMinSize() {
            this.minSize = diagram_ts.Vec2.zero();
            this.children().forEach(x => x.setMinSize());
            this.setMinSizeSub(true);
            this.setMinSizeSub(false);
        }
        static calcSizes(descs, min_sizes, remaining_px) {
            const sizes = Array(descs.length);
            for (const [idx, desc] of descs.entries()) {
                if (desc.endsWith("px")) {
                    sizes[idx] = pixel(desc);
                    if (sizes[idx] < min_sizes[idx]) {
                        throw new diagram_ts.MyError();
                    }
                }
                else if (desc.endsWith("%")) {
                    sizes[idx] = ratio(desc) * remaining_px;
                }
                else if (desc == "auto") {
                    sizes[idx] = min_sizes[idx];
                }
                else {
                    throw new diagram_ts.MyError();
                }
            }
            return sizes;
        }
        layout(x, y, size, nest) {
            super.layout(x, y, size, nest);
            const fixed_width_px = diagram_ts.sum(diagram_ts.range(this.numCols).filter(i => !this.colDescs[i].endsWith("%")).map(i => this.minWidths[i]));
            const fixed_height_px = diagram_ts.sum(diagram_ts.range(this.numRows).filter(i => !this.rowDescs[i].endsWith("%")).map(i => this.minHeights[i]));
            if (size.x < fixed_width_px || size.y < fixed_height_px) {
                throw new diagram_ts.MyError();
            }
            const remaining_width_px = size.x - fixed_width_px;
            const remaining_height_px = size.y - fixed_height_px;
            this.colWidths = Grid.calcSizes(this.colDescs, this.minWidths, remaining_width_px);
            this.rowHeights = Grid.calcSizes(this.rowDescs, this.minHeights, remaining_height_px);
            let y_offset = 0;
            for (const [row_idx, row] of this.cells.entries()) {
                let offset = 0;
                let x_offset = 0;
                for (const ui of row) {
                    let ui_width_px;
                    let ui_height_px;
                    if (ui.colspan == 1) {
                        ui_width_px = this.colWidths[offset];
                    }
                    else {
                        ui_width_px = diagram_ts.sum(this.colWidths.slice(offset, offset + ui.colspan));
                    }
                    if (ui.width != undefined && ui.width.endsWith("%")) {
                        ui_width_px *= ratio(ui.width);
                    }
                    if (ui.rowspan == 1) {
                        ui_height_px = this.rowHeights[row_idx];
                    }
                    else {
                        ui_height_px = diagram_ts.sum(this.rowHeights.slice(row_idx, row_idx + ui.rowspan));
                    }
                    if (ui.height != undefined && ui.height.endsWith("%")) {
                        ui_height_px *= ratio(ui.height);
                    }
                    const ui_size = new diagram_ts.Vec2(ui_width_px, ui_height_px);
                    ui.layout(x + x_offset, y + y_offset, ui_size, nest + 1);
                    x_offset += diagram_ts.sum(this.colWidths.slice(offset, offset + ui.colspan));
                    offset += ui.colspan;
                }
                y_offset += this.rowHeights[row_idx];
            }
        }
        updateRootLayout() {
            this.getAllUI().forEach(x => x.setMinSize());
            let size = diagram_ts.Vec2.zero();
            let x;
            let y;
            if (this.colDescs.some(x => x.endsWith("%"))) {
                size.x = window.innerWidth;
                x = 0;
            }
            else {
                size.x = this.minSize.x;
                x = Math.max(0, 0.5 * (window.innerWidth - size.x));
            }
            if (this.rowDescs.some(x => x.endsWith("%"))) {
                size.y = window.innerHeight;
                y = 0;
            }
            else {
                size.y = this.minSize.y;
                y = Math.max(0, 0.5 * (window.innerHeight - size.y));
            }
            this.layout(x, y, size, 0);
        }
        draw() {
            super.draw();
            this.children().forEach(x => x.draw());
        }
        str() {
            const col_descs = this.colDescs.join(" ");
            const row_descs = this.rowDescs.join(" ");
            const min_ws = this.minWidths.map(x => `${x}`).join(" ");
            const min_hs = this.minHeights.map(x => `${x}`).join(" ");
            const col_ws = this.colWidths.map(x => `${x}`).join(" ");
            const row_hs = this.rowHeights.map(x => `${x}`).join(" ");
            return `${super.str()} col:${col_descs} row:${row_descs} min-ws:${min_ws} min-hs:${min_hs} col-ws:${col_ws} row-hs:${row_hs}`;
        }
        dump(nest) {
            super.dump(nest);
            for (const row of this.cells) {
                row.forEach(ui => ui.dump(nest + 1));
                diagram_ts.msg("");
            }
        }
    }
    diagram_ts.Grid = Grid;
    function $label(data) {
        return new Label(data);
    }
    diagram_ts.$label = $label;
    function $button(data) {
        return new Button(data);
    }
    diagram_ts.$button = $button;
    function $filler(data) {
        return new Filler(data);
    }
    diagram_ts.$filler = $filler;
    function $grid(data) {
        return new Grid(data);
    }
    diagram_ts.$grid = $grid;
    function $hlist(data) {
        const grid_data = data;
        grid_data.columns = data.column;
        grid_data.cells = [data.children];
        delete data.children;
        delete data.column;
        return $grid(grid_data);
    }
    diagram_ts.$hlist = $hlist;
    function $vlist(data) {
        const grid_data = data;
        grid_data.columns = data.column;
        grid_data.cells = data.children.map(x => [x]);
        delete data.children;
        delete data.column;
        return $grid(grid_data);
    }
    diagram_ts.$vlist = $vlist;
})(diagram_ts || (diagram_ts = {}));
///<reference path="export.ts" />
///<reference path="ui.ts" />
var diagram_ts;
(function (diagram_ts) {
    //
    diagram_ts.notchRadius = 10;
    diagram_ts.nest_h1 = 35;
    diagram_ts.nest_h2 = 30;
    diagram_ts.nest_h3 = 35;
    diagram_ts.nest_h123 = diagram_ts.nest_h1 + diagram_ts.nest_h2 + diagram_ts.nest_h3;
    diagram_ts.blockLineWidth = 2;
    const blockLineColor = "brown";
    const nearPortDistance = 10;
    const rangeWidth = 150;
    const numberWidth = 45;
    let PortType;
    (function (PortType) {
        PortType[PortType["unknown"] = 0] = "unknown";
        PortType[PortType["bottom"] = 1] = "bottom";
        PortType[PortType["top"] = 2] = "top";
        PortType[PortType["inputPort"] = 3] = "inputPort";
        PortType[PortType["outputPort"] = 4] = "outputPort";
    })(PortType = diagram_ts.PortType || (diagram_ts.PortType = {}));
    class Block extends diagram_ts.UI {
        ports = [];
        outlineColor = "green";
        notchBottom = true;
        notchRight = true;
        inToolbox = false;
        constructor(data) {
            super(data);
            if (this.backgroundColor == undefined) {
                this.backgroundColor = "cornsilk";
            }
            this.padding = [5, 5, 5, 5];
            if (data.inToolbox != undefined) {
                this.inToolbox = data.inToolbox;
            }
        }
        copy() {
            const block = makeBlockByTypeName(this.constructor.name);
            block.position = this.position.copy();
            block.ctx = this.ctx;
            block.setMinSize();
            block.boxSize = block.minSize.copy();
            return block;
        }
        makeObj() {
            return {
                idx: this.idx,
                typeName: this.constructor.name,
                x: this.position.x,
                y: this.position.y,
                ports: this.ports.map(x => x.makeObj())
            };
        }
        loadObj(obj) {
        }
        calcHeight() {
            return this.minSize.y;
        }
        nextBlock() {
            let bottom_port;
            if (this instanceof diagram_ts.IfBlock) {
                bottom_port = this.bottomPort;
            }
            else if (this instanceof diagram_ts.InfiniteLoop) {
            }
            else {
                bottom_port = this.ports.find(x => x.type == PortType.bottom);
            }
            if (bottom_port != undefined && bottom_port.destinations.length != 0) {
                const dest_port = bottom_port.destinations[0];
                return dest_port.parent;
            }
            return undefined;
        }
        isProcedure() {
            return this instanceof diagram_ts.NestBlock || this instanceof TTSBlock || this instanceof SleepBlock;
        }
        getPortFromPosition(pos) {
            return this.ports.find(x => x.isNear(pos));
        }
        moveDiff(diff) {
            const new_position = this.position.add(diff);
            this.setPosition(new_position);
        }
        outputPorts() {
            return this.ports.filter(x => x.type == PortType.outputPort);
        }
        nextDataflowBlocks() {
            const blocks = [];
            const output_ports = this.outputPorts();
            for (const port of output_ports) {
                for (const dst of port.destinations) {
                    blocks.push(dst.parent);
                }
            }
            return blocks;
        }
        propergateCalc() {
            const next_dataflow_blocks = this.nextDataflowBlocks();
            next_dataflow_blocks.forEach(x => x.calc());
        }
        connectBlock(ports) {
            let [port1, port2] = ports;
            diagram_ts.assert(port1.parent == this);
            if (port1.type == PortType.bottom) {
                diagram_ts.assert(port2.type == PortType.top);
            }
            else if (port1.type == PortType.top) {
                diagram_ts.assert(port2.type == PortType.bottom);
                [port1, port2] = [port2, port1];
            }
            else {
                return;
            }
            port1.connect(port2);
            diagram_ts.msg(`connect block`);
        }
        drawNotch(cx, cy, type) {
            switch (type) {
                case PortType.bottom:
                    this.ctx.arc(cx, cy, diagram_ts.notchRadius, Math.PI, 0, true);
                    break;
                case PortType.top:
                    this.ctx.arc(cx, cy, diagram_ts.notchRadius, 0, Math.PI, false);
                    break;
                default:
                    throw new diagram_ts.MyError();
            }
        }
        drawOutline(points) {
            const canvas = diagram_ts.Canvas.one;
            if (canvas.draggedUI == this) {
                this.ctx.globalAlpha = 0.5;
            }
            else if (canvas.nearPorts.length != 0 && canvas.nearPorts[1].parent == this) {
                this.ctx.globalAlpha = 0.5;
            }
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.strokeStyle = blockLineColor;
            this.ctx.lineWidth = diagram_ts.blockLineWidth;
            this.ctx.beginPath();
            for (const [idx, [x, y, port]] of points.entries()) {
                if (idx == 0) {
                    this.ctx.moveTo(x, y);
                }
                else {
                    if (port == null) {
                        this.ctx.lineTo(x, y);
                    }
                    else {
                        this.drawNotch(x, y, port.type);
                        const port_pos = port.position;
                        port_pos.x = x;
                        port_pos.y = y;
                    }
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            if (this.ctx.globalAlpha != 1.0) {
                this.ctx.globalAlpha = 1.0;
            }
        }
        drawIOPorts(x1, x2, y1, y2) {
            const input_ports = this.ports.filter(x => x.type == PortType.inputPort);
            const output_ports = this.ports.filter(x => x.type == PortType.outputPort);
            for (const ports of [input_ports, output_ports]) {
                const y = (ports == input_ports ? y1 + diagram_ts.notchRadius : y2 - diagram_ts.notchRadius);
                for (const [i, port] of ports.entries()) {
                    const p = (i + 1) / (ports.length + 1);
                    const x = x1 * (1 - p) + x2 * p;
                    port.drawPort(this.ctx, x, y);
                }
            }
        }
        drawIcon(img) {
            const [x1, y1, x2, y2] = this.getCornerPosition();
            const img_height = (y2 - y1) - 6;
            const img_width = img_height * img.width / img.height;
            const img_x = x2 - img_width - 5;
            const img_y = y1 + 3;
            this.ctx.drawImage(img, img_x, img_y, img_width, img_height);
        }
        getCornerPosition() {
            const [pos, size] = this.drawBox();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth;
            const y1 = pos.y + this.borderWidth + diagram_ts.blockLineWidth;
            const x2 = x1 + this.minSize.x;
            const y2 = y1 + this.minSize.y;
            return [x1, y1, x2, y2];
        }
        drawDataflowBlock() {
            const [x1, y1, x2, y2] = this.getCornerPosition();
            this.drawOutline([
                [x1, y1, null],
                [x1, y2, null],
                [x2, y2, null],
                [x2, y1, null],
            ]);
            this.drawIOPorts(x1, x2, y1, y2);
        }
        drawActionBlock() {
            const [pos, size] = this.drawBox();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth;
            const y1 = pos.y + this.borderWidth + diagram_ts.blockLineWidth;
            const x2 = x1 + 35;
            const x3 = x1 + this.minSize.x;
            const y2 = y1 + this.minSize.y - diagram_ts.notchRadius;
            this.drawOutline([
                [x1, y1, null],
                [x1, y2, null],
                [x2, y2, this.ports[1]],
                [x3, y2, null],
                [x3, y1, null],
                [x2, y1, this.ports[0]]
            ]);
        }
        canConnectNearPortPair(block) {
            for (const port1 of this.ports) {
                for (const port2 of block.ports) {
                    if (port1.canConnect(port2) && port1.position.distance(port2.position) <= nearPortDistance) {
                        return [port1, port2];
                    }
                }
            }
            return [];
        }
        async valueChanged() {
            diagram_ts.msg(`changed : ${this.constructor.name}`);
        }
        calc() {
            throw new diagram_ts.MyError();
        }
        async run() {
            throw new diagram_ts.MyError();
        }
    }
    diagram_ts.Block = Block;
    class InputBlock extends Block {
        input;
        constructor(data) {
            super(data);
            this.input = document.createElement("input");
            this.input.style.position = "absolute";
            document.body.appendChild(this.input);
        }
        getInputPosition() {
            const [x1, y1, x2, y2] = this.getCornerPosition();
            const rect = this.input.getBoundingClientRect();
            const input_x = x1 + 0.5 * ((x2 - x1) - rect.width);
            const input_y = y1 + 0.5 * ((y2 - y1) - rect.height);
            return [input_x, input_y];
        }
        setPosition(position) {
            super.setPosition(position);
            const [x1, y1] = this.getInputPosition();
            this.input.style.left = `${x1}px`;
            this.input.style.top = `${y1}px`;
        }
    }
    diagram_ts.InputBlock = InputBlock;
    class InputRangeBlock extends InputBlock {
        minInput;
        maxInput;
        constructor(data) {
            super(data);
            this.input.type = "range";
            this.input.style.width = `${rangeWidth}px`;
            this.input.min = "0";
            this.input.max = "100";
            this.minInput = document.createElement("input");
            this.minInput.type = "number";
            this.minInput.value = "0";
            this.minInput.style.position = "absolute";
            this.minInput.style.width = `${numberWidth}px`;
            this.maxInput = document.createElement("input");
            this.maxInput.type = "number";
            this.maxInput.value = "100";
            this.maxInput.style.position = "absolute";
            this.maxInput.style.width = `${numberWidth}px`;
            document.body.appendChild(this.minInput);
            document.body.appendChild(this.maxInput);
            this.input.addEventListener("input", async (ev) => {
                const value = parseFloat(this.input.value);
                for (const src of this.ports) {
                    src.setPortValue(value);
                }
                diagram_ts.Canvas.one.requestUpdateCanvas();
            });
            this.minInput.addEventListener('change', (ev) => {
                this.input.min = this.minInput.value;
                diagram_ts.msg(`min : [${this.input.min}]`);
            });
            this.maxInput.addEventListener('change', (ev) => {
                this.input.max = this.maxInput.value;
                diagram_ts.msg(`max : [${this.input.max}]`);
            });
            this.ports = [new diagram_ts.Port(this, PortType.outputPort)];
        }
        makeObj() {
            let obj = Object.assign(super.makeObj(), {
                value: this.input.value,
                min: this.minInput.value,
                max: this.maxInput.value
            });
            return obj;
        }
        loadObj(obj) {
            super.loadObj(obj);
            this.input.value = `${obj.value}`;
            this.minInput.value = `${obj.min}`;
            this.maxInput.value = `${obj.max}`;
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(200, 50);
        }
        setPosition(position) {
            super.setPosition(position);
            const [pos, size] = this.drawBox();
            const rc1 = this.input.getBoundingClientRect();
            const rc2 = this.minInput.getBoundingClientRect();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth + 2 * diagram_ts.Port.radius;
            const y1 = pos.y + 0.5 * (size.y - (rc1.height + rc2.height));
            const y2 = y1 + rc1.height;
            this.input.style.left = `${x1}px`;
            this.input.style.top = `${y1}px`;
            this.minInput.style.left = `${x1}px`;
            this.minInput.style.top = `${y2}px`;
            this.maxInput.style.left = `${x1 + rc1.width - rc2.width}px`;
            this.maxInput.style.top = `${y2}px`;
        }
        draw() {
            this.drawDataflowBlock();
        }
    }
    diagram_ts.InputRangeBlock = InputRangeBlock;
    class ServoMotorBlock extends InputBlock {
        constructor(data) {
            super(data);
            this.input.type = "number";
            this.input.style.width = "45px";
            this.input.value = "0";
            this.input.min = "0";
            this.input.max = "15";
            this.input.addEventListener("input", (ev) => {
                diagram_ts.msg(`change : [${this.input.value}]`);
            });
            this.ports = [new diagram_ts.Port(this, PortType.inputPort)];
        }
        makeObj() {
            let obj = Object.assign(super.makeObj(), {
                channel: parseInt(this.input.value)
            });
            return obj;
        }
        loadObj(obj) {
            super.loadObj(obj);
            this.input.value = `${obj.channel}`;
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(200, 50);
        }
        setPosition(position) {
            super.setPosition(position);
            const [x1, y1, x2, y2] = this.getCornerPosition();
            const rect = this.input.getBoundingClientRect();
            const input_x = x1 + 10;
            const input_y = y1 + 0.5 * ((y2 - y1) - rect.height);
            this.input.style.left = `${input_x}px`;
            this.input.style.top = `${input_y}px`;
        }
        draw() {
            this.drawDataflowBlock();
            this.drawIcon(diagram_ts.motorIcon);
        }
        async valueChanged() {
            const channel = parseInt(this.input.value);
            const value = this.ports[0].value;
            diagram_ts.msg(`motor changed : ch:${channel} value:[${value}]`);
            if (typeof value != "number") {
                diagram_ts.msg(`illegal motor value:${value}`);
                return;
            }
            await diagram_ts.sendData({
                command: "servo",
                channel: channel,
                value: value
            });
        }
        calc() {
            diagram_ts.msg(`motor calc:${this.ports[0].value}`);
        }
    }
    diagram_ts.ServoMotorBlock = ServoMotorBlock;
    class InputTextBlock extends InputBlock {
        constructor(data) {
            super(data);
            this.input.type = "text";
        }
        makeObj() {
            let obj = Object.assign(super.makeObj(), {
                text: this.input.value
            });
            return obj;
        }
        loadObj(obj) {
            super.loadObj(obj);
            this.input.value = obj.text;
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(200, 20 + 2 * 2 * diagram_ts.notchRadius);
        }
        draw() {
            this.drawDataflowBlock();
        }
        makeInputValueMap() {
            const map = new Map();
            for (const port of this.ports) {
                if (port.type == PortType.inputPort) {
                    diagram_ts.assert(port.name != "" && typeof port.value === 'number' && !isNaN(port.value));
                    map.set(port.name, port.value);
                }
            }
            return map;
        }
    }
    class SetValueBlock extends InputTextBlock {
        constructor(data) {
            super(data);
            this.input.style.width = "45px";
            this.input.value = "0";
            this.input.addEventListener("change", (ev) => {
                diagram_ts.msg(`change : [${this.input.value}]`);
            });
            this.ports = [
                new diagram_ts.Port(this, PortType.top),
                new diagram_ts.Port(this, PortType.outputPort),
                new diagram_ts.Port(this, PortType.bottom),
            ];
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(200, 50);
        }
        draw() {
            const [pos, size] = this.drawBox();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth;
            const x2 = x1 + 35;
            const x3 = x1 + this.minSize.x;
            const y1 = pos.y + this.borderWidth + diagram_ts.blockLineWidth;
            const y2 = y1 + this.minSize.y - diagram_ts.notchRadius;
            this.drawOutline([
                [x1, y1, null],
                [x1, y2, null],
                [x2, y2, this.ports[2]],
                [x3, y2, null],
                [x3, y1, null],
                [x2, y1, this.ports[0]]
            ]);
            this.drawIOPorts(x1, x3, y1, y2);
        }
    }
    diagram_ts.SetValueBlock = SetValueBlock;
    class CameraBlock extends Block {
        constructor(data) {
            super(data);
            this.ports = [new diagram_ts.Port(this, PortType.outputPort)];
        }
        setMinSize() {
            if (this.inToolbox) {
                this.minSize = new diagram_ts.Vec2(320, 50 + 2 * diagram_ts.notchRadius);
            }
            else {
                this.minSize = new diagram_ts.Vec2(320, 240 + 2 * diagram_ts.notchRadius);
            }
        }
        draw() {
            this.drawDataflowBlock();
            const [x1, y1, x2, y2] = this.getCornerPosition();
            let img;
            if (this.inToolbox) {
                img = diagram_ts.cameraIcon;
            }
            else {
                if (diagram_ts.cameraImg == undefined) {
                    return;
                }
                img = diagram_ts.cameraImg;
            }
            const img_height = (y2 - y1) - 2 * diagram_ts.notchRadius;
            const img_width = img_height * img.width / img.height;
            const img_x = x1 + 0.5 * ((x2 - x1) - img_width);
            const img_y = y1;
            this.ctx.drawImage(img, img_x, img_y, img_width, img_height);
        }
    }
    diagram_ts.CameraBlock = CameraBlock;
    class TTSBlock extends InputTextBlock {
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.top),
                new diagram_ts.Port(this, PortType.bottom)
            ];
            this.input.value = "こんにちは!どうぞよろしく!";
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(300, 50);
        }
        draw() {
            this.drawActionBlock();
            this.drawIcon(diagram_ts.ttsIcon);
        }
        async run() {
            const audio = diagram_ts.ttsAudio;
            try {
                diagram_ts.msg("start audio play");
                // Start playing the audio
                await audio.play();
                // Create a new Promise that resolves when the 'ended' event is triggered
                await new Promise((resolve) => {
                    audio.addEventListener('ended', () => {
                        resolve();
                    }, { once: true }); // Use { once: true } to automatically remove the listener after it fires
                    audio.addEventListener("pause", () => {
                        resolve();
                    }, { once: true }); // Use { once: true } to automatically remove the listener after it fires
                });
                diagram_ts.msg("Audio playback has finished.");
            }
            catch (error) {
                // Catch errors that might occur if the browser blocks autoplay
                console.error("Audio playback failed:", error);
            }
        }
    }
    diagram_ts.TTSBlock = TTSBlock;
    class SleepBlock extends InputTextBlock {
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.top),
                new diagram_ts.Port(this, PortType.bottom)
            ];
            this.input.value = "3";
            this.input.style.width = "45px";
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(200, 50);
        }
        draw() {
            this.drawActionBlock();
            this.drawIcon(diagram_ts.sleepIcon);
        }
        async run() {
            const second = parseFloat(this.input.value.trim());
            await diagram_ts.sleep(second * 1000);
        }
    }
    diagram_ts.SleepBlock = SleepBlock;
    class FaceDetectionBlock extends Block {
        face = [];
        constructor(data) {
            super(data);
            this.ports = [new diagram_ts.Port(this, PortType.inputPort), new diagram_ts.Port(this, PortType.outputPort), new diagram_ts.Port(this, PortType.outputPort)];
        }
        setMinSize() {
            if (this.inToolbox) {
                this.minSize = new diagram_ts.Vec2(150, 10 + 2 * 2 * diagram_ts.notchRadius);
            }
            else {
                this.minSize = new diagram_ts.Vec2(320, 240 + 2 * 2 * diagram_ts.notchRadius);
            }
        }
        setFace(face) {
            this.face = face.slice();
            const [x, y, w, h] = this.face;
            const cx = x + w / 2;
            const cy = y + h / 2;
            this.ports[1].setPortValue(cx);
            this.ports[2].setPortValue(cy);
        }
        getCamera() {
            if (this.ports[0].sources.length != 0) {
                const camera = this.ports[0].sources.map(x => x.parent).find(x => x instanceof CameraBlock);
                return camera;
            }
            return undefined;
        }
        draw() {
            this.drawDataflowBlock();
            const camera = this.getCamera();
            if (camera != undefined) {
                const [x1, y1, x2, y2] = this.getCornerPosition();
                if (diagram_ts.cameraImg == undefined) {
                    return;
                }
                const img = diagram_ts.cameraImg;
                const img_height = (y2 - y1) - 2 * 2 * diagram_ts.notchRadius;
                const img_width = img_height * img.width / img.height;
                const img_x = x1 + 0.5 * ((x2 - x1) - img_width);
                const img_y = y1 + 2 * diagram_ts.notchRadius;
                this.ctx.drawImage(img, img_x, img_y, img_width, img_height);
                if (this.face.length == 4) {
                    this.ctx.save();
                    // Set the stroke color to red
                    this.ctx.strokeStyle = 'red';
                    // Set the line thickness to 5 pixels
                    this.ctx.lineWidth = 5;
                    const [face_x, face_y, face_w, face_h] = this.face;
                    const cx = img_x + img_width / 2;
                    const cy = img_y + img_height / 2;
                    const img_face_x = cx + img_width * face_x / 100;
                    const img_face_y = cy + img_height * face_y / 100;
                    const img_face_w = img_width * face_w / 100;
                    const img_face_h = img_height * face_h / 100;
                    // Draw an outlined rectangle at (200, 50) with a size of 100x75
                    this.ctx.strokeRect(img_face_x, img_face_y, img_face_w, img_face_h);
                    this.ctx.restore();
                }
            }
        }
    }
    diagram_ts.FaceDetectionBlock = FaceDetectionBlock;
    class JoyStickBlock extends Block {
        constructor(data) {
            super(data);
            this.ports = [];
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(150, 50);
        }
    }
    diagram_ts.JoyStickBlock = JoyStickBlock;
    class UltrasonicDistanceSensorBlock extends Block {
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.outputPort)
            ];
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(300, 50);
        }
        setDistance(distance) {
            this.ports[0].setPortValue(distance);
        }
        draw() {
            this.drawDataflowBlock();
            this.drawIcon(diagram_ts.distanceSensorIcon);
        }
    }
    diagram_ts.UltrasonicDistanceSensorBlock = UltrasonicDistanceSensorBlock;
    function calcTerm(map, term) {
        let value;
        if (term instanceof diagram_ts.Rational) {
            return term.fval();
        }
        else if (term instanceof diagram_ts.ConstNum) {
            return term.value.fval();
        }
        else if (term instanceof diagram_ts.RefVar) {
            value = map.get(term.name);
            diagram_ts.assert(value != undefined);
            return value;
        }
        else if (term instanceof diagram_ts.App) {
            const app = term;
            const arg_values = app.args.map(x => calcTerm(map, x));
            if (app.isAdd()) {
                value = diagram_ts.sum(arg_values);
            }
            else if (app.isMul()) {
                value = arg_values.reduce((acc, cur) => acc * cur, 1);
            }
            else if (app.isDiv()) {
                value = arg_values[0] / arg_values[1];
            }
            else if (app.isEq()) {
                value = (arg_values[0] == arg_values[1] ? 1 : 0);
            }
            else if (app.fncName == "<=") {
                value = (arg_values[0] <= arg_values[1] ? 1 : 0);
            }
            else if (app.fncName == "<") {
                value = (arg_values[0] < arg_values[1] ? 1 : 0);
            }
            else {
                throw new diagram_ts.MyError("unimplemented");
            }
        }
        else {
            throw new diagram_ts.MyError("unimplemented");
        }
        return term.value.fval() * value;
    }
    class CalcBlock extends InputTextBlock {
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.inputPort, "a"),
                new diagram_ts.Port(this, PortType.outputPort, "b")
            ];
        }
        calc() {
            diagram_ts.msg(`start calc: a:${this.ports[0].value}`);
            const expr = diagram_ts.parseMath(this.input.value.trim());
            diagram_ts.assert(expr.isRootEq());
            const lhs = expr.args[0];
            const rhs = expr.args[1];
            const map = this.makeInputValueMap();
            const rhs_value = calcTerm(map, rhs);
            const lhs_port = this.ports.find(x => x.name == lhs.name && x.type == PortType.outputPort);
            diagram_ts.assert(lhs_port != undefined);
            lhs_port.setPortValue(rhs_value);
            diagram_ts.msg(`end calc: b:${this.ports[1].value}`);
            this.propergateCalc();
        }
    }
    diagram_ts.CalcBlock = CalcBlock;
    class CompareBlock extends InputTextBlock {
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.inputPort, "a"),
                new diagram_ts.Port(this, PortType.outputPort)
            ];
            this.input.value = "a == a";
        }
        calc() {
            diagram_ts.msg(`start compare: a:${this.ports[0].value}`);
            let expr;
            try {
                expr = diagram_ts.parseMath(this.input.value.trim());
            }
            catch (error) {
                if (error instanceof parser_ts.SyntaxError) {
                    diagram_ts.msg(`syntax error`);
                }
                else {
                    console.error("An unexpected error occurred:", error);
                }
                this.ports[1].setPortValue(undefined);
                return;
            }
            const map = this.makeInputValueMap();
            const result = calcTerm(map, expr);
            if (result == 0 || result == 1) {
                this.ports[1].setPortValue(result);
            }
            else {
                diagram_ts.msg(`illegal compare result:${result}`);
                this.ports[1].setPortValue(undefined);
            }
        }
    }
    diagram_ts.CompareBlock = CompareBlock;
    function makeBlockByTypeName(typeName) {
        switch (typeName) {
            case diagram_ts.IfBlock.name: return new diagram_ts.IfBlock({});
            case CompareBlock.name: return new CompareBlock({});
            case diagram_ts.InfiniteLoop.name: return new diagram_ts.InfiniteLoop({});
            case InputRangeBlock.name: return new InputRangeBlock({});
            case ServoMotorBlock.name: return new ServoMotorBlock({});
            case SetValueBlock.name: return new SetValueBlock({});
            case CameraBlock.name: return new CameraBlock({});
            case TTSBlock.name: return new TTSBlock({});
            case SleepBlock.name: return new SleepBlock({});
            case FaceDetectionBlock.name: return new FaceDetectionBlock({});
            case JoyStickBlock.name: return new JoyStickBlock({});
            case UltrasonicDistanceSensorBlock.name: return new UltrasonicDistanceSensorBlock({});
            case CalcBlock.name: return new CalcBlock({});
            default:
                throw new diagram_ts.MyError();
        }
    }
    diagram_ts.makeBlockByTypeName = makeBlockByTypeName;
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    //
    diagram_ts.repaintCount = 0;
    let animationFrameId = null;
    class Canvas {
        static one;
        canvas;
        ctx;
        root;
        draggedUI;
        nearPorts = [];
        pointerId = NaN;
        downPos = diagram_ts.Vec2.zero();
        movePos = diagram_ts.Vec2.zero();
        uiOrgPos = diagram_ts.Vec2.zero();
        moved = false;
        constructor(canvas_html, root) {
            Canvas.one = this;
            this.canvas = canvas_html;
            this.ctx = this.canvas.getContext('2d'); // Or 'webgl', 'webgl2'
            if (!this.ctx) {
                console.error("Canvas context not supported!");
            }
            this.root = root;
            diagram_ts.setContext2D(this.ctx, this.root);
            this.canvas.addEventListener("pointerdown", this.pointerdown.bind(this));
            this.canvas.addEventListener("pointermove", this.pointermove.bind(this));
            this.canvas.addEventListener("pointerup", async (ev) => {
                await Canvas.one.pointerup(ev);
            });
        }
        getPositionInCanvas(event) {
            // Get the bounding rectangle of the canvas
            const rect = this.canvas.getBoundingClientRect();
            // Calculate the scaling factors if the canvas is styled differently from its internal resolution
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            // Calculate the canvas coordinates
            const canvasX = (event.clientX - rect.left) * scaleX;
            const canvasY = (event.clientY - rect.top) * scaleY;
            return new diagram_ts.Vec2(canvasX, canvasY);
            // Now you have the canvas coordinates!
            // console.log(`Canvas X: ${canvasX}, Canvas Y: ${canvasY}`);
        }
        getUIFromPosition(ui, pos) {
            for (const child of ui.children()) {
                const target = this.getUIFromPosition(child, pos);
                if (target != undefined) {
                    return target;
                }
            }
            if (ui.position.x <= pos.x && pos.x < ui.position.x + ui.boxSize.x) {
                if (ui.position.y <= pos.y && pos.y < ui.position.y + ui.boxSize.y) {
                    if (ui instanceof diagram_ts.Block) {
                        const port = ui.getPortFromPosition(pos);
                        if (port != undefined) {
                            return port;
                        }
                    }
                    return ui;
                }
            }
            return undefined;
        }
        pointerdown(ev) {
            this.moved = false;
            const pos = this.getPositionInCanvas(ev);
            const target = this.getUIFromPosition(this.root, pos);
            if (target != undefined) {
                diagram_ts.msg(`down:${target.constructor.name}`);
                this.downPos = pos;
                this.movePos = pos;
                if (target instanceof diagram_ts.Block) {
                    if (target instanceof diagram_ts.InputRangeBlock) {
                        diagram_ts.msg(`range: box${target.boxSize.x.toFixed()} out:${target.minSize.x}`);
                    }
                    if (target.inToolbox) {
                        const block = target.copy();
                        diagram_ts.Main.one.editor.addBlock(block);
                        this.draggedUI = block;
                    }
                    else {
                        this.draggedUI = target;
                    }
                }
                else if (target instanceof diagram_ts.Port) {
                    diagram_ts.msg(`down port:${target.str()}`);
                    this.draggedUI = target;
                }
                else if (target instanceof diagram_ts.Button) {
                    diagram_ts.msg(`down button:${target.text}`);
                    this.draggedUI = target;
                }
                else {
                    return;
                }
                this.uiOrgPos = this.draggedUI.position.copy();
                this.pointerId = ev.pointerId;
                this.canvas.setPointerCapture(this.pointerId);
                this.canvas.classList.add('dragging');
            }
        }
        getNearPorts(dragged_block) {
            this.nearPorts = [];
            const other_blocks = diagram_ts.Main.one.editor.blocks.filter(x => x != this.draggedUI);
            for (const block of other_blocks) {
                const near_ports = dragged_block.canConnectNearPortPair(block);
                if (near_ports.length != 0) {
                    diagram_ts.msg(`near`);
                    this.nearPorts = near_ports;
                    break;
                }
            }
        }
        pointermove(ev) {
            this.moved = true;
            if (this.draggedUI == undefined) {
                return;
            }
            const pos = this.getPositionInCanvas(ev);
            const target = this.getUIFromPosition(this.root, pos);
            const s = (target == undefined ? "" : `target:[${target.str()}]`);
            this.movePos = pos;
            const diff = pos.sub(this.downPos);
            if (this.draggedUI instanceof diagram_ts.Block) {
                this.draggedUI.setPosition(this.uiOrgPos.add(diff));
                this.getNearPorts(this.draggedUI);
            }
            this.requestUpdateCanvas();
        }
        requestUpdateCanvas() {
            if (animationFrameId == null) {
                animationFrameId = requestAnimationFrame(() => {
                    animationFrameId = null;
                    this.repaint();
                });
            }
        }
        async pointerup(ev) {
            if (this.draggedUI == undefined) {
                return;
            }
            const pos = this.getPositionInCanvas(ev);
            const target = this.getUIFromPosition(this.root, pos);
            if (this.moved) {
                diagram_ts.msg("dragged");
                if (this.draggedUI instanceof diagram_ts.Port && target instanceof diagram_ts.Port) {
                    this.draggedUI.connect(target);
                }
                else if (this.draggedUI instanceof diagram_ts.Block) {
                    const diff = pos.sub(this.downPos);
                    this.getNearPorts(this.draggedUI);
                    if (this.nearPorts.length == 2) {
                        const port_diffs = this.nearPorts[1].position.sub(this.nearPorts[0].position);
                        this.draggedUI.moveDiff(port_diffs);
                        this.draggedUI.connectBlock(this.nearPorts);
                        this.layoutRoot();
                    }
                    else {
                        this.draggedUI.setPosition(this.uiOrgPos.add(diff));
                    }
                }
            }
            else {
                diagram_ts.msg(`click:${this.draggedUI.constructor.name}`);
                if (this.draggedUI instanceof diagram_ts.Button) {
                    await this.draggedUI.click();
                }
            }
            this.canvas.releasePointerCapture(this.pointerId);
            this.canvas.classList.remove('dragging');
            this.draggedUI = undefined;
            this.pointerId = NaN;
            this.nearPorts = [];
            this.requestUpdateCanvas();
            this.moved = false;
        }
        layoutRoot() {
            this.root.setMinSize();
            this.root.layout(0, 0, new diagram_ts.Vec2(this.canvas.width, this.canvas.height), 0);
        }
        resizeCanvas() {
            // Set the canvas's internal drawing dimensions to match its display size
            // window.innerWidth/Height give the viewport dimensions.
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            // If you're drawing something, you might want to redraw it here
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the canvas
                // Example drawing
                this.ctx.fillStyle = 'blue';
                this.ctx.fillRect(50, 50, 100, 100);
                this.ctx.font = '30px Arial';
                this.ctx.fillStyle = 'white';
                this.ctx.fillText('Hello Canvas!', this.canvas.width / 2 - 100, this.canvas.height / 2);
            }
            this.layoutRoot();
            this.root.dump(0);
            this.requestUpdateCanvas();
        }
        drawDraggedPort(port) {
            this.drawLine(port.position, this.movePos, "blue");
        }
        repaint() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.root.draw();
            if (this.draggedUI instanceof diagram_ts.Port) {
                this.drawDraggedPort(this.draggedUI);
            }
            // msg("repaint");
            diagram_ts.repaintCount++;
        }
        drawLine(start, end, color, lineWidth = 2) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = lineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
            this.ctx.stroke();
        }
    }
    diagram_ts.Canvas = Canvas;
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    let startButton;
    diagram_ts.stopFlag = false;
    let isRunning = false;
    class Variable {
        name;
        type;
    }
    class Field extends Variable {
        parent;
    }
    class Struct {
        members = [];
    }
    diagram_ts.Struct = Struct;
    class DataType {
        dimensions = [];
        typeName;
    }
    diagram_ts.DataType = DataType;
    class Port {
        static radius = 10;
        idx = 0;
        name;
        parent;
        destinations = [];
        sources = [];
        type;
        pipes = [];
        position = diagram_ts.Vec2.zero();
        prevValue;
        value;
        constructor(parent, type, name = "") {
            this.parent = parent;
            this.type = type;
            this.name = name;
        }
        str() {
            return "port";
        }
        copyPort(parent) {
            const port = new Port(parent, this.type);
            port.position = this.position.copy();
            return port;
        }
        makeObj() {
            return {
                idx: this.idx,
                destinations: this.destinations.map(dst => dst.idx)
            };
        }
        setPortValue(value) {
            this.value = value;
            for (const dst of this.destinations) {
                dst.setPortValue(value);
                dst.parent.valueChanged()
                    .then(() => {
                })
                    .catch(error => {
                    console.error("Failed to value change:", error);
                });
            }
        }
        isNear(pos) {
            return this.position.distance(pos) < Port.radius;
        }
        drawPort(ctx, cx, cy) {
            ctx.beginPath();
            this.position.x = cx;
            this.position.y = cy;
            ctx.arc(this.position.x, this.position.y, Port.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            for (const dst of this.destinations) {
                diagram_ts.Canvas.one.drawLine(this.position, dst.position, "brown", 4);
            }
            if (this.name != "") {
                // ctx.strokeText(this.name, this.position.x, this.position.y);
                ctx.save();
                ctx.font = '24px Arial';
                ctx.fillStyle = "black";
                const x = this.position.x - 7;
                const y = this.position.y + 7;
                ctx.fillText(this.name, x, y);
                ctx.restore();
            }
            if (this.value != undefined) {
                ctx.save();
                ctx.font = '24px Arial';
                ctx.fillStyle = "black";
                const x = this.position.x - 7 + Port.radius;
                const y = this.position.y + 7;
                ctx.fillText(`${this.value}`, x, y);
                ctx.restore();
            }
        }
        canConnect(dst) {
            const pairs = [
                [diagram_ts.PortType.bottom, diagram_ts.PortType.top],
                [diagram_ts.PortType.top, diagram_ts.PortType.bottom],
                [diagram_ts.PortType.inputPort, diagram_ts.PortType.outputPort],
                [diagram_ts.PortType.outputPort, diagram_ts.PortType.inputPort]
            ];
            return pairs.some(pair => pair[0] == this.type && pair[1] == dst.type);
        }
        connect(port) {
            diagram_ts.assert(this.canConnect(port));
            let src;
            let dst;
            if (this.type == diagram_ts.PortType.bottom || this.type == diagram_ts.PortType.outputPort) {
                [src, dst] = [this, port];
            }
            else {
                [src, dst] = [port, this];
            }
            diagram_ts.append(src.destinations, dst);
            diagram_ts.append(dst.sources, src);
            diagram_ts.msg(`connect port:${this.idx}=>${port.idx}`);
        }
    }
    diagram_ts.Port = Port;
    class Joint {
        drawJoint(canvas) {
        }
    }
    class Tube {
        drawTube(canvas) {
        }
    }
    class Pipe {
        source;
        destination;
        tubes = [];
        joints = [];
        drawPipe(canvas) {
        }
    }
    diagram_ts.Pipe = Pipe;
    class Edge {
    }
    diagram_ts.Edge = Edge;
    class Plot {
    }
    class Layer {
    }
    diagram_ts.Layer = Layer;
    class Scheduler {
    }
    document.addEventListener('DOMContentLoaded', async () => {
        await asyncBodyOnLoad();
    });
    //
    let main;
    class Main {
        static one;
        canvas;
        editor;
        constructor() {
            Main.one = this;
            // Get the canvas element
            this.editor = new diagram_ts.Editor({});
            const root = diagram_ts.$grid({
                rows: "100px 100%",
                columns: "100px 25% 75%",
                cells: [
                    // [
                    //     $filler({
                    //         colspan : 3,
                    //         backgroundColor : "cornsilk"
                    //     })
                    // ]
                    // ,
                    [
                        diagram_ts.$button({
                            text: "download",
                            click: async () => {
                                diagram_ts.saveJson();
                            }
                        }),
                        diagram_ts.$button({
                            text: "start",
                            click: async () => {
                                await startProgram();
                            }
                        }),
                        diagram_ts.$filler({})
                    ],
                    [
                        diagram_ts.$filler({}),
                        diagram_ts.$vlist({
                            column: "100%",
                            children: [
                                new diagram_ts.IfBlock({ inToolbox: true }),
                                new diagram_ts.InfiniteLoop({ inToolbox: true }),
                                new diagram_ts.CompareBlock({ inToolbox: true }),
                                new diagram_ts.InputRangeBlock({ inToolbox: true }),
                                new diagram_ts.ServoMotorBlock({ inToolbox: true }),
                                new diagram_ts.SetValueBlock({ inToolbox: true }),
                                new diagram_ts.CameraBlock({ inToolbox: true }),
                                new diagram_ts.FaceDetectionBlock({ inToolbox: true }),
                                new diagram_ts.CalcBlock({ inToolbox: true }),
                                new diagram_ts.UltrasonicDistanceSensorBlock({ inToolbox: true }),
                                new diagram_ts.TTSBlock({ inToolbox: true }),
                                new diagram_ts.SleepBlock({ inToolbox: true })
                            ]
                        }),
                        this.editor
                    ]
                ]
            });
            const canvas_html = document.getElementById('world');
            this.canvas = new diagram_ts.Canvas(canvas_html, root);
            // Initial resize when the page loads
            // Use DOMContentLoaded to ensure the canvas element exists before trying to access it
            document.addEventListener('DOMContentLoaded', this.canvas.resizeCanvas.bind(this.canvas));
            // Add an event listener to resize the canvas whenever the window is resized
            window.addEventListener('resize', this.canvas.resizeCanvas.bind(this.canvas));
            diagram_ts.setDragDrop(this.canvas.canvas);
            this.canvas.resizeCanvas();
        }
    }
    diagram_ts.Main = Main;
    async function startProgram() {
        await diagram_ts.sendData({
            command: "init",
            name: "hamada",
            age: 66
        });
        try {
            const url = `${diagram_ts.urlOrigin}/get_data`;
            diagram_ts.msg(`fetch:[${url}]`);
            const response = await fetch(url); // Default method is GET
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json(); // Parse the JSON response from Flask
            const json_str = JSON.stringify(data, null, 2); // Pretty print JSON
            diagram_ts.msg(`start click name:[${data["product_name"]}] price:[${data["price"]}] json:[${json_str}]`);
        }
        catch (error) {
            diagram_ts.msg(`start click error: ${error.message || error}`);
        }
    }
    diagram_ts.startProgram = startProgram;
    function fetchImage(image_url) {
        const image = new Image();
        image.width = 320;
        image.height = 240;
        // 2. Set the crossOrigin attribute for security and to prevent a tainted canvas
        image.crossOrigin = 'Anonymous';
        image.src = image_url;
        // 4. Wait for the image to load
        image.onload = () => {
            diagram_ts.cameraImg = image;
        };
    }
    function updateCameraImage(image_file_name) {
        const blocks = Main.one.editor.blocks;
        const cameras = blocks.filter(x => x instanceof diagram_ts.CameraBlock);
        for (const camera of cameras) {
            const image_url = `static/lib/diagram/img/${image_file_name}`;
            fetchImage(image_url);
        }
    }
    function updateFaceDetection(face) {
        const face_detection = Main.one.editor.blocks.find(x => x instanceof diagram_ts.FaceDetectionBlock);
        if (face_detection != undefined) {
            face_detection.setFace(face);
            face_detection.propergateCalc();
        }
    }
    function updateDistanceSensor(distance) {
        const distance_sensor = Main.one.editor.blocks.find(x => x instanceof diagram_ts.UltrasonicDistanceSensorBlock);
        if (distance_sensor != undefined) {
            distance_sensor.setDistance(distance);
            distance_sensor.propergateCalc();
        }
    }
    async function clearQueue() {
        for (let idx = 0;; idx++) {
            const result = await diagram_ts.sendData({
                command: "status"
            });
            const queue = result["queue"];
            if (queue == null) {
                break;
            }
            diagram_ts.msg(`clear queue:${idx}`);
        }
    }
    async function periodicTask() {
        const result = await diagram_ts.sendData({
            command: "status"
        });
        const queue = result["queue"];
        if (queue != null) {
            const json_str = JSON.stringify(result, null, 2);
            diagram_ts.msg(`status:${json_str}`);
            const image_file_name = queue["image_file_name"];
            if (image_file_name != undefined) {
                updateCameraImage(image_file_name);
            }
            const face = queue["face"];
            if (face != undefined) {
                diagram_ts.assert(face.length == 4);
                updateFaceDetection(face);
            }
            const distance = queue["distance"];
            if (distance != undefined) {
                diagram_ts.assert(typeof distance == "number");
                updateDistanceSensor(distance);
            }
            diagram_ts.Canvas.one.requestUpdateCanvas();
        }
        setTimeout(periodicTask, 100);
    }
    function getTopProcedures() {
        const procedure_blocks = Main.one.editor.blocks.filter(x => x.isProcedure());
        const top_blocks = [];
        for (const block of procedure_blocks) {
            const top_port = block.ports.find(x => x.type == diagram_ts.PortType.top);
            diagram_ts.assert(top_port != undefined);
            if (top_port.sources.length == 0) {
                top_blocks.push(block);
            }
        }
        return top_blocks;
    }
    async function runBlockChain(top_block) {
        for (let block = top_block; block != undefined; block = block.nextBlock()) {
            await block.run();
            if (diagram_ts.stopFlag) {
                break;
            }
        }
    }
    diagram_ts.runBlockChain = runBlockChain;
    async function startProcedures() {
        startButton.innerText = "Stop";
        isRunning = true;
        diagram_ts.stopFlag = false;
        const top_blocks = getTopProcedures();
        for (const top_block of top_blocks) {
            diagram_ts.msg(`top proc:${top_block.constructor.name}`);
            await runBlockChain(top_block);
            if (diagram_ts.stopFlag) {
                break;
            }
        }
        diagram_ts.msg("procedures complete.");
        isRunning = false;
        startButton.innerText = "Start";
    }
    async function asyncBodyOnLoad() {
        diagram_ts.msg("loaded");
        let pathname;
        [diagram_ts.urlOrigin, pathname,] = i18n_ts.parseURL();
        diagram_ts.msg(`origin:[${diagram_ts.urlOrigin}] path:[${pathname}]`);
        diagram_ts.cameraIcon = document.getElementById("camera-icon");
        diagram_ts.motorIcon = document.getElementById("motor-icon");
        diagram_ts.distanceSensorIcon = document.getElementById("distance-sensor-icon");
        diagram_ts.ttsIcon = document.getElementById("tts-icon");
        diagram_ts.sleepIcon = document.getElementById("sleep-icon");
        diagram_ts.ttsAudio = document.getElementById("tts-audio");
        diagram_ts.ttsAudio.addEventListener("ended", (ev) => {
            diagram_ts.msg("TTS end");
        });
        startButton = diagram_ts.$("start-btn");
        startButton.addEventListener("click", async (ev) => {
            if (isRunning) {
                // Reset the playback position to the start
                diagram_ts.ttsAudio.pause();
                diagram_ts.ttsAudio.currentTime = 0;
                diagram_ts.stopFlag = true;
            }
            else {
                await startProcedures();
            }
        });
        main = new Main();
        await clearQueue();
        if (diagram_ts.urlOrigin != "http://127.0.0.1:5500") {
            await periodicTask();
        }
    }
    diagram_ts.asyncBodyOnLoad = asyncBodyOnLoad;
    // export class Node {
    // }
    /*
    ダイアグラム
    ・フローチャート
    ・データフロー
    ・回路図
    ・UI画面
    ・UML
        ・シーケンス図
        ・クラス図
        ・アクティビティ図
        ・コンポーネント図
        ・状態遷移図
        ・タイミング図
        ・
    ・
    ・
    ・
    ・
    
    コンポーネント
    ・実行
        ・if/else
        ・while
        ・代入
        ・ストリーム
            ・通信
                ・プロセス間
                ・ソケット
                    ・TCP
                    ・UDP
            ・バッファ付き
        ・sleep
        ・wait until
        ・call function
        ・ブロック
            ・関数定義
            ・デバイス
    
    
    実行モード
    ・編集
    ・エミュレーション
    ・実機デバッグ
    
    スケジューリング
    ・即時に再実行
    ・Tick時に再実行
    
    ・入力されたら
    ・値が変化したら
    
    ・１つでも入力されたら
    ・全部入力されたら
    
    */
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    //
    async function sendData(dataToSend) {
        const url = `${diagram_ts.urlOrigin}/send_data`;
        // msg(`post:[${url}]`);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend) // Convert JavaScript object to JSON string
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
            }
            const result = await response.json(); // Parse the JSON response from Flask
            const json_str = JSON.stringify(result, null, 2); // Pretty print JSON
            // msg(`send data result:[${json_str}]`);
            return result;
        }
        catch (error) {
            diagram_ts.msg(`send data error: ${error.message || error}`);
            return undefined;
        }
    }
    diagram_ts.sendData = sendData;
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    //
    function downloadJson(data) {
        // Convert the object to a JSON string
        const jsonData = JSON.stringify(data, null, 2); // The last two arguments are for formatting (indentation)
        // Create a Blob from the JSON string
        const blob = new Blob([jsonData], { type: "application/json" });
        // Create an anchor element
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "diagram.json"; // Set the filename
        // Append the link to the body (it must be in the document to be clickable)
        document.body.appendChild(link);
        // Programmatically click the link to trigger the download
        link.click();
        // Clean up: remove the link and revoke the object URL
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
    diagram_ts.downloadJson = downloadJson;
    function preventDefaults(ev) {
        ev.preventDefault();
        ev.stopPropagation();
    }
    function setDragDrop(canvas) {
        canvas.addEventListener("dragenter", (ev) => {
            preventDefaults(ev);
            diagram_ts.msg("drag enter");
        });
        canvas.addEventListener("dragover", (ev) => {
            preventDefaults(ev);
            canvas.classList.add('dragover');
            diagram_ts.msg("drag over");
        });
        canvas.addEventListener("dragleave", (ev) => {
            preventDefaults(ev);
            canvas.classList.remove('dragover');
            diagram_ts.msg("drag leave");
        });
        canvas.addEventListener("drop", async (ev) => {
            preventDefaults(ev);
            canvas.classList.remove('dragover');
            diagram_ts.msg("drop");
            const dt = ev.dataTransfer;
            if (dt == null) {
                return;
            }
            const files = Array.from(dt.files);
            diagram_ts.msg(`${files}`);
            if (files.length == 1) {
                const file = files[0];
                diagram_ts.msg(`File name: ${file.name}, File size: ${file.size}, File type: ${file.type}`);
                const reader = new FileReader();
                reader.onload = async () => {
                    const json = reader.result;
                    const obj = JSON.parse(json);
                    diagram_ts.assert(Array.isArray(obj));
                    // msg(`dropped:[${JSON.stringify(data, null, 2)}]`);
                    loadJson(obj);
                    const repaint_count = diagram_ts.repaintCount;
                    diagram_ts.Canvas.one.requestUpdateCanvas();
                    // port positions are set on paing.
                    // edges can be drawn after port position settings.
                    while (repaint_count == diagram_ts.repaintCount) {
                        await diagram_ts.sleep(100);
                    }
                    // draw input elements in blocks.
                    diagram_ts.Main.one.editor.blocks.forEach(x => x.setPosition(x.position));
                    diagram_ts.Canvas.one.requestUpdateCanvas();
                };
                reader.readAsText(file);
            }
        });
    }
    diagram_ts.setDragDrop = setDragDrop;
    function saveJson() {
        let port_idx = 0;
        const blocks = diagram_ts.Main.one.editor.blocks;
        for (const [idx, block] of blocks.entries()) {
            block.idx = idx;
            for (const port of block.ports) {
                port.idx = port_idx++;
            }
        }
        const json = blocks.map(x => x.makeObj());
        downloadJson(json);
    }
    diagram_ts.saveJson = saveJson;
    function loadJson(objs) {
        const block_map = new Map();
        const port_map = new Map();
        for (const obj of objs) {
            diagram_ts.msg(`block:[${obj.typeName}]`);
            const block = diagram_ts.makeBlockByTypeName(obj.typeName);
            block.loadObj(obj);
            block.idx = obj.idx;
            block.position.x = obj.x;
            block.position.y = obj.y;
            block.setMinSize();
            block.boxSize = block.minSize.copy();
            block_map.set(block.idx, block);
            for (const [port_idx, port_obj] of obj.ports.entries()) {
                const port = block.ports[port_idx];
                port.idx = port_obj.idx;
                port_map.set(port.idx, port);
            }
            diagram_ts.Main.one.editor.addBlock(block);
        }
        for (const obj of objs) {
            const block = block_map.get(obj.idx);
            diagram_ts.assert(block != undefined);
            for (const [port_idx, port_obj] of obj.ports.entries()) {
                const port = block.ports[port_idx];
                for (const dst_port_idx of port_obj.destinations) {
                    const dst_port = port_map.get(dst_port_idx);
                    diagram_ts.assert(dst_port != undefined);
                    port.connect(dst_port);
                }
            }
        }
        const canvas = diagram_ts.Main.one.canvas;
        diagram_ts.setContext2D(canvas.ctx, canvas.root);
    }
})(diagram_ts || (diagram_ts = {}));
var diagram_ts;
(function (diagram_ts) {
    //
    class NestBlock extends diagram_ts.Block {
        innerBlock() {
            let port;
            if (this instanceof IfBlock) {
                port = this.truePort;
            }
            else if (this instanceof InfiniteLoop) {
                port = this.loopPort;
            }
            else {
                throw new diagram_ts.MyError();
            }
            diagram_ts.assert(port.type == diagram_ts.PortType.bottom);
            if (port.destinations.length == 0) {
                return undefined;
            }
            else {
                return port.destinations[0].parent;
            }
        }
        innerBlocksHeight() {
            let height = 0;
            for (let block = this.innerBlock(); block != undefined; block = block.nextBlock()) {
                if (height != 0) {
                    height -= diagram_ts.notchRadius;
                }
                height += block.calcHeight();
            }
            if (height != 0) {
                diagram_ts.msg(`inner blocks id:${this.idx} h:${height}`);
            }
            return height;
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(150, diagram_ts.nest_h123);
            for (let block = this.innerBlock(); block != undefined; block = block.nextBlock()) {
                block.setMinSize();
            }
            this.minSize.y += this.innerBlocksHeight();
        }
        calcHeight() {
            return diagram_ts.nest_h123 + this.innerBlocksHeight();
        }
    }
    diagram_ts.NestBlock = NestBlock;
    class IfBlock extends NestBlock {
        topPort = new diagram_ts.Port(this, diagram_ts.PortType.top);
        bottomPort = new diagram_ts.Port(this, diagram_ts.PortType.bottom);
        truePort = new diagram_ts.Port(this, diagram_ts.PortType.bottom);
        conditionPort = new diagram_ts.Port(this, diagram_ts.PortType.inputPort);
        constructor(data) {
            super(data);
            this.ports = [
                this.topPort,
                this.bottomPort,
                this.truePort,
                this.conditionPort
            ];
        }
        isTrue() {
            return this.conditionPort.value == 1;
        }
        trueBlock() {
            return this.innerBlock();
        }
        draw() {
            const [pos, size] = this.drawBox();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth;
            const y1 = pos.y + this.borderWidth + diagram_ts.blockLineWidth;
            const x2 = x1 + 35;
            const x3 = x2 + 35;
            const x4 = x1 + this.minSize.x;
            const y2 = y1 + diagram_ts.nest_h1;
            const y3 = y2 + diagram_ts.nest_h2 + this.innerBlocksHeight();
            const y4 = y3 + diagram_ts.nest_h3 - diagram_ts.notchRadius;
            this.drawOutline([
                // left top
                [x1, y1, null],
                // left bottom
                [x1, y4, null],
                // bottom notch
                [x2, y4, this.bottomPort],
                // right bottom
                [x4, y4, null],
                [x4, y3, null],
                [x2, y3, null],
                [x2, y2, null],
                // loop notch
                [x3, y2, this.truePort],
                [x4, y2, null],
                // right top
                [x4, y1, null],
                // top notch
                [x2, y1, this.topPort]
            ]);
            this.conditionPort.drawPort(this.ctx, x4 - diagram_ts.Port.radius, 0.5 * (y1 + y2));
        }
        async run() {
            const true_block = this.trueBlock();
            if (true_block != undefined && this.isTrue()) {
                await diagram_ts.runBlockChain(true_block);
            }
        }
    }
    diagram_ts.IfBlock = IfBlock;
    class InfiniteLoop extends NestBlock {
        topPort = new diagram_ts.Port(this, diagram_ts.PortType.top);
        loopPort = new diagram_ts.Port(this, diagram_ts.PortType.bottom);
        constructor(data) {
            super(data);
            this.ports = [
                this.topPort,
                this.loopPort
            ];
        }
        loopBlock() {
            return this.innerBlock();
        }
        draw() {
            const [pos, size] = this.drawBox();
            const x1 = pos.x + this.borderWidth + diagram_ts.blockLineWidth;
            const y1 = pos.y + this.borderWidth + diagram_ts.blockLineWidth;
            const x2 = x1 + 35;
            const x3 = x2 + 35;
            const x4 = x1 + this.minSize.x;
            const y2 = y1 + diagram_ts.nest_h1;
            const y3 = y2 + diagram_ts.nest_h2 + this.innerBlocksHeight();
            const y4 = y3 + diagram_ts.nest_h3;
            this.drawOutline([
                [x1, y1, null],
                [x1, y4, null],
                [x4, y4, null],
                [x4, y3, null],
                [x2, y3, null],
                [x2, y2, null],
                [x3, y2, this.loopPort],
                [x4, y2, null],
                [x4, y1, null],
                [x2, y1, this.topPort]
            ]);
        }
        async run() {
            const loop_block = this.loopBlock();
            if (loop_block != undefined) {
                while (true) {
                    await diagram_ts.runBlockChain(loop_block);
                    if (diagram_ts.stopFlag) {
                        break;
                    }
                    await diagram_ts.sleep(100);
                }
            }
        }
    }
    diagram_ts.InfiniteLoop = InfiniteLoop;
})(diagram_ts || (diagram_ts = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL2V4cG9ydC50cyIsIi4uLy4uLy4uL3RzL3VpLnRzIiwiLi4vLi4vLi4vdHMvYmxvY2sudHMiLCIuLi8uLi8uLi90cy9jYW52YXMudHMiLCIuLi8uLi8uLi90cy9kaWFncmFtLnRzIiwiLi4vLi4vLi4vdHMvZGlhZ3JhbV91dGlsLnRzIiwiLi4vLi4vLi4vdHMvanNvbi11dGlsLnRzIiwiLi4vLi4vLi4vdHMvcHJvY2VkdXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFVLFVBQVUsQ0F5RG5CO0FBekRELFdBQVUsVUFBVTtJQUNwQixFQUFFO0lBQ1csa0JBQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzFCLGlCQUFNLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN6QixjQUFHLEdBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUN0QixnQkFBSyxHQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDeEIsaUJBQU0sR0FBSSxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ3pCLHNCQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUNsQyxtQkFBUSxHQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUM7SUFDL0IsZ0JBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3RCLGlCQUFNLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN6QixZQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUVkLGVBQUksR0FBTSxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3ZCLGlCQUFNLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN6QixpQkFBTSxHQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDekIsb0JBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBRTlCLGNBQUcsR0FBSSxPQUFPLENBQUMsR0FBRyxDQUFDO0lBQ25CLGVBQUksR0FBSSxP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QUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxXQUFBLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELFdBQVcsQ0FBQyxRQUFlO1lBQ3ZCLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFNUIsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFbkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQy9DLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUVsRCxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBQSxjQUFjLEdBQUcsQ0FBQyxHQUFHLFdBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN2RSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBRTNCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBSSxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBRWxDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBSSxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBRXJDLElBQUksQ0FBQyxRQUFRLENBQUMs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LENBQUM7Z0JBRWQsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQztnQkFDZCxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDdkIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQztnQkFFZCxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDO2dCQUNkLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3pCLENBQUMsQ0FBQTtRQUNOLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRztZQUNMLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNwQyxJQUFHLFVBQVUsSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDeEIsT0FBTSxJQUFJLEVBQUMsQ0FBQztvQkFDUixNQUFNLFdBQUEsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUVoQyxJQUFHLFdBQUEsUUFBUSxFQUFDLENBQUM7d0JBQ1QsTUFBTTtvQkFDVixDQUFDO29CQUVELE1BQU0sV0FBQSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztLQUNKO0lBOURZLHVCQUFZLGVBOER4QixDQUFBO0FBRUQsQ0FBQyxFQXpNUyxVQUFVLEtBQVYsVUFBVSxRQXlNbkIiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgZGlhZ3JhbV90cyB7XHJcbi8vXHJcbmV4cG9ydCBjb25zdCBNeUVycm9yID0gaTE4bl90cy5NeUVycm9yO1xyXG5leHBvcnQgY29uc3QgYXNzZXJ0ICA9IGkxOG5fdHMuYXNzZXJ0O1xyXG5leHBvcnQgY29uc3QgbXNnICAgICA9IGkxOG5fdHMubXNnO1xyXG5leHBvcnQgY29uc3QgcmFuZ2UgICA9IGkxOG5fdHMucmFuZ2U7XHJcbmV4cG9ydCBjb25zdCByYW5nZTIgID0gaTE4bl90cy5yYW5nZTI7XHJcbmV4cG9ydCBjb25zdCBzZXRQbGF5TW9kZSA9IGkxOG5fdHMuc2V0UGxheU1vZGU7XHJcbmV4cG9ydCBjb25zdCBQbGF5TW9kZSAgICA9IGkxOG5fdHMuUGxheU1vZGU7XHJcbmV4cG9ydCBjb25zdCBzbGVlcCA9IGkxOG5fdHMuc2xlZXA7XHJcbmV4cG9ydCBjb25zdCBhcHBlbmQgID0gaTE4bl90cy5hcHBlbmQ7XHJcbmV4cG9ydCBjb25zdCAkID0gaTE4bl90cy4kO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxhc3QgICAgPSBpMThuX3RzLmxhc3Q7XHJcbmV4cG9ydCBjb25zdCB1bmlxdWUgID0gaTE4bl90cy51bmlxdWU7XHJcbmV4cG9ydCBjb25zdCByZW1vdmUgID0gaTE4bl90cy5yZW1vdmU7XHJcbmV4cG9ydCBjb25zdCBhcnJheUZpbGwgPSBpMThuX3RzLmFycmF5RmlsbDtcclxuXHJcbmV4cG9ydCBjb25zdCBzdW0gID0gaTE4bl90cy5zdW07XHJcbmV4cG9ydCBjb25zdCBsaXN0ICA9IGkxOG5fdHMubGlzdDtcclxuZXhwb3J0IGNvbnN0IGludGVyc2VjdGlvbiAgPSBpMThuX3RzLmludGVyc2VjdGlvbjtcclxuZXhwb3J0IGNvbnN0IHBlcm11dGF0aW9uICA9IGkxOG5fdHMucGVybXV0YXRpb247XHJcbmV4cG9ydCBjb25zdCBjaXJjdWxhclBlcm11dGF0aW9uICA9IGkxOG5fdHMuY2lyY3VsYXJQZXJtdXRhdGlvbjtcclxuZXhwb3J0IGNvbnN0IGFyZVNldHNFcXVhbCAgPSBpMThuX3RzLmFyZVNldHNFcXVhbDtcclxuZXhwb3J0IGNvbnN0IGlzU3ViU2V0ICA9IGkxOG5fdHMuaXNTdWJTZXQ7XHJcbmV4cG9ydCBjb25zdCBjaGVjayA9IGkxOG5fdHMuY2hlY2s7XHJcbmV4cG9ydCB0eXBlICBTcGVlY2ggPSBpMThuX3RzLlNwZWVjaDtcclxuXHJcbmV4cG9ydCB0eXBlIEFic3RyYWN0U3BlZWNoID0gaTE4bl90cy5BYnN0cmFjdFNwZWVjaDtcclxuZXhwb3J0IGNvbnN0IFNwZWVjaCA9IGkxOG5fdHMuU3BlZWNoO1xyXG5cclxuZXhwb3J0IGNvbnN0IHBhcnNlTWF0aCA9IHBhcnNlcl90cy5wYXJzZU1hdGg7XHJcbmV4cG9ydCBjb25zdCByZW5kZXJLYXRleFN1YiA9IHBhcnNlcl90cy5yZW5kZXJLYXRleFN1YjtcclxuZXhwb3J0IGNvbnN0IHNob3dGbG93ID0gcGFyc2VyX3RzLnNob3dGbG93O1xyXG5leHBvcnQgY29uc3QgbWFrZUlkVG9UZXJtTWFwID0gcGFyc2VyX3RzLm1ha2VJZFRvVGVybU1hcDtcclxuXHJcbmV4cG9ydCB0eXBlICBSYXRpb25hbCA9IHBhcnNlcl90cy5SYXRpb25hbDtcclxuZXhwb3J0IGNvbnN0IFJhdGlvbmFsID0gcGFyc2VyX3RzLlJhdGlvbmFsO1xyXG5cclxuZXhwb3J0IHR5cGUgIFRlcm0gPSBwYXJzZXJfdHMuVGVybTtcclxuZXhwb3J0IGNvbnN0IFRlcm0gPSBwYXJzZXJfdHMuVGVybTtcclxuXHJcbmV4cG9ydCB0eXBlICBDb25zdE51bSA9IHBhcnNlcl90cy5Db25zdE51bTtcclxuZXhwb3J0IGNvbnN0IENvbnN0TnVtID0gcGFyc2VyX3RzLkNvbnN0TnVtO1xyXG5cclxuZXhwb3J0IHR5cGUgIEFwcCA9IHBhcnNlcl90cy5BcHA7XHJcbmV4cG9ydCBjb25zdCBBcHAgPSBwYXJzZXJfdHMuQXBwO1xyXG5cclxuZXhwb3J0IHR5cGUgIFJlZlZhciA9IHBhcnNlcl90cy5SZWZWYXI7XHJcbmV4cG9ydCBjb25zdCBSZWZWYXIgPSBwYXJzZXJfdHMuUmVmVmFyO1xyXG5cclxuZXhwb3J0IGNvbnN0IG9wZXJhdG9yID0gcGFyc2VyX3RzLm9wZXJhdG9yO1xyXG5cclxuZXhwb3J0IHR5cGUgIFZlYzIgPSBwbGFuZV90cy5WZWMyO1xyXG5leHBvcnQgY29uc3QgVmVjMiA9IHBsYW5lX3RzLlZlYzI7XHJcblxyXG5cclxufSIsIm5hbWVzcGFjZSBkaWFncmFtX3RzIHtcclxuLy9cclxuY29uc3QgQVVUTyA9IFwiYXV0b1wiO1xyXG5jb25zdCBUZXh0U2l6ZUZpbGwgPSA4O1xyXG5leHBvcnQgY29uc3QgdGV4dENvbG9yID0gXCJibGFja1wiO1xyXG5cclxuZnVuY3Rpb24gcmF0aW8od2lkdGggOiBzdHJpbmcpIDogbnVtYmVyIHtcclxuICAgIHdpZHRoID0gd2lkdGgudHJpbSgpO1xyXG4gICAgYXNzZXJ0KHdpZHRoLmVuZHNXaXRoKFwiJVwiKSk7XHJcbiAgICBjb25zdCBudW1fc3RyID0gd2lkdGguc3Vic3RyaW5nKDAsIHdpZHRoLmxlbmd0aCAtIDEpO1xyXG5cclxuICAgIGNvbnN0IG51bSA9IHBhcnNlRmxvYXQobnVtX3N0cik7XHJcblxyXG4gICAgcmV0dXJuIG51bSAvIDEwMDtcclxufVxyXG5cclxuZnVuY3Rpb24gcGl4ZWwobGVuZ3RoIDogc3RyaW5nLCAgcmVtYWluaW5nX2xlbmd0aD8gOiBudW1iZXIpIDogbnVtYmVyIHtcclxuICAgIGlmKGxlbmd0aCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGlmKGxlbmd0aC5lbmRzV2l0aChcInB4XCIpKXtcclxuICAgICAgICAgICAgY29uc3QgbnVtX3N0ciA9IGxlbmd0aC5zdWJzdHJpbmcoMCwgbGVuZ3RoLmxlbmd0aCAtIDIpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobnVtX3N0cik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYobGVuZ3RoLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgIGlmKHJlbWFpbmluZ19sZW5ndGggIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiByYXRpbyhsZW5ndGgpICogcmVtYWluaW5nX2xlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldENvbnRleHQyRChjdHggOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHVpIDogVUkpe1xyXG4gICAgdWkuY3R4ID0gY3R4O1xyXG4gICAgdWkuY2hpbGRyZW4oKS5mb3JFYWNoKGNoaWxkID0+IHNldENvbnRleHQyRChjdHgsIGNoaWxkKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQXR0ciB7XHJcbiAgICBjbGFzc05hbWU/IDogc3RyaW5nO1xyXG4gICAgb2JqPyA6IGFueTtcclxuICAgIG5hbWU/IDogc3RyaW5nO1xyXG4gICAgcG9zaXRpb24/IDogc3RyaW5nO1xyXG4gICAgbWFyZ2luPyA6IG51bWJlcltdO1xyXG4gICAgY29sb3I/IDogc3RyaW5nO1xyXG4gICAgYmFja2dyb3VuZENvbG9yPyA6IHN0cmluZztcclxuICAgIGJvcmRlclN0eWxlPyA6IHN0cmluZztcclxuICAgIGJvcmRlcldpZHRoPyA6IG51bWJlcjtcclxuICAgIHBhZGRpbmc/IDogbnVtYmVyW107XHJcbiAgICBwYWRkaW5nTGVmdD8gOiBzdHJpbmc7XHJcbiAgICB2ZXJ0aWNhbEFsaWduPyA6IHN0cmluZztcclxuICAgIGhvcml6b250YWxBbGlnbj8gOiBzdHJpbmc7XHJcbiAgICBjb2xzcGFuPyA6IG51bWJlcjtcclxuICAgIHdpZHRoPyA6IHN0cmluZztcclxuICAgIGhlaWdodD8gOiBzdHJpbmc7XHJcbiAgICBkaXNhYmxlZD8gOiBib29sZWFuO1xyXG4gICAgdmlzaWJpbGl0eT8gOiBzdHJpbmc7XHJcbiAgICBpblRvb2xib3g/ICAgOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRleHRBdHRyIGV4dGVuZHMgQXR0ciB7XHJcbiAgICB0ZXh0PyA6IHN0cmluZztcclxuICAgIGZvbnRTaXplPyA6IHN0cmluZztcclxuICAgIHRleHRBbGlnbj8gOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnV0dG9uQXR0ciBleHRlbmRzIFRleHRBdHRyIHtcclxuICAgIGNsaWNrIDogKCk9PlByb21pc2U8dm9pZD47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgR3JpZEF0dHIgZXh0ZW5kcyBBdHRyIHtcclxuICAgIGNvbHVtbnM/OiBzdHJpbmc7XHJcbiAgICByb3dzPyAgIDogc3RyaW5nO1xyXG4gICAgY2VsbHMgOiBVSVtdW107XHJcbn1cclxuXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVUkge1xyXG4gICAgc3RhdGljIGNvdW50IDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBpZHggOiBudW1iZXI7XHJcbiAgICBjdHghIDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG4gICAgcG9zaXRpb24gOiBWZWMyID0gVmVjMi56ZXJvKCk7XHJcbiAgICBib3hTaXplICA6IFZlYzIgPSBWZWMyLnplcm8oKTtcclxuICAgIHdpZHRoPyA6IHN0cmluZztcclxuICAgIGhlaWdodD8gOiBzdHJpbmc7XHJcbiAgICBtaW5TaXplIDogVmVjMiB8IHVuZGVmaW5lZDtcclxuICAgIGNvbHNwYW4gOiBudW1iZXIgPSAxO1xyXG4gICAgcm93c3BhbiA6IG51bWJlciA9IDE7XHJcbiAgICBtYXJnaW4gOiBudW1iZXJbXSA9IFsgNCwgNCwgNCwgNCBdOyAgICAgLy8gbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tXHJcbiAgICBib3JkZXJXaWR0aCA6IG51bWJlciA9IDM7XHJcbiAgICBwYWRkaW5nIDogbnVtYmVyW10gPSBbIDAsIDAsIDAsIDAgXTsgICAgLy8gbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tXHJcblxyXG4gICAgaG9yaXpvbnRhbEFsaWduPyA6IHN0cmluZztcclxuICAgIGJhY2tncm91bmRDb2xvcj8gOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHRoaXMuaWR4ID0gKytVSS5jb3VudDtcclxuICAgICAgICBpZihkYXRhLmNvbHNwYW4gIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy5jb2xzcGFuID0gZGF0YS5jb2xzcGFuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IGRhdGEuYmFja2dyb3VuZENvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIGNoaWxkcmVuKCkgOiBVSVtdIHtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9ICAgIFxyXG5cclxuICAgIGdldEFsbFVJU3ViKHVpcyA6IFVJW10pe1xyXG4gICAgICAgIHVpcy5wdXNoKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4oKS5mb3JFYWNoKHggPT4geC5nZXRBbGxVSVN1Yih1aXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBbGxVSSgpIDogVUlbXSB7XHJcbiAgICAgICAgbGV0IHVpcyA6IFVJW10gPSBbXTtcclxuICAgICAgICB0aGlzLmdldEFsbFVJU3ViKHVpcyk7XHJcblxyXG4gICAgICAgIHJldHVybiB1aXM7XHJcbiAgICB9XHJcblxyXG4gICAgbWFyZ2luV2lkdGgoKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFyZ2luWzBdICsgdGhpcy5tYXJnaW5bMV07XHJcbiAgICB9XHJcblxyXG4gICAgbWFyZ2luSGVpZ2h0KCkgOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcmdpblsyXSArIHRoaXMubWFyZ2luWzNdO1xyXG4gICAgfVxyXG5cclxuICAgIG1hcmdpbkJvcmRlclBhZGRpbmdXaWR0aCgpIDogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXJnaW5bMF0gKyB0aGlzLm1hcmdpblsxXSArIDIgKiB0aGlzLmJvcmRlcldpZHRoICsgdGhpcy5wYWRkaW5nWzBdICsgdGhpcy5wYWRkaW5nWzFdO1xyXG4gICAgfVxyXG5cclxuICAgIG1hcmdpbkJvcmRlclBhZGRpbmdIZWlnaHQoKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFyZ2luWzJdICsgdGhpcy5tYXJnaW5bM10gKyAyICogdGhpcy5ib3JkZXJXaWR0aCArIHRoaXMucGFkZGluZ1syXSArIHRoaXMucGFkZGluZ1szXTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBWZWMyLnplcm8oKTtcclxuICAgICAgICBtc2coYHNldC1taW4tc2l6ZToke3RoaXMuY29uc3RydWN0b3IubmFtZX1gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRNaW5XaWR0aCgpIDogbnVtYmVyIHsgICAgICAgXHJcbiAgICAgICAgYXNzZXJ0KHRoaXMubWluU2l6ZSAhPSB1bmRlZmluZWQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pblNpemUhLng7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TWluSGVpZ2h0KCkgOiBudW1iZXIge1xyXG4gICAgICAgIGFzc2VydCh0aGlzLm1pblNpemUgIT0gdW5kZWZpbmVkKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5taW5TaXplIS55O1xyXG4gICAgfVxyXG5cclxuICAgIHNldFBvc2l0aW9uKHBvc2l0aW9uIDogVmVjMikgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgbGF5b3V0KHggOiBudW1iZXIsIHkgOiBudW1iZXIsIHNpemUgOiBWZWMyLCBuZXN0IDogbnVtYmVyKXtcclxuICAgICAgICB0aGlzLmJveFNpemUgPSBzaXplO1xyXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24obmV3IFZlYzIoeCwgeSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdCb3goKSA6IFtWZWMyLCBWZWMyXSB7XHJcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zaXRpb24ueCArIHRoaXMubWFyZ2luWzBdO1xyXG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLm1hcmdpblsyXTtcclxuICAgICAgICBjb25zdCB3ID0gdGhpcy5ib3hTaXplLnggLSB0aGlzLm1hcmdpbldpZHRoKCk7XHJcbiAgICAgICAgY29uc3QgaCA9IHRoaXMuYm94U2l6ZS55IC0gdGhpcy5tYXJnaW5IZWlnaHQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFsgbmV3IFZlYzIoeCwgeSksIG5ldyBWZWMyKHcsIGgpIF07XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIGNvbnN0IFtwb3MsIHNpemVdID0gdGhpcy5kcmF3Qm94KCk7XHJcbiAgICAgICAgdGhpcy5kcmF3UmlkZ2VSZWN0Mih0aGlzLmN0eCwgcG9zLngsIHBvcy55LCBzaXplLngsIHNpemUueSwgdGhpcy5ib3JkZXJXaWR0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RyKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIGlmKHRoaXMubWluU2l6ZSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgd2lkdGggID0gKHRoaXMud2lkdGggICE9IHVuZGVmaW5lZCA/IGB3aWR0aDoke3RoaXMud2lkdGh9IGAgIDogXCJcIik7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gKHRoaXMuaGVpZ2h0ICE9IHVuZGVmaW5lZCA/IGBoZWlnaHQ6JHt0aGlzLmhlaWdodH0gYCA6IFwiXCIpO1xyXG4gICAgICAgIGNvbnN0IG1pblNpemUgPSAodGhpcy5taW5TaXplIT0gdW5kZWZpbmVkID8gYG1pbi1zaXplOiR7dGhpcy5taW5TaXplLngudG9GaXhlZCgpfSwgJHt0aGlzLm1pblNpemUueS50b0ZpeGVkKCl9IGAgOiBcIlwiKTtcclxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGBwb3M6KCR7dGhpcy5wb3NpdGlvbi54fSwke3RoaXMucG9zaXRpb24ueX0pIGA7XHJcbiAgICAgICAgY29uc3QgYm94U2l6ZSA9IGBib3g6KCR7dGhpcy5ib3hTaXplLnh9LCR7dGhpcy5ib3hTaXplLnl9KSBgO1xyXG5cclxuICAgICAgICByZXR1cm4gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAke3dpZHRofSR7aGVpZ2h0fSR7bWluU2l6ZX0ke3Bvc2l0aW9ufSR7Ym94U2l6ZX1gO1xyXG4gICAgfVxyXG5cclxuICAgIGR1bXAobmVzdCA6IG51bWJlcil7XHJcbiAgICAgICAgbXNnKGAke1wiIFwiLnJlcGVhdChuZXN0ICogNCl9JHt0aGlzLnN0cigpfWApO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBkcmF3UmlkZ2VSZWN0MihjdHggOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHggOiBudW1iZXIsIHkgOiBudW1iZXIsIHdpZHRoIDogbnVtYmVyLCBoZWlnaHQgOiBudW1iZXIsIHJpZGdlV2lkdGggOiBudW1iZXIsIGlzSW5zZXQgPSBmYWxzZSkge1xyXG4gICAgICAgIC8vIERlZmluZSBsaWdodCBhbmQgZGFyayBjb2xvcnNcclxuICAgICAgICAvLyBjb25zdCBsaWdodENvbG9yID0gaXNJbnNldCA/ICcjODg4JyA6ICcjZWVlJzsgLy8gRGFya2VyIGZvciBpbnNldCB0b3AvbGVmdFxyXG4gICAgICAgIC8vIGNvbnN0IGRhcmtDb2xvciA9IGlzSW5zZXQgPyAnI2VlZScgOiAnIzg4OCc7ICAvLyBMaWdodGVyIGZvciBpbnNldCBib3R0b20vcmlnaHRcclxuXHJcbiAgICAgICAgY29uc3QgbGlnaHRDb2xvciA9IFwiI2ZmZmZmZlwiO1xyXG4gICAgICAgIGNvbnN0IGRhcmtDb2xvciA9IFwiIzg4ODg4OFwiO1xyXG4gICAgICAgIGNvbnN0IGJhY2tncm91bmRDb2xvciA9ICh0aGlzLmJhY2tncm91bmRDb2xvciAhPSB1bmRlZmluZWQgPyB0aGlzLmJhY2tncm91bmRDb2xvciA6IFwiI2NjY2NjY1wiKTtcclxuXHJcbiAgICAgICAgLy8gT3B0aW9uYWxseSwgZHJhdyB0aGUgaW5uZXIgcmVjdGFuZ2xlIChmaWxsIG9yIGFub3RoZXIgc3Ryb2tlKVxyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kQ29sb3I7IC8vIEV4YW1wbGUgaW5uZXIgY29sb3JcclxuICAgICAgICBjdHguZmlsbFJlY3QoeCArIHJpZGdlV2lkdGgsIHkgKyByaWRnZVdpZHRoLCB3aWR0aCAtIDIgKiByaWRnZVdpZHRoLCBoZWlnaHQgLSAyICogcmlkZ2VXaWR0aCk7XHJcblxyXG4gICAgICAgIC8vIERyYXcgdGhlIFwibGlnaHRcIiBzaWRlcyAodG9wIGFuZCBsZWZ0KVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGxpZ2h0Q29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IHJpZGdlV2lkdGg7XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8oeCArIHJpZGdlV2lkdGggLyAyLCB5ICsgaGVpZ2h0IC0gcmlkZ2VXaWR0aCAvIDIpOyAvLyBCb3R0b20tbGVmdCBjb3JuZXJcclxuICAgICAgICBjdHgubGluZVRvKHggKyByaWRnZVdpZHRoIC8gMiwgeSArIHJpZGdlV2lkdGggLyAyKTsgICAgIC8vIFRvcC1sZWZ0IGNvcm5lclxyXG4gICAgICAgIGN0eC5saW5lVG8oeCArIHdpZHRoIC0gcmlkZ2VXaWR0aCAvIDIsIHkgKyByaWRnZVdpZHRoIC8gMik7IC8vIFRvcC1yaWdodCBjb3JuZXJcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIC8vIERyYXcgdGhlIFwiZGFya1wiIHNpZGVzIChib3R0b20gYW5kIHJpZ2h0KVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGRhcmtDb2xvcjtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gcmlkZ2VXaWR0aDtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4Lm1vdmVUbyh4ICsgd2lkdGggLSByaWRnZVdpZHRoIC8gMiwgeSArIHJpZGdlV2lkdGggLyAyKTsgICAgIC8vIFRvcC1yaWdodCBjb3JuZXJcclxuICAgICAgICBjdHgubGluZVRvKHggKyB3aWR0aCAtIHJpZGdlV2lkdGggLyAyLCB5ICsgaGVpZ2h0IC0gcmlkZ2VXaWR0aCAvIDIpOyAvLyBCb3R0b20tcmlnaHQgY29ybmVyXHJcbiAgICAgICAgY3R4LmxpbmVUbyh4ICsgcmlkZ2VXaWR0aCAvIDIsIHkgKyBoZWlnaHQgLSByaWRnZVdpZHRoIC8gMik7IC8vIEJvdHRvbS1sZWZ0IGNvcm5lclxyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3UmlkZ2VSZWN0KGN0eCA6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgeCA6IG51bWJlciwgeSA6IG51bWJlciwgd2lkdGggOiBudW1iZXIsIGhlaWdodCA6IG51bWJlciwgYm9yZGVyV2lkdGggOiBudW1iZXIsIGlzSW5zZXQgPSBmYWxzZSl7XHJcbiAgICAgICAgLy8gQ29sb3JzIGZvciByaWRnZSBlZmZlY3RcclxuICAgICAgICBjb25zdCBsaWdodENvbG9yID0gXCIjZmZmZmZmXCI7XHJcbiAgICAgICAgY29uc3QgZGFya0NvbG9yID0gXCIjODg4ODg4XCI7XHJcbiAgICAgICAgY29uc3QgYmFja2dyb3VuZENvbG9yID0gXCIjY2NjY2NjXCI7XHJcblxyXG4gICAgICAgIC8vIEZpbGwgcmVjdGFuZ2xlIGJhY2tncm91bmRcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgLy8gVG9wICYgbGVmdCAoaGlnaGxpZ2h0KVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGxpZ2h0Q29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IGJvcmRlcldpZHRoO1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHgubW92ZVRvKHggKyB3aWR0aCwgeSk7ICAgICAgIC8vIFRvcC1yaWdodFxyXG4gICAgICAgIGN0eC5saW5lVG8oeCwgeSk7ICAgICAgICAgICAgICAgLy8gVG9wLWxlZnRcclxuICAgICAgICBjdHgubGluZVRvKHgsIHkgKyBoZWlnaHQpOyAgICAgIC8vIEJvdHRvbS1sZWZ0XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAvLyBCb3R0b20gJiByaWdodCAoc2hhZG93KVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGRhcmtDb2xvcjtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4Lm1vdmVUbyh4LCB5ICsgaGVpZ2h0KTsgICAgICAvLyBCb3R0b20tbGVmdFxyXG4gICAgICAgIGN0eC5saW5lVG8oeCArIHdpZHRoLCB5ICsgaGVpZ2h0KTsgLy8gQm90dG9tLXJpZ2h0XHJcbiAgICAgICAgY3R4LmxpbmVUbyh4ICsgd2lkdGgsIHkpOyAgICAgICAvLyBUb3AtcmlnaHRcclxuICAgICAgICBjdHguc3Ryb2tlKCk7ICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxsZXIgZXh0ZW5kcyBVSSB7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUZXh0VUkgZXh0ZW5kcyBVSSB7XHJcbiAgICBmb250U2l6ZT8gOiBzdHJpbmc7XHJcbiAgICB0ZXh0QWxpZ24/IDogc3RyaW5nO1xyXG4gICAgdGV4dCA6IHN0cmluZztcclxuICAgIG1ldHJpY3MhOiBUZXh0TWV0cmljcztcclxuICAgIGFjdHVhbEhlaWdodCE6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogVGV4dEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZm9udFNpemUgID0gZGF0YS5mb250U2l6ZTtcclxuICAgICAgICB0aGlzLnRleHRBbGlnbiA9IGRhdGEudGV4dEFsaWduO1xyXG4gICAgICAgIHRoaXMudGV4dCA9IChkYXRhLnRleHQgIT0gdW5kZWZpbmVkID8gZGF0YS50ZXh0IDogXCJcIik7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubWV0cmljcyA9IHRoaXMuY3R4Lm1lYXN1cmVUZXh0KHRoaXMudGV4dCk7XHJcbiAgICAgIFxyXG4gICAgICAgIHRoaXMuYWN0dWFsSGVpZ2h0ID0gdGhpcy5tZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50ICsgdGhpcy5tZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94RGVzY2VudDtcclxuICAgICAgXHJcbiAgICAgICAgbXNnKGBpZHg6WyR7dGhpcy5pZHh9XSAgZm9udCA6WyR7dGhpcy5mb250U2l6ZX1dICB3Olske3RoaXMubWV0cmljcy53aWR0aH1dIGg6WyR7dGhpcy5hY3R1YWxIZWlnaHR9XSBbJHt0aGlzLnRleHR9XWApO1xyXG5cclxuICAgICAgICBjb25zdCB3aWR0aCAgPSB0aGlzLm1ldHJpY3Mud2lkdGggKyB0aGlzLm1hcmdpbkJvcmRlclBhZGRpbmdXaWR0aCgpICsgVGV4dFNpemVGaWxsO1xyXG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuYWN0dWFsSGVpZ2h0ICArIHRoaXMubWFyZ2luQm9yZGVyUGFkZGluZ0hlaWdodCgpICsgVGV4dFNpemVGaWxsO1xyXG5cclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMih3aWR0aCwgaGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgc3VwZXIuZHJhdygpO1xyXG5cclxuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5tYXJnaW5bMF0gKyB0aGlzLmJvcmRlcldpZHRoICsgdGhpcy5wYWRkaW5nWzBdO1xyXG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLm1hcmdpblsyXSArIHRoaXMuYm9yZGVyV2lkdGggKyB0aGlzLnBhZGRpbmdbMl1cclxuICAgICAgICAgICAgICAgICAgKyB0aGlzLmFjdHVhbEhlaWdodDtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0ZXh0Q29sb3I7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlVGV4dCh0aGlzLnRleHQsIHgsIHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0cigpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gYCR7c3VwZXIuc3RyKCl9IHRleHQ6JHt0aGlzLnRleHR9YDtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMYWJlbCBleHRlbmRzIFRleHRVSSB7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCdXR0b24gZXh0ZW5kcyBUZXh0VUkge1xyXG4gICAgY2xpY2sgOiAoKT0+UHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQnV0dG9uQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5jbGljayA9IGRhdGEuY2xpY2s7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOb2RlIGV4dGVuZHMgVUkge1xyXG4gICAgYWJzdHJhY3QgZG9uZSgpIDogYm9vbGVhbjtcclxuICAgIGFic3RyYWN0IGRyYXdOb2RlKGNhbnZhcyA6IENhbnZhcykgOiB2b2lkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEVkaXRvciBleHRlbmRzIFVJIHtcclxuICAgIGJsb2NrcyA6IEJsb2NrW10gPSBbXTtcclxuXHJcbiAgICBjaGlsZHJlbigpIDogVUlbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tzLnNsaWNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQmxvY2soYmxvY2sgOiBCbG9jayl7XHJcbiAgICAgICAgdGhpcy5ibG9ja3MucHVzaChibG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIHN1cGVyLmRyYXcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5ibG9ja3MuZm9yRWFjaCh4ID0+IHguZHJhdygpKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyaWQgZXh0ZW5kcyBVSSB7XHJcbiAgICBjb2xEZXNjcyA6IHN0cmluZ1tdO1xyXG4gICAgcm93RGVzY3MgICA6IHN0cmluZ1tdO1xyXG4gICAgY2VsbHMgOiBVSVtdW107XHJcblxyXG4gICAgbWluV2lkdGhzIDogbnVtYmVyW10gPSBbXTtcclxuICAgIG1pbkhlaWdodHM6IG51bWJlcltdID0gW107XHJcblxyXG4gICAgY29sV2lkdGhzIDogbnVtYmVyW10gPSBbXTtcclxuICAgIHJvd0hlaWdodHM6IG51bWJlcltdID0gW107XHJcblxyXG4gICAgbnVtUm93cyA6IG51bWJlcjtcclxuICAgIG51bUNvbHMgOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEdyaWRBdHRyKXsgICAgICAgIFxyXG4gICAgICAgIHN1cGVyKGRhdGEgYXMgYW55KTtcclxuXHJcbiAgICAgICAgdGhpcy5jZWxscyA9IGRhdGEuY2VsbHM7XHJcbiAgICAgICAgdGhpcy5udW1Sb3dzID0gdGhpcy5jZWxscy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5udW1Db2xzID0gTWF0aC5tYXgoLi4uIHRoaXMuY2VsbHMubWFwKHJvdyA9PiBzdW0ocm93Lm1hcCh1aSA9PiB1aS5jb2xzcGFuKSkpKTtcclxuXHJcbiAgICAgICAgaWYoZGF0YS5jb2x1bW5zID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMuY29sRGVzY3MgPSBhcnJheUZpbGwodGhpcy5udW1Db2xzLCBcImF1dG9cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNvbERlc2NzID0gZGF0YS5jb2x1bW5zLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGRhdGEucm93cyA9PSB1bmRlZmluZWQpe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yb3dEZXNjcyA9IGFycmF5RmlsbCh0aGlzLm51bVJvd3MsIFwiYXV0b1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucm93RGVzY3MgPSBkYXRhLnJvd3Muc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXNzZXJ0KHRoaXMuY29sRGVzY3MubGVuZ3RoID09IHRoaXMubnVtQ29scyk7XHJcbiAgICAgICAgYXNzZXJ0KHRoaXMucm93RGVzY3MubGVuZ3RoICAgPT0gdGhpcy5udW1Sb3dzKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGlsZHJlbigpIDogVUlbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHMuZmxhdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvdyhpZHggOiBudW1iZXIpIDogVUlbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHNbaWR4XTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3dIZWlnaHQoaWR4IDogbnVtYmVyKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KC4uLiB0aGlzLmdldFJvdyhpZHgpLm1hcCh1aSA9PiB1aS5nZXRNaW5IZWlnaHQoKSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbHVtbldpdGgoY29sX2lkeCA6IG51bWJlcikgOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBtYXhfd2lkdGggPSAwO1xyXG4gICAgICAgIGZvcihjb25zdCByb3cgb2YgdGhpcy5jZWxscyl7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgdWkgb2Ygcm93KXtcclxuICAgICAgICAgICAgICAgIGlmKG9mZnNldCA9PSBjb2xfaWR4KXtcclxuICAgICAgICAgICAgICAgICAgICBpZih1aS5jb2xzcGFuID09IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhfd2lkdGggPSBNYXRoLm1heChtYXhfd2lkdGgsIHVpLmdldE1pbldpZHRoKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gdWkuY29sc3BhbjtcclxuICAgICAgICAgICAgICAgIGlmKGNvbF9pZHggPCBvZmZzZXQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbWF4X3dpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGNIZWlnaHRzKCl7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0cyA9IG5ldyBBcnJheSh0aGlzLnJvd0Rlc2NzIS5sZW5ndGgpLmZpbGwoMCk7XHJcbiAgICAgICAgZm9yKGNvbnN0IFtpZHgsIHJvd10gb2YgdGhpcy5yb3dEZXNjcyEuZW50cmllcygpKXtcclxuICAgICAgICAgICAgaWYocm93LmVuZHNXaXRoKFwicHhcIikpe1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0c1tpZHhdID0gcGl4ZWwocm93KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHJvdyA9PSBBVVRPKXtcclxuICAgICAgICAgICAgICAgIGhlaWdodHNbaWR4XSA9IHRoaXMuZ2V0Um93SGVpZ2h0KGlkeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBoZWlnaHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemVTdWIoaXNfd2lkdGggOiBib29sZWFuKSA6IHZvaWQge1xyXG4gICAgICAgIGxldCBvZmZzZXRfc2l6ZV9weF91aV9zcGFucyA6IFtudW1iZXIsIG51bWJlciwgVUksIG51bWJlcl1bXSA9IFtdO1xyXG5cclxuICAgICAgICBjb25zdCBtaW5fc2l6ZXMgPSBhcnJheUZpbGwoaXNfd2lkdGggPyB0aGlzLm51bUNvbHMgOiB0aGlzLm51bVJvd3MsIDApO1xyXG4gICAgICAgIGZvcihjb25zdCBbcm93X2lkeCwgcm93XSBvZiB0aGlzLmNlbGxzLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgdWkgb2Ygcm93KXtcclxuICAgICAgICAgICAgICAgIGxldCBzaXplX3B4IDogbnVtYmVyO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IFt1aV9zaXplLCB1aV9taW5fc2l6ZSwgdWlfc3Bhbl0gPSAoaXNfd2lkdGggPyBbdWkud2lkdGgsIHVpLm1pblNpemUhLngsIHVpLmNvbHNwYW5dIDogW3VpLmhlaWdodCwgdWkubWluU2l6ZSEueSwgdWkucm93c3Bhbl0pO1xyXG4gICAgICAgICAgICAgICAgaWYodWlfc2l6ZSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIHNpemVfcHggPSB1aV9taW5fc2l6ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHVpX3NpemUuZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVfcHggPSBwaXhlbCh1aV9zaXplKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2l6ZV9weCA8IHVpX21pbl9zaXplKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZih1aV9zaXplLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVfcHggPSB1aV9taW5fc2l6ZSAvIHJhdGlvKHVpX3NpemUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSAoaXNfd2lkdGggPyBvZmZzZXQgOiByb3dfaWR4KTtcclxuICAgICAgICAgICAgICAgIGlmKHVpX3NwYW4gPT0gMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobWluX3NpemVzW3Bvc10gPCBzaXplX3B4KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluX3NpemVzW3Bvc10gPSBzaXplX3B4O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0X3NpemVfcHhfdWlfc3BhbnMucHVzaChbcG9zLCBzaXplX3B4LCB1aSwgdWlfc3Bhbl0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gdWkuY29sc3BhbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG1heF9yZW1haW5pbmdfc2l6ZSA9IDA7XHJcblxyXG4gICAgICAgIGNvbnN0IGRlc2NzID0gKGlzX3dpZHRoID8gdGhpcy5jb2xEZXNjcyA6IHRoaXMucm93RGVzY3MpO1xyXG4gICAgICAgIGZvcihjb25zdCBbb2Zmc2V0LCB3aWR0aF9weCwgdWksIHVpX3NwYW5dIG9mIG9mZnNldF9zaXplX3B4X3VpX3NwYW5zKXtcclxuICAgICAgICAgICAgbGV0IGZpeGVkX3B4ID0gMDtcclxuICAgICAgICAgICAgbGV0IHJhdGlvX3N1bSA9IDA7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBpZHggb2YgcmFuZ2UyKG9mZnNldCwgb2Zmc2V0ICsgdWlfc3Bhbikpe1xyXG4gICAgICAgICAgICAgICAgaWYoZGVzY3NbaWR4XS5lbmRzV2l0aChcIiVcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJhdGlvX3N1bSArPSByYXRpbyhkZXNjc1tpZHhdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZml4ZWRfcHggKz0gbWluX3NpemVzW2lkeF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHJhdGlvX3N1bSA9PSAwKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihmaXhlZF9weCA8IHVpLm1pblNpemUhLngpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGlmKGZpeGVkX3B4IDw9IHVpLm1pblNpemUhLngpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhdGlvX3B4ID0gdWkubWluU2l6ZSEueCAtIGZpeGVkX3B4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ193aWR0aCA9IHJhdGlvX3B4IC8gcmF0aW9fc3VtO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG1heF9yZW1haW5pbmdfc2l6ZSA8IHJlbWFpbmluZ193aWR0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heF9yZW1haW5pbmdfc2l6ZSA9IHJlbWFpbmluZ193aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IoY29uc3QgW2lkeCwgY29sXSBvZiBkZXNjcy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBpZihjb2wuZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgICAgICBtaW5fc2l6ZXNbaWR4XSA9IHBpeGVsKGNvbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihjb2wuZW5kc1dpdGgoXCIlXCIpKXtcclxuICAgICAgICAgICAgICAgIG1pbl9zaXplc1tpZHhdID0gbWF4X3JlbWFpbmluZ19zaXplICogcmF0aW8oY29sKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2l6ZSA9IHN1bShtaW5fc2l6ZXMpO1xyXG5cclxuICAgICAgICBjb25zdCB0aGlzX3NpemUgPSAoaXNfd2lkdGggPyB0aGlzLndpZHRoIDogdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIGxldCAgIHRoaXNfc2l6ZV9weCA6IG51bWJlcjtcclxuICAgICAgICBpZih0aGlzX3NpemUgPT0gdW5kZWZpbmVkIHx8IHRoaXNfc2l6ZSA9PSBcImF1dG9cIil7XHJcbiAgICAgICAgICAgIHRoaXNfc2l6ZV9weCA9IHNpemU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGlmKHRoaXNfc2l6ZS5lbmRzV2l0aChcInB4XCIpKXtcclxuICAgICAgICAgICAgICAgIHRoaXNfc2l6ZV9weCA9IHBpeGVsKHRoaXNfc2l6ZSk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzX3NpemVfcHggPCBzaXplKXtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpc19zaXplLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzX3NpemVfcHggPSBzaXplIC8gcmF0aW8odGhpc19zaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoaXNfd2lkdGgpe1xyXG4gICAgICAgICAgICB0aGlzLm1pbldpZHRocyAgPSBtaW5fc2l6ZXM7XHJcbiAgICAgICAgICAgIHRoaXMubWluU2l6ZSEueCA9IHRoaXNfc2l6ZV9weCArIHRoaXMubWFyZ2luQm9yZGVyUGFkZGluZ1dpZHRoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMubWluSGVpZ2h0cyA9IG1pbl9zaXplcztcclxuICAgICAgICAgICAgdGhpcy5taW5TaXplIS55ID0gdGhpc19zaXplX3B4ICsgdGhpcy5tYXJnaW5Cb3JkZXJQYWRkaW5nSGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBWZWMyLnplcm8oKTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbigpLmZvckVhY2goeCA9PiB4LnNldE1pblNpemUoKSk7XHJcbiAgICAgICAgdGhpcy5zZXRNaW5TaXplU3ViKHRydWUpO1xyXG4gICAgICAgIHRoaXMuc2V0TWluU2l6ZVN1YihmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNhbGNTaXplcyhkZXNjcyA6IHN0cmluZ1tdLCBtaW5fc2l6ZXMgOiBudW1iZXJbXSwgcmVtYWluaW5nX3B4IDogbnVtYmVyKSA6IG51bWJlciBbXXtcclxuICAgICAgICBjb25zdCBzaXplcyA9IEFycmF5PG51bWJlcj4oZGVzY3MubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IFtpZHgsIGRlc2NdIG9mIGRlc2NzLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIGlmKGRlc2MuZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgICAgICBzaXplc1tpZHhdID0gcGl4ZWwoZGVzYyk7XHJcbiAgICAgICAgICAgICAgICBpZihzaXplc1tpZHhdIDwgbWluX3NpemVzW2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihkZXNjLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICBzaXplc1tpZHhdID0gcmF0aW8oZGVzYykgKiByZW1haW5pbmdfcHg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihkZXNjID09IFwiYXV0b1wiKXtcclxuICAgICAgICAgICAgICAgIHNpemVzW2lkeF0gPSBtaW5fc2l6ZXNbaWR4XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNpemVzO1xyXG4gICAgfVxyXG5cclxuICAgIGxheW91dCh4IDogbnVtYmVyLCB5IDogbnVtYmVyLCBzaXplIDogVmVjMiwgbmVzdCA6IG51bWJlcil7XHJcbiAgICAgICAgc3VwZXIubGF5b3V0KHgsIHksIHNpemUsIG5lc3QpO1xyXG5cclxuICAgICAgICBjb25zdCBmaXhlZF93aWR0aF9weCAgPSBzdW0ocmFuZ2UodGhpcy5udW1Db2xzKS5maWx0ZXIoaSA9PiAhdGhpcy5jb2xEZXNjc1tpXS5lbmRzV2l0aChcIiVcIikpLm1hcChpID0+IHRoaXMubWluV2lkdGhzW2ldKSk7XHJcbiAgICAgICAgY29uc3QgZml4ZWRfaGVpZ2h0X3B4ID0gc3VtKHJhbmdlKHRoaXMubnVtUm93cykuZmlsdGVyKGkgPT4gIXRoaXMucm93RGVzY3NbaV0uZW5kc1dpdGgoXCIlXCIpKS5tYXAoaSA9PiB0aGlzLm1pbkhlaWdodHNbaV0pKTtcclxuXHJcbiAgICAgICAgaWYoc2l6ZS54IDwgZml4ZWRfd2lkdGhfcHggfHwgc2l6ZS55IDwgZml4ZWRfaGVpZ2h0X3B4KXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ193aWR0aF9weCAgPSBzaXplLnggLSBmaXhlZF93aWR0aF9weDtcclxuICAgICAgICBjb25zdCByZW1haW5pbmdfaGVpZ2h0X3B4ID0gc2l6ZS55IC0gZml4ZWRfaGVpZ2h0X3B4O1xyXG5cclxuICAgICAgICB0aGlzLmNvbFdpZHRocyAgPSBHcmlkLmNhbGNTaXplcyh0aGlzLmNvbERlc2NzLCB0aGlzLm1pbldpZHRocyAsIHJlbWFpbmluZ193aWR0aF9weCk7XHJcbiAgICAgICAgdGhpcy5yb3dIZWlnaHRzID0gR3JpZC5jYWxjU2l6ZXModGhpcy5yb3dEZXNjcywgdGhpcy5taW5IZWlnaHRzLCByZW1haW5pbmdfaGVpZ2h0X3B4KTtcclxuXHJcbiAgICAgICAgbGV0IHlfb2Zmc2V0ID0gMDtcclxuICAgICAgICBmb3IoY29uc3QgW3Jvd19pZHgsIHJvd10gb2YgdGhpcy5jZWxscy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgbGV0IHhfb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHVpIG9mIHJvdyl7XHJcbiAgICAgICAgICAgICAgICBsZXQgdWlfd2lkdGhfcHggIDogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgbGV0IHVpX2hlaWdodF9weCA6IG51bWJlcjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih1aS5jb2xzcGFuID09IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgIHVpX3dpZHRoX3B4ID0gdGhpcy5jb2xXaWR0aHNbb2Zmc2V0XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdWlfd2lkdGhfcHggPSBzdW0odGhpcy5jb2xXaWR0aHMuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyB1aS5jb2xzcGFuKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodWkud2lkdGggIT0gdW5kZWZpbmVkICYmIHVpLndpZHRoLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdWlfd2lkdGhfcHggKj0gcmF0aW8odWkud2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHVpLnJvd3NwYW4gPT0gMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdWlfaGVpZ2h0X3B4ID0gdGhpcy5yb3dIZWlnaHRzW3Jvd19pZHhdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB1aV9oZWlnaHRfcHggPSBzdW0odGhpcy5yb3dIZWlnaHRzLnNsaWNlKHJvd19pZHgsIHJvd19pZHggKyB1aS5yb3dzcGFuKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodWkuaGVpZ2h0ICE9IHVuZGVmaW5lZCAmJiB1aS5oZWlnaHQuZW5kc1dpdGgoXCIlXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICB1aV9oZWlnaHRfcHggKj0gcmF0aW8odWkuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB1aV9zaXplID0gbmV3IFZlYzIodWlfd2lkdGhfcHgsIHVpX2hlaWdodF9weCk7XHJcbiAgICAgICAgICAgICAgICB1aS5sYXlvdXQoeCArIHhfb2Zmc2V0LCB5ICsgeV9vZmZzZXQsIHVpX3NpemUsIG5lc3QgKyAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICB4X29mZnNldCArPSBzdW0odGhpcy5jb2xXaWR0aHMuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyB1aS5jb2xzcGFuKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHVpLmNvbHNwYW47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHlfb2Zmc2V0ICs9IHRoaXMucm93SGVpZ2h0c1tyb3dfaWR4XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSAgXHJcblxyXG5cclxuICAgIHVwZGF0ZVJvb3RMYXlvdXQoKXtcclxuICAgICAgICB0aGlzLmdldEFsbFVJKCkuZm9yRWFjaCh4ID0+IHguc2V0TWluU2l6ZSgpKTtcclxuICAgICAgICBsZXQgc2l6ZSA9IFZlYzIuemVybygpO1xyXG5cclxuICAgICAgICBsZXQgeCA6IG51bWJlcjtcclxuICAgICAgICBsZXQgeSA6IG51bWJlcjtcclxuXHJcbiAgICAgICAgaWYodGhpcy5jb2xEZXNjcy5zb21lKHggPT4geC5lbmRzV2l0aChcIiVcIikpKXtcclxuXHJcbiAgICAgICAgICAgIHNpemUueCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgICAgICB4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIHNpemUueCA9IHRoaXMubWluU2l6ZSEueDtcclxuICAgICAgICAgICAgeCA9IE1hdGgubWF4KDAsIDAuNSAqICh3aW5kb3cuaW5uZXJXaWR0aCAgLSBzaXplLngpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMucm93RGVzY3Muc29tZSh4ID0+IHguZW5kc1dpdGgoXCIlXCIpKSl7XHJcblxyXG4gICAgICAgICAgICBzaXplLnkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgICAgIHkgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgc2l6ZS55ID0gdGhpcy5taW5TaXplIS55O1xyXG4gICAgICAgICAgICB5ID0gTWF0aC5tYXgoMCwgMC41ICogKHdpbmRvdy5pbm5lckhlaWdodCAtIHNpemUueSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sYXlvdXQoeCwgeSwgc2l6ZSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIHN1cGVyLmRyYXcoKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuKCkuZm9yRWFjaCh4ID0+IHguZHJhdygpKTtcclxuICAgIH1cclxuXHJcbiAgICBzdHIoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgY29sX2Rlc2NzID0gdGhpcy5jb2xEZXNjcy5qb2luKFwiIFwiKTtcclxuICAgICAgICBjb25zdCByb3dfZGVzY3MgPSB0aGlzLnJvd0Rlc2NzLmpvaW4oXCIgXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBtaW5fd3MgPSB0aGlzLm1pbldpZHRocy5tYXAoeCA9PiBgJHt4fWApLmpvaW4oXCIgXCIpO1xyXG4gICAgICAgIGNvbnN0IG1pbl9ocyA9IHRoaXMubWluSGVpZ2h0cy5tYXAoeCA9PiBgJHt4fWApLmpvaW4oXCIgXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBjb2xfd3MgPSB0aGlzLmNvbFdpZHRocy5tYXAoeCA9PiBgJHt4fWApLmpvaW4oXCIgXCIpO1xyXG4gICAgICAgIGNvbnN0IHJvd19ocyA9IHRoaXMucm93SGVpZ2h0cy5tYXAoeCA9PiBgJHt4fWApLmpvaW4oXCIgXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gYCR7c3VwZXIuc3RyKCl9IGNvbDoke2NvbF9kZXNjc30gcm93OiR7cm93X2Rlc2NzfSBtaW4td3M6JHttaW5fd3N9IG1pbi1oczoke21pbl9oc30gY29sLXdzOiR7Y29sX3dzfSByb3ctaHM6JHtyb3dfaHN9YDtcclxuICAgIH1cclxuXHJcbiAgICBkdW1wKG5lc3QgOiBudW1iZXIpe1xyXG4gICAgICAgIHN1cGVyLmR1bXAobmVzdCk7XHJcbiAgICAgICAgZm9yKGNvbnN0IHJvdyBvZiB0aGlzLmNlbGxzKXtcclxuICAgICAgICAgICAgcm93LmZvckVhY2godWkgPT4gdWkuZHVtcChuZXN0ICsgMSkpO1xyXG5cclxuICAgICAgICAgICAgbXNnKFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRsYWJlbChkYXRhIDogVGV4dEF0dHIpIDogTGFiZWwge1xyXG4gICAgcmV0dXJuIG5ldyBMYWJlbChkYXRhKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRidXR0b24oZGF0YSA6IEJ1dHRvbkF0dHIpIDogQnV0dG9uIHtcclxuICAgIHJldHVybiBuZXcgQnV0dG9uKGRhdGEpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGZpbGxlcihkYXRhIDogQXR0cikgOiBGaWxsZXIge1xyXG4gICAgcmV0dXJuIG5ldyBGaWxsZXIoZGF0YSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkZ3JpZChkYXRhIDogR3JpZEF0dHIpIDogR3JpZCB7ICAgIFxyXG4gICAgcmV0dXJuIG5ldyBHcmlkKGRhdGEpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGhsaXN0KGRhdGEgOiBBdHRyICYgeyByb3dzPyA6IHN0cmluZywgY29sdW1uPzogc3RyaW5nLCBjaGlsZHJlbiA6IFVJW10gfSl7XHJcbiAgICBjb25zdCBncmlkX2RhdGEgPSBkYXRhIGFzIGFueSBhcyBHcmlkQXR0cjtcclxuXHJcbiAgICBncmlkX2RhdGEuY29sdW1ucyA9IGRhdGEuY29sdW1uO1xyXG4gICAgZ3JpZF9kYXRhLmNlbGxzICAgPSBbIGRhdGEuY2hpbGRyZW4gXTtcclxuXHJcbiAgICBkZWxldGUgKGRhdGEgYXMgYW55KS5jaGlsZHJlbjtcclxuICAgIGRlbGV0ZSAoZGF0YSBhcyBhbnkpLmNvbHVtbjtcclxuXHJcbiAgICByZXR1cm4gJGdyaWQoZ3JpZF9kYXRhKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICR2bGlzdChkYXRhIDogQXR0ciAmIHsgcm93cz8gOiBzdHJpbmcsIGNvbHVtbj86IHN0cmluZywgY2hpbGRyZW4gOiBVSVtdIH0pe1xyXG4gICAgY29uc3QgZ3JpZF9kYXRhID0gZGF0YSBhcyBhbnkgYXMgR3JpZEF0dHI7XHJcblxyXG4gICAgZ3JpZF9kYXRhLmNvbHVtbnMgPSBkYXRhLmNvbHVtbjtcclxuICAgIGdyaWRfZGF0YS5jZWxscyAgID0gZGF0YS5jaGlsZHJlbi5tYXAoeCA9PiBbeF0pO1xyXG5cclxuICAgIGRlbGV0ZSAoZGF0YSBhcyBhbnkpLmNoaWxkcmVuO1xyXG4gICAgZGVsZXRlIChkYXRhIGFzIGFueSkuY29sdW1uO1xyXG5cclxuICAgIHJldHVybiAkZ3JpZChncmlkX2RhdGEpO1xyXG59XHJcblxyXG59IiwiLy8vPHJlZmVyZW5jZSBwYXRoPVwiZXhwb3J0LnRzXCIgLz5cclxuLy8vPHJlZmVyZW5jZSBwYXRoPVwidWkudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIGRpYWdyYW1fdHMge1xyXG4vL1xyXG5leHBvcnQgY29uc3Qgbm90Y2hSYWRpdXMgPSAxMDsgICAgICAgIFxyXG5cclxuZXhwb3J0IGNvbnN0IG5lc3RfaDEgPSAzNTtcclxuZXhwb3J0IGNvbnN0IG5lc3RfaDIgPSAzMDtcclxuZXhwb3J0IGNvbnN0IG5lc3RfaDMgPSAzNTtcclxuZXhwb3J0IGNvbnN0IG5lc3RfaDEyMyA9IG5lc3RfaDEgKyBuZXN0X2gyICsgbmVzdF9oMztcclxuXHJcbmV4cG9ydCBjb25zdCBibG9ja0xpbmVXaWR0aCA9IDI7XHJcbmNvbnN0IGJsb2NrTGluZUNvbG9yID0gXCJicm93blwiO1xyXG5jb25zdCBuZWFyUG9ydERpc3RhbmNlID0gMTA7XHJcblxyXG5jb25zdCByYW5nZVdpZHRoICA9IDE1MDtcclxuY29uc3QgbnVtYmVyV2lkdGggPSA0NTtcclxuXHJcbmV4cG9ydCBsZXQgY2FtZXJhSWNvbiA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcbmV4cG9ydCBsZXQgbW90b3JJY29uICA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcbmV4cG9ydCBsZXQgY2FtZXJhSW1nIDogSFRNTEltYWdlRWxlbWVudDtcclxuZXhwb3J0IGxldCBkaXN0YW5jZVNlbnNvckljb24gOiBIVE1MSW1hZ2VFbGVtZW50O1xyXG5leHBvcnQgbGV0IHR0c0ljb24gOiBIVE1MSW1hZ2VFbGVtZW50O1xyXG5leHBvcnQgbGV0IHNsZWVwSWNvbiA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcblxyXG5leHBvcnQgbGV0IHR0c0F1ZGlvICA6IEhUTUxBdWRpb0VsZW1lbnQ7XHJcblxyXG5leHBvcnQgZW51bSBQb3J0VHlwZSB7XHJcbiAgICB1bmtub3duLFxyXG4gICAgYm90dG9tLFxyXG4gICAgdG9wLFxyXG5cclxuICAgIGlucHV0UG9ydCxcclxuICAgIG91dHB1dFBvcnQsXHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCbG9jayBleHRlbmRzIFVJIHtcclxuICAgIHBvcnRzIDogUG9ydFtdID0gW107XHJcbiAgICBvdXRsaW5lQ29sb3IgOiBzdHJpbmcgPSBcImdyZWVuXCI7XHJcbiAgICBub3RjaEJvdHRvbSA6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgbm90Y2hSaWdodCAgOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIGluVG9vbGJveCAgIDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICBpZih0aGlzLmJhY2tncm91bmRDb2xvciA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IFwiY29ybnNpbGtcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYWRkaW5nID0gWzUsIDUsIDUsIDVdO1xyXG5cclxuICAgICAgICBpZihkYXRhLmluVG9vbGJveCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmluVG9vbGJveCA9IGRhdGEuaW5Ub29sYm94O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb3B5KCkgOiBCbG9jayB7XHJcbiAgICAgICAgY29uc3QgYmxvY2sgPSBtYWtlQmxvY2tCeVR5cGVOYW1lKHRoaXMuY29uc3RydWN0b3IubmFtZSk7XHJcblxyXG4gICAgICAgIGJsb2NrLnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgYmxvY2suY3R4ICAgICAgPSB0aGlzLmN0eDtcclxuXHJcbiAgICAgICAgYmxvY2suc2V0TWluU2l6ZSgpO1xyXG4gICAgICAgIGJsb2NrLmJveFNpemUgPSBibG9jay5taW5TaXplIS5jb3B5KCk7XHJcblxyXG4gICAgICAgIHJldHVybiBibG9jaztcclxuICAgIH1cclxuXHJcbiAgICBtYWtlT2JqKCkgOiBhbnl7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWR4OiB0aGlzLmlkeCxcclxuICAgICAgICAgICAgdHlwZU5hbWU6IHRoaXMuY29uc3RydWN0b3IubmFtZSxcclxuICAgICAgICAgICAgeCA6IHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgeSA6IHRoaXMucG9zaXRpb24ueSxcclxuICAgICAgICAgICAgcG9ydHMgOiB0aGlzLnBvcnRzLm1hcCh4ID0+IHgubWFrZU9iaigpKVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZE9iaihvYmogOiBhbnkgKXsgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGFic3RyYWN0IHNldE1pblNpemUoKSA6IHZvaWQ7XHJcblxyXG4gICAgY2FsY0hlaWdodCgpIDogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taW5TaXplIS55O1xyXG4gICAgfVxyXG5cclxuICAgIG5leHRCbG9jaygpIDogQmxvY2sgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCBib3R0b21fcG9ydCA6IFBvcnQgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIElmQmxvY2spe1xyXG4gICAgICAgICAgICBib3R0b21fcG9ydCA9IHRoaXMuYm90dG9tUG9ydDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0aGlzIGluc3RhbmNlb2YgSW5maW5pdGVMb29wKXsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgYm90dG9tX3BvcnQgPSB0aGlzLnBvcnRzLmZpbmQoeCA9PiB4LnR5cGUgPT0gUG9ydFR5cGUuYm90dG9tKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoYm90dG9tX3BvcnQgIT0gdW5kZWZpbmVkICYmIGJvdHRvbV9wb3J0LmRlc3RpbmF0aW9ucy5sZW5ndGggIT0gMCl7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlc3RfcG9ydCA9IGJvdHRvbV9wb3J0LmRlc3RpbmF0aW9uc1swXTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlc3RfcG9ydC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlzUHJvY2VkdXJlKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIE5lc3RCbG9jayB8fCB0aGlzIGluc3RhbmNlb2YgVFRTQmxvY2sgfHwgdGhpcyBpbnN0YW5jZW9mIFNsZWVwQmxvY2s7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UG9ydEZyb21Qb3NpdGlvbihwb3MgOiBWZWMyKSA6IFBvcnQgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBvcnRzLmZpbmQoeCA9PiB4LmlzTmVhcihwb3MpKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRGlmZihkaWZmIDogVmVjMikgOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBuZXdfcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uLmFkZChkaWZmKTtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKG5ld19wb3NpdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgb3V0cHV0UG9ydHMoKSA6IFBvcnRbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucG9ydHMuZmlsdGVyKHggPT4geC50eXBlID09IFBvcnRUeXBlLm91dHB1dFBvcnQpO1xyXG4gICAgfVxyXG5cclxuICAgIG5leHREYXRhZmxvd0Jsb2NrcygpIDogQmxvY2tbXSB7XHJcbiAgICAgICAgY29uc3QgYmxvY2tzIDogQmxvY2tbXSA9IFtdO1xyXG5cclxuICAgICAgICBjb25zdCBvdXRwdXRfcG9ydHMgPSB0aGlzLm91dHB1dFBvcnRzKCk7XHJcbiAgICAgICAgZm9yKGNvbnN0IHBvcnQgb2Ygb3V0cHV0X3BvcnRzKXtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IGRzdCBvZiBwb3J0LmRlc3RpbmF0aW9ucyl7XHJcbiAgICAgICAgICAgICAgICBibG9ja3MucHVzaChkc3QucGFyZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGJsb2NrcztcclxuICAgIH1cclxuXHJcbiAgICBwcm9wZXJnYXRlQ2FsYygpe1xyXG4gICAgICAgIGNvbnN0IG5leHRfZGF0YWZsb3dfYmxvY2tzID0gdGhpcy5uZXh0RGF0YWZsb3dCbG9ja3MoKTtcclxuICAgICAgICBuZXh0X2RhdGFmbG93X2Jsb2Nrcy5mb3JFYWNoKHggPT4geC5jYWxjKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3RCbG9jayhwb3J0cyA6IFBvcnRbXSl7XHJcbiAgICAgICAgbGV0IFtwb3J0MSwgcG9ydDJdID0gcG9ydHM7XHJcbiAgICAgICAgYXNzZXJ0KHBvcnQxLnBhcmVudCA9PSB0aGlzKTtcclxuXHJcbiAgICAgICAgaWYocG9ydDEudHlwZSA9PSBQb3J0VHlwZS5ib3R0b20pe1xyXG4gICAgICAgICAgICBhc3NlcnQocG9ydDIudHlwZSA9PSBQb3J0VHlwZS50b3ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHBvcnQxLnR5cGUgPT0gUG9ydFR5cGUudG9wKXtcclxuICAgICAgICAgICAgYXNzZXJ0KHBvcnQyLnR5cGUgPT0gUG9ydFR5cGUuYm90dG9tKTtcclxuICAgICAgICAgICAgW3BvcnQxLCBwb3J0Ml0gPSBbcG9ydDIsIHBvcnQxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwb3J0MS5jb25uZWN0KHBvcnQyKTtcclxuXHJcbiAgICAgICAgbXNnKGBjb25uZWN0IGJsb2NrYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd05vdGNoKGN4IDogbnVtYmVyLCBjeSA6IG51bWJlciwgdHlwZSA6IFBvcnRUeXBlKXtcclxuICAgICAgICBzd2l0Y2godHlwZSl7XHJcbiAgICAgICAgY2FzZSBQb3J0VHlwZS5ib3R0b206XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhjeCwgY3ksIG5vdGNoUmFkaXVzLCBNYXRoLlBJLCAwLCB0cnVlKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBQb3J0VHlwZS50b3A6XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhjeCwgY3ksIG5vdGNoUmFkaXVzLCAwLCBNYXRoLlBJLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkcmF3T3V0bGluZShwb2ludHMgOiBbbnVtYmVyLCBudW1iZXIsIG51bGx8UG9ydF1bXSl7XHJcbiAgICAgICAgY29uc3QgY2FudmFzID0gQ2FudmFzLm9uZTtcclxuICAgICAgICBpZihjYW52YXMuZHJhZ2dlZFVJID09IHRoaXMpe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAwLjU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoY2FudmFzLm5lYXJQb3J0cy5sZW5ndGggIT0gMCAmJiBjYW52YXMubmVhclBvcnRzWzFdLnBhcmVudCA9PSB0aGlzKXtcclxuICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAwLjU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmJhY2tncm91bmRDb2xvciE7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gYmxvY2tMaW5lQ29sb3I7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoICAgPSBibG9ja0xpbmVXaWR0aDtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBbaWR4LCBbeCwgeSwgcG9ydF1dIG9mIHBvaW50cy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBpZihpZHggPT0gMCl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHgsIHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBpZihwb3J0ID09IG51bGwpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oeCwgeSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd05vdGNoKHgsIHksIHBvcnQudHlwZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcnRfcG9zID0gcG9ydC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBwb3J0X3Bvcy54ID0geDtcclxuICAgICAgICAgICAgICAgICAgICBwb3J0X3Bvcy55ID0geTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICBpZih0aGlzLmN0eC5nbG9iYWxBbHBoYSAhPSAxLjApe1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDEuMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0lPUG9ydHMoeDEgOiBudW1iZXIsIHgyIDogbnVtYmVyLCB5MSA6IG51bWJlciwgeTIgOiBudW1iZXIpe1xyXG4gICAgICAgIGNvbnN0IGlucHV0X3BvcnRzICA9IHRoaXMucG9ydHMuZmlsdGVyKHggPT4geC50eXBlID09IFBvcnRUeXBlLmlucHV0UG9ydCk7XHJcbiAgICAgICAgY29uc3Qgb3V0cHV0X3BvcnRzID0gdGhpcy5wb3J0cy5maWx0ZXIoeCA9PiB4LnR5cGUgPT0gUG9ydFR5cGUub3V0cHV0UG9ydCk7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBwb3J0cyBvZiBbIGlucHV0X3BvcnRzLCBvdXRwdXRfcG9ydHNdKXtcclxuICAgICAgICAgICAgY29uc3QgeSA9IChwb3J0cyA9PSBpbnB1dF9wb3J0cyA/IHkxICsgbm90Y2hSYWRpdXM6IHkyIC0gbm90Y2hSYWRpdXMpO1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgW2ksIHBvcnRdIG9mIHBvcnRzLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwID0gKGkgKyAxKSAvIChwb3J0cy5sZW5ndGggKyAxKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSB4MSAqICgxIC0gcCkgKyB4MiAqIHA7XHJcbiAgICAgICAgICAgICAgICBwb3J0LmRyYXdQb3J0KHRoaXMuY3R4LCB4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkcmF3SWNvbihpbWcgOiBIVE1MSW1hZ2VFbGVtZW50KXtcclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB4MiwgeTJdID0gdGhpcy5nZXRDb3JuZXJQb3NpdGlvbigpO1xyXG5cclxuXHJcbiAgICAgICAgY29uc3QgaW1nX2hlaWdodCA9ICh5MiAtIHkxKSAtIDY7XHJcbiAgICAgICAgY29uc3QgaW1nX3dpZHRoICA9IGltZ19oZWlnaHQgKiBpbWcud2lkdGggLyBpbWcuaGVpZ2h0O1xyXG5cclxuICAgICAgICBjb25zdCBpbWdfeCA9IHgyIC0gaW1nX3dpZHRoIC0gNTtcclxuICAgICAgICBjb25zdCBpbWdfeSA9IHkxICsgMztcclxuXHJcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGltZywgaW1nX3gsIGltZ195LCBpbWdfd2lkdGgsIGltZ19oZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvcm5lclBvc2l0aW9uKCkgOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgY29uc3QgW3Bvcywgc2l6ZV0gPSB0aGlzLmRyYXdCb3goKTtcclxuICAgICAgICBjb25zdCB4MSA9IHBvcy54ICsgdGhpcy5ib3JkZXJXaWR0aCArIGJsb2NrTGluZVdpZHRoO1xyXG4gICAgICAgIGNvbnN0IHkxID0gcG9zLnkgKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcblxyXG4gICAgICAgIGNvbnN0IHgyID0geDEgKyB0aGlzLm1pblNpemUhLng7XHJcbiAgICAgICAgY29uc3QgeTIgPSB5MSArIHRoaXMubWluU2l6ZSEueTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFt4MSwgeTEsIHgyLCB5Ml07XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0RhdGFmbG93QmxvY2soKXtcclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB4MiwgeTJdID0gdGhpcy5nZXRDb3JuZXJQb3NpdGlvbigpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5kcmF3T3V0bGluZShbXHJcbiAgICAgICAgICAgIFt4MSwgeTEsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDEsIHkyLCBudWxsXSxcclxuICAgICAgICAgICAgW3gyLCB5MiwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTEsIG51bGxdLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdJT1BvcnRzKHgxLCB4MiwgeTEsIHkyKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3QWN0aW9uQmxvY2soKXtcclxuICAgICAgICBjb25zdCBbcG9zLCBzaXplXSA9IHRoaXMuZHJhd0JveCgpO1xyXG4gICAgICAgIGNvbnN0IHgxID0gcG9zLnggKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcbiAgICAgICAgY29uc3QgeTEgPSBwb3MueSArIHRoaXMuYm9yZGVyV2lkdGggKyBibG9ja0xpbmVXaWR0aDtcclxuXHJcbiAgICAgICAgY29uc3QgeDIgPSB4MSArIDM1O1xyXG4gICAgICAgIGNvbnN0IHgzID0geDEgKyB0aGlzLm1pblNpemUhLng7XHJcblxyXG4gICAgICAgIGNvbnN0IHkyID0geTEgKyB0aGlzLm1pblNpemUhLnkgLSBub3RjaFJhZGl1cztcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3T3V0bGluZShbXHJcbiAgICAgICAgICAgIFt4MSwgeTEsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3gxLCB5MiwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTIsIHRoaXMucG9ydHNbMV1dLFxyXG4gICAgICAgICAgICBbeDMsIHkyLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIFt4MywgeTEsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDIsIHkxLCB0aGlzLnBvcnRzWzBdXVxyXG4gICAgICAgIF0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbkNvbm5lY3ROZWFyUG9ydFBhaXIoYmxvY2sgOiBCbG9jaykgOiBQb3J0W10ge1xyXG4gICAgICAgIGZvcihjb25zdCBwb3J0MSBvZiB0aGlzLnBvcnRzKXtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHBvcnQyIG9mIGJsb2NrLnBvcnRzKXtcclxuICAgICAgICAgICAgICAgIGlmKHBvcnQxLmNhbkNvbm5lY3QocG9ydDIpICYmIHBvcnQxLnBvc2l0aW9uLmRpc3RhbmNlKHBvcnQyLnBvc2l0aW9uKSA8PSBuZWFyUG9ydERpc3RhbmNlKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3BvcnQxLCBwb3J0Ml07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB2YWx1ZUNoYW5nZWQoKXtcclxuICAgICAgICBtc2coYGNoYW5nZWQgOiAke3RoaXMuY29uc3RydWN0b3IubmFtZX1gKTtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjKCl7XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBydW4oKXtcclxuICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5wdXRCbG9jayBleHRlbmRzIEJsb2NrIHtcclxuICAgIGlucHV0IDogSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmlucHV0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRJbnB1dFBvc2l0aW9uKCkgOiBbbnVtYmVyLCBudW1iZXJde1xyXG4gICAgICAgIGNvbnN0IFt4MSwgeTEsIHgyLCB5Ml0gPSB0aGlzLmdldENvcm5lclBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmlucHV0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBjb25zdCBpbnB1dF94ID0geDEgKyAwLjUgKiAoKHgyIC0geDEpIC0gcmVjdC53aWR0aCk7XHJcbiAgICAgICAgY29uc3QgaW5wdXRfeSA9IHkxICsgMC41ICogKCh5MiAtIHkxKSAtIHJlY3QuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtpbnB1dF94LCBpbnB1dF95XTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQb3NpdGlvbihwb3NpdGlvbiA6IFZlYzIpIDogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuc2V0UG9zaXRpb24ocG9zaXRpb24pO1xyXG5cclxuICAgICAgICBjb25zdCBbeDEsIHkxXSA9IHRoaXMuZ2V0SW5wdXRQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLmxlZnQgPSBgJHt4MX1weGA7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS50b3AgID0gYCR7eTF9cHhgO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIElucHV0UmFuZ2VCbG9jayBleHRlbmRzIElucHV0QmxvY2sge1xyXG4gICAgbWluSW5wdXQgOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgbWF4SW5wdXQgOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC50eXBlID0gXCJyYW5nZVwiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc3R5bGUud2lkdGggPSBgJHtyYW5nZVdpZHRofXB4YDtcclxuICAgICAgICB0aGlzLmlucHV0Lm1pbiA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQubWF4ID0gXCIxMDBcIjtcclxuXHJcbiAgICAgICAgdGhpcy5taW5JbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuICAgICAgICB0aGlzLm1pbklucHV0LnR5cGUgPSBcIm51bWJlclwiO1xyXG4gICAgICAgIHRoaXMubWluSW5wdXQudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLm1pbklucHV0LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG4gICAgICAgIHRoaXMubWluSW5wdXQuc3R5bGUud2lkdGggPSBgJHtudW1iZXJXaWR0aH1weGA7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgdGhpcy5tYXhJbnB1dC50eXBlID0gXCJudW1iZXJcIjtcclxuICAgICAgICB0aGlzLm1heElucHV0LnZhbHVlID0gXCIxMDBcIjtcclxuICAgICAgICB0aGlzLm1heElucHV0LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG4gICAgICAgIHRoaXMubWF4SW5wdXQuc3R5bGUud2lkdGggPSBgJHtudW1iZXJXaWR0aH1weGA7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5taW5JbnB1dCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm1heElucHV0KTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgYXN5bmMgKGV2IDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KHRoaXMuaW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICBmb3IoY29uc3Qgc3JjIG9mIHRoaXMucG9ydHMpe1xyXG4gICAgICAgICAgICAgICAgc3JjLnNldFBvcnRWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIENhbnZhcy5vbmUucmVxdWVzdFVwZGF0ZUNhbnZhcygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm1pbklucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldiA6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQubWluID0gdGhpcy5taW5JbnB1dC52YWx1ZTtcclxuICAgICAgICAgICAgbXNnKGBtaW4gOiBbJHt0aGlzLmlucHV0Lm1pbn1dYCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGV2IDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5tYXggPSB0aGlzLm1heElucHV0LnZhbHVlO1xyXG4gICAgICAgICAgICBtc2coYG1heCA6IFske3RoaXMuaW5wdXQubWF4fV1gKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUub3V0cHV0UG9ydCkgXTtcclxuICAgIH1cclxuXHJcbiAgICBtYWtlT2JqKCkgOiBhbnkge1xyXG4gICAgICAgIGxldCBvYmogPSBPYmplY3QuYXNzaWduKHN1cGVyLm1ha2VPYmooKSwge1xyXG4gICAgICAgICAgICB2YWx1ZSA6IHRoaXMuaW5wdXQudmFsdWUsXHJcbiAgICAgICAgICAgIG1pbiAgIDogdGhpcy5taW5JbnB1dC52YWx1ZSxcclxuICAgICAgICAgICAgbWF4ICAgOiB0aGlzLm1heElucHV0LnZhbHVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZE9iaihvYmogOiBhbnkgKXsgICAgICAgIFxyXG4gICAgICAgIHN1cGVyLmxvYWRPYmoob2JqKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSAgICA9IGAke29iai52YWx1ZX1gO1xyXG4gICAgICAgIHRoaXMubWluSW5wdXQudmFsdWUgPSBgJHtvYmoubWlufWA7XHJcbiAgICAgICAgdGhpcy5tYXhJbnB1dC52YWx1ZSA9IGAke29iai5tYXh9YDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigyMDAsIDUwKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQb3NpdGlvbihwb3NpdGlvbiA6IFZlYzIpIDogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuc2V0UG9zaXRpb24ocG9zaXRpb24pO1xyXG5cclxuICAgICAgICBjb25zdCBbcG9zLCBzaXplXSA9IHRoaXMuZHJhd0JveCgpO1xyXG5cclxuICAgICAgICBjb25zdCByYzEgPSB0aGlzLmlucHV0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGNvbnN0IHJjMiA9IHRoaXMubWluSW5wdXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHgxID0gcG9zLnggKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGggKyAyICogUG9ydC5yYWRpdXM7XHJcbiAgICAgICAgY29uc3QgeTEgPSBwb3MueSArIDAuNSAqIChzaXplLnkgLSAocmMxLmhlaWdodCArIHJjMi5oZWlnaHQpKTtcclxuICAgICAgICBjb25zdCB5MiA9IHkxICsgcmMxLmhlaWdodDtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS5sZWZ0ID0gYCR7eDF9cHhgO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc3R5bGUudG9wICA9IGAke3kxfXB4YDtcclxuXHJcbiAgICAgICAgdGhpcy5taW5JbnB1dC5zdHlsZS5sZWZ0ID0gYCR7eDF9cHhgO1xyXG4gICAgICAgIHRoaXMubWluSW5wdXQuc3R5bGUudG9wICA9IGAke3kyfXB4YDtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhJbnB1dC5zdHlsZS5sZWZ0ID0gYCR7eDEgKyByYzEud2lkdGggLSByYzIud2lkdGh9cHhgO1xyXG4gICAgICAgIHRoaXMubWF4SW5wdXQuc3R5bGUudG9wICA9IGAke3kyfXB4YDtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgdGhpcy5kcmF3RGF0YWZsb3dCbG9jaygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFNlcnZvTW90b3JCbG9jayBleHRlbmRzIElucHV0QmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnR5cGUgPSBcIm51bWJlclwiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc3R5bGUud2lkdGggPSBcIjQ1cHhcIjtcclxuICAgICAgICB0aGlzLmlucHV0LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5taW4gICA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQubWF4ICAgPSBcIjE1XCI7XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldiA6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIG1zZyhgY2hhbmdlIDogWyR7dGhpcy5pbnB1dC52YWx1ZX1dYCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmlucHV0UG9ydCkgXTtcclxuICAgIH1cclxuXHJcbiAgICBtYWtlT2JqKCkgOiBhbnkge1xyXG4gICAgICAgIGxldCBvYmogPSBPYmplY3QuYXNzaWduKHN1cGVyLm1ha2VPYmooKSwge1xyXG4gICAgICAgICAgICBjaGFubmVsIDogcGFyc2VJbnQodGhpcy5pbnB1dC52YWx1ZSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkT2JqKG9iaiA6IGFueSApeyAgICAgICAgXHJcbiAgICAgICAgc3VwZXIubG9hZE9iaihvYmopO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSBgJHtvYmouY2hhbm5lbH1gO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDIwMCwgNTApO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFBvc2l0aW9uKHBvc2l0aW9uIDogVmVjMikgOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5zZXRQb3NpdGlvbihwb3NpdGlvbik7XHJcblxyXG4gICAgICAgIGNvbnN0IFt4MSwgeTEsIHgyLCB5Ml0gPSB0aGlzLmdldENvcm5lclBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmlucHV0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBjb25zdCBpbnB1dF94ID0geDEgKyAxMDtcclxuICAgICAgICBjb25zdCBpbnB1dF95ID0geTEgKyAwLjUgKiAoKHkyIC0geTEpIC0gcmVjdC5oZWlnaHQpO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLmxlZnQgPSBgJHtpbnB1dF94fXB4YDtcclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLnRvcCAgPSBgJHtpbnB1dF95fXB4YDtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZHJhd0RhdGFmbG93QmxvY2soKTtcclxuICAgICAgICB0aGlzLmRyYXdJY29uKG1vdG9ySWNvbik7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgdmFsdWVDaGFuZ2VkKCl7XHJcbiAgICAgICAgY29uc3QgY2hhbm5lbCA9IHBhcnNlSW50KHRoaXMuaW5wdXQudmFsdWUpO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlICAgPSB0aGlzLnBvcnRzWzBdLnZhbHVlO1xyXG4gICAgICAgIG1zZyhgbW90b3IgY2hhbmdlZCA6IGNoOiR7Y2hhbm5lbH0gdmFsdWU6WyR7dmFsdWV9XWApO1xyXG4gICAgICAgIGlmKHR5cGVvZiB2YWx1ZSAhPSBcIm51bWJlclwiKXtcclxuICAgICAgICAgICAgbXNnKGBpbGxlZ2FsIG1vdG9yIHZhbHVlOiR7dmFsdWV9YCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGF3YWl0IHNlbmREYXRhKHtcclxuICAgICAgICAgICAgY29tbWFuZCA6IFwic2Vydm9cIixcclxuICAgICAgICAgICAgY2hhbm5lbCA6IGNoYW5uZWwsXHJcbiAgICAgICAgICAgIHZhbHVlICAgOiB2YWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBjYWxjKCl7XHJcbiAgICAgICAgbXNnKGBtb3RvciBjYWxjOiR7dGhpcy5wb3J0c1swXS52YWx1ZX1gKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcblxyXG5hYnN0cmFjdCBjbGFzcyBJbnB1dFRleHRCbG9jayBleHRlbmRzIElucHV0QmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudHlwZSA9IFwidGV4dFwiO1xyXG4gICAgfVxyXG5cclxuICAgIG1ha2VPYmooKSA6IGFueSB7XHJcbiAgICAgICAgbGV0IG9iaiA9IE9iamVjdC5hc3NpZ24oc3VwZXIubWFrZU9iaigpLCB7XHJcbiAgICAgICAgICAgIHRleHQgOiB0aGlzLmlucHV0LnZhbHVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZE9iaihvYmogOiBhbnkgKXsgICAgICAgIFxyXG4gICAgICAgIHN1cGVyLmxvYWRPYmoob2JqKTtcclxuICAgICAgICB0aGlzLmlucHV0LnZhbHVlID0gb2JqLnRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDIwMCwgMjAgKyAyICogMiAqIG5vdGNoUmFkaXVzKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgdGhpcy5kcmF3RGF0YWZsb3dCbG9jaygpO1xyXG4gICAgfVxyXG5cclxuICAgIG1ha2VJbnB1dFZhbHVlTWFwKCkgOiBNYXA8c3RyaW5nLCBudW1iZXI+IHtcclxuICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xyXG4gICAgICAgIGZvcihjb25zdCBwb3J0IG9mIHRoaXMucG9ydHMpe1xyXG4gICAgICAgICAgICBpZihwb3J0LnR5cGUgPT0gUG9ydFR5cGUuaW5wdXRQb3J0KXtcclxuICAgICAgICAgICAgICAgIGFzc2VydChwb3J0Lm5hbWUgIT0gXCJcIiAmJiB0eXBlb2YgcG9ydC52YWx1ZSA9PT0gJ251bWJlcicgJiYgISBpc05hTihwb3J0LnZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICBtYXAuc2V0KHBvcnQubmFtZSwgcG9ydC52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBtYXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXRWYWx1ZUJsb2NrIGV4dGVuZHMgSW5wdXRUZXh0QmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLndpZHRoID0gXCI0NXB4XCI7XHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGV2IDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgbXNnKGBjaGFuZ2UgOiBbJHt0aGlzLmlucHV0LnZhbHVlfV1gKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLnRvcCksXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLm91dHB1dFBvcnQpLFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5ib3R0b20pLFxyXG4gICAgICAgIF07XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMjAwLCA1MCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIGNvbnN0IFtwb3MsIHNpemVdID0gdGhpcy5kcmF3Qm94KCk7XHJcbiAgICAgICAgY29uc3QgeDEgPSBwb3MueCArIHRoaXMuYm9yZGVyV2lkdGggKyBibG9ja0xpbmVXaWR0aDtcclxuXHJcbiAgICAgICAgY29uc3QgeDIgPSB4MSArIDM1O1xyXG4gICAgICAgIGNvbnN0IHgzID0geDEgKyB0aGlzLm1pblNpemUhLng7XHJcblxyXG4gICAgICAgIGNvbnN0IHkxID0gcG9zLnkgKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcbiAgICAgICAgY29uc3QgeTIgPSB5MSArIHRoaXMubWluU2l6ZSEueSAtIG5vdGNoUmFkaXVzO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdPdXRsaW5lKFtcclxuICAgICAgICAgICAgW3gxLCB5MSwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICBbeDEsIHkyLCBudWxsXSxcclxuICAgICAgICAgICAgW3gyLCB5MiwgdGhpcy5wb3J0c1syXV0sXHJcbiAgICAgICAgICAgIFt4MywgeTIsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3gzLCB5MSwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTEsIHRoaXMucG9ydHNbMF1dXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3SU9Qb3J0cyh4MSwgeDMsIHkxLCB5Mik7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQ2FtZXJhQmxvY2sgZXh0ZW5kcyBCbG9jayB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUub3V0cHV0UG9ydCkgXTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgaWYodGhpcy5pblRvb2xib3gpe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMzIwLCA1MCArIDIgKiBub3RjaFJhZGl1cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigzMjAsIDI0MCArIDIgKiBub3RjaFJhZGl1cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgdGhpcy5kcmF3RGF0YWZsb3dCbG9jaygpO1xyXG5cclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB4MiwgeTJdID0gdGhpcy5nZXRDb3JuZXJQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICBsZXQgaW1nIDogSFRNTEltYWdlRWxlbWVudDtcclxuXHJcbiAgICAgICAgaWYodGhpcy5pblRvb2xib3gpe1xyXG5cclxuICAgICAgICAgICAgaW1nID0gY2FtZXJhSWNvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIGlmKGNhbWVyYUltZyA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGltZyA9IGNhbWVyYUltZztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgaW1nX2hlaWdodCA9ICh5MiAtIHkxKSAtIDIgKiBub3RjaFJhZGl1cztcclxuICAgICAgICBjb25zdCBpbWdfd2lkdGggID0gaW1nX2hlaWdodCAqIGltZy53aWR0aCAvIGltZy5oZWlnaHQ7XHJcblxyXG4gICAgICAgIGNvbnN0IGltZ194ID0geDEgKyAwLjUgKiAoKHgyIC0geDEpIC0gaW1nX3dpZHRoKTtcclxuICAgICAgICBjb25zdCBpbWdfeSA9IHkxO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoaW1nLCBpbWdfeCwgaW1nX3ksIGltZ193aWR0aCwgaW1nX2hlaWdodCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUVFNCbG9jayBleHRlbmRzIElucHV0VGV4dEJsb2NrIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBcclxuICAgICAgICAgICAgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUudG9wKSwgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmJvdHRvbSkgXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9IFwi44GT44KT44Gr44Gh44GvIeOBqeOBhuOBnuOCiOOCjeOBl+OBjyFcIjtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigzMDAsIDUwKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZHJhd0FjdGlvbkJsb2NrKCk7XHJcbiAgICAgICAgdGhpcy5kcmF3SWNvbih0dHNJY29uKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBydW4oKXtcclxuICAgICAgICBjb25zdCBhdWRpbyA9IHR0c0F1ZGlvO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBtc2coXCJzdGFydCBhdWRpbyBwbGF5XCIpXHJcbiAgICAgICAgICAgIC8vIFN0YXJ0IHBsYXlpbmcgdGhlIGF1ZGlvXHJcbiAgICAgICAgICAgIGF3YWl0IGF1ZGlvLnBsYXkoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIG5ldyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgJ2VuZGVkJyBldmVudCBpcyB0cmlnZ2VyZWRcclxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0sIHsgb25jZTogdHJ1ZSB9KTsgLy8gVXNlIHsgb25jZTogdHJ1ZSB9IHRvIGF1dG9tYXRpY2FsbHkgcmVtb3ZlIHRoZSBsaXN0ZW5lciBhZnRlciBpdCBmaXJlc1xyXG5cclxuICAgICAgICAgICAgICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoXCJwYXVzZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSwgeyBvbmNlOiB0cnVlIH0pOyAvLyBVc2UgeyBvbmNlOiB0cnVlIH0gdG8gYXV0b21hdGljYWxseSByZW1vdmUgdGhlIGxpc3RlbmVyIGFmdGVyIGl0IGZpcmVzXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbXNnKFwiQXVkaW8gcGxheWJhY2sgaGFzIGZpbmlzaGVkLlwiKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAvLyBDYXRjaCBlcnJvcnMgdGhhdCBtaWdodCBvY2N1ciBpZiB0aGUgYnJvd3NlciBibG9ja3MgYXV0b3BsYXlcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1ZGlvIHBsYXliYWNrIGZhaWxlZDpcIiwgZXJyb3IpO1xyXG4gICAgICAgIH0gICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFNsZWVwQmxvY2sgZXh0ZW5kcyBJbnB1dFRleHRCbG9jayB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLnRvcCksIFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5ib3R0b20pIFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSBcIjNcIjtcclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLndpZHRoID0gXCI0NXB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMjAwLCA1MCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRyYXdBY3Rpb25CbG9jaygpO1xyXG4gICAgICAgIHRoaXMuZHJhd0ljb24oc2xlZXBJY29uKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBydW4oKXtcclxuICAgICAgICBjb25zdCBzZWNvbmQgPSBwYXJzZUZsb2F0KHRoaXMuaW5wdXQudmFsdWUudHJpbSgpKTtcclxuICAgICAgICBhd2FpdCBzbGVlcChzZWNvbmQgKiAxMDAwKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2VEZXRlY3Rpb25CbG9jayBleHRlbmRzIEJsb2NrIHtcclxuICAgIGZhY2UgOiBudW1iZXJbXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5pbnB1dFBvcnQpLCBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5vdXRwdXRQb3J0KSwgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUub3V0cHV0UG9ydCkgXTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICBpZih0aGlzLmluVG9vbGJveCl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigxNTAsIDEwICsgMiAqIDIgKiBub3RjaFJhZGl1cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigzMjAsIDI0MCArIDIgKiAyICogbm90Y2hSYWRpdXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRGYWNlKGZhY2UgOiBudW1iZXJbXSl7XHJcbiAgICAgICAgdGhpcy5mYWNlID0gZmFjZS5zbGljZSgpO1xyXG4gICAgICAgIGNvbnN0IFt4LCB5LCB3LCBoXSA9IHRoaXMuZmFjZTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBjeCA9IHggKyB3IC8gMjtcclxuICAgICAgICBjb25zdCBjeSA9IHkgKyBoIC8gMjtcclxuXHJcbiAgICAgICAgdGhpcy5wb3J0c1sxXS5zZXRQb3J0VmFsdWUoY3gpO1xyXG4gICAgICAgIHRoaXMucG9ydHNbMl0uc2V0UG9ydFZhbHVlKGN5KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDYW1lcmEoKSA6IENhbWVyYUJsb2NrIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZih0aGlzLnBvcnRzWzBdLnNvdXJjZXMubGVuZ3RoICE9IDApe1xyXG4gICAgICAgICAgICBjb25zdCBjYW1lcmEgPSB0aGlzLnBvcnRzWzBdLnNvdXJjZXMubWFwKHggPT4geC5wYXJlbnQpLmZpbmQoeCA9PiB4IGluc3RhbmNlb2YgQ2FtZXJhQmxvY2spO1xyXG4gICAgICAgICAgICByZXR1cm4gY2FtZXJhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgdGhpcy5kcmF3RGF0YWZsb3dCbG9jaygpO1xyXG5cclxuICAgICAgICBjb25zdCBjYW1lcmEgPSB0aGlzLmdldENhbWVyYSgpO1xyXG4gICAgICAgIGlmKGNhbWVyYSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBjb25zdCBbeDEsIHkxLCB4MiwgeTJdID0gdGhpcy5nZXRDb3JuZXJQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYoY2FtZXJhSW1nID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgaW1nID0gY2FtZXJhSW1nO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaW1nX2hlaWdodCA9ICh5MiAtIHkxKSAtIDIgKiAyICogbm90Y2hSYWRpdXM7XHJcbiAgICAgICAgICAgIGNvbnN0IGltZ193aWR0aCAgPSBpbWdfaGVpZ2h0ICogaW1nLndpZHRoIC8gaW1nLmhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGltZ194ID0geDEgKyAwLjUgKiAoKHgyIC0geDEpIC0gaW1nX3dpZHRoKTtcclxuICAgICAgICAgICAgY29uc3QgaW1nX3kgPSB5MSArIDIgKiBub3RjaFJhZGl1cztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShpbWcsIGltZ194LCBpbWdfeSwgaW1nX3dpZHRoLCBpbWdfaGVpZ2h0KTtcclxuXHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmZhY2UubGVuZ3RoID09IDQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgc3Ryb2tlIGNvbG9yIHRvIHJlZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAncmVkJztcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIGxpbmUgdGhpY2tuZXNzIHRvIDUgcGl4ZWxzXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSA1O1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IFtmYWNlX3gsIGZhY2VfeSwgZmFjZV93LCBmYWNlX2hdID0gdGhpcy5mYWNlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGN4ID0gaW1nX3ggKyBpbWdfd2lkdGggIC8gMjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN5ID0gaW1nX3kgKyBpbWdfaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbWdfZmFjZV94ID0gY3ggKyBpbWdfd2lkdGggICogZmFjZV94IC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW1nX2ZhY2VfeSA9IGN5ICsgaW1nX2hlaWdodCAqIGZhY2VfeSAvIDEwMDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGltZ19mYWNlX3cgPSBpbWdfd2lkdGggICogZmFjZV93IC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW1nX2ZhY2VfaCA9IGltZ19oZWlnaHQgKiBmYWNlX2ggLyAxMDA7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRHJhdyBhbiBvdXRsaW5lZCByZWN0YW5nbGUgYXQgKDIwMCwgNTApIHdpdGggYSBzaXplIG9mIDEwMHg3NVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlUmVjdChpbWdfZmFjZV94LCBpbWdfZmFjZV95LCBpbWdfZmFjZV93LCBpbWdfZmFjZV9oKTsgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBKb3lTdGlja0Jsb2NrIGV4dGVuZHMgQmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIF07XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMTUwLCA1MCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVbHRyYXNvbmljRGlzdGFuY2VTZW5zb3JCbG9jayBleHRlbmRzIEJsb2NrIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBcclxuICAgICAgICAgICAgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUub3V0cHV0UG9ydCkgXHJcbiAgICAgICAgXTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigzMDAsIDUwKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXREaXN0YW5jZShkaXN0YW5jZSA6IG51bWJlcil7XHJcbiAgICAgICAgdGhpcy5wb3J0c1swXS5zZXRQb3J0VmFsdWUoZGlzdGFuY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kcmF3RGF0YWZsb3dCbG9jaygpO1xyXG4gICAgICAgIHRoaXMuZHJhd0ljb24oZGlzdGFuY2VTZW5zb3JJY29uKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gIGNhbGNUZXJtKG1hcCA6IE1hcDxzdHJpbmcsIG51bWJlcj4sIHRlcm0gOiBUZXJtKSA6IG51bWJlciB7XHJcbiAgICBsZXQgdmFsdWUgOiBudW1iZXI7XHJcblxyXG4gICAgaWYodGVybSBpbnN0YW5jZW9mIFJhdGlvbmFsKXtcclxuICAgICAgICByZXR1cm4gdGVybS5mdmFsKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKHRlcm0gaW5zdGFuY2VvZiBDb25zdE51bSl7XHJcbiAgICAgICAgcmV0dXJuIHRlcm0udmFsdWUuZnZhbCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZih0ZXJtIGluc3RhbmNlb2YgUmVmVmFyKXtcclxuICAgICAgICB2YWx1ZSA9IG1hcC5nZXQodGVybS5uYW1lKSE7XHJcbiAgICAgICAgYXNzZXJ0KHZhbHVlICE9IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZih0ZXJtIGluc3RhbmNlb2YgQXBwKXtcclxuICAgICAgICBjb25zdCBhcHAgPSB0ZXJtO1xyXG4gICAgICAgIGNvbnN0IGFyZ192YWx1ZXMgPSBhcHAuYXJncy5tYXAoeCA9PiBjYWxjVGVybShtYXAsIHgpKTtcclxuICAgICAgICBpZihhcHAuaXNBZGQoKSl7XHJcbiAgICAgICAgICAgIHZhbHVlID0gc3VtKGFyZ192YWx1ZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGFwcC5pc011bCgpKXtcclxuICAgICAgICAgICAgdmFsdWUgPSBhcmdfdmFsdWVzLnJlZHVjZSgoYWNjLCBjdXIpID0+IGFjYyAqIGN1ciwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoYXBwLmlzRGl2KCkpe1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGFyZ192YWx1ZXNbMF0gLyBhcmdfdmFsdWVzWzFdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGFwcC5pc0VxKCkpe1xyXG4gICAgICAgICAgICB2YWx1ZSA9IChhcmdfdmFsdWVzWzBdID09IGFyZ192YWx1ZXNbMV0gPyAxIDogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoYXBwLmZuY05hbWUgPT0gXCI8PVwiKXtcclxuICAgICAgICAgICAgdmFsdWUgPSAoYXJnX3ZhbHVlc1swXSA8PSBhcmdfdmFsdWVzWzFdID8gMSA6IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGFwcC5mbmNOYW1lID09IFwiPFwiKXtcclxuICAgICAgICAgICAgdmFsdWUgPSAoYXJnX3ZhbHVlc1swXSA8IGFyZ192YWx1ZXNbMV0gPyAxIDogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKFwidW5pbXBsZW1lbnRlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcihcInVuaW1wbGVtZW50ZWRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRlcm0udmFsdWUuZnZhbCgpICogdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDYWxjQmxvY2sgZXh0ZW5kcyBJbnB1dFRleHRCbG9jayB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmlucHV0UG9ydCwgXCJhXCIpLCBcclxuICAgICAgICAgICAgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUub3V0cHV0UG9ydCwgXCJiXCIpIFxyXG4gICAgICAgIF07XHJcbiAgICB9XHJcblxyXG4gICAgY2FsYygpe1xyXG4gICAgICAgIG1zZyhgc3RhcnQgY2FsYzogYToke3RoaXMucG9ydHNbMF0udmFsdWV9YCk7XHJcbiAgICAgICAgY29uc3QgZXhwciA9IHBhcnNlTWF0aCh0aGlzLmlucHV0LnZhbHVlLnRyaW0oKSkgYXMgQXBwO1xyXG4gICAgICAgIGFzc2VydChleHByLmlzUm9vdEVxKCkpO1xyXG4gICAgICAgIGNvbnN0IGxocyA9IGV4cHIuYXJnc1swXSBhcyBSZWZWYXI7XHJcbiAgICAgICAgY29uc3QgcmhzID0gZXhwci5hcmdzWzFdO1xyXG5cclxuICAgICAgICBjb25zdCBtYXAgPSB0aGlzLm1ha2VJbnB1dFZhbHVlTWFwKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJoc192YWx1ZSA9IGNhbGNUZXJtKG1hcCwgcmhzKTtcclxuICAgICAgICBjb25zdCBsaHNfcG9ydCA9IHRoaXMucG9ydHMuZmluZCh4ID0+IHgubmFtZSA9PSBsaHMubmFtZSAmJiB4LnR5cGUgPT0gUG9ydFR5cGUub3V0cHV0UG9ydCkhO1xyXG4gICAgICAgIGFzc2VydChsaHNfcG9ydCAhPSB1bmRlZmluZWQpO1xyXG4gICAgICAgIGxoc19wb3J0LnNldFBvcnRWYWx1ZShyaHNfdmFsdWUpO1xyXG5cclxuICAgICAgICBtc2coYGVuZCBjYWxjOiBiOiR7dGhpcy5wb3J0c1sxXS52YWx1ZX1gKTtcclxuXHJcbiAgICAgICAgdGhpcy5wcm9wZXJnYXRlQ2FsYygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ29tcGFyZUJsb2NrIGV4dGVuZHMgSW5wdXRUZXh0QmxvY2sgeyAgICBcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBcclxuICAgICAgICAgICAgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUuaW5wdXRQb3J0LCBcImFcIiksIFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5vdXRwdXRQb3J0KSBcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnZhbHVlID0gXCJhID09IGFcIjtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjKCkge1xyXG4gICAgICAgIG1zZyhgc3RhcnQgY29tcGFyZTogYToke3RoaXMucG9ydHNbMF0udmFsdWV9YCk7XHJcbiAgICAgICAgbGV0IGV4cHIgOiBBcHA7XHJcblxyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgZXhwciA9IHBhcnNlTWF0aCh0aGlzLmlucHV0LnZhbHVlLnRyaW0oKSkgYXMgQXBwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaChlcnJvcil7XHJcbiAgICAgICAgICAgIGlmKGVycm9yIGluc3RhbmNlb2YgcGFyc2VyX3RzLlN5bnRheEVycm9yKXtcclxuICAgICAgICAgICAgICAgIG1zZyhgc3ludGF4IGVycm9yYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMucG9ydHNbMV0uc2V0UG9ydFZhbHVlKHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG1hcCA9IHRoaXMubWFrZUlucHV0VmFsdWVNYXAoKTtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBjYWxjVGVybShtYXAsIGV4cHIpO1xyXG5cclxuICAgICAgICBpZihyZXN1bHQgPT0gMCB8fCByZXN1bHQgPT0gMSl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBvcnRzWzFdLnNldFBvcnRWYWx1ZShyZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgbXNnKGBpbGxlZ2FsIGNvbXBhcmUgcmVzdWx0OiR7cmVzdWx0fWApO1xyXG4gICAgICAgICAgICB0aGlzLnBvcnRzWzFdLnNldFBvcnRWYWx1ZSh1bmRlZmluZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbWFrZUJsb2NrQnlUeXBlTmFtZSh0eXBlTmFtZSA6IHN0cmluZykgOiBCbG9jayB7XHJcbiAgICBzd2l0Y2godHlwZU5hbWUpe1xyXG4gICAgY2FzZSBJZkJsb2NrLm5hbWU6ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IElmQmxvY2soe30pO1xyXG4gICAgY2FzZSBDb21wYXJlQmxvY2submFtZTogICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENvbXBhcmVCbG9jayh7fSk7XHJcbiAgICBjYXNlIEluZmluaXRlTG9vcC5uYW1lOiAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgSW5maW5pdGVMb29wKHt9KTtcclxuICAgIGNhc2UgSW5wdXRSYW5nZUJsb2NrLm5hbWU6ICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnB1dFJhbmdlQmxvY2soe30pO1xyXG4gICAgY2FzZSBTZXJ2b01vdG9yQmxvY2submFtZTogICAgICAgICAgICAgICByZXR1cm4gbmV3IFNlcnZvTW90b3JCbG9jayh7fSk7XHJcbiAgICBjYXNlIFNldFZhbHVlQmxvY2submFtZTogICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU2V0VmFsdWVCbG9jayh7fSk7XHJcbiAgICBjYXNlIENhbWVyYUJsb2NrLm5hbWU6ICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ2FtZXJhQmxvY2soe30pO1xyXG4gICAgY2FzZSBUVFNCbG9jay5uYW1lOiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRUU0Jsb2NrKHt9KTtcclxuICAgIGNhc2UgU2xlZXBCbG9jay5uYW1lOiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTbGVlcEJsb2NrKHt9KTtcclxuICAgIGNhc2UgRmFjZURldGVjdGlvbkJsb2NrLm5hbWU6ICAgICAgICAgICAgcmV0dXJuIG5ldyBGYWNlRGV0ZWN0aW9uQmxvY2soe30pO1xyXG4gICAgY2FzZSBKb3lTdGlja0Jsb2NrLm5hbWU6ICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEpveVN0aWNrQmxvY2soe30pO1xyXG4gICAgY2FzZSBVbHRyYXNvbmljRGlzdGFuY2VTZW5zb3JCbG9jay5uYW1lOiByZXR1cm4gbmV3IFVsdHJhc29uaWNEaXN0YW5jZVNlbnNvckJsb2NrKHt9KTtcclxuICAgIGNhc2UgQ2FsY0Jsb2NrLm5hbWU6ICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDYWxjQmxvY2soe30pO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG59IiwibmFtZXNwYWNlIGRpYWdyYW1fdHMge1xyXG4vL1xyXG5leHBvcnQgbGV0IHJlcGFpbnRDb3VudCA9IDA7XHJcblxyXG5sZXQgYW5pbWF0aW9uRnJhbWVJZCA6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuZXhwb3J0IGNsYXNzIENhbnZhcyB7XHJcbiAgICBzdGF0aWMgb25lIDogQ2FudmFzO1xyXG5cclxuICAgIGNhbnZhcyA6IEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgY3R4IDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG4gICAgcm9vdCAgIDogR3JpZDtcclxuICAgIGRyYWdnZWRVST8gOiBCbG9jayB8IFBvcnQgfCBCdXR0b247XHJcbiAgICBuZWFyUG9ydHMgOiBQb3J0W10gPSBbXTtcclxuICAgIHBvaW50ZXJJZCA6IG51bWJlciA9IE5hTjtcclxuXHJcbiAgICBkb3duUG9zIDogVmVjMiA9IFZlYzIuemVybygpO1xyXG4gICAgbW92ZVBvcyA6IFZlYzIgPSBWZWMyLnplcm8oKTtcclxuICAgIHVpT3JnUG9zIDogVmVjMiA9IFZlYzIuemVybygpO1xyXG5cclxuICAgIG1vdmVkIDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNhbnZhc19odG1sIDogSFRNTENhbnZhc0VsZW1lbnQsIHJvb3QgOiBHcmlkKXtcclxuICAgICAgICBDYW52YXMub25lID0gdGhpcztcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhc19odG1sO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKSE7IC8vIE9yICd3ZWJnbCcsICd3ZWJnbDInXHJcbiAgICAgICAgaWYgKCF0aGlzLmN0eCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ2FudmFzIGNvbnRleHQgbm90IHN1cHBvcnRlZCFcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xyXG5cclxuICAgICAgICBzZXRDb250ZXh0MkQodGhpcy5jdHgsIHRoaXMucm9vdCk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZG93blwiLCAgdGhpcy5wb2ludGVyZG93bi5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcm1vdmVcIiwgIHRoaXMucG9pbnRlcm1vdmUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJ1cFwiICAsIGFzeW5jIChldjpQb2ludGVyRXZlbnQpPT57XHJcbiAgICAgICAgICAgIGF3YWl0IENhbnZhcy5vbmUucG9pbnRlcnVwKGV2KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRQb3NpdGlvbkluQ2FudmFzKGV2ZW50IDogUG9pbnRlckV2ZW50KSA6IFZlYzIge1xyXG4gICAgICAgIC8vIEdldCB0aGUgYm91bmRpbmcgcmVjdGFuZ2xlIG9mIHRoZSBjYW52YXNcclxuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgc2NhbGluZyBmYWN0b3JzIGlmIHRoZSBjYW52YXMgaXMgc3R5bGVkIGRpZmZlcmVudGx5IGZyb20gaXRzIGludGVybmFsIHJlc29sdXRpb25cclxuICAgICAgICBjb25zdCBzY2FsZVggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHJlY3Qud2lkdGg7XHJcbiAgICAgICAgY29uc3Qgc2NhbGVZID0gdGhpcy5jYW52YXMuaGVpZ2h0IC8gcmVjdC5oZWlnaHQ7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY2FudmFzIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgY29uc3QgY2FudmFzWCA9IChldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAqIHNjYWxlWDtcclxuICAgICAgICBjb25zdCBjYW52YXNZID0gKGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcCkgKiBzY2FsZVk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMihjYW52YXNYLCBjYW52YXNZKTtcclxuICAgICAgICAvLyBOb3cgeW91IGhhdmUgdGhlIGNhbnZhcyBjb29yZGluYXRlcyFcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgQ2FudmFzIFg6ICR7Y2FudmFzWH0sIENhbnZhcyBZOiAke2NhbnZhc1l9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VUlGcm9tUG9zaXRpb24odWkgOiBVSSwgcG9zIDogVmVjMikgOiBVSSB8IFBvcnQgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGZvcihjb25zdCBjaGlsZCBvZiB1aS5jaGlsZHJlbigpKXtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5nZXRVSUZyb21Qb3NpdGlvbihjaGlsZCwgcG9zKTtcclxuICAgICAgICAgICAgaWYodGFyZ2V0ICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih1aS5wb3NpdGlvbi54IDw9IHBvcy54ICYmIHBvcy54IDwgdWkucG9zaXRpb24ueCArIHVpLmJveFNpemUueCl7XHJcbiAgICAgICAgICAgIGlmKHVpLnBvc2l0aW9uLnkgPD0gcG9zLnkgJiYgcG9zLnkgPCB1aS5wb3NpdGlvbi55ICsgdWkuYm94U2l6ZS55KXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih1aSBpbnN0YW5jZW9mIEJsb2NrKXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3J0ID0gdWkuZ2V0UG9ydEZyb21Qb3NpdGlvbihwb3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHBvcnQgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvcnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB1aTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBwb2ludGVyZG93bihldjpQb2ludGVyRXZlbnQpe1xyXG4gICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5nZXRQb3NpdGlvbkluQ2FudmFzKGV2KTtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmdldFVJRnJvbVBvc2l0aW9uKHRoaXMucm9vdCwgcG9zKTtcclxuICAgICAgICBpZih0YXJnZXQgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgbXNnKGBkb3duOiR7dGFyZ2V0LmNvbnN0cnVjdG9yLm5hbWV9YCk7XHJcbiAgICAgICAgICAgIHRoaXMuZG93blBvcyAgID0gcG9zO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVQb3MgICA9IHBvcztcclxuXHJcbiAgICAgICAgICAgIGlmKHRhcmdldCBpbnN0YW5jZW9mIEJsb2NrKXtcclxuICAgICAgICAgICAgICAgIGlmKHRhcmdldCBpbnN0YW5jZW9mIElucHV0UmFuZ2VCbG9jayl7XHJcbiAgICAgICAgICAgICAgICAgICAgbXNnKGByYW5nZTogYm94JHt0YXJnZXQuYm94U2l6ZS54LnRvRml4ZWQoKX0gb3V0OiR7dGFyZ2V0Lm1pblNpemUhLnh9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodGFyZ2V0LmluVG9vbGJveCl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJsb2NrID0gdGFyZ2V0LmNvcHkoKTtcclxuICAgICAgICAgICAgICAgICAgICBNYWluLm9uZS5lZGl0b3IuYWRkQmxvY2soYmxvY2spO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnZWRVSSA9IGJsb2NrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnZWRVSSA9IHRhcmdldDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRhcmdldCBpbnN0YW5jZW9mIFBvcnQpe1xyXG5cclxuICAgICAgICAgICAgICAgIG1zZyhgZG93biBwb3J0OiR7dGFyZ2V0LnN0cigpfWApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2VkVUkgPSB0YXJnZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZih0YXJnZXQgaW5zdGFuY2VvZiBCdXR0b24pe1xyXG5cclxuICAgICAgICAgICAgICAgIG1zZyhgZG93biBidXR0b246JHt0YXJnZXQudGV4dH1gKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFVJID0gdGFyZ2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICB0aGlzLnVpT3JnUG9zICA9IHRoaXMuZHJhZ2dlZFVJLnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVySWQgPSBldi5wb2ludGVySWQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zZXRQb2ludGVyQ2FwdHVyZSh0aGlzLnBvaW50ZXJJZCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLmNsYXNzTGlzdC5hZGQoJ2RyYWdnaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldE5lYXJQb3J0cyhkcmFnZ2VkX2Jsb2NrIDogQmxvY2spe1xyXG4gICAgICAgIHRoaXMubmVhclBvcnRzID0gW107XHJcbiAgICAgICAgY29uc3Qgb3RoZXJfYmxvY2tzID0gTWFpbi5vbmUuZWRpdG9yLmJsb2Nrcy5maWx0ZXIoeCA9PiB4ICE9IHRoaXMuZHJhZ2dlZFVJKTtcclxuICAgICAgICBmb3IoY29uc3QgYmxvY2sgb2Ygb3RoZXJfYmxvY2tzKXtcclxuICAgICAgICAgICAgY29uc3QgbmVhcl9wb3J0cyA9IGRyYWdnZWRfYmxvY2suY2FuQ29ubmVjdE5lYXJQb3J0UGFpcihibG9jayk7XHJcbiAgICAgICAgICAgIGlmKG5lYXJfcG9ydHMubGVuZ3RoICE9IDApe1xyXG4gICAgICAgICAgICAgICAgbXNnKGBuZWFyYCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5lYXJQb3J0cyA9IG5lYXJfcG9ydHM7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcG9pbnRlcm1vdmUoZXY6UG9pbnRlckV2ZW50KXtcclxuICAgICAgICB0aGlzLm1vdmVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5kcmFnZ2VkVUkgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5nZXRQb3NpdGlvbkluQ2FudmFzKGV2KTtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmdldFVJRnJvbVBvc2l0aW9uKHRoaXMucm9vdCwgcG9zKTtcclxuICAgICAgICBjb25zdCBzID0gKHRhcmdldCA9PSB1bmRlZmluZWQgPyBcIlwiIDogYHRhcmdldDpbJHt0YXJnZXQuc3RyKCl9XWApO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVQb3MgPSBwb3M7XHJcblxyXG4gICAgICAgIGNvbnN0IGRpZmYgPSBwb3Muc3ViKHRoaXMuZG93blBvcyk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuZHJhZ2dlZFVJIGluc3RhbmNlb2YgQmxvY2spe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkVUkuc2V0UG9zaXRpb24oIHRoaXMudWlPcmdQb3MuYWRkKGRpZmYpICk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0TmVhclBvcnRzKHRoaXMuZHJhZ2dlZFVJKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZUNhbnZhcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVlc3RVcGRhdGVDYW52YXMoKXtcclxuICAgICAgICBpZiAoYW5pbWF0aW9uRnJhbWVJZCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbmltYXRpb25GcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpPT57XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb25GcmFtZUlkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVwYWludCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcG9pbnRlcnVwKGV2OlBvaW50ZXJFdmVudCl7XHJcbiAgICAgICAgaWYodGhpcy5kcmFnZ2VkVUkgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5nZXRQb3NpdGlvbkluQ2FudmFzKGV2KTtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmdldFVJRnJvbVBvc2l0aW9uKHRoaXMucm9vdCwgcG9zKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5tb3ZlZCl7XHJcbiAgICAgICAgICAgIG1zZyhcImRyYWdnZWRcIik7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJhZ2dlZFVJIGluc3RhbmNlb2YgUG9ydCAmJiB0YXJnZXQgaW5zdGFuY2VvZiBQb3J0KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFVJLmNvbm5lY3QodGFyZ2V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuZHJhZ2dlZFVJIGluc3RhbmNlb2YgQmxvY2spe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlmZiA9IHBvcy5zdWIodGhpcy5kb3duUG9zKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldE5lYXJQb3J0cyh0aGlzLmRyYWdnZWRVSSk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm5lYXJQb3J0cy5sZW5ndGggPT0gMil7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9ydF9kaWZmcyA9IHRoaXMubmVhclBvcnRzWzFdLnBvc2l0aW9uLnN1Yih0aGlzLm5lYXJQb3J0c1swXS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2VkVUkubW92ZURpZmYocG9ydF9kaWZmcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFVJLmNvbm5lY3RCbG9jayh0aGlzLm5lYXJQb3J0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXlvdXRSb290KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFVJLnNldFBvc2l0aW9uKCB0aGlzLnVpT3JnUG9zLmFkZChkaWZmKSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIG1zZyhgY2xpY2s6JHt0aGlzLmRyYWdnZWRVSS5jb25zdHJ1Y3Rvci5uYW1lfWApO1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5kcmFnZ2VkVUkgaW5zdGFuY2VvZiBCdXR0b24pe1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kcmFnZ2VkVUkuY2xpY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jYW52YXMucmVsZWFzZVBvaW50ZXJDYXB0dXJlKHRoaXMucG9pbnRlcklkKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnZ2luZycpO1xyXG5cclxuICAgICAgICB0aGlzLmRyYWdnZWRVSSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLnBvaW50ZXJJZCA9IE5hTjtcclxuICAgICAgICB0aGlzLm5lYXJQb3J0cyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGVDYW52YXMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsYXlvdXRSb290KCl7XHJcbiAgICAgICAgdGhpcy5yb290LnNldE1pblNpemUoKTtcclxuICAgICAgICB0aGlzLnJvb3QubGF5b3V0KDAsIDAsIG5ldyBWZWMyKHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpLCAwKTsgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHJlc2l6ZUNhbnZhcygpIHtcclxuICAgICAgICAvLyBTZXQgdGhlIGNhbnZhcydzIGludGVybmFsIGRyYXdpbmcgZGltZW5zaW9ucyB0byBtYXRjaCBpdHMgZGlzcGxheSBzaXplXHJcbiAgICAgICAgLy8gd2luZG93LmlubmVyV2lkdGgvSGVpZ2h0IGdpdmUgdGhlIHZpZXdwb3J0IGRpbWVuc2lvbnMuXHJcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgICAgICAvLyBJZiB5b3UncmUgZHJhd2luZyBzb21ldGhpbmcsIHlvdSBtaWdodCB3YW50IHRvIHJlZHJhdyBpdCBoZXJlXHJcbiAgICAgICAgaWYgKHRoaXMuY3R4KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTsgLy8gQ2xlYXIgdGhlIGNhbnZhc1xyXG4gICAgICAgICAgICAvLyBFeGFtcGxlIGRyYXdpbmdcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ2JsdWUnO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCg1MCwgNTAsIDEwMCwgMTAwKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZm9udCA9ICczMHB4IEFyaWFsJztcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3doaXRlJztcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoJ0hlbGxvIENhbnZhcyEnLCB0aGlzLmNhbnZhcy53aWR0aCAvIDIgLSAxMDAsIHRoaXMuY2FudmFzLmhlaWdodCAvIDIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sYXlvdXRSb290KCk7XHJcbiAgICAgICAgdGhpcy5yb290LmR1bXAoMCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZUNhbnZhcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdEcmFnZ2VkUG9ydChwb3J0IDogUG9ydCl7ICAgICAgIFxyXG4gICAgICAgIHRoaXMuZHJhd0xpbmUocG9ydC5wb3NpdGlvbiwgdGhpcy5tb3ZlUG9zLCBcImJsdWVcIikgO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcGFpbnQoKXtcclxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7ICAgICAgICBcclxuICAgICAgICB0aGlzLnJvb3QuZHJhdygpO1xyXG4gICAgICAgIGlmKHRoaXMuZHJhZ2dlZFVJIGluc3RhbmNlb2YgUG9ydCl7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0RyYWdnZWRQb3J0KHRoaXMuZHJhZ2dlZFVJKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbXNnKFwicmVwYWludFwiKTtcclxuICAgICAgICByZXBhaW50Q291bnQrKztcclxuICAgIH1cclxuXHJcbiAgICBkcmF3TGluZShzdGFydCA6IFZlYzIsIGVuZCA6IFZlYzIsIGNvbG9yIDogc3RyaW5nLCBsaW5lV2lkdGggOiBudW1iZXIgPSAyKXtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCAgID0gbGluZVdpZHRoO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oc3RhcnQueCwgc3RhcnQueSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKGVuZC54LCBlbmQueSk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG59IiwibmFtZXNwYWNlIGRpYWdyYW1fdHMge1xyXG4vL1xyXG5leHBvcnQgbGV0IHVybE9yaWdpbiA6IHN0cmluZztcclxubGV0IHN0YXJ0QnV0dG9uIDogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbmV4cG9ydCBsZXQgc3RvcEZsYWcgOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBpc1J1bm5pbmcgOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG5jbGFzcyBWYXJpYWJsZSB7XHJcbiAgICBuYW1lISA6IHN0cmluZztcclxuICAgIHR5cGUhIDogRGF0YVR5cGU7XHJcbn1cclxuXHJcbmNsYXNzIEZpZWxkIGV4dGVuZHMgVmFyaWFibGUge1xyXG4gICAgcGFyZW50ISA6IFN0cnVjdDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFN0cnVjdCB7XHJcbiAgICBtZW1iZXJzIDogRmllbGRbXSA9IFtdO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRGF0YVR5cGUge1xyXG4gICAgZGltZW5zaW9ucyA6IG51bWJlcltdID0gW107XHJcbiAgICB0eXBlTmFtZSEgOiBzdHJpbmc7XHJcblxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUG9ydCB7XHJcbiAgICBzdGF0aWMgcmFkaXVzID0gMTA7ICAgICAgICBcclxuXHJcbiAgICBpZHggOiBudW1iZXIgPSAwO1xyXG4gICAgbmFtZSA6IHN0cmluZztcclxuICAgIHBhcmVudCA6IEJsb2NrO1xyXG4gICAgZGVzdGluYXRpb25zIDogUG9ydFtdICA9IFtdO1xyXG4gICAgc291cmNlcyA6IFBvcnRbXSAgPSBbXTtcclxuICAgIHR5cGUgOiBQb3J0VHlwZTtcclxuICAgIHBpcGVzIDogUGlwZVtdID0gW107XHJcbiAgICBwb3NpdGlvbiA6IFZlYzIgPSBWZWMyLnplcm8oKTtcclxuXHJcbiAgICBwcmV2VmFsdWUgOiBhbnkgfCB1bmRlZmluZWQ7XHJcbiAgICB2YWx1ZSA6IGFueSB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQgOiBCbG9jaywgdHlwZSA6IFBvcnRUeXBlLCBuYW1lIDogc3RyaW5nID0gXCJcIil7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgdGhpcy50eXBlICAgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMubmFtZSAgID0gbmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBzdHIoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIFwicG9ydFwiO1xyXG4gICAgfVxyXG5cclxuICAgIGNvcHlQb3J0KHBhcmVudCA6IEJsb2NrKSA6IFBvcnQge1xyXG4gICAgICAgIGNvbnN0IHBvcnQgPSBuZXcgUG9ydChwYXJlbnQsIHRoaXMudHlwZSk7XHJcbiAgICAgICAgcG9ydC5wb3NpdGlvbiA9IHRoaXMucG9zaXRpb24uY29weSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gcG9ydDtcclxuICAgIH1cclxuXHJcbiAgICBtYWtlT2JqKCkgOiBhbnl7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWR4IDogdGhpcy5pZHgsXHJcbiAgICAgICAgICAgIGRlc3RpbmF0aW9ucyA6IHRoaXMuZGVzdGluYXRpb25zLm1hcChkc3QgPT4gZHN0LmlkeClcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHNldFBvcnRWYWx1ZSh2YWx1ZSA6IGFueSB8IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG5cclxuICAgICAgICBmb3IoY29uc3QgZHN0IG9mIHRoaXMuZGVzdGluYXRpb25zKXtcclxuICAgICAgICAgICAgZHN0LnNldFBvcnRWYWx1ZSh2YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICBkc3QucGFyZW50LnZhbHVlQ2hhbmdlZCgpXHJcbiAgICAgICAgICAgIC50aGVuKCgpPT57XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHZhbHVlIGNoYW5nZTpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNOZWFyKHBvcyA6IFZlYzIpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmRpc3RhbmNlKHBvcykgPCBQb3J0LnJhZGl1cztcclxuICAgIH1cclxuXHJcbiAgICBkcmF3UG9ydChjdHggOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGN4IDogbnVtYmVyLCBjeSA6IG51bWJlcikgOiB2b2lkIHsgICAgICAgXHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSBjeDtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSBjeTtcclxuXHJcbiAgICAgICAgY3R4LmFyYyh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgUG9ydC5yYWRpdXMsIDAsIDIgKiBNYXRoLlBJKTtcclxuXHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBkc3Qgb2YgdGhpcy5kZXN0aW5hdGlvbnMpe1xyXG4gICAgICAgICAgICBDYW52YXMub25lLmRyYXdMaW5lKHRoaXMucG9zaXRpb24sIGRzdC5wb3NpdGlvbiwgXCJicm93blwiLCA0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMubmFtZSAhPSBcIlwiKXtcclxuICAgICAgICAgICAgLy8gY3R4LnN0cm9rZVRleHQodGhpcy5uYW1lLCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgIGN0eC5mb250ID0gJzI0cHggQXJpYWwnO1xyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NpdGlvbi54IC0gNztcclxuICAgICAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zaXRpb24ueSArIDc7XHJcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLm5hbWUsIHgsIHkpO1xyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy52YWx1ZSAhPSB1bmRlZmluZWQpe1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuICAgICAgICAgICAgY3R4LmZvbnQgPSAnMjRweCBBcmlhbCc7XHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc2l0aW9uLnggLSA3ICsgUG9ydC5yYWRpdXM7XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc2l0aW9uLnkgKyA3O1xyXG4gICAgICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy52YWx1ZX1gLCB4LCB5KTtcclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2FuQ29ubmVjdChkc3QgOiBQb3J0KSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IHBhaXJzID0gW1xyXG4gICAgICAgICAgICBbIFBvcnRUeXBlLmJvdHRvbSwgUG9ydFR5cGUudG9wXSxcclxuICAgICAgICAgICAgWyBQb3J0VHlwZS50b3AgLCBQb3J0VHlwZS5ib3R0b21dLFxyXG5cclxuICAgICAgICAgICAgWyBQb3J0VHlwZS5pbnB1dFBvcnQsIFBvcnRUeXBlLm91dHB1dFBvcnRdLFxyXG4gICAgICAgICAgICBbIFBvcnRUeXBlLm91dHB1dFBvcnQsIFBvcnRUeXBlLmlucHV0UG9ydF1cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICByZXR1cm4gcGFpcnMuc29tZShwYWlyID0+IHBhaXJbMF0gPT0gdGhpcy50eXBlICYmIHBhaXJbMV0gPT0gZHN0LnR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3QocG9ydCA6IFBvcnQpIDogdm9pZCB7ICAgXHJcbiAgICAgICAgYXNzZXJ0KHRoaXMuY2FuQ29ubmVjdChwb3J0KSk7XHJcblxyXG4gICAgICAgIGxldCBzcmMgOiBQb3J0O1xyXG4gICAgICAgIGxldCBkc3QgOiBQb3J0O1xyXG5cclxuICAgICAgICBpZih0aGlzLnR5cGUgPT0gUG9ydFR5cGUuYm90dG9tIHx8IHRoaXMudHlwZSA9PSBQb3J0VHlwZS5vdXRwdXRQb3J0KXtcclxuICAgICAgICAgICAgW3NyYywgZHN0XSA9IFt0aGlzLCBwb3J0XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgW3NyYywgZHN0XSA9IFtwb3J0LCB0aGlzXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFwcGVuZChzcmMuZGVzdGluYXRpb25zLCBkc3QpO1xyXG4gICAgICAgIGFwcGVuZChkc3Quc291cmNlcywgc3JjKTtcclxuXHJcbiAgICAgICAgbXNnKGBjb25uZWN0IHBvcnQ6JHt0aGlzLmlkeH09PiR7cG9ydC5pZHh9YCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEpvaW50IHtcclxuXHJcbiAgICBkcmF3Sm9pbnQoY2FudmFzIDogQ2FudmFzKXsgICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBUdWJlIHtcclxuXHJcbiAgICBkcmF3VHViZShjYW52YXMgOiBDYW52YXMpeyAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQaXBlIHtcclxuICAgIHNvdXJjZSEgOiBQb3J0O1xyXG4gICAgZGVzdGluYXRpb24hIDogUG9ydDtcclxuICAgIHR1YmVzIDogVHViZVtdID0gW107XHJcbiAgICBqb2ludHMgOiBKb2ludFtdID0gW107XHJcblxyXG4gICAgZHJhd1BpcGUoY2FudmFzIDogQ2FudmFzKXsgICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRWRnZSB7XHJcbn1cclxuXHJcbmNsYXNzIFBsb3QgeyAgICBcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExheWVyIHtcclxufVxyXG5cclxuY2xhc3MgU2NoZWR1bGVyIHtcclxufVxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGFzeW5jICgpID0+IHtcclxuICAgIGF3YWl0IGFzeW5jQm9keU9uTG9hZCgpO1xyXG59KTsgIFxyXG5cclxuLy9cclxubGV0IG1haW4gOiBNYWluO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1haW4ge1xyXG4gICAgc3RhdGljIG9uZSA6IE1haW47XHJcbiAgICBjYW52YXMgOiBDYW52YXM7XHJcbiAgICBlZGl0b3IgOiBFZGl0b3I7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBNYWluLm9uZSA9IHRoaXM7XHJcbiAgICAgICAgLy8gR2V0IHRoZSBjYW52YXMgZWxlbWVudFxyXG5cclxuICAgICAgICB0aGlzLmVkaXRvciA9IG5ldyBFZGl0b3Ioe30pO1xyXG5cclxuICAgICAgICBjb25zdCByb290ID0gJGdyaWQoe1xyXG4gICAgICAgICAgICByb3dzIDogXCIxMDBweCAxMDAlXCIsICAgICAgICBcclxuICAgICAgICAgICAgY29sdW1ucyA6IFwiMTAwcHggMjUlIDc1JVwiLFxyXG4gICAgICAgICAgICBjZWxscyA6IFtcclxuICAgICAgICAgICAgICAgIC8vIFtcclxuICAgICAgICAgICAgICAgIC8vICAgICAkZmlsbGVyKHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY29sc3BhbiA6IDMsXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGJhY2tncm91bmRDb2xvciA6IFwiY29ybnNpbGtcIlxyXG4gICAgICAgICAgICAgICAgLy8gICAgIH0pXHJcbiAgICAgICAgICAgICAgICAvLyBdXHJcbiAgICAgICAgICAgICAgICAvLyAsXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgJGJ1dHRvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgOiBcImRvd25sb2FkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrIDogYXN5bmMgKCk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVKc29uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAkYnV0dG9uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA6IFwic3RhcnRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2sgOiBhc3luYyAoKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgc3RhcnRQcm9ncmFtKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAkZmlsbGVyKHt9KVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICRmaWxsZXIoe30pXHJcbiAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICR2bGlzdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbiA6IFwiMTAwJVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbiA6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJZkJsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEluZmluaXRlTG9vcCh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb21wYXJlQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgSW5wdXRSYW5nZUJsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFNlcnZvTW90b3JCbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU2V0VmFsdWVCbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDYW1lcmFCbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGYWNlRGV0ZWN0aW9uQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ2FsY0Jsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFVsdHJhc29uaWNEaXN0YW5jZVNlbnNvckJsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFRUU0Jsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFNsZWVwQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRvclxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNhbnZhc19odG1sID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dvcmxkJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBuZXcgQ2FudmFzKGNhbnZhc19odG1sLCByb290KVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsIHJlc2l6ZSB3aGVuIHRoZSBwYWdlIGxvYWRzXHJcbiAgICAgICAgLy8gVXNlIERPTUNvbnRlbnRMb2FkZWQgdG8gZW5zdXJlIHRoZSBjYW52YXMgZWxlbWVudCBleGlzdHMgYmVmb3JlIHRyeWluZyB0byBhY2Nlc3MgaXRcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgdGhpcy5jYW52YXMucmVzaXplQ2FudmFzLmJpbmQodGhpcy5jYW52YXMpKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHJlc2l6ZSB0aGUgY2FudmFzIHdoZW5ldmVyIHRoZSB3aW5kb3cgaXMgcmVzaXplZFxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmNhbnZhcy5yZXNpemVDYW52YXMuYmluZCh0aGlzLmNhbnZhcykpO1xyXG5cclxuICAgICAgICBzZXREcmFnRHJvcCh0aGlzLmNhbnZhcy5jYW52YXMpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbnZhcy5yZXNpemVDYW52YXMoKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydFByb2dyYW0oKXtcclxuICAgIGF3YWl0IHNlbmREYXRhKHtcclxuICAgICAgICBjb21tYW5kIDogXCJpbml0XCIsXHJcbiAgICAgICAgbmFtZTogXCJoYW1hZGFcIixcclxuICAgICAgICBhZ2U6IDY2XHJcbiAgICB9KTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGAke3VybE9yaWdpbn0vZ2V0X2RhdGFgO1xyXG4gICAgICAgIG1zZyhgZmV0Y2g6WyR7dXJsfV1gKTtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7IC8vIERlZmF1bHQgbWV0aG9kIGlzIEdFVFxyXG5cclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvciEgU3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7IC8vIFBhcnNlIHRoZSBKU09OIHJlc3BvbnNlIGZyb20gRmxhc2tcclxuICAgICAgICBjb25zdCBqc29uX3N0ciA9IEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpOyAvLyBQcmV0dHkgcHJpbnQgSlNPTlxyXG4gICAgICAgIG1zZyhgc3RhcnQgY2xpY2sgbmFtZTpbJHtkYXRhW1wicHJvZHVjdF9uYW1lXCJdfV0gcHJpY2U6WyR7ZGF0YVtcInByaWNlXCJdfV0ganNvbjpbJHtqc29uX3N0cn1dYCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgbXNnKGBzdGFydCBjbGljayBlcnJvcjogJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWApO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBmZXRjaEltYWdlKGltYWdlX3VybCA6IHN0cmluZyl7XHJcbiAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaW1hZ2Uud2lkdGggID0gMzIwO1xyXG4gICAgaW1hZ2UuaGVpZ2h0ID0gMjQwO1xyXG5cclxuICAgIC8vIDIuIFNldCB0aGUgY3Jvc3NPcmlnaW4gYXR0cmlidXRlIGZvciBzZWN1cml0eSBhbmQgdG8gcHJldmVudCBhIHRhaW50ZWQgY2FudmFzXHJcbiAgICBpbWFnZS5jcm9zc09yaWdpbiA9ICdBbm9ueW1vdXMnOyBcclxuICAgIFxyXG4gICAgaW1hZ2Uuc3JjID0gaW1hZ2VfdXJsOyBcclxuXHJcbiAgICAvLyA0LiBXYWl0IGZvciB0aGUgaW1hZ2UgdG8gbG9hZFxyXG4gICAgaW1hZ2Uub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgIGNhbWVyYUltZyA9IGltYWdlO1xyXG4gICAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ2FtZXJhSW1hZ2UoaW1hZ2VfZmlsZV9uYW1lIDogc3RyaW5nKXtcclxuICAgIGNvbnN0IGJsb2NrcyA9IE1haW4ub25lLmVkaXRvci5ibG9ja3M7XHJcbiAgICBjb25zdCBjYW1lcmFzID0gYmxvY2tzLmZpbHRlcih4ID0+IHggaW5zdGFuY2VvZiBDYW1lcmFCbG9jayk7XHJcbiAgICBmb3IoY29uc3QgY2FtZXJhIG9mIGNhbWVyYXMpe1xyXG4gICAgICAgIGNvbnN0IGltYWdlX3VybCA9IGBzdGF0aWMvbGliL2RpYWdyYW0vaW1nLyR7aW1hZ2VfZmlsZV9uYW1lfWA7XHJcbiAgICAgICAgZmV0Y2hJbWFnZShpbWFnZV91cmwpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVGYWNlRGV0ZWN0aW9uKGZhY2UgOiBudW1iZXJbXSl7XHJcbiAgICBjb25zdCBmYWNlX2RldGVjdGlvbiA9IE1haW4ub25lLmVkaXRvci5ibG9ja3MuZmluZCh4ID0+IHggaW5zdGFuY2VvZiBGYWNlRGV0ZWN0aW9uQmxvY2spIGFzIEZhY2VEZXRlY3Rpb25CbG9jaztcclxuICAgIGlmKGZhY2VfZGV0ZWN0aW9uICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgZmFjZV9kZXRlY3Rpb24uc2V0RmFjZShmYWNlKTtcclxuXHJcbiAgICAgICAgZmFjZV9kZXRlY3Rpb24ucHJvcGVyZ2F0ZUNhbGMoKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlRGlzdGFuY2VTZW5zb3IoZGlzdGFuY2UgOiBudW1iZXIpe1xyXG4gICAgY29uc3QgZGlzdGFuY2Vfc2Vuc29yID0gTWFpbi5vbmUuZWRpdG9yLmJsb2Nrcy5maW5kKHggPT4geCBpbnN0YW5jZW9mIFVsdHJhc29uaWNEaXN0YW5jZVNlbnNvckJsb2NrKSBhcyBVbHRyYXNvbmljRGlzdGFuY2VTZW5zb3JCbG9jaztcclxuICAgIGlmKGRpc3RhbmNlX3NlbnNvciAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGRpc3RhbmNlX3NlbnNvci5zZXREaXN0YW5jZShkaXN0YW5jZSk7XHJcblxyXG4gICAgICAgIGRpc3RhbmNlX3NlbnNvci5wcm9wZXJnYXRlQ2FsYygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjbGVhclF1ZXVlKCkge1xyXG4gICAgZm9yKGxldCBpZHggPSAwOyA7IGlkeCsrKXtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZW5kRGF0YSh7XHJcbiAgICAgICAgICAgIGNvbW1hbmQgOiBcInN0YXR1c1wiXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHF1ZXVlID0gcmVzdWx0W1wicXVldWVcIl1cclxuICAgICAgICBpZihxdWV1ZSA9PSBudWxsKXtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIG1zZyhgY2xlYXIgcXVldWU6JHtpZHh9YCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHBlcmlvZGljVGFzaygpIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlbmREYXRhKHtcclxuICAgICAgICBjb21tYW5kIDogXCJzdGF0dXNcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcXVldWUgPSByZXN1bHRbXCJxdWV1ZVwiXVxyXG4gICAgaWYocXVldWUgIT0gbnVsbCl7XHJcblxyXG4gICAgICAgIGNvbnN0IGpzb25fc3RyID0gSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCAyKTtcclxuICAgICAgICBtc2coYHN0YXR1czoke2pzb25fc3RyfWApO1xyXG5cclxuICAgICAgICBjb25zdCBpbWFnZV9maWxlX25hbWUgPSBxdWV1ZVtcImltYWdlX2ZpbGVfbmFtZVwiXTtcclxuICAgICAgICBpZihpbWFnZV9maWxlX25hbWUgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdXBkYXRlQ2FtZXJhSW1hZ2UoaW1hZ2VfZmlsZV9uYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZhY2UgPSBxdWV1ZVtcImZhY2VcIl07XHJcbiAgICAgICAgaWYoZmFjZSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBhc3NlcnQoZmFjZS5sZW5ndGggPT0gNCk7XHJcbiAgICAgICAgICAgIHVwZGF0ZUZhY2VEZXRlY3Rpb24oZmFjZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHF1ZXVlW1wiZGlzdGFuY2VcIl07XHJcbiAgICAgICAgaWYoZGlzdGFuY2UgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgYXNzZXJ0KHR5cGVvZiBkaXN0YW5jZSA9PSBcIm51bWJlclwiKTtcclxuICAgICAgICAgICAgdXBkYXRlRGlzdGFuY2VTZW5zb3IoZGlzdGFuY2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQ2FudmFzLm9uZS5yZXF1ZXN0VXBkYXRlQ2FudmFzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChwZXJpb2RpY1Rhc2ssIDEwMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRvcFByb2NlZHVyZXMoKSA6IEJsb2NrW10ge1xyXG4gICAgY29uc3QgcHJvY2VkdXJlX2Jsb2NrcyA9IE1haW4ub25lLmVkaXRvci5ibG9ja3MuZmlsdGVyKHggPT4geC5pc1Byb2NlZHVyZSgpKSBhcyBCbG9ja1tdO1xyXG5cclxuICAgIGNvbnN0IHRvcF9ibG9ja3MgOiBCbG9ja1tdID0gW107XHJcbiAgICBmb3IoY29uc3QgYmxvY2sgb2YgcHJvY2VkdXJlX2Jsb2Nrcyl7XHJcbiAgICAgICAgY29uc3QgdG9wX3BvcnQgPSBibG9jay5wb3J0cy5maW5kKHggPT4geC50eXBlID09IFBvcnRUeXBlLnRvcCkhO1xyXG4gICAgICAgIGFzc2VydCh0b3BfcG9ydCAhPSB1bmRlZmluZWQpO1xyXG4gICAgICAgIGlmKHRvcF9wb3J0LnNvdXJjZXMubGVuZ3RoID09IDApe1xyXG4gICAgICAgICAgICB0b3BfYmxvY2tzLnB1c2goYmxvY2spO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdG9wX2Jsb2NrcztcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkJsb2NrQ2hhaW4odG9wX2Jsb2NrIDogQmxvY2spe1xyXG4gICAgZm9yKGxldCBibG9jayA6IEJsb2NrIHwgdW5kZWZpbmVkID0gdG9wX2Jsb2NrOyBibG9jayAhPSB1bmRlZmluZWQ7IGJsb2NrID0gYmxvY2submV4dEJsb2NrKCkpe1xyXG4gICAgICAgIGF3YWl0IGJsb2NrLnJ1bigpO1xyXG5cclxuICAgICAgICBpZihzdG9wRmxhZyl7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc3RhcnRQcm9jZWR1cmVzKCkge1xyXG4gICAgc3RhcnRCdXR0b24uaW5uZXJUZXh0ID0gXCJTdG9wXCI7XHJcblxyXG4gICAgaXNSdW5uaW5nID0gdHJ1ZTtcclxuICAgIHN0b3BGbGFnID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3QgdG9wX2Jsb2NrcyA9IGdldFRvcFByb2NlZHVyZXMoKTtcclxuICAgIGZvcihjb25zdCB0b3BfYmxvY2sgb2YgdG9wX2Jsb2Nrcyl7XHJcbiAgICAgICAgbXNnKGB0b3AgcHJvYzoke3RvcF9ibG9jay5jb25zdHJ1Y3Rvci5uYW1lfWApO1xyXG4gICAgICAgIGF3YWl0IHJ1bkJsb2NrQ2hhaW4odG9wX2Jsb2NrKTtcclxuXHJcbiAgICAgICAgaWYoc3RvcEZsYWcpe1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbXNnKFwicHJvY2VkdXJlcyBjb21wbGV0ZS5cIik7XHJcbiAgICBpc1J1bm5pbmcgPSBmYWxzZTtcclxuICAgIHN0YXJ0QnV0dG9uLmlubmVyVGV4dCA9IFwiU3RhcnRcIjtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFzeW5jQm9keU9uTG9hZCgpe1xyXG4gICAgbXNnKFwibG9hZGVkXCIpO1xyXG4gICAgbGV0IHBhdGhuYW1lICA6IHN0cmluZztcclxuICAgIFsgdXJsT3JpZ2luLCBwYXRobmFtZSwgXSA9IGkxOG5fdHMucGFyc2VVUkwoKTtcclxuICAgIG1zZyhgb3JpZ2luOlske3VybE9yaWdpbn1dIHBhdGg6WyR7cGF0aG5hbWV9XWApO1xyXG5cclxuICAgIGNhbWVyYUljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbWVyYS1pY29uXCIpIGFzIEhUTUxJbWFnZUVsZW1lbnQ7XHJcbiAgICBtb3Rvckljb24gID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb3Rvci1pY29uXCIpIGFzIEhUTUxJbWFnZUVsZW1lbnQ7XHJcbiAgICBkaXN0YW5jZVNlbnNvckljb24gID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXN0YW5jZS1zZW5zb3ItaWNvblwiKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gICAgdHRzSWNvbiAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHRzLWljb25cIikgYXMgSFRNTEltYWdlRWxlbWVudDtcclxuICAgIHNsZWVwSWNvbiAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2xlZXAtaWNvblwiKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gICAgXHJcbiAgICB0dHNBdWRpbyAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHRzLWF1ZGlvXCIpIGFzIEhUTUxBdWRpb0VsZW1lbnQ7XHJcbiAgICB0dHNBdWRpby5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgKGV2OkV2ZW50KT0+e1xyXG4gICAgICAgIG1zZyhcIlRUUyBlbmRcIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBzdGFydEJ1dHRvbiA9ICQoXCJzdGFydC1idG5cIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICBzdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMoZXYgOiBNb3VzZUV2ZW50KT0+e1xyXG4gICAgICAgIGlmKGlzUnVubmluZyl7XHJcbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSBwbGF5YmFjayBwb3NpdGlvbiB0byB0aGUgc3RhcnRcclxuICAgICAgICAgICAgdHRzQXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgdHRzQXVkaW8uY3VycmVudFRpbWUgPSAwO1xyXG5cclxuICAgICAgICAgICAgc3RvcEZsYWcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBhd2FpdCBzdGFydFByb2NlZHVyZXMoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBtYWluID0gbmV3IE1haW4oKTtcclxuXHJcbiAgICBhd2FpdCBjbGVhclF1ZXVlKCk7XHJcblxyXG4gICAgaWYoIHVybE9yaWdpbiAhPSBcImh0dHA6Ly8xMjcuMC4wLjE6NTUwMFwiKXtcclxuICAgICAgICBhd2FpdCBwZXJpb2RpY1Rhc2soKTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbi8vIGV4cG9ydCBjbGFzcyBOb2RlIHtcclxuLy8gfVxyXG5cclxuLypcclxu44OA44Kk44Ki44Kw44Op44OgXHJcbuODu+ODleODreODvOODgeODo+ODvOODiFxyXG7jg7vjg4fjg7zjgr/jg5Xjg63jg7xcclxu44O75Zue6Lev5ZuzXHJcbuODu1VJ55S76Z2iXHJcbuODu1VNTFxyXG4gICAg44O744K344O844Kx44Oz44K55ZuzXHJcbiAgICDjg7vjgq/jg6njgrnlm7NcclxuICAgIOODu+OCouOCr+ODhuOCo+ODk+ODhuOCo+Wbs1xyXG4gICAg44O744Kz44Oz44Od44O844ON44Oz44OI5ZuzXHJcbiAgICDjg7vnirbmhYvpgbfnp7vlm7NcclxuICAgIOODu+OCv+OCpOODn+ODs+OCsOWbs1xyXG4gICAg44O7XHJcbuODu1xyXG7jg7tcclxu44O7XHJcbuODu1xyXG5cclxu44Kz44Oz44Od44O844ON44Oz44OIXHJcbuODu+Wun+ihjFxyXG4gICAg44O7aWYvZWxzZVxyXG4gICAg44O7d2hpbGVcclxuICAgIOODu+S7o+WFpVxyXG4gICAg44O744K544OI44Oq44O844OgXHJcbiAgICAgICAg44O76YCa5L+hXHJcbiAgICAgICAgICAgIOODu+ODl+ODreOCu+OCuemWk1xyXG4gICAgICAgICAgICDjg7vjgr3jgrHjg4Pjg4hcclxuICAgICAgICAgICAgICAgIOODu1RDUFxyXG4gICAgICAgICAgICAgICAg44O7VURQXHJcbiAgICAgICAg44O744OQ44OD44OV44Kh5LuY44GNXHJcbiAgICDjg7tzbGVlcFxyXG4gICAg44O7d2FpdCB1bnRpbFxyXG4gICAg44O7Y2FsbCBmdW5jdGlvblxyXG4gICAg44O744OW44Ot44OD44KvXHJcbiAgICAgICAg44O76Zai5pWw5a6a576pXHJcbiAgICAgICAg44O744OH44OQ44Kk44K5XHJcblxyXG5cclxu5a6f6KGM44Oi44O844OJXHJcbuODu+e3qOmbhlxyXG7jg7vjgqjjg5/jg6Xjg6zjg7zjgrfjg6fjg7Ncclxu44O75a6f5qmf44OH44OQ44OD44KwXHJcblxyXG7jgrnjgrHjgrjjg6Xjg7zjg6rjg7PjgrBcclxu44O75Y2z5pmC44Gr5YaN5a6f6KGMXHJcbuODu1RpY2vmmYLjgavlho3lrp/ooYxcclxuXHJcbuODu+WFpeWKm+OBleOCjOOBn+OCiVxyXG7jg7vlgKTjgYzlpInljJbjgZfjgZ/jgolcclxuXHJcbuODu++8keOBpOOBp+OCguWFpeWKm+OBleOCjOOBn+OCiVxyXG7jg7vlhajpg6jlhaXlipvjgZXjgozjgZ/jgolcclxuXHJcbiovXHJcblxyXG5cclxufSIsIm5hbWVzcGFjZSBkaWFncmFtX3RzIHtcclxuLy9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmREYXRhKGRhdGFUb1NlbmQgOiBhbnkpIDogUHJvbWlzZTxhbnk+IHtcclxuICAgIGNvbnN0IHVybCA9IGAke3VybE9yaWdpbn0vc2VuZF9kYXRhYDtcclxuICAgIC8vIG1zZyhgcG9zdDpbJHt1cmx9XWApO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YVRvU2VuZCkgLy8gQ29udmVydCBKYXZhU2NyaXB0IG9iamVjdCB0byBKU09OIHN0cmluZ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yISBTdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfSwgTWVzc2FnZTogJHtlcnJvckRhdGEubWVzc2FnZX1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTsgLy8gUGFyc2UgdGhlIEpTT04gcmVzcG9uc2UgZnJvbSBGbGFza1xyXG4gICAgICAgIGNvbnN0IGpzb25fc3RyID0gSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCAyKTsgLy8gUHJldHR5IHByaW50IEpTT05cclxuICAgICAgICAvLyBtc2coYHNlbmQgZGF0YSByZXN1bHQ6WyR7anNvbl9zdHJ9XWApO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIG1zZyhgc2VuZCBkYXRhIGVycm9yOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YCk7XHJcblxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG59IiwibmFtZXNwYWNlIGRpYWdyYW1fdHMge1xyXG4vL1xyXG5leHBvcnQgZnVuY3Rpb24gZG93bmxvYWRKc29uKGRhdGEgOiBhbnkpe1xyXG4gICAgLy8gQ29udmVydCB0aGUgb2JqZWN0IHRvIGEgSlNPTiBzdHJpbmdcclxuICAgIGNvbnN0IGpzb25EYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMik7IC8vIFRoZSBsYXN0IHR3byBhcmd1bWVudHMgYXJlIGZvciBmb3JtYXR0aW5nIChpbmRlbnRhdGlvbilcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBCbG9iIGZyb20gdGhlIEpTT04gc3RyaW5nXHJcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2pzb25EYXRhXSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9KTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW4gYW5jaG9yIGVsZW1lbnRcclxuICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICAgIGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICBsaW5rLmRvd25sb2FkID0gXCJkaWFncmFtLmpzb25cIjsgLy8gU2V0IHRoZSBmaWxlbmFtZVxyXG5cclxuICAgIC8vIEFwcGVuZCB0aGUgbGluayB0byB0aGUgYm9keSAoaXQgbXVzdCBiZSBpbiB0aGUgZG9jdW1lbnQgdG8gYmUgY2xpY2thYmxlKVxyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcclxuXHJcbiAgICAvLyBQcm9ncmFtbWF0aWNhbGx5IGNsaWNrIHRoZSBsaW5rIHRvIHRyaWdnZXIgdGhlIGRvd25sb2FkXHJcbiAgICBsaW5rLmNsaWNrKCk7XHJcblxyXG4gICAgLy8gQ2xlYW4gdXA6IHJlbW92ZSB0aGUgbGluayBhbmQgcmV2b2tlIHRoZSBvYmplY3QgVVJMXHJcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xyXG4gICAgVVJMLnJldm9rZU9iamVjdFVSTChsaW5rLmhyZWYpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcmV2ZW50RGVmYXVsdHMoZXY6RHJhZ0V2ZW50KSB7XHJcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpOyBcclxuICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJhZ0Ryb3AoY2FudmFzIDogSFRNTENhbnZhc0VsZW1lbnQpe1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiwgKGV2IDogRHJhZ0V2ZW50KT0+e1xyXG4gICAgICAgIHByZXZlbnREZWZhdWx0cyhldik7XHJcbiAgICAgICAgbXNnKFwiZHJhZyBlbnRlclwiKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGV2IDogRHJhZ0V2ZW50KT0+e1xyXG4gICAgICAgIHByZXZlbnREZWZhdWx0cyhldik7XHJcbiAgICAgICAgY2FudmFzLmNsYXNzTGlzdC5hZGQoJ2RyYWdvdmVyJylcclxuXHJcbiAgICAgICAgbXNnKFwiZHJhZyBvdmVyXCIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgKGV2IDogRHJhZ0V2ZW50KT0+e1xyXG4gICAgICAgIHByZXZlbnREZWZhdWx0cyhldik7XHJcbiAgICAgICAgY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdvdmVyJyk7XHJcbiAgICAgICAgbXNnKFwiZHJhZyBsZWF2ZVwiKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBhc3luYyAoZXYgOiBEcmFnRXZlbnQpPT57XHJcbiAgICAgICAgcHJldmVudERlZmF1bHRzKGV2KTtcclxuICAgICAgICBjYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZ292ZXInKTtcclxuXHJcbiAgICAgICAgbXNnKFwiZHJvcFwiKTtcclxuICAgICAgICBjb25zdCBkdCA9IGV2LmRhdGFUcmFuc2ZlcjtcclxuICAgICAgICBpZihkdCA9PSBudWxsKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZmlsZXMgPSBBcnJheS5mcm9tKGR0LmZpbGVzKTtcclxuXHJcbiAgICAgICAgbXNnKGAke2ZpbGVzfWApO1xyXG5cclxuICAgICAgICBpZihmaWxlcy5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBmaWxlc1swXTtcclxuXHJcbiAgICAgICAgICAgIG1zZyhgRmlsZSBuYW1lOiAke2ZpbGUubmFtZX0sIEZpbGUgc2l6ZTogJHtmaWxlLnNpemV9LCBGaWxlIHR5cGU6ICR7ZmlsZS50eXBlfWApO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBhc3luYygpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSByZWFkZXIucmVzdWx0IGFzIHN0cmluZztcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9iaiAgPSBKU09OLnBhcnNlKGpzb24pO1xyXG5cclxuICAgICAgICAgICAgICAgIGFzc2VydChBcnJheS5pc0FycmF5KG9iaikpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG1zZyhgZHJvcHBlZDpbJHtKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKX1dYCk7XHJcbiAgICAgICAgICAgICAgICBsb2FkSnNvbihvYmogYXMgYW55W10pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlcGFpbnRfY291bnQgPSByZXBhaW50Q291bnQ7XHJcbiAgICAgICAgICAgICAgICBDYW52YXMub25lLnJlcXVlc3RVcGRhdGVDYW52YXMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBwb3J0IHBvc2l0aW9ucyBhcmUgc2V0IG9uIHBhaW5nLlxyXG4gICAgICAgICAgICAgICAgLy8gZWRnZXMgY2FuIGJlIGRyYXduIGFmdGVyIHBvcnQgcG9zaXRpb24gc2V0dGluZ3MuXHJcbiAgICAgICAgICAgICAgICB3aGlsZShyZXBhaW50X2NvdW50ID09IHJlcGFpbnRDb3VudCl7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgc2xlZXAoMTAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBkcmF3IGlucHV0IGVsZW1lbnRzIGluIGJsb2Nrcy5cclxuICAgICAgICAgICAgICAgIE1haW4ub25lLmVkaXRvci5ibG9ja3MuZm9yRWFjaCh4ID0+IHguc2V0UG9zaXRpb24oeC5wb3NpdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgQ2FudmFzLm9uZS5yZXF1ZXN0VXBkYXRlQ2FudmFzKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlKTsgICAgICAgIFxyXG5cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfSk7ICAgIFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUpzb24oKXtcclxuICAgIGxldCBwb3J0X2lkeCA9IDA7XHJcblxyXG4gICAgY29uc3QgYmxvY2tzID0gTWFpbi5vbmUuZWRpdG9yLmJsb2NrcztcclxuICAgIGZvcihjb25zdCBbaWR4LCBibG9ja10gb2YgYmxvY2tzLmVudHJpZXMoKSl7XHJcbiAgICAgICAgYmxvY2suaWR4ID0gaWR4O1xyXG5cclxuICAgICAgICBmb3IoY29uc3QgcG9ydCBvZiBibG9jay5wb3J0cyl7XHJcbiAgICAgICAgICAgIHBvcnQuaWR4ID0gcG9ydF9pZHgrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QganNvbiA9IGJsb2Nrcy5tYXAoeCA9PiB4Lm1ha2VPYmooKSk7XHJcbiAgICBkb3dubG9hZEpzb24oanNvbik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRKc29uKG9ianM6YW55W10pe1xyXG4gICAgY29uc3QgYmxvY2tfbWFwID0gbmV3IE1hcDxudW1iZXIsIEJsb2NrPigpO1xyXG4gICAgY29uc3QgcG9ydF9tYXAgPSBuZXcgTWFwPG51bWJlciwgUG9ydD4oKTtcclxuXHJcbiAgICBmb3IoY29uc3Qgb2JqIG9mIG9ianMpe1xyXG4gICAgICAgIG1zZyhgYmxvY2s6WyR7b2JqLnR5cGVOYW1lfV1gKTtcclxuICAgICAgICBjb25zdCBibG9jayA9IG1ha2VCbG9ja0J5VHlwZU5hbWUob2JqLnR5cGVOYW1lKTtcclxuICAgICAgICBibG9jay5sb2FkT2JqKG9iaik7XHJcblxyXG4gICAgICAgIGJsb2NrLmlkeCAgICAgICAgPSBvYmouaWR4O1xyXG4gICAgICAgIGJsb2NrLnBvc2l0aW9uLnggPSBvYmoueDtcclxuICAgICAgICBibG9jay5wb3NpdGlvbi55ID0gb2JqLnk7XHJcbiAgICAgICAgYmxvY2suc2V0TWluU2l6ZSgpO1xyXG4gICAgICAgIGJsb2NrLmJveFNpemUgPSBibG9jay5taW5TaXplIS5jb3B5KCk7XHJcblxyXG4gICAgICAgIGJsb2NrX21hcC5zZXQoYmxvY2suaWR4LCBibG9jayk7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBbcG9ydF9pZHgsIHBvcnRfb2JqXSBvZiBvYmoucG9ydHMuZW50cmllcygpKXtcclxuICAgICAgICAgICAgY29uc3QgcG9ydCA9IGJsb2NrLnBvcnRzW3BvcnRfaWR4XTtcclxuICAgICAgICAgICAgcG9ydC5pZHggPSBwb3J0X29iai5pZHg7XHJcblxyXG4gICAgICAgICAgICBwb3J0X21hcC5zZXQocG9ydC5pZHgsIHBvcnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgTWFpbi5vbmUuZWRpdG9yLmFkZEJsb2NrKGJsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IoY29uc3Qgb2JqIG9mIG9ianMpe1xyXG4gICAgICAgIGNvbnN0IGJsb2NrID0gYmxvY2tfbWFwLmdldChvYmouaWR4KSE7XHJcbiAgICAgICAgYXNzZXJ0KGJsb2NrICE9IHVuZGVmaW5lZCk7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBbcG9ydF9pZHgsIHBvcnRfb2JqXSBvZiBvYmoucG9ydHMuZW50cmllcygpKXtcclxuICAgICAgICAgICAgY29uc3QgcG9ydCA9IGJsb2NrLnBvcnRzW3BvcnRfaWR4XTtcclxuXHJcbiAgICAgICAgICAgIGZvcihjb25zdCBkc3RfcG9ydF9pZHggb2YgcG9ydF9vYmouZGVzdGluYXRpb25zKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRzdF9wb3J0ID0gcG9ydF9tYXAuZ2V0KGRzdF9wb3J0X2lkeCkhO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGRzdF9wb3J0ICE9IHVuZGVmaW5lZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcG9ydC5jb25uZWN0KGRzdF9wb3J0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjYW52YXMgPSBNYWluLm9uZS5jYW52YXM7XHJcbiAgICBzZXRDb250ZXh0MkQoY2FudmFzLmN0eCwgY2FudmFzLnJvb3QpO1xyXG59XHJcbn0iLCJuYW1lc3BhY2UgZGlhZ3JhbV90cyB7XHJcbi8vXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZXN0QmxvY2sgZXh0ZW5kcyBCbG9jayB7XHJcbiAgICBpbm5lckJsb2NrKCkgOiBCbG9jayB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgbGV0IHBvcnQgOiBQb3J0O1xyXG5cclxuICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgSWZCbG9jayl7XHJcbiAgICAgICAgICAgIHBvcnQgPSB0aGlzLnRydWVQb3J0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHRoaXMgaW5zdGFuY2VvZiBJbmZpbml0ZUxvb3Ape1xyXG4gICAgICAgICAgICBwb3J0ID0gdGhpcy5sb29wUG9ydDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzc2VydChwb3J0LnR5cGUgPT0gUG9ydFR5cGUuYm90dG9tKTtcclxuXHJcbiAgICAgICAgaWYocG9ydC5kZXN0aW5hdGlvbnMubGVuZ3RoID09IDApe1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gcG9ydC5kZXN0aW5hdGlvbnNbMF0ucGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpbm5lckJsb2Nrc0hlaWdodCgpIDogbnVtYmVyIHtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gMDtcclxuXHJcbiAgICAgICAgZm9yKGxldCBibG9jayA9IHRoaXMuaW5uZXJCbG9jaygpOyBibG9jayAhPSB1bmRlZmluZWQ7IGJsb2NrID0gYmxvY2submV4dEJsb2NrKCkpe1xyXG4gICAgICAgICAgICBpZihoZWlnaHQgIT0gMCl7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgLT0gbm90Y2hSYWRpdXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGhlaWdodCArPSBibG9jay5jYWxjSGVpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGhlaWdodCAhPSAwKXtcclxuICAgICAgICAgICAgbXNnKGBpbm5lciBibG9ja3MgaWQ6JHt0aGlzLmlkeH0gaDoke2hlaWdodH1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMTUwLCBuZXN0X2gxMjMpO1xyXG5cclxuICAgICAgICBmb3IobGV0IGJsb2NrID0gdGhpcy5pbm5lckJsb2NrKCk7IGJsb2NrICE9IHVuZGVmaW5lZDsgYmxvY2sgPSBibG9jay5uZXh0QmxvY2soKSl7XHJcbiAgICAgICAgICAgIGJsb2NrLnNldE1pblNpemUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWluU2l6ZS55ICs9IHRoaXMuaW5uZXJCbG9ja3NIZWlnaHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjSGVpZ2h0KCkgOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBuZXN0X2gxMjMgKyB0aGlzLmlubmVyQmxvY2tzSGVpZ2h0KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJZkJsb2NrIGV4dGVuZHMgTmVzdEJsb2NrIHsgICBcclxuICAgIHRvcFBvcnQgICAgICAgPSBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS50b3ApO1xyXG4gICAgYm90dG9tUG9ydCAgICA9IG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmJvdHRvbSk7XHJcbiAgICB0cnVlUG9ydCAgICAgID0gbmV3IFBvcnQodGhpcywgUG9ydFR5cGUuYm90dG9tKTtcclxuXHJcbiAgICBjb25kaXRpb25Qb3J0ID0gbmV3IFBvcnQodGhpcywgUG9ydFR5cGUuaW5wdXRQb3J0KTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgXHJcbiAgICAgICAgICAgIHRoaXMudG9wUG9ydCwgXHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tUG9ydCwgXHJcbiAgICAgICAgICAgIHRoaXMudHJ1ZVBvcnQsXHJcbiAgICAgICAgICAgIHRoaXMuY29uZGl0aW9uUG9ydFxyXG4gICAgICAgIF07XHJcbiAgICB9XHJcblxyXG4gICAgaXNUcnVlKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25Qb3J0LnZhbHVlID09IDE7XHJcbiAgICB9XHJcblxyXG4gICAgdHJ1ZUJsb2NrKCkgOiBCbG9jayB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5uZXJCbG9jaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKXtcclxuICAgICAgICBjb25zdCBbcG9zLCBzaXplXSA9IHRoaXMuZHJhd0JveCgpO1xyXG4gICAgICAgIGNvbnN0IHgxID0gcG9zLnggKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcbiAgICAgICAgY29uc3QgeTEgPSBwb3MueSArIHRoaXMuYm9yZGVyV2lkdGggKyBibG9ja0xpbmVXaWR0aDtcclxuXHJcbiAgICAgICAgY29uc3QgeDIgPSB4MSArIDM1O1xyXG4gICAgICAgIGNvbnN0IHgzID0geDIgKyAzNTtcclxuICAgICAgICBjb25zdCB4NCA9IHgxICsgdGhpcy5taW5TaXplIS54O1xyXG5cclxuICAgICAgICBjb25zdCB5MiA9IHkxICsgbmVzdF9oMTtcclxuICAgICAgICBjb25zdCB5MyA9IHkyICsgbmVzdF9oMiArIHRoaXMuaW5uZXJCbG9ja3NIZWlnaHQoKTtcclxuICAgICAgICBjb25zdCB5NCA9IHkzICsgbmVzdF9oMyAtIG5vdGNoUmFkaXVzO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5kcmF3T3V0bGluZShbXHJcbiAgICAgICAgICAgIC8vIGxlZnQgdG9wXHJcbiAgICAgICAgICAgIFt4MSwgeTEsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgLy8gbGVmdCBib3R0b21cclxuICAgICAgICAgICAgW3gxLCB5NCwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICAvLyBib3R0b20gbm90Y2hcclxuICAgICAgICAgICAgW3gyLCB5NCwgdGhpcy5ib3R0b21Qb3J0XSxcclxuXHJcbiAgICAgICAgICAgIC8vIHJpZ2h0IGJvdHRvbVxyXG4gICAgICAgICAgICBbeDQsIHk0LCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIFt4NCwgeTMsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDIsIHkzLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIFt4MiwgeTIsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgLy8gbG9vcCBub3RjaFxyXG4gICAgICAgICAgICBbeDMsIHkyLCB0aGlzLnRydWVQb3J0XSxcclxuICAgICAgICAgICAgW3g0LCB5MiwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICAvLyByaWdodCB0b3BcclxuICAgICAgICAgICAgW3g0LCB5MSwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICAvLyB0b3Agbm90Y2hcclxuICAgICAgICAgICAgW3gyLCB5MSwgdGhpcy50b3BQb3J0XVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmRpdGlvblBvcnQuZHJhd1BvcnQodGhpcy5jdHgsIHg0IC0gUG9ydC5yYWRpdXMsIDAuNSAqICh5MSArIHkyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuKCl7XHJcbiAgICAgICAgY29uc3QgdHJ1ZV9ibG9jayA9IHRoaXMudHJ1ZUJsb2NrKCk7XHJcbiAgICAgICAgaWYodHJ1ZV9ibG9jayAhPSB1bmRlZmluZWQgJiYgdGhpcy5pc1RydWUoKSl7XHJcbiAgICAgICAgICAgIGF3YWl0IHJ1bkJsb2NrQ2hhaW4odHJ1ZV9ibG9jayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSW5maW5pdGVMb29wIGV4dGVuZHMgTmVzdEJsb2NrIHtcclxuICAgIHRvcFBvcnQgID0gbmV3IFBvcnQodGhpcywgUG9ydFR5cGUudG9wKTtcclxuICAgIGxvb3BQb3J0ID0gbmV3IFBvcnQodGhpcywgUG9ydFR5cGUuYm90dG9tKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgXHJcbiAgICAgICAgICAgIHRoaXMudG9wUG9ydCwgXHJcbiAgICAgICAgICAgIHRoaXMubG9vcFBvcnQgXHJcbiAgICAgICAgXTtcclxuICAgIH1cclxuXHJcbiAgICBsb29wQmxvY2soKSA6IEJsb2NrIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbm5lckJsb2NrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIGNvbnN0IFtwb3MsIHNpemVdID0gdGhpcy5kcmF3Qm94KCk7XHJcbiAgICAgICAgY29uc3QgeDEgPSBwb3MueCArIHRoaXMuYm9yZGVyV2lkdGggKyBibG9ja0xpbmVXaWR0aDtcclxuICAgICAgICBjb25zdCB5MSA9IHBvcy55ICsgdGhpcy5ib3JkZXJXaWR0aCArIGJsb2NrTGluZVdpZHRoO1xyXG5cclxuICAgICAgICBjb25zdCB4MiA9IHgxICsgMzU7XHJcbiAgICAgICAgY29uc3QgeDMgPSB4MiArIDM1O1xyXG4gICAgICAgIGNvbnN0IHg0ID0geDEgKyB0aGlzLm1pblNpemUhLng7XHJcblxyXG4gICAgICAgIGNvbnN0IHkyID0geTEgKyBuZXN0X2gxO1xyXG4gICAgICAgIGNvbnN0IHkzID0geTIgKyBuZXN0X2gyICsgdGhpcy5pbm5lckJsb2Nrc0hlaWdodCgpO1xyXG4gICAgICAgIGNvbnN0IHk0ID0geTMgKyBuZXN0X2gzO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5kcmF3T3V0bGluZShbXHJcbiAgICAgICAgICAgIFt4MSwgeTEsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3gxLCB5NCwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4NCwgeTQsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3g0LCB5MywgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTMsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3gyLCB5MiwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MywgeTIsIHRoaXMubG9vcFBvcnRdLFxyXG4gICAgICAgICAgICBbeDQsIHkyLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIFt4NCwgeTEsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDIsIHkxLCB0aGlzLnRvcFBvcnRdXHJcbiAgICAgICAgXSlcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBydW4oKXtcclxuICAgICAgICBjb25zdCBsb29wX2Jsb2NrID0gdGhpcy5sb29wQmxvY2soKTtcclxuICAgICAgICBpZihsb29wX2Jsb2NrICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHdoaWxlKHRydWUpe1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgcnVuQmxvY2tDaGFpbihsb29wX2Jsb2NrKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihzdG9wRmxhZyl7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYXdhaXQgc2xlZXAoMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxufSJdfQ==