/*
batch:
	EQUIPMENT.upgrade_from
	arsenal_by_day
*/



_frame.app_main.page['items'] = {}
_frame.app_main.page['items'].section = {}









_frame.app_main.page['items'].show_item_form = function(d){
	console.log(d)
	d['default_equipped_on'] = d['default_equipped_on'] || []

	function _input(name, label, suffix, options){
		return _frame.app_main.page['ships'].gen_form_line(
			'text', name, label, eval( 'd.' + name ) || '', suffix, options
		)
	}
	function _stat(stat, label){
		var line = $('<p/>')
			,id = '_input_g' + _g.inputIndex
		_g.inputIndex++

		switch( stat ){
			case 'dismantle':
				$('<label for="'+id+'"/>').html( '燃料' ).appendTo(line)
				var input = _frame.app_main.page['ships'].gen_input(
						'number',
						'dismantle',
						id,
						d.dismantle[0]
					).appendTo(line)

				id = '_input_g' + _g.inputIndex
				_g.inputIndex++
				$('<label for="'+id+'"/>').html( '弹药' ).appendTo(line)
				_frame.app_main.page['ships'].gen_input(
						'number',
						'dismantle',
						id,
						d.dismantle[1]
					).appendTo(line)

				id = '_input_g' + _g.inputIndex
				_g.inputIndex++
				$('<label for="'+id+'"/>').html( '钢材' ).appendTo(line)
				_frame.app_main.page['ships'].gen_input(
						'number',
						'dismantle',
						id,
						d.dismantle[2]
					).appendTo(line)

				id = '_input_g' + _g.inputIndex
				_g.inputIndex++
				$('<label for="'+id+'"/>').html( '铝土' ).appendTo(line)
				_frame.app_main.page['ships'].gen_input(
						'number',
						'dismantle',
						id,
						d.dismantle[3]
					).appendTo(line)
				break;
			case 'range':
				var value = d.stat[stat]

				$('<label for="'+id+'"/>').html( label ).appendTo(line)
				var input = _frame.app_main.page['ships'].gen_input(
						'select',
						'stat.'+stat,
						id,
						[
							{
								'value': 	'1',
								'title': 	'短'
							},
							{
								'value': 	'2',
								'title': 	'中'
							},
							{
								'value': 	'3',
								'title': 	'长'
							},
							{
								'value': 	'4',
								'title': 	'超长'
							}
						],
						{
							'default': 	value
						}
					).appendTo(line)
				$('<label for="'+id+'"/>').html( '当前值: ' + value ).appendTo(line)
				break;
			default:
				var value = d.stat[stat]
				$('<label for="'+id+'"/>').html( label ).appendTo(line)
				var input = _frame.app_main.page['ships'].gen_input(
						'number',
						'stat.'+stat,
						id,
						value
					).appendTo(line)
				break;
		}

		return line
	}
	function _upgrade_to(no, equipment, star){
		var line = $('<p/>')
			,id = '_input_g' + _g.inputIndex
		_g.inputIndex++

		$('<label for="'+id+'"/>').html( '可升级为' ).appendTo(line)
		_comp.selector_equipment('upgrade_to', '', equipment).appendTo(line)
		/*
		_frame.app_main.page['ships'].gen_input(
				'number',
				'upgrade_to',
				id,
				equipment
			).appendTo(line)*/

		id = '_input_g' + _g.inputIndex
		_g.inputIndex++
		$('<label for="'+id+'"/>').html( '初始星级' ).appendTo(line)
		_frame.app_main.page['ships'].gen_input(
				'number',
				'upgrade_to_star',
				id,
				star
			).appendTo(line)

		// 删除本行信息
		$('<button type="button" class="delete"/>').html('&times;').on('click', function(){
			line.remove()
		}).appendTo(line)

		return line
	}
	function _improvement( improvement ){
		improvement = improvement || {
				// 可升级为
				// 不可升级为 false
				// 可升级为 [NUMBER euipment_id, NUMBER base_star]
					upgrade: false,
				// 资源消费
					resource: [
						// 必要资源		油/弹/钢/铝
							[0, 0, 0, 0],
						// +0 ~ +5		开发资材 / 开发资材（确保） / 改修资财 / 改修资财（确保） / 需要装备 / 需要装备数量
							[0, 0, 0, 0, null, 0],
						// +6 ~ MAX		开发资材 / 开发资材（确保） / 改修资财 / 改修资财（确保） / 需要装备 / 需要装备数量
							[0, 0, 0, 0, null, 0],
						// 升级			开发资材 / 开发资材（确保） / 改修资财 / 改修资财（确保） / 需要装备 / 需要装备数量
							[0, 0, 0, 0, null, 0]
					],
				// 星期 & 秘书舰
					req: [
						[
							// 星期，0为周日，1为周一
							[false, false, false, false, false, false, false],
							// 秘书舰，ARRAY，舰娘ID，没有则为false
							false
						]
					]
			}

		var block = $('<div class="improvement"/>')
			,id
			,line

		// 可升级至
			line = $('<p class="upgrade"/>').appendTo(block)

			$('<label/>').html( '可升级为' ).appendTo(line)
			_comp.selector_equipment(
				'',
				'',
				improvement.upgrade ? improvement.upgrade[0] : null
			).appendTo(line)

			id = _g.newInputIndex()
			$('<label for="'+id+'"/>').html( '初始星级' ).appendTo(line)
			_frame.app_main.page['ships'].gen_input(
					'number',
					'',
					id,
					improvement.upgrade ? improvement.upgrade[1] : 0
				).appendTo(line)

		// 星期 & 秘书舰
			var subblock = $('<div class="require"/>').html('<h5>星期 & 秘书舰</h5>').appendTo(block)
			function _reqs(req){
				var reqblock = $('<div/>').appendTo(block)

				$('<h6/>').html('星期').appendTo(reqblock)
				for(var j=0; j<7; j++){
					var text
					switch(j){
						case 0: text='日'; break;
						case 1: text='一'; break;
						case 2: text='二'; break;
						case 3: text='三'; break;
						case 4: text='四'; break;
						case 5: text='五'; break;
						case 6: text='六'; break;
					}
					id = _g.newInputIndex()
					$('<input type="checkbox" id="'+id+'"/>').prop('checked', req[0][j]).appendTo(reqblock)
					$('<label for="'+id+'"/>').html(text).appendTo(reqblock)
				}

				$('<h6/>').html('秘书舰').appendTo(reqblock)
				function _reqship(reqship){
					var reqshipline = $('<p/>').appendTo(reqblock)
					_comp.selector_ship(null, null, reqship).appendTo(reqshipline)
					// 删除本条信息
						$('<button type="button" class="delete"/>').html('&times;').on('click', function(){
							reqshipline.remove()
						}).appendTo(reqshipline)
					return reqshipline
				}
				for(var ii=0; ii<(req[1] ? req[1].length : 0); ii++ ){
					_reqship(req[1] ? req[1][ii] : false).appendTo(reqblock)
				}
				var btn_add_reqship = $('<button class="add" type="button"/>').on('click', function(){
					_reqship().insertBefore(btn_add_reqship)
				}).html('+ 秘书舰').appendTo(reqblock)

				// 删除本条信息
					$('<button type="button" class="delete"/>').html('&times;').on('click', function(){
						reqblock.remove()
					}).appendTo(reqblock)

				return reqblock
			}
			for(var i=0; i<improvement.req.length; i++ ){
				_reqs(improvement.req[i]).appendTo(subblock)
			}
			var btn_add_reqs = $('<button class="add" type="button"/>').on('click', function(){
				_reqs([
					// 星期，0为周日，1为周一
					[false, false, false, false, false, false, false],
					// 秘书舰，ARRAY，舰娘ID
					false
				]).insertBefore(btn_add_reqs)
			}).html('+ 要求').appendTo(subblock)

		// 资源消费
			// 固定资源
				line = $('<p class="resource resource-all"/>')
					.append(
						$('<h5/>').html('资源消费')
					).appendTo(block)

				id = _g.newInputIndex()
				$('<label for="'+id+'"/>').html( '燃料' ).appendTo(line)
				_frame.app_main.page['ships'].gen_input(
						'number',
						'',
						id,
						improvement.resource[0][0]
					).appendTo(line)

				id = _g.newInputIndex()
				$('<label for="'+id+'"/>').html( '弹药' ).appendTo(line)
				_frame.app_main.page['ships'].gen_input(
						'number',
						'',
						id,
						improvement.resource[0][1]
					).appendTo(line)

				id = _g.newInputIndex()
				$('<label for="'+id+'"/>').html( '钢材' ).appendTo(line)
				_frame.app_main.page['ships'].gen_input(
						'number',
						'',
						id,
						improvement.resource[0][2]
					).appendTo(line)

				id = _g.newInputIndex()
				$('<label for="'+id+'"/>').html( '铝土' ).appendTo(line)
				_frame.app_main.page['ships'].gen_input(
						'number',
						'',
						id,
						improvement.resource[0][3]
					).appendTo(line)
			// 其他资源
				for(var i=1; i<4; i++){
					var title
					switch(i){
						case 1:	title = '+0 ~ +5'; break;
						case 2:	title = '+6 ~ MAX'; break;
						case 3:	title = '升级'; break;
					}
					line = $('<p class="resource resource-mat"/>')
						.append(
							$('<h5/>').html(title)
						).appendTo(block)

					id = _g.newInputIndex()
					$('<label for="'+id+'"/>').html( '开发' ).appendTo(line)
					_frame.app_main.page['ships'].gen_input(
							'number',
							'',
							id,
							improvement.resource[i][0]
						).appendTo(line)

					id = _g.newInputIndex()
					$('<label for="'+id+'"/>').html( '确' ).appendTo(line)
					_frame.app_main.page['ships'].gen_input(
							'number',
							'',
							id,
							improvement.resource[i][1]
						).appendTo(line)

					id = _g.newInputIndex()
					$('<label for="'+id+'"/>').html( '改修' ).appendTo(line)
					_frame.app_main.page['ships'].gen_input(
							'number',
							'',
							id,
							improvement.resource[i][2]
						).appendTo(line)

					id = _g.newInputIndex()
					$('<label for="'+id+'"/>').html( '确' ).appendTo(line)
					_frame.app_main.page['ships'].gen_input(
							'number',
							'',
							id,
							improvement.resource[i][3]
						).appendTo(line)

					$('<label/>').html( '装备' ).appendTo(line)
					_comp.selector_equipment(
						'',
						'',
						improvement.resource[i][4]
					).appendTo(line)

					id = _g.newInputIndex()
					$('<label for="'+id+'"/>').html( '量' ).appendTo(line)
					_frame.app_main.page['ships'].gen_input(
							'number',
							'',
							id,
							improvement.resource[i][5]
						).appendTo(line)
				}

		// 删除本条信息
			$('<button type="button" class="delete"/>').html('&times;').on('click', function(){
				block.remove()
			}).appendTo(block)

		return block
	}

	var form = $('<form class="iteminfo new"/>')

		,base = $('<div class="base"/>').appendTo(form)
		,details = $('<div class="tabview"/>').appendTo(form)

		// 如果有 _id 则表明已存在数据，当前为编辑操作，否则为新建操作
		,_id = d._id ? $('<input type="hidden"/>').val( d._id ) : null

		,details_stat = $('<section data-tabname="属性"/>').appendTo(details)
		,details_craft = $('<section data-tabname="开发&改修"/>').appendTo(details)
		,details_equipped = $('<section data-tabname="初装舰娘"/>').appendTo(details)

	// 标准图鉴
		,base_image = $('<div class="image"/>').css('background-image', 'url(../pics/items/'+d['id']+'/card.png)').appendTo(base)

	// 基础信息
		_input('id', 'ID', null, {'required': true}).appendTo(base)
		_input('rarity', '稀有度', null, {'required': true}).appendTo(base)
		// 类型
			var base_type = _frame.app_main.page['ships'].gen_form_line(
					'select',
					'type',
					'类型',
					[]
				).appendTo(base)
			_db.item_types.find({}).sort({ 'id': 1 }).exec(function(err, docs){
				if( !err ){
					var types = []
						,sel = base_type.find('select')
					for(var i in docs ){
						types.push({
							//'value': 	docs[i]['_id'],
							'value': 	docs[i]['id'],
							'title': 	docs[i]['name']['zh_cn']
						})
					}
					// 实时载入类型数据
					_frame.app_main.page['ships'].gen_input(
						'select',
						sel.attr('name'),
						sel.attr('id'),
						types,
						{
							'default': d['type'],
							'new': function( select ){
								console.log( 'NEW SHIP TYPE', select )
							}
						}).insertBefore(sel)
					sel.remove()
				}
			})
		var h4 = $('<h4/>').html('装备名').appendTo(base)
		var checkbox_id = '_input_g' + _g.inputIndex
		_g.inputIndex++
		_input('name.ja_jp', '<small>日</small>').appendTo(base)
		_input('name.ja_kana', '<small>日假名</small>').appendTo(base)
		_input('name.ja_romaji', '<small>罗马音</small>').appendTo(base)
		_input('name.zh_cn', '<small>简中</small>').appendTo(base)


	// 属性
		_stat('fire', '火力').appendTo(details_stat)
		_stat('torpedo', '雷装').appendTo(details_stat)
		_stat('bomb', '爆装').appendTo(details_stat)
		_stat('asw', '对潜').appendTo(details_stat)
		_stat('aa', '对空').appendTo(details_stat)
		_stat('armor', '装甲').appendTo(details_stat)
		_stat('evasion', '回避').appendTo(details_stat)
		_stat('hit', '命中').appendTo(details_stat)
		_stat('los', '索敌').appendTo(details_stat)
		_stat('range', '射程').appendTo(details_stat)

		$('<h4/>').html('废弃资源').appendTo(details_stat)
		_stat('dismantle').appendTo(details_stat)


	// 开发&改修
		var line = $('<p/>').appendTo( details_craft )
			,id = '_input_g' + _g.inputIndex
		_g.inputIndex++
		_frame.app_main.page['ships'].gen_input(
				'checkbox',
				'craftable',
				id,
				d.craftable || false
			).appendTo(line)
		$('<label for="'+id+'"/>').html( '可开发' ).appendTo(line)

		line = $('<p/>').appendTo( details_craft )
		id = '_input_g' + _g.inputIndex
		_g.inputIndex++
		_frame.app_main.page['ships'].gen_input(
				'checkbox',
				'rankupgradable',
				id,
				d.rankupgradable || false
			).appendTo(line)
		$('<label for="'+id+'"/>').html( '可提升熟练度' ).appendTo(line)

		// 改修
			$('<h4/>').html('改修').appendTo(details_craft)
			for(var i=0; i<(d['improvement'] ? d['improvement'].length : 0); i++ ){
				_improvement(d['improvement'] ? d['improvement'][i] : null).appendTo(details_craft)
			}
			var btn_add_improvement = $('<button class="add" type="button"/>').on('click', function(){
				_improvement().insertBefore(btn_add_improvement)
			}).html('+ 改修项目').appendTo(details_craft)
		/*
		var line = $('<p/>').appendTo( details_craft )
			,id = '_input_g' + _g.inputIndex
		_g.inputIndex++
		_frame.app_main.page['ships'].gen_input(
				'checkbox',
				'improvable',
				id,
				d.improvable || false
			).appendTo(line)
		$('<label for="'+id+'"/>').html( '可改修' ).appendTo(line)
		for(var i=0; i<(d['upgrade_to'] ? d['upgrade_to'].length : 0); i++ ){
			_upgrade_to(
				(i+1),
				d['upgrade_to'][i][0] || null,
				d['upgrade_to'][i][1] || '0'
			).appendTo(details_craft)
		}
		var btn_add_upgrade_to = $('<button class="add" type="button"/>').on('click', function(){
			details_craft.find('input[name="improvable"]').prop('checked', true)
			_upgrade_to(
				details_craft.find('input[name="upgrade_to"]').length + 1,
				null,
				'0'
			).insertBefore(btn_add_upgrade_to)
		}).html('+ 可升级为...').appendTo(details_craft)
		*/


	// 初装舰娘
		var ships_equipped = {}
		_db.ships.find({"equip": d['id']}, function(err,docs){
			for(var i in docs){
				if( typeof ships_equipped[docs[i]['series']] == 'undefined' )
					ships_equipped[docs[i]['series']] = []
				ships_equipped[docs[i]['series']].push( docs[i] )
			}
			for(var i in ships_equipped){
				ships_equipped[i].sort(function(a,b){
					return a['name']['suffix'] - b['name']['suffix']
				})
				for( var j in ships_equipped[i] ){
					d['default_equipped_on'].push( ships_equipped[i][j]['id'] )
					$('<div/>')
						.html(
							'<img src="../pics/ships/'+ships_equipped[i][j]['id']+'/0.png"/>'
							+ '[' + ships_equipped[i][j]['id'] + '] '
							+ (ships_equipped[i][j]['name']['zh_cn'] || ships_equipped[i][j]['name']['ja_jp'])
							+ (ships_equipped[i][j]['name']['suffix']
								? '・' + _g.data.ship_namesuffix[ships_equipped[i][j]['name']['suffix']]['zh_cn']
								: '')
						)
						.appendTo(details_equipped)
				}
			}
		})


	// 提交等按钮
		var line = $('<p class="actions"/>').appendTo( form )
		$('<button type="submit"/>').html( d._id ? '编辑' : '入库').appendTo(line)


	// 提交函数
		form.on('submit', function(e){
			e.preventDefault()
			var data = {}
				,$form = $(this)
			function start_db_operate(){
				if( _id ){
					// 存在 _id，当前为更新操作
					data.time_modified = _g.timeNow()
					console.log( 'EDIT', data )
					_db.items.update({
						'_id': 		d._id
					},{
						$set: data
					},{}, function(err, numReplaced){
						console.log('UPDATE COMPLETE', numReplaced, data)
						data._id = d._id
						// 在已入库表格中更改原有数据行
							var oldTr = _frame.app_main.page['items'].section['已入库'].dom.section
											.find('[data-itemid="'+data['id']+'"]')
							_frame.app_main.page['items'].section['已入库'].dom.section.data('itemlist').append_item( data )
								.insertBefore( oldTr )
							oldTr.remove()
							_frame.modal.hide()
					})
				}else{
					// 不存在 _id，当前为新建操作
					data.time_created = _g.timeNow()
					// 删除JSON数据
						node.fs.unlink(_g.path.fetched.items + '/' + data['id'] + '.json', function(err){
							_db.items.insert(data, function(err, newDoc){
								console.log('INSERT COMPLETE', newDoc)
								// 删除“未入库”表格中对应的行
									try{
										_frame.app_main.page['items'].section['未入库'].dom.main
											.find('[data-itemid="'+data['id']+'"]').remove()
									}catch(e){}
								// 在“已入库”表格开头加入行
									_frame.app_main.page['items'].section['已入库'].dom.section.data('itemlist').append_item( newDoc )
								_frame.modal.hide()
							})
						})
				}
			}

			// 处理所有数据
				data = $form.serializeObject()
				//data['default_equipped_on'] = d['default_equipped_on']
				delete( data['default_equipped_on'] )
				data['craftable'] = data['craftable'] ? true : false

				// 改修数据
					data.improvable = false
					data.upgrade_to = null
					data['improvement'] = false
					$form.find('.improvement').each(function(index){
						data.improvable = true
						if( !data['improvement'] )
							data['improvement'] = []
						var data_improvement = {
								'upgrade': 	false,
								'req':		[],
								'resource':	[[],[],[],[]]
							}
							,$this = $(this)
						// upgrade
							var upgrade = $this.find('.upgrade')
								,upgrade_to = parseInt(upgrade.find('select').val())
							if( !isNaN(upgrade_to) ){
								if( !data.upgrade_to )
									data.upgrade_to = []
								var base_star = parseInt($this.find('input[type="number"]').val()) || 0
								data_improvement.upgrade = [
									upgrade_to,
									base_star
								]
								data.upgrade_to.push([upgrade_to, base_star])
							}
						// req
							$this.find('.require>div').each(function(i){
								var data_req = [[], false]
								$(this).find('input[type="checkbox"]').each(function(weekday){
									data_req[0][weekday] = $(this).prop('checked')
								})
								$(this).find('select').each(function(shipindex){
									if( !data_req[1] )
										data_req[1] = []
									var val = $(this).val()
									if( val )
										data_req[1].push( parseInt(val) )
								})
								data_improvement.req.push(data_req)
							})
						// resource
							$this.find('.resource').each(function(i){
								$(this).find('input, select').each(function(inputindex){
									data_improvement.resource[i].push( parseInt($(this).val()) || 0 )
								})
							})
						data['improvement'].push(data_improvement)
					})
				// 改修升级数据
				/*
					data['improvable'] = data['improvable'] ? true : false
					if( data['upgrade_to'] ){
						var _d_upgrade_to = []
						if( !data['upgrade_to'].push )
							data['upgrade_to'] = [ data['upgrade_to'] ]
						if( !data['upgrade_to_star'].push )
							data['upgrade_to_star'] = [ data['upgrade_to_star'] ]
						for( var i in data['upgrade_to'] ){
							_d_upgrade_to[i] = [
								data['upgrade_to'][i],
								data['upgrade_to_star'][i] || 0
							]
						}
						data['upgrade_to'] = _d_upgrade_to
						delete( data['upgrade_to_star'] )
					}else{
						data['upgrade_to'] = null
					}
				*/
				console.log(data)
				//return data

			// 写入数据库
				start_db_operate()
		})


	_frame.modal.show(
		form,
		d.name.ja_jp || '未入库装备',
		{
			'classname': 	'infos_form'
		}
	)
}








