// node.js modules
node.require('fs')
node.require('nedb')
node.require('path')
node.require('mkdirp')
node.require('cwebp')
node.require('semver')
node.require('url')
node.require('mime')
node.require('gm')

var Q = node.require('q')
    , request = node.require('request')
    , jf = node.require('jsonfile')

var server_ip = '203.104.209.23'
    //,proxy 		= 'http://127.0.0.1:8087'
    , proxy = 'http://127.0.0.1:8118'

    , _comp = {}





// Global Variables
_g.inputIndex = 0;
_g.animate_duration_delay = 320;
_g.execPath = node.path.dirname(process.execPath)

_g.path = {
    'db': process.cwd() + '/data/',
    'db-other': process.cwd() + '/data-other/',
    'fetched': {
        'ships': process.cwd() + '/fetched_data/ships/',
        'items': process.cwd() + '/fetched_data/items/'
    },
    'pics': {
        'ships': process.cwd() + '/pics/dist/ships/',
        'shipsExtra': process.cwd() + '/pics/dist/ships-extra/',
        'items': process.cwd() + '/pics/dist/equipments/'
    }
}

_g.pathMakeObj = function (obj) {
    for (var i in obj) {
        if (typeof obj[i] == 'object') {
            _g.pathMakeObj(obj[i])
        } else {
            node.mkdirp.sync(obj[i])
        }
    }
}
_g.pathMakeObj(_g.path)

_g.data = {
    'entities': {},

    'items': {},
    'item_types': {},

    'ships': {},
    'ship_id_by_type': [], 			// refer to _g.ship_type_order
    'ship_types': {},
    'ship_type_order': {},
    'ship_classes': {},

    'consumables': {},

    // 'exillusts': {},
    // 'exillust_types': {}
}

var _db = {
    'guides': new node.nedb({
        filename: node.path.join(_g.path['db-other'], 'guides.nedb')
    })
}
_g.ship_type_order = []
_g.ship_type_order_map = {}
_g.ship_type_order_name = []

_g.newInputIndex = function () {
    _g.inputIndex++
    return '_input_g' + (_g.inputIndex - 1)
}















// Global Functions
_g.statSpeed = {
    5: '低速',
    10: '高速',
    15: '高速+',
    20: '最速'
}
_g.statRange = {
    1: '短',
    2: '中',
    3: '长',
    4: '超长'
}
_g.getStatSpeed = function (speed) {
    speed = parseInt(speed)
    return _g.statSpeed[speed]
}
_g.getStatRange = function (range) {
    range = parseInt(range)
    return _g.statRange[range]
}
_g.log = function (msg) {
    console.log(msg)
    try { _log(msg) }
    catch (e) { }
}
_g.getGameApi = () => jf.readFileSync(node.path.join(_g.root, '/fetched_data/api_start2.json'))
















