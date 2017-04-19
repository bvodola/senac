import { Leads } from '../imports/api/leads.js';

FlowRouter.route('/', {
    action: function(params, queryParams) {

            // Defines the utm_source value
            if(typeof queryParams.gclid !== "undefined") {
                Cookie.set('utm_source', 'adwords', { expires: 30 });
            }
            else {

                if(typeof queryParams.utm_source !== "undefined") {

                    Cookie.set('utm_source', queryParams.utm_source, { expires: 30 });

                    // If CityAds is the source, sets the specific cityads_click_id Cookie
                    if(Cookie.get('utm_source') == 'cityads') {
                        Cookie.set('cityads_click_id', queryParams.click_id, { expires: 30 });
                    }
                }
            }

        // Renders the Layout
        BlazeLayout.render("main", { content: "courseSearch"});
    }
});

FlowRouter.route('/lead/:leadId', {
    action: function(params, queryParams) {
        BlazeLayout.render("main", { content: "secondaryForm"});
    }
});

// ************
// Admin Routes
// ************

FlowRouter.route('/admin', {
    action: function() {
        BlazeLayout.render("admin", { adminContent: "editCourses" });
    }
});

FlowRouter.route('/addCourse', {
    action: function() {
        BlazeLayout.render("admin", { adminContent: "addCourse" });
    }
});

FlowRouter.route('/editCourses', {
    action: function() {
        BlazeLayout.render("admin", { adminContent: "editCourses" });
    }
});

FlowRouter.route('/editUnits', {
    action: function() {
        BlazeLayout.render("admin", { adminContent: "editUnits" });
    }
});

FlowRouter.route('/editCategories', {
    action: function() {
        BlazeLayout.render("admin", { adminContent: "editCategories" });
    }
});

FlowRouter.route('/leads', {
    action: function() {
        BlazeLayout.render("admin", { adminContent: "leads" });
    }
});

// ===================================
// Enter and Exit Functions for Routes
// ===================================

FlowRouter.triggers.enter( [ enterFunction ] );
FlowRouter.triggers.exit( [ exitFunction ] );

function enterFunction() {
    $('body').prepend("<noscript id='gtmnoscript'><iframe src=\"//www.googletagmanager.com/ns.html?id=GTM-WNMDBX\" height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe></noscript><script id='gtmscript'>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WNMDBX');</script>")
}

function exitFunction() {
    $('#gtmnoscript').remove();
    $('#gtmscript').remove();
}
