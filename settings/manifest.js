this.manifest = {
    "name": "さよなら全角英数",
    "icon": "../res/icon_48.png",
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
            "group": i18n.get("about"),
            "name": "updates",
            "type": "description",
            "text": i18n.get("updates_text")
        },

        {
            "tab": i18n.get("details"),
            "group": i18n.get("replace"),
            "name": "replace_about",
            "type": "description",
            "text": i18n.get("replace_about_text")
        },
        {
            "tab": i18n.get("details"),
            "group": i18n.get("replace"),
            "name": "supportHttps",
            "type": "checkbox",
            "label": i18n.get("support_https")
        },
        {
            "tab": i18n.get("details"),
            "group": i18n.get("replace"),
            "name": "supportAjax",
            "type": "checkbox",
            "label": i18n.get("support_ajax")
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
            "name": "keepHeadingMBSpace",
            "type": "checkbox",
            "label": i18n.get("keep_heading_space")
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
            "group": i18n.get("ignore_settings"),
            "type": "description",
            "text": i18n.get("ignore_desc_text")
        },
        {
            "tab": i18n.get("details"),
            "group": i18n.get("ignore_settings"),
            "name": "ignorePages",
            "type": "multiText",
            "text": "www.example.com/path/to/ignore",
            "label": i18n.get("ignore_pages"),
            "withButton" : i18n.get("apply")
        },
        {
            "tab": i18n.get("details"),
            "group": i18n.get("ignore_settings"),
            "name": "ignoreDomains",
            "type": "multiText",
            "text": "www.example.com",
            "label": i18n.get("ignore_domains"),
            "withButton" : i18n.get("apply")
        }
    ]
};