// Global Frame
_frame.app_main = {
    page: {},
    page_dom: {},

    // is_init: false
    bgimg_dir: './app/assets/images/homebg',
    bgimgs: [],
    // cur_bgimg_el: null

    // cur_page: null

    // 尚未载入完毕的内容
    loading: [
        'dbs',
        'bgimgs',
        'db_namesuffix'
    ],
    // is_loaded: false,

    // 载入完毕一项内容，并检查其余内容是否载入完毕
    // 如果全部载入完毕，#layout 添加 .ready
    loaded: function (item) {
        _frame.app_main.loading.splice(_frame.app_main.loading.indexOf(item), 1)
        if (!_frame.app_main.loading.length && !_frame.app_main.is_loaded) {
            setTimeout(function () {
                _frame.dom.layout.addClass('ready')
            }, 1000)
            // 绑定onhashchange事件
            $(window).on('hashchange.pagechange', function () {
                _frame.app_main.load_page_func(_g.uriHash('page'))
            })

            _frame.app_main.load_page_func(_g.uriHash('page'))
            _frame.app_main.is_loaded = true
        }
    },


    // 更换背景图
    change_bgimg: function () {
        // _frame.app_main.bgimgs 未生成，函数不予执行
        if (!_frame.app_main.bgimgs.length)
            return false

        var img_new = _frame.app_main.bgimgs[_g.randInt(_frame.app_main.bgimgs.length - 1)]
            , img_old = _frame.app_main.cur_bgimg_el ? _frame.app_main.cur_bgimg_el.css('background-image') : null

        img_old = img_old ? img_old.split('/') : null
        img_old = img_old ? img_old[img_old.length - 1].split(')') : null
        img_old = img_old ? img_old[0] : null

        while (img_new == img_old) {
            img_new = _frame.app_main.bgimgs[_g.randInt(_frame.app_main.bgimgs.length - 1)]
        }

        img_new = '.' + _frame.app_main.bgimg_dir + '/' + img_new

        function delete_old_dom(old_dom) {
            setTimeout(function () {
                old_dom.remove()
            }, _g.animate_duration_delay)
        }

        if (img_old) {
            delete_old_dom(_frame.app_main.cur_bgimg_el)
        }

        //_frame.app_main.cur_bgimg_el = $('<img src="' + img_new + '" />').appendTo( _frame.dom.bgimg )
        _frame.app_main.cur_bgimg_el = $('<div/>').css('background-image', 'url(' + img_new + ')').appendTo(_frame.dom.bgimg)
    },





    // 隐藏内容，只显示背景图
    toggle_hidecontent: function () {
        _frame.dom.layout.toggleClass('hidecontent')
    },





    // 更换页面
    load_page: function (page) {
        _g.uriHash('page', page)
    },
    load_page_func: function (page) {
        if (_frame.app_main.cur_page == page || !page)
            return page

        if (!_frame.app_main.page_dom[page]) {
            _frame.app_main.page_dom[page] = $('<div class="page" page="' + page + '"/>').appendTo(_frame.dom.main)
            node.fs.readFile('./app/page/' + page + '.html', 'utf8', function (err, data) {
                if (err)
                    throw err
                _frame.app_main.page_dom[page].html(data)
                if (_frame.app_main.page[page] && _frame.app_main.page[page].init)
                    _frame.app_main.page[page].init(_frame.app_main.page_dom[page])
                _p.initDOM(_frame.app_main.page_dom[page])
            })
        }

        _frame.app_main.page_dom[page].removeClass('off')

        // 关闭之前的页面
        if (_frame.app_main.cur_page) {
            _frame.dom.navs[_frame.app_main.cur_page].removeClass('on')
            _frame.app_main.page_dom[_frame.app_main.cur_page].addClass('off')
        }

        _frame.dom.navs[page].addClass('on')

        if (_frame.dom.layout.hasClass('ready'))
            _frame.app_main.change_bgimg()

        _frame.app_main.cur_page = page
    },






    init: function () {
        if (_frame.app_main.is_init)
            return true

        // 创建基础框架
        _frame.dom.aside = $('<aside/>').appendTo(_frame.dom.layout)
        _frame.dom.logo = $('<button class="logo" />').on('click', function () {
            _frame.app_main.toggle_hidecontent()
        })
            .html('<strong>' + node.gui.App.manifest['name'] + '</strong><b>' + node.gui.App.manifest['name'] + '</b>')
            .on({
                'animationend, webkitAnimationEnd': function (e) {
                    $(this).addClass('ready-animated')
                }
            })
            .appendTo(_frame.dom.aside)
        _frame.dom.nav = $('<nav/>').appendTo(_frame.dom.aside)
        _frame.dom.main = $('<main/>').appendTo(_frame.dom.layout)
        _frame.dom.bgimg = $('<div class="bgimg" />').appendTo(_frame.dom.layout)

        // 创建左侧主导航菜单
        function navLink(page) {
            return $('<button />').on('click', function () {
                _frame.app_main.load_page(page)
            })
        }
        if (_frame.app_main.nav && _frame.app_main.nav.length) {
            _frame.dom.navs = {}
            for (var i in _frame.app_main.nav) {
                var o = _frame.app_main.nav[i]
                _frame.dom.navs[o.page] = navLink(o.page).html(o.title).appendTo(_frame.dom.nav)
                if (i == 0 && !_g.uriHash('page')) {
                    _frame.dom.navs[o.page].trigger('click')
                }
            }
        }

        // 获取背景图列表，生成背景图
        node.fs.readdir(_frame.app_main.bgimg_dir, function (err, files) {
            for (var i in files) {
                _frame.app_main.bgimgs.push(files[i])
            }
            _frame.app_main.change_bgimg();
            _frame.app_main.loaded('bgimgs')
            //if( !_g.uriHash('page') )
            //	_frame.app_main.load_page( _frame.app_main.nav[0].page )
            //setTimeout(function(){
            //	_frame.dom.layout.addClass('ready')
            //}, 1000)
        })

        // 部分全局事件委托
        $('html').on('click.openShipModal', '[data-shipid]', function () {
            if ($(this).data('shipmodal') == 'false')
                return false
            if ($(this).data('shipedit')) {
                //try{
                _frame.app_main.page['ships'].show_ship_form(_g.data.ships[$(this).data('shipid')])
                //}catch(e){console.log(e)}
            } else {
                try {
                    _frame.app_main.show_ship(_g.data.ships[$(this).data('shipid')])
                } catch (e) { console.log(e) }
            }
        }).on('click.openItemModal', '[data-itemid]', function () {
            if ($(this).data('itemmodal') == 'false')
                return false
            if ($(this).data('itemedit')) {
                //try{
                _frame.app_main.page['items'].show_item_form(_g.data.items[$(this).data('itemid')])
                //}catch(e){console.log(e)}
            } else {
                try {
                    _frame.app_main.show_item(_g.data.items[$(this).data('itemid')])
                } catch (e) { console.log(e) }
            }
        })

        var promise_chain = Q.fcall(function () { })

        // 开始异步函数链
        promise_chain

            // 检查 aap-db 目录，清理不必要的文件，预加载全部数据库
            .then(function () {
                var deferred = Q.defer()
                node.fs.readdir(_g.path.db, function (err, files) {
                    if (err) {
                        deferred.reject(new Error(err))
                    } else {
                        for (var i in files) {
                            const file = files[i]
                            const fullpath = node.path.resolve(_g.path.db, file)
                            const ext = node.path.extname(file)
                            if (ext !== '.nedb') {
                                node.fs.unlinkSync(fullpath)
                                continue
                            }
                            _db[node.path.parse(file)['name']]
                                = new node.nedb({
                                    filename: fullpath
                                })
                        }
                        deferred.resolve(files)
                    }
                })
                return deferred.promise
            })

            // 读取db
            .then(function () {
                _g.log('Preload All DBs: START')
                var the_promises = []
                    , dbs = []
                    , loaded_count = 0

                for (var db_name in _db) {
                    dbs.push(db_name)
                }

                dbs.forEach(function (db_name) {
                    var deferred = Q.defer()
                    function _done(_db_name) {
                        _g.log('DB ' + _db_name + ' DONE')
                        deferred.resolve()
                        loaded_count++
                        if (loaded_count >= dbs.length) {
                            _g.log('Preload All DBs: DONE')
                            setTimeout(function () {
                                _frame.app_main.loaded('dbs')
                            }, 100)
                        }
                    }
                    _db[db_name].loadDatabase(function (err) {
                        if (err) {
                            deferred.reject(new Error(err))
                        } else {
                            switch (db_name) {
                                /*
                                    case 'entities':
                                    case 'items':
                                    case 'item_types':
                                    case 'ship_classes':
                                    case 'ship_types':
                                        _db[db_name].find({}, function(err, docs){
                                            if( typeof _g.data[db_name] == 'undefined' )
                                                _g.data[db_name] = {}
                                            for(var i in docs ){
                                                _g.data[db_name][docs[i]['id']] = docs[i]
                                            }
                                            _db_load_next()
                                        })
                                        break;
                                    */
                                case 'ships':
                                    _done(db_name);
                                    break;
                                case 'ship_namesuffix':
                                    _db.ship_namesuffix.find({}).sort({ 'id': 1 }).exec(function (dberr, docs) {
                                        if (dberr) {
                                            deferred.reject(new Error(dberr))
                                        } else {
                                            _g.data.ship_namesuffix = [{}].concat(docs)
                                            _frame.app_main.loaded('db_namesuffix')
                                            _done(db_name)
                                        }
                                    })
                                    break;
                                case 'ship_type_order':
                                    _db.ship_type_order.find({}).sort({ 'id': 1 }).exec(function (dberr, docs) {
                                        if (dberr) {
                                            deferred.reject(new Error(dberr))
                                        } else {
                                            for (var i in docs) {
                                                _g.ship_type_order.push(
                                                    docs[i]['types'].length > 1 ? docs[i]['types'] : docs[i]['types'][0]
                                                )
                                                //_g.data['ship_type_order'][docs[i]['id']] = docs[i]
                                                _g.data['ship_type_order'][i] = docs[i]
                                                _g.ship_type_order_name.push(docs[i]['name'])
                                            }
                                            // ship type -> ship order
                                            (function () {
                                                for (var i in _g.ship_type_order) {
                                                    var index = parseInt(i)
                                                    if (typeof _g.ship_type_order[i] == 'object') {
                                                        for (var j in _g.ship_type_order[i]) {
                                                            _g.ship_type_order_map[_g.ship_type_order[i][j]] = index
                                                        }
                                                    } else {
                                                        _g.ship_type_order_map[_g.ship_type_order[i]] = index
                                                    }
                                                }
                                            })()
                                            _db.ships.find({}).sort({
                                                //'class': 1, 'class_no': 1, 'series': 1, 'type': 1, 'time_created': 1, 'name.suffix': 1
                                                'type': 1,
                                                'class': 1,
                                                'class_no': 1,
                                                'name.ja_jp': 1,
                                                'time_created': 1,
                                                'name.suffix': 1
                                            }).exec(function (dberr2, docs) {
                                                if (dberr2) {
                                                    deferred.reject(new Error(dberr))
                                                } else {
                                                    for (var i in docs) {
                                                        _g.data.ships[docs[i]['id']] = new Ship(docs[i])

                                                        if (typeof _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]] == 'undefined')
                                                            _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]] = []
                                                        _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]].push(docs[i]['id'])
                                                    }
                                                    function __(i) {
                                                        let j = 0
                                                        while (
                                                            _g.data.ship_id_by_type[i]
                                                            && _g.data.ship_id_by_type[i][j]
                                                        ) {
                                                            let id = _g.data.ship_id_by_type[i][j]
                                                                , i_remodel
                                                                , next_id = _g.data.ships[id].remodel ? _g.data.ships[id].remodel.next : null
                                                            if (next_id
                                                                && _g.data.ships[next_id]
                                                                && next_id != _g.data.ship_id_by_type[i][j + 1]
                                                                && (i_remodel = $.inArray(next_id, _g.data.ship_id_by_type[i])) > -1
                                                            ) {
                                                                _g.log(
                                                                    id
                                                                    + ', ' + next_id
                                                                    + ', ' + i_remodel
                                                                )
                                                                _g.data.ship_id_by_type[i].splice(
                                                                    i_remodel,
                                                                    1
                                                                )
                                                                _g.data.ship_id_by_type[i].splice(
                                                                    $.inArray(id, _g.data.ship_id_by_type[i]) + 1,
                                                                    0,
                                                                    next_id
                                                                )
                                                                //console.log(_g.data.ship_id_by_type[i])
                                                                __(i)
                                                                break
                                                            }
                                                            if (j >= _g.data.ship_id_by_type[i].length - 2) {
                                                                i++
                                                                j = 0
                                                            } else {
                                                                j++
                                                            }
                                                        }
                                                    }
                                                    __(0)
                                                    _done(db_name)
                                                }
                                            })
                                        }
                                    })
                                    break;
                                case 'updates':
                                    if (typeof _g.data[db_name] == 'undefined')
                                        _g.data[db_name] = {}
                                    _done(db_name)
                                    break;
                                case 'arsenal_all':
                                    _g.data['arsenal_all'] = []
                                    _db.arsenal_all.find({}).sort({
                                        'sort': 1
                                    }).exec(function (err, docs) {
                                        for (var i in docs) {
                                            _g.data['arsenal_all'].push(docs[i]['id'])
                                        }
                                        _done(db_name)
                                    })
                                    break;
                                case 'arsenal_weekday':
                                    _g.data['arsenal_weekday'] = {}
                                    _db.arsenal_weekday.find({}).sort({
                                        'weekday': 1
                                    }).exec(function (err, docs) {
                                        for (var i in docs) {
                                            _g.data['arsenal_weekday'][parseInt(i)]
                                                = docs[i].improvements
                                        }
                                        _done(db_name)
                                    })
                                    break;
                                default:
                                    _db[db_name].find({}, function (dberr, docs) {
                                        if (dberr) {
                                            deferred.reject(new Error(dberr))
                                        } else {
                                            if (typeof _g.data[db_name] == 'undefined')
                                                _g.data[db_name] = {}
                                            for (var i in docs) {
                                                switch (db_name) {
                                                    case 'items':
                                                        _g.data[db_name][docs[i]['id']] = new Equipment(docs[i])
                                                        break;
                                                    case 'consumables':
                                                        _g.data[db_name][docs[i]['id']] = new ItemBase(docs[i])
                                                        break;
                                                    default:
                                                        _g.data[db_name][docs[i]['id']] = docs[i]
                                                        break;
                                                }
                                            }
                                            _done(db_name)
                                        }
                                    })
                                    break;
                            }

                        }
                    })
                    the_promises.push(deferred.promise)
                })

                return Q.all(the_promises);
            })

            // 根据装备大类和类型排序整理装备ID
            .then(function () {
                var deferred = Q.defer()
                _g.data.item_id_by_type = []
                _g.item_type_order = []
                var type_by_collection = {}
                    , type_order_map = {}
                // 遍历大类
                for (var i in _g.data.item_type_collections) {
                    for (var j in _g.data.item_type_collections[i]['types']) {
                        type_by_collection[_g.data.item_type_collections[i]['types'][j]] = i
                        _g.item_type_order.push(_g.data.item_type_collections[i]['types'][j])
                        type_order_map[_g.data.item_type_collections[i]['types'][j]] = _g.item_type_order.length - 1
                    }
                }
                // 遍历装备数据
                for (var i in _g.data.items) {
                    var order = type_order_map[_g.data.items[i]['type']]
                    if (!_g.data.item_id_by_type[order])
                        _g.data.item_id_by_type[order] = {
                            'collection': type_by_collection[_g.data.items[i]['type']],
                            'equipments': [],
                            'names': []
                        }
                    _g.data.item_id_by_type[order]['equipments'].push(_g.data.items[i]['id'])
                    _g.data.item_id_by_type[order]['names'].push(_g.data.items[i].getName())
                }
                // 排序
                for (let i in _g.data.item_id_by_type) {
                    _g.data.item_id_by_type[i]['equipments'].sort(function (a, b) {
                        let diff = _g.data.items[a].getPower() - _g.data.items[b].getPower()
                        if (diff === 0) {
                            let diff_aa = _g.data.items[a]['stat']['aa'] - _g.data.items[b]['stat']['aa']
                            if (diff_aa === 0) {
                                return _g.data.items[a]['stat']['hit'] - _g.data.items[b]['stat']['hit']
                            }
                            return diff_aa
                        }
                        return diff
                    })
                }
                setTimeout(function () {
                    deferred.resolve()
                }, 100)
                return deferred.promise
            })

            // 添加子舰种
            .then(() => {
                function addSubType(searchForTypeName, subTypeName, cbFilterShip) {
                    _g.ship_type_order_name.some(({zh_cn: name}, index) => {
                        if (name === searchForTypeName) {
                            const list = _g.data.ship_id_by_type[index]
                                .map(id => _g.data.ships[id])
                                .filter(cbFilterShip)
                                .map(ship => ship.id)
                            list.forEach(id => {
                                _g.data.ship_id_by_type[index].splice(
                                    _g.data.ship_id_by_type[index].indexOf(id),
                                    1
                                )
                            })
                            _g.ship_type_order_name.splice(index, 0, {
                                zh_cn: subTypeName
                            })
                            _g.data.ship_id_by_type.splice(index, 0, list)
                            _g.ship_type_order.splice(index, 0, _g.ship_type_order[index])

                            const typeOrder = []
                            Object.entries(_g.data.ship_type_order)
                                .forEach(([key, value]) => {
                                    typeOrder[key] = value
                                })
                            typeOrder.splice(index, 0, Object.assign({}, _g.data.ship_type_order[index]))
                            typeOrder[index].name = Object.assign({}, typeOrder[index].name)
                            typeOrder[index].name.zh_cn = subTypeName
                            _g.data.ship_type_order = typeOrder.reduce((obj, cur, index) => {
                                obj[index] = cur
                                return obj
                            }, {})

                            return true
                        }
                        return false
                    })
                }
                addSubType(
                    '正规航母',
                    '正规航母 / 近代化航母',
                    function(ship) {
                        return ship.stat.asw > 0
                    }
                )
                addSubType(
                    '正规航母',
                    '正规航母 / 夜间作战航母',
                    function(ship) {
                        if (!ship.capabilities) return false
                        return !!ship.capabilities.count_as_night_operation_aviation_personnel
                    }
                )
                addSubType(
                    '轻型航母',
                    '轻型航母 / 夜间作战航母',
                    function(ship) {
                        if (!ship.capabilities) return false
                        return !!ship.capabilities.count_as_night_operation_aviation_personnel
                    }
                )
                addSubType(
                    '轻型航母',
                    '轻型航母 / 改装特种航母',
                    function(ship) {
                        return Array.isArray(ship.additional_item_types)
                            && ship.additional_item_types.includes(38)
                    }
                )
                addSubType(
                    '轻型航母',
                    '轻型航母 / 护航航母',
                    function(ship) {
                        return ship.stat.asw > 0
                    }
                )
                addSubType(
                    '轻型航母',
                    '轻型航母 / 攻击型轻航母',
                    function(ship) {
                        if (!ship.capabilities) return false
                        return !!ship.capabilities.attack_surface_ship_prioritised
                    }
                )
            })

            // 读取db
            /*
                var _db_size = 0
                    ,_db_loaded = 0
                for( var i in _db )
                    _db_size++
                function _db_load( db_name ){
                    _db[db_name].loadDatabase(function(err){
                        if( err ){
    
                        }else{
                            _db_loaded++
    
                            switch( db_name ){
                                case 'item_types':
                                    _db.item_types.find({}, function(err, docs){
                                        for(var i in docs ){
                                            _g.data.item_types[docs[i]['id']] = docs[i]
                                        }
                                    })
                                    break;
                                case 'ship_namesuffix':
                                    _db.ship_namesuffix.find({}).sort({ 'id': 1 }).exec(function(err, docs){
                                        _g.data.ship_namesuffix = [{}].concat(docs)
                                        _frame.app_main.loaded('db_namesuffix')
                                    })
                                    break;
                                case 'ship_types':
                                    _db.ship_types.find({}, function(err, docs){
                                        for(var i in docs ){
                                            _g.data.ship_types[docs[i]['id']] = docs[i]
                                        }
                                    })
                                    break;
                                case 'ship_type_order':
                                    // ship type -> ship order
                                    function map_do(){
                                        for( var i in _g.ship_type_order ){
                                            var index = parseInt(i)
                                            if( typeof _g.ship_type_order[i] == 'object' ){
                                                for( var j in _g.ship_type_order[i] ){
                                                    _g.ship_type_order_map[ _g.ship_type_order[i][j] ] = index
                                                }
                                            }else{
                                                _g.ship_type_order_map[ _g.ship_type_order[i] ] = index
                                            }
                                        }
                                    }
                                    _db.ship_type_order.find({}).sort({'id': 1}).exec(function(err, docs){
                                        for(var i in docs ){
                                            _g.ship_type_order.push(
                                                docs[i]['types'].length > 1 ? docs[i]['types'] : docs[i]['types'][0]
                                            )
                                            _g.ship_type_order_name.push( docs[i]['name'] )
                                        }
                                        map_do()
                                    })
                                    break;
                            }
    
                            if( _db_loaded >= _db_size )
                                _frame.app_main.loaded('dbs')
                        }
                    })
                }
                for( var i in _db ){
                    _db_load(i)
                }
            */
            .then(function () {
                _g.buildIndex();
            })

        _frame.app_main.is_init = true
    }
}




