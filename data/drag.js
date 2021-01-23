/*

2018.11.24

 */


function Drag(selector, handleSelector, dragClass, dropData, moveToBody, createReplacer)
{
    if (!selector)
    {
        throw("Error: Cannot make nothing draggable - specify div to drag first");
    }

    if (typeof selector === "string")
    {
        if (!handleSelector)
        {
            let elements = document.querySelectorAll(selector);
            let drags = [];
            for (let i = 0; i < elements.length; i++)
            {
                drags.push(new Drag(elements[i], handleSelector, dragClass, dropData, moveToBody, createReplacer));
            }
            return (drags);
        }
        else
        {
            this.el = document.querySelector(selector);
        }
    }
    else
    {
        this.el = selector;
    }

    if (!this.el)
    {
        throw("Error: Element to drag not found: " + selector);
    }

    if (!handleSelector || handleSelector == null)
    {
        handleSelector = this.el;
    }

    if (typeof handleSelector === "string")
    {
        this.elEv = document.querySelector(handleSelector);
    }
    else
    {
        this.elEv = handleSelector;
    }
    if (!this.elEv)
    {
        throw("Error: Element to drag not found: " + handleSelector);
    }

    if (!dragClass || dragClass == null)
    {
        dragClass = "dragging";
    }

    this.dragClass = dragClass;
    this.id = "Drag-" + this.el.id;
    this.elementId = "Drag-" + this.el.id;

    this.prefix = "-replaced-by-drag";

    this.width = parseInt(document.defaultView.getComputedStyle(this.el).width, 10);
    this.height = parseInt(document.defaultView.getComputedStyle(this.el).height, 10);

    this.el.move = function (x, y, dx, dy)
    {
        self.move(x, y, dx, dy);
    };

    if (dropData && dropData != null)
    {
        this.dropData = dropData;
    }

    this.savedStyle = this.el.style;
    this.replacedCopy = null;

    let self = this;
    U.removeListener(this.elEv, "mousedown touchstart", "drag");
    U.addListener(this.elEv, "mousedown touchstart", function (e)
    {
        self.beginDrag(e);
    }, false, "drag");

    this.moveToBody = !!moveToBody;

    this.createReplacer = !!createReplacer;

    if (!Drag.prototype.clickToTopGroups)
    {
        Drag.prototype.clickToTopGroups = [];
    }
    this.getSizingCorrection();
}

Drag.prototype.move = function (x, y, dx, dy)
{
    if (!dx || !dy)
    {
        this.setPosition();
        this.el.style.top = y + "px";
        this.el.style.left = x + "px";
    }
    else
    {
        let currentCoords = U.getOffset(this.el);

        dx = currentCoords.left > x ? -Math.abs(dx) : Math.abs(dx);
        dy = currentCoords.top > y ? -Math.abs(dy) : Math.abs(dy);

        this.slowMove(x, y, dx, dy, this.el);
    }
}

Drag.prototype.setClickToTop = function (clickToTopGroup)
{
    this.clickToTopGroup = clickToTopGroup;
    this.clickToTop();
};

Drag.prototype.clickToTop = function ()
{

    let i;
    let group;
    for (i = 0; i < this.clickToTopGroups.length; i++)
    {
        if (this.clickToTopGroups[i].name === this.clickToTopGroup)
        {
            group = this.clickToTopGroups[i];
            break;
        }
    }
    if (i >= this.clickToTopGroups.length)
    {
        //new group, create it
        group = {
            name: this.clickToTopGroup,
            elements: []
        };
        this.clickToTopGroups.push(group);
    }

    let currentElementIndex = group.elements.indexOf(this.el);
    let maxZ = U.getZIndex(this.el);
    if (currentElementIndex >= 0 && currentElementIndex >= (group.elements.length - 1)) //Already at the top
    {
        return;
    }
    if (currentElementIndex >= 0) // Element exists and not at the top, remove it
    {
        for (let i = currentElementIndex; i < group.elements.length; i++)
        {
            group.elements[i].style.zIndex = U.getZIndex(group.elements[i]) - 1;
        }
        group.elements.splice(currentElementIndex, 1);
    }

    if (group.elements.length > 0)
    {
        maxZ = U.getZIndex(group.elements[group.elements.length - 1]) + 1;
    }

    group.elements.push(this.el);
    this.el.style.zIndex = maxZ;
};

