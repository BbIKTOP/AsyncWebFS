
function Resizer(div, resizeClassX, resizeClassY, resizeClassXY, resizeMargin, resizeRight, resizeBottom)
{
    if (!div)
    {
        throw("Error: Cannot make nothing resizable - specify div to resize first");
    }

    if (typeof div === "string")
    {
        let elements = document.querySelectorAll(div);
        let resizes = [];
        for (let i = 0; i < elements.length; i++)
        {
            resizes.push(
                new Resizer(elements[i], resizeClassX, resizeClassY, resizeClassXY, resizeMargin,
                    resizeRight, resizeBottom));
        }
        return (resizes);
    }
    else
    {
        this.el = div;
    }

    if (!this.el)
    {
        throw("Error: Element to resize not found: " + div);
    }

    if (!resizeClassX)
    {
        resizeClassX = "resizing";
    }
    if (!resizeClassY)
    {
        resizeClassY = "resizing";
    }
    if (!resizeClassXY)
    {
        resizeClassXY = "resizing";
    }

    this.resizeClassX = resizeClassX;
    this.resizeClassY = resizeClassY;
    this.resizeClassXY = resizeClassXY;
    this.resizeMargin = parseInt(resizeMargin);
    if (isNaN(this.resizeMargin))
    {
        this.resizeMargin = 10;
    }

    this.resizeRight = resizeRight;
    this.resizeBottom = resizeBottom;

    this.resizeCover = document.getElementById("resizer-cover-div");
    if (!this.resizeCover || this.resizeCover == null)
    {
        this.resizeCover = document.createElement("div");
        this.resizeCover.style.position = "absolute";
        this.resizeCover.style.top = "0";
        this.resizeCover.style.bottom = "0";
        this.resizeCover.style.left = "0";
        this.resizeCover.style.right = "0";
        this.resizeCover.style.display = "none";
        this.resizeCover.style.zIndex = -999;
        this.resizeCover.id = "resizer-cover-div";

        document.body.appendChild(this.resizeCover);
    }
    this.savedCursor = this.el.style.cursor;

    let self = this;
    U.removeListener(this.el, "mousedown touchstart mouseover mouseout", "resizer");
    U.addListener(this.el, "mousedown touchstart", function (e)
    {
        self.beginResize(e);
    }, false, "resizer");

    U.addListener(this.el, "mouseover mouseout mousemove", function (e)
    {
        self.checkChangeCursor(e);
    }, false, "resizer");
    U.addListener(this.el, "mouseout", function (e)
    {
        self.restoreCursor(e);
    }, false, "resizer");
}

Resizer.prototype.getElement = function ()
{
    return (this.el);
};

Resizer.prototype.restoreCursor = function ()
{
    this.el.style.cursor = this.savedCursor;
};
Resizer.prototype.checkChangeCursor = function (event)
{
    let eventPositionX = event.pageX;
    let eventPositionY = event.pageY;
    let br = U.getOffset(this.el);

    let dRight = br.right - eventPositionX;
    let dBottom = br.bottom - eventPositionY;

    let resizeX = false;
    let resizeY = false;

    if (this.resizeRight && dRight >= 0 && dRight <= this.resizeMargin)
    {
        resizeX = true;
    }

    if (this.resizeBottom && dBottom >= 0 && dBottom <= this.resizeMargin)
    {
        resizeY = true;
    }

    let className = "";

    if (resizeX)
    {
        if (resizeY)
        {
            className = this.resizeClassXY;
        }
        else
        {
            className = this.resizeClassX
        }
    }
    else
    {
        if (resizeY)
        {
            className = this.resizeClassY;
        }
    }

    if (className == "" || !this.el.classList.contains(className))
    {
        this.el.classList.remove(this.resizeClassXY);
        this.el.classList.remove(this.resizeClassX);
        this.el.classList.remove(this.resizeClassY);

        if (className != "") this.el.classList.add(className);

        this.resizeCover.classList.remove(this.resizeClassXY);
        this.resizeCover.classList.remove(this.resizeClassX);
        this.resizeCover.classList.remove(this.resizeClassY);
        if (className != "") this.resizeCover.classList.add(className);

        //console.log("Class " + className + " was not found and has been added");
    }

};

