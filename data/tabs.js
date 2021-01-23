

function Tabs(container)
{
    let self = this;

    this.container = U.getEl(container);

    if (this.container == null)
    {
        throw("Container not found: " + container);
    }

    this.menu = this.container.querySelector(".tabsMenu");
    if (this.menu == null)
    {
        throw("Menu not found");
    }

    this.mainView = this.container.querySelector(".tabsMainView");
    if (this.mainView == null)
    {
        throw("Main View not found: ");
    }

    this.tabs = this.menu.querySelectorAll(".tab");
    for (let i = 0; i < this.tabs.length; i++)
    {
        let tab = this.tabs[i];
        U.addListener(tab, "click", function (e)
        {
            let tab = e.currentTarget;
            self.showTab(tab);
        });
    }
    this.showTab(0);
}

Tabs.prototype.showTab = function (tabToShow)
{

    if (typeof tabToShow == "number")
    {
        tabToShow = this.tabs[tabToShow];
    }

    if (!tabToShow) return;

    for (let i = 0; i < this.tabs.length; i++)
    {
        let tab = this.tabs[i];
        if (tab !== tabToShow)
        {
            U.removeClass(tab, "selected");
            let viewDiv = tab.getAttribute("relatedTab");
            if (viewDiv && U.getEl("#" + viewDiv))
            {
                let viewDivEl = U.getEl("#" + viewDiv);
                if (viewDivEl) U.removeClass(viewDivEl, "selected");
            }
        }
    }
    let viewDiv = tabToShow.getAttribute("relatedTab");
    if (viewDiv && U.getEl("#" + viewDiv))
    {
        let viewDivEl = U.getEl("#" + viewDiv);
        if (viewDivEl) U.addClass(viewDivEl, "selected");
    }

    U.addClass(tabToShow, "selected");
};

