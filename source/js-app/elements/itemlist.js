/*
 */
_p.el.itemlist = {
	init_el: function(el){
		if( el.data('itemlist') )
			return true

		el.data({
			'itemlist': new _itemlist( el )
		})
	},

	init: function(tar, els){
		tar = tar || $('body');
		els = els || tar.find('section.itemlist')

		els.each(function(){
			_p.el.itemlist.init_el($(this))
		})
	}
}






var _itemlist = function( section, options ){
	this.dom = {
		'section': 	section
	}

	this.columns = [
			'  ',
			['火力',	'fire'],
			['雷装',	'torpedo'],
			['爆装',	'bomb'],
			['对潜',	'asw'],
			['对空',	'aa'],
			['装甲',	'armor'],
			['回避',	'evasion'],
			['命中',	'hit'],
			['索敌',	'los'],
			['射程',	'range']
		]

	this.init();
}

_itemlist.prototype.append_item = function( item_data ){
	var self = this
		,tr = $('<tr data-itemid="'+ item_data['id'] +'" data-itemedit="' + (self.dom.section.hasClass('itemlist-edit')) + '"/>')
				.appendTo( this.dom.tbody )
		,max_carry = 0
		,name = item_data['name']['zh_cn']

	function _val( val ){
		if( val == 0 || val == '0' )
			return '<small class="zero">-</small>'
		return val
	}

	for( var i in self.columns ){
		switch( self.columns[i][1] ){
			case ' ':
				$('<th/>')
					.html(
						'<span style="background-image: url(../app/assets/images/itemicon/transparent/'+_g.data.item_types[item_data['type']]['icon']+'.png)"></span>'
						+ '<strong>' + name + '</strong>'
					).appendTo(tr)
				break;
			case 'fire':
				$('<td class="stat-fire"/>').html(_val( item_data['stat']['fire'] )).appendTo(tr)
				break;
			case 'torpedo':
				$('<td class="stat-torpedo"/>').html(_val( item_data['stat']['torpedo'] )).appendTo(tr)
				break;
			case 'bomb':
				$('<td class="stat-bomb"/>').html(_val( item_data['stat']['bomb'] )).appendTo(tr)
				break;
			case 'asw':
				$('<td class="stat-asw"/>').html(_val( item_data['stat']['asw'] )).appendTo(tr)
				break;
			case 'aa':
				$('<td class="stat-aa"/>').html(_val( item_data['stat']['aa'] )).appendTo(tr)
				break;
			case 'armor':
				$('<td class="stat-armor"/>').html(_val( item_data['stat']['armor'] )).appendTo(tr)
				break;
			case 'evasion':
				$('<td class="stat-evasion"/>').html(_val( item_data['stat']['evasion'] )).appendTo(tr)
				break;
			case 'hit':
				$('<td class="stat-hit"/>').html(_val( item_data['stat']['hit'] )).appendTo(tr)
				break;
			case 'los':
				$('<td class="stat-los"/>').html(_val( item_data['stat']['los'] )).appendTo(tr)
				break;
			case 'range':
				$('<td class="stat-range"/>').html( _g.getStatRange( item_data['stat']['range'] ) ).appendTo(tr)
				break;
		}
	}

	return tr
}

_itemlist.prototype.append_item_all = function(){
	var self = this
	for( var i in self.items ){
		self.append_item( _g.data.items[ self.items[i] ] )
	}

	var k = 0
	while(k < 9){
		$('<tr class="empty"/>').appendTo(this.dom.tbody)
		k++
	}
}

