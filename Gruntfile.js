/* jshint browser: false, devel: false, node: true */
module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			dist: {
				src: ['Gruntfile.js', 'src/scripts/**/*.js']
			}
		},

		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['src/scripts/**/*.js'],
				dest: 'dist/js/<%= pkg.name %>.js'
			}
		},

		sass: {
			options: {
				style: 'expanded',
				lineNumbers: true
			},
			dist: {
				src: ['src/styles/main.scss'],
				dest: 'dist/css/<%= pkg.name %>.css'
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.title %> <%= pkg.version %> (built on <%= grunt.template.today() %>) */'
			},
			dist: {
				src: ['<%= concat.dist.dest %>'],
				dest: 'dist/js/<%= pkg.name %>.min.js'
			}
		},

		cssmin: {
			options: {
				banner: '/*! <%= pkg.title %> <%= pkg.version %> (built on <%= grunt.template.today() %>) */'
			},
			dist: {
				src: ['<%= sass.dist.dest %>'],
				dest: 'dist/css/<%= pkg.name %>.min.css'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('compile', ['jshint', 'concat', 'sass']);
	grunt.registerTask('minify', ['uglify', 'cssmin']);

	grunt.registerTask('build', ['compile', 'minify']);

	grunt.registerTask('default', 'build');
};
