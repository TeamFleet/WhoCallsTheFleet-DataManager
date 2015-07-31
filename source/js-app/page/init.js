node.require('http')
node.require('url')

_frame.app_main.page['init'] = {}

var __log

_frame.app_main.page['init'].data_ships = null
_frame.app_main.page['init'].fetch_ships = function(){
	__log('fetching data for ships...')
	var url = node.url.parse( $('#data_ships').val() )
	//var req = node.http.get( $('#data_ships').val(), function(res){
	var req = node.http.request({
		'hostname': 	url.hostname,
		'path': 		url.path,
		'method': 		'GET',
		'headers': {
			'User-Agent': 	'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
		}
	}, function(res){
		if( res.statusCode == 200 ){
			res.setEncoding('utf8');
			var body = ''
			res.on('data', function (d) {
				body+= d
			});
			res.on('end', function() {
				//res.setEncoding('utf8');
				body = body.replace(/^var [^ ^\=]+[ ]*=/, '')
				eval('_frame.app_main.page[\'init\'].data_ships = ' + body)
				__log('fetched data for ships (' + _frame.app_main.page['init'].data_ships.length + ').')

				// 将Array内所有数据分别存放至 ./fetched_data/ships/
					node.mkdirp.sync(_g.path.fetched.ships)
					function savedata_next(){
						_frame.app_main.page['init'].data_ships.shift()
						if( _frame.app_main.page['init'].data_ships.length ){
							setTimeout( function(){
								savedata()
							}, 10 )
						}else{
							__log('all data for ships saved.')
							_frame.app_main.page['init'].fetch_items()
						}
					}
					function savedata(){
						var o = _frame.app_main.page['init'].data_ships[0]
						_db.ships.find({'id': parseInt(o.id)}, function(err, docs){
							if( err || !docs || !docs.length ){
								node.fs.writeFile(_g.path.fetched.ships + '/' + o.id + '.json'
									, JSON.stringify(o)
									, function(err) {
										if(err) {
											console.log(err);
										} else {
											__log('saved data file for ship ['+o.id+'] No.'+o.no+' '+ o.name +'.')
										}
										savedata_next()
									})
							}else{
								__log('data for ship ['+o.id+'] No.'+o.no+' '+ o.name +' exists in database. skip.')
								savedata_next()
							}
						})
					}
					savedata()
			});
		}else{
			__log("fetching error: CODE " + res.statusCode);
		}
	});
	req.end();
}

_frame.app_main.page['init'].data_items = null
_frame.app_main.page['init'].fetch_items = function(){
	__log('fetching data for items...')
	var url = node.url.parse( $('#data_items').val() )
	//var req = node.http.get( $('#data_items').val(), function(res){
	var req = node.http.request({
		'hostname': 	url.hostname,
		'path': 		url.path,
		'method': 		'GET',
		'headers': {
			'User-Agent': 	'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
		}
	}, function(res){
		if( res.statusCode == 200 ){
			res.setEncoding('utf8');
			var body = ''
			res.on('data', function (d) {
				body+= d
			});
			res.on('end', function() {
				//res.setEncoding('utf8');
				body = body.replace(/^var [^ ^\=]+[ ]*=/, '')
				eval('_frame.app_main.page[\'init\'].data_items = ' + body)
				__log('fetched data for items (' + _frame.app_main.page['init'].data_items.length + ').')

				// 将Array内所有数据分别存放至 ./fetched_data/ships/
					node.mkdirp.sync(_g.path.fetched.items)
					function savedata_next(){
						_frame.app_main.page['init'].data_items.shift()
						if( _frame.app_main.page['init'].data_items.length ){
							setTimeout( function(){
								savedata()
							}, 10 )
						}else{
							__log('all data for items saved.')
						}
					}
					function savedata(){
						var o = _frame.app_main.page['init'].data_items[0]
						_db.items.find({'id': parseInt(o.id)}, function(err, docs){
							if( err || !docs || !docs.length ){
								node.fs.writeFile(_g.path.fetched.items + '/' + o.id + '.json'
									, JSON.stringify(o)
									, function(err) {
										if(err) {
											console.log(err);
										} else {
											__log('saved data file for item ['+o.id+'] '+ o.name +'.')
										}
										savedata_next()
									})
							}else{
								__log('data for item ['+o.id+'] '+ o.name +' exists in database. skip.')
								savedata_next()
							}
						})
					}
					savedata()
			});
		}else{
			__log("fetching error: CODE " + res.statusCode);
		}
	});
	req.end();
}