_frame.app_main.page['items'].field_input_text = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<input type="text" required name="'+name+'" />').val(value).appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['items'].field_select_items = _comp.selector_equipment
/*
_frame.app_main.page['items'].field_select_items = function( name, label, default_item ){
	var dom = _frame.app_main.page['ships'].gen_input(
			'select',
			name,
			label,
			[]
		)
		,equipments = []
		,options = []

	_db.item_types.find({}).sort({'id': 1}).exec(function(err, docs){
		if( !err && docs && docs.length ){
			for( var i in docs ){
				equipments[docs[i]['id']] = [
					docs[i]['name']['zh_cn'],
					[]
				]
			}
			_db.items.find({}).sort({ 'type': 1, 'rarity': 1, 'id': 1 }).exec(function(err, docs){
				for(var i in docs ){
					//equipments[docs[i]['type']][1].push(docs[i])
					equipments[docs[i]['type']][1].push({
							'name': 	docs[i]['name']['zh_cn'],
							'value': 	docs[i]['id']
						})
				}

				for( var i in equipments ){
					options.push({
						'name': 	'=====' + equipments[i][0] +  '=====',
						'value': 	''
					})
					for( var j in equipments[i][1] ){
						options.push({
							'name': 	equipments[i][1][j]['name']['zh_cn'],
							'value': 	equipments[i][1][j]['id']
						})
					}
				}
				//console.log( equipments )
				//console.log( options )

				_frame.app_main.page['ships'].gen_input(
					'select_group',
					dom.attr('name'),
					dom.attr('id'),
					equipments,
					{
						'default': default_item
					}).insertBefore(dom)
				dom.remove()
			})
		}
	})
	return dom
}*/
_frame.app_main.page['items'].field_actions = function(text, func_delete){
	var line = $('<p class="actions"/>')
	$('<button type="submit"/>').html(text || '提交').appendTo(line)
	if( func_delete ){
		$('<button type="button"/>').html('删除').on('click', function(){
			func_delete()
		}).appendTo(line)
	}
	return line
}










