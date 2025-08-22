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
        speech;
        constructor(data) {
            super(data);
            this.ports = [
                new diagram_ts.Port(this, PortType.top),
                new diagram_ts.Port(this, PortType.bottom)
            ];
            this.input.value = "こんにちは!どうぞよろしく!";
            i18n_ts.setVoiceLanguageCode("jpn");
            this.speech = new diagram_ts.Speech();
        }
        setMinSize() {
            this.minSize = new diagram_ts.Vec2(300, 50);
        }
        draw() {
            this.drawActionBlock();
            this.drawIcon(diagram_ts.ttsIcon);
        }
        async run() {
            await this.speech.speak_waitEnd(this.input.value.trim());
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
        startButton = diagram_ts.$("start-btn");
        startButton.addEventListener("click", async (ev) => {
            if (isRunning) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL2V4cG9ydC50cyIsIi4uLy4uLy4uL3RzL3VpLnRzIiwiLi4vLi4vLi4vdHMvYmxvY2sudHMiLCIuLi8uLi8uLi90cy9jYW52YXMudHMiLCIuLi8uLi8uLi90cy9kaWFncmFtLnRzIiwiLi4vLi4vLi4vdHMvZGlhZ3JhbV91dGlsLnRzIiwiLi4vLi4vLi4vdHMvanNvbi11dGlsLnRzIiwiLi4vLi4vLi4vdHMvcHJvY2VkdXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFVLFVBQVUsQ0F5RG5CO0FBekRELFdBQVUsVUFBVTtJQUNwQixFQUFFO0lBQ1csa0JBQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzFCLGlCQUFNLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN6QixjQUFHLEdBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUN0QixnQkFBSyxHQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDeEIsaUJBQU0sR0FBSSxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ3pCLHNCQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUNsQyxtQkFBUSxHQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUM7SUFDL0IsZ0JBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3RCLGlCQUFNLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN6QixZQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUVkLGVBQUksR0FBTSxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3ZCLGlCQUFNLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN6QixpQkFBTSxHQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDekIsb0JBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBRTlCLGNBQUcsR0FBSSxPQUFPLENBQUMsR0FBRyxDQUFDO0lBQ25CLGVBQUksR0FBSSxP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QUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxXQUFBLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELFdBQVcsQ0FBQyxRQUFlO1lBQ3ZCLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFNUIsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFbkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQy9DLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUVsRCxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBQSxjQUFjLEdBQUcsQ0FBQyxHQUFHLFdBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN2RSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBRTNCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBSSxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBRWxDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBSSxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBRXJDLElBQUksQ0FBQyxRQUFRLENBQUMs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QUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsSUFBRyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQztnQkFDWixLQUFLLEdBQUcsV0FBQSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUIsQ0FBQztpQkFDSSxJQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBQyxDQUFDO2dCQUNqQixLQUFLLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUQsQ0FBQztpQkFDSSxJQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBQyxDQUFDO2dCQUNqQixLQUFLLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxDQUFDO2lCQUNJLElBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFDLENBQUM7Z0JBQ2hCLEtBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsQ0FBQztpQkFDSSxJQUFHLEdBQUcsQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFDLENBQUM7Z0JBQ3pCLEtBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsQ0FBQztpQkFDSSxJQUFHLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxFQUFDLENBQUM7Z0JBQ3hCLEtBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMs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LEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDO2dCQUVkLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUM7Z0JBQ2QsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQztnQkFFZCxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDO2dCQUNkLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUM7Z0JBRWQsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQztnQkFDZCxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDdkIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQztnQkFFZCxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDO2dCQUNkLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3pCLENBQUMsQ0FBQTtRQUNOLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRztZQUNMLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNwQyxJQUFHLFVBQVUsSUFBSSxTQUFTLEVBQUMsQ0FBQztnQkFDeEIsT0FBTSxJQUFJLEVBQUMsQ0FBQztvQkFDUixNQUFNLFdBQUEsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUVoQyxJQUFHLFdBQUEsUUFBUSxFQUFDLENBQUM7d0JBQ1QsTUFBTTtvQkFDVixDQUFDO29CQUVELE1BQU0sV0FBQSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztLQUNKO0lBOURZLHVCQUFZLGVBOER4QixDQUFBO0FBRUQsQ0FBQyxFQXpNUyxVQUFVLEtBQVYsVUFBVSxRQXlNbkIiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgZGlhZ3JhbV90cyB7XHJcbi8vXHJcbmV4cG9ydCBjb25zdCBNeUVycm9yID0gaTE4bl90cy5NeUVycm9yO1xyXG5leHBvcnQgY29uc3QgYXNzZXJ0ICA9IGkxOG5fdHMuYXNzZXJ0O1xyXG5leHBvcnQgY29uc3QgbXNnICAgICA9IGkxOG5fdHMubXNnO1xyXG5leHBvcnQgY29uc3QgcmFuZ2UgICA9IGkxOG5fdHMucmFuZ2U7XHJcbmV4cG9ydCBjb25zdCByYW5nZTIgID0gaTE4bl90cy5yYW5nZTI7XHJcbmV4cG9ydCBjb25zdCBzZXRQbGF5TW9kZSA9IGkxOG5fdHMuc2V0UGxheU1vZGU7XHJcbmV4cG9ydCBjb25zdCBQbGF5TW9kZSAgICA9IGkxOG5fdHMuUGxheU1vZGU7XHJcbmV4cG9ydCBjb25zdCBzbGVlcCA9IGkxOG5fdHMuc2xlZXA7XHJcbmV4cG9ydCBjb25zdCBhcHBlbmQgID0gaTE4bl90cy5hcHBlbmQ7XHJcbmV4cG9ydCBjb25zdCAkID0gaTE4bl90cy4kO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxhc3QgICAgPSBpMThuX3RzLmxhc3Q7XHJcbmV4cG9ydCBjb25zdCB1bmlxdWUgID0gaTE4bl90cy51bmlxdWU7XHJcbmV4cG9ydCBjb25zdCByZW1vdmUgID0gaTE4bl90cy5yZW1vdmU7XHJcbmV4cG9ydCBjb25zdCBhcnJheUZpbGwgPSBpMThuX3RzLmFycmF5RmlsbDtcclxuXHJcbmV4cG9ydCBjb25zdCBzdW0gID0gaTE4bl90cy5zdW07XHJcbmV4cG9ydCBjb25zdCBsaXN0ICA9IGkxOG5fdHMubGlzdDtcclxuZXhwb3J0IGNvbnN0IGludGVyc2VjdGlvbiAgPSBpMThuX3RzLmludGVyc2VjdGlvbjtcclxuZXhwb3J0IGNvbnN0IHBlcm11dGF0aW9uICA9IGkxOG5fdHMucGVybXV0YXRpb247XHJcbmV4cG9ydCBjb25zdCBjaXJjdWxhclBlcm11dGF0aW9uICA9IGkxOG5fdHMuY2lyY3VsYXJQZXJtdXRhdGlvbjtcclxuZXhwb3J0IGNvbnN0IGFyZVNldHNFcXVhbCAgPSBpMThuX3RzLmFyZVNldHNFcXVhbDtcclxuZXhwb3J0IGNvbnN0IGlzU3ViU2V0ICA9IGkxOG5fdHMuaXNTdWJTZXQ7XHJcbmV4cG9ydCBjb25zdCBjaGVjayA9IGkxOG5fdHMuY2hlY2s7XHJcbmV4cG9ydCB0eXBlICBTcGVlY2ggPSBpMThuX3RzLlNwZWVjaDtcclxuXHJcbmV4cG9ydCB0eXBlIEFic3RyYWN0U3BlZWNoID0gaTE4bl90cy5BYnN0cmFjdFNwZWVjaDtcclxuZXhwb3J0IGNvbnN0IFNwZWVjaCA9IGkxOG5fdHMuU3BlZWNoO1xyXG5cclxuZXhwb3J0IGNvbnN0IHBhcnNlTWF0aCA9IHBhcnNlcl90cy5wYXJzZU1hdGg7XHJcbmV4cG9ydCBjb25zdCByZW5kZXJLYXRleFN1YiA9IHBhcnNlcl90cy5yZW5kZXJLYXRleFN1YjtcclxuZXhwb3J0IGNvbnN0IHNob3dGbG93ID0gcGFyc2VyX3RzLnNob3dGbG93O1xyXG5leHBvcnQgY29uc3QgbWFrZUlkVG9UZXJtTWFwID0gcGFyc2VyX3RzLm1ha2VJZFRvVGVybU1hcDtcclxuXHJcbmV4cG9ydCB0eXBlICBSYXRpb25hbCA9IHBhcnNlcl90cy5SYXRpb25hbDtcclxuZXhwb3J0IGNvbnN0IFJhdGlvbmFsID0gcGFyc2VyX3RzLlJhdGlvbmFsO1xyXG5cclxuZXhwb3J0IHR5cGUgIFRlcm0gPSBwYXJzZXJfdHMuVGVybTtcclxuZXhwb3J0IGNvbnN0IFRlcm0gPSBwYXJzZXJfdHMuVGVybTtcclxuXHJcbmV4cG9ydCB0eXBlICBDb25zdE51bSA9IHBhcnNlcl90cy5Db25zdE51bTtcclxuZXhwb3J0IGNvbnN0IENvbnN0TnVtID0gcGFyc2VyX3RzLkNvbnN0TnVtO1xyXG5cclxuZXhwb3J0IHR5cGUgIEFwcCA9IHBhcnNlcl90cy5BcHA7XHJcbmV4cG9ydCBjb25zdCBBcHAgPSBwYXJzZXJfdHMuQXBwO1xyXG5cclxuZXhwb3J0IHR5cGUgIFJlZlZhciA9IHBhcnNlcl90cy5SZWZWYXI7XHJcbmV4cG9ydCBjb25zdCBSZWZWYXIgPSBwYXJzZXJfdHMuUmVmVmFyO1xyXG5cclxuZXhwb3J0IGNvbnN0IG9wZXJhdG9yID0gcGFyc2VyX3RzLm9wZXJhdG9yO1xyXG5cclxuZXhwb3J0IHR5cGUgIFZlYzIgPSBwbGFuZV90cy5WZWMyO1xyXG5leHBvcnQgY29uc3QgVmVjMiA9IHBsYW5lX3RzLlZlYzI7XHJcblxyXG5cclxufSIsIm5hbWVzcGFjZSBkaWFncmFtX3RzIHtcclxuLy9cclxuY29uc3QgQVVUTyA9IFwiYXV0b1wiO1xyXG5jb25zdCBUZXh0U2l6ZUZpbGwgPSA4O1xyXG5leHBvcnQgY29uc3QgdGV4dENvbG9yID0gXCJibGFja1wiO1xyXG5cclxuZnVuY3Rpb24gcmF0aW8od2lkdGggOiBzdHJpbmcpIDogbnVtYmVyIHtcclxuICAgIHdpZHRoID0gd2lkdGgudHJpbSgpO1xyXG4gICAgYXNzZXJ0KHdpZHRoLmVuZHNXaXRoKFwiJVwiKSk7XHJcbiAgICBjb25zdCBudW1fc3RyID0gd2lkdGguc3Vic3RyaW5nKDAsIHdpZHRoLmxlbmd0aCAtIDEpO1xyXG5cclxuICAgIGNvbnN0IG51bSA9IHBhcnNlRmxvYXQobnVtX3N0cik7XHJcblxyXG4gICAgcmV0dXJuIG51bSAvIDEwMDtcclxufVxyXG5cclxuZnVuY3Rpb24gcGl4ZWwobGVuZ3RoIDogc3RyaW5nLCAgcmVtYWluaW5nX2xlbmd0aD8gOiBudW1iZXIpIDogbnVtYmVyIHtcclxuICAgIGlmKGxlbmd0aCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGlmKGxlbmd0aC5lbmRzV2l0aChcInB4XCIpKXtcclxuICAgICAgICAgICAgY29uc3QgbnVtX3N0ciA9IGxlbmd0aC5zdWJzdHJpbmcoMCwgbGVuZ3RoLmxlbmd0aCAtIDIpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobnVtX3N0cik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYobGVuZ3RoLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgIGlmKHJlbWFpbmluZ19sZW5ndGggIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiByYXRpbyhsZW5ndGgpICogcmVtYWluaW5nX2xlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldENvbnRleHQyRChjdHggOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHVpIDogVUkpe1xyXG4gICAgdWkuY3R4ID0gY3R4O1xyXG4gICAgdWkuY2hpbGRyZW4oKS5mb3JFYWNoKGNoaWxkID0+IHNldENvbnRleHQyRChjdHgsIGNoaWxkKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQXR0ciB7XHJcbiAgICBjbGFzc05hbWU/IDogc3RyaW5nO1xyXG4gICAgb2JqPyA6IGFueTtcclxuICAgIG5hbWU/IDogc3RyaW5nO1xyXG4gICAgcG9zaXRpb24/IDogc3RyaW5nO1xyXG4gICAgbWFyZ2luPyA6IG51bWJlcltdO1xyXG4gICAgY29sb3I/IDogc3RyaW5nO1xyXG4gICAgYmFja2dyb3VuZENvbG9yPyA6IHN0cmluZztcclxuICAgIGJvcmRlclN0eWxlPyA6IHN0cmluZztcclxuICAgIGJvcmRlcldpZHRoPyA6IG51bWJlcjtcclxuICAgIHBhZGRpbmc/IDogbnVtYmVyW107XHJcbiAgICBwYWRkaW5nTGVmdD8gOiBzdHJpbmc7XHJcbiAgICB2ZXJ0aWNhbEFsaWduPyA6IHN0cmluZztcclxuICAgIGhvcml6b250YWxBbGlnbj8gOiBzdHJpbmc7XHJcbiAgICBjb2xzcGFuPyA6IG51bWJlcjtcclxuICAgIHdpZHRoPyA6IHN0cmluZztcclxuICAgIGhlaWdodD8gOiBzdHJpbmc7XHJcbiAgICBkaXNhYmxlZD8gOiBib29sZWFuO1xyXG4gICAgdmlzaWJpbGl0eT8gOiBzdHJpbmc7XHJcbiAgICBpblRvb2xib3g/ICAgOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRleHRBdHRyIGV4dGVuZHMgQXR0ciB7XHJcbiAgICB0ZXh0PyA6IHN0cmluZztcclxuICAgIGZvbnRTaXplPyA6IHN0cmluZztcclxuICAgIHRleHRBbGlnbj8gOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnV0dG9uQXR0ciBleHRlbmRzIFRleHRBdHRyIHtcclxuICAgIGNsaWNrIDogKCk9PlByb21pc2U8dm9pZD47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgR3JpZEF0dHIgZXh0ZW5kcyBBdHRyIHtcclxuICAgIGNvbHVtbnM/OiBzdHJpbmc7XHJcbiAgICByb3dzPyAgIDogc3RyaW5nO1xyXG4gICAgY2VsbHMgOiBVSVtdW107XHJcbn1cclxuXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVUkge1xyXG4gICAgc3RhdGljIGNvdW50IDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBpZHggOiBudW1iZXI7XHJcbiAgICBjdHghIDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG4gICAgcG9zaXRpb24gOiBWZWMyID0gVmVjMi56ZXJvKCk7XHJcbiAgICBib3hTaXplICA6IFZlYzIgPSBWZWMyLnplcm8oKTtcclxuICAgIHdpZHRoPyA6IHN0cmluZztcclxuICAgIGhlaWdodD8gOiBzdHJpbmc7XHJcbiAgICBtaW5TaXplIDogVmVjMiB8IHVuZGVmaW5lZDtcclxuICAgIGNvbHNwYW4gOiBudW1iZXIgPSAxO1xyXG4gICAgcm93c3BhbiA6IG51bWJlciA9IDE7XHJcbiAgICBtYXJnaW4gOiBudW1iZXJbXSA9IFsgNCwgNCwgNCwgNCBdOyAgICAgLy8gbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tXHJcbiAgICBib3JkZXJXaWR0aCA6IG51bWJlciA9IDM7XHJcbiAgICBwYWRkaW5nIDogbnVtYmVyW10gPSBbIDAsIDAsIDAsIDAgXTsgICAgLy8gbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tXHJcblxyXG4gICAgaG9yaXpvbnRhbEFsaWduPyA6IHN0cmluZztcclxuICAgIGJhY2tncm91bmRDb2xvcj8gOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHRoaXMuaWR4ID0gKytVSS5jb3VudDtcclxuICAgICAgICBpZihkYXRhLmNvbHNwYW4gIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy5jb2xzcGFuID0gZGF0YS5jb2xzcGFuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IGRhdGEuYmFja2dyb3VuZENvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIGNoaWxkcmVuKCkgOiBVSVtdIHtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9ICAgIFxyXG5cclxuICAgIGdldEFsbFVJU3ViKHVpcyA6IFVJW10pe1xyXG4gICAgICAgIHVpcy5wdXNoKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4oKS5mb3JFYWNoKHggPT4geC5nZXRBbGxVSVN1Yih1aXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBbGxVSSgpIDogVUlbXSB7XHJcbiAgICAgICAgbGV0IHVpcyA6IFVJW10gPSBbXTtcclxuICAgICAgICB0aGlzLmdldEFsbFVJU3ViKHVpcyk7XHJcblxyXG4gICAgICAgIHJldHVybiB1aXM7XHJcbiAgICB9XHJcblxyXG4gICAgbWFyZ2luV2lkdGgoKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFyZ2luWzBdICsgdGhpcy5tYXJnaW5bMV07XHJcbiAgICB9XHJcblxyXG4gICAgbWFyZ2luSGVpZ2h0KCkgOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcmdpblsyXSArIHRoaXMubWFyZ2luWzNdO1xyXG4gICAgfVxyXG5cclxuICAgIG1hcmdpbkJvcmRlclBhZGRpbmdXaWR0aCgpIDogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXJnaW5bMF0gKyB0aGlzLm1hcmdpblsxXSArIDIgKiB0aGlzLmJvcmRlcldpZHRoICsgdGhpcy5wYWRkaW5nWzBdICsgdGhpcy5wYWRkaW5nWzFdO1xyXG4gICAgfVxyXG5cclxuICAgIG1hcmdpbkJvcmRlclBhZGRpbmdIZWlnaHQoKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFyZ2luWzJdICsgdGhpcy5tYXJnaW5bM10gKyAyICogdGhpcy5ib3JkZXJXaWR0aCArIHRoaXMucGFkZGluZ1syXSArIHRoaXMucGFkZGluZ1szXTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBWZWMyLnplcm8oKTtcclxuICAgICAgICBtc2coYHNldC1taW4tc2l6ZToke3RoaXMuY29uc3RydWN0b3IubmFtZX1gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRNaW5XaWR0aCgpIDogbnVtYmVyIHsgICAgICAgXHJcbiAgICAgICAgYXNzZXJ0KHRoaXMubWluU2l6ZSAhPSB1bmRlZmluZWQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pblNpemUhLng7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TWluSGVpZ2h0KCkgOiBudW1iZXIge1xyXG4gICAgICAgIGFzc2VydCh0aGlzLm1pblNpemUgIT0gdW5kZWZpbmVkKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5taW5TaXplIS55O1xyXG4gICAgfVxyXG5cclxuICAgIHNldFBvc2l0aW9uKHBvc2l0aW9uIDogVmVjMikgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgbGF5b3V0KHggOiBudW1iZXIsIHkgOiBudW1iZXIsIHNpemUgOiBWZWMyLCBuZXN0IDogbnVtYmVyKXtcclxuICAgICAgICB0aGlzLmJveFNpemUgPSBzaXplO1xyXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24obmV3IFZlYzIoeCwgeSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdCb3goKSA6IFtWZWMyLCBWZWMyXSB7XHJcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zaXRpb24ueCArIHRoaXMubWFyZ2luWzBdO1xyXG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLm1hcmdpblsyXTtcclxuICAgICAgICBjb25zdCB3ID0gdGhpcy5ib3hTaXplLnggLSB0aGlzLm1hcmdpbldpZHRoKCk7XHJcbiAgICAgICAgY29uc3QgaCA9IHRoaXMuYm94U2l6ZS55IC0gdGhpcy5tYXJnaW5IZWlnaHQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFsgbmV3IFZlYzIoeCwgeSksIG5ldyBWZWMyKHcsIGgpIF07XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIGNvbnN0IFtwb3MsIHNpemVdID0gdGhpcy5kcmF3Qm94KCk7XHJcbiAgICAgICAgdGhpcy5kcmF3UmlkZ2VSZWN0Mih0aGlzLmN0eCwgcG9zLngsIHBvcy55LCBzaXplLngsIHNpemUueSwgdGhpcy5ib3JkZXJXaWR0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RyKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIGlmKHRoaXMubWluU2l6ZSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgd2lkdGggID0gKHRoaXMud2lkdGggICE9IHVuZGVmaW5lZCA/IGB3aWR0aDoke3RoaXMud2lkdGh9IGAgIDogXCJcIik7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gKHRoaXMuaGVpZ2h0ICE9IHVuZGVmaW5lZCA/IGBoZWlnaHQ6JHt0aGlzLmhlaWdodH0gYCA6IFwiXCIpO1xyXG4gICAgICAgIGNvbnN0IG1pblNpemUgPSAodGhpcy5taW5TaXplIT0gdW5kZWZpbmVkID8gYG1pbi1zaXplOiR7dGhpcy5taW5TaXplLngudG9GaXhlZCgpfSwgJHt0aGlzLm1pblNpemUueS50b0ZpeGVkKCl9IGAgOiBcIlwiKTtcclxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGBwb3M6KCR7dGhpcy5wb3NpdGlvbi54fSwke3RoaXMucG9zaXRpb24ueX0pIGA7XHJcbiAgICAgICAgY29uc3QgYm94U2l6ZSA9IGBib3g6KCR7dGhpcy5ib3hTaXplLnh9LCR7dGhpcy5ib3hTaXplLnl9KSBgO1xyXG5cclxuICAgICAgICByZXR1cm4gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAke3dpZHRofSR7aGVpZ2h0fSR7bWluU2l6ZX0ke3Bvc2l0aW9ufSR7Ym94U2l6ZX1gO1xyXG4gICAgfVxyXG5cclxuICAgIGR1bXAobmVzdCA6IG51bWJlcil7XHJcbiAgICAgICAgbXNnKGAke1wiIFwiLnJlcGVhdChuZXN0ICogNCl9JHt0aGlzLnN0cigpfWApO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBkcmF3UmlkZ2VSZWN0MihjdHggOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHggOiBudW1iZXIsIHkgOiBudW1iZXIsIHdpZHRoIDogbnVtYmVyLCBoZWlnaHQgOiBudW1iZXIsIHJpZGdlV2lkdGggOiBudW1iZXIsIGlzSW5zZXQgPSBmYWxzZSkge1xyXG4gICAgICAgIC8vIERlZmluZSBsaWdodCBhbmQgZGFyayBjb2xvcnNcclxuICAgICAgICAvLyBjb25zdCBsaWdodENvbG9yID0gaXNJbnNldCA/ICcjODg4JyA6ICcjZWVlJzsgLy8gRGFya2VyIGZvciBpbnNldCB0b3AvbGVmdFxyXG4gICAgICAgIC8vIGNvbnN0IGRhcmtDb2xvciA9IGlzSW5zZXQgPyAnI2VlZScgOiAnIzg4OCc7ICAvLyBMaWdodGVyIGZvciBpbnNldCBib3R0b20vcmlnaHRcclxuXHJcbiAgICAgICAgY29uc3QgbGlnaHRDb2xvciA9IFwiI2ZmZmZmZlwiO1xyXG4gICAgICAgIGNvbnN0IGRhcmtDb2xvciA9IFwiIzg4ODg4OFwiO1xyXG4gICAgICAgIGNvbnN0IGJhY2tncm91bmRDb2xvciA9ICh0aGlzLmJhY2tncm91bmRDb2xvciAhPSB1bmRlZmluZWQgPyB0aGlzLmJhY2tncm91bmRDb2xvciA6IFwiI2NjY2NjY1wiKTtcclxuXHJcbiAgICAgICAgLy8gT3B0aW9uYWxseSwgZHJhdyB0aGUgaW5uZXIgcmVjdGFuZ2xlIChmaWxsIG9yIGFub3RoZXIgc3Ryb2tlKVxyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kQ29sb3I7IC8vIEV4YW1wbGUgaW5uZXIgY29sb3JcclxuICAgICAgICBjdHguZmlsbFJlY3QoeCArIHJpZGdlV2lkdGgsIHkgKyByaWRnZVdpZHRoLCB3aWR0aCAtIDIgKiByaWRnZVdpZHRoLCBoZWlnaHQgLSAyICogcmlkZ2VXaWR0aCk7XHJcblxyXG4gICAgICAgIC8vIERyYXcgdGhlIFwibGlnaHRcIiBzaWRlcyAodG9wIGFuZCBsZWZ0KVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGxpZ2h0Q29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IHJpZGdlV2lkdGg7XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8oeCArIHJpZGdlV2lkdGggLyAyLCB5ICsgaGVpZ2h0IC0gcmlkZ2VXaWR0aCAvIDIpOyAvLyBCb3R0b20tbGVmdCBjb3JuZXJcclxuICAgICAgICBjdHgubGluZVRvKHggKyByaWRnZVdpZHRoIC8gMiwgeSArIHJpZGdlV2lkdGggLyAyKTsgICAgIC8vIFRvcC1sZWZ0IGNvcm5lclxyXG4gICAgICAgIGN0eC5saW5lVG8oeCArIHdpZHRoIC0gcmlkZ2VXaWR0aCAvIDIsIHkgKyByaWRnZVdpZHRoIC8gMik7IC8vIFRvcC1yaWdodCBjb3JuZXJcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIC8vIERyYXcgdGhlIFwiZGFya1wiIHNpZGVzIChib3R0b20gYW5kIHJpZ2h0KVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGRhcmtDb2xvcjtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gcmlkZ2VXaWR0aDtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4Lm1vdmVUbyh4ICsgd2lkdGggLSByaWRnZVdpZHRoIC8gMiwgeSArIHJpZGdlV2lkdGggLyAyKTsgICAgIC8vIFRvcC1yaWdodCBjb3JuZXJcclxuICAgICAgICBjdHgubGluZVRvKHggKyB3aWR0aCAtIHJpZGdlV2lkdGggLyAyLCB5ICsgaGVpZ2h0IC0gcmlkZ2VXaWR0aCAvIDIpOyAvLyBCb3R0b20tcmlnaHQgY29ybmVyXHJcbiAgICAgICAgY3R4LmxpbmVUbyh4ICsgcmlkZ2VXaWR0aCAvIDIsIHkgKyBoZWlnaHQgLSByaWRnZVdpZHRoIC8gMik7IC8vIEJvdHRvbS1sZWZ0IGNvcm5lclxyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3UmlkZ2VSZWN0KGN0eCA6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgeCA6IG51bWJlciwgeSA6IG51bWJlciwgd2lkdGggOiBudW1iZXIsIGhlaWdodCA6IG51bWJlciwgYm9yZGVyV2lkdGggOiBudW1iZXIsIGlzSW5zZXQgPSBmYWxzZSl7XHJcbiAgICAgICAgLy8gQ29sb3JzIGZvciByaWRnZSBlZmZlY3RcclxuICAgICAgICBjb25zdCBsaWdodENvbG9yID0gXCIjZmZmZmZmXCI7XHJcbiAgICAgICAgY29uc3QgZGFya0NvbG9yID0gXCIjODg4ODg4XCI7XHJcbiAgICAgICAgY29uc3QgYmFja2dyb3VuZENvbG9yID0gXCIjY2NjY2NjXCI7XHJcblxyXG4gICAgICAgIC8vIEZpbGwgcmVjdGFuZ2xlIGJhY2tncm91bmRcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgLy8gVG9wICYgbGVmdCAoaGlnaGxpZ2h0KVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGxpZ2h0Q29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IGJvcmRlcldpZHRoO1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHgubW92ZVRvKHggKyB3aWR0aCwgeSk7ICAgICAgIC8vIFRvcC1yaWdodFxyXG4gICAgICAgIGN0eC5saW5lVG8oeCwgeSk7ICAgICAgICAgICAgICAgLy8gVG9wLWxlZnRcclxuICAgICAgICBjdHgubGluZVRvKHgsIHkgKyBoZWlnaHQpOyAgICAgIC8vIEJvdHRvbS1sZWZ0XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAvLyBCb3R0b20gJiByaWdodCAoc2hhZG93KVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGRhcmtDb2xvcjtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4Lm1vdmVUbyh4LCB5ICsgaGVpZ2h0KTsgICAgICAvLyBCb3R0b20tbGVmdFxyXG4gICAgICAgIGN0eC5saW5lVG8oeCArIHdpZHRoLCB5ICsgaGVpZ2h0KTsgLy8gQm90dG9tLXJpZ2h0XHJcbiAgICAgICAgY3R4LmxpbmVUbyh4ICsgd2lkdGgsIHkpOyAgICAgICAvLyBUb3AtcmlnaHRcclxuICAgICAgICBjdHguc3Ryb2tlKCk7ICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxsZXIgZXh0ZW5kcyBVSSB7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUZXh0VUkgZXh0ZW5kcyBVSSB7XHJcbiAgICBmb250U2l6ZT8gOiBzdHJpbmc7XHJcbiAgICB0ZXh0QWxpZ24/IDogc3RyaW5nO1xyXG4gICAgdGV4dCA6IHN0cmluZztcclxuICAgIG1ldHJpY3MhOiBUZXh0TWV0cmljcztcclxuICAgIGFjdHVhbEhlaWdodCE6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogVGV4dEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZm9udFNpemUgID0gZGF0YS5mb250U2l6ZTtcclxuICAgICAgICB0aGlzLnRleHRBbGlnbiA9IGRhdGEudGV4dEFsaWduO1xyXG4gICAgICAgIHRoaXMudGV4dCA9IChkYXRhLnRleHQgIT0gdW5kZWZpbmVkID8gZGF0YS50ZXh0IDogXCJcIik7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubWV0cmljcyA9IHRoaXMuY3R4Lm1lYXN1cmVUZXh0KHRoaXMudGV4dCk7XHJcbiAgICAgIFxyXG4gICAgICAgIHRoaXMuYWN0dWFsSGVpZ2h0ID0gdGhpcy5tZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50ICsgdGhpcy5tZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94RGVzY2VudDtcclxuICAgICAgXHJcbiAgICAgICAgbXNnKGBpZHg6WyR7dGhpcy5pZHh9XSAgZm9udCA6WyR7dGhpcy5mb250U2l6ZX1dICB3Olske3RoaXMubWV0cmljcy53aWR0aH1dIGg6WyR7dGhpcy5hY3R1YWxIZWlnaHR9XSBbJHt0aGlzLnRleHR9XWApO1xyXG5cclxuICAgICAgICBjb25zdCB3aWR0aCAgPSB0aGlzLm1ldHJpY3Mud2lkdGggKyB0aGlzLm1hcmdpbkJvcmRlclBhZGRpbmdXaWR0aCgpICsgVGV4dFNpemVGaWxsO1xyXG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuYWN0dWFsSGVpZ2h0ICArIHRoaXMubWFyZ2luQm9yZGVyUGFkZGluZ0hlaWdodCgpICsgVGV4dFNpemVGaWxsO1xyXG5cclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMih3aWR0aCwgaGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgc3VwZXIuZHJhdygpO1xyXG5cclxuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5tYXJnaW5bMF0gKyB0aGlzLmJvcmRlcldpZHRoICsgdGhpcy5wYWRkaW5nWzBdO1xyXG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLm1hcmdpblsyXSArIHRoaXMuYm9yZGVyV2lkdGggKyB0aGlzLnBhZGRpbmdbMl1cclxuICAgICAgICAgICAgICAgICAgKyB0aGlzLmFjdHVhbEhlaWdodDtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0ZXh0Q29sb3I7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlVGV4dCh0aGlzLnRleHQsIHgsIHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0cigpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gYCR7c3VwZXIuc3RyKCl9IHRleHQ6JHt0aGlzLnRleHR9YDtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMYWJlbCBleHRlbmRzIFRleHRVSSB7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCdXR0b24gZXh0ZW5kcyBUZXh0VUkge1xyXG4gICAgY2xpY2sgOiAoKT0+UHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQnV0dG9uQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5jbGljayA9IGRhdGEuY2xpY2s7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOb2RlIGV4dGVuZHMgVUkge1xyXG4gICAgYWJzdHJhY3QgZG9uZSgpIDogYm9vbGVhbjtcclxuICAgIGFic3RyYWN0IGRyYXdOb2RlKGNhbnZhcyA6IENhbnZhcykgOiB2b2lkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEVkaXRvciBleHRlbmRzIFVJIHtcclxuICAgIGJsb2NrcyA6IEJsb2NrW10gPSBbXTtcclxuXHJcbiAgICBjaGlsZHJlbigpIDogVUlbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tzLnNsaWNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQmxvY2soYmxvY2sgOiBCbG9jayl7XHJcbiAgICAgICAgdGhpcy5ibG9ja3MucHVzaChibG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIHN1cGVyLmRyYXcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5ibG9ja3MuZm9yRWFjaCh4ID0+IHguZHJhdygpKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyaWQgZXh0ZW5kcyBVSSB7XHJcbiAgICBjb2xEZXNjcyA6IHN0cmluZ1tdO1xyXG4gICAgcm93RGVzY3MgICA6IHN0cmluZ1tdO1xyXG4gICAgY2VsbHMgOiBVSVtdW107XHJcblxyXG4gICAgbWluV2lkdGhzIDogbnVtYmVyW10gPSBbXTtcclxuICAgIG1pbkhlaWdodHM6IG51bWJlcltdID0gW107XHJcblxyXG4gICAgY29sV2lkdGhzIDogbnVtYmVyW10gPSBbXTtcclxuICAgIHJvd0hlaWdodHM6IG51bWJlcltdID0gW107XHJcblxyXG4gICAgbnVtUm93cyA6IG51bWJlcjtcclxuICAgIG51bUNvbHMgOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEdyaWRBdHRyKXsgICAgICAgIFxyXG4gICAgICAgIHN1cGVyKGRhdGEgYXMgYW55KTtcclxuXHJcbiAgICAgICAgdGhpcy5jZWxscyA9IGRhdGEuY2VsbHM7XHJcbiAgICAgICAgdGhpcy5udW1Sb3dzID0gdGhpcy5jZWxscy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5udW1Db2xzID0gTWF0aC5tYXgoLi4uIHRoaXMuY2VsbHMubWFwKHJvdyA9PiBzdW0ocm93Lm1hcCh1aSA9PiB1aS5jb2xzcGFuKSkpKTtcclxuXHJcbiAgICAgICAgaWYoZGF0YS5jb2x1bW5zID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRoaXMuY29sRGVzY3MgPSBhcnJheUZpbGwodGhpcy5udW1Db2xzLCBcImF1dG9cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNvbERlc2NzID0gZGF0YS5jb2x1bW5zLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGRhdGEucm93cyA9PSB1bmRlZmluZWQpe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yb3dEZXNjcyA9IGFycmF5RmlsbCh0aGlzLm51bVJvd3MsIFwiYXV0b1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucm93RGVzY3MgPSBkYXRhLnJvd3Muc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXNzZXJ0KHRoaXMuY29sRGVzY3MubGVuZ3RoID09IHRoaXMubnVtQ29scyk7XHJcbiAgICAgICAgYXNzZXJ0KHRoaXMucm93RGVzY3MubGVuZ3RoICAgPT0gdGhpcy5udW1Sb3dzKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGlsZHJlbigpIDogVUlbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHMuZmxhdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvdyhpZHggOiBudW1iZXIpIDogVUlbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHNbaWR4XTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3dIZWlnaHQoaWR4IDogbnVtYmVyKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KC4uLiB0aGlzLmdldFJvdyhpZHgpLm1hcCh1aSA9PiB1aS5nZXRNaW5IZWlnaHQoKSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbHVtbldpdGgoY29sX2lkeCA6IG51bWJlcikgOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBtYXhfd2lkdGggPSAwO1xyXG4gICAgICAgIGZvcihjb25zdCByb3cgb2YgdGhpcy5jZWxscyl7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgdWkgb2Ygcm93KXtcclxuICAgICAgICAgICAgICAgIGlmKG9mZnNldCA9PSBjb2xfaWR4KXtcclxuICAgICAgICAgICAgICAgICAgICBpZih1aS5jb2xzcGFuID09IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhfd2lkdGggPSBNYXRoLm1heChtYXhfd2lkdGgsIHVpLmdldE1pbldpZHRoKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gdWkuY29sc3BhbjtcclxuICAgICAgICAgICAgICAgIGlmKGNvbF9pZHggPCBvZmZzZXQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbWF4X3dpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGNIZWlnaHRzKCl7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0cyA9IG5ldyBBcnJheSh0aGlzLnJvd0Rlc2NzIS5sZW5ndGgpLmZpbGwoMCk7XHJcbiAgICAgICAgZm9yKGNvbnN0IFtpZHgsIHJvd10gb2YgdGhpcy5yb3dEZXNjcyEuZW50cmllcygpKXtcclxuICAgICAgICAgICAgaWYocm93LmVuZHNXaXRoKFwicHhcIikpe1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0c1tpZHhdID0gcGl4ZWwocm93KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHJvdyA9PSBBVVRPKXtcclxuICAgICAgICAgICAgICAgIGhlaWdodHNbaWR4XSA9IHRoaXMuZ2V0Um93SGVpZ2h0KGlkeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBoZWlnaHRzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemVTdWIoaXNfd2lkdGggOiBib29sZWFuKSA6IHZvaWQge1xyXG4gICAgICAgIGxldCBvZmZzZXRfc2l6ZV9weF91aV9zcGFucyA6IFtudW1iZXIsIG51bWJlciwgVUksIG51bWJlcl1bXSA9IFtdO1xyXG5cclxuICAgICAgICBjb25zdCBtaW5fc2l6ZXMgPSBhcnJheUZpbGwoaXNfd2lkdGggPyB0aGlzLm51bUNvbHMgOiB0aGlzLm51bVJvd3MsIDApO1xyXG4gICAgICAgIGZvcihjb25zdCBbcm93X2lkeCwgcm93XSBvZiB0aGlzLmNlbGxzLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgdWkgb2Ygcm93KXtcclxuICAgICAgICAgICAgICAgIGxldCBzaXplX3B4IDogbnVtYmVyO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IFt1aV9zaXplLCB1aV9taW5fc2l6ZSwgdWlfc3Bhbl0gPSAoaXNfd2lkdGggPyBbdWkud2lkdGgsIHVpLm1pblNpemUhLngsIHVpLmNvbHNwYW5dIDogW3VpLmhlaWdodCwgdWkubWluU2l6ZSEueSwgdWkucm93c3Bhbl0pO1xyXG4gICAgICAgICAgICAgICAgaWYodWlfc2l6ZSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIHNpemVfcHggPSB1aV9taW5fc2l6ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHVpX3NpemUuZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVfcHggPSBwaXhlbCh1aV9zaXplKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2l6ZV9weCA8IHVpX21pbl9zaXplKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZih1aV9zaXplLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVfcHggPSB1aV9taW5fc2l6ZSAvIHJhdGlvKHVpX3NpemUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSAoaXNfd2lkdGggPyBvZmZzZXQgOiByb3dfaWR4KTtcclxuICAgICAgICAgICAgICAgIGlmKHVpX3NwYW4gPT0gMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobWluX3NpemVzW3Bvc10gPCBzaXplX3B4KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluX3NpemVzW3Bvc10gPSBzaXplX3B4O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0X3NpemVfcHhfdWlfc3BhbnMucHVzaChbcG9zLCBzaXplX3B4LCB1aSwgdWlfc3Bhbl0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gdWkuY29sc3BhbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG1heF9yZW1haW5pbmdfc2l6ZSA9IDA7XHJcblxyXG4gICAgICAgIGNvbnN0IGRlc2NzID0gKGlzX3dpZHRoID8gdGhpcy5jb2xEZXNjcyA6IHRoaXMucm93RGVzY3MpO1xyXG4gICAgICAgIGZvcihjb25zdCBbb2Zmc2V0LCB3aWR0aF9weCwgdWksIHVpX3NwYW5dIG9mIG9mZnNldF9zaXplX3B4X3VpX3NwYW5zKXtcclxuICAgICAgICAgICAgbGV0IGZpeGVkX3B4ID0gMDtcclxuICAgICAgICAgICAgbGV0IHJhdGlvX3N1bSA9IDA7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBpZHggb2YgcmFuZ2UyKG9mZnNldCwgb2Zmc2V0ICsgdWlfc3Bhbikpe1xyXG4gICAgICAgICAgICAgICAgaWYoZGVzY3NbaWR4XS5lbmRzV2l0aChcIiVcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJhdGlvX3N1bSArPSByYXRpbyhkZXNjc1tpZHhdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZml4ZWRfcHggKz0gbWluX3NpemVzW2lkeF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHJhdGlvX3N1bSA9PSAwKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihmaXhlZF9weCA8IHVpLm1pblNpemUhLngpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGlmKGZpeGVkX3B4IDw9IHVpLm1pblNpemUhLngpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhdGlvX3B4ID0gdWkubWluU2l6ZSEueCAtIGZpeGVkX3B4O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ193aWR0aCA9IHJhdGlvX3B4IC8gcmF0aW9fc3VtO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG1heF9yZW1haW5pbmdfc2l6ZSA8IHJlbWFpbmluZ193aWR0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heF9yZW1haW5pbmdfc2l6ZSA9IHJlbWFpbmluZ193aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IoY29uc3QgW2lkeCwgY29sXSBvZiBkZXNjcy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBpZihjb2wuZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgICAgICBtaW5fc2l6ZXNbaWR4XSA9IHBpeGVsKGNvbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihjb2wuZW5kc1dpdGgoXCIlXCIpKXtcclxuICAgICAgICAgICAgICAgIG1pbl9zaXplc1tpZHhdID0gbWF4X3JlbWFpbmluZ19zaXplICogcmF0aW8oY29sKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2l6ZSA9IHN1bShtaW5fc2l6ZXMpO1xyXG5cclxuICAgICAgICBjb25zdCB0aGlzX3NpemUgPSAoaXNfd2lkdGggPyB0aGlzLndpZHRoIDogdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIGxldCAgIHRoaXNfc2l6ZV9weCA6IG51bWJlcjtcclxuICAgICAgICBpZih0aGlzX3NpemUgPT0gdW5kZWZpbmVkIHx8IHRoaXNfc2l6ZSA9PSBcImF1dG9cIil7XHJcbiAgICAgICAgICAgIHRoaXNfc2l6ZV9weCA9IHNpemU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGlmKHRoaXNfc2l6ZS5lbmRzV2l0aChcInB4XCIpKXtcclxuICAgICAgICAgICAgICAgIHRoaXNfc2l6ZV9weCA9IHBpeGVsKHRoaXNfc2l6ZSk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzX3NpemVfcHggPCBzaXplKXtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpc19zaXplLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzX3NpemVfcHggPSBzaXplIC8gcmF0aW8odGhpc19zaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoaXNfd2lkdGgpe1xyXG4gICAgICAgICAgICB0aGlzLm1pbldpZHRocyAgPSBtaW5fc2l6ZXM7XHJcbiAgICAgICAgICAgIHRoaXMubWluU2l6ZSEueCA9IHRoaXNfc2l6ZV9weCArIHRoaXMubWFyZ2luQm9yZGVyUGFkZGluZ1dpZHRoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMubWluSGVpZ2h0cyA9IG1pbl9zaXplcztcclxuICAgICAgICAgICAgdGhpcy5taW5TaXplIS55ID0gdGhpc19zaXplX3B4ICsgdGhpcy5tYXJnaW5Cb3JkZXJQYWRkaW5nSGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBWZWMyLnplcm8oKTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbigpLmZvckVhY2goeCA9PiB4LnNldE1pblNpemUoKSk7XHJcbiAgICAgICAgdGhpcy5zZXRNaW5TaXplU3ViKHRydWUpO1xyXG4gICAgICAgIHRoaXMuc2V0TWluU2l6ZVN1YihmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNhbGNTaXplcyhkZXNjcyA6IHN0cmluZ1tdLCBtaW5fc2l6ZXMgOiBudW1iZXJbXSwgcmVtYWluaW5nX3B4IDogbnVtYmVyKSA6IG51bWJlciBbXXtcclxuICAgICAgICBjb25zdCBzaXplcyA9IEFycmF5PG51bWJlcj4oZGVzY3MubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IFtpZHgsIGRlc2NdIG9mIGRlc2NzLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgIGlmKGRlc2MuZW5kc1dpdGgoXCJweFwiKSl7XHJcbiAgICAgICAgICAgICAgICBzaXplc1tpZHhdID0gcGl4ZWwoZGVzYyk7XHJcbiAgICAgICAgICAgICAgICBpZihzaXplc1tpZHhdIDwgbWluX3NpemVzW2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihkZXNjLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICBzaXplc1tpZHhdID0gcmF0aW8oZGVzYykgKiByZW1haW5pbmdfcHg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihkZXNjID09IFwiYXV0b1wiKXtcclxuICAgICAgICAgICAgICAgIHNpemVzW2lkeF0gPSBtaW5fc2l6ZXNbaWR4XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNpemVzO1xyXG4gICAgfVxyXG5cclxuICAgIGxheW91dCh4IDogbnVtYmVyLCB5IDogbnVtYmVyLCBzaXplIDogVmVjMiwgbmVzdCA6IG51bWJlcil7XHJcbiAgICAgICAgc3VwZXIubGF5b3V0KHgsIHksIHNpemUsIG5lc3QpO1xyXG5cclxuICAgICAgICBjb25zdCBmaXhlZF93aWR0aF9weCAgPSBzdW0ocmFuZ2UodGhpcy5udW1Db2xzKS5maWx0ZXIoaSA9PiAhdGhpcy5jb2xEZXNjc1tpXS5lbmRzV2l0aChcIiVcIikpLm1hcChpID0+IHRoaXMubWluV2lkdGhzW2ldKSk7XHJcbiAgICAgICAgY29uc3QgZml4ZWRfaGVpZ2h0X3B4ID0gc3VtKHJhbmdlKHRoaXMubnVtUm93cykuZmlsdGVyKGkgPT4gIXRoaXMucm93RGVzY3NbaV0uZW5kc1dpdGgoXCIlXCIpKS5tYXAoaSA9PiB0aGlzLm1pbkhlaWdodHNbaV0pKTtcclxuXHJcbiAgICAgICAgaWYoc2l6ZS54IDwgZml4ZWRfd2lkdGhfcHggfHwgc2l6ZS55IDwgZml4ZWRfaGVpZ2h0X3B4KXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ193aWR0aF9weCAgPSBzaXplLnggLSBmaXhlZF93aWR0aF9weDtcclxuICAgICAgICBjb25zdCByZW1haW5pbmdfaGVpZ2h0X3B4ID0gc2l6ZS55IC0gZml4ZWRfaGVpZ2h0X3B4O1xyXG5cclxuICAgICAgICB0aGlzLmNvbFdpZHRocyAgPSBHcmlkLmNhbGNTaXplcyh0aGlzLmNvbERlc2NzLCB0aGlzLm1pbldpZHRocyAsIHJlbWFpbmluZ193aWR0aF9weCk7XHJcbiAgICAgICAgdGhpcy5yb3dIZWlnaHRzID0gR3JpZC5jYWxjU2l6ZXModGhpcy5yb3dEZXNjcywgdGhpcy5taW5IZWlnaHRzLCByZW1haW5pbmdfaGVpZ2h0X3B4KTtcclxuXHJcbiAgICAgICAgbGV0IHlfb2Zmc2V0ID0gMDtcclxuICAgICAgICBmb3IoY29uc3QgW3Jvd19pZHgsIHJvd10gb2YgdGhpcy5jZWxscy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgbGV0IHhfb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHVpIG9mIHJvdyl7XHJcbiAgICAgICAgICAgICAgICBsZXQgdWlfd2lkdGhfcHggIDogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgbGV0IHVpX2hlaWdodF9weCA6IG51bWJlcjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih1aS5jb2xzcGFuID09IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgIHVpX3dpZHRoX3B4ID0gdGhpcy5jb2xXaWR0aHNbb2Zmc2V0XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdWlfd2lkdGhfcHggPSBzdW0odGhpcy5jb2xXaWR0aHMuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyB1aS5jb2xzcGFuKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodWkud2lkdGggIT0gdW5kZWZpbmVkICYmIHVpLndpZHRoLmVuZHNXaXRoKFwiJVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdWlfd2lkdGhfcHggKj0gcmF0aW8odWkud2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHVpLnJvd3NwYW4gPT0gMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdWlfaGVpZ2h0X3B4ID0gdGhpcy5yb3dIZWlnaHRzW3Jvd19pZHhdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB1aV9oZWlnaHRfcHggPSBzdW0odGhpcy5yb3dIZWlnaHRzLnNsaWNlKHJvd19pZHgsIHJvd19pZHggKyB1aS5yb3dzcGFuKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodWkuaGVpZ2h0ICE9IHVuZGVmaW5lZCAmJiB1aS5oZWlnaHQuZW5kc1dpdGgoXCIlXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICB1aV9oZWlnaHRfcHggKj0gcmF0aW8odWkuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB1aV9zaXplID0gbmV3IFZlYzIodWlfd2lkdGhfcHgsIHVpX2hlaWdodF9weCk7XHJcbiAgICAgICAgICAgICAgICB1aS5sYXlvdXQoeCArIHhfb2Zmc2V0LCB5ICsgeV9vZmZzZXQsIHVpX3NpemUsIG5lc3QgKyAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICB4X29mZnNldCArPSBzdW0odGhpcy5jb2xXaWR0aHMuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyB1aS5jb2xzcGFuKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHVpLmNvbHNwYW47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHlfb2Zmc2V0ICs9IHRoaXMucm93SGVpZ2h0c1tyb3dfaWR4XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSAgXHJcblxyXG5cclxuICAgIHVwZGF0ZVJvb3RMYXlvdXQoKXtcclxuICAgICAgICB0aGlzLmdldEFsbFVJKCkuZm9yRWFjaCh4ID0+IHguc2V0TWluU2l6ZSgpKTtcclxuICAgICAgICBsZXQgc2l6ZSA9IFZlYzIuemVybygpO1xyXG5cclxuICAgICAgICBsZXQgeCA6IG51bWJlcjtcclxuICAgICAgICBsZXQgeSA6IG51bWJlcjtcclxuXHJcbiAgICAgICAgaWYodGhpcy5jb2xEZXNjcy5zb21lKHggPT4geC5lbmRzV2l0aChcIiVcIikpKXtcclxuXHJcbiAgICAgICAgICAgIHNpemUueCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgICAgICB4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIHNpemUueCA9IHRoaXMubWluU2l6ZSEueDtcclxuICAgICAgICAgICAgeCA9IE1hdGgubWF4KDAsIDAuNSAqICh3aW5kb3cuaW5uZXJXaWR0aCAgLSBzaXplLngpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMucm93RGVzY3Muc29tZSh4ID0+IHguZW5kc1dpdGgoXCIlXCIpKSl7XHJcblxyXG4gICAgICAgICAgICBzaXplLnkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgICAgIHkgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgc2l6ZS55ID0gdGhpcy5taW5TaXplIS55O1xyXG4gICAgICAgICAgICB5ID0gTWF0aC5tYXgoMCwgMC41ICogKHdpbmRvdy5pbm5lckhlaWdodCAtIHNpemUueSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sYXlvdXQoeCwgeSwgc2l6ZSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIHN1cGVyLmRyYXcoKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuKCkuZm9yRWFjaCh4ID0+IHguZHJhdygpKTtcclxuICAgIH1cclxuXHJcbiAgICBzdHIoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgY29sX2Rlc2NzID0gdGhpcy5jb2xEZXNjcy5qb2luKFwiIFwiKTtcclxuICAgICAgICBjb25zdCByb3dfZGVzY3MgPSB0aGlzLnJvd0Rlc2NzLmpvaW4oXCIgXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBtaW5fd3MgPSB0aGlzLm1pbldpZHRocy5tYXAoeCA9PiBgJHt4fWApLmpvaW4oXCIgXCIpO1xyXG4gICAgICAgIGNvbnN0IG1pbl9ocyA9IHRoaXMubWluSGVpZ2h0cy5tYXAoeCA9PiBgJHt4fWApLmpvaW4oXCIgXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBjb2xfd3MgPSB0aGlzLmNvbFdpZHRocy5tYXAoeCA9PiBgJHt4fWApLmpvaW4oXCIgXCIpO1xyXG4gICAgICAgIGNvbnN0IHJvd19ocyA9IHRoaXMucm93SGVpZ2h0cy5tYXAoeCA9PiBgJHt4fWApLmpvaW4oXCIgXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gYCR7c3VwZXIuc3RyKCl9IGNvbDoke2NvbF9kZXNjc30gcm93OiR7cm93X2Rlc2NzfSBtaW4td3M6JHttaW5fd3N9IG1pbi1oczoke21pbl9oc30gY29sLXdzOiR7Y29sX3dzfSByb3ctaHM6JHtyb3dfaHN9YDtcclxuICAgIH1cclxuXHJcbiAgICBkdW1wKG5lc3QgOiBudW1iZXIpe1xyXG4gICAgICAgIHN1cGVyLmR1bXAobmVzdCk7XHJcbiAgICAgICAgZm9yKGNvbnN0IHJvdyBvZiB0aGlzLmNlbGxzKXtcclxuICAgICAgICAgICAgcm93LmZvckVhY2godWkgPT4gdWkuZHVtcChuZXN0ICsgMSkpO1xyXG5cclxuICAgICAgICAgICAgbXNnKFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRsYWJlbChkYXRhIDogVGV4dEF0dHIpIDogTGFiZWwge1xyXG4gICAgcmV0dXJuIG5ldyBMYWJlbChkYXRhKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICRidXR0b24oZGF0YSA6IEJ1dHRvbkF0dHIpIDogQnV0dG9uIHtcclxuICAgIHJldHVybiBuZXcgQnV0dG9uKGRhdGEpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGZpbGxlcihkYXRhIDogQXR0cikgOiBGaWxsZXIge1xyXG4gICAgcmV0dXJuIG5ldyBGaWxsZXIoZGF0YSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkZ3JpZChkYXRhIDogR3JpZEF0dHIpIDogR3JpZCB7ICAgIFxyXG4gICAgcmV0dXJuIG5ldyBHcmlkKGRhdGEpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGhsaXN0KGRhdGEgOiBBdHRyICYgeyByb3dzPyA6IHN0cmluZywgY29sdW1uPzogc3RyaW5nLCBjaGlsZHJlbiA6IFVJW10gfSl7XHJcbiAgICBjb25zdCBncmlkX2RhdGEgPSBkYXRhIGFzIGFueSBhcyBHcmlkQXR0cjtcclxuXHJcbiAgICBncmlkX2RhdGEuY29sdW1ucyA9IGRhdGEuY29sdW1uO1xyXG4gICAgZ3JpZF9kYXRhLmNlbGxzICAgPSBbIGRhdGEuY2hpbGRyZW4gXTtcclxuXHJcbiAgICBkZWxldGUgKGRhdGEgYXMgYW55KS5jaGlsZHJlbjtcclxuICAgIGRlbGV0ZSAoZGF0YSBhcyBhbnkpLmNvbHVtbjtcclxuXHJcbiAgICByZXR1cm4gJGdyaWQoZ3JpZF9kYXRhKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uICR2bGlzdChkYXRhIDogQXR0ciAmIHsgcm93cz8gOiBzdHJpbmcsIGNvbHVtbj86IHN0cmluZywgY2hpbGRyZW4gOiBVSVtdIH0pe1xyXG4gICAgY29uc3QgZ3JpZF9kYXRhID0gZGF0YSBhcyBhbnkgYXMgR3JpZEF0dHI7XHJcblxyXG4gICAgZ3JpZF9kYXRhLmNvbHVtbnMgPSBkYXRhLmNvbHVtbjtcclxuICAgIGdyaWRfZGF0YS5jZWxscyAgID0gZGF0YS5jaGlsZHJlbi5tYXAoeCA9PiBbeF0pO1xyXG5cclxuICAgIGRlbGV0ZSAoZGF0YSBhcyBhbnkpLmNoaWxkcmVuO1xyXG4gICAgZGVsZXRlIChkYXRhIGFzIGFueSkuY29sdW1uO1xyXG5cclxuICAgIHJldHVybiAkZ3JpZChncmlkX2RhdGEpO1xyXG59XHJcblxyXG59IiwiLy8vPHJlZmVyZW5jZSBwYXRoPVwiZXhwb3J0LnRzXCIgLz5cclxuLy8vPHJlZmVyZW5jZSBwYXRoPVwidWkudHNcIiAvPlxyXG5cclxubmFtZXNwYWNlIGRpYWdyYW1fdHMge1xyXG4vL1xyXG5leHBvcnQgY29uc3Qgbm90Y2hSYWRpdXMgPSAxMDsgICAgICAgIFxyXG5cclxuZXhwb3J0IGNvbnN0IG5lc3RfaDEgPSAzNTtcclxuZXhwb3J0IGNvbnN0IG5lc3RfaDIgPSAzMDtcclxuZXhwb3J0IGNvbnN0IG5lc3RfaDMgPSAzNTtcclxuZXhwb3J0IGNvbnN0IG5lc3RfaDEyMyA9IG5lc3RfaDEgKyBuZXN0X2gyICsgbmVzdF9oMztcclxuXHJcbmV4cG9ydCBjb25zdCBibG9ja0xpbmVXaWR0aCA9IDI7XHJcbmNvbnN0IGJsb2NrTGluZUNvbG9yID0gXCJicm93blwiO1xyXG5jb25zdCBuZWFyUG9ydERpc3RhbmNlID0gMTA7XHJcblxyXG5jb25zdCByYW5nZVdpZHRoICA9IDE1MDtcclxuY29uc3QgbnVtYmVyV2lkdGggPSA0NTtcclxuXHJcbmV4cG9ydCBsZXQgY2FtZXJhSWNvbiA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcbmV4cG9ydCBsZXQgbW90b3JJY29uICA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcbmV4cG9ydCBsZXQgY2FtZXJhSW1nIDogSFRNTEltYWdlRWxlbWVudDtcclxuZXhwb3J0IGxldCBkaXN0YW5jZVNlbnNvckljb24gOiBIVE1MSW1hZ2VFbGVtZW50O1xyXG5leHBvcnQgbGV0IHR0c0ljb24gOiBIVE1MSW1hZ2VFbGVtZW50O1xyXG5leHBvcnQgbGV0IHNsZWVwSWNvbiA6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcblxyXG5leHBvcnQgZW51bSBQb3J0VHlwZSB7XHJcbiAgICB1bmtub3duLFxyXG4gICAgYm90dG9tLFxyXG4gICAgdG9wLFxyXG5cclxuICAgIGlucHV0UG9ydCxcclxuICAgIG91dHB1dFBvcnQsXHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCbG9jayBleHRlbmRzIFVJIHtcclxuICAgIHBvcnRzIDogUG9ydFtdID0gW107XHJcbiAgICBvdXRsaW5lQ29sb3IgOiBzdHJpbmcgPSBcImdyZWVuXCI7XHJcbiAgICBub3RjaEJvdHRvbSA6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgbm90Y2hSaWdodCAgOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIGluVG9vbGJveCAgIDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICBpZih0aGlzLmJhY2tncm91bmRDb2xvciA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IFwiY29ybnNpbGtcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYWRkaW5nID0gWzUsIDUsIDUsIDVdO1xyXG5cclxuICAgICAgICBpZihkYXRhLmluVG9vbGJveCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmluVG9vbGJveCA9IGRhdGEuaW5Ub29sYm94O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb3B5KCkgOiBCbG9jayB7XHJcbiAgICAgICAgY29uc3QgYmxvY2sgPSBtYWtlQmxvY2tCeVR5cGVOYW1lKHRoaXMuY29uc3RydWN0b3IubmFtZSk7XHJcblxyXG4gICAgICAgIGJsb2NrLnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgYmxvY2suY3R4ICAgICAgPSB0aGlzLmN0eDtcclxuXHJcbiAgICAgICAgYmxvY2suc2V0TWluU2l6ZSgpO1xyXG4gICAgICAgIGJsb2NrLmJveFNpemUgPSBibG9jay5taW5TaXplIS5jb3B5KCk7XHJcblxyXG4gICAgICAgIHJldHVybiBibG9jaztcclxuICAgIH1cclxuXHJcbiAgICBtYWtlT2JqKCkgOiBhbnl7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWR4OiB0aGlzLmlkeCxcclxuICAgICAgICAgICAgdHlwZU5hbWU6IHRoaXMuY29uc3RydWN0b3IubmFtZSxcclxuICAgICAgICAgICAgeCA6IHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgeSA6IHRoaXMucG9zaXRpb24ueSxcclxuICAgICAgICAgICAgcG9ydHMgOiB0aGlzLnBvcnRzLm1hcCh4ID0+IHgubWFrZU9iaigpKVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZE9iaihvYmogOiBhbnkgKXsgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGFic3RyYWN0IHNldE1pblNpemUoKSA6IHZvaWQ7XHJcblxyXG4gICAgY2FsY0hlaWdodCgpIDogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taW5TaXplIS55O1xyXG4gICAgfVxyXG5cclxuICAgIG5leHRCbG9jaygpIDogQmxvY2sgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCBib3R0b21fcG9ydCA6IFBvcnQgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIElmQmxvY2spe1xyXG4gICAgICAgICAgICBib3R0b21fcG9ydCA9IHRoaXMuYm90dG9tUG9ydDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0aGlzIGluc3RhbmNlb2YgSW5maW5pdGVMb29wKXsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgYm90dG9tX3BvcnQgPSB0aGlzLnBvcnRzLmZpbmQoeCA9PiB4LnR5cGUgPT0gUG9ydFR5cGUuYm90dG9tKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoYm90dG9tX3BvcnQgIT0gdW5kZWZpbmVkICYmIGJvdHRvbV9wb3J0LmRlc3RpbmF0aW9ucy5sZW5ndGggIT0gMCl7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlc3RfcG9ydCA9IGJvdHRvbV9wb3J0LmRlc3RpbmF0aW9uc1swXTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlc3RfcG9ydC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlzUHJvY2VkdXJlKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIE5lc3RCbG9jayB8fCB0aGlzIGluc3RhbmNlb2YgVFRTQmxvY2sgfHwgdGhpcyBpbnN0YW5jZW9mIFNsZWVwQmxvY2s7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UG9ydEZyb21Qb3NpdGlvbihwb3MgOiBWZWMyKSA6IFBvcnQgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBvcnRzLmZpbmQoeCA9PiB4LmlzTmVhcihwb3MpKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRGlmZihkaWZmIDogVmVjMikgOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBuZXdfcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uLmFkZChkaWZmKTtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKG5ld19wb3NpdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgb3V0cHV0UG9ydHMoKSA6IFBvcnRbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucG9ydHMuZmlsdGVyKHggPT4geC50eXBlID09IFBvcnRUeXBlLm91dHB1dFBvcnQpO1xyXG4gICAgfVxyXG5cclxuICAgIG5leHREYXRhZmxvd0Jsb2NrcygpIDogQmxvY2tbXSB7XHJcbiAgICAgICAgY29uc3QgYmxvY2tzIDogQmxvY2tbXSA9IFtdO1xyXG5cclxuICAgICAgICBjb25zdCBvdXRwdXRfcG9ydHMgPSB0aGlzLm91dHB1dFBvcnRzKCk7XHJcbiAgICAgICAgZm9yKGNvbnN0IHBvcnQgb2Ygb3V0cHV0X3BvcnRzKXtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IGRzdCBvZiBwb3J0LmRlc3RpbmF0aW9ucyl7XHJcbiAgICAgICAgICAgICAgICBibG9ja3MucHVzaChkc3QucGFyZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGJsb2NrcztcclxuICAgIH1cclxuXHJcbiAgICBwcm9wZXJnYXRlQ2FsYygpe1xyXG4gICAgICAgIGNvbnN0IG5leHRfZGF0YWZsb3dfYmxvY2tzID0gdGhpcy5uZXh0RGF0YWZsb3dCbG9ja3MoKTtcclxuICAgICAgICBuZXh0X2RhdGFmbG93X2Jsb2Nrcy5mb3JFYWNoKHggPT4geC5jYWxjKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3RCbG9jayhwb3J0cyA6IFBvcnRbXSl7XHJcbiAgICAgICAgbGV0IFtwb3J0MSwgcG9ydDJdID0gcG9ydHM7XHJcbiAgICAgICAgYXNzZXJ0KHBvcnQxLnBhcmVudCA9PSB0aGlzKTtcclxuXHJcbiAgICAgICAgaWYocG9ydDEudHlwZSA9PSBQb3J0VHlwZS5ib3R0b20pe1xyXG4gICAgICAgICAgICBhc3NlcnQocG9ydDIudHlwZSA9PSBQb3J0VHlwZS50b3ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHBvcnQxLnR5cGUgPT0gUG9ydFR5cGUudG9wKXtcclxuICAgICAgICAgICAgYXNzZXJ0KHBvcnQyLnR5cGUgPT0gUG9ydFR5cGUuYm90dG9tKTtcclxuICAgICAgICAgICAgW3BvcnQxLCBwb3J0Ml0gPSBbcG9ydDIsIHBvcnQxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwb3J0MS5jb25uZWN0KHBvcnQyKTtcclxuXHJcbiAgICAgICAgbXNnKGBjb25uZWN0IGJsb2NrYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd05vdGNoKGN4IDogbnVtYmVyLCBjeSA6IG51bWJlciwgdHlwZSA6IFBvcnRUeXBlKXtcclxuICAgICAgICBzd2l0Y2godHlwZSl7XHJcbiAgICAgICAgY2FzZSBQb3J0VHlwZS5ib3R0b206XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhjeCwgY3ksIG5vdGNoUmFkaXVzLCBNYXRoLlBJLCAwLCB0cnVlKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBQb3J0VHlwZS50b3A6XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhjeCwgY3ksIG5vdGNoUmFkaXVzLCAwLCBNYXRoLlBJLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkcmF3T3V0bGluZShwb2ludHMgOiBbbnVtYmVyLCBudW1iZXIsIG51bGx8UG9ydF1bXSl7XHJcbiAgICAgICAgY29uc3QgY2FudmFzID0gQ2FudmFzLm9uZTtcclxuICAgICAgICBpZihjYW52YXMuZHJhZ2dlZFVJID09IHRoaXMpe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAwLjU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoY2FudmFzLm5lYXJQb3J0cy5sZW5ndGggIT0gMCAmJiBjYW52YXMubmVhclBvcnRzWzFdLnBhcmVudCA9PSB0aGlzKXtcclxuICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAwLjU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmJhY2tncm91bmRDb2xvciE7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gYmxvY2tMaW5lQ29sb3I7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoICAgPSBibG9ja0xpbmVXaWR0aDtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBbaWR4LCBbeCwgeSwgcG9ydF1dIG9mIHBvaW50cy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBpZihpZHggPT0gMCl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHgsIHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBpZihwb3J0ID09IG51bGwpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oeCwgeSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd05vdGNoKHgsIHksIHBvcnQudHlwZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcnRfcG9zID0gcG9ydC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBwb3J0X3Bvcy54ID0geDtcclxuICAgICAgICAgICAgICAgICAgICBwb3J0X3Bvcy55ID0geTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICBpZih0aGlzLmN0eC5nbG9iYWxBbHBoYSAhPSAxLjApe1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDEuMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0lPUG9ydHMoeDEgOiBudW1iZXIsIHgyIDogbnVtYmVyLCB5MSA6IG51bWJlciwgeTIgOiBudW1iZXIpe1xyXG4gICAgICAgIGNvbnN0IGlucHV0X3BvcnRzICA9IHRoaXMucG9ydHMuZmlsdGVyKHggPT4geC50eXBlID09IFBvcnRUeXBlLmlucHV0UG9ydCk7XHJcbiAgICAgICAgY29uc3Qgb3V0cHV0X3BvcnRzID0gdGhpcy5wb3J0cy5maWx0ZXIoeCA9PiB4LnR5cGUgPT0gUG9ydFR5cGUub3V0cHV0UG9ydCk7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBwb3J0cyBvZiBbIGlucHV0X3BvcnRzLCBvdXRwdXRfcG9ydHNdKXtcclxuICAgICAgICAgICAgY29uc3QgeSA9IChwb3J0cyA9PSBpbnB1dF9wb3J0cyA/IHkxICsgbm90Y2hSYWRpdXM6IHkyIC0gbm90Y2hSYWRpdXMpO1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgW2ksIHBvcnRdIG9mIHBvcnRzLmVudHJpZXMoKSl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwID0gKGkgKyAxKSAvIChwb3J0cy5sZW5ndGggKyAxKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSB4MSAqICgxIC0gcCkgKyB4MiAqIHA7XHJcbiAgICAgICAgICAgICAgICBwb3J0LmRyYXdQb3J0KHRoaXMuY3R4LCB4LCB5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkcmF3SWNvbihpbWcgOiBIVE1MSW1hZ2VFbGVtZW50KXtcclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB4MiwgeTJdID0gdGhpcy5nZXRDb3JuZXJQb3NpdGlvbigpO1xyXG5cclxuXHJcbiAgICAgICAgY29uc3QgaW1nX2hlaWdodCA9ICh5MiAtIHkxKSAtIDY7XHJcbiAgICAgICAgY29uc3QgaW1nX3dpZHRoICA9IGltZ19oZWlnaHQgKiBpbWcud2lkdGggLyBpbWcuaGVpZ2h0O1xyXG5cclxuICAgICAgICBjb25zdCBpbWdfeCA9IHgyIC0gaW1nX3dpZHRoIC0gNTtcclxuICAgICAgICBjb25zdCBpbWdfeSA9IHkxICsgMztcclxuXHJcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGltZywgaW1nX3gsIGltZ195LCBpbWdfd2lkdGgsIGltZ19oZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvcm5lclBvc2l0aW9uKCkgOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgY29uc3QgW3Bvcywgc2l6ZV0gPSB0aGlzLmRyYXdCb3goKTtcclxuICAgICAgICBjb25zdCB4MSA9IHBvcy54ICsgdGhpcy5ib3JkZXJXaWR0aCArIGJsb2NrTGluZVdpZHRoO1xyXG4gICAgICAgIGNvbnN0IHkxID0gcG9zLnkgKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcblxyXG4gICAgICAgIGNvbnN0IHgyID0geDEgKyB0aGlzLm1pblNpemUhLng7XHJcbiAgICAgICAgY29uc3QgeTIgPSB5MSArIHRoaXMubWluU2l6ZSEueTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFt4MSwgeTEsIHgyLCB5Ml07XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0RhdGFmbG93QmxvY2soKXtcclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB4MiwgeTJdID0gdGhpcy5nZXRDb3JuZXJQb3NpdGlvbigpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5kcmF3T3V0bGluZShbXHJcbiAgICAgICAgICAgIFt4MSwgeTEsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDEsIHkyLCBudWxsXSxcclxuICAgICAgICAgICAgW3gyLCB5MiwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTEsIG51bGxdLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdJT1BvcnRzKHgxLCB4MiwgeTEsIHkyKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3QWN0aW9uQmxvY2soKXtcclxuICAgICAgICBjb25zdCBbcG9zLCBzaXplXSA9IHRoaXMuZHJhd0JveCgpO1xyXG4gICAgICAgIGNvbnN0IHgxID0gcG9zLnggKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcbiAgICAgICAgY29uc3QgeTEgPSBwb3MueSArIHRoaXMuYm9yZGVyV2lkdGggKyBibG9ja0xpbmVXaWR0aDtcclxuXHJcbiAgICAgICAgY29uc3QgeDIgPSB4MSArIDM1O1xyXG4gICAgICAgIGNvbnN0IHgzID0geDEgKyB0aGlzLm1pblNpemUhLng7XHJcblxyXG4gICAgICAgIGNvbnN0IHkyID0geTEgKyB0aGlzLm1pblNpemUhLnkgLSBub3RjaFJhZGl1cztcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3T3V0bGluZShbXHJcbiAgICAgICAgICAgIFt4MSwgeTEsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3gxLCB5MiwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTIsIHRoaXMucG9ydHNbMV1dLFxyXG4gICAgICAgICAgICBbeDMsIHkyLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIFt4MywgeTEsIG51bGxdLFxyXG4gICAgICAgICAgICBbeDIsIHkxLCB0aGlzLnBvcnRzWzBdXVxyXG4gICAgICAgIF0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbkNvbm5lY3ROZWFyUG9ydFBhaXIoYmxvY2sgOiBCbG9jaykgOiBQb3J0W10ge1xyXG4gICAgICAgIGZvcihjb25zdCBwb3J0MSBvZiB0aGlzLnBvcnRzKXtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHBvcnQyIG9mIGJsb2NrLnBvcnRzKXtcclxuICAgICAgICAgICAgICAgIGlmKHBvcnQxLmNhbkNvbm5lY3QocG9ydDIpICYmIHBvcnQxLnBvc2l0aW9uLmRpc3RhbmNlKHBvcnQyLnBvc2l0aW9uKSA8PSBuZWFyUG9ydERpc3RhbmNlKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3BvcnQxLCBwb3J0Ml07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB2YWx1ZUNoYW5nZWQoKXtcclxuICAgICAgICBtc2coYGNoYW5nZWQgOiAke3RoaXMuY29uc3RydWN0b3IubmFtZX1gKTtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjKCl7XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBydW4oKXtcclxuICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5wdXRCbG9jayBleHRlbmRzIEJsb2NrIHtcclxuICAgIGlucHV0IDogSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmlucHV0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRJbnB1dFBvc2l0aW9uKCkgOiBbbnVtYmVyLCBudW1iZXJde1xyXG4gICAgICAgIGNvbnN0IFt4MSwgeTEsIHgyLCB5Ml0gPSB0aGlzLmdldENvcm5lclBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmlucHV0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBjb25zdCBpbnB1dF94ID0geDEgKyAwLjUgKiAoKHgyIC0geDEpIC0gcmVjdC53aWR0aCk7XHJcbiAgICAgICAgY29uc3QgaW5wdXRfeSA9IHkxICsgMC41ICogKCh5MiAtIHkxKSAtIHJlY3QuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtpbnB1dF94LCBpbnB1dF95XTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQb3NpdGlvbihwb3NpdGlvbiA6IFZlYzIpIDogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuc2V0UG9zaXRpb24ocG9zaXRpb24pO1xyXG5cclxuICAgICAgICBjb25zdCBbeDEsIHkxXSA9IHRoaXMuZ2V0SW5wdXRQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLmxlZnQgPSBgJHt4MX1weGA7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS50b3AgID0gYCR7eTF9cHhgO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIElucHV0UmFuZ2VCbG9jayBleHRlbmRzIElucHV0QmxvY2sge1xyXG4gICAgbWluSW5wdXQgOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgbWF4SW5wdXQgOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC50eXBlID0gXCJyYW5nZVwiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc3R5bGUud2lkdGggPSBgJHtyYW5nZVdpZHRofXB4YDtcclxuICAgICAgICB0aGlzLmlucHV0Lm1pbiA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQubWF4ID0gXCIxMDBcIjtcclxuXHJcbiAgICAgICAgdGhpcy5taW5JbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuICAgICAgICB0aGlzLm1pbklucHV0LnR5cGUgPSBcIm51bWJlclwiO1xyXG4gICAgICAgIHRoaXMubWluSW5wdXQudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLm1pbklucHV0LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG4gICAgICAgIHRoaXMubWluSW5wdXQuc3R5bGUud2lkdGggPSBgJHtudW1iZXJXaWR0aH1weGA7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgdGhpcy5tYXhJbnB1dC50eXBlID0gXCJudW1iZXJcIjtcclxuICAgICAgICB0aGlzLm1heElucHV0LnZhbHVlID0gXCIxMDBcIjtcclxuICAgICAgICB0aGlzLm1heElucHV0LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xyXG4gICAgICAgIHRoaXMubWF4SW5wdXQuc3R5bGUud2lkdGggPSBgJHtudW1iZXJXaWR0aH1weGA7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5taW5JbnB1dCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm1heElucHV0KTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgYXN5bmMgKGV2IDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KHRoaXMuaW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICBmb3IoY29uc3Qgc3JjIG9mIHRoaXMucG9ydHMpe1xyXG4gICAgICAgICAgICAgICAgc3JjLnNldFBvcnRWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIENhbnZhcy5vbmUucmVxdWVzdFVwZGF0ZUNhbnZhcygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm1pbklucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldiA6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQubWluID0gdGhpcy5taW5JbnB1dC52YWx1ZTtcclxuICAgICAgICAgICAgbXNnKGBtaW4gOiBbJHt0aGlzLmlucHV0Lm1pbn1dYCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGV2IDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dC5tYXggPSB0aGlzLm1heElucHV0LnZhbHVlO1xyXG4gICAgICAgICAgICBtc2coYG1heCA6IFske3RoaXMuaW5wdXQubWF4fV1gKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUub3V0cHV0UG9ydCkgXTtcclxuICAgIH1cclxuXHJcbiAgICBtYWtlT2JqKCkgOiBhbnkge1xyXG4gICAgICAgIGxldCBvYmogPSBPYmplY3QuYXNzaWduKHN1cGVyLm1ha2VPYmooKSwge1xyXG4gICAgICAgICAgICB2YWx1ZSA6IHRoaXMuaW5wdXQudmFsdWUsXHJcbiAgICAgICAgICAgIG1pbiAgIDogdGhpcy5taW5JbnB1dC52YWx1ZSxcclxuICAgICAgICAgICAgbWF4ICAgOiB0aGlzLm1heElucHV0LnZhbHVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZE9iaihvYmogOiBhbnkgKXsgICAgICAgIFxyXG4gICAgICAgIHN1cGVyLmxvYWRPYmoob2JqKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSAgICA9IGAke29iai52YWx1ZX1gO1xyXG4gICAgICAgIHRoaXMubWluSW5wdXQudmFsdWUgPSBgJHtvYmoubWlufWA7XHJcbiAgICAgICAgdGhpcy5tYXhJbnB1dC52YWx1ZSA9IGAke29iai5tYXh9YDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigyMDAsIDUwKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQb3NpdGlvbihwb3NpdGlvbiA6IFZlYzIpIDogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuc2V0UG9zaXRpb24ocG9zaXRpb24pO1xyXG5cclxuICAgICAgICBjb25zdCBbcG9zLCBzaXplXSA9IHRoaXMuZHJhd0JveCgpO1xyXG5cclxuICAgICAgICBjb25zdCByYzEgPSB0aGlzLmlucHV0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGNvbnN0IHJjMiA9IHRoaXMubWluSW5wdXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHgxID0gcG9zLnggKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGggKyAyICogUG9ydC5yYWRpdXM7XHJcbiAgICAgICAgY29uc3QgeTEgPSBwb3MueSArIDAuNSAqIChzaXplLnkgLSAocmMxLmhlaWdodCArIHJjMi5oZWlnaHQpKTtcclxuICAgICAgICBjb25zdCB5MiA9IHkxICsgcmMxLmhlaWdodDtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC5zdHlsZS5sZWZ0ID0gYCR7eDF9cHhgO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc3R5bGUudG9wICA9IGAke3kxfXB4YDtcclxuXHJcbiAgICAgICAgdGhpcy5taW5JbnB1dC5zdHlsZS5sZWZ0ID0gYCR7eDF9cHhgO1xyXG4gICAgICAgIHRoaXMubWluSW5wdXQuc3R5bGUudG9wICA9IGAke3kyfXB4YDtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhJbnB1dC5zdHlsZS5sZWZ0ID0gYCR7eDEgKyByYzEud2lkdGggLSByYzIud2lkdGh9cHhgO1xyXG4gICAgICAgIHRoaXMubWF4SW5wdXQuc3R5bGUudG9wICA9IGAke3kyfXB4YDtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgdGhpcy5kcmF3RGF0YWZsb3dCbG9jaygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFNlcnZvTW90b3JCbG9jayBleHRlbmRzIElucHV0QmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnR5cGUgPSBcIm51bWJlclwiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc3R5bGUud2lkdGggPSBcIjQ1cHhcIjtcclxuICAgICAgICB0aGlzLmlucHV0LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5taW4gICA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQubWF4ICAgPSBcIjE1XCI7XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldiA6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIG1zZyhgY2hhbmdlIDogWyR7dGhpcy5pbnB1dC52YWx1ZX1dYCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmlucHV0UG9ydCkgXTtcclxuICAgIH1cclxuXHJcbiAgICBtYWtlT2JqKCkgOiBhbnkge1xyXG4gICAgICAgIGxldCBvYmogPSBPYmplY3QuYXNzaWduKHN1cGVyLm1ha2VPYmooKSwge1xyXG4gICAgICAgICAgICBjaGFubmVsIDogcGFyc2VJbnQodGhpcy5pbnB1dC52YWx1ZSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkT2JqKG9iaiA6IGFueSApeyAgICAgICAgXHJcbiAgICAgICAgc3VwZXIubG9hZE9iaihvYmopO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSBgJHtvYmouY2hhbm5lbH1gO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDIwMCwgNTApO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFBvc2l0aW9uKHBvc2l0aW9uIDogVmVjMikgOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5zZXRQb3NpdGlvbihwb3NpdGlvbik7XHJcblxyXG4gICAgICAgIGNvbnN0IFt4MSwgeTEsIHgyLCB5Ml0gPSB0aGlzLmdldENvcm5lclBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmlucHV0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBjb25zdCBpbnB1dF94ID0geDEgKyAxMDtcclxuICAgICAgICBjb25zdCBpbnB1dF95ID0geTEgKyAwLjUgKiAoKHkyIC0geTEpIC0gcmVjdC5oZWlnaHQpO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLmxlZnQgPSBgJHtpbnB1dF94fXB4YDtcclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLnRvcCAgPSBgJHtpbnB1dF95fXB4YDtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZHJhd0RhdGFmbG93QmxvY2soKTtcclxuICAgICAgICB0aGlzLmRyYXdJY29uKG1vdG9ySWNvbik7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgdmFsdWVDaGFuZ2VkKCl7XHJcbiAgICAgICAgY29uc3QgY2hhbm5lbCA9IHBhcnNlSW50KHRoaXMuaW5wdXQudmFsdWUpO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlICAgPSB0aGlzLnBvcnRzWzBdLnZhbHVlO1xyXG4gICAgICAgIG1zZyhgbW90b3IgY2hhbmdlZCA6IGNoOiR7Y2hhbm5lbH0gdmFsdWU6WyR7dmFsdWV9XWApO1xyXG4gICAgICAgIGlmKHR5cGVvZiB2YWx1ZSAhPSBcIm51bWJlclwiKXtcclxuICAgICAgICAgICAgbXNnKGBpbGxlZ2FsIG1vdG9yIHZhbHVlOiR7dmFsdWV9YCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGF3YWl0IHNlbmREYXRhKHtcclxuICAgICAgICAgICAgY29tbWFuZCA6IFwic2Vydm9cIixcclxuICAgICAgICAgICAgY2hhbm5lbCA6IGNoYW5uZWwsXHJcbiAgICAgICAgICAgIHZhbHVlICAgOiB2YWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBjYWxjKCl7XHJcbiAgICAgICAgbXNnKGBtb3RvciBjYWxjOiR7dGhpcy5wb3J0c1swXS52YWx1ZX1gKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcblxyXG5hYnN0cmFjdCBjbGFzcyBJbnB1dFRleHRCbG9jayBleHRlbmRzIElucHV0QmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQudHlwZSA9IFwidGV4dFwiO1xyXG4gICAgfVxyXG5cclxuICAgIG1ha2VPYmooKSA6IGFueSB7XHJcbiAgICAgICAgbGV0IG9iaiA9IE9iamVjdC5hc3NpZ24oc3VwZXIubWFrZU9iaigpLCB7XHJcbiAgICAgICAgICAgIHRleHQgOiB0aGlzLmlucHV0LnZhbHVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZE9iaihvYmogOiBhbnkgKXsgICAgICAgIFxyXG4gICAgICAgIHN1cGVyLmxvYWRPYmoob2JqKTtcclxuICAgICAgICB0aGlzLmlucHV0LnZhbHVlID0gb2JqLnRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDIwMCwgMjAgKyAyICogMiAqIG5vdGNoUmFkaXVzKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgdGhpcy5kcmF3RGF0YWZsb3dCbG9jaygpO1xyXG4gICAgfVxyXG5cclxuICAgIG1ha2VJbnB1dFZhbHVlTWFwKCkgOiBNYXA8c3RyaW5nLCBudW1iZXI+IHtcclxuICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xyXG4gICAgICAgIGZvcihjb25zdCBwb3J0IG9mIHRoaXMucG9ydHMpe1xyXG4gICAgICAgICAgICBpZihwb3J0LnR5cGUgPT0gUG9ydFR5cGUuaW5wdXRQb3J0KXtcclxuICAgICAgICAgICAgICAgIGFzc2VydChwb3J0Lm5hbWUgIT0gXCJcIiAmJiB0eXBlb2YgcG9ydC52YWx1ZSA9PT0gJ251bWJlcicgJiYgISBpc05hTihwb3J0LnZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICBtYXAuc2V0KHBvcnQubmFtZSwgcG9ydC52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBtYXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXRWYWx1ZUJsb2NrIGV4dGVuZHMgSW5wdXRUZXh0QmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LnN0eWxlLndpZHRoID0gXCI0NXB4XCI7XHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGV2IDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgbXNnKGBjaGFuZ2UgOiBbJHt0aGlzLmlucHV0LnZhbHVlfV1gKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLnRvcCksXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLm91dHB1dFBvcnQpLFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5ib3R0b20pLFxyXG4gICAgICAgIF07XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMjAwLCA1MCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIGNvbnN0IFtwb3MsIHNpemVdID0gdGhpcy5kcmF3Qm94KCk7XHJcbiAgICAgICAgY29uc3QgeDEgPSBwb3MueCArIHRoaXMuYm9yZGVyV2lkdGggKyBibG9ja0xpbmVXaWR0aDtcclxuXHJcbiAgICAgICAgY29uc3QgeDIgPSB4MSArIDM1O1xyXG4gICAgICAgIGNvbnN0IHgzID0geDEgKyB0aGlzLm1pblNpemUhLng7XHJcblxyXG4gICAgICAgIGNvbnN0IHkxID0gcG9zLnkgKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcbiAgICAgICAgY29uc3QgeTIgPSB5MSArIHRoaXMubWluU2l6ZSEueSAtIG5vdGNoUmFkaXVzO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdPdXRsaW5lKFtcclxuICAgICAgICAgICAgW3gxLCB5MSwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICBbeDEsIHkyLCBudWxsXSxcclxuICAgICAgICAgICAgW3gyLCB5MiwgdGhpcy5wb3J0c1syXV0sXHJcbiAgICAgICAgICAgIFt4MywgeTIsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3gzLCB5MSwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTEsIHRoaXMucG9ydHNbMF1dXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3SU9Qb3J0cyh4MSwgeDMsIHkxLCB5Mik7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQ2FtZXJhQmxvY2sgZXh0ZW5kcyBCbG9jayB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUub3V0cHV0UG9ydCkgXTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgaWYodGhpcy5pblRvb2xib3gpe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMzIwLCA1MCArIDIgKiBub3RjaFJhZGl1cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigzMjAsIDI0MCArIDIgKiBub3RjaFJhZGl1cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgdGhpcy5kcmF3RGF0YWZsb3dCbG9jaygpO1xyXG5cclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB4MiwgeTJdID0gdGhpcy5nZXRDb3JuZXJQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICBsZXQgaW1nIDogSFRNTEltYWdlRWxlbWVudDtcclxuXHJcbiAgICAgICAgaWYodGhpcy5pblRvb2xib3gpe1xyXG5cclxuICAgICAgICAgICAgaW1nID0gY2FtZXJhSWNvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIGlmKGNhbWVyYUltZyA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGltZyA9IGNhbWVyYUltZztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgaW1nX2hlaWdodCA9ICh5MiAtIHkxKSAtIDIgKiBub3RjaFJhZGl1cztcclxuICAgICAgICBjb25zdCBpbWdfd2lkdGggID0gaW1nX2hlaWdodCAqIGltZy53aWR0aCAvIGltZy5oZWlnaHQ7XHJcblxyXG4gICAgICAgIGNvbnN0IGltZ194ID0geDEgKyAwLjUgKiAoKHgyIC0geDEpIC0gaW1nX3dpZHRoKTtcclxuICAgICAgICBjb25zdCBpbWdfeSA9IHkxO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoaW1nLCBpbWdfeCwgaW1nX3ksIGltZ193aWR0aCwgaW1nX2hlaWdodCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUVFNCbG9jayBleHRlbmRzIElucHV0VGV4dEJsb2NrIHtcclxuICAgIHNwZWVjaCA6IFNwZWVjaDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLnRvcCksIFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5ib3R0b20pIFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSBcIuOBk+OCk+OBq+OBoeOBryHjganjgYbjgZ7jgojjgo3jgZfjgY8hXCI7XHJcblxyXG4gICAgICAgIGkxOG5fdHMuc2V0Vm9pY2VMYW5ndWFnZUNvZGUoXCJqcG5cIik7XHJcbiAgICAgICAgdGhpcy5zcGVlY2ggPSBuZXcgU3BlZWNoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWluU2l6ZSgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5taW5TaXplID0gbmV3IFZlYzIoMzAwLCA1MCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRyYXdBY3Rpb25CbG9jaygpO1xyXG4gICAgICAgIHRoaXMuZHJhd0ljb24odHRzSWNvbik7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuKCl7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5zcGVlY2guc3BlYWtfd2FpdEVuZCh0aGlzLmlucHV0LnZhbHVlLnRyaW0oKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgU2xlZXBCbG9jayBleHRlbmRzIElucHV0VGV4dEJsb2NrIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBcclxuICAgICAgICAgICAgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUudG9wKSwgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmJvdHRvbSkgXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9IFwiM1wiO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuc3R5bGUud2lkdGggPSBcIjQ1cHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigyMDAsIDUwKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZHJhd0FjdGlvbkJsb2NrKCk7XHJcbiAgICAgICAgdGhpcy5kcmF3SWNvbihzbGVlcEljb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJ1bigpe1xyXG4gICAgICAgIGNvbnN0IHNlY29uZCA9IHBhcnNlRmxvYXQodGhpcy5pbnB1dC52YWx1ZS50cmltKCkpO1xyXG4gICAgICAgIGF3YWl0IHNsZWVwKHNlY29uZCAqIDEwMDApO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRmFjZURldGVjdGlvbkJsb2NrIGV4dGVuZHMgQmxvY2sge1xyXG4gICAgZmFjZSA6IG51bWJlcltdID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLmlucHV0UG9ydCksIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLm91dHB1dFBvcnQpLCBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5vdXRwdXRQb3J0KSBdO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgIGlmKHRoaXMuaW5Ub29sYm94KXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDE1MCwgMTAgKyAyICogMiAqIG5vdGNoUmFkaXVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDMyMCwgMjQwICsgMiAqIDIgKiBub3RjaFJhZGl1cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldEZhY2UoZmFjZSA6IG51bWJlcltdKXtcclxuICAgICAgICB0aGlzLmZhY2UgPSBmYWNlLnNsaWNlKCk7XHJcbiAgICAgICAgY29uc3QgW3gsIHksIHcsIGhdID0gdGhpcy5mYWNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGN4ID0geCArIHcgLyAyO1xyXG4gICAgICAgIGNvbnN0IGN5ID0geSArIGggLyAyO1xyXG5cclxuICAgICAgICB0aGlzLnBvcnRzWzFdLnNldFBvcnRWYWx1ZShjeCk7XHJcbiAgICAgICAgdGhpcy5wb3J0c1syXS5zZXRQb3J0VmFsdWUoY3kpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENhbWVyYSgpIDogQ2FtZXJhQmxvY2sgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGlmKHRoaXMucG9ydHNbMF0uc291cmNlcy5sZW5ndGggIT0gMCl7XHJcbiAgICAgICAgICAgIGNvbnN0IGNhbWVyYSA9IHRoaXMucG9ydHNbMF0uc291cmNlcy5tYXAoeCA9PiB4LnBhcmVudCkuZmluZCh4ID0+IHggaW5zdGFuY2VvZiBDYW1lcmFCbG9jayk7XHJcbiAgICAgICAgICAgIHJldHVybiBjYW1lcmE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKXtcclxuICAgICAgICB0aGlzLmRyYXdEYXRhZmxvd0Jsb2NrKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNhbWVyYSA9IHRoaXMuZ2V0Q2FtZXJhKCk7XHJcbiAgICAgICAgaWYoY2FtZXJhICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGNvbnN0IFt4MSwgeTEsIHgyLCB5Ml0gPSB0aGlzLmdldENvcm5lclBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBpZihjYW1lcmFJbWcgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBpbWcgPSBjYW1lcmFJbWc7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpbWdfaGVpZ2h0ID0gKHkyIC0geTEpIC0gMiAqIDIgKiBub3RjaFJhZGl1cztcclxuICAgICAgICAgICAgY29uc3QgaW1nX3dpZHRoICA9IGltZ19oZWlnaHQgKiBpbWcud2lkdGggLyBpbWcuaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaW1nX3ggPSB4MSArIDAuNSAqICgoeDIgLSB4MSkgLSBpbWdfd2lkdGgpO1xyXG4gICAgICAgICAgICBjb25zdCBpbWdfeSA9IHkxICsgMiAqIG5vdGNoUmFkaXVzO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGltZywgaW1nX3gsIGltZ195LCBpbWdfd2lkdGgsIGltZ19oZWlnaHQpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMuZmFjZS5sZW5ndGggPT0gNCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2V0IHRoZSBzdHJva2UgY29sb3IgdG8gcmVkXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdyZWQnO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgbGluZSB0aGlja25lc3MgdG8gNSBwaXhlbHNcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDU7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgW2ZhY2VfeCwgZmFjZV95LCBmYWNlX3csIGZhY2VfaF0gPSB0aGlzLmZhY2U7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgY3ggPSBpbWdfeCArIGltZ193aWR0aCAgLyAyO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3kgPSBpbWdfeSArIGltZ19oZWlnaHQgLyAyO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGltZ19mYWNlX3ggPSBjeCArIGltZ193aWR0aCAgKiBmYWNlX3ggLyAxMDA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbWdfZmFjZV95ID0gY3kgKyBpbWdfaGVpZ2h0ICogZmFjZV95IC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW1nX2ZhY2VfdyA9IGltZ193aWR0aCAgKiBmYWNlX3cgLyAxMDA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbWdfZmFjZV9oID0gaW1nX2hlaWdodCAqIGZhY2VfaCAvIDEwMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEcmF3IGFuIG91dGxpbmVkIHJlY3RhbmdsZSBhdCAoMjAwLCA1MCkgd2l0aCBhIHNpemUgb2YgMTAweDc1XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VSZWN0KGltZ19mYWNlX3gsIGltZ19mYWNlX3ksIGltZ19mYWNlX3csIGltZ19mYWNlX2gpOyAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEpveVN0aWNrQmxvY2sgZXh0ZW5kcyBCbG9jayB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhIDogQXR0cil7XHJcbiAgICAgICAgc3VwZXIoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5wb3J0cyA9IFsgXTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigxNTAsIDUwKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFVsdHJhc29uaWNEaXN0YW5jZVNlbnNvckJsb2NrIGV4dGVuZHMgQmxvY2sge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5vdXRwdXRQb3J0KSBcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1pblNpemUoKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubWluU2l6ZSA9IG5ldyBWZWMyKDMwMCwgNTApO1xyXG4gICAgfVxyXG5cclxuICAgIHNldERpc3RhbmNlKGRpc3RhbmNlIDogbnVtYmVyKXtcclxuICAgICAgICB0aGlzLnBvcnRzWzBdLnNldFBvcnRWYWx1ZShkaXN0YW5jZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRyYXdEYXRhZmxvd0Jsb2NrKCk7XHJcbiAgICAgICAgdGhpcy5kcmF3SWNvbihkaXN0YW5jZVNlbnNvckljb24pO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiAgY2FsY1Rlcm0obWFwIDogTWFwPHN0cmluZywgbnVtYmVyPiwgdGVybSA6IFRlcm0pIDogbnVtYmVyIHtcclxuICAgIGxldCB2YWx1ZSA6IG51bWJlcjtcclxuXHJcbiAgICBpZih0ZXJtIGluc3RhbmNlb2YgUmF0aW9uYWwpe1xyXG4gICAgICAgIHJldHVybiB0ZXJtLmZ2YWwoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYodGVybSBpbnN0YW5jZW9mIENvbnN0TnVtKXtcclxuICAgICAgICByZXR1cm4gdGVybS52YWx1ZS5mdmFsKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKHRlcm0gaW5zdGFuY2VvZiBSZWZWYXIpe1xyXG4gICAgICAgIHZhbHVlID0gbWFwLmdldCh0ZXJtLm5hbWUpITtcclxuICAgICAgICBhc3NlcnQodmFsdWUgIT0gdW5kZWZpbmVkKTtcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKHRlcm0gaW5zdGFuY2VvZiBBcHApe1xyXG4gICAgICAgIGNvbnN0IGFwcCA9IHRlcm07XHJcbiAgICAgICAgY29uc3QgYXJnX3ZhbHVlcyA9IGFwcC5hcmdzLm1hcCh4ID0+IGNhbGNUZXJtKG1hcCwgeCkpO1xyXG4gICAgICAgIGlmKGFwcC5pc0FkZCgpKXtcclxuICAgICAgICAgICAgdmFsdWUgPSBzdW0oYXJnX3ZhbHVlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoYXBwLmlzTXVsKCkpe1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGFyZ192YWx1ZXMucmVkdWNlKChhY2MsIGN1cikgPT4gYWNjICogY3VyLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihhcHAuaXNEaXYoKSl7XHJcbiAgICAgICAgICAgIHZhbHVlID0gYXJnX3ZhbHVlc1swXSAvIGFyZ192YWx1ZXNbMV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoYXBwLmlzRXEoKSl7XHJcbiAgICAgICAgICAgIHZhbHVlID0gKGFyZ192YWx1ZXNbMF0gPT0gYXJnX3ZhbHVlc1sxXSA/IDEgOiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihhcHAuZm5jTmFtZSA9PSBcIjw9XCIpe1xyXG4gICAgICAgICAgICB2YWx1ZSA9IChhcmdfdmFsdWVzWzBdIDw9IGFyZ192YWx1ZXNbMV0gPyAxIDogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoYXBwLmZuY05hbWUgPT0gXCI8XCIpe1xyXG4gICAgICAgICAgICB2YWx1ZSA9IChhcmdfdmFsdWVzWzBdIDwgYXJnX3ZhbHVlc1sxXSA/IDEgOiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoXCJ1bmltcGxlbWVudGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2V7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBNeUVycm9yKFwidW5pbXBsZW1lbnRlZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGVybS52YWx1ZS5mdmFsKCkgKiB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENhbGNCbG9jayBleHRlbmRzIElucHV0VGV4dEJsb2NrIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBcclxuICAgICAgICAgICAgbmV3IFBvcnQodGhpcywgUG9ydFR5cGUuaW5wdXRQb3J0LCBcImFcIiksIFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5vdXRwdXRQb3J0LCBcImJcIikgXHJcbiAgICAgICAgXTtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjKCl7XHJcbiAgICAgICAgbXNnKGBzdGFydCBjYWxjOiBhOiR7dGhpcy5wb3J0c1swXS52YWx1ZX1gKTtcclxuICAgICAgICBjb25zdCBleHByID0gcGFyc2VNYXRoKHRoaXMuaW5wdXQudmFsdWUudHJpbSgpKSBhcyBBcHA7XHJcbiAgICAgICAgYXNzZXJ0KGV4cHIuaXNSb290RXEoKSk7XHJcbiAgICAgICAgY29uc3QgbGhzID0gZXhwci5hcmdzWzBdIGFzIFJlZlZhcjtcclxuICAgICAgICBjb25zdCByaHMgPSBleHByLmFyZ3NbMV07XHJcblxyXG4gICAgICAgIGNvbnN0IG1hcCA9IHRoaXMubWFrZUlucHV0VmFsdWVNYXAoKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmhzX3ZhbHVlID0gY2FsY1Rlcm0obWFwLCByaHMpO1xyXG4gICAgICAgIGNvbnN0IGxoc19wb3J0ID0gdGhpcy5wb3J0cy5maW5kKHggPT4geC5uYW1lID09IGxocy5uYW1lICYmIHgudHlwZSA9PSBQb3J0VHlwZS5vdXRwdXRQb3J0KSE7XHJcbiAgICAgICAgYXNzZXJ0KGxoc19wb3J0ICE9IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgbGhzX3BvcnQuc2V0UG9ydFZhbHVlKHJoc192YWx1ZSk7XHJcblxyXG4gICAgICAgIG1zZyhgZW5kIGNhbGM6IGI6JHt0aGlzLnBvcnRzWzFdLnZhbHVlfWApO1xyXG5cclxuICAgICAgICB0aGlzLnByb3BlcmdhdGVDYWxjKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDb21wYXJlQmxvY2sgZXh0ZW5kcyBJbnB1dFRleHRCbG9jayB7ICAgIFxyXG4gICAgY29uc3RydWN0b3IoZGF0YSA6IEF0dHIpe1xyXG4gICAgICAgIHN1cGVyKGRhdGEpO1xyXG4gICAgICAgIHRoaXMucG9ydHMgPSBbIFxyXG4gICAgICAgICAgICBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5pbnB1dFBvcnQsIFwiYVwiKSwgXHJcbiAgICAgICAgICAgIG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLm91dHB1dFBvcnQpIFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSBcImEgPT0gYVwiO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGMoKSB7XHJcbiAgICAgICAgbXNnKGBzdGFydCBjb21wYXJlOiBhOiR7dGhpcy5wb3J0c1swXS52YWx1ZX1gKTtcclxuICAgICAgICBsZXQgZXhwciA6IEFwcDtcclxuXHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBleHByID0gcGFyc2VNYXRoKHRoaXMuaW5wdXQudmFsdWUudHJpbSgpKSBhcyBBcHA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoKGVycm9yKXtcclxuICAgICAgICAgICAgaWYoZXJyb3IgaW5zdGFuY2VvZiBwYXJzZXJfdHMuU3ludGF4RXJyb3Ipe1xyXG4gICAgICAgICAgICAgICAgbXNnKGBzeW50YXggZXJyb3JgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQ6XCIsIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5wb3J0c1sxXS5zZXRQb3J0VmFsdWUodW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWFwID0gdGhpcy5tYWtlSW5wdXRWYWx1ZU1hcCgpO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNhbGNUZXJtKG1hcCwgZXhwcik7XHJcblxyXG4gICAgICAgIGlmKHJlc3VsdCA9PSAwIHx8IHJlc3VsdCA9PSAxKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucG9ydHNbMV0uc2V0UG9ydFZhbHVlKHJlc3VsdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICBtc2coYGlsbGVnYWwgY29tcGFyZSByZXN1bHQ6JHtyZXN1bHR9YCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9ydHNbMV0uc2V0UG9ydFZhbHVlKHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBtYWtlQmxvY2tCeVR5cGVOYW1lKHR5cGVOYW1lIDogc3RyaW5nKSA6IEJsb2NrIHtcclxuICAgIHN3aXRjaCh0eXBlTmFtZSl7XHJcbiAgICBjYXNlIElmQmxvY2submFtZTogICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgSWZCbG9jayh7fSk7XHJcbiAgICBjYXNlIENvbXBhcmVCbG9jay5uYW1lOiAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcGFyZUJsb2NrKHt9KTtcclxuICAgIGNhc2UgSW5maW5pdGVMb29wLm5hbWU6ICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBJbmZpbml0ZUxvb3Aoe30pO1xyXG4gICAgY2FzZSBJbnB1dFJhbmdlQmxvY2submFtZTogICAgICAgICAgICAgICByZXR1cm4gbmV3IElucHV0UmFuZ2VCbG9jayh7fSk7XHJcbiAgICBjYXNlIFNlcnZvTW90b3JCbG9jay5uYW1lOiAgICAgICAgICAgICAgIHJldHVybiBuZXcgU2Vydm9Nb3RvckJsb2NrKHt9KTtcclxuICAgIGNhc2UgU2V0VmFsdWVCbG9jay5uYW1lOiAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTZXRWYWx1ZUJsb2NrKHt9KTtcclxuICAgIGNhc2UgQ2FtZXJhQmxvY2submFtZTogICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDYW1lcmFCbG9jayh7fSk7XHJcbiAgICBjYXNlIFRUU0Jsb2NrLm5hbWU6ICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVFRTQmxvY2soe30pO1xyXG4gICAgY2FzZSBTbGVlcEJsb2NrLm5hbWU6ICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNsZWVwQmxvY2soe30pO1xyXG4gICAgY2FzZSBGYWNlRGV0ZWN0aW9uQmxvY2submFtZTogICAgICAgICAgICByZXR1cm4gbmV3IEZhY2VEZXRlY3Rpb25CbG9jayh7fSk7XHJcbiAgICBjYXNlIEpveVN0aWNrQmxvY2submFtZTogICAgICAgICAgICAgICAgIHJldHVybiBuZXcgSm95U3RpY2tCbG9jayh7fSk7XHJcbiAgICBjYXNlIFVsdHJhc29uaWNEaXN0YW5jZVNlbnNvckJsb2NrLm5hbWU6IHJldHVybiBuZXcgVWx0cmFzb25pY0Rpc3RhbmNlU2Vuc29yQmxvY2soe30pO1xyXG4gICAgY2FzZSBDYWxjQmxvY2submFtZTogICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENhbGNCbG9jayh7fSk7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbn0iLCJuYW1lc3BhY2UgZGlhZ3JhbV90cyB7XHJcbi8vXHJcbmV4cG9ydCBsZXQgcmVwYWludENvdW50ID0gMDtcclxuXHJcbmxldCBhbmltYXRpb25GcmFtZUlkIDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2FudmFzIHtcclxuICAgIHN0YXRpYyBvbmUgOiBDYW52YXM7XHJcblxyXG4gICAgY2FudmFzIDogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjdHggOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XHJcbiAgICByb290ICAgOiBHcmlkO1xyXG4gICAgZHJhZ2dlZFVJPyA6IEJsb2NrIHwgUG9ydCB8IEJ1dHRvbjtcclxuICAgIG5lYXJQb3J0cyA6IFBvcnRbXSA9IFtdO1xyXG4gICAgcG9pbnRlcklkIDogbnVtYmVyID0gTmFOO1xyXG5cclxuICAgIGRvd25Qb3MgOiBWZWMyID0gVmVjMi56ZXJvKCk7XHJcbiAgICBtb3ZlUG9zIDogVmVjMiA9IFZlYzIuemVybygpO1xyXG4gICAgdWlPcmdQb3MgOiBWZWMyID0gVmVjMi56ZXJvKCk7XHJcblxyXG4gICAgbW92ZWQgOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY2FudmFzX2h0bWwgOiBIVE1MQ2FudmFzRWxlbWVudCwgcm9vdCA6IEdyaWQpe1xyXG4gICAgICAgIENhbnZhcy5vbmUgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzX2h0bWw7XHJcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpITsgLy8gT3IgJ3dlYmdsJywgJ3dlYmdsMidcclxuICAgICAgICBpZiAoIXRoaXMuY3R4KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYW52YXMgY29udGV4dCBub3Qgc3VwcG9ydGVkIVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XHJcblxyXG4gICAgICAgIHNldENvbnRleHQyRCh0aGlzLmN0eCwgdGhpcy5yb290KTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsICB0aGlzLnBvaW50ZXJkb3duLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybW92ZVwiLCAgdGhpcy5wb2ludGVybW92ZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcnVwXCIgICwgYXN5bmMgKGV2OlBvaW50ZXJFdmVudCk9PntcclxuICAgICAgICAgICAgYXdhaXQgQ2FudmFzLm9uZS5wb2ludGVydXAoZXYpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFBvc2l0aW9uSW5DYW52YXMoZXZlbnQgOiBQb2ludGVyRXZlbnQpIDogVmVjMiB7XHJcbiAgICAgICAgLy8gR2V0IHRoZSBib3VuZGluZyByZWN0YW5nbGUgb2YgdGhlIGNhbnZhc1xyXG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBzY2FsaW5nIGZhY3RvcnMgaWYgdGhlIGNhbnZhcyBpcyBzdHlsZWQgZGlmZmVyZW50bHkgZnJvbSBpdHMgaW50ZXJuYWwgcmVzb2x1dGlvblxyXG4gICAgICAgIGNvbnN0IHNjYWxlWCA9IHRoaXMuY2FudmFzLndpZHRoIC8gcmVjdC53aWR0aDtcclxuICAgICAgICBjb25zdCBzY2FsZVkgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLyByZWN0LmhlaWdodDtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjYW52YXMgY29vcmRpbmF0ZXNcclxuICAgICAgICBjb25zdCBjYW52YXNYID0gKGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQpICogc2NhbGVYO1xyXG4gICAgICAgIGNvbnN0IGNhbnZhc1kgPSAoZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wKSAqIHNjYWxlWTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKGNhbnZhc1gsIGNhbnZhc1kpO1xyXG4gICAgICAgIC8vIE5vdyB5b3UgaGF2ZSB0aGUgY2FudmFzIGNvb3JkaW5hdGVzIVxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBDYW52YXMgWDogJHtjYW52YXNYfSwgQ2FudmFzIFk6ICR7Y2FudmFzWX1gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRVSUZyb21Qb3NpdGlvbih1aSA6IFVJLCBwb3MgOiBWZWMyKSA6IFVJIHwgUG9ydCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgZm9yKGNvbnN0IGNoaWxkIG9mIHVpLmNoaWxkcmVuKCkpe1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmdldFVJRnJvbVBvc2l0aW9uKGNoaWxkLCBwb3MpO1xyXG4gICAgICAgICAgICBpZih0YXJnZXQgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHVpLnBvc2l0aW9uLnggPD0gcG9zLnggJiYgcG9zLnggPCB1aS5wb3NpdGlvbi54ICsgdWkuYm94U2l6ZS54KXtcclxuICAgICAgICAgICAgaWYodWkucG9zaXRpb24ueSA8PSBwb3MueSAmJiBwb3MueSA8IHVpLnBvc2l0aW9uLnkgKyB1aS5ib3hTaXplLnkpe1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHVpIGluc3RhbmNlb2YgQmxvY2spe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcnQgPSB1aS5nZXRQb3J0RnJvbVBvc2l0aW9uKHBvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYocG9ydCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcG9ydDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHBvaW50ZXJkb3duKGV2OlBvaW50ZXJFdmVudCl7XHJcbiAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmdldFBvc2l0aW9uSW5DYW52YXMoZXYpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VUlGcm9tUG9zaXRpb24odGhpcy5yb290LCBwb3MpO1xyXG4gICAgICAgIGlmKHRhcmdldCAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBtc2coYGRvd246JHt0YXJnZXQuY29uc3RydWN0b3IubmFtZX1gKTtcclxuICAgICAgICAgICAgdGhpcy5kb3duUG9zICAgPSBwb3M7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZVBvcyAgID0gcG9zO1xyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0IGluc3RhbmNlb2YgQmxvY2spe1xyXG4gICAgICAgICAgICAgICAgaWYodGFyZ2V0IGluc3RhbmNlb2YgSW5wdXRSYW5nZUJsb2NrKXtcclxuICAgICAgICAgICAgICAgICAgICBtc2coYHJhbmdlOiBib3gke3RhcmdldC5ib3hTaXplLngudG9GaXhlZCgpfSBvdXQ6JHt0YXJnZXQubWluU2l6ZSEueH1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZih0YXJnZXQuaW5Ub29sYm94KXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmxvY2sgPSB0YXJnZXQuY29weSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIE1haW4ub25lLmVkaXRvci5hZGRCbG9jayhibG9jayk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFVJID0gYmxvY2tcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFVJID0gdGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGFyZ2V0IGluc3RhbmNlb2YgUG9ydCl7XHJcblxyXG4gICAgICAgICAgICAgICAgbXNnKGBkb3duIHBvcnQ6JHt0YXJnZXQuc3RyKCl9YCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnZWRVSSA9IHRhcmdldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRhcmdldCBpbnN0YW5jZW9mIEJ1dHRvbil7XHJcblxyXG4gICAgICAgICAgICAgICAgbXNnKGBkb3duIGJ1dHRvbjoke3RhcmdldC50ZXh0fWApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2VkVUkgPSB0YXJnZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIHRoaXMudWlPcmdQb3MgID0gdGhpcy5kcmFnZ2VkVUkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJJZCA9IGV2LnBvaW50ZXJJZDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnNldFBvaW50ZXJDYXB0dXJlKHRoaXMucG9pbnRlcklkKTtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuY2xhc3NMaXN0LmFkZCgnZHJhZ2dpbmcnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TmVhclBvcnRzKGRyYWdnZWRfYmxvY2sgOiBCbG9jayl7XHJcbiAgICAgICAgdGhpcy5uZWFyUG9ydHMgPSBbXTtcclxuICAgICAgICBjb25zdCBvdGhlcl9ibG9ja3MgPSBNYWluLm9uZS5lZGl0b3IuYmxvY2tzLmZpbHRlcih4ID0+IHggIT0gdGhpcy5kcmFnZ2VkVUkpO1xyXG4gICAgICAgIGZvcihjb25zdCBibG9jayBvZiBvdGhlcl9ibG9ja3Mpe1xyXG4gICAgICAgICAgICBjb25zdCBuZWFyX3BvcnRzID0gZHJhZ2dlZF9ibG9jay5jYW5Db25uZWN0TmVhclBvcnRQYWlyKGJsb2NrKTtcclxuICAgICAgICAgICAgaWYobmVhcl9wb3J0cy5sZW5ndGggIT0gMCl7XHJcbiAgICAgICAgICAgICAgICBtc2coYG5lYXJgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubmVhclBvcnRzID0gbmVhcl9wb3J0cztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwb2ludGVybW92ZShldjpQb2ludGVyRXZlbnQpe1xyXG4gICAgICAgIHRoaXMubW92ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZih0aGlzLmRyYWdnZWRVSSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmdldFBvc2l0aW9uSW5DYW52YXMoZXYpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VUlGcm9tUG9zaXRpb24odGhpcy5yb290LCBwb3MpO1xyXG4gICAgICAgIGNvbnN0IHMgPSAodGFyZ2V0ID09IHVuZGVmaW5lZCA/IFwiXCIgOiBgdGFyZ2V0Olske3RhcmdldC5zdHIoKX1dYCk7XHJcblxyXG4gICAgICAgIHRoaXMubW92ZVBvcyA9IHBvcztcclxuXHJcbiAgICAgICAgY29uc3QgZGlmZiA9IHBvcy5zdWIodGhpcy5kb3duUG9zKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5kcmFnZ2VkVUkgaW5zdGFuY2VvZiBCbG9jayl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWRVSS5zZXRQb3NpdGlvbiggdGhpcy51aU9yZ1Bvcy5hZGQoZGlmZikgKTtcclxuICAgICAgICAgICAgdGhpcy5nZXROZWFyUG9ydHModGhpcy5kcmFnZ2VkVUkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlQ2FudmFzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWVzdFVwZGF0ZUNhbnZhcygpe1xyXG4gICAgICAgIGlmIChhbmltYXRpb25GcmFtZUlkID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGFuaW1hdGlvbkZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCk9PntcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkZyYW1lSWQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXBhaW50KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9ICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBwb2ludGVydXAoZXY6UG9pbnRlckV2ZW50KXtcclxuICAgICAgICBpZih0aGlzLmRyYWdnZWRVSSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmdldFBvc2l0aW9uSW5DYW52YXMoZXYpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VUlGcm9tUG9zaXRpb24odGhpcy5yb290LCBwb3MpO1xyXG5cclxuICAgICAgICBpZih0aGlzLm1vdmVkKXtcclxuICAgICAgICAgICAgbXNnKFwiZHJhZ2dlZFwiKTtcclxuICAgICAgICAgICAgaWYodGhpcy5kcmFnZ2VkVUkgaW5zdGFuY2VvZiBQb3J0ICYmIHRhcmdldCBpbnN0YW5jZW9mIFBvcnQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2VkVUkuY29ubmVjdCh0YXJnZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5kcmFnZ2VkVUkgaW5zdGFuY2VvZiBCbG9jayl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaWZmID0gcG9zLnN1Yih0aGlzLmRvd25Qb3MpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0TmVhclBvcnRzKHRoaXMuZHJhZ2dlZFVJKTtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubmVhclBvcnRzLmxlbmd0aCA9PSAyKXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3J0X2RpZmZzID0gdGhpcy5uZWFyUG9ydHNbMV0ucG9zaXRpb24uc3ViKHRoaXMubmVhclBvcnRzWzBdLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnZWRVSS5tb3ZlRGlmZihwb3J0X2RpZmZzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2VkVUkuY29ubmVjdEJsb2NrKHRoaXMubmVhclBvcnRzKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheW91dFJvb3QoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2VkVUkuc2V0UG9zaXRpb24oIHRoaXMudWlPcmdQb3MuYWRkKGRpZmYpICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgbXNnKGBjbGljazoke3RoaXMuZHJhZ2dlZFVJLmNvbnN0cnVjdG9yLm5hbWV9YCk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmRyYWdnZWRVSSBpbnN0YW5jZW9mIEJ1dHRvbil7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRyYWdnZWRVSS5jbGljaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNhbnZhcy5yZWxlYXNlUG9pbnRlckNhcHR1cmUodGhpcy5wb2ludGVySWQpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdnaW5nJyk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhZ2dlZFVJID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMucG9pbnRlcklkID0gTmFOO1xyXG4gICAgICAgIHRoaXMubmVhclBvcnRzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZUNhbnZhcygpO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGxheW91dFJvb3QoKXtcclxuICAgICAgICB0aGlzLnJvb3Quc2V0TWluU2l6ZSgpO1xyXG4gICAgICAgIHRoaXMucm9vdC5sYXlvdXQoMCwgMCwgbmV3IFZlYzIodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCksIDApOyAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplQ2FudmFzKCkge1xyXG4gICAgICAgIC8vIFNldCB0aGUgY2FudmFzJ3MgaW50ZXJuYWwgZHJhd2luZyBkaW1lbnNpb25zIHRvIG1hdGNoIGl0cyBkaXNwbGF5IHNpemVcclxuICAgICAgICAvLyB3aW5kb3cuaW5uZXJXaWR0aC9IZWlnaHQgZ2l2ZSB0aGUgdmlld3BvcnQgZGltZW5zaW9ucy5cclxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCAgPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgICAgIC8vIElmIHlvdSdyZSBkcmF3aW5nIHNvbWV0aGluZywgeW91IG1pZ2h0IHdhbnQgdG8gcmVkcmF3IGl0IGhlcmVcclxuICAgICAgICBpZiAodGhpcy5jdHgpIHtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpOyAvLyBDbGVhciB0aGUgY2FudmFzXHJcbiAgICAgICAgICAgIC8vIEV4YW1wbGUgZHJhd2luZ1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnYmx1ZSc7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KDUwLCA1MCwgMTAwLCAxMDApO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5mb250ID0gJzMwcHggQXJpYWwnO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCgnSGVsbG8gQ2FudmFzIScsIHRoaXMuY2FudmFzLndpZHRoIC8gMiAtIDEwMCwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxheW91dFJvb3QoKTtcclxuICAgICAgICB0aGlzLnJvb3QuZHVtcCgwKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlQ2FudmFzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0RyYWdnZWRQb3J0KHBvcnQgOiBQb3J0KXsgICAgICAgXHJcbiAgICAgICAgdGhpcy5kcmF3TGluZShwb3J0LnBvc2l0aW9uLCB0aGlzLm1vdmVQb3MsIFwiYmx1ZVwiKSA7XHJcbiAgICB9XHJcblxyXG4gICAgcmVwYWludCgpe1xyXG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTsgICAgICAgIFxyXG4gICAgICAgIHRoaXMucm9vdC5kcmF3KCk7XHJcbiAgICAgICAgaWYodGhpcy5kcmFnZ2VkVUkgaW5zdGFuY2VvZiBQb3J0KXtcclxuICAgICAgICAgICAgdGhpcy5kcmF3RHJhZ2dlZFBvcnQodGhpcy5kcmFnZ2VkVUkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBtc2coXCJyZXBhaW50XCIpO1xyXG4gICAgICAgIHJlcGFpbnRDb3VudCsrO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdMaW5lKHN0YXJ0IDogVmVjMiwgZW5kIDogVmVjMiwgY29sb3IgOiBzdHJpbmcsIGxpbmVXaWR0aCA6IG51bWJlciA9IDIpe1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoICAgPSBsaW5lV2lkdGg7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhzdGFydC54LCBzdGFydC55KTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8oZW5kLngsIGVuZC55KTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbn0iLCJuYW1lc3BhY2UgZGlhZ3JhbV90cyB7XHJcbi8vXHJcbmV4cG9ydCBsZXQgdXJsT3JpZ2luIDogc3RyaW5nO1xyXG5sZXQgc3RhcnRCdXR0b24gOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuZXhwb3J0IGxldCBzdG9wRmxhZyA6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGlzUnVubmluZyA6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbmNsYXNzIFZhcmlhYmxlIHtcclxuICAgIG5hbWUhIDogc3RyaW5nO1xyXG4gICAgdHlwZSEgOiBEYXRhVHlwZTtcclxufVxyXG5cclxuY2xhc3MgRmllbGQgZXh0ZW5kcyBWYXJpYWJsZSB7XHJcbiAgICBwYXJlbnQhIDogU3RydWN0O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU3RydWN0IHtcclxuICAgIG1lbWJlcnMgOiBGaWVsZFtdID0gW107XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBEYXRhVHlwZSB7XHJcbiAgICBkaW1lbnNpb25zIDogbnVtYmVyW10gPSBbXTtcclxuICAgIHR5cGVOYW1lISA6IHN0cmluZztcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQb3J0IHtcclxuICAgIHN0YXRpYyByYWRpdXMgPSAxMDsgICAgICAgIFxyXG5cclxuICAgIGlkeCA6IG51bWJlciA9IDA7XHJcbiAgICBuYW1lIDogc3RyaW5nO1xyXG4gICAgcGFyZW50IDogQmxvY2s7XHJcbiAgICBkZXN0aW5hdGlvbnMgOiBQb3J0W10gID0gW107XHJcbiAgICBzb3VyY2VzIDogUG9ydFtdICA9IFtdO1xyXG4gICAgdHlwZSA6IFBvcnRUeXBlO1xyXG4gICAgcGlwZXMgOiBQaXBlW10gPSBbXTtcclxuICAgIHBvc2l0aW9uIDogVmVjMiA9IFZlYzIuemVybygpO1xyXG5cclxuICAgIHByZXZWYWx1ZSA6IGFueSB8IHVuZGVmaW5lZDtcclxuICAgIHZhbHVlIDogYW55IHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCA6IEJsb2NrLCB0eXBlIDogUG9ydFR5cGUsIG5hbWUgOiBzdHJpbmcgPSBcIlwiKXtcclxuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICB0aGlzLnR5cGUgICA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5uYW1lICAgPSBuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHN0cigpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gXCJwb3J0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgY29weVBvcnQocGFyZW50IDogQmxvY2spIDogUG9ydCB7XHJcbiAgICAgICAgY29uc3QgcG9ydCA9IG5ldyBQb3J0KHBhcmVudCwgdGhpcy50eXBlKTtcclxuICAgICAgICBwb3J0LnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5jb3B5KCk7XHJcblxyXG4gICAgICAgIHJldHVybiBwb3J0O1xyXG4gICAgfVxyXG5cclxuICAgIG1ha2VPYmooKSA6IGFueXtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpZHggOiB0aGlzLmlkeCxcclxuICAgICAgICAgICAgZGVzdGluYXRpb25zIDogdGhpcy5kZXN0aW5hdGlvbnMubWFwKGRzdCA9PiBkc3QuaWR4KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UG9ydFZhbHVlKHZhbHVlIDogYW55IHwgdW5kZWZpbmVkKXtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBkc3Qgb2YgdGhpcy5kZXN0aW5hdGlvbnMpe1xyXG4gICAgICAgICAgICBkc3Quc2V0UG9ydFZhbHVlKHZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIGRzdC5wYXJlbnQudmFsdWVDaGFuZ2VkKClcclxuICAgICAgICAgICAgLnRoZW4oKCk9PntcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gdmFsdWUgY2hhbmdlOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc05lYXIocG9zIDogVmVjMil7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24uZGlzdGFuY2UocG9zKSA8IFBvcnQucmFkaXVzO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdQb3J0KGN0eCA6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY3ggOiBudW1iZXIsIGN5IDogbnVtYmVyKSA6IHZvaWQgeyAgICAgICBcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcblxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCA9IGN4O1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSA9IGN5O1xyXG5cclxuICAgICAgICBjdHguYXJjKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCBQb3J0LnJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xyXG5cclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IGRzdCBvZiB0aGlzLmRlc3RpbmF0aW9ucyl7XHJcbiAgICAgICAgICAgIENhbnZhcy5vbmUuZHJhd0xpbmUodGhpcy5wb3NpdGlvbiwgZHN0LnBvc2l0aW9uLCBcImJyb3duXCIsIDQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5uYW1lICE9IFwiXCIpe1xyXG4gICAgICAgICAgICAvLyBjdHguc3Ryb2tlVGV4dCh0aGlzLm5hbWUsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuICAgICAgICAgICAgY3R4LmZvbnQgPSAnMjRweCBBcmlhbCc7XHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc2l0aW9uLnggLSA3O1xyXG4gICAgICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NpdGlvbi55ICsgNztcclxuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KHRoaXMubmFtZSwgeCwgeSk7XHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLnZhbHVlICE9IHVuZGVmaW5lZCl7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgICAgICBjdHguZm9udCA9ICcyNHB4IEFyaWFsJztcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zaXRpb24ueCAtIDcgKyBQb3J0LnJhZGl1cztcclxuICAgICAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zaXRpb24ueSArIDc7XHJcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLnZhbHVlfWAsIHgsIHkpO1xyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjYW5Db25uZWN0KGRzdCA6IFBvcnQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgcGFpcnMgPSBbXHJcbiAgICAgICAgICAgIFsgUG9ydFR5cGUuYm90dG9tLCBQb3J0VHlwZS50b3BdLFxyXG4gICAgICAgICAgICBbIFBvcnRUeXBlLnRvcCAsIFBvcnRUeXBlLmJvdHRvbV0sXHJcblxyXG4gICAgICAgICAgICBbIFBvcnRUeXBlLmlucHV0UG9ydCwgUG9ydFR5cGUub3V0cHV0UG9ydF0sXHJcbiAgICAgICAgICAgIFsgUG9ydFR5cGUub3V0cHV0UG9ydCwgUG9ydFR5cGUuaW5wdXRQb3J0XVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiBwYWlycy5zb21lKHBhaXIgPT4gcGFpclswXSA9PSB0aGlzLnR5cGUgJiYgcGFpclsxXSA9PSBkc3QudHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdChwb3J0IDogUG9ydCkgOiB2b2lkIHsgICBcclxuICAgICAgICBhc3NlcnQodGhpcy5jYW5Db25uZWN0KHBvcnQpKTtcclxuXHJcbiAgICAgICAgbGV0IHNyYyA6IFBvcnQ7XHJcbiAgICAgICAgbGV0IGRzdCA6IFBvcnQ7XHJcblxyXG4gICAgICAgIGlmKHRoaXMudHlwZSA9PSBQb3J0VHlwZS5ib3R0b20gfHwgdGhpcy50eXBlID09IFBvcnRUeXBlLm91dHB1dFBvcnQpe1xyXG4gICAgICAgICAgICBbc3JjLCBkc3RdID0gW3RoaXMsIHBvcnRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBbc3JjLCBkc3RdID0gW3BvcnQsIHRoaXNdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXBwZW5kKHNyYy5kZXN0aW5hdGlvbnMsIGRzdCk7XHJcbiAgICAgICAgYXBwZW5kKGRzdC5zb3VyY2VzLCBzcmMpO1xyXG5cclxuICAgICAgICBtc2coYGNvbm5lY3QgcG9ydDoke3RoaXMuaWR4fT0+JHtwb3J0LmlkeH1gKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSm9pbnQge1xyXG5cclxuICAgIGRyYXdKb2ludChjYW52YXMgOiBDYW52YXMpeyAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFR1YmUge1xyXG5cclxuICAgIGRyYXdUdWJlKGNhbnZhcyA6IENhbnZhcyl7ICAgICAgICBcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBpcGUge1xyXG4gICAgc291cmNlISA6IFBvcnQ7XHJcbiAgICBkZXN0aW5hdGlvbiEgOiBQb3J0O1xyXG4gICAgdHViZXMgOiBUdWJlW10gPSBbXTtcclxuICAgIGpvaW50cyA6IEpvaW50W10gPSBbXTtcclxuXHJcbiAgICBkcmF3UGlwZShjYW52YXMgOiBDYW52YXMpeyAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFZGdlIHtcclxufVxyXG5cclxuY2xhc3MgUGxvdCB7ICAgIFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGF5ZXIge1xyXG59XHJcblxyXG5jbGFzcyBTY2hlZHVsZXIge1xyXG59XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgYXN5bmNCb2R5T25Mb2FkKCk7XHJcbn0pOyAgXHJcblxyXG4vL1xyXG5sZXQgbWFpbiA6IE1haW47XHJcblxyXG5leHBvcnQgY2xhc3MgTWFpbiB7XHJcbiAgICBzdGF0aWMgb25lIDogTWFpbjtcclxuICAgIGNhbnZhcyA6IENhbnZhcztcclxuICAgIGVkaXRvciA6IEVkaXRvcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIE1haW4ub25lID0gdGhpcztcclxuICAgICAgICAvLyBHZXQgdGhlIGNhbnZhcyBlbGVtZW50XHJcblxyXG4gICAgICAgIHRoaXMuZWRpdG9yID0gbmV3IEVkaXRvcih7fSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJvb3QgPSAkZ3JpZCh7XHJcbiAgICAgICAgICAgIHJvd3MgOiBcIjEwMHB4IDEwMCVcIiwgICAgICAgIFxyXG4gICAgICAgICAgICBjb2x1bW5zIDogXCIxMDBweCAyNSUgNzUlXCIsXHJcbiAgICAgICAgICAgIGNlbGxzIDogW1xyXG4gICAgICAgICAgICAgICAgLy8gW1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICRmaWxsZXIoe1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBjb2xzcGFuIDogMyxcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgYmFja2dyb3VuZENvbG9yIDogXCJjb3Juc2lsa1wiXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfSlcclxuICAgICAgICAgICAgICAgIC8vIF1cclxuICAgICAgICAgICAgICAgIC8vICxcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAkYnV0dG9uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA6IFwiZG93bmxvYWRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2sgOiBhc3luYyAoKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUpzb24oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICRidXR0b24oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0IDogXCJzdGFydFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGljayA6IGFzeW5jICgpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzdGFydFByb2dyYW0oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICRmaWxsZXIoe30pXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgJGZpbGxlcih7fSlcclxuICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgJHZsaXN0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uIDogXCIxMDAlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuIDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IElmQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgSW5maW5pdGVMb29wKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbXBhcmVCbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBJbnB1dFJhbmdlQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU2Vydm9Nb3RvckJsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLCAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTZXRWYWx1ZUJsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENhbWVyYUJsb2NrKHsgaW5Ub29sYm94IDogdHJ1ZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZhY2VEZXRlY3Rpb25CbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDYWxjQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVWx0cmFzb25pY0Rpc3RhbmNlU2Vuc29yQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVFRTQmxvY2soeyBpblRvb2xib3ggOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU2xlZXBCbG9jayh7IGluVG9vbGJveCA6IHRydWUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgY2FudmFzX2h0bWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd29ybGQnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IG5ldyBDYW52YXMoY2FudmFzX2h0bWwsIHJvb3QpXHJcblxyXG4gICAgICAgIC8vIEluaXRpYWwgcmVzaXplIHdoZW4gdGhlIHBhZ2UgbG9hZHNcclxuICAgICAgICAvLyBVc2UgRE9NQ29udGVudExvYWRlZCB0byBlbnN1cmUgdGhlIGNhbnZhcyBlbGVtZW50IGV4aXN0cyBiZWZvcmUgdHJ5aW5nIHRvIGFjY2VzcyBpdFxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCB0aGlzLmNhbnZhcy5yZXNpemVDYW52YXMuYmluZCh0aGlzLmNhbnZhcykpO1xyXG5cclxuICAgICAgICAvLyBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gcmVzaXplIHRoZSBjYW52YXMgd2hlbmV2ZXIgdGhlIHdpbmRvdyBpcyByZXNpemVkXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuY2FudmFzLnJlc2l6ZUNhbnZhcy5iaW5kKHRoaXMuY2FudmFzKSk7XHJcblxyXG4gICAgICAgIHNldERyYWdEcm9wKHRoaXMuY2FudmFzLmNhbnZhcyk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzLnJlc2l6ZUNhbnZhcygpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0UHJvZ3JhbSgpe1xyXG4gICAgYXdhaXQgc2VuZERhdGEoe1xyXG4gICAgICAgIGNvbW1hbmQgOiBcImluaXRcIixcclxuICAgICAgICBuYW1lOiBcImhhbWFkYVwiLFxyXG4gICAgICAgIGFnZTogNjZcclxuICAgIH0pO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYCR7dXJsT3JpZ2lufS9nZXRfZGF0YWA7XHJcbiAgICAgICAgbXNnKGBmZXRjaDpbJHt1cmx9XWApO1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTsgLy8gRGVmYXVsdCBtZXRob2QgaXMgR0VUXHJcblxyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yISBTdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTsgLy8gUGFyc2UgdGhlIEpTT04gcmVzcG9uc2UgZnJvbSBGbGFza1xyXG4gICAgICAgIGNvbnN0IGpzb25fc3RyID0gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMik7IC8vIFByZXR0eSBwcmludCBKU09OXHJcbiAgICAgICAgbXNnKGBzdGFydCBjbGljayBuYW1lOlske2RhdGFbXCJwcm9kdWN0X25hbWVcIl19XSBwcmljZTpbJHtkYXRhW1wicHJpY2VcIl19XSBqc29uOlske2pzb25fc3RyfV1gKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICBtc2coYHN0YXJ0IGNsaWNrIGVycm9yOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZldGNoSW1hZ2UoaW1hZ2VfdXJsIDogc3RyaW5nKXtcclxuICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWFnZS53aWR0aCAgPSAzMjA7XHJcbiAgICBpbWFnZS5oZWlnaHQgPSAyNDA7XHJcblxyXG4gICAgLy8gMi4gU2V0IHRoZSBjcm9zc09yaWdpbiBhdHRyaWJ1dGUgZm9yIHNlY3VyaXR5IGFuZCB0byBwcmV2ZW50IGEgdGFpbnRlZCBjYW52YXNcclxuICAgIGltYWdlLmNyb3NzT3JpZ2luID0gJ0Fub255bW91cyc7IFxyXG4gICAgXHJcbiAgICBpbWFnZS5zcmMgPSBpbWFnZV91cmw7IFxyXG5cclxuICAgIC8vIDQuIFdhaXQgZm9yIHRoZSBpbWFnZSB0byBsb2FkXHJcbiAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgY2FtZXJhSW1nID0gaW1hZ2U7XHJcbiAgICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVDYW1lcmFJbWFnZShpbWFnZV9maWxlX25hbWUgOiBzdHJpbmcpe1xyXG4gICAgY29uc3QgYmxvY2tzID0gTWFpbi5vbmUuZWRpdG9yLmJsb2NrcztcclxuICAgIGNvbnN0IGNhbWVyYXMgPSBibG9ja3MuZmlsdGVyKHggPT4geCBpbnN0YW5jZW9mIENhbWVyYUJsb2NrKTtcclxuICAgIGZvcihjb25zdCBjYW1lcmEgb2YgY2FtZXJhcyl7XHJcbiAgICAgICAgY29uc3QgaW1hZ2VfdXJsID0gYHN0YXRpYy9saWIvZGlhZ3JhbS9pbWcvJHtpbWFnZV9maWxlX25hbWV9YDtcclxuICAgICAgICBmZXRjaEltYWdlKGltYWdlX3VybCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUZhY2VEZXRlY3Rpb24oZmFjZSA6IG51bWJlcltdKXtcclxuICAgIGNvbnN0IGZhY2VfZGV0ZWN0aW9uID0gTWFpbi5vbmUuZWRpdG9yLmJsb2Nrcy5maW5kKHggPT4geCBpbnN0YW5jZW9mIEZhY2VEZXRlY3Rpb25CbG9jaykgYXMgRmFjZURldGVjdGlvbkJsb2NrO1xyXG4gICAgaWYoZmFjZV9kZXRlY3Rpb24gIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICBmYWNlX2RldGVjdGlvbi5zZXRGYWNlKGZhY2UpO1xyXG5cclxuICAgICAgICBmYWNlX2RldGVjdGlvbi5wcm9wZXJnYXRlQ2FsYygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVEaXN0YW5jZVNlbnNvcihkaXN0YW5jZSA6IG51bWJlcil7XHJcbiAgICBjb25zdCBkaXN0YW5jZV9zZW5zb3IgPSBNYWluLm9uZS5lZGl0b3IuYmxvY2tzLmZpbmQoeCA9PiB4IGluc3RhbmNlb2YgVWx0cmFzb25pY0Rpc3RhbmNlU2Vuc29yQmxvY2spIGFzIFVsdHJhc29uaWNEaXN0YW5jZVNlbnNvckJsb2NrO1xyXG4gICAgaWYoZGlzdGFuY2Vfc2Vuc29yICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgZGlzdGFuY2Vfc2Vuc29yLnNldERpc3RhbmNlKGRpc3RhbmNlKTtcclxuXHJcbiAgICAgICAgZGlzdGFuY2Vfc2Vuc29yLnByb3BlcmdhdGVDYWxjKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNsZWFyUXVldWUoKSB7XHJcbiAgICBmb3IobGV0IGlkeCA9IDA7IDsgaWR4Kyspe1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlbmREYXRhKHtcclxuICAgICAgICAgICAgY29tbWFuZCA6IFwic3RhdHVzXCJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgcXVldWUgPSByZXN1bHRbXCJxdWV1ZVwiXVxyXG4gICAgICAgIGlmKHF1ZXVlID09IG51bGwpe1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbXNnKGBjbGVhciBxdWV1ZToke2lkeH1gKTtcclxuICAgIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcGVyaW9kaWNUYXNrKCkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2VuZERhdGEoe1xyXG4gICAgICAgIGNvbW1hbmQgOiBcInN0YXR1c1wiXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBxdWV1ZSA9IHJlc3VsdFtcInF1ZXVlXCJdXHJcbiAgICBpZihxdWV1ZSAhPSBudWxsKXtcclxuXHJcbiAgICAgICAgY29uc3QganNvbl9zdHIgPSBKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwsIDIpO1xyXG4gICAgICAgIG1zZyhgc3RhdHVzOiR7anNvbl9zdHJ9YCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGltYWdlX2ZpbGVfbmFtZSA9IHF1ZXVlW1wiaW1hZ2VfZmlsZV9uYW1lXCJdO1xyXG4gICAgICAgIGlmKGltYWdlX2ZpbGVfbmFtZSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB1cGRhdGVDYW1lcmFJbWFnZShpbWFnZV9maWxlX25hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZmFjZSA9IHF1ZXVlW1wiZmFjZVwiXTtcclxuICAgICAgICBpZihmYWNlICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGFzc2VydChmYWNlLmxlbmd0aCA9PSA0KTtcclxuICAgICAgICAgICAgdXBkYXRlRmFjZURldGVjdGlvbihmYWNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gcXVldWVbXCJkaXN0YW5jZVwiXTtcclxuICAgICAgICBpZihkaXN0YW5jZSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBhc3NlcnQodHlwZW9mIGRpc3RhbmNlID09IFwibnVtYmVyXCIpO1xyXG4gICAgICAgICAgICB1cGRhdGVEaXN0YW5jZVNlbnNvcihkaXN0YW5jZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBDYW52YXMub25lLnJlcXVlc3RVcGRhdGVDYW52YXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KHBlcmlvZGljVGFzaywgMTAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VG9wUHJvY2VkdXJlcygpIDogQmxvY2tbXSB7XHJcbiAgICBjb25zdCBwcm9jZWR1cmVfYmxvY2tzID0gTWFpbi5vbmUuZWRpdG9yLmJsb2Nrcy5maWx0ZXIoeCA9PiB4LmlzUHJvY2VkdXJlKCkpIGFzIEJsb2NrW107XHJcblxyXG4gICAgY29uc3QgdG9wX2Jsb2NrcyA6IEJsb2NrW10gPSBbXTtcclxuICAgIGZvcihjb25zdCBibG9jayBvZiBwcm9jZWR1cmVfYmxvY2tzKXtcclxuICAgICAgICBjb25zdCB0b3BfcG9ydCA9IGJsb2NrLnBvcnRzLmZpbmQoeCA9PiB4LnR5cGUgPT0gUG9ydFR5cGUudG9wKSE7XHJcbiAgICAgICAgYXNzZXJ0KHRvcF9wb3J0ICE9IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgaWYodG9wX3BvcnQuc291cmNlcy5sZW5ndGggPT0gMCl7XHJcbiAgICAgICAgICAgIHRvcF9ibG9ja3MucHVzaChibG9jayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0b3BfYmxvY2tzO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuQmxvY2tDaGFpbih0b3BfYmxvY2sgOiBCbG9jayl7XHJcbiAgICBmb3IobGV0IGJsb2NrIDogQmxvY2sgfCB1bmRlZmluZWQgPSB0b3BfYmxvY2s7IGJsb2NrICE9IHVuZGVmaW5lZDsgYmxvY2sgPSBibG9jay5uZXh0QmxvY2soKSl7XHJcbiAgICAgICAgYXdhaXQgYmxvY2sucnVuKCk7XHJcblxyXG4gICAgICAgIGlmKHN0b3BGbGFnKXtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzdGFydFByb2NlZHVyZXMoKSB7XHJcbiAgICBzdGFydEJ1dHRvbi5pbm5lclRleHQgPSBcIlN0b3BcIjtcclxuXHJcbiAgICBpc1J1bm5pbmcgPSB0cnVlO1xyXG4gICAgc3RvcEZsYWcgPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdCB0b3BfYmxvY2tzID0gZ2V0VG9wUHJvY2VkdXJlcygpO1xyXG4gICAgZm9yKGNvbnN0IHRvcF9ibG9jayBvZiB0b3BfYmxvY2tzKXtcclxuICAgICAgICBtc2coYHRvcCBwcm9jOiR7dG9wX2Jsb2NrLmNvbnN0cnVjdG9yLm5hbWV9YCk7XHJcbiAgICAgICAgYXdhaXQgcnVuQmxvY2tDaGFpbih0b3BfYmxvY2spO1xyXG5cclxuICAgICAgICBpZihzdG9wRmxhZyl7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtc2coXCJwcm9jZWR1cmVzIGNvbXBsZXRlLlwiKTtcclxuICAgIGlzUnVubmluZyA9IGZhbHNlO1xyXG4gICAgc3RhcnRCdXR0b24uaW5uZXJUZXh0ID0gXCJTdGFydFwiO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXN5bmNCb2R5T25Mb2FkKCl7XHJcbiAgICBtc2coXCJsb2FkZWRcIik7XHJcbiAgICBsZXQgcGF0aG5hbWUgIDogc3RyaW5nO1xyXG4gICAgWyB1cmxPcmlnaW4sIHBhdGhuYW1lLCBdID0gaTE4bl90cy5wYXJzZVVSTCgpO1xyXG4gICAgbXNnKGBvcmlnaW46WyR7dXJsT3JpZ2lufV0gcGF0aDpbJHtwYXRobmFtZX1dYCk7XHJcblxyXG4gICAgY2FtZXJhSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FtZXJhLWljb25cIikgYXMgSFRNTEltYWdlRWxlbWVudDtcclxuICAgIG1vdG9ySWNvbiAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vdG9yLWljb25cIikgYXMgSFRNTEltYWdlRWxlbWVudDtcclxuICAgIGRpc3RhbmNlU2Vuc29ySWNvbiAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpc3RhbmNlLXNlbnNvci1pY29uXCIpIGFzIEhUTUxJbWFnZUVsZW1lbnQ7XHJcbiAgICB0dHNJY29uICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0dHMtaWNvblwiKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gICAgc2xlZXBJY29uICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzbGVlcC1pY29uXCIpIGFzIEhUTUxJbWFnZUVsZW1lbnQ7XHJcbiAgICBcclxuXHJcbiAgICBzdGFydEJ1dHRvbiA9ICQoXCJzdGFydC1idG5cIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICBzdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMoZXYgOiBNb3VzZUV2ZW50KT0+e1xyXG4gICAgICAgIGlmKGlzUnVubmluZyl7XHJcblxyXG4gICAgICAgICAgICBzdG9wRmxhZyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGF3YWl0IHN0YXJ0UHJvY2VkdXJlcygpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIG1haW4gPSBuZXcgTWFpbigpO1xyXG5cclxuICAgIGF3YWl0IGNsZWFyUXVldWUoKTtcclxuXHJcbiAgICBpZiggdXJsT3JpZ2luICE9IFwiaHR0cDovLzEyNy4wLjAuMTo1NTAwXCIpe1xyXG4gICAgICAgIGF3YWl0IHBlcmlvZGljVGFzaygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuLy8gZXhwb3J0IGNsYXNzIE5vZGUge1xyXG4vLyB9XHJcblxyXG4vKlxyXG7jg4DjgqTjgqLjgrDjg6njg6Bcclxu44O744OV44Ot44O844OB44Oj44O844OIXHJcbuODu+ODh+ODvOOCv+ODleODreODvFxyXG7jg7vlm57ot6/lm7Ncclxu44O7VUnnlLvpnaJcclxu44O7VU1MXHJcbiAgICDjg7vjgrfjg7zjgrHjg7Pjgrnlm7NcclxuICAgIOODu+OCr+ODqeOCueWbs1xyXG4gICAg44O744Ki44Kv44OG44Kj44OT44OG44Kj5ZuzXHJcbiAgICDjg7vjgrPjg7Pjg53jg7zjg43jg7Pjg4jlm7NcclxuICAgIOODu+eKtuaFi+mBt+enu+Wbs1xyXG4gICAg44O744K/44Kk44Of44Oz44Kw5ZuzXHJcbiAgICDjg7tcclxu44O7XHJcbuODu1xyXG7jg7tcclxu44O7XHJcblxyXG7jgrPjg7Pjg53jg7zjg43jg7Pjg4hcclxu44O75a6f6KGMXHJcbiAgICDjg7tpZi9lbHNlXHJcbiAgICDjg7t3aGlsZVxyXG4gICAg44O75Luj5YWlXHJcbiAgICDjg7vjgrnjg4jjg6rjg7zjg6BcclxuICAgICAgICDjg7vpgJrkv6FcclxuICAgICAgICAgICAg44O744OX44Ot44K744K56ZaTXHJcbiAgICAgICAgICAgIOODu+OCveOCseODg+ODiFxyXG4gICAgICAgICAgICAgICAg44O7VENQXHJcbiAgICAgICAgICAgICAgICDjg7tVRFBcclxuICAgICAgICDjg7vjg5Djg4Pjg5XjgqHku5jjgY1cclxuICAgIOODu3NsZWVwXHJcbiAgICDjg7t3YWl0IHVudGlsXHJcbiAgICDjg7tjYWxsIGZ1bmN0aW9uXHJcbiAgICDjg7vjg5bjg63jg4Pjgq9cclxuICAgICAgICDjg7vplqLmlbDlrprnvqlcclxuICAgICAgICDjg7vjg4fjg5DjgqTjgrlcclxuXHJcblxyXG7lrp/ooYzjg6Ljg7zjg4lcclxu44O757eo6ZuGXHJcbuODu+OCqOODn+ODpeODrOODvOOCt+ODp+ODs1xyXG7jg7vlrp/mqZ/jg4fjg5Djg4PjgrBcclxuXHJcbuOCueOCseOCuOODpeODvOODquODs+OCsFxyXG7jg7vljbPmmYLjgavlho3lrp/ooYxcclxu44O7VGlja+aZguOBq+WGjeWun+ihjFxyXG5cclxu44O75YWl5Yqb44GV44KM44Gf44KJXHJcbuODu+WApOOBjOWkieWMluOBl+OBn+OCiVxyXG5cclxu44O777yR44Gk44Gn44KC5YWl5Yqb44GV44KM44Gf44KJXHJcbuODu+WFqOmDqOWFpeWKm+OBleOCjOOBn+OCiVxyXG5cclxuKi9cclxuXHJcblxyXG59IiwibmFtZXNwYWNlIGRpYWdyYW1fdHMge1xyXG4vL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZERhdGEoZGF0YVRvU2VuZCA6IGFueSkgOiBQcm9taXNlPGFueT4ge1xyXG4gICAgY29uc3QgdXJsID0gYCR7dXJsT3JpZ2lufS9zZW5kX2RhdGFgO1xyXG4gICAgLy8gbXNnKGBwb3N0Olske3VybH1dYCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhVG9TZW5kKSAvLyBDb252ZXJ0IEphdmFTY3JpcHQgb2JqZWN0IHRvIEpTT04gc3RyaW5nXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3IhIFN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9LCBNZXNzYWdlOiAke2Vycm9yRGF0YS5tZXNzYWdlfWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpOyAvLyBQYXJzZSB0aGUgSlNPTiByZXNwb25zZSBmcm9tIEZsYXNrXHJcbiAgICAgICAgY29uc3QganNvbl9zdHIgPSBKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwsIDIpOyAvLyBQcmV0dHkgcHJpbnQgSlNPTlxyXG4gICAgICAgIC8vIG1zZyhgc2VuZCBkYXRhIHJlc3VsdDpbJHtqc29uX3N0cn1dYCk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgICAgbXNnKGBzZW5kIGRhdGEgZXJyb3I6ICR7ZXJyb3IubWVzc2FnZSB8fCBlcnJvcn1gKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIFxyXG59XHJcbn0iLCJuYW1lc3BhY2UgZGlhZ3JhbV90cyB7XHJcbi8vXHJcbmV4cG9ydCBmdW5jdGlvbiBkb3dubG9hZEpzb24oZGF0YSA6IGFueSl7XHJcbiAgICAvLyBDb252ZXJ0IHRoZSBvYmplY3QgdG8gYSBKU09OIHN0cmluZ1xyXG4gICAgY29uc3QganNvbkRhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKTsgLy8gVGhlIGxhc3QgdHdvIGFyZ3VtZW50cyBhcmUgZm9yIGZvcm1hdHRpbmcgKGluZGVudGF0aW9uKVxyXG5cclxuICAgIC8vIENyZWF0ZSBhIEJsb2IgZnJvbSB0aGUgSlNPTiBzdHJpbmdcclxuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbanNvbkRhdGFdLCB7IHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiIH0pO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbiBhbmNob3IgZWxlbWVudFxyXG4gICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gICAgbGluay5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcclxuICAgIGxpbmsuZG93bmxvYWQgPSBcImRpYWdyYW0uanNvblwiOyAvLyBTZXQgdGhlIGZpbGVuYW1lXHJcblxyXG4gICAgLy8gQXBwZW5kIHRoZSBsaW5rIHRvIHRoZSBib2R5IChpdCBtdXN0IGJlIGluIHRoZSBkb2N1bWVudCB0byBiZSBjbGlja2FibGUpXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xyXG5cclxuICAgIC8vIFByb2dyYW1tYXRpY2FsbHkgY2xpY2sgdGhlIGxpbmsgdG8gdHJpZ2dlciB0aGUgZG93bmxvYWRcclxuICAgIGxpbmsuY2xpY2soKTtcclxuXHJcbiAgICAvLyBDbGVhbiB1cDogcmVtb3ZlIHRoZSBsaW5rIGFuZCByZXZva2UgdGhlIG9iamVjdCBVUkxcclxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XHJcbiAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGxpbmsuaHJlZik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByZXZlbnREZWZhdWx0cyhldjpEcmFnRXZlbnQpIHtcclxuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7IFxyXG4gICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXREcmFnRHJvcChjYW52YXMgOiBIVE1MQ2FudmFzRWxlbWVudCl7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCAoZXYgOiBEcmFnRXZlbnQpPT57XHJcbiAgICAgICAgcHJldmVudERlZmF1bHRzKGV2KTtcclxuICAgICAgICBtc2coXCJkcmFnIGVudGVyXCIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXYgOiBEcmFnRXZlbnQpPT57XHJcbiAgICAgICAgcHJldmVudERlZmF1bHRzKGV2KTtcclxuICAgICAgICBjYW52YXMuY2xhc3NMaXN0LmFkZCgnZHJhZ292ZXInKVxyXG5cclxuICAgICAgICBtc2coXCJkcmFnIG92ZXJcIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCAoZXYgOiBEcmFnRXZlbnQpPT57XHJcbiAgICAgICAgcHJldmVudERlZmF1bHRzKGV2KTtcclxuICAgICAgICBjYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZ292ZXInKTtcclxuICAgICAgICBtc2coXCJkcmFnIGxlYXZlXCIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGFzeW5jIChldiA6IERyYWdFdmVudCk9PntcclxuICAgICAgICBwcmV2ZW50RGVmYXVsdHMoZXYpO1xyXG4gICAgICAgIGNhbnZhcy5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnb3ZlcicpO1xyXG5cclxuICAgICAgICBtc2coXCJkcm9wXCIpO1xyXG4gICAgICAgIGNvbnN0IGR0ID0gZXYuZGF0YVRyYW5zZmVyO1xyXG4gICAgICAgIGlmKGR0ID09IG51bGwpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmaWxlcyA9IEFycmF5LmZyb20oZHQuZmlsZXMpO1xyXG5cclxuICAgICAgICBtc2coYCR7ZmlsZXN9YCk7XHJcblxyXG4gICAgICAgIGlmKGZpbGVzLmxlbmd0aCA9PSAxKXtcclxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGZpbGVzWzBdO1xyXG5cclxuICAgICAgICAgICAgbXNnKGBGaWxlIG5hbWU6ICR7ZmlsZS5uYW1lfSwgRmlsZSBzaXplOiAke2ZpbGUuc2l6ZX0sIEZpbGUgdHlwZTogJHtmaWxlLnR5cGV9YCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGFzeW5jKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHJlYWRlci5yZXN1bHQgYXMgc3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb2JqICA9IEpTT04ucGFyc2UoanNvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KEFycmF5LmlzQXJyYXkob2JqKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gbXNnKGBkcm9wcGVkOlske0pTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpfV1gKTtcclxuICAgICAgICAgICAgICAgIGxvYWRKc29uKG9iaiBhcyBhbnlbXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVwYWludF9jb3VudCA9IHJlcGFpbnRDb3VudDtcclxuICAgICAgICAgICAgICAgIENhbnZhcy5vbmUucmVxdWVzdFVwZGF0ZUNhbnZhcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHBvcnQgcG9zaXRpb25zIGFyZSBzZXQgb24gcGFpbmcuXHJcbiAgICAgICAgICAgICAgICAvLyBlZGdlcyBjYW4gYmUgZHJhd24gYWZ0ZXIgcG9ydCBwb3NpdGlvbiBzZXR0aW5ncy5cclxuICAgICAgICAgICAgICAgIHdoaWxlKHJlcGFpbnRfY291bnQgPT0gcmVwYWludENvdW50KXtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcCgxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIGRyYXcgaW5wdXQgZWxlbWVudHMgaW4gYmxvY2tzLlxyXG4gICAgICAgICAgICAgICAgTWFpbi5vbmUuZWRpdG9yLmJsb2Nrcy5mb3JFYWNoKHggPT4geC5zZXRQb3NpdGlvbih4LnBvc2l0aW9uKSk7XHJcbiAgICAgICAgICAgICAgICBDYW52YXMub25lLnJlcXVlc3RVcGRhdGVDYW52YXMoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpOyAgICAgICAgXHJcblxyXG5cclxuICAgICAgICB9XHJcbiAgICB9KTsgICAgXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzYXZlSnNvbigpe1xyXG4gICAgbGV0IHBvcnRfaWR4ID0gMDtcclxuXHJcbiAgICBjb25zdCBibG9ja3MgPSBNYWluLm9uZS5lZGl0b3IuYmxvY2tzO1xyXG4gICAgZm9yKGNvbnN0IFtpZHgsIGJsb2NrXSBvZiBibG9ja3MuZW50cmllcygpKXtcclxuICAgICAgICBibG9jay5pZHggPSBpZHg7XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBwb3J0IG9mIGJsb2NrLnBvcnRzKXtcclxuICAgICAgICAgICAgcG9ydC5pZHggPSBwb3J0X2lkeCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBqc29uID0gYmxvY2tzLm1hcCh4ID0+IHgubWFrZU9iaigpKTtcclxuICAgIGRvd25sb2FkSnNvbihqc29uKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbG9hZEpzb24ob2JqczphbnlbXSl7XHJcbiAgICBjb25zdCBibG9ja19tYXAgPSBuZXcgTWFwPG51bWJlciwgQmxvY2s+KCk7XHJcbiAgICBjb25zdCBwb3J0X21hcCA9IG5ldyBNYXA8bnVtYmVyLCBQb3J0PigpO1xyXG5cclxuICAgIGZvcihjb25zdCBvYmogb2Ygb2Jqcyl7XHJcbiAgICAgICAgbXNnKGBibG9jazpbJHtvYmoudHlwZU5hbWV9XWApO1xyXG4gICAgICAgIGNvbnN0IGJsb2NrID0gbWFrZUJsb2NrQnlUeXBlTmFtZShvYmoudHlwZU5hbWUpO1xyXG4gICAgICAgIGJsb2NrLmxvYWRPYmoob2JqKTtcclxuXHJcbiAgICAgICAgYmxvY2suaWR4ICAgICAgICA9IG9iai5pZHg7XHJcbiAgICAgICAgYmxvY2sucG9zaXRpb24ueCA9IG9iai54O1xyXG4gICAgICAgIGJsb2NrLnBvc2l0aW9uLnkgPSBvYmoueTtcclxuICAgICAgICBibG9jay5zZXRNaW5TaXplKCk7XHJcbiAgICAgICAgYmxvY2suYm94U2l6ZSA9IGJsb2NrLm1pblNpemUhLmNvcHkoKTtcclxuXHJcbiAgICAgICAgYmxvY2tfbWFwLnNldChibG9jay5pZHgsIGJsb2NrKTtcclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IFtwb3J0X2lkeCwgcG9ydF9vYmpdIG9mIG9iai5wb3J0cy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBjb25zdCBwb3J0ID0gYmxvY2sucG9ydHNbcG9ydF9pZHhdO1xyXG4gICAgICAgICAgICBwb3J0LmlkeCA9IHBvcnRfb2JqLmlkeDtcclxuXHJcbiAgICAgICAgICAgIHBvcnRfbWFwLnNldChwb3J0LmlkeCwgcG9ydCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBNYWluLm9uZS5lZGl0b3IuYWRkQmxvY2soYmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcihjb25zdCBvYmogb2Ygb2Jqcyl7XHJcbiAgICAgICAgY29uc3QgYmxvY2sgPSBibG9ja19tYXAuZ2V0KG9iai5pZHgpITtcclxuICAgICAgICBhc3NlcnQoYmxvY2sgIT0gdW5kZWZpbmVkKTtcclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IFtwb3J0X2lkeCwgcG9ydF9vYmpdIG9mIG9iai5wb3J0cy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBjb25zdCBwb3J0ID0gYmxvY2sucG9ydHNbcG9ydF9pZHhdO1xyXG5cclxuICAgICAgICAgICAgZm9yKGNvbnN0IGRzdF9wb3J0X2lkeCBvZiBwb3J0X29iai5kZXN0aW5hdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZHN0X3BvcnQgPSBwb3J0X21hcC5nZXQoZHN0X3BvcnRfaWR4KSE7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoZHN0X3BvcnQgIT0gdW5kZWZpbmVkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBwb3J0LmNvbm5lY3QoZHN0X3BvcnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNhbnZhcyA9IE1haW4ub25lLmNhbnZhcztcclxuICAgIHNldENvbnRleHQyRChjYW52YXMuY3R4LCBjYW52YXMucm9vdCk7XHJcbn1cclxufSIsIm5hbWVzcGFjZSBkaWFncmFtX3RzIHtcclxuLy9cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5lc3RCbG9jayBleHRlbmRzIEJsb2NrIHtcclxuICAgIGlubmVyQmxvY2soKSA6IEJsb2NrIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBsZXQgcG9ydCA6IFBvcnQ7XHJcblxyXG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBJZkJsb2NrKXtcclxuICAgICAgICAgICAgcG9ydCA9IHRoaXMudHJ1ZVBvcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYodGhpcyBpbnN0YW5jZW9mIEluZmluaXRlTG9vcCl7XHJcbiAgICAgICAgICAgIHBvcnQgPSB0aGlzLmxvb3BQb3J0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXNzZXJ0KHBvcnQudHlwZSA9PSBQb3J0VHlwZS5ib3R0b20pO1xyXG5cclxuICAgICAgICBpZihwb3J0LmRlc3RpbmF0aW9ucy5sZW5ndGggPT0gMCl7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybiBwb3J0LmRlc3RpbmF0aW9uc1swXS5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlubmVyQmxvY2tzSGVpZ2h0KCkgOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSAwO1xyXG5cclxuICAgICAgICBmb3IobGV0IGJsb2NrID0gdGhpcy5pbm5lckJsb2NrKCk7IGJsb2NrICE9IHVuZGVmaW5lZDsgYmxvY2sgPSBibG9jay5uZXh0QmxvY2soKSl7XHJcbiAgICAgICAgICAgIGlmKGhlaWdodCAhPSAwKXtcclxuICAgICAgICAgICAgICAgIGhlaWdodCAtPSBub3RjaFJhZGl1cztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaGVpZ2h0ICs9IGJsb2NrLmNhbGNIZWlnaHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoaGVpZ2h0ICE9IDApe1xyXG4gICAgICAgICAgICBtc2coYGlubmVyIGJsb2NrcyBpZDoke3RoaXMuaWR4fSBoOiR7aGVpZ2h0fWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNaW5TaXplKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1pblNpemUgPSBuZXcgVmVjMigxNTAsIG5lc3RfaDEyMyk7XHJcblxyXG4gICAgICAgIGZvcihsZXQgYmxvY2sgPSB0aGlzLmlubmVyQmxvY2soKTsgYmxvY2sgIT0gdW5kZWZpbmVkOyBibG9jayA9IGJsb2NrLm5leHRCbG9jaygpKXtcclxuICAgICAgICAgICAgYmxvY2suc2V0TWluU2l6ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5taW5TaXplLnkgKz0gdGhpcy5pbm5lckJsb2Nrc0hlaWdodCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGNIZWlnaHQoKSA6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIG5lc3RfaDEyMyArIHRoaXMuaW5uZXJCbG9ja3NIZWlnaHQoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIElmQmxvY2sgZXh0ZW5kcyBOZXN0QmxvY2sgeyAgIFxyXG4gICAgdG9wUG9ydCAgICAgICA9IG5ldyBQb3J0KHRoaXMsIFBvcnRUeXBlLnRvcCk7XHJcbiAgICBib3R0b21Qb3J0ICAgID0gbmV3IFBvcnQodGhpcywgUG9ydFR5cGUuYm90dG9tKTtcclxuICAgIHRydWVQb3J0ICAgICAgPSBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5ib3R0b20pO1xyXG5cclxuICAgIGNvbmRpdGlvblBvcnQgPSBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5pbnB1dFBvcnQpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBcclxuICAgICAgICAgICAgdGhpcy50b3BQb3J0LCBcclxuICAgICAgICAgICAgdGhpcy5ib3R0b21Qb3J0LCBcclxuICAgICAgICAgICAgdGhpcy50cnVlUG9ydCxcclxuICAgICAgICAgICAgdGhpcy5jb25kaXRpb25Qb3J0XHJcbiAgICAgICAgXTtcclxuICAgIH1cclxuXHJcbiAgICBpc1RydWUoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblBvcnQudmFsdWUgPT0gMTtcclxuICAgIH1cclxuXHJcbiAgICB0cnVlQmxvY2soKSA6IEJsb2NrIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbm5lckJsb2NrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpe1xyXG4gICAgICAgIGNvbnN0IFtwb3MsIHNpemVdID0gdGhpcy5kcmF3Qm94KCk7XHJcbiAgICAgICAgY29uc3QgeDEgPSBwb3MueCArIHRoaXMuYm9yZGVyV2lkdGggKyBibG9ja0xpbmVXaWR0aDtcclxuICAgICAgICBjb25zdCB5MSA9IHBvcy55ICsgdGhpcy5ib3JkZXJXaWR0aCArIGJsb2NrTGluZVdpZHRoO1xyXG5cclxuICAgICAgICBjb25zdCB4MiA9IHgxICsgMzU7XHJcbiAgICAgICAgY29uc3QgeDMgPSB4MiArIDM1O1xyXG4gICAgICAgIGNvbnN0IHg0ID0geDEgKyB0aGlzLm1pblNpemUhLng7XHJcblxyXG4gICAgICAgIGNvbnN0IHkyID0geTEgKyBuZXN0X2gxO1xyXG4gICAgICAgIGNvbnN0IHkzID0geTIgKyBuZXN0X2gyICsgdGhpcy5pbm5lckJsb2Nrc0hlaWdodCgpO1xyXG4gICAgICAgIGNvbnN0IHk0ID0geTMgKyBuZXN0X2gzIC0gbm90Y2hSYWRpdXM7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmRyYXdPdXRsaW5lKFtcclxuICAgICAgICAgICAgLy8gbGVmdCB0b3BcclxuICAgICAgICAgICAgW3gxLCB5MSwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICAvLyBsZWZ0IGJvdHRvbVxyXG4gICAgICAgICAgICBbeDEsIHk0LCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIC8vIGJvdHRvbSBub3RjaFxyXG4gICAgICAgICAgICBbeDIsIHk0LCB0aGlzLmJvdHRvbVBvcnRdLFxyXG5cclxuICAgICAgICAgICAgLy8gcmlnaHQgYm90dG9tXHJcbiAgICAgICAgICAgIFt4NCwgeTQsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3g0LCB5MywgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTMsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3gyLCB5MiwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICAvLyBsb29wIG5vdGNoXHJcbiAgICAgICAgICAgIFt4MywgeTIsIHRoaXMudHJ1ZVBvcnRdLFxyXG4gICAgICAgICAgICBbeDQsIHkyLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIC8vIHJpZ2h0IHRvcFxyXG4gICAgICAgICAgICBbeDQsIHkxLCBudWxsXSxcclxuXHJcbiAgICAgICAgICAgIC8vIHRvcCBub3RjaFxyXG4gICAgICAgICAgICBbeDIsIHkxLCB0aGlzLnRvcFBvcnRdXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZGl0aW9uUG9ydC5kcmF3UG9ydCh0aGlzLmN0eCwgeDQgLSBQb3J0LnJhZGl1cywgMC41ICogKHkxICsgeTIpKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBydW4oKXtcclxuICAgICAgICBjb25zdCB0cnVlX2Jsb2NrID0gdGhpcy50cnVlQmxvY2soKTtcclxuICAgICAgICBpZih0cnVlX2Jsb2NrICE9IHVuZGVmaW5lZCAmJiB0aGlzLmlzVHJ1ZSgpKXtcclxuICAgICAgICAgICAgYXdhaXQgcnVuQmxvY2tDaGFpbih0cnVlX2Jsb2NrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJbmZpbml0ZUxvb3AgZXh0ZW5kcyBOZXN0QmxvY2sge1xyXG4gICAgdG9wUG9ydCAgPSBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS50b3ApO1xyXG4gICAgbG9vcFBvcnQgPSBuZXcgUG9ydCh0aGlzLCBQb3J0VHlwZS5ib3R0b20pO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGEgOiBBdHRyKXtcclxuICAgICAgICBzdXBlcihkYXRhKTtcclxuICAgICAgICB0aGlzLnBvcnRzID0gWyBcclxuICAgICAgICAgICAgdGhpcy50b3BQb3J0LCBcclxuICAgICAgICAgICAgdGhpcy5sb29wUG9ydCBcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG5cclxuICAgIGxvb3BCbG9jaygpIDogQmxvY2sgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlubmVyQmxvY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCl7XHJcbiAgICAgICAgY29uc3QgW3Bvcywgc2l6ZV0gPSB0aGlzLmRyYXdCb3goKTtcclxuICAgICAgICBjb25zdCB4MSA9IHBvcy54ICsgdGhpcy5ib3JkZXJXaWR0aCArIGJsb2NrTGluZVdpZHRoO1xyXG4gICAgICAgIGNvbnN0IHkxID0gcG9zLnkgKyB0aGlzLmJvcmRlcldpZHRoICsgYmxvY2tMaW5lV2lkdGg7XHJcblxyXG4gICAgICAgIGNvbnN0IHgyID0geDEgKyAzNTtcclxuICAgICAgICBjb25zdCB4MyA9IHgyICsgMzU7XHJcbiAgICAgICAgY29uc3QgeDQgPSB4MSArIHRoaXMubWluU2l6ZSEueDtcclxuXHJcbiAgICAgICAgY29uc3QgeTIgPSB5MSArIG5lc3RfaDE7XHJcbiAgICAgICAgY29uc3QgeTMgPSB5MiArIG5lc3RfaDIgKyB0aGlzLmlubmVyQmxvY2tzSGVpZ2h0KCk7XHJcbiAgICAgICAgY29uc3QgeTQgPSB5MyArIG5lc3RfaDM7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmRyYXdPdXRsaW5lKFtcclxuICAgICAgICAgICAgW3gxLCB5MSwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICBbeDEsIHk0LCBudWxsXSxcclxuICAgICAgICAgICAgW3g0LCB5NCwgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICBbeDQsIHkzLCBudWxsXSxcclxuICAgICAgICAgICAgW3gyLCB5MywgbnVsbF0sXHJcblxyXG4gICAgICAgICAgICBbeDIsIHkyLCBudWxsXSxcclxuICAgICAgICAgICAgW3gzLCB5MiwgdGhpcy5sb29wUG9ydF0sXHJcbiAgICAgICAgICAgIFt4NCwgeTIsIG51bGxdLFxyXG5cclxuICAgICAgICAgICAgW3g0LCB5MSwgbnVsbF0sXHJcbiAgICAgICAgICAgIFt4MiwgeTEsIHRoaXMudG9wUG9ydF1cclxuICAgICAgICBdKVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJ1bigpe1xyXG4gICAgICAgIGNvbnN0IGxvb3BfYmxvY2sgPSB0aGlzLmxvb3BCbG9jaygpO1xyXG4gICAgICAgIGlmKGxvb3BfYmxvY2sgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgd2hpbGUodHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBydW5CbG9ja0NoYWluKGxvb3BfYmxvY2spO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHN0b3BGbGFnKXtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcCgxMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG59Il19