"use strict";

_g.shipCapabilities = [
    {
        key: 'count_as_landing_craft',
        name: '算作：登陆艇',
        type: 'number',
    },
    {
        key: 'count_as_night_operation_aviation_personnel',
        name: '算作：夜间航空要员',
        type: 'number',
    },
    {
        key: 'participate_night_battle_when_equip_swordfish',
        name: '[CV] 当装备剑鱼时可参与夜战',
        type: 'checkbox',
    },
    {
        key: 'attack_surface_ship_prioritised',
        name: '[CV] 优先攻击水面舰',
        type: 'checkbox',
    },
    {
        key: 'anti_air_rocket_barrage',
        name: '对空弹幕',
        type: 'select',
        values: [
            {
                value: '',
                name: '❌'
            },
            {
                value: true,
                name: '✔'
            },
            {
                value: 'high',
                name: '✔ 可能性：高'
            }
        ]
    },
]

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
        'ships': process.cwd() + '/pics/ships/',
        'items': process.cwd() + '/pics/items/'
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

            // 检查 aap-db 目录，预加载全部数据库
            .then(function () {
                var deferred = Q.defer()
                node.fs.readdir(_g.path.db, function (err, files) {
                    if (err) {
                        deferred.reject(new Error(err))
                    } else {
                        for (var i in files) {
                            _db[node.path.parse(files[i])['name']]
                                = new node.nedb({
                                    filename: node.path.join(_g.path.db, '/' + files[i])
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

class ItemBase {
	constructor(data) {
		$.extend(true, this, data)
	}

	getName(language){
		language = language || _g.lang
		return this['name']
				? (this['name'][language] || this['name'].ja_jp || this.name)
				: null
	}
	
	get _name(){
		return this.getName()
	}
}
// Class for Entity (Person/Group, such as CVs, illustrators)

class Entity extends ItemBase{
	constructor(data) {
		super()
		$.extend(true, this, data)
	}
}
class Equipment extends ItemBase{
	constructor(data) {
		super()
		$.extend(true, this, data)
	}
	
	getName(small_brackets, language){
		language = language || _g.lang
		var result = ItemBase.prototype.getName.call(this, language)
			//,result = super.getName(language)
			,small_brackets_tag = small_brackets && !small_brackets === true ? small_brackets : 'small'
		return small_brackets
				? result.replace(/（([^（^）]+)）/g, '<'+small_brackets_tag+'>($1)</'+small_brackets_tag+'>')
				: result
	}
	
	getType(language){
		language = language || _g.lang
		return this['type']
				? _g['data']['item_types'][this['type']]['name'][language]
				: null
	}

	getIconId(){
		return _g.data.item_types[this['type']]['icon']
	}
	get _icon(){
		return 'assets/images/itemicon/' + this.getIconId() + '.png'
	}
	
	getCaliber(){
		let name = this.getName(false, 'ja_jp')
			,caliber = parseFloat(name)
		
		return caliber
	}
	
	getPower(){
		return this.stat[
			_g.data['item_types'][this['type']]['main_attribute'] || 'fire'
		]
		/*
		switch( this['type'] ){
			// Guns
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
		}
		*/
	}
}
/* Class: Ship / 舰娘

 *******************************************************************

new Ship( Object data )
	data	原始数据

 *******************************************************************

ship instanceof Ship

ship.getName( joint, language )
	获取舰名
	变量
		joint		[OPTIONAL]
			String		连接符，如果存在后缀名，则在舰名和后缀名之间插入该字符串
			Boolean		如果为 true，则添加默认连接符
						如果为 false，则不添加连接符
			null		不添加连接符
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		舰名 + 连接符（如果有） + 后缀名（如果有）
	快捷方式
		ship._name	默认连接符，默认语言

ship.getNameNoSuffix( language )
	获取舰名，不包括后缀
	变量
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		舰名，不包括后缀

ship.getSuffix( language )
	获取后缀名
	变量
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		后缀名

ship.getType( language )
	获取舰种
	变量
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		舰种
	快捷方式
		ship._type	默认语言

ship.getSeriesData()
	获取系列数据
	返回值
		Object		系列

ship.getPic( picId )
	获取图鉴uri/path
	变量
		picId	[OPTIONAL]
			Number		图鉴Id，默认 0
	返回值
		String		uri/path
	快捷方式
		ship._pics	获取全部图鉴，Array

ship.getRel( relation )
	获取关系
	变量
		relation	[OPTIONAL]
			String		关系名
	返回值
		Object			如果没有给出 relation，返回关系对象
		String||Number	如果给出 relation，返回值，默认读取 rels 下的属性，如果不存在，读取上一个改造版本的对应关系

ship.getCV( language )
	获取声优
	变量
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		声优名
	快捷方式
		ship._cv	默认语言

ship.getIllustrator( language )
	获取画师
	变量
		language	[OPTIONAL]
			String		语言代码，默认为 _g.lang
	返回值
		String		画师名
	快捷方式
		ship._illustrator	默认语言

 */

class Ship extends ItemBase{
	constructor(data){
		super()
		$.extend(true, this, data)
	}
	
	getName(joint, language){
		joint = joint || ''
		language = language || _g.lang
		let suffix = this.getSuffix(language)
		return (
				this['name'][language] || this['name']['ja_jp']
				) + ( suffix ? (
						(joint === true ? _g.joint : joint)
						+ suffix
					) : ''
				)
	}
	
	getNameNoSuffix(language){
		language = language || _g.lang
		return this['name'][language] || this['name']['ja_jp']
	}
	
	getSuffix(language){
		language = language || _g.lang
		return this['name'].suffix
					? (
						_g.data['ship_namesuffix'][this['name'].suffix][language]
						|| _g.data['ship_namesuffix'][this['name'].suffix]['ja_jp']
						|| ''
					)
					: ''
	}
	
	getType(language){
		language = language || _g.lang
		return this['type']
				? _g['data']['ship_types'][this['type']].name.zh_cn
				: null
	}
	get _type(){
		return this.getType()
	}
	
	getSeriesData(){
		return this['series']
				? _g['data']['ship_series'][this['series']]['ships']
				: [{
						'id':	this.id
					}]
	}
	
	getPic(picId){
		let series = this.getSeriesData()
		picId = parseInt(picId || 0)
		
		let getURI = function(i, p){
			if( typeof node != 'undefined' && node && node.path && _g.path.pics.ships )
				return node.path.join(_g.path.pics.ships, i + '/' +p+ '.webp')
			if( _g.path.pics.ships )
				return _g.path.pics.ships + i + '/' + p + '.png'
			return '/' + i + '/' + p + '.png'
		}
		
		for(let i=0; i<series.length; i++){
			if( series[i].id == this.id ){
				switch(picId){
					case 0:
					case 1:
					case 2:
					case 3:
					case 12:
					case 13:
					case 14:
						return getURI(this.id, picId)
						break;
					default:
						if( series[i].illust_delete ){
							return getURI(series[i-1].id, picId)
						}else{
							return getURI(this.id, picId)
						}
						break;
				}
				break;
			}
		}
	}
	get _pics(){
		let arr = []
		for(let i=0; i<15; i++){
			arr.push( this.getPic(i) )
		}
		return arr
	}
	
	getSpeed(language){
		language = language || _g.lang
		return _g.statSpeed[parseInt(this.stat.speed)]
	}
	get _speed(){
		return this.getSpeed()
	}
	
	getRange(language){
		language = language || _g.lang
		return _g.statRange[parseInt(this.stat.range)]
	}
	get _range(){
		return this.getRange()
	}
	
	getEquipmentTypes(){
		return _g.data.ship_types[this['type']].equipable.concat( ( this.additional_item_types || [] ) ).sort(function(a, b){
			return a-b
		})
	}
	
	getAttribute(attr, lvl){
		lvl = lvl || 1
		if( lvl > Ship.lvlMax )
			lvl = Ship.lvlMax
		
		let getStatOfLvl = function( lvl, base, max ){
			lvl = lvl || 1
			base = parseFloat(base)
			max = parseFloat(max) || base
			if( base < 0 || max < 0 )
				return -1
			if( base == max )
				return max
			return Math.floor( base + (max - base) * lvl / 99 )
		}
		
		let value
		
		switch(attr){
			case 'hp':
				value = this['stat']['hp']
				if( lvl > 99 ){
					if (this['stat']['hp'] >= 90) value = this['stat']['hp'] + 9
					else if (this['stat']['hp'] >= 70) value = this['stat']['hp'] + 8
					else if (this['stat']['hp'] >= 50) value = this['stat']['hp'] + 7
					else if (this['stat']['hp'] >= 40) value = this['stat']['hp'] + 6
					else if (this['stat']['hp'] >= 30) value = this['stat']['hp'] + 5
					else value = this['stat']['hp'] + 4
					if (value > this['stat']['hp_max']) value = this['stat']['hp_max']
				}
				return value
				break;
			case 'speed':
				return _g.getStatSpeed( this['stat']['speed'] )
				break;
			case 'range':
				return _g.getStatRange( this['stat']['range'] )
				break;
			case 'luck':
				if( lvl > 99 )
					return (this['stat']['luck'] + 3)
				return this['stat']['luck']
				break;
			case 'fuel':
			case 'ammo':
				if( lvl > 99 )
					return Math.floor( this['consum'][attr] * 0.85 )
				return this['consum'][attr]
				break;
			case 'aa':
			case 'armor':
			case 'fire':
			case 'torpedo':
				return this['stat'][attr+'_max'] || this['stat'][attr]
				break;
			default:
				return getStatOfLvl( lvl, this['stat'][attr], this['stat'][attr + '_max'] )
				break;
		}
	}
	
	getRel( relation ){
		if( relation ){
			if( !this.rels[relation] && this.remodel && this.remodel.prev ){
				let prev = _g.data.ships[this.remodel.prev]
				while( prev ){
					if( prev.rels && prev.rels[relation] )
						return prev.rels[relation]
					if( !prev.remodel || !prev.remodel.prev )
						prev = null
					else
						prev = _g.data.ships[prev.remodel.prev]
				}
			}
			return this.rels[relation]
		}else{
			return this.rels
		}
	}
	
	getCV(language){
		let entity = this.getRel('cv')
		if( entity )
			return _g.data.entities[entity].getName(language || _g.lang)
		return
	}
	get _cv(){
		return this.getCV()
	}
	
	getIllustrator(language){
		let entity = this.getRel('illustrator')
		if( entity )
			return _g.data.entities[entity].getName(language || _g.lang)
		return
	}
	get _illustrator(){
		return this.getIllustrator()
	}
}

Ship.lvlMax = 155;

_frame.app_main.page['home'] = {}

node.require('http')
node.require('url')

_frame.app_main.page['init'] = {}

var __log

_frame.app_main.page['init'].data_ships = null
_frame.app_main.page['init'].fetch_ships = function () {
    __log('fetching data for ships...')
    var url = node.url.parse($('#data_ships').val())
    //var req = node.http.get( $('#data_ships').val(), function(res){
    var req = node.http.request({
        'hostname': url.hostname,
        'path': url.path,
        'method': 'GET',
        'headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
        }
    }, function (res) {
        if (res.statusCode == 200) {
            res.setEncoding('utf8');
            var body = ''
            res.on('data', function (d) {
                body += d
            });
            res.on('end', function () {
                //res.setEncoding('utf8');
                body = body.replace(/^var [^ ^\=]+[ ]*=/, '')
                eval('_frame.app_main.page[\'init\'].data_ships = ' + body)
                __log('fetched data for ships (' + _frame.app_main.page['init'].data_ships.length + ').')

                // 将Array内所有数据分别存放至 ./fetched_data/ships/
                node.mkdirp.sync(_g.path.fetched.ships)
                function savedata_next() {
                    _frame.app_main.page['init'].data_ships.shift()
                    if (_frame.app_main.page['init'].data_ships.length) {
                        setTimeout(function () {
                            savedata()
                        }, 10)
                    } else {
                        __log('all data for ships saved.')
                        _frame.app_main.page['init'].fetch_items()
                    }
                }
                function savedata() {
                    var o = _frame.app_main.page['init'].data_ships[0]
                    _db.ships.find({ 'id': parseInt(o.id) }, function (err, docs) {
                        if (err || !docs || !docs.length) {
                            node.fs.writeFile(_g.path.fetched.ships + '/' + o.id + '.json'
                                , JSON.stringify(o)
                                , function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        __log('saved data file for ship [' + o.id + '] No.' + o.no + ' ' + o.name + '.')
                                    }
                                    savedata_next()
                                })
                        } else {
                            __log('data for ship [' + o.id + '] No.' + o.no + ' ' + o.name + ' exists in database. skip.')
                            savedata_next()
                        }
                    })
                }
                savedata()
            });
        } else {
            __log("fetching error: CODE " + res.statusCode);
        }
    });
    req.end();
}

_frame.app_main.page['init'].data_items = null
_frame.app_main.page['init'].fetch_items = function () {
    __log('fetching data for items...')
    var url = node.url.parse($('#data_items').val())
    //var req = node.http.get( $('#data_items').val(), function(res){
    var req = node.http.request({
        'hostname': url.hostname,
        'path': url.path,
        'method': 'GET',
        'headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
        }
    }, function (res) {
        if (res.statusCode == 200) {
            res.setEncoding('utf8');
            var body = ''
            res.on('data', function (d) {
                body += d
            });
            res.on('end', function () {
                //res.setEncoding('utf8');
                body = body.replace(/^var [^ ^\=]+[ ]*=/, '')
                eval('_frame.app_main.page[\'init\'].data_items = ' + body)
                __log('fetched data for items (' + _frame.app_main.page['init'].data_items.length + ').')

                // 将Array内所有数据分别存放至 ./fetched_data/ships/
                node.mkdirp.sync(_g.path.fetched.items)
                function savedata_next() {
                    _frame.app_main.page['init'].data_items.shift()
                    if (_frame.app_main.page['init'].data_items.length) {
                        setTimeout(function () {
                            savedata()
                        }, 10)
                    } else {
                        __log('all data for items saved.')
                    }
                }
                function savedata() {
                    var o = _frame.app_main.page['init'].data_items[0]
                    _db.items.find({ 'id': parseInt(o.id) }, function (err, docs) {
                        if (err || !docs || !docs.length) {
                            node.fs.writeFile(_g.path.fetched.items + '/' + o.id + '.json'
                                , JSON.stringify(o)
                                , function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        __log('saved data file for item [' + o.id + '] ' + o.name + '.')
                                    }
                                    savedata_next()
                                })
                        } else {
                            __log('data for item [' + o.id + '] ' + o.name + ' exists in database. skip.')
                            savedata_next()
                        }
                    })
                }
                savedata()
            });
        } else {
            __log("fetching error: CODE " + res.statusCode);
        }
    });
    req.end();
}










_frame.app_main.page['init'].remain_illustrations = []
_frame.app_main.page['init'].init_illustrations = function () {
    __log('start initializing illustrations for ships...')

    function move_files() {
        if (_frame.app_main.page['init'].remain_illustrations.length) {
            var oldPath = _frame.app_main.page['init'].remain_illustrations[0]
                , newPath = node.path.normalize(_g.path.pics.ships + '/' + node.path.relative('./fetched_data/ships_pic/', oldPath))

            node.fs.rename(
                oldPath,
                newPath,
                function (err) {
                    __log('file moved to ' + newPath + '.')
                    _frame.app_main.page['init'].remain_illustrations.shift()
                    setTimeout(function () {
                        move_files()
                    }, 10)
                }
            )
        } else {
            __log('all illustrations for ships files moved...')
        }
    }

    node.fs.readdir('./fetched_data/ships_pic/', function (err, files) {
        if (!err) {
            for (var i in files) {
                _frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/0.jpg')
                _frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/1.jpg')
                _frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/2.jpg')
                _frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/3.jpg')
                _frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/8.png')
                _frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/9.png')
                _frame.app_main.page['init'].remain_illustrations.push('./fetched_data/ships_pic/' + files[i] + '/10.png')

                node.mkdirp.sync(_g.path.pics.ships + '/' + files[i])

                if (i >= files.length - 1)
                    move_files()
            }
        }
    })
}












_frame.app_main.page['init'].exportdata = function (form) {
    var dest = form.find('[name="destfolder"]').val()
        , files = []
        , promise_chain = Q.fcall(function () { })
        , _ship = {}
        , _ship_series = {}
        , _item = {}
        , _item_type = {}
        , _entity = {}

    // 开始异步函数链
    promise_chain

        // 遍历全部数据 (舰娘 & 装备 & 装备类型)
        .then(function () {
            var deferred = Q.defer()
            _db.ships.find({}, function (err, docs) {
                for (var i in docs) {
                    _ship[docs[i]['id']] = new Ship(docs[i])
                }
                console.log(_ship)
                deferred.resolve()
            })
            return deferred.promise
        })
        .then(function () {
            var deferred = Q.defer()
            _db.ship_series.find({}, function (err, docs) {
                for (var i in docs) {
                    _ship_series[docs[i]['id']] = docs[i]
                }
                console.log(_ship_series)
                deferred.resolve()
            })
            return deferred.promise
        })
        .then(function () {
            var deferred = Q.defer()
            _db.items.find({}, function (err, docs) {
                for (var i in docs) {
                    _item[docs[i]['id']] = new Equipment(docs[i])
                }
                console.log(_item)
                deferred.resolve()
            })
            return deferred.promise
        })
        .then(function () {
            var deferred = Q.defer()
            _db.item_types.find({}, function (err, docs) {
                for (var i in docs) {
                    _item_type[docs[i]['id']] = docs[i]
                }
                console.log(_item_type)
                deferred.resolve()
            })
            return deferred.promise
        })
        .then(function () {
            var deferred = Q.defer()
            _db.entities.find({}, function (err, docs) {
                for (var i in docs) {
                    _entity[docs[i]['id']] = new Entity(docs[i])
                }
                console.log(_entity)
                deferred.resolve()
            })
            return deferred.promise
        })

        // 获取文件列表
        .then(function () {
            var deferred = Q.defer()
            node.fs.readdir('./data/', function (err, arrfiles) {
                if (err) {
                    deferred.reject(err)
                } else {
                    files = arrfiles
                    deferred.resolve(arrfiles)
                }
            })
            return deferred.promise
        })

        // 装备 - 初始装备于
        .then(function () {
            var deferred = Q.defer()
                , equipped_by_item_id = {}
                , length = 0

            __log('&nbsp;')
            __log('========== 装备 - 初始装备于 ==========')
            __log('= 批处理开始')

            function _get_ships(item_id, _id, _index) {
                const ships_equipped = {}
                let ships = []
                new Promise(resolve => {
                    _db.ships.find({ "equip": item_id }, function (err2, docs2) {
                        ships = ships.concat(docs2)
                        resolve()
                    })
                }).then(() => new Promise(resolve => {
                    _db.ships.find({ "equip.id": item_id }, function (err2, docs2) {
                        ships = ships.concat(docs2)
                        resolve()
                    })
                })).then(() => {
                    for (const j in ships) {
                        if (typeof ships_equipped[ships[j]['series']] == 'undefined')
                            ships_equipped[ships[j]['series']] = []
                        ships_equipped[ships[j]['series']].push(ships[j])
                    }
                    for (const j in ships_equipped) {
                        ships_equipped[j].sort(function (a, b) {
                            return a['name']['suffix'] - b['name']['suffix']
                        })
                        for (const k in ships_equipped[j]) {
                            equipped_by_item_id[_id].push(ships_equipped[j][k]['id'])
                            //d['default_equipped_on'].push( ships_equipped[j][k]['id'] )
                        }
                    }
                }).then(() => {
                    if (_index >= length - 1)
                        _db_do_all()
                })
            }
            function _db_do_all() {
                function _db_do(_id, set_data, _index) {
                    _db.items.update({
                        '_id': _id
                    }, {
                            $set: set_data
                        }, {}, function (err, numReplaced) {
                            if (_index >= length - 1) {
                                __log('= 批处理完毕')
                                deferred.resolve()
                            }
                        })
                }
                var index = 0
                for (var i in equipped_by_item_id) {
                    var _equipped_data = [];
                    $.each(equipped_by_item_id[i], function (i, el) {
                        if ($.inArray(el, _equipped_data) === -1) _equipped_data.push(el);
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
            _db.items.find({}, function (err, docs) {
                for (var i in docs) {
                    var d = docs[i]
                    equipped_by_item_id[d['_id']] = []
                    length++
                    _get_ships(d['id'], d['_id'], i)
                }
            })
            return deferred.promise
        })

        // 装备 - 改修升级前后关系
        .then(function () {
            // 遍历所有装备的 upgrade_to 数据，重组关系表
            var deferred = Q.defer()
                , _upgrade_from = {}
                , length = 0

            //let lll = 0;

            __log('&nbsp;')
            __log('========== 装备 - 改修升级前后关系 ==========')
            __log('= 批处理开始')

            _db.items.find({}, function (err, docs) {
                for (var i in docs) {
                    var d = docs[i]

                    if (!_upgrade_from[d['id']])
                        _upgrade_from[d['id']] = [null, []]
                    _upgrade_from[d['id']][0] = d['_id']
                    _upgrade_from[d['id']][2] = d['id']

                    length++
                    //console.log(d['id'], length)

                    if (d['upgrade_to'] && d['upgrade_to'].length) {
                        for (var j in d['upgrade_to']) {
                            var _id = d['upgrade_to'][j][0]
                            if (!_upgrade_from[_id])
                                _upgrade_from[_id] = [null, []]
                            _upgrade_from[_id][1].push(d['id'])
                        }
                    }
                }
                console.log(_upgrade_from)
                _db_do_all()
            })
            function _db_do_all() {
                function _db_do(_id, set_data, _index, id) {
                    _db.items.update({
                        '_id': _id
                    }, {
                            $set: set_data
                        }, {}, function (err, numReplaced) {
                            if (err) {
                                console.log(err)
                            }
                            //console.log( length, id, _index, ++lll )
                            if (_index >= length - 1) {
                                __log('= 批处理完毕')
                                deferred.resolve()
                            }
                        })
                }
                var index = 0
                for (var i in _upgrade_from) {
                    _db_do(
                        _upgrade_from[i][0],
                        {
                            'upgrade_from': _upgrade_from[i][1]
                        },
                        index,
                        _upgrade_from[i][2]
                    )
                    index++
                }
            }
            return deferred.promise
        })

        // 装备 - 改修材料关系
        .then(function () {
            var deferred = Q.defer()
                , _upgrade_for = {}
                , length = 0

            const add = (id, for_id) => {
                if (!_upgrade_for[for_id])
                    _upgrade_for[for_id] = [null, []];
                if (for_id != id && _upgrade_for[for_id][1].indexOf(id) < 0)
                    _upgrade_for[for_id][1].push(id)
            }

            __log('&nbsp;')
            __log('========== 装备 - 改修材料关系 ==========')
            __log('= 批处理开始')

            _db.items.find({}, function (err, docs) {
                for (var i in docs) {
                    var d = docs[i]

                    if (!_upgrade_for[d['id']])
                        _upgrade_for[d['id']] = [null, []];
                    _upgrade_for[d['id']][0] = d._id

                    length++

                    if (d['improvement'] && d['improvement'].length && d['improvement'].push) {
                        var o = _upgrade_for[d['id']]
                        d['improvement'].forEach(function (improvement) {
                            if (improvement.resource && improvement.resource.length && improvement.resource.push) {
                                improvement.resource.forEach(function (resource, index) {
                                    if (index && resource[4]) {
                                        if (Array.isArray(resource[4])) {
                                            resource[4].forEach(reqitem => {
                                                add(d.id, reqitem[0])
                                            })
                                        } else {
                                            add(d.id, resource[4])
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
                console.log(_upgrade_for)
                _db_do_all()
            })
            function _db_do_all() {
                function _db_do(_id, update, _index) {
                    console.log(_id, update)
                    _db.items.update({
                        '_id': _id
                    }, update, {}, function (err, numReplaced) {
                        if (_index >= length - 1) {
                            __log('= 批处理完毕')
                            deferred.resolve()
                        }
                    })
                }
                var index = 0
                for (var i in _upgrade_for) {
                    _db_do(
                        _upgrade_for[i][0],
                        {
                            $set: {
                                'upgrade_for': _upgrade_for[i][1]
                            }
                        },
                        index
                    )
                    index++
                }
            }
            return deferred.promise
        })

        // 改修工厂 - 每日改修 & 改修明细
        .then(function () {
            var deferred = Q.defer()
                , data_weekday = []
                , index_weekday = []
                , data_all = []
                , _promise_chain = Q.fcall(function () { })

            __log('&nbsp;')
            __log('========== 改修工厂 - 每日改修 & 改修明细 ==========')
            __log('= 批处理开始')

            for (var i = 0; i < 7; i++) {
                data_weekday[i] = {
                    'weekday': i,
                    'improvements': []
                    // equipment_id, improvement_index, requirement_index
                }
                index_weekday[i] = {}
            }

            for (let m in _g.data.item_id_by_type) {
                for (let n in _g.data.item_id_by_type[m]['equipments']) {
                    let d = _item[_g.data.item_id_by_type[m]['equipments'][n]]

                    console.log(_g.data.item_id_by_type[m]['equipments'][n], d)
                    if (d.improvement && d.improvement.length) {
                        data_all.push({
                            'id': d['id'],
                            'sort': data_all.length
                        })

                        for (var j in d.improvement) {
                            for (var k in d.improvement[j].req) {
                                var req = d.improvement[j].req[k]
                                for (var l = 0; l < 7; l++) {
                                    if (req[0][l]) {
                                        var index = d['id'] + '_' + parseInt(j)
                                        if (typeof index_weekday[l][index] == 'undefined') {
                                            index_weekday[l][index] = data_weekday[l].improvements.length
                                            data_weekday[l].improvements.push([
                                                d['id'],
                                                parseInt(j),
                                                [parseInt(k)]
                                            ])
                                        } else {
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
                .then(function () {
                    var _deferred = Q.defer()
                    _db.arsenal_all.remove({}, { multi: true }, function (err, numRemoved) {
                        _deferred.resolve()
                    });
                    return _deferred.promise
                })
                .then(function () {
                    var _deferred = Q.defer()
                    _db.arsenal_weekday.remove({}, { multi: true }, function (err, numRemoved) {
                        _deferred.resolve()
                    });
                    return _deferred.promise
                })

                // 写入数据库
                .then(function () {
                    var _deferred = Q.defer()
                    _db.arsenal_all.insert(data_all, function (err, newDocs) {
                        _deferred.resolve()
                    })
                    return _deferred.promise
                })
                .then(function () {
                    var _deferred = Q.defer()
                    _db.arsenal_weekday.insert(data_weekday, function (err, newDocs) {
                        _deferred.resolve()
                    })
                    return _deferred.promise
                })

                // 完成
                .then(function () {
                    __log('= 批处理完成')
                    deferred.resolve()
                })

            return deferred.promise
        })

        // 舰种 - 可装备类型
        .then(function () {
            let deferred = Q.defer()
                , types_by_shiptype = {}
                , length = 0

            __log('&nbsp;')
            __log('========== 舰种 - 可装备类型 ==========')
            __log('= 批处理开始')

            for (let i in _item_type) {
                let equipable_on_type = _item_type[i].equipable_on_type || []
                for (let j in equipable_on_type) {
                    if (!types_by_shiptype[equipable_on_type[j]])
                        types_by_shiptype[equipable_on_type[j]] = []
                    types_by_shiptype[equipable_on_type[j]].push(_item_type[i].id)
                }
            }
            length = types_by_shiptype._size

            function _db_do_all() {
                let index = 0
                function _db_do(find, set_data, _index) {
                    console.log(find, set_data)
                    _db.ship_types.update(find, {
                        $set: set_data
                    }, {}, function (err, numReplaced) {
                        if (_index >= length - 1) {
                            __log('= 批处理完毕')
                            deferred.resolve()
                        }
                    })
                }
                for (let i in types_by_shiptype) {
                    _db_do(
                        {
                            'id': parseInt(i)
                        },
                        {
                            'equipable': types_by_shiptype[i]
                        },
                        index
                    )
                    index++
                }
            }

            _db_do_all()

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

        // 舰娘 - 改造前后关系
        .then(function () {
            var deferred = Q.defer()
                , mod = {}

            __log('&nbsp;')
            __log('========== 舰娘 - 改造前后关系 ==========')
            __log('= 批处理开始')

            for (let i in _ship_series) {
                let s = _ship_series[i].ships
                    , j = 1
                while (s[j] && s[j].id) {
                    let prev = s[j - 1]

                    if (!mod[s[j].id])
                        mod[s[j].id] = {
                            'remodel': {}
                        }

                    if (prev && prev.id) {
                        if (!mod[prev.id])
                            mod[prev.id] = {
                                'remodel': {}
                            }
                        mod[prev.id].remodel.next = s[j].id
                        mod[prev.id].remodel.next_lvl = prev.next_lvl
                        if (prev.next_loop) {
                            mod[prev.id].remodel.next_loop = true
                            mod[s[j].id].remodel.prev_loop = true
                        }
                    }
                    mod[s[j].id].remodel.prev = prev.id

                    j++
                }
            }

            function _db_do_all() {
                let index = 0
                    , length = mod._size
                function _db_do(find, set_data, _index) {
                    _db.ships.update(find, set_data, {}, function (err, numReplaced) {
                        if (_index >= length - 1) {
                            __log('= 批处理完毕')
                            deferred.resolve()
                        }
                    })
                }
                for (let i in mod) {
                    _db_do(
                        {
                            'id': parseInt(i)
                        },
                        {
                            $set: mod[i],
                            $unset: {
                                'remodel_next': true
                            }
                        },
                        index
                    )
                    index++
                }
            }

            _db_do_all()

            return deferred.promise
        })

        // 人物团体 - 配音&绘制数据
        .then(function () {
            let deferred = Q.defer()
                , byEntity = {}
                , byEntitySeriesCV = {}
                , byEntitySeriesIllustrator = {}

            __log('&nbsp;')
            __log('========== 人物团体 - 配音&绘制数据 ==========')
            __log('= 批处理开始')

            _g.data.ship_id_by_type.forEach(function (thisType) {
                thisType.forEach(function (shipId) {
                    let thisShip = _ship[shipId]
                    if (!thisShip) return
                    let thisSeries = thisShip.series
                    let thisCV = thisShip.getRel('cv')
                    let thisIllustrator = thisShip.getRel('illustrator')

                    if (!byEntitySeriesCV[thisCV])
                        byEntitySeriesCV[thisCV] = []
                    if (!byEntitySeriesIllustrator[thisIllustrator])
                        byEntitySeriesIllustrator[thisIllustrator] = []

                    if ($.inArray(thisSeries, byEntitySeriesCV[thisCV]) < 0)
                        byEntitySeriesCV[thisCV].push(thisSeries || thisShip.getSeriesData())

                    if ($.inArray(thisSeries, byEntitySeriesIllustrator[thisIllustrator]) < 0)
                        byEntitySeriesIllustrator[thisIllustrator].push(thisSeries || thisShip.getSeriesData())
                })
            })

            let parseSeriesData = function (t, data) {
                for (let i in data) {
                    if (i) {
                        if (!byEntity[i])
                            byEntity[i] = {}
                        if (!byEntity[i]['relation'])
                            byEntity[i]['relation'] = {}
                        if (!byEntity[i]['relation'][t])
                            byEntity[i]['relation'][t] = []

                        data[i].forEach(function (thisSeriesId) {
                            let arr = []
                                , ships = typeof thisSeriesId == 'object' ? thisSeriesId : _ship_series[thisSeriesId].ships
                            ships.forEach(function (thisData) {
                                let thisShipId = thisData.id
                                let thisShip = _ship[thisShipId]
                                if (!thisShip) return
                                let thisRel = thisShip.getRel(t)
                                if (thisRel == i)
                                    arr.push(thisShipId)
                            })

                            byEntity[i]['relation'][t].push(arr)
                        })
                    }
                }
            }

            parseSeriesData('cv', byEntitySeriesCV)
            parseSeriesData('illustrator', byEntitySeriesIllustrator)

            console.log(byEntity)

            function _db_do_all() {
                let index = 0
                    , length = byEntity._size
                function _db_do(find, set_data, _index) {
                    _db.entities.update(find, set_data, {}, function (err, numReplaced) {
                        if (_index >= length - 1) {
                            __log('= 批处理完毕')
                            deferred.resolve()
                        }
                    })
                }
                for (let i in byEntity) {
                    _db_do(
                        {
                            'id': parseInt(i)
                        },
                        {
                            $set: byEntity[i],
                            $unset: {
                                'rels': true
                            }
                        },
                        index
                    )
                    index++
                }
            }

            _db_do_all()

            return deferred.promise
        })

        // 装备类型 - 额外装备该类型的舰娘
        .then(function () {
            let deferred = Q.defer()
                , equipable_extra_ship = {}

            __log('&nbsp;')
            __log('========== 装备类型 - 额外装备该类型的舰娘 ==========')
            __log('= 批处理开始')

            for (let i in _ship) {
                let ship = _ship[i]
                    , ship_id = i
                    , additional_item_types = ship.additional_item_types || []
                additional_item_types.forEach(function (type_id) {
                    if (!equipable_extra_ship[type_id])
                        equipable_extra_ship[type_id] = []
                    equipable_extra_ship[type_id].push(parseInt(ship_id))
                })
            }

            console.log(equipable_extra_ship)

            function _db_do_all() {
                let index = 0
                    , length = equipable_extra_ship._size
                function _db_do(find, set_data, _index) {
                    _db.item_types.update(find, set_data, {}, function (err, numReplaced) {
                        if (_index >= length - 1) {
                            __log('= 批处理完毕')
                            deferred.resolve()
                        }
                    })
                }
                for (let i in equipable_extra_ship) {
                    let unset = {}
                    if (!equipable_extra_ship[i].length) {
                        unset.equipable_extra_ship = true
                    }
                    _db_do(
                        {
                            'id': parseInt(i)
                        },
                        {
                            $set: {
                                'equipable_extra_ship': equipable_extra_ship[i]
                            },
                            $unset: unset
                        },
                        index
                    )
                    index++
                }
            }

            _db_do_all()

            return deferred.promise
        })

        // 舰种 - 添加隐藏标记
        .then(function () {
            let deferred = Q.defer()
                , countByType = {}

            __log('&nbsp;')
            __log('========== 舰种 - 添加隐藏标记 ==========')
            __log('= 批处理开始')

            _db.ship_types.find({}, function (err, docs) {
                for (var i in docs) {
                    countByType[docs[i]['id']] = 0
                }

                for (let i in _ship) {
                    let ship = _ship[i]
                        , ship_type = ship.type

                    if (!countByType[ship_type])
                        countByType[ship_type] = 0

                    countByType[ship_type]++
                }

                //console.log( countByType )

                function _db_do_all() {
                    let index = 0
                        , length = countByType._size
                    function _db_do(find, set_data, _index) {
                        _db.ship_types.update(find, set_data, {}, function (err, numReplaced) {
                            if (_index >= length - 1) {
                                __log('= 批处理完毕')
                                deferred.resolve()
                            }
                        })
                    }
                    for (let i in countByType) {
                        let unset = {}
                            , set = {}
                        if (countByType[i]) {
                            unset.hide = true
                        } else {
                            set = {
                                'hide': true
                            }
                        }
                        _db_do(
                            {
                                'id': parseInt(i)
                            },
                            {
                                $set: set,
                                $unset: unset
                            },
                            index
                        )
                        index++
                    }
                }

                _db_do_all()
            })

            return deferred.promise
        })

        // 装备 - 数据清理
        .then(function () {
            var deferred = Q.defer()
                , update = {}
                , length = 0
                , keys = [
                    'default_equipped_on',
                    'improvement',
                    'upgrade_to',
                    'upgrade_from',
                    'upgrade_for'
                ]

            __log('&nbsp;')
            __log('========== 装备 - 数据清理 ==========')
            __log('= 批处理开始')

            _db.items.find({}, function (err, docs) {
                for (var i in docs) {
                    var d = docs[i]

                    keys.forEach(function (key) {
                        if (typeof d[key] != 'undefined' && (!d[key] || d[key].length === 0)) {
                            if (!update[d['_id']]) {
                                update[d['_id']] = {
                                    $unset: {}
                                };
                                length++;
                            }

                            update[d['_id']].$unset[key] = true
                        }
                    })
                }
                console.log(update)
                _db_do_all()
            })
            function _db_do_all() {
                function _db_do(_id, $update, _index) {
                    _db.items.update({
                        '_id': _id
                    }, $update, {}, function (err, numReplaced) {
                        console.log(_index, length)
                        if (_index >= length - 1) {
                            __log('= 批处理完毕')
                            deferred.resolve()
                        }
                    })
                }
                var index = 0
                for (var i in update) {
                    _db_do(
                        i,
                        update[i],
                        index
                    )
                    index++
                }
            }
            return deferred.promise
        })

        // persistence.compactDatafile()
        .then(() => {
            const deferred = Q.defer()

            _db.ships.persistence.compactDatafile()
            _db.ship_types.persistence.compactDatafile()

            _db.items.persistence.compactDatafile()
            _db.item_types.persistence.compactDatafile()

            _db.entities.persistence.compactDatafile()

            _db.arsenal_all.persistence.compactDatafile()
            _db.arsenal_weekday.persistence.compactDatafile()

            setTimeout(() => {
                deferred.resolve()
            }, 5000)

            return deferred.promise
        })

        // 复制所有数据文件
        .then(function () {
            var deferred = Q.defer()
                , count = 0
                , dest_db = node.path.join(dest, 'app-db')

            __log('&nbsp;')
            __log('========== 复制数据库JSON ==========')

            // 建立目标目录
            node.mkdirp.sync(dest_db)

            function copyFile(source, target, callback) {
                var cbCalled = false;

                var rd = node.fs.createReadStream(source);
                rd.on("error", function (err) {
                    done(err);
                });

                var wr = node.fs.createWriteStream(target);
                wr.on("error", function (err) {
                    done(err);
                });
                wr.on("close", function (ex) {
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
            function copyFile_callback(err, source, target) {
                count++
                if (!err) {
                    __log('= 数据库JSON已复制到 ' + target)
                } else {
                    console.log(err)
                }
                if (count >= files.length) {
                    __log('= 全部数据库JSON已复制')
                    deferred.resolve()
                }
            }

            // 压缩 (Compacting) 全部数据库
            for (var i in _db) {
                _db[i].persistence.compactDatafile()
            }

            for (var i in files) {
                copyFile(
                    './data/' + files[i],
                    dest_db + '/' + files[i],
                    copyFile_callback
                )
            }
            return deferred.promise
        })

        // 输出页面: ships.html
        .then(function () {
            return _frame.app_main.page['init'].exportdata_cache_ships(dest, _ship)
        })

        // 输出页面: equipments.html
        .then(function () {
            return _frame.app_main.page['init'].exportdata_cache_equipments(dest, _item)
        })

        // 输出页面: entities.html
        //.then(function(){
        //	return _frame.app_main.page['init'].exportdata_cache_entities( dest, _item )
        //})

        // 错误处理
        .catch(function (err) {
            __log(err)
            __log('输出数据失败')
        })
        .done(function () {
            __log('&nbsp;')
            __log('==========')
            __log('输出数据初始过程结束')
        })
}
















_frame.app_main.page['init'].init = function (page) {
    var _log = function (data) {
        $('<p/>').html(data).prependTo(logs)
    }
    __log = function (data) {
        console.log(data)
        $('<p/>').html(data).prependTo(logs)
    }

    var logs = $('<div class="logs">').appendTo(page)

    // 获取舰娘&装备数据
    page.find('form#init_all_data').on('submit', function (e) {
        var form = $(this)
        e.preventDefault()
        form.addClass('submitting')
        form.find('[type="submit"]').on('click', function (e) {
            e.preventDefault()
        })

        _frame.app_main.page['init'].fetch_ships()
    })

    // 处理图鉴文件
    page.find('form#init_illustrations').on('submit', function (e) {
        var form = $(this)
        e.preventDefault()
        form.addClass('submitting')
        form.find('[type="submit"]').on('click', function (e) {
            e.preventDefault()
        })

        _frame.app_main.page['init'].init_illustrations()
    })

    // 导出数据
    page.find('form#init_exportdata').each(function () {
        var form = $(this)
            , folder_input = form.find('[name="destfolder"]')
            , btn_browse = form.find('[value="Browse..."]')
            , file_selector = form.find('[type="file"]')

        form.on('submit', function (e) {
            e.preventDefault()
            form.addClass('submitting')
            form.find('[type="submit"]').on('click', function (e) {
                e.preventDefault()
            })
            _frame.app_main.page['init'].exportdata(form)
        })

        folder_input
            .val(_config.get('data_export_to'))
            .on({
                'change': function () {
                    _config.set('data_export_to', $(this).val())
                },
                'click': function () {
                    btn_browse.trigger('click')
                }
            })

        btn_browse
            .on('click', function () {
                //console.log(123)
                //form.find('[type="file"]').trigger('click')
            })

        file_selector
            .on('change', function () {
                folder_input.val($(this).val()).trigger('change')
            })
    })

    // 导出图片
    _frame.app_main.page['init'].exportpicInit(page.find('form#init_exportpic'))

    // 获取官方数据
    page.find('form#fetch_official').on('submit', function (e) {
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

        var ip = form.find('[name="server_ip"]').val()
            , api_token = form.find('[name="api_token"]').val()
            , enable_proxy = form.find('[name="enable_proxy"]').prop('checked')
            , url = node.url.parse('http://' + ip + '/kcsapi/api_start2')

            , promise_chain = Q.fcall(function () { })

        // 开始异步函数链
        promise_chain

            // API: api_start2
            .then(function () {
                // const apiPath = 'http://' + ip + '/kcsapi/api_start2'
                const apiPath = `http://${ip}/kcsapi/api_start2/getData` // KC2
                // const referer = 'http://' + ip + '/kcs/mainD2.swf?api_token=' + api_token + '&api_starttime=' + _g.timeNow() + '/[[DYNAMIC]]/1'
                const referer = `http://${ip}/kcs2/index.php?api_root=/kcsapi&voice_root=/kcs/sound&osapi_root=osapi.dmm.com&version=4.0.0.2&api_token=${api_token}&api_starttime=${Date.now()}` // KC2
                var api = node.url.parse(apiPath)
                    , deferred = Q.defer()
                __log('API (api_start2) requesting...')

                request({
                    'uri': api,
                    'method': 'POST',
                    'headers': {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Pragma': 'no-cache',
                        'Referer': referer,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
                        'X-Requested-With': 'ShockwaveFlash/17.0.0.169'
                    },
                    'formData': {
                        'api_token': api_token,
                        'api_verno': 1
                    },
                    'proxy': enable_proxy ? proxy : null
                }, function (err, response, body) {
                    if (err || response.statusCode != 200) {
                        console.log(err, response)
                        deferred.reject(new Error(err))
                    }
                    if (!err && response.statusCode == 200) {
                        console.log(body)
                        let svdata
                        eval(body)
                        console.log(svdata)
                        if (svdata.api_result == 1) {
                            jf.writeFile(
                                node.path.normalize(_g.root + '/fetched_data/api_start2.json'),
                                svdata,
                                function (err) {
                                    if (err) {
                                        deferred.reject(new Error(err))
                                    } else {
                                        deferred.resolve()
                                    }
                                })
                        } else {
                            console.log(svdata)
                            deferred.reject(new Error(err))
                        }
                    }
                })
            })
            .catch(function (err) {
                __log(err)
            })
            .done(function () {
                __log('已获取，数据已保存到文件 /fetched_data/api_start2.json')
            })
    })
}

/*
 */
_p.el.tablelist = {
	init_el: function(el){
		if( el.data('tablelist') )
			return true

		if( el.hasClass('ships') )
			el.data({
				'tablelist': new TablelistShips_v2( el )
			})
		else if( el.hasClass('equipments') )
			el.data({
				'tablelist': new TablelistEquipments( el )
			})
		else if( el.hasClass('fleets') )
			el.data({
				'tablelist': new TablelistFleets( el )
			})
		/*
		else
			el.data({
				'tablelist': new _tablelist( el )
			})*/
	},

	init: function(tar, els){
		tar = tar || $body;
		els = els || tar.find('.tablelist')

		els.each(function(){
			_p.el.tablelist.init_el($(this))
		})
	}
}





class Tablelist{
	constructor( container, options ){
		this.dom = {
			'container': container
		}
		
		options = options || {}
		
		this.trIndex = 0
		this.flexgrid_empty_count = options.flexgrid_empty_count || 8
		this.sort_data_by_stat = options.sort_data_by_stat || {}
		this.sort_default_order_by_stat = options.sort_default_order_by_stat || {}
		/*
		if( this.is_init )
			return true
	
		if( this['_' + this.listtype + '_init'] )
			this['_' + this.listtype + '_init']()
	
		this.is_init = true
		*/
	}

	// 添加选项
		append_option( type, name, label, value, suffix, options ){
			options = options || {}
			function gen_input(){
				let input
					,option_empty
					,o_el
					,id = Tablelist.genId()
				//_g.inputIndex++
				switch( type ){
					case 'text':
					case 'number':
					case 'hidden':
						input = $('<input type="'+type+'" name="'+name+'" id="'+id+'" />').val(value)
						break;
					case 'select':
						input = $('<select name="'+name+'" id="'+id+'" />')
						option_empty = $('<option value=""/>').html('').appendTo( input )
						value.forEach(function(currentValue, i){
							if( typeof currentValue == 'object' ){
								o_el = $('<option value="' + (typeof currentValue.val == 'undefined' ? currentValue['value'] : currentValue.val) + '"/>')
									.html(currentValue['title'] || currentValue['name'])
									.appendTo( input )
							}else{
								o_el = $('<option value="' + currentValue + '"/>')
									.html(currentValue)
									.appendTo( input )
							}
							if( typeof options['default'] != 'undefined' && o_el.val() == options['default'] ){
								o_el.prop('selected', true)
							}
						})
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
						input = $('<input type="'+type+'" name="'+name+'" id="'+id+'" />').prop('checked', value)
						break;
					case 'radio':
						input = $();
						value.forEach(function(currentValue, i){
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
						})
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
		
			let line = $('<p/>').addClass(name).appendTo( this.dom.filters )
				,input = gen_input().appendTo(line)
				,id = input.attr('id') || Tablelist.genId()
		
			label = label ? $('<label'+(type == 'checkbox'? ' class="checkbox"' : '')+' for="'+id+'"/>')
								.html( label )
								.appendTo(line)
						: null
		
			if( type == 'checkbox' && label )
				label.insertAfter(input)
		
			if( suffix )
				$('<label for="'+id+'"/>').html(suffix).appendTo(line)
		
			//_g.inputIndex++
			return line
		}

		// 强制 thead 重绘，以解决某些CSS计算延迟问题
			thead_redraw( timeout_duration ){
				if( this.dom.thead && this.dom.thead.length ){
					var thead = this.dom.thead
					setTimeout(function(){
						thead.hide().show(0)
					}, timeout_duration || 10)
				}
			}

		// 表格排序相关
			// 排序表格中正在显示行中某一列(td:nth-of-type)
			// 返回一个Array，每一个元素为jQuery DOM Object
			// is_ascending 	是否为升序，默认降序
			// rows				目标行，默认为全部可见行
				sort_column( nth, is_ascending, rows ){
					if( !rows ){
						let tbody = this.dom.tbody
						if( !tbody || !tbody.length )
							tbody = this.dom.table.find('tbody')
						rows = tbody.find('tr.row:visible').not('[data-donotcompare]')
					}
					nth = nth || 1
		
					// 建立临时用对象，在函数结束时delete
						this._tmp_values = []
						this._tmp_value_map_cell = {}
		
					// 遍历，将值全部导出到 _tmp_values，_tmp_value_map_cell 中记录 值 -> jQuery DOM
						rows.find('td:nth-of-type(' + nth + ')').each(function(index, element){
							let cell = $(element)
								,val = cell.data('value')
		
							val = parseFloat(val)
		
							if( $.inArray( val, this._tmp_values ) < 0 )
								this._tmp_values.push( val )
		
							if( !this._tmp_value_map_cell[val] )
								this._tmp_value_map_cell[val] = $()
		
							this._tmp_value_map_cell[val] = this._tmp_value_map_cell[val].add( cell )
						}.bind(this))
		
					// 排序
						this._tmp_values.sort(function(a, b){
							if( is_ascending )
								return a-b
							else
								return b-a
						})
		
					// 根据排序结果，整理返回结果
						let return_array = []
						this._tmp_values.forEach(function(currentValue){
							return_array.push( this._tmp_value_map_cell[currentValue] )
						}, this)
		
					// delete 临时对象
						delete this._tmp_values
						delete this._tmp_value_map_cell
		
					return return_array
				}

			// 标记表格全部数据列中第一和第二高值的单元格
				mark_high( cacheSortData ){
					let tbody = this.dom.tbody
		
					if( !tbody || !tbody.length )
						tbody = this.dom.table.find('tbody')
		
					let rows = tbody.find('tr.row:visible').not('[data-donotcompare]')
						,sort_data_by_stat = this.sort_data_by_stat
		
					rows.find('td[data-value]').removeClass('sort-first sort-second')
		
					rows.eq(0).find('td[data-value]').each(function(index, element){
						let is_ascending = false
							,$this = $(element)
							,stat = $this.data('stat')
		
						// 以下属性不进行标记，但仍计算排序
							,noMark = stat.match(/\b(speed|range)\b/ )
		
						if( typeof this.sort_default_order_by_stat[stat] == 'undefined' ){
							// 以下属性为升序
								if( stat.match(/\b(consum_fuel|consum_ammo)\b/ ) )
									is_ascending = true
							this.sort_default_order_by_stat[stat] = is_ascending ? 'asc' : 'desc'
						}else{
							is_ascending = this.sort_default_order_by_stat[stat] == 'asc' ? true : false
						}
		
						let sort = this.sort_column( index+1, is_ascending, rows )
							,max = Math.min( 6, Math.ceil(rows.length / 2) + 1 )
		
						if( !noMark && sort.length > 1 && sort[0].length < max ){
							sort[0].addClass('sort-first')
							if( sort.length > 2 && sort[1].length < max )
								sort[1].addClass('sort-second')
						}
						
						//console.log(is_ascending, sort)
		
						// 将排序结果存储到表头对应的列中
							if( cacheSortData )
								sort_data_by_stat[stat] = sort
							else
								delete( sort_data_by_stat[stat] )
		
					}.bind(this))
		
					return rows
				}

			// thead td, thead th
			// 点击表头单元格，表格排序
				sort_table_from_theadcell( cell ){
					if( !cell )
						return
					
					let stat = cell.data('stat')
						,sortData = this.sort_data_by_stat[stat]
						
					if( !stat || !sortData )
						return false
		
					if( stat != this.lastSortedStat ){
						if( this.lastSortedHeader )
							this.lastSortedHeader.removeClass('sorting desc asc')
						cell.addClass('sorting')
					}
		
					let order = (stat == this.lastSortedStat && this.lastSortedOrder == 'obverse')
									? 'reverse'
									: 'obverse'
						,i = order == 'reverse' ? sortData.length - 1 : 0
		
					if( this.sort_default_order_by_stat[stat] ){
						let reverse = this.sort_default_order_by_stat[stat] == 'asc' ? 'desc' : 'asc'
						if( order == 'obverse' ){
							cell.removeClass(reverse).addClass(this.sort_default_order_by_stat[stat])
						}else{
							cell.removeClass(this.sort_default_order_by_stat[stat]).addClass(reverse)
						}
					}
		
					this.sortedRow = $()
		
					while( sortData[i] ){
						this._tmpDOM = sortData[i].parent()
						this.sortedRow = this.sortedRow.add( this._tmpDOM )
						this._tmpDOM.appendTo( this.dom.tbody )
						i = order == 'reverse' ? i - 1 : i + 1
					}
		
					// 修改排序提示按钮
						this.dom.btn_compare_sort.removeClass('disabled').html('取消排序')
		
					this.lastSortedStat = stat
					this.lastSortedOrder = order
					this.lastSortedHeader = cell
					delete this._tmpDOM
				}

			// 重置表格排序
				sort_table_restore(){
					if( !this.sortedRow )
						return true
		
					// 还原所有DOM位置
						let parent, arr = []
						this.sortedRow.each(function(index, element){
							var $this = $(element)
								,trIndex = parseInt( $this.data('trindex') )
							parent = parent || $this.parent()
							arr.push({
								'index': 	trIndex,
								'el': 		$this,
								'prev': 	parent.children('tr[data-trindex="' + (trIndex - 1) + '"]')
							})
						})
						// 如果在上一步直接将DOM移动到上一个index行的后方，可能会因为目标DOM也为排序目标同时在当前DOM顺序后，造成结果不正常
						// 故需要两步操作
						arr.sort(function(a, b){
							return a['index']-b['index']
						})
						arr.forEach(function(currentValue){
							currentValue.el.insertAfter( currentValue.prev )
						})
		
					// 修改排序提示按钮
						this.dom.btn_compare_sort.addClass('disabled').html('点击表格标题可排序')
		
					// 重置其他样式
						this.lastSortedHeader.removeClass('sorting desc asc')
		
					delete this.sortedRow
					delete this.lastSortedStat
					delete this.lastSortedOrder
					delete this.lastSortedHeader
					return true
				}
}
Tablelist.index = 0
Tablelist.genId = function(text){
	var hash = 0
		, i
		, chr
		, len
	text = text || ((new Date()).toISOString() + _g.randInt(10000));
	if (text.length == 0) return hash;
	for (i = 0, len = text.length; i < len; i++) {
		chr   = text.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return 'tablelist'+hash;
}
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
_frame.app_main.page['init'].exportdata_cache_equipments = function( dest, _item ){
	let deferred = Q.defer()
		,dest_path = node.path.join(dest, 'app/page')

	__log( '&nbsp;' )
	__log('========== 输出页面: equipments.html ==========')

	// 确保目标目录
		node.mkdirp.sync( dest_path )
	
	// 
		let container = $('<div class="tablelist tablelist-equipments"/>')
			,data = new TablelistEquipments_v2( container )

	// 写入文件
		let interval = setInterval(function(){
			if( data.generated ){
				clearInterval(interval)
				interval = null
				node.fs.writeFile(node.path.join(dest_path, 'equipments.html')
					, container[0].outerHTML
					, function(err) {
						if(err) {
							console.log(err);
						} else {
							__log('= equipments.html 已输出')
						}
						deferred.resolve()
					})
			}
		},10)

	return deferred.promise
}









class TablelistEquipments_v2 extends Tablelist{
	constructor( container, options ){
		super( container, options )

		this.columns = [
			'  ',
			['火力',	'fire'],
			['雷装',	'torpedo'],
			['对空',	'aa'],
			['对潜',	'asw'],
			['爆装',	'bomb'],
			['命中',	'hit'],
			['装甲',	'armor'],
			['回避',	'evasion'],
			['索敌',	'los'],
			['射程',	'range'],
			['航程',	'distance'],
			['可开发','craftable'],
			['可改修','improvable']
		]

		// 标记全局载入状态
			_frame.app_main.loading.push('tablelist_'+this._index)
			_frame.app_main.is_loaded = false
	
		// 生成过滤器与选项
			this.dom.filter_container = $('<div class="options"/>').appendTo( this.dom.container )
			this.dom.filters = $('<div class="filters"/>').appendTo( this.dom.filter_container )
	
		// 装备大类切换
			var checked = false
			this.dom.type_radios = {}
			for(var i in _g.data.item_type_collections){
				//var radio_id = '_input_g' + parseInt(_g.inputIndex)
				let radio_id = Tablelist.genId()
				this.dom.type_radios[i] = $('<input type="radio" name="equipmentcollection" id="'+radio_id+'" value="'+i+'"/>')
					.prop('checked', !checked )
					.on('change', function(){
						// force thead redraw
						this.dom.table_container_inner.scrollTop(0)
						this.thead_redraw()
					}.bind(this))
					.prependTo( this.dom.container )
				$('<label class="tab container" for="'+radio_id+'" data-equipmentcollection="'+i+'"/>')
					.html(
						'<i></i>'
						+ '<span>' + _g.data.item_type_collections[i]['name']['zh_cn'].replace(/\&/g, '<br/>') + '</span>'
					)
					.appendTo( this.dom.filters )
				checked = true
				//_g.inputIndex++
			}
		
		// 装备类型过滤
			this.dom.filter_types = $('<input name="types" type="hidden"/>').prependTo( this.dom.container )
	
		// 生成表格框架
			this.dom.table_container = $('<div class="tablelist-container" />').appendTo( this.dom.container )
			//this.dom.thead = $('<div class="wrapper"/>').appendTo($('<div class="tablelist-header"/>').appendTo( this.dom.table_container ))
			this.dom.thead = $('<dl/>').appendTo($('<div class="tablelist-header"/>').appendTo( this.dom.table_container ))
			this.dom.tbody = $('<div class="tablelist-body" scrollbody/>').appendTo( this.dom.table_container )
								.on('contextmenu.contextmenu_ship', '[data-shipid]', function(e){
										this.contextmenu_show($(e.currentTarget))
									}.bind(this))
								.on('click.contextmenu_ship', '[data-shipid]>strong>em', function(e){
										this.contextmenu_show($(e.currentTarget).parent().parent())
										e.stopImmediatePropagation()
										e.stopPropagation()
									}.bind(this))
			
			this.columns.forEach(function(v, i){
				if( typeof v == 'object' ){
					var td = $('<dd stat="' + v[1] + '"/>')
								.html(v[0])
								//.on('click', function(){
								//	this.sort_table_from_theadcell(td)
								//}.bind(this))
								.appendTo(this.dom.thead)
				}else{
					$('<dt/>').html(v[0]).appendTo(this.dom.thead)
				}
			}.bind(this))
	
		// 生成装备数据DOM
			this.append_all_items()
	
		// 生成底部内容框架
			this.dom.msg_container = $('<div class="msgs"/>').appendTo( this.dom.container )
			if( !_config.get( 'hide-equipmentsinfos' ) )
				this.dom.msg_container.attr( 'data-msgs', 'equipmentsinfos' )
	
		// 生成部分底部内容
			var equipmentsinfos = $('<div class="equipmentsinfos"/>').html('点击装备查询初装舰娘等信息').appendTo( this.dom.msg_container )
				$('<button/>').html('&times;').on('click', function(){
					this.dom.msg_container.removeAttr('data-msgs')
					_config.set( 'hide-equipmentsinfos', true )
				}.bind(this)).appendTo( equipmentsinfos )
	}

	append_item( equipment_data, collection_id ){
		let tr = $('<dl/>',{
						//'class':			'row',
						'data-equipmentid':	equipment_data['id'],
						'data-equipmentcollection':	collection_id,
						'data-infos': 		'[[EQUIPMENT::'+ equipment_data['id'] +']]',
						//'data-equipmentedit':this.dom.container.hasClass('equipmentlist-edit') ? 'true' : null,
						'data-equipmenttype':equipment_data.type
					})
					.on('click', function(e, forceInfos){
						if( !forceInfos && _frame.app_main.is_mode_selection() ){
							e.preventDefault()
							e.stopImmediatePropagation()
							e.stopPropagation()
							
							if( $.inArray(equipment_data.type, TablelistEquipments.types) > -1 )
								_frame.app_main.mode_selection_callback(equipment_data['id'])
						}
					})
					.appendTo( this.dom.tbody )
	
		function _val( val, show_zero ){
			if( !show_zero && (val == 0 || val === '0' || val === '') )
				//return '<small class="zero">-</small>'
				return '-'
			//if( val > 0 )
			//	return '+' + val
			return val
		}
	
		this.columns.forEach(function(currentValue){
			switch( currentValue[1] ){
				case ' ':
					$('<dt/>').html(
						'<a href="?infos=equipment&id='+ equipment_data.id + '">'
						+ equipment_data.getName()
						+ '</a>'
					).appendTo(tr)
					break;
				case 'range':
					$('<dd stat="range" value="' + (equipment_data['stat']['range'] || '0') + '"/>')
						.html(
							equipment_data['stat']['range']
								? _g.getStatRange( equipment_data['stat']['range'] )
								: '<small class="zero">-</small>'
						)
						.appendTo(tr)
					break;
				case 'craftable':
					$('<dd stat="craftable" value="' + (equipment_data['craftable'] ? '1' : '0') + '"/>')
						.html(
							equipment_data['craftable']
								? '✓'
								: '<small class="zero">-</small>'
						)
						.appendTo(tr)
					break;
				case 'improvable':
					$('<dd stat="improvable" value="' + (equipment_data['improvable'] ? '1' : '0') + '"/>')
						.html(
							equipment_data['improvable']
								? '✓'
								: '<small class="zero">-</small>'
						)
						.appendTo(tr)
					break;
				default:
					var value = equipment_data['stat'][currentValue[1]]
					$('<dd stat="'+currentValue[1]+'" value="' + (value || '0') + '"/>')
						.addClass( value < 0 ? 'negative' : '' )
						.html( _val( value ) )
						.appendTo(tr)
					break;
			}
		})
	
		return tr
	}

	append_all_items(){
		this.generated = false
		this.dom.types = []
		function _do( i, j ){
			if( _g.data.item_id_by_type[i] ){
				if( !j ){
					var data_equipmenttype = _g.data.item_types[ _g.item_type_order[i] ]
					this.dom.types.push(
						//$('<p class="title" data-equipmentcollection="'+_g.data.item_id_by_type[i]['collection']+'" data-type="'+data_equipmenttype.id+'">'
						$('<h4 data-equipmentcollection="'+_g.data.item_id_by_type[i]['collection']+'" data-type="'+data_equipmenttype.id+'">'
								//+ '<strong colspan="' + (this.columns.length + 1) + '">'
									//+ '<span style="background-image: url(../app/assets/images/itemicon/'+data_equipmenttype['icon']+'.png)"></span>'
									+ '<span class="equiptypeicon mod-'+data_equipmenttype['icon']+'"></span>'
									+ data_equipmenttype['name']['zh_cn']
									+ TablelistEquipments.gen_helper_equipable_on( data_equipmenttype['id'] )
								//+ '</th></tr>'
							).appendTo( this.dom.tbody )
					)
				}
	
				this.append_item(
					_g.data.items[ _g.data.item_id_by_type[i]['equipments'][j] ],
					_g.data.item_id_by_type[i]['collection']
				)
	
				setTimeout(function(){
					if( j >= _g.data.item_id_by_type[i]['equipments'].length - 1 ){
						_do( i+1, 0 )
					}else{
						_do( i, j+1 )
					}
				}, 0)
			}else{
				//this.mark_high()
				// force thead redraw
					this.thead_redraw()
					this.generated = true
					this.apply_types_check()
				_frame.app_main.loaded('tablelist_'+this._index, true)
			}
		}
		_do = _do.bind(this)
		_do( 0, 0 )
	}

	apply_types(){
		console.log('types: ' + TablelistEquipments.types)
		this.dom.filter_types.removeAttr('class')
		
		if( TablelistEquipments.types.length ){
			this.dom.filter_types.addClass('type' + TablelistEquipments.types.join(' type'))
			if( this.generated )
				this.apply_types_check()
		}
	}

	apply_types_check(){
		if( TablelistEquipments.shipIdLast && TablelistEquipments.shipIdLast == TablelistEquipments.shipId )
			return
		
		TablelistEquipments.shipIdLast = TablelistEquipments.shipId
		
		// 航母：直接进入飞行器页
		if( TablelistEquipments.shipId
			&& $.inArray(_g.data.ships[TablelistEquipments.shipId].type, [9, 10, 11] ) > -1
		){
			let k = 0
				,el
	
			while( this.dom.types[k++].attr('data-equipmentcollection') != 3
				|| $.inArray((parseInt(this.dom.types[k].attr('data-type')) || null), TablelistEquipments.types) <= -1 ){
				el = this.dom.types[k+1]
			}
			
			el = el || this.dom.types[0]
			
			this.dom.type_radios[3].prop('checked', true).trigger('change')
			this.dom.table_container_inner.scrollTop(el[0].offsetTop || 0)
			return
		}
		
		if( TablelistEquipments.types.length ){
			let k = 0
				,el
	
			while( $.inArray((parseInt(this.dom.types[k++].attr('data-type')) || null), TablelistEquipments.types) <= -1 ){
				el = this.dom.types[k]
			}
			
			el = el || this.dom.types[0]
			
			this.dom.type_radios[parseInt(el.attr('data-equipmentcollection')) || 1].prop('checked', true).trigger('change')
			this.dom.table_container_inner.scrollTop(el[0].offsetTop || 0)
		}
	}
}

TablelistEquipments_v2.gen_helper_equipable_on = function( type_id ){
	return `<em class="helper" data-tip="[[EQUIPABLE::${type_id}]]">?</em>`
	/*
	var equipable_on = ''
	_g.data.item_types[type_id]['equipable_on_type'].forEach(function(currentValue, i){
		var item_type_id = _g.data.item_types[type_id]['equipable_on_type'][i]
		equipable_on+= '<span>'
							+ _g['data']['ship_types'][item_type_id].name.zh_cn
							+ ( i < _g.data.item_types[type_id]['equipable_on_type'].length-1 ? ',&nbsp;' : '' )
						+ '</span>'
	})
	return '<em class="helper" data-tip="<h4 class=item_equipable_on>可装备于</h4>' + equipable_on + '">?</em>'
	*/
}

TablelistEquipments_v2.types = []
TablelistEquipments_v2.shipId = null
TablelistEquipments_v2.shipIdLast = null









class TablelistEquipments extends Tablelist{
	constructor( container, options ){
		super( container, options )

		this.columns = [
			'  ',
			['火力',	'fire'],
			['雷装',	'torpedo'],
			['对空',	'aa'],
			['对潜',	'asw'],
			['爆装',	'bomb'],
			['命中',	'hit'],
			['装甲',	'armor'],
			['回避',	'evasion'],
			['索敌',	'los'],
			['射程',	'range'],
			['可改修','improvable']
		]

		// 标记全局载入状态
			_frame.app_main.loading.push('tablelist_'+this._index)
			_frame.app_main.is_loaded = false
	
		// 生成过滤器与选项
			this.dom.filter_container = $('<div class="options"/>').appendTo( this.dom.container )
			this.dom.filters = $('<div class="filters"/>').appendTo( this.dom.filter_container )
	
		// 装备大类切换
			var checked = false
			this.dom.type_radios = {}
			for(var i in _g.data.item_type_collections){
				//var radio_id = '_input_g' + parseInt(_g.inputIndex)
				let radio_id = Tablelist.genId()
				this.dom.type_radios[i] = $('<input type="radio" name="equipmentcollection" id="'+radio_id+'" value="'+i+'"/>')
					.prop('checked', !checked )
					.on('change', function(){
						// force thead redraw
						this.dom.table_container_inner.scrollTop(0)
						this.thead_redraw()
					}.bind(this))
					.prependTo( this.dom.container )
				$('<label class="tab container" for="'+radio_id+'" data-equipmentcollection="'+i+'"/>')
					.html(
						'<i></i>'
						+ '<span>' + _g.data.item_type_collections[i]['name']['zh_cn'].replace(/\&/g, '<br/>') + '</span>'
					)
					.appendTo( this.dom.filters )
				checked = true
				//_g.inputIndex++
			}
		
		// 装备类型过滤
			this.dom.filter_types = $('<input name="types" type="hidden"/>').prependTo( this.dom.container )
	
		// 生成表格框架
			this.dom.table_container = $('<div class="fixed-table-container"/>').appendTo( this.dom.container )
			this.dom.table_container_inner = $('<div class="fixed-table-container-inner"/>').appendTo( this.dom.table_container )
			this.dom.table = $('<table class="equipments hashover hashover-column"/>').appendTo( this.dom.table_container_inner )
			function gen_thead(arr){
				this.dom.thead = $('<thead/>')
				var tr = $('<tr/>').appendTo(this.dom.thead)
				arr.forEach(function(currentValue){
					if( typeof currentValue == 'object' ){
						$('<td data-stat="' + currentValue[1] + '"/>')
							.html('<div class="th-inner-wrapper"><span><span>'+currentValue[0]+'</span></span></div>').appendTo(tr)
					}else{
						$('<th/>').html('<div class="th-inner-wrapper"><span><span>'+currentValue[0]+'</span></span></div>').appendTo(tr)
					}
				})
				return this.dom.thead
			}
			gen_thead = gen_thead.bind(this)
			gen_thead( this.columns ).appendTo( this.dom.table )
			this.dom.tbody = $('<tbody/>').appendTo( this.dom.table )
	
		// 生成装备数据DOM
			this.append_all_items()
	
		// 生成底部内容框架
			this.dom.msg_container = $('<div class="msgs"/>').appendTo( this.dom.container )
			if( !_config.get( 'hide-equipmentsinfos' ) )
				this.dom.msg_container.attr( 'data-msgs', 'equipmentsinfos' )
	
		// 生成部分底部内容
			var equipmentsinfos = $('<div class="equipmentsinfos"/>').html('点击装备查询初装舰娘等信息').appendTo( this.dom.msg_container )
				$('<button/>').html('&times;').on('click', function(){
					this.dom.msg_container.removeAttr('data-msgs')
					_config.set( 'hide-equipmentsinfos', true )
				}.bind(this)).appendTo( equipmentsinfos )
	}

	append_item( equipment_data, collection_id ){
		let tr = $('<tr/>',{
						'class':			'row',
						'data-equipmentid':	equipment_data['id'],
						'data-equipmentcollection':	collection_id,
						'data-infos': 		'[[EQUIPMENT::'+ equipment_data['id'] +']]',
						'data-equipmentedit':this.dom.container.hasClass('equipmentlist-edit') ? 'true' : null,
						'data-equipmenttype':equipment_data.type
					})
					.on('click', function(e, forceInfos){
						if( !forceInfos && _frame.app_main.is_mode_selection() ){
							e.preventDefault()
							e.stopImmediatePropagation()
							e.stopPropagation()
							
							if( $.inArray(equipment_data.type, TablelistEquipments.types) > -1 )
								_frame.app_main.mode_selection_callback(equipment_data['id'])
						}
					})
					.appendTo( this.dom.tbody )
	
		function _val( val, show_zero ){
			if( !show_zero && (val == 0 || val === '0' || val === '') )
				//return '<small class="zero">-</small>'
				return '-'
			//if( val > 0 )
			//	return '+' + val
			return val
		}
	
		this.columns.forEach(function(currentValue){
			switch( currentValue[1] ){
				case ' ':
					$('<th/>').html(
						'<a href="?infos=equipment&id='+ equipment_data.id + '">'
						+ equipment_data.getName()
						+ '</a>'
					).appendTo(tr)
					break;
				case 'range':
					$('<td data-stat="range" data-value="' + equipment_data['stat']['range'] + '"/>')
						.html(
							equipment_data['stat']['range']
								? _g.getStatRange( equipment_data['stat']['range'] )
								: '<small class="zero">-</small>'
						)
						.appendTo(tr)
					break;
				case 'improvable':
					$('<td data-stat="range" data-value="' + (equipment_data['improvable'] ? '1' : '0') + '"/>')
						.html(
							equipment_data['improvable']
								? '✓'
								: '<small class="zero">-</small>'
						)
						.appendTo(tr)
					break;
				default:
					$('<td data-stat="'+currentValue[1]+'" data-value="' + (equipment_data['stat'][currentValue[1]] || 0) + '"/>')
						.addClass( equipment_data['stat'][currentValue[1]] < 0 ? 'negative' : '' )
						.html( _val( equipment_data['stat'][currentValue[1]] ) )
						.appendTo(tr)
					break;
			}
		})
	
		return tr
	}

	append_all_items(){
		this.generated = false
		this.dom.types = []
		function _do( i, j ){
			if( _g.data.item_id_by_type[i] ){
				if( !j ){
					var data_equipmenttype = _g.data.item_types[ _g.item_type_order[i] ]
					this.dom.types.push(
						$('<tr class="typetitle" data-equipmentcollection="'+_g.data.item_id_by_type[i]['collection']+'" data-type="'+data_equipmenttype.id+'">'
								+ '<th colspan="' + (this.columns.length + 1) + '">'
									+ '<span style="background-image: url(../app/assets/images/itemicon/'+data_equipmenttype['icon']+'.png)"></span>'
									+ data_equipmenttype['name']['zh_cn']
									+ TablelistEquipments.gen_helper_equipable_on( data_equipmenttype['id'] )
								+ '</th></tr>'
							).appendTo( this.dom.tbody )
					)
				}
	
				this.append_item(
					_g.data.items[ _g.data.item_id_by_type[i]['equipments'][j] ],
					_g.data.item_id_by_type[i]['collection']
				)
	
				setTimeout(function(){
					if( j >= _g.data.item_id_by_type[i]['equipments'].length - 1 ){
						_do( i+1, 0 )
					}else{
						_do( i, j+1 )
					}
				}, 0)
			}else{
				//this.mark_high()
				// force thead redraw
					this.thead_redraw()
					this.generated = true
					this.apply_types_check()
				_frame.app_main.loaded('tablelist_'+this._index, true)
			}
		}
		_do = _do.bind(this)
		_do( 0, 0 )
	}

	apply_types(){
		console.log('types: ' + TablelistEquipments.types)
		this.dom.filter_types.removeAttr('class')
		
		if( TablelistEquipments.types.length ){
			this.dom.filter_types.addClass('type' + TablelistEquipments.types.join(' type'))
			if( this.generated )
				this.apply_types_check()
		}
	}

	apply_types_check(){
		if( TablelistEquipments.shipIdLast && TablelistEquipments.shipIdLast == TablelistEquipments.shipId )
			return
		
		TablelistEquipments.shipIdLast = TablelistEquipments.shipId
		
		// 航母：直接进入飞行器页
		if( TablelistEquipments.shipId
			&& $.inArray(_g.data.ships[TablelistEquipments.shipId].type, [9, 10, 11] ) > -1
		){
			let k = 0
				,el
	
			while( this.dom.types[k++].attr('data-equipmentcollection') != 3
				|| $.inArray((parseInt(this.dom.types[k].attr('data-type')) || null), TablelistEquipments.types) <= -1 ){
				el = this.dom.types[k+1]
			}
			
			el = el || this.dom.types[0]
			
			this.dom.type_radios[3].prop('checked', true).trigger('change')
			this.dom.table_container_inner.scrollTop(el[0].offsetTop || 0)
			return
		}
		
		if( TablelistEquipments.types.length ){
			let k = 0
				,el
	
			while( $.inArray((parseInt(this.dom.types[k++].attr('data-type')) || null), TablelistEquipments.types) <= -1 ){
				el = this.dom.types[k]
			}
			
			el = el || this.dom.types[0]
			
			this.dom.type_radios[parseInt(el.attr('data-equipmentcollection')) || 1].prop('checked', true).trigger('change')
			this.dom.table_container_inner.scrollTop(el[0].offsetTop || 0)
		}
	}
}

TablelistEquipments.gen_helper_equipable_on = function( type_id ){
	return `<em class="helper" data-tip="[[EQUIPABLE::${type_id}]]">?</em>`
	/*
	var equipable_on = ''
	_g.data.item_types[type_id]['equipable_on_type'].forEach(function(currentValue, i){
		var item_type_id = _g.data.item_types[type_id]['equipable_on_type'][i]
		equipable_on+= '<span>'
							+ _g['data']['ship_types'][item_type_id].name.zh_cn
							+ ( i < _g.data.item_types[type_id]['equipable_on_type'].length-1 ? ',&nbsp;' : '' )
						+ '</span>'
	})
	return '<em class="helper" data-tip="<h4 class=item_equipable_on>可装备于</h4>' + equipable_on + '">?</em>'
	*/
}

TablelistEquipments.types = []
TablelistEquipments.shipId = null
TablelistEquipments.shipIdLast = null
const getFolderGroup = (folder, id) => {
    folder = folder.substr(folder.length - 1) == '/'
        ? folder.substr(0, folder - 1)
        : folder
    id = parseInt(id)
    let index = 100
    let multiplier = 1
    while (index * multiplier < id) {
        multiplier++
    }
    return folder + '-' + multiplier + '/'
}

_frame.app_main.page['init'].exportdata_cache_ships = function (dest, _ship) {
    let deferred = Q.defer()
        , dest_path = node.path.join(dest, 'app/page')

    __log('&nbsp;')
    __log('========== 输出页面: ships.html ==========')

    // 确保目标目录
    node.mkdirp.sync(dest_path)

    // 
    let container = $('<div class="tablelist ships"/>')
        , data = new TablelistShips_v2(container)

    // 写入文件
    let interval = setInterval(function () {
        if (!data.last_item) {
            clearInterval(interval)
            interval = null
            node.fs.writeFile(node.path.join(dest_path, 'ships.html')
                , container[0].outerHTML
                , function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        __log('= ships.html 已输出')
                    }
                    deferred.resolve()
                })
        }
    }, 10)

    return deferred.promise
}

_g.fleetLeyte = {
    // 栗田
    kurita: [
        '大和', '武蔵', '長門', '金剛', '榛名',

        '愛宕', '高雄', '摩耶', '鳥海', '妙高', '羽黒',
        '熊野', '鈴谷', '利根', '筑摩',

        '能代', '矢矧',

        '島風', '早霜', '藤波', '沖波', '長波',
        '浦風', '磯風', '浜風', '雪風', '野分', '清霜',
    ],
    // 小泽
    ozawa: [
        '伊勢', '日向',
        '瑞鶴', '千歳', '千代田', '瑞鳳',
        '多摩', '五十鈴', '大淀',
        '秋月', '初月',
    ],
    // 西村
    nishimura: [
        '山城', '扶桑', '最上', '山雲', '満潮', '朝雲', '時雨',
    ],
    // 志摩
    shima: [
        '那智', '足柄', '青葉',
        '鬼怒',
        '曙', '潮', '霞', '不知火', '初春', '若葉', '初霜', '浦波',
    ],
    // 多号作战
    ta_go: [
        '青葉',
        '鬼怒',
        '卯月', '曙', '潮', '霞', '島風', '初春', '初霜', '長波', '沖波', '朝霜', '浦波', '若葉',
        'まるゆ',
        '占守',
    ],
}



















class TablelistShips_v2 extends Tablelist {
    constructor(container, options) {
        super(container, options)

        this.columns = [
            '  ',
            ['火力', 'fire'],
            ['雷装', 'torpedo'],
            ['夜战', 'nightpower'],
            ['对空', 'aa'],
            ['对潜', 'asw'],
            ['耐久', 'hp'],
            ['装甲', 'armor'],
            ['回避', 'evasion'],
            ['搭载', 'carry'],
            ['航速', 'speed'],
            ['射程', 'range'],
            ['索敌', 'los'],
            ['运', 'luck'],
            ['油耗', 'consum_fuel'],
            ['弹耗', 'consum_ammo'],
            ['多立绘', 'extra_illust']
        ]
        this.header_checkbox = []
        this.checkbox = []
        this.last_item = null
        this.last_title = null
        this.last_type_items = $()

        // 标记全局载入状态
        _frame.app_main.loading.push('tablelist_' + this._index)
        _frame.app_main.is_loaded = false

        //_g.log( 'shiplist init', _frame.app_main.loading )

        // 生成过滤器与选项
        this.dom.filter_container = $('<div class="options"/>').appendTo(this.dom.container)
        this.dom.filters = $('<div class="filters"/>').appendTo(this.dom.filter_container)
        this.dom.exit_compare = $('<div class="exit_compare"/>')
            .append(
                $('<button icon="arrow-set2-left"/>')
                    .html('结束对比')
                    .on('click', function () {
                        this.compare_end()
                    }.bind(this))
            )
            .append(
                $('<button icon="checkbox-checked"/>')
                    .html('继续选择')
                    .on('click', function () {
                        this.compare_continue()
                    }.bind(this))
            )
            .appendTo(this.dom.filter_container)
        this.dom.btn_compare_sort = $('<button icon="sort-amount-desc" class="disabled"/>')
            .html('点击表格标题可排序')
            .on('click', function () {
                if (!this.dom.btn_compare_sort.hasClass('disabled'))
                    this.sort_table_restore()
            }.bind(this)).appendTo(this.dom.exit_compare)

        // 初始化设置
        this.append_option('checkbox', 'hide-premodel', '仅显示同种同名舰最终版本',
            _config.get('shiplist-filter-hide-premodel') === 'false' ? null : true, null, {
                'onchange': function (e, input) {
                    _config.set('shiplist-filter-hide-premodel', input.prop('checked'))
                    this.dom.filter_container.attr('filter-hide-premodel', input.prop('checked'))
                    this.thead_redraw()
                }.bind(this)
            })
        this.append_option('radio', 'viewtype', null, [
            ['card', ''],
            ['list', '']
        ], null, {
                'radio_default': _config.get('shiplist-viewtype'),
                'onchange': function (e, input) {
                    if (input.is(':checked')) {
                        _config.set('shiplist-viewtype', input.val())
                        this.dom.filter_container.attr('viewtype', input.val())
                        this.thead_redraw()
                    }
                }.bind(this)
            }).attr('data-caption', '布局')
        this.dom.filters.find('input').trigger('change')

        // 生成表格框架
        this.dom.table_container = $('<div class="tablelist-container"/>').appendTo(this.dom.container)
        //this.dom.thead = $('<div class="tablelist-header"/>').appendTo( this.dom.table_container )
        //this.dom.thead = $('<div class="wrapper"/>').appendTo($('<div class="tablelist-header"/>').appendTo( this.dom.table_container ))
        this.dom.thead = $('<dl/>').appendTo($('<div class="tablelist-header"/>').appendTo(this.dom.table_container))
        this.dom.tbody = $('<div class="tablelist-body" scrollbody />').appendTo(this.dom.table_container)
            .on('contextmenu.contextmenu_ship', '[data-shipid]', function (e) {
                this.contextmenu_show($(e.currentTarget))
            }.bind(this))
            .on('click.contextmenu_ship', '[data-shipid]>strong>em', function (e) {
                this.contextmenu_show($(e.currentTarget).parent().parent())
                e.stopImmediatePropagation()
                e.stopPropagation()
            }.bind(this))

        this.columns.forEach(function (v, i) {
            if (typeof v == 'object') {
                var td = $('<dd stat="' + v[1] + '"/>')
                    .html(v[0])
                    .on('click', function () {
                        this.sort_table_from_theadcell(td)
                    }.bind(this))
                    .appendTo(this.dom.thead)
            } else {
                $('<dt/>').html(v[0]).appendTo(this.dom.thead)
            }
        }.bind(this))

        // 获取所有舰娘数据，按舰种顺序 (_g.ship_type_order / _g.ship_type_order_map) 排序
        // -> 获取舰种名称
        // -> 生成舰娘DOM
        if (_g.data.ship_types) {
            this.append_all_items()
        } else {
            $('<dl/>').html('暂无数据...').appendTo(this.dom.table_container)
        }
        //_db.ships.find({}).sort({'type': 1, 'class': 1, 'class_no': 1, 'time_created': 1, 'name.suffix': 1}).exec(function(err, docs){
        //	if( !err ){
        //		for(var i in docs){
        //			_g.data.ships[docs[i]['id']] = docs[i]

        //			if( typeof _g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ] == 'undefined' )
        //				_g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ] = []
        //			_g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ].push( docs[i]['id'] )
        //		}
        //	}

        /*
        _db.ship_types.find({}, function(err2, docs2){
            if( !err2 ){
                for(var i in docs2 ){
                    _g.data.ship_types[docs2[i]['id']] = docs2[i]
                }
 
            }
        })
        */
        //	if( _g.data.ship_types ){
        //		this.append_all_items()
        //	}else{
        //		$('<p/>').html('暂无数据...').appendTo( this.dom.table_container_inner )
        //	}
        //})

        // 生成底部内容框架
        this.dom.msg_container = $('<div class="msgs"/>').appendTo(this.dom.container)
        if (!_config.get('hide-compareinfos'))
            this.dom.msg_container.attr('data-msgs', 'compareinfos')

        // 生成部分底部内容
        let compareinfos = $('<div class="compareinfos"/>').html('点击舰娘查询详细信息，勾选舰娘进行对比').appendTo(this.dom.msg_container)
        $('<button/>').html('&times;').on('click', function () {
            this.dom.msg_container.removeAttr('data-msgs')
            _config.set('hide-compareinfos', true)
        }.bind(this)).appendTo(compareinfos)
        $('<div class="comparestart"/>').html('开始对比')
            .on('click', function () {
                this.compare_start()
            }.bind(this)).appendTo(this.dom.msg_container)

    }

    append_item(ship_data, header_index) {
        let donotcompare = _g.data.ship_types[ship_data['type']]['donotcompare'] ? true : false
            , tr = $('<dl/>', {
                //'class':		'row',
                'data-shipid': ship_data['id'],
                'data-header': header_index,
                //'data-trindex': this.trIndex,
                'data-infos': '[[SHIP::' + ship_data['id'] + ']]',
                'data-shipedit': this.dom.container.hasClass('shiplist-edit') ? 'true' : null,
                'data-donotcompare': donotcompare ? true : null
            })
                .on('click', function (e, forceInfos) {
                    if (!forceInfos && e.target.tagName.toLowerCase() != 'em' && _frame.app_main.is_mode_selection()) {
                        e.preventDefault()
                        e.stopImmediatePropagation()
                        e.stopPropagation()
                        if (!donotcompare)
                            _frame.app_main.mode_selection_callback(ship_data['id'])
                    }
                })
                .insertAfter(this.last_item)
            , name = ship_data['name'][_g.lang]
                + (ship_data['name']['suffix']
                    ? '<small>' + _g.data.ship_namesuffix[ship_data['name']['suffix']][_g.lang] + '</small>'
                    : '')
            , checkbox = $('<input type="checkbox" class="compare"/>')
                .prop('disabled', donotcompare)
                .on('click, change', function (e, not_trigger_check) {
                    if (checkbox.prop('checked'))
                        tr.attr('compare-checked', true)
                    else
                        tr.removeAttr('compare-checked')
                    this.compare_btn_show(checkbox.prop('checked'))
                    if (!not_trigger_check)
                        this.header_checkbox[header_index].trigger('docheck')
                }.bind(this))
            //,label = checkbox.add( $('<label class="checkbox"/>') )
            , label = $('<label class="checkbox"/>')
            , has_extra_illust = false
            , seriesData = ship_data.getSeriesData()

        function getNavy() {
            if (ship_data.navy) return ship_data.navy
            return ship_data.class
                ? (_g.data.ship_classes[ship_data.class].navy || 'ijn')
                : 'ijn'
        }
        const navy = getNavy()
        if (navy) {
            name += '<span class="flag-navy" data-navy="' + navy + '"></span>'
        }

        seriesData.forEach(function (data_cur, i) {
            let data_prev = i ? seriesData[i - 1] : null

            has_extra_illust = data_cur.illust_extra && data_cur.illust_extra.length && data_cur.illust_extra[0] ? true : false

            if (!has_extra_illust && data_cur.illust_delete && data_prev)
                has_extra_illust = data_prev.illust_extra && data_prev.illust_extra.length && data_prev.illust_extra[0] ? true : false
        })

        this.last_item = tr
        this.trIndex++

        this.header_checkbox[header_index].data(
            'ships',
            this.header_checkbox[header_index].data('ships').add(tr)
        )
        tr.data('checkbox', checkbox)

        this.checkbox[ship_data['id']] = checkbox

        function _val(val, show_zero) {
            if (!show_zero && (val == 0 || val == '0'))
                //return '<small class="zero">-</small>'
                return '-'
            if (val <= -1 || val == '-1')
                //return '<small class="zero">?</small>'
                return '?'
            return val
        }

        function _val_data(val) {
            if (val === 0)
                return 0
            return val || -1
        }

        this.columns.forEach(function (currentValue, i) {
            switch (currentValue[1]) {
                case ' ':
                    $('<dt/>')
                        .html(
                            //'<img src="../pics/ships/'+ship_data['id']+'/0.jpg"/>'
                            //'<img src="' + _g.path.pics.ships + '/' + ship_data['id']+'/0.webp" contextmenu="disabled"/>'
                            '<a href="?infos=ship&id=' + ship_data['id'] + '"'
                            + (has_extra_illust ? ' icon="hanger"' : '')
                            + '>'
                            //+ '<img src="../pics/ships/'+ship_data['id']+'/0.webp" contextmenu="disabled"/>'
                            + `<img src="../${getFolderGroup('pics-ships', ship_data['id'])}${ship_data['id']}/0.webp"/>`
                            + '<strong>' + name + '</strong>'
                            + '</a>'
                            + '<em></em>'
                            //+ '<small>' + ship_data['pron'] + '</small>'
                        )
                        .prepend(
                            label
                        )
                        .appendTo(tr)
                    break;
                case 'nightpower':
                    // 航母没有夜战火力
                    var is_nonight_shelling = /^(9|10|11|30|32)$/.test(ship_data['type']) && !ship_data.additional_night_shelling
                    var datavalue = is_nonight_shelling
                        ? 0
                        : (parseInt(ship_data['stat']['fire_max'] || 0)
                            + parseInt(ship_data['stat']['torpedo_max'] || 0)
                        )
                    $('<dd stat="nightpower"/>')
                        .attr(
                            'value',
                            _val_data(datavalue)
                        )
                        .html(_val(datavalue))
                        .appendTo(tr)
                    break;
                case 'asw':
                    $('<dd stat="asw" />')
                        .attr(
                            'value',
                            _val_data(ship_data['stat']['asw_max'])
                        )
                        .html(_val(
                            ship_data['stat']['asw_max'],
                            /^(5|8|9|12|24|30)$/.test(ship_data['type'])
                        ))
                        .appendTo(tr)
                    break;
                case 'hp':
                    $('<dd stat="hp" value="' + _val_data(ship_data['stat']['hp']) + '"/>')
                        .html(_val(ship_data['stat']['hp']))
                        .appendTo(tr)
                    break;
                case 'carry':
                    $('<dd stat="carry" value="' + _val_data(ship_data['stat']['carry']) + '"/>')
                        .html(_val(ship_data['stat']['carry']))
                        .appendTo(tr)
                    break;
                case 'speed':
                    $('<dd stat="speed" value="' + _val_data(ship_data['stat']['speed']) + '"/>')
                        .html(_g.getStatSpeed(ship_data['stat']['speed']))
                        .appendTo(tr)
                    break;
                case 'range':
                    $('<dd stat="range" value="' + _val_data(ship_data['stat']['range']) + '"/>')
                        .html(_g.getStatRange(ship_data['stat']['range']))
                        .appendTo(tr)
                    break;
                case 'luck':
                    $('<dd stat="luck" value="' + _val_data(ship_data['stat']['luck']) + '"/>')
                        .html(ship_data['stat']['luck'] + '<sup>' + _val(ship_data['stat']['luck_max']) + '</sup>')
                        .appendTo(tr)
                    break;
                case 'consum_fuel':
                    $('<dd stat="consum_fuel"/>')
                        .attr(
                            'value',
                            _val_data(ship_data['consum']['fuel'])
                        )
                        .html(_val(ship_data['consum']['fuel']))
                        .appendTo(tr)
                    break;
                case 'consum_ammo':
                    $('<dd stat="consum_ammo"/>')
                        .attr(
                            'value',
                            _val_data(ship_data['consum']['ammo'])
                        )
                        .html(_val(ship_data['consum']['ammo']))
                        .appendTo(tr)
                    break;
                case 'extra_illust':
                    $('<dd stat="' + currentValue[1] + '" value="' + (has_extra_illust ? '1' : '0') + '"/>')
                        .html(
                            has_extra_illust
                                ? '✓'
                                : '<small class="zero">-</small>'
                        )
                        .appendTo(tr)
                    break;
                default:
                    $('<dd stat="' + currentValue[1] + '"/>')
                        .attr(
                            'value',
                            _val_data(ship_data['stat'][currentValue[1] + '_max'])
                        )
                        .html(_val(ship_data['stat'][currentValue[1] + '_max']))
                        .appendTo(tr)
                    break;
            }
        })

        // 检查数据是否存在 remodel.next
        // 如果 remodel.next 与当前数据 type & name 相同，标记当前为可改造前版本
        if (ship_data.remodel && ship_data.remodel.next
            && _g.data.ships[ship_data.remodel.next]
            && _g.ship_type_order_map[ship_data['type']] == _g.ship_type_order_map[_g.data.ships[ship_data.remodel.next]['type']]
            && ship_data['name']['ja_jp'] == _g.data.ships[ship_data.remodel.next]['name']['ja_jp']
            && !(
                _g.data.ships[ship_data.remodel.next].remodel
                && _g.data.ships[ship_data.remodel.next].remodel.prev_loop
            )
        ) {
            tr.addClass('premodeled')
        }

        // 检查莱特湾海战所属部队
        const fleets = []
        for (const fleet in _g.fleetLeyte) {
            _g.fleetLeyte[fleet].some(name_ja => {
                if (ship_data.name.ja_jp == name_ja) {
                    fleets.push('|' + fleet + '|')
                    return true
                }
                return false
            })
        }
        if (fleets.length)
            tr.attr('data-leyte-fleet', fleets.join(''))

        this.last_type_items = this.last_type_items.add(tr)

        return tr
    }

    append_all_items() {
        function _type_check(last_type_items, last_title) {
            if (!last_type_items || !last_type_items.length || !last_title || !last_title.length)
                return

            let all_donotcompare = true

            last_type_items.each(function (i, el) {
                if (!$(el).attr('data-donotcompare'))
                    all_donotcompare = false
            })

            if (all_donotcompare)
                last_title.attr('data-donotcompare', true)
        }
        function _do(i, j) {
            if (_g.data.ship_id_by_type[i]) {
                if (!j) {
                    _type_check(this.last_type_items, this.last_title)

                    let data_shiptype
                        , checkbox

                    if (typeof _g.ship_type_order[i] == 'object') {
                        data_shiptype = _g.data.ship_types[_g.ship_type_order[i][0]]
                    } else {
                        data_shiptype = _g.data.ship_types[_g.ship_type_order[i]]
                    }

                    let checkbox_id = Tablelist.genId()

                    this.last_item =
                        //$('<p class="title" data-trindex="'+this.trIndex+'" data-header="'+i+'">'
                        //$('<p class="title" data-header="'+i+'">'
                        $('<h4 data-header="' + i + '">'
                            + '<label class="checkbox" for="' + checkbox_id + '">'
                            + _g.data['ship_type_order'][i]['name']['zh_cn']
                            + (_g.data['ship_type_order'][i]['name']['zh_cn'] == data_shiptype.name.zh_cn
                                ? ('<small>[' + data_shiptype['code'] + ']</small>')
                                : ''
                            )
                            + '</label></p>')
                            .appendTo(this.dom.tbody)
                    this.last_title = this.last_item
                    this.last_type_items = $()
                    this.trIndex++

                    // 创建空DOM，欺骗flexbox layout排版
                    var k = 0
                    while (k < this.flexgrid_empty_count) {
                        var _index = this.trIndex + _g.data.ship_id_by_type[i].length + k
                        //$('<p class="empty" data-trindex="'+_index+'" data-shipid/>').appendTo(this.dom.tbody)
                        $('<dl data-shipid/>').appendTo(this.dom.tbody)
                        k++
                    }

                    checkbox = $('<input type="checkbox" id="' + checkbox_id + '"/>')
                        .prop('disabled', _g.data['ship_type_order'][i]['donotcompare'] ? true : false)
                        .on({
                            'change': function () {
                                checkbox.data('ships').filter(':visible').each(function (index, element) {
                                    $(element).data('checkbox').prop('checked', checkbox.prop('checked')).trigger('change', [true])
                                })
                            },
                            'docheck': function () {
                                // ATTR: compare-checked
                                var trs = checkbox.data('ships').filter(':visible')
                                    , checked = trs.filter('[compare-checked=true]')
                                if (!checked.length) {
                                    checkbox.prop({
                                        'checked': false,
                                        'indeterminate': false
                                    })
                                } else if (checked.length < trs.length) {
                                    checkbox.prop({
                                        'checked': false,
                                        'indeterminate': true
                                    })
                                } else {
                                    checkbox.prop({
                                        'checked': true,
                                        'indeterminate': false
                                    })
                                }
                            }
                        })
                        .data('ships', $())
                        .prependTo(this.last_item)

                    this.header_checkbox[i] = checkbox

                    //_g.inputIndex++
                }

                this.append_item(_g.data.ships[_g.data.ship_id_by_type[i][j]], i)

                setTimeout(function () {
                    if (j >= _g.data.ship_id_by_type[i].length - 1) {
                        this.trIndex += this.flexgrid_empty_count
                        _do(i + 1, 0)
                    } else {
                        _do(i, j + 1)
                    }
                }.bind(this), 0)
            } else {
                _type_check(this.last_type_items, this.last_title)
                this.mark_high()
                this.thead_redraw()
                _frame.app_main.loaded('tablelist_' + this._index, true)
                //_g.log( this.last_item )
                delete (this.last_item)
                //_g.log( this.last_item )
            }
        }
        _do = _do.bind(this)
        _do(0, 0)
    }

    compare_btn_show(is_checked) {
        if ((!is_checked && this.dom.tbody.find('input[type="checkbox"].compare:checked').length)
            || is_checked
        ) {
            this.dom.msg_container.attr('data-msgs', 'comparestart')
        } else {
            this.dom.msg_container.removeAttr('data-msgs')
        }
    }

    compare_start() {
        // 隐藏底部提示信息
        this.dom.msg_container.removeAttr('data-msgs')

        // 存储当前状态
        this.last_viewtype = this.dom.filter_container.attr('viewtype')
        _config.set('shiplist-viewtype', this.last_viewtype)
        this.last_scrollTop = this.dom.table_container_inner.scrollTop()

        // 更改视图
        this.dom.filter_container.attr('viewtype', 'compare')
        this.dom.table_container_inner.scrollTop(0)
        this.dom.table.addClass('sortable')

        // 计算数据排序排序
        this.mark_high(true)
        this.thead_redraw(500)
    }

    compare_off() {
        this.dom.filter_container.attr('viewtype', this.last_viewtype)
        this.sort_table_restore()
        this.mark_high()
        this.thead_redraw(500)
        this.dom.table_container_inner.scrollTop(this.last_scrollTop)
        this.dom.table.removeClass('sortable')
        delete this.last_viewtype
        delete this.last_scrollTop
    }

    compare_end() {
        this.dom.tbody.find('input[type="checkbox"].compare:checked').prop('checked', false).trigger('change')
        this.dom.msg_container.removeAttr('data-msgs')
        this.compare_off()
    }

    compare_continue() {
        this.dom.msg_container.attr('data-msgs', 'comparestart')
        this.compare_off()
    }

    contextmenu_show($el, shipId) {
        if (this.dom.filter_container.attr('viewtype') == 'compare' || $el.attr('data-donotcompare') == 'true')
            return false

        TablelistShips.contextmenu_curid = shipId || $el.data('shipid')
        TablelistShips.contextmenu_curel = $el

        if (!TablelistShips.contextmenu)
            TablelistShips.contextmenu = new _menu({
                'className': 'contextmenu-ship',
                'items': [
                    $('<menuitem/>').html('选择')
                        .on({
                            'click': function (e) {
                                if (_frame.app_main.is_mode_selection())
                                    _frame.app_main.mode_selection_callback(TablelistShips.contextmenu_curid)
                            },
                            'show': function () {
                                if (_frame.app_main.is_mode_selection())
                                    $(this).show()
                                else
                                    $(this).hide()
                            }
                        }),
                    $('<menuitem/>').html('查看资料')
                        .on({
                            'click': function (e) {
                                TablelistShips.contextmenu_curel.trigger('click', [true])
                            }
                        }),

                    $('<menuitem/>').html('将该舰娘加入对比')
                        .on({
                            'click': function (e) {
                                this.checkbox[TablelistShips.contextmenu_curid]
                                    .prop('checked', !this.checkbox[TablelistShips.contextmenu_curid].prop('checked'))
                                    .trigger('change')
                            }.bind(this),
                            'show': function (e) {
                                if (!TablelistShips.contextmenu_curid)
                                    return false

                                if (_g.data.ship_types[_g['data']['ships'][TablelistShips.contextmenu_curid]['type']]['donotcompare'])
                                    $(e.target).hide()
                                else
                                    $(e.target).show()

                                if (this.checkbox[TablelistShips.contextmenu_curid].prop('checked'))
                                    $(e.target).html('取消对比')
                                else
                                    $(e.target).html('将该舰娘加入对比')
                            }.bind(this)
                        }),

                    $('<div/>').on('show', function (e) {
                        var $div = $(e.target).empty()
                        if (TablelistShips.contextmenu_curid) {
                            var series = _g['data']['ships'][TablelistShips.contextmenu_curid].getSeriesData() || []
                            series.forEach(function (currentValue, i) {
                                if (!i)
                                    $div.append($('<hr/>'))
                                let checkbox = null
                                try {
                                    checkbox = this.checkbox[currentValue['id']]
                                } catch (e) { }
                                $div.append(
                                    $('<div class="item"/>')
                                        .html('<span>' + _g['data']['ships'][currentValue['id']].getName(true) + '</span>')
                                        .append(
                                            $('<div class="group"/>')
                                                .append(function () {
                                                    var els = $()

                                                    if (_frame.app_main.is_mode_selection()) {
                                                        els = els.add(
                                                            $('<menuitem/>')
                                                                .html('选择')
                                                                .on({
                                                                    'click': function () {
                                                                        if (_frame.app_main.is_mode_selection())
                                                                            _frame.app_main.mode_selection_callback(currentValue['id'])
                                                                    }
                                                                })
                                                        )
                                                    }

                                                    return els
                                                })
                                                .append(
                                                    $('<menuitem data-infos="[[SHIP::' + currentValue['id'] + ']]"/>')
                                                        .html('查看资料')
                                                )
                                                .append(
                                                    $('<menuitem/>')
                                                        .html(
                                                            checkbox && checkbox.prop('checked')
                                                                ? '取消对比'
                                                                : '加入对比'
                                                        )
                                                        .on({
                                                            'click': function (e) {
                                                                if (checkbox) {
                                                                    this.checkbox[currentValue['id']]
                                                                        .prop('checked', !checkbox.prop('checked'))
                                                                        .trigger('change')
                                                                }
                                                            }.bind(this)
                                                        })
                                                )
                                        )
                                )
                            }, this)
                        }
                    }.bind(this))
                ]
            })

        TablelistShips.contextmenu.show($el)
    }
}



















class TablelistShips extends Tablelist {
    constructor(container, options) {
        super(container, options)

        this.columns = [
            '  ',
            ['火力', 'fire'],
            ['雷装', 'torpedo'],
            ['夜战', 'nightpower'],
            ['对空', 'aa'],
            ['对潜', 'asw'],
            ['耐久', 'hp'],
            ['装甲', 'armor'],
            ['回避', 'evasion'],
            ['搭载', 'carry'],
            ['航速', 'speed'],
            ['射程', 'range'],
            ['索敌', 'los'],
            ['运', 'luck'],
            ['油耗', 'consum_fuel'],
            ['弹耗', 'consum_ammo'],
            ['多立绘', 'extra_illust']
        ]
        this.header_checkbox = []
        this.checkbox = []
        this.last_item = null

        // 标记全局载入状态
        _frame.app_main.loading.push('tablelist_' + this._index)
        _frame.app_main.is_loaded = false

        //_g.log( 'shiplist init', _frame.app_main.loading )

        // 生成过滤器与选项
        this.dom.filter_container = $('<div class="options"/>').appendTo(this.dom.container)
        this.dom.filters = $('<div class="filters"/>').appendTo(this.dom.filter_container)
        this.dom.exit_compare = $('<div class="exit_compare"/>')
            .append(
                $('<button icon="arrow-set2-left"/>')
                    .html('结束对比')
                    .on('click', function () {
                        this.compare_end()
                    }.bind(this))
            )
            .append(
                $('<button icon="checkbox-checked"/>')
                    .html('继续选择')
                    .on('click', function () {
                        this.compare_continue()
                    }.bind(this))
            )
            .appendTo(this.dom.filter_container)
        this.dom.btn_compare_sort = $('<button icon="sort-amount-desc" class="disabled"/>')
            .html('点击表格标题可排序')
            .on('click', function () {
                if (!this.dom.btn_compare_sort.hasClass('disabled'))
                    this.sort_table_restore()
            }.bind(this)).appendTo(this.dom.exit_compare)

        // 初始化设置
        this.append_option('checkbox', 'hide-premodel', '仅显示同种同名舰最终版本',
            _config.get('shiplist-filter-hide-premodel') === 'false' ? null : true, null, {
                'onchange': function (e, input) {
                    _config.set('shiplist-filter-hide-premodel', input.prop('checked'))
                    this.dom.filter_container.attr('filter-hide-premodel', input.prop('checked'))
                    this.thead_redraw()
                }.bind(this)
            })
        this.append_option('radio', 'viewtype', null, [
            ['card', ''],
            ['list', '']
        ], null, {
                'radio_default': _config.get('shiplist-viewtype'),
                'onchange': function (e, input) {
                    if (input.is(':checked')) {
                        _config.set('shiplist-viewtype', input.val())
                        this.dom.filter_container.attr('viewtype', input.val())
                        this.thead_redraw()
                    }
                }.bind(this)
            }).attr('data-caption', '布局')
        this.dom.filters.find('input').trigger('change')

        // 生成表格框架
        this.dom.table_container = $('<div class="fixed-table-container"/>').appendTo(this.dom.container)
        this.dom.table_container_inner = $('<div class="fixed-table-container-inner"/>').appendTo(this.dom.table_container)
        this.dom.table = $('<table class="ships hashover hashover-column"/>').appendTo(this.dom.table_container_inner)
        function gen_thead(arr) {
            this.dom.thead = $('<thead/>')
            var tr = $('<tr/>').appendTo(this.dom.thead)
            arr.forEach(function (currentValue, i) {
                if (typeof currentValue == 'object') {
                    var td = $('<td data-stat="' + currentValue[1] + '"/>')
                        .html('<div class="th-inner-wrapper"><span><span>' + currentValue[0] + '</span></span></div>')
                        .on('click', function () {
                            this.sort_table_from_theadcell(td)
                        }.bind(this))
                        .appendTo(tr)
                } else {
                    $('<th/>').html('<div class="th-inner-wrapper"><span><span>' + currentValue[0] + '</span></span></div>').appendTo(tr)
                }
            }, this)
            return this.dom.thead
        }
        gen_thead = gen_thead.bind(this)
        gen_thead(this.columns).appendTo(this.dom.table)
        this.dom.tbody = $('<tbody/>').appendTo(this.dom.table)

        // 右键菜单事件
        this.dom.table.on('contextmenu.contextmenu_ship', 'tr[data-shipid]', function (e) {
            this.contextmenu_show($(e.currentTarget))
        }.bind(this)).on('click.contextmenu_ship', 'tr[data-shipid]>th>em', function (e) {
            this.contextmenu_show($(e.currentTarget).parent().parent())
            e.stopImmediatePropagation()
            e.stopPropagation()
        }.bind(this))

        // 获取所有舰娘数据，按舰种顺序 (_g.ship_type_order / _g.ship_type_order_map) 排序
        // -> 获取舰种名称
        // -> 生成舰娘DOM
        if (_g.data.ship_types) {
            this.append_all_items()
        } else {
            $('<p/>').html('暂无数据...').appendTo(this.dom.table_container_inner)
        }
        //_db.ships.find({}).sort({'type': 1, 'class': 1, 'class_no': 1, 'time_created': 1, 'name.suffix': 1}).exec(function(err, docs){
        //	if( !err ){
        //		for(var i in docs){
        //			_g.data.ships[docs[i]['id']] = docs[i]

        //			if( typeof _g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ] == 'undefined' )
        //				_g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ] = []
        //			_g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ].push( docs[i]['id'] )
        //		}
        //	}

        /*
        _db.ship_types.find({}, function(err2, docs2){
            if( !err2 ){
                for(var i in docs2 ){
                    _g.data.ship_types[docs2[i]['id']] = docs2[i]
                }
 
            }
        })
        */
        //	if( _g.data.ship_types ){
        //		this.append_all_items()
        //	}else{
        //		$('<p/>').html('暂无数据...').appendTo( this.dom.table_container_inner )
        //	}
        //})

        // 生成底部内容框架
        this.dom.msg_container = $('<div class="msgs"/>').appendTo(this.dom.container)
        if (!_config.get('hide-compareinfos'))
            this.dom.msg_container.attr('data-msgs', 'compareinfos')

        // 生成部分底部内容
        let compareinfos = $('<div class="compareinfos"/>').html('点击舰娘查询详细信息，勾选舰娘进行对比').appendTo(this.dom.msg_container)
        $('<button/>').html('&times;').on('click', function () {
            this.dom.msg_container.removeAttr('data-msgs')
            _config.set('hide-compareinfos', true)
        }.bind(this)).appendTo(compareinfos)
        $('<div class="comparestart"/>').html('开始对比')
            .on('click', function () {
                this.compare_start()
            }.bind(this)).appendTo(this.dom.msg_container)

    }

    append_item(ship_data, header_index) {
        //,tr = $('<tr class="row" data-shipid="'+ ship_data['id'] +'" data-header="'+ header_index +'" modal="true"/>')
        //,tr = $('<tr class="row" data-shipid="'+ ship_data['id'] +'" data-header="'+ header_index +'" data-infos="__ship__"/>')
        let donotcompare = _g.data.ship_types[ship_data['type']]['donotcompare'] ? true : false
            , tr = $('<tr/>', {
                'class': 'row',
                'data-shipid': ship_data['id'],
                'data-header': header_index,
                'data-trindex': this.trIndex,
                'data-infos': '[[SHIP::' + ship_data['id'] + ']]',
                'data-shipedit': this.dom.container.hasClass('shiplist-edit') ? 'true' : null,
                'data-donotcompare': donotcompare ? true : null
            })
                .on('click', function (e, forceInfos) {
                    if (!forceInfos && e.target.tagName.toLowerCase() != 'em' && _frame.app_main.is_mode_selection()) {
                        e.preventDefault()
                        e.stopImmediatePropagation()
                        e.stopPropagation()
                        if (!donotcompare)
                            _frame.app_main.mode_selection_callback(ship_data['id'])
                    }
                })
                //.appendTo( this.dom.tbody )
                .insertAfter(this.last_item)
            , name = ship_data['name'][_g.lang]
                + (ship_data['name']['suffix']
                    ? '<small>' + _g.data.ship_namesuffix[ship_data['name']['suffix']][_g.lang] + '</small>'
                    : '')
            , checkbox = $('<input type="checkbox" class="compare"/>')
                .prop('disabled', donotcompare)
                .on('click, change', function (e, not_trigger_check) {
                    if (checkbox.prop('checked'))
                        tr.attr('compare-checked', true)
                    else
                        tr.removeAttr('compare-checked')
                    this.compare_btn_show(checkbox.prop('checked'))
                    if (!not_trigger_check)
                        this.header_checkbox[header_index].trigger('docheck')
                }.bind(this))
            , label = checkbox.add($('<label class="checkbox"/>'))
            , has_extra_illust = false
            , seriesData = ship_data.getSeriesData()

        seriesData.forEach(function (data_cur, i) {
            let data_prev = i ? seriesData[i - 1] : null

            has_extra_illust = data_cur.illust_extra && data_cur.illust_extra.length && data_cur.illust_extra[0] ? true : false

            if (!has_extra_illust && data_cur.illust_delete && data_prev)
                has_extra_illust = data_prev.illust_extra && data_prev.illust_extra.length && data_prev.illust_extra[0] ? true : false
        })

        this.last_item = tr
        this.trIndex++

        this.header_checkbox[header_index].data(
            'ships',
            this.header_checkbox[header_index].data('ships').add(tr)
        )
        tr.data('checkbox', checkbox)

        this.checkbox[ship_data['id']] = checkbox

        function _val(val, show_zero) {
            if (!show_zero && (val == 0 || val == '0'))
                //return '<small class="zero">-</small>'
                return '-'
            if (val == -1 || val == '-1')
                //return '<small class="zero">?</small>'
                return '?'
            return val
        }

        this.columns.forEach(function (currentValue, i) {
            switch (currentValue[1]) {
                case ' ':
                    $('<th/>')
                        .html(
                            //'<img src="../pics/ships/'+ship_data['id']+'/0.jpg"/>'
                            //'<img src="' + _g.path.pics.ships + '/' + ship_data['id']+'/0.webp" contextmenu="disabled"/>'
                            '<a href="?infos=ship&id=' + ship_data['id'] + '"'
                            + (has_extra_illust ? ' icon="hanger"' : '')
                            + '>'
                            + `<img src="../${getFolderGroup('pics-ships', ship_data['id'])}${ship_data['id']}/0.webp" contextmenu="disabled"/>`
                            + '<strong>' + name + '</strong>'
                            + '</a>'
                            + '<em></em>'
                            //+ '<small>' + ship_data['pron'] + '</small>'
                        )
                        .prepend(
                            label
                        )
                        .appendTo(tr)
                    break;
                case 'nightpower':
                    // 航母没有夜战火力
                    var datavalue = /^(9|10|11|32)$/.test(ship_data['type'])
                        ? 0
                        : (parseInt(ship_data['stat']['fire_max'] || 0)
                            + parseInt(ship_data['stat']['torpedo_max'] || 0)
                        )
                    $('<td data-stat="nightpower"/>')
                        .attr(
                            'data-value',
                            datavalue
                        )
                        .html(_val(datavalue))
                        .appendTo(tr)
                    break;
                case 'asw':
                    $('<td data-stat="asw" />')
                        .attr(
                            'data-value',
                            ship_data['stat']['asw_max'] || 0
                        )
                        .html(_val(
                            ship_data['stat']['asw_max'],
                            /^(5|8|9|12|24)$/.test(ship_data['type'])
                        ))
                        .appendTo(tr)
                    break;
                case 'hp':
                    $('<td data-stat="hp" data-value="' + (ship_data['stat']['hp'] || 0) + '"/>')
                        .html(_val(ship_data['stat']['hp']))
                        .appendTo(tr)
                    break;
                case 'carry':
                    $('<td data-stat="carry" data-value="' + (ship_data['stat']['carry'] || 0) + '"/>')
                        .html(_val(ship_data['stat']['carry']))
                        .appendTo(tr)
                    break;
                case 'speed':
                    $('<td data-stat="speed" data-value="' + (ship_data['stat']['speed'] || 0) + '"/>')
                        .html(_g.getStatSpeed(ship_data['stat']['speed']))
                        .appendTo(tr)
                    break;
                case 'range':
                    $('<td data-stat="range" data-value="' + (ship_data['stat']['range'] || 0) + '"/>')
                        .html(_g.getStatRange(ship_data['stat']['range']))
                        .appendTo(tr)
                    break;
                case 'luck':
                    $('<td data-stat="luck" data-value="' + (ship_data['stat']['luck'] || 0) + '"/>')
                        .html(ship_data['stat']['luck'] + '<sup>' + ship_data['stat']['luck_max'] + '</sup>')
                        .appendTo(tr)
                    break;
                case 'consum_fuel':
                    $('<td data-stat="consum_fuel"/>')
                        .attr(
                            'data-value',
                            ship_data['consum']['fuel'] || 0
                        )
                        .html(_val(ship_data['consum']['fuel']))
                        .appendTo(tr)
                    break;
                case 'consum_ammo':
                    $('<td data-stat="consum_ammo"/>')
                        .attr(
                            'data-value',
                            ship_data['consum']['ammo'] || 0
                        )
                        .html(_val(ship_data['consum']['ammo']))
                        .appendTo(tr)
                    break;
                case 'extra_illust':
                    $('<td data-stat="' + currentValue[1] + '" data-value="' + (has_extra_illust ? '1' : '0') + '"/>')
                        .html(
                            has_extra_illust
                                ? '✓'
                                : '<small class="zero">-</small>'
                        )
                        .appendTo(tr)
                    break;
                default:
                    $('<td data-stat="' + currentValue[1] + '"/>')
                        .attr(
                            'data-value',
                            ship_data['stat'][currentValue[1] + '_max'] || 0
                        )
                        .html(_val(ship_data['stat'][currentValue[1] + '_max']))
                        .appendTo(tr)
                    break;
            }
        })

        // 检查数据是否存在 remodel.next
        // 如果 remodel.next 与当前数据 type & name 相同，标记当前为可改造前版本
        if (ship_data.remodel && ship_data.remodel.next
            && _g.data.ships[ship_data.remodel.next]
            && _g.ship_type_order_map[ship_data['type']] == _g.ship_type_order_map[_g.data.ships[ship_data.remodel.next]['type']]
            && ship_data['name']['ja_jp'] == _g.data.ships[ship_data.remodel.next]['name']['ja_jp']
        ) {
            tr.addClass('premodeled')
        }

        return tr
    }

    append_all_items() {
        function _do(i, j) {
            if (_g.data.ship_id_by_type[i]) {
                if (!j) {
                    let data_shiptype
                        , checkbox

                    if (typeof _g.ship_type_order[i] == 'object') {
                        data_shiptype = _g.data.ship_types[_g.ship_type_order[i][0]]
                    } else {
                        data_shiptype = _g.data.ship_types[_g.ship_type_order[i]]
                    }

                    let checkbox_id = Tablelist.genId()

                    this.last_item =
                        $('<tr class="typetitle" data-trindex="' + this.trIndex + '">'
                            + '<th colspan="' + (this.columns.length + 1) + '">'
                            + '<label class="checkbox" for="' + checkbox_id + '">'
                            //+ data_shiptype.name.zh_cn
                            //+ _g.data['ship_type_order'][i+1]['name']['zh_cn']
                            + _g.data['ship_type_order'][i]['name']['zh_cn']
                            //+ ( _g.data['ship_type_order'][i+1]['name']['zh_cn'] == data_shiptype.name.zh_cn
                            + (_g.data['ship_type_order'][i]['name']['zh_cn'] == data_shiptype.name.zh_cn
                                ? ('<small>[' + data_shiptype['code'] + ']</small>')
                                : ''
                            )
                            + '</label></th></tr>')
                            .appendTo(this.dom.tbody)
                    this.trIndex++

                    // 创建空DOM，欺骗flexbox layout排版
                    var k = 0
                    while (k < this.flexgrid_empty_count) {
                        var _index = this.trIndex + _g.data.ship_id_by_type[i].length + k
                        $('<tr class="empty" data-trindex="' + _index + '" data-shipid/>').appendTo(this.dom.tbody)
                        k++
                    }

                    checkbox = $('<input type="checkbox" id="' + checkbox_id + '"/>')
                        //.prop('disabled', _g.data['ship_type_order'][i+1]['donotcompare'] ? true : false)
                        .prop('disabled', _g.data['ship_type_order'][i]['donotcompare'] ? true : false)
                        .on({
                            'change': function () {
                                checkbox.data('ships').filter(':visible').each(function (index, element) {
                                    $(element).data('checkbox').prop('checked', checkbox.prop('checked')).trigger('change', [true])
                                })
                            },
                            'docheck': function () {
                                // ATTR: compare-checked
                                var trs = checkbox.data('ships').filter(':visible')
                                    , checked = trs.filter('[compare-checked=true]')
                                if (!checked.length) {
                                    checkbox.prop({
                                        'checked': false,
                                        'indeterminate': false
                                    })
                                } else if (checked.length < trs.length) {
                                    checkbox.prop({
                                        'checked': false,
                                        'indeterminate': true
                                    })
                                } else {
                                    checkbox.prop({
                                        'checked': true,
                                        'indeterminate': false
                                    })
                                }
                            }
                        })
                        .data('ships', $())
                        .prependTo(this.last_item.find('th'))

                    this.header_checkbox[i] = checkbox

                    //_g.inputIndex++
                }

                this.append_item(_g.data.ships[_g.data.ship_id_by_type[i][j]], i)

                setTimeout(function () {
                    if (j >= _g.data.ship_id_by_type[i].length - 1) {
                        this.trIndex += this.flexgrid_empty_count
                        _do(i + 1, 0)
                    } else {
                        _do(i, j + 1)
                    }
                }.bind(this), 0)
            } else {
                this.mark_high()
                this.thead_redraw()
                _frame.app_main.loaded('tablelist_' + this._index, true)
                //_g.log( this.last_item )
                delete (this.last_item)
                //_g.log( this.last_item )
            }
        }
        _do = _do.bind(this)
        _do(0, 0)
    }

    compare_btn_show(is_checked) {
        if ((!is_checked && this.dom.tbody.find('input[type="checkbox"].compare:checked').length)
            || is_checked
        ) {
            this.dom.msg_container.attr('data-msgs', 'comparestart')
        } else {
            this.dom.msg_container.removeAttr('data-msgs')
        }
    }

    compare_start() {
        // 隐藏底部提示信息
        this.dom.msg_container.removeAttr('data-msgs')

        // 存储当前状态
        this.last_viewtype = this.dom.filter_container.attr('viewtype')
        _config.set('shiplist-viewtype', this.last_viewtype)
        this.last_scrollTop = this.dom.table_container_inner.scrollTop()

        // 更改视图
        this.dom.filter_container.attr('viewtype', 'compare')
        this.dom.table_container_inner.scrollTop(0)
        this.dom.table.addClass('sortable')

        // 计算数据排序排序
        this.mark_high(true)
        this.thead_redraw(500)
    }

    compare_off() {
        this.dom.filter_container.attr('viewtype', this.last_viewtype)
        this.sort_table_restore()
        this.mark_high()
        this.thead_redraw(500)
        this.dom.table_container_inner.scrollTop(this.last_scrollTop)
        this.dom.table.removeClass('sortable')
        delete this.last_viewtype
        delete this.last_scrollTop
    }

    compare_end() {
        this.dom.tbody.find('input[type="checkbox"].compare:checked').prop('checked', false).trigger('change')
        this.dom.msg_container.removeAttr('data-msgs')
        this.compare_off()
    }

    compare_continue() {
        this.dom.msg_container.attr('data-msgs', 'comparestart')
        this.compare_off()
    }

    contextmenu_show($el, shipId) {
        if (this.dom.filter_container.attr('viewtype') == 'compare' || $el.attr('data-donotcompare') == 'true')
            return false

        TablelistShips.contextmenu_curid = shipId || $el.data('shipid')
        TablelistShips.contextmenu_curel = $el

        if (!TablelistShips.contextmenu)
            TablelistShips.contextmenu = new _menu({
                'className': 'contextmenu-ship',
                'items': [
                    $('<menuitem/>').html('选择')
                        .on({
                            'click': function (e) {
                                if (_frame.app_main.is_mode_selection())
                                    _frame.app_main.mode_selection_callback(TablelistShips.contextmenu_curid)
                            },
                            'show': function () {
                                if (_frame.app_main.is_mode_selection())
                                    $(this).show()
                                else
                                    $(this).hide()
                            }
                        }),
                    $('<menuitem/>').html('查看资料')
                        .on({
                            'click': function (e) {
                                TablelistShips.contextmenu_curel.trigger('click', [true])
                            }
                        }),

                    $('<menuitem/>').html('将该舰娘加入对比')
                        .on({
                            'click': function (e) {
                                this.checkbox[TablelistShips.contextmenu_curid]
                                    .prop('checked', !this.checkbox[TablelistShips.contextmenu_curid].prop('checked'))
                                    .trigger('change')
                            }.bind(this),
                            'show': function (e) {
                                if (!TablelistShips.contextmenu_curid)
                                    return false

                                if (_g.data.ship_types[_g['data']['ships'][TablelistShips.contextmenu_curid]['type']]['donotcompare'])
                                    $(e.target).hide()
                                else
                                    $(e.target).show()

                                if (this.checkbox[TablelistShips.contextmenu_curid].prop('checked'))
                                    $(e.target).html('取消对比')
                                else
                                    $(e.target).html('将该舰娘加入对比')
                            }.bind(this)
                        }),

                    $('<div/>').on('show', function (e) {
                        var $div = $(e.target).empty()
                        if (TablelistShips.contextmenu_curid) {
                            var series = _g['data']['ships'][TablelistShips.contextmenu_curid].getSeriesData() || []
                            series.forEach(function (currentValue, i) {
                                if (!i)
                                    $div.append($('<hr/>'))
                                let checkbox = null
                                try {
                                    checkbox = this.checkbox[currentValue['id']]
                                } catch (e) { }
                                $div.append(
                                    $('<div class="item"/>')
                                        .html('<span>' + _g['data']['ships'][currentValue['id']].getName(true) + '</span>')
                                        .append(
                                            $('<div class="group"/>')
                                                .append(function () {
                                                    var els = $()

                                                    if (_frame.app_main.is_mode_selection()) {
                                                        els = els.add(
                                                            $('<menuitem/>')
                                                                .html('选择')
                                                                .on({
                                                                    'click': function () {
                                                                        if (_frame.app_main.is_mode_selection())
                                                                            _frame.app_main.mode_selection_callback(currentValue['id'])
                                                                    }
                                                                })
                                                        )
                                                    }

                                                    return els
                                                })
                                                .append(
                                                    $('<menuitem data-infos="[[SHIP::' + currentValue['id'] + ']]"/>')
                                                        .html('查看资料')
                                                )
                                                .append(
                                                    $('<menuitem/>')
                                                        .html(
                                                            checkbox && checkbox.prop('checked')
                                                                ? '取消对比'
                                                                : '加入对比'
                                                        )
                                                        .on({
                                                            'click': function (e) {
                                                                if (checkbox) {
                                                                    this.checkbox[currentValue['id']]
                                                                        .prop('checked', !checkbox.prop('checked'))
                                                                        .trigger('change')
                                                                }
                                                            }.bind(this)
                                                        })
                                                )
                                        )
                                )
                            }, this)
                        }
                    }.bind(this))
                ]
            })

        TablelistShips.contextmenu.show($el)
    }
}

const startFrom = {
    shipExtra: 811,
    enemies: 1501,
    aokiHagane: 9181
}


_frame.app_main.page['init'].exportpicInit = form => {
    var folder_input = form.find('[name="destfolder"]')
        , btn_browse = form.find('[value="Browse..."]')
        , file_selector = form.find('[type="file"]')
        , export_options = {
            ships: {
                name: 'Ships',
                path: 'pics-ships',
                checked: true
            },
            shipsExtra: {
                name: 'Ships (Extra)',
                path: 'pics-ships-extra',
                checked: true
            },
            enemies: {
                name: 'Enemies',
                path: 'pics-enemies',
                checked: true
            },
            equipments: {
                name: 'Equipments',
                path: 'pics/items',
                checked: true
            },
            entities: {
                name: 'Entities',
                path: 'pics/entities',
                checked: true,
                client: false
            }
        }
        , _export_options = []

    form.on('submit', function (e) {
        e.preventDefault()
        form.addClass('submitting')
        form.find('[type="submit"]').on('click', function (e) {
            e.preventDefault()
        })
        exportpic()
    })

    folder_input
        .val(_config.get('pics_export_to'))
        .on({
            'change': function () {
                _config.set('pics_export_to', $(this).val())
            },
            'click': function () {
                btn_browse.trigger('click')
            }
        })

    btn_browse
        .on('click', function () {
            //console.log(123)
            //form.find('[type="file"]').trigger('click')
        })

    file_selector
        .on('change', function () {
            folder_input.val($(this).val()).trigger('change')
        })


    /*
     * Create options
     */
    let actions = form.find('.actions')
    for (let i in export_options) {
        _export_options.push(i)
    }
    _export_options = _export_options.sort().map(name => {
        return export_options[name]
    })
    _export_options.forEach(item => {
        $(`<input name="enable_${item.name}" type="checkbox" checked />`)
            .on({
                change: e => {
                    item.checked = e.target.checked
                }
            })
            .insertBefore(actions)
            .wrap(`<dl><dt><label></label></dt></dl>`)
            .after($(`<span>${item.name}</span>`))
    })

    const exportpic = () => {
        let dest = node.path.normalize(form.find('[name="destfolder"]').val())
            , paths = {
                client: {
                    // ships: node.path.join(dest, 'client', 'pics', 'ships'),
                    // equipments: node.path.join(dest, 'client', 'pics', 'items')
                },
                web: {
                    // ships: node.path.join(dest, 'web', '!', 'pics', 'ships'),
                    // equipments: node.path.join(dest, 'web', '!', 'pics', 'items'),
                    // entities: node.path.join(dest, 'web', '!', 'pics', 'entities')
                }
            }
            , ship_ids = node.fs.readdirSync('./pics/ships/')
            , item_ids = node.fs.readdirSync('./pics/items/')
            , entities = {}
            , files = []
            , picid_by_shipid = {}
            , promise_chain = Q.fcall(function () { })


        /*
         * join export paths
         */
        for (let i in export_options) {
            let item = export_options[i]
            for (let type in paths) {
                if (item[type] !== false) {
                    paths[type][i] = node.path.join(dest, type, item.path)
                    node.mkdirp.sync(paths[type][i])
                }
            }
        }


        function check_do(file, dest, quality, is_lossless) {
            if (is_exists(file))
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



        function is_exists(file, isDirectory) {
            try {
                let stat = node.fs.lstatSync(file)
                if (stat) {
                    if (!isDirectory && stat.isFile())
                        return true

                    if (isDirectory && stat.isDirectory())
                        return true

                    if (isDirectory && !stat.isDirectory())
                        return false

                    return true
                }
            } catch (e) {
                return false
            }
            return false
        }



        function copyFile_do(source, target, quality, is_lossless) {
            if (!source && !files.length)
                return __log('PIC EXPORT COMPLETE')

            source = source || files[0][0]
            target = target || files[0][1]
            quality = (quality || files[0][2]) || 75
            is_lossless = (is_lossless || files[0][3]) || false

            function cb() {
                copyFile_do()
            }

            if (quality == 'jpg')
                quality = 'jpeg'

            if (quality == 'copy') {
                var cbCalled = false;

                var rd = node.fs.createReadStream(source);
                rd.on("error", function (err) {
                    done(err);
                });

                var wr = node.fs.createWriteStream(target);
                wr.on("error", function (err) {
                    done(err);
                });
                wr.on("close", function (ex) {
                    done();
                });

                rd.pipe(wr);

                const done = (err) => {
                    if (err)
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
            } else if (quality == 'mask') {
                let target_mask_1 = node.path.parse(target)
                target_mask_1 = node.path.join(target_mask_1.dir, target_mask_1.name + '-mask-' + is_lossless + target_mask_1.ext)
                let mask = node.path.join(_g.root, './source/mask/mask-' + is_lossless + '.png')
                let exec = require('child_process').exec

                let gmComposite = 'gm composite -compose in "' + source + '" ' + mask + ' ' + target_mask_1

                exec(gmComposite, function (err) {
                    if (err) {
                        __log(err)
                        throw err
                    }
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
            } else if (quality == 'entity-resize') {
                let target_mask_1 = node.path.parse(target)
                target_mask_1 = node.path.join(target_mask_1.dir, target_mask_1.name + target_mask_1.ext)
                let mask = node.path.join(_g.root, './source/mask/mask-0.png')
                let exec = require('child_process').exec

                let gmComposite = 'gm composite -geometry 90x90+35-17 -compose in "' + source + '" ' + mask + ' ' + target_mask_1

                exec(gmComposite, function (err) {
                    if (err) throw err
                    __log(
                        'pic file copied to ' + target_mask_1 + ' (mask-' + is_lossless + ')'
                    )
                    files.shift()
                    cb();
                })
            } else if (quality == 'entity-resize-mask') {
                let target_mask_1 = node.path.parse(target)
                target_mask_1 = node.path.join(target_mask_1.dir, target_mask_1.name + '-mask-' + is_lossless + target_mask_1.ext)
                let mask = node.path.join(_g.root, './source/mask/mask-entity-' + is_lossless + '.png')
                let exec = require('child_process').exec

                let gmComposite = 'gm composite -geometry 90x90+35-16 -compose in "' + source + '" ' + mask + ' ' + target_mask_1

                exec(gmComposite, function (err) {
                    if (err) throw err
                    __log(
                        'pic file copied to ' + target_mask_1 + ' (mask-' + is_lossless + ')'
                    )
                    files.shift()
                    cb();
                })
            } else if (quality == 'jpeg') {
                let exec = require('child_process').exec
                    , q = is_lossless || 75
                    , gmComposite = `gm convert -quality ${q} "${source}" "${target}"`

                exec(gmComposite, function (err) {
                    if (err) throw err
                    __log(
                        'pic file copied to ' + target
                    )
                    files.shift()
                    cb();
                })
            } else {
                //var cmd = (source + ' -lossless -q 100 -o ' + target).split(/\s+/)
                let cmd = (source + (is_lossless ? ' -lossless' : '') + ' -q ' + quality + ' -o ' + target).split(/\s+/)
                    , execFile = require('child_process').execFile
                    , binPath = require('webp-bin').path
                //var cmd = (source + ' -q 85 -o ' + target).split(/\s+/)
                execFile(binPath, cmd, function (err, stdout, stderr) {
                    if (!err) {
                        __log(
                            'pic file copied to ' + target
                        )
                        files.shift()
                        cb();
                    } else {
                        console.log(err)
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
            .then(function () {
                let deferred = Q.defer()
                _db.ship_series.find({}, function (err, docs) {
                    for (var i in docs) {
                        var ships = docs[i].ships || []
                        for (var j in ships) {
                            if (!parseInt(ships[j]['id'])
                                || (parseInt(ships[j]['id']) < startFrom.shipExtra || parseInt(ships[j]['id']) > 9000)
                            ) {
                                picid_by_shipid[ships[j]['id']] = []
                                picid_by_shipid[ships[j]['id']].push(['0.png', '0.webp', 90])
                                if (!ships[j]['illust_delete']) {
                                    picid_by_shipid[ships[j]['id']].push(['8.png', '8.webp', 85])
                                    picid_by_shipid[ships[j]['id']].push(['9.png', '9.webp', 85])
                                    picid_by_shipid[ships[j]['id']].push(['10.png', '10.webp', 75])
                                }
                                var extra = ships[j]['illust_extra'] || []
                                for (var l in extra) {
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
            .then(function (picid_by_shipid) {
                for (let i in ship_ids) {
                    /*
                     * check id type: ships, ships-extra, enemies
                     */
                    let type = 'ships'
                        , id = ship_ids[i]
                        , pathId = `/${id}`

                    if (isNaN(id)) {
                        var match = /^extra_([0-9]+)$/.exec(id)
                        if (match && match.length > 1) {
                            if (!export_options.shipsExtra.checked)
                                continue;
                            type = 'shipsExtra'
                            pathId = `/${match[1]}`
                        }
                    } else {
                        id = parseInt(id)
                        if (id >= startFrom.enemies && id < startFrom.aokiHagane) {
                            if (!export_options.enemies.checked)
                                continue;
                            type = 'enemies'
                        }
                    }
                    if (type == 'ships' && !export_options.ships.checked)
                        continue;
                    // secure path
                    for (let i in paths) {
                        node.mkdirp.sync(node.path.join(paths[i][type], pathId))
                    }

                    var arr = picid_by_shipid[id] || null
                    if (!arr) {
                        arr = []
                        arr.push(['0.png', '0.webp', 90])
                        arr.push(['8.png', '8.webp', 85])
                        arr.push(['9.png', '9.webp', 85])
                        arr.push(['10.png', '10.webp', 75])
                    }
                    for (var j in arr) {
                        check_do(
                            './pics/ships/' + id + '/' + arr[j][0],
                            node.path.join(paths.client[type], pathId, arr[j][1]),
                            arr[j][2]
                        )
                        check_do(
                            './pics/ships/' + id + '/' + arr[j][0],
                            node.path.join(paths.web[type], pathId, arr[j][1]),
                            arr[j][2]
                        )
                        check_do(
                            './pics/ships/' + id + '/' + arr[j][0],
                            node.path.join(paths.web[type], pathId, arr[j][0]),
                            'copy'
                        )
                    }

                    // apply mask for web version
                    check_do(
                        './pics/ships/' + id + '/' + '0.png',
                        node.path.join(paths.web[type], pathId, '0.png'),
                        'mask',
                        1
                    )
                    check_do(
                        './pics/ships/' + id + '/' + '0.png',
                        node.path.join(paths.web[type], pathId, '0.png'),
                        'mask',
                        2
                    )

                    // ship card
                    if (is_exists('./pics/ships/' + id + '/2.jpg')) {
                        check_do(
                            './pics/ships/' + id + '/2.jpg',
                            node.path.join(paths.web[type], pathId, '2.jpg'),
                            'copy'
                        )
                    } else {
                        check_do(
                            './pics/ships/' + id + '/2.png',
                            node.path.join(paths.web[type], pathId, '2.jpg'),
                            'jpeg',
                            81
                        )
                    }

                    // ship illustrations lossless webp for web version
                    /*
                        check_do(
                            './pics/ships/' + id + '/' + '8.png',
                            node.path.join( paths.web.ships, pathId, '8.webp' ),
                            'webp',
                            true
                        )
                        check_do(
                            './pics/ships/' + id + '/' + '9.png',
                            node.path.join( paths.web.ships, pathId, '9.webp' ),
                            'webp',
                            true
                        )
                        check_do(
                            './pics/ships/' + id + '/' + '10.png',
                            node.path.join( paths.web.ships, pathId, '10.webp' ),
                            'webp',
                            true
                        )
                    */
                }
                if (export_options.equipments.checked) {
                    for (let i in item_ids) {
                        for (let _i in paths) {
                            node.mkdirp.sync(node.path.join(paths[_i].equipments, `/${item_ids[i]}`))
                        }
                        check_do(
                            './pics/items/' + item_ids[i] + '/card.png',
                            node.path.join(paths.client.equipments, `/${item_ids[i]}`, 'card.webp'),
                            80
                        )
                        check_do(
                            './pics/items/' + item_ids[i] + '/card.png',
                            node.path.join(paths.web.equipments, `/${item_ids[i]}`, 'card.png'),
                            'copy'
                        )
                    }
                }
                return files
            })

            // 遍历_db.entities
            .then(function () {
                if (!export_options.entities.checked)
                    return true;
                let deferred = Q.defer()
                _db.entities.find({}, function (err, docs) {
                    docs.forEach(function (d) {
                        entities[d.id] = new Entity(d)
                        node.mkdirp.sync(node.path.join(paths.web.entities, `/${d.id}`))
                        check_do(
                            './pics/entities/' + entities[d.id].getName('ja_jp') + '.jpg',
                            node.path.join(paths.web.entities, `/${d.id}`, '0.png'),
                            'entity-resize'
                        )
                        check_do(
                            './pics/entities/' + entities[d.id].getName('ja_jp') + '.jpg',
                            node.path.join(paths.web.entities, `/${d.id}`, '0.png'),
                            'entity-resize-mask',
                            1
                        )
                        check_do(
                            './pics/entities/' + entities[d.id].getName('ja_jp') + '.jpg',
                            node.path.join(paths.web.entities, `/${d.id}`, '0.png'),
                            'entity-resize-mask',
                            2
                        )
                        check_do(
                            './pics/entities/' + entities[d.id].getName('ja_jp') + '.jpg',
                            node.path.join(paths.web.entities, `/${d.id}`, '2.jpg'),
                            'copy'
                        )
                    })
                    deferred.resolve(entities)
                })
                return deferred.promise
            })

            // webp
            .then(function () {
                console.log(files)
                return copyFile_do()
            })
            .catch(function (err) {
                console.log(err)
            })

        return true
    }
}


_frame.app_main.page['ships'] = {}
_frame.app_main.page['ships'].section = {}


_frame.app_main.page['ships'].gen_table = function (/*d*/) {
    var table = $('<table/>')
    return table
}

_frame.app_main.page['ships'].gen_input = function (type, name, id, value, options) {
    options = options || {}
    let input, option_empty
    switch (type) {
        case 'text':
        case 'number':
        case 'hidden':
            input = $('<input/>', {
                'type': type,
                'name': name,
                'id': id
            }).val(value)
            break;
        case 'select':
            input = $('<select/>', {
                'name': name,
                'id': id
            })
            option_empty = $('<option value=""/>').html('').appendTo(input)
            for (var i in value) {
                let o_el
                if (typeof value[i] == 'object') {
                    o_el = $('<option value="' + (typeof value[i].val == 'undefined' ? value[i]['value'] : value[i].val) + '"/>')
                        .html(value[i]['title'] || value[i]['name'])
                        .appendTo(input)
                } else {
                    o_el = $('<option value="' + value[i] + '"/>')
                        .html(value[i])
                        .appendTo(input)
                }
                if (typeof options['default'] != 'undefined' && o_el.val() == options['default']) {
                    o_el.prop('selected', true)
                }
                if (!o_el.val()) {
                    o_el.attr('disabled', true)
                }
            }
            if (!value || !value.length) {
                option_empty.remove()
                $('<option value=""/>').html('...').appendTo(input)
            }
            if (options['new']) {
                $('<option value="" disabled/>').html('==========').insertAfter(option_empty)
                $('<option value="___new___"/>').html('+ 新建').insertAfter(option_empty)
                input.on('change.___new___', function () {
                    var select = $(this)
                    if (select.val() == '___new___') {
                        select.val('')
                        options['new'](input)
                    }
                })
            }
            break;
        case 'select_group':
            input = $('<select />', {
                'name': name,
                'id': id
            })
            option_empty = $('<option value=""/>').html('').appendTo(input)
            for (let i in value) {
                var group = $('<optgroup label="' + value[i][0] + '"/>').appendTo(input)
                for (var j in value[i][1]) {
                    var _v = value[i][1][j]
                    let o_el
                    if (typeof _v == 'object') {
                        o_el = $('<option value="' + (typeof _v.val == 'undefined' ? _v['value'] : _v.val) + '"/>')
                            .html(_v['title'] || _v['name'])
                            .appendTo(group)
                    } else {
                        o_el = $('<option value="' + _v + '"/>')
                            .html(_v)
                            .appendTo(group)
                    }
                    if (typeof options['default'] != 'undefined' && o_el.val() == options['default']) {
                        o_el.prop('selected', true)
                    }
                    if (!o_el.val()) {
                        o_el.attr('disabled', true)
                    }
                }
            }
            if (!value || !value.length) {
                option_empty.remove()
                $('<option value=""/>').html('...').appendTo(input)
            }
            if (options['new']) {
                $('<option value="" disabled/>').html('==========').insertAfter(option_empty)
                $('<option value="___new___"/>').html('+ 新建').insertAfter(option_empty)
                input.on('change.___new___', function () {
                    var select = $(this)
                    if (select.val() == '___new___') {
                        select.val('')
                        options['new'](input)
                    }
                })
            }
            break;
        case 'checkbox':
            input = $('<input/>', {
                'type': type,
                'name': name,
                'id': id
            }).prop('checked', value)
            break;
    }

    if (options.required) {
        input.prop('required', true)
    }

    if (options.onchange) {
        input.on('change.___onchange___', function () {
            options.onchange($(this))
        })
        if (options['default'])
            input.trigger('change')
    }

    if (!name)
        input.attr('name', null)

    return input
}
_frame.app_main.page['ships'].gen_form_line = function (type, name, label, value, suffix, options) {
    var line = $('<p/>')
        , id = '_input_g' + _g.inputIndex

    $('<label for="' + id + '"/>').html(label).appendTo(line)
    _frame.app_main.page['ships'].gen_input(type, name, id, value, options).appendTo(line)
    if (suffix)
        $('<label for="' + id + '"/>').html(suffix).appendTo(line)

    _g.inputIndex++
    return line
}







_frame.app_main.page['ships'].show_ship_form = function (d) {
    d.remodel = d.remodel || {}
    d.rels = d.rels || {}
    d.slot = d.slot || []
    d.equip = d.equip || []
    d.remodel_next = d.remodel.next || null

    let d_series = {}

    console.log(d)

    const _input = function (name, label, suffix, options) {
        return _frame.app_main.page['ships'].gen_form_line(
            'text', name, label, eval('d.' + name) || '', suffix, options
        )
    }

    const _stat = function (stat, label) {
        const line = $('<p/>')
        let id = '_input_g' + _g.inputIndex
        let input
        _g.inputIndex++

        switch (stat) {
            case 'consum': {
                $('<label for="' + id + '"/>').html('燃料').appendTo(line)
                input = _frame.app_main.page['ships'].gen_input(
                    'number',
                    'consum.fuel',
                    id,
                    d.consum.fuel
                ).appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '"/>').html('弹药').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'consum.ammo',
                    id,
                    d.consum.ammo
                ).appendTo(line)
                break;
            }
            case 'speed': {
                const value = d.stat[stat]

                $('<label for="' + id + '"/>').html(label).appendTo(line)
                input = _frame.app_main.page['ships'].gen_input(
                    'select',
                    'stat.' + stat,
                    id,
                    [
                        {
                            'value': '5',
                            'title': '低速'
                        },
                        {
                            'value': '10',
                            'title': '高速'
                        }
                    ],
                    {
                        'default': value
                    }
                ).appendTo(line)
                $('<label for="' + id + '"/>').html('当前值: ' + value).appendTo(line)
                break;
            }
            case 'range': {
                var value = d.stat[stat]

                $('<label for="' + id + '"/>').html(label).appendTo(line)
                input = _frame.app_main.page['ships'].gen_input(
                    'select',
                    'stat.' + stat,
                    id,
                    [
                        {
                            'value': '1',
                            'title': '短'
                        },
                        {
                            'value': '2',
                            'title': '中'
                        },
                        {
                            'value': '3',
                            'title': '长'
                        },
                        {
                            'value': '4',
                            'title': '超长'
                        }
                    ],
                    {
                        'default': value
                    }
                ).appendTo(line)
                $('<label for="' + id + '"/>').html('当前值: ' + value).appendTo(line)
                break;
            }
            default: {
                const value = d.stat[stat]

                $('<label for="' + id + '"/>').html(label).appendTo(line)
                input = _frame.app_main.page['ships'].gen_input(
                    'number',
                    'stat.' + stat,
                    id,
                    value
                ).appendTo(line)

                if (stat == 'carry')
                    input.prop('readonly', true)

                if (stat == 'carry') {
                    $('<label for="' + id + '"/>').html('在“装备”页修改').appendTo(line)
                } else {
                    id = '_input_g' + _g.inputIndex
                    _g.inputIndex++
                    $('<label for="' + id + '"/>').html('最大').appendTo(line)
                    _frame.app_main.page['ships'].gen_input(
                        'number',
                        'stat.' + stat + '_max',
                        id,
                        d.stat[stat + '_max']
                    ).appendTo(line)
                }
                /*
                if( typeof d.stat[stat+'_max'] != 'undefined' ){
                    id = '_input_g' + _g.inputIndex
                    _g.inputIndex++
                    $('<label for="'+id+'"/>').html( '最大' ).appendTo(line)
                    _frame.app_main.page['ships'].gen_input(
                            'number',
                            'stat.'+stat+'_max',
                            id,
                            d.stat[stat+'_max']
                        ).appendTo(line)
                }else if( typeof d.stat[stat+'_married'] != 'undefined' ){
                    id = '_input_g' + _g.inputIndex
                    _g.inputIndex++
                    $('<label for="'+id+'"/>').html( '婚后' ).appendTo(line)
                    _frame.app_main.page['ships'].gen_input(
                            'text',
                            'stat.'+stat+'_married',
                            id,
                            d.stat[stat+'_married']
                        ).appendTo(line)
                }else if( stat == 'carry' ){
                    $('<label for="'+id+'"/>').html( '在“装备”页修改' ).appendTo(line)
                }
                */
                break;
            }
        }

        return line
    }

    const _slot = function (no, carry, equip) {
        const equipmentId = equip && typeof equip === 'object' ? equip.id : equip
        const equipmentStar = equip && typeof equip === 'object' ? equip.star : undefined

        const line = $('<p/>')
        let id = '_input_g' + _g.inputIndex

        _g.inputIndex++

        $('<label for="' + id + '"/>').html('#<span>' + no + '</span> 搭载').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'number',
            'slot',
            id,
            carry
        ).on({
            // 'change, input': function () {
            //     let total = 0
            //     details_slot.find('input[name="slot"]').each(function () {
            //         total += parseInt($(this).val())
            //     })
            // }
        }).appendTo(line)

        id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<label for="' + id + '"/>').html('初始装备').appendTo(line)
        _comp.selector_equipment(
            'equip',
            '',
            equipmentId
        ).appendTo(line)

        id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<label for="' + id + '"/>').html('★').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'number',
            'slot-equipment-star',
            id,
            equipmentStar
        ).appendTo(line)
        /*
        _frame.app_main.page['ships'].gen_input(
                'number',
                'equip',
                id,
                equip,
                {
                    'notRequired': true
                }
            ).appendTo(line)*/

        // 删除本行搭载信息
        $('<button type="button" class="delete"/>').html('&times;').on('click', function () {
            line.remove()
            details_slot.find('input[name="slot"]').each(function (index) {
                $(this).parent().find('label span').eq(0).html((index + 1))
            })
        }).appendTo(line)

        return line
    }

    const _link = function (no, name, url) {
        var line = $('<p/>')
            , id = '_input_g' + _g.inputIndex
        _g.inputIndex++

        $('<label for="' + id + '"/>').appendTo(line)
        //$('<label for="'+id+'"/>').html( '#<span>' + no + '</span>' ).appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'text',
            'link_name',
            id,
            name,
            { 'notRequired': true }
        ).appendTo(line)

        id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<label for="' + id + '"/>').html('URL').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'text',
            'link_url',
            id,
            url,
            { 'notRequired': true }
        ).appendTo(line)

        // 删除本行搭载信息
        /*
        $('<button type="button" class="delete"/>').html('&times;').on('click', function(){
            line.remove()
            details_misc.find('input[name="link_name"]').each(function(index){
                $(this).parent().find('label span').eq(0).html( (index+1) )
            })
        }).appendTo(line)
        */

        return line
    }

    const _series = function (stat, extra_illust_no) {
        let line = $('<p/>')
        let id = '_input_g' + _g.inputIndex
        // let input
        _g.inputIndex++

        switch (stat) {
            case 'remodel': {
                $('<label for="' + id + '" class="remodel"/>').html('改造前ID').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'series.remodel_prev',
                    id,
                    d_series.remodel_prev || null,
                    { 'notRequired': true }
                ).appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '"/>').html('等级').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'series.remodel_prev_lvl',
                    id,
                    d_series.remodel_prev_lvl || null,
                    { 'notRequired': true }
                ).appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_prev_blueprint',
                    id,
                    d_series.remodel_prev_blueprint || false,
                    { 'notRequired': true }
                ).appendTo(line)
                $('<label for="' + id + '"/>').html('蓝图').appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_prev_catapult',
                    id,
                    d_series.remodel_prev_catapult || false,
                    { 'notRequired': true }
                ).appendTo(line)
                $('<label for="' + id + '"/>').html('甲板').appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_prev_loop',
                    id,
                    d_series.remodel_prev_loop || false,
                    { 'notRequired': true }
                ).appendTo(line)
                $('<label for="' + id + '"/>').html('循环').appendTo(line)

                var line2 = $('<p/>')

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '" class="remodel"/>').html('改造后ID').appendTo(line2)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'series.remodel_next',
                    id,
                    d_series.remodel_next || null,
                    { 'notRequired': true }
                ).appendTo(line2)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '"/>').html('等级').appendTo(line2)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'series.remodel_next_lvl',
                    id,
                    d_series.remodel_next_lvl || null,
                    { 'notRequired': true }
                ).appendTo(line2)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_next_blueprint',
                    id,
                    d_series.remodel_next_blueprint || false,
                    { 'notRequired': true }
                ).appendTo(line2)
                $('<label for="' + id + '"/>').html('蓝图').appendTo(line2)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_next_catapult',
                    id,
                    d_series.remodel_next_catapult || false,
                    { 'notRequired': true }
                ).appendTo(line2)
                $('<label for="' + id + '"/>').html('甲板').appendTo(line2)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.remodel_next_loop',
                    id,
                    d_series.remodel_next_loop || false,
                    { 'notRequired': true }
                ).appendTo(line2)
                $('<label for="' + id + '"/>').html('循环').appendTo(line2)

                // 基础等级
                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                _frame.app_main.page['ships'].gen_input(
                    'hidden',
                    'base_lvl',
                    id,
                    d_series.remodel_prev_lvl || 1,
                    { 'notRequired': true }
                ).appendTo(line2)

                line = line.add(line2)
                break;
            }
            case 'illust_delete': {
                _frame.app_main.page['ships'].gen_input(
                    'checkbox',
                    'series.illust_delete',
                    id,
                    d_series.illust_delete || false,
                    { 'notRequired': true }
                ).addClass('delete_illust').appendTo(line)
                $('<label for="' + id + '"/>').html('删除该舰娘图鉴大图').appendTo(line)
                break;
            }
            case 'illust_extra': {
                const no = extra_illust_no ? (parseInt(extra_illust_no) + 1) : 1
                $('<label for="' + id + '" class="extra_illust"/>').html('额外图鉴#' + no + ' extra_').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'series.illust_extra',
                    id,
                    d_series.illust_extra[extra_illust_no ? extra_illust_no : 0] || null,
                    { 'notRequired': true }
                ).appendTo(line)
                break;
            }
        }

        return line
    }

    var form = $('<form class="shipinfo new"/>')

        , base = $('<div class="base"/>').appendTo(form)
        , details = $('<div class="tabview"/>').appendTo(form)

        // 如果有 _id 则表明已存在数据，当前为编辑操作，否则为新建操作
        , _id = d._id ? $('<input type="hidden"/>').val(d._id) : null

        , details_stat = $('<section data-tabname="属性"/>').appendTo(details)
        , details_slot = $('<section data-tabname="装备"/>').appendTo(details)
        , details_misc = $('<section data-tabname="其他"/>').appendTo(details)
        , details_series = $('<section data-tabname="系列"/>').appendTo(details)
        , details_extra = $('<section data-tabname="额外"/>').appendTo(details);

    let base_class_select,
        d_series_true,
        d_series_true_index;

    // 标准图鉴
    $('<div class="image"/>').css('background-image', 'url(../pics/ships/' + d['id'] + '/2.png)').appendTo(base);

    // 基础信息
    (() => {
        _input('id', 'ID', null, { 'required': true }).appendTo(base)
        _input('no', '图鉴ID', null, { 'required': true }).appendTo(base)
        var h4 = $('<h4/>').html('舰娘名').appendTo(base)
        var checkbox_id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        var _checkbox = _frame.app_main.page['ships'].gen_input(
            'checkbox',
            null,
            checkbox_id,
            false,
            {
                'onchange': function (checkbox) {
                    if (checkbox.prop('checked')) {
                        base.find('input[name^="name."]').not('input[name="name.suffix"]').prop('required', false)
                        base.find('select[name="name.suffix"]').prop('required', true)
                    } else {
                        base.find('input[name^="name."]').not('input[name="name.suffix"]').prop('required', true)
                        base.find('select[name="name.suffix"]').prop('required', false)
                    }
                }
            }
        ).insertBefore(h4)
        $('<label for="' + checkbox_id + '" class="name_suffix"/>').html('仅后缀').insertBefore(_checkbox)
        _input('name.ja_jp', '<small>日</small>').appendTo(base)
        _input('name.ja_kana', '<small>日假名</small>').appendTo(base)
        _input('name.ja_romaji', '<small>罗马音</small>').appendTo(base)
        _input('name.zh_cn', '<small>简中</small>').appendTo(base)
        _input('name.en_us', '<small>EN</small>').appendTo(base)
        var base_suffix = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'name.suffix',
            '后缀名',
            [],
            null,
            {
                'notRequired': true
            }
        ).appendTo(base)
        _db.ship_namesuffix.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err) {
                var suffix = []
                    , sel = base_suffix.find('select')
                for (var i in docs) {
                    suffix.push({
                        //'value': 	docs[i]['_id'],
                        'value': docs[i]['id'],
                        'title': docs[i]['zh_cn']
                    })
                }
                // 实时载入舰种数据
                _frame.app_main.page['ships'].gen_input(
                    'select',
                    sel.attr('name'),
                    sel.attr('id'),
                    suffix,
                    {
                        'default': d['name']['suffix'],
                        'notRequired': true,
                        'new': function (select) {
                            console.log('NEW SHIP SUFFIX', select)
                        },
                    }).insertBefore(sel)
                sel.remove()
            }
        })
    })();

    // 属性
    (() => {
        _stat('fire', '火力').appendTo(details_stat)
        _stat('torpedo', '雷装').appendTo(details_stat)
        _stat('aa', '对空').appendTo(details_stat)
        _stat('asw', '对潜').appendTo(details_stat)

        _stat('hp', '耐久').appendTo(details_stat)
        _stat('armor', '装甲').appendTo(details_stat)
        _stat('evasion', '回避').appendTo(details_stat)
        _stat('carry', '搭载').appendTo(details_stat)

        _stat('speed', '速力').appendTo(details_stat)
        _stat('range', '射程').appendTo(details_stat)
        _stat('los', '索敌').appendTo(details_stat)
        _stat('luck', '　运').appendTo(details_stat)

        $('<h4/>').html('消耗').appendTo(details_stat)
        _stat('consum').appendTo(details_stat)
    })();

    // 装备
    (() => {
        for (var i = 0; i < Math.max(d['slot'].length, d['equip'].length); i++) {
            _slot(
                (i + 1),
                d['slot'][i] || 0,
                d['equip'][i] || null
            ).appendTo(details_slot)
        }
        var btn_add_slot = $('<button class="add" type="button"/>').on('click', function () {
            _slot(
                details_slot.find('input[name="slot"]').length + 1,
                0,
                null
            ).insertBefore(btn_add_slot)
        }).html('添加栏位').appendTo(details_slot)
    })();

    // 其他
    // 声优
    (() => {
        var _misc_cv = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'rels.cv',
            '声优',
            []
        ).appendTo(details_misc)
        _db['entities'].find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err) {
                var types = []
                    , sel = _misc_cv.find('select')
                for (var i in docs) {
                    types.push({
                        //'value': 	docs[i]['_id'],
                        'value': docs[i]['id'],
                        'title': docs[i]['name']['zh_cn']
                    })
                }
                // 实时载入舰种数据
                _frame.app_main.page['ships'].gen_input(
                    'select',
                    sel.attr('name'),
                    sel.attr('id'),
                    types,
                    {
                        'default': d['rels']['cv'],
                        'new': function (select) {
                            console.log('NEW ENTITY', select)
                        }
                    }).insertBefore(sel)
                sel.remove()
            }
        })
    })();

    // 画师
    (() => {
        var _misc_illustrator = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'rels.illustrator',
            '画师',
            []
        ).appendTo(details_misc)
        _db['entities'].find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err) {
                var types = []
                    , sel = _misc_illustrator.find('select')
                for (var i in docs) {
                    types.push({
                        //'value': 	docs[i]['_id'],
                        'value': docs[i]['id'],
                        'title': docs[i]['name']['zh_cn']
                    })
                }
                // 实时载入舰种数据
                _frame.app_main.page['ships'].gen_input(
                    'select',
                    sel.attr('name'),
                    sel.attr('id'),
                    types,
                    {
                        'default': d['rels']['illustrator'],
                        'new': function (select) {
                            console.log('NEW ENTITY', select)
                        }
                    }).insertBefore(sel)
                sel.remove()
            }
        })
    })();

    $('<h4/>').html('舰种&舰级').appendTo(details_misc);
    // 舰种
    (() => {
        var base_type = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'type',
            '舰种',
            []
        ).appendTo(details_misc)
        _db.ship_types.find({}).sort({ 'code': 1, 'full': 1 }).exec(function (err, docs) {
            if (!err) {
                var types = []
                    , sel = base_type.find('select')
                for (var i in docs) {
                    types.push({
                        //'value': 	docs[i]['_id'],
                        'value': docs[i]['id'],
                        'title': '[' + docs[i]['code'] + '] ' + docs[i].name.zh_cn
                    })
                }
                // 实时载入舰种数据
                _frame.app_main.page['ships'].gen_input(
                    'select',
                    sel.attr('name'),
                    sel.attr('id'),
                    types,
                    {
                        'default': d['type'],
                        'new': function (select) {
                            console.log('NEW SHIP TYPE', select)
                        },
                        // 改变舰种后，实时读取舰级数据
                        'onchange': function (select) {
                            base_class_select.html('<option value=""/>...</option>')
                            _db.ship_classes.find({
                                'ship_type_id': parseInt(select.val())
                            }, function (err_classes, docs_classes) {
                                if (!err_classes) {
                                    var classes = []
                                        , _sel = base_class_select
                                    for (var j in docs_classes) {
                                        classes.push({
                                            //'value': 	docs_classes[j]['_id'],
                                            'value': docs_classes[j]['id'],
                                            'title': docs_classes[j].name.zh_cn + '级'
                                        })
                                    }
                                    if (!docs_classes || !docs_classes.length) {
                                        classes.push({
                                            'value': '',
                                            'title': ''
                                        })
                                    }
                                    base_class_select = _frame.app_main.page['ships'].gen_input(
                                        'select',
                                        _sel.attr('name'),
                                        _sel.attr('id'),
                                        classes,
                                        {
                                            'new': function (select) {
                                                console.log('NEW SHIP CLASS', select)
                                            }
                                        }).insertBefore(_sel)
                                    _sel.remove()

                                    if (d['type'] && base_type.find('select').val() == d['type']) {
                                        base_class_select.val(d['class'])
                                    }
                                }
                            })
                        }
                    }).insertBefore(sel)
                sel.remove()
            }
        })
    })();

    // 舰级
    (() => {
        var base_class = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'class',
            '舰级',
            []
        ).appendTo(details_misc)
        base_class_select = base_class.find('select')
        _input('class_no', '编号', '号舰').appendTo(details_misc)
    })();

    // 军籍
    (() => {
        const lineNavy = $('<p/>').appendTo(details_misc)
            , idNavy = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<label for="' + idNavy + '"/>').html('军籍').appendTo(lineNavy)
        _frame.app_main.page['ships'].gen_input(
            'select',
            'navy',
            idNavy,
            [
                {
                    'value': 'km',
                    'title': '纳粹德国海军 / 战争海军 (Kriegsmarine)'
                },
                {
                    'value': 'rm',
                    'title': '意大利皇家海军 (Regia Marina)'
                },
                {
                    'value': 'mn',
                    'title': '法国海军 (Marine nationale)'
                },
                {
                    'value': 'rn',
                    'title': '英国皇家海军 (Royal Navy)'
                },
                {
                    'value': 'usn',
                    'title': '美国海军 (United States Navy)'
                },
                {
                    'value': 'vmf',
                    'title': '苏联海军 (Военно-морской флот СССР)'
                }
            ],
            {
                'default': d.navy
            }
        ).appendTo(lineNavy)
    })();

    // 链接
    (() => {
        _form.section_order(
            '链接',
            function (data, index) {
                return _link(index + 1, data['name'] || null, data['url'] || null)
            },
            $.extend(true,
                [
                    {
                        'name': '日文WIKI',
                        'url': null
                    },
                    {
                        'name': '英文WIKI',
                        'url': null
                    }
                ],
                d['links']
            )
        ).appendTo(details_misc)
    })();
    /*
        $('<h4/>').html('链接').appendTo(details_misc)
        var link_defaults = [
            '日文WIKI',
            '英文WIKI'
        ]
            ,_links_exists = parseInt( d['links'] ? d['links'].length : 0 )
        for( var i in d['links'] ){
            _link((parseInt(i)+1), d['links'][i]['name'], d['links'][i]['url']).appendTo(details_misc)
            if( $.inArray(d['links'][i]['name'], link_defaults) > -1 )
                link_defaults.splice( $.inArray(d['links'][i]['name'], link_defaults), 1 )
        }
        for( var i in link_defaults ){
            _link((_links_exists + parseInt(i) +1), link_defaults[i], '').appendTo(details_misc)
        }
        var btn_add_link = $('<button class="add" type="button"/>').on('click', function(){
            _link(
                details_misc.find('input[name="link_name"]').length + 1,
                '',
                ''
            ).insertBefore(btn_add_link)
        }).html('添加链接').appendTo(details_misc)
    */

    // 系列
    (() => {
        d_series = {
            'illust_extra': []
        }
        // let d_series_true = null
        // let d_series_true_index = null
        _db.ship_series.find({ 'id': d['series'] }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                d_series_true = docs[0]
                for (var i in docs[0].ships) {
                    var index = parseInt(i)
                    if (d['id'] == docs[0].ships[index]['id']) {
                        d_series_true_index = index
                        if (index > 0) {
                            d_series.remodel_prev = docs[0].ships[index - 1]['id'] || null
                            d_series.remodel_prev_lvl = docs[0].ships[index - 1]['next_lvl'] || null
                            d_series.remodel_prev_blueprint = docs[0].ships[index - 1]['next_blueprint'] || false
                            d_series.remodel_prev_catapult = docs[0].ships[index - 1]['next_catapult'] || false
                            d_series.remodel_prev_loop = docs[0].ships[index - 1]['next_loop'] || false
                        }
                        if (docs[0].ships[index + 1]) {
                            d_series.remodel_next = docs[0].ships[index + 1]['id'] || null
                            d.remodel_next = d.remodel_next || (docs[0].ships[index + 1]['id'] || null)
                        }
                        d_series.remodel_next_lvl = docs[0].ships[index]['next_lvl'] || null
                        if (d.remodel.next) {
                            d_series.remodel_next = parseInt(d.remodel.next) || null
                        }
                        if (d.remodel.next_lvl) {
                            d_series.remodel_next_lvl = parseInt(d.remodel.next_lvl) || null
                        }
                        d_series.remodel_next_blueprint = docs[0].ships[index]['next_blueprint'] || false
                        d_series.remodel_next_catapult = docs[0].ships[index]['next_catapult'] || false
                        d_series.remodel_next_loop = docs[0].ships[index]['next_loop'] || false
                        d_series.illust_delete = docs[0].ships[index]['illust_delete'] || false
                        d_series.illust_extra = docs[0].ships[index]['illust_extra'] || []
                        break
                    }
                }
                if (!d_series.remodel_prev) {
                    d_series.remodel_prev = parseInt(d.remodel.prev) || null
                    d_series.remodel_prev_lvl = parseInt(d.remodel.prev_lvl) || null
                    d_series.remodel_prev_blueprint = d.remodel.prev_blueprint || false
                    d_series.remodel_prev_catapult = d.remodel.prev_catapult || false
                    d_series.remodel_prev_loop = d.remodel.prev_loop || false
                }
            } else {
                d_series.remodel_prev = parseInt(d.remodel.prev) || null
                d_series.remodel_prev_lvl = parseInt(d.remodel.prev_lvl) || null
                d_series.remodel_prev_blueprint = d.remodel.prev_blueprint || false
                d_series.remodel_prev_catapult = d.remodel.prev_catapult || false
                d_series.remodel_prev_loop = d.remodel.prev_loop || false
                d_series.remodel_next = parseInt(d.remodel.next) || null
                d_series.remodel_next_lvl = parseInt(d.remodel.next_lvl) || null
                d_series.remodel_next_blueprint = d.remodel.next_blueprint || false
                d_series.remodel_next_catapult = d.remodel.next_catapult || false
                d_series.remodel_next_loop = d.remodel.next_loop || false
                d.remodel_next = d.remodel_next || (parseInt(d.remodel.next) || null)
            }

            $('<h4/>').html('改造').appendTo(details_series)
            _series('remodel').appendTo(details_series)

            $('<h4/>').html('图鉴').appendTo(details_series)
            _series('illust_delete').appendTo(details_series)
            var _illust_extra = d_series.illust_extra || [1]
            if (!_illust_extra.length)
                _illust_extra = [1]
            for (let i in _illust_extra) {
                _series(
                    'illust_extra',
                    i
                ).appendTo(details_series)
            }
            var btn_add_extraillust = $('<button class="add" type="button"/>').on('click', function () {
                _series(
                    'illust_extra',
                    details_series.find('input[name="series.illust_extra"]').length
                ).insertBefore(btn_add_extraillust)
            }).html('添加额外图鉴').appendTo(details_series)

            d.remodel_next = d.remodel_next || d_series.remodel_next
            if (d.remodel_next)
                $('<input type="hidden" name="remodel_next"/>').val(d.remodel_next).appendTo(details_series)
        })
    })();

    // 额外
    { // 特殊能力
        $('<h4/>').html('额外属性').appendTo(details_extra)
        const {
            capabilities = {}
        } = d
        _g.shipCapabilities.forEach(obj => {
            let value = capabilities[obj.key]
            switch (obj.type) {
                case 'select': {
                    value = obj.values || []
                    break
                }
            }
            _frame.app_main.page['ships'].gen_form_line(
                obj.type || 'checkbox',
                `capabilities.${obj.key}`,
                obj.name,
                value
            ).appendTo($('<p/>').appendTo(details_extra))
        })
        // let line_additional_night_shelling = $('<p/>').appendTo(details_extra)
        //     , id_additional_night_shelling = '_input_g' + _g.inputIndex
        // _g.inputIndex++
        // _frame.app_main.page['ships'].gen_input(
        //     'checkbox',
        //     'additional_night_shelling',
        //     id_additional_night_shelling,
        //     d.additional_night_shelling || false
        // ).appendTo(line_additional_night_shelling)
        // $('<label for="' + id_additional_night_shelling + '"/>').html('[CV] 夜战炮击能力').appendTo(line_additional_night_shelling)
        // _input('tp', 'TP').appendTo($('<p/>').appendTo(details_extra))
    }

    // 修改舰级航速规则
    (() => {
        $('<h4/>').html('修改舰级航速规则').appendTo(details_extra)
        var lineOverideSpeedRule = $('<p/>').appendTo(details_extra)
            , idOverideSpeedRule = '_input_g' + _g.inputIndex
        _g.inputIndex++
        var valuesSpeedRule = [
            'low-1',
            'low-2',
            'low-3',
            'low-4',
            'high-1',
            'high-2',
            'high-3',
            'high-4'
        ]
        _frame.app_main.page['ships'].gen_input(
            'select',
            'speed_rule',
            idOverideSpeedRule,
            valuesSpeedRule,
            {
                'default': d.speed_rule
            }
        ).appendTo(lineOverideSpeedRule)
    })();

    // 装备类型
    (() => {
        $('<h4/>').html('额外装备类型').appendTo(details_extra)
        _form.create_item_types('additional_item_types', d['additional_item_types'] || []).appendTo(details_extra)
        $('<h4/>').html('不可装备类型').appendTo(details_extra)
        _form.create_item_types('additional_disable_item_types', d['additional_disable_item_types'] || []).appendTo(details_extra)
    })();

    // 提交等按钮
    var line = $('<p class="actions"/>').appendTo(form)
    $('<button type="submit"/>').html(d._id ? '编辑' : '入库').appendTo(line)


    // 提交函数
    form.on('submit', function (e) {
        console.log(``)
        console.log(`UPDATING SHIP [${d.id}] ${d._name}`)
        var function_queue = []

            , ship_next = null
            , ship_id_next = null
            , series_id = null

            , unset = {}

        function function_queue_run() {
            if (!function_queue.length)
                return true
            function_queue[0]()
            function_queue.shift()
            function_queue_run()
        }
        function _parse_db_series() {
            if (data['series']['remodel_next']) {
                ship_id_next = data['series']['remodel_next']
                ship_next = {
                    'prev': data['id'],
                    'prev_lvl': data['series']['remodel_next_lvl'],
                    'prev_blueprint': data['series']['remodel_next_blueprint'],
                    'prev_catapult': data['series']['remodel_next_catapult'],
                    'prev_loop': data['series']['remodel_next_loop']
                }
            }
            //d_series_true
            //d_series_true_index
            // 如果存在 d_series_true，表示已有 series，则更新操作
            // 如果不存在，优先检查 remodel_prev 和 remodel_next 是否有 series，如果有，则更新操作
            // 否则则为新建操作
            if (!d_series_true && (data['series']['remodel_prev'] || data['series']['remodel_next'])) {
                series_id = null
                const _do_check = function (check_id, is_last) {
                    _db.ships.find({ 'id': check_id }, function (err, docs) {
                        if (!err && docs && docs.length)
                            series_id = docs[0].series

                        if (!is_last && !series_id && data['series']['remodel_next']) {
                            console.log(series_id)
                            _do_check(data['series']['remodel_next'], true)
                        } else {
                            console.log(series_id)
                            _db.ship_series.find({ 'id': series_id }).exec(function (err, docs) {
                                if (!err && docs && docs.length) {
                                    d_series_true = docs[0]
                                    for (var i in docs[0].ships) {
                                        var index = parseInt(i)
                                        if (d['id'] == docs[0].ships[index]['id']) {
                                            d_series_true_index = index
                                            if (index > 0) {
                                                data['series'].remodel_prev = docs[0].ships[index - 1]['id'] || null
                                                data['series'].remodel_prev_lvl = docs[0].ships[index - 1]['next_lvl'] || null
                                                data['series'].remodel_prev_blueprint = docs[0].ships[index - 1]['next_blueprint'] || false
                                                data['series'].remodel_prev_catapult = docs[0].ships[index - 1]['next_catapult'] || false
                                                data['series'].remodel_prev_loop = docs[0].ships[index - 1]['next_loop'] || false
                                            }
                                            if (docs[0].ships[index + 1]) {
                                                data['series'].remodel_next = docs[0].ships[index + 1]['id'] || null
                                                data['remodel_next'] = docs[0].ships[index + 1]['id'] || null
                                            }
                                            data['series'].remodel_next_lvl = docs[0].ships[index]['next_lvl'] || null
                                            if (d.remodel.next) {
                                                data['series'].remodel_next = parseInt(d.remodel.next) || null
                                            }
                                            if (d.remodel.next_lvl) {
                                                data['series'].remodel_next_lvl = parseInt(d.remodel.next_lvl) || null
                                            }
                                            data['series'].remodel_next_blueprint = docs[0].ships[index]['next_blueprint'] || false
                                            data['series'].remodel_next_catapult = docs[0].ships[index]['next_catapult'] || false
                                            data['series'].remodel_next_loop = docs[0].ships[index]['next_loop'] || false
                                            data['series'].illust_delete = docs[0].ships[index]['illust_delete'] || false
                                            data['series'].illust_extra = docs[0].ships[index]['illust_extra'] || []
                                            break
                                        }
                                    }
                                }

                                _do_parse()
                            })
                        }
                    })
                }

                if (data['series']['remodel_prev']) {
                    _do_check(data['series']['remodel_prev'])
                } else if (data['series']['remodel_next']) {
                    _do_check(data['series']['remodel_next'], true)
                } else {
                    _do_parse()
                }

            } else {
                _do_parse()
            }

            function _do_parse() {
                if (d_series_true) {
                    if (!d_series_true_index && d_series_true_index !== 0)
                        d_series_true_index = d_series_true.ships.length
                    console.log('> SERIES ', d_series_true, d_series_true_index, data)
                    var _length = d_series_true.ships.length
                        , _prev = d_series_true_index > 0 ? d_series_true.ships[d_series_true_index - 1] : null
                        , _next = d_series_true_index < _length - 1 ? d_series_true.ships[d_series_true_index + 1] : null

                    if (_prev) {
                        _prev['id'] = data['series']['remodel_prev']
                        _prev['next_lvl'] = data['series']['remodel_prev_lvl']
                        _prev['next_blueprint'] = data['series']['remodel_prev_blueprint']
                        _prev['next_catapult'] = data['series']['remodel_prev_catapult']
                        _prev['next_loop'] = data['series']['remodel_prev_loop']
                    }

                    if (!d_series_true.ships[d_series_true_index])
                        d_series_true.ships[d_series_true_index] = {
                            'id': data['id']
                        }

                    d_series_true.ships[d_series_true_index]['next_lvl'] = data['series']['remodel_next_lvl']
                    d_series_true.ships[d_series_true_index]['next_blueprint'] = data['series']['remodel_next_blueprint']
                    d_series_true.ships[d_series_true_index]['next_catapult'] = data['series']['remodel_next_catapult']
                    d_series_true.ships[d_series_true_index]['next_loop'] = data['series']['remodel_next_loop']
                    d_series_true.ships[d_series_true_index]['illust_delete'] = data['series']['illust_delete']
                    d_series_true.ships[d_series_true_index]['illust_extra'] = data['series']['illust_extra']

                    if (_next) {
                        _next['id'] = data['series']['remodel_next']
                    } else if (data['series']['remodel_next']) {
                        d_series_true.ships.push({
                            'id': data['series']['remodel_next']
                        })
                    }

                    data['series'] = d_series_true['id']
                    series_id = d_series_true['id']
                    _db.ship_series.update({
                        '_id': d_series_true['_id']
                    }, { $set: d_series_true }, {}, function (/*err, numReplaced*/) {
                        console.log('> SERIES UPDATE', d_series_true)
                        start_db_operate()
                    });
                } else {
                    d_series_true = {
                        'ships': []
                    }
                    if (data['series'].remodel_prev) {
                        d_series_true.ships.push({
                            'id': data['series']['remodel_prev'],
                            'next_lvl': data['series']['remodel_prev_lvl'],
                            'next_blueprint': data['series']['remodel_prev_blueprint'],
                            'next_catapult': data['series']['remodel_prev_catapult'],
                            'next_loop': data['series']['remodel_prev_loop']
                        })
                    }
                    d_series_true.ships.push({
                        'id': data['id'],
                        'next_lvl': data['series']['remodel_next_lvl'],
                        'next_blueprint': data['series']['remodel_next_blueprint'],
                        'next_catapult': data['series']['remodel_next_catapult'],
                        'next_loop': data['series']['remodel_next_loop'],
                        'illust_delete': data['series']['illust_delete'],
                        'illust_extra': data['series']['illust_extra']
                    })

                    if (data['series'].remodel_next) {
                        d_series_true.ships.push({
                            'id': data['series']['remodel_next']
                        })
                    }
                    _db.ship_series.count({}, function (err, count) {
                        d_series_true['id'] = parseInt(count) + 1
                        _db.ship_series.insert(
                            d_series_true,
                            function (err, newDoc) {
                                console.log('> SERIES INSERT', newDoc)
                                data['series'] = newDoc['id']
                                series_id = newDoc['id']
                                start_db_operate()
                            }
                        );
                    })
                }
            }
        }
        function start_db_operate() {
            if (_id) {
                // 存在 _id，当前为更新操作
                data.time_modified = _g.timeNow()
                console.log('> EDIT - set', data)
                console.log('> EDIT - unset', unset)
                _db.ships.update({
                    '_id': d._id
                }, { $set: data, $unset: unset }, {}, function (err, numReplaced) {
                    console.log('> UPDATE COMPLETE', numReplaced, data)
                    data._id = d._id
                    // 在已入库表格中更改原有数据行
                    var oldTr = _frame.app_main.page['ships'].section['已入库'].dom.section
                        //_frame.app_main.page['ships'].section['已入库'].dom.table
                        .find('tr[data-shipId="' + data['id'] + '"]')
                    //_frame.app_main.page['ships'].section['已入库'].append_table_tr( data )
                    _frame.app_main.page['ships'].section['已入库'].dom.section.data('shiplist').append_ship(data)
                        .insertBefore(oldTr)
                    oldTr.remove()
                    _frame.modal.hide()
                })
            } else {
                // 不存在 _id，当前为新建操作
                data.time_created = _g.timeNow()
                // 删除JSON数据
                node.fs.unlink(_g.path.fetched.ships + '/' + data['id'] + '.json', function (err) {
                    _db.ships.insert(data, function (err, newDoc) {
                        console.log('> INSERT COMPLETE', newDoc)
                        // 删除“未入库”表格中对应的行
                        try {
                            _frame.app_main.page['ships'].section['未入库'].dom.table
                                .find('tr[data-shipId="' + data['id'] + '"]').remove()
                        } catch (e) { }
                        // 在“已入库”表格开头加入行
                        _frame.app_main.page['ships'].section['已入库'].dom.section.data('shiplist').append_ship(newDoc)
                        //_frame.app_main.page['ships'].section['已入库'].append_table_tr( newDoc )
                        _frame.modal.hide()

                        // 立即处理改造后舰娘
                        if (ship_id_next) {
                            try {
                                _frame.modal.resetContent()
                                _frame.app_main.page['ships'].section['未入库'].dom.table
                                    .find('tr[data-shipId="' + ship_id_next + '"]').trigger('click', [{
                                        'name': {
                                            'ja_romaji': newDoc['name']['ja_romaji'],
                                            'zh_cn': newDoc['name']['zh_cn']
                                        },
                                        'rels': {
                                            'cv': newDoc['rels']['cv'],
                                            'illustrator': newDoc['rels']['illustrator'],
                                        },
                                        'series': series_id,
                                        'type': newDoc['type'],
                                        'class': newDoc['class'],
                                        'class_no': newDoc['class_no']
                                    }])
                            } catch (e) {

                            }
                        }
                    })
                })
            }
        }

        e.preventDefault()
        var data = {}

        // 处理所有数据，将带有 . 的数据变为 object 元素
        data = $(this).serializeObject()
        data['class_no'] = parseInt(data['class_no'])

        const delete_illust = data['series']['illust_delete'] || false
        if (!data['series']['illust_extra'].push)
            data['series']['illust_extra'] = [data['series']['illust_extra']]
        if (delete_illust) {
            data.illust_same_as_prev = true
            data.illust_extra = null
        } else {
            data.illust_same_as_prev = false
            if (data['series']['illust_extra'])
                data.illust_extra = data['series']['illust_extra']
        }
        if (!data.illust_same_as_prev) {
            delete data.illust_same_as_prev
            unset.illust_same_as_prev = true
        }
        if (!data.illust_extra || !data.illust_extra.length || data.illust_extra.every(item => (!item))) {
            delete data.illust_extra
            unset.illust_extra = true
        }

        if (typeof data['additional_item_types'] != 'object' && typeof data['additional_item_types'] != 'undefined')
            data['additional_item_types'] = [data['additional_item_types']]
        data['additional_item_types'] = data['additional_item_types'] || []
        if (!data['additional_item_types'].length) {
            delete data['additional_item_types']
            unset.additional_item_types = true
        }

        if (typeof data['additional_disable_item_types'] != 'object' && typeof data['additional_disable_item_types'] != 'undefined')
            data['additional_disable_item_types'] = [data['additional_disable_item_types']]
        data['additional_disable_item_types'] = data['additional_disable_item_types'] || []
        if (!data['additional_disable_item_types'].length) {
            delete data['additional_disable_item_types']
            unset.additional_disable_item_types = true
        }

        if (data['additional_night_shelling']) {
            data['additional_night_shelling'] = true
        } else {
            delete data['additional_night_shelling']
            unset.additional_night_shelling = true
        }

        if (!data['tp']) delete data['tp']
        if (!data['navy']) delete data['navy']

        { // 名称
            if (!data['name']['suffix'])
                data['name']['suffix'] = null
            // 存在后缀时，删除其他名称
            /*
                if( data['name']['suffix'] ){
                    for( var i in data['name'] ){
                        if( i != 'suffix' )
                            delete data['name'][i]
                    }
                }*/
        }

        { // 格数 & 装备 & 搭载总量
            if (!data['slot'])
                data['slot'] = []
            else if (!Array.isArray(data['slot']))
                data['slot'] = [data['slot']]

            if (!data['equip'])
                data['equip'] = []
            else if (!Array.isArray(data['equip']))
                data['equip'] = [data['equip']]

            const {
                // ['slot-equipment-star']: slotEquipmentStar,
                equip,
                slot
            } = data

            // console.log(slotEquipmentStar)
            const slotEquipmentStar = []
            form.find('[name="slot-equipment-star"]').each((index, el) => {
                // console.log(el, el.value)
                slotEquipmentStar.push(el.value)
            })
            // console.log(slotEquipmentStar)
            data.equip = slot.map((carry, index) => {
                const equipmentId = Array.isArray(equip) ? (
                    equip[index] && typeof equip[index] === 'object'
                        ? equip[index].id
                        : equip[index]
                ) : undefined
                if (equipmentId && Array.isArray(slotEquipmentStar) && slotEquipmentStar[index]) {
                    return {
                        id: isNaN(equipmentId) ? undefined : parseInt(equipmentId),
                        star: isNaN(slotEquipmentStar[index]) ? undefined : parseInt(slotEquipmentStar[index])
                    }
                }
                return equipmentId || undefined
            })
            delete data['slot-equipment-star']

            let carry_num = 0
            for (const i in data['slot']) {
                carry_num += parseInt(data['slot'][i])
            }
            data['stat']['carry'] = carry_num
        }

        { // 链接
            data['links'] = []
            details_misc.find('input[name="link_name"]').each(function (index) {
                var name = $(this)
                    , line = $(this).parent()
                    , url = line.find('input[name="link_url"]').val()
                name = name.val()

                data['links'].push({
                    'name': name,
                    'url': url
                })
            })
            data.link_name = null
            data.link_url = null
            delete data.link_name
            delete data.link_url
        }

        { // 额外能力
            let capabilities_count = 0
            for (let key in data.capabilities) {
                const value = data.capabilities[key]
                if (value === 'on')
                    data.capabilities[key] = true
                if (value !== undefined && value !== null && value !== '') {
                    capabilities_count++
                } else {
                    delete data.capabilities[key]
                    unset[`capabilities.${key}`] = true
                }
            }
            if (!capabilities_count) {
                delete data.capabilities
                unset.capabilities = true
            }
        }

        { // 航速规则
            if (_g.data.ship_classes[data.class]) {
                if (_g.data.ship_classes[data.class].speed_rule === data.speed_rule)
                    delete data.speed_rule
            }
            if (!data.speed_rule) {
                delete data.speed_rule
                unset.speed_rule = true
            }
        }

        // 系列
        //if( data.series.illust_delete ){
        //	function_queue.push(
        //		_delete_illust
        //	)
        //}
        //function_queue.push(
        //	_parse_db_series
        //)

        // 写入数据
        //function_queue.push(
        //	start_db_operate
        //)

        //function_queue_run()

        // 删除多余图鉴
        new Promise(resolve => {
            if (delete_illust) {
                var files = [
                    '8.png',
                    '9.png',
                    '10.png'
                ]
                const _delete = function () {
                    node.fs.unlink(_g.path.pics.ships + '/' + data['id'] + '/' + files[0], function (err) {
                        if (files.length) {
                            files.shift()
                            _delete()
                        } else {
                            resolve()
                        }
                    })
                }
                _delete()
            } else {
                resolve()
            }
        })
            // 更新关系数据
            .then(() => new Promise(resolve => {
                const rels_to_parse = [
                    'cv',
                    'illustrator'
                ]
                const parse_rels = () => {
                    if (rels_to_parse.length) {
                        _db['entities'].find({ 'id': data['rels'][rels_to_parse[0]] || -1 }, function (err, docs) {
                            if (!err && docs && docs.length) {
                                var entity_update_set_rels = docs[0]['rels'] || {}
                                if (typeof entity_update_set_rels[rels_to_parse[0]] == 'undefined')
                                    entity_update_set_rels[rels_to_parse[0]] = []

                                if ($.inArray(data['id'], entity_update_set_rels[rels_to_parse[0]]) < 0)
                                    entity_update_set_rels[rels_to_parse[0]].push(data['id'])

                                var entity_update_set = {
                                    'rels': entity_update_set_rels
                                }

                                _db['entities'].update({
                                    '_id': docs[0]._id
                                }, { $set: entity_update_set }, {}, function (err, numReplaced) {
                                    console.log('> ENTITY UPDATE COMPLETE', numReplaced, entity_update_set)
                                    rels_to_parse.shift()
                                    parse_rels()
                                })
                            } else {
                                rels_to_parse.shift()
                                parse_rels()
                            }
                        })
                    } else {
                        resolve()
                    }
                }
                parse_rels()
            }))

            .then(() => {
                _parse_db_series()
            })

        // console.log(data)
        // return

    })


    _frame.modal.show(
        form,
        d.name.ja_jp || '未入库舰娘',
        {
            'classname': 'infos_form'
        }
    )
}






_frame.app_main.page['ships'].gen_form_new_ship_type = function (callback) {
    callback = callback || function () { }
    var self = _frame.app_main.page['ships'].section['舰种&舰级']
        , form = $('<form class="new_ship_type"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()

            // 获取当前共有多少舰种，确定新建舰种的数字ID
            // 之后插入数据
            _db.ship_types.count({}, function (err, count) {
                data['id'] = parseInt(count) + 1
                _db.ship_types.insert(
                    data,
                    callback
                );
            })
        })
    self.field_input_text('code', '舰种简称').appendTo(form)
    self.field_input_text('code_game', '舰种简称 (游戏中)').appendTo(form)
    self.field_input_text('name.en_us', '舰种全称').appendTo(form)
    self.field_input_text('name.ja_jp', '舰种全称 (游戏中)').appendTo(form)
    self.field_input_text('name.zh_cn', '舰种全称 (中文)').appendTo(form)

    var input_id = '_input_g' + _g.inputIndex
    _g.inputIndex++
    $('<input type="checkbox" name="donotcompare" id="' + input_id + '">')
        .prop('checked', false)
        .appendTo(form)
    $('<label for="' + input_id + '"/>').html('不参与属性表对比').appendTo(form)

    self.field_actions().appendTo(form)

    return form
}

_frame.app_main.page['ships'].gen_form_new_ship_class = function (callback) {
    callback = callback || function () { }

    var self = _frame.app_main.page['ships'].section['舰种&舰级']
        , form = $('<form class="ship_class loading"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()

            // 获取当前共有多少舰级，确定新建舰级的数字ID
            // 之后插入数据
            _db.ship_classes.count({}, function (err, count) {
                data['id'] = parseInt(count) + 1
                _db.ship_classes.insert(
                    data,
                    callback
                );
            })
        })

    self.field_input_text('name.ja_jp', '舰级名 (游戏中)', null, '型').appendTo(form)
    self.field_input_text('name.zh_cn', '舰级名 (中文)', null, '级').appendTo(form)

    var line = $('<p/>').appendTo(form)
        , select = $('<select name="ship_type_id" required/>').html('<option value=""></option>').appendTo(form)

    _db.ship_types.find({}).sort({ 'code': 1, 'full': 1 }).exec(function (err, docs) {
        if (!err) {
            for (var i in docs) {
                var _data = docs[i]
                $('<option/>', {
                    'value': _data['id'],
                    'html': '[' + _data['code'] + '] ' + _data.name.zh_cn
                }).appendTo(select)
            }
            form.removeClass('loading')
        }
    })

    self.field_actions().appendTo(form)

    return form
}

_frame.app_main.page['ships'].gen_form_new_ship_suffix = function (callback, data_edit, callback_remove) {
    callback = callback || function () { }
    let is_edit = (data_edit)
    var self = _frame.app_main.page['ships'].section['舰种&舰级']
        , form = $('<form class="ship_suffix' + (is_edit ? ' loading' : '') + '"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()

            if (is_edit) {
                // 编辑操作
                _db.ship_namesuffix.update({
                    '_id': data_edit['_id']
                }, {
                        $set: data
                    }, {}, function (err, numReplaced) {
                        callback(data)
                        _frame.modal.hide()
                    });
            } else {
                // 新建操作
                // 获取当前总数，确定数字ID
                // 之后插入数据
                _db.ship_namesuffix.count({}, function (err, count) {
                    data['id'] = parseInt(count) + 1
                    _db.ship_namesuffix.insert(
                        data,
                        callback
                    );
                })
            }
        })
    self.field_input_text('ja_jp', '日', is_edit ? data_edit['ja_jp'] : null).appendTo(form)
    self.field_input_text('ja_romaji', '罗马音', is_edit ? data_edit['ja_romaji'] : null).appendTo(form)
    self.field_input_text('zh_cn', '简中', is_edit ? data_edit['zh_cn'] : null).appendTo(form)

    self.field_actions(
        is_edit ? '更新' : null,
        callback_remove ? function () {
            _db.ship_namesuffix.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
                callback_remove()
                _frame.modal.hide()
            });
        } : null
    ).appendTo(form)

    return form
}

_frame.app_main.page['ships'].gen_form_new_ship_type_collection = function (callback, data_edit, callback_remove) {
    callback = callback || function () { }
    let is_edit = (data_edit)
    var types = is_edit ? data_edit['types'] : []
    var self = _frame.app_main.page['ships'].section['舰种&舰级']
        , form = $('<form class="ship_type_collection"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()
            if (typeof data['types'] != 'object' && typeof data['types'] != 'undefined')
                data['types'] = [data['types']]

            if (is_edit) {
                // 编辑操作
                _db.ship_type_collections.update({
                    '_id': data_edit['_id']
                }, {
                        $set: data
                    }, {}, function (err, numReplaced) {
                        callback(data)
                        _frame.modal.hide()
                    });
            } else {
                // 新建操作
                // 获取当前总数，确定数字ID
                // 之后插入数据
                _db.ship_type_collections.count({}, function (err, count) {
                    data['id'] = parseInt(count) + 1
                    _db.ship_type_collections.insert(
                        data,
                        callback
                    );
                })
            }
        })

    self.field_input_text('name.zh_cn', '简中', is_edit ? data_edit['name']['zh_cn'] : null).appendTo(form)

    // 舰种信息
    _db.ship_types.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
        for (var i in docs) {
            var type_id = parseInt(docs[i]['id'])
                , input_id = '_input_g' + _g.inputIndex
            _g.inputIndex++
            $('<input type="checkbox" name="types" value="' + type_id + '" id="' + input_id + '"/>')
                .prop('checked', ($.inArray(type_id, types) > -1))
                .appendTo(form)
            $('<label for="' + input_id + '"/>').html(docs[i].name.zh_cn).appendTo(form)
            $('<br/>').appendTo(form)
        }

        self.field_actions(
            is_edit ? '更新' : null,
            callback_remove ? function () {
                _db.ship_type_collections.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
                    callback_remove()
                    _frame.modal.hide()
                });
            } : null
        ).appendTo(form)
    })

    return form
}

_frame.app_main.page['ships'].gen_form_new_ship_type_order = function (callback, data_edit, callback_remove) {
    callback = callback || function () { }
    let is_edit = (data_edit)
    var types = is_edit ? data_edit['types'] : []
    var self = _frame.app_main.page['ships'].section['舰种&舰级']
        , form = $('<form class="ship_type_collection"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()
            if (typeof data['types'] != 'object' && typeof data['types'] != 'undefined')
                data['types'] = [data['types']]

            if (is_edit) {
                // 编辑操作
                _db.ship_type_order.update({
                    '_id': data_edit['_id']
                }, {
                        $set: data
                    }, {}, function (err, numReplaced) {
                        callback(data)
                        _frame.modal.hide()
                    });
            } else {
                // 新建操作
                // 获取当前总数，确定数字ID
                // 之后插入数据
                _db.ship_type_order.count({}, function (err, count) {
                    data['id'] = parseInt(count) + 1
                    _db.ship_type_order.insert(
                        data,
                        callback
                    );
                })
            }
        })

    self.field_input_text('name.zh_cn', '简中', is_edit ? data_edit['name']['zh_cn'] : null).appendTo(form)

    var input_id = '_input_g' + _g.inputIndex
    _g.inputIndex++
    $('<input type="checkbox" name="donotcompare" id="' + input_id + '">')
        .prop('checked', is_edit ? data_edit['donotcompare'] : null)
        .appendTo(form)
    $('<label for="' + input_id + '"/>').html('不参与属性表对比').appendTo(form)
    $('<hr/>').appendTo(form)

    // 舰种信息
    _db.ship_types.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
        for (var i in docs) {
            var type_id = parseInt(docs[i]['id'])
                , input_id = '_input_g' + _g.inputIndex
            _g.inputIndex++
            $('<input type="checkbox" name="types" value="' + type_id + '" id="' + input_id + '">')
                .prop('checked', ($.inArray(type_id, types) > -1))
                .appendTo(form)
            $('<label for="' + input_id + '"/>').html(docs[i].name.zh_cn).appendTo(form)
            $('<br/>').appendTo(form)
        }

        self.field_actions(
            is_edit ? '更新' : null,
            callback_remove ? function () {
                _db.ship_type_order.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
                    callback_remove()
                    _frame.modal.hide()
                });
            } : null
        ).appendTo(form)
    })

    return form
}

















_frame.app_main.page['ships'].init = function (page) {
    page.find('section').on({
        'tabview-show': function () {
            var section = $(this)
                , name = section.data('tabname')

            if (!_frame.app_main.page['ships'].section[name])
                _frame.app_main.page['ships'].section[name] = {}

            var _o = _frame.app_main.page['ships'].section[name]

            if (!_o.is_init && _o.init) {
                _o.init(section)
                _o.is_init = true
            }
            switch (name) {
                case '未入库':
                    break;
            }
        }
    })
}









_frame.app_main.page['ships'].section['已入库'] = {
    'dom': {
    },

    'init': function (section) {
        _frame.app_main.page['ships'].section['已入库'].dom.section = section
    }
}














_frame.app_main.page['ships'].section['未入库'] = {
    'data': [],
    'data_length': 0,
    'dom': {},

    'append_table': function (section) {
        var container = $('<div class="fixed-table-container"/>').appendTo(section)
            , inner = $('<div class="fixed-table-container-inner"/>').appendTo(container)
            , table = $('<table class="ships hashover hashover-column"/>').appendTo(inner)
        function gen_thead(arr) {
            var thead = $('<thead/>')
                , tr = $('<tr/>').appendTo(thead)
            for (var i in arr) {
                if (parseInt(i)) {
                    $('<td/>').html('<div class="th-inner">' + arr[i] + '</div>').appendTo(tr)
                } else {
                    $('<th/>').html('<div class="th-inner">' + arr[i] + '</div>').appendTo(tr)
                }
            }
            return thead
        }
        gen_thead([
            ' ',
            //'ID',
            '火力',
            '雷装',
            '对空',
            '对潜',
            '耐久',
            '装甲',
            '回避',
            '搭载',
            '航速',
            '射程',
            '索敌',
            '运'
        ]).appendTo(table)
        var tbody = $('<tbody/>').appendTo(table)
            , _index = 0

        function raw_ship_data_convert(d) {
            var data = {
                'id': d['id'],
                'no': d['no'],
                'name': {
                    'ja_jp': d['name'],
                    'ja_kana': d['pron']
                },
                'stat': {
                    'fire': d['fire'],
                    'fire_max': d['max_fire'],
                    'torpedo': d['torpedo'],
                    'torpedo_max': d['max_torpedo'],
                    'aa': d['aac'],
                    'aa_max': d['max_aac'],
                    'asw': d['ass'],
                    'asw_max': d['max_ass'],

                    'hp': d['hp'],
                    'hp_max': d['max_hp'],
                    'armor': d['armor'],
                    'armor_max': d['max_armor'],
                    'evasion': d['evasion'],
                    'evasion_max': d['max_evasion'],
                    'carry': '',

                    'speed': d['speed'],
                    'range': d['range'],
                    'los': d['seek'],
                    'los_max': d['max_seek'],
                    'luck': d['luck'],
                    'luck_max': d['max_luck']
                },
                'consum': {
                    'fuel': d['fuel'],
                    'ammo': d['bullet']
                },
                'remodel': {
                    'prev': null,
                    'prev_lvl': null,
                    'next': d['next'] || null,
                    'next_lvl': d['nextlv'] || null
                },
                'slot': d['carry'],
                'equip': d['equip'],
                'rels': {}
            }

            var carry = 0
            for (var i in d['carry']) {
                carry += parseInt(d['carry'][i])
            }

            data.stat.carry = carry
            return data
        }
        function append_tbody_tr() {
            var ship_data = _frame.app_main.page["ships"].section["未入库"]["data"][_index]
            //if( ship_data && ship_data['name'] !== 'なし' && ship_data['id'] < 500 ){
            if (ship_data && ship_data['name'] !== 'なし') {
                var tr = $('<tr data-shipId="' + ship_data['id'] + '" data-shipModal="false"/>')
                    .on('click', function (e, data_modified) {
                        _frame.app_main.page['ships'].show_ship_form(
                            $.extend(
                                true,
                                raw_ship_data_convert(ship_data),
                                data_modified || {}
                            )
                        )
                    })
                    .appendTo(tbody)
                    , max_carry = 0
                for (var i in ship_data['carry']) {
                    max_carry += ship_data['carry'][i]
                }
                $('<th/>')
                    .html(
                        '<img src="../pics/ships/' + ship_data['id'] + '/0.png"/>'
                        + '<strong>' + ship_data['name'] + '</strong>'
                        //+ '<small>' + ship_data['pron'] + '</small>'
                    ).appendTo(tr)

                //$('<td/>').html(ship_data['id'] + ' / ' + ship_data['no']).appendTo(tr)

                $('<td class="stat-fire"/>').html(ship_data['max_fire']).appendTo(tr)
                $('<td class="stat-torpedo"/>').html(ship_data['max_torpedo']).appendTo(tr)
                $('<td class="stat-aa"/>').html(ship_data['max_aac']).appendTo(tr)
                $('<td class="stat-asw"/>').html(ship_data['max_ass']).appendTo(tr)

                $('<td class="stat-hp"/>').html(ship_data['hp']).appendTo(tr)
                $('<td class="stat-armor"/>').html(ship_data['max_armor']).appendTo(tr)
                $('<td class="stat-evasion"/>').html(ship_data['max_evasion']).appendTo(tr)
                $('<td class="stat-carry"/>').html(max_carry).appendTo(tr)

                $('<td class="stat-speed"/>').html(_g.getStatSpeed(ship_data['speed'])).appendTo(tr)
                $('<td class="stat-range"/>').html(_g.getStatRange(ship_data['range'])).appendTo(tr)
                $('<td class="stat-los"/>').html(ship_data['seek'] + '<sup>' + ship_data['max_seek'] + '</sup>').appendTo(tr)
                $('<td class="stat-luck"/>').html(ship_data['luck'] + '<sup>' + ship_data['max_luck'] + '</sup>').appendTo(tr)
            }
            _index++
            setTimeout(function () {
                append_tbody_tr()
            }, 1)
        }

        append_tbody_tr()

        return table
    },

    'init': function (section) {
        // 扫描未入库数据目录，生成表格
        node.fs.readdir(_g.path.fetched.ships, function (err, files) {
            for (var i in files) {
                node.fs.readFile(_g.path.fetched.ships + '/' + files[i], 'utf8', function (err, data) {
                    if (err)
                        throw err
                    eval('var _data = ' + data)
                    _frame.app_main.page["ships"].section["未入库"]["data"][_data['id']] = _data
                    _frame.app_main.page['ships'].section['未入库']["data_length"]++
                    if (_frame.app_main.page['ships'].section['未入库']["data_length"] >= files.length)
                        _frame.app_main.page['ships'].section['未入库'].dom.table
                            = _frame.app_main.page['ships'].section['未入库'].append_table(section)
                })
            }
            if (err || !files || !files.length) {
                $('<p/>').html('暂无内容...<br />请初始化数据').appendTo(section)
            }
        })
    }
}









_frame.app_main.page['ships'].section['舰种&舰级'] = {
    'dom': {
        'ship_class': {}
    },

    'field_input_text': function (name, title, value, suffix) {
        var line = $('<p/>')
            , label = $('<label/>').appendTo(line)
        $('<span/>').html(title).appendTo(label)
        $('<input type="text" required name="' + name + '" />').val(value).appendTo(label)
        if (suffix)
            $('<span/>').html(suffix).appendTo(label)
        return line
    },
    'field_actions': function (text, func_delete) {
        var line = $('<p class="actions"/>')
        $('<button type="submit"/>').html(text || '提交').appendTo(line)
        if (func_delete) {
            $('<button type="button"/>').html('删除').on('click', function () {
                func_delete()
            }).appendTo(line)
        }
        return line
    },






    // 返回HTML内容
    'content_ship_type': function (d) {
        return '<strong>' + d.name.zh_cn + '</strong>'
            + '<small>' + d.name.ja_jp + '</small>'
            + '<em>' + d['code'] + '</em>'
    },
    'content_ship_class': function (d) {
        return '<strong>' + d.name.zh_cn + '级</strong>'
            + '<small>' + d.name.ja_jp + '型</small>'
    },







    // 相关表单/按钮
    'titlebtn_ship_type': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种&舰级']
            , btn = $('<button class="ship_type"/>').html(
                self.content_ship_type(d)
            ).on('click', function () {
                _frame.modal.show(
                    app.addTemplate({
                        templateUrl: './templates/form-ship-type.html'
                    }, { _id: d._id }
                    ), '编辑舰种')
                return
                // var _dom = $('<form class="ship_type loading"/>').on('submit', function (e) {
                //     e.preventDefault()
                //     if (!$(this).hasClass('submitting') && !$(this).hasClass('loading')) {
                //         $(this).addClass('submitting')
                //         var newdata = $(this).serializeObject()
                //         _db.ship_types.update({
                //             '_id': d['_id']
                //         }, {
                //                 $set: newdata
                //             }, {}, function (err, numReplaced) {
                //                 btn.html(self.content_ship_type(newdata))
                //                 _frame.modal.hide()
                //             });
                //     }
                // })
                // _db.ship_types.find({
                //     '_id': d['_id']
                // }, function (err, docs) {
                //     if (!err) {
                //         var _data = docs[0]
                //         var id = self.field_input_text('id', 'ID', _data['id']).appendTo(_dom)
                //         id.find('input').prop('readonly', true)
                //         self.field_input_text('code', '舰种简称', _data['code']).appendTo(_dom)
                //         self.field_input_text('code_game', '舰种简称 (游戏中)', _data['code_game']).appendTo(_dom)
                //         self.field_input_text('name.en_us', '舰种全称', _data.name.en_us).appendTo(_dom)
                //         self.field_input_text('name.ja_jp', '舰种全称 (游戏中)', _data.name.ja_jp).appendTo(_dom)
                //         self.field_input_text('name.zh_cn', '舰种全称 (中文)', _data.name.zh_cn).appendTo(_dom)
                //         var input_id = '_input_g' + _g.inputIndex
                //         _g.inputIndex++
                //         $('<input type="checkbox" name="donotcompare" id="' + input_id + '">')
                //             .prop('checked', _data['donotcompare'])
                //             .appendTo(_dom)
                //         $('<label for="' + input_id + '"/>').html('不参与属性表对比').appendTo(_dom)
                //         self.field_actions('更新', function () {
                //             // 删除操作
                //             _db.ship_types.remove({ _id: d['_id'] }, {}, function (err, numRemoved) {
                //                 btn.remove()
                //                 if (self.dom.ship_class[d._id])
                //                     self.dom.ship_class[d._id].remove()
                //                 _frame.modal.hide()
                //             });
                //         }).appendTo(_dom)
                //         _dom.removeClass('loading')
                //     }
                // })
                // _frame.modal.show(_dom, '编辑舰种')
            })
        return btn
    },








    // 新建完毕，添加内容
    'add_ship_type': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种&舰级']

        // 舰种标题，同时也是编辑按钮
        self.titlebtn_ship_type(d).appendTo(self.dom.section)

        // 该舰种舰级DOM
        self.dom.ship_class[d.id] = _p.el.flexgrid.create().addClass('ship_classes').appendTo(self.dom.section)

        // 载入该舰种全部舰级
        _db.ship_classes.find({
            'ship_type_id': d['id']
        }, function (err, docs) {
            if (!err) {
                for (var i in docs) {
                    self.add_ship_class(docs[i])
                }
            }
        })
    },

    'add_ship_class': function (d) {
        if (!d)
            return false
        var self = _frame.app_main.page['ships'].section['舰种&舰级']
        self.dom.ship_class[d.ship_type_id].appendDOM(
            $('<button class="unit"/>').html(self.content_ship_class(d))
                .on('click', function (e) {
                    _frame.modal.show(
                        app.addTemplate({
                            templateUrl: './templates/form-ship-class.html'
                        }, {
                                _id: d._id
                            }
                        ), '编辑舰级')
                })
        )
    },










    'init': function (section) {
        var self = _frame.app_main.page['ships'].section['舰种&舰级']

        // 新建按钮
        self.dom.new_container = $('<div class="new_container"/>').appendTo(section)
        self.dom.ship_type_new = $('<button/>').html('新建舰种').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_type(
                    function (err, newDoc) {
                        self.add_ship_type(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建舰种')
        }).appendTo(self.dom.new_container)
        self.dom.ship_class_new = $('<button/>').html('新建舰级').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_class(
                    function (err, newDoc) {
                        self.add_ship_class(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建舰级')
        }).appendTo(self.dom.new_container)

        // 读取舰种表，创建内容
        self.dom.section = $('<div class="main"/>').appendTo(section)
        _db.ship_types.find({}).sort({ 'code': 1, 'full': 1 }).exec(function (err, docs) {
            if (!err) {
                for (var i in docs) {
                    self.add_ship_type(docs[i])
                }
            }
        })

    }
}









_frame.app_main.page['ships'].section['后缀名'] = {
    'dom': {},
    // 返回HTML内容
    'content_ship_suffix': function (d) {
        return '<strong>' + d['zh_cn'] + '</strong>'
            + '<small>' + d['ja_jp'] + '</small>'
    },







    // 相关表单/按钮
    'titlebtn_ship_suffix': function (d) {
        var self = _frame.app_main.page['ships'].section['后缀名']
            , btn = $('<button class="ship_suffix"/>').html(
                self.content_ship_suffix(d)
            ).on('click', function () {
                _frame.modal.show(
                    _frame.app_main.page['ships'].gen_form_new_ship_suffix(
                        function (newdata) {
                            btn.html(self.content_ship_suffix(newdata))
                        },
                        d,
                        function () {
                            btn.remove()
                        }
                    ), '编辑后缀名')
            })
        return btn
    },








    // 新建完毕，添加内容
    'add_ship_suffix': function (d) {
        var self = _frame.app_main.page['ships'].section['后缀名']

        // 舰种标题，同时也是编辑按钮
        self.titlebtn_ship_suffix(d).appendTo(self.dom.section)
    },










    'init': function (section) {
        var self = _frame.app_main.page['ships'].section['后缀名']

        // 新建按钮
        self.dom.new_container = $('<div class="new_container"/>').appendTo(section)
        self.dom.btnnew = $('<button/>').html('新建').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_suffix(
                    function (err, newDoc) {
                        self.add_ship_suffix(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建舰名后缀')
        }).appendTo(self.dom.new_container)

        // 读取舰种表，创建内容
        self.dom.section = $('<div class="main"/>').appendTo(section)
        _db.ship_namesuffix.find({}).sort({ 'code': 1, 'full': 1 }).exec(function (err, docs) {
            if (!err) {
                for (var i in docs) {
                    self.add_ship_suffix(docs[i])
                }
            }
        })

    }
}









_frame.app_main.page['ships'].section['新建'] = {
    'dom': {
    },

    'init': function (section) {
        var self = _frame.app_main.page['ships'].section['新建']
        _frame.app_main.page['ships'].section['新建'].dom.section = section

        // 创建form
        self.dom.form = $('<form/>')
            .on('submit', function (e) {
                e.preventDefault();
                var formdata = self.dom.form.serializeObject()
                    , ship_data = {
                        'name': {},
                        'stat': {},
                        'consum': {},
                        'slot': [],
                        'equip': []
                    }
                console.log(formdata)
                if (formdata.remodel_from && formdata.remodel_from > -1) {
                    let remodel_from = _g.data.ships[formdata.remodel_from]
                    ship_data['name'] = remodel_from['name']
                    ship_data['type'] = remodel_from['type']
                    ship_data['class'] = remodel_from['class']
                    ship_data['class_no'] = remodel_from['class_no']
                    // ship_data['rels'] = remodel_from['rels']
                    ship_data['series'] = remodel_from['series']
                    ship_data['remodel'] = {
                        'prev': remodel_from['id']
                    }

                    delete ship_data['name']['suffix']
                } else {

                }
                if (formdata['id'])
                    ship_data['id'] = formdata['id']

                if (formdata['no'])
                    ship_data['no'] = formdata['no']

                _frame.app_main.page['ships'].show_ship_form(
                    ship_data
                )
            })
            .data({
                'ship_data': {}
            })
            .appendTo(section)

        var id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<p/>')
            .append(
                $('<label for="' + id + '"/>').html('ID')
            )
            .append(
                $('<input id="' + id + '" type="number" name="id"/>')
            )
            .appendTo(self.dom.form)
        $('<p/>')
            .append(
                $('<label for="' + id + '"/>').html('图鉴ID')
            )
            .append(
                $('<input id="' + id + '" type="number" name="no"/>')
            )
            .appendTo(self.dom.form)

        var id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        var remodelFrom = $('<p/>')
            .append(
                $('<label for="' + id + '"/>').html('改造自')
            )
            .appendTo(self.dom.form)
        _comp.selector_ship('remodel_from', id).appendTo(remodelFrom)
        /*
        var remodelFromSelect = $('<select name="remodel_from" id="'+id+'"/>')
                            .append(
                                $('<option value="-1"/>').html('---无---')
                            )
                            .appendTo(remodelFrom)

        // 载入全部舰娘信息
            _db.ships.find({}).sort({'name.ja_jp':1}).exec(function(err, docs){
                for( var i in docs ){
                    self.dom.form.data('ship_data')[docs[i]['id']] = docs[i]
                    $('<option value="'+ docs[i]['id'] +'"/>')
                        .html(
                            (docs[i]['name']['zh_cn'] || docs[i]['name']['ja_jp'])
                            + (docs[i]['name']['suffix']
                                ? '・' + _g.data.ship_namesuffix[docs[i]['name']['suffix']]['zh_cn']
                                : '')
                        )
                        .appendTo(remodelFromSelect)
                }
            })
            */

        $('<p class="actions"/>')
            .append(
                $('<button type="submit"/>').html('新建')
            )
            .appendTo(self.dom.form)

    }
}









_frame.app_main.page['ships'].section['舰种集合 (舰娘列表)'] = {
    'dom': {
    },

    // 返回HTML内容
    'content': function (d) {
        return '<strong>' + d['name']['zh_cn'] + '</strong>'
    },

    // 相关表单/按钮
    'titlebtn': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘列表)']
            , dom = $('<div class="ship_type_collection"/>')
        $('<button class="ship_type_collection"/>').html(
            self.content(d)
        ).on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_type_order(
                    function (newdata) {
                        self.titlebtn(newdata)
                            .insertAfter(dom)
                        dom.remove()
                    },
                    d,
                    function () {
                        dom.remove()
                    }
                ), '编辑舰种集合')
        }).appendTo(dom)

        var types = $('<div/>').appendTo(dom)
        for (var i in d['types']) {
            $('<span/>').html(
                _g.data.ship_types[d['types'][i]].name.zh_cn
                + (parseInt(i) < d['types'].length - 1 ? ', ' : '')
            ).appendTo(types)
        }

        return dom
    },

    // 新建完毕，添加内容
    'add': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘列表)']
        /*
            {
                id 			// order
                name
                    zh_cn
                types
            }
        */
        // 舰种标题，同时也是编辑按钮
        self.titlebtn(d).appendTo(self.dom.ship_type_order)
    },

    'init': function (section) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘列表)']
        _frame.app_main.page['ships'].section['舰种集合 (舰娘列表)'].dom.section = section

        var types_collected = []

        // 新建按钮
        self.dom.new_container = $('<div class="new_container"/>').appendTo(section)
        self.dom.btnnew = $('<button/>').html('新建').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_type_order(
                    function (err, newDoc) {
                        self.add(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建舰种集合')
        }).appendTo(self.dom.new_container)

        // 舰种集合列表
        self.dom.ship_type_order = $('<div class="ship_type_collections"/>').appendTo(section)

        // 读取舰种集合db，初始化内容
        _db.ship_type_order.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                for (var i in docs) {
                    self.add(docs[i])
                }
            }
        })
    }
}









_frame.app_main.page['ships'].section['舰种集合 (舰娘选择器)'] = {
    'dom': {
    },

    // 返回HTML内容
    'content': function (d) {
        return '<strong>' + d['name']['zh_cn'] + '</strong>'
    },

    // 相关表单/按钮
    'titlebtn': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘选择器)']
            , dom = $('<div class="ship_type_collection"/>')
        $('<button class="ship_type_collection"/>').html(
            self.content(d)
        ).on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_type_collection(
                    function (newdata) {
                        self.titlebtn(newdata)
                            .insertAfter(dom)
                        dom.remove()
                    },
                    d,
                    function () {
                        dom.remove()
                    }
                ), '编辑舰种集合')
        }).appendTo(dom)

        var types = $('<div/>').appendTo(dom)
        for (var i in d['types']) {
            $('<span/>').html(
                _g.data.ship_types[d['types'][i]].name.zh_cn
                + (parseInt(i) < d['types'].length - 1 ? ', ' : '')
            ).appendTo(types)
        }

        return dom
    },

    // 新建完毕，添加内容
    'add': function (d) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘选择器)']
        /*
            {
                id 			// order
                name
                    zh_cn
                types
            }
        */
        // 舰种标题，同时也是编辑按钮
        self.titlebtn(d).appendTo(self.dom.ship_type_collections)
    },

    'init': function (section) {
        var self = _frame.app_main.page['ships'].section['舰种集合 (舰娘选择器)']
        _frame.app_main.page['ships'].section['舰种集合 (舰娘选择器)'].dom.section = section

        var types_collected = []

        // 新建按钮
        self.dom.new_container = $('<div class="new_container"/>').appendTo(section)
        self.dom.btnnew = $('<button/>').html('新建').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['ships'].gen_form_new_ship_type_collection(
                    function (err, newDoc) {
                        self.add(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建舰种集合')
        }).appendTo(self.dom.new_container)

        // 舰种集合列表
        self.dom.ship_type_collections = $('<div class="ship_type_collections"/>').appendTo(section)

        // 读取舰种集合db，初始化内容
        _db.ship_type_collections.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                for (var i in docs) {
                    self.add(docs[i])
                }
            }
        })
    }
}

/*
batch:
    EQUIPMENT.upgrade_from
    arsenal_by_day
*/



_frame.app_main.page['items'] = {}
_frame.app_main.page['items'].section = {}









_frame.app_main.page['items'].show_item_form = function (d) {
    console.log(d)
    d['default_equipped_on'] = d['default_equipped_on'] || []

    function _input(name, label, suffix, options) {
        return _frame.app_main.page['ships'].gen_form_line(
            'text', name, label, eval('d.' + name) || '', suffix, options
        )
    }
    function _stat(stat, label, defaultValue) {
        var line = $('<p/>')
            , id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        const hasDefaultValue = typeof defaultValue !== 'undefined'

        switch (stat) {
            case 'dismantle':
                $('<label for="' + id + '"/>').html('燃料').appendTo(line)
                var input = _frame.app_main.page['ships'].gen_input(
                    'number',
                    'dismantle',
                    id,
                    d.dismantle[0]
                ).appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '"/>').html('弹药').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'dismantle',
                    id,
                    d.dismantle[1]
                ).appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '"/>').html('钢材').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'dismantle',
                    id,
                    d.dismantle[2]
                ).appendTo(line)

                id = '_input_g' + _g.inputIndex
                _g.inputIndex++
                $('<label for="' + id + '"/>').html('铝土').appendTo(line)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    'dismantle',
                    id,
                    d.dismantle[3]
                ).appendTo(line)
                break;
            case 'range':
                var value = hasDefaultValue ? defaultValue : d.stat[stat]

                $('<label for="' + id + '"/>').html(label).appendTo(line)
                var input = _frame.app_main.page['ships'].gen_input(
                    'select',
                    hasDefaultValue ? null : 'stat.' + stat,
                    id,
                    [
                        {
                            'value': '1',
                            'title': '短'
                        },
                        {
                            'value': '2',
                            'title': '中'
                        },
                        {
                            'value': '3',
                            'title': '长'
                        },
                        {
                            'value': '4',
                            'title': '超长'
                        }
                    ],
                    {
                        'default': value
                    }
                ).appendTo(line)
                if (value)
                    $('<label for="' + id + '"/>').html('当前值: ' + value).appendTo(line)
                break;
            default:
                var value = hasDefaultValue ? defaultValue : d.stat[stat]
                $('<label for="' + id + '"/>').html(label).appendTo(line)
                var input = _frame.app_main.page['ships'].gen_input(
                    'number',
                    hasDefaultValue ? null : 'stat.' + stat,
                    id,
                    value
                ).appendTo(line)
                break;
        }

        return line
    }
    function _upgrade_to(no, equipment, star) {
        var line = $('<p/>')
            , id = '_input_g' + _g.inputIndex
        _g.inputIndex++

        $('<label for="' + id + '"/>').html('可升级为').appendTo(line)
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
        $('<label for="' + id + '"/>').html('初始星级').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'number',
            'upgrade_to_star',
            id,
            star
        ).appendTo(line)

        // 删除本行信息
        $('<button type="button" class="delete"/>').html('&times;').on('click', function () {
            line.remove()
        }).appendTo(line)

        return line
    }
    function _improvement(improvement) {
        improvement = improvement || {
            // 可升级为
            // 不可升级为 false
            // 可升级为 [NUMBER euipment_id, NUMBER base_star]
            upgrade: false,
            // 资源消费
            resource: [
                // 必要资源		油/弹/钢/铝
                [0, 0, 0, 0],
                // +0 ~ +5		开发资材 / 开发资材（确保） / 改修资财 / 改修资财（确保） / [需要装备 / 需要装备数量]
                [0, 0, 0, 0, [null, 0]],
                // +6 ~ MAX		开发资材 / 开发资材（确保） / 改修资财 / 改修资财（确保） / 需要装备 / 需要装备数量
                [0, 0, 0, 0, [null, 0]],
                // 升级			开发资材 / 开发资材（确保） / 改修资财 / 改修资财（确保） / 需要装备 / 需要装备数量
                [0, 0, 0, 0, [null, 0]]
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
            , id
            , line

        // 可升级至
        line = $('<p class="upgrade"/>').appendTo(block)

        $('<label/>').html('可升级为').appendTo(line)
        _comp.selector_equipment(
            '',
            '',
            improvement.upgrade ? improvement.upgrade[0] : null
        ).appendTo(line)

        id = _g.newInputIndex()
        $('<label for="' + id + '"/>').html('初始星级').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'number',
            '',
            id,
            improvement.upgrade ? improvement.upgrade[1] : 0
        ).appendTo(line)

        // 星期 & 秘书舰
        var subblock = $('<div class="require"/>').html('<h5>星期 & 秘书舰</h5>').appendTo(block)
        function _reqs(req) {
            var reqblock = $('<div/>').appendTo(block)

            $('<h6/>').html('星期').appendTo(reqblock)
            for (var j = 0; j < 7; j++) {
                var text
                switch (j) {
                    case 0: text = '日'; break;
                    case 1: text = '一'; break;
                    case 2: text = '二'; break;
                    case 3: text = '三'; break;
                    case 4: text = '四'; break;
                    case 5: text = '五'; break;
                    case 6: text = '六'; break;
                }
                id = _g.newInputIndex()
                $('<input type="checkbox" id="' + id + '"/>').prop('checked', req[0][j]).appendTo(reqblock)
                $('<label for="' + id + '"/>').html(text).appendTo(reqblock)
            }

            $('<h6/>').html('秘书舰').appendTo(reqblock)
            function _reqship(reqship) {
                var reqshipline = $('<p/>').appendTo(reqblock)
                _comp.selector_ship(null, null, reqship).appendTo(reqshipline)
                // 删除本条信息
                $('<button type="button" class="delete"/>').html('&times;').on('click', function () {
                    reqshipline.remove()
                }).appendTo(reqshipline)
                return reqshipline
            }
            for (var ii = 0; ii < (req[1] ? req[1].length : 0); ii++) {
                _reqship(req[1] ? req[1][ii] : false).appendTo(reqblock)
            }
            var btn_add_reqship = $('<button class="add" type="button"/>').on('click', function () {
                _reqship().insertBefore(btn_add_reqship)
            }).html('+ 秘书舰').appendTo(reqblock)

            // 删除本条信息
            $('<button type="button" class="delete"/>').html('&times;').on('click', function () {
                reqblock.remove()
            }).appendTo(reqblock)

            return reqblock
        }
        for (var i = 0; i < improvement.req.length; i++) {
            _reqs(improvement.req[i]).appendTo(subblock)
        }
        var btn_add_reqs = $('<button class="add" type="button"/>').on('click', function () {
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
        $('<label for="' + id + '"/>').html('燃料').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'number',
            '',
            id,
            improvement.resource[0][0]
        ).appendTo(line)

        id = _g.newInputIndex()
        $('<label for="' + id + '"/>').html('弹药').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'number',
            '',
            id,
            improvement.resource[0][1]
        ).appendTo(line)

        id = _g.newInputIndex()
        $('<label for="' + id + '"/>').html('钢材').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'number',
            '',
            id,
            improvement.resource[0][2]
        ).appendTo(line)

        id = _g.newInputIndex()
        $('<label for="' + id + '"/>').html('铝土').appendTo(line)
        _frame.app_main.page['ships'].gen_input(
            'number',
            '',
            id,
            improvement.resource[0][3]
        ).appendTo(line)
        // 其他资源
        for (var i = 1; i < 4; i++) {
            var title
            switch (i) {
                case 1: title = '+0 ~ +5'; break;
                case 2: title = '+6 ~ MAX'; break;
                case 3: title = '升级'; break;
            }
            line = $('<p class="resource resource-mat"/>')
                .append(
                    $('<h5/>').html(title)
                ).appendTo(block)

            id = _g.newInputIndex()
            $('<label for="' + id + '"/>').html('开发').appendTo(line)
            _frame.app_main.page['ships'].gen_input(
                'number',
                '',
                id,
                improvement.resource[i][0]
            ).appendTo(line)

            id = _g.newInputIndex()
            $('<label for="' + id + '"/>').html('确').appendTo(line)
            _frame.app_main.page['ships'].gen_input(
                'number',
                '',
                id,
                improvement.resource[i][1]
            ).appendTo(line)

            id = _g.newInputIndex()
            $('<label for="' + id + '"/>').html('改修').appendTo(line)
            _frame.app_main.page['ships'].gen_input(
                'number',
                '',
                id,
                improvement.resource[i][2]
            ).appendTo(line)

            id = _g.newInputIndex()
            $('<label for="' + id + '"/>').html('确').appendTo(line)
            _frame.app_main.page['ships'].gen_input(
                'number',
                '',
                id,
                improvement.resource[i][3]
            ).appendTo(line)

            $('<label/>').html('装备').appendTo(line)
            const equipments = $('<span class="equipments" />').appendTo(line)
            let dataEquipments = []
            if (Array.isArray(improvement.resource[i][4]))
                dataEquipments = improvement.resource[i][4]
            else if (typeof improvement.resource[i][4] !== 'undefined')
                dataEquipments.push([improvement.resource[i][4], improvement.resource[i][5]])
            const addDomEquipment = (d = [null, 0]) => {
                if (d === null) return
                const thisEquipment = $('<span class="equipment" />').appendTo(equipments)
                _comp.selector_equipment(
                    '',
                    '',
                    d[0]
                ).appendTo(thisEquipment)

                id = _g.newInputIndex()
                $('<label for="' + id + '"/>').html('量').appendTo(thisEquipment)
                _frame.app_main.page['ships'].gen_input(
                    'number',
                    '',
                    id,
                    d[1]
                ).appendTo(thisEquipment)

                $('<button class="remove" type="button">×</button>')
                    .on('click', () => {
                        thisEquipment.remove()
                    })
                    .appendTo(thisEquipment)

                $('<button class="add" type="button">+</button>')
                    .on('click', () => {
                        addDomEquipment()
                    })
                    .appendTo(thisEquipment)
            }
            dataEquipments.forEach(addDomEquipment)
        }

        // 删除本条信息
        $('<button type="button" class="delete"/>').html('&times;').on('click', function () {
            block.remove()
        }).appendTo(block)

        return block
    }

    const form = $('<form class="iteminfo new"/>')
    const details = $('<div class="tabview"/>').appendTo(form)
    // 如果有 _id 则表明已存在数据，当前为编辑操作，否则为新建操作
    const _id = d._id ? $('<input type="hidden"/>').val(d._id) : null


    // 基础信息
    {
        const base = $('<div class="base"/>').appendTo(form)

        // 标准图鉴
        const base_image = $('<div class="image"/>').css('background-image', 'url(../pics/items/' + d['id'] + '/card.png)').appendTo(base)

        _input('id', 'ID', null, { 'required': true }).appendTo(base)
        _input('rarity', '稀有度', null, { 'required': true }).appendTo(base)
        // 类型
        var base_type = _frame.app_main.page['ships'].gen_form_line(
            'select',
            'type',
            '类型',
            []
        ).appendTo(base)
        _db.item_types.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err) {
                var types = []
                    , sel = base_type.find('select')
                for (var i in docs) {
                    types.push({
                        //'value': 	docs[i]['_id'],
                        'value': docs[i]['id'],
                        'title': docs[i]['name']['zh_cn']
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
                        'new': function (select) {
                            console.log('NEW SHIP TYPE', select)
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
        _input('name.en_us', '<small>EN</small>').appendTo(base)
    }


    // 属性
    {
        const details_stat = $('<section data-tabname="属性"/>').appendTo(details)

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
        _stat('distance', '距离').appendTo(details_stat)

        $('<h4/>').html('废弃资源').appendTo(details_stat)
        _stat('dismantle').appendTo(details_stat)

        $('<h4/>').html('其他信息').appendTo(details_stat)
        { // 可开发
            var line = $('<p/>').appendTo(details_stat)
                , id = '_input_g' + _g.inputIndex
            _g.inputIndex++
            _frame.app_main.page['ships'].gen_input(
                'checkbox',
                'craftable',
                id,
                d.craftable || false
            ).appendTo(line)
            $('<label for="' + id + '"/>').html('可开发').appendTo(line)
        }
        /*
        { // 可提升熟练度
            line = $('<p/>').appendTo(details_stat)
            id = '_input_g' + _g.inputIndex
            _g.inputIndex++
            _frame.app_main.page['ships'].gen_input(
                'checkbox',
                'rankupgradable',
                id,
                d.rankupgradable || false
            ).appendTo(line)
            $('<label for="' + id + '"/>').html('可提升熟练度').appendTo(line)
        }
        */
    }


    { // BONUS
        const container = $('<section data-tabname="BONUS" data-section="stat-bonus"/>').appendTo(details)
        const data = d.stat_bonus || []
        const defaults = {
            ships: [],
            bonus: {}
        }
        const _bonus = (o = defaults) => {
            const block = $('<div class="stat-bonus"/>')

            { // 舰级列表
                const subblock = $('<div class="block ship-classes"/>').html('<h5>舰级</h5>').appendTo(block)
                const classes = o.ship_classes || []
                const genItem = (classId) => {
                    const line = $('<p class="ship"/>')
                    _comp.selector_ship_class(null, null, classId).appendTo(line)
                    // 删除本条信息
                    $('<button type="button" class="delete"/>').html('&times;').on('click', function () {
                        line.remove()
                    }).appendTo(line)
                    return line
                }
                classes.forEach(ship => genItem(ship).appendTo(subblock))
                const btn_add_ship = $('<button class="add" type="button"/>').on('click', function () {
                    genItem().insertBefore(btn_add_ship)
                }).html('+ 舰级').appendTo(subblock)
            }

            { // 舰娘列表
                const subblock = $('<div class="block ships"/>').html('<h5>舰娘</h5>').appendTo(block)
                const ships = o.ships || []
                const _ship = (shipId) => {
                    const line = $('<p class="ship"/>')
                    _comp.selector_ship(null, null, shipId).appendTo(line)
                    // 删除本条信息
                    $('<button type="button" class="delete"/>').html('&times;').on('click', function () {
                        line.remove()
                    }).appendTo(line)
                    return line
                }
                ships.forEach(ship => _ship(ship).appendTo(subblock))
                const btn_add_ship = $('<button class="add" type="button"/>').on('click', function () {
                    _ship().insertBefore(btn_add_ship)
                }).html('+ 舰娘').appendTo(subblock)
            }

            { // 属性
                const subblock = $('<div class="block stats"/>').html('<h5>附加属性</h5>').appendTo(block)
                const stats = o.bonus
                const addStat = (stat, name) =>
                    _stat(stat, name, stats[stat] || 0)
                        .attr(`data-stat`, stat)
                        .appendTo(subblock)

                addStat('fire', '火力')
                addStat('torpedo', '雷装')
                addStat('bomb', '爆装')
                addStat('asw', '对潜')
                addStat('aa', '对空')
                addStat('armor', '装甲')
                addStat('evasion', '回避')
                addStat('hit', '命中')
                addStat('los', '索敌')
                addStat('range', '射程')
                addStat('distance', '距离')
            }

            // 删除本条信息
            $('<button type="button" class="delete"/>').html('&times;').on('click', function () {
                block.remove()
            }).appendTo(block)

            return block
        }

        data.forEach(bonus =>
            _bonus(bonus).appendTo(container)
        )

        const btn_add = $('<button class="add" type="button"/>').on('click', function () {
            _bonus().insertBefore(btn_add)
        }).html('+ 额外属性类别').appendTo(container)
    }


    // 改修
    {
        const details_craft = $('<section data-tabname="改修"/>').appendTo(details)

        // 改修
        // $('<h4/>').html('改修').appendTo(details_craft)
        for (var i = 0; i < (d['improvement'] ? d['improvement'].length : 0); i++) {
            _improvement(d['improvement'] ? d['improvement'][i] : null).appendTo(details_craft)
        }
        var btn_add_improvement = $('<button class="add" type="button"/>').on('click', function () {
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
    }


    // 初装舰娘
    {
        const details_equipped = $('<section data-tabname="初装"/>').appendTo(details)

        var ships_equipped = {}
        _db.ships.find({ "equip": d['id'] }, function (err, docs) {
            for (var i in docs) {
                if (typeof ships_equipped[docs[i]['series']] == 'undefined')
                    ships_equipped[docs[i]['series']] = []
                ships_equipped[docs[i]['series']].push(docs[i])
            }
            for (var i in ships_equipped) {
                ships_equipped[i].sort(function (a, b) {
                    return a['name']['suffix'] - b['name']['suffix']
                })
                for (var j in ships_equipped[i]) {
                    d['default_equipped_on'].push(ships_equipped[i][j]['id'])
                    $('<div/>')
                        .html(
                            '<img src="../pics/ships/' + ships_equipped[i][j]['id'] + '/0.png"/>'
                            + '[' + ships_equipped[i][j]['id'] + '] '
                            + (ships_equipped[i][j]['name']['zh_cn'] || ships_equipped[i][j]['name']['ja_jp'])
                            + (ships_equipped[i][j]['name']['suffix']
                                ? '・' + _g.data.ship_namesuffix[ships_equipped[i][j]['name']['suffix']]['zh_cn']
                                : '')
                        )
                        .appendTo(details_equipped)
                }
            }
        });
    }


    // 其他
    {
        const details_misc = $('<section data-tabname="其他"/>').appendTo(details)

        // 补强增设
        {
            const line = $('<p/>').appendTo(details_misc)
                , id = '_input_g' + _g.inputIndex
            _g.inputIndex++
            _frame.app_main.page['ships'].gen_input(
                'checkbox',
                'equipable_exslot',
                id,
                d.equipable_exslot || false
            ).appendTo(line)
            $('<label for="' + id + '"/>').html('可装备于补强增设栏位').appendTo(line)
        }
    }


    // 提交等按钮
    var line = $('<p class="actions"/>').appendTo(form)
    $('<button type="submit"/>').html(d._id ? '编辑' : '入库').appendTo(line)


    // 提交函数
    form.on('submit', function (e) {
        e.preventDefault()
        var data = {}
            , $form = $(this)
        function start_db_operate() {
            if (_id) {
                // 存在 _id，当前为更新操作
                data.time_modified = _g.timeNow()
                console.log('EDIT', data)
                _db.items.update(
                    {
                        '_id': d._id
                    },
                    {
                        $set: data
                    }, {}, function (err, numReplaced) {
                        console.log('UPDATE COMPLETE', numReplaced, data)
                        data._id = d._id
                        // 在已入库表格中更改原有数据行
                        var oldTr = _frame.app_main.page['items'].section['已入库'].dom.section
                            .find('[data-itemid="' + data['id'] + '"]')
                        _frame.app_main.page['items'].section['已入库'].dom.section.data('itemlist').append_item(data)
                            .insertBefore(oldTr)
                        oldTr.remove()
                        _frame.modal.hide()
                    }
                )
            } else {
                // 不存在 _id，当前为新建操作
                data.time_created = _g.timeNow()
                // 删除JSON数据
                node.fs.unlink(_g.path.fetched.items + '/' + data['id'] + '.json', function (err) {
                    _db.items.insert(data, function (err, newDoc) {
                        console.log('INSERT COMPLETE', newDoc)
                        // 删除“未入库”表格中对应的行
                        try {
                            _frame.app_main.page['items'].section['未入库'].dom.main
                                .find('[data-itemid="' + data['id'] + '"]').remove()
                        } catch (e) { }
                        // 在“已入库”表格开头加入行
                        _frame.app_main.page['items'].section['已入库'].dom.section.data('itemlist').append_item(newDoc)
                        _frame.modal.hide()
                    })
                })
            }
        }

        // 处理所有数据
        data = $form.serializeObject()
        //data['default_equipped_on'] = d['default_equipped_on']
        delete (data['default_equipped_on'])
        data['craftable'] = data['craftable'] ? true : false;
        // 以下数据如果为falsy，删除
        [
            'equipable_exslot'
        ].forEach(key => {
            if (!data[key]) delete data[key]
        });
        // 以下数据如果为'on'，改为true
        [
            'equipable_exslot'
        ].forEach(key => {
            if (data[key] === 'on') data[key] = true
        });

        { // 额外属性数据
            delete data.stat_bonus
            const stat_bonus = []

            $form.find('.stat-bonus').each((index, el) => {
                let hasData = false

                const data = {
                    bonus: {}
                }
                const $this = $(el)

                $this.find('.ship-classes .ship select').each((index, el) => {
                    const value = el.value
                    if (!value) return
                    if (!Array.isArray(data.ship_classes))
                        data.ship_classes = []
                    data.ship_classes.push(parseInt(value))
                })

                $this.find('.ships .ship select').each((index, el) => {
                    const value = el.value
                    if (!value) return
                    if (!Array.isArray(data.ships))
                        data.ships = []
                    data.ships.push(parseInt(value))
                })

                $this.find('.stats [data-stat]').each((index, line) => {
                    const $line = $(line)
                    const stat = $line.attr('data-stat')
                    const value = $line.find('input, select').eq(0).val()
                    if (!value) return
                    hasData = true
                    if (parseInt(value))
                        data.bonus[stat] = parseInt(value)
                })

                if (hasData)
                    stat_bonus.push(data)
            })

            if (Array.isArray(stat_bonus) && stat_bonus.length)
                data.stat_bonus = stat_bonus
        }

        { // 改修数据
            data.improvable = false
            data.upgrade_to = null
            data['improvement'] = false
            $form.find('.improvement').each(function (index) {
                data.improvable = true
                if (!data['improvement'])
                    data['improvement'] = []
                var data_improvement = {
                    'upgrade': false,
                    'req': [],
                    'resource': [[], [], [], []]
                }
                    , $this = $(this)
                // upgrade
                var upgrade = $this.find('.upgrade')
                    , upgrade_to = parseInt(upgrade.find('select').val())
                if (!isNaN(upgrade_to)) {
                    if (!data.upgrade_to)
                        data.upgrade_to = []
                    var base_star = parseInt($this.find('input[type="number"]').val()) || 0
                    data_improvement.upgrade = [
                        upgrade_to,
                        base_star
                    ]
                    data.upgrade_to.push([upgrade_to, base_star])
                }
                // req
                $this.find('.require>div').each(function (i) {
                    var data_req = [[], false]
                    $(this).find('input[type="checkbox"]').each(function (weekday) {
                        data_req[0][weekday] = $(this).prop('checked')
                    })
                    $(this).find('select').each(function (shipindex) {
                        if (!data_req[1])
                            data_req[1] = []
                        var val = $(this).val()
                        if (val)
                            data_req[1].push(parseInt(val))
                    })
                    data_improvement.req.push(data_req)
                })
                // resource
                $this.find('.resource').each(function (i) {
                    $(this).find('input, select').each(function (inputindex) {
                        let val = $(this).val()
                        if (!isNaN(val)) {
                            val = parseInt($(this).val())
                        }
                        if (inputindex > 3) {
                            if (typeof data_improvement.resource[i][4] === 'undefined')
                                data_improvement.resource[i][4] = []
                            if (inputindex % 2 === 0)
                                data_improvement.resource[i][4].push([val || null])
                            if (inputindex % 2 === 1)
                                data_improvement.resource[i][4][data_improvement.resource[i][4].length - 1][1] = val || 0
                        } else {
                            data_improvement.resource[i].push(val || 0)
                        }
                    })
                })
                data['improvement'].push(data_improvement)
            })
        }
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
        // return data

        // 写入数据库
        start_db_operate()
    })


    _frame.modal.show(
        form,
        d.name.ja_jp || '未入库装备',
        {
            'classname': 'infos_form'
        }
    )
}








_frame.app_main.page['items'].field_input_text = function (name, title, value, suffix) {
    var line = $('<p/>')
        , label = $('<label/>').appendTo(line)
    $('<span/>').html(title).appendTo(label)
    $('<input type="text" required name="' + name + '" />').val(value).appendTo(label)
    if (suffix)
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
_frame.app_main.page['items'].field_actions = function (text, func_delete) {
    var line = $('<p class="actions"/>')
    $('<button type="submit"/>').html(text || '提交').appendTo(line)
    if (func_delete) {
        $('<button type="button"/>').html('删除').on('click', function () {
            func_delete()
        }).appendTo(line)
    }
    return line
}










_frame.app_main.page['items'].gen_form_new_item_type = function (callback, data_edit, callback_remove) {
    callback = callback || function () { }
    let is_edit = (data_edit)
    var self = _frame.app_main.page['items']
        , form = $('<form class="itemform item_type"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()

            if (typeof data['equipable_on_type'] != 'object' && typeof data['equipable_on_type'] != 'undefined')
                data['equipable_on_type'] = [data['equipable_on_type']]
            data['equipable_on_type'] = data['equipable_on_type'] || [];

            /* scrapped 2015/05/26
            if( typeof data['equipable_on_stat'] != 'object' && typeof data['equipable_on_stat'] != 'undefined' )
                data['equipable_on_stat'] = [data['equipable_on_stat']]
            data['equipable_on_stat'] = data['equipable_on_stat'] || []
            */
            // 以下数据如果为falsy，删除
            [
                'equipable_exslot'
            ].forEach(key => {
                if (!data[key]) delete data[key]
            });
            // 以下数据如果为'on'，改为true
            [
                'equipable_exslot'
            ].forEach(key => {
                if (data[key] === 'on') data[key] = true
            });

            if (is_edit) {
                // 编辑操作
                _db.item_types.update(
                    {
                        '_id': data_edit['_id']
                    },
                    {
                        $set: data
                    },
                    {},
                    function (err, numReplaced) {
                        callback(data)
                        _frame.modal.hide()
                    }
                );
            } else {
                // 新建操作
                // 获取当前总数，确定数字ID
                // 之后插入数据
                _db.item_types.count({}, function (err, count) {
                    data['id'] = parseInt(count) + 1
                    _db.item_types.insert(
                        data,
                        callback
                    );
                })
            }
        })
        , input_container = $('<div/>').appendTo(form)
        , data_ingame

    if (is_edit) {
        console.log(data_edit)
        const {
            api_data: data
        } = _g.getGameApi()
        const {
            api_mst_slotitem_equiptype: types
        } = data
        const map = []
        for (let i in types) {
            const obj = types[i]
            // map.push({
            //     id: obj.api_id,
            //     name: obj.api_name
            // })
            map.push(`[${obj.api_id}] ${obj.api_name}`)
        }
        console.log(map)
        if (data_edit.id_ingame) {
        }
    }

    self.field_input_text('name.ja_jp', '日', is_edit ? data_edit['name']['ja_jp'] : null).appendTo(input_container)
    self.field_input_text('name.zh_cn', '简中', is_edit ? data_edit['name']['zh_cn'] : null).appendTo(input_container)
    self.field_input_text('name.en_us', 'EN', is_edit ? data_edit['name']['en_us'] : null).appendTo(input_container)

    $('<br/>').appendTo(input_container)

    if (is_edit) {
        const line = self.field_input_text('id', 'ID', is_edit ? data_edit.id : null).appendTo(input_container)
        line.find('[type="text"]').attr('disabled', true)
    }
    self.field_input_text('id_ingame', 'ID (in-game)', is_edit ? data_edit.id_ingame : null).appendTo(input_container)

    $('<br/>').appendTo(input_container)

    const fieldTP = self.field_input_text('tp', 'TP', is_edit ? data_edit.tp : null).appendTo(input_container)
    fieldTP.find('input').prop('required', false)

    $('<h4/>').html('图标').appendTo(input_container)
    // icon
    // 扫描图标目录，生成选择项
    //var path_icons = process.cwd() + '/app/assets/images/itemicon/transparent'
    var path_icons = './app/assets/images/itemicon/transparent'
        , icon_radios = $('<div class="icons"/>').appendTo(input_container)
        , icons = []
    node.fs.readdir(path_icons, function (err, files) {
        for (var i in files) {
            icons.push(files[i])
        }
        icons.sort(function (a, b) {
            return parseInt(a.split('.')[0]) - parseInt(b.split('.')[0])
        });
        for (var i in icons) {
            var id = '_input_g' + _g.inputIndex
                , filename = icons[i].split('.')[0]
                , unitDOM = $('<span class="unit"/>').appendTo(icon_radios)
            _g.inputIndex++
            $('<input type="radio" name="icon" value="' + filename + '" id="' + id + '"/>')
                .prop('checked', (data_edit && data_edit.icon == filename))
                .appendTo(unitDOM)
            $('<label for="' + id + '"/>')
                .css('background-image', 'url(../' + path_icons + '/' + icons[i] + ')')
                .appendTo(unitDOM)
        }
    })

    $('<h4/>').html('可装备舰种').appendTo(input_container)
    // equipable_on_type
    // 读取舰种DB，生成选择项
    var shiptype_checkboxes = _p.el.flexgrid.create().addClass('ship_types').appendTo(input_container)
        , equipable_on_type = is_edit ? data_edit['equipable_on_type'] : []
    _db.ship_types.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
        for (var i in docs) {
            var type_id = parseInt(docs[i]['id'])
                , input_id = '_input_g' + _g.inputIndex
                , unitDOM = $('<div class="unit"/>')
            shiptype_checkboxes.appendDOM(unitDOM)
            _g.inputIndex++
            $('<input type="checkbox" name="equipable_on_type" value="' + type_id + '" id="' + input_id + '">')
                .prop('checked', ($.inArray(type_id, equipable_on_type) > -1))
                .appendTo(unitDOM)
            $('<label for="' + input_id + '"/>').html(docs[i].name.zh_cn).appendTo(unitDOM)
        }
    })

    $('<h4/>').html('主属性').appendTo(input_container)
    var stats_radios = _p.el.flexgrid.create().addClass('stats').appendTo(input_container)
        , main_attribute = is_edit ? (data_edit['main_attribute'] || null) : null
        , stats = [
            ['火力', 'fire'],
            ['雷装', 'torpedo'],
            ['对空', 'aa'],
            ['对潜', 'asw'],
            ['爆装', 'bomb'],
            ['命中', 'hit'],
            ['装甲', 'armor'],
            ['回避', 'evasion'],
            ['索敌', 'los'],
            ['运', 'luck']
        ]
    for (var i in stats) {
        var input_id = '_input_g' + _g.inputIndex
            , unitDOM = $('<div class="unit"/>')
        stats_radios.appendDOM(unitDOM)
        _g.inputIndex++
        $('<input type="radio" name="main_attribute" value="' + stats[i][1] + '" id="' + input_id + '">')
            .prop('checked', (stats[i][1] == main_attribute))
            .appendTo(unitDOM)
        $('<label for="' + input_id + '"/>').html(stats[i][0]).appendTo(unitDOM)
    }

    $('<h4/>').html('其他特性').appendTo(input_container);
    (() => {
        var input_id = '_input_g' + _g.inputIndex
            , unitDOM = $('<p/>').appendTo(input_container)
        _g.inputIndex++
        $(`<input type="checkbox" name="equipable_exslot" id="${input_id}">`)
            .prop('checked', is_edit ? data_edit['equipable_exslot'] : false)
            .appendTo(unitDOM)
        $('<label for="' + input_id + '"/>').html("可装备于补强增设栏位").appendTo(unitDOM)
    })()

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
        callback_remove ? function () {
            _db.item_types.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
                callback_remove()
                _frame.modal.hide()
            });
        } : null
    ).appendTo(form)
    return form
}

_frame.app_main.page['items'].gen_form_new_item_type_collection = function (callback, data_edit, callback_remove) {
    callback = callback || function () { }
    let is_edit = (data_edit)
    var self = _frame.app_main.page['items']
        , form = $('<form class="itemform item_type_collection"/>').on('submit', function (e) {
            e.preventDefault()
            var data = $(this).serializeObject()

            if (typeof data['types'] != 'object' && typeof data['types'] != 'undefined')
                data['types'] = [data['types']]
            data['types'] = data['types'] || []

            if (is_edit) {
                // 编辑操作
                _db.item_type_collections.update({
                    '_id': data_edit['_id']
                }, {
                        $set: data
                    }, {}, function (err, numReplaced) {
                        callback(data)
                        _frame.modal.hide()
                    });
            } else {
                // 新建操作
                // 获取当前总数，确定数字ID
                // 之后插入数据
                _db.item_type_collections.count({}, function (err, count) {
                    data['id'] = parseInt(count) + 1
                    _db.item_type_collections.insert(
                        data,
                        callback
                    );
                })
            }
        })
        , input_container = $('<div/>').appendTo(form)

    self.field_input_text('name.zh_cn', '简中', is_edit ? data_edit['name']['zh_cn'] : null).appendTo(input_container)

    $('<h4/>').html('图标').appendTo(input_container)
    // icon
    // 扫描图标目录，生成选择项
    var path_icons = './app/assets/images/itemcollection'
        , icon_radios = $('<div class="icons"/>').appendTo(input_container)
        , icons = []
    node.fs.readdir(path_icons, function (err, files) {
        for (var i in files) {
            icons.push(files[i])
        }
        icons.sort(function (a, b) {
            return parseInt(a.split('.')[0]) - parseInt(b.split('.')[0])
        });
        for (var i in icons) {
            var id = '_input_g' + _g.inputIndex
                , filename = icons[i].split('.')[0]
                , unitDOM = $('<span class="unit"/>').appendTo(icon_radios)
            _g.inputIndex++
            $('<input type="radio" name="icon" value="' + filename + '" id="' + id + '"/>')
                .prop('checked', (data_edit && data_edit.icon == filename))
                .appendTo(unitDOM)
            $('<label for="' + id + '"/>')
                .css('background-image', 'url(../' + path_icons + '/' + icons[i] + ')')
                .appendTo(unitDOM)
        }
    })

    $('<h4/>').html('装备类型').appendTo(input_container)
    _form.create_item_types('types', is_edit ? data_edit['types'] : []).appendTo(input_container)

    self.field_actions(
        is_edit ? '更新' : null,
        callback_remove ? function () {
            _db.item_type_collections.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
                callback_remove()
                _frame.modal.hide()
            });
        } : null
    ).appendTo(form)
    return form
}

















_frame.app_main.page['items'].init = function (page) {
    page.find('section').on({
        'tabview-show': function () {
            var section = $(this)
                , name = section.data('tabname')

            if (!_frame.app_main.page['items'].section[name])
                _frame.app_main.page['items'].section[name] = {}

            var _o = _frame.app_main.page['items'].section[name]

            if (!_o.is_init && _o.init) {
                _o.init(section)
                _o.is_init = true
            }
            switch (name) {
                case '未入库':
                    break;
            }
        }
    })
}









_frame.app_main.page['items'].section['已入库'] = {
    'dom': {
    },

    'init': function (section) {
        _frame.app_main.page['items'].section['已入库'].dom.section = section
    }
}









_frame.app_main.page['items'].section['未入库'] = {
    'dom': {},
    'data': {},
    'data_id': [],

    'init_list': function (index) {
        var self = _frame.app_main.page['items'].section['未入库']
            , id = _frame.app_main.page['items'].section['未入库']['data_id'][index]
            , data = _frame.app_main.page['items'].section['未入库']['data'][id]

        function raw_ship_data_convert(d) {
            var data_converted = {
                'id': d['id'],
                'name': {
                    'ja_jp': d['name']
                },
                'type': null,
                'rarity': d['rarity'] == 0 || d['rarity'] == 1 ? parseInt(d['rarity']) + 1 : parseInt(d['rarity']),
                'stat': {
                    'fire': d['fire'],
                    'torpedo': d['torpedo'],
                    'bomb': d['bomb'],
                    'asw': d['ass'],
                    'aa': d['aac'],
                    'armor': d['armor'],
                    'evasion': d['evasion'],
                    'hit': d['hit'],
                    'los': d['seek'],
                    'range': d['range'],
                },
                'dismantle': JSON.parse(d['dismantle']),
                'default_equipped_on': []
            }

            return data_converted
        }

        self.dom.list.appendDOM(
            $('<button class="unit newitem" data-itemid="' + id + '" data-itemmodal="false"/>')
                .append(
                    $('<span><img src="../pics/items/' + id + '/card.png" alt="' + data['name'] + '"/></span>')
                )
                .on('click', function (e, data_modified) {
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

        if (index >= _frame.app_main.page['items'].section['未入库']['data_id'].length - 1) {
            self.dom.new_container.html('All ' + _frame.app_main.page['items'].section['未入库']['data_id'].length + ' items loaded.')
        } else {
            index++
            self.dom.new_container.html(index + ' / ' + _frame.app_main.page['items'].section['未入库']['data_id'].length + ' items loaded.')
            setTimeout(function () {
                _frame.app_main.page['items'].section['未入库'].init_list(index)
            }, 10)
        }
    },

    'init': function (section) {
        var self = _frame.app_main.page['items'].section['未入库']

        // 载入中信息
        self.dom.new_container = $('<div class="new_container"/>').html('Loading...').appendTo(section)

        // 列表container
        self.dom.main = $('<div class="main"/>').appendTo(section)
        self.dom.list = _p.el.flexgrid.create().addClass('newitems').appendTo(self.dom.main)

        // 扫描目标文件夹，初始化内容
        _db.items.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                for (var i in docs) {
                    self.add(docs[i])
                }
            }
        })
        node.fs.readdir(_g.path.fetched.items, function (err, files) {
            for (var i in files) {
                node.fs.readFile(_g.path.fetched.items + '/' + files[i], 'utf8', function (err, data) {
                    if (err)
                        throw err
                    eval('var _data = ' + data)
                    _frame.app_main.page["items"].section["未入库"]["data"][_data['id']] = _data
                    _frame.app_main.page["items"].section["未入库"]["data_id"].push(_data['id'])
                    if (_frame.app_main.page['items'].section['未入库']["data_id"].length >= files.length) {
                        _frame.app_main.page['items'].section['未入库']['data_id'].sort(function (a, b) { return a - b })
                        _frame.app_main.page['items'].section['未入库'].init_list(0)
                    }
                })
            }
            if (err || !files || !files.length) {
                $('<p/>').html('暂无内容...<br />请初始化数据').appendTo(self.dom.list)
            }
        })
    }
}









_frame.app_main.page['items'].section['类型'] = {
    'dom': {
    },

    // 相关表单/按钮
    'titlebtn': function (d) {
        var self = _frame.app_main.page['items'].section['类型']
            , btn = $('<button class="unit item_type"/>').html(
                '<span style="background-image: url(../app/assets/images/itemicon/transparent/' + d['icon'] + '.png)"></span>'
                + d['name']['zh_cn']
            )
                .on('click', function () {
                    _frame.modal.show(
                        _frame.app_main.page['items'].gen_form_new_item_type(
                            function (newdata) {
                                self.titlebtn(newdata)
                                    .insertAfter(btn)
                                btn.remove()
                            },
                            d,
                            function () {
                                btn.remove()
                            }
                        ), '编辑类型')
                })
        return btn
    },

    // 新建完毕，添加内容
    'add': function (d) {
        var self = _frame.app_main.page['items'].section['类型']
        // 标题，同时也是编辑按钮
        self.dom.list.appendDOM(self.titlebtn(d))
    },

    'init': function (section) {
        var self = _frame.app_main.page['items'].section['类型']

        // 新建按钮
        self.dom.new_container = $('<div class="new_container"/>').appendTo(section)
        self.dom.btnnew = $('<button/>').html('新建').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['items'].gen_form_new_item_type(
                    function (err, newDoc) {
                        self.add(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建类型')
        }).appendTo(self.dom.new_container)

        // 列表container
        self.dom.main = $('<div class="main"/>').appendTo(section)
        self.dom.list = _p.el.flexgrid.create().addClass('item_types').appendTo(self.dom.main)

        // 读取db，初始化内容
        _db.item_types.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                for (var i in docs) {
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
    'titlebtn': function (d) {
        var self = _frame.app_main.page['items'].section['类型集合']
            , btn = $('<button class="item_type_collection"/>').html(
                d['name']['zh_cn']
            )
                .on('click', function () {
                    _frame.modal.show(
                        _frame.app_main.page['items'].gen_form_new_item_type_collection(
                            function (newdata) {
                                self.titlebtn(newdata)
                                    .insertAfter(btn)
                                btn.remove()
                            },
                            d,
                            function () {
                                btn.remove()
                            }
                        ), '编辑类型集合')
                })
        return btn
    },

    // 新建完毕，添加内容
    'add': function (d) {
        var self = _frame.app_main.page['items'].section['类型集合']
        // 标题，同时也是编辑按钮
        self.titlebtn(d).appendTo(self.dom.main)
    },

    'init': function (section) {
        var self = _frame.app_main.page['items'].section['类型集合']

        // 新建按钮
        self.dom.new_container = $('<div class="new_container"/>').appendTo(section)
        self.dom.btnnew = $('<button/>').html('新建').on('click', function () {
            _frame.modal.show(
                _frame.app_main.page['items'].gen_form_new_item_type_collection(
                    function (err, newDoc) {
                        self.add(newDoc)
                        _frame.modal.hide()
                    }
                ), '新建类型集合')
        }).appendTo(self.dom.new_container)

        // 列表container
        self.dom.main = $('<div class="main"/>').appendTo(section)

        // 读取db，初始化内容
        _db.item_type_collections.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                for (var i in docs) {
                    self.add(docs[i])
                }
            }
        })
    }
}









_frame.app_main.page['items'].section['新建'] = {
    'dom': {},

    'init': function (section) {
        var self = _frame.app_main.page['items'].section['新建']
        self.dom.section = section

        // 创建form
        self.dom.form = $('<form/>')
            .on('submit', function (e) {
                e.preventDefault();
                var formdata = self.dom.form.serializeObject()
                    , item_data = {
                        'name': {},
                        'stat': {},
                        'dismantle': [0, 0, 0, 0]
                    }

                if (formdata['id'])
                    item_data['id'] = formdata['id']

                _frame.app_main.page['items'].show_item_form(
                    item_data
                )
            })
            .data({
                'item_data': {}
            })
            .appendTo(section)

        var id = '_input_g' + _g.inputIndex
        _g.inputIndex++
        $('<p/>')
            .append(
                $('<label for="' + id + '"/>').html('ID')
            )
            .append(
                $('<input id="' + id + '" type="number" name="id"/>')
            )
            .appendTo(self.dom.form)

        $('<p class="actions"/>')
            .append(
                $('<button type="submit"/>').html('新建')
            )
            .appendTo(self.dom.form)

    }
}

_frame.app_main.page['entities'] = {}
_frame.app_main.page['entities'].section = {}

_frame.app_main.page['entities'].gen_form_new_entity = function( callback, data_edit, callback_remove ){
	callback = callback || function(){}
	if( data_edit ){
		if( !data_edit['picture'] )
			data_edit['picture'] = {}
	}
	var self = _frame.app_main.page['entities']
		,form = $('<form class="new_entity"/>').on('submit',function(e){
					e.preventDefault()
					var data = $(this).serializeObject()

					// links
						data['links'] = []
						data.link_name = data.link_name.push ? data.link_name : [data.link_name]
						data.link_url = data.link_url.push ? data.link_url : [data.link_url]
						for( var i in data.link_name ){
							data['links'][i] = {
								'name': data.link_name[i],
								'url': data.link_url[i]
							}
						}
						data.link_name = null
						data.link_url = null
						delete data.link_name
						delete data.link_url

					if( data_edit ){
						// 编辑操作
						_db['entities'].update({
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
							_db['entities'].count({}, function(err, count){
								data['id'] = parseInt(count) + 1
								_db['entities'].insert(
									data,
									callback
								);
							})
					}
				})
	
	// 图片: 头像
		let avatarInput = $('<input type="hidden" name="picture.avatar"/>').val( data_edit ? data_edit['picture']['avatar'] : null ).appendTo(form)
			,avatar = $('<div class="avatar"/>').appendTo(form)
		$('<input type="file" accept=".jpg,.jpeg,.bmp,.gif,.png"/>').on({
				'change': function(){
					let $this = $(this)
						,path = $this.val()
						,bitmap = node.fs.readFileSync(path)
						,base64 = new Buffer(bitmap).toString('base64')
						,mime = node.mime.lookup(path)
						,result = 'data:' + mime + ';base64,' + base64
					$this.val('')
					avatarInput.val(result)
					avatarNew.css('background-image', 'url(' + result + ')')
					//console.log(mime, base64)
				}
			}).appendTo(avatar)
		if( data_edit && data_edit['picture']['avatar'] )
			$('<div class="old"/>')
				//.css('background-image', 'url(data:image/jpeg;base64,' + data_edit['picture']['avatar'] + ')')
				.css('background-image', 'url(' + data_edit['picture']['avatar'] + ')')
				.appendTo(avatar)
		let avatarNew = $('<div class="new"/>').appendTo(avatar)

	$('<h4/>').html('名称').appendTo(form)
		_frame.app_main.page['ships'].section['舰种&舰级'].field_input_text('name.ja_jp', '日', data_edit ? data_edit['name']['ja_jp'] : null).appendTo(form)
		_frame.app_main.page['ships'].section['舰种&舰级'].field_input_text('name.zh_cn', '简中', data_edit ? data_edit['name']['zh_cn'] : null).appendTo(form)

	_form.section_order(
		'链接',
		function(data, index){
			var line = $('<p/>')
				,id = '_input_g' + _g.inputIndex
				,name = data['name'] || null
				,url = data['url'] || null

			_g.inputIndex++

			$('<label for="'+id+'"/>').appendTo(line)

			_frame.app_main.page['ships'].gen_input(
					'text',
					'link_name',
					id,
					name,
					{'notRequired': true}
				).appendTo(line)

			id = '_input_g' + _g.inputIndex
			_g.inputIndex++
			$('<label for="'+id+'"/>').html( 'URL' ).appendTo(line)
			_frame.app_main.page['ships'].gen_input(
					'text',
					'link_url',
					id,
					url,
					{'notRequired': true}
				).appendTo(line)

			return line
		},
		$.extend(true,
			[
				{
					'name': 'Twitter',
					'url': 	null
				}
			],data_edit ? data_edit['links'] : [])
	).appendTo(form)
		//_frame.app_main.page['ships'].section['舰种&舰级'].field_input_text('name.zh_cn', '简中', data_edit ? data_edit['name']['zh_cn'] : null).appendTo(form)

	_frame.app_main.page['ships'].section['舰种&舰级'].field_actions(
		data_edit ? '更新' : null,
		callback_remove ? function(){
				_db['entities'].remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
					callback_remove()
					_frame.modal.hide()
				});
			} : null
	).appendTo(form)

	return form
}

_frame.app_main.page['entities'].init = function(page){
	page.find('section').on({
		'tabview-show': function(){
			var section = $(this)
				,name = section.data('tabname')

			if( !_frame.app_main.page['entities'].section[name] )
				_frame.app_main.page['entities'].section[name] = {}

			var _o = _frame.app_main.page['entities'].section[name]

			if( !_o.is_init && _o.init ){
				_o.init(section)
				_o.is_init = true
			}
		}
	})
}









_frame.app_main.page['entities'].section['人物&组织'] = {
	'dom': {},

	// 返回HTML内容
		'get_content': function(d){
			return '<strong>' + d['name']['zh_cn'] + '</strong>'
				+ '<small>' + d['name']['ja_jp'] + '</small>'
		},

	// 相关表单/按钮
		'get_titlebtn': function( d ){
			var self = _frame.app_main.page['entities'].section['人物&组织']
				,btn = $('<button class="unit"/>').html(
							'<strong>'
								+ d['name']['zh_cn']
							+ '</strong><br/>'
							+ '<small><em>'+d['name']['ja_jp']+'</em></small>'
					).on('click', function(){
						_frame.modal.show(
							_frame.app_main.page['entities'].gen_form_new_entity(
								function( newdata ){
									btn.html(self.get_content(newdata))
								},
								d,
								function(){
									btn.remove()
								}
							) , '编辑实体')
					})
			return btn
		},

	// 新建完毕，添加内容
		'added_entity': function( d ){
			var self = _frame.app_main.page['entities'].section['人物&组织']

			// 舰种标题，同时也是编辑按钮
				self.dom.list.appendDOM( self.get_titlebtn(d) )
				//self.get_titlebtn(d).appendTo( self.dom.section )
		},

	'init': function(section){
		var self = _frame.app_main.page['entities'].section['人物&组织']

		// 新建按钮
			self.dom.new_container = $('<div class="new_container"/>').appendTo( section )
				self.dom.btnnew = $('<button/>').html('新建').on('click',function(){
						_frame.modal.show(
							_frame.app_main.page['entities'].gen_form_new_entity(
								function(err, newDoc) {
									self.added_entity(newDoc)
									_frame.modal.hide()
								}
							), '新建实体')
					}).appendTo( self.dom.new_container )

		// 读取实体列表，创建内容
			//self.dom.section = $('<div class="main"/>').appendTo(section)
			self.dom.main = $('<div class="main"/>').appendTo( section )
			self.dom.list = _p.el.flexgrid.create().addClass('flexgrid-basic').appendTo( self.dom.main )

			_db['entities'].find({}).sort({ 'id': 1 }).exec(function(err, docs){
				if( !err ){
					for(var i in docs ){
						self.added_entity(docs[i])
					}
				}
			})

	}
}
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
// http://203.104.209.23/kcs/...

_frame.app_main.page['gamedata'] = {}
_frame.app_main.page['gamedata'].init = function (page) {
    jf.readFile(node.path.join(_g.root, '/fetched_data/api_start2.json'), function (err, obj) {
        if (err)
            return false

        page.empty()
        _frame.app_main.page['gamedata'].tabview = $('<div class="tabview"/>').appendTo(page)

        _frame.app_main.page['gamedata'].data = obj['api_data']

        console.log(obj)
        for (var i in obj['api_data']) {
            var item = i.replace('api_mst_', '')
            if (_frame.app_main.page['gamedata']['init_' + item])
                _frame.app_main.page['gamedata']['init_' + item](obj['api_data'][i])
        }

        _p.initDOM(page)
    })
}

_frame.app_main.page['gamedata'].init_ship = function (data) {
    var section = $('<section class="list" data-tabname="Ships"/>').appendTo(this.tabview);
    var enable_proxy = false;
    //console.log(data)

    /*
        基本信息
            id 			ID
            name 		名
            yomi 		假名
            stype		舰种
                        2	驱逐舰
                        3	轻巡洋舰
                        7	轻航母
            sortno 		图鉴ID
            buildtime	建造时长
            getmes		入手台词
            backs		卡背级别
                        3	睦月
                        4	深雪改
                        5	筑摩改
                        6	能代改
        属性
            houg		火力	初始, 最大
            raig		雷装	初始, 最大
            tyku		对空	初始, 最大
            taik		耐久	初始, 最大
            souk		装甲	初始, 最大
            soku 		航速
                        5	慢
                        10	快
            leng		射程
                        1 	短
                        2 	中
                        3	长
                        4 	超长
            luck		运		初始, 最大
        消耗
            fuel_max	燃料
            bull_max	弹药
        装备 & 搭载
            slot_num 	搭载格数
            maxeq		每格搭载量
        改造
            afterlv		改造等级
            aftershipid	改造后ID
            afterfuel	消耗燃料
            afterbull	消耗弹药
        解体
            broken 		ARRAY 解体资源
        合成
            powup 		ARRAY 合成提高属性
        未知
            voicef		睦月		0
                        深雪改		1
                        能代改		3
    */

    // 遍历 api_mst_shipgraph，做出文件名和ID对应表
    var filename_map = {}
    for (var i in this.data['api_mst_shipgraph']) {
        filename_map[this.data['api_mst_shipgraph'][i]['api_id']] = {
            'filename': this.data['api_mst_shipgraph'][i]['api_filename'],
            'version': parseInt(this.data['api_mst_shipgraph'][i]['api_version'])
        }
    }
    console.log(filename_map)

    // 按钮 & 功能: 下载全部舰娘数据文件
    $('<button type="button"/>')
        .html('下载全部数据文件')
        .on('click', function () {
            var promise_chain = Q.fcall(function () { })
                , folder = node.path.join(_g.root, '/fetched_data/ships_raw/')
                , folder_pics = node.path.join(_g.root, '/fetched_data/ships_pic/')
                , version_file = node.path.join(folder, '_.json')
                , version_last = {}

            function _log(msg) {
                console.log(msg)
            }

            // 开始异步函数链
            promise_chain

                // 检查并创建工作目录
                .then(function () {
                    var deferred = Q.defer()
                    node.mkdirp(folder, function (err) {
                        if (err) {
                            _log('创建目录失败 ' + folder)
                            deferred.reject(new Error(err))
                        } else {
                            _log('已确保目录 ' + folder)
                            deferred.resolve()
                        }
                    })
                    return deferred.promise
                })
                .then(function () {
                    var deferred = Q.defer()
                    node.mkdirp(folder_pics, function (err) {
                        if (err) {
                            _log('创建目录失败 ' + folder_pics)
                            deferred.reject(new Error(err))
                        } else {
                            _log('已确保目录 ' + folder_pics)
                            deferred.resolve()
                        }
                    })
                    return deferred.promise
                })

                // 读取之前的版本号
                .then(function () {
                    var deferred = Q.defer()
                    jf.readFile(version_file, function (err, obj) {
                        version_last = obj || {}
                        deferred.resolve()
                    })
                    return deferred.promise
                })

                // 遍历舰娘数据
                .then(function () {
                    _log('开始遍历舰娘数据')
                    var count = 0
                        , max = _frame.app_main.page['gamedata'].data['api_mst_ship'].length
                    _frame.app_main.page['gamedata'].data['api_mst_ship'].forEach(function (data) {
                        (function (data) {
                            promise_chain = promise_chain.then(function () {
                                var deferred = Q.defer()
                                    , file = node.url.parse('http://' + server_ip + '/kcs/resources/swf/ships/' + filename_map[data['api_id']]['filename'] + '.swf')
                                    , filename = data['api_id'] + ' - ' + data['api_name'] + '.swf'
                                    , file_local = node.path.join(folder, data['api_id'] + '.swf')
                                    , file_local_rename = node.path.join(folder, filename)
                                    , folder_export = node.path.join(folder_pics, '\\' + data['api_id'])
                                    , stat = null
                                    , version = filename_map[data['api_id']]['version'] || 0
                                    , skipped = false
                                    , statusCode = null

                                try {
                                    var stat = node.fs.lstatSync(file_local_rename)
                                    if (!stat || !stat.isFile()) {
                                        stat = null
                                    }
                                } catch (e) { }

                                _log('========== ' + count + '/' + max + ' ==========')
                                _log('    [' + data['api_id'] + '] ' + data['api_name']
                                    + ' | 服务器版本: ' + version
                                    + ' | 本地版本: ' + (version_last[data['api_id']] || '无')
                                )

                                if (stat && version <= (version_last[data['api_id']] || -1)) {
                                    skipped = true
                                    _log('    本地版本已最新，跳过')
                                    count++
                                    deferred.resolve()
                                } else {
                                    _log('    开始获取: ' + file.href)
                                    version_last[data['api_id']] = version

                                    Q.fcall(function () { })

                                        // 向服务器请求 swf 文件
                                        .then(function () {
                                            var deferred2 = Q.defer()
                                            request({
                                                'uri': file,
                                                'method': 'GET',
                                                'proxy': enable_proxy ? proxy : null
                                            }).on('error', function (err) {
                                                deferred2.reject(new Error(err))
                                            }).on('response', function (response) {
                                                statusCode = response.statusCode
                                            }).pipe(
                                                node.fs.createWriteStream(file_local)
                                                    .on('finish', function () {
                                                        _log('    文件已保存: ' + data['api_id'] + ' - ' + data['api_name'] + '.swf')
                                                        count++
                                                        jf.writeFile(version_file, version_last, function (err) {
                                                            if (err) {
                                                                deferred2.reject(new Error(err))
                                                            } else {
                                                                _log('    版本文件已更新')
                                                                deferred2.resolve()
                                                            }
                                                        })
                                                        if (statusCode != 200 || data['api_name'] == 'なし') {
                                                            skipped = true
                                                        }
                                                    })
                                                )
                                            return deferred2.promise
                                        })

                                        // 反编译 swf
                                        .then(function () {
                                            var deferred2 = Q.defer()
                                            if (skipped) {
                                                deferred2.resolve()
                                            } else {
                                                _log('    开始反编译 SWF')
                                                var exec = node.require('child_process').exec
                                                    , child

                                                node.mkdirp.sync(folder_export)
                                                _log('    目录已确保 ' + folder_export)

                                                child = exec(
                                                    'java -jar .\\app\\assets\\FFDec\\ffdec.jar'
                                                    + ' -format image:png'
                                                    + ' -export image ' + folder_export
                                                    + ' ' + file_local,
                                                    function (err, stdout, stderr) {
                                                        _log('    stdout: ' + stdout);
                                                        _log('    stderr: ' + stderr);
                                                        if (err !== null) {
                                                            _log('    exec error: ' + err);
                                                            deferred2.reject(new Error(err))
                                                        } else {
                                                            _log('    SWF 反编译完成')
                                                            deferred2.resolve()
                                                        }
                                                    });
                                            }
                                            return deferred2.promise
                                        })

                                        // 如果执行了 swf 反编译，整理反编译结果
                                        .then(function () {
                                            var deferred2 = Q.defer()
                                            if (skipped) {
                                                deferred2.resolve()
                                            } else {
                                                node.fs.readdir(folder_export, function (err, files) {
                                                    if (err) {
                                                        deferred2.reject(new Error(err))
                                                    } else {
                                                        deferred2.resolve(files)
                                                    }
                                                })
                                            }
                                            return deferred2.promise
                                        })
                                        .then(function (files) {
                                            var chain2 = Q.fcall(function () { })
                                                , deferred2 = Q.defer()
                                                , count2 = 0

                                            files = files || []
                                            files = files.sort(function (a, b) {
                                                var name_a = parseInt(a) || -999
                                                    , name_b = parseInt(b) || -999
                                                return name_a - name_b
                                            })

                                            if (files.length) {
                                                files.forEach(function (_filename) {
                                                    (function (_filename, count2) {
                                                        chain2 = chain2.then(function () {
                                                            var deferred3 = Q.defer()
                                                                , parsed = node.path.parse(_filename)
                                                                , new_name = Math.floor(parseInt(parsed['name']) / 2) + parsed['ext'].toLowerCase()
                                                                , _path = node.path.join(folder_export, _filename)
                                                            if (node.fs.lstatSync(_path).isFile()) {
                                                                node.fs.rename(
                                                                    _path,
                                                                    node.path.join(folder_export, new_name),
                                                                    function (err) {
                                                                        if (err !== null) {
                                                                            deferred3.reject(new Error(err))
                                                                        } else {
                                                                            _log('    反编译: ' + new_name)
                                                                            deferred3.resolve()
                                                                        }
                                                                        if (count2 >= files.length - 1) {
                                                                            deferred2.resolve()
                                                                        }
                                                                    }
                                                                )
                                                            } else {
                                                                deferred3.resolve()
                                                                if (count2 >= files.length - 1) {
                                                                    deferred2.resolve()
                                                                }
                                                            }
                                                        })
                                                    })(_filename, count2)
                                                    count2++
                                                })
                                            } else {
                                                deferred2.resolve()
                                            }

                                            return deferred2.promise
                                        })

                                        // 重命名本地 swf
                                        .then(function () {
                                            var deferred2 = Q.defer()
                                            node.fs.rename(
                                                file_local,
                                                file_local_rename,
                                                function (err) {
                                                    if (err !== null) {
                                                        deferred2.reject(new Error(err))
                                                    } else {
                                                        _log('    SWF 文件重命名为 ' + filename)
                                                        deferred2.resolve()
                                                    }
                                                }
                                            )
                                            return deferred2.promise
                                        })
                                        .catch(function (err) {
                                            _log(err)
                                            deferred.reject(new Error(err))
                                        })
                                        .done(function () {
                                            deferred.resolve()
                                        })
                                }

                                return deferred.promise
                            })
                        })(data)
                    })
                    return true
                })

                // 错误处理
                .catch(function (err) {
                    _log(err)
                })
                .done(function () {
                    _log('ALL DONE')
                })
        }).appendTo(section)

    // 按钮 & 功能: 根据游戏数据更新舰娘数据库
    $('<button type="button"/>')
        .html('更新舰娘数据库')
        .on('click', function () {
            var promise_chain = Q.fcall(function () { })

            function _log(msg) {
                console.log(msg)
            }

            // 开始异步函数链
            promise_chain

                // 获取全部 _id & id
                .then(function () {
                    var deferred = Q.defer()
                    _db.ships.find({}, function (err, docs) {
                        if (err) {
                            deferred.reject(err)
                        } else {
                            var d = {}
                            for (var i in docs) {
                                d[docs[i].id] = docs[i]._id
                            }
                            deferred.resolve(d)
                        }
                    })
                    return deferred.promise
                })

                // 更新数据
                .then(function (map) {
                    _log(map)
                    _log('开始遍历舰娘数据')

                    var count = 0
                        , max = _frame.app_main.page['gamedata'].data['api_mst_ship'].length

                    _frame.app_main.page['gamedata'].data['api_mst_ship'].forEach(function (data) {
                        (function (data) {
                            function _done(cur) {
                                if (cur >= max) {
                                    promise_chain.fin(function () {
                                        _log('遍历舰娘数据完成')
                                    })
                                }
                            }
                            promise_chain = promise_chain.then(function () {
                                var deferred = Q.defer()
                                if (map[data.api_id]) {
                                    _log('    [' + data.api_id + '] ' + data.api_name + ' 开始处理')
                                    count++

                                    let modified = {}
                                        , unset = {}
                                    // base
                                    modified['no'] = data['api_sortno']
                                    modified['buildtime'] = data['api_buildtime']
                                    modified['lines.start'] = data['api_getmes']
                                    modified['rare'] = data['api_backs']
                                    // stat
                                    modified['stat.fire'] = data['api_houg'][0]
                                    modified['stat.fire_max'] = data['api_houg'][1]
                                    modified['stat.torpedo'] = data['api_raig'][0]
                                    modified['stat.torpedo_max'] = data['api_raig'][1]
                                    modified['stat.aa'] = data['api_tyku'][0]
                                    modified['stat.aa_max'] = data['api_tyku'][1]
                                    modified['stat.hp'] = data['api_taik'][0]
                                    modified['stat.hp_max'] = data['api_taik'][1]
                                    modified['stat.armor'] = data['api_souk'][0]
                                    modified['stat.armor_max'] = data['api_souk'][1]
                                    modified['stat.speed'] = data['api_soku']
                                    modified['stat.range'] = data['api_leng']
                                    modified['stat.luck'] = data['api_luck'][0]
                                    modified['stat.luck_max'] = data['api_luck'][1]
                                    // consum
                                    modified['consum.fuel'] = data['api_fuel_max']
                                    modified['consum.ammo'] = data['api_bull_max']
                                    // slot
                                    var i = 0
                                    modified['slot'] = []
                                    while (i < (parseInt(data['api_slot_num']) || 0)) {
                                        modified['slot'].push(data['api_maxeq'][i] || 0)
                                        i++
                                    }
                                    // remodel
                                    //modified['remodel_cost.fuel']	= data['api_afterfuel']
                                    modified['remodel_cost.ammo'] = data['api_afterbull']
                                    modified['remodel_cost.steel'] = data['api_afterfuel']
                                    unset['remodel_cost.fuel'] = true
                                    // extra slot extra equipable ids
                                    let additional_exslot_item_ids = []
                                    _frame.app_main.page['gamedata'].data.api_mst_equip_exslot_ship.forEach(ex => {
                                        if (!Array.isArray(ex.api_ship_ids) || ex.api_ship_ids.indexOf(data.api_id) < 0) return
                                        additional_exslot_item_ids.push(ex.api_slotitem_id)
                                    })
                                    if (additional_exslot_item_ids.length)
                                        modified['additional_exslot_item_ids'] = additional_exslot_item_ids
                                    else
                                        unset['additional_exslot_item_ids'] = true
                                    // misc
                                    modified['scrap'] = data['api_broken']
                                    modified['modernization'] = data['api_powup']
                                    modified['time_modified'] = _g.timeNow()

                                    _log(modified)
                                    _db.ships.update({
                                        '_id': map[data['api_id']]
                                    }, {
                                            $set: modified,
                                            $unset: unset
                                        }, function () {
                                            deferred.resolve()
                                            _done(count)
                                        })
                                } else {
                                    _log('    [' + data.api_id + '] ' + data.api_name + ' 不存在于数据库，跳过')
                                    count++
                                    deferred.resolve()
                                    _done(count)
                                }
                                return deferred.promise
                            })
                        })(data)
                    })
                    return true
                })

                // 错误处理
                .catch(function (err) {
                    _log(err)
                })
                .done(function () {
                    _log('ALL DONE')
                })
        }).appendTo(section)

    // 选项：代理
    var _enable_proxy = $('<input name="enable_proxy" type="checkbox" />')
    $('<label/>')
        .append(_enable_proxy.on('change', function () {
            enable_proxy = _enable_proxy.prop('checked')
        }))
        .append($('<span>使用代理</span>'))
        .appendTo(section)
}

_frame.app_main.page['gamedata'].init_slotitem = function (data) {
    var section = $('<section class="list" data-tabname="Equipments"/>').appendTo(this.tabview)


    // 按钮 & 功能: 根据游戏数据更新舰娘数据库
    $('<button type="button"/>')
        .html('更新装备数据库')
        .on('click', function () {
            let promise_chain = Q.fcall(function () { })
                , thisDb = _db.items

            const { api_data: api_data } = _g.getGameApi()
            const {
                api_mst_equip_exslot,
                api_mst_equip_exslot_ship,
                api_mst_slotitem
            } = api_data

            console.log(api_data)

            function _log(msg) {
                console.log(msg)
            }

            _log('')
            _log('更新装备数据库')

            // 开始异步函数链
            promise_chain

                // 更新数据 - 所有装备类型
                // 获取装备类型数据
                .then(() => {
                    console.log('丨')
                    console.log('丨 处理装备类型')
                    console.log('丨 > 补强增设栏位装备类型', api_mst_equip_exslot)
                    console.log('丨 > 从数据库读取所有装备类型数据')
                    const deferred = Q.defer()
                    _db.item_types.find({}, (err, docs) => {
                        if (err) return deferred.reject(err)
                        console.log('丨 > 从数据库读取所有装备类型数据 - 完成')
                        deferred.resolve(docs)
                    })
                    return deferred.promise
                })

                .then(types => {
                    const deferred = Q.defer()
                    let chain = Q(() => true)
                    console.log('丨 > 检查匹配')
                    // console.log(types, api_mst_equip_exslot)
                    types.forEach(type => {
                        const modify = {}
                        const matched = api_mst_equip_exslot.includes(type.id_ingame)
                        if (matched) {
                            modify['$set'] = {
                                equipable_exslot: true
                            }
                        } else {
                            modify['$unset'] = {
                                equipable_exslot: true
                            }
                        }
                        chain = chain.then(() => {
                            const deferred = Q.defer()
                            _db.item_types.update(
                                {
                                    '_id': type._id
                                }, modify, function (err) {
                                    if (err) return deferred.reject(err)
                                    if (matched)
                                        console.log(`丨   > 匹配: [${type.id}] (${type.id_ingame}) ${type.name.ja_jp}`)
                                    deferred.resolve()
                                }
                            )
                            return deferred.promise
                        })
                    })

                    chain = chain
                        .then(() => deferred.resolve())
                        .catch(err => deferred.reject(err))

                    return deferred.promise
                })
                .then(() => console.log('丨 处理装备类型 - 完成'))

                // 获取全部装备数据
                .then(() => {
                    console.log('丨')
                    console.log('丨 处理装备')
                    console.log('丨 > 从数据库读取所有装备数据')
                    const deferred = Q.defer()
                    _db.items.find({}, (err, docs) => {
                        if (err) return deferred.reject(err)
                        console.log('丨 > 从数据库读取所有装备数据 - 完成')
                        deferred.resolve(docs)
                    })
                    return deferred.promise
                })

                // 更新数据 - 所有装备
                .then(items => {
                    // _log(map)

                    // var count = 0
                    //     , list = api_data.api_mst_slotitem
                    //     , max = list.length

                    const deferred = Q.defer()
                    const mapIdIndex = {}
                    let chain = Q(() => true)

                    console.log('丨 > 从游戏API获取装备ID与Index的对应')
                    api_mst_slotitem.forEach((item, index) => {
                        mapIdIndex[item.api_id] = index
                    })
                    // console.log(mapIdIndex)
                    console.log('丨 > 从游戏API获取装备ID与Index的对应 - 完成')

                    items.forEach(item => {
                        chain = chain.then(() => {
                            const deferred = Q.defer()
                            const index = mapIdIndex[item.id]
                            // console.log(item)

                            if (typeof index === 'undefined') {
                                setTimeout(() => {
                                    deferred.resolve()
                                })
                            }

                            const set = {}
                            const unset = {}
                            const data = api_mst_slotitem[index]
                            const getApiData = (key, apiName) => {
                                if (typeof data['api_' + apiName] === 'undefined') {
                                    unset[key] = true
                                    return undefined
                                }
                                set[key] = data['api_' + apiName]
                                return data['api_' + apiName]
                            }

                            // base
                            getApiData('name.ja_jp', 'name')
                            getApiData('rarity', 'rare')
                            // stat
                            getApiData('stat.fire', 'houg')
                            getApiData('stat.torpedo', 'raig')
                            getApiData('stat.bomb', 'baku')
                            getApiData('stat.asw', 'tais')
                            getApiData('stat.aa', 'tyku')
                            getApiData('stat.armor', 'souk')
                            getApiData('stat.evasion', 'houk')
                            getApiData('stat.hit', 'houm')
                            getApiData('stat.los', 'saku')
                            getApiData('stat.range', 'leng')
                            getApiData('stat.distance', 'distance')
                            getApiData('stat.cost', 'cost')
                            // type ingame
                            getApiData('type_ingame', 'type')
                            // misc
                            getApiData('dismantle', 'broken')
                            set['time_modified'] = _g.timeNow()
                            // ex-slot extra ships
                            api_mst_equip_exslot_ship.filter(obj => (
                                obj.api_slotitem_id === item.id
                            )).forEach(obj => {
                                console.log(`丨   > [${item.id}] ${item.name.ja_jp} - 补强增设栏位额外舰娘: `, obj.api_ship_ids)
                                set.exslot_on_ship = obj.api_ship_ids
                            })
                            if (!Array.isArray(set.exslot_on_ship) || !set.exslot_on_ship.length) {
                                unset.exslot_on_ship = true
                            }
                            // 清除历史遗留数据
                            [
                                'equipable_exslot_on_ship'
                            ].forEach(key => {
                                unset[key] = true
                            })

                            // _log(set)
                            _db.items.update(
                                {
                                    '_id': item._id
                                }, {
                                    $set: set,
                                    $unset: unset
                                }, (err) => {
                                    if (err) return deferred.reject(err)
                                    // console.log(`丨   > 修改后: `, set)
                                    deferred.resolve()
                                }
                            )
                            return deferred.promise
                        })
                    })

                    chain = chain
                        .then(() => deferred.resolve())
                        .catch(err => deferred.reject(err))

                    return deferred.promise
                })
                .then(() => console.log('丨 处理装备 - 完成'))

                // 错误处理
                .catch(function (err) {
                    _log(err)
                })
                .done(function () {
                    console.log('丨')
                    _log('更新装备数据库 - 完成')
                })
        }).appendTo(section)

    for (var i in data) {
        /*
            基本信息
                id 			装备ID
                sortno 		图鉴ID
                name 		装备名
                info 		装备描述
                rare 		稀有度
            属性
                houg		火力
                raig		雷装
                tyku		对空
                tais		对潜
                taik		耐久
                saku 		索敌
                souk		装甲
                soku 		航速
                luck		运
                leng		射程
                            1 	短
                            2 	中
                            3	长
                            4 	超长
                houk		回避
                houm		命中
                baku		爆装
            解体
                broken 		ARRAY 解体资源
            未知
                atap
                bakk
                raik
                raim
                sakb
                type
                usebull
        */
        (function (d) {
            var dom = $('<section/>').appendTo(section)
                , checkbox = $('<input type="checkbox" id="rawdata_slotitem_' + d['api_id'] + '"/>').appendTo(dom)
                , title = $('<label for="rawdata_slotitem_' + d['api_id'] + '"/>').html('[#' + d['api_id'] + '] ' + d['api_name']).appendTo(dom)

            _db.items.find({ 'id': d['api_id'] }, function (err, docs) {
                if (err || !docs.length) {
                    // 数据库中不存在
                    dom.addClass('new')
                    $('<button/>').on('click', function () {
                        _frame.app_main.page['items'].show_item_form({
                            'id': d['api_id'],
                            'rarity': d['api_rare'],
                            'name': {
                                'ja_jp': d['api_name']
                            },
                            'stat': {
                                'fire': d['api_houg'],
                                'torpedo': d['api_raig'],
                                'bomb': d['api_baku'],
                                'asw': d['api_tais'],
                                'aa': d['api_tyku'],
                                'armor': d['api_souk'],
                                'evasion': d['api_houk'],
                                'hit': d['api_houm'],
                                'los': d['api_saku'],
                                'range': d['api_leng'],
                                'distance': d['api_distance']
                            },
                            'dismantle': d['api_broken']
                        })
                    }).html('录入').appendTo(dom)
                    // http://203.104.209.23/kcs/resources/image/slotitem/card/139.png
                } else if (!err) {
                    // 对比数据
                    //console.log(docs[0], d)
                }
            })
        })(data[i])
    }
}

_frame.app_main.page['gamedata'].init_useitem = function (data) {
    var section = $('<section class="list" data-tabname="Consumables"/>').appendTo(this.tabview)

    let names = {}


    // 按钮 & 功能: 更新本地道具数据库
    $('<button type="button"/>')
        .html('更新道具数据库')
        .on('click', function () {
            if (!_db.consumables) {
                _db.consumables
                    = new node.nedb({
                        filename: node.path.join(_g.path.db, '/consumables.nedb'),
                        autoload: true
                    })
            }
            let db = _db.consumables
                , promise = Q.fcall(() => {
                    let deferred = Q.defer()
                    db.remove({}, { multi: true }, function (err, numRemoved) {
                        deferred.resolve()
                    });
                    return deferred.promise
                })

            promise.then(() => {
                let deferred = Q.defer()
                for (let i in data) {
                    let item = data[i]
                        , id = item.api_id
                        , doc = {}
                    for (let key in item) {
                        let _key = key.replace(/^api_/g, '')
                        let value = item[key]
                        switch (_key) {
                            case 'name':
                                value = names[id] ? names[id] : {
                                    ja_jp: item[key],
                                    zh_cn: ''
                                }
                                break;
                        }
                        doc[_key] = value
                    }
                    promise = promise.then(() => {
                        let deferred = Q.defer()
                        db.insert(doc, function (err, newDoc) {
                            deferred.resolve()
                        });
                        return deferred.promise
                    })
                }
                promise = promise.done(() => {
                    deferred.resolve()
                })
                return deferred.promise
            })

                // 错误处理
                .catch(function (err) {
                    _log(err)
                })
                .done(function () {
                    _log('ALL DONE')
                })
        }).appendTo(section)

    for (let i in data) {
        let item = data[i]
            , id = item.api_id
            , input

        if (item.api_name) {
            names[id] = _g.data.consumables[id] ? _g.data.consumables[id].name : {
                ja_jp: item.api_name,
                zh_cn: ''
            }
            input = $(`<input type="text"/>`).val(names[id].zh_cn).on({
                input: e => {
                    names[id].zh_cn = e.target.value
                }
            })
        }

        $('<hr/>').appendTo(section)
        $('<dl/>').appendTo(section)
            .append($(`<dt>${item.api_name}</dt>`))
            .append(input)
            .append($(`<dd>${item.api_description.join('<br/>')}</dd>`))
    }
}

_frame.app_main.page['guide'] = {}
_frame.app_main.page['guide'].section = {}








_frame.app_main.page['guide'].field_input_text = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<input type="text" name="'+name+'" />').val(value).appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['guide'].field_input_date = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<input type="date" name="'+name+'" />').val(value).appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['guide'].field_input_checkbox = function(name, title, value, suffix){
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
_frame.app_main.page['guide'].field_input_textarea = function(name, title, value, suffix){
	var line = $('<p/>')
		,label = $('<label/>').appendTo(line)
	$('<span/>').html(title).appendTo(label)
	$('<textarea name="'+name+'" />').val(value).attr({
		'cols': 	60,
		'rows': 	20
	}).appendTo(label)
	if( suffix )
		$('<span/>').html(suffix).appendTo(label)
	return line
}
_frame.app_main.page['guide'].field_actions = function(text, func_delete){
	var line = $('<p class="actions"/>')
	$('<button type="submit"/>').html(text || '提交').appendTo(line)
	if( func_delete ){
		$('<button type="button"/>').html('删除').on('click', function(){
			func_delete()
		}).appendTo(line)
	}
	return line
}










_frame.app_main.page['guide'].gen_form_new_guide = function( callback, data_edit, callback_remove ){
	callback = callback || function(){}
	let is_edit = (data_edit)
	var self = this
		,form = $('<form class="guide"/>').on('submit',function(e){
					e.preventDefault()
					var data = $(this).serializeObject()

					console.log(data)
					//return data

					if( is_edit ){
						// 编辑操作
						_db.guides.update({
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
							_db.guides.count({}, function(err, count){
								data['id'] = parseInt(count) + 1
								_db.guides.insert(
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
			'title',
			'text',
			'guide'
		],
		{
			'default': is_edit ? data_edit['type'] : null
		}).insertBefore(input_container)
	self.field_input_text('title', '标题', is_edit ? data_edit['title'] : null).appendTo(input_container)
	self.field_input_text('title-html', '网页标题', is_edit ? data_edit['title-html'] : null).appendTo(input_container)
	self.field_input_text('name', 'ID', is_edit ? data_edit['name'] : null).appendTo(input_container)
	self.field_input_text('path', 'Path', is_edit ? data_edit['path'] : null).appendTo(input_container)
	self.field_input_text('template', '模板', is_edit ? data_edit['template'] : null).appendTo(input_container)
	self.field_input_text('class-nav', 'class-nav', is_edit ? data_edit['class-nav'] : null).appendTo(input_container)
	self.field_input_text('class-main', 'class-main', is_edit ? data_edit['class-main'] : null).appendTo(input_container)
	//self.field_input_text('comment-id', '评论ID', is_edit ? data_edit['comment-id'] : null).appendTo(input_container)
	//self.field_input_date('date', '更新日', is_edit ? data_edit['date'] : null).appendTo(input_container)
	self.field_input_checkbox('has-comment', null, is_edit ? data_edit['has-comment'] : false, '是否允许评论').appendTo(input_container)
	self.field_input_textarea('content', '内容', is_edit ? data_edit['content'] : null).appendTo(input_container)

	self.field_actions(
		is_edit ? '更新' : null,
		callback_remove ? function(){
				_db.guides.remove({ _id: data_edit['_id'] }, {}, function (err, numRemoved) {
					callback_remove()
					_frame.modal.hide()
				});
			} : null
	).appendTo(form)
	return form
}

















_frame.app_main.page['guide'].init = function(page){
	page.find('section').on({
		'tabview-show': function(){
			var section = $(this)
				,name = section.data('tabname')

			if( !_frame.app_main.page['guide'].section[name] )
				_frame.app_main.page['guide'].section[name] = {}

			var _o = _frame.app_main.page['guide'].section[name]

			if( !_o.is_init && _o.init ){
				_o.init(section)
				_o.is_init = true
			}
		}
	})
}









_frame.app_main.page['guide'].section['攻略'] = {
	'dom': {
	},
	
	fileOrder: node.path.join(_g.path['db-other'], 'guides_order.json'),

	// 相关表单/按钮
		'titlebtn': function( d ){
			var self = this
			/*
				,btn = $('<button class="unit"/>').html(
							'<strong>'
								+ d['type'].toUpperCase()
							+ '</strong><br/>'
							+ '<small><em>'+d['title']+'</em></small>'
						)
						.on('click', function(){
							_frame.modal.show(
								_frame.app_main.page['guide'].gen_form_new_guide(
									function( newdata ){
										self.titlebtn( newdata )
											.insertAfter( btn )
										btn.remove()
									},
									d,
									function(){
										btn.remove()
									}
								) , '编辑攻略')
						})
			*/
				,line = $('<div class="unit" data-id="'+d._id+'"/>')
							.append(
								$('<button class="title"/>').html(
									'<strong>'
										+ d['type'].toUpperCase()
									+ '</strong><br/>'
									+ '<small><em>'+d['title']+'</em></small>'
								)
								.on('click', function(){
									_frame.modal.show(
										_frame.app_main.page['guide'].gen_form_new_guide(
											function( newdata ){
												self.titlebtn( newdata )
													.insertAfter( line )
												line.remove()
											},
											d,
											function(){
												line.remove()
											}
										) , '编辑攻略')
								})
							)
							.append(
								$('<button class="arrow up"/>')
									.html('↑')
									.on('click', function(){
										self.move(line, -1)
									})
							)
							.append(
								$('<button class="arrow down"/>')
									.html('↓')
									.on('click', function(){
										self.move(line, 1)
									})
							)
			return line
		},

	// 新建完毕，添加内容
		'add': function( d, isNew ){
			var self = this
			// 标题，同时也是编辑按钮
				//self.dom.list.appendDOM( self.titlebtn(d) )
			if( isNew ){
				self.titlebtn(d).prependTo(self.dom.list)
				_frame.app_main.page['guide'].section['攻略'].move()
			}else
				self.titlebtn(d).appendTo(self.dom.list)
		},
	
	// 调整位置
		move: function($line, delta){
			if( $line ){
				if( delta == -1 ){
					let prev = $line.prev()
					if( prev && prev.length )
						$line.insertBefore(prev)
				}else if( delta == 1 ){
					let next = $line.next()
					if( next && next.length )
						$line.insertAfter(next)
				}
			}
			// 更新order
				let order = []
				this.dom.list.children('.unit').each(function(i, el){
					let id = $(el).attr('data-id')
					order.push(id)
				})
				console.log(order)
				node.fs.writeFileSync(
					this.fileOrder,
					order.join(',')
				)
		},

	'init': function(section){
		var self = this

		// 新建按钮
			self.dom.new_container = $('<div class="new_container"/>').appendTo( section )
				self.dom.btnnew = $('<button/>').html('新建').on('click',function(){
						_frame.modal.show(
							_frame.app_main.page['guide'].gen_form_new_guide(
								function(err, newDoc) {
									self.add(newDoc, true)
									_frame.modal.hide()
								}
							), '新建攻略')
					}).appendTo( self.dom.new_container )

		// 列表container
			self.dom.main = $('<div class="main"/>').appendTo( section )
			//self.dom.list = _p.el.flexgrid.create().addClass('flexgrid-basic').appendTo( self.dom.main )
			self.dom.list = $('<div class="guidlist"/>').appendTo( self.dom.main )

		// 读取db，初始化内容
			let order = []
				,data = {}
			Q.fcall(function(){})
			
			// 检查顺序JSON是否存在
			.then(function(){
				let exist = false
					,deferred = Q.defer()
				try{
					let stats = node.fs.lstatSync(this.fileOrder);
					if(!stats.isDirectory()){
						exist = true
					}
				}catch(e){}
				if( !exist ){
					node.fs.writeFile(
						this.fileOrder,
						'',
						function(err){
							if( err ){
								deferred.reject(new Error(err))
							}else{
								deferred.resolve()
							}
						}
					)
				}else{
					deferred.resolve()
				}
				return deferred.promise
			}.bind(this))
			.then(function(){
				/*
				let deferred = Q.defer()
				_db.guides_order.find({}).sort({'order': 1}).exec(function(err, docs){
					if( !err && docs && docs.length ){
						docs.forEach(function(doc){
							order.push(doc.guideid)
						})
					}
					deferred.resolve()
				})
				return deferred.promise
				*/
				order = node.fs.readFileSync(this.fileOrder, 'utf-8').split(',')
				return order
			}.bind(this))
			.then(function(){
				let deferred = Q.defer()
				_db.guides.find({}).sort({'id': 1}).exec(function(err, docs){
					if( !err && docs && docs.length ){
						docs.forEach(function(doc){
							if( order.indexOf( doc._id ) < 0 )
								order.push(doc._id)
							data[doc._id] = doc
						})
					}
					deferred.resolve()
				})
				return deferred.promise
			})
			.then(function(){
				order.forEach(function(_id){
					if( _id && data[_id] )
						self.add(data[_id])
				})
			})
	}
}









_frame.app_main.page['guide'].section['输出'] = {
	'dom': {
	},

	'init': function(section){
		var self = this
		
		$('<input type="text" />')
			.on('input', function(){
				_config.set( 'guides_export_to', $(this).val() )
			})
			.val( _config.get( 'guides_export_to' ) )
			.appendTo( section )
		
		$('<button type="button" />')
			.on('click', function(){
				_frame.app_main.page['guide'].section['输出'].export(_config.get( 'guides_export_to' ))
			})
			.html('输出')
			.appendTo( section )
			
		_frame.app_main.page['guide'].section['输出'].dom.log = $('<div/>').appendTo(section)
	}
}
_frame.app_main.page['guide'].section['输出'].export = function(dest){
	if( !dest )
		return false
	
	_frame.app_main.page['guide'].section['输出'].dom.log.empty()
	
	function filter(html){				
		let searchRes = null
			,scrapePtrn = /\[\[([^\:^\]^\[]+)\:([0-9]+)\:LINK\]\]/gi
		while( (searchRes = scrapePtrn.exec(html)) !== null ){
			try{
				let d, t = searchRes[1].toLowerCase(), u = 'http://fleet.diablohu.com'
				switch( t ){
					case 'ship':
					case 'ships':
						d = _g.data.ships[searchRes[2]]._name
						u = 'http://fleet.diablohu.com/ships/'+searchRes[2]
						break;
					case 'item':
					case 'items':
					case 'equip':
					case 'equipment':
					case 'equipments':
						d = _g.data.items[searchRes[2]]._name
						u = 'http://fleet.diablohu.com/equipments/'+searchRes[2]
						break;
					case 'entity':
					case 'entities':
						d = _g.data.entities[searchRes[2]]._name
						u = 'http://fleet.diablohu.com/entities/'+searchRes[2]
						break;
				}
				html = html.replace( searchRes[0],
					'['+d+']('+u+')'
				)
			}catch(e){}
		}

		return html
	}
	
	let tmpl_file		= node.path.join( dest, '/!templates/base.html' )
		//,dest_file		= node.path.join( dest, 'index.html' )
		,promise_chain 	= Q.fcall(function(){})
		,template
		,order = []
		,data = {}

	// 开始异步函数链
		promise_chain
	
	// 读取模板文件
		.then(function(){
			var deferred = Q.defer()
			node.fs.readFile(tmpl_file, 'utf8', function(err, data){
				if(err){
					deferred.reject(err)
				}
				template = data
				deferred.resolve()
			})
			return deferred.promise
		})

	// 检查顺序JSON是否存在
		.then(function(){
			let exist = false
				,deferred = Q.defer()
			try{
				let stats = node.fs.lstatSync(_frame.app_main.page['guide'].section['攻略'].fileOrder);
				if(!stats.isDirectory()){
					exist = true
				}
			}catch(e){}
			if( !exist ){
				node.fs.writeFile(
					_frame.app_main.page['guide'].section['攻略'].fileOrder,
					'',
					function(err){
						if( err ){
							deferred.reject(new Error(err))
						}else{
							deferred.resolve()
						}
					}
				)
			}else{
				deferred.resolve()
			}
			return deferred.promise
		})
	
	// 读取顺序
		.then(function(){
			order = node.fs.readFileSync(_frame.app_main.page['guide'].section['攻略'].fileOrder, 'utf-8').split(',')
			return order
		})
	
	// 读取数据
		.then(function(){
			let deferred = Q.defer()
			_db.guides.find({}).sort({'id': 1}).exec(function(err, docs){
				if( !err && docs && docs.length ){
					docs.forEach(function(doc){
						if( order.indexOf( doc._id ) < 0 )
							order.push(doc._id)
						data[doc._id] = doc
					})
				}else{
					deferred.reject(err)
				}
				deferred.resolve()
			})
			return deferred.promise
		})
		.then(function(){
			let docs = []
			order.forEach(function(_id){
				if( _id && data[_id] )
					docs.push(data[_id])
			})
			return docs
		})
	
	// 读取数据库
	/*
		.then(function(){
			var deferred = Q.defer()
			_db.guides.find({}).sort({'id': 1}).exec(function(err, docs){
				if(err){
					deferred.reject(err)
				}
				deferred.resolve(docs)
			})
			return deferred.promise
		})
		*/
	
	// 生成首页
		.then(function(docs){
			let deferred = Q.defer()
			let html = template
			let html_nav = ''
			let url_first

			docs.forEach(function(_doc){
				let _class = []
				if( _doc['class-nav'] )
					_class.push( _doc['class-nav'] )
				switch( _doc.type ){
					case 'guide':
						if( !url_first )
							url_first = _doc['path'].replace(/index\.html$/gi, '')
						html_nav+= '<a href="'
								+ _doc['path'].replace(/index\.html$/gi, '')
								+ '"'
								+ (_class.length ? ' class="' + _class.join(' ') + '"' : '')
								+ '><span>'
								+ _doc['title']
								+ '</span></a>'
						break;
					
					case 'title':
						html_nav+= '<h2>' + _doc['title'] + '</h2>'
						break;
					
					case 'text':
						html_nav+= '<span>' + _doc['title'] + '</span>'
						break;
				}
			})
			
			html = html.replace('[[[[!!NAV!!]]]]', html_nav)
					.replace('[[[[!!TITLE!!]]]]', '')
					.replace('<title> - ', '<title>')
					.replace('[[[[!!MAIN!!]]]]', `<script type="text/javascript">
	window.location.assign("${url_first}");
</script>`)
			node.fs.writeFile(node.path.join( dest, 'index.html' ),
				html,
				function(err){
					if(err){
						deferred.reject(err)
					}else{
						deferred.resolve(docs)
					}
				}
			)
			return deferred.promise
		})

	// 处理模板文件
		.then(function(docs){
			console.log(docs, template)
			
			let deferred = Q.defer()
				//,html_radios = ''
				//,html_nav = ''
				//,html_main = ''
				//,markdown = node.require( "markdown" ).markdown
				,marked = node.require( "marked" )
				,has_default = false
				,searchRes
				,scrapePtrn
				,count_parsed = 0
			
			/*
			docs.forEach(function(doc, i){
				switch( doc.type ){
					case 'guide':
						html_radios+= '<input type="radio" class="none" name="maintab" value="content-'
									+ doc['name']
									+ '" id="maintab-content-'
									+ doc['name']
									+ '"'
									+ (!has_default ? ' checked' : '')
									+' />'
					
						html_nav+= '<a href="'
								+ doc['path'].replace(/index\.html$/gi, '')
								+ '"'
								+ (doc['class-nav'] ? ' class="' + doc['class-nav'] + '"' : '')
								+ '>'
								+ doc['title']
								+ '</a>'
						
						html_main+= '<section id="content-'
									+ doc['name']
									+ '" class="main'
									+ (doc['class-main'] ? ' ' + doc['class-main'] : '')
									+ '">'
									+ markdown.toHTML( doc['content'], 'Maruku' )
									+ '</section>'
						has_default = true
						break;
					
					case 'title':
						html_nav+= '<h2>' + doc['title'] + '</h2>'
						break;
					
					case 'text':
						html_nav+= '<span>' + doc['title'] + '</span>'
						break;
				}
			})
			*/
			
			docs.forEach(function(doc, i){
					let html = template
						,dest_file
						,dest_folder
						,html_nav = ''
						,html_main = ''

					switch( doc.type ){
						case 'guide':
							dest_file = node.path.join( dest, '/' + doc['path'] )
							dest_folder = node.path.dirname(dest_file)
							
							node.mkdirp.sync( dest_folder )
							
							docs.forEach(function(_doc){
								let _class = []
								if( _doc['class-nav'] )
									_class.push( _doc['class-nav'] )
								if( _doc['name'] == doc['name'] )
									_class.push( 'cur' )
								switch( _doc.type ){
									case 'guide':
										html_nav+= '<a href="'
												+ _doc['path'].replace(/index\.html$/gi, '')
												+ '"'
												+ (_class.length ? ' class="' + _class.join(' ') + '"' : '')
												+ '><span>'
												+ _doc['title']
												+ '</span></a>'
										break;
									
									case 'title':
										html_nav+= '<h2>' + _doc['title'] + '</h2>'
										break;
									
									case 'text':
										html_nav+= '<span>' + _doc['title'] + '</span>'
										break;
								}
							})
							
							html_main = '<section id="content-'
											+ doc['name']
											+ '" class="main'
											+ (doc['class-main'] ? ' ' + doc['class-main'] : '')
											+ '">'
											//+ markdown.toHTML( filter(doc['content']), 'Maruku' )
											+ marked( filter(doc['content']) )
							
							if( doc['has-comment'] ){
								let comment_id = doc['name']
									,comment_title = doc['title-html'] || doc['title']
									,comment_url = 'http://kancolle.diablohu.com' + doc['path'].replace(/index\.html$/gi, '')
								html_main+= `<!-- 多说评论框 start -->
	<h3>评论</h3>
	<div class="ds-thread" data-thread-key="${comment_id}" data-title="${comment_title}" data-url="${comment_url}"></div>
<!-- 多说评论框 end -->
<!-- 多说公共JS代码 start (一个网页只需插入一次) -->
<script type="text/javascript">
var duoshuoQuery = {short_name:"diablohu-kancolle"};
	(function() {
		var ds = document.createElement('script');
		ds.type = 'text/javascript';ds.async = true;
		ds.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + '//static.duoshuo.com/embed.js';
		ds.charset = 'UTF-8';
		(document.getElementsByTagName('head')[0] 
		 || document.getElementsByTagName('body')[0]).appendChild(ds);
	})();
	</script>
<!-- 多说公共JS代码 end -->`
							}
							
							html+= '</section>'
							
							html = html.replace('[[[[!!TITLE!!]]]]', doc['title-html'] || doc['title'])
										.replace('[[[[!!NAV!!]]]]', html_nav)
										.replace('[[[[!!MAIN!!]]]]', html_main)
				
							searchRes = null
							scrapePtrn = /\[\[\[([^\]\[]+)\]\]\]/gi
							while( (searchRes = scrapePtrn.exec(html)) !== null ){
								try{
									html = html.replace( searchRes[0], '<span class="highlight">' + searchRes[1] + '</span>' )
								}catch(e){}
							}
						
							searchRes = null
							scrapePtrn = /\[\[node\:([a-z]+)[\:]*([^\]\[\:]*)\]\]/gi
							while( (searchRes = scrapePtrn.exec(html)) !== null ){
								try{
									let node = searchRes[1].toUpperCase()
										,t = searchRes[2].toLowerCase()
										,h = '<span class="node'
									
									if( t )
										h+= ' node-' + t
									
									if( node == 'BOSS' ){
										html = html.replace( searchRes[0],
											h+= ' node-boss">Boss</span>'
										)
									}else{
										html = html.replace( searchRes[0],
											h+= '">' + node + '</span>'
										)
									}
								}catch(e){}
							}
						
							searchRes = null
							scrapePtrn = /\[\[video\:([^\]\[]+)\:([^\]\[]+)\]\]/gi
							while( (searchRes = scrapePtrn.exec(html)) !== null ){
								try{
									let site = searchRes[1].toLowerCase()
										,id = searchRes[2]
									switch(site){
										case 'acfun':
											html = html.replace( searchRes[0],
`<div class="videoplayer videoplayer-acfun">
	<div class="videoplayer-body">
		<iframe src="https://ssl.acfun.tv/block-player-homura.html#vid=${id};from=http://www.acfun.tv" id="ACFlashPlayer-re" frameborder="0"></iframe>
	</div>
</div>`
											/*
												'<div class="videoplayer videoplayer-acfun"><div class="videoplayer-body">'
												+ '<iframe'
												+ ' src="https://ssl.acfun.tv/block-player-homura.html#vid=' + id + ';from=http://www.acfun.tv"'
												+ ' id="ACFlashPlayer-re" frameborder="0"></iframe>'
												+ '</div></div>'
											*/
											)
											break;
										case 'ac':
											html = html.replace( searchRes[0],
`<div class="videoplayer videoplayer-acfun">
	<div class="videoplayer-body">
		<iframe src="http://cdn.aixifan.com/player/ACFlashPlayer.out.swf?type=page&url=http://www.acfun.tv/v/ac${id}" id="ACFlashPlayer-re" frameborder="0"></iframe>
	</div>
</div>`
											/*
												'<div class="videoplayer videoplayer-acfun"><div class="videoplayer-body">'
												+ '<iframe'
												+ ' src="https://ssl.acfun.tv/block-player-homura.html#vid=' + id + ';from=http://www.acfun.tv"'
												+ ' id="ACFlashPlayer-re" frameborder="0"></iframe>'
												+ '</div></div>'
											*/
											)
											break;
									}
								}catch(e){}
							}
						
							searchRes = null
							scrapePtrn = /\[\[video\:([^\]\[]+)\:([^\]\[]+):([^\]\[]+)\]\]/gi
							while( (searchRes = scrapePtrn.exec(html)) !== null ){
								try{
									let site = searchRes[1].toLowerCase()
										,id = searchRes[2]
										,thumbnail = searchRes[3]
										,url = 'javascript:;'
										,cont
									switch(site){
										case 'acfun':
											cont = `<iframe src="https://ssl.acfun.tv/block-player-homura.html#vid=${id};from=http://www.acfun.tv" id="ACFlashPlayer-re" frameborder="0"></iframe>`
											break;
										case 'ac':
											cont = `<iframe src="http://cdn.aixifan.com/player/ACFlashPlayer.out.swf?type=page&url=http://www.acfun.tv/v/ac${id}" id="ACFlashPlayer-re" frameborder="0"></iframe>`
											break;
									}
									html = html.replace( searchRes[0],
`<div class="videoplayer mod-thumbnail videoplayer-${site}">
	<div class="videoplayer-body">
		<a href="${url}" class="thumbnail"><img src="${thumbnail}"/></a>
		<textarea>${cont}</textarea>
	</div>
</div>`)
								}catch(e){}
							}

							searchRes = null
							scrapePtrn = /\[\[([^A-Z^\]\[]+)([A-Z])([^A-Z^\]\[]+)\]\]/gi
							while( (searchRes = scrapePtrn.exec(html)) !== null ){
								if( searchRes.length > 2 && searchRes[2].length == 1 ){
									let to = searchRes[2]
									switch(searchRes[2]){
										case 'I': to = 'Ｉ'; break;
									}
									html = html.replace( searchRes[0], '[[' + searchRes[1] + to + searchRes[3] + ']]')
								}
							}
						
							searchRes = null
							scrapePtrn = /\[\[([^\]\[]+)\]\]/gi
							while( (searchRes = scrapePtrn.exec(html)) !== null ){
								try{
									let origin = searchRes[1].toLowerCase()
										,matched = _g.index.ships[origin]
									
									if( matched && matched.length ){
										matched = matched[matched.length - 1]
										html = html.replace( searchRes[0],
											`<a href="http://fleet.diablohu.com/ships/${matched.id}">${matched.name.zh_cn}</a>`
										)
									}else if( matched = _g.index.equipments[origin] ){
										matched = matched[matched.length - 1]
										html = html.replace( searchRes[0],
											`<a href="http://fleet.diablohu.com/equipments/${matched.id}">${matched.name.zh_cn}</a>`
										)
									}else{
										origin = origin.toUpperCase()
										if( origin.indexOf('姬') > -1 || (origin.indexOf('鬼') > -1 && origin.indexOf('鬼群') <= -1) ){
											html = html.replace( searchRes[0],
												'<span class="enemy enemy-boss">' + origin + '</span>'
											)
										}else if( origin.indexOf('改FLAGSHIP') > -1 ){
											html = html.replace( searchRes[0],
												'<span class="enemy enemy-kaiflagship">' + origin.replace(/改FLAGSHIP/gi, '<em>改Flagship</em>') + '</span>'
											)
										}else if( origin.indexOf('后期型FLAGSHIP') > -1 ){
											html = html.replace( searchRes[0],
												'<span class="enemy enemy-kaiflagship">' + origin.replace(/后期型FLAGSHIP/gi, '<em>后期型Flagship</em>') + '</span>'
											)
										}else if( origin.indexOf('FLAGSHIP') > -1 ){
											html = html.replace( searchRes[0],
												'<span class="enemy enemy-flagship">' + origin.replace(/FLAGSHIP/gi, '<em>Flagship</em>') + '</span>'
											)
										}else if( origin.indexOf('后期型ELITE') > -1 ){
											html = html.replace( searchRes[0],
												'<span class="enemy enemy-elite">' + origin.replace(/后期型ELITE/gi, '<em>后期型Elite</em>') + '</span>'
											)
										}else if( origin.indexOf('ELITE') > -1 ){
											html = html.replace( searchRes[0],
												'<span class="enemy enemy-elite">' + origin.replace(/ELITE/gi, '<em>Elite</em>') + '</span>'
											)
										}else if( origin.indexOf('后期型') > -1 ){
											html = html.replace( searchRes[0],
												'<span class="enemy">' + origin.replace(/后期型/gi, '<em>后期型</em>') + '</span>'
											)
										}else if( origin.indexOf('级') > -1 ){
											html = html.replace( searchRes[0],
												'<span class="enemy">' + origin + '</span>'
											)
										}else if( origin.indexOf('鬼群') > -1 ){
											html = html.replace( searchRes[0],
												'<span class="enemy">' + origin + '</span>'
											)
										}
									}
								}catch(e){}
							}
						
							console.log(html)
							
							node.fs.writeFile(dest_file, html, function(err){
								if(err){
									deferred.reject(err)
								}
								count_parsed++
								if( count_parsed >= docs.length )
									deferred.resolve()
							})
							break;
							
						default:
							count_parsed++
							if( count_parsed >= docs.length )
								deferred.resolve()
							break;
					}
			})
			
			return deferred.promise
		})

	// 完成
		.catch(function(e){
			console.log(e)
		})
		.done(function(){
			console.log('DONE!')
			_frame.app_main.page['guide'].section['输出'].dom.log
				.append(
					$('<p>DONE!</p>')
				)
		})
}
// 
_frame.app_main.page['exillust'] = {
    section: {}
};

(() => {
    const exillust = _frame.app_main.page['exillust']
    const sections = exillust.section

    exillust.init = page => {
        page.find('section').on({
            'tabview-show': function () {
                const $section = $(this)
                const name = $section.data('tabname')

                if (!sections[name])
                    sections[name] = {}

                var _o = sections[name]

                if (!_o.is_init && _o.init) {
                    _o.init($section)
                    _o.is_init = true
                }
            }
        })
    }

    sections['类型'] = {
        init: $section => {
            app.addTemplate('./templates/exillust/types.html')
                .appendTo($section)
        }
    }

    sections['图鉴'] = {
        init: $section => {
            app.addTemplate('./templates/exillust/illusts.html')
                .appendTo($section)
        }
    }
})();

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
_comp.selector_equipment = function (name, id, default_item) {
    var dom = _frame.app_main.page['ships'].gen_input(
        'select',
        name || null,
        id || null,
        []
    )
        , equipments = []
        , options = []

    let promise = Q.fcall(() => {
        let deferred = Q.defer()
        _db.item_types.find({}).sort({ 'id': 1 }).exec(function (err, docs) {
            if (!err && docs && docs.length) {
                for (var i in docs) {
                    equipments[docs[i]['id']] = [
                        docs[i]['name']['zh_cn'],
                        []
                    ]
                }
                _db.items.find({}).sort({ 'type': 1, 'rarity': 1, 'id': 1 }).exec(function (err, docs) {
                    for (let i in docs) {
                        //equipments[docs[i]['type']][1].push(docs[i])
                        equipments[docs[i]['type']][1].push({
                            'name': docs[i]['name']['zh_cn'],
                            'value': docs[i]['id']
                        })
                    }

                    for (let i in equipments) {
                        options.push({
                            'name': '=====' + equipments[i][0] + '=====',
                            'value': ''
                        })
                        for (let j in equipments[i][1]) {
                            options.push({
                                'name': equipments[i][1][j]['name']['zh_cn'],
                                'value': equipments[i][1][j]['id']
                            })
                        }
                    }
                    //console.log( equipments )
                    //console.log( options )

                    let domNew = _frame.app_main.page['ships'].gen_input(
                        'select_group',
                        dom.attr('name'),
                        dom.attr('id'),
                        equipments,
                        {
                            'default': default_item
                        }).insertBefore(dom)
                    dom.remove()

                    dom = domNew

                    deferred.resolve()
                })
            }
        })
        return deferred.promise
    })

        .then(() => {
            let deferred = Q.defer()
            _db.consumables.find({
                name: {
                    $exists: true
                }
            }).sort({ 'id': 1 }).exec((err, docs) => {
                let group = $(`<optgroup label="道具 / 消耗品">`).appendTo(dom)
                for (let i in docs) {
                    if (!docs[i].name.ja_jp)
                        continue;
                    let item = new ItemBase(docs[i]);
                    let value = `consumable_${item.id}`;
                    $(`<option/>`,{
                        value: value,
                        html: `[${item.id}] ${item._name}`
                    }).prop('selected', value == default_item).appendTo(group)
                }
                deferred.resolve()
            })
            return deferred.promise
        })

        .catch((err) => {
            console.log(err)
        })

    return dom
}

_comp.selector_ship = function (name, id, default_item) {
    var dom = _frame.app_main.page['ships'].gen_input(
        'select',
        name || null,
        id || null,
        []
    )
        , ships = []

    _db.ships.find({}).sort({ 'type': 1, 'class': 1, 'class_no': 1, 'time_created': 1, 'name.suffix': 1 }).exec(function (err, docs) {
        if (!err && !_g.data.ship_id_by_type.length) {
            for (var i in docs) {
                _g.data.ships[docs[i]['id']] = docs[i]

                if (typeof _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]] == 'undefined')
                    _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]] = []
                _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]].push(docs[i]['id'])
            }
        }

        for (var i in _g.data.ship_id_by_type) {
            if (typeof _g.ship_type_order[i] == 'object') {
                var data_shiptype = _g.data.ship_types[_g.ship_type_order[i][0]]
            } else {
                var data_shiptype = _g.data.ship_types[_g.ship_type_order[i]]
            }

            ships[i] = [
                _g.ship_type_order_name[i]['zh_cn'] + ' [' + data_shiptype['code'] + ']',
                []
            ]

            for (var j in _g.data.ship_id_by_type[i]) {
                var d = _g.data.ships[_g.data.ship_id_by_type[i][j]]
                ships[i][1].push({
                    'name': (d['name']['zh_cn'] || d['name']['ja_jp'])
                        + (d['name']['suffix']
                            ? '・' + _g.data.ship_namesuffix[d['name']['suffix']]['zh_cn']
                            : ''),
                    'value': _g.data.ship_id_by_type[i][j]
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

_comp.selector_ship_class = (selectName, selectId, defaultClassId) => {
    const elTemp = _frame.app_main.page['ships'].gen_input(
        'select',
        selectName || null,
        selectId || null,
        []
    )
    const shipTypes = {}
    const optGroups = []

    new Promise((resolve, reject) => {
        // 读取/缓存**舰种**数据
        _db.ship_types
            .find({})
            .exec((err, docs) => {
                if (err) return reject(err)
                if (!Array.isArray(docs)) return reject(docs)
                docs.forEach(doc => {
                    shipTypes[doc.id] = doc
                })
                resolve()
            })
    }).then(() => new Promise((resolve, reject) => {
        // 确定舰种的顺序
        const parseTypes = (types, arr) => {
            if (!Array.isArray(types)) return
            if (!Array.isArray(arr)) return
            types.forEach(type => {
                if (Array.isArray(type))
                    return parseTypes(type, arr)
                arr.push(type)
            })
        }
        _db.ship_type_collections
            .find({})
            .sort({
                id: 1
            })
            .exec((err, docs) => {
                if (err) return reject(err)
                if (!Array.isArray(docs)) return reject(docs)
                docs.forEach(doc => {
                    const types = []
                    parseTypes(doc.types, types)
                    // console.log(doc)
                    // console.log(types)
                    types.forEach(typeId => {
                        const index = optGroups.length
                        shipTypes[typeId].index = index
                        // optGroups.push({
                        //     type: typeId,
                        //     classes: []
                        // })
                        optGroups.push([
                            shipTypes[typeId].name.zh_cn,
                            []
                        ])
                    })
                    resolve()
                })
            })
    })).then(() => new Promise((resolve, reject) => {
        _db.ship_classes
            .find({})
            .sort({
                // ship_type_id: 1,
                id: 1
            })
            .exec((err, docs) => {
                if (err) return reject(err)
                if (!Array.isArray(docs)) return reject(docs)
                docs.forEach(doc => {
                    // console.log(doc)
                    const typeId = doc.ship_type_id
                    const typeIndex = shipTypes[typeId].index
                    // console.log(
                    //     typeId,
                    //     shipTypes[typeId].name.zh_cn,
                    //     typeIndex,
                    //     optGroups[typeIndex]
                    // )
                    if (typeof typeIndex === 'undefined')
                        return
                    optGroups[typeIndex][1].push({
                        'name': `[${doc.id}] ${doc.name.zh_cn}`,
                        'value': doc.id
                    })
                })
                resolve()
            })
    })).then(() => {
        console.log(optGroups)
        _frame.app_main.page['ships'].gen_input(
            'select_group',
            elTemp.attr('name') || null,
            elTemp.attr('id') || null,
            optGroups,
            {
                'default': defaultClassId || null
            }).insertBefore(elTemp)
        elTemp.remove()
    })

    return elTemp
}
/*
 */
_p.el.shiplist = {
    init_el: function (el) {
        if (el.data('shiplist'))
            return true

        el.data({
            'shiplist': new _shiplist(el)
        })
    },

    init: function (tar, els) {
        tar = tar || $('body');
        els = els || tar.find('section.shiplist')

        els.each(function () {
            _p.el.shiplist.init_el($(this))
        })
    }
}






var _shiplist = function (section, options) {
    this.dom = {
        'section': section
    }

    this.columns = [
        '  ',
        ['火力', 'fire'],
        ['雷装', 'torpedo'],
        ['对空', 'aa'],
        ['对潜', 'asw'],
        ['耐久', 'hp'],
        ['装甲', 'armor'],
        ['回避', 'evasion'],
        ['搭载', 'carry'],
        ['航速', 'speed'],
        ['射程', 'range'],
        ['索敌', 'los'],
        ['运', 'luck'],
        ['油耗', 'consum_fuel'],
        ['弹耗', 'consum_ammo']
    ]

    this.init();
}

_shiplist.prototype.append_ship = function (ship_data) {
    var self = this
        , tr = $('<tr data-shipid="' + ship_data['id'] + '" data-shipedit="' + (self.dom.section.hasClass('shiplist-edit')) + '"/>')
            .appendTo(this.dom.tbody)
        , max_carry = 0
        , name = ship_data['name']['zh_cn']
            + (ship_data['name']['suffix']
                ? '<small>' + _g.data.ship_namesuffix[ship_data['name']['suffix']]['zh_cn'] + '</small>'
                : '')

    function getNavy() {
        if (ship_data.navy) return ship_data.navy
        return ship_data.class
            ? (_g.data.ship_classes[ship_data.class].navy || 'ijn')
            : 'ijn'
    }
    var navy = getNavy()

    if (navy) {
        name += '<span class="flag-navy" data-navy="' + navy + '"></span>'
    }

    for (var i in ship_data['carry']) {
        max_carry += ship_data['carry'][i]
    }

    function _val(val) {
        if (val == 0 || val == '0')
            return '<small class="zero">-</small>'
        return val
    }

    for (var i in self.columns) {
        switch (self.columns[i][1]) {
            case ' ':
                $('<th/>')
                    .html(
                    '<img src="../pics/ships/' + ship_data['id'] + '/0.png"/>'
                    + '<strong>' + name + '</strong>'
                    //+ '<small>' + ship_data['pron'] + '</small>'
                    ).appendTo(tr)
                break;
            case 'fire':
                $('<td class="stat-fire"/>').html(_val(ship_data['stat']['fire_max'])).appendTo(tr)
                break;
            case 'torpedo':
                $('<td class="stat-torpedo"/>').html(_val(ship_data['stat']['torpedo_max'])).appendTo(tr)
                break;
            case 'aa':
                $('<td class="stat-aa"/>').html(_val(ship_data['stat']['aa_max'])).appendTo(tr)
                break;
            case 'asw':
                $('<td class="stat-asw"/>').html(_val(ship_data['stat']['asw_max'])).appendTo(tr)
                break;
            case 'hp':
                $('<td class="stat-hp"/>').html(_val(ship_data['stat']['hp'])).appendTo(tr)
                break;
            case 'armor':
                $('<td class="stat-armor"/>').html(_val(ship_data['stat']['armor_max'])).appendTo(tr)
                break;
            case 'evasion':
                $('<td class="stat-evasion"/>').html(_val(ship_data['stat']['evasion_max'])).appendTo(tr)
                break;
            case 'carry':
                $('<td class="stat-carry"/>').html(_val(ship_data['stat']['carry'])).appendTo(tr)
                break;
            case 'speed':
                $('<td class="stat-speed"/>').html(_g.getStatSpeed(ship_data['stat']['speed'])).appendTo(tr)
                break;
            case 'range':
                $('<td class="stat-range"/>').html(_g.getStatRange(ship_data['stat']['range'])).appendTo(tr)
                break;
            case 'los':
                $('<td class="stat-los"/>').html(_val(ship_data['stat']['los_max'])).appendTo(tr)
                //$('<td class="stat-los"/>').html(ship_data['stat']['los'] + '<sup>' + ship_data['stat']['los_max'] + '</sup>').appendTo(tr)
                break;
            case 'luck':
                $('<td class="stat-luck"/>').html(ship_data['stat']['luck'] + '<sup>' + ship_data['stat']['luck_max'] + '</sup>').appendTo(tr)
                break;
            case 'consum_fuel':
                $('<td class="stat-consum_fuel"/>').html(ship_data['consum']['fuel']).appendTo(tr)
                break;
            case 'consum_ammo':
                $('<td class="stat-consum_ammo"/>').html(ship_data['consum']['ammo']).appendTo(tr)
                break;
        }
    }

    // 检查数据是否存在 remodel_next
    // 如果 remodel_next 与当前数据 type & name 相同，标记当前为可改造前版本
    if (ship_data.remodel_next
        && _g.data.ships[ship_data.remodel_next]
        && _g.ship_type_order_map[ship_data['type']] == _g.ship_type_order_map[_g.data.ships[ship_data.remodel_next]['type']]
        && ship_data['name']['ja_jp'] == _g.data.ships[ship_data.remodel_next]['name']['ja_jp']
    ) {
        tr.addClass('premodeled')
    }

    return tr
}

_shiplist.prototype.append_ship_all = function () {
    var self = this
    for (var i in _g.data.ship_id_by_type) {
        if (typeof _g.ship_type_order[i] == 'object') {
            var data_shiptype = _g.data.ship_types[_g.ship_type_order[i][0]]
        } else {
            var data_shiptype = _g.data.ship_types[_g.ship_type_order[i]]
        }
        $('<tr class="typetitle"><th colspan="' + (self.columns.length + 1) + '">'
            //+ data_shiptype.name.zh_cn
            + _g.ship_type_order_name[i]['zh_cn']
            + '<small>[' + data_shiptype['code'] + ']</small>'
            + '</th></tr>')
            .appendTo(this.dom.tbody)

        for (var j in _g.data.ship_id_by_type[i]) {
            self.append_ship(_g.data.ships[_g.data.ship_id_by_type[i][j]])
        }

        var k = 0
        while (k < 9) {
            $('<tr class="empty"/>').appendTo(this.dom.tbody)
            k++
        }
    }
}

_shiplist.prototype.append_option = function (type, name, label, value, suffix, options) {
    options = options || {}
    function gen_input() {
        switch (type) {
            case 'text':
            case 'number':
            case 'hidden':
                var input = $('<input type="' + type + '" name="' + name + '" id="' + id + '" />').val(value)
                break;
            case 'select':
                var input = $('<select name="' + name + '" id="' + id + '" />')
                var option_empty = $('<option value=""/>').html('').appendTo(input)
                for (var i in value) {
                    if (typeof value[i] == 'object') {
                        var o_el = $('<option value="' + (typeof value[i].val == 'undefined' ? value[i]['value'] : value[i].val) + '"/>')
                            .html(value[i]['title'] || value[i]['name'])
                            .appendTo(input)
                    } else {
                        var o_el = $('<option value="' + value[i] + '"/>')
                            .html(value[i])
                            .appendTo(input)
                    }
                    if (typeof options['default'] != 'undefined' && o_el.val() == options['default']) {
                        o_el.prop('selected', true)
                    }
                }
                if (!value || !value.length) {
                    option_empty.remove()
                    $('<option value=""/>').html('...').appendTo(input)
                }
                if (options['new']) {
                    $('<option value=""/>').html('==========').insertAfter(option_empty)
                    $('<option value="___new___"/>').html('+ 新建').insertAfter(option_empty)
                    input.on('change.___new___', function () {
                        var select = $(this)
                        if (select.val() == '___new___') {
                            select.val('')
                            options['new'](input)
                        }
                    })
                }
                break;
            case 'checkbox':
                var input = $('<input type="' + type + '" name="' + name + '" id="' + id + '" />').prop('checked', value)
                break;
            case 'radio':
                var input = $();
                for (var i in value) {
                    var title, val
                        , checked = false
                    if (value[i].push) {
                        val = value[i][0]
                        title = value[i][1]
                    } else {
                        val = value[i].val || value[i].value
                        title = value[i].title || value[i].name
                    }
                    if (options.radio_default && options.radio_default == val)
                        checked = true
                    input = input.add(
                        $('<input type="radio" name="' + name + '" id="' + id + '-' + val + '" ischecked="' + checked + '" />')
                            .val(val)
                            .prop('checked', (checked || (!checked && i == 0)))
                    )
                    input = input.add($('<label for="' + id + '-' + val + '"/>').html(title))
                }
                break;
        }

        if (options.required) {
            input.prop('required', true)
        }

        if (options.onchange) {
            input.on('change.___onchange___', function (e) {
                options.onchange(e, $(this))
            })
            if (options['default'])
                input.trigger('change')
        }

        if (!name)
            input.attr('name', null)

        return input
    }

    var line = $('<p/>').appendTo(this.dom.filter)
        , id = '_input_g' + _g.inputIndex

        , label = label ? $('<label for="' + id + '"/>').html(label).appendTo(line) : null
        , input = gen_input().appendTo(line)

    if (type == 'checkbox' && label)
        label.insertAfter(input)

    if (suffix)
        $('<label for="' + id + '"/>').html(suffix).appendTo(line)

    _g.inputIndex++
    return line
}

_shiplist.prototype.init = function () {
    if (this.is_init)
        return true

    var self = this

    // 生成过滤器与选项
    this.dom.filter_container = $('<div class="filter"/>').appendTo(this.dom.section)
    this.dom.filter = $('<div/>').appendTo(this.dom.filter_container)

    // 初始化设置
    this.append_option('checkbox', 'hide-premodel', '仅显示同名、同种舰最终版本',
        _config.get('shiplist-filter-hide-premodel') === 'false' ? null : true, null, {
            'onchange': function (e, input) {
                _config.set('shiplist-filter-hide-premodel', input.prop('checked'))
                self.dom.filter_container.attr('filter-hide-premodel', input.prop('checked'))
            }
        })
    this.append_option('radio', 'viewtype', null, [
        ['list', '列表'],
        ['card', '卡片']
    ], null, {
            'radio_default': _config.get('shiplist-viewtype'),
            'onchange': function (e, input) {
                if (input.is(':checked')) {
                    _config.set('shiplist-viewtype', input.val())
                    self.dom.filter_container.attr('viewtype', input.val())
                }
            }
        })
    this.dom.filter.find('input').trigger('change')

    // 生成表格框架
    this.dom.table_container = $('<div class="fixed-table-container"/>').appendTo(this.dom.section)
    this.dom.table_container_inner = $('<div class="fixed-table-container-inner"/>').appendTo(this.dom.table_container)
    this.dom.table = $('<table class="ships hashover hashover-column"/>').appendTo(this.dom.table_container_inner)
    function gen_thead(arr) {
        var thead = $('<thead/>')
            , tr = $('<tr/>').appendTo(thead)
        for (var i in arr) {
            if (typeof arr[i] == 'object') {
                $('<td class="stat-' + arr[i][1] + '"/>').html('<div class="th-inner">' + arr[i][0] + '</div>').appendTo(tr)
            } else {
                $('<th/>').html('<div class="th-inner">' + arr[i] + '</div>').appendTo(tr)
            }
        }
        return thead
    }
    gen_thead(self.columns).appendTo(this.dom.table)
    this.dom.tbody = $('<tbody/>').appendTo(this.dom.table)

    // 获取所有舰娘数据，按舰种顺序 (_g.ship_type_order / _g.ship_type_order_map) 排序
    // -> 获取舰种名称
    // -> 生成舰娘DOM
    _db.ships.find({}).sort({ 'type': 1, 'class': 1, 'class_no': 1, 'time_created': 1, 'name.suffix': 1 }).exec(function (err, docs) {
        if (!err && !_g.data.ship_id_by_type.length) {
            for (var i in docs) {
                _g.data.ships[docs[i]['id']] = docs[i]

                if (typeof _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]] == 'undefined')
                    _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]] = []
                _g.data.ship_id_by_type[_g.ship_type_order_map[docs[i]['type']]].push(docs[i]['id'])
            }
        }

        _db.ship_types.find({}, function (err2, docs2) {
            if (!err2) {
                for (var i in docs2) {
                    _g.data.ship_types[docs2[i]['id']] = docs2[i]
                }

                if (docs && docs.length) {
                    self.append_ship_all()
                } else {
                    $('<p/>').html('暂无数据...').appendTo(self.dom.table_container_inner)
                }
            }
        })
    })

    this.is_init = true
}

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