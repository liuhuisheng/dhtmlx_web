module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; */\n'
            },
            my_target: {
                files: {
                    'build/app.js': [
                        'assets/lib/jquery/jquery-1.11.2.min.js',
                        'assets/lib/jquery/jquery-ui.js',
                        'assets/lib/jquery/jquery.cookie.js',
                        'assets/vendors/jquery-pulsate/jquery.pulsate.custom.js',
                        'assets/vendors/jquery-slimscroll/jquery.slimscroll.min.js',
                        //'assets/vendors/icheck/icheck.min.js',
                        'assets/vendors/bootstrap/js/bootstrap.min.js',
                        //'assets/vendors/bootstrap-switch/bootstrap-switch.min.js',
                        'assets/vendors/buttons/js/buttons.js',
                        'assets/lib/angularjs/1.3.9/ie8/angular.min.js',

                        //'assets/lib/dhtmlx/v403_pro/codebase/dhtmlx.js',
                        //'assets/lib/dhtmlx/v412_std/sources/dhtmlxTabbar/codebase/dhtmlxtabbar.js',
                        //'assets/lib/dhtmlx/dhtmlx.custom.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxCommon/codebase/dhtmlxcommon.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxCommon/codebase/dhtmlxcore.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxCommon/codebase/dhtmlxcontainer.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxLayout/codebase/dhtmlxlayout.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxAccordion/codebase/dhtmlxaccordion.js',
                        'assets/lib/dhtmlx/v412_std/sources/dhtmlxTabbar/codebase/dhtmlxtabbar.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxTree/codebase/dhtmlxtree.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxTree/codebase/ext/dhtmlxtree_json.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxToolbar/codebase/dhtmlxtoolbar.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxMenu/codebase/dhtmlxmenu.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/dhtmlxgrid.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_drag.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_export.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_filter.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_nxml.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_selection.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_srnd.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_validation.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/excells/dhtmlxgrid_excell_tree.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/excells/dhtmlxgrid_excell_link.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/excells/dhtmlxgrid_excell_grid.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/excells/dhtmlxgrid_excell_dhxcalendar.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/excells/dhtmlxgrid_excell_cntr.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/excells/dhtmlxgrid_excell_acheck.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/excells/dhtmlxgrid_excell_context.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_start.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_data.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_fast.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_filter_ext.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_form.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_group.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_hextra.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_hmenu.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_json.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_markers.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_math.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_mcol.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_over.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_pgn.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_post.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_rowspan.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_splt.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_ssc.js',
                        'assets/lib/dhtmlx/v403_pro/sources/dhtmlxGrid/codebase/ext/dhtmlxgrid_undo.js',
                        'assets/lib/dhtmlx/dhtmlx.custom.js',

                        'assets/lib/requirejs/require.min.js',
                        'app/main.js'
                    ],
                    'build/ie.js':['assets/lib/ie/html5shiv/html5shiv.min.js',
                        'assets/lib/ie/es5-shim/es5-shim.min.js',
                        'assets/lib/ie/json/json3.min.js',
                        'assets/lib/ie/respond/respond.min.js',
                        'assets/lib/ie/ieupdate/ieupdate.js']
                }
            }
        },
        cssmin: {
            concat: {
                options: {
                    keepBreaks: true, //  whether to keep line breaks (default is false)
                    keepSpecialComments: 0,
                   // debug: true, // set to true to get minification statistics under 'stats' property (see test/custom-test.js for examples)
                    noAdvanced: false, //, // set to true to disable advanced optimizations - selector & property merging, reduction, etc.
                    //relativeTo: 'http://www.baidu.com/', //'http://online-domain-tools.com/',
                    noRebase:false, // whether to skip URLs rebasing
                    root: './'
                },
                nonull: true,
                src: [
                    'assets/css/default/scaffolding.css',
                    'assets/css/default/helpers.css',
                    'assets/vendors/buttons/css/buttons.min.css',
                    'assets/lib/dhtmlx/v412_std/skins/default/dhtmlx.css',
                    'app/css/app.css',
                    'app/css/fix.css',
                     'assets/css/default/icons.css'
                   ],
                dest: 'build/app.css'
            },
            minify: {
                options: {},
                nonull: true,
                src: ['build/app.css'],
                dest: 'build/app.css'
            }
        },
        replace: {
            another_example: {
                src: ['build/app.css'],
                overwrite: true,                 // overwrite matched source files
                replacements: [{
                    from: /\/assets/g,
                    to: '/assets'
                },
                {
                    from:/\/app/g,
                    to:'/app'
                }]
            }
        },
        copy: {
            main: {
                files: [
                    //{src: ['assets/lib/dhtmlx/v412_std/codebase/dhtmlx.js'], dest: 'build/dhtmlx.js'},
                    //{src: ['assets/lib/angularjs/1.3.9/ie8/angular.min.js'], dest: 'build/angular.js'},
                    //{src: ['assets/lib/jquery/jquery-1.11.2.min.js'],dest:'build/jquery.js'},
                    {src: ['app/img/logo/chitu-32.png'], dest: 'build/app.png'}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['uglify','cssmin:concat','replace', 'cssmin:minify','copy']);
};