_frame.app_main.page['items'].gen_form_new_item_type = function( callback, data_edit, callback_remove ){
	callback = callback || function(){}
	let is_edit = (data_edit)
	var self = _frame.app_main.page['items']
		,form = $('<form class="itemform item_type"/>').on('submit',function(e){
					e.preventDefault()
					var data = $(this).serializeObject()

					if( typeof data['equipable_on_type'] != 'object' && typeof data['equipable_on_type'] != 'undefined' )
						data['equipable_on_type'] = [data['equipable_on_type']]
					data['equipable_on_type'] = data['equipable_on_type'] || []

					/* scrapped 2015/05/26
					if( typeof data['equipable_on_stat'] != 'object' && typeof data['equipable_on_stat'] != 'undefined' )
						data['equipable_on_stat'] = [data['equipable_on_stat']]
					data['equipable_on_stat'] = data['equipable_on_stat'] || []
					*/

					if( is_edit ){
						// 编辑操作
						_db.item_types.update({
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
							_db.item_types.count({}, function(err, count){
								data['id'] = parseInt(count) + 1
								_db.item_types.insert(
									data,
									callback
								);
							})
					}
				})
		,input_container = $('<div/>').appendTo(form)

	self.field_input_text('name.ja_jp', '日', is_edit ? data_edit['name']['ja_jp'] : null).appendTo(input_container)
	self.field_input_text('name.zh_cn', '简中', is_edit ? data_edit['name']['zh_cn'] : null).appendTo(input_container)

	$('<h4/>').html('图标').appendTo(input_container)
	// icon
		// 扫描图标目录，生成选择项
		//var path_icons = process.cwd() + '/app/assets/images/itemicon/transparent'
		var path_icons = './app/assets/images/itemicon/transparent'
			,icon_radios = $('<div class="icons"/>').appendTo(input_container)
			,icons = []
		node.fs.readdir(path_icons, function(err, files){
			for( var i in files ){
				icons.push(files[i])
			}
			icons.sort(function(a, b){
				return parseInt(a.split('.')[0]) - parseInt(b.split('.')[0])
			});
			for( var i in icons ){
				var id = '_input_g' + _g.inputIndex
					,filename = icons[i].split('.')[0]
					,unitDOM = $('<span class="unit"/>').appendTo(icon_radios)
				_g.inputIndex++
				$('<input type="radio" name="icon" value="'+filename+'" id="'+id+'"/>')
					.prop('checked', (data_edit && data_edit.icon == filename) )
					.appendTo(unitDOM)
				$('<label for="'+id+'"/>')
					.css('background-image','url(../'+ path_icons + '/' + icons[i] +')')
					.appendTo(unitDOM)
			}
		})

	$('<h4/>').html('可装备舰种').appendTo(input_container)
	// equipable_on_type
		// 读取舰种DB，生成选择项
		var shiptype_checkboxes = _p.el.flexgrid.create().addClass('ship_types').appendTo( input_container )
			,equipable_on_type = is_edit ? data_edit['equipable_on_type'] : []
		_db.ship_types.find({}).sort({'id': 1}).exec(function(err, docs){
			for(var i in docs ){
				var type_id = parseInt(docs[i]['id'])
					,input_id = '_input_g' + _g.inputIndex
					,unitDOM = $('<div class="unit"/>')
				shiptype_checkboxes.appendDOM(unitDOM)
				_g.inputIndex++
				$('<input type="checkbox" name="equipable_on_type" value="'+type_id+'" id="'+input_id+'">')
					.prop('checked', ($.inArray(type_id, equipable_on_type) > -1) )
					.appendTo( unitDOM )
				$('<label for="'+input_id+'"/>').html(docs[i]['full_zh']).appendTo(unitDOM)
			}
		})

	$('<h4/>').html('主属性').appendTo(input_container)
		var stats_radios = _p.el.flexgrid.create().addClass('stats').appendTo( input_container )
			,main_attribute = is_edit ? (data_edit['main_attribute'] || null) : null
			,stats = [
				['火力',	'fire'],
				['雷装',	'torpedo'],
				['对空',	'aa'],
				['对潜',	'asw'],
				['爆装',	'bomb'],
				['命中',	'hit'],
				['装甲',	'armor'],
				['回避',	'evasion'],
				['索敌',	'los'],
				['运',		'luck']
			]
		for(var i in stats ){
			var input_id = '_input_g' + _g.inputIndex
				,unitDOM = $('<div class="unit"/>')
			stats_radios.appendDOM(unitDOM)
			_g.inputIndex++
			$('<input type="radio" name="main_attribute" value="'+stats[i][1]+'" id="'+input_id+'">')
				.prop('checked', (stats[i][1] == main_attribute) )
				.appendTo( unitDOM )
			$('<label for="'+input_id+'"/>').html(stats[i][0]).appendTo(unitDOM)
		}

	/* scrapped 2015/05/26
	$('<h4/>').html('当存在以下属性时可装备').appendTo(input_container)
	// equipable_on_stat
		var stats_checkboxes = _p.el.flexgrid.create().addClass('stats').appendTo( input_container )
			,equipable_on_stat = is_edit ? (data_edit['equipable_on_stat'] || []) : []
			,stats = [
				['火力',	'fire'],
				['雷装',	'torpedo'],
				['对空',	'aa'],
				['对潜',	'asw'],
				['耐久',	'hp'],
				['装甲',	'armor'],
				['回避',	'evasion'],
				['搭载',	'carry'],
				['航速',	'speed'],
				['射程',	'range'],
				['索敌',	'los'],
				['运',		'luck']
			]
		for(var i in stats ){
			var input_id = '_input_g' + _g.inputIndex
				,unitDOM = $('<div class="unit"/>')
			stats_checkboxes.appendDOM(unitDOM)
			_g.inputIndex++
			$('<input type="checkbox" name="equipable_on_stat" value="'+stats[i][1]+'" id="'+input_id+'">')
				.prop('checked', ($.inArray(stats[i][1], equipable_on_stat) > -1) )
				.appendTo( unitDOM )
			$('<label for="'+input_id+'"/>').html(stats[i][0]).appendTo(unitDOM)
		}
	*/

	self.field_actions(
		is_edit ? '更新' : null,
		callback_remove ? function(){
				_db.item_types.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
					callback_remove()
					_frame.modal.hide()
				});
			} : null
	).appendTo(form)
	return form
}