_frame.app_main.page['init'].remain_illustrations = []
_frame.app_main.page['init'].init_illustrations = function(){
	__log('start initializing illustrations for ships...')

	function move_files(){
		if( _frame.app_main.page['init'].remain_illustrations.length ){
			var oldPath = _frame.app_main.page['init'].remain_illustrations[0]
				,newPath = node.path.normalize( _g.path.pics.ships + '/' + node.path.relative( './fetched_data/ships_pic/', oldPath ) )

			node.fs.rename(
				oldPath,
				newPath,
				function(err){
					__log('file moved to '+ newPath +'.')
					_frame.app_main.page['init'].remain_illustrations.shift()
					setTimeout( function(){
						move_files()
					}, 10 )
				}
			)
		}else{
			__log('all illustrations for ships files moved...')
		}
	}

	node.fs.readdir('./fetched_data/ships_pic/', function(err, files){
		if( !err ){
			for( var i in files ){
				_frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/0.jpg')
				_frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/1.jpg')
				_frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/2.jpg')
				_frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/3.jpg')
				_frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/8.png')
				_frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/9.png')
				_frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/10.png')

				node.mkdirp.sync( _g.path.pics.ships + '/' + files[i] )

				if( i >= files.length - 1 )
					move_files()
			}
		}
	})
}












