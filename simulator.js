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


    getAppDocument: function() {
        var iframe = $("#moodle-site");

        if (!iframe[0] || !iframe[0].contentWindow || !iframe[0].contentWindow.document) {
            return false;
        }
        return iframe[0].contentWindow.document;
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
        } else {
            sites = JSON.parse(sites);
        }

        if (MMS.config.sites.length > 0) {
            sites = sites.concat(MMS.config.sites);
        }

        MMS.loadSitesList(sites);
        MMS.loadSitesSelector(sites);
        MMS.sites = sites;
        return sites;
    },

    loadSitesList: function(sites) {
        var siteList = '';
        $.each(sites, function(i, s) {
            if (typeof(s.deleteable) == "undefined" || s.deleteable) {
                deleteLink = '<a data-siteid="' + i + '" href="#" title="Delete this site"><span class="ui-icon ui-icon-circle-close"></span></a>';
            } else {
                deleteLink = "";
            }
            siteList += '<li> ' + s.name + deleteLink + ' </li>';
        });

        $("#tabs-sites ul").empty().append(siteList);
    },

    loadSitesSelector: function(sites) {
        var site = $("#site").empty();
        $("#site").selectmenu({width: "120px"});
        $.each(sites, function(index, settings) {
            if (settings && settings.name) {
                site.append($("<option />").val(index).text(settings.name));
            }
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

        if (MMS.config.apps.length > 0) {
            apps = apps.concat(MMS.config.apps);
        }

        MMS.loadAppsList(apps);
        MMS.loadAppsSelector(apps);

        MMS.apps = apps;
        return apps;
    },

    loadAppsList: function(apps) {
        var appList = '';
        $.each(apps, function(i, s) {
            if (typeof(s.deleteable) == "undefined" || s.deleteable) {
                deleteLink = ' <a data-appid="' + i + '" href="#" title="Delete this app"><span class="ui-icon ui-icon-circle-close"></span></a>';
            } else {
                deleteLink = "";
            }
            appList += '<li> ' + s.name + deleteLink + '</li>';
        });

        $("#tabs-apps ul").empty().append(appList);
    },

    loadAppsSelector: function(sites) {
        var app = $("#app").empty();
        $("#app").selectmenu({width: "120px"});

        $.each(apps, function(index, settings) {
            if (settings && settings.name) {
                app.append($("<option />").val(settings.url).text(settings.name));
            }
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

        // Load devices
        var device = $("#device");
        $.each(MMS.devices, function(name, settings) {
            device.append($("<option />").val(name).text(name));
        });

        $( "input[type=submit], input[type=button], button" ).button();
        $("select").selectmenu({ width: 120 });
        $("#options-menu").accordion(
            {
              heightStyle: "fill"
            }
        );
        $("#setting-tabs").tabs();
        $(document).tooltip();

        // Load sites in the settings widget.
        MMS.loadSitesList(MMS.sites);
        MMS.loadAppsList(MMS.apps);
    },

    resetApp: function(e) {
        var appURL = $("#app").val().replace("/index.html", "");
        MMS.iframe.attr("src", appURL + "/reset.html");
    },

    resetCSS: function(e) {
        var doc = MMS.getAppDocument();

        if(!doc) {
            MMS.error("App not launched or loaded");
            return;
        }

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
    },

    _replaceLogFunction: function() {
        var app = MMS.getApp();

        var originalRemoveMethod = app.log;

        app.log = function(text, component) {
            var show = true;

            if (!component) {
                component = "Core";
            }

            var cFilter = $("#component-filter").val().toLowerCase();
            var tFilter = $("#text-filter").val().toLowerCase();

            if (cFilter && component.toLowerCase().indexOf(cFilter) === -1) {
                show = false;
            }

            if (show && tFilter && text.toLowerCase().indexOf(tFilter) === -1) {
                show = false;
            }

            if (show) {
                $("#log").prepend(component + ": " + text + "<br /><br />");
            }

            // Execute the original method.
            originalRemoveMethod.apply( this, arguments );
        };
    },

    cleanLog: function(e) {
        e.preventDefault();
        $("#log").empty();
        $("#component-filter").val("");
        $("#text-filter").val("");
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

                MMS._replaceLogFunction();
            }
        });
    },

    rotate: function(e) {
        var sel = $("#device").val();
        var viewport = $("#viewport-container");

        if (viewport.width() != MMS.devices[sel].width) {
            viewport.css("width", MMS.devices[sel].width).css("height", MMS.devices[sel].height);
            $("#device-container").css("width", MMS.devices[sel].width + 40);
        } else {
            viewport.css("width", MMS.devices[sel].height).css("height", MMS.devices[sel].width);
            $("#device-container").css("width", MMS.devices[sel].height + 40);
        }
    },

    forceOffline: function(e) {
        var app = MMS.getApp();

        if(!app) {
            e.preventDefault();
            MMS.error("App not launched or loaded");
            return;
        }

        if ($(this).prop('checked')) {
            $("#device-status").html('<span style="color: red">OFFLINE</span>');
            app.setConfig('dev_offline', true);
        } else {
            $("#device-status").html("");
            app.setConfig('dev_offline', false);
        }

    },

    disableExtendedFeatures: function(e) {
        var app = MMS.getApp();
        if (app && app.config) {
            if ($("#disable-extended").prop('checked')) {
                app.config.wsextservice = "";
            } else {
                app.config.wsextservice = "local_mobile";
            }
        } else {
            e.preventDefault();
            MMS.error("App not launched or loaded");
        }
    },

    injectCSS: function() {
        var doc = MMS.getAppDocument();
        var exits;

        if(!doc) {
            MMS.error("App not launched or loaded");
            return;
        }

        var head = $('head', doc);

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
    },

    calculateSpaceUsage: function() {
        var app = MMS.getApp();

        if(!app) {
            MMS.error("App not launched or loaded");
            return;
        }

        app.fs.directorySize("/",
            function(size) {
                window.alert(app.util.bytesToSize(size, 2));
            },
            function() {
                MMS.error("Error calculating directory size");
            }
        );
    },

    sendPushNotification: function() {
        var app = MMS.getApp();

        if(!app) {
            MMS.error("App not launched or loaded");
            return;
        }

        data = JSON.parse($("#payload-notification").val());
        data.date = app.util.timestamp();
        data.site = app.config.current_site.id;

        app.plugins.notifications.APNSsaveAndDisplay(data);
    },

    attachHandlers: function() {
        $("#run").on("click", MMS.launchApp);
        $("#reset").on("click", MMS.resetApp);

        $("#tabs-sites").on("click", "a", function() {
            MMS.deleteSite($(this).data("siteid"));
        });
        $("#tabs-apps").on("click", "a", function() {
            MMS.deleteApp($(this).data("appid"));
        });

        $("#add-site").on("click", MMS.displayAddSiteForm);

        $("#add-app").on("click", MMS.displayAddAppForm);

        MMS.currentTemplate = "";
        $("#load-templates").on("click", MMS.loadAppTemplates);
        $("#app-templates").selectmenu(
        {
            change: function( event, data ) {
                MMS.currentTemplate = data.item.value;
                MMS.loadTemplate(MMS.currentTemplate);
           }
        });
        $("#modify-template").on("click", function() {
            MMS.modifyTemplate(MMS.currentTemplate);
        });

        $("#reset-css").on("click", MMS.resetCSS);

        $("#rotate").on("click", MMS.rotate);

        $("#force-offline").on("click", MMS.forceOffline);

        $("#disable-extended").on("click", MMS.disableExtendedFeatures);

        $("#inject-css").on("click", function(e) {
            MMS.injectCSS();
            MMS.intervalCSS = setInterval(function() { MMS.injectCSS(); }, 15000);
        });

        $("#stop-inject-css").on("click", function(e) {
            clearInterval(MMS.intervalCSS);
        });

        $("#calculate-space").on("click", MMS.calculateSpaceUsage);

        $("#send-push").on("click", MMS.sendPushNotification);

        $("#clean-log").on("click", MMS.cleanLog);
    },

    init: function() {
        // Load config file.
        $.ajax({
            type: 'GET',
            url: 'config.json',
            dataType: 'json',
            success: function(data) {
                MMS.config = data;
                // Load sites and apps from internal storage.
                MMS.loadSites();
                MMS.loadApps();

                // Load the UI and enhace it with jQuery UI.
                MMS.loadUI();

                MMS.iframe = $("#moodle-site");

                // Attach handlers to buttons.
                MMS.attachHandlers();
            }
        });
    }

};

var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

if (!isChrome && !isSafari) {
    window.alert("You should run this emulator in a WebKit browser (Chrome or Safari)");
}

$(document).ready(function(){
    MMS.init();
});