Drag.prototype.setPosition = function ()
{
    this.originalParent = this.el.parentNode;
    // Create replacing node to keep layout
    let cStyle = document.defaultView.getComputedStyle(this.el);

    let replacer = null;
    if (this.createReplacer &&
        (!this.replacedCopy || this.replacedCopy == null ||
         this.replacedCopy.parentNode !== this.el.parentNode))
    {

        /*        if (cStyle.position !== "absolute" && cStyle.position !== "fixed"
                    && cStyle.position !== "relative")
                {*/
        replacer = this.cloneNode(this.el); // Need to replace moved div to keep the whole layout

        //            replacer.style.cssText=cStyle.cssText;

        replacer.style["opacity"] = 0;
        replacer.style["z-index"] = "-100";
        /*
         }
         else
         {
             replacer = document.createElement("div");
             replacer.style.width = "0px";
             replacer.style.height = "0px";
             replacer.style.margin = "0px";
             replacer.style.border = "0px";
             replacer.style.padding = "0px";
         }
         */
    }

    // Get current position and size

    let left;
    let top;
    let vpo = U.getOffset(this.el);
    if (this.moveToBody)
    {
        left = vpo.left;
        top = vpo.top;
    }
    else
    {
        if (cStyle.position === "fixed")
        {
            let elRect = this.el.getBoundingClientRect();
            top = elRect.top;
            left = elRect.left;
        }
        else
        {
            top = this.el.offsetTop;
            left = this.el.offsetLeft;
        }
    }

    /*console.log("Current top=" + top + ", currentLeft=" + left);
    console.log("Parent top=" + this.el.offsetParent.offsetTop +
        ", parent left=" + this.el.offsetParent.offsetLeft);
    */


    let width = parseFloat(cStyle.width);
    let height = parseFloat(cStyle.height);


    if (isNaN(width) || isNaN(height) || this.getSizingCorrection(cStyle.boxSizing))
    {
        width = this.el.offsetWidth;
        height = this.el.offsetHeight;
    }

    //console.log("parent node=" + this.el.parentNode.tagName + "#" + this.el.parentNode.id);
    //console.log("Computed top=" + top + ", left=" + left);

    if (replacer != null) // Need to insert replacing node
    {
        this.replacedCopy = replacer;
        this.replacedCopy.id = this.el.id + this.prefix;
        this.originalParent.insertBefore(this.replacedCopy, this.el);
    }
    if (this.moveToBody && this.el.parentNode !== document.body)
    {
        document.body.appendChild(this.el);
        //console.log("Moved to body");
    }

    if (cStyle.position !== "fixed")
    {
        this.el.style.position = "absolute";
    }
    let wasNoDisplay = false;
    let lastOpacity = this.el.style.opacity;
    if (this.el.style.display.toLowerCase() === "none")
    {
        wasNoDisplay = true;
        this.el.style.opacity = 0;
    }
    this.el.style.display = "block";
    this.el.style.margin = "0";

    this.el.style.left = left + "px";
    this.el.style.top = top + "px";

    this.el.dragSavedLeft = left;
    this.el.dragSavedTop = top;

    this.el.style.width = width + "px";
    this.el.style.height = height + "px";

    if (wasNoDisplay)
    {
        this.el.style.opacity = lastOpacity;
        this.el.style.display = "none";
    }
};

Drag.prototype.getElement = function ()
{
    return (this.el);
};

Drag.prototype.calculate = function ()
{
    this.beginDrag({pageX: 0, pageY: 0});
    this.endDrag(this);
    return (this);
};