_frame.app_main.page['items'].gen_form_new_item_type_collection = function( callback, data_edit, callback_remove ){
	callback = callback || function(){}
	let is_edit = (data_edit)
	var self = _frame.app_main.page['items']
		,form = $('<form class="itemform item_type_collection"/>').on('submit',function(e){
					e.preventDefault()
					var data = $(this).serializeObject()

					if( typeof data['types'] != 'object' && typeof data['types'] != 'undefined' )
						data['types'] = [data['types']]
					data['types'] = data['types'] || []

					if( is_edit ){
						// 编辑操作
						_db.item_type_collections.update({
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
							_db.item_type_collections.count({}, function(err, count){
								data['id'] = parseInt(count) + 1
								_db.item_type_collections.insert(
									data,
									callback
								);
							})
					}
				})
		,input_container = $('<div/>').appendTo(form)

	self.field_input_text('name.zh_cn', '简中', is_edit ? data_edit['name']['zh_cn'] : null).appendTo(input_container)

	$('<h4/>').html('图标').appendTo(input_container)
	// icon
		// 扫描图标目录，生成选择项
		var path_icons = './app/assets/images/itemcollection'
			,icon_radios = $('<div class="icons"/>').appendTo(input_container)
			,icons = []
		node.fs.readdir(path_icons, function(err, files){
			for( var i in files ){
				icons.push(files[i])
			}
			icons.sort(function(a, b){
				return parseInt(a.split('.')[0]) - parseInt(b.split('.')[0])
			});
			for( var i in icons ){
				var id = '_input_g' + _g.inputIndex
					,filename = icons[i].split('.')[0]
					,unitDOM = $('<span class="unit"/>').appendTo(icon_radios)
				_g.inputIndex++
				$('<input type="radio" name="icon" value="'+filename+'" id="'+id+'"/>')
					.prop('checked', (data_edit && data_edit.icon == filename) )
					.appendTo(unitDOM)
				$('<label for="'+id+'"/>')
					.css('background-image','url(../'+ path_icons + '/' + icons[i] +')')
					.appendTo(unitDOM)
			}
		})

	$('<h4/>').html('装备类型').appendTo(input_container)
	_form.create_item_types('types', is_edit ? data_edit['types'] : []).appendTo( input_container )

	self.field_actions(
		is_edit ? '更新' : null,
		callback_remove ? function(){
				_db.item_type_collections.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
					callback_remove()
					_frame.modal.hide()
				});
			} : null
	).appendTo(form)
	return form
}

















