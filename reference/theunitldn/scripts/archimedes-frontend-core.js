// Core frontend JS for Archimedes sites
// Copyright (c) 2011 Artlogic Media Limited - http://www.artlogic.net/


// prevent firebug errors
if (!window.console) {
    window.console = {
        log: function() {
            // do nothing...
        }
    };
}

(function($) {
    
    // Variable required to determine if the container has been hidden by the protected path.
    // Due to pageload the container needs to be set to visible again when navigating to another page otherwise the container is always set to hide.
    var container_hidden = false;
    var container_els = '#container > *:not(.header-fixed-wrapper, #header, #top_nav_section)';
    
    window.protected_paths_login_after = function() {};
    
    window.archimedes = {

        // please store all archimedes functions and vars
        // inside this object...

        archimedes_toolbar: {

            init: function() {
                $('#archimedes-toolbar-hide a').click(function() {
                    window.archimedes.archimedes_toolbar.hide();
                    $('#archimedes-toolbar')
                        .addClass('archimedes-toolbar-hidden')
                    ;
                    return false;
                });
                $('#archimedes-toolbar-hitarea')
                    .mouseover(function() {
                        $('#archimedes-toolbar-hitarea')
                            .clearQueue()
                            .delay(500)
                            .queue(function () {
                                window.archimedes.archimedes_toolbar.show();
                            });
                        ;
                    })
                    .mouseout(function() {
                        $('#archimedes-toolbar-hitarea').clearQueue();
                    })
                    .click(function() {
                        $('#archimedes-toolbar-hitarea').clearQueue();
                        window.archimedes.archimedes_toolbar.show();
                    })
                ;

                if (g.has_local_storage()) {
                    if (localStorage.getItem('archimedes-toolbar-display') == 'hidden') {
                        window.archimedes.archimedes_toolbar.hide(0);
                    }
                }

                $('#archimedes-toolbar-editpage a')
                    .each(function() {
                        var href = $(this).attr('href');
                        $(this).click(function() {
                        	var win_name = $(this).attr('id');
                            h.open_win({url: href, name: win_name, width: 1000, height: 670, scrollbars: true});
                            return false;
                        });
                    })
                    .attr('href', '#')
                    .removeAttr('target')
                ;

                $('#archimedes-toolbar-inactive')
                    .click(function() {
                        return false;
                    })
                ;
            },

            hide: function(speed) {
                var hideSpeed = 800;
                if (speed == 0) {
                    var hideSpeed = 0;
                }
                if (g.has_local_storage()) {
                    localStorage.setItem('archimedes-toolbar-display', 'hidden');
                }
                $('#archimedes-toolbar-inactive').css('display', 'block');
                $('#archimedes-toolbar-container')
                    .clearQueue()
                    .fadeTo(hideSpeed, 0, function() {
                        $(this).css('display', 'none');
                        $('#archimedes-toolbar-inactive').css('display', 'none');
                    })
                ;
                $('#archimedes-toolbar-faux')
                    .clearQueue()
                    .animate({height: 5}, hideSpeed)
                ;
                $('#archimedes-toolbar-hitarea')
                    .clearQueue()
                    .css('display', 'block')
                ;
            },

            show: function() {
                if (g.has_local_storage()) {
                    localStorage.setItem('archimedes-toolbar-display', 'visible');
                }
                $('#archimedes-toolbar-inactive').css('display', 'block');
                $('#archimedes-toolbar-container')
                    .css('display', 'block')
                    .fadeTo(800, 1, function() {
                        $('#archimedes-toolbar-inactive').css('display', 'none');
                    })
                ;
                $('#archimedes-toolbar-faux').animate({height: 41}, 500);
                $('#archimedes-toolbar-hitarea').css('display', 'none');
            }

        },

        archimedes_core: {

            init: function() {
                // check for window.core object. If present, run various functions...
                if (window.core) {
                    this.rewrite_proxy_dir_urls();
                    this.no_autocomplete();
                    this.process_links();
                }
                this.protected_paths.init();
                this.analytics.init();
            },
            
            cms_preview: {
                
                init: function() {
                    
                },
                
                update_links: function(context) {
                    var context = context && typeof context != 'undefined' ? context : '#container';
                    if ($('#cms-frontend-toolbar-preview.cms-frontend-toolbar-preview-on').length) {
                        $('a', context).each(function() {
                            if ($(this).attr('href')) {
                                if ($(this).attr('href').indexOf('http') < 0 && $(this).attr('href').indexOf('_cmspreview') < 0) {
                                    $(this).attr('href', $(this).attr('href') + '?_cmspreview=1');
                                }
                            }
                        });
                    }
                }
                
            },

            process_links: function() {

                // elements with an attribute of 'data-onclick-url' should behave as a link'
                $('[data-onclick-url]:not([data-onclick-url=""])')
                    .addClass('cms-clickable')
                    .unbind('click')
                    .click(function() {
                        document.location.href = $(this).attr('data-onclick-url');
                    })
                ;

                // external links open in new win (unless they already have a class of 'noPopup' or 'nopopup')
                $('a').each(function() {
                    var el = $(this);
                    var href = el.attr('href');
                    if (href && href.indexOf('http') == 0 && !el.hasClass('noPopup')
                        && !el.hasClass('nopopup')
                        && !$('body').hasClass('no_pop_ups')
                        && !$('body').hasClass('nopopups')
                        && href.indexOf(window.location.hostname) != 0) {
                            el.attr('target', '_blank').addClass('external');
                    }
                });

                // elements with a class of 'behave_as_link' set an onclick value
                // based on the 'data-behave_as_link_url' attribute (html5 only)
                $('.behave_as_link').each(function() {
                    var el = $(this);
                    if (el.attr('data-behave_as_link_url')) {
                        el.css('cursor', 'pointer')
                            .unbind('click')
                            .click(function() {
                                document.location.href = el.attr('data-behave_as_link_url');
                            });
                    }
                });

            },

            no_autocomplete: function() {

                $('.no-autocomplete').each(function(){

                    /* Google Chrome fix - autocomplete attr is assigned to each text
                     * field, rather that the whole form  */

                    $(this).removeAttr('autocomplete');
                    $(this).find('input[type="text"]').each(function(){
                        $(this).attr('autocomplete', 'off')
                    });
                });

            },

            rewrite_proxy_dir_urls: function() {

                // do we need to rewrite urls to prepend a proxy dirname (e.g.
                // for mobile site under /m/... etc.
                if (window.core.top_level_proxy_dirs && !window.core.rewrite_top_level_proxy_dirs_server_side) {
                    // set proxy_dir to undefined so variable gets cleared on pageload - required for translations
                    window.archimedes.proxy_dir = undefined;
                    var t;
                    for (var i = 0; i < window.core.top_level_proxy_dirs.length; i ++) {
                        
                        t = window.core.top_level_proxy_dirs[i];
                        if (document.location.pathname.indexOf(t) == 0 || document.location.pathname == t.substring(0, t.length - 1)) {
                            window.archimedes.proxy_dir = t.substring(0, t.length - 1);
                            break;
                        }
                    }
                    
                    if (window.archimedes.proxy_dir) {
                        /* rewrite urls, prepending proxy_dir if
                         * a) it is not already there
                         * b) it is not an external link
                         * c) the link begins with '/'
                         * d) the tag does NOT have a classname 'no_proxy_dir_rewrite'
                         */
                        $('a').each(function() {
                            var el = $(this);
                            var href = el.attr('href');
                            if (href && href.indexOf('http') != 0 &&
                                href.indexOf('/media/') != 0 &&
                                href.indexOf('/custom_images/') != 0 &&
                                href.indexOf('/usr/') != 0 &&
                                href.indexOf('/') == 0 &&
                                !el.hasClass('no_proxy_dir_rewrite') &&
                                !href.indexOf(window.archimedes.proxy_dir + '/') == 0) {
                                    el.attr('href', window.archimedes.proxy_dir + el.attr('href'));
                            }
                        });
                        $('form').each(function() {
                            var el = $(this);
                            var href = el.attr('action');
                            if (href && href.indexOf('action') != 0 &&
                                href.indexOf('/media/') != 0 &&
                                href.indexOf('/custom_images/') != 0 &&
                                href.indexOf('/') == 0 &&
                                !el.hasClass('no_proxy_dir_rewrite') &&
                                !href.indexOf(window.archimedes.proxy_dir + '/') == 0) {
                                el.attr('action', window.archimedes.proxy_dir + el.attr('action'));
                            }
                        });
                    }

                }
                
            },

            protected_paths: {
                init: function() {
                    this.setup();
                },
                
                setup: function() {
                    if ($('#protected_path_login').length) { 
                        $('.protected_path_frontend_form').not('.initialized').each(function() {
                            $(this).addClass('initialized');
                            if (window.location.hash.indexOf('#verify=') > -1) {
                                // Verify user if necessary
                                window.archimedes.archimedes_core.protected_paths.verify_email();
                            } else {
                                // Check access status
                                window.archimedes.archimedes_core.protected_paths.check_status();
                            }
                            
                            // Format the fonm
                            $('#protected_path_login_form .protected_path_field_row').each(function() {
                                if ($('input[type="text"], input[type="email"]', this).length) {
                                    if ($('label', this).is(':hidden')) {
                                        $('input[type="text"], input[type="email"]', this).attr('placeholder', $('label', this).text());
                                    }
                                }
                            });
                             
                            // Add submit events for form
                            $('#protected_path_login_form').unbind().submit(function() {
                                form_data = {};
                                $('input, select, textarea', this).each(function() {
                                    form_data[$(this).attr('name')] = $(this).val().replace(/\n/g, '<br />');
                                });
                                form_data['path'] = window.location.pathname;
                                
                                if ($('meta[property="og:title"]').length) {
                                    form_data['page_title'] = $('meta[property="og:title"]').attr('content');
                                } else if ($('h1').length) {
                                    form_data['page_title'] = $('h1').text();
                                } else if ($('title').length) {
                                    form_data['page_title'] = $('title').text();
                                }
                                
                                window.archimedes.archimedes_core.protected_paths.request_access(form_data);
                                
                                return false;
                            });
                            $('.button', this).unbind().click(function() {
                                $(this).closest('form').submit(); 
                                return false;
                            });
                        });
                    }
                },
                
                verify_email: function(uid) {
                    var uid = uid && typeof uid != 'undefined' ? uid : (window.location.hash && window.location.hash.indexOf('#verify=') > -1 ? window.location.hash.replace('#verify=', '') : false);
                    
                    var data = {
                        'path': window.location.pathname,
                        'content_type_data': JSON.stringify(window.archimedes.archimedes_core.gather_page_content(window.protected_paths_html)) // Supply the HTML to this function at it does not already exist on the page.
                    };
                    
                    if (uid) {
                        $('#protected_path_login').addClass('protected_path_loading protected_path_verifying_status');
                        $.ajax({
                            type: "POST",
                            data: data,
                            dataType: 'json',
                            url: '/api/protected_paths/verify_email/' + uid + '/',
                            success: function(data) {
                                if (data.success) {
                                    // Success
                                    window.archimedes.archimedes_core.protected_paths.allow_access(data);
                                } else {
                                    // Error
                                    h.alert('<h2>Sorry</h2>An unknown error occurred.');
                                    $('#protected_path_login').removeClass('protected_path_loading protected_path_verifying_status');
                                }
                            },
                            error: function(data) {
                                h.alert('<h2>Sorry</h2>An unknown error occurred.');
                                $('#protected_path_login').removeClass('protected_path_loading protected_path_verifying_status');
                            }
                        });
                    }
                },
                
                allow_access: function(data) {
                    if (data && typeof data != 'undefined') {
                        if (g.has_local_storage_test() && typeof localStorage != 'undefined') {
                            // Check for existing data
                            if (localStorage.getItem('protected_paths_access')) {
                                // If protected_paths storage already exists
                                var protected_paths_data = JSON.parse(localStorage.getItem('protected_paths_access'));
                            } else {
                                var protected_paths_data = {};
                            }
                            
                            // Set new data
                            protected_paths_data[$('#protected_path_login_form').attr('data-protected-path-id')] = {'access_token': data.access_token, 'private_area_access_key': data.private_area_access_key, 'uid': data.uid}
                            
                            // Set in local storage
                            if(!$('.templated-gallery-site-demo').length){
                                localStorage.setItem('protected_paths_access', JSON.stringify(protected_paths_data));
                            }
                        }
                        
                        history.replaceState({}, null, window.location.pathname);
                        
                        setTimeout(function() {
                            if (window.protected_paths_html && typeof window.protected_paths_html != 'undefined') {
                                $('#container').replaceWith(window.protected_paths_html);
                                $(container_els).show();
                                $('#container').show();
                                
                                if(window.galleries) {
                                    window.galleries.init();
                                }
                                if(window.cart) {
                                    window.cart.init();
                                }
                                if(window.site) {
                                    window.site.init();
                                }
                                if (window.archimedes && typeof window.archimedes != 'undefined') {
                                    window.archimedes.archimedes_core.init();
                                }
                                
                                $('body').removeClass('protected-path-login-mode');
                                $('#protected_path_login').addClass('protected_path_hide');
                            
                                window.protected_paths_login_after();
                                
                                $(window).trigger('resize');
                                $(window).trigger('scroll');
                                
                                setTimeout(function() {
                                    $('#protected_path_login').remove();
                                    $('#protected_path_login').removeClass('protected_path_loading protected_path_verifying_status');
                                }, 1000);
                            } else {
                                location.reload();
                            }
                        }, 1000);
                    }
                },
                
                check_status: function() {
                    var protected_path_data = localStorage.getItem('protected_paths_access') ? JSON.parse(localStorage.getItem('protected_paths_access')) : false;
                    var check_type = 'localstorage'; // Options: 'localstorage', 'backend'
                    if (protected_path_data) {    
                        if (typeof protected_path_data[$('#protected_path_login_form').attr('data-protected-path-id')] != 'undefined') {
                            
                            var access_token = protected_path_data[$('#protected_path_login_form').attr('data-protected-path-id')]['access_token'];
                            var private_area_access_key = protected_path_data[$('#protected_path_login_form').attr('data-protected-path-id')]['private_area_access_key'];
                            var uid = protected_path_data[$('#protected_path_login_form').attr('data-protected-path-id')]['uid'];
                            
                            if (check_type == 'localstorage') {
                                // Check private area access key against localstorage 
                                if (private_area_access_key == $('#protected_path_login_form input[name="ppl_ak"]').val()) {
                                    $(container_els).show();
                                    $('#container').show();
                                    $('body').removeClass('protected-path-login-mode');
                                    $(window).trigger('resize');
                                    $(window).trigger('scroll');
                                    $('#protected_path_login').remove();
                                } else {
                                    $(container_els).hide();
                                    $('body').addClass('protected-path-login-mode');
                                }
                            } else {
                                // Check user's access token in the backend
                                
                                var data = {
                                    'access_token': access_token,
                                    'path': window.location.pathname  
                                };
                                
                                if (uid) {
                                    $('#protected_path_login').addClass('protected_path_loading protected_path_checking_status');
                                    $.ajax({
                                        type: "POST",
                                        data: data,
                                        dataType: 'json',
                                        url: '/api/protected_paths/check_status/' + uid + '/',
                                        success: function(data) {
                                            if (data.success) {
                                                // Success
                                                setTimeout(function() {
                                                    $(container_els).show();
                                                    $('#container').show();
                                                    $('body').removeClass('protected-path-login-mode');
                                                    $('#protected_path_login').addClass('protected_path_hide');
                                                
                                                    $(window).trigger('resize');
                                                    $(window).trigger('scroll');
                                                    
                                                    setTimeout(function() {
                                                        $('#protected_path_login').remove();
                                                        $('#protected_path_login').removeClass('protected_path_loading protected_path_checking_status');
                                                    }, 1000);
                                                }, 1000);
                                            } else {
                                                // Error
                                                $('#protected_path_login').removeClass('protected_path_loading protected_path_checking_status');
                                            }
                                        },
                                        error: function(data) {
                                            h.alert('<h2>Sorry</h2>An unknown error occurred.');
                                            $('#protected_path_login').removeClass('protected_path_loading protected_path_checking_status');
                                        }
                                    });
                                }
                            }
                        }
                    } else {
                        $(container_els).hide();
                        $('body').addClass('protected-path-login-mode');
                        
                        container_hidden = true;
                    }
                },
                
                request_access: function(form_data) {
                    $('#protected_path_login').addClass('protected_path_loading');
                    
                    var data = form_data;
                    data['content_type_data'] = JSON.stringify(window.archimedes.archimedes_core.gather_page_content(window.protected_paths_html));
                    
                    $.ajax({
                        type: "POST",
                        data: data,
                        dataType: 'json',
                        url: '/api/protected_paths/request_access/',
                        success: function(data) {
                            setTimeout(function() {
                                $('#protected_path_login').removeClass('protected_path_loading');
                                
                                if (data.success) {
                                    // Success
                                    //h.alert('<h2>Thank you</h2>We have sent you an email with a link to access this page.');
                                    
                                    window.archimedes.archimedes_core.analytics.track_campaigns.save_form_data($('#protected_path_login_form'));
                                    
                                    $('input, select, textarea', '#protected_path_login_form').each(function() {
                                        $(this).val(''); 
                                    });
                                    
                                    if (data.instant_access && typeof data.instant_access != 'undefined') {
                                        $('#protected_path_login').addClass('protected_path_loading protected_path_verifying_status');
                                        window.archimedes.archimedes_core.protected_paths.allow_access(data);
                                    } else {
                                        $('#protected_path_login').addClass('protected_path_check_email');
                                    }
                                    
                                } else {
                                    // Error
                                    h.alert('<h2>Sorry</h2>Please fill in all the required fields and ensure your email address is valid.');
                                }
                            }, 1000);
                        },
                        error: function(data) {
                            h.alert('<h2>Sorry</h2>An unknown error occurred.');
                            $('#protected_path_login').removeClass('protected_path_loading');
                        }
                    });
                }
                
            },
            
            gather_page_content: function(html) {
                // Gather all tags marked with 'data-ct-*' and form them into an object to be used throughout the core
                // This should be used in protected paths, so we can track the individual privateviews UIDs
                // Attributes format: data-ct-name="" data-ct-type="" data-ct-value=""
                
                // If html has been supplied, gather from the supplied html. Otherwise gather from the content of the page (default).
                if (html && typeof html != 'undefined') {
                    var context = $.parseHTML(html);
                } else {
                    var context = 'body';
                }
                
                content_tracking_data = [];
                $('*[data-ct-name]', context).each(function() {
                    var name = $(this).attr('data-ct-name') && typeof $(this).attr('data-ct-name') != 'undefined' ? $(this).attr('data-ct-name') : '';
                    var type = $(this).attr('data-ct-type') && typeof $(this).attr('data-ct-type') != 'undefined' ? $(this).attr('data-ct-type') : '';
                    var value = $(this).attr('data-ct-value') && typeof $(this).attr('data-ct-value') != 'undefined' ? $(this).attr('data-ct-value') : '';
                    var element_tracking_object = {
                        'content_name': name, 
                        'content_type': type, 
                        'content_value': value
                    };
                    content_tracking_data.push(element_tracking_object);
                });
                return content_tracking_data;
            },

            analytics: {

                init: function() {

                    this.track_campaigns.init();

                    /* Google Analytics tracking */
                    if (window._gaq || window.ga) {
                        $('a.analytics, .analytics a').click(function(e) {
                            var href = $(this).attr('href');
                            var target = $(this).attr('target');
                            var path = href.replace(location.protocol + '//' + location.host, '');
                            $(this).attr('href', 'javascript:void(0)');
                            if (window.ga) {
                                // Universal analytics
                                ga('send', 'pageview', path);
                                // Send tracker2 pageview if a secondary tracker has been installed
                                ga('tracker2.send', 'pageview', path);
                            } else if (window._gaq) {
                                // Legacy analytics
                                _gaq.push(['_trackPageview', path]);
                            }
                            setTimeout(function() {
                                if (target === '_blank') {
                                    window.open(href);    
                                } else {
                                    location = e.href;
                                    document.location.href = href;
                                }
                            }, 200);
                        });

                        // Track all documents automatically in Google Analytics
                        if ($('body').hasClass('analytics-track-documents') || $('body').hasClass('analytics-track-all-links')) {
                            $('a').each(function() {
                                // Dont track this link if it is already being tracked using the .analytics class
                                if (!$(this).hasClass('.analytics') && !$(this).parent().hasClass('.analytics')) {
                                    // Check that this link is a document
                                    var element_href = $(this).attr('href');
                                    if (element_href) {
                                        if (element_href.substr(-4)[0] == '.' || element_href.substr(-5)[0] == '.' || element_href.substr(-6)[0] == '.') {
                                            $(this).click(function() {
                                                if (window._gaq || window.ga) {
                                                    if ($(this).attr('href')) {
                                                        var href = $(this).attr('href');
                                                        var path = href.replace(location.protocol + '//' + location.host, '');
                                                        if (window.ga) {
                                                            // Universal analytics
                                                            ga('send', 'pageview', path);
                                                        } else if (window._gaq) {
                                                            // Legacy analytics
                                                            _gaq.push(['_trackPageview', path]);
                                                        }
                                                    }
                                                    if (!$(this).hasClass('external') && !$(this).attr('target') == '_blank') {
                                                        setTimeout(function() {
                                                            document.location.href = href;
                                                        }, 200);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }

                        // Track all external links automatically in Google Analytics
                        if ($('body').hasClass('analytics-track-all-links')) {
                            $('a').each(function() {
                                // Dont track this link if it is already being tracked using the .analytics class
                                if (!$(this).hasClass('.analytics') && !$(this).parent().hasClass('.analytics')) {
                                    // Check that this link is a document
                                    var element_href = $(this).attr('href');
                                    if (element_href) {
                                        if (element_href.substr(0,7) == 'http://' || element_href.substr(0,8) == 'https://') {
                                            $(this).click(function() {
                                                if (window._gaq || window.ga) {
                                                    var href = $(this).attr('href');
                                                    var path = href;
                                                    if (window.ga) {
                                                        // Universal analytics
                                                        ga('send', 'event', {
                                                          'eventCategory': 'External link click',
                                                          'eventAction': path
                                                        });
                                                    } else if (window._gaq) {
                                                        // Legacy analytics
                                                        _gaq.push(['_trackPageview', path]);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    }

                },

                track_campaigns: {

                    init: function() {
                        this.track();
                        this.set_forms();
                    },

                    track: function() {

                        // Track campaign information in localstorage so it can be used elsewhere on the site

                        if (g.has_local_storage_test() && typeof localStorage != 'undefined') {
                                
                            var visit_expired = false;
                            if (localStorage.getItem('campaign_tracking_info_timestamp')) {
                                var campaign_tracking_minutes_active = (parseInt(Date.now() - localStorage.getItem('campaign_tracking_info_timestamp')) / (1000*60)); //milliseconds to days
                                var expiry_minutes = 60;
                                if (campaign_tracking_minutes_active > expiry_minutes) {
                                    var visit_expired = true
                                }
                            }
                            
                            // Set current time as timestamp
                            localStorage.setItem('campaign_tracking_info_timestamp', new Date().getTime());
                            
                            var new_visitor = (localStorage.getItem('campaign_tracking_info') ? false : true);
                            var google_campaign_exists = false;
                            var search_string = window.location.search;
                            var landing_page = window.location.href.split('?')[0];
                            var internal_referrer = false;
                            
                            var referrer_url = 'Unknown';   
                            if (typeof document.referrer != 'undefined' && typeof document.location.protocol != 'undefined' && typeof document.location.hostname != 'undefined') {
                                if (document.referrer) {
                                    if (document.referrer.indexOf(document.location.protocol + '//' + document.location.hostname) < 0) {
                                        var referrer_url = document.referrer;
                                    } else {
                                        var referrer_url = 'Internal';
                                        var internal_referrer = true;
                                    }
                                } else if (document.referrer == '') {
                                    var referrer_url = 'Organic';
                                } else {
                                    var referrer_url = 'Unknown';   
                                }
                            }

                            if (search_string && typeof search_string != 'undefined') {
                                if (search_string.indexOf('utm_campaign') > -1) {
                                    var google_campaign_exists = true;
                                }
                            }

                            var track_new_visit = (google_campaign_exists || new_visitor || (visit_expired && !internal_referrer));

                            if (track_new_visit) {
                                // Visits are tracked and/or reset if there are google campaign params or if this is a new visit
                                
                                var campaign_info_existing = localStorage.getItem('campaign_tracking_info');
                                if (campaign_info_existing && typeof campaign_info_existing != 'undefined') {
                                    // Always retain previous data apart from keys which need to be reset
                                    var campaign_info = JSON.parse(campaign_info_existing);
                                    campaign_info['landing_page'] = '';
                                    campaign_info['referrer_url'] = '';
                                } else {
                                    var campaign_info = {};
                                }
                                
                                // Set landing page and referrer
                                campaign_info['landing_page'] = landing_page;
                                campaign_info['referrer_url'] = referrer_url;
                                
                                if (google_campaign_exists) {
                                    var params = search_string.replace('?', '').split('&');
                                    
                                    campaign_info['utm_source'] = '';
                                    campaign_info['utm_medium'] = '';
                                    campaign_info['utm_campaign'] = '';
                                    campaign_info['utm_term'] = '';
                                    campaign_info['utm_content'] = '';
                                    
                                    // Store each of the params
                                    $.each(params, function(i, param) {
                                        var param_split = param.split('=');
                                        var param_name = param_split[0];
                                        var param_value = param_split[1];
                                        campaign_info[param_name] = param_value;
                                    });
                                }
                                // Set the info in localStorage
                                localStorage.setItem('campaign_tracking_info', JSON.stringify(campaign_info));
                            }
                        }
                               
                    },

                    get_user_data: function() {

                        // Get information already set for this user

                        if (g.has_local_storage_test() && typeof localStorage != 'undefined') {
                            var tracking_info = localStorage.getItem('campaign_tracking_info');
                            if (tracking_info) {
                                var tracking_info_map = JSON.parse(tracking_info);
                                if (typeof tracking_info_map.user_data != 'undefined') {
                                    return tracking_info_map.user_data;
                                } else {
                                    return {};
                                }
                            } else {
                                return {};
                            }
                        }
                    },

                    save_form_data: function(form_instance) {

                        // Grab user data from form

                        var form_instance = form_instance && typeof form_instance != 'undefined' ? form_instance : false;

                        if (g.has_local_storage_test() && typeof localStorage != 'undefined' && form_instance) {

                            // Find existing tracking data
                            var tracking_info = localStorage.getItem('campaign_tracking_info');
                            if (!tracking_info) {
                                var tracking_info = '{}';
                            }
                            var tracking_info_map = JSON.parse(tracking_info);

                            // Create user data key if it doesn't exist
                            if (!tracking_info_map.user_data || typeof tracking_info_map.user_data == 'undefined') {
                                tracking_info_map['user_data'] = {};
                            }

                            // Find information in the form
                            var field_aliases = {
                                'f_name': 'name',
                                'f_email': 'email',
                                'f_phone': 'phone',
                                'cart_user_email': 'email',
                                'cart_user_phone': 'phone'
                            };

                            var form_data_map = {};
                            var fieldnames_to_find = ['name', 'first_name', 'last_name', 'email', 'phone'];
                            $('input', form_instance).each(function() {
                                var fieldname = $(this).attr('name');
                                if (fieldnames_to_find.indexOf(fieldname) > -1) {
                                    // Add to the tracked data
                                    tracking_info_map['user_data'][fieldname] = $(this).val();
                                } else if (field_aliases[fieldname] && typeof field_aliases[fieldname] != 'undefined') {
                                    var corrected_fieldname = field_aliases[fieldname];
                                    tracking_info_map['user_data'][corrected_fieldname] = $(this).val();
                                }
                            });

                            // Set in local storage
                            localStorage.setItem('campaign_tracking_info', JSON.stringify(tracking_info_map));

                        }
                               
                    },

                    set_forms: function() {

                        // Add tracking data to forms
                        if (g.has_local_storage_test() && typeof localStorage != 'undefined') {
                            var tracking_info = localStorage.getItem('campaign_tracking_info');
                            if (tracking_info) {

                                var field_aliases = {
                                    'name': ['f_name'],
                                    'email': ['f_email', 'cart_user_email'],
                                    'phone': ['f_phone', 'cart_user_phone'],
                                };

                                $('form').each(function() {
                                    var campaign_tracking_enabled = $(this).hasClass('campaign_tracking') || $(this).hasClass('campaign_tracking_autofill') || $(this).find('input[name="campaign_tracking_data"]').length || $(this).find('input[name="tracking"]').length;
                                    if (campaign_tracking_enabled) {
                                        var form_instance = $(this);
                                        var campaign_tracking_autofill = $(this).hasClass('campaign_tracking_autofill');
                                        if (!$('input[name="campaign_tracking_data"]', this).length) {
                                            $(this).append('<input type="hidden" name="campaign_tracking_data" />');
                                        }
                                        $('input[name="campaign_tracking_data"]', this).val(tracking_info); 
                                        if (campaign_tracking_autofill) {
                                            $.each(window.archimedes.archimedes_core.analytics.track_campaigns.get_user_data(), function(name, value) {
                                                var fieldnames_to_find_filter_list = '[name="' + name + '"]';

                                                var fieldname_aliases = eval('field_aliases["' + name + '"]');
                                                if (fieldname_aliases && typeof fieldname_aliases != 'undefined') {
                                                    for (var i = 0; i < fieldname_aliases.length; i++) {
                                                        var fieldnames_to_find_filter_list = fieldnames_to_find_filter_list + ', ' + '[name="' + fieldname_aliases[i] + '"]';
                                                    }
                                                }

                                                $('input', form_instance).filter(fieldnames_to_find_filter_list).val(value).trigger('change').addClass('campaign_tracking_autofilled');

                                            });
                                        }
                                    }
                                });
                            }
                        }

                    }
                    
                }
            }

        }

    };

    window.h = window.helpers = {
        
        format_number: {
            
            prep: function(v) {
                // remove commas...
                return h.replace_all(v, ',', '');
            },

            trim_zeros: function(v) {
                v = this.prep(v);
                return (v) ? parseFloat(v) : 0;
            },

            decimal: function(v, params) {
                var blank_zero = (params.blank_zero) ? true : false;
                var drop_trailing_zeros = (params.drop_trailing_zeros) ? true : false;
                v = this.prep(v);
                v = this.trim_zeros(v).toFixed(2);
                if (blank_zero && v == 0) {
                    v = '';
                }
                if (v.toString().indexOf('.') > -1) {
                    var delim = ',';
                    var vsplit = v.toString().split('.');
                    var pre = vsplit[0].split('');
                    var post = vsplit[1];
                    pre.reverse();
                    var m = 3, seg = [], segs = [], rev, new_v;
                    for (var i = 0; i < pre.length; i ++) {
                        seg[seg.length] = pre[i];
                        if (seg.length == 3) {
                            segs[segs.length] = seg.join("");
                            seg = [];
                        }
                    }
                    if (seg.length > 0) {
                        segs[segs.length] = seg.join("");
                    }
                    rev = segs.join(delim).split('');
                    rev.reverse();
                    pre = rev.join('');
                    if (!pre) {
                        pre = 0;
                    }
                    if (post == '00' && drop_trailing_zeros) {
                        new_v = pre;
                    } else {
                        new_v = pre + '.' + post;
                    }
                    v = new_v;
                }
                return v;
            }


        },

        is_int: function(value) {
            if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
                return true;
            } else {
                return false;
            }
        },

        element_exists: function(sel) {
            // given a jquery selector, return true if the element exists, e.g.:
            // h.element_exists('.foo');
            // h.element_exists('#bar');
            return $(sel).length > 0;
        },

        create_html_select: function(params) {
            // note: this helper function is used by the new
            // invoice screen
            if (!params) { return; }
            var html_rows = [];
            html_rows[html_rows.length] = '<select id="' + params.el_id +
                '" name="' + params.el_name + '">';
            var sel, id;
            if (params.allow_empty) {
                sel = (!params.selected_value) ? ' selected' : '';
                html_rows[html_rows.length] = '<option value=""' + sel +
                '></option>';
            }
            for (var i = 0; i < params.option_ids_in_order.length; i ++) {
                id = params.option_ids_in_order[i];
                sel = false;
                if (params.selected_value) {
                    if (params.options[id] == params.selected_value) {
                        sel = true;
                    }
                }
                html_rows[html_rows.length] = '<option value="' + id + '"' +
                    ((sel) ? ' selected' : '') + '>' + params.options[id] +
                    '</option>';
            }
            html_rows[html_rows.length] = '</select>';
            return html_rows.join("");
        },

        open_win: function(params) {
            // a quick syntax for a new pop-up window:
            // h.open_win({url: 'url/', params: {'hello': 'world'}, width: 350, height: 350, scrollbars: true})
            if (!params) return false;
            if (!params.params) params.params = {};
            params.url = h.construct_url(params.url, params.params);
            delete params.params;
            fl_win(params);
        },

        construct_url: function(url, params) {
            // construct a GET url from a given url, plus (optionally)
            // an object contining parameters to be sent, e.g.
            // this.construct_url('/path_to_file/', {'id': 1, 'name': 'a value'})
            // -> '/path_to_file/?id=1&name=a%20value'
            // NOTE: this is the jquery equivaluent of prototype's Object.toQueryString() function
            params_str = (params) ? jQuery.param(params) : null;
            var sep = (url.indexOf("?") > -1) ? "&" : "?";
            return this.concat_ws(sep, url, params_str);
        },

        concat_ws: function() {
            // this is an improvement on the fl_concatWS
            // function in /flgui/scripts/main.js
            var out = [];
            if (!arguments || arguments.length == 0) return "";
            var sep = arguments[0]
            for (var i = 1; i < arguments.length; i ++) {
                if (arguments[i]) {
                    out[out.length] = arguments[i].toString();
                }
            }
            return out.join(sep);
        },

        decode_html_entities: function(t) {
            // converts an html entity (e.g. the html entity representing
            // the Euro symbol) to the real character. The results are cached
            // for speedy retrieval.
            // Based on a free script found here (thanks due to the author):
            // http://javascript.internet.com/snippets/convert-html-entities.html
            if (!this.html_entities_map) {
                this.html_entities_map = {};
            }
            if (this.html_entities_map[t]) {
                return this.html_entities_map[t];
            }
            var el=document.createElement("textarea");
            el.innerHTML = t.replace(/\</g,"&lt;").replace(/\>/g,"&gt;");
            this.html_entities_map[t] = el.value;
            return this.html_entities_map[t];
        },

        in_array: function(value, array) {
            /*
             * Peter is not crazed for the jQuery $.inArray syntax which returns
             * the index of the found item, or -1 if it is not in the array.
             * Sometimes we just want to know True or False if an item is in
             * an array. This function uses the jQuery function to do just that:
             * h.in_array(value, array) -> true or false
             */
            if ($.inArray(value, array) > -1) {
                return true;
            } else {
                return false;
            }
        },

        remove_leading: function(value, match_string) {
            while(value.indexOf(match_string) == 0) {
                value = ('___start___' + value).replace('___start___' + match_string, '')
            }
            return value;
        },

        display_date: function(input_date, short_month_name) {
            /*
                Display a date in SQL format to our preferred format:
                >>> display_date('2009-10-22');
                'October 22, 2009'
                >>> display_date('2009-10-22', true); // short month name
                'Oct 22, 2009'
            */
            if (!input_date || input_date == "" || parseInt(input_date) == 0) {
                return "";
            } else {
                var t="";
                var dt = "";
                var tm = "";
                if (short_month_name) {
                    var month_names=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                } else {
                    var month_names=["January","February","March","April","May","June","July","August","September","October","November","December"];
                }
                var input_array = input_date.split(" ")[0].split("-");
                var time_segment = '';
                if (input_date.indexOf(':') > -1) {
                    time_segment = input_date.split(' ')[1];
                }
                if (time_segment == '00:00:00') {
                    time_segment = '';
                }
                var y = parseInt(input_array[0], 10);
                /*
                    Note about the above syntax (javacript bug): parseInt("09") returns 0 not
                    9, and parseInt("08") returns 0 not 8, whereas all other numbers are returned
                    correctly. This is because parseInt incorrectly thinks they are invalid octal
                    numbers. The workaround is to force parseInt to base 10, eg. parseInt("09", 10)
                    returns 9. See article here:
                    http://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256C85006A6604
                */
                var m = (parseInt(input_array[1], 10)>0) ? month_names[input_array[1]-1] : "";
                var d = parseInt(input_array[2], 10);
                t += (m != "") ? m+" " : "";
                t += (d>0) ? d+", " : "";
                t += y;
                return this.concat_ws(', ', t, time_segment);
            }
        },

        add_warning_if_greater_than_today: function() {
            // if the variable h.today exists (set it if you need to), and any field exists on
            // the page with a class of 'gt_today', check dates against today, and add a class
            // of 'warning'.
            var today = this.today;
            if (today) {
                $('.gt_today').each(function() {
                    var v = $(this).val();
                    if (v == 0 || v == '' || v == '0000-00-00') {
                         $(this).removeClass('tick');
                        $(this).removeClass('warning');
                    } else if (v < today) {
                         $(this).removeClass('tick');
                        $(this).addClass('warning');
                    } else {
                        $(this).removeClass('warning');
                        $(this).addClass('tick');
                    }
                });
            }
        },

        convert_to_single_line: function(t) {
            t = h.replace_all(t, '<br>', ', ');
            t = h.replace_all(t, '<br/>', ', ');
            t = h.replace_all(t, '<br />', ', ');
            t = h.clean_whitespace(t);
            t = h.trim(t);
            var tags_to_keep = ['b', 'i', 'u', 'em', 'strong']
            for (var i = 0; i < tags_to_keep.length; i ++) {
                t = h.replace_all(t, '<' + tags_to_keep[i] + '>', '___' + tags_to_keep[i] + '___');
                t = h.replace_all(t, '</' + tags_to_keep[i] + '>', '___/' + tags_to_keep[i] + '___');
            };
            t = t.replace(/<.+?>/g, '');
            for (var i = 0; i < tags_to_keep.length; i ++) {
                t = h.replace_all(t, '___' + tags_to_keep[i] + '___', '<' + tags_to_keep[i] + '>');
                t = h.replace_all(t, '___/' + tags_to_keep[i] + '___', '</' + tags_to_keep[i] + '>');
            };
            t = t.replace(/(, )+/g, ', ');
            return t;
        },

        trim: function(t) {
            // trim a string
            if (!t) {
                t = '';
            }
            t = t.toString();
            return t.replace(/^\s+|\s+$/g, '');
        },

        clean_whitespace: function(t) {
            // clean whitespace from a string, replacing with a single space
            if (!t) {
                t = '';
            }
            t = t.toString();
            return t.replace(/\s+/g, ' ');
        },

        list_items_to_array: function(txt, return_integers) {
            // converts a line-separated list of items into an array,
            // removing empty values
            items = this.convert_line_returns(txt).split("\n"); // convert line returns
            var out = [];
            var item;
            for (var i = 0; i < items.length; i ++) {
                item = this.trim(items[i]);
                if (item) {
                    if (return_integers) {
                        item = parseInt(item);
                    }
                    out[out.length] = item;
                }
            };
            return out;
        },

        encode_breaks: function(t, c) { // text, break character
            if (!t) {
                t = '';
            }
            if (!c) c = '<br />';
            t = this.replace_all(t, "\r\n", c);
            t = this.replace_all(t, "\r", c);
            t = this.replace_all(t, "\n", c);
            return t;
        },

        encode_breaks_to_commas: function(t) {
            return this.encode_breaks(t, ", ");
        },

        escape_quotes: function(t) {
            // converts double-quotes, returning a string suitable
            // for putting in the 'value' attribute of an html
            // input field
            return this.replace_all(t, '"', '&#34;');
        },

        convert_line_returns: function(txt, c) {
            if (!c) c = "\n";
            return this.encode_breaks(txt, c);
        },

        replace_all: function(t, r, w) { // text, replace, with
            if (!t) {
                t = '';
            }
            return t.toString().split(r).join(w);
        },

        parse_int: function(v) {
            v = parseInt(v, 10); // see note above relating to parseInt
            if (isNaN(v)) {
                v = 0;
            }
            return v;
        },

        parse_float: function(v) {
            v = parseFloat(v, 10); // see note above relating to parseInt
            if (isNaN(v)) {
                v = 0.0;
            }
            return v;
        },

        copy_obj: function(obj) {
            var out = {};
            for (var k in obj) {
                out[k] = obj[k];
            }
            return out;
        },

        decode_json: function(t) {
            return eval('(' + t + ')');
        },

        alert: function(msg, options) {
            if (msg.indexOf('<') == -1) {
                msg = '<div class="aol-default-prompt-text" role="alert">' + msg + '</div>';
            }
            if (!options) {
                options = {
                    buttons: {Ok: true}
                };
            }
            if (!options.zIndex) options.zIndex = 100000; // Maximum value
            $.prompt(msg.toString(), options);
            this.set_promp_style();
        },

        notify: function(msg, milliseconds) {
            // like alert, but dismisses automatically after the
            // specified number of milliseconds
            if (msg.indexOf('<') == -1) {
                msg = '<div class="aol-default-prompt-text">' + msg + '</div>';
            }
            if (!milliseconds) {
                milliseconds = 2500;
            }
            var dialog = $.prompt(msg.toString(),{
                buttons: {Ok: true},
                timeout: milliseconds
            });
            this.set_promp_style();
        },

        prompt: function(msg, params) {
            if (msg.indexOf('<') == -1) {
                msg = '<div class="aol-default-prompt-text">' + msg + '</div>';
            }
            $.prompt(msg, params);
            this.set_promp_style();
        },

        set_promp_style: function() {
            $('.aolpromptbuttons button')
                .wrapInner('<span></span>');
            $('.aolpromptbuttons')
                .append('<div class="clear"></div>');
        },

        proxy_url: function(url) {
            // rewrites a url so that it includes the 'proxy dir' if it is being
            // used. A proxy dir is a top level directory used for a specific
            // purpose, e.g. '/m/' = mobile, '/a/' = accessible, etc...
            if (!window.archimedes.proxy_dir) {
                return url;
            } else {
                var prefix = window.archimedes.proxy_dir;
                if (url.indexOf(prefix + '/') != 0 &&
                    url.indexOf('http') != 0 &&
                    url.indexOf('/') == 0) {
                    return prefix + url;
                } else {
                    return url;
                }
            }
        },

        // Cookie functions <ricky.hewitt@artlogic.net>
        setCookie: function(c_name, value, expiredays, expireseconds) {
            var exdate=new Date();
            if (expiredays) {
                exdate.setDate(exdate.getDate()+expiredays);
            } else if (expireseconds) {
                exdate.setSeconds(exdate.getSeconds() + expireseconds);
            }
            document.cookie=c_name+ "=" +escape(value)+
            ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())+";path=/";
        },

        getCookie: function(c_name) {
            if (document.cookie.length>0){
              c_start=document.cookie.indexOf(c_name + "=");
              if (c_start!=-1){
                c_start=c_start + c_name.length+1;
                c_end=document.cookie.indexOf(";",c_start);
                if (c_end==-1) c_end=document.cookie.length;
                return unescape(document.cookie.substring(c_start,c_end));
                }
              }
            return "";
        },

        // Javascript redirection (with optional delay)
        // <ricky.hewitt@artlogic.net>
        redirect: function(url, options) {
            var options = $.extend({
                delay: 0
            }, options || {});

            setTimeout(function() {
                window.location = url;
            }, options.delay);
        },

        ajax_login: function(path, username, password) {
            $.post(path, {
                username: username,
                password: password
            }, function(data) {
                if (data && data.logged_in) {
                    try {
                        window.location.reload(true);
                    } catch (e) {
                        // Backward compatability
                        window.location.href = window.location.pathname;
                    }
                } else if (data.error) {
                    h.alert(data.error);
                } else {
                    h.alert('There was a problem trying to log you in. Please refresh the page and try again.');
                }
            }, 'json');
        },
        
        accessibility: {
            
            global_variables: {
                element_to_refocus_to_after_close: '',
                popup_layer_tracking: [],
                element_to_refocus_to: '',
            },
            
            init: function() {
                h.accessibility.init_on_first_tab();
                h.accessibility.axe_automatic_audit();
            },
            
            on_popup_opening: function(trap_element, first_focusable_element_override, close_button_element) {
                
                try {
                    
                    if (!$("body").hasClass('accessibility-functions-disabled')) {
                
                        h.accessibility.popupLayerTracker("opening", trap_element);
                        
                        // if an artwork popup is already open
                        if ($("body").hasClass("roomview-active")) {
                            h.accessibility.focus_untrap();
                        } else if ($("body").hasClass("page-popup-visible")) {
                            h.accessibility.focus_untrap();
                        }
                        
                        var $focus_override_element = $(trap_element + " [data-first-focus-override]");
                        // check if the trap_element has a data attribute which is a custom override (useful for bespoke sites)
                        if (trap_element && $focus_override_element.length && $focus_override_element.attr('data-first-focus-override')) {
                            first_focusable_element_override = $focus_override_element.attr('data-first-focus-override');
                        }
                        
                        h.accessibility.focus_trap(trap_element, first_focusable_element_override, close_button_element);
                        
                        if (close_button_element) {
                            h.accessibility.closeWithEscapeKey(close_button_element, trap_element);
                        }
                        
                        var first_element_to_focus = first_focusable_element_override;
                        if (first_element_to_focus && $('body.tabbing-detected').length) {
                            $(first_element_to_focus).focus();
                            first_element_to_focus = '';
                        }
                    }
                    
                } catch(error) {
                    console.error(error);
                }
                
            },
            
            on_popup_closing: function(focus_after) {
                
                try {
                    
                    if (!$("body").hasClass('accessibility-functions-disabled')) {
                
                        h.accessibility.popupLayerTracker("closing");
                        
                        h.accessibility.focus_untrap(focus_after);
                        
                        // if an artwork popup is already open
                        if ($("body").hasClass("roomview-active")) {
                            h.accessibility.focus_trap('.roomview-close', false, '.roomview-close');
                        } else if ($( ".fancybox-inner #contact_form" ).length) {
                            h.accessibility.focus_trap('.fancybox-opened .fancybox-skin');
                        } else if ($("body").hasClass("page-popup-visible")) {
                            h.accessibility.focus_trap('#popup_box .inner', false, '#popup_container .close');
                        }
                        
                        var $element_to_refocus_to_after_close = h.accessibility.global_variables.element_to_refocus_to_after_close
                        
                        // You can add a data atrribute of 'data-focus-after' to the default refocus element to change the focus. This is useful
                        // when you want to refocus on a different element on an item within a grid/list.
                        if ($element_to_refocus_to_after_close && $element_to_refocus_to_after_close.length && $element_to_refocus_to_after_close.attr("data-focus-after") && typeof $element_to_refocus_to_after_close.attr("data-focus-after") !== 'undefined' ) {
                            var new_focus_element = $element_to_refocus_to_after_close.attr("data-focus-after");
                            $(new_focus_element)[0].focus();
                        } else if ($element_to_refocus_to_after_close && $element_to_refocus_to_after_close.length && !focus_after) {
                            $element_to_refocus_to_after_close[0].focus();
                        }
                    }
                
                } catch(error) {
                    console.error(error);
                }
                
            },
            
            focus_trap: function(trap_element, first_focusable_element_override, close_button_element) {
                
                if (!$("body").hasClass('accessibility-functions-disabled')) {
                
                    // Trap the focus/tab key to a specific element. This is useful for popups and navigations
                    
                    if (  typeof trap_element != 'undefined' && trap_element.length ) {
                    
                        var focusable_types = 'iframe:not(.focustrap-ignore), ' +
                                              'button:not([disabled]):not(.focustrap-ignore), ' +
                                              '[href]:not([tabindex="-1"]):not([disabled]):not(.focustrap-ignore), ' +
                                              'input:not([type=hidden]):not([style="display: none;"]):not(.focustrap-ignore), ' +
                                              'select:not(.focustrap-ignore), ' +
                                              'textarea:not(.focustrap-ignore), ' +
                                              '[tabindex]:not([tabindex="-1"]):not(.focustrap-ignore), ' +
                                              '.focusable_element_override:not(.focustrap-ignore)'
                        
                        if (first_focusable_element_override) {
                            $(first_focusable_element_override).addClass('focusable_element_override');
                        }
                        
                        $(focusable_types).each(function () {
                            $(this).addClass('focustrap-focusable');
                            if (typeof $(this).attr('tabindex') !== 'undefined' && (!$(this).hasClass("focustrap-disabled-outside"))) {
                               var tabindex = $(this).attr('tabindex');
                               $(this).attr('data-tabindex', tabindex);
                            }
                        });
                        
                        //supply your wrapper
                        var $elem = $(trap_element).first();
                        $elem.addClass('focustrap-wrapper');
                        
                        //detect the focusable items in your wrapper
                        var focusable = Array.prototype.slice.call($elem[0].querySelectorAll(focusable_types));
                        
                        $(focusable).not('.focustrap-ignore').addClass('focustrap-item').attr('tabindex', 0);
                        
                        //detect the focusable items outside your wrapper and kill them
                        $('body').find(focusable_types).not('.focustrap-item').addClass('focustrap-disabled-outside');
                        
                        // There is a weird empty iframe that gets included with google maps which is tababble - this removes it.
                        $('#map_basic iframe').addClass('focustrap-disabled-outside');
                        
                        if ($('.focustrap-disabled-outside').attr('tabindex') != -1) {
                            $('.focustrap-disabled-outside').attr('tabindex', -1);
                        } 
        
                        //Ensure tab looping in your wrapper
                        var firstAnchor = focusable[0];
                        var lastAnchor = focusable[focusable.length - 1]
                        
                        $(lastAnchor).addClass('focustrap-last').on('keydown.focusLast', function (e) {
                            var keyCode = e.which;
                            if ($("this:focus") && (keyCode == 9 && !e.shiftKey)) {
                                e.preventDefault();
                                $(firstAnchor).focus();
                            }
                        });
                        $(firstAnchor).addClass('focustrap-first').on('keydown.focusFirst', function (e) {
                            var keyCode = e.which;
                            if ($("this:focus") && (keyCode == 9 && e.shiftKey)) {
                                e.preventDefault();
                                $(lastAnchor).focus();
                            }
                        });
                    }
                }
                
            },
            
            focus_untrap: function(focus_after) {
                
                if (!$("body").hasClass('accessibility-functions-disabled')) {
                
                    var $focusAfter = $(focus_after);
                    
                    // Remove keydown listeners used for tab looping inside wrapper
                    $('.focustrap-first').off("keydown.focusFirst");
                    $('.focustrap-last').off("keydown.focusLast");
                    
                    $('.focustrap-focusable').each(function () {
                        if (typeof $(this).attr('data-tabindex') !== 'undefined' && !$(this).attr("data-disabled")) {
                            $(this).attr("tabindex", $(this).attr('data-tabindex'));
                        } else if ($(this).attr("data-disabled")) {
                            $(this).attr("tabindex", -1);
                        } else {
                            $(this).removeAttr("tabindex");
                        }
                    });
                    
                    $('.focustrap-item').removeClass('focustrap-item');
                    $('.focustrap-focusable').removeClass('focustrap-focusable focustrap-disabled-outside');
                    $('.focustrap-wrapper').removeClass('focustrap-wrapper');
                    $('.focustrap-first').removeClass('focustrap-first');
                    $('.focustrap-last').removeClass('focustrap-last');
                    if ( typeof $focusAfter != 'undefined' && $focusAfter.length ) {
                        $focusAfter.focus();
                    }
                    
                }
            
            },
            
            closeWithEscapeKey: function(close_button_element, focus_trap_element) {
                // This function allows you to close navigations and popups using the escape key
                // close_button_element should be a clickable element which will close the popup e.g a close button.
                
                if (!$("body").hasClass('accessibility-functions-disabled')) {
                
                    function escapeFunc(event) {
                        if (event.keyCode === 27 && (focus_trap_element ? (h.accessibility.is_current_popup(focus_trap_element)) : true)) {
                            event.preventDefault();
                            $(close_button_element).click();
                        }
                    }
                    
                    if (!$(focus_trap_element).hasClass('esc-key-listener-added')) {
                        $(document).on('keydown.escKeyDown', escapeFunc);
                        $(focus_trap_element).addClass('esc-key-listener-added');
                    }
                
                }
            },
            
            popupLayerTracker: function(action, popup_element) {
                
                if (!$("body").hasClass('accessibility-functions-disabled')) {
                
                    // variable to shorten the calls so that the code is more readable
                    var accessibility = h.accessibility.global_variables;
                    
                    if (action == "length") {
                        return accessibility.popup_layer_tracking.length;
                    } else if (action == "opening") {
                        var $popupElement = $(popup_element);
                        if (accessibility.element_to_refocus_to) {
                            accessibility.popup_layer_tracking.push([$popupElement, accessibility.element_to_refocus_to]);
                        } else {
                            accessibility.popup_layer_tracking.push([$popupElement]);
                        }
                        $popupElement.first().attr("data-popup-layer", accessibility.popup_layer_tracking.length);
                    } else if (action == "closing") {
                        var $popupElement = accessibility.popup_layer_tracking[accessibility.popup_layer_tracking.length - 1];
                        if (accessibility.popup_layer_tracking[accessibility.popup_layer_tracking.length - 1].length > 1) {
                            accessibility.element_to_refocus_to_after_close = accessibility.popup_layer_tracking[accessibility.popup_layer_tracking.length - 1][1];
                        } else {
                            accessibility.element_to_refocus_to_after_close = false;
                        }
                        $popupElement[0].removeAttr("data-popup-layer");
                        accessibility.popup_layer_tracking.pop();
                    }
                }
                
            },
            
            init_on_first_tab: function() {
                
                if (!$("body").hasClass('accessibility-functions-disabled')) {
                    
                    $(document).one( 'keyup', function(e) {
                        if ( e.which == 9 && !e.target.form) {
                            console.log('tabbing detected');
                            $('body').addClass('tabbing-detected');
                        }
                    });
                }
            },
            
            is_current_popup: function(focus_trap_element) {
                
                // This function returns true or false depending if the popup you supply it is the top level popup or not
                // The focus_trap_element you pass to the function must be the same as the trap_element supplied to the on_popup_opening function
                
                if (h.accessibility.popupLayerTracker("length") == $(focus_trap_element).attr("data-popup-layer")) {
                    return true;
                } else {
                    return false;
                }
            },
            
            axe_automatic_audit: function() {
                
                //todo
                
                // make panel not overlay page but instead resizes the window
                // FUTURE - Remove best practice rules from results?
                // FUTURE -  if high contrast mode is made, remove contrasts from audit?
                
                
                $(".run-axe-audit-button").unbind().click(function(){
                    
                    $(".axe-results-panel").removeClass("hide");
                    
                    // For accessibility - tracks which element to refocus on
                    try {
                        h.accessibility.global_variables.element_to_refocus_to = $(this);
                    } catch(error) {
                        console.error(error);
                    }
                    
                    // clear any previous audit results
                    $(".axe-dynamic-panel-container").empty();
                    
                    $("body").addClass('axe-panel-visible');
                    
                    $(".axe-panel-close-button").unbind().click(function(){
                        $("body").removeClass('axe-panel-visible');
                        setTimeout(function(){ $(".axe-results-panel").addClass("hide"); }, 400);
                        h.accessibility.on_popup_closing();
                    });
                    
                    window.scrollTo(0, 0);
                    
                    // Force header to show so that it can be tested
                    $(".layout-fixed-header #header").css({"transform": "none"});
                    // Hide nav which has the audit run button temporarily as it threw errors in the audit
                    $("#cms-frontend-toolbar .cms-frontend-toolbar-item ul").css({"display": "none"});
                    
                    axe.run({exclude: [['#cms-frontend-toolbar']]}, function (err, results) {
                        
                        if (err) {
                            $(".axe-dynamic-panel-container").append("<div class='axe-error-message'>Oops! Something went wrong! If you continue experiencing this issue please contact support at suuport@artlogic.net</div>");
                            throw err;
                        }
                        
                        var number_of_incomplete_tests = 0;
                        var number_of_violations = 0;
                        var total_issues = 0;

                        results.incomplete.forEach(function (issue) {
                            if (issue.nodes) {
                                number_of_incomplete_tests += issue.nodes.length;
                            }
                        });
                        
                        results.violations.forEach(function (issue) {
                            if (issue.nodes) {
                                number_of_violations += issue.nodes.length;
                            }
                        });
                        
                        total_issues = number_of_incomplete_tests + number_of_violations;
                        
                        if  (total_issues >= 1) {
                            if (total_issues == 1) {
                                var issues_label = " issue"
                            } else if (total_issues >= 1) {
                                var issues_label = " issues"
                            }
                            
                            $(".axe-dynamic-panel-container").append("<div class='axe-total-container'><div class='axe-total-violations'>" + total_issues + issues_label + " found</div><button class='re-run-axe-audit-button'>Re-run audit</button></div>");
                            
                        } else if (total_issues == 0) {
                            $(".axe-dynamic-panel-container").append("<div class='axe-total-container'><div class='axe-total-violations no-violations'>No accessibility issues were found</div><button class='re-run-axe-audit-button'>Re-run audit</button></div>");
                        }
                        
                        // If there are violations - add them to the audit panel
                        if (results.violations && results.violations.length >= 1) {
                            
                            $(".axe-dynamic-panel-container").append("<h3>Violations</h3><div class='axe-violations-list'></div>")
                            
                            results.violations.forEach(function (issue, index) {
                                
                                var violation_items = ""
                                
                                issue.nodes.forEach(function (node) {
                                    
                                    violation_items += "<div class='violation-element-location-header'><h4>Element location</h4></div>"
                                    node.target.forEach(function (target) {
                                        violation_items += "<div class='violation-element-location'>" + target + "</div>"
                                    });
                                    
                                    if (node.html && node.html.length) {
                                        violation_items += "<h4>Element source</h4><div class='violation-element-source'><pre class='prettyprint lang-html'><xmp>" + node.html + "</xmp></pre></div>"
                                    }
                                    
                                    if (node.failureSummary && node.failureSummary.length) {
                                        var summary_split_by_line_returns = node.failureSummary.split("\n");
                                        violation_items += "<div class='failure-summary'>"
                                        summary_split_by_line_returns.forEach(function (line, index) {
                                            if (index == 0 || line == "Fix any of the following:") {
                                                if (index != 0) {
                                                    violation_items += "</ul>"
                                                }
                                                violation_items += "<h4>" + line + "</h4><ul class='failure-summary-list'>"
                                            } else if (line && line.length) {
                                                violation_items += "<li class='failure-summary-item'>" + line + "</li>"
                                            }
                                        });
                                        violation_items += "</ul></div>"
                                    }
                                    
                                });
                                    
                                $(".axe-violations-list").append(
                                    "<button class='violation-item' aria-expanded='false' aria-controls='violation-" + issue.id + "'><span class='description'>" + issue.help + "</span><span class='count' aria-label='. Number of issues is " + issue.nodes.length + "'>" + issue.nodes.length + "</span></button>\
                                    <div id='violation-" + issue.id + "' class='accordion-panel' hidden>" +
                                    
                                        "<div class='issue-impact'>Impact: <span class='issue-impact-status " + issue.impact + "'>" + issue.impact + "</span></div>" +
                                        
                                        "<div class='issue-description'>" +
                                            "<h4>Issue description</h4>" +
                                            "<a href=" + issue.helpUrl + " target='_blank'>" +
                                                issue.description +
                                            "</a>" +
                                        "</div>" +
                                        
                                        violation_items +
                                        
                                    "</div>"
                                )
                            });
                            
                        }
                        
                        // If there are issues which need reviewing - add them to the audit panel
                        if ( results.incomplete && results.incomplete.length >= 1 ) {
                            
                            $(".axe-dynamic-panel-container").append("<h3>Needs review</h3><div class='axe-needs-reviewing-list'></div>")
                            
                            results.incomplete.forEach(function (issue, index) {
                                
                                var review_items = ""
                                
                                issue.nodes.forEach(function (node) {
                                    
                                    review_items += "<div class='review-element-location-header'><h4>Element location</h4></div>"
                                    node.target.forEach(function (target) {
                                        review_items += "<div class='review-element-location'>" + target + "</div>"
                                    });
                                    
                                    if (node.html && node.html.length) {
                                        review_items += "<h4>Element source</h4><div class='review-element-source'><pre class='prettyprint lang-html'><xmp>" + node.html + "</xmp></pre></div>"
                                    }
                                    
                                    if (node.any && node.any[0] && node.any[0].message) {
                                        review_items += "<h4>This issue needs reviewing because:</h4><div class='review-message'>" + node.any[0].message + "</div>"
                                    }
                                    
                                });
                                
                                $(".axe-needs-reviewing-list").append(
                                    "<button class='needs-reviewing-item' aria-expanded='false' aria-controls='review-" + issue.id + "'><span class='description'>" + issue.help + "</span><span class='count' aria-label='. Number of issues is " + issue.nodes.length + "'>" + issue.nodes.length + "</span></button>" +
                                    "<div id='review-" + issue.id + "' class='accordion-panel' hidden>" +
                                    
                                        "<div class='issue-impact'>Impact: <span class='issue-impact-status " + issue.impact + "'>" + issue.impact + "</span></div>" +
                                        
                                        "<div class='issue-description'>" +
                                            "<h4>Issue description</h4>" +
                                            "<a href=" + issue.helpUrl + " target='_blank'>" +
                                                issue.description +
                                            "</a>" +
                                        "</div>" +
                                        
                                        review_items +
                                        
                                    "</div>"
                                )
                                
                            });
                        }
                        
                        // Highlight syntax for element source code snippet https://github.com/google/code-prettify
                        PR.prettyPrint();
                        
                        // click event to open and close accordians
                        $(".axe-violations-list button.violation-item, .axe-needs-reviewing-list button.needs-reviewing-item").unbind().click(function(){
                            var accordian_panel_id = $(this).attr("aria-controls");
                            
                            // add or remove active class to accordian button
                            $(".axe-violations-list button:not([aria-controls=" + accordian_panel_id + "])").removeClass("active");
                            $(".axe-needs-reviewing-list button:not([aria-controls=" + accordian_panel_id + "])").removeClass("active");
                            $(this).toggleClass("active");
                            if ($(this).attr("aria-expanded") == "true") {
                                $(this).attr("aria-expanded", false)
                            } else {
                                $(this).attr("aria-expanded", true)
                            }
                            
                            // hide or show violations accordian panel depending on if its active or not
                            $(".axe-violations-list .accordion-panel:not(#" + accordian_panel_id + ")").attr("hidden", true);
                            if ($(".axe-violations-list #" + accordian_panel_id).attr("hidden")) {
                                $(".axe-violations-list #" + accordian_panel_id).removeAttr("hidden");
                            } else {
                                $(".axe-violations-list #" + accordian_panel_id).attr("hidden", true);
                            }
                            
                             // hide or show "needs review" accordian panel depending on if its active or not
                            $(".axe-needs-reviewing-list .accordion-panel:not(#" + accordian_panel_id + ")").attr("hidden", true);
                            if ($(".axe-needs-reviewing-list #" + accordian_panel_id).attr("hidden")) {
                                $(".axe-needs-reviewing-list #" + accordian_panel_id).removeAttr("hidden");
                            } else {
                                $(".axe-needs-reviewing-list #" + accordian_panel_id).attr("hidden", true);
                            }
                        });
                        
                        // Highlighter button - highlights elements with issues
                        var focus_area
                        var original_tab_index
                        $(".violation-element-location, .review-element-location").unbind().hover(function(){
                            focus_area = $(this).text();
                            original_tab_index = $(focus_area).attr('tabindex');
                            $(focus_area).attr('tabindex', "-1").focus().css({"outline": "dashed"});
                        }, function(){
                            $(focus_area).css("outline", "").attr('tabindex', original_tab_index);
                        });
                        
                        
                        // click event for button to re-run audit
                        $(".re-run-axe-audit-button").unbind().click(function(){
                            $("#cms-frontend-toolbar-buttons .run-axe-audit-button").trigger( "click" );
                        });
                        
                        h.accessibility.on_popup_opening('.axe-results-panel', false, '.axe-panel-close-button');
                        
                        // console.log(results);
                    });
                    // Allow header to be hidden again once audit is completed
                    $(".layout-fixed-header #header").css({"transform": ""});
                    // Show nav again which has the audit run button in it
                    $("#cms-frontend-toolbar .cms-frontend-toolbar-item ul").css({"display": ""});
                    
                    
                });
            
            }
            
        }

    };

    window.g = {

        reload: function() {
            window.document.location.href = window.document.location.href.split('#')[0];
        },

        has_local_storage: function() {

            var hasLocalStorage = false;
            try {
                if (localStorage) {
                    hasLocalStorage = true;
                }
            } catch(e) {
                // no localStorage!
            }
            return hasLocalStorage;
        },

        has_local_storage_test: function() {

            hasLocalStorage = false;
            // Older iOS Safari, in Private Browsing Mode, *looks* like it supports localStorage but all calls to setItem
            // throw QuotaExceededError. We're going to detect this and just silently drop any calls to setItem
            // to avoid the entire page breaking, without having to do a check at each usage of Storage.
            if (typeof localStorage === 'object') {
                try {
                    localStorage.setItem('localStorage', 1);
                    localStorage.removeItem('localStorage');
                    hasLocalStorage = true;
                } catch (e) {
                    // no localStorage!
                }
            }
            return hasLocalStorage;
        }

    };


    // Define some core jquery plugins (please ask Peter if you want to add more)
    // Note that these plugins are defined separately in back-end js helper files

    $.fn.extend({

        floatCenter: function() {
            /*
             * $.floatCenter()
             *
             * Center an object in the window and bring it to the top. See
             * also $.toWin()
             *
             * Author: Peter Chater
             * Date: May 21, 2010
             */
            $(this).show();
            var scrollTop = $('html,body').scrollTop(); // see comments on http://api.jquery.com/scrollTop/
            var l = ($(window).width() - $(this).width()) / 2;
            var t = (($(window).height() - $(this).height()) / 2.5) + scrollTop;
            $(this).css({'left': l + 'px', 'top': t + 'px'}).toTop();
            return this;
        },

        centered: function() {
            /*
             * $('#my_element').centered()
             *
             * Center an object within its parent element
             *
             * Author: Peter Chater
             * Date: Aug 2, 2010
             */
            $(this).show().css({'margin-left': '0px', 'float': 'left'});
            var w = $(this).width() + 1; // allow 1 extra pixel to allow for rounding
            $(this).css({
                'width': w + 'px',
                'margin-left': 'auto',
                'margin-right': 'auto',
                'float': 'none'
            });
            return this;
        },

        toWin: function() {
            /*
             * $.toWin()
             * 
             * Turns an element into a faux 'window' in the page,
             * with a simple close box. Any element may be used - it will
             * be detached from its current position on the DOM and displayed
             * absolutely positioned.
             *
             * Note that the css for this is currently not fully backwards-
             * compatible it uses custom drop-shadow and rounded-corners
             * available in contemporary browsers. It should default to a
             * rectangle in older browsers.
             *
             * Usage:
             *
             * $('#my_element').toWin();
             *
             * Note that the element should initially be set to display none.
             *
             * To cancel the window, a button or link should be placed inside
             * the element whose click action will be:
             *
             * $('#my_element').cancelWin();
             *
             * Author: Peter Chater
             * Date: May 24, 2010
             * Requires: TopZIndex (see below)
             */
            window.archimedes.current_towin_el = this;
            $(this)
                .setMask()
                .addClass('archimedes_towin')
                .css({'position': 'absolute'})
                .floatCenter()
                .fadeTo('fast', 1.0)
                .setCloseBox();
            return this;
        },

        cancelWin: function() {
            /*
             * $.cancelWin()
             *
             * Remove a 'window' created with the $.toWin() method.
             *
             * Note that this method should be called on the element
             * that was turned into a 'win', e.g.:
             *
             * $('#my_element').cancelWin();
             *
             * ...or simply on the 'body' element:
             *
             * $('body').cancelWin();
             *
             * Author: Peter Chater
             * Date: May 24, 2010
             */
            $('#archimedes_mask_el').fadeOut();
            $('#archimedes_closebox_el').fadeOut();
            $(window.archimedes.current_towin_el).fadeOut();
            return this;
        },

        closeWin: function() {
            // synonymous with $.cancelWin() above...
            $(this).cancelWin();
            return this;
        },

        setCloseBox: function() {
            /*
             * $.setCloseBox()
             *
             * Give an object a closebox, and a handler function so that it
             * knows what to do...
             *
             * You can remove it again with:
             * $('#archimedes_closebox_el').hide();
             *
             * Author: Peter Chater
             * Date: May 24, 2010
             * Requires: TopZIndex (see below)
             */
            var l = $(this).offset().left + $(this).width() + 40;
            var t = $(this).offset().top - 10;
            if (!h.element_exists('#archimedes_closebox_el')) {
                $('body').append('<div id="archimedes_closebox_el"></div>');
            }
            $('#archimedes_closebox_el')
                .css({
                    'position': 'absolute',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': '30px',
                    'height': '30px',
                    'background': 'transparent url(/lib/archimedes/images/archimedes_closebox.png) top left no-repeat'
                    })
                .toTop()
                .show('fast')
                .click(function() {
                    $('body').cancelWin();
                });
            return this;
        },

        setMask: function() {
            /*
             * $.setMask()
             *
             * Sets a mask element behind the current element. Used in
             * conjunction with toWin() above...
             *
             * Author: Peter Chater
             * Date: May 24, 2010
             * Requires: TopZIndex (see below)
             */
            var scrollTop = $('html,body').scrollTop(); // see comments on http://api.jquery.com/scrollTop/
            var exists = h.element_exists('archimedes_mask_el');
            if (!h.element_exists('archimedes_mask_el')) {
                $('body').append('<div id="archimedes_mask_el" style="display: none;"></div>');
            }
            $('#archimedes_mask_el')
                .fadeTo(1, 0.001)
                .css({
                    'position': 'absolute',
                    'top': '0',
                    'left': '0',
                    'width': $(window).width() + 'px',
                    'height': (scrollTop + $(window).height()) + 'px',
                    'background': '#333'
                    })
                .toTop()
                .fadeTo('fast', 0.3)
                .click(function() {
                    $('body').cancelWin();
                });
            return this;
        },

        toTop: function() {
            /*
             * $.toTop() - bring an object to the top. This assumes the object
             * is already absolutely positioned.
             *
             * Author: Peter Chater
             * Date: May 21, 2010
             * Requires: TopZIndex (see below)
             */
            $(this).show().css({'z-index': $.topZIndex() + 1});
            return this;
        }

    });

    $.fn.makeAbsolute = function(rebase) {
        // Thanks, Rick Strahl!
        // http://www.west-wind.com/Weblog/posts/517320.aspx
        return this.each(function() {
            var el = $(this);
            var pos = el.position();
            el.css({ position: "absolute",
                marginLeft: 0, marginTop: 0,
                top: pos.top, left: pos.left });
            if (rebase)
                el.remove().appendTo("body");
        });
    };


    $(document).ready(function() {

        window.archimedes.archimedes_toolbar.init();
        window.archimedes.archimedes_core.init();

        $('blockquote').wrapInner('<span></span>');

        // make heading images work in ie6
        // swap png for jpeg and add a unique class
        if ($.browser.msie && $.browser.version < 7.0) {
            $('.heading-image').addClass('heading-image-ie6');
            $('.heading-image img').attr('src', function() {
                var newFilename = $(this).attr('src').replace('.png','.jpg');
                $(this).attr('src', newFilename);
            });
        }

        // center all elements with a class of .centered
        $('.centered').each(function() {
            $(this).centered();
        });

        // clear after all elements with a class of .clearafter.
        // Don't be tempted to remove this - there is a 'clearwithin'
        // class which appends a div of class 'clear' *within* the given
        // element. This class appends a div of class="clear" *afterwards*
        $('.clearafter').after('<div class="clear"></div>');


        // Login form
        $('#login_form .large_button a', this).click(function() {
            $('#login_form').submit();
            return false;
        });

        // Fancybox images
        if (h.element_exists('a.fancybox')) {
            // first we need to find any captions in div.embedded_img elements
            // and move them to the alt attributes...
            if (h.element_exists('div.embedded_img')) {
                $('div.embedded_img').each(function() {
                    var obj = $(this);
                    var caption = h.escape_quotes($('div.embedded_img_caption', obj).html());
                    var caption2 = h.escape_quotes($('div.embedded_img_caption2', obj).html());
                    $('div.embedded_img_caption2', obj).html('');
                    $('a.fancybox', obj).attr('alt', caption2 || caption);
                    $('div.embedded_img_img img', obj).attr('alt', caption);
                });
            }
            // now prepare fancybox elements
            $("a.fancybox").fancybox({
                'overlayShow': true,
                'overlayOpacity': 0.7,
                'overlayColor': '#d9d9d9',
                'imageScale': 'true',
                'zoomOpacity': 'true'
            });
        }


    });


})(jQuery);






// FL Win
// Must be a better way of doing this...

        var fl_win = function(params) {
            return fl_popUpWin(params);
        }

        var fl_popUpWins = [];

        function fl_popUpWin(url, name, w, h, scrollbars, resizable, menubar, status) {
            if (typeof url == 'object') {
                /*
                    As of Nov 2007, you may use the shorter alias to this function, 'fl_win',
                    and may specify parameters as an object, using only the first argument, e.g.:

                        fl_win({
                            url: '/my_popup.html'
                        });

                        fl_win({
                            url: '/my_popup.html',
                            name: 'PopUp',
                            width: 500,
                            height: 400,
                            scrollbars: true,
                            resizable: true,
                            menubar: true,
                            status: true
                        });

                    No parameters are required, however 'url' is highly recommended!
                    When using the 'params' method, 'fl_win' is an alias for 'fl_popUpWin', e.g.:
                    fl_popUpWin({...params...}) will work in the same manner
                */
                // set up defaults
                var params = url;
                var url = (params.url) ? params.url : "http://www.artlogic.net/flgui/images/shim.gif";
                var name = (params.name) ? params.name : "Window_" + fl_popUpWins.length;
                var w = (params.width) ? params.width : 550;
                var h = (params.height) ? params.height : 550;
                // as of JAN 2009, the height is then adjusted to in accordance with the browser...
                h = win_adjust_h(h);
                var scrollbars = (params.scrollbars) ? "yes" : "no"
                var resizable = (params.resizable) ? "yes" : "no"
                var resizable = (params.resizable) ? "yes" : "no"
                var menubar = (params.menubar) ? "yes" : "no"
                var status = (params.status) ? "yes" : "no"
            } else {
                var w = (w) ? w : 550;
                var h = (h) ? h : 550;
                var scrollbars = (scrollbars) ? "yes" : "no";
                var resizable = (resizable) ? "yes" : "no";
                var menubar = (menubar) ? "yes" : "no";
                var status = (status) ? "yes" : "no";
            }
            var l=(screen.availWidth-w)/2;
            var t=((screen.availHeight-h)/3)-40;
            if (!fl_popUpWins[name] || fl_popUpWins[name].closed) {
                fl_popUpWins[name] = window.open(url,name,'width=' + w + ',height=' + h + ',top=' + t + ',left=' + l + ',scrollbars=' + scrollbars + ',resizable=' + resizable + ',menubar=' + menubar + ',status=' + status);
                if (fl_popUpWins[name]) { // the window may have been blocked by a pop-up blocker
                    fl_popUpWins[name].focus();
                } else {
                    alert("Please ensure that you allow pop-up windows for this application as they may contain important messages or functionality. Please update your browser preferences and reload this page.");
                }
            } else if (fl_popUpWins[name]) { // the window may have been blocked by a pop-up blocker
                fl_popUpWins[name].focus();
            }
        }

        var browser = {

            init: function() {
                this.bname = navigator.appName;
                this.ver = parseInt(navigator.appVersion);
                this.agt = navigator.userAgent.toLowerCase();
                this.mac = (this.agt.indexOf("mac") > -1);
                this.win = (this.agt.indexOf("win") > -1);
                this.x11 = (this.agt.indexOf("x11") > -1);
                this.opera = (this.agt.indexOf("opera") > -1); // must be above IE4 as Opera users can set Opera to 'identify' as IE in preferences,
                this.safari = (this.agt.indexOf("safari") > -1);
                this.firefox = (this.agt.indexOf("firefox") > -1);
                this.camino = (this.agt.indexOf("camino") > -1);
                this.ns = this.netscape = (this.bname == "Netscape");
                this.ie = (this.bname == "Microsoft Internet Explorer" && !this.opera);
                this.iemac = (this.ie && this.mac);
                this.get_version(); // must be run before browser-version-specific options, below
                this.tweaks();
                this.ns3 = (this.ns && this.ver < 4);
                this.ns4 = (this.ns && this.ver >= 4 && this.ver < 5);
                this.ns6 = (this.ns && this.ver >= 5);
                this.ie3 = (this.ie && this.ver < 4);
                this.ie4 = (this.ie && this.ver >= 4);
                this.ie4win=(this.ie4 && this.win);
                this.iewin = (this.ie && this.win);
                this.ie4mac=(this.ie4 && this.mac);
            },

            get_version: function() {
                if (this.agt.indexOf('firefox/') > -1) {
                    this.ver = parseInt(this.agt.split('firefox/')[1].split(' ')[0]);
                } else if (this.safari && this.agt.indexOf('version/') > -1) {
                    this.ver = parseInt(this.agt.split('version/')[1].split(' ')[0]);
                } else if (this.ie) {
                    this.ver = parseInt(this.agt.split(' msie ')[1].split(';')[0]);
                }
            },

            tweaks: function() {
                if (this.camino) {
                    this.firefox = false;
                }
            }

        };

        browser.init();

        var win_adjust_h = function(h) {
            if (browser.firefox && browser.ver >= 3) {
                h += 30;
            } else if (browser.firefox && browser.ver >= 2) {
                h += 10;
            };
            return h
        };



// Email address obfuscator

function mangle() {
    if (!document.getElementsByTagName && !document.createElement &&
        !document.createTextNode) return;
    var nodes = document.getElementsByTagName("span");
    for(var i=nodes.length-1;i>=0;i--) {
        if (nodes[i].className=="fixEmail") {
            var at = / at /;
            var dot = / dot /g;
            var node = document.createElement("a");
            var address = nodes[i].firstChild.nodeValue;

            address = address.replace(at, "@");
            address = address.replace(dot, ".");

            node.setAttribute("href", "mailto:"+address);
            node.appendChild(document.createTextNode(address));

            var prnt = nodes[i].parentNode;
            for(var j=0;j<prnt.childNodes.length;j++)
                if (prnt.childNodes[j] == nodes[i]) {
                    if (!prnt.replaceChild) return;
                    prnt.replaceChild(node, prnt.childNodes[j]);
                    break;
                }
        }
    }
}


// Build form elements

    // For accessibile forms.

    function showForms() {
    	
        $('.jsSubmit').css('display','block');
        $('.nojsSubmit').css('display','none');
    }


// Stop image flickering in IE

    try {
        document.execCommand("BackgroundImageCache", false, true);
    } catch(err) {}


// Run everything

    $(document).ready(function() {
        showForms();
        mangle();
        h.accessibility.init();
    });



// Third party plugins required in the above

/*
    TopZIndex 1.1 (September 23, 2009) plugin for jQuery
    http://topzindex.googlecode.com/
    Copyright (c) 2009 Todd Northrop
    http://www.speednet.biz/
    Licensed under GPL 3, see  <http://www.gnu.org/licenses/>
*/
(function(a){a.topZIndex=function(b){return Math.max(0,Math.max.apply(null,a.map(a(b||"body *:visible"),function(d){return parseInt(a(d).css("z-index"))||null})))};a.fn.topZIndex=function(b){if(this.length===0){return this}b=a.extend({increment:1,selector:"body *:visible"},b);var d=a.topZIndex(b.selector),c=b.increment;return this.each(function(){a(this).css("z-index",d+=c)})}})(jQuery);


/* jquery.centerInWindow
 * A plug-in to center an element in the window. Based on:
 * http://stackoverflow.com/questions/210717/using-jquery-to-center-a-div-on-the-screen
 */
jQuery.fn.centerInWindow = function (options) {
    var options = $.extend({
        'close_box': true
    }, options || {});
    $(this).css("position","absolute");
    var t = (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop();
    var l = (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft();
    $(this).css("top", t + "px");
    $(this).css("left", l + "px");
    var el_id = $(this).attr('id');
    if (options.close_box) {
        var close_el_id = 'center_in_window_closebox';
        if (!h.element_exists(close_el_id)) {
            $('body').append('<div id="' + close_el_id + '" class="_closebox">&nbsp;</div>')
            $('#center_in_window_closebox').css({
                'position': 'absolute',
                'left': (l + $(this).outerWidth() - 15) + 'px',
                'top': (t - 10) + "px",
                'width': '30px',
                'height': '30px',
                'background': 'transparent url(/lib/archimedes/images/close.png) top left no-repeat'
            }).click(function() {
                $('#center_in_window_closebox').hide();
                $('#' + el_id).hide(200);
            });
            $('.close-btn', '#' + el_id).click(function() {
                $('#center_in_window_closebox').hide();
                $('#' + el_id).hide(200);
            });
        }
    }
    return this;
}
