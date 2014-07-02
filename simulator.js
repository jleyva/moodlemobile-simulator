window.MOODLE_MOBILE_SIMULATOR = 1;

var MMS = {

    devices: {
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
    },

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
        MMS.sites = sites;
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
        $("#site").selectmenu({width: "120px"});
        $.each(sites, function(index, settings) {
            site.append($("<option />").val(index).text(settings.name));
        });
        $("#site").selectmenu("destroy").selectmenu({width: "120px"});

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
        MMS.loadPopupForm(fields, "newapp-", MMS.addApp);
    },

    addSite: function() {

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


    addApp: function() {

        var name = $("#newapp-name").val();
        var url = $("#newapp-url").val();

        apps = localStorage.getItem('mms-apps');
        if (!apps) {
            apps = [];
        } else {
            apps = JSON.parse(apps);
        }
        apps.push({
            name: name,
            url: url
        });
        localStorage.setItem("mms-apps", JSON.stringify(apps));
        MMS.loadApps();
    },

    /**
     * Load apps in the settings section
     */
    loadApps: function() {

        // Loading sites and apps.
        apps = localStorage.getItem('mms-apps');
        if (!apps) {
            apps = [];
        } else {
            apps = JSON.parse(apps);
        }

        MMS.loadAppsList(apps);
        MMS.loadAppsSelector(apps);
        return apps;
    },

    loadAppsList: function(apps) {
        var appList = '';
        $.each(apps, function(i, s) {
            appList += '<li> ' + s.name + ' <a data-appid="' + i + '" href="#" title="Delete this app"><span class="ui-icon ui-icon-circle-close"></span></a></li>';
        });

        $("#tabs-apps ul").empty().append(appList);
    },

    loadAppsSelector: function(sites) {
        var app = $("#app").empty();
        $("#app").selectmenu({width: "120px"});

        $.each(apps, function(index, settings) {
            app.append($("<option />").val(settings.url).text(settings.name));
        });
        $("#app").selectmenu("destroy").selectmenu({width: "120px"});

    },

    deleteApp: function(index) {
        apps = localStorage.getItem('mms-apps');
        if (apps) {
            apps = JSON.parse(apps);
            console.log(index);
            apps.splice(index, 1);
            localStorage.setItem("mms-apps", JSON.stringify(apps));
        }
        // Reload apps.
        MMS.loadApps();
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

    resetApp: function(e) {
        var appURL = $("#app").val().replace("/index.html", "");
        MMS.iframe.attr("src", appURL + "/reset.html");
    },

    launchApp: function(e) {
        var sel = $("#device").val();
        $("#viewport-container").css("width", MMS.devices[sel].width).css("height", MMS.devices[sel].height);
        $("#device-container").css("width", MMS.devices[sel].width + 40);

        // Force reset of local database/storage.

        var appURL = $("#app").val().replace("/index.html", "");
        MMS.iframe.attr("src", appURL + "/index.html");

        MMS.iframe.load(function() {
            var data;

            var fd = MMS.iframe[0].contentWindow;
            var doc = fd.document;
            var siteId = $("#site").val();

            if (MMS.sites[siteId]) {
                data = MMS.sites[siteId];

                setTimeout(function() {
                    $('#url', doc).val(data.url);
                    $('#username', doc).val(data.username);
                    $('#password', doc).val(data.password);
                    if ($("#disable-extended").prop('checked')) {
                        fd.MMS.config.wsextservice = "";
                    }
                }, 1500);
            }
        });
    },

    init: function() {

        // Styles code.
        MMS.loadUI();

        // Attach handlers.

        MMS.iframe = $("#moodle-site");

        var sites = MMS.loadSites();
        var apps = MMS.loadApps();

        var versions = {
            master_dev: "http://prototype.moodle.net/mobile/app/master",
            v143: "http://prototype.moodle.net/mobile/app/v143",
            mock: "http://prototype.moodle.net/mobile/app/mock",
            local_path: ""
        };
        var device = $("#device");

        var iframe = $("#moodle-site");
        var site = $("#site");
        var head, doc, intervalCSS;

        $("#run").on("click", MMS.launchApp);
        $("#reset").on("click", MMS.resetApp);

        $("#rotate").on("click", function(e) {
            var sel = device.val();
            if (viewport.width() != devices[sel].width) {
                viewport.css("width", devices[sel].width).css("height", devices[sel].height);
                $("#device-container").css("width", devices[sel].width + 40);
            } else {
                viewport.css("width", devices[sel].height).css("height", devices[sel].width);
                $("#device-container").css("width", devices[sel].height + 40);
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

        $.each(MMS.devices, function(name, settings) {
            device.append($("<option />").val(name).text(name));
        });
        device.selectmenu("refresh");


        var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

        if (!isChrome && !isSafari) {
            window.alert("You should run this emulator in a WebKit browser (Chrome or Safari)");
        }

        // Load sites in the settings widget.
        MMS.loadSitesList(sites);
        MMS.loadAppsList(apps);

        // Handlers.
        $("#tabs-sites").on("click", "a", function() {
            MMS.deleteSite($(this).data("siteid"));
        });
        $("#tabs-apps").on("click", "a", function() {
            MMS.deleteApp($(this).data("appid"));
        });

        $("#add-site").on("click", MMS.displayAddSiteForm);

        $("#add-app").on("click", MMS.displayAddAppForm);


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