_frame.app_main.page['items'].init = function(page){
	page.find('section').on({
		'tabview-show': function(){
			var section = $(this)
				,name = section.data('tabname')

			if( !_frame.app_main.page['items'].section[name] )
				_frame.app_main.page['items'].section[name] = {}

			var _o = _frame.app_main.page['items'].section[name]

			if( !_o.is_init && _o.init ){
				_o.init(section)
				_o.is_init = true
			}
			switch( name ){
				case '未入库':
					break;
			}
		}
	})
}









_frame.app_main.page['items'].section['已入库'] = {
	'dom': {
	},

	'init': function(section){
		_frame.app_main.page['items'].section['已入库'].dom.section = section
	}
}









_frame.app_main.page['items'].section['未入库'] = {
	'dom': {},
	'data': {},
	'data_id': [],

	'init_list': function(index){
		var self = _frame.app_main.page['items'].section['未入库']
			,id = _frame.app_main.page['items'].section['未入库']['data_id'][index]
			,data = _frame.app_main.page['items'].section['未入库']['data'][id]

		function raw_ship_data_convert(d){
			var data_converted = {
				'id': 	d['id'],
				'name': {
					'ja_jp': 	d['name']
				},
				'type': 	null,
				'rarity': 	d['rarity'] == 0 || d['rarity'] == 1 ? parseInt(d['rarity']) + 1 : parseInt(d['rarity']),
				'stat': {
					'fire': 		d['fire'],
					'torpedo': 		d['torpedo'],
					'bomb': 		d['bomb'],
					'asw': 			d['ass'],
					'aa': 			d['aac'],
					'armor': 		d['armor'],
					'evasion': 		d['evasion'],
					'hit': 			d['hit'],
					'los': 			d['seek'],
					'range':		d['range'],
				},
				'dismantle': 	JSON.parse(d['dismantle']),
				'default_equipped_on': 	[]
			}

			return data_converted
		}

		self.dom.list.appendDOM(
			$('<button class="unit newitem" data-itemid="'+ id +'" data-itemmodal="false"/>')
				.append(
					$('<span><img src="../pics/items/'+id+'/card.png" alt="'+data['name']+'"/></span>')
				)
				.on('click', function( e, data_modified ){
					//console.log( data )
					_frame.app_main.page['items'].show_item_form(
						$.extend(
							true,
							raw_ship_data_convert(data),
							data_modified || {}
						)
					)
				})
		)

		if( index >= _frame.app_main.page['items'].section['未入库']['data_id'].length - 1 ){
			self.dom.new_container.html( 'All ' + _frame.app_main.page['items'].section['未入库']['data_id'].length + ' items loaded.')
		}else{
			index++
			self.dom.new_container.html( index + ' / ' + _frame.app_main.page['items'].section['未入库']['data_id'].length + ' items loaded.')
			setTimeout(function(){
				_frame.app_main.page['items'].section['未入库'].init_list(index)
			}, 10)
		}
	},

	'init': function(section){
		var self = _frame.app_main.page['items'].section['未入库']

		// 载入中信息
			self.dom.new_container = $('<div class="new_container"/>').html('Loading...').appendTo( section )

		// 列表container
			self.dom.main = $('<div class="main"/>').appendTo( section )
			self.dom.list = _p.el.flexgrid.create().addClass('newitems').appendTo( self.dom.main )

		// 扫描目标文件夹，初始化内容
			_db.items.find({}).sort({'id': 1}).exec(function(err, docs){
				if( !err && docs && docs.length ){
					for( var i in docs ){
						self.add(docs[i])
					}
				}
			})
			node.fs.readdir(_g.path.fetched.items, function(err, files){
				for( var i in files ){
					node.fs.readFile(_g.path.fetched.items + '/' + files[i], 'utf8', function(err, data){
						if(err)
							throw err
						eval('var _data = '+data)
						_frame.app_main.page["items"].section["未入库"]["data"][_data['id']] = _data
						_frame.app_main.page["items"].section["未入库"]["data_id"].push( _data['id'] )
						if( _frame.app_main.page['items'].section['未入库']["data_id"].length >= files.length ){
							_frame.app_main.page['items'].section['未入库']['data_id'].sort(function(a,b){return a-b})
							_frame.app_main.page['items'].section['未入库'].init_list(0)
						}
					})
				}
				if( err || !files || !files.length ){
					$('<p/>').html('暂无内容...<br />请初始化数据').appendTo(self.dom.list)
				}
			})
	}
}









