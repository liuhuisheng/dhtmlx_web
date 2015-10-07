define(['text'], function(textPlugin) {
	
	var buildText = {};
	
	return {
		
		load: function(name, req, onLoad, config) {
			var self = this,
				file = name,
				segments = file.split('/');
		
			// If the module name does not have an extension, append the default one
			if (segments[segments.length - 1].lastIndexOf('.') == -1) {
				file += '.html';
			}
			
			textPlugin.get(req.toUrl(file), function(html) {
			
				for (var option in config.config.html) {
					if (option in self.transform) {
						html = self.transform[option](config.config.html[option], html);
					}
				}
				
				if (config.isBuild) {
					buildText[name] = textPlugin.jsEscape(html);
				}
				
				onLoad(html);
				
			}, onLoad.error);
		},
		
		
		write: function (pluginName, moduleName, write) {
			if (buildText.hasOwnProperty(moduleName)) {
				var name = "'" + pluginName + "!" + moduleName  + "'",
					text = "function () {return '" + buildText[moduleName] + "';}";
			
				write("define(" + name + ", " + text + ");\n");
			}
		},
		
		
		transform: {
			
			comments: function(action, html) {
				if (action === 'strip') {
					return html.replace(/<!--(.|[\n\r])*?-->/gm, '');
				} else {
					return html;
				}
			},
			
			
			whitespaceBetweenTags: function(action, html) {
				var pattern = />[\n\r\s]+</gm;
			
				if (action === 'strip') {
					return html.replace(pattern, '><');
				} else if (action === 'collapse') {
					return html.replace(pattern, '> <');
				} else {
					return html;
				}
			},
			
			
			whitespaceBetweenTagsAndText: function(action, html) {
				var afterTagPattern = />[\n\r\s]+/gm,
					beforeTagPattern = /[\n\r\s]+</gm;
				
				if (action === 'strip') {
					return html.replace(afterTagPattern, '>').replace(beforeTagPattern, '<');
				} else if (action === 'collapse') {
					return html.replace(afterTagPattern, '> ').replace(beforeTagPattern, ' <');
				} else {
					return html;
				}
			},
		
		
			whitespaceWithinTags: function(action, html) {
				if (action === 'collapse') {
					var tagPattern = /<([^>"']*?|"[^"]*?"|'[^']*?')+>/g,
						attrPattern = /([^\0\n\r\s"'>\/=]+)(?:\s*(=)\s*([^\n\r\s"'=><`]+|"[^"]*"|'[^']*'))?/gi,
						lastIndex = 0,
						result = '',
						match,
						tag;
					
					while ((match = tagPattern.exec(html)) !== null) {
				
						// Copy text between the beginning of this match and the end of the last one
						result += html.substring(lastIndex, match.index);
						tag = match[0];
						
						if (/^<[^\/]/.test(tag)) {  // It's a start tag
							var attrs = tag.match(attrPattern),
								start = attrs.shift(),
								end = /\/>$/.test(tag) ? '/>' : '>';
					
							result += start + attrs.map(function(attr) {
								return attr.replace(attrPattern, ' $1$2$3');
							}).join('') + end;
						}
						
						else {  // It's an end tag
							result += tag.replace(/[\n\r\s]+/g, '');
						}
						
						lastIndex = tagPattern.lastIndex;
					}
					
					return result + html.substring(lastIndex);
				} else {
					return html;
				}
			}
			
		}
		
	};

});