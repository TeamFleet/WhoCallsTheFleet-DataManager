_comp.selector_equipment = function( name, id, default_item ){
	var dom = _frame.app_main.page['ships'].gen_input(
			'select',
			name || null,
			id || null,
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
}