_frame.app_main.page['items'].section['类型'] = {
	'dom': {
	},

	// 相关表单/按钮
		'titlebtn': function( d ){
			var self = _frame.app_main.page['items'].section['类型']
				,btn = $('<button class="unit item_type"/>').html(
							'<span style="background-image: url(../app/assets/images/itemicon/transparent/'+d['icon']+'.png)"></span>'
							+ d['name']['zh_cn']
						)
						.on('click', function(){
							_frame.modal.show(
								_frame.app_main.page['items'].gen_form_new_item_type(
									function( newdata ){
										self.titlebtn( newdata )
											.insertAfter( btn )
										btn.remove()
									},
									d,
									function(){
										btn.remove()
									}
								) , '编辑类型')
						})
			return btn
		},

	// 新建完毕，添加内容
		'add': function( d ){
			var self = _frame.app_main.page['items'].section['类型']
			// 标题，同时也是编辑按钮
				self.dom.list.appendDOM( self.titlebtn(d) )
		},

	'init': function(section){
		var self = _frame.app_main.page['items'].section['类型']

		// 新建按钮
			self.dom.new_container = $('<div class="new_container"/>').appendTo( section )
				self.dom.btnnew = $('<button/>').html('新建').on('click',function(){
						_frame.modal.show(
							_frame.app_main.page['items'].gen_form_new_item_type(
								function(err, newDoc) {
									self.add(newDoc)
									_frame.modal.hide()
								}
							), '新建类型')
					}).appendTo( self.dom.new_container )

		// 列表container
			self.dom.main = $('<div class="main"/>').appendTo( section )
			self.dom.list = _p.el.flexgrid.create().addClass('item_types').appendTo( self.dom.main )

		// 读取db，初始化内容
			_db.item_types.find({}).sort({'id': 1}).exec(function(err, docs){
				if( !err && docs && docs.length ){
					for( var i in docs ){
						self.add(docs[i])
					}
				}
			})
	}
}