// search index
_g.index = {
    ships: {},
    equipments: {}
};
_g.buildIndex = function () {
    function _build(datalist, n) {
        for (let i in datalist) {
            let ids = (n == 'ships')
                ? datalist[i].getSeriesData().map(function (o) {
                    return o.id
                })
                : [datalist[i].id]
            if (ids.push && ids.length == 0)
                ids = [datalist[i].id]
            for (let j in datalist[i].name) {
                if (datalist[i].name[j] && j != 'suffix') {
                    let _n = datalist[i].name[j].toLowerCase()
                    if (!_g.index[n][_n])
                        _g.index[n][_n] = []
                    ids.forEach(function (thisId) {
                        if (!_g.index[n][_n].some(function (thisObj) {
                            return thisObj.id == thisId
                        })) {
                            _g.index[n][_n].push(datalist[thisId])
                        }
                    })
                }
            }
        }
    }
    _build(_g.data.ships, 'ships')
    _build(_g.data.items, 'equipments')
};
_g.search = function (q, t) {
    t = _g.index[t]
    let r = [], e = []
    if (!t || !q)
        return r
    q = q.trim().toLowerCase()
    function _concat(a) {
        r = r.concat(
            a.filter(function (v) {
                if (e.indexOf(t + v.id) > -1)
                    return false
                e.push(t + v.id)
                return true
                //return (r.indexOf(v) < 0)
            })
            /*
            .sort(function(a,b){
                //return (a._name || a.name[_g.lang]) - (b._name || b.name[_g.lang])
                return (b.name.suffix||0) - (a.name.suffix||0)
            })
            */
        )
    }
    if (t[q])
        _concat(t[q])
    for (let i in t) {
        if (q !== i && i.indexOf(q) > -1) {
            _concat(t[i])
        }
    }
    return r
};
_g.searchTest = function (q, t) {
    let r = []
    q = _g.search(q, t)
    for (let i in q) {
        r.push(q[i]._name || q[i].name[_g.lang])
    }
    return r
};