Drag.prototype.beginDrag = function (event)
{

    let self = this;

    this.setPosition();

    if (!!this.clickToTopGroup)
    {
        this.clickToTop();
    }

    //let elRect = this.el.getBoundingClientRect();
    this.el.style.display = "block";

    let positionX;
    let positionY;
    if (event.type === "touchstart")
    {
        positionX = event.touches[0].pageX;
        positionY = event.touches[0].pageY;
    }
    else
    {
        positionX = event.pageX;
        positionY = event.pageY;
    }

    this.startX = positionX;
    this.startY = positionY;

    this.el.dragSavedLeft = parseFloat(this.el.style.left);
    this.el.dragSavedTop = parseFloat(this.el.style.top);

    this.el.className = this.el.className.replace(new RegExp("(^|\\s+)" + this.dragClass + "($|\\s+)", "g"), " ")
                            .trim();

    this.el.className += " " + this.dragClass;
    U.addListener(document.documentElement, "mousemove", function (e)
    {
        self.doDrag(e);
    }, false, "drag");
    U.addListener(this.elEv, "touchmove", function (e)
    {
        self.doDrag(e);
    }, false, "drag");

    U.addListener(document.documentElement, "mouseup", function (e)
    {
        self.endDrag(e);
    }, false, "drag");
    U.addListener(this.elEv, "touchend", function (e)
    {
        self.endDrag(e);
    }, false, "drag");

    //console.log("Begin: initial X="+divLeft+", Y="+divTop);

    /*
    // Save drag source to fire drag event at the end of the drag
        let touchX;
        let touchY;
        if (event.type == "touchmove")
        {
            touchX = parseFloat(event.touches[0].clientX);
            touchY = parseFloat(event.touches[0].clientY);
        }
        else
        {
            touchX = parseFloat(event.clientX);
            touchY = parseFloat(event.clientY);
        }

        let savedDisplay = this.el.style.display;
        this.el.style.display = "none";
        let dragTarget = document.elementFromPoint(touchX, touchY);
        this.el.style.display = savedDisplay;
        if (dragTarget && dragTarget != null)
        {
            this.draggedFrom = dragTarget;
        }
    */

    if (event.preventDefault)
    {
        event.preventDefault();
    }
    if (event.stopPropagation)
    {
        event.stopPropagation();
    }

    return (false);
};

Drag.prototype.doDrag = function (event)
{
    let touchX;
    let touchY;

    if (event.type === "touchmove")
    {
        touchX = parseFloat(event.touches[0].pageX);
        touchY = parseFloat(event.touches[0].pageY);
    }
    else
    {
        touchX = parseFloat(event.pageX);
        touchY = parseFloat(event.pageY);
    }

    let dx = touchX - this.startX;
    let dy = touchY - this.startY;

    let newX = this.el.dragSavedLeft + dx;
    let newY = +this.el.dragSavedTop + dy;

    this.el.style.left = newX + "px";
    this.el.style.top = newY + "px";

    // Save drag source to fire drag event at the end of the drag
    if ((!this.wasDragDrop || this.wasDragDrop == null) && this.dropData)
    {
        this.wasDragDrop = true;

        if (this.originalParent)
        {
            this.draggedFrom = this.originalParent;

            let dragEvent = new CustomEvent("dragdrag",
                                            {
                                                bubbles: true,
                                                detail: {
                                                    data: this.dropData,
                                                    element: this.el,
                                                    drag: this
                                                }
                                            });
            this.draggedFrom.dispatchEvent(dragEvent);
        }

        /*
        let posX = touchX - window.pageXOffset;
        let posY = touchY - window.pageYOffset;

        let savedDisplay = this.el.style.display;
        this.el.style.display = "none";
        let dragTarget = document.elementFromPoint(posX, posY);
        this.el.style.display = savedDisplay;
        if (dragTarget && dragTarget != null)
        {
            this.draggedFrom = dragTarget;
        }
        if (this.draggedFrom && this.draggedFrom != null )
        {
            let dragEvent = new CustomEvent("dragdrag",
                                            {
                                                bubbles: true,
                                                detail: {
                                                    data: this.dropData,
                                                    element: this.el,
                                                    drag: this
                                                }
                                            });
            this.draggedFrom.dispatchEvent(dragEvent);
        }
        */

    }

    if (event.preventDefault)
    {
        event.preventDefault();
    }
    if (event.stopPropagation)
    {
        event.stopPropagation();
    }

    return (false);
};

