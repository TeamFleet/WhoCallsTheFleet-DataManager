_frame.app_main.page['guide'] = {}
_frame.app_main.page['guide'].section = {}








_frame.app_main.page['guide'].field_input_text = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<input type="text" name="'+name+'" />').val(value).appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['guide'].field_input_date = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<input type="date" name="'+name+'" />').val(value).appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['guide'].field_input_checkbox = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<input type="checkbox" name="'+name+'" />')
		.prop( 'checked', (value) ? true : false )
		.appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['guide'].field_input_textarea = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<textarea name="'+name+'" />').val(value).attr({
		'cols': 	60,
		'rows': 	20
	}).appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['guide'].field_actions = function(text, func_delete){
	var line = $('<p class="actions"/>')
	$('<button type="submit"/>').html(text || '提交').appendTo(line)
	if( func_delete ){
		$('<button type="button"/>').html('删除').on('click', function(){
			func_delete()
		}).appendTo(line)
	}
	return line
}










_frame.app_main.page['guide'].gen_form_new_guide = function( callback, data_edit, callback_remove ){
	callback = callback || function(){}
	let is_edit = (data_edit)
	var self = this
		,form = $('<form class="guide"/>').on('submit',function(e){
					e.preventDefault()
					var data = $(this).serializeObject()

					console.log(data)
					//return data

					if( is_edit ){
						// 编辑操作
						_db.guides.update({
							'_id': 	data_edit['_id']
						}, {
							$set: data
						}, {}, function (err, numReplaced) {
							callback( data )
							_frame.modal.hide()
						});
					}else{
						// 新建操作
						// 获取当前总数，确定数字ID
						// 之后插入数据
							_db.guides.count({}, function(err, count){
								data['id'] = parseInt(count) + 1
								_db.guides.insert(
									data,
									callback
								);
							})
					}
				})
		,input_container = $('<div/>').appendTo(form)

	_frame.app_main.page['ships'].gen_input(
		'select', 
		'type', 
		null,
		[
			'title',
			'text',
			'guide'
		],
		{
			'default': is_edit ? data_edit['type'] : null
		}).insertBefore(input_container)
	self.field_input_text('title', '标题', is_edit ? data_edit['title'] : null).appendTo(input_container)
	self.field_input_text('title-html', '网页标题', is_edit ? data_edit['title-html'] : null).appendTo(input_container)
	self.field_input_text('name', 'ID', is_edit ? data_edit['name'] : null).appendTo(input_container)
	self.field_input_text('path', 'Path', is_edit ? data_edit['path'] : null).appendTo(input_container)
	self.field_input_text('template', '模板', is_edit ? data_edit['template'] : null).appendTo(input_container)
	self.field_input_text('class-nav', 'class-nav', is_edit ? data_edit['class-nav'] : null).appendTo(input_container)
	self.field_input_text('class-main', 'class-main', is_edit ? data_edit['class-main'] : null).appendTo(input_container)
	//self.field_input_text('comment-id', '评论ID', is_edit ? data_edit['comment-id'] : null).appendTo(input_container)
	//self.field_input_date('date', '更新日', is_edit ? data_edit['date'] : null).appendTo(input_container)
	self.field_input_checkbox('has-comment', null, is_edit ? data_edit['has-comment'] : false, '是否允许评论').appendTo(input_container)
	self.field_input_textarea('content', '内容', is_edit ? data_edit['content'] : null).appendTo(input_container)

	self.field_actions(
		is_edit ? '更新' : null,
		callback_remove ? function(){
				_db.guides.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
					callback_remove()
					_frame.modal.hide()
				});
			} : null
	).appendTo(form)
	return form
}

