_frame.app_main.page['init'].exportdata = function( form ){
	var dest 			= form.find('[name="destfolder"]').val()
		,files 			= []
		,promise_chain 	= Q.fcall(function(){})
		,_ship			= {}
		,_item			= {}

	// 开始异步函数链
		promise_chain
	
	// 遍历全部数据 (舰娘 & 装备)
		.then(function(){
			var deferred = Q.defer()
			_db.ships.find({}, function(err, docs){
				for( var i in docs ){
					_ship[docs[i]['id']] = new Equipment(docs[i])
				}
				console.log(_ship)
				deferred.resolve()
			})
			return deferred.promise
		})
		.then(function(){
			var deferred = Q.defer()
			_db.items.find({}, function(err, docs){
				for( var i in docs ){
					_item[docs[i]['id']] = new Ship(docs[i])
				}
				console.log(_item)
				deferred.resolve()
			})
			return deferred.promise
		})

	// 获取文件列表
		.then(function(){
			var deferred = Q.defer()
			node.fs.readdir('./data/', function(err, arrfiles){
				if( err ){
					deferred.reject( err )
				}else{
					files = arrfiles
					deferred.resolve( arrfiles )
				}
			})
			return deferred.promise
		})

	// 装备 - 初始装备于
		.then(function(){
			var deferred = Q.defer()
				,equipped_by_item_id = {}
				,length = 0

			__log('&nbsp;')
			__log('========== 装备数据 - 初始装备于 ==========')
			__log('= 批处理开始')

			function _get_ships( item_id, _id, _index ){
				_db.ships.find({"equip": item_id}, function(err2, docs2){
					var ships_equipped = {}
					for(var j in docs2){
						if( typeof ships_equipped[docs2[j]['series']] == 'undefined' )
							ships_equipped[docs2[j]['series']] = []
						ships_equipped[docs2[j]['series']].push( docs2[j] )
					}
					for(var j in ships_equipped){
						ships_equipped[j].sort(function(a,b){
							return a['name']['suffix'] - b['name']['suffix']
						})
						for( var k in ships_equipped[j] ){
							equipped_by_item_id[_id].push( ships_equipped[j][k]['id'] )
							//d['default_equipped_on'].push( ships_equipped[j][k]['id'] )
						}
					}
					if( _index >= length - 1 )
						_db_do_all()
				})
			}
			function _db_do_all(){
				function _db_do( _id, set_data, _index ){
					_db.items.update({
						'_id': 		_id
					},{
						$set: set_data
					},{}, function(err, numReplaced){
						if( _index >= length - 1 ){
							__log('= 批处理完毕')
							deferred.resolve()
						}
					})
				}
				var index = 0
				for(var i in equipped_by_item_id){
					var _equipped_data = [];
					$.each(equipped_by_item_id[i], function(i, el){
						if($.inArray(el, _equipped_data) === -1) _equipped_data.push(el);
					});
					_db_do(
						i,
						{
							'default_equipped_on': _equipped_data
						},
						index
					)
					index++
				}
			}
			_db.items.find({}, function(err, docs){
				for( var i in docs ){
					var d = docs[i]
					equipped_by_item_id[d['_id']] = []
					length++
					_get_ships(d['id'], d['_id'], i)
				}
			})
			return deferred.promise
		})

	// 装备 - 改修升级前后关系
		.then(function(){
			// 遍历所有装备的 upgrade_to 数据，重组关系表
			var deferred = Q.defer()
				,_upgrade_from = {}
				,length = 0

			__log('&nbsp;')
			__log('========== 装备数据 - 改修升级前后关系 ==========')
			__log('= 批处理开始')

			_db.items.find({}, function(err, docs){
				for( var i in docs ){
					var d = docs[i]

					if( !_upgrade_from[d['id']] )
						_upgrade_from[d['id']] = [null, []]
					_upgrade_from[d['id']][0] = d['_id']

					length++

					if( d['upgrade_to'] && d['upgrade_to'].length ){
						for( var j in d['upgrade_to'] ){
							var _id = d['upgrade_to'][j][0]
							if( !_upgrade_from[_id] )
								_upgrade_from[_id] = [null, []]
							_upgrade_from[_id][1].push( d['id'] )
						}
					}
				}
				console.log( _upgrade_from )
				_db_do_all()
			})
			function _db_do_all(){
				function _db_do( _id, set_data, _index ){
					_db.items.update({
						'_id': 		_id
					},{
						$set: set_data
					},{}, function(err, numReplaced){
						if( _index >= length - 1 ){
							__log('= 批处理完毕')
							deferred.resolve()
						}
					})
				}
				var index = 0
				for(var i in _upgrade_from){
					_db_do(
						_upgrade_from[i][0],
						{
							'upgrade_from': _upgrade_from[i][1]
						},
						index
					)
					index++
				}
			}
			return deferred.promise
		})

	// 改修工厂 - 每日改修 & 改修明细
		.then(function(){
			var deferred 		= Q.defer()
				,data_weekday 	= []
				,index_weekday 	= []
				,data_all 		= []
				,_promise_chain = Q.fcall(function(){})

			__log('&nbsp;')
			__log('========== 改修工厂 - 每日改修 & 改修明细 ==========')
			__log('= 批处理开始')

			for( var i=0; i<7; i++){
				data_weekday[i] = {
					'weekday':	i,
					'improvements': []
					// equipment_id, improvement_index, requirement_index
				}
				index_weekday[i] = {}
			}

			for(let m in _g.data.item_id_by_type){
				for(let n in _g.data.item_id_by_type[m]['equipments']){
					let d = _item[_g.data.item_id_by_type[m]['equipments'][n]]
			
			console.log(_g.data.item_id_by_type[m]['equipments'][n], d)
					if( d.improvement && d.improvement.length ){
						data_all.push({
							'id':	d['id'],
							'sort': data_all.length
						})

						for(var j in d.improvement){
							for(var k in d.improvement[j].req){
								var req = d.improvement[j].req[k]
								for(var l=0; l<7; l++){
									if(req[0][l]){
										var index = d['id'] + '_' + parseInt(j)
										if( typeof index_weekday[l][index] == 'undefined' ){
											index_weekday[l][index] = data_weekday[l].improvements.length
											data_weekday[l].improvements.push([
												d['id'],
												parseInt(j),
												[parseInt(k)]
											])
										}else{
											data_weekday[l].improvements[index_weekday[l][index]][2].push(parseInt(k))
										}
									}
								}
							}
						}
					}
				}
			}

			_promise_chain

			// 遍历全部装备数据
				//.then(function(){
					//var _deferred = Q.defer()
					/*
					_db.items.find({}).sort({'type': 1, 'rarity': 1, 'id': 1}).exec(function(err, docs){
						for( var i in docs ){
							var d = docs[i]
							if( d.improvement && d.improvement.length ){
								data_all.push({
									'id':	d['id'],
									'sort': data_all.length
								})

								for(var j in d.improvement){
									for(var k in d.improvement[j].req){
										var req = d.improvement[j].req[k]
										for(var l=0; l<7; l++){
											if(req[0][l]){
												var index = d['id'] + '_' + parseInt(j)
												if( typeof index_weekday[l][index] == 'undefined' ){
													index_weekday[l][index] = data_weekday[l].improvements.length
													data_weekday[l].improvements.push([
														d['id'],
														parseInt(j),
														[parseInt(k)]
													])
												}else{
													data_weekday[l].improvements[index_weekday[l][index]][2].push(parseInt(k))
												}
											}
										}
									}
								}

								_deferred.resolve()
							}
						}
					})
					*/
					//return _deferred.promise
					//return true
				//})

			// 清空原有数据库
				.then(function(){
					var _deferred = Q.defer()
					_db.arsenal_all.remove({}, { multi: true }, function (err, numRemoved) {
						_deferred.resolve()
					});
					return _deferred.promise
				})
				.then(function(){
					var _deferred = Q.defer()
					_db.arsenal_weekday.remove({}, { multi: true }, function (err, numRemoved) {
						_deferred.resolve()
					});
					return _deferred.promise
				})

			// 写入数据库
				.then(function(){
					var _deferred = Q.defer()
					_db.arsenal_all.insert(data_all, function (err, newDocs) {
						_deferred.resolve()
					})
					return _deferred.promise
				})
				.then(function(){
					var _deferred = Q.defer()
					_db.arsenal_weekday.insert(data_weekday, function (err, newDocs) {
						_deferred.resolve()
					})
					return _deferred.promise
				})

			// 完成
				.then(function(){
					__log('= 批处理完成')
					deferred.resolve()
				})

			return deferred.promise
		})

	// 2015/05/26 - 取消装备类型的 equipable_on_stat 属性
	/*
		.then(function(){
			var deferred = Q.defer()
				,count = 0
				,length = 0

			__log( '&nbsp;' )
			__log('========== 取消装备类型的 equipable_on_stat 属性 ==========')
			__log( '= 批处理开始' )

			_db.item_types.find({}, function(err, docs){
				length = docs.length
				for(var i in docs){
					_db.item_types.update({
						'_id': 		docs[i]['_id']
					},{
						$unset: {
							'equipable_on_stat': true
						}
					},{}, function(err, numReplaced){
						count++
						if( count >= length ){
							__log('= 批处理完毕')
							deferred.resolve()
						}
					})
				}
			})

			return deferred.promise
		})
	*/

	// 复制所有数据文件
		.then(function(){
			var deferred = Q.defer()
				,count = 0

			__log( '&nbsp;' )
			__log('========== 复制数据库JSON ==========')

			// 建立目标目录
				node.mkdirp.sync( dest )

			function copyFile(source, target, callback) {
				var cbCalled = false;

				var rd = node.fs.createReadStream(source);
				rd.on("error", function(err) {
					done(err);
				});

				var wr = node.fs.createWriteStream(target);
					wr.on("error", function(err) {
					done(err);
				});
				wr.on("close", function(ex) {
					done();
				});

				rd.pipe(wr);

				function done(err) {
					if (!cbCalled) {
						callback(err, source, target);
						cbCalled = true;
					}
				}
			}
			function copyFile_callback( err, source, target ){
				count++
				if( !err ){
					__log( '= 数据库JSON已复制到 ' + target )
				}else{
					console.log(err)
				}
				if( count >= files.length ){
					__log( '= 全部数据库JSON已复制' )
					deferred.resolve()
				}
			}

			// 压缩 (Compacting) 全部数据库
				for( var i in _db ){
					_db[i].persistence.compactDatafile()
				}

			for( var i in files ){
				copyFile(
					'./data/' + files[i],
					dest + '/' + files[i],
					copyFile_callback
				)
			}
			return deferred.promise
		})

	// 错误处理
		.catch(function (err) {
			__log(err)
			__log('输出数据失败')
		})
		.done(function(){
			__log('输出数据初始过程结束')
		})
}












