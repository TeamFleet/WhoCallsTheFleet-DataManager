_frame.app_main.page['init'].exportdata_cache_entities = function( dest, _item ){
	let deferred = Q.defer()
		,dest_path = node.path.join(dest, 'app/page')

	__log( '&nbsp;' )
	__log('========== 输出页面: entities.html ==========')

	// 确保目标目录
		node.mkdirp.sync( dest_path )
	
	// 
		let container = $('<div class="tablelist entities"/>')
			,data = new TablelistEntities( container )

	// 写入文件
		let interval = setInterval(function(){
			if( data.generated ){
				clearInterval(interval)
				interval = null
				node.fs.writeFile(node.path.join(dest_path, 'entities.html')
					, container[0].outerHTML
					, function(err) {
						if(err) {
							console.log(err);
						} else {
							__log('= entities.html 已输出')
						}
						deferred.resolve()
					})
			}
		},10)

	return deferred.promise
}






_tmpl.link_entity = function( entity, tagName, returnHTML, count ){
	if( !entity )
		return false

	if( tagName && typeof tagName == 'object' )
		return _tmpl.link_entity(
					entity,
					tagName['tagName'] || null,
					tagName['returnHTML'] || null,
					tagName['count'] || null
				)

	tagName = tagName || 'a'
	returnHTML = returnHTML || false
	count = typeof count == 'undefined' ? false : count

	if( typeof entity != 'object' ){
		var entityId = parseInt(entity)
		entity = _g.data.entities[entityId]
	}else{
		var entityId = entity['id']
	}

	return _tmpl.export(
			'<' + tagName
				+ (tagName == 'a' ? ' href="?infos=entity&id='+entityId+'"' : '')
				+ ' class="link_entity" data-entityid="' + entityId + '" data-infos="[[ENTITY::' + entityId + ']]">'
				+ (entity.picture && entity.picture.avatar
					? '<i style="background-image:url(' + entity.picture.avatar + ')"></i>'
					: '<i></i>'
				)
				+ '<span>'
					+ entity._name
					+ ( typeof count == 'undefined'
						? ''
						: ' <small>(' + count + ')</small>'
					)
				+ '</span>'
			+ '</' + tagName + '>',
			returnHTML
		)
}








// Entities

class TablelistEntities extends Tablelist{
	constructor( container, options ){
		super( container, options )

		// 标记全局载入状态
			_frame.app_main.loading.push('tablelist_'+this._index)
			_frame.app_main.is_loaded = false
		
		if( container.children('.tablelist-list').length ){
			this.init_parse()
		}else{
			this.init_new()
		}
	}

	append_item_cv( entity ){
		return _tmpl.link_entity( entity, null, false, entity.relation.cv.length ).addClass('unit cv')
	}

	append_item_illustrator( entity ){
		return $('<a/>',{
			'class':	'unit illustrator',
			'href':		'?infos=entity&id=' + entity.id,
			'html':		entity._name + ' (' + entity.relation.illustrator.length + ')'
		})
	}

	append_items( title, arr, callback_append_item ){
		let container
		
		this.dom.container
			.append(
				$('<div/>',{
					'class':	'typetitle',
					'html':		title
				})
			)
			.append(
				container = _p.el.flexgrid.create().addClass('tablelist-list')
			)
		
		arr.forEach(function(item){
			container.appendDOM( callback_append_item( item ) )
		}, this)
	}

	
	
	
	
	
	
	
	
	
	init_new(){
		let listCV = [],
			listIllustrator = []
		
		for( let i in _g.data.entities ){
			let entity = _g.data.entities[i]
			if( !entity.relation )
				continue
			if( entity.relation.cv && entity.relation.cv.length )
				listCV.push(entity)
			if( entity.relation.illustrator && entity.relation.illustrator.length )
				listIllustrator.push(entity)
		}

		this.append_items(
			'声优',
			listCV.sort(function(a,b){
				return b.relation.cv.length - a.relation.cv.length
			}),
			this.append_item_cv
		)
		this.append_items(
			'画师',
			listIllustrator.sort(function(a,b){
				return b.relation.illustrator.length - a.relation.illustrator.length
			}),
			this.append_item_illustrator
		)
		
		_frame.app_main.loaded('tablelist_'+this._index, true)
	}
	
	
	
	
	
	
	
	
	
	init_parse(){
	}
}