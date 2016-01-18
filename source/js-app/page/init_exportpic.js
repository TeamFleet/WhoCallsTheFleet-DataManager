_frame.app_main.page['init'].exportpic = function( form ){
	let dest = node.path.normalize(form.find('[name="destfolder"]').val())
		,ship_ids = node.fs.readdirSync('./pics/ships/')
		,item_ids = node.fs.readdirSync('./pics/items/')
		,entities = {}
		,files = []
		,picid_by_shipid = {}
		,promise_chain 	= Q.fcall(function(){})


	node.mkdirp.sync( node.path.join(dest, '/ships/' ) )
	node.mkdirp.sync( node.path.join(dest, '/items/' ) )
	node.mkdirp.sync( node.path.join(dest, '/ships_web/' ) )
	node.mkdirp.sync( node.path.join(dest, '/items_web/' ) )


	function check_do( file, dest, quality, is_lossless ){
		if( is_exists(file) )
			files.push([
				file,
				dest,
				quality,
				is_lossless
			])
		/*
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
		*/
	}
	
	
	
	function is_exists( file, isDirectory ){
		try{
			let stat = node.fs.lstatSync(file)
			if( stat ){
				if( !isDirectory && stat.isFile() )
					return true
				
				if( isDirectory && stat.isDirectory() )
					return true
				
				if( isDirectory && !stat.isDirectory() )
					return false
				
				return true
			}
		}catch(e){
			return false
		}
		return false
	}
	


	function copyFile_do(source, target, quality, is_lossless) {
		if( !source && !files.length )
			return __log('PIC EXPORT COMPLETE')
			
		source = source || files[0][0]
		target = target || files[0][1]
		quality = (quality || files[0][2]) || 75
		is_lossless = (is_lossless || files[0][3]) || false
		
		function cb(){
			copyFile_do()
		}
		
		if( quality == 'jpg' )
			quality = 'jpeg'
		
		if( quality == 'copy' ){
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
				if( err )
					console.log(err)
				if (!cbCalled) {
					__log(
						'pic file copied to ' + target
					)
					files.shift()
					cbCalled = true;
					
					cb();
				}
			}
		}else if(quality == 'mask'){
			let target_mask_1 = node.path.parse(target)
				target_mask_1 = node.path.join( target_mask_1.dir, target_mask_1.name + '-mask-' + is_lossless + target_mask_1.ext )
			let mask = node.path.join(_g.root, '!designs/mask-' + is_lossless + '.png')
			let exec = require('child_process').exec
			
			var gmComposite = 'gm composite -compose in "' + source + '" ' + mask + ' ' + target_mask_1
			
			exec(gmComposite, function(err) {
				if (err) throw err
				__log(
					'pic file copied to ' + target_mask_1 + ' (mask-' + is_lossless + ')'
				)
				files.shift()
				cb();
			})
			/*
			node.gm( source )
				.mask(node.path.join(_g.root, '!designs/mask-1.png'))
				.write(target_mask_1, function (err) {
					console.log(err)
					__log(
						'pic file copied to ' + target_mask_1 + ' (mask-1)'
					)
					files.shift()
					cb();
				})
			*/
		}else if(quality == 'entity-resize'){
			let target_mask_1 = node.path.parse(target)
				target_mask_1 = node.path.join( target_mask_1.dir, target_mask_1.name + target_mask_1.ext )
			let mask = node.path.join(_g.root, '!designs/mask-0.png')
			let exec = require('child_process').exec
			
			var gmComposite = 'gm composite -geometry 90x90+35-17 -compose in "' + source + '" ' + mask + ' ' + target_mask_1
			
			exec(gmComposite, function(err) {
				if (err) throw err
				__log(
					'pic file copied to ' + target_mask_1 + ' (mask-' + is_lossless + ')'
				)
				files.shift()
				cb();
			})
		}else if(quality == 'entity-resize-mask'){
			let target_mask_1 = node.path.parse(target)
				target_mask_1 = node.path.join( target_mask_1.dir, target_mask_1.name + '-mask-' + is_lossless + target_mask_1.ext )
			let mask = node.path.join(_g.root, '!designs/mask-entity-' + is_lossless + '.png')
			let exec = require('child_process').exec
			
			var gmComposite = 'gm composite -geometry 90x90+35-16 -compose in "' + source + '" ' + mask + ' ' + target_mask_1
			
			exec(gmComposite, function(err) {
				if (err) throw err
				__log(
					'pic file copied to ' + target_mask_1 + ' (mask-' + is_lossless + ')'
				)
				files.shift()
				cb();
			})
		}else if(quality == 'jpeg'){
			let exec = require('child_process').exec
				,q = is_lossless || 75
				,gmComposite = `gm convert -quality ${q} "${source}" "${target}"`
			
			exec(gmComposite, function(err) {
				if (err) throw err
				__log(
					'pic file copied to ' + target
				)
				files.shift()
				cb();
			})
		}else{
			//var cmd = (source + ' -lossless -q 100 -o ' + target).split(/\s+/)
			let cmd = (source + (is_lossless ? ' -lossless' : '') + ' -q ' + quality + ' -o ' + target).split(/\s+/)
				,execFile = require('child_process').execFile
				,binPath = require('webp-bin').path
			//var cmd = (source + ' -q 85 -o ' + target).split(/\s+/)
			execFile(binPath, cmd, function(err, stdout, stderr) {
				if( !err ){
					__log(
						'pic file copied to ' + target
					)
					files.shift()
					cb();
				}
			});
		}

		/*

		var CWebp = require('cwebp').CWebp
			,encoder = new CWebp(source)

		encoder.write(target, function(err) {
			console.log(err || 'encoded successfully');
			__log(
				'pic file copied to ' + target
			)
			files.shift()
			copyFile_do();
		});
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
						if( !parseInt(ships[j]['id'])
							|| (parseInt(ships[j]['id']) < 500 || parseInt(ships[j]['id']) > 9000)
						){
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
				}
				deferred.resolve(picid_by_shipid)
			})
			return deferred.promise
		})

	// 遍历 ship_ids, item_ids
		.then(function(picid_by_shipid){
			for( var i in ship_ids ){
				node.mkdirp.sync( dest + '/ships/' + ship_ids[i] )
				node.mkdirp.sync( dest + '/ships_web/' + ship_ids[i] )
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
					check_do(
						'./pics/ships/' + ship_ids[i] + '/' + arr[j][0],
						dest + '/ships_web/' + ship_ids[i] + '/' + arr[j][0],
						'copy'
					)
				}
				
				// apply mask for web version
					check_do(
						'./pics/ships/' + ship_ids[i] + '/' + '0.png',
						dest + '/ships_web/' + ship_ids[i] + '/' + '0.png',
						'mask',
						1
					)
					check_do(
						'./pics/ships/' + ship_ids[i] + '/' + '0.png',
						dest + '/ships_web/' + ship_ids[i] + '/' + '0.png',
						'mask',
						2
					)
				
				// ship card
					if( is_exists( './pics/ships/' + ship_ids[i] + '/2.jpg' ) ){
						check_do(
							'./pics/ships/' + ship_ids[i] + '/2.jpg',
							dest + '/ships_web/' + ship_ids[i] + '/2.jpg',
							'copy'
						)
					}else{
						check_do(
							'./pics/ships/' + ship_ids[i] + '/2.png',
							dest + '/ships_web/' + ship_ids[i] + '/2.jpg',
							'jpeg',
							81
						)
					}
				
				// ship illustrations lossless webp for web version
					check_do(
						'./pics/ships/' + ship_ids[i] + '/' + '8.png',
						dest + '/ships_web/' + ship_ids[i] + '/' + '8.webp',
						'webp',
						true
					)
					check_do(
						'./pics/ships/' + ship_ids[i] + '/' + '9.png',
						dest + '/ships_web/' + ship_ids[i] + '/' + '9.webp',
						'webp',
						true
					)
					check_do(
						'./pics/ships/' + ship_ids[i] + '/' + '10.png',
						dest + '/ships_web/' + ship_ids[i] + '/' + '10.webp',
						'webp',
						true
					)
			}
			for( var i in item_ids ){
				node.mkdirp.sync( dest + '/items/' + item_ids[i] )
				node.mkdirp.sync( dest + '/items_web/' + item_ids[i] )
				check_do(
					'./pics/items/' + item_ids[i] + '/card.png',
					dest + '/items/' + item_ids[i] + '/card.webp',
					80
				)
				check_do(
					'./pics/items/' + item_ids[i] + '/card.png',
					dest + '/items_web/' + item_ids[i] + '/card.png',
					'copy'
				)
			}
			return files
		})
	
	// 遍历_db.entities
		.then(function(){
			let deferred = Q.defer()
			_db.entities.find({}, function(err,docs){
				docs.forEach(function(d){
					entities[d.id] = new Entity(d)
					node.mkdirp.sync( dest + '/entities_web/' + d.id )
					check_do(
						'./pics/entities/' + entities[d.id].getName('ja_jp') + '.jpg',
						dest + '/entities_web/' + d.id + '/0.png',
						'entity-resize'
					)
					check_do(
						'./pics/entities/' + entities[d.id].getName('ja_jp') + '.jpg',
						dest + '/entities_web/' + d.id + '/0.png',
						'entity-resize-mask',
						1
					)
					check_do(
						'./pics/entities/' + entities[d.id].getName('ja_jp') + '.jpg',
						dest + '/entities_web/' + d.id + '/0.png',
						'entity-resize-mask',
						2
					)
					check_do(
						'./pics/entities/' + entities[d.id].getName('ja_jp') + '.jpg',
						dest + '/entities_web/' + d.id + '/2.jpg',
						'copy'
					)
				})
				deferred.resolve(entities)
			})
			return deferred.promise
		})

	// webp
		.then(function(files){
			return copyFile_do()
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

	copyFile_do()
}