_frame.app_main.page['entities'] = {}
_frame.app_main.page['entities'].section = {}

_frame.app_main.page['entities'].gen_form_new_entity = function( callback, data_edit, callback_remove ){
	callback = callback || function(){}
	var self = _frame.app_main.page['entities']
		,form = $('<form class="new_entity"/>').on('submit',function(e){
					e.preventDefault()
					var data = $(this).serializeObject()

					// links
						data['links'] = []
						data.link_name = data.link_name.push ? data.link_name : [data.link_name]
						data.link_url = data.link_url.push ? data.link_url : [data.link_url]
						for( var i in data.link_name ){
							data['links'][i] = {
								'name': data.link_name[i],
								'url': data.link_url[i]
							}
						}
						data.link_name = null
						data.link_url = null
						delete data.link_name
						delete data.link_url

					if( data_edit ){
						// 编辑操作
						_db['entities'].update({
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
							_db['entities'].count({}, function(err, count){
								data['id'] = parseInt(count) + 1
								_db['entities'].insert(
									data,
									callback
								);
							})
					}
				})

	$('<h4/>').html('名称').appendTo(form)
		_frame.app_main.page['ships'].section['舰种&舰级'].field_input_text('name.ja_jp', '日', data_edit ? data_edit['name']['ja_jp'] : null).appendTo(form)
		_frame.app_main.page['ships'].section['舰种&舰级'].field_input_text('name.zh_cn', '简中', data_edit ? data_edit['name']['zh_cn'] : null).appendTo(form)

	_form.section_order(
		'链接',
		function(data, index){
			var line = $('<p/>')
				,id = '_input_g' + _g.inputIndex
				,name = data['name'] || null
				,url = data['url'] || null

			_g.inputIndex++

			$('<label for="'+id+'"/>').appendTo(line)

			_frame.app_main.page['ships'].gen_input(
					'text',
					'link_name',
					id,
					name,
					{'notRequired': true}
				).appendTo(line)

			id = '_input_g' + _g.inputIndex
			_g.inputIndex++
			$('<label for="'+id+'"/>').html( 'URL' ).appendTo(line)
			_frame.app_main.page['ships'].gen_input(
					'text',
					'link_url',
					id,
					url,
					{'notRequired': true}
				).appendTo(line)

			return line
		},
		$.extend(true,
			[
				{
					'name': 'Twitter',
					'url': 	null
				}
			],data_edit ? data_edit['links'] : [])
	).appendTo(form)
		//_frame.app_main.page['ships'].section['舰种&舰级'].field_input_text('name.zh_cn', '简中', data_edit ? data_edit['name']['zh_cn'] : null).appendTo(form)

	_frame.app_main.page['ships'].section['舰种&舰级'].field_actions(
		data_edit ? '更新' : null,
		callback_remove ? function(){
				_db['entities'].remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
					callback_remove()
					_frame.modal.hide()
				});
			} : null
	).appendTo(form)

	return form
}

_frame.app_main.page['entities'].init = function(page){
	page.find('section').on({
		'tabview-show': function(){
			var section = $(this)
				,name = section.data('tabname')

			if( !_frame.app_main.page['entities'].section[name] )
				_frame.app_main.page['entities'].section[name] = {}

			var _o = _frame.app_main.page['entities'].section[name]

			if( !_o.is_init && _o.init ){
				_o.init(section)
				_o.is_init = true
			}
		}
	})
}









_frame.app_main.page['entities'].section['人物&组织'] = {
	'dom': {},

	// 返回HTML内容
		'get_content': function(d){
			return '<strong>' + d['name']['zh_cn'] + '</strong>'
				+ '<small>' + d['name']['ja_jp'] + '</small>'
		},

	// 相关表单/按钮
		'get_titlebtn': function( d ){
			var self = _frame.app_main.page['entities'].section['人物&组织']
				,btn = $('<button class="ship_suffix"/>').html(
						self.get_content(d)
					).on('click', function(){
						_frame.modal.show(
							_frame.app_main.page['entities'].gen_form_new_entity(
								function( newdata ){
									btn.html(self.get_content(newdata))
								},
								d,
								function(){
									btn.remove()
								}
							) , '编辑实体')
					})
			return btn
		},

	// 新建完毕，添加内容
		'added_entity': function( d ){
			var self = _frame.app_main.page['entities'].section['人物&组织']

			// 舰种标题，同时也是编辑按钮
				self.get_titlebtn(d).appendTo( self.dom.section )
		},

	'init': function(section){
		var self = _frame.app_main.page['entities'].section['人物&组织']

		// 新建按钮
			self.dom.new_container = $('<div class="new_container"/>').appendTo( section )
				self.dom.btnnew = $('<button/>').html('新建').on('click',function(){
						_frame.modal.show(
							_frame.app_main.page['entities'].gen_form_new_entity(
								function(err, newDoc) {
									self.added_entity(newDoc)
									_frame.modal.hide()
								}
							), '新建实体')
					}).appendTo( self.dom.new_container )

		// 读取实体列表，创建内容
			self.dom.section = $('<div class="main"/>').appendTo(section)
			_db['entities'].find({}).sort({ 'id': 1 }).exec(function(err, docs){
				if( !err ){
					for(var i in docs ){
						self.added_entity(docs[i])
					}
				}
			})

	}
}