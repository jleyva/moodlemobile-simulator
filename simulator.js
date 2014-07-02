window.MOODLE_MOBILE_SIMULATOR = 1;

var MMS = {

    error: function(m) {
        window.alert(m);
    },

    getApp: function() {
        var iframe = $("#moodle-site");

        if (!iframe[0] || !iframe[0].contentWindow || !iframe[0].contentWindow.MM) {
            return false;
        }
        return iframe[0].contentWindow.MM;
    },

    loadAppTemplates: function() {
        var app = MMS.getApp();

        if (!app) {
            MMS.error("App not launched or loaded");
            return;
        }

        var templates = "";

        for (var el in app.config.plugins) {
            var index = app.config.plugins[el];
            var plugin = app.plugins[index];
            if (typeof plugin == 'undefined') {
                continue;
            }
            if (plugin.templates) {
                $.each(plugin.templates, function(tpl, val){
                    var el = index + "/" + tpl;
                    templates += '<option value="' + el + '">' + el + '</option>';
                });
            }
        }
        $("#app-templates").empty().html(templates);
    },

    loadTemplate: function(val) {
        var app = MMS.getApp();
        if (!app) {
            MMS.error("App not launched or loaded");
            return;
        }

        var els = val.split("/");

        $("#template-text").val(app.plugins[els[0]].templates[els[1]].html);
    },

    modifyTemplate: function(val) {
        var app = MMS.getApp();
        if (!app) {
            MMS.error("App not launched or loaded");
            return;
        }

        var els = val.split("/");
        app.plugins[els[0]].templates[els[1]].html = $("#template-text").val();
    },

    loadPopupForm: function(fields, prefix, callBack) {
        var form ="<form> \
        <fieldset>";

        $.each(fields, function(i,f) {
            form += '<div><label for="' + prefix + i + '">' + i + '</label> \
            <input type="' + f + '" id="' + prefix + i + '" class="text ui-widget-content ui-corner-all"></div>';
        });

        form += "</fieldset> \
          </form>";
        var dialog = $("#add-form").html(form).dialog(
            {
                modal: true,
                buttons: {
                    "Add": function() {
                        callBack();
                        dialog.dialog("close");
                    },
                    "Close": function() {
                        dialog.dialog("close");
                    }
                }
            }
        );
    },

    /**
     * Load sites in the settings section
     */
    loadSites: function() {

        // Loading sites and apps.
        sites = localStorage.getItem('mms-sites');
        if (!sites) {
            sites = [];
            sites.push(
                {
                    name: "Moodle School Demo",
                    url: "http://school.moodle.net",
                    username: "student",
                    password: "moodle",
                }
            );
        } else {
            sites = JSON.parse(sites);
        }

        MMS.loadSitesList(sites);
        MMS.loadSitesSelector(sites);
        return sites;
    },

    loadSitesList: function(sites) {
        var siteList = '';
        $.each(sites, function(i, s) {
            siteList += '<li> ' + s.name + ' <a data-siteid="' + i + '" href="#" title="Delete this site"><span class="ui-icon ui-icon-circle-close"></span></a></li>';
        });

        $("#tabs-sites ul").empty().append(siteList);
    },

    loadSitesSelector: function(sites) {
        var site = $("#site").empty();
        $.each(sites, function(index, settings) {
            site.append($("<option />").val(index).text(settings.name));
        });
        $("#site").selectmenu("refresh");
    },

    deleteSite: function(index) {
        sites = localStorage.getItem('mms-sites');
        if (sites) {
            sites = JSON.parse(sites);
            console.log(index);
            sites.splice(index, 1);
            localStorage.setItem("mms-sites", JSON.stringify(sites));
        }
        // Reload sites.
        MMS.loadSites();
    },

    displayAddSiteForm: function() {
        var fields = {
            name: "text",
            url: "text",
            username: "text",
            password: "text"
        };
        MMS.loadPopupForm(fields, "newsite-", MMS.addSite);
    },

    displayAddAppForm: function() {
        var fields = {
            name: "text",
            url: "text"
        };
        MMS.loadPopupForm(fields, "newapp-", "mms-apps");
    },

    addSite: function(name, url, username, password) {

        var name = $("#newsite-name").val();
        var url = $("#newsite-url").val();
        var username = $("#newsite-username").val();
        var password = $("#newsite-password").val();

        sites = localStorage.getItem('mms-sites');
        if (!sites) {
            sites = [];
        } else {
            sites = JSON.parse(sites);
        }
        sites.push({
            name: name,
            url: url,
            username: username,
            password: password
        });
        localStorage.setItem("mms-sites", JSON.stringify(sites));
        MMS.loadSites();
    },

    /**
     * Load jQuery UI widgets
     */
    loadUI: function() {
        $( "input[type=submit], input[type=button], button" ).button();
        $("select").selectmenu({ width: 120 });
        $("#options-menu").accordion(
            {
              heightStyle: "fill"
            }
        );
        $("#setting-tabs").tabs();
        $(document).tooltip();
    },

    init: function() {

        // Styles code.
        MMS.loadUI();

        var sites = MMS.loadSites();

        var devices = {
            iPhone4: {
                width: 320,
                height: 480
            },
            iPhone5: {
                width: 320,
                height: 568
            },
            iPad3: {
                width: 768,
                height: 1024
            },
            Nexus4: {
                width: 384,
                height: 640
            },
            Nexus7: {
                width: 800,
                height: 1280
            },
        };
        var versions = {
            master_dev: "http://prototype.moodle.net/mobile/app/master",
            v143: "http://prototype.moodle.net/mobile/app/v143",
            mock: "http://prototype.moodle.net/mobile/app/mock",
            local_path: ""
        };
        var device = $("#device");
        var container = $("#device-container");
        var viewport = $("#viewport-container");
        var iframe = $("#moodle-site");
        var site = $("#site");
        var head, doc, intervalCSS;

        $("#run").on("click", function(e) {
            var sel = device.val();
            viewport.css("width", devices[sel].width).css("height", devices[sel].height);
            container.css("width", devices[sel].width + 40);
            // Force reset of local database/storage.
            if (version.val() == "local_path") {
                iframe.attr("src", $("#local_path").val() + "/index.html");
            } else {
                iframe.attr("src", versions[version.val()] + "/index.html");
            }
            iframe.load(function() {
                var data;

                var fd = iframe[0].contentWindow;
                var doc = fd.document;
                var siteId = site.val();
                data = sites[siteId];

                setTimeout(function() {
                    $('#url', doc).val(data.url);
                    $('#username', doc).val(data.username);
                    $('#password', doc).val(data.password);
                    if ($("#disable-extended").prop('checked')) {
                        fd.MM.config.wsextservice = "";
                    }
                }, 2000);
            });
        });

        $("#rotate").on("click", function(e) {
            var sel = device.val();
            if (viewport.width() != devices[sel].width) {
                viewport.css("width", devices[sel].width).css("height", devices[sel].height);
                container.css("width", devices[sel].width + 40);
            } else {
                viewport.css("width", devices[sel].height).css("height", devices[sel].width);
                container.css("width", devices[sel].height + 40);
            }
        });

        $("#disable-extended").on("click", function(e) {
            var fd = iframe[0].contentWindow;
            if (fd.MM && fd.MM.config) {
                if ($("#disable-extended").prop('checked')) {
                    fd.MM.config.wsextservice = "";
                } else {
                    fd.MM.config.wsextservice = "local_mobile";
                }
            }
        });

        $("#force-offline").on("click", function(e) {
            var fd = iframe[0].contentWindow;
            if (fd.MM) {
                if ($(this).prop('checked')) {
                    $("#device-status").html('<span style="color: red">OFFLINE</span>');
                    fd.MM.setConfig('dev_offline', true);
                } else {
                    $("#device-status").html("");
                    fd.MM.setConfig('dev_offline', false);
                }
            }
        });

        function injectCSS() {
            var exits;
            var cssURL = $('#css-url').val();
            exists = $('#emulator-css-url', head);
            if (exists) {
                exists.remove();
            }
            if (cssURL) {
                // Avoid cache.
                cssURL += '?v=' + Math.random();
                head.append($('<link>').attr('id', 'emulator-css-url').attr('rel', 'stylesheet').attr('href', cssURL));
            }

            var css = $('#css-text').val();
            exists = $('#emulator-css-text', head);
            if (exists) {
                exists.remove();
            }
            if (css) {
                head.append($("<style></style>").attr('id', 'emulator-css-text').html(css));
            }
        }

        $("#inject-css").on("click", function(e) {
            doc = iframe[0].contentWindow.document;
            head = $('head',doc);
            $("#log").html("CSS injection started... every 15 secs CSS is reloaded");

            injectCSS();
            intervalCSS = setInterval(function() { injectCSS(); }, 15000);
        });

        $("#stop-inject-css").on("click", function(e) {
            clearInterval(intervalCSS);
            $("#log").html("CSS injection stopped");
        });

        $("#reset-css").on("click", function(e) {
            var doc = iframe[0].contentWindow.document;
            var head = $('head',doc);
            var exists;

            var cssURL = $('#css-url').val();
            exists = $('#emulator-css-url', head);
            if (exists) {
                exists.remove();
            }

            var css = $('#css-text').val();
            exists = $('#emulator-css-text', head);
            if (exists) {
                exists.remove();
            }
        });

        $.each(devices, function(name, settings) {
            device.append($("<option />").val(name).text(name));
        });

        var version = $("#version");
        $.each(versions, function(name, settings) {
            version.append($("<option />").val(name).text(name));
        });

        var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

        if (!isChrome && !isSafari) {
            window.alert("You should run this emulator in a WebKit browser (Chrome or Safari)");
        }

        // Load sites in the settings widget.
        MMS.loadSitesList(sites);

        // Handlers.
        $("#tabs-sites").on("click", "a", function() {
            MMS.deleteSite($(this).data("siteid"));
        });

        $("#add-site").on("click", function() {
            MMS.displayAddSiteForm();
        });

        $("#add-app").on("click", function() {
            MMS.displayAddAppForm();
        });


        var currentTemplate = "";
        $("#load-templates").on("click", MMS.loadAppTemplates);
        $("#app-templates").selectmenu(
        {
            change: function( event, data ) {
                currentTemplate = data.item.value;
                MMS.loadTemplate(currentTemplate);
           }
        });
        $("#modify-template").on("click", function() {
            MMS.modifyTemplate(currentTemplate);
        });
    }

};

$(document).ready(function(){
    MMS.init();
});

