/*

    V 18.11.13
 */


let U = {};

U.addListener = function (el, type, foo, capture, name)
{
    if (!name)
    {
        name = "lisnrctl";
    }

    if (!capture)
    {
        capture = false;
    }
    if (typeof el === "string")
    {
        let els = document.querySelectorAll(el);
        for (let i = 0; i < els.length; i++)
        {
            U.addListener(els[i], type, foo, capture, name);
        }
        return;
    }
    if (el instanceof Array)
    {
        for (let i = 0; i < el.length; i++)
        {
            U.addListener(el[i], type, foo, capture, name);
        }
        return;
    }

    if (!el)
    {
        return;
    }

    let types = type.split(/\s+/);
    for (let i = 0; i < types.length; i++)
    {
        let listenerName = name + "-" + types[i];
        let oldFoo = el[listenerName];
        if (oldFoo)
        {
            el.removeEventListener(types[i], oldFoo);
        }
        el[listenerName] = foo;
        el.addEventListener(types[i], el[listenerName], capture);
    }
};

U.removeListener = function (el, type, name)
{
    if (!name)
    {
        name = "lisnrctl";
    }

    if (typeof el === "string")
    {
        let els = document.querySelectorAll(el);
        for (let i = 0; i < els.length; i++)
        {
            U.removeListener(els[i], type, name);
        }
        return;
    }
    if (el instanceof Array)
    {
        for (let i = 0; i < el.length; i++)
        {
            U.removeListener(el[i], type, name);
        }
        return;
    }

    if (!el)
    {
        return;
    }

    let types = type.split(/\s+/);
    for (let i = 0; i < types.length; i++)
    {
        let listenerName = name + "-" + types[i];
        let foo = el[listenerName];
        if (foo)
        {
            el.removeEventListener(types[i], foo);
        }
        delete el[listenerName];
    }
};

