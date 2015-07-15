_form.section_order = function( name, function_line, defaults ){
	var section = $('<section class="form_section" data-name="'+name+'"/>')
					.append( $('<h4>' + name + '</h4>') )
		,defaults = defaults || []
		//,pointer = 0
		,length = 0
		//,exists = parseInt( defaults ? defaults.length : 0 )
		,btn_add_link = $('<button class="add" type="button"/>').on('click', function(){
						appendLine({}, length)
					}).html('添加' + name).appendTo(section)

	function refreshAll(){
		var sections = section.children('.line').removeClass('first last')
		sections.eq(0).addClass('first')
		sections.eq(-1).addClass('last')
	}

	function appendLine(data, index){
		index = parseInt( index || 0 )
		var line = function_line( data || {}, index )
						.addClass('line line-sortable')
						.data({
							'index': 	parseInt( index )
						})
						.insertBefore(btn_add_link)
						//.appendTo( section )
			,btns = $('<span class="btns"/>').appendTo(line)

		// button: move up
			,btn_up = $('<button class="up" type="button"/>')
						.html('&#8679')
						.on('click', function(){
							var indexCur = line.data('index')
							if( indexCur <= 0 )
								return false
							var lineAhead = line.prev()
							line.insertBefore( lineAhead )
								.data('index', indexCur - 1 )
							lineAhead.data('index', indexCur )
							refreshAll()
						})
						.appendTo(btns)

		// button: move down
			,btn_down = $('<button class="down" type="button"/>')
						.html('&#8681')
						.on('click', function(){
							var indexCur = line.data('index')
							if( indexCur >= length - 1 )
								return false
							var lineBehind = line.next()
							line.insertAfter( lineBehind )
								.data('index', indexCur + 1 )
							lineBehind.data('index', indexCur )
							refreshAll()
						})
						.appendTo(btns)

		// button: delete
			,btn_delete = $('<button class="delete" type="button"/>')
						.html('&times;')
						.on('click', function(){
							line.remove()
							line.nextAll().each(function(){
								var indexCur = $(this).data('index')
								$(this).data('index', indexCur-1)
							})
							length--
							refreshAll()
						})
						.appendTo(btns)

		length++
		refreshAll()
		return line
	}

	for( var i in defaults )
		appendLine(defaults[i], i)

	return section
}












_form.create_equip_types = function(name, defaults){
	var itemtype_checkboxes = _p.el.flexgrid.create().addClass('item_types')
	defaults = defaults || []
	_db.item_types.find({}).sort({'id': 1}).exec(function(err, docs){
		for(var i in docs ){
			var type_id = parseInt(docs[i]['id'])
				,input_id = '_input_g' + _g.inputIndex
				,unitDOM = $('<div class="unit"/>')
			itemtype_checkboxes.appendDOM(unitDOM)
			_g.inputIndex++
			$('<input type="checkbox" name="'+name+'" value="'+type_id+'" id="'+input_id+'">')
				.prop('checked', ($.inArray(type_id, defaults) > -1) )
				.appendTo( unitDOM )
			$('<label for="'+input_id+'"/>')
				.html(
					'<span style="background-image: url(../app/assets/images/itemicon/transparent/'+docs[i]['icon']+'.png)"></span>'
					+ docs[i]['name']['zh_cn']
				)
				.appendTo(unitDOM)
		}
	})

	return itemtype_checkboxes
}
_form.create_item_types = _form.create_equip_types