_itemlist.prototype.append_option = function( type, name, label, value, suffix, options ){
	options = options || {}
	function gen_input(){
		switch( type ){
			case 'text':
			case 'number':
			case 'hidden':
				var input = $('<input type="'+type+'" name="'+name+'" id="'+id+'" />').val(value)
				break;
			case 'select':
				var input = $('<select name="'+name+'" id="'+id+'" />')
				var option_empty = $('<option value=""/>').html('').appendTo( input )
				for( var i in value ){
					if( typeof value[i] == 'object' ){
						var o_el = $('<option value="' + (typeof value[i].val == 'undefined' ? value[i]['value'] : value[i].val) + '"/>')
							.html(value[i]['title'] || value[i]['name'])
							.appendTo( input )
					}else{
						var o_el = $('<option value="' + value[i] + '"/>')
							.html(value[i])
							.appendTo( input )
					}
					if( typeof options['default'] != 'undefined' && o_el.val() == options['default'] ){
						o_el.prop('selected', true)
					}
				}
				if( !value || !value.length ){
					option_empty.remove()
					$('<option value=""/>').html('...').appendTo( input )
				}
				if( options['new'] ){
					$('<option value=""/>').html('==========').insertAfter( option_empty )
					$('<option value="___new___"/>').html('+ 新建').insertAfter( option_empty )
					input.on('change.___new___', function(){
						var select = $(this)
						if( select.val() == '___new___' ){
							select.val('')
							options['new']( input )
						}
					})
				}
				break;
			case 'checkbox':
				var input = $('<input type="'+type+'" name="'+name+'" id="'+id+'" />').prop('checked', value)
				break;
			case 'radio':
				var input = $();
				for( var i in value ){
					var title, val
						,checked = false
					if( value[i].push ){
						val = value[i][0]
						title = value[i][1]
					}else{
						val = value[i].val || value[i].value
						title = value[i].title || value[i].name
					}
					if( options.radio_default && options.radio_default == val )
						checked = true
					input = input.add(
						$('<input type="radio" name="'+name+'" id="'+id+'-'+val+'" ischecked="'+checked+'" />')
							.val(val)
							.prop('checked', (checked || (!checked && i == 0) ))
						)
					input = input.add($('<label for="'+id+'-'+val+'"/>').html( title ))
				}
				break;
		}

		if( options.required ){
			input.prop('required', true)
		}

		if( options.onchange ){
			input.on('change.___onchange___', function(e){
				options.onchange( e, $(this) )
			})
			if( options['default'] )
				input.trigger('change')
		}

		if( !name )
			input.attr('name', null)

		return input
	}

	var line = $('<p/>').appendTo( this.dom.filter )
		,id = '_input_g' + _g.inputIndex

		,label = label ? $('<label for="'+id+'"/>').html( label ).appendTo(line) : null
		,input = gen_input().appendTo(line)

	if( type == 'checkbox' && label )
		label.insertAfter(input)

	if( suffix )
		$('<label for="'+id+'"/>').html(suffix).appendTo(line)

	_g.inputIndex++
	return line
}

_itemlist.prototype.init = function(){
	if( this.is_init )
		return true

	var self = this
	self.items = []

	// 生成过滤器与选项
		this.dom.filter_container = $('<div class="filter"/>').appendTo( this.dom.section )
		this.dom.filter = $('<div/>').appendTo( this.dom.filter_container )

	// 初始化设置
		this.append_option( 'radio', 'viewtype', null, [
				['list', '列表'],
				['card', '卡片']
			], null, {
				'radio_default': _config.get( 'itemlist-viewtype' ),
				'onchange': function( e, input ){
					if( input.is(':checked') ){
						_config.set( 'itemlist-viewtype', input.val() )
						self.dom.filter_container.attr('viewtype', input.val())
					}
				}
			} )
		this.dom.filter.find('input').trigger('change')

	// 生成表格框架
		this.dom.table_container = $('<div class="fixed-table-container"/>').appendTo( this.dom.section )
		this.dom.table_container_inner = $('<div class="fixed-table-container-inner"/>').appendTo( this.dom.table_container )
		this.dom.table = $('<table class="items hashover hashover-column"/>').appendTo( this.dom.table_container_inner )
		function gen_thead(arr){
			var thead = $('<thead/>')
				,tr = $('<tr/>').appendTo(thead)
			for(var i in arr){
				if( typeof arr[i] == 'object' ){
					$('<td class="stat-' + arr[i][1] + '"/>').html('<div class="th-inner">'+arr[i][0]+'</div>').appendTo(tr)
				}else{
					$('<th/>').html('<div class="th-inner">'+arr[i]+'</div>').appendTo(tr)
				}
			}
			return thead
		}
		gen_thead( self.columns ).appendTo( this.dom.table )
		this.dom.tbody = $('<tbody/>').appendTo( this.dom.table )

	// 获取所有装备数据
		_db.items.find({}).sort({'type': 1, 'rarity': 1, 'id': 1}).exec(function(err, docs){
			if( !err ){
				for(var i in docs){
					_g.data.items[docs[i]['id']] = docs[i]
					self.items.push( docs[i]['id'] )
				}
				if( !err && docs && docs.length ){
					self.append_item_all()
				}else{
					$('<p/>').html('暂无数据...').appendTo( self.dom.table_container_inner )
				}
			}
		})

	this.is_init = true
}