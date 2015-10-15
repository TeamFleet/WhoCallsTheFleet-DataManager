_frame.app_main.page['update'] = {}
_frame.app_main.page['update'].section = {}








_frame.app_main.page['update'].field_input_text = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<input type="text" required name="'+name+'" />').val(value).appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['update'].field_input_date = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<input type="date" name="'+name+'" />').val(value).appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['update'].field_input_checkbox = function(name, title, value, suffix){
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
_frame.app_main.page['update'].field_input_textarea = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<textarea required name="'+name+'" />').val(value).attr({
		'cols': 	60,
		'rows': 	20
	}).appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['update'].field_actions = function(text, func_delete){
	var line = $('<p class="actions"/>')
	$('<button type="submit"/>').html(text || '提交').appendTo(line)
	if( func_delete ){
		$('<button type="button"/>').html('删除').on('click', function(){
			func_delete()
		}).appendTo(line)
	}
	return line
}










_frame.app_main.page['update'].gen_form_new_journal = function( callback, data_edit, callback_remove ){
	callback = callback || function(){}
	let is_edit = (data_edit)
	var self = this
		,form = $('<form class="update_journal"/>').on('submit',function(e){
					e.preventDefault()
					var data = $(this).serializeObject()

					data['version'] = node.semver.clean( data['version'] )

					console.log(data)
					//return data

					if( is_edit ){
						// 编辑操作
						_db.updates.update({
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
							_db.updates.count({}, function(err, count){
								data['id'] = parseInt(count) + 1
								_db.updates.insert(
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
			'app',
			'app-db',
			'pics'
		],
		{
			'default': is_edit ? data_edit['type'] : null
		}).insertBefore(input_container)
	self.field_input_text('version', '版本号', is_edit ? data_edit['version'] : null).appendTo(input_container)
	self.field_input_date('date', '更新日', is_edit ? data_edit['date'] : null).appendTo(input_container)
	self.field_input_checkbox('hotfix', null, is_edit ? data_edit['hotfix'] : false, 'HOTFIX ?').appendTo(input_container)
	self.field_input_textarea('journal', '更新日志', is_edit ? data_edit['journal'] : null).appendTo(input_container)

	self.field_actions(
		is_edit ? '更新' : null,
		callback_remove ? function(){
				_db.updates.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
					callback_remove()
					_frame.modal.hide()
				});
			} : null
	).appendTo(form)
	return form
}

















_frame.app_main.page['update'].init = function(page){
	page.find('section').on({
		'tabview-show': function(){
			var section = $(this)
				,name = section.data('tabname')

			if( !_frame.app_main.page['update'].section[name] )
				_frame.app_main.page['update'].section[name] = {}

			var _o = _frame.app_main.page['update'].section[name]

			if( !_o.is_init && _o.init ){
				_o.init(section)
				_o.is_init = true
			}
		}
	})
}









_frame.app_main.page['update'].section['更新日志'] = {
	'dom': {
	},

	// 相关表单/按钮
		'titlebtn': function( d ){
			var self = this
				,btn = $('<button class="unit"/>').html(
							'<strong>'
								+ d['type'].toUpperCase()
								+ '/'
								+ d['version']
							+ '</strong><br/>'
							+ '<small><em>'+d['date']+'</em></small>'
						)
						.on('click', function(){
							_frame.modal.show(
								_frame.app_main.page['update'].gen_form_new_journal(
									function( newdata ){
										self.titlebtn( newdata )
											.insertAfter( btn )
										btn.remove()
									},
									d,
									function(){
										btn.remove()
									}
								) , '编辑更新日志')
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
							_frame.app_main.page['update'].gen_form_new_journal(
								function(err, newDoc) {
									self.add(newDoc)
									_frame.modal.hide()
								}
							), '新建更新日志')
					}).appendTo( self.dom.new_container )

		// 列表container
			self.dom.main = $('<div class="main"/>').appendTo( section )
			self.dom.list = _p.el.flexgrid.create().addClass('flexgrid-basic update_history').appendTo( self.dom.main )

		// 读取db，初始化内容
			_db.updates.find({}).sort({'date': -1}).exec(function(err, docs){
				if( !err && docs && docs.length ){
					for( var i in docs ){
						self.add(docs[i])
					}
				}
			})
	}
}