_frame.app_main.page['guide'].init = function(page){
	page.find('section').on({
		'tabview-show': function(){
			var section = $(this)
				,name = section.data('tabname')

			if( !_frame.app_main.page['guide'].section[name] )
				_frame.app_main.page['guide'].section[name] = {}

			var _o = _frame.app_main.page['guide'].section[name]

			if( !_o.is_init && _o.init ){
				_o.init(section)
				_o.is_init = true
			}
		}
	})
}









_frame.app_main.page['guide'].section['攻略'] = {
	'dom': {
	},

	// 相关表单/按钮
		'titlebtn': function( d ){
			var self = this
				,btn = $('<button class="unit"/>').html(
							'<strong>'
								+ d['type'].toUpperCase()
							+ '</strong><br/>'
							+ '<small><em>'+d['title']+'</em></small>'
						)
						.on('click', function(){
							_frame.modal.show(
								_frame.app_main.page['guide'].gen_form_new_guide(
									function( newdata ){
										self.titlebtn( newdata )
											.insertAfter( btn )
										btn.remove()
									},
									d,
									function(){
										btn.remove()
									}
								) , '编辑攻略')
						})
			return btn
		},

	// 新建完毕，添加内容
		'add': function( d ){
			var self = this
			// 标题，同时也是编辑按钮
				self.dom.list.appendDOM( self.titlebtn(d) )
		},

	'init': function(section){
		var self = this

		// 新建按钮
			self.dom.new_container = $('<div class="new_container"/>').appendTo( section )
				self.dom.btnnew = $('<button/>').html('新建').on('click',function(){
						_frame.modal.show(
							_frame.app_main.page['guide'].gen_form_new_guide(
								function(err, newDoc) {
									self.add(newDoc)
									_frame.modal.hide()
								}
							), '新建攻略')
					}).appendTo( self.dom.new_container )

		// 列表container
			self.dom.main = $('<div class="main"/>').appendTo( section )
			self.dom.list = _p.el.flexgrid.create().addClass('update_history').appendTo( self.dom.main )

		// 读取db，初始化内容
			_db.guides.find({}).sort({'id': 1}).exec(function(err, docs){
				if( !err && docs && docs.length ){
					for( var i in docs ){
						self.add(docs[i])
					}
				}
			})
	}
}









