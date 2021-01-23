U.addListener(window, "load", main);

function main()
{
    console.log("Loaded, starting");
    let tabs = new Tabs("#tabsContainer");


    new Drag("#about", "#aboutTitleText", "dragging", null, false, false);
    new Resizer("#about", "resizingX", "resizingY", "resizingXY", true, true, true);

    let aboutCover = U.getEl("#aboutCover");
    U.addListener("#aboutButtons>img", "click", function ()
    {
        U.addClass(aboutCover, "hidden");
    });

    U.removeClass(aboutCover, "initial");
    U.addClass(aboutCover, "hidden");

    U.addListener("#mainFan", "dblclick touchstart", function ()
    {
        U.removeClass("#about", "hidden");
        U.removeClass(aboutCover, "hidden");
    });
    randomFanSpeed();



    // U.getEl("#save").scrollIntoView(false);

    let bottom = U.getEl("#bottom");
    if (bottom)
    {
        setTimeout(function ()
                   {
                       bottom.scrollIntoView(false);
                       bottom.parentElement.removeChild(bottom);
                   }, 300);
    }

}


let fan = null;
let newSpeed = 30;

function randomFanSpeed()
{
    //    let newSpeed = (Math.floor(Math.random() * Math.floor(101)));
    // setFanSpeed(newSpeed);
    // setTimeout(randomFanSpeed, 3000);

    if (!fan)
    {
        fan = new RotateFan("img#mainFan");
    }

    fan.setSpeed(newSpeed);
    setTimeout(randomFanSpeed, 250);

    newSpeed = newSpeed + 1;
    if (newSpeed > 100) newSpeed = 0;
}


function RotateFan(fan)
{
    let self = this;

    this.fan = fan;
    if (typeof fan == "string")
        this.fan = U.getEl(fan);
    this.currentAngle = 0;
    if (!this.fan)
    {
        console.log("Fan not found: " + fan);
        return;
    }

    this.stopped = false;

    document.addEventListener('visibilitychange', function ()
    {

        if (document.visibilityState === "visible")
        {
            if (!self.timingFoo)
            {
                self.stopped = false;
                self.setSpeed();
            }
        }
        else
        {
            if (self.timingFoo)
            {
                self.stopped = true;
                clearInterval(self.timingFoo);
                self.timingFoo = null;
            }
        }
    }, false);
    this.setSpeed(0);
}

RotateFan.prototype.setSpeed = function (percents)
{
    let self = this;

    if (!percents) percents = this.speed;

    //console.log("Speed set to " + percents);

    this.speed = percents;
    if (percents <= 0)
    {
        this.speed = 0;
    }
    if (percents > 100)
    {
        this.speed = 100;
    }

    if (!this.timingFoo && !this.stopped)
    {
        this.timingFoo = setInterval(function ()
                                     {
                                         self.fan.style.transform = "rotate(" + self.currentAngle + "deg)";

                                         self.currentAngle += self.speed / 20;
                                         if (self.currentAngle >= 360) self.currentAngle -= 360;
                                     }, 10);
    }
};