Drag.prototype.endDrag = function (event)
{
    this.el.className = this.el.className.replace(new RegExp("(^|\\s+)" + this.dragClass + "($|\\s+)", "g"), " ")
                            .trim();
    U.removeListener(document.documentElement, "mouseup", "drag");
    U.removeListener(document.documentElement, "mousedown", "drag");
    U.removeListener(document.documentElement, "mousemove", "drag");
    U.removeListener(this.elEv, "touchmove", "drag");
    U.removeListener(this.elEv, "touchend", "drag");

    if (!event.type)
    {
        return (false);
    }

    let posX = 0;
    let posY = 0;
    if (event.type === "touchmove")
    {
        posX = parseFloat(event.touches[0].pageX) - window.pageXOffset;
        posY = parseFloat(event.touches[0].pageY) - window.pageYOffset;
    }
    else
    {
        posX = parseFloat(event.pageX) - window.pageXOffset;
        posY = parseFloat(event.pageY) - window.pageYOffset;
    }

    if (this.wasDragDrop)
    {
        let savedDisplay = this.el.style.display;
        this.el.style.display = "none";
        let dropTarget = document.elementFromPoint(posX, posY);
        this.el.style.display = savedDisplay;
        /*        if (this.draggedFrom && this.draggedFrom != null /!*&& this.draggedFrom != dropTarget*!/)
                {
                    let dragEvent = new CustomEvent("dragdrag",
                        {
                            bubbles: true,
                            detail: {
                                data: this.dropData,
                                element: this.el,
                                drag: this
                            }
                        });
                    this.draggedFrom.dispatchEvent(dragEvent);
                }*/
        if (dropTarget && dropTarget != null /*&& dropTarget != this.draggedFrom*/)
        {
            let dropEvent = new CustomEvent("dragdrop",
                                            {
                                                bubbles: true,
                                                detail: {
                                                    data: this.dropData,
                                                    element: this.el,
                                                    drag: this
                                                }
                                            });
            dropTarget.dispatchEvent(dropEvent);
        }
        this.wasDragDrop = false;
    }

    return (false);
};

Drag.prototype.cloneNode = function (nodeFrom)
{
    if (!nodeFrom)
    {
        return (null);
    }

    let replacer = nodeFrom.cloneNode(false);

    if (replacer && replacer.tagName && typeof replacer.tagName === "string")
    {
        if (replacer.tagName.toLowerCase() === "input" || replacer.tagName.toLowerCase() === "button")
        {
            replacer.readOnly = true;
        }
        let cStyle = document.defaultView.getComputedStyle(nodeFrom);
        for (let prop in cStyle)
        {
            if (cStyle[prop] && cStyle[prop] !== "" && typeof cStyle[prop] !== "function")
            {
                replacer.style[prop] = cStyle[prop];
            }
        }
    }

    for (let i = 0; i < nodeFrom.childNodes.length; i++)
    {
        let ch = nodeFrom.childNodes[i];
        let newChild = this.cloneNode(ch);
        if (newChild)
        {
            replacer.appendChild(newChild);
        }
        else
        {
            break;
        }
    }

    return (replacer);
};

Drag.prototype.stopDrag = function (callback)
{
    this.endDrag({dummy: 0});
    U.removeListener(this.elEv, "mousedown touchstart mouseup touchend", "drag");

    if (this.replacedCopy && this.replacedCopy != null)
    {

        let self = this;
        this.moveTo(this.el, this.replacedCopy, function ()
        {
            self.el.parentNode.removeChild(self.el);
            self.replacedCopy.parentNode.insertBefore(self.el, self.replacedCopy);
            self.replacedCopy.parentNode.removeChild(self.replacedCopy);
            self.el.style = self.savedStyle;
            if (callback)
            {
                callback();
            }
        });
    }
    else
    {
        this.el.style = this.savedStyle;
        if (callback)
        {
            callback();
        }
    }
};

Drag.prototype.resumeDrag = function ()
{
    Drag.call(this, this.el, this.elEv, this.dragClass, this.dropData);
};

