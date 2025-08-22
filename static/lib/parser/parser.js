"use strict";
var parser_ts;
(function (parser_ts) {
    let TokenType;
    (function (TokenType) {
        TokenType[TokenType["unknown"] = 0] = "unknown";
        // 識別子
        TokenType[TokenType["identifier"] = 1] = "identifier";
        // クラス
        TokenType[TokenType["Class"] = 2] = "Class";
        // 数値
        TokenType[TokenType["Number"] = 3] = "Number";
        // 記号
        TokenType[TokenType["symbol"] = 4] = "symbol";
        // 予約語
        TokenType[TokenType["reservedWord"] = 5] = "reservedWord";
        // #n.m
        TokenType[TokenType["path"] = 6] = "path";
        // End Of Text
        TokenType[TokenType["eot"] = 7] = "eot";
        // 指定なし
        TokenType[TokenType["any"] = 8] = "any";
        // 行コメント
        TokenType[TokenType["lineComment"] = 9] = "lineComment";
        // ブロックコメント
        TokenType[TokenType["blockComment"] = 10] = "blockComment";
        // 改行
        TokenType[TokenType["newLine"] = 11] = "newLine";
        // 文字列
        TokenType[TokenType["String"] = 12] = "String";
        // 文字
        TokenType[TokenType["character"] = 13] = "character";
        // 不正
        TokenType[TokenType["illegal"] = 14] = "illegal";
    })(TokenType = parser_ts.TokenType || (parser_ts.TokenType = {}));
    var SymbolTable = new Array(",", ";", "(", ")", "[", "]", "{", "}", "+", "-", "*", "/", "^", "%", "=", ":", "<", ">", "$", "==", "!=", "<=", ">=", "$$", "&&", "||", "=>", "⇔", "+=", "-=", "*=", "/=", "%=", "++", "--", "!", "&", "|", "?");
    var KeywordMap = new Set([
        "let"
    ]);
    var IdList = new Array();
    function isLetter(s) {
        return s.length === 1 && ("a" <= s && s <= "z" || "A" <= s && s <= "Z" || s == "_");
    }
    parser_ts.isLetter = isLetter;
    function isDigit(s) {
        return s.length == 1 && "0123456789".indexOf(s) != -1;
    }
    function isIdLetter(s) {
        return isLetter(s) || isDigit(s);
    }
    function isLetterOrAt(s) {
        return isLetter(s[0]) || 2 <= s.length && s[0] == "@" && isLetter(s[1]);
    }
    parser_ts.isLetterOrAt = isLetterOrAt;
    let TokenSubType;
    (function (TokenSubType) {
        TokenSubType[TokenSubType["unknown"] = 0] = "unknown";
        TokenSubType[TokenSubType["integer"] = 1] = "integer";
        TokenSubType[TokenSubType["float"] = 2] = "float";
        TokenSubType[TokenSubType["double"] = 3] = "double";
    })(TokenSubType = parser_ts.TokenSubType || (parser_ts.TokenSubType = {}));
    class Token {
        typeTkn;
        subType;
        text;
        charPos;
        constructor(type, sub_type, text, char_pos) {
            //console.log("" + TokenType[type] + " " + TokenSubType[sub_type] + " " + text + " " + char_pos);
            this.typeTkn = type;
            this.subType = sub_type;
            this.text = text;
            this.charPos = char_pos;
        }
    }
    parser_ts.Token = Token;
    function lexicalAnalysis(text) {
        const tokens = [];
        // 現在の文字位置
        let pos = 0;
        while (pos < text.length) {
            // 改行以外の空白をスキップします。
            for (; pos < text.length && (text[pos] == ' ' || text[pos] == '\t' || text[pos] == '\r'); pos++)
                ;
            if (text.length <= pos) {
                // テキストの終わりの場合
                break;
            }
            const start_pos = pos;
            var token_type = TokenType.unknown;
            var sub_type = TokenSubType.unknown;
            // 現在位置の文字
            var ch1 = text[pos];
            // 次の文字の位置。行末の場合は'\0'
            var ch2;
            if (pos + 1 < text.length) {
                // 行末でない場合
                ch2 = text[pos + 1];
            }
            else {
                // 行末の場合
                ch2 = '\0';
            }
            if (ch1 == '\n') {
                token_type = TokenType.newLine;
                pos++;
            }
            else if (isLetterOrAt(ch1 + ch2)) {
                // 識別子の最初の文字の場合
                // 識別子の文字の最後を探します。識別子の文字はユニコードカテゴリーの文字か数字か'_'。
                for (pos++; pos < text.length && isIdLetter(text[pos]); pos++)
                    ;
                // 識別子の文字列
                var name = text.substring(start_pos, pos);
                if (KeywordMap.has(name)) {
                    // 名前がキーワード辞書にある場合
                    token_type = TokenType.reservedWord;
                }
                else {
                    // 名前がキーワード辞書にない場合
                    if (IdList.indexOf(name) == -1) {
                        IdList.push(name);
                    }
                    token_type = TokenType.identifier;
                }
            }
            else if (isDigit(ch1)) {
                // 数字の場合
                token_type = TokenType.Number;
                // 10進数の終わりを探します。
                for (; pos < text.length && isDigit(text[pos]); pos++)
                    ;
                if (pos < text.length && text[pos] == '.') {
                    // 小数点の場合
                    pos++;
                    // 10進数の終わりを探します。
                    for (; pos < text.length && isDigit(text[pos]); pos++)
                        ;
                    sub_type = TokenSubType.float;
                }
                else {
                    sub_type = TokenSubType.integer;
                }
            }
            else if (ch1 == "#") {
                token_type = TokenType.path;
                for (pos++; pos < text.length && (isDigit(text[pos]) || text[pos] == '-' || text[pos] == parser_ts.pathSep); pos++)
                    ;
            }
            else if (ch1 == '"') {
                token_type = TokenType.String;
                pos = text.indexOf('"', pos + 1);
                parser_ts.assert(pos != -1);
                pos++;
            }
            else if (SymbolTable.indexOf("" + ch1 + ch2) != -1) {
                // 2文字の記号の表にある場合
                token_type = TokenType.symbol;
                pos += 2;
            }
            else if (SymbolTable.indexOf("" + ch1) != -1) {
                // 1文字の記号の表にある場合
                token_type = TokenType.symbol;
                pos++;
            }
            else {
                // 不明の文字の場合
                token_type = TokenType.unknown;
                pos++;
                console.log("不明 {0}", text.substring(start_pos, pos), "");
            }
            // 字句の文字列を得ます。
            var word;
            if (token_type == TokenType.String) {
                word = text.substring(start_pos + 1, pos - 1);
            }
            else {
                word = text.substring(start_pos, pos);
            }
            const token = new Token(token_type, sub_type, word, start_pos);
            // msg(`${token.charPos} [${token.text}] ${token.typeTkn} ${token.subType}`);
            tokens.push(token);
        }
        return tokens;
    }
    parser_ts.lexicalAnalysis = lexicalAnalysis;
})(parser_ts || (parser_ts = {}));
var parser_ts;
(function (parser_ts) {
    parser_ts.termDic = {};
    parser_ts.pathSep = ":";
    parser_ts.variables = [];
    function isShapeName(name) {
        const names = [
            "Point", "Circle", "Arc", "Triangle",
            "LineByPoints", "HalfLine", "Line",
            "Intersection", "Foot", "Angle", "Parallel", "Thumb"
        ];
        return names.includes(name);
    }
    parser_ts.isShapeName = isShapeName;
    function isSystemName(name) {
        const names = [
            "range",
            "sqrt",
            "length"
        ];
        return isShapeName(name) || names.includes(name);
    }
    parser_ts.isSystemName = isSystemName;
    function isRelationToken(text) {
        return ["==", "=", "!=", "<", ">", "<=", ">=", "in", "notin", "subset"].includes(text);
    }
    parser_ts.isRelationToken = isRelationToken;
    function isArithmeticToken(text) {
        return ["cup", "cap"].includes(text);
    }
    function getVariable(name) {
        const va = parser_ts.variables.find(x => x.name == name);
        parser_ts.assert(va != undefined);
        return va;
    }
    parser_ts.getVariable = getVariable;
    function Zero() {
        return new ConstNum(0);
    }
    parser_ts.Zero = Zero;
    function actionRef(name) {
        return new RefVar(name);
    }
    parser_ts.actionRef = actionRef;
    function parseMath(text) {
        // msg(`parse-Math:[${text}]`);
        const parser = new Parser(text);
        const trm = parser.RootExpression();
        if (parser.token.typeTkn != parser_ts.TokenType.eot) {
            throw new parser_ts.SyntaxError();
        }
        trm.setParent(null);
        return trm;
    }
    parser_ts.parseMath = parseMath;
    function setRefVars(root) {
        const all_refs = allTerms(root).filter(x => x instanceof RefVar && parser_ts.isLetter(x.name[0]) && !isSystemName(x.name));
        for (const ref of all_refs) {
            ref.refVar = parser_ts.variables.find(x => x.name == ref.name);
            parser_ts.assert(ref.refVar != undefined);
        }
    }
    parser_ts.setRefVars = setRefVars;
    function isGreek(text) {
        parser_ts.assert(typeof text == "string");
        if (text.length == 0) {
            return false;
        }
        const greeks = [
            "alpha", "beta", "gamma", "delta", "epsilon", "varepsilon", "zeta", "eta", "theta",
            "vartheta", "iota", "kappa", "lambda", "mu", "nu", "xi", "pi", "varpi", "rho", "varrho",
            "sigma", "varsigma", "tau", "upsilon", "phi", "varphi", "chi", "psi", "omega"
        ];
        if (greeks.includes(text)) {
            return true;
        }
        const lower_case = text[0].toLowerCase() + text.substring(1);
        if (greeks.includes(lower_case)) {
            return true;
        }
        return false;
    }
    parser_ts.isGreek = isGreek;
    function texName(text) {
        switch (text) {
            case "==": return "=";
            case "!=": return "\\ne";
            case "<": return "\\lt";
            case ">": return "\\gt";
            case "<=": return "\\le";
            case ">=": return "\\ge";
            case "*": return "\\cdot";
            case "=>": return "\\implies";
            case "&&": return "\\land";
            case "||": return "\\lor";
            case "hbar": return "\\hbar";
            case "nabla": return "\\nabla";
            case "nabla2": return "\\nabla^2";
            case "subset": return "\\subseteq";
            case "infty": return "\\infty";
            case "cup":
            case "cap":
            case "sin":
            case "cos":
            case "tan":
            case "in":
            case "notin":
                return `\\${text}`;
        }
        if (isGreek(text)) {
            return `\\${text}`;
        }
        return text;
    }
    parser_ts.texName = texName;
    let termId = 0;
    class Rational {
        numerator = 1;
        denominator = 1;
        parent = null;
        constructor(numerator, denominator = 1) {
            this.numerator = numerator;
            this.denominator = denominator;
        }
        eq(r) {
            return (this.numerator == r.numerator && this.denominator == r.denominator);
        }
        is(numerator, denominator = 1) {
            return (this.numerator == numerator && this.denominator == denominator);
        }
        set(numerator, denominator = 1) {
            this.numerator = numerator;
            this.denominator = denominator;
        }
        clone() {
            return new Rational(this.numerator, this.denominator);
        }
        str() {
            if (this.denominator == 1) {
                return `${this.numerator}`;
            }
            else {
                return `${this.numerator} / ${this.denominator}`;
            }
        }
        tex() {
            if (this.denominator == 1) {
                return `${this.numerator}`;
            }
            else {
                return `\\frac{${this.numerator}}{${this.denominator}}`;
            }
        }
        addRational(r) {
            const old_fval = this.fval();
            this.numerator = this.numerator * r.denominator + r.numerator * this.denominator;
            this.denominator *= r.denominator;
            parser_ts.assert(Math.abs(old_fval + r.fval() - this.fval()) < 0.00000001);
        }
        setmul(...rs) {
            this.numerator *= rs.reduce((acc, cur) => acc * cur.numerator, 1);
            this.denominator *= rs.reduce((acc, cur) => acc * cur.denominator, 1);
        }
        setdiv(r) {
            this.numerator *= r.denominator;
            this.denominator *= r.numerator;
        }
        fval() {
            return this.numerator / this.denominator;
        }
        abs() {
            return Math.abs(this.fval());
        }
        setAbs() {
            this.numerator = Math.abs(this.numerator);
            this.denominator = Math.abs(this.denominator);
        }
        isInt() {
            return this.denominator == 1;
        }
        isDivisor(r) {
            const numerator = r.numerator * this.denominator;
            const denominator = r.denominator * this.numerator;
            return numerator % denominator == 0;
        }
        int() {
            parser_ts.assert(this.denominator == 1);
            return this.numerator;
        }
        sign() {
            return Math.sign(this.fval());
        }
        changeSign() {
            this.numerator *= -1;
        }
    }
    parser_ts.Rational = Rational;
    class Term {
        static tabIdxCnt = 0;
        id;
        tabIdx = 0;
        parent = null;
        cloneFrom;
        // 係数
        value = new Rational(1);
        canceled = false;
        colorName;
        hash = 0n;
        constructor() {
            this.id = termId++;
            this.value.parent = this;
        }
        uncolor() {
            this.colorName = undefined;
        }
        red() {
            this.colorName = "red";
        }
        blue() {
            this.colorName = "blue";
        }
        colored() {
            return this.colorName != undefined;
        }
        eq(trm) {
            return this.str() == trm.str();
        }
        equal(trm) {
            return this.value.eq(trm.value);
        }
        copy(dst) {
            dst.cloneFrom = this;
            dst.value = this.value.clone();
            dst.value.parent = dst;
            dst.canceled = this.canceled;
            dst.colorName = this.colorName;
        }
        changeSign() {
            this.value.changeSign();
        }
        /**
         *
         * @returns コピーしたルートと、thisと同じ位置の項を返す。
         */
        cloneRoot() {
            // ルートからthisに至るパスを得る。
            const path = this.getPath();
            // ルートを得る。
            const root = this.getRoot();
            parser_ts.assert(path.getTerm(root) == this);
            // ルートをコピーする。
            const root_cp = root.clone();
            // コピーしたルートから同じパスを辿って項を得る。
            const this_cp = path.getTerm(root_cp);
            parser_ts.assert(this_cp.str() == this.str());
            // コピーしたルートと、thisと同じ位置の項を返す。
            return [root_cp, this_cp];
        }
        getPath(path = new Path([])) {
            if (this.parent == null) {
                return path;
            }
            let idx;
            if (this.parent.fnc == this) {
                idx = -1;
            }
            else {
                idx = this.argIdx();
            }
            path.indexes.unshift(idx);
            return this.parent.getPath(path);
        }
        getRoot() {
            if (this.parent == null) {
                if (this instanceof App) {
                    return this;
                }
                parser_ts.assert(false);
            }
            return this.parent.getRoot();
        }
        getRootEqSideIdx() {
            for (let term = this; term.parent != null; term = term.parent) {
                if (term.parent.isRootEq()) {
                    return term.argIdx();
                }
            }
            throw new parser_ts.MyError();
        }
        getEqSide() {
            for (let term = this; term.parent != null; term = term.parent) {
                if (term.parent.isRootEq()) {
                    return term;
                }
            }
            return null;
        }
        setParent(parent) {
            this.parent = parent;
            this.value.parent = this;
        }
        setTabIdx() {
            this.tabIdx = ++Term.tabIdxCnt;
        }
        verifyParent(parent) {
            parser_ts.assert(this.parent == parent);
            parser_ts.assert(this.value.parent == this);
        }
        verifyParent2() {
            this.verifyParent(this.parent);
        }
        replaceTerm(target) {
            const app = this.parent;
            parser_ts.assert(app != null, "replace");
            if (app.fnc == this) {
                app.fnc = target;
            }
            else {
                const idx = app.args.findIndex(x => x == this);
                parser_ts.assert(idx != -1, "replace idx");
                app.args[idx] = target;
            }
            target.parent = app;
        }
        argIdx() {
            if (this.parent == null) {
                throw new parser_ts.MyError();
            }
            const idx = this.parent.args.indexOf(this);
            parser_ts.assert(idx != -1, "arg idx");
            return idx;
        }
        argShift(diff) {
            const idx = this.argIdx();
            const parent = this.parent;
            parent.args.splice(idx, 1);
            parent.args.splice(idx + diff, 0, this);
        }
        remArg() {
            if (this.parent == null) {
                throw new parser_ts.MyError();
            }
            const idx = this.argIdx();
            this.parent.args.splice(idx, 1);
            if (this.parent.args.length == 1) {
                // this.parent.oneArg();
            }
        }
        putValue(text, in_tex) {
            let val;
            if (this instanceof ConstNum) {
                val = text;
            }
            else {
                parser_ts.assert(this.value instanceof Rational);
                if (this.value.fval() == 1) {
                    val = text;
                }
                else if (this.value.fval() == -1) {
                    if (this.isAdd()) {
                        val = `- (${text})`;
                    }
                    else {
                        val = `- ${text}`;
                    }
                }
                else if (this.value.denominator == 1) {
                    const opr = (in_tex ? "\\cdot" : "*");
                    if (this.isAdd()) {
                        val = `${this.value.numerator} ${opr} (${text})`;
                    }
                    else {
                        val = `${this.value.numerator} ${opr} ${text}`;
                    }
                }
                else {
                    throw new parser_ts.MyError();
                }
            }
            if (this.parent != null && this != this.parent.fnc && this.parent.isAdd()) {
                const idx = this.argIdx();
                if (idx != 0) {
                    if (0 <= this.value.fval()) {
                        val = "+ " + val;
                    }
                }
            }
            if (in_tex) {
                if (this.colored()) {
                    return `{\\color{${this.colorName}} ${val}}`;
                }
                if (this.canceled) {
                    return `\\cancel{${val}}`;
                }
            }
            return val;
        }
        str2() {
            parser_ts.assert(false, "str2");
            return "";
        }
        str() {
            return this.strX();
        }
        strX() {
            const text = this.str2();
            return this.putValue(text, false);
        }
        htmldata(text) {
            parser_ts.termDic[this.id] = this;
            return `\\htmlData{id=${this.id}, tabidx=${this.tabIdx}}{${text}}`;
        }
        tex() {
            let text = this.tex2();
            if (this.colored()) {
                text = `{\\color{${this.colorName}} ${this.putValue(text, true)}}`;
                // return this.htmldata(this.putValue(text, true));
            }
            else {
                text = this.putValue(text, true);
            }
            if (this instanceof ConstNum || this instanceof RefVar || this instanceof App) {
                text = `\\htmlId{tex-term-${this.id}}{${text}}`;
            }
            return text;
        }
        isApp(fnc_name) {
            return this instanceof App && this.fncName == fnc_name;
        }
        isOperator() {
            return this instanceof App && this.precedence() != -1;
        }
        isNamedFnc() {
            return this instanceof RefVar && parser_ts.isLetter(this.name[0]);
        }
        isOprFnc() {
            return this instanceof RefVar && !parser_ts.isLetter(this.name[0]);
        }
        isEq() {
            return this instanceof App && (this.fncName == "==" || this.fncName == "=");
        }
        isRootEq() {
            return this.isEq() && this.parent == null;
        }
        isList() {
            return this instanceof App && this.fncName == "[]";
        }
        isAdd() {
            return this instanceof App && this.fncName == "+";
        }
        isMul() {
            return this instanceof App && this.fncName == "*";
        }
        isDiv() {
            return this instanceof App && this.fncName == "/";
        }
        isDot() {
            return this instanceof App && this.fncName == ".";
        }
        isSqrt() {
            return this instanceof App && this.fncName == "sqrt";
        }
        isZero() {
            return this.value.numerator == 0;
        }
        isValue(n) {
            return this instanceof ConstNum && this.value.fval() == n;
        }
        isOne() {
            return this.isValue(1);
        }
        isInt() {
            return this instanceof ConstNum && this.value.isInt();
        }
        isE() {
            return this instanceof RefVar && this.name == "e";
        }
        isI() {
            return this instanceof RefVar && this.name == "i";
        }
        isDiff() {
            return this instanceof App && (this.fncName == "diff" || this.fncName == "pdiff");
        }
        isLim() {
            return this instanceof App && this.fncName == "lim";
        }
        dividend() {
            parser_ts.assert(this.isDiv());
            return this.args[0];
        }
        divisor() {
            parser_ts.assert(this.isDiv());
            return this.args[1];
        }
        depend(dvar) {
            return allTerms(this).some(x => dvar.eq(x));
        }
        calc() {
            if (this instanceof Rational) {
                return this.fval();
            }
            else if (this instanceof ConstNum) {
                return this.value.fval();
            }
            else if (this instanceof RefVar) {
                const data = this.refVar.expr;
                if (data instanceof Term) {
                    return data.calc();
                }
                else {
                    throw new parser_ts.MyError("unimplemented");
                }
            }
            else if (this instanceof App) {
                const app = this;
                if (app.isApp("sqrt")) {
                    parser_ts.assert(app.args.length == 1);
                    return Math.sqrt(app.args[0].calc());
                }
                else {
                    throw new parser_ts.MyError("unimplemented");
                }
            }
            throw new parser_ts.MyError("unimplemented");
        }
        copyValue(cns) {
            parser_ts.assert(this instanceof ConstNum);
            this.value.set(cns.value.numerator, cns.value.denominator);
        }
        dmpTerm(nest) {
            if (this instanceof App) {
                parser_ts.msg(`${nest}${this.id}`);
                this.fnc.dmpTerm(nest + "\t");
                this.args.forEach(x => x.dmpTerm(nest + "\t"));
            }
            else {
                parser_ts.msg(`${nest}${this.id}:${this.str()}`);
            }
        }
        getAllTerms(terms) {
            terms.push(this);
            if (this instanceof App) {
                this.fnc.getAllTerms(terms);
                this.args.forEach(x => x.getAllTerms(terms));
            }
        }
        includesTerm(term) {
            if (this instanceof App) {
                return this.allTerms().includes(term);
            }
            else {
                return this == term;
            }
        }
    }
    parser_ts.Term = Term;
    class Path extends Term {
        indexes = [];
        constructor(indexes) {
            super();
            this.indexes = indexes.slice();
        }
        equal(trm) {
            return super.equal(trm) && trm instanceof Path && parser_ts.range(this.indexes.length).every(i => this.indexes[i] == trm.indexes[i]);
        }
        strid() {
            throw new parser_ts.MyError();
        }
        strX() {
            return `#${this.indexes.join(parser_ts.pathSep)}`;
        }
        tex2() {
            parser_ts.assert(false, "path:tex2");
            return "";
        }
        clone() {
            const path = new Path(this.indexes);
            this.copy(path);
            return path;
        }
        getTerm(root, get_parent = false) {
            if (this.indexes.length == 0) {
                return root;
            }
            let app = root;
            const last_i = (get_parent ? this.indexes.length - 2 : this.indexes.length - 1);
            for (const [i, idx] of this.indexes.entries()) {
                if (i == last_i) {
                    return (idx == -1 ? app.fnc : app.args[idx]);
                }
                else {
                    app = (idx == -1 ? app.fnc : app.args[idx]);
                    parser_ts.assert(app instanceof App, "pass:get term");
                }
            }
            throw new parser_ts.MyError("get term");
        }
    }
    parser_ts.Path = Path;
    class Variable {
        name;
        expr;
        depVars;
        constructor(name, expr) {
            parser_ts.variables.push(this);
            this.name = name;
            this.expr = expr;
            const refs = allTerms(expr).filter(x => x instanceof RefVar && !(x.parent instanceof App && x.parent.fnc == x));
            this.depVars = refs.map(ref => parser_ts.variables.find(v => v.name == ref.name));
            parser_ts.assert(this.depVars.every(x => x != undefined));
            if (this.depVars.length != 0) {
                parser_ts.msg(`${this.name} depends ${this.depVars.map(x => x.name).join(" ")}`);
            }
        }
        rename(new_name) {
            this.name = new_name;
        }
    }
    parser_ts.Variable = Variable;
    class RefVar extends Term {
        name;
        refVar;
        constructor(name) {
            super();
            this.name = name;
        }
        equal(trm) {
            return super.equal(trm) && trm instanceof RefVar && this.name == trm.name;
        }
        strid() {
            if (this.value.is(1)) {
                return `${this.name}`;
            }
            else {
                return `${this.value.str()} ${this.name}`;
            }
        }
        clone() {
            const ref = new RefVar(this.name);
            this.copy(ref);
            return ref;
        }
        str2() {
            return this.name;
        }
        tex2() {
            return texName(this.name);
        }
    }
    parser_ts.RefVar = RefVar;
    class ConstNum extends Term {
        static zero() {
            return new ConstNum(0);
        }
        constructor(numerator, denominator = 1) {
            super();
            this.value = new Rational(numerator, denominator);
        }
        equal(trm) {
            return super.equal(trm);
        }
        strid() {
            return `${this.value.str()}`;
        }
        static fromRational(r) {
            return new ConstNum(r.numerator, r.denominator);
        }
        clone() {
            const cns = new ConstNum(this.value.numerator, this.value.denominator);
            this.copy(cns);
            return cns;
        }
        str2() {
            return this.value.str();
        }
        strX() {
            return this.value.str();
        }
        tex2() {
            return this.value.tex();
        }
    }
    parser_ts.ConstNum = ConstNum;
    class Str extends Term {
        text;
        constructor(text) {
            super();
            this.text = text;
        }
        equal(trm) {
            return trm instanceof Str && trm.text == this.text;
        }
        strid() {
            return `"${this.text}"`;
        }
        clone() {
            return new Str(this.text);
        }
        str2() {
            return this.strid();
        }
        strX() {
            return this.strid();
        }
        tex2() {
            return this.strid();
        }
    }
    parser_ts.Str = Str;
    class App extends Term {
        fnc;
        args;
        remParentheses = false;
        static startEnd = {
            "(": ")",
            "[": "]",
            "{": "}",
        };
        get refVar() {
            if (this.fnc != null && this.fnc instanceof RefVar) {
                return this.fnc;
            }
            else {
                return null;
            }
        }
        get fncName() {
            if (this.fnc instanceof RefVar) {
                return this.fnc.name;
            }
            else {
                return `no-fnc-name`;
            }
        }
        constructor(fnc, args) {
            super();
            this.fnc = fnc;
            this.fnc.parent = this;
            this.args = args.slice();
            this.args.forEach(x => x.parent = this);
        }
        equal(trm) {
            if (super.equal(trm) && trm instanceof App) {
                if (this.fnc.equal(trm.fnc)) {
                    if (this.args.length == trm.args.length) {
                        return parser_ts.range(this.args.length).every(i => this.args[i].equal(trm.args[i]));
                    }
                }
            }
            return false;
        }
        strid() {
            let s;
            if (this.fnc.isOprFnc()) {
                s = "(" + this.args.map(x => x.strid()).join(this.fncName) + ")";
            }
            else {
                s = `${this.fncName}(${this.args.map(x => x.strid()).join(", ")})`;
            }
            if (this.value.is(1)) {
                return s;
            }
            else {
                return `${this.value.str()} ${s}`;
            }
        }
        clone() {
            const app = new App(this.fnc.clone(), this.args.map(x => x.clone()));
            this.copy(app);
            return app;
        }
        setParent(parent) {
            super.setParent(parent);
            this.fnc.setParent(this);
            this.args.forEach(x => x.setParent(this));
        }
        setTabIdx() {
            super.setTabIdx();
            this.fnc.setTabIdx();
            this.args.forEach(x => x.setTabIdx());
        }
        verifyParent(parent) {
            super.verifyParent(parent);
            this.fnc.verifyParent(this);
            this.args.forEach(x => x.verifyParent(this));
        }
        str2() {
            const args = this.args.map(x => x.str());
            let text;
            if (this.fnc instanceof App) {
                const args_s = args.join(", ");
                text = `(${this.fnc.str()})(${args_s})`;
            }
            else if (parser_ts.isLetterOrAt(this.fncName)) {
                const args_s = args.join(", ");
                text = `${this.fncName}(${args_s})`;
            }
            else {
                switch (this.fncName) {
                    case "+":
                        switch (args.length) {
                            case 0: return " +[] ";
                            case 1: return ` +[${args[0]}] `;
                        }
                        text = args.join(` `);
                        break;
                    case "/":
                        if (this.args.length != 2) {
                            throw new parser_ts.MyError();
                        }
                        text = `${args[0]} / ${args[1]}`;
                        break;
                    default:
                        text = args.join(` ${this.fncName} `);
                        break;
                }
            }
            if (this.isOperator() && this.parent != null && this.parent.isOperator()) {
                if (this.parent.precedence() <= this.precedence()) {
                    return `(${text})`;
                }
            }
            return text;
        }
        tex2() {
            const args = this.args.map(x => x.tex());
            let text;
            if (this.fnc instanceof App) {
                const args_s = args.join(", ");
                text = `(${this.fnc.tex()})(${args_s})`;
            }
            else if (this.fncName == "lim") {
                switch (args.length) {
                    case 1:
                        text = `\\lim ${args[0]}`;
                        break;
                    case 3:
                        text = `\\lim_{${args[1]} \\to ${args[2]}} ${args[0]}`;
                        break;
                    default:
                        throw new parser_ts.MyError();
                }
            }
            else if (this.fncName == "sum") {
                switch (args.length) {
                    case 1:
                        text = `\\sum ${args[0]}`;
                        break;
                    case 3:
                        text = `\\sum_{${args[1]}}^{${args[2]}} ${args[0]}`;
                        break;
                    case 4:
                        text = `\\sum_{${args[1]}=${args[2]}}^{${args[3]}} ${args[0]}`;
                        break;
                    default:
                        throw new parser_ts.MyError();
                }
            }
            else if (this.fncName == "log") {
                if (args.length == 1) {
                    text = `\\log ${args[0]}`;
                }
                else if (args.length == 2) {
                    text = `\\log_{${args[1]}} ${args[0]}`;
                }
                else {
                    throw new parser_ts.MyError();
                }
            }
            else if (this.fncName == "{|}") {
                text = `\\{${args[0]} \\mid ${args[1]} \\}`;
            }
            else if (this.fncName == "in") {
                let ids;
                if (this.args[0].isApp(",")) {
                    ids = this.args[0].args.map(x => x.tex()).join(" , ");
                }
                else {
                    ids = args[0];
                }
                text = `${ids} \\in ${args[1]}`;
            }
            else if (this.fncName == "complement") {
                text = `{ ${args[0]} }^c`;
            }
            else if (this.isDiff()) {
                const n = (this.args.length == 3 ? `^{${args[2]}}` : ``);
                const d = (this.fncName == "diff" ? "d" : "\\partial");
                if (this.args.length == 1) {
                    text = `(${args[0]})'`;
                }
                else if (args[0].indexOf("\\frac") == -1) {
                    text = `\\frac{ ${d} ${n} ${args[0]}}{ ${d}  ${args[1]}${n}}`;
                }
                else {
                    text = `\\frac{ ${d} ${n} }{ ${d}  ${args[1]}${n}} (${args[0]})`;
                }
            }
            else if (parser_ts.isLetterOrAt(this.fncName)) {
                if (["sin", "cos", "tan"].includes(this.fncName) && !(this.args[0] instanceof App)) {
                    text = `${texName(this.fncName)} ${args[0]}`;
                }
                else if (this.fncName == "abs") {
                    parser_ts.assert(args.length == 1, "tex2");
                    text = `\\lvert ${args[0]} \\rvert`;
                }
                else if (this.fncName == "sqrt") {
                    parser_ts.assert(args.length == 1, "tex2");
                    text = `\\sqrt{${args[0]}}`;
                }
                else if (this.fncName == "nth_root") {
                    parser_ts.assert(args.length == 2, "tex2");
                    text = `\\sqrt[${args[1]}]{${args[0]}}`;
                }
                else if (isArithmeticToken(this.fncName)) {
                    text = `${args[0]} ${texName(this.fncName)} ${args[1]}`;
                }
                else if (isRelationToken(this.fncName) || isArithmeticToken(this.fncName)) {
                    text = `${args[0]} ${texName(this.fncName)} ${args[1]}`;
                }
                else {
                    const args_s = args.join(", ");
                    text = `${texName(this.fncName)}(${args_s})`;
                }
            }
            else {
                switch (this.fncName) {
                    case "+":
                        switch (args.length) {
                            case 0: return " +[] ";
                            case 1: return ` +[${args[0]}] `;
                        }
                        text = args.join(` `);
                        break;
                    case "/":
                        if (this.args.length != 2) {
                            throw new parser_ts.MyError();
                        }
                        text = `\\frac{${args[0]}}{${args[1]}}`;
                        break;
                    case "^":
                        if (this.args[0] instanceof App && ["sin", "cos", "tan"].includes(this.args[0].fncName)) {
                            const app = this.args[0];
                            text = `${texName(app.fncName)}^{${args[1]}} ${app.args[0].tex()}`;
                        }
                        else {
                            text = `${args[0]}^{${args[1]}}`;
                        }
                        break;
                    default:
                        if (args.length == 1) {
                            text = `${texName(this.fncName)} ${args[0]}`;
                        }
                        else {
                            text = args.join(` ${texName(this.fncName)} `);
                        }
                        break;
                }
            }
            if (this.parent != null) {
                if (this.remParentheses) {
                    return `\\textbf{ {\\color{red} (} } ${text} \\textbf{ {\\color{red} )} }`;
                }
                else if ((this.isAdd() || this.isMul()) && this.parent.fncName == "lim") {
                    return `(${text})`;
                }
                else if (this.isOperator() && this.parent.isOperator() && !this.parent.isDiv()) {
                    if (this.parent.fncName == "^" && this.parent.args[1] == this) {
                        return text;
                    }
                    if (this.parent.precedence() <= this.precedence()) {
                        return `(${text})`;
                    }
                }
            }
            return text;
        }
        precedence() {
            switch (this.fncName) {
                case "^":
                    return 0;
                case "/":
                    return 1;
                case "*":
                    return 2;
                case "+":
                case "-":
                    return 3;
            }
            return -1;
        }
        setArg(trm, idx) {
            this.args[idx] = trm;
            trm.parent = this;
        }
        addArg(trm) {
            this.args.push(trm);
            trm.parent = this;
        }
        addArgs(trms) {
            this.args.push(...trms);
            trms.forEach(x => x.parent = this);
        }
        insArg(trm, idx) {
            this.args.splice(idx, 0, trm);
            trm.parent = this;
        }
        insArgs(args, idx) {
            parser_ts.assert(idx != -1, "ins parent mul 1");
            const args_cp = args.slice();
            while (args_cp.length != 0) {
                const trm = args_cp.pop();
                this.insArg(trm, idx);
            }
        }
        /**
         *
         * @description 引数が1個だけの加算や乗算を、唯一の引数で置き換える。
         */
        oneArg() {
            parser_ts.assert(this.args.length == 1, "one arg");
            // 唯一の引数
            const arg1 = this.args[0];
            // 加算や乗算を唯一の引数で置き換える。
            this.replaceTerm(arg1);
            // 唯一の引数の係数に、加算や乗算の係数をかける。
            arg1.value.setmul(this.value);
        }
        allTerms() {
            const terms = [];
            this.getAllTerms(terms);
            return terms;
        }
        clearHighlight() {
            const all_terms = this.allTerms();
            for (const term of all_terms) {
                term.canceled = false;
                term.colorName = undefined;
            }
        }
        findTermById(id) {
            return this.allTerms().find(x => x.id == id);
        }
    }
    parser_ts.App = App;
    class Parser {
        tokens;
        tokens_cp;
        token;
        constructor(text) {
            this.tokens = parser_ts.lexicalAnalysis(text);
            if (this.tokens.length == 0) {
            }
            this.tokens_cp = this.tokens.slice();
            this.next();
        }
        next() {
            if (this.tokens.length == 0) {
                this.token = new parser_ts.Token(parser_ts.TokenType.eot, parser_ts.TokenSubType.unknown, "", 0);
            }
            else {
                this.token = this.tokens.shift();
            }
        }
        showError(text) {
            const i = this.tokens_cp.length - this.tokens.length;
            const words = this.tokens_cp.map(x => x.text);
            words.splice(i, 0, `<<${text}>>`);
            parser_ts.msg(`token err:${words.join(" ")}`);
        }
        nextToken(text) {
            if (this.token.text != text) {
                this.showError(text);
                throw new parser_ts.SyntaxError();
            }
            this.next();
        }
        current() {
            return this.token.text;
        }
        peek() {
            return this.tokens.length == 0 ? null : this.tokens[0];
        }
        readArgs(start, end, app) {
            this.nextToken(start);
            while (true) {
                const trm = this.RelationalExpression();
                app.args.push(trm);
                if (this.token.text == ",") {
                    this.nextToken(",");
                }
                else {
                    break;
                }
            }
            this.nextToken(end);
        }
        PrimaryExpression() {
            let trm;
            if (this.token.typeTkn == parser_ts.TokenType.identifier) {
                let refVar = new RefVar(this.token.text);
                this.next();
                if (this.token.text == '(') {
                    let app = new App(refVar, []);
                    this.readArgs("(", ")", app);
                    return app;
                }
                else if (this.token.text == ".") {
                    let app = new App(operator("."), [refVar]);
                    do {
                        this.nextToken(".");
                        parser_ts.assert(this.token.typeTkn == parser_ts.TokenType.identifier);
                        app.addArg(new RefVar(this.token.text));
                        this.next();
                    } while (this.token.text == ".");
                    return app;
                }
                else {
                    return refVar;
                }
            }
            else if (this.token.typeTkn == parser_ts.TokenType.Number) {
                let n = parseFloat(this.token.text);
                if (isNaN(n)) {
                    throw new parser_ts.SyntaxError();
                }
                trm = new ConstNum(n);
                this.next();
            }
            else if (this.token.typeTkn == parser_ts.TokenType.String) {
                trm = new Str(this.token.text);
                this.next();
            }
            else if (this.token.typeTkn == parser_ts.TokenType.path) {
                parser_ts.assert(this.token.text[0] == "#", "parse path");
                if (this.token.text == "#") {
                    trm = new Path([]);
                }
                else {
                    const indexes = this.token.text.substring(1).split(parser_ts.pathSep).map(x => parseFloat(x));
                    trm = new Path(indexes);
                }
                this.next();
            }
            else if (this.token.text == '(') {
                this.next();
                trm = this.RelationalExpression();
                if (this.current() != ')') {
                    throw new parser_ts.SyntaxError();
                }
                this.next();
                if (this.token.text == '(') {
                    let app = new App(trm, []);
                    this.readArgs("(", ")", app);
                    return app;
                }
                return trm;
            }
            else if (this.token.text == '{') {
                this.next();
                const element = this.RelationalExpression();
                this.nextToken('|');
                const logic = this.LogicalExpression();
                this.nextToken('}');
                trm = new App(operator("{|}"), [element, logic]);
                return trm;
            }
            else {
                throw new parser_ts.SyntaxError();
            }
            return trm;
        }
        PowerExpression() {
            const trm1 = this.PrimaryExpression();
            if (this.token.text == "^") {
                this.nextToken("^");
                const trm2 = this.PowerExpression();
                return new App(operator("^"), [trm1, trm2]);
            }
            return trm1;
        }
        UnaryExpression() {
            if (this.token.text == "-") {
                // 負号の場合
                this.nextToken("-");
                // 基本の式を読みます。
                const t1 = this.PowerExpression();
                // 符号を反転します。
                t1.value.numerator *= -1;
                return t1;
            }
            else {
                // 基本の式を読みます。
                return this.PowerExpression();
            }
        }
        DivExpression() {
            let trm1 = this.UnaryExpression();
            while (this.token.text == "/") {
                let app = new App(operator(this.token.text), [trm1]);
                this.next();
                while (true) {
                    let trm2 = this.UnaryExpression();
                    app.args.push(trm2);
                    if (this.token.text == app.fncName) {
                        this.next();
                    }
                    else {
                        trm1 = app;
                        break;
                    }
                }
            }
            return trm1;
        }
        MultiplicativeExpression() {
            let trm1 = this.DivExpression();
            if (this.current() != "*") {
                return trm1;
            }
            while (this.current() == "*") {
                let app = new App(operator(this.token.text), [trm1]);
                this.next();
                while (true) {
                    let trm2 = this.DivExpression();
                    app.args.push(trm2);
                    if (this.token.text == app.fncName) {
                        this.next();
                    }
                    else {
                        trm1 = app;
                        break;
                    }
                }
            }
            if (trm1 instanceof App && trm1.args[0] instanceof ConstNum) {
                if (trm1.args.length == 2) {
                    const [num, trm2] = trm1.args;
                    trm2.value.setmul(num.value);
                    return trm2;
                }
                else {
                    const num = trm1.args[0];
                    trm1.value.setmul(num.value);
                    num.remArg();
                    return trm1;
                }
            }
            return trm1;
        }
        AdditiveExpression() {
            let nagative = false;
            if (this.token.text == "-") {
                nagative = true;
                this.next();
            }
            const trm1 = this.MultiplicativeExpression();
            if (nagative) {
                trm1.value.numerator *= -1;
            }
            if (this.token.text == "+" || this.token.text == "-") {
                let app = new App(operator("+"), [trm1]);
                while (this.token.text == "+" || this.token.text == "-") {
                    const opr = this.token.text;
                    this.next();
                    const trm2 = this.MultiplicativeExpression();
                    if (opr == "-") {
                        trm2.value.numerator *= -1;
                    }
                    app.addArg(trm2);
                }
                return app;
            }
            return trm1;
        }
        ArithmeticExpression() {
            const trm1 = this.AdditiveExpression();
            if (!isArithmeticToken(this.current())) {
                return trm1;
            }
            const app = new App(operator(this.current()), [trm1]);
            while (isArithmeticToken(this.current())) {
                this.next();
                const trm2 = this.AdditiveExpression();
                app.addArg(trm2);
            }
            return app;
        }
        VariableDeclaration() {
            const ref_vars = [];
            while (true) {
                const id = this.token;
                parser_ts.assert(id.typeTkn == parser_ts.TokenType.identifier);
                this.next();
                ref_vars.push(new RefVar(id.text));
                if (this.token.text == ",") {
                    this.nextToken(",");
                }
                else {
                    break;
                }
            }
            const id_list = new App(operator(","), ref_vars);
            this.nextToken("in");
            const set = this.ArithmeticExpression();
            return new App(operator("in"), [id_list, set]);
        }
        RelationalExpression(in_and = false) {
            const next_token = this.peek();
            if (in_and && this.token.typeTkn == parser_ts.TokenType.identifier && next_token != null && next_token.text == ",") {
                return this.VariableDeclaration();
            }
            let trm1;
            if (this.token.text == "[") {
                const ref = new RefVar("[]");
                trm1 = new App(ref, []);
                this.readArgs("[", "]", trm1);
            }
            else {
                trm1 = this.ArithmeticExpression();
            }
            while (isRelationToken(this.token.text)) {
                let app = new App(operator(this.token.text), [trm1]);
                this.next();
                while (true) {
                    let trm2 = this.ArithmeticExpression();
                    app.args.push(trm2);
                    if (this.token.text == app.fncName) {
                        this.next();
                    }
                    else {
                        trm1 = app;
                        break;
                    }
                }
            }
            return trm1;
        }
        AndExpression() {
            const trm1 = this.RelationalExpression(true);
            if (![";", "&&"].includes(this.token.text)) {
                return trm1;
            }
            const app = new App(operator("&&"), [trm1]);
            while ([";", "&&"].includes(this.token.text)) {
                this.next();
                const trm2 = this.RelationalExpression(true);
                app.addArg(trm2);
            }
            return app;
        }
        OrExpression() {
            const trm1 = this.AndExpression();
            if (this.current() != "||") {
                return trm1;
            }
            const app = new App(operator("||"), [trm1]);
            while (this.current() == "||") {
                this.next();
                const trm2 = this.AndExpression();
                app.addArg(trm2);
            }
            return app;
        }
        LogicalExpression() {
            const trm1 = this.OrExpression();
            if (["=>", "⇔"].includes(this.token.text)) {
                const opr = this.token.text;
                this.next();
                let trm2 = this.OrExpression();
                return new App(operator(opr), [trm1, trm2]);
            }
            else {
                return trm1;
            }
        }
        RootExpression() {
            if (this.token.text == "let") {
                this.next();
                const app = this.VariableDeclaration();
                if (this.token.text != ",") {
                    return app;
                }
                const and = new App(operator("&&"), [app]);
                while (this.token.text == ",") {
                    this.next();
                    const app2 = this.VariableDeclaration();
                    and.addArg(app2);
                }
                return and;
            }
            else if (isRelationToken(this.token.text)) {
                let app = new App(operator(this.token.text), []);
                this.next();
                let trm = this.ArithmeticExpression();
                app.args.push(trm);
                return app;
            }
            else {
                return this.LogicalExpression();
            }
        }
    }
    parser_ts.Parser = Parser;
    function operator(opr) {
        return new RefVar(opr);
    }
    parser_ts.operator = operator;
    function getAllTerms(t, terms) {
        terms.push(t);
        if (t instanceof App) {
            parser_ts.assert(t.fnc != null, "get all terms");
            getAllTerms(t.fnc, terms);
            t.args.forEach(x => getAllTerms(x, terms));
        }
    }
    parser_ts.getAllTerms = getAllTerms;
    function makeIdToTermMap(root) {
        const terms = allTerms(root);
        return new Map(terms.map(x => [x.id, x]));
    }
    parser_ts.makeIdToTermMap = makeIdToTermMap;
    function getSubTerms(root, target) {
        const terms = [];
        getAllTerms(root, terms);
        const target_str = target.str2();
        return terms.filter(x => x.str2() == target_str);
    }
    parser_ts.getSubTerms = getSubTerms;
    function allTerms(trm) {
        const terms = [];
        getAllTerms(trm, terms);
        return terms;
    }
    parser_ts.allTerms = allTerms;
    function bodyOnLoad() {
        const texts = parser_ts.$("sample").value.replace("\r\n", "\n").split("\n").map(x => x.trim()).filter(x => x != "");
        for (const text of texts) {
            parser_ts.msg(text);
            parseMath(text);
        }
    }
    parser_ts.bodyOnLoad = bodyOnLoad;
})(parser_ts || (parser_ts = {}));
var katex;
var parser_ts;
(function (parser_ts) {
    //
    parser_ts.sleep = i18n_ts.sleep;
    const $dic = new Map();
    function $(id) {
        let ele = $dic.get(id);
        if (ele == undefined) {
            ele = document.getElementById(id);
            $dic.set(id, ele);
        }
        return ele;
    }
    parser_ts.$ = $;
    class MyError extends Error {
        constructor(text = "") {
            super(text);
        }
    }
    parser_ts.MyError = MyError;
    class SyntaxError extends MyError {
        constructor(text = "") {
            super(text);
        }
    }
    parser_ts.SyntaxError = SyntaxError;
    function assert(b, msg = "") {
        if (!b) {
            throw new MyError(msg);
        }
    }
    parser_ts.assert = assert;
    function msg(txt) {
        console.log(txt);
    }
    parser_ts.msg = msg;
    function range(n) {
        return [...Array(n).keys()];
    }
    parser_ts.range = range;
    function getUserMacros() {
        return {
            "\\dif": "\\frac{d #1}{d #2}",
            "\\pdiff": "\\frac{\\partial #1}{\\partial #2}",
            "\\pddif": "\\frac{\\partial^2 #1}{\\partial {#2}^2}",
            "\\b": "\\boldsymbol{#1}"
        };
    }
    parser_ts.getUserMacros = getUserMacros;
    function renderKatexSub(ele, tex_text) {
        ele.innerHTML = "";
        katex.render(tex_text, ele, {
            throwOnError: false,
            displayMode: true,
            trust: true,
            strict: false, // "ignore", // false, // handler,
            // newLineInDisplayMode : "ignore",
            macros: getUserMacros()
        });
    }
    parser_ts.renderKatexSub = renderKatexSub;
})(parser_ts || (parser_ts = {}));
var parser_ts;
(function (parser_ts) {
    function symbol2words(symbol) {
        const tbl = {
            "sin": "sine",
            "cos": "cosine",
            "tan": "tangent",
            "sec": "secant",
            "cosec": "cosecant",
            "cot": "cotangent",
            "=": "equals",
            "==": "equals",
            "!=": "not equal to",
            "<": "is less than",
            ">": "is greater than",
            "<=": "is less than or equal to",
            ">=": "is greater than or equal to",
            "+": "plus",
            "-": "minus",
            "*": "times"
        };
        const text = tbl[symbol];
        if (text != undefined) {
            return text;
        }
        else {
            return symbol;
        }
    }
    const tex2words = {
        "dif": "diff",
        "Delta": "delta",
        "lim": "limit",
        "sqrt": "square root",
        "ne": "not equals",
        "lt": "is less than",
        "gt": "is greater than",
        "le": "is less than or equals",
        "ge": "is greater than or equals",
        "hbar": "h bar",
    };
    const oprs = new Set();
    function isLetter(str) {
        return /^\p{Letter}+$/u.test(str);
    }
    function isDigit(str) {
        return /^\d+$/.test(str);
    }
    function pronunciationF(tex_node, word) {
        if (word.endsWith("{")) {
            word = word.substring(0, word.length - 1);
        }
        if (word.endsWith("_")) {
            word = word.substring(0, word.length - 1);
        }
        if (word.startsWith("\\")) {
            word = word.substring(1);
            const text = tex2words[word];
            if (text != undefined) {
                return new Phrase(tex_node, text.split(" "));
            }
        }
        else {
            const text = symbol2words(word);
            if (text != word) {
                return new Phrase(tex_node, text.split(" "));
            }
        }
        if (isLetter(word)) {
            if (parser_ts.isGreek(word)) {
                const char0 = word.charAt(0);
                if (char0.toUpperCase() == char0) {
                    return new Phrase(tex_node, ["large", word.toLowerCase()]);
                }
            }
            return new Phrase(tex_node, [word]);
        }
        if (isDigit(word)) {
            return new Phrase(tex_node, [word]);
        }
        if (!oprs.has(word)) {
            oprs.add(word);
            // msg(`operators : [${word}]`);
        }
        return undefined;
    }
    class Phrase {
        texNode;
        words;
        start;
        end;
        constructor(tex_node, words) {
            this.texNode = tex_node;
            this.words = words;
            for (const word of words) {
                if (!oprs.has(word)) {
                    oprs.add(word);
                    // msg(`word : ${word}`);
                }
            }
        }
    }
    parser_ts.Phrase = Phrase;
    function makeTextFromPhrases(phrases) {
        let text = "";
        for (const phrase of phrases) {
            phrase.start = text.length;
            for (const word of phrase.words) {
                if (word != "") {
                    if (text != "") {
                        text += " ";
                    }
                    text += word;
                }
            }
            phrase.end = text.length;
        }
        // msg(`phrases [${text}]`)
        return text;
    }
    parser_ts.makeTextFromPhrases = makeTextFromPhrases;
    class TexNode {
        diction;
        termTex;
        term() {
            return this.termTex;
        }
        initString() {
            return "";
        }
        async *genTex(speech, highlightables) {
            yield "";
        }
        say(text) {
            this.diction = text;
            return this;
        }
        dmpNode(nest) {
            const term = this.term();
            const id = (term == undefined ? "" : `${term.id}`);
            if (this instanceof TexLeaf) {
                parser_ts.msg(`${nest}${id}:${this.texText()}`);
            }
            else if (this instanceof TexBlock) {
                parser_ts.msg(`${nest}${id}`);
                this.nodes.forEach(x => x.dmpNode(nest + "\t"));
            }
            else {
                throw new parser_ts.MyError();
            }
        }
    }
    class TexBlock extends TexNode {
        nodes;
        constructor(nodes) {
            super();
            this.nodes = nodes;
        }
        makeSpeech(phrases) {
            this.nodes.forEach(x => x.makeSpeech(phrases));
        }
    }
    class TexSeq extends TexBlock {
        constructor(nodes) {
            super(nodes);
        }
        async *genTex(speech, highlightables) {
            const arg_strs = this.nodes.map(x => x.initString());
            for (let [idx, node] of this.nodes.entries()) {
                for await (const s of node.genTex(speech, highlightables)) {
                    arg_strs[idx] = s;
                    yield `${arg_strs.join(" ")}`;
                }
            }
            yield `${arg_strs.join(" ")}`;
        }
    }
    class TexLeaf extends TexNode {
        charPos;
        phrase;
        constructor() {
            super();
        }
        speechText() {
            return this.texText();
        }
        makeSpeech(phrases) {
            let text;
            if (this.diction != undefined) {
                text = this.diction;
            }
            else {
                text = this.speechText();
            }
            this.phrase = pronunciationF(this, text);
            if (this.phrase != undefined) {
                phrases.push(this.phrase);
            }
        }
        async *genTex(speech, highlightables) {
            const tex_text = this.texText();
            if (speech != null && this.phrase != undefined) {
                while (speech.speaking && speech.prevCharIndex < this.phrase.start) {
                    parser_ts.msg(`await tex-leaf.gen-tex: prev-Char-Index:${speech.prevCharIndex} phrase-start:${this.phrase.start}`);
                    await parser_ts.sleep(100);
                    yield tex_text;
                }
            }
            yield tex_text;
        }
    }
    class TexNum extends TexLeaf {
        num;
        constructor(num) {
            super();
            this.num = num;
        }
        term() {
            return this.num;
        }
        texText() {
            return this.num.value.str();
        }
    }
    class TexRef extends TexLeaf {
        ref;
        constructor(ref) {
            super();
            this.ref = ref;
        }
        term() {
            return this.ref;
        }
        texText() {
            if (parser_ts.isGreek(this.ref.name)) {
                return `\\${this.ref.name}`;
            }
            else {
                return this.ref.name;
            }
            // return this.ref.tex();
        }
        async *genTex(speech, highlightables) {
            if (highlightables != undefined) {
                const highlightable = highlightables.get(this.ref.name);
                if (highlightable != undefined) {
                    highlightable.highlight(true);
                }
            }
            const tex_text = this.texText();
            if (speech != null && this.phrase != undefined) {
                while (speech.speaking && speech.prevCharIndex < this.phrase.start) {
                    parser_ts.msg(`await tex-ref.gen-tex: prev-Char-Index:${speech.prevCharIndex} phrase-start:${this.phrase.start}`);
                    await parser_ts.sleep(100);
                    yield tex_text;
                }
            }
            yield tex_text;
        }
    }
    class TexStr extends TexLeaf {
        str;
        constructor(str) {
            super();
            this.str = str;
        }
        speechText() {
            if (this.str == "\\lim_{") {
                parser_ts.msg("speech-Text:lim");
            }
            const list = [
                "{", "}", "(", ")", "}{", "}^{", "\\frac{"
            ];
            if (list.includes(this.str)) {
                return "";
            }
            return symbol2words(this.str);
        }
        texText() {
            return parser_ts.texName(this.str);
        }
        initString() {
            const list = [
                "{", "}", "(", ")", "}{", "}^{", "^{"
            ];
            if (list.includes(this.str)) {
                return this.str;
            }
            if (this.str.startsWith("\\") && this.str.endsWith("}")) {
                return this.str;
            }
            return "";
        }
    }
    class TexSpeech extends TexStr {
        constructor(text) {
            super(text);
        }
        async *genTex(speech, highlightables) {
            yield "";
        }
    }
    function spc(text) {
        return new TexSpeech(text);
    }
    function seq(...params) {
        return new TexSeq(params.map(x => makeFlow(x)));
    }
    function join(trms, delimiter) {
        const nodes = trms.map(x => makeTermFlow(x));
        if (trms.length == 1) {
            return makeTermFlow(trms[0]);
        }
        else {
            const nodes = [];
            for (const [i, trm] of trms.entries()) {
                if (i != 0) {
                    nodes.push(new TexStr(delimiter));
                }
                nodes.push(makeTermFlow(trm));
            }
            return new TexSeq(nodes);
        }
    }
    function prependValue(trm, node) {
        const fval = trm.value.fval();
        if (fval != 1 && trm.isAdd()) {
            node = seq("(", node, ")");
        }
        if (fval == -1) {
            node = seq("-", node);
        }
        else if (fval != 1) {
            parser_ts.assert(trm.value.denominator == 1);
            node = seq(trm.value.numerator.toFixed(), node);
        }
        if (trm instanceof parser_ts.App) {
            node.termTex = trm;
        }
        return node;
    }
    function makeFlow(trm) {
        if (trm instanceof TexNode) {
            return trm;
        }
        else if (typeof trm === "string") {
            return new TexStr(trm);
        }
        else if (trm instanceof parser_ts.Term) {
            return makeTermFlow(trm);
        }
        else {
            throw new parser_ts.MyError();
        }
    }
    parser_ts.makeFlow = makeFlow;
    function makeTermFlow(trm) {
        if (trm instanceof parser_ts.RefVar) {
            const ref = trm;
            const node = new TexRef(ref);
            return prependValue(ref, node);
        }
        else if (trm instanceof parser_ts.ConstNum) {
            const num = trm;
            return new TexNum(num);
        }
        else if (trm instanceof parser_ts.App) {
            const app = trm;
            let node;
            if (app.fnc instanceof parser_ts.App) {
                if (app.fnc instanceof parser_ts.RefVar) {
                    node = seq(app.fnc, seq("(", join(app.args, ","), ")"));
                }
                else {
                    node = seq("(", app.fnc, ")", seq("(", join(app.args, ","), ")"));
                }
            }
            else if (app.fncName == "lim") {
                const arg0 = app.args[0];
                if (arg0.isAdd() || arg0.isMul()) {
                    node = seq("\\lim_{", app.args[1], "\\to", app.args[2], "}", "(", app.args[0], ")");
                }
                else {
                    node = seq("\\lim_{", app.args[1], "\\to", app.args[2], "}", app.args[0]);
                }
            }
            else if (app.fncName == "in") {
                const ids = join(app.args, " , ");
                node = seq(ids, "\\in", app.args[1]);
            }
            else if (app.isDiff()) {
                const n = (app.args.length == 3 ? seq("^{", app.args[2], "}") : ``);
                const d = (app.fncName == "diff" ? "d" : "\\partial");
                if (app.args[0].isDiv()) {
                    node = seq("\\frac{", d, n, "}{", spc("over"), d, app.args[1], n, "}", seq("(", app.args[0], ")"));
                }
                else {
                    node = seq("\\frac{", d, n, app.args[0], "}{", spc("over"), d, app.args[1], n, "}");
                }
            }
            else if (parser_ts.isLetterOrAt(app.fncName)) {
                if (["sin", "cos", "tan"].includes(app.fncName) && !(app.args[0] instanceof parser_ts.App)) {
                    node = seq(app.fnc, app.args[0]);
                }
                else if (app.fncName == "sqrt") {
                    parser_ts.assert(app.args.length == 1);
                    node = seq("\\sqrt{", app.args[0], "}");
                }
                else if (app.fncName == "nth_root") {
                    parser_ts.assert(app.args.length == 2);
                    node = seq("\\sqrt[", app.args[1], "]{", app.args[0], "}");
                }
                else {
                    node = seq(app.fnc, seq("(", join(app.args, ","), ")"));
                }
            }
            else {
                switch (app.fncName) {
                    case "+":
                        switch (app.args.length) {
                            case 0:
                                throw new parser_ts.MyError();
                            case 1:
                                node = makeTermFlow(app.args[0]);
                                break;
                            default:
                                const nodes = [];
                                for (const [i, arg] of app.args.entries()) {
                                    if (i != 0) {
                                        const coefficient = arg.value.fval();
                                        if (0 <= coefficient) {
                                            nodes.push(new TexStr("+"));
                                        }
                                        else if (coefficient == -1) {
                                            nodes.push(new TexStr("-"));
                                        }
                                    }
                                    const arg_node = makeTermFlow(arg);
                                    if (app.isAdd() && arg.isMul()) {
                                        nodes.push(seq("(", arg_node, ")"));
                                    }
                                    else {
                                        nodes.push(arg_node);
                                    }
                                }
                                node = new TexSeq(nodes);
                                break;
                        }
                        break;
                    case "*":
                        switch (app.args.length) {
                            case 0:
                                throw new parser_ts.MyError();
                            case 1:
                                node = makeTermFlow(app.args[0]);
                                break;
                            default:
                                node = join(app.args, app.fncName);
                        }
                        break;
                    case "/":
                        if (app.args.length == 3) {
                            // msg(`/ 3args [${app.args[0].str()}] [ ${app.args[1].str()}] [ ${app.args[2].str()}]`);
                        }
                        else if (app.args.length == 1) {
                            // msg(`/ 1arg [${app.args[0].str()}]`);
                            return makeTermFlow(app.args[0]);
                        }
                        else {
                            parser_ts.assert(app.args.length == 2);
                        }
                        node = seq("\\frac{", app.args[0], "}{", spc("over"), app.args[1], "}");
                        break;
                    case "^":
                        let exponent = makeTermFlow(app.args[1]);
                        if (app.args[1].isValue(2)) {
                            exponent.say("squared");
                        }
                        else if (app.args[1].isValue(3)) {
                            exponent.say("cubed");
                        }
                        else {
                            exponent = seq("to the power of", exponent);
                        }
                        if (app.args[0] instanceof parser_ts.App && ["sin", "cos", "tan"].includes(app.args[0].fncName)) {
                            const app2 = app.args[0];
                            node = seq("{", app2.fncName, `}^{`, exponent, "}", app2.args[0]);
                        }
                        else {
                            node = seq("{", app.args[0], "}^{", exponent, "}");
                        }
                        break;
                    default:
                        if (app.args.length == 1) {
                            node = seq(app.fncName, app.args[0]);
                        }
                        else {
                            node = join(app.args, app.fncName);
                        }
                        break;
                }
            }
            // if(app.parent != null){
            //     if(app.isOperator() && app.parent.isOperator() && !app.parent.isDiv()){
            //         if(app.parent.fncName == "^" && app.parent.args[1] == app){
            //             ;
            //         }
            //         else if(app.parent.precedence() <= app.precedence()){
            //             node = seq("(", node, ")");
            //         }            
            //     }
            // }
            return prependValue(app, node);
        }
        else {
            throw new parser_ts.MyError();
        }
    }
    function getAllTexNodes(node, nodes) {
        nodes.push(node);
        if (node instanceof TexBlock) {
            node.nodes.forEach(x => getAllTexNodes(x, nodes));
        }
    }
    function allTexNodes(node) {
        const terms = [];
        getAllTexNodes(node, terms);
        return terms;
    }
    parser_ts.allTexNodes = allTexNodes;
    function makeNodeTextByApp(root) {
        root.setParent(null);
        root.setTabIdx();
        const node = makeTermFlow(root);
        const phrases = [];
        node.makeSpeech(phrases);
        const text = makeTextFromPhrases(phrases);
        return [node, text];
    }
    parser_ts.makeNodeTextByApp = makeNodeTextByApp;
    async function showFlow(speech, root, div, highlightables) {
        div.innerHTML = "";
        const [node, text] = makeNodeTextByApp(root);
        await speech.speak(text);
        let prev_s = "";
        for await (const s of node.genTex(speech, highlightables)) {
            if (prev_s != s) {
                prev_s = s;
                // msg(`show flow:${s}`);
                parser_ts.renderKatexSub(div, s);
                await parser_ts.sleep(10);
            }
        }
        parser_ts.renderKatexSub(div, root.tex());
        await speech.waitEnd();
    }
    parser_ts.showFlow = showFlow;
})(parser_ts || (parser_ts = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdHMvbGV4LnRzIiwiLi4vLi4vLi4vdHMvcGFyc2VyLnRzIiwiLi4vLi4vLi4vdHMvcGFyc2VyX3V0aWwudHMiLCIuLi8uLi8uLi90cy90ZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQVUsU0FBUyxDQTZSbEI7QUE3UkQsV0FBVSxTQUFTO0lBRW5CLElBQVksU0E0Q1g7SUE1Q0QsV0FBWSxTQUFTO1FBQ2pCLCtDQUFPLENBQUE7UUFFUCxNQUFNO1FBQ04scURBQVUsQ0FBQTtRQUVWLE1BQU07UUFDTiwyQ0FBSyxDQUFBO1FBRUwsS0FBSztRQUNMLDZDQUFNLENBQUE7UUFFTixLQUFLO1FBQ0wsNkNBQU0sQ0FBQTtRQUVOLE1BQU07UUFDTix5REFBWSxDQUFBO1FBRVosT0FBTztRQUNQLHlDQUFJLENBQUE7UUFFSixjQUFjO1FBQ2QsdUNBQUcsQ0FBQTtRQUVILE9BQU87UUFDUCx1Q0FBRyxDQUFBO1FBRUgsUUFBUTtRQUNSLHVEQUFXLENBQUE7UUFFWCxXQUFXO1FBQ1gsMERBQVksQ0FBQTtRQUVaLEtBQUs7UUFDTCxnREFBTyxDQUFBO1FBRVAsTUFBTTtRQUNOLDhDQUFNLENBQUE7UUFFTixLQUFLO1FBQ0wsb0RBQVMsQ0FBQTtRQUVULEtBQUs7UUFDTCxnREFBTyxDQUFBO0lBQ1gsQ0FBQyxFQTVDVyxTQUFTLEdBQVQsbUJBQVMsS0FBVCxtQkFBUyxRQTRDcEI7SUFHRCxJQUFJLFdBQVcsR0FBbUIsSUFBSyxLQUFLLENBQ3hDLEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdB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QUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxJQUFJO1lBQ0EsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRUQsUUFBUTtZQUNKLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDO1FBQzlDLENBQUM7UUFFRCxNQUFNO1lBQ0YsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDO1FBQ3ZELENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQ3RELENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQ3RELENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQ3RELENBQUM7UUFFRCxLQUFLO1lBQ0QsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQ3RELENBQUM7UUFFRCxNQUFNO1lBQ0YsT0FBTyxJQUFJLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDO1FBQ3pELENBQUM7UUFFRCxNQUFNO1lBQ0YsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELE9BQU8sQ0FBQyxDQUFVO1lBQ2QsT0FBTyxJQUFJLFlBQVksUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElB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SUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTdDLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV6QixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxLQUFLLEVBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLEVBQUMsQ0FBQztZQUN0RCxJQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUMsQ0FBQztnQkFDWixNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUVYLHlCQUF5QjtnQkFDekIsVUFBQSxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixNQUFNLFVBQUEsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BCLENBQUM7UUFDTCxDQUFDO1FBRUQsVUFBQSxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRWhDLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFyQnFCLGtCQUFRLFdBcUI3QixDQUFBO0FBRUQsQ0FBQyxFQWhyQlMsU0FBUyxLQUFULFNBQVMsUUFnckJsQiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBwYXJzZXJfdHMge1xuXG5leHBvcnQgZW51bSBUb2tlblR5cGV7XG4gICAgdW5rbm93bixcblxuICAgIC8vIOitmOWIpeWtkFxuICAgIGlkZW50aWZpZXIsXG5cbiAgICAvLyDjgq/jg6njgrlcbiAgICBDbGFzcyxcblxuICAgIC8vIOaVsOWApFxuICAgIE51bWJlcixcblxuICAgIC8vIOiomOWPt1xuICAgIHN5bWJvbCxcblxuICAgIC8vIOS6iOe0hOiqnlxuICAgIHJlc2VydmVkV29yZCxcblxuICAgIC8vICNuLm1cbiAgICBwYXRoLFxuXG4gICAgLy8gRW5kIE9mIFRleHRcbiAgICBlb3QsXG5cbiAgICAvLyDmjIflrprjgarjgZdcbiAgICBhbnksXG5cbiAgICAvLyDooYzjgrPjg6Hjg7Pjg4hcbiAgICBsaW5lQ29tbWVudCxcblxuICAgIC8vIOODluODreODg+OCr+OCs+ODoeODs+ODiFxuICAgIGJsb2NrQ29tbWVudCxcblxuICAgIC8vIOaUueihjFxuICAgIG5ld0xpbmUsXG5cbiAgICAvLyDmloflrZfliJdcbiAgICBTdHJpbmcsXG5cbiAgICAvLyDmloflrZdcbiAgICBjaGFyYWN0ZXIsXG5cbiAgICAvLyDkuI3mraNcbiAgICBpbGxlZ2FsXG59XG5cblxudmFyIFN5bWJvbFRhYmxlIDogQXJyYXk8c3RyaW5nPiA9IG5ldyAgQXJyYXk8c3RyaW5nPiAoXG4gICAgXCIsXCIsXG4gICAgXCI7XCIsXG4gICAgXCIoXCIsXG4gICAgXCIpXCIsXG4gICAgXCJbXCIsXG4gICAgXCJdXCIsXG4gICAgXCJ7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIrXCIsXG4gICAgXCItXCIsXG4gICAgXCIqXCIsXG4gICAgXCIvXCIsXG4gICAgXCJeXCIsXG4gICAgXCIlXCIsXG4gICAgXCI9XCIsXG4gICAgXCI6XCIsXG4gICAgXCI8XCIsXG4gICAgXCI+XCIsXG4gICAgXCIkXCIsXG5cbiAgICBcIj09XCIsXG4gICAgXCIhPVwiLFxuICAgIFwiPD1cIixcbiAgICBcIj49XCIsXG5cbiAgICBcIiQkXCIsXG4gICAgXCImJlwiLFxuICAgIFwifHxcIixcbiAgICBcIj0+XCIsXG4gICAgXCLih5RcIixcblxuICAgIFwiKz1cIixcbiAgICBcIi09XCIsXG4gICAgXCIqPVwiLFxuICAgIFwiLz1cIixcbiAgICBcIiU9XCIsXG5cbiAgICBcIisrXCIsXG4gICAgXCItLVwiLFxuXG4gICAgXCIhXCIsXG4gICAgXCImXCIsXG4gICAgXCJ8XCIsXG4gICAgXCI/XCIsXG4pO1xuICAgIFxudmFyIEtleXdvcmRNYXAgOiBTZXQ8c3RyaW5nPiA9IG5ldyAgU2V0PHN0cmluZz4gKFtcbiAgICBcImxldFwiXG5dXG4pO1xuXG52YXIgSWRMaXN0IDogQXJyYXk8c3RyaW5nPiA9IG5ldyAgQXJyYXk8c3RyaW5nPiAoXG4pO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNMZXR0ZXIocyA6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPT09IDEgJiYgKFwiYVwiIDw9IHMgJiYgcyA8PSBcInpcIiB8fCBcIkFcIiA8PSBzICYmIHMgPD0gXCJaXCIgfHwgcyA9PSBcIl9cIik7XG59XG5cbmZ1bmN0aW9uIGlzRGlnaXQocyA6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPT0gMSAmJiBcIjAxMjM0NTY3ODlcIi5pbmRleE9mKHMpICE9IC0xO1xufVxuXG5mdW5jdGlvbiBpc0lkTGV0dGVyKHMgOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzTGV0dGVyKHMpIHx8IGlzRGlnaXQocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0xldHRlck9yQXQocyA6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNMZXR0ZXIoc1swXSkgfHwgMiA8PSBzLmxlbmd0aCAmJiBzWzBdID09IFwiQFwiICYmIGlzTGV0dGVyKHNbMV0pO1xufVxuICAgIFxuZXhwb3J0IGVudW0gVG9rZW5TdWJUeXBlIHtcbiAgICB1bmtub3duLFxuICAgIGludGVnZXIsXG4gICAgZmxvYXQsXG4gICAgZG91YmxlLFxufVxuXG5leHBvcnQgY2xhc3MgVG9rZW57XG4gICAgdHlwZVRrbjpUb2tlblR5cGU7XG4gICAgc3ViVHlwZTpUb2tlblN1YlR5cGU7XG4gICAgdGV4dDpzdHJpbmc7XG4gICAgY2hhclBvczpudW1iZXI7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IodHlwZSA6IFRva2VuVHlwZSwgc3ViX3R5cGUgOiBUb2tlblN1YlR5cGUsIHRleHQgOiBzdHJpbmcsIGNoYXJfcG9zIDogbnVtYmVyKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlwiICsgVG9rZW5UeXBlW3R5cGVdICsgXCIgXCIgKyBUb2tlblN1YlR5cGVbc3ViX3R5cGVdICsgXCIgXCIgKyB0ZXh0ICsgXCIgXCIgKyBjaGFyX3Bvcyk7XG4gICAgICAgIHRoaXMudHlwZVRrbiA9IHR5cGU7XG4gICAgICAgIHRoaXMuc3ViVHlwZSA9IHN1Yl90eXBlO1xuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgICAgICB0aGlzLmNoYXJQb3MgPSBjaGFyX3BvcztcbiAgICB9XG59ICAgIFxuXG5leHBvcnQgZnVuY3Rpb24gbGV4aWNhbEFuYWx5c2lzKHRleHQgOiBzdHJpbmcpIDogVG9rZW5bXSB7XG4gICAgY29uc3QgdG9rZW5zIDogVG9rZW5bXSA9IFtdO1xuXG4gICAgLy8g54++5Zyo44Gu5paH5a2X5L2N572uXG4gICAgbGV0IHBvcyA6IG51bWJlciA9IDA7XG5cbiAgICB3aGlsZShwb3MgPCB0ZXh0Lmxlbmd0aCl7XG4gICAgICAgIFxuICAgICAgICAvLyDmlLnooYzku6XlpJbjga7nqbrnmb3jgpLjgrnjgq3jg4Pjg5fjgZfjgb7jgZnjgIJcbiAgICAgICAgZm9yICggOyBwb3MgPCB0ZXh0Lmxlbmd0aCAmJiAodGV4dFtwb3NdID09ICcgJyB8fCB0ZXh0W3Bvc10gPT0gJ1xcdCcgfHwgdGV4dFtwb3NdID09ICdcXHInKTsgcG9zKyspO1xuXG4gICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA8PSBwb3MpIHtcbiAgICAgICAgICAgIC8vIOODhuOCreOCueODiOOBrue1guOCj+OCiuOBruWgtOWQiFxuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN0YXJ0X3BvcyA9IHBvcztcblxuICAgICAgICB2YXIgdG9rZW5fdHlwZSA9IFRva2VuVHlwZS51bmtub3duO1xuICAgICAgICB2YXIgc3ViX3R5cGUgOiBUb2tlblN1YlR5cGUgPSBUb2tlblN1YlR5cGUudW5rbm93bjtcblxuICAgICAgICAvLyDnj77lnKjkvY3nva7jga7mloflrZdcbiAgICAgICAgdmFyIGNoMSA6IHN0cmluZyA9IHRleHRbcG9zXTtcblxuICAgICAgICAvLyDmrKHjga7mloflrZfjga7kvY3nva7jgILooYzmnKvjga7loLTlkIjjga8nXFwwJ1xuICAgICAgICB2YXIgY2gyIDogc3RyaW5nO1xuXG4gICAgICAgIGlmIChwb3MgKyAxIDwgdGV4dC5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIOihjOacq+OBp+OBquOBhOWgtOWQiFxuXG4gICAgICAgICAgICBjaDIgPSB0ZXh0W3BvcyArIDFdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8g6KGM5pyr44Gu5aC05ZCIXG5cbiAgICAgICAgICAgIGNoMiA9ICdcXDAnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoY2gxID09ICdcXG4nKXtcblxuICAgICAgICAgICAgdG9rZW5fdHlwZSA9IFRva2VuVHlwZS5uZXdMaW5lO1xuICAgICAgICAgICAgcG9zKys7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNMZXR0ZXJPckF0KGNoMSArIGNoMikpe1xuICAgICAgICAgICAgLy8g6K2Y5Yil5a2Q44Gu5pyA5Yid44Gu5paH5a2X44Gu5aC05ZCIXG5cbiAgICAgICAgICAgIC8vIOitmOWIpeWtkOOBruaWh+Wtl+OBruacgOW+jOOCkuaOouOBl+OBvuOBmeOAguitmOWIpeWtkOOBruaWh+Wtl+OBr+ODpuODi+OCs+ODvOODieOCq+ODhuOCtOODquODvOOBruaWh+Wtl+OBi+aVsOWtl+OBiydfJ+OAglxuICAgICAgICAgICAgZm9yIChwb3MrKzsgcG9zIDwgdGV4dC5sZW5ndGggJiYgaXNJZExldHRlcih0ZXh0W3Bvc10pOyBwb3MrKyk7XG5cbiAgICAgICAgICAgIC8vIOitmOWIpeWtkOOBruaWh+Wtl+WIl1xuICAgICAgICAgICAgdmFyIG5hbWUgOiBzdHJpbmcgPSB0ZXh0LnN1YnN0cmluZyhzdGFydF9wb3MsIHBvcyk7XG5cbiAgICAgICAgICAgIGlmIChLZXl3b3JkTWFwLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICAgIC8vIOWQjeWJjeOBjOOCreODvOODr+ODvOODiei+nuabuOOBq+OBguOCi+WgtOWQiFxuXG4gICAgICAgICAgICAgICAgdG9rZW5fdHlwZSA9IFRva2VuVHlwZS5yZXNlcnZlZFdvcmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDlkI3liY3jgYzjgq3jg7zjg6/jg7zjg4novp7mm7jjgavjgarjgYTloLTlkIhcblxuICAgICAgICAgICAgICAgIGlmIChJZExpc3QuaW5kZXhPZihuYW1lKSA9PSAtMSkge1xuXG4gICAgICAgICAgICAgICAgICAgIElkTGlzdC5wdXNoKG5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0b2tlbl90eXBlID0gVG9rZW5UeXBlLmlkZW50aWZpZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNEaWdpdChjaDEpKSB7XG4gICAgICAgICAgICAvLyDmlbDlrZfjga7loLTlkIhcblxuICAgICAgICAgICAgdG9rZW5fdHlwZSA9IFRva2VuVHlwZS5OdW1iZXI7XG5cbiAgICAgICAgICAgIC8vIDEw6YCy5pWw44Gu57WC44KP44KK44KS5o6i44GX44G+44GZ44CCXG4gICAgICAgICAgICBmb3IgKDsgcG9zIDwgdGV4dC5sZW5ndGggJiYgaXNEaWdpdCh0ZXh0W3Bvc10pOyBwb3MrKyk7XG5cbiAgICAgICAgICAgIGlmIChwb3MgPCB0ZXh0Lmxlbmd0aCAmJiB0ZXh0W3Bvc10gPT0gJy4nKSB7XG4gICAgICAgICAgICAgICAgLy8g5bCP5pWw54K544Gu5aC05ZCIXG5cbiAgICAgICAgICAgICAgICBwb3MrKztcblxuICAgICAgICAgICAgICAgIC8vIDEw6YCy5pWw44Gu57WC44KP44KK44KS5o6i44GX44G+44GZ44CCXG4gICAgICAgICAgICAgICAgZm9yICg7IHBvcyA8IHRleHQubGVuZ3RoICYmIGlzRGlnaXQodGV4dFtwb3NdKTsgcG9zKyspO1xuXG4gICAgICAgICAgICAgICAgc3ViX3R5cGUgPSBUb2tlblN1YlR5cGUuZmxvYXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHN1Yl90eXBlID0gVG9rZW5TdWJUeXBlLmludGVnZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihjaDEgPT0gXCIjXCIpe1xuXG4gICAgICAgICAgICB0b2tlbl90eXBlID0gVG9rZW5UeXBlLnBhdGg7XG5cbiAgICAgICAgICAgIGZvciAocG9zKys7IHBvcyA8IHRleHQubGVuZ3RoICYmIChpc0RpZ2l0KHRleHRbcG9zXSkgfHwgdGV4dFtwb3NdID09ICctJyB8fCB0ZXh0W3Bvc10gPT0gcGF0aFNlcCk7IHBvcysrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGNoMSA9PSAnXCInKXtcbiAgICAgICAgICAgIHRva2VuX3R5cGUgPSBUb2tlblR5cGUuU3RyaW5nO1xuICAgICAgICAgICAgcG9zID0gdGV4dC5pbmRleE9mKCdcIicsIHBvcyArIDEpO1xuICAgICAgICAgICAgYXNzZXJ0KHBvcyAhPSAtMSk7XG4gICAgICAgICAgICBwb3MrKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChTeW1ib2xUYWJsZS5pbmRleE9mKFwiXCIgKyBjaDEgKyBjaDIpICE9IC0xKSB7XG4gICAgICAgICAgICAvLyAy5paH5a2X44Gu6KiY5Y+344Gu6KGo44Gr44GC44KL5aC05ZCIXG5cbiAgICAgICAgICAgIHRva2VuX3R5cGUgPSBUb2tlblR5cGUuc3ltYm9sO1xuICAgICAgICAgICAgcG9zICs9IDI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoU3ltYm9sVGFibGUuaW5kZXhPZihcIlwiICsgY2gxKSAhPSAtMSkge1xuICAgICAgICAgICAgLy8gMeaWh+Wtl+OBruiomOWPt+OBruihqOOBq+OBguOCi+WgtOWQiFxuXG4gICAgICAgICAgICB0b2tlbl90eXBlID0gVG9rZW5UeXBlLnN5bWJvbDtcbiAgICAgICAgICAgIHBvcysrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8g5LiN5piO44Gu5paH5a2X44Gu5aC05ZCIXG5cbiAgICAgICAgICAgIHRva2VuX3R5cGUgPSBUb2tlblR5cGUudW5rbm93bjtcbiAgICAgICAgICAgIHBvcysrO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLkuI3mmI4gezB9XCIsIHRleHQuc3Vic3RyaW5nKHN0YXJ0X3BvcywgcG9zKSwgXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlrZflj6Xjga7mloflrZfliJfjgpLlvpfjgb7jgZnjgIJcbiAgICAgICAgdmFyIHdvcmQgOiBzdHJpbmc7XG4gICAgICAgIGlmKHRva2VuX3R5cGUgPT0gVG9rZW5UeXBlLlN0cmluZyl7XG4gICAgICAgICAgICB3b3JkID0gdGV4dC5zdWJzdHJpbmcoc3RhcnRfcG9zICsgMSwgcG9zIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIHdvcmQgPSB0ZXh0LnN1YnN0cmluZyhzdGFydF9wb3MsIHBvcyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b2tlbiA9IG5ldyBUb2tlbih0b2tlbl90eXBlLCBzdWJfdHlwZSwgd29yZCwgc3RhcnRfcG9zKTtcblxuICAgICAgICAvLyBtc2coYCR7dG9rZW4uY2hhclBvc30gWyR7dG9rZW4udGV4dH1dICR7dG9rZW4udHlwZVRrbn0gJHt0b2tlbi5zdWJUeXBlfWApO1xuXG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9rZW5zO1xufVxuXG5cbn0iLCJuYW1lc3BhY2UgcGFyc2VyX3RzIHtcblxuZXhwb3J0IGxldCB0ZXJtRGljIDogeyBbaWQgOiBudW1iZXJdIDogVGVybSB9ID0ge307XG5cbmV4cG9ydCBjb25zdCBwYXRoU2VwID0gXCI6XCI7XG5leHBvcnQgbGV0IHZhcmlhYmxlcyA6IFZhcmlhYmxlW10gPSBbXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2hhcGVOYW1lKG5hbWUgOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgY29uc3QgbmFtZXMgPSBbXG4gICAgICAgIFwiUG9pbnRcIiwgXCJDaXJjbGVcIiwgXCJBcmNcIiwgXCJUcmlhbmdsZVwiLCBcbiAgICAgICAgXCJMaW5lQnlQb2ludHNcIiwgXCJIYWxmTGluZVwiLCBcIkxpbmVcIixcbiAgICAgICAgXCJJbnRlcnNlY3Rpb25cIiwgXCJGb290XCIsIFwiQW5nbGVcIiwgXCJQYXJhbGxlbFwiLCBcIlRodW1iXCJcbiAgICBdO1xuICAgIHJldHVybiBuYW1lcy5pbmNsdWRlcyhuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3lzdGVtTmFtZShuYW1lIDogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG5hbWVzID0gW1xuICAgICAgICBcInJhbmdlXCIsXG4gICAgICAgIFwic3FydFwiLFxuICAgICAgICBcImxlbmd0aFwiXG4gICAgXTtcbiAgICByZXR1cm4gaXNTaGFwZU5hbWUobmFtZSkgfHwgbmFtZXMuaW5jbHVkZXMobmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlbGF0aW9uVG9rZW4odGV4dCA6IHN0cmluZyl7XG4gICAgcmV0dXJuIFsgXCI9PVwiLCBcIj1cIiwgXCIhPVwiLCBcIjxcIiwgXCI+XCIsIFwiPD1cIiwgXCI+PVwiLCBcImluXCIsIFwibm90aW5cIiwgXCJzdWJzZXRcIiBdLmluY2x1ZGVzKHRleHQpO1xufVxuXG5mdW5jdGlvbiBpc0FyaXRobWV0aWNUb2tlbih0ZXh0IDogc3RyaW5nKXtcbiAgICByZXR1cm4gW1wiY3VwXCIsIFwiY2FwXCJdLmluY2x1ZGVzKHRleHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFyaWFibGUobmFtZSA6IHN0cmluZykgOiBWYXJpYWJsZSB7XG4gICAgY29uc3QgdmEgPSB2YXJpYWJsZXMuZmluZCh4ID0+IHgubmFtZSA9PSBuYW1lKSE7XG4gICAgYXNzZXJ0KHZhICE9IHVuZGVmaW5lZCk7XG4gICAgcmV0dXJuIHZhO1xufVxuZXhwb3J0IGZ1bmN0aW9uIFplcm8oKSA6IENvbnN0TnVtIHtcbiAgICByZXR1cm4gbmV3IENvbnN0TnVtKDApO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhY3Rpb25SZWYobmFtZSA6IHN0cmluZykgOiBSZWZWYXIge1xuICAgIHJldHVybiBuZXcgUmVmVmFyKG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNYXRoKHRleHQ6IHN0cmluZykgOiBUZXJtIHtcbiAgICAvLyBtc2coYHBhcnNlLU1hdGg6WyR7dGV4dH1dYCk7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcih0ZXh0KTtcbiAgICBjb25zdCB0cm0gPSBwYXJzZXIuUm9vdEV4cHJlc3Npb24oKTtcbiAgICBpZihwYXJzZXIudG9rZW4udHlwZVRrbiAhPSBUb2tlblR5cGUuZW90KXtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCk7XG4gICAgfVxuXG4gICAgdHJtLnNldFBhcmVudChudWxsKTtcblxuICAgIHJldHVybiB0cm07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRSZWZWYXJzKHJvb3QgOiBUZXJtKXtcbiAgICBjb25zdCBhbGxfcmVmcyA9IGFsbFRlcm1zKHJvb3QpLmZpbHRlcih4ID0+IHggaW5zdGFuY2VvZiBSZWZWYXIgJiYgaXNMZXR0ZXIoeC5uYW1lWzBdKSAmJiAhaXNTeXN0ZW1OYW1lKHgubmFtZSkpIGFzIFJlZlZhcltdO1xuICAgIGZvcihjb25zdCByZWYgb2YgYWxsX3JlZnMpe1xuICAgICAgICByZWYucmVmVmFyID0gdmFyaWFibGVzLmZpbmQoeCA9PiB4Lm5hbWUgPT0gcmVmLm5hbWUpO1xuICAgICAgICBhc3NlcnQocmVmLnJlZlZhciAhPSB1bmRlZmluZWQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzR3JlZWsodGV4dCA6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICBhc3NlcnQodHlwZW9mIHRleHQgPT0gXCJzdHJpbmdcIik7XG4gICAgaWYodGV4dC5sZW5ndGggPT0gMCl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBncmVla3MgPSBbXG4gICAgICAgIFwiYWxwaGFcIiwgXCJiZXRhXCIsIFwiZ2FtbWFcIiwgXCJkZWx0YVwiLCBcImVwc2lsb25cIiwgXCJ2YXJlcHNpbG9uXCIsIFwiemV0YVwiLCBcImV0YVwiLCBcInRoZXRhXCIsIFxuICAgICAgICBcInZhcnRoZXRhXCIsIFwiaW90YVwiLCBcImthcHBhXCIsIFwibGFtYmRhXCIsIFwibXVcIiwgXCJudVwiLCBcInhpXCIsIFwicGlcIiwgXCJ2YXJwaVwiLCBcInJob1wiLCBcInZhcnJob1wiLCBcbiAgICAgICAgXCJzaWdtYVwiLCBcInZhcnNpZ21hXCIsIFwidGF1XCIsIFwidXBzaWxvblwiLCBcInBoaVwiLCBcInZhcnBoaVwiLCBcImNoaVwiLCBcInBzaVwiLCBcIm9tZWdhXCJcbiAgICBdO1xuXG4gICAgaWYoZ3JlZWtzLmluY2x1ZGVzKHRleHQpKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgbG93ZXJfY2FzZSA9IHRleHRbMF0udG9Mb3dlckNhc2UoKSArIHRleHQuc3Vic3RyaW5nKDEpOyAgICBcbiAgICBpZihncmVla3MuaW5jbHVkZXMobG93ZXJfY2FzZSkpe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXhOYW1lKHRleHQgOiBzdHJpbmcpe1xuICAgIHN3aXRjaCh0ZXh0KXtcbiAgICBjYXNlIFwiPT1cIiAgICAgOiByZXR1cm4gXCI9XCI7XG4gICAgY2FzZSBcIiE9XCIgICAgIDogcmV0dXJuIFwiXFxcXG5lXCI7XG4gICAgY2FzZSBcIjxcIiAgICAgIDogcmV0dXJuIFwiXFxcXGx0XCI7XG4gICAgY2FzZSBcIj5cIiAgICAgIDogcmV0dXJuIFwiXFxcXGd0XCI7XG4gICAgY2FzZSBcIjw9XCIgICAgIDogcmV0dXJuIFwiXFxcXGxlXCI7XG4gICAgY2FzZSBcIj49XCIgICAgIDogcmV0dXJuIFwiXFxcXGdlXCI7XG4gICAgY2FzZSBcIipcIiAgICAgIDogcmV0dXJuIFwiXFxcXGNkb3RcIjtcbiAgICBjYXNlIFwiPT5cIiAgICAgOiByZXR1cm4gXCJcXFxcaW1wbGllc1wiO1xuICAgIGNhc2UgXCImJlwiICAgICA6IHJldHVybiBcIlxcXFxsYW5kXCI7XG4gICAgY2FzZSBcInx8XCIgICAgIDogcmV0dXJuIFwiXFxcXGxvclwiO1xuICAgIGNhc2UgXCJoYmFyXCIgICA6IHJldHVybiBcIlxcXFxoYmFyXCI7XG4gICAgY2FzZSBcIm5hYmxhXCIgIDogcmV0dXJuIFwiXFxcXG5hYmxhXCI7XG4gICAgY2FzZSBcIm5hYmxhMlwiIDogcmV0dXJuIFwiXFxcXG5hYmxhXjJcIjtcbiAgICBjYXNlIFwic3Vic2V0XCIgOiByZXR1cm4gXCJcXFxcc3Vic2V0ZXFcIjtcbiAgICBjYXNlIFwiaW5mdHlcIiAgOiByZXR1cm4gXCJcXFxcaW5mdHlcIjtcbiAgICBjYXNlIFwiY3VwXCI6XG4gICAgY2FzZSBcImNhcFwiOlxuICAgIGNhc2UgXCJzaW5cIjpcbiAgICBjYXNlIFwiY29zXCI6XG4gICAgY2FzZSBcInRhblwiOlxuICAgIGNhc2UgXCJpblwiICAgOlxuICAgIGNhc2UgXCJub3RpblwiOlxuICAgICAgICByZXR1cm4gYFxcXFwke3RleHR9YDtcbiAgICB9XG5cbiAgICBpZihpc0dyZWVrKHRleHQpKXtcbiAgICAgICAgcmV0dXJuIGBcXFxcJHt0ZXh0fWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRleHQ7XG59XG5cbmxldCB0ZXJtSWQgOiBudW1iZXIgPSAwO1xuXG5leHBvcnQgY2xhc3MgUmF0aW9uYWx7XG4gICAgbnVtZXJhdG9yIDogbnVtYmVyID0gMTtcbiAgICBkZW5vbWluYXRvciA6IG51bWJlciA9IDE7XG4gICAgcGFyZW50IDogVGVybSB8IG51bGwgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IobnVtZXJhdG9yIDogbnVtYmVyLCBkZW5vbWluYXRvciA6IG51bWJlciA9IDEpe1xuICAgICAgICB0aGlzLm51bWVyYXRvciA9IG51bWVyYXRvcjtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuICAgIH1cblxuICAgIGVxKHIgOiBSYXRpb25hbCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuKHRoaXMubnVtZXJhdG9yID09IHIubnVtZXJhdG9yICYmIHRoaXMuZGVub21pbmF0b3IgPT0gci5kZW5vbWluYXRvcik7XG4gICAgfVxuXG4gICAgaXMobnVtZXJhdG9yIDogbnVtYmVyLCBkZW5vbWluYXRvciA6IG51bWJlciA9IDEpIDogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuKHRoaXMubnVtZXJhdG9yID09IG51bWVyYXRvciAmJiB0aGlzLmRlbm9taW5hdG9yID09IGRlbm9taW5hdG9yKTtcbiAgICB9XG5cbiAgICBzZXQobnVtZXJhdG9yIDogbnVtYmVyLCBkZW5vbWluYXRvciA6IG51bWJlciA9IDEpe1xuICAgICAgICB0aGlzLm51bWVyYXRvciAgID0gbnVtZXJhdG9yO1xuICAgICAgICB0aGlzLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG4gICAgfVxuXG4gICAgY2xvbmUoKSA6IFJhdGlvbmFsIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSYXRpb25hbCh0aGlzLm51bWVyYXRvciwgdGhpcy5kZW5vbWluYXRvcik7XG4gICAgfVxuXG4gICAgc3RyKCkgOiBzdHJpbmcge1xuICAgICAgICBpZih0aGlzLmRlbm9taW5hdG9yID09IDEpe1xuXG4gICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5udW1lcmF0b3J9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5udW1lcmF0b3J9IC8gJHt0aGlzLmRlbm9taW5hdG9yfWA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0ZXgoKSA6IHN0cmluZyB7XG4gICAgICAgIGlmKHRoaXMuZGVub21pbmF0b3IgPT0gMSl7XG5cbiAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLm51bWVyYXRvcn1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgIHJldHVybiBgXFxcXGZyYWN7JHt0aGlzLm51bWVyYXRvcn19eyR7dGhpcy5kZW5vbWluYXRvcn19YDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZFJhdGlvbmFsKHIgOiBSYXRpb25hbCl7XG4gICAgICAgIGNvbnN0IG9sZF9mdmFsID0gdGhpcy5mdmFsKCk7XG5cbiAgICAgICAgdGhpcy5udW1lcmF0b3IgPSB0aGlzLm51bWVyYXRvciAqIHIuZGVub21pbmF0b3IgKyByLm51bWVyYXRvciAqIHRoaXMuZGVub21pbmF0b3I7XG4gICAgICAgIHRoaXMuZGVub21pbmF0b3IgKj0gci5kZW5vbWluYXRvcjtcblxuICAgICAgICBhc3NlcnQoTWF0aC5hYnMob2xkX2Z2YWwgKyByLmZ2YWwoKSAtIHRoaXMuZnZhbCgpKSA8IDAuMDAwMDAwMDEpO1xuICAgIH1cblxuICAgIHNldG11bCguLi4gcnMgOiBSYXRpb25hbFtdKXtcbiAgICAgICAgdGhpcy5udW1lcmF0b3IgICAqPSBycy5yZWR1Y2UoKGFjYywgY3VyKSA9PiBhY2MgKiBjdXIubnVtZXJhdG9yLCAgIDEpO1xuICAgICAgICB0aGlzLmRlbm9taW5hdG9yICo9IHJzLnJlZHVjZSgoYWNjLCBjdXIpID0+IGFjYyAqIGN1ci5kZW5vbWluYXRvciwgMSk7XG4gICAgfVxuXG4gICAgc2V0ZGl2KHIgOiBSYXRpb25hbCl7XG4gICAgICAgIHRoaXMubnVtZXJhdG9yICAgKj0gci5kZW5vbWluYXRvcjtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciAqPSByLm51bWVyYXRvcjtcbiAgICB9XG5cbiAgICBmdmFsKCkgOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5udW1lcmF0b3IgLyB0aGlzLmRlbm9taW5hdG9yO1xuICAgIH1cblxuICAgIGFicygpIDogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMuZnZhbCgpKTtcbiAgICB9XG5cbiAgICBzZXRBYnMoKSB7XG4gICAgICAgIHRoaXMubnVtZXJhdG9yICAgPSBNYXRoLmFicyh0aGlzLm51bWVyYXRvcik7XG4gICAgICAgIHRoaXMuZGVub21pbmF0b3IgPSBNYXRoLmFicyh0aGlzLmRlbm9taW5hdG9yKTtcbiAgICB9XG5cbiAgICBpc0ludCgpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbm9taW5hdG9yID09IDE7XG4gICAgfVxuXG4gICAgaXNEaXZpc29yKHIgOiBSYXRpb25hbCkgOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgbnVtZXJhdG9yICAgPSByLm51bWVyYXRvciAqIHRoaXMuZGVub21pbmF0b3I7XG4gICAgICAgIGNvbnN0IGRlbm9taW5hdG9yID0gci5kZW5vbWluYXRvciAqIHRoaXMubnVtZXJhdG9yO1xuXG4gICAgICAgIHJldHVybiBudW1lcmF0b3IgJSBkZW5vbWluYXRvciA9PSAwO1xuICAgIH1cblxuICAgIGludCgpIDogbnVtYmVyIHtcbiAgICAgICAgYXNzZXJ0KHRoaXMuZGVub21pbmF0b3IgPT0gMSk7XG4gICAgICAgIHJldHVybiB0aGlzLm51bWVyYXRvcjtcbiAgICB9XG5cbiAgICBzaWduKCkgOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5zaWduKHRoaXMuZnZhbCgpKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VTaWduKCl7XG4gICAgICAgIHRoaXMubnVtZXJhdG9yICo9IC0xO1xuICAgIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRlcm0ge1xuICAgIHN0YXRpYyB0YWJJZHhDbnQgOiBudW1iZXIgPSAwO1xuICAgIGlkIDogbnVtYmVyO1xuICAgIHRhYklkeCA6IG51bWJlciA9IDA7XG4gICAgcGFyZW50IDogQXBwIHwgbnVsbCA9IG51bGw7XG4gICAgY2xvbmVGcm9tIDogVGVybSB8IHVuZGVmaW5lZDtcblxuICAgIC8vIOS/guaVsFxuICAgIHZhbHVlIDogUmF0aW9uYWwgPSBuZXcgUmF0aW9uYWwoMSk7XG5cbiAgICBjYW5jZWxlZCA6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBjb2xvck5hbWUgIDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGhhc2ggOiBiaWdpbnQgPSAwbjtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuaWQgPSB0ZXJtSWQrKztcbiAgICAgICAgdGhpcy52YWx1ZS5wYXJlbnQgPSB0aGlzO1xuICAgIH1cblxuICAgIGFic3RyYWN0IHRleDIoKSA6IHN0cmluZztcbiAgICBhYnN0cmFjdCBjbG9uZSgpIDogVGVybTtcbiAgICBhYnN0cmFjdCBzdHJpZCgpIDogc3RyaW5nO1xuXG4gICAgdW5jb2xvcigpe1xuICAgICAgICB0aGlzLmNvbG9yTmFtZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZWQoKXtcbiAgICAgICAgdGhpcy5jb2xvck5hbWUgPSBcInJlZFwiO1xuICAgIH1cblxuICAgIGJsdWUoKXtcbiAgICAgICAgdGhpcy5jb2xvck5hbWUgPSBcImJsdWVcIjtcbiAgICB9XG5cbiAgICBjb2xvcmVkKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yTmFtZSAhPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXEodHJtIDogVGVybSkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyKCkgPT0gdHJtLnN0cigpO1xuICAgIH1cblxuICAgIGVxdWFsKHRybSA6IFRlcm0pIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlLmVxKHRybS52YWx1ZSk7XG4gICAgfVxuXG4gICAgY29weShkc3QgOiBUZXJtKXtcbiAgICAgICAgZHN0LmNsb25lRnJvbSA9IHRoaXM7XG4gICAgICAgIGRzdC52YWx1ZSAgPSB0aGlzLnZhbHVlLmNsb25lKCk7XG4gICAgICAgIGRzdC52YWx1ZS5wYXJlbnQgPSBkc3Q7XG5cbiAgICAgICAgZHN0LmNhbmNlbGVkID0gdGhpcy5jYW5jZWxlZDtcbiAgICAgICAgZHN0LmNvbG9yTmFtZSAgPSB0aGlzLmNvbG9yTmFtZTtcbiAgICB9XG5cblxuICAgIGNoYW5nZVNpZ24oKXtcbiAgICAgICAgdGhpcy52YWx1ZS5jaGFuZ2VTaWduKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHJldHVybnMg44Kz44OU44O844GX44Gf44Or44O844OI44Go44CBdGhpc+OBqOWQjOOBmOS9jee9ruOBrumgheOCkui/lOOBmeOAglxuICAgICAqL1xuICAgIGNsb25lUm9vdCgpIDogWyBBcHAsIFRlcm1dIHtcbiAgICAgICAgLy8g44Or44O844OI44GL44KJdGhpc+OBq+iHs+OCi+ODkeOCueOCkuW+l+OCi+OAglxuICAgICAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKCk7XG5cbiAgICAgICAgLy8g44Or44O844OI44KS5b6X44KL44CCXG4gICAgICAgIGNvbnN0IHJvb3QgPSB0aGlzLmdldFJvb3QoKTtcbiAgICAgICAgYXNzZXJ0KHBhdGguZ2V0VGVybShyb290KSA9PSB0aGlzKTtcblxuICAgICAgICAvLyDjg6vjg7zjg4jjgpLjgrPjg5Tjg7zjgZnjgovjgIJcbiAgICAgICAgY29uc3Qgcm9vdF9jcCA9IHJvb3QuY2xvbmUoKTtcblxuICAgICAgICAvLyDjgrPjg5Tjg7zjgZfjgZ/jg6vjg7zjg4jjgYvjgonlkIzjgZjjg5HjgrnjgpLovr/jgaPjgabpoIXjgpLlvpfjgovjgIJcbiAgICAgICAgY29uc3QgdGhpc19jcCA9IHBhdGguZ2V0VGVybShyb290X2NwKTtcbiAgICAgICAgYXNzZXJ0KHRoaXNfY3Auc3RyKCkgPT0gdGhpcy5zdHIoKSk7XG5cbiAgICAgICAgLy8g44Kz44OU44O844GX44Gf44Or44O844OI44Go44CBdGhpc+OBqOWQjOOBmOS9jee9ruOBrumgheOCkui/lOOBmeOAglxuICAgICAgICByZXR1cm4gW3Jvb3RfY3AsIHRoaXNfY3BdO1xuICAgIH1cblxuICAgIGdldFBhdGgocGF0aCA6IFBhdGggPSBuZXcgUGF0aChbXSkpIDogUGF0aCB7XG4gICAgICAgIGlmKHRoaXMucGFyZW50ID09IG51bGwpe1xuXG4gICAgICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaWR4IDogbnVtYmVyO1xuICAgICAgICBpZih0aGlzLnBhcmVudC5mbmMgPT0gdGhpcyl7XG4gICAgICAgICAgICBpZHggPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICBpZHggPSB0aGlzLmFyZ0lkeCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcGF0aC5pbmRleGVzLnVuc2hpZnQoaWR4KTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldFBhdGgocGF0aCk7XG4gICAgfVxuXG4gICAgZ2V0Um9vdCgpIDogQXBwIHtcbiAgICAgICAgaWYodGhpcy5wYXJlbnQgPT0gbnVsbCl7XG4gICAgICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgQXBwKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQhLmdldFJvb3QoKTtcbiAgICB9XG5cbiAgICBnZXRSb290RXFTaWRlSWR4KCkgOiBudW1iZXIge1xuICAgICAgICBmb3IobGV0IHRlcm0gOiBUZXJtID0gdGhpczsgdGVybS5wYXJlbnQgIT0gbnVsbDsgdGVybSA9IHRlcm0ucGFyZW50KXtcbiAgICAgICAgICAgIGlmKHRlcm0ucGFyZW50LmlzUm9vdEVxKCkpe1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXJtLmFyZ0lkeCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcbiAgICB9XG5cbiAgICBnZXRFcVNpZGUoKSA6IFRlcm0gfCBudWxsIHtcbiAgICAgICAgZm9yKGxldCB0ZXJtIDogVGVybSA9IHRoaXM7IHRlcm0ucGFyZW50ICE9IG51bGw7IHRlcm0gPSB0ZXJtLnBhcmVudCEpe1xuICAgICAgICAgICAgaWYodGVybS5wYXJlbnQuaXNSb290RXEoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlcm07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBzZXRQYXJlbnQocGFyZW50IDogQXBwIHwgbnVsbCl7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgICAgICB0aGlzLnZhbHVlLnBhcmVudCA9IHRoaXM7XG4gICAgfVxuXG4gICAgc2V0VGFiSWR4KCl7XG4gICAgICAgIHRoaXMudGFiSWR4ID0gKytUZXJtLnRhYklkeENudDtcbiAgICB9XG5cbiAgICB2ZXJpZnlQYXJlbnQocGFyZW50IDogQXBwIHwgbnVsbCl7XG4gICAgICAgIGFzc2VydCh0aGlzLnBhcmVudCA9PSBwYXJlbnQpO1xuICAgICAgICBhc3NlcnQodGhpcy52YWx1ZS5wYXJlbnQgPT0gdGhpcylcbiAgICB9XG5cbiAgICB2ZXJpZnlQYXJlbnQyKCl7XG4gICAgICAgIHRoaXMudmVyaWZ5UGFyZW50KHRoaXMucGFyZW50KTtcbiAgICB9XG5cbiAgICByZXBsYWNlVGVybSh0YXJnZXQgOiBUZXJtKXtcbiAgICAgICAgY29uc3QgYXBwIDogQXBwID0gdGhpcy5wYXJlbnQhO1xuICAgICAgICBhc3NlcnQoYXBwICE9IG51bGwsIFwicmVwbGFjZVwiKTtcblxuICAgICAgICBpZihhcHAuZm5jID09IHRoaXMpe1xuICAgICAgICAgICAgYXBwLmZuYyA9IHRhcmdldDtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgY29uc3QgaWR4ID0gYXBwLmFyZ3MuZmluZEluZGV4KHggPT4geCA9PSB0aGlzKTtcbiAgICAgICAgICAgIGFzc2VydChpZHggIT0gLTEsIFwicmVwbGFjZSBpZHhcIik7XG4gICAgICAgICAgICBhcHAuYXJnc1tpZHhdID0gdGFyZ2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0LnBhcmVudCA9IGFwcDtcbiAgICB9XG5cbiAgICBhcmdJZHgoKSA6IG51bWJlciB7XG4gICAgICAgIGlmKHRoaXMucGFyZW50ID09IG51bGwpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlkeCA9IHRoaXMucGFyZW50LmFyZ3MuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgYXNzZXJ0KGlkeCAhPSAtMSwgXCJhcmcgaWR4XCIpO1xuXG4gICAgICAgIHJldHVybiBpZHg7XG4gICAgfVxuXG4gICAgYXJnU2hpZnQoZGlmZiA6IG51bWJlcil7XG4gICAgICAgIGNvbnN0IGlkeCA9IHRoaXMuYXJnSWR4KCk7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50IGFzIEFwcDtcbiAgICAgICAgcGFyZW50LmFyZ3Muc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIHBhcmVudC5hcmdzLnNwbGljZShpZHggKyBkaWZmLCAwLCB0aGlzKTtcbiAgICB9XG5cbiAgICByZW1BcmcoKSB7XG4gICAgICAgIGlmKHRoaXMucGFyZW50ID09IG51bGwpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlkeCA9IHRoaXMuYXJnSWR4KCk7XG4gICAgICAgIHRoaXMucGFyZW50LmFyZ3Muc3BsaWNlKGlkeCwgMSk7XG5cbiAgICAgICAgaWYodGhpcy5wYXJlbnQuYXJncy5sZW5ndGggPT0gMSl7XG4gICAgICAgICAgICAvLyB0aGlzLnBhcmVudC5vbmVBcmcoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1dFZhbHVlKHRleHQgOiBzdHJpbmcsIGluX3RleCA6IGJvb2xlYW4pIDogc3RyaW5nIHtcbiAgICAgICAgbGV0IHZhbCA6IHN0cmluZztcblxuICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgQ29uc3ROdW0pe1xuXG4gICAgICAgICAgICB2YWwgPSB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgIGFzc2VydCh0aGlzLnZhbHVlIGluc3RhbmNlb2YgUmF0aW9uYWwpO1xuICAgICAgICAgICAgaWYodGhpcy52YWx1ZS5mdmFsKCkgPT0gMSl7XG4gICAgICAgICAgICAgICAgdmFsID0gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy52YWx1ZS5mdmFsKCkgPT0gLTEpe1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuaXNBZGQoKSl7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFsID0gYC0gKCR7dGV4dH0pYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICAgICAgICB2YWwgPSBgLSAke3RleHR9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMudmFsdWUuZGVub21pbmF0b3IgPT0gMSl7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBvcHIgPSAoaW5fdGV4ID8gXCJcXFxcY2RvdFwiIDogXCIqXCIpO1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuaXNBZGQoKSl7XG4gICAgICAgICAgICAgICAgICAgIHZhbCA9IGAke3RoaXMudmFsdWUubnVtZXJhdG9yfSAke29wcn0gKCR7dGV4dH0pYFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICB2YWwgPSBgJHt0aGlzLnZhbHVlLm51bWVyYXRvcn0gJHtvcHJ9ICR7dGV4dH1gXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5wYXJlbnQgIT0gbnVsbCAmJiB0aGlzICE9IHRoaXMucGFyZW50LmZuYyAmJiB0aGlzLnBhcmVudC5pc0FkZCgpKXtcbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHRoaXMuYXJnSWR4KCk7XG5cbiAgICAgICAgICAgIGlmKGlkeCAhPSAwKXtcblxuICAgICAgICAgICAgICAgIGlmKDAgPD0gdGhpcy52YWx1ZS5mdmFsKCkpe1xuXG4gICAgICAgICAgICAgICAgICAgIHZhbCA9IFwiKyBcIiArIHZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihpbl90ZXgpe1xuXG4gICAgICAgICAgICBpZih0aGlzLmNvbG9yZWQoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGB7XFxcXGNvbG9yeyR7dGhpcy5jb2xvck5hbWV9fSAke3ZhbH19YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5jYW5jZWxlZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBcXFxcY2FuY2VseyR7dmFsfX1gXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIHN0cjIoKSA6IHN0cmluZyB7XG4gICAgICAgIGFzc2VydChmYWxzZSwgXCJzdHIyXCIpO1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG5cbiAgICBzdHIoKSA6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0clgoKTtcbiAgICB9XG5cbiAgICBzdHJYKCkgOiBzdHJpbmcge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5zdHIyKCk7XG4gICAgICAgIHJldHVybiB0aGlzLnB1dFZhbHVlKHRleHQsIGZhbHNlKTtcbiAgICB9XG5cblxuICAgIGh0bWxkYXRhKHRleHQgOiBzdHJpbmcpIDogc3RyaW5nIHtcbiAgICAgICAgdGVybURpY1t0aGlzLmlkXSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBgXFxcXGh0bWxEYXRhe2lkPSR7dGhpcy5pZH0sIHRhYmlkeD0ke3RoaXMudGFiSWR4fX17JHt0ZXh0fX1gO1xuICAgIH1cbiAgICBcbiAgICB0ZXgoKSA6IHN0cmluZyB7XG4gICAgICAgIGxldCB0ZXh0ID0gdGhpcy50ZXgyKCk7XG5cbiAgICAgICAgaWYodGhpcy5jb2xvcmVkKCkpe1xuXG4gICAgICAgICAgICB0ZXh0ID0gYHtcXFxcY29sb3J7JHt0aGlzLmNvbG9yTmFtZX19ICR7dGhpcy5wdXRWYWx1ZSh0ZXh0LCB0cnVlKX19YDtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGlzLmh0bWxkYXRhKHRoaXMucHV0VmFsdWUodGV4dCwgdHJ1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgIHRleHQgPSB0aGlzLnB1dFZhbHVlKHRleHQsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIENvbnN0TnVtIHx8IHRoaXMgaW5zdGFuY2VvZiBSZWZWYXIgfHwgdGhpcyBpbnN0YW5jZW9mIEFwcCl7XG4gICAgICAgICAgICB0ZXh0ID0gYFxcXFxodG1sSWR7dGV4LXRlcm0tJHt0aGlzLmlkfX17JHt0ZXh0fX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgaXNBcHAoZm5jX25hbWUgOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQXBwICYmIHRoaXMuZm5jTmFtZSA9PSBmbmNfbmFtZTtcbiAgICB9XG5cbiAgICBpc09wZXJhdG9yKCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBBcHAgJiYgdGhpcy5wcmVjZWRlbmNlKCkgIT0gLTE7XG4gICAgfVxuXG4gICAgaXNOYW1lZEZuYygpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgUmVmVmFyICYmIGlzTGV0dGVyKHRoaXMubmFtZVswXSk7XG4gICAgfVxuXG4gICAgaXNPcHJGbmMoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIFJlZlZhciAmJiAhIGlzTGV0dGVyKHRoaXMubmFtZVswXSk7XG4gICAgfVxuXG4gICAgaXNFcSgpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQXBwICYmICh0aGlzLmZuY05hbWUgPT0gXCI9PVwiIHx8IHRoaXMuZm5jTmFtZSA9PSBcIj1cIik7XG4gICAgfVxuXG4gICAgaXNSb290RXEoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0VxKCkgJiYgdGhpcy5wYXJlbnQgPT0gbnVsbDtcbiAgICB9XG5cbiAgICBpc0xpc3QoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEFwcCAmJiB0aGlzLmZuY05hbWUgPT0gXCJbXVwiO1xuICAgIH1cblxuICAgIGlzQWRkKCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBBcHAgJiYgdGhpcy5mbmNOYW1lID09IFwiK1wiO1xuICAgIH1cblxuICAgIGlzTXVsKCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBBcHAgJiYgdGhpcy5mbmNOYW1lID09IFwiKlwiO1xuICAgIH1cblxuICAgIGlzRGl2KCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBBcHAgJiYgdGhpcy5mbmNOYW1lID09IFwiL1wiO1xuICAgIH1cblxuICAgIGlzRG90KCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBBcHAgJiYgdGhpcy5mbmNOYW1lID09IFwiLlwiO1xuICAgIH1cblxuICAgIGlzU3FydCgpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQXBwICYmIHRoaXMuZm5jTmFtZSA9PSBcInNxcnRcIjtcbiAgICB9XG5cbiAgICBpc1plcm8oKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZS5udW1lcmF0b3IgPT0gMDtcbiAgICB9XG5cbiAgICBpc1ZhbHVlKG4gOiBudW1iZXIpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQ29uc3ROdW0gJiYgdGhpcy52YWx1ZS5mdmFsKCkgPT0gbjtcbiAgICB9XG5cbiAgICBpc09uZSgpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzVmFsdWUoMSk7XG4gICAgfVxuXG4gICAgaXNJbnQoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIENvbnN0TnVtICYmIHRoaXMudmFsdWUuaXNJbnQoKTtcbiAgICB9XG5cbiAgICBpc0UoKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIFJlZlZhciAmJiB0aGlzLm5hbWUgPT0gXCJlXCI7XG4gICAgfVxuXG4gICAgaXNJKCkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBSZWZWYXIgJiYgdGhpcy5uYW1lID09IFwiaVwiO1xuICAgIH1cblxuICAgIGlzRGlmZigpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQXBwICYmICh0aGlzLmZuY05hbWUgPT0gXCJkaWZmXCIgfHwgdGhpcy5mbmNOYW1lID09IFwicGRpZmZcIik7XG4gICAgfVxuXG4gICAgaXNMaW0oKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEFwcCAmJiB0aGlzLmZuY05hbWUgPT0gXCJsaW1cIjtcbiAgICB9XG5cbiAgICBkaXZpZGVuZCgpIDogVGVybSB7XG4gICAgICAgIGFzc2VydCh0aGlzLmlzRGl2KCkpO1xuICAgICAgICByZXR1cm4gKHRoaXMgYXMgYW55IGFzIEFwcCkuYXJnc1swXTtcbiAgICB9XG5cbiAgICBkaXZpc29yKCkgOiBUZXJtIHtcbiAgICAgICAgYXNzZXJ0KHRoaXMuaXNEaXYoKSk7XG4gICAgICAgIHJldHVybiAodGhpcyBhcyBhbnkgYXMgQXBwKS5hcmdzWzFdO1xuICAgIH1cblxuXG4gICAgZGVwZW5kKGR2YXIgOiBSZWZWYXIpIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBhbGxUZXJtcyh0aGlzKS5zb21lKHggPT4gZHZhci5lcSh4KSk7XG4gICAgfVxuXG4gICAgY2FsYygpIDogbnVtYmVyIHtcbiAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIFJhdGlvbmFsKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZ2YWwoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMgaW5zdGFuY2VvZiBDb25zdE51bSl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZS5mdmFsKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzIGluc3RhbmNlb2YgUmVmVmFyKXtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLnJlZlZhciEuZXhwcjtcbiAgICAgICAgICAgIGlmKGRhdGEgaW5zdGFuY2VvZiBUZXJtKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5jYWxjKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKFwidW5pbXBsZW1lbnRlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMgaW5zdGFuY2VvZiBBcHApe1xuICAgICAgICAgICAgY29uc3QgYXBwID0gdGhpcztcbiAgICAgICAgICAgIGlmKGFwcC5pc0FwcChcInNxcnRcIikpe1xuICAgICAgICAgICAgICAgIGFzc2VydChhcHAuYXJncy5sZW5ndGggPT0gMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydChhcHAuYXJnc1swXS5jYWxjKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcihcInVuaW1wbGVtZW50ZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoXCJ1bmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIGNvcHlWYWx1ZShjbnMgOiBDb25zdE51bSl7XG4gICAgICAgIGFzc2VydCh0aGlzIGluc3RhbmNlb2YgQ29uc3ROdW0pO1xuICAgICAgICB0aGlzLnZhbHVlLnNldChjbnMudmFsdWUubnVtZXJhdG9yLCBjbnMudmFsdWUuZGVub21pbmF0b3IpO1xuICAgIH1cblxuICAgIGRtcFRlcm0obmVzdCA6IHN0cmluZyl7XG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBBcHApe1xuXG4gICAgICAgICAgICBtc2coYCR7bmVzdH0ke3RoaXMuaWR9YCk7XG4gICAgICAgICAgICB0aGlzLmZuYy5kbXBUZXJtKG5lc3QgKyBcIlxcdFwiKTtcbiAgICAgICAgICAgIHRoaXMuYXJncy5mb3JFYWNoKHggPT4geC5kbXBUZXJtKG5lc3QgKyBcIlxcdFwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgbXNnKGAke25lc3R9JHt0aGlzLmlkfToke3RoaXMuc3RyKCl9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRBbGxUZXJtcyh0ZXJtcyA6IFRlcm1bXSl7XG4gICAgICAgIHRlcm1zLnB1c2godGhpcyk7XG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBBcHApe1xuICAgICAgICAgICAgdGhpcy5mbmMuZ2V0QWxsVGVybXModGVybXMpO1xuICAgICAgICAgICAgdGhpcy5hcmdzLmZvckVhY2goeCA9PiB4LmdldEFsbFRlcm1zKHRlcm1zKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbmNsdWRlc1Rlcm0odGVybSA6IFRlcm0pIDogYm9vbGVhbiB7XG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBBcHApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWxsVGVybXMoKS5pbmNsdWRlcyh0ZXJtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMgPT0gdGVybTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhdGggZXh0ZW5kcyBUZXJtIHtcbiAgICBpbmRleGVzIDogbnVtYmVyW10gPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKGluZGV4ZXMgOiBudW1iZXJbXSl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuaW5kZXhlcyA9IGluZGV4ZXMuc2xpY2UoKTtcbiAgICB9XG5cbiAgICBlcXVhbCh0cm0gOiBUZXJtKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gc3VwZXIuZXF1YWwodHJtKSAmJiB0cm0gaW5zdGFuY2VvZiBQYXRoICYmIHJhbmdlKHRoaXMuaW5kZXhlcy5sZW5ndGgpLmV2ZXJ5KGkgPT4gdGhpcy5pbmRleGVzW2ldID09IHRybS5pbmRleGVzW2ldKTtcbiAgICB9XG5cbiAgICBzdHJpZCgpIDogc3RyaW5ne1xuICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xuICAgIH1cblxuICAgIHN0clgoKSA6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgIyR7dGhpcy5pbmRleGVzLmpvaW4ocGF0aFNlcCl9YDtcbiAgICB9XG5cbiAgICB0ZXgyKCkgOiBzdHJpbmcge1xuICAgICAgICBhc3NlcnQoZmFsc2UsIFwicGF0aDp0ZXgyXCIpO1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG5cbiAgICBjbG9uZSgpIDogVGVybSB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBuZXcgUGF0aCh0aGlzLmluZGV4ZXMpO1xuICAgICAgICB0aGlzLmNvcHkocGF0aCk7XG5cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuXG4gICAgZ2V0VGVybShyb290IDogQXBwLCBnZXRfcGFyZW50IDogYm9vbGVhbiA9IGZhbHNlKSA6IFRlcm0ge1xuICAgICAgICBpZih0aGlzLmluZGV4ZXMubGVuZ3RoID09IDApe1xuICAgICAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgbGV0IGFwcCA9IHJvb3Q7XG5cbiAgICAgICAgY29uc3QgbGFzdF9pID0gKGdldF9wYXJlbnQgPyB0aGlzLmluZGV4ZXMubGVuZ3RoIC0gMiA6IHRoaXMuaW5kZXhlcy5sZW5ndGggLSAxKTtcblxuICAgICAgICBmb3IoY29uc3QgW2ksIGlkeF0gb2YgdGhpcy5pbmRleGVzLmVudHJpZXMoKSl7XG4gICAgICAgICAgICBpZihpID09IGxhc3RfaSl7XG4gICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIChpZHggPT0gLTEgPyBhcHAuZm5jIDogYXBwLmFyZ3NbaWR4XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGFwcCA9IChpZHggPT0gLTEgPyBhcHAuZm5jIDogYXBwLmFyZ3NbaWR4XSkgYXMgQXBwO1xuICAgICAgICAgICAgICAgIGFzc2VydChhcHAgaW5zdGFuY2VvZiBBcHAsIFwicGFzczpnZXQgdGVybVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcihcImdldCB0ZXJtXCIpO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgVmFyaWFibGUge1xuICAgIG5hbWUgOiBzdHJpbmc7XG4gICAgZXhwciA6IFRlcm07XG4gICAgZGVwVmFycyA6IFZhcmlhYmxlW107XG5cbiAgICBjb25zdHJ1Y3RvcihuYW1lIDogc3RyaW5nLCBleHByIDogVGVybSl7XG4gICAgICAgIHZhcmlhYmxlcy5wdXNoKHRoaXMpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmV4cHIgPSBleHByO1xuXG4gICAgICAgIGNvbnN0IHJlZnMgPSBhbGxUZXJtcyhleHByKS5maWx0ZXIoeCA9PiB4IGluc3RhbmNlb2YgUmVmVmFyICYmICEoeC5wYXJlbnQgaW5zdGFuY2VvZiBBcHAgJiYgeC5wYXJlbnQuZm5jID09IHgpKSBhcyBSZWZWYXJbXTtcbiAgICAgICAgdGhpcy5kZXBWYXJzID0gcmVmcy5tYXAocmVmID0+IHZhcmlhYmxlcy5maW5kKHYgPT4gdi5uYW1lID09IHJlZi5uYW1lKSkgYXMgVmFyaWFibGVbXTtcbiAgICAgICAgYXNzZXJ0KHRoaXMuZGVwVmFycy5ldmVyeSh4ID0+IHggIT0gdW5kZWZpbmVkKSk7XG5cbiAgICAgICAgaWYodGhpcy5kZXBWYXJzLmxlbmd0aCAhPSAwKXtcbiAgICAgICAgICAgIG1zZyhgJHt0aGlzLm5hbWV9IGRlcGVuZHMgJHt0aGlzLmRlcFZhcnMubWFwKHggPT4geC5uYW1lKS5qb2luKFwiIFwiKX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmFtZShuZXdfbmFtZSA6IHN0cmluZyl7XG4gICAgICAgIHRoaXMubmFtZSA9IG5ld19uYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlZlZhciBleHRlbmRzIFRlcm17XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHJlZlZhciEgOiBWYXJpYWJsZSB8IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgZXF1YWwodHJtIDogVGVybSkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmVxdWFsKHRybSkgJiYgdHJtIGluc3RhbmNlb2YgUmVmVmFyICYmIHRoaXMubmFtZSA9PSB0cm0ubmFtZTtcbiAgICB9XG5cbiAgICBzdHJpZCgpIDogc3RyaW5ne1xuICAgICAgICBpZih0aGlzLnZhbHVlLmlzKDEpKXtcblxuICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMubmFtZX1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnZhbHVlLnN0cigpfSAke3RoaXMubmFtZX1gO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvbmUoKSA6IFJlZlZhciB7XG4gICAgICAgIGNvbnN0IHJlZiA9IG5ldyBSZWZWYXIodGhpcy5uYW1lKTtcbiAgICAgICAgdGhpcy5jb3B5KHJlZik7XG5cbiAgICAgICAgcmV0dXJuIHJlZjtcbiAgICB9XG5cbiAgICBzdHIyKCkgOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cblxuICAgIHRleDIoKSA6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0ZXhOYW1lKHRoaXMubmFtZSk7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBDb25zdE51bSBleHRlbmRzIFRlcm17XG4gICAgc3RhdGljIHplcm8oKSA6IENvbnN0TnVtIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb25zdE51bSgwKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihudW1lcmF0b3IgOiBudW1iZXIsIGRlbm9taW5hdG9yIDogbnVtYmVyID0gMSl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudmFsdWUgPSBuZXcgUmF0aW9uYWwobnVtZXJhdG9yLCBkZW5vbWluYXRvcik7XG4gICAgfVxuXG4gICAgZXF1YWwodHJtIDogVGVybSkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmVxdWFsKHRybSk7XG4gICAgfVxuXG4gICAgc3RyaWQoKSA6IHN0cmluZ3tcbiAgICAgICAgcmV0dXJuIGAke3RoaXMudmFsdWUuc3RyKCl9YDtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbVJhdGlvbmFsKHIgOiBSYXRpb25hbCkgOiBDb25zdE51bSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29uc3ROdW0oci5udW1lcmF0b3IsIHIuZGVub21pbmF0b3IpO1xuICAgIH1cblxuICAgIGNsb25lKCkgOiBDb25zdE51bSB7XG4gICAgICAgIGNvbnN0IGNucyA9IG5ldyBDb25zdE51bSh0aGlzLnZhbHVlLm51bWVyYXRvciwgdGhpcy52YWx1ZS5kZW5vbWluYXRvcik7XG4gICAgICAgIHRoaXMuY29weShjbnMpO1xuXG4gICAgICAgIHJldHVybiBjbnM7XG4gICAgfVxuXG4gICAgc3RyMigpIDogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWUuc3RyKCk7ICAgICAgICBcbiAgICB9XG5cbiAgICBzdHJYKCkgOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZS5zdHIoKTsgICAgICAgIFxuICAgIH1cblxuICAgIHRleDIoKSA6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlLnRleCgpO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgU3RyIGV4dGVuZHMgVGVybXtcbiAgICB0ZXh0IDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodGV4dCA6IHN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgfVxuXG4gICAgZXF1YWwodHJtIDogVGVybSkgOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRybSBpbnN0YW5jZW9mIFN0ciAmJiB0cm0udGV4dCA9PSB0aGlzLnRleHQ7XG4gICAgfVxuXG4gICAgc3RyaWQoKSA6IHN0cmluZ3tcbiAgICAgICAgcmV0dXJuIGBcIiR7dGhpcy50ZXh0fVwiYDtcbiAgICB9XG5cbiAgICBjbG9uZSgpIDogU3RyIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdHIodGhpcy50ZXh0KTtcbiAgICB9XG5cbiAgICBzdHIyKCkgOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5zdHJpZCgpOyAgICAgICAgXG4gICAgfVxuXG4gICAgc3RyWCgpIDogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyaWQoKTsgICAgICAgIFxuICAgIH1cblxuICAgIHRleDIoKSA6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0cmlkKCk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQXBwIGV4dGVuZHMgVGVybXtcbiAgICBmbmMgOiBUZXJtO1xuICAgIGFyZ3M6IFRlcm1bXTtcbiAgICByZW1QYXJlbnRoZXNlcyA6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHN0YXRpYyBzdGFydEVuZCA6IHsgW3N0YXJ0IDogc3RyaW5nXSA6IHN0cmluZyB9ID0ge1xuICAgICAgICBcIihcIiA6IFwiKVwiLFxuICAgICAgICBcIltcIiA6IFwiXVwiLFxuICAgICAgICBcIntcIiA6IFwifVwiLFxuICAgIH1cblxuICAgIGdldCByZWZWYXIoKSA6IFJlZlZhciB8IG51bGwge1xuICAgICAgICBpZih0aGlzLmZuYyAhPSBudWxsICYmIHRoaXMuZm5jIGluc3RhbmNlb2YgUmVmVmFyKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZuYztcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgZm5jTmFtZSgpIDogc3RyaW5nIHtcbiAgICAgICAgaWYodGhpcy5mbmMgaW5zdGFuY2VvZiBSZWZWYXIpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm5jLm5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBgbm8tZm5jLW5hbWVgO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBjb25zdHJ1Y3RvcihmbmM6IFRlcm0sIGFyZ3M6IFRlcm1bXSl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZm5jICAgID0gZm5jO1xuICAgICAgICB0aGlzLmZuYy5wYXJlbnQgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuYXJncyAgID0gYXJncy5zbGljZSgpO1xuXG4gICAgICAgIHRoaXMuYXJncy5mb3JFYWNoKHggPT4geC5wYXJlbnQgPSB0aGlzKTtcbiAgICB9XG5cbiAgICBlcXVhbCh0cm0gOiBUZXJtKSA6IGJvb2xlYW4ge1xuICAgICAgICBpZihzdXBlci5lcXVhbCh0cm0pICYmIHRybSBpbnN0YW5jZW9mIEFwcCl7XG4gICAgICAgICAgICBpZih0aGlzLmZuYy5lcXVhbCh0cm0uZm5jKSl7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5hcmdzLmxlbmd0aCA9PSB0cm0uYXJncy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmFuZ2UodGhpcy5hcmdzLmxlbmd0aCkuZXZlcnkoaSA9PiB0aGlzLmFyZ3NbaV0uZXF1YWwodHJtLmFyZ3NbaV0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG5cbiAgICBzdHJpZCgpIDogc3RyaW5ne1xuICAgICAgICBsZXQgcyA6IHN0cmluZztcbiAgICAgICAgaWYodGhpcy5mbmMuaXNPcHJGbmMoKSl7XG4gICAgICAgICAgICBzID0gXCIoXCIgKyB0aGlzLmFyZ3MubWFwKHggPT4geC5zdHJpZCgpKS5qb2luKHRoaXMuZm5jTmFtZSkgKyBcIilcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgcyA9IGAke3RoaXMuZm5jTmFtZX0oJHt0aGlzLmFyZ3MubWFwKHggPT4geC5zdHJpZCgpKS5qb2luKFwiLCBcIil9KWA7XG5cbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLnZhbHVlLmlzKDEpKXtcblxuICAgICAgICAgICAgcmV0dXJuIHM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMudmFsdWUuc3RyKCl9ICR7c31gO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvbmUoKSA6IEFwcCB7XG4gICAgICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAodGhpcy5mbmMuY2xvbmUoKSwgdGhpcy5hcmdzLm1hcCh4ID0+IHguY2xvbmUoKSkpO1xuXG4gICAgICAgIHRoaXMuY29weShhcHApO1xuXG4gICAgICAgIHJldHVybiBhcHA7XG4gICAgfVxuXG4gICAgc2V0UGFyZW50KHBhcmVudCA6IEFwcCB8IG51bGwpe1xuICAgICAgICBzdXBlci5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICB0aGlzLmZuYy5zZXRQYXJlbnQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5hcmdzLmZvckVhY2goeCA9PiB4LnNldFBhcmVudCh0aGlzKSk7XG4gICAgfVxuXG4gICAgc2V0VGFiSWR4KCl7XG4gICAgICAgIHN1cGVyLnNldFRhYklkeCgpO1xuICAgICAgICB0aGlzLmZuYy5zZXRUYWJJZHgoKTtcbiAgICAgICAgdGhpcy5hcmdzLmZvckVhY2goeCA9PiB4LnNldFRhYklkeCgpKTtcbiAgICB9XG5cblxuICAgIHZlcmlmeVBhcmVudChwYXJlbnQgOiBBcHAgfCBudWxsKXtcbiAgICAgICAgc3VwZXIudmVyaWZ5UGFyZW50KHBhcmVudCk7XG5cbiAgICAgICAgdGhpcy5mbmMudmVyaWZ5UGFyZW50KHRoaXMpO1xuXG4gICAgICAgIHRoaXMuYXJncy5mb3JFYWNoKHggPT4geC52ZXJpZnlQYXJlbnQodGhpcykpO1xuICAgIH1cblxuICAgIHN0cjIoKSA6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSB0aGlzLmFyZ3MubWFwKHggPT4geC5zdHIoKSk7XG4gICAgICAgIFxuICAgICAgICBsZXQgdGV4dCA6IHN0cmluZztcbiAgICAgICAgaWYodGhpcy5mbmMgaW5zdGFuY2VvZiBBcHApe1xuICAgICAgICAgICAgY29uc3QgYXJnc19zID0gYXJncy5qb2luKFwiLCBcIik7XG4gICAgICAgICAgICB0ZXh0ID0gYCgke3RoaXMuZm5jLnN0cigpfSkoJHthcmdzX3N9KWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihpc0xldHRlck9yQXQodGhpcy5mbmNOYW1lKSl7XG4gICAgICAgICAgICBjb25zdCBhcmdzX3MgPSBhcmdzLmpvaW4oXCIsIFwiKTtcbiAgICAgICAgICAgIHRleHQgPSBgJHt0aGlzLmZuY05hbWV9KCR7YXJnc19zfSlgO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgIHN3aXRjaCh0aGlzLmZuY05hbWUpe1xuICAgICAgICAgICAgICAgIGNhc2UgXCIrXCI6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChhcmdzLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIFwiICtbXSBcIjtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gYCArWyR7YXJnc1swXX1dIGA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IGFyZ3Muam9pbihgIGApO1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgIFxuICAgICAgICAgICAgICAgIGNhc2UgXCIvXCI6XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuYXJncy5sZW5ndGggIT0gMil7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSBgJHthcmdzWzBdfSAvICR7YXJnc1sxXX1gO1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gYXJncy5qb2luKGAgJHt0aGlzLmZuY05hbWV9IGApO1xuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5pc09wZXJhdG9yKCkgJiYgdGhpcy5wYXJlbnQgIT0gbnVsbCAmJiB0aGlzLnBhcmVudC5pc09wZXJhdG9yKCkpe1xuICAgICAgICAgICAgaWYodGhpcy5wYXJlbnQucHJlY2VkZW5jZSgpIDw9IHRoaXMucHJlY2VkZW5jZSgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCgke3RleHR9KWA7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICB0ZXgyKCkgOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBhcmdzID0gdGhpcy5hcmdzLm1hcCh4ID0+IHgudGV4KCkpO1xuXG4gICAgICAgIGxldCB0ZXh0IDogc3RyaW5nO1xuICAgICAgICBpZih0aGlzLmZuYyBpbnN0YW5jZW9mIEFwcCl7XG5cbiAgICAgICAgICAgIGNvbnN0IGFyZ3NfcyA9IGFyZ3Muam9pbihcIiwgXCIpO1xuICAgICAgICAgICAgdGV4dCA9IGAoJHt0aGlzLmZuYy50ZXgoKX0pKCR7YXJnc19zfSlgO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5mbmNOYW1lID09IFwibGltXCIpe1xuICAgICAgICAgICAgc3dpdGNoKGFyZ3MubGVuZ3RoKXtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxcXFxsaW0gJHthcmdzWzBdfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcXFxcbGltX3ske2FyZ3NbMV19IFxcXFx0byAke2FyZ3NbMl19fSAke2FyZ3NbMF19YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMuZm5jTmFtZSA9PSBcInN1bVwiKXtcbiAgICAgICAgICAgIHN3aXRjaChhcmdzLmxlbmd0aCl7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcXFxcc3VtICR7YXJnc1swXX1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXHN1bV97JHthcmdzWzFdfX1eeyR7YXJnc1syXX19ICR7YXJnc1swXX1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXHN1bV97JHthcmdzWzFdfT0ke2FyZ3NbMl19fV57JHthcmdzWzNdfX0gJHthcmdzWzBdfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLmZuY05hbWUgPT0gXCJsb2dcIil7XG4gICAgICAgICAgICBpZihhcmdzLmxlbmd0aCA9PSAxKXtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxcXFxsb2cgJHthcmdzWzBdfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGFyZ3MubGVuZ3RoID09IDIpe1xuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXGxvZ197JHthcmdzWzFdfX0gJHthcmdzWzBdfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLmZuY05hbWUgPT0gXCJ7fH1cIil7XG4gICAgICAgICAgICB0ZXh0ID0gYFxcXFx7JHthcmdzWzBdfSBcXFxcbWlkICR7YXJnc1sxXX0gXFxcXH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5mbmNOYW1lID09IFwiaW5cIil7XG4gICAgICAgICAgICBsZXQgaWRzIDogc3RyaW5nO1xuICAgICAgICAgICAgaWYodGhpcy5hcmdzWzBdLmlzQXBwKFwiLFwiKSl7XG5cbiAgICAgICAgICAgICAgICBpZHMgPSAodGhpcy5hcmdzWzBdIGFzIEFwcCkuYXJncy5tYXAoeCA9PiB4LnRleCgpKS5qb2luKFwiICwgXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBpZHMgPSBhcmdzWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGV4dCA9IGAke2lkc30gXFxcXGluICR7YXJnc1sxXX1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5mbmNOYW1lID09IFwiY29tcGxlbWVudFwiKXtcbiAgICAgICAgICAgIHRleHQgPSBgeyAke2FyZ3NbMF19IH1eY2A7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLmlzRGlmZigpKXtcbiAgICAgICAgICAgIGNvbnN0IG4gPSAodGhpcy5hcmdzLmxlbmd0aCA9PSAzID8gYF57JHthcmdzWzJdfX1gOmBgKTtcblxuICAgICAgICAgICAgY29uc3QgZCA9ICh0aGlzLmZuY05hbWUgPT0gXCJkaWZmXCIgPyBcImRcIiA6IFwiXFxcXHBhcnRpYWxcIik7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuYXJncy5sZW5ndGggPT0gMSl7XG4gICAgICAgICAgICAgICAgdGV4dCA9IGAoJHthcmdzWzBdfSknYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoYXJnc1swXS5pbmRleE9mKFwiXFxcXGZyYWNcIikgPT0gLTEpe1xuXG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcXFxcZnJhY3sgJHtkfSAke259ICR7YXJnc1swXX19eyAke2R9ICAke2FyZ3NbMV19JHtufX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXGZyYWN7ICR7ZH0gJHtufSB9eyAke2R9ICAke2FyZ3NbMV19JHtufX0gKCR7YXJnc1swXX0pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGlzTGV0dGVyT3JBdCh0aGlzLmZuY05hbWUpKXtcbiAgICAgICAgICAgIGlmKFtcInNpblwiLCBcImNvc1wiLCBcInRhblwiXS5pbmNsdWRlcyh0aGlzLmZuY05hbWUpICYmICEgKHRoaXMuYXJnc1swXSBpbnN0YW5jZW9mIEFwcCkpe1xuXG4gICAgICAgICAgICAgICAgdGV4dCA9IGAke3RleE5hbWUodGhpcy5mbmNOYW1lKX0gJHthcmdzWzBdfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuZm5jTmFtZSA9PSBcImFic1wiKXtcbiAgICAgICAgICAgICAgICBhc3NlcnQoYXJncy5sZW5ndGggPT0gMSwgXCJ0ZXgyXCIpO1xuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXGx2ZXJ0ICR7YXJnc1swXX0gXFxcXHJ2ZXJ0YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5mbmNOYW1lID09IFwic3FydFwiKXtcbiAgICAgICAgICAgICAgICBhc3NlcnQoYXJncy5sZW5ndGggPT0gMSwgXCJ0ZXgyXCIpO1xuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXHNxcnR7JHthcmdzWzBdfX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmZuY05hbWUgPT0gXCJudGhfcm9vdFwiKXtcbiAgICAgICAgICAgICAgICBhc3NlcnQoYXJncy5sZW5ndGggPT0gMiwgXCJ0ZXgyXCIpO1xuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXHNxcnRbJHthcmdzWzFdfV17JHthcmdzWzBdfX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihpc0FyaXRobWV0aWNUb2tlbih0aGlzLmZuY05hbWUpICl7XG4gICAgICAgICAgICAgICAgdGV4dCA9IGAke2FyZ3NbMF19ICR7dGV4TmFtZSh0aGlzLmZuY05hbWUpfSAke2FyZ3NbMV19YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZihpc1JlbGF0aW9uVG9rZW4odGhpcy5mbmNOYW1lKSB8fCBpc0FyaXRobWV0aWNUb2tlbih0aGlzLmZuY05hbWUpICl7XG4gICAgICAgICAgICAgICAgdGV4dCA9IGAke2FyZ3NbMF19ICR7dGV4TmFtZSh0aGlzLmZuY05hbWUpfSAke2FyZ3NbMV19YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBhcmdzX3MgPSBhcmdzLmpvaW4oXCIsIFwiKTtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYCR7dGV4TmFtZSh0aGlzLmZuY05hbWUpfSgke2FyZ3Nfc30pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICBzd2l0Y2godGhpcy5mbmNOYW1lKXtcbiAgICAgICAgICAgIGNhc2UgXCIrXCI6XG4gICAgICAgICAgICAgICAgc3dpdGNoKGFyZ3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBcIiArW10gXCI7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gYCArWyR7YXJnc1swXX1dIGA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRleHQgPSBhcmdzLmpvaW4oYCBgKTtcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBjYXNlIFwiL1wiOlxuICAgICAgICAgICAgICAgIGlmKHRoaXMuYXJncy5sZW5ndGggIT0gMil7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRleHQgPSBgXFxcXGZyYWN7JHthcmdzWzBdfX17JHthcmdzWzFdfX1gO1xuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGNhc2UgXCJeXCI6XG4gICAgICAgICAgICAgICAgaWYodGhpcy5hcmdzWzBdIGluc3RhbmNlb2YgQXBwICYmIFtcInNpblwiLFwiY29zXCIsXCJ0YW5cIl0uaW5jbHVkZXModGhpcy5hcmdzWzBdLmZuY05hbWUpKXtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcHAgPSB0aGlzLmFyZ3NbMF07XG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSBgJHt0ZXhOYW1lKGFwcC5mbmNOYW1lKX1eeyR7YXJnc1sxXX19ICR7YXBwLmFyZ3NbMF0udGV4KCl9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gYCR7YXJnc1swXX1eeyR7YXJnc1sxXX19YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBpZihhcmdzLmxlbmd0aCA9PSAxKXtcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IGAke3RleE5hbWUodGhpcy5mbmNOYW1lKX0gJHthcmdzWzBdfWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSBhcmdzLmpvaW4oYCAke3RleE5hbWUodGhpcy5mbmNOYW1lKX0gYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLnBhcmVudCAhPSBudWxsKXtcblxuICAgICAgICAgICAgaWYodGhpcy5yZW1QYXJlbnRoZXNlcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBcXFxcdGV4dGJmeyB7XFxcXGNvbG9ye3JlZH0gKH0gfSAke3RleHR9IFxcXFx0ZXh0YmZ7IHtcXFxcY29sb3J7cmVkfSApfSB9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoKHRoaXMuaXNBZGQoKSB8fCB0aGlzLmlzTXVsKCkpICYmIHRoaXMucGFyZW50LmZuY05hbWUgPT0gXCJsaW1cIil7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYCgke3RleHR9KWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuaXNPcGVyYXRvcigpICYmIHRoaXMucGFyZW50LmlzT3BlcmF0b3IoKSAmJiAhdGhpcy5wYXJlbnQuaXNEaXYoKSl7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5wYXJlbnQuZm5jTmFtZSA9PSBcIl5cIiAmJiB0aGlzLnBhcmVudC5hcmdzWzFdID09IHRoaXMpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLnBhcmVudC5wcmVjZWRlbmNlKCkgPD0gdGhpcy5wcmVjZWRlbmNlKCkpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCgke3RleHR9KWA7XG4gICAgICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICBwcmVjZWRlbmNlKCkgOiBudW1iZXIge1xuICAgICAgICBzd2l0Y2godGhpcy5mbmNOYW1lKXtcbiAgICAgICAgY2FzZSBcIl5cIjogXG4gICAgICAgICAgICByZXR1cm4gMDtcblxuICAgICAgICBjYXNlIFwiL1wiOiBcbiAgICAgICAgICAgIHJldHVybiAxO1xuXG4gICAgICAgIGNhc2UgXCIqXCI6IFxuICAgICAgICAgICAgcmV0dXJuIDI7XG5cbiAgICAgICAgY2FzZSBcIitcIjogXG4gICAgICAgIGNhc2UgXCItXCI6IFxuICAgICAgICAgICAgcmV0dXJuIDM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgc2V0QXJnKHRybSA6IFRlcm0sIGlkeCA6IG51bWJlcil7XG4gICAgICAgIHRoaXMuYXJnc1tpZHhdID0gdHJtO1xuICAgICAgICB0cm0ucGFyZW50ID0gdGhpcztcbiAgICB9XG4gICAgXG4gICAgYWRkQXJnKHRybSA6IFRlcm0pe1xuICAgICAgICB0aGlzLmFyZ3MucHVzaCh0cm0pO1xuICAgICAgICB0cm0ucGFyZW50ID0gdGhpcztcbiAgICB9XG5cbiAgICBhZGRBcmdzKHRybXMgOiBUZXJtW10pe1xuICAgICAgICB0aGlzLmFyZ3MucHVzaCguLi4gdHJtcyk7XG4gICAgICAgIHRybXMuZm9yRWFjaCh4ID0+IHgucGFyZW50ID0gdGhpcyk7XG4gICAgfVxuXG4gICAgaW5zQXJnKHRybSA6IFRlcm0sIGlkeCA6IG51bWJlcil7XG4gICAgICAgIHRoaXMuYXJncy5zcGxpY2UoaWR4LCAwLCB0cm0pO1xuICAgICAgICB0cm0ucGFyZW50ID0gdGhpcztcbiAgICB9XG5cbiAgICBpbnNBcmdzKGFyZ3MgOiBUZXJtW10sIGlkeCA6IG51bWJlcil7XG4gICAgICAgIGFzc2VydChpZHggIT0gLTEsIFwiaW5zIHBhcmVudCBtdWwgMVwiKTtcblxuICAgICAgICBjb25zdCBhcmdzX2NwID0gYXJncy5zbGljZSgpO1xuICAgICAgICB3aGlsZShhcmdzX2NwLmxlbmd0aCAhPSAwKXtcbiAgICAgICAgICAgIGNvbnN0IHRybSA9IGFyZ3NfY3AucG9wKCkhO1xuICAgICAgICAgICAgdGhpcy5pbnNBcmcodHJtLCBpZHgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQGRlc2NyaXB0aW9uIOW8leaVsOOBjDHlgIvjgaDjgZHjga7liqDnrpfjgoTkuZfnrpfjgpLjgIHllK/kuIDjga7lvJXmlbDjgafnva7jgY3mj5vjgYjjgovjgIJcbiAgICAgKi9cbiAgICBvbmVBcmcoKSB7XG4gICAgICAgIGFzc2VydCh0aGlzLmFyZ3MubGVuZ3RoID09IDEsIFwib25lIGFyZ1wiKTtcblxuICAgICAgICAvLyDllK/kuIDjga7lvJXmlbBcbiAgICAgICAgY29uc3QgYXJnMSA9IHRoaXMuYXJnc1swXTtcblxuICAgICAgICAvLyDliqDnrpfjgoTkuZfnrpfjgpLllK/kuIDjga7lvJXmlbDjgafnva7jgY3mj5vjgYjjgovjgIJcbiAgICAgICAgdGhpcy5yZXBsYWNlVGVybShhcmcxKTtcblxuICAgICAgICAvLyDllK/kuIDjga7lvJXmlbDjga7kv4LmlbDjgavjgIHliqDnrpfjgoTkuZfnrpfjga7kv4LmlbDjgpLjgYvjgZHjgovjgIJcbiAgICAgICAgYXJnMS52YWx1ZS5zZXRtdWwodGhpcy52YWx1ZSk7XG4gICAgfVxuXG4gICAgYWxsVGVybXMoKSA6IFRlcm1bXSB7XG4gICAgICAgIGNvbnN0IHRlcm1zIDogVGVybVtdID0gW107XG4gICAgICAgIHRoaXMuZ2V0QWxsVGVybXModGVybXMpO1xuXG4gICAgICAgIHJldHVybiB0ZXJtcztcbiAgICB9XG5cbiAgICBjbGVhckhpZ2hsaWdodCgpe1xuICAgICAgICBjb25zdCBhbGxfdGVybXMgPSB0aGlzLmFsbFRlcm1zKCk7XG4gICAgICAgIGZvcihjb25zdCB0ZXJtIG9mIGFsbF90ZXJtcyl7XG4gICAgICAgICAgICB0ZXJtLmNhbmNlbGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0ZXJtLmNvbG9yTmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpbmRUZXJtQnlJZChpZCA6IG51bWJlcikgOiBUZXJtIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsVGVybXMoKS5maW5kKHggPT4geC5pZCA9PSBpZCk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VyIHtcbiAgICB0b2tlbnM6IFRva2VuW107XG4gICAgdG9rZW5zX2NwOiBUb2tlbltdO1xuICAgIHRva2VuITogVG9rZW47XG5cbiAgICBjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcpe1xuICAgICAgICB0aGlzLnRva2VucyA9IGxleGljYWxBbmFseXNpcyh0ZXh0KTtcbiAgICAgICAgaWYodGhpcy50b2tlbnMubGVuZ3RoID09IDApe1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50b2tlbnNfY3AgPSB0aGlzLnRva2Vucy5zbGljZSgpO1xuXG4gICAgICAgIHRoaXMubmV4dCgpO1xuICAgIH1cblxuICAgIG5leHQoKXtcbiAgICAgICAgaWYodGhpcy50b2tlbnMubGVuZ3RoID09IDApe1xuXG4gICAgICAgICAgICB0aGlzLnRva2VuID0gbmV3IFRva2VuKFRva2VuVHlwZS5lb3QsIFRva2VuU3ViVHlwZS51bmtub3duLCBcIlwiLCAwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICB0aGlzLnRva2VuID0gdGhpcy50b2tlbnMuc2hpZnQoKSE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93RXJyb3IodGV4dCA6IHN0cmluZyl7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLnRva2Vuc19jcC5sZW5ndGggLSB0aGlzLnRva2Vucy5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHdvcmRzID0gdGhpcy50b2tlbnNfY3AubWFwKHggPT4geC50ZXh0KTtcblxuICAgICAgICB3b3Jkcy5zcGxpY2UoaSwgMCwgYDw8JHt0ZXh0fT4+YCk7XG4gICAgICAgIG1zZyhgdG9rZW4gZXJyOiR7d29yZHMuam9pbihcIiBcIil9YCk7XG4gICAgfVxuXG4gICAgbmV4dFRva2VuKHRleHQgOiBzdHJpbmcpe1xuICAgICAgICBpZih0aGlzLnRva2VuLnRleHQgIT0gdGV4dCl7XG4gICAgICAgICAgICB0aGlzLnNob3dFcnJvcih0ZXh0KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgfVxuXG4gICAgY3VycmVudCgpe1xuICAgICAgICByZXR1cm4gdGhpcy50b2tlbi50ZXh0O1xuICAgIH1cblxuICAgIHBlZWsoKSA6IFRva2VuIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLnRva2Vucy5sZW5ndGggPT0gMCA/IG51bGwgOiB0aGlzLnRva2Vuc1swXTtcbiAgICB9XG5cbiAgICByZWFkQXJncyhzdGFydDogc3RyaW5nLCBlbmQgOiBzdHJpbmcsIGFwcCA6IEFwcCl7XG4gICAgICAgIHRoaXMubmV4dFRva2VuKHN0YXJ0KTtcblxuICAgICAgICB3aGlsZSh0cnVlKXtcbiAgICAgICAgICAgIGNvbnN0IHRybSA9IHRoaXMuUmVsYXRpb25hbEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIGFwcC5hcmdzLnB1c2godHJtKTtcblxuICAgICAgICAgICAgaWYodGhpcy50b2tlbi50ZXh0ID09IFwiLFwiKXtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHRUb2tlbihcIixcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uZXh0VG9rZW4oZW5kKTtcbiAgICB9XG5cbiAgICBQcmltYXJ5RXhwcmVzc2lvbigpIDogVGVybSB7XG4gICAgICAgIGxldCB0cm0gOiBUZXJtO1xuXG4gICAgICAgIGlmKHRoaXMudG9rZW4udHlwZVRrbiA9PSBUb2tlblR5cGUuaWRlbnRpZmllcil7XG4gICAgICAgICAgICBsZXQgcmVmVmFyID0gbmV3IFJlZlZhcih0aGlzLnRva2VuLnRleHQpO1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCA9PSAnKCcpe1xuXG4gICAgICAgICAgICAgICAgbGV0IGFwcCA9IG5ldyBBcHAocmVmVmFyLCBbXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkQXJncyhcIihcIiwgXCIpXCIsIGFwcCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLnRva2VuLnRleHQgPT0gXCIuXCIpe1xuICAgICAgICAgICAgICAgIGxldCBhcHAgPSBuZXcgQXBwKG9wZXJhdG9yKFwiLlwiKSwgW3JlZlZhcl0pO1xuXG4gICAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHRUb2tlbihcIi5cIik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQodGhpcy50b2tlbi50eXBlVGtuID09IFRva2VuVHlwZS5pZGVudGlmaWVyKTtcbiAgICAgICAgICAgICAgICAgICAgYXBwLmFkZEFyZyhuZXcgUmVmVmFyKHRoaXMudG9rZW4udGV4dCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IHdoaWxlKHRoaXMudG9rZW4udGV4dCA9PSBcIi5cIik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICAgIHJldHVybiByZWZWYXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLnRva2VuLnR5cGVUa24gPT0gVG9rZW5UeXBlLk51bWJlcil7XG4gICAgICAgICAgICBsZXQgbiA9IHBhcnNlRmxvYXQodGhpcy50b2tlbi50ZXh0KTtcbiAgICAgICAgICAgIGlmKGlzTmFOKG4pKXtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJtID0gbmV3IENvbnN0TnVtKG4pO1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLnRva2VuLnR5cGVUa24gPT0gVG9rZW5UeXBlLlN0cmluZyl7XG4gICAgICAgICAgICB0cm0gPSBuZXcgU3RyKHRoaXMudG9rZW4udGV4dCk7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMudG9rZW4udHlwZVRrbiA9PSBUb2tlblR5cGUucGF0aCl7XG4gICAgICAgICAgICBhc3NlcnQodGhpcy50b2tlbi50ZXh0WzBdID09IFwiI1wiLCBcInBhcnNlIHBhdGhcIik7XG4gICAgICAgICAgICBpZih0aGlzLnRva2VuLnRleHQgPT0gXCIjXCIpe1xuXG4gICAgICAgICAgICAgICAgdHJtID0gbmV3IFBhdGgoW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ZXMgPSB0aGlzLnRva2VuLnRleHQuc3Vic3RyaW5nKDEpLnNwbGl0KHBhdGhTZXApLm1hcCh4ID0+IHBhcnNlRmxvYXQoeCkpO1xuICAgICAgICAgICAgICAgIHRybSA9IG5ldyBQYXRoKGluZGV4ZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMudG9rZW4udGV4dCA9PSAnKCcpe1xuXG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIHRybSA9IHRoaXMuUmVsYXRpb25hbEV4cHJlc3Npb24oKTtcblxuICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50KCkgIT0gJyknKXtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuXG4gICAgICAgICAgICBpZih0aGlzLnRva2VuLnRleHQgPT0gJygnKXtcblxuICAgICAgICAgICAgICAgIGxldCBhcHAgPSBuZXcgQXBwKHRybSwgW10pO1xuICAgICAgICAgICAgICAgIHRoaXMucmVhZEFyZ3MoXCIoXCIsIFwiKVwiLCBhcHApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRybTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMudG9rZW4udGV4dCA9PSAneycpe1xuXG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLlJlbGF0aW9uYWxFeHByZXNzaW9uKCk7XG5cbiAgICAgICAgICAgIHRoaXMubmV4dFRva2VuKCd8Jyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGxvZ2ljID0gdGhpcy5Mb2dpY2FsRXhwcmVzc2lvbigpO1xuXG4gICAgICAgICAgICB0aGlzLm5leHRUb2tlbignfScpO1xuXG4gICAgICAgICAgICB0cm0gPSBuZXcgQXBwKG9wZXJhdG9yKFwie3x9XCIpLCBbZWxlbWVudCwgbG9naWNdKTtcbiAgICAgICAgICAgIHJldHVybiB0cm07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRybTtcbiAgICB9XG5cbiAgICBQb3dlckV4cHJlc3Npb24oKSA6IFRlcm0ge1xuICAgICAgICBjb25zdCB0cm0xID0gdGhpcy5QcmltYXJ5RXhwcmVzc2lvbigpO1xuICAgICAgICBpZih0aGlzLnRva2VuLnRleHQgPT0gXCJeXCIpe1xuXG4gICAgICAgICAgICB0aGlzLm5leHRUb2tlbihcIl5cIik7XG5cbiAgICAgICAgICAgIGNvbnN0IHRybTIgPSB0aGlzLlBvd2VyRXhwcmVzc2lvbigpO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IEFwcChvcGVyYXRvcihcIl5cIiksIFt0cm0xLCB0cm0yXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJtMTtcbiAgICB9XG5cbiAgICBVbmFyeUV4cHJlc3Npb24oKSA6IFRlcm0ge1xuICAgICAgICBpZiAodGhpcy50b2tlbi50ZXh0ID09IFwiLVwiKSB7XG4gICAgICAgICAgICAvLyDosqDlj7fjga7loLTlkIhcblxuICAgICAgICAgICAgdGhpcy5uZXh0VG9rZW4oXCItXCIpO1xuXG4gICAgICAgICAgICAvLyDln7rmnKzjga7lvI/jgpLoqq3jgb/jgb7jgZnjgIJcbiAgICAgICAgICAgIGNvbnN0IHQxID0gdGhpcy5Qb3dlckV4cHJlc3Npb24oKTtcblxuICAgICAgICAgICAgLy8g56ym5Y+344KS5Y+N6Lui44GX44G+44GZ44CCXG4gICAgICAgICAgICB0MS52YWx1ZS5udW1lcmF0b3IgKj0gLTE7XG5cbiAgICAgICAgICAgIHJldHVybiB0MTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgLy8g5Z+65pys44Gu5byP44KS6Kqt44G/44G+44GZ44CCXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5Qb3dlckV4cHJlc3Npb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFxuICAgIERpdkV4cHJlc3Npb24oKSA6IFRlcm0ge1xuICAgICAgICBsZXQgdHJtMSA9IHRoaXMuVW5hcnlFeHByZXNzaW9uKCk7XG4gICAgICAgIHdoaWxlKHRoaXMudG9rZW4udGV4dCA9PSBcIi9cIil7XG4gICAgICAgICAgICBsZXQgYXBwID0gbmV3IEFwcChvcGVyYXRvcih0aGlzLnRva2VuLnRleHQpLCBbdHJtMV0pO1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgICAgIHdoaWxlKHRydWUpe1xuICAgICAgICAgICAgICAgIGxldCB0cm0yID0gdGhpcy5VbmFyeUV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgICAgICBhcHAuYXJncy5wdXNoKHRybTIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCA9PSBhcHAuZm5jTmFtZSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICB0cm0xID0gYXBwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcmV0dXJuIHRybTE7XG4gICAgfVxuXG4gICAgXG4gICAgTXVsdGlwbGljYXRpdmVFeHByZXNzaW9uKCkgOiBUZXJtIHtcbiAgICAgICAgbGV0IHRybTEgPSB0aGlzLkRpdkV4cHJlc3Npb24oKTtcbiAgICAgICAgaWYodGhpcy5jdXJyZW50KCkgIT0gXCIqXCIpe1xuICAgICAgICAgICAgcmV0dXJuIHRybTE7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSh0aGlzLmN1cnJlbnQoKSA9PSBcIipcIil7XG4gICAgICAgICAgICBsZXQgYXBwID0gbmV3IEFwcChvcGVyYXRvcih0aGlzLnRva2VuLnRleHQpLCBbdHJtMV0pO1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgICAgIHdoaWxlKHRydWUpe1xuICAgICAgICAgICAgICAgIGxldCB0cm0yID0gdGhpcy5EaXZFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICAgICAgYXBwLmFyZ3MucHVzaCh0cm0yKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRva2VuLnRleHQgPT0gYXBwLmZuY05hbWUpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdHJtMSA9IGFwcDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodHJtMSBpbnN0YW5jZW9mIEFwcCAmJiB0cm0xLmFyZ3NbMF0gaW5zdGFuY2VvZiBDb25zdE51bSl7XG4gICAgICAgICAgICBpZih0cm0xLmFyZ3MubGVuZ3RoID09IDIpe1xuXG4gICAgICAgICAgICAgICAgY29uc3QgW251bSwgdHJtMl0gPSB0cm0xLmFyZ3M7XG4gICAgICAgICAgICAgICAgdHJtMi52YWx1ZS5zZXRtdWwobnVtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJtMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgY29uc3QgbnVtID0gdHJtMS5hcmdzWzBdO1xuICAgICAgICAgICAgICAgIHRybTEudmFsdWUuc2V0bXVsKG51bS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgbnVtLnJlbUFyZygpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cm0xO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXG4gICAgICAgIHJldHVybiB0cm0xO1xuICAgIH1cbiAgICBcbiAgICBBZGRpdGl2ZUV4cHJlc3Npb24oKSA6IFRlcm0ge1xuICAgICAgICBsZXQgbmFnYXRpdmUgOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCA9PSBcIi1cIil7XG4gICAgICAgICAgICBuYWdhdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRybTEgPSB0aGlzLk11bHRpcGxpY2F0aXZlRXhwcmVzc2lvbigpO1xuICAgICAgICBpZihuYWdhdGl2ZSl7XG4gICAgICAgICAgICB0cm0xLnZhbHVlLm51bWVyYXRvciAqPSAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCA9PSBcIitcIiB8fCB0aGlzLnRva2VuLnRleHQgPT0gXCItXCIpe1xuICAgICAgICAgICAgbGV0IGFwcCA9IG5ldyBBcHAob3BlcmF0b3IoXCIrXCIpLCBbdHJtMV0pO1xuXG4gICAgICAgICAgICB3aGlsZSh0aGlzLnRva2VuLnRleHQgPT0gXCIrXCIgfHwgdGhpcy50b2tlbi50ZXh0ID09IFwiLVwiKXtcbiAgICAgICAgICAgICAgICBjb25zdCBvcHIgPSB0aGlzLnRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0cm0yID0gdGhpcy5NdWx0aXBsaWNhdGl2ZUV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgICAgICBpZihvcHIgPT0gXCItXCIpe1xuICAgICAgICAgICAgICAgICAgICB0cm0yLnZhbHVlLm51bWVyYXRvciAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhcHAuYWRkQXJnKHRybTIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXBwO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRybTE7XG4gICAgfVxuXG4gICAgQXJpdGhtZXRpY0V4cHJlc3Npb24oKSA6IFRlcm0ge1xuICAgICAgICBjb25zdCB0cm0xID0gdGhpcy5BZGRpdGl2ZUV4cHJlc3Npb24oKTtcblxuICAgICAgICBpZighIGlzQXJpdGhtZXRpY1Rva2VuKHRoaXMuY3VycmVudCgpKSl7XG4gICAgICAgICAgICByZXR1cm4gdHJtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAob3BlcmF0b3IodGhpcy5jdXJyZW50KCkpLCBbdHJtMV0pO1xuICAgICAgICB3aGlsZSggaXNBcml0aG1ldGljVG9rZW4odGhpcy5jdXJyZW50KCkpICl7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgICAgICAgY29uc3QgdHJtMiA9IHRoaXMuQWRkaXRpdmVFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICBhcHAuYWRkQXJnKHRybTIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFwcDtcbiAgICB9XG5cbiAgICBWYXJpYWJsZURlY2xhcmF0aW9uKCkgOiBBcHAge1xuICAgICAgICBjb25zdCByZWZfdmFycyA6IFJlZlZhcltdID0gW107XG5cbiAgICAgICAgd2hpbGUodHJ1ZSl7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHRoaXMudG9rZW47XG4gICAgICAgICAgICBhc3NlcnQoaWQudHlwZVRrbiA9PSBUb2tlblR5cGUuaWRlbnRpZmllcik7XG5cbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuXG4gICAgICAgICAgICByZWZfdmFycy5wdXNoKG5ldyBSZWZWYXIoaWQudGV4dCkpO1xuXG4gICAgICAgICAgICBpZih0aGlzLnRva2VuLnRleHQgPT0gXCIsXCIpe1xuICAgICAgICAgICAgICAgIHRoaXMubmV4dFRva2VuKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpZF9saXN0ID0gbmV3IEFwcChvcGVyYXRvcihcIixcIiksIHJlZl92YXJzKTtcblxuICAgICAgICB0aGlzLm5leHRUb2tlbihcImluXCIpO1xuXG4gICAgICAgIGNvbnN0IHNldCA9IHRoaXMuQXJpdGhtZXRpY0V4cHJlc3Npb24oKTtcblxuICAgICAgICByZXR1cm4gbmV3IEFwcChvcGVyYXRvcihcImluXCIpLCBbaWRfbGlzdCwgc2V0XSk7XG4gICAgfVxuXG4gICAgUmVsYXRpb25hbEV4cHJlc3Npb24oaW5fYW5kIDogYm9vbGVhbiA9IGZhbHNlKSA6IFRlcm0ge1xuICAgICAgICBjb25zdCBuZXh0X3Rva2VuID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIGlmKGluX2FuZCAmJiB0aGlzLnRva2VuLnR5cGVUa24gPT0gVG9rZW5UeXBlLmlkZW50aWZpZXIgJiYgbmV4dF90b2tlbiAhPSBudWxsICYmIG5leHRfdG9rZW4udGV4dCA9PSBcIixcIil7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5WYXJpYWJsZURlY2xhcmF0aW9uKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdHJtMSA6IFRlcm07XG4gICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCA9PSBcIltcIil7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IG5ldyBSZWZWYXIoXCJbXVwiKTtcbiAgICAgICAgICAgIHRybTEgPSBuZXcgQXBwKHJlZiwgW10pO1xuICAgICAgICAgICAgdGhpcy5yZWFkQXJncyhcIltcIiwgXCJdXCIsIHRybTEgYXMgQXBwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICB0cm0xID0gdGhpcy5Bcml0aG1ldGljRXhwcmVzc2lvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUoaXNSZWxhdGlvblRva2VuKHRoaXMudG9rZW4udGV4dCkpe1xuICAgICAgICAgICAgbGV0IGFwcCA9IG5ldyBBcHAob3BlcmF0b3IodGhpcy50b2tlbi50ZXh0KSwgW3RybTFdKTtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuXG4gICAgICAgICAgICB3aGlsZSh0cnVlKXtcbiAgICAgICAgICAgICAgICBsZXQgdHJtMiA9IHRoaXMuQXJpdGhtZXRpY0V4cHJlc3Npb24oKTtcbiAgICAgICAgICAgICAgICBhcHAuYXJncy5wdXNoKHRybTIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKHRoaXMudG9rZW4udGV4dCA9PSBhcHAuZm5jTmFtZSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICB0cm0xID0gYXBwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJtMTtcbiAgICB9XG5cbiAgICBBbmRFeHByZXNzaW9uKCkgOiBUZXJtIHtcbiAgICAgICAgY29uc3QgdHJtMSA9IHRoaXMuUmVsYXRpb25hbEV4cHJlc3Npb24odHJ1ZSk7XG5cbiAgICAgICAgaWYoISBbXCI7XCIsIFwiJiZcIl0uaW5jbHVkZXModGhpcy50b2tlbi50ZXh0KSl7XG5cbiAgICAgICAgICAgIHJldHVybiB0cm0xO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXBwID0gbmV3IEFwcChvcGVyYXRvcihcIiYmXCIpLCBbdHJtMV0pO1xuXG4gICAgICAgIHdoaWxlKCBbXCI7XCIsIFwiJiZcIl0uaW5jbHVkZXModGhpcy50b2tlbi50ZXh0KSApe1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRybTIgPSB0aGlzLlJlbGF0aW9uYWxFeHByZXNzaW9uKHRydWUpO1xuICAgICAgICAgICAgYXBwLmFkZEFyZyh0cm0yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcHA7XG4gICAgfVxuXG4gICAgT3JFeHByZXNzaW9uKCkgOiBUZXJtIHtcbiAgICAgICAgY29uc3QgdHJtMSA9IHRoaXMuQW5kRXhwcmVzc2lvbigpO1xuXG4gICAgICAgIGlmKHRoaXMuY3VycmVudCgpICE9IFwifHxcIil7XG5cbiAgICAgICAgICAgIHJldHVybiB0cm0xO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXBwID0gbmV3IEFwcChvcGVyYXRvcihcInx8XCIpLCBbdHJtMV0pO1xuXG4gICAgICAgIHdoaWxlKCB0aGlzLmN1cnJlbnQoKSA9PSBcInx8XCIgKXtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuXG4gICAgICAgICAgICBjb25zdCB0cm0yID0gdGhpcy5BbmRFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICBhcHAuYWRkQXJnKHRybTIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFwcDtcbiAgICB9XG5cbiAgICBMb2dpY2FsRXhwcmVzc2lvbigpe1xuICAgICAgICBjb25zdCB0cm0xID0gdGhpcy5PckV4cHJlc3Npb24oKTtcblxuICAgICAgICBpZihbIFwiPT5cIiwgXCLih5RcIiBdLmluY2x1ZGVzKHRoaXMudG9rZW4udGV4dCkpe1xuICAgICAgICAgICAgY29uc3Qgb3ByID0gdGhpcy50b2tlbi50ZXh0O1xuXG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgICAgICAgbGV0IHRybTIgPSB0aGlzLk9yRXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBcHAob3BlcmF0b3Iob3ByKSwgW3RybTEsIHRybTJdKTsgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRybTE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBSb290RXhwcmVzc2lvbigpe1xuICAgICAgICBpZih0aGlzLnRva2VuLnRleHQgPT0gXCJsZXRcIil7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgICAgICAgY29uc3QgYXBwID0gdGhpcy5WYXJpYWJsZURlY2xhcmF0aW9uKCk7XG4gICAgICAgICAgICBpZih0aGlzLnRva2VuLnRleHQgYXMgYW55ICE9IFwiLFwiKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBhbmQgPSBuZXcgQXBwKG9wZXJhdG9yKFwiJiZcIiksIFthcHBdKTtcbiAgICAgICAgICAgIHdoaWxlKHRoaXMudG9rZW4udGV4dCBhcyBhbnkgPT0gXCIsXCIpe1xuICAgICAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgYXBwMiA9IHRoaXMuVmFyaWFibGVEZWNsYXJhdGlvbigpO1xuICAgICAgICAgICAgICAgIGFuZC5hZGRBcmcoYXBwMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhbmQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihpc1JlbGF0aW9uVG9rZW4odGhpcy50b2tlbi50ZXh0KSl7XG4gICAgICAgICAgICBsZXQgYXBwID0gbmV3IEFwcChvcGVyYXRvcih0aGlzLnRva2VuLnRleHQpLCBbXSk7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgICAgICAgbGV0IHRybSA9IHRoaXMuQXJpdGhtZXRpY0V4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIGFwcC5hcmdzLnB1c2godHJtKTtcblxuICAgICAgICAgICAgcmV0dXJuIGFwcDtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuTG9naWNhbEV4cHJlc3Npb24oKTtcbiAgICAgICAgfVxuICAgIFxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wZXJhdG9yKG9wciA6IHN0cmluZykgOiBSZWZWYXIge1xuICAgIHJldHVybiBuZXcgUmVmVmFyKG9wcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxUZXJtcyh0IDogVGVybSwgdGVybXM6IFRlcm1bXSl7XG4gICAgdGVybXMucHVzaCh0KTtcblxuICAgIGlmKHQgaW5zdGFuY2VvZiBBcHApe1xuICAgICAgICBhc3NlcnQodC5mbmMgIT0gbnVsbCwgXCJnZXQgYWxsIHRlcm1zXCIpO1xuICAgICAgICBnZXRBbGxUZXJtcyh0LmZuYywgdGVybXMpO1xuXG4gICAgICAgIHQuYXJncy5mb3JFYWNoKHggPT4gZ2V0QWxsVGVybXMoeCwgdGVybXMpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlSWRUb1Rlcm1NYXAocm9vdCA6IFRlcm0pIDogTWFwPG51bWJlciwgVGVybT57XG4gICAgY29uc3QgdGVybXMgPSBhbGxUZXJtcyhyb290KTtcblxuICAgIHJldHVybiBuZXcgTWFwPG51bWJlcixUZXJtPih0ZXJtcy5tYXAoeCA9PiBbeC5pZCwgeF0pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN1YlRlcm1zKHJvb3QgOiBUZXJtLCB0YXJnZXQgOiBUZXJtKSA6IFRlcm1bXXtcbiAgICBjb25zdCB0ZXJtcyA6IFRlcm1bXSA9IFtdO1xuICAgIGdldEFsbFRlcm1zKHJvb3QsIHRlcm1zKTtcblxuICAgIGNvbnN0IHRhcmdldF9zdHIgPSB0YXJnZXQuc3RyMigpO1xuICAgIHJldHVybiB0ZXJtcy5maWx0ZXIoeCA9PiB4LnN0cjIoKSA9PSB0YXJnZXRfc3RyICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxUZXJtcyh0cm0gOiBUZXJtKSA6IFRlcm1bXSB7XG4gICAgY29uc3QgdGVybXMgOiBUZXJtW10gPSBbXTtcbiAgICBnZXRBbGxUZXJtcyh0cm0sIHRlcm1zKTtcblxuICAgIHJldHVybiB0ZXJtcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJvZHlPbkxvYWQoKXtcbiAgICBjb25zdCB0ZXh0cyA9ICgkKFwic2FtcGxlXCIpIGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQpLnZhbHVlLnJlcGxhY2UoXCJcXHJcXG5cIiwgXCJcXG5cIikuc3BsaXQoXCJcXG5cIikubWFwKHggPT4geC50cmltKCkpLmZpbHRlcih4ID0+IHggIT0gXCJcIik7XG4gICAgZm9yKGNvbnN0IHRleHQgb2YgdGV4dHMpe1xuICAgICAgICBtc2codGV4dCk7XG4gICAgICAgIHBhcnNlTWF0aCh0ZXh0KTtcbiAgICB9XG59XG5cbn0iLCJ2YXIga2F0ZXggOiBhbnk7XHJcblxyXG5uYW1lc3BhY2UgcGFyc2VyX3RzIHtcclxuLy9cclxuZXhwb3J0IGNvbnN0IHNsZWVwID0gaTE4bl90cy5zbGVlcDtcclxuY29uc3QgJGRpYyA9IG5ldyBNYXA8c3RyaW5nLCBIVE1MRWxlbWVudD4oKTtcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJChpZCA6IHN0cmluZykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgZWxlID0gJGRpYy5nZXQoaWQpO1xyXG4gICAgaWYoZWxlID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgZWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpITtcclxuICAgICAgICAkZGljLnNldChpZCwgZWxlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZWxlO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTXlFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICAgIGNvbnN0cnVjdG9yKHRleHQgOiBzdHJpbmcgPSBcIlwiKXtcclxuICAgICAgICBzdXBlcih0ZXh0KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFN5bnRheEVycm9yIGV4dGVuZHMgTXlFcnJvcntcclxuICAgIGNvbnN0cnVjdG9yKHRleHQgOiBzdHJpbmcgPSBcIlwiKXtcclxuICAgICAgICBzdXBlcih0ZXh0KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChiIDogYm9vbGVhbiwgbXNnIDogc3RyaW5nID0gXCJcIil7XHJcbiAgICBpZighYil7XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IobXNnKTtcclxuICAgIH1cclxufSAgICBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtc2codHh0IDogc3RyaW5nKXtcclxuICAgIGNvbnNvbGUubG9nKHR4dCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByYW5nZShuOiBudW1iZXIpIDogbnVtYmVyW117XHJcbiAgICByZXR1cm4gWy4uLkFycmF5KG4pLmtleXMoKV07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyTWFjcm9zKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIFwiXFxcXGRpZlwiIDogXCJcXFxcZnJhY3tkICMxfXtkICMyfVwiLFxyXG4gICAgICAgIFwiXFxcXHBkaWZmXCIgOiBcIlxcXFxmcmFje1xcXFxwYXJ0aWFsICMxfXtcXFxccGFydGlhbCAjMn1cIixcclxuICAgICAgICBcIlxcXFxwZGRpZlwiIDogXCJcXFxcZnJhY3tcXFxccGFydGlhbF4yICMxfXtcXFxccGFydGlhbCB7IzJ9XjJ9XCIsXHJcbiAgICAgICAgXCJcXFxcYlwiIDogXCJcXFxcYm9sZHN5bWJvbHsjMX1cIlxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckthdGV4U3ViKGVsZTogSFRNTEVsZW1lbnQsIHRleF90ZXh0OiBzdHJpbmcpe1xyXG4gICAgZWxlLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICBrYXRleC5yZW5kZXIodGV4X3RleHQsIGVsZSwge1xyXG4gICAgICAgIHRocm93T25FcnJvcjogZmFsc2UsXHJcbiAgICAgICAgZGlzcGxheU1vZGUgOiB0cnVlLFxyXG4gICAgICAgIHRydXN0IDogdHJ1ZSxcclxuICAgICAgICBzdHJpY3QgOiBmYWxzZSwgLy8gXCJpZ25vcmVcIiwgLy8gZmFsc2UsIC8vIGhhbmRsZXIsXHJcbiAgICAgICAgLy8gbmV3TGluZUluRGlzcGxheU1vZGUgOiBcImlnbm9yZVwiLFxyXG4gICAgICAgIG1hY3JvcyA6IGdldFVzZXJNYWNyb3MoKVxyXG4gICAgfSk7XHJcbn1cclxuXHJcblxyXG59IiwibmFtZXNwYWNlIHBhcnNlcl90cyB7XHJcbi8vXHJcbnR5cGUgQWJzdHJhY3RTcGVlY2ggPSBpMThuX3RzLkFic3RyYWN0U3BlZWNoO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBIaWdobGlnaHRhYmxlIHtcclxuICAgIGhpZ2hsaWdodChoaWdobGlnaHRlZCA6IGJvb2xlYW4pIDogdm9pZDtcclxufVxyXG5cclxuZnVuY3Rpb24gc3ltYm9sMndvcmRzKHN5bWJvbDogc3RyaW5nKSA6IHN0cmluZyB7XHJcbiAgICBjb25zdCB0Ymw6IHsgW3N5bWJvbDogc3RyaW5nXTogc3RyaW5nIH0gPSB7XHJcbiAgICAgICAgXCJzaW5cIiA6IFwic2luZVwiLFxyXG4gICAgICAgIFwiY29zXCIgOiBcImNvc2luZVwiLFxyXG4gICAgICAgIFwidGFuXCIgOiBcInRhbmdlbnRcIixcclxuICAgICAgICBcInNlY1wiIDogXCJzZWNhbnRcIixcclxuICAgICAgICBcImNvc2VjXCIgOiBcImNvc2VjYW50XCIsXHJcbiAgICAgICAgXCJjb3RcIiA6IFwiY290YW5nZW50XCIsXHJcbiAgICAgICAgXCI9XCIgOiBcImVxdWFsc1wiLFxyXG4gICAgICAgIFwiPT1cIiA6IFwiZXF1YWxzXCIsXHJcbiAgICAgICAgXCIhPVwiIDogXCJub3QgZXF1YWwgdG9cIixcclxuICAgICAgICBcIjxcIiA6IFwiaXMgbGVzcyB0aGFuXCIsXHJcbiAgICAgICAgXCI+XCIgOiBcImlzIGdyZWF0ZXIgdGhhblwiLFxyXG4gICAgICAgIFwiPD1cIiA6IFwiaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvXCIsXHJcbiAgICAgICAgXCI+PVwiIDogXCJpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cIixcclxuICAgICAgICBcIitcIiA6IFwicGx1c1wiLFxyXG4gICAgICAgIFwiLVwiIDogXCJtaW51c1wiLFxyXG4gICAgICAgIFwiKlwiIDogXCJ0aW1lc1wiXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHRleHQgPSB0Ymxbc3ltYm9sXTtcclxuICAgIGlmKHRleHQgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgcmV0dXJuIHN5bWJvbDtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgdGV4MndvcmRzIDoge1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge1xyXG4gICAgXCJkaWZcIiAgIDogXCJkaWZmXCIsXHJcbiAgICBcIkRlbHRhXCIgOiBcImRlbHRhXCIsXHJcbiAgICBcImxpbVwiICAgOiAgXCJsaW1pdFwiLFxyXG4gICAgXCJzcXJ0XCIgIDogXCJzcXVhcmUgcm9vdFwiLFxyXG4gICAgXCJuZVwiICAgIDogXCJub3QgZXF1YWxzXCIsXHJcbiAgICBcImx0XCIgICAgOiBcImlzIGxlc3MgdGhhblwiLFxyXG4gICAgXCJndFwiICAgIDogXCJpcyBncmVhdGVyIHRoYW5cIixcclxuICAgIFwibGVcIiAgICA6IFwiaXMgbGVzcyB0aGFuIG9yIGVxdWFsc1wiLFxyXG4gICAgXCJnZVwiICAgIDogXCJpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWxzXCIsXHJcbiAgICBcImhiYXJcIiAgOiBcImggYmFyXCIsXHJcbn07XHJcblxyXG5jb25zdCBvcHJzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcblxyXG5mdW5jdGlvbiBpc0xldHRlcihzdHIgOiBzdHJpbmcpIDogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gL15cXHB7TGV0dGVyfSskL3UudGVzdChzdHIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0RpZ2l0KHN0ciA6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIC9eXFxkKyQvLnRlc3Qoc3RyKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJvbnVuY2lhdGlvbkYodGV4X25vZGUgOiBUZXhOb2RlLCB3b3JkIDogc3RyaW5nKSA6IFBocmFzZSB8IHVuZGVmaW5lZCB7XHJcbiAgICBpZih3b3JkLmVuZHNXaXRoKFwie1wiKSl7XHJcbiAgICAgICAgd29yZCA9IHdvcmQuc3Vic3RyaW5nKDAsIHdvcmQubGVuZ3RoIC0gMSk7XHJcbiAgICB9XHJcbiAgICBpZih3b3JkLmVuZHNXaXRoKFwiX1wiKSl7XHJcbiAgICAgICAgd29yZCA9IHdvcmQuc3Vic3RyaW5nKDAsIHdvcmQubGVuZ3RoIC0gMSk7XHJcbiAgICB9XHJcbiAgICBpZih3b3JkLnN0YXJ0c1dpdGgoXCJcXFxcXCIpKXtcclxuICAgICAgICB3b3JkID0gd29yZC5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IHRleDJ3b3Jkc1t3b3JkXTtcclxuICAgICAgICBpZih0ZXh0ICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUGhyYXNlKHRleF9ub2RlLCB0ZXh0LnNwbGl0KFwiIFwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBjb25zdCB0ZXh0ID0gc3ltYm9sMndvcmRzKHdvcmQpO1xyXG4gICAgICAgIGlmKHRleHQgIT0gd29yZCl7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFBocmFzZSh0ZXhfbm9kZSwgdGV4dC5zcGxpdChcIiBcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZihpc0xldHRlcih3b3JkKSl7XHJcbiAgICAgICAgaWYoaXNHcmVlayh3b3JkKSl7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoYXIwID0gd29yZC5jaGFyQXQoMClcclxuICAgICAgICAgICAgaWYoY2hhcjAudG9VcHBlckNhc2UoKSA9PSBjaGFyMCl7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUGhyYXNlKHRleF9ub2RlLCBbIFwibGFyZ2VcIiwgd29yZC50b0xvd2VyQ2FzZSgpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQaHJhc2UodGV4X25vZGUsIFt3b3JkXSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoaXNEaWdpdCh3b3JkKSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQaHJhc2UodGV4X25vZGUsIFt3b3JkXSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoISBvcHJzLmhhcyh3b3JkKSl7XHJcbiAgICAgICAgb3Bycy5hZGQod29yZCk7XHJcbiAgICAgICAgLy8gbXNnKGBvcGVyYXRvcnMgOiBbJHt3b3JkfV1gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFBocmFzZSB7XHJcbiAgICB0ZXhOb2RlIDogVGV4Tm9kZTtcclxuICAgIHdvcmRzICAgOiBzdHJpbmdbXTtcclxuICAgIHN0YXJ0ISAgOiBudW1iZXI7XHJcbiAgICBlbmQhICAgIDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRleF9ub2RlIDogVGV4Tm9kZSwgd29yZHMgOiBzdHJpbmdbXSl7XHJcbiAgICAgICAgdGhpcy50ZXhOb2RlID0gdGV4X25vZGU7XHJcbiAgICAgICAgdGhpcy53b3JkcyAgID0gd29yZHM7XHJcbiAgICAgICAgZm9yKGNvbnN0IHdvcmQgb2Ygd29yZHMpe1xyXG4gICAgICAgICAgICBpZighIG9wcnMuaGFzKHdvcmQpKXtcclxuICAgICAgICAgICAgICAgIG9wcnMuYWRkKHdvcmQpO1xyXG4gICAgICAgICAgICAgICAgLy8gbXNnKGB3b3JkIDogJHt3b3JkfWApO1xyXG4gICAgICAgICAgICB9ICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYWtlVGV4dEZyb21QaHJhc2VzKHBocmFzZXMgOiBQaHJhc2VbXSkgOiBzdHJpbmcge1xyXG4gICAgbGV0IHRleHQgPSBcIlwiO1xyXG4gICAgZm9yKGNvbnN0IHBocmFzZSBvZiBwaHJhc2VzKXtcclxuICAgICAgICBwaHJhc2Uuc3RhcnQgPSB0ZXh0Lmxlbmd0aDtcclxuICAgICAgICBmb3IoY29uc3Qgd29yZCBvZiBwaHJhc2Uud29yZHMpe1xyXG4gICAgICAgICAgICBpZih3b3JkICE9IFwiXCIpe1xyXG4gICAgICAgICAgICAgICAgaWYodGV4dCAhPSBcIlwiKXtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGV4dCArPSB3b3JkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBocmFzZS5lbmQgPSB0ZXh0Lmxlbmd0aDtcclxuICAgIH1cclxuICAgIC8vIG1zZyhgcGhyYXNlcyBbJHt0ZXh0fV1gKVxyXG5cclxuICAgIHJldHVybiB0ZXh0O1xyXG59XHJcblxyXG5hYnN0cmFjdCBjbGFzcyBUZXhOb2RlIHtcclxuICAgIGRpY3Rpb24gOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICB0ZXJtVGV4IDogQXBwIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGFic3RyYWN0IG1ha2VTcGVlY2gocGhyYXNlcyA6IFBocmFzZVtdKSA6IHZvaWQ7XHJcblxyXG4gICAgdGVybSgpIDogVGVybSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGVybVRleDtcclxuICAgIH1cclxuXHJcbiAgICBpbml0U3RyaW5nKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jICpnZW5UZXgoc3BlZWNoIDogQWJzdHJhY3RTcGVlY2ggfCBudWxsLCBoaWdobGlnaHRhYmxlcz8gOiBNYXA8c3RyaW5nLCBIaWdobGlnaHRhYmxlPikgOiBBc3luY0dlbmVyYXRvcjxzdHJpbmcsIHZvaWQsIHVua25vd24+IHtcclxuICAgICAgICB5aWVsZCBcIlwiO1xyXG4gICAgfVxyXG5cclxuICAgIHNheSh0ZXh0IDogc3RyaW5nKSA6IFRleE5vZGUge1xyXG4gICAgICAgIHRoaXMuZGljdGlvbiA9IHRleHQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZG1wTm9kZShuZXN0IDogc3RyaW5nKXtcclxuICAgICAgICBjb25zdCB0ZXJtID0gdGhpcy50ZXJtKCk7XHJcbiAgICAgICAgY29uc3QgaWQgPSAodGVybSA9PSB1bmRlZmluZWQgPyBcIlwiIDogYCR7dGVybS5pZH1gKTtcclxuICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgVGV4TGVhZil7XHJcblxyXG4gICAgICAgICAgICBtc2coYCR7bmVzdH0ke2lkfToke3RoaXMudGV4VGV4dCgpfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHRoaXMgaW5zdGFuY2VvZiBUZXhCbG9jayl7XHJcblxyXG4gICAgICAgICAgICBtc2coYCR7bmVzdH0ke2lkfWApO1xyXG4gICAgICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2goeCA9PiB4LmRtcE5vZGUobmVzdCArIFwiXFx0XCIpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFic3RyYWN0IGNsYXNzIFRleEJsb2NrIGV4dGVuZHMgVGV4Tm9kZSB7XHJcbiAgICBub2RlcyA6IFRleE5vZGVbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihub2RlcyA6IFRleE5vZGVbXSl7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5vZGVzID0gbm9kZXM7XHJcbiAgICB9XHJcblxyXG4gICAgbWFrZVNwZWVjaChwaHJhc2VzIDogUGhyYXNlW10pIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKHggPT4geC5tYWtlU3BlZWNoKHBocmFzZXMpKTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbmNsYXNzIFRleFNlcSBleHRlbmRzIFRleEJsb2NrIHtcclxuICAgIGNvbnN0cnVjdG9yKG5vZGVzIDogVGV4Tm9kZVtdKXtcclxuICAgICAgICBzdXBlcihub2Rlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgKmdlblRleChzcGVlY2ggOiBBYnN0cmFjdFNwZWVjaCB8IG51bGwsIGhpZ2hsaWdodGFibGVzPyA6IE1hcDxzdHJpbmcsIEhpZ2hsaWdodGFibGU+KSA6IEFzeW5jR2VuZXJhdG9yPHN0cmluZywgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgICAgIGNvbnN0IGFyZ19zdHJzID0gdGhpcy5ub2Rlcy5tYXAoeCA9PiB4LmluaXRTdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIGZvcihsZXQgW2lkeCwgbm9kZV0gb2YgdGhpcy5ub2Rlcy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBmb3IgYXdhaXQoY29uc3QgcyBvZiBub2RlLmdlblRleChzcGVlY2gsIGhpZ2hsaWdodGFibGVzKSl7XHJcbiAgICAgICAgICAgICAgICBhcmdfc3Ryc1tpZHhdID0gcztcclxuXHJcbiAgICAgICAgICAgICAgICB5aWVsZCBgJHthcmdfc3Rycy5qb2luKFwiIFwiKX1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5aWVsZCBgJHthcmdfc3Rycy5qb2luKFwiIFwiKX1gO1xyXG4gICAgfVxyXG59XHJcblxyXG5hYnN0cmFjdCBjbGFzcyBUZXhMZWFmIGV4dGVuZHMgVGV4Tm9kZSB7XHJcbiAgICBjaGFyUG9zISA6IG51bWJlcjtcclxuICAgIHBocmFzZSA6IFBocmFzZSB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYWJzdHJhY3QgdGV4VGV4dCgpIDogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBzcGVlY2hUZXh0KCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRleFRleHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBtYWtlU3BlZWNoKHBocmFzZXMgOiBQaHJhc2VbXSkgOiB2b2lkIHtcclxuICAgICAgICBsZXQgdGV4dCA6IHN0cmluZztcclxuICAgICAgICBpZih0aGlzLmRpY3Rpb24gIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGV4dCA9IHRoaXMuZGljdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGV4dCA9IHRoaXMuc3BlZWNoVGV4dCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBocmFzZSA9IHByb251bmNpYXRpb25GKHRoaXMsIHRleHQpO1xyXG4gICAgICAgIGlmKHRoaXMucGhyYXNlICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHBocmFzZXMucHVzaCh0aGlzLnBocmFzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jICpnZW5UZXgoc3BlZWNoIDogQWJzdHJhY3RTcGVlY2ggfCBudWxsLCBoaWdobGlnaHRhYmxlcz8gOiBNYXA8c3RyaW5nLCBIaWdobGlnaHRhYmxlPikgOiBBc3luY0dlbmVyYXRvcjxzdHJpbmcsIHZvaWQsIHVua25vd24+IHtcclxuICAgICAgICBjb25zdCB0ZXhfdGV4dCA9IHRoaXMudGV4VGV4dCgpXHJcblxyXG4gICAgICAgIGlmKHNwZWVjaCAhPSBudWxsICYmIHRoaXMucGhyYXNlICE9IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHdoaWxlKHNwZWVjaC5zcGVha2luZyAmJiBzcGVlY2gucHJldkNoYXJJbmRleCA8IHRoaXMucGhyYXNlLnN0YXJ0KXtcclxuICAgICAgICAgICAgICAgIG1zZyhgYXdhaXQgdGV4LWxlYWYuZ2VuLXRleDogcHJldi1DaGFyLUluZGV4OiR7c3BlZWNoLnByZXZDaGFySW5kZXh9IHBocmFzZS1zdGFydDoke3RoaXMucGhyYXNlLnN0YXJ0fWApXHJcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcCgxMDApO1xyXG4gICAgICAgICAgICAgICAgeWllbGQgdGV4X3RleHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHlpZWxkIHRleF90ZXh0O1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBUZXhOdW0gZXh0ZW5kcyBUZXhMZWFmIHtcclxuICAgIG51bSA6IENvbnN0TnVtO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG51bSA6IENvbnN0TnVtKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubnVtID0gbnVtO1xyXG4gICAgfVxyXG5cclxuICAgIHRlcm0oKSA6IFRlcm0gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm51bTtcclxuICAgIH1cclxuXHJcbiAgICB0ZXhUZXh0KCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm51bS52YWx1ZS5zdHIoKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVGV4UmVmIGV4dGVuZHMgVGV4TGVhZiB7XHJcbiAgICByZWYgOiBSZWZWYXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IocmVmIDogUmVmVmFyKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucmVmID0gcmVmO1xyXG4gICAgfVxyXG5cclxuICAgIHRlcm0oKSA6IFRlcm0gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlZjtcclxuICAgIH1cclxuXHJcbiAgICB0ZXhUZXh0KCkgOiBzdHJpbmcge1xyXG4gICAgICAgIGlmKGlzR3JlZWsodGhpcy5yZWYubmFtZSkpe1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGBcXFxcJHt0aGlzLnJlZi5uYW1lfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWYubmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMucmVmLnRleCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jICpnZW5UZXgoc3BlZWNoIDogQWJzdHJhY3RTcGVlY2ggfCBudWxsLCBoaWdobGlnaHRhYmxlcz8gOiBNYXA8c3RyaW5nLCBIaWdobGlnaHRhYmxlPikgOiBBc3luY0dlbmVyYXRvcjxzdHJpbmcsIHZvaWQsIHVua25vd24+IHtcclxuICAgICAgICBpZihoaWdobGlnaHRhYmxlcyAhPSB1bmRlZmluZWQpe1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0YWJsZSA9IGhpZ2hsaWdodGFibGVzLmdldCh0aGlzLnJlZi5uYW1lKTtcclxuICAgICAgICAgICAgaWYoaGlnaGxpZ2h0YWJsZSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0YWJsZS5oaWdobGlnaHQodHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHRleF90ZXh0ID0gdGhpcy50ZXhUZXh0KClcclxuXHJcbiAgICAgICAgaWYoc3BlZWNoICE9IG51bGwgJiYgdGhpcy5waHJhc2UgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgd2hpbGUoc3BlZWNoLnNwZWFraW5nICYmIHNwZWVjaC5wcmV2Q2hhckluZGV4IDwgdGhpcy5waHJhc2Uuc3RhcnQpe1xyXG4gICAgICAgICAgICAgICAgbXNnKGBhd2FpdCB0ZXgtcmVmLmdlbi10ZXg6IHByZXYtQ2hhci1JbmRleDoke3NwZWVjaC5wcmV2Q2hhckluZGV4fSBwaHJhc2Utc3RhcnQ6JHt0aGlzLnBocmFzZS5zdGFydH1gKVxyXG4gICAgICAgICAgICAgICAgYXdhaXQgc2xlZXAoMTAwKTtcclxuICAgICAgICAgICAgICAgIHlpZWxkIHRleF90ZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5aWVsZCB0ZXhfdGV4dDtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVGV4U3RyIGV4dGVuZHMgVGV4TGVhZiB7XHJcbiAgICBzdHIgOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc3RyIDogc3RyaW5nKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuc3RyID0gc3RyO1xyXG4gICAgfVxyXG5cclxuICAgIHNwZWVjaFRleHQoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgaWYodGhpcy5zdHIgPT0gXCJcXFxcbGltX3tcIil7XHJcbiAgICAgICAgICAgIG1zZyhcInNwZWVjaC1UZXh0OmxpbVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbGlzdCA9IFtcclxuICAgICAgICAgICAgXCJ7XCIsIFwifVwiLCBcIihcIiwgXCIpXCIsIFwifXtcIiwgXCJ9XntcIiwgXCJcXFxcZnJhY3tcIlxyXG4gICAgICAgIF07XHJcbiAgICAgICAgaWYobGlzdC5pbmNsdWRlcyh0aGlzLnN0cikpe1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN5bWJvbDJ3b3Jkcyh0aGlzLnN0cik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRleFRleHQoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRleE5hbWUodGhpcy5zdHIpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRTdHJpbmcoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgbGlzdCA9IFtcclxuICAgICAgICAgICAgXCJ7XCIsIFwifVwiLCBcIihcIiwgXCIpXCIsIFwifXtcIiwgXCJ9XntcIixcIl57XCJcclxuICAgICAgICBdO1xyXG4gICAgICAgIGlmKGxpc3QuaW5jbHVkZXModGhpcy5zdHIpKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLnN0ci5zdGFydHNXaXRoKFwiXFxcXFwiKSAmJiB0aGlzLnN0ci5lbmRzV2l0aChcIn1cIikpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdHI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBUZXhTcGVlY2ggZXh0ZW5kcyBUZXhTdHIge1xyXG4gICAgY29uc3RydWN0b3IodGV4dCA6IHN0cmluZyl7XHJcbiAgICAgICAgc3VwZXIodGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgKmdlblRleChzcGVlY2ggOiBBYnN0cmFjdFNwZWVjaCB8IG51bGwsIGhpZ2hsaWdodGFibGVzPyA6IE1hcDxzdHJpbmcsIEhpZ2hsaWdodGFibGU+KSA6IEFzeW5jR2VuZXJhdG9yPHN0cmluZywgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgICAgIHlpZWxkIFwiXCI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNwYyh0ZXh0IDogc3RyaW5nKSA6IFRleFNwZWVjaCB7XHJcbiAgICByZXR1cm4gbmV3IFRleFNwZWVjaCh0ZXh0KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VxKC4uLnBhcmFtczphbnlbXSkgOiBUZXhTZXEge1xyXG4gICAgcmV0dXJuIG5ldyBUZXhTZXEocGFyYW1zLm1hcCh4ID0+IG1ha2VGbG93KHgpKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpvaW4odHJtczpUZXJtW10sIGRlbGltaXRlciA6IHN0cmluZykgOiBUZXhOb2RlIHtcclxuICAgIGNvbnN0IG5vZGVzID0gdHJtcy5tYXAoeCA9PiBtYWtlVGVybUZsb3coeCkpO1xyXG4gICAgaWYodHJtcy5sZW5ndGggPT0gMSl7XHJcbiAgICAgICAgcmV0dXJuIG1ha2VUZXJtRmxvdyh0cm1zWzBdKTtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgY29uc3Qgbm9kZXMgOiBUZXhOb2RlW10gPSBbXTtcclxuICAgICAgICBmb3IoY29uc3QgW2ksIHRybV0gb2YgdHJtcy5lbnRyaWVzKCkpe1xyXG4gICAgICAgICAgICBpZihpICE9IDApe1xyXG4gICAgICAgICAgICAgICAgbm9kZXMucHVzaChuZXcgVGV4U3RyKGRlbGltaXRlcikpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBub2Rlcy5wdXNoKG1ha2VUZXJtRmxvdyh0cm0pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgVGV4U2VxKG5vZGVzKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcHJlcGVuZFZhbHVlKHRybSA6IFRlcm0sIG5vZGUgOiBUZXhOb2RlKSA6IFRleE5vZGUge1xyXG4gICAgY29uc3QgZnZhbCA9IHRybS52YWx1ZS5mdmFsKCk7XHJcbiAgICBpZihmdmFsICE9IDEgJiYgdHJtLmlzQWRkKCkpe1xyXG4gICAgICAgIG5vZGUgPSBzZXEoXCIoXCIsIG5vZGUsIFwiKVwiKTtcclxuICAgIH1cclxuICAgIGlmKGZ2YWwgPT0gLTEpeyAgICAgICAgICAgIFxyXG4gICAgICAgIG5vZGUgPSBzZXEoXCItXCIsIG5vZGUpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZihmdmFsICE9ICAxKXtcclxuICAgICAgICBhc3NlcnQodHJtLnZhbHVlLmRlbm9taW5hdG9yID09IDEpO1xyXG4gICAgICAgIG5vZGUgPSBzZXEodHJtLnZhbHVlLm51bWVyYXRvci50b0ZpeGVkKCksIG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKHRybSBpbnN0YW5jZW9mIEFwcCl7XHJcbiAgICAgICAgbm9kZS50ZXJtVGV4ID0gdHJtO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBub2RlO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VGbG93KHRybSA6IFRleE5vZGUgfCBUZXJtIHwgc3RyaW5nKSA6IFRleE5vZGUge1xyXG4gICAgaWYodHJtIGluc3RhbmNlb2YgVGV4Tm9kZSl7XHJcbiAgICAgICAgcmV0dXJuIHRybTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYodHlwZW9mIHRybSA9PT0gXCJzdHJpbmdcIil7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZXhTdHIodHJtKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYodHJtIGluc3RhbmNlb2YgVGVybSl7XHJcbiAgICAgICAgcmV0dXJuIG1ha2VUZXJtRmxvdyh0cm0pO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYWtlVGVybUZsb3codHJtIDogVGVybSkgOiBUZXhOb2RlIHtcclxuICAgIGlmKHRybSBpbnN0YW5jZW9mIFJlZlZhcil7XHJcbiAgICAgICAgY29uc3QgcmVmID0gdHJtO1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgVGV4UmVmKHJlZilcclxuICAgICAgICByZXR1cm4gcHJlcGVuZFZhbHVlKHJlZiwgbm9kZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKHRybSBpbnN0YW5jZW9mIENvbnN0TnVtKXtcclxuICAgICAgICBjb25zdCBudW0gPSB0cm07XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZXhOdW0obnVtKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYodHJtIGluc3RhbmNlb2YgQXBwKXtcclxuICAgICAgICBjb25zdCBhcHAgPSB0cm07XHJcblxyXG4gICAgICAgIGxldCBub2RlIDogVGV4Tm9kZTtcclxuXHJcbiAgICAgICAgaWYoYXBwLmZuYyBpbnN0YW5jZW9mIEFwcCl7XHJcblxyXG4gICAgICAgICAgICBpZihhcHAuZm5jIGluc3RhbmNlb2YgUmVmVmFyKXtcclxuXHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKCBhcHAuZm5jLCBzZXEoXCIoXCIsIGpvaW4oYXBwLmFyZ3MsIFwiLFwiKSwgXCIpXCIpICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKCBcIihcIiwgYXBwLmZuYywgXCIpXCIsIHNlcShcIihcIiwgam9pbihhcHAuYXJncywgXCIsXCIpLCBcIilcIikgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGFwcC5mbmNOYW1lID09IFwibGltXCIpe1xyXG4gICAgICAgICAgICBjb25zdCBhcmcwID0gYXBwLmFyZ3NbMF07XHJcbiAgICAgICAgICAgIGlmKGFyZzAuaXNBZGQoKSB8fCBhcmcwLmlzTXVsKCkpe1xyXG4gICAgICAgICAgICAgICAgbm9kZSA9IHNlcSggXCJcXFxcbGltX3tcIiwgYXBwLmFyZ3NbMV0sIFwiXFxcXHRvXCIsIGFwcC5hcmdzWzJdLCBcIn1cIiwgXCIoXCIsIGFwcC5hcmdzWzBdLCBcIilcIiApO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgbm9kZSA9IHNlcSggXCJcXFxcbGltX3tcIiwgYXBwLmFyZ3NbMV0sIFwiXFxcXHRvXCIsIGFwcC5hcmdzWzJdLCBcIn1cIiwgYXBwLmFyZ3NbMF0gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGFwcC5mbmNOYW1lID09IFwiaW5cIil7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkcyA9IGpvaW4oYXBwLmFyZ3MsIFwiICwgXCIpO1xyXG4gICAgICAgICAgICBub2RlID0gc2VxKCBpZHMgLCBcIlxcXFxpblwiICwgYXBwLmFyZ3NbMV0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihhcHAuaXNEaWZmKCkpe1xyXG4gICAgICAgICAgICBjb25zdCBuID0gKGFwcC5hcmdzLmxlbmd0aCA9PSAzID8gc2VxKFwiXntcIiwgYXBwLmFyZ3NbMl0sIFwifVwiKSA6IGBgKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGQgPSAoYXBwLmZuY05hbWUgPT0gXCJkaWZmXCIgPyBcImRcIiA6IFwiXFxcXHBhcnRpYWxcIik7XHJcblxyXG4gICAgICAgICAgICBpZihhcHAuYXJnc1swXS5pc0RpdigpKXtcclxuXHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKFwiXFxcXGZyYWN7XCIsIGQsIG4sIFwifXtcIiwgc3BjKFwib3ZlclwiKSwgZCwgYXBwLmFyZ3NbMV0sIG4sIFwifVwiLCBzZXEoXCIoXCIsIGFwcC5hcmdzWzBdLCBcIilcIikpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKFwiXFxcXGZyYWN7XCIsIGQsIG4sIGFwcC5hcmdzWzBdLCBcIn17XCIsIHNwYyhcIm92ZXJcIiksIGQsIGFwcC5hcmdzWzFdLCBuLCBcIn1cIilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGlzTGV0dGVyT3JBdChhcHAuZm5jTmFtZSkpe1xyXG4gICAgICAgICAgICBpZihbXCJzaW5cIiwgXCJjb3NcIiwgXCJ0YW5cIl0uaW5jbHVkZXMoYXBwLmZuY05hbWUpICYmICEgKGFwcC5hcmdzWzBdIGluc3RhbmNlb2YgQXBwKSl7XHJcblxyXG4gICAgICAgICAgICAgICAgbm9kZSA9IHNlcSggYXBwLmZuYywgYXBwLmFyZ3NbMF0gKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoYXBwLmZuY05hbWUgPT0gXCJzcXJ0XCIpe1xyXG5cclxuICAgICAgICAgICAgICAgIGFzc2VydChhcHAuYXJncy5sZW5ndGggPT0gMSk7XHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKFwiXFxcXHNxcnR7XCIsIGFwcC5hcmdzWzBdLCBcIn1cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihhcHAuZm5jTmFtZSA9PSBcIm50aF9yb290XCIpe1xyXG5cclxuICAgICAgICAgICAgICAgIGFzc2VydChhcHAuYXJncy5sZW5ndGggPT0gMik7XHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKFwiXFxcXHNxcnRbXCIsIGFwcC5hcmdzWzFdLCBcIl17XCIsIGFwcC5hcmdzWzBdLCBcIn1cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKCBhcHAuZm5jLCBzZXEoXCIoXCIsIGpvaW4oYXBwLmFyZ3MsIFwiLFwiKSwgXCIpXCIpIClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoKGFwcC5mbmNOYW1lKXtcclxuICAgICAgICAgICAgY2FzZSBcIitcIjpcclxuICAgICAgICAgICAgICAgIHN3aXRjaChhcHAuYXJncy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUVycm9yKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBtYWtlVGVybUZsb3coYXBwLmFyZ3NbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgOiBUZXhOb2RlW10gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IoY29uc3QgW2ksIGFyZ10gb2YgYXBwLmFyZ3MuZW50cmllcygpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaSAhPSAwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvZWZmaWNpZW50ID0gYXJnLnZhbHVlLmZ2YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKDAgPD0gY29lZmZpY2llbnQpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5ldyBUZXhTdHIoXCIrXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYoY29lZmZpY2llbnQgPT0gLTEpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5ldyBUZXhTdHIoXCItXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJnX25vZGUgPSBtYWtlVGVybUZsb3coYXJnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXBwLmlzQWRkKCkgJiYgYXJnLmlzTXVsKCkpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goc2VxKFwiKFwiLCBhcmdfbm9kZSwgXCIpXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goYXJnX25vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBub2RlID0gbmV3IFRleFNlcShub2Rlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCIqXCI6XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2goYXBwLmFyZ3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICBub2RlID0gbWFrZVRlcm1GbG93KGFwcC5hcmdzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBqb2luKGFwcC5hcmdzLCBhcHAuZm5jTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgIFxyXG4gICAgICAgICAgICBjYXNlIFwiL1wiOlxyXG4gICAgICAgICAgICAgICAgaWYoYXBwLmFyZ3MubGVuZ3RoID09IDMpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1zZyhgLyAzYXJncyBbJHthcHAuYXJnc1swXS5zdHIoKX1dIFsgJHthcHAuYXJnc1sxXS5zdHIoKX1dIFsgJHthcHAuYXJnc1syXS5zdHIoKX1dYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKGFwcC5hcmdzLmxlbmd0aCA9PSAxKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyBtc2coYC8gMWFyZyBbJHthcHAuYXJnc1swXS5zdHIoKX1dYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1ha2VUZXJtRmxvdyhhcHAuYXJnc1swXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChhcHAuYXJncy5sZW5ndGggPT0gMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBub2RlID0gc2VxKFwiXFxcXGZyYWN7XCIsIGFwcC5hcmdzWzBdLCBcIn17XCIsIHNwYyhcIm92ZXJcIiksIGFwcC5hcmdzWzFdLCBcIn1cIik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJeXCI6XHJcbiAgICAgICAgICAgICAgICBsZXQgZXhwb25lbnQgPSBtYWtlVGVybUZsb3coYXBwLmFyZ3NbMV0pO1xyXG4gICAgICAgICAgICAgICAgaWYoYXBwLmFyZ3NbMV0uaXNWYWx1ZSgyKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwb25lbnQuc2F5KFwic3F1YXJlZFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYoYXBwLmFyZ3NbMV0uaXNWYWx1ZSgzKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwb25lbnQuc2F5KFwiY3ViZWRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cG9uZW50ID0gc2VxKFwidG8gdGhlIHBvd2VyIG9mXCIsIGV4cG9uZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihhcHAuYXJnc1swXSBpbnN0YW5jZW9mIEFwcCAmJiBbXCJzaW5cIixcImNvc1wiLFwidGFuXCJdLmluY2x1ZGVzKGFwcC5hcmdzWzBdLmZuY05hbWUpKXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXBwMiA9IGFwcC5hcmdzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoXCJ7XCIsIGFwcDIuZm5jTmFtZSwgYH1ee2AsIGV4cG9uZW50LCBcIn1cIiwgYXBwMi5hcmdzWzBdIClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoXCJ7XCIsIGFwcC5hcmdzWzBdLCBcIn1ee1wiLCBleHBvbmVudCwgXCJ9XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBpZihhcHAuYXJncy5sZW5ndGggPT0gMSl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBzZXEoYXBwLmZuY05hbWUsIGFwcC5hcmdzWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBqb2luKGFwcC5hcmdzLCBhcHAuZm5jTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBpZihhcHAucGFyZW50ICE9IG51bGwpe1xyXG5cclxuICAgICAgICAvLyAgICAgaWYoYXBwLmlzT3BlcmF0b3IoKSAmJiBhcHAucGFyZW50LmlzT3BlcmF0b3IoKSAmJiAhYXBwLnBhcmVudC5pc0RpdigpKXtcclxuICAgICAgICAvLyAgICAgICAgIGlmKGFwcC5wYXJlbnQuZm5jTmFtZSA9PSBcIl5cIiAmJiBhcHAucGFyZW50LmFyZ3NbMV0gPT0gYXBwKXtcclxuICAgICAgICAvLyAgICAgICAgICAgICA7XHJcbiAgICAgICAgLy8gICAgICAgICB9XHJcbiAgICAgICAgLy8gICAgICAgICBlbHNlIGlmKGFwcC5wYXJlbnQucHJlY2VkZW5jZSgpIDw9IGFwcC5wcmVjZWRlbmNlKCkpe1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIG5vZGUgPSBzZXEoXCIoXCIsIG5vZGUsIFwiKVwiKTtcclxuICAgICAgICAvLyAgICAgICAgIH0gICAgICAgICAgICBcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHByZXBlbmRWYWx1ZShhcHAsIG5vZGUpO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBbGxUZXhOb2Rlcyhub2RlIDogVGV4Tm9kZSwgbm9kZXM6IFRleE5vZGVbXSl7XHJcbiAgICBub2Rlcy5wdXNoKG5vZGUpO1xyXG5cclxuICAgIGlmKG5vZGUgaW5zdGFuY2VvZiBUZXhCbG9jayl7XHJcbiAgICAgICAgbm9kZS5ub2Rlcy5mb3JFYWNoKHggPT4gZ2V0QWxsVGV4Tm9kZXMoeCwgbm9kZXMpKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFsbFRleE5vZGVzKG5vZGUgOiBUZXhOb2RlKSA6IFRleE5vZGVbXSB7XHJcbiAgICBjb25zdCB0ZXJtcyA6IFRleE5vZGVbXSA9IFtdO1xyXG4gICAgZ2V0QWxsVGV4Tm9kZXMobm9kZSwgdGVybXMpO1xyXG5cclxuICAgIHJldHVybiB0ZXJtcztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VOb2RlVGV4dEJ5QXBwKHJvb3QgOiBUZXJtKSA6IFtUZXhOb2RlLCBzdHJpbmdde1xyXG4gICAgcm9vdC5zZXRQYXJlbnQobnVsbCk7XHJcbiAgICByb290LnNldFRhYklkeCgpO1xyXG5cclxuICAgIGNvbnN0IG5vZGUgPSBtYWtlVGVybUZsb3cocm9vdCk7XHJcbiAgICBjb25zdCBwaHJhc2VzIDogUGhyYXNlW10gPSBbXTtcclxuICAgIG5vZGUubWFrZVNwZWVjaChwaHJhc2VzKTtcclxuXHJcbiAgICBjb25zdCB0ZXh0ID0gbWFrZVRleHRGcm9tUGhyYXNlcyhwaHJhc2VzKTtcclxuXHJcbiAgICByZXR1cm4gW25vZGUsIHRleHRdO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2hvd0Zsb3coc3BlZWNoIDogQWJzdHJhY3RTcGVlY2gsIHJvb3QgOiBUZXJtLCBkaXYgOiBIVE1MRGl2RWxlbWVudCB8IEhUTUxTcGFuRWxlbWVudCwgaGlnaGxpZ2h0YWJsZXM/IDogTWFwPHN0cmluZywgSGlnaGxpZ2h0YWJsZT4pe1xyXG4gICAgZGl2LmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgY29uc3QgW25vZGUsIHRleHRdID0gbWFrZU5vZGVUZXh0QnlBcHAocm9vdCk7XHJcblxyXG4gICAgYXdhaXQgc3BlZWNoLnNwZWFrKHRleHQpO1xyXG5cclxuICAgIGxldCBwcmV2X3MgPSBcIlwiO1xyXG4gICAgZm9yIGF3YWl0KGNvbnN0IHMgb2Ygbm9kZS5nZW5UZXgoc3BlZWNoLCBoaWdobGlnaHRhYmxlcykpe1xyXG4gICAgICAgIGlmKHByZXZfcyAhPSBzKXtcclxuICAgICAgICAgICAgcHJldl9zID0gcztcclxuXHJcbiAgICAgICAgICAgIC8vIG1zZyhgc2hvdyBmbG93OiR7c31gKTtcclxuICAgICAgICAgICAgcmVuZGVyS2F0ZXhTdWIoZGl2LCBzKTtcclxuICAgICAgICAgICAgYXdhaXQgc2xlZXAoMTApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcmVuZGVyS2F0ZXhTdWIoZGl2LCByb290LnRleCgpKTtcclxuXHJcbiAgICBhd2FpdCBzcGVlY2gud2FpdEVuZCgpO1xyXG59XHJcblxyXG59Il19