U.getEl = function (selector)
{
    if (!selector)
    {
        return;
    }
    if (typeof selector !== "string")
    {
        return (selector);
    }
    if (selector.charAt(0) === "#" && selector.substring(1).search(/[ \t\.\>\<\#\[\]\+\,\=\~\*\^\:\(\)]/) === -1)
    {
        return (document.getElementById(selector.substring(1)));
    }

    return (document.querySelector(selector));
};


U.addClass = function (el, className)
{
    if (typeof el === "string")
    {
        let els = document.querySelectorAll(el);
        for (let i = 0; i < els.length; i++)
        {
            U.addClass(els[i], className);
        }
        return;
    }

    if (!el)
    {
        return;
    }

    if (new RegExp("(^|\\s+)" + className + "($|\\s+)").test(el.className))
    {
        return;
    }
    el.className = el.className.replace(new RegExp("(^|\\s+)" + className + "($|\\s+)", "g"), " ");
    el.className += " " + className;
    el.className = el.className.trim();
    return (el);
};
U.removeClass = function (el, className)
{
    if (typeof el === "string")
    {
        let els = document.querySelectorAll(el);
        for (let i = 0; i < els.length; i++)
        {
            U.removeClass(els[i], className);
        }
        return;
    }

    if (!el)
    {
        return;
    }
    el.className = el.className.replace(new RegExp("(^|\\s+)" + className + "($|\\s+)", "gi"), " ");
    el.className = el.className.trim();
    return (el);
};

U.replaceClass = function (el, oldClass, newClass)
{
    U.removeClass(el, oldClass);
    U.addClass(el, newClass);
    return (el);
};

U.hasClass = function (el, className)
{
    if (typeof el === "string")
    {
        el = document.querySelectorAll(el)[0];
    }
    if (!el || el == null)
    {
        console.trace("hasClass: no element to query");
        throw ("hasClass: no element to query");
    }
    if (el.className.indexOf(className) !== -1)
    {
        return (true);
    }
    return (false);
};


U.sign = function (num)
{
    if (num === 0)
    {
        return (0);
    }
    if (num < 0)
    {
        return (-1);
    }
    return (1);
};

U.removeAllChildren = function (el)
{
    if (typeof el === "string")
    {
        el = U.getEl(el);
    }
    while (el && el.childNodes.length > 0)
    {
        el.removeChild(el.childNodes[0]);
    }
    return (el);
};

U.removeTextChildren = function (el)
{
    let res = "";
    if (typeof el === "string")
    {
        el = U.getEl(el);
    }

    if (!el)
    {
        throw("removeTextChildren: Element not found");
    }

    for (let i = 0; i < el.childNodes.length; i++)
    {
        if (el.childNodes[i].nodeType === Node.TEXT_NODE || el.childNodes[i].tagName === "BR")
        {
            if (el.childNodes[i].tagName === "BR")
            {
                res += "\n";
            }
            else
            {
                let tmpVal = el.childNodes[i].nodeValue;
                if (!tmpVal || tmpVal == null)
                {
                    tmpVal = "";
                }
                res += tmpVal;
            }
            el.removeChild(el.childNodes[i]);
            i--;
        }
    }
    return (res);
};
U.clearText = function (el)
{
    U.removeTextChildren(el);
};
U.setText = function (el, text)
{
    let origEl = el;
    if (typeof el === "string")
    {
        el = U.getEl(el);
    }
    if (!el)
    {
        console.log("SetText: element not found: " + origEl);
    }

    U.removeTextChildren(el);
    U.appendText(el, text);
};
U.appendText = function (el, text)
{
    if (typeof el === "string")
    {
        el = U.getEl(el);
    }
    text = U.removeTextChildren(el) + text;
    let texts = text.split("\n");

    for (let i = 0; i < texts.length; i++)
    {
        if (i !== 0)
        {
            el.appendChild(document.createElement("br"));
        }
        let textNode = document.createTextNode(texts[i]);
        el.appendChild(textNode);
    }
};
U.addText = function (el, text)
{
    if (typeof el === "string")
    {
        el = U.getEl(el);
    }
    let texts = text.split("\n");

    for (let i = 0; i < texts.length; i++)
    {
        if (i !== 0)
        {
            el.appendChild(document.createElement("br"));
        }
        let textNode = document.createTextNode(texts[i]);
        el.appendChild(textNode);
    }
};

/**
 url.params{ name, value }
 url.url
 */
U.req = function (urlAndParams, callbackOk, callbackError, method)
{
    let req = new XMLHttpRequest();
    let strParam = "";

    if (!method || method.toLowerCase() !== "get")
    {
        method = "POST";
    }
    else
    {
        method = "GET";
        strParam += "?";
    }

    if (urlAndParams.params)
    {
        let first = true;
        for (let name in urlAndParams.params)
        {
            if (urlAndParams.params.hasOwnProperty(name))
            {
                let value = urlAndParams.params[name];
                if (!first)
                {
                    strParam += "&"
                }
                strParam += encodeURIComponent(name) + "=" + encodeURIComponent(value);
                first = false;
            }
        }
    }

    U.addListener(req, "readystatechange", function ()
    {
        if (req.readyState === 4)
        {
            if (req.status === 200)
            {
                let res;
                try
                {
                    res = JSON.parse(req.responseText);
                }
                catch (e)
                {
                    res = req.responseText;
                }
                if (callbackOk)
                {
                    callbackOk(res, req);
                }
            }
            else
            {
                if (callbackError)
                {
                    callbackError(req.status, req);
                }
            }
        }
    });
    req.open(method, urlAndParams.url, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(strParam);
};

U.isMsisdn = function (input)
{
    let value;
    if (typeof input === "string" && /^\d*$/.test(input.replace(/\D/g, "")))
    {
        value = input;
    }
    else
    {
        let value = U.getEl(input).value.replace(/\D/g, "");
    }
    let re = new RegExp("^0((50)|(95)|(66)|(99))\\d{7}$", "g");

    if (re.test(value))
    {
        return (true);
    }
    return (false);
};

U.formatMsisdn = function (e, justCheck)
{
    let val;

    if (typeof e === "string")
    {
        val = e;
        justCheck = true;
    }
    else
    {
        e = U.getEl(e);
        val = e.value;
    }
    let res;

    res = val.replace(/\D/g, "").substring(0, 13);
    val = res.substring(0, 3);
    if (res.length >= 3)
    {
        val += " " + res.substring(3, 6);
    }
    if (res.length >= 6)
    {
        val += " " + res.substring(6, 8);
    }
    if (res.length >= 8)
    {
        val += " " + res.substring(8, 10);
    }
    if (res.length >= 10)
    {
        val += " " + res.substring(10, 12);
    }
    if (val.length > 13)
    {
        val = val.substring(0, 13);
    }

    if (e.value)
    {
        e.value = val;
    }

    if (justCheck)
    {
        return (res);
    }

    e.maxLength = 13;
    U.addListener(e, "paste drop", function (e)
    {
        let res;
        let caretPos = e.selectionStart;

        res = val.replace(/\D/g, "").substring(0, 13);
        val = res.substring(0, 3);
        if (res.length >= 3)
        {
            val += " " + res.substring(3, 6);
        }
        if (res.length >= 6)
        {
            val += " " + res.substring(6, 8);
        }
        if (res.length >= 8)
        {
            val += " " + res.substring(8, 10);
        }
        if (res.length >= 10)
        {
            val += " " + res.substring(10, 12);
        }
        e.value = val;

        e.selectionStart = caretPos;
        e.selectionEnd = caretPos;
    }, false, "frmt");

    U.addListener(e, "keydown", function (e)
    {
        let pos = e.target.selectionStart;
        let el = e.target;
        let val = el.value;

        el.oldLength = val.trim().length;
        el.lastPosition = pos;

        if ((pos >= 13 && e.keyCode >= 48 && e.keyCode <= 57)
            || (pos >= 13 && e.keyCode >= 96 && e.keyCode <= 105)
            || e.keyCode === 32
            || (e.keyCode > 57 && e.keyCode < 96)
            || e.keyCode > 105
            && e.keyCode !== 229)
        {
            e.preventDefault();
            return (false);
        }
    }, false, "frmt-last-ign");

    U.addListener(e, "keyup", function (e)
    {
        let pos = e.target.selectionStart;
        let el = e.target;
        let val = el.value;
        let res = "";

        if (pos >= 13)
        {
            e.preventDefault();
            return (false);
        }

        if (!el.lastPosition)
        {
            el.lastPosition = pos;
        }

        val = val.trim();
        let advance = 0;
        if (pos >= val.length && (pos === 3 || pos === 7 || pos === 10 || pos === 4 || pos === 8 || pos === 11))
        {
            advance++;
        }
        else
        {
            if (val.length > el.oldLength &&
                (pos === 3 || pos === 7 || pos === 10 || pos === 4 || pos === 8 || pos === 11))
            {
                advance++;
            }
        }
        let j = 0;
        for (let i = 0; i < val.length; i++)
        {
            let charCode = val.charCodeAt(i);
            if (charCode >= 48 && charCode <= 57)
            {
                res += String.fromCharCode(charCode);
                j++;
                if (j === 3 || j === 7 || j === 10)
                {
                    res += " ";
                    j++;
                }
            }
        }

        el.value = res;

        if (el.lastPosition < pos)
        {
            pos += advance;
        }

        el.selectionStart = pos;
        el.selectionEnd = pos;
    }, false, "frmt");
};

Date.prototype.toString = function ()
{
    let day = this.getDate();
    let month = this.getMonth() + 1;
    let year = this.getFullYear();
    let result;

    result = year + "-";
    if (month < 10)
    {
        result += "0" + month + "-";
    }
    else
    {
        result += month + "-";
    }
    if (day < 10)
    {
        result += "0" + day;
    }
    else
    {
        result += day;
    }
    return (result);
};

Date.prototype.toFullString = function ()
{
    let mday = this.getDate();
    let month = this.getMonth() + 1;
    let year = this.getFullYear();
    let hours = this.getHours();
    let mins = this.getMinutes();
    let secs = this.getSeconds();

    hours = hours < 10 ? "0" + hours : hours;
    mins = mins < 10 ? "0" + mins : mins;
    secs = secs < 10 ? "0" + secs : secs;
    month = month < 10 ? "0" + month : month;
    mday = mday < 10 ? "0" + mday : mday;

    return (year + "-" + month + "-" + mday + " " + hours + ":" + mins + ":" + secs);
};

U.addObject = function (o1, o2)
{
    let res = {};
    for (let n in o1)
    {
        if (o1.hasOwnProperty(n))
        {
            res[n] = o1[n];
        }
    }
    for (let n in o2)
    {
        if (o2.hasOwnProperty(n))
        {
            res[n] = o2[n];
        }
    }
    return (res);
};

U.getOffset = function (e)
{
    //let cs=document.defaultView.getComputedStyle(e);

    if (!e)
    {
        throw("getOffset: element required");
    }

    e = U.getEl(e);

    let rc = e.getBoundingClientRect();
    return ({
        top: rc.top,
        left: rc.left,
        bottom: rc.bottom,
        right: rc.right
    });
};

U.validatePass = function (pass)
{
    let rg = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+\\-\\*\\\\=\\_\\~\\$\\^])(?=\\S+$).{8,}$", "");

    return (rg.test(pass));
};

U.getRemSize = function ()
{
    return (getComputedStyle(document.body, null).fontSize);
    //return (parseInt(getComputedStyle(document.body, null).fontSize.replace(/[^\d]/g, '') * 100) / 100);
};

U.fRound = function (number, precision)
{
    let multiplier = Math.pow(10, precision);
    return (Math.round(number * multiplier) / multiplier);
};

U.getZIndex = function (e)
{
    e = U.getEl(e);
    let currentEl = e;
    let zIndex = 0;

    while (e && e.style && !e.style.zIndex)
    {
        e = e.parentNode;
    }

    if (e && e.style && e.style.zIndex)
    {
        zIndex = parseInt(e.style.zIndex);
    }
    if (isNaN(zIndex)) zIndex = 0;
    return (zIndex);
};

U.getCookie = function (name)
{
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++)
    {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

// iOS - force buttons to get touches
document.addEventListener("touchstart", function() {}, false);