Drag.prototype.moveBack = function ()
{
    if (!this.createReplacer)
    {
        console.log("old position not saved, cannot move back");
        return;
    }
    this.moveTo(this.el, this.replacedCopy);
};
Drag.prototype.moveTo = function (el, refEl, callback)
{
    if (!el || el == null)
    {
        el = this.el;
    }
    if (!refEl || refEl == null)
    {
        refEl = document.body;
    }

    let destCoords = U.getOffset(refEl);

    let coords = U.getOffset(el);
    let dx = (destCoords.left - coords.left) / 50;
    let dy = (destCoords.top - coords.top) / 50;

    this.slowMove(destCoords.left, destCoords.top, dx, dy, el, callback);
};

Drag.prototype.getOldElement = function ()
{
    return (this.replacedCopy);
};
Drag.prototype.slowMove = function (dstX, dstY, dx, dy, el, callback)
{
    let self = this;

    let coords = U.getOffset(el);

    if (!dx) dx = 10000;
    if (!dy) dy = 10000;

    let currentDistanceX = Math.abs(dstX > coords.left ? dstX - coords.left : coords.left - dstX);
    let currentDistanceY = Math.abs(dstY > coords.top ? dstY - coords.top : coords.top - dstY);

    let newDistanceX = Math.abs(dstX > (coords.left + dx) ? dstX - coords.left - dx : coords.left + dx - dstX);
    let newDistanceY = Math.abs(dstY > (coords.top + dy) ? dstY - coords.top - dy : coords.top + dy - dstY);


    let styleTop = parseFloat(el.style.top);
    let styleLeft = parseFloat(el.style.left);

    if (isNaN(styleTop)) styleTop = 0;
    if (isNaN(styleLeft)) styleLeft = 0;
    styleTop += dy;
    styleLeft += dx;

    //console.log("New top="+styleTop+", new left="+styleLeft);

    if (newDistanceX > currentDistanceX)
    {
        styleLeft = dstX;
    }
    if (newDistanceY > currentDistanceY)
    {
        styleTop = dstY;
    }

    el.style.top = styleTop + "px";
    el.style.left = styleLeft + "px";

    if (styleTop !== dstY && styleLeft !== dstX)
    {
        setTimeout(function ()
                   {
                       self.slowMove(dstX, dstY, dx, dy, el, callback)
                   }, 1);
    }
    else
    {
        //console.log("Move done");
        if (callback && callback != null)
        {
            callback();
        }
    }
};

/*
Drag.prototype.getOffset = function (el)
{

    let nodeRect = el.getBoundingClientRect();

    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    let nodeTop = nodeRect.top + scrollTop;
    let nodeLeft = nodeRect.left + scrollLeft;
    return {top: nodeTop, left: nodeLeft}
};
*/

Drag.prototype.getSizingCorrection = function (elBoxSizing)
{

    if (!Drag.prototype.boxSizingCorrection)
    {
        Drag.prototype.boxSizingCorrection = [];

        let boxSizing = ["border-box", "padding-box", "content-box"];

        for (let i = 0; i < boxSizing.length; i++)
        {
            let div = document.createElement("div");
            div.style.opacity = "0";
            div.style.position = "absolute";
            div.style.top = "-10";
            div.style.width = "10px";
            div.style.borderWidth = "7px";
            div.style.padding = "3px";


            div.style.boxSizing = boxSizing[i];
            document.body.appendChild(div);

            let style = getComputedStyle(div);

            // let rect = div.getBoundingClientRect();
            // console.log(boxSizing[i] + ") style: " + style.width + ", rect: " + rect.width + ", offset: " + div.offsetWidth);
            if (parseInt(style.width) !== 10)
            {
                this.boxSizingCorrection.push(boxSizing[i]);
            }
            else
            {
            }
            document.body.removeChild(div);
        }
        //console.log("Correction for: " + Drag.prototype.boxSizingCorrection);
    }

    if (elBoxSizing && Drag.prototype.boxSizingCorrection.indexOf(elBoxSizing) >= 0)
    {
        return (true);
    }
    return (false);
};



