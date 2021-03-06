define(["dialogHelper", "layoutManager", "scrollHelper", "globalize", "dom", "require", "material-icons", "emby-button", "paper-icon-button-light", "emby-input", "formDialogStyle"], function(dialogHelper, layoutManager, scrollHelper, globalize, dom, require) {
    "use strict";

    function setInputProperties(dlg, options) {
        var txtInput = dlg.querySelector("#txtInput");
        txtInput.label ? txtInput.label(options.label || "") : txtInput.setAttribute("label", options.label || ""), txtInput.value = options.value || ""
    }

    function showDialog(options, template) {
        var dialogOptions = {
            removeOnClose: !0,
            scrollY: !1
        };
        layoutManager.tv && (dialogOptions.size = "fullscreen");
        var dlg = dialogHelper.createDialog(dialogOptions);
        dlg.classList.add("formDialog"), dlg.innerHTML = globalize.translateHtml(template, "sharedcomponents"), layoutManager.tv ? scrollHelper.centerFocus.on(dlg.querySelector(".formDialogContent"), !1) : (dlg.querySelector(".dialogContentInner").classList.add("dialogContentInner-mini"), dlg.classList.add("dialog-fullscreen-lowres")), dlg.querySelector(".btnCancel").addEventListener("click", function(e) {
            dialogHelper.close(dlg)
        }), dlg.querySelector(".formDialogHeaderTitle").innerHTML = options.title || "", options.description ? dlg.querySelector(".fieldDescription").innerHTML = options.description : dlg.querySelector(".fieldDescription").classList.add("hide"), setInputProperties(dlg, options);
        var submitValue;
        return dlg.querySelector("form").addEventListener("submit", function(e) {
            return submitValue = dlg.querySelector("#txtInput").value, e.preventDefault(), e.stopPropagation(), setTimeout(function() {
                dialogHelper.close(dlg)
            }, 300), !1
        }), dlg.querySelector(".submitText").innerHTML = options.confirmText || globalize.translate("sharedcomponents#ButtonOk"), dlg.style.minWidth = Math.min(400, dom.getWindowSize().innerWidth - 50) + "px", dialogHelper.open(dlg).then(function() {
            layoutManager.tv && scrollHelper.centerFocus.off(dlg.querySelector(".formDialogContent"), !1);
            var value = submitValue;
            return value || Promise.reject()
        })
    }
    return function(options) {
        return new Promise(function(resolve, reject) {
            require(["text!./prompt.template.html"], function(template) {
                "string" == typeof options && (options = {
                    title: "",
                    text: options
                }), showDialog(options, template).then(resolve, reject)
            })
        })
    }
});