_frame.app_main.page['guide'].section['输出'] = {
	'dom': {
	},

	'init': function(section){
		var self = this
		
		$('<input type="text" />')
			.on('input', function(){
				_config.set( 'guides_export_to', $(this).val() )
			})
			.val( _config.get( 'guides_export_to' ) )
			.appendTo( section )
		
		$('<button type="button" />')
			.on('click', function(){
				_frame.app_main.page['guide'].section['输出'].export(_config.get( 'guides_export_to' ))
			})
			.html('输出')
			.appendTo( section )
	}
}
_frame.app_main.page['guide'].section['输出'].export = function(dest){
	if( !dest )
		return false
	
	let tmpl_file		= node.path.join( dest, '/!templates/base.html' )
		//,dest_file		= node.path.join( dest, 'index.html' )
		,promise_chain 	= Q.fcall(function(){})
		,template

	// 开始异步函数链
		promise_chain
	
	// 读取模板文件
		.then(function(){
			var deferred = Q.defer()
			node.fs.readFile(tmpl_file, 'utf8', function(err, data){
				if(err){
					deferred.reject(err)
				}
				template = data
				deferred.resolve()
			})
			return deferred.promise
		})
	
	// 读取数据库
		.then(function(){
			var deferred = Q.defer()
			_db.guides.find({}).sort({'id': 1}).exec(function(err, docs){
				if(err){
					deferred.reject(err)
				}
				deferred.resolve(docs)
			})
			return deferred.promise
		})

	// 处理模板文件
		.then(function(docs){
			console.log(docs, template)
			
			let deferred = Q.defer()
				//,html_radios = ''
				//,html_nav = ''
				//,html_main = ''
				,markdown = node.require( "markdown" ).markdown
				,has_default = false
				,searchRes
				,scrapePtrn
				,count_parsed = 0
			
			/*
			docs.forEach(function(doc, i){
				switch( doc.type ){
					case 'guide':
						html_radios+= '<input type="radio" class="none" name="maintab" value="content-'
									+ doc['name']
									+ '" id="maintab-content-'
									+ doc['name']
									+ '"'
									+ (!has_default ? ' checked' : '')
									+' />'
					
						html_nav+= '<a href="'
								+ doc['path'].replace(/index\.html$/gi, '')
								+ '"'
								+ (doc['class-nav'] ? ' class="' + doc['class-nav'] + '"' : '')
								+ '>'
								+ doc['title']
								+ '</a>'
						
						html_main+= '<section id="content-'
									+ doc['name']
									+ '" class="main'
									+ (doc['class-main'] ? ' ' + doc['class-main'] : '')
									+ '">'
									+ markdown.toHTML( doc['content'], 'Maruku' )
									+ '</section>'
						has_default = true
						break;
					
					case 'title':
						html_nav+= '<h2>' + doc['title'] + '</h2>'
						break;
					
					case 'text':
						html_nav+= '<span>' + doc['title'] + '</span>'
						break;
				}
			})
			*/
			
			docs.forEach(function(doc, i){
					let html = template
						,dest_file
						,dest_folder
						,html_nav = ''
						,html_main = ''

					switch( doc.type ){
						case 'guide':
							dest_file = node.path.join( dest, '/' + doc['path'] )
							dest_folder = node.path.dirname(dest_file)
							
							node.mkdirp.sync( dest_folder )
							
							docs.forEach(function(_doc){
								let _class = []
								if( _doc['class-nav'] )
									_class.push( _doc['class-nav'] )
								if( _doc['name'] == doc['name'] )
									_class.push( 'cur' )
								switch( _doc.type ){
									case 'guide':
										html_nav+= '<a href="'
												+ _doc['path'].replace(/index\.html$/gi, '')
												+ '"'
												+ (_class.length ? ' class="' + _class.join(' ') + '"' : '')
												+ '><span>'
												+ _doc['title']
												+ '</span></a>'
										break;
									
									case 'title':
										html_nav+= '<h2>' + _doc['title'] + '</h2>'
										break;
									
									case 'text':
										html_nav+= '<span>' + _doc['title'] + '</span>'
										break;
								}
							})
							
							html_main = '<section id="content-'
											+ doc['name']
											+ '" class="main'
											+ (doc['class-main'] ? ' ' + doc['class-main'] : '')
											+ '">'
											+ markdown.toHTML( doc['content'], 'Maruku' )
							
							if( doc['has-comment'] ){
								let comment_id = doc['name']
									,comment_title = doc['title-html'] || doc['title']
									,comment_url = 'http://kancolle.diablohu.com' + doc['path'].replace(/index\.html$/gi, '')
								html_main+= `<!-- 多说评论框 start -->
	<h3>评论</h3>
	<div class="ds-thread" data-thread-key="${comment_id}" data-title="${comment_title}" data-url="${comment_url}"></div>
<!-- 多说评论框 end -->
<!-- 多说公共JS代码 start (一个网页只需插入一次) -->
<script type="text/javascript">
var duoshuoQuery = {short_name:"diablohu-kancolle"};
	(function() {
		var ds = document.createElement('script');
		ds.type = 'text/javascript';ds.async = true;
		ds.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + '//static.duoshuo.com/embed.js';
		ds.charset = 'UTF-8';
		(document.getElementsByTagName('head')[0] 
		 || document.getElementsByTagName('body')[0]).appendChild(ds);
	})();
	</script>
<!-- 多说公共JS代码 end -->`
							}
							
							html+= '</section>'
							
							html = html.replace('[[[[!!TITLE!!]]]]', doc['title-html'] || doc['title'])
										.replace('[[[[!!NAV!!]]]]', html_nav)
										.replace('[[[[!!MAIN!!]]]]', html_main)
				
							searchRes = null
							scrapePtrn = /\[\[\[([^\]\[]+)\]\]\]/gi
							while( (searchRes = scrapePtrn.exec(html)) !== null ){
								try{
									html = html.replace( searchRes[0], '<span class="highlight">' + searchRes[1] + '</span>' )
								}catch(e){}
							}
						
							searchRes = null
							scrapePtrn = /\[\[node\:([a-z]+)[\:]*([^\]\[\:]*)\]\]/gi
							while( (searchRes = scrapePtrn.exec(html)) !== null ){
								try{
									let node = searchRes[1].toUpperCase()
										,t = searchRes[2].toLowerCase()
										,h = '<span class="node'
									
									if( t )
										h+= ' node-' + t
									
									if( node == 'BOSS' ){
										html = html.replace( searchRes[0],
											h+= ' node-boss">Boss</span>'
										)
									}else{
										html = html.replace( searchRes[0],
											h+= '">' + node + '</span>'
										)
									}
								}catch(e){}
							}
						
							searchRes = null
							scrapePtrn = /\[\[video\:([^\]\[]+)\:([^\]\[]+)\]\]/gi
							while( (searchRes = scrapePtrn.exec(html)) !== null ){
								try{
									let site = searchRes[1].toLowerCase()
										,id = searchRes[2]
									switch(site){
										case 'acfun':
											html = html.replace( searchRes[0],
												'<div class="videoplayer videoplayer-acfun"><div class="videoplayer-body">'
												+ '<iframe'
												+ ' src="https://ssl.acfun.tv/block-player-homura.html#vid=' + id + ';from=http://www.acfun.tv"'
												+ ' id="ACFlashPlayer-re" frameborder="0"></iframe>'
												+ '</div></div>'
											)
											break;
									}
								}catch(e){}
							}
						
							searchRes = null
							scrapePtrn = /\[\[([^\]\[]+)\]\]/gi
							while( (searchRes = scrapePtrn.exec(html)) !== null ){
								try{
									let origin = searchRes[1].toUpperCase()
									if( origin.indexOf('姬') > -1 || origin.indexOf('鬼') > -1 ){
										html = html.replace( searchRes[0],
											'<span class="enemy enemy-boss">' + origin + '</span>'
										)
									}else if( origin.indexOf('改FLAGSHIP') > -1 ){
										html = html.replace( searchRes[0],
											'<span class="enemy enemy-kaiflagship">' + origin.replace(/改FLAGSHIP/gi, '改Flagship') + '</span>'
										)
									}else if( origin.indexOf('FLAGSHIP') > -1 ){
										html = html.replace( searchRes[0],
											'<span class="enemy enemy-flagship">' + origin.replace(/FLAGSHIP/gi, 'Flagship') + '</span>'
										)
									}else if( origin.indexOf('ELITE') > -1 ){
										html = html.replace( searchRes[0],
											'<span class="enemy enemy-elite">' + origin.replace(/ELITE/gi, 'Elite') + '</span>'
										)
									}else if( origin.indexOf('级') > -1 ){
										html = html.replace( searchRes[0],
											'<span class="enemy">' + origin + '</span>'
										)
									}else if( origin.indexOf('后期') > -1 ){
										html = html.replace( searchRes[0],
											'<span class="enemy">' + origin + '</span>'
										)
									}
								}catch(e){}
							}
				
							console.log(html)
							
							node.fs.writeFile(dest_file, html, function(err){
								if(err){
									deferred.reject(err)
								}
								count_parsed++
								if( count_parsed >= docs.length )
									deferred.resolve()
							})
							break;
							
						default:
							count_parsed++
							if( count_parsed >= docs.length )
								deferred.resolve()
							break;
					}
			})
			
			return deferred.promise
		})

	// 完成
		.done(function(){
			console.log('DONE!')
		})
}