_frame.app_main.page['init'].exportpic = function( form ){
	var dest = form.find('[name="destfolder"]').val()
		,ship_ids = node.fs.readdirSync('./pics/ships/')
		,item_ids = node.fs.readdirSync('./pics/items/')
		,files = []
		,picid_by_shipid = {}
		,promise_chain 	= Q.fcall(function(){})

	function check_do( file, dest, quality, is_lossless ){
		try{
			var stat = node.fs.lstatSync(file)
			if( stat && stat.isFile() ){
				files.push([
					file,
					dest,
					quality,
					is_lossless
				])
			}
		}catch(e){}
	}

	node.mkdirp.sync( dest + '/ships/' )
	node.mkdirp.sync( dest + '/items/' )

	var execFile = require('child_process').execFile;
	var binPath = require('webp-bin').path;

	function copyFile_webp(source, target, quality, is_lossless) {
		source = source || files[0][0]
		target = target || files[0][1]
		quality = (quality || files[0][2]) || 75
		is_lossless = (is_lossless || files[0][3]) || false

		//var cmd = (source + ' -lossless -q 100 -o ' + target).split(/\s+/)
		var cmd = (source + (is_lossless ? ' -lossless' : '') + ' -q ' + quality + ' -o ' + target).split(/\s+/)
		//var cmd = (source + ' -q 85 -o ' + target).split(/\s+/)
		execFile(binPath, cmd, function(err, stdout, stderr) {
			if( !err ){
				__log(
					'pic file copied to ' + target
				)
				files.shift()
				copyFile_webp();
			}
		});

		/*

		var CWebp = require('cwebp').CWebp
			,encoder = new CWebp(source)

		encoder.write(target, function(err) {
			console.log(err || 'encoded successfully');
			__log(
				'pic file copied to ' + target
			)
			files.shift()
			copyFile_webp();
		});
		*/

		/*
		var cbCalled = false;

		var rd = node.fs.createReadStream(source);
		rd.on("error", function(err) {
			done(err);
		});

		var wr = node.fs.createWriteStream(target);
			wr.on("error", function(err) {
			done(err);
		});
		wr.on("close", function(ex) {
			done();
		});

		rd.pipe(wr);

		function done(err) {
			if (!cbCalled) {
				__log(
					'pic file copied to ' + target
				)
				files.shift()
				copyFile_webp();
				cbCalled = true;
			}
		}
		*/
	}

	// 开始异步函数链
		promise_chain

	// 遍历 ship_series
		.then(function(){
			let deferred = Q.defer()
			_db.ship_series.find({}, function(err,docs){
				for(var i in docs){
					var ships = docs[i].ships || []
					for(var j in ships){
						if(ships[j]['id']){
							picid_by_shipid[ships[j]['id']] = []
							picid_by_shipid[ships[j]['id']].push(['0.png', '0.webp', 90])
							if( !ships[j]['illust_delete'] ){
								picid_by_shipid[ships[j]['id']].push(['8.png', '8.webp', 85])
								picid_by_shipid[ships[j]['id']].push(['9.png', '9.webp', 85])
								picid_by_shipid[ships[j]['id']].push(['10.png', '10.webp', 75])
							}
							var extra = ships[j]['illust_extra'] || []
							for(var l in extra){
								picid_by_shipid['extra_' + extra[l]] = []
								picid_by_shipid['extra_' + extra[l]].push(['8.png', '8.webp', 85])
								picid_by_shipid['extra_' + extra[l]].push(['9.png', '9.webp', 85])
							}
						}
					}
					deferred.resolve(picid_by_shipid)
				}
			})
			return deferred.promise
		})

	// 遍历 ship_ids, item_ids
		.then(function(picid_by_shipid){
			for( var i in ship_ids ){
				node.mkdirp.sync( dest + '/ships/' + ship_ids[i] )
				var arr = picid_by_shipid[ship_ids[i]] || null
				if( !arr ){
					arr = []
					arr.push(['0.png', '0.webp', 90])
					arr.push(['8.png', '8.webp', 85])
					arr.push(['9.png', '9.webp', 85])
					arr.push(['10.png', '10.webp', 75])
				}
				for(var j in arr){
					check_do(
						'./pics/ships/' + ship_ids[i] + '/' + arr[j][0],
						dest + '/ships/' + ship_ids[i] + '/' + arr[j][1],
						arr[j][2]
					)
				}
			}
			for( var i in item_ids ){
				node.mkdirp.sync( dest + '/items/' + item_ids[i] )
				check_do(
					'./pics/items/' + item_ids[i] + '/card.png',
					dest + '/items/' + item_ids[i] + '/card.webp',
					80
				)
			}
			return files
		})

	// webp
		.then(function(files){
			return copyFile_webp()
		})

	return true

	for( var i in ship_ids ){
		node.mkdirp.sync( dest + '/ships/' + ship_ids[i] )
		check_do(
			'./pics/ships/' + ship_ids[i] + '/0.jpg',
			dest + '/ships/' + ship_ids[i] + '/0.webp',
			90
		)
		check_do(
			'./pics/ships/' + ship_ids[i] + '/8.png',
			dest + '/ships/' + ship_ids[i] + '/8.webp',
			85
			//100,
			//true
		)
		check_do(
			'./pics/ships/' + ship_ids[i] + '/9.png',
			dest + '/ships/' + ship_ids[i] + '/9.webp',
			85
			//100,
			//true
		)
		/*
		files.push([
			'./pics/ships/' + ship_ids[i] + '/0.jpg',
			dest + '/ships/' + ship_ids[i] + '/0.jpg'
		])
		files.push([
			'./pics/ships/' + ship_ids[i] + '/2.jpg',
			dest + '/ships/' + ship_ids[i] + '/2.jpg'
		])
		*/
	}

	for( var i in item_ids ){
		node.mkdirp.sync( dest + '/items/' + item_ids[i] )
		check_do(
			'./pics/items/' + item_ids[i] + '/card.png',
			dest + '/items/' + item_ids[i] + '/card.webp',
			80
		)
		/*
		files.push([
			'./pics/items/' + item_ids[i] + '/card.png',
			dest + '/items/' + item_ids[i] + '/card.png'
		])
		*/
	}

	copyFile_webp()
}
