_frame.app_main.page['items'].section['类型集合'] = {
	'dom': {
	},

	// 相关表单/按钮
		'titlebtn': function( d ){
			var self = _frame.app_main.page['items'].section['类型集合']
				,btn = $('<button class="item_type_collection"/>').html(
							d['name']['zh_cn']
						)
						.on('click', function(){
							_frame.modal.show(
								_frame.app_main.page['items'].gen_form_new_item_type_collection(
									function( newdata ){
										self.titlebtn( newdata )
											.insertAfter( btn )
										btn.remove()
									},
									d,
									function(){
										btn.remove()
									}
								) , '编辑类型集合')
						})
			return btn
		},

	// 新建完毕，添加内容
		'add': function( d ){
			var self = _frame.app_main.page['items'].section['类型集合']
			// 标题，同时也是编辑按钮
				self.titlebtn(d).appendTo( self.dom.main )
		},

	'init': function(section){
		var self = _frame.app_main.page['items'].section['类型集合']

		// 新建按钮
			self.dom.new_container = $('<div class="new_container"/>').appendTo( section )
				self.dom.btnnew = $('<button/>').html('新建').on('click',function(){
						_frame.modal.show(
							_frame.app_main.page['items'].gen_form_new_item_type_collection(
								function(err, newDoc) {
									self.add(newDoc)
									_frame.modal.hide()
								}
							), '新建类型集合')
					}).appendTo( self.dom.new_container )

		// 列表container
			self.dom.main = $('<div class="main"/>').appendTo( section )

		// 读取db，初始化内容
			_db.item_type_collections.find({}).sort({'id': 1}).exec(function(err, docs){
				if( !err && docs && docs.length ){
					for( var i in docs ){
						self.add(docs[i])
					}
				}
			})
	}
}









_frame.app_main.page['items'].section['新建'] = {
	'dom': {},

	'init': function(section){
		var self = _frame.app_main.page['items'].section['新建']
		self.dom.section = section

		// 创建form
			self.dom.form = $('<form/>')
								.on('submit', function(e){
									e.preventDefault();
									var formdata = self.dom.form.serializeObject()
										,item_data = {
											'name': 	{},
											'stat': 	{},
											'dismantle':[0, 0, 0, 0]
										}

									if( formdata['id'] )
										item_data['id'] = formdata['id']

									_frame.app_main.page['items'].show_item_form(
										item_data
									)
								})
								.data({
									'item_data': {}
								})
								.appendTo( section )

			var id = '_input_g' + _g.inputIndex
			_g.inputIndex++
			$('<p/>')
				.append(
					$('<label for="' +id+ '"/>').html('ID')
				)
				.append(
					$('<input id="' +id+ '" type="number" name="id"/>')
				)
				.appendTo(self.dom.form)

			$('<p class="actions"/>')
								.append(
									$('<button type="submit"/>').html('新建')
								)
								.appendTo(self.dom.form)

	}
}