Resizer.prototype.beginResize = function (event)
{
    let self = this;

    let eventPositionX;
    let eventPositionY;
    if (event.type == "touchstart")
    {
        eventPositionX = event.touches[0].pageX;
        eventPositionY = event.touches[0].pageY;
    }
    else
    {
        eventPositionX = event.pageX;
        eventPositionY = event.pageY;
    }

    let cs = getComputedStyle(self.el);
    self.startWidth = parseFloat(cs.width);
    self.startHeight = parseFloat(cs.height);

    let br = U.getOffset(this.el);

    self.el.style.width = self.startWidth + "px";
    self.el.style.height = self.startHeight + "px";

    self.startX = eventPositionX;
    self.startY = eventPositionY;

    let dRight = br.right - eventPositionX;
    let dBottom = br.bottom - eventPositionY;

    self.doResizeX = false;
    self.doResizeY = false;
    if (self.resizeRight && dRight >= 0 && dRight <= self.resizeMargin)
    {
        self.doResizeX = true;
    }

    if (self.resizeBottom && dBottom >= 0 && dBottom <= self.resizeMargin)
    {
        self.doResizeY = true;
    }

    /*
    console.log("Event position: x=" + eventPositionX + ", y=" + eventPositionY +
        "; element bottom=" + br.bottom + ", right=" + br.right);

    console.log("dBottom=" + dBottom + ", dRight=" + dRight);
    console.log("doResizeX=" + self.doResizeX + ", doResizeY=" + self.doResizeY);
    */

    if (!self.doResizeX && !self.doResizeY)
    {
        return;
    }

    this.resizeCover.style.display = "block";
    this.resizeCover.style.zIndex = 999;

    if (self.doResizeX)
    {
        self.resizeCover.style.cursor = "ew-resize";
    }
    if (self.doResizeY)
    {
        self.resizeCover.style.cursor = "ns-resize";
    }
    if (self.doResizeX && self.doResizeY)
    {
        self.resizeCover.style.cursor = "nwse-resize";
    }

    self.el.style.cursor = self.resizeCover.style.cursor;

    self.el.className = this.el.className.replace(new RegExp("(^|\\s+)" + self.resizeClass + "($|\\s+)", "g"), " ")
        .trim();

    self.el.className += " " + self.resizeClass;
    U.addListener(document.documentElement, "mousemove", function (e)
    {
        self.doResize(e);
    }, false, "resizer");
    U.addListener(this.el, "touchmove", function (e)
    {
        self.doResize(e);
    }, false, "resizer");

    U.addListener(document.documentElement, "mouseup", function (e)
    {
        self.endResize(e);
    }, false, "resizer");
    U.addListener(this.el, "touchend", function (e)
    {
        self.endResize(e);
    }, false, "resizer");
};

Resizer.prototype.doResize = function (event)
{
    let eventPositionX;
    let eventPositionY;

    if (event.type === "touchmove")
    {
        eventPositionX = event.touches[0].pageX;
        eventPositionY = event.touches[0].pageY;
    }
    else
    {
        eventPositionX = parseFloat(event.pageX);
        eventPositionY = parseFloat(event.pageY);
    }

    let dx = eventPositionX - this.startX;
    let dy = eventPositionY - this.startY;

    if (this.doResizeX)
    {
        this.el.style.width = (this.startWidth + dx) + "px";
    }
    if (this.doResizeY)
    {
        this.el.style.height = (this.startHeight + dy) + "px";
    }

    //console.log("w=" + this.el.style.width + "  ,  h=" + this.el.style.height);
};

Resizer.prototype.endResize = function ()
{
    this.el.className = this.el.className.replace(new RegExp("(^|\\s+)" + this.resizeClass + "($|\\s+)", "g"), " ")
        .trim();
    this.doResizeX = false;
    this.doResizeY = false;
    this.resizeCover.style.display = "none";
    this.resizeCover.style.zIndex = -999;
    this.restoreCursor();
    U.removeListener(document.documentElement, "mousemove", "resizer");
    U.removeListener(document.documentElement, "mouseup", "resizer");
    U.removeListener(document.documentElement, "mousedown", "resizer");
    U.removeListener(this.el, "touchmove", "resizer");
    U.removeListener(this.el, "touchend", "resizer");
};

/*
Resizer.prototype.getOffset = function (el)
{
    if (!el || el == null)
    {
        el = this.el;
    }
    let rect = el.getBoundingClientRect();
    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return ({
        top: rect.top + scrollTop, left: rect.left + scrollLeft,
        bottom: rect.bottom + scrollTop, right: rect.right + scrollLeft
    });
};
*/
