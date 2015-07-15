_comp.selector_ship = function( name, id, default_item ){
	var dom = _frame.app_main.page['ships'].gen_input(
			'select',
			name || null,
			id || null,
			[]
		)
		,ships = []

	_db.ships.find({}).sort({'type': 1, 'class': 1, 'class_no': 1, 'time_created': 1, 'name.suffix': 1}).exec(function(err, docs){
		if( !err && !_g.data.ship_id_by_type.length ){
			for(var i in docs){
				_g.data.ships[docs[i]['id']] = docs[i]

				if( typeof _g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ] == 'undefined' )
					_g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ] = []
				_g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ].push( docs[i]['id'] )
			}
		}

		for( var i in _g.data.ship_id_by_type ){
			if( typeof _g.ship_type_order[i] == 'object' ){
				var data_shiptype = _g.data.ship_types[ _g.ship_type_order[i][0] ]
			}else{
				var data_shiptype = _g.data.ship_types[ _g.ship_type_order[i] ]
			}

			ships[i] = [
				_g.ship_type_order_name[i]['zh_cn'] + ' [' + data_shiptype['code'] + ']',
				[]
			]

			for( var j in _g.data.ship_id_by_type[i] ){
				var d = _g.data.ships[ _g.data.ship_id_by_type[i][j] ]
				ships[i][1].push({
						'name': 	(d['name']['zh_cn'] || d['name']['ja_jp'])
									+ (d['name']['suffix']
										? '・' + _g.data.ship_namesuffix[d['name']['suffix']]['zh_cn']
										: ''),
						'value': 	_g.data.ship_id_by_type[i][j]
					})
			}
		}

		_frame.app_main.page['ships'].gen_input(
			'select_group',
			dom.attr('name') || null,
			dom.attr('id') || null,
			ships,
			{
				'default': default_item || null
			}).insertBefore(dom)
		dom.remove()
	})

	return dom
}
