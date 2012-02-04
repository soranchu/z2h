// SAMPLE
this.manifest = {
    "name": "さよなら全角英数",
    "icon": "../../res/icon_48.png",
    "settings": [
        {
            "tab": i18n.get("details"),
            "group": i18n.get("about"),
            "name": "about",
            "type": "description",
            "text": i18n.get("about_text")
        },
        {
            "tab": i18n.get("details"),
            "group": i18n.get("replace"),
            "name": "replace_alpha",
            "type": "checkbox",
            "label": i18n.get("replace_alpha")
        },
        {
            "tab": i18n.get("details"),
            "group": i18n.get("replace"),
            "name": "replace_num",
            "type": "checkbox",
            "label": i18n.get("replace_num")
        },
        {
            "tab": i18n.get("details"),
            "group": i18n.get("replace"),
            "name": "replace_space",
            "type": "checkbox",
            "label": i18n.get("replace_space")
        },
        {
            "tab": i18n.get("details"),
            "group": i18n.get("replace"),
            "name": "replace_sym",
            "type": "checkbox",
            "label": i18n.get("replace_sym")
        },
        {
            "tab": i18n.get("details"),
            "group": i18n.get("replace"),
            "name": "replace_tilde",
            "type": "checkbox",
            "label": i18n.get("replace_tilde")
        }
    ]
};