_frame.app_main.page['init'].init = function( page ){
	var _log = function(data){
		$('<p/>').html(data).prependTo(logs)
	}
	__log = function(data){
		console.log(data)
		$('<p/>').html(data).prependTo(logs)
	}

	var logs = $('<div class="logs">').appendTo(page)

	// 获取舰娘&装备数据
	page.find('form#init_all_data').on('submit', function(e){
		var form = $(this)
		e.preventDefault()
		form.addClass('submitting')
		form.find('[type="submit"]').on('click',function(e){
			e.preventDefault()
		})

			_frame.app_main.page['init'].fetch_ships()
	})

	// 处理图鉴文件
	page.find('form#init_illustrations').on('submit', function(e){
		var form = $(this)
		e.preventDefault()
		form.addClass('submitting')
		form.find('[type="submit"]').on('click',function(e){
			e.preventDefault()
		})

			_frame.app_main.page['init'].init_illustrations()
	})

	// 导出数据
	page.find('form#init_exportdata').each( function(){
		var form = $(this)
			,folder_input = form.find('[name="destfolder"]')
			,btn_browse = form.find('[value="Browse..."]')
			,file_selector = form.find('[type="file"]')

		form.on('submit', function(e){
			e.preventDefault()
			form.addClass('submitting')
			form.find('[type="submit"]').on('click',function(e){
				e.preventDefault()
			})
			_frame.app_main.page['init'].exportdata( form )
		})

		folder_input
			.val( _config.get( 'data_export_to' ) )
			.on({
				'change': function(){
					_config.set( 'data_export_to', $(this).val() )
				},
				'click': function(){
					btn_browse.trigger('click')
				}
			})

		btn_browse
			.on('click', function(){
				//console.log(123)
				//form.find('[type="file"]').trigger('click')
			})

		file_selector
			.on('change', function(){
				folder_input.val( $(this).val() ).trigger('change')
			})
	})

	// 导出图片
	page.find('form#init_exportpic').each( function(){
		var form = $(this)
			,folder_input = form.find('[name="destfolder"]')
			,btn_browse = form.find('[value="Browse..."]')
			,file_selector = form.find('[type="file"]')

		form.on('submit', function(e){
			e.preventDefault()
			form.addClass('submitting')
			form.find('[type="submit"]').on('click',function(e){
				e.preventDefault()
			})
			_frame.app_main.page['init'].exportpic( form )
		})

		folder_input
			.val( _config.get( 'pics_export_to' ) )
			.on({
				'change': function(){
					_config.set( 'pics_export_to', $(this).val() )
				},
				'click': function(){
					btn_browse.trigger('click')
				}
			})

		btn_browse
			.on('click', function(){
				//console.log(123)
				//form.find('[type="file"]').trigger('click')
			})

		file_selector
			.on('change', function(){
				folder_input.val( $(this).val() ).trigger('change')
			})
	})

	// 获取官方数据
		page.find('form#fetch_official').on('submit', function(e){
			var form = $(this)
			e.preventDefault()
			__log('开始获取官方游戏数据 (api_start2)...')
			/*
				Remote Address:127.0.0.1:7070
				Request URL:http://203.104.209.23/kcsapi/api_start2
				Request Method:POST
				Status Code:200 OK

				header
				Accept:*//*
				Accept-Encoding:gzip, deflate
				Accept-Language:zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4,ja;q=0.2
				Cache-Control:no-cache
				Connection:keep-alive
				Content-Length:66
				Content-Type:application/x-www-form-urlencoded
				Host:203.104.209.23
				Origin:http://203.104.209.23
				Pragma:no-cache
				Referer:http://203.104.209.23/kcs/mainD2.swf?api_token=1d28ef72b4669737e86d6af05ed53652dde0d744&api_starttime=1431008607402/[[DYNAMIC]]/1
				User-Agent:Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36
				X-Requested-With:ShockwaveFlash/17.0.0.169

				form
				api_token:1d28ef72b4669737e86d6af05ed53652dde0d744
				api_verno:1
			*/

			var ip 			= form.find('[name="server_ip"]').val()
				,api_token 	= form.find('[name="api_token"]').val()
				,url 		= node.url.parse( 'http://'+ ip +'/kcsapi/api_start2' )

				,promise_chain 	= Q.fcall(function(){})

			// 开始异步函数链
				promise_chain

			// API: api_start2
				.then(function(){
					var api = node.url.parse( 'http://'+ ip +'/kcsapi/api_start2' )
						,deferred = Q.defer()
					__log('API (api_start2) requesting...')

					request({
						'uri': 		api,
						'method': 	'POST',
						'headers': {
							'Cache-Control': 	'no-cache',
							'Content-Type': 	'application/x-www-form-urlencoded',
							'Pragma': 			'no-cache',
							'Referer': 			'http://'+ip+'/kcs/mainD2.swf?api_token='+ api_token +'&api_starttime='+ _g.timeNow() +'/[[DYNAMIC]]/1',
							'User-Agent': 		'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
							'X-Requested-With': 'ShockwaveFlash/17.0.0.169'
						},
						'formData': {
							'api_token': 	api_token,
							'api_verno': 	1
						},
						'proxy': 	proxy
					}, function(err, response, body){
						if(err || response.statusCode != 200){
							console.log(err, response)
							deferred.reject(new Error(err))
						}
						if( !err && response.statusCode == 200 ){
							console.log(body)
							let svdata
							eval(body)
							console.log(svdata)
							if( svdata.api_result == 1 ){
								jf.writeFile(
									node.path.normalize(_g.root + '/fetched_data/api_start2.json'),
									svdata,
									function(err) {
										if(err){
											deferred.reject(new Error(err))
										}else{
											deferred.resolve()
										}
								})
							}else{
								console.log(svdata)
								deferred.reject(new Error(err))
							}
						}
					})
				})
				.catch(function (err) {
					__log(err)
				})
				.done(function(){
					__log('已获取，数据已保存到文件 /fetched_data/api_start2.json')
				})
		})
}
